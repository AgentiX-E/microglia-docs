# Microglia — Technical Design

**Headless feedback flywheel for agentic workflows**

Version 1.0 · 2026-10-20 · Author: Lambertyan · Status: implementation-ready

---

## 0. Reading guide

| Section | Answers |
|---|---|
| §1–2 | What must be true, and what is deliberately excluded |
| §3–4 | How the packages are laid out and how data is shaped |
| §5 | The exact public API and its error codes |
| §6 | The algorithms, with formulas |
| §7 | The security model |
| §8 | Whether Cortex can be the memory layer (and how far) |
| §9–10 | Performance and testing |
| §11 | The evaluation protocol for public benchmarks |
| §12 | What the POC actually measured |
| §13–15 | Operations, decisions, and the gap register |

Every number in §12 is produced by `pnpm check` in this repository. Every API in §5 exists in
`packages/*/src`. Where the document describes something not yet built, it is marked **PLANNED** and
appears in the gap register (§15).

---

## 1. Requirements

### 1.1 Functional

| ID | Requirement | Acceptance |
|---|---|---|
| F1 | Capture a generation with its input, output, model, prompt version, and injected knowledge ids | `RunRecord` round-trips through JSONL |
| F2 | Capture thumbs, edits, preferences, execution outcomes, clarifications, abstentions | Six signal types, each with a trust value |
| F3 | Normalise an edit into structural ops, hashes, and a semantic distance | `signal.ops.length > 0`, `distance ∈ [0,1]`; empty edit rejected |
| F4 | Distil feedback into scoped, evidence-weighted knowledge | `created/merged/generalized/quarantined` counts reported |
| F5 | Merge repeated claims; generalise across domains; contradict same-scope claims | One item per claim, N evidence refs |
| F6 | Recall active knowledge for a query, bounded by a character budget | `KnowledgePack.rendered.length ≤ budget` |
| F7 | Render knowledge as data that cannot escape its block | `<` escaped; one closing tag |
| F8 | Attribute outcomes back to the knowledge that was injected | `applied`/`succeeded` updated once per (run, item) |
| F9 | Export SFT / DPO / KTO / eval datasets as JSONL | Self-describing header + rows |
| F10 | Diagnose store integrity | Named issue codes, no throws on healthy data |
| F11 | Isolate namespaces | Zero cross-namespace retrieval (tested) |
| F12 | Export to a Cortex-compatible projection | `MemoryValue` + `Fact` written and readable |

### 1.2 Non-functional

| ID | Requirement | Target | Measured |
|---|---|---|---|
| N1 | Zero runtime dependencies in core/capture/apply/distill | 0 | 0 |
| N2 | Browser-safe core (no Node built-ins) | yes | core imports only relative modules |
| N3 | Deterministic replay | same seed → same ids and packs | tested |
| N4 | Added latency on the request path | p95 ≤ 50ms | 0.02ms at 6 items (POC scale) |
| N5 | Added prompt size | ≤ 300 tokens | 90 tokens (POC) |
| N6 | Coverage | ≥95% on every dimension | **100 / 99.53 / 100 / 100** (lines / branches / functions / statements) |
| N7 | Branch coverage | ≥95% | **99.53%** — the bar is met; the seven remaining arms are named in §10.3 |
| N8 | No network in tests | 0 calls | 0 |
| N9 | No mocks of the system under test | ports only | fakes only for `Storage`/`LLM` |
| N10 | ESM-only, tree-shakable | `sideEffects: false` | declared |
| N11 | **CPU or WebGPU only** | no CUDA/ROCm, no local GPU runtime | CI runs on CPU; no GPU dependency |
| N12 | Memory at 10k items | ≤100 MB heap | **13.9 MB** measured |
| N13 | `recall` p95 at 10k items | ≤50 ms | **3.10 ms** measured |

N7 is deliberately reported as a miss rather than rounded up. §15.2 (E1) lists the remediation.

---

## 2. Constraints and non-goals

**Constraints**

1. The host owns the UI. Microglia never imports a UI framework, renders a component, or opens a socket.
2. One deployment is one tenant. A `namespace` string is an isolation boundary, not a billing unit.
3. Cortex is not on npm (verified 2026-10-20: `npm view @agentix-e/cortex-core` → 404). No hard dependency.
4. The library must work with no LLM at all. Every algorithmic path has a deterministic fallback.
5. Every persisted artefact must be inspectable with `cat`. Hence JSONL, not a binary store.
6. **The product must run on a CPU or in a browser with WebGPU.** No CUDA, no ROCm, no local GPU
   runtime, no fine-tuning. If a feature needs a GPU, it is not a product feature; it is an export
   target for someone else's training job.
7. The library may call a hosted LLM or embedding API that the host supplies, but it must not
   require one: every code path has a no-model fallback.

**Non-goals**

- Vector search, ANN indexes, or a database server.
- A training pipeline, GPU scheduling, or evaluation of fine-tuned models.
- Multi-tenant auth, SSO, RBAC, or a control plane.
- Annotation queues, dashboards, or reviewer workflows.
- Chart rendering, SQL execution, or schema introspection.

---

## 3. Architecture

### 3.1 Context

```mermaid
flowchart LR
  subgraph Host["Host application (nl2charts)"]
    UI["HITL UI: thumbs / editor / result panel"]
    GEN["Generator: LLM + SQL engine + chart renderer"]
    HOOK["Integration hooks"]
  end

  subgraph MG["microglia (in-process)"]
    CAP["capture"]
    DIS["distill"]
    APP["apply"]
    MEM["memory"]
    CORE["core"]
  end

  subgraph Storage["Local, host-owned"]
    J["JSONL journal"]
    SQL["SQLite (PLANNED)"]
    CX["Cortex store (optional projection)"]
  end

  UI --> HOOK
  GEN --> HOOK
  HOOK -->|begin/complete/feedback| CAP
  HOOK -->|recall| APP
  APP --> MEM
  CAP --> MEM
  DIS --> MEM
  MEM --> CORE
  APP --> CORE
  CAP --> CORE
  MEM --> J
  MEM -.-> SQL
  CAP -.->|project| CX
  DIS -.->|project| CX

  HOOK -->|distill, export, doctor| CAP
```

### 3.2 Packages and dependency rules

Three packages, split by **deployment**, not by capability:

```
packages/
  core/      src/{kernel,memory,distill,apply,capture,providers}
  node/      src/{app,server,providers/*,store/cortex}
  browser/   src/{client,outbox}
  eval/      the benchmark instrument (private, never published)
```

| Package | Depends on | Runtime deps | Browser | Why it exists |
|---|---|---|---|---|
| `core` | — | **0** | ✅ | The whole mechanism: contracts, store, distillation, pack, facade, provider contracts |
| `node` | core | `hono`, `@hono/node-server` | ❌ | An HTTP boundary, the journal, vendor providers, the cortex projection |
| `browser` | core | **0** | ✅ | Recall and feedback from a tab, with an outbox that survives a reload |
| `eval` | core | 0 | ❌ | Measurement, gates, the study; a benchmark has to own its workload |

`core` exposes five module subpaths (`core/memory`, `core/distill`, `core/apply`, `core/capture`,
`core/kernel`, `core/providers`). **One install does not have to mean one bundle**: a host that only
retrieves imports `core/apply` and `core/memory`, and the distiller never enters its graph.

**Rules, enforced by `tsc -b` and by the repository audit:**

1. `kernel` imports nothing outside itself. No `node:*`, no vendor SDK, no schema library.
2. Dependencies point downward only: `capture → {distill, apply, memory} → kernel`.
3. `node` and `browser` are outside the library's graph: `core` never imports either, and `browser`
   never imports `node`.
4. `eval` is a leaf. No product package imports it, so the harness cannot become part of the product.
5. **Exactly one package may have an external runtime dependency**, and the allowlist in
   `scripts/audit.mjs` names it (`node`: `hono`, `@hono/node-server`). A second dependency is a
   decision written in the audit, not a surprise in a lockfile.
6. The domain pack is not a package. A domain belongs to the host that has it; the chart pack the
   benchmark scores lives in `packages/eval/src/workload`.

**Why the capability packages were folded.** `memory → distill → apply → capture` was a chain with one
consumer each: every host installed all five, every release carried five manifests and five
tsconfigs, and the boundaries were never exercised by a second implementation. The boundaries that
matter — no I/O in the domain model, no store in the renderer, no model in the library — are module
boundaries, and they are still enforced, without five publish surfaces.

**What the split buys.** The server owns the credentials and the journal; the browser owns the
correction the user just typed; the library owns neither. That is also the reason `node` may take a
router: a server that cannot speak HTTP is not a server, and `core` pays nothing for it.

### 3.3 Dependency policy: adopt, or build?

The rule: **adopt undifferentiated infrastructure with a stable contract; build anything that
encodes product semantics, determinism, or a security boundary.** A dependency that decides what a
correction *means* is a dependency that owns the product.

**Adopt (runtime, optional peers only)**

| Package | Role | Why not build it | When it is loaded |
|---|---|---|---|
| `better-sqlite3` | Embedded SQL store | Mature, synchronous, WAL, well-tested | Only if the host chooses `SqliteStorage` |
| `pg` | Postgres store | Protocol correctness is not our product | Only in a multi-process deployment |
| `zod` | Validate LLM JSON | Hand-written validators are fine for five fields; a schema library is better for domain packs | Optional peer in `distill` |
| `@xenova/transformers` | On-device embeddings (ONNX/WASM or WebGPU) | Model runtime is not our product; WebGPU is optional and CPU is the floor | Optional peer |
| `onnxruntime-web` | WebGPU/WASM execution | Same reason; the host picks the backend | Optional, transitive |
| `@agentix-e/cortex-core` / `-node` / `-llm` | Cognitive memory substrate | Already built by the same org; see §8 | Optional projection |

None of these is a hard dependency. Only an adapter the host explicitly enables, or an optional
peer it chooses to install, pulls one in; the default install of `core`, `capture`, `apply`,
`distill`, and the `nl2charts` pack has none.

**Adopt (development only)**

| Package | Role | Why |
|---|---|---|
| `typescript` 5.7 | Types + project references | The API is the product |
| `vitest` + `@vitest/coverage-v8` | Tests + v8 coverage | Fast, ESM-native, no transform config |
| `tsup` | Release bundling (PLANNED) | ESM + d.ts in one step; the POC uses `tsc -b` |
| `changesets` | Versioning (PLANNED) | Multi-package releases with independent versions |
| `publint`, `@arethetypeswrong/cli` | Package correctness | Catches exports/types mistakes before publish |
| `size-limit` | Bundle budget (PLANNED) | A library that doubles a host bundle is not adopted twice |
| `fast-check` | Property tests (PLANNED) | Diff round-trip, merge idempotency, render bounds |
| `eslint` + `prettier` | Consistency | No semantic role |

**Build (the product)**

| Capability | Why it must be ours |
|---|---|
| `FeedbackEvent` / `Correction` model | No existing library models an edit as evidence with provenance |
| Scope semantics + generalisation | The core bet; a generic store cannot express it |
| Evidence fusion + admission + retirement | Determines what reaches a prompt; must be explainable |
| Contradiction resolution | A memory that cannot disagree with itself is not safe |
| Retrieval fusion (scope index + BM25 + MMR + budget) | Budget and determinism are product requirements |
| Rendering protocol | The injection boundary is ours to own |
| Credit assignment | Requires the run's pack; no store has it |
| Dataset export | The mapping from signals to SFT/DPO/KTO is a product decision |
| Evaluation harness + gates | The claim is the product; the instrument must be ours |
| Domain packs | The semantics of "chart type wrong" are domain knowledge |

**Rejected, with reasons**

