import type { AnalysisResult } from "../operator-types";
import type {
  RuntimeSystemGraph,
  RuntimeWorkflow,
  RuntimeAgent
} from "./system-graph";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

export function compileSystem(
  analysis: AnalysisResult
): RuntimeSystemGraph {
  const agents: RuntimeAgent[] =
    analysis.agents.map((agent) => ({
      id: slugify(agent.name),
      name: agent.name,
      role: agent.role,
      model: "gpt-4.1-mini",
      tools: [
        "memory.search",
        "memory.write",
        "workflow.execute"
      ],
      goals: agent.goals,
      permissions: agent.permissions,
      memory: agent.memory,
      escalation: agent.escalation
    }));

  const workflows: RuntimeWorkflow[] =
    analysis.workflows.map((workflow) => ({
      id: slugify(workflow.name),
      name: workflow.name,
      trigger: workflow.trigger,
      owner: workflow.owner,
      automation: workflow.automation,
      steps: workflow.steps.map(
        (step, index) => ({
          id: `${slugify(workflow.name)}-${index}`,
          label: step,
          type: "agent"
        })
      )
    }));

  return {
    agents,
    workflows,
    memoryNamespaces:
      analysis.memoryDesign,
    events:
      analysis.executionChains.map(
        (chain) => ({
          name: slugify(chain),
          trigger: chain
        })
      ),
    integrations:
      analysis.deploymentTargets.map(
        (target) => ({
          name: target,
          required: true
        })
      )
  };
}
