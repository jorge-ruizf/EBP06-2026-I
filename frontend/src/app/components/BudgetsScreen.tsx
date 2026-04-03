import { Plus, UtensilsCrossed, Car, Sparkles, Home as HomeIcon, ShoppingBag, Heart, GraduationCap, Coffee, FileText } from 'lucide-react';
import { SidebarLayout } from './SidebarLayout';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

const categoryIcons = {
  'food': UtensilsCrossed,
  'transport': Car,
  'leisure': Sparkles,
  'home': HomeIcon,
  'shopping': ShoppingBag,
  'health': Heart,
  'education': GraduationCap,
  'other': Coffee,
};

const categoryColors = {
  'food': 'bg-orange-100 text-orange-600',
  'transport': 'bg-blue-100 text-blue-600',
  'leisure': 'bg-purple-100 text-purple-600',
  'home': 'bg-green-100 text-green-600',
  'shopping': 'bg-pink-100 text-pink-600',
  'health': 'bg-red-100 text-red-600',
  'education': 'bg-indigo-100 text-indigo-600',
  'other': 'bg-yellow-100 text-yellow-600',
};

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: string;
  month: number;
  userId: string;
}

interface BudgetsScreenProps {
  onNavigate: (page: 'home' | 'budgets' | 'incomes') => void;
  onCreateBudget: () => void;
}

export function BudgetsScreen({ onNavigate, onCreateBudget }: BudgetsScreenProps) {
  const { user, token } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) return setBudgets([]);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      try {
        const res = await fetch(`${API_URL}/api/budgets`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) throw new Error('Failed to fetch budgets');
        const data = await res.json();
        // Map data to UI shape. BudgetDto is { id, name, limitAmount }
        const mapped = (data || []).map((b: any) => ({
          id: String(b.id),
          categoryId: 'other',
          categoryName: b.name || 'Otros',
          amount: b.limitAmount ? String(b.limitAmount) : '0',
          month: new Date().getMonth(),
          userId: ''
        }));
        setBudgets(mapped);
      } catch (err) {
        // fallback to localStorage
        const allBudgets = JSON.parse(localStorage.getItem('budgets') || '[]');
        const userBudgets = allBudgets.filter((b: Budget) => String(b.userId) === String(user.id));
        setBudgets(userBudgets);
      }
    };
    load();
  }, [user, token]);

  return (
    <SidebarLayout currentPage="budgets" onNavigate={onNavigate}>
      <div className="flex-1 p-4 pt-8 md:p-6 xl:p-8 pb-24 xl:pb-8 bg-[#F7F5F0]">
        <div className="w-full max-w-md md:max-w-3xl xl:max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-[#3D2C8D]">Presupuestos</h1>
            <button
              onClick={onCreateBudget}
              className="bg-primary text-primary-foreground px-4 md:px-6 py-3 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center gap-2 min-h-[44px]"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden md:inline">Definir presupuesto</span>
              <span className="md:hidden">Crear</span>
            </button>
          </div>

          {/* Empty State */}
          {budgets.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#D8D0F0] p-6 md:p-8">
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#EEEDFE] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 md:w-10 md:h-10 text-[#534AB7]" />
                </div>
                <h2 className="text-[#26215C] text-lg md:text-xl mb-2">No tienes presupuestos aún</h2>
                <p className="text-[#7B6FA0] text-sm md:text-base leading-relaxed max-w-lg mx-auto">
                  Comienza a controlar tus gastos creando tu primer presupuesto mensual
                </p>
              </div>
            </div>
          )}

          {/* Budgets Grid */}
          {budgets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {budgets.map((budget) => {
                const Icon = categoryIcons[budget.categoryId as keyof typeof categoryIcons] || Coffee;
                const color = categoryColors[budget.categoryId as keyof typeof categoryColors] || 'bg-yellow-100 text-yellow-600';
                const amountNum = parseInt(budget.amount.replace(/[^\d]/g, ''));
                const spentAmount = 0; // No expenses registered yet
                const spentPercentage = 0; // 0% spent
                const availableAmount = amountNum; // Full amount available

                return (
                  <div
                    key={budget.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Header with Icon, Name and Status Badge */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`min-w-[44px] min-h-[44px] w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 font-medium truncate">{budget.categoryName}</p>
                        <p className="text-sm text-slate-500">{months[budget.month]}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 flex-shrink-0">
                        En control
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>Gastado: ${spentAmount.toLocaleString('es-ES')}</span>
                        <span>{spentPercentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all bg-green-500"
                          style={{ width: `${spentPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Available Amount */}
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-sm text-slate-600">
                        Disponible: <span className="font-semibold text-slate-900">${availableAmount.toLocaleString('es-ES')}</span> de ${amountNum.toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
