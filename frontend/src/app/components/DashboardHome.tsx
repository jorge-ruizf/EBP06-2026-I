import { FileText, DollarSign, ArrowRight } from 'lucide-react';
import { SidebarLayout } from './SidebarLayout';

interface DashboardHomeProps {
  onNavigate: (page: 'home' | 'budgets' | 'incomes') => void;
  onCreateBudget: () => void;
  onCreateIncome: () => void;
}

export function DashboardHome({ onNavigate, onCreateBudget, onCreateIncome }: DashboardHomeProps) {
  return (
    <SidebarLayout currentPage="home" onNavigate={onNavigate}>
      <div className="flex-1 p-4 pt-8 md:p-6 xl:p-8 pb-24 xl:pb-8 bg-[#F7F5F0]">
        <div className="w-full max-w-md md:max-w-2xl xl:max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[#3D2C8D] mb-2">¿Por dónde empezamos?</h1>
            <p className="text-[#7B6FA0] text-sm md:text-base">Define tu presupuesto o registra lo que ya tienes</p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Define Budget Card */}
            <button
              onClick={onCreateBudget}
              className="bg-white rounded-2xl shadow-sm border border-[#D8D0F0] p-6 text-left hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-purple-600" strokeWidth={2} />
              </div>
              <h3 className="text-slate-900 mb-2">Definir presupuesto</h3>
              <p className="text-sm text-[#7B6FA0] mb-4 leading-relaxed">
                Establece límites de gasto mensuales por categoría
              </p>
              <div className="flex items-center gap-2 text-[#3D2C8D] group-hover:gap-3 transition-all">
                <span className="text-sm font-medium">Crear presupuesto</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            {/* Register Income Card */}
            <button
              onClick={onCreateIncome}
              className="bg-white rounded-2xl shadow-sm border border-[#D8D0F0] p-6 text-left hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-green-600" strokeWidth={2} />
              </div>
              <h3 className="text-slate-900 mb-2">Registrar ingreso</h3>
              <p className="text-sm text-[#7B6FA0] mb-4 leading-relaxed">
                Mantén un registro de todos tus ingresos
              </p>
              <div className="flex items-center gap-2 text-[#0F6E56] group-hover:gap-3 transition-all">
                <span className="text-sm font-medium">Registrar ingreso</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}