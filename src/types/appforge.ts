export type RequestType = 'New Application' | 'Enhancement' | 'Quick Win';

export type SDLCStageNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type SystemStatus =
  | 'Submitted'
  | 'Under Manager Review'
  | 'Planning/Triage'
  | 'Requirements Gathering'
  | 'Design'
  | 'Development'
  | 'Testing'
  | 'Documentation'
  | 'Implementation'
  | 'Training'
  | 'Evaluation'
  | 'Maintenance / Closed'
  | string; // Allows custom workflow stage names

export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type Department =
  | 'Foam Plant & Production'
  | 'Sales & Logistics'
  | 'Supply Chain & Procurement'
  | 'Automotive & Plastics Division'
  | 'Human Resources & Admin'
  | 'Finance & Accounting'
  | 'Quality Assurance & R&D'
  | 'Management Information Systems (MIS)';

export type UserRole = 'Admin' | 'Project Manager' | 'Team Member';

export interface RolePermissions {
  canCreateProject: boolean;
  canEditWorkflows: boolean;
  canApproveGates: boolean;
  canAssignTasks: boolean;
  canDeleteProjects: boolean;
  canViewAllData: boolean;
  canManageUsers: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  avatar: string;
  title: string;
  createdAt: string;
}

// UserPersona compatibility interface
export interface UserPersona extends UserAccount {
  isManager: boolean;
  isITLead: boolean;
  isDeveloper: boolean;
  isQA: boolean;
}

// Workflow System
export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  badgeColor: string; // e.g. 'bg-blue-600 text-white'
  accentBg: string;
  order: number;
  isGate?: boolean;
  requiresSignoff?: boolean;
}

export interface ProjectWorkflow {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  stages: WorkflowStage[];
  applicableTypes: RequestType[];
  createdAt: string;
  updatedAt: string;
}

// Comprehensive Enterprise Task
export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';
export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface ProjectTask {
  id: string;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToId: string;
  assignedToName: string;
  assignedToAvatar: string;
  dueDate: string;
  estimatedHours: number;
  loggedHours: number;
  tags: string[];
  createdAt: string;
}

// Subtask backwards-compatible interface
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assignedTo: string;
  dueDate: string;
}

export interface CommentMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  timestamp: string;
  stageTagged?: string;
}

export interface TestCase {
  id: string;
  code: string;
  title: string;
  expectedResult: string;
  status: 'Pass' | 'Fail' | 'Pending' | 'Retest';
  testedBy?: string;
  testDate?: string;
  notes?: string;
}

export interface BugReport {
  id: string;
  title: string;
  severity: 'Critical' | 'Major' | 'Minor';
  status: 'Open' | 'Fixed' | 'Verified';
  reportedBy: string;
  assignedTo: string;
  dateReported: string;
}

export interface TrainingSession {
  id: string;
  sessionTitle: string;
  scheduledDate: string;
  targetDepartment: string;
  trainer: string;
  attendeesCount: number;
  status: 'Scheduled' | 'Completed' | 'Deferred';
  materialsUrl?: string;
}

export interface SDLCStagesData {
  ideation: {
    submittedAt: string;
    problemDescription: string;
    businessJustification: string;
    expectedBenefits: string;
    targetUserBase: string;
  };
  planning: {
    managerApproved: boolean;
    managerApprovedBy?: string;
    managerApprovedAt?: string;
    managerNotes?: string;
    itLeadReviewer?: string;
    effortEstimateDays: number;
    impactScore: 1 | 2 | 3 | 4 | 5;
    priorityScore: number;
    targetQuarter: string;
    decision: 'Proceed' | 'Defer' | 'Reject' | 'Pending';
  };
  requirements: {
    specsDocumentUrl?: string;
    userStories: { id: string; story: string; signedOff: boolean }[];
    requesterSignedOff: boolean;
    requesterSignedOffBy?: string;
    requesterSignedOffAt?: string;
    analystSignedOff: boolean;
    analystSignedOffBy?: string;
    analystSignedOffAt?: string;
  };
  design: {
    skippedForLighterWorkflow?: boolean;
    architectureType?: string;
    databaseStructureNotes?: string;
    figmaMockupUrl?: string;
    securityChecklistPassed: boolean;
    sapIntegrationRequired: boolean;
    designApproved: boolean;
    designApprovedBy?: string;
    designApprovedAt?: string;
  };
  development: {
    repositoryBranch?: string;
    assignedDevelopers: string[];
    sprintName?: string;
    percentComplete: number;
    gitPullRequests?: string;
    blockers?: string;
  };
  testing: {
    testCases: TestCase[];
    bugs: BugReport[];
    uatSignedOff: boolean;
    uatSignedOffBy?: string;
    uatSignedOffAt?: string;
  };
  documentation: {
    userManualUrl?: string;
    systemDocVersion?: string;
    knowledgeBaseArticle?: string;
    completed: boolean;
  };
  implementation: {
    environment: 'Staging' | 'Production' | 'Rollback';
    databaseMigrationDone: boolean;
    securityAuditCleared: boolean;
    goLiveNotificationSent: boolean;
    goLiveDate?: string;
    deployedBy?: string;
  };
  training: {
    sessions: TrainingSession[];
    materialsUploaded: boolean;
    averageSatisfactionScore?: number;
  };
  evaluation: {
    rating: number;
    surveyFeedback: string;
    hoursSavedPerWeek: number;
    roiSummary: string;
    lessonsLearned: string;
    evaluatedBy?: string;
    evaluatedAt?: string;
  };
  maintenance: {
    systemHealth: 'Optimal' | 'Degraded' | 'Scheduled Maintenance';
    openSupportTickets: number;
    lastHealthCheck: string;
    slaCompliancePercentage: number;
    uptimePercentage: number;
  };
}

export interface AppRequest {
  id: string;
  code: string;
  title: string;
  type: RequestType;
  department: Department;
  urgency: UrgencyLevel;
  status: SystemStatus;
  currentSDLCStage: SDLCStageNumber | number;
  workflowId: string; // Associated custom workflow!
  requesterName: string;
  requesterEmail: string;
  requesterAvatar: string;
  assignedLead: string;
  assignedLeadAvatar: string;
  startDate: string;
  targetGoLiveDate: string;
  tags: string[];
  subtasks: Subtask[];
  tasks?: ProjectTask[];
  comments: CommentMessage[];
  sdlc: SDLCStagesData;
}

export type ActivityType =
  | 'project_created'
  | 'stage_changed'
  | 'gate_approved'
  | 'gate_signed'
  | 'task_created'
  | 'task_status_changed'
  | 'task_assigned'
  | 'comment_added'
  | 'workflow_changed'
  | 'evaluation_submitted';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  actorRole: UserRole;
  targetId: string;
  targetCode: string;
  targetTitle: string;
  actionSummary: string;
  details?: string;
  timestamp: string;
  createdAt: number;
}
