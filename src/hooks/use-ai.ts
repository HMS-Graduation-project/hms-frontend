import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Hardcoded common medications list
export const MEDICATIONS_LIST = [
  'Aspirin',
  'Ibuprofen',
  'Acetaminophen',
  'Amoxicillin',
  'Metformin',
  'Lisinopril',
  'Atorvastatin',
  'Omeprazole',
  'Amlodipine',
  'Metoprolol',
  'Losartan',
  'Simvastatin',
  'Warfarin',
  'Clopidogrel',
  'Diazepam',
  'Sertraline',
  'Fluoxetine',
  'Ciprofloxacin',
  'Azithromycin',
  'Prednisone',
  'Levothyroxine',
  'Hydrochlorothiazide',
  'Gabapentin',
  'Tramadol',
  'Insulin',
  'Albuterol',
  'Montelukast',
  'Cetirizine',
  'Loratadine',
  'Pantoprazole',
];

/** A symptom from the AI catalog: canonical id + human-readable label. */
export interface SymptomCatalogItem {
  id: string;
  label: string;
}

interface SymptomsCatalogResponse {
  symptoms: SymptomCatalogItem[];
  total: number;
}

export interface PredictionResult {
  disease: string;
  confidence: number;
  description?: string;
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  description: string;
}

interface PredictDiseaseResponse {
  predictions: PredictionResult[];
}

interface CheckInteractionsResponse {
  interactions: DrugInteraction[];
}

/** Loads the canonical symptom catalog (id + label) from the AI service. */
export function useSymptomCatalog() {
  return useQuery<SymptomsCatalogResponse>({
    queryKey: ['ai', 'symptoms'],
    queryFn: () => api.get<SymptomsCatalogResponse>('/v1/ai/symptoms'),
    staleTime: 60 * 60 * 1000, // catalog is effectively static
  });
}

export function usePredictDisease() {
  return useMutation<PredictDiseaseResponse, Error, { symptoms: string[] }>({
    mutationFn: (payload) =>
      api.post<PredictDiseaseResponse>('/v1/ai/predict-disease', payload),
  });
}

export function useCheckInteractions() {
  return useMutation<CheckInteractionsResponse, Error, { medications: string[] }>({
    mutationFn: (payload) =>
      api.post<CheckInteractionsResponse>('/v1/ai/drug-interactions', payload),
  });
}
