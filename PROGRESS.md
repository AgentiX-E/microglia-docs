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
