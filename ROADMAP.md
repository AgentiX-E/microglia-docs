# Roadmap

The plan, in stages, with the gate that ends each one. A stage that misses its gate stops; it does not
roll forward into the next with a caveat. This document is the contract between the design and the
work, and it is updated only when a stage closes or a gate changes for a stated reason.

Status as of **2026-10-20**.

## Stage map

| Stage | Question it answers | State | Exit gate |
|---|---|---|---|
| **S0 Mechanism** | Does feedback become knowledge that transfers? | **done** | G1–G15 green in `AgentiX-E/microglia` |
| **S1 Host shadow** | Does it help on one real product, offline? | next | +3pp chart top-1 on 1,300 adjudicated cases, κ ≥ 0.7; no SQL regression |
| **S2 Public benchmarks** | Does it beat the same backbone on published data? | **read at n=352: no benefit (−2.84pp)** | BIRD-Interact +5pp at n=600; nvBench 2.0 +3pp; no memory-substrate regression |
| **S3 SOTA push** | Can it lead a named benchmark, not merely improve on a baseline? | conditional | preregistered result beating the published best under the same protocol |

## S0 — Mechanism (done)

**Scope.** Eight packages, the study instrument, the gates, the external documentation, and CI in
`AgentiX-E/microglia`.

**Delivered.**

| Item | Evidence |
|---|---|
| Layered monorepo, eight packages, zero external runtime dependencies | `packages/*/package.json`, `scripts/audit.mjs` |
| Nine-arm ablation over a fixed corpus | `pnpm bench` → `bench/results/study.json` |
| Three micro-ablations for the modules a clean corpus cannot exercise | `packages/eval/src/ablations.ts` |
| Fifteen gates, none advisory | `buildGates` + the CI gate step |
| 370 tests, coverage 100 / 99.53 / 100 / 100 | `pnpm test` |
| Repository audit (secrets, manifests, soft failures, published deps) | `pnpm audit:repo` |
| Live-API POCs (DeepSeek reader/distiller, Zhipu embeddings) | `poc/results/*.json`, `poc-live` workflow |
| Cortex conformance against a real build | `scripts/cortex-conformance.mjs`, `cortex.yml` |
| Public-benchmark harness | `poc/sota-bird.ts`, `sota.yml` |

**What was learned that changed the design.**

1. A pack claimed rules it had not rendered (§12.7 of the technical design). Fixed; the budget arm is
   now measurable.
2. Generic chart knowledge does not help a strong model; organisational convention does (0% → 75–89%).
3. Structured corrections need a semantic edit distance, or they never clear admission.
4. Unconditional hybrid retrieval loses to BM25 on light paraphrase and to dense on heavy paraphrase;
   the channel is confidence-gated, not blended.
5. CPU retrieval at 10k items is 2.6–3.1 ms p95 — the SQLite index belongs at 100k, not 10k.

## S1 — Host shadow (next)

**Question.** On one real product, with real users and no model change, does the pack improve the
first-pass answer?

**Work.**

1. Instrument `nl2charts` behind a flag: capture edits and ratings, write to a local journal, recall
   before generation. No distillation until the instrument is trusted.
2. Adjudicate 1,300 chart cases (two annotators, κ ≥ 0.7 measured, disagreements resolved by a third).
3. Run three modes offline on that set: no pack, pack from the *training* half, pack from the training
   half with generalisation disabled.
4. Report top-1 and a SQL non-inferiority check, with the same paired statistics the study uses.

**Exit gate.** +3pp top-1 (p < 0.05), SQL regression ≤ 1pp, knowledge precision ≥ 85% on a 100-item
audit. **Stop rule:** if the gate misses, invoke K1 (stop; do not pivot to another benchmark to find a
friendlier number).

## S2 — Public benchmarks (planned)

**Question.** Does the same loop improve a strong backbone on data nobody curated for us?

**Suites and power.** Sample sizes are chosen so a null result means "no effect", not "underpowered".

| Suite | n | Effect detectable at 80% power |
|---|---|---|
| BIRD-Interact (full) | 600 | ~5.8pp |
| BIRD-Interact Lite | 300 | ~8pp (reference only) |
| nvBench 2.0 | 750 | ~3.3pp |
| Text2Vis | 1,985 | ~2pp |
| MemoryAgentBench | 2,071 | ~2pp |
| LongMemEval-S | 500 | substrate regression check |