| Candidate | Why not |
|---|---|
| LangChain / LlamaIndex | A framework dependency for five calls; brings retriever, prompt, and agent abstractions the host already has |
| Pinecone / Qdrant / pgvector | Operational surface with no benefit below ~1M items; scope filtering is the hard part, not ANN |
| React component library | Violates P1 (host owns UX) and imports a rendering framework into a data package |
| OpenTelemetry SDK | The host owns telemetry; we emit hooks, not a second tracing stack |
| `zod` in `core` | Zero-dependency and browser-safe are hard constraints; five validators do not justify 12KB |
| SQLite as the default | Native build breaks serverless and browser hosts; JSONL is inspectable and sufficient for one writer |
| PyTorch / CUDA / vLLM | Violates the CPU/WebGPU constraint and turns a library into an inference platform |
| Local fine-tuning | Out of scope by steering: the product exports data, it does not train |

### 3.4 The request path

```mermaid
sequenceDiagram
  participant H as Host
  participant A as apply
  participant M as memory
  participant C as capture
  participant D as distill

  H->>A: recall({task, text, scope, budget})
  A->>M: search(scope ∪ lexical)
  M-->>A: ranked active items
  A->>A: MMR + budget + render
  A-->>H: pack{items, ids, rendered, hash}
  H->>H: generate(pack.rendered)
  H->>C: begin({input, pack}) → complete(output)
  C->>M: putRun(record with knowledgeIds)
  H->>C: run.edit(after) / rate() / outcome()
  C->>M: appendEvent(event)
  C->>M: applyOutcome(item, success) for each applied id
  Note over D: offline
  H->>D: distill()
  D->>M: create / merge / generalise / contradict
```

---

## 4. Data model

### 4.1 Identity and invariants

| Invariant | Statement | Enforced by |
|---|---|---|
| I1 | A run is immutable after `complete()` | `RunHandle` throws `MG_E_RUN_COMMITTED` |
| I2 | Feedback cannot precede an output | `MG_E_NO_OUTPUT` |
| I3 | An event is append-only | `MemoryPort.appendEvent` has no update |
| I4 | A knowledge item is identified by `id`; a claim by `dedupeKey` | `dedupeKeyOf` |
| I5 | `namespace` is non-empty and never changes | constructor + `putKnowledge` guard |
| I6 | `support` is the sum of evidence weights (after merges) | `mergeEvidence` |
| I7 | `confidence` is derived, never authored | `scoreKnowledge` |
| I8 | `validUntil = Infinity` means "still asserted" | `Fact`/`KnowledgeItem` convention |
| I9 | A pack's `hash` is the hash of its rendered block | `makePack` |
| I10 | Persisted records must carry the schema this version understands | `assertSchema` on open |

### 4.2 Event schema (`microglia.feedback/1`)

| Field | Type | Meaning | Notes |
|---|---|---|---|
| `schema` | literal | Version | Bump = breaking change + migration |
| `id` | `fb_<time>_<rand>` | Sortable id | Monotonic time prefix |
| `at` | epoch ms | When observed | Injected clock |
| `namespace` | string | Tenancy | `[A-Za-z0-9][A-Za-z0-9._:-]{0,63}` |
| `sessionId` | string | Conversation/session | Host-provided or `default` |
| `runId` | string | The generation | Must exist for export |
| `task` | string | e.g. `chart.recommend` | Retrieval partition |
| `kind` | enum | rating/edit/preference/outcome/clarification/abstain | Mirrors `signal.type` |
| `actor` | `{type, idHash?}` | Who | Never a raw identity |
| `trust` | `[0,1]` | Weight ceiling | Derived, then capped by the host |
| `signal` | union | The payload | See below |
| `provenance` | object | Model, prompt, knowledge ids, retrieval hash | Copied from the run |
| `redactions` | int | Spans redacted before storage | Audit counter |

**Signal variants**

| `type` | Fields | Trust source |
|---|---|---|
| `rating` | `value: up/down`, `reasons[≤8]`, `comment≤500` | 0.6 with reasons, 0.45 bare, 0.5 for up |
| `edit` | `beforeHash`, `afterHash`, `ops[]`, `distance`, `after` | `0.5 + 0.4·clamp(distance/0.3)` |
| `preference` | `chosenRunId`, `rejectedRunId`, `criterion?` | 0.7 |
| `outcome` | `ok`, `code?`, `detail?` | 0.95 |
| `clarification` | `question≤300`, `answer≤1000` | 0.85 |
| `abstain` | `reason≤200` | 0.4 |

### 4.3 Knowledge schema (`microglia.knowledge/1`)

| Field | Type | Meaning |
|---|---|---|
| `namespace` | string | Isolation boundary |
| `kind` | `constraint \| exemplar \| negative \| lexicon \| procedure` | How it is used |
| `scope` | `{task, domain?, schemaDigest?, intent?, field?, reasonCode?}` | Where it applies; every present key must match |
| `statement` | string | One declarative sentence, rendered verbatim |
| `payload` | JSON? | Machine-usable predicate (chart constraint, exemplar pair) |
| `evidence[]` | `{feedbackId, runId, at, weight}` | Provenance |
| `support` | number | Σ weights |
| `contradictions` | int | Count of conflicts |
| `confidence` | `[0,1]` | Derived score |
| `trust` | `[0,1]` | Highest source trust seen |
| `validFrom/validUntil` | ms | World time |
| `systemFrom/systemUntil` | ms | System time |
| `status` | `candidate \| active \| quarantined \| retired \| conflicted` | Lifecycle |
| `applied/succeeded` | int | Empirical record |
| `createdAt/updatedAt` | ms | Audit |

### 4.4 Lifecycle

```mermaid
stateDiagram-v2
  [*] --> candidate: evidence admitted
  candidate --> quarantined: trust < 0.35
  quarantined --> candidate: reinstate()
  candidate --> active: confidence ≥ 0.6 ∧ support ≥ 0.8
  active --> candidate: contradiction (confidence drops)
  active --> retired: confidence < 0.45
  active --> retired: applied ≥ 3 ∧ success < 0.4
  candidate --> conflicted: contradictions > 1
  candidate --> retired: superseded by generalisation
  retired --> active: new trusted evidence (rehabilitation)
  conflicted --> candidate: contradiction count falls
```

Transitions are computed by `decideStatus` from the item's state, never set by callers. The only
manual escape hatches are `reinstate()` (review) and `expireKnowledge()` (policy change).

### 4.5 Run schema (`microglia.run/1`)

`input` and `output` are redacted JSON; `provenance.knowledgeIds` is the attribution key. Note that
`feedbackIds` is always `[]`: events link by `runId`, and duplicating the link on the run would create
two sources of truth that can disagree.

---

## 5. Public API

### 5.1 Quick start

```ts
import { openMicroglia } from '@agentix-e/microglia-capture';
import { EmbeddedMemory, JsonlJournal } from '@agentix-e/microglia-memory';
import { chartInterpreter, chartEditDistance } from '@agentix-e/microglia-nl2charts';
import { combineInterpreters, ruleInterpreter } from '@agentix-e/microglia-distill';

const store = await EmbeddedMemory.open(
  new JsonlJournal({ dir: '.microglia', compactOnOpen: true }),
);

const mg = await openMicroglia({
  app: 'nl2charts',
  namespace: 'acme',
  store,
  // Domain pack first, generic fallback second: ratings and clarifications
  // still produce lessons when the chart interpreter has nothing to say.
  interpreter: combineInterpreters(chartInterpreter, ruleInterpreter),
  editSemantics: chartEditDistance, // a mark change is a big edit
});

// 1. Recall
const pack = await mg.recall({
  task: 'chart.recommend',
  text: question,
  scope: { domain: 'sales', intent: 'trend' },
});

// 2. Generate with `pack.rendered` in the prompt
const output = await host.generate(question, pack.rendered);

// 3. Record
const run = mg.begin({ task: 'chart.recommend', input: { question, domain: 'sales' }, pack });
await run.complete(output);

// 4. Capture the human correction
await run.edit(editedSpec);

// 5. Learn (offline; safe to call on a cron)
await mg.distill();
```

### 5.2 Types

```ts
type MicrogliaOptions = {
  app: string;                      // 1..64 chars
  namespace: string;                // [A-Za-z0-9][A-Za-z0-9._:-]{0,63}
  store: MemoryPort;
  policy?: Partial<Policy>;
  clock?: Clock;                    // default: systemClock
  random?: RandomSource;            // default: Math.random
  interpreter?: Interpreter;        // default: ruleInterpreter
  budget?: number;                  // default: policy.defaultBudget (1200 chars)
  tag?: string;                     // renderer element name
  credit?: boolean;                 // default: true
  editSemantics?: (before: Json, after: Json) => number | undefined;
};

type RunStart = {
  task: string;                     // 1..120 chars
  input: JsonObject;
  sessionId?: string;               // default: 'default'
  pack?: KnowledgePack;             // sets knowledgeIds + retrievalHash
  model?: string; promptVersion?: string; appVersion?: string;
  domainPack?: string; schemaDigest?: string; metadata?: JsonObject;
};

type FeedbackInput =
  | { type: 'rating'; value: 'up' | 'down'; reasons?: readonly string[]; comment?: string }
  | { type: 'edit'; after: Json; note?: string }
  | { type: 'preference'; chosenRunId: string; rejectedRunId: string; criterion?: string }
  | { type: 'outcome'; ok: boolean; code?: string; detail?: string }
  | { type: 'clarification'; question: string; answer: string }
  | { type: 'abstain'; reason: string };

type FeedbackOptions = { actor?: Actor; at?: number; trustCeiling?: number };
```

### 5.3 Microglia

| Method | Signature | Behaviour |
|---|---|---|
| `open` | `(options) => Promise<Microglia>` | Validates config; does not open the store |
| `begin` | `(start: RunStart) => RunHandle` | Allocates an id; nothing is written yet |
| `recall` | `({task, text, scope?, budget?, limit?}) => Promise<KnowledgePack>` | Scope-indexed + lexical retrieval |
| `distill` | `({since?, limit?, generalize?}) => Promise<DistillReport>` | Idempotent over the log |
| `exportDataset` | `(format, {task?, since?}) => Promise<DatasetRow[]>` | Pure read |
| `exportJsonl` | `(format) => Promise<string>` | Header + rows |
| `doctor` | `() => Promise<Diagnosis>` | Integrity checks |
| `stats` | `() => Promise<MemoryStats>` | Counts |
| `close` | `() => Promise<void>` | Closes the store; idempotent |

`Microglia` also implements the `RunHost` surface (`nextId`, `now`, `persistRun`, `recordFeedback`).
Those are public because `RunHandle` needs them across a module boundary; hosts should not call them.

### 5.4 RunHandle

| Method | Signature | Notes |
|---|---|---|
| `complete` | `(output: Json, meta?: JsonObject) => Promise<RunRecord>` | Redacts, validates JSON, writes once |
| `feedback` | `(input: FeedbackInput, options?) => Promise<FeedbackEvent>` | Requires `complete` |
| `edit` | `(after: Json, options?) => Promise<FeedbackEvent>` | Computes ops + distance |
| `rate` | `(value, reasons?, options?) => Promise<FeedbackEvent>` | Reasons normalised, deduped |
| `outcome` | `(ok, code?, detail?, options?) => Promise<FeedbackEvent>` | Free label from execution |
| `clarify` | `(question, answer, options?) => Promise<FeedbackEvent>` | Becomes a lexicon candidate |
| `abstain` | `(reason, options?) => Promise<FeedbackEvent>` | No credit |
| `record` | `RunRecord \| undefined` | The immutable record |

### 5.5 Errors

