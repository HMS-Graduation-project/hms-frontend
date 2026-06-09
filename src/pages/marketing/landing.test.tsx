import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/lib/i18n';
import { AuthProvider } from '@/providers/auth-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import LandingPage from './landing';

beforeAll(async () => {
  // jsdom is missing the browser APIs the marketing page touches on mount.
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => store.set(k, String(v)),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  });
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })),
  );
  // AuthProvider probes /v1/me on mount — treat the visitor as unauthenticated.
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));
  await i18n.changeLanguage('en');
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('LandingPage', () => {
  it('renders the marketing hero, brand and navigation', async () => {
    render(
      <HelmetProvider>
        <ThemeProvider>
          <MemoryRouter>
            <AuthProvider>
              <LandingPage />
            </AuthProvider>
          </MemoryRouter>
        </ThemeProvider>
      </HelmetProvider>,
    );

    // Hero headline
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
    // Brand wordmark appears (nav + footer)
    expect(screen.getAllByText(/SNH Platform/i).length).toBeGreaterThan(0);
    // A login affordance is present for unauthenticated visitors
    expect(screen.getAllByRole('link', { name: /login/i }).length).toBeGreaterThan(0);
  });
});
