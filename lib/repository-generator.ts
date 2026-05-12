import type { AgentSpec, AnalysisResult, RepoFile, Workflow } from "./operator-types";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "client-operating-system";

const json = (value: unknown) => JSON.stringify(value, null, 2);

const agentPrompt = (agent: AgentSpec) => `# ${agent.name}\n\n## Role\n${agent.role}\n\n## Goals\n${agent.goals.map((goal) => `- ${goal}`).join("\n")}\n\n## Permissions\n${agent.permissions.map((permission) => `- ${permission}`).join("\n")}\n\n## Memory Access\n${agent.memory.map((memory) => `- ${memory}`).join("\n")}\n\n## Escalation\n${agent.escalation}\n\n## Operating Prompt\nYou are ${agent.name}. Convert incoming company context into concrete operational actions. Ask for missing data only when execution risk is high. Maintain concise, auditable reasoning and produce next actions, owners, deadlines, and system updates.`;

const workflowMarkdown = (workflow: Workflow) => `# ${workflow.name}\n\n**Trigger:** ${workflow.trigger}\n\n**Owner:** ${workflow.owner}\n\n## Execution Chain\n${workflow.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}\n\n## Automation Opportunity\n${workflow.automation}\n`;

export function generateRepository(analysis: AnalysisResult) {
  const repoName = `${slugify(analysis.client.name)}-operating-system`;
  const agentImports = analysis.agents
    .map((agent) => `- ${agent.name}: ${agent.role}`)
    .join("\\n");

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
      next: "15.3.8",
      react: "19.0.0",
      "react-dom": "19.0.0",
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
      content: "OPENAI_API_KEY=\nNEXT_PUBLIC_CLIENT_NAME=\"" + analysis.client.name + "\"\n"
    },
    {
      path: "README.md",
      language: "markdown",
      content: `# ${analysis.client.name} Operating System\n\n${analysis.summary}\n\n## Run locally\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n## Generated intelligence\n\n- Workflows: ${analysis.workflows.length}\n- Agents: ${analysis.agents.length}\n- Deployment targets: ${analysis.deploymentTargets.join(", ")}\n\n## Agent ecosystem\n${agentImports}\n`
    },
    {
      path: "docs/architecture.md",
      language: "markdown",
      content: `# Deployment Architecture\n\n${analysis.architecture.map((item) => `- ${item}`).join("\n")}\n\n## Memory design\n${analysis.memoryDesign.map((item) => `- ${item}`).join("\n")}\n\n## Execution chains\n${analysis.executionChains.map((item) => `- ${item}`).join("\n")}\n`
    },
    {
      path: "app/page.tsx",
      language: "tsx",
      content: `import { agents, workflows } from "../lib/operating-system";\n\nexport default function Page() {\n  return (\n    <main style={{ minHeight: "100vh", background: "#07080c", color: "#f7f3ea", padding: 48, fontFamily: "Inter, system-ui" }}>\n      <p style={{ color: "#d8b56d", letterSpacing: 3, textTransform: "uppercase" }}>${analysis.client.industry} Operating System</p>\n      <h1 style={{ fontSize: 56, maxWidth: 920, lineHeight: 1 }}> ${analysis.client.name} AI Operations Command Center</h1>\n      <p style={{ color: "#aab2c0", maxWidth: 760, fontSize: 18 }}>${analysis.summary.replace(/`/g, "'")}</p>\n      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 40 }}>\n        {agents.map((agent) => (\n          <article key={agent.name} style={{ border: "1px solid rgba(255,255,255,.12)", borderRadius: 24, padding: 24, background: "rgba(255,255,255,.04)" }}>\n            <h2>{agent.name}</h2>\n            <p style={{ color: "#aab2c0" }}>{agent.role}</p>\n          </article>\n        ))}\n      </section>\n      <section style={{ marginTop: 44 }}>\n        <h2>Workflow control plane</h2>\n        {workflows.map((workflow) => (\n          <details key={workflow.name} style={{ marginTop: 14, border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: 18 }}>\n            <summary>{workflow.name}</summary>\n            <ol>{workflow.steps.map((step) => <li key={step}>{step}</li>)}</ol>\n          </details>\n        ))}\n      </section>\n    </main>\n  );\n}\n`
    },
    {
      path: "app/api/orchestrate/route.ts",
      language: "ts",
      content: `import OpenAI from "openai";\nimport { NextResponse } from "next/server";\nimport { agents, workflows } from "../../../lib/operating-system";\n\nexport async function POST(request: Request) {\n  const body = await request.json();\n  const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;\n  const system = \`You are the ${analysis.client.name} orchestration layer. Available agents: ${analysis.agents.map((agent) => agent.name).join(", ")}. Available workflows: ${analysis.workflows.map((workflow) => workflow.name).join(", ")}. Return JSON with selectedAgent, workflow, nextActions, escalationRisk.\`;\n\n  if (!openai) {\n    return NextResponse.json({ selectedAgent: agents[0]?.name, workflow: workflows[0]?.name, nextActions: workflows[0]?.steps ?? [], escalationRisk: "medium", mode: "deterministic-fallback" });\n  }\n\n  const completion = await openai.chat.completions.create({\n    model: "gpt-4.1-mini",\n    messages: [{ role: "system", content: system }, { role: "user", content: JSON.stringify(body) }],\n    response_format: { type: "json_object" }\n  });\n\n  return NextResponse.json(JSON.parse(completion.choices[0]?.message.content ?? "{}"));\n}\n`
    },
    {
      path: "lib/operating-system.ts",
      language: "ts",
      content: `export const agents = ${json(analysis.agents)} as const;\n\nexport const workflows = ${json(analysis.workflows)} as const;\n\nexport const memoryDesign = ${json(analysis.memoryDesign)} as const;\n`
    },
    {
      path: "deployment/vercel.md",
      language: "markdown",
      content: `# Vercel deployment\n\n1. Create a new GitHub repository and copy this generated structure into it.\n2. Add \`OPENAI_API_KEY\` in Vercel Project Settings.\n3. Deploy with the Next.js preset.\n4. Verify \`/api/orchestrate\` with a production incident or workflow payload.\n`
    }
  ];

  analysis.agents.forEach((agent) => {
    files.push({ path: `agents/${slugify(agent.name)}.md`, language: "markdown", content: agentPrompt(agent) });
    files.push({ path: `prompts/${slugify(agent.name)}.prompt.md`, language: "markdown", content: agentPrompt(agent) });
  });

  analysis.workflows.forEach((workflow) => {
    files.push({ path: `workflows/${slugify(workflow.name)}.md`, language: "markdown", content: workflowMarkdown(workflow) });
  });

  files.push({ path: "memory/schema.json", language: "json", content: json({ client: analysis.client, memoryNamespaces: analysis.memoryDesign, bottlenecks: analysis.bottlenecks }) });
  files.push({ path: "integrations/registry.json", language: "json", content: json({ targets: analysis.deploymentTargets, requiredSecrets: ["OPENAI_API_KEY"], optionalIntegrations: ["slack", "hubspot", "linear", "notion"] }) });

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