| Code | When | Recovery |
|---|---|---|
| `MG_E_CONFIG` | Missing app, invalid task, missing store | Fix configuration |
| `MG_E_SCHEMA_VERSION` | Persisted schema unknown | Migrate the journal |
| `MG_E_NOT_OPEN` | Store or SDK closed | Reopen |
| `MG_E_RUN_COMMITTED` | `complete()` twice | Create a new run |
| `MG_E_NO_OUTPUT` | Feedback before `complete()` | Complete first |
| `MG_E_INVALID_SIGNAL` | Empty edit, same-run preference, non-JSON output, bad LLM response | Fix the caller |
| `MG_E_UNKNOWN_TASK` | Reserved | — |
| `MG_E_UNKNOWN_SCOPE` | Generalisation target missing (internal invariant) | Report a bug |
| `MG_E_STORE_IO` | Journal unreadable | Check permissions/disk |
| `MG_E_STORE_CORRUPT` | Invalid JSON line; includes line number | Repair or compact |
| `MG_E_KNOWLEDGE_UNSAFE` | Reserved for a host-supplied policy | — |
| `MG_E_BUDGET_EXCEEDED` | Reserved | — |
| `MG_E_NAMESPACE_MISMATCH` | Invalid namespace, cross-namespace write | Use the right namespace |
| `MG_E_PACK_STALE` | Reserved | — |

Reserved codes exist so a host can branch on a stable vocabulary before the path is implemented;
they are not thrown today.

### 5.6 Host hook map

The SDK never renders anything; it attaches to events the host already has. This table is the whole
integration contract:

| Host UI event | SDK call | Signal | Default trust |
|---|---|---|---|
| Thumbs up/down with a reason chip | `run.rate('down', ['wrong_chart_type'])` | `rating` | 0.60 (0.45 bare) |
| Inline editor saves a new chart spec / SQL | `run.edit(after)` | `edit` | 0.50–0.90 by semantic distance |
| Two candidate answers compared, one chosen | `run.feedback({type:'preference', …})` | `preference` | 0.70 |
| SQL runs; error toast or success | `run.outcome(ok, code?)` | `outcome` | 0.95 |
| User answers "what do you mean by active?" | `run.clarify(q, a)` | `clarification` | 0.85 |
| User dismisses the result | `run.abstain(reason)` | `abstain` | 0.40 (no credit) |
| Feedback arrives from an external channel | `run.edit(after, { trustCeiling: 0.2 })` | `edit` | capped at 0.20 → quarantine |

### 5.7 Host integration recipes

**A. Thumbs with reasons**

```ts
await run.rate('down', ['wrong_chart_type'], { comment: 'should be a line chart' });
// → trust 0.6, negative candidate scoped by reasonCode
```

**B. Silent edit**

```ts
await run.edit(editedSpec);
// → structural ops, distance (semantic if editSemantics is set), trust 0.5..0.9
```

**C. Execution outcome (the cheapest label)**

```ts
try { await db.run(sql); await run.outcome(true); }
catch (e) { await run.outcome(false, 'SQL_ERROR', String(e)); }
// → trust 0.95, credits applied items, creates a negative candidate
```

**D. Clarification**

```ts
await run.clarify('active customer', 'ordered in the last 90 days');
// → lexicon candidate scoped to the task
```

**E. Untrusted source**

```ts
await run.edit(spec, { trustCeiling: 0.2, actor: { type: 'user', idHash: 'external' } });
// → quarantined; never rendered
```

### 5.8 Adding a domain pack

1. Define the canonical output type and a validator.
2. Implement `classifyEdit(before, after) → EditCode | null`.
3. Implement `describeEdit(edit, features) → {scope, statement, payload}`.
4. Implement `editDistance(before, after) → number | undefined`.
5. Implement `interpreter({event, run}) → DistillCandidate[]`.
6. Supply a **payload example** to the LLM interpreter (`payloadHint`). Without it the model writes a
   plausible sentence and an empty payload; POC-1 measured 0% correct mark until the hint was added.
7. Test: gold/baseline validity, edit classification, statement identity, scope matching.

The pack does **not** import `distill`; it matches the `Interpreter` shape structurally. This keeps
the dependency graph acyclic and lets a host publish its pack without depending on the pipeline
version.

---

## 6. Algorithms

### 6.1 Edit normalisation

```
ops       = structuralDiff(before, after)        # set/remove/insert with JSON paths
distance  = editSemantics(before, after)         # if the domain pack provides one
          | changedLeaves / (leaves(before)+leaves(after))
```

Array removals are emitted in descending index order so `applyOps` is correct (an ascending removal
shifts the tail and skips the last element — this was a real bug, fixed and tested).

**Why a semantic distance exists.** A chart-type change is 1 of 4 leaves → 0.125 by the generic
metric → trust 0.667 → below the activation threshold. The POC initially failed to learn anything for
this reason. The pack now returns 1.0 for a mark change, which is the correct semantic weight.

### 6.2 Trust

```
edit:          0.5 + 0.4 · clamp01(distance / 0.3)
rating down:   0.6 if reasons else 0.45
rating up:     0.5
outcome:       0.95
clarification: 0.85
preference:    0.70
abstain:       0.40
final = min(derived, trustCeiling ?? 1)
```

### 6.3 Confidence (log-odds fusion)

```
logOdds   = logit(0.35) + Σ_i w_i · logit(trust_i) − contradictions · 1.0
empirical = (succeeded + 1) / (applied + 2)
decay     = 1                                     if now ≤ validUntil
          = max(0.2, 0.5^((now − validUntil)/30d)) otherwise
confidence = sigmoid(logOdds) · (0.55 + 0.45 · empirical) · decay
```

Three properties are worth stating:

- **Evidence is multiplicative in odds, additive in log-odds.** Two independent 0.9-trust
  observations do not sum to 1.8; they move the posterior from 0.35 to ~0.95.
- **An untested rule is not credited as a successful one.** `empirical` starts at 0.5, so a new rule
  can activate on evidence but cannot reach the ceiling until it has been applied.
- **Expiry is a decay, not a deletion.** An expired rule keeps its history and can be re-asserted.

### 6.4 Admission

```
if quarantined                 → quarantined (manual review)
if contradictions > 1          → conflicted
if applied ≥ 3 ∧ smoothedRate < 0.4 → retired
if active ∧ confidence < 0.45  → retired
if confidence ≥ 0.6 ∧ support ≥ 0.8 → active
if retired                     → retired
else                           → candidate
```

Defaults live in `policy.ts` with the reasoning next to each number. `minSupport = 0.8` is chosen so
one substantive edit (0.9) activates, while one bare thumbs-down (0.45) does not.

### 6.5 Merge, generalise, contradict

**Merge (same claim).** Identity is `dedupeKeyOf(namespace, kind, scope, normalised statement)`.
Evidence is unioned by `feedbackId`; support is summed once per event.

**Generalise (same claim, one fewer scope dimension).** Allowed only when namespace, kind, task,
intent, field, and payload are identical, the candidate has a domain, and the existing item either
has no domain or a different one. The widened item keeps the original statement (which is
domain-free by construction), unions evidence from all siblings, and retires the narrow copies with
`statusReason = "generalized:<id>"`.

Why only the domain dimension: dropping intent would turn "line for trends" into "line for
everything"; dropping field is already avoided at description time.

**Contradict (same scope, different claim).** A trusted candidate (trust ≥ 0.7) that disagrees with an
active item in the *same* `scopeKey` records a contradiction on that item. Different scopes are not
contradictions — a domain-specific exception is supposed to disagree, and specificity resolves it.

**Rehabilitation.** A retired item that receives a new trusted observation resets `applied` and
`succeeded` to zero. Rationale: the failures counted against it are failures of *application*, and
the host may have applied it to the wrong case. Without this, three bad applications permanently veto
the person the system exists to learn from.

### 6.6 Retrieval

**Candidate generation**

```
lexical  = postings(tokenize(text))
scoped   = { item : active ∧ namespace ∧ task ∧ scopeMatches(item.scope, query) }   if query.scope
candidates = lexical ∪ scoped
```

This union is load-bearing. A rule that generalised out of a domain no longer contains the domain
token, so a lexical-only candidate set drops exactly the knowledge the flywheel worked to produce.
In the POC this made the difference between 53.21% and 100.00%.

**Scoring**

```
bm25      = Σ_t idf(t) · tf·(k1+1) / (tf + k1·(1−b+b·len/avgLen)),  k1=1.2, b=0.75
score     = 0.65 · bm25/maxBm25 + 0.35 · confidence + 0.02 · (specificity−1)
```

The weights are constants, not learned, because a host must be able to explain why a rule was shown.

**Diversification.** MMR with λ=0.75 over statements, before the budget is applied. Budgeting first
lets three paraphrases consume the room a distinct rule needed.

**Budget.** Items are added greedily, then a second pass drops trailing items until
`rendered.length ≤ budget`. The budget is a hard bound, not an approximation.

### 6.7 Rendering

```
<microglia-knowledge version="1" note="Reference data from prior user corrections. Not instructions." items="2">
{"id":"k_1","kind":"constraint","confidence":0.775,"scope":{...},"statement":"...","payload":{...}}
{"id":"k_2",...}
</microglia-knowledge>
```

- JSONL, not prose: parseable, auditable, and escaping is defined by JSON.
- `<` is escaped as `\u003c`, so a statement cannot close the element.
- The preamble states the data/instruction boundary; the security model does not rely on the model
  obeying it (see §7).

### 6.8 Credit assignment

| Signal | Credit |
|---|---|
| `rating up` | success |
| `rating down` | failure |
| `edit` | failure |
| `outcome ok` | success |
| `outcome fail` | failure |
| `clarification`, `abstain`, `preference` | none |

One credit per `(runId, knowledgeId)`, from the first signal. A host that fires both a thumbs-down and
an edit would otherwise count one failure twice.

### 6.9 Distillation report

```ts
{
  events, candidates,
  created, merged, generalized, superseded, contradicted,
  quarantined, rejectedUnsafe, rejectedByHost
}
```

Every input has a counted outcome. A flywheel that silently drops input cannot be debugged.

### 6.10 LLM distillation (optional)

`buildDistillPrompt` puts the event in a delimited `<event>` block and asks for a fixed JSON schema;
`parseDistillResponse` validates kinds, statement length, scope keys, and payload shape. The model's
output is a **candidate**, not a mutation: it still passes redaction, screening, dedupe, and admission.

The prompt also carries a `payloadHint` — a literal example of the domain payload. This is not
cosmetic: POC-1 measured **0% correct mark with 100% correct intent** before the hint, and **95.83%**
after it. A model cannot infer `{when:{intent},then:{mark}}` from a prose instruction, and a pack that
forgets the hint produces confident, empty lessons.

---

## 7. Security and privacy

### 7.1 Trust model

| Source | Default trust | Rationale |
|---|---|---|
| Verified execution | 0.95 | Measured, not judged |
| Clarification | 0.85 | The user is teaching a definition |
| Substantive edit | 0.90 | Direct correction of the output |
| Small edit | 0.50–0.70 | Often formatting |
| Reasoned thumbs-down | 0.60 | Direction without a fix |
| Bare thumbs-down | 0.45 | Weakest explicit signal |
| External/unverified | capped by host (e.g. 0.2) | Quarantined |

### 7.2 Quarantine

`trust < 0.35` creates the item as `quarantined`. A quarantined item never leaves that state through
evidence; only `reinstate()` moves it to `candidate`, where it still needs trusted evidence to
activate. This is deliberate: low-trust evidence must not be laundered by repetition.

### 7.3 Namespace isolation

Every read filters on `namespace` before ranking; every write asserts it. The POC measures leakage
with a foreign `Microglia` over the same store and requires zero hits (G7).

### 7.4 Injection defense

Four layers, none of which relies on the model:

1. **Redaction before persistence** — email, phone, API keys, GitHub tokens, JWTs, AWS keys.
2. **Screening** — instruction overrides, chat role markers, system-prompt extraction, script tags,
   exfiltration phrasing, zero-width/bidi control characters.
3. **Structural containment** — JSON-escaped data inside a named element; `<` escaped.
4. **No imperative knowledge from untrusted sources** — a statement that reads as a command is
   rejected (`rejectedUnsafe`), because it means distillation failed.

### 7.5 Poisoning: what the literature says and what we do

