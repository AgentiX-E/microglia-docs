# Roadmap

The plan, in stages, with the gate that ends each one. A stage that misses its gate stops; it does not
roll forward into the next with a caveat. This document is the contract between the design and the
work, and it is updated only when a stage closes or a gate changes for a stated reason.

Status as of **2026-10-31**.

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

**What the private annotation set is, and why it was assumed to be private.** The 1,300 cases are
pairs of *what a user asked* and *what they wanted*, written by two annotators on our own chart
product, with κ ≥ 0.7 measured and disagreements resolved by a third. That is what the stage tests:
not whether a chart is correct, but whether the system can tell that "revenue by quarter" meant
fiscal quarters. A public benchmark cannot carry our product's vocabulary, so the set was scoped as
private — and that scoping was correct for S1b and unnecessary for the part of S1 that is about
ambiguity in general.

**The public substitutes, checked rather than assumed.** Ambiguity now has annotated public data:

| Source | What it annotates | Size |
|---|---|---|
| **BIRD-Interact** (ICLR 2026 oral, arXiv 2510.05318) | per task: `amb_user_query` (the ambiguous phrasing), `user_query_ambiguity` (the annotated readings), `knowledge_ambiguity`, `sol_sql`, `test_cases`, plus a follow-up subtask | 600 tasks / 22 PostgreSQL databases (300 lite); GPT-5 completes 8.67% in c-Interact, 17.00% in a-Interact |
| **AmbiQT** and the ambiguity-detection line | question pairs that differ only in an ambiguity, one SQL each | public, small |
| **BIRD train** | 12,751 question–SQL–evidence triples, the annotation the benchmark itself learned from | 9.4 GB archive |

So S1 splits. **S1a** measures ambiguity handling on BIRD-Interact's annotated ambiguity labels —
public, reproducible, no annotators. **S1b** keeps the private set for the one thing only it can
measure: whether our chart product's own vocabulary is being learned. A stage that can be tested
publicly should not wait behind a stage that cannot, and the previous roadmap made it wait.

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
| W4 | ~~**LLM-judge calibration**~~ **closed without buying labels** (iteration 69) | — | The 200-label item assumed the reference had to be created. It exists: ROSE-VEC publishes 322 expert-adjudicated BIRD predictions **and** the five annotators' raw files, digest-pinned by `pnpm eval:judge`. Measured on them: the committee agrees with itself at κ **0.7085** (0.5115–0.8522 across pairs), so "κ ≥ 0.7" means *level with humans*, not better. Execution accuracy against the same committee reaches κ **0.4717** (ROSE set semantics) or **0.2995** (this repository's multiset semantics) — so the criterion, not the label supply, was the open problem. Iteration 70 built both responses behind switches: `SOTA_SEMANTICS` picks the result comparison (both readings computed from one execution, so a delta can be re-read without a second dispatch), and `JUDGE_MODE=llm` runs a judge that is shown the question, the knowledge, the returned columns and five rows — never the gold. Both were then measured (iteration 71). `set` and `multiset` produce **identical** paired results on the BIRD run (350 items, 7 scored differently, none discordant), so the criterion is excluded as the cause of the −3.43pp. The judge reaches κ **0.4762** against EX-set's 0.4717 with overlapping intervals: false negatives fall 87 → 11 and false positives rise 3 → 50. ROSE's Refuter closed most of that gap (iteration 73): cascade κ **0.5974**, and the evidenced reading — which lets execution veto a `GOLD_ERROR` claim only when the two queries return different rows — reaches **0.6676** [0.5803, 0.7515] over three dispatches at 1.0pp spread, 4.1pp from the committee's own 0.7085. Execution is a necessary condition for equivalence, never a sufficient one, so it is used as a veto rather than as a judge |
| W5 | Per-user preference scope | S1 shows cross-user variance | Requires a cold-start policy, which is a product decision |
| W6 | Multi-process writer | a host runs > 1 writer | Today: one writer per directory, documented |
| W7 | On-device embedding adapter | a host needs offline retrieval | Must pass the CPU/WebGPU constraint; no CUDA, ever |
| W8 | **The pack's cost scales with how many rules are injected, and nothing about which ones matters** | closed for the mechanism; the curve is the open item | Iteration 80 separated content from volume with a size-matched control. `full-grounded` (only rules that name a table or a distinctive column) and `full-sampled` (the same number chosen at random) are indistinguishable from each other — +0.57 vs +0.86pp against `full`, p = 1.0 — while both beat `full` by carrying 0.6 fewer rules. Across the four arm sizes accuracy falls about **1.7pp per rule injected**. So the defect is not the content (77% of rules are prose, but pruning them by checkability buys nothing over pruning at random) and not the selection: it is the quantity of guidance in front of the question. Also fixed this iteration: a grounding filter that admitted ordinary-word columns (`date`, `name`, `rank`) and so passed 79.7% of the pack instead of 66%. Next: the dose curve measured properly — three pack sizes, one store, enough power to find where it crosses zero |

## Sequencing rationale

S1 before S2 because S1 is cheap, private, and diagnostic: a failure there means the integration is
wrong, while a failure at S2 could mean the integration, the benchmark, or the hypothesis. Running the
expensive experiment first would leave three explanations for one number.

S3 last because a SOTA claim is a claim about the field, and it should be made only after the mechanism
has survived a product and two public datasets.

## R1 — Competitor replication programme (opened 2026-10-27)

The question this section answers: why is our memory a record of "what happened in this
database" rather than the transferable kind the literature reports gains for, and why is
borrowing their implementations not in the plan?

**The first half is answered by the record.** Our memory is factual because of three decisions
taken when the pipeline was built and never revisited:

| Decision | Where | Consequence |
|---|---|---|
| distill from a single `(question, attempt, correction)` event | `distill-prompt/3` | the only content available is the case; a rule can only generalise across cases that the *same* sentence recurs in |
| identify a claim by its payload, not its sentence, when widening | `generalize.ts` | until iteration 87 no two prose claims could ever be recognised as the same claim, so nothing widened, so nothing became domain-free |
| retrieve by question text | `recall` | a note about a *failure* is retrieved by a *question*, and the question does not say what failed |

The measurement that makes this concrete: 77–82% of packs name an entity the answer uses, and
those packs cost 2.6pp; the packs that name nothing are ignored (0.0pp); a three-sentence repair
note costs 5.7pp. The model is not lacking information about the database. It is being handed a
case and reproducing it.

**The second half was a gap in this document, and it is now the plan.** Five replications, each
as an arm under the same protocol, each with a stated acceptance criterion. An arm that cannot
beat the noise floor of its own run (`none-replica`, currently 3–5 discordant questions) is
recorded as a null and not pursued.

