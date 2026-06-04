import { authFetch } from './auth-fetch';
import type { DashboardData } from './types';

export function getDashboard(token: string): Promise<DashboardData> {
  return authFetch<DashboardData>('/dashboard', { token });
}