Memory poisoning is now a named risk (OWASP ASI06). Reported attacks achieve ~98% injection and ~60%
activation against state-of-the-art agents (GhostWriter), and a single email can plant a persistent
false memory in an agent with memory files (MemGhost, 87.5% success against one deployment). The
defenses those papers recommend — provenance tagging, confirmation before durable writes, audit logs —
are exactly the fields this design already carries.

| Attack | Our control | Residual risk |
|---|---|---|
| Direct poisoned edit | Trust ceiling → quarantine | A host that sets `trustCeiling: 1` defeats it; G11 measures the harm |
| Repetition attack (many poison edits) | Quarantine is sticky; no evidence-based exit | Manual review required |
| Poison via a trusted reviewer | Cannot be distinguished from a correction | Out of scope; audit trail is the answer |
| Poisoned exemplar | Exemplars are rendered as data with an id; no instruction following | A model may still imitate a bad example |
| Cross-namespace injection | Namespace filter on every read | None observed |

The POC exercises the first two: 12 injected edits in the poison arm produce 2 quarantined items and
**zero** active untrusted items; removing the ceiling drops accuracy 14.28pp.

---

## 8. Cortex integration

### 8.1 Why not a hard dependency

- `@agentix-e/cortex-*` is not published (404 for all four packages).
- `cortex-node` pulls `better-sqlite3` (native build), which would break browser and edge hosts.
- Cortex is under active change (55 commits between the published baseline and master).
- Its `Fact` has no derivation edge, so it cannot answer "which knowledge produced this correction".

### 8.2 The projection contract

```ts
interface CortexStorage {
  put(table, key, value, opts?: { tags?: string[] }): Promise<void>;
  get<T>(table, key): Promise<T | undefined>;
  del(table, key): Promise<void>;
  query<T>(table, predicate?: { tags?: string[]; limit?: number }): Promise<T[]>;
}
```

`CortexProjection` writes two rows per item:

