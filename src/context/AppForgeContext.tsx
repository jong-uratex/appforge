import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  AppRequest,
  Department,
  ProjectTask,
  ProjectWorkflow,
  RequestType,
  RolePermissions,
  SDLCStageNumber,
  SystemStatus,
  TaskPriority,
  TaskStatus,
  UrgencyLevel,
  UserPersona,
  UserRole,
  WorkflowStage,
  ActivityItem,
  ActivityType,
  SCRFormData,
} from '../types/appforge';
import {
  INITIAL_REQUESTS,
  INITIAL_TASKS,
  INITIAL_WORKFLOWS,
  ROLE_PERMISSIONS,
  SDLC_STAGES_CONFIG,
  USER_PERSONAS,
  INITIAL_ACTIVITIES,
} from '../data/seedData';
import { d1Client, D1AnalyticsReport, D1HealthStatus } from '../services/d1Client';

const STORAGE_REQUESTS_KEY = 'URATEX_MIS_APPFORGE_REQUESTS_V2';
const STORAGE_WORKFLOWS_KEY = 'URATEX_MIS_APPFORGE_WORKFLOWS_V2';
const STORAGE_TASKS_KEY = 'URATEX_MIS_APPFORGE_TASKS_V2';
const STORAGE_USERS_KEY = 'URATEX_MIS_APPFORGE_USERS_V2';
const STORAGE_AUTH_USER_KEY = 'URATEX_MIS_APPFORGE_CURRENT_USER_V2';
const STORAGE_ACTIVITIES_KEY = 'URATEX_MIS_APPFORGE_ACTIVITIES_V2';
const STORAGE_IS_AUTH_KEY = 'URATEX_MIS_APPFORGE_IS_AUTH_V2';

export type AppViewMode =
  | 'dashboard'
  | 'board'
  | 'kanban'
  | 'tasks'
  | 'timeline';

interface AppForgeContextType {
  // Requests
  requests: AppRequest[];
  selectedRequest: AppRequest | null;
  setSelectedRequest: (request: AppRequest | null) => void;
  createRequest: (data: {
    title: string;
    type: RequestType;
    department: Department;
    urgency: UrgencyLevel;
    problemDescription: string;
    businessJustification: string;
    expectedBenefits: string;
    targetUserBase: string;
    tags: string[];
    targetGoLiveDate: string;
    workflowId?: string;
  }) => AppRequest;
  updateRequest: (id: string, updates: Partial<AppRequest>) => void;
  deleteRequest: (id: string) => void;
  changeStage: (id: string, newStage: SDLCStageNumber | number, newStatusName?: string) => { success: boolean; reason?: string };

  // Workflows
  workflows: ProjectWorkflow[];
  createWorkflow: (workflow: {
    name: string;
    description: string;
    applicableTypes: RequestType[];
    stages: { name: string; description: string; badgeColor: string; isGate?: boolean }[];
  }) => ProjectWorkflow;
  updateWorkflow: (id: string, updates: Partial<ProjectWorkflow>) => void;
  deleteWorkflow: (id: string) => boolean;
  addStageToWorkflow: (workflowId: string, stage: { name: string; description: string; badgeColor: string; isGate?: boolean }) => void;
  deleteStageFromWorkflow: (workflowId: string, stageId: string) => void;
  assignWorkflowToProject: (projectId: string, workflowId: string) => void;

  // Task Management
  tasks: ProjectTask[];
  createTask: (data: {
    projectId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedToId: string;
    dueDate: string;
    estimatedHours: number;
    tags?: string[];
  }) => ProjectTask;
  updateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  deleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;

  // Authentication & RBAC
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  users: UserPersona[];
  currentUser: UserPersona;
  permissions: RolePermissions;
  loginUser: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    department: Department;
    title: string;
  }) => Promise<{ success: boolean; user?: UserPersona; error?: string }>;
  updateUserProfile: (data: {
    name: string;
    department: Department;
    title: string;
    avatar?: string;
    role?: UserRole;
  }) => Promise<{ success: boolean; error?: string }>;
  changeUserPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;

  // Views & Filters
  activeView: AppViewMode;
  setActiveView: (view: AppViewMode) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  selectedUrgency: string;
  setSelectedUrgency: (urgency: string) => void;
  selectedType: string;
  setSelectedType: (t: string) => void;
  selectedStage: string;
  setSelectedStage: (s: string) => void;
  groupBy: 'stage' | 'department' | 'urgency' | 'type';
  setGroupBy: (g: 'stage' | 'department' | 'urgency' | 'type') => void;

  // Modals
  isNewRequestModalOpen: boolean;
  setIsNewRequestModalOpen: (open: boolean) => void;
  isCloudflareModalOpen: boolean;
  setIsCloudflareModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isWorkflowModalOpen: boolean;
  setIsWorkflowModalOpen: (open: boolean) => void;
  isNewTaskModalOpen: boolean;
  setIsNewTaskModalOpen: (open: boolean) => void;

  // Activity Feed & Audit Trail
  activities: ActivityItem[];
  isActivitySidebarOpen: boolean;
  setIsActivitySidebarOpen: (open: boolean) => void;
  logActivity: (data: {
    type: ActivityType;
    actorId?: string;
    actorName?: string;
    actorAvatar?: string;
    actorRole?: UserRole;
    targetId: string;
    targetCode: string;
    targetTitle: string;
    actionSummary: string;
    details?: string;
  }) => void;
  clearActivities: () => void;

  // SDLC Sign-offs & Sub-actions
  approveManager: (id: string, approved: boolean, notes?: string) => void;
  signOffRequirements: (id: string, asRole: 'requester' | 'analyst') => void;
  signOffDesign: (id: string) => void;
  signOffUAT: (id: string) => void;
  toggleSubtask: (requestId: string, subtaskId: string) => void;
  addSubtask: (requestId: string, title: string, assignedTo?: string, dueDate?: string) => void;
  addComment: (requestId: string, content: string) => void;
  addTestCase: (requestId: string, title: string, expectedResult: string) => void;
  updateTestCaseStatus: (requestId: string, testCaseId: string, status: 'Pass' | 'Fail' | 'Pending' | 'Retest') => void;
  addBug: (requestId: string, title: string, severity: 'Critical' | 'Major' | 'Minor') => void;
  submitEvaluation: (
    requestId: string,
    rating: number,
    feedback: string,
    hoursSaved: number,
    roi: string,
    lessons: string
  ) => void;

  // Official SCR Form Actions
  updateSCRFormData: (requestId: string, updates: Partial<SCRFormData>) => void;
  signApprover: (requestId: string, approverId: string, signatureText?: string) => void;
  addSCRBusinessRequirement: (requestId: string, requirement: { no: string; description: string }) => void;

  // Cloudflare D1 Database & export/import
  d1Status: D1HealthStatus | null;
  d1Analytics: D1AnalyticsReport | null;
  refreshD1Status: () => Promise<void>;
  refreshFromD1: () => Promise<boolean>;
  syncAllToD1: () => Promise<{ success: boolean; message: string }>;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
}

