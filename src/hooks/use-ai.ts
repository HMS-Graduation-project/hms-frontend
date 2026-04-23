import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Hardcoded common symptoms list
export const SYMPTOMS_LIST = [
  'Fever',
  'Cough',
  'Headache',
  'Fatigue',
  'Nausea',
  'Vomiting',
  'Diarrhea',
  'Shortness of breath',
  'Chest pain',
  'Abdominal pain',
  'Back pain',
  'Joint pain',
  'Muscle pain',
  'Sore throat',
  'Runny nose',
  'Nasal congestion',
  'Sneezing',
  'Dizziness',
  'Blurred vision',
  'Rash',
  'Itching',
  'Swelling',
  'Weight loss',
  'Weight gain',
  'Loss of appetite',
  'Constipation',
  'Frequent urination',
  'Blood in urine',
  'Insomnia',
  'Anxiety',
  'Depression',
  'Numbness',
  'Tingling',
  'Chills',
  'Night sweats',
  'Palpitations',
  'Dry mouth',
  'Excessive thirst',
  'Bruising',
  'Bleeding gums',
];

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
