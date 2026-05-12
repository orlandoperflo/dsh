export type UploadedIntelligence = {
  name: string;
  type: string;
  size: number;
  content: string;
};

export type ClientProfile = {
  name: string;
  industry: string;
  stage: string;
  objective: string;
};

export type Workflow = {
  name: string;
  trigger: string;
  steps: string[];
  automation: string;
  owner: string;
};

export type AgentSpec = {
  name: string;
  role: string;
  goals: string[];
  permissions: string[];
  memory: string[];
  escalation: string;
};

export type AnalysisResult = {
  client: ClientProfile;
  summary: string;
  bottlenecks: string[];
  workflows: Workflow[];
  agents: AgentSpec[];
  memoryDesign: string[];
  architecture: string[];
  executionChains: string[];
  deploymentTargets: string[];
};

export type RepoFile = {
  path: string;
  language: string;
  content: string;
};

export type GeneratedRepository = {
  name: string;
  description: string;
  files: RepoFile[];
  tree: string[];
  installCommand: string;
  devCommand: string;
  deploymentNotes: string[];
};

/* =========================================
   RUNTIME SYSTEM TYPES
========================================= */

export type RuntimeEvent = {
  name: string;
  trigger: string;
};

export type WorkflowStepType =
  | "agent"
  | "memory"
  | "event";

export type WorkflowStep = {
  id: string;
  label: string;
  type: WorkflowStepType;
};

export type RuntimeWorkflow = {
  id: string;
  name: string;
  trigger: string;
  owner: string;
  automation: string;
  steps: WorkflowStep[];
};

export type RuntimeAgent = {
  id: string;
  name: string;
  role: string;
  model: string;
  tools: string[];
  goals: string[];
  permissions: string[];
  memory: string[];
  escalation: string;
};

export type RuntimeIntegration = {
  name: string;
  required: boolean;
};

export type RuntimeSystemGraph = {
  agents: RuntimeAgent[];
  workflows: RuntimeWorkflow[];
  memoryNamespaces: string[];
  events: RuntimeEvent[];
  integrations: RuntimeIntegration[];
};

/* =========================================
   MEMORY ENGINE TYPES
========================================= */

export type MemoryNamespace =
  | "company_profile"
  | "workflow_state"
  | "decision_log"
  | "repo_structure";

export type MemoryRecord<
  T = unknown
> = {
  id: string;
  namespace: MemoryNamespace;
  key: string;
  value: T;
  createdAt: string;
};

/* =========================================
   WORKFLOW EXECUTION TYPES
========================================= */

export type WorkflowExecutionStatus =
  | "pending"
  | "running"
  | "blocked"
  | "failed"
  | "completed";

export type WorkflowExecution = {
  id: string;
  workflowId: string;
  status: WorkflowExecutionStatus;
  currentStep: number;
  startedAt: string;
  updatedAt: string;
  context: unknown;
};

export type AgentInvocation = {
  agentId: string;
  workflowId: string;
  stepId: string;
  input: unknown;
  output?: unknown;
  createdAt: string;
};

/* =========================================
   EVENT BUS TYPES
========================================= */

export type RuntimeEventPayload = {
  workflowId?: string;
  stepId?: string;
  agentId?: string;
  payload?: unknown;
  timestamp: string;
};

export type RuntimeEventHandler = (
  payload: RuntimeEventPayload
) => Promise<void>;

/* =========================================
   ORCHESTRATION TYPES
========================================= */

export type OrchestratorRouteInput = {
  workflowId?: string;
  payload: unknown;
};

export type OrchestratorRouteResult = {
  success: boolean;
  workflowId: string;
  completedSteps?: number;
  status?: WorkflowExecutionStatus;
};

/* =========================================
   DATABASE TYPES
========================================= */

export type PersistedWorkflow = {
  id: string;
  name: string;
  trigger: string;
  automation: string;
  owner: string;
  createdAt: string;
};

export type PersistedAgent = {
  id: string;
  name: string;
  role: string;
  goals: unknown;
  permissions: unknown;
  memory: unknown;
  escalation: string;
  createdAt: string;
};

/* =========================================
   REPOSITORY GENERATION TYPES
========================================= */

export type GeneratedRuntimeFile = {
  path: string;
  content: string;
};

export type GeneratedSystemArtifacts = {
  prismaSchema: string;
  supabaseSchema: string;
  runtimeFiles: GeneratedRuntimeFile[];
};

/* =========================================
   INTEGRATION TYPES
========================================= */

export type IntegrationSecret = {
  key: string;
  required: boolean;
};

export type IntegrationRegistry = {
  targets: string[];
  requiredSecrets: IntegrationSecret[];
  optionalIntegrations: string[];
};
