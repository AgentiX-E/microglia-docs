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
| Live-API POCs (DeepSeek reader/distiller, Zhipu embeddings) | `eval/results/*.json`, `poc-live` workflow |
| Cortex conformance against a real build | `scripts/cortex-conformance.mjs`, `cortex.yml` |
| Public-benchmark harness | `packages/eval/src/bin/sota-bird.ts`, `sota.yml` |

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

**Read 4 (2026-10-23, pilot after the data path was pinned).** n=60, 5 folds, four arms
(`39945215096`): 46.67% → 41.67%, **−5.00pp**, CI [−15.00, +5.00], p = 0.51, minimum detectable
14.01pp. Seven of eight gates pass; V5 fails, so the run cannot resolve an effect of the size it is
looking for and says so. The useful output was the attribution: of 74 ever-injected rules, 11 hurt and
5 helped, and the harmful ones are true statements about the question they were learned from.

**Read 5 (2026-10-23, the full split, and the first resolvable answer).** n=350, 5 folds, four arms
(`39975019927`): 53.71% → 49.71%, **−4.00pp**, CI **[−7.71, −0.29]**, p = **0.0436**, minimum
detectable **5.19pp** — V5 passes for the first time. All eight gates pass. The interval excludes zero,
so the pack is **harmful** here, not inert, and the pilot's direction replicates at a sample that can
resolve it. Three readings follow from the controls in the same run:

- `gated` (one shared word) recovers **0.29pp** of 4.00 while removing 0.13 rules per question. Keyword
  relevance is not the lever — the rules that hurt are rules the question mentions.
- `oracle` moves accuracy **+29.14pp**, so the channel is intact: one injected statement the model
  cannot infer does reach it.
- Of 429 ever-injected rules, **24 helped, 53 hurt, 352 were neutral**. The harmful ones restate one
  question's answer in its own vocabulary, or state a schema fact whose scope is one join path.

**Read 6 (2026-10-23, three controls).** Two dispatches, eight of eight gates each, zero unanswered
prompts. With scope widening off (`39981368310`): 53.14% → 51.14%, **−2.00pp**, CI [−5.43, +1.14],
p = 0.31. With the dosage and specificity controls (`39981378703`): full −3.71pp (p = 0.029), and

