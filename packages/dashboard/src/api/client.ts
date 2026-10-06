import { Flag, Environment, AuditLog, User, Experiment, ExperimentResultsData, AIConfig } from '../types';

const viteEnv = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env;
const API_BASE = viteEnv?.VITE_API_URL
  ? `${viteEnv.VITE_API_URL}/api`
  : '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('darkdeploy_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }

    const data = await res.json();
    localStorage.setItem('darkdeploy_token', data.token);
    localStorage.setItem('darkdeploy_user', JSON.stringify(data.user));
    return data;
  },

  logout() {
    localStorage.removeItem('darkdeploy_token');
    localStorage.removeItem('darkdeploy_user');
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem('darkdeploy_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async getEnvironments(): Promise<Environment[]> {
    const res = await fetch(`${API_BASE}/environments`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch environments');
    const data = await res.json();
    return data.environments;
  },

  async getFlags(environmentId: string): Promise<Flag[]> {
    const res = await fetch(`${API_BASE}/flags?environmentId=${environmentId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch flags');
    const data = await res.json();
    return data.flags;
  },

  async createFlag(data: {
    key: string;
    name: string;
    description?: string;
    environmentId: string;
    defaultValue?: boolean;
    rolloutPercentage?: number;
    type?: 'BOOLEAN' | 'MULTIVARIATE' | 'AI_CONFIG';
    aiConfig?: AIConfig | null;
  }): Promise<Flag> {
    const res = await fetch(`${API_BASE}/flags`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create flag');
    }
    const result = await res.json();
    return result.flag;
  },

  async updateFlag(
    id: string,
    updates: Partial<{
      enabled: boolean;
      rolloutPercentage: number;
      defaultValue: boolean;
      name: string;
      description: string | null;
      type: 'BOOLEAN' | 'MULTIVARIATE' | 'AI_CONFIG';
      aiConfig: AIConfig | null;
      rules: any[];
    }>
  ): Promise<Flag> {
    const res = await fetch(`${API_BASE}/flags/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update flag');
    const data = await res.json();
    return data.flag;
  },

  async deleteFlag(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/flags/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete flag');
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    const data = await res.json();
    return data.auditLogs;
  },

  async getExperiments(environmentId: string): Promise<Experiment[]> {
    const res = await fetch(`${API_BASE}/experiments?environmentId=${environmentId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch experiments');
    const data = await res.json();
    return data.experiments;
  },

  async createExperiment(data: {
    key: string;
    name: string;
    description?: string;
    environmentId: string;
    variants: any[];
  }): Promise<Experiment> {
    const res = await fetch(`${API_BASE}/experiments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create experiment');
    }
    const result = await res.json();
    return result.experiment;
  },

  async updateExperiment(
    id: string,
    updates: Partial<{
      enabled: boolean;
      name: string;
      description: string | null;
      variants: any[];
    }>
  ): Promise<Experiment> {
    const res = await fetch(`${API_BASE}/experiments/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update experiment');
    const data = await res.json();
    return data.experiment;
  },

  async deleteExperiment(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/experiments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete experiment');
  },

  async getExperimentResults(id: string): Promise<ExperimentResultsData> {
    const res = await fetch(`${API_BASE}/experiments/${id}/results`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch experiment results');
    return res.json();
  },

  async trackEvent(data: {
    experimentKey: string;
    contextId: string;
    variantKey: string;
    type: 'EXPOSURE' | 'CONVERSION';
    value?: number;
    environmentId: string;
  }): Promise<void> {
    const res = await fetch(`${API_BASE}/experiments/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to track event');
  },
};
