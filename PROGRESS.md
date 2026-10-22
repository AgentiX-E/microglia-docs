# Progress tracking

A running log of iterations: what changed, what evidence it produced, and what is left. Newest last.
An iteration is only recorded as closed when its CI is green and its artefacts are committed.

## Where the project stands

| Stage | State | Blocking item |
|---|---|---|
| S0 Mechanism | **closed** | — |
| S1 Host shadow (nl2charts) | not started | needs the private adjudicated set (n=1,300, κ≥0.7) |
| S2 Public benchmarks | **four reads: no benefit** (−2.84, −1.14, −0.57, −0.28pp); controls show the pack is inert | the knowledge that transfers is convention, which this benchmark has none of |
| S2b Convention transfer | **first positive read**: +4.79pp (p=0.0156) on a rule the schema cannot reveal | replication; 44% of the stated ceiling is the gap to close |
| S3 SOTA push | stopped on BIRD; starts only after S2b moves accuracy | — |

## Iteration log

### 1 — Repository split

`AgentiX-E/microglia` now carries the code and the external documentation; `AgentiX-E/microglia-docs`
carries the internal documents. The split is by audience, not by secrecy: the user guide, architecture
note, and glossary are for a consumer of the packages, and they live beside the packages so a version
of the docs always matches a version of the code.

**Evidence.** `master` at `1e59e25`; `ci` and `poc-live` green on that commit.

### 2 — Coverage from 92.7% to 100% lines, 99.5% branches

Every dimension is now held to 95%. The work was not "add tests until the number moves": each gap was
a question about behaviour, and three of them turned into code changes rather than tests.

| Change | Why |
|---|---|
| `resolveDomain` / `resolveRegistry` validate a domain pack's schema | the generator used to `continue` past a malformed domain, so a broken pack looked like a smaller corpus |
| `pickGeneralizationTarget` selects only an active sibling | widening onto a candidate promoted a claim that had not earned admission |
| The second budget pass was removed and replaced by a proved bound plus an explicit size limit | its body was unreachable, so the "exact budget" guarantee had never been exercised |
| `outranks` replaces sort-then-index in the reader | the winner is a maximum; the sort and the index check were both unnecessary |
| `diversity` became an option on `buildPack` | the ablation needed a switch that a host can also use |

**Evidence.** 370 tests; `100 / 99.53 / 100 / 100`; the seven uncovered arms are named with their
reasons in the technical design §10.3.

### 3 — A defect the budget invariant found

`makePack` returned every candidate alongside the rendered ids, so a pack could claim rules the prompt
did not contain. The study's reader believed `items`, and the `narrow-budget` arm was reporting 100%
accuracy on an empty block.

| Before | After |
|---|---|
| `narrow-budget` 100.00% | 31.79% (the baseline) |
| the budget appeared not to matter | 400 characters is the binding threshold |

**Evidence.** `packages/apply/src/__tests__/budget.test.ts` sweeps 64 budgets and asserts
`items.length === ids.length`, that every id appears in the rendered block, and that an empty block
returns nothing. Gate G15 now measures the pack layer's contribution as −68.21pp.

### 4 — Three micro-ablations, because two arms measured nothing

The `no-credit` and `no-contradiction` arms both report no change, which is correct and useless: a
clean corpus never cites a rule enough times to trigger credit, and never holds two conflicting
claims. Three targeted experiments replace the non-result.

| Module | With | Without |
|---|---|---|
| Credit assignment | withdrawn after 4 failures | still injected |
| Contradiction resolution | 1 active, 429 chars | 2 active, 717 chars |
| Diversification | 4 distinct of 4 | 1 distinct |

**Evidence.** `packages/eval/src/ablations.ts`; gates G12–G14 assert each result; the report renders the
table from the artefact.

### 5 — Cortex conformance against a real build

The adapter shipped with a structural copy of cortex's `MemoryValue` because the packages are not
published. That copy is now checked against reality: the `cortex` workflow clones cortex, builds it,
and compares field sets.

**Evidence.** `cortex` workflow green at `c75552a`; `scripts/cortex-conformance.mjs` reports
`12 fields matched`. **Action item (highlighted):** replace the clone with a normal dependency and the
structural copy with `import type` as soon as `@agentix-e/cortex-*` is published.

### 6 — Public benchmark lane

`poc/sota-bird.ts` runs BIRD Mini-Dev with two arms on the same questions: no memory, then a pack
learned from a disjoint half. Execution accuracy is computed by running both the predicted and the
gold SQL through `node:sqlite` and comparing result multisets — the standard EX metric, with no
dependency added.

Three attempts were needed to make the lane run at all, and the third one is the honest state:

| Attempt | Failure | Fix |
|---|---|---|
| 1 | 404 on a hard-coded archive name | try known names in order |
| 2 | 404 on both known names | ask the dataset API for its file list and try every archive it lists |
| 3 | the dataset API answered: the repository holds `.gitattributes`, `README.md`, and three sharded question files — **no databases** | accept a pinned archive (`BIRD_ARCHIVE_URL`) and say so plainly |

The third run settled the question the first two raised. BIRD Mini-Dev's Hugging Face repository is a
question bank; the SQLite databases are distributed separately. A lane that needs execution accuracy
therefore needs one piece of setup — upload the complete package as a release asset and set the
`BIRD_ARCHIVE_URL` variable — and until then the lane fails with the file list rather than a stack
trace. That is the correct state: the harness is proven, the data is missing, and the message says
which.

What is proven today: the harness executes end to end, and a missing dataset produces a named error
with the list of what the host actually offers, not an empty result. What is not proven: any accuracy
number. The lane is scheduled weekly and on demand, and it is deliberately not a merge gate — at n=60
the 95% interval is roughly ±13pp, and a flaky gate is worse than no gate.

### 7 — A competitor baseline, measured on the same corrections

The whitepaper claimed that memory products stop at recall. That claim was asserted, not measured, so
the competitor shape was implemented: extract a fact, dedupe at 0.8 Dice, retrieve the closest
sentence above a 0.2 overlap floor, apply its answer.

