"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Boxes, BrainCircuit, CheckCircle2, ClipboardList, CloudUpload, Code2, Download, FileArchive, GitBranch, LayoutDashboard, Loader2, Network, Rocket, ShieldCheck, Sparkles, TerminalSquare } from "lucide-react";
import { useMemo, useState } from "react";
import type { AnalysisResult, ClientProfile, GeneratedRepository, UploadedIntelligence } from "@/lib/operator-types";

const defaultClient: ClientProfile = {
  name: "Northstar Health Group",
  industry: "Healthcare operations",
  stage: "Growth enterprise",
  objective: "reduce intake latency, preserve institutional memory, and generate a client-ready AI operations system"
};

const orchestrationStates = [
  "analyzing company",
  "mapping workflows",
  "generating agents",
  "designing memory",
  "generating deployment architecture"
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function readFile(file: File): Promise<UploadedIntelligence> {
  const textLike = /text|markdown|json|csv|xml|yaml|pdf/.test(file.type) || /\.(md|txt|csv|json|pdf|transcript)$/i.test(file.name);
  const content = textLike
    ? await file.text().catch(() => `[Binary or protected file: ${file.name}]`)
    : `[Visual intelligence asset: ${file.name}. Type ${file.type || "unknown"}. Size ${formatBytes(file.size)}. Use this screenshot as operational evidence during analysis.]`;

  return { name: file.name, type: file.type || "unknown", size: file.size, content: content.slice(0, 24000) };
}

function copyRepository(repository: GeneratedRepository) {
  const payload = repository.files.map((file) => `--- ${file.path} ---\n${file.content}`).join("\n\n");
  return navigator.clipboard.writeText(payload);
}

function sanitizeZipPath(path: string) {
  return path
    .replace(/^\/+/, "")
    .replace(/\\/g, "/")
    .split("/")
    .filter((segment) => segment && segment !== "." && segment !== "..")
    .join("/");
}

function sanitizeFileName(name: string) {
  return (name || "generated-repository")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "") || "generated-repository";
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function uint16(value: number) {
  return [value & 0xff, (value >>> 8) & 0xff];
}

function uint32(value: number) {
  return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
}

function createRepositoryZip(repository: GeneratedRepository) {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];
  let offset = 0;
  let entryCount = 0;

  for (const file of repository.files) {
    const path = sanitizeZipPath(file.path);
    if (!path) continue;

    const name = encoder.encode(path);
    const content = encoder.encode(file.content);
    const checksum = crc32(content);
    const localHeader = new Uint8Array([
      ...uint32(0x04034b50),
      ...uint16(20),
      ...uint16(0x0800),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint32(checksum),
      ...uint32(content.length),
      ...uint32(content.length),
      ...uint16(name.length),
      ...uint16(0)
    ]);

    chunks.push(localHeader, name, content);

    centralDirectory.push(new Uint8Array([
      ...uint32(0x02014b50),
      ...uint16(20),
      ...uint16(20),
      ...uint16(0x0800),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint32(checksum),
      ...uint32(content.length),
      ...uint32(content.length),
      ...uint16(name.length),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint32(0),
      ...uint32(offset)
    ]), name);

    offset += localHeader.length + name.length + content.length;
    entryCount += 1;
  }

  const centralDirectorySize = centralDirectory.reduce((size, chunk) => size + chunk.length, 0);
  const endOfCentralDirectory = new Uint8Array([
    ...uint32(0x06054b50),
    ...uint16(0),
    ...uint16(0),
    ...uint16(entryCount),
    ...uint16(entryCount),
    ...uint32(centralDirectorySize),
    ...uint32(offset),
    ...uint16(0)
  ]);

  return new Blob([...chunks, ...centralDirectory, endOfCentralDirectory], { type: "application/zip" });
}