const AppForgeContext = createContext<AppForgeContextType | undefined>(undefined);

export const AppForgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users state
  const [users, setUsers] = useState<UserPersona[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return USER_PERSONAS;
  });

  // Current authenticated user
  const [currentUser, setCurrentUser] = useState<UserPersona>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUTH_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return USER_PERSONAS[0]; // Jenor Ricafort (Admin)
  });

  // Authentication session state (requires login before accessing the app)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_IS_AUTH_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Workflows state
  const [workflows, setWorkflows] = useState<ProjectWorkflow[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WORKFLOWS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_WORKFLOWS;
  });

  // Requests state
  const [requests, setRequests] = useState<AppRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REQUESTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_REQUESTS;
  });

  // Tasks state
  const [tasks, setTasks] = useState<ProjectTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TASKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TASKS;
  });

  // Views & navigation
  const [activeView, setActiveView] = useState<AppViewMode>('board');
  const [selectedRequest, setSelectedRequest] = useState<AppRequest | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [groupBy, setGroupBy] = useState<'stage' | 'department' | 'urgency' | 'type'>('stage');

  // Modals & Sidebar
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isCloudflareModalOpen, setIsCloudflareModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isActivitySidebarOpen, setIsActivitySidebarOpen] = useState(false);

  // Activity Log State
  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVITIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ACTIVITIES;
  });

  // Cloudflare D1 live connection & analytics state
  const [d1Status, setD1Status] = useState<D1HealthStatus | null>(null);
  const [d1Analytics, setD1Analytics] = useState<D1AnalyticsReport | null>(null);
  const d1ConnectedRef = useRef(false);

  const refreshD1Status = async () => {
    const health = await d1Client.checkHealth();
    setD1Status(health);
    d1ConnectedRef.current = Boolean(health.connected && health.schemaReady);
    if (health.connected && health.schemaReady) {
      const report = await d1Client.fetchAnalytics();
      if (report) setD1Analytics(report);
    }
  };

  const syncAllToD1 = async (): Promise<{ success: boolean; message: string }> => {
    const res = await d1Client.pushAllToD1({
      users,
      workflows,
      requests,
      tasks,
      activities,
    });
    if (res && res.success) {
      await refreshD1Status();
      return {
        success: true,
        message: `Synced ${res.synced?.requests ?? requests.length} requests, ${res.synced?.tasks ?? tasks.length} tasks, and ${res.synced?.users ?? users.length} users to Cloudflare D1.`,
      };
    }
    return {
      success: false,
      message: res?.error || 'Cloudflare D1 binding (DB) is not active in this runtime.',
    };
  };

  const refreshFromD1 = async (): Promise<boolean> => {
    const boot = await d1Client.bootstrap();
    if (!boot || !boot.success) return false;
    if (boot.users.length > 0) setUsers(boot.users);
    if (boot.workflows.length > 0) setWorkflows(boot.workflows);
    if (boot.requests.length > 0) setRequests(boot.requests);
    if (boot.tasks.length > 0) setTasks(boot.tasks);
    if (boot.activities.length > 0) setActivities(boot.activities);
    await refreshD1Status();
    return true;
  };

  const hasBootstrappedRef = useRef(false);

  // Bootstrap all workspace data & verify active session from Cloudflare D1 on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const health = await d1Client.checkHealth();
      if (!mounted) return;
      setD1Status(health);
      d1ConnectedRef.current = Boolean(health.connected && health.schemaReady);

      if (health.connected && health.schemaReady) {
        const savedToken = d1Client.getSessionToken();
        if (savedToken) {
          const verified = await d1Client.verifySession(savedToken);
          if (mounted && verified?.success && verified.valid && verified.user) {
            setCurrentUser(verified.user);
            setIsAuthenticated(true);
            try {
              localStorage.setItem(STORAGE_IS_AUTH_KEY, 'true');
              localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(verified.user));
            } catch {}
          } else if (mounted && verified && !verified.valid) {
            d1Client.setSessionToken(null);
            setIsAuthenticated(false);
            try {
              localStorage.removeItem(STORAGE_IS_AUTH_KEY);
            } catch {}
          }
        }

        const boot = await d1Client.bootstrap();
        if (!mounted || !boot || !boot.success) {
          hasBootstrappedRef.current = true;
          return;
        }

        if (boot.seeded) {
          if (boot.users.length > 0) setUsers(boot.users);
          if (boot.workflows.length > 0) setWorkflows(boot.workflows);
          if (boot.requests.length > 0) setRequests(boot.requests);
          if (boot.tasks.length > 0) setTasks(boot.tasks);
          if (boot.activities.length > 0) setActivities(boot.activities);
        } else {
          await d1Client.pushAllToD1({
            users,
            workflows,
            requests,
            tasks,
            activities,
          });
        }

        const report = await d1Client.fetchAnalytics();
        if (mounted && report) setD1Analytics(report);
      }
      hasBootstrappedRef.current = true;
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Sync to local storage & debounced Cloudflare D1 sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(requests));
      localStorage.setItem(STORAGE_WORKFLOWS_KEY, JSON.stringify(workflows));
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
      localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(currentUser));
      localStorage.setItem(STORAGE_ACTIVITIES_KEY, JSON.stringify(activities));
    } catch {}

    if (!hasBootstrappedRef.current || !d1ConnectedRef.current) return;
    const timer = setTimeout(() => {
      void d1Client
        .pushAllToD1({ users, workflows, requests, tasks, activities })
        .then(() => d1Client.fetchAnalytics())
        .then((report) => {
          if (report) setD1Analytics(report);
        });
    }, 600);
    return () => clearTimeout(timer);
  }, [requests, workflows, tasks, users, currentUser, activities]);

  // Track navigation analytics in Cloudflare D1
  useEffect(() => {
    if (!isAuthenticated || !d1ConnectedRef.current) return;
    void d1Client.logEventOrActivity({
      eventType: 'page_view',
      userId: currentUser.id,
      userRole: currentUser.role,
      department: currentUser.department,
      entityType: 'view',
      entityId: activeView,
      metricValue: 1,
      metadata: { view: activeView },
    });
  }, [activeView, isAuthenticated]);

  // Keep selectedRequest updated when requests change
  useEffect(() => {
    if (selectedRequest) {
      const updated = requests.find((r) => r.id === selectedRequest.id);
      if (updated) setSelectedRequest(updated);
    }
  }, [requests, selectedRequest?.id]);

  // Dynamic RBAC Permissions
  const permissions: RolePermissions =
    ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS['Team Member'];

  // Auth Functions (D1-authoritative when deployed on Cloudflare, local fallback in local Vite dev)
  const loginUser = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (d1ConnectedRef.current) {
      const res = await d1Client.login(normalizedEmail, password);
      if (res?.success && res.user) {
        if (res.sessionToken) d1Client.setSessionToken(res.sessionToken);
        setCurrentUser(res.user);
        setUsers((prev) =>
          prev.some((u) => u.id === res.user!.id) ? prev : [...prev, res.user!]
        );
        setIsAuthenticated(true);
        try {
          localStorage.setItem(STORAGE_IS_AUTH_KEY, 'true');
          localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(res.user));
        } catch {}
        return { success: true };
      }
      if (res) {
        return {
          success: false,
          error: res.error || 'Invalid corporate email or password.',
        };
      }
    }

    // Local preview fallback when Cloudflare Pages Functions are not mounted
    const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_IS_AUTH_KEY, 'true');
        localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(found));
      } catch {}
      return { success: true };
    }
    return {
      success: false,
      error: 'No account found with that email address. Please verify your email or register a new account.',
    };
  };

  const registerUser = async (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    department: Department;
    title: string;
  }): Promise<{ success: boolean; user?: UserPersona; error?: string }> => {
    if (d1ConnectedRef.current) {
      const res = await d1Client.register(data);
      if (res?.success && res.user) {
        if (res.sessionToken) d1Client.setSessionToken(res.sessionToken);
        setUsers((prev) => [...prev, res.user!]);
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        try {
          localStorage.setItem(STORAGE_IS_AUTH_KEY, 'true');
          localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(res.user));
        } catch {}
        return { success: true, user: res.user };
      }
      if (res) {
        return {
          success: false,
          error: res.error || 'Unable to register account in Cloudflare D1.',
        };
      }
    }

    const newUser: UserPersona = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
      title: data.title || `${data.role} in ${data.department}`,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=120&h=120&q=80`,
      createdAt: new Date().toISOString().split('T')[0],
      isManager: data.role === 'Admin' || data.role === 'Project Manager',
      isITLead: data.role === 'Admin',
      isDeveloper: data.role === 'Team Member',
      isQA: false,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_IS_AUTH_KEY, 'true');
      localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(newUser));
    } catch {}
    return { success: true, user: newUser };
  };

  const updateUserProfile = async (data: {
    name: string;
    department: Department;
    title: string;
    avatar?: string;
    role?: UserRole;
  }): Promise<{ success: boolean; error?: string }> => {
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Full name cannot be empty.' };
    }

    if (d1ConnectedRef.current) {
      const res = await d1Client.updateProfile({
        userId: currentUser.id,
        name: trimmedName,
        department: data.department,
        title: data.title.trim() || currentUser.title,
        avatar: data.avatar !== undefined ? data.avatar.trim() : currentUser.avatar,
        role: currentUser.role === 'Admin' ? data.role : undefined,
      });

      if (res?.success && res.user) {
        setCurrentUser(res.user);
        setUsers((prev) => prev.map((u) => (u.id === res.user!.id ? res.user! : u)));
        try {
          localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(res.user));
        } catch {}
        return { success: true };
      }

      if (res) {
        return { success: false, error: res.error || 'Failed to update profile in Cloudflare D1.' };
      }
    }

    // Local preview fallback
    const nextRole = currentUser.role === 'Admin' && data.role ? data.role : currentUser.role;
    const updatedUser: UserPersona = {
      ...currentUser,
      name: trimmedName,
      department: data.department,
      title: data.title.trim() || currentUser.title,
      avatar: data.avatar !== undefined ? data.avatar.trim() : currentUser.avatar,
      role: nextRole,
      isManager: nextRole === 'Admin' || nextRole === 'Project Manager',
      isITLead: nextRole === 'Admin',
      isDeveloper: nextRole === 'Team Member',
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    try {
      localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(updatedUser));
    } catch {}
    return { success: true };
  };

  const changeUserPassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentPassword || !newPassword) {
      return { success: false, error: 'Please enter both your current password and a new password.' };
    }
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    if (d1ConnectedRef.current) {
      const res = await d1Client.changePassword({
        userId: currentUser.id,
        currentPassword,
        newPassword,
      });
      if (res?.success) {
        return { success: true };
      }
      if (res) {
        return { success: false, error: res.error || 'Unable to change password.' };
      }
    }

    return { success: true };
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_IS_AUTH_KEY);
    } catch {}
    void d1Client.logout();
  };

  // Activity Logging Function
  const logActivity = (data: {
    type: ActivityType;
    actorId?: string;
    actorName?: string;
    actorAvatar?: string;
    actorRole?: UserRole;
    targetId: string;
    targetCode: string;
    targetTitle: string;
    actionSummary: string;
    details?: string;
  }) => {
    const newAct: ActivityItem = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: data.type,
      actorId: data.actorId || currentUser.id,
      actorName: data.actorName || currentUser.name,
      actorAvatar: data.actorAvatar || currentUser.avatar,
      actorRole: data.actorRole || currentUser.role,
      targetId: data.targetId,
      targetCode: data.targetCode,
      targetTitle: data.targetTitle,
      actionSummary: data.actionSummary,
      details: data.details,
      timestamp: 'Just now',
      createdAt: Date.now(),
    };
    setActivities((prev) => [newAct, ...prev]);
    // Persist activity & analytics event to Cloudflare D1
    if (d1ConnectedRef.current) {
      void d1Client.logEventOrActivity({
        eventType: data.type,
        userId: newAct.actorId,
        userRole: newAct.actorRole,
        department: currentUser.department,
        entityType: data.type.startsWith('task') ? 'task' : 'request',
        entityId: data.targetId,
        metricValue: 1,
        metadata: { code: data.targetCode, summary: data.actionSummary },
        activity: newAct,
      });
    }
  };

  const clearActivities = () => {
    setActivities([]);
    try {
      localStorage.removeItem(STORAGE_ACTIVITIES_KEY);
    } catch {}
  };

  // Workflow Builder Functions
  const createWorkflow = (data: {
    name: string;
    description: string;
    applicableTypes: RequestType[];
    stages: { name: string; description: string; badgeColor: string; isGate?: boolean }[];
  }): ProjectWorkflow => {
    const newWf: ProjectWorkflow = {
      id: `wf-${Date.now()}`,
      name: data.name,
      description: data.description,
      isDefault: false,
      applicableTypes: data.applicableTypes,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      stages: data.stages.map((stg, idx) => ({
        id: `stg-${Date.now()}-${idx + 1}`,
        name: stg.name,
        description: stg.description,
        badgeColor: stg.badgeColor || 'bg-blue-600 text-white',
        accentBg: 'bg-blue-50 text-blue-800 border-blue-200',
        order: idx + 1,
        isGate: !!stg.isGate,
        requiresSignoff: !!stg.isGate,
      })),
    };

    setWorkflows((prev) => [...prev, newWf]);
    return newWf;
  };

  const updateWorkflow = (id: string, updates: Partial<ProjectWorkflow>) => {
    setWorkflows((prev) =>
      prev.map((wf) => (wf.id === id ? { ...wf, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : wf))
    );
  };

  const deleteWorkflow = (id: string): boolean => {
    if (workflows.length <= 1) return false;
    setWorkflows((prev) => prev.filter((wf) => wf.id !== id));
    if (d1ConnectedRef.current) {
      void d1Client.deleteWorkflow(id);
    }
    return true;
  };

  const addStageToWorkflow = (
    workflowId: string,
    stage: { name: string; description: string; badgeColor: string; isGate?: boolean }
  ) => {
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== workflowId) return wf;
        const newStage: WorkflowStage = {
          id: `stg-${Date.now()}`,
          name: stage.name,
          description: stage.description,
          badgeColor: stage.badgeColor || 'bg-blue-600 text-white',
          accentBg: 'bg-blue-50 text-blue-800 border-blue-200',
          order: wf.stages.length + 1,
          isGate: !!stage.isGate,
          requiresSignoff: !!stage.isGate,
        };
        return {
          ...wf,
          stages: [...wf.stages, newStage],
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const deleteStageFromWorkflow = (workflowId: string, stageId: string) => {
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== workflowId) return wf;
        const filtered = wf.stages.filter((s) => s.id !== stageId);
        const reordered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
        return {
          ...wf,
          stages: reordered,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const assignWorkflowToProject = (projectId: string, workflowId: string) => {
    const wf = workflows.find((w) => w.id === workflowId);
    if (!wf || wf.stages.length === 0) return;

    const project = requests.find((r) => r.id === projectId);

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== projectId) return r;
        const firstStage = wf.stages[0];
        return {
          ...r,
          workflowId,
          status: firstStage.name,
          currentSDLCStage: 1,
        };
      })
    );

    if (project) {
      logActivity({
        type: 'workflow_changed',
        targetId: projectId,
        targetCode: project.code,
        targetTitle: project.title,
        actionSummary: `Assigned workflow "${wf.name}" to project`,
        details: `Reset to initial stage "${wf.stages[0]?.name}" (${wf.stages.length} total stages)`,
      });
    }
  };

  // Task Management Functions
  const createTask = (data: {
    projectId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedToId: string;
    dueDate: string;
    estimatedHours: number;
    tags?: string[];
  }): ProjectTask => {
    const project = requests.find((r) => r.id === data.projectId);
    const assignee = users.find((u) => u.id === data.assignedToId) || currentUser;

    const newTask: ProjectTask = {
      id: `tsk-${Date.now()}`,
      projectId: data.projectId,
      projectCode: project?.code || 'URX-TASK',
      projectTitle: project?.title || 'General Initiative',
      title: data.title,
      description: data.description || '',
      status: data.status,
      priority: data.priority,
      assignedToId: assignee.id,
      assignedToName: assignee.name,
      assignedToAvatar: assignee.avatar,
      dueDate: data.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      estimatedHours: data.estimatedHours || 8,
      loggedHours: 0,
      tags: data.tags || ['AppForge'],
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTasks((prev) => [newTask, ...prev]);

    // Also mirror to project subtasks for seamless UI integration
    if (project) {
      addSubtask(project.id, data.title, assignee.name, newTask.dueDate);
    }

    logActivity({
      type: 'task_created',
      targetId: newTask.id,
      targetCode: newTask.projectCode,
      targetTitle: newTask.projectTitle,
      actionSummary: `Created task "${newTask.title}"`,
      details: `Assigned to ${assignee.name} | Due: ${newTask.dueDate} | Priority: ${newTask.priority}`,
    });

    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<ProjectTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (d1ConnectedRef.current) {
      void d1Client.deleteTask(taskId);
    }
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );

    if (task && task.status !== status) {
      logActivity({
        type: 'task_status_changed',
        targetId: task.id,
        targetCode: task.projectCode,
        targetTitle: task.projectTitle,
        actionSummary: `Moved task "${task.title}" to ${status}`,
        details: `Updated from "${task.status}" to "${status}"`,
      });
    }
  };

  // Request Management
  const createRequest = (data: {
    title: string;
    type: RequestType;
    department: Department;
    urgency: UrgencyLevel;
    problemDescription: string;
    businessJustification: string;
    expectedBenefits: string;
    targetUserBase: string;
    tags: string[];
    targetGoLiveDate: string;
    workflowId?: string;
  }): AppRequest => {
    const existingNumbers = requests
      .map((r) => {
        const match = r.code.match(/SCR-\d{4}-(\d+)/) || r.code.match(/URX-REQ-\d{4}-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 4;
    const formattedCode = `SCR-2026-${String(nextNumber).padStart(3, '0')}`;

    const chosenWorkflow =
      workflows.find((w) => w.id === data.workflowId) ||
      (data.type === 'Quick Win' ? workflows.find((w) => w.id === 'wf-quick-3') : null) ||
      workflows[0];

    const initialStatus = chosenWorkflow.stages[0]?.name || 'Submitted';

    const newReq: AppRequest = {
      id: `req-${Date.now()}`,
      code: formattedCode,
      title: data.title,
      type: data.type,
      department: data.department,
      urgency: data.urgency,
      status: initialStatus,
      currentSDLCStage: 1,
      workflowId: chosenWorkflow.id,
      requesterName: currentUser.name,
      requesterEmail: currentUser.email,
      requesterAvatar: currentUser.avatar,
      assignedLead: 'John Christian Garon',
      assignedLeadAvatar: USER_PERSONAS[0].avatar,
      startDate: new Date().toISOString().split('T')[0],
      targetGoLiveDate: data.targetGoLiveDate || '2026-11-20',
      tags: data.tags.length > 0 ? data.tags : [data.department.split(' ')[0], data.type],
      subtasks: [
        {
          id: `sub-${Date.now()}-1`,
          title: 'Review submitted problem statement & verify scope',
          completed: false,
          assignedTo: 'Jenor Ricafort',
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        },
      ],
      comments: [
        {
          id: `comm-${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar,
          authorRole: currentUser.title,
          content: `Submitted new ${data.type} request under "${chosenWorkflow.name}" workflow.`,
          timestamp: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          stageTagged: initialStatus,
        },
      ],
      sdlc: {
        ideation: {
          submittedAt: new Date().toISOString().split('T')[0],
          problemDescription: data.problemDescription,
          businessJustification: data.businessJustification,
          expectedBenefits: data.expectedBenefits,
          targetUserBase: data.targetUserBase,
        },
        planning: {
          managerApproved: false,
          effortEstimateDays: data.type === 'Quick Win' ? 3 : data.type === 'Enhancement' ? 12 : 28,
          impactScore: data.urgency === 'Critical' ? 5 : data.urgency === 'High' ? 4 : 3,
          priorityScore: data.urgency === 'Critical' ? 95 : 75,
          targetQuarter: 'Q4 2026',
          decision: 'Pending',
        },
        requirements: {
          userStories: [
            {
              id: `us-${Date.now()}`,
              story: `As a user in ${data.department}, I need: "${data.problemDescription.slice(0, 80)}..."`,
              signedOff: false,
            },
          ],
          requesterSignedOff: false,
          analystSignedOff: false,
        },
        design: {
          skippedForLighterWorkflow: data.type === 'Quick Win',
          securityChecklistPassed: false,
          sapIntegrationRequired: false,
          designApproved: false,
        },
        development: {
          assignedDevelopers: [],
          percentComplete: 0,
        },
        testing: {
          testCases: [],
          bugs: [],
          uatSignedOff: false,
        },
        documentation: {
          completed: false,
        },
        implementation: {
          environment: 'Staging',
          databaseMigrationDone: false,
          securityAuditCleared: false,
          goLiveNotificationSent: false,
        },
        training: {
          sessions: [],
          materialsUploaded: false,
        },
        evaluation: {
          rating: 0,
          surveyFeedback: '',
          hoursSavedPerWeek: 0,
          roiSummary: '',
          lessonsLearned: '',
        },
        maintenance: {
          systemHealth: 'Optimal',
          openSupportTickets: 0,
          lastHealthCheck: new Date().toISOString().split('T')[0],
          slaCompliancePercentage: 100,
          uptimePercentage: 100,
        },
      },
      scr: {
        documentNo: formattedCode,
        requestDate: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
        requestedBy: currentUser.name,
        department: data.department,
        systemApplication: 'MDM Portal',
        module: `${data.department} Module`,
        priority: data.urgency === 'Critical' ? 'Critical' : data.urgency === 'High' ? 'High' : data.urgency === 'Medium' ? 'Medium' : 'Low',
        changeRequestTitle: data.title,
        typesOfChange: [data.type === 'New Application' ? 'New Functionality' : data.type === 'Quick Win' ? 'Bug/Error Correction' : 'Enhancement'],
        currentSituation: [data.problemDescription],
        requestedChange: [data.expectedBenefits],
        businessReasons: [data.businessJustification],
        businessRequirements: [
          { id: `br-${Date.now()}-1`, no: 'BR-01', description: `Implement ${data.title} functionality for ${data.department}` },
          { id: `br-${Date.now()}-2`, no: 'BR-02', description: `Validate business rule compliance with expected benefit: "${data.expectedBenefits.slice(0, 70)}..."` }
        ],
        systemsAffected: {
          cpq: false,
          mdm: true,
          sap: data.department.includes('Logistics') || data.department.includes('Plant'),
          customerPortal: false,
          pricingEngine: false,
          reportingDashboard: false,
        },
        businessAreasAffected: {
          sales: data.department.includes('Sales'),
          finance: data.department.includes('Finance'),
          mdm: true,
          manufacturing: data.department.includes('Plant') || data.department.includes('Production'),
          purchasing: data.department.includes('Procurement') || data.department.includes('Supply'),
          it: true,
        },
        dataAffected: `${data.department} Operational & Master Data`,
        integrationAffected: 'None',
        risksAndImpacts: [
          { id: `ri-${Date.now()}`, areaImpact: data.department, risk: 'Operational change management during rollout', consideration: 'Provide user training and verification before production' }
        ],
        acceptanceCriteria: [
          `The system shall successfully fulfill: "${data.title}"`,
          `All designated functional requirements verified against testing suite`,
          `Target users (${data.targetUserBase}) can execute workflow without errors`
        ],
        testTypes: ['Regression Testing', 'User Acceptance Testing'],
        uatOwner: currentUser.name,
        uatTargetDate: data.targetGoLiveDate || '2026-11-20',
        uatResult: 'Pending',
        approvers: [
          { id: 'appr-1', name: 'Zyrin Yumul', role: 'Product Owner', signed: false },
          { id: 'appr-2', name: 'Anton Medina', role: 'DT Manager', signed: false },
          { id: 'appr-3', name: 'Eric Borromeo', role: 'IT Manager', signed: false },
          { id: 'appr-4', name: 'Jhun Espinosa', role: 'App Dev Manager', signed: false },
          { id: 'appr-5', name: 'John Christian Garon', role: 'Application Developer', signed: false },
          { id: 'appr-6', name: 'Nathaniel Trinidad', role: 'App Dev - QA', signed: false },
        ],
        timelinePhases: [
          { id: 'tp-1', phase: 'Requirements', activity: 'Review & finalize Change Request', targetStartDate: 'Nov 10, 2026', targetCompletionDate: 'Nov 10, 2026', durationDays: 1 },
          { id: 'tp-2', phase: 'SCR Approval', activity: 'Business review & SCR sign-off', targetStartDate: 'Nov 11, 2026', targetCompletionDate: 'Nov 11, 2026', durationDays: 1 },
          { id: 'tp-3', phase: 'Development', activity: 'Develop requested changes', targetStartDate: 'Nov 11, 2026', targetCompletionDate: 'Nov 11, 2026', durationDays: 1 },
          { id: 'tp-4', phase: 'Testing', activity: 'QA / Functional Testing', targetStartDate: 'Nov 11, 2026', targetCompletionDate: 'Nov 11, 2026', durationDays: 1 },
          { id: 'tp-5', phase: 'UAT', activity: 'User Acceptance Testing', targetStartDate: 'Nov 12, 2026', targetCompletionDate: 'Nov 12, 2026', durationDays: 1 },
          { id: 'tp-6', phase: 'Bug Fixes/Adjustment', activity: 'Bug fixing / adjustment', targetStartDate: 'Nov 12, 2026', targetCompletionDate: 'Nov 12, 2026', durationDays: 1 },
          { id: 'tp-7', phase: 'Deployment', activity: 'Production deployment', targetStartDate: 'Nov 13, 2026', targetCompletionDate: 'Nov 13, 2026', durationDays: 1 },
          { id: 'tp-8', phase: 'Post Deployment', activity: 'Monitoring', targetStartDate: 'Nov 13, 2026', targetCompletionDate: 'Nov 13, 2026', durationDays: 1 },
        ],
        implementation: {
          devStart: 'Nov 11, 2026',
          devCompletion: 'Nov 11, 2026',
          uatStart: 'Nov 12, 2026',
          uatCompletion: 'Nov 12, 2026',
          productionDeployment: data.targetGoLiveDate || 'Nov 13, 2026',
          deploymentPlan: 'Deploy schema and code updates to Cloudflare Edge environment',
          rollbackPlan: 'Git revert to previous stable tag if validation fails',
          postImplementationValidation: 'Verify end-to-end user transactions in production',
        },
        closure: {
          pirRequired: false,
        },
      },
    };

    setRequests((prev) => [newReq, ...prev]);

    logActivity({
      type: 'project_created',
      targetId: newReq.id,
      targetCode: newReq.code,
      targetTitle: newReq.title,
      actionSummary: `Submitted System Change Request (${newReq.code})`,
      details: `Target Go-Live: ${newReq.targetGoLiveDate} | Urgency: ${newReq.urgency} | Department: ${newReq.department}`,
    });

    return newReq;
  };

  const updateSCRFormData = (requestId: string, updates: Partial<SCRFormData>) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const currentSCR = r.scr || {
          documentNo: r.code,
          requestDate: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
          requestedBy: r.requesterName,
          department: r.department,
          systemApplication: 'MDM Portal',
          module: `${r.department} Module`,
          priority: r.urgency === 'Critical' ? 'Critical' : r.urgency === 'High' ? 'High' : 'Medium',
          changeRequestTitle: r.title,
          typesOfChange: ['Enhancement'],
          currentSituation: [r.sdlc.ideation.problemDescription],
          requestedChange: [r.sdlc.ideation.expectedBenefits],
          businessReasons: [r.sdlc.ideation.businessJustification],
          businessRequirements: [],
          systemsAffected: { cpq: false, mdm: true, sap: false, customerPortal: false, pricingEngine: false, reportingDashboard: false },
          businessAreasAffected: { sales: false, finance: false, mdm: true, manufacturing: false, purchasing: false, it: false },
          dataAffected: 'MDM Master Data',
          integrationAffected: 'None',
          risksAndImpacts: [],
          acceptanceCriteria: [],
          testTypes: ['Regression Testing'],
          uatOwner: r.requesterName,
          uatTargetDate: r.targetGoLiveDate,
          uatResult: 'Pending',
          approvers: [],
          timelinePhases: [],
          implementation: {},
          closure: { pirRequired: false },
        };
        const updatedSCR: SCRFormData = {
          ...currentSCR,
          ...updates,
        };
        return {
          ...r,
          scr: updatedSCR,
        };
      })
    );

    const req = requests.find((r) => r.id === requestId);
    if (req) {
      logActivity({
        type: 'gate_signed',
        targetId: requestId,
        targetCode: req.code,
        targetTitle: req.title,
        actionSummary: 'Updated System Change Request (SCR) Form',
        details: 'Recorded updates to official Uratex SCR specification.',
      });
    }
  };

  const signApprover = (requestId: string, approverId: string, signatureText?: string) => {
    const target = requests.find((r) => r.id === requestId);
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId || !r.scr) return r;
        const updatedApprovers = (r.scr.approvers || []).map((appr) => {
          if (appr.id === approverId) {
            return {
              ...appr,
              signed: true,
              signatureText: signatureText || currentUser.name,
              signedDate: new Date().toISOString().split('T')[0],
            };
          }
          return appr;
        });

        return {
          ...r,
          scr: {
            ...r.scr,
            approvers: updatedApprovers,
          },
        };
      })
    );

    if (target) {
      logActivity({
        type: 'gate_signed',
        targetId: target.id,
        targetCode: target.code,
        targetTitle: target.title,
        actionSummary: `SCR Sign-off completed by ${signatureText || currentUser.name}`,
        details: `Official signature recorded in Section 9 of ${target.code}`,
      });
    }
  };

  const addSCRBusinessRequirement = (
    requestId: string,
    req: { no: string; description: string }
  ) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId || !r.scr) return r;
        const newReqItem = {
          id: `br-${Date.now()}`,
          no: req.no,
          description: req.description,
        };
        return {
          ...r,
          scr: {
            ...r.scr,
            businessRequirements: [...(r.scr.businessRequirements || []), newReqItem],
          },
        };
      })
    );
  };

  const updateRequest = (id: string, updates: Partial<AppRequest>) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteRequest = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    if (selectedRequest?.id === id) {
      setSelectedRequest(null);
    }
    if (d1ConnectedRef.current) {
      void d1Client.deleteRequest(id);
    }
  };

  const changeStage = (
    id: string,
    newStageNumber: SDLCStageNumber | number,
    newStatusName?: string
  ): { success: boolean; reason?: string } => {
    const target = requests.find((r) => r.id === id);
    if (!target) return { success: false, reason: 'Request not found' };

    const associatedWorkflow = workflows.find((w) => w.id === target.workflowId) || workflows[0];
    const targetStage = associatedWorkflow.stages.find((s) => s.order === newStageNumber);
    const targetStatus = newStatusName || targetStage?.name || `Stage ${newStageNumber}`;

    // Gate Check 1: Development Gate Rule
    if (newStageNumber === 5 && target.type !== 'Quick Win') {
      const reqSigned =
        target.sdlc.requirements.requesterSignedOff && target.sdlc.requirements.analystSignedOff;
      const designApproved = target.sdlc.design.designApproved;

      if (!reqSigned) {
        return {
          success: false,
          reason:
            'Gate Policy Violation: Functional Requirements must be signed off by both Requester and IT Analyst before Development can begin.',
        };
      }
      if (!designApproved && target.type === 'New Application') {
        return {
          success: false,
          reason:
            'Gate Policy Violation: Technical Design must be formally approved by IT Lead before New Application coding begins.',
        };
      }
    }

    // Gate Check 2: Production Deployment Gate Rule
    if (newStageNumber >= 8) {
      if (!target.sdlc.testing.uatSignedOff) {
        return {
          success: false,
          reason:
            'Gate Policy Violation: User Acceptance Testing (UAT) sign-off is mandatory before Implementation and Go-Live.',
        };
      }
    }

    // Update Request
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const newComments = [
          ...r.comments,
          {
            id: `comm-stage-${Date.now()}`,
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorAvatar: currentUser.avatar,
            authorRole: currentUser.title,
            content: `Transitioned stage to "${targetStatus}" (${newStageNumber}/${associatedWorkflow.stages.length})`,
            timestamp: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            stageTagged: targetStatus,
          },
        ];

        return {
          ...r,
          currentSDLCStage: newStageNumber,
          status: targetStatus,
          comments: newComments,
        };
      })
    );

    logActivity({
      type: 'stage_changed',
      targetId: target.id,
      targetCode: target.code,
      targetTitle: target.title,
      actionSummary: `Transitioned stage to "${targetStatus}" (${newStageNumber}/${associatedWorkflow.stages.length})`,
      details: `Previous status was "${target.status}" (Stage ${target.currentSDLCStage})`,
    });

    return { success: true };
  };

  const approveManager = (id: string, approved: boolean, notes?: string) => {
    const target = requests.find((r) => r.id === id);
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          status: approved ? 'Planning/Triage' : 'Under Manager Review',
          currentSDLCStage: approved ? 2 : r.currentSDLCStage,
          sdlc: {
            ...r.sdlc,
            planning: {
              ...r.sdlc.planning,
              managerApproved: approved,
              managerApprovedBy: currentUser.name,
              managerApprovedAt: new Date().toISOString().split('T')[0],
              managerNotes: notes || 'Approved for MIS project queue.',
              decision: approved ? 'Proceed' : 'Reject',
            },
          },
        };
      })
    );

    if (target) {
      logActivity({
        type: 'gate_signed',
        targetId: target.id,
        targetCode: target.code,
        targetTitle: target.title,
        actionSummary: approved ? 'Manager approved project proposal' : 'Manager returned project proposal with notes',
        details: notes || (approved ? 'Authorized for MIS backlog triage' : 'Pending revision'),
      });
    }
  };

  const signOffRequirements = (id: string, asRole: 'requester' | 'analyst') => {
    const target = requests.find((r) => r.id === id);
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const reqUpdates =
          asRole === 'requester'
            ? {
                requesterSignedOff: true,
                requesterSignedOffBy: currentUser.name,
                requesterSignedOffAt: new Date().toISOString().split('T')[0],
              }
            : {
                analystSignedOff: true,
                analystSignedOffBy: currentUser.name,
                analystSignedOffAt: new Date().toISOString().split('T')[0],
              };

        return {
          ...r,
          sdlc: {
            ...r.sdlc,
            requirements: {
              ...r.sdlc.requirements,
              ...reqUpdates,
            },
          },
        };
      })
    );

    if (target) {
      logActivity({
        type: 'gate_signed',
        targetId: target.id,
        targetCode: target.code,
        targetTitle: target.title,
        actionSummary: `Requirements Gate sign-off completed by ${asRole === 'requester' ? 'Requester' : 'MIS Analyst'}`,
        details: `Verified by ${currentUser.name} (${currentUser.title})`,
      });
    }
  };

  const signOffDesign = (id: string) => {
    const target = requests.find((r) => r.id === id);
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          sdlc: {
            ...r.sdlc,
            design: {
              ...r.sdlc.design,
              designApproved: true,
              designApprovedBy: currentUser.name,
              designApprovedAt: new Date().toISOString().split('T')[0],
              securityChecklistPassed: true,
            },
          },
        };
      })
    );

    if (target) {
      logActivity({
        type: 'gate_signed',
        targetId: target.id,
        targetCode: target.code,
        targetTitle: target.title,
        actionSummary: 'Technical Design Gate approved by IT Lead',
        details: `Architecture, ERP/SAP integration, and security clearance signed off by ${currentUser.name}`,
      });
    }
  };

  const signOffUAT = (id: string) => {
    const target = requests.find((r) => r.id === id);
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          sdlc: {
            ...r.sdlc,
            testing: {
              ...r.sdlc.testing,
              uatSignedOff: true,
              uatSignedOffBy: currentUser.name,
              uatSignedOffAt: new Date().toISOString().split('T')[0],
            },
          },
        };
      })
    );

    if (target) {
      logActivity({
        type: 'gate_signed',
        targetId: target.id,
        targetCode: target.code,
        targetTitle: target.title,
        actionSummary: 'User Acceptance Testing (UAT) Gate signed off',
        details: `Plant operations, end-to-end scenarios, and test cases verified by ${currentUser.name}`,
      });
    }
  };

  const toggleSubtask = (requestId: string, subtaskId: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          subtasks: r.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          ),
        };
      })
    );
  };

  const addSubtask = (
    requestId: string,
    title: string,
    assignedTo?: string,
    dueDate?: string
  ) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const newSubtask = {
          id: `sub-${Date.now()}`,
          title,
          completed: false,
          assignedTo: assignedTo || currentUser.name,
          dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        };
        return {
          ...r,
          subtasks: [...r.subtasks, newSubtask],
        };
      })
    );
  };

  const addComment = (requestId: string, content: string) => {
    const target = requests.find((r) => r.id === requestId);
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const newComment = {
          id: `comm-${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar,
          authorRole: currentUser.title,
          content,
          timestamp: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          stageTagged: r.status,
        };
        return {
          ...r,
          comments: [...r.comments, newComment],
        };
      })
    );

    if (target) {
      logActivity({
        type: 'comment_added',
        targetId: target.id,
        targetCode: target.code,
        targetTitle: target.title,
        actionSummary: `Added comment on ${target.code}`,
        details: content.length > 90 ? content.slice(0, 90) + '...' : content,
      });
    }
  };

  const addTestCase = (requestId: string, title: string, expectedResult: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const nextCode = `TC-${String(r.sdlc.testing.testCases.length + 1).padStart(2, '0')}`;
        const newTC = {
          id: `tc-${Date.now()}`,
          code: nextCode,
          title,
          expectedResult,
          status: 'Pending' as const,
        };
        return {
          ...r,
          sdlc: {
            ...r.sdlc,
            testing: {
              ...r.sdlc.testing,
              testCases: [...r.sdlc.testing.testCases, newTC],
            },
          },
        };
      })
    );
  };

  const updateTestCaseStatus = (
    requestId: string,
    testCaseId: string,
    status: 'Pass' | 'Fail' | 'Pending' | 'Retest'
  ) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          sdlc: {
            ...r.sdlc,
            testing: {
              ...r.sdlc.testing,
              testCases: r.sdlc.testing.testCases.map((tc) =>
                tc.id === testCaseId
                  ? {
                      ...tc,
                      status,
                      testedBy: currentUser.name,
                      testDate: new Date().toISOString().split('T')[0],
                    }
                  : tc
              ),
            },
          },
        };
      })
    );
  };

  const addBug = (
    requestId: string,
    title: string,
    severity: 'Critical' | 'Major' | 'Minor'
  ) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const newBug = {
          id: `bug-${Date.now()}`,
          title,
          severity,
          status: 'Open' as const,
          reportedBy: currentUser.name,
          assignedTo: r.assignedLead,
          dateReported: new Date().toISOString().split('T')[0],
        };
        return {
          ...r,
          sdlc: {
            ...r.sdlc,
            testing: {
              ...r.sdlc.testing,
              bugs: [...r.sdlc.testing.bugs, newBug],
            },
          },
        };
      })
    );
  };

  const submitEvaluation = (
    requestId: string,
    rating: number,
    feedback: string,
    hoursSaved: number,
    roi: string,
    lessons: string
  ) => {
    const target = requests.find((r) => r.id === requestId);
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          sdlc: {
            ...r.sdlc,
            evaluation: {
              rating,
              surveyFeedback: feedback,
              hoursSavedPerWeek: hoursSaved,
              roiSummary: roi,
              lessonsLearned: lessons,
              evaluatedBy: currentUser.name,
              evaluatedAt: new Date().toISOString().split('T')[0],
            },
          },
        };
      })
    );

    if (target) {
      logActivity({
        type: 'evaluation_submitted',
        targetId: target.id,
        targetCode: target.code,
        targetTitle: target.title,
        actionSummary: `Completed post-implementation review (${rating}/5 Stars)`,
        details: `ROI: ${roi} | Time saved: ${hoursSaved} hrs/wk | Evaluated by ${currentUser.name}`,
      });
    }
  };

  const exportData = () => {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        version: '2.0.0',
        requests,
        workflows,
        tasks,
        users,
        activities,
      },
      null,
      2
    );
  };

  const importData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.requests && Array.isArray(parsed.requests)) {
        setRequests(parsed.requests);
        if (parsed.workflows) setWorkflows(parsed.workflows);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.activities && Array.isArray(parsed.activities)) setActivities(parsed.activities);
        return true;
      } else if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].code) {
        setRequests(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AppForgeContext.Provider
      value={{
        requests,
        selectedRequest,
        setSelectedRequest,
        createRequest,
        updateRequest,
        deleteRequest,
        changeStage,
        workflows,
        createWorkflow,
        updateWorkflow,
        deleteWorkflow,
        addStageToWorkflow,
        deleteStageFromWorkflow,
        assignWorkflowToProject,
        tasks,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        users,
        currentUser,
        permissions,
        isAuthenticated,
        setIsAuthenticated,
        loginUser,
        registerUser,
        updateUserProfile,
        changeUserPassword,
        logoutUser,
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        selectedDepartment,
        setSelectedDepartment,
        selectedUrgency,
        setSelectedUrgency,
        selectedType,
        setSelectedType,
        selectedStage,
        setSelectedStage,
        groupBy,
        setGroupBy,
        isNewRequestModalOpen,
        setIsNewRequestModalOpen,
        isCloudflareModalOpen,
        setIsCloudflareModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isWorkflowModalOpen,
        setIsWorkflowModalOpen,
        isNewTaskModalOpen,
        setIsNewTaskModalOpen,
        activities,
        isActivitySidebarOpen,
        setIsActivitySidebarOpen,
        logActivity,
        clearActivities,
        approveManager,
        signOffRequirements,
        signOffDesign,
        signOffUAT,
        toggleSubtask,
        addSubtask,
        addComment,
        addTestCase,
        updateTestCaseStatus,
        addBug,
        submitEvaluation,
        updateSCRFormData,
        signApprover,
        addSCRBusinessRequirement,
        d1Status,
        d1Analytics,
        refreshD1Status,
        refreshFromD1,
        syncAllToD1,
        exportData,
        importData,
      }}
    >
      {children}
    </AppForgeContext.Provider>
  );
};

export const useAppForge = () => {
  const context = useContext(AppForgeContext);
  if (!context) {
    throw new Error('useAppForge must be used within an AppForgeProvider');
  }
  return context;
};