| Store | Accuracy | Δ vs no-memory |
|---|---|---|
| no memory | 31.79% | — |
| fact store | 56.07% | +24.29pp (p = 2.5e-06) |
| fact store + same poison | 19.64% | −12.14pp |
| **full (this library)** | **100.00%** | **+68.21pp** |

Two findings, one of them uncomfortable for the competition and one useful for us: memory alone is
worth +24.29pp, so the product competes with something real; and the guard is worth more than the
retriever, because without it the same attack takes a store *below* having no memory at all.

**Evidence.** `packages/eval/src/competitor.ts`, gates G16 (≥10pp over the fact store) and G17 (poison
damages it), and a section in the rendered report.

### 8 — The public-benchmark lane runs, and finds two of its own bugs

Assembling BIRD from the two repositories that hold its halves worked on the third attempt: questions
from `bird_mini_dev`, the eleven SQLite databases from `bird-critic` (as `<db>_template.sqlite`), 102
model calls, 100% parse and execution rates. Two defects surfaced only because the lane actually ran:

| Defect | Symptom | Fix |
|---|---|---|
| The distiller aborted on one bad model response | `MG_E_INVALID_SIGNAL: LLM response is not JSON` killed a batch of thirty lessons | `DistillReport.failed` counts the event and continues; `strict: true` restores fail-fast |
| A model-derived claim was pinned to the model floor | 27 lessons distilled, **0 active**, empty pack — yet the arm reported **+6.67pp** | a claim inherits the trust of the event behind it (0.95 for an execution-verified correction), and the lane refuses to report a delta when the memory arm injected nothing |

The second one is the important one: the lane had produced a publishable number that measured
run-to-run noise. An instrument that cannot tell "the memory did nothing" from "the memory helped"
is worse than no instrument.

### 9 — First public-benchmark read (n = 30)

With the fixes in place the memory arm is real: 18 active rules, 0.5 rules injected per question.

| Arm | Execution accuracy | n |
|---|---|---|
| no memory | 50.00% | 30 |
| with memory | **53.33%** | 30 |

**+3.33pp**, parse rate 100%, execution rate 100%, 102 calls, 1.4 s p50 per question.

What this is: the first evidence that the loop helps a real model on a public benchmark, on held-out
questions of the same databases. What it is not: a result. At n=30 the 95% interval on a difference is
roughly ±17pp, and the pack carried half a rule per question because thirty corrections can only teach
a few general lessons. S2 needs n=600 for a 5.8pp effect — the power analysis is in the roadmap, and
the lane is one input away.

### 10 — External documentation

`README.md`, `docs/USER-GUIDE.md`, `docs/ARCHITECTURE.md`, `docs/GLOSSARY.md` in English, written for
someone who has never heard of the project: install, five-minute integration, every feedback kind,
the trust table, the lifecycle diagram, failure modes, performance, and two extension recipes.

**Evidence.** `pnpm audit:repo` asserts all four exist; the audit also rejects non-English text in code,
`TODO` markers, coverage suppressions, `any`, skipped or focused tests, runtime dependencies in a
package manifest, and workflow soft-failures.

### 11 — Cross-fitting, a frozen pack, and a negative result

The lane had produced a publishable-looking +3.33pp at n=30 from a half split. Three things were wrong
with the instrument, and fixing them changed the sign of the answer.

| Defect | Why it mattered | Fix |
|---|---|---|
| The learning pass compared result sets only | a generation that never executed was recorded as correct whenever gold returned zero rows — the worst failures taught nothing | correctness = executable ∧ equal multiset |
| The evaluation arm recorded a correction per question | the store under measurement grew while it was measured | evaluation is read-only; the pack is fingerprinted before and after, and a change aborts the run |
| The interval was a constant ±13pp | independent of n, so it could not be right at any n | 10,000-resample seeded bootstrap + minimum detectable difference from the observed discordance |

The protocol also changed from one half split to **k-fold cross-fitting**: every usable question is
evaluated exactly once, by a memory that learned from the other folds. That doubles the usable sample
for the same number of model calls, and it removes file order as a confounder (the slice is now
interleaved across databases rather than `slice(0, limit)` over a database-sorted file).

Five instrument gates now precede accuracy (TECH-DESIGN §11.5): non-empty pack, exact fold partition,
parse rate, gold executability, and resolution.

**The measurement (run `39390556532`, 1h42m, 2,760 calls, n=352):**

| Arm | Execution accuracy |
|---|---|
| no memory | 54.83% |
| with memory | 51.99% |

−2.84pp, 95% CI [−6.25, +0.57], p = 0.143, 24 lost against 14 gained, no fold positive, 2.25 rules
injected per question, 216.8 active rules per fold. All five gates passed; resolution 4.91pp.

The n=30 number is retracted as noise with a favourable sign. The honest reading is that distilled
schema-level lessons do not help a strong model on this benchmark, and may cost ~3pp — consistent with
POC-2, where generic chart knowledge was worth −2.38 to 0pp while organisation-specific convention was
worth +75 to +89pp. BIRD has no organisation-specific convention to learn; its DDL is already in the
prompt.

**One defect the run exposed:** 166 of 642 distillation calls (25.9%) failed to parse, so the pack was
built from a biased three quarters of the corrections. Under test in iteration 12.

**Evidence.** `poc/results/poc-sota-bird.json` (per-case rows, per-fold table, gates, every stored
rule), `sota` workflow `39390556532`; `packages/eval/src/protocol.ts` with 11 unit tests; coverage
100 / 100 / 100 / 99.44 over 391 tests.

### 12 — Controls: the pack is inert, not wrong

A negative delta has four explanations and they imply different repairs. One run, five arms, one
protocol (n=352, 5 folds, 3,813 calls, 1h59m, run `39406533126`).

