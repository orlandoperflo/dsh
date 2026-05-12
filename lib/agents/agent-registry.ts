import type { RuntimeAgent } from "../runtime/system-graph";

export const agentRegistry = new Map<
  string,
  RuntimeAgent
>();

export function registerAgent(
  agent: RuntimeAgent
) {
  agentRegistry.set(agent.id, agent);
}

export function getAgent(id: string) {
  return agentRegistry.get(id);
}

export function getAllAgents() {
  return Array.from(
    agentRegistry.values()
  );
}
