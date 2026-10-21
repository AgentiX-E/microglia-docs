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
| C25 | Packs are lexically unaddressed to their questions | per-case coverage recorded on 352 questions | **yes**: median **7.1%**, p90 22.2%, **47% share no content word** | whether a better lesson form fixes it; that is POC-33 | A |
| C26 | The pack, not the model, dominates token cost | cost model derived from the recorded artefact | **yes**: 2,383 tokens per arm-evaluation; a 1,200-char pack ≈300 tokens = **26%** of the median question's 1,133 | other hosts; the ratio depends on their prompt size | A |

## 2. Defects found and fixed during these audits

An audit that finds nothing is an audit that did not look. Eight defects were found by writing invariants
down as tests, or by recording a failure's cause instead of its message.

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
| H4 | Per-item keywords/tags are why one memory architecture beats naive retrieval on distractor-heavy sets | **R** | partially adopted as the alias (D8) | POC-33 |
| H5 | A one-hop walk over typed edges buys ~7% on associative recall | **R** (ICML 2025) | deferred (D10) | POC-17b |

## 4. What is *not* verified, and why

| Item | Status | Why it is honest to leave it open |
|---|---|---|
| A public benchmark benefit on unmodified data | **four null reads**, n=352 | the lane is sound (oracle +30.97pp) and the pack is inert; this is a result, not a gap |
| Convention transfer at a stable magnitude | **two reads**: +4.79pp then +2.05pp | 4.79 sits under the sample's 5.08pp resolution; the direction replicates, the size does not, and both are reported |
| Host shadow results (S1) | not started | needs the private adjudicated set (1,300 cases, κ≥0.7) and real users; no synthetic substitute means anything |
| LLM-judge calibration (κ) | not started | needs 200 human labels; a judge validated against itself is not validated |
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
pnpm poc:attribute                            # per-rule attribution from the committed artefact
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
5. **Three defects were in the measurement, not the product** (B6–B8). Each was found by recording a cause
   instead of a message, which is now a rule for every lane.
6. **Nine questions remain open** (§19.3 of the technical design). Each has a POC, a number and a stopping
   condition; none is a requirement ambiguity, and none is hidden behind a green build.
