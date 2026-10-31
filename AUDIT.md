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
