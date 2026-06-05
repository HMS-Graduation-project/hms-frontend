import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

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

async function uploadFileWithFields<T>(
  endpoint: string,
  file: File,
  fields: Record<string, string>,
): Promise<T> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

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

// ── Ensemble preview (runs 3 models, not persisted to DB) ───────────

export interface EnsembleModelResult {
  modelName: string;
  modelVersion: string;
  prediction: string;
  probability: number;
  confidence: number;
  threshold: number;
  isPositive: boolean;
  device: string;
}

export interface PneumoniaEnsembleResult {
  prediction: string;
  probability: number;
  confidence: number;
  threshold: number;
  isPositive: boolean;
  riskLevel: string;
  modelVersion: string;
  device: string;
  clinicalNote: string;
  ensemble: {
    method: string;
    weights: Record<string, number>;
    modelAgreement: string;
    agreementScore: number;
    models: EnsembleModelResult[];
  };
  explainability?: {
    type: string;
    sourceModel: string;
    overlayImageBase64: string;
    heatmapImageBase64: string;
    clinicalNote: string;
  };
}

export function usePneumoniaEnsemble() {
  return useMutation<PneumoniaEnsembleResult, Error, File>({
    mutationFn: (file) =>
      uploadFile<PneumoniaEnsembleResult>('/v1/ai/pneumonia/ensemble', file),
  });
}

// ── AI Analysis Records (persisted to DB with patient link) ─────────

export interface ModelResult {
  modelName: string;
  modelVersion: string;
  prediction: string;
  probability: number;
  confidence: number;
  threshold: number;
  isPositive: boolean;
  device: string;
}

export interface AiAnalysisRecord {
  id: string;
  hospitalId: string;
  patientProfileId: string;
  analysisType: string;
  prediction: string;
  probability: number;
  confidence: number;
  threshold: number;
  riskLevel: string;
  modelVersion: string;
  device: string;
  clinicalNote: string | null;
  originalImageUrl: string | null;
  heatmapImageUrl: string | null;
  overlayImageUrl: string | null;
  status: 'PENDING_REVIEW' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  doctorComment: string | null;
  requestedBy: { id: string; firstName: string | null; lastName: string | null; email: string };
  reviewedBy: { id: string; firstName: string | null; lastName: string | null; email: string } | null;
  reviewedAt: string | null;
  patientProfile: {
    id: string;
    nationalPatient: {
      id: string;
      firstName: string;
      lastName: string;
      syrianNationalId: string | null;
    };
  };
  // Ensemble fields
  analysisMode: string | null;
  ensembleMethod: string | null;
  modelAgreement: string | null;
  agreementScore: number | null;
  modelResultsJson: ModelResult[] | null;
  ensembleWeightsJson: Record<string, number> | null;
  createdAt: string;
}

interface AiAnalysesPaginated {
  data: AiAnalysisRecord[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface CreatePneumoniaAnalysisInput {
  file: File;
  patientProfileId: string;
  includeGradcam: boolean;
  analysisMode?: 'SINGLE_MODEL' | 'ENSEMBLE';
}

interface QueryAiAnalysesParams {
  patientProfileId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export function useCreatePneumoniaAnalysis() {
  const queryClient = useQueryClient();

  return useMutation<AiAnalysisRecord, Error, CreatePneumoniaAnalysisInput>({
    mutationFn: ({ file, patientProfileId, includeGradcam, analysisMode }) =>
      uploadFileWithFields<AiAnalysisRecord>('/v1/ai-analyses/pneumonia', file, {
        patientProfileId,
        includeGradcam: String(includeGradcam),
        analysisMode: analysisMode || 'SINGLE_MODEL',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-analyses'] });
    },
  });
}

export function useAiAnalyses(params: QueryAiAnalysesParams = {}) {
  const { page = 1, limit = 10, patientProfileId, status, fromDate, toDate } = params;
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));
  if (patientProfileId) searchParams.set('patientProfileId', patientProfileId);
  if (status) searchParams.set('status', status);
  if (fromDate) searchParams.set('fromDate', fromDate);
  if (toDate) searchParams.set('toDate', toDate);

  return useQuery<AiAnalysesPaginated>({
    queryKey: ['ai-analyses', { page, limit, patientProfileId, status, fromDate, toDate }],
    queryFn: () => api.get<AiAnalysesPaginated>(`/v1/ai-analyses?${searchParams.toString()}`),
  });
}

export function useAiAnalysis(id: string | undefined) {
  return useQuery<AiAnalysisRecord>({
    queryKey: ['ai-analyses', id],
    queryFn: () => api.get<AiAnalysisRecord>(`/v1/ai-analyses/${id}`),
    enabled: !!id,
  });
}

// ── AI Analytics ────────────────────────────────────────────────────

interface AiAnalyticsParams {
  fromDate?: string;
  toDate?: string;
  analysisMode?: string;
  status?: string;
  riskLevel?: string;
  prediction?: string;
}

export interface AiAnalyticsData {
  overview: {
    totalAnalyses: number;
    positiveResults: number;
    negativeResults: number;
    pendingReview: number;
    reviewed: number;
    approved: number;
    rejected: number;
    ensembleAnalyses: number;
    singleModelAnalyses: number;
  };
  usage: {
    dailyTrend: { date: string; count: number }[];
    averagePerDay: number;
  };
  distribution: {
    prediction: Record<string, number>;
    riskLevel: Record<string, number>;
    status: Record<string, number>;
    analysisMode: Record<string, number>;
  };
  clinicalPerformance: {
    reviewedRecords: number;
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
    sensitivityEstimate: number | null;
    specificityEstimate: number | null;
    precisionEstimate: number | null;
    accuracyEstimate: number | null;
  };
  modelPerformance: {
    modelName: string;
    totalRuns: number;
    positive: number;
    negative: number;
    averageProbability: number;
    averageConfidence: number;
    strongAgreement?: number;
    moderateAgreement?: number;
    lowAgreement?: number;
    averageAgreementScore?: number;
  }[];
}

export function useAiAnalytics(params: AiAnalyticsParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.fromDate) searchParams.set('fromDate', params.fromDate);
  if (params.toDate) searchParams.set('toDate', params.toDate);
  if (params.analysisMode) searchParams.set('analysisMode', params.analysisMode);
  if (params.status) searchParams.set('status', params.status);
  if (params.riskLevel) searchParams.set('riskLevel', params.riskLevel);
  if (params.prediction) searchParams.set('prediction', params.prediction);
  const qs = searchParams.toString();

  return useQuery<AiAnalyticsData>({
    queryKey: ['ai-analytics', params],
    queryFn: () => api.get<AiAnalyticsData>(`/v1/ai-analyses/analytics${qs ? `?${qs}` : ''}`),
  });
}

export function useReviewAiAnalysis() {
  const queryClient = useQueryClient();

  return useMutation<AiAnalysisRecord, Error, { id: string; status: string; doctorComment?: string }>({
    mutationFn: ({ id, ...body }) =>
      api.patch<AiAnalysisRecord>(`/v1/ai-analyses/${id}/review`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-analyses'] });
    },
  });
}
