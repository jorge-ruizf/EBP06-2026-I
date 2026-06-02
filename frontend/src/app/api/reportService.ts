import api from './client';

export type ReportType = 'ALL' | 'INCOME' | 'EXPENSE';

export interface ReportTransaction {
  id: number;
  amount: number | string;
  description: string | null;
  type: string;
  categoryId: number | null;
  userId: number | null;
  date: string | null;
}

export interface TransactionReport {
  type: string;
  startDate: string;
  endDate: string;
  total: number | string;
  transactions: ReportTransaction[];
  message: string | null;
  fullName: string | null;
  currency: string | null;
  totalIncome: number | string;
  totalExpense: number | string;
  balance: number | string;
}

export const reportService = {
  getTransactionReport(type: ReportType, startDate: string, endDate: string) {
    return api.get<TransactionReport>('/reports/transactions', {
      params: { type, startDate, endDate },
    });
  },

  getTransactionReportPdf(type: ReportType, startDate: string, endDate: string) {
    return api.get<Blob>('/reports/transactions/pdf', {
      params: { type, startDate, endDate },
      responseType: 'blob',
    });
  },
};
