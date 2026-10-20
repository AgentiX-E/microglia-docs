# Progress tracking

A running log of iterations: what changed, what evidence it produced, and what is left. Newest last.
An iteration is only recorded as closed when its CI is green and its artefacts are committed.

## Where the project stands

| Stage | State | Blocking item |
|---|---|---|
| S0 Mechanism | **closed** | — |
| S1 Host shadow (nl2charts) | not started | needs the private adjudicated set (n=1,300, κ≥0.7) |
| S2 Public benchmarks | **first full read: no benefit** (−2.84pp, n=352); diagnosis next | Mini-Dev caps at 352 usable questions; BIRD dev / Interact not wired |
| S3 SOTA push | not reachable until S2 replicates | — |

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

## What is left, in order

1. **Diagnose the negative read** (iteration 12): full / narrow / wrong-scope / oracle-hint arms in one
   protocol, plus the distillation parse failure. A negative delta has four explanations and they are
   separable.
2. **S2 at power**: Mini-Dev caps at 352 usable questions, so a 5pp effect is not resolvable there
   (4.91pp measured). BIRD dev (1,534 questions over the same 11 databases) is the next source; the
   harness needs one input for its question file.
3. **S1**: instrument nl2charts behind a flag, adjudicate 1,300 cases, run the three modes. Gate:
   +3pp top-1 (p<0.05), SQL regression ≤1pp, knowledge precision ≥85%.
4. **Cortex release**: swap the clone lane for the published package (W1).
5. **vitest 4 migration** once vite 7 is the toolchain default (W2).

Nothing on this list blocks the S0 result, and none of it is hidden behind the green build: each item
is either an experiment that has not run or a dependency that has not shipped.