| Arm | Δ vs none | p | What it rules out |
|---|---|---|---|
| duplicate (pack twice) | −4.00pp | 0.024 | dilution: doubling the text does not double the loss |
| wrong-scope (another database's pack) | −0.29pp | 1.000 | "any injected text distracts": foreign rules are ignored |

So the cost is neither a token budget nor a general distraction. It is that a **plausible,
same-database** claim is followed even when it is about a different question. Widening appears to carry
about half of it (harmful rules 53 → 40 when it is off), but that difference comes from two dispatches
whose baselines differ by 0.57pp and whose intervals overlap — so it is not a result, and the lane now
measures it as an arm (`full-narrow`: a second memory per fold, same corrections, no widening) instead
of as a second run.

**Read 7 (2026-10-23, widening as an arm).** The same corrections, distilled twice inside one run
(`full` widened, `full-narrow` not), scored against the same `none` arm on the same questions
(`40039587765`): full **−4.00pp** (CI [−7.14, −0.86], p = 0.016) against full-narrow **−3.14pp**
([−6.29, 0.00], p = 0.080). **Widening is worth 0.86pp of the 4.00 — a fifth, not the half that the
cross-run comparison suggested.** The cross-run estimate was not merely imprecise; it was off by a factor
of two in the direction that flattered the hypothesis. The narrow pack is still negative, so the remaining
cost lives at recall: a claim learned in a database is applied to other questions in the same database.

**Correction (2026-10-24, iteration 63).** 0.86pp was still a difference of two deltas, and the paired
comparison — the two arms scored against each other on the same questions — gives **+0.86pp [−2.00, +3.71],
p = 0.71**. The number is the same; the claim is not. Widening is indistinguishable from zero at this
sample, and no magnitude should have been reported from that arithmetic.

**Consequence for S2b, and the reason it is not a fourth failure of S2.** The stop rule ("two failures end
the SOTA path") still stands: BIRD's gold carries no convention, so it cannot host a SOTA claim. Read 5 is
not an attempt at that claim — it is the **cost measurement** the S2b protocol needs, and it changes the
protocol in one specific way: the convention S2b teaches must be **explicitly scoped at birth** (a workspace
convention that says where it applies), because the mechanism's failure mode is applying a true statement
beyond the query that taught it. Scope widening during distillation is the first ablation in flight for
that reason, and the dosage/specificity controls (`duplicate`, `wrong-scope`) are the second.

**Exit gate (revised 2026-10-20).** The original gate — BIRD-Interact ≥ +5pp at n=600 — was written
before the mechanism had been measured on public data, and the four reads above show it tests the wrong
thing: BIRD's gold contains no knowledge the model cannot infer, so the pack is inert there by
construction. The gate is replaced by a protocol in which the knowledge is load-bearing by design.

## S2b — convention transfer on a public benchmark (closed: the ceiling is the format)

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

**Read 8 (2026-10-24, S2b's first complete measurement).** Subset 145 questions, five folds, 1,301
calls, ten of ten gates — including V9 (145 ≥ 100, a verdict not a direction) and V10 (145/145 rewritten
gold queries produce the expected value, so the scorer is correct).

| Arm | Accuracy | Δ vs none | 95% CI | p |
|---|---|---|---|---|
| none | 0.69% | — | — | — |
| full | 3.45% | +2.76pp | [0.69, 5.52] | 0.125 |
| stated | 5.52% | +4.83pp | — | 0.016 |
| oracle (value form) | 48.97% | +48.28pp | — | <1e-4 |

**The gate fails**: +2.76pp against a preregistered ≥10pp at p<0.05. The falsification clause applies to
the protocol as written. The reading that survives is diagnostic rather than a reprieve:

- The 0.69% baseline is the property the protocol wanted — a model that does not know the convention
  returns the raw figure and is wrong by a factor of a thousand.
- `stated` reaches **5.52%**: one clear sentence in the prompt is followed by one question in twenty. The
  knowledge arrives; the output form does not.
- `oracle` in its value form reaches **48.97%**, half of it lost to replies that are queries rather than
  literals. That is a prompt-form defect, and it is now fixed: the oracle injects the *rewritten gold
  query*, and V11 makes the protocol's own 90% ceiling blocking so a channel that responds but cannot be
  used refuses the result.

**Consequence for the mechanism, not the benchmark.** A convention that is only described is transmitted
at about a fifth of the rate the model can use. Every correction the store already holds is a *pair* of
outputs; the distilled pack renders it as prose. The next mechanism experiment renders the pair.

**Read 9 (2026-10-24, the ceiling, and the closure).** The strongest hint the lane can give — the rewritten
gold query copied verbatim — was injected (`40052467297`) and V11 refused the run at **56.55%** against the
protocol's 90% ceiling. `full` was +2.07pp (p = 0.25) and `stated` +3.45pp in the same run. Together with
Read 8, the two oracle forms bracket the ceiling:

| Oracle form | Accuracy |
|---|---|
| the accepted value, as a literal | 48.97% |
| the rewritten query, verbatim | 56.55% |
| (protocol requires) | 90% |

**S2b is closed, and the falsification clause applies.** A convention with a *form* — units, rounding,
precision, ordering — is not transmitted by describing it, and not reliably by demonstrating it either. The
model reads the pack as reference material rather than as an answer key, which is what a text-injection
channel does when the task's own instruction outranks one line of context.

**What this changes, and what it does not.** It does not reopen S3: the stop rule stands, and BIRD Mini-Dev
remains a place to measure the mechanism's *cost*, not a place where its knowledge is load-bearing. It does
narrow the product claim, and the narrowing is now in the user guide: the pack steers what the model
produces; it does not certify form; a requirement on units or precision has to be enforced after generation
or encoded in the schema.

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

**Audit pass 2 (same day).** Three claims from pass 1 did not survive: no end-to-end metric, an
alternatives table that mixed rejected with open, and three open questions with no POC. Twelve gaps are
closed with a metric and a gate each, and 29 decisions are now registered as decided / deferred / rejected —
every deferral naming the default that ships before its ablation runs.

The two sources that changed the design: **MemForm** (rule-forming memories are poisoned through content,
evidence, scope, selection and path; the best of five defences gained only 8.2 points) and **ALTK-Evolve**
(τ²-retail pass^4 57.5% → 67.5% from prompt-appended learned rules; ≥3 distinct tasks beats a larger set).

**Audit pass 3 (same day).** The question changed from "is §17 complete" to "do the documents agree" —
and they did not. `AUDIT.md` still carried the withdrawn +3.33pp as verified, and §18 still asserted the
original S2 gate that the four null reads had already closed. Both are now fixed, S2 is recorded as closed
on BIRD with S2b as its replacement lane, and the old BIRD-Interact gate has moved to lane L4 where it
belongs. The remaining requirement-level omissions (package mapping, footprint budgets, an executable lane
plan, a source register, twelve disambiguated values, a POC conclusion index) are §17.25–§17.30.

**Audit pass 4 (same day).** Requirement 6 was not met and the register said so: only two systems had been
read at source. Reading A-MEM, HippoRAG 2 and LangMem overturned two design rationales — A-MEM never scores
its own keywords, so the alias loses its citation and keeps its decision; HippoRAG filters with an LLM per
query, so 1-hop expansion moves from *deferred* to *rejected for a CPU-only default*. The same read
corroborated two choices (prune off; debounced curation) and produced one new deferred option (batched
distillation). Statistical discipline (§17.31), a dataset manifest (§17.32) and a versioning contract
(§17.33) closed the last three requirement-level omissions.

**Audit pass 5 (same day).** The nine "evidence-open" questions were re-examined on the principle that a
deferral is only honest if something blocks it. Three closed without code: support counting is refuted by
arithmetic (2.95× inflation at six endorsements, and one task's six attempts reach the 0.6 activation
threshold — a live defect), task-type scoping is an identity with one task type, and the lexical alias lost
its premise when the 47%-zero-coverage figure turned out to be a **40-question probe published at full
scale** (the real rate is 3.1%, median coverage 18.2%). The "retrieval is the constraint" claim is therefore
withdrawn in favour of the redundancy explanation the oracle arm already supported. One question became a
conditional decision (validity intervals, trigger recorded). Five remain open, each naming the artefact it
is blocked on.

Implementation waits for an explicit signal. None of the remaining questions is a requirement ambiguity.

## Implementation (2026-10-22 — started)

Iteration 21 implements the two P0 items in evidence order: per-task evidence grouping (the defect §17.34.2
proved) and the task instance that makes correlated evidence visible to begin with. Both are covered by
tests that pin the property rather than the implementation, and the study is unchanged (31.79 → 100.00,
17/17 gates), which is the regression check that matters.

Iteration 22 lands the curator (D4/D5/D30) and the utility denominator (P7). The S1 annotation blocker is
removed rather than deferred: truth for a chart recommendation is a policy, not a vote, so L0 derives gold
from the policy and keeps a 100-case human audit as calibration only.

Iteration 23 lands the promotion gate (D15/D16): prose is stored and counted but cannot activate a rule
until a second distinct task, or a stronger tier, endorses it. Two of G3's four invariants remain for the
integrity lane: scope-widening bounds and replay under a shuffled log.

Iteration 24 lands the abstention kind (D18): learned from `abstain`, promoted like any prose lesson, and
rendered in its own block that speaks only when nothing confident can. A unit test would have passed while
the feature shipped dead — the end-to-end assertion is what caught the 0.4 trust floor.

Iteration 25 lands three of L8's four invariants and the instrument that measures them. The widening
bound became a computation (the meet of the endorsing scopes) rather than a list of field comparisons,
which exposed two shipped defects: curation double-counted an event two near-duplicates shared (B10),
and the widening predicate ignored `schemaDigest` and `reasonCode` (B11). POC-28 measures 1.00 order
invariance and 1.00 replay determinism on 1,000 events, with a mutation control that deliberately
disagrees — without it, a harness that compares nothing would report the same 1.00. Erasure and the
MemForm attack harness are the lane's remaining rungs; the artefact says "not claimed" rather than
inheriting a gate it did not earn.

Iteration 26 completes the lane's other half: erasure (D20). `forget()` is part of the port, the cascade
re-derives every claim that cited an erased event — including demoting one whose promotion rested on an
erased outcome — and a tombstone records the deletion without recording the data. POC-28b: 10 items and
10 task instances erased, 170 events removed, 4 claims removed, 86 re-scored, **0** retrievable or cited
afterwards.

Iteration 27 closes RG6's attack half. Five routes × 100 attempts at three trust ceilings: 0% at trust
≤ 0.6, 40% at 0.9 where the attacker is a trusted editor and the store cannot tell them from a user.
Writing the attacks found three holes (borrowed evidence, payload-blind merging, widening from unadmitted
siblings), all closed and tested. The quarantine floor turned out not to be the defence against low-trust
content — fusion is — which corrects an assumption the design carried.

Iteration 28 runs L0 — 1,300 cases, policy-derived gold, 1,040 evaluated — at +67.88pp (95% CI
65.10–70.67, p = 5.9e-213, 706 gained / 0 lost). Its preregistered 3pp resolution is **withdrawn**: at the
observed discordance it would need 5,922 evaluated cases, and the replacement gate (effect > the design's
own noise floor) passes at 9.5×. S1's annotation blocker is now fully removed — nothing in the plan waits
on a human label.

Iteration 30 closes a blind spot in the diagnostics rather than opening lane L2b: `doctor()` could not see
a store where every lesson is stuck behind the promotion gate.

Iteration 29 closed two holes in the shipped surface rather than opening lane L2b: the HTTP server had no
delete route (B15), and its ingest silently dropped the task instance (B16), which inflated support on
every server-hosted deployment and made `forget({ taskId })` match nothing. Both are fixed, and the
browser client's `forget()` is deliberately unqueued.

Iteration 31 lands the instrument L2b is gated on (`recoveryRatio`, tested on all three degenerate
cases) and records that L0 recovers 1.00 of a ceiling that is reachable by construction — the measurement
that makes "a corpus with headroom" a requirement rather than a preference.

Iteration 32 lands L4's metric layer and its workflow job, gated behind `vars.TAU_ENV_READY` and a
`TAU_DRIVER` module; with neither, the lane writes `not-run` rather than a zero. Remaining for L4 is the
driver: the tool-calling environment and the two arms on a shared split.

Iteration 42 runs L2b — the pair contrast — and reports a **null it can explain**. Each `(domain, intent)`
key now carries a teaching question and a holdout question that read different columns, so 75% of the
holdout is reachable and the held-out domain's `comparison` convention is the only wall. Both arms land at
87.50% against a 12.50% baseline: delta **0.00pp**, `pairHelps: false`. The artefact marks the verdict
**vacuous** and proves why: `correctedWithCitation` is 0 of 5 on both arms, because a single teaching pass
distils once at the end, so every correction was answered from an empty pack and the two protocols saw
identical evidence. The pair arm's only addition is a `negative` lesson, and the deterministic reader has
no channel for one. Four blocking gates pass; a fifth, non-blocking, reports the unexercised lever rather
than letting a zero read as an effect size.

Iteration 43 closes L2b as a *mechanism* question, negatively and with evidence. Teaching now runs two
rounds with a distillation between them, and the second round re-asks the scopes whose convention the
corpus revised — so both arms correct 2 of 2 revisions from a rule that is now wrong. The lever fires
(2 of 7 corrected attempts cite a rule) and the answer is still 0.00pp, with **0 rules differing** between
the two stores. The mechanism ablation explains it: a correction landing on a scope where an active rule
disagrees already records a contradiction, which demotes the old rule; a correction that cites *nothing*
does the same, so the failure record is not what blames. The gate that watches the lever is now blocking,
and the lane found a scorer bug of its own on the way (a revised holdout judged by the pre-revision
answer).

Iteration 44 lands L4's reader. The four rules it enforces are read off upstream rather than chosen:
`reward == 1.0` exactly, `null` only for infrastructure errors and never counted, partial grids refused,
duplicate trials an error. Both storage forms are accepted, ten refusals are named, and the lane now
distinguishes `not-run` (no environment) from `refused` (measured, unscorable) with different exit codes.
Two synthetic fixtures exercise both paths in CI, so the reader is gated on every push even though the
agent invocation is not.

Iteration 45 measures the size promise. One esbuild run per entry point produces two facts: the library
still bundles for the browser with no Node builtins (or the build fails), and the artefact stays under a
ceiling — 3,009 B raw / 1,410 B gzipped for the client, 40,133 / 13,842 for the core. Ceilings are
regression ceilings, not targets, and `--probe` halves one and requires the gate to reject it, on every
push. The plan expected `audit.mjs`'s dependency allowlist to grow for esbuild; it did not, because the
allowlist governs *runtime* dependencies and esbuild is a root devDependency — recorded rather than
silently expanded.

Iteration 46 lands the push half of §17.21 and measures it. The signer is HMAC-SHA256 in the library's own
bytes (RFC 4231 vectors plus every padding boundary against `node:crypto`), the dispatcher retries without
overtaking, and the lane runs a real HTTP receiver that loses one acknowledgement on purpose. 50 corrections,
50 events, 0 missed, 0 ordering violations, one intentional duplicate de-duplicated by id, p95 2.6 ms on
loopback. **The lane found a defect in `distill`**: a second pass over the same log rewrote every rule's
`updatedAt` even with no new evidence, so "nothing changed" and "this rule was rewritten" looked identical —
275 events for 50 changes. A merge with no new evidence is now a no-op, pinned by three tests.

The same sweep found §10.3 had been overstating coverage since the providers landed (it claimed 7 free
arms at 99.53%; the measured state is 59 arms at 97.93%). The section now states the measurement and splits
the arms into invariant guards and reachable gaps, the latter tracked as **G-7**.

Iteration 47 closes W1b without an upload. The vendor's archive was measured (800,943,648 B, sha256
`cc48ba16…b92f`, CC BY-SA 4.0, 122 files: 11 databases plus the questions), pinned in
`eval/manifests/bird-minidev.json`, and fetched by the lane with the digest verified before extraction.
The lane's `_template.sqlite` fallback is gone — `BIRD_ARCHIVE_URL` had been documented and never read, and
an unchecked schema-only database would have scored every runnable query as correct, because
`matches([], [])` is true. The artefact proves the earlier numbers were not affected (`gold_exec_rate: 1`,
`exec_rate: 0.986`, accuracy 6.83% — an empty database would have read ≈98.6%), and the new row count now
makes that provable rather than lucky.

Iteration 48 ships §17.21's other half: `POST /v1/mcp` with `microglia_recall` and `microglia_feedback`,
JSON-RPC over the same facade, two tools and no more. Writing the caller found two defects the library had
been carrying: a facade could record feedback against a run from **another namespace** (the event landed
here, cited a foreign run, and the next distillation would have read it through this tenant's interpreter),
and `edit(after, { note })` accepted a note that `FeedbackSignal` had no field for, so it was silently
dropped. Both fixed at the root with tests. `microglia_feedback` takes `runId` rather than the `taskId` this
document first sketched, because a task has attempts and feedback judges one.

Iteration 49 closes **G-7**: the 39 reachable branch arms are taken, branch coverage moves **97.92% →
99.54%** over 751 tests, and the campaign found seven defects that all shared one shape — a request or a
reply the library accepted and then answered successfully while doing something else. A typo in `?status=`
listed an empty store; `?limit=abc` did the same through `NaN`; `{"generalize": "false"}` applied the wider
default; `forget { actorHash }` could never match because ingest never recorded one; a misspelt `run.taskID`
was dropped so the grouping vanished; a Zhipu entry with no vector returned an empty vector for the index;
and the model-response extractor threw away any reply whose prose contained a bracket. Two silent-zero paths
went with them (an array of non-objects read as "no candidates", a missing mark defaulted to the *gold*
answer). §10.3 now enumerates the 14 remaining arms with a reason each.

Iteration 51 tried to run S2 twice and learned three things, none of them about the mechanism.

**The dispatch itself was broken in three places.** A run sat in its benchmark step for ten hours and
finished with the artefact from two days earlier: the step had no timeout of its own (five folds at ~700
calls each is two to four hours), the publish/attribute/upload steps run with `if: always()` and therefore
uploaded the *committed* artefact as if this run had produced it, and the evaluation printed nothing until
the end of each fold, so a silent step was indistinguishable from a hung one. The artefact is now deleted
before the run, its absence is an error in both steps, the step carries `timeout-minutes: 110`, and the
fold loop prints fold/eval/calls counters every five questions.

**S2 cannot produce a number right now, for a reason outside the code.** The second dispatch reached the
first model call and stopped with `DeepSeek returned 402`: the account behind `DEEPSEEK_API_KEY` has no
balance. That is now a named configuration failure with the fix in the message, not a generic store error —
and it is the reason there is no new S2 result in this iteration. Dispatch again after a top-up; nothing
else is in the way.

**W3's trigger was asserted, so it was measured.** The index was deferred on "more than 50k rules", a
number nobody had tested, and the lane stopped at 10k. It now runs to **100k**: p95 **22.73 ms**, heap
**173.9 MB**, build 750 ms, growth 8.5x against 10x the items. Both budgets (100 ms, 256 MB) hold, so the
index stays deferred — and the lane now *fails the build* when either is crossed, which is what makes a
deferral a decision rather than an omission.

Iteration 52 is the first S2 result since the data path was pinned, and it is a null with a diagnosis.
**46.67% without memory, 41.67% with it** over 60 questions (−5.00pp, CI [−15, +5], McNemar p=0.51), with a
minimum detectable difference of **14.01pp** at that n — so the run cannot resolve an effect of the size it
is looking for, and says so (gate V5 fails, advisory). The useful part is the attribution: of 74 rules that
were ever injected, **11 hurt and 5 helped**, and the harmful ones are uniformly *true statements about the
question they were learned from* applied to other questions. The cost is retrieval precision and scope
specificity, not distillation accuracy.

**Where that sends the next experiment.** Not "more samples" — an ablation of the retrieval side, with the
attribution as the readout: `SOTA_GENERALIZE=false` (no scope widening) first, because it is already an
input to the lane; then a stricter corroboration band if widening is not the cause. A full-split run is in
flight to give the ablation its baseline.

The **S2 re-run** is done and is Read 5 above: the lane now issues its calls through a bounded pool, caches
the learning pass, and refuses a result produced through an outage, so a full split takes 35 minutes instead
of timing out at 160. Two ablations are in flight from that artefact (`SOTA_GENERALIZE=false`, and the
dosage/specificity controls), and their readout decides the next change to the mechanism rather than to the
lane.

Next by the plan, in order:

1. ~~**The two S2 ablations**~~ — done, and both are negative: scope widening is worth 0.86pp of the
   4.00pp cost (Read 7), dosage is null and foreign rules are ignored (Read 6).
2. ~~**Change the shape of a rule, not the index.**~~ — **built and measured in iteration 63, and null.**
   Every rule now carries a `when` condition (1,296 of 1,296 active items), rendered before the claim with
   a note telling the reader to apply it only where it holds. The condition changed **48% of the SQL** and
   **20 of 350 verdicts** — ten gained, ten lost — for a paired **0.00pp [−2.57, +2.57], p = 1.000**. And
   with the new distillation prompt none of the 49 credited rules restates its question any more, so the
   harm survives *correct, general, conditioned* rules: 33 harmful against 16 helpful.
3. ~~**Ask the condition whether it separates.**~~ — **measured in iteration 64, and it does not.**
   The condition was scored over 148 (question, rule) pairs: hurt
   0.313 against helped 0.278, **gap −0.035, p = 0.062** — backwards, like the statement (0.254 vs 0.226,
   p = 0.120). Lexically the condition overlaps the question at **zero** median. A similarity filter over
   the condition would preferentially keep the rules that hurt, so the retrieval door is closed as well.
4. ~~**Filter the pack on corroboration, not on similarity.**~~ — **done in iteration 65, and it is the
   dividing line.** On BIRD, **0 of 1,296 rules** have two independent corrections, so a floor of two
   injects nothing — and that empty pack became the lane's noise floor: 190/350 against no-memory's
   189/350, **0 lost, 1 gained, 0.29pp**. On the chart study the same floor keeps **96.43% of 100.00%**.
   The lift and the harm are the same property: where mistakes recur, corroboration is what makes a rule
   true enough to inject (+68.21pp); where every correction is unique, nothing is corroborated and the pack
   is noise (−2 to −4pp, against a 0.29pp floor). `minEvidence` is now a pack-layer option and the guide
   states both numbers; the default stays 1 because that trade belongs to the host.
5. ~~**Ask for a decision instead of relying on one.**~~ — **measured in iteration 66, null.** Requiring
   `<id>: apply | skip` per item before the query changed 23 of 350 verdicts (11 lost, 12 gained) for a
   paired **+0.29pp [−2.29, +2.86], p = 1.000**. Six levers are now measured out, three of them backwards.
6. ~~**State the mechanism's precondition in the product, and enforce it.**~~ — **shipped in iteration 68.**
   `corroborationFloor` on the host: below the floor, `recall` requires two observations for that request
   and reports `suppressed: 'uncorroborated-store'`, and `/v1/recall` carries the reason. Default off,
   because the measurements behind it were taken on this repository's workloads. The original reasoning
   stands: the three workloads disagree in
   exactly one property: whether a correction recurs. Chart study (six defect families, repeated):
   **+68.21pp**. BIRD (350 questions, 1,296 rules, none corroborated): **−2 to −4pp**. τ²-retail is
   excluded from this table by iteration 67 — its paired comparison is +1.47pp [−13.24, +16.18], which is
   no evidence either way. The property is measurable
   on the store before any inference — the share of active rules with more than one observation — so the
   next change is a *detector*, not another prompt: report that share, and let the pack refuse to inject
   when it is near zero. That is the difference between a mechanism that is sometimes harmful and one that
   knows when it cannot help.
7. **L4's agent invocation** — **ran in iterations 58–67, and the lane cannot answer the question it
   asks.** The driver exists (`eval/drivers/tau2/` for the agent and the phase runner,
   `packages/eval/src/bin/tau2-driver.ts` for the orchestration, every decidable step in the tested
   `tau2.ts`), the two arms now run in one job, and the pairing step compares them per task. What it
   found is that the comparison has no resolution:

   | | Value |
   |---|---|
   | reference (no store) | pass^4 **0.5147** (35/68) |
   | memory | pass^4 **0.5294** (36/68) |
   | **paired, memory − reference** | **+1.47pp [−13.24, +16.18], p = 1.000**, 13 lost / 14 gained |
   | 95% half-width at n=68 | **±15pp** |
   | tasks needed for a 5pp half-width | **611** (τ²-retail holds 114) |

   **This reverses iterations 60–61**, which reported −4.56pp and −5.89pp as differences of two means from
   single runs. The reference arm alone scored 0.6471, 0.6324 and 0.5147 across three runs — a 13.2pp
   range for a run that changed nothing — so the earlier "the harness beats the published number by 7.21pp"
   was one draw from that distribution. `l4-resolution` now reports the half-width beside every delta.
   **Decision (iteration 68): L4 publishes a smoke result, not a SOTA claim, until a corpus with ≥611
   paired tasks exists.** The number it produces is real — 68 tasks, every one scored, two arms on one
   split — and it cannot support a statement about a 5pp effect. Pooling the three τ² domains reaches
   about 200 tasks, a third of the requirement, so the lane stays as the integration proof it already is:
   driver, facade, split, scoring, pairing, resolution.

8. **S2b, the convention lane** — **closed in iterations 55–57**: the ceiling is the format (two oracle
   forms, 48.97% and 56.55%, against a required 90%), and the falsification clause applied.
9. **The SQLite index (W3)** stays deferred, and that is a measurement rather than a preference: 100k items
   give **22.73 ms** p95 and **173.9 MB** of heap against budgets of 100 ms and 256 MB, and the lane fails
   the build when either is crossed. The heap is the axis to watch: 174 MB at 100k is what a host runs out of
   long before it notices 22 ms.

L2b's remaining question is about the *reader* — a `negative`-lesson channel — not about the corpus or the
protocol.

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
| W3 | SQLite index at 100k items | **measured**: p95 > 100 ms or heap > 256 MB at 100k | Measured to 100k in iteration 51: **22.73 ms** p95 and **173.9 MB** heap, growth 8.5x against 10x the items. Both budgets hold, so the index stays deferred — and `pnpm eval:scale` now fails the build when either is crossed, so the deferral cannot quietly expire |
| W1b | ~~**BIRD data hosting**~~ **closed by pinning** (iteration 47) | — | No upload was needed. The vendor's own archive (`minidev.zip`, 800,943,648 B, sha256 `cc48ba16…b92f`, CC BY-SA 4.0) carries the eleven databases *and* the questions; `eval/manifests/bird-minidev.json` pins it, the lane verifies the digest before extracting, and `BIRD_ARCHIVE_URL` is set. The lane's `_template.sqlite` fallback was removed: it never checked what it downloaded, and an empty database would have scored every runnable query as correct. |
| W4 | LLM-judge calibration | S2 begins | **Revised**: generic soundness from public data (MT-Bench 84.6% vs 81.0% expert-expert, 15.8% order flip), task-internal gold where computable, and κ on 50–100 labels only for what neither covers |
| W5 | Per-user preference scope | S1 shows cross-user variance | Requires a cold-start policy, which is a product decision |
| W6 | Multi-process writer | a host runs > 1 writer | Today: one writer per directory, documented |
| W7 | On-device embedding adapter | a host needs offline retrieval | Must pass the CPU/WebGPU constraint; no CUDA, ever |

## Sequencing rationale

S1 before S2 because S1 is cheap, private, and diagnostic: a failure there means the integration is
wrong, while a failure at S2 could mean the integration, the benchmark, or the hypothesis. Running the
expensive experiment first would leave three explanations for one number.

S3 last because a SOTA claim is a claim about the field, and it should be made only after the mechanism
has survived a product and two public datasets.
