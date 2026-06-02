import api from './client';

export interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
  active: boolean;
}

export const achievementService = {
  getAchievements() {
    return api.get<{ data: Achievement[]; message: string }>('/achievements');
  },

  selectAchievement(achievementId: number) {
    return api.put(`/achievements/${achievementId}/select`);
  },

  clearActiveAchievement() {
    return api.delete('/achievements/active');
  },
};
