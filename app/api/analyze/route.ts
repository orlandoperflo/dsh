import OpenAI from "openai";
import { NextResponse } from "next/server";
import type {
  AnalysisResult,
  ClientProfile,
  UploadedIntelligence
} from "@/lib/operator-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnalyzeRequest = {
  client: ClientProfile;
  uploads: UploadedIntelligence[];
  operatorContext: string;
};

const orchestrationStates = [
  "analyzing company",
  "mapping workflows",
  "generating agents",
  "designing memory",
  "generating deployment architecture"
];

function deterministicAnalysis({
  client,
  uploads,
  operatorContext
}: AnalyzeRequest): AnalysisResult {
  const corpus = `${operatorContext}\n${uploads
    .map((upload) => upload.content)
    .join("\n")}`.toLowerCase();

  const mentionsSales = /sales|lead|pipeline|revenue|crm/.test(corpus);
  const mentionsSupport = /support|ticket|customer|success|onboard/.test(corpus);
  const mentionsOps = /ops|operation|delivery|fulfillment|handoff/.test(corpus);

  const workflows = [
    {
      name: "Lead-to-Delivery Command Chain",
      trigger:
        "New qualified opportunity, expansion request, or executive priority enters the system.",
      owner: mentionsSales ? "Revenue Operations" : "Operations Lead",
      steps: [
        "Normalize incoming request into a structured operating brief",
        "Route ownership based on urgency, value, and required capability",
        "Generate follow-up tasks and customer-facing next steps",
        "Monitor stalled handoffs and escalate after SLA breach",
        "Write outcomes back into client memory"
      ],
      automation:
        "AI triage, SLA timers, handoff packet generation, and executive summary creation."
    },
    {
      name: "Client Onboarding Intelligence Loop",
      trigger: "Signed client, implementation kickoff, or new stakeholder added.",
      owner: mentionsSupport ? "Client Success" : "Implementation Lead",
      steps: [
        "Extract goals, constraints, stakeholders, and known risks",
        "Create onboarding checklist with owners and due dates",
        "Schedule milestone reviews and collect completion evidence",
        "Detect missing assets or decision blockers",
        "Produce weekly readiness report"
      ],
      automation:
        "Checklist creation, blocker detection, stakeholder reminders, and weekly reporting."
    },
    {
      name: "Executive Operating Cadence",
      trigger: "Weekly review cycle or high-priority operational exception.",
      owner: mentionsOps ? "Chief of Staff" : "Executive Operator",
      steps: [
        "Aggregate workflow status, risks, and unresolved decisions",
        "Rank bottlenecks by customer impact and revenue risk",
        "Draft executive narrative with recommended interventions",
        "Assign decisions to accountable leaders",
        "Archive decisions into organizational memory"
      ],
      automation:
        "Decision memo drafting, risk ranking, cross-functional action registers, and memory updates."
    }
  ];

  const agents = [
    {
      name: "Revenue Signal Agent",
      role:
        "Monitors lead leakage, stalled opportunities, and revenue-critical handoffs.",
      goals: [
        "Reduce response latency",
        "Protect high-value opportunities",
        "Create clean sales-to-delivery handoffs"
      ],
      permissions: [
        "Read CRM exports",
        "Draft follow-ups",
        "Create handoff tasks"
      ],
      memory: [
        "customer_intent",
        "deal_context",
        "handoff_history"
      ],
      escalation:
        "Escalate to revenue owner when a qualified lead has no next action within 24 hours."
    },
    {
      name: "Operations Orchestrator Agent",
      role:
        "Turns ambiguous operational inputs into structured execution chains.",
      goals: [
        "Clarify ownership",
        "Sequence work",
        "Expose blockers before they become delays"
      ],
      permissions: [
        "Create workflow tasks",
        "Update operating dashboards",
        "Request missing context"
      ],
      memory: [
        "workflow_state",
        "stakeholder_map",
        "decision_log"
      ],
      escalation:
        "Escalate to the executive operator when ownership is unclear or two workflows conflict."
    },
    {
      name: "Client Memory Agent",
      role:
        "Maintains persistent company memory across meetings, transcripts, documents, and decisions.",
      goals: [
        "Preserve context",
        "Summarize changes",
        "Prevent repeated discovery work"
      ],
      permissions: [
        "Read uploaded intelligence",
        "Write memory records",
        "Generate briefing packs"
      ],
      memory: [
        "company_profile",
        "meeting_transcripts",
        "architecture_decisions"
      ],
      escalation:
        "Escalate when new information contradicts a prior executive decision."
    },
    {
      name: "Deployment Architect Agent",
      role:
        "Generates the technical repository, environment model, and deployment path for the client system.",
      goals: [
        "Produce runnable code",
        "Map integration boundaries",
        "Keep deployment Vercel-ready"
      ],
      permissions: [
        "Generate source files",
        "Define environment variables",
        "Produce deployment documentation"
      ],
      memory: [
        "repo_structure",
        "integration_registry",
        "security_constraints"
      ],
      escalation:
        "Escalate when a required integration lacks credentials, API scope, or owner approval."
    }
  ];

  return {
    client,
    summary: `${client.name} needs a deployable operational intelligence layer that converts uploaded company context into workflows, specialized agents, memory, and Vercel-ready repository assets. The generated system prioritizes ${
      client.objective || "execution clarity"
    } across ${client.industry || "the organization"}.`,
    bottlenecks: [
      "Context is scattered across documents, transcripts, screenshots, and operator notes.",
      "Workflow ownership is vulnerable during sales-to-delivery and executive handoffs.",
      "Decision memory is not consistently written back into a system of record.",
      "Deployment knowledge needs to be packaged as runnable repository infrastructure."
    ],
    workflows,
    agents,
    memoryDesign: [
      "company_profile: canonical client facts, stakeholders, constraints, and objective hierarchy",
      "workflow_state: active execution chains, SLAs, owners, blockers, and completion evidence",
      "decision_log: executive decisions, assumptions, reversals, and escalation rationale",
      "repo_structure: generated source files, prompts, integrations, and deployment instructions"
    ],
    architecture: [
      "Next.js App Router frontend for client command center dashboards",
      "Serverless API route for orchestration using OpenAI with deterministic fallback mode",
      "Prompt library stored as versioned markdown files per agent",
      "Workflow and memory schemas committed alongside application code",
      "Vercel deployment with OPENAI_API_KEY managed as an environment secret"
    ],
    executionChains: orchestrationStates,
    deploymentTargets: [
      "Vercel",
      "GitHub",
      "OpenAI API",
      "Optional CRM/helpdesk/project management integrations"
    ]
  };
}