**Read 1 (2026-10-20, superseded).** n=30, half split: 50.00% → 53.33%, +3.33pp. Reported as a
direction, not a result: at n=30 nothing below ~17pp is distinguishable from noise, and the pack held
half a rule per question. **Retracted** by the cross-fitted read below.

**Read 2 (2026-10-20, cross-fitted).** Every usable Mini-Dev question (n=352, 11 databases), 5 folds,
each question evaluated once by a memory that never saw it: **54.83% → 51.99%, −2.84pp, 95% CI
[−6.25, +0.57], p = 0.143**, 24 questions lost against 14 gained, no fold positive, 2.25 rules per
question, 216.8 active rules per fold. Resolution 4.91pp; all five instrument gates passed.

This is a **negative result for the hypothesis as stated** ("distilled schema lessons help a strong
model"), not a broken harness: POC-2 measured the same asymmetry on the other workload (generic
knowledge −2.38 to 0pp, organisational convention +75 to +89pp), and BIRD has no organisational
convention to learn — its schema is already in the prompt.

**Consequence.** S2 does not advance on this lane. Before either declaring failure or changing the
hypothesis, the next run separates the four explanations with one protocol: replication (full),
dilution (narrow), content (wrong-scope pack, same token cost), and channel (oracle hint — if the gold
SQL injected as a "convention" does not move accuracy, the lane itself is broken). A distillation parse
failure rate of 25.9% is also under repair, because it biases which corrections became rules.

**Read 3 (controls, 2026-10-20).** The same folds with five arms (`39406533126`, n=352): full
−1.14pp (p=0.572), duplicate −2.27pp (p=0.200), wrong-scope −1.42pp (p=0.383), oracle **+30.97pp**
(p<1e-4). Right rules, wrong rules and doubled rules are indistinguishable; one injected statement
moves the model by 31pp. The pack is read but not needed: 384 of 445 ever-injected rules changed
nothing.

**Consequence.** The hypothesis fails **as stated** ("distilled schema lessons help a strong model"),
and it fails for a reason that constrains the product rather than the engineering: BIRD's gold encodes
no convention the model cannot infer from the DDL. S2 does not advance here, and the next benchmark
must carry a learnable convention — not merely more questions.

The stop rule stays as written: **two benchmark failures end the SOTA path.** BIRD Mini-Dev has now
failed twice (read 2 and read 3), so the SOTA push is stopped on this benchmark; it resumes only with
a suite whose gold contains a house convention.

**Exit gate (revised 2026-10-20).** The original gate — BIRD-Interact ≥ +5pp at n=600 — was written
before the mechanism had been measured on public data, and the four reads above show it tests the wrong
thing: BIRD's gold contains no knowledge the model cannot infer, so the pack is inert there by
construction. The gate is replaced by a protocol in which the knowledge is load-bearing by design.

## S2b — convention transfer on a public benchmark (in progress)

**Question.** Can the flywheel learn a house convention that the model cannot infer, and apply it to
held-out questions about the same database?

**Protocol (preregistered before the run).**

1. **Subset.** Questions whose gold result is one row with one numeric column. The convention is
   undefined for anything else, so the subset is chosen by a rule, not by looking at outcomes.
2. **Convention.** The workspace reports those quantities in thousands, rounded to three decimals:
   `reported = round(gold / 1000, 3)`, applied at evaluation time. The database is untouched, so the
   model cannot read the convention from the schema — which is the property every successful
   measurement in this document shares.
3. **Arms.** `none`; `full` (convention learned only from corrections in the other folds); `stated`
   (the convention written in the prompt from the start, an upper bound); `oracle` (the gold value).
4. **Metric.** Execution accuracy under the transformed comparison, paired by question.
5. **Sample.** Every qualifying question. The subset size is reported before the result is read; if it
   is below 100, the run is reported as a direction and the gate is not applied.

**Gate.** `full` beats `none` by **≥10pp with p<0.05**, and `oracle` is ≥90%. **Falsification:** if a
convention that is stated once, corrected twice, and unreachable from the schema cannot be learned and
applied, the flywheel fails at the one thing it claims, and S3 does not start.

