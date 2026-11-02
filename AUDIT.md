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

**24.7 What is still not closed.** Stage 3 — moving the eight SQL modules into `eval-sql` and splitting `sota.ts`
on the signature rule — is mechanical and open; it changes no number. The τ² lane cannot yet ingest a transcript,
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

**25.7 What the audit does not cover.** It audits whole-artefact deltas. An arm inside an artefact is not a row, so
the record's one positive reading — the `values` channel — had to be looked up by hand, and any artefact that
carries several arms understates its own positives. This is written into the artefact's `notes`. Closing it needs an
arm-level table, which is a different reader over `arms` and `contrasts` rather than a parameter of this one.

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
