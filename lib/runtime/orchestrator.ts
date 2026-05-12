import type {
  RuntimeSystemGraph
} from "./system-graph";

import { workflowExecutor } from "../workflows/workflow-executor";

export class Orchestrator {
  constructor(
    private graph: RuntimeSystemGraph
  ) {}

  async route(input: {
    workflowId?: string;
    payload: unknown;
  }) {
    const workflow =
      this.graph.workflows.find(
        (item) =>
          item.id ===
          input.workflowId
      );

    if (!workflow) {
      throw new Error(
        "Workflow not found"
      );
    }

    return workflowExecutor.execute(
      workflow,
      input.payload
    );
  }
}