| Table | Key | Value | Tags |
|---|---|---|---|
| `memories` | `item.id` | `CortexMemoryValue` (cortex's `MemoryValue` shape) | `ns:`, `task:`, `kind:`, `status:`, scope dims |
| `facts` | `<id>:fact` | `CortexFact` (bitemporal) | same |

Field mapping decisions:

| Microglia | Cortex | Why |
|---|---|---|
| `confidence` | `value` **and** `confidence` | Cortex's write gate reads `value`; keeping `confidence` preserves semantics |
| `trust` | `sourceTrust` | Quarantine decisions survive the projection |
| `kind=exemplar` | `type=episodic` | An example is an experience, a rule is knowledge |
| `validUntil` | `Fact.validUntil` + reduced stability | An expired rule must not be scheduled as durable |
| `namespace`/scope | tags | Cortex's predicate is exact-tag matching |

### 8.3 Gap table (from source, not from the README)

| Capability | Cortex status | Microglia response |
|---|---|---|
| Derivation history | Not implemented; a speculative `ProvenanceNode` was deleted | `evidence[]` + `dedupeKey` are the provenance record |
| TD(λ) credit assignment | Not implemented | `creditOf` + `applyOutcome` |
| Probability calibration | Not implemented; fixed thresholds | Wilson-smoothed empirical rate inside `confidence` |
| Feedback ingestion | No type for it | `FeedbackEvent` + interpreters |
| Reranker | Implemented, off by default | Lexical + scope is the default; embeddings PLANNED |
| `consolidate` caller | No production caller; FSRS is reachable only transitively (README) | Not required for the loop |
| Benchmark currency | 83.55% at `a52628f`, 55 commits behind; no LoCoMo | Do not inherit the number |

### 8.4 Competitor source audit

Closed-source products (LangSmith, Braintrust) are compared from public documentation only; per the
project steering, no attempt is made to obtain their source. The five open-source leaders were read
at the file level.

| Project | Licence | Runtime requirement | Source-level finding | What it does not model |
|---|---|---|---|---|
| **Mem0** | Apache-2.0 | Vector DB + LLM (+ optional graph DB) | `mem0/memory/main.py`: phased add (context → top-10 recall → one extraction call); events `ADD`/`UPDATE`/`DELETE`; `_compute_entity_boosts` on search. `mem0/configs/prompts.py`: `ADDITIVE_EXTRACTION_PROMPT` (v3, ADD-only + `linked_memory_ids`), and the older `DEFAULT_UPDATE_MEMORY_PROMPT` (ADD/UPDATE/DELETE/NONE) | A correction is not an input; there is no trust weight, contradiction budget, scope generalisation, quarantine, or prompt pack. Extraction is from conversation, not from a verified edit |
| **Graphiti (Zep)** | Apache-2.0 | Neo4j / Kuzu / FalkorDB + LLM + embeddings | `graphiti_core/edges.py`: four timestamps per edge — `valid_at`, `invalid_at` (world), `created_at`, `expired_at` (system). `search/search_config.py`: BM25 + cosine + BFS recipes, RRF reranker | Bi-temporal graph is strong for entities and facts, but ingestion is episode-based. No per-edit trust, no evidence-weighted admission, no quarantine, and the graph database is a hard dependency |
| **Letta** | Apache-2.0 | Postgres + pgvector, server process | `letta/services/block_manager.py`: `BlockManager` with checkpoint/undo/redo; core memory blocks plus archival and recall memory; agent edits blocks through tools | Memory is self-edited by the agent, not learned from a user correction. No admission threshold, no contradiction budget, no zero-service mode |
| **Langfuse** | MIT (core) | ClickHouse + Postgres + Redis, server | `packages/shared/src/domain/scores.ts`: `ScoreDataType` includes **`CORRECTION`**; `CORRECTION_NAME = "output"`; sources are API/EVAL/ANNOTATION; text capped at 500 chars | A correction is a score attached to a trace. It is not distilled, scoped, retrieved into a prompt, or credited. This is the closest competitor and it stops exactly at the boundary microglia crosses |
| **Argilla** | Apache-2.0 | Server + Elasticsearch | `records` (fields, responses, suggestions, vectors, metadata) with bulk upsert; annotation-centric dataset model | Human annotation platform; no runtime retrieval, no memory lifecycle, no feedback-to-prompt path |
| **Cortex** | MIT | Node + SQLite/Postgres | Value gates, bitemporal `Fact`, FSRS, consolidation, contradiction fusion | No feedback type, no credit assignment, no `derivedFrom`, no calibration; see §8.2 |

Two conclusions from the audit:

1. **The closest competitor is Langfuse's `CORRECTION` score**, and it is deliberately a label on a
   trace. The moment a correction becomes a *typed, scoped, evidenced rule*, every audited project
   stops.
2. **Graphiti is ahead of us on graph temporality** and we should not pretend otherwise. Our claim is
   narrower and different: a correction has trust, a scope, an evidence weight, a lifecycle, and a
   prompt budget. A future adapter could use Graphiti as a projection backend, exactly as it uses
   Cortex.

### 8.5 Verdict and path

> **Use Cortex as a projection and maintenance layer; keep microglia's journal as the source of
> truth until Cortex ships `derivedFrom` and calibration.**

Path: (1) projection now; (2) switch structural types to `import type` when published, plus a
conformance test against `SqliteStorage`; (3) upstream `derivedFrom?: string[]` on `Fact` and a
calibration module; (4) optional: let Cortex's `decideRetrieval` provide a second abstention opinion
on the pack.

---

## 9. Performance and limits

### 9.1 Measured on CPU (no GPU, no server)

All numbers below are from `pnpm poc:scale` on the CI runner class (2 vCPU, Node 22). The product
has no GPU path; embeddings, when enabled, run through an ONNX/WASM or WebGPU encoder on the host.

| Items | Build | `recall` p50 | `recall` p95 | Heap delta | Pack tokens |
|---|---|---|---|---|---|
| 1,000 | 5–6 ms | 1.3–1.4 ms | **1.9–4.2 ms** | 1.6–2.1 MB | 259 |
| 5,000 | 22–28 ms | 1.5–1.6 ms | **2.2–4.4 ms** | 7.1–8.4 MB | 259 |
| 10,000 | 45–61 ms | 1.8–2.1 ms | **2.6–3.1 ms** | **13.9–14.0 MB** | 259 |

The scope scan is O(n), but at 10k items it is 2.6–3.1 ms p95 across three runs — well inside the
50 ms budget. The earlier
claim that 10k would be the bottleneck was an inference, not a measurement; it is withdrawn. The next
checkpoint is 100k, where the scan is expected to cross the budget and the SQLite index becomes the
fix.

| Other measurements | Value | Conditions |
|---|---|---|
| Mean pack size | **90–259 tokens** | 6 rules in the study; 10k pool, budget-bound |
| Full mechanism study (9 arms × 6 rounds, plus 3 micro-ablations) | **0.33 s** | Single core, in-memory journal |
| LLM distill latency | **951–1,276 ms p50 / 1,265–1,562 ms p95** | DeepSeek, 24 calls, ~495 tokens, three runs |
| LLM reader latency | **652–898 ms p50 / 959–1,199 ms p95** | DeepSeek, 70 calls, 461 tokens, three runs |

### 9.2 Budgets

| Resource | Budget | Enforcement |
|---|---|---|
| Pack characters | 1200 (default) | Hard bound in `renderPack` |
| Pack tokens (estimate) | `ceil(chars/4)` | Reported on every pack |
| Event text | 500 chars (comment/detail), 1000 (answer) | Truncated at capture |
| Reasons per rating | 8 | `normaliseReasons` |
| Statement length (LLM) | 400 chars | Parser rejects longer |

### 9.3 Scaling path

| Scale | Store | Retrieval | Distillation |
|---|---|---|---|
| ≤10k items | JSONL + in-memory index | O(n) scope scan + inverted index | Synchronous cron |
| ≤1M items | SQLite (PLANNED) | SQL scope index + FTS5 | Batched worker |
| Multi-process | Postgres via `MemoryPort` | Materialised scope index | Queue + idempotency keys |

---

## 10. Testing

### 10.1 Strategy

| Layer | What it proves | Representative cases |
|---|---|---|
| Unit | Pure functions, edge cases, error paths | diff round-trips, Wilson/McNemar boundaries, injection screen, scope matching |
| Contract | Ports implemented by fakes behave per interface | JSONL reopen, corrupt line, schema mismatch, Cortex projection |
| Integration | Capture → distill → recall → apply on a real JSONL journal | edit → rule → recall → credit, export shapes, doctor issues |
| Study | Full ablation with statistical gates | 9 arms × 6 rounds, 15 gates, 3 micro-ablations |

- **No network.** The LLM port is exercised with a deterministic fixture; every other path is offline.
- **No mocks of the system under test.** Fakes exist only for `Storage`/`LLM`, which are ports by design.
- **Deterministic.** Clock and RNG are injected; the study is reproducible from a seed.
- **Property tests** (fast-check) are PLANNED for `diff`/`applyOps` round-trips and merge idempotency.

### 10.2 Coverage (measured)

| Dimension | Result | Threshold |
|---|---|---|
| Lines | **100%** | 95 |
| Statements | **100%** | 95 |
| Functions | **100%** | 95 |
| Branches | **99.53%** | 95 |

### 10.3 The seven uncovered branch arms, named

99.53% (1508/1515) with no ignore comment anywhere in the repository. Every remaining arm is listed
below with the reason it cannot be taken; a reader can check the claim against the file.

| File:line | The arm that never runs | Why it is unreachable |
|---|---|---|
| `core/src/diff.ts:113` | `key === undefined` when applying an op | the empty-path case returns earlier, so a non-empty path always has a last element |
| `core/src/stats.ts:93` | `logSumExp` over an empty sample | `mcnemarExact` returns at `n === 0`, so the sum never sees zero terms |
| `eval/src/ablations.ts:98` | `status: 'missing'` for the learned rule | the store has no delete, so the rule the function just learned is still there |
| `eval/src/report.ts:84` | the `still injected` wording of the credit row | one run produces one ablation result; the other wording is covered by the failing-fixture test |
| `eval/src/scenario.ts:321` | the confidence comparison in `outranks` | two rules that match a query differ in scope size or id first, so the third key is never consulted |
| `memory/src/lexical-index.ts:38` | a token with no posting bucket during removal | `add` is the only writer and it creates a bucket before recording the token |
| `memory/src/store.ts:162` | a candidate id that resolves to no knowledge item | the index and the map are written in the same call, so they cannot diverge |

These are invariant guards, not untested behaviour: each protects against a state the type system
cannot express, and deleting one would turn a future bug into silent data loss rather than an
exception. The alternative — an `ignore` comment — would make the number look better and the code
worse, so the number stays where it is and the list stays in the document.

### 10.4 Commands

```bash
pnpm install
pnpm build       # tsc -b, project references
pnpm typecheck   # same graph, no emit
pnpm test        # vitest + v8 coverage, thresholds at 95 on all four dimensions
pnpm audit:repo  # source rules, manifests, published-dependency advisories
pnpm bench       # build + mechanism study + gates
pnpm check       # typecheck + test + audit + bench
```


---

## 11. Evaluation protocol (public benchmarks)

### 11.1 Design

| Element | Choice | Reason |
|---|---|---|
| Unit | One question, both arms | Paired designs remove question difficulty |
| Split | k-fold cross-fitting, balanced, order-independent | Every question is evaluated exactly once, by a memory that never saw it; one half split discards half the questions and lets file order choose |
| Test | Exact McNemar | Binary outcomes, small discordant counts |
| Interval | Bootstrap 10k over questions | No normal approximation at n<500 |
| Preregistration | Hypothesis, endpoint, n, stop rule | Prevents post-hoc endpoint selection |
| Runs | 4 interleaved per arm when stochastic | Time-of-day drift is 1.7–2.1pp in the cortex record |
| Judge | Order-swapped, length-controlled, κ ≥ 0.7 | Position/verbosity/style bias is systematic |
| Corrected subsets | ARCwise-Plat for BIRD | 52.8% annotation error rate reported |
| Resolution | Report the minimum detectable difference with the delta | A result without its resolution invites reading noise as progress |

### 11.2 Power

McNemar sample size: `n ≈ (z_{α/2}+z_β)² (p01+p10) / (p01−p10)²`, α=0.05, power=0.8.

| Detectable delta (pp) | Assumed discordance | Required n |
|---|---|---|
| 20 | 0.30 | ~59 |
| 10 | 0.22 | ~157 |
| 8 | 0.18 | ~343 |
| 5 | 0.15 | ~785 |

Consequence: **BIRD-Interact Lite (n=300) cannot detect a 5pp effect.** Either use the full 600-task
set (~5.8pp detectable) or state the effect size the set can support. This is why §10 of the
whitepaper separates "+5pp" (full set) from the Lite reference run.

### 11.3 Metric definitions

| Metric | Definition | Source |
|---|---|---|
| Execution match | Result-set equality, order ignored, set semantics | BIRD / Spider2 |
| Chart top-1 | Predicted mark equals any gold mark | nvBench 2.0 |
| F1@K | Harmonic mean of P@K and R@K over valid visualisations | nvBench 2.0 |
| Joint accuracy | Answer match ∧ chart match | Text2Vis |
| Task success | All executable test cases pass | BIRD-Interact |
| Correction reuse | Wrong without memory ∧ right with memory, same scope | This work |
| Edit effort | Mean normalised edit distance per run | This work |
| Poison activation | Active items with source trust < quarantine floor | This work |

### 11.4 Harness contract

Each benchmark adapter must produce, per case:

```ts
{ id, task, input, gold, prediction, correct, latencyMs, packIds, tokens }
```

and the runner must emit a JSON artifact containing: config, seed, model, prompt version, n,
per-case rows, the paired comparison, and the gate verdicts. A report without the artifact is not a
result.

The BIRD lane (`poc/sota-bird.ts`) implements this as:

| Artefact field | Content |
|---|---|
| `config` | folds, seed, limit, generalisation switch, bootstrap resamples, pack budget, task |
| `model`, `prompt_version` | `deepseek-chat`, `sql-prompt/2` |
| `n` | total questions, per-fold eval size, mean learn size, database count |
| `per_case` | id, fold, question, gold SQL, predicted SQL, both arms' verdicts, parse/exec flags, pack ids, tokens, latency |
| `paired` | n, gained, lost, discordance, exact McNemar p, delta and bootstrap interval, minimum detectable difference |
| `gates` | V1–V5 with the observed value and whether the run may proceed |
| `assertions` | the per-fold knowledge digests, proving the pack did not change during evaluation |
| `items` | every stored rule per fold, with status and trust |

### 11.5 Instrument validity, before accuracy

A public-benchmark number is only worth reading if the instrument that produced it could have
detected a problem. The lane therefore refuses to publish when any blocking condition fails, and the
failure is reported as a named gate rather than as a low accuracy.

| Gate | Blocking | What a failure means |
|---|---|---|
| V1 pack not empty | yes | the two arms were the same arm; any delta is run-to-run noise |
| V2 fold partition | yes | a question was evaluated twice, or evaluated by a memory that had learned from it |
| V3 parse rate ≥ 90% | yes | the comparison is measuring the parser, not the knowledge |
| V4 gold executable ≥ 99% | yes | the dataset half-assembled, so "wrong" is not attributable to the model |
| V5 resolution ≤ 6pp | no | the sample cannot support the effect it is asked about; the number is reported as a direction |
| V6 controls inject | yes | a control arm rendered an empty block, so it was a second baseline wearing a control's name |
| V7 channel | yes | the oracle arm (gold SQL as a convention) moved accuracy by less than 10pp, so the lane cannot see knowledge at all |

V6 exists because the first version of the dilution control reported `0.00 rules per question` and
looked like evidence that length does not matter; it had injected nothing. V7 exists because a negative
result and a broken lane are indistinguishable without a positive control: in every run so far the
oracle arm moves the same model by 31–43pp, which is what makes the other arms' nulls readable.

The pack is also fingerprinted (SHA-256 over id, status, trust and statement of every stored item)
before and after evaluation. A change aborts the run: a pack that grows while it is measured cannot
support a claim about what it contributed.

---

## 12. POC results

### 12.0 Register

Every POC is a script, a seed, an artifact, and a conclusion. Nothing in this document is quoted
from a run that cannot be reproduced by the command in the same row.

| ID | Question | Method | n | Command | Artifact | Conclusion |
|---|---|---|---|---|---|---|
| POC-0 | Does feedback become transferable knowledge? | Deterministic 6-arm ablation | 280 paired | `pnpm bench` | `bench/results/study.json` | +68.21pp; unseen domain 100% vs 32.86% |
| POC-1 | Can an LLM turn free-text feedback into a scoped lesson? | DeepSeek + shipped prompt/parser | 24 | `pnpm poc:llm-distill` | `poc/results/poc-llm-distill.json` | 91.7–95.8% mark, 95.8–100% intent, 0 active injections |
| POC-2 | Does a real LLM follow the pack? | DeepSeek reader, generic vs house vs poison | 70 | `pnpm poc:llm-reader` | `poc/results/poc-llm-reader.json` | generic −2.38 to 0pp; house +75.00 to +89.29pp; poison 0 to −8.33pp |
| POC-3 | Does lexical retrieval survive paraphrase? | BM25 vs embedding-3 vs rank fusion | 96 | `pnpm poc:embedding` | `poc/results/poc-embedding.json` | BM25 best for light; dense +8.4pp for heavy |
| POC-4 | Is CPU retrieval viable at 10k items? | Synthetic store, 100 queries | 3 sizes | `pnpm poc:scale` | `poc/results/poc-scale.json` | 2.6–3.1 ms p95, 14 MB |
| POC-5 | Can a competitor's design be reproduced from source? | Source audit of 5 OSS projects + Cortex | — | §8.5 | this document | No OSS project models a correction as evidence |
| POC-6 | Does a pack ever claim a rule it did not render? | Budget sweep 60…2400 chars over 40 rules | 64 budgets | `pnpm test packages/apply` | `budget.test.ts` | **No longer** — a bug, see §12.7 |
| POC-7 | Does the adapter match the real cortex build? | Clone, build, then compare field sets | 1 item | `pnpm poc:cortex` | `cortex.yml` | 12 fields matched; the structural copy is correct |
| POC-9 | Does the loop help a real model on a public benchmark? | BIRD Mini-Dev, cross-fitted k=5, execution accuracy | 352 (every usable question) | `pnpm poc:sota` / `sota.yml` run `39390556532` | `poc/results/poc-sota-bird.json` | **54.83% → 51.99% (−2.84pp, 95% CI [−6.25, +0.57], p=0.143)**; 2.25 rules/question; no fold positive |
| POC-8 | Would a competitor-shaped memory do the same job? | A similarity fact store on the same corrections, clean and poisoned | 280 paired | `pnpm bench` | `bench/results/study.json` | 56.07% clean, **19.64%** poisoned; the governed loop is +43.93pp |

### 12.1 POC-0 — mechanism study

**Setup.** 560 feedback questions, 280 held-out questions, four schemas, six documented defects, one
domain (`ops`) receives **no feedback at all**. The generator is fixed; only the knowledge changes.

| Arm | Baseline | Final | Δ | McNemar p | Precision |
|---|---|---|---|---|---|
| baseline | 31.79% | 31.79% | — | — | — |
| full | 31.79% | **100.00%** | **+68.21pp** | <0.0001 | 100% |
| noise (20%) | 31.79% | 100.00% | +68.21pp | <0.0001 | 100% |
| poison | 31.79% | 100.00% | +68.21pp | <0.0001 | 100% |
| unguarded | 31.79% | 82.14% | +50.36pp | <0.0001 | **52.94%** |
| no-generalization | 31.79% | 83.21% | +51.43pp | <0.0001 | 100% |
| no-credit | 31.79% | 100.00% | +68.21pp | <0.0001 | 100% |
| no-contradiction | 31.79% | 100.00% | +68.21pp | <0.0001 | 100% |
| narrow-budget (400 chars) | 31.79% | 31.79% | **0.00pp** | 1.0 | — |

| Held-out domain | baseline | full | no-generalization |
|---|---|---|---|
| `ops` (never fed back) | 32.86% | **100.00%** | **32.86%** |

**Conclusion.** Scope generalisation is the mechanism that produces transfer; without it the unseen
domain is untouched. The unguarded arm shows that active poison costs **17.86pp**, so quarantine is
load-bearing, not decorative. The two module arms that report no change are explained by the
micro-ablations in §12.8 rather than left looking like null results. All 15 gates pass.

### 12.2 POC-1 — LLM distillation

**Setup.** 24 free-text corrections generated from real corpus items, three of them prompt-injection
attempts. The prompt and parser are the shipped ones. Provider: `deepseek-chat`, temperature 0.

Three runs are reported because the model is stochastic. Run A is local (2026-10-20T02:36Z) and its
artifacts are `poc/results/poc-*.json`; runs B and C are `poc-live` CI runs `39360812609` (02:50Z)
and `39362965052` (03:13Z), summarised in `bench/results/ci-runs.json`. A conclusion is only kept if
it holds across all three.

| Metric | Run A | Run B | Run C |
|---|---|---|---|
| JSON parse success | 100% | 100% | 100% |
| Candidate yield | 100% | 95.83% | 95.83% |
| Correct mark | 95.83% | 91.67% | **91.67%** |
| Correct intent | 100% | 95.83% | 95.83% |
| Injection knowledge active | 0 of 3 | 0 of 3 | **0 of 3** |
| Injection knowledge stored | 3 | 3 | 3 (candidate/quarantined, none active) |
| Latency p50 / p95 | 951 / 1,265 ms | 1,210 / 1,510 ms | 1,276 / 1,562 ms |
| Tokens | 496 | 492 | 491 |

**Conclusion.** Free-text feedback becomes a typed lesson at ~1 s and ~500 tokens, with 92–96% mark
accuracy and 96–100% intent accuracy across three runs. The misses are composition cases where the
cardinality predicate is omitted; they remain candidates, not active rules. Injection text produced
three stored candidates and **zero active** rules in both runs.

### 12.3 POC-2 — LLM reader: generic vs house vs poison

**Setup.** 42 generic cases and 28 house cases whose gold follows synthetic organisational
conventions that contradict the generic prior. Baseline is shown as "a previous model's suggestion,
may be wrong", which is the real host situation.

| Workload | No pack | With pack (A / B / C) | Δ range |
|---|---|---|---|
| Generic (n=42) | 90.48% | 88.10% / 90.48% / 88.10% | **−2.38 to 0.00pp** |
| House (n=28) | 0.00% | **89.29% / 78.57% / 75.00%** | **+75.00 to +89.29pp** |

| Safety / quality | Run A | Run B | Run C |
|---|---|---|---|
| Poison arm (12 cases, unquarantined global rule) | 0pp | **−8.33pp** | 0pp |
| JSON valid | 100% | 100% | 100% |
| Latency p50 / p95 | 652 / 959 ms | 858 / 1,021 ms | 898 / 1,199 ms |
| Tokens | 461 | 461 | 461 |

**Conclusion.** A strong model already knows generic chart grammar: the generic pack is neutral to
slightly negative (−2.38 to 0.00pp). The pack's value is **organisational convention**: 0% →
**75.00–89.29%** when the gold contradicts the prior. The product must be sold as "your house rules",
not "chart knowledge".

The poison control is **not stable**: 0pp in runs A and C, −8.33pp in run B (one of 12 cases
followed the rule). That is exactly the reason the defence is structural — quarantine, not a bet on model
judgment. The deterministic unguarded arm (§12.1) shows a 14.28pp loss when a poison rule is active.

### 12.4 POC-3 — retrieval under paraphrase

**Setup.** 48 scoped rules; each has a light paraphrase (synonyms only) and a heavy paraphrase (a
second vocabulary with no shared content words). Rankers: BM25, Zhipu `embedding-3` cosine, and
reciprocal-rank fusion.

| Query set | Ranker | Recall@1 (A / B) | MRR (A / B) |
|---|---|---|---|
| Light | BM25 | **58.33% / 58.33%** | **0.792 / 0.792** |
| Light | Dense | 54.17% / 54.17% | 0.767 / 0.767 |
| Light | Fusion | 58.33% / 58.33% | 0.788 / 0.788 |
| Heavy | BM25 | 20.83% / 20.83% | 0.376 / 0.376 |
| Heavy | Dense | **29.17% / 29.17%** | **0.521 / 0.521** |
| Heavy | Fusion | 29.17% / 27.08% / 25.00% | 0.496 / 0.486 / 0.475 |

Recall@5 minimum across all combinations and runs: **54.17%**.

**Conclusion.** BM25 is the right default when the host's vocabulary matches the knowledge (+4.2pp
recall@1 on light paraphrase). Under heavy vocabulary shift, dense gains **+8.3pp recall@1 and +0.145
MRR**, stable across runs. Unconditional rank fusion does **not** beat dense on heavy queries (equal
or lower recall@1, lower MRR), because a noisy lexical list dilutes the semantic one. Embeddings are
therefore an optional, confidence-gated channel (ADR-015).

