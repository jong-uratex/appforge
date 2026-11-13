import {
  ActivityItem,
  AppRequest,
  Department,
  ProjectTask,
  ProjectWorkflow,
  UserPersona,
  UserRole,
} from '../types/appforge';

export interface D1HealthStatus {
  connected: boolean;
  schemaReady: boolean;
  engine?: string;
  tables?: Record<string, number>;
  error?: string;
  checkedAt?: string;
}

export interface D1AnalyticsReport {
  summary: {
    totalRequests?: number;
    totalTasks?: number;
    completedTasks?: number;
    totalUsers?: number;
    totalWorkflows?: number;
    totalActivities?: number;
    totalEvents?: number;
    totalEffortDays?: number;
    totalHoursSavedPerWeek?: number;
  };
  departmentAnalytics: Array<{
    department: string;
    total_initiatives: number;
    in_development: number;
    in_testing: number;
    in_production: number;
    total_effort_days: number;
    total_weekly_hours_saved: number;
  }>;
  userWorkloadAnalytics: Array<{
    user_id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    total_tasks: number;
    completed_tasks: number;
    total_estimated_hours: number;
    total_logged_hours: number;
  }>;
  dailySnapshots: Array<{
    snapshot_date: string;
    total_requests: number;
    in_dev_requests: number;
    in_production_requests: number;
    total_tasks: number;
    completed_tasks: number;
    total_effort_days: number;
    total_hours_saved_weekly: number;
    gate_compliance_pct: number;
    active_users_count: number;
  }>;
  recentEvents: Array<{
    id: string;
    event_type: string;
    user_id: string | null;
    department: string | null;
    entity_type: string | null;
    entity_id: string | null;
    metric_value: number;
    created_at: string;
  }>;
}

const SESSION_TOKEN_KEY = 'URATEX_MIS_D1_SESSION_TOKEN_V2';

async function safeJsonFetch<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null; // Local Vite SPA fallback (no Cloudflare Pages Function mounted)
    }
    const data = (await res.json()) as T;
    return data;
  } catch {
    return null;
  }
}

export const d1Client = {
  getSessionToken(): string | null {
    try {
      return localStorage.getItem(SESSION_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setSessionToken(token: string | null) {
    try {
      if (token) {
        localStorage.setItem(SESSION_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(SESSION_TOKEN_KEY);
      }
    } catch {}
  },

  async checkHealth(): Promise<D1HealthStatus> {
    const data = await safeJsonFetch<{
      success?: boolean;
      connected?: boolean;
      schemaReady?: boolean;
      engine?: string;
      tables?: Record<string, number>;
      error?: string;
      checkedAt?: string;
    }>('/api/health');

    if (!data) {
      return {
        connected: false,
        schemaReady: false,
        error: 'Cloudflare Pages Functions runtime not active in local preview. Using browser cache until deployed to Cloudflare.',
      };
    }

    return {
      connected: Boolean(data.connected),
      schemaReady: Boolean(data.schemaReady),
      engine: data.engine,
      tables: data.tables,
      error: data.error,
      checkedAt: data.checkedAt,
    };
  },

  async bootstrap() {
    return safeJsonFetch<{
      success: boolean;
      connected: boolean;
      seeded: boolean;
      users: UserPersona[];
      workflows: ProjectWorkflow[];
      requests: AppRequest[];
      tasks: ProjectTask[];
      activities: ActivityItem[];
      analytics?: { totalEvents: number; dailySnapshots: unknown[] };
    }>('/api/bootstrap');
  },

  async pushAllToD1(payload: {
    users: UserPersona[];
    workflows: ProjectWorkflow[];
    requests: AppRequest[];
    tasks: ProjectTask[];
    activities: ActivityItem[];
  }) {
    return safeJsonFetch<{ success: boolean; synced?: Record<string, number>; error?: string }>(
      '/api/bootstrap',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async login(email: string, password?: string) {
    return safeJsonFetch<{
      success: boolean;
      user?: UserPersona;
      sessionToken?: string;
      error?: string;
    }>('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', email, password }),
    });
  },

  async register(data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    department: Department;
    title: string;
  }) {
    return safeJsonFetch<{
      success: boolean;
      user?: UserPersona;
      sessionToken?: string;
      error?: string;
    }>('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'register', ...data }),
    });
  },

  async verifySession(token: string) {
    return safeJsonFetch<{
      success: boolean;
      valid?: boolean;
      user?: UserPersona;
    }>('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'verify', token }),
    });
  },

  async updateProfile(data: {
    userId: string;
    name: string;
    department: Department;
    title: string;
    avatar?: string;
    role?: UserRole;
  }) {
    const token = this.getSessionToken();
    return safeJsonFetch<{
      success: boolean;
      user?: UserPersona;
      error?: string;
    }>('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'update_profile', token, ...data }),
    });
  },

  async changePassword(data: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }) {
    const token = this.getSessionToken();
    return safeJsonFetch<{
      success: boolean;
      error?: string;
    }>('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'change_password', token, ...data }),
    });
  },

  async logout() {
    const token = this.getSessionToken();
    this.setSessionToken(null);
    if (!token) return null;
    return safeJsonFetch<{ success: boolean }>('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'logout', token }),
    });
  },

  async upsertRequest(request: AppRequest, actor?: UserPersona) {
    return safeJsonFetch<{ success: boolean }>('/api/requests', {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        actorId: actor?.id,
        actorRole: actor?.role,
      }),
    });
  },

  async deleteRequest(id: string) {
    return safeJsonFetch<{ success: boolean }>(`/api/requests?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async upsertTask(task: ProjectTask) {
    return safeJsonFetch<{ success: boolean }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  async deleteTask(id: string) {
    return safeJsonFetch<{ success: boolean }>(`/api/tasks?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async upsertWorkflow(workflow: ProjectWorkflow) {
    return safeJsonFetch<{ success: boolean }>('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  },

  async deleteWorkflow(id: string) {
    return safeJsonFetch<{ success: boolean }>(`/api/workflows?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async logEventOrActivity(payload: {
    eventType?: string;
    userId?: string;
    userRole?: string;
    department?: string;
    entityType?: string;
    entityId?: string;
    metricValue?: number;
    metadata?: Record<string, unknown>;
    activity?: ActivityItem;
  }) {
    return safeJsonFetch<{ success: boolean }>('/api/analytics', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async fetchAnalytics(): Promise<D1AnalyticsReport | null> {
    const res = await safeJsonFetch<{ success: boolean } & D1AnalyticsReport>('/api/analytics');
    if (!res || !res.success) return null;
    return res;
  },
};
