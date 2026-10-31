# Progress tracking

A running log of iterations: what changed, what evidence it produced, and what is left. Newest last.
An iteration is only recorded as closed when its CI is green and its artefacts are committed.

## Where the project stands

| Stage | State | Blocking item |
|---|---|---|
| S0 Mechanism | **closed** | — |
| S1 Host shadow (nl2charts) | **split**: S1a public ambiguity, S1b private chart vocabulary | S1a unblocked by BIRD-Interact's annotated ambiguity; S1b still needs the 1,300-case set |
| S2 Public benchmarks | **four reads: no benefit** (−2.84, −1.14, −0.57, −0.28pp); controls show the pack is inert | the knowledge that transfers is convention, which this benchmark has none of |
| S2b Convention transfer | **first positive read**: +4.79pp (p=0.0156) on a rule the schema cannot reveal | replication; 44% of the stated ceiling is the gap to close |
| S3 SOTA push | stopped on BIRD; starts only after S2b moves accuracy | — |
| R1–R9 (research lines) | **closed** — R9 closed on its own refutation condition | — |
| R8 Protocol as a deliverable | **closed**; R8.3b **closed** — `reproduced` at 57.63% on 1,534 questions (+4.11pp, tolerance 4.97) | nothing; the dev artefact is committed and the gate recomputes the row |
| R10 Migrate the structure | **refused pre-dispatch** — 66.8% of the family cannot bind, above its own 60% kill condition; hypothesis untested | R11: bind to the target's schema links instead of to spelling |
| R11 Link binding | **refused pre-dispatch** — 62.3% withheld, and 60% of those are a column the target database does not have; the wall is vocabulary, not structure | R12: ask the store to prove itself |
| R12 Own-case probe | **closed** — 12.2% of corrections are reproduced with their own rules, 66% not reproduced at all; the deficit is the extraction | R13: does an admitted rule repair a different question? |
| R13 Admitted-rule transfer | **closed** — 7.3% of the questions that need help are repaired, 50% of those that do not are broken; both gates leave 10 items over 350 questions | R14: render the pair instead of the sentence |
| R14 Substrate comparison | **closed** — the pair reproduces 53.8% of its own corrections against the sentence's 30.7% (+23.10pp, p = 1e-14), and the arm built from it moves the product by one question of 350 (−0.29pp); the extraction is no longer a live explanation | R15: does the pair *transfer*? |
| R15 Repair-substrate transfer | **closed** — 6.21% against the sentence's 6.28%: a tie on 720 informative trials, so an 18pp reproduction advantage buys no transfer. Four content forms are now inert within ±3pp and the extraction axis is closed | R16: the dose, in both directions |
| R16 Injection dose | **closed** — the curve is a step at the first item: 0.29 items per question costs +0.00pp, 1.00 costs −3.14pp (iteration 86's cell), 1.83 −2.57pp, 2.97 −4.00pp and 4.16 −2.86pp; no point is above `none` and the whole spread equals the sample's own floor | R17: framing |
| R17 Framing | **closed** — permission to ignore the block does not recover its cost (−0.57pp against `full`, CI [−3.14, +2.00], the registered refutation firing); the sentence costs 2.00pp with no block, and the error register moves the cell by 0.57pp | R18: the anchored control |
| R18 Anchored control | **closed** — the control is worse than the mechanism: a blind revision costs 4.00pp (p = 0.0336, one sign in five folds) and the anchored cell sits at *exactly* no memory, so its +4.00pp over that control (p = 0.0385) is a repair rather than a gain | R20: the 2×2 that separates the block from the permission it carries |
| R20 Anchored hold | **closed** — the licence and the note are **substitutes**: the permissive clause is +2.00pp where there is no block and −0.57pp where there is one (interaction −2.57pp), so the explicit sentence is dropped and the shipped prompt keeps the clause it had; the blind revision reproduced to the question (−4.00pp, 12/26, p = 0.0336) | R21: utility clearance, the only mechanism that adds no text |
| R21 Utility clearance | **open** — registered, not built; decide per question from observed outcome rather than per item from attributes, and add no prompt text | the build |

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

`packages/eval/src/bin/sota-bird.ts` runs BIRD Mini-Dev with two arms on the same questions: no memory, then a pack
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

**Evidence.** `eval/results/poc-sota-bird.json` (per-case rows, per-fold table, gates, every stored
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

Per-rule attribution (`eval/results/poc-sota-attribution.json`): of 445 rules ever injected, 34 harmed,
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

**Evidence.** Run `39406533126`, artefact `eval/results/poc-sota-bird.json`, attribution
`eval/results/poc-sota-attribution.json`, 396 tests, coverage 100 / 100 / 100 / 99.44.

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

**Evidence.** `eval/results/poc-sota-bird.json`, `eval/results/poc-sota-attribution.json`, 410 tests,
coverage 100 / 100 / 100 / 99.44, `pnpm audit:repo` ok.

### 115 — R8: the protocol becomes a product, and it finds an error in our own table

R8 was the last stage open after R9 closed on its own refutation condition. It owed four things, all
of them about making the measurement checkable by somebody who does not run our code — and writing
them down turned up a mistake in this document's competitor table.

| Step | Delivered | Evidence |
|---|---|---|
| R8.1 | `plugin.ts` — one request, one reply, a loader that refuses a module inside `packages/eval` | `eval/plugins/keyword-router.mjs` scores **2/6** through `pnpm eval:plugin`, no model, no network |
| R8.2 | `schema/run-artifact.schema.json` + `artifact-schema.ts` (validator with arithmetic, renderer) | the committed report is byte-identical to the one rendered from the artefact; V28 |
| R8.3 | `reproduction.ts` — published cells with their splits, Wilson intervals, the admissibility rule | `xiyan-deepseek-ddl` is **`indicative` at +0.19pp**, archived in `poc-cell-comparison.json`; V31 |
| R8.4 | `prereg/<id>.md` with a fixed header and two mandatory sections, plus a dispatch step | `pnpm eval:prereg` refuses six defect classes; the workflow refuses a dispatch that names none; V30 |

**The fixture is the acceptance, and it is predictable.** A keyword router of the kind a 2019
text-to-SQL baseline shipped — pick the table the question names, count its rows, project everything
when asked to list — is wrong in exactly two ways: it drops filters and it over-projects. Six cases, two
databases, and a predicted score of 2/6 written into `prereg/R8.1-offline-fixture.md` before the run.
Measured: **2/6, 33.33%, Wilson [9.68, 70.00]** — the two unfiltered counts, and the four errors for the
two stated reasons. The prediction held, so the arithmetic between a generator, an executed answer and
a score is now checked by something that cannot drift with a model version.

**Four gates refuse four specific things.** V27: a generator that resolves inside `packages/eval` is
refused before it is imported, because the claim is provenance and not behaviour. V29: an answer rate
under the registered floor — a broken generator scores zero and must not be reported as a bad one.
V30: a pre-registration with a missing section, a placeholder, or an id that disagrees with its
filename; the `sota` workflow refuses a dispatch that names none *before* the first model call, since a
gate that fires at the end has already spent the budget. V31: every recorded cell comparison is
re-derived from the artefact, so `indicative` cannot be edited into `reproduced` and a difference inside
the noise floor cannot be filed as a win.

**The error.** This document — `COMPETITIVE.md` and §3.7 of the whitepaper — compared our 53.43% on
BIRD **Mini-Dev** (n = 350) with XiYan's 53.52% on BIRD **dev** (n = 1,534) and called them "the same
cell, 0.09pp apart". They are not the same cell. The gap is 0.03 of the smaller estimate's standard
error: indistinguishable from nothing, which is what agreement looks like and also what two coarse
numbers look like. The published cell's own standard error is **±1.27pp**, seven times the difference
that was being read as a near-match. Both documents are corrected, the admissibility rule now lives in
code, and the archived verdict is `indicative` at **+0.19pp** against a 7.72pp band.

| Comparison | Ours | Published | Difference | Verdict |
|---|---|---|---|---|
| DeepSeek + DDL, no memory | 53.71% (Mini-Dev, n=350) | 53.52% (dev, n=1,534) | +0.19pp | **indicative** — different splits |
| difference explained by error | | | ±7.72pp band | inside |
| published cell's own band | | | ±2.50pp | — |

**What R8 does not deliver.** A reproduction of the dev cell needs the dev split, and this environment
cannot reach the dataset host. That item is recorded as R8.3b and is blocked on data availability, not
on method — the difference between an open dependency and an unstated assumption.

**Green:** `pnpm check` — 1,748 tests, 97 files, coverage 99.98 / 99.62 / 100 / 99.98, with `plugin.ts`,
`prereg.ts`, `reproduction.ts` and `artifact-schema.ts` at 100 on all four dimensions. `eval:protocol`
runs offline in about a second and is part of `pnpm check`.

### 116 — R8.3b: the block was a probe, not a property; and R10 is opened from the literature

R8.3 closed with a sentence that was true about one command and false about the project:
*"a genuine reproduction needs the dev split (n=1,534), which this environment cannot download"*.
It was tested on `huggingface.co`, which is indeed unreachable from the sandbox. The dataset is not
there. It is on `bird-bench.oss-cn-beijing.aliyuncs.com`, and four probes replace the estimate with
a fact:

| Probe | Result |
|---|---|
| `curl -sI …/dev.zip` | **200**, `Content-Length: 346,207,293`, `Last-Modified 2024-06-29` |
| `unzip -l dev.zip` / count `dev.json` | **1,534** questions, 925 simple / 464 moderate / 145 challenging, 11 databases |
| `sha256sum dev.zip` | `cdd6d19f…a60cf5a630`, now pinned in `eval/manifests/bird-dev.json` |
| `SOTA_SPLIT=dev BIRD_DIR=… pnpm eval:sota` | `data ok` for all eleven databases before the first model call; stops at the fold check with `SOTA_LIMIT=3`, which is what a working data path looks like |

**The mistake has a name in our own protocol.** It is the cross-split comparison error one level up:
a check performed on one object, reported as a property of the class. R8.3 exists to stop exactly
this in the accuracy table — "our number and their number are the same cell" — and R8.3 then made the
same move about a URL.

**What the lane now does.** `SOTA_SPLIT` is a first-class parameter: `dev` selects its own manifest,
reads `dev.json` through `manifest.questions` instead of a hard-coded filename, keeps all 1,534
questions, and writes `poc-sota-bird-dev.json`. The split-dependent filter is the subtle part and it
lives in `poolOf`: dropping `simple` questions is a *measurement* decision on Mini-Dev (a question
answered without memory carries no signal) and a *protocol violation* on dev (it leaves 609, and a
run on 609 is not a reproduction of a cell measured on 1,534). Both halves are asserted.

**Three downstream readers were silently broken by the second artefact.** Attribution, the pool, the
signals, the density family and the union price each spelled `poc-sota-bird.json`, and each opens
with "if it is missing, print a line and exit zero" — so a dev-only dispatch would have produced a
green job with no reading. `chooseArtefact` resolves it once, `SOTA_ARTEFACT` overrides it, and the
workflow now names the split's artefact in one place instead of fifteen.

**R10, opened from two papers rather than from intuition.** R9.4's finding was that a rule learned in
one database is ignored in another — repair 6.7%, break 10.4%, against 3.52% / 42.6% for a
same-database foreign case — because the rule is a sentence about a table that does not exist there.

- **ODIS** (arXiv 2310.06302, EMNLP 2023 Findings) shows that what makes an in-domain demonstration
  work is the **SQL distribution**, not the question distribution, and gets +1.1 / +11.8 by
  synthesising in-domain examples.
- **SQL-Exchange** (arXiv 2508.07087, PVLDB 2026) maps a query to a target schema by preserving its
  **structure** and substituting only the domain-specific elements, and reports that mapped
  demonstrations beat raw source-schema ones consistently.

Same diagnosis, stated as a construction. R10 rewrites a rule as a slot template
(`CAST({column} AS REAL) when {column} is TEXT and compared to a number`), binds the slots against
the target schema at transfer time, and runs three arms — prose rule, bound template, nothing — on
R9.4's panel. Predictions and refutation are in `ROADMAP.md` §R10 and were written before the code.
If arm B's break rate does not fall below 8%, the structural hypothesis is wrong and the memory
layer is documented as in-database only.

**S1 stops waiting behind an annotation set it does not need for half its question.** Ambiguity now
has annotated public data: BIRD-Interact (ICLR 2026 oral) ships 600 tasks over 22 PostgreSQL
databases with `amb_user_query`, `user_query_ambiguity`, `knowledge_ambiguity`, `sol_sql` and
`test_cases`; GPT-5 completes 8.67% of them. S1 therefore splits into **S1a** (public, no
annotators, measures whether ambiguity is resolved) and **S1b** (the private chart-vocabulary set,
which is the only thing the public data cannot carry).

**Three dispatches, three bugs, each found by the run rather than by reading.** The lane had never
been asked to fetch a second archive, and every assumption that mattered was in the code that only
one archive exercised:

| Dispatch | Stopped at | Cause | Fix |
|---|---|---|---|
| 1 | `the dataset archive failed its size check` | `BIRD_ARCHIVE_URL` came from a repository variable naming Mini-Dev while `SOTA_SPLIT` selected the dev manifest — two sources for one download, and the check blamed the data | the URL comes from the manifest, which is also where the digest lives, so the thing fetched and the thing verified cannot disagree; the variable is gone |
| 2 | `No database file for 'california_schools'` | `dev.zip` nests: `dev.json` sits beside `dev_databases.zip`, which holds the eleven SQLite files. Mini-Dev does not nest, so one pass had always been enough | unpack the inner archive when it is there; verified locally end to end (**29,941 rows** for `california_schools`, all eleven databases counted) before the third dispatch |
| 3 | `MG_E_BUDGET_EXCEEDED: the configured cap cannot finish the folds` | fold 1 of 5 took 93 minutes and 2,229 calls, and the lane's own forecast said **12,037 calls needed, 8,000 available** | `SOTA_LEARN_SAMPLE` caps how many questions a fold distils from; the evaluation stays complete at 1,534 x 2, total about 3,800, and the cap is recorded in the artefact |

The third one is the useful number, and it is a fact about the benchmark rather than about the code:
**a fold on dev learns from 1,227 questions for about 1,227 calls.** The 350-question slice never
showed this because it learns from 280. Any future dev run that wants a full flywheel reading needs
roughly 12,000 calls — twelve times the Mini-Dev budget, for 4.4 times the questions.

**Green:** `pnpm check` — 1,765 tests, 97 files, coverage 99.98 / 99.6 / 100 / 99.98, with
`artefacts.ts`, `bird-data.ts`, `plugin.ts`, `prereg.ts`, `reproduction.ts` and `artifact-schema.ts`
at 100 on all four dimensions. The dev dispatch runs on the runner, not here: the benchmark lane is
required to be a GitHub workflow, and this keeps that rule even when the sandbox could run it.

## What was left after iteration 13, in order (superseded — the current list is at the end of this file)
The list used to be short because everything on it had been declared blocked, and one of those
declarations was wrong: "the dev split is not reachable from this environment" was a probe of one
host reported as a property of the environment. It is reachable, the lane measures it, and the
dispatch is running. What is left now separates work we owe from work we are waiting on.

1. **R8.3b — the dev-split reproduction.** Running. The lane measures 1,534 questions on the runner;
   `compareCell` returns `reproduced` the moment the artefact lands, and the cell table gains a
   second row rather than replacing the first.
2. **R10 — migrate the structure, not the sentence.** Pre-registered, not built. Needs a template
   distiller: rules as slot patterns instead of prose, bound against the target schema at transfer
   time. Three arms on R9.4's panel; the refutation is in `ROADMAP.md` and was written first.
3. **S1a — ambiguity, on public annotations.** Unblocked and unbuilt. BIRD-Interact carries the
   annotated ambiguity (`amb_user_query`, `user_query_ambiguity`, `sol_sql`, `test_cases`), so this
   half of S1 does not wait for annotators.
4. **S1b — the chart vocabulary.** Blocked on the private set: 1,300 cases, two annotators, κ ≥ 0.7.
   This is the only part of S1 the public data cannot substitute, because it measures our product's
   own words.
5. **S3 — SOTA push.** Gated, not blocked: it starts only if S2b moves accuracy. S2b closed with its
   gate missed (+4.79 then +2.05pp against a ≥10pp bar), so S3 stays stopped by its own rule — and
   R10 is the experiment that could move that gate rather than a reason to bypass it.
6. **Cortex release (W1).** Excluded from this programme by the owner; the conformance lane is green
   against a real build and the release itself is a decision, not a task.
7. **vitest 4 (W2).** Blocked on the toolchain: it lands when vite 7 is the default.

Items 1–3 are ours to finish. Items 4–7 wait on an annotation set, a gate, a decision, and a
toolchain respectively.

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

**Evidence.** Run `39548548865`, artefact `eval/results/poc-sota-bird.json`, gates V1–V7 with the V6 fix
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

### 26 — Erasure: deleting the record and what it justified

`D20` was decided and unimplemented, which made the product unsellable to any host with a deletion
obligation. It is now part of the port rather than an extension point, because an optional method is a
promise the default store keeps and a replacement quietly drops.

| Request | Covers |
|---|---|
| `{ ids }` | named records, whatever their evidence |
| `{ taskId }` | every event and run of one task instance |
| `{ actorHash }` | every event one person produced |

`actorHash`, not an id: the library stores a salted hash and never an identity, so it cannot be asked to
erase by something it never saw. The facade forces its own namespace into every request — an actor hash
alone would otherwise erase that person in every tenant the store holds, and an erasure that reaches
further than the request did is worse than the data it was meant to remove. An empty selector is refused
for the same reason: a wipe should have to be asked for.

**The cascade is the design, not a side effect.** Erasing an event removes it from every claim that cited
it, recomputes support from the surviving evidence, recomputes the provenance tier from the surviving
events' kinds, and runs admission again. So a rule promoted by an execution result that has been erased
falls back behind the promotion gate (`needs-corroboration`) instead of keeping a promotion it no longer
has evidence for. A claim whose last evidence was erased is removed. A test pins the demotion, because
"deleted the rows" and "deleted the thing that mattered" are different claims.

**What replaces the data.** A tombstone in `erasures.jsonl`: selector, time, ids — never a statement,
never a payload, because a copy of what was erased defeats the erasure it documents. The three journals
are then rewritten, so a reopen sees the deletion rather than replaying it away; the files are replaced
one at a time, and a crash between them leaves a store the next `forget` finishes from the same selector.

**POC-28b, measured** on the 1,000-event replay:

| Metric | Reading |
|---|---|
| erased by id / by task | 10 items / 10 task instances |
| events removed by the cascade | 170 |
| claims removed because no evidence survived | 4 |
| claims re-scored | 86 |
| erased records retrievable or cited afterwards | **0** |
| events remaining | 830 (= 1,000 − 170, bounded) |

**Evidence.** 523 tests, coverage **99.81 / 98.31 / 100 / 99.81**; `store.ts` and `journal.ts` at 100 on
lines and functions; `pnpm audit:repo` ok; study unchanged (31.79 → 100.00, 17/17 gates). The lane now
runs ten gates, and all ten pass.

### 27 — Five ways in, and three of them were open

POC-29 turns MemForm's five formation routes into 500 executable attacks (5 routes × 100 attempts, each
at one of three channel-trust ceilings), with no model calls. Writing them found three real holes.

| Defect | How it surfaced | What it would have cost |
|---|---|---|
| A candidate could cite *any* event id as its own evidence (B12) | the evidence route: a host-supplied interpreter attributing its claim to a trusted correction | a claim buys support it never earned, with no false record anywhere in the log |
| Curation merged paraphrases with different payloads (B13) | the selection route: a paraphrase whose payload says the opposite of the rule it borrows | the survivor's payload inherits the loser's evidence; if the attacker's id sorts first, the false rule wins with three trusted tasks behind it |
| Widening counted evidence from unadmitted siblings (B14) | the scope route: a quarantined paraphrase riding a trusted rule into a broader scope | applicability bought from evidence the store had already refused |

The fixes are one line each in principle — a citation must match the event; the payload is part of the
merge identity; only an active claim may endorse — and each is pinned by a test that states the attack
rather than the implementation.

**Measured, 500 attacks:**

| Channel trust | Success | What it means |
|---|---|---|
| 0.3 | **0%** | below the quarantine floor; nothing is admitted |
| 0.6 | **0%** | three tasks at trust 0.6 reach 0.478 confidence against a 0.6 line |
| 0.9 | **40%** | content and path only: a trusted editor can teach and can overwrite |

The 40% column is the honest limit, not a defect to be tuned away: those events are indistinguishable
from a real user's correction, and a store that refused them would refuse its user. The gate is therefore
written against a **capability-limited attacker** (content, citations, scope, paraphrases, order — but not
the trust of its channel), where the measured rate is 0%, and the trusted column is printed beside it
rather than averaged into 13.2%. That column doubles as the harness's positive control: if the attacks
ever stopped landing, `harness-can-fail` would fail the lane.

**An assumption the measurement corrected.** The quarantine floor was assumed to be the defence against
low-trust content. Ablating it (`quarantineBelowTrust = 0`) moves 136 claims from `quarantined` to
`candidate` and changes attack success by **nothing** — trust-weighted fusion, not the floor, is what
keeps a 0.3-trust claim below the activation line. The floor protects the candidate pool from being
mistaken for admitted knowledge; it does not protect the prompt.

**A regression that is not one.** The `unguarded` ablation arm moved from 85.71% to 64.29% (−21.42pp, from
−14.29pp). It is the only arm that moved: `full` stays 100.00%, baseline 31.79%, `no-generalization`
83.21%. The cause is B13's fix — poison used to be absorbed into the legitimate rule by a payload-blind
merge, which hid it; it now stands on its own, so removing the trust ceiling hurts more. The ablation got
more honest, and the product's own arm did not move.

**Evidence.** 535 tests, coverage **99.82 / 97.70 / 100 / 99.82**; `memform.ts` at 100 on lines,
statements and functions (branch 83.9: four arms are generator invariants — `??` fallbacks and optional
spreads the generator always fills — recorded here rather than covered by a fake scenario); `study` 17/17
gates; `audit:repo` ok; all four attack gates pass.

### 28 — L0: 1,300 cases, policy-derived gold, and a gate that had to be withdrawn

The stage-1 gate used to require 1,300 human-adjudicated labels. Removing that blocker was decided in
the design phase — the right chart for a question is a policy, not an opinion — and iteration 28 runs it:
`goldMark` is the gold, 260 cases teach, **1,040 are evaluated**, none of them seen during teaching.

| Reading | Value |
|---|---|
| baseline (no memory) | 32.12% |
| full loop | **100.00%** |
| paired delta | **+67.88pp** (95% CI 65.10–70.67), exact McNemar p = 5.9e-213 |
| gained / lost | 706 / **0** |
| unseen domain (`ops`, no feedback at all) | 100% |
| detectable delta at this n and discordance | **7.16pp** |

**The gate that had to be withdrawn.** L0 was specified at a 3pp resolution. At the observed 68%
discordance, 80% power and n = 1,040 resolve 7.16pp; holding 3pp needs **5,922 evaluated cases**. The
number was a guess about effect size that the arithmetic now refutes, so it is withdrawn rather than
quietly kept as a line in a table that never binds. The replacement gate asks the question that *can* be
answered — is the reported effect larger than the design's own noise floor — and passes at 9.5×.

This is the second gate in the record to fail on measurement rather than on mechanism (the first was
S2b's recovery ratio). Both are kept as failures: a gate that cannot fail for the right reason is not a
gate, and a lane that lowers its bar silently is worse than one that reports a miss.

**The preregistration is code, not prose.** `L0_CONFIG` sits in the package next to `DEFAULT_CONFIG` and
a test pins it: 1,300 cases, and the two split sizes are the *only* fields that differ from the default
study. A lane that changed the teaching budget and the sample at once could not say which one moved the
number; the teaching budget is therefore identical (6 rounds × 12 corrections), so L0 measures precision
rather than a better-trained loop.

**Evidence.** 537 tests, coverage **99.82 / 97.70 / 100 / 99.82**; `study.ts` 100/99.52/100/100;
`audit:repo` ok; study unchanged (31.79 → 100.00, 17/17 gates); L0's four gates pass.

### 29 — The server could not delete, and could not name a task

Writing the test for a new `POST /v1/forget` route exposed two holes in the shipped surface, both of
which had been invisible because no test asserted the property they broke.

| Defect | How it surfaced | What it would have cost |
|---|---|---|
| The HTTP surface had no delete (B15) | asking what a host that runs `microglia-node` does when a user requests deletion | the SDK could erase and the server could not: a deployment with deletion obligations could not be shipped on the server at all |
| `parseIngest` dropped `taskId`, `attempt` and `parentRunId` (B16) | the forget-by-task test returned 0 events | every event arriving over HTTP became its own task, so three attempts at one job counted as three independent endorsements — the inflation the per-task grouping exists to prevent — and `forget({ taskId })` matched nothing |

The second is the more interesting one: it is the same class of defect as the B10 double count, on the
boundary rather than in the kernel. The library had the right model and the transport silently flattened
it. Both fields are now parsed, validated (`taskId` non-empty, `attempt` a positive integer,
`parentRunId` a string) and carried into the run record and the emitted event.

**What the route refuses.** An empty body, an unknown field, and a mistyped value are 400s rather than a
200 with zeros. `{ "taskID": "t_7" }` is a typo that would erase nothing and report a completed request,
which is the worst possible answer to a deletion; the route says `unknown field: taskID` instead.

**What the client refuses.** The browser client gains `forget()`, and it is the one call in that class
that is deliberately **not** queued. Every other write goes through the outbox because a correction that
arrives late is still a correction; a deletion that lands after the user changed their mind removes
something they asked to keep, and one that waits silently is a promise the client cannot keep. It
succeeds now or throws, and a test pins that a refusal does not leave an entry behind.

**Evidence.** 548 tests, coverage **99.84 / 97.68 / 100 / 99.84**; `app.ts` 97.04/96.17/100/97.04 and
`client.ts` 100/95.23/100/100 — both above 95 on every dimension; `audit:repo` ok; study unchanged
(31.79 → 100.00, 17/17 gates).

### 30 — The doctor could not see the gate's quiet failure

The promotion gate keeps a prose lesson a candidate until a second distinct task endorses it. That is the
right gate, and it has a failure mode that every other number hides: a workspace can collect lessons that
are all stored, all counted, and none of which can ever reach a prompt. `active` is 0, `quarantined` is 0,
the store keeps growing — exactly the stillness `doctor()` exists to name, sitting one state over from the
checks it already had.

`MG_D_AWAITING_CORROBORATION` reports that backlog, with a severity that depends on how much of the store
it is: a warning when *every* item is waiting (nothing can steer output), information when it is part of
a larger store (a workspace mid-warm-up looks like this and is not broken).

**Evidence.** 549 tests, coverage **99.84 / 97.64 / 100 / 99.84**; `doctor.ts` 100/96.55/100/100;
`audit:repo` ok; study unchanged (31.79 → 100.00, 17/17 gates).

### 31 — The instrument L2b needs, and the corpus property it exposes

Every lane in the record reports a delta against no memory. That answers "does it help" and not "how much
of the possible help did it deliver", which is the question a recovery gate actually asks. `recoveryRatio`
answers the second one: `(arm − baseline) / (oracle − baseline)`, with the three degenerate cases decided
rather than thrown — no headroom is 1 (nothing to close), below baseline is 0 (a negative share is not
actionable), above the oracle is 1 (a ratio over one says the oracle is wrong, which is a bug).

L0 now reports it, and the number is **1.00** — which describes the corpus, not the mechanism. The gold
*is* the policy, so its ceiling is exactly reachable and a loop that learns every convention recovers all
of it. That is the cleanest possible statement of why L2b cannot be a rerun: a recovery gate is only
informative where the ceiling is out of reach, and the current corpus has none.

**Evidence.** 552 tests, coverage **99.84 / 97.65 / 100 / 99.84**; `recovery.ts` 100 across; L0's five
gates pass and its artefact now carries `recovery`; `audit:repo` ok.

### 32 — L4: the metric, and the refusal to invent a number

τ²-bench is reported in **pass^k**, and the estimator is where this lane can fail before any model is
called. `C(c,k)/C(n,k)` is unbiased; `(c/n)^k` understates a deterministic agent; and two of the cases a
reader would guess wrong are pinned by tests — 3 successes in 4 trials at k=4 is **0** (one failure means
the agent cannot be relied on four times), and 2 of 4 at k=2 is **1/6**, not 0. Discovering that after a
two-hour run is an expensive way to learn arithmetic.

The lane ships **without a result**. τ²-retail needs a tool-calling sandbox and a user simulator; the
execution sandbox cannot reach either, so `poc:l4` writes `status_not_run` and exits 0 when `TAU_DRIVER`
is unset. A missing environment is not a failed gate and must not be recorded as one — the same rule that
made B9 a retraction rather than a footnote.

`sota.yml` grows the `l4` job behind `vars.TAU_ENV_READY`, with a 150-minute timeout, the DeepSeek secret,
and two gates: pass^4 ≥ published + 5pp (ALTK-Evolve, τ²-retail, 0.575) and ≥60 tasks. Until the variable
and the driver exist the job is skipped, so the workflow stays honest *and* green.

**Evidence.** 556 tests, coverage **99.84 / 97.66 / 100 / 99.84**; `passk.ts` 100 across; `audit:repo` ok;
`ci` unchanged (the L4 job lives in `sota`, which is manual and variable-gated).

### 33 — The repository boundary, stated and enforced

Asked to migrate the POCs into this repository, I audited every lane against one rule the owner gave:
**a workflow whose test target is microglia belongs in microglia**. All twelve `packages/eval/src/bin/` scripts, the three
`scripts/`, the four workflows and their artefacts measure the library — replay invariants, attack
surface, the study, the live probes, the public benchmark — so the rule puts them where they already are.
Moving them would have separated each lane from the CI that runs it and needed a cross-repo credential for
the product's own green build.

One judgement call is recorded rather than hidden: `scripts/hf-inventory.mjs` measures a Hugging Face
dataset, not the library, and stays because its only caller is the `sota` job, where it turns a failed
benchmark run into a readable one.

What was missing was the **rule in writing**, which is why the question could be asked at all. It is now
§17.35 of the technical design and §11 of the external architecture, and it is enforced: `pnpm audit:repo`
fails if any of the five internal documents appears in the product repository.

**Evidence.** `audit:repo` ok with the new boundary check; 556 tests unchanged; CI green.

### 34 — POC became eval, because the phase ended

The name was design-phase vocabulary that outlived its phase: these scripts no longer prove a hypothesis
before building, they measure a property of a library that is built. Two costs came with the old name —
they lived outside `packages/`, so they escaped the package's typing regime and needed a separate loose
typecheck, and the word itself read as research artefact rather than executable evidence, which is why
the repository-boundary question could be asked at all.

`poc/*.ts` → `packages/eval/src/bin/`, artefacts → `eval/results/`, scripts → `pnpm eval:*`. The lane
logic stays in the package (typed, covered); the CLIs are thin entrypoints excluded from `tsc -b` and
checked by `typecheck:lanes` plus the CI runs that execute them.

Two things surfaced during the move, both worth recording. Three files carried a relative import that
had silently been resolving through the repository root (`../packages/eval/...`) — correct only from
`poc/`, broken from anywhere else; the move found them. And the rename itself produced a CI failure: the
old step survived with a substituted `pnpm eval:typecheck` that was never defined, so a rename that edits
call sites instead of moving them fails exactly the way the original bug did. Fixed in its own commit.

**The design record keeps its POC-nn identifiers.** They number decisions, not files; renumbering them
would rewrite the audit trail. What changed is where the code lives and what it is called.

**Evidence.** 556 tests, coverage **99.84 / 97.66 / 100 / 99.84**; `audit:repo` ok; all three lanes run
from their new home and write `eval/results/`; CI green at `ce65d8a`.

### 35–37 — The instruments land, and one blocking item dissolves

Three small rounds, each closing an instrument rather than a claim.

**35. `reachableShare`.** A recovery ratio divides by headroom, and headroom is only real where the
knowledge can be learned from the training split. `reachableShare` reports the share of evaluated cases
whose `(domain, intent)` key appeared while teaching; `reachableRecovery` refuses a ratio when nothing was
reachable instead of dividing by an empty headroom. Both numbers travel together, because a single blended
figure hides exactly the wall this exists to expose.

**36. The convention corpus.** Each domain gets an exception to the policy for `comparison`; one domain's
exception is never taught. Two controls are built in: a `trend` case per domain, which has no exception and
therefore must be reachable (a failure there is a mechanism problem, not the corpus's wall), and
`unreachableCases()` so a lane can state what it could not have won. Two compile failures caught on the
way — `area` is not a `ChartMark`, and `goldMark` lives in `scenario.ts` — both before the push.

**37. τ²-bench is a repository, not a wheel.** The install path is `git clone --depth 1 --branch v0.2.0`
plus `uv sync`, cached by that ref, with three distinct exit codes: clone 21, sync 22, data 23. An install
that fails must not be read as a score that disappointed.

### W4 revised: the 200 human labels were never the only option

The blocking item said 200 human labels at κ ≥ 0.7 before any judge could be trusted. Public labelled
data exists, and the numbers are published: on MT-Bench human judgments (CC BY 4.0) a GPT-4 judge agrees
with experts **84.6%** of the time with ties excluded, while experts agree with each other **81.0%** — and
the same judge **flips 15.8% of verdicts when A/B are swapped**. `CSML/DIAL` (9,882 comparisons, both
display orders, 22 judges) and `EstellaCheng42/panel` (1,800 pairs, three annotators with adjudication) make
position bias measurable without collecting anything.

What public data cannot do is calibrate a judge on *our* task distribution: those are open-ended dialogue
preferences, ours are "was this attempt better than the last". So W4 splits three ways:

| Layer | Instrument | Human labels |
|---|---|---|
| Generic soundness | MT-Bench + DIAL: agreement and order-flip rate | **0** |
| Task-internal where gold is computable | policy gold (L0) or execution gold (BIRD, τ²) | **0** |
| The remaining open judgement | κ with a confidence interval | **50–100**, not 200 |

The third layer is only entered if the first two leave a question they cannot answer. The blocker is
withdrawn as a blocker and kept as a costed, conditional step.

### 38–41 — Four gates that fail before a run, not after

Four small rounds, each turning a way we have already been wrong into a check.

**38. τ² install path.** Upstream is a repository, not a wheel: `git clone --depth 1 --branch v0.2.0`
plus `uv sync`, cached by that ref, with three exit codes — clone 21, sync 22, data 23. An install that
fails must not be readable as a score that disappointed.

**39. `l4Verdict`.** A pass^4 gate has two ways to fail: the effect misses the bar, or the split is too
short for the effect to mean anything. Collapsed into one boolean, a twelve-task probe becomes "we beat
ALTK-Evolve". They are returned separately and both must be reported.

**40. `pairVerdict`.** The L2b question as arithmetic: two arms, both recoveries, their difference, and
the reachable share they rest on. A difference under the bar is not an improvement, and a delta computed
where nothing was reachable describes the split — both return `pairHelps: false` rather than a quotable
number.

**41. Workflow-to-script resolution.** `poc:typecheck` became `typecheck:lanes` and one workflow step kept
`pnpm eval:typecheck`, which nothing defines. CI caught it in twenty seconds, but only after a push. The
audit now resolves every `pnpm <script>` in every workflow against `package.json`, and it was proven to
fail by probe — a temporary workflow calling `pnpm does-not-exist` produced the exact message, and removing
it restored `audit: ok`.

The pattern across all four: the instrument is built and shown able to fail *before* anything is claimed.
That is the same rule the lanes themselves follow, applied one level down — to the gates.

**Evidence.** 568 tests, coverage **99.84 / 97.69 / 100 / 99.84**; `passk.ts`, `pairs.ts`,
`conventions.ts` at 100 across all four dimensions; `audit:repo` ok with two new checks; CI green at
`76363b7`.

### 42 — L2b runs, and the number that says it cannot answer the question yet

The lane exists. Two protocols teach the same corpus: `single` completes one attempt and corrects it,
`pair` completes attempt one, records it as a failure (`wrong-mark`), opens attempt two from the same pack,
completes and corrects that, with `parentRunId` linking the pair. One store per arm, one teaching pass,
one distillation, the same eight holdout questions.

The corpus needed a change before the lane could mean anything. With one question per `(domain, intent)`
key, every evaluated case belongs to an untaught scope, `reachableShare` is 0 by construction, and the
recovery denominator has no mass in it. So each key is now stated twice — a teaching question and a
holdout question that read *different* category and measure columns from the same schema. The scope
transfers; the field does not. That is what makes 75% of the holdout reachable and leaves the held-out
domain's `comparison` question as the only wall.

**The numbers.** 8 evaluated, 75% reachable, baseline 12.50%, both arms **87.50%**, recovery 0.857 for
each, delta **0.00pp** against a 0.05 bar, `pairHelps: false`. The wall is 0.00 for both arms, which is
what a wall is. The pair arm wrote 11 runs against 6, 5 corrections each, 6 stored items against 5, and
one negative lesson; active constraints are 3 in both arms.

**Why the zero is arithmetic, not evidence.** Two independent reasons, both measured rather than argued.
First, `correctedWithCitation` is **0 of 5 on both arms**: the pass distils once, at the end, so every
correction was answered from an empty pack and neither protocol had a cited rule to blame — the two arms
saw identical evidence and could not have diverged. Second, what the pair arm adds is a lesson of kind
`negative`, and the deterministic reader maps only `constraint` payloads to marks; a lesson the reader has
no channel for cannot move accuracy. The lane reports both, marks the verdict `verdict_is_vacuous: 1`, and
adds a **non-blocking** gate (`l2b-lever-exercised`) that fails today at 0/5. A blocking gate here would
either turn a design limit into a red build or, worse, pass and imply the comparison happened.

The other four gates pass and are the instrument's own claims: the corpus has headroom (no arm at the
1.00 oracle), the wall is real (0.00 both arms), the split has both mass and a wall (75%), and the failure
was recorded (1 negative lesson, 11 vs 6 runs).

**What this does not say.** It does not say pair contrast fails. It says this protocol cannot distinguish
the two, and it names the two changes that would: teach over rounds with a distillation between them so a
correction can cite a rule it disagrees with, or read with an interpreter that consumes negative lessons.
Until one of those exists, the delta stays 0 for reasons that have nothing to do with the mechanism.

**Evidence.** 593 tests, coverage **99.85 / 97.75 / 100 / 99.85**; `lanes/pairs.ts` 100 across all four
dimensions; `conventions.ts` 100 across; all four blocking gates pass, the lever gate reports 0/5 as
designed; `audit:repo` ok; study unchanged (31.79 → 100.00, 17/17 gates); L0 unchanged (+67.88pp).

### 43 — L2b's second attempt: the lever fires, and the answer is still no

Iteration 42 measured a delta of zero that could not have been anything else: a single cold teaching pass
answers every correction from an empty pack, so neither protocol had a cited rule to blame. That is now
fixed at the level where the fault was — the corpus and the schedule — rather than by explaining the zero
away.

**Two rounds, and a convention that moves.** Teaching runs `base` (6 questions), then a distillation, then
`revision` (2 questions), then a distillation, then the holdout. The two revision questions are the
*same* question the first round taught — `sales` and `finance` comparison — with a revised answer
(`REVISIONS`): those domains now want a pie and a line. The store still holds the old rule, the question
retrieves it, the answer is wrong, and the correction cites the rule that caused it. Both arms correct
2 of 2 revisions, and those are the only 2 of 7 corrected attempts that cite a rule — exactly as the corpus intends. The lever is exercised, and
the gate that watched it is now **blocking** rather than advisory.

**The lane found a bug in its own scorer before it found a result.** The holdout of a revised scope was
still judged against the pre-revision answer, so a store that correctly followed the revision was scored
wrong — both arms read 62.50% and the revision round looked like a regression. The holdout now asks the
convention in force *now* (`currentConvention`), and a test pins the rule: for every comparison question,
the holdout gold is the revision when there is one. That is the third time this lane has been the
instrument that caught its own construction rather than the mechanism, which is the pattern worth keeping.

**The numbers.** 18 questions: 6 teach, 2 revisions, 8 evaluated, 1 unreachable. Reachable share 75.00%,
baseline 12.50%, both arms **87.50%**, recovery 0.857 each, delta **0.00pp** against a 0.05 bar. Pair
writes 15 runs against 8, both make 7 corrections, pair stores 1 more item (the negative lesson) and
activates the same 3 constraints. Stale rules: **0 in both arms**. Cross-arm store diff: **0 rules**.
Six of six gates pass.

**Why zero, precisely.** Two measurements, not an argument. First, a correction recorded on the run that
cited the stale rule demotes it in *both* protocols — the edit's own credit reaches the culprit, so the
failure record is a second vote on a decision already taken. Second, and stronger: a correction recorded on
a run that cited **nothing** — a re-generation with an empty pack — still demotes the stale rule, because
a trusted claim at a scope where an active rule disagrees records a *contradiction*, and contradiction
resolution demotes the old rule without any help from credit at all. That second case is a test, not a
paragraph. It says the pair protocol cannot win here by construction: the distiller has already resolved
the conflict before a failure record could add to it.

**What that means for the product.** `outcome(false)` and `parentRunId` stay — a failed attempt is
history, task grouping needs it, and a prose reader can act on the negative lesson. What does not follow
from measurement is a *blame* benefit in the same-scope revision case: it is redundant with contradiction
resolution. Building a feature on the assumption that it exists would have been the expensive mistake.

**What would change the answer.** Either a reader that consumes `negative` lessons (the deterministic
surrogate maps only constraints to marks), or a corpus where a *correct* rule is cited on a wrong answer —
a case this workload's conventions cannot produce. Both are recorded; neither is a corpus problem.

**Evidence.** 605 tests, coverage **99.85 / 97.80 / 100 / 99.85**; `lanes/pairs.ts` and `conventions.ts`
at 100 across all four dimensions; 6/6 L2b gates pass with the lever blocking; `audit:repo` ok; study
unchanged (31.79 → 100.00, 17/17 gates); L0 unchanged (+67.88pp).

### 44 — L4's reader: the lane can now be wrong about a document, and says which way

L4 had a metric layer and no way to feed it. That gap is not cosmetic: the estimator is only as good as
the `(successes, trials)` pairs handed to it, and a reader that guessed would have made a bad run look like
a bad loop. The missing piece was the step between a finished τ²-bench run and `passk.ts`.

**Read upstream first.** `sierra-research/tau2-bench` at `main`, pinned in this repository as `v0.2.0`
(`src/tau2/data_model/simulation.py`, `src/tau2/runner/pass3.py`, `tests/test_results_format.py`). Four
rules came out of it, and all four are refusals rather than defaults:

  1. a trial succeeds on `reward == 1.0` **exactly** — τ² rewards are continuous (database, action and
     communicate checks), so `0.999` is a near miss;
  2. a `null` reward is permitted only for `INFRASTRUCTURE_ERROR` and is **never** a failure — counting it
     as one would attribute the sandbox's failure to the agent;
  3. a partial grid is refused, not averaged: every task needs the same trial count and every claimed task
     needs a result;
  4. two results for one trial are an error, not a merge.

Both storage forms are read: the monolithic `simulations` array and the directory form's
`simulation_index` (`reward` flat, `task_id` sometimes numeric). A `SimulationRun` nests the reward under
`reward_info`; the reader takes either and treats "no reward anywhere" as unscored rather than zero.

**Ten named refusals.** `L4ParseError` carries a `reason` — `unreadable-json`, `missing-tasks`,
`missing-results`, `bad-entry`, `unknown-task`, `duplicate-trial`, `bad-reward`, `bad-trial`, `short-grid`,
`no-scored-tasks` — and the lane writes `status_refused` with the reason, exiting non-zero. That is
deliberately *not* the same outcome as `not-run`: a refusal means the split was measured and cannot be
scored as specified, which is a defective run, while `not-run` means no environment exists. Collapsing the
two is how a broken benchmark becomes a quiet footnote.

**The lane now has three inputs**, in order: `TAU_RESULTS` (re-score a recorded document, no environment
needed), `TAU_DRIVER` (a module that runs the split), and neither (`not-run`). Gates are the pass^4 bar,
the 60-task minimum, and *zero unscored tasks* — the last one exists because the reader drops
infrastructure failures from the denominator, so the count has to be stated beside the score.

**Exercised in CI without the environment.** Two synthetic fixtures (60×4 and 60×2) drive the score path
and the refusal path on every push, with `POC_RESULT_DIR` redirecting the artefact so the committed
`poc-l4.json` stays `not-run` until a real run exists. The 60×2 fixture must fail: a lane that scored it
would be averaging an incomplete grid.

**Evidence.** 625 tests, coverage **99.85 / 97.87 / 100 / 99.85**; `l4.ts` 100 across; `audit:repo` ok;
study unchanged (31.79 → 100.00, 17/17 gates); L0 and L2b unchanged. L4 still has **no result** — the
agent invocation is the part that needs the tool-calling environment, and it is not claimed.

### 45 — The size gate, and a promise about bytes that is now measured

"No runtime dependency" was enforced in the manifest (`audit:repo` rejects an external `dependencies`
entry) and never measured on the artefact a host actually bundles. Those are different claims: a package
can have no dependency and still carry 200 KB of its own code, and a shared module can import a Node
builtin that only fails when someone opens the page.

**One esbuild run, two facts.** The gate bundles both published entry points for `platform: browser`, which
makes a Node builtin an error rather than a silent inclusion, and compares the minified output against a
ceiling:

| entry | raw | gzip | ceiling (raw / gzip) |
|---|---|---|---|
| `packages/browser` | 3,009 B | 1,410 B | 3,200 / 1,600 |
| `packages/core` | 40,133 B | 13,842 B | 42,000 / 15,000 |

The ceilings are **regression ceilings, not targets**: each is the measured size at this commit rounded up,
which leaves room for ordinary edits and none for a dependency. Raising one is a decision that has to be
written next to the number.

**The gate proves it can fail.** `pnpm bundle:size -- --probe` halves the first ceiling and requires the
comparison to reject it, exiting 0 only when the rejection happened. CI runs both. A budget that cannot be
exceeded is not a gate, and the same rule the lanes follow is applied here to the build.

**A planned change that was not needed.** The plan expected `scripts/audit.mjs`'s dependency allowlist to
grow. It did not: esbuild is a root **devDependency**, and the audit's rule is about what ships
(`dependencies` of a published package). Adding it to the allowlist would have widened a rule that exists
to constrain runtime weight, which is the opposite of the intent. The allowlist stays exact.

**Evidence.** `pnpm check` now ends with the size gate (and `eval:pairs`, which was CI-only before);
625 tests, coverage **99.85 / 97.87 / 100 / 99.85**; `audit:repo` ok; study unchanged (31.79 → 100.00,
17/17 gates); CI runs the gate and its probe on every push.

### 46 — Push delivery, and the defect it found in `distill`

POC-19 asked whether push earns a surface. The contract was already written (§17.21): signed body, ordered
per `(taskType, seq)`, at-least-once with `id` for de-duplication. What was missing was the code and a
measurement that could fail.

**Built to the contract, not around it.** `@agentix-e/microglia-core/delivery` carries the three event
types the store can derive (`knowledge.admitted`, `knowledge.superseded`, `knowledge.retired`), a builder
for `task.completed` — from the record the host holds when it closes a task, because the task table is the
host's — a signer, and the dispatcher. The signer is HMAC-SHA256 implemented in the library's own bytes:
`node:crypto` is not in a browser and `crypto.subtle` is async, so ~60 lines of SHA-256 sit in `core`,
verified against RFC 4231 vectors 1, 2 and 6 *and* cross-checked against `node:crypto` at every padding
boundary (0, 55, 56, 63, 64, 65, 119, 120, 1000 bytes). The first run failed at 55: the padding length was
computed one block too long. That is the class of bug a boundary table exists to catch.

**The lane's own numbers found a real defect.** The first run reported **275 events for 50 corrections**.
The dispatcher was fine; `distill` was not. It reprocesses the log from the beginning when the caller
passes no `since` — which every lane and every timer-driven host does — and `mergeEvidence` wrote the item
back with a fresh `updatedAt` even when the candidate's evidence was already in it. So "nothing changed"
and "this rule was rewritten" produced the same observation, and a delivery log reads exactly that to
decide what to send. Fixed at the root: a merge whose evidence, payload and tier are all unchanged is a
no-op and returns the item untouched. Three tests pin it — a second pass leaves the store identical
including timestamps, it publishes nothing, and a *new* observation of the same claim still moves
`updatedAt`. The lane now reports 50 events for 50 corrections, which is the number it should always have
been.

**What the lane measures.** A real `node:http` receiver verifies the HMAC over the raw body, stores by id
and de-duplicates. It stores the *first* request and then loses the acknowledgement, so the retry has to
carry the same id: one retry, one repeat, one stored event. One response is delayed 250 ms so the latency
number can be shown to move — a stopwatch stuck at zero would otherwise pass the bound. 50 corrections
across two task types, one distillation and one publish per batch:

| metric | value |
|---|---|
| events published / delivered | 50 / 50 |
| missed | **0** |
| duplicates (same id, de-duplicated) | 1 |
| retries | 1 |
| signature failures / ordering violations | 0 / 0 |
| p50 / p95 / slowest | 0.6 / 2.6 / 253 ms |
| gates | 7 / 7 |

**What it does not claim.** 2.6 ms is loopback. The contract's 60 s is a ceiling this lane cannot stress,
and the artefact says so instead of inheriting the bound as if it had been demonstrated.

**A documentation defect, found by the same sweep.** §10.3 promised "the seven uncovered branch arms,
named" at 99.53%. The measured state is **2,798 / 2,857 = 97.93%**, i.e. 59 arms — the section had been
stale since the providers and the HTTP surface landed. It is now stated as measured, split into the arms
that are invariant guards (listed with reasons, as before) and the arms that are *reachable and untested*
(listed by file, tracked as G-7). A coverage section that overstates is worse than one that admits a gap.

**Evidence.** 660 tests, coverage **99.86 / 97.93 / 100 / 99.86**; `delivery/{sha256,events,dispatcher}.ts`
and `lanes/delivery.ts` at 100 on branches except one documented guard; `audit:repo` ok; study unchanged
(31.79 → 100.00, 17/17 gates); L0 and L2b unchanged.

### 47 — S2's data path: pinned, verified, and finally checked

W1b was written as "upload the complete Mini-Dev package as a release asset". Before asking for that, the
vendor's own distribution was measured, and the decision dissolved: **no upload is needed**.

**What is actually out there** (measured 2026-10-23, not quoted from a README):

| | |
|---|---|
| url | `https://bird-bench.oss-cn-beijing.aliyuncs.com/minidev.zip`, linked from the benchmark's own site |
| bytes | 800,943,648 (764 MiB), `Last-Modified 2024-06-20` |
| sha256 | `cc48ba16838204e4e214512030cb572eeb5f7bcdd999bae4b9b6ff12ec13b92f` |
| contents | 122 files: **11 SQLite databases**, `mini_dev_sqlite.json`, gold SQL, DDL, table descriptions |
| licence | **CC BY-SA 4.0** (the benchmark changed its data licence on 2024-04-27) |

So the databases were always one direct HTTP GET away. What was missing was a *pin* and a *check*.

**The defect.** `BIRD_ARCHIVE_URL` appeared in the workflow, in the lane's error hint and in the roadmap — and
was **never read by the lane**. With `BIRD_DIR` unset it fell back to `birdsql/bird-critic-1.0-sqlite`'s
`<db>_template.sqlite` files and executed SQL against whatever those contained, without looking. That
matters because of one line in the scorer: `matches(predicted, gold)` is true when both are empty. A
schema-only database therefore scores **every runnable query as correct** — execution accuracy silently
becomes parse accuracy, with no test failing and no number looking odd.

**Did the recorded numbers survive?** Yes, and the artefact is the reason. `poc-sota-bird.json` reports
`gold_exec_rate: 1`, `exec_rate: 0.986` and accuracy **6.83% / 8.90%**. An empty database would have produced
≈98.6%, so the data the lane ran on was populated. The defect was that the lane could not have told us —
which is the difference between a result and a coincidence.

**What ships now.**

- `eval/manifests/bird-minidev.json` — url, bytes, sha256, licence, attribution, extraction root, the eleven
  database ids, retrieval date. `parseManifest` refuses a manifest whose digest is missing or malformed: an
  unchecked digest looks like integrity while falling back to "whatever arrived".
- `sha256OfFile` hashes the download as a stream (764 MiB in memory would be the largest allocation in the
  process) and the digest is verified **before** the zip is opened. A same-size substitution fails.
- The questions are read from `mini_dev_sqlite.json` *inside the archive*, so questions and databases cannot
  disagree about which schema they describe.
- `requirePopulated` opens every database the slice uses and counts rows; a schema-only file stops the run
  with `MG_E_STORE_IO`. This is the gate the lane never had.
- The `_template.sqlite` fallback is **removed**, not repaired: a path that produced an unattributable number
  should not survive as a convenience.

**Verified locally against the real archive** (limit 20, no API key — the run stops exactly at the key):

```
[sota] data ok: debit_card_specializing 5 tables, 423050 rows
[sota] data ok: financial 8 tables, 1079680 rows
… 11 databases, 10,614 to 1,079,680 rows each
[sota] failed: MG_E_CONFIG: DEEPSEEK_API_KEY is required
```

**The decision, restated.** Nothing needs to be uploaded or re-hosted: the repo records the vendor URL and
the digest, and the workflow reads them. `BIRD_ARCHIVE_URL` is now set as a repository variable, so the next
`sota` run fetches, verifies, extracts and measures. The only thing that can still go wrong is the vendor
deleting the object, and that now produces a named error with the expected digest rather than a silently
different dataset.

**Evidence.** 676 tests, coverage **99.87 / 97.92 / 100 / 99.87**; `bird-data.ts` 100 across except one
documented arm; the lane reaches the API-key check with all eleven databases counted; `audit:repo` ok; study
unchanged (31.79 → 100.00, 17/17 gates).

### 48 — The MCP tool surface, and the two defects writing it exposed

§17.21's other half: an agent that runs its own loop can now ask, instead of being handed a prompt block.
`POST /v1/mcp` speaks JSON-RPC 2.0 over the same facade, with exactly two tools.

**Two tools, and a corrected schema.** `microglia_recall` returns the rendered pack plus `_meta.ids`;
`microglia_feedback` takes **`runId`**, not the `taskId` §17.21 originally sketched. Feedback attaches to a
run — one immutable generation — and a task may have several attempts, so a task id cannot say which
attempt was judged; defaulting to "the last one" would blame a generation that may have been right. The
deviation is recorded in the design, not hidden in the code.

Failures split the way the protocol asks: a malformed request is `-32602`, while an unknown run or a
library refusal comes back as `isError: true` with a readable message, because the model is supposed to
retry differently rather than crash. A notification gets `202` and no body.

**Defect 1 — a namespace hole in the facade.** The first `microglia_feedback` test asked what happens when
a facade annotates a run from another namespace. The answer was: it worked. `persistRun` refused a foreign
run, `recordFeedback` did not — so the event landed under *this* tenant while citing a foreign run id, and
the next distillation would have read that run through this tenant's interpreter. One workspace's content
becoming another's knowledge, through an API the docs present as safe. The guard now mirrors `persistRun`,
the refused write leaves no event behind, and the test pins both halves.

**Defect 2 — `note` was accepted and dropped.** `edit(after, { note })` has taken a note since the first
release; `FeedbackSignal` has no `note` field, so the normaliser threw it away. The one piece of human
context an interpreter could use never reached the store, and nothing failed. The edit signal now carries
`note` (redacted, optional), two tests pin presence and absence, and the MCP tool's `note` argument finally
means something.

Both defects were found by *writing the caller* rather than the library: the tool surface is the first
client that exercised these paths in anger, which is the argument for shipping the caller alongside the
capability.

**Evidence.** 699 tests, coverage **99.84 / 97.92 / 100 / 99.84**; `mcp.ts` at 100 lines / 100 functions with
two documented arms; `audit:repo` ok; study unchanged (31.79 → 100.00, 17/17 gates); L0 and L2b unchanged.

### 49 — G-7: the reachable arms, and the seven defects they were hiding

§10.3 had been claiming a small, well-understood gap while the real number drifted: 39 of its 59 uncovered
arms were **reachable and untested**, and they were concentrated in the surfaces added last — the HTTP
server, the MCP tools, the providers, the model-response parser. Taking them was not a coverage exercise.
Seven of them were wrong, and each wrongness was the kind that reports success.

**The defects, in the order they were found.**

| # | What it did | Why it mattered | Fix |
|---|---|---|---|
| 1 | `GET /v1/knowledge?status=bogus` answered **200 with an empty list** | a typo is indistinguishable from "you have no knowledge" — an empty answer to an invalid question | `parseStatusQuery` returns a union; the route answers 400 with the allowed values |
| 2 | `?limit=abc` answered 200 with an empty list; `?limit=-1` dropped the last row | `Number('abc')` is `NaN`, and `slice(0, NaN)` is `[]`; `slice(0, -1)` is off-by-one | `parseLimitQuery` checks digits as text; `2.0`, `1e3`, `0` and negatives are refused |
| 3 | `POST /v1/distill {"generalize": "false"}` applied the **default**, which is the wider behaviour | a string is not a boolean, and the caller was trying to switch the widening *off* | present and not a boolean is a 400 |
| 4 | `POST /v1/forget {"actorHash": …}` always erased nothing and answered 200 | the surface accepted a documented selector it could not satisfy, because ingest never recorded an actor hash | ingest takes `run.actorIdHash`; the event records it; erasure by actor works and is tested end to end |
| 5 | a misspelt run field (`run.taskID`) was dropped in silence | the grouping the caller asked for never happened, so three attempts at one job counted as three independent endorsements | unknown fields at the top level and inside `run` are refused, naming the field |
| 6 | a Zhipu reply with an entry but no vector returned `[]` for that text | an empty vector reaches the index, where every comparison against it is meaningless and indistinguishable from a miss | the provider refuses the reply, naming the entry index |
| 7 | `parseCandidates` discarded a reply whose prose contained a bracket | `Note [1] here: {…}` and `A {brace} then […]` are ordinary replies; the extractor sliced from the first bracket and called the whole reply "not JSON" | every `{`/`[` is tried as a start and scanned to its balanced close, with strings respected |

**Two silent-zero defects in the same family.** `parseCandidates('[1, 2]')` returned the array, which
`parseDistillResponse` then filtered to `[]` — an empty distillation reported as a successful one. An array
with no object in it is now not a candidate list; an *empty* array still is, because "this correction taught
nothing" is a real answer. And the memory-formation harness defaulted `domain` to `sales` and the intent to
a constant when a run did not carry them, so it could have reported an attack on a scope nobody chose; the
interpreter now refuses such a run. Its `markOf` also defaulted a missing mark to **`GOLD`**, which scored a
malformed attack as a blocked one — it throws now.

**The demotion rule moved into the verdict.** The `path` route carried a local branch for "the attacker won
by removing the legitimate rule", and no attempt in the sweep ever took it — a claim with no instance. It is
now part of `judge`, which is a pure function taking the store's items, the pack and the refusal count:
`injected`, `legitimate-demoted`, `rejected-borrowed`, `never-stored`, `active-not-injected` and the status
reason are each asserted directly, including the two the sweep cannot produce.

**Both comparators had only ever been called one way.** `applyKnowledge` reduces in pack order, so a test
that lists the winner first never calls the comparison in the losing direction — and the confidence test was
passing for the wrong reason: with the corpus factory, the lower-weight rule came back *quarantined*, was
filtered out, and the reduce ran over one element. The block now uses literal pack items with explicit
confidence and asserts both orders.

**The numbers.** 39 arms taken: **97.92% → 99.54%** of branches (3087/3101), **751 tests**. Lines and statements 99.97,
functions 100. The 14 that remain are enumerated in §10.3 with the reason each cannot be taken — including
one arm of a sort comparator that depends on V8's call order, which is now stated as such rather than
reported as coverage.

**Regression check.** The ablation study is unchanged (31.79 → 100.00, 17/17 gates), L0 unchanged
(+67.88pp, 706 gained / 0 lost), L2b unchanged (87.50% both arms, 0 rules differing), POC-19 unchanged
(50 events, 0 missed, 1 duplicate), POC-29 unchanged (0.132 overall, 0.4 at the trusted ceiling). Every
artefact was regenerated by the same command and diffed: only latency samples and timestamps moved.

**One refusal recorded rather than fixed.** `?limit=0` is a 400, not an empty page. A count of rows that is
zero is a request for nothing, and the honest answer to "give me zero rows" is not a 200 with an empty
array that looks like a bug upstream.

### 50 — The first real workflow run, and the three defects it found in ninety seconds

Iteration 47 pinned the BIRD archive and iteration 48 shipped the MCP surface, but nobody had **dispatched
the `sota` workflow** since. Doing it was worth more than another unit of reading: the run failed three
times, in three different ways, none of which any test could have caught because they were all in paths
that only exist when the workflow runs.

**Dispatch #1 — `MG_E_CONFIG: fold assignment requires unique ids`.** The lane reached the questions, counted
all eleven databases (10,614 to 1,079,680 rows), and then refused to start. The pinned Mini-Dev file
contains **two byte-identical rows**: `financial#137` and `financial#138` each appear twice, so 500 records
describe **498** questions. The fold assignment is keyed by `db_id#question_id` and correctly refuses
duplicate keys — the guard was right, the dataset is what it is, and the lane had no dedupe because the
previous source happened not to need one. `dedupeQuestions` now drops verbatim repeats, counts them, and
carries the count into the artefact (`duplicate_questions_dropped: 2`); an id that names two *different*
questions still fails with `question-id-collision`, because there is no defensible way to choose.

**Dispatch #1 — the artefact went to a directory nobody reads.** The attribution step looked for
`eval/results/poc-sota-bird.json` and found nothing, because the lane still wrote to
`packages/eval/src/poc/results/` — a path from before the rename. The artefact existed; the job could not
see it. Both now go through `writeJson` in the shared lane library, which honours `POC_RESULT_DIR` and
otherwise writes to `eval/results`.

**Dispatch #1 — the L4 job failed on a variable that does not exist.** `vars.TAU_RESULTS` expands to the
**empty string** when the repository variable is unset, and the lane read `''` as a path: it tried to open
`results.json` in the working directory and died with ENOENT — a missing variable reported as a filesystem
bug. Empty is now absent. Beside it, `TAU_DRIVER` names `./poc/14-driver.mjs`, which does not exist: that
is an environment that cannot be reached, so it reports `not-run` with `status_driver_missing: 1` and a
workflow annotation instead of a stack trace. A driver that loads and then throws still fails the job.

**A fourth defect, removed rather than repaired.** The `sota` job still ran `scripts/hf-inventory.mjs`
against two Hugging Face datasets, with a comment explaining that the lane assembles the benchmark from
them. That stopped being true in iteration 47, and the step was a second opinion about data the lane already
verifies (size, digest, row counts). The step and the script are gone.

**What this says about the instrument.** Three defects in ninety seconds of a path that six green CI runs
had never touched. The merge gate tests the library; nobody was testing the *workflow*, and the workflow is
where a benchmark stops being a claim and becomes a number. The three new CI cases in the L4 step (a scored
grid, a refused grid, a missing driver, an empty variable) are the smallest instalment on that debt: the
reader's contract is now gated in the same place the shipped lane runs it.

**Evidence.** 754 tests, coverage **99.97 / 99.54 / 100 / 99.97**; the data path verified against the real
archive (`dropped 2 repeated question(s)`, eleven databases counted, run stops at the missing API key);
`audit:repo` ok; study and every lane artefact unchanged.

### 51 — Two dispatches, three workflow defects, one 402, and a decision that is finally measured

The S2 lane was pinned in iteration 47 and never dispatched. It has now been dispatched twice, and neither
run produced a benchmark number — for reasons that had nothing to do with the mechanism, and both worth
fixing.

**Dispatch #2 hung for ten hours and published the wrong artefact.** The run sat in its benchmark step with
no completion, and the artefact it uploaded was **87,980 bytes, generated two days earlier** — the committed
file, picked up by an `if: always()` upload step and reported as this run's evidence. Three faults, each
sufficient on its own:

| Fault | Why it was invisible | Fix |
|---|---|---|
| the step had no timeout of its own | five folds × ~700 calls is 2–4 hours; the only cap was the job-level 180 min, which kills without saying where it got to | `timeout-minutes: 110` on the benchmark step |
| the artefact was never deleted before the run | publish/attribute/upload all run with `if: always()`, so a committed result is indistinguishable from a fresh one | `rm -f eval/results/poc-sota-bird.json` before the run; a missing artefact is now an **error** in both steps |
| the evaluation was silent until the end of each fold | a stuck step and a working step look identical in the UI | fold/eval/calls counters printed every five questions |

That last one is the general lesson: **this repository is careful about what a number means and was careless
about whether the number was produced by the process that claims it.** An artefact with no provenance is a
claim, not evidence.

**Dispatch #3 stopped at the first model call: `DeepSeek returned 402`.** The account behind
`DEEPSEEK_API_KEY` has no balance. The lane now reports that as `MG_E_CONFIG` with the fix in the message
("top up the account … then dispatch again") instead of a store error, because 402 is a configuration state,
not a transient failure and not a regression. **There is no new S2 result in this iteration, and none is
claimed.** The three guards above earned their keep immediately: the attribution and publish steps both
failed with "no artefact" instead of printing last week's numbers.

**W3's trigger was asserted; it is now measured.** The index was deferred on "more than 50k rules". The
lane stopped at 10k, so nothing in the repository could say whether 50k was fine. It now measures 1k / 10k /
50k / 100k, with the decision rule written before the numbers: the index is needed when p95 at 100k exceeds
100 ms or when the heap at 100k exceeds 256 MB.

| Items | Build | p50 | p95 | Heap | Pack tokens |
|---|---|---|---|---|---|
| 1,000 | 13 ms | 1.26 ms | 1.91 ms | 6.3 MB | 260 |
| 10,000 | 69 ms | 2.11 ms | 2.68 ms | 29.3 MB | 258 |
| 50,000 | 329 ms | 8.89 ms | 10.76 ms | 113.1 MB | 257 |
| 100,000 | 750 ms | 18.65 ms | **22.73 ms** | **173.9 MB** | 257 |

`index_needed = 0` on both axes, so **W3 stays deferred** — and the lane now fails the build if either
budget is crossed, which is the difference between a deferral and an omission. The latency budget carries a
4x margin (100 ms against 22.73 measured) on purpose: a gate at 50 ms would measure the CI runner. The
10k→100k growth ratio (8.5x) is reported but not gated, because a ratio of two quantiles over 100 samples is
noisier than either budget.

**What the measurement changed.** 174 MB of heap at 100k is the number that matters, not 22.73 ms: a host
notices memory exhaustion long before it notices a 23 ms recall. The index's real benefit at this shape is
moving items off the heap, which is why W3 remains on the roadmap *with a different justification* than the
one it had.

**The CI runner moved the numbers, so the boundary moved with them.** The same lane on the GitHub runner
reports 24.73 ms and **198.6 MB** — 15% more heap than this sandbox. Heap is linear (1.7 KB per rule here,
2.0 KB on CI), so the 256 MB budget is reached at **roughly 130k rules**, not 100k. That is the number to
quote when someone asks when the index becomes necessary, and it is 30% closer than the sandbox suggested —
which is exactly why a single-machine measurement is not the one to publish alone.

**Evidence.** 754 tests, coverage **99.97 / 99.54 / 100 / 99.97**; `pnpm check` green including the new
scale gate; bundle 3,009 / 40,461 B raw and 1,410 / 13,920 B gzipped (ceilings 3,200 / 42,000 and
1,600 / 15,000); study unchanged (31.79 → 100.00, 17/17); L0, L2b, POC-19, POC-29 unchanged.

### 52 — S2 produces a number at last, and the number is a null with a diagnosis

After the credit was topped up, the lane ran end to end for the first time since its data path was
pinned. Two dispatches: a bounded pilot (60 questions, 3 folds) to check the pipeline, then the full split.
The pilot is the one with results to read; the full split is running as this is written and its numbers will
be recorded when it lands.

**The pilot, in full.** 60 questions, 3 folds, arms `none` / `full` / `gated`, 362 model calls, 382,846
tokens, **0 retries**.

| | |
|---|---|
| execution accuracy, no memory | **46.67%** |
| execution accuracy, with memory | **41.67%** |
| delta | **−5.00pp**, CI [−15.00, +5.00] |
| McNemar | p = 0.508 (6 lost, 3 gained, discordance 15%) |
| minimum detectable difference at n=60 | **14.01pp** |
| parse / execution / gold-executable rate | 100% / 100% / 100% |
| rules created / corrections learned / active per fold | 124 / 62 / 40.3 |
| rules per question | 1.90 (pack), 1.17 (gated control) |

Six of seven gates pass. The seventh, V5, fails: at n=60 the smallest detectable difference is 14pp, so the
run **cannot resolve** an effect of the size it is looking for. That gate is advisory on purpose — a small
run is allowed to be a small run — but it means the honest reading is "no detectable effect", not "memory
does not work".

**What the attribution says, which is more interesting than the delta.** Of 124 rules, 74 were injected at
least once: **11 harmful, 5 helpful, 58 neutral**. `harmfulShare` 16.7%. Six of the harmful rules are worth
looking at together, because they share a shape:

```
net=-2  active trust=0.9  "count distinct atom identifiers to avoid row duplication from the join"
net=-1  active trust=0.9  "SUM(...) * 100 / SUM(...) without a REAL cast is wrong in SQLite"
net=-1  active trust=0.9  "'types' instead of 'type' on the cards table causes an execution mismatch"
```

Every one is **true for the query it was learned from** and false as a general rule. None is a
hallucination; all are over-application. That reframes the mechanism's cost: at this sample size the loss is
**retrieval precision and scope specificity**, not distillation accuracy — and it is the kind of error the
promotion gate cannot catch, because the claim was corroborated by a real correction.

**Two instrument defects found while reading the artefact.**

- the attribution published the twenty *worst* rules and nothing else. A reader given a list of suspects
  concludes the pack is uniformly bad; the same table says 11 harmful against 5 helpful, and only one of
  those numbers was visible. `best` now sits beside `top`, the lane prints three of each.
- the two sort comparators ended in `a.id < b.id ? -1 : 1`, which is **not a total order** when the same
  rule appears in two folds: it answers 1 in both directions and the sort may then produce either order.
  They are named and exported, with the fold as the final tie-break, and tested directly in both
  directions — a comparator reached only through `Array.prototype.sort` is verified in whatever order V8
  chooses, which for two or three elements is one direction.

**And two instrument checks that had been thresholds.** `mcnemarExact` is now pinned to nine exact values of
2·P(X ≤ min(b,c)) computed in rational arithmetic outside the implementation (agreement to twelve decimal
places, with the doubled tail capped at 1). The bootstrap interval is checked against the normal
approximation it is meant to reproduce — 400 pairs at 20% discordance give a half-width within 15% of
1.96·√(p_d/n) — and `detectableDelta`'s constant is pinned at 2.802 = 1.96 + 0.84, i.e. 80% power at a
two-sided 5% level. Those three numbers are what turn a run into a claim; before this they were checked
against "less than 0.01" and nothing else.

**What the pilot changes about the plan.** The next S2 experiment is not "more samples". It is an ablation
of the *retrieval* side, because the attribution localises the loss there: scope widening
(`generalize: false`), a stricter corroboration band, or a pack budget that prefers specificity over recall.
The lane already accepts the first as an input (`SOTA_GENERALIZE`), so the ablation costs a dispatch, not a
patch.

**Evidence.** 762 tests, coverage **99.97 / 99.55 / 100 / 99.97**; `attribution.ts` back to 100% of branches;
`pnpm check` green; every other lane unchanged.

### 53 — The full split finishes, and the effect is negative where it can now be resolved

**Result first.** On the whole usable split (n=350, five folds, every question evaluated once by a memory
that never learned from it), the pack costs **4.00 percentage points**: 53.71% without memory, 49.71% with,
95% CI **[−7.71, −0.29]**, exact McNemar **p = 0.0436**, minimum detectable difference **5.19pp**. All eight
validity gates pass, including V5 — the gate that failed the 60-question pilot. The interval excludes zero,
so this is no longer a null: at this sample the mechanism is **harmful on BIRD Mini-Dev**, not inert.

| Arm | Rules/question | Accuracy | Δ vs none | 95% CI | p |
|---|---|---|---|---|---|
| none | 0 | 53.71% | — | — | — |
| full | 2.00 | 49.71% | **−4.00pp** | [−7.71, −0.29] | 0.0436 |
| gated (≥1 shared word) | 1.87 | 50.00% | −3.71pp | [−7.14, −0.29] | 0.0470 |
| oracle | 0 | 82.86% | **+29.14pp** | [24.00, 34.29] | <1e-26 |

Discordance 12%: 28 questions lost, 14 gained. Per fold, the delta is −10.0, −7.1, 0.0, −5.7, **+2.9** —
four folds negative, one positive, which is the shape a real cost takes rather than a single fold carrying
the result.

**Why this run exists when the previous one did not.** The first full-split dispatch spent 160 minutes and
reached fold 4 of 5: it issued every call in series, and a provider stall added 48 minutes on its own. The
lane now plans every prompt for a fold, issues them through a bounded pool (`SOTA_CONCURRENCY`, six),
and scores the replies afterwards in corpus order. Three changes came with it, and each is a finding:

| Change | Why | Effect on this run |
|---|---|---|
| Bounded pool over prompts | a fold is 560 calls at 2–5 s; order does not affect any condition | 160-minute timeout → **35 minutes**, four folds → five |
| Learning-pass cache | cross-fitting asks the same prompt once per fold it appears in; the prompt depends only on the question, its evidence and the schema | **1,050 of 1,400** learning calls removed (hits 1,050, misses 350) |
| Breaker + V8 gate | a per-call retry policy cannot tell noise from an outage | 8 consecutive exhausted prompts end the run as `MG_E_PROVIDER_FAILED`; V8 refuses a result with >2% unanswered prompts. This run: **0 failures in 2,402 prompts** |

**The gated arm answers the question the pilot could not.** A coverage floor of one shared word recovers
**0.29pp** of the 4.00 — 49.71% → 50.00% — while removing only 0.13 rules per question. So the harm is not
"rules the question never mentioned"; the rules that hurt are rules the question *does* mention. That kills
the retrieval-precision-by-keyword hypothesis and leaves scope specificity as the candidate.

**The attribution says the same thing in the rules themselves.** Of 1,304 rules created, 429 were injected at
least once: **24 helped, 53 hurt, 352 neutral** (harmful share 13.3%). The worst three, at net −2 each:

```
A query answering 'which driver ranked first in the Canadian Grand Prix in 2007, give reference name'
  selects forename, surname, and driverRef from drivers joined through results to races filtered on
  race name, year, and rank = 1.
In the formula_1 schema, a race is identified by its name in the races table (e.g., 'Canadian Grand
  Prix'), not by its circuit name in the circuits table.
A ratio of total single bonds to distinct atoms is not the same as the average number of single bonds
  per molecule.
```

The first is a restatement of one question's answer with the question's own vocabulary, which is exactly
what a relevance floor cannot filter: it shares every word with the question it hurts. The second is a true
schema fact whose *scope* is one database and one join path. Both are **over-application**, and neither is a
distillation error — the interpreter wrote down what the correction said.

**What that means for the mechanism, stated plainly.** The flywheel's cost is not that it learns wrong
things. It is that it applies right things too widely, and the promotion path (a corroborated correction, a
trust score, dedupe) has no notion of "this claim was true for one query". Every gate in this lane asked
whether the *number* was valid; none asked whether the *rule* was general, because the rule is not the
lane's to judge. That is a finding about the mechanism, not about the benchmark.

**Two ablations are in flight from this artefact**, both dispatched on `master`:

| Dispatch | Question it answers | Readout |
|---|---|---|
| `generalize: false` | is scope widening the cause? | if the delta shrinks toward zero, the widening is; if it does not, the rules are harmful within their own scope |
| `arms: duplicate, wrong-scope` | dosage and specificity | `duplicate` doubles the pack text: a delta that doubles with it is a dosage effect. `wrong-scope` injects another database's rules: a delta as large as `full`'s means scope is doing no work at all |

**Evidence.** Run `39975019927`, artefact `eval/results/poc-sota-bird.json` (committed; the 60-question pilot
moved to `eval/results/history/sota-pilot-limit60.json`), attribution
`eval/results/poc-sota-attribution.json`. 824 tests, coverage **99.97 / 99.56 / 100 / 99.97**;
`concurrency.ts` and `sota.ts` at **100%** on all four dimensions; `pnpm check` green; CI `39974861391`
success.

### 54 — Three controls, and the one the lane could not measure properly

Two ablations ran from Read 5's artefact, both on `master`, both with eight of eight gates passing and
zero failed prompts in ~2,400:

| Run | Change | none | full | Δ | 95% CI | p | MDD |
|---|---|---|---|---|---|---|---|
| `39981368310` | `generalize: false` (no widening) | 53.14% | 51.14% | −2.00pp | [−5.43, +1.14] | 0.3105 | 4.74pp |
| `39981378703` | dosage + specificity controls | 53.43% | 49.71% | −3.71pp | [−6.86, −0.57] | 0.0294 | 4.46pp |

Run `39981378703` also carried the two controls that answer "what kind of harm is this":

| Arm | Accuracy | Δ vs none | CI | p | Reading |
|---|---|---|---|---|---|
| full (2.01 rules/q) | 49.71% | −3.71pp | [−6.86, −0.57] | 0.0294 | the effect |
| duplicate (same pack twice) | 49.43% | −4.00pp | [−7.43, −0.86] | 0.0243 | **not a dosage effect**: doubling the text does not double the harm |
| wrong-scope (another database's rules) | 53.14% | −0.29pp | [−3.14, +2.29] | 1.0000 | **scope is doing real work**: foreign rules are ignored, same-database rules are followed |

**Three findings, in order of how much they change the plan.**

1. **The harm is not dilution.** `duplicate` injects the pack twice and lands within 0.3pp of `full`
   (−4.00 vs −3.71, intervals almost identical). A token-budget or attention explanation predicts a
   larger loss with more text; it does not appear.
2. **The harm is specific to the database the rule came from.** `wrong-scope` injects two rules per
   question taken from a *different* database and costs 0.29pp with a p-value of 1.0. The model does
   not act on rules it can tell are foreign; it acts on rules that look like they belong. So the
   mechanism's cost is not "any injected text distracts the model" — it is that a *plausible,
   same-database* claim is accepted even when it is about a different question.
3. **Widening carries roughly half the cost, and this comparison cannot prove it.** With widening off,
   the delta goes from −4.00 to −2.00pp and the interval starts to include zero; the attribution agrees,
   with harmful rules falling 53 → 40 and helpful 24 → 25. But the two numbers come from different
   dispatches, their baselines differ by 0.57pp, and their intervals overlap. Estimating a 2pp effect
   from two runs whose noise is about 0.5pp is exactly the kind of comparison this project has been
   refusing to publish.

**So the lane was changed rather than the claim.** `full-narrow` is now an arm: each fold builds a
*second* memory from the same corrections, distilled with `generalize: false`, and answers the held-out
questions from it. Both packs are scored against the same `none` arm on the same questions in the same
run, so the comparison is paired at the question level. The learning passes share the generation cache,
so the second memory costs local store writes and one distillation — not another 280 calls. A new
`narrow_distinct` flag records whether a second memory was actually built, because a run that is itself
unwidened would answer `full-narrow` from the same pack, and two names for one pack must not be read as
a comparison.

**What is still unexplained.** After removing widening, 40 rules still hurt and the delta is still
negative. The remaining explanation is the one the rules themselves suggest: a claim that is true of
one query is being applied to its neighbours *within* the same database. That is a scoping problem at
recall time, not at distillation time, and the next lever is a pack that can say which question it came
from — which is also the constraint Read 5 put on S2b.

**Evidence.** `eval/results/history/sota-ablation-narrow-generalize.json`,
`eval/results/history/sota-ablation-dosage-scope.json` and their attributions, committed. 827 tests,
coverage **99.97 / 99.56 / 100 / 99.97**; `pnpm check` green.

### 55 — The convention lane runs, and two of its three failures are instrument defects

Three S2b dispatches, three lessons, and only the third is about the mechanism.

**Dispatch 1 refused to start.** `thousands` restricted itself to values of at least a thousand, which
looks sensible and contradicts the preregistered subset ("gold is one row with one numeric column"). With
the filter, fewer than twenty questions qualified, and the lane's own threshold of twenty then exited
before it could report anything. Both filters were wrong in the same way: a rule that protects the
experiment from a weak result by refusing to produce one. The subset is now everything the protocol
defines, the only remaining check is that it is non-empty, and a subset below a hundred is recorded by V9
as a direction rather than a verdict.

**Dispatch 2 ran and was refused, correctly.** n=145, five folds, 1,301 calls, no failed prompts:

| Arm | Accuracy | Δ vs none | p |
|---|---|---|---|
| none | 0.69% | — | — |
| full | 2.76% | +2.07pp | 0.375 |
| stated | 4.83% | +4.14pp | 0.031 |
| oracle | 0.69% | +0.00pp | 1.000 |

The channel gate failed because `oracle` must move accuracy by at least 10pp, and it moved it by zero. The
cause was the prompt, not the model: the hint read *"the answer this workspace accepts for this question
is 2500.4; it is the only accepted form"*, and 144 of 145 replies came back as **queries that compute the
raw value**. The hint states a fact about the workspace and leaves the model free to answer the question it
was asked — which it did, correctly, in the only way it knew. The oracle now says to return the value
verbatim and not to divide or round it again.

**The failure also exposed a gap in the instrument.** With the answers at 0.69%, there was no way to tell
"the model cannot follow the convention" from "the scorer is wrong": a rewrite that disagrees with the
transform would produce exactly the same table. **V10** now executes every qualifying gold query rewritten
to report the workspace's way and requires 99% of them to produce the expected value — the convention
lane's counterpart to `gold_exec_rate`, and the gate that makes the next run's 0.69% a statement about the
model.

**And a refused run now names its gates.** It printed "The benchmark ran but cannot support a claim" with
the failing gate in an error field nobody reads; the message carries `V7-channel: 4.14pp` directly.

**What the same night settled about narrowing.** `full-narrow`, the arm that builds a second memory per
fold from the same corrections distilled without widening, ran in one dispatch:

| Arm | Accuracy | Δ vs none | 95% CI | p | rules/question |
|---|---|---|---|---|---|
| full | 50.00% | −4.00pp | [−7.14, −0.86] | 0.0161 | 1.98 |
| full-narrow | 50.86% | −3.14pp | [−6.29, 0.00] | 0.0801 | 1.98 |

**Widening accounts for 0.86pp of the 4.00, not the 2.00 the cross-run comparison suggested.** The earlier
pair (−4.00 with widening against −2.00 without, from two dispatches) had overlapping intervals and
baselines 0.57pp apart; measured properly, the same decision is worth a fifth of the cost, and the narrow
pack is still negative. That is the value of turning an ablation into an arm: the cross-run estimate was
not wrong by a little, it was wrong by a factor of two, in the direction that flattered the explanation
this project was hoping for.

Consequence: the remaining cost is not scope widening, and it is not dosage, and it is not foreign rules.
It is that a claim learned in a database is applied to other questions in the same database. The next
lever therefore has to be at recall: a pack that knows which question each rule came from, and can decline
to apply it to a different one.

**Dispatch 3 is in flight** with the corrected oracle and V10 in place.

**Evidence.** `eval/results/history/sota-arm-full-narrow.json` and its attribution, committed; the refused
run's numbers are quoted from its log and its artefact was never written, which is the lane behaving as
designed. 829 tests, coverage **99.97 / 99.56 / 100 / 99.97**; `pnpm check` green.

### 56 — The convention lane runs cleanly, and says something about the model rather than the memory

The third dispatch completed with **ten of ten gates passing**, including the two that did not exist before it:
V9 (subset 145 ≥ 100, so this is a verdict and not a direction) and V10 (145 of 145 rewritten gold queries
produce the expected value — the scorer is correct, so every following number is about the model).

| Arm | Accuracy | Δ vs none | 95% CI | p |
|---|---|---|---|---|
| none | 0.69% | — | — | — |
| full | 3.45% | +2.76pp | [0.69, 5.52] | 0.125 |
| stated | 5.52% | +4.83pp | — | 0.0156 |
| oracle (value form) | 48.97% | +48.28pp | — | <1e-4 |

**The preregistered gate fails.** S2b asked for `full` to beat `none` by ≥10pp at p<0.05; it beat it by
2.76pp at p=0.125. That is not a null in the sense the BIRD reads were nulls — the baseline is 0.69%,
so the interval's lower bound is at the floor — but it is a failure, and the falsification clause applies.

**What the run does say, and it is more useful than a pass would have been.** The baseline is near zero
*because the convention cannot be inferred*: a model that does not know the workspace reports in thousands
returns the raw figure, and the raw figure is wrong by a factor of a thousand. That is the property the
protocol wanted. What it did not anticipate is the size of the gap between knowing and doing:

- **`stated` — the convention written in the prompt from the start — reaches 5.52%.** One sentence, in
  the workspace's own words, in the prompt, is followed by roughly one question in twenty. The remaining
  nineteen write a correct query that reports the raw value. The knowledge arrived; the output form did not.
- **`oracle` in its first form — "return exactly this value, as a single numeric literal" — reaches
  48.97%.** Half the model's replies are queries rather than the literal, because the task's own
  instruction ("return one SQLite query") outranks a line of context. This is a prompt-form defect, not a
  capability ceiling, and the fix is to stop asking the model to say a number and let it copy a query.
- **`full` at +2.76pp sits between nothing and `stated`**, which is what a mechanism that transmits the
  convention imperfectly would look like if the ceiling it transmits toward is 5.52%.

**The consequence for the protocol is a new gate, not a new claim.** V11 makes the protocol's own oracle
ceiling blocking: the strongest control must reach 90%, because below it the lane is measuring the model's
output format and a delta on top of that is unattributable. V7 already asked whether the channel *responds*
(≥10pp); a channel can respond and still be unusable, and this run was exactly that — 48pp of response, an
unusable ceiling.

So the oracle is now the **rewritten gold query**: the statement the model would have written, reported the
workspace's way. It is the strongest hint that stays inside the task's format, and it is the same form the
ordinary lane has always used. The fourth dispatch runs with it, and V11 will refuse the result if the
ceiling is still short.

**One thing this pair of runs settles for the product.** A house convention that is only *described* is
transmitted at about a fifth of the rate a model can use it, on this task. That is an argument for teaching
conventions with an example of the corrected output rather than a sentence about it — which is also what
the store already holds: every correction is a pair of outputs, and the distilled pack renders them as
prose. The next mechanism experiment should render the *pair*, not the sentence.

**Evidence.** `eval/results/history/sota-s2b-value-oracle.json` and its attribution (the value-form oracle
run, kept because it is the evidence for abandoning it). 831 tests, coverage
**99.97 / 99.56 / 100 / 99.97**; `pnpm check` green.

### 57 — S2b is closed: the ceiling is the format, and two oracle forms both fell short

The fourth dispatch used the strongest hint this lane can give — the rewritten gold query, copied verbatim
into the pack — and V11 refused it:

| Arm | Accuracy | Δ vs none | p |
|---|---|---|---|
| none | 0.69% | — | — |
| full | 2.76% | +2.07pp | 0.250 |
| stated | 4.14% | +3.45pp | 0.063 |
| oracle (rewritten query) | **56.55%** | +55.86pp | <1e-4 |

`V11-channel-ceiling: 56.55%`. The protocol requires 90%, because below it the lane measures the model's
output format rather than its use of knowledge.

**Two oracle forms, both short, and the gap between them is the finding.**

| Oracle form | Accuracy | What it isolates |
|---|---|---|
| the accepted *value* as a literal | 48.97% | the model will not stop writing queries to say a number |
| the rewritten *query*, verbatim | 56.55% | the model will not reliably copy a query either |

Injecting the correct answer in the correct form moves accuracy from 0.69% to about half. The other half
of the replies are the model's own queries — correct, well-formed, and reporting the raw value. **The
model reads the pack as reference material, not as an answer key.** That is not a bug in the lane and not
a property of this dataset: it is what a text-injection channel does when the task's instruction ("write
one SQLite query that answers the question") has more authority than one line of context.

**So the lane is closed, and the closure is a product finding.** S2b asked whether a house convention can
be learned and applied from corrections. The answer on this task is: **it is transmitted at a fifth of the
rate the model can use it, and even a perfect hint only reaches half.** A convention that has a *form* —
units, rounding, precision, ordering — cannot be guaranteed by describing it. It has to be enforced where
the answer is produced (a post-processing step, a renderer, a schema) or demonstrated so concretely that
the model's own generation is a copy.

**Two numbers worth keeping from the two runs together.** `full` moved +2.76pp and +2.07pp across two
dispatches of the same configuration on 145 questions, and `stated` moved +4.83pp and +3.45pp. The
run-to-run spread is about 0.7–1.4pp on this subset, which is why every ablation in iterations 53–55 that
compared two dispatches was treated as suggestive only.

**The falsification clause applies to the protocol as written**, and S3 does not start on this benchmark.
BIRD Mini-Dev remains what Read 5 called it: a place to measure the *cost* of the mechanism, not a place
where its knowledge is load-bearing, because its gold carries no convention and — as this iteration shows —
a convention injected as text is not reliably acted on even when it is handed over.

**What the product does with it.** The user guide now states the boundary explicitly: learned conventions
steer generation, they do not certify form, and a workspace that requires a unit or a precision must apply
it after the model has spoken. That is a smaller claim than "the flywheel teaches your house style", and it
is the one the evidence supports.

**Evidence.** `eval/results/history/sota-s2b-value-oracle.json` (the value-form run), the fourth
dispatch's numbers quoted from its log with no artefact written — V11 refusing to publish is the gate
working. 831 tests, coverage **99.97 / 99.56 / 100 / 99.97**; `pnpm check` green.

### 58 — L4 stops being a lane with no way to run

The reader has been finished since iteration 43 and it has been reporting **not-run** ever since, for the
honest reason that `TAU_DRIVER` named a module nobody had written. That is the state this iteration ends.

**Three files, and one rule about where each decision lives.**

| File | What it does | How it is verified |
|---|---|---|
| `eval/drivers/tau2/microglia_agent.py` | subclasses `LLMAgent`, recalls a pack per turn, prepends one system message **on a copy of the state** | `py_compile`, and the injection point is one method |
| `eval/drivers/tau2/run_split.py` | `list` / `learn` / `eval` phases over the registry, writing upstream's own `results.json` | the argv comes from the tested builder |
| `packages/eval/src/bin/tau2-driver.ts` | split, learn from failures, distil, evaluate over HTTP | end-to-end against a stand-in runner |

**Everything decidable without running is TypeScript and tested.** `tau2.ts` parses the criteria upstream
stores (and refuses a malformed action rather than guessing its call), renders the correction a failed
episode teaches, splits ids deterministically, and builds the argv. That last one is not pedantry: a driver
that passes `--trials` where the script reads `--num-trials` fails *after* the environment is installed,
which is the most expensive possible moment to discover it. `tau2.ts` is at **100% on all four dimensions**.

**A defect found in the wiring, not in the code under test.** `TAU_DRIVER=./packages/eval/src/bin/tau2-driver.ts`
is how anyone would name a driver in a workflow, and a relative specifier in a dynamic `import` resolves
against *the importing file* — so `bin/l4.ts` looked for `bin/packages/eval/...`. It now resolves against
the working directory, and a test drives the whole path — list, split, evaluate, `pass^4` — against a
stand-in runner, which is the only way to check orchestration without a Python clone and hours of calls.

**Why subclass instead of fork.** τ² constructs agents through a registry and calls
`AgentConstructor(tools=…, domain_policy=…, llm=…, llm_args=…)` for every `LLMAgent` subclass, so the
constructor is unchanged and only `generate_next_message` is wrapped. The memory is injected as *context*
— one extra system message — which is what the product claims to produce, and it keeps the injected text
auditable in τ²'s own simulation records. A copy of the state per turn is deliberate: appending to the
shared state would accumulate one pack per turn, and a ten-turn episode would carry ten copies.

**Why the facade serves one endpoint.** The agent runs in another process, so recall has to cross a
boundary. It crosses the smallest one that exists: `GET /v1/recall`, read-only. Feedback is written by the
driver in-process, where the store is, so the agent cannot mutate what it is being measured against.

**Status: ready, still not-run.** The job remains gated on `TAU_ENV_READY`, because hours of model calls
should need a switch rather than a default. What changed is that the switch now has something behind it,
and `TAU_MEMORY=false` runs the reference arm alone — the cheap way to check the wiring before paying for
both arms.

**Evidence.** 869 tests, coverage **99.97 / 99.57 / 100 / 99.97**; `tau2.ts` and `model-client.ts` at 100%;
`pnpm check` green; a local end-to-end run of `pnpm eval:l4` against a stand-in runner produced
`pass4=0, tasks=4, gates_passed=1` with the two expected failures (coverage below 60 tasks, and a
stand-in that never passes), and exited non-zero on them.

### 59 — L4 runs a split, and the lane is no longer a promise

Five smoke dispatches, each one a layer deeper, and the fifth completed:

```
[poc-l4] pass4=0.5 published_pass4=0.575 delta=-0.075 tasks=2 unscored_tasks=0 min_tasks=60 k=4 gates_passed=1
```

Two held-out tasks, four trials each, **memory on**: the driver learned from two training tasks, distilled,
started a one-endpoint facade, and answered the held-out pair through `MicrogliaAgent`. `pass^4 = 0.5` with
`published = 0.575` and **one of three gates passing** — and the lane exited non-zero, which is the correct
outcome for two tasks against a 60-task coverage floor. The number is not a result; the run is.

**Five defects, one per dispatch, all in the wiring rather than in the code under test.**

| Dispatch | Died at | Cause | Fix |
|---|---|---|---|
| 1 | before the lane | `TAU_DRIVER` was a stale repository variable pointing at `./poc/14-driver.mjs` | variable repointed; the job's second switch is now a dispatch input |
| 2 | task listing | system `python3` cannot import tau2 | prefer `.tau2-bench/.venv/bin/python` |
| 3 | first episode | `run_tasks` does `if "seed" in llm_args_agent` and both `llm_args_*` default to `None` | pass `{}` |
| 4 | first model call | litellm imports its MCP handler eagerly; `mcp` is optional and undeclared | install it in the environment step |
| 5 | completed | — | — |

A sixth defect was found by reading rather than by running: when `save_to` already exists, `run_tasks` opens
an **interactive prompt** asking whether to resume. In CI that is a hang, not an error. The phase runner now
deletes its target first, so the branch is unreachable rather than unlikely.

**What the full run costs, measured rather than guessed.** τ²-retail carries 115 tasks. A 50/50 split gives
57 held out, which is *below* the lane's 60-task coverage floor — so a full run needs `TAU_TRAIN_SHARE=0.4`
(46 train, 69 test). That is 276 episodes at four trials, plus 46 learning episodes: at the observed pace
this exceeds the 200-minute step budget, so a full L4 run needs sharding across jobs or a longer window. That
is a design decision for the next iteration, and it is now a measured constraint rather than a guess.

**Also fixed while reading the logs.** A gate whose sample had no discordant pairs printed
`minimum detectable Infinitypp`; it now says `not estimable: no question changed hands`. And the driver
captured the subprocess, so a *successful* phase left no trace in the job log at all — each phase now prints
the tail of its summary, which is what made the run above readable.

**Evidence.** Run `40072968214` (L4 job), 870 tests, coverage **99.97 / 99.57 / 100 / 99.97**; `pnpm check`
green.

### 60 — L4's first comparable number: 0.5294 against ALTK-Evolve's 0.575

The memory arm, on the whole held-out half of τ²-retail (`40077598797`):

| | Value |
|---|---|
| Held-out tasks | **68** (114 in the set, 0.4 train share — the floor is 60) |
| Trials per task | 4 |
| **pass^4** | **0.5294** |
| Published (ALTK-Evolve, same split) | 0.575 |
| Delta | **−0.0456** |
| Unscored tasks | 0 |
| Gates | **2 of 3** — coverage and full-scoring pass, the `+5pp` bar fails |
| Wall clock | 34 minutes (learn 46 tasks: 5; evaluate 68×4: 28) |

Thirty-six of sixty-eight tasks passed all four trials. The lane exits non-zero because
`0.5294 < 0.575 + 0.05`, which is the honest verdict: **on this split the loop is 4.56pp behind the
published result, not ahead.**

**What this number is, and what it is not.** It is the first L4 figure this project has ever produced, and
it is a *complete* split — every held-out task scored, no infrastructure failures discarded, the same
metric (`pass^4`) and the same published reference. What it is not is the comparison that matters: it
measures the memory arm against a published number, not against *the same agent without the memory*. Those
differ for a reason worth stating — the reference was produced by another system on another day with its
own prompts — so the only reading it supports is "the loop, as wired here, is slightly behind".

**The reference arm is in flight** (`TAU_MEMORY=false`, same 68 tasks, same trials, same model, no store).
That comparison is paired at the task level and is the one that answers the project's question. Until it
lands, this table must not be read as "the memory costs 4.56pp" — it cannot distinguish the memory from
the harness.

**Two measurements worth keeping.** The cost is now known rather than estimated: 34 minutes for 276
episodes at concurrency 4, which means the 200-minute step budget was never the binding constraint that
iteration 59 assumed — a full run fits with room to spare, and the earlier "needs sharding" conclusion was
based on an extrapolation from four tasks that did not scale. And the split had to move to 0.4: at 0.5 the
held-out half is 57 tasks, under the lane's own 60-task floor, so a 50/50 split on this domain can never
produce a scoreable run.

**Evidence.** Run `40077598797`, job `120824247341`; the artefact is `eval/results/poc-l4.json` inside that
job's upload. 870 tests, coverage **99.97 / 99.57 / 100 / 99.97**; `pnpm check` green.

### 61 — L4 both arms: the memory costs 5.89 pass^4 points

One configuration, one split, two dispatches started together (`40087279176` memory, `40087284586`
reference), 68 held-out τ²-retail tasks, four trials, concurrency 2, litellm retries at 4:

| Arm | pass^4 | Δ vs published (0.575) | Gates | Wall clock |
|---|---|---|---|---|
| **reference** (same agent, no store) | **0.6471** | **+7.21pp** | **3 of 3** | 52 min |
| **memory** (learn 46 tasks, distil, recall) | **0.5882** | +1.32pp | 2 of 3 | 60 min |

**The memory costs 5.89 pass^4 points on this task.** That is the number the lane exists to produce, and it
points the same way as every other measurement in this project: −4.00pp on BIRD, −5.89pp here, with the
mechanism never ahead.

**The reference arm is the more surprising result.** Without any store, this harness **beats the published
ALTK-Evolve number by 7.21pp and passes all three gates** — the first time any L4 run has been green. So the
lane is sound and the reference is beatable; what is not established is that the *memory* is what would beat
it. On this evidence it is what stops the agent beating it.

**What this comparison is, and what it is not.** Both arms are the same agent, the same model, the same
split, the same trials, the same day. They are not *paired*: pass^4 is a mean over tasks, and the only
quantity these two artefacts support is the difference between two means (0.6471 − 0.5882). No interval, no
p-value. That gap is now closed in the lane — `PassAtKInput` carries a task id, every artefact records
per-task outcomes, and `TAU_REFERENCE` points at the other arm's artefact so the same tasks are compared
directly, with a blocking `l4-paired` gate — but the two runs below predate it and must be read as a
difference of means.

**A configuration decision that had to be made twice.** The first full memory arm was measured at
concurrency 4 without retries (0.5294) and its reference arm died on a `429` one minute from the end. Numbers
from different settings are not comparable, so both arms were re-run at concurrency 2 with `num_retries=4`.
The first attempt is kept as `l4-memory-arm-first-attempt.json`; it is the evidence for why settings are part
of a result.

**Evidence.** `eval/results/history/l4-arm-reference-c2.json`, `eval/results/history/l4-arm-memory-c2.json`;
870 tests, coverage **99.97 / 99.57 / 100 / 99.97**; `pnpm check` green.

### 62 — The retriever is not the problem, and the probe that says so

The three negative results (−4.00pp BIRD, −5.89pp τ², and every ablation between) share one question:
was the right rule in the pack? This iteration answers it with measurement instead of architecture, and
the answer excludes the explanation everyone reaches for first.

**The lexical signal is not weak. It is absent.** Recomputed from the committed BIRD artefact — 350
questions, 701 injections, 46 rules credited with a hurt and 19 with a help:

| Group | Median word coverage | Median identifier coverage |
|---|---|---|
| rules credited with a hurt | **0.133** | 0.000 |
| rules credited with a help | **0.130** | 0.000 |

The two groups are the same. That is why the coverage gate recovered 0.29pp of a 4.00pp cost: a keyword
threshold is not a weak relevance signal on this data, it is not a signal.

**So the same question was asked of an embedding** (`poc-embed-probe`, Zhipu `embedding-3`, 415 texts,
5,000-resample permutation test over 222 (question, credited-rule) pairs):

| Group | n pairs | Median cosine | Mean |
|---|---|---|---|
| hurt | 152 | **0.232** | 0.242 |
| helped | 70 | **0.228** | 0.235 |

**Gap −0.004, p = 0.86.** The harmful rules are exactly as close to their question as the helpful ones.
Rebuilding recall around a semantic index — which is what ReasoningBank, A-MEM and MemHarness all do —
would have bought nothing on this data, and this probe cost four minutes instead of a week.

**What this reframes, and it is not a small reframe.** The failure is not "the wrong rule was retrieved".
It is that a rule can be *maximally relevant* and still wrong to apply: `"A query answering 'which driver
ranked first in the Canadian Grand Prix in 2007' selects forename, surname, and driverRef…"` is about as
close to a Formula-1 question as a rule can be, and it is still a statement about a *different* question.
Relevance and applicability are different quantities, and the store only ever modelled the first.

**The literature reached the same place from the other side.** Three papers found in this iteration's
search say what the measurement says:

- *Large Language Model Agents Are Not Always Faithful Self-Evolvers* (arXiv 2601.22436): replacing a
  distilled insight with random characters often changes nothing, and when condensed experience does land
  it fails in three ways — distraction, overreliance on stale priors, premature inference. Raw trajectories
  are used faithfully (removing them: 75% → 2%); condensed summaries are not.
- *Stop Replaying Memories. Rewrite Them.* (MemHarness, arXiv 2607.28272): a 76.4% ALFWorld agent drops to
  **52.0% with Mem0** and 54.5% with SimpleMem — a *bigger* collapse than ours — and the diagnosis is
  explicit: "better search cannot fix a mismatch that lives outside the ranking". Their fix is to
  reconstruct rather than replay: retrieve, **critique the memory against the current state**, then act.
- *ReasoningBank* (ICLR 2026): memory items carry a **"when to use"** description alongside the content,
  retrieval is dense-vector with MMR, and failures are distilled into *preventative* lessons; +8.3% WebArena
  over memory-free.

Together they say the same thing our numbers say: the store models *what was true*, never *when it is
true*, and the prompt asks the model to treat the former as the latter.

**What the next change is, and what it is not.** Not a better index — that is now measured out. The next
change is to the *shape of a rule*: a distilled item should carry the condition under which it applies
(ReasoningBank's `when to use`, MemHarness's "state it was formed under"), and the pack should present the
condition as something the model evaluates rather than a prefix it obeys. A rule that says "when a question
names a race, the join goes through `results.raceId`" is applicable; "a query answering <one question>
selects …" is not, however close it sits.

**Evidence.** `eval/results/poc-embed-probe.json` (committed), `pnpm eval:probe`, workflow run `40094204125`.
Pure logic — attribution, pairing, permutation test — at **100% on all four dimensions**; 883 tests;
coverage **99.97 / 99.55 / 100 / 99.97**; `pnpm check` green.

### 63 — The condition is read and does not help, and the rules are no longer the problem

Iteration 62 ended with a plan: if the retriever cannot separate a harmful rule from a helpful one,
change the *shape* of the rule — give it the condition it was learned under, render the condition first,
and tell the reader to apply it only where it holds. That is now built, measured, and null.

**First, the instrument, because the null is only readable with it.** A run in which the distiller
produces no condition has two identical arms and a delta of zero that means nothing. So the lane counts
what it injected (`injected_rules`, `injected_with_condition`, `active_with_condition`), V12 records the
share as an advisory gate, and the freeze digest now covers the field. On this run:

| Measurement | Value |
|---|---|
| Rules distilled (5 folds) | **1,296**, every one with a condition |
| Rules ever injected | **640**, **640** carrying a condition (**V12: 100.0%**) |
| Rules that restate a question verbatim (6-gram overlap with the fold's questions) | **0 of 49** credited rules |
| SQL strings that differ between the two shapes | **169 of 350** (48%) |
| Verdicts that differ between the two shapes | **20 of 350** |

**The measurement** (`40097881545`, n=350, five folds, 2,048 prompts, 0 unanswered, 9 of 9 gates):

| Arm | Accuracy | Δ vs none | 95% CI | p |
|---|---|---|---|---|
| none | 53.43% | — | — | — |
| **full** (condition rendered before the claim) | **50.29%** | **−3.14pp** | [−6.00, −0.29] | 0.052 |
| **full-plain** (same items, condition removed) | **50.29%** | **−3.14pp** | [−6.29, −0.29] | 0.052 |
| **full vs full-plain, paired** | — | **0.00pp** | **[−2.57, +2.57]** | **1.000** |

Twenty questions changed verdict and the score did not move: **ten lost, ten gained**. That is what the
paired row says, and it is the strongest form of the result the lane can produce — same items, same
retrieval, same questions, one field of text different.

**What it means, in the order the evidence supports it.**

1. **The field is read.** Half the SQL changed. This is not a null in which the model ignored the block;
   the block materially changed what it wrote, on 48% of questions.
2. **It does not help.** The changes cancel exactly: 10 down, 10 up, p = 1.0. The condition redistributes
   errors rather than reducing them.
3. **The rules are not the problem any more.** With the new distillation prompt, **none** of the 49
   credited rules restates the question that taught it — the failure Read 5 diagnosed ("a restatement of
   one question's answer with the question's own vocabulary") is gone, and the harm survives it: 33 rules
   harmful, 16 helpful, 346 neutral, 10.8% of injections belonging to a harmful rule.
4. **So the harm is a confident true rule in the wrong place.** The worst three, all conditioned, all
   true statements:

```
A percentage change between two periods is computed by dividing the difference by the earlier period's value.
The order of selected columns follows the order in which the question requests them.
The column holding the customer category value 'LAM' is Segment, not Currency.
```

None is false. Each is a rule that a reader who cannot check applicability will apply anyway — which is
exactly what happened, and what the condition was supposed to prevent.

**And a correction to iteration 55.** Every control in this lane was described by its delta against
`none`, and the difference between two controls was read as the difference of two deltas — a point
estimate with no interval. The lane now pairs each control with `full` directly (`armPairsAgainstFull`,
`arm_pairs` in the artefact, `pnpm eval:arm-pairs` for artefacts that already exist). Run on the committed
`full-narrow` artefact it says:

| Pairing | Δ | 95% CI | p |
|---|---|---|---|
| full-narrow vs full | **+0.86pp** | **[−2.00, +3.71]** | **0.71** |

The number is what iteration 55 reported; the statement is not. "Widening accounts for 0.86pp of the
4.00" reads as a measured contribution. What the paired test says is that it is indistinguishable from
zero at this sample, and the earlier phrasing should never have been published as a magnitude.

**What is left, and why it is not another prompt.** Five levers have now been measured on this mechanism:
retrieval signal (no separation, iteration 62), scope widening (p = 0.71), dosage (null), foreign rules
(ignored), and the shape of the rule (0.00pp, p = 1.0). The remaining difference between a rule that helps
and one that hurts is *whether it applies to this question*, and every one of those five measurements says
a language model reading prose cannot decide that. The next change therefore has to make applicability
**machine-checkable** — a predicate the runtime evaluates against the question and the schema — or the
mechanism's honest scope is "steers what the model writes, does not certify that it should".

Before building that, one cheap measurement decides whether it can work at all: a probe that embeds each
rule's `when` and asks whether condition-question similarity separates the pairs that hurt from the pairs
that help. Iteration 62 asked that of the statement and got p = 0.86; the condition is a different text
and it is the one a filter would use.

**Evidence.** `eval/results/poc-sota-bird.json`, `eval/results/poc-sota-attribution.json`,
`eval/results/poc-sota-arm-pairs.json`, and the previous full split kept as
`eval/results/history/sota-read5-full-split.json`. 918 tests, coverage
**99.97 / 99.59 / 100 / 99.97**; `render.ts`, `distiller.ts`, `llm.ts`, `knowledge.ts` and
`attribution.ts` at 100% on all four dimensions; `pnpm check` green; CI `40098496074` success.

### 64 — The retrieval door closes too: a harmful rule is the *closer* one

Iteration 63 removed the last textual explanation the plan had, so the question returned to retrieval in
the only form it had not been asked: not "which rule is close to this question" but "does this rule
apply". The probe scores three texts over the same 148 (question, credited rule) pairs on that run's
artefact — 105 hurt, 43 helped — with Zhipu `embedding-3` and a 5,000-resample permutation test:

| Text scored | Hurt (median cosine) | Helped (median cosine) | Gap (helped − hurt) | p | Separates |
|---|---|---|---|---|---|
| the statement (what a retriever ranks on) | 0.254 | 0.226 | **−0.027** | 0.120 | no |
| **the condition** (what a filter would compare) | 0.313 | 0.278 | **−0.035** | 0.062 | no |
| the condition, lexically (`queryCoverage`) | 0.000 | 0.000 | 0.000 | 1.000 | no |

**Two of the three point backwards.** The harmful rules are *closer* to the questions they damage than the
helpful rules are to the questions they help, on the claim and on the condition. A similarity gate over the
condition would therefore preferentially keep the rules that hurt — the filter would be worse than
nothing, which is a stronger statement than "the signal is weak".

**The lexical row explains why.** `queryCoverage` between a question and a condition is **zero at the
median for both groups**: conditions are written as abstract properties ("the question asks for a
percentage of a specific element within a filtered group") and questions are concrete ("Calculate the
average number of oxygen atoms…"). Word overlap between them is not a weak signal, it is not a signal.

**What the five levers now say together.**

| Lever | Test | Result |
|---|---|---|
| Retrieval signal (statement) | cosine separation, 222 pairs | p = 0.86, backwards |
| Scope widening | `full-narrow` paired against `full` | +0.86pp [−2.00, +3.71], p = 0.71 |
| Dosage | pack injected twice | −4.00pp vs −3.71pp: no dose response |
| Foreign rules | another database's pack | −0.29pp, p = 1.00: ignored |
| Rule shape (`when`) | paired against the same items without it | 0.00pp [−2.57, +2.57], p = 1.000 |
| Retrieval signal (condition) | cosine separation, 148 pairs | p = 0.062, backwards |

The mechanism does not lose because it retrieves the wrong rule, because it widens too far, because it
says too much, because it says the wrong thing, or because it fails to say when it applies. It loses
because a *true* rule, close to the question, correctly scoped and correctly conditioned, is still applied
to a question it does not fit — and every signal available before generation says it fits.

**So the next lever is not a signal at all: it is corroboration.** Every harmful rule in the last two
runs was activated by a *single* correction, and the store's policy already distinguishes a claim with one
observation from one with three. The pack has never been filtered on that distinction, which makes it the
one quality axis that is measured rather than inferred: an arm that injects only rules corroborated by at
least two independent corrections. If the harm disappears when single-observation rules are withheld, the
answer is not "read the condition better" but "do not promote one correction to a rule".

**Evidence.** `eval/results/poc-embed-probe.json` (committed), `pnpm eval:probe`, workflow run
`40102511693`, 920 tests, coverage **99.97 / 99.59 / 100 / 99.97**; `embed-probe.ts` at 100%;
`pnpm check` green.

### 65 — Corroboration is the dividing line, and an empty pack measures the noise floor

The corroboration arm asked the one question the five signal-based levers could not: not "does this rule
apply" but "has this rule happened more than once". The answer on BIRD is that **no rule has**:

| Measurement | Value |
|---|---|
| Rules distilled (5 folds) | 1,296 |
| Rules with ≥2 independent corrections | **0** |
| Rules injected by the corroboration arm (floor 2) | **0.00 per question, on all 350** |

So the arm degenerates to "no pack" — and that accident produced the most useful control this lane has
ever had, because an empty pack and no pack are the same prompt:

| Arm | Correct | Δ vs none | 95% CI | p | rules/question |
|---|---|---|---|---|---|
| none | 189/350 (54.00%) | — | — | — | 0 |
| **full-corroborated** (0 rules injected) | **190/350 (54.29%)** | **+0.29pp** | [+0.00, +0.86] | 1.000 | 0.00 |
| full | 182/350 (52.00%) | −2.00pp | [−4.86, +0.86] | 0.248 | 1.78 |

**One question in 350 was answered differently when the same prompt was run twice** — 0 lost, 1 gained.
That is the lane's within-run noise floor, **0.29pp**, and every cost measured in iterations 53–64
(−2.00 to −4.00pp) is seven to fourteen times it. The earlier readings never had this denominator; they
used a between-run comparison that mixed provider variation with the mechanism.

**The corroboration floor is now a pack-layer option**, because it is the same kind of decision as
`minCoverage`: which rules may reach the prompt. It runs before MMR, so a corroborated rule takes the slot
an uncorroborated one would have occupied, and a nonsense threshold is clamped to the shipped behaviour.

**What it costs where the mechanism does work.** The chart study repeats six defect families, so most of
its rules are corroborated and the floor barely binds — but it binds at 3.57pp:

| Workload | Floor 1 (shipped) | Floor 2 |
|---|---|---|
| chart study (recurring defects) | **100.00%** (+68.21pp) | **96.43%** (+64.64pp) |
| BIRD Mini-Dev (unique corrections) | 52.00% (−2.00pp) | **54.29% (0 rules, +0.29pp)** |

That pair is the clearest statement this project has produced about its own mechanism: **the lift and the
harm are the same property seen on two corpora.** Where a mistake recurs, a rule is corroborated and
injecting it removes the mistake (+68.21pp). Where every correction is unique, every rule is a single
observation, nothing can be corroborated, and injecting them is noise that costs 2–4pp. The number that
separates the two worlds is `evidence.length` on the store, and it is available before the first
inference.

**Why the default does not change.** Floor 2 would cost every user with a recurring workflow 3.57pp of a
68.21pp lift to protect a user whose corrections never repeat. That is a trade a host makes with its own
numbers — the guide now shows both — not one an upgrade makes silently. `minEvidence` defaults to 1, and
the user guide states how to tell which world you are in.

**Evidence.** `eval/results/history/sota-arm-corroborated.json` (this run's artefact),
`bench/results/study.json` (the `corroborated-only` arm), 927 tests, coverage
**99.97 / 99.59 / 100 / 99.97**; `pnpm check` green; study gates PASS.

### 66 — Requiring a decision does not help either, and a capability that was connected in neither end

Two things happened in this iteration, and the second is the kind of defect the project exists to
find.

**The critique arm** (`40151786002`, n=350, five folds, 2,060 prompts, 0 unanswered, 9 of 9 gates):
instead of asking the model to *remember* a condition, the prompt requires a **decision** about each
item — `<id>: apply` or `<id>: skip` with one clause of reasoning — and says the query may use only the
items marked apply. That is MemHarness's critique step, with the call count unchanged:

| Arm | Accuracy | Δ vs none | 95% CI | p |
|---|---|---|---|---|
| none | 53.14% | — | — | — |
| full | 50.29% | −2.86pp | [−5.71, +0.00] | 0.076 |
| **critique** | **50.57%** | **−2.57pp** | [−5.43, +0.29] | 0.122 |
| **critique vs full, paired** | — | **+0.29pp** | **[−2.29, +2.86]** | **1.000** |

Twenty-three questions changed verdict — 11 lost, 12 gained — for a net of +0.29pp and p = 1.000. So the
requirement was followed (the answers moved) and the quality did not. This is the seventh lever measured
on this mechanism and the fifth null:

| Lever | Result |
|---|---|
| retrieval signal, claim | p = 0.86, backwards |
| retrieval signal, condition | p = 0.062, backwards |
| scope widening | +0.86pp [−2.00, +3.71], p = 0.71 |
| dosage / foreign rules | no dose response; foreign rules ignored |
| rule shape (`when`) | 0.00pp [−2.57, +2.57], p = 1.000 |
| **required decision (critique)** | **+0.29pp [−2.29, +2.86], p = 1.000** |

**The defect: the pairing step had nothing to pair.** The L4 job now runs both arms in one job and a
pairing step compares them per task. It ran, and exited with `first artefact has no per_task rows` —
correctly, because **no code ever wrote them**. `bin/l4.ts` read a reference artefact's rows; nothing
produced them; and the `l4-paired` gate had reported `pass` on every run since it was added, on the
grounds that there was no reference arm. A gate whose input is never produced is worse than no gate: it
reads green.

`perTaskRows` now writes them, refuses a task with no id rather than labelling it `unknown`, and is
tested both ways. The run that exposed it is kept: **memory 0.5588 against reference 0.6324** on the same
68 tasks — −7.35pp as a difference of means, and the reason the pair was worth building.

**What the two workloads now say together.** On BIRD the corrections never repeat and the pack costs
2–4pp; on τ²-retail the 46 training tasks are also corrected once each, and the memory costs 7.35pp; on
the chart study six defect families recur and the pack is worth +68.21pp. That is one property seen three
times, and it is measurable on the store before any inference: the share of active rules with more than
one observation.

**Evidence.** `eval/results/history/sota-arm-critique.json` and its arm-pairs file (committed); the L4
numbers are quoted from run `40133305087`, whose artefacts could not be paired for the reason above and
whose re-run carries the rows. 937 tests, coverage **99.97 / 99.59 / 100 / 99.97**; `pnpm check` green.

### 67 — L4's paired comparison reverses the sign, and the bar was never reachable

The pairing step finally ran on two arms of one split (`40151780732`, 68 held-out τ²-retail tasks,
four trials, concurrency 2, retries 4):

| Arm | pass^4 | Tasks passed |
|---|---|---|
| reference (no store) | **0.5147** | 35/68 |
| memory | **0.5294** | 36/68 |
| **paired, memory − reference** | **+1.47pp** | **[−13.24, +16.18], p = 1.000**, 13 lost / 14 gained |

**The sign is the other way round.** Iterations 60 and 61 reported −4.56pp and −5.89pp, both as
differences of two *means* from single runs. Paired, the same two arms differ by **+1.47pp** and the
interval spans 30 points. Those earlier numbers were not small effects measured imprecisely; they were
noise with a sign attached.

**Why the noise is this large, in one line.** The standard error of a paired difference is
`sqrt(lost + gained) / n`: 27 discordant tasks out of 68 is **7.6pp**, so the 95% half-width is **15pp**.
The lane's bar is 5pp, which was never inside the design's reach:

| Resolution at n=68 | Value |
|---|---|
| Standard error | **7.64pp** |
| 95% half-width | **14.98pp** |
| Tasks needed for a 5pp half-width | **611** |
| Tasks needed for a 3pp half-width | 1,695 |
| τ²-retail tasks in total | 114 |

So a 5pp claim about this mechanism on this domain is unreachable twice over: the sample is 68, the
domain holds 114, and the arithmetic asks for 611. `l4-resolution` now reports this beside every delta,
advisory, with the count it would need.

**The same arithmetic dissolves the one positive L4 claim.** The reference arm — same configuration,
three runs — scored **0.6471, 0.6324, 0.5147**. A 13.2pp range for a run that changed nothing, against a
`published + 5pp` bar of 0.625: two of the three reference runs fall below the published number and one
clears it. "The harness beats ALTK-Evolve by 7.21pp" was a single draw from that distribution.

**What this changes in the plan, and what it does not.** L4 cannot answer "does the memory help by 5
points" without a corpus four times the size of the domain. What it *can* answer is a question with a
large effect, and that is what the lane should be pointed at — or the domain should be pooled (retail 114
+ airline 50 + telecom 45 still leaves it at about a third of the requirement). The mechanism's precondition
finding from iteration 65 is untouched by this: BIRD's paired measurements are on 350 questions with a
0.29pp floor, and the corroboration result there is a count, not an estimate.

**Evidence.** `eval/results/poc-l4-pair.json` (regenerated with the resolution block),
`eval/results/history/l4-arm-memory-67.json`, `eval/results/history/l4-arm-reference-67.json`.
946 tests, coverage **99.97 / 99.59 / 100 / 99.97**; `pnpm check` green.

### 68 — The precondition becomes a behaviour instead of a sentence

Iteration 65 measured the dividing line and wrote it down as advice: "set `minEvidence: 2` if your
corrections never repeat". A host cannot know that before it has run, and the store can. This iteration
moves the decision into the library.

**`corroborationFloor`.** If the share of active rules observed more than once falls below the configured
floor, `recall` raises the pack's evidence floor to two for that request, and returns
`suppressed: 'uncorroborated-store'` when the result is empty. The distinction the field protects is the
one a host will otherwise get wrong:

| State | Meaning | What a host should do |
|---|---|---|
| `ids: []`, no `suppressed` | nothing in the store matched this question | fix retrieval, or add knowledge |
| `ids: [], suppressed: 'uncorroborated-store'` | the workspace has no corroborated rule, so the pack was silenced on purpose | treat it as a workspace property; do not lower thresholds |

A host that cannot tell those apart lowers its thresholds until the noise comes back — which is exactly
how this project spent five iterations discovering that the noise was the pack.

**Design decisions, each with the alternative it beat.**

- **Cached per knowledge version.** The share is a per-distillation fact read on the request path;
  re-scanning the store per request would tax every call for a value that has not changed. `distill`,
  `curate`, `recordFeedback` and `forget` all invalidate it, because each can change what is active.
- **Default off.** An empty pack caused by a policy is worse than a full one when the policy is wrong
  about the workload, and the three measurements that justify the option were taken on this repository's
  workloads, not on the caller's.
- **A floor outside `[0, 1]` is a configuration error**, not a clamp: unlike `minEvidence` (where 0 and
  negative both mean "off"), a share of 1.5 has no reading at all, and accepting it silently would make
  the option untestable.

**A defect found by asking what the client sees.** `/v1/recall` returned `ids`, `rendered`, `tokens`,
`hash` and `truncated` — and dropped `suppressed`. The field that exists to prevent the confusion above
stopped at the package boundary, so the HTTP consumer had exactly the wrong information. It now crosses,
with a test that asserts both directions (silenced carries the reason, unmatched does not).

**What this does not do.** It does not change any benchmark result: every lane configures no floor, so
the numbers in iterations 53–67 stand. What changes is that the finding has an enforcement path a host can
adopt without reading this document.

**Evidence.** 953 tests, coverage **99.97 / 99.59 / 100 / 99.97**; `microglia.ts` at 100% on all four
dimensions; `pnpm check` green; bundle ceiling raised 43,000 → 44,000 with both steps recorded beside the
number.

### 69 — The labels were never the expensive part; the criterion was

The audit has carried one blocker since before S2 began: *"an LLM judge cannot be trusted until it
reaches κ ≥ 0.7 against 200 human labels; a judge validated against itself is not validated."* Two
things were wrong with that sentence. This iteration measures both, and both come back differently
from what the sentence assumed.

**The reference is already public.** ROSE-VEC ([Pei et al., 2026](https://arxiv.org/abs/2604.12988))
publishes 322 BIRD items — a real system's prediction, the gold query, the question, and a boolean the
annotators reached independently — and publishes the five annotators' own files beside it. Both are
fetched and digest-pinned by `pnpm eval:judge`. Rebuilding the consensus from the raw files gives 383
items rated twice, 333 with unanimous agreement, and **zero** disagreements with the published labels:
the parse is right, and the reference did not have to be bought.

**The committee has a ceiling, and it is not 1.** Pairwise agreement between the five annotators:

| Quantity | Value |
|---|---|
| Mean pairwise κ | **0.7085** |
| Range across the ten pairs | 0.5115 – 0.8522 |
| Items two annotators rated | 383 |
| Items all agreed of those | 333 (87.0%) |

So "κ ≥ 0.7" was never "better than humans" — it is "level with the average pair of humans", and one
pair of these annotators sits at 0.51. A bar written above 0.7085 describes the annotation, not the
judge. That is the first correction: the threshold needed a ceiling before it needed a purchase order.

**Execution accuracy is not a substitute for the committee.** The same 322 items, scored four ways,
where a *false negative* is a prediction the experts accepted and the criterion rejected:

| Criterion | ACC | κ | MCC | κ 95% CI | correct called wrong | wrong called correct |
|---|---|---|---|---|---|---|
| Committee against itself | — | **0.7085** | — | — | — | — |
| EX, ROSE semantics (set of tuples, column order kept) | 0.7196 | **0.4717** | 0.5422 | 0.3886 – 0.5557 | 87 of 216 | 3 of 106 |
| EX, this repository's semantics (multiset, canonical rows) | 0.5950 | **0.2995** | 0.4136 | 0.2329 – 0.3730 | **129 of 216** | 1 of 106 |
| all-true | 0.6708 | 0 | — | — | 0 | 106 |
| all-false | 0.3292 | 0 | — | — | 216 | 0 |

Three readings, in order of how much they cost.

1. **A criterion with no information beats ours on accuracy.** Always answering "correct" scores 0.6708,
   higher than this repository's execution criterion at 0.5950. Both rank at κ 0 for the first and
   κ 0.30 for the second, so the two numbers do not contradict each other — but a report that quoted
   accuracy alone would have preferred the one that answers nothing. This is the arithmetic reason the
   lane reports κ, MCC and ACC together and refuses to emit one without the others.
2. **The two things called "EX" are not the same comparison.** They disagree on **52 of 322 items
   (16.1%)**. ROSE compares a set of tuples by position; this repository sorts column names, rounds
   numbers to six places, and keeps duplicates. Rounding and multiset both only add false negatives,
   and the matrix shows exactly that: our variant calls 129 correct predictions wrong where ROSE's calls
   87, while calling almost nothing wrong.
3. **That is a systematic downward bias, not noise.** Our criterion has one false positive in 322 items
   and 129 false negatives. On a two-arm comparison the bias applies to both arms, which is why the
   paired design still stands — but it compresses the observable difference, because an arm can only be
   credited by producing a query that survives rounding *and* duplicate *and* column-order normalisation.
   The ±2–4 pp effects measured in iterations 53–68 have an alternative explanation this table does not
   exclude, and it is a measurement explanation rather than a mechanism one.

**What this does not say.** It does not overturn iterations 53–68: those lanes compare two arms under
one criterion, so a criterion that is harsh on both arms narrows the difference rather than inventing
one, and the sign reversals already reported stand with their intervals. It does not say a judge is
validated — the ruler now exists and nothing has been measured against it yet. And it does not say
BIRD's gold is wrong: ROSE-VEC's labels are verdicts on predictions, not corrections of the gold, and
the separate finding that BIRD Train's gold carries errors ([BIRD-Platinum](https://arxiv.org/abs/2603.20004),
61.1% of sampled items with at least one) is about a different file.

**Design decisions, each with the alternative it beat.**

- **Public reference over a purchased one.** Buying 200 labels was never about money. Five annotators
  with NL2SQL project experience reached 0.7085 between themselves; 200 fresh labels from any other five
  would produce a committee with the same kind of ceiling, no interval worth quoting, and no way for
  anyone else to check the number. The public set buys comparability, which a private set cannot.
- **`undefined`, never 0, when κ is not estimable.** Both raters constant means chance agreement is 1 and
  there is nothing to divide by. Returning 0 there would read as "no better than chance" when the truth
  is "this set cannot answer the question", and the reason travels in the report so a caller can tell
  the two apart.
- **Degenerate controls inside the lane, not in a test.** all-true and all-false must land at κ exactly
  0 and an oracle self-comparison at exactly 1, or the lane fails. Those are the only conditions under
  which this lane goes red besides corrupt data — an instrument that cannot be made to say "no
  information" is an instrument that would report it as a finding.
- **An unexecutable prediction is unscored, not wrong.** One item of 322 could not be executed. Counting
  it as a disagreement would let a database refusal become evidence about a query.

**What this leaves for next.** The ruler has no subject: no LLM judge exists in this codebase, so
nothing has been measured against ROSE-VEC except execution accuracy. Introducing one is a separate
decision with its own costs — provider, prompt version, per-item spend — and mixing it into the
calibration's measurement would make the first number about the judge instead of about the metric.
The cheaper experiment first: re-score the S2 questions under ROSE's set semantics and see whether the
reported deltas move. If they do not, the ceiling effect is bounded and the existing conclusions stand
tighter than they did. If they do, the S2 lane's criterion was the finding.

**Evidence.** `pnpm eval:judge` on 322 items, 1 unscored, digest-pinned on both sides (ROSE files by
sha256, Mini-Dev by the existing manifest); 996 tests, coverage **99.97 / 99.61 / 100 / 99.97**;
`agreement.ts` and `rose-vec.ts` at 100% on all four dimensions; `pnpm check` green.

### 70 — Two ways out of the criterion problem, both switchable, neither assumed better

Iteration 69 left one finding and no decision: execution accuracy agrees with expert adjudication at
κ 0.4717 (set semantics) or 0.2995 (this repository's multiset reading), against the committee's own
0.7085. Two responses are possible — change the criterion, or stop using a row comparison as the
criterion — and nothing measured says which. Both are now built, and the choice is a configuration.

**A. The comparison becomes a setting, and both readings come from one execution.**

`SOTA_SEMANTICS=multiset|set`, default `multiset`. The default is deliberate: every number this lane has
published was scored that way, and a silent change would make the next run incomparable with the last
while presenting itself as an improvement. `set` collapses duplicate rows; `multiset` keeps them; the
two disagree on **52 of 322** adjudicated items, so the name has to travel with any accuracy quoted.

The part that makes the A/B test cheap: the SQL is executed once and both readings are computed from
that result, so every run now carries `paired_shadow`, `arm_pairs_shadow` and `scored_disagreements`
beside the primary numbers. That is the comparison two dispatches could never make cleanly — same
sample, same executions, one difference. If a delta grows under the shadow reading, the old criterion
was compressing it; if it does not move, the criterion was not what limited the measurement, and the
null results of iterations 53–68 stand on firmer ground than they did.

**B. A judge that never sees the answer.**

`JUDGE_MODE=execution|llm|both`, default `execution`. A lane that spends money by default is a lane
nobody re-runs when a number looks wrong, so buying a judge is an explicit act.

| The prompt carries | Why |
|---|---|
| the question | the thing being answered |
| BIRD's external knowledge | the benchmark says the question needs it |
| the columns the query returned | shows which tables it used without a 40-table DDL |
| five rows of the result | what a reviewer would look at |
| **not** the gold query | a judge handed the reference answers by comparison, which is EX with a markup |
| **not** the schema | mostly tokens spent on tables the question never mentions |

`UNKNOWN` is a first-class verdict. A judge forced to choose on a query that returned no rows will
guess, and a guess counted as a verdict is how a criterion acquires a kappa it did not earn. Unstated
verdicts are counted beside the kappa, and a criterion that stated nothing gets no accuracy field at
all — "did not answer" must not rank below "answered everything wrongly".

The client lost its last vendor name. `LlmClient` always took an endpoint and a model; the one place
that still said `DEEPSEEK_API_KEY is required` claimed a dependency it does not have. The message names
the option now, and a test fails if a vendor name comes back.

**Verified before spending anything.** A stand-in endpoint answering every prompt with one constant
verdict, which makes the expected κ computable by hand:

| Mock verdict | Items scored | ACC | κ | What it proves |
|---|---|---|---|---|
| always `CORRECT` | 321 | 0.6729 | **0** | a constant criterion scores zero even when its accuracy beats the multiset reading's 0.5950; 216 both, 105 measured-only |
| always `INCORRECT` | 321 | 0.3271 | **0** (−8.2e-17) | the mirror: 216 reference-only, 105 neither. Written to machine precision, because an exact zero from a float division is a coincidence, not a property |
| always `UNKNOWN` | 0 | — | not estimable | the undefined path writes no accuracy at all, and says `kappa not estimable on 0 stated verdicts of 322` |

**Not measured: the judge's real κ.** It needs a provider key, and the lane refuses to run without one
rather than report a number over zero items. The workflow takes `mode`, `judge_model` and
`judge_max_calls` as inputs and fails before the lane if a judge was asked for and no key exists. That
number is the next dispatch, not a claim this iteration can make.

**Evidence.** 1,024 tests, coverage **99.97 / 99.61 / 100 / 99.97**; `judge.ts` at 100% on all four
dimensions; `pnpm check` green; the committed artefact is `variant: execution` with `exSetItems: 321`
and `exSetKappa: 0.4717`.

### 71 — The criterion was not the problem, and the judge reproduces the metric it was meant to replace

Iteration 70 built two switches and measured neither. Both have now run on real data, and neither result
is the one the switches were built hoping for.

**A. Changing the comparison changes nothing.** One run, 350 questions, scored under `set` with
`multiset` computed beside it from the same executions:

| Reading | Arm | ACC | Delta vs no memory | 95% CI | p | lost / gained |
|---|---|---|---|---|---|---|
| `set` (scored) | no memory | 55.71% | — | — | — | — |
| `set` (scored) | with memory | 52.29% | **−3.43pp** | [−6.29, −0.57] | 0.0357 | 20 / 8 |
| `multiset` (shadow) | with memory | 52.29% | **−3.43pp** | [−6.29, −0.57] | 0.0357 | 20 / 8 |

The two outputs are identical to four decimals. `scored_disagreements` says why: **7 of 350 questions
(2.0%)** are scored differently by the two readings, and not one of them is a question on which the two
arms disagreed. The paired test is computed from discordant pairs, so seven changed verdicts that all land
inside a pair where both arms already agreed cannot move it.

That 2.0% is itself the finding. On ROSE-VEC's 322 adjudicated predictions the two readings disagree on
**52 (16.1%)**; here, on 350 DeepSeek answers, they disagree on 7. The gap is the workload: ROSE-VEC
collects nineteen systems' outputs including ones that return duplicate rows, while this lane's questions
mostly aggregate to a single row, where set and multiset are the same object. A criterion's reading matters
in proportion to how much duplication the corpus produces, and this corpus produces almost none.

So the −3.43pp is not an artefact of the criterion. Whatever the pack does to these questions, it does it
under both readings, and the new number is **stronger than the −3.14pp (p = 0.052) previously reported** —
though that comparison crosses two runs and is not the controlled one; only the shadow column is. Gate V5
reports the minimum detectable difference at this n and discordance as 4.24pp, so a 3.43pp effect sits
inside the design's resolution, and the honest reading is "negative, significant by McNemar, and below the
size this sample can resolve". The oracle control still moves +29.14pp (p = 1.3e-27), so the instrument is
not the thing that failed.

**B. The judge fixes the disease and catches another.** 322 items, 321 calls, 0 failed, 0 unparsed,
14 unstated (13 `UNKNOWN` plus the one unexecutable prediction):

| Criterion | scored | ACC | κ | κ 95% CI | MCC | correct → wrong | wrong → correct |
|---|---|---|---|---|---|---|---|
| Committee against itself | — | — | **0.7085** | — | — | — | — |
| EX, `set` | 321 | 0.7196 | 0.4717 | 0.3886 – 0.5557 | 0.5422 | 87 | 3 |
| EX, `multiset` | 321 | 0.5950 | 0.2995 | 0.2329 – 0.3730 | 0.4136 | 129 | 1 |
| LLM judge (`deepseek-chat`, Prover only) | 308 | **0.8019** | **0.4762** | 0.3636 – 0.5793 | 0.5054 | **11** | **50** |

Three readings, and the third is the one that costs.

1. **The judge does what it was built to do.** False negatives fall from 87 to 11 — the model accepts
   correct queries written differently, which is exactly the failure execution accuracy cannot avoid.
   Accuracy rises 8.2pp over the `set` reading.
2. **Agreement does not move.** κ goes 0.4717 → 0.4762, intervals overlap almost entirely, and neither
   is near the committee's own 0.7085. The error moved rather than shrank: false positives go 3 → 50,
   and 82% of items are judged correct against the committee's 67%.
3. **A judge trading one error type for the other is not a better judge.** It is a differently biased one.
   This is the clearest case yet for reporting accuracy, κ and the confusion matrix together: on accuracy
   the judge wins by 8.2pp; on agreement it ties; on the matrix it fails in the opposite direction.

**What this decides.** Not "pick one". Both criteria are roughly equidistant from the committee, from
opposite sides — EX rejects correct-but-different queries, the judge accepts wrong-but-plausible ones. The
next mechanism is therefore the one ROSE actually publishes and this lane has not implemented: an
adversarial **Refuter** that is shown the gold query as *evidence* and asked to overturn the Prover's
approval. It runs only on the items the Prover approved — 252 of 322 here — so it costs less than the
Prover did, and it targets precisely the 50 false positives. Until that runs, "add a judge" is not an
improvement this project can claim.

**Boundary.** One model, one prompt version (`judge-prompt/1`), one run, zero failures — a reliability
figure from a single sample. The 14 unstated items are reported rather than imputed, and the kappa is
computed on the 308 the judge was willing to score. None of this makes the judge wrong to build; it makes
it unproven, which is a different claim and the one the evidence supports.

**Evidence.** Judge run [`40177362384`](https://github.com/AgentiX-E/microglia/actions/runs/40177362384)
(321 calls, 0 failed) and BIRD run
[`40177366379`](https://github.com/AgentiX-E/microglia/actions/runs/40177366379) (2,370 calls, 0.00%
failure, all ten gates pass, artefact `scored_by: set`, `shadow_by: multiset`).

### 72 — The cascade raises κ, and the gain is exactly the part nobody has checked

Iteration 71 ended by naming the next mechanism: ROSE's adversarial Refuter, which sees the reference
query the Prover was denied and is told it is evidence rather than an answer. It is built, run twice, and
ablated. The headline is good and the ablation is what makes it untrustworthy.

**The three criteria on one sample** (307 scored, 251 refuter calls, 0 failures, 0 unparsed):

| Criterion | ACC | κ | κ 95% CI | MCC | correct → wrong | wrong → correct |
|---|---|---|---|---|---|---|
| EX, `set` (iteration 69/71 baseline) | 0.7196 | 0.4717 | 0.3886 – 0.5557 | 0.5422 | 87 | 3 |
| Prover only | 0.7980 | 0.4642 | 0.3490 – 0.5703 | 0.4914 | 12 | 50 |
| **Cascade** (all overturns) | 0.8013 | **0.5918** | 0.5028 – 0.6770 | 0.6264 | 55 | 6 |
| Cascade **strict** (refuses `GOLD_ERROR`) | 0.7785 | **0.4239** | 0.3027 – 0.5333 | 0.4404 | 18 | 50 |

The refuter overturned **87 of 251** approvals and attributed **82 to `GOLD_ERROR`**, 9 to `COINCIDENTAL`,
and 0 to `AMBIGUOUS`. Every overturned item moved the confusion matrix in one of two directions: 44 came
from the Prover's false positives and became true negatives, 43 came from true positives and became false
negatives.

**The ablation is the finding.** Refusing the overturns that blame the reference drops κ from 0.5918 to
0.4239 — below the Prover's 0.4642. So the entire gain (+12.8pp) rests on the 82 `GOLD_ERROR` claims, and
"the reference is wrong" is the cheapest thing a refuter can say. Two things are therefore true at once:
the cascade is the first mechanism in this project that moves agreement toward the committee, and it moves
it through a judgement nothing here has verified.

**The gain has a second reading, and it is not flattering.** Prover κ 0.4642 with 82% of items approved
against the committee's 67%; cascade κ 0.5918 with 53% approved. Most of the movement is the predicted
prevalence travelling from 0.82 to 0.53 while the committee sits at 0.67 — and κ is prevalence-sensitive
by construction. Accuracy barely moves (0.7980 → 0.8013, +0.3pp) while κ moves 12.8pp, which is the same
trap iteration 69 documented from the other side. MCC does move with it (0.4914 → 0.6264), so this is not
*only* a marginal-distribution artefact — but the marginal moved in the helpful direction, and a criterion
tuned until its positive rate matched the reference would show the same pattern.

**Run-to-run variance is the same size as the effect.** Two dispatches of the same code:

| Run | Overturned | `GOLD_ERROR` | Cascade κ |
|---|---|---|---|
| [`40180906410`](https://github.com/AgentiX-E/microglia/actions/runs/40180906410) | 101 / 251 | 94 | 0.5306 |
| [`40181693967`](https://github.com/AgentiX-E/microglia/actions/runs/40181693967) | 87 / 251 | 82 | 0.5918 |

A 6.1pp spread between two runs of one prompt, against a 12.8pp effect. The mechanism is real in direction
and unstable in size, and reporting the second number alone would overstate it by exactly the amount the
first run disagrees by.

**What the next iteration has to settle.** Whether those 82 are right. It is answerable without new calls:
for each `GOLD_ERROR` overturn, execution accuracy already knows whether the two queries returned the same
rows. A refuter that says "the reference is wrong" about a query that returns the *same rows* has no
execution evidence for the claim; one that says it about a query returning *different rows*, where the
committee still called the prediction correct, is describing the case ROSE exists for. The cross-tab of
diagnosis against execution verdict and committee label is one artefact away, and until it exists the
cascade's κ is a number with a plausible story and no check.

**Boundary.** One model (`deepseek-chat`), two prompts, two runs. The refuter never said `AMBIGUOUS` (0 of
251), which is itself suspicious: ROSE reports 91% precision on that label, and a refuter that never uses
it is choosing between "wrong" and "reference wrong" without a middle option.

**Evidence.** Runs `40180906410` and `40181693967`; 1,042 tests, coverage **99.97 / 99.61 / 100 / 99.97**;
`judge.ts` at 100% on all four dimensions including `cascadeVerdict` and both halves of the prompt;
`pnpm check` green. The strict variant was proven to move only the variable it names: with a stand-in
endpoint answering `OVERTURN`/`GOLD_ERROR`, strict reproduces the Prover exactly (216 both, κ 0) while the
full cascade flips everything.

### 73 — Execution cannot judge, but it can veto, and the veto is what makes the cascade work

Iteration 72 left a cross-tab and a suspicion. Of 84 `GOLD_ERROR` overturns, 70 landed on items whose
two queries returned **different** rows and 12 on items whose queries returned **the same** rows. The
strict reading threw away all 84 and fell below the Prover; the full reading kept all 84 and gained 13pp
through a claim half of which had no execution evidence. The third reading refuses only the 12.

**Three readings of one run** (307 scored, 250 refuter calls, 0 failures, 0 unparsed):

| Criterion | ACC | κ | κ 95% CI | MCC | correct → wrong | wrong → correct |
|---|---|---|---|---|---|---|
| EX, `set` | 0.7196 | 0.4717 | 0.3886 – 0.5557 | 0.5422 | 87 | 3 |
| Prover only | 0.8013 | 0.4746 | 0.3636 – 0.5761 | 0.5007 | 12 | 49 |
| Cascade, every overturn | 0.8046 | 0.5974 | 0.5078 – 0.6830 | 0.6311 | 54 | 6 |
| Cascade, refuses `GOLD_ERROR` | 0.7915 | 0.4542 | 0.3384 – 0.5608 | 0.4746 | 15 | 49 |
| **Cascade, refuses only unevidenced `GOLD_ERROR`** | **0.8436** | **0.6676** | **0.5803 – 0.7515** | **0.6893** | 42 | 6 |

The third variant's interval does not overlap the Prover's: **0.5803 > 0.5761**. It is the first
comparison in this project where a criterion's agreement with the committee is separable from the
criterion it replaced, and it lands 4.1pp below the committee's own 0.7085.

**The argument, stated once.** Execution accuracy is a **necessary** condition for logical equivalence and
not a sufficient one, and the asymmetry is measurable here: of the 132 items whose query returned exactly
the gold's rows, the committee still rejected 3 — 2.3%, small but not zero, which is why equal rows can
never license an approval on their own. Unequal rows, by contrast, prove the two queries differ; there is
no item in this set where they disagree on rows and agree on meaning. So the honest use of execution is
not "decide", it is **"forbid"**: a refuter may not blame the reference for a query that returned the same
rows, because there is nothing in that pair for the reference to be wrong *about*.

That is why the ordering of the three variants is the evidence. Accepting everything gains 13pp on a claim
that is 14% unevidenced; refusing everything loses 2pp because it also refuses the 70 items that are
exactly the case ROSE exists for; refusing only the unevidenced ones gains 19.3pp. The mechanism is not
"trust the refuter" and it is not "trust the reference" — it is a division of labour in which the model
supplies the judgement and the database supplies the veto.

**It replicates.** Three dispatches of the same code, after the change:

| Run | Prover κ | Cascade κ | Strict κ | **Evidenced κ** |
|---|---|---|---|---|
| [`40185937177`](https://github.com/AgentiX-E/microglia/actions/runs/40185937177) | 0.4746 | 0.5974 | 0.4542 | **0.6676** |
| [`40190098458`](https://github.com/AgentiX-E/microglia/actions/runs/40190098458) | 0.4762 | 0.5994 | 0.4491 | **0.6634** |
| [`40190105129`](https://github.com/AgentiX-E/microglia/actions/runs/40190105129) | 0.4642 | 0.6088 | 0.4609 | **0.6736** |
| Spread | 1.2pp | 1.1pp | 1.2pp | **1.0pp** |

A 1.0pp spread on a 19.3pp effect is a different object from iteration 72's 6.1pp spread on 12.8pp, and
the difference is the veto: the variance in iteration 72 came from how many unevidenced overturns the
refuter happened to produce, and those are now filtered by a rule that does not vary.

**What is still not verified.** The 70 evidenced overturns are not the same as 70 correct overturns. The
veto proves the two queries differ; it does not prove the reference is the one that is wrong. 39 of them
are items the committee itself accepted, so on those the refuter is disagreeing with both the committee
and (by construction) the execution — ROSE reports 84.32% precision on that label, and this lane has no
independent measurement of it. The 42 false negatives are where that shows up: 30 more than the Prover's
12, and every one of them is a query the committee approved.

**Boundary.** One model, one prompt pair, four runs including the pre-change one (κ 0.5306, an outlier
6.7pp below the three above; the refuter overturned 101 items that time against 84–87 since, which is the
variance the veto now removes). `AMBIGUOUS` was never used, 0 of 250 — a refuter that never says "the
question is ambiguous" is choosing between two accusations without the middle option ROSE provides, and
that remains unexplained.

**Evidence.** Runs `40185937177`, `40190098458`, `40190105129`; 1,042 tests, coverage
**99.97 / 99.61 / 100 / 99.97**; `judge.ts` at 100% on all four dimensions; `pnpm check` green; the
evidenced variant was proven against a stand-in endpoint to keep exactly the 132 approvals whose rows
agree while flipping the 189 whose rows differ.

### 74 — The memory's cost is real: three criteria, one sign, and a claim withdrawn

Iterations 71 and 73 left the same question standing. The −3.43pp survived `set` and `multiset` because
those are one metric with two readings, and that metric is the thing under suspicion — execution accuracy
rejects 87 of 216 queries the ROSE committee accepts. A null that survives EX has survived EX.

**The test that settles it.** The S2 artefact now carries both arms' SQL, so the answers can be re-scored
without asking the model anything new. `pnpm eval:adjudicate` applies the evidenced cascade — κ 0.6676
against a human committee where EX reaches 0.4717 — to the questions the benchmark already answered:

| Criterion | n | no memory | with memory | delta | 95% CI | p |
|---|---|---|---|---|---|---|
| EX, `multiset` — the run's own verdict | 350 | 53.71% | 50.29% | −3.43pp | [−6.86, 0.00] | 0.0730 |
| EX, `multiset` — on the re-scored subset | 289 | 60.21% | 57.09% | −3.11pp | — | 0.1221 |
| **Evidenced cascade** (κ 0.6676) | 289 | 68.86% | 64.71% | **−4.15pp** | **[−7.96, −0.69]** | **0.0428** |

The independent criterion agrees with the sign and disagrees with the significance, in the direction that
costs the project its excuse: the effect is **larger** and **significant** where EX's was neither. The two
criteria hand down different verdicts on **54 of 289 questions (18.7%)** — a fifth of the set — and the
delta barely moves, which is what a real effect looks like when the instrument changes underneath it.

**What this closes.** Three criteria, and the two that share nothing but the answers — a row comparison on
tuples and a model-mediated adversarial cascade — all place the memory below the baseline on BIRD
Mini-Dev. The measurement question is answered: the losses are not an artefact of how correctness was
scored.

**A claim this iteration makes and then withdraws.** The first draft of the paragraph above said the
independent criterion was *sharper* — p = 0.043 where EX reached 0.122. That comparison does not exist.
EX's own p on this lane has been 0.0357, 0.0730 and 0.1221 across three runs of the same code, so 0.043
sits inside EX's own spread and "sharper" is a difference between two samples, not between two
instruments. What survives is the sign and the rough size: −3.11 to −4.15pp across criteria and runs, with
significance that is marginal on every one of them. The honest statement is "the loss is real and small,
and no instrument here resolves it cleanly" — not "the better criterion proves it harder".

**What it does not close.** 61 of 350 questions are dropped because at least one arm never reached a
verdict — a model call failed or the judge answered `UNKNOWN`. Missing 17.6% is not random: a question the
judge declines is plausibly a harder one, so the subset is not the full set and the delta is a statement
about the 289 that both arms answered. The five retries the run needed are the same warning from another
angle. The 289 are reported as the sample they are, not as a substitute for 350.

**The mechanism stays open, and it is now the only open thing.** The attribution from the same run:
394 of 1,240 rules were ever injected — 33 harmful, 15 helpful, 346 neutral — so 9.7% of injections belong
to a rule that loses points, against 4.5% that gain them. Six levers have been tested and five produced
nothing (retrieval, generalization, dose, foreign rules, shape, requiring a decision). What has not been
tested is refusing to inject at all: the `full` arm always carries whatever the pack retrieved, and no run
has measured the arm that filters to corroborated rules *and* abstains when the pack is thin. The library
already has both mechanisms; the lane has never combined them.

**Evidence.** Run [`40197929151`](https://github.com/AgentiX-E/microglia/actions/runs/40197929151):
benchmark 350 questions, 2,407 calls, 1 retry, all nine gates pass, delta −3.43pp p = 0.0730; adjudication
289 paired questions, 5 retries, 183 pairs whose rows agreed (so the veto had something to weigh); 1,065
tests, coverage **99.97 / 99.62 / 100 / 99.97**. The adjudication artefact was written to
`eval/results/sota-adjudication.json` but **not uploaded** — the workflow's upload list names only the two
files that existed when it was written — which is fixed in the same iteration and is the reason these
numbers come from the step log rather than an artefact a reader can open.

### 75 — Add-all is harmful, abstention is not a fix, and the literature says why

Two papers describe this project's problem from the outside, and one of them names the half of the
remedy that has never been implemented here.

**Xiong et al. (arXiv 2505.16067)** find that LLM agents exhibit an *experience-following* property: a
similar task input produces a highly similar output, because the model imitates the retrieved record
rather than reasoning from scratch. Two failures follow — *error propagation*, where a wrong stored
record is copied and then re-stored, and *misaligned experience replay*, where a record that was right
somewhere else is followed where it does not apply. Their measured remedy is **selective addition plus
history-based deletion**, worth about 10 points over naive growth; on EHRAgent, add-all reached 13.05%
and strict selection 38.5%, so **indiscriminate saving is worse than saving nothing**. Deletion by
observed utility beat deletion by age, and in one agent a strict evaluator with history-based deletion
outperformed an error-free reference baseline.

**Dynamic Cheatsheet (arXiv 2504.07952)** reaches the same conclusion from the curation side: the
Curator must prune as well as add, and models that only append fill the buffer with noise until it
degrades performance.

**This project reproduces the first half on its own corpus.** Five arms, 350 questions, one run:

| Arm | ACC | Δ vs none | p | rules injected / question |
|---|---|---|---|---|
| none | 54.00% | — | — | 0 |
| full (add everything retrieved) | 49.43% | **−4.57pp** | **0.0037** | 1.81 |
| full-corroborated (≥2 independent corrections) | 53.43% | −0.57pp | 0.625 | **0.00** |
| critique (model decides applicability first) | 49.14% | −4.86pp | 0.006 | 1.81 |
| gated | 48.00% | −6.00pp | 0.0002 | 1.73 |
| oracle (gold rule stated) | 83.43% | +29.43pp | <0.0001 | 0 |

Three findings, and the third is the one that changes the plan.

1. **Add-all costs 4.57 points and the cost is now significant** (p = 0.0037, 22 lost against 6 gained).
   That is the Xiong result in a different domain: the memory is not inert, it is harmful.
2. **`full-corroborated` is not selective addition; it is abstention.** Its `mean_pack_ids` is exactly
   **0** — this corpus contains no rule observed twice, so the corroboration filter admits nothing and
   the arm degenerates to `none`. Its −0.57pp is the difference between two samples of the same
   condition, p = 0.625. Selective addition cannot be measured here because the signal it selects on
   does not exist: 1,240 rules, none corroborated.
3. **Filtering by hand is worse than not filtering.** `gated` scores 48.00%, below `full`'s 49.43%: the
   gate removes rules the model would have used well and keeps ones it uses badly. Whatever the
   selection criterion should be, "the ones that look relevant" is not it — which is consistent with
   iteration 64's finding that a harmful rule is the *closer* one in embedding space.

**So the deletion half is the one to build**, and it is being built: after learning, a fold runs its own
pack over its learn rows, records which rules were injected into answers that then failed, and retires
them before any held-out question is scored. Only negative evidence counts, because a correct answer
while a rule was present is not evidence the rule helped. The pass reads learn rows and never eval rows:
deleting on the basis of the questions being scored would be leakage with a tidier name.

**Boundary.** One model, one run, and the arms share a sample but not a store state — `full` and
`full-corroborated` read different stores by construction, which is the point of them and also why their
difference is not a paired comparison of one store against itself. The `critique` and `gated` results
come from arms defined in earlier iterations and are reported here for completeness, not as new
evidence about them.

**Evidence.** Run [`40206409114`](https://github.com/AgentiX-E/microglia/actions/runs/40206409114):
350 questions, all gates pass, adjudication −4.75pp (p = 0.0201) on 295 paired questions, consistent with
the execution reading. 1,065 tests, coverage 99.97 / 99.62 / 100 / 99.97.

### 76 — Deleting a third of the rules changes nothing, and the reason is in the credit itself

Iteration 75 ended by naming the untested half of the literature's remedy: history-based deletion.
It is now built, run, and reported. It does not help, and this iteration measures why, which is worth
more than the arm was.

**The arm.** After a fold learns, it answers its own learn rows with the pack it would inject, records
which rules reached a prompt whose answer was wrong, and retires the rules whose failure share is at
least half over at least two injections. Then scoring begins. The deletion runs on learn rows and never
on the questions being scored: deleting on the scored set would be leakage with a tidier name.

| Arm | ACC | Δ vs no memory | p | lost / gained | rules per pack |
|---|---|---|---|---|---|
| no memory | 53.14% | — | — | — | 0 |
| full | 50.86% | −2.29pp | 0.2153 | 20 / 12 | 1.81 |
| **full-validated** | **50.29%** | −2.86pp | 0.0872 | 19 / 9 | 1.81 |
| oracle | 84.00% | +30.86pp | <1e-33 | 3 / 111 | 0 |

**The deletion is not a no-op.** 805 distinct rules were injected during validation, 2,530 trials were
recorded, and **268 rules were retired — 33% of the store**. In one fold the active set went from 275 to
217. The pruned store produced a **different pack on 192 of 350 scored questions (55%)**, which is the
count that distinguishes a real intervention from an arm that quietly re-measured `full`.

**And it changes nothing.** Paired against `full` on the same 350 questions: **−0.57pp, 95% CI
[−2.86, +1.71], p = 0.8145**, 10 lost against 8 gained. Removing a third of the rules, selected as the
ones with the worst observed records, is indistinguishable from removing none.

**The diagnosis, and it is in the histogram.** Credit was assigned by "the rule was present when the
answer was wrong". The lane answers 51% of questions correctly, so a rule that does nothing at all
fails half of its trials anyway. If credit carried any information about the rule, the failure counts
would be over-dispersed relative to that base rate. They are not:

| Trials | Rules | Observed failures 0..t | Expected at p = 0.4914 | χ² | df | p |
|---|---|---|---|---|---|---|
| 1 | 288 | 120, 168 | 146.5, 141.5 | 9.74 | 1 | **0.0018** |
| 2 | 158 | 48, 73, 37 | 40.9, 79.0, 38.2 | 1.73 | 2 | 0.421 |
| 3 | 116 | 15, 55, 31, 15 | 15.3, 44.2, 42.7, 13.8 | 5.96 | 3 | 0.114 |
| 4 | 77 | 7, 20, 24, 23, 3 | 5.2, 19.9, 28.9, 18.6, 4.5 | 3.02 | 4 | 0.555 |

Pooled over two, three and four trials: **χ² = 10.71 on 9 degrees of freedom, p = 0.296**. Every rule's
failure count is consistent with every other rule's — the distribution is the one you get by flipping a
coin weighted to the lane's own error rate, once per injection. So the credit ranks rules at chance, and
retiring the worst third is retiring a random third, which is exactly the −0.57pp the arm measured. Two
independent readings of the same defect agree.

The single row that does deviate makes the confound explicit rather than refuting it: rules injected
exactly once failed **more** often than the base rate (168 of 288, p = 0.0018). Retrieval prefers rules
that resemble a previous correction, and the questions that resemble a previous correction are slightly
harder than average. Difficulty is what the credit was measuring.

**A third criterion confirms the cost it was trying to remove.** The same run re-scored by the evidenced
cascade, 292 questions both arms answered: **70.89% → 66.10%, −4.79pp [−8.90, −1.03], p = 0.0243**, with
49 verdicts changing hands. Iteration 74 measured −4.15pp [−7.96, −0.69] on the same lane with the same
criterion; this is the second independent dispatch and it moves the estimate a little further from zero,
not toward it. Execution on the same 292: −3.08pp, p = 0.1078.

**What this closes, stated as a list.** The cost of the pack is not: the result comparison (three
criteria, one sign), retrieval ranking (no separation between helpful and harmful at cosine 0.232 vs
0.228), rule shape (`when` present or absent, 0.00pp), dose (no dose response), foreign rules (−0.29pp,
p = 1.0), requiring a decision before use (+0.29pp, p = 1.000), corroboration (a filter that admits
nothing), or **the quality of the individual rules as currently measured** (this iteration, p = 0.81
against a 33% deletion).

**What is left is that the credit is measured wrongly, not that the rules are all equally bad.** The
current score answers "was the rule present when the answer was wrong", and the answer to that question
is determined mostly by the question. The question worth asking is the counterfactual one: *would this
answer have been right without the rule?* That needs two calls per validation question — the same
question answered with the pack and without it — and a rule is credited only where the two outcomes
differ. It costs about 2,800 calls per fold set, it is unbiased by difficulty by construction, and it is
the next iteration rather than this one, because a measurement that has just been shown to carry no
signal should not be quietly repaired inside the same artefact that reports its null.

**Boundary.** One model, one dispatch, one policy (share ≥ 0.5 over ≥ 2 trials). The policy is a setting
and the artefact records it beside the histogram, so a stricter or looser value can be run without
touching code — but nothing here says whether some other threshold would have found the harmful rules,
only that this one, chosen before the run, did not.

**Evidence.** Run [`40256148306`](https://github.com/AgentiX-E/microglia/actions/runs/40256148306):
350 questions, 3,799 calls, 1 retry, 0 failures, all nine gates pass, `mean_pack_ids` 1.81, oracle
+30.86pp; adjudication 292 paired questions, 3 retries, 185 pairs whose rows agreed; 1,081 tests,
coverage **99.97 / 99.62 / 100 / 99.97**; `validation.ts` at 100% on all four dimensions.

### 77 — The counterfactual is the right question, and this corpus cannot answer it

Iteration 76 showed the absolute credit ranks rules at chance and named the fix: ask whether the
answer changed because the rule was there. That fix is built and run. It produces a number too small to
rank anything, and the distribution of that number says why in a way that indicted the pass itself.

**The measurement.** Every validation question is answered twice — once with the pack, once without —
and a rule is credited only where the two outcomes differ. 1,400 injections over five folds:

| Quantity | Value |
|---|---|
| Injected questions | 1,400 |
| Questions where the answer changed (decisive) | **193 (13.8%)** |
| Rule-injections credited as helped | 203 |
| Rule-injections credited as harmed | 147 |
| Rules seen at all | 784 |
| **Decisive comparisons per rule** | **0.25** |
| Rules retired (≥ 2 decisive, ≥ 2/3 harm) | **16 (2.0%)** |
| Questions whose pack the retirement changed | 29 of 350 (8.3%) |

**The wall is arithmetic.** A per-rule policy needs several decisive observations per rule before a
share means anything, and this corpus produces a quarter of one. Sixteen rules retired, twenty-nine
questions affected, and the paired result against `full` is **+0.86pp [−0.29, +2.29], p = 0.375** — five
questions changed hands. That is not "deletion is useless"; it is "at 350 questions and 1.8 rules per
pack, no per-rule statistic can resolve anything", which is the same wall iteration 68 hit from the
corroboration side (0 of 1,296 rules observed twice).

**And the distribution indicts the pass.** Of the 213 rules that received any decisive observation,
**132 received exactly one, and it was a help** — never a harm. That is not what a signal looks like.
It is what leakage looks like, and the leak was structural: the validation pass runs on the fold's learn
rows, a rule distilled *from* a row is recalled *for* that row, and the with-rule call was therefore
asked to reproduce the answer the rule had been derived from.

Two defects, both fixed in this iteration rather than papered over:

1. **Evidence carried no task.** `host.begin` was called without `taskId`, so the host opened a run per
   attempt and every `EvidenceRef` came out task-less — contradicting the contract stated in the type
   itself ("support is counted per task, not per event: eight attempts of one task are one observation
   by one user"). Rules were consequently not attributable to the question that produced them.
2. **Self-derived rules were scored on their own source.** With attribution in place, the validation
   pass now drops, per row, every rule whose evidence cites that row, and reports the count it dropped.

**One number this iteration reports against itself.** Iteration 76's absolute credit was also computed
on learn rows, so it was exposed to the same defect: rules were scored where their own source question
was in the store, and the correction that produced them was the answer being asked for. Its p = 0.81
null is therefore a null about a contaminated measure. Removing the contamination does not turn a null
into a positive result, and nothing here claims it does — it makes the next null a null about a cleaner
measure, which is a different and weaker statement than the one iteration 76 made.

**What this changes in the plan.** Per-rule credit is the wrong instrument for a 350-question corpus.
The remaining lever has to act on the *pack*, not on a ranking of its members, and it has to be
structural: two papers leave nothing else. Xiong et al. describe experience-following — the answer
imitates the retrieved record — and "Unable to Forget" (ICML 2025) measures interference as a causal
variable and finds every natural-language intervention against it failing, including explicit
instructions to ignore the history and chain-of-thought. A model cannot be talked out of imitating a
rule, but it can be given something else to imitate: its own answer. Two arms are built and dispatched
for that, with the control the design needs — `full-late` moves the pack after the question (position
was never a variable), and `full-anchored` answers first and then revises, so the rule is an objection
to a draft rather than a template for an answer.

**Evidence.** Run [`40278360344`](https://github.com/AgentiX-E/microglia/actions/runs/40278360344):
350 questions, 5,203 calls, 1 retry, 0 failures, all nine gates pass, oracle +29.71pp; `full` 50.29%
(−3.43pp, p = 0.0428), `full-validated` 51.14% (−2.57pp, p = 0.1221). 1,107 tests, coverage
**99.97 / 99.62 / 100 / 99.97**; `validation.ts` at 100% on all four dimensions.

### 78 — Give the model its own answer to imitate, and the pack's cost goes away

Everything tried so far attacked *which* rule reaches the prompt. Iteration 77 showed that a 350-question
corpus cannot support per-rule attribution at all (0.25 decisive comparisons per rule), and that leaves
one variable untouched: *how* the rule reaches the prompt. Two arms change only that, and one of them
removes the loss.

**The two arms.**

| Arm | What it changes | Why |
|---|---|---|
| `full-late` | the pack moves after the question, nothing else | position was never a variable in any prior run |
| `full-anchored` | the model answers first, then revises against the pack in a second call | a rule becomes an objection to a draft instead of a template for an answer |

The second is built on two results. Xiong et al. (arXiv 2505.16067) describe *experience-following* — the
answer imitates the retrieved record rather than reasoning from the question — and "Unable to Forget"
(ICML 2025) measures interference as a causal variable independent of context length, finding that every
natural-language intervention against it fails, including explicit instructions to ignore the history and
chain-of-thought. A model cannot be told out of imitating a rule; it can be given something else to
imitate.

**Two dispatches, same corpus, same code.**

| Run | no memory | `full` | `full-late` | `full-anchored` | oracle |
|---|---|---|---|---|---|
| [`40283723201`](https://github.com/AgentiX-E/microglia/actions/runs/40283723201) | 54.00% | 50.29% (−3.71pp) | 48.86% (−5.14pp) | **51.71% (−2.29pp)** | 82.86% (+28.86) |
| [`40304176313`](https://github.com/AgentiX-E/microglia/actions/runs/40304176313) | 53.71% | 49.71% (−4.00pp) | 49.14% (−4.57pp) | **54.00% (+0.29pp)** | 82.86% (+29.14) |

Paired against `full` on the same questions:

| Run | `full-late` | `full-anchored` |
|---|---|---|
| 1 | −1.43pp, p = 0.473, 18 lost / 13 gained | **+1.43pp**, p = 0.487, 14 lost / 19 gained |
| 2 | −0.57pp, p = 0.875, 21 lost / 19 gained | **+4.29pp**, p = 0.0167, 10 lost / 25 gained |
| pooled | −1.00pp | **+2.86pp, McNemar p = 0.0205** (24 lost / 44 gained over 700 questions) |

**Three readings.**

1. **Anchoring works, and it is the first mechanism in this project that does.** Run 2 puts the anchored
   arm at **statistically indistinguishable from answering with no memory at all** (+0.29pp, p = 1.0)
   while `full` in the same run costs 4.00pp — a +4.29pp paired difference at p = 0.0167. Run 1 is the
   weaker reading (+1.43pp, p = 0.487), and it is reported as the weaker reading: two dispatches, one
   significant, both in the same direction, pooled p = 0.0205.
2. **Position is not the mechanism, and it moves the wrong way.** Moving the pack *after* the question
   made it worse in both runs (−1.43pp, −0.57pp). Recency does not dilute an imitated rule, it
   strengthens it: the closer the rule sits to where the answer is written, the more it is copied. That
   is the opposite of what a lost-in-the-middle reading predicts, and it is what experience-following
   predicts.
3. **The gain is the loss, not the help.** `full-anchored` loses 10 and 5 questions where `full` loses 23
   and 25, but gains 2 and 6 where `full` gains 10 and 11. The arm does not make the pack more useful; it
   makes it less harmful, by making "unchanged" the default and requiring a rule to justify a change.
   That is the correct shape for a mechanism whose problem was imitation: the anchored model still can't
   use a good rule it would otherwise have followed, because it never sees the rule until after it has
   answered.

**Where this leaves the mechanism.** The cost is not in the rule's quality (iteration 76–77), not in the
criterion (69–74), not in ranking (62–64), and not in position (this iteration, twice, wrong sign). It is
in the act of putting a rule in front of the question, and the anchored arm is the first intervention
that changes that act rather than its inputs. The open question it creates is the one worth asking next:
the anchored arm recovers the loss and forfeits the gain, so the useful direction is a revision that can
also *find* a rule worth applying — a second call that is shown the rule and asked to check it against
the draft's result, rather than a second call that is asked to be conservative by default.

**Boundary.** Two dispatches, one model, one prompt pair, 350 questions each. The pooled McNemar treats
the two runs as independent samples of the same items, which they are as runs and are not as questions;
the per-run numbers are the ones with no assumption attached, and they bracket the effect at +1.4 to
+4.3pp. Nothing here says the anchored arm is better than no memory — run 2 says it is *equal* to no
memory, which is a large improvement over a 4pp loss and not yet a benchmark win.

**Evidence.** Runs `40283723201` (2,745 calls, 1 retry, 0 failures) and `40304176313` (2,763 calls, 1
retry, 0 failures), both with all nine gates passing and `mean_pack_ids` 1.76; 0 questions skipped by the
anchored arm; 1,107 tests, coverage **99.97 / 99.62 / 100 / 99.97**.

### 79 — The discovery was a resample, and the treatment was the thing that moved

Iteration 78 reported that anchoring removes the pack's cost: one dispatch at +4.29pp with p = 0.0167, a
second at +1.43pp with p = 0.487, pooled p = 0.0205. Three more dispatches of the same code were run
before writing anything else, and the claim does not survive them.

**Five dispatches, same arms, same questions.**

| Run | no memory | `full` | `full-anchored` vs `full` | `full-anchored-conditional` vs `full` |
|---|---|---|---|---|
| [`40283723201`](https://github.com/AgentiX-E/microglia/actions/runs/40283723201) | 54.00% | 50.29% (−3.71pp) | +1.43pp, p = 0.487 | — |
| [`40304176313`](https://github.com/AgentiX-E/microglia/actions/runs/40304176313) | 53.71% | 49.71% (−4.00pp) | **+4.29pp, p = 0.0167** | — |
| [`40329336780`](https://github.com/AgentiX-E/microglia/actions/runs/40329336780) | 52.57% | 53.43% (+0.86pp) | −1.14pp, p = 0.524 | −1.71pp, p = 0.286 |
| [`40340260728`](https://github.com/AgentiX-E/microglia/actions/runs/40340260728) | 53.14% | 53.14% (0.00pp) | 0.00pp, p = 1.000 | −1.43pp, p = 0.487 |
| [`40340281462`](https://github.com/AgentiX-E/microglia/actions/runs/40340281462) | 53.71% | 52.00% (−1.71pp) | −0.57pp, p = 0.851 | −2.00pp, p = 0.281 |
| **pooled** | — | **−1.71pp mean** | **+0.80pp, McNemar p = 0.285** (67 lost / 81 gained) | **−1.71pp, p = 0.066** (52 lost / 34 gained) |

**The retraction, stated plainly.** Iteration 78's headline — anchoring removes the cost — is withdrawn.
The effect is +0.80pp over 1,750 paired questions, not significant, and its sign is inconsistent across
runs. Two dispatches were the favourable tail of a distribution, and reporting them as a result was the
mistake this iteration exists to correct.

**The cause is measurable, and it is not noise.** `full`, the arm that should be a fixed point, moved from
−4.00pp to +0.86pp across runs of unchanged code. The reason: every dispatch distils its rules from model
replies, so *the store itself is resampled each run*. What iteration 78 called run-to-run variance was
treatment variance — the arm named "memory on" was a different memory in each dispatch. Comparisons inside
a run survive this, because all arms share one store; comparisons across runs do not, and every claim this
project has made about "the pack costs 2–5pp" inherits the caveat.

**The conditional variant is the cleanest result here, and it is negative.** Three runs, all worse than
`full` (−1.71, −1.43, −2.00pp), pooled −1.71pp at p = 0.066. Telling the model to apply an item whose
`when` condition holds — the one part of a rule that speaks about *this* question — re-imports the harm
that the conservative instruction was avoiding. The benefit of anchoring, to the extent it exists, comes
from making "unchanged" the default and not from giving the model a better reason to change.

**The fix ships with the retraction.** `DistillCache` persists every distillation reply, keyed by model,
prompt version and prompt, and the workflow restores that file between dispatches. A replayed run learns
the identical store: over a rehearsal against the stand-in, the second run made **160 calls where the
first made 201** and hit the cache **40 times out of 40**, with the same 40 rules. The next arm comparison
therefore varies in the arm rather than in the treatment, which is what every comparison in this line of
work was supposed to do and none of them did.

**What this costs the project's story.** Six iterations of mechanism claims were made against a treatment
that was silently resampled. The measurements inside each run are still valid — a paired comparison of two
arms in one dispatch shares a store — so the nulls (deletion, corroboration, per-rule credit) stand as
within-run results. What does not stand is any statement of the form "the pack costs N points", because N
has been measured at −4.57, −4.00, −3.71, −1.71, 0.00 and +0.86 across runs. With the cache in place that
number can finally be estimated, and the estimate may well be smaller than the one this project has been
quoting.

**Evidence.** Five runs as listed (2,700–5,200 calls each, 0 call failures, all nine gates passing); 1,124
tests, coverage **99.97 / 99.65 / 100 / 99.97**; `distill-cache.ts` at 100% on all four dimensions; the
cache rehearsal is `SOTA_DISTILL_CACHE` run twice against `eval/drivers/stand-in.mjs`, 201 then 160 calls.

### 80 — The content is not the problem: a random third does as well as the checkable rules

The standing hypothesis after iteration 79 was that the *content* is wrong — that the rules are
restatements, or wrong, or unusable — and that fixing what is stored would fix the effect. This iteration
audited the store, built two arms that separate content from volume, and the hypothesis fails in a way
that is more useful than a confirmation.

**The audit.** 1,288 rules, distilled from BIRD by the dispatch this iteration reports:

| Property | Count |
|---|---|
| Carries a condition | 1,288 (100%) |
| Condition begins "The question asks…" | **992 (77%)** |
| Names anything with an underscore in it (`player_fifa_api_id`, `frpm.x`) | **144 (11%)** |
| Passes the strict grounding test — names a table, or a column that cannot be read as prose | **66.2% of pack slots** |
| Statement contains a quoted literal (`'D'`, `'Semi-Final'`) | 368 (29%) |

So the store is mostly prose: statements like "a positive measure of degree of coagulation is represented
by a '+' value in the coagulation test columns". It is not obviously *wrong* — the harmful rules sampled in
iteration 79 were mostly true ("Player_Attributes rows join to Player rows on player_fifa_api_id, not
player_api_id" is correct for formula_1) — but it is mostly *unfalsifiable*: a reader cannot check the
claim against the catalogue it is being injected into.

**Two arms that separate the two hypotheses.**

| Arm | What it keeps | Rules per pack | ACC | Δ vs no memory | Δ vs `full` |
|---|---|---|---|---|---|
| no memory | — | 0 | 53.71% | — | — |
| `full` | everything retrieved | 1.76 | 50.86% | −2.86pp | — |
| **`full-grounded`** | only rules naming a table or a distinctive column | 1.16 | 51.43% | −2.29pp | **+0.57pp** (5 lost / 7 gained, p = 0.774) |
| **`full-sampled`** | the same number of rules, chosen at random | 1.16 | 51.71% | −2.00pp | **+0.86pp** (6 lost / 9 gained, p = 0.607) |
| oracle | the gold rule stated | 0 | 83.43% | +29.71pp | — |

**The answer is that which rules are in the pack does not matter.** The checkable subset and a random
subset of the same size are indistinguishable: **+0.57 against +0.86, and directly against each other
p = 1.0**. Whatever makes the pack cost points, it is not that three quarters of it cannot be checked
against the schema, and it is not that the rest is the wrong three quarters.

**What does move is how many.** The two pruned arms beat `full` by half a point each, and the only thing
they share is that they carry 0.6 fewer rules per question. Across the four arms that vary the pack size,
accuracy falls about **1.7pp per rule injected** (53.71% at zero, 50.86% at 1.76), with the fitted baseline
recovering to 53.63%. This is the first dose relationship this project has measured — iteration 66's null
on dose varied the retrieval budget rather than the injected set, and a budget that is never binding looks
exactly like a mechanism that does not exist.

**A defect this iteration found in its own instrument.** The first dispatch of `full-grounded` passed
**79.7%** of the pack, against the 21.5% the audit predicted, and measured nothing (0.00pp, p = 1.0). The
filter accepted any column name, and BIRD has columns called `date`, `name`, `status`, `rank` and `year` —
words a rule says in prose. Grounding on those is grounding on English. `SchemaIndex` now keeps tables and
columns apart and admits a column only when its name cannot be read as prose; the strict reading passes
66%, which matches the audit, and is the arm reported above. Both numbers are kept in the record because
the loose one is the measurement that would have been published if the arm had not been rehearsed.

**What this leaves.** The mechanism is not retrieval (iterations 62–64), not ranking, not shape, not
corroboration, not per-rule credit, not deletion, not anchoring, and now not the content of the rules. It
is the quantity of guidance in front of the question, at roughly 1.7pp per rule. The next experiment is
that curve measured properly — three pack sizes, one store, enough power to see where it crosses zero —
because a relationship that steep is also the most actionable thing this project has found: a pack of one
rule should cost about a third of what a pack of three costs.

**Evidence.** Runs [`40378820485`](https://github.com/AgentiX-E/microglia/actions/runs/40378820485) (loose
filter, 2,266 calls, 495 distill-cache hits) and
[`40393893889`](https://github.com/AgentiX-E/microglia/actions/runs/40393893889) (strict filter, 2,127 calls,
618 hits of 644, 0 call failures, all nine gates passing); 1,136 tests, coverage
**99.97 / 99.65 / 100 / 99.97**; `sql-exec.ts` at 100% on all four dimensions.

### 81 — The retry is the treatment, and the content arm measured nothing

Iteration 80 left one number unexplained: guidance in front of the question costs about 1.7pp
per rule, and nobody had asked what a correction loop looks like when the memory is spent only
where an answer already failed. This run put that question, the content question, and the
control that had been missing into one dispatch on BIRD Mini-Dev, cross-fitted over 5 folds,
350 scored questions, 2,150 model calls.

| Arm | What it injects | Where | Items per pack | ACC | Δ vs no memory | gained / lost |
|---|---|---|---|---|---|---|
| no memory | — | — | 0 | 53.43% | — | — |
| `full` | rules | first prompt | 1.81 | 51.71% | −1.71pp [−4.57, +1.14] p = 0.33 | 10 / 16 |
| `full-repair` | repair notes | first prompt | 1.00 | 51.71% | −1.71pp [−4.29, +0.86] p = 0.29 | 8 / 14 |
| `full-onretry` | rules | retry only | 0.13 | **54.86%** | **+1.43pp** [+0.29, +2.86] p = 0.0625 | 5 / **0** |
| `full-repair-onretry` | repair notes | retry only | 0.07 | 54.57% | +1.14pp [+0.29, +2.29] p = 0.125 | 4 / **0** |
| `retry-blank` | nothing | retry only | 0.00 | **54.57%** | **+1.14pp** [+0.29, +2.29] p = 0.125 | 4 / **0** |
| oracle | the answer, stated | first prompt | 0 | 83.14% | +29.71pp p < 1e-15 | 108 / 4 |

**`retry-blank` was the arm the published retry result was missing, and it answers the
question.** A second attempt with no pack at all recovers 4 of the 25 questions whose first
answer failed, which is the entire +1.14pp that iteration 80's `full-onretry` reported. The
memory adds one question on top (20.0% against 16.0% on the retried subset, n = 25): a single
flip, p = 1.0 between the two arms. **Retrying helps; the pack does not help the retry.**

| On the 25 retried questions | ACC | Δ vs their own first answer |
|---|---|---|
| no memory | 0.00% | — |
| `retry-blank` | 16.0% | +16.0pp [4.0, 32.0] |
| `full-onretry` | 20.0% | +20.0pp [4.0, 36.0] |
| `full-repair-onretry` | 16.0% | +16.0pp [4.0, 32.0] |
| oracle | 60.0% | +60.0pp |

**The retry population is small and that is the finding's limit.** Only 25 of 350 questions
(7.1%) produce a signal a deployment can see — the query failed to execute, or it ran and
returned nothing. A treatment that can only reach 7% of the benchmark cannot move it by more
than 7 points, and the 4 recoveries it did produce are within the noise of a 25-question
sample. The subset statistic is reported next to the population delta for exactly this reason;
it is conditional on a post-treatment variable and cannot be a headline.

**The content arm measured nothing, and the artefact said so.** The repair memory ended the run
with **one active item per fold**. A store holding nothing and a store holding one generic item
look identical from outside, so the run could not say whether the distiller had nothing to say
or whether we threw away what it said. Both arms that used it (`full-repair`,
`full-repair-onretry`) are therefore not measurements of content: they injected the same single
item into every prompt. Their numbers are recorded rather than read.

The three candidate causes were all in the pipeline, not the model:

| Suspect | Evidence | Fix |
|---|---|---|
| the 400-character statement cap | the repair form writes three parts — what failed, why, the fix — and the parser drops past 400 **without a counter** | `MAX_STATEMENT` 400 → 640 |
| three jobs in one field | `statement` had to be a fix, a diagnosis and a condition at once, and lost to the cap | the account moves to `payload.wrong` / `payload.cause`; `statement` is the fix (≤240 characters) |
| silent truncation | replies that hit the token limit fail to parse and are counted as "the model said nothing" | 3,000 tokens for the repair form |

`parseDistillResponse` now reports every dropped candidate by reason, the lane aggregates the
counts per form into `distill_drops`, and the repair store's contents travel as `items_repair`.
A number that cannot distinguish "nothing was learned" from "everything was discarded" is not a
measurement, and the next iteration should not have to guess.

**What this changes in the record.** The +1.14pp attributed to memory-on-retry in iteration 80
is retracted: it is the second attempt, not the retrieved experience. The mechanism that has
survived every arm so far is unchanged — any block in front of the question costs accuracy, and
the amount is not explained by which rules are in it (iteration 80) nor, now, by how many
(1.00 item cost the same 1.71pp as 1.81).

**Evidence.** Run [`40410701773`](https://github.com/AgentiX-E/microglia/actions/runs/40410701773),
2,150 calls, 0 call failures, 25 retried of 350, all gates passing; 1,160 tests, coverage
**99.97 / 99.66 / 100 / 99.97**; `master` at `cc36ac0`.

### 82 — The content arm's store was empty twice, for two different reasons

Iteration 81 ended with a hypothesis: the repair distiller's statements were being dropped by a
400-character cap that counted nothing. Two dispatches and three local probes later, that
hypothesis is wrong, and the two actual causes are both in the store rather than in the model.

**The cap was not the cause.** With the drop counter in place, run
[`40425009437`](https://github.com/AgentiX-E/microglia/actions/runs/40425009437) reports **four**
dropped statements across 1,400 distillations, one per fold. The store still ended with one
active item per fold. A counter that acquits the suspect it was built for is worth the run.

**Cause one: a payload made every note contradict every other.** Reproduced locally without a
model. Thirty distinct procedure candidates in one scope, each carrying `{wrong, cause}`:

| Candidates | Payload | Items | Active | Confidence |
|---|---|---|---|---|
| 30 | per-case record | 30 | **1** | 0.456 (29), 0.617 (1) |
| 30 | none | 30 | **30** | 0.617 |
| 20 | `{}` on alternating replies | 20 | **1** | 0.456 (19) |

`contradictSameScope` treats *any* active item of the same kind in the same scope with a
different payload as a claim it contradicts. Nineteen of twenty items therefore demote
themselves and their neighbours, land at 0.456 — below the activation floor — and stay
`candidate` forever. The store holds the lessons and cannot show them, which from outside is
indistinguishable from having learned nothing.

Two defects, not one, and the second is the sharper one: `jsonEqual({}, null)` is false, so an
item that carries no payload "contradicts" an item that carries none either. A model that writes
`"payload": {}` on some replies and omits it on others poisons its own store. Both are fixed:
normalise `{}` to absent at parse time, and require both sides to carry structured content before
a conflict can be counted. After the fix both probes keep 20 of 20 active.

**Cause two: it was the wrong shape for the store anyway.** The repair form now writes one
statement of three sentences — what the attempt did, why that is wrong, what the correction does
— and no payload. That is what the reader was going to see either way, and it is what the store's
claim identity can represent: a claim is its sentence.

**A retraction, on the record.** Iteration 81 said the 400-character cap was "probably the
cause". The counter that was added to prove it proved the opposite, and the entry above is the
correction. The earlier reasoning was not unreasonable — the statements were long and the drop
was silent — but it was a guess dressed as a diagnosis, and the fix cost a dispatch.

**What the two runs measured while the content arm was empty.** Both arms that read the broken
store injected a single item, and both lost accuracy: `full-repair` −2.29pp in run 3, +0.57pp in
run 2, against a rule pack of 1.8 items losing 1.43pp twice. One item is enough to cost, which is
consistent with iteration 81 and inconsistent with a per-rule price.

The retry control also moved: `retry-blank` recovered 4 questions in run 2 and 2 in run 3
(+1.14pp against +0.57pp), while `full-onretry` recovered 5 both times. The retry's own benefit is
unstable at this sample size; the memory's contribution to it is one question in both runs.

**Evidence.** Runs [`40420466889`](https://github.com/AgentiX-E/microglia/actions/runs/40420466889)
(2,018 calls) and [`40425009437`](https://github.com/AgentiX-E/microglia/actions/runs/40425009437)
(2,024 calls, 24 retried of 350, 0 call failures); local probes on the built packages; 1,168
tests, coverage **99.97 / 99.66 / 100 / 99.97**; `master` at `f12e365`.

### 83 — Four runs of the timing question, and the content arm still cannot be read

The timing question now has four independent dispatches on the same protocol (BIRD Mini-Dev, 5
folds, 350 scored questions, cross-fitted, `multiset` scoring, seed 7). The content question has
four attempts and no measurement, for a reason that is not the model.

| Run | no memory | `full` (always) | `full-onretry` | `retry-blank` | `full-repair` | oracle |
|---|---|---|---|---|---|---|
| 81 | 53.43% | −1.71pp | +1.43pp | **+1.14pp** | — (empty store) | +29.71 |
| 82 | 52.57% | −1.43pp | +1.43pp | **+1.14pp** | +0.57pp (1 item) | +31.43 |
| 83 | 53.14% | −1.43pp | +1.43pp | **+0.57pp** | −2.29pp (1 item) | +30.57 |
| 84 | 53.43% | −2.00pp | +1.43pp | **+1.14pp** | −1.14pp (1 item) | +29.71 |

**The timing half is answered.** Guidance in front of the first answer loses accuracy in every
run (−1.43, −1.43, −1.71, −2.00; one of four significant on its own, none positive). The same
guidance spent only after a failure never loses a question in any run (0 lost, four times).

**And the gain in that arm is the retry.** `retry-blank` — the identical second attempt with an
empty pack — gains +1.14, +1.14, +0.57, +1.14. `full-onretry` gains +1.43 four times. The
difference is **one question**, in every run, and it is not significant against the blank arm at
any point (p = 1.0 on the retried subset). Ten of ten claims that memory helps a retry, across
four dispatches, resolve to the same one or two flips.

| Run | retried / 350 | blank recovers | memory-on-retry recovers |
|---|---|---|---|
| 81 | 25 | 4 | 5 |
| 82 | 23 | 4 | 5 |
| 83 | 24 | 2 | 5 |
| 84 | 25 | 4 | 5 |

**The content half is still unmeasured, and the store is why.** Four runs, four diagnoses, each
one wrong in a way the previous one could not see:

| Run | What the store held | What the artefact said | What was actually happening |
|---|---|---|---|
| 81 | 1 active item per fold | nothing — there was no counter | a 400-character cap was *assumed* to be the cause |
| 82 | 1 active item per fold | 0 parser drops | the cap was innocent; `payload` made every note contradict every other |
| 83 | 249 items, 1 active | 4 drops of 1,400 | `{}` vs absent payload poisoned the rest |
| 84 | 11 items, 10 `retired` | 0 drops, no payloads anywhere | unexplained: a local probe with the same fix keeps 20 of 20 active |

The fourth row is the honest state: the repair notes are written correctly — they read as three
sentences naming a mechanism, e.g. "the attempt counted distinct player identifiers after
filtering on preferred foot; counting distinct values collapses repeated rows per player, so the
result counts players rather than appearances; the correction counts rows instead" — and the
store retires them anyway. The local reproduction that motivated the last fix does not reproduce
this, which means the difference is in the event stream rather than in the candidate, and the
next iteration starts by replaying a real fold's events through `distill` offline instead of
guessing at the policy again.

**What four runs buy.** The timing result is replicated and the effect sizes are stable to a
question. The content result does not exist yet, and no number above should be read as evidence
that repair notes are worse than rules: `full-repair` never saw more than one note, and a
one-item pack is a different treatment from the one the arm is named after.

**Evidence.** Runs [`40410701773`](https://github.com/AgentiX-E/microglia/actions/runs/40410701773),
[`40420466889`](https://github.com/AgentiX-E/microglia/actions/runs/40420466889),
[`40425009437`](https://github.com/AgentiX-E/microglia/actions/runs/40425009437),
[`40435624940`](https://github.com/AgentiX-E/microglia/actions/runs/40435624940) — 1,907 to 2,150
calls each, 0 call failures, 23–25 retried of 350, all gates passing; 1,168 tests, coverage
**99.97 / 99.66 / 100 / 99.97**; `master` at `f12e365`.

### 84 — The content arm finally runs, and the richer memory is worse

The store had been empty for four dispatches. The cause was one predicate: scope widening
identified a claim by its payload, so two lessons of the same kind that carried no payload were
"the same claim seen from two domains", and a fold's 200 notes became one. Run
[`40496280712`](https://github.com/AgentiX-E/microglia/actions/runs/40496280712) is the first in
which the repair memory holds what it learned: **123–137 active notes per fold**, 30 of 30
sampled items `active`, and notes that read as the account they were asked for — "the attempt
counted distinct patient identifiers across a join of the patient, laboratory and examination
relations; because the join multiplies each patient into one row per match, the count is a count
of matches; the correction counts rows of the joined result instead."

| Arm | What it injects | Where | Items | ACC | Δ vs no memory | gained / lost |
|---|---|---|---|---|---|---|
| no memory | — | — | 0 | 53.43% | — | — |
| `full` | rules | first prompt | 1.86 | 50.57% | −2.86pp [−6.00, +0.29] p = 0.11 | 11 / 21 |
| **`full-repair`** | **repair notes** | **first prompt** | 1.00 | **48.29%** | **−5.14pp [−8.29, −2.00] p = 0.0021** | 7 / **25** |
| `full-onretry` | rules | retry only | 0.14 | 54.57% | +1.14pp [+0.29, +2.29] p = 0.125 | 4 / 0 |
| `full-repair-onretry` | repair notes | retry only | 0.07 | 54.29% | +0.86pp [0.00, +2.00] p = 0.25 | 3 / 0 |
| `retry-blank` | nothing | retry only | 0.00 | 54.29% | +0.86pp [0.00, +2.00] p = 0.25 | 3 / 0 |
| oracle | the answer, stated | first prompt | 0 | 82.86% | +29.43pp p < 1e-15 | 104 / 1 |

**The answer to "what should be remembered" is that it does not help to remember more.** The
repair notes are exactly the artefact the hypothesis asked for — a comparison of the wrong answer
with the right one, the mechanism, and the condition — and in front of the question they cost
**5.14pp, significantly**, against 2.86pp for the declarative rules they replaced. More
explanation, more damage.

**Both forms are inert at the only moment that costs nothing.** On the 26 retried questions:
blank 11.5%, repair-on-retry 11.5%, rule-on-retry 15.4%. The repair note that says *this failure,
this cause, this fix* is worth exactly nothing over a blind second attempt. The rule is worth one
question.

**A mechanism the numbers now support.** The two always-on arms differ in item count (1.86 against
1.00) and in nothing else that moved: one rule is about 250 characters of block, one repair note
about 450, and the packs are therefore of similar size. Accuracy tracks the size of the text, not
the number of claims or their form — which is what iteration 80's dose null could not see,
because it varied the retrieval budget rather than the injected characters. The next experiment
is the one that follows: packs matched on characters, 0 to 1,200, and a zero crossing.

**What four earlier runs had already settled.** The retry channel is neutral (0 questions lost in
five dispatches); the gain inside it belongs to the retry, not to the memory (blank recovers 2–4
of 23–26, memory adds at most one); and guidance before the first answer costs accuracy every
time it has been measured (−1.43, −2.00, −2.86, −1.71).

**Evidence.** Run [`40496280712`](https://github.com/AgentiX-E/microglia/actions/runs/40496280712),
1,921 calls, 0 call failures, 26 retried of 350, all gates passing, `master` at `01fdedf`; four
dropped repair statements of 1,400 distillations (0.3%, the cap doing its job); 1,174 tests,
coverage **99.97 / 99.66 / 100 / 99.97**.

### 85 — The lane measures itself, and the dose curve is flat

The content run said accuracy tracks the size of the injected block. This run made the block
size the only variable: the same store, the same retrieval, the same question, and a character
budget handed to the pack layer.

| Arm | Characters injected | Items | ACC | Δ vs no memory | gained / lost |
|---|---|---|---|---|---|
| no memory | 0 | 0 | 53.43% | — | — |
| `chars-150` | **0** | 0 | 54.29% | **+0.86pp** | 4 / 1 |
| `chars-300` | 230 | 0.00 | 52.29% | −1.14pp | 8 / 12 |
| `chars-600` | 328 | 0.29 | 52.00% | −1.43pp | 8 / 13 |
| `full` | 1,088 | 1.85 | 52.57% | −0.86pp | 13 / 16 |
| `full-onretry` | 82 | 0.14 | 55.14% | +1.71pp p = 0.031 | 6 / 0 |
| `retry-blank` | 0 | 0.00 | 54.86% | +1.43pp | 5 / 0 |
| oracle | 223 | 0 | 82.86% | +29.43pp | 105 / 2 |

**Two of the arms were not what they were named.** The 150-character budget is smaller than the
wrapper, so the pack layer returned nothing and `chars-150` asked a byte-identical question to
`none`. The two copies differ by **4 questions gained and 1 lost, +0.86pp** — that is the
endpoint, not the treatment. Every effect this project has reported for a memory arm is of the
same order: one to five questions.

The 300 and 600 budgets admitted the wrapper but no item, because one JSON line is ~250
characters after the header. They injected 230 and 328 characters of a block that says
`items="0"`: **text with no knowledge in it**. It cost 1.14 and 1.43pp, which is to say the
"cost of guidance" that seven iterations attributed to rules was in part the cost of a header.

**A defect, fixed.** `renderPack` refused a budget smaller than the wrapper and returned the
wrapper when no item fitted — two hundred characters announcing zero knowledge. It now returns
nothing in both cases, with a test that pins the empty render.

**What survives.** With the curve flat inside its own noise band, the memory arms in front of the
question are indistinguishable from no memory at this sample size; the retry arms never lose a
question and gain 1.4–1.7pp, of which the blind retry gains 1.4. The distances are unchanged and
the confidence in them is lower than the last four entries claimed.

**What this costs the record.** Iterations 81–84 read 1–5 question differences as mechanisms.
The honest statement is that the instrument's floor is about one percentage point, and the next
run measures that floor *inside* every run (`none-replica`) instead of inferring it afterwards.

**Evidence.** Run [`40501280407`](https://github.com/AgentiX-E/microglia/actions/runs/40501280407),
2,570 calls, 0 call failures, all gates passing, `master` at `b30c482`; 1,175 tests, coverage
**99.97 / 99.66 / 100 / 99.97**.

### 86 — A dose curve with its own noise floor, and the first two replications

One run, 3,220 calls, ten arms, and for the first time the instrument's floor measured inside the
same run: `none-replica` asks the no-memory question twice, byte for byte.

| Arm | Characters injected | Items | ACC | Δ vs no memory | gained / lost | p |
|---|---|---|---|---|---|---|
| no memory | 0 | 0 | 53.43% | — | — | — |
| **`none-replica`** | **0** | 0 | 53.43% | **0.00pp** | **3 / 3** | 1.00 |
| `chars-300` | 0 | 0.00 | 53.71% | +0.29pp | 5 / 4 | 1.00 |
| `chars-600` | 156 | 0.27 | 54.00% | +0.57pp | 6 / 4 | 0.75 |
| `chars-900` | 718 | 1.00 | **50.29%** | **−3.14pp** [−6.29, −0.29] | 9 / **20** | 0.061 |
| `full` | 1,094 | 1.87 | **50.29%** | **−3.14pp** [−6.00, −0.29] | 9 / **20** | 0.061 |
| `full-repair` | 939 | 1.00 | **48.57%** | **−4.86pp** [−8.57, −1.43] | 13 / **30** | 0.014 |
| `full-onretry` | 77 | 0.13 | 54.00% | +0.57pp | 2 / 0 | 0.50 |
| `retry-blank` | 0 | 0.00 | 54.00% | +0.57pp | 2 / 0 | 0.50 |
| oracle | 223 | 0 | 82.86% | +29.43pp | 105 / 2 | < 1e-15 |

**The floor is three discordant questions.** Two identical prompts still produced 3 gained and 3
lost. Everything at or below three flips is noise: `chars-300`, `chars-600`, and both retry arms —
which is to say the retry memory's contribution, measured five times now, has never exceeded the
instrument.

**The dose curve is monotone once a whole item fits.** Below one item the packs are empty (the
render fix) and the deltas are noise; at 718 characters — one rule, envelope included — accuracy
falls 3.14pp on 20 lost against 9 gained; at 1,094 characters with 1.87 rules it falls the same
3.14pp; and one 450-character repair note at 939 characters falls 4.86pp. The cost arrives when
the block becomes readable as a claim, and grows with how much of a claim there is.

**The content result replicated.** `full-repair` cost −5.14pp in iteration 84 (p = 0.0021) and
−4.86pp here (p = 0.0137) against rules at −2.86 and −3.14: the comparison of a wrong answer with
the right one, which is what the hypothesis asked for, is consistently the *more* damaging of the
two forms when it precedes the question. That is now two independent dispatches with the same
sign, magnitude and significance.

**Why this is the shape it is.** A record in the prompt is read as an instruction to reproduce the
case it describes. Twenty questions are lost for nine gained because the model follows the
retrieved query's structure where the question wanted a different one — the effect the
experience-following literature reports and the reason every natural-language intervention fails
on it. The retry channel is the one place where the record cannot displace anything: the answer
has already been given, and its failure is what the second call is about.

**Evidence.** Run [`40506721172`](https://github.com/AgentiX-E/microglia/actions/runs/40506721172),
3,220 calls, 0 call failures, 25 retried of 350, all gates passing, `master` at `08b3736`; 1,175
tests, coverage **99.97 / 99.66 / 100 / 99.97**.

### 87 — Retrieval was never the problem; obedience is

The question this iteration had to answer: is the failure experience extracted correctly, is it
retrieved for the right question, and is it shown at the right moment? The lane had only ever
measured the third of those with accuracy, which cannot separate "the memory is wrong" from "the
memory never arrived". Two numbers were missing: how often the pack is *about* the question, and
what happens in each half.

**Measured, in-lane, on 350 packs** (`retrieval_relevance`), and recomputed independently from the
per-case texts (287 against 271 — the difference is the `when` clause, which the lane includes and
the audit script did not):

| Packs | Share | ACC | Same questions, no memory | Δ |
|---|---|---|---|---|
| named an entity the answer uses | 271–287 of 350 (77–82%) | 46.1% | 48.7% | **−2.6pp** |
| named nothing the answer uses | 63–79 | 70.9% | 72.2% | −1.3pp |

**Retrieval is not broken.** Four fifths of the packs name a table or column the gold query
actually uses, and the questions that receive an unrelated pack — the oxygen-atoms question that
was handed a note about parsing lap times — are **unharmed**: 74.6% with the pack, 74.6% without.
A rule about another database is ignored.

**The harm is entirely in the packs that are relevant.** They cost 2.6–2.8pp, and the more the
note explains the more they cost: `full-repair` −5.71pp this run (p = 0.0012), −4.86 (p = 0.0137)
and −5.14 (p = 0.0021) in the two before, against −2.29, −3.14 and −2.86 for the shorter rules.

So the answer to "is the experience extracted correctly and used in the right place" is:

| Step | Verdict | Evidence |
|---|---|---|
| extraction | yes | 123–137 active notes per fold; they read as *what failed, why, what fixed it*; 0.3% dropped |
| retrieval | yes, by entity | 77–82% of packs name something the answer uses |
| **application** | **no** | a relevant pack is *followed*, not weighed: −2.6pp, and −5.7pp when it explains more |

**The fix that follows is not a better retriever.** `full-asked`, which keeps only rules naming a
token the *question* names, removed 0.03 of an item per pack (1.84 → 1.81) and left the loss
intact (−2.29pp): the filter has nothing to remove, because the packs already pass it. What is
left to test is the one thing no arm has varied — whether the note carries the case's nouns at
all. A rule that names `thrombosis_prediction.Laboratory` invites the model to reproduce the case
that produced it; a rule that says *when a question counts entities across a one-to-many join,
count after filtering* has no case to reproduce. `full-procedural` is the next arm.

**The retry channel is unchanged and still the only non-negative one.** 24 retried of 350;
`full-onretry` +1.43pp with 5 gained and 0 lost; `retry-blank` +0.57pp with 2 gained and 0 lost;
`none-replica` — the identical prompt asked twice — 4 gained and 3 lost. The memory's contribution
at retry (+1 question) is at the instrument's floor.

**A correction.** The commit message of `b86400b` reports "210 of 350 packs named nothing the gold
query uses". That number came from a join against an artefact list that held one fold's items, so
most packs looked unrelated; the lane's own metric and the independent recomputation both say
63–79. The claim in the commit is withdrawn here, and the measurement now travels in the artefact
rather than in a script.

**Evidence.** Run [`40512822827`](https://github.com/AgentiX-E/microglia/actions/runs/40512822827),
2,526 calls, 0 call failures, all gates passing, `master` at `b86400b`; 1,180 tests, coverage
**99.97 / 99.48 / 100 / 99.97**.

### 88 — The first form that does not lose: a procedure with no case in it

The relevance audit said the nouns are the problem. This run removed them: a third distillation
form states one sentence about the *shape* of the question — "when a question counts entities
across a one-to-many join, aggregate after filtering, because the join multiplies rows" — with no
table, column, alias, literal or database in it, and the store enforces the rule rather than
asking for it: `distill()` now takes a host veto, and the lane refuses any candidate naming a
table or column of the database it was learned from. 124–138 procedural notes survive per fold.

| Arm | Items | Characters | ACC | Δ vs no memory | gained / lost | p |
|---|---|---|---|---|---|---|
| no memory | 0 | 0 | 53.71% | — | — | — |
| `none-replica` | 0 | 0 | 54.00% | +0.29pp | 2 / 1 | 1.00 |
| **`full`** (rules, with the case) | 1.88 | 1,096 | **49.43%** | **−4.29pp** [−7.43, −1.43] | 7 / **22** | 0.008 |
| **`full-procedural`** | 1.76 | 1,064 | **54.57%** | **+0.86pp** [−2.29, +4.00] | 17 / 14 | 0.72 |
| `full-onretry` | 0.13 | 78 | 55.14% | +1.43pp | 5 / 0 | 0.063 |
| `retry-blank` | 0 | 0 | 54.57% | +0.86pp | 3 / 0 | 0.25 |
| oracle | 0 | 223 | 83.14% | +29.43pp | 103 / 0 | < 1e-15 |

**Same store, same corrections, same size, same position — opposite sign.** The two arms inject
almost the same number of characters (1,096 against 1,064) and differ in one property: whether the
claim names the case. Rules with nouns: −4.29pp, twenty-two questions lost. Procedures without
them: +0.86pp, fourteen lost. At this sample size the honest claim is **"no longer loses"**, not
"gains" — 0.86pp is a third of the floor this run measured (3 discordant questions).

**And the relevance split, scored correctly, says where the difference lives** (the first version
of this block was scored by the wrong arm and is fixed in `2dbacef`, with a reconciliation check):

| Arm | Packs naming an answer entity | Δ | Packs naming none | Δ |
|---|---|---|---|---|
| `full` | 284 | **−4.6pp** | 66 | −3.0pp |
| `full-procedural` | 85 | +1.2pp | 265 | +0.8pp |

A procedural pack is *by construction* usually unable to name anything (85 of 350 do, through
ordinary words). That is the point: it has nothing to map onto this question, and it stops
costing. The rule that names `Laboratory` invites the model to reproduce the case that produced
it; the procedure says what to do and leaves the case behind — which is the shape ExpeL's insights
and ReasoningBank's strategies have, and the shape this project had never tried.

**What this establishes and what it does not.** It establishes that the loss was caused by the
case nouns and not by the presence of guidance as such — the two arms are matched on characters,
items, store and position. It does not establish a gain: one run, p = 0.72, and 17 gained against
14 lost is three flips of signal at this sample size. Replication is the next dispatch, and the
form is now the first entry of ROADMAP R1 with that criterion written down.

**Evidence.** Run [`40520115956`](https://github.com/AgentiX-E/microglia/actions/runs/40520115956),
2,337 calls, 0 call failures, all gates passing, `master` at `3b96fec` followed by `2dbacef`;
1,182 tests, coverage **99.97 / 99.46 / 100 / 99.97**.

### 89 — The procedural form does not replicate, and the case-bearing form does

Iteration 88 ended with the first positive sign this project has had for an always-on arm
(+0.86pp). The floor it measured in the same run was three discordant questions, so the entry
said "no longer loses" rather than "gains", and the replication was dispatched. It does not
replicate.

| Arm | 88 | 89 | mean | verdict |
|---|---|---|---|---|
| `full` (rules, with the case) | −4.29pp (7/22, p = 0.008) | −4.29pp (5/20, p = 0.004) | **−4.29** | replicated, significant twice |
| `full-procedural` | +0.86pp (17/14) | −2.00pp (12/19) | −0.57 | **not replicated** |
| `full-onretry` | +1.43pp (5/0) | +1.71pp (6/0, p = 0.031) | +1.57 | replicated, never loses |
| `retry-blank` | +0.86pp (3/0) | +0.57pp (2/0) | +0.72 | replicated |
| `none-replica` | +0.29pp (2/1) | +0.29pp (1/0) | +0.29 | the floor, and it moves between runs |

**What survives is the comparison, not the level.** Across two runs the procedural form is 2.3 and
5.1 points better than the case-bearing form it replaced, and that difference has the same sign
twice with a matched store, matched characters and matched position. What does not survive is the
claim that it is neutral: −0.57pp on average, one run positive and one negative, inside a floor
that was 1 flip in one run and 3 in the other.

**Also worth recording: the procedural pack is cheap in every run.** Its relevance split shows 81
of 350 packs naming an answer entity, against 284 for the rule pack, and it costs −0.6pp in the
half that names something and −2.2pp in the half that does not… which is the opposite of the rule
pack's pattern and the reason to distrust two-run deltas at this sample size. What is stable is
that a pack of procedures loses about half of what a pack of case-bearing rules loses.

**A dose point that failed to be a dose point.** `chars-proc-600` recalled at 600 characters and
produced an **empty** pack on every question (0.00 characters, 0.00 items): a procedural note plus
its envelope is longer than 600 characters, so the arm measured no-memory again (−0.57pp, 0 gained
2 lost). The next dose point for this store is 900, and the render fix from iteration 85 is what
made the empty pack visible instead of a wrapper claiming zero items.

**Evidence.** Runs [`40520115956`](https://github.com/AgentiX-E/microglia/actions/runs/40520115956)
(2,337 calls) and [`40527117087`](https://github.com/AgentiX-E/microglia/actions/runs/40527117087)
(2,567 calls, 0 call failures, 350 scored, all gates passing); `master` at `19fb282`; 1,182 tests,
coverage **99.97 / 99.46 / 100 / 99.97**.

**R1.1 status: acceptance not met.** The form exists, is enforced, and is measurably better than
the form it replaces; it is not measurably better than nothing. R1.2 (ReasoningBank's three-field
memory) starts from that position rather than from a claimed gain.

### 90 — The key works now, and the memory is inert anyway

Two runs. The first asked the failure key 22 times and hit **nothing**; the second asks 26 times
and hits **25**. Both put the memory in the only configuration this project has ever found
non-negative — a procedure with no case in it, retrieved by the failure, shown after the failure.

**Why the key found nothing.** `failure_key: {asked: 22, hit: 0}` was not a retrieval failure. The
store and the retry spoke two vocabularies: the learning pass wrote "it returned 0 rows where the
corrected query returns 3", which the classifier files under `row-count`, and the retry said "it
returned no rows", which it files under `no-rows`. The two sides never shared a code, so the key
could not match by construction. `mismatchNote` now says "no rows" in the retry's words, and both
histograms travel in the artefact:

| | |
|---|---|
| stored (procedural store, all folds) | `columns` 380, `row-count` 148, `no-rows` 100, `values` 36, `other` 4 |
| observed (retried questions) | `no-rows` 25, `other` 1 |
| hits | **25 of 26** |

**And the accuracy is unchanged.**

| Arm | 90a (key broken) | 90b (key working) | mean | gained / lost (90b) |
|---|---|---|---|---|
| no memory | 54.00% | 53.14% | — | — |
| `none-replica` | −1.14pp (1/5) | +0.86pp (6/3) | −0.14 | the floor, 3–6 flips |
| `full` (case-bearing rules) | −4.00pp (6/20) | −3.43pp (9/21) | **−3.72** | −3.4, **significant** |
| `full-procedural` | −2.29pp (12/20) | +0.29pp (15/14) | −1.00 | +0.3 |
| `retry-blank` | +0.57pp (2/0) | +1.14pp (4/0) | +0.86 | +1.1 |
| `retry-keyed` | +0.57pp (2/0) | +1.14pp (4/0) | +0.86 | +1.1 |
| `full-onretry` | +1.14pp (4/0) | +1.14pp (4/0) | +1.14 | +1.1 |

`retry-keyed` and `retry-blank` are **identical to the question** in the working-key run: same four
gains, same zero losses, same accuracy. Retrieving the right note, by the right key, at the right
moment, on a store built from the right kind of claim, moves nothing.

**What this closes.** The hypothesis under test was: the memory hurts because it is remembered
wrongly and used wrongly. Every part of that has now been varied one at a time and measured:

| Component | Varied | Result |
|---|---|---|
| content | rules / repair accounts / procedures without the case | −3.7 / −5.2 / −1.0 against no memory |
| quantity | 0 to 1,200 characters, 0 to 3 items | cost arrives with the first readable claim |
| position | before the answer / after a failure / before and after | before: −3.7; after: 0.0 |
| retrieval key | question text / failure code | 96% hit on the failure key, no change in accuracy |
| selection | entity relevance, question relevance, corroboration | no arm moved more than the floor |

The memory is **inert when used correctly and harmful when used early**. It is not remembered
wrongly and it is not retrieved wrongly; it simply does not add information the model lacks about a
database it can already read, and it displaces attention when it arrives first.

**What follows for the product.** `retry` is the only admissible position, and its value is the
retry, not the pack. The pre-answer block should be off by default — five runs, four significant,
same sign every time. That is a decision the evidence supports and it is now the default the
implementation will carry.

**Evidence.** Runs [`40603859001`](https://github.com/AgentiX-E/microglia/actions/runs/40603859001)
(2,229 calls) and [`40614310589`](https://github.com/AgentiX-E/microglia/actions/runs/40614310589)
(2,316 calls, 0 call failures, 26 retried of 350, all gates passing); `master` at `547eaad`; 1,191
tests, coverage **99.97 / 99.46 / 100 / 99.97**.

### 91 — Three draws: the ceiling is real, and agreement finds none of it

R2 exists because every system above 70% EX on BIRD generates several candidates and chooses. This
pipeline had only ever taken one draw at temperature 0, so the selection axis was absent from every
measurement it had made — a memory arm and a no-memory arm were both single-sample, and the
difference between them could not be separated from the difference between two draws. This is the
first run with draws, controls and a ceiling in it.

| Arm | ACC | Δ vs `none` | 95% CI | gained / lost |
|---|---|---|---|---|
| `none` | 53.71% | — | — | — |
| `none-replica` | 54.57% | +0.86pp | [−1.43, 3.43] | 5 / 2 |
| `sample-3-first` | 52.00% | −1.71pp | [−4.29, 0.86] | 5 / 11 |
| `sample-3-random` | 52.57% | −1.14pp | [−3.71, 1.43] | 7 / 11 |
| `sample-3` (agreement) | 53.71% | **+0.00pp** | [−2.29, 2.29] | 7 / 7 |
| **`sample-3-oracle`** (ceiling) | **59.14%** | **+5.43pp** | **[3.14, 8.00]** | 20 / 1 |
| `full` (memory) | 50.57% | −3.14pp | [−6.29, −0.29] | 10 / 21 |

**Acceptance 2 is met and acceptance 3 is not, and the two facts are the result.**

- **The pool is better than the pipeline.** Best-of-3 exceeds the baseline by 5.43pp with a
  confidence interval that excludes zero and one lost question. Temperature 0.7 produces answers the
  greedy path does not, and some of them are right: 20 questions became correct, 1 became wrong.
  Generation is not the bottleneck at three draws.
- **Agreement retrieves none of it.** `sample-3` is the baseline to the question. The selector is not
  broken — it agreed on 334 of 350 questions and picked a winning group of two or more 254 times —
  it is simply blind. When the draws are distinct all three singleton groups are equally large, the
  tie goes to the earliest, and the arm degenerates to `sample-3-first`.

**The joint distribution says which failure each question has.** `correct_draws = [143, 22, 22, 163]`
— 143 questions wrong in all three draws, 163 right in all three, and **44 mixed**. Those 44 are the
only questions where a selector can act, and they are where the 5.43pp lives:

| Draws correct | Questions | Selected right | Selected wrong |
|---|---|---|---|
| 0 | 143 | 0 | 143 |
| 1 | 22 | 3 | 19 |
| 2 | 22 | 22 | 0 |
| 3 | 163 | 163 | 0 |

A question with two of three correct is answered correctly by agreement every time (the majority
group is the right answer). A question with one of three correct is answered wrong 19 times out of
22, which is exactly the 1-in-3 a blind tie-break gets. **The mixed population is not uniform, and
the selector's failure is concentrated in the harder half of it.**

**And the diversity is thinner than the design assumed.** 254 of 350 questions had a single distinct
execution signature across all three draws, 81 had two, 14 had three. Temperature 0.7 buys
alternatives on 27% of questions, which is why the consistency selector has so little to work with:
there is nothing to be consistent about. R2.5 (temperature) now has a judgement criterion rather than
a guess — a temperature that raises `distinct ≥ 2` without lowering `sample-3-first` is strictly
better, and this run says 0.7 costs 1.71pp on the first draw.

**Temperature alone is not free, and it is not significant.** `sample-3-first` −1.71pp (5 gained,
11 lost) is the price of asking at 0.7 instead of 0, and its interval includes zero. It is the same
size as the `full` memory arm's effect and the same size as the noise floor of every prior run,
which is the reason every number in this table travels with its interval.

**Evidence.** Run [`40698116045`](https://github.com/AgentiX-E/microglia/actions/runs/40698116045),
2,468 calls, 0 call failures, 350 scored, all gates passing, `master` at `a3e420a`; 1,213 tests,
coverage **99.97 / 99.45 / 100 / 99.97**.

**R2 status: acceptance 1 marginal, 2 met, 3 failed.** Agreement is measured and insufficient. The
next candidate is the selector the literature actually uses — MCS-SQL's multiple-choice prompt, worth
+2.1pp over value samples, or CHASE-SQL's selection agent, worth +4.2pp over self-consistency.

### 92 — Schema linking loses 7.4 points, and 292 of 350 prompts never changed

The second-cheapest item in the published ordering: MCS-SQL measures +2.1pp from pruning the schema
to the tables the question names, with the same model. The arm is a lexical linker — anchors on
identifiers the question and evidence mention, adds the key columns one join away, and declines to
prune when it would remove less than a third of the schema.

| Arm | ACC | Δ vs `none` | 95% CI | p | gained / lost |
|---|---|---|---|---|---|
| `none` | 54.00% | — | — | — | — |
| `none-replica` | 52.57% | −1.43pp | [−4.00, 1.14] | 0.45 | 1 / 6 |
| `full` | 50.57% | −3.43pp | [−6.29, −0.57] | 0.036 | 8 / 20 |
| **`linked`** | **46.57%** | **−7.43pp** | **[−10.86, −4.00]** | **< 1e-4** | 7 / 33 |
| `oracle` | 83.71% | +29.71pp | [26.86, 32.57] | < 1e-15 | 105 / 1 |

`schema_link = { reasons: { linked: 122, 'single-table': 35, 'all-matched': 170, 'nothing-matched':
23 }, dropped: 520, total: 2,253 }`.

**The number cannot be read as written.** 292 of 350 questions (all-matched, single-table,
nothing-matched) were offered a prompt **byte-identical to `none`**, and 122 were offered a pruned
one. A population delta that mixes 83% unchanged questions with 17% changed ones is mostly a
measurement of the run, not of the pruner: if the unchanged questions contributed nothing, the 122
pruned ones would have to carry −7.43pp by themselves, which is −21pp on that subset. That is a
claim no prompt change of this size supports, and the honest reading is that this run's baseline
moved and the arm moved with it.

**So the arm now records what it actually did.** `per_case.schemaTables` carries `{kept, total,
pruned}` for every question, which is what splits the delta in one read instead of two: the
`pruned === false` group is a second noise floor measured on 292 questions, and the `pruned ===
true` group is the effect. Until that field existed the split could not be computed from the
artefact, and the −7.43pp could not be attributed to pruning rather than to the run.

**Why the linker prunes so rarely.** `nothing-matched` is 23 questions — the question named no
identifier the schema has — and the linker returns the full schema rather than an empty one, because
an empty schema would be measuring SQL-from-nothing. `all-matched` is 170: the anchors reached more
than two thirds of the tables and the conservative rule declines. That leaves 122 questions with a
real reduction, 520 tables dropped of 2,253 offered, i.e. 23% of the schema on average when it acts.

**A design defect found by the first version's own test.** The first closure started from every
table already kept and walked further, so in a six-table fixture `drivers` reached all six through
`raceId` and the arm became a no-op. It now starts only from the anchors, one hop. The pruning
threshold had the same shape of error: `> 0.6` kept almost everything, so it is now "prune only if a
third goes".

**Evidence.** Run [`40702038834`](https://github.com/AgentiX-E/microglia/actions/runs/40702038834),
2,110 calls, 0 call failures, 350 scored, all gates passing, `master` at `a3e420a`; 1,213 tests,
coverage **99.97 / 99.45 / 100 / 99.97**.

**R3 status: not accepted, attribution open.** The arm as built does not help and may hurt. The
measurement that decides it is the pruned/unpruned split, and it is now one run away.

### 93 — Agreement is not blind, it is wrong exactly where it matters

Iteration 91 left one question open: agreement selected +0.00pp while the best of the same three
draws was +5.43pp. Either the selector was blind, or the ceiling was a fluke. This run answers both,
and adds the selector the literature actually uses.

| Arm | ACC | Δ vs `none` | 95% CI | p | gained / lost |
|---|---|---|---|---|---|
| `none` | 54.57% | — | — | — | — |
| `none-replica` | 54.29% | −0.29pp | [−1.43, 0.86] | 1.00 | 2 / 3 |
| `full` (memory) | 51.71% | −2.86pp | [−6.00, 0.00] | 0.099 | 10 / 20 |
| `sample-3-first` | 51.43% | −3.14pp | [−5.71, −0.86] | **0.019** | 4 / 15 |
| `sample-3` (agreement) | 52.00% | −2.57pp | [−4.57, −0.57] | **0.022** | 2 / 11 |
| `sample-3-model` | 51.43% | −3.14pp | [−5.71, −0.86] | 0.019 | 4 / 15 |
| `sample-3-oracle` | 56.29% | +1.71pp | [−0.29, 3.71] | 0.146 | 9 / 3 |
| `linked` | 46.57% | −8.00pp | [−11.43, −4.57] | **8.4e-6** | 6 / 34 |

**The ceiling is real but it moves.** +1.71pp here against +5.43pp in iteration 91, with
non-overlapping intervals. `correct_draws` was `[153, 16, 19, 162]` against `[143, 22, 22, 163]`:
the same number of all-wrong and all-right questions, and 35 mixed instead of 44. Draw quality at
temperature 0.7 is itself unstable, which is a property of the endpoint, not of the arm — and it is
the reason every claim here is bounded by "at three draws, on this run".

**The population delta hides the whole effect, again.** 82 of 350 questions had more than one
distinct execution signature; those are the only ones where any selector can act. On them:

| Draws correct | n | first | agreement | model | oracle |
|---|---|---|---|---|---|
| 0 | 47 | 0 | 0 | 0 | 0 |
| 1 | 16 | 3 | **1** | 5 | 16 |
| 2 | 19 | 14 | **19** | 14 | 19 |
| **total of 82** | | 18 (22.0%) | **20 (24.4%)** | 18 (22.0%) | 35 (42.7%) |

Agreement is **perfect** when two of three draws are right (19 of 19) and **almost never right** when
one is (1 of 16). The second number is not noise: when only one draw is correct, the other two are
usually the *same* wrong answer, so the majority group is the wrong one and a majority vote is
wrong by construction. Agreement is not blind. It is systematically wrong in exactly the case a
selector exists to fix — the confidently-wrong pair beating the lonely right answer.

**The model selector is at chance, and it works.** 82 asked, 0 unparsed, 16 answers different from
the first draw, 8 gained and 8 lost, 18 correct against 18 for the first draw. It is not a broken
arm — it is a competent reader of three plausible SQL queries, and plausibility is not correctness.
Two queries that differ in one join condition read as two plausible queries.

**And the schema-linker's loss now decomposes exactly.** The split is computed by the lane
(`schema_link.split`) rather than by a script:

| Group | n | `none` | `linked` | Δ | gained / lost | tables |
|---|---|---|---|---|---|---|
| **pruned** | 122 | 53.3% | 32.0% | **−21.3pp** | 5 / 31 | 719 → 199 |
| unchanged | 228 | 55.3% | 54.4% | −0.9pp | 1 / 3 | 1,534 → 1,407 |

The two groups reconcile to the population figure: 122 × (−21.3) + 228 × (−0.9) = −2,804 correct
answers over 350 questions = −8.01pp, against −8.00pp reported. The linker is not noisy — it drops
72% of the tables on the questions it touches and breaks a quarter of them. The `unchanged` group's
−0.9pp is a noise floor measured on 228 questions with two byte-identical prompts, and it is the
same size as every `none-replica` this project has run.

**What this changes.** The temperature now costs more than the ceiling is worth on average
(`first − none` −3.14pp, `oracle − none` +1.71pp), and both selectors are at chance. The one thing
neither selector has is the information that would separate the candidates: none of them sees what
the queries *return*. `sample-3-exec` is that arm — the same draws, the same call count, the rows
attached — and it is the last cheap test of whether selection is empty because the signal is missing
or because the signal does not exist.

**Evidence.** Run [`40707498228`](https://github.com/AgentiX-E/microglia/actions/runs/40707498228),
2,889 calls, 1 retry, 0 call failures, 350 scored, all gates passing, `master` at `df0035f`; 1,241
tests, coverage **99.97 / 99.46 / 100 / 99.97**.

### 94 — Showing the selector the rows helps, and still does not pay for the temperature

The arm iteration 93 called for: same draws, same call count, and each candidate shown with the rows
it returns. It is the best selector this project has measured, and it is still worse than taking one
greedy draw.

| Arm | ACC | Δ vs `none` | 95% CI | p | gained / lost |
|---|---|---|---|---|---|
| `none` | 54.57% | — | — | — | — |
| `none-replica` | 54.57% | +0.00pp | [−1.14, 1.14] | 1.00 | 2 / 2 |
| `full` (memory) | 53.14% | −1.43pp | [−4.29, 1.43] | 0.44 | 11 / 16 |
| `sample-3-first` | 52.57% | −2.00pp | [−4.29, 0.29] | 0.14 | 5 / 12 |
| `sample-3` (agreement) | 52.86% | −1.71pp | [−3.71, 0.00] | 0.15 | 3 / 9 |
| `sample-3-model` | 52.86% | −1.71pp | [−4.00, 0.29] | 0.21 | 5 / 11 |
| **`sample-3-exec`** | **53.43%** | **−1.14pp** | [−3.43, 1.14] | 0.45 | 6 / 10 |
| `sample-3-oracle` | 58.00% | **+3.43pp** | **[1.43, 5.71]** | **0.004** | 14 / 2 |

**On the 85 questions where a choice existed, the ordering is the one the design predicted.**

| Draws correct | n | first | agreement | model | exec | oracle |
|---|---|---|---|---|---|---|
| 0 | 45 | 0 | 0 | 0 | 0 | 0 |
| 1 | 17 | 3 | **0** | 10 | 8 | 17 |
| 2 | 22 | 18 | 22 | 13 | 17 | 22 |
| 3 | 1 | 1 | 1 | 0 | 0 | 1 |
| **total of 85** | | 22 (25.9%) | 23 (27.1%) | 23 (27.1%) | **25 (29.4%)** | 40 (47.1%) |

`exec` beats taking the first draw by 13 gained against 10 lost — the first selector in three runs to
beat that control at all. `model` breaks even (11/10). Agreement is again **0 of 17** on the
questions where only one draw is right, and perfect (22 of 22) where two are: it is a majority vote,
and a majority vote is wrong whenever the wrong answer is the popular one.

**But the temperature costs more than the selection returns.** Across three runs at temperature 0.7
and three draws:

| Run | `first − none` | `agreement − none` | `model − none` | `exec − none` | `oracle − none` |
|---|---|---|---|---|---|
| 91 | −1.71pp | +0.00pp | — | — | **+5.43pp** |
| 93 | −3.14pp | −2.57pp | −3.14pp | — | +1.71pp |
| 94 | −2.00pp | −1.71pp | −1.71pp | −1.14pp | **+3.43pp** |
| mean | **−2.28** | −1.43 | −2.43 | −1.14 | **+3.52** |

The ceiling averages +3.52pp and the price of sampling averages −2.28pp, so a selector that reached
the ceiling every time would net about +1.2pp — on 350 questions, at a resolution of 2.3pp. The best
selector measured recovers 0.86pp of the 2.00pp the temperature cost and none of the 3.43pp the
ceiling holds.

**R2 closes here, and its answer is a decision, not a number.** Sampling at temperature 0.7 and
selecting with anything this project has built — agreement, a model over SQL, a model over results —
is worse than one greedy draw, in three runs, with no exception and with the best arm still 1.14pp
short. The deployable conclusion is the same shape as iteration 90's: *do not sample*. Two selectors
and one ceiling later, the selection axis is measured and it is worth less than it costs at this
draw count on this endpoint.

**R2 status: acceptance 1 marginal, 2 met, 3 failed — closed on generated evidence.** Acceptance 2
(the ceiling exists) held in all three runs. Acceptance 3 (a selector beats the control by more than
the floor) held for `exec` on the subset, +3 questions of 85, and not on the population. What
survives is the mechanism: results are a better signal than text, by 2 questions of 85 over the
model selector, and the ordering exec > model = agreement > first is the ordering of how much
evidence each sees.

**The memory arm is negative for the ninth consecutive run** (−1.43pp here, 11 gained against 16
lost). Nothing in this window changes iteration 90's finding: the pack is inert when shown after a
failure and harmful when shown before the answer.

**Evidence.** Run [`40714313142`](https://github.com/AgentiX-E/microglia/actions/runs/40714313142),
2,642 calls, 13 retries, 0 call failures, 350 scored, all gates passing, `master` at `2b2938c`;
1,254 tests, coverage **99.97 / 99.56 / 100 / 99.97**.

### 95 — Value samples are null, and no wrong answer is wrong only in its literals

The last published lever that acts on the generator. The prompt has always carried the DDL and
nothing else, so every literal in every answer was a guess about a column's contents. This run
annotates each table with a few distinct values per column and measures the same questions.

| Arm | ACC | Δ vs `none` | 95% CI | p | gained / lost |
|---|---|---|---|---|---|
| `none` | 53.71% | — | — | — | — |
| `none-replica` | 54.29% | +0.57pp | [−0.57, 1.71] | 0.63 | 3 / 1 |
| **`values`** | **54.00%** | **+0.29pp** | **[−2.57, 3.14]** | **1.00** | 12 / 11 |
| `full` (memory) | 50.00% | **−3.71pp** | [−7.14, −0.57] | **0.047** | 12 / 25 |

`value_samples = { databases: 11, tables: 75, columns: 798, annotated: 796 }` — 99.7% of the
columns were annotated, so the arm is not vacuous. Twelve gained against eleven lost is the
definition of no effect, and the interval is wide enough to hold anything the published +4.8pp
would need.

**The diagnostic says why, and it is a better result than the arm.** Of the 162 questions the
baseline got wrong:

| What the wrong answer looks like | n | share |
|---|---|---|
| already contains every literal the gold query uses | 92 | 56.8% |
| missing at least one gold literal | 46 | 28.4% |
| gold query has no literals at all | 24 | 14.8% |
| **identical to gold once literals are masked** | **0** | **0.0%** |

The last row is the ceiling, and it is zero. In no wrong answer is the literal the *only* thing
wrong: mask every string literal on both sides and the two queries are still different, in all 162
cases. A model that guessed every literal perfectly would fix **no question**, because the join, the
aggregation or the filter is also wrong. The literal channel is worth 0pp on this benchmark by
construction, and that is why a fully-applied annotation moved 12 questions in each direction.

**What this does not say.** MCS-SQL's value samples are not a literal patch — they are a
question-linked index that uses cell values to identify which *column* a question is about, and that
channel can improve structure. This arm annotated uniformly and asked the model to work it out, which
is a weaker treatment and a different one. The honest claim is: uniform annotation is null here, and
the mechanism value samples are usually justified by — a wrong literal — has no headroom on this
corpus.

**The memory arm is negative for the tenth consecutive run**, and this one is significant
(−3.71pp, p = 0.047, 12 gained against 25 lost). Ten runs, one sign. Iteration 90's decision stands
and the implementation already carries it.

**Where the published ordering ends.** R2 (selection) is closed on three runs; R3 (schema linking)
is closed at −21.3pp on the questions it pruned; R4 (value samples) is closed at +0.29pp with a
zero-ceiling diagnostic. Three components of the competitors' pipelines have been built, measured
one at a time on the same protocol, and none of them pays on this corpus with this model. That is a
result about the *benchmark's* remaining headroom, not about the components: 53.7% of Mini-Dev is
what this model reaches from the schema alone, and the published margins come from pipelines whose
largest components are the ones now measured.

**Evidence.** Run [`40729502661`](https://github.com/AgentiX-E/microglia/actions/runs/40729502661),
1,754 calls, 1 retry, 0 call failures, 350 scored, all gates passing, `master` at `c52c7ab`; 1,267
tests, coverage **99.97 / 99.56 / 100 / 99.97**.

### 96 — Two thirds of the corrections are not in the store, and the third that is does nothing

The question asked three times and never measured: are the mistakes correctly extracted as rules?
Every previous arm reported a delta against no memory, and that statistic cannot separate a rule
that is wrong from a rule that does not transfer from a rule that is not obeyed. This run asks the
store to reproduce its own cases, with a paired blank so the retry's own repair rate is subtracted
rather than credited.

| Arm | ACC | Δ vs `none` | 95% CI | p | rules/question | gained / lost |
|---|---|---|---|---|---|---|
| `none` | 53.43% | — | — | — | — | — |
| `none-replica` | 54.00% | +0.57pp | [−0.86, 2.29] | 0.727 | 0.00 | 5 / 3 |
| `full` (memory) | 50.57% | −2.86pp | [−6.00, 0.29] | 0.110 | 1.87 | 11 / 21 |
| **`full-verified`** | **52.86%** | **−0.57pp** | **[−2.57, 1.43]** | **0.774** | **0.44** | 5 / 7 |
| `full-shuffled` | 51.71% | −1.71pp | [−4.86, 1.43] | 0.392 | 1.92 | 14 / 20 |

Against `full` on the same questions, `full-verified` is **+2.29pp [−0.57, 5.14] p = 0.185 (18
gained, 10 lost)**. It recovers 80% of the pack's deficit without being significant on its own.

**The extraction, measured for the first time.**

`rule_probe = { source_questions: 652, measured: 651, supplied: 149, redundant: 61, broke: 22,
useless: 419, blank_fix_rate: 0.1275, rules: 1256, kept: 294, unsupported: 918, broke_its_source:
42, no_verified_source: 2 }`

| Verdict | Meaning | n | share |
|---|---|---|---|
| `supplied` | the rules reproduce the correction the retry alone could not | **149** | **22.9%** |
| `redundant` | the correction was reachable without them | 61 | 9.4% |
| `broke` | the retry alone was right and the rules made it wrong | 22 | 3.4% |
| `useless` | neither attempt reached the correction | **419** | **64.4%** |

**Two thirds of the corrections are not in the store in any form that can replay them.** Given the
failure, the attempt that failed and the rules that correction produced, the model reproduces the
correction 149 times in 651 and fails 419 times. This is the first direct evidence about extraction
quality in eleven iterations, and it says the store's problem is upstream of retrieval, of position
and of quantity — all of which were swept, twice, without moving the number.

**And the third that is in the store does nothing.** The gate kept 294 of 1,256 rules (23%) and
removed 76% of the rules that would have been injected, which splits the arm by construction:

| Group | n | `full` | `full-verified` | Δ | gained / lost |
|---|---|---|---|---|---|
| pack emptied by the gate | 211 | 49.3% | 54.0% | **+4.7pp** | 18 / 8 |
| a demonstrated rule survived | 139 | 52.5% | 51.1% | −1.4pp | **0 / 2** |

The two halves reconcile exactly to the arm's 18/10 against `full`, and they say two different
things. **The entire harm lives in the questions whose rules could not reproduce their own
correction** — removing those rules is worth +4.7pp (sign test p = 0.076). **The rules that did
reproduce their own correction change nothing**: 1.11 demonstrated rules per question over 139
questions, zero questions gained, two lost.

That is the cleanest negative result this project has, because it is not a null about a treatment —
it is a null about the *content* of the treatment, measured on the subset where the content was
known to be good.

**Relevance is not what makes a rule followed.** `full-shuffled` — the same pack size, drawn from a
different question of the same database — costs −1.71pp, and against `full` it is +1.14pp
[−2.00, 4.29] p = 0.60 (18/14). Foreign-database rules are inert (−0.29pp, iteration 70); rules about
*this* database applied to the *wrong* question cost almost what the right ones cost. So the model is
not matching content to question. It is reading claims in the vocabulary of the workspace it is
answering about, and that register — not the retrieval — is what moves the answer. Every
relevance-based explanation in this project's record (the 77–82% entity hit rate, the relevance
split, the 2.6pp attributed to packs that name an answer entity) was reading a coincidence.

**What the probe cannot say, and it matters for the next run.** 552 of the 652 probed cases failed as
`rejected` — the first attempt ran and returned rows, and the only failure signal available is that
the person who asked said it was wrong. For those cases the probe's "with rules" prompt carries no
symptom, and `useless` then conflates *the rule is wrong* with *the rule had nothing to work from*.
Only 100 cases had a mechanical symptom (`empty` 96, `error` 4). The cross-tabulation of verdict by
failure kind is the measurement that separates those two, and it is not in this artefact — the next
run records it.

**Acceptance, against the table fixed before dispatch.**

| # | Criterion | Result |
|---|---|---|
| 1 | verdict on ≥ 80% of corrected questions | **met**: 651/652 = 99.8% |
| 2 | the four buckets reconcile to the rules | **met**: 1256/1256 (gate V13, blocking) |
| 3 | `supplied` reported with its blank rate | **met**: 22.9% against `blank_fix_rate` 12.75% |
| 4 | `full-verified` non-negative and above `full` | **partly**: −0.57pp is neutral not positive; +2.29pp over `full`, interval touching zero |
| 5 | `full-shuffled` reported with its donors | **met**: 350 donors, 18 identical packs |

**What it licenses.** The content axis is not closed by "memory does not work" — it is closed by
"the store contains mostly rules that cannot replay their own correction, and the ones that can do
not transfer". Those are different findings and only the second one says where to look next: a
demonstrated rule repairs its own case 149 times and other cases **unknown**, because no run has ever
asked one rule to repair a case other than its own. That is the last measurement on this axis that
can distinguish a store that is useless from a store that is too small, and it is R6.

**Evidence.** Run [`40791608028`](https://github.com/AgentiX-E/microglia/actions/runs/40791608028),
3,414 calls, 1 retry, 0 call failures, 350 scored, all eleven gates passing, `master` at `739fb72`;
1,293 tests, coverage **99.97 / 99.56 / 100 / 99.97**.

### 97 — The run that measured nothing, and the check that would have said so

Run [`40798494938`](https://github.com/AgentiX-E/microglia/actions/runs/40798494938) ended `failure`
after 47 minutes with no artefact. The cause was one line, 528 of 529 into the log:

```
[sota] fold 5/5 eval 100/350 calls=4197 retries=8 failed=0
[sota] failed: MG_E_BUDGET_EXCEEDED: call budget reached
```

Four folds completed for 3,657 calls; the fifth reached call 4,197 of a 4,200 ceiling at question
100 of 350. The lane exited non-zero, `publish` found no `poc-sota-bird.json`, and every subsequent
step failed on the artefact's absence — so the log's last three errors all describe the missing file
and none describes the cause. The ceiling was wrong by a factor of about 1.5 and nothing in the
pipeline could see it before paying for it.

**Measured cost per fold, from that run's own log.** The numbers the next dispatch has to be sized
from, and the reason a static prior would have been wrong:

| Fold | eval | probe | transfer | calls at fold end | calls this fold |
|---|---|---|---|---|---|
| 1/5 | 1,150 | 337 | 219 | 1,150 | 1,150 |
| 2/5 | 907 | 244 | 219 | 2,057 | 907 |
| 3/5 | 814 | 256 | 200 | 2,871 | 814 |
| 4/5 | 786 | 247 | 187 | 3,657 | 786 |
| 5/5 | ≥ 450 | — | — | **≥ 4,400** | — |

Five folds of this arm set measure out at roughly 4,700 calls, and the R6 arms add the probe (2
calls per probed question) and the transfer measurement (1 call per trial) on top. 4,200 was a guess
made before any five-fold run existed.

**The fix is a forecast, not a bigger number.** `forecastBudget` (packages/eval/src/call-budget.ts)
is a pure function over what the completed folds actually spent:

- it projects from the **dearest** fold, not the mean, because folds are not priced alike (1,150 in
  fold 1 against 786 in fold 4 — a 1.46x spread inside one run);
- it carries 10% headroom, because the retry rate moves inside a run (5 retries in fold 1, 8 in
  fold 5) and an optimistic projection is worse than none;
- it refuses only on evidence: with no completed fold there is nothing to extrapolate from, and the
  check passes rather than inventing a prior;
- the headroom is expressed in percent rather than as a multiplier, because `1150 * 3 * 1.1` is
  3795.0000000000005 in binary floating point and ceils to 3796 — a two-call error that would show
  up as an unexplained discrepancy in a run's own arithmetic.

It runs **between folds**, the one moment where a sample exists and the next fold has not yet spent
anything. On this run it would have fired after fold 1: 1,150 + ceil(1,150 × 4 × 110/100) = 6,210 >
4,200, short by 2,010 — five seconds in, instead of forty-seven minutes.

**A stopped run now leaves something behind.** `poc-sota-bird.partial.json` records the folds that
did complete, their per-fold cost, and the reason for the stop; the workflow uploads it as its own
artefact, named `sota-bird-partial` so it cannot be mistaken for evidence. The attribution step
reports the budget stop's own reason instead of `no artefact`, which is what turned a one-line cause
into a log dive.

**Default ceiling 4,000 → 8,000.** Not a safety margin, a measurement: 4,700 for five folds plus the
probe and transfer arms is what this configuration costs, and the old default was below the cost of
the run it was supposed to pay for.

**Why the cause took a log dive to find, stated plainly.** The previous dispatch's failure was
reported to this session as "conclusion failure, step unidentified", and the follow-up to read the
log did not happen — a tool call was blocked and the block was treated as the end of the question
rather than as something to retry. `gh api repos/.../actions/jobs/<id>/logs` returns the full log as
text on the first call, and it did so here. The failure was not visibility; it was not looking.

**Acceptance.**

| # | Criterion | Result |
|---|---|---|
| 1 | the projection refuses the 4,200 ceiling the run died on | **met**: 6,210 projected, 2,010 short |
| 2 | projection uses the dearest fold, not the mean | **met**: 5,495 against a mean-based 4,505 on a synthetic ledger |
| 3 | no fold completed ⇒ no refusal | **met**: passes, projection equals spend |
| 4 | a stopped run writes its completed folds | **met**: `poc-sota-bird.partial.json`, uploaded separately |
| 5 | the failure reason appears in the check annotation | **met**: the attribution step prints it |
| 6 | four-dimension coverage of the new module | **met**: 100 / 100 / 100 / 100 |

**Evidence.** `master` at `0e4cdc2` (local `9059d3e`); 1,321 tests, coverage **99.97 / 99.64 / 100
/ 99.97**; `pnpm check` green. R6 re-dispatched as run
[`40820868520`](https://github.com/AgentiX-E/microglia/actions/runs/40820868520) with the same arms
and `max_calls=8000`.

### 98 — The gap is the candidate pool, and we have been building selectors for a pool that is not there

The direction was wrong, and the correction is not about memory. It is about where test-time compute
was spent. A competitive reading (`COMPETITIVE.md`, new) produced three numbers that locate the error
precisely, and one of them is an accidental controlled comparison.

**Our baseline reproduces a competitor's published cell to 0.09pp.** XiYan-SQL, Table 6, BIRD dev,
DeepSeek with a DDL schema: **53.52%**. Ours, Mini-Dev, DeepSeek with DDL and evidence: **53.43%**.
Different code, different prompt, different harness — and the same number. That agreement is the
strongest evidence in this project that the protocol is sound: the measurement is not what is wrong.

**The candidate pool is four times narrower than the one a SOTA selector was trained on.**

| | Generators | Candidates | Ceiling over one draw | Best selector | Captured |
|---|---|---|---|---|---|
| CHASE-SQL (Gemini 1.5 Pro) | 3 different procedures | 21 | **+13.95pp** (68.84 → 82.79) | 73.01 | 29.9% |
| microglia | 1 prompt, 5 draws | 5 | **+3.52pp** | 52.29 | negative |

Every selection arm this project ran — agreement (−1.43), model (−2.43), execution (−1.14) — was
measured against a pool with 3.52pp of headroom in it. The ceiling was reported each time and read as
"the selector is bad". It is also a statement about the pool: five draws from one prompt are five
spellings of one misreading, and a selector cannot capture headroom the generator never produced.

**Three mechanisms we got backwards, all of them by using a component in the wrong position.**

| Mechanism | Our use | Measured | The competitors' use | Their measured |
|---|---|---|---|---|
| schema filtering | prune to one smaller schema | **−8.00pp** | sample several schemas, one per generator | +2.15 |
| value samples | annotate the DDL in a comment | +0.29pp | values inside the column, plus LSH retrieval as a candidate source | +1.63 (M-Schema on DeepSeek) |
| selection | ask a model to compare result sets | −1.14pp | group by execution result, reorder, then select | +2.74 (XiYan), +4.33 (GradeSQL ORM) |

The pattern is one pattern: **a lossy filter used to shrink an input is damage; the same filter used to
sample an output is diversity.** We ran all three as input shrinkers.

**What was built, in this order.**

`packages/eval/src/m-schema.ts` — the semi-structured schema rendering, 25 tests, 100% on all four
dimensions. XiYan's ablation prices it at +1.63 on this exact model (53.52 → 55.15), which makes it the
only available component whose value is already known before we spend a call on it. Two decisions
differ from the published form: the sample budget is enforced inside the renderer (600 columns × 3
values is more prompt than schema) and the foreign keys survive the budget, because a relation is
either stated or guessed.

`packages/eval/src/exec-signature.ts` — six deterministic signals over a candidate's execution
(`empty`, `row-shape`, `column-shape`, `null-share`, `duplicate-share`, `value-type`), 30 tests, 100%
on all four dimensions. Deliberately **not** a scorer: each signal computes alone and returns zero when
it has nothing to say, because a composite that fails cannot be blamed piece by piece — which is how
eleven iterations of composites ended. Three constraints are enforced in the module: no signal reads
the gold SQL or the gold rows, every signal is deterministic, and every signal abstains rather than
hedges.

`ROADMAP.md` R7 rewritten around the pool (R7.0 instrumentation → R7.1 heterogeneous candidates →
R7.2a signal measurement → R7.2b verifier → R7.3 memory as a feature), each step with acceptance fixed
before dispatch and an explicit refutation. R8 added: the paired-statistics protocol as a deliverable,
because no competitor publishes intervals, a noise floor, or a minimum detectable difference.

**Acceptance.**

| # | Criterion | Result |
|---|---|---|
| 1 | the competitive reading carries a source grade per claim | **met**: 13 claims graded, 2 marked low and un-reproduced |
| 2 | every quoted competitor number names its table or section | **met**: `COMPETITIVE.md` §6 |
| 3 | the decomposition is stated as not additive | **met**: 8.38pp of components against an 18pp gap, said in the text |
| 4 | M-Schema module at 100% on four dimensions | **met**: 100 / 100 / 100 / 100 |
| 5 | execution-signature module at 100% on four dimensions | **met**: 100 / 100 / 100 / 100 |
| 6 | no signal reads the answer | **met**: signatures take rows and columns only; R7.2a keeps the leak check as a gate |
| 7 | whole repository stays above the 95% gate | **met**: 99.95 / 99.58 / 100 / 99.95 |

**Evidence.** 1,376 tests, 87 files, coverage **99.95 / 99.58 / 100 / 99.95**; `pnpm check` green;
`microglia-docs` at this commit. R6 (transfer) is still running as run
[`40820868520`](https://github.com/AgentiX-E/microglia/actions/runs/40820868520) at the 8,000-call
ceiling sized in iteration 97; its rate decides whether R7.3 exists at all.

### 99 — A rule repairs its own case at +20.5pp and any other case at 0.0pp

R6 finished as run [`40820868520`](https://github.com/AgentiX-E/microglia/actions/runs/40820868520):
4,289 calls, 8 retries, no failures, five folds, gates green. It published

```
rule_transfer = { rules: 224, trials: 896, informative: 824, repaired: 29,
                  rate: 0.0352, blank_right: 68, broke: 29 }
```

and `0.0352` is not the number that decides the question. The conditional rate divides the 29
repairs by the 824 targets a bare retry could not fix, which **excludes by construction every trial
where the rule can do damage** — the 68 targets a retry had already fixed. On those, the rule broke
29. So the table the artefact already contained reads:

| | A bare retry fixed it | A bare retry did not | Row total |
|---|---|---|---|
| **The rule fixed it** | 39 (kept) | 29 (**repaired**) | 68 |
| **The rule did not** | 29 (**broke**) | 795 (unchanged) | 824 |
| Column total | 68 | 824 | **892 measured** |

Net marginal effect of showing a rule to a foreign question: **(29 − 29) / 892 = +0.00pp**. Not
"weak transfer" — a symmetric perturbation around zero, with 42.6% of the easy targets destroyed.

**The same 2×2 on the rule's own question**, from the probe in the same run:

| | Blank retry fixed it | Blank retry did not | Row total |
|---|---|---|---|
| **Rule fixed it** | 61 (redundant) | 144 (**supplied**) | 205 |
| **Rule did not** | 13 (**broke**) | 420 (useless) | 433 |
| Column total | 74 | 564 | **638 measured** |

Net marginal: **(144 − 13) / 638 = +20.53pp**.

> A rule distilled from a corrected case carries 20.5pp of information about that case and 0.00pp
> about any other. That is the definition of a demonstration, and it is now measured rather than
> argued.

This is the answer to the question the last four iterations were circling. The unit of memory is not
knowledge that failed to generalise; it is a *case record* whose content is the case. It applies
where it was born and nowhere else, and the cost of carrying it — attention spent on a rule that
does not apply — is paid on every call. That is why `full` has now measured −2.86pp and −1.71pp on
two independent dispatches while its own gate, `full-verified`, keeps the rules that demonstrably
work on their own case and gains nothing either: 0 of 2 in R5, 10 of 3 in R6, pooled +0.71pp over
700 questions at p = 0.42.

**What the verification gate is actually worth, pooled.** Both dispatches, paired:

| Comparison | R5 | R6 | Pooled (n = 700) | McNemar p |
|---|---|---|---|---|
| `full-verified − full` | +2.29pp (18/10) | +3.71pp (21/8) | **+3.00pp** | **0.0075** |
| `full-verified − none` | −0.57pp (5/7) | +2.00pp (10/3) | +0.71pp | 0.42 |
| `full − none` | −2.86pp (11/21) | −1.71pp (11/17) | **−2.29pp** | 0.052 |

Read top to bottom: the gate reliably removes the harm and reliably adds nothing. A mechanism that
takes a treatment from −2.29pp to +0.71pp is a good *filter* on a substrate with no signal in it.
That is a precise statement of what the store is worth in the prefix position, and it is the last
one the prefix position gets.

**The pre-registered criterion was not met, and the verdict does not rest on it.** R6 was written
with "rate < 3% ⇒ cancel R7.3". Measured rate: 3.52%. The threshold was crossed by 0.52pp, so the
literal criterion says "not refuted". The cancellation above rests instead on two facts the
pre-registration did not anticipate, both stated before the run was read:

- the statistic it named cannot express the question, because its denominator drops the break side;
- the break side is as large as the repair side (29 = 29), which is a result about the *content*
  of the rule, not about the sample.

Recording the miss rather than moving the goalposts: the criterion was mis-specified, and the
replacement (net marginal effect, gated) is the one that should have been written in R6.

**What was built.** Three things, in the order they had to exist.

`transferSummary` now returns the whole 2×2 — `measured`, `marginalRepair`, `marginalBreak`,
`netPp`, `breakRate` — beside the conditional `rate`, and a `verdict` that applies a 100-informative
floor *before* reading the sign, so eleven trials cannot become the word `no-transfer`.
**Gate V17** blocks a run whose `netPp` does not reconcile with `(repaired − broke) / measured`,
because a summary that can only improve is a summary that should not be printable.

`packages/eval/src/pool.ts` (22 tests, 100% on all four dimensions) is R7.0: the pool, described
from candidates a sampling pass already produced, at **zero call cost**.

| Quantity | What it answers | Why it decides the stage |
|---|---|---|
| `distinctMean` / `distinctHistogram` | how many *different* execution results five draws contained | five draws that collapse to one answer are one candidate with five spellings, and no selector can gain on them |
| `ceilingOnly` | questions where some draw was right and the first was not | the ceiling, minus the part that was already free |
| `uniqueCorrect` / `sharedCorrect` | whether the ceiling needs a choice or just agreement | agreement is what the majority selector already reads |
| `signalReadings` | each of the six signals priced alone | AUC against correctness with a question-clustered bootstrap, and top-pick accuracy beside the first-draw base rate |

The clustering is the methodological point. Five candidates from one question share the schema and
usually the misreading, so a flat bootstrap over candidates reports an interval about the square
root of the pool size too narrow — which is exactly the error that makes an inert signal look real.
Resampling questions instead is one line more code and the difference between a gate and a decoration.

The pool is written into every case of the artefact, so the next question about it is a computation
over a file. **V18** blocks a pool that describes fewer questions than the run answered; **V19**
blocks candidates that do not reconcile as signed or explicitly unsigned.

**The `m-schema` arm.** XiYan publishes the exact cell it tests — BIRD dev, DeepSeek, DDL 53.52
against M-Schema 55.15 — and our own baseline is 53.43 on that model, a 0.09pp agreement. So this is
not an analogy: it is a competitor's ablation, re-run on our harness, on the same split. The two
schema arms now differ in *placement* rather than in amount, which is the variable this project has
already measured twice (+0.29pp for a value comment above the DDL, −2.86pp for a rule pack above it).

**Acceptance.**

| # | Criterion | Result |
|---|---|---|
| 1 | the transfer summary reports the break side, not only the conditional rate | **met**: `measured`, `marginalRepair`, `marginalBreak`, `netPp`, `breakRate` |
| 2 | a rate without its net effect cannot pass | **met**: V17, blocking, reconciles `netPp` against the counts |
| 3 | a verdict is not drawn below the resolvability floor | **met**: `TransferVerdict` = `unmeasured` under 100 informative trials |
| 4 | the pool is described at zero call cost | **met**: `pool.ts` reads candidates the sampling pass produced |
| 5 | the signal intervals respect the question cluster | **met**: bootstrap resamples questions, not candidates |
| 6 | the pool is in the artefact, not only its summary | **met**: `per_case[].pool` carries every candidate and its shape |
| 7 | instrumentation cannot silently drop a question | **met**: V18 blocking, `questions === expected` |
| 8 | a competitor's published cell is reproduced on this harness | **met**: `m-schema` arm wired, dispatched as run `40862283263` |
| 9 | four-dimension coverage of every new module | **met**: `pool.ts` 100/100/100/100, `rule-probe.ts` 100/100/100/100 |
| 10 | the repository stays above the 95% gate | **met**: 99.96 / 99.59 / 100 / 99.96, 1,407 tests |

**Evidence.** `master` at `b95b9c4`; 88 test files, 1,407 tests, coverage **99.96 / 99.59 / 100 /
99.96**; `pnpm check` green including the bench and the bundle budget. R7.0 dispatched as run
[`40862283263`](https://github.com/AgentiX-E/microglia/actions/runs/40862283263) with
`none-replica, sample-5-first, sample-5-oracle, m-schema`, transfer measurement off, 8,000-call
ceiling.

**Addendum (same iteration).** Three more pieces landed after the entry above, all of them R7's own
instrumentation rather than a new treatment.

`packages/eval/src/pool-report.ts` (8 tests, 100% four dimensions) turns a recorded pool into the two
decisions R7 is ordered around — can this pool support a selection claim at all, and which signals may
rank anything — and refuses a third: the verdict is `wide`, `narrow`, or **`between`**, the last being
the statement that the measurement does not decide the question. The bars are the ones R7.1
pre-registered, expressed as a share of the draws taken so a three-draw run is not judged by a
six-draw rule. `pnpm eval:pool` prints it over `eval/results/poc-sota-bird.json`, and the workflow runs
it beside the attribution step: a run's own log now carries the pool's description, and every number in
this programme is supposed to be reproducible from the artefact.

`packages/eval/src/union.ts` (8 tests, 100% four dimensions) answers R7.1's ceiling from the artefact
without another dispatch: each arm already records per-question correctness, so the union over
generators is the score of a chooser that always picked right. It reports the ceiling net of the
control — a question the direct generator already answered is not headroom — how often the generators
disagreed, and names a generator that alone reaches the union. A pool of three where one procedure
answers everything the pool answers is one generator with two extra calls per question, and criterion 6
of R7.1 now reads `metrics.union.dominant` to say so.

Two generators were added as arms to make that measurable: `gen-plan` (name the columns, the grain and
the filters first) and `gen-decompose` (split into sub-questions, then compose). Both leave the
incumbent prompt byte-identical when unnamed, and a regression test asserts it — every published number
was produced by that exact string, so a generator that changed it by default would move the baseline
under the whole record. Both require their reasoning outside any fence, because `extractSql` takes the
first fenced block and a plan inside one would be scored as a paragraph of SQL.

**Evidence.** 1,427 tests, 90 files, coverage **99.96 / 99.57 / 100 / 99.96**; `pnpm check` green.
Commits: `205408d` (pool report and `eval:pool`), `9ca2d16` (README), `73a76b0` (generators and union
ceiling); `master` at `b60dd48`.

### 100 — The gate that decides whether a signal may rank anything

Eleven iteration closures in this log end the same way: a selector arm at or below zero, a ceiling
somewhere above it, and a sentence explaining that the selector did not capture the ceiling. Every one
of them shipped the composite first and measured the composite. Not one of them could say which of its
parts separated a right answer from a wrong one, because nothing was ever measured alone.

Iteration 99 made each of the six execution signals computable and priced them one at a time on the
recorded pool. This iteration adds the decision that follows: **which of them, if any, may rank
anything**, with the bar fixed before the measurement it will be judged by, and the composite scored on
a pool that already exists rather than on a new dispatch.

**The rule, and why each part of it is not negotiable.**

| Element | Rule | The failure it prevents |
|---|---|---|
| Effect bar | `AUC - 0.5 > 2 SE` | a point estimate of 0.56 with an interval that straddles one half |
| Family correction | Holm across the six | six tests at two standard errors produce one false inclusion at 20% under the null |
| Standard error | question-clustered, floored at `sqrt(0.25 / min(n1, n2))` | a degenerate bootstrap reporting zero variance as certainty |
| Direction | a signal below one half is dropped, not flipped | fitting the direction to the same pool it is tested on |
| Combination | one vote per surviving signal; ties to the earlier draw | summing magnitudes that are placeholders into something called a score |
| Baseline | the composite with no signals, by construction | a second implementation of "take the first draw" that can disagree with the first |

The floor is the part that needed the most care, and it is worth stating as arithmetic. `signalReading`
resamples **questions**, not candidates, because five candidates from one question share the question,
the schema and usually the misreading. That clustering is right and it has a consequence: a pool where
every candidate pair is concordant returns the same AUC on every resample, so the bootstrap reports a
variance of exactly zero. Zero variance is not certainty — it is the resampling saying it cannot see
inside a question. The floor is the largest standard error an AUC over that many pairs could have, the
variance of a proportion at its maximum over the smaller group:

| Candidates per side | Floored SE | z at AUC = 1.0 | Verdict at the bar |
|---|---|---|---|
| 4 | 0.2500 | 2.00 | fails: not above 2 |
| 12 | 0.1443 | 3.46 | passes |
| 20 | 0.1118 | 4.47 | passes |
| 40 | 0.0791 | 6.32 | passes |

Without the floor, a twelve-candidate pool of unanimous comparisons would report an infinite z and the
gate would wave through a signal measured on a pool too small to say anything.

**Correction, recorded rather than edited away.** The commit message for `889ba17` states that twelve
unanimous candidates report `z = 4.08`. That is a miscomputation: `0.5 / sqrt(0.25 / 12) = 3.46`, and
3.46 is what the code returns. The claim the sentence was making — that the floor replaces an infinity
with a finite and modest number — is unaffected, and the wrong figure stays visible here rather than
being rewritten out of a pushed commit.

**The leak check is a test, not a sentence.** The doctrine says a verifier never reads the answer, and
every previous composite in this programme said so in a comment. `signal-gate.test.ts` replaces each
candidate's `correct` field with a getter that throws, then calls `compositePicks` and asserts the picks
are unchanged. A scorer that peeks cannot pass it: the test does not check a claim about the code, it
makes the labelled field unreadable and requires the code to work anyway.

**What the composite reports.** Accuracy beside the first-draw baseline on the same population —
questions where more than one outcome existed — and, beside the delta, the questions it fixed and the
questions it broke. That last pair is the lesson of iteration 99 applied one module early: a net of zero
made of one repair and one break is a different object from a net of zero made of neither, and the
transfer measurement would have reported `+0.00pp` for a rule that destroyed 42.6% of what it touched
if the 2×2 table had not been printed beside it.

**Two things were read by two functions and now are read by one.**

- `artifact-pool.ts` is the only reader of `per_case[].pool`. The command added in iteration 99 carried
  a private copy of the question-shape regular expressions — a second definition of what a question
  asks for, which would have drifted from the first the next time either changed. Its 10 tests pin the
  reading: null and empty pools are both skipped (but for different reasons), the draw count comes from
  the arm names so dropped calls count against the collapse statistic, and the shape is recomputed so a
  past artefact is re-analysable with a better reader.
- `FAILED_SIGNATURE` is exported from `exec-signature.ts`. Three places ask what shape a failure has:
  the signature computation, the signal reading's tie-break and the composite's vote.

**Evidence.** 92 test files, **1,475 tests**, coverage **99.98 / 99.62 / 100 / 99.98**; the four
modules this stage added report 100 on all four dimensions individually (`pool.ts`, `pool-report.ts`,
`signal-gate.ts`, `artifact-pool.ts`). `pnpm check` green including the bench and the bundle budget.
Commits: `889ba17`; `master` at `889ba17`. `pnpm eval:signals` is wired as a workflow step beside
`pnpm eval:pool`, and exits zero when nothing survives, because "no signal separates right answers from
wrong ones" is a finding and not a broken step.

**What this iteration does not have, and will not pretend to.** No gate verdict. Run
[`40862283263`](https://github.com/AgentiX-E/microglia/actions/runs/40862283263) is still in its
benchmark step, and R7.2a's reading arrives with the artefact. The gate is built, pre-registered and
wired; the numbers it will print are not in this document yet. R7.2b remains where iteration 99 left
it: activated only if something survives, cancelled without appeal if nothing does.

**Addendum (same iteration).** One more piece of R7.1's instrumentation landed after the entry above,
and it is the piece that makes the ceiling interpretable.

The union answers "what would a chooser have scored", and nothing answered "was there anything to
choose from". Those are different questions and the second decides the first: a ceiling computed over
four arms that all execute to the same rows is a **ceiling of agreement** — the number a selector would
have to capture is however large it looks, and there is nothing in the pool to rank. Iteration 99 could
only describe the sampling pool, five draws from one prompt; the generator pool had no description at
all because no field recorded what the arms produced.

`per_case[].arm_keys` now records the canonical identity of each arm's result, control included. The
key is the joined `canonicalRows` output, which already sorts rows and orders columns, so two statements
that reach the same answer share one key and a failed statement has none. It costs nothing: `judgeReply`
executed the statement to score it, and the identity is a function of rows it already had.

`unionCeiling` counts distinct keys per question and reports mean, median, median-as-share-of-arms, a
histogram and a verdict. The verdict is the same rule as R7.0's, and it is now one function —
`verdictOf`, exported from `pool-report.ts` — rather than two copies of `0.5` and `1/3` that could call
identical evidence wide in one pool and narrow in the other. An unmeasured pool reports `between`,
never `narrow`: a file written before this field existed must not be read as "we looked and it
collapsed", which is the error the whole stage exists to stop.

R7.1's criterion 3 therefore moved. It used to read `metrics.pool.distinctMean` — the sampling pool's
collapse — under a sentence asking about the generator pool. It now reads
`metrics.union.distinct.verdict`, with `narrow` as the refutation. No reading of either exists yet, so
this is a criterion being made to say what it always meant rather than a bar being moved after a number
was seen.

**Evidence.** 1,484 tests, 92 files, coverage **99.98 / 99.62 / 100 / 99.98**; `union.ts` 100 on all
four dimensions. Commit `cdf849d`; `master` at `61c104a`.

### 101 — What the store is, added up over every run that scored it

Iteration 99 measured what a rule does when it is moved to a foreign question. This one measures what
the store *is*, and the two agree while answering different questions. The attribution artefacts
classify every rule that reached a prompt by the sign of its net effect; nothing had ever added them up.

`packages/eval/src/store-report.ts` (10 tests, 100% four dimensions) and `pnpm eval:store` do, over the
results directory including the archive: eight runs, 2026-10-23 to 10-26.

| Quantity | Count | Share |
|---|---|---|
| Rules the distiller kept | 9,062 | — |
| Rules that reached a prompt at least once | 2,817 | **31.1%** of the store |
| … net-repaired more than they broke | 110 | 3.90% of injected rules |
| … net-broke more than they repaired | 229 | 8.13% of injected rules |
| … flips cancelled exactly | 2,478 | **87.97%** of injected rules |
| Net | **−119 rules** | exact sign test p = 9.5e-11 |

Two findings carry the stage forward. **88% of what reaches a prompt changes nothing**, and that is not
free: the tokens are paid on every call, and section 3.5 of the whitepaper measured what the payment
buys. **Of the 12% that do move, twice as many move it the wrong way.** And a third, untouched:
retrieval. Only 31% of stored rules ever reach a prompt, and nothing here can say whether the third the
injector chose was the right third — that needs a rule-level counterfactual this project has not run.

Read beside §3.6.1 this is one story: a rule carries its own case, the store is mostly rules that carry
nothing else, and the majority of them are inert text paid for in context on every call. The negative
effect was never mysterious; it was the price of showing nine parts noise for the chance of one part
signal that is itself twice as likely to be wrong as right.

**A unit error, found and corrected in the same iteration.** The first version of this report read the
artefact's `helpful` / `harmful` / `neutral` as counts of injection *instances* and published "3.90% of
injected instances repaired the answer". They are counts of **rules**: they sum to `injectedRules`
exactly, which is what a rule-level classification looks like and what one line against a real artefact
shows. The digits did not move; the claim they support shrank by an order of magnitude. Corrected in
`aba31f0`, where every field is now named for its unit (`helpfulRules`, `injectedRules`), the command
prints "rules" where it printed "instances", and a test asserts the field names so the instance claim
cannot be read back out. The sign test is restated in unit too: it is an exact binomial over rules, not
McNemar over paired instances. The erroneous commit stays pushed and this paragraph stays beside the
corrected table, because a log that edits its own mistakes is a log nobody can check.

**What the corrected numbers still say.** The direction and the size of the ratio are unaffected: 110
net-helpful rules against 229 net-harmful, in the same direction in seven of eight runs. The eighth is
the S2b value-oracle pack, which broke nothing in 233 injections — the smallest run here, and a zero in
eight repairs is consistent with a break rate as high as 1.3% per injection, so it is a lead rather
than a result.

**What it does not say.** These artefacts predate the R6 gate, so they describe the store the gate was
applied to, not the current implementation.

**Evidence.** 1,494 tests, 93 files, coverage **99.98 / 99.62 / 100 / 99.98**; `store-report.ts` 100 on
all four dimensions. Commits `e8110f4` (the report), `aba31f0` (the unit fix); `master` at `d46cc45`.

### 102 — R7.0 and R7.2a: the pool is one answer with five spellings, and shape still picks well inside it

Run [`40862283263`](https://github.com/AgentiX-E/microglia/actions/runs/40862283263) finished green:
350 questions, 5 folds, 3,507 calls, 3 retries, 0 failed calls, every gate passing. Arms
`none, full, none-replica, sample-5-first, sample-5-oracle, m-schema`, transfer measurement off. It is
the first run in this programme that records the candidate pool.

**R7.0 — the pool is narrow, on the bar that was fixed before the run.**

| Reading | Value |
|---|---|
| Distinct answers per question | mean **1.43**, median **1** (0.20 of the five draws) |
| Histogram | 235 questions at one answer, 85 at two, 23 at three, 7 at four |
| Oracle over five draws | 209 of 350 |
| First draw correct | 184 |
| Ceiling worth having | **25 questions = 7.14pp** |
| Decomposition | 14 unique-correct, **195 shared-correct**, 141 none |
| Verdict (`median/draws` against 0.50 wide, 0.33 narrow) | **NARROW** |

Five draws from one prompt collapse to 1.43 different answers. 195 of the 209 questions the oracle
reaches are questions where at least two draws were already right: the draws agree, and the ceiling is
a ceiling of agreement rather than a choice. This is the pre-registered refutation condition of R7.1's
criterion 3, read on the incumbent pool, and it says the headroom is not in the selector for the
questions that collapse.

It also prices the whole of R2 to date: every selection arm this project ran was choosing among 1.43
answers, which is why eleven of them landed at zero.

**R7.2a — five of six signals survive their own gate, and the composite beats the first draw.**

| Signal | AUC | SE | z | Holm | Verdict |
|---|---|---|---|---|---|
| `value-type` | 0.608 | 0.017 | 6.25 | <0.001 | **kept** |
| `column-shape` | 0.579 | 0.017 | 4.57 | <0.001 | **kept** |
| `empty` | 0.572 | 0.017 | 4.17 | <0.001 | **kept** |
| `row-shape` | 0.563 | 0.019 | 3.38 | 0.0011 | **kept** |
| `duplicate-share` | 0.542 | 0.017 | 2.46 | 0.0137 | **kept** |
| `null-share` | 0.521 | 0.017 | 1.23 | 0.109 | removed |

*The AUC column above is the **reconstruction's**, not the run's: the artefact did not record the
evidence, so the shapes were rebuilt from the question alone. The run's own numbers are `value-type`
0.6015, `column-shape` 0.5998, `row-shape` 0.5749, `empty` 0.5653, `duplicate-share` 0.5418,
`null-share` 0.5213 — see iteration 106. Same five kept, same one removed; the digits moved.*

Composite of the five, on the 122 questions where a choice existed:

| | Value |
|---|---|
| Composite top-pick | 49 of 122 = **40.2%** |
| First draw | 40 of 122 = 32.8% |
| Delta on the eligible questions | **+7.38pp** |
| Gained / lost | **11 / 2**, exact McNemar p = **0.0225** |
| Delta over the whole run | **+2.57pp** |
| Yield against the 25-question ceiling | 11/25 = **0.44** |

This is the first positive selection number in the project's history, and it is the one the doctrine
predicted: not a model comparing result sets (measured at −1.14pp in R2) but a deterministic comparison
of an execution's shape against the shape the question asks for. The gate that licenses it was written
before the run existed — `signal-gate.ts` was committed at `889ba17`, at a time when no artefact carried
a pool — and the composite rule (one vote per signal, ties to the earlier draw) was fixed in the same
commit.

**The arm table from the same run**, which prices the pool against the arms that existed:

| Arm | Execution accuracy | Δ vs `none` | 95% CI | p |
|---|---|---|---|---|
| `none` (control) | 54.00% | — | — | — |
| `none-replica` | 54.29% | +0.29pp | [−0.86, +1.71] | 1.00 |
| `full` (memory prefix) | 51.43% | −2.57pp | [−5.43, +0.29] | 0.108 |
| `sample-5-first` | 52.57% | −1.43pp | [−4.00, +1.14] | 0.383 |
| `sample-5-oracle` | 59.71% | +5.71pp | [+3.43, +8.29] | <0.001 |
| `m-schema` | 52.29% | −1.71pp | [−5.14, +1.71] | 0.418 |

Two things in that table matter beyond R7.

`none-replica` moves +0.29pp, so the noise floor here is ±1.7pp and R7.0's criterion 4 is met: the
instrumentation changed no behaviour.

`m-schema` **does not replicate.** XiYan-SQL publishes +1.63pp for M-Schema against a DDL prompt on this
model (DeepSeek) and this dataset (BIRD), and this harness measures **−1.71pp** with an interval that
contains zero. R7.1's criterion 4 asked for the reading and did not condition on its sign; the reading is
negative. Either the schema rendering differs in a way that matters (their collect/render pipeline is
their own), or the +1.63 cell does not transfer across harnesses. Recorded as a failed replication
rather than as a null result: the number was published, this is a measurement of it, and they disagree.

Note also that `sample-5-oracle` at +5.71pp against `none` is not the ceiling R7.0 reports: the ceiling
is measured against `sample-5-first` (184 of 350 = 52.57%), and 209 − 184 = 25 questions = 7.14pp. The
oracle arm and the pool agree exactly once the baseline is the right one.

**What this does not yet establish, stated before the next dispatch.**

1. **It is a simulation, not an arm.** The composite was applied to the pool the sampling arm recorded;
   it has not been scored as a strategy inside a cross-fitted run, so it has no CI of its own and it is
   not yet comparable to `full` or to any published number. Turning it into an arm is the next commit.
2. **The population is 122 of 350 questions.** The other 228 offered no choice at all. +7.38pp inside
   those 122 is +2.57pp over the run, which is the number that would sit in a results table.
3. **`value-type` alone may carry most of it.** Its top-pick accuracy is 39.3% against the composite's
   40.2%; the vote adds 0.9pp over the best single signal. A composite is worth its complexity only if
   that gap survives cross-fitting, and the leave-one-out reading belongs with the arm result.
4. **Shape-matching could be a question-type prior rather than a verifier.** "Asks for an average, gets
   a number" is a statement about the question as much as about the answer. If the gain lives in that
   correlation, it will not survive a pool of genuinely different procedures — which is what R7.1 is
   for, and why the two are being run together next.

**Next dispatch, pre-registered here.** Arms
`none-replica, sample-5-first, sample-5-shape, gen-plan, gen-decompose, m-schema`: the composite as a
real arm (`sample-5-shape`), the generator pool from R7.1, and the replicates that keep both honest.
Eleven calls per question, 3,850 expected, ceiling 7,000. The signal set the arm votes with is fixed
now — the five that survived this gate — so that the arm does not select its own features on the data
it is scored on.

**Evidence.** `eval/results` from run `40862283263` (artefact `sota-bird`, 2.5 MB); `pnpm eval:pool`
and `pnpm eval:signals` reproduce every number above from that file.

### 103 — The composite becomes an arm, and the thing it could not do is written down as a test

Iteration 102 left the composite priced but unscoreable: +7.38pp computed by applying it to a pool
another run had recorded. A simulation has no interval, is judged by no arm's judge, and sits in no
results table. `sample-5-shape` is that composite as a strategy inside the cross-fitted run — the same
signals, the same draws, the same multiset judge, against `sample-5-first` rather than against `none`.

**It costs nothing.** Every draw is executed anyway to compute agreement, and the five signals are pure
functions of a signature. The arm adds a decision, not a call.

**One rule, two presentations.** The choice is delegated to `bestIndex`, which `compositePicks` now also
uses, so the arm a run scores and the object the simulation priced cannot become two definitions of "the
composite". A second copy of the ranking would have been a second answer to the same question, and this
project has already paid for that mistake once: iteration 100's `shortlist` field decided the same thing
the gate decided and was deleted rather than reconciled.

**A dead branch caught before it shipped.** The first draft reported `votes` as the number of signals
that *endorsed* the winner — `Math.sign(score) > 0`. That branch can never be taken: `scoreOf` returns
only zero and negative numbers, because no signal in the module is permitted to prefer a shape, only to
reject one. Left in, every pick would have been reported as `no-agreement`, the reporting would have
been uniformly wrong, and the branch would have been unreachable for the coverage gate to find later.
`votes` is now the number of candidates the winner outscored, which is zero exactly when the composite
had nothing to say.

**What that asymmetry means, stated as a test rather than as a caveat.** A question that asks for what is
*absent* only stops the composite objecting to an empty result; it does not make the empty result
attractive, and on a level field the tie-break keeps the first draw. `selectByShape` therefore cannot
prefer emptiness, and `signal-gate.test.ts` says so in a test named for it. That is the composite's
ceiling in one line: it can refuse a wrong answer it recognises and cannot find a right one it does not.

**Dispatched.** Run [`40880218444`](https://github.com/AgentiX-E/microglia/actions/runs/40880218444) at
`ad37855`, arms exactly as pre-registered in iteration 102 — `none, full, none-replica, sample-5-first,
sample-5-shape, gen-plan, gen-decompose, m-schema` — eleven calls per question, ceiling 7,000. The signal
set is the five that cleared their own gate, fixed in `SHAPE_VOTERS` before the run existed, so the arm
does not select its features on the data it is scored on.

**Evidence.** 1,504 tests, 93 files, coverage **99.98 / 99.62 / 100 / 99.98**; `signal-gate.ts` 100 on
all four. Commit `7d7dd87`.

### 104 — The composite is its best member with four redundancies attached

R7.2b's criterion 3 asks for each signal ablated one at a time. `readSubsets` answers it from the
recorded pool: any subset of signals, every row against the same first draw, so the rows are comparable
to each other and to the composite's own number. No dispatch; arithmetic over run `40862283263`.

On the 122 questions where a draw choice existed:

| Subset | Top-pick | Δ vs first draw | Gained / lost |
|---|---|---|---|
| all five | 49/122 = 40.2% | **+7.38pp** | +11 / −2 |
| without `row-shape` | 50/122 = **41.0%** | **+8.20pp** | +11 / −1 |
| without `empty` | 49/122 = 40.2% | +7.38pp | +11 / −2 |
| without `column-shape` | 49/122 = 40.2% | +7.38pp | +11 / −2 |
| without `duplicate-share` | 47/122 = 38.5% | +5.74pp | +8 / −1 |
| without `value-type` | 45/122 = 36.9% | +4.10pp | +8 / −3 |
| only `value-type` | 48/122 = 39.3% | **+6.56pp** | +8 / −0 |
| only `empty` | 45/122 = 36.9% | +4.10pp | +5 / −0 |
| only `column-shape` | 45/122 = 36.9% | +4.10pp | +5 / −0 |
| only `duplicate-share` | 43/122 = 35.2% | +2.46pp | +4 / −1 |
| only `row-shape` | 42/122 = 34.4% | +1.64pp | +4 / −2 |

**The composite is not measurably better than one of its members.** `value-type` alone takes 39.3% of
the 40.2% the five take, and never breaks a question the first draw had right. The other four add one
question between them and `row-shape` costs one. On 122 questions a difference of one or two is inside
the binomial spread — the standard error on a proportion near 0.4 at this size is 4.4pp — so the reading
does not separate "the four add a little" from "the four add nothing".

Iteration 102 predicted this before the ablation existed: *"`value-type` alone may carry most of it. Its
top-pick accuracy is 39.3% against the composite's 40.2%"*. The prediction was exact, which is the only
reason the row is worth reading twice: it was written from the composite's own number, not from a
subset measurement.

**Why the six AUCs sat so close together.** `scoreOf` penalises an empty result on *every* signal, not
only on the one named `empty`. So four of the five voters share a floor that fires on the same
candidates, and their AUCs are four readings of one opinion about shape plus `value-type`'s independent
reading of the unit. The module's comment called the floor a tie-breaker on failure; the ablation shows
it is also the largest single component of three other signals. A signal set is not as many opinions as
it has members.

**What this does not license.** Refitting the arm to four signals, or to `value-type` alone, before the
run finishes. Those subsets were chosen by looking at the pool the arm is scored on, and an arm refitted
that way reports the fit. Run `40880218444` keeps the pre-registered set. The ablation's job is to say
which comparison the *next* run should make, and it says one clearly: the set against its best member,
on identical draws, cross-fitted. Both selectors read the same five draws, so that run costs nothing
extra — which makes "is the composite worth its complexity" a measured question rather than an argument.

**Evidence.** `pnpm eval:signals` on the artefact from run `40862283263` reproduces every row above;
`readSubsets` is exercised in `signal-gate.test.ts` (48 tests, 100 on all four dimensions). Commit
`3a3761f`. Total suite 1,509 tests, 93 files, coverage **99.98 / 99.62 / 100 / 99.98**.

### 105 — The ablation becomes an arm, so its answer stops being in sample

Iteration 104 could name the comparison but not settle it: `value-type` alone reaching 39.3% of the
composite's 40.2% was read off the same pool the composite is scored on, so a run refitted to that
reading would report the fit. `sample-5-value` is the comparison as an arm — one voter, the same five
draws, the same judge, cross-fitted.

`selectByShape` now takes its signal set as a parameter with the licensed five as the default, so the
two arms are one function applied to two sets rather than two implementations of one idea. `VALUE_VOTERS`
sits beside `SHAPE_VOTERS` for the same reason `SHAPE_VOTERS` exists: a signal set a public selector may
vote with, fixed once and named, so that no lane can invent a third.

**The arm is free.** Both selectors read the executions the sampling pass has already paid for. That is
the whole reason this comparison is worth making now rather than after a bigger run: "is the composite
worth four extra signals" is answerable at zero marginal cost, and it is the question that decides
whether this verifier stays a composite at all.

A test states the difference the two sets make, on one pool: a list question answered with a single
number is `row-shape`'s objection and nobody else's, so the five-voter set moves off the first draw and
the one-voter set cannot. Without that test the two arms would be two names for a function that happens
to be called with different arguments, which is how a comparison silently becomes an identity.

**Evidence.** 1,510 tests, 93 files, coverage **99.98 / 99.62 / 100 / 99.98**; `signal-gate.ts` 48 → 49
tests, 100 on all four dimensions. Commit `da5a303`.

### 106 — The artefact did not record the evidence, so the gate was read against a different question

Found while checking whether a database-conditioned prior over execution signatures was worth an
iteration. The check failed for an unrelated reason and the reason is worse than the thing it was
checking.

**The defect.** `shapeOf(question, evidence)` reads the question *and* the evidence, because BIRD's
evidence carries half the intent — the module says so in its own comment, and `poolFromArtifact` says it
recomputes "the shape from the question and its evidence". The artefact that carries the pool recorded
`question` and did not record `evidence`. Every re-analysis therefore rebuilt each shape against an empty
string, and `entry.evidence ?? ''` hid the omission: no error, no warning, a full set of numbers.

**The size of it.** Same file, same equations, two reads:

| Signal | Run computed | `pnpm eval:signals` reports |
|---|---|---|
| `value-type` | 0.6015 | 0.6077 |
| `column-shape` | **0.5998** | 0.5788 |
| `row-shape` | **0.5749** | 0.5626 |
| `empty` | **0.5653** | 0.5719 |
| `duplicate-share` | 0.5418 | 0.5425 |
| `null-share` | 0.5213 | 0.5213 |

Three of six move by more than half a percentage point and one moves the wrong way. The gate's
verdicts survive — all six AUCs sit above 0.5 under both reads, `null-share` is lowest under both, and
the five that were kept were kept on the run's own numbers when the run ran — but the digits in
iterations 102, 104 and 105 are the reconstruction's digits, and the reconstruction is of a selector
that never ran.

**What that costs the argument.** The composite's +7.38pp and the whole ablation table in iteration 104
were computed from the evidence-less shapes. The arm dispatched as `sample-5-shape` reads the real
evidence. So the simulation and the arm were not the same selector, which is exactly the property
iteration 103 claimed to have established by sharing `bestIndex`. Sharing the ranking rule is not
sharing the input.

**The fix, and why it is a type.** `evidence` is now a required field of `CaseOutcome`. The writer
cannot omit it and the compiler will not let a new writer forget it — the type is the guard, and a test
prices the difference on one question so a reader can see what the guard is for. That is the second
time in this log that a required field has done the work a convention could not: the arm table is a
`Record` over the union for the same reason.

**What is not fixed.** Run `40880218444` was dispatched before the field existed and will produce an
artefact that is un-re-readable in this respect. Its own embedded signal readings and its own arm
table are the authoritative record of what it measured; the commands reproduce something else. That
inversion — the artefact more trustworthy than the re-analysis — lasts exactly until the next dispatch.

**The thing that was being checked, recorded so it is not lost.** A prior keyed on `(database,
execution signature)` and built leave-one-fold-out ranks candidates at AUC **0.636** over the 176
within-question pairs the coarse signature can tell apart, which is above every one of the six shape
signals. It is not yet a result: the key is the coarse shape, and 1,750 candidates collapse to 124
distinct shapes across 11 databases, so what the prior has learned is the frequency of a shape on a
database, not the memory of a case. The memory-shaped version of it needs a digest of the result rows
per draw, which the pool does not record either. Both fields are now on the list, and the prior is not
an arm until they exist.

**Evidence.** `eval:signals` and the artefact's `metrics.pool.signals` disagree as tabulated above;
the discrepancy is reproducible from `/tmp/run-40862283263/poc-sota-bird.json`. Commit `8ee3b1e`.
1,511 tests, 93 files, coverage **99.98 / 99.62 / 100 / 99.98**.

**A second inconsistency, pre-registered rather than fixed.** Checking the above turned up a defect in
the metric itself. `signalReading` counts `pairs` as the sum of within-question products
(`up × down` per question, 300 here) and then computes AUC over the **flattened** positives and
negatives, which adds every cross-question comparison as well. A ranking signal is only ever asked to
order candidates *inside one question*; a positive from question A against a negative from question B is
not a decision the composite makes, and those pairs are mostly ties, so pooling dilutes every reading
toward 0.5.

Within-question, on the same artefact and the same evidence-less shapes: `value-type` 0.6133,
`empty` 0.5767, `column-shape` 0.5767, `row-shape` 0.5683, `duplicate-share` 0.5583, `null-share`
0.5467 — higher for five of six, and `null-share` crosses from 0.5213 to 0.5467.

Not fixed in this commit, for one reason: the run in flight is measuring the pooled version, and
changing the metric now would make its artefact incomparable with the next one. The order is to read
that run, then change the estimator and the two artefacts together, so the size of the correction is a
measured quantity rather than a claim in a commit message. Pre-registered here so the change is
justified before it is made.

### 107 — The composite as an arm: +1.14pp, inside the noise floor, and the generators made it worse

Run [`40880218444`](https://github.com/AgentiX-E/microglia/actions/runs/40880218444) finished green:
350 questions, 5 folds, seed 7, arms `none, full, none-replica, sample-5-first, sample-5-shape,
gen-plan, gen-decompose, m-schema`, 10,000 resamples, every gate passing. This is the first run in the
programme where the shape composite selected *inside* the cross-fitted loop, and the first that ran two
generators against one prompt on the same questions.

**Every arm, paired against `none`.**

| Arm | Accuracy | Δ vs `none` | 95% CI | p | +/− |
|---|---|---|---|---|---|
| `none` | 54.57% | — | — | — | — |
| `sample-5-shape` | **54.57%** | **+0.00pp** | [−2.57, +2.57] | 1.000 | +11 / −11 |
| `m-schema` | 54.57% | +0.00pp | [−3.43, +3.43] | 1.000 | +20 / −20 |
| `none-replica` | 54.29% | −0.29pp | [−1.43, +0.86] | 1.000 | +2 / −3 |
| `sample-5-first` | 53.43% | −1.14pp | [−3.43, +1.14] | 0.481 | +7 / −11 |
| `full` (memory prefix) | 51.43% | −3.14pp | [−6.29, −0.29] | 0.071 | +10 / −21 |
| `gen-decompose` | 51.43% | −3.14pp | [−6.29, +0.00] | 0.071 | +10 / −21 |
| `gen-plan` | **49.14%** | **−5.43pp** | [−9.14, −2.00] | **0.004** | +11 / −30 |

**The comparison the arm exists for.** `sample-5-shape` against `sample-5-first`, on identical draws:

| | Value |
|---|---|
| Shape composite | 54.57% |
| First draw | 53.43% |
| Delta | **+1.14pp**, 95% CI **[−0.57, +2.86]**, exact McNemar p = **0.344** |
| Gained / lost | **7 / 3** |
| By fold | +0, +0, +2, +1, +1 — never negative, never significant |
| Noise floor this run (`none-replica`) | **±1.4pp** |

The point estimate is a quarter of the interval it sits in, and smaller than what an identical prompt
moves when it is run twice. That is the answer to the question iteration 102's +7.38pp raised: the
composite is not a discovery, it is a small effect that this protocol cannot resolve.

**The simulation and the arm now agree, which is how the defect was found.** The run's own gate block
computes the composite on its own pool with its own shapes: 30.77% against 27.35% on the 117
choice-bearing questions, **+3.42pp**, 7 gained / 3 lost. And 3.42pp × 117/350 = **1.14pp** — the arm's
delta, exactly. Sharing `bestIndex` between the simulation and the arm did what iteration 103 claimed.
The +7.38pp of iteration 102 was not that number and could not have been: it was computed with the
question's shape read from the question alone, because the artefact had no evidence field.

So the honest sequence is:

| Reading | Value | What it was |
|---|---|---|
| Iteration 102 | +7.38pp | the composite, fed a shape read without the evidence |
| Iteration 104's ablation | +7.38pp family | same defect, so every row inherited it |
| This run's gate block | **+3.42pp** | the composite the arm runs, in sample on 117 questions |
| This run's arm | **+1.14pp [−0.57, +2.86]** | the same thing, cross-fitted, over the run |

**R7.1 is refuted, and not by a small margin.** Two generators against the one prompt, same questions,
same judge:

| Reading | Value | Bar |
|---|---|---|
| Union of four arms over `none` | 221 vs 191 = **+8.57pp** | ceiling ≥ +2pp ✓ |
| Disagreement share | **0.229** | ≥ 0.40 ✗ |
| Dominant arm | none | must be null ✓ |
| Distinct answers across four procedures | mean **1.557**, median 1, share 0.25 | not `narrow` ✗ |
| Individual arms | `gen-plan` −5.43pp, `gen-decompose` −3.14pp, `m-schema` ±0.00pp | must not lose ✗ |

The ceiling is there (+8.57pp) and unreachable, because the four procedures collapse to 1.56 distinct
answers — barely wider than the 1.46 that five draws of one prompt produced. Heterogeneity did not widen
the pool; it produced *worse* candidates that mostly repeated what the direct prompt already said.
CHASE-SQL's +13.95pp comes from three procedures that answered differently; ours do not.

**R7.2b's criterion 1 is not met.** Yield = captured / ceiling = 4 net questions / 25 = **0.16** against
a bar of 0.33. Criterion 2 is met trivially (it beats −1.14 and −1.43). Criterion 3 is the ablation of
iteration 104, which stands as a description but inherits the shape defect. The rung above this — a
learned scorer — is licensed only if the deterministic one leaves more than half the ceiling *and* R7.1
produced a pool wide enough to train on. The first condition is false twice over and the second is
false outright, so **the learned rung is not licensed and R7.2b ends here.**

**What that closes, stated plainly.** The selection axis has now been measured end to end on this
harness: agreement (+0.00pp), a model reading SQL (−1.14pp), a model reading results, a deterministic
shape composite (+1.14pp, CI spanning zero), and a heterogeneous generator pool (worse). The five-draw
pool is 1.46 answers wide; there is no selector that retrieves four points from it because four points
are not there to retrieve. Everything that is left has to change what the candidates *are*, not how
they are chosen.

**Evidence.** `eval/results` from `40880218444` (artefact 21.5 MB); `pnpm eval:pool`, `eval:signals`,
`eval:union` reproduce the pool, gate and union numbers from that file. The arm table is
`comparePaired` over `per_case[].arms` at 10,000 resamples. Note that `eval:signals` on this artefact
still re-reads shapes without the evidence — the field landed after the dispatch — so the command's
AUCs will differ from the gate block above in exactly the way iteration 106 tabulates.

### 108 — The gate's AUC was pooling comparisons no selector makes, and `row-shape` loses its licence

The pre-registered defect from iteration 106. `signalReading` counted `pairs` as the within-question
product `up × down` and then computed the AUC over the **flattened** positive and negative lists, which
adds every cross-question comparison. A selector is never asked to rank one question's candidate against
another's; those pairs are also mostly ties, because two candidates scored by the same signal on
different questions usually score the same and every tie counts as half.

Same file, same shapes, one estimator changed — run 40880218444's pool:

| Signal | Pooled (old) | Within (new) | Direction |
|---|---|---|---|
| `empty` | 0.5718 | **0.5405** | down |
| `row-shape` | 0.5592 | **0.5176** | down, **licence lost** |
| `column-shape` | 0.5799 | **0.5405** | down |
| `duplicate-share` | 0.5427 | 0.5423 | flat |
| `value-type` | 0.6018 | **0.5827** | down |
| `null-share` | 0.5175 | **0.5282** | up |

**The bias has no sign.** On run 40862283263 the same estimator change moves `empty` from 0.5719 to
**0.5767** — upward. So the pooled figure is not a pessimistic version of the right number; it is a
different quantity, one that depends on how many candidates each question contributed rather than on the
signal. That is why it had to be replaced rather than corrected by an offset.

**What it costs the gate.** With the estimator fixed, the evidence-less read of this pool keeps three
signals — `value-type` 0.5827, `empty` 0.5405, `column-shape` 0.5405 — and removes three: `row-shape`
0.5176 (z 0.71), `null-share` 0.5282 (z 1.62), `duplicate-share` 0.5423 (z 1.76, Holm 0.118). The
composite of the three captures **+0.85pp** on the 117 choice-bearing questions, against the **+3.42pp**
the run's own gate block reported for the five.

Two caveats keep that from being the final word. First, this read still lacks the evidence, so it is the
same degraded input iteration 106 tabulated. Second, the run's gate block was computed by the pooled
estimator, so "five of six survive" — the sentence that launched iterations 103 to 107 — is a pooled
statement. The corrected licensing of these signals on this corpus is **not yet measured**; it needs a
dispatch whose artefact carries the evidence.

**What does not change.** The arm's delta is an accuracy, not an AUC, so `sample-5-shape`'s
**+1.14pp [−0.57, +2.86]** stands as measured. The conclusion of iteration 107 does not depend on which
estimator licensed the signals: a chooser among 1.46 answers retrieves about a point of a seven-point
ceiling, and the ceiling itself is the constraint.

**What it does change.** Whether the composite is a five-signal object at all. Under the corrected
estimator three of the five do not clear their own bar on this pool, and the two that carried the arm —
`value-type` and `column-shape` — are the two that survive it. The `sample-5-value` arm built in
iteration 105 asked exactly that question and was never dispatched; on this evidence it is the only
version of the composite worth spending on.

**Also removed.** `aucOf`'s empty-list guard, which no test could reach once the caller filters, and the
`undefined` fallbacks on the grouped arrays, which are dense by construction. An unreachable branch is a
claim nobody can test, and the coverage gate found both as soon as the call graph changed.

**Evidence.** The table is reproducible from `/tmp/run-40880218444/poc-sota-bird.json` by evaluating both
estimators over `per_case[].pool` — done independently in Python and in the module, agreeing to four
decimals. Commit `6eda4ba`. 1,512 tests, 93 files, coverage **99.98 / 99.62 / 100 / 99.98**; `pool.ts`
100 on all four dimensions.

### 109 — Memory's fourth position, priced before it is built

Iterations 100–108 spent themselves on the selection axis and emptied it: agreement +0.00pp, a model
reading SQL −1.14pp, a deterministic shape composite +1.14pp inside a ±1.4pp noise floor, a
heterogeneous generator pool worse than the prompt it replaced. Every one of those arms asks the same
question — *which of these five answers should I keep* — and every one of them reads the answer's
words or its shape.

Memory has four positions in this system. Three have numbers. As a prompt prefix it costs **−3.14pp**
(p = 0.071). On retry it is worth **+0.29pp** over a retry with an empty pack, which is nothing. As a
selection feature its content never enters at all, because no selector here reads a rule. The fourth —
memory *judging* a candidate — has never been measured, and it is the only one left.

**What was built.** `memory-prior.ts` prices it at its strongest: extraction and retrieval are assumed
perfect. No rule text, no relevance filter, no embedding. The only question is *on this database, how
often did a result of this shape turn out right*, answered leave-one-fold-out so a question is never
helped by its own answer — the same cross-fitting the rules go through. Three keys, one function:
`db-signature`, `signature`, `db`.

**The price, on run 40880218444's pool, at zero model calls:**

| Key | Keys | Questions with a choice | Of those, with any support | Accuracy | First draw | Δ | Gained / lost | p |
|---|---|---|---|---|---|---|---|---|
| `db-signature` | 208 | 79 | 38 | 21.5% | 20.3% | **+1.27pp** | +5 / −4 | 1.00 |
| `signature` | 118 | 79 | 53 | 24.1% | 20.3% | **+3.80pp** | +6 / −3 | 0.51 |
| `db` | 11 | **0** | 0 | — | — | — | — | — |

**The third row is structural, not disappointing.** A key with no shape in it gives every candidate of
a question the same key, so the prior can never separate two answers to one question. It is not that
the database is uninformative; it is that a prior needs something the candidates differ in.

**The first two rows say the database is a bias, not context.** 208 keys across 350 questions leaves
38 questions with any support at all; forgetting the database cuts the key space to 118 and raises
support to 53. A memory that insists on the database is a memory that has usually never seen this
database — which is the same failure the rule store has, one level down.

**The population is the hard one, and that is why the numbers deserve a second read.** The 79
questions where five draws produced more than one shape are the questions the model was guessing on:
the first draw was right 20.3% of the time and the best of five 40.5%. The ceiling there is 16
questions; the shape key takes 3 net of it, the database key 1. Scaled to the full 350 that is
**+0.86pp** for the shape key — under the noise floor, which is the honest expectation for the run
that will measure it out of sample.

**Both keys became arms, because both are free.** They read the pool the sampling pass has already
paid for, so the comparison costs nothing beyond the draws: `sample-5-prior` (database and shape) and
`sample-5-prior-shape` (shape alone). The prior is applied after every fold is measured, because it is
the one selector in the lane that cannot run inside the fold it scores.

**A protocol defect fixed in the same commit.** Every arm-versus-arm number this project has published
was computed *after* the run, by a script outside the repository — `sample-5-shape` against
`sample-5-first`, `m-schema` against `none-replica`, all of iteration 107's paired table. That means
the pairs were chosen with the artefact in hand, which is the definition of a comparison that has not
been pre-registered. `CONTRASTS` now declares the pairs in code, before a dispatch, and
`contrastTable` reports them on the questions both arms answered; the artefact carries the result.
`samplingSpecOf` moved into the package for the same reason it exists at all: two sites read it now,
and a lane-local parser read from a second site is exactly how `full-validated` came to exist in one
file and not in the other.

**And an operational failure worth recording.** This iteration's first push was red in CI within
eight seconds: `git commit -a` stages modifications, not untracked files, so the three new files the
message described were absent from the tree while `index.ts` imported one of them. The push pipeline
uploads from the index, so nothing caught it locally — `pnpm check` passes on a working tree where the
files exist. Fixed by committing them (commit `950c38d`) and re-dispatching. The lesson is the same
one the coverage gate keeps teaching: a gate that reads the tree and a gate that reads the index are
different gates.

**Dispatched.** Run [`40961917806`](https://github.com/AgentiX-E/microglia/actions/runs/40961917806) at
`00237d0`, arms `none, full, none-replica, sample-5-first, sample-5-shape, sample-5-value,
sample-5-prior, sample-5-prior-shape, m-schema` — nine calls per question, ceiling 7,000.

**Evidence.** 1,541 tests, 94 files, coverage **99.98 / 99.63 / 100 / 99.98**; `memory-prior.ts`,
`pool.ts`, `sota.ts`, `artifact-pool.ts` all 100 on all four dimensions. The table above is
`pnpm eval:prior` on `/tmp/run-40880218444/poc-sota-bird.json`. Commits `79daca7`, `950c38d`.

### 110 — Four fifths of what the store injects never changes an answer

Iteration 109 priced the fourth position for memory. This one goes back to the first two and asks the
question the deltas have never answered: not *did the pack help* but *what did each rule do*.

`ruleLedger` builds a record per injected rule from the flips that happened while it was in the prompt —
a flip being a question where the treatment and the control disagreed — and `discriminationOf` says how
the store splits. Three runs, same configuration, read from their own artefacts:

| Run | Rules shown | Injections | Rules that moved something | Repaired | Broke | Rules per injection |
|---|---|---|---|---|---|---|
| `40880218444` | 219 | 650 | **51 (23.3%)** | 20 | 39 | 1.86 |
| `40862283263` | 214 | 650 | **37 (17.3%)** | 16 | 28 | 1.86 |
| `40820868520` | 217 | 652 | **46 (21.2%)** | 22 | 30 | 1.87 |

**Four fifths of the store is silent.** For a rule shown on a question the control already answered
correctly, nothing happened — and that is 77%–83% of everything injected. Of the fifth that did move an
answer, two thirds moved it the wrong way, in all three runs, with no exception.

That is a different statement from the one the −3.14pp delta makes, and it is the one that says what to
do. "Memory is slightly harmful" invites a better ranker. "Memory is mostly inert with a harmful tail"
says the ranks have nothing to sort: the store admits claims that cannot matter and a few that hurt, and
the retrieval that put them in the prompt is not making a choice among candidates so much as passing
everything through.

**It also sizes the fix, and the size is the bad news.** A filter over rule features has to be fitted on
the rules that discriminated, because the inert ones carry no label. That is ~45 rules per run. A
two-way split at 22 per side cannot separate a 70/30 difference in harm rate from a coin; the arithmetic
needs about 40 per group, so roughly two runs of the same configuration before *one* pre-registered
binary feature could be tested at 80% power — and the multiplicity across plausible features would eat
most of that. This is why the next step on this axis is not a classifier. It is more evidence per rule,
which means either many more runs or a workload where each rule is shown many times.

**What is new here, and what is not.** The arithmetic wall is not new: iteration 68 found 0 of 1,296
rules observed twice, and iteration 77 measured **0.25 decisive comparisons per rule** from the
validation pass and retired 16 rules with it. This iteration measures the same wall from the other side —
from the injections rather than from a validation pass — and the two agree to within the arithmetic:
0.25 decisive comparisons per rule and 21% of rules with any decisive observation are the same statement
about the same corpus. What is new is the *shape* of the negative: not "some rules hurt" but "four
fifths of the store is silent, and the harmful tail is twice the helpful one", which is the number a
product decision needs and which no accuracy delta carries.

**And the two readings together say where the next experiment has to run.** A corpus with 350 questions
and 1.8 rules per pack cannot produce a per-rule statistic, however it is cut: corroboration admits
nothing, retirement reaches 16 rules, a feature filter would need ten times the sample. The flywheel
needs a workload where one rule is exercised tens of times, and this benchmark is not one. That is a
statement about the *workload*, and it is the first time in this programme that the constraint has been
located outside the memory system itself.

**A defect found while wiring it, and it was mine.** The artefact's field is `withoutMemoryCorrect`; the
first draft of the reader used `withoutMemory`. Undefined is falsy in JavaScript, so `!entry.withoutMemory`
was true for every case and every correctly answered question counted as a repair: the command printed
**332 repairs and 0 breaks** where the ledger's true values are 20 and 39, and `inertShare` came out as
21% instead of 77%. The unit was right, the sign was right, and the magnitude was wrong by a factor of
sixteen — which is the second time in three iterations that a reader built from memory rather than from
the type produced a plausible number about the wrong thing (iteration 106 was the missing `evidence`
field). The type now names the field, so a bin that reads the artefact cannot compile without it.

**A second, smaller decision.** A case with rules but no ids, or with ids and texts of different lengths,
is counted as `unkeyed` and contributes nothing, rather than being dropped or given a synthesised id. The
count is printed, because a silent drop is how a ledger becomes a measurement of its own filter.

**Evidence.** `pnpm eval:store` on each run's artefact reproduces the table; 1,549 tests, 94 files,
coverage **99.98 / 99.63 / 100 / 99.98**, `store-report.ts` 100 on all four dimensions. Commit `b6b969d`.

### 111 — The fourth position measured, and it is inside the noise floor: R7 closes

Run [`40961917806`](https://github.com/AgentiX-E/microglia/actions/runs/40961917806) finished green:
350 questions, 5 folds, seed 7, nine calls per question, 3,509 calls, 0 failures, 1 retry, every
blocking gate passing. It is the first run that scored a memory prior as an arm, and the answer is the
one the price predicted.

**Every arm against `none` (54.86%).**

| Arm | Accuracy | Δ vs `none` | 95% CI | p | +/− |
|---|---|---|---|---|---|
| `sample-5-shape` | 54.86% | +0.00pp | [−2.00, +2.00] | 1.000 | +7 / −7 |
| `sample-5-prior` | 54.86% | +0.00pp | [−2.29, +2.00] | 1.000 | +7 / −7 |
| `sample-5-prior-shape` | 54.86% | +0.00pp | [−2.00, +2.00] | 1.000 | +7 / −7 |
| `sample-5-value` | 54.57% | −0.29pp | [−2.29, +1.43] | 1.000 | +5 / −6 |
| `sample-5-first` | 54.29% | −0.57pp | [−2.57, +1.43] | 0.774 | +5 / −7 |
| `none-replica` | 54.29% | −0.57pp | [−2.00, +0.86] | 0.688 | +2 / −4 |
| `m-schema` | 54.00% | −0.86pp | [−4.29, +2.57] | 0.736 | +16 / −19 |
| `full` | 50.29% | **−4.57pp** | [−7.71, −1.71] | **0.007** | +8 / −24 |

**The pre-registered contrasts, which are the reason the artefact now carries them.**

| Pair | Δ | 95% CI | p | +/− |
|---|---|---|---|---|
| `prior-shape` vs first draw | +0.57pp | [−0.86, +2.29] | 0.727 | +5 / −3 |
| `prior` vs first draw | +0.57pp | [−0.86, +2.00] | 0.688 | +4 / −2 |
| `shape` vs first draw | +0.57pp | [−0.86, +2.00] | 0.688 | +4 / −2 |
| `value` vs first draw | +0.29pp | [−0.57, +1.43] | 1.000 | +2 / −1 |
| `shape` vs `value` | +0.29pp | [−0.57, +1.14] | 1.000 | +2 / −1 |
| `prior` vs `shape` | +0.00pp | [−1.71, +1.71] | 1.000 | +4 / −4 |
| `prior-shape` vs `prior` | +0.00pp | [−1.43, +1.43] | 1.000 | +3 / −3 |
| `m-schema` vs direct | −0.29pp | [−3.71, +3.14] | 1.000 | +18 / −19 |

**R7.3a's criterion 1 is not met and the stage closes.** The bar was ≥ +1.0pp with an interval excluding
zero; the reading is **+0.57pp [−0.86, +2.29], p = 0.73**, and the run's own `none-replica` floor is
**−0.57pp [−2.00, +0.86]**. The prior's estimate lies inside the replica's interval and the replica's
lies inside the prior's; the two are the same number measured twice, which is the cancellation condition
written into the roadmap before the dispatch. Note that the floor is not a fixed ±x: this run's replica
moved 0.57pp, the previous run's moved 0.29pp, and the prior's 0.57pp is the same size as the drift of a
byte-identical prompt. Criterion 2 passes trivially and therefore says nothing: the
database-keyed and shape-keyed priors are *identical* at +0.57pp, so the schema is neither context nor
harm in this key — it is inert, exactly as the previous run's support counts predicted (38 of 79 with
support when the database is in the key, 53 when it is not).

**The in-sample table on this run's own pool says the same thing at a different denominator.**

| Key | Keys | Choices | With support | Accuracy | First draw | Δ | +/− |
|---|---|---|---|---|---|---|---|
| `db-signature` | 213 | 72 | 29 | 27.8% | 25.0% | +2.78pp | +4 / −2 |
| `signature` | 124 | 72 | 46 | 27.8% | 25.0% | +2.78pp | +5 / −3 |
| `db` | 11 | **0** | 0 | — | — | — | — |

Two and a half points on 72 questions is 2 net flips, and 2/350 is 0.57pp — the arm's number exactly.
So the simulation and the arm agree a *second* time (iteration 107 checked the same property for the
shape composite), which is the only part of this iteration that went the way it was designed to.

**What the four positions now cost, in one table.**

| Position | Object | Measured | Verdict |
|---|---|---|---|
| Prompt prefix | distilled text | **−4.57pp [−7.71, −1.71], p = 0.007** | significantly harmful, replicated |
| Retry injection | the same text, later | +0.29pp over an empty retry | the retry was the effect |
| Verifier feature | the same text, read by a selector | never built | no selector reads a rule |
| Verifier prior | `(key, outcome)` over result shapes | **+0.57pp [−0.86, +2.29], p = 0.73** | indistinguishable from zero and from the replica; stage closed |

**R7 is closed.** Every rung of it has run: R7.0 described the pool (1.43 distinct answers), R7.1 refuted
heterogeneous generation, R7.2a licensed five signals under a pooled estimator that iteration 108 then
showed was wrong, R7.2b measured the composite at +1.14pp and then +0.57pp — two readings of the same
mechanism, neither outside its own interval — and R7.3a has now measured the last position and found
nothing. The selection axis and the memory axis are both empty on this harness, and the harness says so
with intervals rather than with adjectives.

**What that closes and what it opens.** The negative is now explained from two directions that agree: a
store whose rules are inert four times out of five and harmful twice as often as helpful (iteration 110),
and a workload that gives each rule 0.25 decisive observations (iteration 77). Neither is a ranking
problem, and no amount of selector engineering addresses either. The next stage has to put memory in a
workload where one rule is exercised tens of times; that is a different corpus, not a different arm, and
it is written into the roadmap as R9 with its acceptance criteria before anything is built.

**Evidence.** `per_case[].arms` from `40961917806`; the tables are `comparePaired` at 10,000 resamples
over those flags, `metrics.prior` and `contrasts` from the artefact itself. `pnpm eval:prior` on the same
file reproduces the second table. 3,509 calls, 0 failures.

### 112 — R9.1: the store was silent because it was never asked, and the floor prices the answer

The stage R7 closed with was a workload problem, and this iteration builds the workload. `density.ts`
holds the family: a rule set fixed by content hash, one rule per prompt so `rulesPerInjection` is 1 by
construction, a panel of twenty questions per database shared by every rule in it, the `none` arm's
deterministic answer as the control, and one foreign rule per panel as the floor. The readings are two
units on purpose — `inertShare`, which the roadmap pre-registered and which grows with the number of
chances, and `flipRate`, which does not — and applicability is measured twice: against the gold query
(a diagnostic upper bound) and against the question and its evidence (the only decidable one).

**The first dispatch measured everything and then failed its own bar on bookkeeping.** Run
[`40970179043`](https://github.com/AgentiX-E/microglia/actions/runs/40970179043): 2,861 calls, 0
failures, 1,600 injections, and `V18-density-exercised` red at "0-20 per rule" because eight rules were
selected from the one database the corpus cannot fill (`debit_card_specializing`, 16 usable questions
against a panel of 20) and were then never shown. Selection ran before the panels existed. The
measurement was complete; the population was not. The fix is one line of ordering — compute the panels,
then restrict selection to the databases that can fill one — and three readings the first artefact could
not answer were added before the re-run: the per-rule ledger split by half, the flips-per-rule histogram,
and sign persistence.

**What the family measured** (run [`40973498367`](https://github.com/AgentiX-E/microglia/actions/runs/40973498367):
350 questions, 0 failures, 1,800 density calls, 80 rules × 20 questions over 200 targets = 1,600 injections,
plus 200 floor injections; 91 store rules name a database, 80 are placed on a panel and 11 name one the
panels do not cover, and `debit_card_specializing` is left out by name):

| Stratum | rules | injections | discriminating | flips | accuracy | Δ |
|---|---|---|---|---|---|---|
| overall | 80 | 1,600 | **68.8%** | 7.1% | 52.0% → 50.2% | −1.81pp [−4.38, +0.69], sign p 0.030 |
| relevant | 53 | 679 | 50.9% | 7.4% | 49.9% → 47.0% | −2.95pp [−6.15, 0.00] |
| irrelevant | 70 | 921 | 52.9% | 6.8% | 53.5% → 52.6% | −0.98pp [−3.73, +1.73] |
| cued | 54 | 475 | 44.4% | 8.2% | 49.5% → 47.2% | −2.32pp [−6.24, +1.31] |
| **floor** | 10 | 200 | 80.0% | **7.5%** | 52.0% → 50.5% | −1.50pp [−5.50, +2.50] |

**R9.2 passes and the pre-registered prediction is refuted.** The prediction on file was 35–55%
discriminating and "R9.2 fails"; the reading is **68.8%** against a bar of 60%. At a mean of ~3 shows per
rule the same instrument read 23%. The histogram is `0:18 1:30 2:20 3:6 4:5 5:1`: 18 of 80 rules (22.5%)
never move an answer at all and 7 more move it both ways, which is the 31.3% `inertShare` — against 77%
before. So the four-fifths-silent figure this project has quoted since iteration 68 was a property of the
workload: a rule shown three times cannot be classified, and every filter designed against that number
was designed against an artefact.

**The floor is the finding, not the gate.** A rule from a different database — vocabulary the workspace
does not have, about tables that are not there — flips **7.5%** of its injections and discriminates on 8
of its 10 rules; the store flips **7.1%** and discriminates on 55 of its 80. Movement is therefore a
property of *text arriving in the pack block*, at about one injection in fourteen, and not of what the
text says: a family of rules that cannot apply reaches the same discriminating share within noise. The
content decides only the direction, and the direction is negative for both — 42 repairs against 71 breaks
on 1,600 for the store, 6 against 9 on 200 for the floor.

**Applicability carries no information about sign, and if anything the sign is backwards.** On the 679
injections whose gold query uses the rule's vocabulary, Δ is **−2.95pp** [−6.15, 0.00]; on the other 921
it is **−0.98pp** [−3.73, +1.73]. The intervals overlap and the strata share targets, so the defensible
reading is "indistinguishable — at minus three points": a rule that has something to say about the
question is not better than one that does not. The instrument also says why — 49.1% of the rules shown a
question they *can* answer never moved it, against 31.3% overall, so the gold-query filter selects the
**more** inert rules, not the more useful ones. That is the sharpest form the suspicion that opened R9
has taken.

**Four policies, all scored on the second half of the panel, which no fit ever saw.**

| Policy | shown | accuracy | Δ | 95% CI | +/− |
|---|---|---|---|---|---|
| `always` | 800/800 | 49.38% | −3.62pp | [−7.88, +0.25] | +17 / −46 |
| `cued` | 224/800 | 50.88% | **−2.13pp** | [−4.25, −0.38] | +4 / −21 |
| `fitted` | 170/800 | 53.63% | +0.63pp | [−0.50, +2.25] | +8 / −3 |
| `oracle` | 130/800 | 54.75% | **+1.75pp** | [+0.38, +3.75] | +14 / −0 |

The ceiling is outside the noise floor on the memory axis for the second run in a row, which says the
effect is real and per-rule: some rules repair answers and never break one. No deployable policy reaches
it. The only one a deployment can compute from the question alone (`cued`) is **significantly worse than
showing nothing** — the vocabulary cue selects rules that hurt — and the fitted one beats that cue by 2.8pp
with an interval through zero. That gap is R9.3's question, now with a measured ceiling to aim at.

**The per-rule sign is a stable property, which is what makes R9.3 possible at all.** Of the 20 rules that
had a sign on both halves of the panel, **16 kept it (80%, p = 0.012)**; 36 rules had a sign to learn
from. The same test run backwards agrees: fitted on the second half and scored on the first, the selected
rules gain 12 and lose 4. Of the 17 rules the first half judged positive, 7 were positive on the second
half, against 1 of the 19 it judged negative. So a rule's effect is predictable from ten observations,
and the reason the fitted policy earns only +0.63pp is that there are too few positive rules to select.

**The two halves are not exchangeable, and that is a caveat on the whole reading.** First half: 25
repairs, 25 breaks — exactly balanced. Second half: 17 repairs, 46 breaks. The 113 flips split 50 / 63,
the net sign of the store goes from 0 to −29, and the persistence statistic above is computed across that
drift. A per-rule sign survives it at p = 0.012, but the aggregate does not, so R9.3 must not treat the
fit half as an unbiased estimate of a rule's true effect: 25/25 is what a zero-mean population looks like
and 17/46 is what the same rules did on ten different questions. The plan entering R9.3 is therefore a
stratified or repeated split, not a single one, and it is written down here before that run.

**Evidence.** `density.ts` at 100% on all four dimensions, 43 tests in `density.test.ts` and 7 in
`stats.test.ts`; `pnpm check` green with 1,599 tests, 96 files, coverage 99.98 / 99.64 / 100 / 99.98. Gates
on the authoritative run: V18 "20-20 per rule (median 20)", V19 "68.8% of 80 rules", V20 1,600 = 679 + 921,
V21 200 floor injections.

### 113 — R9.3: the fit is worth about a point, the schedule is not the reason, and the bar is missed by 0.06pp

R9.1 priced the per-rule policy on one split and reported why one split should not be trusted: the fit
halves carried 25 repairs and 25 breaks, the scoring halves 17 and 46. This iteration replaces the split
with a cross-fit — five folds per rule's panel, ten independent cuts, the rule's sign fitted on the four
folds it is not being scored on — and fits the foreign rules with the same machinery as the control. The
trials are now carried in the artefact, so both readings cost no calls: this whole iteration is
`1,800` density calls, the same ones R9.1 bought.

**The bar was `CI excluding zero`, and the interval contains zero by 0.0625pp.**

| Reading | shown | accuracy | Δ | 95% CI | +/− |
|---|---|---|---|---|---|
| cross-fit, store | 4,884 / 16,000 | 51.5% → 52.83% | **+1.33pp** | **[−0.06, +2.83]** | +339 / −126 |
| cross-fit, foreign rules | 512 / 2,000 | 51.5% → 51.55% | +0.05pp | [−1.75, +1.85] | +21 / −20 |
| single split, `fitted` | 220 / 800 | 52.0% → 52.5% | +0.50pp | [−1.38, +2.25] | +11 / −7 |
| `cued`, the only cue a deployment has | 243 / 800 | 52.0% → 51.0% | −1.00pp | [−3.25, +1.12] | +11 / −19 |
| `oracle`, the ceiling | 180 / 800 | 52.0% → 55.3% | +3.25pp | [+1.00, +6.25] | +26 / −0 |

V22 passes: 16,000 of 16,000 injections scored, 5 folds × 10 repeats. V23 fails on the interval and only
on the interval — the store beats its own floor by **1.28pp**, and the pre-registered prediction ("inside
[0.00, +1.00]pp with an interval containing zero, floor slightly negative, V23 fails") is confirmed on the
bar and on the floor and refuted on the point estimate, which came in at +1.33 rather than ≤ +1.00.

**What the floor buys.** R9.1 could not tell a policy from a schedule: the foreign rules flipped 7.5% of
their injections against the store's 7.1%. Fitted by the same machinery they earn **+0.05pp**, and the
store earns +1.33pp. The schedule is now priced and it is worth nothing; the 1.28pp difference is content.
The shape prior in §3.6.4 also cleared its control, but that control was a replica of the empty pack and so
priced sampling noise; this is the first time a rule-selection policy has been priced against the same
machinery applied to material that cannot apply, and it is the first time the answer was positive.

**The reading does not depend on how the cut was made.** Recomputed from the carried ledger, 20 repeats per
schedule, zero calls:

| Folds | store Δ | 95% CI | foreign Δ |
|---|---|---|---|
| 2 | +0.04pp | [−0.79, +0.79] | 0.00pp |
| 4 | +0.95pp | [−0.27, +2.17] | +0.27pp |
| 5 *(pre-registered)* | +1.33pp | [−0.06, +2.83] | +0.15pp |
| 10 | +1.30pp | [−0.16, +2.85] | +0.65pp |
| 20 (leave-one-out) | +1.38pp | [−0.19, +3.00] | +0.50pp |

Every schedule with at least fifteen fit observations lands between +0.95 and +1.38pp; only two folds — ten
fit observations a rule, which is the density R7 said cannot classify — collapses to zero. The floor never
exceeds +0.65pp on any schedule. Two runs in a row now show the ceiling outside the noise floor
(+1.75 [+0.38, +3.75] and +3.25 [+1.00, +6.25], the second with 26 repairs and no breaks).

**Why the interval is wide is the finding, not a complaint.** The cross-fit scores 16,000 injections, but
they are ten cuts of the same 1,600 trials on 200 questions, and the bootstrap resamples questions. Doubling
the schedule from 10 cuts to 20 moved the interval from [−0.06, +2.83] to [−0.06, +2.83] — the same two
decimals. **Repeats do not buy precision; questions do.** Halving the interval needs four times the
clusters, which is 800 questions, not another pass over the same 350. R9.3's bar is therefore not a bar this
family can clear at this size, and that is a statement about BIRD Mini-Dev rather than about the policy.

**The sign a rule carries is real but weaker than R9.1 made it look.** This run: 17 of 24 rules kept their
sign across halves (70.8%, p 0.064). R9.1: 16 of 20 (80.0%, p 0.012). Pooled over both runs, 33 of 44
(75.0%, **p 0.0013**) — so a rule's direction is learnable, at a lower rate than one run suggested, and the
pooled estimate is the one to quote.

**The strata, for the record** (80 rules × 20 questions, 1,600 injections, floor 200): overall 68.8%
discriminating, 8.0% flips, 51.5% → 50.7%, −0.75pp [−3.69, +2.25], sign p 0.788; relevant 58 rules on 721
injections −2.08pp [−5.48, +1.13]; irrelevant 67 on 879 +0.34pp [−2.92, +3.65]; cued 59 on 533 −0.38pp
[−4.23, +3.38]; floor 10 on 200 −2.50pp [−6.50, +1.50]. The applicability inversion R9.1 reported reproduces
in direction: the stratum whose gold query uses the rule's vocabulary is the worse one, again.

**Evidence.** Run [`40979195141`](https://github.com/AgentiX-E/microglia/actions/runs/40979195141): 350
questions, 2,859 calls, 0 failures, 1 retry, V18–V22 green, V23 red. `crossFit` at 100% on all four
dimensions with 61 tests in `density.test.ts`; `pnpm check` green with 1,617 tests, 96 files, coverage
99.98 / 99.65 / 100 / 99.98.

### 114 — R9.4 and R9.5: the rule stops at the schema, and exercise was never the problem

**One dispatch was refused before it was read.** The first R9.4 dispatch (`40985127694`) bought all
2,600 density injections — 1,600 home, 200 floor, 800 foreign — with 3,657 calls, no failures, and then
failed itself. V18 read `19-20 per rule`: one call had never returned, so one rule had nineteen
observations in the ledger, and the gate that exists to prove every rule was exercised twenty times
said no. The lane published a partial with the reason instead of an artefact, and the run is a total
loss of 3,657 calls and twenty-two minutes over a single 503.

That is a defect in the instrument, not in the family, and it selected for luck: a family that
measures 2,599 of 2,600 injections correctly was being discarded while a luckier one with identical
machinery was kept. Two changes, both keeping the claim tight:

| Change | Why it does not weaken the claim |
|---|---|
| A density injection is retried once before it becomes a hole | a hole costs a rule one of its twenty chances; a duplicate costs a call, and the retry is bounded at one |
| V18 compares the shortest rule against `panel − holes`, and bounds holes at one per rule and at 1% of the family | a run that really lost its injections still fails; a run that lost one call no longer prints a null result |

**The accepted run** (`40988215122`, commit `5cbed98`): 350 questions, 3,656 calls, 1 retry, 0
failures, **0 holes**, 2,600 density injections over 80 rules × 10 databases, plus 800 foreign
injections over 11 databases. `none` 53.71% → `full` 51.14%, **−2.57pp**.

| Gate | Reading | Verdict |
|---|---|---|
| V18-density-exercised | 20-20 per rule (median 20), 0 holes in 1,600 | pass |
| V19-density-discriminates | 71.3% of 80 rules | pass |
| V20-density-reconciles | 1,600 = 704 relevant + 896 irrelevant | pass |
| V21-density-floor (advisory) | 200 floor injections, 7.0% flips | pass |
| V22-density-crossfit-covers | 16,000 of 16,000 scored, 5 folds × 10 repeats | pass |
| V23-density-crossfit-beats-floor (advisory) | store +0.33pp [−0.49, +1.18] vs floor −0.25pp | fail |
| V24-density-transfer-covers | 800 of 800 injections, 0 on the rule's own, 11 databases | pass |
| V25-density-transfer-holds (advisory) | home-positive rules −2.27pp [−7.86, +2.68] | **fail — the claim** |
| V26-density-evidence-curve | caps 4, 6, 8, 10, 12, 16, 20 of a 20-question panel | pass |

**R9.4 fails, and the failure is the cleanest result in the programme.** The twenty-two rules that
worked at home — a positive net over their own twenty questions — earn **−2.27pp** on questions from
other databases, with 7 repairs against 12 breaks. R6's two numbers do not reappear in this setting:
across schemas the repair rate is 6.7% (above R6's 3.52%) and the break rate 10.4% (far below R6's
42.6%), because a rule about tables that are not there is not a wrong instruction but an ignorable
one. The negative stratum proves it from the other side: rules that cost 8.71pp at home cost 2.29pp
abroad — they stop acting. Cross-schema memory is not harmful, it is inert, and a global store buys
exactly nothing.

**R9.5 confirms its prediction and refutes its own premise.** The curve is flat: +0.00pp at four
observations, +0.36pp at eight, +0.33pp at twenty. The prediction on file (four at or below zero,
within 0.3pp of the full panel by twelve, flat afterwards) holds in every clause. What it means is
that the family's founding premise — that four fifths of the store was silent because it was never
asked — was right about the observation and wrong about the cause: asking twenty times does not
produce a policy that works, because the sign of a rule is only learnable where the rule applies.

**The +1.33pp did not replicate.** Three stores, same code: **+1.33, +0.41, +0.33**, mean **+0.69**,
sd **0.56**. Every run is a new distillation draw, and the draw-to-draw spread is as wide as the
effect. The stable number is the ceiling: `oracle` +3.25pp [+1.00, +6.25] and +2.25pp [+0.63, +4.38],
both excluding zero, both with zero breaks.

| Policy (second half of the panel, out of sample) | shows | accuracy | Δ | 95% CI | +/− |
|---|---|---|---|---|---|
| `always` | 800/800 | 52.0 → 48.8% | −3.25pp | [−7.75, +0.88] | 22/48 |
| `cued` | 220/800 | 52.0 → 51.2% | −0.75pp | [−2.63, +0.88] | 9/15 |
| `fitted` (one split) | 140/800 | 52.0 → 52.1% | +0.13pp | [−0.63, +1.13] | 5/4 |
| `oracle` | 150/800 | 52.0 → 54.3% | **+2.25pp** | [+0.63, +4.38] | 18/0 |
| cross-fit, store | 3,804/16,000 | 52.0 → 52.3% | +0.33pp | [−0.49, +1.18] | 161/109 |
| cross-fit, foreign rules | 460/2,000 | 52.0 → 51.7% | −0.25pp | [−2.25, +1.70] | 20/25 |

Sign persistence this run is 10 of 15 (66.7%, p 0.302); **pooled over the three runs it is 43 of 59,
72.9%, p 0.0006**. A rule's sign is a real property of the rule. It is simply a property of the rule
*in one database*.

**The R9 refutation condition is triggered.** It was written into the stage before any of this was
measured: *if R9.3's fitted policy beats the floor but R9.4's transfer does not, the finding is that
memory is a lookup and not a lesson.* The fitted policy beat its content-free floor in both runs, and
transfer is −2.27pp. R9 closes on its own pre-registered terms.

**Green:** `pnpm check` — 1,650 tests, 96 files, coverage 99.98 / 99.65 / 100 / 99.98, `density.ts`
100 on all four dimensions; CI `40988208012` on the same commit.

### 117 — R10: the rule is read as a structure, and the binder is allowed to say no

R10 was pre-registered in 116 and unimplemented. This iteration builds the construction, and the two
decisions that had to be made while building it are worth more than the code.

**What exists now.** `packages/eval/src/template.ts`: three pure functions over schema name sets, no
model call, no I/O. A stored statement is read against the schema it was learned in — an identifier
the home schema has becomes a slot, everything else stays prose — and before it is shown on another
database each slot is filled from *that* database's names. Binding scores the Jaccard overlap of the
two names' `snake_case` parts: identity 1, `price` → `unit_price` 0.5, nothing below 0.5 accepted,
ties to the shorter candidate, one candidate never filling two slots. A slot with no candidate
withholds the whole rule.

**Two defects the build found, both in the instrument rather than the hypothesis.**

| Defect | How it surfaced | Fix |
|---|---|---|
| `V27` was already taken — by the candidate contract's gate in `plugin.ts` — so the new withholding bar collided with a gate that has nothing to do with it | the protocol gate's own output line, `R8.1-offline-fixture … with V27, V29, V30`, printed the id back while the new bar was being written | renamed to **`V28`**; the number is a namespace, and two families sharing one is how a reader comes to quote the wrong criterion |
| The first version of `V24`'s new denominator counted the rules that reached the ledger, and a run where seventy-nine of eighty rules were withheld would have **passed** the coverage bar | the existing test `fails the coverage bar when the foreign panels came back short` went green when it should have gone red | coverage is `(rules − withheld attempts) × panel`; the withheld count is subtracted from the selection, never from the ledger, and `V28` closes the hole on the other side |

The second one is the iteration's real finding. Counting what arrived is the natural way to divide
when some attempts are legitimately withheld, and it silently converts the bar that exists to catch
vanishing rules into a bar that certifies their disappearance.

**Gates and their reasons.** `V24` subtracts withheld panels because under the bound form withholding
is the pre-registered behaviour; `V28` requires `bound + slotless` attempts to equal the rule-database
pairs the foreign ledger carries, so withholding is a number and vanishing is a defect. The
distinction is on the attempt, not the rule: one rule can bind in `formula_1` and be withheld in
`california_schools`, and a per-rule count would have to be wrong about one of them.

**Three amendments, written before the first dispatch** (`prereg/R10-template-transfer.md`): the
template is derived at use time rather than by the distiller, so the arms differ in one field of one
rendered line; a withheld attempt makes no call and contributes no trial rather than a zero-delta
trial; `V24`'s denominator changes as above. None of them moves a prediction.

**Cost of being wrong, priced in advance.** The lane prints the binding record — bound, slotless,
withheld, and the schema names that stopped attempts — *before* the first model call, because the
pre-registration's own kill condition is a withheld share above 60%: a run that cannot answer its
question should not spend 3,800 calls finding that out.

**Green:** `pnpm check` — 1,792 tests, 102 files, coverage 99.98 / 99.63 / 100 / 99.98; `template.ts`
and `density.ts` 100 on all four dimensions.

**Still open.** The fourth dev dispatch (`41021842231`, `split=dev`, `learn_sample=64`,
`max_calls=6000`) has been running since 07:43Z and has not finished; the three before it each died
on a defect the run found rather than a defect reading found. R10's arm-B dispatch waits for it,
because both draw on the same model budget and the dev cell is the one that closes a published row.

**The arm was never dispatched, because the kill condition was cheaper than the arm.** Withholding is
a property of *schemas*, and the schemas are on disk, so the pre-registered condition — more than 60%
withheld means the run measures the binder — was measured for zero model calls. `pnpm eval:template`
reads the store the committed artefact carries, opens the eleven databases it covers, and puts the
binder on all 2,590 rule-database pairs:

| Reading | Value |
|---|---|
| rules | 289 (1,288 entries; the five folds repeat each rule once — the distiller's id is a content hash) |
| homeless / attempted | 30 / 259 |
| bound in at least one foreign database | **10 — 3.9%** |
| slotless | 76 — 29.3% |
| withheld | **173 — 66.8%** |
| top blockers | table `posts` 103, `cards` 91, `drivers` 86, column `lap` 80, `patient` 70, `player` 57 |

Every blocker is a **domain element**: the word that makes a rule about one database, and precisely
what SQL-Exchange substitutes by mapping to the *target query* — structure a name comparison never
sees. So R10 closes as a construction **refused before it was paid for**: no arm-B dispatch, no
verdict on the structural hypothesis, and 2,600 calls not spent.

The reading is committed as an artefact rather than quoted from a terminal:
`eval/results/poc-template-census.json` carries the rules, the databases, the attempts, the blockers
and the verdict, so the refusal can be recomputed by a reader who trusts none of the above.

**A defect in the census itself, found by its own first output.** The artefact lists the store once
per fold, so the first run counted 1,288 rules where the store holds 289, and the withheld share was
weighted by fold overlap (64.3% instead of 66.8%). `bindingCensus` now collapses duplicate ids and
reports how many it collapsed; the number a reader quotes had to be a property of the store and not
of the artefact's shape.

**What R11 has to be.** The reading says name identity is not the substitution that carries a rule;
it does not say structure does not travel. R11 binds a slot to the target's own schema links — the
tables and columns the question mentions, already computed by `linkSchema` — with the same 60% kill
condition measured by the same command before anything is bought.

### 118 — The fold was never hung; the client was killing its own requests

The fourth dev dispatch (`41021842231`) finished three folds and was killed by its step timeout at
160 minutes. Its log has an interleaving that rules out almost every explanation:

| Fold | Evaluation | Learning + distillation |
|---|---|---|
| 1 | 614 replies, 2m07s | 3m47s |
| 2 | 614 replies, 1m45s | **43m02s** |
| 3 | 614 replies, 2m00s | **nothing printed for 107 minutes**, then killed |

The evaluation half is the control. Same endpoint, same minute, same 200-token replies, 614 of them
in under two minutes. What changed between the two halves is the *reply allowance*: distillation asks
for 2,000 tokens, and `LlmClient` waited a constant `60_000` ms per attempt regardless.

That is the finding: **the client was aborting requests that were about to succeed, four times each,
and recording each prompt as one the model could not answer.** 24 corrections × ~2.5 attempts × 60 s
is the 43 minutes in the second row, to the minute. The third fold is the same arithmetic without the
final success.

**Why it survived four dispatches.** Nothing in the artefact could distinguish "the model had nothing
to say" from "the client hung up": a failed generation was cached as `''`, and a failed distillation
was counted in `distilled.failed` — a number that appeared in the fold line and explained nothing. The
learning half also had no progress output at all, so 107 minutes of retrying looked exactly like a
process that had wedged.

**What was fixed, in four places.**

| Defect | Fix | Where |
|---|---|---|
| one timeout for every request | `attemptTimeoutMs(maxTokens) = 25s + 140ms/token`, capped at 300s | `model-client.ts` |
| a timeout retried like a 429 | two attempts after a timeout, four after a status; `Retry-After` honoured | `model-client.ts` |
| no limit the run held over itself | `SOTA_DEADLINE_MIN` (130) checked before every attempt, raising `MG_E_DEADLINE`; the fold loop writes `partial.json` with `stopped_by: deadline` | lane + client |
| a batch paid for one call at a time | `Interpreter.prefetch`: the batch's prompts are warmed at `SOTA_DISTILL_CONCURRENCY` while the claims are still applied in corpus order | `distill/` |

**The concurrency change is a two-phase loop, and the split is the whole argument.** A prompt is built
from its own event alone, so the calls can overlap; a claim's effect on the store depends on what is
already in it, so the claims cannot. `distill()` now gathers the contexts, offers them to
`interpreter.prefetch`, and then applies the interpretations in corpus order — the same order, the
same prompts, the same store. An interpreter without a prefetch behaves exactly as before, which is
why the default width is one.

**A spent budget used to be a silent thinning of the store.** `distill()` counted any interpreter
error as `failed` and continued, and a spent budget arrives that way. A fold that ran out of calls
mid-distillation would have published a store built from part of its corrections. The host now passes
`fatal: stoppedRun`, which re-throws the three codes that mean the run is over
(`MG_E_BUDGET_EXCEEDED`, `MG_E_PROVIDER_FAILED`, `MG_E_DEADLINE`) and counts only the ones that mean
this event had nothing to say. The same predicate is now the single place in the lane where that
decision is made; before, four call sites each made it differently, and one of them made it wrong.

**`V32-fold-learning-intact`, declared before the fifth dispatch.** More than 10% of the learning
questions unanswered, or more than 10% of the corrections failing to distil, fails the run. A store
built from 57 of 64 questions is not the treatment the arm was defined as, and until this gate the
artefact had no way to say so. The amendment is in `prereg/R8.3b-dev-split.md` and it moved no
prediction.

**Green:** `pnpm check` — 1,824 tests, 102 files, coverage 99.98 / 99.61 / 100 / 99.98.

**Fifth dispatch:** `split=dev`, `learn_sample=64`, `arms=none,full`, `max_calls=6000`,
`deadline_min=130`, `distill_concurrency=8`, step timeout 200, job timeout 260. The step and job
limits were raised because the lane's deadline is now the thing that stops a run; the runner's limit
is only a backstop.

### 119 — The cell is reproduced, and memory is still negative on 1,534 questions

The fifth dev dispatch (`41049843360`) finished in 77 minutes: five folds, 1,534 questions, both
arms, 3,190 calls, **0 timeouts**, 0 call failures. Every gate passed, including the one declared
before the run.

| Reading | Value |
|---|---|
| `none` execution accuracy | **57.63%** (884/1,534), Wilson **[55.14, 60.08]** |
| published `xiyan-deepseek-ddl` | 53.52% [51.02, 56.02] on the same 1,534 questions |
| difference | **+4.11pp**, inside the same-split tolerance of **4.97pp** |
| verdict | **`reproduced`** |
| `full` accuracy | 56.26%, delta **−1.37pp** [−2.74, 0.00], p = 0.062, lost 68 / gained 47 |
| store | 137 corrections, 1.94 rules/question, 64 learning questions per fold |

**All four pre-registered predictions held**, and the third is the interesting one. Prediction 1 said
`none` lands inside 53.52 ± 7.72 and the verdict becomes `reproduced` — it landed inside the stricter
same-split tolerance, 4.11 against 4.97. Prediction 2 said the interval narrows from ±5.2pp to about
±2.5pp — measured ±2.47. Prediction 3 said `full` does not turn positive on the larger sample — it is
−1.37pp, with an interval whose upper bound is exactly zero and a McNemar p of 0.062.

**The honest reading of the memory arm.** A store distilled from 64 questions per fold is a small
store, and this run says a small store of this kind does not help on 1,534 questions: it breaks 68 and
repairs 47. That is not a refutation of R9 — it is R9's closing condition measured at 4.4× the sample
with the sign unchanged and the interval now touching zero. The `learn_sample` cap is in the artefact
(`config.learn_sample: 64`) because a reader comparing this to a flywheel reading would otherwise be
comparing two treatments.

**The instrument, priced.** `timeouts: 0` is the headline number for iteration 118's fix: the same
learning half that spent 43 minutes on fold 2 of the previous dispatch now runs inside a fold that
completes in fifteen. `V32` reported 0/320 unanswered questions and 0 distillation failures, so the
run's store is the store the fold paid for — the thing the previous four dispatches could not say.

**Two defects the artefact revealed after it landed.**

- `per_case.arm_keys` stores each arm's **canonical result set**, and one `card_games` question
  returns a 12 MB string. The artefact is 38 MB, of which 37.9 MB is that one field: nine tenths of
  the evidence file is a single query's rows. The fix is to store the digest of a result key rather
  than the key — equality is all the arm-pair analysis needs — and it is deferred rather than bodged,
  because changing the field changes the schema the protocol gate validates.
- The cell-comparison record had to be regenerated, and `pnpm eval:protocol` refused the stale one
  with `the recorded comparison differs from the arithmetic (indicative at 0.19pp, reproduced at
  4.11pp)`. That refusal is the gate working: a verdict is derived from the artefacts present, so a
  new artefact changes it without anyone remembering to edit a table.

**Green:** `pnpm check` — 1,824 tests, 102 files, coverage 99.98 / 99.61 / 100 / 99.98, protocol
gate reporting both rows (`indicative` +0.19pp on 350, `reproduced` +4.11pp on 1,534).

### 120 — The successor was refused too, and the wall is the column

R10 refused a template binder for 66.8% withheld and named its successor: bind a slot to the tables
the *question* links rather than to a similar spelling. R11 builds that
(`packages/eval/src/link-bind.ts`) and asks the same question of it, offline, before any arm is paid
for.

**Three decisions, each of which the census can be wrong about.** A table slot's referent is the table
the question *names* — `linkSchema`'s anchors, not its join closure, because a join neighbour is a
consequence of the question rather than something it said. A name match outranks a link, since a
target that spells the table the way the rule does has already answered. A column slot binds only
inside the table its template reached, by name overlap **and** agreement in declared kind
(`PRAGMA` affinity, an undeclared type agreeing with everything): `price` is TEXT at home and REAL
elsewhere, and a rule about casting it is a claim about one of those.

**`pnpm eval:template` now runs both censuses**, from the same store and the same 350 scored questions.

| Reading | R10 — bind by name | R11 — bind by question |
|---|---|---|
| rules bound in at least one foreign place | 10 — 3.9% | **57 — 22.0%** |
| rules withheld | 173 — 66.8% | **126 — 48.6%** |
| attempts withheld | 1,796 / 2,590 — 69.3% | **51,159 / 82,137 — 62.3%** |

`62.3% > 60%`, so R11 issues **no verdict** and arm B is not dispatched — the second construction
refused by a condition written before its code, at a cost of zero calls.

**The reasons are the deliverable.** A withheld attempt used to name the slot that stopped it; it now
names the test it failed.

| Reason | Attempts | Share of the withheld |
|---|---|---|
| `no-column` — the target has no column by that name in the table the rule reached | 30,692 | **60.0%** |
| `no-table` — the question named no table the slot could take | 12,114 | 23.7% |
| `table-tie` — two anchors of equal length, withheld rather than guessed | 7,541 | 14.7% |
| `column-kind` — the name is there and the column holds another kind of thing | 812 | **1.6%** |

That inverts R10's explanation. The type check is 1.6% of the refusals; the vocabulary is 60%. A
table slot has a referent to inherit because questions name tables; a column slot has none, because
the column is the knowledge rather than its address. **The transfer question closes** on its third
measurement (R9 −2.27pp across a boundary, R10 66.8% no referent, R11 62.3% of which 60.0% is a
missing column), and the product statement is written into the guide rather than hedged: the pack is
an **in-database prompt**.

**A defect the census exposed, fixed on the way.** `per_case.arm_keys` stored each arm's canonical
result set; one `card_games` answer is 12 MB, so 37.9 MB of the 38 MB dev artefact was one field that
every consumer reads as an equality test. It is now `arm_result_digests` — 128 bits of SHA-256 — and
`union.ts` states the contract. The committed dev artefact is left as it ran: an evidence file is not
rewritten to make a later repository smaller.

**What was also true, and could be mistaken for a loophole.** The table-tie is 9.2% of all attempts,
so a construction that *guessed* a referent would clear the 60% bar on arithmetic. It is not built:
its failure mode is a confident statement about the wrong table, which is the harm R9 measured at
42.6% break on same-database foreign rules. If it is ever built it needs its own pre-registration,
and the bar is the same.

**Green:** `pnpm check` — 1,852 tests, 103 files, coverage 99.98 / 99.60 / 100 / 99.98, with
`link-bind.ts` and `sql-exec.ts` at 100 on all four dimensions.

### 121 — The store was asked to prove itself, and two thirds could not

Twelve iterations compared a pack against no pack on questions the store had never seen. That design
answers "does the pack change the score" and cannot answer "is the pack any good". The instrument for
the second question has existed since `rule-probe.ts` was written and had never run on BIRD: `rule_probe`
was `null` in both committed artefacts. Iteration 121 dispatches `full-verified`, which probes first
and then answers with what survived.

**The probe, on 156 corrected cases for 312 calls** (out of 1,445 for the whole run):

| Verdict | Count | Share |
|---|---|---|
| `supplied` — the rules did the work | 19 | **12.2%** |
| `redundant` — a blank retry was already enough | 31 | 19.9% |
| `broke` — a case that needed no help was destroyed | 3 | **1.9%** |
| `useless` — neither attempt reached the correction | 103 | **66.0%** |

The blank-retry repair rate is 21.8%: that is the free ceiling `supplied` is measured against, and the
number that stops it being read as the rules' contribution. **Two predictions failed and two held.**
`supplied` ≥ 20% and `kept` ≥ 25% were predicted; 12.2% and 12.8% were measured. `broke` ≤ 15% and a
blank-retry rate in [20%, 60%] held at 1.9% and 21.8%.

**Admission keeps 38 of 296 rules** (252 unsupported, 6 broke their own case, 0 unprobed — V13
reconciled 296/296, and it is blocking). The verified arm answers 350 held-out questions at
**54.00% against 54.00%** — `0.00pp`, p = 1.00, 0.39 rules per question, with 342 of 350 prompts
changed. The 130 questions that actually received a rule scored 56 against 57 (−0.77pp at n = 130);
the 220 that received none differed by one question the other way **on identical prompts**, which is
the sampling noise of a temperature-0.7 client that pairs arms by question rather than by seed. It is
now measured: 36 of 220 identical prompts produced a different statement.

**Where the deficit is.** Two corrections in three cannot be reproduced even with the failure and the
rules distilled from it in the same prompt. That is the extraction, and it is the one place the last
four iterations were not looking — retrieval, budget, injection point and schema boundary were each
measured and each closed. A single correction, read by a model into a sentence, is usually not enough
to reproduce itself; what does survive is too weak to move a different question.

**A blocking gate that could never have passed, found before it cost a dispatch.** The artefact's
`probe.rules` was `summary.rules` — rule *citations* — while the four admission buckets partition
*items*. One correction can distil two rules and one rule can be cited by two corrections, so the
counts diverge in both directions and V13 could only pass in a store where no rule is cited twice.
`rules` is now the store the probe was given, `citations` keeps the other reading, and a unit test
pins the distinction. A stand-in endpoint exercised the arm end to end before the dispatch.

**Green:** `pnpm check` — 1,853 tests, 103 files, coverage 99.98 / 99.60 / 100 / 99.98; the dispatch
1,445 calls, 0 retries, 0 timeouts, 11 minutes, every gate pass including V13 (blocking).

### 122 — The rule travels, and it breaks as often as it repairs

**Question.** R12 put the store on trial and two thirds of the corrections could not be reproduced even
with their own rules in the prompt. It left the product's question untouched: does a rule that *does*
reproduce its own case repair a question it was not written from? Without that number, "the store is
too small" and "the substrate is empty" are indistinguishable, and the next stage is a guess.

**The instrument existed and had never run.** `TransferTrial` and `transferSummary` have been in
`rule-probe.ts` since the probe was written; no run had dispatched them. R13 pointed each admitted rule
at up to eight other *corrected* questions from its own database — a target that was never wrong has
nothing to repair — with the target's blank measured once and reused, which is what makes the draw
affordable. Pre-registration: `prereg/R13-admitted-transfer.md`, written before the dispatch.

**Two defects fixed on the way in.**

1. `TransferTrial.blankCorrect` was a `boolean`, so a control call that never returned was recorded as
   "the retry alone was wrong" — the exact set that makes a repair attributable. A rule that then
   repaired such a target was credited with work nobody measured. The field is `boolean | undefined`,
   both halves must have returned, `transferringItemIds` needs an explicit `false`, and
   `unmeasuredBlank` says how many holes are on the control side.
2. The pairs were written into the fold record, which the artefact does not serialise: the rate would
   have shipped with no rows behind it. `transferLedgerOf` projects them where the artefact reads, and
   `V33-transfer-ledger` is blocking — a file with the summary and not the pairs fails the run.

**Reading** (350 questions, 5 folds, `learn_sample` 128, 2,679 calls, dispatch `41157635856`,
artefact `eval/results/poc-sota-bird-transfer.json`):

| Reading | Value |
|---|---|
| own-case probe | 296 corrected cases: `supplied` 59 (19.9%), `redundant` 40, `broke` 7, `useless` 190 |
| admission | 118 of 576 rules kept; `V13` reconciles 576/576 |
| transfer | 523 trials, 467 informative, **34 repaired — 7.3%** |
| damage | 56 targets needed nothing, **28 broken — 50.0%** |
| net | **+1.15pp** over 523 trials — six trials |
| both gates | 30 rules, 10 items over 350 questions — **0.03 per question** |
| arms | none 53.71%, full 49.14% (−4.57pp, p=0.0070), full-verified 54.86% (+1.14pp), full-transferred 53.71% (0.00pp) |

**Two predictions failed, both in the informative direction.** The rate was predicted ≤6% and measured
7.3%; "at most four rules repair anything" was predicted and thirty did. Single-correction distillation
produces knowledge that generalises — rarely, and with a price the design had never priced at this
resolution: half of the questions that needed no help came back wrong once a rule was in the prompt.

**What the failure of both refutation clauses means.** The pre-registration said ≥15% would send the
next stage to "more data" and ≤1% to "a new substrate". The measurement sits between them, so neither
clause fires and the middle outcome is the finding: repairs and damage are the same order of magnitude.
The arithmetic that follows is small enough to publish — `0.42 rules/question × 7.3% ≈ 0.03 repairs per
question`, against a measured arm of +1.14pp, half the estimate and the same sign.

**Consequence.** R14 changes the substrate rather than growing it: render the pair (question, failed
query, corrected query, failure) instead of a sentence about it, and submit it to the same probe with
the same admission rule. Growth would need two to four times the store for a resolvable cell and would
carry the break side with it.

**One question opened, not answered.** The own-case rate measured 19.9% here against 12.2% in R12. Both
the learn sample (64 → 128) and the correction population changed at once, so the difference is
recorded as a question: does a denser store reproduce more of its own corrections, or is 12% simply the
rate on one population and 20% the rate on another? One dispatch holding the population fixed settles
it.

**Green.** `pnpm check` — 1,860 tests, 103 files, coverage 99.98 / 99.61 / 100 / 99.98; the dispatch
2,679 calls, 1 retry, 0 timeouts, every gate pass including `V13`, `V15`, `V17` and `V33`.

### 123 — The pair reproduces twice as much, and the product does not move

**Question.** R13 ended on a claim about a substrate: a distilled sentence loses the query pair that
made the correction mechanical. The claim was an interpretation of one column, and the alternative had
never been measured with the same instrument — the `repair` distiller renders question, attempt,
correction and observed failure into three sentences and had only ever been measured as a whole pack
(−5.14pp, −4.86pp, −5.71pp across three runs). A reproduction rate and an accuracy delta cannot be
compared, so "the form is wrong" and "the delivery is wrong" were the same sentence with two readings.

**What was built.** `probe-pair.ts`: `compareSubstrates` pairs two probes on the source questions both
stores covered and runs McNemar's exact test over the discordant pairs; `reproducedBy` is the one place
a verdict becomes a boolean; `poolSubstrates` adds the folds and recomputes rates from the summed cells
rather than averaging per-fold rates. `probeMemory` now takes the blank verdicts already measured and
writes back the ones it paid for — the control is the same call under both substrates, and 16.4% of
questions return a different query under the same prompt, so a second control would put that noise
inside the difference. `full-repair-verified` is R12's admission rule applied to the repair store. Five
gates: V34 (cells, rates and delta reconcile), V35 (a small paired set is a direction), V36 (the size of
the exclusion is a reading), V37 (the repair store's buckets reconcile), V38 (its gate changed a pack).
Pre-registration: `prereg/R14-substrate-pair.md`, outcome recorded in the same file.

**Reading** (350 questions, 5 folds, `learn_sample` 128, 2,490 calls, dispatch `41165067200`):

| | rule | repair |
|---|---|---|
| store items | 590 | 303 |
| reproduced its own correction | 30.69% | **53.80%** |
| `supplied` / `redundant` / `broke` / `useless` | 59 / 34 / 11 / 199 | 128 / 35 / 10 / 130 |
| admitted | 118 (20.0%) | 128 (42.2%) |
| items without `scope.domain` | 96 (16.3%) | 32 (10.6%) |
| gated arm | `full-verified` 54.29% (+1.14pp) | `full-repair-verified` 52.86% (−0.29pp) |

Paired: 303 shared, 0 holes, 0 exclusive; both 83, only-rule 10, only-repair 80, neither 130;
**+23.10pp, p = 1.05e-14**. Five folds, five positive deltas (+23.08, +22.95, +22.03, +28.81, +18.64pp),
each p < 0.01.

**All five predictions held, including the one that says the finding is smaller than it looks.** The
substrate delta was predicted ≥ +10pp and is +23.10; `broke` was predicted not to fall and fell by one
case of 303; the gated arm was predicted within ±3pp of no memory and is −0.29pp; the domain omission
was predicted at 8–20% and is 16.3% and 10.6%.

**What the two numbers mean together.** The account reproduces nearly twice as much of what it was
learned from, and an arm built from it answers one question of 350 differently. That is not a
contradiction but the separation this iteration was designed to make: **reproduction is a property of the
extraction; an accuracy cell is a property of what the extraction is worth on questions the store was not
written from.** The first confirms R13's hypothesis at the resolution R13 stated it. The second removes
the hypothesis as the binding constraint.

**Why that is progress rather than a null.** Three content forms have now been measured as arms — a
sentence, a procedure with the case removed, and the pair — and all three are inert within ±3pp, while
the two that were probed reproduce 12–31% and 53.8% of their own corrections. A design that has
eliminated the extraction is one that can no longer spend its next dispatch on distillation, and the
next question is the one R14 cannot answer: whether a store that reproduces twice as much also repairs
questions it was not written from, at better than R13's 7.3% against 50% damage.

**One ceiling measured, not repaired.** 16.3% of the rule store's items carry no `scope.domain` and can
never be pointed at a foreign question; the repair store loses 10.6%. The host knows this value — it is
in the run input the distiller was shown — and the model only echoes it, which is the same class of
defect as `reasonCodeOf` before it was fixed. It is reported here rather than filled, because filling it
changes which rules `full` injects and would make every cell in this file incomparable overnight.

**Green.** `pnpm check` — 1,889 tests, 104 files, coverage 99.98 / 99.61 / 100 / 99.98, `probe-pair.ts`
100 on all four dimensions; the dispatch 2,490 calls, 1 retry, 0 timeouts, every gate pass including
V34, V35, V36, V37 and V38.

### 124 — The pair keeps what it was shown and loses what it was not

**Question.** R14 put a second substrate under the probe and found the largest difference this project
has measured: a pair-rendered repair reproduces 53.80% of its own correction against a sentence's
30.69%, +23.10pp. It also found the arm built from that store inert. The question it deferred is the one
the product turns on: a store that reproduces half of what it was learned from is either knowledge or a
longer lookup table, and the instrument that distinguishes them is R13's — point each admitted item at a
*different* corrected question from the same database. R13 ran it on the sentence (7.28% repair, 50%
damage) and never on the pair.

**What was built.** `full-repair-transferred`, R13's arm for the second substrate. `transferGates` holds
both substrates to the same four checks with the ids as arguments (V39–V42 beside V15/V16/V17/V33),
because a repair measured by a lighter rule cannot be set beside a rule. `transferArtefact` returns a
typed projection that the gates read through `transferGateInput`, so the file and the gates cannot
disagree. Both transfer arms now buy their own probe — `full-transferred` had been consuming one that
only `full-verified` paid for, which would have made a transfer-only dispatch `none` under a second name.
Pre-registration: `prereg/R15-repair-transfer.md`.

**Reading** (350 questions, 5 folds, 3,298 calls, dispatch `41175676367`):

| | sentence | pair |
|---|---|---|
| store items | 580 | 296 |
| reproduced its own corrections | 29.73% | **47.97%** |
| admitted by its own gate | 100 | 102 |
| trials / informative | 416 / 366 | 416 / 354 |
| repaired | 23 (6.28%) | 22 (6.21%) |
| broke a working target | 30 | 32 |
| `break_rate` | 0.600 | 0.516 |
| `net_pp` | −1.68 | −2.40 |
| items left after both gates | 10 of 622 | 19 of 350 |
| arm | `full-transferred` 54.00% (+0.29pp) | `full-repair-transferred` 53.71% (0.00pp) |

Substrate pair, re-measured in the same run: 296 shared, 0 holes, 0 exclusive; both 80, only-rule 8,
only-repair 62, neither 146; **+18.24pp, p = 1.83e-11**, five folds positive. `full` was 51.71% against
53.71% — −2.00pp, p = 0.3105, 14 gained and 21 lost at 1.78 items per question.

**The refutation clause fired, and it was written to end the line rather than weaken it.** 6.21% against
6.28% is 0.07pp on 720 informative trials, smaller than the standard error of either rate. An 18pp
advantage in reproduction buys nothing in transfer. R14 said reproduction is a property of the extraction
and an accuracy cell is a property of the extraction's worth on unseen questions; R15 says the same thing
on the axis that decides deployment, and the two together close the content axis in both directions.

**Two predictions missed, and both were stated on the wrong base.** The informative trial count was
predicted from R13's 467, which came from 98 pointable rules; this run admitted 100 rules of which 78
carried a domain, and the trials follow the pointable set (354). The domain-omission prediction was
written as a share of items and measured against admitted items (24 of 102, 23.5%), which is not the
denominator R14 used for its 10.6% and cannot be compared with it. Both are recorded as written.

**Two instrument defects, found by the dispatch that could not pass them.** The first run
(`41169086124`) measured all five folds and refused its own artefact on neither of its numbers. V17
compared the two-decimal publication of `net_pp` against exact arithmetic to 1e-9 — `(29−27)/483` is
`0.4141...`, published as `0.41` — which only ratios terminating at two decimals could pass. V14/V38
reported "0 of 350" for a probe that ran and an arm that was not named, which reads as "the gate
admitted nothing": the one reading the pre-registration says invalidates the run. Both were fixed, both
have tests, and the facts that exposed them are kept in the prereg's Outcome because they are what the
defect looked like from outside.

**What is left to explain is the delivery.** `full` is negative in both dispatches (−2.00pp, p = 0.31;
−3.71pp, p = 0.02) and every arm that injects fewer items sits above it. The pack layer adds whole
items and this store renders one at 500 to 824 characters, so the existing dose arms — 150, 300, 600,
900 — are `none`, `none`, one item and one and a half: every dose experiment this project could have run
would have found that harm shrinks as the pack empties, which is true by construction. R16 adds
`chars-1800` and `chars-2400` to make the axis 0/1/2/3/4 items, and is pre-registered.

**Green.** `pnpm check` — 1,891 tests, 104 files, coverage 99.98 / 99.61 / 100 / 99.98, `sota.ts` 100 on
all four dimensions. Dispatch 3,298 calls, 1 retry, 0 timeouts, every gate pass including V14, V38, V17,
V39–V42, all four of which failed or could have failed on the first attempt.

### 125 — The harm is at the first item, and no budget can fix it

**Question.** R15 closed the content axis with a tie and R14 closed the substrate axis with a cell that
moved one question of 350. What both left standing is the one number that has never come back positive:
`full` costs −3.71 and −2.00pp on the two dispatches before last, and every arm that injects *fewer*
items sits above it. Those cells differ in content as well as in quantity, so they cannot be read as a
dose response. R16 holds content fixed — same store, same retrieval order, same question — and varies
one number, the character budget the pack layer enforces. The old arms could only look down, and down
was degenerate: 150 and 300 admit nothing, 600 admits one item on a quarter of questions, and only 1,200
admits more than one. Two new arms, 1,800 and 2,400, make the axis 0/1/2/3/4 items.

**What was built.** `chars-1800` and `chars-2400` in `CHARS_ARMS` and the optional arm table; the
`prereg` field written into the artefact's `config` from the dispatch's own input, so a run names the
prediction it is being judged against from inside its own file; new gates V39–V42 arrive with R15 and are
not touched here. Two preregistrations: `prereg/R16-injection-dose.md`, and `prereg/R17-framing.md`
for the iteration this one points at. One instrument repair: `preregGateAgreement` plus a fourth claim in
`bin/protocol.ts`, because this stage's own header was wrong in a way nothing could catch.

**Reading** (350 questions, 5 folds, 2,263 calls, dispatch `41177896801`, artefact
`eval/results/poc-sota-bird-dose.json`; `none` at 54.00%):

| Arm | Items | Characters | ACC | Δ vs `none` | 95% CI | gained / lost | p |
|---|---|---|---|---|---|---|---|
| `chars-600` | 0.29 | 168 | 54.00% | **+0.00pp** | [−1.43, +1.71] | 4 / 4 | 1.0000 |
| `full` (1,200) | 1.83 | 1,080 | 51.43% | −2.57pp | [−5.43, +0.29] | 8 / 17 | 0.1078 |
| `chars-1800` | 2.97 | 1,649 | 50.00% | **−4.00pp** | [−6.86, −1.14] | 6 / 20 | 0.0094 |
| `chars-2400` | 4.16 | 2,212 | 51.14% | −2.86pp | [−6.00, +0.29] | 11 / 21 | 0.1102 |
| `none-replica` | 0 | 0 | 52.57% | −1.43pp | [−2.86, +0.00] | 1 / 6 | 0.1250 |

Nothing on the curve is above `none`. The best arm is the one that injects nothing; the worst is 4.00pp
below it, which is this sample's own minimum detectable effect, so exactly one cell clears its bar and
the spread of the whole curve is the width of the instrument.

**The instrument prediction failed and the failure is the reading.** `chars-600` was registered as a
one-item cell and it is a one-item cell on 100 of 350 questions: the pack layer takes items in rank order,
adds a whole item or stops, and the top-ranked item renders to more than 600 characters on the other 250.
The cell is therefore 71.4% `none` by construction, and at that dilution a per-item cost of −5.0pp or a
per-item gain of +6.0pp both sit inside its interval. The sentence this iteration was written to license —
*the store is not harmful, the default budget is* — cannot be licensed from a cell that is seven parts
control.

**The one-item cell exists, three iterations back.** Iteration 86 ran the same four low budgets against the
same rules-with-the-case store and its `chars-900` reached exactly 1.00 item per question at 718
characters, costing **−3.14pp** on a run whose `full` cell was −3.14pp at 1.87 items — within 0.6pp of
today's 1.83-item cell. Put the two dispatches in one table and the curve is a step, not a slope:

| Items | 0.27 | 0.29 | **1.00** | 1.83 | 1.87 | 2.97 | 4.16 |
|---|---|---|---|---|---|---|---|
| Δ vs `none` | +0.57 | +0.00 | **−3.14** | −2.57 | −3.14 | −4.00 | −2.86 |

Everything above one item sits within 1.43pp across a fourfold range of injected text; the whole of the
step is between 0.29 and 1.00. **The loss is complete at the first item.** That is the refutation clause
arriving by a door the file did not name: it required all points within ±2pp to declare that quantity is
not the variable, and inside one run the spread is 4.00pp, but across the two runs the substance of the
clause holds for every point above one item. The next measurement is not another budget.

**The floor moved, against this run.** Iteration 86's `none-replica` was 3 gained and 3 lost. This run's
is 1 gained and 6 lost — seven discordant questions, −1.43pp, the first clearly negative replica on
record. Everything at or below seven flips is noise here, which is `chars-600` (8) and the replica
itself (7); flatness at 600 is what an unchanged question looks like rather than evidence about one item.
And because `none` is the luckier of two identical prompts, every delta in the table overstates the harm
by up to 1.43pp: the sign of the finding does not depend on it, the size does.

**Four dispatches, one sign.** The default budget has been measured at −3.71pp (p = 0.0192), −3.14pp,
−2.00pp (p = 0.3105) and −2.57pp (p = 0.1078) on four disjoint 350-question draws of this lane. The sign
has held four times and the size has not; the mean is **−2.86pp**, and it is the one number here that has
never come back positive.

**One instrument defect, and it was in this stage's own paperwork.** `prereg/R16-injection-dose.md`
shipped with R15's gate list: seven transfer gates that a dose arm set cannot emit. The file validated,
the run passed its own ten gates, and the two disagreed — the same shape as R12's admission, R13's ledger
and R15's V14/V17, a field that was true when written and silently stopped being true when the thing it
described changed. It is the first instance where both halves of the claim are files in the repository, so
it is the first one that can be checked offline: `preregGateAgreement` compares header and artefact in
both directions, `bin/protocol.ts` pairs every artefact that names a `config.prereg` with its file, and
the check refuses the mismatch that this stage shipped.

**What is left is the item, not the count.** A budget cannot be the fix: the smallest budget that injects
anything already costs what the default costs. Two candidates follow, and only one of them has a mechanism
in the literature — a pack that *chooses* an item that fits rather than taking rank order and stopping, and
a note that says something about its own fallibility. `prereg/R17-framing.md` registers the second:
`full-advisory` (one sentence granting the model standing to ignore a note whose condition does not hold),
`none-advisory` (the sentence with no pack, so a recovery is attributable), and `full-prohibitive` (the
same facts classified as recorded errors, which is MemTrapBench's trauma mechanism run forward).

**Green.** `pnpm check` — 1,897 tests, 104 files, coverage 99.98 / 99.61 / 100 / 99.98, with `prereg.ts`
at 100 on all four dimensions after the agreement check replaced a `??` fallback that could never run.
Dispatch 2,263 calls, 1 retry, 0 timeouts, 0 call failures; ten gates pass and the header that names them
is the one the artefacts are checked against.

### 126 — Permission is not the missing ingredient, and words are not free

**Question.** R16 closed quantity, R14 the substrate, R13 the content, and R11/R12 the position. What
every one of those left standing is the same shape: the block arrives as an assertion the model did not
ask for, with nothing saying when it stops applying. MemTrapBench's mitigation — an inference-time
instruction that restores the reader's standing to disagree — is the last lever in the literature with a
published ablation, and R17 is that lever run on this store: the same pack, the same budget, one sentence
of permission beside it, and the sentence with no pack as the control that makes a recovery attributable.

**What was built.** Three arms in the `SqlArm` union, keyed by a table on the arm itself
(`ARM_STANDING`) rather than by a parameter at the call site, so an arm renders exactly one way and the
rendering can be tested without a database: `full-advisory` appends
`ADVISORY_SENTENCE`; `none-advisory` sends the identical string with an empty pack; `full-prohibitive`
replaces the block's heading with `PROHIBITIVE_HEADING`, classifying the same statements as records of
mistakes rather than as facts about the workspace. One new gate, `V43-framing-delivered`, counts per arm
and per fold how many prompts carried the framing the arm declares and fails in both directions — a
declared arm that misses one prompt is its own control under a second name, and an undeclared arm that
carries one has the tables disagreeing. The pre-registration was amended **before** the dispatch, because
R16 had just measured this lane's resolution at 4.00pp and four of its clauses were written at 1–2pp.

**Reading** (350 questions, 5 folds, 2,110 calls, dispatch `41185616121`, artefact
`eval/results/poc-sota-bird-framing.json`; `none` at 54.86%, `full` at 50.86%):

| Arm | Items | Characters | ACC | Δ vs `none` | 95% CI | gained / lost | p |
|---|---|---|---|---|---|---|---|
| `none-advisory` | 0 | 0 | 52.86% | −2.00pp | [−4.00, +0.00] | 3 / 10 | 0.0923 |
| `full` | 1.81 | 1,078 | 50.86% | −4.00pp | [−7.14, −0.86] | 9 / 23 | 0.0201 |
| `full-advisory` | 1.81 | 1,078 | 50.29% | −4.57pp | [−7.71, −1.71] | 7 / 23 | 0.0052 |
| `full-prohibitive` | 1.81 | 1,078 | 49.71% | −5.14pp | [−8.29, −2.00] | 7 / 25 | 0.0021 |

Paired against `full`, which is what the decision rule was written on: `full-advisory` **−0.57pp**
[−3.14, +2.00] p = 0.832; `full-prohibitive` −1.14pp [−4.00, +1.71] p = 0.541; `none-advisory` +2.00pp
[−1.14, +5.14] p = 0.281.

**The refutation fired, and it was written to be able to.** The amended clause required the interval on
`full-advisory` − `full` to have an upper bound below +2.5pp before framing could be called not-the-channel;
the bound is +2.00pp. So the sentence does not recover the block's cost, and the datum excludes any
recovery large enough to have been worth writing it. This is the third time a pre-registered refutation
has fired in this record, and the first time the refuting interval was pre-registered as well.

**The sentence has a price, and it is the size of the effect it was meant to buy.** `none-advisory` sits
2.00pp below no memory (p = 0.0923). Four dispatches put the default block's cost at −2.86pp; a paragraph
of instruction against a block of 1,078 characters cost 2.00pp on its own. The two costs do not add —
pack plus sentence would be −6.00pp and the cell is −4.57pp, so the interaction is +1.43pp — and this
lane cannot resolve an interaction that size, so the honest reading is the simpler one: **in this prompt,
words cost about what the note costs.** That is a general statement about mitigations, and it is the
one result here that changes how the next mechanism is chosen: anything that repairs the harm by adding
text has to clear a bar as high as the harm.

**The register is not the harm.** `full-prohibitive` classifies the same 1.81 items as recorded failures
and lands 0.57pp below the advisory cell (1.14pp below `full`), inside its interval. MemTrapBench's
trauma mechanism, run *forward* — if a memory that records an error makes a model over-cautious, saying
so should hurt more — produced a direction and no size. What the block says about itself is not what
makes it expensive.

**`full` is negative again, and significant on its own for the third time.** The five draws at the
shipped budget read −3.71, −3.14, −2.00, −2.57 and −4.00pp: one sign, five draws, mean −3.08pp. Six
axes have now been varied one at a time with a matched store, matched characters and matched questions,
and every one of them left the sign alone.

**The instrument passed the check built for it.** `V43-framing-delivered` reports
`none: 0/350, full: 0/350, full-advisory: 350/350, none-advisory: 350/350, full-prohibitive: 350/350`.
This is the first run in this record where a prompt-level treatment's *delivery* is itself a gate — and
it was built because this stage's own defect history (R12's admission, R13's ledger, R15's V14/V17, R16's
wrong header) is a history of fields that were right when written.

**Where the next iteration went, and why it is not where the clause pointed.** The refutation named
selection as the successor. R16, written into this record one iteration earlier, measured that the loss
is complete at the **first** item, so choosing *which* item arrives cannot remove a cost the first item
already incurs; selection is cancelled by evidence rather than by preference. What the record does
support is the opposite shape — the note as an objection to a draft the model has already written —
which is the only mechanism here with a positive sign: `full-anchored`, +2.86pp against `full` pooled
over 700 questions at p = 0.0205 (24 lost, 44 gained), and indistinguishable from no memory in the run
that measured it. It was never measured against a second pass with no pack. `full-onretry` shows what
that omission costs: once `retry-blank` existed, the note's contribution at retry was **zero**, and
`retry-keyed` — the right note, by the right key, at the right moment — was identical to the blank
retry question for question.

**So R18 is a control, not a new idea.** `prereg/R18-anchored-control.md` registers `anchor-blank`: the
same draft, the same revision request, no pack and no instruction about one. `full-anchored` −
`anchor-blank` is the note's contribution at anchor. Either the second pass owns the +2.86pp and the
record's only positive number is demoted in that commit, or the note earns it at exactly one moment —
and both outcomes are pre-registered, with the resolution (this lane separates ~3pp on a paired
difference) stated before the run.

**Green.** `pnpm check` — 1,919 tests, 104 files, coverage 99.98 / 99.61 / 100 / 99.98, `sota.ts`,
`prereg.ts` and `distill/*` at 100 on all four dimensions. Dispatch 2,110 calls, 5 retries, 0 timeouts,
0 call failures, eleven gates pass and the header that names them is the one the artefact is checked
against.

### 127 — The second pass is not free, and the note is worth the permission it carries

**Question.** R17 left exactly one mechanism in this record with a positive sign: `full-anchored`, the
pack delivered as an objection to the model's own draft in a second call, **+2.86pp against `full`**
pooled over 700 questions (p = 0.0205). It had been measured against `full` and never against a second
pass with no pack, and this project already knows what that omission costs — at retry, once
`retry-blank` existed, the note's contribution was zero. R18 is that control: the same draft, the same
revision request, nothing added.

**What was not built.** No new arm beyond `anchor-blank`, no new gate. The two gates that could
disagree with the arms already existed: `V43-framing-delivered` is inactive here (no arm declares a
standing, and a standing in this pair would put a second sentence about the same block into a cell
whose variable is the block) and `V44-domain-accounted` reconciles the store's domain-free items
against the two paths that produce them. `anchorPromptFor` already rendered the empty pack as no
block *and* no instruction about one, so the two arms differ in one block of text and nothing else.

**Reading** (350 questions, 5 folds, 1,762 calls, 6 retries, 0 timeouts, 0 call failures, eleven gates
pass, dispatch `41188122217`, artefact `eval/results/poc-sota-bird-anchor.json`; `none` at 54.00%):

| Arm | Items | Characters | ACC | Δ vs `none` | 95% CI | gained / lost | p |
|---|---|---|---|---|---|---|---|
| `anchor-blank` | 0.00 | 0 | 50.00% | **−4.00pp** | [−7.43, −0.57] | 12 / 26 | 0.0336 |
| `full-anchored` | 1.85 | 1,088 | 54.00% | **+0.00pp** | [−1.71, +1.71] | 4 / 4 | 1.0000 |
| `full` | 1.85 | 1,088 | 53.43% | −0.57pp | [−3.14, +2.00] | 10 / 12 | 0.8318 |

Paired exact McNemar, which is the comparison the iteration was registered on: `anchor-blank` − `none`
**−4.00pp** (38 discordant, p = 0.0336); `full-anchored` − `none` +0.00pp (8 discordant, p = 1.0000);
`full-anchored` − `anchor-blank` **+4.00pp** (27 gained, 13 lost, 40 discordant, p = 0.0385).

**The first registered prediction is refuted and the refutation is the finding.** `anchor-blank` was
predicted 1 to 3pp *above* `none`, on the grounds that a second look at the same question is worth
something — at retry it had been worth about a point. It came back **4.00pp below**, with one sign in
all five folds (−7.14, −4.29, −2.86, −4.29, −1.43pp). Being shown your own draft and asked to revise it,
with nothing added and nothing saying the draft may stand, costs about what the note costs: the same
−4.00pp `full` itself produced in R17. A revision request is not a free look at the question, and the
corpus of "second pass" results in this project — `retry-blank`, `full-onretry` — does not transfer to
the anchored position, because those second passes carry a failure rather than a draft.

**The note buys back exactly what the revision took, and therefore buys nothing.** `full-anchored` sits
at *exactly* no memory (54.00% on both arms, 8 discordant pairs) while `anchor-blank` sits 4.00pp under
it, so the cell this record has credited as its only gain is a repair: put the note into a blind
revision and the loss disappears, leaving no surplus. Read against `full` in the same run, the anchored
arm is +0.57pp, not the pooled +2.86pp — those dispatches compared it against a `full` that was itself
costing −4.00pp in one of them, so most of the published gap was the harm injection does rather than a
benefit anchoring confers. Both statements are true and only one of them is about the note.

**What is left is a two-way ambiguity, and it is measured next rather than argued.** `anchor-blank`
lacks two things relative to `full-anchored`: the block, and the block's closing clause — "if none
applies, return the first attempt unchanged" — which `anchorPromptFor` deletes along with the block
because an instruction that refers to an absent block is a different question. R18 cannot separate
them, and the reading that survives its numbers is the one that makes a testable claim: *the note at
anchor is worth the permission it carries to stop.* So this iteration also ships the instrument for
R20, a 2×2 over (block) × (instruction):

|  | conservative clause | permissive clause |
|---|---|---|
| **block** | `full-anchored` | `full-anchored-hold` |
| **no block** | `anchor-blank` | `anchor-hold` |

`AnchorMode` gains `hold` — *"change the first attempt only if it is wrong, and only in the way that
makes it right. If it already answers the question, return it unchanged"* — which is addressed to the
draft rather than to items, and therefore renders when the pack is empty; the other two modes stay
suppressed on an empty pack. That one predicate is the whole implementation, and it is what makes the
permission a cell instead of an absence. `prereg/R20-anchored-hold.md` registers the four cells with
`none` and `full` as anchors: the confirmatory claim is `anchor-hold` − `anchor-blank` (+3 to +5pp,
paired), the product claim is `full-anchored-hold` ≈ `full-anchored` within ±2pp, and the interaction is
reported with its interval and not tested, because four cells at 350 questions do not give this lane the
resolution for one.

**`full` broke its own streak, and the record keeps the draw.** It was predicted around −3pp for the
seventh consecutive dispatch and came back −0.57pp [−3.14, +2.00], p = 0.8318 — the sign held, the size
did not, and this is the first of six draws at the shipped budget that is not distinguishable from zero.
Nothing in this iteration touched its prompt, so the reading is that five draws with a −3.08pp mean have
a spread wide enough to produce one of these (six-draw mean −2.67pp); it is recorded because a record
that reports only the draws that agree with its own average is not a record.

**The instrument answered a question it was built for and nobody had asked.** `V44-domain-accounted`
reports `184 item(s) with no domain, 184 arrived unscoped, 0 widened`. The inequality it checks is an
equality only because one of its two paths is doing all the work: **not one domain-free item in this
store became domain-free by generalisation widening a scoped claim.** The 14.6% of the store without a
domain is the interpreter declining to scope at the door, so the fix is a prompt change and not a
tightening of the widening policy — which is the decision the single number could not support four
iterations ago and the four numbers can.

**Green.** `pnpm check` — 1,924 tests, 104 files, coverage 99.98 / 99.61 / 100 / 99.98, `sota.ts`,
`prereg.ts` and `distill/*` at 100 on all four dimensions. Dispatch 1,762 calls, 6 retries, 0 timeouts,
0 call failures, eleven gates pass, and the prereg agreement check now covers twelve files —
`R20-anchored-hold.md` is validated against the arm union before its first run, which is the first time
a registered design has been type-checked before being dispatched.

### 128 — The licence and the note are substitutes, and the note is worth about a point

**Question.** R18 left two things varying at once. `anchor-blank` (revise, nothing added) costs 4.00pp
against no memory and `full-anchored` (revise, note, and the clause "if none applies, return the first
attempt unchanged") sits at no memory — but the control lacks the block *and* the clause, so the +4.00pp
could be either. R20 is the 2×2: the permissive clause says the same thing without referring to items,
so it renders on an empty pack and the square closes.

**What was built.** `AnchorMode` gains `hold`; two arms use it (`full-anchored-hold`, same block and
permissive sentence; `anchor-hold`, no block and permissive sentence). The render predicate is one line —
`input.pack === '' && mode !== 'hold' ? '' : ANCHOR_INSTRUCTION[mode]` — and it lives in the builder
because "this instruction names a block" is a property of the instruction, not of whoever calls it. No
new gate; R20's prereg is validated against the arm union before dispatch, which is the first time a
registered design has been type-checked before it was run.

**Reading** (350 questions, 5 folds, 2,460 calls, 8 retries, 0 timeouts, 0 call failures, eleven gates
pass, dispatch `41190894667`, artefact `eval/results/poc-sota-bird-square.json`; `none` at 54.57%):

| Arm | Items | ACC | Δ vs `none` | 95% CI | gained / lost | p |
|---|---|---|---|---|---|---|
| `anchor-blank` | 0.00 | 50.57% | −4.00pp | [−7.43, −0.57] | 12 / 26 | 0.0336 |
| `anchor-hold` | 0.00 | 52.57% | −2.00pp | [−4.57, +0.57] | 7 / 14 | 0.1892 |
| `full-anchored` | 1.83 | 53.43% | −1.14pp | [−3.14, +0.86] | 4 / 8 | 0.3877 |
| `full-anchored-hold` | 1.83 | 52.86% | −1.71pp | [−4.57, +1.14] | 9 / 15 | 0.3075 |
| `full` | 1.83 | 50.29% | −4.29pp | [−7.43, −1.14] | 8 / 23 | 0.0107 |

The edges, paired exact McNemar: clause without block **+2.00pp** (15/8, p = 0.2100); clause with block
**−0.57pp** (7/9, p = 0.8036); block under the conservative clause +2.86pp (26/16, p = 0.1641); block
under the permissive clause +0.29pp (15/14, p = 1.0000).

**The interaction has the opposite sign to the prediction and it is the result.** The clause was expected
to matter more with a block in front of it; it matters only without one, so the interaction is −2.57pp.
The reading is substitution rather than failure: `full-anchored`'s conservative instruction already ends
with a licence to stop, so an explicit one changes nothing, and where there is no block the explicit
sentence is the only licence in the prompt. **Adding a second sentence to a prompt that already contains
the first is not a second improvement** — which is the same wall the word tax put in front of R17, seen
from the other side.

**The confirmatory claim is half-confirmed and the registered size is missed.** `anchor-hold` −
`anchor-blank` was registered at +3 to +5pp and is +2.00pp at p = 0.2100. The refutation clause (within
1pp of the blind revision) does not fire, so the permission does something; but at this n the direction
is all that is established.

**The product claim fired and a sentence is dropped.** `full-anchored-hold` − `full-anchored` = −0.57pp,
inside the ±2pp band registered before the run. Where a note is present the explicit permission is
decoration: 143 characters, half a point in the wrong direction. The shipped anchored prompt keeps the
clause it already had and gains nothing.

**The blind revision reproduced to the question.** `anchor-blank` is −4.00pp again — 12 gained, 26 lost,
38 discordant, p = 0.0336 — against 12/26/38/p = 0.0336 in R18, whose fold learn produced 648 corrections
against this run's 640 and 184 domain-free items against 168. Both accuracies moved by two questions and
the paired counts did not move at all. Over both dispatches the block is worth **+3.43pp against a blind
revision, 53 gained and 29 lost on 700 question-pairs, p = 0.0106** — real, and 0.57pp smaller than the
first reading.

**What the square says about the note's content, which is not much.** `full-anchored` − `anchor-hold` is
+0.86pp: the part of the anchored effect that is knowledge rather than permission. Seven axes have been
varied on this store and the only movement this record has produced in a positive direction is a sentence
telling the model it may leave its answer alone.

**`full` came back.** −4.29pp at p = 0.0107, the fifth significant draw of seven at the shipped budget
(−3.71, −3.14, −2.00, −2.57, −4.00, −0.57, −4.29; mean −2.90pp). R18's −0.57 was the outlier.

**Green.** `pnpm check` — 1,924 tests, 104 files, coverage 99.98 / 99.61 / 100 / 99.98; the protocol check
validates `prereg/R20-anchored-hold.md` against `eval/results/poc-sota-bird-square.json` at eleven
declared gates, every one emitted and none unannounced.

## What is left, in order (current)

The six axes are closed — content, quantity, position, substrate, framing, and now the delivery order
itself — and the store has no positive result left except one that is really a repair. What remains
separates experiments that are registered from work that waits on something outside this repository.

| # | Item | State | Blocks |
|---|---|---|---|
| 1 | **R21 — utility clearance** (MeClear) | registered, not built; the only candidate that adds **no** prompt text, and prompt text is now measured three times (2.00pp for the advisory sentence, −0.57pp for the explicit licence, 143 characters spent) | the next result |
| 2 | **R19.1 — reconstruction at anchor** (MemHarness) | not built; pays the word tax before it earns anything, and R20 measured a second sentence at zero or worse wherever a first one exists | — |
| 3 | **R19.3 — adaptive injection** (ε-MemEvo) | not built; `gated` and `full-corroborated` are static filters, not per-question decisions | the gate's inputs, which the pool already collects |
| 4 | **The interpreter's domain prompt** | decision confirmed twice: `V44` reports 184/184 and 168/168 domain-free items arrived unscoped, 0 widened in either run | the ceiling on every transfer number |
| 5 | **S1a — ambiguity on public annotations** | unblocked and unbuilt (BIRD-Interact carries the annotations) | — |
| 6 | **S1b — the private chart vocabulary** | blocked on the 1,300-case set, two annotators, κ ≥ 0.7 | the only part of S1 public data cannot substitute |
| 7 | **S3 — the SOTA push** | gated by its own rule: it starts only if S2b moves accuracy, and S2b's gate was missed | R10-family work, not a bypass |
| 8 | **Cortex release (W1)** | excluded from this programme by the owner | a decision, not a task |
| 9 | **vitest 4 (W2)** | blocked on the toolchain: it lands when vite 7 is the default | — |

Items 1, 2, 3, 4 and 5 are ours to run. Items 6–9 wait on an annotation set, a gate, a decision and a
toolchain respectively. None of them blocks the S0 result, and none is hidden behind the green build:
each is either an experiment that has not run or a dependency that has not shipped.

**What this list changed this iteration.** The anchored delivery order is now the best cell this record
has and it is still 1.14pp below no memory; the part of it that is knowledge is about +0.86pp and the
part that is permission is about +2.00pp. So the next mechanism is chosen for being the one that adds no
text at all, and the sentence that would have been added to the shipped prompt is not added.
