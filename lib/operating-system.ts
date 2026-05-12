// lib/operating-system.ts

export const agents = [
  {
    name: "Operations Orchestrator",
    role:
      "Routes workflows and coordinates execution",
    goals: [
      "Execute workflows",
      "Coordinate agents",
      "Track operational state"
    ],
    permissions: [
      "read_workflows",
      "execute_tasks",
      "write_memory"
    ],
    memory: [
      "workflow_state",
      "decision_log"
    ],
    escalation:
      "Escalate unresolved execution conflicts"
  }
] as const;

export const workflows = [
  {
    name: "Default Workflow",
    trigger:
      "Incoming orchestration request",
    steps: [
      "Validate payload",
      "Route workflow",
      "Execute agent actions",
      "Store memory",
      "Return result"
    ],
    automation:
      "Automatic orchestration pipeline",
    owner:
      "Operations Orchestrator"
  }
] as const;

export const memoryDesign = [
  "workflow_state",
  "decision_log",
  "agent_memory"
] as const;
