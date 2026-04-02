import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Onboarding } from './components/Onboarding';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Budget } from './components/Budget';
import { Income } from './components/Income';
import { DashboardHome } from './components/DashboardHome';
import { BudgetsScreen } from './components/BudgetsScreen';
import { IncomesScreen } from './components/IncomesScreen';

type AppView = 'onboarding' | 'login' | 'register' | 'dashboard-home' | 'budgets' | 'incomes' | 'create-budget' | 'create-income';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [refreshKey, setRefreshKey] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-500">Cargando...</div>
      </div>
    );
  }

  if (showOnboarding && !user) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  if (!user) {
    return currentView === 'login' ? (
      <Login onSwitchToRegister={() => setCurrentView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setCurrentView('login')} />
    );
  }

  // User is authenticated - show app views
  switch (currentView) {
    case 'create-budget':
      return <Budget onBack={() => {
        setRefreshKey(prev => prev + 1);
        setCurrentView('budgets');
      }} />;
    
    case 'create-income':
      return <Income onBack={() => {
        setRefreshKey(prev => prev + 1);
        setCurrentView('incomes');
      }} />;
    
    case 'budgets':
      return (
        <BudgetsScreen
          key={`budgets-${refreshKey}`}
          onNavigate={(page) => setCurrentView(page === 'home' ? 'dashboard-home' : page)}
          onCreateBudget={() => setCurrentView('create-budget')}
        />
      );
    
    case 'incomes':
      return (
        <IncomesScreen
          key={`incomes-${refreshKey}`}
          onNavigate={(page) => setCurrentView(page === 'home' ? 'dashboard-home' : page)}
          onCreateIncome={() => setCurrentView('create-income')}
        />
      );
    
    case 'dashboard-home':
    default:
      return (
        <DashboardHome
          onNavigate={(page) => setCurrentView(page === 'home' ? 'dashboard-home' : page)}
          onCreateBudget={() => setCurrentView('create-budget')}
          onCreateIncome={() => setCurrentView('create-income')}
        />
      );
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}