import { NextResponse } from "next/server";

import { compileSystem } from "@/lib/runtime/compile-system";
import { Orchestrator } from "@/lib/runtime/orchestrator";

import type { AnalysisResult } from "@/lib/operator-types";

import operatingSystem from "@/lib/generated-analysis.json";

export async function POST(
  request: Request
) {
  const body = await request.json();

  const graph =
    compileSystem(
      operatingSystem as AnalysisResult
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
