import { useMutation } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

async function uploadFile<T>(endpoint: string, file: File): Promise<T> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export interface PneumoniaPrediction {
  prediction: string;
  probability: number;
  confidence: number;
  threshold: number;
  isPositive: boolean;
  modelVersion: string;
  device: string;
  clinicalNote: string;
}

export interface PneumoniaExplanation extends PneumoniaPrediction {
  explainability: {
    type: string;
    overlayImageBase64: string;
    heatmapImageBase64: string;
    clinicalNote: string;
  };
}

export function usePneumoniaPredict() {
  return useMutation<PneumoniaPrediction, Error, File>({
    mutationFn: (file) =>
      uploadFile<PneumoniaPrediction>('/v1/ai/pneumonia/predict', file),
  });
}

export function usePneumoniaExplain() {
  return useMutation<PneumoniaExplanation, Error, File>({
    mutationFn: (file) =>
      uploadFile<PneumoniaExplanation>('/v1/ai/pneumonia/explain', file),
  });
}
