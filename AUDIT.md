# Audit report

An audit of the claims this project makes, not of the code's style. For each claim: how it was
verified, what the verification can and cannot support, and what would falsify it. Written after the
S0 exit gate, and updated whenever a claim changes.

Audit date: **2026-10-20**. Repository under audit: `AgentiX-E/microglia` at `master`
(`370` tests, coverage `100 / 99.53 / 100 / 100`).

## 1. Claims and their instruments

| # | Claim | Instrument | Verified | What it cannot support |
|---|---|---|---|---|
| C1 | Feedback becomes knowledge that transfers to unseen questions | 9-arm study, 280 paired held-out questions, exact McNemar | **yes** | anything about a real model on a real product; the reader is deterministic |
| C2 | A domain that never received feedback improves, because rules widen | same study, `ops` excluded from every feedback batch | **yes**: 100.00% vs 32.86% | that a *different* unseen domain would behave the same; only one was held out |
| C3 | Quarantine is load-bearing | `unguarded` arm, identical poison, ceiling removed | **yes**: −17.86pp | that no other defence could achieve the same; only this one was ablated |
| C4 | Labelling noise is absorbed | `noise` arm, 20% of corrections point at a wrong chart | **yes**: +68.21pp, no loss | robustness beyond 20%; the noise model is uniform, not clustered |
| C5 | Credit assignment stops a rule that is always wrong | micro-ablation: one rule cited in 4 failing runs | **yes**: withdrawn vs injected | the exact number of failures a host should tolerate |
| C6 | Contradiction resolution halves prompt spend on conflicts | micro-ablation: two trusted claims, same scope | **yes**: 1 active / 429 chars vs 2 / 717 | an accuracy effect; with two rules the answer depends on the tie-break |
| C7 | Diversification buys coverage | micro-ablation: 12 paraphrases + 3 distinct, equal relevance | **yes**: 4 distinct vs 1 | behaviour under real, unevenly relevant stores |
| C8 | A pack never carries a rule it did not render | budget sweep, 64 budgets × 40 rules | **yes, after a fix** | nothing; the invariant is asserted at every budget |
| C9 | A strong model already knows generic chart grammar | live POC, DeepSeek, 42 generic cases | **yes**, 3 runs: 90.48% → 88.10–90.48% | other models; one provider was tested |
| C10 | Organisational convention is what the pack adds | live POC, 28 house cases | **yes**, 3 runs: 0% → 75.00–89.29% | that 75% is enough for a customer; the conventions are synthetic |
| C11 | Free-text corrections distill into typed lessons | live POC, 24 events, shipped prompt/parser | **yes**, 3 runs: 91.67–95.83% mark, 95.83–100% intent | quality on ambiguous or multi-lesson comments |
| C12 | Injection attempts do not become active rules | same POC, 3 adversarial comments | **yes**, 3 runs: 0 active of 3 | resistance to a determined, adaptive attacker |
| C13 | BM25 is the right default; dense is the right exception | live POC, 96 query-rule pairs, Zhipu `embedding-3` | **yes**: light 58.33% vs 54.17%; heavy 20.83% vs 29.17% | other embedding models; one was tested |
| C14 | CPU retrieval is viable at 10k rules | scale POC, 3 sizes × 100 queries, 3 runs | **yes**: p95 2.6–3.1 ms, heap 14 MB | 100k, where the O(n) scan is expected to cross the budget |
| C15 | The adapter matches cortex's real `MemoryValue` | clone + build + field-by-field comparison in CI | **yes**: 12 fields matched | cortex's runtime behaviour; only the projection shape is checked |
| C16 | No knowledge crosses a namespace | study probe with a foreign namespace | **yes**: 0 hits over 50 questions | cleverer leaks through shared ids; ids are namespaced by construction |
| C19 | The loop helps a real model on a public benchmark | BIRD Mini-Dev, held-out half, DeepSeek, execution accuracy | **first read**: 50.00% → 53.33% (+3.33pp, n=30, 18 active rules, 0.5 rules injected per question) | significance; n=30 is underpowered for anything below ~17pp |
| C18 | The governance layer, not the retriever, produces the lift | competitor-shaped fact store on the same corrections, clean and poisoned | **yes**: 56.07% vs 100.00% (+43.93pp), and 19.64% under poison | other competitor designs; one shape was replicated |
| C17 | Every published number is reproducible | `pnpm bench` writes the artefact; the report is rendered from it | **yes** | numbers quoted from a different commit than the one under audit |

