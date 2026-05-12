import { NextResponse } from "next/server";
import { generateRepository } from "@/lib/repository-generator";
import type { AnalysisResult } from "@/lib/operator-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const analysis = (await request.json()) as AnalysisResult;
  const repository = generateRepository(analysis);
  return NextResponse.json({ repository });
}