| Arm | Accuracy | Δ vs none | p | rules/question |
|---|---|---|---|---|
| none | 53.69% | — | — | 0 |
| full | 52.56% | −1.14pp | 0.572 | 2.28 |
| duplicate (same pack twice) | 51.42% | −2.27pp | 0.200 | 2.28 |
| wrong-scope (another database's rules) | 52.27% | −1.42pp | 0.383 | 2.38 |
| oracle (gold SQL as the only convention) | **84.66%** | **+30.97pp** | <1e-4 | 1 |

Three findings, in order of how much they constrain the product:

1. The channel works: one injected statement lifts the model by 31pp. The pack is read, not ignored.
2. Content does not separate the arms: right rules, wrong rules and doubled rules are
   indistinguishable. That is the signature of knowledge the model does not need.
3. Length is not the driver: doubling the text moves the estimate by ~1pp, inside the interval.

Per-rule attribution (`poc/results/poc-sota-attribution.json`): of 445 rules ever injected, 34 harmed,
27 helped, **384 changed nothing**; 10.0% of injections belong to a harmful rule. Retiring every bad
rule would touch a tenth of the injections, so "the distiller writes wrong facts" is not the story.

The three measurements in this document now agree on one boundary condition: knowledge must encode
something the model cannot derive from its prompt. Generic chart knowledge −2.38 to 0pp (POC-2),
organisation-specific convention +75 to +89pp (POC-2), synthetic transfer +68.21pp (POC-0), public
schema prose ~0pp (here).

**Two defects this iteration found and fixed**, both of which had made a control lie:

| Defect | Symptom | Fix |
|---|---|---|
| A control that rendered an empty block | the 400-character "narrow" arm reported 0.00 rules per question and looked like evidence of no dilution | the arm duplicates the pack instead, and gate V6 refuses a run in which any configured control injected nothing |
| A gate that could not fail | the pack-freeze check was listed as a gate while being enforced by an exception | moved to `assertions`, where the digests are recorded |

**Still open.** 165 of 641 distillation calls (25.7%) return non-JSON and are dropped, unchanged by a
larger token budget — the failure is not truncation. The next round records the reply prefix.

**Evidence.** Run `39406533126`, artefact `poc/results/poc-sota-bird.json`, attribution
`poc/results/poc-sota-attribution.json`, 396 tests, coverage 100 / 100 / 100 / 99.44.

### 13 — A gate that removes nothing, and a parser bug that removed a quarter

**Hypothesis.** If the pack is inert because it is injected whether or not it is relevant, a relevance
floor is the repair. The coverage distribution supported it: the median pack covered 7.1% of its
question's content words and 47% of packs covered none.

> **Correction (iteration 20).** Those two numbers are the **40-question smoke run's**, not the 352-question
> run's. Recomputed from the committed artefact: median **18.2%**, zero-overlap **3.1%**. The hypothesis this
> iteration acted on was therefore built on a misread distribution, and the alias it motivated is rejected.

**Result** (run `39436660082`, n=352, 1h56m, 3,475 calls):

| Arm | Rules/question | Accuracy | Δ | p |
|---|---|---|---|---|
| none | 0 | 54.55% | — | — |
| full | 2.27 | 53.98% | −0.57pp | 0.871 |
| gated (≥1 shared word) | 2.06 | 54.26% | −0.28pp | 1.000 |
| oracle | 1 | 84.38% | **+29.83pp** | <1e-4 |

The floor removed almost nothing (2.27 → 2.06) because a pack whose first rule shares no word can still
hold a second that does, so the delta did not move. Gating is not the lever.

**Four reads of one hypothesis** now stand at −2.84, −1.14, −0.57, −0.28pp, every interval containing
zero, while the instrument improved each time. That is a null effect measured better, not a result
waiting for a bigger sample.

**Two defects, both found by instruments rather than by inspection:**

| Defect | How it surfaced | Fix |
|---|---|---|
| The distillation parser accepted one of the four shapes models actually return | recording the reply prefix after a 25.7% failure rate survived a larger token budget | `parseCandidates` accepts a wrapped object, a bare array, a single candidate, and repairs control characters and trailing commas without altering a valid document |
| A coverage floor of 0.34 emptied every pack | gate V6 refused a run in which the control injected nothing | the floor was set from the measured distribution (0.01 = one shared word), and the guide now states the distribution instead of a guess |

**Measured on the fix**, two 40-question runs with only the parser and the distillation prompt changed:
25.7% of corrections lost → 10.0% (four shapes accepted) → **5.0%** (two candidates, 2,000 tokens).
The last two failures are truncations, which need a salvage pass rather than another format. The delta
still has to be re-measured with the corrected knowledge; the accuracy numbers above predate the fix.

**Evidence.** `poc/results/poc-sota-bird.json`, `poc/results/poc-sota-attribution.json`, 410 tests,
coverage 100 / 100 / 100 / 99.44, `pnpm audit:repo` ok.

## What is left, in order

1. **S2b, convention transfer** — replicate the +4.79pp read, then close the gap to the stated ceiling
   (+10.96pp): the learned pack carries 2.08 rules per question and 189.6 are active, so the question
   is whether retrieval finds the one that applies.
2. **Re-measure the parser fix**: the corrected parser changes which corrections become rules, so the
   failure rate and the delta both need one more read before either is quoted.
3. **S2 at power, if needed**: Mini-Dev caps at 352 usable questions (4.9pp resolution); BIRD dev
   (1,534 questions over the same 11 databases) fixes the sample, not the mechanism.
4. **S1**: instrument nl2charts behind a flag, adjudicate 1,300 cases, run the three modes. Gate:
   +3pp top-1 (p<0.05), SQL regression ≤1pp, knowledge precision ≥85%.
5. **Cortex release**: swap the clone lane for the published package (W1).
6. **vitest 4 migration** once vite 7 is the toolchain default (W2).

Nothing on this list blocks the S0 result, and none of it is hidden behind the green build: each item
is either an experiment that has not run or a dependency that has not shipped.

### 14 — Three packages: library, server, client

The capability split (`core → memory → distill → apply → capture`) was a chain with one consumer per
link. Every host installed all five; every release carried five manifests and five tsconfigs; and no
boundary was ever exercised by a second implementation. It is now split by **deployment**:

| Package | Contents | Runtime deps |
|---|---|---|
| `core` | kernel, memory, distill, apply, capture, providers — with subpath exports | **none** |
| `node` | Hono routes, server bootstrap, DeepSeek and Zhipu providers, cortex projection | `hono` |
| `browser` | recall and feedback client, outbox that survives a reload | **none** |
| `eval` | the benchmark instrument; private, never published | none |

**Decisions taken with the owner:** the domain pack leaves the product (the host owns its domain; the
chart pack the benchmark scores moved to `eval/src/workload`), `eval` stays a private workspace, and
`node` may depend on a router as the single named exception.

**What the exception costs.** `scripts/audit.mjs` used to forbid every external runtime dependency.
It now carries an allowlist with exactly one entry: `packages/node/package.json` may depend on `hono`
and `@hono/node-server`, and nothing else, anywhere. A second dependency is a line of code in the
audit rather than a surprise in a lockfile.

**What was added, not just moved:**

- `core/providers` — `LlmProvider` and `EmbeddingProvider` (one method each) plus a registry that
  resolves an instance, then a registered factory, then a named error. No default provider: a library
  that silently reads an environment variable produces a stack trace three layers from the mistake.
- `node` — five endpoints (`/v1/feedback`, `/v1/recall`, `/v1/distill`, `/v1/knowledge`, `/v1/health`),
  bearer auth, an idempotency key whose map is honestly documented as per-process, and a status for
  every named library failure.
- `browser` — the outbox. A correction is queued before it is sent, because the one thing a tab must
  not lose is the correction the user just made. Storage failures degrade to memory instead of
  throwing; recall is never queued, because stale knowledge is worse than none.

**Evidence.** 448 tests (was 410), coverage **99.77 / 99.77 / 100 / 98.42**, `pnpm audit:repo` ok,
`ci` green on `e8f495b`, `poc-live` green, and an end-to-end test that runs the real browser client
against the real Hono server over a socket — including the offline-then-flush path and a retried
idempotency key.

**Kept, deliberately.** The cortex projection moved into `node` rather than disappearing: it is the
only check that the projection still matches cortex's shape. The W1 action item is unchanged and
still highlighted — when `@agentix-e/cortex-*` publishes, the structural copy becomes `import type`
and the clone-and-build lane becomes a normal dependency.

**S2b status, honestly.** The convention lane ran at n=49 and failed its channel gate: the oracle arm
injected the expected value and moved accuracy by 0pp, so V7 refused the run. The subset was mostly
counts divided by 1,000 (7 → 0.007), which is a convention the model will not infer from a hint of
"0.007", and the harness records no per-arm SQL to explain the refusal. The protocol is not ready;
the gate that caught it is working as designed.

### 15 — A convention the schema cannot reveal: the first positive read

The four previous reads said the same thing: on knowledge the model can infer, the pack is inert. This
one gives the loop something it cannot infer — the workspace reports every numeric answer rounded to
the nearest ten — and the loop moves.

| Arm | Accuracy | Δ vs none | 95% CI | p |
|---|---|---|---|---|
| none | 6.85% | — | — | — |
| **full (learned)** | **11.64%** | **+4.79pp** | [+1.37, +8.90] | **0.0156** |
| stated (rule in prompt) | 17.81% | +10.96pp | [+6.16, +16.44] | 0.0001 |
| oracle (value in prompt) | 9.59% | +2.74pp | [+0.68, +5.48] | 0.125 |

n=146 (of 352 questions with a single numeric answer), 5 folds, 1,715 calls, 42 minutes, 189.6 active
rules per fold, 2.08 rules per question. **7 questions gained, 0 lost.**

**Three readings.**

1. The loop transfers a convention it was never told: +4.79pp on held-out questions, no losses.
2. It recovers **44%** of what stating the rule is worth (+4.79 of +10.96pp). The gap is the measure of
   what distillation loses, and the number to attack next.
3. **Rules are followed, values are not.** The accepted answer written into the prompt moved accuracy
   by 2.74pp, not significantly; the rule moved it by 10.96pp. A lesson has to be a rule about how to
   answer, not an answer.

**Two instrument bugs this run found.** V6 asked the `stated` arm for rules-per-question when that arm
injects a sentence and no pack, so it failed a sound run; it now covers only the controls that
retrieve. And the first convention — thousands — produced expected answers like `0.007` for counts,
which is not a convention any model can act on; the lane now carries two conventions and picks the
subset by a rule (`|value| ≥ 1000` for thousands, everything for `round10`).

**Replication, and what it changes.** A second run of the same protocol (n=146, same folds) gave
**+2.05pp [0.00, 4.79], p=0.250**, with 3 gained and 0 lost; the stated ceiling reproduced at
+11.64pp and the value arm at +2.74pp. Across both runs: **10 questions gained, 0 lost**, pooled
+3.42pp. The direction is stable; the magnitude is not. The honest summary is that the loop recovers
**roughly a quarter to a half of what stating the rule is worth**, and that the ceiling (11–12pp) is
the stable number, not the effect.

**Evidence.** Run `39548548865`, artefact `poc/results/poc-sota-bird.json`, gates V1–V7 with the V6 fix
in `f5b53b4`.

### 16 — Design phase: the pipeline, stage by stage

The question this iteration answers is not "does it work" (that is §12) but "what exactly happens, what
does it cost, and how would anyone know it worked". The answer is §17 of the technical design: eight
pipeline stages (P0 ingest → P8 serve), each with a data contract, an algorithm, the failure modes it
must survive, a metric table with thresholds, and the POC that settles whatever number we do not have.

**What changed in the design, and why.**

| Decision | Evidence that forced it |
|---|---|
| A **task instance** (taskId, taskType, attempt, parentRunId, terminal status) replaces session-only grouping | The distiller can only see adjacent edits today, which is why the convention lane recovers 2–5pp of an 11–12pp ceiling |
| Feedback carries a **typed, redacted, capped context** | Without it a correction cannot say "in which workflow and under what conditions" |
| Distillation gains **pair contrast** (first wrong vs accepted) | ExpeL: insights from success/failure pairs transfer (FEVER 63→70) where single-trajectory insights do not |
| Contradiction becomes a **validity interval** | Graphiti's source: `valid_at` / `invalid_at` / `expired_at`, invalidation by interval geometry, no similarity threshold; status-only demotion cannot answer "what was true then" |
| A **curation** stage with per-item utility counters and delta updates | ACE: itemized bullets with helpful/harmful counters, periodic curator, context collapse as the measured failure mode |
| Retrieval gains taskType/stage scoping, an over-fetch of `max(4k,60)` and an `explain[]` | 47% of our packs shared no word with the question *(corrected in iteration 20: the real figure is 3.1%)*; mem0 ships `max(limit*4,60)` |

**Competitor source, read rather than summarised.** mem0 `main.py`: a top-10 semantic candidate set,
MD5 exact dedupe, entity cosine 0.95, identity keys stripped from caller metadata, search threshold 0.1.
Graphiti `edge_operations.py`: hybrid RRF recall, LLM dedupe over paired endpoints, temporal
invalidation, no hardcoded similarity threshold. Both are cited in §17.5–§17.7 and §17.14, with the
alternatives we rejected and why.

**What is frozen.** `AgentiX-E/microglia` is untouched by this iteration; §17 describes mechanisms that
do not exist yet, and says so at the top. The fourteen POCs (POC-13…POC-26) are specified but not run:
running them against a design would measure the design's absence.

**Evidence.** `TECH-DESIGN.md` §17–§19; `ROADMAP.md` design-phase entry; competitor sources and papers
named inline.

### 17 — Audit pass 2: what pass 1 got wrong, and the twelve gaps it hid

The question was not "is the design good" but "would an implementer have to guess anywhere". Reading §17
against that standard, three claims failed (§17.17 of the technical design): metric tables existed per
stage but there was **no end-to-end number and no token budget**; the alternatives table mixed *rejected*
with *still open*; and three open questions had no POC at all.

**Two sources read this pass changed the design, not just the prose.**

| Source | What it forced |
|---|---|
| **MemForm** (2026) | A memory that *forms rules from experience* has five attack routes — content, evidence, **scope**, selection, path — none of which is "store a false record". The best of five defences cut attack success by only 8.2 points. Our pipeline had one screen, at render time, which assumes the store is trustworthy |
| **ALTK-Evolve** (IBM, 2026) | The closest published implementation of this mechanism: τ²-retail pass^4 **57.5% → 67.5%**, no weight updates, rules appended to the prompt. Its ablation also shows guidelines kept from **≥3 distinct tasks** beat a larger rule set on airline pass^4 (45.0 vs 40.0) |

That second row settles a question the design had been treating as bookkeeping: whether evidence from
many attempts of one task counts like evidence from many tasks. It does not — and the fix (count support
over distinct tasks) is what makes a single stubborn user unable to admit a rule alone.

**Twelve gaps closed** (§17.19), each with a metric and a gate: correlated evidence inflating trust;
schema drift leaving rules that name a column that no longer exists; integrity of rule *formation*;
abstention having no kind of its own; preference being a dataset row instead of knowledge; no clock
contract for validity; a curator with an implicit timer; no cost model; delivery with no payload; no
erasure; retrieval options underexplored; and no policy-following benchmark.

**What the cost model says, measured rather than assumed** (POC-31, from the recorded artefact):

| Quantity | Measured | Consequence |
|---|---|---|
| Tokens per answered question | p50 1,133 / p95 2,706 / mean 1,342 | — |
| Pack at the 1,200-char cap | ≈300 tokens = **26% of the median question** | budget becomes a ratio (≤15%), not a constant |
| Distillation loss at full scale | **7.0%** (71 of 1,009) vs 5.0% in a 40-question probe | the probe under-estimated it; quote full-scale numbers only |
| Calls per arm-evaluation | 2.35, ~2,383 tokens | ≤1 call per correction remains the target |

**Decision register** (§17.18): 28 rows — **15 decided, 10 deferred, 3 rejected**. Every deferral names the
behaviour that ships **before** the ablation runs, so no open question blocks implementation: demotion,
adjacent diff, prune-off, `minTaskSupport = 1`, plain BM25, no expansion, `max(3×limit,12)`, soft boost,
JSONL, pull-only.

**Evidence.** `TECH-DESIGN.md` §17.17–§17.24 and §19; POC register v3 (21 POCs, one run, twenty
specified); `AgentiX-E/microglia` untouched at `c55cff1`.

### 18 — Audit pass 3: the documents contradicted each other

Pass 3 asked a different question from pass 2: not "is §17 complete" but "does the document set satisfy the
ten requirements". It found defects **between** documents, which re-reading §17 could not have surfaced.

| Defect | Where | Fix |
|---|---|---|
| A retracted number still stood as verified | `AUDIT.md` C19 asserted +3.33pp at n=30, withdrawn in §12.11 | rewritten as the retraction, with its successor read |
| Two chapters gave different S2 exit gates | §18 said "BIRD-Interact ≥+5pp at n=600"; ROADMAP had closed S2 on BIRD after four failures | §18.1 states S2 as closed and gives S2b's gate; the old gate becomes lane L4's sibling |
| The pipeline's new capabilities had no home | §17 said "core/capture (new)" without saying which subpath exports what | §17.25: nine capabilities → modules and symbols, normative signatures, four new error codes, subpath bundle budgets |
| Requirement 4 had no numbers | latency only | §17.26: ingest, curation, cold start, heap, bundle, token budgets; a competitor comparison that names what is *not* comparable |
| Requirement 5 had no plan | benchmarks listed, not sequenced | §17.27: lanes L1–L8 with n, resolution, cost, artefact, gate, order; a five-rung SOTA ladder with stop rules |
| Requirement 6 had citations but no register | sources quoted inline | §17.28: every source with evidence class **S** (source), **P** (paper), **R** (secondary), and a rule that class R may never appear in a product claim |
| Requirement 8 left twelve values open | "Wilson over task count", "every 50 events", `budgetRatio`, decay floor | §17.29: one value each |
| Requirement 9 had topics but no conclusions | the register listed work, not outcomes | §17.30: every POC's conclusion, or its explicit "not run, because" |

**The evidence-class register changed what we may say.** mem0 and Graphiti were read at source; ACE, ExpeL
and τ-bench at paper; **ALTK-Evolve, MemForm, MINJA, A-MEM and HippoRAG 2 only through secondary coverage**.
Those five are now hypotheses H1–H5 in the audit report, not claims — and POC-32 exists to make H1 ours by
running the lane.

**AUDIT.md was rewritten** (97 → 138 lines): C1–C26 with an evidence class per claim, **eight** defects
(B1–B8, including the parser and both gate bugs), five class-R hypotheses, and a "not verified" table that
now says four null reads instead of one underpowered read.

**`TECH-DESIGN.md` is 2,720 lines** across §1–§19. `AgentiX-E/microglia` untouched at `c55cff1`.

### 19 — Audit pass 4: requirement 6 was not met, and two citations were wrong

The register in §17.28 was honest about evidence classes and that honesty exposed the problem: only mem0 and
Graphiti had been read at source. Requirement 6 asks for the leaders' source, and the systems whose
mechanisms we were deferring are open source, so "secondary report" was a description of our own gap, not a
limit of the field.

**Read this pass.** `A-MEM/agentic_memory/memory_system.py` + `retrievers.py`, `HippoRAG/src/hipporag/HippoRAG.py`
(truncated file, defaults not visible), and `langmem/src/langmem/knowledge/extraction.py`.

| Was asserted | Source says | Now |
|---|---|---|
| A-MEM's edge on distractor-heavy sets comes from per-item keywords | `search()` scores ChromaDB distance over `content`; `keywords` never enters the scoring path, and `analyze_content` is not even called by `add_note` | the alias loses its citation — and in iteration 20 it loses its premise too (47% → 3.1%) and is rejected |
| PPR expansion is a cheap deferred option | `retrieve()` calls `rerank_facts` — an **LLM filter per query** — and skips graph search entirely when no fact survives | D10 becomes **rejected for the default path**: a CPU-only default makes zero calls per query |
| Pruning is a normal operation | LangMem ships `enable_deletes = False` | D5's "prune off by default" is corroborated by the most-adopted SDK |
| Curation is threshold-only | LangMem debounces with `ReflectionExecutor(after_seconds=…)` | D30: coalesce a burst into one round, host may debounce |
| One call per correction is the only shape | LangMem batches a whole session into one parallel multi-tool call (`max_steps = 1`) | D29: batch distillation deferred to POC-31b, gate "calls <200 per 1,000 corrections, yield within 10%" |

**Three omissions this pass closed.**

1. **§17.31 statistical discipline.** Our own record has four looks at one BIRD hypothesis and two at the
   convention hypothesis, and we quoted the best p-value. That is optional stopping. Now: one primary
   endpoint, `looks` in every artefact, Holm within an arm family, and no pooling of discordant pairs across
   looks. Applied retrospectively, the convention lane's p = 0.0156 becomes ≈0.031 with two looks — still
   under 0.05 — and the 10:0 sum is described, never tested.
2. **§17.32 dataset manifest.** Every lane now names its source, size, licence-at-fetch, pinning digest and
   fallback, and a missing dataset is reported as **blocked** rather than silently substituted. This exists
   because BIRD Mini-Dev once arrived without databases and the lane had to assemble two repositories.
3. **§17.33 versioning and migration.** A published SDK that stores a host's corrections owes it a migration
   path: read N−1, write N, migrate by replaying into a **new** journal with a `schema.migrated` event, refuse
   a newer major, keep subpaths in the contract, deprecate for one minor.

**Decision register:** 30 rows — **16 decided, 10 deferred, 4 rejected**. `AgentiX-E/microglia` untouched at
`c55cff1`; `TECH-DESIGN.md` is 2,837 lines.

### 20 — The nine evidence gaps were not nine: three closed, one conditional, six open, one retraction

The challenge was fair: a deferral is only honest if something actually blocks it. Re-reading the nine, three
were answerable **without any code**, and checking them exposed a false number that had been steering the
design.

**Closure 1 — support counting is arithmetic (POC-27).** `wilsonLower` is closed-form and the policy
activates at 0.6:

| Endorsements (all positive) | Counted as events | Counted as tasks (one task) | Ratio |
|---|---|---|---|
| 4 | 0.510 | 0.207 | 2.47× |
| 6 | **0.610** | 0.207 | **2.95×** |
| 8 | 0.676 | 0.207 | 3.27× |

Two results: the gate (≤1.15) is refuted by arithmetic, and **one task's six attempts reach activation today**
— a single persistent user can admit a rule. Six distinct tasks is what activation actually requires. That is
a live defect found by a five-line computation.

**Closure 2 — the alias premise was a misattributed number (POC-33), and this is the pass's real finding.**
"Median coverage 7.1%, 47% of packs share no word" turned out to be the **40-question smoke run's**
distribution, published as the 352-question result. Recomputed from the same committed artefact:

| Lane | n | Zero-overlap | Median coverage | ≥1 overlapping active rule |
|---|---|---|---|---|
| BIRD unmodified | 352 | **3.1%** | **18.2%** | 99.7% |
| Convention subset | 146 | 3.4% | — | 100.0% |

So the pack was never textually unaddressed; the "retrieval is the binding constraint" claim is withdrawn,
and it is withdrawn in favour of the conclusion the oracle arm already gave — the knowledge is redundant. The
alias (D8) is **rejected** rather than deferred, because BM25 already scores the same terms.

**Closure 3 — task-type scoping (POC-18)** is an identity: every lane has one task type. Soft boost ships;
reopen when a host has two.

**Conditional — validity intervals.** Intervals buy exactly one capability: answering *what was true then*. No
lane contains a past-referring query, so demotion ships and the trigger is recorded.

**What is genuinely open is now six, not nine** (the ninth split when its alias half closed): pair contrast
(no lane has a second attempt to pair with), ranking parameters (need the real index), push/tool (no
transport), integrity (no store yet), abstention (no kind, no unanswerable set), policy benchmark (needs the
loop). Each names its blocker in §19.3.

**Evidence.** `TECH-DESIGN.md` §17.34 (closures with numbers), §19.3 (three closed / one conditional / five
open), `AUDIT.md` C25 rewritten, C27 added, B9 added. `AgentiX-E/microglia` untouched at `c55cff1`.

### 21 — Implementation begins: evidence independence, then the task instance

The first implementation iteration took the two P0 items in the order their evidence demanded: the defect
the arithmetic proved, then the structure that makes the defect impossible to reintroduce.

**1. Evidence is counted per task, not per event** (`kernel/knowledge.ts`).

`scoreKnowledge` now groups evidence by `taskId` (falling back to `runId`), keeps the **strongest**
observation per task, and sums across tasks. Six attempts of one task move the score by zero; six tasks
move it by more than 0.05; callers that never opened a task are byte-for-byte unchanged, which is why the
study's nine arms still report 31.79 → 100.00 and all 17 gates pass.

Deliberate deviation from the design: §17.34.2's arithmetic was a Wilson bound, while the shipped score is
a log-odds fusion. Swapping the formula would invalidate the calibration the 17 gates rest on, so the
**mechanism** was fixed instead — same property, no recalibration. This is recorded in §17.3 and §17.34.2
rather than left as a silent difference.

**2. Task instance** (`capture/task.ts`, ~200 lines).

```ts
const task = mg.openTask({ taskId, taskType, sessionId? });
const a1 = task.begin({ attempt: 1, input });          // RunHandle
const a2 = task.begin({ attempt: 2, parentRunId: a1.id, input });
await task.complete({ status: 'accepted', finalRunId: a2.id });
```

`RunRecord` and `FeedbackEvent` gained `taskId`, `attempt`, `parentRunId`; distilled candidates carry
`taskId` into their evidence, so the grouping above applies end to end rather than only in tests.

Two deviations from the design paragraph, both on the side of refusing rather than guessing: a **skipped**
attempt number is rejected (a gap hides a generation), and a second `complete()` throws
`MG_E_TASK_CLOSED` instead of returning the previous decision (a silent no-op is how a host stops knowing
whether its decision landed).

**Evidence.** 460 tests (was 448), coverage **99.78 / 98.17 / 100 / 99.78** (statements / branches /
functions / lines), `task.ts` at 100/97.14/100/100, `pnpm audit:repo` ok, `pnpm bench` unchanged with
`blocking-gates=PASS`. New error codes `MG_E_TASK_CONFLICT` and `MG_E_TASK_CLOSED`, mapped to HTTP 409 in
the server.

### 22 — Curation, the utility denominator, and the end of the annotation blocker

**Answer to "is human labelling required?" — no, and not because we would synthesise labels.** The reason S1
was blocked is that its gate was written as *human-adjudicated* labels at κ≥0.7. That is one way to define
truth for a chart recommendation, and it is the weakest one available to us: a chart is correct because a
policy says so, not because two people agreed. So the gate is replaced by **L0: rule-derived adjudication** —
1,300 cases whose gold answer is computed from a stated policy over data shape, intent and field, with no
opinion anywhere in the loop. A 100-case human audit stays as *calibration* (does the policy read the way a
person would?), not as the gate. Nothing on the critical path needs your input any more; the host shadow
resumes when you have real users, and that is a milestone, not a blocker.

**Implemented this iteration — P4 curation and the P7 denominator.**

`mg.curate({ dryRun, prune, maxItemsPerTask, mergeThreshold })`:

| Behaviour | Rule |
|---|---|
| Merge | same namespace, kind and scope, statement dice ≥0.85; survivor keeps the union of evidence and the sum of counters |
| Close | loser becomes `retired` with `statusReason: merged:<id>` and `validUntil` set — never deleted, so a past-tense query still finds it |
| Prune | off by default; when on, rank by `(flippedUp+1)/(injected+2)` and retire from the bottom |
| Determinism | sorted keys and ids; a second pass over a curated store reports `merged: 0` |

`applyOutcome` now maintains `utility: { injected, flippedUp, flippedDown }`. `injected` counts **outcomes
observed on runs citing the item**, not renders: incrementing it during `recall` would mutate the store while
an evaluation measures it, and gate V2 exists to refuse exactly that.

**Two design details that came out of writing it.** The merge decision lives in `capture`, not `distill`,
because it needs the store and `distill` must stay store-free — a deviation from §17.25, recorded there. And
the merge threshold is conservative on purpose: a plural-only variant at six tokens scores 0.83 and stays
separate, because a wrong merge loses a rule while a missed merge costs a duplicate (a test pins both sides).

**Evidence.** 474 tests, coverage **99.79 / 98.15 / 100 / 99.79**, `curate.ts` at 100/97.26/100/100,
`pnpm audit:repo` ok, study unchanged (31.79 → 100.00, 17/17 gates).

### 23 — The promotion gate: prose is evidence, not authority

D15/D16 in one mechanism. Every candidate now carries a **provenance tier** derived from the event kind
(`edit` → `structured-edit`, `outcome` → `outcome`, everything else → `user-text`), and the tier decides
whether a lesson may steer output:

| Tier | Activates alone | Why |
|---|---|---|
| `user-text` | **no** | a rating, a clarification, a preference, an abstention — the tier an articulate user can write |
| `structured-edit` | yes | a whole corrected artefact, re-executable |
| `outcome` | yes | a measurement of one |

A `user-text` item stays a `candidate` with `statusReason: needs-corroboration` until a **second distinct
task** endorses the same claim, or evidence of a stronger tier lands on it — at which point the item's tier
promotes to the strongest evidence it holds. Two consequences worth stating: the store still *learns* from
prose (it is stored, counted and visible), and an item written before the field existed has no tier and
keeps the old behaviour, so a persisted store does not silently lose its rules on upgrade.

**Why this and not a trust threshold.** A threshold would have to be arbitrary — 0.7 for a comment, 0.8 for
a clarification — and would still let one determined user through. The gate asks a structural question
instead: has anything other than one person's words endorsed this? That is the question MINJA's 98.2%
query-only injection and AgentPoison's 0.1%-poison backdoor exploit, and no constant answers it.

**What is deliberately not in this iteration.** Two of G3's four invariants: generalisation may not widen
beyond the scopes of its endorsing tasks, and curation must be replayable under a shuffled event log. Both
need the replay harness (POC-28) that comes with the integrity lane.

**Evidence.** 484 tests, coverage **99.79 / 98.13 / 100 / 99.79**, `provenance.ts` 100/100/100/100,
study unchanged (31.79 → 100.00, 17/17 gates).

### 24 — Learning to say "I don't know"

`abstain` was a signal that produced nothing: the event was collected, weighted 0.4 and discarded. So the
workspace could not learn the one lesson that suppresses hallucination — MobileMem's finding is that the
*stronger* the memory, the worse the behaviour on unanswerable questions, precisely because a good retriever
finds a plausible distractor.

Now:

| Piece | Behaviour |
|---|---|
| Interpreter | `abstain` → `kind: 'abstention'`, reason in the payload, statement "Questions of this kind cannot be answered from this workspace: …" |
| Rendering | Its own block with its own instruction — "Do not invent an answer; state what is missing" — because a negation inside positive rules is read as a positive |
| Selection | Speaks only when no positive rule clears `absenceFloor` (default: the activation threshold) |
| Promotion | Gated as `user-text`: a second distinct task is required, because a false abstention makes the product refuse to answer |

**The bug the end-to-end test caught.** `trustFor('abstain')` was 0.4, so `Math.min(event.trust, 0.8)` pinned
the lesson at 0.4 and its confidence peaked at 0.17 — the feature would have shipped, passed its unit tests,
and never once been injected. It is 0.8 now, matching a clarification, and the test that caught it asserts
the path from `run.abstain()` to a rendered pack rather than the mapping table.

**Evidence.** 491 tests, coverage **99.79 / 98.28 / 100 / 99.79**, `rules.ts` and `pack.ts` and `render.ts`
at 100 across, study unchanged (31.79 → 100.00, 17/17 gates).

### 25 — Integrity: the store is a function of the log

`G3` had two invariants left after iteration 23, and both needed an instrument rather than a filter —
they are the two of MemForm's five routes that a single write cannot show you. Deriving them exposed two
defects that had shipped.

| Defect | How it surfaced | What it would have cost |
|---|---|---|
| Curation summed both items' `support` when merging (B10) | writing "one event is one observation" down as a test: two items citing one `feedbackId` merged to 1.8 instead of 0.9 | one user's single correction pays for two rules and admits their sum — the evidence route, reached by arithmetic |
| `canGeneralize` ignored `schemaDigest` and `reasonCode` (B11) | deriving the widening bound as the meet of the scopes instead of a list of field comparisons | a rule learned under one schema widens onto another and keeps the target's digest — G2's fabrication with a citation, re-entered through widening |

**The bound, as a computation.** `widenedScopeOf(scopes)` keeps a dimension only when *every* endorser
constrains it identically; `domain` is the only dimension that may disappear. Anything else that would
have to disappear means the endorsers disagree about what the rule is about, and the honest answer is
that they are two rules. That single function replaces three hand-written field comparisons and closes
the drift class by construction.

**The gate, as a count.** Widening *retires* the domain-scoped copies that were working, so it now needs
three distinct endorsing tasks (`WIDENING_TASKS`). Two domains produce two rules; the third folds them.
A pair is the evidence one persistent user can manufacture, and B5 had already shown what widening on
insufficient evidence costs.

**The sibling set is judged jointly.** `canGeneralize` is pairwise, so two siblings could each agree with
the candidate and still disagree with each other; merging both attributed one sibling's evidence to a
scope it never endorsed. The fold now keeps the running meet, and a sibling that would break it is
excluded from the endorsement rather than silently carried.

**POC-28, run.** 1,000 events, 60 task instances, five domains, digest renamed at event 600, no model
calls, 1.3 s:

| Metric | Reading |
|---|---|
| order invariance (5 shuffles) | **1.00** |
| replay determinism | **1.00** |
| control (events newest-first, sort bypassed) | **0.00 — the instrument is sensitive** |
| stale-schema injection | **0** (old digest still retrievable: 4, so the probe sees a real store) |
| items / active / candidate / retired | 70 / 28 / 13 / 15 |

The control is the point. A replay harness that only ever prints 1.00 is indistinguishable from one that
compares nothing, so the same run replays through a view that returns events newest-first. It must
disagree, and the lane fails if it does not. It is the second instrument in the repository that can
falsify itself, after the SOTA lane's gate on control arms that injected nothing (B7).

**What is deliberately not claimed.** Erasure (`forget`, D20) is the fourth metric POC-28 was specified
with, and it is not implemented; the artefact says "not claimed" rather than reporting a zero it never
measured. POC-29's attack harness (five routes × 100 attempts, six defences) belongs to the same lane
and is next.

**Evidence.** 513 tests, coverage **99.80 / 98.30 / 100 / 99.80**; `generalize.ts` and `integrity.ts` at
100 across all four dimensions, `curate.ts` at 100/96.25/100/100; `pnpm audit:repo` ok; study unchanged
(31.79 → 100.00, 17/17 gates) — the regression check that matters, because the widening change touches
the `no-generalization` arm directly and moved it by nothing.