**Why this is the right next experiment.** It is the only protocol in this document where the
knowledge is both non-inferable (so it can matter) and scored by execution (so it cannot be
argued with). It also exercises the whole product path — capture, distill, admission, generalisation,
recall, apply — on data nobody curated for us.

**Cost.** Roughly 1,400 model calls for 5 folds at the current subset size, about 40 minutes.

**Read 1 (2026-10-21, run `39548548865`).** Two amendments were forced by measurement: the convention
is *round to the nearest ten* (thousands turned counts into expected answers of `0.007`), and the
channel control is the stated *rule*, because a stated value is ignored by the same model.

| Arm | Accuracy | Δ | p |
|---|---|---|---|
| none | 6.85% | — | — |
| full (learned) | **11.64%** | **+4.79pp** [+1.37, +8.90] | **0.0156** |
| stated rule | 17.81% | +10.96pp [+6.16, +16.44] | 0.0001 |
| stated value | 9.59% | +2.74pp [+0.68, +5.48] | 0.125 |

n=146, 5 folds, 7 gained and 0 lost. The loop recovers **44%** of the stated ceiling.

**Read 2 (replication, run `39608497021`).** +2.05pp [0.00, 4.79], p=0.250, 3 gained and 0 lost;
stated +11.64pp, value +2.74pp. Across both runs 10 gained and 0 lost.

**Status.** The direction replicates, the magnitude does not: 4.79pp then 2.05pp, against a stable
stated ceiling of 11–12pp. The S2b gate (≥10pp) is **not** met. What is now measured is narrower and
more useful: a convention is transferred from corrections alone, at a quarter to a half of what
stating it is worth, and the gap is the retrieval-versus-distillation question the next run must
separate.

## Design phase (2026-10-21 — closed)

The pipeline contract is written and frozen for implementation: eight stages (P0–P8), a metric table per
stage, and fourteen POCs with gates. It is §17 of the technical design; the three decisions that change
the data model are the task instance, the validity interval, and per-item utility counters.

Implementation waits for an explicit signal. The six questions the design still carries are all
evidence questions with a named POC and a number (§17.15); none is a requirement ambiguity.

## S3 — SOTA push (conditional)

Only if S2 replicates. Requires a preregistration (frozen protocol, frozen prompts, frozen sample)
before the run, and a result that beats the published best *under the same protocol* — not a different
split, not a different metric.

## Standing work, outside the stage gates

These are tracked but do not block a stage; each has a trigger.

| # | Item | Trigger | Note |
|---|---|---|---|
| W1 | **Cortex release dependency** | `@agentix-e/cortex-*` publishes | **Highlighted action item.** Today the adapter carries a structural copy and the `cortex` workflow clones and builds cortex to check it. On release: depend normally, switch the copy back to `import type`, delete the clone lane. |
| W2 | vitest 4 migration | vite 7 lands in the toolchain | Clears the four dev-only advisories; it changes coverage semantics, so it is a deliberate migration, not a bump |
| W3 | SQLite index at 100k items | a host reports > 50k rules | The O(n) scope scan is fine at 10k (2.6–3.1 ms p95) |
| W1b | **BIRD data hosting** | before S2 can run | **Highlighted.** The upstream repository holds questions only; execution accuracy needs the databases. Upload the complete Mini-Dev package as a release asset and set the `BIRD_ARCHIVE_URL` repository variable. The lane then runs unchanged. |
| W4 | LLM-judge calibration | S2 begins | κ ≥ 0.7 against 200 human labels; until then the judge is a measured, uncalibrated model |
| W5 | Per-user preference scope | S1 shows cross-user variance | Requires a cold-start policy, which is a product decision |
| W6 | Multi-process writer | a host runs > 1 writer | Today: one writer per directory, documented |
| W7 | On-device embedding adapter | a host needs offline retrieval | Must pass the CPU/WebGPU constraint; no CUDA, ever |

## Sequencing rationale

S1 before S2 because S1 is cheap, private, and diagnostic: a failure there means the integration is
wrong, while a failure at S2 could mean the integration, the benchmark, or the hypothesis. Running the
expensive experiment first would leave three explanations for one number.

S3 last because a SOTA claim is a claim about the field, and it should be made only after the mechanism
has survived a product and two public datasets.