| # | Source | What is replicated | Arm | Acceptance |
|---|---|---|---|---|
| R1.1 | ExpeL (AAAI'24) | insights extracted by *comparing* a failed and a successful attempt, managed by ADD/EDIT/UPVOTE/DOWNVOTE | `full-procedural` | the form exists, is enforced (no case nouns may be stored), and beats `full` on the same store |
| R1.2 | ReasoningBank (ICLR'25) | three-field memory (title/description/content) and retrieval by embedding of the *task* | `rb-format` | same content, restructured: delta against `full` outside the noise floor |
| R1.3 | Reflexion (NeurIPS'23) | reflection stored per task, injected only on the next attempt of that task | `retry-task` | retrieval keyed by task, not by question text; measured on the retried subset |
| R1.4 | Dynamic Cheatsheet (2024) | a single running note that is updated, not a set of retrieved items | `cheatsheet` | one note per fold, updated after each failure; delta against `retry-blank` |
| R1.5 | ACE (2025) | Generator / Reflector / Curator, with brevity-bias and context-collapse guards | `ace-curate` | the curator's merge must not shrink the store below the fold's note count |

**Where "surpass" is defined.** Not on absolute accuracy: the leaderboard is a different game —
AskData 77.14, CHASE-SQL 76.02, XiYan-SQL 75.63 on BIRD dev, all with schema linking, multiple
candidates and a selection model, against our single call to a mid-size model at 53–54% on the
350-question Mini-Dev subset. The claim this project can make and defend is causal: which memory
component contributes what, measured with a noise floor in every run. Surpassing means two
things, in order:

1. **A memory that is non-negative.** Today the only non-negative channel is the retry, and its
   gain belongs to the retry. R1.1–R1.5 are the five candidate forms; the first that clears the
   noise floor becomes the default.
2. **A pipeline that can enter the leaderboard comparison.** Schema linking, N candidate
   queries, and a selector — the three components every system above 70% has and we do not. That
   is a separate work item (R2) and it is what makes an absolute number comparable at all.

**Order.** R1.1 is implemented and dispatched. R1.2–R1.5 are one iteration each, and any of them
may be dropped on a null. R2 starts only after one memory form clears the floor, because a
stronger generator without a memory that works measures a different thing.

## R2 — Test-time compute: candidates and selection (opened 2026-10-28)

R1 asked what to remember. R2 asks a different question, and it is the one the leaderboard actually
answers: how many answers do you generate, and how do you choose. Every system above 70% EX on BIRD
does both, and this pipeline does neither — one draw, at temperature 0, judged by nobody.

**The published numbers that define the gap.**

| System | What it adds | BIRD dev EX |
|---|---|---|
| zero-shot, single call | — | 54.9 (MCS-SQL, GPT-4) |
| + schema linking | prune tables/columns before prompting | 55.2 (**+2.1**) |
| + value samples | show cell values, not only column names | 60.0 (**+4.8**) |
| + MCS (1 prompt, 20 draws) | majority vote over execution results | 62.1 (+2.1) |
| + MCS (5 prompts, 20 draws) | same, over five prompt phrasings | 63.4 (+1.3) |

| CHASE-SQL (BIRD dev) | EX |
|---|---|
| single query | 63.01 |
| self-consistency over draws | 68.84 (**+5.84**) |
| upper bound, best of the candidate pool | 82.79 (**+19.78**) |
| their selection agent instead of voting | 73.01 (≈ +4.2 over self-consistency) |

Two facts follow, and they order the work:

1. **Most of the gain is in generating several candidates at all** (+5.8), not in the clever
   selector (+4.2 on top). Selection is worth building only after the pool exists.
2. **The pool is far better than the choice** — 13.9 points sit between voting and the ceiling. That
   gap is the definition of a selection problem, and it is the number to shrink.

**What this project has already measured, and how it constrains R2.** `none-replica` — the same
prompt asked twice — disagrees with itself on 3–6 of 350 questions. That is the sampling spread at
temperature 0, and it is the same size as every memory effect reported in iterations 81–90. So in
this pipeline the first thing to establish is not whether a selector helps but whether *draws differ
enough to select among*, which requires a non-zero temperature and a per-question distribution.

**The arms, and what each one buys.**

| Arm | Selector | Reads | What it isolates |
|---|---|---|---|
| `sample-5-first` | first draw | nothing | the price of temperature 0.7 alone |
| `sample-5-random` | uniform random | a seed | what alternatives are worth before judgement |
| `sample-5` | largest agreeing group | execution results | what the selector is worth |
| `sample-3` | same, on a prefix | execution results | whether more draws help, or only more agreement |
| `sample-5-oracle` | the right one | **the answer key** | the ceiling; not deployable |

The three differences are the experiment: `first − none` is temperature, `random − first` is
alternatives, `majority − random` is selection. Reporting only `sample-5 − none` would attribute all
three to "sampling", which is how the memory literature's own ablations get read.

**Acceptance.** In order, because each is a precondition for the next:

1. **Draws must differ.** Mean distinct execution signatures per question ≥ 2 at temperature 0.7. If
   it is near 1, the endpoint is too deterministic and every arm above measures nothing — which is
   exactly what happened to `chars-proc-600` in iteration 89, where the arm silently degenerated to
   no-memory.
2. **The ceiling must be above the baseline.** Best-of-5 must exceed `none` by more than the run's
   own noise floor. If it does not, the bottleneck is generation and R2 stops here.
3. **The selector must beat random** by more than the floor. If it does not, execution agreement is
   not a usable signal on this benchmark and the next candidate is a model-based selector (MCS-SQL's
   multiple-choice prompt, or CHASE-SQL's pairwise tournament) — a separate iteration with its own
   controls.

**What comes after, in the order the published gains imply.** Schema linking (+2.1 measured by
MCS-SQL with the same model family) and value samples (+4.8) both act on the *generator*, and both are
upstream of selection: a better pool makes any selector better. They are R3 and R4, and they are
cheaper than a selection model — no extra calls, one narrow prompt change each.

**The honest position on "beating" a competitor.** Our 350-question Mini-Dev subset, one model, one
call, 53% is not comparable with a leaderboard number that uses a bigger model, schema linking, 20
draws and a fine-tuned selector. "Surpass" therefore means, in order: a memory or selection component
that clears this run's own noise floor; then a pipeline whose components are all present, measured
one at a time; then a number produced by the same protocol as the competitors'. The third is the only
one that can be compared, and it is only meaningful once the first two hold.

### R2 status, after two dispatch windows (2026-10-28)

| Acceptance | Threshold | Measured | Verdict |
|---|---|---|---|
| 1. Draws differ | mean distinct signatures ≥ 2 | 254 of 350 questions had **one** distinct signature; mean 1.31 | **marginal** — 27% of questions carry alternatives |
| 2. Ceiling above baseline | best-of-3 > `none` by more than the floor | **+5.43pp [3.14, 8.00]**, 20 gained / 1 lost | **met** |
| 3. Selector beats random | `sample-3 − sample-3-random` > floor | +1.14pp nominal, interval includes zero; `sample-3` = `none` exactly | **failed** |

Agreement is measured and insufficient: it is right on every question where two of three draws
agree, wrong on nineteen of the twenty-two where only one does, which is the 1-in-3 a blind
tie-break gets. The mixed population is 44 questions — that is the entire headroom a selector can
win, and best-of-three takes 20 of it.

**What that reorders.** Acceptance 3 sends the work to a model-based selector rather than a better
vote, because voting is blind by construction when all candidates are distinct. The new arms are
`sample-3-model` / `sample-5-model`: the generator's own prompt plus the numbered candidates, one
`<choice>` tag back. The call is skipped where the draws agreed — three byte-identical queries are
one candidate — so `sampling.model.asked` is the number of questions on which the choice was real,
and `unparsed` is the number of replies that named none. The comparison is `sample-3-model −
sample-3` on identical draws: one selector against another, one call apart.

**Acceptance 1 is now the constraint, not a footnote.** Temperature 0.7 costs 1.71pp on the first
draw and buys alternatives on 27% of questions. A temperature that raises the distinct-signature
count without lowering `sample-3-first` is strictly better and is measurable in the same run, so R2.5
(temperature sweep) is a candidate for promotion ahead of R3/R4 if the model selector also fails.

**R3 was tried before its turn and did not pay.** The lexical linker was built and measured in the
same window (iteration 92): −7.43pp, with 292 of 350 prompts byte-identical to the baseline, so the
delta is unattributable as reported. The arm now carries `per_case.schemaTables`, and the split is
one run away. The published +2.1pp for schema linking comes from an LLM-driven linker that prunes
every question; a conservative lexical one that declines on 83% of them is not the same treatment
and its null result does not contradict the paper.

### R2 closed (2026-10-28)

| Acceptance | Threshold | Measured across three runs | Verdict |
|---|---|---|---|
| 1. Draws differ | mean distinct ≥ 2 | 1.31 — 76% of questions have one distinct signature | marginal, and it is the binding one |
| 2. Ceiling above baseline | best-of-3 > `none` by more than the floor | +5.43, +1.71, +3.43pp; mean **+3.52** | **met** |
| 3. Selector beats the control | > floor | exec +0.86pp on the population (13/10 on the 85 mixed questions), model 11/10, agreement 6/5 | **failed** on the population |

The three-run mean of the temperature's own cost is **−2.28pp** and the ceiling's is **+3.52pp**, so
a selector that always reached the ceiling would net +1.2pp at a 2.3pp resolution. The best arm
measured, `sample-3-exec` (the candidates shown with the rows they return), recovers 0.86pp of the
2.00pp the temperature cost and none of the 3.43pp the ceiling held.

**Closed with a decision:** do not sample at temperature 0.7 to select among draws, on this endpoint,
at three draws. The measured ordering exec > model = agreement > first is a fact about how much
evidence each selector sees, and it is the useful residue: if this axis is ever reopened — twenty
draws, a stronger selector, a cheaper temperature — `exec` is the arm to start from, not agreement.

**What R2 taught that outlives it.** Agreement is not blind; it is a majority vote, and a majority
vote is wrong exactly when the wrong answer is the popular one. On the questions where one of three
draws was right, agreement picked the right one **once in twenty-two across three runs**, while the
two wrong draws — being usually the same wrong answer — formed the majority. That is a mechanism, not
a noise floor, and it is the reason a vote cannot be improved by making the vote better.

**R4 moves up.** Value samples are the largest component MCS-SQL measures (+4.8pp) and the only one
that acts on the generator rather than on the choice. This pipeline's prompt carries the DDL and no
cell values, so every literal in every answer is a guess about a column's contents. R3 (schema
linking, tried early) is closed on its own evidence: −21.3pp on the questions it pruned.

### R4 closed (2026-10-28), and with it the published ordering

| Arm | Δ vs `none` | 95% CI | gained / lost |
|---|---|---|---|
| `values` (every column annotated with 3 distinct values) | **+0.29pp** | [−2.57, 3.14] | 12 / 11 |

796 of 798 columns annotated across the eleven databases, so the treatment was fully applied. The
arm is null, and the diagnostic that explains it is stronger than the arm: of 162 wrong answers,
**0 are identical to gold once string literals are masked**. In every failure the structure is also
wrong, so a perfect literal guesser would fix nothing. The channel value samples are usually
justified by has a zero ceiling on this corpus.

MCS-SQL's +4.8pp comes from a question-linked index that uses cell values to identify the column a
question is about, which can improve structure; that is a different treatment from uniform
annotation and it is not ruled out by this run. What is ruled out is the cheap version.

**The published ordering is now exhausted for this protocol.** Three components built and measured
one at a time, against the same 350 questions, five folds, seed 7, temperature 0:

| Component | Published gain | Measured | Verdict |
|---|---|---|---|
| selection over draws (R2) | +5.84 (CHASE-SQL) / +2.1 (MCS-SQL) | −1.14 to −2.57pp vs one draw | closed |
| schema linking (R3) | +2.1 (MCS-SQL) | −21.3pp on pruned questions | closed |
| value samples (R4) | +4.8 (MCS-SQL) | +0.29pp, 12/11 | closed |

The reading that survives all three: **this pipeline's baseline is already at the level the papers
call zero-shot-with-schema**, and each published component is a repair for a deficit this model does
not have — a single draw it must choose among, a schema it cannot fit, literals it cannot guess.
Adding information before the question has now been measured four ways (memory pack, pruned schema,
annotated schema, agreement) and it has not once produced a significant gain.

**Where the remaining headroom is.** The only channel that has never lost is the retry: `retry-blank`
+0.57, +1.14, +0.57pp across three runs, 0 losses every time, and `retry-keyed` identical to it to the
question. That is a second attempt at a question the first attempt failed, and the second attempt
currently receives nothing but the same prompt. Feeding the failure back — the error, the empty
result, the mismatched columns — is the only untested intervention that acts where the evidence says
the effect is, and it is the project's own thesis: capture the correction, apply it at the point of
failure.

## R5 — Rule admission by reproduction (opened 2026-10-29)

The question this section answers is the one that has been asked of this project three times and
never measured: **are the mistakes correctly extracted as rules?** Every arm so far measured what the
extraction is *worth* on held-out questions. None of them asked the extraction to demonstrate
anything, and the difference matters, because a negative delta on held-out questions has three
possible causes that the protocol could not separate:

| Cause | What it predicts | Measured before R5 |
|---|---|---|
| the rule is wrong | nothing on its own case either | **unknown** |
| the rule is right and does not transfer | works on its own case, fails elsewhere | **unknown** |
| the rule is right and transfers but is not obeyed | works on its own case, no delta on held-out | **unknown** |

Seven variables have been swept — content (rules / repair accounts / procedures), quantity (0 to
1,200 characters, 0 to 3 items), position (before the answer / after a failure / both), retrieval
key (question text / failure code), corroboration floor, grounding filter, and utility-based
deletion — and every sweep reported a delta against no memory. A delta against no memory cannot
distinguish the three rows above, which is why ten runs of evidence have not settled what is wrong
with the store.

**The measurement.** A distilled rule is a claim that one correction generalises. The first thing
such a claim must survive is the case it came from: give the model the failure, the failed attempt
and the rules that correction produced, and see whether the correction comes back. Two calls per
corrected question — with the rules and without — because a second attempt already repairs some
failures by itself (+0.57 to +1.14pp with zero losses across three runs), and crediting that to the
rules is the specific error this project has spent ten iterations avoiding.

|                    | retry alone right | retry alone wrong |
|--------------------|-------------------|-------------------|
| **with rules right** | `redundant`     | `supplied`        |
| **with rules wrong** | `broke`         | `useless`         |

Only `supplied` shows the rules doing work. `broke` is the sharpest available evidence that a rule
is wrong rather than merely unhelpful: the question needed no help and the help is what made it
wrong. `redundant` and `useless` are both extraction failures for opposite reasons — the experience
was unnecessary, or it was insufficient — and they are counted apart because they call for opposite
repairs.

**Two arms, because the diagnosis and the fix are one dispatch apart.**

| Arm | What it is | What it answers |
|---|---|---|
| `full-verified` | the same retrieval, order and budget, restricted to the rules that reproduced their own correction, and to none that broke theirs | is a store of *demonstrated* experience non-negative where a store of *plausible* prose is −3.7pp? |
| `full-shuffled` | the same pack size, drawn from a different question of the same database | is the harm the retrieved case, or the mere presence of advice about this workspace? |

`full-shuffled` is the missing cell of a mechanism table this project has been building since
iteration 71. `wrong-scope` (another database's rules) is inert at −0.29pp, so a matching vocabulary
is what makes the model follow a claim. `duplicate` doubles the same pack and prices the dosage. What
has never been measured is same vocabulary, same size, wrong content — and if that costs what `full`
costs, then every retrieval-quality explanation in this project's record is wrong and the harm is
the instruction to consult memory at all.

**Acceptance.** Fixed before dispatch, checked against the artefact.

| # | Criterion | Reading |
|---|---|---|
| 1 | the gate reaches a verdict on at least 80% of corrected questions | `measured / source_questions`; below that the probe is a direction, not a measurement |
| 2 | the four verdicts reconcile to the rules | `kept + unsupported + broke_its_source + no_verified_source = rules` (gate V13, blocking) |
| 3 | `supplied` is reported with its blank rate | a `supplied` share quoted without `blank_fix_rate` would credit the retry to the rules |
| 4 | `full-verified` is non-negative against `none` and beats `full` on the same run | 350 questions, paired bootstrap; the noise floor is the same run's `none-replica` |
| 5 | `full-shuffled` is reported beside `full` with its donor count | `donors` and `identical` must show the swap really happened, or the arm is `full` renamed (gate V14) |

**Cost.** 2 calls per corrected learn question (≈134 × 5 folds ≈ 1,340) plus four arms on 350
questions (1,400): about 3,400 calls, one dispatch, no new data.

**What each outcome licenses.**

- `supplied` rare (< 10% of corrections) and `full-verified` non-negative → the extraction is the
  defect, R1.2–R1.5 (ReasoningBank form, Reflexion task keying, cheat sheet, ACE curation) each get a
  reason to be tried on top of a store that only admits demonstrations.
- `supplied` common and `full-verified` still negative → the extraction is fine and the *injection* is
  the defect. That closes the content axis for good and sends the work to R1.3/R1.4, which differ
  from every arm so far in *when* the memory is read, not in what it says.
- `full-shuffled` as negative as `full` → retrieval is not the variable, and the whole
  relevance-based line of explanation (77–82% entity hit rate, the relevance split) was reading a
  coincidence.
- `full-shuffled` inert while `full` is negative → the retrieved case is what misleads, which is
  Xiong et al.'s experience-following mechanism measured on our own corpus with our own numbers.

**Position in the programme.** R2 (selection), R3 (schema linking) and R4 (value samples) are closed
on their own measurements. R5 is the memory axis's last unmeasured quantity and it gates R1.2–R1.5:
running four memory *forms* on top of a store whose extraction quality is unknown is how four more
nulls get published. R5 answers that first, and its two arms are the last items on the critical path
before the memory question is either answered or abandoned with a reason.

### R5 status, after one dispatch window (2026-10-29)

| Acceptance | Threshold | Measured | Verdict |
|---|---|---|---|
| 1. Verdict coverage | verdict on ≥ 80% of corrected questions | 651/652 = **99.8%** | **met** |
| 2. Attribution closes | four buckets sum to the rules held | **1256/1256** (V13, blocking) | **met** |
| 3. `supplied` with its blank rate | both reported | 22.9% against a 12.75% blank rate | **met** |
| 4. `full-verified` non-negative and above `full` | Δ > 0 vs `none`, and > `full` | −0.57pp vs `none` [−2.57, 1.43]; **+2.29pp vs `full`** [−0.57, 5.14] | **partly** — neutral, not positive |
| 5. The shuffle really happened | donors > 0, identical ≪ donors | 350 donors, 18 identical | **met** |

**The extraction is the defect, and the third of it that is right does not transfer.**

| Verdict | n | share |
|---|---|---|
| `supplied` | 149 | 22.9% |
| `redundant` | 61 | 9.4% |
| `broke` | 22 | 3.4% |
| `useless` | **419** | **64.4%** |

Two thirds of corrections cannot be reproduced from the rules distilled from them. The gate that
keeps the 23% which can removes 76% of injected rules, and the split says the two halves behave in
opposite ways:

| Group | n | `full` | `full-verified` | Δ | gained / lost |
|---|---|---|---|---|---|
| pack emptied by the gate | 211 | 49.3% | 54.0% | +4.7pp | 18 / 8 |
| a demonstrated rule survived | 139 | 52.5% | 51.1% | −1.4pp | **0 / 2** |

**So the content axis is closed with a mechanism rather than a null.** The harm is rules that cannot
replay their own correction; removing them recovers 80% of it (2.29 of 2.86pp). The rules that *can*
replay their own correction change nothing on held-out questions — 1.11 per question over 139
questions, zero gained, two lost. And `full-shuffled` (same vocabulary, same size, wrong question)
costs −1.71pp, so relevance to the question is not what makes a rule followed; the register is.

**Two things this changes.**

1. **The relevance line of explanation is retired.** Packs that name an answer entity cost 2.6pp,
   packs that name nothing cost 0.0pp, foreign-database rules are inert — all of that was read as
   evidence that retrieval picks the wrong case. The shuffle says a *wrong* case in the right
   vocabulary costs what the right one costs, so the correlation with entity mentions was measuring
   the pack's vocabulary, not its appropriateness.
2. **R6 becomes the last measurement on this axis, and it is narrow.** A demonstrated rule repairs
   its own case 149 times. Whether it repairs *any other* case has never been asked, and it is the
   only question that separates a store that is useless from a store that is too small. Every other
   variant of the memory — ReasoningBank's fields, Reflexion's task key, a running cheat sheet, ACE's
   curator — is a rearrangement of content whose individual units have now been shown to be inert.

**R6, sketched before it is built.** Take the 294 surviving rules and probe each against *other*
corrected cases in the same database, reusing the blanks the R5 probe already computes (a blank is a
property of a question, not of a rule). The rate that comes back is the transfer probability of one
demonstrated rule, and it converts directly into the store size a memory would need: at transfer rate
*p*, a pack of *k* rules repairs *k·p* questions per question asked. If *p* is 2%, the corpus's 1,256
rules are worth about 25 questions of 350 and the memory is too small, not wrong. If *p* is 0%, the
axis is closed and the record can say so with a number instead of an opinion.

## R6 — Transfer: is an admitted rule knowledge or a demonstration? (opened 2026-10-29)

R5 answered what is in the store. It could not answer what the store is worth, because a rule that
reproduces the correction it was distilled from is a lookup table with one row. The difference
between a demonstration and knowledge is whether the rule repairs a *different* question, and it has
never been measured here.

**The measurement.** Every rule that passed the R5 gate is pointed at four foreign cases from the
same database, drawn by a seeded partial Fisher-Yates so two runs of one store probe the same pairs.
The repair is judged against the target's own blank — a bare retry on that target, which is a
property of the target rather than of the rule and is therefore paid for once and reused.

| | blank right | blank wrong |
|---|---|---|
| **with the rule right** | `blankRight` (nothing shown) | **`repaired`** |
| **with the rule wrong** | `broke` (damage on a case that needed nothing) | `unchanged` |

`rate = repaired / informative`, where informative means the target's blank was wrong. A target a
bare retry already fixes cannot be counted as a repair, for the same reason the own-case probe has a
blank.

**Why the rate is the number that decides the axis.** Repairs per question ≈ admitted rules per pack
× rate. At the 0.44 admitted rules per question measured in R5:

| Transfer rate | Expected repairs on 350 questions | Reading |
|---|---|---|
| 20% | ~30 | the store is real but thin; more data is the answer |
| 5% | ~8 | worth less than the floor, and more data would not fix it at this corpus size |
| 1% | ~1.5 | the units are demonstrations, not lessons; adsorption of "rules" is the wrong substrate |

**Arm.** `full-transferred` carries only the intersection: reproduced its own correction, and repaired
another question. It is the only content this project has ever shown to be knowledge, and its pack
size is reported — a store that admits nothing is a finding about the corpus rather than an arm that
did nothing.

**Also fixed from R5's gap.** `rule_probe.by_kind` cross-tabulates verdict against the failure the
case presented. 552 of 652 corrections failed as *rejected* — the query ran and returned rows, and the
only symptom is that a person said it was wrong — so a dominant `useless` share there indicts the
input to the distiller rather than the distiller, and one table separates the two readings.
`rule_probe.by_fold` gives the supplied rate per fold, so a figure driven by one fold is visible.

**Acceptance.** Fixed before dispatch.

| # | Criterion | Reading |
|---|---|---|
| 1 | at least 90% of admitted rules are pointed at ≥ 3 foreign cases | `trials / (rules × targets)`, with `skipped` accounted |
| 2 | the trial buckets reconcile | `unmeasured + blank_right + informative = trials` (gate V15, blocking) |
| 3 | the rate is reported with `informative`, never as a bare share | and gate V16 records whether 100 informative trials existed |
| 4 | the rate converts to an expectation | repairs per question = `rate × mean_pack_ids`, stated in the report |
| 5 | `full-transferred` is reported with its pack size | a delta beside `mean_pack_ids = 0` describes `none`, not the arm |
| 6 | `supplied` is stable across folds | `by_fold.rate` within ±10pp of the pooled rate, or the pooled number is one fold's |

**What each outcome licenses.**

- rate ≥ 10% and `full-transferred` non-negative → the store works and is under-populated. The next
  work is corpus size and retrieval precision, not another memory form.
- rate < 3% → the units are demonstrations. Then the four remaining memory forms (R1.2–R1.5) are all
  rearrangements of a unit that does not carry, and the honest close is to say so with the number and
  stop spending dispatches on it.
- rate high but `full-transferred` negative → the transfer that the probe measures does not survive
  being put in a prompt, which points at the rendering and the position rather than the content.

**Cost.** 294 admitted rules × 4 targets ≈ 1,176 calls, plus four arms on 350 questions. One
dispatch.

### R6 — closed 2026-10-29, run `40820868520`

| # | Criterion | Reading | Result |
|---|---|---|---|
| 1 | ≥ 90% of admitted rules pointed at ≥ 3 foreign cases | 224 rules × 4 = 896 trials, 0 short | **met** |
| 2 | the buckets reconcile | 4 unmeasured + 68 blank-right + 824 informative = 896 | **met** (V15) |
| 3 | the rate is reported with `informative` | 29 / 824 = 3.52% | **met** (V16: 824 ≥ 100) |
| 4 | the rate converts to an expectation | 0.0352 × 1.86 packs = 0.065 repairs per question | **met** |
| 5 | `full-transferred` reported with its pack size | +2.57pp with `mean_pack_ids = 0.031` | **met**: an arm that carried 11 rules in 350 questions |
| 6 | `supplied` stable across folds | 20.3–24.4% (R5), no fold drives the figure | **met** |

**The verdict is `no-transfer`, and it is not the threshold's.**

| Statistic | Value | What it says |
|---|---|---|
| conditional rate (`repaired / informative`) | 3.52% | as pre-registered; above the 3% cancellation trigger |
| **net marginal effect** | **(29 − 29) / 892 = +0.00pp** | the rule repairs and damages in equal measure |
| **break rate on targets a retry had fixed** | **29 / 68 = 42.6%** | the rule destroys easy targets at four times the rate it repairs hard ones |
| own-case net marginal, same run | (144 − 13) / 638 = **+20.53pp** | the same rule, the case it came from |
| repairs per question, deployed | 0.065 | 23 questions in 350, inside the noise floor |

Criterion 3 was met and criterion 5 was met; the rate landed at 3.52% against a pre-registered
cancel-below of 3%. **The statistic the pre-registration named could not have refuted anything**: its
denominator is the targets a bare retry failed, which removes every trial where the rule does damage,
so it can only go up. Iteration 99 added the marginal accounting and gate V17 to make the loss side
unprintable-without, and re-read R6 under it. The axis closes on the break rate, not the threshold.

Outcome per the licence table above: **rate in the 3–10% band with a zero net effect**. Neither of the
two pre-written branches applies literally, and the reading that does apply is the third one —
what the probe measures does not survive being put in a prompt — except that iteration 99 shows it
does not survive being put anywhere: the transfer is zero before the rendering is reached.

---

## R7 — The lever is on the output side (opened 2026-10-29, revised with competitive anchors)

R2 measured selection and closed it on three dispatches. R3, R4, R5 and R6 measured the input side and
closed that too. Read together the two closures say what neither says alone: **every arm that changes
what the prompt contains is at or below zero, and the only positive number in the programme is a
ceiling that lives on the output side** — oracle over five draws, +3.52pp, against a best real selector
of −1.14pp.

The competitive reading in `COMPETITIVE.md` turns that gap into a number with a scale on it:

| | Candidate pool | Ceiling over one draw | Best selector | Captured |
|---|---|---|---|---|
| CHASE-SQL (Gemini 1.5 Pro, 21 candidates from 3 generators) | 21 | **+13.95pp** | 73.01 | 29.9% |
| microglia (DeepSeek, 5 draws from 1 prompt) | 5 | +3.52pp | 52.29 | **negative** |

Two systems standing on the same 53.5 baseline (their DeepSeek + DDL cell is 53.52; ours is 53.43)
differ by a factor of four in candidate headroom before either selector is trained. **A selector
cannot capture headroom that the generator never produced**, and every selection arm this project has
run has been measuring the selector against a pool that was too narrow to show one.

R7 is therefore ordered so that the pool is measured before any scorer is built. Three of its four
steps cost no model calls beyond the generation they already need, and the one that could be skipped —
training — is explicitly last.

### R7.0 — Instrumentation, because the pool has never been described

Nothing about behaviour changes. Each question records every candidate it produced: the generator that
produced it, its SQL after de-formalisation, its execution outcome as a signature (`empty`, row and
column counts, null share, duplicate share, numeric-only, scalar), and whether it scored correct. The
artefact carries the pool's own statistics — how often the oracle is reachable, how many **distinct**
execution results the five draws collapse to, and the rank of the first correct candidate under each
of six orderings.

The last number is the one that decides the stage. If five draws collapse to 1.2 distinct results on
average, the pool is one answer with five spellings and no selector can help; if they collapse to 4.1,
the selector is the problem and R7.2 is the work.

**Acceptance.**

| # | Criterion | Reading | Result (run 40862283263) |
|---|---|---|---|
| 1 | every candidate carries a signature | `signed / candidates` | **1,745 / 1,750 = 99.7%**, the five unsigned are draws that produced no query |
| 2 | the collapse statistic is reported per fold | `distinct_results / draws` | **mean 1.43, median 1** of 5 |
| 3 | the oracle is decomposed, not just totalled | unique vs shared correct | 14 unique / **195 shared** / 141 none |
| 4 | no behaviour change | `none` and `none-replica` deltas within the noise floor | `none-replica` **+0.29pp** [−0.86, 1.71], inside the ±1.7pp floor |

**Closed 2026-10-29. Verdict: NARROW**, on the bar fixed before the run: a median of one distinct answer
per five draws is 0.20 of the draws, below the 0.33 collapse threshold. The pool is one answer with
several spellings, and 93% of the questions the oracle reaches are questions where two or more draws
were already right.

**Cost.** Zero extra calls.

### R7.1 — Heterogeneous candidates: the pool is the constraint

Five draws from one prompt share the framing, the tables and usually the wrong join. CHASE-SQL's three
generators are different *procedures*, and its pool carries 13.95pp because of it. The arms:

| Arm | Generator | What it fixes that the others do not |
|---|---|---|
| `none` | question + schema, one step (incumbent) | nothing; it is the control |
| `gen-plan` | name columns, grain and filters before writing SQL | grain and distinct errors that survive a direct attempt |
| `gen-decompose` | split into sub-questions, answer each, compose | multi-hop joins a single pass collapses |
| `m-schema` | the incumbent prompt with M-Schema instead of DDL | the representation itself (XiYan: +1.63 on this model) |

All four are single calls per question, so one dispatch measures each generator against the control
and the three together as a pool. Two draws per generator is a second dispatch and is only worth
running if the first shows a ceiling: criterion 1 prices the pool, and a pool that does not clear
+2pp from one draw each will not clear it from two.

**Acceptance, fixed before dispatch, with the artefact field each criterion reads from.**

| # | Criterion | Field | Bar | Refuted if |
|---|---|---|---|---|
| 1 | the ceiling rises | `metrics.union.ceiling_pp` | ≥ +2.00pp over `none` | < +2pp |
| 2 | the generators are genuinely different | `metrics.union.disagreement_share` and `per_arm` | ≥ 0.40; no generator under 10% of the questions | one generator answers everything |
| 3 | distinctness, not just count | `metrics.union.distinct.verdict` and its median | not `narrow`; median as a share of the arms ≥ 0.33 | `narrow` |
| 4 | `m-schema` is measured on its own | `arms[m-schema].delta_pp` with its interval | — (informative either way) | — |
| 5 | the cost is stated with the gain | `calls / questions` beside every delta | — | a gain bought at 4x calls is recorded as such |
| 6 | no single procedure is the pool | `metrics.union.dominant` | `null` | a named generator |

Criteria 1, 2 and 6 are computed from `per_case[].arms` by `unionCeiling`, so they are read off the
artefact rather than assembled by hand: the union over generators is the score of a chooser that
always picked right, and it is reported net of the `none` arm because a question the direct
generator already answered is not headroom.

Criterion 3 reads the pool the ceiling was actually computed over, which needed a field that did not
exist before iteration 100: every arm now records the canonical identity of the rows it produced
(`per_case[].arm_keys`), so distinctness is counted across `none`, `gen-plan`, `gen-decompose` and
`m-schema` rather than only across sampling draws of one prompt. It is the same collapse rule R7.0
applies, through the same function (`verdictOf`), because the two pools differ in what produced the
candidates and not in what "collapsed" means.

The generators the union is taken over are `gen-plan`, `gen-decompose` and `m-schema` — every arm that
changes how the statement is produced. `m-schema` is in that set because a second representation of the
question is a genuinely different procedure: on the questions where the DDL prompt misreads a table it
can be the only arm that answers. It is also reported on its own, by criterion 4, because its effect
XiYan publishes (+1.63) is a single-cell delta rather than a pool effect, and the two readings answer
different questions. Criterion 6 is what stops the pool from being that one arm.

**If criterion 1 fails**, candidate diversity is not the constraint and R7.2 becomes the whole stage
with a 3.52pp ceiling as its maximum possible prize. That outcome would be published as the stage's
result, not buried.

**Read on run 40880218444 (2026-10-29) — refuted on criteria 2, 3 and the arm-level condition.**

| # | Criterion | Bar | Reading | Verdict |
|---|---|---|---|---|
| 1 | ceiling rises | ≥ +2.00pp | **+8.57pp** (221 vs 191) | ✓ |
| 2 | generators genuinely different | disagreement ≥ 0.40 | **0.229** | ✗ |
| 3 | distinctness | not `narrow`, median share ≥ 0.33 | mean **1.557**, median **1**, share **0.25**, `narrow` | ✗ |
| 6 | no single procedure is the pool | `null` | `null` | ✓ |

The ceiling is there and the pool that carries it is not: four procedures over 350 questions collapse to
1.56 distinct answers, against 1.46 for five draws of one prompt. And the arms lose individually —
`gen-plan` **−5.43pp** [−9.14, −2.00] p = 0.004, `gen-decompose` **−3.14pp** [−6.29, +0.00] p = 0.071,
`m-schema` **±0.00pp** [+20 / −20]. The heterogeneous pool does not contain better candidates; it
contains worse ones that mostly repeat what the direct prompt already said, which is why the union is
worth 8.57pp and a chooser among it is worth nothing.

CHASE-SQL's +13.95pp comes from three procedures that answer *differently*. Ours answer the same way and
some of them answer wrongly. Recorded as the stage's result rather than buried, per the sentence above:
candidate diversity is not the constraint this harness can exploit, and R7.2's ceiling was 7.14pp, not
13.95pp.

### R7.2a — Which execution signals actually discriminate (no calls, no activation)

Before any signal is allowed to rank anything, each is measured alone. For every question with at
least two candidates, each signal is asked to order the candidates, and its accuracy is compared with
the base rate of picking the first draw.

| Signal | What it reads | Direction |
|---|---|---|
| `empty` | no rows | against, unless the question asks for what is absent |
| `row-shape` | row count vs the question's plurality | shape match |
| `column-shape` | column count vs the question's entities | shape match |
| `null-share` | share of null cells | against |
| `duplicate-share` | repeated rows, unless distinct was asked | against |
| `value-type` | numeric-only vs an average/ratio/percentage | shape match |

The signals are computed by `packages/eval/src/exec-signature.ts` (30 tests, 100% four dimensions) and
priced by `packages/eval/src/pool.ts`. The gate that decides is `packages/eval/src/signal-gate.ts`,
run as `pnpm eval:signals` and as a workflow step beside `pnpm eval:pool`. It costs no calls and it is
built before the numbers arrive, which is the only order in which a bar means anything.

**The rule, fixed in code as well as here.**

| Element | Rule | Field the artefact or command prints |
|---|---|---|
| effect bar | `AUC − 0.5 > 2 SE` | `verdicts[].z` |
| family correction | Holm across the six | `verdicts[].holm` |
| standard error | question-clustered, floored at `sqrt(0.25 / min(n1, n2))` | `verdicts[].se` |
| direction | a signal below one half is dropped, not flipped | `verdicts[].survives` |
| combination | one vote per surviving signal, ties to the earlier draw | `kept`, `compositeTopPick` |
| baseline | the same function with no signals | `baselineTopPick` |

The floor exists because the interval resamples questions: a pool where every pair is concordant
returns a zero-variance bootstrap, and a zero variance read as certainty would pass a signal measured on
four candidates. The floor turns that into `z = 2.00` at four — which fails — and `z = 3.46` at twelve.

**Acceptance.**

| # | Criterion | Reading | Refuted if |
|---|---|---|---|
| 1 | every signal reports AUC over correct/incorrect candidates | with a bootstrap interval and its SE | — |
| 2 | only signals with AUC − 0.5 > 2 SE enter the composite | per signal, Holm-corrected | — |
| 3 | the composite is measured before activation | simulated ordering on the recorded pool | — |
| 4 | inert signals are named and removed | `inert[]` in the command's output | — |
| 5 | the leak check is explicit and executable | a test that makes the label unreadable and requires unchanged picks | any read at all |
| 6 | the composite reports what it broke as well as what it fixed | `gained`, `lost` beside `deltaPp` | a delta with no break count |

**The number this produces is a gate, not a result.** If every signal lands at AUC 0.50 ± noise, the
honest conclusion is that execution shape carries no signal beyond what the model already uses, and
R7.2b is cancelled before it spends anything.

**Read on run 40862283263 (2026-10-29).** Five of six signals cleared `AUC − 0.5 > 2 SE` after Holm:
`value-type` 0.608 (z 6.25), `column-shape` 0.579 (4.57), `empty` 0.572 (4.17), `row-shape` 0.563
(3.38), `duplicate-share` 0.542 (2.46). `null-share` 0.521 did not (z 1.23) and is removed. The
composite of the five picks correctly on 40.2% of the 122 choice-bearing questions against 32.8% for
the first draw: **+7.38pp** there, **+2.57pp** over the run, 11 gained / 2 lost, exact McNemar
**p = 0.0225**, yield 0.44 of the 25-question ceiling.

Two caveats on those digits, both from iteration 106. The AUCs above are a reconstruction's: the
artefact did not record the evidence BIRD ships with each question, so a re-analysis rebuilds every
shape from the question alone while the run used both. The run's own readings are `value-type` 0.6015,
`column-shape` 0.5998, `row-shape` 0.5749, `empty` 0.5653, `duplicate-share` 0.5418, `null-share`
0.5213 — the same five kept, the same one removed. And the composite's 40.2% inherits the same defect,
so it describes a selector reading a degraded shape rather than the one `sample-5-shape` runs. The
verdicts stand; the digits are provisional until an artefact carries the evidence.

Criterion 5 was met by construction rather than by inspection: `compositePicks` is called in a test with
every candidate's `correct` field replaced by a getter that throws.

### R7.2b — The verifier, deterministic first and learned second

Activated only if R7.2a passes. Deterministic composite first; a learned scorer (GradeSQL's ORM
recipe, XiYan's listwise selection) only if the deterministic one leaves more than half the ceiling on
the table **and** R7.1 has produced a pool wide enough to train on.

**Acceptance.**

| # | Criterion | Reading | Refuted if |
|---|---|---|---|
| 1 | yield = captured / (oracle − none) | ≥ 0.33 paired | ≤ 0 with a CI excluding 5% |
| 2 | it beats the two selectors already measured | > −1.14 (exec) and > −1.43 (agreement) | — |
| 3 | each signal ablated one at a time | leave-one-out deltas | — |
| 4 | the subset where execution is uninformative is reported separately | questions where all candidates execute identically | a gain that lives only in the easy subset |
| 5 | the selector never sees the answer | gate V17, blocking | — |

**Criterion 3, read on run 40862283263 (2026-10-29).** `pnpm eval:signals` prints eleven subsets, each
against the same first draw. The composite of five takes 40.2% of the 122 choice-bearing questions;
`value-type` alone takes 39.3% and never breaks a question the first draw had right; the other four add
one question between them and `row-shape` costs one (`without row-shape` = 41.0%). A difference of one
or two questions on 122 is inside the binomial spread (SE ≈ 4.4pp), so the ablation does not separate
"the four add a little" from "the four add nothing" — but it does establish that the composite's gain is
carried by one member.

The cause is structural: `scoreOf` penalises an empty result on every signal, not only on the one named
`empty`, so four of the five voters share a floor that fires on the same candidates. A signal set is not
as many opinions as it has members, and the next stage's job is to add one that is *independent* — a
signal that can prefer a shape rather than only reject one.

**Criterion 3 does not license a refit.** The subsets were chosen by looking at the pool the arm is
scored on. Run `40880218444` keeps the pre-registered five. The correct use of the ablation is to name
the next comparison, and it names one: the five against `value-type` alone, on the same draws in one
run, where both selectors read the identical five draws and the second therefore costs no calls.

**Read on run 40880218444 (2026-10-29) — criterion 1 not met, and the stage ends here.**

| # | Criterion | Bar | Reading | Verdict |
|---|---|---|---|---|
| 1 | yield = captured / ceiling | ≥ 0.33 | **0.16** (4 net of 25) | ✗ |
| 2 | beats the selectors already measured | > −1.14 and > −1.43 | **+1.14pp** over `sample-5-first` | ✓ |
| 3 | each signal ablated alone | leave-one-out | iteration 104, inheriting the shape defect | ✓ with caveat |
| 4 | the uninformative subset reported separately | — | not built | ✗ |
| 5 | the selector never sees the answer | gate V17 | `selectByShape` reads signatures only | ✓ |

The gate on this run's own shapes keeps the same five signals and drops `null-share` again:
`column-shape` 0.6012 (z 5.83), `value-type` 0.5961 (5.53), `row-shape` 0.5693 (3.37), `empty` 0.5657
(3.79), `duplicate-share` 0.5427 (2.46), `null-share` 0.5175 (1.01). The composite built from them takes
36 of 117 choice-bearing questions against 32 for the first draw — **+3.42pp** in sample — and the arm
takes 54.57% against 53.43% cross-fitted: **+1.14pp, 95% CI [−0.57, +2.86], McNemar p = 0.344**.

The point estimate is smaller than the ±1.4pp an identical prompt moves between two runs on these same
questions. The rung above — a learned scorer — is licensed only if the deterministic one leaves more than
half the ceiling *and* R7.1 produced a pool wide enough to train on; the first is false and the second is
false, so it is not licensed. **R7.2b closes with the selection axis measured and empty.**

### R7.3 — Memory's last position: a verifier feature, never a prefix

Only after R7.1 and R7.2. The same store, two positions, one run: as prompt text (`full`, measured at
−2.86pp) and as a feature the verifier reads — "this schema, this signature, and a stored record that
this signature was wrong here before".

**Cancelled as a prefix feature; it survives only in rewritten form as a verifier prior (2026-10-29).**

R6 measured a rule shown to a foreign question: 29 repaired and 29 broken over 892 measured trials,
net **+0.00pp**, with 42.6% of the targets a bare retry had already fixed destroyed. The same rule on
its own question nets **+20.53pp**. The unit is a case record, and text distilled from a case carries
nothing about any other case; R7.3 as written — the same rules, moved from the prefix to a feature
slot — would move a zero from one place to another.

What survives is a different *stored object*, not a different position for the same one: a
`(schema, execution signature, outcome)` triple. That object is a prior over the shape of an answer
rather than a lesson about a question, it is complete at one observation, and the verifier reads it
without applying it to a prompt. It is folded into R7.2b's feature set and keeps a cancellation rule:
if the deterministic verifier's yield sits at the floor, the prior has nothing to attach to and the
stage ends.

Recorded plainly: the pre-registered cancellation trigger was a transfer rate under 3%, and the
measured rate was **3.52%** — above the threshold, not below it. The cancellation rests on the net
marginal effect and the break rate instead, statistics the pre-registration did not name, added in
iteration 99 because the ratio it did name cannot express the question. The replacement criterion is
the one R6 should have carried.

#### R7.3a — the verifier prior, pre-registered before its dispatch (2026-10-29)

The object is a `(key, outcome)` table where the key is the shape of an executed result, retrieved
leave-one-fold-out. It is deliberately the *strongest* form of the idea: extraction and retrieval are
assumed perfect, so the measurement is an upper bound on any store-backed version of it.

| Element | Value |
|---|---|
| Arms | `sample-5-prior` (key = database + shape), `sample-5-prior-shape` (key = shape alone) |
| Controls | `sample-5-first` (the draw it would have taken with no opinion), `sample-5-shape` (the deterministic composite), `none-replica` (noise floor) |
| Cost | nine calls per question; the priors themselves spend nothing |
| Price on the previous pool | `db-signature` +1.27pp, `signature` +3.80pp, on 79 choice-bearing questions where the first draw was right 20.3% of the time |

| # | Criterion | Bar | If it fails |
|---|---|---|---|
| 1 | `prior-shape` beats the first draw | ≥ +1.0pp, 95% CI excluding 0, McNemar p < 0.05 | no verifier position for memory exists at this granularity |
| 2 | the database earns its place in the key | `prior` within 1.0pp of `prior-shape` | the key is the shape; the database is a bias that fragments the memory |
| 3 | support, not just accuracy | the artefact carries `metrics.prior`: keys, questions with support, per scope | a flat arm cannot be separated from a key with no support, and the stage would be read as a verdict rather than a measurement |
| 4 | coverage of the choice set | reported beside every delta | — |

**Cancellation rule, fixed here.** If `prior-shape` lands inside the run's own `none-replica` floor, the
stage closes: perfect recall of shape frequencies is not worth a verifier, and no imperfect version of
a perfect recall can be. That would be the fourth position for memory measured and empty, and it would
leave the store's value resting entirely on the answer-prefix experiment that already costs 3.14pp —
which is the finding, not a failure to keep trying.

**Read on run 40961917806 (2026-10-29) — cancelled, and R7 closes with it.**

| # | Criterion | Bar | Reading | Verdict |
|---|---|---|---|---|
| 1 | `prior-shape` beats the first draw | ≥ +1.0pp, CI excluding 0, p < 0.05 | **+0.57pp [−0.86, +2.29], p = 0.73** | ✗ |
| 2 | the database earns its place | `prior` within 1.0pp of `prior-shape` | both **+0.57pp**, identical | ✓ trivially, and therefore uninformative |
| 3 | support reported | `metrics.prior` present | 213 keys / 29 supported vs 124 / 46; `db` key offers no choice at all | ✓ |
| 4 | coverage beside every delta | — | 350 questions, 9 calls each, 0 failures | ✓ |

The prior's estimate sits inside `none-replica`'s interval and the replica's inside the prior's, so the
cancellation condition is met: perfect recall of shape frequencies is not worth a verifier here, and no
imperfect version of it can be. The in-sample table on the same run's pool agrees to the decimal —
+2.78pp on 72 choice-bearing questions is 2 net flips, which is 0.57pp over 350.

**R7 is closed in full.** R7.0 described the pool (1.43 distinct answers, 7.14pp of headroom), R7.1
refuted heterogeneous generation (+8.57pp of ceiling, 0.229 disagreement, two of three generators worse
than the prompt), R7.2a licensed five signals under an estimator that iteration 108 then showed was
pooling comparisons no selector makes, R7.2b measured the deterministic composite at +1.14pp and +0.57pp
in two runs — neither interval excluding zero — and R7.3a has now measured memory as a verifier prior at
+0.57pp. **Both axes this stage was built to explore are empty on this harness, and every rung says so
with an interval.**

### Protocol, fixed before any R7 dispatch

The statistics are part of the pre-registration, not a post-hoc report:

| Element | Rule |
|---|---|
| **Paired test** | McNemar on per-question flips; 10,000 bootstrap resamples for the interval |
| **Noise floor** | `none-replica` on every dispatch; a delta inside the floor is reported as inside the floor |
| **Minimum detectable difference** | computed per dispatch from n and discordance, printed beside every delta |
| **Multiplicity** | Holm-Bonferroni across the arms of one dispatch; the family is declared before dispatch |
| **Pre-registration** | arms, criteria and refutation conditions written to this file before the workflow is triggered |
| **Effect size over significance** | a +0.3pp result with p < 0.05 is reported as +0.3pp, not as a win |
| **Artefact first** | every number in a report is read from the artefact, never from a log line or a memory |

---

## R8 — The protocol as a deliverable (opened 2026-10-29)

Every competitor measured above reports point estimates. XiYan, CHASE-SQL and R³-SQL publish an EX
figure with no interval; GradeSQL's own reviewer flagged the missing significance tests; none publishes
a noise floor. Our harness already computes all three and uses them as gates.

R8 turns that into something another team can run:

| Step | Deliverable | Acceptance |
|---|---|---|
| R8.1 | a benchmark runner that takes any candidate generator as a plugin | a third-party generator runs without touching `packages/eval` |
| R8.2 | the paired-statistics report as a standalone artefact schema | a run's JSON validates against a published schema and reproduces its own report |
| R8.3 | a reproduction of one competitor's published cell | XiYan's DeepSeek + DDL 53.52 reproduced within the noise floor on the same split |
| R8.4 | a pre-registration template | a dispatch that skips it fails a gate |

R8.3 is the one that matters most, and writing it down forced a correction: **our 53.43 and their
53.52 are not the same measurement.** Theirs is BIRD *dev* (n = 1,534); ours is Mini-Dev (n = 350), a
subset of it. A 0.09pp difference between an estimate on 350 questions and one on 1,534 is 0.03 of the
smaller estimate's standard error, which is what agreement looks like and also what two coarse numbers
look like. The "informal reproduction" was arithmetic between two different splits, and the deliverable
is the rule that stops the next one.

### R8 — the four deliverables, specified before the work (2026-10-30)

| Step | Deliverable | Acceptance | Gate |
|---|---|---|---|
| R8.1 | `plugin.ts`: one request type, one reply, a loader that refuses a module inside `packages/eval` | `eval/plugins/keyword-router.mjs`, a module outside the package, runs through `pnpm eval:plugin` and is scored | V27 |
| R8.2 | `schema/run-artifact.schema.json` plus `artifact-schema.ts` (validator and renderer) | the committed artefact validates, and the committed report is byte-identical to the one rendered from it | V28 |
| R8.3 | `reproduction.ts`: published cells with their splits, Wilson intervals, and an admissibility rule | a comparison across splits is `indicative`, never `reproduced`; the gate re-derives every record from the artefact | V31 |
| R8.4 | `prereg/<id>.md` with a fixed header and two mandatory sections, plus a dispatch step | a dispatch that names none fails before the first model call; a file with a placeholder or without a refutation is refused | V30 |

**Why a fixture instead of a second model.** The acceptance for R8.1 has to be checkable without a
network, or it is a claim about a run somebody has to trust. `keyword-router.mjs` is a 2019-vintage
baseline — pick the table the question names, count its rows, project everything when asked to list —
and it is wrong in the two ways that class of system is wrong: it drops filters and it over-projects.
Its score is therefore predictable in advance, which is exactly what a harness check needs.

**Predictions, fixed here.**

1. The router answers all six fixture cases and scores **exactly two** of them: the two unfiltered counts.
2. The committed report is a pure function of the artefact: re-rendering it from the JSON reproduces it byte for byte, and `pnpm eval:protocol` fails if a number in the prose is not in the JSON.
3. The XiYan comparison is `indicative` at **+0.19pp** — our 53.71 on 350 questions against their 53.52 on 1,534 — and the published cell's own standard error (1.27pp) is seven times that gap.
4. The common failure of a pre-registration is a missing refutation section, and V30 catches it before the run rather than after.

**Refutation.** If the fixture scores anything other than two of six, the harness is not scoring the
comparison it prints and no number it produces may be quoted. If a recorded comparison can say
`reproduced` across splits and survive the gate, the catalogue is decoration and every competitor
number in this repository reverts to prose. If a dispatch can spend a model call without a
pre-registration, R8.4 is a template and not a gate.

---

## R9 — A workload where a rule is exercised more than once (opened 2026-10-29)

R7 closed having measured what memory does in this benchmark and why: about four fifths of the injected
store never changes an answer, the harmful tail is twice the helpful one, and each rule receives **0.25
decisive observations** in the whole run. Neither the corroboration filter (0 of 1,296 rules observed
twice) nor the retirement pass (16 rules retired) nor a feature filter (~45 discriminating rules per run
against the ~80 a single pre-registered split needs) can work at that density. The constraint is
observations per rule, and it is a property of the workload rather than of the memory system.

R9 is the stage that changes the workload rather than the arm:

| Step | Deliverable | Acceptance |
|---|---|---|
| R9.1 | a task family with a fixed rule set and many cases per rule | every rule exercised ≥ 20 times with a paired control, measured from the artefact and not asserted |
| R9.2 | the ledger as a gate | `discriminationOf` reports ≥ 60% of rules discriminating at that density, or the family is too easy and R9.1 is wrong |
| R9.3 | a per-rule policy fitted on one half and scored on the other | out-of-sample Δ over `none` with CI excluding zero, against a `none-replica` floor; narrowed by the measured ceiling — see the R9.1 verdict |
| R9.4 | the same policy transferred to the held-out domain | transfer rate above the 3.52% that R6 measured, or the stage reports that memory does not transfer at all |

**The refutation condition, fixed here.** If R9.1 produces a family where 80% of rules are still inert,
the inertness is not a property of the corpus but of the distillation, and the next stage is a distiller
rewrite rather than a policy. If R9.3's fitted policy beats the floor but R9.4's transfer does not, the
finding is that memory is a lookup and not a lesson — which is consistent with everything measured since
R4 and would be the honest end of the flywheel claim.

### R9.1 — the family, fixed before the first dispatch (2026-10-30)

The stage above says what R9.1 must deliver. This section says exactly what the family is, because a
density claim that is not fixed in advance is a claim that can always be met by lowering the bar.

| Element | Fixed value | Why this value |
|---|---|---|
| Rule set | fold 0's store, active rules that name a database, at most **8 per database**, ordered by a content hash of `statement + when` | a hash subset is a sample of the store rather than the rules that look best, and it is reproducible from the artefact |
| Panel | **20 questions per database**, drawn by a hash of the seed and the question id, shared by every rule of that database | one panel per database makes every rule in it comparable without also comparing the questions it happened to draw, and one control per question instead of one per rule |
| Position | one rule in the prompt, first attempt, temperature 0 | attribution is exact by construction (`rulesPerInjection` = 1) instead of being credited to every rule in a pack |
| Control | the `none` arm's answer to the same question | same prompt with an empty pack, deterministic, already measured — 0 extra calls and no sampling noise to subtract |
| Floor | one rule from a different database, shown on the same panel | if foreign vocabulary flips as often as the real rules, the flips are about text being present rather than about what it says |
| Databases with fewer than 20 usable questions | left out, by name, and counted | a rule given sixteen chances is not a rule given twenty, and the family's whole claim is the number |
| Cost | ~1,400 calls per dispatch | 60-odd rules × 20 plus ~200 floor injections |

**What the run reads.** Five strata (overall, relevant, irrelevant, cued, floor) and four policies
(`always`, `fitted`, `cued`, `oracle`). `relevant` is defined with the gold query and is therefore an
upper bound on what retrieval could know; `cued` is defined from the question and its evidence and is
the only one a deployment could compute. The four gates are V18 (every rule shown the panel), V19
(≥60% of rules discriminating — R9.2), V20 (the strata reconcile), V21 (the floor ran, advisory).

**The prediction, recorded before the run.** R7 measured 23% of injected rules discriminating at a
mean of ~3 shows each, and the transfer probe measured a 42.6% break rate on targets that were
already right, so the two point in opposite directions: more chances should raise the discriminating
share, and the harmful tail should grow with it. The prediction is **35–55% discriminating**, i.e.
**R9.2 fails**, and that the fitted policy's out-of-sample Δ stays inside ±2pp while its CI includes
zero. If instead more than 60% of rules discriminate, the constraint was density and R9.3 becomes the
live question rather than a formality.

### R9.1 — the run, and the verdict on the prediction (2026-10-30)

Run [`40973498367`](https://github.com/AgentiX-E/microglia/actions/runs/40973498367), 350 questions, 1,800
density calls, 0 failures; the artefact is `poc-sota-bird.json` and every number below is read from it.

| Gate | Reading | Verdict |
|---|---|---|
| V18-density-exercised | 20-20 per rule (median 20) | pass — R9.1 delivered |
| V19-density-discriminates | 68.8% of 80 rules | pass — **R9.2 met** |
| V20-density-reconciles | 1,600 = 679 relevant + 921 irrelevant | pass |
| V21-density-floor (advisory) | 200 floor injections, 7.5% flips | pass |

**The prediction recorded in the section above was refuted.** It said 35–55% discriminating and "R9.2
fails"; the reading is 68.8% against a bar of 60%. The refutation condition attached to R9 — "if R9.1
produces a family where 80% of rules are still inert, the inertness is a property of the distillation" —
is therefore **not triggered**: the inert share is 31.3% (18 of 80 rules never move an answer at all, 7
more move it both ways), against 77% at a mean of three shows per rule. The honest generalisation is that
the four-fifths-silent figure quoted since iteration 68 was a property of the workload, and that the
filters designed against it were designed against an artefact.

**The floor is the result that outranks the gate.** A rule from a different database, shown on the same
panel — vocabulary the workspace does not have — flips 7.5% of its injections and discriminates on 8 of
its 10 rules; the store flips 7.1% and discriminates on 55 of its 80. Movement is a property of text
arriving in the pack block at about one injection in fourteen; content decides the direction only, and it
decides it negatively for both (−29 net flips on 1,600 for the store, −3 on 200 for the floor). V19 is
retained as a population check, not as evidence about content.

**What R9.3 inherits.** `oracle` +1.75pp [+0.38, +3.75] with 14 repairs and 0 breaks is the measured
ceiling and it is outside the noise floor; `fitted` +0.63pp [−0.50, +2.25]; `cued` −2.13pp [−4.25, −0.38]
— the only policy computable from the question alone is significantly worse than showing nothing. Sign
persistence is 16 of 20 rules (80%, p = 0.012) with a backward run agreeing (+12 / −4), so a rule's sign
is learnable. The halves are not exchangeable (first half 25 repairs / 25 breaks, second 17 / 46), so
R9.3's acceptance is narrowed accordingly:

> R9.3 must produce a per-rule selection whose out-of-sample Δ over `none` has a CI excluding zero, with
> the selection fitted on **repeated or stratified splits** rather than one half, and the resulting Δ
> compared against the `none-replica` floor and against the 1.75pp ceiling measured here. A single-split
> fit that lands inside [−0.50, +2.25] is the null this run already contains and does not count as
> progress.

### R9.3 — the cross-fit, fixed before the dispatch (2026-10-30)

R9.1 measured the policy on **one split**: decide a rule's sign on the first half of its panel, obey the
decision on the second. It returned `fitted` +0.63pp [−0.50, +2.25] against a `cued` policy of −2.13pp and
an `oracle` ceiling of +1.75pp, and it also returned the reason not to trust one split: the fit halves
carried 25 repairs and 25 breaks while the scoring halves carried 17 and 46. A single draw of a statistic
that unstable is not an estimate, and the acceptance written in the R9.1 verdict says so.

R9.3 replaces the split with repeated cross-fitting. The elements are fixed here, before the run:

| Element | Fixed value | Why this value |
|---|---|---|
| Fold count | **5** per rule's panel, one held out | 4 of 20 questions to fit on, 4 to score: the ratio R9.1 used, cut five ways |
| Repeats | **10** independent cuts | one cut of twenty questions is the draw R9.1 already showed to be unstable; ten makes the interval mean what it says |
| Cut | a rule's own trials ranked by a hash of the repeat and the trial's position, rank modulo the folds | balanced by construction, independent of the order the artefact lists the trials in, and different per repeat |
| Decision | show a rule when its **out-of-fold** net is positive, hide it otherwise | the same rule `fitted` obeys, so the only thing that changes is where the evidence comes from |
| Control | the **same machinery on the foreign rules** | a fit that earns as much on vocabulary the workspace does not have is measuring the fit, not the content |
| Unit | Δ against the `none` arm on the same trials, cluster bootstrap over questions, 10,000 resamples, seed 7 | identical to every other interval in this project |
| Cost | **0 calls** | the trials are carried in the artefact; this reading re-cuts what R9.1 already bought |

**The two bars.** V22 is bookkeeping and blocking: every trial must be scored exactly once per repeat,
and the split must actually be repeated — a one-cut fit is the null R9.3 exists to beat, not a smaller
version of it. V23 is the claim and advisory: the store's cross-fit interval must clear zero **and** beat
the foreign rules fitted the same way.

**The prediction, recorded before the run.** The single split earned +0.63pp with an interval through
zero, and it earned it on a fit half that was exactly balanced (25 repairs, 25 breaks) while the scoring
half was not. A cross-fit averages ten cuts of that same data, so it should land **inside [0.00, +1.00]pp
with an interval containing zero**, and the foreign rules should land slightly negative because their sign
is noise: **V23 fails**. If instead the store clears zero and the floor does not, the policy is real and
R9.4 — the held-out domain — becomes the live question. If the floor earns as much as the store, the fit
is a coin weighted by the schedule, the R9.3 line is closed, and the honest end of the flywheel claim is
that a rule's measured effect does not survive being fitted on other questions.

### R9.3 — the run, and the verdict (2026-10-30)

Run [`40979195141`](https://github.com/AgentiX-E/microglia/actions/runs/40979195141), 350 questions,
2,859 calls, 0 failures, 1 retry, `1,800` density calls — the same ones R9.1 bought, because the trials
travel in the artefact and this reading re-cuts them.

| Gate | Reading | Verdict |
|---|---|---|
| V18-density-exercised | 20-20 per rule (median 20) | pass |
| V19-density-discriminates | 68.8% of 80 rules | pass |
| V20-density-reconciles | 1,600 = 721 relevant + 879 irrelevant | pass |
| V21-density-floor (advisory) | 200 floor injections, 8.5% flips | pass |
| V22-density-crossfit-covers | 16,000 of 16,000 injections scored, 5 folds x 10 repeats | pass |
| V23-density-crossfit-beats-floor | store +1.33pp [−0.06, +2.83] vs floor +0.05pp | **fail** |

**R9.3 does not pass, and the way it fails is worth more than the bar.** The store's cross-fit is
**+1.33pp** with a 95% interval that contains zero by 0.0625pp; the same machinery on foreign rules earns
**+0.05pp**. R9.1 could not separate a policy from a schedule, because the foreign rules flipped 7.5% of
their injections against the store's 7.1%. Fitted identically they earn nothing, so the 1.28pp difference is
content. That is the first positive reading on this axis that survives its own content-free control.

**The pre-registered prediction is half confirmed.** Recorded before the dispatch: store inside
[0.00, +1.00]pp with an interval containing zero, floor slightly negative, V23 fails. V23 failed and the
floor is flat, as predicted; the point estimate came in at +1.33pp, above the predicted range.

**The estimate does not depend on the schedule, and the interval does not depend on the repeats.** From the
carried ledger, twenty repeats each, zero calls: folds 4 / 5 / 10 / 20 give +0.95 / +1.33 / +1.30 / +1.38pp
with the floor at or below +0.65pp throughout; only folds 2 — ten fit observations per rule — collapses to
+0.04pp. Doubling the cuts from 10 to 20 moved the interval from [−0.06, +2.83] to [−0.06, +2.83]. The
interval is set by the 200 questions the bootstrap resamples, not by the 16,000 injections the policy scores.

**What R9.4 inherits, and what the next bar has to be.** R9.4's acceptance is a transfer rate above R6's
3.52% on a held-out domain, and it can now be run on a policy whose in-domain value is known to be about
+1.3pp rather than unknown. Two things are settled before it starts: the control is the same machinery on
foreign rules, and the interval will be wide because the constraints are questions rather than repeats. A
policy that transfers should be reported as a difference against **+1.28pp**, not against zero, because the
schedule has now been priced and it is the number the machinery earns on material that cannot apply.

### R9.4 — the held-out domain, fixed before the dispatch (2026-10-30)

R9.3 priced the policy inside one domain and against one control: the same machinery on foreign
rules earns +0.05pp, so 1.28pp of the 1.33pp is content. What it did not ask is where that content
lives. A rule distilled from `financial` states a fact about the `financial` schema, and every trial
in the family so far has put it on a `financial` question. The question R9.4 asks is the one R6
asked from the other direction: **a rule that works at home, does it still work away?**

| Element | Fixed value | Why |
|---|---|---|
| Cross panel | **10** targets per rule, all from databases other than the rule's own | R6 pointed a rule at four foreign cases and read 3.52%; ten gives 800 injections pooled over 80 rules |
| Draw | target databases ordered by `hash(ruleId + dbId)`, targets within each by `hash(ruleId + id)`, taken round-robin | deterministic, spread across databases rather than clustered in one, and independent of the order the cases arrive in |
| Injection | **one** rule, the same prompt shape, pack budget and temperature as the in-domain family | so the only difference between a home trial and a foreign trial is the target it landed on |
| Control | the target's own `none` answer, already bought in the learning pass | a foreign target's control is the same measurement as a home target's |
| Strata | the rule's in-domain sign over its **20** home trials: positive / zero / negative | the claim is about rules that worked at home, so the stratum is what "worked" means |
| Units | Δ in pp with a question-clustered interval, **and** R6's units: repair rate over trials the control failed, break rate over trials the control passed, each beside its home counterpart | R6 closed on the break rate rather than on the repair rate, and a foreign reading that quotes only one of them repeats that mistake |
| Cost | **800 calls** | 80 rules × 10 |

**Bars.** V24-density-transfer-covers (blocking) is bookkeeping: every injection landed on a database
that is not the rule's, the strata reconcile to the total, and the panel is the size it claims.
V25-density-transfer-holds (advisory) is the claim: the home-positive stratum earns a positive Δ on
foreign questions.

**The prediction, recorded before the dispatch.** Home-positive rules keep a positive point estimate
no larger than half their home effect — **at most +0.7pp** — with an interval containing zero, and
their foreign break rate stays within 5pp of their home break rate. That is, a rule's value is bound
to the schema it was distilled from and the store must be partitioned by database rather than
retrieved across one. The two other outcomes are pre-written because they would mean different
things: **+1pp or more with an interval excluding zero** means the store can be global and the
retrieval layer is the entire problem; **−1pp or worse** means cross-database retrieval is actively
harmful, which would be the first mechanism in this programme that explains a negative effect
instead of only measuring one.

### R9.5 — how many observations a rule needs, fixed before the dispatch (2026-10-30)

R9.3's policy shows a rule when its out-of-fold net is positive, and the fold it is fitted on is a
choice nobody has tested: 5 folds leave 16 of 20 observations, and folds 2 leave 10, which collapses
the reading to +0.04pp. So the number of chances a rule has been given is a *parameter of the
policy*, not a property of the workload, and it decides what a deployment must pay before it may
show a rule at all.

**The measurement.** Re-run the cross-fit with the fit pool capped at the first `m` observations of
each rule — `m ∈ {4, 6, 8, 10, 12, 16, 20}` — scoring every trial as before. The cap restricts what
the fit may look at, never what is scored, so every row of the curve is measured on the same 16,000
injections over the same 200 questions and the rows are paired.

**Bars.** V26-density-evidence-curve (blocking) is bookkeeping: the curve has at least three caps,
the smallest is strictly below the panel, and none exceeds it. The reading itself is descriptive and
is reported as a curve rather than as a pass.

**The prediction.** Δ at m = 4 is at or below zero — four observations cannot separate a rule that
helps from one that does not — rising to within 0.3pp of the full-panel reading by m = 12 and flat
afterwards. The deployment number to quote is the smallest m at which Δ exceeds +1pp.

### R9.4 — the run, and the verdict (2026-10-30)

Run [`40988215122`](https://github.com/AgentiX-E/microglia/actions/runs/40988215122), 350 questions,
3,656 calls, 1 retry, 0 failures, **0 holes**, 2,600 density injections of which 800 are foreign.

| Gate | Reading | Verdict |
|---|---|---|
| V24-density-transfer-covers | 800 of 800 injections, 0 on the rule's own, 11 databases, 272 questions | pass |
| V25-density-transfer-holds | home-positive rules −2.27pp [−7.86, +2.68] over 220 injections | **fail** |

| Stratum, by home sign | rules | foreign Δ | 95% CI | repair | break | home Δ |
|---|---|---|---|---|---|---|
| positive | 22 | **−2.27pp** | [−7.86, +2.68] | 7/105 = 6.7% | 12/115 = 10.4% | +7.05pp |
| zero | 23 | −1.74pp | [−5.98, +2.86] | 6/104 = 5.8% | 10/126 = 7.9% | 0.00pp |
| negative | 35 | −2.29pp | [−5.49, +0.90] | 6/155 = 3.9% | 14/195 = 7.2% | −8.71pp |
| all | 80 | −2.12pp | [−5.16, +1.02] | 19/364 = 5.2% | 36/436 = 8.3% | −1.88pp |

**The prediction is confirmed and the stage's claim is refuted.** The prediction said: home-positive
rules keep at most half their home effect (+0.7pp at most), interval containing zero, foreign break
rate within 5pp of home. The reading is −2.27pp with an interval containing zero, and a break rate of
10.4% against a home rate that R6 measured at 42.6% — the material does not break foreign questions
because it does not act on them.

**The home figure is not the comparison.** `home +7.05pp` is the same rules on the same twenty trials
the stratum was defined by, so it is a description of what "worked at home" means and not a
measurement. The comparable in-domain number is the cross-fit's **+0.33pp** in the same run.

**R6's two statistics do not reappear, and the difference is the finding.** A rule pointed at a
foreign case *in its own database* repaired 3.52% and broke 42.6% (R6). Across schemas the same rules
repair 6.7% and break 10.4%. The conditional repair rate is *higher* than R6's because its denominator
excludes every trial the rule fails to damage; the break rate is *lower* because a sentence about
tables that are not in the workspace is ignored rather than obeyed. The negative stratum is the
control for this: rules that cost 8.71pp at home cost 2.29pp abroad. **Leaving the schema does not
make a rule wrong, it makes it inert** — and a global store therefore buys nothing rather than costing
something.

### R9.5 — the run, and the verdict (2026-10-30)

Same run, same ledger, zero calls: the cross-fit re-read with the fit pool capped at the first *m*
observations of each rule, the whole panel scored every time.

| fit sees | Δ | 95% CI | shown | +/− |
|---|---|---|---|---|
| 4 | +0.00pp | [−0.29, +0.29] | 1,360 | 33/33 |
| 6 | +0.25pp | [−0.17, +0.72] | 1,948 | 73/33 |
| 8 | +0.36pp | [−0.12, +0.87] | 2,108 | 99/42 |
| 10 | +0.29pp | [−0.34, +0.96] | 2,460 | 118/72 |
| 12 | +0.22pp | [−0.47, +0.96] | 2,780 | 119/83 |
| 16 | +0.20pp | [−0.61, +1.03] | 3,316 | 138/106 |
| 20 | +0.33pp | [−0.49, +1.18] | 3,804 | 161/109 |

**The prediction holds in every clause and the premise behind it does not.** Four observations at or
below zero: yes, exactly zero. Within 0.3pp of the full panel by twelve: yes, +0.22 against +0.33.
Flat afterwards: yes. What the curve shows is that there is no knee, so the number of chances a rule
has been given is not what decides whether the policy can use it. The family was built on the
hypothesis that the store was silent because it was never asked twenty times; it was asked, in R9.1,
and the silence moved from the rules to the policy.

### R9 — closed 2026-10-30, on its own refutation condition

The stage's refutation condition, written before R9.1 was dispatched:

> If R9.3's fitted policy beats the floor but R9.4's transfer does not, the finding is that memory is
> a lookup and not a lesson — which is consistent with everything measured since R4 and would be the
> honest end of the flywheel claim.

The fitted policy beat its content-free floor in both runs (+1.33pp vs +0.05pp; +0.33pp vs −0.25pp)
and R9.4's transfer is −2.27pp. **The condition is triggered.**

| | R9.1 (2026-10-30) | R9.3 (2026-10-30) | R9.4 (2026-10-30) |
|---|---|---|---|
| cross-fit, store | — | +1.33pp [−0.06, +2.83] | +0.33pp [−0.49, +1.18] |
| cross-fit, foreign rules | — | +0.05pp | −0.25pp |
| oracle | +1.75pp [+0.38, +3.75] | +3.25pp [+1.00, +6.25] | +2.25pp [+0.63, +4.38] |
| `always` | −3.62pp | −2.75pp | −3.25pp |
| `cued` | −2.13pp | −1.00pp | −0.75pp |
| discriminating | 68.8% | 68.8% | 71.3% |
| sign persistence | 16/20 | 17/24 | 10/15 |

Three stores, same code: the cross-fit is **+1.33, +0.41, +0.33**, mean **+0.69pp**, sd **0.56pp**.
The store is a fresh distillation draw every run and the draw-to-draw spread is as wide as the effect,
so no single run's point estimate is a property of the method. What is stable is the ceiling —
`oracle` at +1.75 / +3.25 / +2.25pp, all excluding zero, all with zero breaks — and the fact that
nothing computable from the question, from the rule's text, or from another database approaches it.

**What the stage establishes, in one sentence each.** A rule's sign is real and stable (43 of 59 rules
that had a sign on both halves kept it, p 0.0006, pooled over three runs). A rule's value is bounded
by its own database. A rule that is shown indiscriminately costs about three points. Nothing that can
be known before the rule is exercised predicts whether it will help, and exercising it more does not
help either.

The remaining work in R9's line is none.

### R8 — the run, and the verdict (2026-10-30)

| Prediction | Measured | Verdict |
|---|---|---|
| P1 — the fixture scores exactly two of six | 2/6, **33.33%**, Wilson [9.68, 70.00] | **holds** |
| P2 — the report is a pure function of the artefact | `eval:protocol` re-renders it from the JSON and compares byte for byte; a one-character edit fails the step | **holds** |
| P3 — the XiYan comparison is `indicative` at +0.19pp | **+0.19pp**; published band ±2.50pp; band a difference must fit inside: **7.72pp** | **holds** |
| P4 — a missing refutation is the common defect and V30 catches it | six defect classes exercised in `prereg.test.ts`, each refused before dispatch | **holds** |

**What each gate now refuses, concretely.** V27 refuses a generator that resolves inside
`packages/eval`, before importing it. V29 refuses a run whose answer rate is under the registered
floor — a broken generator scores zero and is not reported as a bad one. V30 refuses a
pre-registration with a missing section, an unfilled placeholder, or an id that disagrees with its
filename, and the `sota` workflow refuses a dispatch that names none *before* the first model call,
because a gate that fires at the end has already spent the budget. V31 re-derives every recorded cell
comparison from the artefact and fails when the record disagrees — so `indicative` cannot be edited
into `reproduced`, and a difference inside the noise floor cannot be filed as a win.

**What R8 does not deliver, and the correction it forced.** A genuine reproduction of XiYan's dev
cell needs the dev split at n = 1,534. R8.3 closed by calling that item *blocked on data
availability*: the sandbox could not reach `huggingface.co`, and the block was written down as a
property of the environment. It was a property of one probe. The dataset is not on Hugging Face; it
is on the vendor's CDN, which answers in one request (see R8.3b below).

**Green:** `pnpm check` — 1,748 tests, 97 files, coverage 99.98 / 99.62 / 100 / 99.98, with `plugin.ts`,
`prereg.ts`, `reproduction.ts` and `artifact-schema.ts` at 100 on all four dimensions.

### R8.3b — the block was a probe, not a property (opened 2026-10-30)

| Question | Probe | Answer |
|---|---|---|
| Is the dev split reachable? | `curl -sI https://bird-bench.oss-cn-beijing.aliyuncs.com/dev.zip` | **200**, `Content-Length: 346,207,293`, `Last-Modified 2024-06-29` |
| Is it the same data the paper used? | extract and count | `dev_20240627/dev.json`, **1,534** questions, 925 simple / 464 moderate / 145 challenging, 11 databases |
| Does our loader accept it? | `BIRD_DIR=<extracted> SOTA_SPLIT=dev` | `data ok: california_schools 3 tables 29,941 rows` … eleven of eleven, before any model call |
| Does the digest pin it? | `sha256sum dev.zip` | `cdd6d19faeb45a23970b98d3ef6c40a87987c95459c2cf12076897a60cf5a630`, pinned in `eval/manifests/bird-dev.json` |

**The error, named.** R8.3 tested one host (`huggingface.co`), found it unreachable, and reported
the result as "this environment cannot download the dev split". Those are different claims: the
first is a measurement, the second is a generality the measurement cannot support. The same mistake
has a name in this project's own protocol — it is the cross-split comparison problem, one level up:
a check performed on one object, reported as a property of the class. Four minutes of probing the
host the manifest already named would have replaced the estimate with a fact.

**What changed in the lane.** A split is now a first-class parameter. `SOTA_SPLIT=dev` selects the
`bird-dev.json` manifest, reads `dev.json` through `manifest.questions` instead of a hard-coded file
name, keeps all 1,534 questions (`poolOf` — the `simple` filter that is right for a transfer
experiment is a protocol violation for a reproduction, since it would leave 609), and writes
`poc-sota-bird-dev.json` rather than overwriting the 350-question artefact. Fifteen places in the
workflow that spelled one artefact name now read `SOTA_ARTEFACT`, and `chooseArtefact` resolves it
once so a downstream lane cannot silently read the wrong split and exit zero.

**Predictions, fixed before the run** (`prereg/R8.3b-dev-split.md`):

1. `none` on 1,534 questions lands inside 53.52 ± 7.72 — roughly 51–56 — and the verdict becomes
   `reproduced` rather than `indicative`.
2. The Wilson band narrows from ±5.2pp to about ±2.5pp. That narrowing, not a better point estimate,
   is the return on the run.
3. The `full` arm does not turn positive at n = 1,534. R9's +1.33pp over a +0.05pp floor, with a
   2.27pp cross-database penalty, is a claim about a mechanism rather than about 350 questions.

**Refutation.** If `none` falls outside the band, the harness is not measuring the quantity the
published cell measures and every cross-paper comparison in this repository is withdrawn. If `full`
is significantly positive — an interval excluding zero — R9's closing condition reopens with this
artefact as its first evidence.

**Four dispatches, three bugs found by the run and one by the log.** Each attempt died on a defect the
previous one exposed, and the fourth died on a defect that was in the client all along:

| Dispatch | Died on | Fix |
|---|---|---|
| 1 | `the dataset archive failed its size check` — a repository variable named the Mini-Dev URL while the split selected the dev manifest | the archive URL comes from the manifest, not from a second description of the same download |
| 2 | `No database file for 'california_schools'` — `dev.zip` nests `dev_databases.zip` | a nested archive is extracted before the loader reads it |
| 3 | `MG_E_BUDGET_EXCEEDED` — the lane's own forecast: 12,037 calls against a cap of 8,000 | `SOTA_LEARN_SAMPLE=64`, declared in the pre-registration |
| 4 | **step timeout at 160 minutes**, three folds finished, no artefact | §17.44: the attempt timeout is a function of the reply allowance; the lane holds its own deadline; distillation pays its batch concurrently; `V32` |

**The fourth dispatch's log is the finding of iteration 118.** Evaluation took two minutes per fold and
learning took forty-three, at the same endpoint in the same hour. The difference is the reply
allowance: distillation asks for 2,000 tokens and the client waited a fixed sixty seconds per attempt,
so it aborted replies that were about to arrive and retried them as though the provider had failed.
That is not a slow run; it is a policy, computable in one line. It survived four dispatches because
the artefact could not distinguish "the model said nothing" from "the client hung up".

**The fifth dispatch is sized from measurements rather than from a guess:** `split=dev`,
`learn_sample=64`, `arms=none,full`, `deadline_min=130`, `distill_concurrency=8`, step timeout 200,
job timeout 260, and `V32` declared in the pre-registration before it runs.

**Closed 2026-10-30, run `41049843360`, 77 minutes, 3,190 calls, 0 timeouts.**

| Prediction | Measured | Held |
|---|---|---|
| `none` inside 53.52 ± 7.72, verdict `reproduced` | **57.63%** [55.14, 60.08], +4.11pp against a 4.97pp same-split tolerance → `reproduced` | yes, and on the stricter test |
| interval narrows from ±5.2pp to about ±2.5pp | ±**2.47pp** | yes |
| `full` does not turn positive at n = 1,534 | **−1.37pp** [−2.74, 0.00], p = 0.062, 68 lost / 47 gained | yes |

The third row is now the project's most precise statement about memory: on 1,534 questions, with a
store distilled from 64 questions a fold, adding the rules costs 1.37 points and the interval's upper
bound is zero. R9's closing condition stands, measured at 4.4× the sample rather than asserted.

The reproduction also retires a class of hedging from every other document: the 18pp gap to a 73–75%
system is now measured against a baseline on the *published* split, so no further comparison in this
repository needs the `indicative` qualifier.

### R10 — migrate the structure, not the sentence (pre-registered 2026-10-30)

**The finding R9 left on the table.** R9.4 measured what happens when a rule learned in one database
is shown a question from another: **repair 6.7%, break 10.4%**, against a same-database foreign case
at 3.52% / 42.6%. A cross-database rule is not obeyed, it is ignored — because it is a sentence about
a table that is not there ("`price` is stored as text, cast before comparing") and the target
database has no `price`.

**Two published answers, both direct hits.**

- **ODIS** (EMNLP 2023 Findings, arXiv 2310.06302) separates out-of-domain demonstrations from
  *synthetically generated in-domain* ones and reports **+1.1 and +11.8 points** on two cross-domain
  text-to-SQL benchmarks. Its ablation isolates the factor: what matters in an in-domain
  demonstration is the **SQL distribution**, not the question distribution.
- **SQL-Exchange** (PVLDB 2026, arXiv 2508.07087) maps a query from a source schema to a target
  schema by **preserving the source query's structure and substituting only the domain-specific
  elements**. Mapped queries used as in-context examples beat raw source-schema queries consistently
  across model families and datasets — which is the same claim as ours, stated as a construction
  rather than as a hope.

**What R10 does with them.** A rule stops being prose and becomes a template: a structural pattern
over SQL with slots, e.g. `CAST({column} AS REAL) when {column} is TEXT and compared to a number`.
Distillation emits the template; transfer binds its slots against the *target* schema before the rule
is shown. The three arms are the ablation the question deserves:

| Arm | What the model sees | What it tests |
|---|---|---|
| A | the current prose rule | the R9.4 baseline |
| B | the same rule as a slot template, bound to this database | whether structure is the part that transfers |
| C | nothing | the control the other two are priced against |

**Predictions.** B's cross-database repair rate exceeds A's 6.7% and its break rate falls below
10.4%; the *pair* moves even if the accuracy delta stays inside the interval, because a rule that
repairs more and breaks less is a different rule. If B's break rate does not fall under 8%, the
structural hypothesis is wrong for this class of rule and the memory layer's scope is "same database
only", written down rather than hoped for.

**Refutation.** If B's net cross-database effect is still ≤ 0, then "the memory is a lookup and not a
lesson" holds at the structural level too, the R-series closes for good, and the memory layer is
documented as an in-database prompt with no transfer claim anywhere in the project.

**The construction, built 2026-10-30 (dispatch pending).** `packages/eval/src/template.ts` reads a
stored statement as a template and binds it, in three pure functions and no model call:

| Step | Function | Rule it obeys |
|---|---|---|
| read | `templateOf(statement, home)` | a slot is an identifier the *home* schema has; everything else stays prose |
| bind | `bindTemplate(template, target)` | score = Jaccard overlap of `snake_case` parts; identity 1, `price`→`unit_price` 0.5, nothing below 0.5; ties to the shorter name; one candidate never fills two slots |
| decide | `transferStatement(...)` | all-or-nothing: one unbound slot withholds the whole rule, and a rule with no slots is `slotless` rather than `bound` |

**Why the derivation is at use time and not in the distiller.** The distiller's output is stored,
audited and reproduced by every arm in this project; changing it would move every artefact at once
and leave arm B incomparable to arm A on anything but the template. Reading the statement
structurally when it is shown makes the two arms differ in one field of one rendered line, which is
the only form in which the comparison is a comparison. The three amendments this required are
written into `prereg/R10-template-transfer.md` before the first dispatch: a withheld attempt makes
no call and contributes no trial (instead of a zero-delta trial), `V24`'s coverage drops the withheld
panels from its denominator, and `V28` holds `bound + slotless` equal to the rule-database pairs the
foreign ledger carries, so a rule that vanishes is a defect and not a result.

**What the dispatch is.** `SOTA_TEMPLATE=bound SOTA_DENSITY_PANEL=20 SOTA_TRANSFER_PANEL=10`, with
`prereg=R10-template-transfer`, `arms=none,full`, `split=minidev`, 8 rules per database over two
arms. The prose arm is not re-bought: R9.4's cells are the baseline, its artefact is in the
repository, and its ledger is recomputable — which is what the density family's carried ledger was
for.

**The dispatch did not happen, because the pre-registered kill condition fired for free.** Withholding
is a property of schemas, so it was measured without a model call: `pnpm eval:template` reads the
committed artefact's store and the eleven BIRD databases and puts the binder on every pair.

| Reading | Value |
|---|---|
| rules | 289 (1,288 entries; five folds repeat each rule once) |
| homeless / attempted | 30 / 259 |
| bound in at least one foreign database | **10 — 3.9%** |
| slotless | 76 — 29.3% |
| **withheld** | **173 — 66.8%** |
| attempts bound / slotless / withheld | 34 / 760 / 1,796 of 2,590 |
| top blockers | table `posts` 103, `cards` 91, `drivers` 86, column `lap` 80, `patient` 70 |

`66.8% > 60%`, so R10 issues **no verdict** and arm B is not bought. The blockers are the finding:
every one is a domain element, and SQL-Exchange substitutes those by mapping to the *target query* —
structure the binder never sees when it compares names. R10 therefore closes as **a construction
rejected before it was paid for**, with the hypothesis (a rule travels as structure) still untested.

**R11, opened by that reading.** Bind a slot to the target's own **schema links** — the tables and
columns the question actually mentions, which this repository already computes in `linkSchema` —
rather than to a similarly spelled name. A rule about `posts` binds to whichever table the target
question names; a column slot binds inside the linked table, by name overlap with a type agreement,
or is withheld. Its kill condition is the same 60%, measured by the same command before it spends
anything, and its prediction is the same pair of rates R10 could not reach: repair above 6.7%, break
below 10.4%.


### R11 — the run that was not paid for, and the closure of the transfer question (2026-10-31)

**Built.** `packages/eval/src/link-bind.ts`: a table slot's referent is the table the *question* names
(`linkSchema`'s anchors, not its join closure), a column slot binds only inside the table its template
reached and only to a column of the same declared kind, and every refusal names its reason. `pnpm
eval:template` now runs both censuses over the same store and the same 350 questions, for zero calls.

| Reading | R10 (bind by name) | R11 (bind by question) |
|---|---|---|
| rules bound in at least one foreign place | 10 — 3.9% | **57 — 22.0%** |
| rules withheld | 173 — 66.8% | **126 — 48.6%** |
| attempts withheld | 1,796 / 2,590 — 69.3% | **51,159 / 82,137 — 62.3%** |

**Refused on its own pre-registered condition.** The prediction was under 20% withheld; the kill
condition was 60%. At 62.3% of attempts, an arm-B dispatch would measure the binder, so no verdict is
issued and no call was spent. The 4.4x reduction in bound rules that the link was worth is real, and
so is the margin it missed by.

**Why it missed, counted.** Every withheld attempt now records which wall it hit:

| Reason | Attempts | Share of the withheld |
|---|---|---|
| the target has no column by that name, in the table the rule reached | 30,692 | **60.0%** |
| the question named no table the slot could take | 12,114 | 23.7% |
| two anchors of equal length, and the construction withholds rather than guesses | 7,541 | 14.7% |
| the name is there and the column holds another kind of thing | 812 | **1.6%** |

The kind check is not the wall — 1.6% of the withheld. The vocabulary is: three in five refusals are a
column the target database does not have at all. A table slot has a referent to inherit because
questions name tables; a column slot has none, because the column is the knowledge rather than its
address.

**The transfer question is closed, and this is the third measurement of the same property.** R9 found a
rule's value bounded by its own database (+1.33pp fitted, −2.27pp across a boundary). R10 found the
sentence has no referent away from home (66.8% unbindable). R11 found the structure is bindable and the
column is not. The product statement that follows is now written in three places rather than hedged:
the pack is an **in-database prompt**; a domain pack distilled on one schema does not steer questions
written against another; no claim in this repository says otherwise.

**What would reopen it, stated so that it is not reopened by accident.** A construction that *guesses*
a referent instead of withholding — mapping every slot onto whatever the linked schema has most of.
The table-tie is 9.2% of attempts, so such a binder would clear the 60% bar on arithmetic alone; it is
not built because its failure mode is a confident statement about the wrong table, which is the harm
R9 measured at 42.6% break on same-database foreign rules. If it is ever built it needs its own
pre-registration and its own census, and the bar is the same.

**Also fixed, because the census exposed it.** `per_case.arm_keys` held each arm's canonical result
set, and one `card_games` answer is 12 MB: 37.9 MB of a 38 MB evidence file, for a field whose only use
is an equality test. The field is now `arm_result_digests`. The dev artefact is left as it ran.

### R12 — the store was asked to prove itself (2026-10-31)

**Built.** `SOTA_ARMS=full-verified` — the probe path that had existed since `rule-probe.ts` was
written and had never run on BIRD (`rule_probe` was `null` in both committed artefacts). Each corrected
learning question is re-asked twice, blank retry and retry with the rules that correction produced, and
the pair yields one of four verdicts. Pre-registration: `prereg/R12-own-case-probe.md`, written before
the dispatch.

**Reading** (Mini-Dev, k=5, 350 questions, 1,445 calls — 312 of them the probe):

| Reading | Value | Predicted |
|---|---|---|
| corrected cases probed | 156, all measured | ≥ 80% measured ✅ |
| `supplied` | **19 — 12.2%** | ≥ 20% ❌ |
| `redundant` | 31 — 19.9% | — |
| `broke` | **3 — 1.9%** | ≤ 15% ✅ |
| `useless` | **103 — 66.0%** | — |
| blank-retry repair rate | 21.8% | 20–60% ✅ |
| rules admitted | **38 of 296 — 12.8%** | ≥ 25% ❌ |
| the verified arm | **54.00% vs 54.00% — 0.00pp**, 0.39 rules/question | — |

**Two predictions failed, and they are the result.** The store does not catastrophically fail — one
case in eight is repaired only when its own rules are shown — but **two corrections in three cannot be
reproduced even with the failure and its own rules in the prompt**. A single correction, read into a
sentence, is usually not enough to reproduce itself. That locates the deficit in the **extraction**,
and every one of the last four iterations was spent looking somewhere else (retrieval, budget,
injection point, schema boundary).

**The admitted store is inert.** 38 rules moved 342 of 350 prompts and no accuracy. The 130 questions
that received a rule scored 56 against 57 (−0.77pp at n = 130); the 220 that received none differed by
one question in the other direction **on identical prompts** — the sampling noise a temperature-0.7
client buys when it pairs arms by question rather than by seed, measured here for the first time at 36
of 220 (16.4%) and one question.

**A blocking gate could never have passed, and the dry run found it.** `probe.rules` was
`summary.rules` — rule *citations* — while the admission buckets partition *items*. The two diverge
whenever a rule is cited twice, so `V13` would have failed every real dispatch. Fixed before the run
(`rules` = the store the probe was given, `citations` = the other reading) and pinned by a test.

**Cost.** 1,445 calls, 11 minutes, 0 retries, 0 timeouts. The probe is 312 of those calls, which makes
it the cheapest instrument in the project: 4.6% of a two-arm run for the only measurement that asks
whether the pack is any good.

**Next, and it is not another arm variant.** The one claim the design still supports and has not
measured is *in-database* transfer of an **admitted** rule: does it repair a different question in the
same database? The ledger exists (`transfer`, four calls per rule — 152 for 38 survivors) and was
disabled here because R11 closed the cross-database question and this dispatch asked one thing.

### R13 — the rule travels, and it breaks as often as it repairs (2026-10-31)

**Built.** The transfer measurement that `rule-probe.ts` had carried since it was written and that no
run had ever dispatched. Each admitted rule is pointed at up to eight other corrected questions from
its own database; the target's blank is measured once and reused. Pre-registration:
`prereg/R13-admitted-transfer.md`, written before the dispatch. Two defects were fixed on the way in,
both of which would have made the reading unreadable rather than merely wrong:

1. A control call that never returned was stored as `false`, which is the informative set — a rule
   repairing such a target was credited with work nobody measured.
2. The pairs were written into the fold record, which the artefact does not serialise, so the rate
   would have been published without the rows behind it. `transferLedgerOf` projects them where the
   artefact reads and `V33-transfer-ledger` (blocking) refuses a file that carries one without the
   other.

**Reading** (Mini-Dev, k=5, 350 questions, `learn_sample` 128, 2,679 calls, 523 trials):

| Reading | Value | Predicted |
|---|---|---|
| informative trials | 467 of 523 | ≥ 200 ✅ |
| transfer rate | **7.3%** (34 repairs) | ≤ 6% ❌ |
| rules that repaired anything | **30 of 576** | ≤ 4 ❌ |
| break rate on targets that needed nothing | **50.0%** (28 of 56) | — |
| net marginal effect | **+1.15pp** — six trials | — |
| what survives both gates | 10 items / 350 questions — 0.03 per question | ≤ 0.10 ✅ |
| `full-transferred` arm | 53.71% vs 53.71% — **0.00pp** | — |
| `full-verified` arm | 54.86% — **+1.14pp**, p = 0.34 | \|Δ\| ≤ 3pp ✅ |

**Both refutation clauses missed, and the middle outcome is the finding.** The pre-registration said
≥15% would mean "more data" and ≤1% would mean "a new substrate". The measurement is 7.3% repair
beside 50% breakage: a rule that fixes one question in fourteen also destroys half of the questions
that already worked. The design had never priced the second half at this granularity — §3.6.8 saw it
aggregated — and it is the mechanism of the negative memory effect rather than a defect in retrieval.

**Consequence for the next stage, with the arithmetic attached.** Repairs per question is
`0.42 × 7.3% ≈ 0.03`; the arm measured +1.14pp against the same baseline in the same run, half the
arithmetic estimate and the same sign. A resolvable three-point cell needs two to four times the store
and brings two to four times the break side. **R14 therefore changes the substrate, not the size**:
render the pair (question, failed query, corrected query, failure) instead of a sentence about it, and
submit it to the same probe with the same admission rule.

**Cost.** 2,679 calls, 20 minutes, 1 retry, 0 timeouts. Artefact:
`eval/results/poc-sota-bird-transfer.json` (dispatch 41157635856). `pnpm check` — 1,860 tests, 103
files, coverage 99.98 / 99.61 / 100 / 99.98.

### R14 — the substrate, measured against itself (2026-10-31)

**Why.** R13 closed on a claim about a substrate and one column of evidence for it. The `repair`
distiller — three sentences comparing the failed attempt with the correction — had been measured three
times as a whole pack (−5.14, −4.86, −5.71pp, p ≤ 0.014) and never as a store asked to reproduce its own
corrections. A reproduction rate and an accuracy delta are not commensurable, so "the form is wrong" and
"the delivery is wrong" had never been separated.

**Built.** `probe-pair.ts` (paired McNemar over the questions both stores covered, with the exclusive
sets and the holes counted rather than absorbed), a shared control per source question so the two
substrates differ in exactly one thing, the arm `full-repair-verified` (R12's admission rule applied to
the repair store), one `probeArtefact` projection used by both substrates, and five gates: V34 (cells,
rates and delta reconcile), V35 (a small paired set is a direction), V36 (the size of the exclusion is a
reading), V37 (the repair store's buckets reconcile), V38 (its gate changed a pack). Pre-registration:
`prereg/R14-substrate-pair.md`.

**Reading** (Mini-Dev, k=5, 350 questions, `learn_sample` 128, 2,490 calls, dispatch `41165067200`,
artefact `eval/results/poc-sota-bird-substrate.json`):

| Reading | rule | repair | Predicted |
|---|---|---|---|
| reproduced its own correction | 30.69% | **53.80%** | Δ ≥ +10pp ✅ |
| paired delta (303 shared, 0 holes, 0 exclusive) | — | **+23.10pp**, p = 1.05e-14 | ✅ |
| discordant pairs | 10 | 80 | — |
| `broke` | 11 | 10 | not lower ✅ (one case) |
| admitted | 118 of 590 (20.0%) | 128 of 303 (42.2%) | — |
| items without a home database | 16.3% | 10.6% | 8–20% ✅ |
| gated arm | `full-verified` 54.29% (+1.14pp) | `full-repair-verified` 52.86% (−0.29pp) | \|Δ\| ≤ 3pp ✅ |

Five folds, five positive deltas: +23.08, +22.95, +22.03, +28.81, +18.64pp, each p < 0.01.

**The prediction held and the product did not move.** A store that reproduces half of what it was
learned from answers one question of 350 differently. That is not a contradiction: reproduction is a
property of the extraction, and an accuracy cell is a property of what the extraction is worth on
questions the store was not written from. Three content forms have now been measured as arms — a
sentence, a procedure with the case removed, and the pair — and all three are inert within ±3pp; the two
that were probed reproduce 12–31% (sentence, three runs) and 53.8% (pair) of their own corrections.
**The extraction is no longer an available explanation**, and that is what R14 buys the next stage.

**Consequence.** R15 measures the repair substrate's *transfer* with R13's instrument, because the one
question R14 cannot answer is the one that decides the product: whether a store that reproduces twice as
much also repairs questions it was not written from, at better than R13's 7.3% repair against 50%
damage. R16 then fills `scope.domain` from the run input, which 16.3% of rule items and 10.6% of repair
items are currently missing — a field the host knows and the model merely echoes.

**Cost.** 2,490 calls, 22 minutes, 1 retry, 0 timeouts; every gate pass. `pnpm check` — 1,889 tests, 104
files, coverage 99.98 / 99.61 / 100 / 99.98; `probe-pair.ts` 100 on all four dimensions.
