import { NextResponse } from "next/server";

import { compileSystem } from "@/lib/runtime/compile-system";
import { Orchestrator } from "@/lib/runtime/orchestrator";

import type { AnalysisResult } from "@/lib/operator-types";

import {
  agents,
  workflows,
  memoryDesign
} from "@/lib/operating-system";

export async function POST(
  request: Request
) {
  const body = await request.json();

  const operatingSystem: AnalysisResult = {
    client: {
      name:
        process.env
          .NEXT_PUBLIC_CLIENT_NAME ??
        "Client",
      industry:
        "AI Operations",
      stage: "Production",
      objective:
        "Execute workflows through orchestrated agents"
    },

    summary:
      "Runtime-generated operating system.",

    bottlenecks: [],

    workflows: workflows.map(
      (workflow) => ({
        ...workflow
      })
    ),

    agents: agents.map((agent) => ({
      ...agent
    })),

    memoryDesign: [...memoryDesign],

    architecture: [
      "Next.js App Router",
      "Runtime orchestration engine",
      "Typed memory engine",
      "Workflow execution graph"
    ],

    executionChains: workflows.map(
      (workflow) => workflow.name
    ),

    deploymentTargets: [
      "Vercel"
    ]
  };

  const graph =
    compileSystem(
      operatingSystem
    );

  const orchestrator =
    new Orchestrator(graph);

  const result =
    await orchestrator.route({
      workflowId:
        graph.workflows[0]?.id,
      payload: body
    });

  return NextResponse.json(result);
}
