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
