import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally before importing api
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Import after mocking
const { api } = await import('./api');

describe('API wrapper', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should send credentials: include on all requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    });

    await api.get('/v1/test');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, options] = mockFetch.mock.calls[0];
    expect(options.credentials).toBe('include');
  });

  it('should NOT send Authorization header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await api.get('/v1/test');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
    expect(options.headers.authorization).toBeUndefined();
  });

  it('should include Content-Type: application/json', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await api.post('/v1/test', { foo: 'bar' });

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('should throw ApiError on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ message: 'Not found' }),
    });

    await expect(api.get('/v1/missing')).rejects.toThrow('Not found');
  });

  it('should attempt refresh on 401 and retry', async () => {
    // First call: 401
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    });
    // Refresh call: success
    mockFetch.mockResolvedValueOnce({ ok: true });
    // Retry: success
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ retried: true }),
    });

    const result = await api.get('/v1/protected');

    expect(result).toEqual({ retried: true });
    expect(mockFetch).toHaveBeenCalledTimes(3);
    // Second call should be refresh
    expect(mockFetch.mock.calls[1][0]).toContain('/auth/refresh');
  });

  it('should NOT attempt refresh on auth endpoints', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Invalid credentials' }),
    });

    await expect(api.post('/v1/auth/login', {})).rejects.toThrow('Invalid credentials');
    // Only 1 call — no refresh attempt
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
