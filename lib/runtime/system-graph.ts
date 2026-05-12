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

export type RuntimeWorkflowStep = {
  id: string;
  label: string;
  type: "agent" | "memory" | "event";
};

export type RuntimeWorkflow = {
  id: string;
  name: string;
  trigger: string;
  owner: string;
  automation: string;
  steps: RuntimeWorkflowStep[];
};

export type RuntimeEvent = {
  name: string;
  trigger: string;
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