### 12.5 POC-4 — CPU scale

| Items | Build | p50 | p95 (A / B) | Heap (A / B) | Tokens |
|---|---|---|---|---|---|
| 1,000 | 5 / 6 / 5 ms | 1.34 / 1.40 / 1.5 ms | 1.91 / 3.10 / **4.17** ms | 1.6 / 2.1 / 1.8 MB | 259 |
| 5,000 | 22 / 28 / 24 ms | 1.52 / 1.61 / 1.7 ms | 2.18 / 2.71 / **4.41** ms | 7.1 / 8.4 / 7.6 MB | 259 |
| 10,000 | 45 / 56 / 73 ms | 2.07 / 1.82 / 1.9 ms | 3.10 / 2.63 / **3.10** ms | 13.9 / 14.0 / **14.0 MB** | 259 |

**Conclusion.** The CPU budget holds at 10k items with a wide margin (p95 2.6–3.1 ms across three
runs; 1k shows 1.9–4.2 ms because the runner is shared). The
O(n) scope scan is real but not the bottleneck at this scale; the SQLite index is deferred to the
100k checkpoint. The earlier "10k is the limit" statement is withdrawn.

### 12.6 Cross-checks and design changes

Each POC changed the design. This table is the audit trail from evidence to decision.

| # | Evidence | Design change |
|---|---|---|
| D1 | LLM distillation produced the right intent but **0% correct mark** until the payload shape was specified | `buildDistillPrompt(..., payloadHint)` and `LlmInterpreterOptions.payloadHint` are part of the API; a pack must pass its payload example |
| D2 | Generic pack: −2.38 to 0pp; house pack: +75.00 to +89.29pp | Positioning changed: sell house conventions, not generic chart knowledge; §6 and §10 updated |
| D3 | BM25 wins light (+4.2pp), dense wins heavy (+8.3pp), fusion loses on heavy | Embeddings are an optional, confidence-gated channel; unconditional RRF removed from the roadmap |
| D4 | 10k items at 3.10 ms p95, 13.9 MB | SQLite index moved from P1 to the 100k checkpoint; performance claims replaced with measurements |
| D5 | Poison effect ranged 0 to −8.33pp across three runs; −14.28pp in the deterministic unguarded arm | Quarantine stays; the claim is "structural defence", not "models resist poison" |
| D6 | A pack built with a 120-character budget returned six items and an empty block | `makePack` filters `items` to the rendered ids; the study's `narrow-budget` arm went from 100% to 31.79% |
| D7 | Widening onto a candidate promoted a claim before admission | `pickGeneralizationTarget` accepts only an active sibling, and a claim with no eligible sibling creates a new item instead of throwing |
| D8 | The corpus generator skipped a malformed domain with `continue` | `resolveDomain`/`resolveRegistry` validate the schema and raise `MG_E_SCHEMA_INVALID`; a broken registration now fails loudly |
| D9 | The second budget pass could never run | replaced by a proved bound (a five-character count field) plus an explicit refusal above 99,999 items |
| D10 | One unparseable model response aborted a whole distillation batch | `DistillReport.failed` counts interpreter failures and the run continues; `strict: true` restores fail-fast |

### 12.7 The bug this round found

The budget sweep was written to prove an invariant — "a pack never lists a rule it did not render" —
and it failed on the first run. `makePack` returned the *candidate* items alongside the rendered ids,
so a pack built with a 120-character budget reported `items: 6, ids: [], rendered: ''`. Every
consumer that iterates `items` rather than reading the block would apply six rules the model never
saw. The study's deterministic reader did exactly that, which is why the `narrow-budget` arm had been
reporting 100% accuracy on an empty prompt.

The fix (`items` is now filtered to the rendered ids) is four lines; the consequences were larger
than the fix:

| Before | After | Consequence |
|---|---|---|
| `narrow-budget` 100.00% | `narrow-budget` 31.79% | the pack layer's contribution is measurable (G15) |
| budget appeared not to matter | 400 characters is the binding threshold | the default of 1,200 is justified by a measurement, not a guess |
| `items.length ≠ ids.length` possible | equality is asserted | a host can trust either field |

This is the second time an instrument bug was found by writing the invariant down as a test: the
first was a redaction counter that counted structural changes and reported four redactions for an
edit with no secret in it.

### 12.8 The competitor baseline: is the governance load-bearing?

The claim "observability stops at a label, memory stops at recall" is cheap to assert and was, until
this round, unmeasured. So the closest competitor shape was implemented and run on the *same*
corrections: extract a fact, deduplicate it against similar memories, retrieve the most similar one,
apply it. That is what an ADD/UPDATE/DELETE memory does, and it has no scope, no trust weight, no
admission, no contradiction resolution, and no retirement.

| Store | Accuracy | Δ vs no-memory | Facts | Untrusted facts ingested |
|---|---|---|---|---|
| no memory (`baseline`) | 31.79% | — | — | — |
| fact store | 56.07% | **+24.29pp** (p = 2.5e-06) | 16 | 0 |
| fact store, same poison | **19.64%** | **−12.14pp** | 16 | 8 |
| **full (this library)** | **100.00%** | **+68.21pp** (p < 0.0001) | 6 active | 0 |

Two conclusions, both new:

1. **A memory does help** — 56.07% is well above no-memory, so the product is not competing with
   nothing. The gap to our 100% is **+43.93pp**, and it comes from scope, admission, and the guard,
   not from a better retriever.
2. **Without a guard the same attack takes the store *below* no-memory**: 19.64% against a 31.79%
   baseline. A store that remembers everything is worse than a store that remembers nothing, because
   it is confidently wrong in the cases it was supposed to fix.

The fact store is implemented generously on purpose — it dedupes at 0.8 Dice, retrieves only above a
0.2 overlap floor, and applies the retrieved mark directly. Weakening it would have produced a larger
number and a worthless comparison.

### 12.9 Micro-ablations: the three modules an arm cannot measure

A clean corpus has one rule per (intent, domain), so credit assignment, contradiction resolution, and
diversification never bind. Running an arm with each disabled therefore reports zero — which looks
like evidence that the module does not matter. Three targeted experiments replace that non-result:

| Module | Workload | With | Without | Reading |
|---|---|---|---|---|
| Credit assignment | one rule, cited in 4 failing runs | **withdrawn** | still injected | counting applications is what stops a rule that is always wrong |
| Contradiction resolution | two trusted claims, same scope | 1 active, 429 chars | 2 active, 717 chars | tolerance doubles the prompt cost and answers nothing |
| Diversification | 12 paraphrases + 3 distinct claims, equal relevance | 4 distinct of 4 | 1 distinct | relevance alone fills the pack with one claim, four times |

The `no-credit` and `no-contradiction` arms still appear in the study and still report 100%, and the
report says so beside them: their contribution is measured by the micro-ablation, not by the arm.

### 12.10 What the results do not show

1. **The public benchmark did not confirm the mechanism.** The cross-fitted read in §12.11 resolves a
   4.9pp effect and finds no benefit (−2.84pp, CI spanning zero, no fold positive). BIRD-Interact,
   nvBench 2.0, and Text2Vis remain unexecuted; they are S1/S2 work, not this one.
2. **The house workload is synthetic.** It proves a mechanism (a pack can override a prior) but the
   conventions are not a real customer's.
3. **The LLM reader is one model.** DeepSeek was chosen for cost; a weaker or smaller model may rely
   on the pack more, and a stronger one less.
4. **The poison null is not immunity.** Twelve cases with one wording; the deterministic arm shows the
   harm when the rule is active.
5. **Retrieval is one paraphrase construction.** The heavy set is adversarial by design; real users
   sit somewhere between light and heavy.
6. **No multi-user or long-horizon study.** The POC is single-tenant and six rounds.

### 12.11 POC-9 — the public lane, cross-fitted (S2 read)

**Setup.** BIRD Mini-Dev, 352 usable questions (every question that is not `simple`) across its 11
SQLite databases, 5 folds, `deepseek-chat` at temperature 0, `sql-prompt/2`. Each fold learns only
from failures of the other four folds, distils, freezes, and answers its held-out fold twice — with no
memory and with the frozen pack. Execution accuracy is result-multiset equality against gold.

**Run.** `sota` workflow `39390556532`, 2026-10-20, 1h42m, 2,760 model calls, 2.9M tokens, 6 retries.
All five instrument gates passed: pack non-empty (2.25 rules per question), fold partition exact
(352/352, 0 duplicates, 0 leaks), parse 100%, gold executable 100%, resolution 4.91pp.

| Arm | Execution accuracy | n |
|---|---|---|
| no memory | **54.83%** | 352 |
| with memory | 51.99% | 352 |