const openAiEnvVars = [
  "OPENAI_API_KEY",
  "OPEN_AI_API_KEY"
] as const;

function getOpenAIApiKey() {
  for (const name of openAiEnvVars) {
    const value = process.env[name]?.trim();

    if (value) {
      return { name, value };
    }
  }

  return null;
}

function assertAnalysisResult(result: Partial<AnalysisResult>) {
  if (
    !result.summary ||
    !Array.isArray(result.workflows) ||
    !Array.isArray(result.agents)
  ) {
    throw new Error("OpenAI returned incomplete analysis JSON");
  }
}

const systemPrompt = `You are Eternity Operator Workspace, an operational intelligence compiler.

Return strict JSON matching this TypeScript shape:

{
  client,
  summary,
  bottlenecks: string[],
  workflows: {
    name,
    trigger,
    steps: string[],
    automation,
    owner
  }[],
  agents: {
    name,
    role,
    goals: string[],
    permissions: string[],
    memory: string[],
    escalation
  }[],
  memoryDesign: string[],
  architecture: string[],
  executionChains: string[],
  deploymentTargets: string[]
}

Use only the supplied client profile, uploaded intelligence, and operator context.

Generate a fresh, client-specific operational system from the provided context.

Do not copy fallback/demo templates or invent generic placeholder data.

Include repository and deployment implications.`;

export async function POST(request: Request) {
  const payload = (await request.json()) as AnalyzeRequest;

  const fallback = deterministicAnalysis(payload);

  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    return NextResponse.json({
      result: fallback,
      mode: "deterministic-fallback",
      states: orchestrationStates,
      source: "deterministic-fallback",
      successMessage: null,
      openai: {
        configured: false,
        checkedEnvVars: openAiEnvVars
      }
    });
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey.value
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: JSON.stringify(payload)
        }
      ],
      response_format: {
        type: "json_object"
      },
      temperature: 0.35
    });

    const content =
      completion.choices[0]?.message.content ?? "{}";

    const parsed =
      JSON.parse(content) as Partial<AnalysisResult>;

    const result: AnalysisResult = {
      ...fallback,
      ...parsed,

      workflows: Array.isArray(parsed.workflows)
        ? parsed.workflows
        : fallback.workflows,

      agents: Array.isArray(parsed.agents)
        ? parsed.agents
        : fallback.agents,

      memoryDesign: Array.isArray(parsed.memoryDesign)
        ? parsed.memoryDesign
        : fallback.memoryDesign,

      architecture: Array.isArray(parsed.architecture)
        ? parsed.architecture
        : fallback.architecture,

      executionChains: Array.isArray(parsed.executionChains)
        ? parsed.executionChains
        : fallback.executionChains,

      deploymentTargets: Array.isArray(parsed.deploymentTargets)
        ? parsed.deploymentTargets
        : fallback.deploymentTargets
    };

    assertAnalysisResult(result);

    return NextResponse.json({
      result,
      mode: "openai",
      source: "openai",
      successMessage:
        "✅ OpenAI generation received successfully.",
      states: orchestrationStates,
      openai: {
        configured: true,
        envVar: apiKey.name,
        completionId: completion.id,
        model: completion.model,
        finishReason:
          completion.choices[0]?.finish_reason,
        contentLength: content.length
      }
    });
  } catch (error) {
    return NextResponse.json({
      result: fallback,
      mode: "fallback-after-openai-error",
      states: orchestrationStates,
      source: "deterministic-fallback",
      successMessage: null,
      openai: {
        configured: true,
        envVar: apiKey.name
      },
      error:
        error instanceof Error
          ? error.message
          : "Unknown error"
    });
  }
}

export async function GET() {
  const apiKey = getOpenAIApiKey();

  return NextResponse.json({
    ok: true,
    runtime: "nodejs",
    vercelEnv: process.env.VERCEL_ENV ?? "local",
    openai: apiKey
      ? {
          configured: true,
          envVar: apiKey.name
        }
      : {
          configured: false,
          checkedEnvVars: openAiEnvVars
        }
  });
}
