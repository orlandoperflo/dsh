import type { AgentSpec, AnalysisResult, RepoFile, Workflow } from "./operator-types";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "client-operating-system";

const json = (value: unknown) => JSON.stringify(value, null, 2);

const safeArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
};

const agentPrompt = (agent: AgentSpec) => {
  const goals = safeArray(agent.goals);
  const permissions = safeArray(agent.permissions);
  const memory = safeArray(agent.memory);

  return `# ${agent.name}

## Role
${agent.role}

## Goals
${goals.map((goal) => `- ${goal}`).join("\n")}

## Permissions
${permissions.map((permission) => `- ${permission}`).join("\n")}

## Memory Access
${memory.map((item) => `- ${item}`).join("\n")}

## Escalation
${agent.escalation}

## Operating Prompt
You are ${agent.name}. Convert incoming company context into concrete operational actions. Ask for missing data only when execution risk is high. Maintain concise, auditable reasoning and produce next actions, owners, deadlines, and system updates.`;
};

const workflowMarkdown = (workflow: Workflow) => {
  const steps = safeArray(workflow.steps);

  return `# ${workflow.name}

**Trigger:** ${workflow.trigger}

**Owner:** ${workflow.owner}

## Execution Chain
${steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}

## Automation Opportunity
${workflow.automation}
`;
};

export function generateRepository(analysis: AnalysisResult) {
  const repoName = `${slugify(analysis.client.name)}-operating-system`;

  analysis.agents = analysis.agents.map((agent) => ({
    ...agent,
    goals: safeArray(agent.goals),
    permissions: safeArray(agent.permissions),
    memory: safeArray(agent.memory)
  }));

  analysis.workflows = analysis.workflows.map((workflow) => ({
    ...workflow,
    steps: safeArray(workflow.steps)
  }));

  analysis.memoryDesign = safeArray(analysis.memoryDesign);
  analysis.executionChains = safeArray(analysis.executionChains);
  analysis.architecture = safeArray(analysis.architecture);
  analysis.deploymentTargets = safeArray(analysis.deploymentTargets);

  const agentImports = analysis.agents
    .map((agent) => `- ${agent.name}: ${agent.role}`)
    .join("\n");

  const packageJson = {
    name: repoName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      typecheck: "tsc --noEmit"
    },
    dependencies: {
      next: "latest",
      react: "latest",
      "react-dom": "latest",
      openai: "latest",
      zod: "latest"
    },
    devDependencies: {
      typescript: "latest",
      "@types/node": "latest",
      "@types/react": "latest",
      "@types/react-dom": "latest",
      tailwindcss: "latest",
      postcss: "latest",
      autoprefixer: "latest"
    }
  };

  const files: RepoFile[] = [
    {
      path: "package.json",
      language: "json",
      content: json(packageJson)
    },
    {
      path: ".env.example",
      language: "dotenv",
      content:
        "OPENAI_API_KEY=\nNEXT_PUBLIC_CLIENT_NAME=\"" +
        analysis.client.name +
        "\"\n"
    },
    {
      path: "README.md",
      language: "markdown",
      content: `# ${analysis.client.name} Operating System

${analysis.summary}

## Run locally

\`\`\`bash
npm install
npm run dev
\`\`\`

## Generated intelligence

- Workflows: ${analysis.workflows.length}
- Agents: ${analysis.agents.length}
- Deployment targets: ${analysis.deploymentTargets.join(", ")}

## Agent ecosystem
${agentImports}
`
    },
    {
      path: "docs/architecture.md",
      language: "markdown",
      content: `# Deployment Architecture

${analysis.architecture.map((item) => `- ${item}`).join("\n")}

## Memory design
${analysis.memoryDesign.map((item) => `- ${item}`).join("\n")}

## Execution chains
${analysis.executionChains.map((item) => `- ${item}`).join("\n")}
`
    },
    {
      path: "app/page.tsx",
      language: "tsx",
      content: `import { agents, workflows } from "../lib/operating-system";

export default function Page() {
  return (
    <main style={{ minHeight: "100vh", background: "#07080c", color: "#f7f3ea", padding: 48, fontFamily: "Inter, system-ui" }}>
      <p style={{ color: "#d8b56d", letterSpacing: 3, textTransform: "uppercase" }}>${analysis.client.industry} Operating System</p>
      <h1 style={{ fontSize: 56, maxWidth: 920, lineHeight: 1 }}>
        ${analysis.client.name} AI Operations Command Center
      </h1>

      <p style={{ color: "#aab2c0", maxWidth: 760, fontSize: 18 }}>
        ${analysis.summary.replace(/`/g, "'")}
      </p>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 40 }}>
        {agents.map((agent) => (
          <article
            key={agent.name}
            style={{
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 24,
              padding: 24,
              background: "rgba(255,255,255,.04)"
            }}
          >
            <h2>{agent.name}</h2>
            <p style={{ color: "#aab2c0" }}>{agent.role}</p>
          </article>
        ))}
      </section>

      <section style={{ marginTop: 44 }}>
        <h2>Workflow control plane</h2>

        {workflows.map((workflow) => (
          <details
            key={workflow.name}
            style={{
              marginTop: 14,
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 18,
              padding: 18
            }}
          >
            <summary>{workflow.name}</summary>

            <ol>
              {workflow.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </details>
        ))}
      </section>
    </main>
  );
}
`
    },
    {
      path: "app/api/orchestrate/route.ts",
      language: "ts",
      content: `import OpenAI from "openai";
