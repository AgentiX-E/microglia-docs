# Audit report

An audit of the claims this project makes, not of the code's style. For each claim: how it was verified,
what the verification can and cannot support, and what would falsify it. Written after the S0 exit gate
and rewritten twice since: once when the public lane returned a negative result, once when the pipeline
design was audited against the ten product requirements.

Audit date: **2026-10-21**. Repository under audit: `AgentiX-E/microglia` at `master` (`c55cff1`),
**448 tests**, coverage **99.77 / 99.77 / 100 / 98.42** (lines / statements / functions / branches).

**Evidence classes.** Every row carries one, because a number from a secondary report and a number from
our own artefact are not the same kind of thing:

| Class | Meaning |
|---|---|
| **M** | measured by us, live model calls, artefact committed |
| **A** | derived by replaying a committed artefact (no new calls) |
| **D** | deterministic: a unit test asserts it, no statistics involved |
| **R** | reported by a third party (paper, vendor, secondary coverage) — **never** used as a product claim |

## 1. Claims and their instruments

| # | Claim | Instrument | Verified | What it cannot support | Class |
|---|---|---|---|---|---|
| C1 | Feedback becomes knowledge that transfers to unseen questions | 9-arm study, 280 paired held-out questions, exact McNemar | **yes** | anything about a real model on a real product; the reader is deterministic | D |
| C2 | A domain that never received feedback improves, because rules widen | same study, `ops` excluded from every feedback batch | **yes**: 100.00% vs 32.86% | that a *different* unseen domain would behave the same; only one was held out | D |
| C3 | Quarantine is load-bearing | `unguarded` arm, identical poison, ceiling removed | **yes**: −17.86pp | that no other defence could achieve the same; only this one was ablated | D |
| C4 | Labelling noise is absorbed | `noise` arm, 20% of corrections point at a wrong chart | **yes**: +68.21pp, no loss | robustness beyond 20%; the noise model is uniform, not clustered | D |
| C5 | Credit assignment stops a rule that is always wrong | micro-ablation: one rule cited in 4 failing runs | **yes**: withdrawn vs injected | the exact number of failures a host should tolerate | D |
| C6 | Contradiction resolution halves prompt spend on conflicts | micro-ablation: two trusted claims, same scope | **yes**: 1 active / 429 chars vs 2 / 717 | an accuracy effect; with two rules the answer depends on the tie-break | D |
| C7 | Diversification buys coverage | micro-ablation: 12 paraphrases + 3 distinct, equal relevance | **yes**: 4 distinct vs 1 | behaviour under real, unevenly relevant stores | D |
| C8 | A pack never carries a rule it did not render | budget sweep, 64 budgets × 40 rules | **yes, after a fix** | nothing; the invariant is asserted at every budget | D |
| C9 | A strong model already knows generic chart grammar | live POC, DeepSeek, 42 generic cases | **yes**, 3 runs: 90.48% → 88.10–90.48% | other models; one provider was tested | M |
| C10 | Organisational convention is what the pack adds | live POC, 28 house cases | **yes**, 3 runs: 0% → 75.00–89.29% | that 75% is enough for a customer; the conventions are synthetic | M |
| C11 | Free-text corrections distill into typed lessons | live POC, 24 events, shipped prompt and parser | **yes**, 3 runs: 91.67–95.83% mark, 95.83–100% intent | quality on ambiguous or multi-lesson comments | M |
| C12 | Injection attempts do not become active rules | same POC, 3 adversarial comments | **yes**, 3 runs: 0 active of 3 | resistance to a determined, adaptive attacker | M |
| C13 | BM25 is the right default; dense is the right exception | live POC, 96 query–rule pairs, Zhipu `embedding-3` | **yes**: light 58.33% vs 54.17%; heavy 20.83% vs 29.17% | other embedding models; one was tested | M |
| C14 | CPU retrieval is viable at 10k rules | scale POC, 3 sizes × 100 queries, 3 runs | **yes**: p95 2.6–3.1 ms, heap 14 MB | 100k, where the O(n) scan is expected to cross the budget | M |
| C15 | The projection matches cortex's real `MemoryValue` | clone + build + field-by-field comparison in CI | **yes**: 12 fields matched | cortex's runtime behaviour; only the projection shape is checked | D |
| C16 | No knowledge crosses a namespace | study probe with a foreign namespace | **yes**: 0 hits over 50 questions | cleverer leaks through shared ids; ids are namespaced by construction | D |
| C17 | Every published number is reproducible | `pnpm bench` writes the artefact; the report is rendered from it | **yes** | numbers quoted from a commit other than the one under audit | D |
| C18 | The governance layer, not the retriever, produces the lift | competitor-shaped fact store on the same corrections, clean and poisoned | **yes**: 56.07% vs 100.00% (+43.93pp), and **19.64% under poison** | other competitor designs; one shape was replicated | M |
| C19 | **The first public read (+3.33pp at n=30) was noise** | full cross-fit of all 352 usable questions, 5 folds, exact McNemar | **yes, it is retracted**: the same protocol on the full sample gives **−2.84pp**, no fold positive | that no effect exists at any sample size; only that this one was not measurable at n=30 | M |
| C20 | On unmodified BIRD the pack is inert | four reads (−2.84, −1.14, −0.57, −0.28pp), every interval containing zero while the instrument improved | **yes** | other datasets; this one's gold restates its schema | M |
| C21 | The pack is read but not needed there | five arms over the same frozen stores: full −1.14, duplicate −2.27, wrong-scope −1.42, **oracle +30.97pp** | **yes** | that another lesson shape would also be inert; only these were tested | M |
| C22 | A relevance floor does not recover the delta | `gated` arm at `minCoverage 0.01`: 2.27 → 2.06 rules/question, Δ −0.57 → −0.28pp | **yes** | stronger floors, which empty the pack — V6 refuses that run | M |
| C23 | A convention the schema cannot reveal is transferred | BIRD single-number subset, round-to-ten, 5 folds, twice | **yes in direction, not in magnitude**: +4.79pp (p=0.016) then +2.05pp (p=0.250); **10 gained, 0 lost** pooled | a stable effect size; the runs share questions and the pooled ratio is not independent | M |
| C24 | Distillation loss is 7.0% at full scale | reply prefix recorded on failure; three successive fixes measured | **yes**: 25.7% → 5.0% (probe) → **7.0%** (71 of 1,009, full run) | other models; the 40-question probe under-counted by 40% | M |
| C25 | Packs are lexically **addressed** to their questions, so coverage is not the constraint | per-case coverage recorded on 352 questions, recomputed from the same artefact | **yes**: median **18.2%**, p90 35.3%, **3.1% share no content word**; 99.7% of questions have an active rule sharing a term | that the *selected* rule is the right one; selection is the open question (POC-17) | A |
| C26 | The pack, not the model, dominates token cost | cost model derived from the recorded artefact | **yes**: 2,383 tokens per arm-evaluation; a 1,200-char pack ≈300 tokens = **26%** of the median question's 1,133 | other hosts; the ratio depends on their prompt size | A |
| C27 | Counting endorsements as events inflates admission against counting distinct tasks | closed-form `wilsonLower` under both rules, k = 1…8, against `activationThreshold = 0.6` | **yes**: 2.95× at six endorsements; one task's six attempts reach activation (0.610), one task alone bounds at 0.207, six distinct tasks are what an all-positive claim needs | that a host with many *honest* attempts behaves the same; the bound is about independence, not intent | **D** |
| C32 | On 1,300 cases with policy-derived gold, the loop moves top-1 by more than its own noise floor | L0 (`pnpm eval:l0`): 1,040 paired held-out questions, exact McNemar, bootstrap interval, resolution computed from the observed discordance | **yes**: 32.12% → 100.00% (+67.88pp, 95% CI 65.10–70.67, p = 5.9e-213, 706 gained / 0 lost), unseen domain 100% | the *size* of the effect on a real workload; the corpus is the controlled one, and the 3pp resolution the lane was specified at is **withdrawn** — at 68% discordance it needs 5,922 evaluated cases, and the lane has 1,040 | **D** |
| C33 | Recording a failed attempt before the correction teaches something the correction alone does not | L2b (`pnpm eval:pairs`): two arms, two teaching rounds, 2 revised conventions, 8 held-out questions, 75% reachable | **no**: both arms 87.50% against a 12.50% baseline, delta 0.00pp at a 0.05 bar, and **0 rules differing** between the two stores. The lever fires — both arms correct 2 of 2 revisions from a rule that is now wrong, 2 of 7 corrections cite a rule — so the null is measured | that the *mechanism* is useless: a correction landing on a scope where an active rule disagrees already records a contradiction, and the ablation shows it demotes the rule even when the corrected run cited nothing. What the pair adds uniquely is a `negative` lesson, which the deterministic reader has no channel for | **D** |
| C31 | An abstention is learned, promoted and rendered so the model stops inventing answers | end-to-end: two corroborating abstentions reach the pack with the "do not invent" instruction, one does not, and a confident rule silences it | **yes**: 6 tests, `rules.ts` 100 across, `pack.ts`/`render.ts` 100 across | that the model obeys the instruction; the rendering is measured, the compliance is POC-30 | **D** |
| C30 | Prose alone cannot activate a rule, and a measured signal can promote one | unit tests over `createKnowledgeItem`/`mergeEvidence` plus an end-to-end clarification flow | **yes**: one clarification → `candidate`/`needs-corroboration`; a second distinct task → `active`; an edit still activates on its own; an item written before the field existed is exempt | that a host cannot forge a tier: it is derived from the event kind, not passed in | **D** |
| C29 | Curation merges near-duplicates deterministically and retires only what it was told to | unit tests: merge/scope/kind boundaries, idempotent second pass, dry run writes nothing, density-ranked prune, option validation | **yes**: 16 tests, `curate.ts` at 100 / 97.26 / 100 / 100 | that a real store's duplicates look like these fixtures; the threshold is conservative by design and adjustable | **D** |
| C28 | The shipped score counts a task once, whatever its attempt count | unit test: six merged observations from one task score identically to one; six distinct tasks score higher; evidence without a task keeps the old behaviour | **yes**: equal to 1e-9 for the one-task case, +0.05 or more for six tasks, and no change for task-less callers | that a host declares tasks correctly; the grouping is only as good as the `taskId` it is given | **D** |

## 2. Defects found and fixed during these audits

An audit that finds nothing is an audit that did not look. Sixteen defects were found by writing invariants
down as tests, by recording a failure's cause instead of its message, or by recomputing a published number
from the artefact it claimed to come from.

| # | Defect | How it surfaced | Impact had it shipped | Fix |
|---|---|---|---|---|
| B1 | `makePack` returned candidate items with an empty rendered block | the budget invariant failed on its first run | a host applying `items` would inject rules the model never saw; the study reported 100% on an empty prompt | filter `items` to the rendered ids |
| B2 | A redaction counter counted structural changes, not redactions | a test asserted "no secret, no redactions" | every edit on a nested object reported 4 redactions — an audit signal that lied | count changed string spans |
| B3 | `Infinity` timestamps became `null` on reload | a reopen test asserted `validUntil === Infinity` | `NaN` confidence after restart → every reloaded rule silently inactive | `rehydrateKnowledge` |
| B4 | The second budget pass was dead code | coverage showed the loop body unreachable | a guarantee that was never exercised; the header-count theorem was wrong at >99,999 items | proved the bound, added an explicit size limit |
| B5 | `no-generalization` widened onto unadmitted candidates | the gate on the unseen domain moved when the target rule changed | rules promoted before earning admission | widen only onto an active rule |
| B6 | The distillation parser accepted one of the four shapes models actually return | recording the reply prefix after a 25.7% failure rate survived a larger token budget | a quarter of all corrections never reached the pack, and *which* quarter was decided by formatting | accept a wrapped object, a bare array, a single candidate; repair control characters and trailing commas |
| B7 | A control arm injected nothing and looked like evidence | gate V6 refused a run whose `narrow` arm reported 0.00 rules per question | a second baseline wearing a control's name | duplicate the pack instead; V6 blocks any pack control with zero injections |
| B8 | The channel gate asked a sentence-only arm for rules per question | V6 failed a run whose every other reading was sound | a sound positive result reported as a failed run | V6 covers only the controls that retrieve |
| B9 | A 40-question probe's coverage distribution was published as the 352-question result (median 7.1%, 47% zero versus the real 18.2%, 3.1%) | recomputing from the committed artefact during a design audit | a false premise drove a design decision (the alias) and a false causal claim ("retrieval is the constraint") | numbers now carry their n and their run id; §17.31 forbids quoting a probe at full scale |

| B10 | Curation summed the two items' `support` when merging near-duplicates | writing the evidence invariant down as a test: two items citing one `feedbackId` merged to 1.8 support instead of 0.9 | one user's single correction paid for two rules and admitted their sum — the evidence route of MemForm, reached by arithmetic rather than by an attacker | support is the mass of *distinct* observations; the merged evidence array is ordered by `(at, feedbackId)` so arrival order cannot leak into the store |
| B15 | The HTTP surface had no delete route | asking what a host running the server does with a deletion obligation | the SDK could erase and the server could not, so the server was unsellable to any host with one | `POST /v1/forget`, validating the selector and refusing typos |
| B16 | `parseIngest` dropped `taskId`, `attempt` and `parentRunId` | the forget-by-task test returned 0 events | every HTTP event was its own task: support inflated three-fold per job, and `forget({ taskId })` matched nothing | the fields are parsed, validated and carried into the run and the event |
| B12 | A distilled candidate could cite any event id as its own evidence | writing the evidence route of POC-29 as an executable attack | a claim buys the support of a trusted correction it never came from — poisoning with no false record anywhere | a candidate must cite the event being interpreted; a mismatch is rejected and counted (`rejectedBorrowed`) |
| B13 | Curation merged paraphrases whose payloads disagreed | the selection route: a paraphrase that says the opposite of the rule it borrows | the survivor's payload inherits the loser's evidence, so the false rule wins *with* the trusted support | the payload is part of the merge identity |
| B14 | Widening absorbed evidence from quarantined or still-candidate siblings | the scope route: an unadmitted paraphrase riding a trusted rule into a broader scope | applicability bought from evidence the store had already refused | only an `active` claim may endorse a widening |
| B11 | `canGeneralize` compared task, intent and field but ignored `schemaDigest` and `reasonCode` | deriving the widening bound as the meet of the endorsing scopes instead of a list of field comparisons | a claim learned under one schema widened onto another, keeping the target's digest and absorbing evidence it never had — G2's fabrication with a citation, reintroduced through the widening path | the meet is computed, and a fixed dimension that only some endorsers constrain refuses the widening |

Two more were found earlier and are recorded in the technical design: the payload-shape omission that made
LLM distillation produce 0% correct payloads, and the corpus generator that silently skipped a malformed
domain instead of failing.

## 3. Hypotheses taken from third parties (class R)

Design inputs, never claims. Each names the POC that would make it ours.

| # | Hypothesis | Source class | Status | What would verify it |
|---|---|---|---|---|
| H1 | Rules distilled from an agent's own successes and failures lift τ²-retail pass^4 from 57.5% to 67.5%, and ≥3 distinct tasks beats a larger rule set on airline | **R** (IBM report, via secondary coverage) | not reproduced | POC-32, same split, our own arms |
| H2 | A rule-forming memory is poisoned through content, evidence, scope, selection and path; the best known defence recovers only 8.2pp | **R** (2026 paper, via secondary coverage) | not reproduced | POC-29, five routes × six defences |
| H3 | Query-only interaction injects a memory record at ~98% success and steers later answers at ~77% | **R** (NeurIPS 2025, via secondary coverage) | not reproduced | POC-29's content and evidence routes |
| H4 | Per-item keywords/tags are why one memory architecture beats naive retrieval on distractor-heavy sets | **R → refuted at source** | A-MEM's `search()` scores dense distance on `content` and never reads `keywords`; the field is produced by `analyze_content`, which `add_note` does not call. The alias (D8) therefore stands on our own C25, not on this hypothesis | POC-33 |
| H5 | A one-hop walk over typed edges buys ~7% on associative recall | **R** (ICML 2025); mechanism confirmed at source | **rejected for the default path** (D10): `rerank_facts` makes an LLM call per query and graph search is skipped when no fact survives, which a CPU-only zero-call default cannot afford | POC-17b, host-funded only |

## 3.1 Corrections forced by reading source

Two things this report previously asserted on secondary evidence did not survive the source, and both were
doing design work. They are recorded here rather than silently edited, because a register whose errors are
invisible is a register nobody should trust.

| Was asserted | What the code does | Correction |
|---|---|---|
| A-MEM's retrieval edge comes from per-item keywords/tags | `AgenticMemorySystem.search()` returns ChromaDB distances over `content`; `keywords` is in the result payload but not in the scoring path, and `analyze_content` is not called by `add_note` | the alias decision (D8) keeps its mechanism but loses its citation; the rationale is our own 47%-zero-coverage measurement (C25) |
| Graph expansion (PPR) is a cheap deferred option | `HippoRAG.retrieve()` calls `rerank_facts` (an LLM filter) per query and falls back to dense retrieval when no fact survives | D10 moves from *deferred* to *rejected for the default path*; it may only return where the host already pays for a per-query model call |

| A 47% zero-overlap rate made retrieval the binding constraint | replaying the artefact gives 3.1%; the 47% was the n=40 probe with `minCoverage = 0.34` | the causal claim is withdrawn, the alias is rejected, and the constraint is re-stated as *selection* among ~186 rules |

A third finding was not a correction but a confirmation: LangMem's `enable_deletes = False` default matches
our decision to ship with pruning off (D5), and its `ReflectionExecutor(after_seconds)` debounce is the shape
D30 adopts.

## 4. What is *not* verified, and why

| Item | Status | Why it is honest to leave it open |
|---|---|---|
| A public benchmark benefit on unmodified data | **nine reads, one of which did not replicate**, n=350 | the lane is sound (oracle +29.14pp, p=1.3e-27) and the pack costs 3.43pp [−6.29, −0.57], McNemar p=0.0357, under `set` semantics — and identically under `multiset` on the same run (7 of 350 items scored differently, none of them discordant). Iteration 74 re-scored the same answers with a criterion that shares nothing with EX — the evidenced cascade, κ 0.6676 against a human committee where EX reaches 0.4717 — and got −4.15pp [−7.96, −0.69], p = 0.0428 on the 289 questions both arms answered, with the two criteria disagreeing on 54 of them (18.7%). The criterion was the standing explanation for the null; it is now excluded twice over. Significance stays marginal on every instrument (EX's own p has ranged 0.0357–0.1221 across runs), so the claim is the sign and the size, not the p-value. Iteration 76 replicated it on a fresh dispatch (−4.79pp [−8.90, −1.03], p = 0.0243, 292 paired) and added the deletion arm: 268 of 805 rules retired, packs changed on 192 of 350 questions, paired against `full` at −0.57pp [−2.86, +1.71], p = 0.81. The credit that drove the deletion carries no per-rule signal (pooled χ² = 10.71, df 9, p = 0.296 against a single binomial at the base rate), which is the open defect. Iteration 77 built the counterfactual credit that defect called for and measured its ceiling: 193 decisive comparisons over 1,400 injections, **0.25 per rule**, 16 rules retired of 784 (+0.86pp, p = 0.375). The distribution also indicted the pass — 132 of 213 credited rules had exactly one help and never a harm — which traced to rules being scored on the question that produced them; evidence now carries its task and self-derived rules are dropped per row. Per-rule attribution is not measurable at 350 questions, which is a result about the corpus rather than the code. Iteration 78 then found the mechanism: the cost is imitation, and changing how the rule reaches the prompt removes it — `full-anchored` (answer, then revise) reaches +0.29pp against no memory in one dispatch and +4.29pp over `full` at p = 0.0167, +2.86pp pooled at p = 0.0205, while moving the pack later makes things worse twice. The arm still forfeits the gain it would have got from a good rule, which is the remaining item. **Iteration 79 withdrew the anchoring claim** after three more dispatches: +0.80pp pooled over five runs at McNemar p = 0.285, with `full` itself moving from −4.00pp to +0.86pp across runs of unchanged code, because each dispatch distils its own store. The conditional variant was worse than `full` in all three runs that measured it (−1.71pp, p = 0.066). Within-run comparisons stand; cross-run estimates of the pack's cost do not, and a distillation cache now fixes the treatment so the next A/B can. **Iteration 80 then closed the content hypothesis**: a pack restricted to rules a reader can check against the schema and a random pack of the same size are indistinguishable (+0.57 vs +0.86pp against `full`, p = 1.0), while both beat `full` by carrying 0.6 fewer rules — accuracy falls about **1.7pp per rule injected**. What the memory says is not the problem; how much of it is in front of the question is |
| Convention transfer at a stable magnitude | **two reads**: +4.79pp then +2.05pp | 4.79 sits under the sample's 5.08pp resolution; the direction replicates, the size does not, and both are reported |
| A rule shown outside the database it was learned in | **measured twice, refused twice** — R10 66.8% of rules unbindable by name, R11 62.3% of 82,137 attempts unbindable by the question's own links (60.0% of those are a column the target lacks) | both constructions were refused by kill conditions written before their code, for zero model calls, so no transfer verdict was ever issued — and none is claimed. The product statement is the measured one: the pack is an in-database prompt |
| Whether the store can reproduce the correction it was built from | **measured once (R12)**: 156 corrected cases, `supplied` 19 — 12.2%, `redundant` 31 — 19.9%, `broke` 3 — 1.9%, `useless` 103 — 66.0%; 38 of 296 rules admitted (12.8%) | two pre-registered predictions failed (`supplied` ≥ 20%, `kept` ≥ 25%) and two held (`broke` ≤ 15%, blank-retry rate in [20%, 60%] at 21.8%). The admitted store moved 342 of 350 prompts and **0.00pp**, so a passing gate is read as "not demonstrably harmful", never as "helps". The deficit is located in the extraction, which is the one place the previous four iterations were not looking |
| Host shadow results (S1) | not started | needs the private adjudicated set (1,300 cases, κ≥0.7) and real users; no synthetic substitute means anything |
| LLM-judge calibration (κ) | **reference measured; no judge exists to calibrate** | the 200-label blocker is withdrawn — ROSE-VEC publishes 322 expert-adjudicated BIRD predictions and the five annotators' own files, so nothing had to be bought. Measured on them: committee self-agreement κ 0.7085, execution accuracy vs committee κ 0.4717 (set semantics) / 0.2995 (multiset). The gap is in the criterion, not the labels; a judge is still unvalidated because this repository has none |
| Successor models | not tested | one provider, three runs; the docs say so wherever a model number appears |
| 100k-item behaviour | not measured | 10k is measured; extrapolating would repeat the mistake this audit already corrected once |
| Every §17 pipeline stage | **designed, not implemented** | the design phase excludes product code; each stage's gate is specified and unrunnable until the code exists |
| Multi-writer safety | not implemented | documented as a single-writer design, with the failure mode named |
| Dev-dependency advisories | open, tracked | `pnpm audit` reports four in the vitest chain; none is in the published artefact (zero runtime dependencies), and clearing them needs the vitest 4 migration that changes coverage semantics — scheduled, not ignored |

## 5. Reproducibility check

Every number in the two design documents can be regenerated by these commands, in this order:

```bash
pnpm install --frozen-lockfile
pnpm check                                    # typecheck → 448 tests with coverage gates → audit → study
pnpm build && node packages/eval/dist/bench/run.js   # the study alone, 0.33 s
pnpm eval:attribute                            # per-rule attribution from the committed artefact
```

The live POCs need credentials and are therefore run by the `poc-live` workflow, which **fails** when the
keys are absent rather than skipping. The public lane runs in `sota.yml` and publishes its artefact; a run
whose instrument gates fail is a failed run, not a footnote.

## 6. CI evidence at the freeze

| Workflow | Latest state | What it proves |
|---|---|---|
| `ci` | **success** (`1a49088`) | build, 448 tests, coverage gates on four dimensions, repository audit, study gates |
| `poc-live` | **success** (`0a3f348`) | the live DeepSeek and Zhipu POCs run against the real APIs |
| `cortex` | **success** | the projection matches a freshly built cortex, field by field |
| `sota` | **success** (`f5b53b4`) | end-to-end lane: two datasets assembled, arms run, gates evaluated, artefact published |
| `sota` | **two failures before that** (`3a72520`, `f6e998f`) | the instrument gates refusing runs: an empty control arm and a mis-specified pack gate. Both were fixed (B7, B8), and both failures were reported rather than smoothed over |

The freeze commit `c55cff1` adds the recorded artefacts of the replication run; it changes no source.

## 7. Audit conclusions

1. **The mechanism is verified where it is measurable** (C1–C8, D class), and the instrument has its own
   gates. The numbers reproduce in 0.33 s on one core.
2. **The product claim is narrower than it first appeared** (C9, C10): the pack sells organisational
   convention, not general knowledge. The audit forced that correction; it was not a later nuance.
3. **A published number was wrong and is withdrawn** (C19). Keeping the retraction *as* the claim is the
   only defence against the next favourable read being believed.
4. **The boundary is measured from both sides**: inert where the knowledge is inferable (C20–C22), positive
   where it is not (C23, 10 gained and 0 lost), with the ceiling stated (10.96–11.64pp).
5. **Four defects were in the measurement, not the product** (B6–B9). Three were found by recording a cause
   instead of a message; the fourth by recomputing a published distribution from its own artefact. Both habits
   are now rules for every lane.
6. **Nine questions remain open** (§19.3 of the technical design). Each has a POC, a number and a stopping
   condition; none is a requirement ambiguity, and none is hidden behind a green build.

## 8. Addendum — R13 (2026-10-31)

Three claims needed adjusting after the transfer measurement, and both of the defects it found were in
the instrument rather than the product.

**8.1 A measurement defect, closed with a gate.** The transfer trial's control (`blankCorrect`) was a
`boolean`, so a blank call that never returned was recorded as "the retry alone was wrong" — the exact
set that makes a repair attributable to a rule. The field is now `boolean | undefined`, both halves of
a pair must have returned, and `V15` prints the control-side holes (`unmeasuredBlank`). The trial count
reconciles either way, which is why the defect was invisible: only the *composition* of the informative
set was wrong.

**8.2 A field that never reached the artefact.** The transfer pairs were written into the fold record,
which `report.ts` does not serialise. The run would have published a rate with no rows behind it. The
projection is now a tested function (`transferLedgerOf`) applied where the artefact reads, and
`V33-transfer-ledger` is blocking: a file that carries the summary and not the pairs fails the run. The
rule this addendum records is the one §7.5 already made twice: **a claim is only as good as the
artefact that carries it, and a field nobody checks can be absent.**

**8.3 Claims that change, and claims that do not.**

| Claim | Status after R13 |
|---|---|
| "The pack is an in-database prompt" | **stands, with a mechanism attached**: inside its own database a rule repairs 7.3% of the questions that need help and breaks 50% of those that do not, so the boundary the three earlier measurements found is real and the content inside it is weak |
| "Two corrections in three cannot reproduce themselves" (§3.6.13) | **brackets to 12–20%**: the same probe measured 19.9% at `learn_sample` 128 against 12.2% at 64, with the population changing at the same time; no document may quote 12.2% as a constant |
| "An admitted store is harmless but inert" (§3.6.13) | **narrowed**: harmless at 0.42 rules per question (+1.14pp, p=0.34), and inert once the transfer gate is intersected with it (0.03 rules per question, 0.00pp) |
| C20–C23 (knowledge that transfers is convention) | unchanged; R13 measures within-database transfer on a benchmark whose gold has no convention, so it neither supports nor contradicts them |
| Any SOTA claim | unchanged: stopped on BIRD (§2), and R13 removes the last memory-axis hypothesis that would have reopened it without new data |

## 9. Addendum — R14 (2026-10-31)

R14 asked a question that had only ever been answered by interpretation: is the substrate the defect, or
the delivery? It answered it, and the answer separates two things this project had been treating as one.

**9.1 A claim confirmed at the resolution it was made.** R13 wrote that a sentence about a correction
loses the query pair. Measured against the pair-rendering distiller on 303 shared source questions with
one shared control each, the sentence reproduces 30.69% of its own corrections and the account 53.80%:
+23.10pp, p = 1.05e-14, five folds out of five positive. The claim was correct, and it is now a number.

**9.2 The claim does not license a product statement, and the documents say so.** `full-repair-verified`
— the same store under the same admission rule — answered 52.86% against 53.14%, one question of 350,
carrying 0.31 items per question. Any document that quoted the +23pp without the −0.29pp would be
reporting the extraction as if it were the product. The rule this addendum records: **a rate about the
store and a cell about the arm are two different measurements, and this project will not let one stand in
for the other** — the same discipline §8.3 applied to the conditional transfer rate.

**9.3 Two instrument decisions that changed the number's meaning.**

1. **The control is shared, not re-measured.** The blank retry prompt does not depend on the store, so
   paying for it twice would have put the endpoint's own re-sampling (16.4% of questions return a
   different query under the same prompt) inside the difference the pairing exists to isolate. Holes are
   carried as holes rather than re-asked, for the same reason: a control that returned on the second
   attempt is not the control the first substrate was scored against.
2. **The paired set is reported, not assumed.** Both stores held a rule for all 303 corrected cases, so
   the exclusion is zero and V36 is satisfied trivially. That is a fact about this run and not a property
   of the design: the set is chosen by the stores, and the gate makes its size a reading rather than an
   assumption the next run can inherit.

**9.4 Claims that change.**

| Claim | Status after R14 |
|---|---|
| "Two corrections in three cannot reproduce themselves" (§3.6.13) | **brackets to 12–31%**: 12.2% supplied at `learn_sample` 64, 19.5% at 128, and 30.7% once the cases a retry already fixes are counted. No document may quote a single figure as the store's reproduction rate without saying which denominator it is |
| "The extraction is the wrong shape" (§3.6.14) | **confirmed as a description, refuted as a constraint**: the pair-rendered store reproduces 53.8% and moves the arm by one question, so what a store can reproduce does not bound what it can teach |
| "An admitted store is inert" (§3.6.13, §3.6.14) | **stands for a third content form**: `full-verified` +1.14pp, `full-repair-verified` −0.29pp, both on stores whose reproduction rates differ by 23pp |
| Any SOTA claim | unchanged: stopped on BIRD (§2). R14 removes the last content-axis hypothesis that could have reopened it without new data, which narrows rather than widens what a next dispatch could claim |
| `scope.domain` as a transfer ceiling | **new and quantified**: 16.3% of rule items and 10.6% of repair items have no home database, so no transfer measurement can speak for the whole store. Filling it is deferred because it would change the `full` baseline; the ceiling is published first |

## 10. Addendum — R15 (2026-10-31)

R15 asked the one question R14 could not: whether the substrate that reproduces half of what it was
learned from also repairs questions it was **not** learned from. It does not.

**10.1 A claim refuted at the resolution it was made.** The prediction was a transfer rate above the
sentence's 7.28%, expected 10–20%. The measurement is 6.21% against 6.28% — 0.07pp on 720 informative
trials, smaller than the standard error of either rate. The paired substrate comparison, re-measured in
the same run, repeated R14 (+18.24pp, p = 1.83e-11). **Reproduction is not transfer**, and the two
iterations together establish it in both directions: reproduction does not bound the product (R14), and
an 18pp advantage in reproduction buys nothing in transfer (R15).

**10.2 Two instrument defects, both found by a run that could not pass them.** The first dispatch
(`41169086124`) measured every fold and refused its own artefact on neither of its numbers:

1. **V17 compared a two-decimal publication against exact arithmetic.** Unifying the artefact and the
   gates on one projection handed the gate `net_pp` as the file carries it, `0.41`, and the gate
   demanded equality to 1e-9 of `(29 − 27) / 483 = 0.4141...`. Only a ratio that terminates at two
   decimals could pass. The tolerance is now half the published step, the criterion states it, and a
   test pins both sides.
2. **V14/V38 measured an arm instead of a gate.** The pack comparison lived inside the arm's guard, so a
   dispatch that bought the probe for the transfer measurement reported "0 of 350 questions changed" —
   the reading the pre-registration names as invalidating. The comparison now runs whenever the probe
   ran; only the model call is conditional.

Both are the same class this audit has recorded three times now (§2, §8.1, §9.3): state that is correct
in the case it was written for and silently empty in the case added later. Neither was caught by 1,891
unit tests, and both were caught by the first run that asked the instrument a question its author had
not.

**10.3 Two predictions were written on the wrong base, and the record keeps them so.**

| Prediction | Predicted | Measured | Why it is recorded as written |
|---|---|---|---|
| informative trials | ≥ 400 | 354 | The base was R13's 467 trials from 98 pointable rules; this run admitted 100 rules, of which 78 carried a domain, and the trial count follows the pointable set |
| items without `scope.domain` | ≤ 12% | 23.5% (24 of 102 admitted) | Stated as a share of *items* and measured against *admitted* items, which is not the denominator R14 used for its 10.6% |

**10.4 Claims that change.**

| Claim | Status after R15 |
|---|---|
| "A better extraction is a better store" (§3.6.15) | **refuted as a product claim**: +18.24pp of reproduction, 0.07pp of transfer, and an arm that answers what no memory answers |
| "The sentence travels at 7.3% and breaks half" (§3.6.14) | **stands, and now has a sibling**: 6.28% and 0.600 for the sentence, 6.21% and 0.516 for the pair, in one run on the same targets |
| "The extraction is not what limits this design" (§3.6.15) | **strengthened**: four content forms are now inert within ±3pp, and the one measurement that could have reopened the axis came back a tie |
| "`net_pp` answers whether memory helps" | **weakened to a per-run reading**: the two dispatches of this measurement disagree on its sign (+0.41/+1.20pp, then −1.68/−2.40pp) at 416 trials, which is the honest size of the noise and the reason the next iteration varies one quantity rather than reading a cell |
| `scope.domain` as a transfer ceiling | **quantified a second time, and it is larger**: 22 of 100 admitted sentence rules and 24 of 102 admitted accounts could not be pointed at any foreign question. The published transfer rates are rates over the domain-bound subset — the claims that travelled least |

**10.5 What is still not verified.**

1. **The artefact does not carry its own pre-registration id.** `41175676367` was produced before the
   lane recorded one, so the link from numbers to prediction is the dispatch record, not the file. The
   field exists from this iteration on and the next run will be checkable from the artefact alone.
2. **Whether the domain-less items are omissions or promotions.** `parseScope` in the distiller starts
   from `{ task }` and copies only the keys the model wrote, and `generalize.ts` clears `domain` on
   purpose at three endorsing tasks. Both produce the same shape, and no counter currently separates
   them; a transfer rate over the domain-bound subset cannot say which defect it is measuring.
3. **Whether the observed harm is dose, relevance or framing.** `full` is negative in both dispatches
   (−2.00pp, p = 0.31; −3.71pp, p = 0.02) and no arm has yet varied one of those three with the other two
   fixed. R16 does the first.

**10.6 Reproducibility.** `prereg/R15-repair-transfer.md`, artefact
`eval/results/poc-sota-bird-transfer-repair.json`, dispatch `41175676367` (green) and `41169086124` (the
instrument-defect run, kept for §10.2). `pnpm check`: 1,891 tests, 104 files, coverage
99.98 / 99.61 / 100 / 99.98, `sota.ts` 100 on all four dimensions. CI: `8875708` (fixes) and `d3bee4d`
(result and documentation) both green.

## 11. Addendum — R16 (2026-10-31)

R16 asked whether the harm is a property of what is stored or of how much of it arrives. It is a property
of neither above the first item: the curve is a step, and the step is at one.

**11.1 The registered instrument prediction failed, and no delta from that cell may be quoted.** The
pre-registration called `chars-600` a one-item cell and required one item on ≥70% of questions. It is one
item on 100 of 350. `renderPack` walks the ranked list and adds a whole line or stops, and this store
renders an item at 500–824 characters, so the top-ranked item overruns a 600-character budget on 250
questions and the pack is empty. The cell is 71.4% control by construction, and its interval
[−1.43, +1.71] admits a per-item effect anywhere in ±5–6pp. **Any reading of the form "one item is
harmless" is unsupported by this artefact**, including the one the stage was written to license.

**11.2 The cell that was missing exists in an earlier dispatch, and it is not harmless.** Iteration 86
ran the same budgets against the same rules-with-the-case store and its `chars-900` reached exactly 1.00
item per question (718 characters), at −3.14pp [−6.29, −0.29], 9 gained and 20 lost, on a run whose `full`
cell was −3.14pp at 1.87 items — within 0.6pp of this run's 1.83-item cell. Read as one curve:

| items per question | 0.27 | 0.29 | 1.00 | 1.83 | 1.87 | 2.97 | 4.16 |
|---|---|---|---|---|---|---|---|
| Δ vs no memory | +0.57 | +0.00 | −3.14 | −2.57 | −3.14 | −4.00 | −2.86 |
| runs | 86 | R16 | 86 | R16 | 86 | R16 | R16 |

Everything above one item sits within 1.43pp across a fourfold range of injected text. **The loss is
complete at the first item**, which fires the refutation clause in substance — quantity is not the
variable — rather than in the letter, since the clause was written for a single run whose spread is
4.00pp.

**11.3 The floor moved, against this run, and it changes what can be said.** Iteration 86's `none-replica`
was 3 gained and 3 lost. R16's is 1 gained and 6 lost: seven discordant questions, −1.43pp, the first
clearly negative replica on record.

| Run | replica gained / lost | floor (discordant) | smallest cell that clears |
|---|---|---|---|
| 86 | 3 / 3 | 3 | — |
| R16 | 1 / 6 | 7 | 26 discordant (−4.00pp, p = 0.0094) |

Two consequences. The 600 cell's eight discordant pairs are inside the floor, so its flatness is
indistinguishable from an unchanged question. And because no memory is the luckier of two identical
prompts here, every delta in the run overstates the harm by up to 1.43pp — the sign of the finding does
not depend on it, the size does. The default budget's cost is quoted as the mean of four disjoint
dispatches (−3.71, −3.14, −2.00, −2.57pp → **−2.86pp**) rather than as any single cell.

**11.4 One instrument defect, and it was in this stage's own paperwork.** `prereg/R16-injection-dose.md`
shipped with R15's `gates` line: seven transfer gates — V13, V14, V15, V16, V17, V33 — that a dose arm
set cannot emit. The file validated, the run passed its own ten gates, and nothing compared them. That is
the fourth instance of the class this audit has recorded at §2, §8.1, §9.3 and §10.2, and the first in
which both halves of the claim are files in the repository rather than one file and one runtime.
`preregGateAgreement` compares the two lists in both directions with the artefact id's slug stripped to
its code, and `bin/protocol.ts` applies it to every committed artefact that names a `config.prereg`:
a gate the file names and the run never emitted, a gate the run emitted and the file never named, a
`config.prereg` naming a file that is not in the repository, and a file that is not a pre-registration all
fail the gate. The header was corrected in the same commit as the outcome, and the corrected header is the
first thing the new check accepts.

**11.5 Claims that change.**

| Claim | Status after R16 |
|---|---|
| "The default budget is wrong by a single item" (R16's stated licence) | **refuted**: the one-item cell costs what the default costs, and the cell meant to show otherwise was 71% control |
| "The harm grows with the dose" (R16's prediction) | **refuted above one item**: 1.00 → 4.16 items moves the number by 1.43pp, inside the floor |
| "The first two to eight distractors carry the loss" (UTILMEM, as applied in §3.6.16) | **sharpened**: the first *one* carries all of it in this lane, which is a stronger statement than the paper's window and is measured on one cell in iteration 86 plus four in R16 |
| "`full` costs about three points" (four dispatches) | **stands, and is now a mean**: −3.71, −3.14, −2.00, −2.57pp → −2.86pp, one sign, four draws |
| "A smaller budget is the cheap fix" | **closed**: the smallest budget that injects anything already costs the default's price |
| "A pre-registration is checkable against its run" | **new**: true for the first time, offline, for every artefact that names a file |

**11.6 What is still not verified.**

1. **Whether one item is harmful at full coverage in the *current* store.** The −3.14pp one-item reading is
   iteration 86's, four iterations and one distillation pipeline away; its `full` cell matches this run's
   within 0.6pp, which is a reason to read them together and not a proof that the stores are the same.
   R18's selection rule is the instrument that would measure it on today's store.
2. **Whether the harm is relevance rather than every item.** The pack injects the top-ranked items and the
   ranking is the store's own; a one-item cell built from the *best* item and a one-item cell built from an
   arbitrary item have never been compared, and R16 shows the difference between them would be resolvable
   only at full coverage.
3. **Whether the endpoint's floor is drifting.** The replica moved from 3 discordant questions to 7 between
   iteration 86 and now, on the same lane and the same prompt. One observation is not a trend, and it
   changes the resolution of every cell in this document if it holds.

**11.7 Reproducibility.** `prereg/R16-injection-dose.md`, artefact
`eval/results/poc-sota-bird-dose.json`, dispatch `41177896801` (success, 2,263 calls, 1 retry, 0
timeouts, 0 call failures, ten gates pass). `pnpm check`: 1,897 tests, 104 files, coverage
99.98 / 99.61 / 100 / 99.98, `prereg.ts` and `sota.ts` 100 on all four dimensions.

## 12. Addendum — R17 (2026-10-31)

R17 asked whether the block's cost is the absence of permission to reject it. It is not, and the run
produced a second number that matters more than the answer: in this prompt, adding words costs about what
the note costs.

**12.1 The refutation fired on the criterion registered before the run.** `full-advisory` − `full` is
−0.57pp (10 gained, 12 lost, CI [−3.14, +2.00], p = 0.832). The amendment to that pre-registration, written
before the dispatch, required the interval's **upper bound** to sit below +2.5pp before "framing is not the
channel" could be asserted; it is +2.00pp. This is the first refutation in this audit whose refuting
interval was itself pre-registered, and it is the difference between a finding and an absence.

**12.2 The sentence has a price of the size of the effect it was meant to buy.** `none-advisory` — the
advisory sentence with no pack — is 2.00pp below no memory [−4.00, +0.00], 3 gained and 10 lost,
p = 0.0923. It is the most important cell in the run, because it bounds what any prompt-level mitigation
can achieve: the intervention was written to recover two thirds of a −2.86pp cost and its carrier costs
2.00pp by itself. Additivity fails (pack −4.00 plus sentence −2.00 would predict −6.00; the cell is
−4.57), and the interaction is +1.43pp — inside this lane's resolution, so it is recorded as a number and
not used as an argument. **Anyone quoting `full-advisory` as "the sentence cost us 4.57pp" is wrong, and
anyone quoting it as "the sentence recovered 1.43pp" is quoting a difference this instrument cannot
resolve.**

**12.3 The register is a 0.57pp variable.** `full-prohibitive` classifies the same 1.81 items as records
of mistakes rather than as workspace facts and lands 0.57pp below the advisory cell (1.14pp below `full`,
CI [−4.00, +1.71]). The prediction "not better than `full`" holds and the prediction "within 1pp" is
missed by 0.14pp, which at this resolution is a direction with no size. MemTrapBench's trauma mechanism,
run forward, is therefore **not demonstrated** in this lane; what is demonstrated is that it does not
help.

**12.4 The instrument was the point.** Three arms differ from their controls by one paragraph, which is
the exact geometry in which a table entry that fails to match silently turns the treatment into the
control. `V43-framing-delivered` counts delivery per arm per fold and reported
`none: 0/350, full: 0/350, full-advisory: 350/350, none-advisory: 350/350, full-prohibitive: 350/350`.
`V44-domain-accounted` (added in the same iteration, first exercised here) reconciles the store's
domain-free items against the two paths that produce them; it passed, which is the first evidence that
the count quoted as the ceiling on every transfer reading has no unexplained third source.

**12.5 Claims that change.**

| Claim | Status after R17 |
|---|---|
| "Permission to ignore the note recovers part of its cost" (R17's hypothesis) | **refuted**, at a pre-registered interval |
| "An instruction is a cheap intervention" (MemTrapBench's framing, as applied in §3.6.18 of the whitepaper) | **refuted for this lane**: the instruction's carrier costs 2.00pp on its own |
| "The negative register is what makes a note expensive" | **not supported**: the register moves the cell by 0.57pp |
| "`full` costs about three points" (four draws pooled in R16) | **stands**: −4.00pp here, p = 0.0201; the five draws at the shipped budget read −3.71, −3.14, −2.00, −2.57, −4.00pp |
| "Framing is a channel worth varying" | **closed**, with content, quantity and position |
| "Selection is the next step because framing failed" (R17's own refutation clause) | **withdrawn**: R16 measured the loss complete at the first item, so choosing which item arrives cannot remove it |

**12.6 What is still not verified.**

1. **Whether the +2.86pp anchored result is the note or the revision.** This is the largest open question
   in the record and the only positive sign in it; `full-anchored` has never been run beside a second pass
   with no pack. R18 is that control, and it is registered with its resolution stated in advance.
2. **Whether the word tax is a property of instructions or of this prompt.** 2.00pp is one cell, in one
   position, with one sentence of 235 characters. A length-matched neutral filler would separate "words
   cost" from "this instruction costs", and no such arm exists; that is the same defect R17 was built to
   avoid in its own controls and did not close in its own most interesting number.
3. **Whether the store's domain-free items come from the door or from widening.** V44 shows the count is
   accounted for, not how it splits. The split is what decides whether the fix is a prompt or a widening
   policy, and it will be read on R18's artefact.

**12.7 Reproducibility.** `prereg/R17-framing.md` (with the pre-dispatch amendment and the Outcome),
artefact `eval/results/poc-sota-bird-framing.json`, dispatch `41185616121` (success, 2,110 calls, 5
retries, 0 timeouts, 0 call failures, eleven gates pass). `pnpm check`: 1,919 tests, 104 files, coverage
99.98 / 99.61 / 100 / 99.98.

## 13. Addendum — R18 (2026-10-31)

R18 asked whether the anchored cell's +2.86pp belongs to the note or to the second pass. It belongs to
neither: the second pass on its own **costs 4.00pp**, and the note buys back exactly that and nothing
more. The project's only positive mechanism is a repair, and the repair cannot yet be attributed between
the block and the clause that permits the draft to stand.

**13.1 The registered prediction is refuted, in the direction nobody wrote down.** `anchor-blank` — the
same draft, the same revision request, no block and no instruction about one — was predicted 1 to 3pp
*above* no memory. It is **4.00pp below** it: 50.00% against 54.00%, 12 gained and 26 lost, CI
[−7.43, −0.57], p = 0.0336, and the fold signs are −7.14, −4.29, −2.86, −4.29, −1.43pp — one sign in five.
This is the third pre-registered refutation in this audit and the first that inverts a prediction rather
than weakening it.

**13.2 The anchored cell is at exactly no memory, and its advantage is a repair of the control.** 54.00%
against 54.00%, 4 gained and 4 lost, p = 1.0000. Paired difference over `anchor-blank`: **+4.00pp**, 27
gained and 13 lost, 40 discordant, p = 0.0385. The two numbers are the same number with opposite readings,
and only the paired one is pre-registered as confirmatory: the note restores what being asked to revise
removed.

**13.3 The published +2.86pp was priced against a `full` that was costing −4.00pp.** In this run the
anchored cell is +0.57pp against `full`, not +2.86pp against a pooled pair. Both are true and only one is
about the note: most of the published gap was the harm injection does. Every document that credits the
anchored arm with a gain is narrowed in this commit — including the whitepaper's product sentence, which
now says the store is *not measurably harmful* in this position rather than that it helps.

**13.4 `full` broke its own streak and the draw is kept.** −0.57pp [−3.14, +2.00], p = 0.8318: the sign
held, the size did not, and this is the first of six draws at the shipped budget that is not
distinguishable from zero. Nothing in the iteration touched that prompt. Five draws averaged −3.08pp; six
average −2.67pp. A record that reports only the draws agreeing with its own average is not a record, so
the sentence "`full` costs about three points" is now "`full` costs about two and a half on six draws, and
one of them is zero".

**13.5 The instrument answered a question it was built for, and the answer was one of two branches.**
`V44-domain-accounted` reports `184 item(s) with no domain, 184 arrived unscoped, 0 widened`. Not one
domain-free item in the store became domain-free through generalisation, so the 14.6% is the interpreter
declining to scope at the door: the fix is a prompt change, not a tightening of the widening policy. This
is the decision the single count could not support, and it was made by an inequality that could have
failed in the other direction.

**13.6 Claims that change.**

| Claim | Status after R18 |
|---|---|
| "The anchored arm is the record's only gain" | **withdrawn**: it is +0.00pp against no memory; the +4.00pp it shows is over a control that loses 4.00pp |
| "A second pass is worth about a point" (from `retry-blank` and `full-onretry`) | **does not transfer**: at anchor the same shape costs 4.00pp. Those second passes carry a failure; this one carries a draft |
| "The note at anchor is worth the permission it carries" | **hypothesis, not result**: the control and the mechanism differ in the block *and* the clause, and R20 is the 2×2 that separates them |
| "`full` costs about three points" | **narrowed**: six draws, −2.67pp mean, one of them at zero |
| "Deviation by generalisation is a live cause of domain-free items" | **refuted for this store**: 0 of 184 |

**13.7 What is still not verified.**

1. **Which half of the anchored prompt does the work.** The block or the licence to stop; R18's design
   cannot separate them and R20's four cells can. Until it runs, the product sentence is the weaker one.
2. **Whether the word tax is a property of instructions or of this prompt** (carried over from R17). The
   `hold` sentence is 143 characters against the advisory sentence's 235, so R20 will report two
   sentences of comparable length in two positions, which is a second draw on the same question and not
   an answer to it: no length-matched neutral filler exists in this record.
3. **Whether 4.00pp is the price of a revision request or the price of *this* revision request.** The
   control's prompt is one sentence long and identical in the other three cells, so the size is a
   property of being asked, not of what is asked — untested, and cheap to test once the square exists.

**13.8 Reproducibility.** `prereg/R18-anchored-control.md` (prediction, refutation and Outcome), artefact
`eval/results/poc-sota-bird-anchor.json`, dispatch `41188122217` (success, 1,762 calls, 6 retries, 0
timeouts, 0 call failures, eleven gates pass). `pnpm check`: 1,924 tests, 104 files, coverage
99.98 / 99.61 / 100 / 99.98. `prereg/R20-anchored-hold.md` is validated by the protocol check against the
arm union before its dispatch.

## 14. Addendum — R20 (2026-10-31)

R20 closed the square R18 opened and the answer was neither of the two on offer. The permission is not the
block's carrier and the block is not the permission's: **they are substitutes for the same thing**, and
once either is present the other is worth nothing. The note's content, measured for the first time
against a control that holds the licence constant, is about +0.86pp and indistinguishable from zero.

**14.1 The interaction has the opposite sign to the prediction and is the iteration's result.** The
permissive clause is **+2.00pp** against a blind revision with no block (15 gained, 8 lost, p = 0.2100) and
**−0.57pp** with a block (7 gained, 9 lost, p = 0.8036). Interaction −2.57pp. The reading is substitution:
`full-anchored`'s conservative instruction already closes with "if none applies, return the first attempt
unchanged", which is a licence to stop, so an explicit one is redundant where a note is present and is the
only licence available where one is not.

**14.2 The confirmatory claim is half-confirmed at half the registered size.** `anchor-hold` −
`anchor-blank` was registered at +3 to +5pp; it is +2.00pp at p = 0.2100. The refutation clause does not
fire — the difference is not within 1pp — so the permission does something, and this lane has established
a direction without establishing a size.

**14.3 The product decision fired exactly as pre-registered.** `full-anchored-hold` − `full-anchored` =
−0.57pp, inside the ±2pp band named before the run as the criterion for dropping the sentence. The shipped
anchored prompt gains nothing: 143 characters, half a point the wrong way. This is the second time in this
audit that a pre-registered band produced a decision rather than a discussion.

**14.4 R18's control reproduced to the question, on a different store.** `anchor-blank` is −4.00pp again
with 12 gained, 26 lost, 38 discordant and p = 0.0336 — identical to R18, whose fold learn produced 648
corrections against this run's 640, and 184 domain-free items against 168. Both accuracies moved by two
questions; the paired counts did not move. Pooled over the two dispatches the block is worth **+3.43pp
against a blind revision** (53 gained, 29 lost, 700 question-pairs, exact McNemar p = 0.0106).

**14.5 Claims that change.**

| Claim | Status after R20 |
|---|---|
| "The note at anchor earns its +4.00pp" (R18's reading of its own paired difference) | **narrowed to +3.43pp pooled**, and decomposed: ~2.00pp permission, ~0.86pp content |
| "The licence and the note are complements — the note carries a permission the block cannot" | **refuted**: they substitute, and the block's own instruction is where the permission already lives |
| "An explicit permission improves a prompt that already has a conditional clause" | **refuted at ±2pp**: −0.57pp, and the sentence is dropped |
| "A blind revision costs about 4pp" | **reproduced exactly**, twice, on independently distilled stores |
| "`full` costs about two and a half points on six draws" | **updated to seven**: −2.90pp mean, five of seven significant, R18's −0.57 the outlier |

**14.6 What is still not verified.**

1. **Whether any prompt-level intervention can reach no memory.** No cell in either square does. The best
   is `full-anchored` at −1.14pp here, which is the delivery order already shipped, and the deficit has
   survived every text-level change this record has made.
2. **Whether the content half is zero or just small.** +0.86pp with no test; separating 0.86pp needs about
   four times the panel, and the pre-registration declined to spend it before a mechanism that adds no text
   has been tried.
3. **Whether the 2.00pp permission covers the same questions as the 3.43pp block effect.** The two edges
   are measured against different baselines (`anchor-blank` and `full-anchored` respectively) and no
   question-level join between them exists in the artefact.

**14.7 Reproducibility.** `prereg/R20-anchored-hold.md` (prediction, refutation and Outcome), artefact
`eval/results/poc-sota-bird-square.json`, dispatch `41190894667` (success, 2,460 calls, 8 retries, 0
timeouts, 0 call failures, eleven gates pass, 72 minutes). `pnpm check`: 1,924 tests, 104 files, coverage
99.98 / 99.61 / 100 / 99.98.

## 15. Addendum — R21 (2026-10-31)

R21 asked whether a smaller pack of *better* items beats a smaller pack, and the answer is that this
store cannot tell the two apart: **the clearance and its control rendered the same prompt on 88.9% of
questions**, so the pair differed on 39 questions and split 6–6. The confirmatory claim is refuted and the
pre-registered refutation clause fires: selection stops here. The number worth keeping is the one under
the null — **77% of the store has no counterfactual record at all**.

**15.1 The pair is exactly zero and the zero is structural.** `full-cleared` − `full-cleared-sampled` =
**+0.00pp**, 6 gained, 6 lost, 12 discordant, exact McNemar p = 1.0000. `V45-clearance-dose-matched`
passed on dose (0 mismatched of 350) and its second reading is the finding: **311 of 350 identical**. A
pack carries 1.83 items; where the clearance removed the only item in a single-item pack, the control had
only that item to remove, so the two cells coincide precisely where the treatment acted most strongly. The
registration's resolution was 3pp on 350 pairs; it was never available on 39.

**15.2 The instrument under the null: the counterfactual pass is starved, not the filter wrong.** The pass
answered **104 decisive questions across 1,400 learn rows (7.4%)**, because a question is decisive only
when the outcome *changes* between pack and no pack and most questions are right both ways or wrong both
ways. Those 104 questions credited **143 of 628 scored rules (22.8%)**; the credited rules average 1.2
comparisons each. A perfect clearance could have filtered at most 22.8% of this store. The cleared set
was 93 of 628 rules (14.8%), 115 items over 350 questions, 0.33 per question.

**15.3 Both clearance arms are dose, and they say so.** `full-cleared` and `full-cleared-sampled` sit at
**51.71% on 1.51 items and 907 / 905 characters**; `full` sits at 52.00% on 1.83 items and 1,089
characters; `none` at 54.00%. A third of an item less text and a third of a point worse is the dose axis's
own noise, reproduced a fourth time. Against `full` the two arms are each −0.29pp (5/6 and 3/4, p = 1.0000
both).

**15.4 A design defect this audit now carries forward.** A control matched on **item count** is degenerate
on single-item packs, and this was invisible until the pair ran. Any future clearance experiment must
match dose on **characters**, or restrict the comparison in advance to the questions where the two packs
differ — a subset declared before the run, never selected after it. `V45`'s "identical" count is the
instrument that would have caught the second case; it caught the first.

**15.5 The generalisation instrument widened nothing, for the third dispatch running.** `V44-domain-accounted`
reports `180 item(s) with no domain, 180 arrived unscoped, 0 widened`. The repair is identified and queued
behind the current line, not applied mid-experiment.

**15.6 Claims that change.**

| Claim | Status after R21 |
|---|---|
| "Deleting by measured utility beats deleting by age" (Xiong et al., MeClear) | **not transferable at this store size**: 77% of the store has no counterfactual record, so the utility estimate exists for a quarter of the object |
| "A pack of items measured to hurt is worse than the same count chosen at random" | **unmeasured here**, and the reason is mechanical: the two arms coincided where the claim would have been tested |
| "The deficit is a property of which rule is shown" | **third independent negative**, after the relevance audit and `full-shuffled` |
| "Selection is the lever" | **refuted for this object**, which is what R22 exists to test by changing the object |
| "Dose is worth about two points and arrives with the first item" | **fourth reproduction**, now across cleared packs as well |

**15.7 What is still not verified.**

1. **Whether a utility score carries signal with more than one observation per item.** The premise of a
   per-item effect is a second observation of that item, and this record has 1.2 per credited rule. The
   claim "clearance does not work" and the claim "this lane cannot estimate a per-item effect" differ by
   exactly that quantity, and the registration declined to conflate them.
2. **Whether the 39 questions where the packs differed contain the effect.** They split 6–6, which is
   uninformative in both directions at that size, and no post-hoc subset reading is licensed.
3. **Whether raw evidence is the missing substrate.** That is R22, registered and dispatched in the same
   iteration, and it is the only arm in this record that changes the object rather than a filter over it.

**15.8 Reproducibility.** `prereg/R21-clearance.md` (prediction, refutation and Outcome), artefact
`eval/results/poc-sota-bird-clearance.json`, dispatch `41203470612` (success, 4,378 calls, 6 retries, 0
timeouts, 0 call failures, twelve gates pass, 26 minutes). `pnpm check`: 1,959 tests, 104 files, coverage
99.98 / 99.61 / 100 / 99.98.

## 16. Addendum — R22 (2026-10-31)

R22 asked the last content question this record can ask — does the correction have to be *interpreted* to
cost? — and the answer is that the interpretation is not the cost, the absence of interpretation is not the
cost, and the only text on this task that nobody has priced is the 142 characters the benchmark itself
supplies. **`full-raw` − `full` = −0.86pp** (20 gained, 23 lost, p = 0.7608, 95% CI [−4.57, +2.86]), and the
raw arm sits **1.43pp below its own shuffled control**.

**16.1 The confirmatory claim failed and the null clause did not fire, and the gap between those two facts is
the audit's finding.** The registration predicted +1pp or more; the measurement is −0.86pp. The null clause
required a difference within ±1pp **with an interval excluding +1pp**; this interval contains +1pp, so the
registration licenses neither the confirmation nor the sentence "the substrate is not the loss". What it
licenses is arithmetic that was available before the run: 43 discordant pairs at n = 350 give a paired
standard error of 1.87pp, so the interval is ±3.7pp wide and a 1pp claim was **below the design's resolution
when it was written**. R21 made the same mistake one iteration earlier (1–3pp against a 4.46pp minimum
detectable effect). The rule this audit adopts: **a confirmatory claim must exceed `1.96·sqrt(discordant)/n`,
estimated from the arms' expected disagreement before dispatch, or the iteration is exploratory by
construction.**

**16.2 The clause that fires is the control clause, and it disposes of the arm's content claim.**
`full-raw` − `full-raw-shuffled` = −1.43pp (19/24, p = 0.5424, bootstrap CI [−5.14, +2.29]). The shuffled arm
shows real SQL from the same database about other questions; the treatment shows this question's own
correction. They are indistinguishable, with the treatment nominally lower. Whatever the arm measures, it is
not knowledge about the question in front of it.

**16.3 Three text forms, one reading.** Ordered by characters the arms are shuffled 763, raw 864, distilled
1,083; ordered by accuracy they are 52.00%, 50.57%, 51.43%. The largest pairwise difference is 1.43pp with
every p > 0.54, and each sits 2.0–3.4pp under `none`. Pooled against `none` the three arms gained 40 and lost
68 over 1,050 arm-question cells — **−2.67pp, exact p = 0.0091** — reported as **exploratory**, since pooling
arms inside a question is not independent and the registration spent its resolution on the paired claim.

**16.4 One instrument failed and the artefact diagnosed it.** The first dispatch `41205745555` ran to
completion (1,754 calls, 640 corrections, every other gate green) and failed `V46-raw-is-verbatim` at
`1103/1632`. The ratio decomposes exactly: 544 rendered events × 3 lines = 1,632 cells; 1,088 question and
correction lines plus 15 single-line attempts = 1,103. The check split the payload on newlines and compared
each line to a field, so **every multi-line SQL query read as a rewritten one** — 346 of 350 replies write SQL
over several lines. The unit is now the block, the check is strictly stronger than the registered one (a
reordered block that the line split would have credited now fails), and the gate prints the first rejected
span. The run was not read, per the clause that says so in advance.

**16.5 The generalisation instrument widened nothing, for the fourth dispatch running.** `V44-domain-accounted`
reports `156 item(s) with no domain, 156 arrived unscoped, 0 widened`. Four dispatches, four zeros, and the
repair is identified; it is queued behind the current line because it would change the store under every
number in this addendum.

**16.6 Claims that change.**

| Claim | Status after R22 |
|---|---|
| "The interpretation is what costs, so raw evidence should pay" (Raw-RAG, arXiv 2610.30755) | **refuted on this task**: −0.86pp against the distilled note, with the interval containing the registered +1pp |
| "Raw evidence is the strongest memory baseline" | **does not transfer** to a setting where the question carries its schema, its evidence and its database |
| "A raw pack whose subject changes is a weaker treatment" | **refuted**: the shuffled control is 1.43pp *above* the treatment |
| "Selection is the lever on this object" (R21) | remains refuted, and is now joined by the object itself |
| "The deficit is two to four points and all prompt-level repairs leave it standing" | **extended to a fifth axis** — the substrate — and the pooled cost of any text is −2.67pp at p = 0.0091 |

**16.7 What is still not verified.**

1. **Whether any text can help on this task at all.** Every arm, including `none`, ships the question's BIRD
   `evidence`: about 142 characters of curated, per-question, human-written knowledge. It has never been
   ablated, and until it is, "text cannot help here" and "retrieved text cannot help here" are the same
   sentence. This is R23 and it is the cheapest experiment in the record: no store, no retrieval, one block
   removed from two arms.
2. **Whether abstention recovers the loss.** The product decision R22 named in advance is to show nothing by
   default; making that a policy rather than a default needs a per-question gate and a control that abstains
   on the same number of questions chosen at random, and it is worth running only if R23 shows text has any
   value to gate.
3. **Whether the 350-question panel can resolve anything smaller than 2pp.** It cannot, and the two
   pre-registrations that asked it to are the evidence. A panel large enough to resolve 1pp is a different
   budget line, not a different analysis.

**16.8 Reproducibility.** `prereg/R22-raw.md` (prediction, refutation, instrument correction and Outcome),
artefact `eval/results/poc-sota-bird-raw.json`, dispatch `41213200296` (success, 1,755 calls, 2 retries, 0
timeouts, 0 call failures, twelve gates pass, 90 minutes). The first dispatch `41205745555` is recorded above
as an instrument failure, not as a result. `pnpm check`: 1,965 tests, 104 files, coverage
99.98 / 99.61 / 100 / 99.98.

## 17. Addendum — R23 (2026-11-01)

R23 was not an experiment about memory. It was the positive control this record had never run, and it came
back at **+24.86pp**: `none` 54.57% against `none-noevidence` 29.71%, 96 questions gained and 9 lost, exact
p below 1e-4, interval [19.71, 30.00], on a manipulation three independent papers price at 8 to 21 points.
The instrument is calibrated. **The twenty-two nulls above it are nulls about memory, not about sensitivity,
and that is now measured rather than assumed.**

**17.1 The control was available in the prompt the whole time.** BIRD attaches a curated, human-written
`evidence` sentence to every question — 350 of 350 here, 25 to 468 characters, mean 142. The shipped prompt
always carried it, so every published number in this repository was measured on top of a block whose removal
the field already prices. Twenty-two iterations varied the note and none varied its competitor. The lesson is
an audit rule: **before reporting a null, find the largest manipulation the baseline contains and remove it.**

**17.2 The registration's claim held and one of its predictions failed, and the failure is the finding.** The
bar was ≥8pp with a point estimate near 12; the effect is 24.86pp, above the interval's own lower bound of
19.71. The prediction that `full-noevidence` would remain below `none-noevidence` — "the pack's 2–4 point
cost is not something a smaller prompt removes" — is refuted: **+1.14pp**, p = 0.5847, the first non-negative
cell in the record. With the hint present the same pack is −4.86pp, p = 0.0076.

**17.3 The interaction is the mechanism and it is registered, not fished.** `(full − full-noevidence) − (none
− none-noevidence)` = **−6.00pp**, bootstrap 95% CI [−10.57, −1.71], 19 questions up, 37 down, 294 flat. It
excludes zero and clears the pre-declared |DiD| ≥ 4pp bar, and it says the pack absorbs **24.1%** of the
hint's value. Read against the two pack contrasts — −4.86pp with the competitor, +1.14pp without — the
substitution is one-directional and complete enough to explain the whole deficit this record has chased:
**the cost of showing a note is not a property of the note.**

**17.4 What this retroactively says about eight earlier iterations.** R12 (irrelevance), R13 (scope), R14
(substrate), R16 (dose), R17 (framing), R18/R20 (order and permission), R21 (selection) and R22 (raw form)
each priced one axis of the note and each landed at or below no memory. None of them is contradicted here;
all of them are **re-scoped**. Each was measured in a competition the note was losing for reasons none of
them could see, and their nulls are statements about that competition rather than about the axis. The correct
summary of the eight is not "none of these help" but "none of these helps *against a curated hint*".

**17.5 The two predictions the panel could not test.** Moderate `n = 248` at +25.00pp and challenging
`n = 102` at +24.51pp — 0.49pp apart, with no simple questions on this panel at all because `poolOf` drops
the easiest third. The literature's difficulty gradient spans three levels and this panel has two, so the
shape prediction is **unresolved**, and the audit records it as unresolved rather than as a flat effect. The
second is the record's own resolution: MDE 4.87pp at n = 350 means nothing below ~5pp can be concluded here,
and 24.86pp proves the instrument works at the scale it can reach.

**17.6 A new instrument fact: the anchors are not reproducible across dispatches.** `none` 54.00 → 54.57 (2
questions) and `full` 51.43 → 49.71 (6 questions) on identical questions between R22 and R23, because the
store is rebuilt by a live distillation pass each time — 632 corrections and 1.79 items per question here,
640 and 1.82 there. **Cross-dispatch cells carry one to two points of store variance.** This is larger than
several deltas the record has published (R22's −0.86pp, R20's +0.57pp, R18's −1.14pp). The rule the audit
adopts: **a cross-dispatch delta below two points is not a result**, and a run that wants to compare to an
earlier one must re-measure the anchor in the same dispatch. Every claim in this addendum is within-dispatch.

**17.7 Claims that change.**

| Claim | Status after R23 |
|---|---|
| "Showing any text costs about two and a half points" (R22) | **conditional**: −4.86pp against a baseline that carries curated knowledge, +1.14pp against one that does not; the cost belongs to the competition |
| "The deficit is 2–4 points and every prompt-level repair leaves it standing" | **re-attributed**: it is not a deficit of the note but of the note's job, which was already done |
| "Abstain by default" (R22's product decision) | **becomes a switch**: abstain where the question carries curated knowledge, inject where it does not |
| "This lane's numbers are nulls about memory" | **confirmed** — the positive control fires at 3× its registered bar, so the nulls are not an artefact of an insensitive instrument |
| "Every arm in the record is at or below no memory" | **false as stated**: `full-noevidence` is +1.14pp above its own baseline |
| "The panel resolves 2pp" | **false, and now measured**: MDE 4.87pp; the 24.86pp control proves the instrument works at the scale it can reach |

**17.8 What is still not verified.**

1. **Whether 24.86pp survives the split every competitor used.** Minidev drops the easiest third, so the
   headline is a moderate-and-challenging estimate quoted against whole-split numbers (12.71, 14.36, 18.37,
   20.01). R24 re-runs the identical 2×2 on `dev` at 1,534 questions with the store size held at 280 learn
   rows per fold, which also brings the +1.14pp cell and the difficulty gradient inside the instrument's
   reach. It is dispatched and its claims are registered in `prereg/R24-dev-split.md`.
2. **How much of the 24.86pp the database can supply.** The two channels exist and have opposite histories:
   `values` read +0.29pp with the hint present, `linked` read −7.43pp, and neither has been measured where
   the competitor is absent. It is deferred behind R24 because its natural claim (≤3pp) sits below even the
   dev floor — which is the same defect, a claim smaller than its instrument, that this audit has now
   recorded three times.
3. **Whether the interaction holds at another dose.** −6.00pp was measured at 1.79 items and 1,067
   characters. A pack at half the size, or at twice, would say whether substitution is a fixed transfer or a
   function of how much text is offered.

**17.9 Reproducibility.** `prereg/R23-evidence.md` (the literature table, the 2×2, the resolution computed
from expected discordance, the prediction, five refutation clauses and the Outcome), artefact
`eval/results/poc-sota-bird-evidence.json`, dispatch `41223844474` (success, 1,758 calls, 8 retries, 0
timeouts, 0 call failures, twelve gates pass, 16 minutes). `pnpm check`: 1,975 tests, 104 files, coverage
99.98 / 99.62 / 100 / 99.98, `sota.ts` and `validation.ts` at 100 on all four.

## 18. Addendum — R24's first dispatch, and the phase that could stop the lane for two hours (2026-11-01)

**18.1 The dispatch published nothing, and it was not the hypothesis.** `41226847922` ran the registered
R24 design (`split=dev`, `learn_sample=280`, four arms, 1,534 questions) and produced no artefact at all.
Last progress line 19:17:48, step timeout 21:15:44, nothing in between. The event is `failure` on step 11,
and steps 12, 19 and 20 failed behind it because there was no artefact to attribute, publish or upload. The
step that uploads `poc-sota-bird-dev.partial` succeeded and found no file, because the lane never reached its
own stop path — it was killed by the runner, not by its own budget or its own clock.

**18.2 The log localises it to one phase, without inference.** The lane prints during three phases of a fold
and not during the fourth:

| fold | learning | distillation | evaluation | judging | fold line |
|---|---|---|---|---|---|
| 1 | prints every 16 | prints every 4 | prints every 20 | **prints nothing** | 18:06:39 |
| 2 | prints every 16 | prints every 4 | prints every 20 | **prints nothing** | 19:14:01 |
| 3 | prints every 16 | prints every 4 | prints every 20 | **prints nothing** | never |

Every printing phase was healthy; the fold-1 evaluation pass finished at 18:00:53 and its fold line arrived
5.8 minutes later, and the fold-2 pair is 18:10:47 → 19:14:01, a 63.2-minute silence. Fold 3's evaluation
ended at 19:17:48 and the fold line never came. The unnamed phase is judging: execute the statement the model
wrote, compare its rows to gold, per plan.

**18.3 Why a phase can spend two hours without the lane's own deadline noticing.** `DatabaseSync` is
synchronous, so a slow statement blocks the process inside a native call. The lane's wall-clock limit is
checked between model calls, and there are none during judging; timers do not run either, because the event
loop is the thing being blocked. A three-way cross join over two thousand rows is a billion-row nested loop,
and a model that joins one table twice writes one about as often as it writes a correct answer.

**18.4 The mechanism was chosen by measurement, not by preference.** Both candidates were timed against a
statement that does not finish:

| container | kill latency | spawn cost |
|---|---|---|
| `worker_threads`, stuck in the driver | **50.5 s** | ~10 ms |
| child process, `SIGKILL` | **0 ms** | 19 ms |

A worker's `terminate()` can only be honoured when the native call returns, so a 250 ms deadline still cost
50.5 seconds of wall clock — and a fold has a thousand statements. The child was chosen and the deadline was
set to 20 s, two orders of magnitude above a healthy statement on this data.

**18.5 What was built.** `packages/eval/src/sql-guard.ts` (`BoundedSql`): a pool of child processes, one
statement at a time each, a deadline that ends a statement by killing its process, a row cap applied inside
SQLite (`SELECT * FROM (…) LIMIT cap + 1`, so unread rows are never materialised), and a replacement child for
the next caller. `outcomeOf` and `unexecuted` moved into `sql-exec.ts` so the guarded path and the synchronous
path describe a result identically — a second description would have been a second thing to be wrong.

**18.6 The instrument that says whether the fix is working.** `V48-statements-answered` is blocking: at least
99% of statements must answer inside the deadline, and the artefact carries
`statements: { statements, deadlines, truncations, deadline_ms, row_cap }`. Zero statements fails: `0/0` as a
share would pass a run that never reached judging. The judging phase prints every 200 plans, so the phase that
caused this is no longer the only silent one.

**18.7 Two dead branches were removed rather than covered.** An `error` listener on the child was dropped
because a failed spawn emits `error` and then `exit`, and the `exit` listener was itself unreachable in every
test and every shutdown path: a child that is already gone makes `send` fail first, and that callback is what
reports the death. A child that dies *after* the message is written is bounded by the deadline instead — one
rare event, mislabelled as a deadline, in exchange for no handler whose ordering decides a label.

**18.8 What this changes about R24, and what it does not.** `prereg/R24-dev-split.md` carries Amendment 1:
the first dispatch produced no number, so no claim in the file was tested by it; the deadline and V48 are added
to the gates, and the design, arms, sample and predictions are unchanged. **The run this file describes has
still never been executed**, which is the only defensible thing to say about a dispatch that reached 82
minutes of a 130-minute budget without publishing a fold.

**18.9 Reproducibility.** Guard: 11 tests. Gate: 4 tests (absent, pass, fail on a rate, fail on zero).
`pnpm check`: 1,995 tests, 104 files, coverage 99.98 / 99.60 / 100 / 99.98 with `sql-exec.ts` at 100 in all
four dimensions and `sql-guard.ts` at 100 / 97.87 / 100 / 100.

## 19. Addendum — R24's verdict: composition, not inflation, and a mechanism withdrawn (2026-11-01)

**19.1 The dispatch.** `41245819288` on `5ceee75`, 32 minutes, 1,534 questions, 5 folds, 6,571 calls, 0 call
failures, 0 timeouts, 13 gates pass. `V48-statements-answered` read **16 of 10,160 statements at the 20 s
deadline (0.16%)** and 130 results truncated at the row cap (1.28%) — the instrument added after 18.1 did its
job on its first run, on a dispatch that would otherwise have been indistinguishable from the one that
published nothing. `V47-evidence-ablated` certified the manipulation in both directions: `none` 1386/1386 and
`full` 1386/1386 carrying the sentence, `none-noevidence` 0/1386 and `full-noevidence` 0/1386, with the 148
questions whose row carries no evidence skipped in both.

**19.2 The four cells and the five contrasts.**

| cell | accuracy | n |
|---|---|---|
| `none` | **57.43%** | 881/1534 |
| `none-noevidence` | 39.83% | 611/1534 |
| `full` | 56.84% | 872/1534 |
| `full-noevidence` | 40.55% | 622/1534 |

| contrast | pp | 95% CI | discordant | p |
|---|---|---|---|---|
| evidence, no pack | **+17.60** | [+15.38, +19.82] | 315/45 | <1e-4 |
| evidence, with pack | **+16.30** | [+14.14, +18.58] | 300/50 | <1e-4 |
| pack, with evidence | +0.59 | [−0.91, +2.09] | 73/64 | 0.4944 |
| pack, no evidence | −0.72 | [−2.15, +0.72] | 60/71 | 0.3824 |
| interaction (DiD) | −1.30 | [−3.06, +0.46] | 86 up / 105 down / 1343 flat | — |

**19.3 Two predictions held, two failed, and one failure took its own explanation with it.** Main effect ≥8pp
held at 17.60. `none` between 50% and 58% held at 57.43. `pack, no evidence ≥ 2pp` **failed** at −0.72. The
interaction **≤ −4pp** failed at −1.30 with an interval containing zero. And the registered prediction that the
dev interval would *contain* 24.86 failed — `[15.38, 19.82]` excludes it — **while the registered explanation
for that failure also failed**: restricting the same dispatch to moderate-and-challenging (n = 609) gives
**+22.99pp [19.21, 26.77]**, which contains 24.86. The registration had assumed an exclusion would mean minidev
overstates; it in fact means the two panels describe different populations.

**19.4 The composition was verified arithmetically, not argued.** The whole split is 925 `simple` questions at
**+14.05pp** and 609 moderate-or-challenging at **+22.99pp**; `925/1534 × 14.05 + 609/1534 × 22.99 = 17.60`,
the measured number to two decimals. No free parameter. The three levels are monotone (`+14.05`, `+22.63`,
`+24.14`) and both end levels fall inside their pre-registered bands (5–15, 18–30). The simple-to-moderate step
is **+8.58pp ± 5.24** and resolved; moderate-to-challenging is **+1.51pp ± 9.38** and **not** resolved, so the
gradient's top end is reported as open rather than fitted.

**19.5 A mechanism is withdrawn from the record.** R24's refutation clause read: *"an interaction whose
interval contains zero demotes the competition reading from a mechanism to a single-run observation, and that
outcome would send the line back to selection work rather than forward."* The interval contains zero. The clause
fires against this project's own R23 conclusion, and the record now carries substitution as **one dispatch's
observation** (−6.00pp, n = 350) rather than as an account of twenty-two iterations of negatives. The
downstream consequence is recorded in ROADMAP: **R25's premise was that the pack was losing a competition, and
at 1,534 questions it is not in one**, so the database-substitution design is withdrawn from the queue and the
line turns to selection.

**19.6 What the pack's two nulls do and do not license.** +0.59pp [−0.91, +2.09] with the hint and −0.72pp
[−2.15, +0.72] without it are both indistinguishable from zero and both below the 2.14pp the design detects.
The one cell in this record that was ever not negative — R23's +1.14pp, 13 gained against 17 lost — **does not
replicate at 4.4× the sample**. The admissible statement is *the pack is null in both conditions*; "the pack
pays without a competitor" is withdrawn, and the product's abstention switch is now justified by inertia rather
than by a penalty. A null is not a cost, and it is also not a gain.

**19.7 Store variance, disclosed in the artefact's own units.** Per-fold, the evidence effect runs **14.98 to
21.50pp** and the pack's runs **−2.28 to +3.26pp** across five stores rebuilt from identical corrections — the
±1.7pp band of 17.6, now visible per fold. R23's −6.00 and R24's −1.30 are **not** reconcilable by subtraction:
the stores differ. Every claim in sections 19.2–19.6 is within this dispatch.

**19.8 Reproducibility.** `pnpm check`: 2,000 tests, 105 files, coverage **99.98 / 99.60 / 100 / 99.98**;
`sql-exec.ts` 100 in all four dimensions, `sql-guard.ts` 100 / 98.07 / 100 / 100; `V48` covered by four tests
(absent, pass, fail on a rate, fail on zero). Artefact `eval/results/poc-sota-bird-dev-R24-dev-split.json` is
committed; `prereg/R24-dev-split.md` carries the Outcome section, and the number a cross-system comparison must
use is **17.60pp**, not 24.86pp.

**19.9 The dev artefact was the address of two designs, and the second write deleted the first's evidence.**
The dispatch wrote `eval/results/poc-sota-bird-dev.json` because the artefact's name was the *split's* name and
this is the second design to run on `dev`. The first is R8.3b, and its run is the file `eval:protocol`
recomputes the `reproduced` cell from — 57.63% against the published 53.52, +4.11pp, inside the 4.97pp
tolerance. Copying R24's artefact in replaced it. Nothing failed at the write: what landed is a valid artefact
of the same lane on the same 1,534 questions, with a different store and a different `none` (57.43%). The
displacement was found by `pnpm check`, in the one gate that recomputes the cell instead of quoting it —
`the recorded comparison differs from the arithmetic (indicative at 0.19pp, reproduced at 3.91pp)` — which is
the whole reason that gate exists, and it is the third time this record can thank a derivation for a defect
it would otherwise have documented as a number.

The fix is a naming rule, not a warning. `artefactWriteIdOf` in `packages/eval/src/artefacts.ts` names the file
after the *design* as well as the split: a run that names a pre-registration appends that id to the split's
own (`poc-sota-bird-dev-R24-dev-split.json`), a re-dispatch of the same pre-registration writes the same file,
and a run with no pre-registration keeps the split's name exactly as before. The rule lives in a tested module rather than in the
lane, an id that is a path is refused, and `sota.yml` spells the same expression once at workflow level so a
dispatch's write path and its upload path cannot disagree. R8.3b's artefact is restored byte-for-byte, R24's is
committed beside it, and five tests cover the rule (named file, one design one file, hand-run unchanged, two path-shaped
ids refused, id read from either spelling). One more gap closed on the way: `eval:protocol` was in the local
check and not in `ci.yml`, so the gate that recomputes the cell never ran on a push — it is a step now, and the
defect that motivated it cannot land again by a path CI owns.

## 20. Addendum — R25: the dose was selection, and the instrument ran out first (2026-11-01)

**20.1 The dispatch.** `41256898122` on `ee87629`, 33 minutes, 1,534 questions, 5 folds, **9,096 calls**, 0
call failures, 0 timeouts, **14 gates pass**. `V48-statements-answered`: 18 of 12,774 statements at the 20 s
deadline (0.14%), 172 truncated at the row cap (1.35%) — 4,000 fewer statements than R24 executed, because
`full-accepted` empties the prompt on a third of the questions. Four arms, two of them new.

**20.2 The arms and the eight contrasts.**

| arm | accuracy | n | rules/question |
|---|---|---|---|
| `none` | 57.17% | 877/1534 | — |
| `full` | 57.11% | 876/1534 | 1.74 |
| `full-one` | 56.78% | 871/1534 | 1.00 |
| `full-accepted` | **57.63%** | 884/1534 | 0.67 |

| contrast | pp | 95% CI | discordant | p |
|---|---|---|---|---|
| `full-one` − `full` | **−0.33** | [−1.56, +0.85] | 42/47 | 0.6718 |
| `full-one` − `none` | −0.39 | [−1.76, +0.91] | 52/58 | 0.6338 |
| `full` − `none` | −0.07 | [−1.50, +1.30] | 60/61 | 1.0000 |
| `full-accepted` − `full-one` | **+0.85** | [−0.13, +1.83] | 35/22 | 0.1112 |
| `full-accepted` − `none` | +0.46 | [−0.78, +1.69] | 52/45 | 0.5426 |
| `full-accepted` − `full` | +0.52 | [−0.85, +1.83] | 58/50 | 0.5008 |

The lane's own `arm_pairs` recomputed `full-one − full` as −0.33 [−1.56, +0.85] p = 0.6718 and
`full-accepted − full` as +0.52 [−0.85, +1.83] p = 0.5008; the CLI at `pnpm eval:arm-contrast` reproduced the
first from the committed artefact to four decimals, and reproduced R24's `pack, no evidence` on R24's
artefact exactly (−0.72 [−2.15, +0.72] p = 0.3824, 60/71). **Two implementations, one number.**

**20.3 The dose effect does not survive being made causal.** The store had been reporting a dose reading for
two iterations: dose-2 questions 4.13pp above dose-1 in R24's store, 3.12pp in this one (dose-1 n=401
**+2.24pp**, dose-2 n=1,133 **−0.88pp**). The registered prediction was `full-one − full ≥ +2pp`. Measured:
**−0.33pp**, with an interval excluding anything above +0.85. The observational reading was **selection** —
the store allocated its second item to the questions it had more to say about, and those were the questions
where a note of either length was worth more. **Two of six predictions are refuted by this arm**, and both
were the ones the record had been relying on.

**20.4 Per-question admission is the largest positive point estimate in the line and still not a result.**
`full-accepted` fits a coverage floor per fold on that fold's learning rows, maximising `helped − harmed`
subject to keeping ≥50% of rows and ≥8 decisive rows, then admits or refuses the one-item pack per question
on the evaluation set. Measured **+0.85pp [−0.13, +1.83], 35 gained against 22 lost, p = 0.1112**, admitting
**1,027 of 1,534 (66.9%)** at **0.67 rules/question**. `V50-admission-engaged` read `fitted` on five of five
folds, floors **0.111–0.200**, kept **51–84%** of decisive-bearing rows. **The interval's lower bound excludes
harm above 0.13pp — no pack arm in this record has ever had that — and it does not exclude zero**, which is
what the registration predicted.

**20.5 A free test–retest, and it is the run's main methodological product.** The 507 refused questions
received a prompt byte-identical to `none`, and they moved **4 gained / 3 lost against `none`** — **1.4% of
507**, inside the 1.4–2.6% band R17's `none-replica` arms established, measured here without a dedicated arm.
The admission arm's +0.85pp is 3.4pp of gross movement on top of that floor. **Any future claim on this lane
now has a noise floor the lane produces about itself**, which is what turns §20.7 from an argument into
arithmetic.

**20.6 The registered clause fired and the pack line is closed.** The clause: *"If `full-one − full` and
`full-one − none` both have intervals containing zero, the pack line is closed at every budget."* Both do
(+0.85 and +0.91 headroom). Recorded as closed at every budget, with the product statement *no pack before
the question* — the behaviour iteration 90 shipped, now with a dev-scale interval around it.

**20.7 The measurement ceiling, stated as a ratio.** `V5-resolution` MDE **2.01pp**. Two oracle ceilings on
R24's artefact with the key in hand: **+2.35pp** dropping every net-harmful item, **+4.17pp** keeping the pack
exactly where it helped. Every arm in this run is inside ±1pp. **The oracle's price for a perfect pack is
1.17× the effect this instrument can detect**, so no further pack experiment on BIRD dev can produce a
distinguishable result, whatever the mechanism does. This is a property of the split, not of the store, and
it is now the binding constraint on the whole programme.

**20.8 Two defects in the new tooling, both caught before the dispatch.** (a) `admissionFloor` computed its
population floor as `Math.ceil(Math.max(1, policy.minKept) * total)` — the *share* clamped to 1 instead of 1%
— so every fold returned the lowest threshold keeping at least everyone and `full-accepted` would have
degenerated silently into `full-one`, publishing a null that was a bug. **Its own tests failed on first run**
(`expected 0.5 / 0.9 to be …`); fixed to `Math.max(1, Math.ceil(policy.minKept * total))`, and
`parseAdmissionPolicy` now **rejects** values outside (0, 1] rather than clamping them, because clamping a
policy is how a configuration error becomes a scientific result. (b) `parseContrastArgs` failed on its first
real call — `--left a --right b` threw `unknown flag: --right` because the single-value parser had only ever
been read once per arm. Extracted to its own module, rewritten as one pass that collects both flags and pairs
them by position, eight tests. **The first defect would have cost a 33-minute dispatch; the second would have
cost one command.**

**20.9 What held, and the fold picture.** `full − none` at −0.07pp [−1.50, +1.30] contains R24's −0.59pp, so
the anchor is stable across two stores built from different learning passes. `V49-dose-truncated`: **1,133 of
1,534 prompts (73.9%) differ from `full` and 0 exceeded one item** — the check that makes `full-one` a dose
control rather than a duplicate of `full`, and it passed on its first run. Per fold, `full-accepted − full-one`
ran **−0.33, +3.26, −1.30, +0.98, +1.63**; `full-one − full` ran **0.00, −1.30, +1.30, −1.63, 0.00**. By
difficulty, `full-accepted − full-one` is `simple` **+0.65pp**, `moderate` **+2.16pp** (13/3), `challenging`
**−2.07pp** (0/3 on three discordant questions). At n=145 the last cell is a shape and is recorded as one.

**20.10 Verification.** `pnpm check` green: **2,044 tests, 107 files, 99.98 / 99.61 / 100 / 99.98**, with
`dose.ts`, `arm-contrast.ts`, `artefacts.ts` and `sota.ts` at 100.00 on all four dimensions. Two branch gaps in
`sota.ts` (2291, 2315 — the two zero-denominator guards on `V49` and `V50`) were found by the coverage gate and
closed with two tests rather than an ignore. `pnpm eval:protocol` re-derives `R25-dose-and-admission` over
`full-one, full-accepted` at n=1534 against V1…V50 from the committed artefact. Nothing in this addendum is
quoted from a log: every number is read from `eval/results/poc-sota-bird-dev-R25-dose-and-admission.json`, and
the contrasts are re-derivable by `pnpm eval:arm-contrast` from the file in the repository.

## 21. Addendum — R26: the pruner was the harm, and the annotator is bounded (2026-11-01)

**21.1 The dispatch.** `41264432646` on `ba3310c`, 28 minutes, 1,534 questions, 5 folds, **6,504 calls**, 0 call
failures, 0 timeouts, **13 gates pass**. `V48`: 14 of 10,135 statements at the 20 s deadline (0.14%), 126
truncated (1.24%). `V5-resolution`: **2.07pp**. Four arms — `none`, `full`, `values`, `linked` — and the first
run in which two of them manipulate the *prompt's knowledge* rather than the memory.

**21.2 The arms.**

| arm | accuracy | n | delta vs `none` | 95% CI | discordant | p |
|---|---|---|---|---|---|---|
| `none` | 57.43% | 881/1534 | — | — | — | — |
| `full` | 57.76% | 886/1534 | +0.33 | [−1.11, +1.76] | 67/62 | 0.7249 |
| `values` | **58.60%** | 899/1534 | **+1.17** | [−0.13, +2.48] | 64/46 | 0.1046 |
| `linked` | **48.17%** | 739/1534 | **−9.26** | [−10.95, −7.63] | 24/166 | <1e-4 |

The lane's own pairs are stricter and agree in direction: `values` +0.85pp [−0.78, +2.54] (87/74), `linked`
−9.58pp [−11.54, −7.56] (55/202).

**21.3 The gate is new and it passed on its first run.** `V51-channel-applied` read **`values` 1534/1534 =
100.0%** and **`linked` 558/1534 = 36.4%**. The two floors differ by design — annotation is unconditional,
pruning binds only when the question names tables — and the pruner's share is printed rather than thresholded,
because a gate that encoded this record's guess about how often a linker binds would be a comment with a
threshold. **Had `linked` fired on no question, its −9.26pp would have been `full`'s +0.33pp**, published as
"pruning is inert". Six tests cover the gate: absence, pass, a sub-floor annotation, the exact 95% boundary
(1458 vs 1457 of 1534), a pruner that never fired, and the zero denominator.

**21.4 A registered clause fired against the better number.** Prediction 2 asked for `values − none` inside
[−2, +2] with a half-width ≤ 1.6pp. The point estimate is +1.17pp and the half-width 1.31pp — the largest
positive prompt-side estimate in twenty-six iterations — and the interval's upper bound is **+2.48**, outside
the band. The refutation clause was registered on the interval: *"an interval containing zero and a half-width
of at most 1.6pp closes the value channel as a prompt annotation."* **Both conditions hold and the channel
closes.** The rule was written before the result was known, and the result is exactly the case the rule was
written for: a positive point estimate that the instrument cannot separate from zero.

**21.5 The pruner's harm replicated and grew.** R21's −7.43pp (7/33 at n=350) becomes −9.26pp [−10.95, −7.63]
(24/166 at n=1,534) with the pilot at −7.71pp. This is the largest single-arm effect in the record, it is
4.5× the split's floor, and its interval excludes zero by 7.6pp. Difficulty: `simple` −10.2pp, `moderate`
−8.4pp, `challenging` −5.5pp — a pruner costs most where the question is easiest, which is what deleting the
table the hint names does. **The lane's whole-DDL baseline was correct all along**, and the competitor
ablations that price schema linking at 12.71pp measure systems that begin from a pruned schema.

**21.6 Both artefacts are committed and both are re-derivable.** `eval/results/poc-sota-bird-dev-R26-channels.json`
(5.0 MB) is the registered run; `eval/results/poc-sota-bird-R26-channels.json` (1.7 MB) is the 350-question
pilot that proved the gate before the registered dispatch, with `values` +1.43pp [−1.43, +4.29] (15/10),
`linked` −7.71pp [−11.14, −4.57] (4/31) and `full` **−4.00pp** [−7.14, −1.14] — the ninth minidev pack reading
that does not survive the split, against two channel readings that do. `pnpm eval:protocol` re-derives both
against `prereg/R26-channels.md` and its thirteen declared gates. `pnpm check`: **2,050 tests, 107 files,
99.98 / 99.61 / 100 / 99.98**, `sota.ts` at 100 on all four dimensions.

## 22. Addendum — the protocol audit: a claim about itself that the code did not support (2026-11-01)

**22.1 What was audited, and why it was not a run.** No dispatch, no call, no new number. The object under
audit was the repository's own positioning sentence — *a general feedback flywheel* — against the code that is
supposed to make it true. Five defects, none of them a wrong number, all of them the kind that shape which
experiments get designed.

**22.2 D1 — "competitor" was never defined, and one control was read as one.** `COMPETITIVE.md` listed systems
from three unrelated roles under one title. RSL-SQL has never been a product alternative; it is a
bidirectional-linking text-to-SQL system whose published value to this project is a **12.71pp schema-linking
ablation on the same 1,534 questions** — the same unit as our 17.60pp evidence ablation, and not the same unit as
our EX. Consequences observed in the file's own history: the "same cell, 0.09pp apart" misreading (§1, corrected
R8.3), the "20 points come from schema linking" inference (§2, demoted in R24), and a 24.86pp effect quoted
against systems measured on a different population (§4, corrected in R24). **Three misreadings, one cause: a
control's Δpp being answered as though it were a competitor's EX.** Fixed by §0 of that file, and by a `role`
column on both tables.

**22.3 D2 — thirty-one gates, one caller.** `buildValidityGates` is called from `sota-bird.ts` and nowhere else.
The τ²-bench lane, which is the only second scenario in this repository, does not import it and writes three
gates inline. The measurement layer therefore has the *shape* of a protocol and the *customer count* of a habit.
This is the load-bearing defect: every claim in this record about rigour is a claim about those 31 gates, and
none of them has ever been applied to anything but BIRD dev.

**22.4 D3 — a failing gate that narrated itself instead of stopping the run.** The τ² lane's own
`l4-resolution` gate requires a 95% half-width ≤ 5pp; the measured value is **14.98pp** at n = 68. The gate is
marked `blocking: false` and the failure is written into `notes` rather than into a verdict, so the artefact
records a +1.47pp delta as if the design could see one. **A non-blocking gate that fails and is narrated is a
gate that does not exist** — the same defect class as R25's `V49`, where the fix was to make the reading
blocking. `V5-resolution` on the SQL lane is blocking for exactly this reason.

**22.5 D4 — the artefact's own arithmetic was the only defence, and it covers one lane.** `artifact-schema.ts`
validates that a run's numbers reconcile: arms sum to n, discordant pairs match the delta, shares sum to one. The
τ² artefact passes because it is a different shape, and nothing validates it. The protocol package takes the
validator, which is the point: **a lane that reports its own arithmetic is a lane that can be wrong in a way
nobody checks.**

**22.6 D5 — an outcome-blind rule that lived in prose.** §135 established that a stratum defined by an arm's
outcome measures regression to the mean, and the rule has held since by discipline alone: nothing in the type
system prevented `strata` from receiving an outcome. The `LaneAdapter` signature fixes it structurally —
`strata(task)` receives a task and nothing else — which is the difference between a rule and a convention.

**22.7 The coupling measurement, for the record.** `core` 7,074 lines with **zero** scenario words in production
code (every hit is in `__tests__`, where `task: 'sql.generate'` is a free-form scope string); `eval` 31,643 lines
of which 11,764 (37.2%) are text-to-SQL — `sota-bird.ts` 6,635, `sota.ts` 3,090 (mixed: 31 gates plus
`PROMPT_VERSION='sql-prompt/3'`, `extractSql`, `SqlArm`), eight SQL modules 2,039, τ² 754, the rest 19,125
(60.4%) measurement and statistics. **The library is not coupled to the scenario; the measurement layer is
unseparated from it.** Those are different repairs: the first would mean rewriting `core`, the second means
drawing a boundary that already exists in the dependency graph and has never been enforced.

**22.8 What is asserted after this audit, at the level the evidence supports.** Architecture-general: **yes** —
7,074 lines, no scenario type in a signature, two hosts embedding it (`node` 1,312, `browser` 301), subpath
exports that exclude the distiller. Mechanism-general: **no evidence** — scenario 1 is 26 iterations whose only
positive point is +1.17pp and was closed by its own registered clause, scenario 2 is n = 68 with a 15pp
half-width and a failing resolution gate. Commercially-general: **untouched**. The positioning sentence stays;
the claim behind it is demoted from assertion to hypothesis, and R27 is the first experiment that tests it as a
hypothesis rather than assuming it.

## 23. Addendum — two defects found by moving code, and one estimate found by measuring (2026-11-01)

**23.1 D6 — `V51` passed a channel that never fired.** The gate read `share >= floor`. A lane that declared a
floor of `0` therefore turned `0/100` into a pass, and the manipulation it was supposed to certify — a value
annotator that annotated nothing, a pruner that pruned nothing — became the control wearing the channel's name
with a green tick beside it. **This is the exact failure the gate was written to catch**, and it survived because
the only two floors in use (`0.95`, `0.01`) happen to be positive. Fixed by making `applied > 0` an invariant of
the gate rather than a consequence of a floor: the floor answers *how often must this happen to be this arm*, and
zero is not an answer to that question. No published artefact changed.

**23.2 D7 — `typecheck:lanes` was not strict.** The library compiles under `tsconfig.base` with
`exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`. The six CLI lanes were checked by a bare
`tsc --noEmit --target es2022 …` with neither, so the lanes were the least-typed code in a repository whose
stated standard is that the lanes hold the decisions. Turning `--strict` on surfaced **four real defects**:
`relevanceFor` and `reconcile` took an `ArmName`, which includes `none`, and indexed `item.arms[arm]` where
`arms` is a `Partial<Record<…>>` with no `none` key — a lookup that reads `undefined` and quietly scores the
no-memory arm as absent; and `scale.ts` wrote `intent: string | undefined` into a `KnowledgeScope` whose optional
field does not admit an explicit `undefined`. All four are fixed by narrowing the parameter to
`Exclude<ArmName, 'none'>` — which is also the true constraint, since a relevance split of a memory-less arm has
nothing to split — and by conditional spreads. **The gate is now as strict as the library it gates.**

**23.3 The scoping estimate was wrong by fifteen gates, and the error was the interesting part.** §136 divided
the gates into 22 portable and 9 scenario-bound by reading their **names**. `parse-rate` sounds like a parser's
gate, `pool-complete` like a candidate pool's, `channel` like a schema channel's. Re-deriving the split from the
`input.*` fields each gate actually reads gave **29 of 31**; counting the eight transfer ids — passed *into*
`transferGates` as arguments rather than written beside an object literal, so any `id:` scan misses them — gave
**39 gates, 37 portable, 2 scenario-bound**, and both of those read an optional field. **A name-based cut would
have parked nine portable gates in the adapter**, which is the fork the design exists to prevent. The wrong
number stays in §136 and the correction stays here, because the correction is the only evidence that the rule
was applied rather than quoted.

**23.4 The regression that makes the move admissible.** `pnpm eval:protocol` re-derives all **31 committed
artefacts** — thirteen pre-registrations in both directions, every rendered report, every cell comparison — and
passed on the first run after the extraction. Byte identity held through two structural changes that could have
broken it: `V4` left the array literal for a conditional push, and `V51`'s floors left the gate for per-entry
data. Both were possible only because the publication order is now explicit data (`GATE_ORDER`, 39 ids) instead
of the order the code happens to push objects in.

## 24. Addendum — R27 stage 2: the protocol had never said no (2026-11-01)

**24.1 The largest finding in this file is a count of zero.** Across the seventeen committed BIRD artefacts,
**34 distinct gate ids**, every gate every artefact carries **passes**. Not one published artefact has ever
carried a red verdict from the validity suite that exists to refuse them. The first failing gates in the whole
published record are the two the second scenario produced in this stage (`V5-resolution`, `l4-paired`), and they
arrived the moment a run that *should* fail was pointed at the apparatus.

A suite whose published output has only ever been green cannot be distinguished from a form. Every defect listed
in §22 and §23 was found by reading the code, not by a gate firing — `V51` passing a channel that never fired, the
ledger that never reached the file, the `V5` flag that was advisory. **The gate layer's own history is the
evidence that it was not enforcing anything**, and the repair is not a new gate; it is to measure a scenario the
gates were not written for and let them fail.

**24.2 A gate's signature being scenario-free does not make it evaluable, and the whole portability claim was
measured on the wrong noun.** §23.3 established "39 gates, 37 portable, 2 scenario-bound" by reading the fields
each gate touches. Stage 2 shows that count answers *does this gate belong to the protocol* and not *will this
gate fire for a lane*. `V45-clearance-dose-matched` names no scenario type and cannot fire without a clearance
arm and its dose-matched control. The measured answer for τ²: **9 supplyable, 30 arm-indexed, 4 firing, 2 of the
4 vacuous.** The count that was quoted as evidence of generality is a statement about signature hygiene, and the
generality claim it was attached to has been withdrawn from `COMPETITIVE.md` §0 and the README rather than
qualified.

**24.3 A required field that a lane cannot supply withholds the entire report.** `ProtocolGateInput` declared
eight fields mandatory, two of which (`meanPackIds`, the call tally) are knowable only to a lane that runs its
model in-process. τ²'s agent is a Python program and its calls are its own, so the lane could not call
`buildProtocolGates` at all: **four provable gates were withheld over two unstateable fields.** This is the same
class of defect as §22's `V51` and §23's `V4` — an instrument whose failure mode is silence — and it is repaired
the same way, by making the absence expressible. All eight fields are optional; a gate whose field is missing is
absent, and the artefact names the missing fact.

**24.4 Two of the seven gates that fire on every run have never quantified anything.** `V6-controls-inject`
evaluates `every` over an empty control list, which is true; it has printed *"no pack-based controls configured"*
in **17 of 17** published artefacts. `V7-channel` has printed *"no channel control was run"* in **16 of 17**. Both
are kept — the sentences are true, and deleting them rewrites seventeen committed files — but no count in this
project may report them as evidence. The audit separates them, and the separation is tested.

**24.5 `V5-resolution` had never been in a position to fail, which is why it was advisory.** Seventeen artefacts
carry it; seventeen pass, from 1.96pp to 4.87pp against a 6pp bar. A flag whose only failure case is the case it
exists for was carried for sixteen iterations without being exercised, and the run it should have stopped is the
second scenario: 68 paired tasks, 27 discordant, minimum detectable difference **21.41pp**, publishing a **1.47pp**
delta. The flag is now blocking, and no published artefact changes its verdict because none of them ever failed
it. **The change is admissible only because it was measured first**, which is the order this file has been
demanding since §12.

**24.6 The two resolution statistics share a name and differ by 43%.** The record has been quoting the 95%
half-width (14.98pp) while the gate reads the minimum detectable difference at 80% power (21.41pp); the ratio is
`2.802/1.96 = 1.43`. Neither is wrong and a reader cannot tell which one a sentence means. Both now travel in
`poc-l4-pair.json`, and the gate reads the one its own criterion names.

**24.7 What is still not closed — closed 2026-11-02 (`§34.12`).** Stage 3 moved the six SQL modules and the
row canonicaliser into `packages/sql` and made the coupling table a reading (`pnpm eval:coupling`, `V72`–`V74`);
`sota.ts` is the one module the split has not yet carved, and its 2,243 lines are named in `DEFERRALS` with that
reason rather than left implicit. The τ² lane cannot yet ingest a transcript,
so `V46-raw-is-verbatim` and `V47-evidence-ablated` are unreachable for a driver change rather than a gate
change. And five of the nine supplyable gates need a field the driver has never written: until R29 stage 1, the
lane's ceiling is nine and its floor is four, and every report says which.

## 25. Addendum — the record's deltas were never on a common scale (2026-11-01)

**25.1 One of seventeen published paired deltas exceeds its own minimum detectable difference.** Across every
committed artefact that carries a per-question paired comparison — seventeen of them, 350 and 1,534 questions —
exactly one delta is larger than the smallest difference its own sample could detect at 80% power:
`poc-sota-bird-transfer.json` at −4.57pp against a 4.53pp resolution. Five exceed their own 95% half-width, and
**all five are negative**. This is not a new test; it is the arithmetic the project already applies to a single
comparison (`V5-resolution`) applied to the record it wrote. The audit is `poc-power-audit.json`, recomputed byte
for byte in CI.

**25.2 The mechanism's best positive reading is smaller than the sharpest design in the record.** The `values`
channel returns +1.17pp on 1,534 questions (64 helped, 46 harmed, `[−0.13, +2.48]`, p = 0.1046). Its own minimum
detectable difference is 1.91pp. **The effect is 61% of what its design could resolve, and that design is the best
one the project has ever run** — the other four 1,534-question artefacts resolve 1.96 to 2.14pp and the thirteen
350-question ones resolve 3.76 to 4.87pp. Resolving +1.17pp at the observed discordance takes 4,100 paired
questions; resolving a round 1pp at dev's discordance takes 6,603. BIRD dev is 1,534 and BIRD train is 9,428.

**25.3 Six iterations were spent comparing effects smaller than their samples could see.** The framing, evidence,
dose, probe, raw and square arms produced deltas of −2.57 to −4.86pp at n = 350, against resolutions of 4.00 to
4.87pp. None reached the bar; four reached the looser 95% bar; all pointed the same way. The record read them as a
sequence of findings about the prompt channel and then closed the channel. **The correct reading is that the
channel was never measured**, and the closure cannot be revisited until a sample exists that can measure it.

**25.4 The R28 criteria had no power floor, which is the third occurrence of one defect class.** §138 found
`V5-resolution` advisory while passing 17 of 17. This round found `S2` decidable by a three-question cell and no
criterion at all asking whether a minimum is far enough below its neighbours to be a minimum. Both are the same
failure: **a validity condition that a zero-information cell can satisfy.** `S5` and a ten-discordant floor on `S2`
are the repair, and they are marked as amendments to the registration in the artefact rather than presented as part
of it.

**25.5 The stratification is refuted in sign, and the ordering does not survive the tokeniser.** The four buckets
read +0.00, −0.30, +7.44, −11.11pp. MEMTRIM predicts a minimum in the middle; the minimum is at the top bucket,
which holds 18 questions. Under a character 4-gram tokenisation the ordering changes from `3 < 1 < 0 < 2` to
`0 < 1 < 3 < 2`, so the *shape* is a property of the tokeniser and not of the corpus. The gap around the minimum is
18.55pp against a resolution of 32.23pp.

**25.6 Relevance is now excluded as the axis by two independent covariates.** Lexically, at the question level,
the effect is flat across the 90.9% of the corpus below 0.4 overlap. Semantically, at the rule level, hurt rules
are not more dissimilar to their question than helped rules (0.254 against 0.226, p = 0.12, §62) — and the two
measurements point in *opposite* directions, which is what two underpowered covariates of a non-signal look like.
Whatever makes a rule help or hurt, it is not its similarity to the question, and the next hypothesis has to be
about what the rule does to the query.

**25.7 What the audit does not cover — closed 2026-11-02 (`§34.11`).** It audits whole-artefact deltas, and an arm
inside an artefact was not a row, so the record's one positive reading — the `values` channel — had to be looked up
by hand. This was carried for seven rounds as a schema question, and the schema question was the mistake: an arm is
a column of a run rather than a run, so it needs no validity schema and only the three numbers `(helped, harmed, n)`
read as a row. `pnpm eval:resolution` now does that for all **98 published arm rows over 20 artefacts**, and the
thing the gap was hiding is not the positive reading but the opposite: **18 of the 98 rows are decided by their own
sample, every decided row is larger than 4.5pp, and no arm this record has ever quoted as a small effect — `values`
+1.17pp, `full-one` −0.20pp, `full-lexicon` −0.59pp — is decided at all.**

**25.8 Carried forward.** R30 stage 1 is an offline classifier of what a rule did to the query — identifier
imported, decision repeated, table ruled out — readable from `predictedSql` against `baselineSql` in the committed
artefacts at zero model cost. R30 stage 2 is the resolution purchase: one arm at n ≈ 6,600 on BIRD train, which is
the only corpus in reach that can see a 1pp effect at 80% power.

**25.9 The competitive row that was read as a product win was reading the wrong arm.** `COMPETITIVE.md` §1 carried
one row for this project annotated `1 (+ memory pack)` and quoting **57.63** on BIRD dev. `compareCell` reads
`metrics.accuracy_without_memory` by construction — the published cell it compares against is a no-memory cell — so
57.63 is the **no-memory** result and the row has always been about the harness. The memory arm of the same run is
**56.26**: on BIRD dev the pack costs **1.37pp** of execution accuracy (47 helped, 68 harmed, 1,534 questions,
resolution 1.96pp). The row is split in two. Both halves are needed, and neither is comfortable: the harness is
+4.11pp over the published baseline and it is not the feature; the feature is a 1.37pp loss and it is inside its own
resolution, so the honest sentence is *nothing attributes our advantage to memory*, not *memory hurts*.

**25.10 The arithmetic behind that correction, stated because it is the difference between a claim and a point
estimate.** Two independent samples cannot be paired, so the width is `sqrt(p₁(1−p₁)/n + p₂(1−p₂)/n) = 1.79pp`. The
4.11pp difference is **2.30 standard errors**: it clears the 95% bar (3.51pp) and **not** the 80%-power bar
(5.02pp). The record had been quoting the estimate with neither, which is the same defect as §25.1 at the level of
the positioning document rather than of an artefact.

## 26. Addendum — R30 stage 1: two tokeniser defects, one of which inflated the finding (2026-11-01)

**26.1 A value change was classified as a reordering, and the bucket it landed in has a zero delta by
construction.** `relation` is decided by comparing two normalised forms: equality of the token stream means
`unchanged`, equality of the *multiset* means `reworded`, and anything else is `edited`. The multiset was built from
**word tokens only**, on the reasoning that a reordering is about words. It is not: `WHERE x = 1` against
`WHERE x = 2` has the same words and a different answer, and fourteen committed cases were filed as `reworded`
rather than `edited`. The consequence is not cosmetic. `reworded` is a bucket in which the two queries are the same
query, so its delta is zero by construction, and every case wrongly placed there is a real edit removed from the
ledger the round is drawn from. Found by a test that expected `rewritten` and got `reworded`; fixed by keying the
multiset on **all** tokens, numbers and literals included.

**26.2 A derived-table alias was counted as a column, which is the one defect direction that matters.** `FROM
(SELECT …) AS s` registered `s` in the output-label set but `FROM (SELECT …) s` — no `AS` — registered nothing, so
`s` fell through into `columns`, and any such name absent from the question became an "imported identifier" that no
rule had mentioned. **This is a false positive in the covariate that the round is testing**, and a tokeniser that
inflates its own hypothesis is the exact failure the audit exists to catch. A related leniency was removed at the
same time: identifiers of a single character were being dropped as presumed aliases, which was a heuristic
standing in for alias tracking the extractor now does properly. Between the two corrections `F1` moved from 151
questions at a −11.38pp gap to 155 at −11.13pp — **the separation does not depend on either**, which is the result
worth recording: the tokeniser was wrong and the finding survived it.

**26.3 Two branches could not be reached by any input, and were removed rather than exempted.** `logGamma` carried
the reflection formula a general implementation needs for arguments below 0.5; every call site passes `n + 1` from a
binomial coefficient, so the argument is never below one. `logChoose` carried a range guard for `k ∉ [0, n]` while
the one caller enumerates `x` over the hypergeometric support. Both were written first, both are branches no input
can take, and both would have been `v8 ignore` candidates in a codebase that tolerated them. They are gone, with the
invariant stated in the comment; the file measures 100 on all four dimensions rather than 99 with two suppressions.

**26.4 A resolution of infinity was published as `null`, which reads as "not measured".** The 692 questions the
pack left untouched have no discordant pair, and the minimum detectable difference of a comparison in which
nothing changed is infinite. `detectableDelta` returns `Number.POSITIVE_INFINITY` correctly; `JSON.stringify`
turns it into `null`; and `null` in this project means *unmeasured*. The artefact now states the distinction in its
notes and carries `helped + harmed === 0` in the same row, and `CellReading.minDetectablePp` documents both causes.
This is the mirror of the defect §139 recorded — there, a zero read as "measured, and exactly zero".

**26.5 The registration asked for a category the record cannot compute, and it is reported as absent.** R30's third
category is *a table or column the rule named that the schema had pruned*. `per_case` stores `schemaTables` as
`{ kept, total, pruned }` — three numbers, no names — so the category is not computable from any committed
artefact. `F4` (a table added to the query) is adjacent and is not the same question, and putting it in the third
slot would have been a substitute answer under the original name. The artefact carries an `unmeasured[]` entry with
the category, the reason, the nearest substitute and the difference; the fix is one field in stage 2's `per_case`.

**26.6 The build caught a name collision that would have made the diff unreadable.** `shapeOf` and `gateOf` were
already exported by `exec-signature.ts` and `signal-gate.ts`. Renamed to `sqlShapeOf` and `gateReadingOf` rather
than re-exported under an alias: two functions with the same name that answer different questions is how a reader
ends up quoting the wrong one, and the compile error is cheaper than the confusion.

**26.7 What the audit did not find, stated so that its absence is on the record.** No case of the classifier
reading the gold SQL, the gold result or any scorer field — the input type has four string fields and no way to
reach the outcome. No non-determinism: two consecutive runs of the bin produced byte-identical artefacts, which is
what the CI step compares. And no criterion that can be satisfied by a zero-information cell: `Q1` requires the gap,
the analytic interval, the clustered interval and the exact test to agree, and each of the four fails independently
when its own input is missing.

**26.8 A quoted bundle size had drifted 568 bytes and nothing was comparing it to the build.** `README.md`
stated **42,762 B raw / 14,533 B gzipped** for the core package; `pnpm bundle:size` measures **43,330 / 14,684**.
The gate was green throughout, because the gate compares the bundle to its *ceiling* and not to the number the
documentation quotes — so the only thing that would have caught the drift was a reader running the command. Fixed
to the measured values. The general form is worth recording because it is the same class as §139's row error: **a
number in prose that no build step reads is a number that will be wrong, and the fix is to read it, not to be
careful.**

## 27. Addendum — R31: one criterion tightened after it passed, three unreachable branches, and a fixture that was wrong three times (2026-11-01)

### 27.1 The criterion that passed and was tightened anyway

`M3` — the mechanism criterion — was first written as a point comparison: `destroyed(pack) > destroyed(schema)`,
i.e. `36.36% > 34.04%`. On the real corpus it passed. The same run printed the interval around the gap between the
two buckets, which is **14.74pp for a 1.24pp difference**, and an interval twelve times its own point estimate is
not evidence of anything: it is a sample that cannot tell the two buckets apart.

The criterion was rewritten to require that the gap clear its own half-width before the verdict is accepted, and
it then failed. **Both facts are recorded, because the second one is only meaningful given the first.** A
criterion adjusted after a result is a criterion chosen by its result in either direction; the direction here was
towards the stricter bar, which makes the round look worse rather than better, and that is the only reason the
adjustment is defensible at all. The general form of the rule this round re-learned: **a criterion stated on point
estimates is not a criterion, it is a coin with a decimal point.** Every other criterion in this record — `Q1`,
`Q3`, `Q4`, `V5-resolution`, `S1`, `S2`, `S3` — already carried a width; `M3` was written without one and the
omission is why the first draft passed.

### 27.2 A difference of two bootstraps replaced by a closed form, and the artefact moved by one bit

`gateReadingOf` reported `improvementPp` as `gated.deltaPp − measured.deltaPp`, two floats each produced by a
1,534-case `cellOf`. That difference is identically `−Σ signed(discarded) / n`, and the round needed the identity
rather than the subtraction: the permutation test evaluates it 5,000 times, and a `cellOf` per draw would run a
10,000-resample bootstrap inside every one of them.

The closed form is `improvementOf`, and after the swap `poc-query-diff.json` differed in exactly two places: one
float in its last bit (`0.9778357235984354` → `…355`) and the `unmeasured` note for `pruned-name`. The byte
comparison caught both, which is what it is for. A test asserts the identity against `gateReadingOf` in both
grounding modes, so the two implementations cannot drift apart silently.

### 27.3 Three branches that no input could take

Coverage work on the new modules found three `null`/fallback arms that were unreachable, and each was removed
rather than exempted:

- `halvesOf` looked rows up per database with `bySide.get(dbId) ?? []`, but every id in `side.databases` came
  from the same entries, so the miss cannot happen. The rewrite partitions in one pass and has no fallback.
- the jackknife criterion printed `(jackknifeMaxPp ?? 0)`, but max is null exactly when min is null and that arm
  is already handled by the ternary above it. Both extrema now come from one local that handles the empty case
  once — a report of "−Infinity to Infinity over zero databases" is exactly the reading this project keeps
  removing.
- the split-half criterion tested `weakestHalf === null`, but `halvesOf` always returns two halves. `Math.min` of
  two empty improvements is `0`, which is the reading `S3` should give for a corpus with nothing in it.

### 27.4 A hand-computed fixture that was wrong in three different ways

The mediation tests were written before the module was run, and the first three assertions were wrong — each for a
different reason, and each caught by the arithmetic rather than by review:

1. the two-half split was expected as `[big+small | mid]`; greedy-by-size actually produces `[big | mid+small]`,
   which is the same 5/5 balance and a different partition. The test was describing an algorithm that was not
   implemented;
2. `improvementOf` was asserted as `−25pp` on a corpus whose two destroyed questions give `+50pp`: the sign of
   `−Σ signed` was inverted in the comment, not in the code;
3. the contribution decomposition was asserted as `2/7` and `4/7` while the bucket holds two destructions and one
   repair, i.e. `1/7` and `2/7`. The repair was in the corpus and not in the arithmetic.

All three are the same defect wearing different clothes: **a hand-computed expectation is a second implementation
of the function under test, and it can be wrong in exactly the ways the function can.** The corrections were made
against the module, and each test now states the count it relies on ("two destroyed and one repaired") so a reader
can check it without running anything.

### 27.5 What the pack text is, and why the provenance is a field

`corpus.ts` prefers `injected` — the rendered text the lane wrote into the prompt — and falls back to resolving
`packIdList` against `items`. The two are not the same claim: `items` is what the store says *now*, and an item
edited after the run would reconstruct a pack the model never saw. The loader therefore returns `packTextSource`
per case and counts reconstructions in the artefact, so a reading can say which of the two it used. On this corpus
the count is zero, which is itself worth knowing: the field existed and was populated for all 1,534 cases.

### 27.6 What this round did not measure, stated in the artefact

- **Synonyms.** A rule that says "the county column" and a model that writes `County Name` are indistinguishable
  from a rule that says nothing. The generous detector closes spelling and punctuation; it does not close this,
  and `M4` is a bound rather than a second measurement.
- **The pruned names.** `schema-link.ts` now records them (R30 stage 1b), but the committed artefact predates the
  field, so the registration's third category is still `unmeasured` for this record.
- **Shrinkage.** The split-half is a stability check; both halves were in the corpus the hypothesis came from.

## 28. Addendum — five defects that no unit test could have found, because the tests use the same data (2026-11-01)

### 28.1 The finding, stated as a limit of the method rather than a list of bugs

This repository has 2,353 tests, four coverage dimensions above 99.6%, and a rule that every branch
must be reachable. None of that found any of the five defects below, and the reason is structural
rather than an oversight: **every test loads a fixture, and every fixture was written against the
same split the code was written against.** A field that exists in `dev.json` and not in
`train.json` is invisible to a suite whose corpus has the field.

What found them was a **precheck** — a program that loads a second split through the same code and
stops before the first model call. It is worth being precise about why that is not just "more
testing". A test asks *does this function do what its author intended*; the precheck asks *does the
intention hold for the data this code will actually be given*, and the second question has an answer
only when the data is different in a way nobody chose.

The five defects, in the order they would have failed:

| # | defect | when it would have fired | what it would have cost |
|---|---|---|---|
| 1 | `poolOf` read `row.difficulty.toLowerCase()` | at startup, on the first of 9,428 rows | the download and the unpack, then a `TypeError` |
| 2 | the download buffered the archive with `arrayBuffer()` | during the download, at 8.9 GB | the run, as an out-of-memory kill with no artefact |
| 3 | the extractor looked for `dev_databases.zip` | during the unpack | the run, then 7,829 identical "No database file" errors |
| 4 | `resolveDatabase` did not know `train_databases` | at the first database check | the run, at the same point |
| 5 | `SOTA_ARTEFACT` answered the Mini-Dev name for `train` | at the upload, after a successful run | **the Mini-Dev evidence**, overwritten |

Defect 5 is the one that would not have announced itself. The other four cost a dispatch; the fifth
would have destroyed a committed artefact and been discovered by whichever CI gate recomputes it —
which is how R24 lost a cell, and the reason `SOTA_ARTEFACT` exists at all. The expression that
replaced it was `split == 'dev' && A || B`, a two-way choice that silently grew a third arm when a
third split was added. **A two-way conditional is a data structure with no room for a third value,
and it fails by answering rather than by erroring.**

### 28.2 The tests that were written afterwards, and what they are worth

Each defect got a regression test, and none of them is the kind that would have caught it:

- `poolOf` now has a test that passes rows with **no `difficulty` field**, which is the exact shape
  of a `train.json` row. That test is a fixture written from the finding, not from the code — which
  is the only way this class of defect is ever caught after the fact.
- the streaming download has no test. It cannot have one worth having: the failure is an allocation
  of 8.9 GB, and a test that allocated it would be the failure. What replaced the test is a `.part`
  file and a rename, so the failure mode that *can* be tested — a truncated file under the trusted
  name — is now impossible by construction rather than by assertion.
- the nested archive pair is a manifest field tested for both halves and for half a declaration,
  because the half case extracts the databases to a path nothing opens.
- `resolveDatabase` takes the caller's root and is tested with a root the built-in list does not
  contain.
- `SOTA_ARTEFACT` has no test at all. Workflow expressions are not unit-testable here, and the
  honest mitigation is the one applied: `ARTEFACT_IDS` is a `Record<Split, string>`, so the
  TypeScript half of the same rule cannot be extended without a value. The YAML half is checked by
  reading it, which is what this section is.

### 28.3 Mini-Dev is a subset of dev, and the record had already used that fact without stating it

Measured this round: **496 of Mini-Dev's 500 questions are dev questions** (by exact question text),
and 486 are the same question with the same gold. It is a slice, not a second sample.

This is not a correction. R24's decomposition — `925/1534 × 14.05 + 609/1534 × 22.99 = 17.60` —
treats Mini-Dev as exactly what it is: the moderate-and-challenging third of dev. Every reading that
quoted a Mini-Dev number and a dev number as two pieces of evidence would have been wrong, and none
did. What the measurement adds is the closure of an exit: **there is no cheap out-of-sample split in
this benchmark, and the record can now say so with a number instead of an assumption.**

### 28.4 Two claims about the archive that had to be measured rather than read

The published description of the train archive is a size. What a run needs is a shape, and the shape
was obtained without downloading 8.9 GB: HTTP range requests against the zip's central directory,
which is 1,118 bytes at the end of the file, and per-member extraction of the three small members
(`train.json`, `train_gold.sql`, `train_tables.json`, 840 KB compressed) by inflating each member's
own deflate stream from its own local-header offset. Two of those members are needed by the precheck
and one of them — `train_gold.sql` — turned out to be a second copy of the gold, which is a free
cross-check the other two splits do not offer.

The measurement that mattered most was neither of those. It was the **unpacked** size: 32.4 GB, four
databases over 4 GB each, against a runner's ~14 GB. A run that assumed the archive's 8.9 GB was the
cost would have failed at the unpack with a disk error, one step after the download succeeded — and
the failure would have looked like a runner problem rather than an arithmetic one.

### 28.5 What this round did not verify, and cannot from here

- **The workflow change is unexecuted.** The free-disk step, the 340-minute timeout and the
  `SOTA_ARTEFACT` chain are reasoned from measured numbers and have not run on a runner. The first
  train dispatch is their test, and it is why `deadline_min` is set below the step timeout: a run
  that stops itself writes its folds; a run that is killed does not.
- **The 8.9 GB download on a runner is estimated, not measured.** The arithmetic is 2.3× dev's call
  budget against dev's measured wall clock; the transfer time is unknown and is inside the margin.

## 29. Addendum — a rule id that is not a rule, a cap that was 14% low, and a bootstrap that drifted from its own point estimate (2026-11-01)

Three defects, found three different ways. The first was found by building a classifier and noticing
that its input was not what the schema said; the second by a runner refusing to continue; the third
by comparing a confidence interval's centre against the number it was bracketing.

### 29.1 A rule id names a slot, not a rule — and the per-rule reading was over the wrong corpus

`items` in a committed run holds 1,066 rows. Every round of this record read that as 1,066 rules.
It is 1,066 rows: **271 sentences over 229 id slots**, each slot reused across folds and naming an
unrelated rule in each. `k_01hf7uaqrd_550r9` is numeric literals in `california_schools` in fold 0,
integer division in `toxicology` in fold 1, a foreign-key filter in fold 2 and `NOT LIKE` status
text in fold 3.

`query-diff.ts` built `ruleById` as `new Map(items.map((entry) => [entry.id, entry]))`. With a
reused key that map holds 229 entries and the last fold to be read wins, so every lookup answered
with **fold 4's sentence** while the question being classified came from any of the five.

| | keyed by `id` | keyed by `fold:id` |
|---|---|---|
| rows naming an identifier | 138 (12.95%) | 149 (13.98%) |
| questions flagged at rule level | 385 (25.1%) | 407 (26.5%) |
| Δ on flagged | +2.86pp | +0.49pp |
| Δ on the rest | −0.52pp | +0.27pp |
| precision / recall against F1 | 13.0% / 32.3% | 11.3% / 29.7% |

**Why no test caught it.** The fixture in `query-diff.test.ts` generated ids that were unique, so
the map never collapsed. A test can only catch a reused key if the fixture reuses one, and the
fixture was written from the same mental model as the code.

**Why it looked like a result.** The defect made the rule-level gate separate by 3.38pp. It actually
separates by 0.22pp. The conclusion — that a rule's text cannot predict the damage, and that the
gate is the wrong sign for a product — was reached before the defect and is now reached more
cleanly, but the margin it was argued from was the defect's.

**Fixed** by keying on `fold:id`, and **guarded** by two CI assertions on the pool counts and on the
agreement of the two naming shares. The counts are also in the artefact, so the difference between
271 sentences and 1,066 rows is visible rather than inferable.

### 29.2 The call cap was 14% below what the lane needed, and the run said so

`prereg/R30-stage2.md` registered "about 15,000 model calls" against a cap of 16,000. The lane
stopped after fold 1 and printed the arithmetic itself:

```
[sota] fold 1/5: eval=1400 learn=280 edited=95 unanswered=0 distillFailed=0 active=184 calls=3175
[sota] budget forecast after fold 1/5: the run needs about 17145 calls, the cap is 16000 (short by 1145)
```

The estimate was made in questions and the meter counts calls: 1,400 questions over two arms is
2,800 generations, the 280-question learning pass is 280 more prompts, and the 95 edited queries
were re-asked rather than dropped. **3,175 against 3,000 per fold.** Amendment 1 raises the cap to
20,000 and changes nothing else; the aborted run's fold is discarded rather than reported, because
the fold that fits in an undersized cap is the first one.

**Why no test caught it.** A budget forecast is an arithmetic claim about a run that has not
happened. The lane's own forecast is the only instrument that can catch it, and it fired correctly —
the defect was in the registration, not in the code.

### 29.3 A bootstrap that disagreed with its own point estimate

`resampleDelta` was first written to average each drawn database's mean and then average those, so
every database weighed the same however many questions it carried. The point estimate it was
supposed to bracket weights questions, not databases. The mismatch moved the lower bound of a gap
from **0.25pp to −0.19pp** — enough to turn a resolved gap into an unresolved one.

**Found by** printing the interval beside the point estimate and noticing the centre had moved when
only the resampling loop had. **Fixed** by pooling the drawn databases and dividing by their
question count, which is what `cellOf` computes.

**Why no test caught it.** Every test in the file asserted either the point estimate or the interval,
never that the interval contains the point estimate. That assertion now exists, and it was verified
by re-injecting the defect rather than by watching it pass: with the per-database average back in
place the test fails on a group whose point estimate is **−85.19pp** and whose interval starts at
**−44.44pp**. A first attempt at the test passed under both implementations because the fixture had
one database per group and the two weightings coincided — which is the same class of mistake as the
defect, so the fixture now puts 100 questions in one database and 8 in eight others.

### 29.4 What these three have in common

None of them produced a wrong sign. All three produced a **number that looked like it had been
measured**, in a record whose stated standard is that a number is either measured or absent. The
first two were found by reading data rather than code; the third by looking at an output rather than
at a diff. That is the pattern worth carrying: a defect in this repository is more likely to be a
plausible number than a crash, so the checks that matter are the ones that compare a number against
something that must be true of it independently.

## 30. Addendum — a reading that denied its own corpus, an interval on the wrong unit, and a registration that declared a gate its own text rules out (2026-11-01)

Three defects from the round that finally ran the out-of-sample test. None of them changed a sign.
All three were found by comparing a statement against the thing it was a statement about, and two of
them were in prose that no test looked at.

### 30.1 The stability reading asserted, over train, that nothing in it could be out of sample

`gate-stability.ts` carried three constants: the title `Whether the read-time gate's +1.30pp is a
property of the gate or of one database`, a note beginning `because dev has eleven databases`, and an
`unmeasured` entry whose reason read *"every question here was in the corpus that produced §140, so no
split of it is out of sample"*.

The file was then pointed at the train split — the one corpus in this project for which that sentence
is exactly false, and for which the whole dispatch was paid. The artefact produced the right number
(+0.51pp) under a heading that asserted a different one, and a caveat that denied the measurement's
only claim to novelty.

| | the artefact said | what was true |
|---|---|---|
| title | `the gate's +1.30pp` | 0.98pp on dev, 0.51pp on train |
| databases | `dev has eleven` | 58 on train |
| `unmeasured` | `no split of it is out of sample` | the split *is* the out-of-sample one |

**Why no test caught it.** The reading's numbers were tested; its self-description was a string
concatenation in a file excluded from coverage because it is a CLI entry point. The project rule that
covers this — *a naming rule that decides a verdict should not be the one piece of logic no test can
reach* — was written in `artefacts.ts` and applied to split names, and had not been applied to
anything else.

**Fixed** by making every corpus-dependent clause a function of the corpus: `splitOfName` reads the
artefact's own `dataset` field (and answers `unknown` rather than defaulting to `dev`, because a
missing field must not inherit an out-of-sample claim), and `stabilityFramingOf` builds the title from
the number that was read, the note from the database count that was counted, and picks the *causal*
gap over an out-of-sample corpus because the in-sample caveat would be a lie there. Seven tests pin
it, including that the title does not contain a number the reading did not produce.

### 30.2 The headline interval resampled questions while the record's own standard says clusters

The out-of-sample result is written into the artefact as `paired`, produced by `comparePaired`, which
resamples individual values. Sixty lines below it in the same file, `clusterBootstrapCI`'s docstring
says why that is wrong for this corpus: a rule shown on twenty questions inside one database
contributes twenty correlated observations, and resampling them as independent shrinks the interval
by about the square root of the cluster size.

The same mistake had already been named and corrected in §143, which closed R32's first axis by
refusing a database-level claim from a question-level test.

**The correction changes nothing here, and that is the point.** Recomputed with the database as the
unit: dev [−0.63, +1.36] against [−1.11, +1.76], train **[−1.27, −0.18]** against [−1.30, −0.13]. The
train interval moves 0.03pp on its lower bound and 0.05pp on its upper, and the verdict is identical.
A defect that changes no conclusion is exactly the kind that survives forever.

**Fixed** by making the clustered interval the reported one: `eval:out-of-sample` computes it for both
corpora, prints both, and CI asserts that the train interval excludes zero *as a clustered interval*.
The question-level interval stays in the source artefact, where it is now labelled as such.

### 30.3 A pre-registration declared a gate that its own prose says cannot apply

The protocol gate rejected the train artefact after the run:

```
FAIL eval/results/poc-sota-bird-train.json — prereg/R30-stage2.md: declares V31, which the run never
emitted; does not name V1, V2, V3, V4, V5, V6, V7, V8, V12, V48, V44, which the run emitted
```

`V31` is `cell-comparison`: it re-derives a recorded comparison against a published cell. The
registration's own *What this run cannot say* opens by stating that BIRD publishes no test cell for
train and that the split is named so `compareCell` cannot file it as a reproduction. The front matter
had been copied from a dev registration, and the contradiction between the front matter and the prose
sat in the same file, forty lines apart, because one is read by a program and the other is not.

**Why no test caught it.** No test can: a pre-registration is prose plus six fields, and the only
instrument that can read both is the protocol gate — which did, one run later than it should have.

**Fixed** by Amendment 2 in `prereg/R30-stage2.md`, naming the twelve gates the lane actually emits.
The predictions are untouched, and the amendment says so with the run's own output beside it. This is
the second amendment to this registration and both were about the harness: the first was a cap 14%
too low, this one a gate that cannot apply. Neither is a change to the hypothesis, and neither was
made quietly.

### 30.4 What the three have in common with §29

All six defects in the last two rounds are **statements about data that were never checked against
the data**: an id that was not a key, a cap that was not the count, a resample that was not the
estimator, a title that was not the reading, an interval on the wrong unit, a gate that was not in
the run. Not one of them raised an exception. Every one of them produced a number or a sentence that
looked as though it had been measured.

The check that catches this class is not more tests over the same objects. It is a second, independent
route to the same claim: the same delta computed from two units, the same title computed from the
number rather than typed beside it, the same gate list read from the run rather than copied from a
sibling registration. **All three fixes in this section are that shape**, which is why they were worth
more than the numbers they corrected.

## 31. Addendum — ten rows that lost their baseline, and a threshold that could not be reached (2026-11-01)

Two defects from R33 stage 0, the round that asked whether the filter survives without a baseline to
anchor on. Neither changed a sign; one of them changed a verdict, and it is recorded here with the
receipt.

### 31.1 Ten of 7,000 rows out of sample carry no bare query

`V53`, the gate that asks whether every case carries the query it was scored on, failed on first run:
**12 of 7,000** train rows are missing one. Two of them are ordinary parse failures — `parseOk: false`,
no served query, which is what a parse failure looks like. **The other ten are missing `baselineSql`**,
the *bare* attempt, while being otherwise unremarkable: parsed, executed, and recorded as wrong in the
bare arm.

| field | rows missing it | are they consistent with their own arm |
|---|---|---|
| `baselineSql` | **10** | yes — all ten are `withoutMemoryCorrect: false` |
| `predictedSql` | 2 | yes — both are `parseOk: false` |

**Why nothing caught it.** Every reading that touches `baselineSql` — the imported-name covariate, the
gate, the whole of §146 and §147 — reads it as the left-hand side of a *difference*. A row with no
baseline contributes no added names, so it is scored as untouched and disappears into the corpus. The
field is never the subject of a check, only an operand, and an empty operand produced a plausible zero.

**What it cost.** A validity rule that judges one query has to decide what to do with a query that does
not exist. Treating the ten as unflagged put ten known failures into the clean group and pulled the gap
from −12.58pp to −10.71pp, which moved the clustered interval from `[−22.15, −2.92]` to
`[−21.58, +0.44]` — **across zero**. One registration's verdict (P3) flipped on the treatment of ten
rows, and the treatment is documented in `prereg/R33.md` Amendment 1 with both columns so a reader can
disagree with it.

**Fixed** by excluding a case from the arm it is missing a query for and carrying the count as
`excluded` on every reading, and by restating `V53` as *no case is missing a query it claims to have
answered* — a missing bare query must come with a bare arm recorded wrong, a missing served query with a
parse failure. That gate now passes on both splits and would fail on the original defect. The ten rows
themselves are not repaired: the queries were never stored, and only a re-run of the lane can produce
them.

### 31.2 A registered threshold that the registration's own prediction made unreachable

P6 asked whether the pack still imports names when measured without a baseline anchor: the served query
had to be flagged at least **5pp** more often than the bare one. P2, three bullets earlier, predicted
that the same rule would flag **at least 60%** of bare attempts.

Those two are not independent. If 95% of bare attempts are already flagged, the entire population P6 can
move within is 5 points wide, and a 5-point bar is not a bar — it is the whole interval. The measurement
returned **+0.42pp**, which is neither a finding about the pack nor a failure of one: it is the ceiling
talking. The strict rule had already saturated on the schema vocabulary that every correct query carries.

**Why the arithmetic was not done before the file was written.** Because P2's prediction was written as a
floor (≥60%) and P6's as a difference, and the two were never multiplied: `1 − 0.60 = 0.40` was the
smallest headroom P2 allowed, and 5pp inside 40pp is a different claim from 5pp inside 5pp. A prediction
set is a system of constraints on the same corpus, and this one contained a pair that could only jointly
hold under a flag rate the author did not expect.

**Fixed** by reporting the quantity that does not saturate — among questions the *bare* query is not
flagged, the share the *served* query is — and by leaving P6 refuted where it stands rather than
re-reading it. The registration's own refutation clause covers the outcome: the question-only rule fires
on surface-form noise, and the next step is a tokeniser or nothing.

### 31.3 What these two have in common with §30

Both are **a field treated as an operand and never as a subject**. `baselineSql` was subtracted from and
never counted; the flag rate was reported and never compared against the room it had to move. §30's six
were statements about data that were never checked against the data; these two are quantities that were
never given a denominator.

The check that catches this class is the same one §30 named, applied one level down: **ask the quantity
what its own bounds are before asking it a question.** Ten missing rows and a 5.2% headroom are both
bounds, and both were available before the number was.

## 32. Addendum — four registered thresholds in two weeks, none of which a run could satisfy (2026-11-01)

R34 asked whether the memory's failure is a property of the item or of the population, and answered it.
It also produced four registered numbers that were wrong **before the data existed**, in three different
ways, which makes them one defect rather than four accidents. They are collected here because the pattern
is the finding: the registration process is now producing thresholds faster than it checks them.

### 32.1 The family

| | registration | defect | cost |
|---|---|---|---|
| §31.2, R33 P6 | the pack adds ≥ 5pp of flag rate | P2's floor of 60% left 5.2pp of room; the bar was arithmetically unreachable | a prediction that could not be tested |
| R34 P1 | 240 of 424 discordant per half | two halves cannot hold 480 of 424 | as written, refuted by a split no hash could produce |
| R34 P3 | within 0.15pp of `τ × net` | at 15% coverage the net's sampling error is ±0.26pp | a correct estimator recorded as broken |
| R34 P5 | a gate needs 47.64% precision | the bar belongs to the *admitted set*, whose rates the gate changes | the round's headline prediction measured the wrong population |

None of the four is a coding error. Each was a sentence in a file, written by the same hand in the same
fortnight, and each would have been caught by one line of arithmetic **before the file was committed** —
`2 × 240 > 424`, `0.15 < 0.26`, `b/(r+b) = 47.6%` computed on the corpus it would later be applied to.

### 32.2 Why the fifth kind of defect was the interesting one

Three of the four are arithmetic hygiene. **The fourth is not, and it is the one worth the section.** R34's
central derivation was

```
net = τ · (q·r − (1−q)·b)   positive when   q > b / (r + b)
```

with `r` and `b` read off the corpus — 6.393% and 5.816% — and the resulting 47.64% written down as a bar
"the gate" must clear. It is not a property of a gate. It is a property of the **admitted set**, and
admission changes that set. On the confirmation half, across the self-knowledge sweep:

| threshold | precision q | bar inside the set | gap |
|---|---|---|---|
| 0.10 | 41.8% | 46.5% | −4.7pp |
| 0.30 | 50.8% | 52.3% | −1.5pp |
| 0.50 | 62.4% | 63.3% | −0.9pp |

The gate beat the registered bar by 20.6pp and still returned −0.05pp, because the bar rose 16.8pp to
meet it. A registration can be arithmetically correct, internally consistent, written before the data, and
still measure the wrong population — and unlike §32.1's three, no amount of checking the arithmetic would
have found it. What would have found it is asking, of every rate in a derivation, *on which set is this
rate measured, and does the intervention change that set?*

That question is now the first line of the checklist for registering R35 and after, and §149's artefact
reports the within-set bar beside every point so that the next reading cannot repeat it silently.

### 32.3 What the gates did and did not catch

2,532 tests and four coverage dimensions at 99.98 / 99.65 / 100 / 99.98 caught none of the four, because
all four are statements about a *corpus* rather than computations over one. The instrument gates caught
what they were built to catch — `V55`–`V58` confirm the corpus, the split, the oracle identities and the
control — and none of them could see a sentence in a markdown file that no code reads. The registration is
the only artefact in this repository with no test, and it is the one that has now failed four times.

## 33. Addendum — the first registration written after the data, and four branches no input could reach (2026-11-02)

R35 asked whether a stored rule has a value, and answered no. It also produced the first registration in
this programme that was **not** written blind, and four dead branches that only a coverage run could find.
Both are recorded because both are process defects rather than findings.

### 33.1 The disclosure, and what it costs

`prereg/R35-ledger.md` carries a **Disclosure** section that no earlier registration needed, and it is
there because the round's direction was chosen after an exploratory pass over the corpus:

| what was computed before the file existed | what it produced |
|---|---|
| pack-size distribution and per-size flip rates | P7's table, and the direction of the round |
| home-database versus foreign-database flip rates | nothing — dropped, and not registered |
| the χ² dispersion statistic | P2 |
| one split-half correlation, under one particular hash split | P3's bar |

**P2, P3 and P7 are therefore replications, not predictions**, and the honest count of blind tests in the
file is four: P1, P4, P5 and P6. The one that matters is **P5** — the out-of-sample behaviour of a coarse
prune flag — because it is the only actionable form of the question and nothing about it had been
computed before the file was committed.

The cost is that this round cannot claim a surprise. The value is that the confirmatory half of the split
was not consulted for P5, and the flag failed there on a 0.06pp difference whose interval is
[−1.97, +1.56] — a result that would have been recorded whichever way it came out.

**The rule this leaves behind.** An exploratory pass is legitimate; an exploratory pass reported as a
preregistration is not. From R36, either the file is written before the first number is computed, or it
carries this section. The programme has now spent four registrations on thresholds that were wrong before
the data (AUDIT §31.2, §32.1) and one on a direction that was not blind; the failure mode has moved from
arithmetic to provenance, which is progress of a sort.

### 33.2 Four branches no input could reach

`ledger.ts` shipped at 100% statements and lines and **86.98%** branches on its first full run. The
missing 13% was not untested behaviour — it was four guards whose condition could never be false, and each
one had been written as if it were protecting something:

| guard | why it could never fire | what replaced it |
|---|---|---|
| `pearson`: `if (n < 2) return null` | the only caller requires two pairs or returns before calling | deleted |
| `perHundred`: `whole === 0 ? null : …` | both callers test for the empty case before calling | deleted; the helper returns a number |
| `armOf`: `if (!usable(entry)) continue` | both call sites filter with the same predicate first | the parameter type became the filtered type |
| `usable()` returning `boolean` and every caller casting | a type guard removes the cast and the guard together | `entry is LedgerCase & { packIdList: readonly string[] }` |

The last one is the general lesson: **a predicate written as `boolean` forces every caller to re-check or
to cast, and both of those are branches that do not exist.** Making `usable` a type guard deleted five
casts and one dead guard at once. The remaining 1.6% was a genuine gap — the `high < 0` arm of
`excludesZero`, which needed a corpus where the pairs beat the singles — and it was closed with a test
rather than with a comment.

### 33.3 What the gates caught, and what they structurally cannot

`V59`–`V61` confirm the corpus (7,000 questions, 58 databases, 203 rules, 13,578 injections), the split
(29 databases each, 3,230 + 3,770 = 7,000) and the family (17 artefacts, every row with a sign). The 24
workflow assertions confirm every number the round reports, including the ones that make it negative.

What they cannot catch is the thing this round turned on: **whether the contrast is a mechanism or a
corpus effect.** No assertion over a committed artefact can answer that, because the answer depends on
which questions a retrieval threshold happened to serve one rule — a fact the artefact records but does
not control. That is why the pack-size result is registered as a lead and why the next step is an arm
rather than another reading.

## 34 — The defect the dispatch found, and the interval nobody recomputed

Two defects surfaced while preparing R36. One of them stopped a run before its first model call; the other
had been in a published table for two rounds and was invisible because the number looked plausible.

### 34.1 `bird-dev.json` never declared that its databases are nested

`dev.zip` contains five files and one of them is `dev_databases.zip`. The lane reads the archive's layout
from the manifest — `nested` names the inner archive, `nestedRoot` the directory it unpacks to — and the
dev manifest, the only one that had never been through the code path that reads those fields, had neither.
The consequences were precisely ordered and all of them expensive:

| step | cost paid before the failure |
|---|---|
| download | 346 MB |
| digest | SHA-256 over 346 MB |
| unpack the outer archive | 347 MB on disk |
| unpack the nested archive | **never attempted** |
| first question | `MG_E_STORE_IO: No database file for 'california_schools' under BIRD_DIR` |

The error message was already specific — it names the database, the directory it looked under and the three
roots it tried — and that is exactly why it took a second read to see that the answer was not in the
directory at all. **A message that names the missing file invites a search; the missing field was in a
manifest two directories away.**

Three changes, none of which is a patch:

1. The pair is declared (`dev_databases.zip` → `dev_databases`), which is the fix.
2. A test states the layout of all three splits as data — minidev: none, dev: `dev_databases.zip`, train:
   `train_databases.zip`. The regression is a missing field, so the test that catches it has to be a
   statement about fields rather than a run. **The reason this test did not exist is that the manifest tests
   checked the fields the code read; this one checks the fields the archive needs.**
3. The lane verifies the extraction once, immediately after unpacking, against the eleven databases the
   manifest promises, and refuses with the field name in `hint`. Eleven failures inside a fold loop become
   one before it.

**Why the R25 dev run passed.** It ran before the extractor was changed to read the layout from the
manifest — the previous version hard-coded `dev_databases.zip`, and the commit that moved the name into the
manifest for the train split did not add it to the dev one. A refactor that generalises a constant is a
refactor that has to re-check every value it used to hold; this one checked the archive it was written for
and not the one it had already worked on.

### 34.2 R35's dev interval was computed at 400 resamples, and the round elsewhere used 2,000

Recomputing R35's dev cell for R36 gave **+3.13pp [+0.87, +5.23]** where `ROADMAP.md` publishes
**+3.13pp [+0.62, +5.23]**. The point estimate agrees to every digit it has, the upper bound to 0.004pp, and
the lower bound differs by 0.25pp — the signature of a resample count, not of a different corpus:

| resamples | low | high |
|---|---|---|
| 400 | +0.625 | +5.226 |
| 2,000 (the module default) | +0.866 | +5.226 |
| 10,000 | +0.872 | +5.377 |

Nothing in R35's conclusion turns on the difference — the interval excludes zero at every one of the three
— and that is exactly why it survived: **a published number that agrees with its neighbours in sign and
size is not checked against its own method.** The class is `§32`'s (a bar that does not move when its inputs
do), with a different mechanism: here the *procedure* varied while the number stayed plausible.

The fix is structural rather than a correction: the default lives in one place (`assignmentOf` and
`packSizeOf` both default to 2,000 and 13,579), the artefact records what it was computed at, and R36's CI
assertion pins the interval to twelve decimal places, so a future change of resample count fails the build
instead of publishing a narrower interval.

### 34.3 What this round's gates can and cannot catch

`V62` is an instrument check (one item at most, the split, the changed share) and `V63` is an agreement
check (this module against the lane's own `arm_pairs`). Together they make the reading hard to fake and they
would have caught a silent divergence between two implementations of one contrast.

Neither can catch the thing R36 is actually about. An arm that is measured correctly can still be the wrong
arm: `full-one` is a truncation of *this* retrieval's order, and a store whose first item is chosen
differently would answer a different question. That is why the round reports the four marginal cells rather
than a single delta — a delta can be right about an arm and wrong about the mechanism.

### 34.4 A cost that does not name its input is not a cost

`prereg/R36-pack-assignment.md` was registered with a cost of **6,136 calls** for the replication dispatch,
computed as 5 folds × 307 questions × 3 arms plus 1,534 learning generations. The first dispatch of it was
issued without `learn_sample`, whose documented default is *all*, so each fold distilled from the entire
1,534-question split rather than from the 280 corrections R25 had used: the lane measured fold 1 at 2,468
calls, forecast 13,328 for the run against a cap of 9,000, and stopped.

Two things worked exactly as designed, and both are worth recording because they are the reason this cost
one fold rather than a night:

- **The budget forecaster stopped the run instead of discarding it.** It extrapolates from the fold it has
  finished and refuses to spend the rest on a run it cannot complete. A lane that had simply hit the cap
  would have left five partial folds and no artefact.
- **The failure named the number.** `MG_E_BUDGET_EXCEEDED: the configured cap cannot finish the folds`,
  with the forecast beside it, is the difference between a configuration mistake and a mystery.

The defect is in the *registration*, not the lane: **6,136 is the cost of a setting the file never wrote
down**, and the dispatch that followed it had to guess. The fix is one line — the file now states
`learn_sample = 280` and the ~6,000 calls that follow from it — and the general rule is worth keeping: a
cost in a registration is a function of the inputs, so either the inputs are in the file or the cost is a
wish.

### 34.5 A cross-term that changes sign between folds is not a property of the treatment

R36's second reading cost nothing: `foldsOf` buckets the same 1,534 assignment cases by the fold each
question was held out in and runs the identical four-cell accounting on each bucket. Nothing was
re-dispatched, and the table exists because of a decision made while writing the module — **group rather
than pool** — since pooling is precisely the operation that would hide what the table shows:

| fold | questions | repairs added | repairs given up | breaks added | breaks removed | net | Δpp |
|---|---|---|---|---|---|---|---|
| 0 | 307 | 5 | 7 | 4 | 6 | 0 | 0.00 |
| 1 | 307 | 1 | 6 | 8 | 9 | −4 | −1.30 |
| 2 | 307 | 5 | 4 | 4 | 7 | **+4** | +1.30 |
| 3 | 307 | 2 | 3 | 4 | 0 | −5 | −1.63 |
| 4 | 306 | 2 | 3 | 4 | 5 | 0 | 0.00 |

Two identities are asserted rather than eyeballed: each of the four cells sums across folds to the pooled
cell (23, 15, 24, 27) and the net column sums to the pooled −5.

**What the pooled table cannot say.** The pooled reading supports one conclusion — the pack is not additive,
because the second item's own record (23 repairs against 27 breaks) does not account for the contrast. It
leaves a retreat open: a quantity can be non-additive and still *stable*, in which case a store could
calibrate its rule count against its own folds and the lever would be a tuning problem rather than a closed
one. What closes that retreat is not the sign pattern of this one table — the wording here originally said
the sign was *drawn per store*, and §34.6 shows that the folds are the same questions across draws, so the
signs partly repeat — but the intervals: **every one of the five spans zero**, so there is nothing for a
calibration to converge on.

**Why this is an audit entry and not a footnote.** It is the third time in this programme that a pooled
number has been the wrong unit — §141 withdrew a mechanism claim that a per-store reading dissolved, and
§150 withdrew a per-item value that did not transfer between halves. §34.5 is the first time the per-store
reading was available in the module *before* the pooled claim was published, and it is recorded because the
cost of that ordering is one fold of work at zero model calls, against a retraction after publication.

### 34.6 The fold that looked decided, and the wording that had already shipped

R36's per-fold table was read and written into four documents — the pre-registration, `README.md`,
`ARCHITECTURE.md` §8.11 and `PROGRESS.md` §151 — before the replication dispatch finished. The replication
then landed, and it refuted not the result but **the sentence that described it**. This entry records both,
because the ordering is the mistake and the correction is the lesson.

**What was written.** *"Two folds are exactly flat and the three that move alternate +4, −4, −5, so the
cross-term's sign is drawn per store."* That was inferred from one store's five folds, and it treats a fold
as a fresh draw of the store. It is not: the split is seeded, so fold *k* is the **same questions** in every
store draw — 0 of 1,534 questions change fold between the two artefacts — which makes the per-fold table a
*paired* measurement rather than five independent draws.

**What the pairing shows.**

| fold | questions | first draw | second draw | sign kept | first spans zero | second spans zero |
|---|---|---|---|---|---|---|
| 0 | 307 | 0 | −2 | — (zero first) | yes | yes |
| 1 | 307 | −4 | −1 | yes | yes | yes |
| 2 | 307 | +4 | +5 | yes | yes | yes |
| 3 | 307 | −5 [−2.55, −0.66] | −1 [−2.93, +2.06] | yes | **no** | **yes** |
| 4 | 306 | 0 | −2 | — (zero first) | yes | yes |

Three folds keep their sign and the two that do not are exactly zero on the first draw and have none to
keep. So the sign repeats more than the original wording allowed. **What does not repeat is the only thing a
per-fold table exists to find**: fold 3 is the single row in either draw whose interval excludes zero, and on
the second store it covers zero. The fold that is positive twice (+4, +5) spans zero both times.

**Why the corrected statement is still the final one for the lever.** *No fold in either draw produces an
effect distinguishable from zero, and the one that appeared to does not on the second draw.* This is a
different claim from "the sign is random", and it is the claim the data supports: a quantity with no
decidable fold cannot be calibrated — not because folds disagree, but because none of them decides. The
product consequence is unchanged (no rule-count setting, no prune), and its foundation is now a paired
measurement instead of an inference from a single table.

**The process failure, stated plainly.** The per-fold module was written because "a pooled number hides
per-store variation"; it then reported five rows and no intervals, which hid the same thing at a smaller
scale. The interval column existed in `assignmentOf`'s output the whole time and was simply not carried into
`foldsOf`. Two additions follow from that, and both are in the module now: `foldsOf` carries
`clusteredLowPp`/`clusteredHighPp`/`p` per fold, and `foldPairsOf` reports which side of a pair spans zero
separately — a combined flag could not have said that the first draw decided and the second did not. A
per-fold table without intervals is a table of temptation.

### 34.7 The `gates` field names a dispatch's output, and this round's two deciding gates come from somewhere else

The push that carried R36's replication failed `eval:protocol` with:

```text
FAIL eval/results/poc-sota-bird-dev-R36-pack-assignment.json — prereg/R36-pack-assignment.md:
  declares V62, V63, which the run never emitted;
  does not name V1, V2, V3, V4, V5, V6, V7, V8, V32, V12, V48, V44, V49, which the run emitted
```

**The gate was right and the registration was wrong.** `prereg/*.md`'s `gates` header means *the gates this
round's dispatch emits*, and claim 4 of `eval:protocol` enforces it in both directions: every declared gate
must be emitted by the artefact that names the file, and every emitted gate must be declared. R36's header
said `V62,V63` because those are the round's deciding gates — but they are produced by
`pnpm eval:pack-assign` from an artefact that already exists, and no dispatch emits them. The header therefore
claimed a run that never happened, and the run it did happen to name emitted thirteen lane gates the file
never mentioned.

**Why the ambiguity was invisible until now.** Every previous registration had exactly one carrier: a
`prereg` file described a dispatch, the dispatch emitted gates, the artefact named the file. R36 is the first
round whose verdict lives in a **second** artefact produced after the dispatch — an assignment reading over an
old run — so it is the first file with two carriers and one header. The header now lists the dispatch's
thirteen gates, and the two deciding gates are named with their criteria in a section of the file, which is
where a reader looking for "what decides this round" will find them.

**What was not done, deliberately.** `V62`/`V63` were not moved into the artefact, and the artefact's
`config.prereg` was not blanked: both would have made the check pass by hiding which artefact came from where.
The field says what it always said; the file was wrong about its own contents and is now right about them.

### 34.8 Four ways to fill a gate's input dishonestly, and the fifth that is not a way at all

R29 stage 1 is one function — `armRecordFromDriver` in `packages/eval/src/tau2-instrument.ts` — that turns what
the τ² driver observed into the record the protocol's gates read. It is thirty lines of arithmetic and it exists
because four of the numbers in it can be filled in a way that makes a gate pass while measuring nothing. Each is
refused explicitly, and each refusal is a test:

| the count | the dishonest fill | what the module does |
|---|---|---|
| mean items per pack | a run that served nothing reports "no reading" | reports **0**, which is V1's failure case |
| call failures | no calls reports **0%**, the best possible score | omits `calls`, so V8 does not fire |
| distillation failures | an unobservable count reports **0** | omits the whole learning record, so V32 does not fire |
| held-out task list | the driver de-duplicates before the gate sees it | passes the list **with its repeats**, and reports distinct tasks separately |

The fifth is not a dishonest fill but a missing one: **the agent's calls happen in another process.** `phase()` now
returns the phase's stdout, `run_split.py` emits a `diagnostics` line, and the driver reads `agent_turns` from it —
and if that line is absent or does not carry the count, `calls` is omitted rather than filled with the distillation
calls alone. A denominator that omits every episode would grade V8 against the wrong population and pass.

**Why the arithmetic is a module with tests rather than four lines in the driver.** The prediction R29 registered
is about how many gates a second scenario can supply. If the mapping lives inside a driver that only runs in a τ²
environment, then the only way to test the prediction is to buy a dispatch — and a dispatch tests the environment
and the arithmetic at once, so a failure cannot be attributed to either. As a pure function it is 8 tests at 100%
coverage on four dimensions, and the dispatch is then evidence about the environment alone.

**What is still unproven, stated before it is measured.** Whether `run_split.py` can count the agent's turns at all
depends on whether upstream's `SimulationRun` exposes its messages; every read in `diagnostics_of` is wrapped so
that a renamed field becomes "not observable" instead of a failed run. If it cannot, stage 1 supplies four gates
rather than five, and R29's first prediction is refuted in the direction it was written to detect.

### 34.9 A reading named after a subset, and three other ways R37 would have shipped a number it did not measure

R37 measured one variable — what a memory item *is* — and the arm's own artefacts were right. Everything that went
wrong went wrong in the layer between the artefact and the sentence a reader would quote from it. Four defects,
each with the check that caught it, because three of the four were caught only because the check was run locally
before the push rather than by any reasoning about the code.

| # | defect | how it read | what caught it |
|---|---|---|---|
| 1 | the covered-subset exchange rate was computed over the whole split | `onCovered.repaired = 17`, `broken = 15` — the 1,534-question reading — under a name and a sentence that both said "on the questions it reached", where the true counts are 5 and 4 | the CI assertion, written before the reader was finished, asserted `helped === 5 && harmed === 4` from `per_case` and the regenerated artefact contradicted it |
| 2 | a second `exchangeOf` was written into `lexicon.ts` | identical arithmetic to `admission.ts`'s, over a different cell shape, tested in the new test file and therefore plausible | `tsc`: duplicate identifier at the package boundary, which is the only surface where a bin's copy meets the package's original |
| 3 | the CI step's independent licence re-check could not parse | `SyntaxError: Invalid regular expression` — the step threw before asserting anything | running the step locally; in CI it would have failed the build on a green artefact, and the failure message would have named a regex rather than the licence |
| 4 | the ledger's family count and two assertions disagreed | `a.family.datasets === 17` and a statement containing "12 of the 17", against an artefact reading 18 and 6 positive | the ledger step, run locally after the new artefact entered the audit |

**The first is the one worth reading, because the code was not wrong — the name was.** `coveredRead` was computed by
an `exchange(...)` helper that took a cell-picking function and iterated `cases`. Called once with
`(entry) => entry.arms['full-lexicon']`, it produced exactly the split reading, which is a correct number about the
wrong population. The bug could not be found by reading the arithmetic; it could be found by asking what the field
name promises and what the denominator actually is. The fix is structural rather than numeric: the row set became
the argument (`readingOf(rows)`), two readings are published (`exchange.split`, `exchange.covered`), and an assertion
pins each — 17 and 15 across the split, 5 and 4 on the 132 covered cells, with the hurdle moving from 1.328 to 1.063
between them because the denominators differ. The adversarial test that would have caught it on day one is the one
now in `admission.test.ts`: the same three repairs divided by two different hurdles read as 9.0 and 4.5.

**The second defect is about the repository's shape rather than this round.** `bin/**` is excluded from coverage —
it is top-level-await entrypoints — so a duplicated pure function inside a bin is tested by nothing and reviewed by
nobody. The duplicate here was caught by the type system only because the package already exported the name. The
rule that follows is narrow and worth keeping: **a bin may format, and may not compute.** Anything a bin computes
that a reader would quote belongs in a module with the four coverage dimensions behind it. `termOfLine` moved into
`lexicon.ts` under that rule, and `licensedLines` now calls it, so the gate and any later reading share one reader
of the rendered format instead of two regexes that drift.

**The third is the sharpest, because it was a check against trusting a gate and it was itself untrustworthy.** A
GitHub Actions step is a shell script long before it is JavaScript: the licence re-check was a `node -e "…"` whose
body built a `RegExp` from a string containing `\\p{L}` and `\\$&`, so bash consumed one level of escaping and node
received a different expression than the one written — `[\\]\\]` and a bare `$&`. Two lessons, both mechanical: a
Unicode property class does not belong inside a double-quoted shell string, and **an independent re-check that
cannot run is worse than no re-check, because the workflow reports the step as failed rather than as absent.** The
replacement matches tokens (`split(/[^a-z0-9]+/)`, an optional trailing `s`) and needs no escaping at all; it then
verified 132 of 132 lines licensed without consulting `V64`.

**The fourth is the general form of the first: a gate on a count has to be re-read whenever the set it counts
grows.** Adding R37's artefact moved the pack-size family from 17 to 18 and from 5 positive to 6, and the ledger
gate's own criterion ("at least fifteen committed artefacts") passed throughout, because it was written to survive
growth. Two hand-written assertions were not. The asymmetric outcome is the point: the *artefact* was right, the
*gate* was right, and the *assertions beside them* were stale — which is exactly the failure mode a gate is supposed
to prevent, arriving in the layer that quotes the gate.

**One docs defect, recorded because it is the same class.** `ROADMAP.md` ended with a one-line orphan — "a
competitor's number could be compared to.**" — left behind when the table above it was rewritten. It closed a
sentence that no longer existed, and it survived a commit because nothing reads prose for well-formedness. Removed
in the same commit as §34.9, and noted here rather than quietly deleted: a repository whose argument is that every
number should be recomputable also has to notice when a paragraph has lost its subject.

### 34.10 A frontier of English, a store with two scopes, and a clause that could not fire

R38 made no model call, and every defect it shipped was in the reading rather than in the data. Four of
them, and the first two share a shape: a number that was arithmetically correct about a population nobody
had built.

| # | defect | how it read | what caught it |
|---|---|---|---|
| 1 | the frontier ranked every annotated key | **two keys reach 25%** — `list` and `name`, each annotated once and each occurring in hundreds of questions | reading what the top keys *were*, not how few there were: a frontier reached in two keys is a discovery or a parser artefact, and it was the second |
| 2 | the arm's store scoped by fold when the lane scopes it by fold **and** database | **141 licensed, 132 served** — nine questions apparently dropped by the character budget | the two columns of the same artefact disagreeing, which the reading publishes side by side |
| 3 | the same scope missing entirely, testing the union of all five folds' terms against every question | **201 licensed** — a third of the reach apparently lost to a budget | the same comparison, one version earlier; the correction from 201 to 141 to 132 is recorded in the registration's disclosure |
| 4 | the registration's "the annotations were parsed" clause measured nothing | a refutation clause that cannot fire | writing the gate: a clause with no column behind it is prose, and it became `V68` |

**The first is the one worth reading, because the number was not wrong.** Two keys really do reach 25% of
the split; the keys really are `list` and `name`; the arithmetic is exact. What was wrong was the premise
that an annotated key is a term. `list` is annotated once in 272 questions — the corpus wrote a line about
it because a question happened to use the word, not because the word needs defining — and a store built
from such keys measures the frequency of English. The fix is a statistic rather than a filter: **density**,
annotations over occurrences, with the corpus supplying both numbers. It then turned out to be the round's
finding rather than its hygiene, because the density structure is the inversion the closure rests on —
0.967 at three questions or fewer against 0.077 at fifty or more.

The adversarial test that would have caught it on the first pass is the one now in `frontier.test.ts`: a
fixture where `single bond` is annotated in every question that mentions it and `list` is annotated once,
with an assertion that the vocabulary filter keeps the first and drops the second.

**The second and third are `AUDIT` §34.9's defect twice more, and the repetition is the lesson.** §34.9
recorded a covered-subset exchange rate computed over the whole split; this round computed a fold-and-
database-scoped reach by fold alone, then by nothing at all. The general form is worth stating plainly: a
reading that reconstructs a store from an artefact must reconstruct its **scopes** as well as its contents,
and scope is the part a reader cannot see in the numbers. Three versions of the same column — 201, 141,
132 — all computed by the same function, differing only in the population they were pointed at. The guard
that worked is structural and cheap: publish the licensed count beside the served count, so a scope error
shows up as two columns that should be equal and are not, rather than as a story about a character budget.

**The fourth is the smallest and the most embarrassing.** The registration's second refutation clause says
that a key universe covering under half of the annotated questions is the parser's rather than the
corpus's, and when the clause was written nothing computed that share. A rule with no instrument behind it
is exactly the failure this programme keeps finding in other people's gate tables — a non-blocking gate
that fails and is narrated is a gate that does not exist (§136) — arriving in our own registration. It is
now `V68-the-annotations-were-parsed`, blocking, and it reads 1,266 of 1,386 (91.3%).

### 34.11 A schema question that was answered by arithmetic, and two columns that were the same column twice

R39's item had been open since R30 and had been carried as a design question for seven rounds: *is an arm an
artefact?* The answer is no, and the round's first finding is that the question was never the obstacle. An
artefact is what the validity gates certify — a dataset, a fold partition, a call budget, a vetted outcome set.
An arm is a column of that run, and the three numbers it contributes (`helped`, `harmed`, `n`) are enough to
place it beside its own resolution. **Seven rounds of deferral were waiting for a schema decision that only a
formula was needed for**, which is a distinct failure from the ones this chapter usually records: not a wrong
number, not a wrong population, but a correct reframing of a problem as harder than it was.

| # | defect | how it read | what caught it |
|---|---|---|---|
| 1 | `values` published as one number | "the values channel is worth **+1.17pp**" while `arm_pairs` said **+0.85pp** for the same arm in the same run | the two blocks of one artefact disagreeing by 0.33pp; they are `values − none` and `values − full`, and neither was wrong |
| 2 | the replication table treated one decided run as a replication | `decidedAgree: true` on a contrast with a **single** decided row | writing the field: with one decided row the sign set has one element and "the decided rows agree" is vacuously true |
| 3 | the first floor table averaged two middle values | a median floor of **2.10pp** where the observed values were 2.07 and 2.13 | the round's own rule that a published statistic should be one that was observed; the median now takes the lower middle |

**The first defect is the one that matters, and it has been in the record since R26.** `arms[]` compares an
arm against the no-memory baseline SQL; `arm_pairs[]` compares it against the `full` arm. Both blocks are in
every artefact, both are labelled plausibly, and the same arm therefore has **two deltas that differ by a
third of a point**. Any sentence that says "the channel is worth +1.17pp" is quoting a treatment effect; any
sentence that says "+0.85pp" is quoting a control comparison; and a reader who has one number cannot tell
which. The repair is not to pick one — they answer different questions — but to put `control` in the row and
in the contrast name, which is what `resolution.ts` does and what the CI assertions now check.

**The second is vacuous truth, which is the failure mode of every `every()` in this repository.** §138 found
the same shape in `V6-controls-inject`: a gate that evaluates `every` over an empty list and reports green.
Here it was a derived field evaluating "agreement" over a set of one. `null` is the correct answer and `null`
is what it now returns, with a test that asserts it rather than a comment that promises it.

**What the round shows about the record rather than about the code.** 98 arm rows, 18 decided, and **every
decided row is larger than 4.5pp**. The three design sizes impose median floors of 4.38pp / 2.07pp / 0.82pp.
So the range from +8pp to −9pp that this project has quoted since its first iteration was produced by
instruments that could not see anything below four points, and the twenty runs of `full − none` are eighteen
negatives, two positives, and one decision. **That is not a disagreement between experiments; it is one
experiment repeated at a size that could not answer it.** The single contrast whose effect grows with the
sample — `linked`, 7.71pp → 9.26pp — is the control that keeps the reading honest: shrinkage is a property
of noise, and this instrument can see growth when there is some.

### 34.12 Two defects found by a round that changed no number, and a table nobody recomputed

**§24.7 had carried R27's stage 3 as "mechanical and open" since stage 2 closed**, and it was right
about the move and wrong about what the move would find. Moving six modules into `packages/sql` changed
no artefact, and along the way it produced two defects — one in the scanner written to check the move,
one in the code being moved.

| # | defect | how it read | what caught it |
|---|---|---|---|
| 1 | the comment stripper did not know about regular expressions | `/^- "([^"]+)":/` in `lexicon.ts` opened a string the stripper never closed, so the module's remaining comments were swallowed and the module was reported **SQL-coupled** | a module the hand-written table said was general appearing in the coupled list; the fix is the standard division-vs-regex disambiguation |
| 2 | `sql-guard`'s deadline covered the child's boot | a queued statement on a loaded machine was reported as `deadline` rather than as the answer it would have given | the full-suite run, where 2,700 concurrent tests slowed `node:sqlite` boot past a 250 ms deadline |

**The first defect is the more instructive one, because it is a false positive rather than a miss.** A
scan that over-reports coupling looks *conservative*: it says more of the repository is scenario-bound
than really is, and a reader would rather have that than the reverse. But the number it produces is then
wrong in the direction that gets believed, and the twelve deferrals that followed would each have needed
a reason for a coupling that did not exist. The stripper now distinguishes the three `/` cases — comment,
regex, division — and three tests exist because three shapes broke it earlier.

**The second is a product defect the move exposed by changing nothing.** `BoundedSql` starts a timer when
a statement is posted to a child, and a freshly spawned child spends 40–80 ms loading `node:sqlite`
before it can answer. On an idle machine that is invisible; on a loaded one it consumed a 250 ms deadline
and the statement was recorded as a timeout. The child now sends a readiness message and `#ask` starts its
clock afterwards. **This is the same class as §24.5 and §29.3**: an instrument whose measurement is
partly a property of the machine it runs on. The lanes use a 20-second deadline where 80 ms is noise, so
no published number moves — and the failure mode it removes is the one that would only ever appear on a
slow CI runner, i.e. exactly where nobody can debug it.

**What the audit should record about the claim itself.** `PROGRESS` §136 measured the coupling table once,
by hand: 11,764 lines, 37.2%, zero in `core`. Seven rounds later the architecture had changed and the
sentence had not, because a paragraph does not fail a build. The table is now `pnpm eval:coupling`, it is
recomputed on every push, and the claim it certifies — `core` names no database in code — is `V74`. That
is the general lesson and this chapter has now recorded it in five different layers: **a number that is
not recomputed is a number that is true until someone edits the code it describes.**

### 34.13 An id that was only unique inside its scenario, and a bar from the wrong one

R41 is the first round in this record whose *own code* produced two defects before the dispatch that
would have exposed them, and both are the same species: a name or a number carried across a boundary
that does not preserve its meaning.

| # | defect | how it would have read | what caught it |
|---|---|---|---|
| 1 | τ² task ids are unique **inside a scenario**, not across two | a cross-domain arm's split and evaluation sets would intersect completely — both scenarios number their tasks from zero — and `V2-fold-partition` would report **every evaluated task as leaked** | writing the plan as a pure function with a disjointness property, then testing it with two scenarios that share task numbers |
| 2 | the lane graded every arm against `pass^4 = 0.575`, which is a **τ²-retail** number | an airline arm's delta would have measured the difference between two scenarios and published it as the difference the memory made | reading the dispatch configuration against the lane's constant while preparing the run; the fix is `l4-scenario.ts`, and the artefact now carries `published_bar_applies: 0` |
| 3 | a CI assertion pinned the number of modules that name a scenario only in prose (`23`) | adding a module that explains, in prose, what a scenario's rules do not transfer to failed a check that has nothing to do with coupling | the CI run on the commit that added this round's modules — the same class as the adapter line count corrected in the previous round's last commit (`c1ec5d8`: *"the adapter's line count is recomputed, so the assertion must not pin it"*), and the second time in two rounds |

**The first defect is the one worth remembering, because nothing in the lane would have reported it.** A
leak reported by `V2` is a *blocking* gate, so the run would have failed loudly; what it would have
destroyed is the reader's trust in the projection, since the two sets are provably disjoint by
construction and the gate would have said otherwise. The qualification (`retail/3`, `airline/3`) is
applied where the result document is read, so the split, the pair and the ledger speak names that cannot
collide; the driver re-checks disjointness immediately before it pays for the learning half, because a
leak is the one defect in this lane that produces a number instead of an error.

**The second is the error this record keeps finding in published comparisons, now made at home.** A
leaderboard row is a number about one benchmark; a delta computed against it from a *different* benchmark
is a difference between benchmarks wearing a capability's name. The rule that came out of it is narrow
enough to be checkable — *a published number is a bar for the scenario it was published for* — and the
artefact states which of the two it is (`published_bar_applies`) rather than leaving a reader to guess
from a missing field.

**The third is a repetition, and repetitions are the only evidence a process has.** The adapter's line
count was pinned in `ci.yml` one round ago (§34.4) and the same shape reappeared for a prose count. The
assertion now compares the walk to the committed snapshot, which is what it was always for: the check
exists so that a *silent* divergence fails, not so that a legitimate addition does.

### 34.14 Four gates that read a store nobody built, and the name that crossed a boundary

R41 is the first round in this record where the *result* was a defect in the instrument rather than in the
hypothesis, and the defect is the one this chapter has been circling since §29.3: a lane reported a number
about a treatment that was not applied. The memory arm's store held no knowledge, so its pack was empty
for all 200 recall requests, and the arm spent thirty-nine minutes being the reference arm.

**Four defects, and each one is a reading that existed and did not reach a gate.**

| # | defect | where the reading lived | what the record said instead |
|---|---|---|---|
| 1 | the distiller's model id is litellm's `deepseek/deepseek-chat`; `api.deepseek.com` serves `deepseek-chat` and answers **400** to the prefixed form | `LlmClient` knew both strings and posted the wrong one | `stored 0`, no reason |
| 2 | a refused request was not counted as a failed prompt: `failures` moved only after four attempts were spent, and a 400 is not retried | `LlmClient.stats` | `prompts: 32, failures: 0` — the best reliability claim available, about thirty-two refusals |
| 3 | `combineInterpreters` runs every interpreter and stops at the first that throws, so the rule interpreter never ran; its docstring called the second argument a "fallback" | the composition | nothing: `distill` counted 32 failed events and returned |
| 4 | `V44-domain-accounted` passed on `0 <= 0` | the ledger gate | a **blocking** gate certified a store with no items in it |

**The fourth is the one to keep.** The first three are ordinary: a name that means one thing to a router
and another to an endpoint, a counter that only moves on one of two failure paths, a docstring that
described an intention rather than the code. The fourth is a *gate* — blocking, published, part of the
thirty-nine the protocol claims are recomputable — and it was satisfied by an empty population. `V44` asks
whether every domain-free item either arrived without a domain or lost it to a widening, and with zero
items every side of the inequality is zero. **`every` over nothing is true, and the aggregate form of it is
an inequality over nothing**, which is the same vacuity the chapter recorded for `V6` and `V7` — except
that those two are *reported* as vacuous by the lane's own audit and `V44` was not.

**The three fixes, and why each is at the layer it is.**

- **The name is translated at the client** (`restModelOf`), not at the workflow. The workflow could have
  set a second variable and left both strings to a reader; the client knows which endpoint it posts to, so
  it is the only layer that can say what that endpoint serves. The list is one alias wide
  (`deepseek`) and everything else is left alone: `openai/gpt-4o` and `deepseek-ai/DeepSeek-V3` are names
  of other things, and mangling them would report a provider mismatch for a configuration that chose
  differently. The artefact records both — `configuredModel` and `model` — so a reader can see the
  translation rather than infer it.
- **A prompt that was sent and refused is a failed prompt**, on both terminal paths. The counter was not
  wrong about what it measured; it was measuring one of two ways a prompt ends badly and being read as if
  it measured both.
- **The fallback is the host's decision, not the combinator's** (`resilientInterpreter`). A blanket
  "run the rules when the model fails" is a *different treatment* — a pack of generic negative lessons
  graded as a pack of distilled procedures — so the fallback here is conditional: a failure of this event
  falls through and is counted, a failure of the *run* (`stoppedRun`: budget, provider, deadline, config)
  is rethrown and stops the run before an hour of evaluation is spent on a pack that does not exist.

**And the driver keeps its diagnostics.** `DistillReport.failed`, `.candidates`, `.events`, and
`LlmClient.stats.prompts`/`.failures` now reach the arm record, which is what makes `V32` and `V8` fire at
all — both were *absent* on R41, and absent is a gate a reader cannot argue with. The call tally carries a
`scope` (`run` | `distillation`) because the episodes' calls belong to the agent process and the
distillation calls are the driver's own: a rate over a subset is a rate over a subset, and the artefact
says which.

**The boundary lesson, in the form this chapter keeps re-learning.** §34.11 recorded a schema question
answered by arithmetic; §34.13 recorded an id that was unique inside a scenario and a bar that belonged to
another; this section records a *model name* that was correct in one client and wrong in the other. In each
case the value was right where it was written and wrong where it was read, and in each case the fix was to
name the boundary rather than to correct the value.

### 34.15 The third arm was unreachable, and the numerator counted the wrong thing

§34.14 was written from R41's artefacts. Reading them again for the registration of R42 — a round whose
whole purpose is to make those readings reach a gate — exposed two more decisions in the same lane that
were *nearly* right. Neither changed a number in R42, which was already dispatched; both would have
changed the next dispatch, and one of them would have failed an arm that was correct.

**Defect 5: a status classifier whose third arm could not be taken.** `LlmClient` decided what to do with
a non-ok reply in three steps, and the third was unreachable as written:

| step | condition | outcome | reachable? |
|---|---|---|---|
| 1 | `status >= 500 \|\| status === 429` | retry | yes |
| 2 | `status === 402` | `MG_E_CONFIG`, no credit | yes |
| 3 | everything else non-ok | `MG_E_STORE_IO` | **the `4xx` range *was* "everything else"** |

Every status an HTTP response carries is `>= 500`, `429`, `402`, or in `4xx`. So the third arm was not a
default for exotic statuses — it was the arm every refusal took, and it threw the code `stoppedRun`
classifies as **per-prompt**. A model id the endpoint does not serve therefore reached the run as a
prompt that failed after retries it never made, which is precisely the misreading R41 published. The fix
decides once, in three exhaustive cases (`transient` / `unpaid` / `refusal`), and `refusal` is
`MG_E_CONFIG` — run-level, because the provider will refuse the identical request identically.

The general form of this defect is not "a missing branch". It is that **a fall-through arm is invisible
in exactly the way a default is**: it looks defensive and it is doing the work. The test that would have
caught it is the one the round wrote afterwards — a 400 must stop the run, not decrement a store.

**Defect 6: `V32`'s numerator counted the model's passes as the record's losses.** The gate reads "at most
10% of the learning questions went unanswered". The τ² driver answered with
`train.length - corrections.length`, and a correction exists only for a task the model **failed**. On a
training half where the model solves a third of the tasks, a store built from every single failure
reports 33% unanswered and the gate — blocking — fails an arm whose treatment is exactly the one it was
registered as.

This is the mirror of §34.14's defect 4, and the pair is worth stating together:

| | population | numerator |
|---|---|---|
| `V44` (R41) | **empty**, so `0 <= 0` passed | n/a |
| `V32` (R41) | correct (32 training tasks) | **wrong**: a pass is not a gap |

A gate that certifies an empty population and a gate that fails a correct arm are the same failure from
opposite sides: neither of them is measuring what its criterion says, and both are believed because a
gate is believed. `V44`'s repair was to put the population in the criterion. `V32`'s is to put the
numerator's definition where the decision is made, once: `teachingOf` says whether a task teaches,
`learnableCorrections` keeps the ones that do, and `unansweredTasks` keeps the ones that do not teach
*and* were not passes — unscored and criteria-less failures. The driver reports that count, and its log
line states both numbers (`N correction(s) from M task(s), K unreadable`) so the two cannot be read
apart.

**Why R41 could not have shown it.** The arm that round measured had an empty store: zero corrections,
thirty-two unanswered, both maximal, and the arithmetic looked right for the wrong reason. The defect
was visible only in the shape of the code, which is the argument for reading the code after reading the
artefact rather than instead of it.

**What covers each fix now.** `verdictOf`'s three cases are exercised by a 400 (refusal),
`408`/`409`/`425` (transient) and `402` (unpaid), with `model-client.ts` at 100% on all four dimensions;
`unansweredTasks` has four cases — passed, failed-with-criteria, failed-without-criteria, unscored — and
the driver's end-to-end test reaches the arithmetic through a stand-in runner that states each task's
expected tool calls, so the correction is real rather than stubbed. Full suite at the time of writing:
**2,862 tests across 137 files, 99.98 / 99.69 / 100 / 99.98**.

### 34.16 Two keys, one empty pack, and a rate with no population

§34.15 was written from reading R42's *code* before its numbers existed. R42 then ran, and its artefacts
carry a reading that makes both of that section's defects look like the easy half: the store was built
(14 items, 0 distiller failures), the ledger reconciled, `V44` passed on a real population — and
`meanPackIds` was **0.00 over 200 requests**. The arm named `memory` received no memory, for the second
round running, from a store that was no longer empty.

**Defect 7: the domain on every claim was the model's spelling.** `parseScope` takes `task` from the event
and `domain` from the model's JSON. The prompt forbids a guess; nothing validates one. `MemoryStore.search`
then filters items on `scope.task` **and** `scope.domain` equality, and the recall façade asks in the
host's spelling — so a claim stored as `Retail (US)`, `retail_domain` or `Retail.` is active, counted,
ledgered and **unreachable**, and every one of the three symptoms is invisible to the gate that looks
closest: `V44` counts items *without* a domain, and these have one.

The fix is not a normaliser, which would leave the model in charge of the key and require a mapping for
every spelling it might invent. It is `stampDomain`: the host observed the scenario, so the host's string
overrides whatever the interpreter returned, on both branches of the fallback — the rules write a scope of
their own, and a store half-keyed by the model and half by nobody is worse than either.

**How this is known rather than asserted.** The suite holds the experiment in two halves: one store, one
claim, one question, and the only difference is the stamp. With it, the item is `active` under
`domain: retail` and the pack serves it; without it, the item is `active` under `domain: 'Retail (US)'` and
the pack is empty. Both halves pass, so the mechanism is a measurement rather than a story — and the
second half is a permanent record of what R42 looked like from inside.

What this does **not** establish is that R42's twelve items were mis-spelled. They lived in a store the
job deleted. The stamp removes the class; R43's census names the instance.

**Defect 8: `V1`'s rate had no population, so three different defects read the same.** `0.00
rules/question` is produced by: the agent never asked; the store held nothing active; the items were stored
under a key the recall does not ask in; or the façade dropped what the store offered. Four layers, one
number. The arm now records `store` (stored, active, servable-in-scope, and a status histogram) and
`recall` (requests, served, empty), and `V1`'s sentence reads

```
0.00 rules/question: 0 of 200 request(s) carried an item, from a store of 14 (14 active, 14 in scope)
```

which is a different sentence, about a different layer, from `…and the agent made no recall request`. The
gate grades nothing new; it explains, which is what a gate owes a reader when it fires.

**Defect 9: the learner could read one of the two rubric forms τ² writes.** `learning.edited` was 7 of 32
and `learning.unanswered` 25, and the reason was not the corpus: τ²'s `retail` domain checks database
state and states `nl_assertions`, while `airline` names the expected calls. `taskCorrection` read
`actions` only, so 25 failures whose rubric says exactly what should have happened taught nothing, and
`V32` — the gate built to catch a lost question — fired at 78.1% against a store that had read every
failure it could.

`TauTask.assertions` carries the prose rubric; `taskCorrection` prefers the calls (they are the sharper
lesson) and falls back to the assertions; `teachingOf` remains the single decision, so `learnableCorrections`
and `unansweredTasks` cannot drift apart. A task that states neither still teaches nothing and is still
counted, which keeps the gate's population honest in the other direction.

**The pattern across §34.14, §34.15 and §34.16 is one thing.** R41: a name carried across a boundary that
does not preserve meaning. R42: two keys, both taken from the party that does not own them. Each round the
defect moved one layer closer to the measurement, and each was found by reading the artefact for a number
that could not be true — `0.00` beside `14`, `32/32` beside `failures: 0`. The gates fired; the sentences
did not say enough. That is what §34.15 and this section spent their length on.

**Coverage at the time of writing.** `2,883 tests across 137 files, 99.98 / 99.70 / 100 / 99.98`;
`tau2-distill.ts` at 100 on all four dimensions, `tau2-instrument.ts` at 100, `tau2.ts` at 100,
`gates.ts` (protocol) at 100.

### 34.17 Three sentences about a corpus, none of which the corpus said

**What was audited.** Not the code this time, but the prose this round published about τ²-bench's labels —
in `TECH-DESIGN §17.82`, in `WHITEPAPER §3.6.38`, in two code comments and in a commit message. The audit
instrument is new (`§17.83`): a census of the corpus files at the pinned ref, which is the only source that
cannot agree with a run's counters by construction.

**Defect 10 — the two scenarios were swapped.** The published claim was "`airline` names the expected calls,
`retail` states `nl_assertions` and names no calls". Counted at v0.2.0: `retail` names calls on **112 of
114** tasks and states prose on **8**; `airline` states prose on **50 of 50** and names calls on **43**. Both
halves of the sentence are backwards. It survived review because it was plausible — two domains, two forms,
one each — and because nothing in the record printed the corpus's own shape next to the claim.

**Defect 11 — the number that motivated the fix cannot come from the corpus.** `TECH-DESIGN §17.82` and two
doc comments in `packages/eval/src/tau2.ts` said the old reader left "25 of 32 failures with nothing to
learn". The census bounds that explanation: **2 of 114** retail tasks state neither a call nor a rubric, so a
25/32 rate is at least an order of magnitude beyond what the corpus can supply. The 25 came from the
driver's old `train.length - corrections.length`, which counted *passes* as gaps — the arithmetic §17.80
replaced with `unansweredTasks`, and the reason `V32` read 78.1% on a store that was not missing anything
it could read. The reader fallback is still correct as a capability (7 airline tasks state prose and no calls, and
one of them is worth a lesson); it was just not the cause that was published.

**Defect 12 — a corpus number that came from a summary instead of from the file.** `WHITEPAPER §3.6.37`
printed retail's population as 115 tasks. Upstream's readme advertises 115 for the retail *base* split; the
file at the pinned ref holds **114**, which is what the census counts and what the lane lists. At 114 the
80%-power floor at the observed discordance moves from 11.09pp to 11.13pp, so no conclusion moves — and that
is exactly why the wrong number could live in a table: it was harmless, unchecked, and read as authoritative.

**The common shape, and it is the third round in a row.** §34.14 found four gates reading a store nobody
built; §34.15 found an arm nobody could reach; §34.16 found a rate with no population. Each was a *sentence
about a measurement* that outran the measurement. This one is the same failure one layer out: a sentence
about a corpus, written by the same hand that was measuring a run, with no step in the round that could
contradict it. The repair is procedural rather than editorial — the census is a step in the L4 job now, so
the corpus is counted before the arms run and printed into the same evidence bundle the conclusions come
from. A claim that contradicts it will be contradicted by the artefact, in the same place a reader looks.

**What is *not* claimed.** The census does not explain R43's `unanswered` count, and this section does not
pretend the arithmetic defect is the whole of it: the readback decides. It does fix the bound, so the next
attribution has to fit inside 2 of 114.

**Coverage at the time of writing.** `2,904 tests across 138 files, 99.98 / 99.70 / 100 / 99.98`;
`label-census.ts` at 100 on all four dimensions beside `tau2.ts`, `tau2-distill.ts`, `tau2-instrument.ts`
and the protocol `gates.ts`.

### 34.18 Two sentences that no artefact could support, and a count that was wrong for one commit

**Defect 13 — the census reached the file and not the record.** R43's pair report printed `V1` as `0.00
rules/question`, the sentence from before the population existed, while the memory arm's artefact held
`store: 24 stored / 0 active / 0 servable` and `recall: 1,518 requests / 0 served`. `tau2ArmRecordOf` maps
that artefact into the record the projection reads and its type named neither field, so the census stopped
at the boundary. The gate's "actual" is built from the record, which means an instrument that is right in
the file and absent from the record is silent everywhere it matters.

**Defect 14 — a status breakdown that existed in prose only.** `PROGRESS §158` published "fourteen items,
14 active, 14 in scope" beside R42's `0.00 rules/question`. R42's record contains no store census at all:
the fields were added in R43. The sentence was assembled from a later round's *intended* reading of a
per-arm probe and printed as if it had been recorded. It is now corrected in place with a pointer to the
first round that can say anything about statuses, which is R43 and which says `24 stored, 0 active`.

**Defect 15 — a count that was self-consistent and false for one commit.** Adding the census to the documents
produced the sentence "we do exactly this for 15 of 164 tasks" — the sum of retail's prose count and
airline's prose-only count. Only one of those numbers answers the question: retail's 8 prose tasks also name
calls, so a calls-only reader loses nothing there, and the prose-only population is **7**, all in `airline`.
Caught by the next arithmetic pass, corrected in the code comment, the test note and three documents, and
committed as its own correction (`e58c082`) so the record shows the mistake rather than a clean final state.

**The shape, fourth round running.** §34.14: four gates reading a store nobody built. §34.15: an arm nobody
could reach. §34.16: a rate with no population. §34.17: three sentences about a corpus, none of which the
corpus said. This one: a census that reached the artefact and stopped at the record, and a status quoted
from a field that did not exist yet. Every case is a *claim about a measurement* outrunning the measurement,
and every repair is plumbing or a step rather than an argument — the census is printed by the job, the
reason histogram is in the census, the record carries what the file carries.

**What this round did *not* conclude.** That the admission gate is mis-tuned. The three decisions that write
`candidate` have different repairs and two of them share a reason string, so the round registers the
histogram as its deliverable and refuses to pick a fix first (`prereg/R44-admission.md`). One hypothesis —
that the driver's manufactured completion reads as a trivial edit — was excluded by a three-condition
measurement before the dispatch, and that test is committed so it cannot come back.

**Coverage at the time of writing.** `2,909 tests across 138 files, 99.98 / 99.70 / 100 / 99.98`;
`label-census.ts`, `tau2-gates.ts`, `tau2-distill.ts`, `tau2-instrument.ts` and the protocol `gates.ts` at
100 on all four dimensions.

### 34.19 The guard that measured a shape the corpus does not contain

R44 returned the reason it was registered to return: `store.reasons` was
`insufficient-evidence=19`, with `needs-corroboration` and `contradiction-budget-exceeded` on none.
`V1` finally printed its population (`0 of 1427 request(s) … from a store of 19 (0 active, 0 in
scope)`), `V32` stayed at 0/32, `V5` failed at 19.41pp, and `l4-paired` was +12.00pp at p = 0.1460 with
an empty pack. Five of six predictions held. The job's conclusion is `failure` because four *blocking*
scientific gates failed; the build gate (`ci.yml` run `41872680757`, same head) is `success`. These are
different colours with different meanings and both are recorded; nothing is suppressed.

**Defect 16 — a guard test with the wrong subject.** R43 excluded "the driver's manufactured completion
reads as a trivial edit" with a three-condition measurement, all three activating at `trust = 0.9`.
All three conditions used **one action with an empty `arguments` object**. The real τ² retail corpus
carries 5–12 actions per task with 1–5 arguments each. Reproduced offline on the exact file the workflow
censused (sha256 `76e1fa64…`, 328,166 bytes) through the real `diffJson` → `trustFor` →
`scoreKnowledge` → `decideStatus` chain: over the 32-task learn split, `distance` ranges
0.1707–0.3333, `trust` 0.5000–0.9000, and **31 of 32 items are held as candidates**. The excluded
hypothesis was correct in kind and wrong in measurement: the shape *is* the cause, and the corpus shape
is not the shape that was tested. The test remains committed; its comment now has to state its
population, and R45's test uses the corpus.

**Defect 17 — a quadratic penalty nobody wrote down.** `createLlmInterpreter` assigns
`candidate.evidence.weight = trust` and `candidate.trust = trust`. `scoreKnowledge` computes
`logOdds += weight × logit(trust)`, which is therefore `trust × logit(trust)`. No comment in either
file says the same quantity enters twice; the defaults' comment says "one trusted edit (weight 0.9)
must clear `minSupport`", which is true and incomplete. Measured consequence: `support` clears 0.8 at
`trust = 0.8`, but `confidence` there is 0.4806, and the activation boundary is `trust = 0.89`
(`confidence = 0.6013`). Of 32 items, 16 have `support ≥ 0.8` *and* `confidence < 0.6`. A reader of
the policy defaults would conclude that `minSupport` is the binding constraint; it is not.

**Defect 18 — the refutation branch named the wrong function.** `prereg/R44-admission.md` said that if
`insufficient-evidence` dominates and confidence is the failing half, "the repair is
`activationThreshold`'s input — `scoreKnowledge` — and the round after reads that function's weights
rather than `minSupport`". The five-condition offline ablation refines this: lowering
`activationThreshold` to 0.45 admits 17 of 32 (a wrong lever that weakens the gate), lowering
`minSupport` to 0.5 changes nothing (1 of 32), and raising `singleObservationTrust` changes nothing.
Only correcting the **input** — gold-verified semantic distance — admits 32 of 32 without touching a
threshold. The pre-registration was refutable and was refined by measurement, which is the intended
use of a refutation branch, not a failure of it.

**Defect 19 — the published delta is a noise sample, twice.** R43 reported −4.00pp and R44 reported
+12.00pp, both with `recall.served = 0`. `pass^4` for the memory arm moved 0.38 → 0.52 across two runs
of the same untreated condition. Fourteen points of run-to-run drift against a minimum detectable
difference of 19.41pp is the quantitative reason neither delta is a result, and it is why the ranking
table in `COMPETITIVE` L.4 does not move on R44's 0.52.

**The shape, fifth round running.** §34.14 four gates reading a store nobody built; §34.15 an arm
nobody could reach; §34.16 a rate with no population; §34.17 three sentences about a corpus that the
corpus did not say; §34.18 a census that stopped at the record. This round: a reason histogram that
named the decision but not its half, and a guard whose population was one action. Every case is a
measurement whose scope was narrower than the claim built on it. The repair is again plumbing and
evidence, not an argument: item-level `trust`/`support`/`confidence` in the census, a corpus-shaped
test, and a semantic edit hook whose condition is stated in advance.

**What this round did not conclude.** That memory helps or harms. No pack was served in R41–R44; the
effect is unmeasured. It also did not conclude that the thresholds are mis-tuned: the ablation rejects
all three threshold levers and selects the evidence input instead.

### 34.20 A snapshot that looked like a timestamp, and a green local check that was not green

R45 shipped `tau2-admission.ts`, the corpus-shaped test, the driver hook, the
item-level admission census and `prereg/R45-admission.md`. Local `pnpm check`
exited 0 with 2,921 tests and coverage 99.98 / 100 / 99.67 / 99.98. The first
push (`c65468f0`) made CI run `42129954733` **fail** at step 37, "The scenario is
a measurement, not a paragraph".

**Defect 20 — a tree reading filed under timing noise.** The coupling ledger
compares a freshly walked snapshot with the committed `eval/results/poc-coupling.json`
and fails when `scanned`, `totals.modules` or a gate disagree. Adding one eval
module moved nine leaves: `scanned` 136 → 137, `eval.modules` 82 → 83,
`totals.lines` 37,319 → 37,528, `coupledShare` 0.1952 → 0.1941, the eval→core
edge 33 → 35 files, the `V72` detail, and the summary sentence. `pnpm check`
regenerates that file locally, so the local gate is green *by construction*; the
committed file was the old tree. Earlier rounds taught that `pnpm check` rewrites
result files with `ranAt` and sub-millisecond timings, and the habit of clearing
them was applied to all of them at once. Nine structural leaves were cleared with
the noise, producing exactly the local-pass / CI-fail drift this project forbids.

**The repair was a semantic diff, not a blanket exclusion.** Each changed leaf was
classified: `bench/results/study.json` had 79 changed leaves, all p50/p95 timing
jitter in microseconds; `poc-integrity`, `poc-l0`, `poc-l2b` and `poc-memform`
changed only `ranAt`; `poc-delivery` changed `ranAt` plus four timing values.
Only `poc-coupling.json` changed structurally, and only that file travelled, as
`bd456c3` → `26f7c3f0`. CI run `42130978881` on `26f7c3f0` is **success**. The
repository's own history confirms the convention: `0028dd6`, `ae36444` and
`ea99e67` each updated the coupling snapshot in the same commit that added a
module.

**The rule this leaves behind.** A generated result file is not one category. Some
are clocks, some are readings of the source tree, and a gate may require the
second kind to be committed. Clearing by filename extension is not a policy;
clearing by what each changed leaf *means* is.

**Also recorded.** `prereg/R45-admission.md` first failed `pnpm eval:protocol`
with "## Refutation: section is missing" because the section was titled
"Refutation and revert rule". The validator requires the exact heading and a
bullet in each of `## Prediction` and `## Refutation`; the title was corrected and
`pnpm eval:prereg` passes. The first full `pnpm check` also exited 1 for this
reason — the background task's reported exit code 0 was the trailing `tail`'s,
not the check's. Every gate in this round was read from its own real exit code
after that.

### 34.21 A waiting round with no defect, and why that is the finding

**What was checked.** On resume, `microglia` local `bd456c3` and remote
`26f7c3f0` were compared by content and `microglia-docs` local `9a4880d` and
remote `51c25fba` likewise; both remote heads carry the intended commits and
the differing SHAs are the Git Data API rebuilding them. `ci.yml` `42130978881`
is green on `26f7c3f0`. Run `42131391874` is `in_progress`. The prior SOTA
failure `41872858497` was re-read from its own log: four blocking **scientific**
gates (`V1-pack-not-empty`, `V5-resolution`, `V16-transfer-resolvable`,
`l4-paired`) failed on an empty pack, `V32` stayed at 0/32, and `ci.yml` on that
head was green. No infrastructure fault was found, so no repair was warranted.

**No new defect was found, and none was invented.** The round's work was a first-
hand source study (two arXiv abstracts and two GitHub repositories, read file by
file), a twelve-item design skeleton for a round that is still blocked, and
documentation. No file in `microglia` was added, edited, deleted or committed.
In particular no threshold was relaxed, no arm was added, no package was split,
no test runner was migrated, and no second workflow was dispatched while R45 was
measuring. A watcher polls the run so its readback is not late.

**The rule this leaves behind.** A pinned dispatch is a measurement in progress.
"Making progress" during it is not a licence to create a diff: a second dispatch
would reuse the same artefact name, and any source change would make the
readback unable to name the treatment it measured. The absence of a code change
in this round is therefore an auditable decision, not an omission. The only
permitted parallel work is that which changes no number the run will report —
source study, documentation and offline measurement — and the acceptance bar on
every later round is unchanged: TDD, real tests, no mocks, ≥ 95% per dimension,
`ci.yml` green, both repositories pushed as Lambertyan.

### 34.22 A threshold copied from a competitor before its population was counted

**The defect.** `TECH-DESIGN` §17.87, written earlier in this same round,
registered R46's `distinct-task-support` arm with a `sup3`-style floor of
**≥ 3 distinct supporting tasks**, taken from IBM's airline core (14 `sup3`
rules at 45.0% against 101 lossless rules at 40.0%) and from ALTK-Evolve's
`core_support = 3`. The threshold was copied from a different corpus and a
different benchmark. Nobody had counted how many items in *this* lane could
reach it. That is a design defect, not a result: a dispatch with an empty
selected population reports a null that is indistinguishable from "the rule does
not help".

**The measurement, offline and read-only.** On
`eval/fixtures/tau2-retail-learn-actions.json` (sha256 `b5e49bb7…`, 28,749
bytes, 32 tasks, source sha256 `76e1fa64…`, 328,166 bytes), four normalisations
of "the same rule" were counted with no model call and no repository change:

| normalisation | distinct groups | support = 1 | groups ≥ 2 | groups ≥ 3 |
|---|---|---|---|---|
| full sequence with argument values | 32 | 32 | 0 | 0 |
| action names only | 26 | 21 | 5 | 1 |
| name + argument-key skeleton | 26 | 21 | 5 | 1 |
| unordered tool set | 21 | 13 | 8 | 3 |

The strictest definition makes all 32 tasks unique, so a ≥ 3 floor selects
**nothing**. At sequence/skeleton level it selects one group covering three
tasks. Only the loosest definition — which discards order and arguments — yields
three groups. The distiller's own statements are LLM output and were **not**
measured; no claim about their support distribution is made here.

**The repair.** `TECH-DESIGN` §17.88 adds a P0 prerequisite: before any R46
dispatch, run the real distiller once on the pinned learn split and commit the
histogram of distinct-task support over the emitted statements. The registered
floor is computed from that artefact, never chosen after seeing `l4-paired`.
MemGuard's `>= 2` (`governance.py:205`) becomes a separate registered contrast
arm rather than a post-hoc fallback. R44's measured MDE of 19.41pp at 50 paired
tasks still stands, so replication is registered rather than a single pair.

**Why this is recorded as a defect rather than a design note.** It is the same
class as R43's `handle.edit` no-op rejection (§34.16) and the R45 admission
input mispricing (§34.19): a mechanism that is plausible in prose but that a
real measurement refuses. The difference is that this one was caught by an
offline count **before** an 80-minute dispatch was spent on it. R46 remains
unopened and blocked on R45's readback; no source file, artefact, workflow or
head in `microglia` was touched.

### 34.23 The use side: a scope that was never a filter, and a widening channel that was switched off

**Two hypotheses were tested and rejected before this section was written.**
The first was that the hard `scope.task` equality in `MemoryStore.search`
(`if (item.scope.task !== query.task) continue`) prevents delivery in the
transfer arm. It does not: `tau2-driver.ts:125` defines
`const TASK = 'tau2.act'`, and the learn-side candidates carry the same
constant. The second was that a domain mismatch between learning (retail) and
evaluation (airline) explains `recall.served = 0`. It does not: `RECALL_DOMAIN`
defaults to `LEARN_DOMAIN`, and the driver's own comment states that asking in
the store's terms *is* the transfer treatment. Both checks are recorded so that
the defect below is not read as a guess.

**What the source actually says.** `scopeMatches` in
`packages/core/src/kernel/knowledge.ts` filters on `domain` only when
`filter.domain !== undefined && scope.domain !== undefined && scope.domain !==
filter.domain`. An item whose `scope.domain` is `undefined` is therefore
deliberately *not* filtered: that is the widened item, the one generalisation
produces when a rule has been endorsed in more than one domain.
`widenedScopeOf` in `generalize.ts` states that `domain` is "the single
dimension allowed to disappear", and `sameRuleShape` requires
`item.scope.domain !== candidate.scope.domain` for a widening to be coherent.
The core therefore already has the correct use policy: a domain-stamped item
serves only its own domain; only a widened item may travel.

The τ² lane disables it. `stampDomain` in `packages/eval/src/tau2-distill.ts`
unconditionally overwrites every candidate's `scope.domain` with
`LEARN_DOMAIN`. Every item in the store then carries the same domain, so
`item.scope.domain !== candidate.scope.domain` is never true, no
`generalizationPlan` can fire, and no widened item is ever produced. To make a
cross-domain arm deliver anything, the driver compensates by setting the
*recall filter's* domain to the store's domain instead of the question's. The
filter is not removed; its input is changed so that it cannot exclude anything.

**Measured consequence, on real corpus bytes and the real kernel.** An offline
census (`scope-census.ts`, read-only, no model call, no mock) built the pinned
32-item retail learn set and issued the driver's exact recall query
(`task: 'tau2.act'`, `scope.domain: 'retail'`) against 50 real airline
`reason_for_call` strings and 82 real held-out retail strings. Only the query
population changes, so the delta is attributable to the use policy.

| measurement | airline (transfer) | retail held-out (control) |
|---|---|---|
| items passing `scopeMatches` | **32 / 32** | **32 / 32** |
| (query, item) pairs | 1,600 | 2,624 |
| zero-coverage pairs, structural proxy | **75.88%** | 20.77% |
| zero-coverage pairs, textual proxy | 7.37% | 0.72% |
| mean best coverage, structural | 0.0617 | 0.1002 |
| queries with any non-zero overlap, structural | 30 / 50 | 82 / 82 |
| pairs surviving `minCoverage = 0` (the default) | **1,600 / 1,600** | 2,624 / 2,624 |
| pairs surviving `minCoverage = 0.2` | 19 | 34 |

`buildPack` defaults `minCoverage` to 0, so with the default configuration
every scope-eligible item is an injection candidate. R45's repair changes the
number of active items from 1 to 32; the pack therefore goes from empty to a
population in which, on the structural reading, three quarters of the
(question, rule) pairs share no content term with the question at all. Raising
`minCoverage` to 0.2 removes 98.8% of the transfer pairs *and* 98.7% of the
within-domain pairs: it is a blunt global gate, not a way to distinguish a
foreign rule from a relevant one.

**The caveat is part of the finding.** Real `statement` text is LLM output and
is not available offline. Two proxies bracket it: structural (gold tool names
plus argument keys, mean 40.34 tokens) and textual (the learned task's
`reason_for_call`, mean 33.75 tokens). Neither is a distilled guideline. Both
agree on the direction — the transfer population has strictly less lexical
reachability than the within-domain control — and disagree on the magnitude, so
this section claims the direction and the `scopeMatches` count, not an accuracy
effect. The sign of `l4-paired` belongs to R45's artefact.

**Why this is a defect, not a design preference.** The project's stated thesis
is that the negative effect has two levers: what is remembered and how it is
used. R44/R45 diagnosed and repaired the admission *input*; this section
identifies a use-side path in which a correct core policy (widening as the only
cross-domain channel) is bypassed by a lane-level override, and in which no
relevance floor is applied at injection. `COMPETITIVE` L.8 records AECG's name
for the resulting failure mode — `scope collapse` — and its measured cost of up
to 16.89pp for removing scope preservation. That is an independent,
quantitative statement that this path deserves its own registered arm.

**What was not done.** No file in `microglia` was changed. Run `42131391874` is
pinned to `26f7c3f0`; creating a diff during a measurement in progress would
make its readback unable to name the treatment it measured (§34.21). The
measurement lives in the artifact scratchpad, and `TECH-DESIGN` §17.89
registers the use-side arms for after the readback with TDD, real tests, no
mocks and ≥ 95% per dimension.

### 34.24 R45 read back: six predictions, a served pack, and the field V1 does not grade

**The run.** `42131391874` completed `failure` on 2026-11-06, pinned to
`26f7c3f0`. The `sota.yml` L4 job ran to completion — both arms scored 50 tasks
at `k=4`, `V1` printed its population and `l4-pair` wrote a full ledger — and
step 13 `Pair the arms` exited 1 on three blocking scientific gates. `ci.yml` on
the same head is green. Reading the job log and the `l4-evidence` artefact
(`20,276,204 bytes`, artifact `13467718128`) settles the distinction: this is a
gate refusing to certify an underpowered measurement, not a build failure. It is
the same distinction §160 drew for R44, now with a treatment attached.

**Defect 21 — the delivery gap, and why it was never a property of memory.**
R41 delivered nothing (no store), R42 served nothing (the retrieval keys were
the model's spelling), R43 fixed the keys and still served nothing (`0 active`),
R44 named the reason (`insufficient-evidence=19`) but could not separate its two
halves. R45's offline reproduction priced the cause: `editDistance` charges a
gold-verified correction by tool arity, `createLlmInterpreter` writes that price
into both `trust` and `evidence.weight`, and `scoreKnowledge` multiplies them
into a quadratic penalty. `tau2EditSemantics` returns full semantic distance for
the gold-verified `correctionEdit` shape only. The live artefact confirms the
repair to four decimals: `store 21 active / 21 servable`, `reasons
confidence-cleared=21`, `candidate 0`, `recall 1480 served / 0 empty`,
`meanPackIds 1.839`, admission `0.9000 / 0.9000 / 0.6165`, `supportOnly 0`.
All six registered predictions held; the seventh (`l4-paired`) was deliberately
left unregistered. Five rounds of the same symptom had one cause, and this is
the first dispatch that reached the model at all.

**Defect 22 — a served pack that the record cannot describe.** `V44` reports `0
of 21 items with no domain, 0 unscoped, 0 widened`, and the scenario is
`learn=retail / test=airline / recall=retail`. So 21 retail-learned rules were
injected into airline questions on 1480 of 1480 requests, with `minCoverage`
defaulting to 0 and `scopeMatches` passing all 21. But the arm record stores
only `servedPackSizes`, `per_task` rewards and `per_trial` rewards: the memory
arm contains no `statement`, `rule`, `packIds`, `content`, `text` or `injected`
field (a token census over the artefact finds zero of each). `V1` grades *how
many* items were served and is silent on *what* they said. R45's `+6.00pp [-6,
+20] p=0.5488, n=50`, with an MDE of 18.59pp and `tasksForFivePp=339`, therefore
cannot distinguish "the effect is smaller than this lane can resolve" from "the
pack was mostly about a different domain". §34.23 measured the second offline
on structural proxies (75.88% of the 1,600 cross-domain pairs have zero lexical
overlap, against 20.77% of the 2,624 within-domain pairs), but explicitly
refused to call that an accuracy effect. This is the field that must be measured
on real distilled statements before any use policy is changed.

**The revert rule was read, not argued with.** `prereg/R45-admission.md`
reverts if a served pack makes `l4-paired` significantly negative or below
−5pp. The reading is `+6.00pp`, `p=0.5488`, above −5pp. It does not fire. The
transfer ledger is `22 repaired / 17 broken of 200 measured`, net `+2.50pp`,
verdict `unmeasured`; `V16` fails at 86 informative trials against a floor of
100. Two `+12.00pp` (R44, empty pack) and `+6.00pp` (R45, served pack) deltas
are both draws from a lane that cannot resolve 5pp; neither is evidence the
memory helps, and neither is evidence it hurts.

**Defect 23 — an instrument that changes no number.** The repair shipped in
R46 is `packages/eval/src/tau2-use-census.ts`: the seven-field `UseCensus` shape
registered in §17.89 verbatim, a derived `coverageProfile`, and a
`zeroCoverageShare` helper, all pure functions over `(query, statement)` pairs
observed at the recall facade. TDD came first — a failing test on the pinned
32-task fixture (sha256 `b5e49bb7…`) with the real `queryCoverage` and
`tokenize`, no mocks and no model call. Two hand-written assertions were caught
by the kernel before implementation: `'cancel my reservation'` against
`'cancel reservation'` is *full* coverage (1), not partial, because `my` is a
stopword; the test was corrected to cover the zero, partial (2/3) and full
branches separately. `armRecordFromDriver` builds the census only when the driver
supplies `useObservations`, so every artefact before R46 reads "not measured"
rather than a fabricated zero. The driver's `host.recall` call, its scope, the
`minCoverage` floor and the returned pack are byte-for-byte the R45
configuration; only observation was added. `tau2ArmRecordOf` carries `use`
forward so the gate layer, which reads the record and never the file, can see it.

**What this round deliberately did not do.** It did not open U1, U2, U3 or R46's
admission-rule arms, change `stampDomain`, `RECALL_DOMAIN` or `minCoverage`,
split a package, or dispatch a second workflow. U3's floor may be computed only
from a census of real distilled statements (§17.88), which needs a dispatch that
carries this instrument; registering a floor from the structural proxy, or after
seeing `l4-paired`, is the failure §34.22 already caught once. The acceptance
bar is unchanged: TDD, real tests, no mocks, ≥ 95% per dimension (this round
99.98 / 100 / 99.68 / 99.98 over 2,934 tests in 140 files), `pnpm check` exit 0,
`ci.yml` green, both repositories pushed as Lambertyan. `poc-coupling.json` was
regenerated with the new module (`137 → 138` scanned, `37,528 → 37,746` lines)
and committed; the six result files whose only diff was `ranAt` / `p50` / `p95`
were restored rather than committed — §34.20's defect, avoided in advance.

### 34.25 A green local check that was not green in CI, and the fixture that fixed it

**Defect 24.** The first R46 push (`4d6b4c19`) turned `ci.yml` run `42148206565`
red at step 8 `Tests with coverage gates`: `tau2-use-census.test.ts` failed with
`ENOENT: no such file or directory, open '/tmp/tau2/retail.json'`. The test read
the two real corpora from the scratchpad path `/tmp/tau2/`, which exists in the
agent sandbox (R44 left it there) but not on a fresh GitHub runner. The local
`pnpm check` had exited 0 — 2,934 tests in 140 files, coverage 99.98 / 100 /
99.68 / 99.98 — because the same machine happened to hold the file. This is the
exact local-pass/CI-fail drift the standing instruction forbids, and the green
local number was not evidence about the committed tree.

**Why the defect was possible.** R45's `tau2-admission.test.ts` reads a
*fingerprinted, repository-local* fixture
(`eval/fixtures/tau2-retail-learn-actions.json`, sha256 pinned). The use-census
test needed a second population — the natural-language `reason_for_call` texts
of airline questions and held-out retail questions — and the first draft reached
for the scratchpad corpora instead of committing a fixture. An artefact a test
needs must live in the repository; otherwise CI reads a different world.

**The fix.** New `eval/fixtures/tau2-use-census-queries.json` (sha256
`54f79dbf…`, 45,187 bytes) carries the 32 learn statements derived from the R45
fixture, the 50 airline questions, and the 82 held-out retail questions, plus
both source corpora's sha256 and byte counts (`76e1fa64…` / 328,166 retail;
`40d692b3…` / 149,096 airline). The test asserts both the learn fixture's and
the query fixture's own sha256, the two corpus fingerprints, all four population
sizes, and that no query is content-free — which is why the paired populations
are exactly 50 x 32 = 1,600 and 82 x 32 = 2,624 with nothing silently skipped.
No test reads `/tmp` after this change. The defect was reproduced deliberately:
with `/tmp/tau2` moved aside, all 96 affected tests pass (`CI_SIM_RC=0`).

**The rule this leaves behind.** A green `pnpm check` is a statement about the
machine it ran on. Before claiming CI green, either read the remote run or
reproduce the runner's filesystem. A fixture a test needs is part of the source
tree, fingerprinted and asserted — the same discipline §34.20 applied to the
coupling snapshot, now applied to test input. Both repositories are pushed again
after the fix, and `ci.yml` is read from its real conclusion, not assumed.

### 34.26 The as-is census is registered before the run that measures it

**The monitor's last line agrees with the record.** The watcher on R45 run
`42131391874` finished at 01:02:49Z with `run: completed failure`. The failing
step is 13, `Pair the arms`; steps 11 and 12 (both arms), 14 (the not-run
annotation) and 15 (the evidence upload) are `success`. Read against
`l4-job.log`, this is the same conclusion §34.24 and §17.90 recorded from the
artefact, with no new deviation:

| gate | final reading | why the step exits 1 |
|---|---|---|
| `V5-resolution` | FAIL, MDE 18.59pp | the lane cannot resolve a 6pp effect at n=50 |
| `V16-transfer-resolvable` | FAIL, 86 informative trials, 22 repairs | fewer than the 100 informative trials the gate requires |
| `l4-paired` | FAIL, `+6.00pp [-6, +20] p=0.5488 n=50` | not significant; no effect is certified |
| `V3`, `V6`, `V7`, `V8`, `V32`, `V15`, `V33`, `V17`, `V44`, `l4-same-split` | PASS | the validity gates R45 also passed |

The step's exit 1 is a gate refusing to certify an underpowered measurement, not
a build failure: `ci.yml` on the same head is green. `V32` reports 0/32
unanswered questions, 11 corrections and 0 distillation failures; `V15` carries
200/200 trials with 86 informative and 114 already repaired by the retry;
`V17` reports 22 repaired against 17 broken, net `+2.50pp`, verdict
`unmeasured`. None of these numbers is re-read as an accuracy claim.

**Defect 24 is closed on the remote.** `ci.yml` run `42149283405` on `c2da0b55`
is `completed success`; the red predecessor `42148206565` on `4d6b4c19` stays in
the record rather than being quietly superseded. The local check after the new
registration exits 0 with 2,934 tests in 140 files and coverage 99.98 / 99.69 /
100 / 99.98 — every dimension above the 95 percent bar — and `bundle:size ok`.
The `FAIL` lines in that log are the standing eval families reporting their
historical scientific negative results, not command failures.

**What this round registers, before any run.** `prereg/R46-use-census.md` is the
P1 dispatch of §17.90, written and validated before the dispatch that measures
it. Twelve decisions are fixed in advance:

1. It is **not an arm**. No pack, rule, admission decision, scope, threshold,
   gate or line of `packages/core` changes; only the reading side is new.
2. Dispatch inputs are R45's verbatim — `l4=true`, `bird=false`, `probe=false`,
   `l4_arms=both`, `l4_train_share=0.5`, `adjudicate=false`, `split=minidev` —
   with only `prereg` renamed, so `SOTA_ARTEFACT` becomes
   `poc-sota-bird-R46-use-census.json` and R45's file is preserved.
3. The registered unit stays the pack; the observed unit is the
   `(question, injected statement)` pair at the `/v1/recall` facade.
4. Only the **memory** arm can carry a `use` block: with `TAU_MEMORY=false` the
   driver returns before the facade exists. A `use` block on the reference arm
   is a wiring defect, not a control measurement.
5. The seven-field `UseCensus` shape is read verbatim; `coverageProfile` is a
   pure function over raw observations and is not a field of the artefact.
6. `zeroCoverageShare` is computed from the two registered counts
   (`zeroCoveragePairs / injectedPairs`), so it can be read from the artefact
   without widening the contract.
7. It includes content-free queries; the derived profile separates them. The
   prediction is about the registered share, and the refutation names what a
   profile read must not silently drop.
8. **No floor is chosen in this round.** U3's floor is computed from the
   committed census after the dispatch, as §34.22 requires, and is registered
   before its own dispatch.
9. `l4-paired`'s sign, magnitude and significance are **not predicted**. The
   round claims no accuracy effect, and a red conclusion on `V5`, `V16` or
   `l4-paired` is the lane's resolution verdict, not a regression.
10. R45's revert rule (significantly negative, or below minus five points with
    a served pack) carries over unchanged; this round adds no softer branch.
11. The gate list is R45's verbatim
    (`V1,V2,V3,V5,V6,V7,V8,V15,V16,V17,V32,V33,V44`), which is exactly the set
    of V-coded gates `l4-pair` emitted on R45. No gate is added or removed
    after seeing a number.
12. Acceptance is unchanged: `pnpm check` exit 0, coverage at least 95 percent
    on every dimension, `ci.yml` green before dispatch, both repositories
    pushed as Lambertyan.

**Semantic diff, classified before the commit.** `pnpm check` regenerated six
result files. `bench/results/study.json` differed only in `p50Ms` / `p95Ms`;
the other five differed only in `ranAt` and timing fields. All six were
restored, not committed. The coupling ledger did not move: a Markdown
registration adds no module, so the `137 -> 138` change of §17.90 remains the
last structural one. The only committed source change is the new prereg file.

| head | repository | what it is |
|---|---|---|
| `26f7c3f0` | microglia | R45 pinned head, `ci.yml` `42130978881` green |
| `4d6b4c19` | microglia | R46 instrument, CI `42148206565` red (defect 24) |
| `c2da0b55` | microglia | fixture fix, CI `42149283405` green |
| `5768471b` | microglia-docs | §34.25, the defect's record |

**Priority table after this registration.**

| priority | item | trigger | acceptance |
|---|---|---|---|
| P0 | R45 readback | met | six predictions and the revert rule read from the artefact — done |
| P0 | `use` instrument and CI drift fix | met | registered shape verbatim, remote CI green — done |
| P1 | `as-is` census dispatch | this commit green | artefact reports a real-statement census; `zeroCoverageShare` read before any floor |
| P1 | U3 coverage-floored arm | census committed | floor computed from the artefact, registered before its dispatch, `V1` blocking |
| P1 | R46 admission-rule ablation | `served > 0` (met) | three arms, one store, `>= 2` contrast registered separately |
| P2 | U1 calibration, U2 after a real reachability test | U3 read | U1 reports `served = 0` as a measurement |
| P3 | transcript V46/V47, S1a/S1b, `sota.ts` split, W8, vitest 4 | ROADMAP order | unchanged acceptance bar |

### 34.27 The census is dispatched, and five use-side sources read without moving the head

**The dispatch, on a verified green head.** The registration commit of §34.26
pushed as `cb329054` on `microglia` master and `3ebfbe0c` on `microglia-docs`
main, both Lambertyan with a +0800 author date. `ci.yml` run `42317463372` on
`cb329054` was read from the remote as `completed success` — every one of its
forty steps green, including the coverage gates — before any dispatch. Only
then was `sota.yml` dispatched on `ref=master` with the registered inputs;
`http=204`, and run `42317807270` was created on `cb329054` at 00:22:17Z. The
prereg file on the remote head was verified byte-for-byte against the local one
(`sha256 ac8fa19f…`, 5,917 bytes), so the run will grade the same registration
this repository committed. A fresh watcher polls the run to completion; no
result is claimed before its readback.

**The head stays still.** §34.21's rule is applied again: R46 is a measurement
in progress, so `microglia` master `cb329054` is not touched by the literature
reading. This waiting round pushes `microglia-docs` only. That is deliberate,
not an omitted push — a diff on the measuring head would make the readback
unable to name which treatment it measured.

**Five sources, all on the use side (`COMPETITIVE` L.11, `TECH-DESIGN` §17.92).**
MemCalib ([arXiv:2609.24259](https://arxiv.org/abs/2609.24259)) is the first
found source to put a number on incorrect *use*: per-atom influence A/B/C,
with the best frontier model over-using on 53.33% of atoms and under-using on
35.82% over 1,500 test examples; its published implementation
(`Quark-Medical/memcalib`) grades a counterfactual "what would change if this
atom were removed". Controlled Memory Interference
([arXiv:2608.07622](https://arxiv.org/abs/2608.07622)) finds lexical and dense
retrieval interfere through different paths. CAMEL
([arXiv:2605.09330](https://arxiv.org/abs/2605.09330)) isolates three spurious
patterns from a causal graph and two memory-specific amplifiers. The Memory
Curse study holds prompt length fixed and shows the *content* is the trigger.
The PFM pathology ([arXiv:2610.10265](https://arxiv.org/abs/2610.10265)) finds
key assignment, not retrieval, is the bottleneck. None is a tau-squared-bench
entry, so the ranking does not move.

**Defect check, and what is not claimed.** These readings open no arm, add no
gate, change no threshold and edit no preregistration. They do sharpen a later
registration: U3's floor is a *content* filter, not a size filter, because
`V1` grades size and the sources agree that content is what harms. No paper's
number is imported as a microglia measurement, no LLM Judge or RL trainer is
added to a lane that must stay model-free at the census, and no accuracy claim
is made from a dispatch that has not finished. The six documents remain
append-only, English, free of CJK, credentials and forbidden literals; the
result-file diff of `pnpm check` was classified as timing-only and restored
(§34.26).

### 34.28 R46 read back: five predictions hold, one is falsified, and the census could not grade its own floor

**The run.** `sota.yml` run `42317807270` on head `cb329054` completed at
01:49Z. Both arms (steps 11 and 12) and the evidence upload (step 15) are
`success`; step 13, `Pair the arms`, exits 1. Read against `l4-job.log` and
artefact `13554957903` (`l4-evidence`, 20,276,206 bytes, 92 entries), this is
the same class of conclusion as R45: `V5-resolution` (MDE 13.73pp),
`V16-transfer-resolvable` (81 informative trials, 17 repairs, below the 100
required) and `l4-paired` (0.00pp, `[-10, +10]`, `p=1.0000`, `n=50`) refuse to
certify an underpowered measurement. Every validity gate R45 passed passes
again — `V1`, `V2`, `V3`, `V6`, `V7`, `V8`, `V15`, `V17`, `V32`, `V33`, `V44`.
`ci.yml` on the same head is green. A red pair step is a resolution verdict,
not a build failure.

**Six predictions, read from the artefact.** `prereg/R46-use-census.md`
registered six falsifiable predictions before dispatch. The table is the
reading, not an interpretation:

| # | prediction | reading | verdict |
|---|---|---|---|
| 1 | `use` on memory, absent on reference | memory `tau2.use` present; reference `tau2` absent entirely | **hold** |
| 2 | `recallServed > 0`, requests/meanPackIds within 10% of R45 | `1512 / 1512`, requests `1512` (+2.2%), mean `1.9947` (+8.5% of 1.839) | **hold** |
| 3 | `injectedPairs > 1000`, equals sum of served pack sizes | `3016 = 1.9947089947089947 x 1512`, an exact identity | **hold** |
| 4 | `zeroCoveragePairs > 0` **and `zeroCoverageShare > 0.5`** | `1175 > 0` but `1175 / 3016 = 0.3896` | **FALSIFIED** |
| 5 | `widenedItems = 0` | `0`; `V44` reports 0 of 14 items with no domain, 0 widened | **hold** |
| 6 | all R45 validity gates pass, `V5`/`V16` unresolved, `l4-paired` sign not predicted | all pass; both unresolved; `0.00pp` claimed as no effect | **hold** |

Prediction 4 is falsified on its *magnitude*, not its direction: the real
distilled statements have a zero-coverage share of 0.3896, not the > 0.5 that
the offline structural proxy (0.7588 cross-domain, 0.2077 within-domain,
§34.23) led us to predict. This is the second independent measurement this
project has of the same fact: **a proxy is not the distilled statement, and a
threshold copied from a proxy is a defect** (§34.22). It is also the first hard
number behind the standing hypothesis that *how* memory is used, not only *what*
is remembered, drives the negative effect: on the real corpus 39 percent of
injected (question, statement) pairs share no content term with the question,
so over a third of what the model was shown was lexically unrelated to what it
was asked. The falsification is recorded as a prediction that did not hold, not
as a refutation: the reading is valid.

**Refutation and revert branches, all clear.** None of the six refutations
fires: the `use` block exists with 3016 injected pairs; `1175 <= 3016` and the
share is in `[0, 1]`; no validity gate regresses; `l4-paired` is neither
significantly negative nor below minus five points (`0.00pp`, `p=1.0000`), so
R45's revert rule does not fire; the evidence artefact is present; and no floor
was chosen from any accuracy number in this run. The observation round adds no
accuracy claim that could soften the revert rule.

**Same configuration, different store.** R45 and R46 were dispatched with
verbatim-identical inputs; only `prereg` was renamed. Yet R45 distilled 21
active items from 11 corrections with 1480 served requests and measured
`+6.00pp [-6, +20] p=0.5488`; R46 distilled 14 from 7 corrections with 1512
served and measured `0.00pp [-10, +10] p=1.0000`. Both memory and reference
arms scored `pass^4 0.46` this round. The distiller is an LLM call, so the
learning half is not deterministic: the store population drifts between two
runs of the same split, and so does the paired delta. Two independent runs of
one configuration producing +6pp and 0pp, both non-significant and both with
an MDE above 13pp, are a direct measurement of the noise floor. No accuracy
claim is drawn from either.

**Defect 25: the committed census cannot grade its own floor.** TECH-DESIGN
§17.89 registers, as the P0 prerequisite for U3, a "committed histogram" from
which U3's `minCoverage` floor is computed before its own dispatch. R46
committed no histogram. `armRecordFromDriver` reduced the driver's raw
`useObservations` to the seven-field `UseCensus` and discarded the pairs;
`coverageProfile` and `zeroCoverageShare` had no production caller at all. The
artefact carries exactly one coverage number, `zeroCoveragePairs`. A scalar
cannot determine what a nonzero `minCoverage` floor would do: a real-kernel
offline probe on the fingerprinted 32-task fixture measures two populations
with the identical registered scalar (`zeroShare 0.7588`) whose retained pair
fractions at `minCoverage = 0.05` differ by 12.44pp (17.63% vs 5.19%), and
shows the post-floor served population lies in a 33.24pp-wide interval
(`[165, 657]` of 1480). The non-zero coverage mass is concentrated in the left
tail (p10 0.04, p50 0.069, p90 0.143), so a floor chosen from intuition would
empty an unpredictable number of packs and could fail `V1` by construction.
This is the use-side twin of §34.22: a threshold about to be applied to a
population nobody counted.

**The repair, TDD and additive.** `coverageHistogram` reduces the same facade
observations to a committed `CoverageHistogram`: a fixed, finite, ascending
`COVERAGE_FLOORS` grid (including 0), the retention curve at each grid point
(`retainedPairs`, `retainedPacks`, `emptiedPacks`), non-zero coverage quantiles,
and separately-reported content-free queries. It is computed in
`armRecordFromDriver` and projected through `tau2ArmRecordOf`; it calls
`coverageProfile`, so the profile and histogram share one population by
construction. The seven-field `UseCensus` is unchanged verbatim; the field is
optional, so R45/R46 and every older artefact read as "not measured", never a
zero. `packages/core`, `sota.yml`, `tau2-driver.ts`, `l4-pair.ts` and every gate
definition are untouched — no gate reads `coverage`. The failing tests were
written first (7 red, then green), including a real-kernel regression proving
two populations with identical seven registered fields produce different
histograms. `pnpm check` exits 0: 2,944 tests in 140 files, coverage
99.98 / 99.69 / 100 / 99.98 (statements / branches / functions / lines).
The v8 branch figure reads 99.68 on one repeated run of this identical tree and
99.69 on two others — a plus-or-minus 0.01 non-determinism, recorded rather
than rounded into a claim, and every dimension stays far above the 95%
threshold. The coupling ledger moved structurally
(37,746 -> 37,883 production lines, 138 modules unchanged) and is committed;
six result files differing only in `ranAt` / `p50` / `p95` were restored.

**What is still closed.** U3's floor is **not** chosen here. The histogram is
now committed by the instrument, but the reading of a histogram from a real
dispatch belongs to the next as-is observation; a floor is registered before
its own dispatch (§17.88), never from `l4-paired`. U1, U2, U3 and the R46
admission-rule arms stay closed. No rank moves: IBM `gpt-5.5` airline 82.0 is
still the SOTA, microglia fifth of six named entries. Both repositories are
pushed as Lambertyan.

### 34.29 R47 is registered: read the committed histogram before choosing any floor

**Defect 25's repair is shipped and green.** `microglia` master carries it as
`d5497a8e` (parent `cb329054`) and `microglia-docs` main as `fedc3c4b` (parent
`06b981dc`), both authored Lambertyan at +0800 with remote trees verified
byte-for-byte against the local ones. `ci.yml` run `42334137993` on `d5497a8e`
completed `success` with all 40 steps green, including `Tests with coverage
gates`, `Repository audit`, `Protocol` and `Gate summary`. `pnpm check` exits 0
with 2,944 tests in 140 files and coverage 99.98 / 99.69 / 100 / 99.98; section
34.28 records that one repeated run of the identical tree reads 99.68 on the
v8 branch dimension, a plus-or-minus 0.01 non-determinism rather than a claim.
Six result files differing only in `ranAt` / `p50` / `p95` were restored, and
the coupling ledger's four structural changes are committed.

**The next P1 step is a registered observation, not an arm.**
`prereg/R47-coverage-histogram.md` is added with R45's and R46's verbatim
dispatch inputs and only `prereg` renamed, so the artefact becomes
`poc-sota-bird-R47-coverage-histogram.json` and both earlier files survive. It
reads the memory arm's `tau2.coverage` block beside the unchanged seven-field
`tau2.use`. Eight predictions are registered, all falsifiable structural
assertions rather than guesses about an unknown population:

| # | prediction | why it can be wrong |
|---|---|---|
| 1 | `coverage` on memory, absent on reference | the instrument may not cross the process boundary |
| 2 | ten `floors` rows, first `minCoverage` 0, strictly increasing | the grid may not be the fixed one in source |
| 3 | `measuredPairs + unmeasurablePairs = use.injectedPairs` | the two readings may count different pairs |
| 4 | at every rung `retainedPacks + emptiedPacks + unmeasurablePacks = use.recallServed` | the pack buckets may not reconcile |
| 5 | at rung 0 `retainedPairs = measuredPairs` and `emptiedPacks = 0` | the as-is rung may not be the identity |
| 6 | `retainedPairs` never rises, `emptiedPacks` never falls, and some positive rung reports `emptiedPacks > 0` | the grid may have no pack-level resolving power |
| 7 | `nonzeroQuantiles` non-decreasing, all in 0 to 1, `min > 0` | the sorted population may be built incorrectly |
| 8 | every R45/R46 validity gate passes again, `use` shape unchanged, `widenedItems = 0` | the dispatch may have changed a behaviour |

Prediction 6's last clause is the one that can fail for a substantive reason:
if no served pack is emptied by any positive rung, the fixed grid cannot grade
`V1` on this corpus and U3 cannot be registered from it. R46's falsified
prediction 4 is the reason no numeric share is predicted here — a proxy is not
the distilled statement, and a pre-registered magnitude copied from an offline
probe is a defect. The sign, magnitude and significance of `l4-paired` are
**not predicted**, and no floor is chosen.

**Six refutations.** A missing or reference-side `coverage` block; any of the
three reconciliation identities failing; a violated grid shape, monotonicity
or quantile ordering; `l4-paired` significantly negative or below minus five
points with a served pack (R45's revert rule, unchanged), or any validity gate
regressing; an absent evidence artefact; and a floor chosen from any accuracy
number in this run, from the offline proxy, or from a post-run rewrite of R46's
six predictions or this registration. U1, U2, U3 and R46's admission-rule arms
stay closed until the histogram is read from a real dispatch.

**Verification before any dispatch.** `pnpm eval:prereg` reports 35 of 35
valid; `pnpm eval:protocol` reports all claims hold; `pnpm check` exits 0 with
2,944 tests in 140 files and coverage 99.98 / 99.69 / 100 / 99.98; `audit: ok`
and `bundle:size ok`. The times-only result files were restored and the
coupling ledger is unchanged, because a pre-registration is a document and
adds no production line. No gate reads `coverage`; `packages/core`,
`sota.yml`, the driver and the pairing logic are untouched.

**The eight predictions were checked against the real kernel before being
registered.** A read-only offline probe on the fingerprinted fixture (50
airline questions times 32 learn statements, and a second population with a
content-free query and an empty pack) confirms that all eight structural
assertions are self-consistent with `coverageHistogram`: 1,600 measured pairs
reconcile to `injectedPairs`, the pack buckets reconcile to `recallServed` at
every rung (`unmeasurablePacks` accounts for the content-free pack), rung 0 is
the identity, retention is monotone, quantiles are ordered, and the seven
`use` fields are unchanged. The falsifiable clause of prediction 6 holds on
this proxy — rung 0.01 empties 20 of 50 packs — so the grid has pack-level
resolving power on a population shaped like the corpus. This is a consistency
check, not a prediction of the real run's numbers: the offline statements are
structural proxies, and section 34.28 records why a proxy is not the distilled
statement. Ranking is unchanged: IBM `gpt-5.5` airline 82.0 remains the SOTA,
microglia fifth of six named entries.

### 34.30 External evidence that the harm is on the use side, and a structure-only floor probe

**Why this section exists.** The project's guiding hypothesis is that what is
remembered and how it is used, not how much is retrieved, produces the negative
effect. This round tested that hypothesis against first-party competitor source
and six independent benchmark papers, then quantified it on the project's own
fingerprinted corpus with the real kernel. R47 (run `42337250684`) is measuring
on `bc0a39eb`; by section 34.21 the `microglia` head stays still. This section
changes no source, no gate, no threshold, no pre-registration and no dispatch.

**Finding 1 — the current SOTA reports its own non-monotonic memory dose.**
IBM's ALTK-Evolve held-out airline ablation, agent `gpt-4.1`, 20 test tasks,
four trials per task: baseline Mean Accuracy 57.5 percent and Pass^4 35.0
percent; the compact `sup3` core of 14 high-support guidelines gives 60.0 and
**45.0**; the full `lossless` set of 101 guidelines gives 65.0 and **40.0**.
More guidelines therefore raise Mean Accuracy by 5.0 points while lowering the
reliability metric by 5.0 points. IBM states that delivery is a dial, not a
constant, and that support count is a knob to tune per domain. The retail domain
disagrees: `sup3` (31 rules) gives 78.8 / 60.0 and `lossless` (292 rules) gives
82.5 / 67.5, so more is better on both axes there. This is a domain-dependent
dose response measured by the very system holding the SOTA, not a claim inferred
from microglia's own numbers. Rule counts, costs and the leaderboard split
caveat are recorded in `COMPETITIVE.md` section L.14.

**Finding 2 — six independent benchmarks localise the failure after retrieval.**

| Source | Measurement | Reported magnitude |
|---|---|---|
| MemSyco-Bench, arXiv 2607 (Xiang et al., 1 Jul 2026) | share of errors occurring after relevant memory was already retrieved | 61 to 62 percent across Mem0, A-Mem, LightMem; A-Mem retrieved-but-wrong reaches 64 / 74 / 75 percent in OFJ / MEC / VMS |
| OP-Bench, arXiv 2601 (Hu et al.) | over-personalisation score of memory-augmented agents against memory-free BASE | 26.2 to 61.1 percent relative drop across 36 configurations; BASE is strongest |
| MemCalib, arXiv 2609.24259 (Cao et al.) | calibrated influence of each memory atom (Ignore / Bound / Control) | best frontier model GPT-5.6-SOL scores SCS 46.25 and Exact 28.40 of 100; every model except Qwen3-8B over-uses more than it under-uses |
| BenchPreS (Yoon et al.) | rate of misapplying stored preferences | up to 86.48 percent; a selectivity instruction cuts it to 12.80 on Gemini 3 Pro at a cost of 0.78 to 3.82 points of correct application |
| RPEval (Feng et al., Renmin University and Huawei) | intent-matching accuracy on Ignore | humans 0.86, models 0.06 to 0.38; Qwen2.5-7B 0.06, GPT-5 0.12, DeepSeek-V3 0.38 |
| LongMemEval | accuracy under sustained interaction | about 30 percent drop for commercial assistants and long-context models |

Three mechanisms recur. First, **over-use dominates**: MemCalib reports that
every tested model except Qwen3-8B over-uses more than it under-uses, and RPEval
describes an inverse scaling effect on the ability to Ignore. Second, **prompt
fixes trade one error for another**: MemSyco-Bench's memory-caution instruction
helps the evidence-conflict task by 31.6 accuracy points but costs 13.0 to 21.0
on personalisation; asking "Are you sure?" costs 9.9 to 27.7; BenchPreS's
selectivity instruction cuts misapplication at the price of correct application.
Third, **compression is a source of distortion**: MIST reports memory-context
variants at 2.15 and 1.55 times chat-history sycophancy on MIST-Science and
MIST-Moral against 1.16 and 1.31 for prompt variants alone, and attributes it
to decontextualising compression rather than compression as such. Mem0's summary
of the five-paper comparison explicitly warns that the papers use different
taxonomies, judges and data, so the magnitudes are not comparable across rows;
that warning is preserved here. The data are synthetic, and LLM judges agree
with humans 96.7 percent on naturally sampled MemCalib cases but only 74.0
percent (kappa 0.610) on a stress sample.

**Finding 3 — the competitor code that can be borrowed, read first-hand.**
`Quark-Medical/memcalib` is a fork of the `verl` RL framework whose project-
specific code sits in `recipe/memcalib_credit/`. `metrics.py` defines the
sample-level calibration score at rho = 0.5 as `scs = 0.5 ** (over_budget +
under_budget)` with `over_budget = sum(max(d, 0))` and `under_budget =
sum(max(-d, 0))` over per-atom influence distances `d`, plus `sopb = 1 -
0.5 ** over_budget`, `supb = 1 - 0.5 ** under_budget` and `exact = (budget ==
0)`. `credit.py` implements eight merged channels (`A-`, `B+`, `B-`, `C+`,
`C-`, `A0+`, `B0-`, `C0-`) mapping the cross of target and actual influence
levels, an ordered bidirectional localisation mode with per-channel signs and
default etas, and group normalisation. `segments.py` splits a response into
ordered, exactly covering token-index groups for atom-level credit. On
Qwen3-8B, MemCalib-RL raises SCS from 31.17 to 79.54 and is the only tested
method that reduces both over-use and under-use on all three backbones. The
catch is that it needs training access and token-level likelihoods, so it
cannot be applied through an inference-only API; the project borrows the score
structure, not the training loop. RSCB-MC (arXiv 2604.27283) is closer to this
project's shape: a risk-sensitive contextual bandit treats abstention as a
first-class action under `S(a, z) = R(a, z) - mu * P_fp(a, z) - alpha * c(a,
z)` with `gamma > alpha > beta`, i.e. a false-positive injection is penalised
more than a correct reuse is rewarded. Static retrieval reaches a 75 percent
false-positive rate on hard negatives; RSCB-MC reports 0.0 percent; ablating
abstention raises false positives by 17.5 percent and collapses cumulative
reward. Its authors call memory-use safety, not retrieval accuracy, the primary
challenge, and concede that the controller over-abstains and that the evidence
is offline smoke-scale with proxy labels. FinAcumen (arXiv 2606.17642) applies
the same idea with a calibrated relevance threshold and an explicit fallback to
the base policy when relevance is insufficient.

**Finding 4 — quantified on this project's own corpus, with the real kernel.**
An offline, read-only probe (`use-side-cost-probe.ts`) combined the two
mechanisms on `eval/fixtures/tau2-use-census-queries.json` using
`queryCoverage` and `tokenize` from `packages/core/src/kernel/similarity.ts`
and `coverageHistogram` from `packages/eval/src/tau2-use-census.ts`. No model
call, no mock and no source change. Four readings matter.

1. The offline proxy injects all 32 distilled statements into each of 50
   airline queries and reads `zeroShare = 0.7588` (1214 of 1600 pairs), while
   R46's real delivery read 0.3896 (1175 of 3016). The proxy overstates the
   real zero share by **36.92 points** because the real facade delivers a mean
   of 1.995 scoped items per request. This is a direct, measured explanation
   of why R46's fourth prediction was falsified and why R47's refutation
   forbids choosing a floor from this proxy.
2. Over the ten `COVERAGE_FLOORS` rungs, the pure asymmetric cost
   `alpha * relevant - gamma * falsePos - beta * abstained` is maximised at the
   same **plateau `[0.01, 0.02, 0.03]`** under all three cost orderings
   (false-positive-averse `gamma=3`, symmetric `gamma=1`, and abstention-averse
   `gamma=0.5, beta=3`). The plateau is real, not an artefact: the smallest
   positive coverage in the population is 0.0345, so those three rungs retain
   identical pairs. Structure therefore yields a tie set, not a unique floor,
   and U3 will need a registered tie-break rule.
3. All 9 positive rungs empty at least one pack (`GRID_RESOLVING_RUNGS=9/9`),
   and a single scalar such as `zeroCoveragePairs` cannot recover a ten-rung
   curve (`SCALAR_SUFFICIENT=false`). This is defect 25 restated as a measured
   quantity.
4. R46's `l4-paired = 0.00pp [-10, +10] p=1.0000 n=50` with MDE 13.73pp and
   `tasksForFivePp 185` cannot resolve any candidate floor; a floor chosen from
   accuracy is a choice from noise. The retention curve is deterministic over
   the committed population and robust to the cost ordering.

**What is and is not concluded.** The methodology is valid as a
structure-only, accuracy-free decision procedure with a cost-robust plateau;
this section does **not** select a floor. R47's refutation forbids a floor from
an accuracy number or from the offline structural proxy, and section 34.22
requires the floor to be computed from the committed curve and registered
before its own dispatch. The external literature is corroboration, not evidence
about this benchmark: MemCalib, OP-Bench and MemSyco-Bench are not tau-squared-
bench entries, Meta's "Remember When It Matters" reports pass@1 without error
bars, and IBM's leaderboard figures use the full base split that includes the
training tasks from which the guidelines were learned. None moves a leaderboard
row. Ranking is unchanged: IBM `gpt-5.5` airline 82.0 remains the SOTA,
microglia fifth of six named entries.

### 34.31 R47 read back: a cost-robustness claim falsified, and a floor that is now wired

**The readback.** Run `42337250684` on `bc0a39eb` completed as `completed
failure` while step 15 `Upload evidence` succeeded with artefact
`13562407896` (20,276,573 bytes, 92 entries). The failure is the `Pair the
arms` step refusing to certify an underpowered measurement: `V1-pack-not-empty`
passed at 1.47 rules per question across 1491 of 1491 requests,
`V5-resolution` failed at MDE 17.72pp, `V16-transfer-resolvable` failed at 92
informative trials with 22 repairs, and `l4-paired` failed at
`12.00pp [0.00, 24.00] p=0.1094 n=50` with 2 lost and 8 gained. `ci.yml`
`42336894395` stayed green on 44 steps. A red scientific gate on the sota
workflow is not a build failure, and recording it as one would be defect 26
in its own right.

| R47 prediction | reading |
|---|---|
| `coverage` on memory, absent on reference | hold |
| ten-rung grid, first rung zero, strictly increasing | hold |
| `measuredPairs + unmeasurablePairs = injectedPairs` | `2180 + 8 = 2188` hold |
| `retainedPacks + emptiedPacks + unmeasurablePacks = recallServed` at every rung | hold, zero rung `1483 + 0 + 8 = 1491` |
| zero rung retains `measuredPairs` and empties nothing | hold |
| monotone retention and at least one positive rung empties a pack | hold, 9 of 9 positive rungs |
| ordered quantiles in 0 to 1 | hold |
| earlier validity gates unchanged, `widenedItems = 0` | hold |

All six refutations stayed clear and the revert rule did not fire, so
`U3_ELIGIBLE = true` and the head-still rule of section 34.21 lifted on the
reading. The committed `use` census read `recallRequests 1491`,
`recallServed 1491`, `meanPackIds 1.46747`, `injectedPairs 2188`,
`zeroCoveragePairs 750`, so `zeroCoverageShare = 0.3428`; the non-zero
coverage quantiles ran `min 0.01695`, `p10 0.02273`, `p25 0.02778`,
`p50 0.04545`, `p75 0.07692`, `p90 0.16667`, `max 0.33333`.

**The defect this readback found is in our own design prose.** Section 34.30
concluded that the retention curve is "deterministic over the committed
population and robust to the cost ordering", and section 17.95 of
`TECH-DESIGN.md` called the rule "robust to all three cost orderings". Both
statements were measured on the offline proxy, where the smallest positive
coverage is 0.0345 and `0.01`, `0.02`, `0.03` tie. On the real committed curve
they are false. With `net(f) = alpha*relevant - gamma*falsePos -
beta*abstained`, the false-positive-averse (`1, 3, 0.5`) and symmetric
(`1, 1, 0.5`) weightings both select `0.01` at `net = 1231.0`, while the
abstention-averse (`1, 0.5, 3`) weighting selects `0`, the as-is
configuration, at `net = 1067.0`. The proxy's plateau was an artefact of the
proxy. This is defect 26: a proxy property promoted to a design invariant
without a first-party measurement. The fix is structural rather than a
footnote — `CostWeights` has no default, `U3_COST_WEIGHTS` is registered in
source before the dispatch, `prereg-floor.ts` recomputes the declared floor
from the committed artefact and refuses a mismatch, and one test asserts the
disagreement on the real fixture.

**The second defect would have been a silent no-op arm.** A computed floor
with no path to the facade would have made R48 an exact copy of R47 while
claiming an ablation. The five-point wiring in `TECH-DESIGN` section 17.96 was
written TDD-first: `u3-decision.test.ts` (21 tests),
`tau2-recall-floor.test.ts` (10 tests) and five new `prereg.test.ts` cases,
all on the fingerprinted real artefact with no mock. `resolveRecallFloor`
refuses a value that is not a registered grid rung instead of clamping it,
which closes the post-hoc tuning channel. `pnpm check` exited 0 at 2980 tests
across 142 files with 99.98 percent statements, 99.67 percent branches, 100
percent functions and 99.98 percent lines; `pnpm eval:prereg` reads 36 of 36
valid; `audit: ok`; `bundle:size ok`. The optional `recallFloor` header keeps
all 35 earlier registrations valid.

**Registered cost, not hidden.** `prereg/R48-u3-coverage-floor.md` declares
`recallFloor: 0.01`, the weights `alpha=1, gamma=3, beta=0.5` with
`gamma > alpha > beta`, and the least-aggressive tie-break. R47's `0.01` rung
empties 414 of 1491 served packs (27.77 percent) and retains 1438 of 2180
measurable pairs. The registration predicts both a lower `recallServed` and a
passing `V1`, because `V1` grades `meanPackIds > 0` and not per-pack
non-emptiness; treating the two as contradictory would repeat the R45 defect.
It does not predict the sign, magnitude or significance of `l4-paired`, and
forbids any accuracy number from selecting or revising the floor. Ranking is
unchanged: IBM `gpt-5.5` airline 82.0 remains the SOTA, microglia fifth of
six named entries.

### 34.32 The dispatch, and four gates whose thresholds are not ours

`R48-u3-coverage-floor` was dispatched as run `42350304597` on `33038232`
after `ci.yml` `42349873647` went green on 44 steps. Step 11, `Read the
registered recall floor`, completed successfully: the registration-to-facade
path is exercised on a real runner, and `TAU_MIN_COVERAGE` is set on the memory
arm only. The head-still rule of section 34.21 applies again from dispatch, so
no source, gate, threshold or registration is touched while the two arms
measure.

While they measure, four use-side gates were read and recorded in
`COMPETITIVE.md` section L.15: Self-RAG's trained reflection tokens, CRAG's
three-way retrieval evaluator with confidence bands, TARG's training-free
prefix-logit gate (70 to 90 percent fewer retrievals at matched EM/F1), and
Know Before You Fetch's calibrated retrieval budget with abstention. The last
is the methodological near-relative: it selects thresholds on validation and
evaluates test once, and it reports that gating costs about 27 percent latency
on Qwen3-8B while saving about 8 percent on Qwen3-32B. That backbone
dependence is a second, independent reason not to import a published numeric
threshold into `COVERAGE_FLOORS`; the first is R47's refutation, which forbids
a floor from accuracy or from an offline proxy. CRAG's reported
`context_precision +0.431` is a third-party reproduction, not an original
paper result, and is labelled as such. An alternative SOTA2 Research airline
table reporting Pass@4 78 for PG-CHECKLIST uses a different pool and pass
criterion; even at face value it is below IBM's 82.0 and is not merged into
the ranking. None of these sources is a tau-squared-bench Pass^4 entry, and a
source study moves no leaderboard row.

### 34.33 The first R48 run measured nothing, and the retry is lawful

**Forensic chain.** Run `42350304597` (created 07:12:39Z, completed failure
07:36:34Z, job `128336818209`, head `33038232`) produced this step sequence:

| step | conclusion | evidence |
|---|---|---|
| 11 `Read the registered recall floor` | success | `TAU_MIN_COVERAGE: 0.01` at log line 627 |
| 12 `L4 arm -- memory` | failure | retail learn, 114 tasks, `tau2 phase failed` 07:30:45Z |
| 13 `L4 arm -- reference` | failure | airline eval, 50 tasks, same provider error |
| 14 `Pair the arms` | failure | `missing artefact: arms/reference/poc-l4.json`, cascade |
| 15 `Say so when nothing was measured` | success | `L4 wrote no artefact`, the designed degradation |
| 16 `Upload evidence` | success | `l4-evidence`, 20,269,801 bytes, 90 files |

The provider error is `litellm.InternalServerError: DeepseekException` with
`500 Internal Server Error` for `https://api.deepseek.com/beta/chat/completions`
(learn request `7d06439a-ae83-451b-9591-436ff37e9da8`, eval request
`f41447e4-d372-4992-999a-97139dee5590`), reported against many task/trial
pairs. `TAU_RETRIES: 4`, `TAU_CONCURRENCY: 2`, `TAU_TRIALS: 4`,
`TAU_MODEL: deepseek/deepseek-chat` were all set as registered.

**The artefact is not a reading.** Unzipping `13565972549` yields zero `arms/`
entries. Root `poc-l4.json` is the committed 2026-10-22 placeholder with
`status_not_run: 1`, `n: 0`, `calls: 0` and the title `not run: no
environment`. Root `poc-l4-pair.json` is the 2026-11-01 historical pair. All
90 files are pre-existing history, ablations and baselines from
`eval/results`; step 16 merely packaged them. A successful upload of a
directory snapshot is not evidence that the lane scored a task.

**Verdict and its three distinctions.** This is an **infrastructure failure /
no measurement**. It is not a build failure (`ci.yml 42349873647` is green on
all 44 steps of the same head). It is not a scientific-gate red, which R47
exhibited with a complete artefact that the lane refused to certify
(`V5` MDE 17.72pp, `l4-paired 12.00pp p=0.1094`); here there is no artefact
to grade. And it is not a falsification of U3: with no census and no paired
tasks, all eight predictions are NOT GRADED, all seven refutations are NOT
TRIGGERED, the revert rule is NOT FIRED, and R48's sixth refutation explicitly
commands "say so, report no delta" while U1, U2 and R46's admission-rule arms
stay closed. Recording a zero, an as-is delta or a fabricated histogram here
would be the exact defect section 34.21 and R47's refutations were written to
prevent.

**Why the retry is not p-hacking.** Run `42353229972` repeats the same head,
prereg, nine inputs, weights, tie-break and floor. A rerun would be biased if
a result had been seen and disliked. Here (1) the fault is a transport-layer
500 from one provider, exogenous to `minCoverage`; (2) it struck the learn
phase before any task outcome existed; (3) no accuracy, delta, p-value,
`use` census or `coverage` histogram from this run was observed before the
retry; (4) no registered file was edited. The lane therefore has no
information with which to select a favourable rerun. Step 11 succeeded again
and step 12 is measuring. No second workflow was dispatched while a run was
still active; the first had reached `completed` before the retry.

**Defect 27: a single provider can void an entire measurement, and the guard
is aimed at the wrong status code.** `eval/drivers/tau2/run_split.py`
forwards `TAU_RETRIES` to litellm's `num_retries` with a comment that says
"litellm raises on a 429 rather than retrying, and one raised call aborts the
whole `run_tasks` -- 68 tasks and 272 episodes lost to a rate limit one minute
from the end". A persistent **500** is not that case, yet it still aborts the
whole phase: the retail learn phase ran 07:13:30Z to 07:30:45Z, 17 minutes,
and discarded every episode. The L4 job also has no fail-fast provider health
check before committing a roughly 20-minute runner, so a provider that is
already down is discovered only after the expensive phase fails. This is a
real availability defect in the measurement apparatus, recorded here as
defect 27.

The fix belongs to a separate P1 on a later head, never inside this measuring
window, because changing `sota.yml` while `42353229972` runs would
desynchronise the run from the head its preregistration names. Its acceptance
bar is strict: a single lightweight completion probe before the L4 job that
fails fast with an explicit no-measurement marker when the provider is down;
**no** reduction of trials, **no** skipping the learn phase, **no** partial
artefact built from the tasks that happened to succeed (which would introduce
a provider-chosen selection bias), and **no** step that masks a non-zero exit
or swallows a failure with a shell fallback. TDD, real tests, no mocks, at
least 95 percent on every coverage dimension, `pnpm check` exit 0 and
`ci.yml` green before any later dispatch.

**Source-study audit note.** Five sources were read while the arms measure and
are quantified in `COMPETITIVE.md` section L.16: the Memory Funnel's
three-source crystallisation, Human-Inspired Memory's deduplicate-not-summarize
ablation and leakage-free synthetic calibration, dual-trace encoding's
evidence gate and explicit "I don't know" state, the driving-agent audit's
15-token caution equivalence, and a re-check of IBM's PR #542/#551 filings.
Their numeric thresholds are design choices of their own corpora and models;
none is a tau-squared-bench Pass^4 entry and none may be imported into
`COVERAGE_FLOORS` or R46's admission contrast. The SOTA2 Research table's
PG-CHECKLIST 78 stays recorded with its different pool and pass criterion.
Ranking is unchanged: IBM `gpt-5.5` airline 82.0 remains the SOTA, microglia
fifth of six named entries.

### 34.34 Two first-party source readings, and a verifier with three terminal states

While run `42353229972` measures, two first-party sources were read to fix the
semantics of the next two arms, and an offline readback verifier was built and
self-tested. None changes the `microglia` head, and none moves a leaderboard
row.

**MemCalib, from the paper and its own repository.** The primary source is
arxiv 2609.24259 with the `Quark-Medical/MemCalib` implementation. Each memory
atom has an ideal use level in `{Ignore, Bound, Control}` mapped to rank
`{0, 1, 2}`, and a judge reads its actual level. Over-use and under-use for one
response are `O = sum(max(rank(actual) - rank(ideal), 0))` and
`U = sum(max(rank(ideal) - rank(actual), 0))`. With `rho = 0.5` the six metrics
are:

```
sMOS  = mean(1 - rho^O_j)          sMUS  = mean(1 - rho^U_j)
AOR   = share of responses with O_j > 0
AUR   = share of responses with U_j > 0
SCS   = mean(rho^(O_j + U_j))      Exact = mean(1[O_j + U_j == 0])
```

All six lie in `[0, 1]` and are rescaled to `[0, 100]` for reporting. The
benchmark has 15,000 examples from eight public QA datasets across health,
general assistance and coding, split 13,500 train / 1,500 held-out test; the
judge is DeepSeek-V4-Pro over three independent seeds in non-thinking mode
with temperature and top-p at 1. A human annotator agreed with the judge on
**96.7 percent** of 150 sampled judgments (95 percent Wilson CI 92.4 to 98.6).

Four results bear directly on U3's registered design. (1) Every evaluated
model except Qwen3-8B over-uses memory more severely and more frequently than
it under-uses, which independently supports `gamma > alpha` (a false-positive
injection costs more than a correct reuse earns). (2) Qwen3-8B shows the
reverse skew and also beats the larger Qwen3.5-35B-A3B on both SCS and Exact,
so the direction of the skew is **model-dependent**: this is a second,
independent reason the cost weights have no default and are registered before
dispatch rather than tuned afterwards. (3) The paper states that strength in
one direction cannot compensate for substantial errors in the other, which is
exactly why U3 prices an `emptiedPacks` abstention as a first-class cost
instead of maximising retained pairs alone. (4) GRPO and GDPO, which assign a
response-level advantage uniformly to tokens, improve one direction while
deteriorating the other; MemCalib-RL instead uses ordered bidirectional
counterfactual credit assignment with nine reward channels, token granularity
and exact atom ablation. A single scalar accuracy objective is therefore a
poor instrument for choosing a floor, which R47's refutation already forbade.

The mapping registered for U1 is structural, not numeric: over-use `O`
corresponds to `zeroCoveragePairs` (an irrelevant pair still injected) and
under-use `U` to `emptiedPacks` (a pack that could have helped but was
abstained). MemCalib's `rho = 0.5` decay is **symmetric**, whereas U3's cost is
deliberately asymmetric (`gamma > alpha > beta`) following RSCB-MC. No MemCalib
threshold, score or channel count may be copied into `COVERAGE_FLOORS` or the
registered weights.

**The Memory Funnel, from its own `core/consolidate.py` description.** The
lifecycle is `Trace -> Unit -> Crystal`. `crystal_policy()` promotes a Unit
only at **at least three independent sources**, or on explicit user
confirmation, or at confidence >= 0.90 with importance >= 0.80. Confidence
rises by a fixed step per corroborating source and is capped at **0.95**;
importance starts at a baseline and tracks how often a fact is used. A highly
corroborated but unused fact has high confidence and low importance; a
constantly used fact with one source has high importance and low confidence.
Supersession flips an older unit to `SUPERSEDED` with a `superseded_by` pointer
rather than deleting it, and BFS retrieval skips superseded relations. The
retrieval score is `score(t) = decay^hops(t) * (alpha * sim(t) + (1 - alpha) *
bm25(t))`, and `decay_action` archives units past `valid_to`. The
confidence/importance separation is the semantic anchor for R46's two planned
comparators: `distinct-task-support` measures corroboration across independent
traces (confidence), while `min-support-only` measures raw occurrence count
(importance). The value 3 is that project's own bar, not a transferable
constant; importing it would repeat the ruler defect of section 34.25.

**An offline readback verifier with three terminal states.** `r48_readback.py`
is a read-only analysis tool kept outside both repositories; it never mutates
source, gates or registrations, so it is not subject to the repository's
coverage gate and is not production code. It encodes the distinction this
iteration required: `NO_MEASUREMENT` when the evidence zip has no complete arm
pair, `GRADED` when a complete pair exists and no blocking gate is red, and
`GATE_RED` when a complete pair exists but blocking scientific gates refuse it
(R47's state). It grades all eight R48 predictions, all seven refutations, the
three reconciliation identities, the registered floor recomputed from the
committed R47 histogram, the cross-run per-task pair against R47's as-is memory
arm with an exact two-sided McNemar p-value, and the revert rule. Its
`--self-test` passes with `mcnemar(2, 8) = 0.109375` reproducing R47 exactly,
`chosen = 0.01` with `net(0.01) = 1231.0` and `measurableZero = 742`, an
abstention-averse ordering selecting `0`, all three terminal states asserted,
a synthetic self-consistent GRADED input with `allPredictionsHold = True` and
`allRefutationsClear = True`, and R1, R2 and R4 firing on their respective
broken inputs. Run against the real artefact of `42350304597` it returns
`NO_MEASUREMENT` with `armEntries = 0`, `predictionsGraded = 0`,
`revertRuleFired = False` and `downstreamArms = CLOSED`. It is staged for the
readback of `42353229972`.

Ranking is unchanged: IBM `gpt-5.5` airline 82.0 remains the SOTA, microglia
fifth of six named entries.


### 34.35 R48 read back: two deltas, a firing revert rule, and two defects

**Provenance.** Run `42353229972`, head `33038232`, job `128345648759`,
artefact `13568804042` (`l4-evidence`, 20,276,555 bytes, 92 entries, SHA256
`2ad896dd7037f1bb74d0e755444ddb89314c054598d4a406869e758c43ddc1ef`). It is the
lawful retry of the infrastructure-failed `42350304597` (34.33): same head,
same prereg, same nine dispatch inputs, exogenous provider fault before any
outcome existed. Both arms are `success`, the log has zero provider 500 lines,
`TAU_MIN_COVERAGE: 0.01` is injected at step 12, and step 11 reads the
registered floor. Only step 14 `Pair the arms` fails, on blocking scientific
gates, while step 16 uploads the evidence.

**The two deltas, kept separate.** `l4-paired` in `packages/eval/src/bin/
l4-pair.ts` is the gate that pairs the memory arm against the memory-free
reference arm **inside one dispatch**. Here it is `delta=-6.00pp [-16, +4]
p=0.453125, n=50, lost=5, gained=2` (memory `pass^4 0.38`, reference `0.44`).
The cross-run delta between R47's as-is memory arm and this run's floored
memory arm is `delta=-4.00pp, p=0.6875, lost=4, gained=2` (0.42 -> 0.38).
R48's "What is measured" calls the latter the contribution of U3; its R4
refutation, R45's rule and R46/R47's restatements name the former, `l4-paired`,
as the revert gate. They are not interchangeable.

**R4 fires.** The registered rule (`prereg/R45-admission.md`, re-stated in
R46/R47/R48) reverts if `l4-paired` is significantly negative **or** falls
below -5pp with a served pack. The second branch does not require
significance. `-6.00pp < -5pp` and `recallServed = 965 > 0`, so the rule
fires. R45 further states "revert on the reading, not on the explanation" and
"a plausible story about why a bad pack hurt is not evidence that the next pack
will help". A plausible story is abundant here: the memory-free reference arm
drifted from `0.30` (R47) to `0.44` (this run), 14 points of LLM sampling noise
on an unchanged configuration; the minimum detectable effect is 14.83pp
(`V5-resolution` FAIL, 216 tasks needed for a 5pp effect); `V16` sees 83
informative trials against its 100 floor. None of it may soften the reading.
The verdict is a governance action, not a causal claim: the applied floor
`0.01` is reverted to the as-is default, the arm is recorded as measured,
refuted and reverted, and no claim is made that the floor caused the delta.
The registration itself is not edited (R5 forbids it).

**Grading.** Seven predictions hold (P1-P7, including all three reconciliation
identities `1573 + 0 = 1573`, ten rungs against 965 served packs, and the zero
rung `1573 / 965 / 0`); P8 fails. Of seven refutations, R4 is FIRED and the
other six are clear. `allPredictionsHold=false`, `allRefutationsClear=false`,
`verdict=GATE_RED` with blocking red gates `V5-resolution` and `l4-paired`.
The delivered population confirms the floor acted: `meanPackIds` 1.4675 ->
1.0893, `injectedPairs` 2188 -> 1573, `zeroCoveragePairs` 750 -> 0,
`recallServed` 1491 -> 965, and the histogram's `0` and `0.01` rungs are
identical because the facade filtered before delivery. `U3_ELIGIBLE` from R47
(34.31) is now consumed.

**Defect 28 — the verifier bound the wrong delta.** The offline
`r48-readback.py` verifier shipped in iteration 171 computed refutation R4
from `cross_run_pair` (the `-4.00pp` contribution) and therefore reported
`revertRuleFired=false`, `allRefutationsClear=true` for a reading that fires
the rule. `l4-pair.ts`, R45, R46, R47 and R48 all bind the rule to the
within-run `l4-paired` gate; iteration 171's binding was an isolated
inconsistency. The root cause is that the rule lived only in prose and an
untyped offline script. Fixed by lifting it into
`packages/eval/src/l4-revert.ts` (`revertRule`, exported `REVERT_P_BAR=0.05`
and `REVERT_DELTA_BAR_PP=-5`, a `scope` tag refusing cross-run readings) with
fourteen TDD tests on the real committed fixture
`eval/fixtures/tau2-l4-paired-readings.json`, and by correcting the offline
verifier to the same semantics. Its self-test now grades R4 on R47 (`+12pp ->
clear`) and R48 (`-6pp / 965 served -> FIRES`) end to end and asserts that a
catastrophic cross-run delta with a safe within-run gate does not fire. The
corrected real readback reports `revertRuleFired=true`.

**Defect 29 — a cross-dispatch ablation is confounded by design.** R48
prediction 8 required the two memory arms to share the learning phase and the
store. They do not. R47 distilled 8 items over 4 edit events; the retry
distilled 12 over 6 events, with identical seeded split, scenario, model,
trials and admission configuration. The learned content changed while the
configuration did not, because distillation and agent sampling are stochastic
across dispatches. The reference arm drifted 14 points. `TECH-DESIGN` 17.40
already warned that comparing two dispatches puts the answer inside the
run-to-run noise, and `ROADMAP` Read 7 measured that a cross-run estimate was
off by a factor of two in the direction that flattered the hypothesis. The
fix is not another retry: it is a within-run pair (one learning phase, one
store, one reference, only the recall facade varied), registered before its
own dispatch. U1, U2 and R46's admission-rule arms remain CLOSED.

**Acceptance.** `pnpm check` exits 0: 2994 tests across 143 files, coverage
99.98 / 99.68 / 100 / 99.98, `audit: ok`, `bundle:size ok`; the coupling
ledger reflects the new module (140 -> 141). Both repositories are pushed as
Lambertyan and `ci.yml` is green on the new head. Ranking is unchanged: IBM
`gpt-5.5` airline 82.0 remains the SOTA, microglia fifth of six named entries.


### 34.36 Paired-evaluation sources read after the revert

**Provenance and scope.** While `ci.yml` run `42366953175` went green on head
`455a4616`, five statistical and first-party benchmark sources were read to
quantify defect 29 (34.35). They are methodology, not leaderboard entries:
none reports a tau2-bench `Pass^4` number, none enters `COVERAGE_FLOORS`, and
none changes the SOTA ranking. This section records what they establish and
what they forbid.

1. **Run-to-run variance and common random numbers** (SciXa, "Run-to-Run
   Variance in Stochastic LLM Evaluation"; and "Seed Governance Practices in
   Distributed Training Runs"): paired dichotomous outcomes across blocks are
   graded by McNemar's test (McNemar 1947, Dietterich 1998); shared seeds give
   `Var(A - B) = 2 * sigma^2 * (1 - rho)`, so at rho = 0.5 the difference's
   noise is about 0.71 of the independent case. Seed coupling cancels only the
   components the arms share; it does nothing for each arm's own sampling
   draws. The two-tier protocol is "pair within comparisons, replicate across
   claims", with run counts and per-run scores reported so selective run
   counts cannot flatter a mean.
2. **arXiv 2512.24145, "When Does Pairing Seeds Reduce Variance?"**: formalises
   paired-seed evaluation as the classical paired design with the seed as the
   unit of randomisation, holding it fixed across alternatives and estimating
   effects through within-seed differences; it yields tighter intervals and
   higher power whenever outcomes are positively correlated at seed level, and
   reverts to independent evaluation when correlation is absent.
3. **Noise-aware agent evaluation** (Scorable; Agentic AI Wiki "Eval Variance
   and Statistical Power"): `Var(score) ~= sigma_between^2 / T +
   sigma_within^2 / (T * R)`; more runs shrink only the within term, while
   between-task heterogeneity is divided by T alone. Pairwise comparison on
   the same items with the same seeds is described as the single
   highest-return change in agent evaluation. A 500-task unpaired score near
   50 percent has a 95 percent interval of about plus or minus 4.4 points.
4. **tau-bench / tau2-bench evaluation guide** (QASkills 2026; the tau2-bench
   dual-control protocol summary): keep `--user-model` fixed across
   comparisons; pass^k is `E_task[prod_j success_j]`; report domain and k
   beside every number; do not over-index on one seed. The dual-control setup
   already ships three evaluation modes (default, no-user, oracle-plan) whose
   gaps isolate communication and reasoning failure — a within-run ablation,
   not a cross-dispatch one.
5. **A pass^k implementation reading** (InferLoop): `pass^k = 1 -
   C(n-c, k) / C(n, k)`, with `stderr = sqrt(p(1-p)/n)`; the note that a
   scorer's judge disagreement can distort pass^k itself.

**What this establishes.** R48 compared two dispatches that shared a
configuration but not a random stream, so the 14-point reference drift and the
8-versus-12 distilled-item difference are the run-level and learning-level
noise the sources describe, not treatment effects. The exact McNemar test in
`l4-pair.ts` is valid only for a genuine within-run pair. `V5-resolution`
(MDE 14.83pp, 216 tasks for 5pp) is the between-task arithmetic floor, so
another retry of the 50-task cross-dispatch design cannot resolve a 5pp
effect. The fix is a within-run pair (34.35, `TECH-DESIGN` 17.100), not a
larger sample of the same confounded design.

**What this forbids.** No numeric threshold from these sources — no rho, no
seed count, no CI half-width, no user-model setting — is imported into
`COVERAGE_FLOORS`, the registered cost weights, the tie-break, or R46's
admission-rule comparators (section 34.25). They come from other benchmarks
and other task pools. Reading a method is not measuring a contribution.
U1, U2 and R46's arms remain CLOSED until a valid within-run pair exists.
Ranking is unchanged: IBM `gpt-5.5` airline 82.0 remains the SOTA, microglia
fifth of six named entries.


### 34.37 Defect 29 becomes a runtime refusal, with real committed scopes

**Object.** `packages/eval/src/within-run-pair.ts`, its 29-test suite, the
committed fixture `eval/fixtures/tau2-facade-scopes.json`, and the additive
export in `packages/eval/src/index.ts`. This is the same lift performed for the
R45 revert rule in 17.99 / 34.35: a sentence in a document becomes a type and
a function that CI grades.

**The invariant.** Two memory facades are a pair only when they come from one
dispatch, one pre-registration, one distilled store, one learn split, one test
split, one seed, one trial count and one model. `RunScope` states exactly those
eight fields. `scopeDifference` walks them in a fixed order and returns the
first disagreement by name, so a refusal says which repair is needed.
`withinRunPair` checks role labels, the as-is floor of `0`, a floored arm on a
registered `COVERAGE_FLOORS` rung above zero, scope identity, instrument
validity on both arms, and exact task-id equality before calling the existing
`compareArms` with `PAIR_SEED = 7` and `PAIR_RESAMPLES = 10_000`, identical to
`bin/l4-pair.ts`. It never re-implements a statistic.

**Three terminal states and their order.** `REFUSED_CROSS_RUN` is graded
*before* the instrument checks: a scope drift is the primary fact, and a
missing artefact on one arm is not evidence that a cross-run comparison was
valid. `NO_MEASUREMENT` covers malformed scopes, invalid served counts, empty,
duplicated or mismatched task rows, and a zero common task set. `PAIRED` carries
a `FacadeContrast` tagged `facade-contrast`, the floor, both served counts and
the `ArmComparison`. A refused pair never emits a delta.

**Why the tag matters.** Defect 28 was an offline verifier binding the R45
revert rule to a cross-run delta; defect 29 was a cross-dispatch comparison
presented as a treatment contribution. `l4-revert.ts` types its input as
`PairedReading` with `scope: 'within-run' | 'cross-run'`. The new contrast has
no `scope` property at all and is a distinct type, so it cannot be passed to
`revertRule` without an explicit, visible conversion. A test asserts the
property is absent. This is the second time a confusion between the
memory-vs-reference gate and a treatment contrast is made unrepresentable
rather than documented.

**Fixture provenance.** R47 (`42337250684`): 8 distilled items, reference
`pass^4` 0.30, `recallServed` 1491, within-run `l4-paired` +12pp p=0.1094.
R48 retry (`42353229972`): 12 distilled items, reference 0.44, `recallServed`
965, within-run `l4-paired` -6.00pp p=0.4531. Both are committed readings from
34.35 / 17.98 / `prereg/R48-u3-coverage-floor.md`. The `storeFingerprint`
strings in the fixture are the *documented store identities* ("8 distilled
items", "12 distilled items"), not sha256 digests; the fixture description says
so, and a real dispatch must attest the digest of its one store. The identity
control is explicitly labelled "structural, NOT a measurement": both facades
carry the same scope and the same outcomes, so a valid pair must report a zero
delta. No accuracy figure is invented anywhere in this suite.

**Coverage of the suite.** 2 tests on the committed readings themselves; 9 on
`scopeDifference` (identity plus one per field plus split contents); 4 on a
valid pair (zero delta, constants, the missing `scope` tag, every grid rung);
4 on cross-run refusal (the real R47/R48 pair, a changed store on one dispatch,
drift graded before a missing measurement, a mirror case with a
catastrophic-looking but cross-run delta); 10 on `NO_MEASUREMENT` (swapped
labels, as-is floor, zero floor, off-grid floors, three missing attestations,
six malformed scope fields, two served counts, four task-row defects, plus a
zero-served as-is arm that must still pair). All 29 pass.

**Two defects found and fixed during the build, both in the test or the type
layer, not papered over.** (1) `PairVerdict` collided with the existing export
from `pairs.ts`; typecheck caught it and the new type was renamed
`WithinRunPairVerdict`. (2) `NaN` seeds were reported as a scope drift because
`===` is false for `NaN`; `sameValue` now uses `Object.is`, so two facades
sharing an invalid seed reach the instrument check and correctly report
`NO_MEASUREMENT`. Two earlier failures were mis-constructed tests that changed
only one arm's scope; the implementation was right and the tests were changed
to apply the malformed scope to both arms of one run.

**Verification and scope.** `pnpm check` exit 0, 3023 tests / 144 files,
coverage 99.97 / 99.67 / 100 / 99.97, `audit: ok`, `bundle:size ok`. The
coupling ledger records 142 modules / 38444 production lines. No source in the
τ² driver, `bin/l4.ts`, `bin/l4-pair.ts`, the gate definitions or any
pre-registration is changed. No benchmark is dispatched and no `Pass^4` number
is claimed. IBM `gpt-5.5` airline 82.0 remains the SOTA; microglia is fifth of
six named entries.


### 34.38 Defect 27 closes, and the two earlier defects become unrepresentable

R48's first dispatch (`42350304597`) spent an hour on a DeepSeek endpoint that
answered 500 on every call. Both arms failed, the evidence zip carried zero arm
entries, and the readback had to declare NO_MEASUREMENT after the fact. Defect
27 was the absence of a decision before the run was paid for.

`provider-probe.ts` now classifies a bounded series of pre-flight completions
into three states. Only READY may start a paid measurement. A refusal throws
`ProviderNoMeasurementError`, which `l4.ts` catches by name across the dynamic
import boundary and records as an artefact with `status_no_measurement: 1`,
`status_not_run: 0` and `claim: none`. That distinction matters: a green skip
is exactly the quiet failure the first R48 dispatch produced, and an empty
`per_task` array would be a zero-task measurement dressed up as a measurement
that happened. The lane-level test asserts both the absence of `per_task` and
the absence of any paired artefact on that path.

The probe is opt-in and registered by R49 rather than on by default. Turning it
on globally would change the call sequence of every earlier dispatch, and an
infrastructure failure would then be confounded with a change in the harness.
This is a deliberate trade-off, recorded here rather than hidden in a default.

Defects 28 and 29 are now unrepresentable at the type level as well as the
runtime level. `FacadeContrast` carries a `facade-contrast` tag and has no
`scope` field readable by `revertRule`; the R45 revert rule consumes only the
memory-versus-reference `l4-paired` gate. `RunScope` pins eight shared fields,
and `scopeDifference` names the first field that disagrees. A pair whose store
fingerprint differs is refused before any task row is compared, even when its
cross-run delta looks catastrophic. The mirror test asserts exactly that.

Verification of this section: `pnpm check` exit 0, 3104 tests, coverage
99.94 / 99.63 / 100 / 99.94 across statements, branches, functions and lines.
Three lane-level tests exercise the real CLI, and 62 pure tests exercise every
terminal state, every malformed-instrument path and every registered grid
rung. The structural coupling ledger moved from 142 to 144 modules.

### 34.39 Defect 30: a misspelled dispatch input silently skipped the memory arm

The first R49 dispatch (`42380685732`) was cancelled before it measured
anything, and the reason is instructive. The `prereg` workflow input is a
registration ID; `sota.yml` appends `.md` to build the file path. The dispatch
supplied `R49-within-run-pair.md` instead, so the step opened
`prereg/R49-within-run-pair.md.md`, failed with `ENOENT`, and the memory arm
was skipped by the default step dependency. The reference arm, guarded by
`always()`, was still starting and would have spent an hour of model calls on a
configuration error.

Two fixes, both refusing rather than guessing. The registration step now
rejects an input ending in `.md` with a message that names the correct form,
and checks that `prereg/<id>.md` exists before any model call. The reference
arm no longer runs when the registration check failed. The shell fragment was
reproduced locally with both spellings: the correct ID emits `floor=0.01` and
`pair=true`, and the incorrect one fires the guard.

This is a harness defect, not a measurement. No arm ran, no artefact was
written, no number is claimed, and the R45 revert rule was not consulted. The
cortex release remains excluded. It is recorded because a skipped arm that
looks like a completed job is the same class of quiet failure as defect 27:
the lane must say what it did not measure.


### 34.40 Defect 31: every stop before measuring was provider-shaped

Defect 27 was fixed by a pre-flight probe, and the fix recognised exactly one
error: `ProviderNoMeasurementError`, matched by name because the driver is
dynamically imported. That was one case of a general problem. A paired run has
three ways to stop before it measures anything, and only one of them is a
provider:

| Stop | Where it is detected | What the lane used to do |
| --- | --- | --- |
| the endpoint refuses every call | the pre-flight probe | explicit `status_no_measurement` (defect 27's fix) |
| the distilled store is empty | `facadeScope` refuses to attest a fingerprint | rethrown as a stack trace, no artefact |
| the pair's scope cannot be attested | `facadeScope` refuses a half-split, a non-finite seed, a zero trial count | rethrown as a stack trace, no artefact |

The second row is R41's exact failure mode: 36.0 was scored from a store that
held nothing, and the reading was published as a result. A red job with a stack
trace is louder than that, but it is still not a statement about what was not
measured, and it is indistinguishable from a genuine bug in the driver.

The fix makes the refusal structural rather than nominal. `noMeasurementRefusal`
builds an error that carries a well-formed marker, and `isNoMeasurementRefusal`
recognises it by the marker's shape -- `status_no_measurement === 1`,
`status_not_run === 0`, a non-empty reason -- instead of by class identity,
because the driver is a dynamic import and a marker that crossed a JSON boundary
has no prototype at all. `ProviderNoMeasurementError` remains, as one instance
of the contract rather than the contract itself. `attestPairScope` wraps the
strict `facadeScope`, so an unattestable pair reaches the lane as an explicit
`status_no_measurement` that names the missing thing.

The boundary is asserted in both directions. An ordinary driver crash still
rethrows: a bug is not an instrument, and swallowing it would be worse than the
stack trace. Three tests cover it -- a non-provider refusal becomes
`status_no_measurement` with `per_task` absent, a plain `Error` still propagates
out of the lane, and a marker-shaped object that has no class at all is still
recognised.

### 34.41 The per-package typecheck is not the gate

While building 34.40 a call was written to `pairScopeOrRefuse`, a function that
does not exist. `pnpm typecheck` passed. The reason is in
`packages/eval/tsconfig.json`: its `exclude` lists `src/bin/**`, so the project
build never sees a lane entrypoint, and every CLI this project dispatches --
`l4.ts`, `tau2-driver.ts`, `prereg-floor.ts`, `prereg-pair.ts`,
`facade-pair-readback.ts` -- is outside it.

`pnpm typecheck:lanes` compiles `packages/eval/src/bin/*.ts` with `--noEmit` and
does catch it, and `pnpm check` runs both, so the CI gate is complete. The
recorded lesson is narrower and worth keeping: a green `pnpm typecheck` says the
libraries typecheck, not that the lanes do, and the two are separate commands on
purpose. The mistake was caught by the second command three minutes later, which
is the system working; it would not have been caught if only the first had run.

### 34.42 Three bugs in the verifier, found by the verifier

The R49 readback tool is a checker, so its own failure mode matters more than
most: a checker that cannot fail silently certifies whatever it is handed. Its
self-test is thirteen mutations of a real artefact, and three of them failed on
first run -- because the checker was wrong, not the artefact.

1. **An always-true outage test.** The refutation "NO_MEASUREMENT was reported
   for a reason other than the registered pre-flight refusal" was written as
   `stopped == 1 and ("pre-flight" in reason or "provider" in reason or stopped
   == 1)`. The trailing disjunct makes the whole condition true whenever the
   marker is present, so any unregistered stop reason would have been accepted
   as a registered one. The disjunct is gone: the reason must name the provider
   or the pre-flight.
2. **A substring match that read the denial as the defect.** The check "the
   facade contrast was fed to the R45 revert rule" scanned the serialised
   artefact for `revert`. The artefact's own notes state that *no revert rule is
   consulted here*, so the clean fixture tripped the check it was supposed to
   pass. The test now looks for an actual `revert`-named key on the document,
   its verdict or its contrast.
3. **Predictions that had no meaning outside PAIRED.** Two predictions compare
   the two facades' per-task rows, which a run that never measured does not
   have. They were being reported as failures, which reads as an instrument
   fault rather than an inapplicable claim. They now render as `n/a` for a
   non-measuring terminal state, and the verdict is decided by the terminal
   state, not by those two.

The general lesson is the one this project keeps re-learning in a different
place each time: the thing that decides whether a result is real is itself a
subject of measurement, and it must be shown to fail on purpose before it is
trusted on a real run.

### 34.43 A census that defaults to zero is not a census

The pair artefact reported a `pass^4` delta and could not say what produced it.
That is a measurement gap rather than a crash, and it is the kind that survives
review: the number is real, the interval is honest, and the mechanism is simply
absent. The published ablations behind the memory hypothesis say the mechanism
is where the answer is — the same question against a focused pack and against a
full session differs by fifteen to thirty-five points, and the strongest models
express most of the gap by abstaining rather than by answering wrongly. A lane
that reports only the delta cannot tell those two apart.

The instrument is a per-episode flag: did any assistant message in this episode
carry a tool call. Four decisions were made while building it, and each is a
way the thing could have been wrong:

1. **Absent must not read as zero.** The obvious implementation returns counts
   and lets an absent census be an empty one, which every downstream reader
   would print as "0 of 0 inactive" or "nothing abstained". `NOT_OBSERVED` is a
   terminal state carrying its reason, exactly as `NO_MEASUREMENT` is for the
   pair. This is the same defect as `reward: null` read as `0`, and the project
   has now made it three times in three different places, which is why it is
   written down as a rule rather than a fix.
2. **A single hidden field voids the census.** If one simulation's messages are
   unavailable, or its trial number was never set, the phase reports the whole
   census as unobservable rather than the subset it could see. Half a census
   silently reported as a whole one is worse than none: the shares would be
   computed over a population the reader believes is complete.
3. **The reduction is on the side with tests.** The Python phase touches
   upstream's live objects and has no test harness; it therefore reports the
   episodes exactly as it saw them and decides nothing. Every count, every
   refusal and every ordering is in `packages/eval/src/inaction.ts`, covered at
   100 % on all four dimensions.
4. **The contract throws where the boundary must not.** `inactionContrast`
   refuses two populations — correct for a pure function asked for a number
   that does not exist — but its only caller is the driver, after an hour of
   evaluation, where a throw loses the artefact that holds both censuses. The
   adapter `inactionContrastOrNull` converts that refusal into a `null` contrast
   and is itself tested. Two names for one statistic, because an exception is
   the right answer in one place and the wrong one in the other.

One dead branch was found by coverage and removed rather than annotated: the
sort comparator's "equal ids" arm, unreachable because the ids are map keys. A
`v8 ignore` there would have been a lie about what the code can do, and this
repository does not keep those.

What the instrument does not do is also part of the record. It does not score
anything, it does not enter `pass^k`, it does not choose a floor, and it cannot
distinguish "the agent said it did not know" from "the agent stopped mid-task" —
τ² writes both as an episode with no further tool call. The narrower claim is
the one that can be defended: the agent did not act.

### 34.44 A mechanism that cannot report what it refused is not measurable

The store had one dedupe rule and it was an exact key over namespace, kind, scope
and statement. That rule is correct and it is also the defect: because the key
contains the scope, the same lesson learned twice in two tasks was never the same
claim, so the store grew a second copy — and a second copy is not a small waste.
It spends a pack slot that a distinct rule could have had, and it splits one
observation across two items so neither can corroborate the other.

The mechanism added is a write-time decision against the top-s nearest memories.
This audit records the four places it could have been wrong, and what was done
about each.

1. **The fourth operation.** The leading implementation offers `ADD`, `UPDATE`,
   `DELETE`, `NOOP`. Implementing `DELETE` here would mean letting a similarity
   match retire a stored rule, and this repository has already refused that shape
   once: curation will not merge items whose payloads disagree, because a merge
   lets the survivor's payload inherit the loser's evidence. A paraphrase is not
   evidence about which statement is true. The decision therefore has three
   operations, and the missing one is documented where a reader will look for it
   rather than omitted silently.
2. **The payload.** After deciding "these are the same rule", the next question
   is what merging does to the payload — and `mergeEvidence` *replaces* it. A
   paraphrase carrying a different payload would have rewritten a stored rule on
   the strength of a resemblance, so the payload check runs before the merge
   question and a disagreement is an `add`.
3. **The ordering.** Admission sits after the exact-key merge and after
   generalisation, and only for a claim that would otherwise have been created.
   Placed earlier it would have absorbed the cross-domain recurrence
   generalisation exists to widen, and the `generalize: false` ablation in the τ²
   lane would have started measuring admission as a side effect. Two mechanisms
   on one path need an order that keeps each attributable, and this is that order.
4. **The window and the tie.** `topS` bounds what a candidate may be compared
   against, and the ranking is total: similarity descending, then id. Without the
   tie-break, two neighbours at the same similarity would make the decision depend
   on the order the store returned, and two runs over one store could disagree
   about whether a write happened.

The counting is not decoration. `suppressed` says how much paraphrase pressure the
store absorbed, and `rephrased` says how much of it crossed a task boundary. An
arm that varied admission and reported only `pass^4` would be unable to tell "the
mechanism did nothing" from "the mechanism had nothing to do" — and those call for
opposite next steps.

Two smaller things found on the way. `wouldChange` was buried inside
`mergeEvidence`; asking the same question from a second caller meant either
exporting it or copying five conditions, and copying would have drifted. And the
bundle gate failed at 45,309 raw against a 44,000 ceiling: the ceiling moved to
46,000 in the script, with the measurement and the reason written beside the
number, because a budget that is adjusted silently is a budget that only ever
moves one way.

### 34.45 A gate that cannot pass is not a gate, and it may not be fixed after the result

R49 is the first dispatch in this lane's history that graded `l4-paired` on a real
pair. R48 and everything before it had no reference arm, so the gate read "no
reference arm" and passed — vacuously, which is worse than absent, because a
vacuous pass is a green square a reader will count.

With both arms present the gate returned:

```
[l4-pair] FAIL l4-paired: -4.00pp (p=0.6875, n=50)
[l4-pair] protocol: minimum detectable 13.73pp
[l4-pair] FAIL V5-resolution: minimum detectable 13.73pp
```

The pass condition is `delta >= 0 && p < 0.05`. The lane's own protocol gate
reports that this split cannot resolve an effect smaller than 13.73pp — retail has
115 tasks, the held-out half has 50, and the observed discordance puts anything
below fourteen points inside the noise. So the gate demands a result the sample
cannot deliver, at any effect size the mechanism under test could plausibly have.

Three observations, in the order that matters:

1. **The failure is informative and must be reported as such.** The delta is
   −4.00pp with four tasks lost and two gained, at a store of ten rules serving
   0.76 rules per question. That is a null result with a slight negative point
   estimate, not a harm: the R45 revert rule asks for significance or a drop below
   −5pp with a served pack, and neither holds. The mechanism stays.
2. **The gate is the defect, and the defect is structural.** Two independent
   statements came out of the same step — `V5-resolution` says the sample cannot
   resolve 13.73pp, `l4-paired` fails for not resolving 4pp. A pair of gates that
   contradict each other on every dispatch will be read as "the memory does not
   work" regardless of what the memory does.
3. **It is not changed now.** The numbers above are exactly what the gate was
   written without, and editing a pass condition after seeing the result converts
   a pre-registered experiment into a search over thresholds. `l4-paired`'s
   replacement is registered as R50 with its threshold, its wording and its
   treatment of `UNRESOLVED` fixed *before* the next dispatch: block on harm (the
   revert rule it was always meant to mirror), report `UNRESOLVED` when the
   minimum detectable difference exceeds the observed effect, and keep V5 as the
   gate that says the sample cannot decide it.

What this costs is a red workflow that is not a broken build. The code CI is green
(`ci` on `a1939e9`'s tree); the `sota` run is red because a *finding* gate was not
met, and the two are different signals that must not be merged into one word. The
lane's own convention — a finding gate exits non-zero *after* writing the
artefact — is what made the readback still possible: steps 15–17 ran, the pair
artefact was written, and the numbers above exist because the failure was
recorded rather than thrown away.

One number worth keeping for the next registration: **0.76 rules per question**
(V1, from 949 served of 1528 requests, store of 10). The mechanism's ceiling is
set by that number. A pack that carries fewer than one rule per question cannot
move a forty-point gap no matter how well it is selected, and every arm that varies
selection while the pack stays this thin is measuring the same null.

### 34.46 The retention curve was computed on the population that had already survived it

R49's artefact carries two numbers that cannot both be right:

```
recall: { requests: 1528, served: 949, empty: 579 }
coverage.floors: [ { minCoverage: 0,   retainedPacks: 949 },
                   { minCoverage: 0.01, retainedPacks: 949 } ]
pair.servedPacks: { asIs: 1435, floored: 949 }
```

The curve says floor `0.01` empties nothing. The pair says the same floor cost 486
packs. Both are readings of one run, and the curve is the one that is wrong.

The cause is an ordering, not an arithmetic error. In a paired dispatch the lane
grades the *floored* facade, and the use observations are collected at that
facade's recall boundary — after the floor has been applied. `coverageHistogram`
then asks, of those observations, what floors 0, 0.01, 0.02 … would retain, and
every floor at or below the applied one answers "everything", because the
population it is being asked about already passed it. The R47 curve, taken from an
as-is run, prices the same floor at 414 emptied packs out of 1483; R49's prices it
at zero.

This matters beyond the artefact being internally inconsistent. `decideFloor`
(U3) chooses the next floor from a committed histogram, and the registration rule
is that the curve is committed *before* the dispatch that uses it. A curve taken
from a floored run says floors are free, so the decision it feeds would raise the
floor rather than price it — and the artefact would look like an ordinary curve
the whole way.

The fix is one line of provenance and one of plumbing. `armRecordFromDriver` now
builds the curve from `coverageObservations` when the driver supplies them, and
the driver supplies the **as-is facade's** observations whenever a pair ran; the
`use` census keeps describing the graded facade, because that is the population
whose packs were graded. Absent, the curve falls back to the same observations it
always used, so every artefact before this one is unchanged — including the
committed R47 curve, which was taken from an ungated run and is therefore correct.

What the numbers say about the lane, once the curve is read correctly: the store
holds ten rules, all active, all in the recall scope, none without a domain; the
graded facade served a pack on **949 of 1528 requests (62.1 %)**, averaging **0.76
items** per request, with a median rule/query coverage of **4.7 %** and a maximum
of 40 %. Thirty-eight per cent of the agent's decisions were made with an empty
pack — which is the single most useful fact in this artefact for the memory
hypothesis, because an intervention that is absent 38 % of the time has its
measured effect diluted by exactly that share before anything else is considered.

Two smaller readings from the same artefact, recorded so they are not rediscovered:

- `use.injectedPairs` is 1164 over 949 served packs — 1.23 items per non-empty
  pack — and `zeroCoveragePairs` is 0. The pack is not empty because it is
  unrelated; it is empty because the store has nothing to say about the question.
- The facade contrast lost 7 tasks and gained 5 of 50, and the arm-against-
  reference comparison lost 4 and gained 2. Two different pairings, two different
  discordant sets, one conclusion: no effect this split can see.

### 34.47 A gate that could not pass is replaced by a state that cannot lie

34.45 left the replacement as a registration rather than an edit, for the reason it
gave: a pass condition changed after the result is a search over thresholds. R50 is
that registration, and this is what implementing it did and did not do.

**The change is to the sentence, not the memory.** `l4-paired` passed only on
`delta >= 0 && p` below 0.05, on a split whose minimum detectable difference is
13.73pp at n = 50 and 9.05pp at the scenario's full 115 tasks. Nothing the
mechanism could plausibly do satisfies that condition here, so the gate was red on
every dispatch that graded it and would have stayed red for reasons unrelated to
the mechanism. It now passes exactly when the R45 revert rule does not fire — the
rule it was described as mirroring in every document since R45 — and that rule is
*called*, not copied: `pairedVerdict` invokes `revertRule`, so the two cannot
drift into two answers to one question.

**The resolution moved into a second gate rather than into the pass condition.**
`l4-effect-resolved` reports whether `|delta|` reaches the minimum detectable
difference. It does not block, and that is deliberate: an unresolvable effect is a
statement about the sample, and `V5-resolution` already blocks on it from the
protocol's side. A second blocking copy of the same fact would print the same red
line twice, which is the failure mode 34.45 is about.

**The verdict is derived from the two numbers the report prints.** `HARM` when the
revert rule fires; `BENEFIT` when the delta is positive, significant, *and* at
least the minimum detectable difference; `UNRESOLVED` otherwise, carrying
`excludedAbovePp` so a reader learns what was excluded. The third clause on
`BENEFIT` is the one that matters: without it, +4.00pp at an MDE of 13.73pp is
published as a benefit the experiment had already certified it could not see.

**`claim` is null in the `UNRESOLVED` state**, and that is a type decision rather
than a stylistic one. A field that is always a string is a field downstream code
concatenates into a sentence; a field that is null where there is nothing to say
forces every consumer to handle the absence.

Re-reading the three committed readings under the new condition is the check that
it is the old condition restricted to harm and not a loosening:

| Reading | Old `l4-paired` | State | New `l4-paired` |
| --- | --- | --- | --- |
| R47 +12.00pp, p = 0.1094 | FAIL | UNRESOLVED | PASS |
| R48 −6.00pp, p = 0.4531, 965 packs | FAIL | HARM | **FAIL** |
| R49 −4.00pp, p = 0.6875, 949 packs | FAIL | UNRESOLVED | PASS |

R48 stays red — it is the only reading in the lane's history that fires a revert
branch — and every other row moves from a verdict about the memory to a verdict
about the sample. The fixture that carries these three readings was extended with
R49 and with the resolution column, and the test asserts both the harm branch and
the state for each row, at three different resolutions for the two rows whose runs
predate the field.

One thing this deliberately does not fix. `V5-resolution` still fails on τ² retail
and always will: 115 tasks at pass^4 cannot resolve 6pp, and the bar is a constant
of the shared protocol, not of this lane. Lowering it here would change what the
BIRD lane certifies. What the lane can do without touching the protocol is stop
attributing that failure to the memory, and that is what R50 does.

### 34.48 The rule did not carry the question, and two boundaries dropped it

R49's census is the most useful number the lane has produced, and it took two more
readings of the code to see what it was a census *of*:

```
store: 10 items, 10 active, 10 servable, 0 without a domain
requests: 1528, served 949, empty 579
mean items per request 0.76, rule/query coverage p50 4.7%
```

A store of ten rules is thin. A store of ten rules of which **none can be found by
a question** is a different defect, and it is the one that was there. Every rule
read:

> A request of this shape is resolved by calling find_user, then
> cancel_pending_order, in that order.

That sentence shares no term with anything a user says. It is also the only text
the rule carried, because the item's condition — the field added in iteration 62
for exactly this reason, "a statement records what was true; it says nothing about
when it is true" — was absent from all ten.

**Two boundaries, one omission.** Upstream τ² states the user's request in
`user_scenario.instructions`. `parseTauTasks` read `id`, `evaluation_criteria`,
`communicate_info` and `nl_assertions`, and dropped it. The driver then built the
learning event as `input: { question: correction.taskId }`, so the distiller's
prompt — which asks for a trigger "in the question's own terms" and reads
`run.input.question` to find them — was asked to write in the terms of `"7"`. No
condition could have been produced, and none was.

Read side, the same half was missing three times over: the lexical index built its
document from `statement`, `kind` and the scope; `minCoverage` measured
`queryCoverage(query, item.statement)`; MMR diversified on `item.statement`. Three
call sites, three independent decisions, one answer — the statement is the whole
rule.

**The repair is six lines and no knob.** `TauTask.instruction` parses both upstream
shapes and is `''` rather than `undefined` when absent, because every consumer asks
"is there a question to show" and none should distinguish two ways of saying no.
The correction carries it to the event, which forwards it as `question` with the id
beside it. `recallText(item)` — condition, then statement — becomes the single
definition the index, the floor and MMR all read.

**Why a census rather than an accuracy number.** The prediction R51 registers is
`store.conditioned >= 4` of the servable items and an empty-pack share at or below
25%, not a delta. An accuracy claim at an MDE of 9–14pp would be a claim the lane
has already certified it cannot check, and 34.45 is the record of what happens when
a gate demands one anyway. `storeCensus` now counts conditioned and unconditioned
items over the servable population — not over the whole store, because an item the
recall scope cannot reach is unconditioned for a different reason and adding the
two populations together lets one defect hide behind the other.

Two smaller things fell out of writing the tests, both of them arguments the next
registration can use:

- The word `order` in "in that order" lifted a tool-only statement's coverage of the
  question *"cancel an order that has not shipped"* to **0.25** — four times the
  0.01 floor R49 tested. That is why a 0.01 floor measured as free: the statement
  accidentally clears it. The fixture for the recall test uses vocabulary the
  statement does not contain, and the comment says which accidental match it is
  avoiding.
- `memory.search` returns every scope-mate whatever the lexical score, by design:
  scope is an index, not a filter. So a condition changes the *rank*, and it is
  `minCoverage` that turns a scope match into no match. The test asserts the order
  and the lexical scores rather than a count of hits, because the count is a
  property of the scope and not of the condition.

### 34.49 The second copy of the unanswerable gate passed vacuously

34.47 removed `delta >= 0 && p` below 0.05 from `bin/l4-pair.ts` and replaced it with
the R45 revert rule. It did not remove the *other* copy, which sat in `bin/l4.ts` and
graded the same condition on a single arm's artefact:

```ts
{
  id: 'l4-paired',
  pass: paired === undefined ? true : paired.delta >= 0 && paired.p < 0.05,
  actual: paired === undefined ? 'no reference arm' : …,
  criterion: 'against the same agent without the memory: delta >= 0 at p<0.05',
}
```

Two defects in four lines. The condition is the unreachable one — same split, same
MDE, same impossibility. And the fallback is worse than the condition: an arm
artefact has no reference arm, so `paired` is `undefined`, so the gate prints
`PASS l4-paired: no reference arm`. That is a green square for a question the file
cannot ask, and it is the vacuous pass 34.45 counted as worse than an absent gate —
R48's reading "passed" this way for three rounds.

The fix follows the convention this file already states two conditions above it:
*omitting the gate is a statement, not a pass*. When a reference arm is supplied the
gate is graded by `pairedVerdict` and blocks on harm; when none is, the gate is not
emitted at all, and the pair step owns the memory-versus-reference question.

The resolution handed to the verdict is `Infinity`, deliberately. This file has the
delta and the p-value but not the discordance, so it cannot estimate a minimum
detectable difference — and an unestimable resolution supports neither a benefit
claim nor an equivalence claim, which is exactly how `pairedVerdict` reads it.

One consequence is recorded rather than papered over: the R49 readback's P6 asserts
that the main artefact carries an `l4-paired` gate, which was true of every artefact
written before this change and is no longer true of one written after it. The
verifier grades R49 — a historical dispatch against a committed fixture — and its
fixture still carries the gate, so the self-test is unaffected. R51's readback
(`eval/verifiers/r51_readback.py`) does not read that gate for the same reason it
does not read the other one: a gate that only ever said "no reference arm" was never
evidence.

### 34.50 R52: the same unanswerable gate, one layer down in the shared protocol

34.47 through 34.49 removed an unanswerable condition from two τ² binaries. It did not
touch the copy in `packages/protocol/src/gates.ts`, because that one is shared with a
lane that *can* answer it: BIRD reaches 1.96–4.87pp on a 6pp bar, and lowering a true bar
to flatter a lane that cannot reach it would have changed what every published BIRD cell
certifies.

The cost of keeping it was one permanently red line per τ² dispatch. The cost of removing
it naively — deleting the gate, or passing a scenario-supplied target — is worse: the
first loses the statement that the sample cannot resolve 6pp, and the second hands the bar
to the party it constrains. R52 is the third option, and this is what implementing it
found.

**The condition is now about the run, not the scenario.** `V5-resolution` blocks a run
that publishes a direction finer than its own sample can resolve. That is answerable on
any scenario, it is the failure the gate was written for (a design that could not have
seen the effect it went looking for, publishing a delta anyway), and it does not depend on
a population the lane cannot enlarge.

**The three states of `claimPp` are the whole design**, and the third is the one that
matters:

| `claimPp` | Means | Graded by |
| --- | --- | --- |
| a number | the run concluded, in this direction, at this size | the resolution |
| `null` | the run measured and concluded nothing | nothing — it claims nothing |
| *absent* | the lane does not report claims | the 6pp bar, exactly as before |

Collapsing `null` and *absent* would be the vacuous pass 34.45 counted as worse than an
absent gate: any run could then pass by not mentioning the question. BIRD never supplies
the field, so all seventeen committed cells keep the condition they were graded by.

**The registered amendment, and why it is not a convenience.** R52 as written proposes
`protocol.powerTarget` as a scenario-supplied input defaulting to 6pp. Implementing it
showed the input *is* the registration's own third refutation with a different name: the
only scenarios that would pass one are the two that cannot reach 6pp, and the number they
would type is the observed resolution — making the condition `detectablePp <= detectablePp`
and therefore always true. The target is a constant, `POWER_TARGET_PP`, reported in the
gate's own sentence and movable by nobody. The amendment is recorded in the registration
before the code was pushed, which is the only condition under which an amendment is worth
anything.

**What it cost, in the one place that had encoded the old contract.** `.github/workflows/ci.yml`
asserted that `eval:l4-pair` exits non-zero on the sixty-seven-task fixture — a step whose
entire content was "the lane is red, and here is why". Under the new condition that pair
claims nothing, so V5 passes and the step exits zero. The assertion was replaced rather
than deleted, because a step that only asserts green is the failure mode R52 is about:

| Check | Before | After |
| --- | --- | --- |
| exit code | must be non-zero | must be zero, and the artefact must say why |
| V5 | `pass === false` | `pass === true` **and** the sentence contains "the run claims no direction" **and** 21.41pp |
| claim | not recorded | `verdict.claim === null` — a value the artefact must write |
| direction | refused by the exit code | refused by `l4-effect-resolved`, non-blocking |

Both failure directions are still reachable by a future regression: a pair that claims
4pp at a 21.41pp resolution fails on the comparison, and a pair that never sets `claimPp`
falls back to the 6pp bar and fails there. The step cannot be passed by silence.

**Refutation, written before dispatch and gradable offline.** If any committed BIRD cell
changes verdict, the default did not survive the transplant. It does not: the seventeen
cells supply no `claimPp`, and `2a71e60b`'s CI re-renders all of them. If a τ² dispatch
records `BENEFIT` below its own `detectablePp`, the two halves have diverged — which the
unit tests make unreachable, since `pairedVerdict` refuses the state before the gate reads
it.

### 34.51 R51 measured: the conditions were written, and the emptiness was never theirs

R51 dispatched to fix two boundaries — the instruction dropped on the write side, the
condition ignored on the read side — and registered three predictions. It came back
ABANDONED, and the reason is more useful than the verdict.

**What the run actually was.** The dispatch set no scenario inputs, so it inherited the
repository variables: learn on **retail**, answer **airline**, recall under **retail**. The
readback therefore graded a retail store's rules on airline questions. Nothing in the
artefact was wrong; the configuration was invisible in the registration, and it is now a
header (`trainDomain`/`testDomain`/`recallDomain`) read by `eval:prereg-scenario`.

| Prediction | Registered | Measured | |
| --- | --- | --- | --- |
| `store.conditioned` | ≥ 4 of servable | **16 of 16** | met (R49: 0 of 10) |
| `empty / requests` | ≤ 0.25 | **0 / 1,527** | met (R49: 0.379) |
| coverage p50 | ≥ 12% | **4.88%** | **refuted** (R49: 4.7%) |
| mean pack | 1.4–2.4 | 1.222 | short |
| `l4-paired` | no revert branch | UNRESOLVED, −2.00pp, MDE 18.59pp | met |

The third prediction fired its own refutation ("the pack fills on scope alone, with no
topical gain") and the arm is closed as registered. But 4.88% is the coverage of retail
rules against **airline** questions: that is a measurement of transfer, and a prediction
about relevance cannot be refuted by it.

**The correction this readback forces on the record, and it is mine.** AUDIT 34.48, WHITEPAPER
3.6.58 and COMPETITIVE L.25 all read R49's "38% of requests were served an empty pack" as a
defect of the write and read paths — rules with no condition, unfindable by a question. The
census is real; the attribution is wrong. R49 ran `minCoverage 0.01`, and **its own retention
curve says that floor emptied 571 of 1,516 packs** while the as-is facade in the same run
served 1,435 of 1,527. R51, at floor zero, served every request. The empty packs were the
floor under test, not the missing conditions.

That matters beyond bookkeeping. The project spent two iterations on a defect whose number
was a property of a knob it had turned, and the number that would have said so was already
in the same artefact, one field away (`coverageObservations`, added by 34.46 for a different
reason). The conditions *were* missing — 0 of 10 — and writing them was still the right
repair; but it did not fix the emptiness, and the record has to say which is which.

**What R51 did establish.** The store now writes its own triggers: 16 of 16 items carry a
condition where R49's carried none, and the artefact carries the conditions in words
(`storeItems`) rather than a count of them — because a count cannot tell a trigger written
in the user's register from one written in the procedure's, and those two predict opposite
coverage.

### 34.52 The scenario belongs in the registration, and the store belongs in the artefact

Two instrument defects, both discovered by the same readback, both repaired before the next
dispatch.

**A configuration that cannot be read is not a specification.** R51's predictions named a
configuration the dispatch did not pin. The recall floor had already been moved into the
pre-registration header for exactly this reason (a floor a caller can type is a floor chosen
after the readout), and the scenario had not. It is the same argument: `trainDomain`,
`testDomain`, `recallDomain` now live in the header, `eval:prereg-scenario` emits them,
and both arms consume them ahead of the variables. A registration that pins nothing emits
three empty lines, so every earlier registration resolves exactly as it did.

Three refusals make the pin honest rather than decorative:

| Refusal | Why |
| --- | --- |
| a domain that is not `^[a-z][a-z0-9]*$` | the value is pasted into an environment variable; anything a shell reads is a value that can change the experiment |
| `recallDomain` ≠ `trainDomain` | recall is asked in the store's own scenario; a third domain is an experiment no registration has a prediction about |
| a partial pair | the rest would fall back to a variable, which is the defect being removed |

**A census is not a reading.** `store.conditioned` counted 16 items and could not show one
of them, so the readback could not answer the question the next arm asks. `storeItems`
carries id, kind, condition, statement, trust and scope, bounded by a limit and a character
cap, with `omitted` and `truncated` counted. A sample that silently dropped half a store
would let the register of the sample stand in for the register of the store — the same
defect as a retention curve computed on the population that survived it, one artefact
earlier.

### 34.53 Two medians, one phrase, and a verifier that had never run in CI

R54 was dispatched a second time — run `42438746694` on `f25c8b56`, the commit that made the
use census score the document the floor scores — after the first dispatch was cancelled twenty
minutes in, because its third prediction would have been graded on the old document for the
third time. Its first two steps are the ones the registration now guarantees: `State the
scenario pair` and `Read the registered recall floor`, and `eval:prereg-scenario` resolves
R54's header to `train=retail`, `test=retail`, `recall=retail` with a floor of 0 and no facade
pair, checked locally against the committed file before the readback rather than after it.

**What the run cannot answer, and what was done about it while it ran.** R54's third
prediction is "coverage p50 at least 12%". The committed verifier grades it against
`tau2.coverage.nonzeroQuantiles.p50` — the median over the pairs that cleared zero — and that
is what R49 (4.7%) and R51 (4.88%) were read against, so the series is defined. What the
artefact never carried is the other population. R47's histogram committed 750 zeros in 2,188
injected pairs, which puts the median over **every** delivered pair at that population's 24th
non-zero percentile, about 2.7%: half the graded number, and in no field at all.

The zeros were delivered. The model saw those rules. So a bar met on the survivors is
compatible with a delivery that is eight-tenths unrelated — which is exactly the state R54's
second refutation has to tell apart from a distiller that names the situation, and the artefact
gave the readback no way to tell them apart.

Three changes, and one of them is a subtraction:

| Change | Why it is the shape it is |
| --- | --- |
| `coverage.medians` — `medianAllPairs`, `medianNonzero`, `pairs`, `zeroPairs` | the delivered-pair median is now committed, inside the histogram block rather than beside it, because a median built from a different observation list would be a second population rather than a second reading |
| `measuredRows` — one row builder for profile, histogram and medians | the two reductions cannot disagree about which packs are measurable, which is the same defect as the three call sites that each decided for themselves what a rule "says" |
| a `coverage-readback` module and CLI, written and then deleted | it read the median out of the artefact in TypeScript while `eval/verifiers/*.py` already graded it in Python. Two readers for one field is the drift this project keeps paying for, so the TS path was removed before it was pushed |

The test that matters is the drift guard: `medians.medianNonzero` must equal
`nonzeroQuantiles.p50` on eight mixed observations, and `medians.pairs` must equal
`measuredPairs`, with the counts hand-written (ten pairs, three of them zero) rather than
derived from the function under test. A guard that recomputes its own subject cannot catch a
population error. The histogram's exact-key-set assertion — the one that exists to make a
silent widening impossible — fired and was updated deliberately, in the commit, with the reason
in the assertion's own comment.

**A dead branch, introduced and removed in the same iteration.** The first version of the
wiring guarded the new reduction with `coverageSource ?? []`, a fallback that cannot be taken
because the spread it sits inside is conditional on the same list. Branch coverage fell to
98.30% and named the line. The repair is not a test that executes an impossible branch: the
block is now built by a function that takes a non-optional list, so the defensiveness has
nowhere to hide. `tau2-instrument.ts` reads 100/100/100/100.

**And a self-test that had never run in CI.** `eval/verifiers/r49_readback.py` and
`r51_readback.py` have both carried a `--self-test` since they were written, and `pnpm check`
runs them — but the workflow does not run `pnpm check`, it runs steps, and no step ran the
verifiers. A verifier whose fixtures are never graded is a file that was correct when it was
written: the same failure mode as R16's header, R13's ledger and R12's admission. R54 is the
first registration with a verifier that grades a state the registration itself names, and
`DISCARDED` — a dispatch that ran the wrong scenario pair is discarded, not reinterpreted —
is why the fourth state exists rather than being folded into `ABANDONED`. A step now runs
`pnpm eval:verifiers` on every push, and `r54_readback.py --self-test` exercises fourteen
artefacts including a pre-R54 run with no `scenario` block at all (still graded) and one whose
coverage populations disagree (abandoned).

**The consequence, stated before the readback rather than after it.** If R54's non-zero p50
clears 12% while its delivered-pair median sits near zero, prediction 3 is met and the
mechanism is only half described: the conditions name situations and most of what was served
did not. That is not a refutation of R54. It is the registration the next one should be
written against, and the value of committing the second median is that it can now be the
subject of a registration at all.

### 34.54 The sample the header declared was the last experiment's

R54's header says `sample: 200`. That number came from R51, whose pair was retail → airline:
fifty airline tasks at four trials. R54 is the same mechanism in the configuration its
predictions were written for — retail → retail — and a same-scenario run is split out of one
scenario's own pool. Retail holds 115 tasks, `trainShare 0.5` cuts 58 and 57, and the
repository variable `TAU_TEST_TASKS` is 0, so the dispatch evaluates **57 held-out tasks and
228 episodes**, with learning capped at 32 of the 58 by `TAU_TRAIN_TASKS`.

This was found by reading the repository variables, not by waiting for the artefact, and it
would have broken the readback in a way that looks like science. The verifier asserted
`tasks == 50` as a prediction, which is R51's airline count; on a 57-task artefact that
prediction fails and the run is **abandoned** — for a bookkeeping error, in the one round whose
entire purpose is to produce a mechanism reading. That is defect 26 in the other direction: not
a gate that passes on an absent input, but a check that fires on a stale one.

Three things are wrong when a header describes the wrong experiment, and they need different
repairs.

| Wrong thing | Repair |
| --- | --- |
| the field is stale | record it in an Amendment; editing a registration after its dispatch is how a prediction becomes a description |
| the verifier graded it | predict only what the registration registers — four trials — and report the episode count as context |
| nothing notices | the readback prints `episodes N (T tasks at k=4)` beside the declaration, so the next reader sees both |

The general form of the mistake is worth stating because it recurs in every round of this
project: `sample` is a number about *a scenario's size*, written as if it were a number about
*the experiment*. Airline has fifty tasks and retail has a hundred and fifteen, so the same
budget in episodes is 200 in one and 228 in the other, and a header that carries the number
without the scenario is a header that will be wrong the first time the scenario changes.

**One more population, in the store sample.** `store.conditioned` is counted over *servable*
items — active, and inside the recall scope — while `storeItems` is the first `limit` items the
store lists, whatever their status. R54's verifier read conditions off the whole sample and
printed "N sampled items state a condition", which invites a comparison against `conditioned`
that compares two populations. That is the defect the coverage readings were repaired for one
instrument earlier, and it has the same repair: `StoreItemRecord` now carries `status`,
required rather than optional so no sample can omit it, and the verifier restricts the
condition text it quotes to active items. A self-test case makes the population visible: a
sample whose only conditioned item is retired states no condition, and the run abandons.

**And the download is now a tool.** The evidence archive is 20 MB behind a signed URL that
this environment fetches at about 24 KB/s per connection — fourteen minutes serially, which is
why every readback so far began with an ad-hoc download nobody recorded. `eval/tools/fetch_evidence.py`
follows the redirect *without* the API token (the storage host answers 401 to an `Authorization`
scheme it does not recognise rather than ignoring it), pulls 1 MiB ranges over sixteen
connections, and checks the assembled length against the size the API reported. Measured:
20,287,175 bytes in 1m52s, 91 entries. It refuses a run with two artefacts rather than choosing
one. The sequence from "a run finished" to "a verdict" is three committed commands.

### 34.55 The prompt that writes τ²'s triggers is written for a database

Reading, while R54's reference arm ran, the instruction the τ² lane actually distils under.

`tau2-driver.ts` builds its interpreter as `createLlmInterpreter({ llm })` — no `form`, no
`taxonomy` — and `createLlmInterpreter` defaults `form` to `'lesson'`, the generic form. The
`when` guidance in that form reads:

> `when` names a property the reader can check on a *different* input: what the question asks
> for, **which tables or columns it involves**, what the answer must be comparable to.

and its worked example is the one BIRD taught it:

> "Questions that name a race join results to races on raceId" is a rule; "the query answering
> <one question> selects forename, surname and driverRef" restates one answer.

Nothing in either sentence is wrong for BIRD. For τ² retail it instructs the model to name
tables and columns in a benchmark whose questions are a customer asking for a cancellation and
a refund, where no column exists to name. A model following that sentence will write a trigger
about the shape of a query, which is the procedure's register — and that is precisely the state
R54's second refutation exists to distinguish from a distiller that names the situation. The
store R49 measured is the shape this predicts: *"A request of this shape is resolved by calling
find_user, then cancel_pending_order, in that order."*

**What this does and does not claim.** It does not claim the prompt caused R49's or R51's
store: both were built by this same form, and R51's `conditioned 16 of 16` shows the model did
write conditions under it. What it claims is narrower and checkable: the instruction points the
trigger at schema objects, so a store whose p50 stays near zero is explained without appealing
to model weakness, and the next registration has a mechanism to move rather than a
temperature to nudge.

The three other forms already exist and are already used — `procedure` by the public lane,
`lexicon` for definitions, `repair` for accounts — so the τ² lane is not missing a mechanism.
It is passing no form, and inheriting one written for SQL. `buildDistillPrompt` takes the form
as its fourth argument and `createLlmInterpreter` forwards `options.form`; the change is a
plumbing exercise behind a switch of the kind `NoteMode` and `WriteAdmission` already use.

Not implemented before R54's readback, deliberately. Whether this is the next arm depends on a
number that does not exist yet, and shipping a prompt change first would make the readback
unable to say which of two variables moved.

### 34.56 A review read against the repository: six claims, four that did not survive, and a command that never had an input

Two external reviews of this project were read on 2026-11-08 and checked line by line against the
tree they describe. Both are unusually well informed — they quote `prereg/R42-instrument.md`,
`COMPETITIVE.md §5`'s channel asymmetry and the 0.79-versus-1.393 exchange rate correctly — and both
were written at the R49 snapshot, which is five registrations old. What follows is not a scorecard.
It is the four places where their reading and the repository disagree, because each one would have
sent the next iteration somewhere else.

**What they get right, and it is most of it.** The instrument layer has been the defect layer
(§2, §22–§34) while the product layer was clean; the negative effect survived every repair and is a
finding rather than a bug; the exchange-rate arithmetic, not a p-value, is what says the store is
unprofitable; BIRD is a hostile case and the README's largest section is about it; and the
leaderboard comparison was a category error that the documents had already admitted three times.

**Claim 1 — "38% of requests received an empty pack, so the pack is too thin."** This was the
report's second-largest diagnosis and it is an artefact of the floor under test. R49 ran with
`minCoverage 0.01`, and that floor cleared 571 of 1,516 packs by itself; the same run's as-is facade
served 1,435 of 1,527. R51, with the condition-carrying write path, served **1,527 of 1,527** and
averaged **1.222** items per request. So the store is thin — 1.2 items is not a block of guidance —
but the eight-tenths-empty figure was the instrument's own cut, and quoting it as a property of the
distiller is the same error the coverage medians were committed to prevent (§34.53).

**Claim 2 — "the coverage floor cost −4.00pp, which shows the pack cannot be trimmed into
usefulness."** That reading is `UNRESOLVED`, not negative. R49's pair ran 50 tasks at `pass^4`,
where the minimum detectable difference is 13.73pp; `l4-paired` required `delta >= 0` *and*
`p < 0.05`, which that sample cannot produce in either direction. R50 replaced the rule with a
three-state verdict, so a number that cannot decide is now published as undecided rather than as a
loss. A review written against the pre-R50 rule correctly reports what the file said; what the file
said was wrong.

**Claim 3 — "only 9 of 39 gates are reachable on τ², so the gate set is a catalogue."** The count
is 13: R29 stage 2 made the four transfer ids reachable from one cross-domain arm, and the table in
`tau2-gates.ts` has said 13 and 26 for as long as two paragraphs in two files have said 9 and 30.
The review read the prose. **This entry fixes the prose rather than the count** — `gates.ts` and
`tau2-gates.ts` now name the constant instead of a remembered number, because a table that must sum
to `GATE_ORDER` cannot drift and a sentence can.

The larger point the review makes about that count stands and is worse than it says: 13 supplyable
gates, of which 2 are informative. The artefact carries the accounting (`protocol.evaluable`,
`protocol.absent`, `supplyable`, `armIndexed`) and nothing asserts it against a fresh run. That is a
real gap and it is scheduled, not argued.

**Claim 4 — "the memory unit and its position are wrong; move memory to the output side."** This is
the review's central prescription and the nearest external evidence contradicts it. IBM's
ALTK-Evolve tops the τ² retail leaderboard with a **markdown block of natural-language guidelines
appended to the system prompt** — no weights, no fine-tuning, no retrieval — at +10.0pp `pass^4`
(57.5 → 67.5) on retail and +10.0pp (35.0 → 45.0) on airline with 14 support-counted guidelines.
The object it moves is the object every arm this project has run against a bypassed memory says is
negative, on the same benchmark,
the same metric and the same stock scaffold. So "prefix injection is the wrong unit" is refuted as
a general claim; what differs has to be something else, and one difference is measurable:

| Store | learning tasks | items | items per learning task |
| --- | --- | --- | --- |
| ALTK-Evolve retail (lossless) | ~57 | 292 | ~5.1 |
| ALTK-Evolve airline (lossless) | ~50 | 101 | ~2.0 |
| R51 (τ² retail) | 32 | 16 | 0.50 |
| BIRD dev (5 folds) | — | 1,296 | — |

**The fourth row is the one that closes an axis.** Iteration 65 admitted only claims corroborated by
≥2 independent corrections and **0 of 1,296 qualified**; the arm injected nothing on all 350
questions and became the lane's within-run noise floor at +0.29pp. That is not a threshold failing.
It is a corpus in which no claim is ever derived twice, because every question is new: recurrence is
absent by construction, so a mechanism built on recurrence cannot be measured there at all. It is
also the sharpest statement available of why BIRD is a hostile case and τ² is the product lane, and
it is a stronger argument than "problems do not repeat", which was prose.

**What the review found that this project had not.** Three things, in descending order of
seriousness.

1. **`eval:prior` had no failure mode.** It is the command that prices the only position for memory
   this repository has never put a number on — memory judging a candidate rather than proposing one.
   On the committed artefact it printed *this artefact predates the pool field* and exited 0. No
   committed artefact carries a pool: `poc-sota-bird-dev.json` is a two-arm run with no `candidates`
   on any of its 1,534 cases. So the pricing command has never had an input, has never run in CI,
   and has never said so, and every pool-dependent claim — the oracle ceiling, "235 of 350 collapse
   to one answer", the selector rankings — rests on a run whose per-question candidates were not
   committed. That is the one family in the repository that cannot be recomputed from a file, and
   it is the family with the only positive ceiling. The command now exits **2** with `cannot price`
   and distinguishes absence from a nil reading: a pool whose draws all collapsed is a finding and
   still exits 0.
2. **The index contradicted itself in three places.** 13/26 in the table, 9/30 in two paragraphs,
   9/30 in the committed artefact. Fixed in the prose, recorded here, and the artefact stays as it
   is: it is a record of what the index was on the day it ran.
3. **The proposed `V0` gate would not compile and would be circular.** Its sketch reads
   `a.learning.distilled`, `a.tau2.meanPackIds` and `a.provider.acceptsModelName`, none of which are
   fields of `ProtocolGateInput`, and its sixth failure mode is
   `expectedGates(a.lane).filter(g => !a.firedGates.includes(g))` — a gate that reads the lane's own
   index to decide whether the lane fired the gates the index says it can. The index is the thing
   under test. Coverage is a property of the harness, and it belongs to a test over a fresh run, not
   to a gate inside it.

**What was already built, against the review's estimate of what was missing.** The review's first
recommendation was a `V0-instrument-ready` gate with six failure codes, because "R42's three lessons
are not hard assertions". Four of the six are: `provider-probe.ts` classifies a pre-flight probe into
READY / DEGRADED / NO_MEASUREMENT and stops a run before it is paid for; `restModelOf` translates
`deepseek/deepseek-chat` to the endpoint's id and records the stripped alias; `V1` refuses
`meanPackIds === 0`; and `V44` refuses a store of zero items (`stored > 0`), which is the exact
`0 <= 0 + 0` the review cites — that gate was repaired before this review was written. What is
genuinely missing is the **funnel**: corrections → candidates → admitted, and `llmFailed === events`
as a separate treatment. That is now designed (§17.112) around one pure function with three call
sites, rather than six checks scattered across a lane.

**And one recommendation rejected with its reason.** The review proposes an AgentDojo-style
continuous poisoning set. Our poison arms are store-level — a fabricated high-trust rule — while
AgentDojo attacks prompt injection through tool output, which is a surface this library does not
have: it executes no tools and renders no external content. Adopting that suite would measure the
host's injection defences, not this store's isolation. The four store-level attacks the review lists
beside it (progressive poisoning, contradiction flooding, vocabulary smuggling, adaptive attacker)
are in scope and are recorded as P2.

### 34.57 R54 read: every write-path prediction held, the coverage bar did not, and one state hid a readable result

Run `42438746694` on `f25c8b56`, 57 retail tasks at k=4, both arms, retail store.

| Reading | R51 | R54 | Registered bar |
| --- | --- | --- | --- |
| store items | 16 | 20 | — |
| items carrying a condition | 16/16 | **20/20** | ≥ 4 |
| requests served a pack | 1,527/1,527 | **1,951/1,951** | ≥ 75% |
| mean items per request | 1.222 | **1.417** | 1.4–2.4 |
| median rule/query coverage | 4.88% | **8.33%** | **12%** |
| paired `pass^4` | −2.00pp | **+5.26pp** [−8.77, +19.30], p = 0.63 | resolution 20.27pp |

The condition-carrying write path is now doing what it was built for: every servable item states a
condition, every request is served, the pack is denser, and the contact between a rule's text and
the request's terms nearly doubled. It did not reach 12%. R54's second refutation fired on its own
terms — *the conditions exist and do not name the situation* — and the registration says what that
means: the next registration is about the prompt.

The paired delta is the largest positive point estimate this lane has produced and the second
non-negative one — the pre-R50 pair recorded +1.47pp over 68 pairs and failed on `p` rather than on
sign. It is worth exactly what R50 says it is worth: 57 pairs resolve 20.27pp, so +5.26pp
[−8.77, +19.30] at p = 0.63 is `UNRESOLVED`. Recording it as encouragement would be the same defect as recording it as a loss;
neither is a reading. What the ledger does say, and this is a number rather than a direction: of 228
episodes, 42 were informative, 28 repaired and 26 broke — the first time the repair/break split has
been available on this lane at all.

**One state, two subjects, and the state is too coarse.** The verifier returns `ABANDONED`, on the
refutation *the run cannot say what was written*: this artefact predates `storeItems`, so the store's
own text is not in the file. That refutation is correct and it is about the store sample. The
coverage prediction does not depend on it — it is measured from `coverageObservations`, whose
population the verifier itself certified (`2,765 + 0 = 2,765` injected, one population, zero
distiller failures) — so the run cannot certify the write path and can still be graded on what was
delivered. A single terminal state that any fired refutation collapses is honest about the run and
lossy about the evidence.

Two dispositions follow, and they are different on purpose. The run is **ABANDONED for claims about
what was written** and the store text is recorded as not recoverable; the coverage reading is
**graded**, because its population is present and reconciled. That is not a reinterpretation of the
run — it is the distinction the verifier already makes internally between a prediction it cannot
evaluate and one it can. What is missing is a way to say it in one line, and the repair is a scoped
refutation (`subject: store | delivery`) rather than a new state. Recorded as debt, not changed
mid-read.

**What the bar was, and why it stays.** 12% was registered before the run. The reading is 8.33%,
which is one of 12. A bar that moves after the data is not a bar, so it stays where it is and R56 is
written against it — including the clause that if the form moves the trigger and the coverage is
still under 12%, the axis closes.

### 34.58 The task the driver never named, and the recurrence that therefore could not be measured

R55.0's instrument is one integer per item: how many distinct tasks stand behind it. The store
already holds the field that answers this. `EvidenceRef.taskId` exists for exactly this reason, and
its own comment says why — *"support is counted per task, not per event: eight attempts of one task
are one observation by one user"* — and `scoreKnowledge` groups by it.

The τ² driver never set it. Its write path is `host.begin({ task: TASK, input, model, ... })`, and
`RunStart.taskId` is optional and absent there, so every evidence row fell back to `run:${runId}`.
One correction produces one run, so every item's count came out at **1 by construction**, whatever
the store contained. Read through `storeItems`, that is a distribution of ones, and a distribution of
ones is the *first refutation* R55 wrote before the dispatch: *no item reaches `supportTasks >= 2`,
the distiller produces sentences about single episodes and the support mechanism cannot be
transplanted*.

That reading would have been an instrument defect wearing the clothes of a scientific conclusion —
and it is exactly the class of error this project has paid for before (§34.53's verifier that had
never run in CI, §34.54's sample that belonged to the previous experiment).

The repair is one field, and the argument that it is bookkeeping rather than a treatment is that the
store cannot change: the learning half runs one attempt per task (`trials: 1`), so a task id and a
run id group the same rows; `scoreKnowledge` keeps the strongest observation per group, and there is
one observation per group either way. What changes is that a claim derived from two tasks can now be
*distinguished* from a claim derived from one, which is the question R55 asks.

Two guards came with it. `countDistinctTasks(evidence)` is now a kernel export and `distinctTasks`
is defined in terms of it, so the census cannot develop its own grouping while the fusion keeps
another; and `storeItemSample` counts through it, so `supportTasks` in an artefact is the same
number the score used to decide the item was worth storing.

### 34.59 Thirty-nine gates, and not one of them asked whether the machine ran

Every protocol gate graded a number. `V1` passes on one rule per question; `V32` passes on a store
whose every item was quarantined; `V44` passed on `0 <= 0` in R41 while the distiller had failed on
all thirty-two corrections. Three published rounds were read as "the mechanism does not work" when
the stage that had failed was upstream of every gate the report carried, and one was read as "the
store is thin" when the write path had refused every candidate.

The missing question is not subtle and it is not scenario-specific: *did anything come out of each
stage?* It is now `V0-instrument-ready`, the fortieth gate and the only one whose subject is the
pipeline. Its input is five counts — corrections, candidates, admitted, stored, servable — plus the
refusals and failures that explain a narrowing, and it grades two things:

| condition | reading |
| --- | --- |
| every stage is non-zero | a zero locates the break, and the sentence names which stage stopped |
| `admitted <= candidates`, `stored <= admitted`, `servable <= stored` | two counts taken over different populations are an instrument defect, not a surprise |

It is blocking, because a run whose funnel is broken has no reading to publish — and it is *absent*
rather than green on the twenty existing artefacts that predate the field, which is the rule this
protocol has applied since stage 2: a gate that cannot fire is a line in the report, not a silent
pass.

τ²'s index moves with it: 13 supplyable → 14, 26 arm-indexed unchanged, 39 gates → 40. The eight
gates below `V1` all grade a number; this is the first that grades the machine.

### 34.60 The count in the CI script had drifted from the count in the table

Adding the fortieth gate turned three thousand three hundred and nineteen local tests green and the
build red: `.github/workflows/ci.yml` carries an inline τ² conformance script whose assertions are
literals — `['thirty-five are absent', a.protocol.absent.length === 35]`,
`['thirteen supplyable', a.protocol.supplyable === 13]` — and the artefact now reports 36 and 14.

The same two numbers appear in `tau2-gates.ts`'s header table, in `l4-pair.ts`'s published sentence,
and in three registrations. Every one of them was written by hand. This is the second time this
repository has caught itself quoting a table it had moved — `gates.ts` carried "9 supplyable, 30
arm-indexed" for as long as the table had said 13 and 26 — and the pattern is the same both times:
**a number that appears in three places drifts in two of them.**

Two repairs, of different kinds. The immediate one updates the five sites. The structural one makes
the document a *projection*: `packages/eval/src/gate-matrix.ts` renders one row per gate, in
publication order, from the two tables and from the gates the last published BIRD artefact actually
carried — a measurement rather than a capability, because a type being able to supply a field is not
evidence that a run supplied it. The guard that matters is the one that refuses to omit a gate the
protocol publishes, and the source is injectable so a test can hold that guard instead of a comment
holding it.

The CI literals stay literals. They are the check that a lane's own artefact agrees with the
protocol, and a check that reads its expectation from the thing it is checking is not a check.

### 34.61 The pack is recorded without the episode it was served to

Every recall observation the τ² driver writes carries three fields — `query`, `statements`,
`documents` — and none of them says which task or trial the request came from. The omission is
invisible in every reading the lane has published so far, because all of them are pack-level (how
many items, how much overlap, how often empty). It becomes decisive the moment a question is asked
about a *rule* rather than about a pack: to say "this item broke that episode" one has to join an
observation to an outcome, and the join key is absent.

The pipeline makes it expensive to add. `useObservations` is filled at the facade boundary in
`tau2-driver.ts`, where the request arrives as a query string; the caller is
`microglia_agent.py`'s `recall(text)`, a module-level function with no task context; and the
episodes run at `max_concurrency: 4`, so an environment variable set per task would be read by the
wrong call. The one place the context exists is upstream's `run_tasks`, which constructs a
simulation — and an agent — per task and trial, and whose agent factory signature this repository
does not currently touch.

Two consequences, and they are different in kind.

**R57's design changed because of it.** The natural experiment for memory's negative effect is
retrospective: attribute each lost episode to the items in its pack, and read the items' coverage
against their credited harm. That experiment is not runnable here, and even with the join it would
be confounded — an item is retrieved *because* it resembles the question, so the population it is
credited over is selected by the same similarity that is supposed to explain the effect. R57 plants
its items instead (a controlled distractor at a measured coverage level), which is causal and costs
four arms.

**The repair is a contract question, not a formatting one.** Passing `task` and `trial` on the recall
request means either the agent knows its task (upstream API, unverified here) or the facade
correlates requests to episodes by time and order (unreliable under four-way concurrency). Writing
the first without reading upstream's constructor would be a guess, and a wrong guess would produce
observations labelled with the *previous* task — a defect that reads as a finding. Recorded as debt
with the two candidate paths named, rather than implemented mid-flight.

### 34.62 The projection dropped the three fields the dispatch was sent to read

R56 registered one variable and four predictions, and two of the four are about text: the share of
admitted conditions naming a tool, and whether any tool name reaches a rendered pack. The driver
wrote both subjects — `storeItems` with each item's condition, `distillForm` with the form and the
tool inventory, `injectionNote` with the sentence every pack opened with — and
`armRecordFromDriver`, the function that projects the driver's raw record into the arm record,
carried none of them.

The artefact came back `distillForm: null`, `storeItems` absent, `injectionNote` absent, and looked
complete. That is the property that makes this defect worse than a crash: nothing in the file said a
field was missing, and the two predictions that could not be graded were the two the registration was
written for. `funnel` was added by the same iteration and *was* carried, which is how the loss
survived review — the diff that introduced the projection showed a field being added.

The repair is three `...(x === undefined ? {} : { x })` entries and a test that fails against the old
function, written before the fix. The narrower lesson is that a projection with a hand-written field
list loses silently whenever the source grows. The wider one is that two shapes of the same record
existed as inline object literals in `Tau2Raw` and as a second inline literal in the artefact writer,
so neither the reader nor the writer could be checked against the other; `DistillFormRecord` and
`InjectionNoteRecord` are named types now, and the projection is exhaustive over them.

The R56 artefact in the record cannot be repaired by this. Its fields were never written, and the run
is `NO_MEASUREMENT` on the two text predictions — R56's own fourth refutation, which it wrote before
the dispatch: *"If the artefact cannot say which form ran, two runs of one form would read as one
experiment of two, and the run is `NO_MEASUREMENT`."* The registration anticipated its own instrument
failure and the failure fired.

### 34.63 R56 read: the form halved the yield, and the guard that fired was the store

What survives the missing fields is enough to locate the loss, and it is not where the registration
expected.

| Reading | R54 (`lesson`) | R56 (`procedure`) | The bar |
| --- | --- | --- | --- |
| learning rows | 32 | 32 | — |
| corrections the driver could distil | 10 | 8 | — |
| candidates distilled | 20 | 8 | — |
| **candidates per correction** | **2.00** | **1.00** | — |
| store items | 20 | **8** | ≥ 12 |
| requests served a pack | 1,951 / 1,951 | 1,869 / 1,869 | ≥ 75% |
| items per request | 1.417 | 1.597 | — |
| median rule/query coverage | 8.33% | **6.25%** | **12%** |
| delivered-pair median | 8.33% | 2.17% (1,309 of 2,984 at zero) | — |
| paired `pass^4` | +5.26pp [−8.77, +19.30], p = 0.63 | **−8.77pp** [−22.81, +5.26], p = 0.36 | resolution 20.27pp |

Two terms moved together and only one of them is the treatment's fault. The correction count fell
from ten to eight across two dispatches of the same 32-row learning fold: corrections are produced by
the model at run time, so "same corrections" — which R56's own text lists among the things it holds —
cannot be held across dispatches and was not held here. That is a defect in the registration's design
and it is recorded as one. But it accounts for a fifth of the loss. The other factor is the yield:
`procedure` produced **one** candidate per correction where `lesson` produced **two**, and that is
the form's own behaviour, measured on the same instrument.

The coverage reading is the one that decides whether the trigger moved, and it fell. The obvious
confound — a smaller store has less to offer — runs the other way. With eight items and 1.597 served
per request, a pack drew **20.0%** of the store; with twenty items and 1.417 served, it drew **7.1%**.
A pack that serves a fifth of its store should overlap a query *more* than one that serves a
fourteenth of a larger one, and it overlapped less. So the drop from 8.33% to 6.25% cannot be read as
pool depletion; it points at the items themselves being less term-overlapping with the question. The
registration's own refutation — *"if coverage rises but `pass^4` moves down by more than the
resolution, the more topical trigger is buying relevance at the cost of the answer"* — did not fire,
because coverage did not rise.

Three of R56's four predictions are therefore decided, and none of them in the registration's favour:

| Prediction | Bar | Measured | State |
| --- | --- | --- | --- |
| median coverage | ≥ 12% | 6.25% | **failed**, and moved the wrong way |
| ≥ 12 items admitted | 12 | 8 | **failed**: the guard that was meant to catch a halved store caught it |
| tool-name share falls ≥ 20pp | needs `storeItems` | lost to 34.62 | `NO_MEASUREMENT` |
| no tool name in any pack | needs `storeItems` | lost to 34.62 | `NO_MEASUREMENT` |
| `pass^4` reported | — | −8.77pp, p = 0.36, 1,869 packs | `HARM`; **R45 reverts** |

The revert is mechanical and needs no p-value, which is why the lane's HARM branch does not ask for
one: *"l4-paired −8.77pp is below the −5pp bar with 1869 served packs; significance is not required on
this branch; revert on the reading."* The default form goes back to `lesson`, and `TAU_DISTILL_FORM`
replaces the constant so a later registration can ask about the form again without editing the lane.

What R56 does **not** establish: that `procedure` is worse than `lesson` for this lane, in general.
It establishes that this dispatch of it — at eight corrections, one candidate each, on this fold —
was worse by more than the lane's harm bar, and that its store was a fifth the size of the arm it
replaced. The axis is closed for `procedure` as registered. It is not closed for "a prompt that names
the situation rather than the tool", which is what the next registration would have to say
differently.

### 34.64 The readback read its verdict from a field no arm writes

Grading R56 exposed a second, older defect, in the tool rather than in the lane.

`r54_readback.py` and `r56_readback.py` both read `artefact["verdict"]`, and both carry a refutation
phrased *"the memory costs accuracy and the revert rule fires"*. No arm artefact has that field. An
arm is written by one arm's driver, which cannot see the other arm; the verdict and the paired delta
are written into `poc-l4-pair.json` by the pairing step. The field exists only on the synthetic
artefacts the verifiers' own self-tests build.

So the one refutation that decides whether R45 reverts a treatment could never fire on real evidence,
and its sibling prediction — R54's *"no revert branch fires: the memory does not cost accuracy"* —
evaluated `state != "HARM"` against `state = None` and passed. **A check that passes because its input
is missing is worse than no check, because the report says `PASS`.**

Repaired by moving both readers to `eval/verifiers/_pair.py`: the pair file is the source, `--pair`
defaults to the first `poc-l4-pair.json` found under `--dir`, and an absent verdict now reads `n/a`
rather than `PASS`. R54 re-read with its pair file keeps its state — `ABANDONED`, on its own
instrument refutation — and its revert prediction now passes on `verdict UNRESOLVED` instead of on
`verdict None`.

The same iteration found the third defect, in `r56_readback.py`'s own control flow: it returned
`NO_MEASUREMENT` at the missing form *before writing down a single reading that had survived*, so the
record of R56 held no HARM, no coverage, no funnel and no yield. A run whose one defect was a dropped
field was then dropped from the record by the tool built to keep it. `readings()` now takes every
reading the artefact still supports before any state is decided, and five self-test cases name the
readings that must survive an ungraded state — the same five fail against the old control flow.

The pattern across 34.62, 34.63 and 34.64 is one pattern: **each of the three was a loss that left no
trace.** A projection that omits a key, a check whose input is absent, a verifier that returns before
it reads. None of them raises, and all three produce a file that looks like a measurement.

### 34.65 The fortieth gate was absent on every pair the lane ever wrote

`V0-instrument-ready` was added this iteration and its subject is the funnel. The driver records the
funnel, `Tau2ArmRecord` carries it, `tau2ProtocolInput` consumes it, and every pair artefact the lane
has published reports it **absent** — including R56's, which was dispatched after all three of those
were in place:

```
absent  V0-instrument-ready  needs "the lane's own record, which this run did not carry: the counts
                                    from a correction to a servable rule, so a zero can be located"
```

The funnel was in that run's memory arm. The sentence is false about the run and true about the code.

The cause is the lane's *second* hand-written projection. `tau2ArmRecordOf` is the only bridge from
an arm's artefact file to the record the protocol gates read; `tau2ProtocolInput` never sees a file.
Both `tau2ArmRecordOf` and the `Tau2ArmArtefact['tau2']` type it projects from omitted `funnel`.
Adding the field to `Tau2ArmRecord` and to the gate's input type therefore did nothing at all: the
two ends were wired and the bridge between them was not.

Three things make this worse than a plain omission.

**The failure mode is silent and the gate still speaks.** V0 did not fail. It reported `absent`, and
`absent` in this protocol means *this run did not measure it* — a statement about the dispatch. The
gate's own vocabulary launders a plumbing defect into a fact about the experiment.

**It is the same class as 34.62, one layer up, one interval later.** The driver's projection lost
three fields; the pairing projection lost one. Both are hand-written field lists between two shapes,
and both produce an artefact that reads as complete. The compiler guard added in 34.62 covers
`Tau2Raw -> Tau2ArmRecord`; this is `Tau2ArmArtefact -> Tau2ArmRecord`, a different pair of shapes,
and it had no guard.

**A blocking gate that cannot pass is a sentence nobody reads** (WHITEPAPER 3.6.57). V0 blocks. Had
it not been read back for eighteen hours, the lane would have carried a permanently-red blocking gate
whose only defect was that nothing carried its input — and the natural repair, applied in a hurry,
would have been to stop blocking on it.

Repaired red-first: two tests assert the projection carries the funnel and that `tau2ProtocolInput`
reports it supplyable when present and not when absent. Re-run on R56's real artefact, V0 reads

```
8 correction(s) -> 8 candidate(s) -> 8 admitted -> 8 stored -> 8 servable (0 refused, 0 failed)
```

and passes, blocking. A third test holds the projection's *scope*: `writeAdmission`, `storeItems`,
`distillForm` and `injectionNote` stay out, because they are readback subjects rather than gate
inputs, and a second copy of a field is a copy that drifts.

The R55.0 dispatch was cancelled at seventeen minutes and re-dispatched from the fix. A pair artefact
whose blocking instrument gate says `absent` is not a record worth keeping, and the rule that a
published artefact is not revised after the readout leaves cancellation as the only honest repair.

### 34.66 A switch no dispatch can set has exactly one value

R53's entire treatment is one environment variable. `TAU_INJECTION_NOTE` selects the sentence a
knowledge pack opens with, at three levels; the driver resolves it through `resolveInjectionNotePlan`,
which refuses an unknown spelling; three tests cover the resolution; and the artefact records both the
level and whether it was *declared*, because `standard` is at once the default and one of the arms.

No workflow passed it. The switch existed, defaulted to `standard`, and no dispatch could move it. A
registration whose single variable is unreachable is not a registration — it is a run of the default
arm with a document describing three.

R56's `TAU_DISTILL_FORM` was the same shape one iteration earlier, and the audit that found these two
found three more in the same sweep:

| Variable | Read by | Reachable from a dispatch |
| --- | --- | --- |
| `TAU_INJECTION_NOTE` | `injection-note-plan.ts` | **no** — R53's treatment |
| `TAU_DISTILL_FORM` | `tau2-register.ts` | **no** — R56's treatment |
| `TAU_SEED` | `tau2-driver.ts` (recall draw) | **no** |
| `TAU_MAX_CALLS` | `tau2-driver.ts` (per-run budget) | **no** |
| `TAU_WRITE_ADMISSION_THRESHOLD` | `write-admission-plan.ts` | **no** |

`TAU_SEED` is the one that should have been caught years earlier. It seeds the recall draw, which
decides the pack order, and the workflow sets a *different* seed (`TAU_EVAL_SEED`, the evaluation
draw) while leaving this one at 7 forever. Two runs that differ only in their pack order were
therefore indistinguishable from two runs of one configuration — the same defect R53's third
refutation names about note levels, sitting one layer down and unremarked.

The repair is in two parts, because the finding is a class rather than five instances.
`scripts/audit.mjs` now collects every `TAU_*` the source reads, excluding tests, and fails on any
name no workflow mentions; three names are allowlisted one at a time with a reason (`TAU_PYTHON`,
`TAU_WORKDIR`, `TAU_REFERENCE` are local conveniences a test or a hand-started pairing run sets),
because a pattern-based exemption would swallow the next real switch. The guard was written first and
failed on exactly those five names and nothing else. Then all five are wired from repository variables
in both arms, unset meaning empty meaning the default the lane has always run — verified against each
parser rather than assumed: `resolveInjectionNotePlan('')` is `standard`/`declared: false`,
`resolveDistillForm('')` is `lesson`, `Number('') || 7` is 7, `Number('') || 400` is 400, and the
threshold's own empty branch returns no options.

The structural lesson is the one the workflow's own comment already carried about `template` and
`sample_temperature`: *a knob nobody sets from the menu is a knob whose default is the only value it
ever has*. That comment accepted the situation for two knobs and did not check whether anyone else was
in it. A repository variable is reachable; a dispatch input is visible; a bare `process.env` read is
neither, and only a machine can tell them apart.

### 34.67 The census that two callers computed and one kept

R53's fourth prediction is that *a licence to disregard a rule must not become a licence to stop
acting*. Its subject is the abstention census: per task, how many trials the agent never called a tool
in. `evaluateFacade` builds one for every facade it runs.

R49's paired-facade path puts its copy into `observedPair.inaction`, with both facades' censuses and
the contrast between them. The single-facade path — which is every dispatch since R49 unless the
paired facade is switched on — assigned it to a local, returned it in `FacadeEvaluation`, and then
never wrote it. Three thousand three hundred tests were green over a field that one of two callers
silently dropped.

This is the third instance of the same class in one iteration, and the first one that is not a
projection. 34.62 was a mapping that listed its fields by hand and omitted three; 34.65 was a second
mapping between two other shapes; this is a caller that consumed four of five fields from a struct it
owned. The thing they share is not "a projection": it is that **the field had exactly one live reader
and one dead one**. R49's switch is off by default, so the dead path was the one every artefact took,
and the live path was the one the tests happened to exercise.

The repair used the guard added in the same iteration, and that is worth recording as a result in
itself. Declaring `inaction` on `Tau2Raw` made `PROJECTION` fail to compile until the field was given
a decision — the guard doing its job on a field that did not exist when the guard was written. Giving
it `carried` then made the generic *"carries every field it says it carries"* test fail until the
mapping caught up. Two red states, neither of which needed a person to remember anything.

The driver now writes `primary.inaction`, and the paired path is untouched.

One consequence is recorded rather than repaired. The paired path's census and this one are now two
copies of one fact in the artefact — `observedPair.inaction` and `tau2.inaction` — and a reader must
know that the first is the contrast between two facades and the second is the graded facade's own. A
single field with two shapes would be worse; two fields with one name each is the compromise, and the
next iteration that touches the paired facade should consider whether the contrast belongs beside the
census rather than in a sibling block.

### 34.68 A registration whose control its own dispatch cannot satisfy

R53's first refutation is a control: *if the three arms' delivery censuses are not identical, the
experiment varied more than the note and is abandoned*. It is the right rule — a note-level comparison
is worthless if the arms differ in anything else — and it cannot be satisfied by any arrangement of
three dispatches.

Two dispatches of one configuration differ in their corrections, because the model produces them at
run time. R54 and R56 ran the same 32-row learning fold, the same scenario pair, the same note and the
same recall, and distilled from **ten** and **eight** corrections respectively, producing 2,765 and
2,984 delivered pairs. A three-dispatch R53 would therefore differ in its store, and the first
refutation would fire on every attempt.

The code says the same thing more directly. `note: NOTE_PLAN.mode` is passed to `openMicroglia`: the
level is a property of the host, and R49's two facades deliberately share one host — which is why the
paired-facade pattern cannot carry three notes without a change either. So the treatment is not
reachable by a switch even now that `TAU_INJECTION_NOTE` is wired (34.66), and the wiring was necessary
and not sufficient.

R53 is listed as "dispatchable after R55" in the roadmap and it is not. It is blocked on a capability:
the note has to become a rendering option of one recall, and the three levels have to run as three
facades over one store, one learning phase and one seed. This is R49's pattern generalised from two to
three, and the reason it is the right generalisation is that it makes the refutation checkable —
*within one run over one store*, the items a pack carried for a given request are comparable to the
digit, while the number of requests the agent chose to make is reported per arm instead of asserted
equal.

Two things are worth separating here, because conflating them is what produced the defect.

**A control that is stated as an equality between runs is a control nobody can pass.** Stochastic
components make equality across dispatches impossible in a way that no amount of care fixes, and the
registration was written by someone who had just spent two iterations reading cross-dispatch
differences. The rule that would have caught it: *a control must be checkable within one artefact or
within one run*, and if it cannot be, the treatment is not within-run either.

**The repair happened before the dispatch, and that is the cheapest kind.** R53's header was repaired
once already, for the same family of defect (a header describing the previous experiment), and R54's
was too. Three repairs to two registrations before either ran is a rate worth naming: the cost of a
bad registration is now paid in a paragraph rather than in three two-hour dispatches and an ABANDONED
artefact nobody can reuse.

### 34.69 The annotation competed with the thing it annotated

The note is an attribute of the wrapper, and the wrapper is charged to the character budget
(`overhead = open.length + close.length + 1`, `used` starts at `overhead`). So a longer note buys
itself room by dropping rules. The `hardened` sentence is about 110 characters longer than the
`standard` one, which at a 1,200-character budget is one rule and at a tight budget is the last rule
and then the only rule: with eight items and a budget of 320, the `standard` arm carried one item and
the `hardened` arm carried **none**.

That is not a sentence differing between two arms. It is a sentence *and a pack*, and R53's first
refutation — the three levels' delivery censuses must be identical to the digit — would have fired on
exactly the confound it was written to detect, from the only direction it cannot diagnose. The run
would have been abandoned for a reason that had nothing to do with the note, and the abandonment would
have been honest and useless.

The defect was found by a test written before the fix, in the same hour the three-level capability was
being built, which is the only reason it cost a paragraph instead of three two-hour dispatches. The
test asserts the invariant rather than the example: for every budget from 320 to 1,600 in steps of 17,
the three levels carry the same ids.

`RenderOptions.budgetBasis` separates the two accounting rules:

| Basis | What the budget covers | Why it exists |
| --- | --- | --- |
| `note-included` (default) | the wrapper, note and all | every committed artefact was produced by it; an upgrade must not change what a published number measured |
| `note-excluded` | the block's data, counting the wrapper as if it carried no note | three levels then have identical capacity by construction, so the arm varies one sentence |

`note: 'none'` renders exactly the note-free block, so under `note-excluded` the original guarantee
survives verbatim — what is rendered never exceeds the allowance — and a test holds that too. The one
thing that changes is stated rather than hidden: under the new basis the *rendered block* may exceed
`budget` by the note's length, and `tokens` reports the whole block as it always did.

### 34.70 The fifth loss with no trace, and it happened while the guard was being written

`facadeNotes` was added to the pre-registration header as a known key, parsed, validated against its
two legal values, cross-checked against `facadePair` for the two-variable refusal — and then not
returned. The `Prereg` object literal lists its fields by hand, and the new one was not in it. So
`eval:prereg-notes` printed `false` for a registration whose seventh line says `facadeNotes:
three-level`, the workflow would have read `false`, and the dispatch would have run the single-note
path while its own artefact and its own registration said three levels.

This is the same class as 34.62, 34.64, 34.65 and 34.67: a value that is read, checked, and never
travels. The four previous instances were found by reading readbacks; this one was produced by the
person writing the guard against them, in the same commit, which is the useful part of the record —
the failure mode is not a lapse of attention, it is what a hand-written mapping between two shapes
does by default.

The repair is a test on the *return value* rather than on the parse: `readPrereg(...).prereg
?.facadeNotes` must equal `'three-level'`. The parse-level assertion is the one that would have
passed. Three other cases hold the rest: an absent key stays `undefined` (every pre-R53 registration),
an unknown value is refused, and the pair-plus-three-level combination is refused with the reason.

The general form still stands as a review target, and now has one more concrete rule: **a parser's
own object literal is a projection, and every projection in this repository has either a compile-time
decision table or a test over the field that was added last.**

### 34.71 Nothing recurs, exactly as the registration predicted, and the prediction is the finding

R55.0 was dispatched to measure rather than assert a structural claim: that in this lane no item can
reach support 2, because every item derives from exactly one user correction and every correction
comes from a different task. The reading is the distribution, and it is `{1: 7}` over seven items.

| Prediction (written before the dispatch) | Reading |
| --- | --- |
| at least 2 of the sampled items reach support 3 | **0 of 7** |
| at least 25% reach support 2 | **0 of 7 (0.000%)** |
| the store stays under 40 servable items | 7 servable — holds |
| items at support 2 name a tool 15% less often | not measurable: there are no items at support 2 |
| the run is the registered trial count | k=4, 57 tasks — holds |

The refutation fired — *nothing recurs: no item reaches support 2, so the grain is one claim per
correction* — and the state is `ABANDONED`. This is the one case in the last ten iterations where
abandoning is the deliverable: the prediction was "this mechanism cannot run here", it was written
before the dispatch, and it held exactly.

Two consequences, and the second is the expensive one.

**R55.1 is not runnable.** Admission at `supportTasks >= 3`, with the same store construction, the
same recall and the same note, would admit nothing at all — the floor would be above the population's
maximum. That is now a fact rather than a suspicion, and the registration is closed rather than
re-parameterised.

**The unit is the constraint, not the rule.** IBM's `sup3` arm admits a guideline after three distinct
learning tasks and keeps ~5 guidelines per learning task; their unit is a *task trajectory*, successes
and failures together. Ours is one sentence of one failure. A mechanism whose admission rule counts
derivers cannot be transplanted onto a unit that never has a second deriver, and no threshold moves
that. The next registration is therefore about the object distilled — one task trace rather than one
correction, with consolidation across the learning set so a claim that recurs in three traces *can*
reach support 3 — which is what R56's own second refutation was pointing at from the other side.

### 34.72 R56's premise does not survive its own repair, and the ban was the fix

R56 changed the distiller's form from `lesson` to `procedure` because R54's `lesson` store wrote its
conditions in the procedure's register, naming the tools the agent had called. It also added a
host-side ban that refuses a candidate whose statement or condition names one of the split's action
names. The form change cost **−8.77pp** and was reverted under R45. The ban stayed.

R55.0 ran `lesson` **with the ban** and 1,921 delivered packs later:

| Reading | R54 (`lesson`, no ban) | R56 (`procedure`, ban) | R55.0 (`lesson`, ban) |
| --- | --- | --- | --- |
| store items | 20 | 8 | 7 |
| candidates refused | — | — | **9 of 16** |
| tool names in the store | the premise of R56 | — | **0 of 7** |
| packs carrying a tool name | — | — | **0 of 1,921** |
| coverage p50 | 8.33% | 6.25% | 7.14% |
| items served per request | 1.417 of 20 (7.1%) | 1.597 of 8 (20.0%) | 1.577 of 7 (22.5%) |
| paired `pass^4` | +5.26pp (p=0.63) | **−8.77pp** (p=0.36) | **+10.53pp** (p=0.21) |

So the ban alone removes the tool names — nine candidates refused, zero surviving — and the form
change was not needed for the purpose it was introduced for. That is not a claim that `procedure`
would have been harmless under a different design; it is a claim about this one: R56 varied two things
by accident, one of which was doing the work.

**What the ban costs is still open, and R56's first refutation still stands.** Nine of sixteen
candidates refused is a store half the size, and the surviving conditions share a median 7.14% of the
request's terms — below the 12% bar the registration that introduced the ban set for itself. The
conditions are in the user's register now ("A single request bundles multiple modifications to the
same pending order"), which is what R51 asked for, and they are still not the request's words. A trace
as the distillation unit is the shortest route to conditions written in the *user's* phrasing, because
a trace is what contains that phrasing.

**The number, and what it is not.** The memory arm read `pass^4 = 64.91%` against the reference arm's
`54.39%`: **+10.53pp paired [−3.51, +24.56], p = 0.210, n = 57**, and the sample resolves 19.66pp, so
the verdict is `UNRESOLVED`. It is the largest point estimate this lane has produced (R54 +5.26pp,
R56 −8.77pp) and it is not a result. The one thing it does establish is that the lane is not
structurally unable to show a benefit: a 10.5pp paired difference on 57 tasks produces 11 gained
against 5 lost, and the sample that could resolve it needs roughly four times the tasks.

### 34.73 The unit was one sentence, so no threshold could move it

R55.0 asked whether anything in the store recurs and read `{1: 7}`: seven items, one task behind each.
R56 asked whether the conditions were written in the request's register and found they were not, that
the tool-name ban was the fix, and that the fix halved the store. Both registrations named the same
next question in their own text — *the object being distilled* — and R58 is the iteration that changes
it rather than the prompt around it.

**What was actually missing.** `taskCorrection` renders one failed learning task as one sentence
(*"a request of this shape is resolved by calling `find_user`, then `cancel_pending_order`, in that
order"*), the event carries that sentence, and the model writes one rule from it. The trajectory the
agent walked was in the run document the whole time, under `simulations[].messages`, and no reader in
this repository had ever opened it. A trace contains what a sentence cannot: what was attempted, in
order, beside what the reference does. The *difference* is the lesson, and it is only visible when
both sides are in front of the reader.

The published competitive arm (`sup3`) admits a guideline after three distinct learning tasks. A store
built one sentence at a time cannot reach that by lowering a threshold, because every item's evidence
is one task; the threshold is above the population's maximum. That is why R55.1 was closed as *not
runnable* rather than as *failed*.

**What the iteration built, and the four defects found while building it.** The unit (`tracesOf`,
`traceOf`, the `trace` form), the pass (`consolidateKnowledge`), the record (`distillUnit`), the gate
(`l4-support-recurrence`) and the readback (`r58_readback.py`, twelve self-test cases). Each of the
defects below was found by a test written before the code, or by a coverage line that refused to
close:

| Defect | What it would have done |
| --- | --- |
| `claimOverlap` returned 1 for two *empty* token sets | two statements made only of stopwords merged into one item and the census reported a corroboration no task contributed. Two claims with nothing in them are not evidence that they are the same claim; the function returns 0 now and the case has its own test |
| `detailOf` dropped a scalar or unparseable argument, rendering only the name | the call's payload vanished from the trace, which is the same class of loss as a truncated attempt reported without its count. A non-JSON argument string is now rendered as what it was |
| `arguments: null` collapsed to `undefined` before the null check (`??`) | the `args === null` branch was unreachable code inside a function written the same hour, and a coverage report would have called it tested. The branch is gone |
| the union-find carried a path-compression loop | a union always attaches a root to a root, so within one pass a chain is at most one deep; the loop was unreachable. Removed rather than tested — a line that cannot be reached is a line that claims to be covered |

Two more, of the shape this file has recorded five times already:

- **`Correction` carried the reference calls and dropped the rubric.** A trace's second half is what
  the task *promised*, and for the 7 of 164 tasks that state a rubric and name no calls the promise is
  the only half there is. The trace arm would have shown the attempt and half the target.
- **`retained` was arithmetic (`considered - merged`) rather than a count of survivors.** A survivor
  whose re-scored confidence retired would have left the census disagreeing with the distribution
  printed beside it — and the gate that checks exactly that reconciliation would have fired on a
  correct merge.

**Why one variable and one dispatch.** The treatment is the unit; the consolidation pass has a control
*inside the same run* — `supportBefore` and `supportAfter` over one store it read once, which is how
R49 reads two floors over one store. A second dispatch would distil a second store, and the difference
would be the store's, not the pass's. The grouping is lexical and deterministic (Jaccard over content
terms, floor 0.7) rather than embedding-based for the reason the write-side admission never became the
lane's only path: a merge decided by a cosine is decided by the model that produced the vectors, and
the run that reads the census could not reproduce it. The embedding backend's quota exhaustion made
that a practical constraint as well as a principled one.

**What is registered, and what it costs.** `prereg/R58-trace-unit.md`, written before the dispatch:
at least one item reaching support 3, at least 25% reaching support 2, at least half the store kept,
median non-zero coverage at or above 12%, and at least 80% of corrections carrying a trace. The cost
is at most three distillation calls per correction where there was one — 96 against 32 — and the pass
itself spends no model call at all.

**The instrument, recorded rather than inferred.** `distillUnit` carries the unit, the traces read, the
corrections that carried one, the claim count and the census. The gate `l4-support-recurrence` blocks
rather than warns when a trace arm's two distributions do not sum to the populations it reports, and
the driver refuses to run at all when the learning document carried no trace — because that run would
report the *control's* store under the *treatment's* name, which is the one failure mode this lane has
already paid for twice.

Coverage after the change, every dimension: **99.96 lines / 99.68 branches / 100 functions / 99.96
statements**; `consolidate.ts` and `tau2-trace.ts` are 100 on all four. 3,454 tests over 166 files.

### 34.74 The unit worked, and the pass could not see that two claims were one

R58 is read (`42476580076` on `9ad59e96`, memory arm then reference, `prereg/R58-trace-unit.md`).
Two refutations fired, three predictions failed, and the iteration is `ABANDONED` on its own terms —
while the thing it was built to change did change, and the reason the pass stayed inert is a
measurable property of the measure rather than of the mechanism.

| Prediction | Reading |
| --- | --- |
| ≥ 1 item reaches support 3 | **0 of 15** |
| ≥ 25% of items reach support 2 | **0 of 15** (0.0%) |
| the pass keeps ≥ 50% of the store | **15 of 15** |
| median non-zero coverage ≥ 12% | **8.33%**, over 4,000 pairs |
| ≥ 80% of corrections carry a trace | **7 of 7** (100%), 32 traces read |
| the run is the registered trial count | k=4, 57 tasks |

Refutations: *nothing recurs* **FIRED** (`{1: 15}`), *the pass is inert* **FIRED** (0 groups over 15
items), *the pass bought support by halving the store* clear. `l4-support-recurrence` passed: the
census reconciles, so the two zeros are about the store and not about the instrument.

**What the unit did do.** Seven corrections produced **fifteen claims** — 2.14 per trace against 1.0
by construction — and the register moved. The store's conditions are in the requester's words
(*"The user asks to update stored details but declines to repeat them, saying they are already on
file."*), the tool-name ban **refused nothing** (R55.0: 9 of 16), and no statement names a tool. The
`trace` form's constraints held without the host ban having to fire, which is the first dispatch in
this lane where the prompt did the work the ban was added to do.

| Reading | R54 (`lesson`) | R55.0 (`lesson` + ban) | R58 (`trace`) |
| --- | --- | --- | --- |
| corrections | 10 | 7 | 7 |
| claims | 20 | 16 | **15** (2.14/trace) |
| candidates refused by the ban | — | 9 of 16 | **0 of 15** |
| items stored | 20 | 7 | 15 |
| coverage p50 | 8.33% | 7.14% | **8.33%** |
| items per pack | 1.417 | 1.577 | **2.000** |
| paired `pass^4` | +5.26pp (p=0.63) | +10.53pp (p=0.21) | **+1.75pp** (p=1.00) |

**Defect one: the registration's population was wrong, and the error is mine.** It says *"32
corrections, so at most 96 distillation calls against 32"*. The run had **32 learning tasks and 7
corrections**: the learning half's model passes 25 of 32 tasks at one trial, so `learnableCorrections`
sees 7 failures. Every number in the registration that multiplied by 32 — the cost, the expected store
size, and the implicit assumption that a claim recurring in three traces was reachable — was computed
on a population that does not exist. The trace reader still found all 7 (100% traced), so the arm is
*measured*; the population the mechanism needs was simply smaller than the document claimed. The
general form is the one this file keeps recording: a number that travelled from an earlier run's
description into a registration without being recomputed from *this* run's artefact.

**Defect two: the consolidation measure cannot see a paraphrase of a long sentence.** The store holds
two items that are one claim:

> *"When a request bundles several changes, carry out every requested change in the order the requester
> stated them, **and do not stop after the first one succeeds**."*
> *"When a request bundles several changes, carry out every requested change in the order the requester
> stated them, **and stop once all are applied rather than adding extra lookups or calculations**."*

Their Jaccard overlap is **0.483**, and the threshold was 0.70, so the pass skipped them before it
looked at their conditions. Across all 105 pairs in the store: median 0.081, p90 0.188, **maximum
0.483** — and the maximum *is* the true duplicate, while the next-highest pair (0.250) is two
different claims ("apply the change to every affected order" versus "finish one order before fetching
the next"). No Jaccard floor can separate them: the true pair sits below any value that would keep the
false one out.

Containment — `|A ∩ B| / min(|A|, |B|)` — puts the same pair at **0.700** and the false one at
**0.533**, a 0.167 gap, and a floor of **0.60** merges exactly the true pair and nothing else. That is
the measure whose scale matches the object: two statements that share their whole premise and differ
in a trailing clause are one claim said with an extra caveat, and Jaccard charges the extra caveat
twice because it grows both the intersection's denominator and the union's.

**The pair, and a control that moved more than the treatment.** Memory 64.91% against the reference
arm's **63.16%**: **+1.75pp paired [−14.04, +15.79], p = 1.000, n = 57**, 10 gained against 9 lost,
`UNRESOLVED`. R55.0's reference arm on the same split read **54.39%**. Two dispatches of the
*memory-free* configuration, differing by nothing but the run, differ by **8.77pp** — larger than
every treatment effect this lane has ever reported. That is the most useful number in this entry: it
says the 19.66pp within-run resolution understates the noise a cross-run comparison carries, and it
retroactively explains why R55.0's +10.53pp had to be read as `UNRESOLVED` rather than as the lane's
best arm.

**What this iteration establishes, stated as narrowly as the evidence allows.**

1. The trace unit changes what the distiller writes: 2.14 claims per episode, in the requester's
   register, with the ban idle. That is a property of the object, and it is the first positive result
   about the write side this project has.
2. A store built from 7 traces cannot contain a claim three traces corroborate. The population, not
   the mechanism, is the binding constraint at this scale — and it is 7 because 78% of the learning
   tasks are already solved, not because the fold is small.
3. Consolidation at 0.70 Jaccard is inert on this register by construction, and the calibrated
   replacement is a containment floor at 0.60, measured on the store rather than guessed.

### 34.75 The floor sat above the population's ceiling, and the condition test would have refused the one merge

The measure R58's reading named is built (`prereg/R59-containment.md`), and building it found a second
defect of the same kind one layer down — before the dispatch rather than after it.

**What changed.** `claimOverlap` is `claimContainment`: `|A ∩ B| / min(|A|, |B|)` over content terms,
floor **0.60** where Jaccard's was 0.70. The denominator is the smaller side, which is why the pair
34.74 quotes merges: 14 shared terms of a 20-term claim is 0.700, where the union's 29 terms put it at
0.483. The measure is symmetric because the smaller side is chosen rather than named, so two items in
the opposite order score the same — a pass that merged in one store order and not the other would be
the order dependence the whole pass exists to remove.

**The defect the calibration caught.** The condition was held to *the same* floor, and on this
register that refuses the only pair worth merging. The two paraphrased conditions —
*"multiple distinct changes in one request and names the order"* against *"multiple distinct
modifications and specifies the sequence"* — share four content terms of eight, which as a ratio is
**0.400** against a 0.70 or 0.60 floor. Shipping the measure with one floor would have produced a
second inert pass, a second `ABANDONED`, and a false conclusion: *"containment does not help either"*.

As a ratio the condition carries no resolution at this sample. The same pair's conditions read 0.400,
the closest non-repeat pair's conditions read 0.400, and two conditions that disagree about their
subject (*"asks to change a booking"* against *"asks for a refund on a flight"*) read 0.500 — the
ordering is inverted. What does separate them is a **count**: a paraphrased trigger shares four
content terms, a conflicting one shares the subject and nothing else (two). The veto is therefore
below **three shared terms**, and the census carries that count beside the ratio (`conditionMinShared`)
so a reader can see which test refused what.

**The re-scoring, and why it is in the repo rather than in a shell.** `eval/verifiers/r59_readback.py`
re-scores the artefact's own stored items under both measures, which turns *"the measure changed and
the numbers moved"* into *"here is what the floor does to this store"* without buying a second
dispatch. Run against R58's artefact (`42476580076`):

```
re-scoring over the store the run kept: containment 1, Jaccard 0
```

One group over the same 15 items, under the floor this iteration ships and not under the one it
replaces. 34.74's containment numbers were computed in an ad-hoc script; they are now a verifier with
14 self-test cases inside `eval:verifiers`, so the calibration is re-checked by CI rather than
remembered.

**What the re-scoring cannot do, and says it cannot.** The artefact's `storeItems` carries an evidence
*count* rather than evidence rows, so the pass's duplicate-evidence refusal is not re-scored: two
claims distilled from one trace are indistinguishable from two claims distilled from two. The
re-scoring therefore reports *at least* the groups the real pass would merge, and the census remains
the authority on what it actually merged. A readback that silently skipped an unreadable rule and
reported a smaller floor would be the defect it is trying to measure.

**The population.** `TAU_TRAIN_TASKS` moves 32 → 57, the whole learning half, because 34.74's
registration multiplied every scale number by 32 corrections when the run had 7. The split is
unchanged (`round(114 × 0.5) = 57`), so the **held-out set is the same 57 tasks at the same four
trials**: the reference arm stays comparable, and the change is in how much of the learning half is
used, not in what is evaluated. At the measured edit rate (7 of 32) the expectation is ~12 corrections
and ~26 claims. This is a sample change and is reported as one: no prediction in the registration is
stated as a delta against R58's pass rate.

**The admissible interval, on a labelled store.** One pair out of the 105 is one claim, and labelling
it means stating the criterion: *one claim* is the same operative directive — the same object acted on,
in the same order, with the same exception. Two statements about multi-order requests that act on
different objects ("apply the change to every affected order", "resolve each order's own payment
method") are two claims even when they share their subject. Under that reading the store admits exactly
one floor interval, **(0.533, 0.700]**: at 0.533 the false pair enters, at 0.700 the true pair leaves.
0.60 is an interior point of the only interval the store allows, which is a stronger statement than
"0.60 sits between the two readings" — it says no floor inside it can be wrong on this sample, and the
choice inside it is a preference rather than a measurement.

**Tests.** `consolidate.ts` reads 100 / 100 / 100 / 100 across statements, branches, functions and
lines over 34 cases, including the arithmetic at both floors, the symmetry of the measure, a trailing
caveat that Jaccard would have refused, a paraphrased condition that passes the count and a
subject-only one that does not, and the override that proves a stricter pass is dispatchable. The
`l4-support-recurrence` gate now prints both floors beside the distributions, because a store
consolidated at 0.60 and one consolidated at 0.70 are two experiments.

### 34.76 The yield census counted a claim twice, and the population it read was the pass's output

Found before dispatch, by asking what `claimsPerCorrection` does when two claims from different
corrections have already been merged.

**The defect.** The join is on `EvidenceRef.runId`, and the driver passed the store *after*
`consolidateKnowledge`. A merged group leaves two items: the survivor, whose evidence is the union and
therefore cites both runs, and the retired member, which still cites its own. Joining that store
attributes the survivor to correction A **and** to correction B, then attributes the retired item to B
again — three claims where two were written. On R58's store, where nothing merged, the defect was
invisible; on R59's store, whose entire purpose is to merge, it would have inflated exactly the number
the next registration is built on, in the direction that flatters the distiller.

**The rule, stated rather than patched.** An item citing `k` runs is one claim made from `k`
corrections, and counts once for each — that is what a write-side fold (`update`) produces, and the
sum over corrections is then claims *written* rather than the store's size. The recurrence pass is the
one thing that breaks the identity, because it merges *after* the write and keeps both halves. So the
population is the store as the distiller wrote it, and `tau2-driver` now reads it once and uses the
same read as the pass's input and as the yield's population:

```ts
const written = await store.listKnowledge({});
const consolidation = DISTILL_UNIT === 'trace' ? consolidateKnowledge(written, …) : undefined;
…
yieldCensus: yieldCensus(claimsPerCorrection(captured, written)),
```

One read for both is not tidiness: two reads would be two populations, and the pass's input and its
yield would then differ by whatever was written in between.

**Tests.** A store of two claims as written reports `[1, 1]` and a total of 2; the same two after the
pass reports `[1, 2]` and a total of 3. The second assertion is the defect, kept as a case so the
comment that explains it cannot drift from the behaviour it describes.

### 34.77 Two rulers on one sample point opposite ways, and that is the reading

R58's pair has been read on `pass^4` since it landed: **+1.75pp, 95% CI [−14.04, +15.79], p = 1.000,
10 gained, 9 lost, n = 57, `UNRESOLVED`.** The artefact also carries `per_task.successes` over
`per_task.trials` for every task on both arms, and nothing had ever read it.

**The same 57 tasks, on the rate endpoint:**

```
endpoint          delta      se       95% interval         MDE(80%)  tasks@3pp
pass^4 (binary)    +1.75   +7.65  [ −14.04, +15.79]         —  1423
pass rate          −1.32   +2.83  [  −6.86,  +4.23]     +7.92  398
```

The interval narrows by a factor of 2.7 and the sample a three-point effect needs falls from 1423 to
398 — four times closer, and still impossible on a bench of 115 tasks. **The sign reverses.**

**Why it reverses, which is the part worth keeping.** The twelve tasks that rose sum to +3.5 (mean
+0.29); the fourteen that fell sum to −4.25 (mean −0.30); the net is −0.75 over 57 tasks. The binary
endpoint counts only the ten that crossed into four-of-four, all of them rises, and cannot see a task
that went from three of four to two of four. So the arm's benefit is *concentrated* — it converts
near-misses into perfect runs — and its harm is *diffuse* — it lowers more tasks by slightly more
each. `pass^4` reads the concentrated half; the rate reads both.

**What is claimed.** Nothing about direction. Either reading is `UNRESOLVED`, and picking the one
whose sign is agreeable is the operation this entry exists to prevent: `endpointsAgree` reports the
conflict, and the readback tool (`eval:pair-rate`) prints both rows and then the conflict line, so a
report that quotes one has to quote the disagreement beside it.

**What is declared.** The rate endpoint was chosen *after* seeing how wide the binary interval was.
That is a real selection and it is recorded as one: the endpoint is reported as a secondary reading of
an existing sample, no direction is claimed from it, and every registration that wants to decide on it
must name it before its dispatch. It is not a licence to re-read old pairs until one becomes
significant; it is a statement that the binary endpoint's resolution on this bench (~21pp) is larger
than any effect the record contains, and that the next design should not inherit it by default.

**What it means for the bench.** At 57 tasks the *best* endpoint available here resolves about 7.9pp
at 80% power. The one effect the published record does establish — lossless 67.5 against `sup3` 60.0
on retail's `pass^4` — is 7.5pp, which is just inside that. Every 2–4pp difference between selection
strategies is outside it, permanently, at this sample. The honest position is that this bench can
adjudicate a `sup3`-sized effect and nothing finer, and that a lane reporting `UNRESOLVED` on a
two-point delta is reporting the design rather than the mechanism.

**Tests.** `paired-rate.ts` reads 100 / 100 / 100 / 100 over twelve cases: the zero spread of two
identical arms, the quarter-trial arithmetic, the narrower interval on the same sixteen observations,
symmetry under a swap, the disjoint-arms case that has no pair rather than no difference, the dropped
zero-trial task, the `2.802 · se` convention shared with `power.ts`, and the inverse-square scaling of
the sample a target needs.


### 34.78 The first corroboration, and the two ways the record could not see it

R59 is read (`42488237590`, `8f9aeffe`): **14 corrections from 57 learning tasks, 31 claims, one group
merged, one item at `supportTasks: 2`, 30 of 31 items retained.** The verdict is `GRADED` on seven
predictions, and it is the first time anything in this project has been corroborated by two distinct
tasks.

**The pair, named.** The pass retired

> *"Perform the requested changes in the order the user stated them, completing each before starting
> the next."*

into a survivor

> *"Before acting on a multi-part request, resolve every referenced order and item to concrete
> identifiers, then perform the requested changes in the order the user stated them."*

Their readings are the calibration's whole argument, measured on a real pair for the first time:

| | value | floor | margin |
| --- | --- | --- | --- |
| containment over the statement | **0.667** | 0.60 | +0.067 |
| Jaccard over the statement | **0.348** | 0.70 | **−0.352** |
| shared content terms in the condition | **3** | 3 | **0** |

So the floor R58 could not reach is reached with 0.067 to spare, the measure R58 used misses by a
third of a point, and the condition count is **exactly binding** — a fourth shared term would have
been required under a count of 4, and the merge would not have happened. Two of the three calibrated
numbers are exercised here, and one of them has no margin at all.

**Defect A: the readback called it abandoned.** The attribution prediction — "Jaccard merges strictly
fewer groups than containment over this store" — is computed by re-scoring the stored items. The store
the artefact carries is the one the pass *left*: the pair is gone, so containment finds 0 groups and
Jaccard finds 0, the prediction fails, and a failed prediction abandons the run. On R58 that reading
was informative precisely because its pass merged nothing. Here it graded the shape of the artefact.
It is now ungraded when the census reports a group, with the reason printed, and the refutation that
depends on it — "the two measures agree, so the calibration is wrong" — is evaluated only on a store
the pass did not touch.

**Defect B: the store could not name the pair.** `StoreItemRecord` carried the retired item and the
corroborated survivor with no pointer between them, so a readback could report *that* a group merged
and had to infer *which*. It inferred here (one retired item, one corroborated survivor) and printed
the pair above; every run after this one carries `statusReason` as written, and the inference survives
only as a fallback for artefacts written before it — exact for one group, an over-estimate for more,
so the "not one claim" refutation can only become harder to fire.

**The arm, which is not the result and is reported anyway.** `pass^4` **63.16% against 66.67%**,
delta **−3.51pp, 95% CI [−15.79, +8.77], p = 0.7744, 5 gained, 7 lost** — `UNRESOLVED`, with
`l4-effect-resolved` failing on a 17.03pp minimum detectable difference. On the rate endpoint the same
pair reads **−1.32pp [−5.97, +3.34]**: the two endpoints agree in sign here, which is worth recording
because they did not on R58.

**The number that governs all of it.** The reference arm — memory-free, same 57 tasks, same four
trials, same code — read **63.16% in R58 and 66.67% in R59**. Nothing changed on that arm between the
two dispatches: it does not touch the store, the learning population or the distiller. A **3.51pp
swing from run-to-run noise on the control** is twice the largest treatment effect this lane has ever
measured, and it is why every delta in this record is `UNRESOLVED` by construction rather than by
modesty.

### 34.79 The ceiling was one claim from the mean, which makes it the next treatment

31 claims from 14 corrections is **2.21 per correction** against a cap of three. A cap one claim above
the mean is a cap that binds on the corrections that reach it and is invisible in the average because
most do not. Three arithmetic facts settle what to do next.

**The published rate does not transfer at this population.** Their `sup3` core is 31 of 292
guidelines, **10.6%**. At that rate 31 claims would hold **3.3** items at three distinct tasks; this
store holds **0** at three and **1** at two. Two explanations, and they are separable: either this
register's claims are more task-specific than a trajectory's guidelines, or the store is too small for
its own recurrence. Yield moves the second without touching the first.

**Pairs scale with the square of the store, triples with the cube.** One corroborated class among 30
items is the observation. Growing 31 → ~45 claims multiplies pairs by 2.1 and triples by 3.0, which is
exactly the question R60 registers: does the class that already holds two members receive a third.

**The cap has never been measured and now can be.** R59 was dispatched before `yieldCensus` existed;
nothing in any artefact says what the per-correction distribution looked like, only its mean. R60
carries the census and moves the ceiling to six, and the two are ranked in its registration: if the
median rises to three or more the cap was the constraint, and if it stays at two the episode was and
the next lever is per-assertion episodes rather than a bigger number in a prompt.

### 34.80 The band measured its own arithmetic, and the twin moved the dose

R57's arm was drafted with a share as its level: `far` under 5% of the request's content terms,
`near` and `adversarial` 10–20%. Before any dispatch, the committed rules were measured against the
domain's own 114 requests. Retail requests carry **11 to 126 content terms** — p10 21, median 40, p90
78 — so a rule that shares four of a request's terms covers 0.10 of a short one and 0.03 of a long
one. Measured: the drafted `near` rules reached the 10–20% band on **11%** and **12%** of requests,
and `far` on **0%**. The band would have reported `inBand: false` on nearly every request and called
it a reading.

That is the third time this lane has graded a fraction whose denominator was the problem — R47's
coverage histogram, R59's containment floor at 0.667 against a floor of 0.60, and now this. The
difference here is that it was caught by measurement rather than by a readback, because the rules are
a stimulus and a stimulus can be titrated before the run.

**The second defect was in the pair, and it was worse.** `adversarial` is `near` with the correct
action forbidden. The drafted pairs also added a word — `keep`, in the address pair — which 30% of
retail requests carry. That raised the adversarial arm's median coverage to **0.067** against the near
arm's **0.048**, and its in-band share to **64%** against **49%**. Two arms that differ in polarity
would have differed in dose as well, which is the one confound the pair exists to remove. A single
word, invisible in a diff of prose, moving the treatment by 40%.

Both are now refused by construction rather than by care: `validatePlanted` rejects a twin pair whose
token sets differ by anything but a declared negation marker, and a pair's level is measured on the
`near` text and inherited by both arms, because a marker is itself a token and a third of these
requests say "not" themselves.

**What the measurement bought, stated as a distribution rather than a claim.** With the band in
shared terms (`far` none, `near`/`adversarial` two or more): `far` shares nothing with **100%** of
requests, and the near arm reaches its band on **76%**, with the remaining 24% recorded as drift. The
drift is not a defect to be repaired — a request about exchanging a keyboard shares nothing with a
rule about an address, and no authoring fixes that. An arm that planted nothing on those requests
would be measuring a different store than the one it reports.

**One design decision this forced, and its price.** The rule is appended to the rendered block rather
than added to the store: the registration asks for exactly one rule in *every* pack, and an item the
store merely held would be retrieved on the requests that resemble it. Re-rendering was refused for
the same reason R53 refused a fixed budget for three notes — it would re-decide which of the host's
items fit and so change what the armed pack *drops*. The price is stated in the artefact: an armed
pack is one line longer, and on the requests whose pack was empty until the plant arrived
(`createdBlock`), the arm carries the price of a block as well as of a rule — 1.14pp, measured on the
public lane. A readback that wants the item's price subtracts that population.

### 34.81 A veto that did not separate, and a chain reported as agreement

R60 is read (`42501736928` on `0238aea1`). It did exactly what it was built to do and then failed in
a way worth more than a success.

| reading | R59 | R60 | registered prediction |
| --- | --- | --- | --- |
| ceiling | 3 (inherited) | **6 (chosen)** | 6 |
| claims per correction | 2.21 | **3.08** | ≥ 3.0 ✓ |
| median claims per correction | 2 | **3** | 3 ✓ |
| max claims | 3 | **4** | — |
| items at `supportTasks ≥ 2` | 1 of 30 | **1 of 36** | ≥ 2 ✗ |
| items at `supportTasks ≥ 3` | 0 of 30 | **0 of 36** | ≥ 1 ✗ |
| store retained | 30 of 31 | 36 of 37 (97.3%) | ≥ 50% ✓ |

**The ceiling was binding, and raising it moved the yield.** Median 2 → 3, mean 2.21 → 3.08. R60's
first refutation — *the yield does not move, the cap was never the constraint* — is cleared.

**And corroboration did not move by one item.** 37 claims at a cap of six produced the same single
item at support 2 that 31 claims at a cap of three produced, and still nothing at three tasks. The
second refutation — *the yield moves and nothing corroborates, the corpus is the constraint* — is
cleared as well. Both readings in, and they point at the pass that is supposed to recognise two tasks
saying one thing.

**The veto had no discriminating power.** The pass required three shared condition terms before it
would merge two items, on the argument that a count separates a paraphrased trigger from an unrelated
one where a ratio does not. Measured over the 37 items and their **666 pairs**:

| band | condition terms shared (p50) | share sharing ≥ 1 | condition containment (p50) |
| --- | --- | --- | --- |
| statements match (≥ 0.60) | **1** | 75% | **0.11** |
| statements unrelated (< 0.40) | **1** | 82% | **0.11** |

Neither measure separates. Because the veto runs *after* the statement gate it never sees an
unrelated pair, so its only measurable effect was to keep **1 of the 4 pairs above 0.60** — and the
pair it refused was the store's best: **containment 0.88, Jaccard 0.70**, conditions sharing one
term, against a pair at 0.64 whose conditions shared five. A gate that is non-monotonic in the one
measure that does separate (0.88 / 0.64 / 0.62 / 0.62, then a clean gap to 0.50) is not testing what
it claims.

**The grouping reported chains as agreement.** Single linkage merged A with B and B with C into one
group of three whose extreme members could share one term in five, and the census read that as three
tasks agreeing.

Both are fixed in code, and both are now measured inside every run rather than argued: the condition
is recorded per group and applied only when a caller asks for a floor (default 0), the grouping is
complete linkage, and `weakestPair >= threshold` is an invariant a readback asserts.

**The measurement that became the registration's premise, taken before it was written.** The sweep
was run over R60's own 36 live items:

| threshold | groups | largest | weakest pair | support |
| --- | --- | --- | --- | --- |
| 0.40 | 6 | 3 | 0.41 | 1..3, 2..3, four 1..2 |
| 0.45 | 3 | 3 | 0.62 | 2..4, 1..2, 1..2 |
| **0.50 – 0.60** | **1** | **3** | **0.62** | **2..4** |
| 0.65 – 0.80 | 1 | 2 | 0.88 | 2..3 |

At the unchanged statement floor the store holds **one group of three** where the pass formed one
group of two; at the veto's floor it holds none. The support is an interval because a sampled store
carries no evidence rows — `supportCeil` sums the members' counts, `supportFloor` is the largest one.

**One diagnostic caught by another.** The first version of this measurement was a throwaway script
that compared statements only, and at 0.40 it reported **seven** groups where the module reports
**six**: it merged a `procedure` with a `negative` because their text matched. The module that ships
checks kind and scope; the measurement that did not was the looser one. Which is the third time this
round that a defect was found by measuring, and the first time it was found in the measurement.

### 34.82 A command that could not tell an unbought stage from a lost one

`eval:prior` gained a failure mode in R60's wake: exit 2 for "the input is not there", on the argument
that an axis nobody priced must not look like an axis whose effect is nil. The argument was right and
the test was wrong: it asked whether the `pool` **key** was present, and the lane writes `pool: null`
on every case of a run that bought no sampling arm. So a run that bought nothing and a run whose
candidates were lost produced the same reading, and the message on screen named the second while the
file described the first.

It went unnoticed because no dispatch since had run the BIRD lane: R60 and R61's first attempt both
skipped it. The first dispatch that ran it (`42524907557`) paid 1,768 calls and 350 measured questions,
wrote a complete artefact, and then failed at *Price the memory prior* — a step whose subject,
`arms: gated,oracle`, samples nothing and never has.

| state of the artefact | meaning | exit before | exit now |
| --- | --- | --- | --- |
| no `pool` key anywhere | predates the field; cannot say whether an arm ran | 2 | 2 |
| `pool: null`, no `sample-N` arm recorded | the run bought no sampling arm | **2** | **0**, named |
| `pool: null`, a `sample-N` arm recorded | the lane lost what it paid for | 2 | 2 |
| a pool with no `dbId`/`fold` on any case | unkeyed; a prior over it would invent a corpus | 2 | 2 |

The discriminator is the file's own arm list, not a flag and not the dispatch: a run that says it
bought nothing is a reading, a run that bought something and produced nothing is a failure. That is the
same rule the pool, signal, density and union readers already followed — they exit zero and say "no
pool in this artefact" — which is how the inconsistency survived review: four readers agreed and the
fifth was the one with a price.

**A diagnosis corrected by its own artefact.** This was first written down as a workflow defect: the
dispatch's `SOTA_ARTEFACT` was said to name `poc-sota-bird-R61-floor.json` while the lane wrote
something else. The uploaded artefact is exactly that file, and its `config.prereg` names the
registration, so the two names agreed and no such defect existed. Two proposed repairs — gating the
`bird` job on the registration's kind, and computing the name once for the lane — were withdrawn before
anyone implemented them. The rule that produced the false positive is worth keeping: a workflow defect
is diagnosed from the artefact the run uploaded, never from the step that went red, because the step
name says which claim failed and only the file says why.

### 34.83 A default that could not be told from a request, and the lane it bought

`bird` defaulted to `true`. A dispatch that meant to buy the Mini-Dev lane and one that never thought
about the question were the same string, so no rule in the workflow could act on intent — and none
tried. R61 showed the bill: a τ² registration, whose arm is measured on τ² retail, bought 1,768 model
calls and seventeen minutes of a BIRD measurement it does not grade. The measurement still happened,
still produced a delta (−0.57pp), and still ran a green step, which is why a lane nobody grades is
harder to notice than a lane that fails.

| rung | statement | lane |
| --- | --- | --- |
| 1 | `bird: false` | no |
| 2 | `bird: true` | yes |
| 3 | `split: dev` / `train` — BIRD-only corpora | yes |
| 4 | the registration declares a `recallFloor` (a τ² registration) | no |
| 5 | the registration declares none (a BIRD registration) | yes |
| 6 | no registration named (a schedule) | yes |

Two things are worth keeping from the repair itself. The input's default is now **empty** rather than
`true`, because a default that equals a request cannot be overridden by a rule — the fix for "the
default decides something nobody chose" is to make the default mean *nothing was chosen*, not to add a
rule beside it. And the decision is a **function with twelve cases** (`lane-scope.ts`, 100 on all four
dimensions) rather than an expression in an `if:`, because the workflow's other gates have no tests at
all and the one that costs seventeen minutes should not be among them.

A third, smaller: the command refuses to run without `EVENT`. Its fallback branch was the one that turns
a lane *on*, so an absence there failed toward spending rather than toward silence.

### 34.84 A count whose name said one thing and whose value said another, and the payload that would have lied

Two defects were built into R62 before it ran, and neither would have failed a test that was not written
for it.

**The first: `learning.edited` counted every teaching record.** The field predates the population
question — it was written when every record *was* a repair, and it was read by five readbacks as "how
many corrections the fold produced". Under `TAU_DISTILL_SCOPE=all` the same expression counts fifty-seven
records, of which fourteen are repairs, so a widened store and a repaired store would report the same
number under a name that says one of them. The repair is not to add a field: it is to make the name true
(`edited` = repairs) and to read the population from `provenance`, where the two counts sit beside each
other and neither can stand in for the other. Every existing readback keeps working because under the
published scope the two definitions coincide.

**The second: the payload `traceOf` would have built for a passing record.** Its contract took
`expected: readonly string[]` and wrote `expected: []` when a task stated no calls — a shape that is
*correct* for a rubric-only repair, because the reference trajectory really is empty, and *false* for a
pass, where it says the reference does nothing. The prompt reads `expected` as "what the trajectory does
instead", so the second reading turns every success into a divergence the model is then asked to explain.
The fix has three parts and all three are asserted: `expected` becomes optional, `met: true` replaces it
with `rubricMet`, and supplying **both** throws — because resolving that contradiction in a caller's
favour means the model resolves it instead, by guessing.

| state of the reference | payload | what it is for |
| --- | --- | --- |
| `expected: [...]` | `{attempt, expected, rubric?, omitted}` | a repair: the attempt beside what should have happened |
| `expected: []` or absent, no `met` | `{attempt, expected: [], omitted}` | a rubric-only repair: the reference states no calls |
| `met: true` | `{attempt, rubricMet: true, rubric?, omitted}` | a pass: the attempt **is** the reference |
| `met: true` **and** `expected` | throws `RangeError` | a contradiction nobody may paper over |

**The third, smaller, and the one most likely to be repeated.** The passing sentences were first written
straight into `TRACE_RULES`, which is the array every trace dispatch reads. That would have changed the
prompt of a lane that distils repairs alone — R61's arm — so the round's own comparison would have been
between two prompts rather than two populations, and nothing in the artefact would have said so. The
sentences are appended only when the caller declares the scope, and the test is a diff over the prompt's
lines: exactly two added, none removed. A containment test would have passed through a reflow of the
shared rules; a diff cannot.

### 34.85 The gate that never read the other workflow

`ci.yml` never parsed `.github/workflows/sota.yml`. That is not a missing check on one file; it is the
reason a twenty-sixth `workflow_dispatch` input could be pushed to a file holding twenty-five and be
greeted with a green build. GitHub's own limit is a hard cap and the rejection is total — the file does
not parse, so no dispatch of *any* workflow in the repository can start — but the rejection appears as a
run named after the file path rather than as a check on the push, so nothing upstream of a human reading
the run list noticed.

| reading | before | after |
| --- | --- | --- |
| does `sota.yml` parse | nobody checked | `scripts/check-workflows.py`, in `pnpm check` |
| dispatch inputs | unbounded by us | refused above twenty-five, with the consequence in the message |
| a duplicate input key | invisible (YAML keeps the last) | counted literally and refused |
| a job without a runner | invisible | refused |
| a runner image without PyYAML | — | the cap and the duplicate count still run, and the output says the files were counted rather than parsed |

Two things about the checker are worth keeping. The first is that **its self-test found two bugs in it
before it shipped**: the counter assumed eight-space indentation where `sota.yml` uses six, so it
counted zero inputs on the broken file and called it clean, and it counted into a dictionary, which is
exactly what a duplicate collapses into. A checker that has only ever been shown well-formed input
agrees with whatever it assumes. The second is the degraded path: a check that refuses to run because a
Python library is absent trades a silent failure for a loud wrong one, so the two rules that need no
parser run regardless and the absence is printed rather than swallowed.

### 34.86 A bar is a statement about the treatment, and it was applied to the distractor

Seventh instance of one defect class, and the first one where the *arm* was right and the *gate* was
wrong rather than the reverse.

`sampleGates` grades an L4 arm. It was extracted from the driver in the first place because a gate must be
testable, and its first correction was the memory-free control: six consecutive `sota` runs concluded
`failure` with the memory arm green, because the control was held to `published + 5pp`, a bar a control
cannot pass and is not supposed to. The control's own hypothesis is that it scores *lower*. The
replacement was not "no gate" but the gate the control actually owes the pairing step — every task it
claims to have scored was scored.

R57 added a third kind of arm and the same paragraph applies to it verbatim. A **planted distractor** arm
puts one irrelevant or misleading rule into every pack and asks what it costs; its registered answer is
"not free, not harmful", which means its `pass^4` is *expected* to sit at the published number rather than
five points above it. Run `42534241219` measured 0.5789 against a published 0.575 with a paired ledger of
nine broken and nine repaired episodes — excess **+0.00pp** against a half-width of 14.59pp, an arm
agreeing with its registration in every field — and the `L4 arm` step printed `failure` because
`l4-pass4` asked it to clear `published + 0.05`.

| what the gate asked | of which arm | whether that arm can pass it |
| --- | --- | --- |
| `pass^4 >= published + 5pp` | the memory arm | yes, that is the treatment's claim |
| the same bar | the memory-free control | **no** — its hypothesis is the opposite direction |
| the same bar | a planted distractor | **no** — its hypothesis is that the plant is not worth 5pp |

The failure mode is the same one twice: **a gate that a correctly behaving arm cannot pass converts its
own correct behaviour into a red status**, and a red status that is always red is a status nobody reads.
The cost is not the wasted dispatch. It is that the round's real signal — an excess of 0 and a band share
of 99.3% — arrives in a run whose conclusion says `failure`, so the next person to look at the run list
learns nothing and the next person to look at the artefact has to reconstruct what the status meant.

The repair keeps the shape of the first one. The bar is omitted for a planted arm and the omission is
*stated* in the artefact (`published_bar_applies: 0`, `planted_arm: far`) rather than left to the absence
of a key; the two gates every arm owes — coverage, and a completely scored grid — are untouched, because
planting a distractor does not license a small sample; and the reading that replaces the bar already
exists and is not in this file: `eval/verifiers/r57_readback.py` grades the plant census, the trial count
and the paired excess arm by arm. What is left in `sample-gates.ts` is one clause and four tests, and the
tests name the two surviving criteria so that re-adding the bar fails instead of passing quietly.

**The general rule, since this is now the second time it has been paid for:** a gate belongs to the arm
whose hypothesis it states. When a new arm is added, the question to ask is not "does it clear the bar"
but "whose claim is this bar", and if the answer is "not this arm's", the correct edit is an omission
that is written down — never a threshold moved until the arm goes green.

**The same bar, in a second home, found before it fired (`4083945`).** The rule above is cheap to state
and was not yet cheap to obey: asking "where else does the treatment's bar live" found `l4-paired`,
which lives on the step immediately after the one that had just been repaired. For a planted arm a
`HARM` verdict is its registered prediction, so the gate would have failed `near` for being right, one
step after `l4-pass4` had failed `far` for being right. Both are now omitted for a planted arm with the
omission recorded in the artefact, and the three pair gates moved out of the `bin/` file into
`pair-gates.ts` so that they have tests — the reason they had none is that `bin/` is excluded from
coverage, and "no test" is how a gate ends up stating the wrong arm's hypothesis twice.

The general rule, restated because the second instance arrived the same day as the first: **when an arm
is added, every gate on its path is re-read against that arm's hypothesis.** The failure mode is never
a gate being written wrongly; it is a gate being written once, for one arm, and then inherited.

### 34.87 A CI step with no local twin is a gate half the project cannot run

Two pushes went red on 2026-11-09 with every local gate green, and the causes were unrelated except in
shape: **both were checks that existed in `ci.yml` and nowhere else.**

| CI step | local command that ran it | what it caught |
| --- | --- | --- |
| `pnpm build` (+ `pnpm typecheck` when a person runs it) | yes | everything in `packages/*/src` |
| `pnpm typecheck:lanes` | **no** — the composite build excludes `src/bin` | a string written into `Record<string, number>`, two commits running |
| the coupling-ledger `node -e` block | **no** — `pnpm check` rewrote the ledger and never compared it | a committed snapshot describing a 166-module tree that had grown to 167 |

Neither was a wrong check. Both were checks placed where only the runner could perform them, and the
local workflow — which is the one that runs a hundred times per change — was structurally unable to
disagree. The failure mode is not "CI is strict"; it is **the local gate certifying a state that CI will
reject**, which trains a person to read green as "nothing to do" and then to treat the red as noise.

There are two repairs and they are the same repair applied at two layers.

The first is mechanical: `pnpm typecheck` now chains the bin compiler run, so the obvious command covers
the same files as the two CI steps. The cost is eight seconds of duplicate `tsc` in CI, which is left in
place deliberately — the step is also the place where the reason is written down.

The second is structural: an inline `node -e` block in a workflow is a check that no fixture can reach
and no local command can run. The eleven coupling claims moved into `scripts/check-coupling-ledger.mjs`,
which takes a directory or scans for itself, and both `ci.yml` and `pnpm check` call it. It has eight
fixtures, and the fixtures are the point: a predicate that stopped discriminating — `>=` where `===` was
meant, a count compared to itself — would have passed forever inside a YAML string.

**The rule to carry forward.** For every step in `ci.yml`, name the local command that runs it. Where the
answer is "none", the choice is to move the check into a script that both call, or to accept that the
check can only ever be discovered after a push — and to say so out loud, in the step, so the next person
knows a green local run has not tested it. What is not acceptable is the third option this round took
twice: leaving the check inline and assuming the local gate covers it because the local gate is green.

### 34.88 The fallback that cannot fire, and the test that certified nothing

Two findings from one afternoon of reading a coverage report, and they turn out to be the same defect
seen from opposite ends: **code and tests that agree with each other instead of with the input.**

**The fallback.** Four sites in this repository carried a defensive default on a lookup that cannot
miss:

| site | the fallback | what makes it total |
| --- | --- | --- |
| `sql/src/schema-link.ts` | `byColumn.get(column) ?? []` | the map is filled from the same blocks, two loops above |
| `eval/src/within-run-pair.ts` | `comparison.paired === 0 → unmeasured` | `validArm` refuses an empty arm, and the two id sets are compared on the previous line |
| `eval/src/facade-pair.ts` | three `typeof !== 'number'` re-checks | the guard forty lines up tested the same three fields |
| `eval/src/ablations.ts` | `items[0]?.status ?? 'missing'` | `learn()` admitted one rule; `status: 'all'` filters nothing |

None is a bug. All four are *uncovered branches*, and that is the cost: a fallback no input can reach is
a line that reads as safety, that no test can pin, and that appears in the report as the file's only
uncovered code. The second-order cost is worse than the first: when the report has been telling a
reader for months that some lines are simply never covered, the report stops being a signal — and
`ablations.ts` sat at 94.44% branch coverage, the worst in the repository, because of one unreachable
`??`. Each site is now asserted by construction with a paragraph naming the invariant, so breaking the
invariant crashes there instead of silently doing less.

**The test.** `tau2-admission.test.ts` has a case called "refuses an action that names no tool". It
passed an object-shaped `before`:

```ts
tau2EditSemantics(
  { actions: [{ name: '', arguments: {} }] },   // before — NOT the shape complete() writes
  { actions: [{ name: 'cancel_pending_order', arguments: { order_id: '1' } }] },
)
```

`tau2EditSemantics` opens with `if (!isDriverCompletion(before) || !isGoldVerifiedCorrection(after))`.
`isDriverCompletion` requires `actions` to be an array of **strings**; the object-shaped `before` fails
it, the `||` short-circuits, and `isGoldVerifiedCorrection` — the validator the test is named for — was
never called. The assertion (`undefined`) held for an entirely different reason, and had held since R58.

That is the failure mode a coverage report exists to catch and a test name cannot: the test was green,
the code was correct, and the pair of them certified a claim neither had tested. Line 53's `return
false` was the last uncovered statement in the file, which is what gave it away.

**What the two have in common, and the rule that follows.** Both are places where a second statement of
a fact hides the first: the fallback restates a precondition the code already established, and the test
restates an outcome the short-circuit already produced. A restatement cannot disagree with what it
restates, so it adds nothing except the appearance of rigour. The discipline that removes both is the
same one: **state the invariant once, in prose, at the place it is established; then let code and tests
be about behaviour rather than about reassurance.**

### 34.89 A prediction calibrated on one population, graded on another

`prereg/R57-toxicity.md` graded "the band landed on at least 60% of requests" for the `near` and
`adversarial` arms. The arm measured **35.4% of 1972** and the readback called the instrument broken.

The number 60 was not invented. Amendment 1 measured the drafted rules against *this domain's own
requests* — the 114 task instructions in the retail corpus — and found 76%, then set the bar at 60% to
leave room for drift. What the census counts is a different population:

| population | size | what it is |
| --- | --- | --- |
| task instructions | 114 (one per task, per trial reuse) | the text Amendment 1 measured |
| recall requests | **1972** over 228 episodes (8.6 each) | every message the agent sends |

`microglia_agent.generate_next_message` calls `recall(message.content)` — the *current* message, not the
conversation and not the task. Turn one is the instruction; turns two onward are tool results and one-word
replies. A rule authored to share two of the question's content terms is a `near` rule for the question
and a `far` rule for `{"order_id": "#W1234"}`, and 35.4% is what that arithmetic predicts once two thirds
of the requests are mid-conversation.

**The general shape, which is R51's shape one layer down.** R51 graded a retail store's rules on airline
questions and the readback said so. This graded a rule's *level* on a population the level was never
authored for, and the bar was calibrated on the population that did not run. Both are the same mistake:
**a number is a number only together with the population it was measured on**, and a registration that
states the number without the population has left the readback free to pick the wrong denominator.

The repair is not a lower bar — fitting the threshold to the observed 35.4% would be choosing the
contrast after seeing it, which is what pre-registration exists to prevent. The graded claim becomes a
between-arm equality (*the two polarities sit at the same level, within 10pp*), which is the confound
the contrast exists to remove, needs no absolute threshold, and is measured on the population the census
actually records. The absolute share is reported beside it, ungraded, with its denominator named.

**The same defect appeared a second time inside the repair.** The verifier's self-test carried a case
called "a near arm below its band share did not run its band", asserting the state `ABANDONED` and the
fragment `band landed` against a *rendered report*. When the near band stopped being graded the case
still passed, because the far arm's passing line reads `far: the band landed on at least 95% of
requests`. A fragment matched a line about a different arm, in a test whose subject was the arm that no
longer had a line at all. The two cases that replace it name the gap in percentage points and the exact
reported-share sentence, so the next change to this readback fails them instead of sliding past.

### 34.90 Three ways a check can be present and wrong

One day produced three, and they are different failures of the same instinct: writing something that
*looks* like a check and reading its green as agreement.

**A prediction that could not fail.** `r57_readback.py` graded the ladder's first rung as

```python
near_pp - far_pp > -CONTROL_DRIFT_PP
```

Positive is harmful in this unit, so "near is worse than far" means `near_pp > far_pp`. The written
predicate is `near_pp > far_pp - 3.51`, which is true when near is worse, true when near is equal, and
true when near is better by **any** margin at all — the only reading it rejects is "near is more than
3.51pp better than far", which is the one reading a harm prediction is never asked about. It is the
negation of the claim on its own label. The measured values were near −3.51pp and far +0.00pp — the pair
3.51pp *better*, inside the drift — and the account printed both

> `PASS  near is worse than far  (-3.51pp against +0.00pp)`

and, four lines below,

> `FIRED far and near are indistinguishable  (the two arms differ by -3.51pp, inside a drift of 3.51pp)`

Two graded statements about one pair of numbers, disagreeing, in a report whose entire job is to be the
account of one experiment. The repair is the direction and the unit: a predicted order is graded as a gap
in that order, against the drift that decides whether a gap exists.

The general shape: **a threshold with the wrong sign is indistinguishable from a threshold by reading
it.** Every one of these predicates should be read as "which readings does this reject", and a predicate
that rejects only readings nobody claimed is not a prediction. This class is not exotic — it is the
reason `--self-test` fixtures assert the *rejecting* direction, and the fixture that would have caught it
is "near better than far by more than the drift", which the file did not have.

**A claim that misattributes its own loss.** R57's `adversarial` arm measures HARM, which is its
registered prediction, and the pair artefact published the sentence `HARM` carries: `the memory costs
accuracy: -7.02pp`. On an arm whose rules were planted to be wrong, that sentence is false: the memory
did not cost 7pp, the distractor did. The protocol's `V5-resolution` blocked on it — correctly, since
−7.02pp is finer than the 20.86pp the sample can resolve — and the tempting repair was to exempt the gate
for calibration arms, as `l4-paired` had been exempted one commit earlier.

That would have been the wrong repair, and the distinction matters. `l4-paired` states the *treatment's*
harm hypothesis, so on an arm whose hypothesis is the opposite it grades the wrong claim. `V5` states a
property of the *artefact*: does this file publish a direction its sample cannot resolve. It does. The
file was wrong, not the gate. Suppressing the claim makes the artefact true and leaves the gate doing its
job; suppressing the gate would have left a false sentence standing in a machine-readable file that the
next reader would quote.

**A branch that is covered one run in three.** The send-failure path in `sql-guard`'s `#ask` reported
100% on a full run and 99.98% on the next, same suite, same commit. It is reached when `close()` lands
between the child's readiness signal and the write, and the existing case waited 150 ms before closing —
long enough that the message had already left. **Intermittent coverage is not coverage**: a dimension
that reaches its number by winning a race cannot certify a change, because the next push may report 99.98
and nobody can say which reading is true. The repair is a case that constructs the race deliberately —
close with no delay at all, while the child is still booting — and three consecutive runs that agree.

| the check | what it looked like | what it was |
| --- | --- | --- |
| `near_pp - far_pp > -drift` | a prediction about the ladder | a predicate that passes unless the opposite happens |
| `claim: the memory costs accuracy` on a planted arm | a finding | an attribution to the wrong thing |
| 100% branch coverage from a race | a gate met | a gate met sometimes |

The rule that covers all three, and it is the same rule: **a check has to be able to say no to the thing
it is checking.** Write down the reading it rejects; if that reading is one nobody claimed, the check is
not checking anything. If it rejects only sometimes, it is a coin.

### 34.91 A validator that reads the last build, and an arm that was a global variable

Two defects of the same shape — **a thing that appears to be about this run and is about an earlier
one** — found in the same change, one by reading and one by running.

**The arm was a global variable.** `TAU_PLANTED_RULES` is a repository variable, so the arm a run
measured was whatever the last write to that variable said. R57 has three arms; they were dispatched
one at a time because the dispatch menu is full, and the next round was one forgotten `PATCH` from
measuring a distractor its registration does not declare. The variable is not wrong in itself — the
scenario pair and the recall floor are variables too — but those two are *also* in the prereg header,
and the arm was the only per-experiment value that existed only outside the experiment.

The repair makes the registration the source: `plantedArms: far,near,adversarial`, an `arms` job, a
matrix, one leg per arm. The property worth naming is not the saved dispatch, it is that
**an absent declaration now produces an absent arm** (`[""]`, which the driver already read as "plant
nothing") rather than inheriting the previous one. A default that is *the last value somebody set* is
not a default; it is a leak between experiments, and it fails silently in exactly the direction that
looks like a result.

**The validator was grading the previous compilation.** `pnpm eval:prereg` — the first command a
dispatch runs — rejected `plantedArms` as an unknown key, on the commit that added it, with the parser
that declares it sitting in the same tree. The cause is one import:

```ts
// packages/eval/src/bin/prereg.ts, before
import { parsePrereg } from '@agentix-e/microglia-eval';   // resolves to dist/
// after
import { parsePrereg } from '../prereg.js';                // resolves to src/
```

Every other bin in this repository already imported `../`; this one imported the package by name, so it
ran the previous build. Nothing about it is subtle once seen, and that is the reason to write it down:

| the check | what it validated | what it claimed |
| --- | --- | --- |
| `bin/prereg.ts` importing its own package name | `dist/`, i.e. the last `pnpm build` | the source in the working tree |
| `TAU_PLANTED_RULES` as a variable | whatever the last `PATCH` set | the arm this round registered |

Both are the same error in different materials: **the check read state that this run did not
produce.** The tests could not catch the first one — the unit tests import `src/prereg.ts` directly and
were green — and no amount of coverage would have, because the defect is in *which file is loaded*, and
that is a property of the CLI rather than of the module. What caught it was running the command the
workflow runs, against a registration that declared a key added that morning.

| dimension | before | after |
| --- | --- | --- |
| tests | 3647 | **3653** |
| files | 179 | 179 |
| statements / branches / functions / lines | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| dispatch inputs consumed by the arm | 1 (a variable) | **0** (a header line) |

The rule this adds to the list in 34.90: **a check has to be able to say no to the thing it is checking**
— and here, the check could not say *yes* to the thing it was supposed to check, because it was not
looking at it. "Which artefact did this read" is a question every validator should be able to answer,
and a validator that resolves its own package name is answering "the last build".

### 34.92 A delta divided by the number of questions, when the mechanism acted on 57% of them

Every memory arm in this repository reports `delta_pp` as the paired difference in accuracy over the
evaluation set. That is the right number for "does the system answer more questions", and it is the
wrong denominator for "what does the memory do", because the memory was consulted on the subset where it
changed the output and the table divides by the whole set. Four independent artefacts put that subset at
**56–57%**:

| artefact | inert share | delta per task | delta per change |
| --- | --- | --- | --- |
| `poc-sota-bird-dev` | 44.3% | −1.37pp | −2.46pp |
| `R24-dev-split` | 43.2% | −0.59pp | −1.03pp |
| `R26-channels` | 42.8% | +0.33pp | +0.57pp |
| `R37-lexicon-grain` | 43.4% | +0.72pp | +1.27pp |

The mistake is not arithmetic — both columns are computed from the same ledger and both are correct.
It is a **comparison error that the table invites**: a competitor publishing an activation rate of 60%
and we publishing a per-task delta are not on the same axis, and a reader will put them side by side
because both are percentages of a benchmark. The factor is 1.77 and it is stable enough across artefacts
to be treated as an instrument property rather than a finding.

Two things made this findable, and both are worth keeping:

1. **The harness already stored the evidence.** `predictedSql` and `baselineSql` are written for every
   case because a human occasionally reads them. Nobody had diffed them in aggregate, and the aggregate
   is a measurement that cost zero dispatches. The lesson is the same one that produced the ledger and
   the band: **a field written for legibility is often a field that was never aggregated**, and the
   aggregation is where the denominator lives.
2. **The two states had to be invented before the number could be trusted.** "No case changed" is not
   0%, it is no measurement — there is nothing to take a rate over, and a verifier that prints `0.0%`
   there is reporting a number it did not measure. And "two identical SQL strings, two different
   verdicts" is a contradiction in the artefact rather than a reading of it. Without those two states
   the share would have been printable in situations where it means nothing, which is the failure mode
   34.90 and 34.91 are both about.

The bound's direction is the part most likely to be misread later, so it is in the output: identical
text proves the memory did nothing, differing text does not prove it did something (the decoder may have
sampled differently). `inert_share` is therefore a lower bound on not-using, `effective_share` an upper
bound on using, and the per-change column inherits the same asymmetry — it is an upper bound on the
per-use effect, not an estimate of it. Every number in the table above is quotable only with that
sentence attached.

### 34.93 Two quantities called concurrency, and a retry that retried nothing

Both legs of `42568927112` failed at 06:36, one minute apart, after fifty minutes of work:

```
litellm.RateLimitError: DeepSeekException - {"error":{"message":"Too many requests. Your current
concurrency is 6, which exceeds your concurrency limit of 5 based on your remaining balance..."}}
```

The configured value was **2**. The error was not wrong and neither was the configuration; they were
counting different things.

| quantity | unit | who counts it | value |
| --- | --- | --- | --- |
| `max_concurrency` | **tasks** in flight | tau2's `run_tasks` | 2 |
| the provider's limit | **requests** in flight | DeepSeek, from the account balance | 5 |

One episode holds an agent call, a user-simulator call and an evaluator call at once, so two tasks
arrive as five or six requests. The lane had passed 2 since it was built and had never been refused,
because the provider's limit is a function of the remaining balance: it sits at 8 or 16 for a funded
account and falls to 5 when the balance does. **A limit that moves with the balance fails precisely
when a run has spent enough to be worth protecting**, which is the first time in this repository that a
unit confusion has been invisible for months and then expensive once.

Task-level 1 cannot exceed a request-level 2 for this workload and is the only value that is safe at a
balance nobody controls from inside the workflow (`fc23de1`). The number alone reads as a conservative
choice and is not one, so the unit distinction is written next to the value with the failure attached.

**The second defect is the one worth keeping.** `litellm` was configured with `num_retries=4`, which
looks like the standard defence against a 429. It retried four times **at the same concurrency**, met
the same wall four times, and then propagated the error out of `run_tasks`, which took all 228 episodes
with it. A retry that does not change the condition that caused the failure is not a retry; it is the
same request performed again with a different request id. The escape from a concurrency limit is *less
concurrency*, and no retry count produces that.

| the check | what it did | what it was |
| --- | --- | --- |
| `max_concurrency: 2` | limited tasks | a request limit expressed in the wrong unit |
| `num_retries: 4` | repeated a refused call | four attempts at the identical refusal |

Neither is fixed by a larger number. The first needed the unit named; the second needs a retry that
lowers the concurrency it is retrying at, which is not implemented and is now the open item on this
lane. **Until it is, a refused l4 run is four refusals and a dead job** rather than a slower run, and
that is a property of the driver rather than of the account.

What this cost, stated plainly: two arms, fifty minutes, and the re-dispatch that R57's `adversarial`
reading was waiting for. The artefact from `42568927112` therefore does not exist, and the three-arm
readback still rests on the three separate dispatches Amendment 3 was written to replace.

### 34.94 The bill had four causes and the lane could see none of them

The question that started this audit was not "what is the score" but "why did a day of dispatches cost
what it cost". Nothing in the repository could answer it, and that inability is the first finding:

| the field | what it recorded | what it could not say |
| --- | --- | --- |
| `calls: { total, failed, scope }` | a **turn** count, or a distillation prompt count | tokens, or money |
| `diagnostics.agent_turns` | how many turns ran | how long each one was |
| `samples` | four gate verdicts | anything about cost |

`calls: 0` appears on every arm in `eval/results/history/`. So the four causes below were found by
reading the agent and the rate card, not by reading a dashboard — and each of them had been in place
long enough that its cost had become the cost of doing business.

**Cause 1: the memory arm destroyed its own prefix cache, on every turn.**

`MicrogliaAgent.generate_next_message` called `recall()` with the current turn's message and appended
the result as a *second system message*. The message sequence on turn N was therefore
`[system(policy), system(pack_N), user, assistant, …]` and on turn N+1 `[system(policy), system(pack_{N+1}), …]`.

| | reference arm | memory arm, before |
| --- | --- | --- |
| divergence point between consecutive calls | end of the conversation | the **second message** |
| tokens billed at the miss rate per turn | the new turn only | everything after the pack |
| tokens billed at the hit rate per turn | the entire history so far | the system policy only |

DeepSeek bills a cache hit at a fiftieth of the miss rate ($0.006 vs $0.30 per million), and an
episode's prompt is dominated by its own history. So the two arms of a paired comparison were being
billed at rates that differ by an order of magnitude on identical work, and the difference grew with
episode length — the longest episodes, which are the ones that matter for the hardest tasks, were the
most distorted.

**Cause 2: the treatment was not constant, and that is a science defect as much as a bill.**

A pack recalled per turn is a different intervention per turn. Every arm this repository has published
with a facade — including R57's three — measured a *sequence* of packs, and reported it as "the effect
of the memory". The two causes are the same line of code seen from two sides: the fix (settle the pack
on the first turn, hold it) removes the cost and the confound together.

**Cause 3: `deepseek-chat` is retired, and it still resolved.**

The name is scheduled for discontinuation and no longer in the provider's model list; while it
resolves, it resolves to `deepseek-flash`, whose **thinking mode is on by default**. Reasoning tokens
are billed at the output rate. τ²'s agent makes one tool call per turn, so a few hundred tokens of
deliberation before `get_order_status` is paid on every turn of every episode and cannot change the
reward. Two settings were therefore uncontrolled and unpriced: which model, and whether it thought.

**Cause 4: the peak window is exactly double, and every long run started inside one.**

| band | input, cache miss | input, cache hit | output |
| --- | --- | --- | --- |
| off-peak | $0.15 | $0.003 | $0.60 |
| peak (UTC 01–04, 06–10, Mon–Fri) | **$0.30** | **$0.006** | **$1.20** |

Reading the dispatch history against that table: `05:43`, `03:28`, `01:18`, `00:28` UTC — four
consecutive R57 legs, all inside a peak window. The person dispatching is awake in UTC+8, and UTC
01:00–10:00 is 09:00–18:00 there. **The lane's schedule was set by the operator's time zone, at a
factor of two.**

**What was done about each, and what is still open.**

| cause | repair | where |
| --- | --- | --- |
| cache destroyed per turn | pack settled on the first turn and held; 10 self-check cases | `a276f80`, `selfcheck_agent.py` |
| treatment not constant | same change, registered before the next dispatch | `prereg/R57` Amendment 4 |
| retired model, thinking on | `deepseek/deepseek-flash` pinned, `thinking: disabled` on both arms, recorded in the artefact | `run_split.py`, `sota.yml` |
| peak band | band and both bills reported by every run; scheduling is an operator action | `usage_stats()`, 12 self-check cases |
| nothing counted | `litellm` success callback → tokens, cache-hit rate, cost in both bands | `run_split.py` |
| **a retry that does not lower its concurrency** | **open** — `num_retries` retries the same refusal | see 34.93 |

**Two rules this adds.**

1. **A comparison between two arms is also a comparison between two bills, and the second one is
   invisible unless it is counted.** A per-task delta from an arm that paid ten times the input cost of
   its control is a valid delta and an invalid economic comparison, and every table in this repository
   was quoting the first without being able to say the second.
2. **A configuration that names a model is a fact with an expiry date.** `deepseek-chat` was correct
   when the lane was built and is a silent redirect now. The default is pinned to a name that exists
   on the date of the commit, the mode is requested explicitly, and the value is asserted in a
   self-check that fails if the retired name returns as a default.

### 34.95 The instrument could not see the effects it was reporting, and the arithmetic was free

A week of R57 dispatches produced one sentence — "a contradictory rule costs about 7pp" — that was
written into three internal documents and one competitive analysis. This audit recomputes it from the
artefacts and finds that **at 57 tasks the instrument cannot resolve anything smaller than about 21
percentage points**, so the sentence was never supported, and the proof cost nothing to obtain.

**Every `pass^4` run contains every smaller `k`.** A four-trial run stores one reward per
`(task, trial)`, so it also contains `pass^1`, `pass^2` and `pass^3`. Recomputing the same 228 episodes
at each `k` is arithmetic over committed data. For the three arms:

| arm | k=1 | k=2 | k=3 | k=4 | spread across k | sign stable |
| --- | --- | --- | --- | --- | --- | --- |
| `far` | +0.00 | −8.77 | −1.75 | +0.00 | **8.77pp** | yes (sits on zero) |
| `near` | +3.51 | −3.51 | −7.02 | −3.51 | **10.53pp** | **no** |
| `adversarial` | +5.26 | +7.02 | +14.04 | +7.02 | **8.78pp** | yes |

Positive is cost. The published ladder is the `k=4` row; `k=2` reverses `near` and turns `far` into an
8.77pp *gain*. **The aggregation chose the answer, and nothing in the repository asked it not to.**

**And then the p-values.** Exact McNemar on the paired cells, at every `k`, for every arm:

| arm | best p across k=1..4 | reading at the registered k=4 |
| --- | --- | --- |
| `far` | 0.383 | +0.00pp, p=1.000 (b=9, c=9) |
| `near` | 0.424 | +3.51pp, p=0.774 (b=5, c=7) |
| `adversarial` | **0.096** | +7.02pp, p=0.481 (b=11, c=7) |

Not one cell reaches 0.05. The most favourable reading anywhere in the grid is `adversarial` at
`pass^3`, p=0.096 — and that is the *wrong* `k` from the one the registration named.

**The power calculation that should have preceded the dispatch.** For a paired comparison the standard
error is `sqrt(discordance / n_tasks)`, and there is no term for trials. At `n=57` with the discordance
these artefacts actually show (16–18 of 57 tasks), the smallest effect detectable at 80% power is
**17.0–20.9pp**. Resolving the observed 7.02pp would need **504 tasks**; resolving 3.51pp, **1343**.

| question | n needed | n used | shortfall |
| --- | --- | --- | --- |
| does a contradictory rule cost 7pp? (`adversarial`) | 504 | 57 | **×8.8** |
| does a near rule cost 3.5pp? (`near`) | 1343 | 57 | **×23.6** |

**Trials were the expensive dimension and the one that bought nothing.** Because `pass^4` compresses
four Bernoulli draws into one per task, the discordant count *grows* with `k` (far: 16 pairs at `k=1`,
18 at `k=4`), and McNemar's standard error grows with it. So four trials produced a **wider** interval
than one would have (`±14.59pp` against `±13.75pp`) at four times the cost. **The cheapest reading of
the same run was also the sharpest, and the lane was configured for the opposite.**

**And the drift constant was one observation presented as a bound.** `CONTROL_DRIFT_PP` was 3.51pp,
taken from a single pair (R58 63.16%, R59 66.67%). Adding R57's three legs — whose control arm is an
identical condition, because the plant is applied to the memory arm only — gives:

| k | control readings (57 tasks, nothing changed) | spread |
| --- | --- | --- |
| 1 | 0.8596, 0.8070, 0.8772 | **7.02pp** |
| 2 | 0.6491, 0.6667, 0.7895 | **14.04pp** |
| 3 | 0.5965, 0.5789, 0.7193 | **14.04pp** |
| 4 | 0.5789, 0.5789, 0.6316 | **5.26pp** |

A noise floor has to be an upper bound of the spread, not a sample of it. It is now 5.26pp at the graded
`k`, computed from the artefacts (`eval/verifiers/power.py`) rather than from a comment.

**Two smaller defects found on the way, both of the same shape as the ones in 34.90–34.94.**

1. **One report, two sign conventions.** `r57_readback.py` prints each arm twice: as a ledger
   (`excess`, broken minus repaired, positive = a cost) and as the artefact's paired change
   (`deltaPp`, memory minus control, positive = a *gain*). For `adversarial` that produced
   `excess +4` and `pass^4 -7.02pp` in the same block of text, and the second one reads as "the memory
   helped by 7pp". Fixed at the boundary: a `cost_pp` property negates the artefact's sign once, and a
   self-check asserts the two lines agree rather than merely both being present.
2. **A self-check whose verdict depended on the hour it ran.** `selfcheck_usage.py` called
   `_cost(...)` with no timestamp, which read the wall clock, so the case asserting "1M missed input
   plus 1M output at peak costs $1.50" passed between 01:00 and 10:00 UTC on a weekday and failed
   otherwise. It was green in CI and red at 09:47 UTC today. `_cost` now takes the moment, and the
   case asserts **both** bands from fixed instants — which is also the only form of the test that can
   catch a rate card read backwards.

**The cost implication, which is the point of the whole audit.** The instrument that cannot resolve
7pp is the expensive one: 456 episodes per arm, each a multi-turn conversation with a growing prompt.
The instrument that resolves **2.2pp** is BIRD dev: 1,534 questions, one call each, discordance
145/1534 from R37's own artefact. Same repository, same provider, ~9.5× the precision at a fraction of
the calls. **The last four R57 legs bought statistical power on the wrong lane**, and no gate in the
repository was in a position to say so because no artefact recorded what an effect had to be before it
counted.

That gate exists now, and it is a verifier rather than a convention:

```
python3 eval/verifiers/power.py --arm far=/tmp/r57-far --arm near=/tmp/r57-near --arm adversarial=/tmp/r57-adv
```

### 34.96 Thirty artefacts, sixty-three arm readings, and the biggest effect was a regression

The BIRD lane has been able to run several prompt variants inside one dispatch for months, and every
artefact stores a per-case verdict for each of them under `arms`. Nothing had ever read that field in
aggregate. One pass over the 30 committed artefacts produces 63 paired readings, 17 of which resolve:

| arm | what it is | delta | broke | repaired | p | n |
| --- | --- | --- | --- | --- | --- | --- |
| `oracle` | the true table set instead of a link | **+33.14** | 0 | 116 | 2.4e-35 | 350 |
| `oracle` | same, four other artefacts | +30.0 to +45.5 | 1–3 | 67–119 | ≤1.9e-29 | 145–350 |
| `full-noevidence` | the prompt without the evidence hint | **−16.30** | 300 | 50 | 1.4e-44 | 1534 |
| `none-noevidence` | no pack and no evidence | **−17.01** | 331 | 70 | 1.1e-41 | 1534 |
| **`linked`** | **schema linking, as implemented** | **−9.58** | **202** | **55** | **6.4e-21** | **1534** |
| `full-verified` | the second-pass verification prompt | +5.71 | 8 | 28 | 1.2e-03 | 350 |
| `values` | column value annotations | +5.43 | 11 | 30 | 4.3e-03 | 350 |
| `full-transferred` / `full-anchored` | pack position / anchoring | +4.29 to +4.57 | 10 | 25–26 | ≤1.7e-02 | 350 |
| **`values`** | **the same arm, on the full dev set** | **+0.85** | 74 | 87 | **3.4e-01** | 1534 |
| `gated` | the distiller's admission gate | +0.29 | 0 | 1 | 1.0e+00 | 350 |

**1. Schema linking is the largest regression in the repository, and the paper says it is the second
largest gain in the field.** MCS-SQL measures +2.1 points from schema linking with the same model; here
it is **−9.58pp at p=6.4e-21**, on 1,534 questions, with 202 broken against 55 repaired. This is not a
small effect that failed to replicate — it is the most significant number the project has ever
produced, and its sign is wrong.

The explanation is in the same artefact and costs nothing to extract: classify every error by whether
the gold query reads a table the prediction does not.

| error class | primary arm | `linked` arm | change |
| --- | --- | --- | --- |
| a gold table is absent (`table-missing` + `table-both`) | 107 (16.5% of errors) | **291 (36.6%)** | **+184** |
| an extra table (`table-extra`) | 95 | 71 | −24 |
| same tables, wrong answer | 446 | 389 | −57 |
| no readable `FROM` | 0 | **44** | **+44** |

The pruner did exactly what its own docstring warned it would: it removed tables the answer needed, and
the model wrote a query over what it could see. The 44 unparseable predictions are the same failure in
its extreme form — a question whose every column lived in a pruned table. `linkSchema` already carries a
guard for this ("every ambiguity resolves towards keeping"), and the guard was not strong enough: it
fires only when nothing matches or when the closure covers two thirds of the database, which on BIRD's
thirteen-table dumps leaves plenty of room to prune a bridge table two joins away.

**2. The evidence hint is worth 33pp and everything this project builds is worth under one.** On the
same 350 questions: `oracle` +33.14pp (50.00% → 83.71%), `gated` +0.29pp with p=1.0, `full-grounded`
+0.00pp. On 1,534: removing the evidence costs 16–17pp. **Every product-side arm measured here —
grounding, sampling, gating, value annotations, lexicons, anchoring, transfer — moves between −10 and
+5.7pp, and the ones that resolve are mostly under one point on the full set.** The gradient in this
benchmark is the hint, not the memory, and no amount of mechanism-building changes that until the
mechanisms are measured on the part of the gradient they can actually reach.

**3. `values` did not replicate, and it is the same lesson as 34.95 on a different lane.**

| population | n | `values` | p | verdict |
| --- | --- | --- | --- | --- |
| the dev split | 350 | **+5.43pp** | 0.0043 | HELPED |
| the full dev set | 1534 | +0.85pp | 0.34 | UNRESOLVED |

One arm, two populations, opposite significance verdicts. The 350-case reading is the one that would
have been quoted — it is significant, it is the larger number, and it arrived first. **A result that
resolves on a fifth of the data and dissolves on the whole of it is not a result about the mechanism; it
is a result about the fifth.** The two populations are not identical (49.71% primary on the split,
57.76% on the full set), which is itself the point: a subset drawn from the front of a benchmark is a
different difficulty distribution, so a subset reading is a reading of *that* distribution.

**What this changes, in the order it should be acted on.**

| # | finding | consequence |
| --- | --- | --- |
| 1 | `linked` is −9.58pp at p=6.4e-21 | **the linker must not ship in any arm until a variant measures non-negative**; the additive form (never drop a table, order and annotate instead) is the one to test, because a pruner whose failure mode is "the answer needed that table" has no safe threshold |
| 2 | `oracle` is +33pp, product arms ≤1pp | the roadmap's next round is not another memory mechanism, it is **the gap between 50% and 83.7% on the same prompt** — the oracle's own table subset, which is supervision we are not using |
| 3 | `values` reverses between populations | every arm reading is quoted with its `n`, and a subset reading is labelled as a reading of that subset |
| 4 | 46 of 63 readings are unresolved | consistent with 34.95: most of these runs could not have resolved anything at the sizes they were run |

**The rule this adds.** `pnpm eval:verifiers` now reads every artefact's arms and grades them
(`eval/verifiers/arm_ablation.py`, 17 self-checks). An ablation that is not read is not an ablation; it
is a field in a JSON file, and this one sat in a JSON file for eleven rounds while the documents called
schema linking the next thing to build.

### 34.97 The lane that spends the money had no bill, and the arm was inert on three databases

Two rounds ago the τ² lane was given a bill because it had reported `calls: 0` for two months. The
BIRD lane was not, and it is the lane that runs on a schedule. Four defects were still live in it,
and the fifth was found only because the first four made it visible.

**1. The bill was thrown away at the only place it existed.**

`model-client.ts` read `body.usage.total_tokens` and discarded `prompt_tokens`, `completion_tokens`
and the cache split. Those three numbers are the entire explanation of a bill: a prompt token that
hits the prefix cache costs a fiftieth of one that misses, and two runs with identical totals can
differ by a factor of fifty. The 2026-11-09 scheduled run made **1,917 calls** in fourteen minutes
and the artefact could not say what it cost, in which band, or how much of the prompt was cached.

Fixed in four places, and the shape is the point:

| piece | what it holds |
| --- | --- |
| `eval/manifests/model-rates.json` | the rate card, as data with two readers |
| `packages/eval/src/cost.ts` | the arithmetic and the peak calendar, 38 self-checks |
| `model-client.ts` | prompt / completion / cached / reasoning per reply, accumulated **per band** |
| `sota-bird.ts` | one `[sota] usage:` line and a `usage` block in the artefact |

Per band and not per run is load-bearing. A run that starts at 03:50 and ends at 04:20 was billed
peak for ten minutes and off-peak after that; booking the whole run at the band in force when it
*ended* is not an approximation, it is a different number, and it is the clock that decides it —
which is exactly the defect class this repository spent a week removing. `run_split.py` reads the
same card now instead of its own hardcoded copy, and a self-check asserts the driver's rates equal
the file's, so the two readers cannot drift.

**2. The lane asked for a model that no longer exists, and the workflow never set the variable.**

`const MODEL = process.env['SOTA_MODEL'] ?? 'deepseek-chat'`. The BIRD job's env block sets fourteen
`SOTA_*` variables and not that one, so every BIRD run asked for the retired id, was silently routed
to the current model, and recorded the name it had asked for. `bin/lib.ts` held the same literal a
third time. The τ² lane was corrected when this was found there; this one was not, which is how one
defect survives a fix — **a default is a fact with an expiry date, and there were three places
holding it.**

**3. Thinking was never controlled and never counted.**

Nothing in this lane sent a thinking switch or read `reasoning_tokens`, and the provider's default
for the current model is to think. A reasoning token is billed as an output token — four times an
uncached input token on this card — and is invisible in every field except a count nobody read. The
lane now records the reasoning share and can send either switch; the default is left at the provider's
so that the baseline under every published BIRD cell does not move silently. **The decision is left
to a number, not to an assumption about which direction is better.**

**4. The one recurring cost in the repository was scheduled inside a peak window.**

`cron: '0 3 * * 1'` is 03:00 UTC Monday, squarely inside 01:00–04:00, where every rate is exactly
double. A cron expression is a dispatch nobody re-reads: the cheapest run to schedule was the most
expensive one to buy, once a week, whether or not anyone was watching. It now runs at 18:00 UTC,
outside the card's windows and outside the provider's published discount boundary as well, so the
choice survives a correction to either.

**5. And then the instrument found the bug that mattered more than any of them.**

The first offline reading of the schema-ordering ceiling — zero model calls — reported 443 of 1,534
dev questions as "the gold table is not in the schema". That is not a plausible number, so it was
checked, and the check found two defects in the parts everybody trusts:

- **`schemaBlocks` parsed a backticked `CREATE TABLE` into zero blocks.** SQLite stores the statement
  as written, and BIRD's dumps use three quoting conventions: double quotes, backticks, and none. The
  identifier pattern knew two of them, so `toxicology`, `thrombosis_prediction` and `student_club`
  parsed to nothing — and `annotateSchema` reads `blocks.length <= 1` as `single-table` and returns
  the DDL unchanged. **The `linked-additive` arm was inert on those databases**, and its next dispatch
  would have published a null about ordering from three databases in which no ordering ever happened.
  An instrument that cannot fire reports its own absence as a result.
- **The same shortcut read the foreign key's target table as a column of this one**, because it
  returned every quoted name in the statement in order. It kept tables rather than dropping them, so
  it never broke an answer; it did put another table's name in this table's anchor set.
- **Names were compared case-sensitively.** SQLite resolves identifiers case-insensitively and BIRD
  relies on it — `postHistory` is declared and `posthistory` is queried, in **298 of 1,534** dev
  questions. Every one of those read as a harness defect invented by the measurement.

All three are fixed with tests that fail first: a backticked statement, a foreign key that must not
become a column, and a case that must resolve. `schemaBlocks`'s fix is a **behaviour change to two
measured arms** — `linked` now prunes on databases where it previously did nothing, and `values`
annotates schemas it previously left alone — so the −9.58pp regression is, if anything, understated,
and both arms are re-measured rather than compared against their old readings.

**The free measurement, and the number it exists to produce.**

`schemaBlocks` fixed, the ceiling can be computed in seconds from gold queries:

| signal | clean ordering | mean depth | precision | recall of gold |
| --- | --- | --- | --- | --- |
| lexical anchors (the shipped arm) | 42.89% | 49.63% | 49.98% | 87.38% |
| retrieved gold tables, k=5 | 56.58% | 44.04% | 47.93% | 95.05% |
| both, recall first | **56.65%** | **43.00%** | 39.27% | **99.66%** |

`clean` is every gold table ahead of every non-gold one — the strongest thing an ordering-only
mechanism can do. Paired on the same 1,534 questions, **+13.75pp [+10.30, +16.88], p < 1e-4**, for
zero model calls. Three consequences, none of which were visible before:

1. **Anchors are nearly redundant once recall is present**: 868 → 869 clean questions (+0.07pp) while
   precision falls 8.7 points. The signal to ship is recall-first, and the anchor pass is a
   fallback for the questions retrieval cannot serve.
2. **The ceiling is 56.65%, not 100%.** More than four questions in ten cannot be ordered cleanly by
   any table-set signal, because the gold query's tables are not determined by the question. An
   ordering arm therefore cannot be expected to deliver the 13.23pp that `error_budget` prices
   schema linking at; it can only reach the share of it that ordering touches.
3. **The measurement is worth more than the dispatch it was meant to justify.** It cost nothing, and
   it found a parser defect that had already been committed, tested and reviewed.

### 34.98 The arm and the measurement are now the same code, and a stand-in proved it before it was paid for

Round 63 ships the arm the free ceiling argued for. The interesting part is not that ordering by
retrieved gold tables is better than ordering by lexical anchors — that was measured last round at
+13.75pp of clean orderings for zero calls. It is that the two now share an implementation, so the
number a dispatch reports and the number the measurement predicted cannot drift apart without one of
them being wrong.

**One reordering primitive, composed twice.**

`orderSchema(ddl, preferred, source)` keeps every table and puts the given ones first *in the order
given*. `annotateSchema` is now `anchorTables` + `orderSchema(…, 'named')` and its output is
byte-identical, which the existing tests assert rather than trust. The distinction that forced the
split is one line of semantics:

| ordering | who decides the order inside the moved group |
| --- | --- |
| `annotateSchema` (the control arm) | the DDL's declaration order |
| `orderSchema` (the new arm) | the signal's own priority |

Under declaration order a signal can only add a table ahead of the first non-gold one and can never
demote a wrong anchor, so a *better* signal is structurally unable to produce a better ordering — and
a null from it would be a null about the ordering rather than about the evidence. Changing that is
what made measuring the good version possible, so the arm had to change it too. The two arms now
differ in exactly one decision, which is what a paired comparison needs.

**The measurement bin now calls the lane's functions.**

`bin/table-recall.ts` used to build its own neighbour pool with its own fold filter. It now calls
`goldIndex` and `recalledFor` — the same two functions `runFold` calls — and reproduces its
predecessor's numbers exactly: 42.89% anchors, 56.58% recalled, 56.65% both, +13.75pp
[+10.30, +16.88]. That reproduction is the only evidence that the lane runs the mechanism that was
measured, and it is worth more than the refactor's tidiness.

**A trap the refactor set, and the comment it earned.** Regrouping the loop by fold changed the order
of the paired vector, and the seeded bootstrap returned [10.63, 17.01] instead of [10.30, 16.88] for
identical data. Nothing was wrong with the statistics — a bootstrap interval is not invariant to
permutation bit-for-bit — but a published interval that moves when nothing moved cannot be compared
against itself. The array is now filled at the row's own position, and the reason is written where
the loop is.

**The artefact reports the ordering, from the prompts the arm actually sent.**

`ordering` carries `summariseOrderings` — the same function `tableRecallOf` uses — over
`readOrdering('both', …)` readings built from the DDL this arm emitted, plus `retrieved_share` and
`recall_k`. So a dispatched run states whether it reproduced the ceiling it was chosen on. A clean
share outside ±5pp of 56.65% is a wiring defect and says nothing about ordering; `V7-channel`'s floor
of 0.01 remains the alarm for the case where the arm says nothing at all.

**Proved against a stand-in before it was paid for.**

The lane has had `DEEPSEEK_ENDPOINT` for rounds and this is the first time it was used to prove a new
arm. A 40-line HTTP server answering `SELECT 1` with a fixed usage block, `SOTA_LIMIT=20`, the dev
split on disk:

```
[sota] arm linked-additive: 5.00%
[sota] arm recall-order: 5.00%
[sota] recall-order: clean=13/20 (65.00%) depth=35.44% precision=39.19% recall=96.67% retrieved=80.00% k=5
[sota] model=deepseek-flash thinking=provider-default [sota] usage: prompt=142,800 (cached=95,200, 66.7%)
       completion=4,760 bill=$0.0103 (peak 0.0%) all-off-peak would be $0.0103 reasoning=0
[sota] failed: MG_E_CONFIG: The benchmark ran but cannot support a claim (V1-pack-not-empty: 0.00
       rules/question; V5-resolution: not estimable; V32-fold-learning-intact: 19 distillation failure(s))
```

Every mechanism this round added appeared in that output, and the run then refused to publish a claim
because a stand-in that answers every question with `SELECT 1` cannot support one. **That refusal is
the gate working**, and it is the difference between a smoke test and a rumour.

**Two priors the free measurement had to supply before the dispatch could state a prediction.**

| quantity | value on the dev split | why the dispatch needs it |
| --- | --- | --- |
| `prompts_changed_share` | 1,534 of 1,534 (100%) | turns the channel floor from an alarm into a prediction |
| `retrieved_share` | 1,534 of 1,534 (100%) | bounds "the arm fired through its anchors, not its signal" |
| mean tables moved | 4.88 per question | says how much of the schema the head of the prompt becomes |

**And the resolution, stated before the run.** At n=350 and a paired discordance near 18%, the design
resolves about 6pp at 80% power. R63 therefore cannot confirm a 2pp effect and must not be read as
having refuted one. The registration says so in the header of the file rather than in a footnote,
because the alternative — reading a null from a 350-question slice as evidence of absence — is the
error this project keeps finding in its own history.

### 34.99 The cap that stopped a run after it had paid for a fifth of it

The first real dispatch of `recall-order` (`42634151808`) ended at fold 1 of 5 with
`MG_E_BUDGET_EXCEEDED`: 757 calls spent, 4,088 needed, cap set to 4,000. The cap was the dispatcher's
estimate, not the lane's — and the estimate was 88 calls short of a number the lane computes after its
first fold.

Three observations, in order of how much they matter.

**The forecast did what it exists for.** It stopped the run after one fold rather than after five,
which turned a 4,088-call loss into a 757-call one. That is the designed behaviour and it held.

**And the run still produced nothing.** A stop preserves the folds that finished in a `.partial`
artefact, and that file is deliberately never published as evidence — correctly, because one fold of
five cannot support a registered claim. So a budget stop costs the whole run in evidence even when it
saves calls in money. The lesson is not that the forecast should publish; it is that **the cap is a
prediction and a prediction needs a measurement behind it**. The workflow's own description of the
input now carries the number the first fold produced:

| split | arms | calls |
| --- | --- | --- |
| dev | four | 6,504 |
| **minidev** | **four** | **about 4,100** |
| train | two, 6,600 questions | about 14,600 |

**The existing default was already correct.** `max_calls` defaults to 8,000, which covers every split
this repository dispatches. The run failed because a dispatcher overrode a good default with an
estimate. That is a specific and repeatable failure mode: *a knob whose default is measured gets
overridden by a person who is being careful about money.* The description is the only place the
correction can live, because the value is per-split and per-arm-count.

The re-dispatch used 5,200, which is the measurement plus a quarter.

### 35.00 A claim written before the code was read, and the arm that was there all along

While the R63 dispatch ran, the literature on schema linking and self-correction was read and written
into `COMPETITIVE.md` and `ROADMAP.md`. The first draft of both said the same thing: *self-correction
with no memory has never been measured in this lane, and `none` denies the model feedback every
published competitor gives it.* The second half is true. The first half was false, and it was written
without opening the retry path.

`retry-blank` is that control, exactly. The retry pass in `sota-bird.ts` builds its prompt from the
failed attempt, the execution error and the pack — and for `retry-blank` the pack is `''`. That is
*execute, feed the error back, revise, with no memory*, which is the mechanism arXiv:2606.29733 reports
at +3.06pp (p=2e-11) on CodeLlama-7B and +3.65pp (p=6e-11) on Llama-3.1-8B.

And the number exists — in prose. `prereg/R17-framing.md` quotes `retry-blank` at **+0.57pp, 2 gained
and 0 lost**, beside `full-onretry` at +1.43pp with 5 gained and 0 lost. Those two are the only
non-negative readings this project has ever recorded for any arm family. Neither is checkable:

```
$ grep -rl retry-blank eval/results/            # nothing
$ git log --oneline -S retry-blank -- eval/results   # nothing
```

Not now and not at any point in the repository's history. A dispatch that leaves no artefact produces a
number that lives in a pre-registration's prose, and prose is the one place this project's own standard
(`power.py`, `arm_ablation`, `--artefact` on every verifier) says a reading cannot live.

**Three things this changes, in order of how much they cost.**

1. **The published +3pp and our +0.57pp are not in conflict.** Their measurement is on open-weight
   models at 21–50% execution accuracy and their own text says self-correction gains "wherever models
   have headroom". At 53% on minidev this lane has less of it. The honest expectation for a
   re-measurement is a small positive — which is exactly what the unquotable number says, and that
   agreement is not evidence, it is a coincidence until an artefact exists.
2. **`none` is a handicap baseline, and that stands.** Whatever the arm's size, the 57.63% dev cell is
   produced by a pipeline that never retries, while the published systems above it all do. Every memory
   delta in this repository is therefore a delta between two arms that are both behind the state of the
   art on a mechanism nobody registered as missing.
3. **The arm whose evidence is missing is the arm that keeps winning.** Two of two non-negative
   readings in the whole record are retry arms, and both are prose. That is the pattern the
   `arm_ablation` verifier was written for — *the largest effect in the repository was a regression
   nobody read* — repeating in the one direction the verifier cannot look, because there is no file.

**The fix is a re-measurement, not a new arm.** `retry-blank` already exists, already costs one extra
call per failed question, and needs a registration and a split. The draft of this section was going to
propose building a `self-correct` arm; had it been committed unread, the next round would have built a
duplicate of a mechanism that has been in `OPTIONAL_ARMS` for twenty rounds, and the duplicate would
have had a different prompt and therefore a different number. **A claim about what has not been
measured is a claim about the code, and it has to be checked against the code.**

### 35.01 The answer budget was 700 tokens and the model started spending it before writing

The first *valid* R63 run failed its own validity gate, and that is the most useful thing that has
happened to this lane in three rounds.

```
[sota] n=350 without=30.29% with=32.57% delta=2.29pp ci=[-1.43, 6.00] p=0.2800 calls=1989
[sota] arm linked-additive: 30.29%
[sota] arm recall-order: 30.00%
[sota] recall-order: clean=157/350 (44.86%) retrieved=100.00% k=5
[sota] usage: prompt=2,030,685 (cached=1,349,893, 66.5%) completion=1,423,622 bill=$0.9603
       reasoning=1354007
[sota] failed: MG_E_CONFIG: the benchmark ran but cannot support a claim
       (V3-parse-rate: 51.43%; V32-fold-learning-intact: 612 distillation failure(s) (43.7%))
```

**1,354,007 reasoning tokens out of 1,423,622 completion tokens.** Across 1,989 replies that is 681
tokens of thinking per reply against a `max_tokens` of 700, which left about nineteen for a SQL
statement. Half the replies were truncated before they contained one.

**The comparison that makes it a regression rather than a discovery.**

| dispatch | model asked for | `V3-parse-rate` | `none` accuracy | reasoning tokens |
| --- | --- | --- | --- | --- |
| 2026-11-09, scheduled | `deepseek-chat` (retired, routed) | **100.00%** | **53.14%** | not recorded |
| 2026-11-09, R63 | `deepseek-flash` | **51.43%** | **30.29%** | 1,354,007 (95%) |

Same split, same 350 questions, same lane, same four arms, comparable call counts (1,917 against
1,989). The only thing that changed between them is round 62's correction of the model name — a change
made so the artefact would stop recording a model that did not answer.

**What that correction actually was.** `deepseek-chat` is a retired alias the endpoint keeps answering
by routing it somewhere else. The route it chose did not think. `deepseek-flash` does, by default.
So a correction to a *string* silently changed the *decoding regime*, and the lane's 700-token budget
— correct for as long as no model thought — became an answer budget of nineteen tokens.

**Why nothing caught it for a round.** `thinking` was never sent and never recorded, so every artefact
before round 62 describes a run whose reasoning share is unknown, and every artefact after it describes
one where the share is 95%. A table that mixes them is a table of two regimes under one heading. The
only reason the second run is interpretable at all is that round 62 added the `max_completion_tokens`
and reasoning fields **before** this happened rather than after.

**What the gate did.** `V3-parse-rate` requires 95% and the run produced 51.43%, so the lane refused to
publish and the workflow's publish step found nothing. That is the second time this round that a
refusal cost a run and saved a claim; the first was the budget cap. Both are the same design principle
working: *a lane that cannot support a claim must not produce an artefact that looks like one.*

**The fix, and why `off` is not a preference.**

`packages/eval/src/decoding.ts` holds the measured quantity. `THINKING_HEADROOM` is 1,200 — the 681
observed, rounded up with room for the tail — and `answerBudget(answerTokens, thinking)` adds it, so a
thinking run asks for the answer it wants *plus* the room to think rather than trading one for the
other. The lane's default is now `off`, which is the regime every published BIRD cell in this
repository was produced in. The comment that said the opposite — *"every published BIRD cell in this
repository was produced with thinking on"* — was a fact nobody had measured, sitting directly above the
switch that measured it.

**And a second defect from the same run, in the verifier rather than the lane.**
`ordering.py` compared this run's `cleanShare` (44.86% on minidev) against the dev prior (56.65%) and
would have called it divergent, while the run's precision (39.98% against 39.27%) and gold recall
(99.48% against 99.66%) said the mechanism was identical. A clean-ordering share is a property of the
question set as much as of the signal, so the verifier now returns `INCOMPARABLE` across splits and
`prereg/R63-recall-order.md` carries an amendment recording that its second criterion was written
against the wrong population.

**The general form.** A default that names a *thing* can change a *behaviour*, and the artefact has to
record the behaviour. `model` was recorded and `thinking` was not, so for one round the repository had
a column of numbers it could not attribute — and the only reason it is now attributable is that the
third defect (parse rate) was loud where the first two were silent.

### 35.02 The retry population is 6.4% of the benchmark, and the arm registered for it could not have run

The first valid R63 run published, and the same iteration measured the population that the next
registration was written around — without spending a call on either question twice.

**The decoding fix, read back.** Same split, same 350 questions, same four arms:

| dispatch | `V3-parse-rate` | `none` accuracy | reasoning tokens | completion | bill |
| --- | --- | --- | --- | --- | --- |
| before, `deepseek-flash` thinking on | 51.43% | 30.29% | 1,354,007 (95%) | 1,423,622 | $0.9603 |
| after, `thinking=off` | **100.00%** | **51.43%** | **0** | **163,916** | **$0.2165** |

Thinking was spending 8.7× the completion budget to make the answer 21 points worse. The lane now
sends the switch, records it, and adds `THINKING_HEADROOM` to the answer budget when it is on.

**R63's result, and the branch it selects.** `recall-order` (schema ordered by the gold tables of the
five nearest training questions) came in at **+0.86pp** against `none`, CI [−1.43, +3.14], p = 0.65.
`linked-additive` (same ordering, no pruning) came in at **+2.00pp**, CI [−0.29, +4.29], p = 0.14.
The ordering line is closed **for accuracy** — the branch the registration named in advance — while
the free ceiling and the `ordering` block stay, because they price schema linking for every later
arm.

What makes the number readable is the free measurement it is compared with: ordering by retrieved
gold tables wins the strict criterion on **56.65%** of dev questions against **42.89%** for lexical
anchors, **+13.75pp** [10.30, 16.88], p < 1e-4. So the largest free ceiling this project has ever
measured converts to **+0.86pp of accuracy, indistinguishable from zero**. That is not a failure of
R63; it is the conversion factor between "the prompt contains the right information in the right
order" and "the model answers differently", and it is now a measured quantity rather than an
assumption behind four rounds of schema work.

The instrument also reproduced the offline audit exactly — precision 39.98%, gold recall 99.48%,
retrieved 100%, depth 51.00%, all equal to the values `pnpm eval:table-recall` computes with no model
at all — because the arm and the audit call the same functions. Only `cleanShare` differed (44.86%
on minidev against 56.65% on dev), which is a property of the question set and was recorded as
non-transposable in R63's Amendment 1 *before* the dispatch.

**Then the population, which is the part worth the audit entry.** R64 registers `retry-blank` — the
arm whose +0.57pp (2 gained, 0 lost) has been quoted for twenty rounds with no artefact behind it —
and it predicted that "at least 140 of the 350 questions" would be retried, reasoning from a 53% base
accuracy to 165 failures. A retry arm does not act on failures. It acts on the questions the
**pipeline** rejected: no query, an execution error, or a result set with no rows. Those three facts
are decidable without the answer key, which means the population is a property of the pipeline and
could have been counted from artefacts already in the repository.

It was:

```
split=minidev  retried=26/350  (7.43%)  no-query=0 error=1 empty=25
split=dev      retried=98/1534 (6.39%)  no-query=0 error=9 empty=89
```

The registration's floor of 140 cannot be reached on **either** split — 98 is the whole population on
dev — so a dispatch would have burned a run to discover that its own void condition had fired. The
prose numbers turn out to be invertible, which is how the population is confirmed from the other
side: 0.57pp × 350 = exactly 2 questions and 1.43pp × 350 = exactly 5, and both were repairs out of
**26**. A 7.7% repair rate measured on 26 questions has a 95% interval of roughly [1%, 25%], which is
why neither reading was ever published as a rate.

**What the empty results are made of**, from the same pass, at zero additional cost:

```
examined=89  same-tables=54 (60.67%)  value-miss=32 (35.96%)  ranking-miss=5
             missing-table=19  extra-table=16
```

**36% of the entire retry population is a query that read exactly the right tables and filtered on a
value the database does not spell that way.** Only 39% is a table-selection miss — the bucket R63 just
measured as not moving. So the retry line's information deficit is values and aggregation, not schema
text; and the R64 amendment records that before the dispatch rather than after, because a positive
delta from the arm alone cannot tell "the second attempt re-read the question" from "the second
attempt found the right spelling".

**The mechanism and the report are one function.** `retryTriggerOf` holds the three conditions, the
lane's retry prompts read it, and `pnpm eval:retry-population` — the audit that counts the population
— calls the same function against the same execution. Every artefact from this round forward records
`retry_population` per run and `retryReason` per question, so the next reader does not have to
re-execute 1,534 statements to know how many questions an arm could touch.

**The general form.** A control arm's population is not the failure count. It is the set of questions
the pipeline itself rejected, it is measurable for free from artefacts that already exist, and it
belongs in the registration *before* the dispatch — R64's prediction was off by a factor of five, and
the only reason that cost nothing is that the arm and the audit share their trigger.

### 35.03 Four gates broke on the size of the tree, and none of them was about the tree

Committing one published artefact turned four checks red, in four different files, for one reason:
each of them had pinned how large the repository is rather than what shape it has.

| where | what it pinned | what it should have asked |
| --- | --- | --- |
| `prereg/R63` header | the gate set the lane emitted when the file was written | `eval:protocol` refuses an artefact whose registration does not name a gate the run emitted — correctly, so the three new gates went into the header with a dated note |
| `scripts/check-coupling-ledger.mjs` | `deferred.length === 14` | every deferral carries a reason longer than a placeholder, and there is at least one |
| `ci.yml`, the ledger step | `a.family.datasets === 18 && a.family.positive === 6` | the same contrast reverses in more artefacts than it holds in, and the three buckets account for every dataset |
| `sota.yml`, the `max_calls` description | dev at four arms costs 6,504 calls | the same figure cold is 12,383, which is why R64 stopped after its first fold |

**The last one is the expensive one.** R64 went out with a cap of 9,000 against a measured 12,383 and
lost a fold — 2,293 calls, about a quarter of the run's budget — to a number that had been true once.
The lane printed the forecast and refused, which is why the loss was one fold and not five, and that is
the design working: `MG_E_BUDGET_EXCEEDED` is a refusal, not a failure.

**The general form.** Every one of these was written to be a *relation* and ended up a *count*. A
count is true of one tree and false of the next, and its repair is always an edit to the number, which
teaches the project to edit checks. A relation is true of every tree it was meant to hold for, and it
still goes red when the property it names stops holding — which is the only red worth having.

The two ledger checks now assert relations and keep their discriminating power: the coupling
self-test blanks a reason instead of flipping a verdict the scanner cannot produce, and the ledger gate
checks that the reversal is a majority and that the statement quotes its own counts. The `max_calls`
description now carries the cold figure next to the warm one, because the difference between them is
the entire reason the cap was wrong.

### 35.04 The promotion bar sat above the band it was paired with

R64 came back inside all three of its amended predictions and still could not be promoted, and the
reason is arithmetic that was available before the run.

**The reading.** 98 retried questions out of 1,534, 20 of them repaired, +1.30pp on the benchmark with
nothing regressed and gains spread over all five folds (1, 3, 5, 6, 5). The zero-cost measurement made
from R63's artefact predicted 98 and produced 98; one question moved from the `empty` bucket to the
`error` bucket. The retry line exists, it repairs one rejection in five, and it costs $0.44 to see.

**Finding 1 — a registration that amends a threshold amends prose, and the lane reads a number.**
The artefact says `retry_population.meetsFloor: false`. It says that because `SOTA_RETRY_FLOOR`
defaulted to **140**, the floor the registration opened with, while Amendment 1 had lowered it to
**90** two hours earlier. 98 clears 90. The document and the dispatch disagreed about whether the
evidence cleared its own bar, and the artefact took the dispatch's side.

This is the third instance of the same defect in this record, and the pattern is exact: a number is
written in a registration, read by a lane, and changed in only one of the two places. The repairs so
far have been per-instance. This one moves the floor out of the lane and into `retry-trigger.ts`, next
to the summariser that reports it, and adds a test that asserts the constant equals the figure R64's
amendment registers. The next amendment therefore has to touch the code, which is what makes the drift
impossible rather than merely noticed.

**Finding 2 — a bar that the prediction beside it can never reach.**
Promotion required the repaired rate's *lower* bound to exceed 25%. At n = 98 a rate near 20% carries a
standard error of about 4.1pp, so the measured lower bound is 13.27%. For a lower bound above 25% the
point estimate has to be ≈35% — half a standard error inside the top of the band the same document
predicted (15–45%), and well above the value it said to expect ("ours has less headroom, so the lower
half of the band is the expected one"). The bar and the prediction were written one page apart and
they describe different worlds: the bar tests whether this model behaves like a model with twice its
error mass.

Closing had the mirror-image problem: the upper bound had to fall below 10%, and it is 28.57%. So the
result is in the only region the document did not assign: not promoted, not closed, and not void.

**Finding 3 — a void condition in prose is a condition somebody has to remember.**
R65 states two ways a dispatch stops being the test it describes: the arm fires on fewer than 80% of
questions, or its character cap drops an example on more than 5%. Both are properties of the *prompt*,
both are measurable from the plan alone, and neither is visible in an accuracy delta — an arm that
fired on half the questions and one that fired on all of them can produce the same number. They are now
`V75-exemplars-delivered`, pushed whenever the arm is configured, including when it fired on nothing:
that state is a wiring defect and the gate fails rather than signing a vacuous pass.

The block itself is capped by dropping the *last* exemplars and never by truncating one. A truncated
`WHERE` clause is not a shorter lesson, it is a wrong query that the model is invited to copy, and this
record already has one arm whose entire effect was imitation.

**What the audit changes in the plan.** Two rules go into the roadmap's measurement section:

1. **A promotion bar is part of the prediction, not a second document.** If a registration predicts
   `p̂ ∈ [15, 45]%` with a point above 25%, its promotion threshold has to be expressible as "point
   above X with an interval excluding zero" for an X the band contains. A lower-bound bar at the band's
   midpoint is a bar that requires the top of one's own prediction.
2. **The ceiling of a conditional treatment is its population share, and that is measurable before the
   treatment exists.** A retry cannot move this benchmark by more than 6.39pp; measuring a fifth of
   that ceiling is a real effect, and knowing the ceiling first is what stops a small number from being
   read as a failed mechanism or a large claim.

### 35.05 The exemplars work, the interval is a lie, and the branches had a hole

R65 was the register's last two-digit lever: `oracle` is +33.14pp and undeployable, and the lawful
approximation is three correct worked examples from the same database. Two dispatches measured it.

| | run `42725249396` (void) | run `42729684852` (valid) |
| --- | --- | --- |
| dose delivered | 2 exemplars on 9.71% of questions | 3 on 98.3% (`V75` pass) |
| `none` | 52.00% | 51.14% |
| `full` | 54.00% (+2.00pp) | 50.86% (−0.29pp) |
| `examples` | 53.71% (+1.71pp) | **56.57% (+5.43pp [+1.43, +9.43])** |
| `examples − full` | −0.29pp | **+5.71pp [+1.71, +9.71], p = 0.0078** |
| bill | $0.1352 | $0.1236 |

**Finding 1 — the void clause did its job, and the repair was the instrument.** The first run's gate
fired because 34 of 350 questions could not hold the third exemplar at a 1,200-character budget. The
lane refused the run. Amendment 1 raised the budget to 1,600 and left the hypothesis, the dose and the
thresholds untouched; the re-run delivered the registered dose on 98.3% of questions.

**Finding 2 — the interval in an artefact is conditional on the dispatch.** The arm's prompt content is
deterministic, and the same arm measured +1.71pp and +5.43pp on two dispatches. The movement is not
confined to the treatment: `none`, a fixed prompt with no store, moved **0.86pp**; `full` moved
**3.14pp**, and its store genuinely differed — **680 → 684 corrections, 1,321 → 1,313 active items,
38 → 42 fresh distillations** against a warm cache. So the between-dispatch spread on 350 questions is
3–4pp, the same size as the bootstrap interval and larger than every sub-4pp effect this record has
published.

That does not overturn any direction — both runs put `examples` above `none` and at or above `full` — but
it does mean a single dispatch cannot decide a 5pp question here. The `min_detectable_pp` gate (4.31 at
n=350) has been read as a property of the sample; it is also, and more bindingly, a property of the
*dispatch*.

**Finding 3 — the branches of a refutation must tile the outcome space.** The valid run landed at
+5.43pp: above the +4pp closing threshold, below the +6pp promotion threshold. The result is neither
promoted, nor narrowed, nor closed — because the registration left a two-point hole between its
branches. R64 has the same defect in a different shape (promote at a lower bound above 25%, close at an
upper bound below 10%), and it too returned a result in the unassigned region. Two registrations, one
iteration, the same structural error:

- R64's space: `LB > 25` / `UB < 10` — everything with 10 ≤ UB and LB ≤ 25 is unassigned.
- R65's space: `|Δ| ≤ 4` / `Δ ≥ 6` — everything in (4, 6) is unassigned.

The repair is the one `classifyEmptyAttempt` needed two iterations ago: an ordered classifier that
partitions, not a list of conditions that might. Amendment 2 does it for R65 by fiat — a result in the
gap is not promoted and not closed, it is **replicated** — and the rule goes into the roadmap so the
next registration writes branches that tile.

**Finding 4 — the replication lowered the answer, and the rule said it would.** Two further dispatches
of the same configuration read **+3.14pp** and **+2.86pp**; pooled over three valid runs the arm is
**+3.81pp** (95 gained / 55 lost, n = 1,050, exact p = 0.0014) and +4.28pp against the memory pack,
which is null on all three. The pooled estimate is inside the ±4pp closing band that Amendment 2 named
before those runs existed, so the line closes — at the pooled value, not at the best single dispatch.
Three dispatch-level readings of one deterministic prompt (+5.43, +3.14, +2.86) are the practical
statement of Finding 2.

The substantive result: **three correct worked examples from the same database are worth about four
points**, so `oracle`'s +33.14pp is a fact about the answer key rather than about the prompt. That is
what the registration said a delta inside the band would mean, and it is now measured rather than
argued.

**What the audit changes.** Rule 12: *a refutation must partition the outcome space*. Rule 13: *an
interval computed within one dispatch is not an interval over dispatches; a claim below the dispatch
spread is a claim about one draw*. Both are cheap to check at registration time and both have now cost
a run.

**And one process finding, at the same level.** `eval:protocol` refused R67 — the Refutation section
used a numbered list where the checker wants bullets — and the commit went out anyway, because the check
was piped into `tail -2` and a pipeline's exit status is `tail`'s. The docs repository records the
consequence below; the lesson is that a verification step whose result is filtered is not a verification
step.

## 35.06 The confound that a half-variable configuration made permanent (2026-11-10)

**Finding.** Three values decide where a run's tokens are bought: the model id, the host, and the
credential. Two of them were variables (`SOTA_MODEL`, `DEEPSEEK_ENDPOINT`) and one was a literal —
`process.env['DEEPSEEK_API_KEY']` read at the top of the lane with no alternative. The consequence is
narrow and it survived for weeks: the lane could be *pointed* at another provider's host while still
*sending* this provider's key, so the one comparison this project keeps promising — the same scaffold
on a different backbone — could not be run, and the table kept printing "on a different backbone" as a
caveat. **A confound that cannot be removed by configuration reads like an acknowledged limitation and
behaves like an unexamined assumption.** Rule 15 in `ROADMAP.md` is the general form: a caveat that
survives many iterations beside the same number is a missing experiment.

**Why the failure mode is worse than a rejected request.** A key for the wrong provider does not
arrive as a status code a reader sees. It arrives as `4xx` → `verdictOf` classifies it `refusal` → the
eight-prompt breaker trips → the artefact says the endpoint stopped answering. The τ² lane already paid
for this exact shape once: 32 prompts, 32 empty answers, and a store with no knowledge in it, reported
as a finding about the model. So the fix refuses the combination *before the first call*, and the
credential's origin is written into the artefact as `model_credential: lane | deepseek | none`.

**Finding, second order — the fix nearly broke the workflow it was protecting.** The first version
refused every borrowed key on every foreign host, and the repository's own documented rehearsal
(`eval/drivers/stand-in.mjs` behind `DEEPSEEK_ENDPOINT`, which spends the real key against a dummy
server that authenticates nobody) is exactly that combination. Nothing in the test suite would have
caught it: the stand-in has no test that sets both variables. It was caught by reading `README.md`
while writing the paragraph that documents the new variable. The loopback hosts are now exempt by
name, decided on the host rather than on the port, and the exemption is pinned by a test that iterates
`127.0.0.1:8123`, `localhost:3000`, `[::1]:9000` and `0.0.0.0` — plus one that refuses
`localhost.example`, because a substring test would have passed that too.

**Verification.** 14 tests on the new module, four coverage dimensions at 100% for the repository
(3,819 tests, 186 files), `pnpm typecheck:lanes` green, coupling ledger 175 modules / 16 deferred /
`core` 0. The new registration is `prereg/R68-backbone-scale.md`, and it states in its own refutation
that it is a scale ladder on one host rather than a replication of the published Qwen2.5-Coder-7B row.

## 35.07 Three ways one fact acquired two representations (2026-11-10)

**Finding.** In two iterations, three separate defects had the same shape: a fact recorded twice, one
copy updated.

| fact | the stale copy | what it cost |
| --- | --- | --- |
| the retry population floor | `SOTA_RETRY_FLOOR = 140` in the lane while the amendment said 90 | an artefact that failed its own floor on a population that met it |
| the existence of `retry-values` | R66's header said the arm was not implemented; the union agreed | nothing — the registration was written that way on purpose, as a target |
| the existence of `sample-5-exec` | the parser accepts `sample-N-SELECTOR`; `OPTIONAL_ARMS` did not list it | a dispatch that died in two seconds with no calls spent |

The third one is the interesting one, because the first two were *known*: R65's floor drift was found
by reading an artefact against a document, and R66 wrote its own not-implemented status into its
header so a reader could not mistake it for a plan. R67 assumed the machinery. "The selector is
generic" is a claim about the parser; "the arm exists" is a claim about a membership list; and
nothing in the repository required the second to follow from the first.

**Why the price was right, and what is still missing.** The refusal happens on the arm list, before
the first model call: two seconds, zero calls, one wasted dispatch object. That is the correct place
for the check and it is why the fix is a one-line union entry rather than a new gate. What is missing
is a *pre-commit* check, and it cannot be a naive one: prereg headers use two vocabularies — BIRD arms
and τ² planted arms (`memory`, `reference`, `self-knowledge`) — so a global "every header arm exists"
test would report 28 false positives across R26–R62 and be suppressed within a week. The honest
version is per-lane, and the lane already refuses correctly.

**Second finding, second order.** The backbone input took two attempts. The first, three dispatch
inputs, reproduced the original defect — it could move the host while leaving the key — and the
repository's own `scripts/check-workflows.py` caught the *other* problem with it: 28 inputs against
GitHub's cap of 25. One input with a closed vocabulary fixes both, and `density_panel` becoming a
repository variable is the payment. A linter that fails on a count is not a linter that fails on a
design error, but here it forced the design error into the open, which is worth recording: the cap
was the reason the model/host/key decision got collapsed into something that cannot be set half-way.

## 35.08 One expansion is not inside the quotes it appears to be inside (2026-11-10)

**Finding.** R69's and R68's first dispatches both died **one second** into the BIRD job, before a
single model call, on the step this iteration added:

```
/home/runner/work/_temp/….sh: line 10: unexpected EOF while looking for matching `'
Process completed with exit code 2.
```

The line was `echo "${VALUE:-the lane's default (…)}"`. Inside the `word` part of a parameter
expansion, the shell parses quote characters **even though the whole expansion sits inside double
quotes**, so the apostrophe in an English sentence opened a string that never closed. Reproduced
locally in one command after the fact; it would have been reproduced in one command before the
dispatch, which is the whole distance between a rehearsal and a hope.

**Why it is the fourth instance of one shape rather than an accident.** The repository has now paid
four times in three iterations for the same structure: a value exists, a second place reads it, and
nothing checks that the two agree.

| iteration | the value | the reader | what was never checked |
| --- | --- | --- | --- |
| R65 | `SOTA_RETRY_FLOOR` | the artefact's floor gate | the amendment that lowered it to 90 |
| R66 | `retry-values` | the arm list the lane parses | whether the arm was in `OPTIONAL_ARMS` |
| R67 | `sample-5-exec` | the same parser, by regex | the same membership list |
| R69/R68 | `SOTA_SAMPLE_TEMPERATURE` | a `run:` block | whether the block was a shell script |

The first three are registrations against arms and are now closed by `armsAgainstRegistration`, which
the lane applies before its first model call. The fourth is a **workflow against a parser**, and it
cannot be closed by any amount of care in the workflow, because the failure is not semantic — the
step was correct English and correct YAML.

**The fix is the checker, not the sentence.** `scripts/check-workflows.py` now runs `bash -n` over
every `run:` block in every workflow file. It parses and does not execute: no step runs, no variable
is read, and `${{ }}` expressions are just characters to the parser. Five files are covered by one
check, and the class it catches is the whole class — an unbalanced quote, a missing `fi`, an unclosed
heredoc. Two self-test cases sit beside the six that existed: the apostrophe that would have failed,
and a well-formed loop that must stay clean, so the check cannot pass by refusing everything.

**What it cost.** Two dispatch objects, no model calls, no artefact, no folds — the smallest possible
price for this class, and only because the step was *before* the run rather than inside it. A step
that failed forty minutes in would have cost five folds, and the ledger in the previous paragraph is
the reason to notice that the price was luck rather than design.

**The general lesson, stated so it is checkable.** A shell expansion is a language with its own
quoting rules embedded in a file with a different quoting language embedded in YAML. Every tool in
that stack can be individually correct while the composition is not, which is why the only reliable
check is the innermost language's own parser, run on the outermost file's actual content.

## 35.09 An arm that was bought and not reported, in a run where every gate passed (2026-11-10)

**Finding.** R69 registered six arms. Its artefact published five, and the one row that was supposed
to be the comparison's *other* rung was mislabelled:

| registered | published | what the row actually contains |
| --- | --- | --- |
| `sample-5-oracle` | present, 61.14% | the best of **ten** draws, under a name that says five |
| `sample-10-oracle` | **absent** | — |
| `sample-5-first`, `sample-10-first`, `sample-5-exec`, `sample-10-exec` | present | correct |

The lane searched the union for *the* oracle arm — singular — kept the first match in union order,
and scored it over `verdicts` whole rather than over the arm's own `n`. So the registration's primary
estimand, `ceiling(10) − ceiling(5)`, could not be read from the artefact at all, and the one ceiling
row it did publish was labelled with a width it had not measured.

**Why every gate passed.** Every gate in the lane asks whether a measurement is *valid*, not whether
it is *complete*. The pool reconciled (3,500 candidates, all signed, `V18`/`V19` green), the partition
held, the parse rate was 1.00, the resolution gate saw a sample large enough for its own claim. An arm
that was never built produces no row, and no gate was looking at the arm list on one side and the row
list on the other. `V69-every-arm-is-a-row` reads the *ledger across artefacts*, not the dispatch
against its own table.

**The cost, and the shape of it.** Two points of ceiling — the whole width effect — were missing from
a run that had already been paid for. They were recoverable, because the pool records every candidate
and `ceilingAmong` is arithmetic over the verdicts already in the file; the outcome section in
`R69-pool-width.md` recovers them and reports the delta as **+2.00pp**. This is the fourth time the
pool has paid for a question the artefact table could not answer, and the second time it has rescued a
number that the run itself failed to publish.

**Two fixes, and both are at the level the failure lived at.**

- `ceilingAmong(verdicts, width)` in `sota.ts`, called once per registered ceiling arm: a ceiling is
  "the best of the n draws *this arm* names", so two ceilings are two readings of one pool instead of
  one reading wearing two names. Four tests, one of which is the exact failure — a right answer at
  draw 7 must be invisible to a five-draw ceiling.
- `V77-every-requested-arm-is-a-row`, blocking, appended last so it reads the final table. R69's own
  artefact would fail it.

**The general lesson.** A silent omission is the only class of defect that a validity gate cannot see:
validity is a property of what was measured, and the missing arm was never measured at all. The check
has to compare the *request* against the *report*, and both are in the artefact — `config.arms` and
`arms[]` — which means the gate costs nothing and could have existed for four iterations.

**Second-order: the same shape in the denominators.** The signal gate reported three survivors by Holm
on this pool (`empty` 0.545, `column-shape` 0.556, `value-type` 0.562) and a composite worth +2.9pp —
over the 138 questions where at least two distinct results existed. The arm built from the shape
composite scored **1.14pp below** the first draw over all 350. Both numbers are correct and they are
about different populations, and the record had been quoting the first kind beside results of the
second kind for several iterations. R71's readout now has to print the eligible population beside the
whole one, or it will repeat this.

### 34.100 A number that exists below a layer and not above it is invisible to every test above it

Two instances in one night, and they are the same defect wearing different clothes: **the measurement was
correct and the relay was missing**. Neither was a wrong number. Both were a number nobody could read.

**The reader printed the chain and dropped the cause.** After §173.77 the funnel recorded `asked` and
`dropped` — the two counts that tell an event that never arrived from a reply the parser emptied from a
reply that arrived empty. `r56_readback` printed

```
funnel: 12 -> 0 -> 0 -> 0 -> 0 (refused 0, failed 0)
```

and the sentence that names the stage stayed in the artefact, unread. The instrument had been rebuilt to
make that sentence possible; the reader had not been told. This is the third occurrence of one shape in
this project — a counter taken after the parse, a projection that dropped three fields, and now a reader
that prints the numbers around the answer. The recurrence is the finding: **every diagnostic change needs
its reader changed in the same commit**, and the way to enforce that is to make the reader's output carry
something only the new field can produce, with a test that fails when it does not.

**Two capability flags were honoured by the pack layer and never forwarded by the route.** `minEvidence`
and `anchoring` are documented in `RecallQuery`, consumed by `buildPack` and by the store's candidate
selection, and `/v1/recall` forwarded three of the five knobs it accepts. Everything below the wire was
right; nothing above it could ask.

The check that would have caught it is a type-level one and it costs nothing: the route hand-built the
query as an object literal with a per-field ternary, so a knob the route did not know about was simply
absent from a spread. Had the query come from a function over `Omit<RecallQuery, 'namespace'>`, the
compiler would have asked about the sixth field the day it appeared. **A route that enumerates a type's
fields is a route that will fall behind the type**, and the repair is to hold the list once and let the
type check it.

Both are now relayed, and both relays are pinned from the side that can drift: the funnel's sentence by a
source test that asserts the literal appears once in the writer, once in the shared module and nowhere in
either reader; the route's fields by a test on the wire — one seeded item served under `minEvidence=1`,
withheld under `minEvidence=2` — rather than on the parser, because a parse that nothing spreads would
pass a parser test.

**The general lesson, and it generalises past this repository.** A capability that exists below a layer
and not above it is indistinguishable, from above, from a capability that does not exist. Every experiment
that failed because "the arm could not ask for the thing" needs to be re-read with that in mind: the arm
may have been well-formed and the wire deaf.

### 34.101 A refusal that compares against a value the run does not read is a refusal to measure

`R58` died at 04:01:31 UTC, ninety seconds after the off-peak window opened and before its first model
call, on this check:

```
[prereg-form] this registration fixes the trace ceiling at 3 claim(s)
              and this dispatch would run '6'
```

The run would have executed 3. The variable held 6. The arms read
`${{ steps.recall_floor.outputs.claims || vars.TAU_TRACE_CLAIMS }}`, and the step output is set whenever
a registration is present — which is always, in every dispatch that goes through the resolver. The
variable is the fallback for the dispatch that has no registration, and the check compared the header
against the *fallback*. Four checks were built this way (unit, scope, ceiling, pack mode), each of them
written the same hour as the switch it guarded, each of them copied from the one before.

**The defect is not the comparison; it is the belief that a disagreement between the registration and the
environment is an error.** Those two are allowed to disagree, and the registration is supposed to win:
that is what resolving a registration into an environment means. The checks encoded the opposite — that a
stale variable is a contradiction to be refused — and so the only disagreement they could ever catch was
the harmless one, while the dangerous one (a variable holding a value *no* registration declares, so the
registration is silent and the run inherits a stranger's setting) passed through untouched, because there
was nothing to compare it against.

**The repair keeps the report and drops the veto.** `switchOverride()` returns `undefined` when the
declared value and the variable agree, and otherwise returns the disagreement as a sentence —
`claims: the variable holds '6', overridden by the registration's '3'`. `prereg-form` prints them on an
`overrides=` line, `sota.yml` turns them into `::warning::`, and the run proceeds to measure what its
header fixed. The one check that stays a refusal is the one that is an inconsistency *inside* the
registration — a `trace` unit carrying a `lesson` form describes two objects and cannot be executed as
one — because there is no "which wins" for that.

**What made this expensive is that it was cheap to find.** The message named both numbers, the header and
the variable, and a single local invocation reproduced it in under a second. A check that fails closed on
a comparison the run does not depend on will, given enough dispatches, always be the thing that stops the
experiment rather than the thing that protects it — and the cost of that is not the money (this one spent
nothing) but the window: the next off-peak open was six hours away, and the run it killed was the last
prompt-side and write-side lever this record has.

**The rule, stated so the next guard is written against it.** A refusal must name a state the run cannot
proceed from. "The configuration disagrees with itself" is not that state unless the run reads both
sides; where one side is a fallback, the disagreement is a fact about the environment, and facts about the
environment belong in the run's annotations. The second half of the rule is the one this project keeps
learning: **the observation still has to reach a reader** — so an override that is only a warning in a log
nobody opens is the same defect as §34.100, one layer up.

### 34.102 A store that was never built cannot refute the unit that was supposed to build it

R58 came back `ABANDONED` with two refutations fired, and both of them were true statements about a
store that should not have been graded at all:

```
FIRED nothing recurs even after the pass: no item reaches support 2  (after {1: 6})
FIRED the pass is inert: it merged no group, so recurrence appeared to be consolidated  (0 of 6)
```

Six items. Fifteen corrections. And, one line above in the same artefact, the fact that explains
both: `llmFailed: 11`. Eleven of the fifteen distillation events threw, `resilientInterpreter`
answered them with the rule interpreter, the rule interpreter writes nothing for a trace, and the
store was built from the four answers that survived. The funnel reported `0 dropped` and `0 failed`
because *nothing was rejected* — the events never arrived.

**The counting was right at every layer and the conclusion was wrong at the top.** `asked: 15`,
`candidates: 6`, `dropped: 0`, `failed: 0`, `llmFailed: 11` — five numbers, all correct, and the
readback used four of them to grade a hypothesis the fifth had already voided. This is AUDIT 34.100
one layer down: the fact existed, in the artefact, in a field beside the ones being read, and the
reader was not told that the chain from corpus to claim passes through a component that can fail.

**What the reader now does.** `LLM_FAILURE_VOID_SHARE` gates the recurrence predictions on the share
of events the model actually answered. At or above half, the run is `NO_MEASUREMENT`, the sentence
names the layer and the codes, and the store's silence is not published as the unit's refutation.
Below it, the run is graded and the fallback share is printed, because a sample with a stated hole
is still a sample. The threshold is a judgement and is named as one; what is not a judgement is that
a store describing 27% of its corpus cannot say whether claims recur.

**Three things had to be fixed for that sentence to be writable, and they are the lesson.**

1. `faults().reasons` was collected by `resilientInterpreter` from the day it was written and reached
   nothing that survives the process. The count survived; the codes did not. A count with no code is
   a number that says *something failed eleven times* — which is exactly as actionable as no number.
2. The bill was computed from the clock at the moment `usage_stats()` was called, which is the *end*
   of the phase. R58's evaluation opened in the off-peak band and closed in the peak one, and the
   artefact priced all ninety-three minutes at double: $2.1162 reported against $1.0581 for the same
   tokens. A cost read at the wrong end of a run is not conservative, it is misleading in the
   direction of changing a schedule that was already correct.
3. The readback was willing to grade a run whose earlier stage had failed. Nothing in it was
   *wrong*; it simply had no notion that its inputs had provenance.

**The general rule, and it is the third form of one this file already states twice.** A metric whose
value depends on a stage that can fail needs that stage's exit condition recorded beside it, and the
reader needs to check it before reading. The funnel got this right for the parser (R56), the coverage
reading got it right for the population (R54), and the recurrence reading had it wrong for the model.
Written as a rule: **every prediction should name the stage it assumes ran, and the readback should
refuse to grade it when that stage's own count says it did not.** A refutation is a claim about the
world, and a claim about the world needs an instrument that was working when it was taken.

### 34.103 A store of candidates is a store in name only, and the evidence weight is a claim about the floor

The raw arm's first end-to-end run wrote one item and served none:

```
[tau2] learn: 1 correction(s) from 3 task(s), 0 unreadable, 1 asked, 1 candidate(s) (0 dropped: none),
       1 created, 0 failed, 1 item(s) in the store
NoMeasurementError: 1 correction(s) -> 1 asked -> 1 candidate(s) -> 1 admitted -> 1 stored ->
       0 servable (0 refused, 0 failed): the store holds items and none is reachable by the recall
       scope this arm asks in
```

Every count in that chain is correct and the chain ends in zero. The cause is one constant: the
record carried trust **0.7**, the policy's `minSupport` is **0.8**, so the write path marked the item
`candidate` rather than `active` and the census counted it as unservable. The item existed, was
counted, and could be reached by nothing.

**The funnel refused the run, and that is the mechanism working.** R55.0 read a store of seven items
and published a recurrence number about it; the funnel that now stands between the write and the
evaluation is what turned this into a refused dispatch instead of an hour of evaluation on a pack the
store could not fill. The defect was upstream of the guard and downstream of my own reasoning.

**The reasoning is the part worth recording.** I chose 0.7 because a record asserts nothing and
should therefore rank below a reviewer's stated clarification (0.8). That is an argument about
*epistemic strength*, and the floor is not a scale of epistemic strength — it is the number at which
an item is allowed to steer output, and the policy states its own case for where it sits: "one
trusted edit (weight 0.9) must clear this; two thumbs-down (0.5 each) do not". A τ² correction *is*
that trusted edit: the task's `evaluation_criteria.actions` is the gold answer rather than a reader's
opinion. The right question was not "how strong is a record compared with a clarification" but "which
weight does this evidence carry, and does it clear the floor the writer will be judged against".

**The rule, stated so the next writer is written against it.** An interpreter's `trust` is a claim
about a threshold it does not own: the policy decides what is served, and a writer whose weight sits
under `minSupport` produces items that are indistinguishable from no items except in the census. Two
consequences follow, and both are cheap. A new interpreter's first test should assert the resulting
item's **status**, not the number it wrote. And a store census should keep `candidate` and `active`
apart in the sentence it prints, which it does — `0 servable` beside `1 stored` is what made this a
five-minute diagnosis instead of a week of "the memory did not help".

**A second finding from the same test, one layer down and not repaired.** The rule interpreter scopes
every candidate to `{ task: event.task }`. In a workspace that serves one task repeatedly that is
correct; in this lane every task is distinct, so an item written by the fallback can never be served
to another task — the store is not empty, it is unreachable. That is the shape of R41's result, where a
store of fallback lessons produced no measurable effect, and it was read at the time as "the lessons
were not useful". It may have been "the lessons were never offered". Not changed here: it is core's
generic default and a lane-level override would be a second variable. Recorded, and the raw unit
scopes to the domain because of it.

### 34.104 A threshold that no run applies is a sentence, not a measurement

Three documents described the coverage floor as the thing that removes an item — this record's
progress section, the raw arm's own module docstring, and the registration that dispatched it — and no
run in this repository has ever applied it. Every registration fixes `recallFloor: 0`, so `recall`
receives `minCoverage: 0`, the pack carries whatever is servable, and coverage is measured after the
fact.

```
minCoverage  0     0.1   0.2   0.3   0.5   0.8
related       1     1     1     1     1     0
unrelated     1     0     0     0     0     0
```

The first row is the arm's premise and it holds. The second row is the correction: at the setting every
dispatch actually runs at, the unrelated request is *also* served the record, because a floor of zero
removes nothing. The number that survived — R58's median non-zero coverage of 10.53% — is therefore a
statement about the text the model read, not about a filter's decision, and the difference is one
mechanism: the same low overlap either produces a pack of irrelevant text or an empty pack, and only
the second is what "the floor dropped it" describes.

**Why this is a class and not a typo.** A threshold appears in a readback next to a number and reads as
if it acted on that number, and nothing in the artefact can contradict the sentence, because the
artefact records the reading and not the setting that would have applied it. The three documents were
written by the same hand in the same week and agreed with each other, which is exactly how a claim that
no run supports becomes the record's version of events.

**The rule.** A threshold in a readback has to travel with the setting that applied it, and the setting
has to come from the artefact rather than from the registration's intention. Where the artefact cannot
supply it — `coverage.floors[]` records the retained-pack count at *every* floor, but not which one the
run used — the sentence should say "a floor would remove this" rather than "the floor removed it".

**What the test bought.** The premise is now asserted in-process (`tau2-rawlog-recall.test.ts`): one
record, two requests, one floor. That is cheaper than the dispatch it protects — the dispatch is $1.06
and an hour of a scarce off-peak window — and it is the second time in two days that writing the
assertion before the run changed what the record says rather than confirming what it already said.

### 34.105 A bar the registration never set can fail an arm on evidence nobody asked for

`r85_readback.py` printed the share of records the 700-character ceiling clipped and then decided
nothing with it, which read as a hole: a write-side number sat in the *context* while the graded
predictions were three lines away. So the number was promoted to a prediction and a refusal, at a
threshold of **one percent**.

That percent came from the readback, not from `prereg/R85-rawlog-unit.md`. The registration states the
write-side claim on **faithfulness** — *"a number below 0.95 refutes the arm's own claim to be a record
rather than a summary of one"* — and names the ceiling as the **cause** of any loss, counted per record
by `rawlog.clipped`. A one-percent bar is a different question (how many records were touched) with a
different answer (a 700-character ceiling over tool-call transcripts will touch plenty), and it would
have been able to return `ABANDONED` for an arm that kept every entity, on evidence the registration
never asked for.

```
what the arm claims        faithfulness >= 0.95 of the corrections' own entity values
what carries the claim     the entity pool, not the record count
what the ceiling is        the named cause, counted, so a reader can attribute the loss
what one percent would be  a second bar, unwritten before the run, able to overturn the first
```

**Why this is a class.** A readback that grades more than the registration is not more rigorous; it is a
registration edited after the run, which is the one thing preregistration exists to prevent. The failure
is quiet because it looks like diligence: every sentence in the diff is true, the threshold is modest,
and the code comment even argues for it. The defect is in *provenance* — who wrote the number and when.

**The rule.** A graded prediction in a readback has to be quotable from the registration, and the diff
that adds one has to be able to point at the sentence. Anything a run reports that the registration did
not state stays in the context, where it can still be read and still explain a result: the census now
prints `records clipped by the ceiling: N of M (P%)`, and the refusal's evidence says which of the two
it was — *the ceiling is the only thing that cut text*, or *nothing was clipped, so the loss is not the
ceiling*. The fixture that clipped four records and kept every entity grades `GRADED`; it used to
abandon.

**What it cost.** One commit, one self-test case rewritten, and no dispatch. The 74/74 registration
validity gate does not read readbacks, which is why this had to be caught by reading the registration
next to the code rather than by a test — and why the rule above is written in the module's own
docstring, where the next person adding a threshold will meet it.

### 34.106 Trials are executed by a thread pool, so "the attempt after this one" is not a guarantee

The in-episode arm's unit is **order**: trial *t+1* reads what trial *t* taught, and the number it
publishes is accumulation. Reading `tau2/run.py` at the pinned ref (`v0.2.0`) to find the seam gives
two facts that the design in §17.127 did not assume:

```python
args = [(task, trial, seed, progress) for trial in range(num_trials) for task in tasks]
with ThreadPoolExecutor(max_workers=max_concurrency) as executor:
    res = list(executor.map(_run, *zip(*args)))
...
simulation.trial = trial      # assigned AFTER `run_task` returns
```

1. **The list is built trial-major but *executed* concurrently.** With `max_concurrency > 1` a worker
   takes the next free argument, so trial 3 of task *X* can finish before trial 0 of task *X* started.
   Under that scheduler "trial *t+1* knows exactly one thing more than trial *t*" is false, and what the
   arm would publish is the thread pool's ordering wearing accumulation's name. The arm is only
   well-defined at `max_concurrency = 1`, and that is a **precondition to register**, not a knob to
   tune after seeing the number.
2. **Nothing inside the episode knows its trial index.** Upstream assigns `simulation.trial` after the
   episode returns, so the agent cannot state it and the watermark cannot be built from what the agent
   knows — it has to come from the runner. This is the mechanical reason §17.127's rule 1 puts the
   watermark in the request rather than in the store's own memory.

**Why this is a class and not an implementation detail.** Every arm in this repository so far has been
order-free: a frozen store, `k` trials, an average. An arm whose *treatment is sequence* inherits
whatever order the harness happens to produce, and the harness here is a thread pool shared with the
rest of the domain. A measurement that depends on a scheduler and does not say so is the same defect as
a threshold no run applies (`§34.104`) one layer down: the number is real, and it is not the number the
sentence next to it describes.

**The rule.** An arm that claims order has to own the order: state the concurrency it requires, run at
it, and record it in the artefact beside the reading — the way `recallFloor` and `trials` are recorded,
because the reader cannot otherwise distinguish "accumulation was weak" from "the trials interleaved".
`run_split.py` therefore runs the in-episode arm through its own serial trial loop calling `run_task`
per episode, rather than through `run_tasks`, which is the only way this process can name the trial
before it runs.

**What exists now.** The property the arm needs is built and tested: `EvidenceRef.trial` records the
attempt, `RecallQuery.before` is the watermark, and `visibleBefore` withholds any claim carrying an
observation from the running or a later attempt, on both of `search`'s candidate paths. What remains is
the seam — the serial loop and the write endpoint — and this record is why it is a serial loop.

### 34.107 The cheap arm counted tasks, and the number it wanted counts failures

R86 was dispatched to answer one question — *which code did eleven of R58's fifteen distillation calls
throw* — and it came back `NO_MEASUREMENT` after **one** call. The registration's cost model says why:

> Ten tasks rather than fifty-seven because the question is about the *distiller*, and the distiller
> sees the learning half — **every task in it contributes corrections** whether or not the evaluation
> afterwards is large enough to grade.

That clause is false, and it has been false since R62: `teachingOf` returns `undefined` for a task that
passed, by design, because "a store built from every failure is the store the fold paid for". A
correction exists for *failing* tasks. The population the census needed is therefore not the task count
but the failure count, and the run says so itself:

```
[tau2] learn: 5 task(s), 1 trial(s)          <- ten evaluated tasks split into five to learn from
[tau2] faithfulness: 0 of 15 entity(ies)…    <- one correction reached the distiller
[poc-l4] no measurement: 1 correction(s) -> 1 asked -> 0 candidate(s) … 0 failed
```

**Why the registered refutation does not fire.** "No fault at ten tasks" reads as a statement about
availability — the eleven at fifty-seven were throughput, not prompt. But the run made *one* call. At
R58's measured rate of 11/15, the probability of seeing no fault in one call is **0.27**, so a single
quiet call is not evidence of anything; the refutation's own premise (a ten-task load) never happened.
The arm is not refuted, it is unmeasured, and the readback said so rather than grading a rate it did
not have.

**The rate needs faults, faults need failures, failures are a quarter of the learning half.** At
R58's shape — 57 learnable tasks, 15 failed, 11 faulted — reproducing the code distribution needs the
same order of failure population, i.e. ≳50 learning tasks. A ten-task dispatch could produce at most
two or three calls, and any distribution over three calls is a list, not a census.

**One new fact, small but real.** The single call that did run returned **no claims and no fault**: the
model answered, the reply parsed, and the claim list was empty. That is a fourth outcome the enumeration
does not name — not truncation, not prose, not a refusal — and it would read downstream as "the corpus
had nothing to teach" rather than as "the distiller produced nothing from something teachable". Any
census of this distiller has to count it explicitly.

**And the number beside it was an artefact.** `faithfulness: 0 of 15 kept (0.0%)` was computed against
an empty store: with no text, every entity fails a containment test. That is the third time this record
has read an absence as a zero, so the instrument now carries `unwritten` and refuses the rate when the
store answered none of the corrections — see `36c50f9`.

**The rule.** A cheap arm's cost model has to be written in the unit its numerator counts, and the
numerator's population has to be measurable before the dispatch rather than after. For a fault census
that means: *calls = failing learning tasks × claims per correction*, and the failing share comes from
the corpus (14 of 57 here), not from the task cap. A dispatch that cannot state that arithmetic is a
dispatch that will report `NO_MEASUREMENT` in a scarce window and pay for the privilege.

**What the next registration has to say.** The census runs at R58's size, and — because the quantity is
about the distiller — it runs the learning half and the distillation without paying for the evaluation.
That separation is the same move `poolArms` made for the sample: read the quantity you want from the
work that produces it, rather than from the run that happens to carry it.

### 34.108 Twelve records, one servable: three layers each destroyed the memory once

R85 came back `ABANDONED`, and for a day it read as "the record arm does not help". It reads that way
only if the four numbers are read as one. They are four:

```
records              12
clipped by ceiling   12 of 12
faithfulness         58 of 137 entity values kept (42.34%)
admission            active 1, candidate 11 (reason: insufficient-evidence)
servable in retail   1
mean pack size       1
coverage p50         13.04%
```

**The support mean was the tell.** `RAWLOG_TRUST` is 0.9, every record is created with
`support = evidence.weight`, and nothing in the run retires or merges. A store nobody touched reads
0.9000, and the log printed **0.4875**. That is `(0.9 + 11 × 0.45) / 12`, and 0.45 is exactly
`recordContradiction`'s `support − weight × 0.5`. The store had refuted eleven of its own records.

**Why.** `contradictSameScope` walks the pool for an item of the same kind in the same scope with
different content and records a contradiction. The rule is right for claims: two rules of one kind in
one scope answer one question, so different content is a disagreement. It is wrong for records, and the
driver made it fire eleven times by opening every task as `tau2.act` — twelve records, one scope,
twelve different payloads.

| layer | what it did | what it looked like from outside |
| --- | --- | --- |
| scope constant | every task opens as `tau2.act`, so twelve records share one scope | nothing: the store held twelve items |
| contradiction rule | applied to `exemplar`, halving the older record's support to 0.45 | "eleven items are candidates" — which reads as weak evidence, not as refutation |
| ceiling | 700 characters, inherited from R84's 640-character *trace* statement | 42% faithful, reported as a write-side defect |
| pack | one servable item, so one item per pack | coverage 13%, reported as a retrieval defect |

**Why this is a class, and the worst instance of it in this record.** Every number above is true and
every number points at a different layer. Read in sequence they say "records are worse than claims",
which is exactly the literature's claim and exactly the wrong conclusion: the store never got to
answer. Three separate mechanisms each removed about an order of magnitude of the treatment, and none
of them announced itself — a contradiction is recorded as a support decrement, a cliff is recorded as a
character count, and a scope constant is recorded nowhere at all.

The failure mode is **an arm whose treatment is destroyed before the measurement, where the destruction
is itself measured** — 42% faithful, 1 servable, 13% coverage — so the readback reports a graded
verdict rather than `NO_MEASUREMENT`, and the verdict is about the destruction.

**The rule.** Before an arm's result is read as evidence about its *treatment*, the funnel's own
counts have to be checked against the treatment's shape. A record arm whose store is 92% candidates is
an arm that did not run its treatment, whatever its coverage says — and the check is arithmetic on
numbers the artefact already carries, not another dispatch. §34.107 said the same thing about a
population count; this is the same rule applied to a population of *items* rather than of *calls*.

**What was built.** `isEventKind` exempts the kind from the contradiction rule, with the claim path
tested beside it so the guard cannot be widened by accident; `rawCeiling` is a registration header, and
the ceiling is 2000 because `eval/tools/record_length_census.py` measured the retail record at p50 744,
p95 1260 and max 1532 characters; `rawlog.ceiling` now travels in the artefact so a 700-run and a
2000-run cannot be compared as one.

**And one instrument that was wrong when it was written.** The census's first version expected to
reproduce R85's 42.34% and produced 64.53%. The gap is not the missing `note:` line: an entity value
quoted in the question (`order #W2378156`) is *also* the argument of the gold call, so it survives a
slice that removed the whole answer line. `faithfulness` therefore asks "does the store's text for this
run contain the value", and for a record whose first line is the question the answer is yes more often
than the detail survived. The metric is an **upper bound** on preservation for this unit, which is
worth knowing before it is used to acquit or convict a ceiling — and it is stated in the tool rather
than left for the next reader to discover.

### 34.109 The fourth time this record printed an absence as a zero, and the guard that let it through

`faithfulnessLine` ended with `faithfulnessRate(census) ?? 0`. The branch behind `??` is reachable for
exactly one input — a store that holds items, a population of corrections that carries **no** entity
value — and for that input it printed:

```
faithfulness: 0 of 0 entity(ies) kept (0.0%), whole in 0 of 0 correction(s), 0 with none to keep
```

which is total destruction at the write standing in for "this corpus had no entity to preserve". That
is the reading the module exists to refuse, and it had already been refused twice in the same function:
`faithfulness: no measurement -- 15 entity(ies) in 1 correction(s) never reached the store` (the empty
store) and `faithfulness: absent (no correction carried an argument value)` (the corpus). A third
sentence, wrong in the direction of alarm, sat between them.

**The guard was the defect, not the fallback.** Both branches tested `census.unwritten ===
census.corrections`, which is true when *both* are zero — so "no write reached the store" and "nothing
in the corpus could be kept" collapsed into one sentence, and the second one fell through to the
`?? 0`. `> 0` is now part of the guard, the `?? 0` is gone, and the division that remains is total by
construction: the empty store returned above, and `entities === 0` returns its own sentence.

| what the census says | what the line must say |
| --- | --- |
| store holds nothing | `no measurement` — the writer never ran |
| store holds items, corrections have no entities | `absent` — there was nothing to keep |
| store holds items, entities exist | the rate |

**Why this is a class and not a typo.** An absence-as-zero is this record's most repeated defect: R58's
coverage from a store nobody built, R86's `0 of 15 kept` on an empty store, R85's `support 0.4875`
read as weak evidence rather than as eleven refutations, and now a `0 of 0 (0.0%)` on a corpus with no
entity. Each time the shape is the same — a default that looks like a measurement — and each time the
guard beside it was written with `===` where `> 0 && ===` was meant.

**How it was found.** Not by a run. A coverage report showed `tau2-faithfulness.ts 97.95% branch` with
line 192 uncovered, the line turned out to be the `?? 0`, and asking "which input reaches this" produced
the population above. That is the one thing the coverage gate is for: it is not a number to maximise, it
is a list of paths nobody has ever executed, and a path nobody has executed in an error-handling
function is a sentence nobody has read.

### 34.110 A ceiling is a property of the domain, and the census that fixed 700 would have repeated the mistake one level up

`RAWLOG_STATEMENT_CEILING = 700` was inherited from R84's 640-character **trace** statement ceiling: a
statement that summarises one call, applied to a record that is a question plus an answer. R85 clipped
twelve of twelve records and kept 42% of their entity values, and the census that replaced the number
measured retail.

Measured the same way at the same pinned ref, the second domain is not the same population:

| domain | tasks | p50 | p95 | max | clipped at 2000 |
| --- | --- | --- | --- | --- | --- |
| retail | 114 | 744 | 1260 | 1532 | 0 |
| airline | 50 | 684 | 1899 | **3129** | 2 (4%) |

An itinerary with three legs renders a call list twice retail's length. So 2000 is right for R88 and
would clip the airline arm that transfers it — which is the 700 defect with the domain substituted for
the unit. `rawCeiling` is a registration header for this reason: the number has to travel with the
experiment that measured it, or the next dispatch inherits it silently.

**The rule.** A constant that bounds text has to name the population it was measured over, in the same
sentence. "700 characters" is not a fact; "700 characters, measured on a trace statement of one tool
call" is, and so is "2000, measured on retail records at v0.2.0" — which is also a statement about
retail and not about airline.

### 34.111 The fifth absence: a record the budget refused was indistinguishable from a record that never existed

R85 wrote twelve records and served one. R88 raised the ceiling so twelve would be written and admitted.
Neither reading could say how many of them the **pack** refused, because nothing counted that.

The pack is a character budget with a fixed cost. Measured by rendering one item through the real
renderer — `maxStatementChars`, which does not re-derive the arithmetic it is checking — a record in this
arm's shape spends **390 characters** on the wrapper, the note, the id, the kind, the confidence, the
task-and-domain scope and the provenance payload, and the rest on the statement:

| budget | capacity (chars of statement) | retail records above it | what one recall carries |
| --- | --- | --- | --- |
| 1,200 | **810** | 47 of 114 (**41.2%**) | one 700-character record, 114 characters of headroom |
| 2,400 | 2,010 | 0 of 114 | two 744-character records, or one 1,532-character record whole |

R88 ran the top row with a 2,000-character ceiling. Every record it wrote above 810 characters was
retrieved, ranked, **dropped at render**, and then reported as `recall.empty` — the same field that
reports "the store had nothing relevant". The two states have opposite repairs (a budget, a retrieval
function) and one number.

**Why the old number was safe by accident.** 700 + 390 = 1,090 fits 1,200 with 110 characters left. The
ceiling was inherited from another unit, and it happened to be inside the pack for reasons nobody had
written down. Raising it past the pack turned a fidelity choice into a silent loss, which is the same
class of defect as the four absences already repaired in this lane — and the only one of the five that
neither the store, the write, nor the reader could see.

**What now exists.**

- `maxStatementChars` (core) measures what a pack carries, for a stated item shape and the pack's own
  options. The shape is a parameter: a record costs 149 characters more than a bare claim, so a capacity
  quoted for the wrong shape passes on a pack that cannot carry the item it was quoted for.
- `pack: {budget, capacity, requests, filled, empty, emptiedBySize, droppedForSize, summary}` is in the
  artefact and in the run log. `emptiedBySize` is the state `recall.empty` could not separate.
- `packBudget` is a registration header, and `prereg-pack.ts` refuses a ceiling the declared budget cannot
  render — only when a registration states **both**, because every arm published before the header ran at
  1,200 and keeps the reading it was published with. For those, `prereg-caps` prints the capacity on
  stderr, so the mismatch is in the dispatch log even where it is not a refusal.
- `R89-pack-carries-what-it-wrote` registers (2,000 / 2,400), the smallest round budget that carries the
  longest retail record whole.

**The rule, and it is the same rule as 34.110 one level up.** A writer and a reader that both bound text
have to be checked against each other, not against their own histories. 700 was inside 1,200 because
somebody had chosen both; 2,000 is outside it because the second number was never part of the decision.

### 34.112 The fifth layer was a safety rule, and the writer was verbatim all along

`R88` (`prereg/R88-record-not-claim.md`, run `43223040283`, head `deb56ec2`) returned **`ABANDONED`** and
two of its five refutations fired. Graded apart, as the readback grades them:

| layer | prediction | reading | verdict |
| --- | --- | --- | --- |
| the write | records, form `record`, no tool ban | 12 records, `form record`, `toolBan false` | PASS |
| the write costs nothing | `events = candidates`, no model call | 12 / 12, `llmFailed 0` | PASS |
| the ceiling | `clipped ≤ 1` | **2 of 12** at 2,000 | FAIL, refutation fired |
| the write does not abstract | `kept ≥ 95%` with `clipped ≤ 1` | 82 of 128 = **64.06%**, whole in 1 | FAIL |
| the admission | every record active | **12 active, 0 candidate** (R85: 1 of 12) | PASS |
| the reach | coverage p50 ≥ 25% | **9.09%** (R85 13.04%) | FAIL, refutation fired |
| the outcome | `pass^4 ≥ 0.575` | **0.5614 ± 12.88pp** at n = 57 | FAIL, −1.36pp |

Two of the three repairs this row was dispatched to test held: `isEventKind` moved the admission from
`1 active / 11 candidate` to `12 of 12`, and the recall scope serves all twelve (`servable 12`, funnel
`12→12→12→12`). The ceiling repair half-held: 12 → 2 clipped.

**And then the reading that made the last four rounds look like one problem.** The registration's third
refutation — *"the write abstracts somewhere the ceiling does not explain"* — was **not** cleared: its
condition is `clipped ≤ 1`, and the arm clipped two. So the 64.06% was left standing as evidence about
the writer, and it is not.

**Measured, model-free, from the pinned corpus.** The twelve corrections are named by the artefact
(`yieldCensus.perCorrection`), and the write calls no model, so the population can be rebuilt offline:

| | entity values | clipped |
| --- | --- | --- |
| rebuilt from `tasks.json` at 2,000, verbatim `Q:`/`A:`/`note:` | **128 of 128 kept** | **2** |
| R88 as measured | 82 of 128 kept | 2 |

The reconstruction reproduces both of the arm's own counters — 128 entities, 2 clips — and keeps every
value. The writer is verbatim. What removes 46 values is `kernel/guard.ts`, whose second rule is a
North-American phone pattern —

```
{ pattern: /\b(?:\+?\d{1,3}[ -]?)?(?:\(?\d{3}\)?[ -]?)\d{3}[ -]?\d{4}\b/g, replacement: '[phone]' }
```

— and it is ten digits. Every τ² retail `product_id`, `item_id` and `new_item_id` is ten digits. Task
15's gold call `get_product_details(product_id="7363354090")` is stored as
`get_product_details(product_id="[phone]")`, and the email rule takes
`daikisanchez1479@example.com` the same way. `redactJson` runs on the edit's `after` payload in
`capture/normalize.ts`, and `redact` runs again on the statement in `distill/distiller.ts`, so the value
is gone before the interpreter can build a record from it.

**This is the fifth layer, and it is not the writer's.** The guard is right: a memory that persists a
user's phone number because it arrived as a tool argument has shipped the defect the guard exists to
prevent. What was wrong was that nothing in this lane could say the sentence, so six readings were made
to carry an explanation they did not have — `recall.empty`, coverage, `served`, and finally a rate the
registration could not acquit.

**What now exists.**

- `FaithfulnessCensus.redacted`, counted by a predicate the caller supplies (`guardReplaces`, from
  `tau2-redaction.ts`), so the loss the guard caused is counted apart from the loss the writer caused.
- The predicate asks the guard itself rather than re-implementing it: two definitions of what counts as
  personal data would drift, and the drift would be invisible in the direction that flatters a dispatch.
- A missing entity the guard would have left alone is **not** counted as redacted. A redaction counter
  that absorbed every loss would be an alibi for the writer — the same defect as a `?? 0` printing an
  absence as a zero, one measurement over.
- On R88's own twelve corrections the decomposition is exact: **82 kept + 46 redacted = 128**, nothing
  unexplained.

**The consequence for the arm's central claim, stated before it is measured.** The store the model reads
contains `[phone]` where the answer's identity was. That is not "a memory that helps less than it
should"; it is a memory that hands the agent a placeholder in the slot the tool call requires, which is a
candidate mechanism for the negative effect this lane keeps failing to explain — and the first one found
that lives in the *safety* layer rather than in the memory design.

### 34.113 The pack was the constraint: +12.68pp from one number, and two predictions that were never its own

`R89` (`prereg/R89-pack-carries-what-it-wrote.md`, run `43250414145`, head `e6629b55`, 1h55m) returned
**`ABANDONED`** on its readback — and it is the first arm in this lane whose *outcome* cleared its bar
while the design that produced it did not:

| | registered | reading | verdict |
| --- | --- | --- | --- |
| budget, capacity, sample | 2,400 / 2,010 / 228 | 2,400 / 2,010 / 228 | PASS |
| nothing dropped for size | `droppedForSize = 0` | **1,596** | FAIL, refutation fired |
| one recall carries two records | `meanIds ≥ 2` | **1.00** | FAIL, refutation fired |
| coverage p50 | ≥ 25% | **25.00%** | PASS, at the boundary |
| `pass^4` | ≥ 0.575 | **0.7018 ± 11.88pp** (n = 57) | PASS, **+12.68pp** |
| the write, held fixed | 12 records, 2 clipped | 12 records, **1** clipped | FAIL, see below |

The five readings in order, because each one constrains the next.

**The pack was the constraint, and this is the first clean confirmation of it.** R88 read 9.09% coverage
and 82 of 228 requests served; R89 reads 25.00% and **228 of 228**, with `empty = 0` and
`emptiedBySize = 0`. The only number that moved was the budget. `pass^4` moved 0.5614 → 0.7018.

**And 2,400 is still not enough, which the arm's own counter now says.** `droppedForSize = 1,596` over
228 requests — seven candidates refused per request, every request — because a record in this arm is
~1,717 characters and the wrapper charges 390: one record fills 2,107 of 2,400 and leaves 293, so a
second never fits. The registration's arithmetic said *"two 744-character records fit (2 × 861 + 390 =
2,112)"*, and 744 was the census's p50. **The census under-measured the population by more than a
factor of two**, and it says so about itself: it rebuilds a record as `Q:` and `A:` only, so its own
docstring calls the result "a lower bound on length". This is the second time in two rounds that a
number derived from that lower bound was wrong in the same direction — R88's ceiling was the first, and
R89's Amendment 1 recorded it without drawing the general conclusion. The conclusion is: **a quantity
whose measurement is a lower bound cannot be used to size a budget; it has to be measured on the store.**

**The write row failed, and the failure is mine, not the arm's.** Amendment 1 said `clipped = 2` was
"held at what R88 measured". It was not: the store is built from the tasks whose *episodes failed*, so
which twelve corrections exist depends on the trials. This run's twelve are not R88's twelve — 135
entity values against 128, tasks 3 and 32 present, others absent. `records` is stable at 12 and
`clipped` is a property of the population, so the row can only be graded in direction. Amendment 1
should have said "unchanged in kind" and did not.

**Two predictions in R89 were never R89's to make.** `droppedForSize` and `meanIds` are the *pack's*
occupancy; R89 moved the budget, so it owned the first and not the second, and the first failed on the
capacity's own arithmetic. The rule this round adds to the registration discipline:

> A registration may only predict a quantity its own variable controls. A quantity it inherits is
> graded as *did not change*, and when the population varies between runs it is graded in direction
> only. An inherited row that fails is not evidence about the arm — but it is evidence that the row
> should not have been written as a prediction.

That rule immediately applies to **R90**, which was written before this readback existed and predicted
`droppedForSize = 0` and `meanIds ≥ 2` at a pack it does not touch. Amendment 1 on R90 replaces both
with R89's measured values — written at 18:05 UTC with the run dispatched at 17:47 and no readback of
it in existence, which is stated in the amendment because the difference between an amendment and a
goalpost move is whether the result existed when it was written.

**What the identity exemption is now measured to do, model-free.** The guard fix keeps **127 of 128**
values on R88's twelve statements (82 before), the one still lost being the address in `user_id`. R90 is
in flight and prices it.

**Delivery.** 224 test files, **4,590 tests**, coverage **100 / 99.99 / 100 / 100**, `pnpm check` exit 0,
78/78 registrations valid, coupling ledger 201 modules. The core bundle ceiling moved 47,000 → 47,500 raw
and 16,000 → 16,200 gzip — the smallest raise that gate has taken, argued beside the number.

## 34.114 The store was a draw, and four rounds of comparisons were read as if it were a constant

**The defect.** R90 was graded `ABANDONED` on a row its own registration did not contain, and the row is
worth more than the arm:

```
R89 store: 12 corrections, tasks 3, 15, 18, 20, 32, 33, 34, 38, 41, 100, 107, 110
R90 store: 15 corrections, tasks 0, 15, 18, 20, 27, 31, 32, 33, 34, 38, 103, 104, 107, 109, 111
shared:    8        only R89: 4        only R90: 7
```

Same domain, same 57-task learn half, same one trial, same model, same seed variable. The store differs by
seven records. The mechanism is not a bug in any file: `learnableCorrections` selects the tasks whose
reward fell below 1, the learn half runs **one** trial per task, and one trial of a sampled model is a
draw. A store built from a draw is a draw.

**What that invalidated.** R90's header states "One variable. R90 against R89 is the guard and nothing
else." Two variables moved. R88→R89 is unaffected — both stores are twelve records and the treatment is
the pack alone — but the lane's other comparisons are not:

| pair | treatment | store | readable as |
| --- | --- | --- | --- |
| R85 → R88 | ceiling 700 → 2,000 | 12 → 12 (different twelve) | direction only |
| R88 → R89 | pack 1,200 → 2,400 | 12 → 12 (different twelve) | **the pack**, because both are 12 |
| R89 → R90 | guard | **12 → 15** | **nothing** |
| R90 → (R91 as originally planned) | pack 2,400 → 4,800 | 15 → a new draw | **nothing** |

The class of error is the same one §34.113 named — a registration predicting a quantity its own variable
does not control — but it is worse, because the quantity is not a row in the registration at all. It is
the *population*, and the registration discipline had no rule about populations.

**The rule this adds.**

> A treatment is only the treatment if the population it acts on is fixed. A registration whose
> population is rebuilt by the run must pin it, or it is measuring a difference between two draws and
> attributing it to a switch.

**The fix, and why it is structural rather than statistical.** Statistics cannot recover a confounded
comparison: `−7.02pp` with a `±12.5pp` half-width is inside the noise and confounded besides, so no
interval helps. What helps is that the population is *derivable* — `taskCorrection` reads
`evaluation_criteria.actions` and `user_scenario.instructions`, both corpus fields, and `distillScope:
edited` decides only *which* tasks contribute. So the store is a function of (corpus, failure list), and
the failure list is fifteen ids. `eval/pins/r90-retail.json` is that list; `tau2-pin.ts` prices it against
the pinned corpus; a misspelled id is an `L4ParseError` rather than a smaller store, because a store that
silently shrinks still reports every counter as measured.

**What the readback grades apart, and why the verdict is `ABANDONED` rather than `GRADED`.** Three things
moved in R90 and only one is a failure:

- the **signature** held: 171 of 172 values kept (99.42%), one redacted, against R88's 82 of 128 (64.06%)
  — the exemption is on the path the driver takes, which is the only reading that distinguishes a guard
  that was taught from one that was edited and never called;
- the **outcome** held above the published bar: `0.6316` vs `0.575` (+5.66pp), `gates_passed 3`;
- the **design** did not: fifteen records against a registered `12 ± 2`.

The readback therefore reports all three and abandons on the third, and the sentence it exists to keep
separable is: *the 99.42% is real, the +5.66pp is real, and neither is evidence about what the placeholder
cost.* Its fourth refutation — whole records with real identities still scoring below the baseline — is
the one that would have been evidence *for* a negative effect, and it did not fire.

**Why this audit is not a scolding of one arm.** The same draw has been quietly present since R85, and
every "the pack moved it" reading between R85 and R90 that is not R88→R89 was quoting a number whose two
halves both moved. That is the finding. R91 exists to make it stop: same store, same pack, no learn half,
228 episodes, under $1.05.

**Delivery.** 225 test files, **4,619 tests**, coverage **100 / 99.99 / 100 / 100**, `pnpm check` exit 0,
80/80 registrations valid, coupling ledger 202 modules / 54,197 lines, `pnpm audit --prod` clean after
`@hono/node-server` 2.1.5 → 2.1.8.

## 34.115 A gate failed twice and could not say why, and the reason was in the diff

**The failure.** Two consecutive CI runs on `15e252e0` failed `Repository audit` with one line:

```
dependencies: published dependencies have advisories: Error: Command failed: pnpm audit --prod
```

The same command was clean locally, twice, including after a `--frozen-lockfile` install. `scripts/audit.mjs`
sliced the process text at 200 characters, so *a real advisory* and *a registry that would not answer*
produced the same sentence. That is a checker an operator learns to ignore — the class this repository
keeps writing audits about (`§34.85`).

**The cause was not the registry.** The pin commit's message claimed `@hono/node-server` 2.1.5 → 2.1.8; the
diff did not carry `packages/node/package.json` or `pnpm-lock.yaml`, because the two files were edited in
the working tree and left out of the index. CI checked a lockfile that still resolved **2.1.5**, the two
moderate advisories were real, and the gate was right to fail twice. The local "clean" reading was clean
because the working tree held the fix the commit did not.

**Three things are recorded rather than one.**

1. **The gate's message.** An advisory and an unreachable registry now read differently, the tail of the
   command's own output is kept, and a failure that carries no verdict is retried three times with a
   widening pause. A findings table is **never** retried: retrying a decision turns it into a race, and a
   retry around a real vulnerability is the failure mode this paragraph exists to name.
2. **The claim.** A commit that names a dependency change has to *be* the dependency change. The two files
   landed as their own commit (`6664950`) with the reason in the message, because the alternative — a
   message that says a fix exists beside a diff that does not contain it — is how a green local gate and a
   red CI gate diverge with nobody lying.
3. **The first attempt at an explanation was wrong.** The commit that improved the message attributed the
   failure to the registry, and the sentence "the same command was clean locally" was true only because of
   the unstated working-tree change. The correction is in this section rather than as a follow-up commit
   because an empty commit cannot be pushed through the Git Data API — a tree with no changes has no tree
   to create — and the record belongs where it will be read.

## 34.116 The instrument asked a question and never recorded it: the draws, enumerated

**The defect.** R91 was built to remove one draw and did. The store replayed character for character. And
the pack it produced did not replay: `meanChars` 1,812.07 against R90's 1,825.31, coverage p50 0.2857
against 0.2800. The registration had listed both as equalities, so its readback fired two refutations that
named a renderer, an admission decision or a clock. The mechanism was none of them: `buildPack` ranks on
BM25 over the **query**, and the query is the user simulator's first turn, which τ² samples from
`user_scenario.instructions`. **No arm in this lane has ever recorded a query.** R89 1,717.21, R90 1,825.31,
R91 1,812.07 — three draws, one of them now behind a pinned store.

**Why the same class of error keeps arriving.** §34.114 established the rule "pin the population or you are
measuring two draws". It was applied to the one draw the readback could *see* — the store, because
`storeItems` happened to be in the artefact. The rule was never applied as an enumeration. Written out, the
inputs to a τ² arm are:

| input | a draw? | fixed by |
| --- | --- | --- |
| the task corpus | no | the pinned τ² checkout |
| which learn tasks failed → the store's population | **yes** | `storePin` (R91) |
| the corrections' content | no | corpus fields (`evaluation_criteria.actions`) |
| the recall query text | **yes** | `queryPin` (R92), recorded unconditionally |
| the pack options (budget, floor, diversity, note) | no | the registration |
| the evaluation trials | **yes** | nothing — 57 × 4, `±12.52pp` |
| the model's sampling | **yes** | nothing |

Two of the five draws were invisible in every artefact this lane produced, and both were the two that decide
what the memory *says*. The lesson is not "pin more"; it is that a rule phrased as a principle gets applied
to whatever the last failure was, so this one is now phrased as a table: **every input a run rebuilds has to
be recorded, and every recorded input has to be pinnable.** Recording is the part that cannot regress — R90's
store pin existed only because `storeItems` carried the statements, and R92's query pin can exist only
because this arm carries the queries.

**The rule this adds.**

> An instrument that cannot report what it asked cannot explain what it got. Record every input the run
> generates, whether or not the current arm pins it: the pin is a decision, the record is the evidence.

**What the cohort of readings means for the record.** `meanChars` and `coverage` from R85 to R91 are readings
of (query draw, pack), not of the pack. Directionally they still separate a 1,200-character pack from a
2,400-character one — the gap is 100 characters of text against a 13-character draw — but none of them is a
paired reading, none is quotable to four figures, and R90's `coverage p50 0.28` should have been written
`0.28 (one draw)`. The one pair that survives untouched is R88→R89: both stores hold twelve records and the
treatment is the pack alone.

**The fix.** `tau2-queries.ts`: a census (`requests`, `distinct`, `meanChars`, `p50Chars`, `digest`,
`askedDigest`, `replaced`, `pin`, and the texts) and a pin (`parseQueryPin` / `pinnedQueryText` /
`assertQueryPinCovers`). Two properties are load-bearing:

- the digest is over the (position, text) mapping **sorted**, not over arrival order, because two arms that
  asked the same questions in a different order asked the same questions;
- the pin is validated against `tasks × trials` **before the first episode**, because a miss at recall time
  is a 500 that `microglia_agent` survives by continuing without memory — an episode served no pack, and the
  artefact would still call itself pinned.

**What it deliberately is not.** The episodes cannot be keyed by task id: the agent sends `task=tau2.act` on
every request and `generate_next_message` never sees a task. Position in the phase is the honest key, and it
is self-checking — a pin replayed into a differently-ordered phase changes the digest, and the readback
compares digests.

**And a correction to the previous audit's own prose.** §34.114's fix note said a pinned list gives "the same
15 records, same 172 values, same 1,825-character mean pack". The first two held; the third did not, and
`tau2-pin.ts` carried the same wrong sentence in its header until this round. A module's docstring is part of
its evidence.

**Delivery.** 4,660 tests, coverage **100 / 99.99 / 100 / 100**, `pnpm check` exit 0, 81/81 registrations valid,
coupling ledger 203 modules / 54,653 lines, `r91_readback.py` 12/12 self-tests and its real readback re-run against R91 with the mechanism in the
refutations. `tau2-instrument`'s `PROJECTION` table forces a decision for `queries`, so the field cannot be
added to the driver and dropped by the projection the way `dropped` and `pin` were.