## 2. Defects found and fixed during the audit

An audit that finds nothing is an audit that did not look. Five real defects were found by writing
invariants down as tests.

| # | Defect | How it surfaced | Impact had it shipped | Fix |
|---|---|---|---|---|
| B1 | `makePack` returned candidate items with an empty rendered block | the budget invariant failed on its first run | a host applying `items` would inject rules the model never saw; the study reported 100% on an empty prompt | filter `items` to the rendered ids |
| B2 | A redaction counter counted structural changes, not redactions | a test asserted "no secret, no redactions" | every edit on a nested object reported 4 redactions — an audit signal that lied | count changed string spans |
| B3 | `Infinity` timestamps became `null` on reload | a reopen test asserted `validUntil === Infinity` | `NaN` confidence after restart → every reloaded rule silently inactive | `rehydrateKnowledge` |
| B4 | The second budget pass was dead code | coverage showed the loop body unreachable | a guarantee that was never exercised; the header-count theorem was wrong at >99,999 items | proved the bound, added an explicit size limit |
| B5 | `no-generalization` widened onto unadmitted candidates | the gate on the unseen domain moved when the target rule changed | rules promoted before earning admission | widen only onto an active rule |

Two more were found earlier and are recorded in the technical design: the payload-shape omission that
made LLM distillation produce 0% correct payloads, and the corpus generator that silently skipped a
malformed domain instead of failing.

## 3. What is *not* verified, and why

| Item | Status | Why it is honest to leave it open |
|---|---|---|
| Public benchmark numbers at S2 power | **first read only, n=30** | the lane runs end to end; the sample is 5% of what the power analysis asks for, so the +3.33pp is a direction, not a result |
| Host shadow results (S1) | not started | requires a real product and real users; no synthetic substitute would mean anything |
| LLM-judge calibration (κ) | not started | needs 200 human labels; a judge validated against itself is not validated |
| Successor models | not tested | one provider, three runs; the docs say so wherever a model number appears |
| 100k-rule behaviour | not measured | 10k is measured; extrapolating would repeat the mistake this audit already corrected once |
| Multi-writer safety | not implemented | documented as a single-writer design, with the failure mode named |
| Dev-dependency advisories | open, tracked | `pnpm audit` reports four in the vitest chain; none is in the published artefact (zero runtime dependencies), and clearing them needs a vitest 4 migration that changes coverage semantics — scheduled, not ignored |

## 4. Reproducibility check

Any number in the two design documents can be regenerated by three commands, in this order:

```bash
pnpm install --frozen-lockfile
pnpm check                     # typecheck → 370 tests with coverage gates → audit → study
pnpm build && node packages/eval/dist/bench/run.js   # the study alone, 0.33 s
```

The live POCs need credentials and are therefore run by the `poc-live` workflow, which fails if the
keys are absent rather than skipping. Their artefacts are committed under `poc/results/`.

## 5. CI evidence

| Workflow | Trigger | Last state | What it proves |
|---|---|---|---|
| `ci` | every push and PR to `master` | **success** (`c75552a`) | build, 370 tests, coverage gates, repository audit, 15 study gates, CPU scale |
| `poc-live` | push to `poc/**`, dispatch | **success** (`1e59e25`) | the live DeepSeek and Zhipu POCs run against the real APIs |
| `cortex` | weekly, dispatch | **success** (`c75552a`) | the adapter matches a freshly built cortex, field by field |
| `sota` | weekly, dispatch | **success** | the lane assembles BIRD from two datasets, runs both arms, and publishes execution accuracy; the first read is +3.33pp at n=30 |

The `sota` failure is reported rather than hidden: it is the only lane whose result depends on a
third-party host, and a green tick there would be a lie about data the run never saw.

## 6. Audit conclusions

1. **The mechanism is verified** (C1–C7) with a controlled instrument, and the instrument has its own
   gates. The numbers are reproducible in 0.33 s on one core.
2. **The product claim is narrower than it first appeared** (C9, C10): the pack sells organisational
   convention, not general knowledge. That is a correction the audit forced, not a nuance added later.
3. **The delivery mechanism matters as much as the learning** (C8, and the `narrow-budget` arm): a
   pack that cannot fit its rules delivers nothing, and a pack that misreports what it delivered is
   worse than one that delivers nothing.
4. **Four items remain open**, each with a named trigger and none of them hidden behind a green build.