import { NextResponse } from "next/server";
import { agents, workflows } from "../../../lib/operating-system";

export async function POST(request: Request) {
  const body = await request.json();

  const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

  const system = \`You are the ${analysis.client.name} orchestration layer. Available agents: ${analysis.agents
        .map((agent) => agent.name)
        .join(", ")}. Available workflows: ${analysis.workflows
        .map((workflow) => workflow.name)
        .join(", ")}. Return JSON with selectedAgent, workflow, nextActions, escalationRisk.\`;

  if (!openai) {
    return NextResponse.json({
      selectedAgent: agents[0]?.name,
      workflow: workflows[0]?.name,
      nextActions: workflows[0]?.steps ?? [],
      escalationRisk: "medium",
      mode: "deterministic-fallback"
    });
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify(body) }
    ],
    response_format: { type: "json_object" }
  });

  return NextResponse.json(
    JSON.parse(completion.choices[0]?.message.content ?? "{}")
  );
}
`
    },
    {
      path: "lib/operating-system.ts",
      language: "ts",
      content: `export const agents = ${json(analysis.agents)} as const;

export const workflows = ${json(analysis.workflows)} as const;

export const memoryDesign = ${json(analysis.memoryDesign)} as const;
`
    },
    {
      path: "deployment/vercel.md",
      language: "markdown",
      content: `# Vercel deployment

1. Create a new GitHub repository and copy this generated structure into it.
2. Add OPENAI_API_KEY in Vercel Project Settings.
3. Deploy with the Next.js preset.
4. Verify /api/orchestrate with a production incident or workflow payload.
`
    }
  ];

  analysis.agents.forEach((agent) => {
    files.push({
      path: `agents/${slugify(agent.name)}.md`,
      language: "markdown",
      content: agentPrompt(agent)
    });

    files.push({
      path: `prompts/${slugify(agent.name)}.prompt.md`,
      language: "markdown",
      content: agentPrompt(agent)
    });
  });

  analysis.workflows.forEach((workflow) => {
    files.push({
      path: `workflows/${slugify(workflow.name)}.md`,
      language: "markdown",
      content: workflowMarkdown(workflow)
    });
  });

  files.push({
    path: "memory/schema.json",
    language: "json",
    content: json({
      client: analysis.client,
      memoryNamespaces: analysis.memoryDesign,
      bottlenecks: analysis.bottlenecks
    })
  });

  files.push({
    path: "integrations/registry.json",
    language: "json",
    content: json({
      targets: analysis.deploymentTargets,
      requiredSecrets: ["OPENAI_API_KEY"],
      optionalIntegrations: ["slack", "hubspot", "linear", "notion"]
    })
  });

  return {
    name: repoName,
    description: `Deployable operational intelligence repository for ${analysis.client.name}.`,
    files,
    tree: files.map((file) => file.path).sort(),
    installCommand: "npm install",
    devCommand: "npm run dev",
    deploymentNotes: [
      "Copy all generated files into a new Git repository.",
      "Create .env.local from .env.example and provide OPENAI_API_KEY.",
      "Run npm install and npm run dev locally before connecting the repo to Vercel."
    ]
  };
}
