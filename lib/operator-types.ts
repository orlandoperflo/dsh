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