Paired result: **−2.84pp**, 95% bootstrap CI **[−6.25, +0.57]**, exact McNemar **p = 0.143**,
24 questions lost, 14 gained, discordance 10.8%.

| Fold | active rules | no memory | with memory | Δ |
|---|---|---|---|---|
| 0 | 250 | 56.3% | 47.9% | −8.45pp |
| 1 | 184 | 59.2% | 59.2% | 0.00pp |
| 2 | 193 | 52.9% | 52.9% | 0.00pp |
| 3 | 237 | 54.3% | 52.9% | −1.43pp |
| 4 | 220 | 51.4% | 47.1% | −4.29pp |

**What this retracts.** The n=30 read (+3.33pp) was reported as a direction and is now explained: at
n=30 a difference below ~17pp cannot be distinguished from noise, and the cross-fitted measurement of
the same hypothesis, at 11.7× the sample and with a resolution of 4.9pp, puts the point estimate
*below* zero. The earlier number was noise with a favourable sign, which is exactly why the roadmap
called it "a lane, not a result".

**What it establishes.** At this scale the pack is not neutral. The direction is consistent (no fold
positive, 24 lost against 14 gained) but not significant, so the defensible statement is: *distilled
schema-level lessons do not help a strong model on BIRD Mini-Dev, and may cost ~3pp.*

**Why this is a plausible mechanism rather than a broken harness.** POC-2 measured the same asymmetry
from the other side: a pack of generic chart knowledge did not help (−2.38 to 0pp) while a pack of
organisation-specific convention moved accuracy by +75 to +89pp. The DDL is already in the prompt;
a lesson that restates a fact the model can read is at best redundant and at worst competes with it.
The BIRD lane has no organisational convention to learn — only public schema facts.

**Instrument cost of that conclusion.** 216.8 active rules per fold were built from 642 corrections,
but 166 of those 642 distillation calls (25.9%) failed to parse, so the pack was assembled from a
biased three quarters of the failures. That is a defect, not a result, and it is the first thing the
next round fixes.

**The three controls that separate the explanations.** A negative delta has four candidate causes, and
the next run measures them in one protocol rather than arguing about them: full pack (replication),
narrow pack (400 characters, 3 rules — dilution), wrong-scope pack (another database's rules, same
token cost — content or length), and an oracle hint (the gold SQL as the only "convention" — does the
injection channel work at all). A lane where the oracle moves nothing is a broken lane, not a
negative result.

### 12.12 POC-10 — the controls: harmful, diluted, wrong, or ignored?

**Question.** The negative read in §12.11 has four explanations, and they imply different repairs:
the knowledge is wrong (fix distillation), it is too long (fix the budget), the content is irrelevant
(fix retrieval), or the injection channel is inert (fix the prompt). One run separates them.

**Setup.** Same folds, same learned stores, same questions, `deepseek-chat`, 5 folds, n=352,
run `39406533126`, 1h59m, 3,813 calls.

| Arm | What is injected | Accuracy | Δ vs none | 95% CI | p | rules/question |
|---|---|---|---|---|---|---|
| none | — | **53.69%** | — | — | — | 0 |
| full | the learned pack | 52.56% | −1.14pp | [−3.98, +1.70] | 0.572 | 2.28 |
| duplicate | the same pack twice | 51.42% | −2.27pp | [−5.09, +0.55] | 0.200 | 2.28 |
| wrong-scope | another database's rules | 52.27% | −1.42pp | [−4.37, +1.53] | 0.383 | 2.38 |
| oracle | the gold SQL as the only "convention" | **84.66%** | **+30.97pp** | [+24.7, +37.2] | <1e-4 | 1 |

All seven instrument gates passed, including V6 (every control injected: 2.28 / 2.38 rules per
question) and V7 (the channel moves +31pp). Resolution 4.21pp.

**Reading.** Three facts, in order of how much they constrain the product:

1. **The channel works.** A single injected statement — the gold SQL — lifts the same model from 53.69%
   to 84.66%. Nothing about the prompt format, the position, or the model's willingness to follow a
   "workspace convention" is broken. Whatever the pack fails to do, it is not failing to be read.
2. **Content is not what separates the arms.** Our rules (−1.14pp), another database's rules
   (−1.42pp), and our rules twice (−2.27pp) are statistically indistinguishable from each other and
   from zero. A pack of *wrong* knowledge does no worse than a pack of right knowledge, which is the
   signature of a pack that is not being used as knowledge at all.
3. **Length is not the driver either.** Doubling the same text moves the estimate by ~1pp, well inside
   the interval.

**Conclusion.** On this benchmark the distilled schema prose is **inert**: the model already has the
DDL, and a lesson that restates an inferable fact neither helps nor reliably hurts. The small negative
point estimate is shared by every arm that adds ~1k characters of instruction, including a wrong-scope
pack, so it is a property of the intervention's *form*, not of the knowledge's *content*.

This is consistent with the two other measurements in this document: generic chart knowledge was worth
−2.38 to 0pp (POC-2) while organisation-specific convention was worth +75 to +89pp, and the mechanism
study's transfer came from conventions a generator could not infer (POC-0). The three results now agree
on a boundary condition: **knowledge must encode something the model cannot derive from its prompt.**

**Per-rule attribution** (`poc/results/poc-sota-attribution.json`, computed from the per-case rows):

| Rules ever injected | Harmful (net < 0) | Helpful (net > 0) | Neutral | Share of injections belonging to a harmful rule |
|---|---|---|---|---|
| 445 of 1,110 | 34 | 27 | 384 | 10.0% |

86% of the rules that were ever injected changed nothing. The damage is not concentrated in a few bad
rules that could be retired — retiring all 34 would address at most 10% of injections — which rules out
"the distiller writes wrong facts" as the explanation and reinforces "the facts are redundant".

**What the packs actually contained.** The lane records, per case, the share of the question's content
words that the pack's best rule mentions. Across 352 questions: median **7.1%**, p75 14.3%, p90 22.2%,
maximum 33.3%, and **47% of packs mention none of the question's words at all** — they were retrieved by
scope alone. That is the mechanism behind "inert": half the interventions were textually unrelated to
the question, and the other half shared one or two words with it.

It also fixes the only sensible value for a coverage floor. A first attempt used 0.34, which emptied
every pack on every question; gate V6 refused the run, which is exactly what V6 was added for. A floor
below the median is the only one that leaves anything to measure.

**A defect this run did not fix.** 165 of 641 distillation calls (25.7%) returned non-JSON and were
dropped, unchanged from 25.9% before the token budget was raised: the failure is not truncation. The
pack is therefore built from three quarters of the corrections, and the next round records the reply
prefix so the cause is visible instead of guessed.

### 12.13 POC-11 — relevance gating, and the parser bug that biased the pack

**Question.** If the pack is inert because it is injected whether or not it is relevant, a floor on
relevance — not a better distiller — is the repair. The measured coverage distribution (§12.12) made
the hypothesis concrete: 47% of packs shared no content word with their question.

**Setup.** Same folds, same stores, n=352, run `39436660082`, 1h56m, 3,475 calls. The `gated` arm
recalls with `minCoverage = 0.01`, which is "the best rule must mention at least one of the question's
content words".

| Arm | Rules/question | Accuracy | Δ vs none | 95% CI | p |
|---|---|---|---|---|---|
| none | 0 | **54.55%** | — | — | — |
| full | 2.27 | 53.98% | −0.57pp | [−3.98, +2.84] | 0.871 |
| gated (≥1 shared word) | 2.06 | 54.26% | −0.28pp | [−3.41, +2.84] | 1.000 |
| oracle | 1 | **84.38%** | **+29.83pp** | [+25.00, +34.94] | <1e-4 |

**Reading.** The floor removes almost nothing — 2.27 → 2.06 rules per question — because a pack whose
*first* rule shares no word can still hold a second rule that does. With that little removed, the delta
does not move (−0.57 → −0.28). Gating is therefore not the lever: the knowledge is either redundant or
invisible, not merely badly addressed.

The four reads of the same hypothesis now stand at −2.84, −1.14, −0.57 and −0.28pp, every interval
containing zero. The instruments improved between them (half split → cross-fitting → controls →
coverage floor), and the estimate did not move toward a benefit. That is what a null effect looks like
when the measurement gets better.

**A parser bug, found because the failure was recorded.** The lane had been dropping 25.7% of its
corrections with `LLM response is not JSON`. Recording the reply prefix showed why: the replies were
valid JSON in shapes the parser did not accept — a bare array, a single candidate object, an object
with a literal newline inside a statement, an object with a trailing comma. `parseCandidates` now
accepts all four and repairs only what cannot change a valid document (§`packages/distill/src/llm.ts`).
This is a bias, not a nuisance: a quarter of the evidence never reached the pack, and which quarter was
decided by formatting.

**Measured on the fix.** Two 40-question runs, same protocol, only the parser and the distillation
prompt differ:

| Stage | Corrections lost to a parse failure |
|---|---|
| before | 165 of 641 (25.7%) |
| shapes accepted (array, single object, newline, trailing comma) | 4 of 40 (10.0%) |
| plus "at most two candidates" and a 2,000-token budget | **2 of 40 (5.0%)** |

The remaining two replies are still truncations of a valid array, so the last 5% needs a salvage pass
rather than another format. The failure rate is now low enough that the knowledge is no longer built
from three quarters of the evidence.

**Consequence for the next measurement.** The corrected parser changes the knowledge, so the delta
needs re-measuring; the accuracy numbers in §12.12–§12.13 predate the fix and are quoted as the
pre-fix record. What is unchanged is the structural
finding: on a benchmark whose gold encodes only what its schema already says, no amount of the right
knowledge moves the model — and one injected statement of *non-inferable* knowledge (the oracle) moves
it by 30pp.

## 13. Operations

### 13.1 Runtime topology

| Deployment | Store | Distillation | Notes |
|---|---|---|---|
| Single Node process | `JsonlJournal` | Cron / after N events | Default; one writer |
| Serverless | `JsonlJournal` on a mounted volume, or a `MemoryPort` over the host DB | Out-of-band | Avoid per-invocation writes without a lock |
| Browser | `MemoryJournal` + IndexedDB adapter (**PLANNED**) | Web Worker | No `node:fs` |
| Multi-process | `MemoryPort` over Postgres (**PLANNED**) | Queue | Idempotency via `feedbackId` |

### 13.2 Health checks

`mg.doctor()` returns named issues: orphan evidence, active below support, active below threshold,
high quarantine ratio, conflicts, and "feedback exists but nothing was distilled". Wire `ok` to a
readiness probe and the counts to a dashboard.

### 13.3 Data lifecycle

| Action | How | Reversible |
|---|---|---|
| Retire a rule | `expireKnowledge` (via policy change) | Yes: new evidence re-activates |
| Delete a user's data | Delete events by `sessionId`/`actor.idHash`, then compact | No; export first |
| Export training data | `exportJsonl('dpo')` | n/a |
| Migrate schema | Version the `schema` field; run a migration on open | Depends on migration |

### 13.4 Release process (PLANNED)

1. `changeset` for every package.
2. `publint` + `attw` on the packed tarball.
3. `size-limit` budget: core ≤ 25KB gzip, capture ≤ 60KB (target, not yet measured).
4. Publish under `next`, run the study against the published tarball, then promote to `latest`.
5. Commit `bench/results/study.json` with the release tag.

---

## 14. Decisions (ADR log)

