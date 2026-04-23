import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'CANCELLED'
  | 'OVERDUE';

export type PaymentMethod =
  | 'CASH'
  | 'CREDIT_CARD'
  | 'INSURANCE'
  | 'BANK_TRANSFER';

export type InvoiceItemCategory =
  | 'CONSULTATION'
  | 'LAB_TEST'
  | 'MEDICATION'
  | 'PROCEDURE';

export interface InvoiceItem {
  id: string;
  description: string;
  category: InvoiceItemCategory;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoicePayment {
  id: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  paidAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  appointmentId: string | null;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  patient?: {
    id: string;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  };
  issuedAt: string | null;
  dueDate: string | null;
  createdAt: string;
}

interface UseInvoicesParams {
  page?: number;
  limit?: number;
  status?: string;
  patientId?: string;
  search?: string;
}

interface CreateInvoicePayload {
  patientId: string;
  appointmentId?: string;
  items: {
    description: string;
    category: InvoiceItemCategory;
    quantity: number;
    unitPrice: number;
  }[];
  tax?: number;
  discount?: number;
}

interface AddInvoiceItemPayload {
  invoiceId: string;
  data: {
    description: string;
    category: InvoiceItemCategory;
    quantity: number;
    unitPrice: number;
  };
}

interface RecordPaymentPayload {
  invoiceId: string;
  data: {
    amount: number;
    method: PaymentMethod;
    reference?: string;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildQueryString(
  params: Record<string, string | number | undefined>
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useInvoices(params: UseInvoicesParams = {}) {
  const { page = 1, limit = 10, status, patientId, search } = params;

  return useQuery<PaginatedResponse<Invoice>>({
    queryKey: ['invoices', { page, limit, status, patientId, search }],
    queryFn: () =>
      api.get<PaginatedResponse<Invoice>>(
        `/v1/invoices${buildQueryString({
          page,
          limit,
          status: status || undefined,
          patientId: patientId || undefined,
          search: search || undefined,
        })}`
      ),
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery<Invoice>({
    queryKey: ['invoices', id],
    queryFn: () => api.get<Invoice>(`/v1/invoices/${id}`),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation<Invoice, Error, CreateInvoicePayload>({
    mutationFn: (payload) =>
      api.post<Invoice>('/v1/invoices', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useAddInvoiceItem() {
  const queryClient = useQueryClient();

  return useMutation<Invoice, Error, AddInvoiceItemPayload>({
    mutationFn: ({ invoiceId, data }) =>
      api.patch<Invoice>(`/v1/invoices/${invoiceId}/items`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation<InvoicePayment, Error, RecordPaymentPayload>({
    mutationFn: ({ invoiceId, data }) =>
      api.post<InvoicePayment>(
        `/v1/invoices/${invoiceId}/payments`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
