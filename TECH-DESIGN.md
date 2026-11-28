# Microglia — Technical Design

**Headless feedback flywheel for agentic workflows**

Version 1.2 · 2026-10-21 · Author: Lambertyan · Status: design complete after audit pass 2, implementation frozen

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
| §17 | The feedback → knowledge → re-feed pipeline: stages; the **decision register** (§17.18); twelve gaps closed (§17.19); end-to-end metrics and cost (§17.20); delivery contracts (§17.21); competitors v2 (§17.22); POC register v3 (§17.23); package mapping and signatures (§17.25); footprint budgets (§17.26); lane plan and SOTA ladder (§17.27); source register (§17.28); disambiguation (§17.29); POC conclusions (§17.30); statistical discipline (§17.31); dataset manifest (§17.32); versioning and migration (§17.33) |
| §18 | Stage acceptance criteria and the eight release gates |
| §19 | The termination record: three audit passes and the requirement-by-requirement discharge |

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
| N7 | Branch coverage | ≥95% | **99.54%** — the bar is met; the 14 remaining arms are enumerated in §10.3 with the reason each cannot be taken. G-7 (the 39 reachable arms) is closed |
| N8 | No network in tests | 0 calls | 0 |
| N9 | No mocks of the system under test | ports only | fakes only for `Storage`/`LLM` |
| N10 | ESM-only, tree-shakable | `sideEffects: false` | declared |
| N11 | **CPU or WebGPU only** | no CUDA/ROCm, no local GPU runtime | CI runs on CPU; no GPU dependency |
| N12 | Memory at 10k items | ≤100 MB heap | **13.9 MB** measured |
| N13 | `recall` p95 at 10k items | ≤50 ms | **2.68 ms** measured at 10k, **22.73 ms** at 100k |

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

All numbers below are from `pnpm eval:scale` on the CI runner class (2 vCPU, Node 22). The product
has no GPU path; embeddings, when enabled, run through an ONNX/WASM or WebGPU encoder on the host.

| Items | Build | `recall` p50 | `recall` p95 | Heap delta | Pack tokens |
|---|---|---|---|---|---|
| 1,000 | 13 ms | 1.26 ms | 1.91 ms | 6.3 MB | 260 |
| 10,000 | 69 ms | 2.11 ms | 2.68 ms | 29.3 MB | 258 |
| 50,000 | 329 ms | 8.89 ms | 10.76 ms | 113.1 MB | 257 |
| 100,000 | 750 ms | 18.65 ms | **22.73 ms** | **173.9 MB** | 257 |

The scope scan is O(n), and the table is what that costs: 2.7 ms p95 at 10k, 22.7 ms at 100k, a
10k→100k growth of 8.5x against 10x the items. Pack tokens are flat (257–260), which is the point of a
budget: more knowledge changes what is selected only when it changes what is relevant.

An earlier version of this section claimed 10k would be the bottleneck; that was an inference, and it is
withdrawn. The scan is still O(n) — the shape of the curve says so — but the constant is small enough that
100k items cost 22.7 ms, not the 50 ms the inference implied. What the measurement adds is the second axis
nobody had looked at: **memory**. 174 MB of heap for 100k rules is the number a host actually runs into,
and it is the reason the index would still be worth building before the latency budget is crossed.

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

### 10.3 The uncovered branch arms, counted and classified

**99.54% (3087/3101), 14 arms**, with no ignore comment anywhere in the repository. Two earlier versions of
this section were wrong in the same direction — "seven arms at 99.53%", then "59 arms at 97.93%" — because
the number was restated when a feature landed and never re-derived from the report. It is now measured with
`vitest --coverage.reporter=json` and enumerated arm by arm; the 14 that remain are listed below, each with
the reason it cannot be taken.

**The campaign that got here (G-7).** 39 reachable arms were taken between iterations 48 and 49, and doing
it found seven defects that the suite had been passing over — an HTTP query string that answered typos with
an empty list, a schema-only database scoring as 100%, a model-response parser that discarded valid replies,
a memory-formation harness that defaulted away its own inputs. They are recorded in PROGRESS §49; the point
here is that the arms were reachable *and* load-bearing, which is why the campaign was worth running instead
of writing them off as guards.

| File:line | The arm that never runs | Why it is unreachable |
|---|---|---|
| `core/src/capture/curate.ts:128` | one arm of the density comparator | reached only when V8's sort calls the comparator with the two operands in the order the test happens not to produce; the tie-break itself is exercised in both directions |
| `core/src/distill/generalize.ts:151` | `target === undefined` after a non-empty sibling filter | `pickGeneralizationTarget` returns the first sibling when none is active |
| `core/src/kernel/diff.ts:113` | `key === undefined` when applying an op | the empty-path case returns earlier, so a non-empty path always has a last element |
| `core/src/kernel/knowledge.ts:472` | `right === undefined` in `strongestTier` | every item the store writes carries a tier; the arm guards rows written before the field existed |
| `core/src/kernel/stats.ts:93` | `logSumExp` over an empty sample | `mcnemarExact` returns at `n === 0`, so the sum never sees zero terms |
| `core/src/memory/journal.ts:188` | the empty-compaction newline | compaction only runs with at least one row |
| `core/src/memory/lexical-index.ts:38` | a token with no posting bucket during removal | `add` is the only writer and it creates the bucket before recording the token |
| `core/src/memory/store.ts:170` | a candidate id that resolves to no knowledge item | the index and the map are written in the same call, so they cannot diverge |
| `eval/src/ablations.ts:98` | `status: 'missing'` for the learned rule | the store has no delete, so the rule the function just learned is still there |
| `eval/src/competitor.ts:127` | skipping an already-correct baseline item | the fact-store corpus is filtered to defective items first |
| `eval/src/lanes/delivery.ts:140` | the "receiver has no port" guard | the guard runs after `listen` resolved, and a resolved listener has an address |
| `eval/src/report.ts:112` | the "still injected" wording of the credit row | one run produces one credit ablation, whose rule is always withdrawn |
| `eval/src/study.ts:653` | `baseline?.holdout ?? []` | the baseline arm is always present; the fallback guards a schedule change |
| `node/src/mcp.ts:228` | the re-throw of a non-library error from `recordFeedback` | every refusal in the library is a `MicrogliaError`; swallowing anything else would hide a bug behind `isError: true` |

Each of these protects a state the type system cannot express, and deleting one would turn a future bug
into silent data loss rather than an exception. The alternative — an `ignore` comment — would make the
number look better and the code worse, so the number stays where it is and the list stays in the document.


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

The BIRD lane (`packages/eval/src/bin/sota-bird.ts`) implements this as:

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
| POC-1 | Can an LLM turn free-text feedback into a scoped lesson? | DeepSeek + shipped prompt/parser | 24 | `pnpm eval:llm-distill` | `eval/results/poc-llm-distill.json` | 91.7–95.8% mark, 95.8–100% intent, 0 active injections |
| POC-2 | Does a real LLM follow the pack? | DeepSeek reader, generic vs house vs poison | 70 | `pnpm eval:llm-reader` | `eval/results/poc-llm-reader.json` | generic −2.38 to 0pp; house +75.00 to +89.29pp; poison 0 to −8.33pp |
| POC-3 | Does lexical retrieval survive paraphrase? | BM25 vs embedding-3 vs rank fusion | 96 | `pnpm eval:embedding` | `eval/results/poc-embedding.json` | BM25 best for light; dense +8.4pp for heavy |
| POC-4 | Is CPU retrieval viable at 100k items? | Synthetic store, 100 queries | 4 sizes | `pnpm eval:scale` | `eval/results/poc-scale.json` | 22.73 ms p95, 174 MB at 100k; the W3 trigger stays unmet |
| POC-5 | Can a competitor's design be reproduced from source? | Source audit of 5 OSS projects + Cortex | — | §8.5 | this document | No OSS project models a correction as evidence |
| POC-6 | Does a pack ever claim a rule it did not render? | Budget sweep 60…2400 chars over 40 rules | 64 budgets | `pnpm test packages/apply` | `budget.test.ts` | **No longer** — a bug, see §12.7 |
| POC-7 | Does the adapter match the real cortex build? | Clone, build, then compare field sets | 1 item | `pnpm eval:cortex` | `cortex.yml` | 12 fields matched; the structural copy is correct |
| POC-9 | Does the loop help a real model on a public benchmark? | BIRD Mini-Dev, cross-fitted k=5, execution accuracy | 352 (every usable question) | `pnpm eval:sota` / `sota.yml` run `39390556532` | `eval/results/poc-sota-bird.json` | **54.83% → 51.99% (−2.84pp, 95% CI [−6.25, +0.57], p=0.143)**; 2.25 rules/question; no fold positive |
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
artifacts are `eval/results/poc-*.json`; runs B and C are `poc-live` CI runs `39360812609` (02:50Z)
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

**The W3 decision, now measured rather than assumed.** The index was deferred on "more than 50k rules",
a number nobody had tested. The lane measures to 100k and applies a rule stated before the numbers: the
index is needed when p95 at 100k exceeds **100 ms** (a 4x margin over the measured value, so the gate
measures the code and not the runner) or when the heap at 100k exceeds **256 MB**. At this commit:
22.73 ms and 173.9 MB locally, 24.73 ms and 198.6 MB on the CI runner, so **`index_needed = 0` on both axes**
and W3 stays deferred — with the numbers that would change the answer written down, and a gate that fails the
build when either is crossed. The growth ratio is reported (8.0–8.5x) but not gated: it is a ratio of two
quantiles over 100 samples, noisier than either budget.

**Where the deferral actually ends.** Heap is linear in items (6.3 → 29.3 → 113.1 → 173.9 MB), about 1.7 KB
per rule locally and 2.0 KB on CI. Against the 256 MB budget that puts the boundary at **roughly 130k
rules**, not at 100k — which is the number to quote when someone asks when the index is needed. Latency has
far more room: the 100 ms budget would not be crossed until several hundred thousand items, by the same
extrapolation.

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

**Per-rule attribution** (`eval/results/poc-sota-attribution.json`, computed from the per-case rows):

| Rules ever injected | Harmful (net < 0) | Helpful (net > 0) | Neutral | Share of injections belonging to a harmful rule |
|---|---|---|---|---|
| 445 of 1,110 | 34 | 27 | 384 | 10.0% |

86% of the rules that were ever injected changed nothing. The damage is not concentrated in a few bad
rules that could be retired — retiring all 34 would address at most 10% of injections — which rules out
"the distiller writes wrong facts" as the explanation and reinforces "the facts are redundant".

**What the packs actually contained** (corrected in §17.34.3). The lane records, per case, the share of the
question's content words that the pack's best rule mentions. Across **352** questions: median **18.2%**,
p75 25.0%, p90 35.3%, maximum 75.0%, and **3.1% of packs mention none** of the question's words.

An earlier revision of this paragraph reported median 7.1% and 47% zero. Those are the distribution of the
**40-question smoke run** with `minCoverage = 0.34`, which emptied most packs; they were published here as
if they were the 352-question result. The correction matters: at 3.1% zero and 18.2% median, the packs were
*not* textually unrelated to their questions, so "inert because it was unaddressed" is the wrong
explanation — the right one is the one the oracle arm gives, that the knowledge was redundant.

It also fixes the only sensible value for a coverage floor. A first attempt used 0.34, which emptied
every pack on every question; gate V6 refused the run, which is exactly what V6 was added for. A floor
below the median is the only one that leaves anything to measure.

**A defect this run did not fix.** 165 of 641 distillation calls (25.7%) returned non-JSON and were
dropped, unchanged from 25.9% before the token budget was raised: the failure is not truncation. The
pack is therefore built from three quarters of the corrections, and the next round records the reply
prefix so the cause is visible instead of guessed.

### 12.13 POC-11 — relevance gating, and the parser bug that biased the pack

**Question.** If the pack is inert because it is injected whether or not it is relevant, a floor on
relevance — not a better distiller — is the repair. The hypothesis was built on a misread distribution
(§17.34.3): it assumed 47% of packs shared no content word with their question, when the 352-question run
shows 3.1%. The arm still ran, and its result is read accordingly.

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

### 12.14 POC-12 — convention transfer: the first positive read

**Question.** Everything above measures the loop on knowledge the model does not need. This measures it
on knowledge the model cannot infer: a house convention.

**Protocol** (preregistered in the roadmap §S2b, with two amendments forced by measurement).

1. **Subset by rule, not by outcome.** A question qualifies when its gold returns one row with one
   numeric column. 146 of 352 Mini-Dev questions do.
2. **Convention.** The workspace reports every numeric answer rounded to the nearest ten. The database
   is untouched, so nothing in the schema reveals it. `round = round(value / 10) * 10`.
3. **Learning.** The model answers without a pack; the correction it receives is the same query
   reported the way the workspace reports. The memory sees only that correction.
4. **Arms.** `none`; `full` (learned from the other folds); `stated` (the rule written once in the
   prompt — the ceiling); `oracle` (the accepted value written in the prompt — a channel probe).
5. **Judgement.** The prediction is executed; one numeric answer, compared at the convention's
   precision.

**Result.** Run `39548548865`, n=146, 5 folds, 1,715 calls, 42 minutes, 189.6 active rules per fold,
2.08 rules injected per question.

| Arm | Accuracy | Δ vs none | 95% CI | p |
|---|---|---|---|---|
| none | 6.85% | — | — | — |
| **full (learned)** | **11.64%** | **+4.79pp** | **[+1.37, +8.90]** | **0.0156** |
| stated (rule in prompt) | 17.81% | +10.96pp | [+6.16, +16.44] | 0.0001 |
| oracle (value in prompt) | 9.59% | +2.74pp | [+0.68, +5.48] | 0.125 |

McNemar: **7 questions gained, 0 lost.** Minimum detectable difference 5.08pp. All instrument gates
passed except V6, which asked the `stated` arm for rules-per-question when that arm injects a sentence
and no pack — a gate bug, fixed in `f5b53b4`, not a result.

**What it establishes.**

1. **The loop transfers a convention it was never told.** +4.79pp with no losses, from corrections
   alone, on held-out questions. After four null reads on knowledge the model could infer, this is the
   first statistically significant positive effect on public data.
2. **It recovers 44% of the ceiling.** Stating the rule is worth +10.96pp; learning it from feedback is
   worth +4.79pp. The gap is the honest measure of what distillation loses — and the number to improve.
3. **Rules are followed; values are not.** Telling the model *the accepted answer* moved accuracy by
   2.74pp and not significantly (p=0.125); telling it *the rule* moved it by 10.96pp (p=0.0001). The
   prompt frames the block as reference data, and a model that treats data as data will copy a
   convention but not an answer. This is a constraint on lesson design, not a defect: a lesson has to
   be a rule about how to answer, not an answer.

**Replication (run `39608497021`, same protocol).** 6.85% → 8.90%: **+2.05pp, CI [0.00, 4.79],
p = 0.250**, three gained and none lost; the stated ceiling reproduced at **+11.64pp (p = 0.0001)** and
the value arm at +2.74pp (p = 0.125).

| Run | full Δ | p | gained : lost | stated Δ |
|---|---|---|---|---|
| 1 | +4.79pp | 0.016 | 7 : 0 | +10.96pp |
| 2 | +2.05pp | 0.250 | 3 : 0 | +11.64pp |
| pooled | **+3.42pp** | — | **10 : 0** over 292 question-evaluations | — |

**What it does not establish — revised by the replication.** The effect is real in direction (ten
questions gained, none lost, across two runs) but **not stable in magnitude**: 4.79pp in one run,
2.05pp in the next, against a stated ceiling that barely moved (10.96 → 11.64). The two runs share
their questions, so the pooled 10:0 ratio is not an independent sample and its p-value would be
optimistic; the defensible statement is that the loop recovers **roughly a quarter to a half of the
stated ceiling**, and that the ceiling itself is the stable quantity.

That gap is the next target: 189.6 active rules per fold, 2.08 injected per question, and only 10
questions moved across two runs. Either retrieval is not finding the rule that applies, or the
distilled rule is weaker than the stated one. The per-case `packIdList` and `armSql` fields exist to
answer which.

**Why this answers the earlier nulls.** On unmodified BIRD the pack was inert because there was nothing
to learn that the schema did not already say; here the knowledge is unreachable from the schema, and
the same machinery moves accuracy. The boundary is now measured from both sides: **the flywheel is
worth what the convention is worth, and nothing more.**

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
| E8 | ~~LLM judge calibration (κ ≥ 0.7)~~ **reference supplied** | Closed as a label-acquisition item, open as a judge item: ROSE-VEC provides 322 expert-adjudicated BIRD predictions plus five annotators' raw files; committee self-agreement is κ 0.7085, which is the ceiling any criterion is measured against. Execution accuracy reaches κ 0.4717 (set) / 0.2995 (multiset) on the same items — the bar, the ceiling, and the gap are all reproducible via `pnpm eval:judge` | Introduce a judge only as its own decision (provider, prompt version, per-item spend): a judge scored in the same run that defines the reference would make the first number about the judge |

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

## 17. Feedback → knowledge → re-feed: implementation contract v2

This section is the **design-phase deliverable** for the pipeline questions raised after the first
convention read. It is normative: each stage has a data contract, an algorithm, the failure modes it
must survive, the metrics that decide whether it works, and the gate that blocks a release. Every
claim here is tied to one of: our own artefacts (§12), a competitor's published source or paper, or a
POC in §17.13.

Nothing in this section has been implemented in `AgentiX-E/microglia`; the repository is frozen for the
design phase. Where a decision needs data we do not yet have, it is marked **POC** with the number that
will settle it.

### 17.1 The contract, in one paragraph

> A **task instance** accumulates attempts. Each attempt is a run with a prompt, an output, and the
> knowledge it was given. Feedback attaches to an attempt and carries the host's context. The pipeline
> turns evidence into **scoped claims with a validity interval**, admits them on a lower confidence
> bound, keeps per-claim **utility counters**, and serves them back as a bounded, explained pack — or
> through a tool the agent calls itself — at the granularity of the task type that asked.

Two properties follow from the measurements already in hand and constrain everything below:

1. **Knowledge is only worth what it cannot be inferred.** Four reads on unmodified BIRD were null
   (§12.11–§12.13); the convention lane moved (+4.79pp, then +2.05pp) while stating the same rule moved
   +10.96/+11.64pp. The pipeline's job is to close that gap, not to produce more rules.
2. **The pack is read, and it is addressed.** The corrected distribution (§17.34.3) shows a median of
   18.2% of the question's content terms present in the best rule, only 3.1% of packs with none, and 99.7%
   of questions having at least one active rule that shares a term. Retrieval **availability** is therefore
   not the constraint — the earlier claim that it was rested on a 40-question probe's numbers — and the
   binding constraint is **selection among ~186 active rules** plus the redundancy of what is selected.

### 17.2 The eight stages

```
P0 ingest ─► P1 normalise ─► P2 interpret ─► P3 consolidate ─► P4 curate
                                                                    │
P8 serve ◄─ P7 attribute ◄─ P6 render ◄─ P5 retrieve ◄──────────────┘
```

| Stage | Input | Output | Owned by |
|---|---|---|---|
| P0 ingest | task, attempt, output, feedback, context | `TaskRecord`, `RunRecord`, `FeedbackEvent` | `core/capture` |
| P1 normalise | event | redacted event, trust, structural diff | `core/kernel` (diff/guard) |
| P2 interpret | event + run + context | `DistillCandidate[]` | `core/distill` |
| P3 consolidate | candidates | `KnowledgeItem` with evidence, validity, status | `core/kernel` + `core/memory` |
| P4 curate | active set | merged/pruned set, utility counters | `core/distill` (new) |
| P5 retrieve | query + taskType + context | ranked candidates | `core/apply` |
| P6 render | selected items + budget | `KnowledgePack` | `core/apply` |
| P7 attribute | run + feedback + pack ids | credit, utility deltas, retirement | `core/capture` (new) |
| P8 serve | everything above | HTTP / tool / webhook | `node` / `browser` |

### 17.3 P0 — Ingest: the task instance

**Mechanism.** A host opens a task, then begins attempts under it. The task is the unit of *intent*;
the attempt is the unit of *generation*. Feedback always names an attempt, and a terminal decision
names the task.

```ts
type TaskOpen = {
  taskId: string;            // host-assigned, stable across attempts
  taskType: string;          // the workflow step, in the host's vocabulary
  sessionId?: string;        // conversation, when one exists
  context?: JsonObject;      // host-defined, redacted, capped (16 KiB)
};

type AttemptStart = {
  attempt: number;           // 1-based, monotonic within the task
  parentRunId?: string;      // the attempt this one revises
  input: JsonObject;
  pack?: KnowledgePack;
  model?: string; promptVersion?: string; appVersion?: string;
};

task.complete({ status: 'accepted' | 'abandoned' | 'escalated', finalRunId?, reasonCode?: string, context? });
```

**Why this shape.** `sessionId` alone cannot express "the third rewrite of attempt 2 of task 7 was
accepted"; without that, the distiller can only diff adjacent edits and never learns what the task
finally required. The cost of not having it is visible in our own data: the convention lane learned
from single corrections and recovered 2.05–4.79pp of a 10.96–11.64pp ceiling.

**Failure modes.** Attempt numbers reused after a retry (host bug) → reject with
`MG_E_TASK_CONFLICT`; feedback on an uncommitted run (already rejected, `MG_E_NO_OUTPUT`); task
completed twice (idempotent, second is a no-op returning the first decision).

> **Implemented (iteration 21, `capture/task.ts`).** `openMicroglia().openTask()` returns a `TaskHandle`
> with `begin` / `complete` / `record` / `attemptCount`; `RunRecord` and `FeedbackEvent` carry
> `taskId`, `attempt` and `parentRunId`. Two deviations from this paragraph, both deliberate: a **skipped**
> attempt number is refused as well as a reused one (a gap hides a generation), and a second `complete()`
> **throws** `MG_E_TASK_CLOSED` instead of returning the first decision — a silent no-op is how a host
> loses track of whether its decision landed. `reasonCode` is preserved on the emitted outcome event.

| Metric | Definition | Gate |
|---|---|---|
| Task linkage completeness | tasks with ≥1 terminal decision ÷ tasks opened | ≥ 0.95 at integration |
| Attempt-chain integrity | attempts whose `parentRunId` resolves within the task | 1.00 (blocking) |
| Context admission rate | contexts accepted ÷ submitted (size/entropy checks) | ≥ 0.99 |
| Ingest p95 latency (local journal) | append + fsync + index insert | ≤ 5 ms at 10k events |

**Alternatives rejected.** (a) *One run per task, mutated in place* — loses the history a correction
cites; (b) *sessionId only* — cannot group a workflow that spans sessions; (c) *host-side grouping with
no library notion* — then distillation cannot see the accepted final state, which is the whole signal.

### 17.4 P1 — Normalise: trust, redaction, structure

Unchanged in mechanism, extended in scope: context is redacted with the same guards as payloads, and
its keys are validated against a host-declared allowlist for indexing (`indexedKeys`), everything else
stored opaque.

| Metric | Definition | Gate |
|---|---|---|
| Redaction recall | secret spans removed ÷ spans planted (200-case corpus, POC-13) | ≥ 0.99 |
| Redaction precision | spans removed that were secret ÷ spans removed | ≥ 0.95 |
| Schema validity | events passing schema check ÷ accepted | 1.00 |
| Trust calibration | mean predicted trust − observed acceptance rate, per signal kind | ≤ 0.10 absolute |

### 17.5 P2 — Interpret: pairwise contrast, not adjacent diffs

**Mechanism.** Three interpreters, composed in this order and all producing the same candidate type:

1. `ruleInterpreter` — structural deltas (no model).
2. `pairContrastInterpreter` (new) — given `(firstWrongRun, acceptedRun)` of one task, ask the model
   for the *difference that mattered*: one claim, one scope, no narrative. This is ExpeL's
   success/failure contrast, applied to a task instance instead of a training set.
3. `modelInterpreter` — free-text feedback (existing).

The pair is chosen by P0's task chain: earliest non-accepted attempt vs the accepted one. Adjacent
edits remain the fallback when a task has no terminal decision.

**Why.** ExpeL measured that insights extracted from success/failure pairs transfer (FEVER 63 → 70
with adaptation) while insights from single trajectories do not. Our own lane shows the weaker version
of the same effect: single-correction lessons raised accuracy by 2–5pp against a 11–12pp stated
ceiling. **POC-14** tests whether pair contrast closes part of that gap.

| Metric | Definition | Gate |
|---|---|---|
| Candidate yield | corrections producing ≥1 candidate ÷ corrections with a gold answer | ≥ 0.90 |
| JSON validity | replies parsing as a candidate ÷ replies | ≥ 0.99 (currently 0.95 after the §12.13 fix) |
| Statement precision (human) | accepted statements ÷ sampled statements (100, two raters, κ≥0.7) | ≥ 0.85 |
| Scope precision | candidates whose scope matches the correction's actual scope | ≥ 0.90 |
| Claim specificity | statements naming a condition + an action (heuristic + audit) | ≥ 0.80 |

**Alternatives.** *LLM-only* (mem0's additive extraction: one call over a top-10 candidate set, no
explicit thresholds — measured in their source at `top_k=10`, MD5 exact dedupe, entity cosine 0.95)
loses the deterministic path we need for structured edits; *rule-only* cannot read free text. Both are
kept, composed, with pair contrast added.

### 17.6 P3 — Consolidate: validity intervals and admission

**Mechanism (changed).** Each item gains an explicit validity interval and a supersession pointer:

```ts
type Validity = { validFrom: number; validTo?: number; supersededBy?: string; reason?: string };
```

A contradiction does not simply demote the loser: it **closes** the loser's interval at the winner's
`validFrom`, keeping it retrievable for questions about the past (Graphiti's bi-temporal model,
verified in `edge_operations.py`: `valid_at` / `invalid_at` / `expired_at`, invalidation by interval
geometry, no similarity threshold). Admission stays a Wilson lower bound on evidence, with the
distinct-task count entering support.

| Metric | Definition | Gate |
|---|---|---|
| Duplicate rate | items sharing a dedupe key ÷ items created | ≤ 0.02 |
| Merge precision | merged pairs a human agrees are the same claim (100 pairs) | ≥ 0.95 |
| Contradiction F1 | on a labelled set of 150 claim pairs (POC-15) | ≥ 0.90 |
| Retirement latency | events between "claim falsified" and "not injected" | ≤ 3 events or 1 curation round |
| Admission precision | active items a host expert accepts (100-item audit) | ≥ 0.85 |
| Quarantine ratio | quarantined ÷ stored, steady state | 0.02–0.15 (alarm outside) |

**Alternatives.** *Status-only demotion* (current): cannot answer "what was true in March"; *delete on
contradiction*: destroys the audit trail a correction is supposed to provide; *no contradiction model*
(mem0's additive pipeline): the store accumulates both sides and retrieval picks arbitrarily.

### 17.7 P4 — Curate: delta updates, counters, budget

**Mechanism (new stage).** Curation runs on a schedule (`curatorFrequency`, default: every 50 events or
5 minutes, whichever first) and applies **deltas only** — add, merge, prune, never a full rewrite. Each
item carries utility counters:

```ts
type Utility = { injected: number; used: number; flippedUp: number; flippedDown: number; votes: number };
```

Merge policy: near-duplicate (dice ≥ 0.85 on statements, same scope) survivors inherit the sum of
counters. Prune policy: `flippedDown ≥ 3 ∧ flippedDown > flippedUp` or `injected ≥ 20 ∧ flippedUp = 0`.
Budget policy: cap items per task type (default 2 000) by pruning the lowest utility density first.

**Why this shape.** ACE names the two failure modes of every self-improving context — brevity bias and
context collapse (an 18k-token playbook collapsing to 122 tokens in one rewrite) — and answers them
with itemized bullets, helpful/harmful counters, delta updates and a periodic curator; it reports
+10.6% on AppWorld and −83.6% tokens against GEPA. Our current pipeline rewrites nothing, but it also
has no counters and no pruning, which is why 384 of 445 injected rules changed nothing (§12.12).

| Metric | Definition | Gate |
|---|---|---|
| Counter integrity | items whose counters equal the replayed event log | 1.00 (blocking) |
| Prune precision | pruned items a human agrees were useless (50 samples) | ≥ 0.90 |
| Store growth | items per 1 000 events, steady state | ≤ 120 |
| Retention under curation | rules with ≥3 helpful uses still active after 10 rounds | ≥ 0.95 (anti-collapse) |
| Curation cost | model tokens per curation round | ≤ 2 000 |

**Alternatives.** *Rewrite-on-every-event* (ACE's rejected baseline): context collapse; *no pruning*
(current): 189.6 active rules per fold and 2.08 injected per question is a retrieval problem created
by an unpruned store; *embedding-only merge*: misses contradictions, which are the point.

> **Implemented (iteration 22, `capture/curate.ts`).** `mg.curate({ dryRun, prune, maxItemsPerTask,
> mergeThreshold })` merges statements in the same kind and scope at dice ≥0.85, retires the loser with
> `statusReason: merged:<id>` and a closed `validUntil`, and prunes by Laplace-smoothed density
> `(flippedUp+1)/(injected+2)` only when `prune: true`. Three deviations: the pure merge decision lives in
> `capture` rather than `distill` (it needs the store, and `distill` must stay store-free); the cap is
> reported as `overCap` instead of pruning by default; and merging is **conservative** — a one-word variant
> at six tokens scores 0.83 and stays separate, because a wrong merge loses a rule while a missed merge
> costs a duplicate.

### 17.8 P5–P6 — Retrieve and render: address the question

**Mechanism (changed).** Scope gains `taskType` and `stage` (hard filters); `context` enters as a soft
boost; the coverage floor applies per item (already implemented); over-fetch scales with limit
(`max(4×limit, 60)`, mem0's measured choice, vs our current `max(3×limit, 12)` — POC-17); every pack
reports `explain[]`: for each item, the reason it was selected (scope hit, lexical score, coverage,
utility) and the reason the next-best was not.

**Why.** Coverage is not the defect: the median best rule mentions 18.2% of the question's terms and only
3.1% of packs mention none (§17.34.3). With ~186 active rules per fold and 99.7% of questions having a
lexically overlapping rule, the problem is **choosing** among many plausible rules, which is why over-fetch
and an `explain[]` matter more than an alias would. An unexplained pack cannot be debugged in a host.

| Metric | Definition | Gate |
|---|---|---|
| Recall@5 (labelled) | relevant rules in top 5 ÷ all relevant (POC-17) | ≥ 0.90 |
| nDCG@10 | graded relevance, 200 queries | ≥ 0.85 |
| Zero-hit rate | questions with an empty pack, where a relevant rule exists | ≤ 0.05 |
| Stale-hit rate | packs containing a closed-interval rule for a present-tense question | ≤ 0.02 |
| Retrieval p95 @10k / @100k | CPU, single process | ≤ 5 ms / ≤ 20 ms |
| Pack adherence | generated outputs following an injected rule on a probe set | ≥ 0.90 |
| Budget compliance | rendered chars ≤ budget, always | 1.00 |

### 17.9 P7 — Attribute: credit, utility, retirement

**Mechanism (changed).** Attribution runs at two levels:

- **Attempt level (existing):** the first feedback on a run adjusts the confidence of the ids it cited.
- **Task level (new):** `task.complete({status})` distributes credit across every attempt's cited ids
  with decay `0.5^(acceptedRunIndex − runIndex)`, so the attempt that produced the accepted output
  counts most and earlier attempts count but not equally.
- **Utility (new):** `injected` is recorded at render time; `flippedUp/flippedDown` at evaluation or
  task-completion time; `used` when the host reports which ids it actually relied on.

**Why.** Without the denominator, credit is a numerator with no base: we could not distinguish "rule
never retrieved" from "retrieved and ignored". That distinction is exactly the 44%-of-ceiling gap.

> **Implemented (iteration 22).** `applyOutcome` now maintains `utility: { injected, flippedUp,
> flippedDown }` beside the existing `applied/succeeded` ledger, and `injected` counts **outcomes observed**
> on runs citing the item, not renders — a render is not a measurement, and incrementing it during `recall`
> would mutate the store while an evaluation is measuring it (gate V2 would refuse the run).

| Metric | Definition | Gate |
|---|---|---|
| Attribution accuracy | replayed runs where credit lands on the truly-relevant rule (200 runs, POC-16) | ≥ 0.90 |
| Utility calibration | mean predicted flip rate − observed, per decile | ≤ 0.10 |
| Retirement correctness | retired rules that stayed useless over the next 100 events | ≥ 0.95 |
| Double-count rate | runs crediting one item twice | 0.00 |

### 17.10 P8 — Serve: three delivery modes

| Mode | Shape | When | Status |
|---|---|---|---|
| Pull | `GET /v1/recall` | request-time prompt assembly | implemented |
| Push | `POST /v1/subscriptions` + webhook on knowledge change | long-running workflows, human-in-the-loop dashboards | **POC-19** |
| Tool | `microglia_recall` / `microglia_feedback` as MCP tools | agents that decide when to ask (BIRD-Interact shape) | **POC-20** |

| Metric | Definition | Gate |
|---|---|---|
| Idempotency | duplicate keys producing one event | 1.00 |
| Delivery latency p95 | feedback accepted → recallable | ≤ 2 s (local), ≤ 60 s (push) |
| Auth isolation | cross-namespace recall attempts rejected | 1.00 |
| Tool-call utility | tasks where the agent's self-initiated recall preceded a correct answer | ≥ 0.60 on BIRD-Interact Lite |

### 17.11 Metric definitions, once

| Metric | Formula | Data source |
|---|---|---|
| Task linkage completeness | `tasks_with_terminal / tasks_opened` | event log |
| Redaction recall / precision | span-level | POC-13 corpus |
| Candidate yield | `events_with_candidate / events_with_gold` | lane artefact |
| Statement precision | `accepted / sampled`, two raters, κ≥0.7 | 100-item audit |
| Contradiction F1 | harmonic mean on labelled pairs | POC-15 |
| Admission precision | `useful_active / active_sampled` | 100-item audit |
| Recall@5 / nDCG@10 | standard IR definitions over labelled queries | POC-17 |
| Zero-hit rate | `empty_pack_with_relevant / queries_with_relevant` | POC-17 |
| Pack adherence | `outputs_following_rule / outputs_with_rule` | probe set |
| Attribution accuracy | `correct_credit / replayed_runs` | POC-16 |
| Utility calibration | decile-wise absolute error | replay |
| Recovery ratio | `Δlearned / Δstated` | convention lane |
| Resolution | McNemar inversion at 80% power | lane artefact |

### 17.12 Benchmarks: what we compare, and what we refuse to compare

| Question | Benchmark | Metric | Competitor number (their own protocol) |
|---|---|---|---|
| Is a rule extracted correctly? | **BIRD-CRITIC-SQLite** (500 tasks, 2026-03) | fix rate on held-out issues, weak model + memory | O3-mini 38.87% on PG / 33.33% multi-dialect |
| Is a taught rule applied? | **MemoryAgentBench TTL** (banking/clinic/nlu/trec) | classification accuracy after teaching | TTL baselines reported per dataset |
| Is a contradiction handled? | **MemoryAgentBench CR** (FactConsolidation) | latest-fact exact match | single-hop ~60%, multi-hop ≤7% |
| Is a preference re-fed? | **LongMemEval** single-session-preference | accuracy | Zep 20.0% → 56.7% (gpt-4o) |
| Does a convention transfer? | **our convention lane** | execution accuracy, paired | — (no public equivalent) |
| Is retrieval sound? | LongMemEval / LOCOMO as sanity baselines | recall / judge | Mem0 +26% judge, −91% p95; Zep DMR 94.8% |

**Refused comparisons.** LOCOMO head-to-head against Mem0 as a *product* claim: they store facts about
a user, we store rules about a task; the objects differ. We report it as a sanity check and compete on
TTL/CR and BIRD-CRITIC, where the object is the same.

### 17.13 POC register v2 (superseded by §17.23)

> Kept for the record. **§17.23 is authoritative**: it adds five POCs, states the status of every row,
> and carries the power amendment to POC-14. Any disagreement between the two tables resolves in favour
> of §17.23.

| ID | Question | Method | n | Gate | Artifact |
|---|---|---|---|---|---|
| POC-13 | Is context redaction complete? | 200 contexts with planted secrets across 6 shapes | 200 | recall ≥0.99, precision ≥0.95 | `eval/results/poc-context-redaction.json` |
| POC-14 | Does pair contrast beat adjacent diff? | Same lane, distill from (first-wrong, accepted) | 146 | recovery ratio ≥ 0.6 (vs 0.2–0.44 today) | `eval/results/poc-pair-contrast.json` |
| POC-15 | Does bi-temporal contradiction beat demotion? | 150 labelled pairs, replay 3 conflict patterns | 150 | F1 ≥ 0.90, stale-hit ≤ 0.02 | `eval/results/poc-validity.json` |
| POC-16 | Can credit be attributed correctly? | 200 replayed runs with known relevant rule | 200 | accuracy ≥ 0.90 | `eval/results/poc-attribution.json` |
| POC-17 | What over-fetch and gate settings maximise Recall@5? | 200 queries × {12, 24, 60} × coverage {0, .01, .15} | 1 800 | Recall@5 ≥ 0.90 at p95 ≤ 5 ms | `eval/results/poc-retrieval.json` |
| POC-18 | Does taskType/stage scoping help? | Same queries with/without taskType in scope | 200 | nDCG@10 +0.05 | `eval/results/poc-tasktype.json` |
| POC-19 | Is push delivery worth a new surface? | Webhook on knowledge change, 50 long tasks | 50 | delivery p95 ≤ 60 s, no missed update | `eval/results/poc-push.json` |
| POC-20 | Does tool-initiated recall beat pull? | BIRD-Interact Lite, agent decides when to recall | 300 | task success +3pp over pull | `eval/results/poc-tool.json` |
| POC-21 | Does the flywheel raise a weak model's fix rate? | BIRD-CRITIC-SQLite, memory on/off | 500 | +5pp fix rate, p<0.05 | `eval/results/poc-bird-critic.json` |
| POC-22 | Does a taught rule apply on MemoryAgentBench TTL? | 4 ICL datasets, teach → classify | full | ≥ baseline +3pp | `eval/results/poc-ttl.json` |
| POC-23 | Does conflict resolution beat the reported ceiling? | FactConsolidation SH/MH | full | SH ≥ 70% (vs ~60%), MH ≥ 15% (vs ≤7%) | `eval/results/poc-cr.json` |
| POC-24 | Does a preference lane match Zep's preference gain? | LongMemEval preference subset | 30 | ≥ +20pp | `eval/results/poc-preference.json` |
| POC-25 | Where does the scope index break? | 100k items, 1 000 queries | 100k | p95 ≤ 20 ms | `eval/results/poc-scale-100k.json` |
| POC-26 | Is the idempotency store durable? | Restart under load, 1 000 duplicates | 1 000 | 0 duplicates recorded | `eval/results/poc-idempotency.json` |

### 17.14 Alternatives, and why each was not chosen (extended by §17.18)

> This table records mechanism choices. **§17.18 is the authoritative decision register** because it
> distinguishes *decided* from *deferred*, and a deferral without a default is an ambiguity.

| Decision | Chosen | Alternatives | Reason |
|---|---|---|---|
| Dedupe | deterministic key + dice merge | mem0-style MD5 exact (`hashlib.md5`, no fuzzy); embedding threshold | exact hash misses paraphrase; embedding-only merge cannot explain itself |
| Contradiction | bi-temporal interval + evidence | Graphiti-style LLM dedupe over hybrid recall; status demotion | LLM dedupe costs a call per edge; demotion cannot answer "what was true then" |
| Admission | Wilson lower bound | Bayesian posterior; LLM vote | Wilson is auditable and needs no prior; measured in the study |
| Curation | periodic delta | per-event rewrite (ACE's rejected baseline); never | collapsing context is a measured failure mode |
| Retrieval | BM25 + scope index + coverage | dense embeddings; hybrid + RRF | BM25 won on light paraphrase and 10k CPU latency (§12.4); embeddings add a provider and a POC (POC-17) |
| Delivery | pull now; push/tool via POC | pull-only | agents that cannot ask will not use knowledge mid-task |
| Storage | JSONL + in-memory index | SQLite; graph DB | 10k in 2.6–3.1 ms p95; the next order of magnitude is POC-25 |

### 17.15 Open questions this design still carries (superseded by §19.3)

> Six questions when this section was written; **nine now**, after §17.19 added evidence independence,
> integrity and abstention. §19.3 is the authoritative list.

Each is closed by a named POC; none is a requirement ambiguity.

1. Does pair contrast close the gap to the stated ceiling? (**POC-14**)
2. Does a validity interval change retrieval behaviour enough to justify the model change? (**POC-15**)
3. Is utility density a better prune criterion than raw counts? (**POC-16**)
4. Does taskType scoping help or starve cold task types? (**POC-18**)
5. Does push/tool delivery earn its surface area? (**POC-19**, **POC-20**)
6. Does the mechanism survive a benchmark whose gold is a *fix* rather than an answer? (**POC-21**)

### 17.16 Out of scope (not gaps)

Fine-tuning, GPU runtimes, a hosted service, UI, multi-tenant billing, and leaderboard submissions are
excluded by the product definition (§2). The domain pack stays with the host. Cortex remains a
projection target, not a dependency, until it is published (W1).

---

### 17.17 Audit verdict: three claims that did not survive this pass

The previous revision claimed the pipeline was design-complete. Re-reading it against the requirement —
*every step has a decidable design option, every option is either chosen on evidence or explicitly
deferred to an ablation, every step has a metric and a gate* — three claims fail:

| Claim | Why it fails | Where it is repaired |
|---|---|---|
| "Every stage has a metric table" | True per stage, but there is **no end-to-end number and no cost budget**. A pipeline can pass all nine stage gates and still be worthless (inert) or unaffordable (2.4k tokens per evaluation). | §17.20 |
| "Alternatives are recorded" | The table mixed *rejected* with *still open*, so an implementer could not tell which decisions were free. Retrieval-index and integrity options were not listed at all. | §17.18, §17.22 |
| "Fourteen POCs close every open question" | Three questions had **no POC at all** (evidence independence, memory-formation integrity, abstention), and POC-14's gate carried no power statement. | §17.23 |

Two of the three gaps were found by reading sources this pass had not read: **MemForm** (2026), which
shows that a memory that *forms rules from experience* can be poisoned through five routes that are not
"plant a false record" — content, evidence, **scope**, selection, path — and **ALTK-Evolve** (IBM, 2026),
which is the closest published implementation of this product's mechanism and reports what a support
threshold is worth.

### 17.18 Decision register: what is decided, what is deferred, and by what

Status vocabulary, used everywhere below:

- **decided** — the mechanism ships; evidence in hand or an invariant forces it.
- **deferred** — implementation ships the **named default** and the named ablation changes it. A deferral
  is never "we will see"; it is a default plus the experiment that can overturn it.
- **rejected** — ships never, with the reason.

| ID | Decision | Status | Basis | Settled / overturned by |
|---|---|---|---|---|
| D1 | Task instance (`taskId`, `taskType`, `attempt`, `parentRunId`, terminal status) | decided | Our own gap: single-correction lessons recover 0.19–0.44 of a stated ceiling; adjacent diffs cannot see what the task finally required | POC-14 (mechanism), no revert path |
| D2 | Pair-contrast interpreter (first rejected attempt vs accepted) as the **primary** interpreter when a terminal decision exists | deferred (default: adjacent diff) | ExpeL: success/failure contrast transfers where single-trajectory insight does not | POC-14: recovery ratio ≥0.60 |
| D3 | **Validity interval** (`validFrom`/`validTo`/`supersededBy`) instead of status demotion | deferred (default: demotion; interval behind `validityIntervals: true`) | Graphiti source: invalidation by interval geometry, no similarity threshold | POC-15: contradiction F1 ≥0.90 **and** stale-hit ≤0.02 |
| D4 | Curator stage with per-item counters | **implemented** (iteration 22) | ACE: counters + delta updates are the answer to context collapse | determinism tests: two passes over one store decide the same merge |
| D5 | Prune rule: density-ranked retirement above a per-task cap | **implemented as rank-by-density, disabled by default** (iteration 22) | No data yet on our own utility distribution, so the ordering is shipped and the act is not; the fixed `flippedDown≥3` thresholds were dropped because density subsumes them | L2b + POC-16: prune precision ≥0.90, no retained-rule loss |
| D6 | Admission support counted over **distinct tasks**, not events | **implemented** (iteration 21) | ALTK-Evolve: guidelines kept only from ≥3 distinct tasks beat a larger rule set on airline pass^4 (45.0 vs 40.0), and the closed-form check in §17.34.2 gave a 2.95× inflation | C27 + unit test: six attempts of one task move the score by zero |
| D7 | `minTaskSupport` = 2 for constraints, 3 for widened scopes | deferred (default 1 = today's behaviour) | Same ALTK evidence; the per-task grouping already removes the correlated-evidence path, and a hard floor is a separate trade against cold start | L2b: does a floor of 2 cost a first-session benefit? |
| D8 | Item carries a `lexicalAlias` built from the originating question | **rejected**, with a reopening trigger | The premise was a misattributed number: zero-overlap packs are **3.1%**, not 47% (§17.34.3), and 99.7% of questions already have an active rule sharing a term. BM25 already scores those terms, so an alias re-weights an existing signal instead of adding one. Reopens only if a lane shows zero-hit >5% **and** load-bearing knowledge | POC-33 **closed** by the same measurement |
| D9 | Retrieval = scope index + BM25 + alias + coverage floor; no dense channel by default | deferred (dense channel behind a provider, off) | BM25 won on light paraphrase at 10k on CPU (§12.4); embeddings add a provider and a latency budget | POC-17b: dense adds ≥3pp Recall@5 at p95 ≤5 ms, else rejected |
| D10 | 1-hop expansion over supersession/contradiction edges (HippoRAG-2 style PPR) | **rejected for the default path**, kept behind a provider flag | Source read: HippoRAG 2 runs an **LLM filter per query** (`rerank_facts` → `DSPyFilter`) and falls back to dense retrieval when no fact survives. Our default path makes zero model calls per query, so the mechanism cannot ship as a default | POC-17b may reopen it only where the host already calls a model at query time |
| D11 | Over-fetch `max(4×limit, 60)` | deferred (default `max(3×limit, 12)`) | mem0 ships it; our index is lexical and smaller | POC-17: Recall@5 ≥0.90 |
| D12 | `taskType`/`stage` are **hard filters** in scope | deferred (default: soft boost) | Hard filters may starve a cold task type; no data | POC-18: nDCG@10 +0.05 **and** cold-start recall not lower |
| D13 | Curator trigger: explicit `curate()` plus auto at `pendingEvents ≥ 50`; **no timers inside the library** | decided | An embeddable library cannot own a wall clock (browser tab, serverless) | — |
| D14 | Clock: order by `(occurredAt, seq)`; `occurredAt` clamped to `recordedAt ± 5 min`; validity computed on `occurredAt` | decided | Out-of-order feedback is normal (offline outbox); intervals on ingest time would be wrong | POC-28: order invariance |
| D15 | Provenance tier on every item (`user-text` < `structured-edit` < `outcome` < `host-asserted`) and the tier caps injectable trust | **implemented** (iteration 23) | MINJA 98.2% injection success with no write access; AgentPoison >80% at <0.1% poison; OWASP ASI06 | unit + end-to-end tests: one clarification stays a candidate, a second task promotes it |
| D16 | Promotion gate ≠ write gate: untrusted text may be stored, only endorsed evidence may be injected | **implemented** (iteration 23) | Same sources; storing is cheap, *using* is the privileged step | `user-text` activates only with a second distinct task or a stronger tier; unclassified legacy items are exempt |
| D17 | Generalisation may never widen beyond the union of its endorsing tasks' scopes, and needs 3 distinct tasks to widen at all | **implemented** (iteration 25) | MemForm's **scope** route: real records, inflated applicability; and our own historical bug widened onto candidate items | POC-28: the meet holds on 1,000 replayed events; a pair cannot widen (test), a third task can |
| D18 | Knowledge kinds: `constraint`, `convention`, `preference`, `abstention` | **abstention implemented** (iteration 24); `preference` still a dataset row | `abstain` used to produce nothing at all; MobileMem: stronger memory scores *worse* on unanswerable questions | end-to-end test: two corroborating abstentions reach the pack, one does not; a confident rule silences it |
| D19 | `preference` feeds both a rule and a DPO row | decided | It is simultaneously a convention and a pair; exporting one and not the other wastes the signal | POC-24 |
| D20 | Erasure: `forget({ ids / taskId / actorHash })` writes a tombstone, rewrites the journal, rebuilds the index | **implemented** (iteration 26) | A store of user corrections without deletion is not shippable to a host with deletion obligations | POC-28b: post-erasure recall = 0, 4 claims removed and 86 re-scored on 1,000 events |
| D21 | Namespace is mandatory; no cross-namespace retrieval, ever | decided | Already enforced; ASI06 lists tenant isolation as a control | existing tests |
| D22 | Distillation budget: ≤1 model call per correction, ≤2,000 completion tokens, 2 candidates | decided | Measured: 7.0% loss at 3 candidates/1,400 tokens; 5.0% at 2/2,000 | POC-31 |
| D23 | Prompt budget is a **ratio** (≤15% of the host prompt's tokens) with a 1,200-char absolute cap | decided | Measured: 1,200 chars ≈ 300 tokens against a 1,133-token median question = 26% | POC-31 |
| D24 | Storage: JSONL append + in-memory index; SQLite/Memori-style behind the same port | deferred (default JSONL) | 10k items in 2.6–3.1 ms p95; the next order of magnitude is untested | POC-25: p95 ≤20 ms at 100k |
| D25 | Delivery: pull now; push (webhook) and tool (MCP) behind POCs | deferred | LangMem ships hot-path tools and a background manager; Cognee ships an MCP server; we ship neither yet | POC-19, POC-20 |
| D26 | No GPU, no fine-tuning, no server-side rewrite of knowledge | rejected | Product constraint; ACE measures context collapse as the failure mode of rewriting | — |
| D27 | LLM-only distillation | rejected | Loses the deterministic path structured edits need; 7.0% of calls fail to parse | — |
| D28 | Delete-on-contradiction | rejected | Destroys the audit trail a correction exists to provide | — |
| D29 | Batch distillation: several corrections of one task in **one** parallel multi-tool call | deferred (default: one call per correction) | LangMem's `_MEMORY_INSTRUCTIONS` does exactly this with `max_steps = 1`; our per-correction call costs 1 call each | POC-31b: candidate yield per 1,000 tokens must not fall more than 10% while calls per 1,000 corrections fall below 200 |
| D30 | Curation coalesces a burst into one round; the host may debounce | **implemented as idempotence** (iteration 22) | Two rounds over one burst double the model spend for the same store state; a second `curate()` over an already-curated store reports `merged: 0` | test: two consecutive passes, second is a no-op |

### 17.19 Twelve gaps this pass found, and how each is closed

Each gap is a place where the previous revision would have let an implementer guess.

**G1 — Correlated evidence manufactured confidence.** Eight attempts of one task were eight independent
evidence items, so a single stubborn user could admit a rule alone. *Closure:* support is counted over
distinct tasks; each task contributes at most one endorsement (its terminal decision, or the satisfaction
of its final attempt); Wilson lower bound applies to that task-level count; attempts beyond 8 are ignored.
*Metric:* inflation ratio = trust after *k* correlated events ÷ trust after *k* independent ones, gate
≤1.15. *Cross-check:* ALTK-Evolve's `sup3` (guidelines from ≥3 distinct tasks) beat its lossless set on
τ²-airline pass^4, 45.0 vs 40.0 — a support threshold is not bookkeeping, it changes reliability.

**G2 — Schema drift.** `scope.schemaDigest` existed and nothing invalidated on it. A rule naming a column
that has been renamed is not stale knowledge, it is a fabrication with a citation. *Closure:* a new digest
for `(taskType, domain)` does not delete old items; it **excludes them from injection** and keeps them
retrievable only with `asOf`. *Metric:* stale-schema injection rate = 0 (blocking).

**G3 — Memory-formation integrity.** The previous revision screened injection at render (P6) only, which
assumes the store is trustworthy.

> **Implemented (iterations 23–25), four invariants and a gate.** (i) Every candidate carries a
> provenance tier derived from the event kind (`kernel/provenance.ts`), and a `user-text` item cannot
> activate on one task's word — it stays a candidate with `needs-corroboration` until a second distinct
> task or a stronger tier endorses it (`decideStatus`). (ii) Evidence identity: curation counts the mass of
> *distinct* observations, so two near-duplicates citing one correction cannot pay for two rules (B10).
> (iii) Scope: the widened scope is the **meet** of the endorsing scopes, only `domain` may be dropped, and
> three distinct tasks must endorse the claim before the domain-scoped copies are retired (`generalize.ts`,
> D17; B11). (iv) Selection and path: curation sorts before it decides and orders merged evidence by
> `(at, feedbackId)`, so a replayed log rebuilds the same store. Measured by POC-28: order invariance 1.00,
> replay determinism 1.00, stale-schema injection 0, with a mutation control that must disagree for the
> other three to count. Erasure (D20) lands in iteration 26: `forget()` re-derives every claim that cited
> an erased event, and POC-28b measures 0 of 10 erased records retrievable or cited afterwards. MemForm (2026) shows five routes that never plant a false record:
content, **evidence** (swap part of a real history for fake support), **scope** (real records, wider
applicability), **selection** (same candidates, different subset kept), **path** (same experiences, merged
in a different order). Its strongest defence cut attack success by only 8.2 points. *Closure:* four
invariants, one per route — evidence items must carry distinct event ids (evidence), widening needs three
distinct endorsing tasks (scope), curation is a deterministic function of the event log (selection), and
merge is order-invariant (path). Plus provenance tiers (D15) and a promotion gate (D16) and a periodic
standing recheck that re-validates active items against current evidence. *Metric:* attack success ≤10%
on a MemForm-shaped harness; order invariance and replay determinism = 1.00 (blocking). *POC-29.*

**G4 — Abstention had no home.** `abstain` feedback produced a candidate of kind `constraint` with a
negation in prose, which retrieval cannot distinguish from a positive rule. MobileMem's most
counter-intuitive finding is that the *strongest* memory systems score worst on unanswerable questions,
because they retrieve a plausible distractor and become more confident. *Closure:* `kind: 'abstention'`
rendered in its own block with its own instruction; retrieval may return one abstention instead of a pack.
*Metric:* unanswerable-subset accuracy not worse than the no-memory arm by >2pp; abstention precision
≥0.85. *POC-30.*

**G5 — Preference was a dataset row, not knowledge.** A preference is both: a convention ("this workspace
prefers bars for trend questions") and a DPO pair. *Closure:* D19, two consumers from one event.
*Metric:* preference-follow rate, POC-24 gate ≥+20pp on the LongMemEval preference subset.

**G6 — No clock contract.** Validity intervals need a time, and there are three candidates: host event
time, library ingest time, and model time. Out-of-order arrival is normal — the browser outbox replays
after a reload. *Closure:* D14. *Metric:* shuffling 1,000 events produces an identical store digest.

**G7 — The curator had an implicit timer.** "Every 50 events or 5 minutes" is unimplementable in a tab and
ambiguous in a serverless function. *Closure:* D13 — the library counts, the host schedules.
*Metric:* curation lag ≤ threshold events; server-side scheduler is the host's code.

**G8 — No cost model.** §17 had latency targets but no token budget, and the dominant cost of this product
is model calls, not CPU. *Closure:* §17.20, measured from the artefacts we already have.

**G9 — Delivery had no contract.** "Push" and "tool" were named without a payload. *Closure:* §17.21.

**G10 — Erasure was unaddressed.** *Closure:* D20. *Metric:* post-erasure recall 0; other items' counts
unchanged after compaction; the audit log keeps hashes, not content.

**G11 — Retrieval options were underexplored.** The previous revision considered only "BM25 vs dense".
Measurement then removed one of the two replacements it had proposed: the item-level **alias** was invented
for a zero-coverage rate that turned out to be 3.1%, not 47% (§17.34.3), so it is rejected with a reopening
trigger; **1-hop expansion** needs an LLM call per query and is rejected for a zero-model-call default (D10).
What survives is the ranking work: over-fetch and an `explain[]` over ~186 active rules.
*Closure:* D8 and D10 rejected, D9/D11 deferred. *POC-17, POC-17b.*

**G12 — Benchmarks did not include the one that measures policy following.** Our convention lane is
bespoke; τ-bench measures whether an agent follows a written policy across turns, scored by final database
state, with `pass^k` for consistency — and the closest published mechanism to ours (ALTK-Evolve) reports
67.5% pass^4 on τ²-retail against a 57.5% baseline, no weight updates, rules appended to the prompt.
*Closure:* §17.22 adds it as the primary SOTA lane for the "rules are followed" claim.

### 17.20 What the pipeline is judged by, end to end

A stage gate protects a stage; these six numbers decide whether the product works. All are measured on
every lane run and reported with the artefact.

| # | Metric | Definition | Measured today | Target |
|---|---|---|---|---|
| E1 | Loop utility | accuracy(with memory) − accuracy(no memory), paired | −2.84 / −1.14 / −0.57 / −0.28pp on unmodified BIRD; **+4.79 / +2.05pp** on the convention lane | ≥ +3pp on a convention-bearing lane, ≥ 0 on unmodified data |
| E2 | Recovery ratio | Δlearned ÷ Δstated | **0.19–0.44** | ≥ 0.60 |
| E3 | Token overhead | pack tokens ÷ host prompt tokens | **≈26%** at the 1,200-char cap against a 1,133-token median question | ≤ 15% (D23) |
| E4 | Distillation loss | failed ÷ (created + failed) | **7.0%** (71 of 1,009) at full scale; 5.0% in a 40-question probe | ≤ 1% |
| E5 | Cost per corrected task | model calls + tokens, distill only | ≤1 call, ~2.4k tokens per arm-evaluation | ≤1 call, ≤2k tokens |
| E6 | Integrity | attack success / order invariance / replay determinism | not measured | ≤10% / 1.00 / 1.00 |

Two readings from E3 and E4 that change the design rather than decorating it:

- **The pack is a quarter of the prompt, not a garnish.** A constant character budget cannot be right for
  both a 300-token question and a 3,000-token one, so the budget becomes a ratio with an absolute cap
  (D23). This also re-frames the convention result: the learned arm paid 26% more prompt for +2–5pp.
- **7.0% at full scale, 5.0% in a probe.** The probe under-estimated the loss because a 40-question slice
  has fewer long replies. Every future claim about the parser is quoted at full scale.

### 17.21 Delivery contracts

Pull is implemented; these are the two surfaces the POCs will judge.

**Push (webhook) — implemented (iteration 46), measured by POC-19.** `POST {host}/microglia/events`, one
JSON body per change, `X-Microglia-Signature: sha256=<hmac>` over the raw body with the subscription
secret, at-least-once with `id` for de-duplication:

```json
{ "id": "evt_01H...", "type": "knowledge.admitted",
  "namespace": "acme", "taskType": "chart.recommend",
  "item": { "id": "k_1a2b", "kind": "convention", "statement": "…", "trust": 0.81 },
  "reason": "3 distinct tasks endorsed this", "at": 1761091200000 }
```

Types: `knowledge.admitted`, `knowledge.superseded`, `knowledge.retired`, `task.completed`. Ordered per
`(taskType, seq)`; a host that misses one resyncs with `GET /v1/knowledge?since=`.

**Tool (MCP) — implemented (iteration 48), `POST /v1/mcp`.** Two tools, deliberately small, because an
agent that can ask will ask too often:

```json
{"name": "microglia_recall",
 "description": "Look up workspace conventions learned from earlier corrections before answering.",
 "inputSchema": {"type": "object", "required": ["taskType", "question"],
   "properties": {"taskType": {"type": "string"}, "question": {"type": "string"},
                  "domain": {"type": "string"}, "budget": {"type": "integer"}}}}
{"name": "microglia_feedback",
 "description": "Record that the answer was wrong and what the correct one is.",
 "inputSchema": {"type": "object", "required": ["taskId", "kind"],
   "properties": {"taskId": {"type": "string"}, "kind": {"enum": ["edit", "rating", "abstain"]},
                  "after": {"type": "object"}, "note": {"type": "string"}}}}
```

Gate for the tool surface: tool-call utility ≥0.60 (share of tasks where a self-initiated recall preceded
a correct answer) and call rate ≤2 per task; an agent that recalls on every turn has replaced a prompt
block with a latency tax.

**One correction to the schema above, and why.** `microglia_feedback` ships with `runId` where this
section first wrote `taskId`. Feedback attaches to a run — one immutable generation — and a task may have
several attempts, so a task id cannot say which attempt was judged; defaulting to "the last one" would
blame a generation that may have been right. The tool requires `runId` and the eleven request shapes
(happy paths plus every malformed field) are covered by tests. Transport is JSON-RPC over HTTP, one
request per call: enough for a tool caller, and testable without a socket dance.

**What the tool surface found.** Writing the `microglia_feedback` test exposed a namespace hole in the
facade: `persistRun` refused a foreign run, `recordFeedback` did not, so a facade could annotate another
tenant's run — and the next distillation would read that run through *this* tenant's interpreter, one
workspace's content becoming another's knowledge. The guard now mirrors `persistRun`, the refused write
leaves no event behind, and a test pins both halves. The tool surface is the first caller that would have
exercised this path in production.

**Push, as shipped.** `@agentix-e/microglia-core/delivery`: `knowledgeEvents` derives admitted / superseded
/ retired from a store snapshot and the previous one, `taskCompleted` builds the fourth type from the task
record the host closes, `WebhookDispatcher` signs the exact bytes it posts and retries 5xx / 429 /
transport failures without overtaking its own sequence. The signer is HMAC-SHA256 written in the library
because `node:crypto` is absent in a browser and `crypto.subtle` is async; it is verified against RFC 4231
vectors and against `node:crypto` at every padding boundary. POC-19 measures it against a real HTTP
receiver that loses one acknowledgement on purpose: 50 events, 0 missed, 0 ordering violations, one
duplicate de-duplicated by id, p95 2.6 ms on loopback — a floor, not the 60 s contract.

**A defect this forced.** `distill` reprocesses the log from the beginning when no `since` is passed, and
`mergeEvidence` used to rewrite every item it re-merged, advancing `updatedAt` with no new evidence. The
delivery log reads that timestamp to decide what to send, so 50 corrections produced 275 events. A merge
with unchanged evidence, payload and tier is now a no-op; three tests pin it (identical store on a second
pass, no events, and a genuinely new observation still moving the timestamp).

### 17.22 Competitor and benchmark register v2

**Same object, therefore comparable.** These store *rules or policies about a task*, which is what we store.

| System | Mechanism, from source or paper | Reported number | Our stance |
|---|---|---|---|
| **ALTK-Evolve** (IBM, 2026) | Distils an agent's own successes and failures into short behavioural rules, appends them as a markdown block after the domain policy, no weight updates | τ²-retail pass^4 **57.5% → 67.5%**; τ²-airline 35.0 → 45.0 (`sup3`), 40.0 (lossless) | **The direct target.** Same mechanism, public benchmark, credible number. Its own caveat: 40 retail / 20 airline held-out tasks, not independently verified, so one task = 5pp |
| **ACE** (2025) | Itemized playbook, helpful/harmful counters, delta updates, periodic curator | AppWorld +10.6%, finance +8.6%, tokens −83.6% vs GEPA | Adopted (D4, D5) |
| **ExpeL** (AAAI 2024) | Success/failure contrast → insights, then add/edit/vote refinement | FEVER 63 → 70 with adaptation | Adopted as P2's pair contrast (D2, POC-14) |
| **LangMem** (LangChain) | Source: `_MEMORY_INSTRUCTIONS` runs three phases (extract → compare/update → synthesise) in **one parallel multi-tool call**; `max_steps = 1`, `query_limit = 5`, `enable_deletes = False` by default; ids are `uuid5(namespace, key)`; background work goes through `ReflectionExecutor(..., after_seconds=…)` for debounce | — | Procedural memory as first-class confirms our `convention` kind; `enable_deletes = False` corroborates shipping with prune **off** (D5); the debounced executor refines D13; the single batched call becomes D29 |
| **Cognee** | Six-stage `cognify`, `memify` post-processor: prune stale nodes, reweight by usage, derive facts; MCP server | — | Same shape as our curator; confirms the stage exists in shipping products |
| **A-MEM** (NeurIPS 2025) | Source: `MemoryNote{content, keywords, tags, context, category, links, retrieval_count, evolution_history}`; `find_related_memories(content, k=5)` selects neighbours by **dense distance on content only**; an LLM then returns `should_evolve`, `strengthen`, `update_neighbor`; `update_neighbor` **overwrites the neighbours' own tags and context**; consolidation every `evo_threshold = 100` notes; **retrieval scores ChromaDB distance only and never reads keywords** | — | A keyword field that is never scored buys nothing, which is why our alias was rejected rather than copied (D8, §17.34.3); and silently rewriting existing notes is exactly the *path* route MemForm names, which D16/D17 forbid |
| **HippoRAG 2** (ICML 2025) | Source (partial: file truncated, `BaseConfig` defaults not visible): `retrieve()` = fact retrieval → `rerank_facts` (Recognition Memory, a per-query `DSPyFilter` LLM call) → dense passage scoring → PPR re-rank with `linking_top_k` and `passage_node_weight`; **if no fact survives the filter it falls back to dense retrieval** | +7% on associative memory (paper) | Rejected for the default path (D10): a model call per query is incompatible with a CPU-only, zero-call default |
| **MemoryOS** / **Memori** | Three-tier hierarchy with FIFO transitions; SQL-native storage | — | Alternatives for D24, tested at POC-25 |

**Different object, so reported as sanity only.** Mem0, Zep/Graphiti, Letta/MemGPT store facts about a
user; LOCOMO and DMR measure recall of those facts. We report them, we do not claim a win there.

| Benchmark | What it measures | Why it is on the list |
|---|---|---|
| **τ-bench / τ²-bench** | policy adherence over multi-turn dialogue, scored by final DB state; `pass^k` | The "rules are followed" claim, with a published competitor number |
| **BIRD-CRITIC-SQLite** (500) | repair a broken query from a user complaint | rule quality where gold is a *fix* |
| **MemoryAgentBench** TTL / CR | teaching a rule without weight updates; fact consolidation | extraction and contradiction, and its **unanswerable subset** for G4 |
| **LongMemEval** preference subset | preference following | the only public preference number (Zep 20.0 → 56.7) |
| **our convention lane** | transfer of an unreachable convention | no public equivalent; the only lane where our mechanism is load-bearing by construction |
| **MemForm-shaped integrity harness** | attack success of the five formation routes | the pipeline is a rule-forming memory; this is its threat model |

**Refused:** leaderboard placement on LOCOMO/DMR as a product claim; any comparison that requires GPU;
any closed-source competitor's internals (per instruction, none is chased).

### 17.23 POC register v3

Statuses: **run** (artefact exists), **specified** (needs the frozen implementation), **deferred**
(blocked on an external dependency). Every row names n, the gate, and the artefact it must produce.

| ID | Question | Method | n | Gate | Status |
|---|---|---|---|---|---|
| POC-13 | Is context redaction complete? | 200 contexts, 6 secret shapes | 200 | recall ≥0.99, precision ≥0.95 | specified |
| POC-14 | Does pair contrast close the ceiling gap? | Same lane, distill from (first-rejected, accepted); paired against adjacent-diff | 146 × 5 folds | recovery ratio ≥0.60, p<0.05 | specified |
| POC-15 | Is a validity interval worth the model change? | 150 labelled pairs × 3 conflict patterns | 150 | F1 ≥0.90, stale-hit ≤0.02 | specified |
| POC-16 | Can utility support retirement? | 200 replayed runs with a known relevant rule | 200 | attribution ≥0.90; no retained-rule loss | specified |
| POC-17 | Which over-fetch and coverage settings maximise Recall@5? | 200 queries × {12,24,60} × coverage {0,.01,.15} | 1,800 | Recall@5 ≥0.90 at p95 ≤5 ms | specified |
| POC-17b | Does a dense channel or 1-hop expansion beat BM25+alias? | Same 200 labelled queries, three retrievers | 600 | +3pp Recall@5 or +0.05 nDCG@10, else rejected | specified |
| POC-18 | Does taskType scoping help or starve? | Same queries, hard filter vs soft boost | 200 | nDCG@10 +0.05, cold-start recall not lower | **closed by data** — every lane has one task type, so a filter is an identity (§17.34.3) |
| POC-19 | Is push delivery worth a surface? | Webhook on change, 50 long tasks | 50 | p95 ≤60 s, no missed update | specified |
| POC-20 | Does tool-initiated recall beat pull? | BIRD-Interact Lite, agent decides | 300 | task success +3pp, ≤2 calls/task | specified |
| POC-21 | Does the loop raise a weak model's fix rate? | BIRD-CRITIC-SQLite, memory on/off | 500 | +5pp, p<0.05 | specified |
| POC-22 | Does a taught rule apply on TTL? | 4 ICL datasets | full | ≥ baseline +3pp | specified |
| POC-23 | Does conflict resolution beat the reported ceiling? | FactConsolidation SH/MH | full | SH ≥70%, MH ≥15% | specified |
| POC-24 | Does a preference lane match the published gain? | LongMemEval preference subset | 30 | ≥ +20pp | specified |
| POC-25 | Where does the scope index break? | 100k items, 1,000 queries | 100k | p95 ≤20 ms | specified |
| POC-26 | Is the idempotency store durable? | Restart under load, 1,000 duplicates | 1,000 | 0 duplicates recorded | specified |
| **POC-27** | Does task-level support stop correlated evidence inflating trust? | Closed-form: `wilsonLower` under both counting rules, k = 1…8 | 8 points | ratio ≤1.15 | **closed by arithmetic** — 2.95× at k=6, and one task's six attempts reach the 0.6 activation threshold (§17.34.2) |
| **POC-28** | Do the four invariants hold? | Shuffle + replay 1,000 events; rename a column mid-stream; erase 10 items | 1,000 | order invariance 1.00, stale-schema injection 0, post-erasure recall 0 | **run (iterations 25–26)**: 1.00 / 1.00 / 0 stale / control 0.00 (sensitive); erasure 10 + 10 tasks, 0 retrievable or cited, 170 events and 4 claims removed, 86 re-scored |
| **POC-29** | How much can a poisoned correction do? | MemForm's five routes, 100 attempts per route, three channel-trust ceilings | 500 | attack success ≤10% for a capability-limited attacker | **run (iteration 27)**: 0% at trust ≤ 0.6 (gate met), 40% at 0.9 (content and path; a trusted editor cannot be refused, stated as a limit), 3 defects found and closed (B12–B14) |
| **POC-30** | Does an abstention kind reduce confident wrong answers? | 100 unanswerable questions, with/without abstention items | 100 | accuracy loss ≤2pp on answerable, ≥+10pp on unanswerable | specified |
| **POC-31** | What does the pipeline cost? | Derived from recorded artefacts (calls, tokens, pack size) | 730 evaluations | ≤15% token overhead, ≤1 call/correction, ≤1% loss | **run** (§17.20) |
| **POC-31b** | Does batching several corrections into one call keep the yield? | Batch 5 corrections per call vs one per call, same 1,000 corrections | 1,000 | calls <200/1,000 and candidate yield within 10% of per-correction | specified |
| **POC-32** | Does the loop move τ-bench pass^k? | τ²-retail + τ²-airline, rules learned from training tasks, 4 trials | 40 + 20 held-out | pass^4 ≥ +5pp over the same-model baseline, and ≥ ALTK-Evolve's reported number on the same split | specified |
| **POC-33** | Does a lexical alias fix the zero-coverage packs? | Replay of the committed artefact: zero-overlap rate and rule availability | 352 | zero-hit ≤0.05, Recall@5 +0.10 | **closed** — zero-hit is already 0.031 and 99.7% of questions have an overlapping rule, so the alias has nothing to fix (§17.34.3) |

**Amendments to earlier POCs, from this pass.** POC-14's gate now states power: a paired design at n=146
resolves 5.08pp, so a 0.60 recovery ratio (≈6.5pp) is resolvable but a 0.50 ratio is not — the gate is
therefore on the ratio *and* on the discordant-pair direction being uniform. POC-21's +5pp sits inside a
500-task sample's resolution and is stated as the minimum detectable effect, not a hope.

### 17.24 What this pass changed in production intent (nothing else)

| Change | Consequence for the host |
|---|---|
| Budget becomes a ratio (D23) | `recall({ budgetRatio: 0.15 })` may render less than today; a host that wants the old behaviour passes the absolute cap |
| Alias index (D8) | The store grows by roughly the item's originating question's terms; no extra model call, no schema change |
| Provenance tiers (D15/D16) | A host may store anything and inject only what evidence endorses; `trustCeiling` becomes a function of provenance rather than a constant |
| Erasure (D20) | One new call, `forget`, with a compaction step at the host's schedule |
| Six headline metrics (§17.20) | Every lane run must report them; a run without them is not a result |

---

### 17.25 Package mapping and the public surface (requirements 1 and 2)

The pipeline of §17.2 adds seven capabilities. Each has exactly one home, and the home is the module
whose *existing* invariant it obeys — the task instance is a capture concern, the curator is a distill
concern, the alias is an index concern, the provenance guard is a kernel concern.

| Capability | Module (subpath) | Symbol | Why there |
|---|---|---|---|
| Task instance, attempts, terminal decision | `core/capture` | `openTask`, `TaskHandle` | It composes the run handle and the store; `kernel` must stay I/O-free |
| Pair contrast | `core/distill` | `pairContrastInterpreter` | It is an interpreter, composed like the other two |
| Validity interval, supersession | `core/kernel` + `core/memory` | `Validity`, interval in the record | Interval algebra is pure; storage is the store's job |
| Curator (counters, merge, prune) | `core/distill/curate` | `curate()` | Same layer as distillation: it changes knowledge, not text |
| Lexical alias, index field | `core/memory` + `core/apply` | `IndexEntry.alias`, `buildPack` | The index owns what is searchable; the pack owns what is chosen |
| Provenance, promotion gate, injection screen | `core/kernel/guard` + `core/capture` | `Provenance`, `promote()` | Guard is pure; the gate is a policy applied at write and at render |
| Attribution, utility, retirement | `core/capture` | `attribute()`, `Utility` | It needs the run, the feedback and the pack ids together |
| Push webhook, MCP tools | `node` | `createWebhook`, `mcpRoutes` | A transport and a credential; never in `core` |
| Offline outbox | `browser` | `persistedOutbox` | Already there |

**Normative signatures for the additions.** Written out because a signature is the only part of a design
that cannot be misread. Nothing here is implemented.

```ts
// core (capture)
openTask(input: {
  taskId: string; taskType: string; sessionId?: string;
  context?: JsonObject;            // ≤16 KiB after redaction, else MG_E_CONTEXT_TOO_LARGE
}): TaskHandle;

interface TaskHandle {
  readonly id: string;
  begin(attempt: { attempt: number; parentRunId?: string; input: JsonObject;
                   pack?: KnowledgePack; model?: string; promptVersion?: string }): RunHandle;
  complete(decision: { status: 'accepted' | 'abandoned' | 'escalated';
                       finalRunId?: string; reasonCode?: string }): Promise<TaskRecord>;
  readonly record: TaskRecord | undefined;
}

// core (distill)
curate(options?: { namespace?: string; dryRun?: boolean }): Promise<CurationReport>;

// core (capture)
forget(selector: { ids?: readonly string[]; taskId?: string; actor?: string }): Promise<ForgetReport>;

// core (apply)
explain(query: RecallQuery): Promise<readonly Explanation[]>;
// { itemId, selected, reasons: ('scope'|'alias'|'lexical'|'coverage'|'utility'|'mmr'|'budget'|'provenance')[], score }
```

**Error codes these add.** The union grows by four, and each names a state a caller can act on:
`MG_E_TASK_CONFLICT` (attempt number reused), `MG_E_TASK_CLOSED` (a write after a terminal decision),
`MG_E_CONTEXT_TOO_LARGE`, `MG_E_FORGET_UNSCOPED` (a selector that names nothing is refused rather than
silently doing nothing). Every existing code keeps its meaning.

**Subpath budgets.** Requirement 1 is "import only what you need", which is only true if the subpaths are
measurably small. These are targets, measured at implementation with `esbuild --bundle --metafile`, gzip:

| Import | Budget | Contains |
|---|---|---|
| `core/kernel` | ≤ 12 KiB | contracts, policy, similarity, stats, guard, diff |
| `core/kernel` + `/memory` + `/apply` | ≤ 28 KiB | retrieval-only host, no model call, no distiller |
| that + `/distill` | ≤ 40 KiB | adds interpreters and the curator |
| `core` (whole) | ≤ 52 KiB | adds the facade and task handle |
| `browser` | ≤ 12 KiB | client + outbox |
| `node` | not budgeted | server; never bundled into a tab |

The gate is ±20% on each budget, and a host that only retrieves must be able to prove it did not pull the
distiller: the test asserts the bundle's metafile contains no `distill/` module.

### 17.26 Performance and footprint (requirement 4)

Requirement 4 asks for superiority. Superiority has to be stated on axes where the numbers are
comparable; a library that beats a platform on latency is measuring different work.

| Operation | Measured today | Target | Axis that matters |
|---|---|---|---|
| Ingest (append + fsync + index) | not measured | p95 ≤5 ms at 10k events | a correction must not slow the host's response |
| Recall, 1k / 10k items | 0.4–0.9 / 2.6–3.1 ms p95 | ≤1 / ≤5 ms | per request, CPU only |
| Recall, 100k items | not measured (O(n) scan expected to cross) | ≤20 ms | POC-25 |
| Pack size | 1,200 chars ≈ 300 tokens | ≤15% of host prompt | token overhead is the product's cost |
| Distillation | 1 call, ~2k tokens | ≤1 call, ≤2k tokens | per correction, not per request |
| Curation round | not measured | ≤2,000 tokens, ≤50 ms CPU excluding model | periodic |
| Journal | ~1 KB per event (JSONL) | ≤1.5 KB | disk on a small host |
| Heap, 10k items | 14 MB | ≤20 MB | embedded and browser |
| Cold start, 10k | not measured | ≤300 ms | a tab that reloads |
| Browser bundle | not measured | ≤12 KiB gzip | requirement 1 |

**Competitor performance, stated honestly.** Mem0 reports p95 latency −91% and ~90% token savings
against full-context on LOCOMO; Zep reports ~90% latency reduction against full-context on LongMemEval.
Both baselines are *stuffing the whole history into the prompt*, not a governed store, so those numbers do
not describe a head-to-head with this library and we do not claim one. The comparable axes are:
**tokens per corrected task** (we: ~2.4k per evaluation, of which ≤300 is the pack) and **p95 recall on a
CPU with no embedding service** (we: 2.6–3.1 ms at 10k). A host that already runs a vector database is
not our customer for latency; it is our customer for governance.

**What "surpass" means here, concretely.** Three claims, each with a lane: (a) more of the ceiling
recovered than a competitor mechanism on the same data — POC-21/32; (b) fewer tokens per corrected task
than appending the correction history — POC-31; (c) surviving poison where a fact store does not — the
existing competitor baseline (56.07% clean → 19.64% poisoned, vs 100.00% for the governed store).

### 17.27 Evaluation plan v2: lanes, power, cost, order (requirement 5)

Eight lanes. Each is preregistered (config hash frozen before the run), has a resolution, a cost, an
artefact and a gate; the order is the order in which a failure stops the next lane.

| Lane | Dataset | n | Primary metric | Resolution | Est. cost | Gate |
|---|---|---|---|---|---|---|
| L0 adjudication | **rule-derived chart workload**: gold is computed by a stated policy, not judged by a human | 1,300 (1,040 evaluated) | top-1 | 7.16pp at the observed discordance (**3pp withdrawn**) | 0 (no model) | ≥ +3pp **and** delta > the design's own detectable delta; a 100-case human audit is calibration, not a gate |
| L1 mechanism | synthetic chart workload, 9 arms | 280 | paired McNemar | 4pp | 0 (no model) | already passed (S0) |
| L2 convention | BIRD Mini-Dev single-number subset | 146 × 5 folds | paired Δ | 5.08pp | 1.7k calls / 42 min | Δ ≥ +3pp, p<0.05, recovery ≥0.60 |
| L3 transfer (fix-shaped) | BIRD-CRITIC-SQLite | 500 | fix rate | ~4.4pp | ~1.2k calls / 40 min | +5pp, p<0.05 |
| L4 policy following | τ²-retail (40) + τ²-airline (20), 4 trials | 240 runs × 2 arms | pass^4 | 5pp on retail | ~5k calls / 2h | ≥ +5pp and ≥ ALTK-Evolve on the same split; environment installed at `v0.2.0` by tag+uv, cached, three exit codes |
| L5 teaching | MemoryAgentBench TTL, 4 sets | full | accuracy | per set | ~2k calls / 45 min | ≥ +3pp |
| L6 consolidation | MemoryAgentBench CR, SH + MH | full | exact match | per set | ~1k calls / 30 min | SH ≥70%, MH ≥15% |
| L7 preference | LongMemEval preference subset | 30 | accuracy | ~9pp | ~600 calls / 20 min | ≥ +20pp |
| L8 integrity | MemForm harness + replay | 500 attacks (+1,000 replay events) | attack success; order invariance | 4pp | 0 (replay) | ≤10% (measured 0% at trust ≤ 0.6); invariance and determinism = 1.00 |

**L4's reader is part of the lane, not plumbing.** Four rules govern it, all taken from
`sierra-research/tau2-bench` at the pinned ref rather than chosen here: a trial succeeds on
`reward == 1.0` exactly; a `null` reward is permitted only for an infrastructure error and is never counted
as a failure; a partial grid is refused instead of averaged; duplicate results for one trial are an error.
The lane accepts a recorded document (`TAU_RESULTS`), a driver module (`TAU_DRIVER`), or neither, and
distinguishes three outcomes with three exit codes and artefact statuses: `not-run` (no environment),
`refused` (measured, unscorable, with a named reason), and a scored run that then faces the pass^4,
coverage and fully-scored gates. Two synthetic 60-task fixtures exercise the score and the refusal path in
CI, and a third case covers the configuration that cannot be satisfied: a `TAU_DRIVER` naming a module that
does not exist resolves to `not-run` with `status_driver_missing: 1` and an annotation, because an
environment that cannot be reached is not a measurement that failed. A driver that loads and then throws
still fails the job.

**Why this order.** L2 is the cheapest lane that can still falsify the product, so it runs first and its
gate is the one that matters most. L3 and L4 answer "does it transfer" on gold that is a *fix* and on gold
that is *policy compliance* — two different shapes of non-inferable knowledge. L5–L7 are competitor
benchmarks, run only after L2–L4 pass, because running them first would spend two hours to learn nothing
about the mechanism. L8 costs nothing (replay) and gates every release.

**SOTA ladder, in order, with stop rules.**

| Rung | Must pass | If it fails |
|---|---|---|
| R1 | L2 gate | the mechanism does not transfer a convention → stop the SOTA path, keep the product as a governance layer (this already happened once, on BIRD) |
| R2 | L3 gate | knowledge does not help a model *repair* → the lesson form is wrong, not the pipeline; one redesign of P2, then stop |
| R3 | L4 gate at ALTK-Evolve's level | we are behind a published mechanism on the same object → report the gap, do not claim SOTA |
| R4 | L5–L7 at the published competitor numbers | mixed: report per-lane, never aggregate |
| R5 | L8 with every rung | an integrity failure blocks release regardless of accuracy |

**Reproducibility rules.** Every lane stores: config hash, model id and version, prompt version, dataset
digest, seed, per-case rows, the paired test, and the gate verdicts. A number without its artefact is not
a result; a lane whose artefact is missing from `eval/results/` is reported as "not run".

### 17.28 Source-audit register (requirement 6, and the honesty requirement 7 needs)

What was actually read, how, and what it changed. **Evidence class** is deliberately narrow:

- **S** — primary source read (repository file, function names quoted).
- **P** — the paper or report itself.
- **R** — a secondary report *about* the work (aggregator, vendor blog, news). Sufficient to design
  against a mechanism, insufficient to quote a number as fact.

| System | What was inspected | Mechanism extracted | Decision | Class |
|---|---|---|---|---|
| **Mem0** | `mem0/memory/main.py` | top-10 semantic candidate set, MD5 exact dedupe, entity cosine 0.95, identity keys stripped, search threshold 0.1, over-fetch `max(4k,60)` | D11 deferred; dedupe rejected as too weak | **S** |
| **Graphiti / Zep** | `graphiti_core/utils/maintenance/edge_operations.py` | hybrid RRF recall, LLM dedupe over paired endpoints, `valid_at`/`invalid_at`/`expired_at`, invalidation by interval geometry, no similarity threshold | D3 (validity) | **S** |
| **cortex** | cloned, built, 12 fields compared in CI | memory projection shape | C15; W1 action item stays | **S** |
| **ACE** | paper | itemized bullets, helpful/harmful counters, delta updates, curator frequency, context collapse | D4, D5 | **P** |
| **ExpeL** | paper (AAAI 2024) | success/failure contrast → insight, add/edit/vote | D2 | **P** |
| **A-MEM** | `agentic_memory/memory_system.py`, `agentic_memory/retrievers.py` | `MemoryNote{content, keywords, tags, context, category, links, retrieval_count, evolution_history}`; `find_related_memories(content, k=5)` dense-only; LLM returns `should_evolve` / `strengthen` / `update_neighbor`; `update_neighbor` rewrites neighbours' tags and context; `evo_threshold = 100`; **retrieval scores distance only, keywords are never read** | D8 (own rationale), D16/D17 | **S** |
| **HippoRAG 2** | `src/hipporag/HippoRAG.py` (partial — file truncated before `graph_search_with_fact_entities`; `BaseConfig` defaults not visible) | `retrieve()` = facts → `rerank_facts` (per-query `DSPyFilter` LLM call) → dense scoring → PPR with `linking_top_k`, `passage_node_weight`; dense fallback when no fact survives | D10 **rejected for the default** | **S (partial)** |
| **LangMem** | `src/langmem/knowledge/extraction.py` | three-phase `_MEMORY_INSTRUCTIONS` (extract / compare-update / synthesise) in one parallel multi-tool call; `max_steps = 1`; `query_limit = 5`; `enable_deletes = False`; `_stable_id` = `uuid5(namespace, key)`; `ReflectionExecutor(after_seconds)` | D5 cross-check, D13, D29, D30 | **S** |
| **ALTK-Evolve** | IBM report via secondary coverage | distill own successes/failures → prompt-appended rules; ≥3 distinct tasks beats lossless on airline pass^4 (45.0 vs 40.0); retail 57.5 → 67.5 | D6, D7, POC-32, L4 | **R** — not verified at source |
| **MemForm** | 2026 paper via secondary coverage | five formation routes (content, evidence, scope, selection, path); best of five defences −8.2pp | G3 invariants, POC-29 | **R** |
| **MINJA / AgentPoison** | arXiv abstracts via secondary coverage | 98.2% injection success with query-only access; >80% attack at <0.1% poison | D15, D16 | **R** |
| **Cognee / MemoryOS / Memori** | product documentation via secondary | curator post-processor (`memify`); three-tier hierarchy; SQL-native storage | D24, D25 | **R** |
| **τ-bench / τ²-bench** | paper (arXiv 2406.12045) and leaderboard coverage | final DB-state scoring, `pass^k`, policy documents in context | L4 | **P** |

**Corrections this pass produced.** Reading the source overturned two things the register had been asserting
on secondary evidence, and both are recorded rather than quietly rewritten:

| Was | Source says | Now |
|---|---|---|
| A-MEM's advantage on distractor-heavy sets is due to per-item keywords | `search()` scores ChromaDB distance on `content` and never reads `keywords`; the keyword field is generated by a separate method that `add_note` does not even call | the alias (D8) stands on **our own** C25 measurement; the A-MEM attribution is withdrawn |
| PPR expansion is a deferred option | `rerank_facts` makes an **LLM call per query**, and the graph search is skipped entirely when no fact survives | D10 becomes **rejected for the default path**; a CPU-only, zero-call default cannot host it |

**A rule this register exists to enforce.** No number from class **R** may appear in a product claim. It
may appear as a *target* (L4's "≥ ALTK-Evolve on the same split") and as a *design input* (the five
routes). Where a class-R number was quoted in §17.18–§17.19, it is marked as the source's report, not as
our measurement. Closing that gap is POC-32's job: run the lane ourselves.

### 17.29 Disambiguation ledger (requirement 8)

Twelve places where a competent implementer could have built two different systems. Each is now one value.

| # | Was ambiguous | Now |
|---|---|---|
| 1 | "Wilson lower bound over task-level count" | `n` = distinct endorsing tasks (cap 8 per task), `x` = endorsing tasks, `z = 1.96`, one-sided 95% lower bound; trust = `LB` |
| 2 | What counts as a task's endorsement | `status = accepted` **or** its final attempt judged correct by the host's own judge; `abandoned` endorses nothing and subtracts nothing |
| 3 | Task-level credit decay | `0.5^d`, `d = acceptedIndex − runIndex` capped at 6, floor `0.05`, applied to the ids that run cited |
| 4 | "Every 50 events" — global or per namespace? | per namespace, counted since the last successful curation of that namespace |
| 5 | `budgetRatio` denominator | estimated host prompt tokens = `ceil(promptChars / 4)`, or the provider's reported input tokens when available; pack tokens = `ceil(packChars / 4)` |
| 6 | Unknown keys in `context` | stored opaque, never indexed; a declared `indexedKeys` entry holding a non-string is `MG_E_CONFIG` |
| 7 | Provenance trust caps | `user-text` 0.60, `structured-edit` 0.90, `outcome` 0.95, `host-asserted` 1.00 (matches today's outcome weight) |
| 8 | Clock skew | `occurredAt` clamped to `recordedAt ± 5 min`, `clamped: true` recorded; validity uses the clamped value |
| 9 | Alias size and content | ≤12 terms, stopwords removed, deduplicated, from the question that produced the correction only |
| 10 | When an abstention is rendered | only when no positive item reaches trust 0.60, at most one, in its own block |
| 11 | Generalisation widening | union of the endorsing tasks' scopes; ≥3 distinct tasks; never introduces a key that no endorser had |
| 12 | Idempotency of `begin` | `(namespace, taskId, attempt)` is unique; a repeat returns the existing run, a conflict is `MG_E_TASK_CONFLICT` |

### 17.30 POC index: every topic, and its conclusion (requirement 9)

Requirement 9 is "every POC topic **and conclusion** recorded". The conclusions that exist, and where;
the ones that do not, and why.

| POC | Topic | Conclusion | Section |
|---|---|---|---|
| POC-1 | Does the 9-arm study show a mechanism lift? | +68–100pp over baseline, gates 17/17, 0.33 s | §12.1, C1–C8 |
| POC-2 | Generic vs house convention | generic −2.38–0pp, house +75–89pp | §12.2, C9–C10 |
| POC-3 | Free-text distillation | mark 91.7–95.8%, intent 95.8–100% | §12.3, C11 |
| POC-4 | Injection through feedback | 0 of 3 active | §12.4, C12 |
| POC-5 | BM25 vs dense | light 58.3% vs 54.2%; heavy 20.8% vs 29.2% | §12.5, C13 |
| POC-6 | CPU scale at 10k | p95 2.6–3.1 ms, heap 14 MB | §12.6, C14 |
| POC-7 | Competitor-shaped fact store | 56.07% clean, **19.64% poisoned** | §12.7, C18 |
| POC-8 | Public benchmark, first read | +3.33pp at n=30 — **retracted as noise** | §12.8, C19 |
| POC-9 | Cross-fitted public read | **−2.84pp**, n=352, no fold positive | §12.11, C20 |
| POC-10 | Four controls | full −1.14, duplicate −2.27, wrong-scope −1.42, oracle **+30.97** | §12.12, C21 |
| POC-11 | Relevance floor | −0.28pp; floor removes 0.21 rules/question | §12.13, C22 |
| POC-12 | Convention transfer | +4.79pp (p=0.016) then +2.05pp (p=0.250), 10:0 pooled | §12.14, C23 |
| POC-12b | Parser loss | 25.7% → 5.0% in probe → **7.0% at full scale** | §12.14, C24 |
| POC-31 | Cost model | 2,383 tokens/evaluation; pack = 26% of median question | §17.20, C25 |
| POC-31b | Batched distillation | **not run** — one call per correction ships until it is | §17.23 |
| POC-18 | taskType scoping | **closed by data**: one task type in every lane makes the filter an identity | §17.34.3 |
| POC-27 | Support counting | **closed by arithmetic**: 2.95× inflation at six events; six distinct tasks needed to activate | §17.34.2 |
| POC-33 | Lexical alias | **closed**: the premise (47% zero-overlap) was a 40-question probe reported at full scale; the real rate is 3.1% | §17.34.3 |
| POC-13…30, 32 | Pipeline stages, integrity, abstention, τ-bench | **not run** — they measure an implementation that does not exist | §17.23 |

The two rows that changed a claim rather than decorating one are POC-8 (a published number retracted) and
POC-12b (a probe that under-counted a loss by 40%).

---

### 17.31 Statistical discipline (requirement 3, applied to our own record)

The pipeline's history contains a methodological problem that no gate caught, and it is in our own data:
the BIRD hypothesis was tested **four times** (−2.84, −1.14, −0.57, −0.28pp) and the convention hypothesis
**twice** (+4.79, then +2.05pp). Reporting the best p-value from a sequence of looks is optional stopping,
and it inflates the false-positive rate. Four lanes × three arms multiplies the problem.

Six rules, applied to every lane from now on, and applied retrospectively to what is already published:

| Rule | Statement |
|---|---|
| S1 | **One primary endpoint per lane**, named in the artefact before the run. Secondary endpoints are reported as exploratory, without p-values |
| S2 | **Every look is recorded.** An artefact carries `looks` (how many times this hypothesis has been run on this data) and `run_index`. A lane re-run for a fix is a new look, not a fresh test |
| S3 | **No pooling of discordant pairs across looks.** "10 gained, 0 lost across two runs" is a description, not a test: the runs share questions, and a p-value computed on the sum would be optimistic. It is reported as `10:0 over 292 question-evaluations, no test` |
| S4 | **Multiplicity within a family.** When k arms are compared to one control, Holm–Bonferroni at family α = 0.05: the smallest p must be < 0.05/k, the next < 0.05/(k−1), and so on. L2's three comparisons therefore need 0.0167, 0.025, 0.05 |
| S5 | **Effect first.** Every claim is `Δ [CI], n, discordant pairs, looks`. A p-value without those four is not reportable |
| S6 | **Negative results get the same table.** A null lane is published in the same format as a positive one; the four null reads exist because of this rule |

**Applied to what is already published.** The convention lane's first read (p = 0.0156) was the first look;
under S4 it needs p < 0.0167 for a three-arm family and **passes, narrowly**. The second read (p = 0.250) is
a second look at the same questions: with two looks, a Bonferroni-on-looks adjustment makes the first read
p ≈ 0.031, still under 0.05, and the second remains null. The honest summary is unchanged — direction
stable, magnitude not — but the arithmetic behind it is now stated instead of implied.

**What this changes in the artefacts.** Three fields (`looks`, `primary_endpoint`, `family_size`) and one
derived value (`p_adjusted`) join every lane result. A run without them is reported as "not a result",
which is the same rule already applied to a missing artefact.

### 17.32 Dataset manifest (requirement 5, executability)

A plan that names a benchmark but not where to get it is not executable — this repository already learned
that when the BIRD Mini-Dev repository turned out to hold questions without databases, and the lane had to
assemble two datasets to run at all.

| Dataset | Source | Size used | Use | If it is unavailable or changed |
|---|---|---|---|---|
| BIRD Mini-Dev — questions | the pinned archive's `mini_dev_sqlite.json` (preferred), else Hugging Face `birdsql/bird_mini_dev` | 500 (352 usable) | L2 | lane reported as **blocked**; no substitute |
| BIRD — SQLite databases | **vendor archive** `bird-bench.oss-cn-beijing.aliyuncs.com/minidev.zip`, pinned by digest in `eval/manifests/bird-minidev.json` (800,943,648 B, sha256 `cc48ba16…b92f`, CC BY-SA 4.0, 11 databases) | 11 databases | L2, L3 | lane blocked; a mirror with a different digest is not this dataset |
| BIRD-CRITIC | SQLite split, 500 tasks | 500 | L3 | lane blocked; the PG split is **not** a substitute (different dialect) |
| τ²-bench | retail (40 held-out) + airline (20 held-out) | 240 runs | L4 | blocked; τ-bench v1 is a different board and is not merged |
| MemoryAgentBench | TTL sets (ICL banking/clinic/nlu/trec) + FactConsolidation | full | L5, L6 | blocked |
| LongMemEval | preference subset | 30 | L7 | blocked |
| Convention lane | derived from BIRD Mini-Dev, gold transformed at evaluation time | 146 | L2 | inherits BIRD's availability; the transformation is versioned with the artefact |
| Integrity harness | authored here, MemForm's five routes | 500 attempts | L8 | always available (no third-party data) |

**Pinning.** Each dataset is recorded in the artefact by a digest of the exact files used, plus the retrieval
date. BIRD's is now a file rather than a promise: `eval/manifests/bird-minidev.json` carries url, size,
sha256, licence, attribution, extraction root and the eleven database ids, `parseManifest` refuses a
manifest with a missing or malformed digest (an unchecked digest looks like integrity while falling back to
"whatever arrived"), and the lane hashes the download with `sha256OfFile` before it opens the zip. A change of digest invalidates comparison with earlier runs, and the artefact says so rather than
silently producing a new baseline. Licences are recorded at fetch time from the dataset card and carried in
`datasets.lock.json`; the plan does not assert a licence it has not read.

**Assembly is documented, not assumed — and now verified.** The lane used to assemble the benchmark from two
Hugging Face repositories and fall back to `birdsql/bird-critic-1.0-sqlite`'s `<db>_template.sqlite` files.
Nothing checked what those files contained, and the name said *template*: against a schema-only database the
gold query and the predicted query both return no rows, `matches([], [])` is true, and every query that runs
scores as correct. Execution accuracy would have degenerated into parse success without a single test
failing. The fallback is **removed**; the lane reads the pinned archive, verifies its digest before
extracting, reads the questions from the same archive, and refuses to continue unless every database it is
about to use has rows:

```
[sota] data ok: financial 8 tables, 1079680 rows
```

That line is the gate. A schema-only database now stops the run with `MG_E_STORE_IO` instead of producing a
plausible number.

**Did the earlier BIRD numbers survive this?** Yes, and the artefact is why: it records `gold_exec_rate: 1`
and `exec_rate: 0.986` beside an accuracy of **6.83%**. An empty database would have produced ≈98.6% —
every runnable query matching two empty result sets — so the data the lane actually ran on was populated.
What was missing was the ability to *say so*; the check and the digest now supply it, and the next run
records both.

### 17.33 Versioning, migration and the published contract (requirements 1 and 2)

An embedded SDK that stores a host's corrections owes that host a migration path. Three contracts:

**Knowledge record.** `microglia.knowledge/1` is the current schema. The library **reads N−1 and writes N**;
a store written by a newer major is refused with `MG_E_SCHEMA_VERSION` rather than partially understood. A
migration is a **replay that writes a new journal** containing a `schema.migrated` event — never an in-place
rewrite, so the audit trail of what a rule was derived from survives the upgrade.

```ts
// design contract, not implemented
migrate(from: 1, to: 2): { events: number; items: number; journal: string };
```

Gate: a fixture journal at v1 migrates to v2 with the same item ids, the same evidence counts, and a store
digest that differs only by the migration event. A v3 journal opened by a v2 reader raises
`MG_E_SCHEMA_VERSION` and leaves the file untouched.

**Packages.** `core`, `node` and `browser` share one version and are released together: a host that pins
`core@0.3` and `node@0.2` would be running two contracts. `eval` is private and never published. Subpath
exports are part of the public contract — adding one is a minor change, removing or renaming one is a major
change even though the entry point is unchanged.

**Deprecation.** A deprecated symbol keeps working for one minor and is reported by `doctor()` with the
replacement, because a silent removal in a 0.x package is indistinguishable from a bug to the host that
depended on it. The three new surfaces of §17.25 (`openTask`, `curate`, `forget`) enter at `0.3.0` as
additive; `recall`'s `budgetRatio` (D23) enters additive with the absolute cap as the default.

---

### 17.34 Closing what can be closed: three closures, one retraction, five deferrals

The nine evidence-open questions were carried as if each needed the implementation. Three do not, and
checking them exposed an error in our own record.

#### 17.34.1 Triage

| # | Question | Needs code? | Why | Status |
|---|---|---|---|---|
| 6 | Does task-level support stop inflation? | **no — arithmetic** | The Wilson bound is closed-form; both counting rules can be evaluated for every k | **closed**, and it exposed a live defect |
| 3 | Which retriever wins? (alias / coverage) | **no — replay** | Availability is a property of the committed artefact, not of the code | **alias half closed** (premise refuted); **ranking half open** (§19.3 #2) |
| 4 | Does task-type scoping starve? | **no — data inspection** | Every lane has exactly one task type, so a hard filter is an identity | **closed**: ships soft boost, reopen when a host has ≥2 types |
| 2 | Is a validity interval worth it? | no — **conditional** | Interval semantics pay only for queries that refer to the past; no lane contains one | **conditional decision** with a recorded trigger |
| 1 | Does pair contrast close the gap? | **yes** | No lane had a multi-attempt task: every question was one attempt, so a pair did not exist to distil from | **closed, negative** (iterations 42–43): 87.50% vs 87.50% at a 12.50% baseline, delta 0.00pp, **0 rules differing** between the stores. The lever fires (both arms correct 2/2 revisions from a stale rule), and the mechanism ablation shows why the null is structural: a correction at a scope where an active rule disagrees records a contradiction, which demotes it — even when the corrected run cited nothing |
| 5 | Do push and tool delivery earn their surface? | **yes** | There is no transport to measure and no agent to call a tool | open, blocked on §17.21 |
| 7 | Do the integrity invariants hold? | **yes** | Order invariance, replay determinism and erasure are properties of a store that does not exist yet | **closed** (iterations 25–26: 1.00 / 1.00 / 0 stale, a control that must disagree, and 0 of 10 erased records retrievable or cited) |
| 8 | Does an abstention kind help? | **yes** | Needs the kind, the renderer, and an unanswerable set that no current lane has | open, blocked on P2/P6 + dataset |
| 9 | Does the loop move a policy benchmark? | **yes** (effect) | Dataset availability is now closed; the effect needs the loop | open, blocked on L4 |

#### 17.34.2 Closure 1 — support counting is arithmetic, not an experiment

`wilsonLower(x, n)` is closed-form, and the policy activates at `activationThreshold = 0.6`
(`kernel/policy.ts`). Counting endorsements as **events** versus as **distinct tasks** gives:

| Endorsements, all positive | Event-counted LB | Task-counted LB (one task) | Ratio |
|---|---|---|---|
| 1 | 0.207 | 0.207 | 1.00 |
| 2 | 0.342 | 0.207 | 1.66 |
| 3 | 0.438 | 0.207 | 2.12 |
| 4 | 0.510 | 0.207 | 2.47 |
| 5 | 0.566 | 0.207 | 2.74 |
| **6** | **0.610** | 0.207 | **2.95** |
| 8 | 0.676 | 0.207 | 3.27 |

Two conclusions, both decisive without a run:

1. **The gate is closed.** The inflation ratio is 2.95× at six endorsements against a 1.15 ceiling, so
   event-counting is refuted by arithmetic. Six **distinct** tasks are what a 0.6 activation requires when
   every endorsement is positive — which is what D6/D7 were trying to express, now with a number.
2. **The shipped behaviour has a defect.** Counting events, **one task's six attempts admit a rule** — a
   single persistent user can populate the workspace unopposed. This is the mechanism behind 186–192 active
   rules per fold in the convention lane, and it is a live bug, not a design preference.

POC-27 is therefore **closed**, and its gate becomes a unit test at implementation: `trust(6 events, 1 task)`
must not reach activation, `trust(6 distinct tasks)` must.

> **Implemented differently, on purpose.** The shipped score is a log-odds fusion, not this Wilson bound:
> the arithmetic above models the *design's* counting rule, and the fusion is what the 17 study gates were
> calibrated against. Changing the formula to a Wilson bound would invalidate that calibration for no gain,
> so the defect is fixed at the mechanism instead — evidence is grouped by task before fusion, keeping the
> **strongest** observation per task and summing across tasks (`kernel/knowledge.ts`). Under log-odds the
> inflation was larger than 2.95×, because each event added a full term. The unit test pins the property the
> arithmetic argued for: six attempts of one task move the score by zero.

#### 17.34.3 Closure 2 and a retraction — the alias premise was a misattributed number

The design carried "47% of packs share no content word with their question; the median coverage is 7.1%".
Recomputing from the committed n=352 artefact (`packages/eval/src/bin/results`, run `39406533126`) gives a different picture:

| Lane | n | Zero-overlap packs | Median coverage | Questions with ≥1 overlapping active rule | ≥2 terms |
|---|---|---|---|---|---|
| BIRD, unmodified | 352 | **3.1%** (recorded) / 2.8% (recomputed) | **18.2%** | 99.7% | 79.8% |
| Convention subset | 146 | 3.4% | — | 100.0% | 85.6% |

**Where the wrong number came from.** 7.1% median and 47% zero are the distribution of the **40-question
smoke run** (`minCoverage = 0.34`, which emptied most packs), reported in §12.12 as if they were the
352-question result. The error is exactly the class §17.31 now forbids: a probe's number quoted at full
scale.

**What this changes.**

1. **"Retrieval coverage is the binding constraint" is withdrawn.** Coverage is respectable — a median of
   18.2% of the question's content terms, with 99.7% of questions having at least one active rule that
   shares a term. The pack was inert because the knowledge is redundant, which is what the oracle arm
   already said. The two findings now agree instead of competing.
2. **D8 (lexical alias) is rejected, with a reopening trigger.** It was invented to fix a zero-hit rate
   that is already 3%, and BM25 already scores the same terms, so an alias would re-weight a signal that
   exists rather than add one. It reopens only if a lane shows zero-hit > 5% **and** load-bearing knowledge.
3. **POC-33 is closed** (the question is answered: alias cannot move a 3% zero-hit rate), and **POC-18 is
   closed** (one task type in every lane makes scoping an identity; soft boost ships, reopening trigger
   recorded).

#### 17.34.4 Conditional closure — validity intervals

A validity interval buys exactly one capability: answering *what was true then*. No lane in scope contains a
past-referring query, and the host's workload is stated as current-state recommendation. So the question is
not "does it help" but "is there anything for it to help". **Decision:** demotion ships (D3 unchanged);
the interval implementation is deferred with a trigger — *the first host workload that queries a state as of
a past time* — and POC-15 stays specified for that day. This is a decision, not an open question.

#### 17.34.5 The five that genuinely need code, and the precondition each is waiting on

| # | Blocked on | Not a deferral of convenience: |
|---|---|---|
| 1 | a reader with a `negative`-lesson channel | the protocol question is answered (iteration 43): blame is redundant with contradiction resolution at the same scope, and the only thing the pair adds that the edit cannot is a `negative` lesson — which the deterministic reader cannot consume |
| 3b | the real index (POC-17, 17b) | ranking among 186 rules is exercised by the index; a replay cannot re-rank what it does not have |
| 5 | §17.21 transports | a webhook and an MCP tool are code; no measurement can precede them |
| 7 | P3/P4 stores | order invariance and replay determinism are properties of a store; today's store is the object under change |
| 8 | P2/P6 + an unanswerable set | the kind has no renderer and the dataset is not in the manifest |
| 9 | L4 | the effect needs the loop; the dataset and its licence are now confirmed available |

Each is recorded in §17.27 with a lane, a gate and an order, so none is an unowned question.

### 17.50 The dose axis, and an artefact that names the prediction it is judged by

**The question §17.49 left.** The content axis closed with a tie, and the only variable still standing
was how much text arrives: `full` is negative in every dispatch that measured it and every arm injecting
fewer items sits above it. Those cells differed in content, so nothing could be read as a dose response.
R16 changes one number per arm — the character budget `makePack` enforces — and holds the store, the
ranking and the question fixed.

**Why the axis is items and not characters.** `renderPack` walks the ranked list, adds a whole rendered
line or skips it, and returns `''` when not one line fits. An item measures 500–824 characters on this
store (median 582), so a budget is a step function: 150 and 300 admit nothing, 600 admits one item on
28.6% of questions, 1,200 admits 1.83, and the axis only becomes 0/1/2/3/4 with `chars-1800` and
`chars-2400` added. A dose response is read in `mean_pack_ids`; the budget that produced it is recorded
beside it and is not the reading.

**The prefix property is what makes the points nested rather than independent.** `chars-600` is a prefix
of `chars-1200` from the same ranking — extra text is appended, never substituted — so a difference
between two points is a difference in how much arrived, not in which items were retrieved. The price is
that a budget cannot express "the one item that fits": selection is a different operation from truncation
and R16 exposes it as such rather than papering over it with a smaller number.

**The prediction travels with the outcome.** `bin/sota-bird.ts` reads `SOTA_PREREG` and writes
`config.prereg` into the artefact, so a run names the file it is being judged against from inside its own
JSON, and `preregGateAgreement` in `prereg.ts` compares that file's header against the artefact in both
directions:

| Header field | Artefact field | Comparison |
|---|---|---|
| `arms` | `config.arms` | set equality, checked by `eval:prereg` against the file alone |
| `gates` | `gates[].id` | equality in both directions, with the id's `-slug` stripped to its code |
| `sample` | `n.total` | equality, by the run's own gates |

**Both halves are files, so the pairing is checked offline.** `bin/protocol.ts` gained a fourth claim:
for every committed artefact whose `config.prereg` is a string, read that file, require it to validate,
and require its `gates` to equal what the run emitted. Neither side can check itself — a dispatch holds
the artefact, `eval:prereg` holds the header — and R16 shipped a header copied from R15 that named seven
transfer gates a dose arm set could never emit. That is the fourth instance of the same defect (R12's
admission, R13's ledger, R15's V14/V17) and the first one where the repository holds both sides, so this
one is refused rather than narrated.

**What it refuses.** A gate the file names and the run never emitted; a gate the run emitted and the file
never named; a `config.prereg` naming a file that is not in the repository; and a file that is not a
pre-registration. A gate id in an artefact is `V17-net-sign` and in a header `V17`, so the comparison
strips the slug — a gate whose id carries no slug is already a code, which is why the separator is
searched for rather than assumed.

---

### 17.51 Standing as a property of the arm, and two gates that count what a prompt carried

**The type.** A pack is *what* is injected; R17 needed a second axis, *how it is addressed*. Three
`SqlArm` members were added and one `PromptInput` field:

```ts
export type PackStanding = 'advisory' | 'prohibitive';

/** One sentence, byte-identical in every arm that carries it. */
export const ADVISORY_SENTENCE: string;
/** The heading that classifies the block as error records. */
export const PROHIBITIVE_HEADING: string;
/** The standing each arm delivers under, keyed by the arm itself. */
export const ARM_STANDING: Partial<Record<SqlArm, PackStanding>>;
```

`standing` is optional and absent means the shipped wording, because every published number was produced
with it. `advisory` appends `ADVISORY_SENTENCE` after the block; `prohibitive` replaces the heading with
`PROHIBITIVE_HEADING`. The two are mutually exclusive by type: an arm that both doubted and damned its
block would measure neither. The sentence is phrased to hold when the block is absent ("any notes above"),
which is the only way the control arm can carry the *identical* string rather than a variant — a control
with different text is not a control, and the difference between `none-advisory` and `full-advisory` has
to be the block and nothing else.

**Why a table and not a parameter.** The standing is a property of the arm. A parameter at the call site
would let one arm be told twice and be told two different things, which is the failure the pack-kind
table was introduced to prevent. Living in `sota.ts` rather than in the lane also makes the rendering
testable without a database: a dispatch costs two thousand calls, a rendering costs nothing, so the
rendering is the part that gets checked before the run rather than after it.

**Composition order.** `standingBlock` is emitted *after* the critique instruction, not before it: that
instruction says "each item in that block", and a paragraph inserted between the block and the
instruction would leave it pointing at prose. For every other arm it lands immediately after the block
and immediately before the question, which is what the advisory cell is testing — the last thing read is
permission to disagree.

**V43-framing-delivered.** The arms differ from their controls by one paragraph, and an arm whose table
entry silently failed to match would measure the control under a second name and report the difference as
zero. `FramingDelivery` carries, per arm, the prompts it sent and how many carried the framing it
declares; the gate fails in both directions — a declared arm that misses one prompt, and an undeclared
arm that carries one. It is emitted only when some arm declares a standing, because a gate that always
passes is a comment.

**V44-domain-accounted.** `scope.domain` is the one scope field the host knows and the model only echoes,
and an item without one can never be pointed at a foreign question — so the count is the ceiling on every
transfer number a store can produce. Two paths produce such an item and they call for opposite fixes: the
interpreter declined to scope the claim at the door, or generalisation widened the domain away. The
distiller now counts the first (`DistillReport.incomingWithoutDomain`, counted after the host's `accept`
filter and before the store, because a refused claim can never explain an item), and the lane reports
both beside the stored counts. The gate is an inequality rather than an identity — `storedWithoutDomain ≤
unscopedIn + widenedIn` — so a surplus fails the run, and a surplus is exactly an item that lost its
domain somewhere nobody instrumented.

**`anchor-blank`.** The `ANCHORED` table gained a third field, `injects`, because the mechanism's headline
number never had its control: `anchor-blank` writes the same second pass with no block, so
`full-anchored` − `anchor-blank` is the note rather than the revision. `anchorPromptFor` already renders
the empty pack as no block *and* no instruction about one, so the control needed no new prompt builder.

**Tests.** `promptFor` is held to a literal for the shipped prompt, so adding a field cannot move the
baseline; the advisory cell is asserted to add exactly one paragraph to the same prompt; the prohibitive
cell is asserted to change exactly one paragraph rather than add one; the empty-pack advisory is asserted
to equal the no-memory prompt plus the sentence; the composition order with `critique` is asserted
positionally. Gates V43 and V44 each have tests for pass, both failure directions, and absence. The
distiller's counter has a test for the counted and the refused case.

### 17.52 A 2×2 over block and instruction, and an instruction that renders with no block

**The problem the design inherits.** R18 measured `full-anchored` − `anchor-blank` at +4.00pp
(p = 0.0385) and the two cells differ in two things at once: the block, and the instruction that closes
the prompt. `anchorPromptFor` deletes both when the pack is empty, on the grounds that an instruction
saying "apply that item" over a prompt with no items is not a weaker version of the arm but a different
question. That rule is right and it is also why the attribution cannot be made from R18.

**The type.** `AnchorMode` gains a third member, and the whole implementation is the string beside it:

```ts
export type AnchorMode = 'conservative' | 'conditional' | 'hold';

const ANCHOR_INSTRUCTION: Record<AnchorMode, string>;
```

`hold` is addressed to the draft — *change the first attempt only if it is wrong, and only in the way
that makes it right; if it already answers the question, return it unchanged* — and therefore never
mentions items, which is what makes it renderable with an empty pack. The render predicate in the
builder becomes:

```ts
input.pack === '' && mode !== 'hold' ? '' : ANCHOR_INSTRUCTION[mode],
```

**Why the exception lives in the builder.** The lane passes `pack: ''` for every non-injecting arm and
knows nothing else; the rule "an instruction that refers to items cannot render without items" is a
property of the instruction, not of the call site. Putting the exception where the table lives keeps a
future mode from needing every caller updated, and it keeps the failure mode visible: a mode whose text
names a block it was not given is a control that silently stops being a control.

**The square.** `ANCHORED` gains two rows and no new code path — the dispatch loop already reuses the
`none` answer as the draft and already keys the second round by `position:arm`:

|  | `conservative` | `hold` |
|---|---|---|
| `injects: true` | `full-anchored` | `full-anchored-hold` |
| `injects: false` | `anchor-blank` | `anchor-hold` |

Three of the four cells had existed for two iterations without anyone noticing that they compose into a
factorial; the fourth costs +2 calls per question, about 700 calls on the standard panel. The 2×2 is what
converts R18's single difference into two main effects, and it is the difference between the product
sentence *show the note* and *show the note and tell the model it may decline*.

**Why `hold` is not a `PackStanding`.** The standing axis (§17.51) appends a sentence about the block to
an arm that reads the block before the question. In this family the instruction *is* the variable: a
standing on `full-anchored-hold` would put a second sentence about the same block into a cell whose
variable is the sentence, and the pair would differ in two things again. The anchored arms declare no
standing, V43 stays inactive for them, and a test pins that silence rather than leaving it to convention.

**Tests.** The permissive prompt is asserted to render with an empty pack, and the two other modes are
asserted not to; the pair of permissive prompts is asserted to be *the same prompt plus the block* —
filtering the block paragraph out of one must reproduce the other, block for block — which is the
property that makes a row of the square a one-variable comparison. `ARM_STANDING` is asserted to contain
no anchored arm, and the arm union and `OPTIONAL_ARM_TABLE` are held to a list so that adding a cell
cannot be a silent edit inside a `Record`.


### 17.53 Reporting an interaction the lane cannot test

**The defect this design answers.** R20 is a 2×2 and the number it was registered for is the difference
of two differences: `(hold − conservative | block) − (hold − conservative | no block)`. This lane resolves
about 4.5pp on a marginal cell and about 3pp on a paired difference with 40 discordant pairs; a difference
of differences over four cells of 350 questions has a variance that none of those figures describes. The
pre-registration therefore states, before the run, that the interaction is **reported with its interval
and not tested**, and the reader script prints it under that label rather than computing a p-value for it.

**What is printed instead.** Four edges, each a paired exact McNemar over the questions both arms
answered, plus the cell accuracies in a 2×2 with the clause effect on each row. Every number in the
prose of `prereg/R20-anchored-hold.md` is one of those, so a reader can recompute the interaction from the
artefact without trusting a summary:

```
  block     conservative 53.43   permissive 52.86   clause effect  -0.57pp
  no block  conservative 50.57   permissive 52.57   clause effect  +2.00pp
  interaction (clause effect with block - without) = -2.57pp
    reported with no test: four cells at n=350 do not resolve it
```

**Why the interactive decomposition is worth an arm budget at all.** The mechanism question is not "does
the anchored cell work" — R18 answered that — but "which of its two texts does". A main-effect design
would have needed two dispatches and still could not have said which cell the effect lived in. The
factorial costs two arms and answers all four edges from one set of folds, and it produced an interaction
with the opposite sign to the prediction, which is the kind of result a single-difference design cannot
even express.

**The counterfactual cost of getting this wrong.** If the interaction had been assumed absent — the usual
implicit assumption when a second sentence is added to a prompt — the permissive sentence would have been
shipped as a free improvement, and the measurement says it is worth −0.57pp where a licence already
exists. The ±2pp band for that row was registered in advance precisely so that "no better" would be a
decision rather than an opinion.


---

### 17.54 A clearance is a treatment only if its control removes the same amount

**The defect this design answers.** R21 asks whether a pack of items *measured* to hurt is worse than the
same number of items chosen at random, and the naive implementation of that experiment is one arm against
`full` — which moves two variables at once. The record has already been burned by this twice: `full-grounded`
against `full` differed in which rules survived *and* how many, and the control that fixed it
(`full-sampled`) is the reason the grounded result could be read at all. Dose is not a nuisance parameter
here — R16 put the entire loss at the first item and 1.43pp of movement across a fourfold range above it —
so a filtered pack that lands above `full` is as likely to be reporting a smaller pack as a better one.

**The pair.** `full-cleared` removes the rules whose counterfactual record shows more harms than helps;
`full-cleared-sampled` removes the same *count* from the same pack, uniformly, over a seeded Fisher–Yates
permutation. Retrieval order is preserved in both, so the two prompts differ in item identity only.

```
    for each held-out question:
        pack      = recall(question)                       # identical for both arms
        dropped   = pack.items where record.harmed > record.helped
        cleared   = pack.items - dropped
        control   = pack.items - sample(pack.items, |dropped|, stream(seed + position))
        score(cleared) ; score(control)
```

**Where the dose can still move, and the gate that catches it.** `makePack` spends a **character** budget
and admits whole items, so two packs with the same number of survivors render a different number of items
whenever the survivors differ in length — a 500-character rule and an 824-character one are not
interchangeable at 1,200. That is not a hypothetical: it is the exact way the pair could stop being matched
without anyone noticing, because both arms would still look like "a smaller pack". So the counts the gate
reads are **post-budget** — `clearedPack.ids.length` against `controlPack.ids.length`, per question — and
`V45-clearance-dose-matched` fails the run on the first mismatch, and again if no question's pack changed
at all (two names, one condition).

**The decision rule, and why a tie is kept.** `clearanceFromDecisive` removes a rule when `harmed > helped`,
with a floor of one decisive comparison. A tie is kept: a 1–1 record is a measurement of exactly nothing,
and dropping on it would be asserting "unmeasured is bad" inside an argument that claims to be about
utility. That is the deliberate difference from `retireeFromDecisive`, which retires at a two-thirds harm
share precisely because retirement is a *safety* decision and clearance is a *filtering* one; the two
functions are tested against each other on the only input where they disagree.

**Why the credit pass had to be refactored rather than duplicated.** `validateMemory` used to call
`host.forget` itself, which made clearance impossible without either a second three-hundred-line copy or
a pruning of the store the arm was supposed to leave alone. It now takes its credit mode as a parameter
and returns the counterfactual record; `full-validated` is the caller that deletes. One consequence is
worth stating because it changes an artefact field: the mode is recorded as `validation_credit` from the
pass that actually ran, not from the environment variable, because clearance forces `counterfactual` —
the absolute score answers "was this rule present when the answer was wrong", which iteration 76 showed is
a question about the question's difficulty (single binomial across rules, p = 0.296).

**Tests.** `clearanceFromDecisive` for net harm, net help, a tie (asserted against its sibling), no record,
the floor, and sort order; `doseMatchedDrop` for exact count, reproducibility under a fixed stream,
without-replacement membership, over-asking, empty input, negative input and fractional input; `V45` for
absence, pass, a mismatch, and the all-identical failure. The lane's own numbers cannot test any of this —
a clearance that silently dropped a different count would produce a plausible delta.


### 17.55 A verbatim arm is only as good as the check that certifies it

**The arm.** R22's `full-raw` renders, for each recalled item, the correction event behind it: the question
that was asked, the query that came back wrong, the query that fixed it. Three labelled lines whose payloads
are the event's own strings, joined by newlines, under the shipped 1,200-character budget and in the shipped
position. `full-raw-shuffled` renders the same form from other questions on the same database, drawn at a
deterministic offset into the fold's corpus order and matched on *event count* rather than on characters,
because the control's job is to hold the vocabulary and change the subject.

```
    type RawEvent = { taskId, question, attempt, fixed }        # one per unsatisfied learn row

    rawEventBlock(e) = "Question: " + e.question
                     + (e.attempt == "" ? "" : "\nAttempt: " + e.attempt)
                     + "\nCorrection: " + e.fixed

    renderRawPack(events, budget) =
        greedy in recall order, whole blocks only: an event that does not fit is *skipped and counted*,
        never truncated, because half an event is a question with no correction
```

**Why skipping and not truncating.** The budget is the axis R16 measured as live, and every other arm spends
it by admitting whole items. A raw arm that cut a query to make it fit would produce a payload that reads
like a correction and is not one — which is the exact misreading the form exists to avoid. The artefact
therefore reports three numbers: events collected, events rendered, events skipped. R22's run: 638, 557, 81
(12.7% refused).

**Leakage is structural, not filtered.** Both arms draw from the fold's *learn* rows, indexed twice — by the
question each event was learned from (`rawByTask`, for the treatment) and by the database it was learned on
(`rawByDb`, for the control). An eval question's own correction was never learned, so it cannot be in either
index. Nothing checks this at run time; the construction is the guarantee, and `V2-fold-partition` covers the
partition it rests on.

**The check, and the dispatch it cost.** `V46-raw-is-verbatim` fails the run unless every rendered block is
byte-identical to the event it came from, and unless the arm rendered at least one. The first version split
the payload on newlines and matched each line against the corresponding field of any event — which cannot
represent a value that is itself multi-line, and the `Attempt:` field is SQL. Dispatch `41205745555` therefore
reported `1103/1632` on a payload that was fully verbatim: 1,632 = 3 × 544 rendered events, and 1,103 = 1,088
question and correction lines plus the 15 attempts that happened to be single-line. That ratio is the
diagnosis; no log was needed to read it.

The unit is now the **block**: `rawEventVerbatim` walks the payload and requires each position to start with
a whole block the renderer was given; a span that does not match is counted **once** however many lines it
holds, and the scan resynchronises at the next known block start.

```
    at = 0 ; cells = 0 ; verbatim = 0 ; sample = None
    while at < len(payload):
        if payload.startswith(block_of_some_event, at):
            cells += 1 ; verbatim += 1 ; at += len(block) ; skip one join newline
        else:
            next = first index > at where a block starts and the previous char is a newline
            cells += 1 ; sample ??= first line of payload[at:next] ; at = next
```

Three properties follow, and each is a test: a multi-line query is credited (the property the line split
could not express), a one-character change inside it is not, and a block whose three lines are all present
but reordered is not — which the line split *would* have credited, so the corrected check is strictly
stronger than the registered one. `sample` is the first rejected span, cut to 120 characters; the gate prints
it and nothing branches on it, because a count is a verdict and a sample is a diagnosis, and the first version
of this gate could only produce the former.

**What the arm measured, as a matter of design rather than of result.** `full-raw` − `full` = −0.86pp
[−4.57, +2.86]; `full-raw` − `full-raw-shuffled` = −1.43pp [−5.14, +2.29]. The paired interval is ±3.7pp at
350 questions, which is what the pre-registration's 1pp claim was measured against — a registration error
this document records as a rule: **a confirmatory claim has to exceed the paired half-width the design can
deliver, and that half-width is `1.96 · sqrt(discordant) / n`, computable before the run from the arms'
expected disagreement rate.** For R22, 43 expected discordant pairs at n = 350 gives 1.87pp per standard
error, so nothing below ~2pp should have been registered.

**Tests.** `rawEventBlock` for the empty-attempt omission and the three-line form; `renderRawPack` for
whole-events-only, the skip count, order preservation, and the empty case; `rawEventVerbatim` for an honest
pack, a reformatted query, a truncated one, a multi-line query, a modified multi-line query, a reordered
block, a heading above the pack, an empty pack and a line that is not an event; `V46` for absence, pass,
one block rewritten, the printed sample, and an arm that rendered nothing.

### 17.56 An ablation is a treatment only if the instrument can see it

**The block.** `none` renders four things: the task instruction, the schema, the question, and BIRD's
per-question `evidence` sentence. That last field is not ours — it is curated, human-written, per-question
domain knowledge shipped with the benchmark, and on this panel it is present on **350 of 350** questions at
25 to 468 characters (mean 142, median 135). Every number this project has published was measured on top of
it, and no iteration in twenty-two had ever removed it.

**Why removing it is the control rather than the experiment.** Three independent records price the same
manipulation: BIRD's own GPT-4 ablation at −20.01pp, Companion Agents (arXiv 2601.08838) at −12.7 to −18.4
across three systems, SEED (arXiv 2506.07423) at −8.4 to −20.9. Seven cells, four systems, one direction,
mean −15.2pp. A lane that has reported twenty-two nulls, all on a panel whose paired resolution is ±3.7pp,
and none of them against a manipulation anyone else has measured, has not shown that text does not help. It
has shown that it cannot tell. This is the first iteration where the expected answer is known before the
call is made.

**One implementation point, and it is the whole ablation.**

```
    ARM_DROPS_EVIDENCE = { 'none-noevidence': true, 'full-noevidence': true }

    promptFor({ ..., evidence })          ->  evidenceBlockOf(evidence)
    retryPromptFor({ ..., evidence })     ->  evidenceBlockOf(evidence)
    anchorPromptFor({ ..., evidence })    ->  evidenceBlockOf(evidence)

    evidenceBlockOf(e) = e == "" ? "" : EVIDENCE_LABEL + "\n" + e
```

`call()` is the single planner for every non-anchored arm, and it passes
`ARM_DROPS_EVIDENCE[arm] ? "" : row.evidence`. The two new cells are therefore planned by the same function
as the anchors with one argument changed — not by a second prompt builder that could drift. The label lives
in exactly one constant, which matters because `V47` searches the *sent prompt* for it.

**Why the check reads the prompt and not the flag.** This record has published a number computed from a
flag twice, and both times the flag was right and the rendering was not: a framing arm whose sentence never
arrived, a verbatim arm whose payload was mis-split. `V47-evidence-ablated` therefore counts, per arm, how
many of the prompts that were actually sent contain `EVIDENCE_LABEL + "\n" + the row's own sentence`, over
the questions whose row has one, and fails the run on any of three conditions:

1. **A shipped arm missed a question that had a sentence.** Every published number is a statement about a
   baseline that carries this block; an arm that silently dropped it is not that baseline.
2. **An ablated arm carried one anyway.** An ablation that removed nothing is `none` under a second name,
   and its difference from `none` would be published as "the evidence costs nothing".
3. **The ablated arm reached fewer questions than the arm it ablates.** 0 of 300 is a perfect ablation of a
   smaller experiment, and a count alone cannot see it.

Plans with an empty prompt are excluded, because they are case-assembly registrations rather than calls:
counting them would report an arm as having dropped a block it never had a chance to send.

**The manipulation check that is not a gate.** `V3` measures `full`'s parse rate. A prompt that has lost half
of what told the model which values exist may read as a different *task* rather than as less knowledge, and
a 20-point accuracy drop caused by unparseable replies would be a measurement of prompt coherence. The
registration therefore carries its own rule — the effect counts as a knowledge effect only if the ablated
arms produce SQL at within 5pp of the arm they ablate — and the artefact reports per-arm production counts
so the rule is computable from the file.

**The 2×2 and the interaction.** Four cells: `none`, `none-noevidence`, `full`, `full-noevidence`. The
primary contrast is `none − none-noevidence`. The secondary contrast is the difference in differences,
`(full − full-noevidence) − (none − none-noevidence)`, which is negative if a retrieved pack substitutes for
the curated hint and zero if the two are independent. It is read only if the main effect clears the
registered bar, because a four-cell difference in differences has roughly twice the variance of a two-cell
contrast at the same n and a null on it at 350 questions is uninformative by construction.

**Resolution.** With the literature's asymmetry (b ≈ 40, c ≈ 5 at a true 10pp effect on 350 questions), the
discordant count is ≈ 45, the paired standard error is `sqrt(45)/350 = 1.92pp`, and the half-width is
±3.8pp. The confirmatory claim is registered at **≥8pp**, 2.4 standard errors — the audit's rule from R22
applied before dispatch rather than after.

**Tests.** `evidenceBlockOf` for the label-plus-sentence form, the empty case (no dangling heading), the
single-rendering-point property, and the no-trace property; `V47` for absence, the clean 2×2, an ablation
that kept the block, a shipped arm that lost it, an ablation that reached fewer questions, and a 2×2 in
which nothing carried the block at all.

**What the 2×2 returned.** Dispatch `41223844474`, twelve gates, `V47` at `none 350/350, full 350/350,
none-noevidence 0/350, full-noevidence 0/350`.

```
    none              54.57%   (191/350)
    full              49.71%   (174/350)   -4.86pp  [-8.29, -1.43]   27/10  p = 0.0076
    full-noevidence   30.86%   (108/350)
    none-noevidence   29.71%   (104/350)

    evidence, no pack    +24.86pp  [19.71, 30.00]   96/9    p < 1e-4
    evidence, with pack  +18.86pp  [14.00, 24.00]   80/14   p < 1e-4
    pack, no evidence     -1.14pp  [-4.29, +2.00]   13/17   p = 0.5847
    interaction           -6.00pp  [-10.57, -1.71]  19 up / 37 down / 294 flat
```

The design worked as a design and one of its predictions failed, which is the intended use of the file. The
registered bar was ≥8pp and the effect is 24.86pp, so the panel is three times more sensitive than it was
asked to be; the registered claim that the pack would still cost points without the hint was wrong, and its
being wrong is the mechanism. The interaction's interval excludes zero and clears the declared |DiD| ≥ 4pp
bar, which is why the substitution reading is stated as a result rather than as a hint.

**What the ablation taught the technique.** Two things generalise beyond this lane.

1. **A positive control has to be a manipulation the literature has already priced, not one the lane invented.**
   Everything this record could vary about a note had an unknown true effect, so a null was ambiguous between
   "no effect" and "no sensitivity" for twenty-two iterations. The evidence sentence was the only candidate in
   the prompt with seven published cells behind it, and using it converted an ambiguity into a calibration.
2. **A factorial beats two one-variable tests whenever the baseline contains text.** The record had compared
   every arm against `none` and reported the deficit as a property of the arm. The fourth cell showed the
   deficit belongs to the *pair*: the same arm is −4.86pp against one baseline and +1.14pp against another.
   A lane whose treatment is added text and whose baseline already contains text owes itself the fourth cell.


## 18. Acceptance criteria

Two kinds of gate, kept apart: **project stages** (a phase of the roadmap) and **release gates** (what a
build must satisfy). The pipeline stages of §17 are P0–P8 and are not stages of the project.

### 18.1 Project stages

| Stage | State | Criterion | Threshold | Evidence |
|---|---|---|---|---|
| S0 mechanism | **closed** | study lift, transfer, poison, LLM distillation, reader, CPU scale | as recorded | `bench/results/study.json`, §12.1–§12.7 |
| S1 host shadow (nl2charts) | **unblocked, replaced by L0** | top-1 lift ≥+3pp (p<0.05), SQL regression ≤1pp, knowledge precision ≥85% | n=1,300, gold **derived by policy** rather than adjudicated (§17.27 L0) | a 100-case human audit remains calibration, not a gate; the host shadow resumes when real users exist |
| S2 public benchmarks | **closed on BIRD** | see below | — | §12.11–§12.13, `eval/results/poc-sota-bird.json` |
| S2b convention transfer | **read twice, gate not met** | Δ ≥+3pp (p<0.05) **and** recovery ratio ≥0.60 | n=146, resolves 5.08pp; measured +4.79 then +2.05pp, recovery 0.19–0.44 | §12.14 |
| S3 SOTA push | **conditional** | L3/L4 ladder (§17.27) | rung gates | not started |

**Why S2 is closed rather than "still running".** Four reads of one hypothesis — −2.84, −1.14, −0.57,
−0.28pp — every interval containing zero, while the instrument improved each time. The stop rule written
before the runs was "two benchmark failures end the SOTA path on that benchmark"; this is four. The
replacement lane is S2b, whose knowledge is unreachable from the schema, and it is the only lane where
the mechanism is load-bearing by construction.

**S2's original exit gate is superseded.** "BIRD-Interact ≥+5pp at n=600" measured a benchmark whose gold
encodes only what the schema already says, which is exactly what the four null reads established. It now
appears in §17.27 as lane L4's sibling (an interactive task-success lane) and is not a gate on S2.

### 18.2 Release gates

A build ships only if all eight pass. Each names its lane; none is advisory.

| Gate | Criterion | Threshold | Lane |
|---|---|---|---|
| RG1 | Loop utility on a convention-bearing lane | Δ ≥ +3pp, p<0.05 | L2 |
| RG2 | Recovery ratio against a stated ceiling | ≥ 0.60 | L2 |
| RG3 | No regression on unmodified public data | Δ ≥ −1pp | L2 control |
| RG4 | Token overhead of a pack | ≤ 15% of host prompt, ≤1,200 chars | POC-31 |
| RG5 | Distillation loss | ≤ 1% of corrections | L2 |
| RG6 | Integrity: attack success, order invariance, replay determinism | **0% / 1.00 / 1.00 measured** for a capability-limited attacker; 40% at trust 0.9 (limit) | L8 |
| RG7 | Retrieval: Recall@5, zero-hit, p95 at 10k | ≥0.90 (unmeasured), zero-hit ≤0.05 (**measured 0.031**), ≤5 ms | POC-17 |
| RG8 | Cost and footprint: ≤1 call/correction, ≤28 KiB retrieval bundle, ≤20 MB heap at 10k | as stated | POC-31, bundle metafile |

**No build satisfies these gates today.** RG1 and RG2 are short: the convention lane measured +4.79pp then
+2.05pp against a +3pp gate that must hold at p<0.05 on a replication, and a recovery ratio of 0.19–0.44
against 0.60. RG6 is half measured: the two replay invariants hold at 1.00 on 1,000 events, and the attack
half needs the MemForm harness of POC-29. RG3–RG5 and RG7–RG8 are unmeasured. The
table is the specification of what a shippable build must show, not a description of the current one.

**A failed gate is reported as failed.** No rounding, no re-slicing, no footnote. The record of the four
null public reads exists because that rule was applied to our own result.

---

## 19. Termination signal

**STOP — the design phase is complete after five audit passes. `AgentiX-E/microglia` is untouched and
awaits an explicit implementation signal.**

### 19.1 Five passes, and what each one caught

| Pass | Question asked | What it fixed |
|---|---|---|
| 1 | Is every pipeline stage specified? | Eight stages (P0–P8) with contracts, metrics, failure modes; fourteen POCs |
| 2 | Could an implementer still guess? | Three failed claims, twelve gaps, a decision register with defaults; two sources (MemForm, ALTK-Evolve) changed the design |
| 3 | Do the *documents as a set* satisfy the ten requirements? | Three stale records, a contradiction between two chapters, and four requirement-level omissions |
| 4 | Is requirement 6 actually met — are the leaders read, or only reported? | Three systems moved from secondary reports to source reads; two design rationales were **overturned** by what the code does; statistical discipline, a dataset manifest and a versioning contract were missing entirely |
| 5 | Are the nine evidence questions really blocked on code? | **No.** Three were answerable by arithmetic, replay and data inspection; one is a conditional decision. Checking them also exposed a **misattributed number** that had been driving the design |

Pass 3 found defects that no amount of re-reading §17 would have found, because they were *between*
documents rather than inside one:

| Defect | Where | Fix |
|---|---|---|
| A retracted number still stood as verified | `AUDIT.md` claim C19 asserted +3.33pp at n=30, withdrawn in §12.11 | rewritten: the retraction is the claim, with its successor read |
| Two chapters gave different S2 exit gates | §18 said "BIRD-Interact ≥+5pp at n=600"; ROADMAP had closed S2 on BIRD after four failures | §18.1 now states S2 as closed, and S2b's gate; the old gate became lane L4's sibling |
| The pipeline's new capabilities had no home | §17 named modules "core/capture (new)" and "core/distill (new)" without saying which subpath exports what | §17.25 maps nine capabilities to modules and symbols, with normative signatures and four new error codes |
| Requirement 4 had no numbers | §17 had latency targets only | §17.26 adds ingest, curation, cold start, heap, bundle and token budgets, plus a competitor comparison that names what is and is not comparable |
| Requirement 5 had no plan | Benchmarks were listed, not sequenced, powered or costed | §17.27: lanes L1–L8 with n, resolution, cost, artefact, gate, order, and a five-rung SOTA ladder with stop rules |
| Requirement 6 had citations but no register | Sources were quoted inline | §17.28 registers every source with an evidence class (source / paper / secondary) and forbids class-R numbers in product claims |
| Requirement 8 left twelve values open | "Wilson over task count", "every 50 events", "budgetRatio", decay floor | §17.29 fixes each to one value |
| Requirement 9 had topics but no conclusions | POC register listed work, not outcomes | §17.30 indexes every POC's conclusion or its explicit "not run, because" |

Pass 4 found a different class of defect: statements that were **honestly labelled** as secondary yet still
did design work, and two of them were wrong.

| Defect | What the source showed | Fix |
|---|---|---|
| The alias was justified by A-MEM's "per-item keywords" | `A-MEM.search()` scores dense distance on `content` and **never reads `keywords`**; the keyword field is produced by a method `add_note` does not call | D8 keeps its decision but not its citation: the rationale is our own C25 (47% zero-overlap packs) |
| PPR expansion was "deferred" as if cheap | `rerank_facts` is an **LLM call per query**, and graph search is skipped when no fact survives | D10 becomes **rejected for the default path**; a CPU-only default cannot make per-query calls |
| No rule against optional stopping | our own history has four looks at one BIRD hypothesis and two at the convention | §17.31: `looks`, one primary endpoint, Holm within a family, no pooling of discordant pairs across looks |
| The lane plan named datasets but not their provenance | BIRD Mini-Dev once lacked databases and had to be assembled from two repositories | §17.32: source, size, licence-at-fetch, pinning digest, and "blocked" rather than a silent substitute |
| A published SDK had no migration story | — | §17.33: schema N reads N−1, migrations replay into a new journal, subpaths are contract, deprecation lasts one minor |

### 19.2 Decided, deferred, rejected

| Status | Count | Where |
|---|---|---|
| Decided (mechanism ships) | **15** | §17.18 |
| Deferred, each with a shipped default and the ablation that can overturn it | **10** | §17.18 |
| Rejected, with the reason | **5** | §17.18 |

The ten defaults that ship before any ablation runs: demotion (not intervals), adjacent diff (not pair
contrast), prune off, `minTaskSupport = 1`, plain BM25 (no dense channel), `max(3×limit, 12)`, soft
`taskType` boost, JSONL, pull only, and one distillation call per correction.

The five rejections, each with a reason rather than a preference: GPU and fine-tuning (product constraint);
LLM-only distillation (loses the deterministic path for structured edits); delete-on-contradiction (destroys
the audit trail); **1-hop PPR expansion** (an LLM call per query, §17.28); and the **lexical alias** (its
premise was a misattributed number, §17.34.3).

### 19.3 What closed in the design phase, what is conditional, and what is open

**Closed without code — three.** Each was carried as "needs the implementation" and was not.

| Was | Closing evidence | Consequence |
|---|---|---|
| Does task-level support stop inflation? (POC-27) | `wilsonLower` is closed-form: counting events gives a **2.95×** higher bound at six endorsements, and **one task's six attempts reach the 0.6 activation threshold** | the gate is closed and a **live defect** is identified: today a single persistent user can admit a rule. Six distinct tasks are what activation requires |
| Does a lexical alias fix the zero-coverage packs? (POC-33) | Replay of the committed n=352 artefact: zero-overlap is **3.1%**, median coverage **18.2%**, and **99.7%** of questions already have an overlapping active rule | the alias is **rejected**; the earlier 47% was a 40-question probe published at full scale (§17.34.3) |
| Does task-type scoping help or starve? (POC-18) | Every lane has exactly one task type, so a hard filter is an identity | soft boost ships; reopen when a host has ≥2 task types |

**Conditional — one.** A validity interval buys exactly one capability: answering *what was true then*. No
lane in scope contains a past-referring query, so demotion ships (D3) and the interval implementation waits
on a recorded trigger: the first host workload that queries a state as of a past time.

**Open — six.** The ninth question split in two when its alias half closed: what remains is ranking.
So nine questions yield ten answers: three closed, one conditional, six open.

| # | Question | Blocked on | Why no design-phase answer exists |
|---|---|---|---|
| 1 | Does pair contrast close the ceiling gap? | **answered: no** (iteration 43) | with two teaching rounds and a revision the delta is still 0.00pp and the stores are identical; the residual question is the reader's channel for `negative` lessons, not the protocol |
| 2 | Which over-fetch and ranking settings maximise Recall@5? (POC-17, 17b) | the real index | ranking among ~186 active rules is a property of the index, not of the artefact |
| 3 | Do push and tool delivery earn their surface? | §17.21 transports | no transport exists to measure, no agent exists to call a tool |
| 4 | Do the integrity invariants hold? | **closed** (POC-28, iterations 25–26) | order invariance 1.00, replay determinism 1.00, control 0.00, post-erasure recall 0 |
| 5 | Does an abstention kind reduce confident wrong answers? | P2/P6 + an unanswerable set | the kind has no renderer and the dataset is not in the manifest |
| 6 | Does the loop move a policy benchmark? (τ-bench) | L4 | the effect needs the loop; dataset availability and licence are now confirmed |

Each open question has a lane, a gate and an order in §17.27, and a POC identifier. None is unowned and none
is a requirement ambiguity.

### 19.4 Requirement-by-requirement discharge

| # | Requirement | Where it is discharged | What would falsify the discharge |
|---|---|---|---|
| 1 | Monorepo, layered subpackages, import on demand | §3.2 (three packages, dependency rules), §17.25 (nine capabilities → modules, subpath bundle budgets, a test that a retrieval-only bundle contains no distiller) | a budget overrun at implementation; a cycle between `kernel` and `capture` |
| 2 | Highest standard, no compromise | §17.2 (eight-stage contract), §17.18 (every decision named), §17.29 (one value per question), zero-dependency core, no default provider, empty pack renders nothing | any stage whose behaviour depends on an unstated constant |
| 3 | Scientific tests, strict acceptance | §17.19 (per-stage metrics with failure modes), §17.20 (E1–E6), §18.2 (RG1–RG8, none advisory), power stated per lane | a gate that passes on a rounded number |
| 4 | Extensible and faster than competitors | §17.25 (subpaths), §17.26 (footprint and latency budgets), §17.28 (rival mechanisms adopted or rejected on evidence), the poison baseline (19.64% vs 100.00%) | POC-21/32 showing a rival recovers more of the ceiling |
| 5 | Complete benchmarks, executable plan, SOTA path | §17.27 (L1–L8 with n, power, cost, order), SOTA ladder R1–R5 with stop rules, preregistration and artefact rules | a lane without a resolution, or a claim without an artefact |
| 6 | Competitor source study | §17.28 register: **five systems read at source** (mem0, Graphiti, A-MEM, HippoRAG 2 — partial file, LangMem) plus cortex field-by-field; papers for ACE/ExpeL/τ-bench; secondary only for ALTK-Evolve, MemForm, MINJA and the Cognee/MemoryOS/Memori group, each labelled | a class-R number used as a product claim; a class-S finding contradicted by the next read |
| 7 | Every claim cross-checked | `AUDIT.md` C1–C31 with an evidence class per claim; class-R numbers confined to targets and design inputs; the n=30 read retracted rather than kept | a claim whose instrument is not named |
| 8 | No ambiguous requirement or feature | §17.29 (twelve values), §19.3 (nine open questions, none about requirements), §17.30 (no POC without a conclusion or a reason) | two documents stating different thresholds |
| 9 | Every POC topic and conclusion recorded | §17.30 (index with conclusions and "not run" reasons), §17.23 (status per POC) | a POC referenced but absent from the index |
| 10 | Pipeline steps complete, options decided or deferred, metrics and evaluation complete | §17.2–§17.24: stages, decision register, twelve gap closures, end-to-end metrics, delivery contracts, competitor register v2, POC register v3 | a step whose option set is a single candidate with no comparison |

### 19.5 What is deliberately not delivered

| Not delivered | Reason |
|---|---|
| Code for any §17 stage | Excluded by instruction; the product repository is frozen at `c55cff1` |
| The five open POCs (14, 17, 17b, 19, 20, 28, 29, 30, 32, 31b) | each is blocked on something named in §19.3; running it against a design measures its absence |
| An SOTA claim | Recovery ratio is 0.19–0.44 against a 0.60 target, and no τ-bench run exists |
| A cost guarantee above 100k items | Measured to 10k only (POC-25) |

### 19.6 Final state

| Document | State |
|---|---|
| `WHITEPAPER.md` | Product thesis, evidence, competitors, constraints |
| `TECH-DESIGN.md` | §1–§16 (mechanism), §17 (pipeline: stages, decisions, gaps, metrics, contracts, competitors, POCs, package mapping, performance, evaluation plan, source register, disambiguation, POC index, statistical discipline, dataset manifest, versioning), §18 (stage and release gates), §19 (this record) |
| `ROADMAP.md` | S0–S3 with every read, including four null and two positive |
| `PROGRESS.md` | Twenty iterations with evidence and defects |
| `AUDIT.md` | C1–C31 with evidence classes, nine defects (B1–B9), and two retractions |

**End of design phase.** Awaiting the implementation signal.

### 17.35 Repository boundary: the rule, and the audit behind it

The deciding question is **what a file tests, not what it says**. If running it tells you something
about *this library*, it belongs in `AgentiX-E/microglia`, even when the thing it measures is an
external dataset or a third-party model. Everything that describes the project rather than the product
belongs here.

| Artefact | What it tests | Repo |
|---|---|---|
| `packages/eval/src/bin/llm-reader.ts`, `llm-distill.ts`, `embedding.ts` | whether the library's reader, distiller and retriever work against real providers | microglia |
| `packages/eval/src/bin/scale.ts` | recall latency and heap of the embedded store | microglia |
| `packages/eval/src/bin/attribute.ts` | which rules caused a flip | microglia |
| `packages/eval/src/bin/sota-bird.ts` | the flywheel's effect on a public text-to-SQL benchmark | microglia |
| `packages/eval/src/bin/integrity.ts`, `memform.ts` | the store's replay invariants and its attack surface | microglia |
| `packages/eval/src/bin/l0.ts`, `l4.ts` | the adjudication and τ² lanes | microglia |
| `scripts/audit.mjs`, `cortex-conformance.mjs` | the repository's source rules and the projection's fidelity | microglia |
| ~~`scripts/hf-inventory.mjs`~~ **removed** | it listed a Hugging Face dataset's inventory for the `sota` job. Removed in iteration 51: the lane now verifies its own data (pinned manifest, digest, row counts), so the step was a second opinion nobody read, and it was the reason a run could look healthy while measuring a two-day-old artefact. Recorded here rather than deleted, because a row that silently disappears hides a decision | — |
| `.github/workflows/{ci,sota,poc-live,cortex}.yml` | build, coverage, benchmark, live-API and conformance gates | microglia |
| `eval/results/`, `bench/results/` | artefacts written by those gates, cited from here | microglia |
| This document, the whitepaper, the roadmap, the audit, the progress log | the project | microglia-docs |

Two consequences worth stating. First, **no POC migrates**: every one of them measures the library, so
the rule the owner gave — *a workflow whose target is microglia belongs in microglia* — puts all of them
where they already are, and moving them would have split each lane from the CI that runs it. Second, the
boundary is now **enforced**: `pnpm audit:repo` fails if `WHITEPAPER.md`, `TECH-DESIGN.md`, `ROADMAP.md`,
`AUDIT.md` or `PROGRESS.md` appears at the root or under `docs/` of the product repository. A document
that drifts back is a red build, not a discovery two releases later.

### 17.36 Bounded concurrency in the benchmark lane, and the three defects it exposed

A full BIRD split is 2,400 prompts. Issued in series at two to five seconds each that is more than two
hours, and the first dispatch to try it spent 160 minutes reaching fold 4 of 5 — a single provider stall
cost 48 minutes on its own. The measurement does not depend on completion order, so the lane now plans a
fold's prompts, issues them through a bounded pool, and scores the replies afterwards in corpus order.

| Decision | Alternative rejected | Why |
|---|---|---|
| Pool at the *prompt* level (`mapPool`, six in flight) | pool at the question level | a question is four prompts, so a question-level pool leaves the pool idle between arms and makes the wall clock depend on which arm is slowest |
| Two phases: plan, then call, then judge | interleave recall with the calls | recall reads the frozen pack; interleaving it with calls would make a prompt depend on when an unrelated call finished, which is a measurement change for a scheduling convenience |
| Cache the learning-pass generation per question | re-ask per fold | cross-fitting asks the same prompt once per fold it appears in — four times at k=5 — because the prompt is a function of the question, its evidence and the schema. Caching deduplicates identical work (1,050 of 1,400 calls here); it does not change a condition |
| Circuit breaker: eight consecutive exhausted prompts end the run | let the retry policy decide per call | a per-call policy answers "this call failed", never "the provider is down". A run through an outage produces a number that describes the outage, and the numbers looked plausible enough that only a gate would have caught it |
| New blocking gate V8: at most 2% of prompts may go unanswered | rely on the retry counter | 2% of 350 questions is seven; a 2pp systematic drag is a seventh of the smallest effect the sample resolves, so it cannot manufacture the finding. The denominator is logical prompts, not HTTP attempts, which is why both are recorded |
| `MG_E_PROVIDER_FAILED` as its own code | reuse `MG_E_STORE_IO` | the host has to tell "my store is broken" from "the model endpoint is down", and they need different responses. A `Record<MicrogliaErrorCode, status>` in the HTTP tests makes an unmapped code a compile error |

**The refactor that made it testable.** The prompt, the arm parser, the reply parser, the result
canonicaliser and every validity gate lived in `bin/sota-bird.ts`, which `vitest` excludes — so the lane's
*decisions* were the least covered thing in the repository. They are now `eval/src/sota.ts` (100% on all
four dimensions) and `eval/src/concurrency.ts` (100%), with the CLI reduced to composition: download,
SQLite, HTTP.

**Two defects the split found, both pre-existing.** The gold query was executed **twice inside one
comparison** (`execute(dbPath, row.SQL)` on both sides of `matches`), so scoring one question scanned a
million-row table three times; it is now cached per question. And the schema was re-read once per arm per
question — a thousand opens to read eleven strings that cannot change during a run; it is now read once.

**A third, found by writing the test rather than by reading the code.** `MG_E_PROVIDER_FAILED` was added to
the code union and `statusFor` in the HTTP layer had no case for it: the switch was exhaustive, so `tsc`
refused the build. That is the intended failure mode — the alternative was a 500 for a failure that is a
503 — and the test now uses a `Record` over the union so the next code has to be mapped to compile.

### 17.37 The L4 driver: where an external agent meets our store

τ²-bench is not a dataset, it is a program: it owns the environment, the user simulator, and the evaluator,
and it constructs agents through a registry. That shapes the integration more than any API detail does.

| Decision | Alternative rejected | Why |
|---|---|---|
| Subclass `LLMAgent` and override `generate_next_message` | fork the benchmark, or add a hook upstream | the registry calls a fixed constructor for every `LLMAgent` subclass, so a subclass needs no upstream change and no vendored copy of someone else's sandbox |
| Inject the pack as one extra **system message** | append to the policy, or expose recall as a tool | the product's claim is context, not capability. A tool would change what the agent can *do*; a policy edit would make the pack indistinguishable from the domain rules the benchmark is testing |
| Inject on a **copy** of the state | mutate the state in place | τ² keeps one state object for the episode; appending in place accumulates one pack per turn, so turn ten carries ten copies and the prompt grows without bound |
| Recall over a **one-endpoint** HTTP facade | import the SDK into Python, or pass packs at start-up | the agent runs in another process, and the smallest boundary that works is `GET /v1/recall`. Packs cannot be passed at start-up because recall depends on what the user just said |
| Feedback written **in-process by the driver** | let the agent write feedback | an agent that writes while it is measured is not being measured. The driver learns from the training half only, before the held-out half is touched |
| Split, corrections and argv in **TypeScript** | do it in the Python script | those are decisions, and decisions belong where the test runner is. The argv in particular: a flag typo fails after the environment is installed |

The last row has a cost worth stating: the Python side cannot be unit-tested here, so it is kept to the two
things that must be Python (subclassing the agent, calling `run_tasks`) and everything else is pushed into
`tau2.ts`, which is at 100% on all four dimensions.

**A defect the wiring produced.** `TAU_DRIVER=./packages/eval/src/bin/tau2-driver.ts` is the obvious value a
workflow would set, and a relative specifier in a dynamic `import` resolves against the importing module, so
`bin/l4.ts` looked for `bin/packages/eval/...`. The loader now resolves relative and absolute specifiers
against the working directory. The end-to-end test drives list → split → evaluate → `pass^4` against a
stand-in runner, because that is the only way to verify the orchestration without a Python clone.

### 17.38 A rule carries the condition it was learned under

Iteration 62 measured the retriever out: a rule credited with a hurt sat at median cosine 0.232 from the
question that was harmed, a rule credited with a help at 0.228 (p = 0.86 over 222 pairs), and word coverage
was 0.133 against 0.130. Two signals, no separation. So the variable is not *which* rule reaches the prompt
but *what the rule says*: a statement records what was true and never when it is true, and the pack asked
the model to treat the first as the second.

`KnowledgeItem.when` is that missing half. Five decisions carry it.

| Decision | Alternative rejected | Why |
|---|---|---|
| The condition is a first-class field, not a sentence inside the statement | append "when X applies: …" to the text | a field can be dropped, counted, filtered on and audited; a prefix inside a sentence can only be read, and the rendering experiment needs the *same items* with and without it |
| Rendered **before** the claim | after, as a footnote | a reader that meets the test first can decline to apply the rule; the same sentence after the assertion reads as a qualification of something already stated |
| Identity ignores `when` | include it in the dedupe key | two observations of one rule must accumulate support. Folding the condition into the key makes one rule compete with itself the moment a later event describes the scope differently |
| The merge adopts a condition once and then holds it, counting a later conflict | last write wins | a rule whose scope depends on which event arrived first cannot be debugged. `conditionConflicts` is where a second description is visible |
| A condition that restates its claim is dropped; one that reads as an instruction rejects the claim | keep whatever the model returned | a restated condition teaches that the field is decoration; a condition that *commands* is the exact failure the field exists to prevent, and keeping the claim without its scope stores that failure |

**Widening keeps the condition.** Removing a scope dimension is not removing the description of
applicability, and blocking widening for conditioned rules would confound the arm that measures widening.
The condition travels, and it is the thing the reader is asked to check.

**The arm that prices it.** `full-plain` renders the same items — `pack.items`, the ones that survived the
budget — with the condition removed and the plain note. Since a plain line is shorter than a conditioned
one, the plain pack can only contain a prefix of the same ids, so the comparison is one field of text and
nothing else. Comparing two dispatches for this would put the answer inside the run-to-run noise, which on
this benchmark is 0.7–1.4pp.

**Two instruments that make the null readable.** `injected_rules` / `injected_with_condition` /
`active_with_condition` count what the distiller actually produced, and gate **V12** reports the share: a
run in which no rule carries a condition has two identical arms and a delta of zero that means nothing.
And the freeze digest now includes `when`, because two memories that differ only in the condition are two
different memories — a digest that ignored the field would call them equal and leave the freeze proof
silent about the experiment it guards.

**Pairing controls with the treatment.** Every control used to be described by its delta against `none`,
and the difference between two controls was read as the difference of two deltas — a point estimate with
no interval. `armPairsAgainstFull` pairs each control with `full` on the questions both answered, and the
lane records it as `arm_pairs`; `pnpm eval:arm-pairs` recomputes it from any artefact, which is what makes
older reports auditable rather than merely quotable. Its first finding was a correction of our own:
`full-narrow` is **+0.86pp [−2.00, +3.71], p = 0.71** against `full`, not "0.86pp of the 4.00".

**Result.** The condition changed 48% of the SQL strings and 20 of 350 verdicts — ten gained, ten lost —
for a paired **0.00pp [−2.57, +2.57], p = 1.000**. With the new prompt none of the 49 credited rules
restates its question any more, so the harm survives correct, general, conditioned rules. A language model
reading prose does not evaluate a condition it was given; the next change has to make applicability
machine-checkable or state that the mechanism steers generation without certifying it.

### 17.39 The corroboration floor, and an empty pack that measures the noise floor

The pack layer decides three different things, and keeping them apart is what made the last measurement
readable: **scope** (which rules could apply), **coverage** (which rules the question mentions) and
**corroboration** (which rules have been observed more than once). `minEvidence` is the third, defaulting
to 1 so no caller changes behaviour on upgrade.

| Decision | Alternative rejected | Why |
|---|---|---|
| The floor lives in `buildPack`, before MMR | filter the pack after `recall` in the lane | the lane would then measure a reimplementation of the product path, and a corroborated rule must be able to take a slot an uncorroborated one would have filled |
| A nonsense floor (0, negative, fractional) is clamped to 1 | interpret it | "require -5 observations" has no reading, and a threshold that is silently reinterpreted is worse than one that is refused |
| The default stays 1 | ship 2 because it protects BIRD | floor 2 costs a recurring workflow 3.57pp of a 68.21pp lift to protect a workflow whose corrections never repeat. A host knows which it is; an upgrade does not |

**The empty-pack control.** On BIRD the floor injects nothing — 0 of 1,296 rules have a second
observation — so the arm is functionally "no pack". Running it twice in one job gives the lane its
**within-run noise floor**: 190/350 against 189/350, 0 lost and 1 gained, **0.29pp**. That number did not
exist before, and every cost this lane has published (−2.00 to −4.00pp) should be read against it: the
harm is 7–14 times the nondeterminism, not 2–4 times.

**The pair of numbers that states the thesis.**

| Workload | Floor 1 | Floor 2 |
|---|---|---|
| chart study, six recurring defect families | 100.00% (+68.21pp) | 96.43% (+64.64pp) |
| BIRD Mini-Dev, 350 questions, every correction unique | 52.00% (−2.00pp) | 54.29% (0 rules, +0.29pp) |

A mechanism that lifts a recurring-defect workload by 68pp and costs a unique-correction workload 2–4pp is
not inconsistent: it is conditional on recurrence, and recurrence is measured — `evidence.length` — before
the first inference.

### 17.40 The critique arm, and the detector that replaces it

Five levers were measured out before this iteration — retrieval on the claim, retrieval on the condition,
widening, dosage, foreign rules — and two of them pointed *backwards*. The sixth asked a different
question: not whether the model can be *told* when a rule applies, but whether requiring it to **return a
verdict** about each item changes anything. MemHarness calls it critique; it costs no extra call.

| Arm | Accuracy | Δ vs none | Paired against `full` |
|---|---|---|---|
| none | 53.14% | — | — |
| full | 50.29% | −2.86pp [−5.71, +0.00], p = 0.076 | — |
| critique | 50.57% | −2.57pp [−5.43, +0.29], p = 0.122 | **+0.29pp [−2.29, +2.86], p = 1.000** |

Twenty-three of 350 verdicts changed (11 lost, 12 gained). The requirement was followed — the answers
moved — and the quality did not. A prompt that forces an explicit decision about each item is still a
prompt, and the model's decision agrees with its generation rather than correcting it.

**What replaced it is not a seventh lever but a measurement.** The three workloads now say the same thing
about *when* the mechanism works:

| Workload | Corrections | Effect |
|---|---|---|
| chart study, six defect families | recur | **+68.21pp** |
| BIRD Mini-Dev, 350 questions, 1,296 rules | every one unique | **−2 to −4pp** |
| τ²-retail, 46 training tasks | each corrected once | **−7.35pp** (difference of means) |

The property is the store's own: the share of active rules with more than one observation. It needs no
model, no schema and no inference, and `Microglia.corroboration()` returns it before the first request.
`minEvidence` on the pack is the enforcement — floor 2 on BIRD injects nothing, which is the honest
configuration there, and costs 3.57pp of a 68.21pp lift on the study.

**The instrument defect this iteration found is the general lesson.** The L4 pairing step ran, and exited
with `first artefact has no per_task rows`: `bin/l4.ts` read a reference artefact's rows and *no code ever
wrote them*, so `l4-paired` had been reporting `pass` on every run since it was added, on the grounds that
no reference arm was configured. A gate whose input is never produced reads green forever. `perTaskRows`
writes the rows now, refuses a task with no id rather than labelling it `unknown`, and the pairing step's
own failure is what surfaced it.

### 17.41 The validity gates, in one place

Twelve gates decide whether a benchmark number may be published, plus five that decide the same for an
L4 run. They are listed together because the pattern is the point: every one of them was added after a run
produced a number that was *technically* a number and not evidence of what it claimed.

| Gate | Blocking | What it refuses |
|---|---|---|
| **V1** pack not empty | yes | a run whose "treatment" injected nothing |
| **V2** fold partition | yes | a question scored twice, or scored by a fold that learned from it |
| **V3** parse rate | yes | a reply the parser could not read, counted as a wrong answer |
| **V4** gold executable | yes | a gold query the engine rejects: the denominator is broken, not the model |
| **V5** resolution | no | a sample whose minimum detectable difference exceeds 6pp — a direction, not a verdict |
| **V6** controls inject | yes | a control arm that injected nothing and was read as a control |
| **V7** channel | yes | a pack that never reaches the model (oracle must move ≥10pp) |
| **V8** call reliability | yes | more than 2% of prompts unanswered: a run through an outage measures the outage |
| **V9** subset size | no | a convention run with fewer than 100 qualifying questions |
| **V10** convention executable | yes | a rewritten gold query that does not reproduce the expected value: a scoring bug indistinguishable from a model that cannot follow the convention |
| **V11** channel ceiling | yes | an oracle below 90%: the lane is measuring output format, not knowledge |
| **V12** shape present | no | two arms that differ by a field no rule carries: the comparison is the same pack twice |
| **l4-pass4** | yes | a run that misses `published + 5pp` |
| **l4-paired** | yes | memory worse than the same agent without it at p<0.05 |
| **l4-coverage** | yes | fewer than 60 scored tasks |
| **l4-fully-scored** | yes | any task dropped as an infrastructure failure |
| **l4-same-split** | yes | two arms that did not score exactly the same tasks |

Five of them earned their place by firing: V5 on the 60-question pilot, V7 and V11 on the convention
lane's two oracle forms, V8 on a run that would otherwise have measured a provider outage, and V12 on the
first shape run (100% of injected rules carried a condition, which is what made its null readable).

**The one that did not fire is the lesson.** `l4-paired` passed on every run between its introduction and
iteration 66, because no artefact ever carried the per-task rows it compares — a gate whose input is never
produced reports `pass` forever. It is now written, tested, and the pairing step fails loudly when the rows
are absent.

### 17.42 Enforcement: a floor the library applies, not a paragraph the caller reads

Iteration 65 established *when* the mechanism helps and wrote the answer down as advice. Advice is not a
behaviour: a host cannot measure its own recurrence before it has run, and the store can.

`corroborationFloor` closes that loop inside `recall`. Three decisions carry it.

| Decision | Alternative rejected | Why |
|---|---|---|
| The share is cached per knowledge version; `distill`, `curate`, `recordFeedback` and `forget` bump it | rescan the store per request | the share is a per-distillation fact on the request path. A host with 100k rules would pay a full scan per prompt for a value that changes when it distils, not when it asks |
| Applied as `minEvidence: 2`, not as a special "empty" path | return an empty pack directly | the pack layer already knows how to enforce an evidence floor, and a second implementation is a second place for the two to disagree |
| `suppressed` distinguishes a policy silence from a miss | leave the pack empty | a host that reads a deliberate silence as a retrieval failure weakens its thresholds until the noise returns, which is the failure this project spent five iterations measuring |

**A field that stops at a package boundary does not exist.** `/v1/recall` returned ids, text, hash and
truncation, and dropped `suppressed` — so the one consumer that needed the distinction got the pack without
it. The response now carries it, and the test asserts both directions: a silenced pack names its reason, an
unmatched one does not carry the field at all.

**What the option is not.** It is not a default. An empty pack caused by a policy is worse than a full one
when the policy is wrong about the workload, and the numbers that justify the floor (68.21pp on the
study, −2 to −4pp on BIRD, nothing resolvable on τ²-retail) were measured on this repository's three
workloads. A host that knows its corrections recur should leave the option off and keep the pack.

### 17.43 Binding a rule to the schema it is shown in

R9.4 left a null that two classes of explanation fit equally well: a rule stops working across a
database because the memory's content is weak, or because the sentence has no referent there. The
same-database control separates them — repair 3.52% / break 42.6% at home against 6.7% / 10.4%
away — and the second explanation predicts that changing **how** the rule is shown changes the
reading while the stored content is untouched.

`packages/eval/src/template.ts` is that change, as three pure functions over schema name sets.

| Decision | Alternative rejected | Why |
|---|---|---|
| The template is derived at use time from the stored statement | teach the distiller to emit templates | the distiller's output is stored, audited and reproduced by every arm; changing it moves every artefact at once and leaves the two arms incomparable on anything but the template |
| A slot is an identifier the **home** schema has | lift every capitalised or backticked word | "the second highest" and "a date column" are not bindable, and a slot that cannot be filled is a defect carried into the prompt |
| Binding scores name parts by Jaccard; nothing below 0.5 binds | stemming, edit distance, embeddings | each raises the binding rate by inventing referents. `price` → `prize` is a rule about prize money, and the arm would then measure that |
| Ties go to the shorter candidate name | refuse ambiguous slots | a refusal on every two-candidate slot withholds most of the family, and R10's own kill condition is 60% withheld; the shorter name adds least to what the rule already said |
| One candidate never fills two slots | allow it | two slots of one template are two objects in the source database; mapping both onto one is a rewrite the rule never claimed |
| A slot with no candidate withholds the rule | show it with `{price}` still in it | an unbound template is the sentence the construction exists to replace, and it would be an unmeasured defect inside a measurement |

**The unit of the reading is the attempt, not the rule.** One rule can bind in `formula_1` and be
withheld in `california_schools`, so the coverage record is keyed `<rule>\0<database>`, collapsed on
duplicates (a lane reports one attempt per trial, and counting those separately would make the
binding rate a property of the panel size), and it names the **blockers** — "`rental_rates` stopped
nine attempts" is checkable against a schema, "20% were withheld" is not.

**Gates.** `V24` had to change denominator and the change is the interesting part: coverage is now
`(rules − withheld attempts) × panel`, because under the bound form a withheld attempt is the
pre-registered behaviour and not a lost injection. Counting the selection alone would fail the run
for doing what was asked; counting only the rules that reached the ledger would let seventy-nine of
eighty rules vanish and pass. `V28` is what closes that second hole: `bound + slotless` attempts must
equal the rule-database pairs the foreign ledger carries, so a rule that disappears is a defect and
withholding is a number.

**Cost.** Zero model calls. The lane prints the binding record before the first call is made, so a
dispatch whose binder withholds more than the stage's kill condition can be stopped rather than
read.

**The construction was refused by its own census, for free.** Withholding is a property of schemas,
so `bindingCensus` answers it from an artefact and a directory: 289 rules (the artefact lists the
store once per fold, and the census collapses the repeats), 259 with a home database, **10 bound
somewhere, 76 slotless, 173 withheld — 66.8%**, against the 60% the pre-registration fixed. The
blockers are table names (`posts`, `cards`, `drivers`) and column names (`lap`, `patient`), which is
the answer to *why*: those are the domain elements SQL-Exchange substitutes by mapping to the target
query, and a name comparison never sees a query.

The consequence is written into the stage rather than into a note: arm B was not dispatched, the
hypothesis stays untested, and the successor binds against `linkSchema`'s answer for the *target
question* — the tables and columns it actually mentions — instead of against spelling. The same
command computes the successor's kill condition before it buys anything, which is the reusable part
of this iteration.

### 17.44 Paying a batch without reordering it

A fold's distillation is a loop over the fold's corrections, one model call each, and the loop was
serial for a reason that is still true: a claim's effect on the store depends on what is already in
it, so applying claims out of order produces a different store. What was *not* true is that the calls
have to be serial. A prompt is built from its own event and the run's output, and from nothing else.

So the interpreter gained an optional second phase:

```ts
export type Interpreter = ((context: InterpretContext) => ...) & {
  prefetch?: (contexts: readonly InterpretContext[]) => Promise<void>;
};
```

`distill()` gathers the contexts, offers them to `prefetch`, and only then applies the interpretations
in corpus order. Three properties make this safe rather than clever:

| Property | Why it holds |
|---|---|
| Order is unchanged | the apply loop iterates the same `contexts` array in the same order it was collected in |
| Prompts are unchanged | `createLlmInterpreter` builds them with the same `buildDistillPrompt` call in both phases, and a test asserts the two strings are equal |
| A caller that does not ask is untouched | `concurrency` defaults to 1, which attaches no `prefetch` at all, so every existing dispatch and every composition behaves exactly as before |

**A failed warm-up is absorbed, not reported.** The serial pass asks again, and that pass is where a
failure is counted. This is also why the warm-up does not carry the `fatal` classification: a deadline
thrown there is thrown again by the serial pass one iteration later, which is the pass that can stop
the run.

**`fatal` closes a hole that predates this iteration.** `distill()` counted every interpreter error as
`failed` and continued, which is right for one unparseable reply and wrong for a spent budget. A fold
that ran out of calls in the middle of distillation wrote a store built from part of its corrections
and reported `full` on it. The host now supplies the test — `fatal: stoppedRun` — so that
`MG_E_BUDGET_EXCEEDED`, `MG_E_PROVIDER_FAILED` and `MG_E_DEADLINE` stop the batch and everything else
is counted.

**The client's timeout is part of the measurement, not plumbing.** `25s + 140ms/token` capped at 300s,
a timeout retried once rather than four times, `Retry-After` honoured on 429, and a deadline checked
before every attempt. The number that motivated all of it is a division: 24 corrections, about 2.5
attempts each, 60 seconds per attempt, 43 minutes — the measured learning half of a fold whose
evaluation half took two.

**The gate, and why its threshold is 10%.** `V32-fold-learning-intact` fails a run in which more than
10% of the learning questions went unanswered or more than 10% of the corrections failed to distil.
Ten is not a statistical threshold; it is the point beyond which the store can no longer be described
as "distilled from this fold's corrections". The gate does not claim a run at 9% is sound — it claims
that at 10% the treatment has changed identity, which is the point at which a number stops being
comparable to the one beside it in a table.

### 17.45 A slot's referent is a role the question fills, and the wall is the column

R10's census refused a construction without spending a call and named the successor in one sentence:
bind against the **target question's** links rather than against a spelling. `linkSchema` already
computes those links for the schema-pruning lane, so the referent of a slot is available before the
prompt is written.

**`packages/eval/src/link-bind.ts`**, three decisions and one refusal surface.

| Decision | Alternative rejected | Why |
|---|---|---|
| A table slot's referent is the table the question *names* | any linked table, including join neighbours | `linkSchema` adds key-neighbour tables so a pruned prompt can express the join; those are consequences of the question, not things it names, and binding a rule to one is binding it to a table nobody asked about |
| A name match outranks a link | link first, always | a target that spells the table the way the rule does has already said what the referent is; the link is for the case spelling cannot answer |
| A column slot binds only inside the table its template reached | search the whole linked schema | the column is what the rule is *about*; a column of the right name in a table the rule is not about is a different claim |
| A column must agree in **kind** (`PRAGMA`'s declared affinity) | name overlap alone | `price` is TEXT at home and REAL elsewhere, and a rule about casting it holds for one and not the other. An undeclared type agrees with everything: an absence of information is not a disagreement |

**Every refusal carries a reason** — `no-table`, `table-tie`, `no-column`, `column-kind` — because
"62% withheld" says the construction is partial and "60% of those are a column the target does not
have" says which half of the idea to change. `TemplateOutcome` therefore grew an optional `reason`,
and `templateCoverage` a `reasons` breakdown; the field is optional so R10's record, taken before it
existed, still reads as what it was (`unstated`).

**The census, for zero calls.** The attempt unit changes with the construction: a link is a property
of a *question*, so a rule is attempted once per foreign question rather than once per foreign
database — 82,137 attempts against R10's 2,590, from the same 289 rules and the 350 scored questions.

| Reading | R10 (name) | R11 (link) |
|---|---|---|
| rules bound somewhere | 10 — 3.9% | **57 — 22.0%** |
| rules withheld | 173 — 66.8% | **126 — 48.6%** |
| attempts withheld | 1,796 / 2,590 — 69.3% | **51,159 / 82,137 — 62.3%** |

62.3% against the 60% kill condition fixed before the code: **refused, no dispatch, no verdict**. The
breakdown is the deliverable — `no-column` 60.0%, `no-table` 23.7%, `table-tie` 14.7%,
`column-kind` 1.6% — and it corrects the explanation R10 offered. The type check is not the wall
(1.6%); the vocabulary is. Questions name tables, so a table slot has a referent to inherit; a column
slot has none, because the column is the knowledge rather than its address. That is why the two
constructions fail the same way, and why the conclusion is a property of the mechanism rather than of
a binder: **a rule's value is bounded by its own database**, measured three times (R9, R10, R11) and
now with a reason.

**The artefact's size was a defect of the same kind.** `per_case.arm_keys` stored each arm's canonical
result set, and one `card_games` question returns 12 MB of rows: 37.9 MB of a 38 MB evidence file, for
a field every consumer reads as an equality test. It is now `arm_result_digests` — 128 bits of
SHA-256 — because the only question anything asks of it is whether two arms produced the same answer.
`union.ts` records the contract: a caller may pass keys or digests, and nothing in the module
distinguishes them. The committed dev artefact is left as it ran; an evidence file is not rewritten
to make a later repository smaller.

### 17.46 The instrument that asks the store to prove itself

Twelve iterations varied what is stored, how much, where it is injected and how it is retrieved, and
every one of them compared a pack against no pack on questions the store had never seen. That design
can say "the pack changes the score" and cannot say "the pack is any good": a store of nonsense would
have received the same treatment. `rule-probe.ts` existed for that question and had never run on BIRD
— `rule_probe` is `null` in both committed artefacts — which is the gap this iteration closes.

**The design.** Each corrected learning question is re-asked twice: once with a blank retry (the
failure statement, no rules) and once with the rules that correction produced. Two calls per case,
learning rows only, so the probe cannot see the questions whose packs it filters.

|  | retry alone right | retry alone wrong |
|---|---|---|
| **with the rules right** | `redundant` — a retry was enough | `supplied` — the rules did the work |
| **with the rules wrong** | `broke` — a case that needed no help was destroyed | `useless` — neither attempt reached the correction |

Three decisions, each visible in the artefact:

1. **The blank call is not optional.** Retries alone repair some failures — measured at +0.57 to
   +1.14pp on three earlier runs — so a `supplied` count without its control would credit the rules
   with what a second attempt does for free. `blank_fix_rate` is that control.
2. **A hole is not a verdict.** A call that never returned resolves both halves of the pair to
   `undefined` and the trial to no verdict, so a provider hiccup never becomes evidence.
3. **Admission is a filter on evidence, not on plausibility.** A rule is kept only when at least one
   of its own cases reproduced with it and none broke: one demonstration and one counter-demonstration
   is not a rule the project can defend on the average of the two.

**The reading** (BIRD Mini-Dev, k=5, 350 questions, 1,445 calls, 312 of them the probe):

| Reading | Value |
|---|---|
| corrected cases | 156, all measured |
| `supplied` / `redundant` / `broke` / `useless` | **19 / 31 / 3 / 103** — 12.2 / 19.9 / 1.9 / 66.0% |
| blank-retry repair rate | 21.8% (the free ceiling `supplied` is measured against) |
| admission | **38 kept**, 252 unsupported, 6 broke their source, 0 unprobed — 296/296 reconciled |
| the verified arm | **54.00% vs 54.00%** — `0.00pp`, p = 1.00, 0.39 rules per question |

**Two predictions failed and they are the finding.** The pre-registration fixed `supplied` ≥ 20% and
`kept` ≥ 25%; the run measured 12.2% and 12.8%. `broke` ≤ 15% and a blank-retry rate in [20%, 60%]
both held at 1.9% and 21.8%. Two thirds of corrections cannot be reproduced even with the failure and
its own rules in the prompt, so the deficit is in the **extraction** rather than in retrieval,
injection point, budget or schema boundary — which is where the last four iterations looked.

**Why the admitted store proves nothing yet.** It moved 342 of 350 prompts and no accuracy. The 130
questions that actually received a rule scored 56 against the baseline's 57 (−0.77pp at n = 130); the
220 that received none differed by one question the other way, on *identical prompts*, because the
client samples at temperature 0.7 and pairs arms by question rather than by seed. That is the noise
floor of every arm comparison on this split — 36 of 220 identical prompts produced a different
statement — and it is now a number rather than an assumption.

**A defect the dry run caught before it cost anything.** The artefact's `probe.rules` was
`summary.rules`, the number of rule *citations* the trials carry, while the four admission buckets
partition *items*; one correction can distil two rules and one rule can be cited by two corrections,
so the two counts diverge in both directions and `V13` — a blocking gate — could only pass in a store
where no rule is cited twice. `rules` is now the store the probe was given and `citations` keeps the
other reading, with a unit test pinning the distinction. The arm had never run, so no dispatch had
ever been failed by it.

**What the next stage is, given this.** Not another arm variant. The one claim the design still
supports unmeasured is *in-database* transfer: whether an admitted rule repairs a **different**
question in the **same** database. The probe already carries that ledger (`transfer`), it was disabled
on this dispatch because cross-database transfer closed in R11 and this run asked one question, and it
costs four calls per admitted rule — 152 calls for the 38 survivors.

### 17.47 The control that was missing on both sides of a paired trial

**The measurement.** §17.46 left one claim unmeasured: whether an admitted rule repairs a *different*
question in the *same* database. The instrument existed in `rule-probe.ts` (`TransferTrial`,
`transferSummary`, `transferTargets`, `transferringItemIds`) and had never been dispatched, because
every run before had either no admitted store or one question to ask. R13 asked it: `prereg/R13-admitted-transfer.md`,
`SOTA_ARMS=full-verified,full-transferred`, `SOTA_TRANSFER_TARGETS=8`, `SOTA_LEARN_SAMPLE=128`, 350
questions, 5 folds, 2,679 calls, dispatch `41157635856`, artefact
`eval/results/poc-sota-bird-transfer.json`.

**Defect 1 — a hole on the control side became a denominator.** `TransferTrial.blankCorrect` was a
`boolean`, so a blank call that never returned was recorded as "the retry alone was wrong". That is
exactly the informative set: a rule that then repaired the target was credited with a repair nobody
measured, in the one direction this statistic must not be able to move. The field is
`boolean | undefined`, `transferSummary` requires both halves to have returned, and
`transferringItemIds` needs an explicit `false` before it calls anything a repair. `unmeasuredBlank`
says how many of the holes are on the control side, and `V15-transfer-reconciles` prints it. The
trial count reconciles either way — which is precisely why the old reading was invisible.

**Defect 2 — the ledger never reached the file.** The pairs were written into the fold record, and
`report.ts` serialises a fixed projection of a fold that does not include it: the run published a rate
with no rows behind it. `transferLedgerOf(folds)` is now the projection, it is applied where the
artefact reads (`metrics.rule_transfer.ledger`, one `[rule, target, blank, withRule]` row per trial),
and **`V33-transfer-ledger` is blocking**: a run whose file carries the summary and not the pairs fails
rather than publishing. A field nobody checks is a field that can be absent.

**Sample sizing, decided before the run.** Transfer draws targets from the corrected cases of the
rule's own database *within its own fold*, because both halves of a pair must be learn rows. At 64
learn rows per fold that pool is ~31 corrections over 11 databases — 2.8 per database — and 38
admitted rules cannot reach the 100 informative trials the resolvability floor asks for. `learn_sample`
128 doubles it; `transfer_targets` 8 replaces the four that were sized for a 294-rule store. Both are
dispatch properties and both are recorded in the artefact's `config`.

| Reading | Value |
|---|---|
| own-case probe | 296 corrected cases; `supplied` 59 (19.9%), `redundant` 40, `broke` 7, `useless` 190; blank-fix 15.9% |
| admission | 118 kept of 576 (20.5%), 444 unsupported, 14 broke their source, 0 unprobed — `V13` 576/576 |
| transfer | 98 rules pointed (20 had no home database), 523 trials, 467 informative, **34 repaired (7.3%)** |
| damage | 56 targets needed nothing, **28 broken (50.0%)** |
| net | **+1.15pp** over 523 measured trials — six trials |
| both gates | 30 rules with a repair, 10 injected items over 350 questions (0.03/question) |
| arms | none 53.71%, full 49.14% (−4.57pp, p=0.0070), full-verified 54.86% (+1.14pp, p=0.34), full-transferred 53.71% (0.00pp) |

**Two predictions failed, and they define the next stage.** `rate` ≤ 6% predicted, 7.3% measured; "at
most four rules repair anything" predicted, thirty did. So single-correction distillation does produce
knowledge that generalises, rarely. What it also produces is damage at the same order of magnitude:
half of the targets that needed nothing came back wrong once a rule was in the prompt. The prerun's
two-sided refutation (≥15% → more data; ≤1% → new substrate) did not fire; the middle outcome is the
finding, and it is the one the risk model did not name.

**Why the next iteration changes the substrate rather than the store size.** Repairs per question is
`0.42 admitted rules × 7.3% ≈ 0.03`, and the measured arm at that density moved +1.14pp, half the
arithmetic estimate, same sign. A resolvable three-point cell needs two to four times the store and
brings the break side with it. The extraction is therefore not underfed — it is the wrong shape: a
sentence about a correction loses the query pair that made the correction mechanical. R14 renders the
pair (question, failed query, corrected query, failure) and submits it to the same probe, with the
same admission rule, so that the successor is judged by the instrument that produced this reading.

**Cost.** 2,679 calls, 20 minutes, 1 retry, 0 timeouts, 0 call failures; the probe is 592 of those
calls and the transfer 523. Every gate passes, including the two blocking ones this iteration touched.

### 17.48 The comparison the substrate question needed, and the arm it does not move

**The question §17.47 left.** R13 closed with a claim about a substrate and one sentence of evidence for
it. The `repair` distiller — three sentences comparing the failed attempt with the correction — had
been measured only as a whole pack (−5.14pp p = 0.0021, −4.86pp p = 0.0137, −5.71pp p = 0.0012), never
as a store asked to reproduce its own corrections. A reproduction rate and an accuracy delta cannot be
compared, so "the form is wrong" and "the delivery is wrong" were indistinguishable. Pre-registration:
`prereg/R14-substrate-pair.md`, written before the dispatch; outcomes recorded in the same file.

**The instrument.** `probe-pair.ts`, a pure function of two trial lists:

1. `compareSubstrates` pairs the two probes on the source questions **both** stores covered and runs
   `comparePaired` (McNemar exact + bootstrap interval) over the discordant pairs. The exclusive
   questions on each side and the holes are counted separately, never folded into the 2×2.
2. `reproducedBy` is the one place a verdict becomes a boolean — `supplied` and `redundant` are "came
   back", `broke` and `useless` are not, a hole stays a hole — and it is a `Record` over the verdict
   union so a verdict added later is a compile error rather than a silent omission.
3. `poolSubstrates` adds the folds and recomputes the rates from the summed cells. A mean of per-fold
   rates would give a 59-question fold the same weight as a 65-question one; more importantly, the
   stratified sum is what lets four folds of ±60 pair into a 303-question reading.
4. `SUBSTRATE_FLOOR` = 100 paired questions keeps a smaller result a direction.

**One control, shared.** `probeMemory` now takes the blank verdicts already measured and writes back
the ones it paid for. The blank prompt is built from the question, the attempt and the observed failure
— none of which depend on the store — so re-asking it would only re-sample the endpoint, and 16.4% of
questions return a different query under the same prompt. A hole is carried as a hole rather than
re-asked, because a control that returned on the second attempt is not the control the first substrate
was scored against.

**The second arm.** `full-repair-verified` runs the repair store under R12's admission rule unchanged.
V37 reconciles its four buckets against the store it was given, V38 asks whether its gate changed any
held-out pack, V34 makes the cells, both rates and the delta reconcile, V35 keeps a small paired set a
direction, and V36 makes the size of the exclusion a reading. `probeArtefact` is one projection used by
both substrates, so the two blocks cannot drift in a field name or a denominator.

**The reading.** Dispatch `41165067200`, artefact `eval/results/poc-sota-bird-substrate.json`: 350
questions, 5 folds, 2,490 calls, 1 retry, 0 timeouts, 0 call failures, every gate pass.

| | rule | repair |
|---|---|---|
| store items | 590 | 303 |
| reproduced its own correction | **30.69%** (93/303) | **53.80%** (163/303) |
| `supplied` / `redundant` / `broke` / `useless` | 59 / 34 / 11 / 199 | 128 / 35 / 10 / 130 |
| admitted (kept / unsupported / broke its source) | 118 / 450 / 22 | 128 / 165 / 10 |
| items without `scope.domain` | 96 (16.3%) | 32 (10.6%) |
| injected after the gate | 127 items | 109 items |
| arm accuracy | `full-verified` 54.29% (+1.14pp) | `full-repair-verified` 52.86% (−0.29pp) |

Paired: 303 shared, 0 holes, 0 exclusive; both 83, only-rule 10, only-repair 80, neither 130;
**+23.10pp, p = 1.05e-14**, verdict `right`. Per fold: +23.08, +22.95, +22.03, +28.81, +18.64pp, each
p < 0.01.

**Two facts that must be quoted together.** The pair reproduces nearly twice as much of what it was
learned from, and the arm built from it answers one question of 350 differently. The first confirms
R13's hypothesis at the resolution R13 stated it; the second says the hypothesis was not the binding
constraint. Since §3.6.13's 12–20% store, the procedure store and now the 54% store are all inert within
±3pp, the extraction is the one explanation three iterations of evidence have eliminated — which is what
moves R15 to the repair substrate's *transfer* rather than to a fourth content form.

**Cost.** 2,490 calls, 22 minutes, 1 retry, 0 timeouts. The generation cache records 162 misses
against 1,118 hits, because both stores per fold are learned from the same generations — the second
construction pays local store writes and one distillation, not another 128 calls. The probe is 909
calls for two substrates — 303 controls paid once, then 303 treatments each — against 592 for a single
substrate: the shared control is what makes the second substrate cost one call per case rather than
two, and it keeps the endpoint's own re-sampling out of the difference.

### 17.49 The second substrate's transfer, and the two gates that had to be wrong first

**The question §17.48 left.** R14 separated reproduction from the product and, in doing so, named the
measurement that decides it: R13 put the sentence at 7.28% repair against 50% damage, and no one had
ever pointed the account at a foreign question. A store that reproduces half of what it was learned
from is either knowledge or a longer lookup table, and the only instrument that distinguishes them is
the one that produced 7.28%. Pre-registration: `prereg/R15-repair-transfer.md`, written before the
dispatch; outcome recorded in the same file.

**One function, four ids.** `transferGates` in `sota.ts` is the four checks every transfer measurement
is held to — reconcile the 2×2, resolve above the floor, carry one ledger row per trial, reconcile the
net effect with its own counts — written once and applied twice. The repair substrate exists only to be
compared with the rule one, so a second substrate measured by a lighter rule would produce a number
that cannot be set beside the first. The gate ids are arguments (`V15/V16/V17/V33` and
`V39/V40/V41/V42`), which is what stops a refactor of the shared body from renaming the four that were
already published.

**One projection, two readers.** `transferArtefact` returns a typed `TransferProjection` and
`transferGateInput` translates it for the gates, so the file and the validity gates read the same
totals rather than each recomputing them. The block it replaced was 107 lines of inline `reduce`s in
two places — exactly the shape in which a published rate and the gate meant to pin it can disagree.

**Both consuming arms buy their own probe.** `full-transferred` consumed `probe.transfer` while only
`full-verified` paid for the probe, and `full-repair-transferred` consumed `probeRepair.transfer` while
only `full-repair-verified` bought it. A dispatch naming only the transfer arm would have injected the
transferred set of a probe that never ran: an empty pack, `none` under a second name, reported as a
reading. `wantsRuleProbe` and `wantsRepairProbe` are now derived from the arms that read them, and the
gate measurement itself (does the admission rule change a held-out pack?) runs whenever the probe ran,
independently of whether an arm asked for the injection.

**The reading.** Dispatch `41175676367`, artefact `eval/results/poc-sota-bird-transfer-repair.json`:
350 questions, 5 folds, 3,298 calls, 1 retry, 0 timeouts, 0 call failures, every gate pass.

| | sentence | pair |
|---|---|---|
| store items | 580 | 296 |
| reproduced its own corrections | 29.73% (296) | **47.97%** (296) |
| admitted by its own gate | 100 | 102 |
| items with a home database | 78 | 78 |
| trials / informative | 416 / 366 | 416 / 354 |
| repaired | 23 (6.28%) | 22 (6.21%) |
| broke a working target | 30 | 32 |
| `break_rate` | 0.600 | 0.516 |
| `net_pp` | −1.68 | −2.40 |
| verdict | `no-transfer` | `no-transfer` |
| pack after both gates | 10 of 622 | 19 of 350 |

Substrate pair, same run: 296 shared, 0 holes, 0 exclusive; both 80, only-rule 8, only-repair 62,
neither 146; **+18.24pp, p = 1.83e-11**. Arms: `none` 53.71%, `full` 51.71% (−2.00pp, p = 0.3105,
1.78 items), `full-transferred` 54.00% (0.03 items), `full-repair-transferred` 53.71% (0.05 items).

**What the tie says.** 0.07pp on 720 informative trials is smaller than the standard error of either
rate. An 18pp advantage in reproduction buys nothing in transfer, so the two properties are separate in
both directions: the extraction is not the constraint on reproduction (R14), and reproduction is not a
proxy for the product (here). Two things do survive — the pair's break rate is lower in both dispatches
that measured it (0.516 against 0.600; 0.304 against 0.509), and both nets are negative in this run, so
the effect that remains to explain is the delivery's.

**The two defects the first dispatch found.** `41169086124` measured every fold and refused its own
artefact, twice, neither time on a number:

1. **V17 compared a publication against a computation.** Routing the gate through the projection gave
   it `net_pp` at the two decimals the file carries; the gate demanded equality to 1e-9 of
   `(repaired − broke) / measured`. `(29 − 27) / 483 = 0.4141...` published as `0.41` therefore failed,
   and only a ratio that terminates at two decimals could pass. The tolerance is now half the published
   step, the criterion says so, and a test pins both sides — the rounding passes, a figure off by more
   than one step still fails.
2. **V14 and V38 measured an arm rather than a gate.** The pack comparison lived inside
   `if (ARMS.has('full-verified'))`, so a dispatch that bought the probe for the transfer measurement
   answered "0 of 350 questions changed" — which reads as "the gate admitted nothing", the one reading
   the pre-registration says invalidates the run. The comparison now runs whenever the probe ran; only
   the model call is conditional on the arm.

Both are the class of defect this project keeps finding: instrument state that is correct in the case
it was written for and silently empty in the case that was added later.

**Cost.** 3,298 calls, 20 minutes, 1 retry, 0 timeouts, against 2,679 for R13's single-substrate
transfer and 2,490 for R14's two-substrate probe. The second substrate's transfer is 416 trials — one
blank per target reused across items, one treatment per pair — and the shared control is the same
mechanism §17.48 introduced for the own-case probe.

### 17.57 The scope field the model is forbidden to guess now has an owner

**The contradiction.** The distillation prompt carries two sentences that point in opposite directions.
The event payload is rendered whole, and `learn` writes `input: { question, domain: db_id, schemaDigest:
db_id }` — so the database is in front of the model on every call. The instruction list then says *"Omit
scope keys the event does not establish. Never guess a domain."* A model that follows the instruction
omits `scope.domain` on every claim it returns, because the only way it could fill the field is by copying
the payload, and the instruction can be read as forbidding exactly that.

**What that cost, measured four times.** `V44-domain-accounted` reported `184/184`, `168/168`, `156/156`
and `168/168` — items with no domain, every one of them *arrived* unscoped, `0 widened` in all four
dispatches. The counter that exists to split the two causes (`DistillReport.incomingWithoutDomain`) never
had anything to split: the door was the only path, for four runs.

**Two mechanisms were inert because of it, and neither was the one the gate was watching.**

1. **Widening cannot fire.** `canGeneralize` widens a claim scoped to one domain onto a scope that covers
   two, and it requires the endorsing evidence to come from *distinct* domains. With no domain on any
   item, there is nothing to widen away and no second domain to endorse — so `generalized` was zero by
   construction, not by policy.
2. **Domain-conditioned recall could not condition anything.** `scopeMatches` treats a filter on `domain`
   as a restriction only when the item has one: an item with `scope.domain === undefined` passes every
   domain filter. The `full-validated` arm re-reads the store with `{ scope: { domain: row.db_id } }` and
   counts how many packs that pruned, and the wrong-scope control rotates to the *next* database. On a
   store with no domains both are the same query as `full`, which is the definition of an arm that is one
   condition under two names.

**The repair.** `LlmInterpreterOptions.domainOf` is the second host-supplied scope field, after
`reasonCodeOf`, and it has the opposite precedence on purpose. The reason code is a fallback: the model saw
the failure, so its own code wins and the host's classifier fills a gap. The domain is not: the host wrote
it into the payload, so any other value the model returns is a guess, and the instruction that bans guesses
is the one being obeyed. The host's string therefore overrides whatever the model wrote.

**Re-keyed, not patched.** `parseDistillResponse` computes `dedupeKey` before either host field exists, and
identity includes `scopeKey` — which contains the domain. Filling the scope without re-keying would leave
every claim carrying a key that names a different scope than the claim has, and the first thing the
distiller does with that key is `pool.find((item) => dedupeKeyOf(item) === key)`: two databases' copies of
one rule would merge into a single item on whichever scope arrived first, which is the precise opposite of
the state that lets a claim widen later. `createLlmInterpreter` recomputes the key from the finished scope.

**Why it ships off.** `SOTA_DOMAIN_SCOPE` defaults to `false`, and it has to: a scoped item *is* a
different item, so the store every published number was measured on changes shape — eleven databases'
copies of one rule become eleven claims rather than one — the moment it is on. The switch exists so that an
arm measures the difference. What `V44` will report with it on is the reading the gate was built for: a
`storedWithoutDomain` near zero and, for the first time, a non-zero `widenedIn`.

**Tests.** Five: the field is filled when the model omits it; a guessed domain is overridden; an absent
host domain leaves the scope byte-identical; two databases produce two distinct `dedupeKey`s from the same
statement (the re-key, which is the failure that would otherwise be silent); and both host fields compose
into one scope without either dropping the other.

### 17.58 The judging phase could stop the lane for two hours, and said nothing

**The incident.** `41226847922`, the first dev-split dispatch of R24, ran the registered design and published
nothing. Its last progress line was at 19:17:48 — `fold 3/5 eval 1228/1228` — and the next line in the log is
the step's own timeout at 21:15:44. No artefact, no partial record, no number, 3.4 hours of wall clock and
roughly 4,100 model calls.

**Where the time went, from the log alone.** Folds are phases, and the log separates them: a fold's *learning*
pass prints every sixteen questions, its *distillation* pass every four replies, and its *evaluation* pass every
twenty calls. All three were healthy. The fold-completion line is the only line after them, and the gaps
between "eval finished" and "fold finished" are the whole story:

| fold | evaluation ended | fold line printed | gap |
|---|---|---|---|
| 1 | 18:00:53 | 18:06:39 | 5.8 min |
| 2 | 18:10:47 | 19:14:01 | **63.2 min** |
| 3 | 19:17:48 | never | **118+ min, to the step timeout** |

The gap is the judging phase: for every plan, execute the SQL the model wrote and compare the result to gold.
It takes 5.8 minutes when the statements behave, and it has no progress line, so there is nothing between
"evaluation finished" and the fold line to say whether it is working.

**Why it can take two hours.** `DatabaseSync.prepare(sql).all()` is synchronous. A statement that is slow to
answer — a three-way cross join over two thousand rows is a billion-row nested loop, which is the easiest
mistake for a model to make — blocks the process *inside a native call*. No timer fires, no callback runs, and
every deadline the lane owns is checked between model calls, so the lane's own 130-minute wall clock could not
end it either. The run did not hang because it was waiting: it hung because it was computing, and the only
interruption available for a synchronous call is the death of the thread running it.

**Two candidate mechanisms, measured rather than assumed.** A worker thread is the obvious container, and it is
the wrong one:

| mechanism | kill latency | spawn cost |
|---|---|---|
| worker thread, stuck inside the driver | **50.5 s** | ~10 ms |
| child process, `SIGKILL` | **0 ms** | 19 ms |

V8 can only honour `terminate()` when the native call returns, so a one-second deadline still costs a minute of
wall clock per pathological statement — and a fold has a thousand of them. A child process is killed
immediately, and spawning one is 19 ms, which is cheaper than the difference between the two designs. So every
statement runs in a child, in `packages/eval/src/sql-guard.ts`, with three properties:

1. **A deadline** (20 s, `SOTA_SQL_DEADLINE_MS`). The child is `SIGKILL`ed when it expires and the statement is
   reported as `deadline: true`, which is *not* a wrong answer: a query that cannot answer in twenty seconds on
   a laptop-sized database tells us nothing about the model's knowledge, and counting it as an error would
   silently turn an instrument defect into an accuracy number.
2. **A row cap** (10,000, `SOTA_SQL_ROW_CAP`). The statement is wrapped as `SELECT * FROM (…) LIMIT cap + 1`, so
   a runaway result set cannot exhaust memory on its way to being discarded; the extra row is what
   distinguishes "exactly at the cap" from "over it", and truncation is reported.
3. **A replacement.** A killed child holds no state that outlives one statement, so the slot is respawned for
   the next caller. The pool is a queue of slots, not a pool of connections.

**One execution path, not two.** The lane previously had two ways to describe a result — `executeQuery` in the
package and a private `execute` in the lane — and a guarded path would have made three. `outcomeOf(rows)` and
`unexecuted(error)` now build the encodings in the package, and both the synchronous path and the guarded one
call them, so gold and prediction are compared through identical code.

**`V48-statements-answered`.** A blocking gate: at least 99% of executed statements must answer inside the
deadline, and the artefact carries `statements: { statements, deadlines, truncations, deadline_ms, row_cap }`.
The bar is one percent because a pathological statement appears once or twice in a panel of a thousand; above
that share it is a systematic property of the lane — a database it cannot query, or a deadline set below the
machine's speed — and the number underneath is not the model's. Zero statements fails too: `0/0` read as a
share would pass every run that never reached judging.

**The judging phase now prints.** Every two hundred plans, with the deadline count. A phase that prints nothing
is a phase whose silence is indistinguishable from a hang — which is the general form of this defect, and the
second time this project has paid for it.

**Tests.** Eleven for the guard: rows returned, trailing semicolon accepted and two statements refused, an empty
statement refused without paying for a spawn, a statement that does not prepare reported as an error rather than
a deadline, the cap applied and reported, a result exactly at the cap *not* reported as truncated, a pathological
statement killed inside the deadline with the pool still working afterwards, more statements than the pool's
width served through the queue, a replacement handed to a waiter after a kill, a statement whose process dies
before answering, and refusal after close. Four for the gate: absent, pass, fail on a rate, and fail on zero.

### 17.59 A restriction recomputed inside a dispatch is a measurement; the same restriction in a new dispatch is a different object

**The problem R24 created for itself.** Its registered predictions were falsifiable in two directions and both
directions fired at once: the dev interval `[15.38, 19.82]` excludes R23's 24.86pp, *and* the registered
reading of that exclusion — "minidev inflates the effect by dropping the simple third" — is refuted by the
same artefact. Two hypotheses died on one table, which leaves a question the registration did not ask: was the
difference between 24.86 and 17.60 an **error** (a small panel overstating an effect) or a **population** (two
panels describing different questions)?

**Why a second dispatch cannot answer it.** The obvious design — run the 2×2 again on moderate-and-challenging
questions only — would be a *different object*, not a re-measurement. The store is rebuilt by a live
distillation pass on every dispatch, so the anchors move between runs (`none` 54.00 → 54.57 → 57.63 across
three, `full` 51.43 → 49.71), and the per-fold spread within a single dispatch is already 14.98 to 21.50pp.
Comparing a new restricted run against the old whole-split run would confound the population with one to two
points of store variance — the exact error this record made twice in R21 and R22 and named there.

**What is admissible is a restriction of the same dispatch.** Every plan already carries its question's
difficulty, the paired test is paired by question, and the bootstrap resamples discordant pairs. Restricting
*both* sides of a paired comparison to a subset of questions therefore preserves the estimator, the pairing and
the store: it is the same 609 questions judged by the same five stores, with the same statements executed. The
restricted estimate is a **decomposition of a measured quantity**, not a new claim, and it is labelled as
descriptive: the confirmatory p-values belong to the registered whole-split contrast, and the subset intervals
are reported to say how much of the gap is composition.

| restriction | n | effect | 95% CI |
|---|---|---|---|
| whole split | 1,534 | **+17.60pp** | [15.38, 19.82] |
| `simple` | 925 | +14.05pp | [11.24, 16.86] |
| `moderate` | 464 | +22.63pp | [18.32, 27.16] |
| `challenging` | 145 | +24.14pp | [15.86, 32.41] |
| moderate + challenging | **609** | **+22.99pp** | [19.21, 26.77] |
| minidev (R23, different dispatch) | 350 | 24.86pp | [19.71, 30.00] |

The restricted interval contains 24.86 and the whole-split one does not, from **one** set of 1,534 plans. The
difference is therefore arithmetic rather than inferential: the whole split adds 925 questions worth 14.05pp to
609 worth 22.99pp, and the two shares reproduce the measured effect exactly —
`925/1534 × 14.05 + 609/1534 × 22.99 = 8.47 + 9.13 = 17.60`.

**The step-size rule, and where it stops.** Two adjacent levels are reported as *resolved* only when the
difference of their effects exceeds its own combined standard error; otherwise the gradient is reported as
monotone with an open top. `simple → moderate` is **+8.58pp ± 5.24**, resolved. `moderate → challenging` is
**+1.51pp ± 9.38**, not resolved at 145 questions — so the shape is three ordered points, not a fit, and the
record does not claim the hardest third is harder than the middle one for the hint.

**What this costs and what it buys.** The cost is one dispatch. The benefit is that a line which had been
quoting a 350-question number against whole-split competitors now carries both numbers with their populations
attached, and can say which one is admissible for which comparison. **17.60 is what a cross-system comparison
must use; 22.99 is what a moderate-and-challenging claim may use; 24.86 stands as R23's estimate on its own
population and is not evidence of anything else.**

### 17.60 An artefact's name is an address, and two designs wrote to the same one

**The defect, found by a gate rather than by a reader.** R24's dispatch wrote its result to
`eval/results/poc-sota-bird-dev.json`, which was the correct path under the rule the lane had: the file was
named after the *split*, and there was one design per split. R24 is the second design on `dev` — R8.3b measured
the reproduction cell there in iteration 128 — so the write replaced the artefact that `eval:protocol`
recomputes the `reproduced` row from. Nothing failed. What landed is a valid artefact of the same lane over the
same 1,534 questions, differing only in the store it rebuilt and therefore in `none` (57.63 → 57.43). The
displacement surfaced in `pnpm check` as the cell arithmetic no longer matching the recorded comparison.

**Why a warning is the wrong fix.** The failure mode is silent by construction: every artefact is valid, every
schema check passes, and the only reader that notices is the one that re-derives a published number instead of
quoting it. A guard that refused the write would make the next dispatch red for having done the ordinary thing —
running a new design on the split everyone else used — and the operator's way out would be a flag that disables
the guard. So the rule moves the address instead.

**The rule.** `artefactWriteIdOf(split, prereg)` in `packages/eval/src/artefacts.ts`:

| run | file |
|---|---|
| no pre-registration (by hand) | `poc-sota-bird-dev.json` — unchanged |
| `SOTA_PREREG=R8.3b-dev-split` | `poc-sota-bird-dev-R8.3b-dev-split.json` |
| the same pre-registration again | the same file — one design, one measurement |
| `SOTA_PREREG=R24-dev-split` | `poc-sota-bird-dev-R24-dev-split.json` |

Three properties are load-bearing. The suffix is the pre-registration's **own id**, not a slug derived from it,
so the workflow can spell the name in one expression without re-implementing the rule — and the expression lives
at workflow level in `sota.yml`, where both the write path and every upload path read it. The id is **compared
after normalisation** (`prereg/R24-dev-split.md` → `R24-dev-split`), because `SOTA_PREREG` arrives as an id and
is recorded as a path; a rule comparing raw strings would suffix every name and no re-dispatch would ever hit
its own file. And an id that contains a separator or a `..` is **refused**, because a name that climbs out of the
results directory is a run writing its evidence where no reader and no gate looks — the general form of the
defect this section is about.

**Where the logic lives.** In `artefacts.ts` rather than in the lane, for the same reason the split id lives
there: the lane is a CLI entry point excluded from coverage, and a naming rule that decides whether evidence
survives should not be the one piece of logic no test can reach. Five tests cover it — the named file, one design
one file across two spellings, a hand-run left alone, two path-shaped ids refused, and the id read out of a
recorded path.

**What was restored, and what is claimed.** R8.3b's artefact is back byte-for-byte at the canonical path, and
its cell row is unchanged (`reproduced` at +4.11pp). R24's artefact is committed beside it under the derived
name, and the pre-registration's Outcome says why. The numbers in neither file moved: the defect was in the
address, not the measurement.

### 17.61 A threshold fitted on the questions it decides for is a result wearing the name of a rule

**What R25 needed and what the store could supply.** The pre-registration asks whether a decision made per
question beats an order that is the same for every question, and every previous attempt at that question
used *per-item* counterfactual credit: R12's probe, `full-verified`, `full-cleared`, `full-transferred`. All
four read "did this item help on the learning rows it was injected into". R21 measured the supply: 77% of a
store distilled from 280 corrections has no counterfactual record at all, and the whole learning pass prices
about a hundred decisive rows out of 1,400. An admission rule fitted on that signal would fire almost never,
and an arm that fires almost never is `full-one` under a second name — the failure mode this record has
published as a null result before.

**So the statistic is the one that is dense.** `dose.ts` fits a floor on the note's *coverage of the
question* — the share of the question's content terms the note it would receive mentions — against the
counterfactual verdict that row produced during the learning pass. Coverage is defined for every row, so the
fit has 1,400 observations rather than 100, and it is the same number for a learning row and a held-out
question because both are computed from the item the row actually received.

**The three rules the fit obeys, and why each is one.**

| rule | what it stops |
|---|---|
| maximise `helped − harmed` among rows at or above the floor | the objective is the one the arm is claimed to improve; a floor chosen for any other reason is a second hypothesis |
| keep at least half the population | the net is maximised by keeping the single rescued question, which is a policy that admits nothing and reports a perfect record |
| return the lowest floor among ties, and only a coverage that occurred | equal nets are equal evidence, and an interpolated threshold has an effect on the population nobody computed |

**The defect its own tests caught.** The first version computed the minimum keep as
`Math.ceil(Math.max(1, minKept) * total)` — which reads as "at least one question" and means "at least all of
them". Every fit therefore returned the lowest floor, the admission arm would have been exactly `full-one`,
and the dispatch would have reported a null about a treatment that never happened. Three of the module's own
tests failed on the first run, which is the only reason it was found before a dispatch rather than after one.
The parsing path was then given a validator that refuses a share outside (0, 1] instead of clamping silently,
because a clamped setting is a policy nobody wrote.

**Order is part of the claim.** The floor is fitted per fold, on `learnRows`, before any held-out question is
scored. A floor fitted afterwards on the same questions that produced the number would be a threshold chosen
by its own result — the defect this record has refused pre-dispatch three times (R10, R11, R21's second
version) and would be least able to see here, because the arm's whole claim is that the threshold *is* the
treatment.

### 17.62 Two controls are not a ladder

**The gap R25's registration exposed.** `arm_pairs` pairs every control arm against `full`, which is the right
default: `full` is what the lane ships, and a control that costs nothing is evidence about the mechanism rather
than about retrieval. R25 registers a contrast between two *controls* — `full-accepted` against `full-one` —
because the question is whether the admission decision beats truncation, and `full` differs from both by an
item. The artefact as it stood had no interval for that pair, and subtracting the two deltas would produce a
point estimate with no error bar: the exact move this record had to withdraw in iteration 55 and again in R21.

**`armPairBetween` is the general form, and the against-`full` pairing is its special case.** Both are paired
McNemar over the questions the two arms actually answered, with the same bootstrap, and a test asserts the two
agree on the pairs where both apply — two estimators over the same rows that disagree are a reader's problem,
not a rounding artefact.

**Computed where a reader can re-derive it.** `pnpm eval:arm-contrast --left … --right …` reads a committed
artefact and writes `eval/results/poc-arm-contrast.json`. The record's rule is that a number computed after
the run by a script outside the repository is a quotation rather than evidence, and this is the tool that keeps
the registered contrast inside. Checked against R24's artefact it reproduces the published cell exactly —
`−0.72pp [−2.15, 0.72] p = 0.3824`, 60 gained and 71 lost — which is a check of the tool and of the number it
was pointed at.

**And a parser that failed the first time it was used.** The first version scanned the argument list once per
flag and refused any token that was not the flag it was looking for, so `--left a --right b` threw on
`--right` and the tool could only ever hold one arm name. It is a small function, it failed on its first real
invocation, and the fix was to move it out of the CLI entry point into a module with eight tests — which is
where the rest of this record's decisions live for the same reason: a rule that no instrument can reach is a
rule nobody has checked.

**A missing pair is not a zero.** `armPairBetween` returns `undefined` when no question carries both arms.
A fabricated interval around no data would be the most confident possible statement about nothing, and the
tool refuses the invocation rather than writing one.

### 17.63 A channel that rewrote nothing is the control wearing the channel's name

**The defect this gate exists for has happened twice in this record and neither time was visible in the
artefact.** `values` annotates every column with the values it holds and `linked` prunes the schema to the
tables the question names; both are prompt manipulations, and both were measured once, on 350 questions, with
12/11 and 7/33 discordant pairs. A gate that reads only the arm's *name* cannot tell those two runs apart from
a run where the annotator annotated nothing — for `values` that happens when the value sampler returns no rows,
and for `linked` when the linker's own guard declines to prune. The resulting delta is a clean null about the
arm's name rather than about the channel, and it is indistinguishable, in the artefact, from a real one.

**The counts therefore travel to the gate rather than to the log.** `noteChannel` increments a per-fold,
per-arm counter at the moment the prompt is built — the DDL comparison is cheap there and impossible once the
fold is scored — and `V51-channel-applied` sums those counters across folds. A reading that only exists in a
log cannot refuse a claim; a reading that reaches `buildValidityGates` can, which is the same reason `V45`,
`V49` and `V50` were built the way they were.

**The two kinds need different floors, and the kind travels with the count.** Annotation is unconditional: if
`values` fires it fires on every question, so 95% is a lenient floor and a run below it is a different arm.
Pruning is not: a linker binds only when the question names tables, and the first pilot run measured **34.9%**
of prompts rewritten. Thresholding that share at 95% would fail every correct run, and thresholding it at a
"reasonable" 20% would encode this record's guess about how often a linker binds rather than a property of the
manipulation. The gate therefore asks a pruner only to have fired at least once in a hundred — and *prints* the
share, so 34.9% is visible to a reader instead of being compressed into a boolean.

**What it costs.** One DDL string comparison per question per channel arm, both values already computed and
cached by path. The gate adds no model call, and the pilot that validated it (350 questions, 1,759 calls) is
committed under its own name so the reading is re-derivable rather than quoted.

### 17.64 The adapter contract, and the measurement that corrected the estimate

**The problem this solves is not modularity, it is testability of a claim.** The repository asserts it is a
general flywheel. Generality is only visible from the outside: it is the property that a second scenario can use
the first scenario's measurement apparatus without rewriting it. §136 records that this never happened — τ²-bench
wrote three gates beside itself and reused none of the thirty-one. So the work is to make the reuse *possible*
and then to *measure* whether it occurs, and those are two different deliverables.

**The cut rule is a single question about a signature.** *Does the function mention a scenario type?* A gate that
reads `pack.admitted`, `arms[].discordant` or `folds[].partition` does not. A gate that reads `gold` executable
against SQLite, or that parses a fenced ```` ```sql ```` block, does. Applying it to the 31 gates:

| kind | gates | belongs to |
|---|---|---|
| scenario-agnostic (**37**) | every gate except the two below, including the eight transfer ids | `protocol` |
| scenario-bound (**2**) | `V4` gold-executable · `V10` convention-executable | `protocol`, reading an optional scenario field |

**The estimate going in was 22 and 9, and it was wrong by fifteen gates.** The first pass classified gates by
their *names* — `parse-rate` looked like a parser's gate, `pool-complete` like a candidate pool's, `channel` like
a schema channel's. Classifying by the fields each gate actually reads produced **29 of 31**, and after the
eight transfer ids were counted (they arrive as arguments to `transferGates` rather than as object keys, so a
scan for `id:` misses them) the set is **39 gates of which 37 depend on nothing scenario-specific at all**. Only
two gates read a scenario field, both read an *optional* one, and both are absent rather than green when it is
missing.

**The correction matters more than the number.** A name-based cut would have moved nine gates into the adapter
and left the adapter owning gates that had no scenario in them — which is exactly the fork this design exists to
prevent. The rule survives; the intuition that produced the first estimate did not, and the record keeps the
wrong number here because the correction is the evidence that the rule was applied rather than quoted.

**The contract is five methods and one reason for each.** Anything smaller pushes a decision into the lane;
anything larger makes a lane's job copying.

```ts
export interface LaneAdapter<Task, Candidate> {
  /** The tasks this lane scores, in a stable order: the fold partition downstream assumes it. */
  load(): Promise<readonly Task[]>;
  /** The prompt for one task, with the pack rendered into it by the adapter, not by the protocol. */
  prompt(task: Task, pack: Pack): string;
  /** A reply that cannot be read is not a wrong answer; returning undefined is how the lane says so. */
  parse(raw: string): Candidate | undefined;
  /** Correctness is the lane's, because only the lane can execute or judge. */
  score(task: Task, candidate: Candidate): Promise<boolean>;
  /** Outcome-blind strata, computed from inputs alone: no arm's result may enter this function. */
  strata(task: Task): readonly string[];
}
```

**Three properties are load-bearing, and each has a failure it prevents.**

1. **`parse` returning `undefined` is a value, not a throw.** `V3-parse-rate` is the gate that separates "the model
   could not answer" from "the model answered wrongly", and a lane that throws on a malformed reply converts the
   first into a crash that takes a fold with it. The prototype is `plugin.ts`, where the same rule is already
   enforced: *a failure is a value*.
2. **`score` is the lane's, not the protocol's.** This is what makes the protocol scenario-agnostic at all: the
   protocol never learns what correctness means, only whether the caller said yes. A protocol that scored would
   have to know about SQL execution or tool-call matching, and would then be a second `sota-bird.ts`.
3. **`strata` may not read an outcome.** §135's rule, now structural: conditioning on "failed without the hint" and
   then contrasting inside that stratum measures regression to the mean. The signature enforces it — `strata`
   receives a `Task` and nothing else, so there is no arm to condition on.

**What the protocol owns, and why each piece had to move.** Gates (22), the paired statistics they read
(`mcnemar`, `bootstrap`, `dose`, `passk`, `resolution`), the artefact schema and its validator, the
pre-registration format and its gate-agreement check, and the arm contract with `armPairBetween`. None of these
mentions a scenario type, all of them were written inside one lane, and the artefact validator's arithmetic is
the reason a lane cannot be trusted to report its own numbers.

**Dependency direction, enforced rather than described.** `core ← protocol ← eval-sql / eval-tau2`. The `protocol`
package may not import an adapter, and a lint rule states it: an adapter import inside `protocol/src` fails the
build. Without that rule the seam is a comment, and a comment does not survive the first urgent patch.

**The migration is staged so that each stage is independently green.** Stage 1 moves all 39 gates and the
statistics into `protocol` and has `sota-bird.ts` import them — no behaviour change, and the existing 31-gate
reading is the regression test. Stage 2 defines `LaneAdapter` and makes the τ² lane implement it, replacing its
three bespoke gates with the 22; **this is the experiment**, and its outcome is which of the 22 are meaningful in
a second scenario and which are not. Stage 3 moves the SQL modules into `eval-sql` and splits `sota.ts` on the cut
rule above — mechanical, deferred until stage 2 says the seam holds.

**What stage 2 can prove, and what it cannot.** It proves that the protocol admits a second scenario without
editing gates, which is the whole content of the generality claim. It does **not** prove that memory helps a
second scenario: τ² at n = 68 has a 15pp half-width, and the honest reading after stage 2 is still "no result".
Separating those two is the point — this iteration's claim is about the apparatus, and conflating it with an
effect claim is how a repository ends up asserting generality it has not measured.

**Coverage.** Every new `protocol` module arrives with tests at the same bar as the lane it left (four
dimensions ≥ 95%, and 100% for the gate table), because a moved function that loses its tests is a rewrite
pretending to be a move. The stage-1 regression is unusually strong: 31 committed artefacts are re-validated by
`pnpm eval:protocol` on every push, so a behaviour change in a moved gate fails offline in about a second.

### 17.65 A portable signature is not an evaluable gate, and the input type was all-or-nothing

**§17.64 ends with a claim it could not test.** It measured portability by reading each gate's signature and
concluded that 37 of 39 gates "depend on nothing scenario-specific at all". That count is correct and it answers
a question nobody was asking. The question a lane's author asks is *will this gate fire for me*, and the answer
depends on something the signature cannot show: whether the lane ran the experiment whose bookkeeping the gate
reads. `V45-clearance-dose-matched` mentions no scenario type. It also cannot fire for a lane that never built a
clearance arm and its dose-matched control, because the input it reads is produced by that pair and by nothing
else.

**So portability is indexical, and the index has to be data.** `packages/eval/src/tau2-gates.ts` holds two
tables — nine gates the τ² lane's record type can feed, thirty that need an arm it never ran — plus a test that
the two together are exactly `GATE_ORDER`, in both directions. The test is the load-bearing part: a gate that
appears in neither table would vanish from the audit without appearing among the absences, which is the same
silent-omission failure this record has repaired four times in other layers.

| bucket | count | what it means for the report |
|---|---|---|
| supplyable | 9 | the lane's record type can carry the field |
| arm-indexed | 30 | the field exists only inside an experiment τ² did not run |
| informative | 2 | fires *and* reads a measurement (`V3`, `V5`) |
| vacuous | 2 | fires, passes, certifies nothing (`V6`, `V7`) |

**The vacuous bucket is not a curiosity; it is the majority of what has ever fired.** `V6-controls-inject`
evaluates `every` over the list of pack-based control arms, and `every` over an empty list is true — so a lane
with no such arm gets a green gate that says *"no pack-based controls configured"*. All seventeen published BIRD
artefacts carry exactly that sentence; sixteen of seventeen carry `V7-channel` with *"no channel control was
run"*. Two gates out of seven that fire on every run have never quantified anything in the published record.
Deleting them would change seventeen committed files and would also delete a true statement about the run, so
the design answer is neither deletion nor denial: the audit counts them separately, and any sentence that says
"n gates" in this project now has to say which kind.

**The defect the second scenario actually found was in the type, and it was all-or-nothing.** `ProtocolGateInput`
declared eight fields mandatory. Two of them — `meanPackIds` and the call tally — are knowable only to a lane
whose model runs in-process: τ²'s agent is a Python program behind a recall facade, and the calls belong to it.
A lane that could not state those two could not call `buildProtocolGates`, so the four gates it could prove were
never evaluated. **The requirement did not degrade the report; it withheld it.**

```ts
// before: a lane that cannot count its recalled items cannot be measured at all
readonly meanPackIds: number;
readonly callFailureRate: number;

// after: absent gate, absent field, and a line in the report that names the missing fact
readonly meanPackIds?: number;
readonly callFailureRate?: number;
```

The rule this applies is the one the package already stated for its scenario half — *a gate that cannot fire must
be absent rather than green* — extended from the optional fields to the required ones. It is not a loosening: a
lane that supplies the fields (BIRD does, on all seventeen artefacts) gets the same thirty-nine gates and the same
byte-identical output, which is what `pnpm eval:protocol` verifies on every push. What changes is the case where
a lane cannot: it reports what it can prove, and the rest is named.

**`V5-resolution` became blocking, and the evidence for the flag is that it had none.** Seventeen artefacts carry
the gate; seventeen pass it, from 1.96pp to 4.87pp against a 6pp bar. Sixteen iterations of an advisory flag
whose only failure case is the case it exists for is a flag that was recorded rather than enforced. The run that
fails it is the second scenario: 68 paired tasks, 27 discordant, so `sqrt(2.802² × 0.3971 / 68) = 21.41pp`
against a 6pp bar, and the lane had been publishing a 1.47pp delta on top of it.

**The two statistics are not the same number, and the record had been quoting one of them.** The 95% half-width
is `1.96·SE`; the minimum detectable difference at 80% power is `2.802·SE`. For the τ² comparison those are
14.98pp and 21.41pp — a ratio of 1.43 — and a report that says "±15pp" while the gate reads 21.41 is not wrong,
it is two different measurements sharing a name. Both now travel in the artefact, and the gate reads the one its
criterion names.

**What this does not license.** The apparatus claim survives; the mechanism claim does not gain anything. τ² is
still a null at n = 68 with a design that can only see 21pp, and no iteration may quote conformance as evidence
that memory transfers. The one thing stage 2 licenses is narrower and checkable: **a second scenario is measured
by the same function, the same publication order and the same artefact schema, with no edit to a gate** — and
the report says which gates fired, which were vacuous, and which experiment each of the rest would need.

### 17.66 Resolution is a property of the design, and the record had never put its deltas on that scale

**The defect this section records is arithmetic, not modelling.** Every iteration since the first has reported a
paired delta — `helped − harmed` over `n` questions — and argued about whether it was big. Nobody computed the
other half of the sentence: **the smallest delta that sample could distinguish from zero.** A 350-question
comparison at this corpus's discordance can see about 4.5pp; a 1,534-question one can see about 2.0pp. Six
iterations produced point estimates between −2.57 and −4.86pp on the first kind of sample and read them as
findings about the mechanism. Three of the six are inside the interval of the other three.

**Two widths, and they are not interchangeable.** For a paired design with `b` helped and `c` harmed among `n`:

```
SE          = sqrt(b + c) / n           the concordant pairs cancel; only the discordant ones carry information
half-width  = 1.96  · SE                a 95% interval around the observed delta
resolution  = 2.802 · SE                the smallest true delta this design detects 80% of the time
```

The ratio is `2.802 / 1.96 = 1.43`, which is why a report that says "±4.5pp" and a gate that reads "6.4pp" are not
contradicting each other — they are different questions. `V5-resolution` reads the second; §138 priced the τ² lane
at 21.41pp against its 6pp bar with the first nowhere in sight. **Both now travel in every artefact that carries a
paired comparison**, and `pairedWidths` (`packages/eval/src/power.ts`) is the single function that produces them, so
a bucket in the stratification and a row in the audit cannot disagree about the same forty questions.

**Sample size follows from the effect you refuse to miss, and it is not a small number.**

```
n ≥ z² · d / δ²        z = 2.802, d = share of discordant pairs, δ = the delta to resolve

dev split, d = 8.4%, δ = 1pp   →  n ≥ 6,603 questions
values arm, d = 7.2%, δ = 1.17pp (its own observed effect)  →  n ≥ 4,100 questions
```

BIRD's dev split is 1,534 questions. The sharpest design in the entire record — `poc-sota-bird-dev.json`, 1,534
questions, 115 discordant — resolves **1.96pp**. The mechanism's best positive reading is **+1.17pp**. **The
effect the project has spent twenty-six iterations arguing about is 61% of the smallest effect its best sample
could have confirmed**, and every other sample in the record is coarser: the thirteen 350-question artefacts
resolve 3.76pp to 4.87pp.

| what the record has | what it can see | what it claimed |
|---|---|---|
| 13 artefacts at n = 350 | 3.76 – 4.87pp | −2.00 to −4.86pp |
| 4 artefacts at n = 1,534 | 1.96 – 2.14pp | −1.37 to +0.33pp |
| 1 arm inside an artefact (`values`) | 1.91pp | **+1.17pp** |
| BIRD train, never used | — (9,428 questions) | — |

**The audit is a table, not a new test, and the distinction has to be stated because it is easy to abuse.**
`resolvable = |delta| > 2.802 · SE` is a monotone function of the same discordant counts as McNemar's test, so it
can never disagree with a p-value about direction and it does not add evidence. What it adds is a **scale**: the
`evidence` artefact at −4.86pp is `significant95 = true` and `resolvable = false`, and a design that reported only
its p-value would have had to call that either a finding or a null when it is neither. Both flags travel in
`poc-power-audit.json` for exactly this reason — a row quoted on the looser bar alone would be a different claim
than the same row quoted on the stricter one.

**What the stratification adds, and what it removes.** `packages/eval/src/strata.ts` buckets the committed record
by an outcome-blind overlap statistic — the maximum of `queryCoverage` over the rules a question was actually
shown, which is the store's own `minCoverage` function and not a second definition of the same quantity. Four
buckets, edges fixed in the registration, and five criteria: is the minimum in the middle, does it survive the
difficulty control, are the buckets populated, does the shape survive a character 4-gram tokeniser, and does the
gap around the minimum exceed its own resolution.

The fifth is an amendment and it is the one that decided the reading. Without it, a bucket holding 18 questions and
4 discordant pairs is the minimum of four and the shape is whatever a reader wants it to be; with it, the gap of
18.55pp is measured against a 32.23pp resolution and the honest sentence is *not estimable*, not *the harm
concentrates at the top*. `S2` gets the same treatment: the registered wording let a three-question cell decide
whether a difficulty band keeps its minimum in the middle, which is a coin flip wearing the costume of a control.
**The general rule this round contributes: a criterion that can be decided by a cell smaller than its own
resolution is not a criterion, and every one of the five is now held to that.**

**What the stratification eliminates is worth more than what it measured.** 90.9% of the corpus sits below 0.4
overlap, and across those 1,395 questions the memory effect is +0.00pp and −0.30pp. The 139 questions above 0.4
carry the whole of whatever signal exists, and they cannot resolve it. Combined with §62's embedding result — hurt
rules are not more dissimilar to their question than helped rules, 0.254 against 0.226, p = 0.12 — the conclusion
is that **relevance is not the axis**, and that the next hypothesis must be about what a rule does to the query
rather than where it sits in similarity space.

### 17.67 A covariate may be post-treatment and still be admissible; it may not be post-outcome

**The design question R30 had to settle before it could be built.** The classifier reads the SQL the pack produced.
That query exists only after the treatment, so every feature derived from it is post-treatment, and the reflex is
to say a covariate must precede the treatment. The reflex is wrong and the reason is worth stating precisely,
because the wrong version of it would have killed the only covariate in twenty-eight rounds that separated.

The requirement is not *prior to treatment*. It is **not a function of the outcome**. A variable that is caused by
the treatment and precedes the outcome is a mediator, and conditioning on a mediator does not estimate the total
effect — it estimates a controlled direct effect, which is a different and still meaningful quantity. A variable
that is caused by the outcome is a collider or a consequence, and conditioning on it manufactures an association
that is not there. `predictedSql` is the first kind: the model writes it before anything is executed, and whether
it is right is decided afterwards. So `F1` is reported as a moderator with that name attached, never as the total
effect of the pack, and the total effect (+0.33pp) is reported beside it in the same artefact.

**Two things follow, and both are in the code.** First, the classifier reads no gold SQL, no gold result and no
scorer field — the constraint is enforced by the input type, which has exactly four string fields for the two
queries, the question and the evidence. Second, the reading layer never restricts the analysis population to
"cases where the query moved": `moved` correlates with the baseline being wrong (45.2% against 65.3%), so
restricting to it would condition on a post-treatment variable that is a proxy for difficulty. Every rate is
quoted over all 1,534 questions, and the moved-only figures are the ones that are *not* reported.

**The estimator for a difference of two deltas, and why the clustered interval is reported beside it.**

```
group g:  b_g helped, c_g harmed, n_g pairs
SE_g     = sqrt(b_g + c_g) / n_g
gap      = delta_present − delta_absent
half     = 1.96 · sqrt(SE_present² + SE_absent²)
```

The two groups are disjoint, so their standard errors add in quadrature; nothing is paired *across* the split. This
is the same arithmetic `power.ts` uses for one delta, applied twice, which is why the reading layer imports
`pairedWidths` rather than writing a second formula. It is also why the same three bars are available for the gap:
`Δ > half` for a 95% separation, `Δ > 2.802 · SE` for 80% power, and `p` from the exact test.

The eleven databases are not independent draws, and a question's neighbour in the same database shares its rules,
its schema and its failure modes. `clusteredGap` resamples **databases** with replacement inside each group and
reports the percentile interval, which for `F1` is [−19.60, −2.63] against the analytic ±7.61 — the same
conclusion, reached without assuming 1,534 independent observations. Both travel in the artefact; a reader who
wants the assumption-free version has it, and the assumption-dependent one is what every earlier round's numbers
were computed with.

**Fisher's exact test on a paired table is not exact, and the criterion says so.** The 2×2 that `F1` produces is
`[[helped, harmed] × {present, absent}]`, whose cells are discordant pairs rather than independent draws, so
Fisher's p is an approximation of a homogeneity test that assumes independence the data does not have. It is
reported for three reasons: it is the number a reader can reproduce in any statistics package, it agrees with the
two interval-based readings in sign and at 0.05, and `Q1` requires **all three** to agree before it passes. A
criterion that rested on the p-value alone would be resting on the one number in the table with a broken
assumption.

**The gate is a measurement, not a behaviour, and the type system says which.** `gateKeepsMemoryQuery(delta)` is
the predicate the registration licenses: discard a query that names something neither the question nor the
evidence mentions. It is not wired to the read path. `gateReadingOf` computes what would have happened instead, and
it can be exact rather than modelled only because the record already holds both arms — for a discarded question
the fallback query and its outcome are columns, so the gated arm is *read*. That is also the limit of the
estimate: a real deployment would have to write the fallback, and this corpus is the only place where someone
already did.

**Three absences that a less careful module would have filled with a zero.**

| absence | why a zero would be wrong | what the artefact says |
|---|---|---|
| a group with no discordant pair | nothing changed, so nothing can be detected — the resolution is infinite, not zero | `minDetectablePp: null` plus `helped + harmed === 0`, stated in the notes |
| a ground truth the record does not carry (`pruned-name`) | substituting the nearest available feature answers a different question | `unmeasured[]` with the category, the reason, the nearest substitute and the difference |
| a gap where one group is empty | a gap needs two groups; zero would read as "measured, and exactly zero" | `gapPp: null`, and `Q1` fails rather than passing on a coincidence |

**What would have made this a null.** The registration named it: if the identifier covariate were flat across both
halves, the defect is not in the storage either and the product claim should be withdrawn rather than narrowed.
The measured gap is −11.13pp ±7.61 with a clustered interval that excludes zero, and the same test under a
deliberately looser grounding rule gives −10.78pp ±8.37. Both clear; the refutation does not fire. What remains
unconfirmed is not the separation but its **size out of sample**: the gate's +1.30pp was chosen by looking at the
same 1,534 questions, and R30 stage 2 is the sample that can say whether it survives.

### 17.68 An explanation is not a mechanism, and the difference costs one substring test

§17.67 admitted a covariate that is post-treatment but not post-outcome, and §140 installed one: *a query that
imports an ungrounded name is damaged*. A covariate answers *what predicts the sign*. It does not answer *why*, and
this record has been careless about the distance between the two — an explanation that predicts is not a mechanism,
and the product statement §140 drew from it ("a rule may not put a name into the query the question does not
contain") is a claim about a cause.

**The space is small enough to enumerate.** A name that is in the generated query and in neither the question nor
the baseline query came from exactly one of three places:

| source | how it is decided | what it implies |
|---|---|---|
| the pack's text | the rendered rule text contains it | a rule named the column; a write-path filter can refuse it |
| the schema | it is not in the pack, and the query executed | the model took a real column out of the DDL; no write-path filter can see it |
| neither | it is not in the pack, and the query did not execute | unverifiable — a failed statement may have named a real column and failed on something else |

The first row is decided by a substring test, the second by a column of the record (`execOk`) that exists for a
different reason, and the third is what is left. All three are exhaustive, none of them needs a model call, and the
question "is the filter aimed at the right object" is answered by comparing the first two.

**Result.** 60 pack-supplied against 94 schema-supplied, damaged identically (−8.33pp against −9.57pp, gap 1.24pp
with a 14.74pp half-width), so the cause is not the pack naming anything. The generic form: **a post-treatment
covariate's mechanism is a separate question, it is usually answerable from what the pipeline already records, and
answering it can withdraw a product statement that the covariate alone licensed.**

**Why the decomposition is exact.** A gate that discards a set of questions and falls back to the no-memory query
changes the paired delta by exactly `−Σ signed(discarded) / n`, because the fallback outcome is a column rather
than a prediction. That makes the improvement *additive over any partition of the discarded set*, so the buckets
the mediation already computes can be priced: +0.33pp from pack-supplied questions, +0.59pp from schema-supplied,
+0.07pp from unverifiable. No second analysis and no bootstrap — the accounting is a column sum, and a test
asserts it against the full `cellOf` it is an identity of.

**Two conventions the round needed and wrote down.**

- *Permutation without replacement.* The null for "does the gate's placement matter" redraws which questions are
  discarded, keeping the number fixed. Drawing with replacement would let one question be picked twice, which
  makes the null describe a *smaller* subset than the gate discards — a wider null, and a p-value that flatters
  the gate. Partial Fisher–Yates over an index array, seeded.
- *The null is not centred on zero.* Discarding a random 10% of a corpus whose own mean outcome is +0.33pp still
  removes 10% of that mean, so the null's centre is **−0.03pp** — the corpus average scaled by the discard share,
  with the sign flipped because the improvement is the negative of what is removed. A test that asserted a
  zero-centred null would fail on a correct permutation and pass on a broken one.

**What the split-half is for, and what it is not.** Balancing the eleven databases by question count and reading
the gate's improvement in each half tests whether the effect survives a different mixture of the same material. It
cannot test reproduction, because both halves were in the corpus the hypothesis was formed on — and the artefact
carries that sentence in an `unmeasured` block rather than trusting a reader to supply it. The distinction is the
whole difference between §140's estimate and R30 stage 2.

### 17.69 A split is a manifest, and the second one taught the interface what it had assumed

Adding a third split to a lane that had two looked like a constant. It was five assumptions, and every
one of them was invisible because both existing splits happened to satisfy it.

**The interface the two splits share, written down after the fact.**

| concern | where it lives now | the assumption it replaced |
|---|---|---|
| where the archive is, and its digest | `manifest.url` / `bytes` / `sha256` | — (already correct) |
| which file holds the questions | `manifest.questions` | — (already correct) |
| whether the archive nests its databases | `manifest.nested` + `nestedRoot`, read as a pair | the name was hard-coded to `dev_databases.zip` |
| where databases are found after extraction | `resolveDatabase(dir, id, roots)` | three layouts were built in, and a fourth was not |
| which questions a split scores | `poolOf(rows, split)` | the tier field was required, and one split does not have it |
| which databases a split measures | `manifest.databases` | the field described the archive, not the measurement |
| where the artefact goes | `ARTEFACT_IDS: Record<Split, string>` | a two-way expression in YAML answered the wrong name |

**`manifest.databases` changed meaning, and the change is the design.** For `dev` and `minidev` it
listed every database the question file uses, so it read like a description. For `train` it lists 58
of 69, because the other eleven cost 30 GB and carry 1,599 questions — so the field now means *the
databases this split measures*, and the questions that reference anything else are dropped with a
count rather than silently. That is a better interface for the same field: a description can only be
wrong, a selection can be argued with. `withinDatabases` returns the dropped count and the declared
databases no question uses, and the lane prints both — a 7,829 next to a file of 9,428 is an
explained number, and an unexplained one is what a reader would otherwise have to reverse-engineer.

**The tier field is the interesting assumption, because `poolOf` was right.** Its rule — filter the
easiest third on `minidev`, keep everything on `dev` — encodes a real measurement decision and the
comment says why. What it also encoded, invisibly, was that a question *has* a tier. Train does not
have one: 9,428 rows carrying `SQL`, `db_id`, `question` and `evidence`, and no `difficulty` on any
of them. The fix is not a null check at the call site; it is a named question — `isSimple(difficulty:
unknown)` — whose answer for a value that is not a string is **no**. A question with no stated tier
is not one to drop, and that sentence belongs to the rule rather than to the caller.

**The precheck is a first-class artefact, not a debugging aid.** `bin/split-precheck.ts` loads a
split through the same manifest reader, the same question parser, the same pool rule, the same
selection and the same population check as the lane, and stops before the first model call. It
returns `ready` or `blocked` with the reasons, and it is the only thing in this repository that can
answer *can this split be measured* without spending a dispatch. Its value was demonstrated before
it was trusted: pointed at `minidev` it reported **350 questions**, a number it was not given and
which every transfer experiment in the record uses — the pool rule reproduced it from the file.

**The general form.** A lane that has only ever run one dataset has an interface with that dataset
baked into it, and the baking is not in the types — it is in the assumptions the types are satisfied
by. The way to find them is not more tests over the same data, because the data is what is wrong; it
is to run the loader against a second dataset and stop before the expensive part. Five defects came
out of that, four of them after the download.

### 17.70 A rule that reads one query has no denominator, and the design that made it measurable

The read-time filter is defined on two statements. Every reading of it through §17.68–§17.69 took that
for granted, because `DiffCase` is a *pair*: the corpus it consumes was built by joining a bare attempt
to a served one. R33 stage 0 asked what happens to the rule when a deployment has only one statement, and
the answer required a small amount of new machinery and no new data.

**The rule is not re-implemented; the anchor is removed.** `importedNamesOf(sql, question, evidence,
rule)` calls `diffQueries('', sql, …)`. Against an empty baseline the diff reports every name the query
uses, and the existing grounding test then decides which of those the text supports. A second
implementation of "is this name implied" would have differed from the first by exactly the thing under
test, so there is only one, and it lives where it always did.

**`clusteredGapOf` was generalised, not duplicated.** It took `readonly DiffCase[]` because every caller
was a diff. The three fields it actually reads — `dbId`, `correct`, `withoutMemoryCorrect` — are now the
structural `ScoredRow`, and a validity reading passes rows whose second field is `false`, because with no
baseline arm the paired difference of an attempt against nothing *is* its own correctness. That is what
makes the bootstrap resample accuracy over databases rather than a contrast, and it is a comment, not a
second estimator.

**The change found a defect in the old code on its first use.** `clusteredGapOf` returned an interval
whenever both groups were non-empty, including when the whole corpus sat in **one database** — where
resampling returns the same cluster every draw and the interval collapses onto the point estimate, which
reads as a resolved effect. `clusteredDeltaOf` had refused that case since §17.66. The two are quoted
side by side, so they now agree about when a corpus has no interval to give, and the single-cluster case
is pinned by a test that builds exactly that corpus.

**Three readings, one type.**

| field | what it answers | how it can be null |
|---|---|---|
| `flagged` / `clean` | the two halves the rule makes, each divided by its own base | the half is empty |
| `gapPp`, `clustered` | whether the halves differ, resampled over databases | either half empty, or fewer than two databases |
| `sensitivity`, `specificity`, `youdenJ` | whether the rule sorts at all once the base rate is removed | nothing wrong, or nothing right |
| `excluded` | how many cases the rule could not be asked about | never — it is a count |

**`excluded` is the field that carries the finding.** Ten of the 7,000 out-of-sample rows store no
`baselineSql`. A predicate is undefined on the empty string, and the two possible treatments are not
neutral: counting the empty row as unflagged puts a known failure into the clean group and pulls the gap
toward zero. The count travels with every reading, `V53` polices the absences against the arm records
that should accompany them, and `prereg/R33.md` Amendment 1 publishes the gap under both treatments
(−12.58pp against −10.71pp, and the interval across zero for one of them) so the choice can be argued
with rather than inferred.

**One number had to be replaced because its denominator was saturated.** The registration asked whether
the served query is flagged more often than the bare one; with 94.8% of bare attempts already flagged,
that difference has 5.2 points to move in. `addedByPackOf` asks the same question on the population where
it has room — of the questions the *bare* rule passes, the share the *served* rule fails — and returns
**99 of 1,693 (5.8%)**. That is the same quantity §17.68 measured at 7.8% under the anchored covariate,
reproduced under a rule that shares nothing with it but the tokeniser.

**The general form.** A statistic inherits the assumptions of the corpus it was written for. `DiffCase`
encoded "there are always two statements"; the moment a caller had one, the type was wrong before the
mathematics was. The cheapest way to find that is to ask a question the current corpus cannot express and
watch which types refuse — here three did, and one of them was refusing a case it had never been honestly
able to answer.

### 17.71 The selection instrument: a rate on the wrong base, and a bar that belongs to the admitted set

`packages/eval/src/admission.ts`. Two design decisions and one defect the design exposed in its own
registration, with no new model call and no new corpus — `per_case` holds everything needed, including the
fields the gates read.

**The estimator is defined on every question, not on the admitted subset.** `admissionGainOf(cases, admit,
{resamples, seed})` pushes `(correct − withoutMemoryCorrect) · 1[admitted]` for every case and resamples
databases, so `netPp`, `lowPp` and `highPp` are on the corpus's scale and comparable with §17.68's −0.71pp
and the oracle's +2.67pp. The alternative — the gain among the admitted — is a hundred times larger and a
different claim; `perAdmittedPp` carries it separately so the two can never be quoted for one another. A
corpus with fewer than two databases reached gets no interval at all, the refusal §17.70 added to
`clusteredGapOf` and this module reuses rather than re-derives.

**`exchangeOf` reports the hurdle, which is a field the previous readings did not have.** `repairable` and
`breakable` are the two bases; `hurdle = breakable / repairable`; `clearance = helpPerHarm / hurdle`. Naming
the ratio that makes memory pay — rather than relying on a reader to compare against 1.0 — is what turned
"close to a wash" into a 43% shortfall. `requiredRepairRatePp` and `requiredBreakRatePp` are the same
arithmetic read as targets, and they are the only numbers in this record a future design can be held to.

**The gate score is computed over the whole corpus and only the questions are split.** `selfKnowledgeOf`
builds a Jaccard neighbour set per database, excludes the question itself, breaks ties by id, and returns
`null` rather than `0` for a question with no neighbour — a gate that admits on "no evidence of failure"
would admit every question in a one-question schema. `splitByDatabase` deals the databases by a stable FNV-1a
hash with the id appended to the key, so the deal is a function of the corpus rather than of the order it was
read in. Recomputing the neighbour set inside each half would have answered a different question on each side
of the wall.

**The defect: the precision bar was derived on the corpus and applied to a subset.** `b / (r + b)` is a
property of *the set being admitted*; admitting questions changes their rates. On this corpus the gate
reaches 62.4% precision against a registered 47.64% bar and returns −0.05pp, because inside its own
population the break rate rises from 5.50% to 9.68% while the repair rate stays flat and the bar rises
16.8pp to meet it. The artefact therefore reports `within` — the exchange of the admitted set — beside every
point, and `precisionBarWithin` beside the frontier. This is `AUDIT` §32.2, and the general lesson is
recorded there: every rate in a derivation needs the question *on which set is this measured, and does the
intervention change that set?*

**The control is a recorded arm.** Six seeded random admissions at fixed shares, each with the expected
value `share × net` and its own interval; the control passes when the expectation lies inside that interval.
The registration asked for a fixed 0.15pp tolerance, which at the 15% share is below the net's ±0.26pp
sampling error — the third of R34's four unreachable thresholds, and the reason the criterion is the
instrument this repository already uses everywhere else.

**Coverage.** `admission.ts` is 100% on all four dimensions from 43 tests: the exchange arithmetic including
every zero denominator, the admission estimator's two scales, the kNN score's three ways of being wrong
(self-inclusion, cross-database leakage, an unspecified tie), the split's disjointness and order-independence,
all six gate predicates including the conjunction's borrowed floor, and each of the seven verdicts in both
directions — including the three that were **vacuous** before a test found them (`every` over an empty
control, an oracle identity over an empty corpus, and "neither gate cleared" over no gates).

### 17.72 The ledger instrument: a null that holds the pack fixed, and a reliability that decides a prune

`packages/eval/src/ledger.ts`. Four readings over the artefact §146 already paid for, no model call, and
one design constraint that shapes the rest: **attribution is not exclusive**, so the unit is the injection
and every statistic is defined on it.

**The dispersion null is the module's whole correctness argument.** `dispersionOf(cases, {permutations,
seed})` computes `Σ (r_k − n_k p)² / (n_k p (1 − p))` over rules and compares it against a distribution
produced by permuting the *case-level outcome labels* — repair / break / neither — across questions while
every rule keeps the question set `packIdList` gave it. Three consequences, all of them tested:
two rules that are always injected together cannot be separated by any permutation (statistic exactly
zero, p = 1); a corpus whose flips all sit on one rule produces the maximum statistic; and the empirical p
is `(1 + exceed) / (1 + permutations)` so a run never reports a resolution it does not have. The count of
permutations, the null mean and the null's 99th percentile all travel in the artefact, because a p-value
without its null is not reproducible.

**`replicationOf` spends the split on databases, not questions.** `splitByDatabase` deals 29/29 by a stable
FNV-1a hash with the id appended, so the deal is a function of the corpus rather than of the order it was
read in, and R34's split is reused rather than re-derived — the function was generalised to
`<T extends { dbId: string }>` so both readings share one definition of "the halves". The correlation is
computed over rules shown at least five times **in each half**; below two common rules it returns `null`
rather than a number, and the Fisher interval is withheld below four. `reliability` is Spearman–Brown and
returns `null` when `1 + r ≤ 0`: a ledger whose halves anti-agree does not become reliable by being longer,
and −0.309 is the value that says so.

**`screeningOf` is the only actionable form and it is tested as such.** Flag = negative net over at least
ten showings in the discovery half; the confirmation questions are grouped by whether their pack carried
*any* flagged rule, so a two-rule pack is attributed to the flag without a decomposition the instrument
cannot do. Both arms are netted per question and the difference is bootstrapped **over databases**:
`clusteredContrastPp` resamples clusters, skips draws where either arm is empty, and refuses an interval
below two clusters — the same refusal `clusteredGapOf` and `admissionGainOf` already carry, now in one
place. A question-level bootstrap on this corpus produces intervals roughly a third as wide as the data
supports.

**`packSizeOf` exists because the corpus, counted properly, had a structural variable nobody had used.**
423 of 7,000 questions carry one rule and 6,576 carry two. The cells are reported on their own bases
(repairable / repaired, breakable / broken) rather than as two rates, and the contrast is the difference of
the two nets, because the singleton questions are harder and a rate comparison would confound difficulty
with pack size.

**Coverage, and the four branches it found.** The module is 100% on all four dimensions from 40 tests. It
started at 86.98% branches, and the missing 13% was four guards whose condition could never be false —
`pearson`'s small-n check, `perHundred`'s zero-denominator check, `armOf`'s `usable` skip, and every
cast a `boolean` predicate forced on its callers. Making `usable` a type predicate
(`entry is LedgerCase & { packIdList: readonly string[] }`) deleted five casts and one dead guard at once;
`AUDIT` §33.2 records the family. The one genuine gap — the `high < 0` arm of `excludesZero` — needed a
corpus where the pairs beat the singles, and got a test rather than a comment.

### 17.73 The assignment instrument: two arms, four cells, and an identity that makes the decomposition checkable

The ledger instrument (§17.72) measured a contrast on questions retrieval *happened* to serve one rule. The
assignment instrument measures the same contrast on questions the experiment assigns one rule, which is the
difference between a correlation and a mechanism. It is one module, `packages/eval/src/assignment.ts`, and
three decisions in it are worth recording.

**1. The arm is a truncation of the pack, not a second retrieval.** `full-one` is built from the pack `full`
carries — `makePack(pack.items.slice(0, 1), { budget: pack.budget })` — so the two prompts differ in one
field. A second recall would have put retrieval noise inside a comparison that is about a budget, and the
artefact records the evidence: 1,133 of 1,534 prompts (73.9%) differ and none carries more than one item
(`V49`). `V62` re-checks it through `singleSlotOf`, which reads the lane's own count when the artefact has
one and falls back to the lane's gate when it does not — the R25 artefact predates the count, and the gate is
the same check stated as a verdict.

**2. Two intervals, one of them the decision.** `comparePaired` gives the exact McNemar p and a per-question
bootstrap; `clusterBootstrapCI` resamples databases, because questions inside a schema share a model, a
vocabulary and a retrieval index. Both are reported and the registration reads the clustered one, which is
wider by 0.09pp on the lower bound here (−1.65 against −1.56). The point of reporting both is that the
difference is the cost of the cluster, and a reader can see it rather than take a claim on trust.

**3. The four cells, and the identity that binds them.** The contrast decomposes by the base each question
sits on — repairs are defined on questions the bare model missed, breaks on questions it answered — and each
arm can win either. The four counts satisfy

```text
  (repairsGained + breaksSaved) − (repairsLost + breaksGained) = correct(removed) − correct(kept)
```

which is `netChange === gained + lost`'s signed sum, and it is asserted as a unit test rather than computed
twice. A decomposition without an identity is a table; with one it is a check on the arm itself, and it is
what turns "the second item carries 23 repairs and causes 27 breaks" into a statement that cannot be true of
a broken reading.

**4. Group by fold rather than pool, and carry an interval on every row.** `foldsOf` re-runs the same
four-cell accounting on the cases each fold held out, and it returns an array rather than a summary because
the summary is the thing that hides the failure mode. Two decisions follow, both forced by what happened when
the replication landed:

- **The interval is part of the row.** `assignmentOf` had been returning a clustered interval all along and
  `foldsOf` did not carry it, which made five point estimates look like five findings. Here four of five rows
  span zero, and the fifth (−5, [−2.55, −0.66]) is the only one that does not.
- **`foldPairsOf` reads the two draws as paired.** The split is seeded, so fold *k* is the same questions in
  both artefacts — 0 of 1,534 questions change fold — and pairing is therefore exact rather than approximate.
  It reports `sameSign`, and the two sides of "spans zero" separately, because the case that matters is a fold
  that decided on one draw and did not on the other, and one combined flag cannot say which side moved.

On this data three of five folds keep their sign, and the single decided-looking row covers zero on the second
draw. The per-fold cells also sum to the pooled cells and the net column to the pooled net, asserted at both
levels — a second identity for the same reason the first one exists.

**Gates and cost.** `V62-assignment-instrument` and `V63-assignment-reproduces-the-lane`; the second compares
this module's contrast against the lane's own `arm_pairs` entry to a hundredth of a point and on both
discordant counts, which is how a reimplementation of one arithmetic is prevented from being a second
opinion. The module is at 100% on all four coverage dimensions and the command makes no model call, so the
instrument can run on every push (`pnpm eval:pack-assign`, 32 CI assertions, 8 of them on the
replication and its paired folds).

**What it cannot do.** It cannot answer whether one rule *should* be shown — only whether removing the second
one helps — and it cannot see the counterfactual for a question whose pack was empty. Both limits are stated
in the artefact rather than in a comment, because the next round's arm will be designed by someone reading
the artefact.

### 17.74 The lexicon instrument: one object, two predicates, and a reading whose denominator is its argument

R37 needed a store whose items are `{term, statement}` and a gate that can tell whether the grain was applied.
Both live in `packages/eval/src/lexicon.ts` — 350 lines, four coverage dimensions at 100% — and the reading lives
in `packages/eval/src/bin/lexicon.ts`, which is formatting and no arithmetic.

**The predicates, in the order they fire.** `termOf(payload)` normalises whitespace and refuses a half-sentence
(`/[.;!?]{1}\s/`), with `MIN_TERM = 3` and `MAX_TERM = 80`. `occursIn(term, text)` is the one that decides
whether the grain can act: word boundaries on both sides, an optional plural `s`, flexible internal whitespace,
case-insensitive, and **never** a substring match — `rate` may not be licensed by `separate`. It is built as
`new RegExp('(^|[^\\p{L}\\p{N}_])' + pattern + '(s?)(?=$|[^\\p{L}\\p{N}_])', 'iu')`, and the escaping is done
inside the module, in TypeScript, where a backslash means what it says.

`admitLexicon(candidate, question)` is write time and refuses in a fixed order — `no-term`,
`term-not-in-question`, `looks-like-query` — so the reason reported is the reason the earliest clause found, and
`screenLexicon` turns the counts into the `lexicon-<reason>` keys the fold record carries. `lexiconPackOf(entries,
question, budget)` is read time: only entries whose term occurs in the question, longest term first, ties
alphabetical, and an entry that does not fit is **dropped rather than truncated**, because a truncated statement is
a different claim. `licensedLines(lines, question)` re-reads the *rendered* lines through `termOfLine`, the same
reader the renderer's format implies, and returns `{checked, unlicensed}`.

**The gate.** `lexiconGate(run)` emits `V64-lexicon-is-licensed`, blocking, with four clauses: entries > 0, lines >
0, every rendered line carries a readable term (`checked === lines`), and `unlicensed === 0`. Three of them are
ways the arm could publish a clean null without measuring anything — an empty store, a renderer that shows nothing,
a store that is licensed and a renderer that ignores the licence — and the fourth is the invariant itself. The gate
is emitted only when the `full-lexicon` arm ran, so `V64` never fires on an artefact that has no lexicon store, and
`FoldResult.lexicon` is `(LexiconRun & {questions}) | null` for that reason.

**The reading and its two denominators.** `pnpm eval:lexicon` reads
`eval/results/poc-sota-bird-dev-R37-lexicon-grain.json` and writes `eval/results/poc-lexicon.json`: the reach ledger
(corrections → entries → terms → covered questions, with the top five terms by question count and the count of
covered questions that already had corpus evidence), the licence recomputed from `per_case[].injectedLexicon`, the
two deltas, and **two** exchange readings — `exchange.split` and `exchange.covered` — computed by the repository's
existing `exchangeOf` from `admission.ts` over two different row sets. The verdicts P1–P6 are fields of the
artefact, written in code, so a reader cannot pick the clause that flatters the round; `V65-lexicon-is-feasible`
carries the 25% reach the registration fixed and is **advisory**, because a representation that does not reach far
enough is a fact about the corpus rather than a defect in the module.

**Gates and cost.** CI runs the artefact's own 14 assertions and the reading's 17, and the reading is `diff`ed
against the committed file, so a change in the arithmetic arrives as a diff rather than as a paragraph. Neither
command makes a model call. `poc-lexicon.json` is 3 KB; the run artefacts are 4.5 MB and are committed as the full
per-case projection because the sandbox's GitHub route refuses a body above roughly 3 MB.

**What it cannot do.** It cannot measure a definition the question does not contain — that is the whole design, and
it is why the round is inconclusive rather than negative. It cannot tell a definition from advice that carries a
term: a model asked for a definition may return a rule with a `term` bolted on, which passes the licence and is
still advice, so the store sample travels in the artefact for a reader rather than being adjudicated here. And it
cannot separate the grain from its retrieval: a term memory is recalled by its term, which is part of what the
grain is and also a second difference from the rule arm's relevance ranker. The next round that tries this should
render the same entries under `full`'s recall and see how much of the effect was the retriever.

### 17.75 The frontier instrument: reading a corpus's own definitions as a store

R38 needed to answer a question about a corpus without buying a run, and the answer required turning
something the corpus already ships into an instrument. `packages/eval/src/frontier.ts` is that instrument —
roughly 380 lines, four coverage dimensions at 100% — and `packages/eval/src/bin/frontier.ts` is the reading,
which formats and does not compute.

**The parse is three regexes and a length rule, on purpose.** BIRD's `evidence` block uses exactly three
shapes — `X refers to Y`, `X = Y`, `X means Y` — separated by `;` and newlines. `bridgesOf` splits on those,
tries the shapes in order (`refers to` first, because one block mixes them), and drops a segment that matches
none. `MIN_KEY = 3` and `MIN_VALUE = 2` exist because a one-character side is a fragment rather than a
mapping. The narrowness is load-bearing: the round's second refutation clause says a key universe read from
under half the annotations is the parser's rather than the corpus's, and `V68` computes that share (1,266 of
1,386, 91.3%) rather than leaving the clause as prose.

**Counting is quadratic, deliberately.** `keyStats` walks every key against every question. The alternative
is an inverted index, whose correctness is a second implementation of `occursIn` — the predicate that decides
whether a term memory can fire at all, already live in `lexicon.ts` with Unicode word boundaries and an
optional plural. 1,559 keys over 1,534 questions is 2.4M matches and about a second, which is a cheap price
for not having two matchers that can drift (`AUDIT` §34.9).

**Density is the round's central statistic and it comes from the corpus.** `density = taught / questions`:
how often a key is annotated, over how often its questions mention it. It is what separates a term from a
word without a stopword list, and its distribution is the finding — 0.967 for keys mentioned in three
questions or fewer, 0.077 for keys mentioned in fifty or more. `vocabularyKeys(stats, minDensity)` filters on
it, and the reading publishes three thresholds (0.5, 0.8, 1.0) rather than one because a single threshold is
a choice a reader cannot audit.

**The curve is the deliverable, not any point on it.** `reachCurve(ordered, questions, stops)` returns
`{keys, covered, share}` per store size, and `keysForShare` walks the ranking to the first crossing. Both are
linear in the key set and neither assumes monotonicity — a bisection would be faster and would silently
return a wrong answer on a curve that is not a curve, which is the failure `V66` exists to refuse.

**Reconstructing the arm's store needs its scopes, and the scopes are the trap.** The lane keeps its lexicon
per fold *and* per database (`lexiconByDomain.get(row.db_id)`), so a reading that reconstructs terms from
rendered lines must key them the same way. Two versions of this reading did not, and each produced a
plausible finding out of nothing: 201 licensed against 132 served reads as a store that lost a third of its
reach to a character budget, and 141 against 132 reads as nine questions silently dropped. Scoped correctly
it is 132 and 132. The structural guard is that the artefact publishes both columns, so the error appears as
two numbers that should be equal and are not.

**Three gates.** `V66-frontier-is-a-curve` (blocking) refuses an empty key set, an empty split, an empty
curve, a curve that falls as keys are added, and a whole key set that reaches nothing.
`V68-the-annotations-were-parsed` (blocking) refuses a key universe that came from the parser.
`V67-the-store-was-redundant` (advisory) reports entries per distinct term — 179 on 13, so 13.77.

**What it cannot do.** It cannot say what a learner would choose: the keys are the benchmark's annotations,
which a distiller never sees, so the frontier is an **upper bound** on a store of that size rather than an
estimate of what a learner achieves. It also cannot say what more reach would do to accuracy — the arm's own
covered cells read 5 repairs against 4 breaks, and that is the sample a re-run would have to improve on. And
it cannot read a definition the corpus states without a key-value shape; the 9% of blocks that are prose are
counted as unparsed rather than guessed at.

### 17.76 The resolution instrument: three columns, one biconditional, and a price instead of a verdict

**The item this closes was carried as a design question and needed a formula.** `AUDIT` §25.7 recorded that the
power audit reads one row per artefact and that an arm inside an artefact is not a row; it was deferred for seven
rounds on *is an arm an artefact?* The resolution of that question is a type: an artefact is the unit the validity
gates certify, and an arm is a column of it. An arm therefore inherits every gate, needs no schema, and needs
exactly `(helped, harmed, n)` — the three numbers `pairedWidths` already consumed for artefacts.

```ts
export type PublishedArm = {
  readonly arm: string;       // 'full', 'full-one', 'values', 'linked'
  readonly control: string;   // 'none' for a treatment effect, 'full' for a control comparison
  readonly n: number;
  readonly helped: number;
  readonly harmed: number;
  readonly foundPp: number;   // the delta the artefact printed
};
```

**`control` is in the row because the record had been conflating two contrasts.** `arms[]` in every artefact
compares an arm against the no-memory baseline; `arm_pairs[]` compares it against `full`. The `values` channel
therefore reads **+1.17pp** and **+0.85pp** in the same run, and a sentence that quotes either number without its
control is quoting a treatment effect while telling the reader about a control comparison. The contrast is named
`${arm} − ${control}` so that a reader can grep for it.

**`ArmReading` adds four derived columns, and each answers a question the delta cannot.**

| column | definition | the question it answers |
|---|---|---|
| `halfWidthPp` | `1.96 · √(helped + harmed) / n` | what the 95% interval is |
| `minDetectablePp` | `√(z²·d/n) · 100`, `z = 2.802` | the smallest effect this design would have found four times in five |
| `decided` | `\|delta\| > minDetectablePp` | whether the row is a measurement or a number |
| `requiredN` | `z²·d / δ²`, `null` when `δ = 0` | what it would cost to make it a measurement |

`decided` and `requiredN` are two spellings of one inequality — a row is decided exactly when its price is at or
below its own sample — and `V71` asserts that biconditional on every row. The gate is advisory and its failure is
always a bug rather than a finding, which is why it names the first offending row: two formulas that disagree
need an address.

**`requiredN` returns `null` for a zero effect rather than an enormous integer.** "Infinitely many questions to
decide whether nothing changed" is the true statement, and a printed `Infinity` or a 10¹⁸ would read like an
estimate. The discordance is capped at one inside the formula, so a malformed row cannot buy itself a cheaper
question.

**`replicationsOf` groups by contrast and refuses to pool.** minidev, dev and train are different samples with
different fold partitions and different stores; an average over them is an average of five experiments weighted by
size, which this record has refused since R13. What is reported is the count of runs, the count that could decide,
and whether the decided ones agree. **`decidedAgree` is `null` below two decided rows** — with one decided row the
sign set has one element and "the decided rows agree" is vacuously true, which is §138's `every()`-over-an-empty-
list failure in a new field.

**`shrinkageOf` answers the second thing a resolution column cannot.** A delta that is undecided at 1,534 and was
+5.43pp at 350 has two readings: the effect is real and the design lost it, or the pilot exaggerated. When the
median magnitude falls as the sample grows, the second is what the arithmetic supports — a genuine effect does not
shrink because more questions were asked. The confound is disclosed rather than corrected: rows at different `n`
are different rounds, so a fall across sizes is a fall across experiment families, and the row counts are published
beside each median. `values − full` is one row at each size and `full − none` is thirteen and six, and a reader can
see which is the stronger fact.

**`designFloors` is what makes "underpowered" a specification.** The record's three sample sizes impose median
floors of **4.38pp at 350 questions, 2.07pp at 1,534 and 0.82pp at 7,000**. A pilot design whose floor is 4.4pp
cannot adjudicate a 1pp claim however many times it is run, and printing the floor beside the count of rows that
used that size turns a repeated observation into a reusable number. The median takes the **lower** middle for an
even count, so the published statistic is always one that was observed rather than an average of two that were.

**Gates.** `V69-every-arm-is-a-row` compares the rows found while scanning with the rows emitted — silent omission
is this record's most repeated failure and a short table looks like a complete one. `V70-the-ledger-reconciles`
requires every printed delta to equal `(helped − harmed)/n` to a thousandth, because a row that fails means its
delta describes a population nobody ran. `V71` is the biconditional above. The module is at 100% on all four
coverage dimensions, the reader is a bin over `eval/results/`, and CI diffs the artefact and asserts fifteen fields
of it on every push.

### 17.77 The adapter as a package, and a coupling scan that has to survive a lexer

**The design this implements is one sentence from §17.64**: `core ← protocol ← eval-sql / eval-tau2`,
enforced rather than described. Stage 3 is the part that makes the arrow true for the SQL side: seven
modules move into `packages/sql`, and the direction becomes a gate instead of a diagram.

**The cut, applied and then corrected by it.** *Does the function mention a database?* Six modules answer
yes and one function does: `sql-exec` (opens SQLite, returns rows), `sql-guard` (bounds a statement),
`sql-diff` (reads two statements), `schema-link` (matches question words to schema names), `m-schema`
(renders a schema), `value-samples` (reads column values), and `canonicalRows`, which had been living
inside `sota.ts` and defining what "the same rows" means. Three modules answer yes and stay, and the reason
each time is a *dependency*, not a topic:

| module | why it is not in `packages/sql` |
|---|---|
| `bird-data` | it opens SQLite to read a corpus, and it depends on the artefact schema, which is `protocol`'s |
| `link-bind` | it needs the rule-template engine, a knowledge representation that belongs under `core` |
| `exec-signature` | it is a measurement signal over execution shapes, read by `pool` and `signal-gate` |

**`canonicalRows` is the interesting extraction**, because it is the seam the split exposes: a lane that
parses a reply and a runner that executes a statement must agree about row identity, and the agreement only
holds if there is one definition. It moved to the adapter and `eval` re-exports it, so no downstream import
changed while the definition became single.

**The scan is three pure functions and one walker.** `stripComments`, `scenarioWords`, `moduleRow`,
`importEdges`, three gates. It has to be a lexer rather than a regular expression for one concrete reason:
`lexicon.ts` contains `/^- "([^"]+)":/`, and a quote-tracking stripper enters a string at the first `"` and
never leaves — the first version of this module swallowed the rest of the file and reported the module as
SQL-coupled. The repair is the standard disambiguation, and it is worth writing down because the failure is
silent in the direction that gets believed:

```
a '/' after a value (identifier, number, ')', ']') divides
a '/' after an operator, an opener, or nothing at all opens a regex
inside a regex: '\\' escapes, '[...]' is a character class, '/' ends it, then flags
```

**Counting code and not comments is a second decision with the same shape.** A module that explains in prose
why it is *not* SQL-specific must not be counted as SQL-specific; the scan strips comments, counts the code,
and publishes the comment-only hits separately (23 modules) without enforcing them. The strict word list is
`sql`, `sqlite`, `nl2sql`, `text-to-sql`, `bird`, `m-schema`, and it deliberately excludes `query`, `schema`,
`table` and `column`: those are a memory store's vocabulary too, and a gate that fires on `core/kernel`
saying "query the journal" is a gate that gets suppressed within a week.

**The verdict is derived, not declared.** `adapter` if the module lives in `packages/sql`; `deferred` if it
names a scenario and appears in `DEFERRALS`; `general` otherwise. Because the derivation goes
package → word count → verdict, a row cannot disagree with where its file is, and `V72` is what turns an
unclassified module from a curiosity into a build failure:

```ts
export const DEFERRALS: Readonly<Record<string, string>> = {
  'bird-data': 'the dataset loader; opens SQLite to read a corpus rather than to answer a question',
  'link-bind': '…', sota: 'the mixed lane module: prompt, arms and gate inputs still share a file',
  // twelve in all, each naming a dependency rather than a topic
};
```

**Gates.** `V72-every-coupled-module-has-a-verdict` (blocking) also compares the rows emitted with the files
scanned, because a short table is indistinguishable from a complete one. `V73-no-package-imports-upward`
(blocking) reads a rank table — `core 0, protocol 1, sql 2, eval 3, browser 3, node 4` — and fails on any
edge whose target rank is not strictly lower; five edges exist today and all five are downward.
`V74-core-is-scenario-free` (blocking) is the README's sentence as a test.

**One defect found in the code being moved, not in the move.** `BoundedSql` armed its deadline timer when a
statement was posted, which includes the child's `node:sqlite` boot (~40–80 ms). On a loaded machine that
overhead consumed a 250 ms budget and a correct answer was reported as `deadline`. The child now sends a
readiness message before it registers its statement handler, `#ask` awaits it, and the clock starts at the
statement. The wait is unbounded by the deadline on purpose: instrument overhead is not statement time, and
a lane's accuracy must not be a function of how busy the machine was.

### 17.78 The cross-domain arm: a plan, an episode ledger, and a bar that belongs to a scenario

**The shape.** R29 stage 1 made the τ² driver record what the protocol's gates read. Stage 2 runs the arm
those gates exist for: learn from τ²-retail, answer τ²-airline, score the same episodes without the store.
Four modules carry it, and each is pure so that a dispatch tests the environment rather than the
arithmetic.

| module | input | output | why it is separate |
|---|---|---|---|
| `tau2-plan.ts` | the two scenarios' task ids, a share, two caps | the learn half and the held-out half, with every id qualified | the disjointness and the identity of a task are invisible from outside a run that costs an hour |
| `tau2-transfer.ts` | both arms' per-episode verdicts | `TransferGateInput` plus the ledger | the four transfer gates read one reading, and the mapping from two verdicts to four counts is the part that can be wrong |
| `tau2-instrument.ts` | what the driver observed | the arm record | a mapping inside a driver can only be tested by buying a dispatch |
| `l4-scenario.ts` | the scenario the arm answered | whether a published bar applies, and the split floor | a bar from another scenario is a category error, not a strict test |

**`heldOutPlan` has two shapes and one invariant.** On one scenario the pool is split by share; across
two, the learned half is the learn list and the held-out half is the whole evaluation list, because a
store that never saw the scenario has nothing to hold back. The invariant is the same in both: the two
halves do not intersect. The driver re-checks it immediately before paying for the learning half — a leak
is the one defect in this lane that produces a number instead of an error.

**Ids are qualified where the result document is read.** τ² numbers its tasks from zero inside every
domain, so a bare `3` names two different tasks in two scenarios. `airline/3` cannot. The qualification
happens at the boundary (`scoredArm`), so the split, the pair and the ledger all speak the same names, and
`V2-fold-partition`'s leak count becomes a statement about the run rather than about the naming.

**The transfer unit is the episode, and the treatment is the pack.** BIRD's trial is one rule pointed at
one foreign question with a counterfactual call beside it; τ² has neither, so the pair is
`(reference verdict, memory verdict)` for one `(task, trial)`, with the verdict being τ²'s own
`reward == 1`. The arithmetic is `transferSummary` — the function the SQL lane publishes through — and
the reading it produces is narrower than BIRD's in a way the artefact states:

```
informative  the control arm failed, so the pack had something to repair
broke        the control arm passed and the treatment failed
unmeasured   either verdict is null (τ² writes null for an infrastructure failure)
ledger       one row per episode, holes included, so every count can be recomputed from the file
```

**`V15` on this lane is a reconciliation and it is honest about that.** `unmeasured + blankRight +
informative = trials` holds by construction when the summary and the ledger are built from one list of
episodes, which is exactly what it would not do if the ledger were assembled somewhere else — the defect
`V33` was written after. The gate is therefore cheap on τ² and it is not vacuous: it fails a summary that
dropped a category, which is what a hand-built artefact does first.

**The bar is a pair of numbers, not one.** `l4-scenario.ts` carries ALTK-Evolve's `pass^4 = 0.575` **and
the scenario it was measured on**. On τ²-retail both are used; anywhere else the artefact reports
`published_bar_applies: 0`, omits the leaderboard gate, and says in a note that the comparison it supports
is the paired one. The split floor moves for the same reason: `60` was chosen for retail's 68-task
held-out half, and a dispatch that answers a 50-task scenario states its own floor (`TAU_MIN_TASKS`).

**Recall scope is the treatment, not a setting.** Items carry the scenario they were learned in and recall
filters by it, so a `retail` store serves an `airline` question with nothing unless the facade asks in the
store's own terms (`TAU_RECALL_DOMAIN`, defaulting to the learned scenario). The three names — learn,
answer, recall — are recorded in the arm artefact, because a reader has to be able to tell a foreign pack
from a pack the scenario filter emptied.

**Interfaces.** No new package edge: everything here is `eval` reading `protocol`'s `TransferGateInput`.
The dispatch is unchanged in kind — the same `sota.yml` job, the same two arms — and the scenario pair
lives in repository variables rather than in the dispatch menu, because the menu is capped at twenty-five
inputs and an experiment's scenario is a property of the experiment, not of the dispatch.

### 17.79 The model name is a boundary, and a driver keeps the diagnostics it can see

**The defect this section exists for.** R41's memory arm stored nothing, and the reason was one string.
τ²'s Python half is a **litellm** caller: it names its model `deepseek/deepseek-chat`, and the workflow
passes that name in `TAU_MODEL` because the Python side needs it in that form. The TypeScript client that
distils the corrections reads the same variable and posts to `api.deepseek.com/chat/completions`, whose
`model` field is `deepseek-chat`. The prefixed form is refused with a **400**, which the client does not
retry — correctly, since a rejected request is not a transient one — and `distill` counts a refused event
as "nothing to learn from this correction". Thirty-two corrections, thirty-two refusals, an empty store.

**Where the translation belongs.** At the client, not at the workflow, and not at the call site. The
workflow does not know which endpoint a variable will be read by; the call site knows even less. The
client knows the endpoint it posts to, which makes it the only layer that can say what that endpoint
serves:

```
restModelOf(configured) -> { sent, stripped? }
  'deepseek/deepseek-chat'    -> 'deepseek-chat'      (stripped: 'deepseek')
  'deepseek-chat'             -> 'deepseek-chat'
  'openai/gpt-4o'             -> unchanged            (not this endpoint's alias)
  'deepseek-ai/DeepSeek-V3'   -> unchanged            (a name, not an alias)
  ''                          -> MG_E_CONFIG
```

**One alias wide, on purpose.** A rule that strips everything before the first `/` would send `gpt-4o` to
a DeepSeek endpoint, and the resulting "model not found" would describe a configuration that had named
another provider deliberately. The list is `{deepseek}` and it is a translation table, not a heuristic.
`LlmClient` keeps both strings — `configuredModel` and `model` — and the artefact records both, so the
translation is visible rather than inferred from a working run.

**A prompt that was sent and refused is a failed prompt.** `failures` moved only when four attempts had
been spent, so a provider that rejected every request outright reported `prompts: 32, failures: 0` — the
strongest reliability claim the lane can make, about thirty-two refusals. The counter now moves on both
terminal paths; what differs between a 400 and an exhausted 429 is whether the run continues, not whether
the prompt failed. `TAU_DISTILL_MODEL` exists as an override for a caller that wants to state the REST id
outright, and an empty value is read as unset: a workflow variable that is not configured renders as `''`,
which `??` would have kept.

**The composition was called a fallback and was not one.** `combineInterpreters` runs every interpreter it
is given and stops at the first that throws. Its docstring called the second argument a "generic
fallback", which is what this lane read; the code had never implemented one. The two extreme repairs are
both wrong: a store emptied by an outage is the R41 defect, and a store filled with generic negative
lessons under an outage is worse, because it grades as a memory that ran. So the fallback is the host's
policy and it is conditional:

```
resilientInterpreter(primary, fallback, { fatal = stoppedRun })
  primary answers              -> its candidates
  primary throws, fatal        -> rethrow           (the run stops)
  primary throws, not fatal    -> count it, fallback answers
  fallback throws too          -> rethrow the primary error
```

`stoppedRun` is the predicate that separates "this call failed" from "the run is over": budget exceeded,
provider failed after the breaker opened, deadline passed, and refused configuration (no credit, a model id
the endpoint does not serve). Those four rethrow. `MG_E_STORE_IO` — one prompt that failed after every
attempt — does not, because that is exactly the case the caller's `try` exists to absorb. The predicate
lives in `eval/stopped-run.ts` now that two lanes need it; the SQL lane had its own copy.

**The driver keeps what it can see.** Four readings lived in the driver's process during R41 and reached
no artefact, which is why an empty store had no explanation anywhere in the record:

| reading | source | gate it feeds |
|---|---|---|
| `learning.distillFailed` | `DistillReport.failed` | `V32-fold-learning-intact` |
| `learning.candidates` / `.events` | `DistillReport` | separates "interpreter produced nothing" from "the store admitted nothing" |
| `learning.llmFailed` | `resilientInterpreter.faults()` | how much of the pack came from the rule fallback |
| `calls.{calls, failures, scope}` | `LlmClient.stats` | `V8-call-reliability`, over a stated population |

**`calls.scope` is the honest part of that table.** The episodes' calls happen in the agent process and
arrive as a turn count that τ² does not always report; the distillation calls are this process's own. A
rate over a subset is a rate over a subset, and the alternative — reporting nothing — is how a run whose
every distillation prompt was refused reached a reader as a store that had nothing to say. `V8` now fires
on the subset, and the artefact says which subset it is.

**And the ledger gate requires a population.** `V44-domain-accounted` read
`storedWithoutDomain <= unscopedIn + widenedIn`, which is satisfied by an empty store, and it is
**blocking**. The criterion now includes the population — `stored > 0 &&` — and the `actual` string says
`the store holds no item, so there is no ledger to account for` when there is nothing to reconcile. This
is the third form of the same vacuity this document has recorded (`V6`, `V7`, and now `V44`): an aggregate
check whose aggregate is empty. The first two are *reported* as vacuous by the lane's audit; a shared gate
has no such report, so the floor is in the criterion.

**Interfaces.** No new package edge. `restModelOf` is exported from `eval/model-client.ts`, so a caller can
ask what a name will become without constructing a client; `resilientInterpreter` and `stoppedRun` from
`eval/tau2-distill.ts` and `eval/stopped-run.ts`. The protocol package changes in one place — the `V44`
predicate and its two strings — and every BIRD artefact still validates, because the population term is
satisfied by every store that has anything in it.

### 17.80 Three exhaustive verdicts, and a pass that is not a gap

**Two defects of the same shape, found one day apart.** §17.79 fixed a store that was empty because a
model name was wrong. Reading that round's own artefact for the write-up exposed two more decisions that
were *nearly* right: a status classifier whose last arm could not be taken, and a ledger whose numerator
counted the model's successes as the record's losses. Neither changed a number in R42 — the run was
already dispatched when they were found — and both would have changed the next one.

**A status the provider will repeat is not a prompt that failed.** `LlmClient` had three terminal paths
for a non-ok reply and the third was unreachable:

```
if (status >= 500 || 429)                 -> transient, retry        (reachable)
if (status === 402)                        -> MG_E_CONFIG, no credit  (reachable)
if (!ok)  ... throw MG_E_STORE_IO          (every non-ok status that is not the two above)
```

Every status an HTTP response can carry is either `>= 500`, `429`, `402`, or in `4xx`. The `4xx` arm
therefore *was* the fall-through, and it reached `MG_E_STORE_IO` — the code `stoppedRun` classifies as
**per-prompt**, which is exactly wrong for a request the provider will refuse identically next time. The
repair is not a fourth branch; it is to decide once, in three cases that between them cover the domain:

| status | verdict | what the client does | code |
|---|---|---|---|
| `5xx`, `408`, `409`, `425`, `429` | `transient` | retries after the back-off, counts nothing | — |
| `402` | `unpaid` | stops: sending again cannot help, and neither can sending something else | `MG_E_CONFIG` |
| every other `4xx` | `refusal` | stops, naming the status, the model and the body | `MG_E_CONFIG` |

`verdictOf` returns one of three strings and the loop switches on it, which means the compiler can see
that the cases are exhaustive and the coverage report has nothing to be told to ignore. The distinction
the third case draws is the one R41 needed: `MG_E_CONFIG` is in `stoppedRun`, so thirty-two refused
distillation prompts end the **run** at the point of the fault instead of being absorbed one at a time as
prompts that came back empty. `MG_E_STORE_IO` still exists and still means one prompt that failed after
every attempt was spent — the case a caller's `try` is for.

**A pass is not a question the record lost.** `V32-fold-learning-intact` asks how many learning questions
went unanswered: `unansweredShare <= 0.1`, blocking. The τ² driver answered it with
`train.length - corrections.length`, and on a training half where the model solves a third of the tasks
that arithmetic reports 33% unanswered for a store built from **every single failure**. The gate would
fail on an arm whose treatment is exactly the one it was registered as, and the failure would describe the
model's skill rather than the store's provenance.

The gate's own words separate the three cases, and the τ² lane is the first one where all three occur:

| what happened to the task | correction | counts as unanswered? |
|---|---|---|
| the model passed it | none — nothing went wrong | **no**: the store the fold paid for is the failures |
| it failed, and the criteria name the calls that should have happened | one | no |
| it failed, and the criteria are empty | none | **yes**: the question the record lost |
| it was never scored | none | **yes**: a missing measurement is not a pass |

`teachingOf` is now the single place that decides whether a task teaches, and the two callers read it in
opposite directions: `learnableCorrections` keeps the ones that teach, `unansweredTasks` keeps the ones
that do not teach *and* were not passes. Two copies of one decision drift; R41 is what drift looks like
from a distance, because the arm that round measured had an empty store — `unanswered` and `corrections`
were both maximal, and the arithmetic looked right for the wrong reason. The driver's log line now states
both numbers side by side, `N correction(s) from M task(s), K unreadable`, because together they are the
population `V32` grades.

**Interfaces.** `unansweredTasks(tasks, rewards, threshold?)` is exported from `eval/tau2.ts` and
re-exported from the package index; `teachingOf` and `verdictOf` are file-local, since neither is a
question another lane asks. No new package edge, no artefact field, no change to any gate's criterion.

### 17.81 The requirement was published and the supply was not

**A number that answers half a question.** `resolutionOf` reports `tasksForFivePp`: how many paired
tasks a 5pp half-width would take at the discordance the pair observed. R41's pair observed nine
discordant tasks in fifty, so the answer is **277**. A reader of that number still cannot tell whether
another dispatch would help, because the other half of the comparison — how many tasks the scenario
has — was nowhere in the artefact. The split is what the run was scored on; the scenario's size is
what it was drawn from, and a dispatch cap makes the two indistinguishable.

**The field, and where it comes from.** The driver lists every task in both scenarios before it draws a
split, so the listing is already paid for. `scenarioTasks: { learn, test }` records it, `Tau2ArmRecord`
carries it, and the pair publishes:

```
ceiling = ceilingOf(comparison, scenarioTasks.test)
  tasks           the scenario's whole task set
  halfWidthPp     1.96 x SE at that sample
  mde80Pp         2.802 x SE at that sample      (what V5 grades)
  resolvesFivePp  halfWidthPp <= 5
```

**Two multipliers, because the record has always quoted the wrong one on its own.** The 95% interval
uses `1.96`; the 80%-power minimum detectable difference the protocol grades uses `2.802`. They differ
by a factor of 1.43, and a lane that publishes the first while grading the second reports a 12pp
half-width and fails a 17pp bar — the same defect `l4-resolution` had when it was advisory, one layer
down. `ceilingOf` returns both, so the two cannot be read apart.

**What the number says about τ², in one table.** Holding the discordance rate at R41's 18%:

| paired tasks | 95% half-width | 80%-power MDE | what it is |
|---|---|---|---|
| 50 | 11.76pp | 16.81pp | R41's and R42's evaluation sample (a cap) |
| 57 | 11.01pp | 15.75pp | the largest half a 115-task scenario affords at a 50/50 split |
| **115** | **7.75pp** | **11.09pp** | **every task τ²-retail has** |
| 277 | 5.00pp | 7.14pp | the interval requirement |
| 566 | 3.50pp | 5.00pp | the *detectable-difference* requirement |

The requirement and the supply do not meet, and the gap is not close: a 5pp effect needs five times
the tasks the scenario contains. That converts "R41 was underpowered" — which invites another
dispatch — into "no split of τ²-retail can decide an effect below 11pp", which is a property of the
benchmark. The same arithmetic applies to τ²-airline, which has 50 tasks and therefore a floor of
16.81pp at any sample.

**Why this is an artefact field rather than a paragraph.** A prose ceiling survives only if its reader
happens to know that retail carries 115 tasks; the field is recomputed from the arms on every pairing
and moves when the discordance does. It is absent on every artefact written before it existed, and the
pair then states no ceiling rather than one built from a guess — the same rule `V44` learned about
populations, applied to a bound.

### 17.82 The host owns the key, and a rate travels with its population

**Two defects with one shape: a value taken from the party that does not own it.** §17.79 fixed a model
name; §17.80 fixed a status classifier and a numerator. R42's artefacts then showed the same shape twice
more, one layer closer to the measurement — a store of fourteen items whose every claim carried a domain
the recall path never asks in, and a learner that could read one of the two rubric forms τ² writes.

**The scope key.** `KnowledgeScope` has five fields, and recall filters on two of them:

```
MemoryStore.search(query)
  candidates = lexical(q.text)                      // BM25 over stored statements
  if query.scope: for each item with status 'active',
                   item.scope.task === query.task, scopeMatches(item.scope, query)
                     -> add to candidates
  scored = candidates.filter(active && scopeMatches)  // scopeMatches compares domain equality
```

`task` is taken from the event, which is the host's own value. `domain` came from the model's JSON
through `parseScope`, whose only guarantee is that the string is 1..80 characters. A model that answers
`Retail (US)` for a run the host calls `retail` has written a claim that is stored, active, counted by
`V44` (it *has* a domain), and unreachable — the write side succeeded and the read side can never ask for
it.

`stampDomain(interpreter, domain)` overrides `scope.domain` on every candidate the interpreter returns.
An override rather than a default: filling in only when absent would leave the model in charge of the key
whenever it felt confident, which is the case that fails. It wraps the composite, so the rule fallback is
stamped too — a store half-keyed by the model and half by nobody would be worse than either.

**The reader.** τ² writes its labels in two forms, and §17.83 counts which scenario uses which. This
section's first printing of that table had the two rows swapped, which is the defect §34.17 records: the
shape below is the corpus at v0.2.0, not an inference from a run.

| domain | tasks | names calls | states prose | same as before R43 | `taskCorrection` after |
|---|---|---|---|---|---|
| `retail` | 114 | **112** | 8 | calls alone read fine | unchanged for 112, prose for 8 |
| `airline` | 50 | 43 | **50** | calls alone read fine | calls preferred, prose for 7 |

So the reader's fallback was not a repair for a scenario that states no calls — retail is the scenario that
states calls — it was a repair for the tasks that state prose and no calls: seven, all of them in `airline`.
(The 8 retail tasks that state prose also name calls, so a reader that only read calls lost nothing there;
it lost the prose, which is what the distiller can use.)
What made it look like a retail problem is recorded honestly in §34.17: the number that motivated it (25 of
32 training failures teaching nothing) came from an arithmetic that counted passes as gaps, and the corpus
cannot produce that number — only 2 of 114 retail tasks state neither form.

The fallback is not a weaker copy of the first form, and the distinction survives the correction. An order
of tool names with arguments can be followed without interpretation; a statement of the end state has to be
turned into a procedure by the distiller, which is exactly the work the interpreter exists to do. What both
share is that they say what *should have happened* rather than that something went wrong, which is the only
thing a correction can be learned from.

**A rate and its population.** `meanPackIds` is the mean of `servedPackSizes`, so it is `0` when the agent
never asked and `0` when it asked two hundred times and was served nothing. The arm record gained two
fields, and `V1`'s sentence gained a clause:

```
store:  { stored, active, servable, statuses: { active, candidate, quarantined, retired, other } }
recall: { requests, served, empty }

V1 actual (population recorded):
  0.00 rules/question: 0 of 200 request(s) carried an item, from a store of 14 (14 active, 14 in scope)
V1 actual (no request):
  0.00 rules/question: the store held 14 item(s), 14 of them active, and the agent made no recall request
V1 actual (no population recorded, every artefact before R43):
  0.00 rules/question
```

`servable` is defined the way `search` defines reachability — `active` **and** the recall scope's domain —
rather than by a census of its own. A census with its own definition could agree with a broken retrieval
path; this one cannot.

**Why the population is not its own gate.** It grades nothing: a store of fourteen items that serves one
per question and a store of fourteen that serves nothing are separated by `V1` already. What the census
adds is the *layer* — asked / active / servable / served — and a gate that fired on it would be a gate
that fails whenever the instrument is being debugged, which is the round when a reader needs it most.

**Interfaces.** `stampDomain(interpreter, domain): Interpreter` and `storeCensus(items, recallDomain):
StoreCensus` are exported from `@agentix-e/microglia-eval`; `Tau2Raw`/`Tau2ArmRecord` carry `store?` and
`recall?`; `ProtocolGateInput.packPopulation?` is supplied by the τ² projection under the same `supplied`
field as `meanPackIds`, so the gate index in the pair report does not move (13 supplyable, 26
arm-indexed). `TauTask.assertions` is parsed from `evaluation_criteria.nl_assertions`.

### 17.83 The corpus is measured, not recalled

**Why this exists.** Two sentences in this document about τ²'s labels were derived from a run's counters
and were wrong in a way a reader could not detect: they described one scenario's label shape and named the
other. The corpus is the part of the experiment this repository does not control, and a claim about it is
either read out of the file at the pinned ref or it is a recollection. So it is now a module with tests, a
CLI, and a step in the L4 job that runs before either arm.

**What the pinned ref establishes, in three facts.** All three are in `sierra-research/tau2-bench` at
v0.2.0, and none is a matter of interpretation:

| fact | where | consequence |
|---|---|---|
| `EvaluationCriteria.reward_basis` defaults to `[DB, COMMUNICATE]` | `src/tau2/data_model/tasks.py` (`default_factory`) | a task that declares nothing is graded on the database and on the required strings |
| the reward is the product of the components named in that basis | `src/tau2/evaluator/evaluator.py:92-118` | `NL_ASSERTION` and `ACTION` are components like any other: absent from the basis means not graded |
| `actions` is replayed onto a fresh environment and the DB hashes compared | `src/tau2/evaluator/evaluator_env.py:93-111` | the call list is the definition of the target end state, not a trajectory the agent must walk |

The third is the one that corrected this repository's own description of its own instrument. The first
printing of the census said the reward "does not read" the shipped call lists; it reads them every time, as
the recipe for the gold state. What is *not* graded is the agent walking that path — and, separately, the
prose: `nl_assertions` gates only under `NL_ASSERTION`, which no task in either scenario declares, so 58
tasks' worth of prose rubric is commentary on a graded outcome rather than a graded requirement.

**The measurement.**

| corpus | tasks | names calls | states prose | both | states neither | declares a basis | graded on `ACTION` | graded on `NL_ASSERTION` |
|---|---|---|---|---|---|---|---|---|
| `retail` | 114 | 112 (98.2%) | 8 (7.0%) | 8 | 2 (1.8%) | 0 | 0 | 0 |
| `airline` | 50 | 43 (86.0%) | 50 (100%) | 43 | 0 | 0 | 0 | 0 |

Two numbers are worth reading twice. `states neither` is the ceiling on how much of a run's `unanswered`
the corpus can explain: 2 of 114 and 0 of 50, so a rate of twenty-five of thirty-two is not a corpus fact
and has to be explained by the run (§34.17). And `declares a basis` is zero in both files, which is what
makes the last two columns zero: the shipped grade is a DB hash compared to a replayed target, times a
substring match on `communicate_info`.

**The consequences, stated as work rather than as commentary.** For a learner, the reference calls are a
target state written as a path. `taskCorrection` transmits the path — "resolved by calling X, then Y, in
that order" — which is a stronger claim than the grade makes. Whether that over-specification helps or
costs is measurable and is not yet measured: it is the R44 question. For the prose, the lesson distilled
from an `nl_assertion` is a claim about a label nobody scores, which is admissible only because the store's
job is to make the next episode go better, not to reproduce the rubric.

**Interfaces.** `labelCensus(tasks): LabelCensus` and `readLabelCensusTasks(document): LabelCensusTask[]`
are exported from `@agentix-e/microglia-eval`; `UPSTREAM_DEFAULT_BASIS` carries the default the census
resolves silence to. The fields are positive counts — `pathScored`, `rubricGraded` — rather than a negation,
because "how many are graded on this label" is the question a reader has, and a field named for what is not
graded invites exactly the sentence that had to be withdrawn. `pnpm eval:label-census --corpus name=path …`
reads either shipped form (a bare task list, or a result document's `tasks`) and is run by the L4 job
against the environment it cloned, writing `eval/results/tau2-label-census.{json,md}` into the evidence
bundle and the table into the job summary.

### 17.84 The store admitted nothing, and one word covered three decisions

**The layer R43 opened.** With the keys fixed (§17.82) and the reader fixed (§17.80), the same arm reports
`learning.unanswered = 0`, `V32` passing, and a store of 24 items — and still `store.active = 0`,
`recall.served = 0` over 1,518 requests. Nothing the recall path can see exists, so the façade is correct to
return nothing and `V1` is correct to fail. The remaining question is why 24 items are not active, and the
record could not answer it: `statuses.candidate` is what three different decisions write.

| decision (`kernel/knowledge.ts`, `decideStatus`) | condition | reason written |
|---|---|---|
| prose needs corroboration | `tier === 'user-text' && distinctTasks < 2` | `needs-corroboration` |
| confidence | `confidence < activationThreshold` (0.6) | `insufficient-evidence` |
| support | `support < minSupport` (0.8) | `insufficient-evidence` |

Three repairs, one word for two of them. `storeCensus` therefore carries `reasons` — a histogram of
`statusReason` over the store — and the driver prints it ranked on the single line it writes about its own
store. The next dispatch reads its hypothesis back instead of inferring it, which is the difference between
a round and a guess.

**What was excluded before the dispatch, and how.** With no transcript of a failed episode, the driver
states the completion as the reference call *names* and the edit as those names *with their arguments*;
`trustFor('edit')` derives trust from how far the edit moved the completion (`0.5 + 0.4 × distance/0.3`), and
`minSupport` is 0.8. That is a plausible mechanism, and it is false: measured in three conditions — the
driver's own shape, a rubric-only correction, and a call correction against a completion that names a
different call — all three activate at 0.9. The test is committed as a guard, because a hypothesis that was
excluded by measurement is a hypothesis the next round may not re-assert.

**The record, again.** The pair report printed `V1`'s pre-R43 sentence — `0.00 rules/question`, no
population — while the memory arm's file held `24 / 0 / 0` and `1,518 / 0`. `tau2ArmRecordOf` is the
mapping from an arm's artefact to the record the projection reads, and it did not name `store` or `recall`:
a field that is present in the file and absent from the record is invisible to every consumer downstream of
the record, which is all of them. Both blocks travel now, with two tests — one on the mapping, one on the
sentence `V1` must print for an arm whose record has a census. This is the second round in a row where the
instrument was right and its plumbing was not.

**Interfaces.** `storeCensus(items, recallDomain): StoreCensus` returns `reasons` beside `statuses`;
`CensusItem` gains an optional `statusReason`; `Tau2ArmArtefact.tau2` gains `store?`/`recall?` and
`tau2ArmRecordOf` forwards both. The driver's learn line ends with `reasons <key>=<count>, …` ranked by
count, or `none recorded` when the store wrote none.

### 17.85 The admission input, and the hook that was already in the architecture

**R44's reading.** `insufficient-evidence=19` on a store of 19, `0 active`, `0 servable`,
`1,427 / 0` recall, and `meanPackIds = 0.00`. The reason distinguishes the three candidate branches
but not the two halves of the branch that fired, so the next step was to reproduce the decision rather
than dispatch a fifth instrument. The reproduction ran on the real retail corpus (the same 328,166
bytes and sha256 `76e1fa64…` the label census recorded) through the real kernel, with no model call:
32 learn tasks, 31 candidates, `distance` 0.1707–0.3333, `trust` 0.5000–0.9000, mean 0.7695,
`confidence` 0.2713–0.6165, mean 0.4613.

**The mechanism, in one paragraph.** The driver writes `complete()` as the reference call *names* and
`edit()` as those names *with their arguments* (`correctionEdit`). `editDistance` is
`ops / (leaves(before) + leaves(after))`; with 5–12 actions and 1–5 arguments each, the added leaves
dominate the denominator and the distance falls with the *number of tool arguments*, not with the
quality of the observation. `trustFor('edit')` maps that to `0.5 + 0.4 × clamp01(distance / 0.3)`.
`createLlmInterpreter` then copies `trust` into both `candidate.trust` and
`candidate.evidence.weight`, and `scoreKnowledge` adds `weight × logit(trust)` — so same quantity
enters twice and the penalty is quadratic. `support` clears `minSupport` (0.8) at `trust = 0.8`, but
`confidence` there is 0.4806; the activation boundary is `trust = 0.89` (`confidence = 0.6013`). This
is why the reason histogram said `insufficient-evidence` for all 19 items and why lowering
`minSupport` cannot repair it.

**The five-condition ablation** (32 real tasks, real kernel, only the named input changed):

| condition | active / 32 | mean confidence | reading |
|---|---|---|---|
| A current structural distance | 1 | 0.4613 | the defect |
| B gold-verified semantic distance = 1.0 | 32 | 0.6165 | repair, no threshold touched |
| C `activationThreshold` 0.6 → 0.45 | 17 | 0.4613 | admits weak evidence; wrong lever |
| D `minSupport` 0.8 → 0.5 | 1 | 0.4613 | no change; support never the block |
| E `singleObservationTrust` → 0.99 | 1 | 0.4613 | no change; contradiction path only |

**Design of the repair.** `packages/eval/src/tau2-admission.ts` owns one exported function,
`tau2EditSemantics(before, after): number | undefined`, and one pure predicate that recognises the
`correctionEdit` shape (`actions` array, each entry with `name` and `arguments`). It returns `1` only
for a gold-verified correction and `undefined` otherwise, so a host event of any other shape falls
back to the structural distance instead of being promoted by accident. `tau2-driver.ts` passes it as
`editSemantics` to `openMicroglia`, which forwards it to `buildFeedbackEvent`, which uses it in place
of `editDistance` in `toSignal`. Nothing in `packages/core` changes: the hook exists precisely because
domain packs know what their own edits mean, and the chart pack already uses it. The dependency
direction is unchanged — `eval` depends on `core`, `core` does not depend on `eval`.

**Why `1` is a semantic claim and not a constant to hide a threshold.** `evaluation_criteria.actions`
is the state the upstream evaluator requires; a failing episode is scored against it by the benchmark,
not judged by a reviewer. The observation's strength is the verification, so the edit is a full
replacement of an unverified output by a verified one. A structural diff reads "arguments were added"
and makes trust a function of a tool's arity. The alternative — leaving `trustFor` alone and lowering
`activationThreshold` — is measured in condition C and rejected: it admits 17 of 32 items whose
`confidence` is still 0.4613 on average.

**Instrumentation for the dispatch that verifies it.** `storeCensus` gains an `admission` block:
`trust`, `support` and `confidence` as min / max / mean plus a histogram of `statusReason` at item
level, and the count of items whose `support ≥ 0.8` but `confidence < 0.6`. `CensusItem` gains
optional `trust`, `support`, `confidence`. The driver prints the three means on its learn line. R45
then tests the claim in the real pipeline: `active > 0`, `servable > 0`, `recall.served > 0`,
`meanPackIds > 0`, and the admission means at 0.9 / 0.9 / 0.6165. A served pack with a significantly
negative `l4-paired` is reverted on the reading, not explained.

**TDD and acceptance.** The failing test comes first: a corpus-shaped test that asserts the 32-task
learn split does **not** hold 31 items as candidates, and that a non-`correctionEdit` event is not
promoted. Then the implementation. Then `pnpm check`, coverage on all four dimensions ≥ 95% (goal
100%), no mocks, and `ci.yml` green before dispatch. `prereg/R45-admission.md` registers the
predictions and the revert rule in advance.

### 17.86 R45 shipped, and the dependency order of everything still open

**State at dispatch.** `pnpm check` exit 0; 2,921 tests across 139 files; coverage
99.98 / 100 / 99.67 / 99.98. Commits `b88623e` (the repair), `bd456c3` (the
coupling snapshot) pushed as `c65468f0` and `26f7c3f0`. CI run `42129954733`
failed on the missing snapshot and `42130978881` is green after it; `AUDIT`
§34.20 carries the defect. R45 run `42131391874` is dispatched on `26f7c3f0`,
`prereg=R45-admission`, both arms, about 1 h 20 min. No result is claimed until
its readback.

**The remaining work, with its dependency order and why each waits.** Ten items,
in the order the evidence permits:

1. **R45 readback** — `store.active`, `store.servable`, `recall.served`,
   `meanPackIds`, `V1`, the admission means and `l4-paired`. Blocks everything
   below that concerns an effect rather than an instrument.
2. **The revert rule** — if a served pack makes `l4-paired` significantly
   negative or below −5pp, the repair is reverted on the reading. No explanation
   is allowed to keep a treatment that costs accuracy.
3. **R46 candidate: ablate the admission rule itself** — float evidence weight
   against distinct-task count, and `minSupport` alone against a `sup3`-style
   corroboration floor (IBM's 45.0% airline core). Three arms, one store, one
   pre-registration, `l4-paired` as the dependent variable. **Blocked on (1)**:
   all three are unmeasurable with zero served items.
4. **Transcript-level `V46`/`V47`** — the BIRD lane's gates are closed (R22/R23),
   but the τ² driver does not hand its trajectory to the gate layer. `parseTauResults`
   reads only `task_id` and reward; the upstream `simulations[].messages` carry the
   tool calls. **Blocked on (1)** for the same reason, and on a driver change that
   must not move R45's pinned head.
5. **S1a / S1b** — S1a (public ambiguity labels) is testable independently;
   S1b needs the private vocabulary set and is a product decision, not a gate.
6. **`sota.ts` split on the signature cut rule** — stage 3 of R27, mechanical,
   "changes no number". 2,243 lines; acceptance is that all four coverage
   dimensions do not regress and `pnpm eval:protocol` re-validates the 31
   committed artefacts. Safe to parallelise with (1), but deliberately deferred
   until the readback so a mechanical move cannot be confused with a result.
7. **`eval-sql` package** — moving the eight SQL modules is the other half of
   stage 3; same acceptance bar, same deferral.
8. **vitest 4 migration (W2)** — vite 7 is already in the toolchain, but the
   migration changes coverage semantics. Deliberately last: a coverage-number
   change in the same round as an effect measurement would make two explanations
   indistinguishable.
9. **Dose curve (W8 follow-up)** — three pack sizes, one store, powered to find
   where the ~1.7pp-per-rule cost crosses zero. Needs a served pack, so blocked
   on (1).
10. **cortex release dependency (W1)** — explicitly **excluded** from this
    programme; the adapter carries a structural copy until `@agentix-e/cortex-*`
    publishes.

**Priority table.**

| priority | item | trigger | acceptance |
|---|---|---|---|
| P0 | R45 readback + revert rule | run `42131391874` completes | `served > 0`, or a named next defect; revert on a negative effect |
| P0 | CI green on every head | every push | `ci.yml` success, four coverage dimensions ≥ 95% |
| P1 | R46 admission-rule ablation | `served > 0` | three arms, pre-registered, no threshold changed silently |
| P1 | transcript-level V46/V47 | driver hands over `simulations[].messages` | gates read the prompts that were sent |
| P2 | `sota.ts` / `eval-sql` split | any time after the readback | coverage does not regress, 31 artefacts re-validate |
| P2 | dose curve | served pack + power calculation | interval on the crossing point |
| P3 | S1b, vitest 4, W1 | product decision / deliberate migration / cortex release | each has its own registered bar |

**Why nothing above was dispatched simultaneously.** A dispatch is pinned to a
head. Starting a second workflow while R45 is measuring would either reuse the
same artefact name (`poc-sota-bird-R45-admission.json`) or require a new head, and
either way the readback would no longer name the treatment it measured. Parallel
work this round was therefore confined to source study (`COMPETITIVE` L.6),
documentation and offline measurement — all of which change no number the run
will report.

### 17.87 The source study sharpens R46, without opening it

**State.** R45 run `42131391874` is in progress on `26f7c3f0`; `ci.yml`
`42130978881` is green; both repositories are pushed as Lambertyan. While the
L4 job ran, two 2026 papers and their implementations were read at first hand
(`COMPETITIVE` L.7): MemGuard ([arXiv:2608.21867](https://arxiv.org/abs/2608.21867),
code `whyyyyy123/MemGuard`) and MemAdapter
([arXiv:2610.05162](https://arxiv.org/abs/2610.05162), code
`DEEP-JLU/MemAdapter`). No source file, artefact, workflow or head in
`microglia` was touched. This section records what that reading changes about
the *design* of the next round; it does not open R46, and R46 remains blocked
on a served pack.

**The finding that matters.** Three independent implementations now use
corroboration across **distinct source tasks** as the selection variable:
ALTK-Evolve's `support` / `core_support = 3` (`COMPETITIVE` L.6), MemGuard's
`len(distinct_task_ids) >= 2` in `memory/governance.py:205`, and IBM's own
14-rule `sup3` core at 45.0% against 101 lossless rules at 40.0% on airline.
microglia's `minSupport = 0.8` is support on a *single item's observations*, and
R44's five-condition ablation measured that support was never the blocker.
MemAdapter adds the complementary half: even an objectively correct memory can
harm, because influence must be calibrated to the current context at use time —
so "what is stored" and "how it is used" are two separate levers, not one.

**R46 skeleton, registered but not opened. Twelve items.**

1. **Trigger.** R45 readback reports `recall.served > 0` and `meanPackIds > 0`.
   With zero served items, all three arms are the same untreated condition and
   the round cannot be run.
2. **Pre-registration first.** `prereg/R46-admission-rule.md`, with a
   `## Refutation` section (the protocol validator rejects a missing one, as
   R45's first `pnpm check` established), declared gates, a named dependent
   variable and a revert rule. No result is written before the registration is
   committed.
3. **Three arms, one store, one dispatch.** All arms reuse R45's corrected
   evidence input; only the *selection rule* differs.
4. **Arm A — `as-is`.** R45's shipped rule: `evidence.weight × trust` with
   `trust = 0.9` from `tau2EditSemantics`, `minSupport 0.8`,
   `activationThreshold 0.6`. This is the control, not a new treatment.
5. **Arm B — distinct-task support.** Replace the per-item observation support
   with a count of distinct learn tasks whose gold-verified correction produced
   the same normalised rule; apply a `sup3`-style floor (≥ 3 distinct tasks) on
   top of the confidence gate. ALTK-Evolve's `export.py` is the reference for
   the counting unit, MemGuard's `governance.py:204–205` for the floor.
6. **Arm C — `minSupport`-only.** Drop the confidence gate and keep only the
   corroboration floor, so the ablation separates "confidence about one item"
   from "corroboration across items". This is the arm that tests whether R44's
   `insufficient-evidence` diagnosis generalises once items are active.
7. **Census extension.** `storeCensus` gains an arm-tagged, item-level
   `distinctTaskSupport` count and retains R45's `admission` block, so every arm
   reports its own population rather than one shared histogram.
8. **Injection-side control.** Following MemGuard's
   `is_injection_eligible` (`retrieval.py:350–363`) and MemAdapter's per-context
   calibration, record — but do not yet change — the number of items that pass
   a second gate at `/v1/recall`. Changing injection semantics is a separate
   round, so a rule effect cannot be confused with a use effect.
9. **Power, stated before the numbers.** R44 measured a minimum detectable
   difference of **19.41pp** at 50 paired tasks. A 5pp effect is not decidable
   in one dispatch of this lane, so R46 registers replication (or a larger n)
   rather than a single significant-looking pair. `V5` is expected to fail and
   no bar moves.
10. **Dependency layering.** The change is confined to `packages/eval`:
    `src/tau2-admission.ts` (arm definitions and support counting),
    `src/bin/tau2-driver.ts` (arm wiring and census printing), `src/index.ts`
    (exports), `src/__tests__/` (TDD), `prereg/`, and `eval/results/`.
    `packages/core` is **not** touched. `.github/workflows/sota.yml` and its
    dispatch inputs are **not** changed. The `l4-pair` artefact schema gains
    fields only, so R45's committed artefacts still validate.
11. **TDD and acceptance.** The failing test comes first and is corpus-shaped:
    a 32-task learn split where two tasks yield the same rule must report
    `distinctTaskSupport = 2`, and a single-task rule must report `1`. No mocks,
    no untyped values, no skipped tests, no placeholder markers, no CJK in
    comments or docs. `pnpm check`
    exit 0, ≥ 95% on every coverage dimension (goal 100%), `ci.yml` green before
    dispatch, both repositories pushed as Lambertyan.
12. **Revert rule.** If any arm's `l4-paired` is significantly negative or below
    −5pp with a served pack, revert on the reading, not on an explanation — the
    same rule R45 carries.

**The type shape the arm tables will consume** (design only; nothing is
implemented before the readback):

```ts
// packages/eval/src/tau2-admission.ts — R46 candidate, NOT opened
export type AdmissionRule = 'as-is' | 'distinct-task-support' | 'min-support-only';

export type ArmAdmission = {
  readonly rule: AdmissionRule;
  readonly itemCount: number;
  readonly distinctTaskSupport: Readonly<Record<string, number>>;
  readonly admitted: number;
  readonly served: number;
  readonly meanPackIds: number;
};
```

**Priority table.**

| priority | item | trigger | acceptance |
|---|---|---|---|
| P0 | R45 readback + revert rule | run `42131391874` completes | `served > 0`, or a named next defect; revert on a negative effect |
| P0 | CI green on every head | every push | `ci.yml` success, four coverage dimensions ≥ 95% |
| P1 | R46 pre-registration | `served > 0` | `## Refutation` present, gates declared, no threshold changed silently |
| P1 | Arms A/B/C + distinct-task census | registration committed | one store, three rule columns, `distinctTaskSupport` per item |
| P1 | transcript-level V46/V47 | driver hands over `simulations[].messages` | gates read the prompts that were sent |
| P2 | injection-side second gate | R46 readback | recorded first, changed in a separate round |
| P2 | `sota.ts` / `eval-sql` split | any time after the readback | coverage does not regress, 31 artefacts re-validate |
| P2 | dose curve | served pack + power calculation | interval on the crossing point |
| P3 | S1b, vitest 4, W1 | product decision / deliberate migration / cortex release | each has its own registered bar |

**What this round deliberately did not do.** It did not change a threshold, add
an arm, split a package, migrate a test runner, or dispatch a second workflow.
Each of those would either move a number R45 is measuring or make two
explanations of the readback indistinguishable. The ten-item order in §17.86 is
unchanged; only the content of item 3 is now specified.

### 17.88 An offline support census, and a threshold that must not be fixed before it is measured

**Why.** §17.87 registered R46's arm B with a `sup3`-style floor of ≥ 3 distinct
supporting tasks, copied from IBM's airline core. That threshold was copied, not
measured on this corpus. Before another 80-minute dispatch is spent, the
population it would select can be counted offline, with no model call, no mock
and no change to R45's pinned head.

**Corpus.** `eval/fixtures/tau2-retail-learn-actions.json`, sha256
`b5e49bb7…`, 28,749 bytes, 32 tasks — the first 32 ids in lexical order, the
exact learn split R44's memory arm read — extracted verbatim from τ²-bench
v0.2.0 retail `tasks.json`, source sha256 `76e1fa64…`, 328,166 bytes. Action
count per task 0–12, mean 5.03; one task (`24`) carries no action.

**Four definitions of "the same rule", measured on the same 32 tasks.**

| normalisation | distinct groups | support = 1 | groups with support ≥ 2 | groups with support ≥ 3 | tasks inside ≥ 2 groups |
|---|---|---|---|---|---|
| full action sequence with argument values | 32 | 32 | 0 | 0 | 0 |
| action names only | 26 | 21 | 5 | 1 | 11 |
| action name + argument-key skeleton | 26 | 21 | 5 | 1 | 11 |
| unordered tool set (loosest) | 21 | 13 | 8 | 3 | 19 |

The strictest definition makes every task unique. At sequence/skeleton level 21
of 26 groups appear once, four appear twice and one appears three times (the
`find_user_id_by_email → get_user_details → get_order_details ×2 →
return_delivered_order_items ×2` shape). Only the unordered tool set, which
discards both order and arguments, yields three groups at ≥ 3.

**What this does and does not settle.** It settles that, on observable actions,
a ≥ 3 distinct-task floor selects **zero rules** under the strict definition and
**one group covering three tasks** under the sequence/skeleton definition. It
does **not** settle the level R46 actually needs: the driver's rules are
LLM-distilled statements, and a distiller may abstract two different action
sequences into the same statement. That distribution cannot be measured without
a model call, so it is not guessed here, and no claim about the sign of an
effect is made.

**The defect this found.** §17.87 wrote a fixed `>= 3` floor into a candidate
design before measuring that any item can reach it. On the only definition
available offline the arm would have had almost no population, and the dispatch
would have reported a null that looks like a result. This is the same class of
defect as R43's `handle.edit` no-op rejection: a plausible mechanism that a real
measurement would have refused. `AUDIT` §34.22 carries it.

**Three corrections to the R46 skeleton** (design only; R46 is still not
opened, and none of these changes R45's pinned head):

1. **P0 prerequisite — a support census on real distilled items.** Before any
   R46 dispatch, run the real distiller once on the pinned learn split and emit
   the distribution of distinct-task support over the statements it produces.
   The artefact, not this paragraph, decides whether a floor is reachable.
2. **Register the floor from that census, never from the readback.** The
   pre-registration fixes the threshold computed by the census and attaches the
   histogram; a threshold chosen after seeing `l4-paired` is not admissible.
   MemGuard's `>= 2` (`governance.py:205`) is registered as a **separate
   contrast arm**, not as a post-hoc fallback, so the two levers stay separate.
3. **Keep the power statement.** R44's measured MDE is 19.41pp at 50 paired
   tasks. A census that leaves few supported rules makes the interval wider, not
   narrower; R46 still registers replication rather than a single pair.

**Reproduction** — read-only, no model call, no repository change:

```python
import json, collections
d = json.load(open('eval/fixtures/tau2-retail-learn-actions.json'))
tasks = d['tasks']                      # 32 tasks, sha256 b5e49bb7…
def key(t, mode):
    if mode == 'values':
        return tuple((a['name'], tuple(sorted((k, json.dumps(v, sort_keys=True))
                     for k, v in a['arguments'].items()))) for a in t['actions'])
    if mode == 'skeleton':
        return tuple((a['name'], tuple(sorted(a['arguments'].keys()))) for a in t['actions'])
    if mode == 'names':
        return tuple(a['name'] for a in t['actions'])
    return tuple(sorted({a['name'] for a in t['actions']}))   # toolset
for mode in ('values', 'names', 'skeleton', 'toolset'):
    c = collections.Counter(key(t, mode) for t in tasks)
    dist = collections.Counter(c.values())
    print(mode, 'distinct', len(c), 'support-dist', dict(sorted(dist.items())))
```

**Priority table update.** One row is added above the R46 arms; the rest of
§17.87's table is unchanged.

| priority | item | trigger | acceptance |
|---|---|---|---|
| P0 | support census on real distilled statements | R45 readback reports `served > 0` | a committed histogram of distinct-task support; the registered floor is computed from it |
| P1 | `>= 2` contrast arm | support census committed | registered as its own arm, never a fallback after the readback |

### 17.89 The use side is a second lever, and it must be measured before it is changed

**Context.** `COMPETITIVE` L.8 records why IBM's 82.0 cannot be replicated and
why its own airline −5pp reversal is the datum that matters. `AUDIT` §34.23
records the code-level finding: `stampDomain` disables the core's widening
channel, the driver compensates by changing the recall filter's input, and
`minCoverage = 0` makes all 32 active items injection candidates. This section
turns that finding into a registered experiment. It changes no source file
today.

**Twelve-item design.**

1. The registered unit is the **pack**, not the item: the treatment is what is
   injected into one episode, and `meanPackIds` is its size.
2. The control arm is the R45 configuration exactly as dispatched; no threshold
   is touched.
3. The treatment arm changes exactly one thing: the use policy. Three candidate
   forms are registered as separate arms, never as a pooled fix.
4. Arm **U1 — domain-faithful recall**: the filter's domain is the question's
   domain. Prediction: `recall.served = 0` in the transfer configuration. This
   is a *calibration* arm; its purpose is to price the current override, not to
   win.
5. Arm **U2 — widening-enabled**: candidates are no longer stamped with a
   single learn domain, so `generalizationPlan` can produce
   `domain === undefined` items that `scopeMatches` deliberately does not
   filter. Prediction: a strictly positive but small served population.
6. Arm **U3 — coverage-floored injection**: keep the current recall scope, set a
   registered `minCoverage` above zero. This is the only arm that does not
   require a core change.
7. All arms share one store, one split, one model, one trial count and one
   preregistration. Three arms, one store, one preregistration — the same
   discipline as R46's admission-rule ablation.
8. The registered floor for U3 is computed from a census of **real distilled
   statements**, not from the structural proxy in §34.23 and not chosen after
   seeing `l4-paired` (§17.88).
9. Every arm reports `store.active`, `recall.served`, `meanPackIds`, the
   zero-coverage share of injected pairs, `V1` and `l4-paired` with its
   interval, MDE and p-value.
10. A use-side arm is opened only after R45's readback reports `served > 0`;
    at zero served items none of U1–U3 is measurable.
11. `packages/core` is untouched by U1 and U3. U2 changes `packages/eval`
    only if a real test proves that widening is reachable without altering
    `widenedScopeOf` or `sameRuleShape`.
12. The revert rule from `prereg/R45-admission.md` applies unchanged: if a
    served pack makes `l4-paired` significantly negative or below −5pp, revert
    on the reading, not on the explanation.

**Type shape (registered, not yet implemented).**

```ts
// packages/eval/src/tau2-use-census.ts — TDD, real corpus, no mocks.
export type UseCensus = {
  readonly arm: 'as-is' | 'domain-faithful' | 'widening-enabled' | 'coverage-floored';
  readonly recallRequests: number;
  readonly recallServed: number;
  readonly meanPackIds: number;
  readonly injectedPairs: number;
  readonly zeroCoveragePairs: number;
  readonly widenedItems: number;
};
```

**Priority table.** One row is added above the R46 arms; §17.87's table is
unchanged.

| priority | item | trigger | acceptance |
|---|---|---|---|
| P0 | R45 readback | run `42131391874` completes | all six predictions and the revert branch read from the artefact |
| P0 | use census on real distilled statements | `served > 0` | committed histogram; U3 floor computed from it, never after the readout |
| P1 | U3 coverage-floored arm | census committed | one store, one preregistration, paired ledger, `V1` blocking |
| P1 | R46 admission-rule ablation | `served > 0` | three arms, one store, registered `>= 2` contrast |
| P2 | U1 calibration arm | U3 read | reports `served = 0` as a *measurement*, not a failure |
| P2 | U2 widening-enabled arm | a real test proves reachability | no change to `widenedScopeOf` or `sameRuleShape` |
| P3 | transcript V46/V47, S1a/S1b, `sota.ts` split, W8, vitest 4 | in ROADMAP order | unchanged acceptance bar |

**Dependency layering.** `packages/eval/src/bin/tau2-driver.ts` (recall query)
→ `packages/eval/src/tau2-use-census.ts` (instrumentation, new) →
`packages/core/src/apply/pack.ts` (`minCoverage`, read-only) →
`packages/core/src/kernel/knowledge.ts` (`scopeMatches`, read-only) →
`packages/core/src/distill/generalize.ts` (widening, read-only in U1/U3).
`packages/core`, `sota.yml`, the pinned head `26f7c3f0` and the R45
preregistration are untouched. `sota.yml` gains no new input until a use-side
arm is actually opened.

**Acceptance.** TDD: the failing test is written first against the pinned
32-task fixture, using the real `scopeMatches`, `queryCoverage`,
`EmbeddedMemory` and `buildPack`, with no mock and no model call. Coverage
≥ 95% on lines, functions, branches and statements; `pnpm check` exit 0;
`ci.yml` green; both repositories pushed as Lambertyan; no CJK, no untyped
escape hatches, no skipped tests, no placeholder markers in code or docs.

**What this round deliberately did not do.** It did not open U1–U3, change
`stampDomain`, change `RECALL_DOMAIN`, add a `minCoverage` default, split a
package, or dispatch a second workflow. Each would either move a number R45 is
measuring or create two indistinguishable explanations of its readback. The
offline census is a structural measurement; no accuracy claim is made before
run `42131391874` reports.

### 17.90 R45 reported: the instrument ships, the arms stay closed

**The readback.** Run `42131391874` on `26f7c3f0` completed `failure` on three
blocking scientific gates (`V5-resolution` 18.59pp MDE, `V16-transfer-resolvable`
86 < 100 informative, `l4-paired` `+6.00pp [-6, +20] p=0.5488 n=50`). `ci.yml`
on the same head is green. Both arms scored 50 tasks at `k=4`; memory `pass^4
0.42`, reference `0.36`. The red conclusion is a gate refusing to certify an
underpowered measurement, not a build failure.

**The delivery defect is closed.** All six R45 predictions held: `store 21
active / 21 servable`, `candidate 0`, `reasons confidence-cleared=21`,
admission `0.9000 / 0.9000 / 0.6165`, `supportOnly 0`, `recall 1480 / 0`,
`meanPackIds 1.839`, `V1` PASS `1.84 rules/question`, `V32` 0/32, `V8` 0%,
`V5` FAIL as predicted. `tau2EditSemantics` is confirmed on a live dispatch.
The revert rule — significantly negative, or below −5pp with a served pack —
does not fire on `+6.00pp p=0.5488`, so the repair stands.

**The next defect is in what the record can see.** `V44` shows `0 of 21 items
with no domain, 0 unscoped, 0 widened`, with `learn=retail / test=airline /
recall=retail`: 21 retail rules were injected into airline questions on all
1480 requests. The arm record carries `servedPackSizes`, `per_task` and
`per_trial`, but no statement, rule, pack id or injected content — a token census
of the artefact finds zero of each. `V1` grades the pack's size, not its
relevance. So `+6.00pp` cannot separate "underpowered" from "unrelated pack".
§34.23 measured the latter offline on structural proxies (75.88% zero-overlap
cross-domain vs 20.77% within-domain) and refused an accuracy claim; this
round ships the instrument that can measure it on real statements.

**Twelve-item implementation, all observation.**

1. The registered unit stays the **pack**; the new unit is the `(question,
   injected statement)` pair, observed at the `/v1/recall` boundary.
2. `packages/eval/src/tau2-use-census.ts` implements the seven-field
   `UseCensus` from §17.89 **verbatim**: `arm`, `recallRequests`,
   `recallServed`, `meanPackIds`, `injectedPairs`, `zeroCoveragePairs`,
   `widenedItems`. No field is added to the registered shape.
3. A separate `coverageProfile` derives `measuredPairs`, `unmeasurablePairs`,
   `meanCoverage` and `{zero, partial, full}` buckets; a `zeroCoverageShare`
   helper divides the two registered counts. Widening the registered contract
   is refused: U3's floor is computed from the profile, not smuggled into it.
4. Coverage uses the real `queryCoverage` and `tokenize` from
   `@agentix-e/microglia-core/kernel` — the same functions `buildPack` uses for
   `minCoverage`. No new similarity notion, no embedding, no model call.
5. `zeroCoveragePairs` counts every kernel-zero pair, including content-free
   queries; `coverageProfile` reports those separately as `unmeasurablePairs`
   and excludes them from the mean and buckets. The two readings answer
   different questions and neither silently drops a population.
6. `UseObservation` is one recall request: `{ query, statements }`, where
   `statements` are the rendered statements of the items in the served pack.
   An empty pack is an empty array, and a mean over no request is 0.
7. `Tau2Raw` gains optional `useObservations`, `useArm`, `widenedItems`;
   `armRecordFromDriver` calls `useCensus` only when observations exist. Every
   artefact before R46 reports no `use` block — "not measured", never a
   fabricated all-zero census.
8. `Tau2ArmRecord` and `Tau2ArmArtefact.tau2` gain an optional `use`;
   `tau2ArmRecordOf` carries it forward. The gate layer reads the record, so a
   projection that dropped it would restore the silence permanently.
9. The driver collects at the facade: `host.recall`'s arguments, its scope and
   the returned pack are exactly R45's. Only `useObservations.push` is added.
   `widenedItems` comes from the same `withoutDomain` domain ledger `V44` reads.
10. `packages/core` is untouched. `sota.yml` gains no input. No gate changes —
    `V1` still grades size, and nothing grades `use` yet. This is deliberate: a
    new gate before a real-statement census would be a threshold chosen after
    the readout, the exact failure §34.22 caught.
11. TDD: `tau2-use-census.test.ts` (9 tests), three `armRecordFromDriver` tests,
    one `tau2ArmRecordOf` round-trip test. The pinned 32-task fixture, real
    corpora, real kernel; no mocks. Two literal coverage assertions were
    corrected against the kernel before implementation (`'cancel my
    reservation'` is full coverage, `my` being a stopword). Coverage 99.98 /
    100 / 99.68 / 99.98; 2,934 tests in 140 files; `pnpm check` exit 0.
12. U1–U3 and R46's admission-rule arms remain **closed**. U3's floor must be
    computed from a census of real distilled statements, which requires a
    dispatch carrying this instrument. The `as-is` census from that dispatch,
    not R45's `l4-paired`, is the input to the floor.

**Priority table, revised after the readback.**

| priority | item | trigger | acceptance |
|---|---|---|---|
| P0 | R45 readback | met | six predictions + revert rule read from the artefact — **done** |
| P0 | `use` instrument shipped | met | registered shape verbatim, TDD, no number changed — **done** |
| P1 | dispatch carrying `useObservations` | this commit green | artefact reports a real-statement census; `zeroCoverageShare` read before any floor |
| P1 | U3 coverage-floored arm | census committed | floor computed from the real artefact, registered before dispatch, `V1` blocking |
| P1 | R46 admission-rule ablation | `served > 0` (met) | three arms, one store, `>= 2` contrast registered separately |
| P2 | U1 calibration, U2 after a real reachability test | U3 read | U1 reports `served = 0` as a measurement |
| P3 | transcript V46/V47, S1a/S1b, `sota.ts` split, W8, vitest 4 | ROADMAP order | unchanged acceptance bar |

**Dependency layering.** `tau2-driver.ts` (facade, observation only) →
`tau2-use-census.ts` (pure census, new) → `@agentix-e/microglia-core/kernel`
(`queryCoverage`/`tokenize`, read-only). `tau2-instrument.ts` composes the
census into the arm record; `tau2-gates.ts` projects it without grading it.
`packages/core`, `sota.yml`, every gate definition and R45's artefact are
untouched. The coupling ledger was regenerated for the one new module
(`137 → 138`, `37,528 → 37,746` lines) and committed; six result files whose
only diff was timing were restored, not committed (§34.20).

**Ranking.** IBM `gpt-5.5` airline 82.0 remains the SOTA; microglia fifth of
six named entries. A served pack and a non-significant `+6.00pp` move no rank
and are not claimed as accuracy.

### 17.91 R46 as-is: the dispatch that measures without treating

**Why this is a dispatch and not an offline computation.** §17.88 measured the
support distribution offline and §17.89 measured use-side overlap on structural
stand-ins. Neither can supply the distribution of the statements the distiller
actually writes, because those statements are produced by model calls inside a
run. The seven-field `UseCensus` of §17.90 is therefore an instrument waiting
for a run; `prereg/R46-use-census.md` registers that run before it starts. The
artefact of R45 run `42131391874` is not modified and is not re-read for an
effect: its `+6.00pp [-6, +20] p=0.5488 n=50` stays an unmeasured effect with a
served pack.

**Dispatch configuration.** The inputs are R45's verbatim, with one field
renamed so `SOTA_ARTEFACT` does not collide:

```json
{
  "ref": "master",
  "inputs": {
    "prereg": "R46-use-census",
    "l4": "true",
    "bird": "false",
    "probe": "false",
    "l4_arms": "both",
    "l4_train_share": "0.5",
    "adjudicate": "false",
    "split": "minidev"
  }
}
```

`bird=false` keeps the BIRD lane off, both arms share one job and one split, and
`TAU_ENV_READY` remains the only switch that lets the two-hour lane run. The
head dispatched on is the head that carries the prereg file; `ci.yml` on that
head must be green first.

**What is read, and from where.** The evidence artefact's
`eval/results/arms/memory/poc-l4.json` carries `tau2.use`. The reference arm's
artefact cannot: the driver's `!MEMORY` branch returns before the recall facade
exists, so `instrument()` has no observations to reduce. The reading is:

1. `arm` is `as-is`, so the census cannot be mistaken for a later U1–U3 arm.
2. `recallRequests`, `recallServed`, `meanPackIds` reconcile with R45's
   `1480 / 1480 / 1.839` within the registered ten percent band.
3. `injectedPairs` is greater than 1000 and equals the sum of served pack
   sizes; one row per injected statement, nothing silently dropped.
4. `zeroCoveragePairs` and `zeroCoverageShare = zeroCoveragePairs /
   injectedPairs` are read before any floor is discussed. The prediction is
   `share > 0.5`, from §34.23's offline direction (0.7588 cross-domain against
   0.2077 within-domain), and is falsifiable on real statements.
5. `widenedItems` is 0, from the same domain ledger `V44` reads.
6. `coverageProfile` is **not** in the artefact: it is a pure function over
   `UseObservation[]`, and the registered contract is deliberately not widened.
   U3's floor is computed from the committed census, not from a profile that
   would have to be reconstructed after the fact.
7. The V-coded gates are R45's set; `l4-paired`, `V5` and `V16` may again report
   a red conclusion. That is a resolution verdict, not a regression of this
   instrument.

**Dependency layering, unchanged.** `bin/tau2-driver.ts` (facade, observation
only) → `tau2-use-census.ts` (pure census) →
`@agentix-e/microglia-core/kernel` (`queryCoverage` / `tokenize`, read-only).
`tau2-instrument.ts` composes the census into the arm record and `tau2-gates.ts`
projects it without grading it. `packages/core`, `sota.yml`, every gate
definition and R45's artefact are untouched by this registration.

**Acceptance, ten items.** (1) the prereg validates under `pnpm eval:prereg`;
(2) `pnpm eval:protocol` still reports all claims holding; (3) `pnpm check`
exits 0 with coverage at least 95 percent on every dimension; (4) no test reads
a scratchpad path; (5) the six timing-only result files are restored, not
committed; (6) both repositories are pushed as Lambertyan; (7) `ci.yml` on the
dispatch head is read green from the remote; (8) the dispatch returns 204 and
its run id is recorded; (9) the evidence artefact is read back from the remote,
not assumed; (10) U1, U2, U3 and R46's admission-rule arms stay closed until
the census is committed.

**Priority table, unchanged by the registration.**

| priority | item | trigger | acceptance |
|---|---|---|---|
| P0 | R45 readback, instrument, CI drift fix | met | artefact read, shape verbatim, remote CI green — done |
| P1 | `as-is` census dispatch | this head green | real-statement census committed; `zeroCoverageShare` read first |
| P1 | U3 coverage-floored arm | census committed | floor from the artefact, registered before dispatch, `V1` blocking |
| P1 | R46 admission-rule ablation | `served > 0` (met) | three arms, one store, `>= 2` contrast separate |
| P2 | U1, then U2 after a reachability test | U3 read | calibration reported as a measurement |
| P3 | transcript V46/V47, S1a/S1b, split, W8, vitest 4 | ROADMAP order | unchanged bar |

**Ranking.** IBM `gpt-5.5` airline 82.0 remains the SOTA; microglia fifth of
six named entries. An observation round moves no rank.

### 17.92 Five sources read during the as-is dispatch, mapped to the open items

`COMPETITIVE` L.11 reads five 2026 sources on the use side of the negative
effect, one of them with its implementation (`Quark-Medical/memcalib`,
`recipe/memcalib_credit/{judge,metrics,credit,segments}.py`). This section maps
each to an item already registered in §17.90's priority table. **No mapping
opens an arm, changes a threshold, adds a gate or edits a preregistration.**
The `as-is` dispatch is pinned on `cb329054`; a diff on a measuring head is the
one thing §34.21 forbids. Every number below is the source's own, not a
microglia measurement.

| source | what it quantifies | item it informs | action now |
|---|---|---|---|
| MemCalib, [arXiv:2609.24259](https://arxiv.org/abs/2609.24259) | per-atom influence A (Ignore) / B (Bound) / C (Control), over-use 53.33% and under-use 35.82% on the best frontier model, 1,500 test examples | transcript V46/V47, when the driver hands `simulations[].messages` to the gate layer | none; the rubric is a candidate, not a gate |
| MemCalib-RL `credit.py` | eight ordered channels, bidirectional counterfactual credit by exact atom ablation | the paired ledger's unit: one statement, one question, one counterfactual | none; this project has no training loop |
| CMI, [arXiv:2608.07622](https://arxiv.org/abs/2608.07622) | lexical and dense retrieval follow different interference pathways; interference can disrupt downstream use | §17.89's decision to reuse `queryCoverage` / `tokenize` instead of an embedding | none; no new similarity notion is introduced |
| CAMEL, [arXiv:2605.09330](https://arxiv.org/abs/2605.09330) | three spurious patterns from a causal graph; persistence and feedback amplifiers | the `>= 2` distinct-task corroboration contrast of R46's ablation | none; registered separately, still closed |
| Memory Curse | content, not prompt length, is the operative trigger (sanitization control); 18 of 28 combinations degrade | U3's coverage floor is a **content** filter, not a size filter | none; the floor awaits the census |
| PFM, [arXiv:2610.10265](https://arxiv.org/abs/2610.10265) | key assignment is the bottleneck, retrieval is not; 70.3% stale exposure | the three-layer census `active` / `servable` / `served` | none; already shipped in R41–R45 |

**The one design correction these sources support, and the one they do not.**
They support reading U3's floor as a statement about *what the injected text is
about*, which is what `zeroCoveragePairs` and the derived `coverageProfile`
measure, and not as a statement about how many items a pack holds, which is all
`V1` grades. They do **not** support importing MemCalib's LLM Judge, its A/B/C
labels or its RL trainer into this lane: that would require a model call per
atom, a labelled rubric and a training objective, and would change the very
number R46 is measuring. The project's answer stays a pure, model-free census
over the same kernel functions `buildPack` already uses.

**Dependency layering, unchanged.** `bin/tau2-driver.ts` →
`tau2-use-census.ts` → `@agentix-e/microglia-core/kernel`. Nothing in L.11
touches `packages/core`, `sota.yml`, a gate definition, a preregistration or
the pinned head. The reading is recorded before the readback so that a later
design decision cannot be mistaken for something the run itself showed.

### 17.93 R46 read back: the census committed a scalar, so the histogram is now committed too

**Context.** Run `42317807270` (head `cb329054`) returned. `AUDIT` §34.28
carries the full readback. Five of six pre-registered predictions hold; the
sixth — `zeroCoverageShare > 0.5` — is falsified at `1175 / 3016 = 0.3896`.
Every refutation and the R45 revert rule are clear. Both arms scored `pass^4
0.46`, `l4-paired 0.00pp [-10, +10] p=1.0000`, MDE 13.73pp. The P0
prerequisite for U3 in §17.89 was a "committed histogram" from which U3's
`minCoverage` floor is computed **before** its own dispatch. R46 committed no
histogram; it committed one scalar.

**The design gap, measured.** The seven-field `UseCensus` (§17.89) reports
`injectedPairs` and `zeroCoveragePairs`. `coverageProfile` and
`zeroCoverageShare` were exported pure functions with no production caller:
the driver's raw `useObservations` were reduced in-process and discarded. One
scalar cannot determine what a non-zero floor does. A real-kernel offline probe
on the fingerprinted 32-task fixture (`tau2-use-census-queries.json`, sha256
`54f79dbf…`) measures:

| reading | value | what it rules out |
|---|---|---|
| cross / within zero share | 0.7588 / 0.2077 | a proxy is not a distilled statement (§34.22 again) |
| non-zero coverage quantiles (cross) | p10 0.04, p50 0.069, p90 0.143, max 0.333 | the mass is in the left tail; an intuitive floor is unpredictable |
| retained share at `minCoverage = 0.05`, two populations with the identical scalar | 17.63% vs 5.19% (12.44pp apart) | the scalar does not determine the retention curve |
| served population after a binary floor, from R45's 1480 x 1.839 pairs | `[165, 657]`, a 33.24pp-wide interval | the scalar cannot predict `V1` under a floor |

This is §34.22's use-side twin: about to apply a threshold to a population
nobody counted.

**The repair — one new shape, additive and optional.**

```ts
// packages/eval/src/tau2-use-census.ts (TDD, real kernel, no mocks)
export const COVERAGE_FLOORS = [0, 0.01, 0.02, 0.03, 0.05, 0.08, 0.1, 0.15, 0.2, 0.3] as const;

export type CoverageFloorRow = {
  readonly minCoverage: number;
  readonly retainedPairs: number;   // measurable pairs with coverage >= floor
  readonly retainedPacks: number;   // served, measurable packs keeping >= 1 statement
  readonly emptiedPacks: number;    // served, measurable packs a floor would empty
};

export type CoverageHistogram = {
  readonly measuredPairs: number;
  readonly unmeasurablePairs: number;  // content-free query pairs, coverage undefined
  readonly unmeasurablePacks: number;
  readonly nonzeroQuantiles: CoverageQuantiles;
  readonly floors: readonly CoverageFloorRow[];  // one row per COVERAGE_FLOORS entry
};

export function coverageHistogram(observations: readonly UseObservation[]): CoverageHistogram;
```

Design decisions, in priority order:

1. **`COVERAGE_FLOORS` is a fixed measurement ladder, not a chosen floor.** It
   is fixed in source before any dispatch and never derived from `l4-paired`;
   zero is the as-is configuration (`buildPack` keeps every hit at `floor <= 0`).
   U3 chooses one value from the committed histogram in its own preregistration.
2. **The retention curve is measured at the pack, not only at the pair.**
   `V1` grades whether a pack is non-empty, so `retainedPacks` and
   `emptiedPacks` are the fields a floor can be held against. A pair-only
   histogram would repeat the scalar's mistake one level down.
3. **Content-free queries are reported, not bucketed as zero.** `queryCoverage`
   returns 0 for a question with no content term, which is a statement about
   the question, not the rule. `unmeasurablePacks` makes every floor reconcile:
   `retainedPacks + emptiedPacks + unmeasurablePacks = recallServed`.
4. **`coverageProfile` is called by `coverageHistogram`**, so the two readings
   share one population by construction and the profile is no longer dead code.
5. **The seven-field `UseCensus` is unchanged, verbatim.** `coverage` is a
   sibling optional field on `Tau2ArmRecord` and `Tau2ArmArtefact.tau2`,
   projected by `tau2ArmRecordOf`. Older artefacts (R45, R46) carry none and
   stay "not measured", never a zeroed population.
6. **No gate reads `coverage`.** It is committed evidence for a future
   registration, not a grading rule. `packages/core`, `sota.yml`,
   `bin/tau2-driver.ts`, `bin/l4-pair.ts` and every gate definition are
   untouched; no pack, rule, scope, threshold or admission decision changes.

**Dependency layering.** `bin/tau2-driver.ts` (already collects
`useObservations`) → `tau2-instrument.ts::armRecordFromDriver` (reduces them)
→ `tau2-use-census.ts` (`useCensus` + `coverageHistogram` + `coverageProfile`)
→ `@agentix-e/microglia-core/kernel` (`queryCoverage`, `tokenize`) →
`tau2-gates.ts::tau2ArmRecordOf` (projects both fields). The coupling ledger
moved structurally: 37,746 -> 37,883 production lines, 138 modules unchanged,
`coupledShare` 0.1929 -> 0.1922.

**Acceptance.** TDD: 7 failing tests written first, then green. 2,944 tests in
140 files, coverage 99.98 / 99.69 / 100 / 99.98, `pnpm check` exit 0,
`bundle:size ok`, `ci.yml` green before merge, both repositories pushed as
Lambertyan, no CJK, no skipped tests, no placeholder markers. A real-kernel
regression proves two populations with **identical seven registered fields**
produce different committed histograms — the defect the scalar could not see.

**What this section deliberately does not do.** It does not open U1–U3 or the
R46 admission-rule arms, choose a floor, change `stampDomain`, change
`RECALL_DOMAIN`, add a `minCoverage` default, split a package, or dispatch a
second workflow. U3's floor is computed from a histogram committed by a real
dispatch and registered before its own dispatch; the reading of that histogram
is the next observation, not this one. Ranking is unchanged: IBM `gpt-5.5`
airline 82.0 remains the SOTA, microglia fifth of six named entries.

### 17.94 R47: the reading contract for the committed histogram

**Purpose.** Section 17.93 registers the *instrument*; this section registers
what a real dispatch must return before any `minCoverage` floor can be chosen.
`prereg/R47-coverage-histogram.md` is an as-is observation — R45's and R46's
verbatim inputs with only `prereg` renamed — that reads `tau2.coverage` beside
the unchanged seven-field `tau2.use`. It opens no arm, changes no threshold and
chooses no floor.

**The contract, in priority order.** Eight falsifiable predictions are fixed
before the run. The first seven are structural identities that the instrument
must satisfy on the real population; the eighth carries forward every validity
gate R45 and R46 passed.

1. **Presence is a boundary check.** `coverage` exists on the memory arm and is
   absent on the reference arm, whose driver returns before the recall facade
   exists. A block on the wrong arm, or none on the memory arm, means
   `useObservations` did not reach `armRecordFromDriver`.
2. **The grid is fixed in source, never derived from a result.** `floors` has
   exactly one row per `COVERAGE_FLOORS` entry (ten), the first `minCoverage`
   is 0, and the sequence is strictly increasing. `COVERAGE_FLOORS` is a
   measurement ladder, not a chosen floor; U3 selects one value from the
   committed curve in its own registration.
3. **Pair reconciliation.** `measuredPairs + unmeasurablePairs` equals
   `use.injectedPairs`, because `coverageHistogram` calls `coverageProfile` on
   the same observations `useCensus` counts. A content-free question has
   undefined coverage, so its pairs are reported separately rather than
   bucketed as zero.
4. **Pack reconciliation at every rung.** `retainedPacks + emptiedPacks +
   unmeasurablePacks` equals `use.recallServed`. Served packs either have a
   content-bearing question and fall into the retained or emptied bucket, or
   have no content term and are excluded from every floor. This is why `V1`
   can be held against the curve: it grades whether a pack is non-empty.
5. **The zero rung is the identity.** At `minCoverage = 0`, `retainedPairs`
   equals `measuredPairs` and `emptiedPacks` is 0, because `buildPack` keeps
   every hit when the floor is zero and coverage is always non-negative.
6. **Monotonicity and resolving power.** `retainedPairs` never increases and
   `emptiedPacks` never decreases as the floor rises; at least one positive
   rung reports `emptiedPacks > 0`. The last clause is the substantive
   falsifiable claim — if no served pack is emptied by any positive rung, the
   fixed grid has no pack-level resolving power on this corpus and U3 cannot
   be registered from it.
7. **Quantile ordering.** `nonzeroQuantiles` is non-decreasing from `min`
   through `max`, every value lies in 0 to 1, and `min > 0` when
   `measuredPairs > 0`; these are quantiles of the strictly positive coverage
   of measurable pairs.
8. **No behaviour changes.** Every validity gate R45 and R46 passed passes
   again, `V5` and `V16` stay unresolved, the seven-field `use` shape is
   unchanged and `widenedItems = 0`.

**Why no numeric share is predicted.** R46 registered
`zeroCoverageShare > 0.5` from an offline structural proxy and read 0.3896 on
real distilled statements. A proxy is not the distilled statement. Predicting
another magnitude from that proxy would repeat the defect, so this
registration predicts only identities that must hold regardless of the
population, plus one qualitative claim (that the grid resolves at least one
pack). The sign, magnitude and significance of `l4-paired` are not predicted.

**Refutation and revert.** Six conditions abandon or revert the reading: a
missing or reference-side `coverage` block; any reconciliation identity
failing; a violated grid shape, monotonicity or quantile ordering; `l4-paired`
significantly negative or below minus five points with a served pack, or any
validity gate regressing; an absent evidence artefact; and a floor chosen from
any accuracy number in this run, from the offline proxy, or from a post-run
edit to either registration. **No floor is chosen here.** U3's floor is
computed from the committed retention curve and registered before its own
dispatch, never from `l4-paired` (section 34.22). U1, U2, U3 and the R46
admission-rule arms stay closed.

**Dependency layering (unchanged).** `bin/tau2-driver.ts` collects
`useObservations` → `tau2-instrument.ts::armRecordFromDriver` reduces them →
`tau2-use-census.ts` computes `useCensus`, `coverageProfile` and
`coverageHistogram` → `@agentix-e/microglia-core/kernel` supplies
`queryCoverage` and `tokenize` → `tau2-gates.ts::tau2ArmRecordOf` projects both
fields. No gate reads `coverage`; `packages/core`, `sota.yml`,
`bin/l4-pair.ts` and every gate definition are untouched. `coverage` remains
an optional sibling field, so R45, R46 and every older artefact read "not
measured" rather than a fabricated zero.

**Acceptance.** `pnpm eval:prereg` 35 of 35 valid; `pnpm eval:protocol` all
claims hold; `pnpm check` exit 0 with 2,944 tests in 140 files and coverage
99.98 / 99.69 / 100 / 99.98; `audit: ok`; `bundle:size ok`; `ci.yml` green
before dispatch; both repositories pushed as Lambertyan; no CJK, no skipped
tests, no placeholder markers. Ranking is unchanged: IBM `gpt-5.5` airline
82.0 remains the SOTA, microglia fifth of six named entries.

### 17.95 The use-side cost model: a floor decided from structure, never from accuracy

**The design question.** Section 17.89 requires U3's `minCoverage` floor to be
computed from a committed histogram. It does not say how a floor is chosen from
that histogram. Choosing the rung with the best `l4-paired` is not an option:
R46 read `0.00pp [-10, +10] p=1.0000 n=50` with MDE 13.73pp, so every rung is
inside the noise floor and the argmax would be a choice from noise. This section
registers the decision rule at the design level, ahead of the committed curve;
the floor itself stays unchosen until R47 is read back.

**Two borrowed mechanisms, both inference-compatible.** MemCalib
(arXiv 2609.24259, `recipe/memcalib_credit/metrics.py`) scores calibrated use
as `scs = rho ** (over_budget + under_budget)` at `rho = 0.5`, where the budget
is the sum of per-atom influence distances in each direction. Its RL loop needs
token-level likelihoods and is not available through an inference-only API, so
only the score structure is borrowed: an exponential penalty for misallocated
influence, split into an over-use and an under-use channel. RSCB-MC
(arXiv 2604.27283) contributes the decision rule `S(a, z) = R(a, z) - mu *
P_fp(a, z) - alpha * c(a, z)` with `gamma > alpha > beta`, and abstention as a
first-class action. Ablating abstention there raises false-positive injection
by 17.5 percent and collapses cumulative reward, which is the empirical reason
`emptiedPacks` must be a cost term rather than a discarded remainder.

**The mapping onto the committed curve.** For each rung `f` in
`COVERAGE_FLOORS`, the committed `floors` row already supplies
`retainedPairs`, `retainedPacks` and `emptiedPacks`. Define, over the same
population, `relevant(f)` as retained pairs with coverage above zero,
`falsePos(f)` as zero-coverage pairs still injected at that rung, and
`abstained(f) = emptiedPacks`. The structure-only score is

```ts
net(f) = alpha * relevant(f) - gamma * falsePos(f) - beta * abstained(f)
```

with `gamma > alpha > beta` registered before the dispatch, and the admissible
floor set is `argmax_f net(f)`. No accuracy, `l4-paired`, p-value or task-level
outcome enters `net`. The score is deterministic over the committed population,
so two readers of one artefact must compute the same admissible set.

**A registered tie-break is mandatory.** The offline probe in section 34.30
found that on the proxy corpus the smallest positive coverage is 0.0345, so the
rungs `0.01`, `0.02` and `0.03` retain identical pairs and tie under all three
cost orderings. The correct reading is a tie set, not a unique floor. U3's
registration must therefore declare a tie-break rule before dispatch — for
example the smallest rung in the admissible set, which is the least aggressive
filter — rather than letting an implementation detail such as array order
choose. This is a design requirement, not a numerical result: the committed
curve from a real run may have a different plateau.

**What the probe proved and what it did not.** It proved
`METHODOLOGY_VALID`: the rule is structure-only, accuracy-free and robust to
all three cost orderings **on the offline proxy corpus**; `GRID_RESOLVING_RUNGS
= 9/9`; and `SCALAR_SUFFICIENT = false`. It reported `FLOOR_SELECTED = false`.
It also measured that the offline proxy's `zeroShare = 0.7588` overstates
R46's real `0.3896` by 36.92 points, because the proxy injects all 32
statements into every query while the facade delivers a mean of 1.995 scoped
items. This is why R47's refutation forbids a floor from the offline structural
proxy: only a committed run supplies the population a floor would act on.

**Correction from the committed curve.** The cost-robustness claim above was a
property of the proxy, not of the rule, and R47 falsified it. On the real curve
(run `42337250684`) the false-positive-averse ordering
(`alpha=1, gamma=3, beta=0.5`) and the symmetric ordering
(`alpha=1, gamma=1, beta=0.5`) both select `0.01` with `net = 1231.0`, while
the abstention-averse ordering (`alpha=1, gamma=0.5, beta=3`) selects `0`,
the as-is configuration, with `net = 1067.0`. The proxy tied `0.01`, `0.02`
and `0.03` only because its smallest positive coverage was 0.0345; the real
non-zero mass begins at 0.01695, so the first rung already separates packs.
The design consequence is stronger than the original one: weights cannot have
a default, they must be registered before the dispatch, and the registration
must be recomputable from the committed artefact. Section 17.96 implements
that.

**Dependency layering, unchanged by this section.** The cost model is a
pure function of `CoverageHistogram`, which is produced in
`packages/eval/src/tau2-use-census.ts` from `UseObservation` collected at the
`/v1/recall` facade in `packages/eval/src/bin/tau2-driver.ts`, reduced by
`armRecordFromDriver` in `packages/eval/src/tau2-instrument.ts`, projected by
`tau2ArmRecordOf` in `packages/eval/src/tau2-gates.ts` and persisted by
`packages/eval/src/bin/l4.ts`. The coverage kernel (`queryCoverage`,
`tokenize`) lives in `packages/core/src/kernel/similarity.ts` and is shared
with `buildPack`'s `minCoverage` in `packages/core/src/apply/pack.ts`. No new
package, no new edge from `packages/core` to `packages/eval`, and no gate reads
`coverage`. Section 17.96 adds that decision function over
`CoverageHistogram` inside the eval lane; it does not widen the core API. The
implementation is TDD-first with real fixtures, no mocks, and at least 95
percent coverage on every dimension. Ranking is unchanged: IBM `gpt-5.5`
airline 82.0 remains the SOTA, microglia fifth of six named entries.

### 17.96 U3: from a committed curve to one applied floor

**The problem this section solves.** A floor that is computed but never applied
would make U3 a second copy of the as-is run, and a floor supplied from the
dispatch menu could be tuned after the readout. U3 therefore needs one path
from the committed R47 artefact to the single `minCoverage` argument of the
recall facade, with the decision registered before the dispatch and no new
edge between packages.

**Registered constants and the decision contract.** `tau2-recall-floor.ts`
holds `AS_IS_FLOOR = 0`, `U3_COST_WEIGHTS = { alpha: 1, gamma: 3, beta: 0.5 }`
and two functions:

```ts
export function resolveRecallFloor(
  env: Readonly<Record<string, string | undefined>>,
): number;

export function committedFloor(
  coverage: CoverageHistogram,
  use: UseCensus,
  weights?: CostWeights,
): number;
```

`resolveRecallFloor` reads `TAU_MIN_COVERAGE`. An unset, empty or blank value
returns zero, so every dispatch opened before U3 keeps its own committed
artefact comparable. A set value must be a finite number in the unit interval
**and** a rung of `COVERAGE_FLOORS`; anything else throws rather than clamps,
because a silently clamped floor is a post-hoc choice disguised as a
configuration. `committedFloor` calls `decideFloor` and refuses a broken
population instead of inventing a floor.

**The five-point wiring, with its dependency layering.** No new package and no
new edge from `packages/core` to `packages/eval`:

| layer | file | responsibility |
|---|---|---|
| core kernel | `packages/core/src/kernel/similarity.ts` | `queryCoverage`, `tokenize` (unchanged) |
| core apply | `packages/core/src/apply/pack.ts` | `buildPack.minCoverage` (unchanged) |
| eval instrument | `packages/eval/src/tau2-use-census.ts` | `COVERAGE_FLOORS`, `CoverageHistogram`, `UseCensus` (unchanged) |
| eval decision | `packages/eval/src/u3-decision.ts` | `decideFloor`, `CostWeights`, least-aggressive tie-break |
| eval resolution | `packages/eval/src/tau2-recall-floor.ts` | registered weights, `resolveRecallFloor`, `committedFloor` |
| eval registration | `packages/eval/src/prereg.ts` | optional `recallFloor` header, validated |
| eval CLI | `packages/eval/src/bin/prereg-floor.ts` | recompute the declared floor from the committed artefact; refuse a mismatch |
| eval driver | `packages/eval/src/bin/tau2-driver.ts` | pass `minCoverage` to `host.recall` at the recall facade |
| workflow | `.github/workflows/sota.yml` | read the floor into `TAU_MIN_COVERAGE` on the memory arm only |

The `recallFloor` header is optional precisely so the 35 earlier
registrations remain valid; the validator accepts a finite number in the unit
interval and the lane strengthens that to the registered grid. The checker is
the single source of truth: it reads `readPrereg`, resolves the declared value
through `resolveRecallFloor`, recomputes `committedFloor` from
`eval/fixtures/tau2-r47-coverage-histogram.json` under `U3_COST_WEIGHTS`, and
refuses any disagreement. The dispatch menu cannot carry the floor because
`workflow_dispatch` is already at GitHub's 25-input limit, which is a happy
constraint: the registration, not the menu, owns the treatment.

**What the lane does with the number.** `sota.yml` adds one step that emits
`floor` as a step output, and the memory arm's environment sets
`TAU_MIN_COVERAGE` from it. The reference arm is memory-free and never reads
it. Scheduled runs and every earlier registration emit `0`, so no behaviour
changes for them. The facade applies the floor before serving, so the
`UseObservation` collected at `/v1/recall` records the filtered pack the
agent actually saw; the histogram and census therefore measure the treated
population, not a reconstruction of it.

**The registered cost.** R47's `0.01` rung retains `1438` of `2180` measurable
pairs in `1069` packs and empties `414` of `1491` served packs (27.77
percent). Under `gamma > alpha > beta` that abstention is cheaper than a
false-positive injection, but it is not free: `prereg/R48-u3-coverage-floor.md`
registers it as a first-class outcome beside the paired delta. `V1` is based
on `meanPackIds > 0` and is expected to keep passing, which is why R48
predicts both a lower `recallServed` and a passing `V1` rather than treating
one as the negation of the other.

**Tests and acceptance.** `u3-decision.test.ts` has 21 tests on the
fingerprinted 2239-byte real fixture; `tau2-recall-floor.test.ts` has 10;
`prereg.test.ts` adds five cases for the optional header. `pnpm check` exited
0 at 2980 tests across 142 files with 99.98 percent statements, 99.67 percent
branches, 100 percent functions and 99.98 percent lines; `pnpm eval:prereg`
reads 36 of 36 valid; `audit: ok`; `bundle:size ok`. Ranking is unchanged:
IBM `gpt-5.5` airline 82.0 remains the SOTA, microglia fifth of six named
entries.

### 17.97 An infrastructure failure does not change the design

The first U3 run `42350304597` ended as `completed failure`, but the failure
is in the transport layer, not in the decision or gate layers. `TAU_MIN_COVERAGE:
0.01` was injected and step 11 `Read the registered recall floor` succeeded;
both arms then died on `litellm.InternalServerError: DeepseekException` with a
500 from `api.deepseek.com`, step 14 failed only because
`arms/reference/poc-l4.json` was missing, and step 15 correctly reported that
nothing was measured. Its evidence zip has zero `arms/` entries. Therefore
`decideFloor`, `resolveRecallFloor`, `buildPack.minCoverage`, the
`coverage` histogram and every validity gate remain exactly as registered and
**none has been exercised by a task outcome**. The registered floor `0.01`,
the weights `(1, 3, 0.5)` and the least-aggressive tie-break are untouched;
no accuracy number exists that could revise them.

**A third terminal state.** The lane now has three distinct outcomes that the
prose must keep separate. (1) `CI green` means the build, tests and coverage
gates passed. (2) `scientific gate red`, seen in R47, means a complete
artefact exists and the lane refuses to certify an underpowered measurement
(`V5` MDE 17.72pp, `V16`, `l4-paired`), which is not a build failure. (3)
`no measurement`, seen here, means no arm artefact exists at all: no delta, no
graded prediction, no refutation, no revert, and downstream arms closed.
Step 15 `Say so when nothing was measured` already distinguishes (3) from (2)
in the workflow, and R48's sixth refutation states the required response. An
uploaded directory of baseline files must never be mistaken for (2).

**Why the head is still.** Retry `42353229972` measures on `33038232` with the
unchanged preregistration. Editing `sota.yml`, the driver, `run_split.py` or
the prereg now would make the measuring run differ from the head its
registration names, which is precisely the desynchronisation section 34.21
forbids. `microglia` therefore carries zero source changes this iteration;
`pnpm check` is not rerun because no source changed, and its last full green
(2980 tests, 142 files, 99.98 / 99.67 / 100 / 99.98) plus `ci.yml` run
`42349873647` (44 steps) remain the governing evidence.

**Defect 27 and its design boundary.** `run_split.py` documents
`num_retries` as protection against a 429 aborting the whole `run_tasks`, but
a persistent 500 aborts the phase just as completely, discarding 17 minutes
of retail learn work; the L4 job also lacks a fail-fast provider health check
before committing a roughly 20-minute runner. The remedy is registered in
`AUDIT.md` section 34.33 for a later head: one lightweight completion probe
that fails fast with an explicit no-measurement marker. Its acceptance bar is
a design constraint, not an implementation detail: no reduction of trials, no
skipped learn phase, no artefact assembled from the tasks that happened to
survive (that would let the provider choose the population, a selection bias
the whole use-side programme exists to remove), and no step that masks a
non-zero exit. TDD, real tests, no mocks, at least 95 percent on every
coverage dimension, `pnpm check` exit 0 and `ci.yml` green before any later
dispatch. Ranking is unchanged: IBM `gpt-5.5` airline 82.0 remains the SOTA,
microglia fifth of six named entries.

### 17.98 Semantic anchors for U1 and R46, and the verifier as an acceptance tool

The measurement window keeps the `microglia` head unchanged, so this section
registers semantics for the next arms without implementing them.

**U1 calibration.** MemCalib (arxiv 2609.24259) separates over-use `O` from
under-use `U` and scores a response with `SCS = mean(rho^(O + U))` and
`Exact = mean(1[O + U == 0])` at `rho = 0.5`, alongside `sMOS`, `sMUS`, `AOR`
and `AUR`. Mapped onto the committed artefact, over-use corresponds to
`zeroCoveragePairs` (a pair with no shared content term still injected) and
under-use to `emptiedPacks` (a served pack the floor abstained from). This is a
structural mapping only: MemCalib's decay is symmetric while U3's cost is
asymmetric with `gamma > alpha > beta`, and its judge-based atom levels are not
observable in the tau-squared lane. No MemCalib threshold, score or channel
count may enter `COVERAGE_FLOORS` or the registered weights. MemCalib's finding
that every model but Qwen3-8B over-uses more than it under-uses, that the skew
reverses on Qwen3-8B, and that GRPO/GDPO improve one direction while worsening
the other, is independent corroboration of three existing choices: penalise
false-positive injection most, register the weights with no default, and treat
abstention as a first-class cost rather than maximising retained pairs.

**R46 admission-rule ablation.** The Memory Funnel's `core/consolidate.py`
separates `confidence`, which grows with independent corroborating sources and
is capped at 0.95, from `importance`, which tracks how often a fact is used.
`crystal_policy()` promotes a `Unit` to a `Crystal` only at three independent
sources (or explicit user confirmation, or confidence >= 0.90 with importance
>= 0.80), and uses `SUPERSEDED` plus `superseded_by` instead of deletion. This
gives R46's two comparators a precise meaning: `distinct-task-support` tests
corroboration across independent traces (confidence), `min-support-only` tests
raw occurrence count (importance), and the separately registered `>= 2`
contrast tests the bar itself. The value 3 is that project's own choice and is
not portable; it is a comparator to ablate, not a constant to adopt.

**The verifier is an acceptance tool, not production code.** `r48_readback.py`
lives outside both repositories, is read-only, and is therefore not under the
coverage gate that governs shipped source. Encoding `NO_MEASUREMENT`,
`GRADED` and `GATE_RED` as distinct terminal states is what prevents a provider
outage from being graded as a finding. Its self-test reproduces R47's exact
McNemar p-value `0.109375` from `(lost, gained) = (2, 8)`, recomputes the
registered floor `0.01` with `net = 1231.0` and `measurableZero = 742`, asserts
all three terminal states, and fires refutations R1, R2 and R4 on broken
inputs. It is staged for the readback of `42353229972`; no conclusion is drawn
from it until that artefact exists. Ranking is unchanged: IBM `gpt-5.5`
airline 82.0 remains the SOTA, microglia fifth of six named entries.


### 17.99 The revert rule as a typed production invariant

**Why it moved.** Until R48 the R45 revert rule existed only as English in
`prereg/R45-admission.md` and as an untyped computation in an offline Python
verifier. That verifier bound refutation R4 to the cross-run contribution
(`-4.00pp`) instead of the within-run `l4-paired` gate (`-6.00pp`) and reported
`revertRuleFired=false` for a reading that fires (AUDIT 34.35, defect 28). A
governance invariant that decides whether an arm is reverted must not live in a
script that no CI gate, no coverage threshold and no type checker can see.

**The instrument.** `packages/eval/src/l4-revert.ts` exports:

```ts
export const REVERT_P_BAR = 0.05;
export const REVERT_DELTA_BAR_PP = -5;

export type PairedReading = {
  readonly scope: 'within-run' | 'cross-run';
  readonly deltaPp: number;
  readonly p: number;
  readonly paired: number;
};

export function revertRule(
  reading: PairedReading,
  servedPacks: number,
): { readonly fires: boolean; readonly branch: RevertBranch; readonly reason: string };
```

The `scope` tag is the design point. `l4-paired` in `l4-pair.ts` pairs the
memory arm against the memory-free reference arm inside one dispatch; a
cross-run delta pairs two memory arms from two dispatches and measures a
treatment's contribution. Only the former is a gate input. `revertRule`
refuses a cross-run reading at runtime with an explicit error, so the wrong
binding cannot recur silently, and its doc comment names the defect it closes.

**Two independent branches.** `significantly-negative` fires when
`deltaPp < 0 && p < REVERT_P_BAR`; `below-bar-with-served-pack` fires when
`servedPacks > 0 && deltaPp < REVERT_DELTA_BAR_PP`. Significance is not
required on the second branch and a served pack is not required on the first;
both bars are strict. Non-finite deltas, out-of-range p-values, a non-positive
paired count and a negative served count are refused rather than graded. The
rule never reads accuracy to choose, justify or revise a floor — R48's R5
forbids it.

**TDD on real data, no mocks.** `eval/fixtures/tau2-l4-paired-readings.json`
carries two committed readings: R47 (`+12pp, p=0.1094`, 1491 served packs,
expected clear) and R48 (`-6pp, p=0.4531`, 965 served packs, expected FIRES on
branch 2). Fourteen tests in `l4-revert.test.ts` read that fixture and cover
both branches, both strict boundaries (`-5pp` and `p=0.05` do not fire), the
zero-served-pack case, cross-run refusal, malformed inputs and the exported
constants. The corrected offline `r48-readback.py` grades R4 end to end on the
same two readings and asserts that a catastrophic cross-run delta with a safe
within-run gate does not fire. The real artefact readback is now
`revertRuleFired=true`, `P8 FAIL`, `verdict=GATE_RED`.

**Consequence for the design.** The revert is a governance action on the
reading, not a causal claim: the run is underpowered (MDE 14.83pp) and
confounded by 14 points of reference drift plus a changed learning phase
(defect 29). The applied floor is reverted to `AS_IS_FLOOR = 0`; the
measurement instrument, the census, the histogram and `decideFloor` remain,
because reverting an arm is not deleting the ability to measure one. The next
arm must be a within-run pair so that only the recall facade varies. Ranking
is unchanged: IBM `gpt-5.5` airline 82.0 remains the SOTA, microglia fifth of
six named entries.


### 17.100 Why the next arm must be paired within one run

R48's P8 failed because two dispatches of an identical configuration produced
different memories: 8 distilled items in one, 12 in the other, and a
memory-free reference arm that moved from `pass^4 = 0.30` to `0.44`. A source
reading done after the revert makes the arithmetic of that failure explicit
and fixes the design of the next arm. These are statistical sources, not new
tau2-bench `Pass^4` entries, and none of their numeric thresholds is portable
into `COVERAGE_FLOORS`; they are registered as method, not as a ruler.

**Common random numbers.** Paired evaluation feeds both arms the same random
stream, so seed-coupled noise enters both scores with the same sign and cancels
in the difference: `Var(A - B) = 2 * sigma^2 * (1 - rho)`, where rho is the
induced run-to-run correlation. At rho = 0.5 the difference's noise falls to
about 0.71 of the independent-seed value, equivalent to doubling both arms'
replicate counts. arXiv 2512.24145 formalises paired-seed evaluation as the
classical paired design with the seed as the unit of randomisation, and shows
it tightens intervals and raises power at a fixed budget while reducing to
independent evaluation when correlation is absent. R48 did the opposite: it
compared two dispatches that shared a configuration but not a random stream.

**McNemar is the paired instrument.** The classical analysis of paired
dichotomous outcomes across blocks is McNemar's test (McNemar, 1947;
Dietterich, 1998). `packages/eval/src/bin/l4-pair.ts` already uses an exact
two-sided McNemar test on discordant task pairs, and `l4-revert.ts` grades the
same within-run reading. The test's validity rests on the two arms being
paired on the same tasks under the same draws. A cross-run delta between two
memory arms is not such a pair, which is precisely why R48 defines it as the
treatment's contribution and never as the revert gate.

**Where the variance lives.** For a mean score over T tasks with R runs each,
`Var(score) ~= sigma_between^2 / T + sigma_within^2 / (T * R)`. Adding runs
shrinks only the second term; the between-task term is divided by T alone and
does not move no matter how many times a run is repeated. On a 500-task
benchmark an unpaired score near 50 percent carries a 95 percent interval of
roughly plus or minus 4.4 points, while a paired comparison on the same tasks
with the same seeds can resolve an effect below three points on identical data
and budget. This is the arithmetic behind R48's `V5-resolution` (MDE 14.83pp,
216 tasks needed for a 5pp effect): retrying the same 50-task design cannot
turn an underpowered comparison into a powered one, and a 14-point reference
drift is the run-level term `sigma_run` observed directly.

**The benchmark's own constraint.** The tau-bench evaluation guide states that
the user simulator must be held fixed across comparisons, because a weaker
simulated user can make a worse agent look better, and advises against
over-indexing on a single seed; pass^k is `E_task[prod_j success_j]`, the
fraction of tasks solved on all k independent trials. A field summary of
noise-aware agent evaluation puts the failure plainly: if the same eval is
rerun three times and gives meaningfully different scores, the eval is not yet
measuring the system, it is measuring the run.

**Design consequence.** The next arm is one dispatch with one learning phase,
one store, one reference arm, one user simulator and one seed stream; only the
recall facade varies between the as-is and the floored configuration. That is
the paired design `ROADMAP` Read 7 already used when it distilled two variants
inside one run and scored them against the same none arm on the same questions,
where it removed a factor-of-two cross-run bias. Its acceptance bar is
unchanged: predictions, refutations, cost weights and tie-break registered
before dispatch, `V1` blocking, exact McNemar on the paired tasks, an MDE
computed and reported, TDD with real fixtures and no mocks, coverage at least
95 percent on every dimension, and both repositories pushed as Lambertyan.
Ranking is unchanged: IBM `gpt-5.5` airline 82.0 remains the SOTA, microglia
fifth of six named entries.


### 17.101 The within-run pair: the architecture decision and the invariant that guards it

**Context.** R48 measured U3 and fired the R45 revert rule on the within-run
`l4-paired` gate (-6.00pp, 965 served packs). P8 failed because the two memory
arms came from two dispatches: 8 versus 12 distilled items, and a memory-free
reference that moved from 0.30 to 0.44. 17.100 and `AUDIT` 34.36 established
the arithmetic (`Var(A - B) = 2 * sigma^2 * (1 - rho)`); two dispatches of one
configuration are not a paired comparison. This section fixes the architecture
and records the invariant already built. It changes no source file beyond the
three new files listed below and the additive export.

**Decision: a paired facade in ONE driver run, not a third driver lane.**

| option | what it does | why it was chosen or rejected |
| --- | --- | --- |
| third driver lane | a second `pnpm eval:l4` step with its own module | **rejected**: `tau2-driver.ts` `run()` performs listing, learning, distillation, store construction, facade and eval as one unit. A second lane re-learns and re-distils, so the store differs by construction. That is defect 29 with extra steps. |
| store snapshot reuse | learn once, serialise the store, restore it in a second process | **rejected**: adds a serialisation-fidelity risk and a new untested boundary; it also makes the seed stream and provider state differ between the two eval phases. |
| paired facade in one `run()` | one learning phase, one store, two facade variants evaluated over the same held-out tasks and seed stream | **chosen**: the only arrangement where "one learning phase, one store, one split, one seed stream" is true by construction rather than by assertion. |

**Code evidence for the decision.** `bin/tau2-driver.ts` lines 330-597 are one
`run()`: `listTasks`, `heldOutPlan`, the learn `phase`, `learnableCorrections`,
`EmbeddedMemory.open`, `host.distill`, `storeCensus`, `startRecall` with
`host.recall({ minCoverage: MIN_COVERAGE })`, then the eval `phase` and the
`observed` record. `bin/l4.ts` `measureFromDriver` calls `loaded.run()` once,
then reads additive `instrument()` / `trials()` exports, and writes one
artefact through `writeResult`. `bin/l4-pair.ts` joins two artefacts by
`L4_FIRST` / `L4_SECOND` and grades `l4-paired` and `l4-same-split`.
`bin/lib.ts` `writeJson` resolves its directory from `POC_RESULT_DIR`, so a
second artefact needs an explicit, additive directory parameter. The existing
additive-export pattern (`instrument`, `trials`) is the precedent for exposing
the second facade without changing `run()`'s signature.

**Sub-package layout and dependency layering (ten items).**

1. `packages/eval/src/within-run-pair.ts` — pure invariant, no I/O, no clock,
   no filesystem. Depends only on `./l4.js` (`compareArms`, `ArmTask`,
   `ArmComparison`), `./tau2-recall-floor.js` (`AS_IS_FLOOR`) and
   `./tau2-use-census.js` (`COVERAGE_FLOORS`). **DONE.**
2. `packages/eval/src/__tests__/within-run-pair.test.ts` — 29 tests over the
   committed fixture, additive to the 143-file suite. **DONE.**
3. `eval/fixtures/tau2-facade-scopes.json` — real R47/R48 scopes plus a
   labelled structural identity control. **DONE.**
4. `packages/eval/src/index.ts` — additive re-export of the invariant; the
   pre-existing `PairVerdict` from `pairs.ts` is untouched. **DONE.**
5. `packages/eval/src/bin/tau2-driver.ts` — extract the eval segment
   (`startRecall` through `observed`) into `evaluate(floor)`, call it twice on
   the single store and single `test` split, expose `pairedFacades()` as an
   additive export, and attest one `storeFingerprint` for both. **P1, pending.**
6. `packages/eval/src/bin/l4.ts` — read the additive export; write the second
   artefact through an additive `writeJson(value, dir)` overload so the first
   artefact's path and gates are unchanged. **P1, pending.**
7. `packages/eval/src/bin/l4-pair.ts` — unchanged; its `L4_FIRST`/`L4_SECOND`
   inputs already select the two facades. **no change intended.**
8. `.github/workflows/sota.yml` — keep one L4 job; replace the single memory
   step with the paired step, point `L4_FIRST`/`L4_SECOND` at the two facade
   directories, and keep the reference arm as the within-run gate. The 25-input
   dispatch cap means the floor pair continues to come from the
   pre-registration, never the menu. **P1, pending.**
9. `prereg/R49-within-run-pair.md` — register the floor, the single-store
   attestation, predictions, refutations, cost weights and tie-break *before*
   dispatch; R5 forbids editing it after readback. **P1, pending.**
10. `packages/eval/src/__tests__/` — a real-fixture test for the driver's
    two-facade wiring and one for the second artefact writer, TDD before the
    implementation, no mocks, at least 95 percent on every dimension.
    **P1, pending.**

**Dependency direction.** `within-run-pair.ts` sits below the driver and
beside `l4-revert.ts`: both are pure, both are imported by the bin layer, and
neither imports a bin, a workflow, a filesystem helper or a provider. The
driver depends on the invariant only to *attest* its scope, never to choose a
floor. The gate layer (`tau2-gates.ts`, `l4-pair.ts`) is not modified, so the
protocol's `tau2GateAudit` keeps grading the same evidence shape.

**Acceptance bar for the pair (17.100, restated).** One dispatch and one
`RunScope`; `recall.served > 0` on both facades; `l4-same-split` passes with
zero tasks on either side alone; the contribution is reported with its MDE and
power; the R45 revert rule continues to grade only the memory-vs-reference
`l4-paired` gate; a `REFUSED_CROSS_RUN` verdict is a `NO_MEASUREMENT`, not a
finding; no accuracy number is claimed in either direction and no leaderboard
row moves.

**A separate decision, recorded in `COMPETITIVE` L.19.** The
`cross-model-guideline-control` arm from L.8 is not opened now. It would add a
second learning phase and a second store beside this pair. Its L.8 precondition
(`served > 0`) is satisfied, but the project's own order puts a valid paired
readout first.

| priority | step | blocked by | status |
| --- | --- | --- | --- |
| P0 | type the within-run invariant, TDD it on real committed scopes, keep `pnpm check` green, sync six documents, push both repositories | — | **done this iteration** |
| P1 | extract `evaluate(floor)` in the driver and expose `pairedFacades()`; TDD on a real fixture first | P0 | pending |
| P1 | additive second-artefact writer in `bin/l4.ts`; TDD first | driver wiring | pending |
| P1 | `sota.yml` paired step, `L4_FIRST`/`L4_SECOND`, reference arm unchanged | both above | pending |
| P1 | register `prereg/R49-within-run-pair.md` before dispatch | design frozen | pending |
| P1 | dispatch through `sota.yml`, read back with the three-terminal verifier, apply the R45 revert rule only to the within-run gate | registration | pending |
| P1 | defect 27's fail-fast provider health probe with an explicit no-measurement marker | independent | pending |
| P2 | U1, U2 and R46's admission-rule arms | a valid paired readout | **CLOSED** until then |
| P3 | `sota.ts` split, `eval-sql` move, W8 dose curve, vitest 4 migration | independent | pending |
| — | cortex release (W1) excluded by the standing instruction | — | excluded |

**Verification of what is done.** `pnpm check` exit 0 at 3023 tests / 144
files, coverage 99.97 / 99.67 / 100 / 99.97, `audit: ok`, `bundle:size ok`.
Structural coupling ledger: 142 modules, 38444 production lines. Ranking
unchanged: IBM `gpt-5.5` airline 82.0 remains the SOTA, microglia fifth of six
named entries.


### 17.102 R49 implementation: ten modules, four layers, one store

The architecture decision of 17.101 was "paired facade in one driver run, not a
third driver lane". `tau2-driver.ts` before R49 was a single `run()` that went
from listing to learning to distillation to one facade to one evaluation to one
artefact. A third lane would necessarily learn again, reproducing defect 29 by
construction. R49 keeps one `run()` and extracts `evaluateFacade(floor, out)`
inside it.

Ten deliverables, in dependency order:

1. `packages/eval/src/within-run-pair.ts` — the runtime invariant from the previous iteration. `RunScope`, `scopeDifference`, and the three-terminal `withinRunPair`.
2. `packages/eval/src/l4-revert.ts` — the R45 revert rule, deliberately separated; it grades only the `l4-paired` population.
3. `packages/eval/src/tau2-recall-floor.ts` — the one floor knob, `AS_IS_FLOOR`, registered cost weights and grid validation.
4. `packages/eval/src/facade-pair.ts` — the new pure orchestration contract: `resolveFacadePairPlan`, `facadeArmTasks`, `storeFingerprintOf`, `facadeScope`, `facadePairVerdict`, `treatmentDelivered`, `pairedFacadeArtifact`, `readFacadePairArtifact` and the summary/state helpers.
5. `packages/eval/src/provider-probe.ts` — the new pure pre-flight rule: `classifyProviderProbe`, `isProviderOutage`, `probeGate`, `noMeasurementMarker`, `ProviderNoMeasurementError`.
6. `packages/eval/src/bin/tau2-driver.ts` — the integration layer. One `host`, one `knowledge` list, one `sharedScope` attested before either facade recalls, two `evaluateFacade` calls with an explicit shared `--seed 300`, and an additive `pairedFacades()` export.
7. `packages/eval/src/bin/l4.ts` — writes `poc-l4.json` as before (the floored facade against the memory-free reference) plus `poc-l4-facade-pair.json`, adds the `l4-facade-pair` gate, and catches the no-measurement error.
8. `packages/eval/src/prereg.ts` and `bin/prereg-pair.ts` — the registration is the only source of truth for both the pair switch and its floor. `readPrereg` refuses `as-is-floored` without a positive `recallFloor`.
9. `bin/prereg-floor.ts` and `bin/facade-pair-readback.ts` — the workflow's two readbacks, one for the registered floor and one for the three terminal states.
10. `.github/workflows/sota.yml` — one job, one 240-minute memory arm carrying both facades, one unchanged reference arm, one unchanged `l4-pair` step, and one new readback step.

Dependency layering is strict and one-directional: the two pure modules
(4, 5) depend only on the primitives (1, 3) and on `l4.ts`'s `compareArms`;
the driver (6) depends on the pure layer through the package barrel; the CLI
writers (7, 9) depend on the package, not on each other; the workflow (10)
depends on the CLIs through the package scripts. No module reads accuracy,
`l4-paired` or an offline proxy to choose a floor.

Two design choices deserve their reasons. The registered floored facade is the
one `l4-pair` grades, so the memory-versus-reference gate and the R45 revert
rule remain exactly as R48 had them; the as-is facade exists only for the pair.
And the store fingerprint is an FNV-1a digest over sorted UTF-8 statements,
not a cryptographic commitment: it needs to be stable across Node and browser
bundles, needs no `node:crypto`, and is compared only inside one process that
owns both arms.

Common random numbers are now an attested property. `run_split.py --seed`
defaults to 300; in paired mode `driverArgs` receives that value explicitly,
and `RunScope.seed` records it. `Var(A - B) = 2 * sigma^2 * (1 - rho)` is why
two dispatches of one configuration are never a paired comparison.

Acceptance: 3104 tests over 147 files, coverage 99.94 / 99.63 / 100 / 99.94,
`audit: ok`, `bundle: size ok`, all 37 pre-registrations valid, and three
lane-level tests that run the real CLI against a driver stand-in. The
structural ledger records 144 modules and 39176 production lines.


### 17.103 The pre-measurement refusal contract

A dispatch that stops before it measures must leave one artefact that says so.
Three stops qualify, and they arrive from different places:

- the pre-flight probe (`probeGate`) refuses a provider that answered 5xx on
  every call or answered intermittently;
- `facadeScope` refuses to attest a pair whose store is empty, whose split is
  half-empty, whose seed is not finite, or whose trial count is not a positive
  integer;
- the run's own deadline and the split guard refuse before the evaluation.

The contract is a marker, not a class:

```ts
type NoMeasurementMarker = {
  readonly status_no_measurement: 1;   // not a result
  readonly status_not_run: 0;          // and not a missing environment
  readonly claim: 'none';              // nothing may be concluded
  readonly reason: string;             // what was missing, in one sentence
};
```

`noMeasurementRefusal(reason)` builds an error carrying it; `isNoMeasurementRefusal`
recognises it by the marker's shape. Class identity cannot be the contract here:
`l4.ts` loads the driver with a dynamic `import()`, and a marker that crossed a
JSON boundary has no prototype, so a `instanceof` check would silently fail open
on exactly the case it exists to catch.

`attestPairScope(shared)` is the lane-facing wrapper: it returns the attested
`RunScope` or throws the refusal, so the driver never has to decide whether an
empty store is a bug or an instrument. `facadeScope` itself stays strict and
throws a plain `Error`, because a caller that bypasses the wrapper should get a
programming error, not a graded outcome.

Dependency layers added by this rule:

1. `provider-probe.ts` -- pure; the marker, the refusal, the recogniser, the
   probe classifier. Imports nothing from the lane.
2. `facade-pair.ts` -- imports `provider-probe.ts` and `within-run-pair.ts`;
   owns `attestPairScope`, the verdict, the artefact and the three-state
   readback.
3. `bin/tau2-driver.ts` -- the only place that calls `attestPairScope`, in the
   paired branch, before either facade evaluates.
4. `bin/l4.ts` -- the only place that calls `isNoMeasurementRefusal`, and the
   only writer of the `status_no_measurement` artefact.
5. `bin/facade-pair-readback.ts` -- reads the pair artefact back; it must never
   default a missing state to PAIRED.

The fourth terminal state is therefore outside the pair: a stopped run writes
`poc-l4.json` with `status_no_measurement` and does not write
`poc-l4-facade-pair.json` at all, because a pair that never measured has no
contrast to report -- not even a null one.

### 17.104 The abstention census: shape, states and one optional field

A pair artefact that reports a delta without a mechanism is a number nobody can
act on. The census is deliberately small, and its shape is the whole design:

```
inaction: {
  asIs:    InactionCensus
  floored: InactionCensus
  contrast: InactionContrast | null
}
```

`InactionCensus` has two states. `NOT_OBSERVED` carries a reason and no counts;
`OBSERVED` carries `tasks: TaskInaction[]` ordered by id, `inactiveTrials` and
`totalTrials`. `TaskInaction` is `{ id, inactive, trials }` with the id qualified
by the scenario exactly as `TauTrialRow` qualifies its own, so the census
reconciles with the pair's per-task rows line for line.

The source is the phase's `diagnostics` object, which the Python driver already
prints for the reliability gate. One key is added:

```
inaction: { observable: bool, episodes: [{ task, trial, acted }, ...] }
```

`observable` is a field rather than an inference because a reader must not
decide for itself what a missing census means. `acted` is true when any message
whose role is `assistant` (or `agent`, which older upstream versions used)
carries a non-empty `tool_calls` list. Upstream's model gives a participant
message either text or tool calls, and an assistant message continues an episode
only by calling a tool, so `acted: false` is "the agent declined to continue" —
the τ² counterpart of the abstention LongMemEval scores.

Refusals, each of which is a state or an error rather than a default:

| condition | result |
| --- | --- |
| no diagnostics at all | `NOT_OBSERVED` |
| `inaction` key absent (every run before this instrument) | `NOT_OBSERVED` |
| `observable: false` | `NOT_OBSERVED` |
| empty episode list | `NOT_OBSERVED` |
| `observable` not a boolean | throws |
| episode without an id, or a trial that is not a non-negative integer, or `acted` not a boolean | throws |
| the same `(task, trial)` twice | throws |

`inactionContrast(asIs, floored)` is defined only when both sides are `OBSERVED`
over the same task set and trial counts; the delta is the treatment's inactive
share minus the control's, in percentage points. `inactionContrastOrNull` is the
driver-facing adapter: same statistic, refusal becomes `null`, because the
caller has just spent an hour of evaluation and the two censuses are worth more
than the delta.

Dependency layers:

1. `inaction.ts` — pure, imports nothing from the lane; owns the states, the
   reduction, the contrast and its adapter.
2. `facade-pair.ts` — imports it for the summary line and the artefact's
   optional `inaction` field. The field is optional because R49's artefact has
   none and its verifier does not ask for one.
3. `bin/tau2-driver.ts` — builds one census per facade, from that facade's own
   phase, and never shares one between arms.
4. `eval/drivers/tau2/run_split.py` — reports episodes, decides nothing.

The census never enters `pass^k`, never selects a floor, and is never read by
the R45 revert rule. It answers one question beside the delta: did the agent
stop acting.

### 17.105 Write-side admission: the decision, its bounds, and one shared predicate

```
admitWrite(candidate, neighbours, policy, { threshold = 0.85, topS = 10 })
  -> { op: 'add',    reason: 'no-neighbour' | 'below-threshold' | 'different-payload', nearest }
   | { op: 'update', target: KnowledgeItem, similarity }
   | { op: 'noop',   target: KnowledgeItem, similarity }
```

`WriteNeighbour` is `{ item, similarity }`, and the score is supplied by the
caller rather than recomputed: a store with embeddings and a store without must
share the decision, and what must not vary is what happens once a candidate has a
nearest neighbour. `neighbourhood(candidate, items)` is the lexical
implementation for callers that have nothing better — Sørensen–Dice over content
tokens, exact, deterministic and free.

Order of evaluation, each step a hard gate:

| step | gate | why it is a gate rather than a filter |
| --- | --- | --- |
| 1 | namespace equality | retrieval never crosses tenancy; a merge must not either |
| 2 | kind equality | a rule and an anti-pattern are different knowledge that can share words |
| 3 | rank by similarity desc, id asc, keep `topS` | without the tie-break the decision depends on the store's return order |
| 4 | `similarity >= threshold` | below it the candidate is a different claim |
| 5 | payload equality | a merge replaces the payload, so a disagreement is a different fact |
| 6 | `wouldChange(target, candidate, policy)` | false means the write changes nothing: `noop` |

`wouldChange` lives in `kernel/knowledge.ts` and is the one definition shared with
`mergeEvidence`. It is false only when the observation is already cited by the
item, the item is not retired (or the observation is not trusted enough to revive
it), no new condition is being adopted, the payloads agree, and the tier is not
stronger.

Wiring, and the layer each piece lives in:

1. `kernel/write-admission.ts` — pure; imports `wouldChange`, `jsonEqual`,
   `diceSimilarity`, `MicrogliaError`. No store, no clock.
2. `distill/distiller.ts` — calls it from `upsert`, after the exact-key merge and
   after the generalisation plan, before `createKnowledgeItem`; merges through the
   same `mergeEvidence` the exact-key path uses, and counts `suppressed` /
   `rephrased` into `DistillReport`.
3. `capture/microglia.ts` — forwards `admission` verbatim; absent means off.
4. `eval/write-admission-plan.ts` — `TAU_WRITE_ADMISSION` (`off` | `neighbours`)
   and `TAU_WRITE_ADMISSION_THRESHOLD` (in (0, 1]), refused rather than clamped.
5. `.github/workflows/sota.yml` — a repository variable, not a dispatch input: the
   menu is at the platform's limit of twenty-five and which claims a store admits
   is a property of the experiment.

The pool the decision sees is the whole namespace, not the candidate's task. That
is the entire point — the exact key cannot cross that boundary — and it is also
the cost: one namespace-wide read per candidate, only when the switch is on.

Refusals, all thrown before a write:

| condition | result |
| --- | --- |
| threshold outside (0, 1] | throws |
| `topS` not a positive integer | throws |
| a neighbour similarity that is not in [0, 1] | throws |
| the same neighbour supplied twice | throws |
| `TAU_WRITE_ADMISSION` not `off`/`neighbours`/empty | throws at module load |
| `TAU_WRITE_ADMISSION_THRESHOLD` not in (0, 1] | throws at module load |

The treatment is recorded, not inferred. `Tau2ArmRecord.writeAdmission` is
`{ mode, rephrased, suppressed }`, optional and absent on every artefact written
before it: `mode: 'off'` is a measured store, `undefined` is an unmeasured one, and
a readback that had to grep the run log for the switch could not attest either.

What it never does: choose a floor, enter `pass^k`, retire an item, or write when
the decision is `noop`.

### 17.106 The paired verdict: three states, two gates, one rule called rather than copied

`l4-paired` used to be a pass condition inside `bin/l4-pair.ts`:
`delta >= 0 && p` below 0.05. On τ² retail the pair's minimum detectable difference
is 13.73pp at n = 50 and 9.05pp at the scenario's full 115 tasks, so the condition
could not be met by any effect the mechanism could plausibly have. It was red on
every dispatch that graded it, and a red line that is always red is a line its
readers learn to ignore.

**The state machine.** `pairedVerdict(input)` in
`packages/eval/src/paired-verdict.ts` is pure, and its input is exactly the two
numbers the report prints plus the served-pack count the revert rule needs:

```ts
type PairedVerdictInput = {
  deltaPp: number;        // second arm minus first
  p: number;              // exact two-sided McNemar
  paired: number;         // tasks both arms scored
  servedPacks: number;    // what the treatment actually delivered
  detectablePp: number;   // Infinity when no task changed hands
};
```

| State | Condition | `claim` |
| --- | --- | --- |
| `HARM` | `revertRule({scope:'within-run', …}, servedPacks).fires` | the sentence, naming the loss |
| `BENEFIT` | `deltaPp > 0 && p < REVERT_P_BAR && deltaPp >= detectablePp` | the sentence, naming the gain and the resolution it clears |
| `UNRESOLVED` | otherwise | `null` |

`excludedAbovePp` is carried in every state: in `HARM` it is the resolution, in
`UNRESOLVED` it is the bound the run established, and a reader who sees "nothing
concluded" is entitled to know what *was* ruled out.

**Why the harm branch is a call.** `revertRule` is the registered R45 invariant,
read by the ledger, by the offline verifiers and by `l4-revert.ts`'s own tests. A
second copy of "significantly negative, or below −5pp with a served pack" inside a
bin is a second definition of one rule, and the copy that drifts is the one nothing
grades. R50's refutation list says exactly this: if the verdict and the revert rule
ever disagree, the gate is abandoned rather than patched.

**Why the resolution is not in the pass condition, and not blocking.** The failure
`V5-resolution` exists to prevent was a design whose MDE was 21.4pp against a 6pp
bar *publishing a delta anyway*. The cure is a readout that refuses to claim a
direction it cannot resolve, not a permanently red build on every scenario that
cannot reach 6pp. So `V5-resolution` keeps its bar and keeps blocking; the finding
gate stops attributing that fact to the memory; and `l4-effect-resolved` reports
the resolution without blocking, because a second blocking copy of one fact is one
red line printed twice.

**Artefact contract.** `poc-l4-pair.json` gains:

```json
{
  "verdict": {
    "state": "UNRESOLVED",
    "claim": null,
    "reason": "-4.00pp at p=0.6875 with n=50 pairs does not clear the 13.73pp the sample can resolve; no effect larger than 13.73pp in either direction was shown",
    "excludedAbovePp": 13.73,
    "servedPacks": 949
  }
}
```

`claim: null` is a contract, not a convention: a field that is always a string is a
field a downstream writer concatenates into a result. The step also prints one line
— `[l4-pair] verdict <STATE>: …` — so a log reader without the artefact still sees
the state rather than a bare delta.

Refusals, all thrown before grading:

| condition | result |
| --- | --- |
| `deltaPp` not finite | throws |
| `detectablePp` NaN | throws |
| `detectablePp` zero or negative | throws (a pair cannot resolve a zero-point effect) |
| `p` outside [0, 1] | throws, via `revertRule` |
| `paired` not a positive integer | throws, via `revertRule` |
| `servedPacks` negative or non-finite | throws, via `revertRule` |

`Infinity` is a legal `detectablePp` and is the honest value for a pair in which no
task changed hands: refusing it would make the case that most needs saying
unrepresentable.

### 17.107 Recall text: one definition, because the three call sites had already drifted

`KnowledgeItem.when` has existed since iteration 62. The renderer prints it ahead of
the statement, the distiller prompt asks for it, the merge adopts it, and the
sanitizer holds it to the statement's standard. Retrieval ignored it in every one of
its three stages.

**The definition.**

```ts
export function recallText(item: { statement: string; when?: string }): string {
  return item.when === undefined || item.when.length === 0
    ? item.statement
    : `${item.when} ${item.statement}`;
}
```

`kernel/similarity.ts`, next to `queryCoverage`, because "the document a rule is
measured against" is a lexical question and not an indexing one. An empty `when` is
not a condition: returning `" s"` would put a stray space in the document and would
also make "has a condition" untestable by length.

**The three readers**, now one each:

| Stage | Before | After |
| --- | --- | --- |
| lexical index (`memory/store.ts`) | `${item.statement} ${item.kind} ${scopeText(item)}` | `${recallText(item)} ${item.kind} ${scopeText(item)}` |
| `minCoverage` (`apply/pack.ts`) | `queryCoverage(query.text, hit.item.statement)` | `queryCoverage(query.text, recallText(hit.item))` |
| MMR text (`apply/pack.ts`) | `text: hit.item.statement` | `text: recallText(hit.item)` |

`kind` and the scope stay in the index and out of the coverage measurement. That
asymmetry is deliberate and unchanged: BM25 may rank on `procedure` or on a scope
word a structured caller supplied, while coverage asks whether the rule mentions
the *question's* terms, which those words are not.

**The write-side half, and where it went missing.** A condition cannot reach the
store if the question never reaches the distiller:

```
τ² task file  user_scenario.instructions        ← dropped by parseTauTasks
      ↓
TauTask.instruction                             ← new, both upstream shapes
      ↓
Correction.instruction                          ← new, carried, not looked up again
      ↓
event.input.question = instruction || taskId     ← was: taskId
      ↓
distill prompt: "a trigger, in the question's own terms"
```

`TauTask.instruction` is `''` rather than `undefined` when absent: every consumer
asks "is there a question to show", and none of them should distinguish two ways of
saying no. The two upstream shapes are a bare string and
`{reason_for_call, task_instructions}`, and the object form is **joined** rather
than chosen between — `reason_for_call` is the topic and a trigger built from the
topic alone fires on every task in it.

**The measurement, not the argument.** `storeCensus` gains `conditioned` and
`unconditioned`, counted over the servable population:

```ts
const servableItems = items.filter((i) => i.status === 'active' && i.scope.domain === recallDomain);
const conditioned = servableItems.filter((i) => i.when !== undefined && i.when.trim().length > 0).length;
```

Counting over the whole store would fold two defects into one number: an item the
recall scope cannot reach is unconditioned for a different reason, and a store that
looks half-conditioned because half of it is unreachable is a store whose next
repair is aimed at the wrong end.

**What it is expected to change, stated as refutable predictions.** R51 registers
`conditioned >= 4`, `empty/requests <= 0.25` and coverage p50 `>= 12%`. The three
fail differently and each failure has its own reading: no condition means the write
path is still not the defect; conditions that do not move the empty share mean the
condition does not reach the pack; a falling empty share with a flat median means
the pack is being filled on scope alone, which is the failure `minCoverage` exists
to prevent and would make the floor the next question rather than this one.

What it never does: invent a condition the distiller declined to state, truncate
one, or rewrite a statement. A rule with no condition stays a rule with no
condition — and is now counted.

### 17.108 The resolution gate as a contract about claims

`V5-resolution` used to read one number and one bar:

```ts
pass: Number.isFinite(detectablePp) && detectablePp <= 6
```

That condition is a property of the *scenario*, and it is not reachable on τ² retail at
any sample size: 13.73pp at the 50-task half, 9.05pp over all 115 tasks, at pass^4. A gate
a lane cannot answer is not strict, it is unanswerable, and an unanswerable gate spends its
authority every time it fires.

**The replacement, stated as data.**

```ts
export const POWER_TARGET_PP = 6;

// inside buildProtocolGates
const estimable = Number.isFinite(resolution);
const withinTarget = estimable && resolution <= POWER_TARGET_PP;
const claimResolved = typeof claim === 'number' && estimable && Math.abs(claim) >= resolution;
pass: estimable && (withinTarget || claim === null || claimResolved)
```

| Input | Passes when | Why |
| --- | --- | --- |
| `claimPp: number` | `|claim| >= detectablePp` | a published direction the sample could have seen |
| `claimPp: null` | the sample is estimable | the run says it concluded nothing |
| `claimPp` absent | `detectablePp <= 6` | the lane does not report claims; the old condition stands |

`Math.abs` because the symmetry is the point: a 4pp loss at a 13.73pp resolution is as
unclaimable as a 4pp gain. The revert rule that fires on a large loss is a safety rule and
is graded by `l4-paired`; this gate is about resolution, and it must not become a second
copy of that rule.

**Why absence is not `null`.** The obvious simplification — read a missing claim as "no
claim" — makes the gate passable by omission. Any run could then be green by never
mentioning what it concluded, which is exactly the vacuous pass R50 removed from
`bin/l4.ts`. Three states cost one union type and keep the fallback honest.

**Why the target is a constant.** R52's registration proposed it as a
`ProtocolGateInput.powerTarget` defaulting to 6. The input would be the registration's own
third refutation: a bar a caller can pass is a bar a caller can raise, the only callers who
would pass one are the ones that cannot reach 6pp, and the number they would pass is the
observed resolution — `detectablePp <= detectablePp`, true by construction. A constant is
the only form that keeps the number a report rather than a permission.

**The lane half.** `Tau2Evidence.claimPp` comes from `pairedVerdict`, and the pair step
computes the verdict *before* the evidence so that the evidence can carry it:

```
comparison ──► pairedVerdict ──► claimPp (number | null) ──► protocol ──► V5 sentence
     │                                   ▲
     └──────── tau2DetectablePp ─────────┘
```

An arm artefact never sets it: an arm has no reference arm, therefore no verdict, therefore
nothing to claim — and the protocol reads that as the fallback rather than as silence.

**What the sentence prints.** Every branch names both numbers, because a reader who sees a
green gate is entitled to know what the sample could have resolved:

```text
minimum detectable 21.41pp against a 6.00pp target; the run claims no direction
minimum detectable 13.73pp against a 6.00pp target; claims 4.00pp, which is finer than the sample can resolve
minimum detectable 21.41pp against a 6.00pp target; this lane reports no claims
not estimable: no question changed hands
```

**Coverage.** `gates.ts` 100/100/100/100 — every branch above has a test, including the
`|claim| === detectablePp` boundary and the `Infinity`-with-a-claim case.

### 17.109 The pack's sentence is a variable with three levels

The note a knowledge block opens with is the mechanism's only hook on the failure one step
past retrieval. MemTrapBench's finding is that a *correct, relevant* memory anchors a model
to a frame that no longer fits the question; MemCalib's is that over-use, not under-use,
dominates; RPEval's is that humans ignore an irrelevant preference 0.86 of the time and
GPT-5 0.12. Our note said "apply an item only where its condition holds", addressed to a
model that had just been handed the rule in the same breath.

```ts
export type NoteMode = 'standard' | 'hardened' | 'none';
```

| Level | Note | Arm |
| --- | --- | --- |
| `standard` | the condition-checking sentence; **the default, byte-identical to every earlier artefact** | the control |
| `hardened` | the above, plus: *a recalled rule may describe a situation this request is not; where the rule and the current observation disagree, the observation is the evidence* | the treatment |
| `none` | no note at all | the absence of the sentence, not the absence of the pack |

Four properties the tests hold:

- the default renders the same bytes, because every committed artefact is re-rendered and
  diffed on push;
- `hardened` keeps the standard sentence verbatim and appends, so the two arms differ by one
  sentence and not by a rewrite;
- an abstention block keeps its own note at every level — that note says the opposite thing
  (there is nothing to apply, do not invent one) and blanking it would invert the block
  rather than vary the experiment;
- the added sentence carries no double quote and no ampersand, because the note is an XML
  attribute and the existing text already spends one pair of quotes on the word `when`.

The dispatch switch is `TAU_INJECTION_NOTE`, resolved by `resolveInjectionNotePlan`, and the
artefact records `{ mode, declared }`. `declared` exists because `standard` is both the
default and an arm: without it, a readback cannot tell a control from a run nobody
configured, and a three-level comparison would be reading a default as one of its own levels.

### 17.110 An experiment's identity: the scenario in the header, the store in the artefact

R51 registered three predictions about a within-scenario run and was dispatched against
`TAU_TEST_DOMAIN=airline`, set months earlier for the transfer arm. The readback graded a
retail store's rules on airline questions and fired a refutation that its own configuration
had made unreachable.

**The scenario moves into the header**, beside the recall floor, for the same reason: it
changes what the experiment *is*.

```yaml
trainDomain: retail
testDomain: retail
recallDomain: retail
```

`eval:prereg-scenario` emits `train=`/`test=`/`recall=` lines into `$GITHUB_OUTPUT`, and both
arms read `steps.recall_floor.outputs.train || vars.TAU_TRAIN_DOMAIN || …`. A registration
that pins nothing emits three empty lines, so every earlier registration resolves exactly as
before — the single rule this whole family of changes obeys.

Three refusals, each closing a way the pin could be decorative:

| Refusal | Reason |
| --- | --- |
| not `^[a-z][a-z0-9]*$` | the value is pasted into an environment variable |
| `recallDomain` ≠ `trainDomain` | recall is asked in the store's own scenario; a third domain is an experiment with no registered prediction |
| a partial pair | the rest falls back to a variable, which is the defect being removed |

**The store moves into the artefact.** `store.conditioned` counted conditions and could not
read one, so a readback could not distinguish "when the customer asks to cancel an order"
from "when this request requires cancelling" — and those predict opposite coverage.

```ts
storeItems: storeItemSample(knowledge)   // id, kind, when, statement, trust, scope
```

Bounded by `limit` and `maxChars`, with `omitted` and `truncated` counted rather than
dropped: a sample that silently halved a store would let the register of the sample stand in
for the register of the store, which is the retention-curve defect one artefact earlier.

**And the correction this produced.** R49's "38% of requests served nothing" was the
`minCoverage 0.01` floor, not the missing conditions: its own retention curve says the floor
emptied 571 of 1,516 packs while the as-is facade served 1,435 of 1,527. Three documents
attributed the emptiness to the write path; AUDIT 34.51 corrects them. The retention curve
that refuted them was added to the artefact by 34.46 for an unrelated reason and was sitting
in the same file.

### 17.111 The coverage median is two readings, and the artefact commits both

`nonzeroQuantiles.p50` answers "how much of the question does a *surviving* rule mention".
That is the right population for choosing a floor, because a floor acts on the survivors, and
it is the quantity R54's 12% bar has been read against. It is not the population the model
saw: a zero-coverage pair was delivered, injected, and paid for in tokens.

```ts
export type CoverageMedians = {
  readonly pairs: number;          // delivered pairs from measurable packs
  readonly zeroPairs: number;      // pairs whose delivered coverage is exactly zero
  readonly medianAllPairs: number; // upper median over every delivered pair
  readonly medianNonzero: number;  // upper median over the non-zero pairs
};
```

It is nested inside `CoverageHistogram` rather than written beside it, and both are computed
from one `measuredRows` pass:

```
measuredRows(observations) ──┬── coverageProfile   mean, buckets
                             ├── coverageHistogram floors, nonzero quantiles
                             └── mediansOf         both medians
```

A median built from a different observation list than the curve would be a second population,
not a second reading of the same one — the same defect as the three call sites that each
decided for themselves what a rule "says" (§17.107), and the same repair: one reduction of one
population, called from one place.

**Both medians are upper medians**, index `floor(0.5 * n)`, matching `quantileOf` and therefore
matching `nonzeroQuantiles`. A reader who interpolates between the middle pair gets a different
number and concludes the instrument is wrong; the convention is one function with one test that
says so.

**Why both, and why the gap is large.** R47's committed histogram read `nonzeroQuantiles.p50 =
0.04545` beside `injectedPairs 2188` and `zeroCoveragePairs 750`. With 34.3% of that population
at zero, the median over every delivered pair is the 24th non-zero percentile — about 0.027,
roughly half. A registration that asks for "coverage p50 ≥ 12%" and is graded on the survivors
can be met by a delivery that is four-fifths unrelated, because the survivors are by
construction the related ones. Committing the delivered-pair median does not change any bar;
it makes the second bar registerable.

**What is deliberately not done here.** No threshold is applied to either median, and the
retention curve still chooses a floor from the survivors. U3's decision rule consumes the
curve, not the medians, and adding a graded median would change what the floor is chosen from
without a registration saying so.

**Pre-R54 artefacts** carry `nonzeroQuantiles` and no `medians`. Their non-zero median is
recoverable because it is that field; their delivered-pair median is not, because the sorted
list of delivered coverages is not in the file. `eval/verifiers/r54_readback.py` reports the
first and prints the second as *not recoverable* rather than as zero, and grades nothing on it.

**The verifier has four states**, and the fourth is written in the registration:
`GRADED`, `NO_MEASUREMENT`, `DISCARDED` (the `scenario` block is not the registered pair, so
the dispatch measured a different experiment), `ABANDONED`. `DISCARDED` is a state rather than
a conclusion because a wrong configuration is not evidence about the mechanism. Its
`--self-test` runs fourteen artefacts, and `pnpm eval:verifiers` runs every verifier's
self-test, now as a CI step rather than only from `pnpm check`.

### 17.112 Instrument funnel, support as a count of tasks, and what a gate may not check

Three designs, taken together because they all answer the same question: *what has to be true before
a number from this repository may be read.* Each is a boundary rather than a check, and each one
moves a decision that currently lives in a lane into a place a test can reach.

#### The funnel is one function with three call sites

R42's failure was not a missing check; it was that the run's own accounting was internally
consistent. Thirty-two prompts, zero items, `failures: 0`, and a gate (`V44`) that passed on
`0 <= 0 + 0`. Four of the six checks a review later proposed already exist by 2026-11-08 — the
pre-flight probe, the model-alias translation, `V1`'s non-empty rate and `V44`'s non-empty store.
What does not exist is the **closure** between the three counts a distillation produces:

```
corrections ──interpreter──▶ candidates ──admission──▶ items ──recall──▶ packs
     │                            │                        │
     └── events ──────────────────┴──── distilled ─────────┘
```

A run in which `events > 0` and `candidates === 0` has an interpreter defect; `candidates > 0` and
`distilled === 0` has an admission defect; `distilled > 0` and `servable === 0` has a scope defect.
Those are three different repairs and the artefact currently reports one number, `meanPackIds`,
which is zero for all three.

```ts
export type InstrumentFunnel = {
  readonly events: number;
  readonly candidates: number;
  readonly distilled: number;
  readonly servable: number;
  /** Completions the interpreter answered with its rule fallback rather than the model. */
  readonly fallback: number;
  readonly model: { readonly name: string; readonly accepted: boolean };
};

export function instrumentFunnel(input: InstrumentFunnel): readonly InstrumentFailure[];
```

`InstrumentFailure` is a closed set of codes (`EMPTY_STORE`, `INTERPRETER_PRODUCED_NOTHING`,
`ADMISSION_REJECTED_ALL`, `SCOPE_UNREACHABLE`, `PROVIDER_REFUSED_ALL`, `INVALID_MODEL_NAME`,
`ALL_FALLBACK`) so that a driver, a gate and a verifier cannot disagree about what went wrong.

**Three call sites, one function.** The driver calls it after distillation and **stops before the
evaluation loop**, which is the difference between learning that the store is empty in ninety
seconds and learning it after an hour of pack-free evaluation. `V0-instrument-ready` calls it and
makes publication conditional, for a run that got past the driver some other way. The readback
verifier calls it and returns `NO_MEASUREMENT` rather than grading predictions against a store that
does not exist. Three call sites that each decided for themselves is the defect this whole family of
instruments exists to remove, so they share one predicate and one vocabulary.

**What the gate may not check.** The proposed version of `V0` ended with

```ts
const missing = expectedGates(a.lane).filter((g) => !a.firedGates.includes(g));
```

which reads the lane's own index to decide whether the lane fired the gates the index says it can.
The index is the thing under test: a lane that silently stopped running an arm would agree with its
own stale table and pass. Coverage is a property of the harness, not of the run, and it is asserted
in the lane's test by comparing a **fresh** run's `protocol.evaluable` against the index constants —
with the constants as the expected value, because a test that derives its expectation from the code
under test cannot fail.

The same argument fixes where **support** may be counted. `supportTasks` is computed by the store
from `evidence[].taskId` (falling back to `runId` when no task was opened, which is the existing
contract), so a test can construct eight evaluations of one task and assert they count once. It is
not computed by the pack, by the renderer, or by the verifier.

#### `minSupport` is a weight, and the store has no count

```ts
minSupport: 0.8   // policy.ts, a *weight* threshold
```

One correction at trust 0.9 carries weight 0.9, so **every single-observation claim activates**. The
distinction between "a claim seen once" and "a claim derived twice" exists in the schema
(`evidence: EvidenceRef[]`, `taskId` optional) and in the prose, and it is not applied anywhere that
decides what may be injected. The measurement that would need it does not exist either: iteration
65's corroboration arm found **0 of 1,296** BIRD rules with two independent corrections, and on τ²
nobody has looked.

The design is therefore a count, not a threshold on a ratio:

```ts
/** Distinct tasks whose evidence supports this item. One task is one observation. */
readonly supportTasks?: number;
```

carried in `storeItems` (the artefact's sample) beside `support` and `contradictions`, so a readback
can ask the question without re-distilling. Absent means "the store did not record it", which the
readback reports as `NO_MEASUREMENT` rather than as a store with no recurrence — the distinction
`eval:prior` was just taught.

#### Coverage is generated, not narrated

`protocol.evaluable` and `protocol.absent` are already in the τ² pair artefact and sum to
`GATE_ORDER` by construction. What is missing is (a) an assertion that a fresh run's sets equal the
index, and (b) the same accounting for BIRD, which fires 10–11 of 39 gates and has never said why
the rest are absent. The BIRD index is derived from committed artefacts — the fired ids are in every
file — plus one written reason per absent gate, and `docs/GATE-COVERAGE-MATRIX.md` is rendered from
both indexes so that the document cannot disagree with the table. A review found three numbers for
one table this week; the answer is to stop writing the number down twice.

### 17.113 What the funnel became when it met the protocol, and the three places it differs from 17.112

The design in 17.112 was written before the funnel had a home. Putting it in the protocol moved
three things, and each move is a decision worth recording because each one narrows what the gate can
say.

**The type is five counts, not four plus a model.** The protocol cannot name `fallback` or `model` —
the first is a τ² interpreter's rule-based answer and the second is a lane's provider — and a gate
that took them could not be evaluated by the SQL lane at all. What it takes instead is the chain
every lane with a store shares:

```ts
export type FunnelInput = {
  readonly corrections: number;   // what the learning half could teach from
  readonly candidates: number;    // what the interpreter proposed over it
  readonly admitted: number;      // created + merged
  readonly stored: number;        // items the store holds
  readonly servable: number;      // items the recall scope can reach
  readonly refused?: number;      // host-side refusals, when the lane counts them
  readonly failed?: number;       // interpreter failures, when the lane counts them
};
```

`distilled` became `admitted` because the store has two ways to accept a candidate — a new item and a
merge into an existing one — and a count that named only the first would read a run that merged
everything as a run that admitted nothing. `events` is not carried: in a lane whose unit is one
correction per event they are the same number, and in a lane where they differ it is `candidates`
that decides the interpreter question.

**The failures are a sentence, not a code set.** 17.112 proposed `EMPTY_STORE`,
`INTERPRETER_PRODUCED_NOTHING`, `ADMISSION_REJECTED_ALL`, `SCOPE_UNREACHABLE` as a closed vocabulary
so that a driver, a gate and a verifier could not disagree. In the event the gate prints the chain
and names the stage that stopped — `32 correction(s) -> 30 candidate(s) -> 16 admitted -> 16 stored
-> 0 servable: the store holds items and none is reachable by the recall scope this arm asks in`.
The information is the same and there is one authority rather than three that must agree; the cost
is that a verifier matching on a code now matches on a phrase, which is why the phrase for each
stage is a single `return` in `emptyStage()` and cannot be assembled from parts.

**The driver does not stop early yet** (repaid in 17.115). 17.112's strongest claim — *stop before
the evaluation loop, because learning in ninety seconds that the store is empty beats learning it
after an hour* — is not implemented. The gate fires at the pair, the readback returns `NO_MEASUREMENT`, and an hour of
pack-free evaluation is still spent. Recorded as debt: the repair is a `V0` evaluation inside the
driver immediately after `host.distill()`, with the same predicate, which is the three-call-sites
design the section asked for. The single predicate exists (`emptyStage`, `funnelReading`), so the
work is a call site rather than a rewrite.

Two things the design got exactly right and the implementation confirmed. The counts are taken at
boundaries the driver can see — `corrections.length`, `distillReport.candidates`,
`distillReport.created + merged`, `knowledge.length`, `census.servable` — rather than recomputed by
the projection from other fields, because a projection that recomputes is a second opinion that can
disagree with the store it describes. And the gate is *absent* on the twenty artefacts that predate
the field: a default of "ready" would have certified every one of them with a reading nobody took.

### 17.114 The coverage matrix is a projection, and the guard is a throw

`docs/GATE-COVERAGE-MATRIX.md` is rendered by `packages/eval/src/gate-matrix.ts` from three inputs:
`GATE_ORDER`, the two τ² index tables, and the gate ids in the last published BIRD artefact.

The third input is the one worth arguing about. A lane's *capability* to supply a field is a
property of its type; its *having supplied* one is a property of a run. The BIRD column reports the
second, because that is what a reader comparing two lanes needs — and it is read from a committed
artefact rather than from `GateInput`, so it moves when a run moves.

Two properties hold the document to the data:

- `gateRows` maps `GATE_ORDER` through a table lookup and **throws** on a gate that is in neither
  table. A matrix that silently omitted a gate would be exactly the drift it exists to prevent, so
  the omission is a failed build. The source is injectable (`order`, `index`) only so a test can
  reach that branch; production passes nothing.
- The counts in the header are computed from the rows, not typed. `| τ² can supply | 14 |` is
  `TAU2_GATE_INDEX.supplyable.length`, and the test asserts the rendered line against the table.

What the matrix does **not** yet do is 17.112's second half: one written reason per absent gate for
the *BIRD* lane. BIRD fires ten gates in the artefact this document was rendered against and the
type can supply thirty-nine; the twenty-nine it did not fire were skipped by dispatch inputs, not by
a missing arm, and distinguishing "this dispatch did not ask" from "this lane cannot" needs an arm
inventory for BIRD that does not exist yet. Recorded as debt rather than filled with a guess.

### 17.115 The early stop, and what a no-measurement artefact has to carry

The debt in 17.113 is repaid: `funnelVerdict(funnel)` is a protocol export with three callers — the
gate publishes it, the readback refuses on it, and the driver stops on it immediately after
`host.distill()`. Two details are what make the stop an instrument rather than an abort.

**The reason is the chain, not the conclusion.** A stop that reported *"the store was empty"* would
lose exactly the reading the next registration exists to produce — which stage refused, and how
many. The marker therefore carries `funnelReading`'s sentence:

```
32 correction(s) -> 30 candidate(s) -> 0 admitted -> 0 stored -> 0 servable:
every candidate was refused: the write path admitted nothing it was offered
```

That sentence is the one `V0` prints, from the same function, so a stopped run and a run that
reached the gate cannot describe the same store differently. It also preserves the R56 refutation
that reads *the ban is too strict*: a subject whose accepted store is empty is a finding, and it is
recoverable from a stopped run's notes.

**A funnel stop is not an outage.** `l4.ts`'s no-measurement artefact said "the provider failed its
pre-flight probe", which was true of its only producer until now. The title is neutral and the note
says *an infrastructure or instrument fact*, because the reader's next question — retry, or fix the
store? — has a different answer in the two cases.

One more change fell out of the wiring: the store is read once. The census, the funnel and the
domain ledger all describe the same listing, and three reads in a row would be three chances to
describe three slightly different stores — the defect R48 found one layer down when two readings
came from two dispatches.

### 17.116 Three hand-offs that lose a field without saying so

R56 was dispatched with one variable and four predictions, and it came back unreadable on two of
them. The cause was not in the experiment; it was in the three places a record is handed from one
shape to another, each of which dropped something and each of which produced a file that looked
complete.

**The projection.** `Tau2Raw` is what the driver observed; `Tau2ArmRecord` is what the artefact
carries; `armRecordFromDriver` maps one to the other with a hand-written field list. R56's iteration
added `funnel` to both ends and to the mapping. It also added `storeItems`, `distillForm` and
`injectionNote` to both ends — and not to the mapping. The artefact came back `distillForm: null`,
and nobody saw it, because the diff that introduced the mapping showed a field being added.

The structural repair is that the two shapes share named types (`StoreItemSample`,
`DistillFormRecord`, `InjectionNoteRecord`) instead of inline literals, so a change at one end is a
type error at the other. The mapping itself stays explicit — a spread would carry fields nobody
reviewed — and it is now covered by a test that fails against the old version. The rule this
iteration writes down: **a projection is a place where a field is lost silently, so it is a place
that needs a test that names the field**, not a place that needs care.

**The verdict.** Both readback verifiers graded a refutation whose input is `artefact["verdict"]`.
No arm artefact has that field: an arm is written by one arm's driver and cannot see the other arm.
The verdict and the paired delta are written by the pairing step into `poc-l4-pair.json`. So the
one check that decides whether R45 reverts could not fire on real evidence, and R54's inverse
prediction — *no revert branch fires* — compared `None != "HARM"` and passed. `_pair.py` now owns
both readings, `--pair` defaults to the pair file found beside the arms, and an absent verdict reads
`n/a` rather than `PASS`.

**The early return.** `r56_readback.py` decided the state before it took the readings: the missing
form returned `NO_MEASUREMENT` and the report went out empty. A reader of that report could not tell
a run that produced nothing from a run whose record lost one field — and R56 was the second. The
control flow is inverted: `readings()` runs first and returns the values the grading needs, so the
census, the coverage quantiles, the funnel, the yield and the paired verdict appear under every
terminal state.

The yield is the reading this iteration added, and it is the one that located R56's loss:

```
R54  edited 10 -> distilled 20   2.00 candidates per correction
R56  edited  8 -> distilled  8   1.00 candidates per correction
```

Both numbers are the store's own record, taken before the projection. A verifier that had returned
at the first missing field would have thrown them away, which is why the inversion is not
cosmetics: the three predictions R56 could still be graded on are exactly the ones the old control
flow dropped.

**What the three have in common.** A projection that omits a key, a check whose input is absent, and
a verifier that returns before it reads are one failure mode: the loss leaves no trace. None raises,
none prints a warning, and all three produce a file that reads as a measurement. The countermeasure
is not more care. It is a reading that is taken unconditionally, a state that is decided last, and a
test whose fixture is the *defective* shape rather than the intended one.

### 17.117 The bridge, which is where a gate's input is lost

17.116 wrote down that a projection is a place a field is lost silently, and added a compile-time
exhaustiveness guard to the driver's projection. One interval later the same loss happened again, in
a projection the guard does not cover, and it took out a gate.

The τ² lane has two hand-written projections, not one:

```
Tau2Raw            --armRecordFromDriver-->  Tau2ArmRecord   (in process, after the run)
Tau2ArmArtefact    --tau2ArmRecordOf------>  Tau2ArmRecord   (in the pairing step, from files)
```

The first is guarded by `PROJECTION`, whose decision table is typed `{ [K in keyof Tau2Raw]-?: ... }`,
so a new field cannot reach a green build without a decision. The second had no guard, and its input
type — `Tau2ArmArtefact['tau2']` — is itself a hand-written subset of what the artefact holds. Adding
`funnel` to `Tau2ArmRecord` and to `ProtocolGateInput` therefore changed nothing: the two ends the
author was looking at were wired, and the bridge between them was not.

The consequence was not a crash and not a wrong number. It was a gate that reported `absent`:

```
absent  V0-instrument-ready  needs "the lane's own record, which this run did not carry"
```

`absent` in this protocol is a *claim about the dispatch* — that it could not supply the field — and
the protocol has a whole vocabulary built to keep a capability apart from a measurement
(`SUPPLYABLE`, `Tau2Field`, the `absent` reasons). That vocabulary is what made this defect invisible:
a gate that says "the run did not measure this" is doing its job, and it takes a second reading of
the arm's file to see that the run did.

**Three rules, and the third is the new one.**

1. A field that reaches a gate crosses a bridge, and the bridge is the thing to test — not the
   endpoints. The red-first test here is `tau2ArmRecordOf('memory', { tau2: { funnel } }).funnel`,
   which is a test of the bridge and nothing else.
2. A projection carries what its consumer reads and nothing else. `tau2ArmRecordOf` deliberately
   leaves `storeItems`, `distillForm`, `injectionNote` and `writeAdmission` out: they are readback
   subjects, and a second copy of a field is a copy that drifts. A test asserts the omission, so the
   scope cannot widen by accident either.
3. **A gate whose input crosses a bridge is not supplyable until a real artefact proves it.** The
   protocol's `SUPPLYABLE` table says the *type* can produce the field; it says nothing about whether
   a run did. `gate-matrix` was built on exactly that distinction for the BIRD lane, and this defect
   is the τ² instance of it: `V0` was listed supplyable, the funnel existed, and the artefact said
   absent. The matrix's τ² column is the next thing to render from a real pair.

The dispatch that was in flight when this was found was cancelled and re-dispatched from the fix.
Cancelling is the repair this project uses for this class, because the alternative — re-running the
pairing step and committing a corrected pair — is revising a published artefact after its readout,
which is the one thing a pre-registered lane may not do.

### 17.118 Knobs, and the difference between a variable and a control

The audit added at the end of this iteration answers a question the lane had never asked: **which of
the values the code reads can a dispatch actually set?**

Three kinds of knob exist here, and only one of them is visible where it matters.

**A dispatch input** is on the workflow's menu. It is capped at twenty-five by the platform, printed
on the run's page, and impossible to overlook because the person starting the run sees it.

**A repository variable** is set outside the run and read by the workflow. It is the right home for a
property of the *experiment* rather than of the run — which claims a store admits, which sentence a
pack opens with, which form the distiller is asked for — because a registration outlives any single
dispatch. It is invisible on the run page and visible only in the workflow file, which is why the
convention is that every one of them is passed explicitly, in both arms, with a comment saying what
unset means.

**A bare `process.env` read** is neither. It compiles, it has a default, it is exercised by tests that
construct the environment by hand, and nothing connects it to any workflow. Five such reads existed,
and two of them were the entire treatment of a registered experiment.

The audit that finds them is deliberately asymmetric. It fails on a name the source reads and no
workflow mentions, and it does *not* fail on a name a workflow sets and the source ignores — because
the second class is not decidable from the TypeScript tree (`TAU_CONCURRENCY`, `TAU_RETRIES` and
`TAU_VERSION` are read by the Python half and by the shell), while the first class is exact. A check
that reports false positives is a check that gets an exemption list, and an exemption list is where
the next real defect hides.

The exemption list here has three entries, each a name rather than a pattern, each with a reason in
the same object that grants it. That is the compromise this repository uses wherever a check cannot be
made total: **exempt the instance, in the place the check reads, with the reason beside it** — never
the shape, and never in a comment somewhere else.

### 17.119 The note as a rendering option, and the budget that cannot be shared with it

R53 varies one sentence at three levels, and it could not be dispatched until the sentence was
addressable per request and its length stopped deciding which rules a pack carries.

**Where the level lives.** `RecallQuery.note` (added in 17.118's terms: a per-request field, absent
meaning the host's, both absent meaning the text every committed artefact carries). The note is text a
pack is rendered with, not state the memory holds, which is also why the level is on the query beside
`budget`, `limit` and `minCoverage` rather than only on `MicrogliaOptions`. `Microglia.recall` resolves
`query.note ?? this.note` once and passes it to `buildPack`; `NoteMode` is now derived from the kernel
union (`NonNullable<RecallQuery['note']>`) so the two cannot drift.

**Why per request and not per process.** A dispatch's corrections are produced by the model at run
time, so two dispatches of one configuration distil different stores — R54 distilled from ten
corrections and R56 from eight on the same learning fold. A registration whose first refutation is an
equality between three arms' delivery censuses therefore cannot be graded by three dispatches. One
host, one store and three recalls can, and that is the only arrangement in which the equality is a
statement about the note.

**The budget.** The note is an attribute of the wrapper and the wrapper is charged to the character
budget, so at a fixed budget the `hardened` sentence — ~110 characters longer than `standard` — bought
its room by dropping rules (AUDIT 34.69). `RenderOptions.budgetBasis` fixes the accounting:

```
note-included   overhead = |open(note)| + |close| + 1     the historical rule, still the default
note-excluded   overhead = |open(note="")| + |close| + 1  the note cannot displace a rule
```

Under `note-excluded` the rendered block may exceed `budget` by the note's length; `tokens` reports the
whole block either way, and `note: 'none'` is exactly the note-free block, so the original bound
survives for the level that has no note. The basis is a host option (`MicrogliaOptions.budgetBasis`)
rather than a per-request one: it describes what the host's budget *means*, and a host that varied it
per request would be measuring two things.

**The three-facade arm.** `resolveFacadeNotePlan` reads `TAU_FACADE_NOTES` (which the workflow takes
from `facadeNotes: three-level` in the registration) and refuses three combinations:

| Refused | Why |
| --- | --- |
| an unknown switch value | a silently disabled experiment is indistinguishable from a completed one |
| the note arm together with R49's floor pair | one dispatch measures one variable, or every delta is a difference of two |
| a single `TAU_INJECTION_NOTE` beside the three-level arm | the two declarations disagree about how many arms this dispatch has |

The driver then evaluates the same held-out split three times against one host, one store and one
seed stream, and keeps `standard` as the arm the rest of the lane grades — so `poc-l4` stays comparable
to the lane's history while `poc-l4-facade-notes` carries the three arms, two contrasts against
`standard`, the census per arm (served packs, requests, items per request, scored/unscored, pass^4,
inaction) and the basis.

**The control.** `packIdentity` compares the served statements for every request two arms both saw.
Under `note-excluded` the item list is a pure function of store, query text, floor and limit, so any
mismatch means the arms differed in something the registration did not name. A request one arm
answered two different ways counts as a mismatch for the same reason: one store cannot produce two
packs for one request. The artefact's state is `IDENTITY_BROKEN` when it fires, the `l4-note-identity`
gate blocks, and `r53_readback.py` refuses to quote a delta from it. The population that cannot be
held — which requests the agent chose to make — is reported per arm rather than asserted equal.

### 17.120 The trace as the unit, and the consolidation pass over a finished store

R58 changes which object the distiller is shown and adds a pass over the store it produces. Both are
structural: the first decides what a claim can say, the second decides whether a claim can be
corroborated at all.

**The unit.** `TracesOf` reads the learning document's `simulations[]` — `task_id`, `trial`,
`reward_info.reward`, `messages` — and extracts the assistant's tool calls in order. Three decisions
are inside it:

```
which trial   the lowest reward, because a correction exists because the task failed;
              an unscored trial ranks last but is kept when it is the only one
which calls   assistant messages only, and only those with a name: a name invented from a
              malformed entry would enter the ban's inventory and refuse every candidate
how much      at most 12 calls, with the count that did not fit carried in `omitted`
```

`traceOf(trace, { expected, rubric })` assembles the payload the prompt reads —
`{ trace: { attempt, expected, rubric?, omitted } }` — from the trace and the task's
`evaluation_criteria`, which is where the reference trajectory and the rubric already were. The rubric
travels on `Correction` now; it did not, so a trace arm could see what the agent did and only half of
what the task promised.

**The form.** `DistillForm` gains `trace`, and `buildDistillPrompt` branches to it beside `lesson`,
`repair`, `procedure` and `lexicon`. Its guidance differs from `lesson` in the two places R54 and R56
measured: `when` is *the words the person making the request used*, and the statement may not name a
tool, a function, an endpoint or an identifier. The ban from R56 still enforces the second on the host
side; the prompt states it so fewer candidates are refused after the call was paid for.

**The pass.** `consolidateKnowledge(items, { now, policy, threshold })`:

```
group     same kind, same scope key, statement overlap >= threshold (Jaccard over content
          terms, default 0.70), condition compatible (one absent, or overlapping >= threshold)
refuse    different payloads, identical evidence, or conditions that disagree — each counted
survivor  the best-attested live member: not quarantined, then most distinct tasks, then most
          evidence rows, then the smallest id (so two runs over one store produce one store)
merge     evidence = the union without repeats; support = the union's weights; trust = the max;
          tier = the strongest; contradictions = the sum; status re-scored by `decideStatus`
```

`retained` is counted from the survivors rather than computed as `considered - merged`, so a survivor
whose re-scored confidence retires cannot leave the census disagreeing with the distribution printed
beside it. A second pass over its own output moves nothing, including `updatedAt`.

**Why the write path cannot do this.** Every mechanism before this one compares *one incoming claim*
with what is stored: the exact key absorbs a repeat within a scope, generalisation absorbs a
recurrence across domains, admission absorbs a paraphrase. All three are asked at the moment the
second episode arrives, and the question a recurrence threshold asks is about the *finished* store —
which of these items are one claim, and how many tasks stand behind each. A rule that ran before the
third item existed cannot answer it, and `supportTasks` is read from `evidence`, which only grows at
write time.

**The record and the gates.** `distillUnit` on `Tau2Raw` (`unit`, `traces`, `traced`, `claims`,
`consolidation`) with a `PROJECTION` decision, so the compile guard forces the arm record to carry it.
`l4-support-recurrence` is emitted only for a trace arm and fails when the census is absent or when
either distribution does not sum to the population it describes — an instrument question, not an
outcome one. The driver refuses to start if the unit is `trace` and no correction carried a trace, and
`resolveDistillUnit` refuses an unrecognised value rather than measuring the default, which is what a
misspelt variable would otherwise do.

### 17.121 The merge floor is a containment, and the condition veto is a count

R59 replaces the pass's similarity and its condition test. Both decisions are calibrated on the store
the trace unit writes, and both are recorded in the census, because a floor that is not in the record
makes two stores incomparable without anyone noticing.

**The measure.** `claimOverlap` is `claimContainment`, `|A ∩ B| / min(|A|, |B|)` over content terms,
default floor **0.60**. Jaccard was the natural first choice and the store refuted it: a claim and its
own restatement with a different closing clause score 0.483 against a 0.70 floor, and 0.483 is the
*maximum* over all 105 pairs in that store — the floor was above the population's ceiling, so no
setting of it could merge anything. Containment charges the added clause once instead of twice and
puts the same pair at 0.700 against 0.533 for the closest non-repeat.

The denominator is chosen by size rather than by argument order, so the reading is symmetric and the
pass stays a function of the store rather than of the order its items were written in. Two claims with
no content terms score 0 and not 1: "these two claims have nothing in them" is not evidence that they
are one claim.

**The condition.** Held to `conditionMinShared = 3` shared content terms, not to a ratio. The
measured reason is that the ratio has no resolution at this scale:

```
pair                                              ratio   shared   is it one claim
the bundle-a-changes pair                          0.400      4    yes
the closest pair that is not a repeat              0.400      4    no
"asks to change a booking" vs "asks for a refund"  0.500      2    no — the ratio inverts
```

A paraphrased trigger shares more than the subject it restates; a conflicting one shares the subject
and nothing else. The count separates them where the ratio does not, and the census carries
`conditionMinShared` beside `threshold` so the two tests can be told apart in a readback.

**The record.** `ConsolidationCensus` gains `conditionMinShared`; `l4-support-recurrence` prints both
floors beside the distributions. `ConsolidationOptions` accepts an override for each, which is what
makes a stricter pass dispatchable rather than a code change.

**The attribution.** The artefact's `storeItems` is enough to re-score the store under the previous
measure, so the readback reports both readings over one population:

```
re-scoring over the store the run kept: containment 1, Jaccard 0
```

That is the difference between *"the measure changed and the numbers moved"* and *"this floor merges
one group of these 15 items where the previous one merged none"*. The re-scoring cannot read the
duplicate-evidence rule — the projection stores an evidence count, not rows — and says so rather than
reporting a floor it did not apply.


### 17.122 Two endpoints over one pair, and the rule that keeps either from being quoted alone

A paired verdict in this lane is a sign test over `pass^4`: one task, one vote, and the vote is yes
only if all four trials passed. That stays the headline, because it is what the published bar is
stated in. It is also, on this bench, a ruler too coarse to see any effect the record contains, and the
artefact has always carried the finer one.

**The two readings.**

```
endpoint          delta      se       95% interval         MDE(80%)  tasks@3pp
pass^4 (binary)    +1.75   +7.65  [ −14.04, +15.79]         —  1423
pass rate          −1.32   +2.83  [  −6.86,  +4.23]     +7.92  398
```

The binary reading is `comparison.deltaPp` and `resolution.standardErrorPp` from the pair file. The
rate reading is the paired mean of `per_task.successes / per_task.trials` over the tasks both arms
scored, with its own standard error and a `2.802 · se` minimum detectable difference — the same
constant `power.ts` and `resolution.ts` use, so the two rows are quoted on one convention.

**Why the rate is tighter, arithmetically.** The sign test's standard error is driven by how many
tasks changed hands: 19 of 57, which is `√19/57 ≈ 7.6pp`. The paired mean's standard error is the
spread of the per-task differences over `√n`: 21.35pp of spread over `√57 ≈ 2.8pp`. A task that went
from three of four to four of four contributes 0.25 to the second and 1 to the first *only if it
crosses*, so the second uses information the first discards by construction.

**Why they can disagree, which is the point.** The twelve tasks that rose sum to +3.5 and the
fourteen that fell sum to −4.25. The binary endpoint counts the ten rises that crossed into
four-of-four and none of the falls that did not. A mechanism that converts near-misses into successes
while lowering many tasks slightly therefore reads positive on one endpoint and negative on the other,
and any report that quotes one is describing half of what happened.

So the module ships with the guard rather than the verdict:

- `endpointsAgree(binaryPp, ratePp)` reports agreement, and treats a tie on either side as agreement —
  "no effect" and "a small effect" are not a contradiction.
- `eval:pair-rate --dir <downloaded run>` prints both rows, then the conflict line, then the sentence
  that a conflict is not a defect in either reading.
- No direction is claimed from either. The rate endpoint was chosen after the binary interval's width
  was known, which is a selection and is recorded as one; a registration that wants to decide on it
  names it before its dispatch.

**Degenerate cases, and what they return.** Fewer than two pairs has no spread, so `sePp` and the
interval are `null` rather than `0` — a sample of one is not a perfectly determined estimate. A zero
spread with a zero delta gives `z: null`, because a ratio with no denominator is not a large number.
Two arms scored on disjoint tasks report `pairs: 0` with `onlyFirst`/`onlySecond` populated: not "no
difference", but nothing to compare. A task with zero trials is dropped rather than read as a total
failure, which would move the mean by `1/n` of a whole task.

**What it fixes about the design.** At 57 tasks the best endpoint available here resolves 7.9pp at 80%
power. The one effect the published record establishes — lossless 67.5 against `sup3` 60.0 on retail's
`pass^4` — is 7.5pp and sits just inside that. Every 2–4pp difference between selection strategies is
outside it permanently at this sample, which is why the next registration is about yield (a larger
store to select from) rather than about a finer threshold.


### 17.123 What a readback may grade, when the run it grades has already changed the store

R59's first read exposed a class of defect that has nothing to do with the mechanism: a verifier can
grade an artefact on a population the run has already consumed.

**The case.** The attribution reading asks whether the floor was the reason, by re-scoring the stored
items under the previous measure. It was written for R58, whose pass merged nothing — so the store it
shipped *was* the population the pass read. R59's pass merged one group, and the store it ships is the
one the pass left: the merged pair is not in it, containment finds 0 groups, Jaccard finds 0, and the
prediction "Jaccard merges strictly fewer" fails. A failed prediction abandons, so a run that met
seven of seven substantive predictions read as `ABANDONED`.

**The rule this makes explicit.** A reading is gradeable only over the population it names, and an
artefact carries one store, not two. Where a pass consumes its input, three things follow:

- The attribution reading is **ungraded** when the census reports a group, with the reason printed.
  `None` is not a pass; it is "this artefact cannot answer this question", which is what the state
  machine already has a word for.
- A refutation that depends on that reading is not evaluated either. It would otherwise fire on the
  artefact's shape and convert "no evidence" into "the calibration is wrong", which is the worst
  possible direction for a false positive.
- What *can* be read from a post-pass store is what the pass did: the retired member, the survivor,
  and the readings of the pair. That is a different question and it is now graded — a merged group
  whose containment falls below the floor fires "not one claim", whatever the re-scoring says.

**The join the record was missing.** A retired item and the survivor that absorbed it were both in
the sample with nothing between them, so a readback could report a count of groups and not the pair
that made one. `StoreItemRecord.statusReason` now carries the store's own reason as written
(`consolidated:<id>`), because the prefix is the store's vocabulary and a projection that parsed it
would break the first time the store gained another reason. Artefacts written before the field are
linked by content — the live item whose statement contains the member most — which is exact for one
group, an over-estimate for more, and therefore only ever makes the "not one claim" refutation harder
to fire.

**The same shape, one layer up: the ceiling in the prompt.** `TRACE_INSTRUCTION` said "at most three
candidates" in prose while `maxCandidates` trimmed to whatever the caller passed. A dispatch that set
the option to six asked the model for three; one that set it to two asked for three and kept two. The
instruction is now composed from the number the parser enforces (`traceCeilingLine`, `traceInstruction`
in `packages/core/src/distill/llm.ts`), so R60's ceiling of six is stated to the model and applied by
the parser by construction, and the artefact carries `traceClaims: {ceiling, declared}` because two
runs at two ceilings are two experiments.

### 17.124 The planted distractor: a level counted in terms, a pair measured on one text

R57 requires a rule in every pack whose only difference between arms is what it says. Three
implementation choices decide whether that is a measurement.

**The level is a count, not a share.** A request's length is not a property the arm controls, and a
share of it makes the same rule a different dose on every request. The band is therefore the number
of the request's content terms the rule carries: `far` none, `near` and `adversarial` two or more.
The share is still recorded per request and in the census, because it is what the recall floor
measures and it makes arms comparable across requests; it does not decide the band.

**A twin pair is one token set plus a negation, enforced.** `validatePlanted` takes the difference of
the two token sets and refuses anything outside `{not, never, no}` on the added side and anything at
all on the dropped side. Without this, an authoring edit to one side of a pair silently changes that
arm's level — the first draft did exactly that with one word. The level of a pair is then measured on
the `near` text and inherited by both arms, so a marker cannot move the dose on the requests that
carry the marker themselves.

**The rule is appended, not merged.** `plantedRendered` encodes the line with the renderer's own
`encodeItemLine`, appends it before the closing tag and bumps the header's `items` count with it. The
alternative — re-rendering the pack with one more item — would re-decide which of the host's items fit
the budget, so an armed pack could differ from the control's in what it drops as well as in what it
adds. Two consequences are recorded rather than hidden: the armed pack may exceed the host's budget
by one line, and `createdBlock` counts the requests whose pack carried no block until the plant
arrived, because those requests carry the block's price as well as the rule's.

The census travels in the artefact as `plant` (`carried` in the projection): arm, declared, planted,
inBand, createdBlock, the sorted shared-term and coverage distributions, per-rule counts, and the
committed file's digest. The digest is the property that makes the rules prior to the run, which is
why the driver reads one committed path and no environment variable can point it elsewhere.

### 17.125 The floor belongs in the artefact as a grid, not in the code as a constant

R60 showed a floor that was chosen once, from a single merged pair, and never asked what it cost. The
answer, once asked, was that it cost the store its best duplicate. So the floor stops being a
constant and becomes an instrument:

```
consolidationSweep: {
  points:    [ { threshold, conditionMinShared, groups, merged, maxSupport,
                 support, crossTaskGroups, largestGroup, weakestPair }, ... ]
  operating: the point the pass actually ran at
  groups:    every group the operating pass formed, as it reported them
}
```

Three decisions make it an instrument rather than a table of numbers.

**The operating point is the pass's own result, never a recomputation of it.** The pass runs first,
its census is read, and the sweep starts from that report. A sweep that re-ran the same setting could
disagree with the pass the store was written from, and then the artefact would carry two answers to
one question with no way to tell which the store reflects. A readback asserts the agreement as its
first prediction.

**The condition floor is swept, not removed.** The operating value is 0 — no veto — and 1, 2 and 3
stay in the grid so the module that was retired is still an ablation rather than a memory. A run that
could not reproduce the setting it replaced could not show that the replacement was better.

**Support is reported as a distribution and, over a sample, as an interval.** `supportAfter` is the
distribution of items by distinct tasks, because a single maximum can hide a store collapsing into
two large groups. The sample-level sweep in `store-sweep.ts` reports `supportFloor` and `supportCeil`
per group instead of a number: without evidence rows a group of members at 2, 1 and 1 can be 2, 3 or
4 tasks and no arithmetic recovers which. The interval is enough to answer the only question the
sweep is asked — whether three tasks can be reached at all.

**Complete linkage, and the invariant it buys.** A candidate pair merges only if every member of one
group matches every member of the other. The cost is stated rather than hidden: a genuine chain of
paraphrases stays two groups instead of becoming one, and `refusedLinkage` counts how often that
happened. What it buys is that `weakestPair >= threshold` holds for every group by construction, so a
readback can assert homogeneity instead of hoping for it — and a group of three whose extreme members
share one term in five, which single linkage reported as three tasks agreeing, can no longer exist.

**Two implementations, held to agreement.** `consolidation-sweep.ts` runs over full `KnowledgeItem`s
inside the driver; `store-sweep.ts` runs over the projection an artefact ships, months later, without
a dispatch. A test asserts they agree on group count, largest group and weakest pair at every floor,
because a diagnostic that grouped a store differently from the pass that wrote it would let a
readback discover a defect that is an artefact of the diagnostic.

### 17.126 Retention: the second reading of one pair, and the three rules that make it a measurement

`pass^k` is a mean over tasks and it answers one question: did every trial of this task pass. Four
trials collapsed into one bit throws away the only information that says whether the memory *held* —
whether a task that passed on trial 1 was still passing on trial 2, or whether the first pass was luck
and the knowledge in the pack was never read.

```
HoldRate = { ordered, withoutOrder, pairs, held, rate }

rate = held / pairs          pooled over consecutive pairs, not averaged per task
rate = undefined             when pairs = 0, never 0
```

Three rules decide whether this is a measurement or a number that looks like one.

**The order is carried, not recomputed.** `per_task` rows hold `successes/trials`, and two tasks with
`2/4` are indistinguishable there — one passed trials 1 and 3, the other 1 and 2. `toPassAtK` therefore
carries `outcomes` beside the counts, and the ledger `per_trial` (`{id, trial, reward}`) carries the
same order for every artefact written before the field. `holdRateOfTrials()` builds the reading from
either, so a published run can be re-read without being re-run, and `per_task` stays the row the pairing
step joins on.

**Pooling is over pairs, and the denominator is printed.** A rate over 8 pairs and a rate over 20 are
not the same claim, and a per-task mean of per-task rates weights a task with three pairs the same as a
task with one. Both counts are carried, and the reader prints `held of pairs` beside the rate.

**A task that failed first contributes no pair.** Its later passes are evidence about *recovery*, which
this statistic does not measure; folding them in would make the rate collapse toward `pass^1` and would
report a memory that rescued a task as a memory that held it. Tasks that carried no ordered outcomes are
counted in `withoutOrder` rather than dropped, so a rate over two of ten tasks cannot be read as a rate
over ten.

**Where it is read, and what it may not be quoted beside.** The pair artefact carries `retention` for
both arms; the arm artefact carries the order the reading needs; `_retention.py` renders it and prints
`absent` — with a reason — for a pair that predates the field. The comparison it is *not* licensed to
make is the cross-paper one: `Learning on the Job` (arXiv:2607.22157) writes its memory **inside** the
episode, so its four trials are the same task recurring with the previous lesson available. This lane
writes from a separate learn split, so its trials are repeated attempts under a fixed store. Same
formula, different quantity — and the difference is a property of the corpus, not of the estimator,
which is why closing it is a registration and not a bug fix.

**Read-side and write-side are separate instruments.** The tax this reading cannot see is the one
`Memory Tax` names `faithfulness`: a detail destroyed when the item was written. This lane instruments
accessibility everywhere (`asked`, `dropped`, `served`, `store.active`, pack coverage) and faithfulness
nowhere, and no arithmetic over the delivery funnel recovers it — a store can serve every item it holds
and still have thrown the order id away at write time.

### 17.127 The in-episode arm: where a write during evaluation has to go, and the four rules that keep it honest

Appendix O and `More Memory, Worse Agents` both point at the same arm and it is the one this lane has
never run: the store is written **inside** the episode, from the trial that just failed, so trial *t+1*
of the same task reads what trial *t* taught. Their numbers are the only persistence numbers in the
field — `pass^1` 0.064 → 0.170, hold rate 0.88 / 0.65, and 59.9% for guidance that is *discarded* after
use against 49.0% for guidance that is stored.

The lane cannot produce a comparable number today, and the reason is architectural rather than
statistical: `run_split.py` freezes the store before the evaluation phase starts, and the four trials
of a task are executed by the Python side, which has no route back into the store.

#### What has to exist

| piece | where it lives | why there |
| --- | --- | --- |
| a write endpoint on the driver's recall server | `packages/eval/src/bin/tau2-driver.ts` | the server already owns the store and the host handle; a second owner would be a second view of one store |
| a per-trial boundary in the runner | `eval/drivers/tau2/run_split.py` | the runner is the only component that knows a trial ended, and therefore the only one that can order the write |
| a monotonic trial watermark | both, carried in the request | a write from trial *t* must be invisible to trial *t*, or the arm measures leakage rather than learning |
| a per-task store partition decision | `tau2-scope.ts` | a record scoped to its own task is the only thing an in-episode arm can serve; the domain scope the offline arms use would serve task A's lesson to task B, which is the *other* experiment |

#### The four rules

**1. A trial sees strictly earlier trials, and the check is mechanical.** The runner sends
`{taskId, trial, correction}` to the write endpoint and queries recall with `before: trial`. The store
filter is on the evidence's own trial index, so a record written at trial *t* cannot appear in trial
*t*'s pack — a property that has to hold against a concurrent writer, which is why the watermark lives
in the request rather than in the driver's memory.

**2. The write is the trial's own failure, not a summary of the task.** The moment a task has failed,
its correction is by definition in hand (τ²'s `evaluation_criteria.actions`), so the unit is the same
`correction` the offline arm uses, distilled by the same interpreter — with `unit=raw` available as the
cheaper treatment, at zero model calls.

**3. The cost is bounded at one distillation call per failed trial and stated before the run.** 228
trials at four per task, of which the failures are the minority. The consolidation pass stays at zero
model calls. A dispatch that cannot state this bound is a dispatch that will be read as a cost
regression three weeks later.

**4. The reading is hold rate, and it is quoted as accumulation.** With the store written inside the
episode, `P(pass at t+1 | pass at t)` becomes the quantity `Learning on the Job` reports, and 0.88 /
0.65 become comparable **in kind** for the first time. The caveat that travels with the number changes:
the offline arm's "stability under a fixed store" becomes "accumulation across attempts", and the two
must never be printed in the same column without the label.

#### What it measures that no offline arm can

Whether this mechanism's trouble is **retrieval** (the right lesson exists and is not served) or
**writing** (the lesson never existed). A fixed store cannot separate them: an item that was written
badly and an item that was written well and never served both read as "the pack was empty". The
in-episode arm separates them by construction — trial *t+1* knows exactly one thing more than trial *t*,
which is what trial *t* taught.

#### Sequencing, and why it is not first

After the store-shape comparison (R85 against R58's arm), because an in-episode arm over a store whose
items cannot be matched lexically would accumulate lessons into a pack nothing reads — and would
report that as "accumulation does not help".

### 17.128 The watermark: three absences that must not be collapsed, and two paths that both have to honour it

§17.127 lists four pieces for the in-episode arm and puts a monotonic trial watermark third, "carried in
the request". This is that piece, built in the kernel rather than in the driver, because the filter has
to hold for any host that writes between attempts — an evaluation harness, a retry loop, an agent that
runs a task twice in one session.

| surface | field | absent means |
| --- | --- | --- |
| `EvidenceRef.trial` | which attempt produced this observation | the claim was distilled offline; it predates the episode |
| `RecallQuery.before` | the attempt whose pack this is | no watermark: every published arm |
| `/v1/recall?before=` | the same, on the wire | the same |

`visibleBefore(item, before)` is one pure function of the claim's evidence, so it can be checked against
a store a concurrent writer is extending without reading anything else:

```ts
if (before === undefined) return true;
return item.evidence.every((ref) => ref.trial === undefined || ref.trial < before);
```

**Three absences, each decided rather than defaulted.**

1. **No watermark is not a watermark of zero.** `undefined` means "this store was frozen before the first
   evaluation trial", which is every arm this lane has published. Coercing it to `0` would filter those
   packs against a trial index nothing declared, and the resulting thin pack would read as memory that
   learned less — the reading a retrieval defect must not fake.
2. **No trial declared is not the latest trial.** A claim with no `trial` was distilled offline and every
   trial may read it. Reading the absence as "later" empties every mixed store, which is the same
   confusion in the other direction.
3. **Zero is a real attempt.** `if (trial)` is the shortcut that would let attempt zero's own lesson into
   attempt zero, so the comparison is `ref.trial < before` and the tests pin `visibleBefore(item@0, 0)`
   false, `visibleBefore(item@0, 1)` true.

**`every`, not `some`.** The unit a pack serves is the *item*. A merged claim citing trial 0 and trial 2
has taught the model something trial 2 said, whatever the rest of its support is — so one late
observation withholds the whole claim. Consolidation is off in the in-episode arm for the reason §17.127
gives (a fourth record neither episode wrote), and this quantifier is what keeps a store that
consolidated honest if one ever does.

**Two candidate paths, one filter.** `search` builds candidates twice: from the inverted index, and — when
a scope is supplied — from every active item that matches it. The second path exists because a rule that
generalised out of a domain carries none of the question's words. A watermark applied to the first path
only would leak exactly those rules, and would leak them into a pack where lexical overlap can never
reveal them. Both loops call `visibleBefore`.

**On the wire, a negative watermark is refused.** `before=-1` matches every item, so it is not a typo
that fails loudly: it is a leak that presents as a store that taught nothing. `recallQueryOf` refuses it
with `before is not a trial index`, the same way it refuses `minEvidence: 0` and `limit: 2.5`.

**What this does not yet do.** It does not write during the episode. The remaining two pieces are the
write endpoint on the driver's recall server and the per-trial boundary in the runner — and `§34.106`
records why the second one is a serial loop over `run_task` rather than a call to `run_tasks`: upstream
executes `(task, trial)` pairs in a thread pool and assigns `simulation.trial` after the episode returns,
so neither the order nor the index exists inside the episode.

### 17.129 Two caps, because one number bound two populations

The lane had one task number. `l4_tasks` became `TAU_MAX_TASKS`, which slices the evaluated list, and
`heldOutPlan` then splits that slice in half — so the one number decided how many tasks were learned
from *and* how many were scored. For every arm before R86 that was harmless, because the two halves were
the same experiment: 114 tasks, 57 to learn from, 57 to answer. R86 broke it by asking a question about
the **distiller** and capping the run at ten:

```
l4_tasks = 10  ->  drawn = 10  ->  split -> 5 to learn from, 5 to answer
                   of the five, one failed -> one correction -> one distillation call
```

The census needed fifteen calls. It got one, and the artefact said nothing about the population having
been decided by a number chosen for a different reason.

| header | what it caps | absent means |
| --- | --- | --- |
| `trainTasks` | the learning half, which produces the store | the repository variable stands |
| `testTasks` | the evaluation half, which produces `pass^4` | the repository variable stands |

**Both or neither.** A registration that pins one and leaves the other to a variable has its cost decided
by whichever dispatch ran last, which is the same defect one layer up. `eval:prereg-caps` refuses a lone
pin and prints two lines that `sota.yml` reads into `TAU_TRAIN_TASKS` and `TAU_TEST_TASKS`; a
registration that pins nothing prints two empty lines and nothing changes.

**Why this is a header and not a dispatch input.** It is the seventh switch of a family the record has
moved one member at a time — floor, scenario pair, note levels, form, unit, scope, ceiling — and for the
same reason: a cap is a property of the experiment. The dispatch menu also carries a `l4_tasks` input,
which now means what it always meant (`TAU_MAX_TASKS`, the pool before the split), so a registration
using the caps sets it to zero and the pool is the whole corpus.

**What it buys.** A store question no longer pays for an evaluation it does not report. R87's census
learns from 57 tasks — R58's own half, where 15 corrections and 11 faults came from — and scores one,
which is four episodes of bookkeeping rather than 228. The predicted cost is under $0.30 against the full
arm's $1.06, and the expected red `V1` is stated in the registration rather than discovered as a failed
job.

### 17.130 A record is not a claim: what the admission model assumes, and why an event fails it

§17.127 planned an arm whose unit is *order*. R85 ran the arm that is its precondition — a store made
of records rather than claims — and the store admitted one of its twelve records. This is the design
correction that came out of it, and it is a statement about the admission model rather than about the
record unit.

**The model.** `scoreKnowledge` fuses two questions:

```
evidence   is the claim supported by enough trusted observations?   logit(trust) × Σ weight per task
empirical  when applied, did it actually help?                      smoothedRate(succeeded, applied)
```

Both presuppose a **claim**: something that several observations can independently support and whose
application can be scored. A record is neither. It is one event, so its support is one observation by
construction; it is not applied as advice, so `applied` stays zero and the empirical factor stays at its
prior.

**What that costs, in the one number that matters.** With one observation at trust 0.9 and no applied
uses, a record's confidence is **0.6165** against an `activationThreshold` of 0.6 — a 1.65pp margin.
Anything at all moves it under: a contradiction halves its support, a slightly lower source trust, one
retirement check. A unit whose admission is decided by 1.65pp is not admitted; it is admitted by luck,
and R85 is what luck looks like at n = 12.

| what the rule needs | what a record has |
| --- | --- |
| several independent observations of one claim | one observation, by definitions |
| applications that succeeded | none: record `tokens.served` was filled by this lane, not `applied` |
| a scope that says two items answer one question | one scope for every task, so two records always "answer one question" |

**The correction, built at the one place that decides it.** Two items of one kind in one scope with
different content contradict each other. That is right for claims and wrong for events, so
`isEventKind` exempts the kind, and the claim path is tested beside it so the exemption cannot widen by
accident. The exemption is a **statement about semantics**, not a tolerance: two orders cancelled on two
afternoons both happened, and a store that halved the first one's support when the second arrived was
treating chronology as disagreement.

**What was deliberately not changed.** The scope. Every task opens as `tau2.act`, so records share one
scope and every recall — which asks with the same constant — reaches all of them. Making the scope
per-task would restrict each record to the task that produced it, which is the opposite of what a
retrieval arm wants, and changing it in the same dispatch as the contradiction and the ceiling would
leave three treatments and one measurement. It is the next candidate variable, stated here so the next
reader does not have to rediscover that the option existed.

**The ceiling, and why the number is a header.** 700 characters came from R84's 640-character *trace*
statement ceiling; a trace statement summarises one call and a record is a question plus an answer. The
retail corpus says p50 744, p95 1260, max 1532. The number is a registration header (`rawCeiling`)
rather than a repository variable for the same reason the floor and the scenario pair are: a ceiling in
a variable is chosen by whichever dispatch ran last, and this one decides what the arm measures.

**And the measuring instrument for faithfulness has a ceiling of its own.** `faithfulnessOf` asks
whether the store's text for a run still contains the correction's own argument values. For a record
whose first line *is* the question, a value quoted in the question survives a slice that removed the
whole answer line — so the ratio is an upper bound on preservation for this unit, measured at 64.53%
where the run itself reported 42.34%. It is used as one: a number below 0.95 still refutes the write,
and a number above it does not by itself acquit the ceiling.

### 17.131 The budget and the ceiling: one cost, two numbers, and the census that separates two empties

The pack is a character budget with a fixed cost per item, and the record ceiling is a promise about how
much text is written. They are the same cost seen from two sides, and until R89 no code compared them.

**The arithmetic, measured rather than derived.** `maxStatementChars(budget, shape)` renders a
single-item pack through `renderPack` at the pack's own options and binary-searches the longest statement
that survives. At the L4 lane's 1,200 characters, a record in this arm's shape states **810**: 390
characters are the element, the note, the id, the kind, the confidence, the `task`+`domain` scope and the
provenance payload. The function is not a second implementation of the renderer — that would be two
definitions of one number, and this repository has paid for that mistake in the ceilings twice.

| budget | capacity | retail records above it | dose |
| --- | --- | --- | --- |
| 1,200 | 810 | 41.2% (47/114) | one 700-character record |
| 1,600 | 1,210 | 7.0% (8/114) | one record of up to 1,210 |
| 2,400 | 2,010 | 0% | two 744-character records, or one 1,532 whole |

**The failure this closes.** A record above the capacity is retrieved, ranked, dropped at render, and
counted by `recall.empty` — the field that also counts a store with nothing relevant. Two states, one
number, opposite repairs. `pack.emptiedBySize` is the second state: a pack that had candidates and
rendered none of them. `pack.droppedForSize` counts items refused beside a served one, because the
largest loss is not always on the emptied pack.

**Three design decisions.**

1. **The capacity is measured on a shape, and the shape is a parameter.** A record's line costs 149
   characters more than a bare claim's. A default shape would quote a capacity for an item the arm never
   stores; `rawLogItemShape` lives beside the interpreter that writes records, and the payload keys are
   asserted in a test so the shape cannot drift from what is written.
2. **A nullable mean is one field, not two.** `summary: {meanIds, meanChars} | null` rather than two
   nullable numbers, because two nullable numbers invite a reader to print a mean over no request —
   the `0 of 0 (0.0%)` defect this lane has now repaired four times.
3. **The registration check fires only on a pair that is stated.** `packBudget` beside `rawCeiling`:
   when a registration names both, `prereg-pack.ts` refuses a ceiling the budget cannot render. When it
   names only the ceiling it inherits the lane's 1,200 and keeps its published reading, and
   `prereg-caps` prints the capacity on stderr so the mismatch is visible where it is decided. Editing
   finished runs to satisfy a validator written afterwards is the failure mode the other road has.

**Why the check is not in the reader.** `prereg.ts` is read by jobs that run before the build, so its
import closure must not reach the core package — `prereg-imports.test.ts` walks that closure and refuses
the edge. The capacity needs the renderer, so the check lives one file over, where the dispatch reader
and the gate over every registration both call it.

**The ablation this opens.** R88 (2,000 / 1,200) prices the write with the pack cutting it. R89
(2,000 / 2,400) prices the pack at the same write. A third cell at (700 / 2,400) would price the ceiling
at the same pack; without it, a lift in R89 is a lift from *more text reaching the model* and the two
causes stay entangled — which is the class of mistake this section exists to end, one level above the one
it repairs.

### 17.132 Faithfulness, decomposed: the guard's share is a separate number

`faithfulness` answers "did the write destroy the detail", and R88 is the round that showed the question
had been answered over a population two mechanisms had already been through. The writer is verbatim — a
reconstruction from the pinned corpus keeps 128 of 128 entity values at the arm's own ceiling and clips
the same two records — so the 46 values the store did not contain were removed by `kernel/guard.ts`,
whose phone rule is ten digits and whose population includes every τ² retail product id.

**The instrument, and why it is a predicate.** `faithfulnessOf(rows, items, redacts?)` counts a missing
entity as `redacted` when the caller's predicate says the guard would replace it. The predicate is
`guardReplaces` (`tau2-redaction.ts`), which calls `redact` rather than re-implementing the rules: two
definitions of what counts as personal data would drift, and the drift would be invisible in exactly the
direction that flatters a dispatch.

| decision | why |
| --- | --- |
| `redacted` is a required field of the census | a field an artefact may omit is a field a projection drops, and this lane has lost three fields to that once already |
| absent predicate ⇒ `redacted: 0`, not "unknown" | an arm that did not measure this layer must not appear to have measured it as zero |
| a missing entity the guard would leave alone stays out | otherwise the counter is an alibi for the writer |
| `kept` is unchanged, and the rate stays over the stated entities | a redaction explains a loss; it does not shrink the denominator, or an arm that redacted everything would read as perfect |
| `whole` still requires every entity kept | a correction cannot be complete by redaction |

**What the number is for.** It separates two repairs that point in opposite directions. A low rate with a
high `redacted` share is a *policy* question — what may a memory keep — and no amount of ceiling or pack
work moves it. A low rate with a low share is the writer, and that is the arm's own defect. R88 read
`82 of 128` and the readback could not tell the two apart; on its own corrections the decomposition is
exact, `82 + 46 = 128`.

**The line, so a run says it without a reader.** `faithfulness: 82 of 128 entity(ies) kept (64.1%), 46
replaced by the redaction guard, whole in 1 of 12 correction(s), 0 with none to keep`. The guard clause
is absent when the guard took nothing, so every published line that did not measure this layer is
unchanged.

### 17.133 The reference exemption: one rule withheld, by name, on the field's evidence

The guard's phone rule matches `\d{3}[ -]?\d{3}[ -]?\d{4}` and a bare ten-digit run has no property
that distinguishes it from a telephone number. What does distinguish it is the **field it arrived
under**: `product_id="7363354090"` is a row key and `phone="7363354090"` is a number. The exemption is
therefore not a widening of the pattern — it is a decision that reads the key, and it withholds exactly
one rule from exactly one shape of value.

| decision | why |
| --- | --- |
| only the phone rule is withheld, and it is withheld **by id** | a credential or an address under `api_key_id` or `user_id` is still redacted; identifier-shaped keys are precisely where those values get stored |
| a reference is a bare digit run, `^\d+$` | a row key carries no separators; `+1 415-555-2671` and `(415) 555-2671` are redacted even under `user_id`, because they are not a reference's shape |
| the key must declare it: `^id$` and `_ids?$` | `identity`, `identifier` and `paid` end in the letters `id` without naming one; a looser match would excuse a value on a coincidence in English |
| the text layer protects a **whole argument**, not a keyed value | `item_ids=["1615379700", "3613716226"]` has one key and two values; a per-key rule would keep the first and redact the second, and `["1615379700", "[phone]"]` is worse than keeping nothing |
| a list that mixes shapes is left whole to the guard | the alternative patterns require every element to be digits, so an unrecognised element makes the argument unrecognised: the exemption fails closed |
| the span is spliced, not masked and restored | equal-length masking needs the redaction not to change offsets, and every replacement changes length; segmenting the string at the spans has no such precondition |
| `redactJson` carries the key to array elements | an array under a reference key is a list of references |
| an email is redacted in every position | a ten-digit run under `*_id` is a row key by the field's declaration; an address is a person's contact detail in any field, and τ² retail's `user_id` really is one |

**The residual, stated rather than discovered later.** `user_id="4155552671"` — ten digits, no
separators, in a reference slot — is indistinguishable from a product id and survives. That is the price
of not eating every product id in the corpus, and it is bounded: a formatted number is always redacted,
`phone` is never a reference key, and a value the guard objects to on its own merits is redacted
wherever it sits.

**What the census asks, now that the answer depends on position.** `guardReplaces` is two questions, not
one: does the guard object to this string at all, and would it object with the value in a reference
slot. Every entity a census counts came from a tool argument, so the slot is known; a value that
survives the second question is one the guard would have taken anywhere, which is the only loss a
census may attribute to the guard.

| | before | after |
| --- | --- | --- |
| values kept, R88's twelve statements | 82 of 128 (64.1%) | **127 of 128 (99.2%)** |
| what the remaining loss is | 45 phone-rule hits, 1 address | the address, alone |

**Cost.** 375 raw and 25 gzip bytes on the core bundle, which is the smallest raise the size gate has
taken and the only one it has taken for a correction rather than a capability.

### 17.134 The store is a draw, so it is pinned: what a correction is a function of, and the four refusals

**The problem the design solves.** The store is built from the learn tasks whose episodes failed. The
learn half runs one trial per task. One trial of a sampled model is a draw. Two runs at the same
configuration therefore build different stores — R89 twelve corrections, R90 fifteen, eight task ids in
common — and a treatment compared across them is confounded with the population it acts on. This is not
a statistical problem and no interval fixes it: `−7.02pp` with a `±12.5pp` half-width is both inside the
noise and confounded, so the comparison is unreadable in either direction.

**The premise that makes a pin possible, stated so it can fail.** A correction's content does not depend
on the episode:

| what a record contains | where it comes from | decided by |
| --- | --- | --- |
| the question | `user_scenario.instructions` | the corpus |
| the expected calls | `evaluation_criteria.actions` | the corpus |
| the rubric, when there are no calls | `evaluation_criteria.nl_assertions` | the corpus |
| **whether this task teaches at all** | reward below 1 | **the trial** |

Only the last row is a draw, and it is a boolean per task. So the store is a function of (corpus, list),
and a list of fifteen ids is small enough to read in a diff. If the premise is false the arm says so in a
field rather than in prose: `faithfulness.entities` would differ from 172, or `pack.summary.meanChars`
from 1,825.3, and R91 grades both as equalities.

**`tau2-pin.ts`, in three functions.**

- `parseStorePin` reads `{source, failures}` and refuses four shapes: a document that is not an object
  (`unreadable-json`), one with no `failures` array (`missing-tasks`), an empty list (`bad-entry` — an
  empty store is not a pin), and a duplicate id (`bad-entry` — the count is read against the list, so a
  hand-edit that repeats one id would report a store larger than it is). `source` defaults to the
  sentence "an arm this pin does not name" rather than to empty: an artefact that says its store was
  pinned and not *what* to cannot be audited.
- `pinRewards` prices the list against the corpus and refuses an id the corpus does not hold, naming the
  first three. A silent miss is the failure mode this exists to prevent: the store would be smaller than
  the registration says while `records`, `stored` and every rate still read as measured.
- `pinnedLearn` applies the split *after* pricing, so an entry for a task this run does not learn from is
  simply not part of the learn half, while a misspelled id is still an error. It returns `{tasks,
  rewards, traces, pin, failures}` — the same shape the run branch returns, which is what lets the driver
  carry one code path for both.

**The four refusals a pinned arm is graded on**, all of them about determinism rather than about memory:
the pin is on the path (`learning.pin.failures = 15`), the write reproduces (`entities = 172`,
`kept = 171`, `redacted = 1`), the pack and the coverage reproduce (`meanChars = 1,825.3`,
`coverage.p50 = 0.28`), and the store is whole (`stored = 15`). R91's `pass^4` is reported with its
interval and **no direction**: at a fixed store the evaluation half is still a draw, so that number is
the first estimate of the draw's own spread, and it is what every later delta will be read against.

**The registration surface.** A fifth line from `eval:prereg-caps` — `pin=eval/pins/r90-retail.json` — and
a header key restricted by regex to `^eval/pins/[A-Za-z0-9._-]+\.json$`. The restriction is the check: a
header read by a paid dispatch must not name a path outside the checkout, and pins living in one
directory are pins a reviewer can diff. The workflow refuses a path that is not in the checkout before the
first episode, because the driver refuses it too and a refusal that costs a dispatch is a worse refusal.

**Cost.** A pinned run does not pay for the half it replaces: 57 episodes fewer than R90 for the same
evaluation, and nothing added to any prompt — the store's text is byte-identical by construction.

### 17.135 The query is the second draw: a census, a pin, and why the key is a position

**The problem the design answers.** A pack is a function of three things — the store, the query, and the pack
options — and until R92 the lane could name only two of them. R91 held the store fixed (fifteen records
replayed byte for byte, `entities 172 / kept 171 / redacted 1`) and the pack came back different:
`meanChars` 1,812.07 against 1,825.31, coverage p50 0.2857 against 0.2800. The query is the user
simulator's first turn — `microglia_agent.py` recalls on `message.content`, which τ² generates from
`user_scenario.instructions` — so every arm has been reading a pack built on a sampled question.

**The module.** `packages/eval/src/tau2-queries.ts`, two responsibilities that are deliberately one unit:

```
RecallInput   { index, asked, used }          one request: what the agent sent, what retrieval was given
QueryCensus   { requests, distinct, meanChars, p50Chars, digest, askedDigest, replaced, pin, texts }
QueryPin      { source, texts[] }             one text per episode, in the order the phase ran them
queryCensusOf(inputs, {pin?}) -> QueryCensus
parseQueryPin(document)       -> QueryPin     four refusals
pinnedQueryText(pin, index)   -> string       two refusals
assertQueryPinCovers(pin, episodes)           checked before the first episode is paid for
```

**Decision 1 — the census is unconditional, the pin is not.** The census is recorded on every arm, because
the record is what makes a later pin possible: R90's store pin existed only because `storeItems` carried the
statements, and R92's query pin can exist only because an arm carries its queries. The *pin* is a decision
about what the arm is measuring. An arm quoting an absolute benchmark number leaves it empty, because a
fixed phrasing is a retrieval stimulus no user typed and the number is meant to be comparable to a
competitor's on the same 40 tasks. An arm whose subject is the pack sets it, because two floors priced
against two different questions are two cells, not two levels.

**Decision 2 — the key is the episode's position, not its task.** Nothing upstream names the episode: the
agent sends `task=tau2.act` (the memory scope) on every request, `generate_next_message(message, state)`
receives no task id, and the driver's `TASK` is one constant shared by all 228 requests. Deriving the task
from the plan order would be an assumption dressed as data — a trial-major loop inside τ² would relabel every
question in the artefact and nothing would fail. Position is exactly as stable as the iteration order the
lane's per-task counts already depend on, and it is self-checking: a pin replayed into a differently-ordered
phase changes `digest`, and a readback compares digests rather than trusting the pin.

**Decision 3 — the digest is a property of the mapping, not of arrival order.** `digestOf` sorts by index
before hashing, so two arms that asked the same 228 questions in a different order compare equal. `askedDigest`
is the same hash over what the agent sent, and `replaced` counts the requests where the two differ: that
pairing is how an arm *shows* its pin took effect. R91's artefact could not show whether its store had been
replayed, and its readback had to infer it from the store's own text.

**Decision 4 — the four refusals, and the one that matters commercially.** `parseQueryPin` refuses a
non-object, a missing `queries` list, an empty list, and any entry that is not a non-empty string — including
`[[...]]`, which is what a hand edit that keeps its brackets leaves behind and which `for..of` would have
pinned as one list. `assertQueryPinCovers` runs at split time, not at recall time, because a miss inside an
episode becomes a 500 and `microglia_agent` treats a failed recall by continuing without memory: the episode
serves no pack, and the artefact still reports itself pinned. A pin *longer* than the run is accepted; it was
drawn from a phase with more episodes and every episode asked still has a text.

**Where the driver touches it.**

| site | what it does |
| --- | --- |
| `QUERY_PIN_FILE` (`TAU_QUERY_PIN`) | a repository-relative path; resolved against `REPO`, recorded unresolved, so an artefact's provenance does not carry the runner's prefix |
| `readQueryPin(file, episodes)` | refuses a file that is not in the checkout and a pin shorter than `tasks × trials`, and prints `queries pinned: N text(s) from <source>` |
| the facade callback | `used = pin ? pinnedQueryText(pin, index) : text`; both texts are recorded; `useObservations.query` is `used`, because coverage is a reading of the text the pack was ranked on |
| `tau2.queries` | the census, carried; `PROJECTION` forces a decision for the field, so it cannot be added to the driver and dropped by the projection the way `dropped` and `pin` were |

**What this changes in the artefact.** An arm from R92 onward says what it asked. An arm before it does not,
and every `meanChars`/`coverage` in the record is now read as a reading of (query draw, pack) rather than of
the pack — which is what R89 1,717.21, R90 1,825.31 and R91 1,812.07 were, three times over, on stores of 12,
15 and 15.

### 17.136 The runner boundary: two surfaces, one probe, and the three values a run must not infer

**The problem this solves is not "support two versions".** It is that `pass^4` is a number *about a release*,
and this lane had one release in its environment variable, another in its artefact (none), and a third in the
figure it ranks itself against. Supporting both versions is the mechanism; the design goal is that the
version stops being an ambient fact.

**The surface, side by side.** Nothing here is discoverable by inspection at runtime, so the table is the
contract the adapter is written against:

| piece | v0.2.0 | v1.0.1 |
| --- | --- | --- |
| tasks | `tau2.run.get_tasks(domain, task_ids)` | `tau2.runner.helpers.get_tasks(domain, task_ids=…, num_tasks=…)` |
| episodes | `tau2.run.run_tasks(**kwargs)` — twelve keywords, `save_to` among them | `tau2.runner.batch.run_tasks(config, tasks, *, save_path, results_format, console_display)` |
| configuration | keywords | pydantic `TextRunConfig` (`domain`, `agent`, `llm_agent`, `llm_args_agent`, `user`, `llm_user`, `num_trials`, `max_steps`, `max_concurrency`, `seed`) |
| registry | `register_agent(class, name)` | `register_agent_factory(factory, name)`, factory called with `tools`, `domain_policy`, `llm`, `llm_args`, `task`, `audio_native_config` |
| agent input type | `tau2.agent.base.ValidAgentInputMessage` | `tau2.agent.base_agent.ValidAgentInputMessage` |
| reward | `reward_info.reward` | `reward_info.reward` + `reward_info.reward_basis` |
| the halves | **absent** | `data/tau2/domains/<domain>/split_tasks.json` — retail 74/40 |

**The probe is an import.** `try: from tau2.runner.batch import run_tasks as _run_tasks_v1 except ImportError:
…` and `TAU_RUNNER` is the answer. A version string would be cheaper and wrong: a release that back-ported
one half of the move (helpers but not the batch signature) passes a string comparison and raises at the first
call, inside the paid phase. The probe asks the same question the phase will ask.

**The translation is one function per shape, not one call site per shape.** `run_tasks(*, domain, tasks,
agent, model, llm_args, trials, max_steps, out, save_to, seed, concurrency)` takes the lane's own vocabulary
and builds either a `TextRunConfig` or a twelve-keyword call. Two call sites would have drifted the first
time a field was added; one function is checkable against both signatures in a single reading.

**`--phase selftest` is the contract, executed.** Its four checks are properties of the installed package,
not of the repository: `get_tasks` has a `domain` parameter; `run_tasks` is `(config, tasks)` with
`save_path` and `results_format`; `TextRunConfig` has the seven fields the adapter populates; the registry
has `get_agents` and one of the two registration entry points. It prints one line — `selftest: runner v1,
get_tasks(domain), registry ok` — because a silent probe is indistinguishable in a log from a probe that
never ran. The driver calls it **before the listing**, and the test asserts that order rather than the
outcome: a probe that runs after the first paid episode is a probe that has already lost.

**Three values the artefact may not infer.**

1. **which release.** `benchmark {version, commit}`: the tag from `vars.TAU_VERSION`, the commit from
   `git -C .tau2-bench rev-parse HEAD`, and `"unknown"` rather than an omission when the checkout is not a
   repository — a tag can be moved, a commit cannot, and an arm that quotes a tag and no commit is quoting a
   belief.
2. **which halves.** `taskSplit: official` in the header, read through `splitFromOfficial`, with
   `learnIds`/`evalIds` replaced rather than intersected: a share applied on top of the benchmark's boundary
   would move the boundary the comparison rests on. Absent means the lane's own cut, which is what every
   pre-R92 arm ran.
3. **which reward.** Not a field of this lane's artefact — it is `tasks.json`'s, and the lane records it by
   *counting the corpus* at the pinned ref (`eval:label-census`, printed into the run's step summary beside
   the number). Retail: 0 of 114 declare a basis at v0.2.0, 114 declare one at v1.0.1, 112 of them
   `DB+NL_ASSERTION`. Airline: 0 at v0.2.0, 50 at v1.0.1, all `COMMUNICATE+DB` — the same grade, stated.

**The refusals are functions with arguments.** `splitPathIn(checkout, domain, release)` and
`benchmarkIdentityOf(checkout, version)` exist because the first versions read `REPO` and `process.env` from
their own bodies, which made the one branch that a dispatch had ever executed the one branch no test could
reach. The driver still passes its own checkout; the difference is that a test can pass another.

**What this does not solve.** The reward basis is recorded, not pinned: a dispatch that changed `TAU_VERSION`
between two arms would produce two numbers under one registration. The registration is the guard (it states
the split, and `benchmark` is carried in every artefact), which is the same guard the rest of this lane uses —
a value a reader can grade, rather than a mechanism that prevents the choice.

### 17.137 The rehearsal and its control: a denominator that is not the selector

**The design problem is narrower than "measure whether memory helps".** A store is distilled from *failures*: the
learn half runs every training task with no memory, and each failure writes one item. Replaying those tasks with
the store asks the only question a held-out number cannot — *does an item repair the case that wrote it* — and the
first version of that reading (R132) was wrong in one direction that no amount of arithmetic fixes.

| cell | meaning | what it was measured against |
| --- | --- | --- |
| repaired | failed without memory, passed with it | the learn draw |
| broke | passed without memory, failed with it | the learn draw |
| inert | failed both times | **the learn draw — which is also the selector** |
| kept | passed both times | the learn draw |

`inert` therefore counts "failed twice", and a task that fails two thirds of the time lands there whether or not
the store exists. The arithmetic is not wrong; the denominator is a tautology.

**The repair is a third pass, not a smaller claim.** `rehearsalControl` runs the same task list, at the same one
trial, with the same reduction, using the agent the learn half ran and **no facade at all**. The four cells are
then recomputed with the control as the *without* side, and `repaired`/`broke` become discordant pairs between two
phases that differ only in whether the store was on. `net = repaired − broke` is the store's own-case effect with
the draw held fixed; the sign is the reading.

**Four type-level decisions, each of which could have been made the other way.**

| decision | why |
| --- | --- |
| the control block carries **no** `requests` and **no** `served` | it has no facade to count, and `0 of 0 served` reads as a store that found nothing — the misreading §17.128 exists to prevent |
| `rehearsalControl` reads the phase's own wire for its dependency | two variables that can disagree about what the dispatch bought are two premises for one run; R132's first dispatch died on a switch whose ends were never joined |
| the header is refused without `rehearsal`, at read time | a comparison whose other side was never bought is a phase whose only product is a bill |
| sizing counts three passes: `trials × testTasks + 3 × trainTasks` | 74 + 40 + 74 + 74 = 262 episodes; a third pass at two trials would be 302, one over the ceiling, and the refusal names the sum before the first model call |

**Three absences, because two of them would otherwise collapse into "no effect".** No `control` key means the
registration never bought it; `control.reading === undefined` means it ran and paired nothing; `control.refused:
peak-window` means the window closed before it opened. Each prints its own clause; a `0 net` would say the store
changed nothing, which none of the three supports.

**And the phase's own refusal is a reading.** `run_split.py` declines to open a phase in a peak-rate window, which
can happen between the graded facade and the replay. That one refusal is recorded as a field with `requests: 0`
rather than thrown — the arm is already paid for, and a second phase must not take the primary measurement with
it — while every other failure throws, because a phase that crashed mid-way did spend money.

### 17.138 Two spreads: why the pool is a module and not a mean

**The problem is that this record quotes point estimates.** R131 read `pass^4` 0.625 on the arm that read 0.775 in
R123a and 0.750 in R124 — one configuration, three dispatches, and the largest was being quoted as a score. A pool
of an arm's dispatches turns those numbers into an estimate with an interval, and the part that matters is not the
mean but the **ratio of between-dispatch to within-dispatch variance**: above roughly half, the pooled value is a
summary of disagreeing runs rather than an estimate of one quantity.

| statistic | estimator | why this one |
| --- | --- | --- |
| `tau2` | DerSimonian–Laird, truncated at zero | standard for a handful of studies; the truncation is what lets a homogeneous set collapse to fixed effect instead of inheriting a negative variance |
| `iSquared` | `(Q − df) / Q` | the share of the spread that lives between dispatches, printed because it decides whether the pooled value may be quoted at all |
| quantile | `t(dispatches − 1)` when `tau2 > 0`, else `1.96` | the interval must follow the variance the estimate is made of: 4.303 at three dispatches is a factor of 2.2 on the width, and `t(1) = 12.706` on a homogeneous pair would report ±36pp for two 160-episode runs that agree, which is not conservative but wrong |

**The refusals are the design.** One dispatch is `undefined` with a sentence, because a mean of one number dressed
in an interval is the error this module exists to stop. Two `k` values throw and name both: R132 published
`pass4: 0.825` at `k: 2`, and averaging that with a `pass^4` under one name is the same defect one layer out. An
artefact with no `metrics.k` is refused by the reader with the field named, since a `k` inferred from a field
called `pass4` is how a `pass^2` enters a pool of `pass^4`s. And nothing is dropped: a pool over the readable
subset of a record's runs is a selection.

**What it settled, in one reading.** `pass^4` at forty tasks: 0.723 [0.531, 0.915], I² = 16% — the movement was
sampling. Harm share at ~29 changed trials: 38.35% [3.85, 72.86], I² = 60% — the dispatches genuinely disagree, and
that quantity is retracted. Episode rate over two arms: 84.73% [80.77, 88.69], I² = 0 — the first interval in this
record narrow enough for a 5pp claim, and a by-product of every arm already run. The design consequence is a
practice rule rather than a feature: **nothing is quoted from one dispatch, and nothing is compared across arms
until I² is under 50%.**

### 17.139 The item ledger: a join of two arrays and a third one that checks it

**The gap.** Every arm since R92 writes `pack.ledger` — the ids each request was served — and `per_task` —
whether the episode passed. Nothing joined them, so every statement this record has made about a store was
actually a statement about a *sum over items*: R133's "9 repaired / 7 broken" is a fact about packs of four, and
no field could say whether the 7 and the 9 came from the same six items. R129 (history-based deletion) is the
literature's largest published effect and it cannot be priced without that join.

**The design.** `item-ledger.ts` is pure: `itemLedgerOf({ packs, tasks, rewards, baseline? })` returns one
`ItemReading` per id — `served`, `passed`, `failed`, and a `net` that is `null` unless a store-off draw was
supplied. Three decisions:

1. **The order is checked, not assumed.** The join is positional, and three arrays carry that position:
   `pack.ledger` (one row per request), `per_task` (one row per episode), `turnCensus.rows` (one row per
   episode). The module refuses a row count that disagrees with the task list; `bin/item-ledger.ts` refuses when
   the third array names a different task than the second. One dispatcher's order is a claim; two that agree is a
   reading.
2. **`net` is `null` rather than `0` when no baseline was supplied.** "Served on three passing requests" and
   "never served" are different facts, and a zero merges them with "neutral". The sentence prints which of the
   two absences it is, because a store whose items are all neutral and a store that was never read produce the
   same silence.
3. **The sum over negative items is an upper bound and is named one.** A pack that serves four ids counts one
   break against four items, so items co-occur by construction; deleting the negative ones cannot recover their
   sum of cases, only at most it. The output says "upper bound on a deletion arm, not a prediction of one" in
   those words, so a later reader cannot quote it as an effect.

**What it already settled.** On R133's artefact, with no dispatch and no calls: 43 of 64 items served over 159
item-requests — the count matching `pack.fold.units`, which is the join's own self-check — and **21 items never
served on any of the 40 held-out requests**. A third of the store is invisible to the half that decides the score.

**The check that was missed once.** The first push of the bin failed CI on
`rewardsOf(read(read(path)))`, a nesting that the package's own `tsconfig` never sees because bins are excluded
from it and the workflow type-checks them in a separate pass (`pnpm typecheck:lanes`). The lanes command is now
part of the local loop, not a post-push discovery.

### 17.140 The bill's decomposition: three fields, one denominator, and a guard above 1

**The gap.** Every arm since R93 has reported `usage.cache`, and every arm has reported one number as if
it were two: `prefix_tokens`. The Python callback computes, per call, `system_chars` and
`conversation_chars` — where the pack and the adapter's preamble sit versus where the agent's own turns
sit — sums them into a counter, and `cache_census()` reads neither. The comment above the counter states
the purpose in the language of attribution ("whether those tokens were the pack, the conversation in front
of it, or the observation appended behind it") and the field that would answer it was never printed.

**The design.** Three additions, all derived from a callback that already runs:

1. **`system_tokens_per_call` / `conversation_tokens_per_call`** — the existing character counts divided by
   the same characters-per-token ratio the other fields use, so the two sum to `messages` and the reader can
   subtract. A premium in the first is the memory's text; a premium in the second is the agent's behaviour,
   which no renderer can fix.
2. **`tail2_tokens` and `residual_tokens_per_call`** — the second-newest message, and
   `uncached − last − tail2`. The residual is material no message carries, which on this benchmark is the
   `tools` block and the chat template's framing. `tools_tokens_per_call` is counted from the request
   (`len(json.dumps(kwargs["tools"]))`) so the residual has a named candidate beside it instead of an
   implied one. Without it, a census dividing only message characters can never reach the provider's
   `prompt_tokens`, and the gap is silently charged to the agent.
3. **`PREFIX_UNDERCOUNTED = 1.02`** — `prefix_coverage` is `credited / seen`, and `seen` stops two messages
   short of the end by construction, so the ratio is a quotient by a **lower bound** and lands above 1 on
   arms whose prefix is held perfectly well (measured: 1.4752 and 2.2639 on R134's two arms). Above the
   guard the state is `prefix-undercounted`, `repair` is `unmeasured`, and the sentence names the
   denominator as the defect. Below it, the attribution clause is printed only when `residual` says the two
   newest messages account for the bill.

**Why the guard is arithmetic rather than taste.** The previous classifier read `coverage >= 0.85` as
`prefix-honoured` and printed "the provider credited 226.4% of the 1880-token prefix it had seen … the 420
uncached tokens a call are the turn's own material, not the memory's". A share above 100% of what a
provider was shown cannot be a cache that held extra, and a verdict that names a repair anyway is a verdict
that will be acted on — which it was, in AUDIT 34.166.

**The lesson the module now carries.** An instrument that computes a quantity and does not report it has
published a story rather than a measurement. The mechanical check: every key `_census_of` returns is either
read by `cache_census()` or deleted from `_census_of`. The Python self-check asserts the split's arithmetic
(100.0 / 101.7 tokens on a fixture whose 400-character system prompt repeats three times) rather than the
counter's existence.

**What it costs.** Nothing: the callback already receives the messages and the tools, and the three fields
are divisions of counts it already holds. What it buys is the difference between "memory costs 2.25×" and
"the pack, the agent, or the framing costs 2.25×" — three answers with three different repairs.

### 17.141 The prompt's four columns, and why the verdict stopped drawing conclusions

**The problem with one number.** The provider's `prompt_tokens` is a sum over messages, tool schemas and
whatever the provider adds. The census counted messages only, so `Σchars / ratio` could never reach
`prompt_tokens` and the difference was charged to whoever the sentence blamed. R135 measured that
difference on two arms: **84.2** tokens a call for memory against **83.7** for the reference, so the framing
is not where a premium lives — but nobody could say that until the columns existed.

**The four columns.**

| field | source | what a premium in it means |
| --- | --- | --- |
| `system_tokens_per_call` | system messages | the memory's own block, including its carriage |
| `conversation_tokens_per_call` | non-system messages | the agent's behaviour |
| `tools_tokens_per_call` | `len(json.dumps(kwargs["tools"]))` | the tool schemas, billed and carried by no message |
| `residual_tokens_per_call` | `prompt − the other three` | the chat template's framing |
| `cached_tokens_per_call` | the provider | how much of the prompt it credited, which is a *fifth* axis |

The five sum to nothing: the first four add to `prompt_tokens_per_call`, and `cached` is a part of that
prompt, not a column beside it. A premium is `Δprompt + Δmiss`, and `Δmiss = −Δcached`. R135's premium is
676 + 558 = 1,234, and both terms were invisible while one number stood for the pair.

**Why the verdict is now descriptive.** It prints the four columns and the cache credit, and it draws one
conclusion only — that a share above 1.02 means the denominator is at fault (17.140). Everything else is a
subtraction the reader performs, because a sentence that performs it in prose has to reproduce the
arithmetic exactly and R135's did not (AUDIT 34.172). The `composition` clause is printed only when all
four columns are present: a sum of three and a remainder is not a composition.

**What the next instrument has to add.** The injected message's own length, recorded at the point of
injection, because the system column grew 559 tokens on an arm whose served text is 725 characters
(~149 tokens). The missing ~410 are carriage the renderer adds, they are 33% of the premium, and they are
invisible to a census that counts every system message together.

### 17.142 The identity join, and the three lengths a memory's cost is made of

**The join.** R135 produced 41 boundaries for 40 trials and every positional join in this lane refused,
correctly. The repair is not a better guess about order; it is the identity the boundary already carries.
Two decisions shape it, and both are about *which* question position answers:

| question | answered by | why |
| --- | --- | --- |
| which requests belong to boundary *k* | position, `[starts[k], starts[k+1])` | `episodeStarts` is a partition of the request stream; a name cannot improve a partition |
| which trial boundary *k* scored | identity, `boundaryTasks[k]` | a task simulated twice opens two boundaries, and only the name says they are the same trial |

So a repeated task is **one episode with two ranges**, and every consumer takes a list of ranges rather than
one start: `EpisodeOutcome.spans`, `serveSplit`'s per-group `some` over its spans, `itemTransfer`'s union
over them. Delimiting a group by "its first boundary to the next group's first boundary" would be wrong
whenever the retry is not adjacent — which a concurrent runner does not guarantee, and R135's arm is not
evidence that it is.

**The refusal that was kept.** When `boundaryTasks` is present, the identity path decides and does not fall
back to position. A boundary that resolves to nothing yields `tasks-unresolved` with the count, because the
fallback would place its requests inside another trial's outcome — the exact misattribution the field
exists to end. When the field is absent (every artefact before R136) the positional path runs unchanged,
including its refusal, and `boundaryJoin` reports `no-tasks` so a reader can tell which of the two paths
produced a refusal.

**Three lengths, one unit.** An attribution has to be a subtraction in one unit, so all three lengths are
characters and the token conversion happens once, at the end:

```text
packChars                     the rendered pack                          (memory)
injectedChars                 the message the agent injected             (memory)
system_chars_per_call         the column the provider billed             (census)
  └── system_chars_per_packed_call    the column on the calls that carried a pack
        └── carriage_chars_per_packed_call = column − injectedCharsPerPackedCall
```

Two structural choices. **The split is by role count, not by tag**: a call carrying a pack carries a
*second* system message, which is visible from `roles` alone, so a release that renames the pack's element
cannot move the split. **The denominator is the packed calls, not all calls**: the callback sees the user
simulator's calls, whose system prompt is neither the agent's policy nor the pack, and dividing an injected
length by a mixture is how a 750-character message becomes a 300-character one.

**A pair is not a number.** The carriage clause is printed only when the injection, the column and the call
count all travelled — `carriagePair` returns `null` if any of the four (including a zero-width column) is
missing, and the verdict then says nothing rather than zero. That is the same rule as `toolErrors: null`:
an arm that did not record the instrument is not an arm that measured zero.

### 17.143 The injected block, and the state the benchmark threads back

**The question the carriage could not answer.** 17.142 subtracted the injected message from the system
column and named the remainder a carriage. On the arm it was built for, the remainder was **10,400
characters a call against a 705-character message** — 4× the block — and a subtraction cannot say whether
that is a long preamble or the same block a second time. The second is what it was.

**The decomposition, in characters, with the policy made visible.** The control arm carries no pack, so it
is the one place the policy prompt can be measured: its `system_chars_per_call` is the policy and the
simulator's prompt mixed, and the memory arm's `system_chars_per_unpacked_call` reports the simulator's
prompt alone.

| quantity | memory arm | control arm | what it means |
| --- | --- | --- | --- |
| `system_chars_per_unpacked_call` | 2,017.2 | — | the user simulator's own prompt |
| `system_chars_per_call` | 7,637.7 | 5,137.0 | a mixture over both agents' calls |
| agent calls (packed / total) | 410 / 663 | 450 / 663 | the pack rides only the agent's |
| implied policy prompt | 6,614 – 7,062 | same | solved from the control's mean either way |
| `system_chars_per_packed_call` | 11,105.9 | — | policy + **copies** |
| `injected_chars_per_packed_call` | 705.1 | — | one message |
| unexplained | **3,787** | — | 5.4 copies of 705 |

**The mechanism.** τ² hands the agent's **returned** state to the next turn. A wrapper that copies the state
before appending is therefore copying the object the next turn will append to, and one block a turn becomes
10 blocks over a 10-call episode — mean 5.5, measured 5.4. The wrapper's own comment claimed the copy
prevented exactly this; the copy was the mechanism.

Two consequences follow from the same fact, and both were being read as properties of memory:

| reading | with the defect | without it | why |
| --- | --- | --- | --- |
| `cached_tokens_per_call` | 3,654.6 | should exceed the control's 4,232.7 | the block sits at the front, so a new copy shifts every message after it and the cached prefix ends at the insertion point |
| `uncached_tokens_per_call` | 1,542.4 (control 413.6) | should fall toward 500 | every call re-bills the conversation behind a prefix that moved |

**The repair: idempotence, not omission.** The block is constant for an episode, so the correct prompt has
exactly one, and any earlier copy is the agent's own output read back. `is_pack_message` identifies it by the
element the renderer emits — the only identity available, since a state carries messages and not provenance —
and the injection becomes:

```python
kept = [m for m in state.system_messages if not is_pack_message(m)]
state.system_messages = kept + [injected]
```

Three properties are load-bearing and each has a case: the **policy prompt survives** (a wrapper that reset
the list to `[injected]` would pass a count and delete the benchmark's instructions), a **stale block from
another episode is replaced rather than stacked** (a retry has a pack of its own, and two blocks that
disagree are not a treatment), and the **copy count is exact** rather than merely non-zero.

**One instrument on each side of the socket.** The census counts copies from outside, the agent counts the
copies it removed from inside, and neither can be produced by the other:

| field | side | sound | the arm that bought it |
| --- | --- | --- | --- |
| `pack_copies_per_packed_call` | census | 1.00 | 5.40 |
| `packed_calls_with_copies` | census | 0 | 369 of 410 |
| `packCopiesDropped` | agent | `calls − boundaries` | 0 |
| `system_chars_per_packed_call` | census | ≈7,320 | 11,105.9 |

The count of *calls* is not decoration: a mean of 2.0 is produced both by a phase where every call carried
two copies and by one where half carried one and half three, and those are different treatments. A verdict
that reads the mean and not the count would call the second sound.

**The test contract, which was wrong before the code was.** `episode_step` handed the same never-growing
state back on every turn, so the wrapper looked idempotent for a reason external to it. A fixture is a claim
about the caller; this one claimed tau2 passes a fresh state per turn, and the benchmark does the opposite.
The case now threads the return value, and the suite went red before the repair existed — `[1,2,3,4,5]`
against `[1,1,1,1,1]`. The general rule this record keeps re-learning: **a test that models a foreign
contract must model the half that is inconvenient**, because the convenient half is the one the
implementation already assumes.

**What is now bounded, and what is not.** Memory-side cost figures from R92 to R136 are upper bounds, and
every memory-versus-control delta in that window was measured with a repeated block. Nothing in that window
is void — the arms that found memory harmful found it under a treatment that was harmful for a second reason
— but the size of any memory effect measured there is not separable from the duplication.

### 17.144 The carriage resolved: it was the policy prompt, and the copies were the premium

17.143 made the injection idempotent and registered what the census should then report. This is the reading,
and it is the first one in this record where a memory's bill is its text.

| column | before (one copy per turn, growing) | after (one copy a call) | what changed |
| --- | --- | --- | --- |
| `pack_copies_per_packed_call` | 5.40 | **1.00** | the wrapper stops appending to a threaded state |
| `packed_calls_with_copies` | 369 of 410 | **0 of 428** | no call carries the block twice |
| `system_chars_per_packed_call` | 11,105.9 | **7,793.9** | −3,312 characters a call |
| `injected_chars_per_packed_call` | 705.1 | 737.9 | the pack itself, 735 a request |
| `carriage_chars_per_packed_call` | 10,400.8 | **7,056.0** | the policy prompt, alone |
| `uncached_tokens_per_call` | 1,542.4 | **431.5** | −72% |
| `cached_tokens_per_call` | 3,654.6 | **4,435.5** | a stable front is what a cache holds |
| `prompt_tokens_per_call` | 5,197.0 | 4,867.0 | −6.3% |
| cost, memory arm | $0.2033 | **$0.0996** | −51% |

**Three readings follow, and each is a structural fact rather than a measurement of a draw.**

1. **The carriage was the policy prompt all along.** 7,056 characters a packed call, constant, and larger
   than any estimate this record had made from a mixture (6,614 – 7,062 from the control's mean). The
   subtraction was right in 17.142 and the noun was wrong: there was no adapter preamble worth the name, only
   the benchmark's own instructions plus, in the defective arm, five extra copies of the block.
2. **The premium was the copies, in full.** 1,128.8 uncached tokens a call became **8.9**. The residual is
   smaller than the difference in served characters (735 against 706 a request, 29 characters = 7 tokens), so
   the honest statement is that the memory's uncached cost is now indistinguishable from zero at this
   precision. What was read for four rounds as "the memory makes the prompt expensive" was one line of
   Python appending to a copy.
3. **The cache recovered without being told to.** `cached_tokens_per_call` rose 21% and `prefix_coverage`
   fell from 2.19 to 1.52 on the same corpus, because a prefix that stops moving is a prefix the provider can
   hold. The lane never touched a cadence: the boundary was the bug.

**What the carriage is now good for.** With `system_chars_per_packed_call` a clean function of the policy, the
pack's own length and nothing else, the difference between two arms' system columns is a statement about
their packs. That is the precondition the dose axis never had: R99 could raise supply fivefold and read
nothing, because a bigger pack also meant a bigger duplication, and the two effects pointed the same way in
the bill and the opposite way in the prompt.

**What is still refused.** The serve split, for the second round running: 42 boundaries for 40 trials, two
unresolved. The refusal is correct — an abandoned simulation's requests belong to no trial — and it costs
every per-item reading in the arm. The repair is not a fallback to position; it is to make the abandoned
attempt visible as an attempt, which is the next registration's business rather than this one's.

### 17.145 The named ledger, and why an outcome counter needs recurrence before it needs a field

**The join.** `pack.ledger` has one row per request; `per_task` has one row per scored trial; and a harness
that re-runs a dead simulation makes the first longer than the second. The repair is not a truncation and not a
positional join — both attribute one trial's requests to another — but the identity the boundary already
carries: **row *i* belongs to boundary *i***, because a recall succeeds once per boundary and the ledger
records the requests that succeeded. `namedLedgerOf` drops the rows whose own boundary names no scored task and
reports how many, with two gates that keep it conservative:

| gate | why it is there |
| --- | --- |
| survivors == trials | a task simulated twice has two named boundaries and its rows outnumber the trials; that case needs spans, not a positional join |
| every name is a scored task | a boundary that resolves to a task this arm never scored belongs to no trial, and pairing it would be the misattribution the identity join exists to prevent |

**What the census then read, and the trap in it.**

| field | value | what it means |
| --- | --- | --- |
| items in the store | 64 | |
| items served over 40 requests | 19 | one item a request (`packLimit: 1`) |
| negative net | 2 items, −1 each | the two broken trials |
| positive net | 4 items, +5 together | the five repairs, one item repairing two |
| never served | 45 | |
| deletions recover | ≤ +2 cases | exact, because no request carried a second item |

**The identification problem, stated as arithmetic.** A deletion rule acts on an item's net. For the two
negative items the evidence is **one case each** — one served once and failed, the other served ten times with
eight passes. Under a rule that deletes net-negative items, both are deleted: the first on a single observation,
the second in exchange for eight wins. Under any rule with a support threshold (`served ≥ k` before an item may
be judged), the first is *never* judged, because it is served once in the whole arm — and that is the item that
broke a trial.

So the counter cannot be made identifiable by adding fields. It needs **recurrence**: the same lesson served
into many trials, so that an item's outcomes are a sample rather than an anecdote. That is exactly the
measurement this record already made from the other end — **41 labels over 57 items, `sup2` 2 of 66** — and the
two facts are one fact: a store that writes a distinct statement per correction cannot corroborate anything,
and a counter written onto it counts one case per item.

**The consequence for the write-side axis.** The entry condition is not the field, it is the **level at which
the item is cut**: coarsen so that ≤12 kinds cover the ≥57 corrections, an item is then served into many trials
by construction, and outcomes accumulate on the kind. Until that exists, an outcome counter is a field that
records noise with a schema. R129 is refused on this reading rather than deferred, and the refusal names its
own repair.

### 17.146 The linkage key has two jobs and the pass was using the wrong one

**The shape of the error.** A consolidation pass is quadratic in the store, so it groups items before comparing
them: `scopeKey(item.scope)` by default, or a key the host supplies. The grouping was introduced as an
affordance and then read as a measurement — *two items filed under different keys are two claims* — which the
pass cannot know before it compares their text. R121 measured the cost of the default key (60 buckets for 64
items, 4 of 2,016 pairs tested) and answered it by moving the key to the routine (R124). Both rounds reduced
the number of buckets and neither asked what happened to the pairs the key removed.

**The two jobs, separated.**

| job | what it costs when it is the only thing done | how it is measured |
| --- | --- | --- |
| narrow the search so the quadratic test is affordable | the pass can only find duplicates that share a bucket, so a store whose duplicates are cross-bucket reports `groups 0` and every refusal counter at zero | `skippedKey` — pairs the key removed *after* every other test admitted them |
| describe how the store is filed | nothing, if it is not also used as a gate | `linkage: 'scope' \| 'host' \| 'all'` in the census |

The pass now does the first only when it is asked: `linkage: "all"` stops the key removing a pair and leaves
every test that decides whether two items state one claim in force. The implementation detail that makes this
a repair rather than a loosening is that **the counter gates moved**: `skippedOverlap`, `refusedCondition`,
`refusedPayload` and `refusedDuplicateEvidence` are incremented only for a pair whose keys agree, exactly as
before, so no artefact written between R121 and R138 is reinterpreted by the new field. `skippedKey` is the
subset of `skippedScope` that passed every other test — and it is computed in *both* modes, because an arm and
its control have to describe the same candidate population or the arm's `groups` cannot be read against the
control's hidden count.

**The guards are what makes `all` an arm and not a collapse.** Six tests stand between a pair and a merge:
`kind`, containment at `threshold`, the condition floor, payload equality, duplicate-evidence refusal, and
complete linkage. `all` removes the seventh (the key) and nothing else. The suite pins the difference with a
pair of unrelated claims that stays two items under `all` — `keeps the guards in force when the key is not` —
because the failure mode of this option is that a later round reads it as "merge the store".

**Why the census had to move with it.** A pass's `groups` is only interpretable against a census that asks the
same question, and `storeRedundancy` has always asked it *without* a key. That produced two numbers in one
artefact that nobody subtracted: `redundancy.groups 43` and `consolidation.merged 1`. The census now takes a
key per row and reports `joinedWithinKey` / `joinedAcrossKey`, and its line states the share a keyed pass cannot
reach. Half a key is counted by neither and still merged — the census is a reading of the filing, not a gate on
the claim, and an early version that `continue`d before the union reported three distinct claims over three
statements while its own `joined` said one.

**The wire, and why the header exists.** `consolidateLinkage` travels the path every other switch travels:
registration header → `prereg-form` → `distill.env` → `sota.yml` → `TAU_CONSOLIDATE_LINKAGE` →
`resolveConsolidationLinkage` → the pass. A repository variable would apply to every queued dispatch, and an
unrecognised value is refused before the first model call rather than falling back to the control — the defect
this family of resolvers exists to prevent, and the one a misspelt `all` would commit silently, since `key` is
a perfectly legal value.

**What it predicts, before the number.** On R137's store the control hides **at least 34** admissible pairs and
the arm must report `skippedKey: 0`; `merged` lands between 8 and 21, from two independent ceilings (the
corrections census's `atLeastTwo 12` and the keyless claim census's 21 restatements of 64); `supportAfter[2] ≥ 8`
and `maxSupportAfter` between 5 and 9. If `groups < 8` with `skippedKey == 0`, the cross-key pairs are not one
claim and the write-side axis closes as a finding rather than a deferral.

### 17.147 Two reasons a boundary resolves to no trial, and only one of them may be dropped

**The refusal.** R123's mechanism check splits an arm's episodes by whether the pack was served, and it is the
only within-arm comparison the lane has. It refused on R138's arm — **42 boundaries for 40 trials** — because
τ² re-ran two simulations whose first attempt died and each abandoned attempt opened a boundary no trial owns.
`pairAttribution` still returned its trial-level 5-and-2, so the loss was specific: the gate comparison
disappeared while everything else in the artefact was intact.

**Why the boundary count and the ledger length are not the same number.** `episodeStarts` is a partition of
the request stream: consecutive entries bracket one episode's requests, and a re-run appends a new range for a
task it has already scored. So the ledger is longer than the trial table by exactly the requests the abandoned
attempts sent, and a join that requires the two counts to agree is asking the instrument to be something it
is not.

**The distinction the join now makes.** A boundary that resolves to no trial does so for one of two reasons,
and they call for opposite actions:

| `boundaryTasks[i]` | meaning | action |
| --- | --- | --- |
| `null` | the harness could not resolve the attempt — an episode that died and was re-run | drop the range, count its requests, keep measuring |
| a task id the arm never scored | a mislabelled artefact | refuse the whole reading |

`boundaryJoin` returns `unresolved` (the total) and `abandoned` (the nulls), and `serveSplit` proceeds only
when every unresolved boundary is abandoned **and** a coverage test passes: every scored trial must still be
opened by a surviving boundary. A trial whose only boundary was abandoned has no requests in the phase, and
counting it as `withheld` would report a refusal that never happened; that case is a named absence,
`trial-uncovered`.

**The number that makes the drop honest.** `ServeSplit.droppedRequests` is the requests the abandoned ranges
contained, counted from the spans rather than from `ledger.length − trials`, because a retried task lengthens
the ledger too and the reading is specifically about requests that belong to *no* trial. On R137's pair it is
**2**, printed as `2 request(s) belonged to abandoned attempt(s) and are in neither rate`.

**What the reading was worth, and what it was not.** The split now measures on R137's pair —
`served 36 of 40 = 90.00% [76.9, 96.0]; withheld none measured` — which says the gate withheld nothing, because
the registration set `recallFloor: 0`. It is a reading of the gate rather than of the memory, and it will stay
uninformative until an arm names a floor that withholds. The repair is filed as an instrument for that reason:
its value is that a future arm with a floor can be read at all, not that this arm's number moved.

### 17.148 The support floor: where it runs, and the four things that decide whether it can be read

**The gap it fills.** R139's store carried `supportAfter {1: 44, 2: 8, 3: 2, 4: 1}` over 55 items — eleven
corroborated claims — and the pack served 21 distinct items over 40 requests, three of them net-negative and
all three singletons. A pass that *labels* recurrence is not a mechanism that *acts* on it, and the cheapest
act is a threshold on the label at the moment the memory is served.

**Where it runs is the whole design.** Four candidate sites, one accepted:

| site | what breaks |
| --- | --- |
| write side, on admission | the label does not exist yet: support is a property of a finished store |
| inside the recurrence pass | the pass would stop being a census and start being a policy, and the ablation that prices merging would be measuring two changes |
| the recall path / facade | another process, and a second implementation of a rule the store's own `statusReason` vocabulary already states |
| **after the pass, before the funnel gate** | accepted |

The fourth is chosen for a reason that is empirical rather than aesthetic: `funnelVerdict` reads
`servable` from the census of the store the recall path will open. A floor applied after that read is priced
as a store that carried something and served nothing — the sentence R42 paid an hour of pack-free evaluation
to misread, and the one R120's census exists to prevent.

**Retirement, not deletion, and not a quarantine.** `status: retired` with `statusReason: "support-floor"`,
`systemUntil` set to the pass's clock. Three consequences, all wanted: the store's index already skips
non-active items so the recall path needs no change; the census groups the retirement under `reasons`, so the
mechanism's population is legible beside the consolidation pass's own; and the act is reversible, which is what
lets a readback price what the floor removed by re-activating it.

**The support it counts is the score's own definition, including the fallback.** Distinct `taskId` over an
item's evidence, with `run:<runId>` standing in when a record names no task — the trace unit's records are
exactly that shape, and a floor that read `taskId` alone would count every one of them as zero support and
retire the store. Two attempts of one task count once: a floor that counted evidence rows would keep an item
two episodes of one task taught and serve it as though a second task had agreed.

**Four ways it can be unreadable, and the field that sees each.** `supportFloor.retired` out of band with the
pass's `supportAfter[1]` means the population was mispredicted; `reasons['support-floor']` disagreeing with it
means the write-back was partial; a *served* item with support 1 means the floor did not reach the pack; and
`retained` equal to the store's length means the switch never resolved. That is why the record travels in the
learning block *and* in the diagnostics of a refusal: `0 servable` over seventy items is two facts — a floor
that emptied the store, and a distiller that wrote nothing — and only the record separates them.

**The join its criterion is written in, and why it is a module.** "No served item carries support below the
floor" spans two artefacts: the attribution table says which item the pack served and what it did, the store
sample says how many tasks stand behind it. On R139's pair that join was a python script written after the
number arrived, which is this record's oldest defect shape. `serveSupportCensus` decides it once and prints one
line:

```
serve support: 21 of 55 servable item(s) served; support 1: 19 item(s), 5 broke, 5 kept, net +0;
support ≥2: 2 item(s), 0 broke, 1 kept, net +1; floor absent, so a floor of 2 would have retired 19 of the 21
```

Two readings are exclusive inside it and that is the design: on an arm that ran no floor the useful number is
the **counterfactual** (what a floor of two would have removed), and on an arm that ran one the counterfactual
is meaningless because a floor that ran and let a singleton through is a carriage defect and not a prediction.
Two refusals sit beside them — a served id the capped sample omits counts as **one task**, because the store
writes one task per correction and a bucket named `unknown` would make the census look like it measured
something it declined to; and an artefact with no sample at all is *absent* rather than empty, because a map
built from nothing would call every served item a singleton.

**What it costs.** Nothing. The floor is arithmetic over evidence the store already carries, it makes no model
call, and the census rides the run that was going to be made anyway — which is why its first read is a $0.20
dispatch on R139's own pair rather than a new lane.

### 17.149 The cut is a header: what a share may and may not be

**The defect it closes.** The boundary between the half a store learns from and the half it is scored on has
been `TAU_TRAIN_SHARE` since the lane was written — a repository variable, defaulting to 0.5, read by one line
of the driver and by nothing in the artefact. R92 moved the *split* into the registration (`taskSplit:
official`) precisely because a number produced on a half the benchmark does not define cannot be ranked
against one that is, and the lane's own cut stayed outside the record for every arm that did not name one. R142
is the first arm to go back to the lane's cut deliberately, and a deliberate cut that no diff states is the
same defect wearing the opposite sign.

**Three decisions, and the alternative each one refuses.**

| decision | the alternative, and why not |
| --- | --- |
| a **share**, not two counts | counts go stale the moment the corpus is re-listed: 57/57 is a fact about retail's 114 tasks at 0.5, not a fact about the corpus |
| one **spelling**, `0.` plus digits | `half`, `50%` and `.5` are one number in three registers; a header a later dispatch compares to a variable must have one |
| refused **with** `taskSplit` | the benchmark's halves are not cut by a number, so a registration naming both states a boundary that one line would read and the other ignore |

The open interval is enforced by value rather than by range check: a share of one holds nothing out and a share of
zero learns from nothing, and both leave a run whose two halves are one half — the failure mode a `0 < share < 1`
check states and a clamp would hide.

**Why it is a header and not a menu entry.** `l4_train_share` already exists as a dispatch input, and it stays:
the menu is for the operator, the header is for the record. What changes is precedence — registration first,
menu second, variable last — so a dispatch that names a registration cannot silently run a different cut than
the one the registration's prediction was written against. `prereg-caps` prints the line only when the
registration states one, for the reason the store pin is printed that way: a default no registration authored
must not appear in the record as if one had.

**What it does not change.** `splitTaskIds` is untouched, so 114 at 0.5 is still the 57/57 every pre-R92 arm ran
on, and every arm whose registration omits the header reads exactly the value it read before. The change is
where the number comes from, not what it is — which is the property that lets R142 be compared to the arms
before it at all.

### 17.150 The window is checked per run, because a per-phase guard is a guard that fires after the money

**The failure it closes.** R142's first dispatch began at 00:47 UTC with thirteen minutes of off-peak left. The
learn half is a legitimate run and it ran; the eval phase began at 01:19, inside the peak window, and the
runner refused it. `$0.1617` bought a store that nothing scored. The guard was working exactly as written — per
phase, at the moment a phase starts — and the property nobody checked is the one a dispatch has: *does the whole
run fit in the window it starts in?*

**Where the arithmetic lives.** `windowFit({now, episodes})` in `window-fit.ts`, with `episodes = (train +
test) × trials × arms`. Three things are inputs and all three are already in the record: the caps come from the
registration (`prereg-caps` prints them), the arms from the dispatch's own `l4_arms`, and the window from the
rate card `cost.ts` prices with — so the guard and the bill cannot disagree about when peak is.

| decision | the alternative, and why not |
| --- | --- |
| a **pure function**, refused by a command | twenty lines of `date` arithmetic in a step, which is where `planBandWait` lived before it was extracted and where it was run by one job and not the other |
| **26 s an episode**, measured on R141 | a per-lane constant per phase; the difference between a learn episode (distillation included) and an eval one is real, and a single conservative constant errs toward refusing a dispatch that would have fitted rather than toward the failure this exists for |
| **refuse**, never wait | waiting hides a dispatch that named no window behind a two-hour job; `not_before` is the stated way to wait and `planBandWait` already prices it |
| refuse a **zero-episode** estimate | a dispatch whose caps are unpinned would otherwise read as a free run — the same defect as a floor that reads an absent sample as a singleton store |

**The refusal names the hour.** `Dispatch with not_before: 04:00` is a string an operator pastes; a guard that
says "not now" and not "at four" is a guard that gets overridden, and overriding it at double price is the
history R77/R78 already wrote down (`$0.531` at 23:19 against `$1.111` at 03:19 for the same experiment).

**What it does not replace.** `--require-off-peak` stays exactly where it is. The runner's refusal is the
authority — it reads the provider's clock at the moment of the call and this guard reads a rate card — and a
run whose estimate was wrong must still be stopped by the layer that bills it. This adds the check that was
missing in front of it, at the only point where being wrong is free.

### 17.151 A capped sample is a prefix, so absence from it is not evidence

**The defect class, stated once.** The record has three prior instances of an absence read as a fact: R42's
empty store read as "the mechanism did not work", R137's carriage counted where it could no longer act, R141's
`servable` denominator omitted rather than printed. This is the fourth, and it is the first where the absence
belongs to an *instrument* rather than to a run.

`storeItemSample` caps at 64 rows and says so — `omitted: 19` on R141 — and `serveSupportCensus` read every id
not in those rows as one task. The store writes one task per correction, so that default is right for a
*complete* sample and wrong for a prefix: on R141 six of fourteen served records were among the nineteen the
sample left out, each a member of a consolidation group carrying two or three tasks.

**Two decisions, and the alternative each refuses.**

| decision | the alternative, and why not |
| --- | --- |
| resolve a merged member **through its group** | joining on the id alone, which loses exactly the records corroborated enough to merge — the population a floor of two exists to keep |
| a truncated sample's unresolved ids are **counted, not bucketed** | the old default of one, which prints a singleton bucket the store never had, or a bucket named `unknown`, which makes the census look like it measured what it declined to |

The `truncated` flag is derived from the sample's own `omitted`, not from a length comparison: the writer knows
what it left out, and a reader inferring it from `items.length === limit` would be wrong on the one sample whose
store happened to be exactly 64 items.

**What the corrected census changes, and what it does not.** R141's score does not move. The attribution does:
three repairs the shipped join credited to singletons belong to support-2 records, so `support ≥2` becomes
14 items with 5 kept and 1 broken, and the reading "the floor traded repairs for harm" loses its evidence. That
reading was never written down as a finding, which is the only reason this defect cost nothing but a day.

**Why the cross-fit lives beside it.** The same join is what a cross-fit's denominator rests on, and the same
discipline is what its guards enforce: an id a fold does not name is not evidence of anything. `crossFitPool`
refuses a fold that cannot state its learning half for the same reason the census refuses to bucket an id it
cannot resolve — **a check that cannot run must not be reported as a check that passed.**

### 17.152 Opportunity is the denominator, and the corpus's headroom is the confounder

**The question.** Every outcome counter this record considered (§R129, refused twice on evidence) needed to know
what a served record *could* have done. Repairs per render cannot answer it: a render lands on a trial the bare
agent already passed, where no claim can repair anything, and on τ² retail that is most of them.

**The decomposition.** A render has exactly one of four outcomes, and only two of them are decisions the memory
made:

| | memory passed | memory failed |
| --- | --- | --- |
| **control passed** | `kept` — inert | `broke` — the memory cost a pass |
| **control failed** | `repaired` — the memory bought a pass | `inert` — nothing changed |

`repairs / opportunities` is the conditional value; `breaks / (renders − opportunities)` is the conditional
damage. R141: **5/7 = 71.4%** and **1/33 = 3.03%**, against a marginal `+10.00pp` that hides both.

**Why the counter needed this and not more data.** "Zero repairs" is evidence only relative to a rate. The
binomial lower tail `P(X ≤ repairs | n = opportunities, p = rate)` gives the test, and the threshold is
`ceil(log α / log(1 − p))` — **three** opportunities at R141's rate, **sixteen** at a corpus-wide 17.5%. The
most-served record had one. So R138's conclusion ("recurrence is the missing piece") was right about the
symptom and wrong about the cure: R141 *had* recurrence — nine renders — and the counter still could not act,
because recurrence and opportunity are different populations and only the second is a denominator.

**The confounder this names.** The opportunity share is a property of the **corpus**, not of the memory: 33 of 40
held-out trials were passed by the bare agent, so 82.5% of the memory's exposure could only be inert or harmful.
Two arms of the same lane on a harder split would show a different conditional rate with the same store, which
means **any cross-arm comparison of repair rates has to state the headroom it was measured at** — and the
cross-fit (§17.151) doubles the population without touching the headroom.

**What it does not claim.** A render that landed on an opportunity and did not repair it is not a failure of that
record: the pack carried one record and the trial had ten turns, and the record may have been irrelevant to the
turn that failed. The census is a population statement — how much of the memory's exposure was live — and the
per-record tail is a *screening* statistic with the same standing as the transfer table's net: a candidate for
an ablation, not a verdict.

### 17.153 A partial join is a reading with a counted hole, not a refusal

**The contract.** `pairedEpisodes` joins episode boundaries to trials by task id, with a positional fallback.
Two outcomes were conflated in one condition: a boundary that resolved to no trial, and a join with nothing
measured. The first is a hole; the second is an absence of a reading.

| condition | measure | publish | why |
| --- | --- | --- | --- |
| no boundary resolved | `measured.length === 0` | refuse (`undefined`) | there is no table |
| some boundaries resolved | `measured.length > 0` | publish, with `unmatchedRequests` | the hole is a field |

`unmatchedRequests` is computed from **coverage of the spans**: a boolean per ledger request, set by the spans
the resolver returned, and counted at the end. The previous expression — `ordered.length === 0 ? ledger.length :
0` — tested the join's input and reported a property of its input as if it were a property of its output; on the
arm that had dropped a boundary it read `0`, because that arm had episodes.

The positional fallback keeps its own precondition unchanged: it is used only when the arm recorded no boundary
names at all. A named boundary the reader cannot honour does not fall back, because `end` is derived from the
next episode's start, which is the assumption the names exist to replace.

**What travels with the reading.** `itemTransfer` now returns one `ServeRender` per record per episode —
`{ id, trial, repaired, broken }` — so the yield census is a function of the artefact rather than of a
reconstruction. That is the shape §17.152 needed and could not get: `repairs / renders` versus
`repairs / opportunities` is a difference of denominator, and the denominator is only visible if the per-render
outcome is a row.

**Interaction with the cross-fit (§17.151).** The same artefact now carries `foldSplit` and `treatment`; a pool
refuses a file without them. The two work in opposite directions on purpose: the fold refuses what it cannot
check (a leak), and the attribution publishes what it can (a hole). Both are the same rule — *state the part you
cannot see* — applied to a sample the instrument cannot verify and to a join it can only partly resolve.

### 17.154 The waiter publishes the instant, and a guard is a value its dependants read

**The contract.** `not_before` is parsed exactly once, by `eval:wait-band`. Everything downstream consumes
what that step publishes:

| output | consumer | what it is for |
| --- | --- | --- |
| `wait_min` | the two deadline checks, which subtract it from the job limit | how long the job has already been asleep |
| `start_at` | `eval:window-fit`, which needs a moment rather than a wait | when the run actually starts |
| `fits` | both L4 arms' `if:` conditions | whether the window guard permits the spend |

`window-fit`'s own `now` is `new Date(TAU_START_AT)` when the variable is present, and `planBandWait` only when
it is not (a dispatch with no window). An unreadable `TAU_START_AT` is a refusal that names the variable; a
fallback to the wall clock is the defect this key removes, because the clock at the check is not the instant of
the start and at a window boundary the two are on opposite sides.

**Why the guard is an output and not an exit code.** GitHub adds an implicit `success()` to a step's `if:` only
when the expression names no status function. Both arm conditions name something — one an input comparison,
one `!cancelled()` — so exactly one inherited the gate and the other ran after the refusal. A step that fails
is a red job; a step that **publishes its answer** is a gate. The arms read `steps.window.outputs.fits !=
'false'`, which is empty on a push run (no guard) and therefore true.

**The arithmetic the guard now performs, on the values R142's registration pins.** 114 tasks × 1 trial × 2 arms
= 228 episodes × 26 s = 99 minutes, plus 10 minutes of setup: **109**, against the 120 minutes an 04:00 start
has before 06:00. It fits — which is what the guard would have said at 04:00:22 had it been given 04:00:22
rather than the string `04:00` and its own clock.

**And the case it must still refuse.** The same 228 episodes started at 05:30 need 109 minutes against a
window closing in 30, and the line names `not_before: 06:00` — a refusal that says when, because a guard an
operator cannot satisfy is a guard an operator overrides.

### 17.155 Attribution is a field; a count is a grain — and the difference is asserted

**The contract.** `ServeRender` carries `task?: string`. It is set by `itemTransfer` from `EpisodeOutcome.task`,
which both join paths in `pairedEpisodes` fill from the trial row's `id`. The field exists for grouping and for
nothing else:

| question | reader | grouped by | divided by |
| --- | --- | --- | --- |
| what did a record do with what it was given | `serveYieldCensus` | record | opportunities |
| where did the harm land | `serveTaskCensus` | task | nothing |
| where did the money go (per episode) | `itemTransfer` | record × episode | nothing |

Three grains, three readers, and no statistic divides by a task. The invariant that keeps it that way is a test
rather than a convention: `serveYieldCensus` must return a deep-equal table on the same renders with and
without `task`. That is the only form of the guarantee that can fail when somebody later adds a division.

**`contested` exists because net zero is two readings.** A task whose repairs equal its breaks has `net 0`,
which is also what a task the store reached and changed nothing about reports. `contested` is the list of tasks
where both directions occurred — evidence that a record is *wrong* for that task rather than irrelevant to it —
and it cross-cuts the net classification on purpose:

```
net < 0                      harmed
net > 0                      helped
net = 0                      neutral
repairs > 0 && breaks > 0    contested   (an independent flag, not a fourth bucket)
```

**Absent is a state.** `task` is optional, and `exactOptionalPropertyTypes` makes "no key" different from
`task: undefined`. `serveTaskCensus` therefore has three line forms rather than one with a zero in it: no
render at all, a render that named no task (every artefact written before this round), and a population. The
middle form is the honest reading of an artefact that cannot answer the question, and it names how many renders
it could not attribute instead of leaving them out of its own total.

**What this deliberately does not join.** The record's text and its *source* tasks. `storeItems` is a sample
capped at 64 rows of 83 and carries `supportTasks` as a count, not as a list, so a claim cannot yet be read
against the tasks that taught it. The join grain is now in the artefact; the provenance is a distillation-output
change, and it is scheduled rather than assumed.

### 17.156 Three axes of a serve, and the fourth thing a registration may fix

**The axes.** A pack is a function of (store, query, options), and the lane has been able to vary two of the
options since R55.1 and R109. R150 adds the third, which the product has always had:

| axis | question | vocabulary | default |
| --- | --- | --- | --- |
| `packMode` | *where* a pack is served from | `retrieved` / `prefix` | `retrieved`, undeclared |
| `packShape` | *what unit* it is written in | `per-failure` / `collapse` | the unit the distiller wrote |
| `serveAnchor` | *what may appear inside it* | `lexical` / `scope` | `scope`, and the wire says nothing |

The third is deliberately not a third `PackMode`: that type's own contract says its names are **places**, and a
filter on what may appear inside a place is a different question with a different default. Its plan
(`serve-anchor.ts`) returns knobs, not a mode, and `declared` distinguishes "this arm is the default" from
"nobody said" — the distinction `PackModePlan.declared` exists for, one axis over.

**The join.** `knobFragment({mode, shape, anchor})` in `pack-knobs.ts` merges the three plans' knobs into one
`name=value&…` string, and refuses the one combination that cannot be honoured:

```
TAU_PACK_MODE=prefix + TAU_SERVE_ANCHOR=lexical  ->  refused
```

because `prefix` sets `anchoring=scope` (no retrieval) and the anchor would set `anchoring=lexical`; one request
cannot carry both and the last key wins in silence. The join is a pure function rather than code in a bin so that
the rule is tested by assertions rather than by process launches — the previous shape needed four `npx tsx`
spawns to check what four `expect`s check now.

**The record.** `tau2.pack.knobs` carries the fragment verbatim, empty when the arm carried none. It is the only
trace of the filter, because by the time the request is made `anchoring`, `minCoverage`, `limit` and `budget` are
one string.

**The identity.** `treatment` is what the cross-fit pool refuses two folds over, and it gains `knobs` as a sixth
field:

| fold A | fold B | pool |
| --- | --- | --- |
| `anchoring=lexical` | `anchoring=lexical` | pools |
| `anchoring=lexical` | `''` | **refused**: two filters, two experiments |
| `''` | absent (pre-R150 artefact) | pools: both normalise to `none` |

The string is compared and never parsed. An anchor re-derived from `anchoring=…` would be a second reader of a
vocabulary that lives in one module, and the two readers would disagree the first time a knob was added — which is
the defect §34.117 and §34.185 both record.

**What a registration may now fix, in one list.** Unit, form, scope, trace ceiling, pack mode, pack shape, serve
support floor, speak margin, serve anchor — nine properties of one experiment, each with its own resolver, each
refused when it contradicts another. The list is the answer to "what can two dispatches of one registration
differ in", and it is meant to be complete: a property that is not here is a property a run can only describe
after the fact.

### 17.157 The rung priced from the outcome ledger, and the premise the estimate states

**The join the sweep makes.** Three arrays, one row per request, in arrival order:

| array | carries | written by |
| --- | --- | --- |
| `pack.ledger` | the record ids served at that request | the host, per recall |
| `pack.margins.perRequest` | the gate's margin for that request, `null` when uncontested | `marginCensus` (R135) |
| `per_trial` + `memory.episodeStarts` + `memory.boundaryTasks` | which trial the request belonged to, and what each arm scored | the runner |

The episode join already existed (`pairAttribution`, R128/R136/R145) because the attribution table needs the
outcomes. R151 adds the third array to it and one field to the render: the **highest margin among the requests
of the episode that served that record**. The aggregation is a maximum because a gate acts per request while an
outcome is measured per trial — a record that cleared the rung at one request of a trial and not at another was
still served into the trial, and the question the sweep asks is "would this trial have been served".

**The three states of a margin, kept apart.** Absent (the arm carried no census: nothing was asked), `null` (the
census was there and this request served one candidate: nothing was contested), and a number. The first two are
priced identically — served at every rung, because a gate with no measurement cannot have withheld anything — and
reported separately, because a store that serves one candidate per request is a store no rung can act on and a
reader should see that rather than infer it.

**What the sweep reports, and what it refuses to report.** One decision-shaped statistic:

```
firstClean = the first rung (ascending) with broke = 0 and kept > 0
```

and not the argmax of `netPp`. A maximum over rungs is a parameter fitted to the sample it is read from; "the
cheapest rung that removes every break" is a question the next run can refute. The `kept > 0` clause is in the
predicate rather than in a reader's eye, because a rung that withholds everything is trivially clean.

**The premise, stated in the line itself.** A withheld trial is estimated at **its control outcome**. The
alternative to a served pack is the bare agent that produced the control half of the pair, which is what the
arm's reference run is — but a model shown a procedure and then not shown it is not the model that never saw it,
and the estimator cannot see the difference. So the line begins `serve sweep (estimated, withholding is priced
as the control outcome)`, and a verdict on a rung still needs the dispatch that runs it. What the estimate buys
is the elimination of the *first* dispatch in a two-dispatch loop.

**What it read on R142, and the reading it forbids.**

| rung | served | kept | broke | net pp | AUC of the margin |
| --- | --- | --- | --- | --- | --- |
| 0.00 | 57 | 4 | 6 | −3.51 | **0.625**, exact p **0.305** over 210 labellings |
| 0.10 | 34 | 3 | 4 | −1.75 | median kept 0.310, broke 0.221 |
| 0.30 | 7 | 2 | 0 | **+3.51** | the highest-margin break, 0.275, sits inside the repairs' range |

Rung 0.30 is a fitted value and is not a lever: it withholds 88% of the traffic to win two trials, and it is
clean only because the six breaks happen to sit below the two survivors. The instrument's value here is that it
was able to say so **for nothing**, four hours before the alternative — a dispatch per candidate rung — would
have produced the same table at $0.26 apiece.

### 17.158 A failures-only store, and the two knobs that are one decision

**What R142 established about the population.** `provenance` on the same artefact: `edited 9`, `passed 48`,
`itemsEditedOnly 11`, `itemsPassedOnly 50`, `itemsMixed 0`. The store is 82% descriptions of behaviour that
already worked, because `distillScope: all` widens the population until the consolidation pass has two tasks per
routine. The floor then selects the largest of those groups, which is why `support ≥ 2` certified a shared
description rather than a shared repair.

**What R151 measures.** The same 57/57 cut, the same consolidation pass and key, the same `packLimit: 1`, the
same `speakMargin: 0`, the same budget — and `distillScope: edited`.

**Why the floor moves with it.** `serveSupport: 2` over a ten-item store is a measurement of nothing: on R142
11 of 61 items carried support ≥ 2 (18%), and a failures-only store at the same ratio would serve one or two
items out of ten. The floor has no denominator on a population with one witness per routine, so it returns to
its identity (`serveSupport: 1`) and the round is registered with that stated:

| knob | R142 | R151 | why |
| --- | --- | --- | --- |
| `distillScope` | `all` | **`edited`** | the content axis: what the claim was made from |
| `serveSupport` | 2 | **1** | the floor's denominator is a corroborated population, which this arm does not have |

A reader who wants the floor isolated on this population is asking for a third arm, and the honest answer is
that the floor is not identifiable there. The confound is registered rather than dissolved: if R151 breaks fewer
trials than R142, the reading is "a store of repairs serves better than a store of descriptions", and the floor's
contribution is not separated in it.

**The prediction, in the units the arm reports.** `created` 8–16 (the learn half's failure count, widened by the
distiller's 2 candidates per correction), `servable` ≥ 8, `repairs` ≥ 4, `breaks` ≤ 2, delta ≥ 0 at a bound of
15.55pp. Refutation is banded the same way: `breaks` ≥ 5 sends the axis to **usage** — which this round has
already priced — and `repairs` ≤ 2 sends it to the **cut**.

### 17.159 What two reference arms license, and the third phase the cost arithmetic was missing

**The estimator the pair actually is.** `l4-pair` reports a paired delta with a McNemar interval on the
discordant pairs. That interval is exact **given two realised draws**: it answers "if these two arms were the
only randomness, how surprising is this split". It does not answer "would another dispatch of the same
treatment land here", and until R151 nobody had asked.

**The data.** Two dispatches of one treatment, same tasks, same model, same commit family:

```
R142 reference: 47 / 57      R151 reference: 51 / 57
agree 47   (both pass 44, both fail 3)      disagree 10   (3 down, 7 up)
flip share 0.175            McNemar exact p 0.344
```

**The arithmetic that follows, stated so it can be checked.**

| quantity | value | from |
| --- | --- | --- |
| per-arm sampling SD | `√(0.175 × 0.825 / 57)` = **5.0pp** | the flip share |
| delta SD, two independent arms | `√2 × 5.0` = **7.1pp** | independence of the two dispatches |
| paired SE the artefact reports | **5.55pp** | within-run discordance alone |
| published MDE80 | **15.55pp** | `2.802 × 5.55` |
| MDE80 with both draws sampled | **19.9pp** | `2.802 × 7.1` |

> **Withdrawn in §17.161.** The last two rows are wrong. `√(0.175 × 0.825 / 57)` uses the *flip share* as if it
> were the outcome proportion, and `√2` is then applied to a quantity that is already a difference. The
> independent-draw SD is `√((p₁(1−p₁)+p₂(1−p₂))/57)` = **6.47pp** against a 7.02pp observation — 1.08 of the SD,
> which is sampling noise. The paired SE the artefact prints (5.36pp) is the variance of the design that
> produced the number; it is not too narrow.

The published figure is not wrong; it is the MDE of a *conditional* question. The unconditional one is 28%
wider, and the difference is the reason a −3.51pp delta and a +7.02pp test–retest are the same number in
disguise.

**What would shrink it, and what would not.** More tasks shrink both terms by `√n`; more trials per task shrink
the per-arm term by `√k` only to the extent the trials are independent, which the pass^k metric exists to
question. The two are not interchangeable: 114 tasks buy 10.98pp, while 228 correlated trial pairs on 57 tasks
buy a nominal 7.8pp that the within-task correlation inflates back toward 15. Unless a correlation is measured,
the task count is the honest lever — which is what the R143 cross-fit is.

**The third paid phase.** The registration for R151 priced the dispatch at "$0.26, which is R142's measured
bill", reading the two arm files. A τ² arm runs **three** paid phases — learn, memory eval, reference eval — and
the learn phase is billed separately (`$0.1519` on R142, `$0.1562` on R151). The true per-dispatch cost is
**≈$0.41**, 1.6× every cost paragraph this record has published since the memory half was split from the
learning half. Both rounds are corrected in §PROGRESS 175–176; the registration is not, because a registration
edited after its result is not a registration.

### 17.160 The split a pair can state, and why the two arms are not symmetric

**The premise the guards were written on.** `foldSplitOf` and `treatmentOf` (R143) were designed as *agreement*
checks: two arms, one corpus, therefore the same learning half, the same evaluation half, and the same
treatment stated twice. The premise is false for this lane and has been since R130, when `controlRaw` began
writing a `tau2` block for the reference arm so the pair could difference a turn census. A control arm states
`train: []` — "this arm learned nothing" is its record — and it has no store, so no `distillUnit`, no
`distillForm`, no `distillScope` and no serving knobs exist on it to compare.

**What the pair can state instead, and still be a pair.**

| the pair states | from | refused when |
| --- | --- | --- |
| the evaluation half | every arm's `split.test` | an arm records none, or two arms answered different lists |
| the learning half | the union of the arms' non-empty `split.train` | no arm learned anything, or two arms learned different non-empty halves |
| the leak check | the learning half against the evaluation half | any task sits in both |
| the treatment | the arms that state each field | two arms that state a field and disagree |

The asymmetry is the point: **one arm carries the store and one is the counterfactual.** A field carried by
one arm is not a field nobody compared — an arm without a store has nothing to state, and inventing a default
for it would make two different runs look identical, which is the failure the old guard was trying to prevent.

**What that restores.** The pair artefact now publishes `foldSplit` (74 or 40 learned, the other half
evaluated) and `treatment` (unit, form, scope, model, knobs), which are exactly the two things `crossFitPool`
needs. Without them a cross-fit is arithmetically impossible, not merely unverified: the pool refuses an
artefact that cannot state its learning half, because the leak check — the only property a cross-fit claims —
cannot run against a boundary nobody recorded.

**Regeneration rather than re-dispatch.** A pair artefact is a deterministic join of two arm files: nothing in
`l4-pair` calls a model. A fold dispatched under the old guards therefore does not have to be re-bought; its
two arm files are in the run's evidence, and the join is re-run locally with the fixed code. The fold that was
in flight during the fix is read that way, and its artefact is committed under
`eval/results/folds/` so the cross-fit reads a file a reader can regenerate.

### 17.161 Which variance belongs to which design, and the retraction of the 19.9pp bound

§17.159 widened every MDE in this record by 28% on the strength of a test–retest. The widening was wrong, and
the error is instructive enough to keep:

| quantity | value | is it the variance of the estimator? |
| --- | --- | --- |
| disagreement between two independent draws of one arm | `p₁(1−p₂)+(1−p₁)p₂` = 0.2438 | no — this is the **unpaired** sampling frame |
| observed disagreement between the two control arms | 0.1754 | below the independence expectation |
| SD of an unpaired difference of two rates | 6.47pp | no |
| McNemar SE of the paired difference | 5.36pp | **yes** — this is what `comparePaired` reports |

`comparePaired` estimates the variance of the paired difference from the discordant pairs inside one dispatch.
That estimate already contains the control arm's noise; what it does not contain — and should not — is the
variance of drawing a whole new pair of arms. The test–retest measured exactly the latter, compared it with the
former, and concluded the former was too small. It is not: the two differ by the within-task correlation, and
both the McNemar ratio (`1 − (5.36/6.47)² = 0.31`) and the flip share (`1 − 0.1754/0.2438 = 0.28`) estimate that
correlation at about 0.3.

**The rule this leaves.** A variance has to be estimated from the design that produced the number it is quoted
beside. Pairing is a claim that the same task carries the same difficulty for both arms, and a test–retest of
one arm measures the stability of the *task*, not the noise of the *pair*. The useful residue of the exercise is
the stability figure itself: 17.5% of 57 tasks flip between two dispatches of one arm, which is the binomial
noise the protocol models and the reason a single trial per task resolves ~15pp.

**Consequence.** R143's cross-fit is held to **10.98pp** at 114 pairs. 15.55pp at 57 pairs stands. 19.9pp is
withdrawn from §17.159's table, from PROGRESS 176, from COMPETITIVE AM.8, from the roadmap's distance figure,
and from the user guide's worked example.

### 17.162 The pooled reading, and the quantity that explains both folds

The cross-fit R143 was registered for now exists, over 114 independent task pairs, and its reading is a negative
one that the per-fold rows explain better than the pooled number does:

| reading | value |
| --- | --- |
| pooled delta | **−6.14pp** [−14.91, +2.63], p = 0.2649 |
| resolution at 114 pairs | **13.24pp** |
| discordant pairs | 18 lost, 11 gained |
| tiling | 114 of 114; no fold evaluates a task it learned from |
| folds | `official` **+2.50pp** (n = 40), `swapped` **−10.81pp** (n = 74) — **disagree in sign** |

**The pooled number is an average of two findings.** That is the case §17.159 and the registration both
anticipated, and the reason the tool carries `agreeInSign` rather than only a point estimate: −6.14pp is 65% the
thin store's fold by construction, and a reader told only the mean would conclude the memory costs six points when
what happened is that it gained on one half of the corpus and lost on the other.

**What separates the two halves is not the corpus, it is the density of what survived the floor.**

| fold | items created | servable | renders | renders per servable item | harm share | repairs | delta |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `official` (74 learn) | 77 | 11 | 40 | 3.6 | 8.33% | 4 | +2.50pp |
| `official-swapped` (40 learn) | 40 | 3 | 75 | **25.0** | 23.81% | 7 | −10.81pp |

Three servable items, 74 renders: the recall path found something to serve in every single request because it had
three candidates for the whole corpus, and each of them was correlated with a single task's failure. The mechanism
the whole campaign has been circling is visible in that column — **the harm tracks how far an item travels beyond
the evidence that created it, not how many items the store holds.** A store of 3 items hurts more than a store of
11 because each of the 3 is applied 25 times; the floor's job is supposed to be retiring items whose evidence is
thin, and on the thin half it retired 32 of 40 and still left 3 that covered everything.

**What this prices.** Corroboration per correction, for the first time: the official half's 11 servable items over
40 trials produced 4 repairs and 3 breaks (net +1 task); the swapped half's 3 items over 74 trials produced 7
repairs and 15 breaks (net −8 tasks). Per rendered break, the thin store costs 5 breaks per servable item against
0.27 — a factor of 18, on the same treatment, the same model and the same day.

**What it does not license.** A serving rule tuned on this comparison. Two points do not make a curve, and the two
folds differ in corpus half as well as in supply. What it does license is the *shape* of the next registration:
bound the renders one item may take, not the number of items the store may hold — a per-item travel budget, which
is measurable with the instruments this round already committed (`serveYield` per record, `serveTasks` per task).

### 17.163 The travel budget: an exclusion the store honours, and why a post-filter would have been a different arm

§17.162 ended with the shape of the next registration rather than a rule: bound the renders one item may take,
not the number of items the store may hold. R152 is that arm, and the design question it had to answer first is
**where** the bound is enforced.

**Three places it could have gone, and what each would have measured.**

| enforcement point | what the request returns | what the arm would be |
| --- | --- | --- |
| after the pack is built (`pack.items.filter(...)`) | one item fewer | a **dose** change: the phase serves less memory, and dose is an axis this record already priced (§17.50, the dose arm set) |
| at the pack's selection (`mmrSelect` over a filtered candidate list) | a different item, same count | an allocation change, but with the store's ranking already spent |
| inside the store's search, before scoring | a different item, same count, and the normalisation taken over what may be served | **the allocation change** |

The third is what shipped. The second is nearly the same and was rejected for the reason R139 gives about
`supportFloor`: the pack layer would then need an opinion about ids, which is state the caller owns, and a filter
applied after the store has ranked cannot give the slot to a candidate the store already discarded.

**The contract, stated as four properties rather than as an implementation.**

1. `RecallQuery.exclude` is a list of ids, honoured by `EmbeddedMemory.search` before ranking. An id the store does
   not hold is ignored rather than fatal: the caller's list is state, and an item can be retired between the
   moment the list is built and the moment the request is sent.
2. The pack keeps its size. With `limit: 2` and the leader withheld, the pack carries the runner-up and the tail —
   the substitution is asserted in `exclude-pack.test.ts`, because a pack that lost a slot is a different arm.
3. The relevance normalisation is taken over the items the request may serve. BM25 scores are divided by the pack's
   own maximum, so a maximum left over an excluded item would deflate every remaining score and hand a margin gate
   a contest the exclusion invented.
4. The wire parses the list with a shape test and a count bound (`MAX_EXCLUDED = 256`, ids matching the alphabet
   this kernel mints). An empty value is refused rather than read as "nothing excluded": the way to exclude
   nothing is to omit the parameter, so a present-but-empty one is a caller whose list came out empty, and
   honouring it would serve the item it meant to hold.

**The cap is arithmetic, and it is resolved from the store the run built.**

```
cap = ceil(requests / servable)      # 40 requests over 11 servable items → 4
```

A constant in the header would be a guess about a store the distiller has not written yet, and a guess that does
not bind produces an arm that ran as its own control. The resolution is therefore the driver's, and the artefact
carries what it resolved to (`serveRotation.cap`) beside the maximum any item actually took
(`serveRotation.maxRenders`) — the pair that tells a bound which acted from a registration which intended one.

**Two failures the reading has to separate, and does.**

| state | what it means | where it is counted |
| --- | --- | --- |
| `maxRenders < cap` | the ranking never reached the bound: the arm is its own control | `serveRotation.maxRenders` against `cap` |
| `starved > 0` | every servable item had taken its share, so the pack could only be empty | `serveRotation.starved` |
| `servable = 0` | the store can serve nothing, so no share exists | `serveRotation.servable` |
| cap 0 with `requests = 0` | the phase asked nothing | `serveRotation.requests` |

**What the arm holds fixed, which is the whole of its claim.** The same 74/40 split of the benchmark's own
boundary, the same distillation population, the same recurrence pass, the same support floor of 2, the same
one-item pack, the same budget, the same model, one trial per task. The only difference from R143's `official`
fold is which item fills the pack — which is why the registration buys a **count** (breaks, repairs, served
requests) at a resolution where a delta cannot be claimed.

**Cost, priced from the store rather than from a rate card.** One dispatch, not two: the swapped fold's fair share
is `ceil(75 / 3) = 25`, exactly what the ranking already did, so a rotation arm there would be the identity and
would buy a second sample of R143 rather than a second reading. The `official` fold's bill is the one measured on
2026-11-18 for the same shape: **$0.3840**.

### 17.164 A field reaches an artefact through a type, a table and a read — and R152 got past two of the three

§17.116 and §17.117 state the rule that an artefact must carry every field its driver emitted, and `AUDIT 34.161`
records the first time it failed. R152 failed it again, in a form worth stating separately because it is the form
that survives every check the record already had.

**What happened, in the order it happened.**

1. The driver emitted the phase's rotation report through a conditional spread:
   `...(primary.rotation === undefined ? {} : { serveRotation: primary.rotation })`. TypeScript exempts spread
   members from the excess-property check, so the object literal compiled with a key its own declared type did not
   have.
2. `PROJECTION` — the table whose exhaustiveness is *supposed* to make a forgotten field a compile error — is
   exhaustive over `keyof Tau2Raw`. `Tau2Raw` did not declare the field, so the table had nothing to be exhaustive
   about. The compile-time guard was not defeated; it was never asked.
3. `armRecordFromDriver` had the runtime backstop installed after R123: it names every key the table has no
   decision for, and the pair refuses an arm that has one. It fired, correctly, and it fired **after** the paid
   dispatch: `FAIL l4-projection-complete: memory: serveRotation`.
4. The arm file carries `unprojected: ["serveRotation"]` and no block. The policy this fold declared is therefore
   absent from its own evidence, `rotationModeOf` reads the fold as `none` rather than `fair-share`, and the fold
   cannot enter the pool as the treatment it was.

**The layer that was missing is the type, and it is the cheapest one.** Three layers guard this now, and they are
not redundant — each fails at a different cost:

| layer | what it refuses | when | cost of the failure |
| --- | --- | --- | --- |
| `Tau2Raw` declaration | a field no table must decide about | `tsc` | $0 |
| `PROJECTION` entry | a declared field with no decision | `tsc` | $0 |
| `unprojected` at the pair | an emitted key no decision covers | after the run | one dispatch |

The declaration is what makes the second row meaningful, and R152 is the demonstration: the table's own comment
claimed a forgotten field "fails to compile until it is given a decision", which is true only of fields the type
declares. A spread is the one way to emit a field without declaring it, and the driver's record is built almost
entirely from spreads. The rule that follows — **declare the field on `Tau2Raw` in the same edit that emits it** —
is a convention, and conventions fail; what makes it checkable is that the wrong direction is now caught for free,
because a declaration without a table entry does not compile.

**The reading had a second defect of its own, and it is the worse one.** The report was built beside the ledger:

```ts
const rotation = new ServeRotationLedger(rotationCap);
const rotationReport = { mode, ...(rotation?.reading() ?? {}) };   // ← before the loop
```

`reading()` is a snapshot. Taken there it holds `requests: 0`, `renders: 0`, `maxRenders: 0`, `exhausted: []`,
`starved: 0` — a phase that served nothing — while the log line printed after the loop said `cap 3 … max 3, 40
render(s) over 14 item(s), 13 exhausted`. The two files describe the same run and disagree; the log is what the
readback greps and the artefact is what survives, so the disagreement would have been resolved in favour of the
false one as soon as nobody was looking at the log.

The fix is not "move the line". It is that **a snapshot is read once, after the phase, and the same object feeds
both consumers**:

```ts
const rotationReading = rotation?.reading();                    // after the loop
if (rotationReading !== undefined) write(rotationLine(rotationReading));
const rotationReport = { mode: ROTATION.mode, ...(rotationReading ?? {}) };
```

One read cannot disagree with itself. `AUDIT 34.113` makes the same argument about the store census: two
reductions of one population are only comparable when they are reductions of the same population, taken at the
same moment — which is why the driver builds all three use-side readings from one observation list.

**And the test that should have caught both was measuring zero.** The end-to-end case drives the real driver
against a stand-in for τ², and the stand-in never asked the memory: the facade is a real HTTP server in the
driver's process and the stub simply wrote its result file. So every serving reading in that file — the pack
census, the served sizes, the rotation ledger — was asserted over a phase that served nothing, and passed. The
stand-in now asks once per episode behind an explicit switch (`TAU_STUB_RECALL`), and the case asserts the
identity that ties the artefact to the phase rather than a constant:

```
serveRotation.requests === recall.requests       # one next() per recall, so a snapshot taken early disagrees
```

**Cost, stated as what the defect cost rather than as what the fix cost.** The fix is three lines and four tests.
The defect cost the fold its completeness: the artefact cannot say which policy produced it, so the fold is
readable but not poolable, and the number it bought (+2.50pp, harm 5.88%) stands on its log rather than on its
file. That is the price of a spread, and it is why the next dispatch is a declared replication rather than a
repair: a projection defect cannot be re-derived from the arm files at $0, because the evidence is what went
missing.

**The third layer is inside the artefact, and it is the only one that can say the block is true.** The two guards
above decide whether a field is *written*; neither can tell whether what was written describes the run.
`l4-rotation-reconciles` reconciles the declared reading against the ids the same file's pack ledger carries —
the list the counter itself charged — and blocks on any disagreement:

| field | reachable from the ledger? | why |
| --- | --- | --- |
| `requests`, `renders`, `distinct`, `maxRenders` | **yes** | one entry per request, one id per render |
| `exhausted` | yes, when the block states its `cap` | it is a function of the cap, so a cap-less block has no rung to derive at |
| `starved` | bounded above only | an empty pack has two causes — a spent rotation and a store with nothing to say — and the ledger holds the same empty list for both |
| `mode` | **no** | a policy is not a measurement |
| `cap`, `servable` | no | they are arithmetic over the store, which the ledger does not describe |

**The asymmetry is the finding, and it prices every future artefact defect.** A ledger can prove a count wrong and
can never prove a policy right, so a fold whose block went missing is unrecoverable from its own files at any
price — R152's position — while a fold whose block is present but wrong is caught for $0 by a gate that was always
one file-read away. That is why the reconciliation ships as a gate rather than as a repair tool: the repair it
could perform is exactly the one that was never needed.

### 17.165 The third point: what a design owes a mechanism before the record may quote it

§17.162 and §17.163 built a mechanism and then an instrument from it. R152c refuted the mechanism with the very
instrument that was built to test it, and the shape of the error is worth stating as a design rule because it will
recur: **the two folds that suggested the mechanism differed in both of its axes at once.**

| fold | servable items | renders per item | harm |
| --- | --- | --- | --- |
| `official` | 11 | 3.6 | 8.33% |
| `official-swapped` | 3 | 25.0 | 23.81% |

Renders per item was a *consequence* of the floor's survival rate, not an independent variable: nothing in the lane
could hold one fixed while moving the other, because the only way to change renders per item was to change the
store. A line through two such points has one degree of freedom and the explanation attached to it is a story about
which axis one believes.

**What a mechanism claim costs, in dispatches.** One instrument that can separate the axes. Here it was a serving
cap whose arithmetic comes from the store (`ceil(requests / servable)`), which makes renders-per-item a *decision*
rather than a consequence — and the moment it existed, three draws at 2.86, 3.08 and 3.15 renders per item read
5.88%, unmeasured and **20.59%** harm. The independent variable moved by 10%, the dependent one by 15 points, and the
mechanism is gone.

**The rule this leaves, phrased for the next registration.**

> A mechanism inferred from *n* points that vary *k* axes needs *k + 1* points before it is quoted as a mechanism,
> and if the design cannot produce the extra point without an instrument that does not exist yet, the instrument is
> the next dispatch — not the second fold.

**What the rule does not say.** It does not say the instrument was wasted. The cap is now the only quantity in this
lane that an experimenter can set and that provably moves: `maxRenders` equals the cap in every bounded draw,
supply is reached (13 of 13 servable served in two draws), nothing is starved, and the leader's renders fall from 12
to 3–4. **Allocation is controlled and the outcome is unmoved** — which converts "does memory help" into a question
about *content and selection*, with the serving policy exonerated rather than unknown. That is a stronger position
than the one the mechanism claim left the record in, and it was bought by refuting the claim rather than by
confirming it.

**The design consequence for what ships.** `serveRotation` stays in the kernel as a serving instrument with a
ledger, a report and a reconciliation gate, and it does **not** become a default: a policy whose benefit is
unestablished and whose one adverse draw sits below the revert bar is reverted by R45's own rule, not shipped
because its mechanism was elegant. The distinction between *instrument* and *policy* is the one this round had to
draw, and it is the reason the code is unchanged while the guide's recommendation is withdrawn.

### 17.166 A gate is a derived field, so the design owes it a re-grade path

§17.164 drew the discipline for a field that must be *written*: declare it on the record's type, decide it in the
projection table, and read it back. A gate row needs the third of those and not the first two — it is not emitted
by a driver, it is computed from fields the driver emitted — and the omission of the third is exactly what
`l4-effect-resolved` suffered: its predicate was `state !== 'UNRESOLVED'` while its own criterion asked for
`|delta| >= minimum detectable difference`, and nothing in the pipeline compared the two.

**The design rule.** A row in a committed artefact is a **claim about the file**, and a claim that is computed
rather than measured must be recomputable from the file by a command that ships. Three consequences:

| consequence | in this repository |
| --- | --- |
| the computation lives in a module, not a `bin/` | `pair-gates.ts` (extracted from `bin/l4-pair.ts` for this reason), consumed by the driver and by the re-grade |
| the artefacts are re-gradable without a dispatch | `pair-regrade.ts` + `bin/l4-regrade.ts`, dry-run by default |
| the re-grade runs in the gate | `pnpm check` → `eval:l4-regrade` over both committed pair artefacts, non-zero if a row would move |

**Why a re-grade is not a rewrite of evidence.** The distinction is enforced, not asserted: the text transform
round-trips the parse through the writer's own `JSON.stringify(value, null, 2)` and refuses unless the result is
byte-identical to the input, so a regrade cannot reindent a file it does not own; every input is read through an
accessor that throws rather than defaulting, so a file the tool cannot read cannot become a file it silently grades
with invented numbers; and a row the file predates is **reported** (`predates l4-rotation-reconciles — not added`)
rather than appended, because an artefact must date to a driver that could have written it.

**What the row now says, and the branch it used to hide.** `l4-effect-resolved` answers one question — may this pair
be quoted as a finding — and the answer is a conjunction: a published direction **and** `|delta| >= detectablePp`.
The pair that motivated the fix reads, verbatim:

```
-7.50pp against 23.23pp minimum detectable difference — the memory costs accuracy: -7.50pp,
which is a direction this pair cannot claim
```

which is the sentence 34.197 asked for, printing the number that forbids the claim beside the claim. The row stays
advisory: `l4-paired` is the gate that blocks a pair for costing accuracy, and a second blocking copy of one
reading is how a red line teaches its readers to ignore red (§17.161's own reason for keeping `V5` singular).

**What the axis costs.** $0.00, and for a reason worth recording: re-running the pair would have cost ~$0.75 and
produced two *different* draws of 40 tasks, so the row under test would have moved for reasons unrelated to the
predicate. A derived field's correction must be applied to the derivation, or the correction and the draw are
confounded — the same error as §17.165's line through two points, one level down.

### 17.167 Headroom: the design bound that sits beside resolution

§17.161 and §17.165 are about what a *reading* may claim once it exists. This is about what a *design* can produce
before it is bought, and it is one subtracted column that the record never printed.

**The bound.** A memory repairs only trials the bare agent failed, so

```
ceiling = 1 − controlPass⁴        (percentage points)
```

is the largest delta the fold can express: a store that repairs every failure and breaks nothing. Beside it sits
the resolution `z·sqrt(d/n)` the protocol has computed since R42. **The two are independent, and a fold whose
ceiling is below its resolution cannot certify any effect at any treatment quality.**

| fold | n | ceiling | resolution | margin |
| --- | --- | --- | --- | --- |
| retail 40-task, control 0.900 | 40 | 10.00pp | 18.53pp | −8.53 |
| retail 74-task, control 0.851 | 74 | 14.86pp | 17.76pp | −2.90 |
| retail 40-task, control 0.850 | 40 | 15.00pp | 15.66 / 23.23pp | −0.66 / −8.23 |
| retail pooled | 114 | 14.0pp | 13.24pp | **+0.76** |
| retail + airline (computed, not run) | 164 | 15.0pp | ≈11.5pp | **+3.5** |

**Design consequences.**

1. **The dispatch predicate changes.** A fold is selected by clearing its own ceiling, not by the size of the store
   it is testing. Under retail's observed discordance (0.275) and a control at 0.85, that means ≥164 pairs, which is
   retail's 114 plus airline's 50 — the two corpora the workflow already pins.
2. **The `ceiling` field that existed since R42 is a different object.** It compares the scenario's task supply
   with what a 5pp half-width would need; headroom compares the control's pass rate with the resolution. One word,
   two quantities, and the second was never printed — so `headroom` is a new artefact block rather than a
   reinterpretation of the old one.
3. **Significance does not substitute.** Six discordant pairs, one direction, `p = 0.0156`: a perfect store is
   *significant* on a fold whose point estimate the design must refuse. The predicate for a quotable finding is
   therefore `|delta| ≥ resolution`, which is what §17.166's gate now says, and the two rounds agree because they
   are the same arithmetic from two sides.

**Cost of the instrument.** $0.00 — it is subtraction on numbers already filed. The cost of *not* having it is four
dispatches whose conclusions were read as statements about memory when the file also contained, unread, the
statement that no memory could have been certified.

### 17.168 A serving metric owes its two denominators, and every threshold owes its sample price

§17.167 priced a *design* in tasks. This prices the *metric* a design reports, and the rule it produces is about
decomposition rather than arithmetic.

**The metric.** A serving delta is `(repairs − breaks) / trials`, and that is a mixture: repairs come from failed
trials, breaks from passed ones. The design therefore owes three numbers, not one:

```
delta = f·r − (1−f)·b          f = failure share, r = repair rate, b = break rate
b*    = r·f/(1−f)              the break rate at which the store pays for itself on this corpus
```

| term | what it is | why the design must carry it |
| --- | --- | --- |
| `f` | the corpus's failure share | the mixing weight; a property of the benchmark and the backbone, not of the store |
| `r` | repairs over failures | the effect on the population the store exists for; the only rate a content axis can move |
| `b` | breaks over passes | the harm, on the population that dwarfs the first |
| `b*` | the break-even | turns "the memory costs points" into a threshold a change can be graded against |

**Rule 1 — a rate is reported with the population it was estimated on.** `18/27` and `27/167` are the two readings;
`−4.64pp` is their weighted difference and carries strictly less information than either. The intervals differ for
the same reason (34 points against 11), and averaging them into one delta is how this record spent four rounds
reading corpus composition as mechanism (34.201).

**Rule 2 — the break-even is part of the metric, because it moves with the corpus.** The same store breaks even at
10.8% on retail's 14% failure share and at 28% on a corpus with a 30% share. A threshold stated without the share it
was computed at is a threshold that cannot be transferred, and this lane has been quoting one.

**Rule 3 — every threshold in the design carries the sample it needs.** `tasksForDelta` is the design's own
arithmetic inverted: `n = z²·d/effect²`. At an observed discordance of 0.232 the `−5pp` cost bar needs **729** pairs,
the 3pp claim needs **2,024**, and the largest fold this record has run is 74. A design that states a bar and not
its price will fire the bar on readings the sample cannot certify, and the error is not symmetric: the bar is a
*revert*, so its false positives discard work that was fine.

**Rule 4 — a cross-system comparison carries the metric's parameters, not only its value.** The published bars
(0.575, 0.6754) are τ² `pass^4`; R152c's arm records `k = 1` beside a field named `pass4`, and the pair protocol
carries no `k` at all. `bar_backbone_matches = 0` already disqualified the level comparison on backbone grounds;
this disqualifies it again on metric grounds, and the artefact cannot show the mismatch because the field is not
there. The queued repair is one field in the protocol (`k`, `trials`) and one in the bar block
(`bar_k_matches`), which is the same discipline as §17.164's projection table applied to a comparison rather than
to an arm.

**What the gate is, and is not.** `pnpm eval:conditional` fails the build when a pair's four counts do not
reconstruct its published delta (±0.005pp) — two blocks about one comparison disagreeing means one of them is wrong
and neither says which. It does **not** fail when the store is over break-even: that is a measurement, and a build
that goes red on a measurement teaches its readers to skip the line (§17.166's reason for keeping the resolution row
advisory while the cost row blocks).

**Cost of the whole axis.** $0.00, over artefacts that already existed, and it produced the first target on the harm
side that a $0 change could be graded against: get `b` under `b*` without moving `r`.

### 17.169 The metric is a parameter of the comparison, and each layer owes one field of it

§17.168's rule 4 queued the fix; this is the design. The rule it replaces is "the artefact states the statistic it
reports", which every layer believed it was obeying.

**Where the fact has to live.** A level is not a property of a run, a pair or a bar — it is a property of the
*comparison*, and every layer that participates in one owes the field:

| layer | field | what it must not do |
| --- | --- | --- |
| arm | `metrics.k`, from `TAU_TRIALS` (the same variable the driver reads) | default to a number the dispatch did not state |
| arm bar block | `bar_k_matches` | withdraw the bar: `0` explains a withheld bar, which `published_bar_applies: 0` cannot |
| pair | `first.k`, `second.k`, `protocol.k` | carry one arm's level as the pair's; `protocol.k` is the shared value or `null` |
| pair | `protocol.kAbsent` | leave a hole: when an arm states nothing, the pair names it |
| pair | `protocol.barK`, `barKMismatch` | fold the bar into the gate — a `k = 1` pair is internally consistent and must not be graded red for the comparison's defect |
| gate | `l4-same-k`, blocking | be green when an arm stated nothing: absent is not agreement |
| pair | `protocol.restatedAtBarK` | drop its assumption: `pass^k = rate^k` holds only while trials are independent |

**The conversion, and why it is a field rather than a formula in a report.** `pass^k` at one level and `pass^j` at
another are the same per-trial rate raised to different powers, so `restateAtLevel(rate, fromK, toK) = rate^(toK/fromK)`.
On the published fold that is `0.925 → 0.7321` and `0.85 → 0.522` at `k = 4`. The number a reader needs is not the
restatement alone but the restatement *with its premise*, and a formula in a report loses the second half; the
second half is the field.

**Why the pair, not the arm, owns the gate.** Two arms at two levels is a property of the two files, like
`l4-same-split`. The arm cannot see the other arm, and the protocol's own `V5` grades the claim rather than the
files. The gate therefore lives in `pair-gates.ts` — which is also the module that exists because `bin/` is
excluded from coverage (17.166).

**The re-grade corollary.** A row is re-gradable only if every input it reads is a field of the file being
re-graded. `l4-projection-complete` reads the driver's emitted-field census and `l4-rotation-reconciles` reads the
arm's serving policy and pack ledger; both are absent from the pair artefact, so both are preserved and printed with
their reason (34.202). The allow-list is three ids, and the direction of the default is what matters: a row added
later is preserved until somebody argues it into the list.

### 17.170 A rate target has two prices, and the certification price binds

A level and a change are different questions about the same number, and the design owes both prices before a
dispatch is bought:

| question | statistic | cost |
| --- | --- | --- |
| did the rate **move** from `b` to `b*`? | `tasksForDelta` on the delta the change would cause | `z²·d/effect²`, with `d` unknown before the run: `effect` if the new failures are nested in the old, the corpus's own discordance otherwise |
| is the rate **below** `b*`? | Wilson upper end on the control's passes | `passesToCertify(b*, planned)` |

**The certification price has a property the change price does not: it has no answer at the bar.** The Wilson
upper end always exceeds the estimate, so `passesToCertify(b*, b*)` is `null` for every sample. That `null` is the
design statement: a target sitting on its own bar cannot be reached by measuring again, and a fold specification
that says "re-read the same tasks with a better store" owes a plan for getting *below* the bar by at least its own
half-width.

**Why the search is a bisection and not a closed form.** `wilsonInterval` is the repository's one interval
(`reproduction.ts`); solving it algebraically would be a second derivation of the same quantity with its own
rounding. `passesToCertify` doubles to bracket and bisects on whole pass counts, and it asserts nothing at runtime
about monotonicity: a guard for the non-monotone case is a branch no input reaches, so the suite checks the
property over a 50 × 600 grid instead (§17.166's rule, applied to an assumption rather than to a gate).

**What it says about the fold on the roadmap.** The 164-pair composition was budgeted against the *delta* bar's
arithmetic; against the target it is below the nested floor of 170 and five times below the unrelated price of 847.
The two sizes worth buying are 149 pairs (certifies a 5.39% break rate) and 592 (certifies 8.08%), and which one
is bought is a claim about how far the content axis is expected to move the rate — not a budget decision.

### 17.171 One resampling loop, one pay predicate, and a census that cannot drift

The design question this round is narrow: where does "does the memory pay" live, and how many implementations of
it may exist?

**The predicate, and its three equivalent forms.** For an arm with `repaired`, `broken`, `repairable` and
`breakable`:

| form | statement | where it belongs |
| --- | --- | --- |
| counts | `repaired ≥ broken` | the decision — this is `pays` |
| ratio | `repaired/broken ≥ 1` | the exchange rate a reader quotes (`netOdds`) |
| rates | `repairRate ≥ breakRate · breakable/repairable` | the break-even display (`requiredRepairRatePp`) |

All three are the same inequality. The defect §34.204 records is a fourth quantity built by mixing the second and
the third: `(repaired/broken) / (breakable/repairable)`. It is neither the exchange rate nor its bar. The design
rule that follows: **a derived statistic must name the family it belongs to**, and `clearance` did not. It is kept
in `admission.ts` because committed artefacts carry it, with its meaning written down as "distance above a memory
that repairs and breaks at the same rate", and `pays` is added beside it so that no reader has to reconstruct the
predicate from a ratio.

**One loop.** `clusterBootstrapStatistic(rows, clusterOf, statistic, resamples, seed)` resamples clusters and hands
each draw to the caller; `clusterBootstrapCI` is that function with `mean`. The alternative — a second loop for
ratios — was rejected on this repository's own grounds: two loops are two definitions of the 2.5 / 97.5
percentile, and they drift. The generic version preserves the draw order and the RNG of the original, so every
interval already committed is unchanged to the last digit; the test suite asserts that identity directly.

Three properties the loop has to state rather than assume:

- **The effective sample is the cluster count.** `resamples` is a parameter, and the census reports `clusters`
  beside `n`, because a reader who divides by `sqrt(n)` is computing an interval the design does not support.
- **A ratio can be undefined on a draw**, and a dropped draw is not a zero. It is counted (`dropped`) so the bias
  is visible: dropping conditions the interval on the denominator being positive.
- **A single cluster returns its own statistic as both bounds**, because a resample of one cluster is that
  cluster. This is the same rule the mean-only version had.

**The census as a gate.** `eval/results/poc-exchange-census.json` is a pure function of five committed artefacts;
`pnpm eval:exchange --check` recomputes it and fails on a byte of difference. The design choice is that the
artefact is *derived*, so its drift is evidence drift — an arm whose numbers moved — and the gate's message says
so rather than asking for a re-run. A census that regenerated itself silently would be a number nobody re-read.

**Where the verdict is computed, and why not twice.** The verdict is read from the delta interval, because
`l4-effect-resolved` and `V5-resolution` both gate on the delta and the break-even target `b*` is derived from the
counts behind it. The exchange ratio keeps its own interval for display. Two null tests on one question would
eventually disagree at a boundary, so the design keeps one test and one display.

**The registry.** New arms are added to `CENSUS_SOURCES` only with a committed artefact behind them; the census
refuses an arm with no cluster key (`perCaseRows` and `pairRows` name the row they could not read), because an
unclustered arm cannot be interval'd and a census that silently treated it as independent would be worse than no
census.

## 17.172 — `pack-copy`: two readers over one set of rows, and the statistics they share

`pack-copy.ts` (R158) answers "is the pack about this case" with two functions, because the question splits into
one part English states unambiguously and one part that is arithmetic.

**Denial: a table, not a parser.** `DENIAL_RULES` holds eleven entries, one per member of `CONSTRUCTS`, each a
pattern and the phrase family it names. The pattern admits only connectives between cue and construct — `using`,
`be`, `wrapped in`, an article — so `a join problem` and `the joined result` do not fire. The alternative was a
cue-then-window reader, which on dev reported 1,092 of 1,534 cases contradicted; that is what a reader measures
when it measures English. A rule and a construct are kept 1:1 by a test, because a construct with no rule is a
construct nothing can detect and a rule for an unlisted construct would report a hit the gold reader cannot
corroborate.

**The gold side is read from the shape.** `constructsOf` uses `sqlShapeOf` for clauses, aggregates and subquery
count, and the shared tokeniser for `cast`, `round(`, `count(*)` and — the one construct `sqlShapeOf` does not
separate — a top-level `AS` in the select list followed by a name that is not a type keyword. Reading the gold's
*text* instead would count `WHERE label = 'distinct'` as a use of `DISTINCT`.

**Two flags on every denial, for two different reasons.**

| flag | meaning | why it is not a filter |
| --- | --- | --- |
| `conditional` | the sentence carries `when` / `if` / `unless` / `whenever` | parsing an antecedent into a predicate over the question is a second classifier with its own error rate; the flag lets the census publish a strict reading beside the wide one |
| `warning` | the sentence carries a failure predicate (`does not`, `cannot`, `inflates`, `drops rows`) | a warning tells the executor what *not to try*; read as a prescription it inverts the sentence. 23% of train's denials are warnings, which is a property of the store worth publishing |

`DenialReading` therefore reports `denials`, `warnings`, `hits` and `strict` separately. `hits` excludes
warnings; `strict` is `hits` minus the conditional ones. A reader can reconstruct every number in the artefact
from those four counts and the case's own pack.

**Circulation is arithmetic.** `spreadOf` counts, per statement, the cases that received it and the distinct
databases among them; `boilerplateShareOf` scores a case by the fraction of its statements whose spread is ≥ 2,
and returns `null` for a pack with no statements. The database is the unit because cases in one database share a
schema; a statement delivered twice inside one database is about a schema those cases have, and the same
statement in `hockey` and `student_loan` is about neither. `circulationStratumOf` maps `null` to `none` — an
empty pack has no composition and must not be scored as clean by default.

**One resampling loop, two kinds of stratum.** `carve` reports a stratum's delta with
`clusterBootstrapStatistic` over databases; `carveGap` bootstraps the **corpus** — clusters drawn, both strata
recomputed inside the draw, a draw losing either stratum returned as `null` and counted in `dropped`. Resampling
inside a stratum would condition the interval on a label derived from the same rows, and would report a width
the design cannot support. The gap's sign is the finding; its width is why four source rows can disagree in sign
and still be one honest table.

**The gate.** `eval/results/poc-pack-copy.json` is a pure function of four committed artefacts and two rule
tables; `pnpm eval:pack-copy --check` recomputes it and fails on a byte, in CI and in `pnpm check`. The
`registered` field names `ROADMAP.md §R158`, which was written before the module existed, so the order —
prediction, then reading — is checkable by anyone holding both repositories.

**Why it is deferred and not an adapter.** The coupling walk classifies `pack-copy` as coupled (it names scenario
words in code) and `DEFERRALS` carries the reason: it reads two strings per case and executes nothing. The
deferral is a written decision in the same table as the other 24, and `V72` fails if the entry disappears.

## 17.173 — `pack-attribution`: a fixed effect, one ratio bootstrap, and a ledger

R159's module asks where a corpus-level loss lives. Three design decisions carry it.

**The contrast is inside a database.** `contrastOf(rows, isExposed, resamples, seed)` groups rows by cluster, keeps
only clusters with both sides, and forms one unit per cluster:

```
numerator_d = Σ_exposed gain − (n_exposed / n_rest) · Σ_rest gain
denominator_d = n_exposed
```

The estimate is `Σ numerator / Σ denominator`, which is the average effect on the treated: each database's own
exposed-minus-rest difference, weighted by how many exposed cases it holds. `exposed` counts every case whose pack
carried the property, including clusters that cannot form the contrast; `att` counts only the weight the estimate
rests on. A database that cannot compare contributes nothing and is not read as an absence of effect.

**The bootstrap is a ratio of sums, so it gets a ratio bootstrap.** `clusterBootstrapRatio(units, resamples, seed)`
in `stats.ts` accumulates per-cluster totals, draws multiplicities with the same `mulberry32` stream in the same
order as `clusterBootstrapStatistic`, and recomputes the ratio from the reweighted sums. The two are the same
experiment by construction, which a test asserts by running both; the difference is cost, and the cost is what makes
a 210-hypothesis screen possible: 210 × 58 multiply-adds per resample instead of 210 × 7,000 row copies.

**The dose is a fixed-effect regression over pre-aggregated cross-products.** `doseOf(rows, predictors, resamples,
seed)` demeans every variable inside its cluster and accumulates `A_d = X̃'X̃` and `b_d = X̃'ỹ` per cluster. A draw's
coefficient is `(Σ m_d A_d)^{-1} (Σ m_d b_d)`, which is exactly a refit on the drawn rows: demeaning a cluster drawn
twice is demeaning it once, and both cross-products scale by the multiplicity. A test refits the drawn rows with a
hand-written solver and asserts equality to 1e-8.

The parameterisation is `(statements, unsupported, gold-constructs)` rather than `(unsupported, supported)` because
the finding is the *extra* cost of an unsupported statement and a difference of two coefficients is not a
coefficient. `gold-constructs` is the confound control: a simple gold is easier to contradict, and without it the
reading would report "memory hurts easy questions" as "memory prescribes machinery".

**The screen publishes its own multiplicity.** `statementScreen` returns one row per statement with `cases`,
`databases`, `comparable`, `att` (the weight the estimate rests on) and an interval when
`comparable ≥ MIN_COMPARABLE = 5`. `ledgerOf`
then publishes `screened`, `resolved`, `expected = screened × 0.05`, the negative/positive split, and
`massAtRiskPp = Σ_{resolved negative} |point| × cases / corpus`. The mass is a bound and not a prediction: a case can
carry several resolved statements at once.

**The readings.** `mentionsOf` reads which constructs a sentence names, polarity-blind; `constructsOf` reads which the
gold uses, from the shape rather than the text; `unsupportedOf` counts statements whose mentions fall wholly outside
the gold's constructs, and `unusedConstructsOf` returns the union so the artefact can publish which construct is
doing the flagging. `filterPriceOf` prices the serve-time proxy — a per-database profile of constructs, built offline
— in delivered statements before and after, and in cases left with nothing.

**The refusals.** A predictor constant inside every cluster returns `null`, not zero. A draw that cannot be solved is
dropped and counted. `resamples: 0` returns the point and `null` intervals. A statement below the floor keeps its
point estimate and gets no interval.

**The gate.** `eval/results/poc-pack-attribution.json` is a pure function of four committed artefacts and the readings
above; `pnpm eval:pack-attribution --check` recomputes it and fails on a byte, in CI and in `pnpm check`. The
`registered` field names `ROADMAP.md §R159`, written before the module existed.

**Why it carries no deferral.** The coupling walk assigns `deferred` only to a module with a scenario word **in code**;
`pack-attribution` reads identifiers and gold text and names no dataset, so it is `general` and the ledger records 255
modules with the same 25 deferrals as before. An entry for it would have been documentation nothing reads, which is
the defect 34.203 describes.

## 17.174 — `reuse-ceiling`: one ceiling for twelve axes, and a replication as the unit of evidence

**Surface.** `reuse-ceiling.ts` exports the row type (`ReuseRow`), three pure measurements (`contentWordsOf`,
`overlapOf`, `columnReuseOf`), the pairing (`reusePairsOf`), the banding (`bandOf`, `reuseBandsOf`), the decision
rule (`verdictOf`), an artefact reader (`reuseRowsOf`), the assembly (`censusOf`) and two printers. `bin/
reuse-ceiling.ts` reads dev and train, prints, and writes or checks `eval/results/poc-reuse-ceiling.json`.

**The pairing is the only place a choice was made, and it is made from the text a deployment has.** Neighbours are
chosen by the Jaccard overlap of question content words, with a stop list deliberately short enough to be quotable
(nineteen words) because a longer one is a knob and this reading must not rest on a knob. Ties break on the source's
gold query string: arbitrary, but deterministic, because a reading that changes when the file is re-ordered cannot
gate a push. A database with one case yields an `unpaired` count, not a zero-reuse pair — "nobody to retrieve from"
and "retrieved something useless" are different facts and only one of them is about memory.

**The measurement reads answers, the retrieval reads questions.** `columnReuseOf` is the Jaccard overlap of
`sqlShapeOf().columns`, divided by the union. That asymmetry is the design: the retrieval must be legal at inference
time, and the measurement must be about the answer, because the claim is about answers. Using the same signal for
both would have measured the retriever against itself.

**The bootstrap accumulates (cluster × band) cells.** Each database contributes one `{sums, counts}` vector of four
entries; a replicate reweights cells by cluster multiplicity and recomputes four ratios in one pass, so one set of
draws serves all four bands and the bands are comparable as one shape rather than four experiments. This is the
same sufficient-statistic construction `clusterBootstrapRatio` uses for one ratio, lifted to a vector; a 7,000-row
corpus costs 58 cells per replicate rather than 7,000 rows.

**Empty bands are published, not dropped.** A band with no pair gets `pairs: 0`, `gainPp: 0` and a zero-width
interval, because a missing row reads as "not measured" when the truth is "nothing landed here". The same rule
applies to a single-cluster corpus: its interval is zero width at its own value, which is `clusterBootstrapCI`'s
convention and is asserted in a test rather than assumed.

**The verdict has three labels because two would conflate two facts.** `null` — the top band does not clear zero
anywhere — can still be blamed on power. `replicates` requires the same sign **and** an interval excluding zero on
every corpus. `contradicted` requires a sign flip, and it is the label this round publishes: with 11 clusters
reading +2.69pp and 58 clusters reading −1.04pp on the same band, the ordering is a property of the corpus it was
computed on, and no increase in sample size turns a flip into a null.

**What the module refuses.** It does not choose band edges per run (they are `REUSE_EDGES`, fixed in source, because
a threshold fitted after seeing the gain is the exact failure the lane exists to catch). It does not impute a
missing question or outcome in the reader — it throws, because a defaulted question pairs a case with an arbitrary
neighbour and a defaulted outcome scores it as unchanged, and both produce numbers that look like measurements. It
does not report a per-case reuse for a database of one. And it does not compare its two corpora on anything but the
top band and the shape: dev and train were produced by different dispatches, so every other difference between them
is uncontrolled, and only the sign of one fixed band survives that.

**Why the artefact is 1.9 KB and the check still matters.** The census is four bands over two corpora and a verdict
— small enough to read in one screen, which is the point: the reading that retires a queue head should be smaller
than the queue head, not another 69 KB of strata. What the gate protects is not the size but the *edge set*: a later
change to `REUSE_EDGES` or to the extractor moves the file, and the diff then says whether the corpus moved or the
reader did.


## 17.175 — `eval/drivers/alfworld`: a data directory, a committed config, and a pre-flight that reports its bill

The lane is two files and one workflow, and each one exists because something else could not be relied on.

**`selfcheck.py` is the gate, and it asserts a contract rather than a score.** Four statements: a reset returns
an observation that states a task and a non-empty admissible list; an admissible command changes the observation;
an inadmissible command is refused in the environment's own words; a twelve-step walk keeps the episode alive and
rendering. Exit code is the report. A score assertion was rejected for a reason that belongs in the design: this
job calls no model, so a score could only be produced by a stand-in, and a stand-in's score is a fact about the
stand-in.

**`config.yaml` is committed rather than read from the installed package.** `alfworld 0.4.2` ships
`configs/base_config.yaml` at the repository root, outside any package, so `find_packages` does not install it and
a wheel install has no config at all. Beyond that, a lane that read whatever the wheel carried would record a
different environment for the same commit on the day upstream changed a default. The file is the upstream default
with `use_cuda` set to false, and `$ALFWORLD_DATA` is expanded by the driver so the path is a property of the run
rather than of the file.

**`alfworld.yml` installs, fetches, drives, and prints its bill.** Three decisions in it are load-bearing:

- **the 0.4.2 tag, not PyPI.** PyPI stops at 0.3.5, which reads the z-machine release; this lane's data is the
  PDDL release. 0.3.5 also declares `torch`, `torchvision`, `ai2thor` and `opencv` for a detector and a simulator
  the text path never constructs, all imported at module scope — six runs were spent discovering them one at a
  time, which is a slower way to read a manifest.
- **`textworld` and `tatsu` in one command.** A pin in its own step runs after the resolve it was meant to
  constrain (34.208).
- **a wheel cache and three attempts.** The build fetches a 22 MB compiler from a host that failed once at 133
  seconds and succeeded in seconds seven other times. A retry is not tolerance for a broken build: the build is
  deterministic and the failure was a connection refused, so the third attempt either produces the same wheel or
  the job fails loudly.

**What the driver does not do, and why.** It does not replay the file's `walkthrough`: that field is a THOR
trajectory in first-release symbolic coordinates and the text environment refuses every step (34.209). It does not
construct a pack, which is the next lane's job and needs a measured per-episode bill first. It does not call a
model, which is the only reason a green build here is a statement that can be trusted at $0.

### 17.172 A price owes a distribution, so the floor driver measures characters and replays once

**The design question.** R161 delivered a lane that opens at zero calls and a plan that was priced by modelling:
134 games × an assumed number of turns × an assumed prompt size. Two of those three factors were never read
from the corpus, and the third — the per-episode bill — is the number a dispatch turns into money. A design that
quotes it from arithmetic is quoting a model of a run.

**The instrument.** `eval/drivers/alfworld/floor.py` drives the whole held-out split with a walker that chooses
uniformly among `admissible_commands`, so the walker cannot hallucinate, cannot leave the action space, and needs
no prompt. It records per game: the game's split-relative identity, the win, the step count, the action digest,
and **the character count of every observation**.

| decision | the alternative | why not |
| --- | --- | --- |
| characters, not tokens | count tokens with a local tokenizer | no tokenizer runs in that job, and a token figure produced there would be a second model standing in for a measurement |
| every game, to termination | a fixed sample of N games | the tail is what a per-episode price is wrong about, and a sample cannot say how long the tail is |
| two passes with one seed | one pass, variance assumed zero | the paired `mde` every quote rests on is only valid if an arm is a function of its seed |
| win count reported, not gated | gate on a floor above zero | a floor of zero is a good floor; a gate would be a prior about the corpus wearing a threshold |

**Three assertions, each closing a way the reading could be true and meaningless.** (1) Every game driven is a
game the split publishes and every published game is driven exactly once — a walker that replayed one game 134
times would report a floor and a determinism figure with no defect anywhere in its output; the identity is the
split-relative path, not the file name, because every game file is called `game.tw-pddl` and a name-based key
collapses 134 games onto one string. (2) Every episode reached a verdict the environment gave rather than the
step cap — a truncated walk is a different measurement, and mixing them puts a driver defect into the same number
as the floor. (3) The same seed replays, compared per game on identity, win, steps, action digest and
observation-length fingerprint.

**The assertion that fired first, and it fired on the driver.** The first version called `reset` on `AlfredTWEnv`,
which is a shell that reads the split and hands back a textworld gym environment; only the latter has `reset`.
The smoke pass caught it forty-two seconds in, which is why the workflow runs eight games before 134: a typo in a
driver should cost ninety seconds, not the job's whole budget.

**What the pass does not do.** It does not build a pack, does not call a model, and does not gate on the score.
Its whole output is a JSON artefact and a printed summary; the workflow uploads the artefact and prints
`model calls made by this job = 0`.

**What the first measured pass returned, and which row mattered.** Run `44644387139`, job `135983146374`:

| reading | value |
| --- | --- |
| coverage | 134 of 134, no duplicate — keyed on the split-relative path, because every game file is named `game.tw-pddl` and a name-based key would have collapsed the split onto one string |
| termination | 134 of 134 at the environment's own cap, none truncated by the driver |
| floor | **0 wins**, Wilson 95% **[0.0%, 2.8%]** |
| replay | **134 of 134 identical**, 0 mismatches across five fields |
| transcript | mean 5,367 chars, median 5,217, p90 6,846, max 8,405 |
| time | 852 s and 884 s, 6.36 s per game |

The floor being exactly zero is the row that decided something. A random walker at five percent would have
meant part of the family is reachable without understanding it, and every headroom figure the registration
quotes would have been too generous by that much. The transcript mean then turned the price into arithmetic, and the one remaining estimate — the fixed prefix —
was read out of `prompts/alfworld.py@LeapLabTHU/ExpeL`: two ReAct trajectories per task type, 1,839 to 4,286
characters, mean **3,574**. That gives 82,717 input tokens and 750 output per 50-turn episode, **$0.01286
uncached against $0.00105 with the prefix held** — **¥36.7 against ¥2.99 for 134 games across three arms**. A
factor of twelve, decided before any call, by whether the arm appends to a transcript or re-injects a pack on
every turn.

**The defect the smoke pass earned its keep on.** The first version called `reset` on `AlfredTWEnv`, which is a
shell that reads the split and returns a textworld gym environment; only the latter has `reset` and `step`. The
job failed 42 seconds in, on the eighth-game smoke pass rather than 30 minutes into the full sweep — which is
the entire argument for running eight games before 134.

### 17.173 A port owes its leaks a count, and owes its one divergence a sentence

**The design question.** R162 registers an `always-in` arm whose treatment is a *form* — a short list rendered
whole into every prompt — rather than a *dose*. For that arm to be a control rather than a description, the
maintenance arithmetic has to be the competitor's, and the places the competitor's arithmetic leaks have to be
**visible as counts** rather than discussed as opinions.

**The division.** `rule-bank.ts` owns four things and refuses a fifth:

| owned | how it is exposed |
| --- | --- |
| the parse of a reply into `ADD`/`AGREE`/`EDIT`/`REMOVE` | `parseOperations`, with the label-prefix rule and the period requirement kept |
| the vote arithmetic (`+2`, `+1`, `−1`, `−3` past `cap + 5`) | `mergeOperations` |
| the identity decision, in three modes | `sameRule` / `findRule` over `'exact' | 'substring' | 'tokens'` |
| what a prompt would carry | `renderable` |

**The four leaks, kept.** Identity is a one-directional substring test (`incoming.includes(existing)`), so a rule
that grows is recognised and a rule that shrinks is not. The banned-word filter runs on substrings, so
`ADDITIONAL care is needed.` is discarded. The cap evicts nothing — the arithmetic only raises the removal
penalty, so bank size drifts with model compliance and `peak` is reported beside `culled`. And a single reply is
not deduplicated against itself, because the pre-pass resolves every `ADD` against the *incoming* bank; this was
found by a test that expected deduplication and got two entries, and it is now a pinned behaviour rather than a
silent difference.

**The one divergence, and why it is a rejection rather than a rewrite.** ExpeL checks `rule_num > len(rules)` but
not `rule_num < 1`, so `EDIT 0` reaches `rules[-1]` and edits the last rule. That is a language accident, not a
design: reproducing it would not have made the port more faithful to anything a model does on purpose, and it
would have made the module harder to reason about. The operation is counted in `rejected` instead, so a run that
produces one is visible in the report rather than silently different.

**Why the default is the leaky mode.** A default call reproduces the competitor. `identity: 'tokens'` is one
option away and is the candidate replacement, but choosing it by default would have made every comparison against
the literature a comparison against an improvement on the literature — which is not a control, and the control is
the entire point of building the arm this way.


### 17.174 The boundary is a dependency rule, and the queue is checked against it

**The design question.** Four competitor mechanisms were proposed as candidates without first being assigned to a
layer, and one of them — an associative dual-layer memory reporting LoCoMo F1 — belongs to `cortex`, whose release is
explicitly excluded from this programme. A queue that mixes the substrate's work with the library's is not a
prioritisation problem; it is a scope leak that would have been executed before anyone noticed.

**The rule, in the form the tree already has.**

| layer | owner | what it decides | how a shape reaches it |
| --- | --- | --- | --- |
| substrate | `cortex` via `packages/node/src/store/cortex` | `MemoryValue`, bitemporal `Fact`, FSRS decay, `decideWrite`/`decideRetrieval`, `consolidate` | **projection only** — `KnowledgeItem → MemoryValue`; nothing in `core` reads it |
| store | `packages/core/src/memory` | which items exist, their evidence, their lifecycle | write path and distillation |
| delivery | `packages/core/src/apply` (`renderPack`, `shapeFold`, MMR) | what the model sees, in what order, under what budget | pure functions over the pack `recall()` returned |

**The precedent that settles the interesting cases is `shape-fold.ts`, and it settled one already.** When this
record needed a unit that collapses same-shape failures into one line, the decision table weighed three places:

| where | what it changes |
| --- | --- |
| write path — supersede an item, union its evidence | the store's *contents*, so a comparison against today's store differs in two places |
| distillation — one call per shape | the statement is written from one representative, discarding the others |
| **delivery — collapse same-shape items in the pack** | **the unit the model sees, and nothing else** |

Delivery won because it changes one thing, and every shape in the candidate registry is the same kind of object: a
section break, a render order, a placeholder, a collapsed row. `renderPack` already owns the budget, the placeholder
substitution and the truncation count; a two-section pack is one more field on `RenderOptions`, a graph-ordered pack
is one more comparator over the items, and a workflow placeholder is `shapeFold` with a different fold key. **None of
them requires a new structure in `memory/`, and a new structure there would be a second substrate** — one that would
then owe the decay schedule, the bitemporal facts and the conformance suite that `cortex` already publishes.

**Where the registry's `side` column comes from, mechanically.** A candidate is `cortex` when its authors report a
score on a question asked of the store independently of any task — LoCoMo F1, LongMemEval — because no `RenderOptions`
change can move that number and no paired prompt arm can measure it. Everything whose ablation is "with the block /
without the block" is `microglia`, and the registry therefore has exactly two legal values with no third for
"both": a mechanism that genuinely spans the two is **two candidates**, one per layer, and writing it as one row is
how the boundary gets lost.

**What the registry is checked for, and what it is not.** `scripts/check-docs.mjs` fails a push unless each row names
a side, cites exactly one `AM.n` that resolves to a heading in `COMPETITIVE.md`, and states an episode count. The
columns that matter for design are the last two: **`episodes needed` is where a candidate stops being a plan.** At
134 held-out games the paired resolution is 13.3pp, and the FSM's +5.23pp needs 861 episodes while H²R's +3.5pp
needs 1,923 — neither obtainable by repeating the split, because repetition narrows the estimate of the same 134
games rather than adding independent ones. **A row whose episode count exceeds the corpus is a row the design cannot
serve**, and it belongs in the registry as a stated impossibility rather than in a queue as a priced option.

**Ordering consequence, stated once.** Axis, then shape, then substrate. The axis — with versus without an
always-present block — is the only cell whose effect (ExpeL's 19.0pp) exceeds this split's resolution, so it is the
only one that can be decided before the corpus question. The shapes follow in ascending cost, and the substrate does
not follow at all: it is excluded by the standing instruction, and the projection stays a `MemoryValue`-shaped
mirror with a conformance test against the real build whenever that build publishes.

## 17.176 — `eval/drivers/alfworld/agent.py`: one loop, three arms, and a policy that proves the loop

17.175 described the pre-flight: a driver that could cover the split, replay it, and price it without calling a
model. This is the file that calls one, and its design decisions are almost all about making the *arm* the only
thing that differs between two numbers.

**The skeleton is the competitor's, transliterated.** `agent.py` sends the system line
`Follow the syntax of the examples closely when taking actions.`, then one human turn beginning
`{instruction}You may take maximum of {max_steps} steps.\nHere are two examples:`, then the two ReAct transcripts
of the game's task type split into alternating turns, then the first observation. Replies are parsed by the same
four-branch rule the competitor uses (`> think` → thought, `> …` → action, a bare verb → action, anything else →
thought), and an action is lowercased before it reaches the environment, exactly as theirs is. The reason is not
fidelity for its own sake: every published number in this line was produced by that skeleton, and a hand-written
prompt would make the arm a measurement of this programme's phrasing.

**The pack sits above the examples and is rendered once per episode.** This is the one structural decision that is
not the competitor's, and it is forced by two facts. DeepSeek caches on a token-block prefix, so a block injected
above the growing transcript is a single miss at the front and hits for everything after it; a block injected *per
turn* moves the divergence point into the middle of the conversation and makes every subsequent turn a miss — the
arrangement under which the τ² lane's memory arm was billed 3.7× its control's uncached tokens. And a pack that
changes every turn is a different intervention every turn, so an episode's delta stops being attributable to "the
memory". Rendering it once makes the arm a treatment rather than a sequence of treatments.

**The three arms differ at exactly one message index, and a test says so.** `none` passes an empty string where
`always-in` and `retrieved` pass `render_pack(entries)`; the opening is otherwise byte-identical, including the
instruction and the examples. `test_agent.py` asserts that the two openings differ at index 1 and nowhere else —
without it, "the only difference is the memory" is a sentence rather than a property.

**Two policies that never call a model, and why the seed one is the important one.** `--policy seed` picks
uniformly from the commands the environment publishes using `floor.Draw`, the same splitmix64 `floor.py` uses;
`--policy first` takes the first. Both run through `run_episode`, the function the model arms run through, so the
environment side of the loop is exercised by a policy that cannot be wrong about the model. `--assert-floor` then
compares the two readings field by field — games, wins, steps, action digest, observation fingerprint — and the
`agreement` job in `alfworld.yml` fails on a single mismatch. This is the only assertion in the lane that can catch
a defect shared by all three arms, which is the class of defect that arm-against-arm comparison cannot see.

**Nothing is repaired quietly.** A reply that parses to a thought does not step the world and is answered `OK.`,
which is what the competitor's own examples contain. Three thoughts in a row raise rather than scoring zero: a
zero would be a number about the prompt's syntax wearing the costume of a number about memory. An action outside
the admissible set is stepped anyway (the environment answers `Nothing happens.`) and counted, because filtering it
would make the arm smarter than the system it is measuring. The artefact carries `calls`, `thoughts`,
`invalid_actions`, `off_space_actions`, `usage`, `prefix_chars` and `prompt_chars` per episode, which are the
counters a calibration has to read before it reads its score.

**Sharding is contiguous, and refused where it would be dishonest.** A model pass may be sliced (`--shard i/n`)
because a job that drives 34 games needs nothing from the 100 it does not drive; the slices tile the split with no
overlap and no gap. A `seed` pass may not be sliced, because its PRNG sequence is a whole-pass sequence — the draw
consumed by game 40 is a function of the 39 before it — so `agent.py` refuses that combination instead of producing
a slice that cannot be compared to the floor.

**What it deliberately does not do.** It does not retry a failed call, does not fall back to a policy when the key
is missing, does not re-anchor the pack inside an episode, and does not clip an action to the admissible set. Each
of those would raise the score and lower the value of the number.

## 17.177 — `eval/drivers/alfworld/aggregate.py`: joining the slices, where the unit is the game

A 134-game pass is 20,100 calls and does not fit in one job, so `agent.py --shard i/n` dispatches it as contiguous
slices. `aggregate.py` is what turns the slices back into the one number the design is about: a **paired** difference
between two arms.

**The pairing is the whole argument.** Two arms run the same games; they disagree on some and agree on the rest. An
unpaired interval would be dominated by task-type difficulty, which both arms suffer equally, so the delta is
`mean(a − b)` over games both arms ran, the interval is a bootstrap that **resamples games**, and the discordance
`b + c` is reported beside it. Resampling episodes instead of games would shrink the interval by pretending the
split is larger than it is — the cluster mistake this design was built to avoid, since 134 games repeated four times
are 134 samples, not 536.

**Three things are refused rather than averaged**, because each of them still yields a number:

- a game driven twice across slices, which is two votes for one question;
- an arm whose slices do not tile the split (`--expect 134`), which changes the denominator silently;
- a pair of arms whose games do not coincide on every one, which would turn "these arms differ" into "these arms were
  run on different corpora".

**The MDE is printed next to the delta and for the same reason.** `mde = 2.802 · sqrt(b + c) / n` is what the sample
could have seen. A delta whose interval spans zero is not automatically evidence of no effect; it may be evidence
that the sample could not produce one, and those two readings call for different next steps — a bigger corpus versus
a different mechanism. Printing the MDE makes the difference between them visible in the same table as the result.

**Reproducibility is inherited rather than re-invented.** The bootstrap draws from the same splitmix64 `floor.py`
uses, so an interval can be reproduced from its seed alone by anyone who has the episode list — which is the property
that makes a resampled interval checkable at all.

## 17.178 — `eval/drivers/alfworld`: the corpus section as an axis, and the three guards a second section needs

**The change.** Three modules learned that a corpus section exists. `agent.py` refuses a `--games` beyond the
section's published size (it used to answer with `min(games, num_games)`, which turned a request for 140 games on
the 134-game split into 134 games and a `134/134` artefact) and records `split` and `split_size` in its header;
`aggregate.py` refuses a join that spans sections until `--expect-splits` names them, then attaches each
episode's section at join time and prints `by_section` beside the pooled delta; `distill.py` writes
`source.train_split`, read from the artefacts' own headers, and the dispatcher refuses a `--split` equal to it.

**The table.** `SPLIT_SIZES = {eval_out_of_distribution: 134, eval_in_distribution: 140, train: 3,553}` and
`SPLIT_DIRS` mapping each environment name to the corpus directory it lives in (`valid_unseen`, `valid_seen`,
`train`). Both are measured by `scripts/check_split_sizes.py`, which counts `game.tw-pddl` files, locates the
corpus rather than assuming the download's layout, and distinguishes "missing" (unknown, exit 1) from "empty"
(a section of size zero). It runs on built corpora in `ci.yml` and on the fetched corpus in the `floor` job.

**Why a section is an axis rather than a flag.** At 134 paired games the minimum detectable effect is 12–13 pp,
and every remaining hypothesis on this lane is 3–6 pp. A second section is the only way to buy resolution without
buying a new mechanism, and the resolution is not the only thing it buys: an effect present in held-out rooms and
absent in seen ones is a property of the split, which is the negative result this programme most needs to be able
to detect. That is why `by_section` exists and why the 274-game join is graded rather than pooled silently.

**The two rules this replaces, and the one it declines to make.**

| was | now | why |
| --- | --- | --- |
| `total = min(games, num_games)` | refusal on either ceiling | a silent `min` reports a full-looking rate for a budget never received |
| any join across sections refused | refused until declared, graded once declared | the rule refused the only purchase this lane has left; a guard that refuses its own design gets deleted |
| (no leak rule) | `source.train_split` ≠ scored section | a bank scored on the section that produced it reports a real number about the wrong population |

The leak rule is deliberately **not** "no bank on its own section": a hand-written bank is a function of no
section — one sentence, one verbatim trajectory — and refusing it would refuse R177 itself. The distinction is
carried by data rather than by intent: distill.py's `episodes` field says a bank was distilled from a set, and a
distilled bank whose provenance is missing is refused rather than trusted, because "cannot prove" is not "did
not".

**What it costs to hold.** 506 tests, 98.8% of lines and branches, every module at or above the 95% floor, and
five structural rules in `test_cli.py` that read the YAML rather than the code — including one that compares the
dispatcher's payload keys against the declared workflow inputs from two command lines between them naming every
input. That rule exists because `--control-run` once bought a treatment with no control while the command line
said otherwise.

## 17.179 — `banks/`: a citation is data about a claim, so it gets fields and an equality guard

The evidence-linked entry (WikiTrace) was registered in 17.178 as not buyable at this design's resolution. R178
bought it anyway, because the resolution was bought first: pairing two treatments took the mde from 9.70 pp to
6.63 pp for one arm's price (34.256). What it cost the tree is two fields and two test classes.

**The arm is two banks that differ by one clause.** `bank-putmove-source-1.json` and `bank-putmove-note-1.json` both
render **551** characters: the same 292-character sentence with 62 characters appended, one of them
`[source: one won pick_and_place_simple game, run 44841962248]` and the other a true, neutral note containing no
digit. A *length control* rather than a placebo: it says something true about the entry's status, so a difference
between the arms is the clause and nothing else.

**Two fields, because a citation can be about two different runs.** `source.cited_run` is the run the clause names;
`source.distilled_from_run` is the run the entry was distilled from. In R178 they are different runs — the sentence
came from 44754440122 and the clause cites 44841962248, where the entry won 10 of 24 `pick_and_place_simple` games —
and the bank's `kind` said "the run it came from", which was false (34.254). `source.false_by_construction` marks
R179's arm, whose citation names a run that does not exist and must not be "fixed".

**The guards live in `test_banks.py`, not in `validate_bank`.**

| class | holds | fails when |
| --- | --- | --- |
| `ProvenancePairTest` | both arms carry the sentence byte for byte, the clauses are **exactly** equal in length and in position, the control carries no digit, the clause's run id is `cited_run` | a control one character longer, a digit in the control, a citation that drifts from the field |
| `GhostCitationTest` | R179's arm is 551 characters, differs from the true citation only in the eleven-digit run id, and declares itself false | a ghost of a different length, a ghost that silently cites the real run, a flag that stops being `True` |

**Why equality and not the 5% tolerance.** Every earlier length claim in this lane compared *different artefacts* —
a trace against a sentence, a compressed pair against a verbose one — where 5% of 489 is 24 characters and the claim
is "about the same length". R178's claim is one clause, where 5% is 27 characters and the clause is 62. A pair held
to a tolerance can only be read as "length plus something"; a pair held to equality can be read as "the clause".

**What the round read.** `1a − 1b = −3.65 pp [−8.39, +1.09]`, p = 0.151, with 55.5% of trajectories changed and 26
games hurt against 16 helped: the clause is read and does not pay. The length half was a **null** (−0.36 pp
[−4.74, +4.01]) that retires this lane's per-character reading of its own tax — the cost is per entry (34.255).

## 17.180 — `core/kernel/serve-profile.ts`: the shipped configuration as a record, and what the audit refuses

**The split this module closes.** The knobs a deployment can move are read in `capture/microglia.ts` from
`MicrogliaOptions`, and the values that won are decided in `packages/eval`'s arms. Until R197 those two facts lived in
two packages with no artefact between them, so "the product ships what we measured" was a convention — which is the
kind of convention that survives exactly until someone adds an arm.

**The data type.** Five fields, `null` meaning *the library's own default*:

| field | type | `null` means | why the distinction is load-bearing |
| --- | --- | --- | --- |
| `budget` | `number \| null` | `policy.defaultBudget` (1,200) | the only absence with a name, so the audit can print it |
| `note` | `'standard' \| 'hardened' \| 'none' \| null` | the renderer's own sentence | R53's arm varies one sentence; a default that moved would move every pack |
| `budgetBasis` | `'note-included' \| 'note-excluded' \| null` | `note-included` | the accounting every published number was produced under |
| `speakMargin` | `number \| null` | speak always | `0` attaches `pack.decision`; `null` does not. Filling it in would change the bytes |
| `credit` | `boolean` | — (stated) | the one knob whose library default is a decision |

`serveOptions(profile)` returns the subset with absent fields **omitted**, so a caller spreading it cannot receive a
defaulted value it did not ask for. `diffServeProfile(recorded, shipped)` returns `unknown`, `missing` and `differing`
with strict inequality (`1200` against `"1200"` is a divergence), and `sameServeProfile` is the single predicate the
gate and the tests share.

**The record and its four refusals.** `eval/results/serve-profile.json` carries `profile` and `fields`, where each
field is either `{kind: 'reading', id, artefact, deltaPp, ciLowPp, ciHighPp, alpha}` or
`{kind: 'unmeasured', reason}`. `auditServeProfileRecord` collects rather than throws, so one run reports every
problem, and refuses:

1. a field the record states and the product does not ship (or the reverse);
2. a reading whose interval does not contain its own delta, is not finite, or has an alpha outside `(0, 0.5]`;
3. a reading whose interval contains zero — *a justification that is a sentence wearing an interval*;
4. a reading on a field the product ships at its default — *the decorative reading*, evidence collected for a report
   rather than for a release, which is the one refusal that would otherwise inflate the coverage number.

**Placement.** `serve-profile.ts` lives in `kernel` because it is a pure record over `RecallQuery`'s note vocabulary
and imports nothing from `apply` or `capture`; `serve-profile-record.ts` lives in `eval` because the readings do. The
dependency runs eval → core, never the reverse, which is why the product can be audited without depending on the
benchmark.

**Test strategy.** The profile's own cases pin every key and the frozen object, and this is deliberate: a table of
five constants is worth testing only when the test is what fails the day someone edits one in passing. The audit's
cases are a refusal table plus the committed record, so the artefact is read by the suite as well as by the CLI. The
node case compares pack **hashes** between the product and a host built from the same profile, which asserts the
bytes rather than the options.

## 17.181 — `eval/arm-bill.ts` and `eval/arm-serve.ts`: the arm as the product plus a named delta, and what it cost

**Why two modules rather than two patches.** R197 and R197a each closed one seam and left the next one visible: the
product spread its profile but the arm did not, and the arm wrote a bill that the pair read from a different field.
Both defects are the same shape — a quantity with two writers and no comparison — so both are repaired the same way,
with one reader and one derivation that a test can call.

**`arm-bill.ts`.** Input: a `Tau2PhaseUsage` (from a document at the root or under `tau2.usage`, or from the
driver's own record) and/or a recorded call count. Output: `{ calls, source, promptTokens?, completionTokens?,
uncachedTokens? }` with `source ∈ {census, count, absent}`. Two decisions are worth stating because both are
refusals to coerce:

- a recorded `calls: 0` is `absent`, not a measured zero. Nothing in the lane has measured a provable zero, and the
  literal is exactly what R198 exists to stop quoting;
- a negative or non-finite value falls through to the next channel rather than being clamped, and a census whose
  numeric fields are not numbers is refused at the parser (`bad-usage`), because a `NaN` that reaches the estimator
  becomes a number somebody divides by.

`armBillMetrics()` writes the state as the pair `usage_absent` / `usage_counted` — `0/0` census, `0/1` count, `1/0`
silence — because one flag cannot carry three states, and `armBillLine()` spells the same state in words, because
`0` printed twice is the ambiguity the flags exist to remove.

**`arm-serve.ts`.** `armServeOf(overrides, profile?)` starts from `serveOptions(profile)` and overlays only the named
fields, returning `{ options, moved, unmoved }`. The driver spreads `options`, so the mechanism is total: a knob the
profile owns cannot be set at the call site. Each override carries a `reason` (a variable or a registration); the
same field twice is refused; a field named at the shipped value is kept as `unmoved` rather than dropped. `moved` is
sorted by the profile's own field order so two arms read down the same column.

**Placement.** Both live in `eval`, not `core`: the bill is about a harness's provider account and the arm derivation
is about a benchmark's dispatch. `arm-serve.ts` imports `serve-profile` from core (eval → core, never the reverse),
which is what makes "the arm is the product plus a delta" a compile-time statement rather than a convention.

**Test strategy.** Three layers, each catching a different failure:

1. **unit** — the three bill states and their flags, the two refusals, the sort order, the four renderings
   (`null`, boolean, string, number);
2. **parser** — a census at the root, under `tau2`, both at once, absent, `null` fields, and four malformed
   values including `1e999` (legal JSON that parses to `Infinity`);
3. **process** — the lane writes two artefacts from one document and the pair is run over them, so the acceptance is
   a number in three files; and the driver is imported twice to show that the baseline arm moves nothing and a named
   arm moves exactly what it names.

The process layer is not decoration: the unit tests would all pass if `bin/l4.ts` forgot to call the reader, which is
precisely the defect being repaired.

## 17.182 — `eval/pack-ledgers.ts`: an identity as the instrument, and pooling as the correction

**Why an identity.** The lane's artefact already contained three blocks describing one experiment, and no reader
compared them. `serveYield` counts renders, opportunity, repairs, breaks and inert; `degradation` counts broke,
repaired, blankRight and measured; `comparison` counts paired, lost and gained. The relation

```text
inert = renders - repaired - broke
```

holds because a pack is inert exactly when the episode's verdict did not change — so `inert` is not a residual to
be estimated, it is the count of unchanged verdicts. Making that explicit does three things a "delta plus a census"
paragraph cannot: it turns the share into a measurement, it makes six contradictions detectable, and it gives the
gate a denominator that does not inherit the contrast's variance.

**The six refusals, and what each protects.**

| refusal | protected claim |
| --- | --- |
| `no serveYield / degradation / comparison block` | the reading exists at all |
| `inert does not close` | `inert` is a count, not a typo |
| `census disagrees` | the two blocks describe one population |
| `comparison disagrees` | the delta and the ledger describe one run |
| `degradation is impossible` | a repair needs a control failure; a break needs a control success |
| `net does not close` | the printed percentage is the ledger's own division |

**Pooling by treatment.** `treatmentKeyOf` canonicalises `unit/form/scope/model/traceClaims/knobs/rotation` in a
fixed order. `rotation` is included because it is a *serving* policy: R152c's bounded arm travelled at most 3–4
packs, and averaging it with unbounded folds is what the published −4.64 pp did. The gate reports every key
separately and recomputes the published figure from the four post-R152 artefacts, so an arithmetic error and a
mixed population produce different outputs: the first moves the number, the second leaves it and moves the
population. The key is nevertheless **not total**: a field omitted when absent cannot serve as one, and
`poc-l4-pair-r152` declares no rotation while its registration pins `serveRotation: fair-share`. R202 writes `none`
explicitly so that absence stops meaning two things; until then the gate quotes keys as what the artefact declares.

**Wilson rather than a point.** `inertShare` is a proportion over served packs, so it carries `wilsonInterval` — the
same function the reproduction module uses, and for the same reason: at 88% with n = 40 a Wald interval understates
the upper edge, and an interval that excludes 100% would be a claim rather than a measurement.

**The price, and the three ways it is absent.** `inertPriceOf` takes two `ArmBill`s (R198's type) and returns
`priced: false` with both *states* named when either is not a census — a count carries no token vector — when a
census has no prompt-token column, or when the subtraction is negative. The record stores the price **per fold**,
because a bill belongs to a dispatch; a corpus price would average two runs' bills into a number no artefact
supports.

**Test strategy.** Three layers: the identity and each refusal (12 cases), the pooling arithmetic and the Wilson
interval (4), and a **process** layer that reads the five committed artefacts, recomputes the published −4.64 pp and
the five-fold −4.38 pp, and asserts that every treatment key is negative. The third layer is what makes the module a
gate rather than a library: the numbers in the paper are recomputed from the files a reader can open.

## 17.183 — `eval/window-fit.ts`: two hours in a refusal, because one of them was the wrong one

`windowFit` answers a question `planBandWait` and `isPeak` cannot: *will this run still be inside the off-peak band
when it finishes?* It already did the arithmetic correctly — `estimated = ceil(episodes × 26 s / 60) + 10` — and its
refusal was wrong in a way no number in it revealed. `windowOpensAt` was computed as `now + minutesUntilPeak`, and
`minutesUntilPeak` returns the moment **peak begins**; the field therefore carried the closing edge of the current
stretch while its name, its docstring and the printed sentence all said "the hour the guard is waiting for".

The type now separates the two facts:

| field | meaning | example at 00:47 Monday |
| --- | --- | --- |
| `minutesRemaining` | off-peak minutes left in this stretch | 13 |
| `peakOpensAt` | the hour the run would cross into | `01:00` |
| `windowOpensAt` | the next off-peak stretch long enough to hold the run | `04:00` |

`nextFittingWindow` is the walk behind the third: start at the crossing, move to the next off-peak start, measure
what that stretch offers, and if it is shorter than the estimate jump past the peak to the following one. Two
consequences are load-bearing. A 227-minute run is told **10:00**, not the 04:00 stretch it would overrun. And a card
whose every stretch is an hour long raises `no off-peak window in the next week is long enough for this run` rather
than naming a moment that is itself peak — the failure mode of returning `now`, which is what a simpler
implementation would have done.

**Why this belongs in the technical design rather than a commit message.** The guard's *advice* is part of its
contract: it is the only thing an operator reads before spending money, and it was the inverse of the rule. The test
suite had codified it — `expect(...).toContain('Dispatch with not_before: 06:00')` for a run that needed the 10:00
stretch — because the expectation was written from the implementation's output. The replacement asserts the property
instead: whatever hour it names must be able to hold the run, and the two hours must differ, because a guard that
names the same hour twice has stopped distinguishing them.

## 17.184 — `eval/cross-fit.ts` and `eval/pack-ledgers.ts`: totality belongs to the producer, not the reader

A pool key is an equality test, so a field that only some files carry is not a field: it is a coin flip on whether
two folds are comparable. `rotation` was in exactly that state. `treatmentOf` wrote it when an arm stated one, the
reader omitted it otherwise, and the two shapes — *declared nothing* and *written before the field existed* —
produced one string. R202 moves the totality to the writer and deliberately leaves the reader alone.

| layer | before | after | why there |
| --- | --- | --- | --- |
| `treatmentOf` (`cross-fit.ts`) | `rotation` present iff an arm stated one | always present: the agreed value, else `none` | the pair is the last place that knows which arm stated what |
| `l4-pair` memory arm | `undefined` when its artefact carried no `serveRotation` | `rotationModeOf(block)`, which is `none` for absence | the memory arm is the only arm that can carry a policy |
| `l4-pair` control arm | `undefined` unless it carried a block | unchanged: silent | it serves no pack, so it has no policy to declare — silence, not disagreement |
| `treatmentKeyOf` (`pack-ledgers.ts`) | omits a field the file lacks | unchanged | a committed key may not move because the fold was re-read |

The asymmetry is the design. Making the reader total looks simpler and is wrong twice: it would re-label the four
committed folds on the strength of a rule they never ran under, and it would put the `none` into files that never
said it. The producer can say `none` because the producer ran; the reader can only report what the file says.

`Treatment.rotation` is a required field now, which is the type-level half: a future call site cannot forget it, and
the compiler refuses a treatment assembled without one. That is the same move §17.181 made for `ArmServe` — the
identity a comparison rests on is not an optional decoration.

**What the change does not claim.** `none` on a pre-field artefact would have been a guess about a run nobody
recorded, and the three folds whose registrations pin a policy are not re-derived from those registrations. The
round's acceptance is therefore stated as a *non*-movement — the record regenerates byte for byte, `--check` is
clean, and a test asserts each of the five committed keys is exactly what it was — beside the movement it does buy:
a fixture pair that declares no policy and one that declares `fair-share` now produce different keys, end to end
through the step that publishes the artefact.

## 17.185 — `eval/rung-dose.ts`: a curve is a reader, and the reading it must publish twice

A gate is a claim about a population, so pricing one is a table: for each threshold, what survives and what it costs.
R201 registered three dispatches at ¥4–5 to fill that table. The dispatches were unnecessary — every committed fold
carries `serveSweep`, a ladder that already prices every rung against the same episodes — and the module that reads
it is the round.

**The type carries the two readings a gate is judged on, and they are not the same number.**

| field | definition | direction as the rung rises | what it licenses |
| --- | --- | --- | --- |
| `inertAll` | `(trials − kept − broke) / trials` | rises to 1 | nothing on its own: a withheld pack is inert by construction |
| `inertServed` | `(served − kept − broke) / served` | the empirical question | whether the rung selects on inertness |
| `selectivity` | `prevention − repairLoss` | the empirical question | whether the rung is a mechanism (positive) or a dose (zero) or anti-selective (negative) |

A module with only the first column would report every gate as a success, because the definition guarantees the
result. The second and third exist because a threshold can be applied to any ranking, and the interesting question is
not *how much* it silences but *what kind* — and the corpus answers: the low rungs silence repairs and breaks in
exactly the proportion the corpus holds them (18.2% each at rung 0.01), the middle band silences repairs first
(−10.6pp at 0.05), and only rungs that remove more than half the memory become selective.

**`selectivity` is nullable, and that is a decision rather than a type detail.** A corpus that repaired nothing has
no repair denominator; the arithmetic would produce `−1`, which reads as the strongest possible finding about a gate
on the strength of an empty column. `null` says the denominator is missing, and the line prints `n/a`. This is the
same rule as `repairsPerBreak` in §17.182 and for the same reason: a rate with no denominator is not zero.

**The refusals are the ladder's own arithmetic, not the reader's opinions.** `withheld == trials − served` and
`kept + broke ≤ served` are checkable inside one row; a fold that fails them cannot price anything. The ladder-set
refusal is the pooled version: pooling is over one ladder, not the intersection of several, because an intersection
silently excludes whichever fold happened to report fewer rungs — which is how a curve becomes a property of the
experiment rather than of the corpus. And a curve with no rung 0 is refused rather than rebased: every delta in the
record is against the ungated row, and a reader that chose a different baseline would publish numbers the artefacts
do not support.

## 17.186 — `eval/serve-body.ts` and the agent's guidance path: a body as a field, and a call made where the bill can see it

Three rounds moved the memory's *dose* (R198's price, R201's rung ladder, R152's rotation) and the inert share did
not follow: 78.7% of served packs changed nothing, at rung 0.01 the gate removed repairs and breaks in exactly the
corpus's proportion, and the net delta turns positive only by turning the memory off. What none of them moved is the
**body** of the pack. R204 makes it a field and builds the arm the literature's largest effect is about.

**Two names, total at the producer.**

| body | what the prompt carries | where it comes from |
| --- | --- | --- |
| `rendered` | the block the store served, injected on the first turn and reused for the episode | every arm before R204; the resolver's answer when nobody declares one |
| `guidance` | one sentence written for the request by one model call, discarded when the episode ends | `serveBody: guidance` in a registration |

`serveBody` joins `rotation` in `Treatment` as a field that is **always** written for a pack-serving arm and absent on
the control, which serves nothing and therefore has no body to state. Two folds that served two bodies are two
treatments, and `treatmentKeyOf` appends the field after `rotation` so no key committed before it moves.

**Where the call is made is an attribution decision.** The agent, not the facade:

```text
first turn ──▶ recall(block) ──▶ one litellm completion(records + request)
                                        │
                                        ├─ a sentence ──▶ injected as the pack
                                        ├─ NONE       ──▶ nothing injected (the arm's gate)
                                        └─ error      ──▶ nothing injected (counted as a failure)
```

`run_split.py` counts every litellm call the process makes through a success callback, including the user simulator's.
A completion issued from the agent therefore lands in the same account the episode is billed to, and the
registration's first reading — *the memory arm's usage exceeds its control's by one call per served episode, with a
positive prompt premium* — is a subtraction over two counters rather than a second instrument. The same call issued
from the TypeScript facade would be invisible to that counter, and proving it happened would cost a new census.

**Three outcomes rather than two.** A model that was asked for a sentence can decline (`NONE`), fail (provider), or
answer. Collapsing the first into the third would report a working model as an unreachable one; collapsing it into
the second would report an unreachable provider as an arm with a gate. All three are counted, and only the first is a
served pack.

**No fallback to the block, and the reason is the treatment.** When the summariser fails the agent injects nothing.
Falling back would serve R93's treatment under R204's name, silently, in precisely the episodes where the mechanism
was unavailable — and the artefact would then contain two treatments whose mixture no field records. The alternative
cost is a handful of episodes with no memory, which is visible as `failures` and honest.

**The arm's central claim is about a file, so the file is counted.** `storeGrowth: { before, after, grew }` is taken
in the driver on both sides of the evaluation phase and recorded in the arm's own document. It is the only way
"nothing durable was written" can be a measurement rather than a claim about code, and it costs one query against the
in-process store the facade already serves from. The control arm has no such field because it returns before the store
exists — its silence is the absence of a file rather than a count of zero, and the pair prints `null`.

**Two traps this round had to disarm, both found by reading rather than by running.**

- **A raw store and a support floor of two are incompatible.** Raw records are one verbatim event each, so every one
  of them carries `supportTasks: 1`; R198's `serveSupport: 2` would have retired the entire store and the arm would
  have measured an empty pack for a reason unrelated to its mechanism. The header leaves the floor at 1 and says so.
- **`serveYield.renders` stops being the injected count.** The facade serves the block; the agent injects the
  sentence. An episode whose guidance call failed would be booked as an inert pack, inflating the number the whole
  line of work is about. `pack-ledgers` refuses a `serveBody: guidance` fold whose `failures` are non-zero, with the
  text `N of M guidance calls failed, so the rendered count is not the injected one`.

**The projection rule, restated with two more fields.** `serveBody` and `storeGrowth` are declared in `Tau2Raw` and
decided in `PROJECTION` in the same commit that emits them. R152's `serveRotation` reached a paid dispatch because a
spread member is exempt from the excess-property check: the type did not grow, the table stayed exhaustive over a
description that was no longer true, and the pair refused the arm after the run. The projection test's fixture now
states both fields, so the `carried` decision is exercised rather than written down.

### 17.175 The population a share is taken over is a field, and the flag is raised at the effect

**The shape.** Four layers, one quantity: the episodes whose prompt carried a body.

```text
agent   injectedEpisodes: boolean[]      one per boundary; raised where the injected message is built
        episodesWithBody: number         its sum, stated once so a reader never re-adds it
join    EpisodeOutcome.injected          any boundary of a repeated task injecting makes the episode served
        withheldEpisodes: number         episodes dropped from renders and from the per-item table
pair    serveYield.withheld              beside renders / inert, so a zero is a reading and not an absence
gate    ledger refuses                   a transient fold with no withheld, a census that does not close,
                                         or a provider failure
```

**Why the episode and not the call.** One episode makes one guidance call in the registered arm, but a retry inside
the episode makes a second one, and the first may have declined. The population is the episode because the outcome is
measured on the trial, and the flag is `true` if **any** of its requests carried a body.

**Why the effect and not the decision.** `pack_for` decides the pack; `generate_next_message` builds the message.
Between them a refusal, a failure or an empty recall can turn a decided pack into nothing, so the flag is raised at
the second site. The first draft of this instrument would have flagged the decision and reproduced the defect it was
written to remove, one layer in.

**Why `_open_episode()` exists.** Two lists, two appends, one function. The alternative — an append at each site — is
what produced a self-test where one case cleared the boundaries and not the flags, after which three cases graded a
population shifted by two. The pairing is the invariant; a function is the only place to keep it.

**What the gate refuses, and what that is worth.** A transient fold with no `withheld`: every artefact written before
this commit, including R204's own, because those renders may still be the facade's. A census that does not close: the
arm's own arithmetic, which a program with one integer per call cannot break honestly. A provider failure: the
coverage hole that the population field cannot repair. What it no longer refuses is a refusal, because a refusal is
the arm's registered behaviour and the join has already removed its episodes from the denominator.

## 17.187 — `notes.py`: the material as a file format, and the four states of "no note"

**Placement.** `eval/drivers/tau2/notes.py`, beside `turns.py` and for the same reason: it imports nothing
third-party, so the identity rule, the sidecar format, the trajectory renderer and the specificity check are all
exercised by a self-check that needs no provider, no harness and no network. The things that need a process — the
summariser call, the round loop, the merge — were pushed *out* of it into `run_split.py`, which is where the provider
and the filesystem already live.

**Contract.**

| function | what it promises | what it refuses |
|---|---|---|
| `note_key(text)` | whitespace collapsed, case kept, bounded at 500 chars | `""` for anything that is not a non-empty string |
| `note_of(notes, text)` | the sentence written for this task's last failure | `""` for no key, no entry, a non-string note |
| `load(path)` | `(document, None)` for a missing file — round one is not a fault | `(empty, reason)` for unparseable JSON, a wrong schema, a non-object `notes` |
| `record(...)` | the entry carries `note, attempt, reward, task, chars` | writes nothing for an empty key or an empty sentence |
| `trajectory_text(...)` | the failure as `USER / AGENT / CALL name(args) / RESULT / FAILED` lines, ceiling applied to both ends | `""` when the messages are not readable |
| `specificity(notes, trajectories)` | the share of notes naming a token unique to their own task's failure | `share: null` when nothing was graded |
| `note_round(...)` | one round's failures distilled, three counters apart | never distils a pass, never a trajectory it could not read |
| `merge_rounds(...)` | one document, round index as the trial index | refuses a task no round listed |

**The three refusals inside a round, and why they are three.** `refused` is the summariser answering `NONE`, which
is the arm's own gate and a *result*; `providerFailures` is the call failing, which is the run being broken; and
`unreadable` is the reader not seeing the messages, which is an instrument fault. A round that reported one number
for all three would let a broken run be published as "the material does not help".

**The ceiling, and why it is applied to both ends.** A retail attempt is a request, a dozen calls and a complaint;
truncating it at 2,000 characters from the left keeps the request and hides the mistake the note is supposed to name
— which is the failure mode R88 measured on records. `trajectory_text` therefore keeps `ceiling/2` from each end.

**Specificity, precisely.** Tokens are lowercase words of ≥ 4 characters, punctuation stripped at the edges and
digits kept inside them, so `W2378156` survives as one entity and `pay-pal` does not become two. A note is specific
when one of its tokens appears in its own task's failure and in exactly one task's failure in the phase. It is a
property of *this corpus*, not of English, which is why it is computed per phase rather than stored per note.

**What is deliberately not here.** The critic. Whether a note should be *validated* before it is injected is
MemTrapBench's AdaptiveMem, and it is the next arm if this one shows an effect — building it before the material is
shown to act would be pricing a filter for a signal nobody has measured.

## 17.188 — `note_pilot.py` and `r206_readback.py`: a producer, a grader, and the seam between them

**Why two files.** The builder turns two phases into a document; the grader decides what the document means. Split
because the two have different lifetimes: a fold's document is read months later by a reader who has neither the run
nor the log, and a grader that had to rebuild the document would be a second implementation of the arithmetic that
agrees with the first only until one of them is edited.

**Placement, and what it buys.** The builder is `eval/drivers/tau2/note_pilot.py` (beside `notes.py`), the grader is
`eval/verifiers/r206_readback.py` (beside every other readback). Both import nothing outside the standard library —
the builder because the workflow's free half runs it on the *system* interpreter rather than inside τ²'s virtualenv,
the grader because `r88_readback` is already there and its `Report` is the state machine every verifier shares.

| function | what it promises | what it refuses |
|---|---|---|
| `last_json_line(text)` | the phase's summary object, read from the end of its log | `tau2-note-pilot-no-summary` when no line is a summary |
| `trials_of(document)` | `{task, trial, reward}`, the trial index inferred only when absent | a document with no grid, an entry with no task, a reward outside [0, 1] |
| `score_arm(document, k)` | `pass^k`, the episode rate, and the two lists of tasks that leave either denominator | a task with fewer than `k` trials is named `short` rather than averaged as a zero |
| `material_of(summary)` | the census, the coverage over the rounds after the first, the agent's hits and lookups | `None` — not zeros — when the phase has no notes block |
| `pair_of(control, treatment)` | the paired difference at both levels with Wald's interval on the discordant pairs | — |
| `build(...)` | the document, `claim: "none"` | two agents, a control carrying notes, no shared task |
| `grade(document)` | `GRADED / NO_MEASUREMENT / DISCARDED / ABANDONED` and a `Report` | — |

**The seam, and why there is a job that only tests it.** `note-pilot.yml`'s `contract` job runs
`--fixtures` → the builder's CLI → the grader, and requires the last line to be `GRADED`. It is the only test of the
four commands' *composition*: a renamed flag, a `--tasks` string that no longer parses, a schema the two files
disagree about, a `--seeds` list the builder casts to ints and the workflow passes as text. Every one of those is a
defect that would otherwise first appear on a dispatch that had already bought 48 episodes, and none of them is
visible to either file's own self-test.

**The three refusals in the builder are about the comparison, not about the material.** Two agents makes the
difference the wrapper's (R93); a control carrying a notes block is a treatment that leaked (the sidecar is read
through an environment variable, so a stray variable is the ordinary way this happens); no shared task means there is
no pair. The builder deliberately does *not* refuse a low coverage or a flat delta — those are readings, and a
producer that withheld a document because it disliked its numbers would be the defect this record has repaired every
time it has met one.

**`pass^k`'s denominator, restated because it is the one place a number can be quietly biased.** A task counts only
when it has exactly `k` scoreable trials; fewer leaves the denominator and is named in `short`, more is named in
`long` and also leaves it. Averaging a task as a zero because one of its trials did not run is how a fold reports a
`pass^4` about a grid it never ran, and the same rule is implemented on the TypeScript side (`toPassAtK`) for the
same reason.

## 17.189 — `opening_stability.py`: the question an arm must answer before it keys anything to an episode

**What it is for.** Every arm that binds a material to "this task" needs the episode's identity to be available in
the harness. R206 assumed it was, and the assumption was the arm's largest defect: its `hits: 0` had two sufficient
causes and the wrong one was the plausible one. This file turns the assumption into a measurement that runs over any
`results.json`, before a dispatch.

| reading | what it decides |
|---|---|
| `exactReuse` | whether the shipped mechanism's key can ever match: 0.006 on τ² retail |
| `withinMin` / `acrossMax` | whether *any* threshold could: separation needs the first above the second |
| `best` | what a fuzzy matcher would cost — θ and its two error counts, printed rather than chosen |
| `state` | `SEPARABLE`, `NOT_SEPARABLE`, `NO_MEASUREMENT` |

**Why separation is the criterion and not accuracy.** A threshold's accuracy over all pairs is dominated by the
cross-task pairs, and a classifier that said "different task" to everything would score well and serve nothing.
What the mechanism needs is the *margin*: the least similar pair of attempts at one task must still be more similar
than the most similar pair of attempts at two different ones. When that fails, the corpus is `NOT_SEPARABLE` and no
threshold exists — which is what happens when two tasks share a scenario, as 5 and 9 do.

**The tokenisation, and why it is the one the specificity check uses.** Lowercased words of at least four
characters. Shorter ones (`to`, `my`, `a`) appear in every opening and would inflate every pair toward
"same task"; longer-only would drop the product names that make two tasks distinguishable. The floor is a choice,
and it is the same choice `notes.specificity` already made, so a reader comparing the two numbers is comparing one
vocabulary rather than two.

**Why `NO_MEASUREMENT` exits 2 rather than 0.** Fewer than two attempts at any task, or a single task, means there
is nothing to compare — and that is a fact about the *grid*, not about the corpus. A caller that folded it into
"not separable" would be reporting a corpus verdict from a one-round run; the pilot workflow therefore treats exit 2
as "not measurable on this grid" and prints it rather than failing the job.

## 17.190 — `notes.py` and `note_pilot.py`: the file as the identity, and a read that merges

R206's material is bound to a task by the task's opening message, and R206a measured that bound at 0.006 exact reuse
over 168 same-task pairs, with within-task similarity falling *below* cross-task similarity on the same corpus. R207
keeps the material and moves the identity: the runner runs one task per invocation and the sidecar declares it.

**The document.** `microglia.notes/2`, with `scope` a first-class field:

```json
{"schema": "microglia.notes/2",
 "scope": {"kind": "task", "task": "5"},
 "notes": {"<note_key of the opening>": {"note": "…", "attempt": 1, "reward": 0.0, "task": "5"}},
 "collisions": {}}
```

`scope_of` has four answers, and `broken` is apart from `none` on purpose: a scope that claims to name a task and
does not is a writer defect, while `none` is a store-free arm. `load` refuses a `/1` document rather than
reinterpreting it — the agent then serves nothing and records the problem, which is the safe direction.

**The lookup, and why it returns two things.** `lookup(document, text) -> (note, how)` with `how ∈ {key, task,
none}`. The key is tried first because it is a statement about *this* request; the scope second because that is the
identity the harness can actually give. The fallback fires only for `kind == "task"`, serves the entry with the
highest `attempt` (a dictionary's order is a property of the writer, the attempt number a property of the run), and
returns `("", "none")` if any entry in that file names a different task — the cross-task mechanism R41/R204
measured, arriving by the one route R207 opens.

The counter split is the reading's first gate: `keyHits` is R206's mechanism, `taskHits` is R207's, and a fold with
`hits > 0` and `taskHits == 0` says the improvement came from the text rather than from the file. `hits` remains
their sum so a reader of the older field reads the same quantity.

**Why one task per process, priced.** `--notes` with two tasks is refused (`tau2-notes-need-one-task:N`). A run that
merged two tasks into one sidecar would write two tasks' notes into one file, and the agent would have no way to tell
which entry is its own — the defect the round exists to remove, reintroduced by the runner. The price is one τ²
import per invocation, ~10 s, twelve of them on the pilot's grid: two minutes against one wrong-note serving.

**The read, merged in three places.** An arm is six phases, so `note_pilot.py` takes each flag as a comma list:

| level | function | what it refuses |
|---|---|---|
| the grid | `notes.merge_documents` | a task two documents list; a `(task, trial)` two documents hold |
| the phase | `merge_summaries` | two models or two agents inside one arm; a band that is not shared (`mixed`) |
| the corpus | `merge_sidecars` + `merge_trajectories` | nothing — a shared key is *counted*, because the reading it damages is a diagnostic |

**Specificity is the one reading that is a property of the corpus.** With one task in hand every note's entities are
trivially unique and the share is 1.0; so `specificity` returns `share: null` with a reason below two tasks, the
runner writes `<notes>.trajectories.json` (the failed attempt each note came from), and the builder recomputes the
share over all six. An artefact built without `--notes` carries `specificity: null` and the reading reports N3 as
**unmeasured rather than refuted**: an absent diagnostic is not a finding about the material, and turning it into an
abandonment would throw away a paid fold over a missing file.

**The instrument, floored.** The lane's four Python files carried self-checks and no coverage gate, which is how
`opening_stability.py` sat at 80.0% while every job was green. The contract job now runs the four under
`coverage --branch` with `--min 95 --expect-files 4`, and they stand at 96.9 / 95.7 / 98.1 / 96.6 after this round's
cases — including a deliberate wrong expectation fed to `run_cases`, because a suite that cannot fail is a suite
whose green means nothing.

## 17.191 — `verdict_text`: the evaluator's side of a failure, quoted beside the attempt

The note lane's material is one sentence distilled from a failed attempt. Until R208 the distiller saw only
`trajectory_text` — the agent's own account of the episode — and R206a plus R207 measured four failures and four
refusals. The refusals were correct: a premature escalation to a human reads as competent assistance in the
transcript, and only the evaluator knows the required action was never taken.

`notes.verdict_text(simulation, ceiling=600)` renders the evaluator's account as lines:

| source | line |
|---|---|
| `reward_info.reward` | `REWARD 0` |
| `reward_info.db_check.db_match` | `DB CHECK met` / `DB CHECK not met` |
| `env_assertions[]` | `ENV not met: retail` |
| `action_checks[]` | `ACTION not met: return_delivered_order_items` |
| `communicate_checks[]` | `COMMUNICATE not met: the agent must tell the user the refund total` |
| `nl_assertions[]` | `ASSERTION met: the agent apologises` |

Three properties, each of them a decision:

- **the head is kept on truncation**, where `trajectory_text` keeps both ends. The first two lines are the reward
  and the database verdict, which are what decide the episode; a tail would keep whichever assertion the evaluator
  appended last;
- **both wire shapes are read.** τ² hands this process objects and an artefact holds JSON, so every field goes
  through `_field`. R208 found the gap by asking both shapes the same question: `reward_of` used bare `getattr` and
  the reward line silently vanished on the JSON side;
- **the outcome's spelling is per check family** (`met`, `match`, `action_match`), and a check with no recognised
  outcome is dropped rather than defaulted. A defaulted `met` would tell the summariser the opposite of what the
  evaluator said, and a dropped family looks exactly like a family with nothing to report — which is why the reader
  tries three names rather than one.

`note_prompt(trajectory, verdict="")` returns R207's bytes exactly when no verdict is offered, so the two materials
are comparable and not merely similar:

```
ATTEMPT
<<<
USER: I want to cancel order W2378156.
  CALL cancel_pending_order(order_id="W2378156", reason="no longer needed")
  FAILED Order W2378156 has already been delivered and cannot be cancelled.
AGENT: I have cancelled your order.
>>>
VERDICT
<<<
REWARD 0
DB CHECK not met
COMMUNICATE not met: The agent must inform the user that the order cannot be cancelled because it has already been delivered.
ASSERTION met: The agent apologises for the inconvenience.
>>>
```

**The material is a dispatch argument.** `--note-verdict` and `note_verdict` default to off, and three artefacts
carry the fact rather than a comment: the round census gains `verdict` / `verdicts` / `verdictChars`, the phase's
notes block and the fold's merged census carry the same three, and `merge_notes_blocks` refuses a corpus whose
phases disagree (`tau2-note-pilot-mixed-verdict:6:1`). An artefact written before the field existed reads as
`false` — the same fact as a phase that ran before the material did — so mixing a pre-R208 phase with a verdict
phase is refused rather than averaged.

**Cost, measured on a rendered example.** 210 characters on a retail failure against the attempt's 2,000: about 55
tokens, 0.03% of the treatment arm's prompt in R207's pilot, billed inside the arm's own `prompt_tokens` rather than
by a second instrument.

## 17.192 — The material ablation: paired by construction, graded against chance

The note lane's question is narrow — does showing the summariser the evaluator's verdict produce a better note
than showing it the attempt alone — and the design is chosen to make that question answerable at n = 85 for four
cents.

**Paired.** Same failures, same model, same ceiling, `temperature=0`, one call each side, in one process. Only the
material moves. A crossed design would confound the material with the schedule, and at this n the confound would be
larger than the effect.

**McNemar's exact test, not a difference of proportions.** In a paired binary outcome only the discordant pairs
carry information: `rescued` (refused then written) against `lost` (written then refused), and separately
`verdictOnly` against `attemptOnly` for specificity. Under the null the two are equally likely, so the count is
binomial with `p = 1/2` and the two-sided exact p-value is twice the smaller tail, capped at 1. No normal
approximation: the discordant counts are 2 and 16.

**Four gates, in the order a failure of each would invalidate the others.**

| gate | reads | bar | a failure means |
|---|---|---|---|
| `P0` | calls cut off at the token ceiling | 0 | nothing was measured; `exit 2` |
| `P1` | failures whose verdict renders a line | ≥ 80% | the material does not exist |
| `P2` | of what the attempt arm declined, how many the verdict arm wrote | ≥ 50% | the verdict does not rescue |
| `P3` | notes naming a token of their own failing lines | ≥ 50% | the notes are written but not from the verdict |
| `P4` | prompt characters the block adds, per failure | ≤ 667 | the block is a second trajectory |

**`P0` exists because its absence cost three rounds.** `deepseek-flash` bills its reasoning against `max_tokens`; a
note call that leaves thinking on returns an empty message, and `sentence_of` cannot tell that from `NONE`. The
first ablation read 82 of 85 "refusals" that were truncations. `notes.call_note_model` now disables thinking and
returns `finish_reason`, `truncated` is a state of its own in every census, and no reading is graded with one in it.

**`P3` is measured against chance, and the chance rate is printed beside it.** A note that says "confirm the details
with the customer" shares tokens with every failure's failing lines; a note that says "process the return for
#W7387996 as well" shares them with one. Reporting the share without the baseline would let a vague material pass
and a specific one fail. The registered measure — a token only the note's own failure held — is kept as
`exclusive`, and on this bank its ceiling is 9.4% because the action a note most needs to name is an action other
failures name too.

**The verdict's content is part of the material, and it was degenerate.** `action_checks[].action` arrives as
`{"name", "arguments"}`, and a reader that wanted a string rendered `ACTION not met` for all 85 failures; the
evaluator's `justification` was dropped. The renderer now emits `ACTION not met: exchange_delivered_order_items(
order_id=#W2378156, …)`, appends the justification when it says something new, and orders **failures before
passes** so that a block truncated at its ceiling keeps the lines that explain the failure rather than the ones that
say other steps were fine. Mean verdict 439 characters, max 598 against a 600 ceiling.

**The measure can be recomputed from the reading.** `--keep-notes` carries the sentences and their verdicts;
`--from-reading` recomputes `P3` and its paired contrast from them, keeping `P0`–`P2` and `P4` as the calls produced
them. A measure that changes should not cost a dispatch to test, and the ceiling of a measure should be checkable
before anything is spent on it.

### 17.176 The rescue rate: a conditional estimand, an exact interval, and a control inside the arm

`eval/tools/rescue_rate.py` exists because `pass^k` cannot register a note (AUDIT 34.210). Four design decisions,
each with the alternative it rejected:

- **The estimand is a pair.** `P(pass at j+1 | fail at j)`, computed over adjacent scored attempts ordered by the
  declared `trial` rather than by arrival. A census may be order-blind; a conditional rate may not, which is why
  this is a second reader beside `note_bank.rows_of` rather than a call into it. Unscored attempts are dropped, so
  the denominator is opportunities rather than attempts.
- **The baseline is a committed document.** `eval/manifests/note-bank-baseline.json` holds R208's rewards with
  `task_id`, `trial`, `seed`, the commit, the grid and the bill. The alternative — pointing the reader at the 32 MB
  bank — would have made the baseline a file nobody carries, and a counterfactual that has to be re-derived from a
  log is a counterfactual that gets estimated.
- **The comparison is exact at n = 23.** Clopper-Pearson upper limits by bisection on the binomial tail, and
  Fisher's exact test, both from `math.comb`. The alternative was a normal approximation, and the whole point of
  buying twenty-three opportunities is to be able to say something at that size rather than to assume the
  asymptotics arrived.
- **The arm carries its own control.** No note exists before attempt 0, so the treatment's first attempts sample the
  same process the bank sampled. `drift_of` compares the two counts on the shared tasks and a gap over four tasks
  (`DRIFT`, exit 3) voids the comparison. This is what lets one arm stand in for two: the assumption is measured in
  the run instead of asserted across runs.

The state machine is the registration in code: `RESCUED` needs the registered 25 points **and** `p < 0.05`;
`NO_LIFT` is awarded only when the upper limit sits below baseline + 25, so an underpowered run cannot be quoted as
a refutation; `INCONCLUSIVE` is the honest middle; `NO_MEASUREMENT` (< 12 opportunities) and `DRIFT` have their own
exit codes because both mean no reading exists rather than a reading of zero.

### 17.177 The population is a field, because the same two arms give +1.8 and +7.5

R212's reading is a ratio of two totals, and a ratio needs a denominator that a reader can see. The default is the
tasks the **baseline** failed — the ones for which a counterfactual exists — and it is printed:

```
| population | 19 task(s), those the baseline failed |
```

That default is a choice with a measurable consequence. Over those nineteen tasks the arm is 12/30 (40.0%) against
13/34 (38.2%), **+1.8 pp**; over all twenty-four it is 16/35 (45.7%) against the same 13/34, **+7.5 pp**. The five
extra tasks are ones the control never failed, so it contributes no opportunities there and the wider reading
admits treatment-side transitions that have no paired counterpart. Both totals are honest; neither is the reading
without its population, which is why the field exists rather than a footnote.

Two consequences for the instrument:

- **`--baseline-dir` over `--baseline` whenever both arms ran.** With one dispatch the drift check compares two arms
  that share a seed, and `render` says `vs baseline` rather than `vs bank` — a label that invites the reader to
  compare across runs, which is exactly the comparison AUDIT 34.211 refused;
- **the verdict is graded on the registered population and reported with its sensitivity.** R212 registered the
  twenty-four-task grid and its default selection gives `NO_LIFT`; the twenty-four-task total gives an upper limit
  of 63.4% against a 63.2% bar, one fifth of a point from `INCONCLUSIVE`. A reader who is not shown both would take
  a boundary for a margin.

### 17.178 The debit: requirement keys, two denominators, and a bar instead of a gate

`eval/tools/memory_debit.py` reads a paid run at the resolution the evaluator already scores. Four decisions:

- **the key is the requirement, not the instantiation.** `("action", "exchange items")`, `("nl", <assertion
  text>)`, `("db", "the database rows the request requires")`, `("communicate", <datum>)`. Two attempts that call
  the same tool with different arguments are two attempts at one requirement; an argument-level key would make
  the same requirement two different ones and the turnover would be a comparison of unrelated rows.
- **two denominators, never one.** A repair can only happen on a requirement that was unmet; a break only on one
  that was met. The rates are over 85 and 332 respectively, and a reader that divided both by the total would be
  reporting the difference of two rates over two populations — exactly what the rescue rate already did.
- **exact tests at these sizes.** Fisher's two-sided on both movements, imported from `rescue_rate` rather than
  re-implemented, because at n ≈ 85 the asymptotics are the thing being assumed.
- **the bar before the gate.** `breaks/(repairs+breaks)` is the precision a gate must exceed, computable before
  any gate exists; when it sits above the base repair rate (51.8% against 48.2% in R212) the population is
  net-negative and the honest next step is a different material rather than a filter. This is R34's bar on a
  second corpus, and it is the reason R213 spends its money on `--note-source verdict` rather than on an admission
  rule.

The naming association is deliberately lexical. An embedding would make the reading depend on a model that
changes between runs, and the question — "is the note about the thing that failed" — survives a blunt test: a note
that never writes the words is not about them. Its 53.7%-against-41.5% is reported as an association with its
p-value and its confounding stated, not as a causal claim. The word floor is two characters because `db` and `id`
are requirement tokens: at three, the database requirement was unnameable by construction and the denominator
was missing a family.

`--note-source model|verdict` moves the material from the driver into the dispatch: the verdict arm's note is the
evaluator's text with the `REWARD` line dropped and the met lines kept, because the harm this instrument measures
is a *break* and a note that repeats what already passed is the only part of it that could prevent one.

### 17.179 The goal board: asks from the request, receipts from the calls, and a refusal in between

The state channel's material is a list, and its design is the rule that decides when a line is ticked.

**Asks.** `goal_board.items_of` splits a user message at sentence boundaries and at `and`/`but`/`then`/`also`/`,`,
then reads each clause for a **family** cue — exchange (exchange, swap, replace), return (return, refund), cancel,
address, payment, transfer (human, representative, supervisor), modify (modify, change) — in that order, because
"change my address" is an address ask and not a modify. A clause with no cue inherits the family of the clause
before it **within the same sentence**, which is what makes "the smart thermostat for one compatible with Google
Home" an exchange rather than a fragment; inheritance stops at the sentence because the next sentence is where
this corpus changes the subject ("If not possible, you are angry") and an inherited family there manufactures asks
nobody made. The object is what follows the cue up to the first conditional, preference or substitution word, so
"exchange the keyboard **for** a clicky one" is an ask about a keyboard and not about clickiness. Two filters were
measured rather than guessed: a clause that begins with a continuation word and carries no cue of its own is a
modifier ("… but with clicky switches", "… same size"), and a negated cue ("do not exchange anything") is not an
ask at all.

**Receipts.** `receipts_of` keeps only the calls whose name is in `FAMILIES`, pairs them positionally with the tool
results τ² returns in order, and requires the result to be present and not an error. Its **name table** comes from
the episode's own reads: every `{item_id, name}` pair in any tool result, at any depth, because an order holds
items and an exchange result holds the new order. Ids and free text are separated, because an id proves *which
record* and a name proves *which product*.

**The refusal.** `settles` requires the same family, a successful receipt, and containment between the receipt's
names and the ask's words — **either direction**, because a user says "the keyboard" about a Mechanical Keyboard
and "the mechanical keyboard" about a product the catalogue calls Keyboard. A receipt that names no product falls
back to its free-text arguments (an address change carries no item id), and there the containment runs the other
way: the ask's words must be spelled by the receipt, and one extra argument (`user_id`) must not defeat it. An ask
that names no object is settled by the first receipt of its family and by nothing else. Everything else the
receipts did is reported as **unattributed**, which is the board saying what it does not know.

**The render, the tag, the counters.** Eight asks and 720 characters, a header that says a line is ticked only
when a receipt names it, and an `unattributed` line. The block is injected under `microglia-board`, and
`is_pack_message` accepts both tags so the previous turn's board is dropped by the same rule that drops a repeated
pack (R137). `board_for` re-renders on every turn: the state channel's whole claim is that the board at turn nine
knows what turn nine proved, and a memoised board would be a note with a list inside.

**The grid.** One attempt over 114 tasks and two arms in one seed world, 228 episodes. `--note-source board`
implies a parser and refuses `--notes`; with no sidecar there is no one-task-per-process constraint, so the
population runs in a single `run_tasks` call. `--compare` reads the pair: the four-cell table, McNemar's exact
test (the only test paired binary data supports), and Newcombe's interval quoted as **conservative** — ignoring
the pairing widens it, so an interval that excludes zero here excludes it under the paired calculation too.

### 17.180 Emission cadence: the cost of a material is how often it moves

R214's board was 23 tokens a turn against a 4,728-token prompt, and it raised the bill 67%. The mechanism is
positional rather than semantic: an injected block lives in the **system** message, the system message is the
front of the prompt, and a provider's prefix cache is a function of the longest unchanged prefix. Rewriting the
block on every turn shortens that prefix to zero, so the request is billed at the miss rate — and the provider's
own counter measures it: `prompt_cache_hit_tokens` fell from 90.4% to 75.1% across the two arms of one dispatch.

Three consequences for the design of any served material:

1. **Cadence is the cost knob.** `--note-source board` re-renders per turn and pays the prefix; a note written
   between attempts pays it once per attempt; a block written once per episode pays it once. The three differ by
   orders of magnitude in bill and not at all in length, and the length is what every artefact in this repository
   has recorded since R136 (`injectedChars`, `packChars`, `charsPerCall`).
2. **The arm's cost must be quoted as a rate, not a size.** `cache.cache_hit_rate` is on every phase summary and
   was read as a prefix-health diagnostic. It is a **price**: at this lane's card a miss is fifty times a hit.
3. **Cache-stable emission is a design constraint on state channels.** If the board is written only when a
   write-receipt succeeds, it changes a handful of times an episode and the prefix survives. That is also the
   configuration the published +23.9 describes — a checker in the write path — so the cheap design and the
   effective design are the same design, which is not true of the lesson channel.

The ask supply rule carries the same lesson in the other direction. The census read one message and predicted 3.8
asks a task; the arm read eleven messages an episode and listed 10.6, closing 1.58 of them. A material that is
*added to* by every turn grows without bound, and its length then costs twice: once in tokens and once in the
reader's attention. Asks come from the request; a clarification refines one, and the parser needs to say so.

### 17.181 The contract, and the two refusals that make a board a checker

The board's unit of truth is a **contract**: the asks the request states, read from the first user turn, fixed
before the first call. Three design decisions follow from that sentence and each of them is a rejection.

**1. The asks are read once per episode, not once per turn.** `board_of(messages, scope='request')` parses
`request_of(messages)` — the first non-empty user message — on every turn, from the messages the episode already
carries. Nothing is memoised (a memoised contract is a note), but nothing new is admitted either. The rejection is
of R214's supply rule: asks collected from every user turn grow monotonically, because a simulator's clarifications
("yes, the blue one", "no, only the lamp") are sentences that name objects after a verb. 10.6 asks against 1.58 is
not a parser bug in the ordinary sense — each line is faithful to a sentence — it is a supply rule with no closing
condition.

**2. A receipt settles an ask only by naming it, and a receipt that settles nothing is classified.** The
attribution rule is unchanged from R214 because it worked (79.2% of changing episodes ended with a ticked line, and
it never over-credited). What is new is that the failure side is split:

| state | condition | line |
|---|---|---|
| `unrequested` | no ask of the receipt's family exists in the contract | `Not asked for by the request: N call(s) — tool` |
| `unattributed` | the family exists, the receipt's object cannot be named | `Not attributed to any ask: N call(s) — tool` |
| (nothing) | the call failed | — |

The split matters because the two facts point at different repairs. `unrequested` is the agent doing work nobody
asked for — the failure τ² charges for, and the only one of the three a *checker* can catch that a transcript
cannot. `unattributed` is the board's own blindness (an address change carries no item id). Reporting them on one
line, as R214 did, makes the parser's limit look like the agent's mistake. A failed call is on neither line: it
changed no state, and a list of state is not a list of attempts.

**3. The cadence is an accounted quantity rather than an inference from the bill.** The agent holds the block it
last served and counts `changes` (turns whose block differed) against `renders` (turns that served one). The ratio
is the share of turns that can invalidate a prefix, and it is now asserted **before** the paired reading in
`working-memory.yml` — a run whose block changed on more than a third of its turns fails, whatever its accuracy,
because it is not the arm the registration describes.

One consequence worth naming for anyone reusing this: **the contract is a dependency on the first user turn being
the request.** τ² guarantees it; a chat product does not, because a user can open with "hi" and state the task
four turns later. The portable form is a contract that is sealed by the first turn that yields an ask rather than
by the first turn, and a board that says so when it has nothing to say. That variant is not registered here and
this round does not measure it.

### 17.182 The replay, and why a parser change must be priced before it is dispatched

Every result document carries the messages of every episode, so a parser can be run over an arm that already ran.
`goal_board.replay(document)` does exactly that and returns the readings the live arm returns, per episode:

| field | what it answers |
|---|---|
| `writing` / `ticked` / `tickShare` | did the agent's writes connect to what was asked — the attribution bar's own population |
| `asks` / `settled` | how much of the contract ever closed |
| `loose` | how many settlements came from the weaker of the two grades |
| `absorbed` | calls a set ask took in |
| `unrequested` | calls of a family the contract never stated — the checker's output, not a parser defect |
| `unattributed` | calls of an asked family the board could not name — the parser's blind spot |
| `skipped` | episodes with no messages, excluded rather than counted as unticked |

Three design rules make it trustworthy. **The denominator is episodes, not turns**, because the registered bar is
written over episodes and a per-turn rate answers a different question. **An episode with no messages is skipped**,
because a document truncated mid-grid would otherwise report a rate over episodes that never ran. **An episode with
no state-changing call is not in the denominator**, because a read tool cannot satisfy an ask.

The instrument's first use was to overturn the round that built it: R216 was registered on a set rule, and the
replay says that rule is worth two settlements in a hundred and seven episodes (AUDIT 34.227). Its second use is the
workflow's attribution gate, which now runs `--replay` on the arm's own artefact before the paired reading — the
same measurement the registration was priced on, applied to the thing the registration was about.

**What it cannot do.** It re-parses an arm that ran under the previous parser, so it predicts a *mechanism* and not a
*result*: the live board shows ticks the replayed one never showed, and a model that sees them may act differently.
It also cannot separate a correct loose tick from a wrong one, because it has no ground truth beyond the receipts
themselves — which is why `loose` is a count and not a filter.

### 17.183 Settlement grades: why two, and where the boundary is

| grade | rule | where it came from |
|---|---|---|
| `name` | one word set inside the other | the only grade R214/R215 had; every tick in both readings |
| `overlap` | ≥ 1 shared content word **and** ≥ ½ of the shorter side | 28 of R215's refusals were one word short |

The threshold is a measurement and not a taste: `boots ordered specifically` against **Hiking Boots** is 1 of 2;
`watch received` against **Smart Watch** is 1 of 2; `gaming related purchased` against **Gaming Mouse** is 1 of 3.
A quarter would tick a lamp for a lamp, and containment (1.0) is the grade that missed all of them. The boundary is
therefore *the shorter side*, not the ask's length, because the two sides abbreviate independently: a user says "the
keyboard" about a **Mechanical Keyboard**, and a user says "the mechanical keyboard" about a product the catalogue
calls **Keyboard**.

The refusals that survive are the ones the board exists for — a receipt of the right family that names a *different*
product by every word it has. The cost is stated: "Desk Lamp" against "Table Lamp" now ticks, and the round that
separates a correct loose tick from a wrong one is a round that reports accuracy by grade. That round is not
registered, and `loose` is what would justify it.

### 17.184 The family rule's catalogue guard

An ask that names no product is settled by the first successful call of its family. The naive form of that rule is a
bug, and the bug is measurable: with an **empty** name table every ask "names no product", so the board ticks
"cancel the pending order for the lamp" on the strength of any cancel. The guard is one line and it is the whole
safety of the rule: **an ask with words is only judged nameless when the episode has read at least one product
name.** A wordless ask needs no guard, because there is nothing to look for.

Under the guard the shapes that arrive are all of one kind — order-level ("cancel the order"), set ("return
everything from my two most recent orders"), and **account-level** ("the address is wrong", "split the payment
between two cards"), where the receipt carries no item id and a name match is meaningless. The account families are
most of R215's `unattributed` residue: 53 calls the board could not connect, of which 18 survive this round.

### 17.185 The submission contract: three properties, one row

A leaderboard row is a claim, and a claim is only readable with three properties attached: the **metric** (which
`k`), the **domain** (which population) and the **attempts** (how many draws the number was computed over). The
schema the board publishes has a slot for the first and the second and none for the third, which is why the third is
the one this project got wrong.

The contract `eval/tools/submission.py` implements:

| property | where it comes from | what it refuses |
|---|---|---|
| metric | the grid, `pass_k(grid, k)` | placing a row on a `k` the grid cannot support |
| domain | `info.environment_info.domain_name` | a domain outside the four the schema names |
| attempts | the number of distinct `trial` values per task | a duplicate `(task, trial)`, in one arm or across arms |
| bill | the mean of `agent_cost + user_cost` | a partial bill (absent, not cheap) |
| scaffold | `info.agent_info.implementation` | `standard` from an artefact that did not run the stock agent |

Three shapes of reading follow, and the difference between them is the whole of R218a:

```
pass^1, one attempt   accuracy, resolution ±3.2 pp at n=114        placeable
pass^4, four attempts reliability, "all four survived"             placeable only if four were run
avg@4, four attempts  accuracy, estimated more precisely           comparable to pass^1, not to pass^4
```

`pass^k` is computed per task and then averaged, and **a task with fewer than k attempts leaves the denominator**.
That rule is not a convenience: filling it with a zero computes "reliably fails" for a task that was never tried
twice, which is the same defect as averaging an unmeasured arm into a rate — the rule `packages/eval/src/l4.ts`
implements on the TypeScript side and `note_pilot.py` on the driver side.

### 17.186 Why the snapshot is a file and not a fetch

The board moves. COMPETITIVE records a leaderboard read on 2026-11-01 and again on 2026-10-29 where the top moved by
0.45 pp in three days; a figure that re-fetches at render time is a figure whose numbers nobody can check against the
sentence that quotes them.

So the reading is an artefact: `eval/manifests/tau2-board-1x-2026-11-25.json`, carrying the source URL, the commit
(`768f3d8f`), the read date and 46 submissions with their results, verification flags, user simulators and notes.
Everything downstream — the position table, the figure, the census — reads that file, so a number in a document is
re-derivable from a file in the repository, and a re-read is a diff rather than an argument.

The cost of that choice is one stale snapshot between reads, and the mitigation is the `read_on` field: every
quotation names it, and `--census` prints it back.
### 17.187 The probe's input is an episode with a history, not a static prompt shape

`placementPromptFor(placement, input)` used to take a policy, a block and the turns so far, and return the messages
one placement would send. That is enough to price a block's *position* and not enough to price a block's *life*, and
the difference is exactly the number R216b measured. Two fields were added to `PlacementPromptInput`, both optional
and both defaulting to the previous behaviour, so every committed reading is reproducible from the same file:

| field | meaning | default | why it exists |
|---|---|---|---|
| `writtenOnCall` | the 1-based call the block was written on | `1` | a `tail` block sits where it stood on that call; later turns append **after** it. Re-sending it at the end of every call would price a message order the arm never sends |
| `revision` | `{ fromCall, block }` — a new body from that call on | absent | held still, every placement's bill is the control's plus one write; the difference between in-front and behind lives in what a *change* re-bills |

Three invariants are enforced in the builder rather than documented beside it, because each one is a wrong
measurement rather than a style preference:

- **a call before the write carries no block**, for every placement. One rule, not a per-shape special case: the
  block did not exist yet, whichever position it was later given.
- **a revision before the write is refused.** A "revision" of a block that has not been written is a second write,
  and a probe that priced it as one change would report a move that never happened.
- **`first-turn` with a write on call 2 or later is refused.** That placement attaches the block to the task
  statement, so its write is call 1 by construction; a late write has no position in it. Removing this made the
  branch on `present` inside `first-turn` unreachable — it is now a comment, not a branch, which is what the coverage
  gate asked for.

`tail` was **appended** to `PACK_PLACEMENTS`, and the reason is the seed: the probe gives each shape its own policy
text seeded by index (`3 + index * 1000`) so that one shape's calls cannot warm another's prefix. Inserting `tail`
after `system-merged` would have re-seeded `first-turn` and made a committed reading unreproducible.

The reading is `movePrice(ledger, call) = uncachedSeries[call - 1] - steadyUncached`. The denominator is the ledger's
own median rather than a caller-supplied constant: a constant is the caller's model of the shape, the median is the
shape's own bill, and the two disagree precisely when the shape is behaving unusually — which is when the number
matters.

### 17.188 A placement is a statement over a population, and the population is four coordinates

`position(ours, board, metric, domain)` became `position(ours, board, metric, domain, version, text_only)`, and the
reading gained a `population` block. The rule behind it: a rank is a statement about **(metric, domain, benchmark
version, modality)** and a number missing any one of them will eventually be compared to the wrong row. The board's
own retail column confirms it — 48 rows, nine spellings of the version field, 21 voice submissions, 26 that declare
no modality.

`scope(entries, version, text_only)` returns the kept rows **and what it dropped**, counted per axis, and the counts
are printed with every placement (`N of M row(s); dropped 58 by version, 6 by modality, 0 kept row(s) declare none`).
A scope that shrinks a denominator silently is the mechanism by which "2nd of 26" survived on a board of 72.

Two refusals rather than two warnings:

- **`unknown-board`** — a name that is neither in `BOARDS` nor an existing file. The message names the boards that do
  exist, because the failure mode of a path-shaped flag is an `ENOENT` from three frames down.
- **`wrong-version`** — the artefact's own `methodology.tau2_bench_version` disagrees with the scope. A `pass^1`
  measured on 1.0.1 placed against 0.1.3 rows is the same defect as a three-domain mean in a retail cell: the number
  is real and the comparison is not.

`ingest(raw)` is the fold from a directory read to a snapshot, and its contract is that **absent stays absent**. A row
that declares no modality keeps `modality: None`; the scope counts undeclared rows separately. A default here would
answer the question the scope is asking, and the count — 26 of 48 — is one of the facts this round publishes.

### 17.189 An interleave is a schedule, a process boundary and a verdict, in that order

R218c's driver is three decisions and each one is forced by the refutation it has to be able to state.

**The schedule.** `plan(tasks, chunk=8)` emits one entry per (block, arm), ordered block-major: `a.00, b.00, a.01,
b.01, …`. Block-major rather than arm-major is the round — arm-major is R218b's grid, where the two readings of a
task sit thirty-five minutes apart — and eight rather than one is the compromise between the gap and thirty process
starts. The gap is not assumed: `gaps(entries)` subtracts one arm's `endedAt` from the other's `startedAt` per block
and reports median and worst, so a block size that buys a gap nobody looked at is visible in the reading.

**The process boundary.** One `run_split.py` child per (block, arm). The alternative — both arms inside one
`run_tasks` call — is cheaper, and it cannot answer the question: two arms in one interpreter share the provider
client and the `litellm` success callback that counts this lane's tokens, so their bills and their latencies are one
object's, and the preregistration names "a delta of exactly zero on every task" as the state that proves it. The
boundary buys three things a shared process cannot: a bill per arm that is a sum of per-invocation bills, a wall
clock per part that measures the confound, and a round that resumes after a transient failure without re-buying the
parts already on disk (`--resume`, per part, checked against the plan's own task list so a part left by another grid
is re-run rather than trusted).

**The verdict.** Six states, ordered so that the sentence names the most fundamental failure first:

```
UNPAIRED          tasks or arms do not cover the same grid — nothing is paired
SHARED_PROCESS    moved + broke == 0 — the instrument measured an import
GRID_ORDERED      |delta| > 5 pp — the order is inside every contrast this grid has measured
ORDER_ASYMMETRIC  |moved - broke| > 2 — the second reading inherited something
BILL_DRIFT        |bill_b / bill_a - 1| > 10% — the halves ran under different conditions
PLACEBO_HELD      every endpoint held
```

The registered `p > 0.05` bar has **no branch**, and that is a proof rather than an omission: with `|moved − broke| ≤
2` the exact McNemar p is at least 0.5 (2 against 0 is the tightest split the symmetry bar admits, and its p is 0.5),
so the symmetry bar implies the significance bar. The p is printed beside the counts so a reader quoting it can see
what the symmetry bar stands in for.

Two smaller decisions the file records because they are the kind that get reversed by accident:

- **the arm labels are `control-a` and `control-b`, and the code is identical.** The label is the whole difference,
  which is the point; a reader who sees one arm "doing better" is looking at the provider's afternoon.
- **the workflow gates the instrument and prints the prediction.** An unpaired arm, a grid under a hundred episodes,
  fewer than ten measured blocks, or arms that never disagree fail the build. `GRID_ORDERED`,
  `ORDER_ASYMMETRIC` and `BILL_DRIFT` are `::warning`s and are read into the round's record by hand, because a red
  job for a refuted prediction teaches an operator to rerun until the grid is green.

### 17.190 A dose reader has to be able to say that it cannot see the dose

`board_dose.py` asks whether an attempt that received more material passed more often than its own task's attempts
that received less. The pairing is the design: within one task the domain, the opening, the seeded world and the
difficulty are held fixed by construction, which is a decomposition a two-arm grid cannot make.

The first reading is `NO_DOSE` on **both** arms of R218b — 456 episodes each, four attempts at 114 tasks — including
the treated arm whose log counts 4,341 renders at 146.3 characters a render. The cause is a property of the harness
rather than of the reader: a front-placement block goes into `state.system_messages`, which is composed into the
request, and τ² persists the conversation. `grep -c microglia-board` over 32 MB of the treated document is **0**.

Two candidate repairs, and the second is written down because it is the one that produces a plausible number:

| repair | what it yields | why it is or is not shipped |
|---|---|---|
| read the block's tag | the exact dose, on an arm whose placement puts the block in the transcript (`tail`) | shipped — the product ships `tail`, so the instrument has an arm to read |
| reconstruct the block from each turn's prefix | 7,813 boundaries against 4,341 renders; 121.0 characters a boundary against 146.3 a render | **not shipped**: the ordering it produces is turn count, and a retail episode fails *because* it ran long — a sign test on it would report "more material, fewer passes" and it would be a finding about episode length |

The consequence is a registration rather than a patch: **R218e** has the arm write one JSONL line an episode —
`turns`, `renders`, `chars`, `changes`, the verdict — where the dose is known, and the reader gains a `--sidecar` that
checks the recording against the transcript it accompanies. Until that lands, the honest answer on every arm whose
transcript carries no block is `NO_DOSE`, and saying so is the instrument working.

### 17.191 Admission is a separate decision from content, and it is the one that was never designed

Eleven rounds of this lane changed what the memory block **said**: the ask source (R215, 10.6 asks a turn → 1.96), the
settlement grades (R216, 2 of 107 episodes ticked → 75.5%), the placement (R216b, −4% and no accuracy cost). None of
them changed **whether the block was admitted**, and the harm that survived all of them turns out to live there.

The block has four kinds of line and they are not the same kind of object:

| line | the claim | the ground truth it can be checked against | measured error |
|---|---|---|---|
| `[x] return: lamp` | a receipt named this ask | the tool result the episode carries | none: it is the receipt |
| `[ ] exchange: keyboard` | no receipt names it yet | the same transcript | none: it is the transcript |
| `Not asked for by the request: N call(s)` | the agent changed state nobody asked for | **the evaluator's action list** | **88.8% false** |
| `Not attributed to any ask: N call(s)` | the parser could not name what a call touched | the same list | **98.1% false** |

The first two are *state*, computable from the conversation and checkable against it. The last two are *judgment*: a
statement about the request made by a closed cue list, over ground truth the block never reads. Nine tenths of those
statements are wrong about the task (1,808 of 1,965 entries over 456 paid episodes), and the line written to be honest
about the parser's blind spot is the least honest line in the block — because "the parser could not name it" and
"nobody asked for it" are different facts and the render made them one sentence.

**The design rule, stated once and applied at the renderer:**

> A memory may state what the conversation supports. It may not annotate what it cannot name.

That is `render(board, state_only=True)`, and the reason it is a rendering switch rather than a second renderer is the
same reason `placement` is one variable: two switches for one arm produce a third treatment nobody registered. The
admission rides `MICROGLIA_BOARD`, the phase census records `board.admission`, and `serving-defaults.json` will carry
`admissionPolicy` beside `placement` once R219b confirms the effect — one artefact, two readers, one test per
repository, exactly as the placement is bound.

**Why this is a design principle and not a bug fix.** The same shape recurs at three other layers of this system, and
the principle reads the same at each:

| layer | the annotation that outran its evidence | the state form that replaced it |
|---|---|---|
| the block's refusals | "not asked for by the request" | silence, plus the receipts the transcript already carries |
| the round registry | a bar written against a control arm the dispatch did not run (R219) | the within-dispatch paired contrast, and a replication before the default moves |
| the leaderboard row | a `pass^1` with no resolution, no noise floor, no degradation count | `submission.py --position`, which prints the population and refuses a mismatched version |
| the workflow's reading step | an arm named in the reader (`front.json`) rather than looked for | a branch that looks for `policy.json`, because a reader that names an arm dies after the money is spent |

Each row is the same defect at a different altitude: **a claim that is cheap to make and expensive to check, replaced by
one that is expensive to make and cheap to check.** That is the whole architecture of this project in one sentence, and
R219 is the round where it finally reached the memory itself rather than the reporting around it.

## 17.193 — The dose channel: one record an episode, one join in the runner, one identity in the census

The question R218e exists to answer is inside a single task: **did the attempt that received more memory material pass
more often than its sibling that received less?** Every reading this lane has produced is a mean over arms, and a mean
cannot separate "the material is inert" from "the material helps on the episodes that receive it and the average is
over a population where it rarely applies". The within-task comparison can, and it needs a quantity no artefact in this
tree carries: how much block a given episode was served.

### Why the transcript cannot be the instrument

τ²'s `results.json` holds the **conversation** — `assistant`, `user`, `tool` — and no `system` message at all. Four
documents on disk, two placements, 456 paid episodes, zero occurrences of the block's tag (AUDIT 34.262). The block is
composed into the request and the request is not saved, so no reader built on the transcript could recover a dose, at
either placement.

### The three parts

```
microglia_agent                        run_split                         dose.py                 board_dose.py
───────────────                        ─────────                         ───────                 ─────────────
_open_episode(text)   ──┐
  ├ episodeStarts       │  one site,    ┌─ snapshot len() after each round ─┐
  ├ injectedEpisodes    ├─ three lists ─┤                                    │
  ├ boundaryTasks       │  one order    └─ boundary_task_ids: text → task ──┤
  └ boardDoses          ┘                                                   │
board_for: turns, renders, chars, changes, stable                            │
serve_tail / front: written                     rows(records, tasks, marks, rounds)
                                                  → refused | identity + rows
                                                  → <out>.dose.jsonl
                                                                             │
                                              census.diagnostics.dose = {agreesRenders, agreesChars, ...}
                                                                             │
                                                          --document X --sidecar X.dose.jsonl → DOSE_READ
```

**One append site.** `_open_episode(text)` is the only place the three boundary lists grow, so
`len(doses) == len(boundaryTexts) == len(episodeStarts)` is a property of one function. The first attempt at this fold
left a second call site appending, and the agent's suite caught it in a minute (AUDIT 34.264).

**Two numbers, and the difference is the placement.** `chars` sums the block **served** over renders; `written` sums
the block **carried** into the prompt. They are equal on the front placement, which replaces the block every turn, and
unequal on the tail, which holds an unchanged block where it was written. `written / chars` is therefore the
placement's price as a ratio — **below one on the tail and above one at the front**, where every render is written and
each write adds the 37-character element. The inequality is stated per placement for that reason: "carried ≤ served"
is false on the placement this project ran for eleven rounds before R216 (AUDIT 34.265).

**The round is the attempt index.** `--rounds k` is k `run_tasks` calls with `trials=1`, so each round contains each
task once and `merge_rounds` writes the round as `trial`. The runner snapshots the recording's length after each round
and the join inside a round is 1:1 by task. The alternative — a turn-count key — was refuted on R219b's document
(1,171 agent calls against 1,274 assistant messages; AUDIT 34.263).

**Three refusals and one report.** `dose.rows` refuses a slice of the wrong length, a task twice in one round with no
way to tell the attempts apart, and a record whose task the round did not run. It *reports* the concurrent case
(`--trials k` in one round) with `trial: null` and `identity: "unordered"`, because the counts remain exact where the
pairing does not.

### What the reader does with it

`board_dose.py --sidecar` joins rows to rewards by `(task, trial)`, drops a row it cannot attach, and reports the drops
as `coverage`. It then answers one of four states, and each sends a reader somewhere different:

| state | means | where it sends you |
|---|---|---|
| `NO_SYSTEM` | the document holds no system message at all | the instrument: this artefact cannot hold a dose |
| `NO_DOSE` | the recording arrived and carried no characters | the renderer, or the population |
| `NO_PAIRS` | doses were served and no task split into two | the premise: the material does not vary inside a task |
| `DOSE_READ` | a within-task sign test with its turn-count confound printed beside it | the reading |

The confound is stated rather than removed: dose is endogenous, a longer episode both receives more blocks and has
more chances to go wrong, so the reading is a decomposition of one arm's episodes and not a randomised contrast. The
number that decides whether it is worth a registered round is the **sign** of the effect on the pairs whose doses
differ while their turn counts are close — and that subset is a computed column, not a sentence: `closeTurnPairs`, its
pass counts, its own exact sign test and its tie count, drawn at `CLOSE_TURN_TOLERANCE = 1` turn of mean side length.
The tolerance is measured rather than preferred: over R218b's four-attempt arm (684 within-task pairs) the within-task
length gap has median 1 and mean 1.57, with 27.3% of pairs tied and 60.2% within one turn. On a 114 × 2 grid that
implies ≈ 20 discordant pairs in total and ≈ 12 in the decided subset, which is why the round's power is 0.4 against a
80/20 shift there and 0.8 against 90/10 (R218e, amendment 2) — a verdict on a large effect and a bound otherwise.

### Cost and gates

| item | value |
|---|---|
| grid | 114 tasks × 2 rounds = 228 episodes |
| bill | **$1.10 ≈ ¥8.0** at $0.0048 an episode |
| wall clock | ~45 min at concurrency 3 |
| gates on every push | `dose.py` and `board_dose.py` self-tests under the 95% floor (`--expect-files 18`) |
| gates on the dispatch | the raw recording exists and holds one line a scoring episode (`≥ 200`); the join did not refuse and `rows == counts.joined`; `missing + unresolved ≤ 10%` of the grid; `agreesRenders/Chars/Changes`; the placement is `tail` and `written ≤ chars` there, with `written > 0`; the reading carries `closeTurnPairs ≤ pairs` at tolerance 1; every row met its episode (`unscored == 0`, `unordered == 0`) |
| printed, not gated | `DOSE_READ` versus `NO_PAIRS`, and the decided subset's size against the registered floor of ten, because a refuted prediction or a grid whose attempts differed in length is a finding — a red job teaches an operator to rerun until it is green |

## 17.194 — The serving decision as an estimator: two conditional columns, a split, and a multiplicity floor

17.191 established that admission is a separate decision from content and that it was never designed. This section is
the design of the instrument that decides whether a candidate admission rule is worth money, and it is written around
one constraint: **a serving decision is taken before the episode's outcome exists**, so the only admissible inputs are
prefix observables, and the only way to price one without a new dispatch is a replay over a grid that already holds
both arms.

### The estimator

For pair `i` — one (task, attempt) joined across the control and treated arms of the same dispatch — let `y_c` and
`y_t` be the pass flags and let `x` be the episode's prefix. A policy `π` maps `x` to serve or skip, and

```
V(π) = (1/n) Σ_i [ π(x_i)·y_t,i + (1 − π(x_i))·y_c,i ]
```

Two differences follow and they are the whole design, because each is a **conditional** mean over a subset:

| column | definition | what a bad value means |
|---|---|---|
| `skipDelta` | mean over skipped pairs of `y_c − y_t` | the material was worth serving to the very episodes the policy refuses |
| `serveDelta` | mean over served pairs of `y_t − y_c` | the policy refuses well and serves at a loss, which is worse than refusing everything |

Each carries its own two-sided exact sign test over the pairs that disagreed, and the pair counts are reported beside
the p-values because a unanimous test over four pairs is p = 0.125. `V(π) − V(serve all) = skipShare × skipDelta` and
`V(π) − V(serve none) = serveShare × serveDelta`; both are printed so a policy cannot look better merely by skipping
more.

The assumption is stated rather than hidden: attempt `i` of the control is the counterfactual for attempt `i` of the
treated arm. No dispatch in this lane randomises a dose, so this is the strongest pairing the artefacts support and not
a causal effect. What it licenses is a **screen** — refusing a proxy that cannot show a positive `skipDelta` on the half
it was chosen from — and a screen is what keeps a ¥9 dispatch from being spent on a hypothesis that costs nothing to
kill.

### The split, and why the screen alone is not a result

Hundreds of cuts over one grid will always contain one that looks good. The instrument therefore splits the **tasks**
deterministically (parity of position in sorted order, so the split is reproducible from the artefact), chooses on one
half, and re-evaluates the same predicate on the other. `CONFIRMED` requires, on the held-out half: a positive
`skipDelta`, a p below 0.05 in the same direction, and at least six discordant pairs — six being the smallest count at
which a unanimous sign test clears 0.05 (`2·2⁻⁶ = 0.031`). The pooled row is printed and is in-sample by construction.

### The verdict ladder

The ladder refuses before it tests, in a fixed order, because the order is the specification:

| rung | condition | what it prevents |
|---|---|---|
| `DEGENERATE` | serves nothing | a policy with no serve half reported as if it had compared one |
| `NO_SEPARATION` | serves more than 90% of the grid | a restatement of "always" being tested as if it were a decision |
| `UNDERPOWERED` | fewer than ten discordant pairs on the skip side | a small effect promoted on arithmetic that cannot distinguish it from noise |
| `DOMINATED` | skips, but not profitably, or serves at a loss | the common case, named so it cannot be quoted as a near-miss |
| `ADMISSIBLE` | positive skip effect, p below 0.05, serve half not negative | — |

The 90% gate is a measurement rather than a preference: the ask-count proxy fires on 96.5% of the grid, and at an 80%
gate a 15%-skip cut would be refused for the wrong reason. The ladder has no rung for "skips less than 5%" because a 5%
skip is a 95% serve, which the share gate has already refused — a dead rung would be a false statement about the input
space (AUDIT 34.307).

### The multiplicity floor, which is the part no competitor prints

A screen of `m` cuts at a two-sided 5% test yields about `0.025·m` positive-and-significant results from noise alone.
The instrument prints that number beside its yield, and the comparison is the reading: a family that produces **fewer**
admissible cuts than chance has no signal, and its one survivor is a selection rather than an effect. On R218b this
read 385 cuts, 1 admissible, 9.6 expected — a refutation in one line (PROGRESS 249.22). A screen quoted without its
multiplicity is a p-hack with a table.

### Gates

| item | value |
|---|---|
| code | `eval/tools/serve_policy.py` |
| self-test | 97 checks, every verdict, both confirmation outcomes, every refusal |
| coverage | 99% of 453 statements and 124 branches; the only uncovered arc is the `__main__` guard's false side |
| CI | measured on every push under the same 95% floor as the rest of the Python lane (`--expect-files 21`) |
| cost | ¥0 — it reads documents already on disk |
| registration | `prereg/R223-serve.md`; the successor round is deliberately **not** registered until a proxy passes the screen |

## 17.195 — Resolution as a first-class quantity: the decomposition, the floor, and the admissibility test

17.194 designed the instrument that decides *whether* to serve an episode. This section designs the one that decides
*whether a round can answer its own question*, and it exists because the queue was audited for correctness and never
for resolvability (AUDIT 34.312).

### The quantity

For a paired grid, let `d_i` be the difference of the two arms' pass rates on task `i`, averaged over `m` attempts.
The standard error of the mean difference is `sd(d)/√N`, and `sd(d)` depends on `m` in a way that splits cleanly:

```
var(m) = a/m + b
       ↑      ↑
       |      └── task-to-task heterogeneity: the tasks themselves disagree, and no attempt count averages them away
       └───────── measurement: two arms of m attempts estimate the same task imperfectly, and averaging helps
```

The smallest effect resolvable at 80% power and a two-sided 5% test is `2.802·√var(m)/√N`. As `m → ∞` the first term
vanishes and the quantity converges to `2.802·√b/√N` — **the floor**. It is a function of `N` alone, so a domain with a
fixed task count has a fixed floor, and no budget crosses it.

### Why two rungs and not a regression

The ladder's rungs are nested prefixes of the same grid: attempts 1..2 are a subset of attempts 1..4, so their errors
are correlated and a least-squares fit over all rungs would report an uncertainty that the data cannot support. Two
points determine the two parameters, and the two points chosen are the extremes — attempt 1, where the measurement term
is largest, and the deepest rung the grid ran, where it is smallest. A fit from the extremes is the most conservative
pair available and it uses every observation the grid holds.

### The clipping rule, and what a negative `a` means

If the spread does not fall as attempts rise, the fitted `a` is negative, which is not a small measurement error but a
statement that the decomposition does not describe this grid: the arms can drift apart faster than averaging pulls them
together, and when they do, more attempts buy nothing at all. The fit is then **clipped** with `a = 0` and the floor
set to the observed spread at one attempt, and the reading carries `clipped` so a table prints the fit's status beside
its numbers. A negative variance is not a variance, and a floor below zero would license any claim.

A second clipping covers the opposite edge: when the fitted intercept lands below zero because the top rung is nearly
at the floor, all of the spread is called measurement and the floor is zero. Both clips are named in the output rather
than silently applied.

### The admissibility test, which is the point of the file

A funded round now carries two numbers:

| number | where it comes from | computed by |
|---|---|---|
| **smallest resolvable effect** | the grid's task count and its fitted spread | `resolution.py` |
| **largest effect the mechanism can produce** | the mechanism's own ceiling, from the harm stratification | hand, from a measured stratum table |

A round is admissible only when the second exceeds the first. R224 failed at +2.11 against 3.21 and was cancelled
before any money moved; R222 cleared 4.8 against 3.21 but only at 10.95 attempts a task, 85% above its registered
price, and was cancelled for the price rather than for the ceiling.

The test is deliberately asymmetric: the ceiling is an **upper bound** computed by crediting the mechanism every task
it could reach and the full size of the strongest published result, so failing it means the round cannot succeed even
under assumptions chosen to favour it.

### What the floor changes about the leaderboard

Two rows of a leaderboard that differ by less than the floor are not ordered. Applying 3.21 points to the board's
retail column puts all six text rows — 83.90 to 86.20 — inside one band, which converts a ranking into a tie and
retires the "0.23 pp behind the strongest text row" framing permanently. The correct statement is not that this
project is close to the leader; it is that **the leader's margin over this project, and over the sixth row, is smaller
than one grid can see**. A board that does not print its resolution invites the opposite reading, which is why the
column is worth publishing even though it is not a score.

### Gates

| item | value |
|---|---|
| code | `eval/tools/resolution.py` |
| self-test | 57 checks: both clips, the unreachable case, the design-effect scaling, a ragged grid, the failing assertion path |
| coverage | 99% of 283 statements and 70 branches; the only uncovered arc is the `__main__` guard's false side |
| CI | under the same 95% floor as the rest of the Python lane (`--expect-files 22`) |
| cost | ¥0 — it reads a grid already on disk |
| outputs | `wall`, `ladder`, `fit`, `priced`, and a sentence that states the floor before any price |

## 17.196 — The reveal channel: where the prefix ends, how a payload is read, and what a yield is worth

R223 closed every observable a **request** declares and named its successor: read what the episode **reveals**. This
section is the design of that channel — five decisions, each of which would have been a plausible defect in any of its
four alternatives.

**1. The boundary is the reveal's result, not the reveal's call.** The previous reader stopped at the first call
outside the authentication family, on the argument that everything after it is the trajectory a policy acts before.
That argument is correct for a policy timed at the *request* and wrong for one timed at the *write*, and the write is
where the shipped invocation policy serves (R219). The prefix therefore ends **after** the reveal call's own result
message and before anything else.

The property is pinned by two assertions rather than one, because a single truncation test cannot tell a metric that
reads the payload from one that ignores it:

```python
after_reveal = {"messages": full["messages"][:5]}    # ends just after the payload
before_reveal = {"messages": full["messages"][:4]}   # ends just before it
observables(full) == observables(after_reveal)       # reads the payload, nothing later
observables(before_reveal)["revealShape"] == "none"   # no payload is a state, not a zero
```

`none` is load-bearing: an episode that spent its budget on authentication cannot be gated by what it never showed,
and defaulting it to the smallest possible record would put an unmeasured decision into the policy's value — the same
refusal `observables()` already makes for a missing transcript.

**2. Results are bound to calls positionally, and the position is the reveal's.** The recorder writes a `role: tool`
message per result and no call ids, so a message carrying k calls is answered by the next k tool messages in order.
A turn that authenticates **and** asks for the order is the case that matters: the reveal is the second call, so it is
owed the second result, and a reader that took "the next tool message" would price the reveal as the user id. The
implementation keeps a queue of `(message_index, position)` keys and pops one per tool message, so a turn that leaves a
call unanswered releases the slot rather than binding the next turn's result to it — the one failure mode a positional
pairing can have, and it has its own assertion.

**3. The payload is read into six quantities, declared before the screen.** `revealShape` (categorical), then
`revealChars`, `revealKeys`, `revealEntries`, `revealLeaves`, `revealOptions`. Each has a mechanism sentence and none
was added after an outcome was seen; the declaration is what makes `expectedByChance` a measurement rather than a
decoration. Two structural choices inside the reader:

- **Leaves are counted to a ceiling** (400) rather than to exhaustion. A pathological payload would otherwise turn a
  screen into a walk, and the ceiling is above the largest order in the grid.
- **`revealOptions` counts keys under every `options` mapping**, recursively, and stops at the same ceiling: the retail
  catalogue keeps a product's variants there, so this is the breadth of the *choice* rather than of the record — the
  field the harm hypothesis actually asks about.

Free text is `unparsable` **and** carries its length. An agent that answered in prose revealed something of the same
size and of no structure, and reporting both is the honest pair.

**4. A yield is a binomial, and the sentence carries its tail.** `excess` computes the standard deviation of
`cuts × 0.025` and reports `z` and `p`. The cuts are not independent — thresholds a few units apart name nearly the
same subset — so the true number of trials is smaller than `cuts` and the binomial treats the family as more
multiplied than it is. That errs in the direction of making a claim harder, which is the only direction a screen may
err in.

**5. The positive control is part of the instrument.** A reader that silently saw no payload would return
`NOTHING_ADMISSIBLE` for ever, and every subsequent round would inherit a permanent negative that could not be
falsified. The suite therefore carries a 48-task fixture whose damage is carried by the item count alone — with both
payloads padded to equal length and given equal keys, so `revealChars` and `revealKeys` cannot win and the structural
reader is what is actually tested. It confirms at `z = +1.76`. Without it, a `NOT_CONFIRMED` from this module would be
indistinguishable from an outage; with it, the negative is a result.

**What the design produced.** 565 cuts, 18 admissible against 14.1 from noise, and a chosen cut that reverses sign on
the half it never saw (−6.5 pp, p = 0.33). The reveal is 89–93% task-constant for the structural fields, so the channel
is an admission rule too — and admission rules were what R223 refuted. The design's value is not that it found a gate;
it is that the gate family is now closed **with** a positive control behind the closure.

## 17.197 — Record recall: measuring whether a request names the state its write touches

**The question the design had to answer first.** R217a's successor was a contract, not a code path: an item settles a
receipt that touches the record the ask names, whatever family the receipt is in. A contract about naming needs a
measure of naming, and the measure decides the round before the round is dispatched. This section is that instrument.

**Why the ground truth is state.** Every earlier census in this lane read a *call name*: the evaluator's list of
required writes, tokenised into families. A record rule cannot be graded on a call name — the point of the rule is
that the family is irrelevant — so the instrument reads the domain's database. `scripts/build_airline_records.py`
projects `db.json` (7,042,725 bytes, sha256 `1af9fea6…`, 2000 reservations) down to the 27 users the 50 graded tasks
belong to, keeping for each reservation exactly the fields a read returns: code, route, cabin, flight type, legs
(number, both ends, date), passengers, baggage count, insurance. The projection writes its source's digest beside the
table, so a claim about a record is recomputable from the bytes it was made from.

**The three grades, declared before the reading.**

| grade | test | why it is a grade and not the rule |
|---|---|---|
| `id` | the record's code appears in the request | strongest and rarest: the corpus codes a record in 7 of 50 writes |
| `unique` | a token appears that exactly one of the user's records carries | identifies the record among the ones the user owns, which is the strongest claim a token can make |
| `pair` | at least two identity tokens appear | a route is two ends, a leg is a flight and a date; one token of either is not identifying |

`pair` is the bar's column. It is the most generous rule the contract could ship, so a failure there is a failure of
the contract rather than of the threshold.

**Four decisions that could have been fitted to the answer, and were not.**

1. **Identity excludes cabin and flight type.** They are in the record and a request can ask to change them; counting
   them matches `economy` to `economy` and raises recall. Baggage count and insurance are excluded for the same reason.
2. **Airports expand to cities.** The database stores `JFK` and users say New York; the map travels in the manifest
   because it is part of the projection from the domain, and a second copy in the tool would drift from it.
3. **Dates are normalised on both sides.** `words_of` drops numbers — deliberately, because a number names a record and
   not a thing — so `2024-05-20` is reconstructed from "May 20", "20 May" and "May 20th" before tokenising. This raises
   recall and is the only repair that lets a date count at all.
4. **A booking is measured on its itinerary.** A `book_reservation` carries no `reservation_id`, because the record it
   touches does not exist yet; its arguments carry the legs, whose airports are resolved through the domain's flight
   table. Skipping those writes would report a miss of a rule that never applied to them.

All four can only raise the reading. With all four, the loosest grade reaches **27 of 50 (54.0%)** against a bar of
0.75, and 30 of 50 (60.0%) when the family rule the round retires is counted beside it.

**The output is a ladder and a list, not a rate.** The census prints `id`, `unique`, `pair`, `family` and `union`, and
then every write no rule reaches with its record, its identity-token count and whether the family would have found it.
That last list is what produced the round's actual finding — 13 of the 23 misses are predicate asks over sets, 6 are
policy-chosen bookings — and a tool that printed a single recall figure would have delivered a number without a cause.

**Two implementations of one allocation, and the check between them.** The family column has to be applied to *writes*
here and to *families* in `goal_board.census`, so the allocation rule ("one ask of a family settles one write of that
family") exists twice. Rather than trust the second, `record_census.py --family-found N` compares its own count with the
one the retail census produced over the same corpus and exits non-zero on a disagreement. CI runs it with `15`, which is
R217a's number; a later round that changes either implementation changes that line on purpose.

**Cost.** Zero, and that is the design constraint rather than a happy accident: the projection reads a file the domain
already publishes, the census reads the projection, and both run in the same suite as the rest of the lane's Python
drivers, under the same 95% floor.

## 17.198 — Four boards from one transcript, and the provenance that makes the comparison possible

**The question the design had to answer.** R227 refused the record anchor on a *corpus* property. The successor
proposes a rule that credits a write to a record the episode opened, and that rule's advantage is definitional, so the
instrument cannot be a recall figure. It has to be a **comparison of rules on one grid**, with the cost of each rule
measured in the same pass — which means the instrument has to be able to say, per episode and per call, *which* call
settled *which* item, under *each* rule.

**One pass over the transcript, in time order.** `eval/tools/read_anchor.py` walks the messages once and builds an event
list: `open` (a read that returned a record's contents or its identity), `listed` (a record merely named inside another
record's result), `lookup`, `nothing`, `unknown`, `write` (with its position in `goal_board.receipts_of`), and `result`.
The pass is in time order because the round's question is *when* a record became visible: a write to a record opened
two turns later is `unrequested` at the moment it happens, and a board that sorted by kind instead of by time would
credit it and hide the one failure the rule can produce.

**The three declarations that decide the reading, all made before it.**

1. **Records are orders and accounts, not products.** Products are read constantly and written never; making them items
   opens four items for a task that needs one, which is the open tax the round is measuring. Two kinds is what the
   domain has, and a third would be a tax nobody asked to measure.
2. **Two scopes, `strict` and `loose`.** `strict` is a read that returned the record's contents or its identity;
   `loose` adds every id *listed* inside another record. `get_user_details` returns the user's whole order list, so the
   difference between the scopes is exactly the listing rule and nothing else, and `strict` is the product-meaningful
   one. Both are reported, because a rule that only works under the generous scope is a rule about the scope.
3. **Discharge is one-to-one, on family *and* record.** A task that requires `cancel_pending_order` on `#W1` and an
   episode that cancels `#W1` twice has discharged one requirement and made one extra call. Matching by family alone
   would credit the second cancel to the first requirement and call the episode more complete than it is.

**Provenance, which `goal_board` had to grow.** The request board knew *which receipt* settled an ask by name only. A
comparison needs the **position** of the call — so `receipts_of` now carries the position of each call among all calls,
the raw arguments (because a record rule needs the key the identifier arrived under, and `ids` had already flattened
that away), and `board_of` publishes `credited`, the positions of every call it credited to some item. That is what
makes the request board's column and the read boards' column the same column.

**What the tool refuses.** A bar over nothing is not a pass: `_bar` returns `holds: False` with a reason when no
episode discharged a required write. A taxonomy that does not sum to the writes it explains fails `--check`. A saved
reading names the grid's sha256 and byte count, so a number in a document is traceable to the bytes it came from —
which is the class of defect the last three audit entries were.

**Cost.** Zero, and the whole reading takes 0.6 seconds over 456 episodes: the grid is an artefact a previous dispatch
already paid for, and both rules are read from it rather than dispatched against it. Three of the five anchors this
project has refused were refused this way.

### 17.192 Why the admission rule has to move inside the turn, and how it does

R230 priced the only admission rule that needs no vocabulary — read a later turn when the assistant's previous turn did
not ask a question — and it failed on the corpus for two reasons that are architectural rather than statistical (PROGRESS
249.43). The design consequence is a change of *scope* rather than a change of rule, and this section records the rule,
its interface, and the invariant that any future admission rule in this repository has to state.

**The rule.** The parser already has exactly one mechanism for turning a clause into an ask, and it is inheritance:

```python
for clause in CLAUSE.split(sentence):
    named = family_of(clause)      # the clause's own action cue, or ""
    if named:
        family = named             # …and the family carries forward within the sentence
    if family == "":
        continue                   # a clause with no family of its own and nothing to inherit is not an ask
    sentence_items.append({"family": family, "words": _object_words(clause, family), "clause": clause})
```

Inheritance exists for a reason a scope change must not undo: "the smart thermostat for one compatible with Google Home"
is an exchange whose second object has no verb. Inside an *answer*, the same mechanism is what manufactures asks out of
values — "yes, the purple one" inherits the exchange the agent had just proposed and becomes a second ask with the
answer's words, which is where R229's 4.9× item count comes from.

So R231 admits, from any turn after the contract's, **only the clauses that name their own family**:

    family_of(clause) or nothing      # no inheritance across the boundary into a later turn

and leaves the contract's turn read as a whole, inheritance and all.

**The interface.** One more value of the `scope` argument that already exists — `ask_board(entry, messages, scope)` with
`scope in ("request", "conversation", "admitted", "clause")` — and one more row in the reading's board table. No new
tool, no new manifest, no new subcommand: a round that changes the content of a board must be readable on the same grid
as the boards it is compared with, or the comparison becomes a comparison of instruments.

**The invariant.** R230's reading produced a rule for every future round, and it is stated here because the code cannot
enforce it:

> **An admission rule must say whether its item set contains the contract turn's asks.**

`askAll` does (it reads every turn). `admitted` does not (it refused the contract's turn in 50 of 403 episodes), and the
sign of its coverage delta follows from that and not from its filter. A rule that widens *where* it reads while
narrowing *what* it contains can lose work it had, and that is a failure mode no comparison against the request board
will explain — the numbers will simply look wrong, in the direction the rule was supposed to improve.

**The cost invariant, from the same round.** A bar on the *cost* side of a trade is only a bar if the degenerate rule
fails it. R230 passed "items ≤ 2× the contract" while rescuing 16% of what it targeted (AUDIT 34.323), so R231's cost
bar is a ratio — items added over the contract per write rescued — which the degenerate rule fails at 5.6 and a working
rule can pass at 1.5.

### 17.193 Inheritance as a parameter, and the two arithmetic invariants R231 leaves behind

R231 needed one thing from the parser: the ability to say **where inheritance stops**. The implementation is a keyword
argument rather than a second parser, and the reason is a design rule this repository keeps rediscovering — a rule that
is correct in one context and wrong in another should be *scoped*, not duplicated.

```python
def items_of(text: str, inherit: bool = True) -> list[dict]:
    ...
    if not named and not inherit:
        continue          # outside the contract's turn, a neighbour's family belongs to the neighbour
```

The default preserves every caller that predates the round, which is all of them, and the read-anchor tool passes
`inherit=False` for turns after the contract's. `clause_asks` then composes the two readings:

    the contract's turn  -> items_of(text)                  # whole, inheritance and all
    every other turn     -> items_of(text, inherit=False)   # only clauses that name their own family

**Invariant 1 — the item set contains the contract's.** AUDIT 34.324 asked every later admission rule to state this,
because R230's board read *more* turns and covered *fewer* writes. The clause board satisfies it by construction: the
contract's turn is read whole, so its asks are a subset of the board's, and coverage cannot fall below the contract's
by accident of filtering. The reading asserts it (`items >= request items`, `covered >= request covered`) rather than
describing it, because the R230 failure was invisible in prose and obvious in one comparison.

**Invariant 2 — a ratio bar requires a positive denominator.** `clause_bar` evaluates
`recovered > 0 and added <= 1.5 * recovered` and reports `perWrite: None` when there is nothing to divide. The bar was
registered as a ratio precisely because a ceiling had been passed by a rule that admitted almost nothing (34.323), and
a ratio introduces the opposite defect: at `recovered = 0` the inequality is `0 <= 0`. The general form is in the
audit; the code carries the guard and the suite carries both ends of it.

**The interface stays one value.** `ask_board(entry, messages, scope)` with
`scope in ("request", "conversation", "admitted", "clause")` and one more row in the reading's board table. A round
that changes the content of a board must be readable on the same grid as the boards it is compared with, and the grid
is 456 episodes of a paid dispatch: a new tool would have to re-buy it.

### 17.194 The moment board: two cuts, one bisect, and a cap that is not a property of the board

Every board in this lane until R232 was built from the **finished** transcript. The product renders `items[:8]` from a
board built from the messages **so far**, and the two differ by a factor of 456 in size on the retail grid. R232's
mechanism is therefore not a rule but a slice, and both of its boundaries are load-bearing.

```python
def moment(entry, messages, upto, scope):
    stop = bisect.bisect_left(entry["at"], upto)        # (1) the events end where the message begins
    return ask_board({**entry, "events": entry["events"][:stop]}, messages[:upto], scope, later=False)  # (2)
```

**(1) The event boundary is found by `bisect` on a per-event message index, not by counting calls.** `ledger` stamps
every event with the index of the message it was read from (`at`), which is additive: the list is non-decreasing, so
the first event at or after message *k* is a binary search. Slicing at the call's own event instead is right for a call
alone and wrong for a message carrying two — the second call would see the first call's settlement and be credited
against a line it never saw. The block is rendered **once** per assistant turn; two calls in one message read one block,
and `visibility` caches by message index for that reason rather than for speed.

**(2) `later=False` because a moment board must not consult the future.** `ask_board`'s `disclosedLater` taxonomy parses
every user turn to explain a miss, which is legitimate on a finished board and a leak on a moment board. Off, the same
miss is filed as `neverStated`, and the suite asserts that difference — which is the only observable evidence that the
future was not read.

**The cap is applied last and to the items only.**

```python
offered = len(items)
if cap is not None:
    items = items[:cap]
```

`itemsAll` keeps the uncut count, and the settled flags are untouched: a settled ask below the fold is still settled, so
`credited`, `unaccounted` and `unbound` remain properties of the **rule**, while `items`, `open` and the displayed
columns are properties of the **window**. That split is what makes `displayed / reached` a measurement of the cut rather
than of the rule, and it is why the round could prove the cap contributed zero (463 reached, 463 shown).

**Three numbers per scope, and no fourth.** `visibility` returns `required` (the evaluator's denominator), `reached`
(family open at any line) and `displayed` (family open within the cap), with `hidden` as their difference and
`hiddenShare` over `reached` — not over `required`, because the question the share answers is *of what the board
reaches, how much does it hide*. A graded write the ledger never saw is counted in neither and stays in the denominator:
the denominator is the evaluator's, not the instrument's.

**The bar compares levels, never mixes them.** R232's B3 was registered against the contract's *full coverage* (a
finished-board quantity) and measured a *displayed* one, and the +47 it produced was arithmetically impossible for a cut
to cause. `display_bar` now reports `moment` (the uncut level) beside `displayed` **in the same object**, so a future
bar cannot be written around the difference without both sides visible on one line of the reading. That is the design
rule the audit entry states as a policy, expressed where it can be enforced by reading the JSON.

**Cost.** The pass is one board per distinct call message per scope, and it is `display=True` only: `r228`–`r231` were
regenerated under this code and diffed to zero changes, because `cap=None` is the identity and `display=False` does not
run the loop. Measured on the 456-episode grid with its replication: **8.15 s** for the displayed reading against
**6.94 s** for the clause reading of the same two documents, so two moment boards per graded write cost 1.2 s over the
finished-board reading they sit beside — the moment boards are *smaller*, and the pass is one board per distinct call
message rather than one per call.

### 17.195 An ordering is a permutation: one board, two windows, and `other`

R233's implementation is thirteen lines and its design constraint is one sentence: **an ordering must not be a second
measurement.** The block is built once, and both windows are read off it.

```python
open_items = [item for item in board["items"] if not item["settled"]]
if any(item["family"] == family for item in open_items):
    reached += 1
    if any(item["family"] == family and not item["settled"] for item in board["items"][:cap]):
        stated += 1                                   # the product's window
    if any(item["family"] == family for item in open_items[:cap]):
        shown += 1                                    # open-before-settled
```

**Why `open_items[:cap]` is the ordered window and needs no second list.** Under open-before-settled the first `cap`
elements are exactly `open_items[:cap]` when there are that many open items, and every open item otherwise — so the
second test is the ordered rendering expressed on the unordered board. Building the ordered board instead would double
the cost and, worse, would put the two numbers in two objects that could drift.

**Why the statement test keeps the `not settled` condition.** A family can appear settled at line 3 and open at line 9.
The family test alone would credit a write whose obligation the model never saw, because what it saw was the word done.
That is the difference between measuring visibility and measuring mention, and it cost one write on each grid when it
was wrong (AUDIT 34.329).

**`other`, and why every reading carries it.** `visibility` returns the window it reports and the window it does not, so
`r232-reading.json` already contains R233's numbers and the two files agree by construction:

```python
assert fifth["display"]["clause"]["other"] == sixth["display"]["clause"]["displayed"]    # 632
assert sixth["display"]["clause"]["other"] == fifth["display"]["clause"]["displayed"]    # 622
```

Those two assertions are in CI. They are the cheapest possible guard against the failure mode this lane keeps finding:
two documents quoting two versions of one measurement, where the disagreement is invisible because neither document
prints the other's number.

**The third bar changes kind, not number.** R232's was a tolerance around a difference — `|displayed - covered| <= 4` —
and R233's is a floor at the contract's own statement-order level. The reason is that the two rounds ask different
questions of the same column: whether a *window* moved the shipped board, or whether an *ordering* did. A tolerance
around zero would let an ordering lose three writes without a finding; a floor expressed as a cross-grid constant would
fail every grid it was not measured on (AUDIT 34.329). `display_bar(summary, coverage, hidden, floor=...)` therefore
takes the form as an argument and reports `B2_contract`/`B3_hidden` or `B2_hidden`/`B3_displayTax` accordingly, with the
manifest checker walking both shapes.

## 17.199 — Three pure functions in a fixed order: the block as `order → fold → cut`, and the third column that keeps a fold honest

**The pipeline, and why the order is the design.** Every rendering decision this lane has measured is a function from
the item list to the item list, and the three of them compose only in one arrangement:

```
items ──▶ order ──▶ fold ──▶ cut ──▶ the eight lines a model reads
          │         │         │
          │         │         └─ cap = 8, the product's own constant (`limit ?? 8`, `CAP = 8`)
          │         └─ one line per family: first occurrence kept, repetition follows (R234)
          └─ open before settled: stable partition, statement order inside each group (R233)
```

*Fold before the order* would change which items the partition sees — the order would then be sorting a list the round
had already rearranged, and the two effects would be inseparable. *Fold after the cut* would change nothing at all: the
eight lines are chosen by then, and a fold is a statement about position. So the arrangement is not stylistic. It is the
only one in which each step's contribution is attributable, which is what lets R233 hold R232's board fixed and R234 hold
R233's.

**`_fold` is a two-bucket stable partition, and that is the whole rule.** `firsts` collects the first item of each
family in arrival order, `repetition` collects the rest, and the result is `firsts + repetition`. No item is dropped, no
settlement changes, `itemsAll` is untouched — so a board's *cost* columns are identical before and after the rule and
the only column that can move is which lines the window spends itself on. This is the property that made the round free
to read and, in the end, free to adopt: the rule cannot buy coverage with items because it has no way to add one.

**The third column: `unfolded`.** A fold must not cost the shipped board, and the level it must not fall below was
measured **before the fold existed** — 463 on the control grid, 443 on the replication. So a grouped reading carries
three numbers per write, not two:

| column | what it is | 654-write grid |
|---|---|---|
| `reached` | the write's family was open on the moment board at *some* line | 636 |
| `displayed` | …and at a line inside the cap, under the round's rules | 636 |
| `unfolded` | the contract's displayed level **without** the round's rule | 463 |

`unfolded` exists because the alternative is the treatment grading itself. Deriving the floor from the folded board's
own other window would be the defect AUDIT 34.329 caught with a constant from another grid, one level up: a rule asked
whether it cost a board, judged against the same board after the rule. It is measured by one extra `visibility` call on
the contract scope — the only extra board a grouped reading builds — and `check_manifest` now asserts that a saved
reading's `floor` **is** its `unfolded` column, so a hand-edited floor is refused even when `holds` is truthful about the
comparison it reports.

**What the instrument deliberately does not model.** The pack builder ranks candidates before it takes eight
(`mmrSelect` over a recall query), and the instrument's `moment` board takes the first eight items in statement or open
order. On the shipped board the difference cannot exist — 2.41 items against a limit of 8 means `selected` is the whole
candidate list — and on the clause board it can: 8.10 items with a ranker that could prefer a live `modify` to nine
settled `address` lines would recover what R233 could not. That is why R232's and R233's numbers are exact for the
shipped configuration and a **lower bound** for the clause rule (AUDIT 34.330), and why R234's 636-of-636 is a bound on
the same side: the fold cannot show a line the board does not hold, so ordering and folding are the deterministic special
case of the ranker the product already has.

**The cap is named in two places and compared in none.** `CAP = 8` here, `options.limit ?? query.limit ?? 8` there, and
no test binds them; `serving-defaults.json` carries `blockCeilingChars` and `openAskCeiling` but not the line count the
rendering rules are about. It is the next ¥0 engineering item in this lane, and its shape is already decided by the
mechanism that exists: one field in the manifest, read by the Python instrument and by `core/memory/serving.ts`, with a
test on each side that fails when the two constants drift.

## 17.200 — A budget is three integers and a rate card, and the card belongs to the dispatchers

**The design problem.** Three cost figures in the project's plan were wrong in the same way and for four rounds:
R235's dispatch was priced against a resolution the domain cannot reach, R221's submission was priced as a
dispatch although its inputs were already bought, and the two external benchmarks were priced at a rate that
applies to 0.5% of their tokens. Each was a *rate applied to the wrong quantity*, and none of the three needed a
new measurement to catch — each needed the quantity printed beside the rate.

**So the budget is arithmetic over four things, and all four are already in the repository.**

```
cost = Σ over benchmarks of  miss × rate.miss  +  hit × rate.hit  +  out × rate.out
                              ↑                    ↑
                              documents × context   (questions − documents) × context
```

`rate` comes from `eval/manifests/model-rates.json` — the same card `packages/eval/src/cost.ts` bills with and
`eval/drivers/tau2/run_split.py` bills with — so a budget and a bill are two readings of one file. The three
integers are the benchmark's own specification: LoCoMo is 1,986 questions over 10 conversations with a 27k-token
average prompt (94,098 characters as EvalScope measures it, at the 3.5 characters a token this lane's dispatches
actually ran at).

**Three decisions in the arithmetic that are not free choices:**

* **`miss` is the number of documents, not the number of questions.** A question that shares a prefix with the one
  before it is served from the provider's cache, and on this card the cached rate is **one fiftieth** of the miss
  rate. That single substitution turns LoCoMo from ¥58.43 into ¥1.96 — a 29.8× difference that is a *billing model*
  and not an optimisation. Grouping by document is therefore part of the harness's design, not a tuning knob: a
  replication that asks one question at a time in a fresh context pays the right-hand column, which is why the
  published numbers for these sets are expensive.
* **A re-sample re-misses each document.** The provider's prefix cache has a lifetime this project does not
  control, so `samples=2` is priced as two misses per document rather than as one miss and a hit. Billing a second
  pass at the cached rate would be a budget that assumes the provider's eviction policy in its own favour, and the
  one thing a budget may not do is assume the favourable case.
* **The no-cache column is returned as a field, not left to a reader.** `bill()` reports `uncachedUsd` and a
  `multiplier` beside the bill, because the ratio is the whole argument for grouping and a reader who has to
  compute it from two other fields is a reader who will not.

**Peak and off-peak are part of the budget rather than a scheduling preference.** The card's peak windows double
every rate, and they are `01–04` and `06–10` UTC on weekdays, so the same pair of benchmarks is ¥2.82 off-peak and
¥5.63 at peak. The plan's dispatch hours are therefore a line in the budget, and the tool takes `--band` rather
than reading the clock: a budget that depends on when it was computed is not a budget.

**The reading is checked, not trusted.** `--out` writes `eval/manifests/bench-budget.json`; `--check` re-derives it
from the card and refuses a total that no longer matches, a benchmark silently dropped, or a budget whose `hit` has
been zeroed. CI runs both on every push, which is what makes a document's cost line a number a build reproduces
rather than a number a document remembers.

**And the floor, which is the same repair one level out.** `eval/tools/resolution.py` has printed a grid's **floor**
— the sampling error that survives unlimited attempts — since R223, and R235 was registered at exactly that floor
(3.21 points on 114 tasks), which means it could not pass at any budget. The tool already refused it in one line
(`+0.0321: UNREACHABLE`); nothing read the line. So the registry now names the instrument any non-inferiority round
is priced against, and the audit rule is mechanical: **a bar whose margin sits within its grid's printed floor fails
the build**. Together the two tools answer the only two questions that precede spending — *can this domain resolve
the effect* and *what does the work cost* — and both answer before a token moves.

## 17.201 — One board, three scopes, three rungs, and a window that is one number

The serving path this section describes exists because a rule can be complete in an instrument and absent from the
driver. The previous rounds measured three rendering rules on transcripts; this one makes them a property of the
block a model reads.

**The scope.** `goal_board.board_of(messages, scope)` accepts `request`, `conversation` and `clause`, and refuses
anything else rather than defaulting — an unknown scope that falls through to the request board turns a typo in a
dispatch into a quiet re-run of the previous round.

```
request       items_of(request_of(messages))
conversation  items_of(content) for every user turn
clause        clause_items(messages)["asks"]     # contract whole + self-naming clauses
```

`clause_items` returns the items **and** the diagnostics R231 registered: `turns`, `contract` (the turn that stated
it, which need not be turn one), `wholeTurns`, `partialTurns`, `offered`, `kept`, `refusedInherited`,
`containsContract`. The diagnostics travel because they are how a reading says why a board holds what it holds, and
because the product and the instrument call the same function.

**The rungs, and why they are a ladder rather than two flags.**

```
statement  the items as they arrived
open       order_open(items, is_settled)          # unresolved first, statement order inside each group
grouped    fold_family(order_open(items))         # then one line per family
```

`order_open` and `fold_family` each take one predicate — the tick, or the family — because the product's items carry
`settled_by` (a receipt's name) and the instrument's carry `settled` (a boolean), and a rule that could read only one
shape would be two rules again. The fold is applied **after** the order and **before** the cut: before the order it
would decide which items the partition sees, and after the cut it would decide nothing at all.

**The board carries its rung.** `board_of(..., CLAUSE)` sets `display: "grouped"`; every other scope sets
`"statement"`. `render(board, state_only, display="")` resolves the rung as `display or board["display"]`
`or "statement"`, so the two can only disagree if a caller passes a rung explicitly — which is exactly the case a
test is written for. `displayed(items, "sorted-by-length")` raises rather than defaulting, for the reason the scope
does.

**The window.** `MAX_ITEMS` is 8, and it is also `defaults.blockLines` in `eval/manifests/serving-defaults.json`,
which `SERVING_DEFAULTS.blockLines` restates for the product and `buildPack` reads instead of a literal. The
parser's self-test asserts the two are equal, `serving.test.ts` asserts the product's copy equals the manifest's, and
`pack-lines.test.ts` asserts the **behaviour** — a caller who names no limit gets eight items, and a caller who names
twelve gets twelve — which is the only form of the assertion a re-introduced literal fails.

**The instrument delegates.** `read_anchor.clause_asks(messages)` is `goal_board.clause_items(messages)`, and
`read_anchor._fold` is `goal_board.fold_family`. The two are the same function because B2 asks whether the model
acted on what the block *carried*, and a reading that re-derived the rule its own way would be describing a block
the model never saw. Re-deriving the four scopes over 456 episodes before and after the delegation is what makes
"the same function" a checked claim rather than a comment: the JSON is byte-identical.

**What the driver records.** `MICROGLIA_BOARD` carries the arm as one value (`tail`, `front`, `policy`, `clause`),
and `board_scope()`/`board_display()`/`board_placement()`/`board_admission()` all read it, so an arm cannot be
half-set. The census carries the four values, the per-episode dose record carries `scope` and `display`, and the raw
dump keeps them beside the join key. The workflow asserts the values the arm **ran** with, which is the difference
between a flat result and a dispatch that measured nothing.

## 17.202 — The reader: recompute the block, then ask whether the write named it

R236's bars are per-episode proportions over a **dispatched** transcript, and no tool in this lane produced one. The
reader is `eval/tools/board_mechanism.py`, and its design has one idea: the block cannot be quoted from a transcript
(τ² stores no injected message — the tail placement writes into a copy), so it is **recomputed** from the same
messages the driver had, with the same functions.

```
entry    = read_anchor.ledger(messages)                 # writes in order, each with its message index
window   = read_anchor.moment(entry, messages, index, scope, order=…, fold=…)["items"][:CAP]
served   = ∃ a write whose family is open on the window at its own call's moment
acted    = the same test, restricted to writes that discharge an evaluator requirement
wired    = board_of(messages, scope) holds an ask board_of(messages, request) does not
```

Three decisions are load-bearing:

* **Keyed by message, not by call.** Two calls in one assistant message were answered by one block; a per-call key
  would let the second call see a board the first never did — the leak `moment`'s two cuts were built to remove.
* **The cut is applied here, not in `moment`.** The same board is read uncut by the attribution columns, and a
  reader that asked an attribution tool for a window would be asking it to be a renderer.
* **`wired` is computed once an episode over the finished conversation.** The switch either was on or it was not; a
  per-call version would price the conversation rather than the arm.

**What it found before the money.** B1's registered 95% was a per-*write* rate (R234's 636/654 = 97.2%) applied to a
per-*episode* quantity (89.5% at the clause scope), so the correct arm failed it. B1 became a wiring certificate at
80% — 94.5% on the control grid, **0.0%** at the request scope — and B2 a harm bar at the replay ceiling minus the
registered resolution (97.8% − 9 = 88.8%), because comparing against the contract board's 78.9% would price the
window's width, a superset by construction, as if it were the model acting. The ceiling replicates at 96.7% on a
second 456-episode grid, which is why it is a ceiling and not a result.

**The saved form is checked, not trusted.** `--save` writes the three readings with both documents' sha256 and the
command that produced them; `--check` re-derives every share from its own counts, every denominator from the rows,
and each verdict from its own bar. CI runs the check on `eval/manifests/r236-replay.json` on every push, so the
numbers the amendment quotes cannot drift from the tool that produced them.

## 17.203 — 陷阱读数器：三个可判定的量，和一个必须被推翻的量

`eval/tools/memory_traps.py` 只做一件事：把 MemTrapBench 的两族陷阱翻译成**转录可判定**（无需模型）的量，并明确标出
哪一族在本域**不可**用转录判定。它与 `board_mechanism.py` 共用 `read_anchor.moment` 与 `goal_board`——一个拥有自己
解析副本的读数器，测的是模型没看过的块（AUDIT 34.335）。

**三个量，定义在窗口上而不是在集上。** 窗口 = 一条 assistant 消息之前那一刻的 `items[:CAP]`（同一消息里的两次调用共用
一个窗口，逐调用重算会把同样八行数两遍）：

    settled     已结算且仍在行预算内的问句——渲染器会删掉它；报告它是为了给「结算规则值多少行」一个数
    unused      该调用没有点名的开放问句；一次调用平均只用 1 个 family，而窗口平均花 7.73 行
    fixation    同 family、同 `args` 签名的调用在环境拒绝之后被再次发出（首次不算，成功会清除拒绝）

`fixation` 用 `args` 而不是 `arguments`：receipts 的键是前者，从后者读会让每一次调用的签名都是 `None` 的 repr，
于是每一次拒绝都看起来像另一次拒绝的重复——一个把所有 episode 都算成固着的假阳性。

**一个必须被推翻的量，以及为什么保留它。** family 级陈旧率（「某 family 成功写入后仍被列为未完成」）在控制网格上读
11.4%，拆分后是 6.8%（该 family 从未结算）+ 203 条（同 family 多产品，显示正确）。量纲错在：**family 是板子结算的
单位，问句才是模型读的单位**。保留它的三个理由：①可重算（清单里有 `rejected` 与其拆分，`--check` 每次推送复算）；
②可复现证据（`--sample` 打印窗口，读者不必信任一段散文）；③给未来的问句级版本一个比较基准。

**读数器没有门禁，这是刻意的。** `verdict()` 只在「有集但无写」「无集」时报错——这两种是**读不了**，不是「读到零」。
本轮没有任何量达到可以立门的成熟度：`settled` 是规则的价值而非效应，`unused` 是描述，`fixation` 在 456 集里是 0
（0/456 无法支撑一个门槛）。给描述性的量立门禁，等于把「今天的样子」固化成一个永远不该失败的断言。

**它的代价与边界。** 456 集 0.9 秒、0 次模型调用；`--self-test` 覆盖 98% 的行与分支，包括合成转录的集成路径、CLI 的
六条分支、以及存档的七种篡改。边界写在文件头：它**不能**判定「用户已经改口的问句是否仍然成立」——那是一道语义题，
需要判分器，需要钱，是 R238 登记要买的东西。

## 17.204 — 结算三档：名、记录、以及为什么守卫必须在收据上

`goal_board.settlement` 现在返回四值之一：`name` / `overlap` / `record` / `""`，优先级即此顺序。前两档与 R214–R216 一致；`record`
是 R238 新增，它回答的是前两档原理上无法回答的问题：**写入根本没有携带任何商品**。

**为什么不能把守卫放在问句上。** 直觉写法是「问句没点商品时，允许用订单号结算」（`not names_a_product(item, table)`）。它在 456 集上
只关掉 12 行，因为最需要它的一类问句恰好被排除：`cancel the entire order #W5481803 (both the boots and the kettle)`——问句点了商品，
所以不许用订单号；写入是 `cancel_pending_order`，只带订单号，所以名档永远不匹配。结果是订单取消之后，问句永久开放。守卫放在**收据**
上（`not named`，即收据未解析出任何商品名）说对了这件事：写入带了商品 → 不匹配即拒绝，订单号不得越权；写入没带商品 → 订单号是唯一
证据。

**词干化必须双侧，且必须显式排除三种形态。** 单侧词干化会让规则变成"只在目录用复数、用户用单数时成立"，换一张目录就反向失效。三种
形态不当作复数：三字母词（`bus`）、双 s 结尾（`glass`）、`-es` 跟在元音后（`shoes` → `shoe` 而非 `sho`）。这不是通用词干器，而是
针对语料里实际存在的两百个商品名的词干器，写成一条可被本文件检验的规则，而不是引一个无法在两百个名字上验证行为的依赖。

**量化（456 集，同一定义）**：32/3,483（0.92%）→ 10/3,479（0.29%），关闭 22；family 级 447→440。剩余 10 条是 return 类的部分/整体
不匹配，`records_in` 只能看到订单号，看不到"五件中的三件"。

**代价与边界。** `record` 档的结算计入 `byRecord`，与 `loose` 并列出现在 board 上：一个读数里若大部分 tick 来自记录档，读者应当知道
它信任的是问句自己拼写的订单号，而不是商品名。`moment`（仪器）此前用读锚结算，两套规则在 4,968 个 item-moment 中差 133 处——
R239 已把它统一到 `board_of`（见 17.205），四份清单随之重生成。

**新列 `served`。** `memory_traps` 现在同时给两个单位：`served`（被服务板子、ask 单位、按渲染档位取窗）与 `rejected`（板子结算单位、
family 聚合）。统一前二者读 0.29% 与 11.4%；统一后 rejected 读 10.9%（familyStale 483/4,427），served 不变——差仍在，因为单位不同，
但「两套结算规则」这个额外的差已经消失。

## 17.205 — 一条结算函数，两个消费者：`moment` 委托 `board_of`

R238 把产品的结算规则补全到三档（名 / 重叠 / 记录），但仪器 `read_anchor.moment` 仍走另一条路：它经 `ask_board` 用读锚结算——一次写入
只有在 episode 打开过它触及的 record 时才结算一个 ask，判据是 `record in seen`。两条路在 456 集上 4,968 个 item-moment 中差 133 处，
全部在 family 内部。只要它们还是两个函数，测评侧读到的板子就不是产品侧渲染的板子，任何「更宽的窗口是否带来收益」的结论都可能在测一个
产品从未服务的东西。

**接口。** `ask_board` 新增 `settle` 参数，两个值：

    "read"      默认。读锚结算，r228–r231 的已发布清单量的就是它，保持逐字节不变。
    "serving"   R239。items 的 settled 由 goal_board.board_of(messages[:upto], scope) 给出，
                与服务路径逐字相同的函数和参数。

`moment` 传 `"serving"`。它仍用 `entry["at"]` 的 `bisect` 边界——两条同消息写入读同一块板子，这是 R232 就定下的不泄漏约束——但结算不再
取自 ledger 的 events。`_serving_ask_board` 返回与 `ask_board` 相同的结构（`items` 带布尔 `settled`、`itemsAll`、`credited` 等），所以
三个消费方（`read_anchor.visibility`、`board_mechanism.windows`、`memory_traps.episode_reading`）读同一份契约，一个字都不用改。

**可判定的差异，而不是平均值。** 一条「取消订单 #W5056519」的问句，episode 从未读过该订单，写入只带订单号、不带商品名：

    统一前 moment  → ("cancel", False)    读锚：record 从未打开，结算不了
    统一后 moment  → ("cancel", True)     board_of：record 档，byRecord = 1

这条差异进了自检：它证明统一改变了可观测行为，而不只是重构了调用链。

**为什么门禁数字不动。** R236 的 B1（wired 431/456）与 B2（acted 394/403）判的是「窗口的 family 是否 open」。一个 family 有多条问句时，
结算掉其中一部分、仍留一条 open，判定不变。裂缝在 ask 单位，family 单位的门禁天然看不见它——这与 R238 的「11.4% 是错的量纲」是同一条
结论。真正移动的是 ask 单位的读数：r232–r234 的 request reached 463→461（control）、444→439（replicate）；r237 的 rejected familyStale
507→483、staleUnsettled 304→290。产品侧的 served 列（10/3,479）与 r236-replay 逐字节不变。

**清单纪律。** `--check` 只验清单内部算术自洽（rows 求和 = 汇总），不重算源文档。一份陈旧的清单照样自洽——它自洽于旧代码。因此改结算函数
必须显式 `board_of` → 重生成四份清单（r232/r233/r234/r237-traps），并在审计里记下前后数字；`r236-replay.json` 因逐字节不变而不动。
CI 全绿（清单自洽）与此刻的产品—测评一致（清单由当前代码生成）是两件事，后者靠这条纪律保证。
EOF
echo "TECH-DESIGN 17.205 appended and 17.204 updated"

## 17.206 记录档与「字母表」：为什么一个域的零不等于这个语料不命名任何东西

**规则本身。** `settlement` 的第三档以标识符为证据：

```python
if not grade and not named and records_in(item["clause"]) & {i.lower() for i in receipt["ids"]}:
    return "record"
```

两处字符串相交。这句话的成立条件有两个，而代码只写了第一个：子句里出现标识符、收据里出现标识符。第二个条件——**两侧用同一种写法拼它**——没有被写下来，因为在零售域它总是成立。

**两个静默的空白。**

| 侧 | 形状 | 零售 | 电信 | 后果 |
|---|---|---|---|---|
| 问句 | `RECORD` | `#W2378156` | `555-123-2002` | 不匹配 → 该档永不触发 |
| 收据 | `ID` | `#W2378156`、`1151293680` | `L1002`、`C1001` | 参数在比较前被丢掉 |

第二行的后果更隐蔽：它发生在**构造收据**的时候，所以任何关于「问句为什么没结算」的读数都会把一个构造期缺陷读成一个语义结论。

**R240 的形状表。** 两侧同时读三种形状，并保留让规则诚实的那条下限：

```python
ID     = re.compile(r"#[A-Za-z]{1,3}\d{3,}|[A-Za-z]{1,3}\d{4,}|\d{6,}|\d{3}-\d{3}-\d{4}")
RECORD = re.compile(r"#[A-Za-z]{1,3}\d{3,}|\b[A-Za-z]{1,3}\d{4,}\b|\b\d{3}-\d{3}-\d{4}\b")
```

裸字母前缀要求 ≥4 位、纯数字要求 ≥6 位，两条都不是审美：τ² 的邮编是五位，邮编是地点不是记录。

**令牌表为什么不是修复。** 电信库里客户的 `phone_number` 等于他自己某条线路的号码：

```
555-123-2002 → [line:L1002, customer:C1001]
```

于是申请单唯一的把手同时点了两条记录。三种读数（同一批 8 条被评分写入）：

| 规则 | 可达 | 代价 |
|---|---|---|
| 出厂 | 0 / 8 | 零，且看起来像语料的性质 |
| 令牌表（忽略歧义） | 8 / 8 | 会把写入记到该户任意一条线路上 |
| 令牌表（拒绝歧义） | 0 / 8 | 唯一能在语义上站住的表，什么也到不了 |

**可证伪的惰性。** 语法加宽在零售上不改变任何一次结算。为了不把这句话写成声明，本轮用一个**永不匹配**的语法当对照：它把陷阱读数器每一列都动起来（`shown` 3,479→3,507、`hidden` 137→109、`served.stale` 10→0、`familyStale` 483→518）。仪器是灵敏的，所以「真实语法下没动」等于「改动够不着」，这是可判定的区分。

**清单纪律的第二次修正。** R239 用 `diff` 把清单和它自己的备份比对来宣布逐字节不变——同义反复。本轮重生成时 `r236-replay` 的对照臂 `served` 从 479 落到 477（R239 的 `moment`→`board_of` 多结算两个 ask）。不变量因此改成：**清单只对重推导负责**。`--check` 验的是清单内部算术，不重算源文档，所以陈旧清单永远自洽——这正是重生成必须显式发生的原因。

## 17.207 成本阶梯：一个派发的三个因子，与两把不能混用的尺子

**为什么放在 `resolution.py` 而不是新建一个计价器。** 一个派发的**可分辨效应**和它的**成本**是同一个决定的两半：episode 数既是分母的来源，也是账单的来源。若把计价拆到第二个文件，两个文件就要各自持有一份 `a`、`b`、`POWER_Z`，而第二份就是第二个真值来源——`budget.py` 的文件头已经写明它**不自己算成本**，正是为了避开这件事。所以阶梯是 `resolution` 的一个函数族，读同一份拟合。

```python
tier(fit, tasks, arms=2, attempts=1, episode_usd=..., rate=0.5) -> dict
tiers(fit, specs, ...) -> list[dict]
render_tiers(rows, ...) -> str
check_tiers(document, episode_usd=None, rate=0.5) -> list[str]
```

**两把尺子，一个 `kind` 字段。** 配对的两臂与单臂报的不是同一个量：

| 臂数 | 报什么 | 公式 | `floor` |
|---|---|---|---|
| 2 | 配对差的可分辨效应 | `POWER_Z × √(a/m + b) / √N` | 有，`POWER_Z × √b / √N` |
| 1 | 绝对分数的半宽 | `POWER_Z × √(p(1−p)/(N·m))` | 无（没有可配对的东西） |

`rate` 只在单臂分支被读取，默认 0.5——把 `p(1−p)` 最大化，因此是保守界；一个 80% 的域比一个 50% 的域更容易测，按最难的情况报价不会美化计划。两臂分支不读 `rate`，所以它也不因 `rate` 非法而被拒——为一个它从不读取的量拒绝一个合法的档，是把接口的洁癖当成了正确性。

**`floor` 必须逐档携带。** 因为**缩小样本会把地板抬高**，而地板是「无论花多少钱都跨不过去」的那条线：40 题 5.42pp 对 278 题 2.06pp，按题数比值的平方根缩放。一张只印价格不印地板的表，会推荐最钝的那一档——它最便宜。

**`usdPerPoint` 是唯一的跨档比较，但它不能单独排序。** 每点分辨率花掉的美元，在换题数后仍然可比；可是它奖励钝尺子（分母大），所以它必须与 `mde` 并排读，而不是代替 `mde`。

**清单 schema `@2`。** `plan-costs.json` 的一条线现在可以携带 `fit`、`episodeUsd`、`gates`、`tiers`。`tiers` 的每一档只存规格与派生值，不存理由；`gates` 存的是决定顺序——`gate 0` 无 `rung`（它不花 episode），其余各点名一个 `rung` 字符串（`"40:1:1"`）。**登记额是第一条付费闸门**，这条约束由 `budget.py` 检查，不由文档承诺。

**验证的依赖方向是单向的。**

```
resolution.py --tier        → 产出档（唯一会算 mde 的地方）
resolution.py --check-tiers → 读 manifest，重算 episode/cny/mde 并比对
budget.py                   → 读 manifest，只验算术自洽与闸门绑定，不算 mde
```

`budget.py` 不重算 `mde` 是刻意的：那需要 `a`、`b` 与 `POWER_Z`，而一旦它拥有这三个常量，`mde` 就有了两份实现。它验的是「每一档的成本等于它自己的三个因子乘单价」与「每道闸门的价格等于它指向的那一档」——这两条不需要拟合，只需要乘法和查表。

**价格的锚定顺序。** `check_tiers` 的价格来源是：调用方 `episode_usd` 优先；否则计划顶层的 `episodeUsd`；最后才是档所在条目自己的 `episodeUsd`。并且只要上层有值而条目与它不一致，就报错而不是采信条目。理由是一句话：**一行给自己定价的梯子能证明任何数。**

## 17.208 — handle 档：三条关系、一个格、两把尺子

**为什么解析器读 transcript 而不是建表。** 静态令牌表要在记忆仪器里放一份数据库副本，成为第二个真值来源；而且它会为一个从未发生的解析作证。读取在 transcript 里，`read_records` 只是把它整理成三条关系：

```python
phones     phone -> line_id      某条 line 记录自己的 phone_number
accounts   phone -> customer_id  某个 customer 记录自己的 phone_number
owners     line_id|bill_id -> customer_id
```

**为什么 `phones` 只从 line 记录取，不从 customer 记录取。** customer 的 `phone_number` 是**账户的联系号码**，不是某条线路的号码，两者是不同的断言。混在一起就会把账户号码定型成线路，兄弟线路的保护随之失效。

**`known` 是第四个字段，负责「这个 id 是什么」。** 一段请求里裸写 `L1003` 时，规则必须知道它是线路——而这个事实不需要读到那条线：账户的 `line_ids` 已经说了它是线路。所以 `known` 同时从 line 记录与 customer 的 `line_ids` 学习。少了它，`L1003` 会退化成未定型键，与收据的类型化键比不出结果，读数静默为零（不报错、不失败）。

**格子（lattice）的三条规则，按顺序咨询：**

```python
for kind in (LINE, BILL):          # OWNED = (LINE, BILL)
    left  = {name for key, name in ask if key == kind}
    right = {name for key, name in carried if key == kind}
    if left and right:
        return bool(left & right)  # 两侧都说了是哪一条，就在这一层比
return bool({n for _, n in ask} & {n for _, n in carried})   # 否则忽略类型比记录
```

第一条拒绝兄弟：两侧都有线路时，账户相同不构成理由。第三条保住零售：未定型的订单号按拼写比较，即 R238 规则不变。**中间没有「账户兜底」这一步，是刻意的**——兜底会让第一条永远走不到。

**`receipt_keys` 的两种来源。** 有 `args` 时按键名定型（`line_id` → line、`item_ids` → item，四种后缀各按自己的长度切，`[:-2]` 与 `[:-3]` 差一位就会得到 `line_` 这个类型名，且不报错）；没有 `args` 时退回扁平化的 `ids`，未定型——那正是它拥有的证据。**有类型时不再要求形状**：`_id_values` 必须看形状，因为形状是它唯一的证据；而参数名已经说了它是什么，这时再要求值也长得像标识符，会在任何短 id 的语料上把比较悄悄清空。

**两个计数，不是一个。** `byRecord` 与 `byHandle` 分开上报：后者的证据是一次解析，比前者弱，读者必须能看见一块板子里有多少 tick 建立在解析上。

**测量脚本的依赖方向。** `build_telecom_records.py` → `goal_board`（导入已发布规则），而不是各写一份。四条规则共用同一段文本与同一次读取，所以任意两条之间的差别是规则本身而不是输入——这才叫消融。

**反事实是这轮的验证核心。** 对数据库每条线路合成一次写入，统计每条规则承认多少条。`checked()` 校验「至多一条且是 blind 的子集」（至多而非恰好：没有账户认领的号码就是零），`--verify` 从字节重算整个 reading。**「至多一条」写进校验、「恰好那一条」写进报告**：前者是算术不变量，后者是关于这个数据库的断言，两者混在一处会让清单替自己的历史作证。

## 17.209 — 词表消融的实现：负向前瞻守卫、逐个 cue 的三域 census、可从字节重推导的清单

**问题重述。** R242 要量第三域的 ask 词汇：`CUES` 里缺 suspend/resume/roaming/refuel/plan/credit 六个 family 的词。实现的关键不是加词，而是让「加词有没有用」成为可测量、可复现、可拒绝的读数。

**数据结构：`ask_document(tasks)`。** 与 `build_telecom_records` 的 record 投影同源：`reason` 取 `request_of(task)`（ticket + 指令文本，与板读的文本一致，R215 规则），`writes` 取评分器自己的写入并按工具名（经 `WRITES`）命名——census 再通过 `goal_board.FAMILIES` 把工具名映射成 family。一份语料，两个读数（record 与 ask），共用同一个任务 walker。

**守卫是负向前瞻，不是词表。** `RETURN_GUARD` 在 `return/refund` 后紧跟八个封闭状态词之一时拒绝匹配：

```python
RETURN_GUARD = r"\b(return\w*|refund\w*)\b(?!\s+(?:excellent|poor|fair|good|updated|better|worse|normal)\b)"
```

封闭词表保证它不随语料增长；负向前瞻只削掉「恢复到某状态」的读法，不动「退货/退款」。该守卫已写入 `goal_board.CUES` 并成为产品默认；`goal_board` 自检新增四条断言锁住它（两条 state-return 必须是空 family、一条 refund 必须仍是 return、再加原有 retail 断言的回归）。

**`derive_cues(guarded, extra)` 与全局状态。** `goal_board.CUES` 是模块级可变状态。因产品已带 guard，「before」臂必须用 `OLD_RETURN`（逐字重建的旧模式）替换回去，「after」臂就是出厂表。`derive_cues` 只**返回**一张表、不改全局；`_census_with(cues, doc)` 在 `try/finally` 里临时赋值并在任何异常下恢复。这保证三域×七种 cue 表的二十一次 census 互不污染，读数与调用顺序无关。自检显式断言「压测之后 `goal_board.CUES[1] == ('return', RETURN_GUARD)`」。

**`ask_reading` 的二维三域。** 每臂读三件事：guard 的 before/after（电信的 found/spurious/tasksCovered，零售/航空的 found/spurious），以及六个 cue 各自相对 guarded 表的边际（六个字段：电信 found/required/spurious、零售/航空 spurious、两个布尔标志、一个 admissible）。判据是机械的：`admissible = reachesNewWrite and not addsSpurious`。六行全部 `admissible=false`，故 `shippedCues=[]`；`shippedGuard=true`。判据写进清单校验，任何「admissible 与两个标志矛盾」的篡改都会被拒收。

**清单的证伪链。** `eval/manifests/telecom-asks.json` schema `microglia/telecom-asks@1`，带三份源（电信任务、retail-goals、airline-goals）的 sha256。`check_asks()` 重算算术与判据；`verify_asks()` 从三份源字节重跑 `ask_reading()` 并逐字段比对 before/after/shippedCues/shippedGuard 与六个 cue 行的四元组。ci.yml 在既有 telecom 命令后加 `--check-asks` / `--verify-asks`。两层分开，是因为「加法自洽」与「算术曾关于这些任务」是两件事——R240 的零就栽在后一半上。

**覆盖率纪律。** 因为 CI 对本文件只统计 self-test 的覆盖率，`--asks` / `--check-asks` / `--verify-asks` 各分支以及十种防御分支都在 self-test 内通过真实调用驱动，而非留给 dispatch。最终 `goal_board.py` 与 `build_telecom_records.py` 均达 99%（语句 0 未覆盖，各 2 个不可达部分分支）。

## 17.210 — 把取消建成一等状态：affected-subset 判据、清单的判定强制、校验器对 cancelled 的语义

**问题重述。** R240b 把 accuracy dispatch 建成十档梯子，第一道付费闸（gate 1，¥1.68）买的是「precision dispatch 能移动的子集上的效应符号」。这个「子集」在注册时明确尚未枚举。R243 在付费前枚举它，并把「取消」这件事在代码、清单、校验器三层建成一试即过的状态。

**判据的构造：三列实测，一个交集。** `precision_reading(db, tasks)` 复用 R241 的 `reading()` 四规则表（从 db 字节重算，不读存档），再叠加请求文本的 ask 计数：
- `inCandidateSet` = `blind` 规则够到 write 的记录——答案在候选集里；
- `servedByShipped` = `shipped`（name/overlap/record）或 `handle` 任一 grade 结算——已被当前配置服务；
- `hiddenByCap` = 请求里 `items_of` 超过 `goal_board.MAX_ITEMS` 的部分，按任务累加其 graded writes——ask 被窗口切掉。
`affected = in AND NOT served AND hidden`。电信样本：8 / 8 / 0，交集 0。判据的三列都是 R240b 文字的形式化，没有新发明的量。

**为什么 R241 必然清空 gate 1。** gate 1 的前提是「答案在候选集但优先展示够不到」。R241 发布 handle 让所有 reachable write 都被 served（消掉「够不到」），R242 证明请求是症状、ask 数为 0（消掉「可重排的对象」）。`precision_reading` 把这两个交互后果压缩成三个数，任何一格不为零才需要付费。

**判定由数据强制，不可手改。** `check_precision()` 的六条算术不变式里有两条是关键：`verdict == ('CANCEL_GATE_1' if affected==0 else 'DISPATCH')`，以及 `affected <= hidden`、`served <= in_candidate`。`verify_precision()` 从清单的两份 sha256 源字节重推导全部九个字段并逐字段比对。自检对十种篡改设了拒收断言。这与 R241/R242 的清单共享同一套 `--check`（验算术）+ `--verify`（验字节来源）两层，区别在于判定字段本身也被算出来而非存进去。

**取消作为一等状态：`budget.py` 的语义变更。** `checked()` 对带梯子的项原有一条 `nowCny == first_paid_gate.cny` 的规则，它隐含「梯子总是活的」。R243 引入分支：
- `status == 'cancelled' and cancelledBy`：要求 `nowCny == 0`，且每个 `rung != None` 的 gate 都必须 `status == 'cancelled'` 且有 `cancelledBy`；
- 否则：保留原 registered-at 校验。
R240b 的 rungs 原样保留——它们是给那三道闸门定价的尺子，取消的是支出不是算术。`resolution --check-tiers` 因此仍重推导十档且 0 问题。plan-costs.json 的 `totalNowCny` 从 7.02 降到 5.34，`totalFloorCny` 不变（R240b 的 floor 本就是 0）。

**覆盖纪律。** CI 只对 self-test 计覆盖率，因此 `--precision` / `--check-precision` / `--verify-precision` 各分支、`check_precision` / `verify_precision` 的防御分支、`budget.checked()` 的取消分支与 registered 分支都在 self-test 内真实调用驱动。最终 `build_telecom_records` 99%（122 checks）、`budget` 99%（273 语句 0 未覆盖）、`resolution` 100%。

## 17.211 R244 — the delivery-boundary state resolver

**Placement: between `buildPack`'s MMR selection and `renderPack`'s character budget.** State resolution is a pure
function over the selected candidates plus one clock. It runs before the budget for the same reason the shape fold
does: a revision's role is a property of the set, not of the lines the character limit happens to carry, and a
superseded line must not become current just because its winner was truncated away.

**Sub-package layout and dependency direction:**
- `packages/core/src/apply/state-role.ts` — pure functions only (`stateRoleOf`, `serialOf`, `subjectKey`,
  `resolveStates`, `STATE_ROLES`). Imports `scopeKey` from `kernel`; imports nothing from `memory`, `eval`, or any
  provider. This is the same direction as `shape-fold.ts`: delivery policy reads kernel types, never the store.
- `packages/core/src/apply/render.ts` — `RenderOptions.stateRole?: { now: number }`. `renderPack` normalises each
  `RenderableItem` into the narrow `StateSubject` view (absent clocks mean open bounds / `active`, the honest default
  for an authored item), calls `resolveStates` once, and passes each id's role to `encodeItemLine`, which prints
  `state` only when a role was resolved. `makePack` forwards the option unchanged.
- `packages/core/src/apply/pack.ts` — `BuildPackOptions.stateRole?: { now: number }`, forwarded to `makePack`.
- `packages/core/src/apply/index.ts` — re-exports the module so a host imports the classifier from one surface.
- `eval/fixtures/state-role-store.json`, `eval/manifests/state-role.json`, `eval/tools/state_role.py` — the evaluation
  half: a byte fixture, a recorded reading, and an independent re-deriver. `packages/core/src/apply/__tests__/
  state-role-manifest.test.ts` binds the two halves.
- `.github/workflows/ci.yml` (self-test under coverage + check + verify), `package.json` (`eval:verifiers` chain),
  `vitest.config.ts` unchanged.

**Decision table — exactly one role, in this order:**

| condition | role | rationale |
|---|---|---|
| `contradictions > 0` or `status === 'conflicted'` | `transition` | a contest is never silently current; age does not resolve it |
| `now > validUntil` or `now > systemUntil` | `historical` | world or system time has ended |
| `now < validFrom` or `now < systemFrom` | `historical` | not yet assertable |
| otherwise | `current` | asserted, uncontested, inside both clocks |

Boundaries are inclusive (`now == validUntil` is current). Within a claim group (`namespace|kind|scopeKey`), the
highest serial is current and other non-contested revisions are `historical`; a contested loser keeps `transition`.

**Clock discipline.** `now` is injected at every layer — the store already treats time as a dependency (`clock.ts`),
and a wall-clock read inside the renderer would make two replays of one store print different blocks. The fixture
encodes an open clock as `null` (the store's JSON encoding of `Infinity`) and the reader translates explicitly.

**Byte-identity guarantee.** `state` is printed only when `options.stateRole` is present and a role was resolved;
`encodeItemLine`'s default record is unchanged. Four pre-existing knobs (`note`, `budgetBasis`, `shape`, `decision`)
compose without change. `readme-layers.test.ts` verified the new module is counted once (core 50 / 11,044 lines).

**Cost and what is deliberately not bought.** ¥0, no model call: the classifier and reader are pure arithmetic over
bytes already in the store. This round does not purchase an accuracy dispatch. Whether the state role raises task
success on a given workload remains a measurement the caller runs with the option on and off over one store — the
one-variable contrast the library is built for. A-TMA's and Freshness's +pp are cited as locating the mechanism,
never as this corpus's result.

## 17.212 R245 — the quota-error classifier at the driver boundary

**Placement: between the HTTP reply and the retry loop, in both drivers.** A quota decision is a pure function of
what the provider already returned; it never calls the network or reads a clock. It runs before the backoff so a
terminal reply is refused before the deadline is spent.

**Sub-package layout and dependency direction:**
- `packages/eval/src/quota-disposition.ts` — pure functions (`classifyQuotaFailure`, `quotaReplyFrom`,
  `quotaRetryAdvice`) and the fifteen-family / three-disposition vocabulary. Imports nothing from `core`, `memory`,
  or any provider SDK. Same direction as `provider-probe.ts`: delivery policy reads a recorded reply, not a live
  endpoint.
- `packages/eval/src/model-client.ts` — `terminal429Of(body)` consults the classifier when a 429 arrives; a terminal
  family is counted as a failed prompt and thrown as `MG_E_CONFIG` with `family` and `hint` recorded. The existing
  `verdictOf` fast path for 5xx/408/409/425 is untouched; a 429 with no family code still retries with `Retry-After`.
- `packages/eval/src/bin/embed-probe.ts` — the non-2xx branch reads the body, builds a reply, and acts on
  `quotaRetryAdvice`: terminal throws immediately, rate limit waits and continues. This is the path that actually hit
  the Zhipu 429.
- `packages/eval/src/index.ts` — re-exports the classifier so both drivers import one surface.
- `eval/fixtures/quota-replies.json`, `eval/manifests/quota-disposition.json`, `eval/tools/quota_disposition.py` —
  the evaluation half; `quota-disposition-manifest.test.ts` binds the two halves.
- `.github/workflows/ci.yml` (self-test + check + verify, all under coverage), `package.json` (`eval:verifiers`).

**Decision table — family first, disposition derived, in this order:**

| reply | family | disposition |
|---|---|---|
| 403 any code | `balance.insufficient` | `stop` |
| 402 any code | `window.cap` | `wait-until` |
| 5xx | `server` | `retry` |
| 429 `API_KEY_QUOTA_EXHAUSTED` | `key.quota` | `stop` |
| 429 `USAGE_LIMIT_EXCEEDED` | `window.subscription` | `wait-until` |
| 429 `INSUFFICIENT_BALANCE` | `balance.insufficient` | `stop` |
| 429 coding 1113/1311/1309 | `balance.insufficient` | `stop` |
| 429 coding 1313/1314/1315 | `coding.config` | `stop` |
| 429 coding 1308/1310/1316–1321 | `coding.reset` | `wait-until` |
| 429 coding 1302/1305 | `coding.backoff` | `retry` |
| 429 window marker in message | `window.spend` | `wait-until` |
| 429 `rate_limit_error` + concurrency message | `rate.concurrency` | `retry` |
| 429 `rate_limit_error` other | `rate.upstream` | `retry` |
| 429 `rate_limit_exceeded` + Retry-After | `rate.rpm` | `retry` |
| 429 otherwise | `rate.unclassified` | `retry` |
| 408/409/425 | `transient.4xx` | `retry` |
| other 4xx | `refusal` | `stop` |

Order is specificity: terminal codes and balance are checked before any rate-limit interpretation, because a
spend window arrives under the generic `rate_limit_exceeded` code and only its message distinguishes it.

**Wait discipline.** `quotaRetryAdvice(reply, attempt, backoff)` uses the provider's `Retry-After` when present and
the caller's backoff otherwise; a terminal decision never calls `backoff`. Both drivers inject their own schedule —
the classifier never owns a timer, which is what makes it replayable.

**Byte-identity guarantee.** A plain 429 and a 5xx behave exactly as before; no committed artefact changes. The
terminal branches are new paths reached only by replies carrying the named codes. `readme-layers.test.ts` verified
the new module is counted once (eval 199 modules / 60,131 lines).

## 17.213 R246 — 写侧跨视图一致性门：从 Utility 读数到 verdict 的纯函数

**一句话决策，先于论证。** 一个修正该不该持久化，取决于它的效用符号是否在多次独立分析下一致；只有全正才接纳，
符号翻转（fragile）在写侧被拒。理由：SPLICE（arXiv 2610.30790）实测同一经验的不同分析产生效用差异显著的
知识，"保留跨视图一致候选"是其接纳规则；Anti-Persistence（arXiv 2610.27406）把错误抽象的自我再生建模为
抽象→执行→再抽象的循环；两者共同指出负效果的载体是**被持久化的脆弱抽象**，而不是检索或容量。

### 模块与位置

`packages/core/src/apply/view-consistency.ts`，在 `apply` 层——因为这个判据决定什么进入记忆，与 `admitWrite`
（写侧去重）、`stateRole`（读侧状态）并列，且都从 `apply/index.ts` 导出。纯函数，无 clock、无网络、无模型；输入是
调用方采集的多个视图读数。为什么调用方采集：产品本身不在这里跑蒸馏，工具只判定"这些读数合起来说明什么"。

### 数据形状

```ts
type ViewUtility = { view: string; injected: number; flippedUp: number; flippedDown: number };
```

字段与产品 `Utility` 同义：`injected` 是看到该规则的次数，`flippedUp/flippedDown` 是其中变好/变坏的次数。
`view` 标签只用于拒绝重复与命名违规，不进入判定。每个视图净增益 `delta = flippedUp - flippedDown`，
`gain = injected === 0 ? 0 : delta / injected`。

### 判定阶梯（顺序即论证）

先按 `views.length < minViews` 判 `insufficient`（没有跨视图一致性可谈）；再按符号计数：
`positive > 0 && negative > 0` → `fragile`（自相矛盾，正是要拒绝的载体）；否则 `negative > 0` → `consistent-harm`；
否则 `positive > 0` → `consistent-help`；否则 `no-signal`。`admit` 仅对 `consistent-help` 为真。

两条关键设计决策，都比表面重要：

1. **净翻转为零的视图是弃权，不是反对。** 一个视图没观察到净变化，只是没有信息，把它算成负会凭空制造
   fragile。因此 fragile 要求正负都存在，零视图只记入 `zero` 计数。
2. **按符号判定，不按幅度。** `gain` 与 `spread` 只上报给 readback、从不做门控。 SPLICE 的结论是关于符号一致
   （有用/有害），引入幅度阈值等于引入一个本语料无法标定的数；这也让三读者可以用整数符号精确复现、无浮点漂移。

### 守卫（refuse rather than default）

`minViews` 必须是 ≥1 的整数；视图标签非空且唯一；`injected/flippedUp/flippedDown` 必须是非负整数；
`flippedUp + flippedDown <= injected`（否则读数不可能是真实结果的描述）。违规抛 `MG_E_CONFIG`，且违规视图名进入
message 而不只在 details——宿主通常只记 message。重复标签被拒，因为一个视图数两次会伪造一致性。

### 确定性与开关纪律

判定不依赖视图到达顺序（计数与总和与顺序无关；`gains` 按输入顺序上报但不参与判定，文档已声明）。默认关闭：
调用方显式调用 `viewConsensus` 才生效，R246 之前所有已提交工件逐字节不变。与 `stateRole` 相同：选项在调用侧，
不在存储侧。

### 三读者契约

fixture `eval/fixtures/view-consistency.json`（7 案例，覆盖五种 verdict）；清单 `eval/manifests/view-consistency.json`
由 `eval/tools/view_consistency.py --verify` 从字节重推导，`--check` 重算清单自身算术（计数和等于 views、
`admit` 与 verdict 一致、verdict 与计数阶梯一致、gains 长度、单视图 spread 为零），`--self-test` 72 条含每个
守卫/篡改/确定性/CLI 分支；`view-consistency-manifest.test.ts` 用产品 `viewConsensus` 推导同一读数逐字段比对，
浮点增益用 1e-12 绝对容差（两种语言都是 IEEE-754 双精度）。任一读者漂移即失败一边、构建停止。

### 门禁

新模块四维 100%；行为 23 测试 + 绑定 8 测试；Python reader 96.7%（self-test+check+verify 合并，覆盖 main 的
argparse 分支）；README core 层 50→51 模块、11,044→11,243 行、adapter 2.6%→2.5%；coupling 267→268 模块、
11 项检查；bundle 不变（模块不在渲染路径）；`--expect-files` 32→33。

## 17.214 R247 — 抽象生命周期：从单条观测到持久化决策的纯函数

**一句话决策，先于论证。** 事件记录（exemplar）永远累积；claim 默认是按需合成、用完即弃的临时 guidance，只有当它
自己的观测结果证明稳定有用才持久化、证明有害则丢弃。理由：Anti-Persistence（arXiv 2610.27406）把负效果的载体
定位在**被持久化的错误抽象**——它经抽象→执行→再抽象自我再生——并实测"保留轨迹、抽象临时化"以最低 LLM 成本换得
更高 held-out 成功率。

### 模块与位置

`packages/core/src/apply/abstraction-lifecycle.ts`，在 `apply` 层——因为它决定什么进入持久记忆，与 `viewConsensus`
（单条稳定性）、`stateRole`（读侧状态）并列，均从 `apply/index.ts` 导出。纯函数，无 clock、无网络、无模型；输入是
单条的 kind 与可选 utility。为什么调用方提供 kind：产品已有 `isEventKind` 作为"什么是记录"的规范判据，本模块复用
同一语义，而不是重新发明一套分类。

### 数据形状

```ts
type AbstractionLifecycleInput = {
  id: string; kind: string;
  utility?: { injected: number; flippedUp: number; flippedDown: number };
};
type Disposition = 'retain' | 'ephemeral' | 'discard';
```

字段与产品 `Utility` 同义。净翻转 `delta = flippedUp - flippedDown`（无 utility 时为 0）。`delta`、`injected`、应用的
`minInjections` 全部上报用于 readback，但**判定只看 delta 符号、kind 与门槛**，不看幅度——与 R246"按符号不按幅度"
同一纪律，也让三读者可以用整数精确复现、无浮点漂移。

### 判定阶梯（顺序即论证）

1. `kind === 'exemplar'` → `retain` / `event-record`。记录不是 claim，两条记录不矛盾，没有可复现的规则。
2. `delta < 0` → `discard` / `harmful-abstraction`，**先于门槛**。错误复现的起点是一条害过一次的规则；量不能赦免它。
3. `delta > 0 && injected >= minInjections` → `retain` / `stable-help`。足够观测见过它有用，取得持久化资格。
4. `delta > 0`（低于门槛）→ `ephemeral` / `insufficient-outcomes`。是提示，不是证据；按需重建，不存。
5. 其余（`delta === 0` 或无 utility）→ `ephemeral` / `no-signal`。无证据持久化。

### 守卫（refuse rather than default）

id 非空字符串；kind 属于 `CLAIM_KINDS ∪ {exemplar}`（与 `isEventKind` 的补集一致）；`injected/flippedUp/flippedDown`
非负整数；`flippedUp + flippedDown <= injected`；`minInjections` 是 ≥1 的整数。违规抛 `MG_E_CONFIG`，违规 id 进入
message 而不只在 details——宿主通常只记 message。未知 kind 被拒，因为把记录误判成 claim（或反之）会静默反转整个
持久化策略。

### 确定性与开关纪律

判定不依赖任何外部状态；同名输入恒等；不修改输入（测试用 `Object.freeze` 验证）。默认关闭：调用方显式调用才生效，
R247 之前所有已提交工件逐字节不变。与 `stateRole`/`viewConsensus` 相同：选项在调用侧，不在存储侧。

### 三读者契约

fixture `eval/fixtures/abstraction-lifecycle.json`（12 案例，覆盖三种 disposition、五种 reason）；清单
`eval/manifests/abstraction-lifecycle.json` 由 `eval/tools/abstraction_lifecycle.py --verify` 从字节重推导，`--check`
重算清单自身阶梯（disposition/reason 属于闭集、kind/delta/门槛唯一决定判定），`--self-test` 66 条含每个守卫/
篡改/CLI 分支；`abstraction-lifecycle-manifest.test.ts` 用产品 `abstractionLifecycle` 推导同一读数逐字段比对。
全整数或字符串字段，无浮点比较（不同于 R246 的 gain）。任一读者漂移即失败一边、构建停止。

### 门禁

新模块四维 100%；行为 22 + 绑定 14 测试；Python reader 97.8%（self-test+check+verify 合并，覆盖 main 的 argparse
分支），self-test 66/66；README core 层 51→52 模块、11,243→11,425 行；coupling 268→269 模块、11 项检查；bundle
不变；`--expect-files` 33→34；全量 `pnpm check` 退出码 0。

## 17.215 R248 — 竞品领域门：以"测量单位"而非系统名判定归属

**一句话决策，先于论证。** 一个系统/榜单属于哪个领域，取决于它的数字是"记忆开/关的增益"还是"某垂域任务的绝对成绩"；前者是 microglia 的战场，后者归 nl2charts。理由：用户第 7、8 问确立 scope——microglia 通用地专注于"通过记忆与经验提高任务成功率"，是 nl2charts 的能力放大器，绝不耦合 NL2SQL/chart/data-viz。

### 模块与位置

`packages/core/src/apply/competition-domain.ts`，在 `apply` 层——与 `viewConsensus`/`abstractionLifecycle`/`stateRole` 并列，从 `apply/index.ts` 导出。纯函数，无 clock/网络/模型；它分类一个"描述"，不抓取、不打分任何系统。为什么调用方提供描述：领域判据依赖数字的测量单位，这个信息在榜单表格里没有，必须随读数一起声明。

### 数据形状

```ts
type DomainCandidate = {
  name: string;
  measures: readonly string[];   // 闭集 ASCII 信号标签，大小写不敏感
  artifact: 'memory-pack' | 'sql-query' | 'chart' | 'visualization' | 'report' | 'other';
  unit: 'memory-gain' | 'absolute-task-score' | 'unknown';
};
```

判定先看 `unit`，信号计数仅在 `unknown` 时兜底；报告 `verdict`/`reason`/`amplifierRole`/`memorySignals`/`hostSignals`/`name`/`unit`，全整数或字符串/布尔，无浮点——三读者可用整数精确复现。

### 判定阶梯（顺序即论证）

1. `unit === 'memory-gain'` → `memory` / `measured-memory-gain`。记忆开/关增益是 microglia 的单位，无论在哪测的。`amplifierRole = hostArtifact || hostMeasureSignals > 0`：在宿主场景内测的，microglia 是放大器。
2. `unit === 'absolute-task-score'`：host 测量信号 → `host`/`host-task-score`；否则仅 host 产物 → `host`/`host-artifact`；否则记忆信号 → `memory`/`memory-benchmark`；否则 `other`/`no-signal`。
3. `unit === 'unknown'`：两类信号都有 → `ambiguous`/`mixed-signals`（拒绝猜测）；仅记忆 → `memory`；仅 host → `host`；都无 → `other`。

**关键设计决策，比表面重要：** **平局判 ambiguous，不自动归类。** 自动归类会用"哪个标签先命中"决定领域，那正是把 BIRD 成绩偷偷提升成 microglia 竞品的机制。拒绝猜测让边界成为一个可证伪的命题，而不是一句声明。第二个决策：`hostSignals` 报告值包含 artifact（host 产物算一个 host 信号），但 `reason` 区分"测到的 host 成绩"与"host 形态产物"——清单不携带 artifact，所以这一细分由 `verify()` 对 fixture 字节负责，`check()` 只重加可由 unit+计数判定的 verdict 阶梯。

### 守卫（refuse rather than default）

name 非空；measures 是数组且元素均为字符串；artifact/unit 属闭集。违规抛 `MG_E_CONFIG`，违规候选名进入 message 而不只在 details。任一守卫默认放行都会把候选悄悄归到 `other`，看起来像一次诚实分类——这是最危险的失败模式，所以全部拒绝。

### 确定性与开关纪律

判定不依赖外部状态；同名输入恒等；不修改输入（`Object.freeze` 验证）。本模块是库辅助判据，不在渲染路径，bundle 不变。它不 declaring 任何存储变更，所有已提交工件逐字节不变。

### 三读者契约

fixture `eval/fixtures/competition-domain.json`（11 个真实候选：AskData/GrainSQL on BIRD、Mem0/Mastra on LongMemEval、microglia 在 SQL 宿主内、混合信号、无标签系统）；清单 `eval/manifests/competition-domain.json` 由 `eval/tools/competition_domain.py --verify` 从字节重推导；`--check` 重加 verdict 阶梯；`--self-test` 59 条含每个守卫/篡改/CLI 分支；`competition-domain-manifest.test.ts` 用产品函数推导同一读数逐字段比对。任一读者漂移即失败一边、构建停止。

### 门禁

新模块四维 100%；行为 22 + 绑定 14 测试；Python reader 96.0%（self-test+check+verify 合并），self-test 59/59；README core 层 52→53 模块、11,425→11,636 行；coupling 269→270 模块、11 项检查；bundle 不变；`--expect-files` 34→35；全量 `pnpm check` 退出码 0。

## 17.216 R249 — 修订完整性门：从站点状态到裁决的纯函数

**问题定义。** 给定一次修订（retract 或 correct）以及每条声明所在站点的处理方式，判定这次修订是否真正覆盖所有
副本、方法是否匹配意图。输入不含模型、不含时钟、不含网络；输出是可被两个独立读者重算的读数。

**输入模型。** `RevisionInput = { id, intent, sites[] }`；`intent ∈ {retract, correct}`；每个
`RevisionSite = { id, kind, state }`，`kind ∈ {source, summary, fact-key, embedding, citation}`（闭集），
`state ∈ {live, augmented, tombstoned, purged}`（闭集）。`live` 未触碰、仍带旧值；`augmented` 保留原文并附加
事实/键；`tombstoned` 标记撤回、检索时排除；`purged` 字节移除。

**裁决阶梯（严格优先级）。**

1. `retract` 且存在 `augmented` 站点 → `residual` / `augment-retains-claim`，`residualSites = live + augmented`。
   附注：augment 保留原值，撤回后该声明仍会浮出；这是比泛化 live 更具体的发现，故先判。
2. 存在任意 `live` 站点 → `residual` / `live-site`，`residualSites = live`。覆盖先于方法。
3. `correct` 且无 `source` 站点 → `method-violation` / `no-source-to-augment`。
4. `correct` 且 source 的 state ≠ `augmented` → `method-violation` / `replace-drops-provenance`（LongMemEval 的
   替换损失：0.530 vs 0.644）。
5. 其余（通过覆盖与方法）→ `complete`：`allPurged` 为 `full-purge`；`correct` 为 `augmented-and-covered`；
   否则（撤回全 tombstoned）为 `tombstone-coverage`。

**不变量与守卫。** 四种 state 计数恒等于 `siteCount`；`residualSites > 0` 当且仅当 reason 属于
`{live-site, augment-retains-claim}`。守卫拒绝：空白修订 id、未知 intent、非数组/空 sites、空白/重复 site id、
未知 kind/state——一律 `MicrogliaError(MG_E_CONFIG)` 而非默认归类。函数不修改输入（冻结对象测试通过）。

**依赖分层。** `apply/revision-integrity.ts` 只依赖 `kernel` 的 `MicrogliaError`，与 `view-consistency`、
`abstraction-lifecycle`、`state-role` 同为 core 层叶子，经 `apply/index.ts` 对宿主导出；不在渲染路径上，bundle 不变。
它审计调用方**描述**的修订，不编辑 store、不取数——与 microglia 作为通用记忆放大器、不耦合垂域的定位一致。

**三读者契约。** fixture 十一条真实修订形状 → 产品函数与独立 Python reader 各自从字节推导 → manifest 逐字段钉住
（`revision-integrity-manifest.test.ts` 字段比对；`revision_integrity.py --check/--verify/--self-test`）；CI 在 coverage
下跑 Python 三模式，`--expect-files` 35→36。新模块 TS 四维 100%，Python 语句 100%/分支 99%。

**接线点。** R104b 的模型 proposer 产出候选后，先过 `viewConsensus`（单条是否稳定）→ `abstractionLifecycle`
（是否持久化）→ witness；而撤回/纠正动作在落库前过本门，确保 `residualSites == 0` 且 verdict 为 complete 才提交。
这样"产品侧自动使用测评侧最优配置"由机器判据保证，而非文档承诺。

## 17.217 R250 — 陈旧撤销门：从新证据与检索集到裁决的纯函数

**问题定义。** 给定一条新证据与当前检索集，判定新证据所隐含的失效是否已把旧记忆从检索集清走、方法是否匹配
证据关系。输入不含模型、时钟、网络；输出是可被两个独立读者重算的读数。它补 R249 的缺口：R249 管显式修订，
本门管没人发撤回的隐式失效——TEPA 实测这正是 append-only 低于无记忆基线的根因。

**输入模型。** `StaleRevocationInput = { id, evidence, items[] }`。`evidence = { id, key, relation, serial,
invalidates? }`，`relation ∈ {extend, co-reference, propagation}`（闭集）；`invalidates` 只在 propagation 允许、
非空元素不可为 evidence.key。每个 `RevocationItem = { id, key, serial, disposition }`，`disposition ∈
{active, revoked, superseded}`（闭集）。`active` 仍暴露、`revoked` 标记撤回、`superseded` 被新值替换。

**派生集合。** current = 与 evidence 同 key 且同 serial 的项。stale = 与 evidence 同 key 且 serial 更小（extend
关系不产生 stale）+ propagation 下 key ∈ invalidates 的任意项。stale 项 disposition 为 active 即"暴露"；否则为
"已处理"。`staleCount = activeStaleCount + handledStaleCount` 是不变量。

**裁决阶梯（严格优先级）。**

1. 任意 stale 项 active → `polluted`。若其中含 invalidated key 的项 → reason `propagated-still-active`（更具体），
   否则 `stale-still-active`；`activeStaleCount` 两者都计。
2. current 项存在但都不 active → `over-revoked` / `current-removed`（违反 TEPA key-current assumption：撤销必须
   保留当前正确值）。
3. 无 current 项 → `unresolved` / `no-current-evidence`。
4. 其余 → `clean`：extend 为 `extend-safe`；co-reference 为 `co-reference-resolved`；propagation 为
   `propagation-resolved`。

**不变量与守卫。** 四种计数非负整数；stale 严格分区；verdict/reason 家族一致；propagationKeys > 0 仅当 relation
为 propagation。守卫拒绝：空白 episode id、非对象 evidence、空白 evidence id/key、未知 relation、负或非有限
serial、非数组 invalidates、空白 invalidated key、invalidated key 等于 evidence key、非 propagation 带 invalidates、
非数组/空 items、非对象 item、空白/重复 item id、空白 item key、非法 item serial、未知 disposition——一律
`MicrogliaError(MG_E_CONFIG)` 而非默认归类。函数不修改输入（冻结对象测试通过）。

**依赖分层。** `apply/stale-revocation.ts` 只依赖 `kernel` 的 `MicrogliaError`，与 `view-consistency`、
`abstraction-lifecycle`、`revision-integrity`、`state-role` 同为 core 层叶子，经 `apply/index.ts` 对宿主导出；
不在渲染路径上，bundle 不变。它审计调用方**描述**的 episode，不编辑 store、不取数——与 microglia 作为通用记忆
放大器、不耦合垂域的定位一致（R248 领域门机器校验）。

**三读者契约。** fixture 十一条真实 episode → 产品函数与独立 Python reader 各自从字节推导 → manifest 逐字段钉住
（`stale-revocation-manifest.test.ts` 字段比对；`stale_revocation.py --check/--verify/--self-test`）；CI 在 coverage
下跑 Python 三模式，`--expect-files` 36→37。新模块 TS 四维 100%，Python 语句 100%/分支 99%。

**接线点。** R104b 的模型 proposer 产出候选后，先过 `viewConsensus`（单条是否稳定）→ `abstractionLifecycle`
（是否持久化）→ witness；显式撤回/纠正动作在落库前过 `revisionIntegrity`（residualSites == 0）；新证据写入后、
检索集交给模型前过本门，确认 `activeStaleCount == 0` 且 verdict 为 clean（或接受 extend 的合法共存）才进入检索。
这样"产品侧自动使用测评侧最优配置"由机器判据保证，而非文档承诺。
