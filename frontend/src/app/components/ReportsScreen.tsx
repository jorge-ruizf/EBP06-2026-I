import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { BarChart2, CalendarDays, Download, FileText, TrendingDown, TrendingUp, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SidebarLayout } from './SidebarLayout';
import { useAuth } from '../contexts/AuthContext';
import { reportService, ReportType, TransactionReport } from '../api/reportService';

interface ReportsScreenProps {
  onNavigate: (page: 'home' | 'budgets' | 'incomes' | 'expenses' | 'reports' | 'achievements') => void;
  onProfileClick: () => void;
}

interface ReportHistory {
  id: string;
  name: string;
  generatedAt: string;
  type: ReportType;
  startDate: string;
  endDate: string;
}

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

const typeLabel: Record<ReportType, string> = {
  ALL: 'General',
  INCOME: 'Ingresos',
  EXPENSE: 'Gastos',
};

const typeIcon: Record<ReportType, typeof BarChart2> = {
  ALL: BarChart2,
  INCOME: TrendingUp,
  EXPENSE: TrendingDown,
};

const toNumber = (value: number | string | null | undefined) => Number(value ?? 0);

const formatMoney = (value: number | string | null | undefined, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(toNumber(value));

export function ReportsScreen({ onNavigate, onProfileClick }: ReportsScreenProps) {
  const { user } = useAuth();
  const [reportType, setReportType] = useState<ReportType>('ALL');
  const [startDate, setStartDate] = useState(toInputDate(firstDayOfMonth));
  const [endDate, setEndDate] = useState(toInputDate(today));
  const [report, setReport] = useState<TransactionReport | null>(null);
  const [history, setHistory] = useState<ReportHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const historyKey = user?.id ? `report_history_${user.id}` : 'report_history_guest';
  const currency = report?.currency || user?.currency || 'COP';
  const transactions = useMemo(() => report?.transactions || [], [report]);

  useEffect(() => {
    const stored = localStorage.getItem(historyKey);
    setHistory(stored ? JSON.parse(stored) : []);
  }, [historyKey]);

  const persistHistory = (entries: ReportHistory[]) => {
    setHistory(entries);
    localStorage.setItem(historyKey, JSON.stringify(entries));
  };

  const loadReport = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await reportService.getTransactionReport(reportType, startDate, endDate);
      setReport(response.data);
    } catch (e: any) {
      setReport(null);
      setError(e.response?.data?.error || e.response?.data?.message || 'No se pudo generar el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loadReport();
  };

  const downloadPdf = async (type: ReportType, from: string, to: string) => {
    const response = await reportService.getTransactionReportPdf(type, from, to);
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-${type.toLowerCase()}-${from}-${to}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async (entry?: ReportHistory) => {
    const type = entry?.type || reportType;
    const from = entry?.startDate || startDate;
    const to = entry?.endDate || endDate;

    setIsDownloading(true);
    setError('');
    setSuccess('');

    try {
      await downloadPdf(type, from, to);
      const name = `Reporte ${typeLabel[type]} ${from} - ${to}`;
      const newEntry: ReportHistory = {
        id: `${Date.now()}-${type}`,
        name,
        generatedAt: new Date().toLocaleString('es-CO'),
        type,
        startDate: from,
        endDate: to,
      };
      persistHistory([newEntry, ...history.filter((item) => item.name !== name)].slice(0, 10));
      setSuccess('PDF generado correctamente');
    } catch (e: any) {
      setError(e.response?.data?.error || e.response?.data?.message || 'No se pudo descargar el PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const deleteHistory = (id: string) => {
    persistHistory(history.filter((entry) => entry.id !== id));
  };

  const clearFilters = () => {
    setReportType('ALL');
    setStartDate(toInputDate(firstDayOfMonth));
    setEndDate(toInputDate(today));
  };

  const recordCount = transactions.length;
  const cardBase = 'bg-white rounded-2xl shadow-sm border border-[#D8D0F0] p-5 md:p-6';

  return (
    <SidebarLayout currentPage="reports" onNavigate={onNavigate} onProfileClick={onProfileClick}>
      <div className="flex-1 p-4 pt-8 md:p-6 xl:p-8 pb-28 xl:pb-8 bg-[#F7F5F0]">
        <div className="w-full max-w-md md:max-w-3xl xl:max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-[#3D2C8D] text-[30px]">Generación de Reportes</h1>
            <p className="mt-1 text-[#314158]">Genera reportes financieros en formato PDF</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-5">
              <form onSubmit={handleSubmit} className={cardBase}>
                <h2 className="text-[#3D2C8D] mb-5 text-[19px]">Filtros de reporte</h2>

                <div className="mb-5">
                  <label className="block text-slate-700 mb-2 text-[15px]">Tipo de reporte</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['EXPENSE', 'INCOME', 'ALL'] as ReportType[]).map((type) => {
                      const Icon = typeIcon[type];
                      const activeColors = type === 'EXPENSE'
                        ? 'border-[#F87171] bg-[#FEE2E2] text-[#F87171]'
                        : type === 'INCOME'
                        ? 'border-[#28AF5A] bg-[#E9FFF4] text-[#28AF5A]'
                        : 'border-[#3D2C8D] bg-[#EEEDFE] text-[#3D2C8D]';

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setReportType(type)}
                          className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all min-h-[72px] ${
                            reportType === type
                              ? activeColors
                              : 'border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{typeLabel[type]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label htmlFor="report-start-date" className="block text-slate-700 mb-2 text-[15px]">Fecha inicio</label>
                    <input
                      id="report-start-date"
                      type="date"
                      value={startDate}
                      max={endDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label htmlFor="report-end-date" className="block text-slate-700 mb-2 text-[15px]">Fecha fin</label>
                    <input
                      id="report-end-date"
                      type="date"
                      value={endDate}
                      min={startDate}
                      max={toInputDate(today)}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 bg-[#4c1d95] text-white hover:bg-[#3D2C8D] active:scale-[0.98] transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    <BarChart2 className="w-4 h-4" />
                    {isLoading ? 'Generando...' : 'Ver reporte'}
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-6 py-3 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl transition-colors min-h-[44px]"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </form>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-700 text-sm font-medium">{success}</p>
                </div>
              )}

              {isLoading && (
                <div className={cardBase}>
                  <p className="text-slate-500">Generando reporte...</p>
                </div>
              )}

              {!isLoading && report && (
                <>
                  <div className="bg-[#4c1d95] rounded-2xl shadow-lg p-6 md:p-8 text-white">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                      <div>
                        <p className="text-white/70 mb-1 text-[15px]">
                          {typeLabel[reportType]} · {report.startDate} a {report.endDate}
                        </p>
                        <h2 className="font-semibold text-[36px]">
                          {formatMoney(reportType === 'ALL' ? report.balance : report.total, currency)}
                        </h2>
                      </div>
                      <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                        <CalendarDays className="w-5 h-5 text-[#FFD200]" />
                        <span className="text-sm">{recordCount} registros</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-green-300" />
                          <p className="text-white/70 text-[15px]">Total ingresos</p>
                        </div>
                        <p className="font-semibold text-[26px]">{formatMoney(report.totalIncome, currency)}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="w-5 h-5 text-red-300" />
                          <p className="text-white/70 text-[15px]">Total gastos</p>
                        </div>
                        <p className="font-semibold text-[26px]">{formatMoney(report.totalExpense, currency)}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart2 className="w-5 h-5 text-[#FFD200]" />
                          <p className="text-white/70 text-[15px]">Balance</p>
                        </div>
                        <p className="font-semibold text-[26px]">{formatMoney(report.balance, currency)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf()}
                      disabled={isDownloading}
                      className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 bg-[#0D0D0D] text-white border-2 border-[#3D2C8D] hover:shadow-md active:scale-[0.98] transition-all disabled:opacity-50 min-h-[44px]"
                    >
                      <Download className="w-4 h-4" />
                      {isDownloading ? 'Generando...' : 'Generar PDF'}
                    </button>
                  </div>

                  <div className={cardBase}>
                    <h2 className="text-[#3D2C8D] text-[20px] mb-4">Detalle de transacciones</h2>
                    {recordCount === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-[#EEEDFE] rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-[#534AB7]" />
                        </div>
                        <p className="text-slate-500 text-[16px]">No hay transacciones para este periodo</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {transactions.map((transaction) => {
                          const isIncome = transaction.type === 'INCOME';
                          return (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                  {isIncome ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-slate-900 text-[15px] truncate">
                                    {transaction.description || 'Sin descripción'}
                                  </p>
                                  <p className="text-slate-500 text-[13px]">
                                    {transaction.date ? format(new Date(transaction.date), 'dd MMM yyyy', { locale: es }) : 'Sin fecha'} · {isIncome ? 'Ingreso' : 'Gasto'}
                                  </p>
                                </div>
                              </div>
                              <p className={`font-medium text-[16px] flex-shrink-0 ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                                {isIncome ? '+' : '-'}{formatMoney(transaction.amount, currency)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="xl:col-span-1">
              <div className={cardBase}>
                <h2 className="text-[#3D2C8D] text-[18px] mb-5">Historial reciente</h2>
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-[#EEEDFE] rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-[#534AB7]" />
                    </div>
                    <p className="text-slate-500 text-sm">No hay reportes generados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((entry) => (
                      <div key={entry.id} className="border border-slate-100 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm text-slate-800 font-medium leading-tight">{entry.name}</p>
                          <button
                            type="button"
                            onClick={() => deleteHistory(entry.id)}
                            className="p-1 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            aria-label="Eliminar reporte del historial"
                          >
                            <X className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{entry.generatedAt}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-0.5 rounded-md ${
                            entry.type === 'EXPENSE' ? 'bg-[#F87171] text-white' :
                            entry.type === 'INCOME' ? 'bg-[#28AF5A] text-white' :
                            'bg-[#EEEDFE] text-[#3D2C8D]'
                          }`}>
                            {typeLabel[entry.type]}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(entry)}
                            className="flex items-center gap-1 text-xs text-[#3D2C8D] hover:underline"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Descargar PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
