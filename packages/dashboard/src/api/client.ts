import { Flag, Environment, AuditLog, User } from '../types';

const API_BASE = '/api';

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
};