function downloadRepositoryZip(repository: GeneratedRepository) {
  const blob = createRepositoryZip(repository);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFileName(repository.name)}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function OperatorWorkspace() {
  const [client, setClient] = useState<ClientProfile>(defaultClient);
  const [operatorContext, setOperatorContext] = useState("Interview notes: intake teams lose context during handoffs, executives need weekly exception reports, sales follow-up is inconsistent, and deployment should be Vercel-ready with OpenAI-powered orchestration.");
  const [uploads, setUploads] = useState<UploadedIntelligence[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [repository, setRepository] = useState<GeneratedRepository | null>(null);
  const [activeState, setActiveState] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingRepo, setIsGeneratingRepo] = useState(false);
  const [mode, setMode] = useState<string>("ready");
  const [modeDetails, setModeDetails] = useState<string>("Vercel server runtime will check OPENAI_API_KEY when orchestration runs.");
  const [generationStatus, setGenerationStatus] = useState<"idle" | "pending" | "success" | "fallback">("idle");

  const readiness = useMemo(() => {
    const score = [client.name, client.industry, client.objective, operatorContext].filter(Boolean).length + Math.min(uploads.length, 3);
    return Math.min(100, Math.round((score / 7) * 100));
  }, [client, operatorContext, uploads.length]);

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const parsed = await Promise.all(Array.from(files).map(readFile));
    setUploads((current) => [...parsed, ...current]);
  }

  async function runAnalysis() {
    setIsAnalyzing(true);
    setRepository(null);
    setMode("orchestrating");
    setGenerationStatus("pending");
    setModeDetails("Checking the server-side Vercel environment for an OpenAI key...");
    const ticker = setInterval(() => setActiveState((state) => (state + 1) % orchestrationStates.length), 700);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client, uploads, operatorContext })
      });

      if (!response.ok) {
        throw new Error(`Analysis request failed with ${response.status}`);
      }

      const payload = await response.json();

      if (!payload.result) {
        throw new Error("Analysis route did not return a result.");
      }

      setAnalysis(payload.result);
      setMode(payload.mode);
      setGenerationStatus(payload.mode === "openai" ? "success" : "fallback");
      setModeDetails(payload.mode === "openai"
        ? `${payload.successMessage ?? "✅ OpenAI generation received successfully."} Model: ${payload.openai?.model ?? "unknown"}. Completion: ${payload.openai?.completionId ?? "received"}.`
        : payload.openai?.configured
          ? `OpenAI key found in ${payload.openai.envVar}, but no live generation was received. Showing deterministic fallback. Error: ${payload.error ?? "Unknown OpenAI error"}`
          : `No OpenAI key found on the server. Showing deterministic fallback. Checked: ${(payload.openai?.checkedEnvVars ?? ["OPENAI_API_KEY"]).join(", ")}.`);
      setActiveState(orchestrationStates.length - 1);
      return payload.result as AnalysisResult;
    } catch (error) {
      setMode("analysis-error");
      setGenerationStatus("fallback");
      setModeDetails(error instanceof Error ? error.message : "Analysis failed before repository generation could run.");
      return null;
    } finally {
      clearInterval(ticker);
      setIsAnalyzing(false);
    }
  }

  async function generateRepo() {
    setIsGeneratingRepo(true);
    setRepository(null);
    try {
      const analysisForRepository = analysis ?? await runAnalysis();

      if (!analysisForRepository) {
        throw new Error("Run orchestration before generating the repository.");
      }

      const response = await fetch("/api/generate-repository", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisForRepository)
      });

      if (!response.ok) {
        throw new Error(`Repository request failed with ${response.status}`);
      }

      const payload = await response.json();

      if (!payload.repository) {
        throw new Error("Repository route did not return a repository.");
      }

      setRepository(payload.repository);
    } catch (error) {
      setMode("repository-error");
      setModeDetails(error instanceof Error ? error.message : "Repository generation failed.");
    } finally {
      setIsGeneratingRepo(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden text-platinum">
      <div className="pointer-events-none fixed inset-0 grid-fade opacity-40" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-gold">
              <Sparkles className="h-5 w-5 text-ember" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.28em] text-ember">ETERNITY</p>
              <p className="text-xs text-mist">Operator Workspace</p>
            </div>
          </div>
          <a href="#workspace" className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-platinum transition hover:border-ember/50">Open workspace</a>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-[1.05fr_.95fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-ember/20 bg-ember/10 px-4 py-2 text-sm text-ember">
              <ShieldCheck className="h-4 w-4" /> Enterprise operational intelligence compiler
            </div>
            <h1 className="max-w-4xl text-balance text-6xl font-semibold tracking-[-0.06em] text-platinum md:text-8xl">
              Upload a company. Generate its operating system.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-mist">
              Eternity converts client intelligence into workflows, AI agents, memory systems, deployment architecture, and production-ready repository structures operators can copy into a new client build.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href="#workspace" className="inline-flex items-center justify-center gap-2 rounded-full bg-platinum px-7 py-4 font-semibold text-night transition hover:bg-white">
                Generate infrastructure <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#repo" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-7 py-4 font-semibold text-platinum transition hover:border-signal/50">
                See repository output <Code2 className="h-4 w-4" />
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }} className="glass-panel rounded-[2rem] p-5">
            <div className="rounded-[1.5rem] border border-white/10 bg-night/60 p-5">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-mist">Orchestration state</p>
                <span className="rounded-full bg-signal/10 px-3 py-1 text-xs text-signal">Vercel serverless</span>
              </div>
              <div className="space-y-4">
                {orchestrationStates.map((state, index) => (
                  <div key={state} className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${index <= activeState ? "bg-ember shadow-gold" : "bg-white/15"}`} />
                    <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="font-medium capitalize">{state}</p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-ember to-signal" style={{ width: index <= activeState ? "100%" : "18%" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="workspace" className="relative mx-auto grid max-w-7xl gap-6 px-6 pb-24 lg:grid-cols-[.88fr_1.12fr] lg:px-8">
        <div className="space-y-6">
          <Panel icon={<LayoutDashboard className="h-5 w-5" />} title="Client dashboard" subtitle="Create the client profile and deployment objective.">
            <div className="grid gap-3">
              <Input label="Client" value={client.name} onChange={(name) => setClient({ ...client, name })} />
              <Input label="Industry" value={client.industry} onChange={(industry) => setClient({ ...client, industry })} />
              <Input label="Stage" value={client.stage} onChange={(stage) => setClient({ ...client, stage })} />
              <label className="text-sm text-mist">Deployment objective</label>
              <textarea className="min-h-28 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-platinum outline-none transition focus:border-ember/50" value={client.objective} onChange={(event) => setClient({ ...client, objective: event.target.value })} />
            </div>
          </Panel>

          <Panel icon={<CloudUpload className="h-5 w-5" />} title="Upload intelligence" subtitle="Markdown, PDFs, text, screenshots, transcripts, notes, and exports.">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.035] p-8 text-center transition hover:border-ember/50">
              <CloudUpload className="mb-4 h-9 w-9 text-ember" />
              <span className="font-semibold">Drop company intelligence</span>
              <span className="mt-1 text-sm text-mist">Files are read locally and sent to the analysis route.</span>
              <input type="file" multiple className="hidden" accept=".md,.txt,.pdf,.csv,.json,image/*" onChange={(event) => onFiles(event.target.files)} />
            </label>
            <div className="mt-4 space-y-2">
              {uploads.map((upload) => (
                <div key={`${upload.name}-${upload.size}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                  <span className="flex items-center gap-2"><FileArchive className="h-4 w-4 text-signal" /> {upload.name}</span>
                  <span className="text-mist">{formatBytes(upload.size)}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel icon={<BrainCircuit className="h-5 w-5" />} title="Analysis engine" subtitle="OpenAI-powered orchestration with deterministic fallback when no key is configured.">
            <textarea className="min-h-40 w-full rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-6 text-platinum outline-none transition focus:border-signal/50" value={operatorContext} onChange={(event) => setOperatorContext(event.target.value)} />
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-mist">Readiness</p>
                <div className="mt-2 h-2 w-44 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-ember to-signal" style={{ width: `${readiness}%` }} /></div>
              </div>
              <button onClick={runAnalysis} disabled={isAnalyzing} className="inline-flex items-center justify-center gap-2 rounded-full bg-ember px-6 py-3 font-semibold text-night transition hover:bg-[#f1cc82] disabled:cursor-not-allowed disabled:opacity-60">
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Network className="h-4 w-4" />} Run orchestration
              </button>
            </div>
            <div className={`mt-5 rounded-2xl border p-4 ${generationStatus === "success" ? "border-signal/40 bg-signal/10" : generationStatus === "fallback" ? "border-ember/40 bg-ember/10" : "border-white/10 bg-white/[0.03]"}`}>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-platinum">
                {generationStatus === "success" ? <CheckCircle2 className="h-4 w-4 text-signal" /> : <ShieldCheck className="h-4 w-4 text-ember" />} Mode: {mode}
              </p>
              <p className="mt-2 text-xs leading-5 text-mist">{modeDetails}</p>
            </div>
          </Panel>

          <AnimatePresence>
            {analysis && (
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}>
                <Panel icon={<Boxes className="h-5 w-5" />} title="Intelligence dashboard" subtitle="Bottlenecks, workflows, agent ecosystem, operational maps, and execution chains.">
                  <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${generationStatus === "success" ? "border-signal/40 bg-signal/10 text-platinum" : "border-ember/40 bg-ember/10 text-mist"}`}>
                    {generationStatus === "success" ? "✅ Live OpenAI generation received. The dashboard below is model-generated from the submitted context." : "Fallback template shown. OpenAI did not return a live generation for this run."}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Metric label="Agents" value={analysis.agents.length} />
                    <Metric label="Workflows" value={analysis.workflows.length} />
                  </div>
                  <p className="mt-5 leading-7 text-mist">{analysis.summary}</p>
                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <Stack title="Bottlenecks" items={analysis.bottlenecks} />
                    <Stack title="Memory design" items={analysis.memoryDesign} />
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {analysis.agents.map((agent) => <Card key={agent.name} title={agent.name} body={agent.role} />)}
                  </div>
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section id="repo" className="relative mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <Panel icon={<GitBranch className="h-5 w-5" />} title="Repository generator" subtitle="Creates real client repo structures, prompts, workflows, starter code, architecture docs, env configs, and deployment instructions.">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-semibold tracking-tight">Production-ready client repository output</h3>
              <p className="mt-2 text-mist">Generate a copyable file tree that includes Next.js starter code, an orchestration API route, agent prompts, workflow markdown, memory schema, integration registry, and Vercel deployment notes.</p>
            </div>
            <button onClick={generateRepo} disabled={isAnalyzing || isGeneratingRepo} className="inline-flex items-center justify-center gap-2 rounded-full bg-platinum px-6 py-3 font-semibold text-night transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">
              {isGeneratingRepo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />} {analysis ? "Generate repository" : "Run orchestration + generate"}
            </button>
          </div>

          {repository ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-[.42fr_.58fr]">
              <div className="rounded-3xl border border-white/10 bg-night/60 p-5">
                <p className="text-sm uppercase tracking-[0.22em] text-ember">{repository.name}</p>
                <p className="mt-3 text-mist">{repository.description}</p>
                <div className="mt-6 space-y-2 font-mono text-sm text-mist">
                  {repository.tree.map((file) => <p key={file}>/{file}</p>)}
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button onClick={() => copyRepository(repository)} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold transition hover:border-ember/50">
                    <ClipboardList className="h-4 w-4" /> Copy all files
                  </button>
                  <button onClick={() => downloadRepositoryZip(repository)} className="inline-flex items-center justify-center gap-2 rounded-full bg-ember px-5 py-3 text-sm font-semibold text-night transition hover:bg-[#f1cc82]">
                    <Download className="h-4 w-4" /> Download ZIP
                  </button>
                </div>
              </div>
              <div className="max-h-[680px] overflow-auto rounded-3xl border border-white/10 bg-[#050608] p-5">
                {repository.files.map((file) => (
                  <details key={file.path} className="group border-b border-white/10 py-4" open={file.path === "README.md" || file.path === "app/api/orchestrate/route.ts"}>
                    <summary className="flex cursor-pointer list-none items-center gap-2 font-mono text-sm text-signal"><TerminalSquare className="h-4 w-4" /> {file.path}</summary>
                    <pre className="mt-4 overflow-x-auto rounded-2xl bg-white/[0.04] p-4 text-xs leading-5 text-mist"><code>{file.content}</code></pre>
                  </details>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center text-mist">
              Click “Run orchestration + generate” to create the deployable repository in one pass, or run orchestration first to preview the intelligence dashboard.
            </div>
          )}
        </Panel>
      </section>
    </main>
  );
}

function Panel({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="glass-panel rounded-[2rem] p-5 md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-ember">{icon}</div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-mist">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm text-mist">
      {label}
      <input className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-platinum outline-none transition focus:border-ember/50" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-mist">{label}</p>
      <p className="mt-2 text-4xl font-semibold">{value}</p>
    </div>
  );
}

function Stack({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-night/40 p-5">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => <p key={item} className="flex gap-2 text-sm leading-6 text-mist"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-ember" /> {item}</p>)}
      </div>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-mist">{body}</p>
    </article>
  );
}
