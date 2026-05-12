import type {
  RuntimeWorkflow
} from "../runtime/system-graph";

import { eventBus } from "../events/event-bus";

export class WorkflowExecutor {
  async execute(
    workflow: RuntimeWorkflow,
    context: unknown
  ) {
    for (const step of workflow.steps) {
      console.log(
        "Executing step:",
        step.label
      );

      await eventBus.emit(
        "workflow.step.executed",
        {
          workflowId: workflow.id,
          step,
          context
        }
      );
    }

    await eventBus.emit(
      "workflow.completed",
      {
        workflowId: workflow.id
      }
    );

    return {
      success: true,
      workflowId: workflow.id
    };
  }
}

export const workflowExecutor =
  new WorkflowExecutor();