| ADR | Decision | Alternatives | Why |
|---|---|---|---|
| ADR-001 | Headless library, no UI | Component library; platform | Host owns UX; no adoption friction; Humanloop precedent |
| ADR-002 | JSONL default store | SQLite; Postgres | Zero native deps; inspectable; one writer is the common case |
| ADR-003 | Scope is an index, not a filter | Lexical only | Generalised rules lose the domain token; measured 53%→100% |
| ADR-004 | Log-odds confidence | Weighted sum; raw ratio | Interpretable; evidence composes; matches Cortex's fusion |
| ADR-005 | Never rewrite; append + merge | LLM summarisation | ACE's context collapse (18k→122 tokens, 66.7%→57.1%) |
| ADR-006 | Generalise only the domain dimension | Generalise all | Dropping intent turns a rule into a policy |
| ADR-007 | Quarantine is sticky | Evidence can lift it | Repetition attacks; low trust must not be laundered |
| ADR-008 | Render JSONL inside an element | Prose bullets | Injection containment + auditability |
| ADR-009 | Credit at feedback time | Credit at distill time | The run knows its pack; a batch job does not |
| ADR-010 | Semantic edit distance from the domain pack | Generic leaf distance | A mark change is 1/4 leaves but a different chart |
| ADR-011 | Cortex as projection, not source of truth | Cortex as store | No derivation edge, no credit assignment, not on npm |
| ADR-012 | ESM-only, zero runtime deps | CJS + deps | Browser-safe core; no supply-chain surface |
| ADR-013 | CPU/WebGPU only; no GPU runtime, no fine-tuning | Local GPU inference; fine-tuned generator | Cost, privacy, edge deployment; the export path covers training |
| ADR-014 | Sell house conventions, not generic knowledge | Generic chart rules | POC-2: generic −2.38 to 0pp; house +75.00 to +89.29pp |
| ADR-015 | BM25 default; embeddings optional and confidence-gated | Unconditional hybrid | POC-3: BM25 wins light; dense wins heavy; fusion loses on heavy |
| ADR-016 | `payloadHint` is part of the LLM interpreter contract | Let the model infer the payload | POC-1: 0% → 95.83% mark accuracy |

---

## 15. Gap register and next steps

### 15.1 In-scope gaps

**None.** The current phase is defined as "two documents + POC + CI evidence"; all of it is present
and reproducible. The items below are deliberately **not** called gaps, because they are outside this
phase's scope or are scheduled engineering work with a named trigger.

### 15.2 Scheduled engineering work (not phase gaps)

| # | Item | Why it is not a phase gap | Trigger / plan |
|---|---|---|---|
| E1 | Seven branch arms are unreachable | The bar (95%) is met at 99.53%; each is an invariant guard the type system cannot express, listed with its file, line, and reason in §10.3 | Close them only if a schema change makes them reachable |
| E2 | Public benchmark execution (BIRD-Interact, nvBench, Text2Vis) | The phase delivers the evaluation plan, power analysis, and harness contract; execution is S1/S2 | After S1 shadow mode; preregister, then run |
| E3 | Cortex conformance against the real package | Cortex is not published; depending on it is explicitly out of scope | When `@agentix-e/cortex-*` publishes: switch to `import type`, add a conformance test |
| E4 | On-device embedding adapter (ONNX/WebGPU) | POC-3 validated the retrieval behaviour via API; the adapter is product work | P2; must pass N11 (CPU/WebGPU, no CUDA) |
| E5 | 100k-item scale checkpoint | 10k is measured at 3.10 ms p95 and 13.9 MB; the next order of magnitude is a separate benchmark | When a host reports >50k items; add SQLite + scope index |
| E6 | Per-user preference scope | A product feature, not a design defect; requires a cold-start policy | After S1 shows cross-user variance |
| E7 | Multi-process JSONL writer | Documented single-writer constraint; the target deployment is one process | When a host runs >1 writer: add a lock or a Postgres `MemoryPort` |
| E8 | LLM judge calibration (κ ≥ 0.7) | The protocol is specified; no human labels exist yet in this phase | S2, with 200 human labels |

### 15.3 Next actions, in order

1. **Approve the positioning** (house conventions, library, CPU/WebGPU) and the S1 gate.
2. **Instrument nl2charts** for correction rate (K2) — one week, no model cost.
3. **Run S1 shadow mode** on the private adjudicated set (n=1300, κ≥0.7).
4. **Publish `0.1.0-next`** after E1; run the live POC against the packed tarball.
5. **Run S2** on the full BIRD-Interact set (600, detects ~5.8pp) and nvBench 2.0.
6. **Decide on S3** only if S2 replicates; otherwise invoke K1 and stop.

## 16. Appendix

### 16.1 File map

```
packages/core/src/kernel     types, errors, ids, clock, hash, diff, similarity, stats, guard, policy, knowledge
packages/core/src/memory     port, journal (memory + JSONL), lexical-index, store
packages/core/src/distill    distiller, generalize, rules, llm
packages/core/src/apply      render, pack
packages/core/src/capture    options, trust, normalize, run, microglia, export, doctor
packages/core/src/providers  contracts, registry
packages/node/src            app (Hono routes), server, providers/{deepseek,zhipu}, store/cortex
packages/browser/src         client, outbox
packages/eval/src            stats, protocol, attribution, scenario, study, report, workload/, bench/run
bench/results                study.json
```

### 16.2 Reproduce

```bash
cd microglia
pnpm install
pnpm check
# typecheck → 4 projects
# 370 tests, coverage 100 / 99.53 / 100 / 100
# study: 9 arms × 6 rounds, 15 gates, 3 micro-ablations, artifacts in bench/results/
```

### 16.3 Schema examples (serialised form)

**Event**

```json
{
  "schema": "microglia.feedback/1",
  "id": "fb_01j9z3k4m2_7f3a9",
  "at": 1700000000000,
  "namespace": "acme",
  "sessionId": "default",
  "runId": "run_01j9z3k4m1_1a2b3",
  "task": "chart.recommend",
  "kind": "edit",
  "actor": { "type": "user" },
  "trust": 0.9,
  "signal": {
    "type": "edit",
    "beforeHash": "9f2c…",
    "afterHash": "1b7e…",
    "ops": [{ "op": "set", "path": ["mark"], "before": "bar", "after": "line" }],
    "distance": 1,
    "after": { "mark": "line", "x": "order_date", "y": "revenue", "aggregate": "sum" }
  },
  "provenance": { "knowledgeIds": ["k_…"], "retrievalHash": "ab12…" },
  "redactions": 0
}
```

**Knowledge**

```json
{
  "schema": "microglia.knowledge/1",
  "id": "k_01j9z3k5a0_9c1d2",
  "namespace": "acme",
  "kind": "constraint",
  "scope": { "task": "chart.recommend", "intent": "trend" },
  "statement": "For a trend question over revenue. Use a line chart rather than a bar chart.",
  "payload": { "when": { "intent": "trend" }, "then": { "mark": "line" } },
  "evidence": [{ "feedbackId": "fb_…", "runId": "run_…", "at": 1700000000000, "weight": 0.9 }],
  "support": 0.9,
  "contradictions": 0,
  "confidence": 0.616,
  "trust": 0.9,
  "validFrom": 1700000000000,
  "validUntil": null,
  "systemFrom": 1700000000000,
  "systemUntil": null,
  "status": "active",
  "statusReason": "confidence-cleared",
  "applied": 0,
  "succeeded": 0,
  "createdAt": 1700000000000,
  "updatedAt": 1700000000000
}
```

`Infinity` serialises to `null` in JSON, and `null` would poison every arithmetic comparison with
`NaN`. `rehydrateKnowledge` maps the two timestamps back to `Infinity` on load; the round-trip is
covered by a test that asserts `validUntil === Infinity` and a finite `confidence` after reopen.
This is the only place where the in-memory and serialised forms differ.

### 16.4 Glossary

| Term | Meaning |
|---|---|
| **Correction** | A feedback event that contains an alternative to the generated output |
| **Constraint** | Declarative knowledge that narrows valid outputs |
| **Exemplar** | A worked input→output pair |
| **Scope** | The conjunction of dimensions in which a claim holds |
| **Generalisation** | Dropping the domain dimension when the same claim recurs elsewhere |
| **Pack** | The rendered, bounded set of knowledge injected into one prompt |
| **Credit** | Recording whether an applied item helped or hurt |
| **Quarantine** | A holding state for low-trust evidence |
| **Reuse rate** | Share of previously-failing questions fixed by memory alone |

---

## 17. Acceptance criteria, per stage

A stage is "done" only when every row passes **and** the artifact is committed. A missed target is
reported as missed; it is never rounded, re-sliced, or moved to a footnote.

| Stage | Criterion | Threshold | n / power | Artifact |
|---|---|---|---|---|
| S0 | Mechanism lift | ≥ +20pp, p<0.01 | 280 paired | `bench/results/study.json` (present) |
| S0 | Transfer to unseen domain | ≥ +40pp over no-generalisation | 70 paired | same |
| S0 | Poison activation | 0 | 12 injected edits | same |
| S0 | LLM distillation | mark ≥90%, intent ≥95%, 0 active injections | 24 free-text events | `poc/results/poc-llm-distill.json` |
| S0 | LLM reader, house conventions | ≥+50pp over no pack | 28 house cases | `poc/results/poc-llm-reader.json` |
| S0 | Generic knowledge neutrality | no more than −5pp | 42 generic cases | same |
| S0 | Retrieval under heavy paraphrase | dense ≥ BM25 +5pp recall@1 | 48 pairs | `poc/results/poc-embedding.json` |
| S0 | CPU scale | p95 ≤50ms at 10k items | 100 queries × 3 sizes | `poc/results/poc-scale.json` |
| S1 | Chart top-1 lift | ≥ +3pp, p<0.05 | 1300 adjudicated, κ≥0.7 | shadow report |
| S1 | SQL regression | ≤ 1pp loss (non-inferiority) | 1300 | shadow report |
| S1 | Knowledge precision | ≥ 85% on a 100-item audit | 100 sampled | audit sheet |
| S2 | BIRD-Interact (full) | ≥ +5pp vs same-backbone | 600; detects ~5.8pp | preregistered report |
| S2 | nvBench 2.0 | ≥ +3pp overall, ≥ +5pp on unnamed subset | 750 | report |
| S2 | Text2Vis answer match | ≥ 33% (from 29.09%) | 1,985 | report |
| S2 | MemoryAgentBench | ≥ 60% four-competency average | 2,071 | report |
| S3 | BIRD-Interact Lite | ≥ 30% task success | 300 | report |
| S3 | nvBench 2.0 F1@5 | ≥ 85 | 7,878 | report |
| S3 | Judge calibration | κ ≥ 0.7 vs 200 human labels | 200 | calibration sheet |

**Stop rules.** S1 fails → invoke K1 (stop, do not pivot). S2 fails on two benchmarks → do not
proceed to S3. A safety gate failure (G4/G7/G11) blocks release regardless of accuracy.

---

## 18. Termination signal

**STOP — this phase is complete; awaiting the next instruction.**

Delivered and verified in `AgentiX-E/microglia-docs`:

| Item | Evidence |
|---|---|
| Product whitepaper | `WHITEPAPER.md`, 60+ citations, live-POC numbers, CPU/WebGPU constraint, competitor source audit |
| Technical design | `TECH-DESIGN.md`, packages, API, algorithms, security, Cortex verdict, POC register, ADRs, acceptance criteria |
| Monorepo | 8 packages, layered, import-on-demand; zero runtime deps in core/capture/apply/distill |
| Tests | **370 passing**, coverage **100 / 99.53 / 100 / 100** |
| Mechanism study | 9 arms, 3 micro-ablations, 15 gates, all green; artifacts committed |
| Live POCs | DeepSeek distillation, LLM reader (generic/house/poison), Zhipu embedding retrieval, CPU scale |
| CI | `ci` and `poc-live` workflows, both verified on the private repository |

**In-scope gaps: none.** The eight scheduled engineering items in §15.2 are explicitly outside this
phase (public benchmark execution, published-Cortex conformance, on-device encoder, 100k scale,
multi-user, judge calibration); none blocks the design or the POC.

The next action is a decision, not a task: approve S1 (shadow mode on nl2charts), or redirect the
positioning. No further code will be written until that decision is given.

---

*The implementation in `packages/` is the normative version of §5 and §6; where prose and code
disagree, the code wins and the prose is a bug.*
