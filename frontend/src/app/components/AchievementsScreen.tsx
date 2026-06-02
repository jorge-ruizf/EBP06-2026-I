import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Lock, Star, Trophy, X } from 'lucide-react';
import { SidebarLayout } from './SidebarLayout';
import { achievementService, Achievement } from '../api/achievementService';

interface AchievementsScreenProps {
  onNavigate: (page: 'home' | 'budgets' | 'incomes' | 'expenses' | 'reports' | 'achievements') => void;
  onProfileClick: () => void;
}

const achievementIcons: Record<string, typeof Trophy> = {
  PREMIUM_ADULT: Trophy,
  PRO_SAVER: Star,
  SURVIVAL_MODE: BadgeCheck,
  UNCONTROLLED_SPENDING: Trophy,
};

export function AchievementsScreen({ onNavigate, onProfileClick }: AchievementsScreenProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const activeAchievement = useMemo(
    () => achievements.find((achievement) => achievement.active),
    [achievements]
  );

  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;

  const loadAchievements = async () => {
    setError('');
    try {
      const response = await achievementService.getAchievements();
      setAchievements(response.data.data);
    } catch (e: any) {
      setError(e.response?.data?.error || e.response?.data?.message || 'No se pudieron cargar los logros');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const handleSelect = async (achievement: Achievement) => {
    setActionId(achievement.id);
    setMessage('');
    setError('');

    try {
      await achievementService.selectAchievement(achievement.id);
      setMessage('Título activo actualizado');
      await loadAchievements();
    } catch (e: any) {
      setError(e.response?.data?.error || e.response?.data?.message || 'No se pudo seleccionar el logro');
    } finally {
      setActionId(null);
    }
  };

  const handleClear = async () => {
    if (!activeAchievement) return;
    setActionId(activeAchievement.id);
    setMessage('');
    setError('');

    try {
      await achievementService.clearActiveAchievement();
      setMessage('Título activo eliminado');
      await loadAchievements();
    } catch (e: any) {
      setError(e.response?.data?.error || e.response?.data?.message || 'No se pudo quitar el título activo');
    } finally {
      setActionId(null);
    }
  };

  return (
    <SidebarLayout currentPage="achievements" onNavigate={onNavigate} onProfileClick={onProfileClick}>
      <div className="flex-1 p-4 pt-8 md:p-6 xl:p-8 pb-24 xl:pb-8 bg-[#F7F5F0]">
        <div className="w-full max-w-md md:max-w-3xl xl:max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-[#3D2C8D] text-[30px]">Logros</h1>
              <p className="text-[#7B6FA0] text-sm md:text-base">{unlockedCount} de {achievements.length || 4} desbloqueados</p>
            </div>
            <div className="inline-flex items-center gap-2 bg-[#4c1d95] text-white px-4 py-3 rounded-xl min-h-[44px]">
              <Trophy className="w-5 h-5 text-[#FFD200]" />
              <span className="text-sm md:text-base">{activeAchievement ? activeAchievement.name : 'Sin título activo'}</span>
            </div>
          </div>

          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 text-sm font-medium">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#D8D0F0] p-6 md:p-8">
              <p className="text-slate-500">Cargando logros...</p>
            </div>
          )}

          {!isLoading && achievements.length === 0 && !error && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#D8D0F0] p-6 md:p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#EEEDFE] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-[#534AB7]" />
                </div>
                <h2 className="text-[#26215C] text-[20px] mb-2">No hay logros disponibles</h2>
                <p className="text-[#7B6FA0] text-[16px]">El catálogo todavía no está cargado.</p>
              </div>
            </div>
          )}

          {!isLoading && achievements.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {achievements.map((achievement) => {
                const Icon = achievementIcons[achievement.code] || Trophy;
                const isBusy = actionId === achievement.id;

                return (
                  <div
                    key={achievement.id}
                    className={`bg-white rounded-2xl shadow-sm border p-5 transition-shadow ${
                      achievement.active
                        ? 'border-[#FFD200] shadow-md'
                        : achievement.unlocked
                        ? 'border-[#D8D0F0]'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 min-w-[48px] rounded-xl flex items-center justify-center ${
                        achievement.unlocked ? 'bg-[#FFD200] text-black' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {achievement.unlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h2 className="text-slate-900 font-medium text-[18px]">{achievement.name}</h2>
                          <span className={`text-xs px-2 py-1 rounded-lg flex-shrink-0 ${
                            achievement.active
                              ? 'bg-[#FFD200] text-black'
                              : achievement.unlocked
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {achievement.active ? 'Título activo' : achievement.unlocked ? 'Desbloqueado' : 'Bloqueado'}
                          </span>
                        </div>

                        <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4">
                          {achievement.description}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-2">
                          {!achievement.unlocked && (
                            <button
                              type="button"
                              disabled
                              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 text-slate-400 min-h-[44px] cursor-not-allowed"
                            >
                              <Lock className="w-4 h-4" />
                              Bloqueado
                            </button>
                          )}

                          {achievement.unlocked && !achievement.active && (
                            <button
                              type="button"
                              onClick={() => handleSelect(achievement)}
                              disabled={isBusy}
                              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0D0D0D] text-white min-h-[44px] hover:shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                              <Star className="w-4 h-4" />
                              {isBusy ? 'Actualizando...' : 'Usar como título'}
                            </button>
                          )}

                          {achievement.active && (
                            <button
                              type="button"
                              onClick={handleClear}
                              disabled={isBusy}
                              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 min-h-[44px] hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                              {isBusy ? 'Actualizando...' : 'Quitar título'}
                            </button>
                          )}
                        </div>
                      </div>
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
