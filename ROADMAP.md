# Roadmap

The plan, in stages, with the gate that ends each one. A stage that misses its gate stops; it does not
roll forward into the next with a caveat. This document is the contract between the design and the
work, and it is updated only when a stage closes or a gate changes for a stated reason.

Status as of **2026-11-08**.

## Stage map

| Stage | Question it answers | State | Exit gate |
|---|---|---|---|
| **S0 Mechanism** | Does feedback become knowledge that transfers? | **done** | G1–G15 green in `AgentiX-E/microglia` |
| **S1 Host shadow** | Does it help on one real product, offline? | next | +3pp chart top-1 on 1,300 adjudicated cases, κ ≥ 0.7; no SQL regression |
| **S2 Public benchmarks** | Does it beat the same backbone on published data? | **read at n=352: no benefit (−2.84pp)** | BIRD-Interact +5pp at n=600; nvBench 2.0 +3pp; no memory-substrate regression |
| **S3 SOTA push** | Can it lead a named benchmark, not merely improve on a baseline? | **frozen** (2026-11-08) | preregistered result beating the published best under the same protocol |
| **S2c Lane roles** | Which lane may supply product evidence, and which may only falsify? | **fixed 2026-11-08** | a number from one lane may not be quoted as the other's; τ² same-domain is the evidence lane, BIRD the hostile case |

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

## S2c — Lane roles, and the four registrations that follow from them (fixed 2026-11-08)

S2c is not a new corpus. It is a decision about which of the two existing lanes is allowed to say
what, and it was forced by one measurement and one external ablation.

**The measurement.** Iteration 65 admitted only rules corroborated by ≥2 independent corrections:
**0 of 1,296** qualified, the arm injected nothing on all 350 questions, and the run became the
lane's noise floor. BIRD has no recurrence by construction — every question is new — so a mechanism
whose quality axis is "this claim was derived more than once" cannot be measured there. Reporting
BIRD's null as evidence about the mechanism was a category error of the same kind as comparing its
absolute EX to a leaderboard cell, and it is the one this stage retires.

**The ablation.** The τ² retail leaderboard is led by a system with our exact shape — natural-language
guidelines appended to a system prompt, no weights, no fine-tuning, no retrieval — at +10.0pp
`pass^4` (57.5 → 67.5), with 31 support-counted guidelines out of 292. Two numbers separate it from
R51's store: it holds ~5 items per learning task against our 0.50, and it keeps only guidelines
derived from ≥3 distinct tasks. Neither difference is about position, register, retrieval or the
prompt; both are about what the store contains.

| Lane | Role | What may be quoted from it |
| --- | --- | --- |
| **τ² same-domain** | product evidence | paired `pass^4` with its interval, its MDE and its resolution; store-side counts (items, support, register share) |
| **BIRD dev / train** | hostile case | the negative delta and its exchange-rate arithmetic, and nothing else; never an absolute EX beside a leaderboard row |
| **τ² cross-domain** | transfer | only as a transfer reading, never as product evidence |

### The queue, in order, with what each one can decide

| # | Registration | Question | Decision it can carry | Status |
| --- | --- | --- | --- | --- |
| 1 | **R54** same-domain | does the distiller's condition name the request, at 12% coverage? | whether the write path is the defect | **read** `42438746694`: write path works (20/20 conditions, 1,951/1,951 served, 1.417 items), coverage **8.33% vs 12%**, paired **+5.26pp `UNRESOLVED`** (resolution 20.27pp) |
| 2 | **R56** register | is the trigger decided by the form the distiller is asked for? | whether the 8.33% is a vocabulary defect | **registered**, dispatchable |
| 3 | **R55.0** material | does any claim recur? `supportTasks` on the store sample | whether support can exist here at all | rides on R56's dispatch, no treatment |
| 4 | **R55.1** material | does admitting at support ≥3 change the pack and the register? | the mechanism reading; `pass^4` reported, underpowered by construction | registered, conditional on 3 |
| 5 | **R53** note levels | does a licence to disregard a rule recover what the rule costs? | the reader-side variable, on whatever the store holds | registered; header repaired before dispatch |
| 6 | **U6b** write admission | does deciding at write time (add/update/noop) beat appending? | the write-side architecture | built, unregistered |

**Why material comes before the note.** R53 measures what a model does with a pack; R55 measures
whether there is a pack. With 16 items and 1.22 served per request, the second question dominates,
and a note that improves the reader of a thin store would be a result about a store nobody has.

### The instrument debt this stage carries, in priority order

| # | Item | Why it is not optional |
| --- | --- | --- |
| P0 | **`tau2-driver.ts:757` sizes the τ² distiller at a bare literal 1200** | The BIRD lane's equivalent was `3000 : 2000` at a call site, unrecorded and uncoupled from the regime, and it produced 572 failed distillations in R84. The τ² lane's number is smaller, is not in the artefact at all, and is the budget R56 is currently running on. The fix waits for R56's `distillFailed` count: if it is zero the number was not binding and the change is naming plus recording, if it is not the change has a measurement attached |


| # | Item | Why it is not optional |
| --- | --- | --- |
| P0 | `instrumentFunnel` + `V0-instrument-ready` | the three zero-store defects (`INTERPRETER_PRODUCED_NOTHING`, `ADMISSION_REJECTED_ALL`, `SCOPE_UNREACHABLE`) currently report as one number; four of the six checks already exist, the closure does not |
| P0 | `eval:prior` exits 2 when it has no pool | done 2026-11-08: the command that prices the only positive axis had no failure mode and no input |
| P1 | coverage assertion over a fresh run, both lanes | 13 supplyable / 2 informative is a fact about the lane, and nothing checks it; three places reported 9/30 for a table that says 13/26 |
| P1 | BIRD index and `docs/GATE-COVERAGE-MATRIX.md`, generated | BIRD fires 10–11 of 39 gates and has never said why the rest are absent |
| P2 | `capture/experiment.ts` + online protocol, verdict `built, unrun` | the causal quantity is unidentifiable offline; a host needs exact assignment and a CUPED covariate or it will run an unpowered experiment. No host has run it, so it can carry no claim |
| P2 | store-level poisoning set: progressive, contradiction flood, vocabulary smuggling, adaptive | the four attacks a store can suffer; AgentDojo's tool-output injection is a surface this library does not have |

## S3 — SOTA push (frozen 2026-11-08)

Only if S2 replicates. Requires a preregistration (frozen protocol, frozen prompts, frozen sample)
before the run, and a result that beats the published best *under the same protocol* — not a different
split, not a different metric.

**Frozen rather than scheduled, and the reason is not the four negative readings.** S2's own rule is
that S3 does not start until S2b's direction replicates, and it has not: +4.79pp fell to +2.05pp at
p = 0.250. But a stuck gate is not a reason to rewrite the gate, so the two arguments that actually
retire it are structural.

1. **The comparison is against systems the design excludes.** The published BIRD cells at 73–83%
   carry a fine-tuned generator, five to twenty-one heterogeneous candidates, a trained selector and,
   in one case, Oracle Knowledge. `TECH-DESIGN §2` lists every one of those as a non-goal. A gate
   that can only be met by abandoning the constraint the project is built on is not a goal; it is a
   different project wearing this one's name.
2. **The mechanism the gate would need is now known, and it is not a benchmark score.** S2c and R55
   moved the question from "which arm wins" to "does the store contain anything that recurs": 0 of
   1,296 BIRD rules were ever derived twice, so the quality axis this project claims cannot be
   measured on that corpus at all. Leading a leaderboard and having a mechanism that works are two
   different achievements, and the second one is the product.

What replaces it is not a smaller version of the same ambition. It is S2c: a lane whose workload
repeats, where the store can be dense enough for the mechanism to exist, measured by the same
protocol and reported with the same intervals — and never called a leaderboard entry.

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
damage.

**Cost.** 2,490 calls, 22 minutes, 1 retry, 0 timeouts; every gate pass. `pnpm check` — 1,889 tests, 104
files, coverage 99.98 / 99.61 / 100 / 99.98; `probe-pair.ts` 100 on all four dimensions.

### R15 — the pair keeps what it was shown and loses what it was not (2026-10-31)

**Why.** R14 left one measurement unspent. A store that reproduces 47.97% of its own corrections is
either knowledge or a longer lookup table, and the instrument that distinguishes them is R13's: point
each admitted item at a different corrected question from the same database and see whether it repairs
it. R13 ran it on the sentence and got 7.28% repair against 50% damage; it had never been run on the
pair. Pre-registration: `prereg/R15-repair-transfer.md`.

**What was built.** `full-repair-transferred` is R13's arm for the second substrate. `transferGates`
holds both substrates to the same four checks with the ids as arguments (V39–V42 beside
V15/V16/V17/V33), because a repair measured by a lighter rule cannot be set beside a rule.
`transferArtefact` returns a typed projection that the gates read through `transferGateInput`, so the
file and the gates cannot disagree. Both transfer arms now request their own probe —
`full-transferred` had been consuming one that only `full-verified` paid for, which would have made a
transfer-only dispatch `none` under a second name.

**Reading** (350 questions, 5 folds, 3,298 calls, dispatch `41175676367`):

| | sentence | pair |
|---|---|---|
| reproduced its own corrections | 29.73% | **47.97%** |
| trials / informative | 416 / 366 | 416 / 354 |
| repaired | 23 (6.28%) | 22 (6.21%) |
| `break_rate` | 0.600 | 0.516 |
| `net_pp` | −1.68 | −2.40 |
| items left after both gates | 10 of 622 | 19 of 350 |
| arm | `full-transferred` 54.00% | `full-repair-transferred` 53.71% |

Substrate pair, re-measured in the same run: 296 paired, **+18.24pp, p = 1.83e-11**. `full` was 51.71%
against 53.71% — −2.00pp, p = 0.3105.

**The refutation clause fired.** 6.21% against 6.28% is a tie: 0.07pp on 720 informative trials, smaller
than the standard error of either rate. An 18pp advantage in reproduction buys nothing in transfer, so
the two properties are separate in both directions. Two things survive: the pair's break rate is lower
in both dispatches that measured it (0.516 vs 0.600; 0.304 vs 0.509), and both nets are negative here.
**Four content forms are now inert within ±3pp and the extraction axis is closed.**

Two instrument defects were found by the first dispatch, which measured every fold and then refused its
own artefact: V17 compared a two-decimal publication against exact arithmetic to 1e-9, and V14/V38
reported zero pack changes for a probe whose arm was not named. Both were fixed before the second
dispatch; the facts that exposed them are in the prereg's Outcome.

**Consequence.** The only effect left to explain is the delivery's: `full` is negative in both
dispatches and every arm that injects fewer items sits above it. R16 measures the dose in both
directions.

**Cost.** 3,298 calls, 20 minutes, 1 retry, 0 timeouts; every gate pass. `pnpm check` — 1,891 tests, 104
files, coverage 99.98 / 99.61 / 100 / 99.98.

### R16 — the harm is at the first item, and no budget can fix it (closed 2026-10-31)

**Why.** R15 closed the extraction axis. The store is injected at 1.78 items per question, `full` is
negative in both dispatches that measured it (−2.00pp, p = 0.31; −3.71pp, p = 0.02), and every arm that
injects fewer items sits above it. The pack layer adds whole items, and this store renders one at 500 to
824 characters, so the existing dose arms — 150, 300, 600, 900 — are `none`, `none`, one item and one
and a half: every dose experiment this project could have run would have found that harm shrinks as the
pack empties, which is true by construction. `chars-1800` and `chars-2400` make the axis 0, 1, 2, 3, 4
items so that harm can be tested as a function of quantity rather than only recovered at the empty end.

**Prediction** (`prereg/R16-injection-dose.md`): the curve falls as the dose rises, `chars-600` is
within ±2pp of no memory, `chars-2400` is below it, and no point beats no memory by 2pp or more. The
literature predicts the shape: the distractor-count bound makes the loss steep while N is small and flat
after, and UTILMEM measures the largest loss in the first two to eight distractors.

**Refutation.** Flat across 600–2,400 means quantity is not the variable and the next iteration is
relevance or framing (R17) rather than a budget; rising with the dose means the negative cells were
dispatch artefacts and the next measurement is a gate that keeps enough items to matter.

**Reading** (350 questions, 5 folds, 2,263 calls, dispatch `41177896801`, `none` at 54.00%):

| Arm | Items | Characters | ACC | Δ vs `none` | gained / lost | p |
|---|---|---|---|---|---|---|
| `chars-600` | 0.29 | 168 | 54.00% | **+0.00pp** | 4 / 4 | 1.0000 |
| `full` (1,200) | 1.83 | 1,080 | 51.43% | −2.57pp | 8 / 17 | 0.1078 |
| `chars-1800` | 2.97 | 1,649 | 50.00% | **−4.00pp** | 6 / 20 | 0.0094 |
| `chars-2400` | 4.16 | 2,212 | 51.14% | −2.86pp | 11 / 21 | 0.1102 |
| `none-replica` | 0 | 0 | 52.57% | −1.43pp | 1 / 6 | 0.1250 |

**The registered instrument prediction failed, and that is the finding.** `chars-600` is a one-item cell
on 100 of 350 questions, not on 70% of them: the pack layer takes rank order and stops, so the pack is
empty wherever the top item renders past 600 characters. The cell is 71.4% control, and its interval
[−1.43, +1.71] admits a per-item effect anywhere in ±5–6pp, so *the store is harmless at one item* could
not be tested here. Iteration 86's `chars-900` — exactly 1.00 item per question, on a store whose `full`
cell is within 0.6pp of this one — cost **−3.14pp**. With it, the curve is a step: +0.57 at 0.27 items,
+0.00 at 0.29, −3.14 at 1.00, −2.57 at 1.83, −3.14 at 1.87, −4.00 at 2.97, −2.86 at 4.16.

**The refutation clause fired by a door the file did not name.** No point beats `none`, the whole spread
is 4.00pp — this sample's own minimum detectable effect — and everything above one item sits within
1.43pp across a fourfold range of injected text. Quantity is not the variable above the first item, so
the next measurement is not another budget: a budget that admits anything already costs what the default
costs.

**The floor moved against this run.** The replica is 1 gained and 6 lost — seven discordant questions,
the first clearly negative one on record, against 3 in iteration 86. Everything at or below seven flips
is noise here, which includes the 600 cell's eight, and every delta in the table overstates the harm by
up to 1.43pp.

**One instrument defect, in this stage's own paperwork.** The prereg header shipped with R15's seven
transfer gates, which a dose arm set cannot emit. `preregGateAgreement` and a fourth claim in
`bin/protocol.ts` now compare a header against the artefact that names it, in both directions, for every
committed artefact.

**Consequence.** A budget cannot be the fix, so the work moves to the item: which one is retrieved
(a selection rule rather than truncation) and how it is said (R17). The default budget's cost is now the
mean of four disjoint dispatches — −3.71, −3.14, −2.00, −2.57pp — **−2.86pp**, all four negative.

**Cost.** 2,263 calls, 1 retry, 0 timeouts, 0 call failures; ten gates pass. `pnpm check` — 1,897 tests,
104 files, coverage 99.98 / 99.61 / 100 / 99.98.

### R17 — does permission to ignore the note recover what the note costs? (closed)

**Why.** R16 removed the last structural explanation. The loss is complete at the first item, so no
budget can recover it, and content, substrate and dose were all closed with a sign of zero or below. What
had never been varied is the pack's *standing*: the notes arrive as reference data from an authority the
model did not ask for, carrying no statement that they may not apply. MemTrapBench's mitigation is an
inference-time instruction, not an architecture change, which is the cheapest published lever left.

**Arms.** `full-advisory` (one sentence beside the unchanged pack), `none-advisory` (the same sentence,
no pack, so a recovery is attributable), `full-prohibitive` (the same facts classified as recorded errors,
the trauma mechanism run forward), `none` and `full` as controls.

**Result** (`prereg/R17-framing.md` Outcome, dispatch `41185616121`). The registered refutation fired:
`full-advisory` is **−0.57pp against `full`** with an interval of [−3.14, +2.00], under the pre-registered
+2.5pp bar. Permission is not the channel. Two further numbers came with it: the sentence costs
**2.00pp on its own** (`none-advisory`, p = 0.0923), so in this prompt words cost about what the note
costs; and the error register moves the cell by 0.57pp against the advisory one, so what the block says
about itself is not what makes it expensive. `full` was negative again (−4.00pp, p = 0.0201), the third
time that cell has been significant on its own.

**Instrument.** `V43-framing-delivered` counts per arm and per fold how many prompts carried the framing
the arm declares, and fails in both directions. It reported `0/350` for the two reference arms and
`350/350` for each of the three that declare a standing.

### R18 — the one positive result has never had a control (closed)

**Why, and why it is not selection.** R17's refutation named selection as its successor, and R16 cancels
it: the loss is complete at the **first** item, so choosing *which* item arrives cannot remove a cost the
first item already incurs. What the record does support is the opposite shape — the note as an objection
to a draft the model has already written — which is the only mechanism here with a positive sign:
`full-anchored`, **+2.86pp against `full`** pooled over 700 questions (McNemar p = 0.0205, 24 lost and 44
gained), and indistinguishable from no memory in the run that measured it.

**And that number has never been controlled.** `full-anchored` was measured against `full`, never against
a second pass with no pack. The project already knows what that omission costs: at retry, once
`retry-blank` existed, the note's contribution was **zero**, and `retry-keyed` — the right note by the
right key at the right moment — was identical to the blank retry question for question.

**Arms** (`prereg/R18-anchored-control.md`). `full-anchored` (incumbent), `anchor-blank` (the same draft,
the same revision request, no pack and no instruction about one), `full` and `none` as the run's anchors
to its own baseline.

**Prediction.** `anchor-blank` above `none` (+1 to +3pp); `full-anchored` − `anchor-blank` ≥ 0;
`full` negative, around −3pp.

**Refutation.** `anchor-blank` within 1pp of `full-anchored` while both sit at or below `none` means the
+2.86pp was neither the note nor the second pass, and the record's only positive sign is demoted in that
commit. `full-anchored` 2pp below `anchor-blank` means the note hurts even as an objection to a draft.

**Resolution.** This lane separates about 3pp on a paired difference, which is the size of the gap between
the two outcomes the iteration distinguishes; a null on both revision arms is pre-registered as
"inconclusive at this n", not as "no effect".

**Result** (`prereg/R18-anchored-control.md` Outcome, dispatch `41188122217`). The first prediction is
refuted and the refutation is the finding:

| Arm | Items | ACC | Δ vs `none` | 95% CI | gained / lost | p |
|---|---|---|---|---|---|---|
| `anchor-blank` | 0.00 | 50.00% | **−4.00pp** | [−7.43, −0.57] | 12 / 26 | 0.0336 |
| `full-anchored` | 1.85 | 54.00% | **+0.00pp** | [−1.71, +1.71] | 4 / 4 | 1.0000 |
| `full` | 1.85 | 53.43% | −0.57pp | [−3.14, +2.00] | 10 / 12 | 0.8318 |

A blind revision — the same draft, the same request, nothing added — costs **4.00pp**, one sign in all
five folds. The anchored cell sits at *exactly* no memory, and its paired difference over that control is
**+4.00pp** (27 gained, 13 lost, p = 0.0385). So the record's only positive mechanism is a repair, not a
gain, and against `full` in the same run it is +0.57pp rather than the pooled +2.86pp — those dispatches
priced it against a `full` that was itself costing −4.00pp. `full` also broke its own streak at −0.57pp
(p = 0.8318), the first of six draws at the shipped budget not distinguishable from zero.

`anchor-blank` lacks the block *and* the clause that tells the model the draft may stand, and this design
cannot separate them. That ambiguity is R20.

### R19 — the mechanisms the literature has and this record does not

Three published mechanisms remain untried, and each changes *when* or *whether* knowledge arrives rather
than *how it reads*, which is the axis every closed iteration here has in common (COMPETITIVE.md §3
carries the evidence grading):

1. **Reconstruction** (MemHarness, arXiv 2607.28272) — the model critiques the retrieved experience
   against the current context and rewrites it into a directive before answering. The inference-time half
   needs no training. Blocked by R17's second finding: a paragraph of prompt cost 2.00pp, so any
   reconstruction arm pays that toll before it can earn anything.
2. **Utility clearance** (MeClear, arXiv 2609.09115) — query-scoped suppression of memories whose
   measured downstream utility is negative, decided from outcomes rather than from item attributes. This
   is the only candidate that adds **no** prompt text, and the `sample-*` and pool machinery already
   collects the signal it needs.
3. **Adaptive injection** (ε-MemEvo, arXiv 2608.12522) — whether to inject at all, and how strongly, as a
   property of the moment rather than of the item. Its ablation is the sharpest published statement of
   this project's own failure: naive injection fails catastrophically, gated injection is safe.

**Blocked on.** Nothing now; R18 resolved the branch. It did not resolve it the way either branch
expected: the note earns nothing above no memory at anchor, but it does earn +4.00pp over a blind
revision, and that gain is indistinguishable from a licence to stop. Both remaining candidates change
*when* knowledge arrives rather than *how it reads*, and R20 (below) tests the licence before either is
built, because a mechanism that adds a sentence now has a measured price and a measured credit.

### R20 — the square: is the permission the ingredient, or the block? (closed)

**Why.** R18 put the anchored cell on the control it never had and the control was worse than the
mechanism: a blind revision is 4.00pp below no memory, the anchored cell is at exactly no memory, and the
paired difference is +4.00pp (p = 0.0385). That leaves two things varying at once. `anchor-blank` lacks
the block *and* the block's closing clause — "if none applies, return the first attempt unchanged" —
which `anchorPromptFor` deletes with the block because an instruction about an absent block is a
different question. The clause is the only text in the anchored prompt that speaks about the draft rather
than about the note, and it is the most plausible carrier of R18's number.

**Arms** (`prereg/R20-anchored-hold.md`). Four cells, one store, one budget, all writing twice:

|  | conservative clause | permissive clause |
|---|---|---|
| **block** | `full-anchored` | `full-anchored-hold` |
| **no block** | `anchor-blank` | `anchor-hold` |

**Instrument.** `AnchorMode` gains `hold`, whose instruction is addressed to the draft and therefore
renders on an empty pack; the other two modes stay suppressed there. One predicate, three arms, no new
gate.

**Prediction.** `anchor-hold` at or above `anchor-blank` by 3 to 5pp (the confirmatory claim);
`full-anchored-hold` within ±2pp of `full-anchored` (the product claim — if the block already carries its
own licence, the extra sentence is decoration and is dropped); the interaction reported with its interval
and not tested, because four cells at 350 questions do not give this lane the resolution for one.

**Refutation.** `anchor-hold` within 1pp of `anchor-blank` means the permission is not the ingredient and
the block alone is worth +4.00pp — the first positive reading for memory *content* in this record, and one
that would be re-dispatched before anything is written about it. `anchor-hold` 2pp *below* `anchor-blank`
means words cost more than the harm they repair, which closes the prompt-intervention family and leaves
utility clearance (R19.2) as the only untried mechanism.

**Resolution.** The paired `anchor-hold` − `anchor-blank` is the only cell that gets a verdict; R18
resolved 4.00pp with 40 discordant pairs.

**Result** (`prereg/R20-anchored-hold.md` Outcome, dispatch `41190894667`). `none` 54.57%, `full` 50.29%
(−4.29pp, p = 0.0107):

| | conservative clause | permissive clause |
|---|---|---|
| **block** | `full-anchored` 53.43% (−1.14pp) | `full-anchored-hold` 52.86% (−1.71pp) |
| **no block** | `anchor-blank` 50.57% (−4.00pp) | `anchor-hold` 52.57% (−2.00pp) |

The clause is worth **+2.00pp** with no block (15/8, p = 0.2100) and **−0.57pp** with one (7/9,
p = 0.8036): an interaction of **−2.57pp**, the opposite sign to the prediction. They are **substitutes**,
not complements — `full-anchored`'s conservative instruction already ends with a licence to stop, so an
explicit one is redundant where a note is present and is the only licence where there is none. The
registered product criterion fired: the extra sentence is inside the ±2pp band and is **dropped**. The
blind revision reproduced to the question (−4.00pp, 12/26, 38 discordant, p = 0.0336), and over both
dispatches the block is worth **+3.43pp against it** (53 gained, 29 lost, 700 pairs, p = 0.0106). The
content half, `full-anchored` − `anchor-hold`, is +0.86pp and untestable at this n.

### R21 — utility clearance, because the deficit is not made of words (closed — refuted, and the refutation is the finding)

**Why.** Every prompt-level lever has now been measured, three of them twice: content, substrate, quantity,
position, framing, and the delivery order with and without a licence. No cell in either square reaches no
memory; the best is `full-anchored` at −1.14pp, and the parts of its effect are about two points of
permission and about one of knowledge. R17 measured a paragraph at 2.00pp, R20 measured a sentence at
−0.57pp where another already existed, and the two together say the same thing: **the next mechanism has
to add nothing to the prompt.**

**The mechanism.** MeClear (arXiv 2609.09115) decides *per query, from outcomes*: attribute the retrieved
set's contribution (cooperative Shapley over the pack), screen each item by leave-one-out utility, and
suppress the ones with negative downstream utility for this question only. Every gate in this project is a
property of an item decided before the question arrives; this is a property of the pair decided from what
happened. The `sample-*` arms and the candidate pool already collect the signal it needs.

**Sketch, not a registration.** The lane already runs a per-question pack; the arm would record, for the
candidate pool, which items were in the pack when an answer was wrong and which were in it when an answer
was right, and drop the items whose credit is negative before the pack is rendered. Two arms follow: the
clearance arm and a shuffle control that drops the same *number* of items chosen at random, because
"fewer items" is not "better items" and R16 already showed the difference is worth 1.43pp at most.

**Gate.** Same eleven, plus the existing `V1-pack-not-empty` floor restated for a shrunken pack: a
clearance arm that empties its own pack has measured `none` under a second name.

**Built and dispatched (2026-10-31).** `prereg/R21-clearance.md`; arms `full-cleared` and
`full-cleared-sampled`; dispatch `41203470612`. What changed from the sketch above, and why:

1. **The control is an arm, not a footnote.** `full-cleared-sampled` drops the same number of rules from
   the same pack, uniformly and seeded, retrieval order preserved. Without it the delta is dose as much
   as content.
2. **The clearance is a minority drop, not an admission filter.** A rule is removed when its record shows
   **more harms than helps**; a rule with no record is kept. Admitting only what was measured to help is
   what `full-verified` does, and it leaves 0.44 items per pack — a dose experiment wearing a filter's
   name.
3. **The credit is measured on learn rows, per rule, by counterfactual**, and `validateMemory` now returns
   that record instead of deleting from it: the arm that names deletion does the deleting, so a run that
   asks for clearance alone leaves the store alone and `full` still means what it meant before.
4. **`V45-clearance-dose-matched` is the new gate**, and it is the one thing standing between this pair
   and an inference this record has already had to withdraw once. It fails the run when any question's
   two arms carried a different number of items, or when no question's pack changed at all — and it reads
   **post-budget** counts, because `makePack` admits whole items and two packs with the same survivors can
   render a different number of them.
5. **The reading is fixed in advance.** Confirmation needs `full-cleared` above the control by 1–3pp; a
   difference within ±1pp with an interval excluding +1pp means the utility score carries nothing at this
   store size, and the next iteration changes the object instead of the filter (R22).

**Result (2026-10-31).** `full-cleared` − `full-cleared-sampled` = **+0.00pp** (6 gained, 6 lost, 12
discordant, exact McNemar p = 1.0000): the registered refutation clause fired and this lane **stops
attacking selection**. Both clearance arms sit at 51.71% on 1.51 items (−2.29pp, p = 0.2005 / 0.1849) and
`full` at 52.00% on 1.83 items (−2.00pp, p = 0.2810) against `none`'s 54.00%. `V45` passed on dose (0
mismatched of 350) and reported **311 identical packs**: on 88.9% of questions the two arms rendered the
same prompt, because a control matched on item count is degenerate on single-item packs — where the
clearance removed the only item, the control had only that item to remove, so the pair coincided exactly
where the treatment acted most strongly. The pair therefore differed on 39 questions and split 6–6, and
the registered 3pp resolution was never available on 39 pairs.

The number underneath is the deliverable: the counterfactual pass found **104 decisive questions in 1,400
learn rows (7.4%)**, those credited **143 of 628 rules (22.8%)**, so **77% of the store has no
counterfactual record** and the rules that do average 1.2 comparisons. A perfect clearance could have
filtered at most 22.8% of this store; the filter was not wrong, the object gave it nothing to filter.
`V44` reported `180 unscoped, 0 widened` for the third dispatch running. Design defect recorded for any
future clearance: **dose must be matched on characters, or the comparison restricted in advance to the
questions where the packs differ.**

### R22 — the substrate goes back to raw (closed — refuted, and the control is the reading)

**Why this is the last content axis and it is not a content axis at all.** Seven axes have been varied on
one store: content (rule, repair, procedure), substrate (rule against repair, both distilled), quantity,
position, framing, delivery order, and — in R21 — membership at a fixed dose. Every one of them is a
variation *within* a distilled store, and the field has spent the last month saying that the distillation
is the thing to doubt: Raw-RAG (arXiv 2610.30755) ranks naive dense retrieval over raw history first in
six of seven benchmark-model settings and reports that **even complete access to a transformed memory store
leaves an accuracy gap against raw evidence**, because summarising and extracting throw away the relations
and dependency paths an answer has to be derived from. Our items are 500–824 characters of prose distilled
from a single correction, and the record's own attribution instrument says the content in them is worth
about +0.9pp while the harm of showing them is −2 to −4pp.

**The arm.** `full-raw`: the pack is the verbatim correction event — the question that was asked, the
query that failed, the query that fixed it — retrieved by the same recall, rendered under the same
1,200-character budget, in the same position. No prose, no interpretation, nothing phrased as a convention
for the reader to imitate. Every character is something the database actually said.

**Controls, and they are the whole design.** Three of them, because three different explanations have to be
excluded before a delta means anything:

1. **`full-raw-sampled`** — the same number of *characters* of raw event drawn from the same corrections in
   a different order, so "raw evidence is longer" is not the treatment. R16 established that the character
   budget is the axis that moves, and a raw pack will be longer per item than a rule: whatever the arms
   disagree about must not be length.
2. **`full` on the same questions** — the same corrections, distilled. This is the comparison the paper
   makes and the one this project can make on a benchmark where a correction has an exact referent.
3. **`none`** — the baseline, as always.

**What it would settle.** If `full-raw` ≥ `none` and above `full`, the memory line has been optimising the
wrong object for twenty iterations: the product is a log with good retrieval, not a lesson, and every
distillation step in `packages/core/src/distill` is a lossy convenience rather than a contribution. If
`full-raw` is not better, the Raw-RAG mechanism does not transfer to a setting where the correction's
subject and the question's subject are the same schema, and this record says so with a number — which is
worth as much, because it is the only claim in the field currently being generalised without a SQL test.

**Gate.** A new `V46-raw-is-verbatim`: every injected raw cell must be byte-present in the correction
record it claims to come from. A renderer that paraphrased would make the arm a third distiller with a
different name, and the arm's entire claim is that nothing was interpreted.

**Blocked on.** R21's result only for the interpretation, not for the build: if clearance works, raw is
run as `full-raw-cleared` instead of `full-raw` and the two questions compose; if it does not, raw runs
alone. The build itself is a pack renderer over `output`/`signal.after`, which the lane already stores.

**Result (2026-10-31).** `full-raw` − `full` = **−0.86pp** (20 gained, 23 lost, 43 discordant, p = 0.7608,
95% CI [−4.57, +2.86]); against `none` the raw arm is −3.43pp on 864 characters and the distilled note is
−2.57pp on 1,083. The registered claim was +1pp and the null clause required an interval excluding +1pp;
this interval contains it, so the iteration is **neither confirmed nor refuted in the registered terms** —
it is an underpowered panel measured against a claim smaller than its own resolution (±3.7pp at 350
questions).

The clause that fires is the control clause: **`full-raw` sits 1.43pp below `full-raw-shuffled`** (19/24,
p = 0.5424, CI [−5.14, +2.29]), so the subject of the correction does not matter and the arm measured form,
length and vocabulary. All three text arms are indistinguishable (largest pairwise difference 1.43pp,
every p > 0.54) and all three sit 2.0–3.4pp under no memory; pooled over 1,050 arm-question cells, showing
any text costs **−2.67pp at exact p = 0.0091** — exploratory, and the first significant number in this
line.

The first dispatch (`41205745555`) is recorded as an instrument failure, not a result: `V46` reported
`1103/1632` on a fully verbatim payload because the check split the payload into lines and the `Attempt:`
field is multi-line SQL. The unit is now the block, which is strictly stronger than what was registered,
and the gate prints the span it rejected. The second dispatch (`41213200296`) passes all twelve gates with
**557/557 rendered events byte-identical** and 81 of 638 events skipped whole rather than truncated.

### R23 — the positive control this record has never run (closed — confirmed at 3× its bar)

**Why this is the question R22 created rather than the one it answered.** Every arm in this record ships
the question's BIRD `evidence` in the prompt: **142 characters on average** of curated, per-question,
human-written knowledge that the benchmark itself vouches for, present in `none` as much as in `full`, on
350 of 350 questions (25 to 468 characters, median 135). The record has never removed it. Until it does,
three readings remain fused: that *text* cannot help on a task whose question already carries its schema,
that *retrieved* text cannot help because it was written for a different question, and that our text cannot
help because we write it badly.

**What changed the framing between the design and the registration.** The first version of this entry
proposed a 2pp claim. Three independent records price the same ablation far above that, which turns an
ordinary ablation into the only thing this lane has never had: a manipulation with a known answer.

| Source | System | With | Without | Δ |
|---|---|---|---|---|
| BIRD (Li et al., NeurIPS 2023) | GPT-4 | 54.89 | 34.88 | **−20.01pp** |
| Companion Agents (arXiv 2601.08838) | RSL-SQL / qwen-plus | 64.67 | 51.96 | −12.71pp |
| " | CHESS / qwen-plus | 62.14 | 47.78 | −14.36pp |
| " | DAIL-SQL / qwen-plus | 57.89 | 39.52 | −18.37pp |
| SEED (arXiv 2506.07423) | CHESS | — | — | −8.35 to −12.73pp |
| " | CodeS | — | — | −15.11 to −15.26pp |
| " | DAIL-SQL | — | — | −20.86pp |

Seven cells, four systems, three papers, two model families: **8 to 21 points, mean 15.2**, and Companion
Agents' per-difficulty breakdown gives the gradient (Simple −10.3 to −11.4, Moderate −15.5 to −18.9,
Challenging −19.3 to −20.2). No arm in this record has ever been measured without the block it removes, so
**the panel has never been shown to detect an effect of a size the field agrees on** — and every null in
twenty-two iterations rests on that untested assumption.

**The design.** A 2×2 factorial over the two blocks a prompt can carry, with the anchors already shipped:

| | + evidence | − evidence |
|---|---|---|
| **no pack** | `none` (shipped) | `none-noevidence` |
| **+ pack** | `full` (shipped) | `full-noevidence` |

1. **`none-noevidence`** — the shipped `none` prompt with `evidenceBlockOf('')` in place of the sentence.
   Planned through the same `call()` the anchor uses with one argument different, which is the whole
   guarantee that the cells differ by the block and nothing else.
2. **`full-noevidence`** — the same pack `full` carries, on the prompt `none-noevidence` sends: same recall,
   same 1,200-character budget, same position.
3. **One implementation point.** `ARM_DROPS_EVIDENCE` is the only thing the ablation touches, and
   `promptFor`, `retryPromptFor` and `anchorPromptFor` all render through `evidenceBlockOf`, so there is one
   place a label could drift and one place a check can look.
4. **`V47-evidence-ablated`**, blocking, reads the prompts that were sent: it fails if a shipped arm missed a
   question that had a sentence, if an ablated arm carried one anyway (an ablation that removed nothing is
   `none` under a second name), or if the ablation reached fewer questions than the arm it ablates.
5. **The manipulation check is not a gate.** `V3` measures `full`'s parse rate, not the ablated arms', so the
   registration carries its own rule: the effect is read as a knowledge effect only if the ablated arms
   produce SQL at within 5pp of the arm they ablate. A dangling dependency in a prompt is a different task,
   not less knowledge.

**Prediction.** `none` − `none-noevidence` **≥ 8pp**, point estimate near 12: the literature's low end rather
than its mean, because this model reasons better than 2023 GPT-4 and `minidev` is a different slice. The
effect is **larger on harder questions** — a prediction about the shape, not the size, so it is a second
independent way for the run to be wrong. `full-noevidence` is still below `none-noevidence`, because the
pack's 2–4 point cost is not something a smaller prompt removes.

**Resolution, computed before the run.** The audit's rule from R22 is applied rather than discovered: a
claim must exceed `1.96·sqrt(discordant)/n`. For a 10pp effect at n = 350 that is ~35 flipped questions; the
literature's asymmetry puts b ≈ 40 and c ≈ 5, so discordant ≈ 45, standard error 1.92pp, half-width
**±3.8pp**. **The confirmatory claim is therefore ≥8pp** — 2.4 standard errors — and the interaction
`(full − full-noevidence) − (none − none-noevidence)` is secondary, read only if the main effect clears 8pp,
with a bar of |DiD| ≥ 4pp and a bootstrap interval excluding zero.

**Refutation, with an ordering the record commits to now.** If the ablation lands within ±1pp with an
interval excluding +1pp, a manipulation worth 8–21 points is invisible here, **the panel is the finding,
every null above it becomes unreadable**, and the next iteration rebuilds the panel rather than building
another arm. If the ablation is *above* `none` by ≥2pp with an interval excluding −1pp, the baseline every
published number was measured against has been costing points and the whole line has to be re-anchored at
`none-noevidence`. If `V47` fails, the run is not read. If the parse rate moves by more than 5pp, the effect
is not attributable to knowledge.

**Result (2026-11-01).** `none` 54.57% (191/350), `none-noevidence` 29.71% (104/350): **+24.86pp**, 96 gained,
9 lost, exact p below 1e-4, CI [19.71, 30.00]. Registered bar was ≥8pp with a point estimate near 12, so the
panel is **three times more sensitive than the record asked it to be**, and the refutation clause that would
have retired the instrument does not fire. `full` 49.71% (174/350) is −4.86pp against `none`, p = 0.0076.

The prediction the run refuted is the mechanism. `full-noevidence` was registered to remain below
`none-noevidence`; it is **+1.14pp above it** (13/17, p = 0.5847), the first non-negative cell in the record,
against **−4.86pp for the same pack on the unablated prompt**. The interaction — pre-declared, read only if
the main effect cleared 8pp, with a |DiD| ≥ 4pp bar — is **−6.00pp [−10.57, −1.71]**: the pack absorbs
**24.1%** of the hint's value. **The deficit was a competition, and the competitor was the benchmark's own
curated sentence.**

Unresolved and recorded as such: the difficulty-shape prediction (moderate +25.00 at n=248, challenging
+24.51 at n=102 — 0.49pp apart, and no simple questions exist on this panel), and whether the +1.14pp cell
survives a second observation. A new instrument fact: the anchors moved between dispatches (`none` 54.00 →
54.57, `full` 51.43 → 49.71) because the store is rebuilt by a live distillation pass each time, so
**cross-dispatch cells carry one to two points of store variance** and a cross-dispatch delta under two
points is not a result.

### R24 — the same 2×2 on the split every comparison was measured on (**closed** 2026-11-01: composition, not inflation; the competition mechanism withdrawn)

**Why the database question is not the next one.** R23's headline is 24.86pp on `minidev`, and every number it
invites comparison with — 12.71 (RSL-SQL), 14.36 (CHESS), 18.37 (DAIL-SQL), 20.01 (GPT-4) — was measured on
`dev`, 1,534 questions. Minidev also drops the easiest third, so the 24.86pp is a moderate-and-challenging
estimate being quoted against whole-split ones, which is exactly the comparison this project's own
admissibility rule calls `indicative`. Three of R23's claims are weaker than its headline for that reason, and
one run fixes all three:

1. **The headline is not in the literature's units.** Moving to `dev` makes 24.86 comparable to 12.71.
2. **The +1.14pp cell is below the instrument's floor.** 13 gained against 17 lost; the direction is the
   finding and at 350 questions the significance cannot exist.
3. **The difficulty-shape prediction had nothing to test.** Minidev has no `simple` questions at all.

**The design, with no code change.** The same four cells, `split=dev`, and `learn_sample=280` so each fold
distils from exactly as many rows as it did on minidev — the store size is held and **the split is the only
difference**. `learnPool` is a prefix of a list already interleaved across databases, so the sample covers
every database rather than whichever one sorts first. Full learning on dev would be ~12,000 calls and would
confound the split with a memory four times larger.

**Resolution, computed before the run.** At R23's measured discordance (105 and 94 of 350), the scaled paired
half-widths on 1,534 questions are about **±2.7pp** for both the main effect and the interaction, against
±3.8pp and ±4.4pp on minidev. That is what makes a **≥2pp** claim on `full-noevidence − none-noevidence`
registrable at all; on minidev it would have been below the floor, which is the error this record made twice
in R21 and R22.

**Prediction.** Main effect ≥8pp with the interval containing 24.86 — falsifiable in both directions, since a
dev interval that excludes 24.86 means minidev inflated it and dev becomes the headline. The pack's value
without the hint **≥2pp**, the first testable statement of the cell that reversed the record's conclusion. The
interaction **≤ −4pp**. And the effect **rising across three difficulty levels**, with `simple` between 5 and
15pp and `challenging` between 18 and 30pp.

**Refutation.** A main effect below 12pp with an interval excluding 24.86 demotes the headline to a
moderate-and-challenging estimate and moves every cross-system comparison to dev. A pack effect below zero
with an interval excluding −2pp withdraws the claim that a note *pays* anything — the product switch survives,
because a null is still not a cost, but the +1.14pp cell becomes noise. An interaction whose interval contains
zero demotes the competition reading from a mechanism to a single-run observation, and that outcome would send
the line back to selection work rather than forward. A flat gradient across three levels drops the difficulty
story instead of leaving it as a caveat. A run truncated by the deadline before five folds is read as partial
and makes no confirmatory claim.

**Amendment 1, and the two hours it cost.** The first dispatch (`41226847922`) ran this design exactly as
written and published nothing: last progress line 19:17:48, step timeout 21:15:44, 3.4 hours and ~4,100 calls
for an empty directory. The judging phase executes every statement the model wrote through a synchronous
driver, so a slow statement stopped the process inside a native call where neither a timer nor the lane's own
deadline could run; the log localises it to the gap between each fold's evaluation and its fold line — 5.8,
63.2 and never minutes. Every statement now runs in a child process with a 20 s deadline and a 10,000-row cap
(a worker thread takes 50.5 s to die inside the driver, a child takes 0 ms), `V48-statements-answered` is
blocking at a 1% deadline share, and judging prints every 200 plans. Nothing about the design, arms, sample or
predictions changed, and nothing was read from the failed dispatch.

**Outcome (dispatch `41245819288`, 32 minutes, 13 gates, 0 failures).** `none` 57.43%, `none-noevidence`
39.83%, `full` 56.84%, `full-noevidence` 40.55%. Evidence without the pack **+17.60pp [15.38, 19.82]**
(315/45); with the pack **+16.30pp [14.14, 18.58]** (300/50); the pack **+0.59pp** with the hint and
**−0.72pp** without it, neither interval excluding zero; the interaction **−1.30pp [−3.06, +0.46]**.

Four of the five registered predictions resolved, two of them against the registration:

| prediction | bar | read | verdict |
|---|---|---|---|
| main effect ≥8pp | 8pp | +17.60 | **held** |
| interval contains 24.86 | contain | [15.38, 19.82] | **falsified** |
| pack without hint ≥2pp | 2pp | −0.72 | **falsified** |
| interaction ≤ −4pp | −4pp | −1.30, CI contains 0 | **falsified** |
| effect rises across three levels | monotone, 5–15 / 18–30 | 14.05 / 22.63 / 24.14 | **held** |
| `none` within 50–58% | band | 57.43 | **held** |

**The falsification of 24.86 is a composition, and it takes the registered explanation with it.** Restricted to
the mixture minidev actually keeps — moderate and challenging, n = 609 — the same dispatch gives **+22.99pp
[19.21, 26.77]**, which contains 24.86. `925/1534 × 14.05 + 609/1534 × 22.99 = 17.60` exactly. So minidev never
inflated anything; it described a different population. **17.60 is the whole-split number and the only one
admissible in a cross-system comparison; 22.99 is the moderate-and-challenging number; 24.86 stays R23's
estimate on its own population.**

**The interaction's own refutation clause fired.** The registration said an interval containing zero would
demote the competition reading from a mechanism to a single-run observation and send the line back to selection
work rather than forward. It does. **The pack is null in both conditions** — the +1.14pp cell that reversed this
record's conclusion in R23 does not replicate at 4.4× the sample — and the deployment switch survives as
inertia rather than as a penalty.

### R25 — the substitution design is withdrawn; the selection question replaces it (redesigned 2026-11-01)

**What R24 removed.** R25 was designed on R23's conclusion that the pack's cost was a *competition* with the
curated sentence — a retrieved note losing, by 24.1%, a job the benchmark already does for free — and its
question followed directly: if the note cannot win that competition, can the database supply the same value
instead? **On 1,534 questions the competition is not there.** The interaction is −1.30pp with an interval that
contains zero, and the pack is +0.59pp with the hint and −0.72pp without it. R24's refutation clause fires:
substitution is a single-run observation at n = 350, not a mechanism. **The design below is therefore archived
rather than queued** — it answers a question whose premise no longer holds, and re-registering it would spend a
dispatch to explain a −6.00pp that 4.4× the sample does not reproduce.

**What replaces it, and why selection is the only line still carrying evidence.** Every axis the pack has been
varied along — substrate, dose, framing, ordering, scoping, clearance, and now competitor presence — has come
back null, which leaves exactly one measured quantity that is not null: **the retrieval is selecting the wrong
notes**. The record already contains the evidence and has never acted on it. R13 measured that an admitted rule
repairs 7.3% of the questions that need help and breaks 50% of those that do not; R21 measured that 311 of 350
questions rendered the *same* pack, so the treatment was absent where it should have been strongest; R15
measured a tie on 720 informative trials between two substrates, meaning the content is not the axis. A null
everywhere except in *which* note arrives is a selection problem, and R24's flat interaction is what a
selection-limited store looks like: it neither helps nor hurts because it is not being used differentially.

**The question R25 now asks.** Given a fixed store, a fixed substrate and a fixed budget of one to four items,
does **per-question admission** — a decision made per question, on evidence computed for that question — beat
**global ranking** — the current order, identical for every question? The two conditions are already both
implementable: `buildPack` takes an option, and the store carries enough per-item history (R21's 77% of items
with no counterfactual record is itself part of the answer) to admit or refuse per question.

**Resolution, computed before the run.** The paired design at 1,534 questions gives ±2.14pp, and the smallest
effect worth claiming is the one R21 and R13 both failed to reach: **≥2pp**. That is now registrable, which it
was not on minidev — this is the first design in the line that R24's larger split makes *possible* rather than
merely cheaper.

**Refutation.** Per-question admission within ±2pp of global ranking closes the selection axis and leaves the
pack line with no live mechanism; it would then be recorded as a *closed* product decision (inject only where
the question carries no curated knowledge, which is now an inertia argument, not a penalty) rather than as a
research programme. An admission rule that is worse than global ranking by more than 2pp says the per-item
history is not informative and retires the counterfactual-record requirement.

**Archived: the substitution design as registered before R24.**

> **The question as it stood.** Whether R23's 24.86pp target was *addressable from the database alone*, using
> the two channels already in the lane: `valuesDdl`, which annotates columns with the values they hold, and
> `linkSchema`, which prunes the schema to the tables the question names. Both were measured only on the
> unablated prompt, where the evidence sentence was doing their job — `values` read +0.29pp (12/11, p = 1.00,
> iteration 95) and `linked` read **−7.43pp** (7/33, p < 1e-4), so the two channels have opposite histories and
> neither had been measured where the competitor is absent.
>
> **Why it waited, and why it is now withdrawn.** Its natural claims were ≤3pp for the value channel and ≈−7pp
> for the pruning channel. The first was below minidev's floor; R24 raised the floor to ±2.14pp, which would
> have made it testable — and then removed its premise, because the competition the value index was meant to
> win does not reproduce. The mechanism design, preserved: four cells (`none-noevidence`, `values-noevidence`,
> `linked-noevidence`, `none`); the linker reads the question and **not** the evidence on both ablated cells,
> because a pruner that reads the hint reintroduces the thing being ablated; `V47` covers all three ablated
> arms unchanged.

**The run, and the verdict (closed 2026-11-01).** `41256898122`, 33 minutes, 9,096 calls, 14 gates. Four arms
— `none` 57.17%, `full` 57.11%, `full-one` 56.78%, `full-accepted` 57.63% — and eight contrasts:

| contrast | pp | 95% CI | discordant | p |
|---|---|---|---|---|
| `full-one` − `full` | **−0.33** | [−1.56, +0.85] | 42/47 | 0.6718 |
| `full-one` − `none` | −0.39 | [−1.76, +0.91] | 52/58 | 0.6338 |
| `full` − `none` | −0.07 | [−1.50, +1.30] | 60/61 | 1.0000 |
| `full-accepted` − `full-one` | **+0.85** | [−0.13, +1.83] | 35/22 | 0.1112 |
| `full-accepted` − `none` | +0.46 | [−0.78, +1.69] | 52/45 | 0.5426 |
| `full-accepted` − `full` | +0.52 | [−0.85, +1.83] | 58/50 | 0.5008 |

1. **Prediction 1 refuted.** `full-one − full ≥ +2pp` measured **−0.33pp**. The 4.13pp dose effect the store
   had been reporting since R24 is **selection**: the second item went to the questions that had more to say,
   and those were the questions where any note was worth more. Prediction 2 went with it — one note alone is
   −0.39pp against nothing.
2. **Prediction 3 held, with a sign.** `full-accepted − full-one` landed inside ±2pp at **+0.85pp**, the
   largest positive point estimate any pack arm has produced and the first whose lower bound excludes harm
   above a tenth of a point. It still contains zero, and the run measured its own floor to say why: the 507
   refused questions got a **byte-identical** prompt and moved **4 gained / 3 lost** — **1.4%**, the endpoint's
   test–retest noise, measured inside the dispatch for free.
3. **Predictions 4, 5 and 6 held.** `full − none` −0.07pp (anchor stable across two stores). `V49` first run:
   1,133/1,534 prompts differ from `full`, **0 over one item**. `V50` first run: 5/5 folds `fitted`, floors
   0.111–0.200, admitted 1,027/1,534 (66.9%).
4. **The registered clause fired.** Both dose intervals contain zero → *"the pack line is closed at every
   budget … the honest record is that the mechanism is inert rather than mis-sized."* **Closed.** Product
   statement: **no pack before the question** — iteration 90's behaviour, now with a dev-scale interval.
5. **And the ceiling is arithmetic, not opinion.** MDE **2.01pp**; oracle ceilings on R24's artefact
   **+2.35pp** (drop every net-harmful item) and **+4.17pp** (keep the pack exactly where it helped). Every arm
   in the run is inside ±1pp. **A perfect oracle prices the pack at 1.17× what this split can detect**, so no
   further pack arm on BIRD dev can produce a distinguishable answer.

**What the roadmap holds now.** The pack line is closed by measurement and the instrument is the binding
constraint, so the next registered design has to change one of the two objects. **The S1a route is closed by
the benchmark's own label policy, not by our tooling**: BIRD-Interact's public files carry the hidden SQL
(`sol_sql`), the test cases and the ambiguity annotations, but the README states that ground truth and test
cases *are not distributed with the data* and must be requested by email "to avoid data leakage by
auto-crawling" — so no automated lane can score it, and its databases are PostgreSQL dumps served from
Google Drive behind a Docker environment. Three probes from this workspace agree with that reading:
`huggingface.co`, `drive.google.com` and `registry-1.docker.io` are all unreachable while `pypi.org`,
`arxiv.org` and `api.github.com` answer normally, and no mirror of the dataset resolves either.

**So the search for "where knowledge is missing" moved to a split we can score, and the first thing it found
is that the record's two *channel* arms were never powered.** `values` (+0.29pp) was decided by 23 discordant
questions and `linked` (−7.43pp) by 40, both on 350 questions whose floor is 4.87pp — one is a null that was
never measurable and the other a harm that has never been replicated, and they are the direct analogues of the
ablations competitors publish (CHESS 14.36pp column selection, RSL-SQL 12.71pp schema linking). **R26 therefore
re-measures both channels at n = 1,534 with a gate (`V51`) that certifies the manipulation actually happened**,
which is the one form of "memory changes what the model knows" this record has not tested at a resolvable
scale. If the value channel is null there and its interval is tight, the last local explanation for our own
24.86pp gap is gone and the difference has to live in candidate generation, selection or fine-tuning rather
than in the prompt.



### R26 — the two channels that change what the model knows (**closed** 2026-11-01: the pruner is a −9.26pp harm, the annotator is bounded at +1.17pp, and the prompt is not where the gap is lost)

**Why it replaced S1a.** S1a was the natural home for "measure the store where knowledge is missing", and it is
closed by the benchmark rather than by us: BIRD-Interact ships `amb_user_query`, `user_query_ambiguity` and
`knowledge_ambiguity` in its public files but **withholds `sol_sql` and `test_cases`** — the README states they
are sent by email only, "to avoid data leakage by auto-crawling" — so no automated lane can score it, and its
databases are PostgreSQL dumps behind Docker. Three probes from this workspace agree (`huggingface.co`,
`drive.google.com`, `registry-1.docker.io` all unreachable; `pypi.org`, `arxiv.org`, `api.github.com` fine).

**What R26 asked instead, and why it is the same question.** The two arms that change the prompt's *knowledge*
had each been measured once at n=350 with 23 and 40 discordant pairs, against a panel floor of 4.87pp. One was a
null that could not have been measured and the other a harm that had never been replicated, and both are the
direct analogue of the ablations competitors publish. Measuring them where they can be seen is the only form of
"where the knowledge is missing" this record can score.

**The result.**

| arm | accuracy | delta vs `none` | 95% CI | discordant | p |
|---|---|---|---|---|---|
| `none` | 57.43% | — | — | — | — |
| `full` | 57.76% | +0.33 | [−1.11, +1.76] | 67/62 | 0.72 |
| `values` | **58.60%** | **+1.17** | [−0.13, +2.48] | 64/46 | 0.10 |
| `linked` | **48.17%** | **−9.26** | [−10.95, −7.63] | 24/166 | <1e-4 |

1. **Prediction 1 held.** `linked − none ≤ −2pp` measured −9.26pp, the largest single-arm effect in this
   record, 4.5× the 2.07pp floor, interval excluding zero by 7.6pp. R21's −7.43pp was real and understated.
2. **Prediction 2's point estimate held and its interval did not, and the registered clause fired.** +1.17pp
   with a 1.31pp half-width, upper bound +2.48 — the largest positive prompt-side estimate in twenty-six
   iterations, and the clause closes the value channel as a prompt annotation because it was written on the
   interval, not the sign.
3. **Prediction 3 held.** `full − none` +0.33pp [−1.11, +1.76]: the anchor's third store, all inside one
   interval of R24's −0.07 and R25's −0.07.
4. **Prediction 4 held.** `V51` passed on its first run — `values` 100.0%, `linked` 36.4% — inside the
   registered 1–40% band, and the gate is what makes the other three readings mean anything.

**What it settles and what it closes.** The 24.86pp gap to XiYan/CHASE is **not** being lost in the prompt: the
value channel is bounded at about a point and the schema channel is nine points *negative*. The three positions
this record has measured least are the ones left — **candidate pool, selector, generator** — and the next
registered design has to be one of them. The pack line stays closed (§134), the value channel is now closed
too (§135), and `linked` is recorded as a **product rule**: never prune the schema to the named tables.

**Cost, and the pilot that paid for itself.** 28 minutes, 6,504 calls, thirteen gates. A 350-question pilot
(`41263187629`) exercised `V51` first and read 100.0% / 34.9%, which is why the gate's floors were chosen from a
measurement rather than a guess; the pilot also read `full` at −4.00pp where the registered run reads +0.33pp,
the ninth minidev pack reading that does not survive the split.

### R27 — protocol / adapter, or: the generality claim's first test (**all three stages closed**; stage 3 in R40, 2026-11-02)

**Why this replaced the candidate pool as the next experiment.** The pool's 13.95pp headroom is still the
largest unpriced gap in the record and still worth buying, but §136 found something more urgent underneath it:
**the measurement apparatus has one customer.** Thirty-one gates validate every number this project publishes,
they are called from one file, and the only second scenario in the repository wrote three of its own instead —
one of which failed and was recorded as a note. A project that asserts generality has to be able to show that a
second scenario can be measured by the same apparatus; otherwise the assertion is about module hygiene.

**The three stages, each independently green.**

| stage | work | regression test | claim it licenses |
|---|---|---|---|
| **1** | move all 39 gates + paired statistics + artefact validator + prereg into `packages/protocol`; `sota-bird.ts` imports | the 31 committed artefacts re-validated by `pnpm eval:protocol` — a behaviour change fails offline in ~1s | none; this is a move |
| **2** | define `LaneAdapter` (load / prompt / parse / score / strata); make the τ² lane implement it and replace its 3 bespoke gates with the 39 | the τ² artefact must now pass 22 gates it never saw, and `l4-resolution` becomes blocking | **the protocol admits a second scenario without editing a gate** — the generality claim, tested |
| **2** (outcome) | — | 4 gates fire, 2 vacuous, 35 absent, 9 supplyable, 30 arm-indexed; `V5-resolution` blocking and failing at 21.41pp | **the apparatus is scenario-agnostic; the gate set is arm-indexed** — the claim was narrowed, see §138 |
| **3** | move the 8 SQL modules into `eval-sql`; split `sota.ts` on the signature cut rule | coverage per dimension must not regress; four dimensions ≥ 95% | none; mechanical |

**Registered predictions for stage 2.**

1. **At least 15 of the 39 gates are evaluable on τ² without a signature change.** If fewer than 15 are, the
   "scenario-agnostic" set was miscalibrated and the cut rule is wrong — which is itself the finding, and the
   more valuable one.
2. **`l4-resolution` becomes blocking and the run fails it.** τ² at n = 68 has a 15pp half-width against a 5pp
   bar, and the whole point of making it blocking is that the run should then refuse to publish a delta. A stage 2
   that reports "39 gates pass" while the resolution gate passes too would mean the gate list was tuned to pass.
3. **No gate changes its threshold during the move.** Any threshold edited in stage 1 or 2 is a rewrite, and the
   31-artefact regression is what catches it.
4. **The τ² effect estimate does not move by more than 1pp.** The gates certify a reading, they do not produce
   one; if the delta changes materially, a gate was doing arithmetic somewhere it should not have been.

**Refutation.** If stage 2 shows that fewer than 15 of the 39 gates survive a second scenario, **the generality
claim is withdrawn from the positioning text** rather than qualified: the library would then be a
scene-specific tool with clean modules, and it would say so. If stage 2 passes, the claim upgrades from
hypothesis to a demonstrated property **of the apparatus**, and explicitly not of the mechanism — τ² remains a
null at n = 68, and no iteration may quote stage 2 as evidence that memory transfers.

**What is deliberately not in R27.** No new model calls beyond the τ² re-run, no new dataset, no new arm. The
temptation is to fold the pool question in and answer two things in one dispatch; they are separate claims with
separate instruments, and this record's three smallest effects were all produced by an instrument that had been
asked two questions at once.

**Outcome (2026-11-01, §138).** Stage 2 was run and the first prediction **fell**. The τ² lane now supplies the
shared protocol through `tau2GateAudit`, and what fires is **four gates, two of them vacuously**, with nine
supplyable and thirty arm-indexed. `V5-resolution` replaced `l4-resolution`, became blocking, and fails at
21.41pp against a 6pp bar; the effect did not move (1.4706pp before and after, same interval, same p). The
registered refutation was **applied rather than argued**: `COMPETITIVE.md` §0 and the README no longer claim that
a second scenario is measured by the same gate set. They claim what was measured — the *apparatus* is
scenario-agnostic, the *gate set* is arm-indexed — and the second claim is stronger because a reader can check it
against `packages/eval/src/tau2-gates.ts`.

Two defects came out with it and neither was on the stage's list. `ProtocolGateInput` made eight fields mandatory,
two of which are unknowable to a lane whose model runs out of process, so the second scenario could not call the
gate function at all: **the instrument was all-or-nothing and withheld four provable gates over two unstateable
ones.** All eight are optional now. And `V5-resolution` had been advisory for sixteen iterations while passing
**17 of 17** published artefacts, at 1.96pp to 4.87pp — a flag never once exercised, whose first failure case is
the case it exists for.

### R28 — is the harm at intermediate overlap? A stratification of 1,534 committed questions (**registered** 2026-11-01)

**Why this is first, and why it costs nothing.** The longest-running unexplained fact in this record is the size
of the mechanism: **+1.17pp** on the terrain most favourable to it, over 26 iterations, with one arm of −9.26pp.
The standing suspicion has been that the defect is in *what is stored and how it is used*. Four published designs
now name four different defects (COMPETITIVE.md appendix A), and one of them — MEMTRIM's partial-overlap
over-reliance — makes a **sharp prediction about a dataset already in this repository**: if it is the mechanism,
harm concentrates at *intermediate* overlap between a question and the rules it retrieved, and is small at both
extremes. Every field that stratification needs is in
`eval/results/poc-sota-bird-dev-R26-channels.json`: 1,534 rows of `correct`, `withoutMemoryCorrect`, `packIdList`,
`injected`, `coverage`, `difficulty`, `schemaTables`.

**The statistic, fixed before the run.** Overlap is `|tokens(question) ∩ tokens(rule)| / |tokens(question)|`
maximised over the rules the question actually retrieved — **outcome-blind by construction**: it reads the
question and the injected text, never a result, so the stratum cannot be conditioned on the outcome it is used to
explain. Tokens are lower-cased, stop-worded and split on non-alphanumerics; identifiers keep their underscores.
Bucket edges are fixed at `[0, 0.2)`, `[0.2, 0.4)`, `[0.4, 0.6)`, `[0.6, 1.0]`.

| # | criterion | bar | refuted if |
|---|---|---|---|
| 1 | the harm is not monotone in overlap | middle-bucket delta is the minimum of the four, by at least 1pp | the minimum sits at an end bucket → over-reliance is not our failure mode |
| 2 | the pattern survives the difficulty control | the minimum stays in a middle bucket within `simple`, `moderate` and `challenging` separately | it is produced by one difficulty band only |
| 3 | the buckets are populated | every bucket has ≥ 100 questions and ≥ 10 discordant pairs | a bucket is a direction, not a measurement |
| 4 | the reading is stable to the tokeniser | the ordering of the four buckets is unchanged under a second tokenisation (character 4-grams) | the pattern is an artefact of one tokeniser |

**What a pass licenses and what it does not.** A pass licenses **one** read-time experiment (a scope-match filter
that drops rules whose overlap with the question is below the fitted knee) and it licenses it *cheaply*, because
the filter is a pure function over a pack that already exists. It does **not** license a change to the distiller,
it does not license STRATA's contrast edges, and above all it does not license the claim that memory works: a
mechanism for the harm is not a mechanism for the benefit, and the benefit is still 1.17pp.

**Refutation.** If the harm is monotonically *increasing* in overlap — more overlap, more damage — the mechanism
is closer to Anti-Persistence's error reproduction (a confidently-retrieved wrong abstraction) than to
over-reliance, and the repair moves from the read path to the write path. If the delta is flat across buckets, none
of the four published mechanisms describes this system, and that is the finding: the record's own negative effects
would then be **noise at n = 1,534 with a 1.30pp interaction**, and the six iterations spent on prompt-side
channels were spent on a null.

**Cost.** Zero calls. One offline pass over committed artefacts, reproducible in CI, with the pre-registration
committed before the numbers are read.

**Outcome (2026-11-01, §139).** All four criteria **fail**, and the reading is refuted in sign. The four buckets
read +0.00, −0.30, +7.44 and −11.11pp: the minimum is at the *top* bucket rather than in the middle, the top two
buckets hold 139 questions between them, the `moderate` band puts its minimum at the bottom, and the ordering moves
under a character 4-gram tokenisation (`3 < 1 < 0 < 2` becomes `0 < 1 < 3 < 2`). The gap around the minimum is
18.55pp against a minimum detectable difference of 32.23pp, so even the shape that *was* observed is not a
measurement.

Two amendments were made **after** the run and are disclosed in the artefact rather than folded into this text: a
fifth criterion (`S5`, the gap must exceed its own resolution) and a ten-discordant-pair floor on `S2`. The
registration as written could be decided by a three-question cell, which is a defect of the same class §138 found
in `V5-resolution`.

What the iteration *did* establish is an elimination: across 90.9% of the corpus the overlap predicts nothing, and
the second covariate (§62's embedding similarity) points the other way. **Relevance is not the axis.** The
measurement that made that readable — the power audit of all seventeen committed artefacts — was not in the
registration and is the round's larger result: see §139 and R30.

### R29 — the τ² lane's first arm that is not a re-scoring (**stage 1 built, dispatch pending** 2026-11-02)

**Why this rather than stage 3 or the pool.** Stage 3 (moving the eight SQL modules into `eval-sql` and splitting
`sota.ts` on the signature rule) is mechanical and can be done at any time; it changes no number. The candidate
pool was bought and spent at R7.1, where four heterogeneous generators collapsed to 1.56 distinct answers and each
arm lost individually (`gen-plan` −5.43pp, `gen-decompose` −3.14pp, `m-schema` ±0.00): the 13.95pp is a ceiling
for a pool this harness cannot build, not an unspent budget. What is actually unspent is the **evidence for the
one claim §138 salvaged**: that the apparatus is scenario-agnostic. That claim currently rests on four gates, two
of which are vacuous, and none of which is the machinery anyone would worry about — the transfer gates, the
substrate comparison and the probe are the ones a sceptic would say were built for BIRD.

R29 therefore buys the cheapest arm that makes the protocol's *shared* machinery fire on a second scenario, and
it is a single dispatch with two stages.

| stage | work | the gates it makes fire |
|---|---|---|
| **1** | instrument `tau2-driver.ts` to record what the projection already reads: the split (`train`/`test`), `meanPackIds` from the facade's packs, the agent call tally, the correction bookkeeping, `domainOrigin` | `V1`, `V2`, `V8`, `V32`, `V44` — the supplyable ceiling rises from 4 to **9** |
| **2** | one **cross-domain** arm: distil from τ²-retail, answer a held-out τ²-airline slice, with the same task set scored by a memory-free reference | `V15`–`V17`, `V33` — the four transfer gates, on a scenario they were not written for |

**Registered predictions.**

1. **Stage 1 fires nine gates and no more.** If it fires ten, the projection is reading a field nobody wrote; if
   it fires eight, one of the five is not derivable from what the driver can see and the arm index is wrong.
2. **`V33-transfer-ledger` fires and `V15` passes, or the transfer machinery is BIRD-shaped.** The ledger gate
   exists because a rate was once published without its pairs; a second scenario that cannot carry one row per
   trial would mean the gate encodes a BIRD artefact format rather than a property of transfer.
3. **The cross-domain effect is a null, and this is a prediction rather than a hope.** §136 measured the
   mechanism at +1.17pp on the terrain most favourable to it, and a foreign domain is strictly harder; anything
   above +5pp would be more likely to be a leak in the split than a transfer.
4. **`V16-transfer-resolvable` fails.** Retail-trained memory answering an airline slice has few informative
   trials by construction, and the gate's hundred-trial floor is a floor, not a formality. A pass here would mean
   the floor is being cleared by trials that are not informative.

**Refutation.** If stage 2 shows that the transfer gates cannot be computed for a cross-domain τ² arm at all —
because the driver cannot enumerate the trials the gates audit — then the apparatus claim narrows a second time,
to *"the shape gates are portable and the accounting gates are not"*, and the protocol's own documentation says
so. If stage 2 produces a positive effect above +5pp, the first thing to audit is the split, not the finding.

**Cost.** One τ² environment dispatch through `sota.yml`, no new dataset, no new model family. Stage 1 is offline
and can be reviewed before stage 2 is paid for.

### R30 — what a rule does to the query, and the sample that can see it (**both stages read**, 2026-11-01)

**The premise, measured last round rather than assumed.** One of seventeen published paired deltas exceeds its own
minimum detectable difference. The mechanism's best positive reading, +1.17pp, is 61% of what its own design could
resolve (1.91pp), and that design — 1,534 questions — is the sharpest the project has. Resolving a 1pp effect at
dev's 8.4% discordance needs **6,603 paired questions**; BIRD's dev split is 1,534 and its train split is 9,428.
Every conclusion in this document about the mechanism is therefore either unreadable or about a sample too small to
carry it, and two rounds of mechanism work (R26's channels, R28's strata) have now gone into covariates that
explain nothing.

R30 is two stages, and the order matters: the cheap one first, because it can make the expensive one unnecessary.

| stage | work | cost | what it buys |
|---|---|---|---|
| **1** | classify, for every committed case, **what the pack did to the query** — an identifier imported from a rule that the question and evidence do not contain, a decision repeated that the baseline already made correctly, a table or column the rule named that the schema had pruned — by diffing `predictedSql` against `baselineSql` | **zero calls**, offline | a covariate that is not similarity, and a per-question label for the 129 discordant cases the record has never read |
| **2** | one arm at **n ≈ 6,600** on the train split, two arms (`none`, `full`), the same protocol | ~14,000 calls | a 1pp resolution at 80% power, which is the first sample in this project that could confirm or refute the mechanism at its claimed size |

**Registered predictions.**

1. **The identifier covariate separates help from harm, and it is the largest split the record has.** STRATA
   (arXiv 2610.19386) and Anti-Persistence (arXiv 2610.27406) both name the mechanism as *what the rule makes the
   query do*, not how near it is. If it does not separate, then the defect is not in the storage either, and the
   next candidate is that the pack changes the query in ways that are correct but not what the evaluator rewards.
2. **Stage 1 finds that most discordant cases have no identifiable cause in the query diff.** The 129 discordant
   cases come from 1,534 questions where the pack is 1.75 rules on average; a category called *unexplained* is
   expected to be the largest single bucket, and its size is the honest ceiling on what a per-question analysis can
   ever attribute.
3. **Stage 2 resolves the mechanism, in either direction, and the answer is not +1.17pp.** At n ≈ 6,600 the
   resolution is about 1pp; the observed discordance is 8.4%, and a re-run at that discordance will either put the
   delta outside ±1pp or put it inside — both are results. A delta that lands within 0.2pp of +1.17pp would be
   evidence that the earlier samples were unbiased rather than noisy, which is itself worth knowing.
4. **Stage 2 is not possible on the train split without a driver change, and the first thing it must do is prove
   the split loads.** The harness has only ever run `dev`; `config.split` is a string, not a validated enum, and a
   run that silently fell back to dev would report 1,534 questions under a train-split name. **This is the
   prediction most likely to fail and the cheapest to check**, so it is checked before anything is spent.

**Refutation.**

- **Stage 1's identifier covariate is flat across both halves.** Then what a rule does to the query does not
  explain the effect either, and the honest position becomes: this mechanism produces effects below the resolution
  of everything the project can afford to run, and the product claim should be withdrawn rather than narrowed.
- **Stage 2 cannot load the train split and no larger corpus is available.** Then the resolution purchase is not
  affordable and every future mechanism claim must be stated as *below this design's resolution*. That is not a
  failure of the experiment; it is the answer, and it would retire a claim the record has made for twenty-six
  iterations.
- **Stage 2 shows a delta outside ±1pp in either direction.** Then the mechanism is real and its sign is known,
  which no sample in the record has ever established, and R31 is a mechanism iteration with a working instrument
  for the first time.

**What a positive stage 1 would license.** One read-time filter and one distiller change, specified by the covariate
that separates, and nothing else. It would not license a SOTA claim: the effect being explained is ~1pp on BIRD dev,
and the competitive gap is 4.11pp to the reproduced baseline and 25pp to the leaderboard.

**Outcome, stage 1 (2026-11-01, §140). All four registered criteria for stage 1 pass and the refutation does not
fire.** The classifier is `packages/eval/src/sql-diff.ts` + `query-diff.ts`, the artefact is
`eval/results/poc-query-diff.json`, and the workflow recomputes it byte for byte and asserts nineteen facts.

| prediction | registered | measured | |
|---|---|---|---|
| 1 — the identifier covariate separates help from harm and is the largest split the record has | a separation above its own resolution | gap **−11.13pp ±7.61**, clustered [−19.60, −2.63], exact p = 0.0015, on 155 of 1,534 | **confirmed** |
| 2 — most discordant cases have no identifiable cause in the query diff | *unexplained* is the largest single bucket | **94 of 129 (72.9%)** unexplained | **confirmed** |
| 3 — stage 2 resolves the mechanism, in either direction | not answerable offline | — | open |
| 4 — stage 2 does not load the train split without a driver change | not answerable offline | — | open |

**Prediction 1 needed a name the register did not give it.** The covariate that separates is *the memory query
contains an identifier that neither the baseline query nor the question mentions*. Six features were tested; F1
survives a Bonferroni threshold of `0.05/5 = 0.01` at p = 0.0015, and F2 — the same hypothesis under a deliberately
looser grounding rule — clears its own interval but **misses the corrected threshold at p = 0.0102**. Both numbers
are in the artefact. The mechanism is not "show the pack less" or "filter by relevance": it is that **the pack
sometimes puts a schema name into the query that the question never asked for, and the query is then wrong 7.8
times as often** — 35.71% of already-correct queries destroyed against 4.56%.

**The registered licence is narrower than the registration assumed, and the difference was measured rather than
argued.** The licence reads *one read-time filter and one distiller change*. The read-time filter works — it moves
the paired delta from +0.33pp to +1.30pp by discarding 155 queries — but it requires the query to exist, so it is a
**post-generation** check and not an admission rule. The pre-generation version was measured on the same corpus:
an admission filter that refuses a rule whose *text* names an ungrounded identifier flags 385 questions, is worth
**+2.86pp in the wrong direction**, and agrees with F1 at 13.0% precision and 32.3% recall. **The version of the
gate that could ship is not the version that works.** The distiller change is therefore not optional: until a rule
carries the names it requires, the write path cannot make this decision.

Stage 2 is unchanged and is the only item on the critical path. Its first action is still the registered one —
prove the train split loads and passes its population check before anything is spent — and its stop condition is
unchanged: a delta outside ±1pp in either direction retires the twenty-six-iteration claim that this mechanism is
below the resolution of everything the project can afford.

### R31 — a rule that says which names it needs (**registered** 2026-11-01)

**Why this rather than the sample alone.** R30 stage 1 established that the harm is a name imported into the query,
and that the rule *text* does not predict which names will be imported. Two explanations survive, and they imply
opposite repairs:

- **the representation loses the names.** 928 of 1,066 rules say "a numeric code column" or "the filter column"
  rather than naming one. If the names are recoverable at distillation time, an admission filter becomes possible
  and the gate ships for free.
- **the model chooses the names.** The rule is advice and the query is the model's composition; a rule that names
  `frpm` and a model that writes `frpm` are not the same event. Then no write-path filter can exist and the only
  implementable form is a post-generation check, which costs a second generation.

**The work.** One field. `LearnedItem.names` — the schema identifiers the distiller asserts the rule depends on —
written by the distillation prompt and validated against the schema candidate at admission:

1. extend the distillation contract with `names: string[]`, required, empty permitted and **counted**;
2. validate every name against the run's schema candidate and reject an item carrying a name the database does not
   have (the R11 wall, now applied at write time rather than at read time);
3. re-run the classifier over a committed corpus that carries the field, and re-measure
   `ruleLevel.agreement`. **The registered bar: recall ≥ 0.7 and precision ≥ 0.5.** Below either, the
   representation reading is refuted and the second reading stands.

**Cost.** No new model calls for the validation and the re-measurement — the field is written by the distillation
pass that already runs. One `sota.yml` dispatch on dev to regenerate the store, ~1,900 calls.

**Registered predictions.**

1. **Recall rises above 0.5 but not to 0.7.** The distiller can name the column a rule is about, and it cannot name
   the ones the model will add on its own; the ceiling is the share of the harm that is rule-driven.
2. **Validation rejects more than 5% of distilled items** against their own database, which would make the R11
   vocabulary wall visible at write time for the first time since it was measured at read time.
3. **The gate's out-of-sample benefit is smaller than the in-sample +0.98pp**, because the in-sample estimate was
   chosen on the corpus it improves. A shrinkage of a quarter or more is the expectation.

**Refutation.** If `names` is empty for more than 90% of items, the distiller cannot express the dependency and
the representation reading is refuted outright — the product statement narrows to *this mechanism is not
implementable at write time*, which is a real answer and would end the write-path line.

**Sequencing.** R31 is offline except for one store rebuild, so it runs in parallel with R30 stage 2's data check;
neither blocks the other.

### R31 — withdrawn before it was run, on its own premise (2026-11-01)

R31 registered a store rebuild: add `names` to `LearnedItem`, validate it against the schema, re-measure the
admission filter. The premise was that the representation loses the names 928 of 1,066 rules never spell out, and
that a field which carried them would make the write-path filter work.

The premise is answerable from the record that already exists, at zero calls, because §140's corpus stores the
rendered text of every rule that reached the prompt. Two readings were taken of it (`PROGRESS.md` §141): the
three-way attribution in §R31-precondition and the gate's fragility in §R31-stability. The first one closes R31.

**The attribution.** Every one of the 155 importing questions is placed in exactly one bucket: the pack's text
names the identifier, it does not and the query executed (so the name is a real column the model took from the
DDL), or it does not and the query never ran.

| bucket | questions | Δ vs no memory | already-correct queries destroyed |
|---|---|---|---|
| the pack names it | 60 (38.7%) | −8.33pp | 36.36% |
| the pack does not, and the query ran | 94 (60.6%) | −9.57pp | 34.04% |
| the pack does not, and the query never ran | 1 (0.6%) | — | — |

**The two buckets are damaged by the same amount** — 1.24pp apart, against a 14.74pp half-width — so a question a
rule named a column for is not more damaged than one it named nothing for. The gate's own +0.98pp decomposes
0.33 / 0.59 / 0.07 across the three buckets: **a third of what the read-time filter recovers comes from questions
the pack named, and 60% from questions it never named.**

**Why that ends the write-path line rather than delaying it.** A `names` field improves the *resolution* of a
filter whose *targeting* is wrong. Even at perfect coverage it would refuse rules that are no more harmful than
the rules it keeps, and the only pre-generation test in this record already measured that version at +2.86pp with
the wrong sign (precision 13.0%, recall 32.3%, §140). Two independent measurements, one about coverage and one
about sign, now say the same thing: **the write-path filter has no target.**

**What the withdrawal is not.** It is not a claim that the distiller cannot name a column — it surely can. It is
the claim that naming it does not identify the damage, which is a statement about the mechanism and not about the
representation. R32 registers the question that replaces it.

**Cost avoided.** One `sota.yml` dispatch (~1,900 calls) and a contract change across the distillation path.

### R31-precondition — where the imported name came from (**read** 2026-11-01, from the committed record)

Not a dispatch: a reading of `poc-sota-bird-dev-R26-channels.json`, which carries the pack text per question and
the query it produced. `pnpm eval:mediation` reproduces it and the workflow asserts every number below.

**Predictions, written before the numbers were read.**

1. `M1` the pack's text supplies the identifier in at least 30% of the 155 flagged questions;
2. `M2` it supplies it in at least 60% once spelling differences are forgiven;
3. `M3` the pack-named bucket is damaged more than the schema bucket, and the gap clears its own half-width;
4. `M4` the pack-named bucket carries at least half of what the gate buys.

**Result.** M1 passes (38.7% exact; 79 of 285 names), M2 fails (52.3%), **M3 fails**, M4 fails (33.3%). The
product statement §140 licensed — *a rule may not put a name into the query the question does not contain* — is
**withdrawn**, and what replaces it is narrower and true: *a generated query that names something neither the
question nor the pack mentions should not be executed as written.*

**Disclosure.** M3 was first written as a point comparison (`36.36% > 34.04%`) and passed. The same run printed
the gap's interval, which is twelve times the gap, so the criterion was tightened to require resolution **before
the verdict was accepted**, and it then failed. The tightening is recorded because it changed the answer, in
`AUDIT.md` §27. A criterion that is loosened after a result is not a criterion; one that is tightened after a
result is also a decision, and it is only defensible if it is written down.

**Refutation.** Nothing in the reading is a claim about the world beyond this corpus: the buckets are exhaustive
by construction, the detectors' two biases point in opposite directions and are both reported, and the 60/94 split
is a property of these 11 databases. R30 stage 2 must reproduce it on a second mixture.

### R31-stability — is the gate's estimate a property of the gate? (**read** 2026-11-01)

Three readings of the same estimate, all offline: leave-one-database-out, a permutation null of random discards
of the same size (5,000 draws, without replacement), and a split by database balanced on question count.

| reading | result |
|---|---|
| leave-one-out | +0.77pp to +1.25pp over 11 databases; never zero or below |
| permutation | observed +0.98pp against a null of −0.04pp [−0.46, 0.39]; p = 0.0002 |
| split-half | A +0.76pp (n=794, 77 discarded), B +1.22pp (n=740, 78 discarded) |

All three pass. **This is a stability check and not an out-of-sample test:** both halves were in the corpus the
hypothesis was formed on, so the shrinkage an unseen sample would show is still unmeasured. R30 stage 2 remains
the only reading that can measure it, and it is now the single item on the critical path.

### R30-stage2 — the out-of-sample split, verified without a dispatch (**run and read**, 2026-11-01)

The registered prediction 4 said this dispatch is the one most likely to fail. It was checked first,
and the check is now a program: `pnpm eval:split-precheck` loads a split through the lane's own
manifest reader, question parser, pool rule, selection and population check, and stops before the
first model call.

**Result on the real archive.** Train: 9,428 questions, **7,829 after the manifest's selection**, 58
databases, 0 empty or unreadable, 3.05M rows, and its two copies of the gold agreeing on **all 9,428
rows**. Verdict `ready`. Dev and Mini-Dev: `ready`, and Mini-Dev reads **350** — the number every
transfer experiment in this record uses, reproduced by the pool rule from the file rather than
supplied to the precheck.

**Five defects stood between the prediction and a dispatch, and none of them was visible from dev.**
A required tier field that train does not have; a download that buffered 8.9 GB in one allocation; a
nested archive name hard-coded to `dev_databases.zip`; a database-root list without
`train_databases`; and an `SOTA_ARTEFACT` expression that answers the Mini-Dev name for `train` — the
fifth would have overwritten the Mini-Dev evidence after a successful run. All five are fixed, each
with the regression test its class admits, and `AUDIT.md` §28 records which of them a unit test could
have found (none).

**The selection is a bytes-per-question decision.** The archive unpacks to 32.4 GB; eleven databases
cost 30.0 GB and hold 1,599 questions, and the remaining 58 hold 7,829 in 2.4 GB. The manifest now
declares the selection, the lane prints what it costs, and `withinDatabases` reports both directions.

**Dispatch parameters, fixed in `prereg/R30-stage2.md` before the run:** `split=train`,
`limit=7000`, `arms=` (none and full), `max_calls=16000`, `deadline_min=300`. Seven thousand
questions resolve 0.94pp against dev's 2.01pp at 1,534, which is the whole return on the dispatch —
and the 15% wall-clock margin is the reason it is 7,000 rather than the 7,829 available.

**Predictions P1–P5 and refutations are in the pre-registration**, including the one that matters
most: the train accuracy is **not comparable to any leaderboard row**, because BIRD publishes no test
cell for train and the split's name in the artefact is chosen so that `compareCell` cannot file it as
a reproduction.

#### Result — run `41296776252`, 14,479 calls, and the product claim does not survive

| | registered | observed | verdict |
|---|---|---|---|
| P1 measurable | required | 12/12 gates, gold 100%, mde 0.82pp | **held** |
| P2 not positive and not significant | required | −0.71pp, clustered [−1.27, −0.18] | **refuted** |
| P3 gate worth +0.2 to +2.0pp | required | +0.51pp | held, at the low end |
| P4 shrinkage to [0.49, 0.98] | required | +0.51pp, 52% retained | **held**, 0.02pp of margin |
| P5 imported name still negative | required | −6.57pp against −0.22pp | **held** |

**Memory costs 0.71pp out of sample and the read-time gate recovers 0.51pp of it.** Five of five
folds are negative; the clustered interval excludes zero; 72% of the net harm sits in the 7.8% of
questions whose generated query imported a name nobody mentioned; and the gated arm's −0.20pp is not
distinguishable from no memory at all. The dev reading of +1.30pp for the gated product was a
property of the dev corpus.

**The mechanism account of §141 also fails out of sample** — the share of imported names attributable
to the pack's own text halves, from 38.7% to 19.5%, and only 19.4% of the gate's recovery comes from
questions the pack named. The filter is a property of the query, not of the pack. Full reading in
`PROGRESS.md` §146; the two defects it exposed are `AUDIT.md` §30.

**Corroboration from three outside results, found after the measurement.** CTIM-Rover
(`arXiv:2505.23422`) reports cross-task memory taking AutoCodeRover from 42% to 31% in its
memory-only configuration and argues the memory acts as surface-level noise; Xiong et al. (2025)
name the reflex *experience-following*; LongMemEval (ICLR 2025) measures a ~30% drop on
knowledge-update tasks. **This record's addition is magnitude and location**: 0.71pp at 7,000
questions, 72% of it in 7.8% of the corpus, with a per-question footprint in the output query.

### R32 — if the damage is not lexical, what is it? (**closed** 2026-11-01, three negatives)

**Why.** §R31-precondition leaves one mechanism standing: the pack changes what the model writes, and the imported
name is the symptom of that change, not its cause. Sixty percent of the damage happens where the pack said nothing
about the column. Everything this record has measured about the pack so far has been about its *content* —
relevance, overlap, embedding similarity, channel, names. None of those is the axis, and the axis is now visible
in the query diff: the pack's edited queries are classifiable, and the classes have very different effects.

**The observation that registers it.** From §140's own table, the corpus's edited queries split by effect, and the
split is not what a "the pack adds noise" story predicts:

| what the pack did to the query | n | Δ vs no memory |
|---|---|---|
| added a narrowing condition | 103 | **+6.80pp** |
| widened the query | 108 | **+4.63pp** |
| reshaped it both ways | 58 | **+12.07pp** |
| rewrote it with no direction | 345 | +0.00pp |
| imported an ungrounded name | 155 | **−9.68pp** |

Structural edits help; the loss is concentrated where a name appears. So the question is what makes a generated
query *reach* for a name the question did not supply, and there are three candidates the record can separate
without a new dispatch:

1. **the rule is procedural rather than declarative** — it tells the model how to build the query rather than
   what the answer depends on, and a procedural rule can change the plan without naming anything;
2. **the pack changed the table set** — F4 (a table added) is −10.39pp over 77 questions at p = 0.0499, which is
   the next-closest feature to resolution and overlaps the imported-name bucket only partly;
3. **the question is one the schema can answer two ways** — an ambiguity the pack resolves in the wrong direction.

**Predictions.**

1. **The procedural/declarative split separates at least as well as the imported-name split** (|gap| > its own
   half-width), because a rule that says "always cast before comparing" changes the shape of every query it
   touches and the ledger shows shape changes are where the variance is.
2. **The table-set feature and the imported-name feature overlap by less than half** (`both / importing < 0.5`),
   which is what makes them different questions rather than one question measured twice.
3. **Within the pack-named bucket, the procedural rules are the damaged ones** — if the pack's names were the
   mechanism, the declarative rules that name a column would be the harmful ones, and the mediation says they
   are not.

**Refutation.** If no feature separates, the honest conclusion is that this corpus cannot attribute the damage to
anything in the pack, and the product statement narrows to the read-time check with no account of its cause —
which is a usable product and an incomplete science, and would be reported as both.

**Cost.** Zero calls: all three are classifications over `per_case` and `items`, which are already committed.

**Sequencing.** R32 is offline and independent of R30 stage 2, which remains the next dispatch.

**Result — all three axes closed, all three negative.** Recorded here so the registration and its
outcome sit together; the readings are in `PROGRESS.md` §143 (axis 2), §144 (axis 1) and §145
(axis 3).

| axis | verdict | the number that decided it |
|---|---|---|
| the pack changed the table set | **inert** — the imported name counted twice | 45.2% overlap with F1 and exactly 0.00pp on the 7 questions F1 does not cover |
| the rule is procedural rather than declarative | **unmeasurable** — the classes are not distinct | 157 of 271 sentences (57.9%) carry both marker kinds, over the 50% bar this registration fixed, and a looser marker set only moves it to 65.7% |
| the question is one the schema can answer two ways | **refuted** — the direction is backwards | 1.33% of already-correct queries destroyed where the question named none of its required columns, against 8.41% where it named most |

**The refutation clause above is the outcome, and it was written before any of these numbers
existed.** The corpus cannot attribute the damage to anything in the pack's structure, the product
statement narrows to the read-time check, and no fourth structural account is proposed: three have
been tested against a corpus that carries the pack text, the queries it produced and the reference
queries, and a fourth would need a corpus this one does not contain — most plausibly a controlled
one, where the pack is varied and the question held fixed, which is not something BIRD can supply.

**Prediction 3 was refuted in the residual reading and is not promoted.** Procedural packs read
+1.64pp and declarative −2.12pp, and the gap is larger where no name was imported (+5.15pp) — but
the sign holds in only 6 of 11 databases, which a sign test puts at p = 0.754. A direction that
appears in 6 of 11 clusters is not a direction, and the registration's own standard is that a
reading either resolves or is not reported as one.

### R33 — what ships, when the filter is the only part that pays (**stage 0 registered, run and read** 2026-11-01, with no model call)

**Why.** §146 measured the memory as a cost out of sample and the gate as a partial recovery; §147 split
the corpus by what memory did and priced the gate at **15%** of a 3.39pp ceiling. Three shapes were left
and none had evidence behind it: ship the filter alone, ship memory with the filter, or test a weaker
injection. Only the first does not depend on the rules being worth anything, and it had never been
measured — every reading of the filter so far compared two statements, so what had been shown is that
the *difference* carries the signal.

**Design (stage 0, as registered in `prereg/R33.md`).** Point the same grounding rule at a single query,
anchored on the question alone, and read it on both committed artefacts — `per_case` stores the bare
query and the served one. Two rules (strict, morphological), two arms (bare, served), two splits, six
predictions, three instrument gates. **Cost: zero model calls.**

**The bar was taken from the filter, not chosen.** Youden's index of the diff-anchored filter out of
sample: `76/237 + 147/187 − 1 = 0.1068`. A question-only check that cannot beat the thing it would
replace does not replace it.

**Result — the check is differential, and shape 1 is refuted as specified.**

| | flag rate | gap | Youden |
|---|---|---|---|
| train, bare, strict | **94.8%** | −12.58pp [−22.15, −2.92] | **0.0257** |
| train, bare, morphological | 75.8% | −9.28pp | 0.0700 |
| dev, bare, strict | 93.3% | −21.70pp [−31.03, −12.08] | 0.0556 |
| *the diff-anchored filter* | *7.8%* | — | ***0.1068*** |

The rule fires on almost everything because a correct query names tables and columns no question
spells out; the gap it shows between its two leftovers is a difficulty proxy, and Youden — which removes
the base rate — reads a quarter of the filter's. **P4, P5 and P6 are refuted; P1, P2 and P3 hold.** The
morphological arm, registered before either number existed, forecloses "fix the tokeniser" for the
price of a column: 19 points less flagging buys 0.044 of Youden.

**The one positive result.** On the population the flag rate leaves room in — the questions the bare
rule passes — the pack imports a name on **99 of 1,693 (5.8%)** out of sample and **24 of 395 (6.1%)** on
dev. That is §146's imported-name finding reproduced under a second, independent rule, and it is what
makes the negative credible.

**What it closes.** Shape 2 is bounded above by a wash by arithmetic (§147); shape 1 is now refuted by
measurement. **Nothing ships.** Shape 3 — whether an injection exists that raises the repair rate
without raising the break rate — is the only open question, and it is a hypothesis to register rather
than a feature to build.

**Two defects.** Ten of 7,000 train rows carry no `baselineSql` and every reading treats that field as
an operand rather than a subject (`AUDIT.md` §31.1); and P6's threshold was unreachable under P2's own
floor, which is a registration defect rather than a corpus one (§31.2). Both are recorded with the
number each one moved.

### R34 — admission, not dose: is the memory wrong, or the population? (**registered, run and read** 2026-11-01, with no model call)

**Why.** R33 left one shape open — a weaker injection — and §148 left it with the note that nothing
measured suggested a dose which raises repairs without raising breaks. That note was about the wrong
variable. A repair can only happen on a question the bare model got wrong and a break only on one it got
right, so the exchange rate at which memory breaks even is **the bare odds of being right**, 4,075 / 2,925
= **1.393**, not 1.0. The measured 0.789 is a **43%** shortfall rather than a near miss, and the same
arithmetic says why the population and not the item is the remaining lever: admit memory only to questions
the bare model would fail and the break rate is **zero by construction**, so the whole repair rate arrives
as gain — **+2.67pp**, the mirror of §147's 3.39pp removal ceiling, and the two sum to a 6.06pp oracle.

**Design (as registered in `prereg/R34.md`).** Five gates and a split, fixed before any number existed:
SKR's kNN signal in lexical form (the share of a question's ten nearest neighbours **in the same database**
that the bare model got wrong, leave-one-out, ties broken by id), the pack's coverage of the question in
both directions, a two-item dose split, their conjunction, and a seeded random control. 58 databases dealt
29/29 by a stable hash; thresholds swept over six quantiles on the discovery half only; the selected rule
evaluated unchanged on the other. The bar is derived, not chosen: `q > b / (r + b)` = **47.64%** against a
**41.79%** base rate, a 5.85pp lift — a far lower bar than the filter's Youden of 0.1068. **Cost: zero
model calls.**

**Result — the gate beat the bar and lost money, because selection moves the bar.**

| gate | coverage | precision (needs 47.6%) | confirmation gain | interval |
|---|---|---|---|---|
| self-knowledge, t = 0.50 | 35.6% | **62.4%** | **−0.05pp** | [−0.50, +0.45] |
| coverage-high, t = 0.182 | 25.6% | 44.9% | −0.11pp | [−0.55, +0.35] |
| coverage-low, t = 0 | 23.2% | 28.3% | −0.19pp | [−0.55, +0.16] |
| pack ≥ 2 items | 93.6% | 39.7% | −0.69pp | [−1.33, −0.08] |
| conjunction, t = 0.30 | 18.4% | 54.0% | +0.08pp | [−0.30, +0.50] |
| *best of all 30 points* | *14.8%* | *58.5%* | ***+0.11pp*** | *[−0.19, +0.44]* |

**The precision bar belongs to the admitted set, not to the corpus, and the admitted set has its own
rates.** Across the self-knowledge sweep precision climbs 20.6pp while the bar climbs 16.8pp to meet it,
because the break rate *inside* the admitted questions goes from 5.50% to **9.68%** while the repair rate
stays flat. A question whose neighbours failed is not one the pack can repair; it is one the model is
**unstable** on, and an unstable answer breaks as easily as it is fixed. The gate selects variance, and
variance is symmetric — the same property that makes memory a wash with no gate at all.

**What it closes.** Shape 3 of R33, and not by dose. Five gates and thirty registered points reach
**+0.11pp** of the 2.67pp ceiling out of sample — **4.0%**, on an interval covering zero — against the
filter's 15.2% of its own ceiling, which also did not pay. Four routes are now closed by measurement:
content (§145), quantity (§146, R16), the filter (§147–§148), the population (§149). What is left is the
store, and the number to hit is now **8.10% repairs or 4.59% breaks** rather than "fewer breaks".

**Four defects, all in the registration.** P1's discordant floor (240 of 424) was arithmetically
unreachable; P3's tolerance (0.15pp) sat below the sampling error at the smallest share; P5's bar was
computed on the corpus rather than on the admitted set; and P7 was written for a positive discovery gain
and is recorded as refuted for a reason that is not its content. `AUDIT.md` §32 collects them with §31.2
as one family, and names the one that no amount of arithmetic would have caught.

### R35 — does the store have per-item value? (**registered, run and read** 2026-11-02, with no model call)

**Why.** §149 closed the population and left one product item: the store. Its only operational form is
**prune** — drop the rules that break, keep the ones that repair — and pruning presupposes that a rule has
a net value that travels from the questions where it was measured to the questions where it will be shown.
No round had tested that, and the answer decides whether the store can be maintained at all.

**Design (as registered in `prereg/R35-ledger.md`).** Four readings on the 7,000-question artefact §146
paid for, 203 rules and 13,578 injections: a χ² dispersion against a null that **permutes outcomes across
questions** while every rule keeps its question set (the only null that separates a rule's effect from the
pack it travelled in); a split-half correlation over 29/29 database deals, extrapolated to a full-length
reliability by Spearman–Brown; an out-of-sample test of a coarse prune flag (negative net, ≥ 10 showings);
and the pack-size contrast that fell out of counting the corpus. **Cost: zero model calls.**

**Result — the rules differ, and the difference is not theirs.**

| | value |
|---|---|
| dispersion χ² (null mean, 99th percentile) | **293.3** (209.6, 280.4), p = **0.0047** |
| split-half correlation over 135 rules | **−0.134** [−0.296, +0.036] |
| sign agreement over the 53 rules that moved twice | **49.1%** |
| Spearman–Brown reliability | **−0.309** |
| prune flag: 58 rules, 2,545 questions | **−0.55pp** vs −0.49pp, difference **−0.06pp** [−1.97, +1.56] |

The store has real structure — the first this programme has found — and it is an **interaction between a
rule and a database**, not a quantity attached to the rule. A prune built on the ledger removes rules at
random; the coarse flag that a deployment could actually run is not a weaker signal but no signal.

**The one variable that moves is not the content.**

| pack | questions | repaired | broken | net |
|---|---|---|---|---|
| one rule | 423 | 12.50% (25/200) | 5.38% (12/223) | **+3.07pp** |
| two rules | 6,576 | 5.94% (162/2,725) | 5.84% (225/3,851) | −0.96pp |

**+4.03pp [+0.76, +6.62]**, clustered by database. Positive on all five artefacts above a thousand
questions, negative on all twelve 350-question pilots — a split a sample-size explanation predicts exactly,
since the pilots hold 33–78 singleton questions against 97–423 in a full split. **A lead, not a finding.**

**What it closes.** The fifth and strongest route: a store cannot be improved by editing its items one at
a time. Two levers remain and both are designs — the **grain** at which memory is written, and the
**number of items a prompt carries**. R36 is the second, and it is the cheapest arm this programme has
ever had: one rule per prompt halves the prompt tokens of the run it replaces.

**One process defect.** The registration carries a **Disclosure** section: the direction was chosen after
an exploratory pass, so P2, P3 and P7 are replications rather than predictions and only P1, P4, P5 and P6
were blind. `AUDIT.md` §33.1 records the cost; §33.2 records four branches that no input could reach.

### R36 — one rule per prompt, assigned rather than observed (**read and replicated** 2026-11-02, run `41369849335`)

**The question.** Does the pack-size contrast survive assignment? R35 measures it on questions retrieval
happened to serve one rule; an arm that sets the pack to one rule on the same split separates the mechanism
from the corpus.

**What was already paid for.** The arm has existed since R25: `full-one` is the same retrieval, the same
order, the first item and no second one, on every question, built from the pack `full` carries so the two
prompts differ in one field. R25 reported it as a dose control. R36 reads it as a test, and adds the two
readings R25 did not have — each arm's exchange rate against the bare model's odds, and the four cells that
say what the second item is actually worth.

**Result — the lead does not survive, and the reason is the round's finding.**

| | value |
|---|---|
| `full-one` − `full`, clustered by database | **−0.33pp [−1.65, +1.25]**, 42/47, p = 0.6718 |
| R35's observed contrast, same split | +3.13pp [+0.87, +5.23] |
| clearance, one rule / the pair | **0.672** / **0.737** on a hurdle of 1.335 |
| the second item | 23 repairs, 27 breaks (0.85), **and 15 repairs / 24 breaks prevented** |

Singleton questions repair at the same rate as pairs (9.5% against 9.0%) and break at half of it (4.2%
against 7.8%); that break-rate difference *is* the +3.13pp. The four marginal cells are the result that
outlives the sign: **removing an item is not a subtraction**, because the remaining item answers differently
alone — 15 repairs and 24 breaks move the other way, so the pack is not additive and the item count is not a
knob.

**P5 held, and the per-fold table is a paired measurement.** The replication landed: **−0.07pp
[−1.34, +1.20]** on a fresh store draw, 38/39, upper bound 0.80pp inside the 2pp bar this file fixed before
the run. The marginal item repeats its record (20 repairs / 23 breaks, 0.87 against 23/27, 0.85) and one rule
again clears less of the hurdle than the pair (0.708 against 0.721). The split is seeded, so fold *k* holds
the same questions in both draws: three of five folds keep their sign, the two that do not are exactly zero
on the first draw, and **the single fold whose interval excludes zero (−5, [−2.55, −0.66]) covers zero on the
second draw at [−2.93, +2.06]**. No fold in either draw is distinguishable from noise, which is what closes
the count lever — and it corrects the "sign drawn per store" wording this round first published
(`AUDIT` §34.5–§34.6). The replication's own artefact also failed the repository's protocol check on the way
in: the registration's `gates` header named the reading's two gates and not the thirteen the dispatch
emitted, which is a defect in the header rather than in either artefact (`AUDIT` §34.7).

**Two defects found on the way.** The dev manifest never declared its nested archive, so a dev dispatch
downloaded 346 MB and failed on the first question (`AUDIT` §34.1); and R35's dev interval had been computed
at 400 resamples where the round used 2,000 (`AUDIT` §34.2). Both fixed, both pinned.

**Cost.** The adjudication is zero model calls; the replication was one `sota.yml` dispatch at
**`learn_sample = 280`** that spent **4,970 calls** (run `41369849335`), half of R25's. The first attempt at
it left `learn_sample` at its default of *all*, forecast 13,328 calls against a cap of 9,000, and stopped
after fold 1 — recorded as `AUDIT` §34.4, because a cost that does not name its input is not a cost.

### R37 — the grain of a memory write: a term and its referent (**read** 2026-11-02, run `41381789619`)

**The question.** Every route closed so far changed *which* sentences a prompt carried, how many, or what they
were called. None changed what a memory item **is**. R37 asks whether the object itself is the lever: advice
about how to build a query, or a term with a referent.

**What was already paid for, on both sides of the comparison.** R23 priced the corpus's own object: BIRD attaches
a curated definition to most dev questions, 142 characters mean, and removing it costs **17.01pp** (paired,
clustered, n = 1,534). R30 priced ours in the same slot: **−0.71pp**, and R36 read −0.59pp on a re-draw. Two
objects, one slot, and the difference is not authorship — the pack was written by a model that had seen the
corrections a definition would summarise.

**The arm.** `full-lexicon`: a second store distilled from the same corrections by the same client under a fourth
form, where each item is `{term, statement}`. Two predicates make it a different object rather than a differently
worded one. At write time `admitLexicon` refuses a candidate whose term does not occur in the question that taught
it. At read time `lexiconPackOf` renders an entry only on a held-out question containing its term, matched on word
boundaries with an optional plural and no substring matching, so `rate` cannot be licensed by `separate`.

**Result — the grain is licensed and almost never renderable, and the first refutation clause fires.**

| | value |
|---|---|
| entries distilled from 547 corrections | **179** (0.33 per correction), 13 distinct terms |
| held-out questions the block rendered on | **132 of 1,534 (8.6%)**, two terms covering 107 |
| `full-lexicon` − `full`, clustered | **−0.59pp [−2.09, +0.91]**, 65 gained / 74 lost |
| `full-lexicon` − `none`, clustered | **+0.13pp [−0.59, +0.85]**, 17 / 15 |
| clearance, across the split / on the 132 reached | **0.854** (17/15 on 1.328) / **1.176** (5/4 on 1.063) |
| licence | **132 of 132 lines**, 0 unlicensed; the only refusals were 12 candidates with no term |

The registration fixed a 25% reach **before** the run and said that failing it makes the round *inconclusive by
feasibility* rather than a refutation. It failed, and the reason is arithmetic about the corpus: a definition is
reusable only where a corpus reuses a phrase. 179 entries met 13 repeated terms, and 127 of the 132 covered
questions already carried a curated definition from the benchmark itself, so the learned entry was a second copy
of a hint the model already had. Two numbers bound any second round — the distiller's yield, which learning from
every correction rather than 280 sampled questions could move, and the corpus's phrase reuse, which nothing this
project can do moves.

**What it closes.** The seventh and last design lever: what a memory item *is* has now been varied as far as an
object can be — wording, count, filter, audience, payload, cardinality, type. **A distilled memory pays only
where the same words come back**, and on independently written questions they do not.

**Cost.** One `sota.yml` dispatch, **5,103 calls** against a 9,000 cap, two distillations per fold and three arms
over 1,534 questions. The adjudication is zero calls: `pnpm eval:lexicon` recomputes reach, licence, both deltas
and both exchange rates from the committed artefact, and CI asserts 17 of its fields beside the run's own 14.

**Four defects, three of them in the reading rather than in the arm** (`AUDIT` §34.9): a covered-subset field
computed over the whole split, a second copy of the repository's exchange arithmetic inside a bin, a CI re-check
whose regex could not survive a shell's double quotes, and two ledger assertions that still counted 17 artefacts
when there were 18.

### R38 — the frontier of a term store, and the density that explains the ceiling (**read** 2026-11-02, no dispatch)

**The question.** R37's arm reached 8.6% of the split and its registration called that *inconclusive by
feasibility*. §153 gave the reach a cause — "a definition is reusable only where a corpus reuses a phrase" —
and a cause is a claim, so R38 tests it against the corpus rather than against the store.

**Why it needs no dispatch.** BIRD's `evidence` block is a store of definitions written by the people who
made the corpus: one per 90.35% of dev questions, and a mapping rather than prose, from a phrase a question
uses to the database vocabulary it denotes. Read as `{key, value}` pairs it is the key universe a
definitional memory could have had, so "was 8.6% the corpus's ceiling?" is answered by ranking those keys
by the questions they reach.

**What was built.** `packages/eval/src/frontier.ts` — three narrow annotation shapes (91.3% of annotated
questions parse), `keyStats` counting reach and annotations per key, `reachCurve` and `keysForShare`, a
`databaseShares` reading, and three gates. `pnpm eval:frontier` recomputes the whole reading from the
committed R37 artefact and CI diffs it, asserting sixteen fields.

**Result — the closure stands and the arm's construction is exonerated.**

| | value |
|---|---|
| annotated questions / parsed | 1,386 (90.35%) / **1,266 (91.3%)** |
| distinct keys, of which recurring | **1,559**, 346 |
| keys that reach a quarter of the split, ranked raw | **2** — `list`, `name`, both annotated once |
| mean density, keys in ≤3 / ≥50 questions | **0.967** / **0.077** |
| frontier at the arm's 13 keys (density 0.5 / 0.8 / 1.0) | **241 / 148 / 78** against the arm's **132** |
| keys to reach 25% at density 0.5 | 53 |
| ceiling with every vocabulary key held (0.5 / 1.0) | **65.9%** / 52.3% |
| entries bought per distinct term | 179 on 13 — **13.77** |

**What it closes, and what it corrects.** The grain route stays closed, and now for a reason that is about
how questions are written: **the corpus defines what it mentions once and mentions without defining what it
mentions often.** A memory retrieved by the question's own words can only act on words that come back, and
this corpus withholds its definitions from precisely those. Holding every vocabulary key still leaves 34.1%
of the split unreached. What does *not* survive is §153's implied criticism of the store: at 13 keys the
frontier is 241 against 132, a factor of 1.83, so the arm was on the frontier rather than behind it.

**Cost.** Zero model calls, zero dispatches, 31 unit tests, three gates (`V66`, `V68` blocking; `V67`
advisory). Four defects, all in the reading: a frontier of English, a store reconstructed with two scopes
missing, and a refutation clause that measured nothing (`AUDIT` §34.10).

**What it hands forward.** The instrument, not the verdict: a frontier curve, a density separator computed
from the corpus's own judgement, and the two-column agreement check that catches a scope error before it
becomes a paragraph.


### R39 — the resolution ledger: every arm, beside the difference its own sample could resolve (**read** 2026-11-02, no dispatch)

**Why this rather than the τ² arm or the SQL move.** `AUDIT` §25.7 had been open since R30: the power audit reads
one row per artefact and an arm inside an artefact is not a row. It was deferred seven times on a schema question
— *is an arm an artefact?* — and the question was the obstacle. An arm is a column of a run: it inherits every
validity gate and contributes only `(helped, harmed, n)`. Two of the three other open items need a dispatch or a
large mechanical move; this one needed a formula, and it turns out to bear on the question the record has
re-opened most often.

**The claim under test.** The memory effect has been quoted between +8pp and −9.26pp across runs of the same
comparison, and that range has been read as a fact about the mechanism. The alternative account is that the
designs could not see the effect. **98 published arm rows, recomputed, decide between them.**

| reading | registration | result |
|---|---|---|
| rows decided at 80% power | fewer than a third | **18 of 98 — 18.4%**, 27 at a 95% interval |
| smallest decided row | no decided row below 4pp | **4.57pp** |
| `full − none`, 20 runs | ≥ 15 runs, ≤ 2 decided | **18 negative, 2 positive, 1 decided, 6 inside a 95% interval** |
| its median magnitude | 1,534 median under a quarter of the 350 median | **2.86pp → 0.33pp**, ratio 0.11 |
| the dearest undecided question | one price an order of magnitude past the corpus | **1,457,294 questions** for a −0.07pp row |

**What the ledger found that the registration did not predict.** Two defects, both found by two columns of the
same artefact disagreeing. `values` is **two contrasts, not one** — +1.17pp against the no-memory baseline and
+0.85pp against `full` — so any sentence quoting one number for "the channel" was describing a control comparison
while quoting a treatment effect; every row now carries its `control`. And the first replication table called a
single decided run a replication, because with one decided row the sign set has one element and agreement is
vacuously true; `decidedAgree` is now `null` below two.

**The counter-example, kept because it licenses the instrument.** `linked` — schema pruning — reads **7.71pp at
350 questions and 9.26pp at 1,534**: the only contrast whose effect grows with the sample, decided at both sizes.
A small-sample artefact does not grow with n, so the instrument can see a real effect, and it sees none in the
memory contrast.

**Refutation, applied.** Had `V69` or `V70` failed, the reading would have been withdrawn rather than qualified,
because a short table and an unreconciled row both look like findings. Had three or more `full − none` runs been
decided with signs disagreeing, the question would be contested rather than underpowered and the round's
conclusion would be refuted. None fired. The gates are `V69` and `V70` blocking, `V71` advisory, 49 unit tests,
100% on four coverage dimensions, and fifteen arithmetic assertions in CI.

**What it hands forward, and what it forbids.** It hands forward a price list — every undecided row with the
questions it would take — which converts "underpowered" from an adjective into a decision, and the floors each
design size imposes (4.38pp / 2.07pp / 0.82pp). What it forbids is the eighth re-opening of the memory question at
350 questions: that design cannot see the effect, and the ledger now says so in one line. **Item 10's closure is
sharpened rather than reversed**: no lever in this record has ever produced 2pp, which is what the only corpus
large enough to measure resolves.

**Cost.** Zero model calls, zero dispatches, one command.

### R40 — the layer split, and the table that stops being a paragraph (**read** 2026-11-02, no dispatch)

**Why this rather than the τ² arm or the pool.** R27 stage 3 had been open since stage 2 closed: the SQL
modules still sat in `eval` beside the protocol, with no line saying which was which. The design's own
words for it were "mechanical, changes no number", which is exactly why it was worth doing properly — a
mechanical stage is the only kind that can be verified mechanically, and the verification is what turns the
project's central claim from a paragraph into a gate.

**The claim under test.** *The measurement apparatus is scenario-agnostic; `core` contains no scenario
vocabulary in code; the text-to-SQL surface is a bounded set of modules.*

**The move.** `sql-exec`, `sql-guard`, `sql-diff`, `schema-link`, `m-schema`, `value-samples` and the
extracted `canonicalRows` became `@agentix-e/microglia-sql`. The cut is one question about a signature —
does the function mention a database? — and three modules that answer yes stayed for named dependency
reasons: `bird-data` (the artefact schema), `link-bind` (the rule-template engine), `exec-signature` (a
measurement signal).

| reading | registration | result |
|---|---|---|
| `core` scenario words in code | zero | **0 of 37 modules** |
| coupled modules outside the adapter | 10–14 | **12**, each with a written reason |
| adapter size | 1,600–1,900 lines, 6–8 modules | **1,766 lines, 7 modules** |
| package edges | all downward, fewer than 10 | **5, all downward** |
| artefacts changed | none | **none** — 31 revalidated byte for byte |
| coverage | four dimensions ≥ 95% | **99.98 / 99.68 / 100 / 99.98**, `coupling.ts` 100×4 |

**What the round found that the registration did not predict.** Two defects, neither in the move. The
scanner's comment stripper treated a `/` after an operator as a division, so the regex `/^- "([^"]+)":/`
in `lexicon.ts` opened a string that never closed and the module was reported as SQL-coupled — a false
positive in the direction that gets believed. And `sql-guard`'s deadline started before its child had
loaded `node:sqlite`, so under full-suite load 40–80 ms of boot could consume a 250 ms budget and report an
answer as a timeout; the child now announces readiness and the clock starts at the statement.

**Refutation, applied.** Had a coupled module arrived with no reason, `V72` would have failed and the
round would have published the gap rather than the split. Had any edge pointed upward, `V73` would have
withdrawn the direction claim. Had any artefact changed, the move would have reverted: "mechanical" is a
claim with a test. None fired.

**What it hands forward.** `sota.ts` — 2,243 lines, the largest deferred module, and the one the design
always said stage 3 would split on the same rule. Its reason is written down rather than implied, which is
the point of making the deferrals data.

**Cost.** Zero model calls, zero dispatches; one command over the working tree.

### R41 — The transfer gates, on a scenario they were not written for (**read** 2026-11-02)

**Why this and not the pool, the split, or the annotation set.** §138 salvaged one claim from the
generality argument: the *apparatus* is scenario-agnostic. It rested on four gates, two of which fire on
an empty list, and none of which was the machinery a sceptic would name — the transfer gates, the
substrate comparison and the probe are the ones a reader would say were built for BIRD. R29 stage 1 made
the τ² driver record what those gates read; stage 2 runs the arm that makes four of them fire on a second
scenario. It is one dispatch, no new dataset, no new model family.

| stage | work | the gates it makes fire |
|---|---|---|
| **1** | instrument `tau2-driver.ts`: mean pack size, call tally, learning bookkeeping, domain ledger, the split with its repeats | `V1`, `V2`, `V3`, `V5`, `V6`, `V7`, `V8`, `V32`, `V44` — the supplyable ceiling rose from 4 to **9** |
| **2** | one cross-domain arm: learn τ²-retail, answer the whole τ²-airline set (50 tasks, 4 trials), the same set scored by a memory-free reference | `V15`, `V16`, `V17`, `V33` — the four transfer gates, on a scenario they were not written for |

**The registration is `prereg/R41-cross-domain.md`**, and its predictions are reproduced here because the
reading has to be checked against them rather than against a story written afterwards.

1. Three of the four transfer gates pass: `V15` reconciles every episode into informative, already-correct
   or unmeasured; `V33` carries one ledger row per episode; `V17` re-derives its net from its own counts.
2. **`V16` fails.** A hundred informative episodes is a floor, and informative means the *control* arm
   failed; a foreign pack on 50 airline tasks will not produce a hundred of them.
3. The net marginal effect is a null at or below +5pp, with the sign not predicted: the mechanism's best
   reading on its own terrain is +1.17pp, and a foreign scenario is strictly harder.
4. The audit's index moves exactly four places — supplyable 9 → 13, arm-indexed 30 → 26 — with no other
   gate added or removed.
5. Every evaluated episode is paired; the reference arm's episodes reach the ledger as the control half.
6. If the foreign pack serves nothing, `V1` fails and the round reports the mechanism (recall across a
   scenario boundary) rather than the effect.

**Refutation.** If `V15`, `V33` or `V17` fails, the transfer family cannot be graded on a second scenario
and §138's claim narrows again — to *"the shape gates are portable and the accounting gates are not"* — in
the protocol's own documentation. If the fired set gains a gate outside those four, the projection is
reading a field nobody wrote and the projection reverts. If the net exceeds +5pp the split is audited
before the finding is published: a cross-domain arm cannot leak by construction, so a large positive
effect would mean the two arms are not the same task set, which `l4-same-split` checks.

**Two defects were found before the dispatch was paid for**, and both are names carried across a boundary
that does not preserve meaning: τ² task ids are unique inside a scenario rather than across two (every
evaluated task would have been reported as leaked into training), and the lane graded every arm against a
`pass^4` that belongs to τ²-retail (an airline delta would have measured the difference between scenarios).
`AUDIT` §34.13 records both, with the third defect — a CI assertion that had written a constant where it
meant a reading, for the second round running.

**Cost.** One dispatch through `sota.yml`, both arms, 50 airline tasks at four trials against a 32-task
retail learn half. No new dataset, no change to the merge gate.

**Outcome.** Six of the seven predictions held and the seventh is the round. `V15`, `V33` and `V17` fired
and passed on an airline pair over a retail store — 200 episodes reconciled, 200 ledger rows, a net
re-derived from its own counts at **−5.00pp** (12 repaired, 22 broken of 72 informative). `V16` failed at
**72 informative episodes** against a hundred, as registered. The index moved by exactly four places.
`l4-paired` failed at **−10.00pp** (p = 0.1797, n = 50) and `V5` restated why: 50 tasks resolve 16.81pp.

**And `V1` failed at 0.00 rules/question**, which the registration had reserved for the case where the
foreign pack serves nothing. It served nothing because the store held nothing: the distiller's model was
named the way litellm names it and was refused by the endpoint it was sent to, thirty-two times, and the
driver discarded the report that counted the refusals. `V32` and `V8` were absent on that dispatch and
`V44` passed on an empty ledger. **R42 is the instrument fix and the re-run**; §157 carries the reading,
`AUDIT` §34.14 the four defects, and `TECH-DESIGN` §17.79 the boundary the model name crossed.

### R42 — The store the memory arm never built (**read** 2026-11-02)

**Why the instrument and not the effect.** R41 graded the transfer family and measured an arm with no
memory in it. No number from that pair can be read as an effect — `repaired: 12` came from a pack that
was empty — so the next round is the one that makes the arm what its name says, and it is deliberately
not a new hypothesis: same scenario pair, same split, same floor, same caps.

| defect | who held the reading | who read it |
|---|---|---|
| the distiller's model id is a router name; the endpoint serves the bare one | `LlmClient` (configured) / `restModelOf` (sent) | the artefact records both, and the request carries the one that works |
| a refused prompt was not a failed prompt | `LlmClient.stats.failures` | `V8`, over a population the artefact names (`calls.scope`) |
| the composition was called a fallback and was not one | `resilientInterpreter` (per-event, counted) | `learning.llmFailed` |
| the driver discarded the report that explains an empty store | `DistillReport` | `V32`, which now fires |
| `V44` reconciled `0 <= 0` | the store's ledger | the gate requires a population |

**The registration is `prereg/R42-instrument.md`.** Its predictions are about the instrument: `V1` passes
at a recorded pack, `V32` fires and passes, `V8` fires on the distillation tally, `V44` fires on a
non-empty store, the fired set grows by exactly `V8` and `V32` (11 → 13 evaluable, 28 → 26 absent), `V16`
still fails, and the transfer net stays at or below +5pp with the sign not predicted.

**The one behaviour that could look like a regression and is not.** `host.distill` is now called with a
`fatal` predicate, so a provider that has stopped answering, a spent budget, an expired deadline or a
refused key ends the *run* at distillation instead of emptying the store quietly. A dispatch that stops
there writes no pair artefact, and that is the point: R41 spent thirty-nine minutes of evaluation on a
pack that did not exist.

**Cost.** One dispatch through `sota.yml`, the same configuration as R41. No new dataset, no new model
family, no change to the merge gate.

**Outcome.** The store was built and the pack was still empty. Five predictions held: the model name is
translated where the endpoint is known (`configured=deepseek/deepseek-chat sent=deepseek-chat`), the
distiller answered all seven events it was given, `V44` fired on a non-empty store and passed (0 of 14
items without a domain), `V8` fired on the distillation tally (0/7 calls), and the fired set grew by
exactly two gates (11 → 13 evaluable, 28 → 26 absent). `V16` failed at **88 informative** against a
hundred, as registered, and `l4-paired` reported **+4.00pp** at p = 0.6875 — a direction, not a rate.

**The prediction that failed is the round.** `V1` was registered to pass "at a pack the artefact records".
It failed at **0.00 rules/question**, from a store of fourteen items, on all 200 requests. The arm named
`memory` received no memory. Two causes were found and neither is the mechanism:

| defect | the field that held it | why it stayed silent |
|---|---|---|
| the domain on a claim was the model's spelling | `domainOrigin.storedWithDomain` | `V44` counts items *without* a domain; a wrong one is still one |
| two thirds of the failures named no calls, so taught nothing | `learning.unanswered = 25` | `V32` fired, but there was no population beside `V1` to read it against |
| `meanPackIds` cannot distinguish "never asked" from "served nothing" | `servedPackSizes` | a mean over no request is `0`, and so is a mean over 200 empty answers |

R43 is the two repairs and the census, `§158` carries the reading, `AUDIT` §34.16 the defects, and
`TECH-DESIGN` §17.82 the key.

### R43 — The pack that served nothing, and the half of the failures that taught nothing (**read** 2026-11-04)

**Why.** R42 delivered a store and not a treatment: fourteen items, two hundred requests, zero served. The
next round is the two defects that make those two numbers compatible — a key the reader never asks in, and
a reader that could only learn from one of the two rubric forms τ² writes.

**The registration is `prereg/R43-rubric.md`.** Its predictions, in short: `learning.edited` goes 7 → 32
and `unanswered` 25 → 0; `V32` passes on a population of 32; `V1` either passes or fails with a sentence
that names the layer, never as a bare rate; the census is the round's evidence and the delta is not;
`V8` fires on at least 32 calls; `V16` and `V5` still fail, and **no bar moves this round** — 50 paired
tasks cannot decide 5pp and taking the bar down in the same round that first delivers the treatment would
make the treatment and its bar one decision.

**Refutation.** A store of 32 items with `active: 0` means the defect is confidence and contradiction, not
the key. `servable > 0` with `served = 0` moves the subject to the façade. An informative count below 88
means the rubric-form lessons are prompt noise and must be ablated as their own arm.

**Cost.** One dispatch through `sota.yml`, the same configuration as R42: about 1 h 20 min per arm.

**Outcome (run `41851255477`, head `ae36444`).** The learner half landed and the delivery half did not.
`learning.unanswered` **25 → 0** and `learning.edited` **7 → 12**; `V32-fold-learning-intact` **passes** at
`0/32 unanswered (0.0%), 12 correction(s), 0 distillation failure(s)`. The store holds **24** items and
`active` is **0**: `recall` saw **1,518 requests and served none**, so `meanPackIds` is `0.00` again and the
arm scored 0.38 against the reference arm's 0.42 (−4.00pp, p = 0.7905, n = 50). Two registered predictions
were refuted and both are informative: `edited` reached 12 rather than 32 because twenty of thirty-two
training tasks *passed*, and `V8` fired on 12 calls rather than 32 because a correction is one call. The
refutation branch this entry registered is the one that fired — a store of items with `active: 0` — so the
next round reads admission. `§159` carries the readback, `AUDIT` §34.17/§34.18 the defects, `TECH-DESIGN`
§17.83/§17.84 the census and the admission layer.

### R44 — The store admitted nothing, and the store can say why (**read** 2026-11-06; dispatched 2026-11-04)

**Why.** Three decisions in `decideStatus` write `candidate`: prose without a second task
(`needs-corroboration`), confidence below `activationThreshold` (0.6), and support below `minSupport` (0.8)
— and the last two write the same string. R43 could therefore say *that* 24 items were held and not *why*.

**The registration is `prereg/R44-admission.md`.** Its deliverable is the reason, not a repair: the round
adds a histogram of `statusReason` to `storeCensus`, prints it ranked on the driver's learn line, and reads
it. Its predictions: the histogram is populated and dominated by `insufficient-evidence`, with
`needs-corroboration` at most on the prose-derived corrections and contradictions on none; `V1` finally
prints its population because `tau2ArmRecordOf` now forwards `store` and `recall`; `V32` stays at 0/32;
`V5` still fails and no bar moves; `l4-paired` stays insignificant with its sign unpredicted.

**Pre-excluded.** The obvious suspect — that the driver's manufactured completion reads as a trivial edit to
`trustFor('edit')` — was measured in three conditions and rejected before the dispatch; the test is
committed as a guard so the dispatch cannot be used to re-assert it.

**Cost.** One dispatch through `sota.yml`, the same scenario pair and sample: about 1 h 20 min.

**Readback (run `41872858497`).** The reason is `insufficient-evidence=19` on 19 items, with
`needs-corroboration` and `contradiction-budget-exceeded` on none; `V1` printed `0 of 1427 request(s)
… from a store of 19 (0 active, 0 in scope)`; `V32` stayed at 0/32; `V5` failed at 19.41pp; `l4-paired`
was +12.00pp at p = 0.1460 with an empty pack. Five of six predictions held; the count of corrections
moved 12 → 10 because the training episode is a live model call. The job is `failure` on four blocking
scientific gates while `ci.yml` on the same head is green — two colours, two meanings, both recorded.
`§160` carries the readback, `AUDIT` §34.19 the four defects, `TECH-DESIGN` §17.85 the repair design,
`WHITEPAPER` §3.6.41 the methodological point, `COMPETITIVE` L.5 the competitor data.

**The pre-exclusion was right in kind and wrong in population.** The three guard conditions used one
action with empty arguments; the real retail corpus carries 5–12 actions with 1–5 arguments each. An
offline reproduction on the exact censused file through the real kernel holds **31 of 32** learn items
as candidates. The hypothesis survives, the measurement does not.

### R45 — Admission is a statement about the evidence, not about the edit (**read** 2026-11-06, run `42131391874`, six of six predictions held)

**Why, and why without a second diagnostic dispatch.** `insufficient-evidence` is written by
`confidence < 0.6` **or** `support < 0.8`. R44's histogram cannot separate them, but the decision is
reproducible offline. Measured on the real 32-task learn split: `editDistance` =
`ops / (leaves(before) + leaves(after))` makes `trust` fall as tool arity rises (0.50–0.90), and
`createLlmInterpreter` writes `trust` into both `trust` and `evidence.weight`, so `scoreKnowledge`'s
`weight × logit(trust)` is quadratic. `support` clears 0.8 at `trust = 0.8`; `confidence` there is
0.4806 and the activation boundary is `trust = 0.89`.

**The five-condition ablation selects the repair** (32 real tasks, real kernel, no model call):

| condition | active / 32 | verdict |
|---|---|---|
| A current structural distance | 1 | the defect |
| B gold-verified semantic distance = 1.0 | **32** | the repair; no threshold touched |
| C `activationThreshold` → 0.45 | 17 | wrong lever, admits weak evidence |
| D `minSupport` → 0.5 | 1 | no change; support never the block |
| E `singleObservationTrust` → 0.99 | 1 | no change; contradiction path only |

**Work, TDD-first.** (1) A corpus-shaped failing test in `packages/eval` asserting the 32-task split is
not held at 31 candidates, plus a negative test that a non-`correctionEdit` event is not promoted.
(2) `packages/eval/src/tau2-admission.ts` exports `tau2EditSemantics(before, after): number |
undefined`, returning `1` only for the gold-verified `correctionEdit` shape and `undefined` otherwise
so structural distance remains the default for every other host event. (3) `tau2-driver.ts` passes it
as `editSemantics` to `openMicroglia`; `packages/core` is untouched. (4) `storeCensus` gains an
`admission` block (min/max/mean of `trust`, `support`, `confidence`; the count of `support ≥ 0.8 &&
confidence < 0.6`) and `CensusItem` gains the three optional fields; the driver prints the means.
(5) `pnpm check`, coverage ≥ 95% on every dimension, no mocks, `ci.yml` green before dispatch.

**The registration is `prereg/R45-admission.md`.** Predictions: `store.active > 0`,
`store.servable > 0`, `recall.served > 0`, `meanPackIds > 0`, `V1` passes, admission means near
0.90 / 0.90 / 0.6165, `V32` still 0/32, `V5` still failing, and `l4-paired` **not predicted** — this
is the first round with a treatment, so the effect is genuinely unknown. **Revert rule:** if a served
pack makes `l4-paired` significantly negative (or falls below −5pp), revert on the reading, not on an
explanation. If `active > 0` but `served = 0`, the next round instruments `/v1/recall`, the branch R43
also named.

**Cost.** One dispatch through `sota.yml`, same scenario pair and sample, about 1 h 20 min. No new
dataset, no new model family, no change to the merge gate.

**Shipped and dispatched.** `pnpm check` exit 0; 2,921 tests in 139 files; coverage
99.98 / 100 / 99.67 / 99.98. Commits `b88623e` (repair) and `bd456c3` (coupling
snapshot), pushed as `c65468f0` and `26f7c3f0`. CI `42129954733` failed on the
uncommitted snapshot and `42130978881` is green after it — `AUDIT` §34.20 carries
the defect and its repair. **R45 dispatched** as run `42131391874` on `26f7c3f0`,
both arms, `bird=false`, about 1 h 20 min. No result is claimed before readback.

**R45 read back 2026-11-06 (§163, `AUDIT` §34.24, `TECH-DESIGN` §17.90).** The
run completed `failure` on three blocking scientific gates (`V5` 18.59pp MDE,
`V16` 86 < 100 informative, `l4-paired` `+6.00pp [-6, +20] p=0.5488 n=50`);
`ci.yml` on `26f7c3f0` is green. Both arms scored 50 tasks at `k=4`, memory
`0.42` / reference `0.36`. **All six registered predictions held**: `store 21
active / 21 servable`, `candidate 0`, `reasons confidence-cleared=21`,
admission `0.9000 / 0.9000 / 0.6165`, `supportOnly 0`, `recall 1480 served /
0 empty`, `meanPackIds 1.839`, `V1` PASS, `V32` 0/32, `V8` 0%, `V5` FAIL. The
revert rule (significantly negative or < −5pp with a served pack) does **not**
fire. This is the first dispatch to deliver a treatment in five rounds; the
delivery gap is closed. `V44` reports 21 items all with the retail domain and
`0 widened` under `learn=retail / test=airline / recall=retail`, and the arm
record contains no injected statement — so `+6.00pp` cannot separate an
underpowered lane from an unrelated pack. `AUDIT` §34.24 records the field V1
does not grade.

**R46 round 1 — the use census instrument, shipped (not an arm).**
`packages/eval/src/tau2-use-census.ts` implements §17.89's seven-field
`UseCensus` verbatim plus a derived `coverageProfile` and `zeroCoverageShare`;
`armRecordFromDriver` builds it only from driver-supplied `useObservations`, so
pre-R46 artefacts report "not measured". `tau2ArmRecordOf` carries it forward.
The driver collects `(query, statements)` at the recall facade with the R45
recall call unchanged — `packages/core`, `sota.yml` and every gate untouched.
TDD: `tau2-use-census.test.ts` (9 tests), three `armRecordFromDriver` tests, one
projection round-trip; pinned 32-task fixture, real kernel, no mocks. Two
literal coverage assertions were corrected against `queryCoverage` before
implementation. `pnpm check` exit 0; **2,934 tests in 140 files**; coverage
**99.98 / 100 / 99.68 / 99.98**. The coupling ledger was regenerated for the
one new module and committed; six timing-only result files restored. **No
workflow dispatched yet** — U3's floor must be computed from a census of real
distilled statements, which requires the `as-is` dispatch that carries this
instrument, and §34.22 forbids a floor chosen after seeing `l4-paired`.

**R46 candidate, registered but not opened.** Once a pack is served, ablate the
admission *rule* rather than its input: float evidence weight against the
competitor's distinct-task count, and `minSupport` alone against a `sup3`-style
corroboration floor. IBM's own airline result (101 lossless rules at 40.0%
Pass^4, 14 `sup3` rules at 45.0%) says the selection rule decides the sign, and
`COMPETITIVE` L.6 reads the source that implements it. Three arms, one store, one
pre-registration; blocked on R45's readback because all three are unmeasurable at
zero served items.

**Two more sources read while R45 ran (L.7, §17.87).** MemGuard
([arXiv:2608.21867](https://arxiv.org/abs/2608.21867)) activates only at
`score >= 0.70 && confidence >= 0.60 && uncertainty <= 0.50`, keeps unverified
records provisional, routes failures into guards, and requires
`len(distinct_task_ids) >= 2` before summarising repeated experience — a third
independent implementation that makes distinct-task corroboration the selection
variable. MemAdapter ([arXiv:2610.05162](https://arxiv.org/abs/2610.05162)) adds
the use-side half: even objectively correct memories can harm, because influence
must be calibrated to the current context. Neither paper is a τ²-bench entry,
so the ranking does not move. `TECH-DESIGN` §17.87 sharpens R46 into a twelve-item
skeleton (`as-is` / `distinct-task-support` / `min-support-only`), a type shape,
a P0–P3 table and an explicit dependency layering that leaves `packages/core`,
`sota.yml` and R45's pinned head untouched. R46 remains **not opened**. An
offline support census (`AUDIT` §34.22, `TECH-DESIGN` §17.88) then found that
the copied `sup3` floor of ≥ 3 selects zero groups on the strictest reading of
this 32-task corpus; the floor must now be computed from a census of the real
distilled statements before any dispatch, not carried over from a competitor's
benchmark.

**Remaining after R45, in order.** (2) the revert rule on the readback; (3) R46
admission-rule ablation; (4) transcript-level V46/V47, blocked on the driver
handing `simulations[].messages` to the gate layer; (5) S1a, then S1b (private
vocabulary, a product decision); (6) split `sota.ts` on the signature rule and
move the eight SQL modules to `eval-sql` — stage 3 of R27, mechanical, changes no
number, deferred until the readback so a move is not confused with a result;
(7) W8 dose curve, three pack sizes, one store, powered to find the crossing
point; (8) vitest 4 migration (W2), deliberately last because it changes coverage
semantics; cortex release (W1) **excluded**. `TECH-DESIGN` §17.86 carries the
ten-item dependency list and the P0–P3 table. Every step keeps the same
acceptance bar: TDD, real tests, no mocks, ≥ 95% per dimension, `ci.yml` green,
both repositories pushed as Lambertyan.

**Use-side arms registered 2026-11-06 (`TECH-DESIGN` §17.89, `AUDIT` §34.23).**
The R46 experiment now has a second, independent factor. `stampDomain` writes
the learn domain onto every item, `generalizationPlan` therefore never produces
a widened (`domain === undefined`) item, and the driver compensates by pointing
the recall filter at the store's domain; `buildPack` defaults `minCoverage` to
0. On the pinned 32-item retail set all 32 items pass the scope filter and
75.88% of the 1,600 (airline question, retail rule) pairs have zero
content-term overlap against 20.77% in the within-domain control. Two
structural proxies bracket the real LLM statements, so only the direction is
claimed. Three use-side arms are registered — **U1** domain-faithful recall (a
calibration arm expected to report `served = 0`), **U2** widening-enabled, and
**U3** coverage-floored injection — with one store, one preregistration, a
paired ledger and the same revert rule. **None is opened.** All are blocked on
`served > 0` from R45. U1 and U3 leave `packages/core` untouched; U2 changes
`packages/eval` only if a real test proves widening is reachable without
changing `widenedScopeOf` or `sameRuleShape`.

**Remaining after R45, in order, revised.** (2) the revert rule on the readback;
(3) use census on real distilled statements, then U3 and R46 as registered;
(4) R46 admission-rule ablation with the `>= 2` contrast registered separately;
(5) U1 calibration, then U2 only after a real reachability test; (6)
transcript-level V46/V47; (7) S1a, then S1b; (8) `sota.ts` split and
`eval-sql` move; (9) W8 dose curve; (10) vitest 4 migration, deliberately
last; cortex release (W1) **excluded**. The acceptance bar is unchanged: TDD,
real tests, no mocks, ≥ 95% per dimension, `ci.yml` green, both repositories
pushed as Lambertyan.

**Remaining after R46 round 1, in order, revised again (2026-11-06).** Items
(2) and (3)'s *instrument* are now **done**: the revert rule was read (does not
fire) and `tau2-use-census.ts` ships with TDD. What remains:

1. **P1 — an `as-is` dispatch carrying `useObservations`.** The only next
   measurement. It changes no treatment; its purpose is a census of **real
   distilled statements**, whose distribution the offline structural proxies
   (§34.23) cannot supply. Read `zeroCoverageShare` from that artefact before
   any floor is discussed.
2. **P1 — U3 coverage-floored arm.** The floor is computed from the artefact in
   step 1, registered before the U3 dispatch, never chosen after seeing
   `l4-paired` (§34.22). One store, one preregistration, paired ledger, `V1`
   blocking.
3. **P1 — R46 admission-rule ablation** (`as-is` / `distinct-task-support` /
   `min-support-only`), with MemGuard's `>= 2` corroboration registered as its
   own contrast arm. `served > 0` is now met, so it is unblocked.
4. **P2 — U1 calibration**, then **U2** only after a real reachability test.
5. **P2 — transcript-level V46/V47** (driver hands `simulations[].messages` to
   the gate layer), S1a then S1b.
6. **P3 — `sota.ts` split and `eval-sql` move**, W8 dose curve, vitest 4
   migration deliberately last.
7. **cortex release (W1) excluded** by the standing instruction.

The acceptance bar is unchanged: TDD, real tests, no mocks, ≥ 95% per
dimension, `ci.yml` green, both repositories pushed as Lambertyan, and every
iteration reporting the competitor comparison and the SOTA ranking.

**R46 round 2 — the `as-is` census, registered (2026-11-06) and dispatched on
the next green head.** `prereg/R46-use-census.md` fixes the P1 measurement
before it runs. It is not an arm: dispatch inputs are R45's verbatim
(`l4=true`, `bird=false`, `probe=false`, `l4_arms=both`, `l4_train_share=0.5`,
`adjudicate=false`, `split=minidev`) with only `prereg` renamed, so the artefact
becomes `poc-sota-bird-R46-use-census.json` and R45's is preserved. Six
predictions and six refutation conditions are registered: `use` present on the
memory arm and absent on the reference (the `!MEMORY` driver returns before the
facade), the served population within ten percent of R45's `1480 / 1.839`,
`injectedPairs > 1000` equal to the sum of served pack sizes,
`zeroCoverageShare > 0.5` on real statements, `widenedItems = 0`, R45's
validity gates passing again, and **no prediction** of `l4-paired`'s sign,
magnitude or significance. No floor is chosen here; U3's is computed from the
committed census after the dispatch and registered before its own dispatch
(§34.22). R45's revert rule carries over unchanged.

**Verification before the dispatch.** `pnpm eval:prereg prereg/R46-use-census.md`
reports `1/1 valid`; `pnpm eval:protocol` reports `all claims hold`;
`pnpm check` exits 0 with 2,934 tests in 140 files and coverage 99.98 / 99.69 /
100 / 99.98. Six regenerated result files were classified as timing-only and
restored; the coupling ledger is unchanged. `ci.yml` run `42149283405` on
`c2da0b55` is read green from the remote. The final R45 watcher line
(`completed failure`, `Pair the arms` failing, evidence uploaded) agrees with
§34.24 and §17.90 with no new deviation.

**Remaining after this registration, in order.** (1) read the `as-is`
artefact's `use` block and `zeroCoverageShare` from the remote; (2) U3's floor
computed from that census and registered before its dispatch, with `V1`
blocking; (3) R46 admission-rule ablation (`as-is` / `distinct-task-support` /
`min-support-only`) with the `>= 2` contrast registered separately; (4) U1
calibration, then U2 only after a real reachability test; (5) transcript-level
V46/V47, S1a then S1b; (6) `sota.ts` split and `eval-sql` move, W8 dose curve,
vitest 4 migration deliberately last; (7) cortex release (W1) **excluded**.
`TECH-DESIGN` §17.91 carries the configuration, the reading plan and the
dependency layering; `AUDIT` §34.26 carries the twelve fixed decisions and the
priority table.

**R46 round 2 — dispatched 2026-11-07 as run `42317807270`.** The registration
pushed as `cb329054` (`microglia` master) and `3ebfbe0c` (`microglia-docs`
main), both Lambertyan +0800. `ci.yml` `42317463372` was read green from the
remote on `cb329054` before any dispatch, and the remote prereg blob was
verified byte-for-byte (`sha256 ac8fa19f…`, 5,917 bytes). Only then was
`sota.yml` dispatched with the registered inputs (`http=204`); run
`42317807270` on `cb329054` is `in_progress` with a watcher polling to
completion. R45's real artefact cross-checks the census prediction:
`meanPackIds 1.8392 x 1480 ≈ 2,722` injected pairs, and R45 carries no `use`
block, so pre-R46 artefacts correctly read "not measured". **The pinned head
is not touched while it measures** (§34.21); this waiting round pushes docs
only.

**Five use-side sources read while the census ran (`COMPETITIVE` L.11,
`TECH-DESIGN` §17.92, `AUDIT` §34.27).** MemCalib
([arXiv:2609.24259](https://arxiv.org/abs/2609.24259)) grades per-atom
influence Ignore / Bound / Control and reports the best frontier model
over-using on 53.33% of atoms; its code is public. CMI
([arXiv:2608.07622](https://arxiv.org/abs/2608.07622)) separates lexical and
dense interference. CAMEL
([arXiv:2605.09330](https://arxiv.org/abs/2605.09330)) isolates three spurious
patterns. The Memory Curse study holds prompt length fixed and finds content
is the trigger. The PFM pathology
([arXiv:2610.10265](https://arxiv.org/abs/2610.10265)) locates the bottleneck
before retrieval. None is a tau-squared-bench entry; **none changes the order
of the remaining steps above**, and none opens an arm, adds a gate, edits a
preregistration or moves the ranking. IBM `gpt-5.5` airline **82.0** remains
the SOTA; microglia **fifth of six named entries**. The single remaining
blocker is the readback of run `42317807270`.

**R46 round 2 — read back 2026-11-07; the blocker is cleared (`AUDIT` §34.28,
`TECH-DESIGN` §17.93, `PROGRESS` §166, `COMPETITIVE` L.12, `WHITEPAPER`
§3.6.47).** Run `42317807270` on `cb329054` completed `failure` at 01:49Z:
step 13 `Pair the arms` exited 1 on `V5` (MDE 13.73pp), `V16` (81 informative
trials) and `l4-paired` (`0.00pp [-10, +10] p=1.0000`, 50 paired tasks); both
arms and the `l4-evidence` upload (20,276,206 bytes, 92 entries) succeeded, and
`ci.yml` on that head is green. This is a scientific gate refusing to certify
an underpowered measurement, not a build failure. **Five of six pre-registered
predictions hold, one is falsified, no refutation condition fires, and R45's
revert rule does not fire.**

| # | registered prediction | reading | verdict |
|---|---|---|---|
| 1 | `use` present on memory, absent on reference | memory carries it; the `!MEMORY` driver returns before the facade | hold |
| 2 | served population within ten percent of R45's `1480 / 1.839` | `1512 / 1.9947` served | hold |
| 3 | `injectedPairs > 1000` and equal to the sum of served pack sizes | `3016 = 1.9947 x 1512` | hold |
| 4 | `zeroCoveragePairs > 0` and `zeroCoverageShare > 0.5` | `1175 / 3016 = 0.3896` | **falsified** (magnitude) |
| 5 | `widenedItems = 0` | `0`; `V44` reports 0 of 14 items with no domain, 0 widened | hold |
| 6 | R45 validity gates pass, `V5`/`V16` unresolved, `l4-paired` sign not predicted | all pass; both unresolved; `0.00pp` | hold |

The falsification is a reading, not a defect in the run: the offline structural
proxy (0.7588 cross-domain, 0.2077 within-domain, §34.23) is not the real
distilled statement. This is the second independent measurement of that fact
(§34.22) and the first hard number for the standing use-side hypothesis —
0.3896 of what the model was shown shared no content term with the question.
Refutation branches are all clear: the `use` block exists with 3,016 pairs;
`1175 <= 3016` and the share is in `[0, 1]`; no validity gate regresses;
`l4-paired` is neither significantly negative nor below minus five points; the
evidence artefact is present; no floor was chosen from an accuracy number. The
observation round adds no accuracy claim that could soften the revert rule.

**Same configuration, different store — a direct noise-floor reading.** R45 and
R46 were dispatched with verbatim-identical inputs, only `prereg` renamed. R45
distilled 21 active items from 11 corrections, served 1,480 requests and
measured `+6.00pp [-6, +20] p=0.5488`; R46 distilled 14 from 7 corrections,
served 1,512 and measured `0.00pp [-10, +10] p=1.0000`; both arms now score
`pass^4 0.46` and both MDEs exceed 13pp. The distiller is an LLM call, so the
learning half is nondeterministic and the store population drifts between two
runs of one split. No accuracy claim is drawn from either.

**Defect 25, found by reading the artefact.** §17.89 registers a *committed
histogram* as U3's P0 prerequisite. R46 committed none: `armRecordFromDriver`
reduced the driver's raw `useObservations` to the seven-field `UseCensus` and
discarded the pairs, and `coverageProfile` / `zeroCoverageShare` had no
production caller. The artefact carries exactly one coverage number. A scalar
cannot say what a non-zero `minCoverage` floor would empty: a real-kernel
offline probe on the fingerprinted 32-task fixture measured two populations
with the identical registered scalar (`zeroShare 0.7588`) whose retained
fractions at `minCoverage = 0.05` differ by **12.44pp** (17.63% vs 5.19%),
with non-zero coverage concentrated in the left tail (p10 0.04, p50 0.069, p90
0.143) and a post-floor served population spanning a **33.24pp** interval
(`[165, 657]` of 1,480). A floor chosen from intuition could fail `V1` by
construction. This is the use-side twin of §34.22.

**Repair, TDD and additive.** `coverageHistogram` reduces the same facade
observations to a committed `CoverageHistogram`: a fixed, finite, ascending
`COVERAGE_FLOORS` grid (including 0), the retention curve at each rung
(`retainedPairs`, `retainedPacks`, `emptiedPacks`), non-zero coverage quantiles
and separately reported content-free queries. It is computed in
`armRecordFromDriver` and projected through `tau2ArmRecordOf`; it calls
`coverageProfile`, so the two readings share one population by construction and
the profile is no longer dead code. The seven-field `UseCensus` is unchanged
verbatim; `coverage` is an optional sibling field, so R45, R46 and every older
artefact read "not measured" rather than a fabricated zero. No gate reads
`coverage`; `packages/core`, `sota.yml`, `bin/tau2-driver.ts`, `bin/l4-pair.ts`
and every gate definition are untouched. Seven failing tests were written
first, including a real-kernel regression proving two populations with
identical seven registered fields commit different histograms. `pnpm check`
exits 0: **2,944 tests in 140 files, coverage 99.98 / 99.69 / 100 / 99.98**.
The coupling ledger moved structurally (37,746 -> 37,883 production lines,
138 modules unchanged, `coupledShare` 0.1929 -> 0.1922) and is committed; six
result files differing only in `ranAt` / `p50` / `p95` were restored.

**Remaining after this readback, in order (P0–P3).**

| priority | step | blocked by |
|---|---|---|
| P0 | both repositories pushed as Lambertyan, `ci.yml` green on the new head | this iteration |
| P1 | an `as-is` observation that reads the committed `CoverageHistogram` from a real dispatch, registered before it runs | green head |
| P1 | U3 coverage-floored arm: floor computed from that histogram, registered before its own dispatch, `V1` blocking | the histogram reading |
| P1 | R46 admission-rule ablation (`as-is` / `distinct-task-support` / `min-support-only`) with the `>= 2` corroboration contrast registered separately | the histogram reading |
| P2 | U1 calibration, then U2 only after a real reachability test | U3 |
| P2 | transcript-level V46/V47 (driver hands `simulations[].messages` to the gate layer), S1a then S1b | U1 / U2 |
| P3 | `sota.ts` split and `eval-sql` move, W8 dose curve, vitest 4 migration deliberately last | independent |
| — | cortex release (W1) **excluded** by the standing instruction | — |

**What stays closed.** No floor is chosen here. U1, U2, U3 and the R46
admission-rule arms remain closed: a histogram must first be read from a real
dispatch, and a floor is registered before its own dispatch, never from
`l4-paired` (§34.22). The pinned measuring head was not touched while it ran
(§34.21).

**Ranking and competitor comparison (unchanged).** IBM `gpt-5.5` airline
**82.0** (unverified, PR #551) is the current SOTA; SapientAI 72.0; IBM
`gpt-4.1 sup3` 44.0 (#8); stock `gpt-oss-120b` 34.0; microglia **fifth of six
named entries**. The use-side sources behind the hypothesis are unchanged —
MemCalib, CMI, CAMEL, the Memory Curse study, PFM, plus ALTK-Evolve, MemGuard,
MemAdapter, AECG and MemPABench; none is a tau-squared-bench entry and none
supplies a threshold that can be copied into U3. The column microglia leads is
still "whether the treatment was delivered", now `1512 served` with `3016`
injected pairs of which `1175` carry no shared content term. An observation
round, a falsified prediction and an additive evidence field move no
leaderboard row.

**Acceptance bar, unchanged.** TDD, real tests, no mocks, >= 95% coverage on
every dimension, `ci.yml` green, both repositories pushed as Lambertyan, no
CJK, no skipped tests, no placeholder markers, no credential value, all
documents and code comments in English, and every iteration reporting the
competitor comparison and the SOTA ranking.

**R47 registered 2026-11-07 — read the ladder before choosing a rung
(`AUDIT` §34.29, `TECH-DESIGN` §17.94, `PROGRESS` §167, `COMPETITIVE` L.13,
`WHITEPAPER` §3.6.48).** Defect 25's repair is shipped and green: `microglia`
master `d5497a8e`, `microglia-docs` main `fedc3c4b`, both Lambertyan +0800
with remote trees verified byte-for-byte. `ci.yml` `42334137993` on
`d5497a8e` completed `success` with all 40 steps green. `pnpm check` exits 0:
2,944 tests in 140 files, coverage 99.98 / 99.69 / 100 / 99.98; section 34.28
records the plus-or-minus 0.01 v8 branch non-determinism. Six times-only
result files were restored and the four structural coupling changes are
committed.

`prereg/R47-coverage-histogram.md` registers the P1 step before it runs. It
is **not an arm**: dispatch inputs are R45's and R46's verbatim with only
`prereg` renamed, so the artefact becomes
`poc-sota-bird-R47-coverage-histogram.json` and both earlier files survive.
It reads the memory arm's `tau2.coverage` beside the unchanged seven-field
`tau2.use`, with eight falsifiable predictions:

| # | prediction | why it can be wrong |
|---|---|---|
| 1 | `coverage` on memory, absent on reference | the instrument may not cross the process boundary |
| 2 | ten `floors` rows, first `minCoverage` 0, strictly increasing | the grid may not be the fixed one in source |
| 3 | `measuredPairs + unmeasurablePairs = use.injectedPairs` | the two readings may count different pairs |
| 4 | at every rung `retainedPacks + emptiedPacks + unmeasurablePacks = use.recallServed` | the pack buckets may not reconcile |
| 5 | at rung 0 `retainedPairs = measuredPairs` and `emptiedPacks = 0` | the as-is rung may not be the identity |
| 6 | `retainedPairs` never rises, `emptiedPacks` never falls, some positive rung has `emptiedPacks > 0` | the grid may have no pack-level resolving power |
| 7 | `nonzeroQuantiles` non-decreasing, all in 0 to 1, `min > 0` | the sorted population may be built incorrectly |
| 8 | every R45/R46 validity gate passes again, `use` shape unchanged, `widenedItems = 0` | the dispatch may have changed a behaviour |

Prediction 6's last clause is the substantive falsifiable claim: if no served
pack is emptied by any positive rung, the fixed grid cannot grade `V1` on this
corpus and U3 cannot be registered from it. **No numeric share is predicted** —
R46 registered `zeroCoverageShare > 0.5` from an offline proxy and read 0.3896
on real distilled statements, and repeating that extrapolation would repeat
the defect. The sign, magnitude and significance of `l4-paired` are not
predicted. Six refutations cover a missing or reference-side `coverage` block,
any failed reconciliation identity, a broken grid or quantile ordering, R45's
revert rule and validity-gate regression, an absent evidence artefact, and any
floor chosen from an accuracy number, from the offline proxy or from a
post-run edit to a registration.

**Verification before any dispatch.** `pnpm eval:prereg` 35 of 35 valid;
`pnpm eval:protocol` all claims hold; `pnpm check` exit 0 with `audit: ok` and
`bundle:size ok`; the coupling ledger is unchanged because a pre-registration
adds no production line. No gate reads `coverage`; `packages/core`,
`sota.yml`, the driver and `bin/l4-pair.ts` are untouched.

**Remaining after this registration, in order (P0–P3).**

| priority | step | blocked by |
|---|---|---|
| P0 | both repositories pushed as Lambertyan, `ci.yml` green on the R47 head | this iteration |
| P1 | dispatch R47 as-is, read the committed `CoverageHistogram` from `l4-evidence`, grade all eight predictions and six refutations | green head |
| P1 | U3 coverage-floored arm: floor computed from that curve, registered before its own dispatch, `V1` blocking | the R47 readback |
| P1 | R46 admission-rule ablation (`as-is` / `distinct-task-support` / `min-support-only`) with the `>= 2` corroboration contrast registered separately | the R47 readback |
| P2 | U1 calibration, then U2 only after a real reachability test | U3 |
| P2 | transcript-level V46/V47 (driver hands `simulations[].messages` to the gate layer), S1a then S1b | U1 / U2 |
| P3 | `sota.ts` split and `eval-sql` move, W8 dose curve, vitest 4 migration deliberately last | independent |
| — | cortex release (W1) **excluded** by the standing instruction | — |

**What stays closed.** No floor is chosen here. U1, U2, U3 and the R46
admission-rule arms remain closed until the histogram is read from a real
dispatch; a floor is registered before its own dispatch, never from
`l4-paired` (§34.22).

**Ranking and competitor comparison (unchanged).** IBM `gpt-5.5` airline
**82.0** (unverified, PR #551) is the current SOTA; SapientAI 72.0; IBM
`gpt-4.1 sup3` 44.0 (#8); stock `gpt-oss-120b` 34.0; microglia **fifth of six
named entries**. The use-side sources behind the hypothesis are unchanged —
MemCalib, CMI, CAMEL, the Memory Curse study, PFM, plus ALTK-Evolve,
MemGuard, MemAdapter, AECG and MemPABench; none is a tau-squared-bench entry
and none supplies a threshold that can be copied into U3. The column
microglia leads is still "whether the treatment was delivered", now
`1512 served` with `3016` injected pairs of which `1175` carry no shared
content term. A shipped instrument, a green CI run and a registered
observation move no leaderboard row.

**Acceptance bar, unchanged.** TDD, real tests, no mocks, >= 95% coverage on
every dimension, `ci.yml` green, both repositories pushed as Lambertyan, no
CJK, no skipped tests, no placeholder markers, no credential value, all
documents and code comments in English, and every iteration reporting the
competitor comparison and the SOTA ranking.

### R47 in flight: the use-side cost rule, and the remaining order

**Current position.** P0 is closed: both repositories were pushed as
Lambertyan (`bc0a39eb` on `microglia@master`, `e33c73af` on
`microglia-docs@main`), the R47 pre-registration blob is byte-identical on the
remote, `ci.yml` `42336894395` went green on 44 steps, and the dispatch returned
HTTP 204 as run `42337250684` on `bc0a39eb`. On resume the L4 job had completed
the memory arm and entered the reference arm (step 12 of 19); BIRD and the
retrieval probe were correctly skipped. A watcher is alive. Section 34.21's
head-still rule applies: no `microglia` source, gate, threshold, pre-registration
or second dispatch changes while R47 measures. This iteration's permitted
parallel work is source study, documentation and an offline probe.

**What this iteration added to the plan.** Three first-party readings, all in
`AUDIT.md` section 34.30 and `TECH-DESIGN.md` section 17.95. IBM's held-out
airline ablation shows `sup3` (14 guidelines) at Pass^4 45.0 versus
`lossless` (101) at 40.0 while the larger set wins on Mean Accuracy 65.0 to
60.0 — the SOTA system measuring its own non-monotonic memory dose. Six
benchmarks (MemSyco-Bench, OP-Bench, MemCalib, BenchPreS, RPEval, LongMemEval)
place 61 to 62 percent of errors after retrieval, score memory systems below a
memory-free baseline, and show over-use dominating. The real-kernel offline
probe showed the structure-only cost rule is robust to all three cost orderings
but returns a plateau `[0.01, 0.02, 0.03]`, and that the proxy's `zeroShare
0.7588` overstates R46's real `0.3896` by 36.92 points. Consequence for U3: the
registration must declare a **tie-break rule and the cost weights before the
dispatch that applies the floor**; an array-order default is not acceptable.

**Remaining steps, in order (P0–P3), updated.**

| priority | step | blocked by | status |
|---|---|---|---|
| P0 | two repositories pushed, `ci.yml` green on the R47 head | — | **done** |
| P0 | documentation and offline source study while the run measures | — | **done** |
| P1 | read R47 `l4-evidence`: grade 8 predictions, 6 refutations, 3 reconciliation identities, quantile order, positive-rung `emptiedPacks > 0` | run `42337250684` | **done — all hold, `U3_ELIGIBLE = true`** |
| P1 | compute the admissible set from the committed curve and register cost weights and tie-break before its own dispatch | R47 readback | **done — `0.01`, `alpha=1, gamma=3, beta=0.5`, least-aggressive** |
| P1 | implement the U3 application path from registration to the recall facade | the decision | **done — 5-point wiring, TDD, 31 new tests** |
| P1 | dispatch the U3 coverage-floored arm (`R48-u3-coverage-floor`) through `sota.yml` | green CI on the new head | **done — run `42350304597` on `33038232`, in progress** |
| P1 | read R48 `l4-evidence`, grade 8 predictions and 7 refutations, pair its memory arm against R47's as-is memory arm | the R48 dispatch | pending |
| P1 | R46 admission-rule ablation (`as-is` / `distinct-task-support` / `min-support-only`) with the `>= 2` contrast registered separately | R47 readback | pending |
| P2 | U1 calibration using the MemCalib score structure on committed coverage, then U2 only after a real reachability test | U3 readback | pending |
| P2 | transcript V46/V47, S1a then S1b | U1 / U2 | pending |
| P3 | `sota.ts` split and `eval-sql` move, W8 dose curve, vitest 4 migration last | independent | pending |
| — | cortex release (W1) **excluded** by the standing instruction | — | excluded |

**What this iteration changed in the plan.** R47's readback closed the P1
measurement step: eight structural predictions held, three reconciliation
identities held, six refutations stayed clear and the grid has pack-level
resolving power. It also corrected a design claim: the structure-only cost
rule is not robust to cost weights on the real curve, so weights have no
default and are registered in `R48-u3-coverage-floor.md` rather than tuned
after the readout. The U3 step therefore split into three checkable parts —
decide, wire, dispatch — and the first two are done with real-fixture TDD. The
dispatch remains the only P1 item between the current head and the readback
that can quantify U3's contribution. Section 34.21's head-still rule is lifted
on the R47 reading; it applies again from the moment R48 is dispatched.

**Decision points at the readback.** If the three reconciliation identities
hold, quantile ordering holds, and at least one positive rung empties a pack,
the grid has pack-level resolving power and U3 can be registered from the
committed curve. If any identity fails, or the grid is broken, the instrument is
reverted on the reading and U3 stays closed. If no positive rung empties a pack,
R47's sixth prediction is falsified: the fixed grid cannot grade `V1` on this
corpus and U3 cannot be registered from it — the registration is not rewritten
after the fact. If `l4-paired` is significantly negative or below minus five
points with a served pack, R45's revert rule fires unchanged.

**Ranking and competitor comparison (unchanged).** IBM `gpt-5.5` airline
**82.0** (unverified, PR #551, filed 21 Sep 2026, modified prompt, still open)
is the current SOTA; IBM `gpt-4.1` retail 67.5 (PR #542) ahead of RAFT-30B-A3B
61.4; SapientAI 72.0; IBM `gpt-4.1 sup3` 44.0 (#8); stock `gpt-oss-120b`
34.0; microglia **fifth of six named entries**. The newly read use-side sources
— MemSyco-Bench, OP-Bench, BenchPreS, RPEval, LongMemEval, RSCB-MC, FinAcumen,
MIST and Meta's "Remember When It Matters" — join MemCalib, CMI, CAMEL, the
Memory Curse study, PFM, ALTK-Evolve, MemGuard, MemAdapter, AECG and
MemPABench. None of the new papers is a tau-squared-bench Pass^4 entry, and
Meta's pass@1 ablation cannot be placed in that ranking. The column microglia
leads is still "whether the treatment was delivered": `1512 served`, `3016`
injected pairs, `1175` with no shared content term. A source study, a probe
and a green CI run move no leaderboard row.

### R48's retry: the order is unchanged, with one new P1

The first U3 run `42350304597` produced no measurement because DeepSeek
returned a persistent 500 during both arms' learn and eval phases; its
evidence zip has zero `arms/` entries and only repository-baseline files. The
retry `42353229972` is on the same head `33038232` and the unchanged prereg
`R48-u3-coverage-floor`, with step 11 succeeding again. Under the head-still
rule of section 34.21, `microglia` has zero changes this iteration and
`ci.yml 42349873647` stays green on all 44 steps. The order below is the order
already registered, with defect 27 added as a bounded P1.

| priority | step | blocked by | status |
|---|---|---|---|
| P0 | `ci.yml` green on the R48 head, both repositories pushed as Lambertyan | — | **done** |
| P0 | record `42350304597` as infrastructure failure / no measurement, examine the artefact, register defect 27 | — | **done this iteration** |
| P0 | read `42353229972`'s `l4-evidence`: grade 8 predictions, 7 refutations, 3 reconciliation identities, and pair its memory arm against R47's as-is arm per task | run `42353229972` | **in progress, step 12** |
| P1 | quantify U3's contribution to `pass^4`, paired delta, delivered population and `emptiedPacks`; revert on the reading if the rule fires | R48 readback | pending |
| P1 | defect 27: a fail-fast provider health probe before the L4 job, on a later head only; no fewer trials, no skipped learn phase, no partial artefact, no failure-masking step | R48 readback | **registered, not started** |
| P1 | R46 admission-rule ablation (`as-is` / `distinct-task-support` / `min-support-only`) with the `>= 2` contrast registered separately | R48 readback | pending |
| P2 | U1 calibration using the MemCalib score structure on committed coverage, then U2 only after a real reachability test | U3 | pending |
| P2 | transcript V46/V47, S1a then S1b | U1 / U2 | pending |
| P3 | `sota.ts` split and `eval-sql` move, W8 dose curve, vitest 4 migration last | independent | pending |
| — | cortex release (W1) **excluded** by the standing instruction | — | excluded |

Five sources read while the arms measure (Memory Funnel, Human-Inspired
Memory, dual-trace encoding, the driving-agent audit and a re-check of IBM's
PR #542/#551) are quantified in `COMPETITIVE.md` section L.16. Their numeric
thresholds are not portable into `COVERAGE_FLOORS` or R46's contrast.
Ranking is unchanged: IBM `gpt-5.5` airline 82.0 remains the SOTA, microglia
fifth of six named entries, and a failed run with a lawful retry moves no row.

### Semantic anchors registered while the retry measures

`AUDIT.md` section 34.34 and `TECH-DESIGN.md` section 17.98 now register what
the next two arms will measure, without opening them. MemCalib's separate
over-use `O` and under-use `U` with `SCS = mean(rho^(O + U))` map structurally
onto `zeroCoveragePairs` and `emptiedPacks` for U1, and its finding that the
skew is model-dependent (all models but Qwen3-8B over-use; Qwen3-8B reverses
and beats a larger model) corroborates registering U3's cost weights with no
default. The Memory Funnel's `consolidate.py` split between confidence
(independent corroboration, capped at 0.95) and importance (usage frequency)
gives R46's `distinct-task-support` and `min-support-only` comparators their
meaning, with the `>= 2` contrast testing the bar itself. Both sources'
numeric thresholds are their own and are not imported. An offline readback
verifier with three terminal states is self-tested and staged for the P0
readback. The P0-P3 table in the preceding section is unchanged, run
`42353229972` is still on step 12, and U1, U2 and R46's arms stay CLOSED until
a valid paired readout exists. Ranking is unchanged: IBM `gpt-5.5` airline
82.0 remains the SOTA, microglia fifth of six named entries.


### After the revert: the order from a within-run pair (2026-11-07)

Run `42353229972` measured U3 for real and the R45 revert rule fired on the
within-run `l4-paired` gate `-6.00pp` with 965 served packs. The applied floor
`0.01` is reverted to the as-is default; the arm is measured, refuted and
reverted, not re-dispatched. P8 failed because the two dispatches did not share
a learning phase or a store (8 vs 12 distilled items) and the reference arm
drifted 14 points. `TECH-DESIGN` 17.40 and Read 7 predicted exactly this
confound. The order below supersedes the table in "R48's retry"; nothing here
edits any preregistration.

| priority | step | blocked by | status |
|---|---|---|---|
| P0 | record the retry's real readout, the firing revert and the two defects in all six documents | — | **done this iteration** |
| P0 | lift the revert rule into typed, TDD, CI-gated production code with real committed readings | — | **done this iteration** |
| P0 | `pnpm check` green, both repositories pushed, `ci.yml` green on the new head | — | **done this iteration** |
| P1 | design a **within-run pair**: one dispatch, one learning phase, one store, one reference arm, only the recall facade varied between as-is and floored; register predictions, refutations, cost weights and tie-break before its dispatch | P0 | pending |
| P1 | decide whether the within-run pair needs a third driver lane or a paired facade in `sota.yml`; TDD the wiring on a real fixture, no mocks, coverage at least 95 percent on every dimension | within-run design | pending |
| P1 | defect 27's fail-fast provider health probe with an explicit no-measurement marker; bounded to a later head, never fewer trials or a partial artefact | independent | pending |
| P1 | R46 admission-rule ablation (`as-is` / `distinct-task-support` / `min-support-only`) with the `>= 2` corroboration contrast registered separately | a valid within-run pair | CLOSED until then |
| P2 | U1 calibration on the MemCalib score structure over committed coverage, then U2 only after a real reachability test | a valid pair | CLOSED until then |
| P2 | transcript V46/V47, then S1a, then S1b | U1 / U2 | pending |
| P3 | `sota.ts` split, `eval-sql` move, W8 dose curve, vitest 4 migration deliberately last | independent | pending |
| — | cortex release (W1) **excluded** by the standing instruction | — | excluded |

The revert is a governance action on a reading, not a finding that the floor
is harmful: the measurement is underpowered (MDE 14.83pp) and confounded
(defect 29). No accuracy number is claimed in either direction, and no leader
board row moves. Ranking is unchanged: IBM `gpt-5.5` airline 82.0 remains the
SOTA, microglia fifth of six named entries.


### The within-run pair: the invariant first, then the wiring (2026-11-07)

A reader asked why the leading competitor's implementation is not reproduced
before learning from the others. `COMPETITIVE` L.19 answers it: the mechanisms
were read at source and transferred, twelve competitor designs are already
registered, and the `82.0` number is not a replicable object (L.8). The
`cross-model-guideline-control` arm registered in L.8 stays **registered and
not dispatched**; it would add a second learning phase and a second store
beside the pair this lane needs. The next dispatch is the within-run pair.
Cortex release remains excluded.

**Architecture decision.** `TECH-DESIGN` 17.101 records it with source
evidence: a paired facade inside one `tau2-driver.ts` `run()`, not a third
driver lane and not a store snapshot. `run()` learns, distils, builds one store
and evaluates as one unit, so a second lane would re-learn and reproduce defect
29 by construction. `bin/l4.ts` writes one artefact from one `run()`;
`bin/l4-pair.ts` already joins two artefacts via `L4_FIRST`/`L4_SECOND`. The
wiring needs one extra artefact per run, not a new lane.

**Completed this iteration, P0.**

| item | file | result |
| --- | --- | --- |
| typed invariant, three terminal states | `packages/eval/src/within-run-pair.ts` | `RunScope`, `scopeDifference`, `withinRunPair`, `FacadeContrast` tagged `facade-contrast` |
| real committed scopes | `eval/fixtures/tau2-facade-scopes.json` | R47 8 items / 0.30 / 1491 served; R48 12 items / 0.44 / 965 served; labelled structural identity control |
| 29 tests | `packages/eval/src/__tests__/within-run-pair.test.ts` | 29 pass, real scopes, eight fields, all grid rungs, both refusals, mirror case, malformed instruments |
| additive export | `packages/eval/src/index.ts` | `WithinRunPairVerdict` named to avoid the existing `PairVerdict` collision |
| full gate | `pnpm check` | 3023 tests / 144 files / 99.97 / 99.67 / 100 / 99.97 / `audit: ok` / `bundle:size ok` / exit 0 |
| structural ledger | `eval/results/poc-coupling.json` | 141 -> 142 modules, 38236 -> 38444 production lines; six timing-only JSONs restored |

**Remaining order.** The table in "After the revert: the order from a
within-run pair" still governs; the P1 line items below make its first P1
explicit and nothing in it edits any pre-registration.

| priority | step | blocked by | status |
| --- | --- | --- | --- |
| P1 | extract `evaluate(floor)` in the driver, one store, two facades, `pairedFacades()` additive export; TDD on a real fixture before implementation | P0 done | pending |
| P1 | additive second-artefact writer in `bin/l4.ts`; TDD first | driver wiring | pending |
| P1 | `sota.yml` paired step with `L4_FIRST`/`L4_SECOND`, reference arm unchanged, floor pair from the registration | both above | pending |
| P1 | `prereg/R49-within-run-pair.md` with predictions, refutations, weights and tie-break before dispatch | design frozen | pending |
| P1 | dispatch, three-terminal readback, R45 revert rule graded only on the within-run gate | registration | pending |
| P1 | defect 27 fail-fast provider probe with an explicit no-measurement marker | independent | pending |
| P2 | U1, U2, R46 admission-rule arms | a valid paired readout | CLOSED until then |
| P3 | `sota.ts` split, `eval-sql` move, W8 dose curve, vitest 4 last | independent | pending |

No new `Pass^4` number is claimed. Ranking is unchanged: IBM `gpt-5.5` airline
82.0 remains the SOTA, microglia fifth of six named entries.


### R49 wiring complete, dispatch next (2026-11-07)

| Priority | Step | State |
| --- | --- | --- |
| P0 | Paired-facade contract, pre-flight probe, typed invariant, TDD, full gate, six-document sync, two-repository push, CI green | done |
| P1 | Dispatch R49 through `sota.yml` and read back `PAIRED / REFUSED_CROSS_RUN / NO_MEASUREMENT` | next |
| P1 | Defect 27 provider probe, now implemented and registered as opt-in | done in code, exercised by the dispatch |
| P2 | U1 / U2 / R46 arms | closed until a valid PAIRED reading exists |
| P2 | Isolated cross-model control registered in COMPETITIVE L.8 | registered, not dispatched |
| P3 | `sota.ts` split, W8 dose curve, vitest 4 | pending |
| — | cortex release | excluded by standing instruction |

The gate for this iteration: 3104 tests over 147 files, coverage 99.94
statements / 99.63 branches / 100 functions / 99.94 lines, `audit: ok`,
bundle size ok, 37 of 37 pre-registrations valid, and three end-to-end lane
tests. The structural ledger records 144 modules. No `Pass^4` number is
claimed and no SOTA row moves.


### R49 re-dispatch and the refusal contract (2026-11-07)

The first R49 dispatch is cancelled (AUDIT 34.39) and the workflow now refuses a
`prereg` input with a `.md` suffix, checks the file exists, and does not let the
reference arm run when the registration check failed. The refusal contract is
structural (AUDIT 34.40, TECH-DESIGN 17.103), so an empty store or an
unattestable pair writes `status_no_measurement` instead of a stack trace.

Order from here:

1. Re-dispatch R49 with `prereg = R49-within-run-pair`, every other input
   identical to R48, and read the pair artefact back into its three terminal
   states.
2. If PAIRED: report the floor's interval, p-value and delivered population,
   and let the main `poc-l4` artefact grade the registered facade against the
   memory-free reference exactly as R48 did.
3. If REFUSED_CROSS_RUN: the design is broken; fix the scope attestation before
   any further arm is opened.
4. If NO_MEASUREMENT: record what was missing -- provider, store or scope -- and
   re-dispatch, never a zero.
5. U1, U2 and the R46 arms stay closed until a valid paired reading exists.
6. cortex release remains excluded.

### The abstention census, while R49 measures (2026-11-07)

R49's memory arm is the long pole: two facades over the held-out split, each two
hundred and twenty-eight episodes, on one store. While it runs, the instrument
the next arm needs was built — a delta with no mechanism beside it cannot be
attributed, and the published ablations say the mechanism is abstention.

| Priority | Step | State |
| --- | --- | --- |
| P0 | Per-episode action census in the phase, per-task reduction with four refusal states, optional artefact field, summary line, 28 tests, `inaction.ts` at 100/100/100/100 | done |
| P0 | Full gate: 3143 tests / 148 files, 99.95 / 99.64 / 100 / 99.95, `audit: ok`, verifier self-test, bench gates, bundle size | done |
| P0 | Six-document sync and both repositories pushed | done |
| P1 | Read R49 back into `PAIRED / REFUSED_CROSS_RUN / NO_MEASUREMENT` and report the interval, the p-value and the delivered population | running |
| P1 | Register the next floor arm, now with the census required by its verifier | blocked on the readback |
| P2 | U4 pack order, U5 pack ceiling, U6 fresh-versus-cumulative | registered, undispatched |
| P2 | U1, U2, R46 admission arms | closed until a valid paired reading |
| P3 | `sota.ts` split, W8 dose curve, vitest 4 | pending |
| — | cortex release | excluded by standing instruction |

No `Pass^4` number is claimed by this iteration and no SOTA row moves. The
ranking stands where R48 left it: IBM `gpt-5.5` airline 82.0 is the published
SOTA, and microglia is fifth of six named entries. What changed is what the next
number will be able to say.

### Write-side admission, and what it makes dispatchable (2026-11-07)

R49's memory arm finished at 16:13 UTC (88 minutes, two facades over the held-out
split, one store) and the reference arm is running. Nothing here touches that
dispatch; the commit lands after it and is off by default.

| Priority | Step | State |
| --- | --- | --- |
| P0 | `kernel/write-admission.ts`: `add` / `update` / `noop` against the top-10 neighbours, four refusals, `wouldChange` shared with the merge, 24 unit tests, 100/100/100/100 | done |
| P0 | Distiller wiring after the exact-key merge and after generalisation; `suppressed` / `rephrased` in the report; 5 integration tests against a real store and a real replay | done |
| P0 | `TAU_WRITE_ADMISSION` as a repository variable (the dispatch menu is at the platform limit of twenty-five), resolved and refused by test | done |
| P0 | Full gate: 3184 tests / 151 files, 99.95 / 99.65 / 100 / 99.95, bench gates PASS, bundle ceiling moved to 46,000 with the measurement beside it | done |
| P1 | Read R49 back into `PAIRED / REFUSED_CROSS_RUN / NO_MEASUREMENT`; report the interval, the p-value and the delivered population | running (reference arm) |
| P1 | U6b dispatch: `TAU_WRITE_ADMISSION=neighbours`, with the write census required by its readback | blocked on the R49 readback only because one lane at a time is the rule, not because the code is missing |
| P2 | U4 pack order, U5 pack ceiling, U6a global consolidation | registered, undispatched |
| P2 | U1, U2, R46 admission arms | closed until a valid paired reading |
| P3 | `sota.ts` split, W8 dose curve, vitest 4 | pending |
| — | cortex release | excluded by standing instruction |

No `Pass^4` number is claimed and no SOTA row moves. The ranking stands where R48
left it: IBM `gpt-5.5` airline 82.0 is the published SOTA and microglia is fifth of
six named entries. What changed is that the store can now be measured for how much
it refuses to write — which is the quantity every one of the four systems in
COMPETITIVE L.23 acts on and this one did not.

### R49 read, and the next registration is the instrument (2026-11-07)

| Priority | Step | State |
| --- | --- | --- |
| P0 | R49 read back: within-run pair **PAIRED**, floor 0.01 → −4.00pp [−18, +8] p=0.774, 949 vs 1435 packs served; memory vs reference −4.00pp [−14, +6] p=0.688, R45 revert rule does not fire | done |
| P0 | Write-side admission bench (U6b's mechanism): `add`/`update`/`noop`, census in the report and in the artefact, switch refused rather than defaulted, P9 in the verifier | done |
| P1 | **R50: `l4-paired` re-registered** — block on harm, report `UNRESOLVED` when MDE > observed effect, threshold and wording fixed before dispatch | next |
| P1 | Pack-thinness arm: 0.76 rules/question on a store of ten is the ceiling on everything else; the next arm raises the pack before it varies selection | registered with R50 |
| P2 | U6b dispatch (`TAU_WRITE_ADMISSION=neighbours`), whose readback must report the write census | blocked on R50 |
| P2 | U4 pack order, U5 pack ceiling, U6a global consolidation | registered, undispatched |
| P2 | U1, U2, R46 admission arms | closed until a resolvable pair exists |
| P3 | `sota.ts` split, W8 dose curve, vitest 4 | pending |
| — | cortex release | excluded by standing instruction |

Ranking unchanged: IBM `gpt-5.5` airline 82.0 is the published SOTA; microglia is
fifth of six named entries. R49's retail cells (0.36 floored, 0.40 as-is, reference
0.40) are not leaderboard rows and are not compared to one.

### R50 and R51: the gate that could not pass, and the question the rule never carried (2026-11-08)

Two registrations, both written before any dispatch, and both of them consequences
of one reading. R49 said three things at once: the floor is free and worthless at
0.01, the memory neither helps nor hurts as far as 50 paired tasks can see, and the
pack arrives on 62% of requests carrying 0.76 rules. R50 answers the first two by
fixing the instrument. R51 answers the third by fixing the write path.

| Priority | Step | State |
| --- | --- | --- |
| P0 | `pairedVerdict`: three states (`HARM` / `BENEFIT` / `UNRESOLVED`), the harm branch **calls** `revertRule`, `BENEFIT` requires `delta >= detectablePp`, `claim` is null when nothing may be claimed; 17 tests, 100/100/100/100 | done |
| P0 | `l4-paired` blocks on harm only; `l4-effect-resolved` reports the resolution without blocking; `V5-resolution` left alone in that round, because 115 tasks at pass^4 cannot resolve 6pp and the bar is shared with BIRD | done, superseded by R52 |
| P0 | The three committed readings re-graded: R47 PASS/UNRESOLVED, **R48 stays FAIL/HARM**, R49 PASS/UNRESOLVED; fixture extended with R49 and with the resolution column | done |
| P0 | `TauTask.instruction` parses both upstream shapes; the correction carries it; the learning event sends it as `input.question` with the id beside it | done |
| P0 | `recallText` is the single definition the lexical index, the `minCoverage` floor and MMR all read, instead of each deciding for itself and all three choosing the statement | done |
| P0 | `storeCensus` counts `conditioned` / `unconditioned` over the servable population, so the next readback measures whether a trigger was written at all | done |
| P0 | Full gate: 3,217 tests / 153 files, coverage 99.95 / 99.65 / 100 / 99.95 (lines / branches / functions / statements); `typecheck` and `typecheck:lanes` clean; 39/39 pre-registrations valid | done |
| P0 | R52: `V5-resolution` grades the claim (`claimPp`: number / `null` / absent) against a constant `POWER_TARGET_PP = 6`; CI conformance asserts the state rather than a non-zero exit; 16 new tests, 100/100/100/100 on every touched file | done |
| P0 | Correction to the record: R49's 38% empty packs were the `minCoverage 0.01` floor, not the missing conditions — its own retention curve says 571 of 1,516 packs, against 1,435 of 1,527 served ungated | done, AUDIT 34.51 |
| P0 | `trainDomain`/`testDomain`/`recallDomain` in the prereg header, read by `eval:prereg-scenario`, consumed ahead of the repository variables; three refusals keep the pin honest | done |
| P0 | `storeItems` in the arm artefact — the store's own words, bounded, with `omitted`/`truncated` counted — because a count of conditions cannot be read for register | done |
| P1 | R51 readback: **ABANDONED** by its own third refutation; `conditioned` 16/16 and empty 0/1,527 met, coverage p50 4.88% refuted, and the configuration was retail→airline rather than within-scenario | done |
| P0 | `coverage.medians` — the delivered-pair median and the non-zero median committed together, from one `measuredRows` pass, so "coverage p50" names a population instead of a phrase; drift guard against `nonzeroQuantiles.p50` | done, AUDIT 34.53 |
| P0 | `eval/verifiers/r54_readback.py` — four states (`GRADED` / `NO_MEASUREMENT` / `DISCARDED` / `ABANDONED`), fourteen self-test artefacts, and a CI step that runs every verifier's self-test, which no step did before | done |
| P0 | `eval/tools/fetch_evidence.py` — the evidence download as a committed tool (16 parallel ranges, length checked against the API), because every readback until now began with an unrecorded command | done |
| P0 | `StoreItemRecord.status`, required, so the sample cannot be read over a different population than `conditioned` counts | done, AUDIT 34.54 |
| P1 | **R54 dispatch** (retail/retail/retail, floor 0, `f25c8b56`, run `42438746694`): R51's predictions where they are answerable, with coverage p50 ≥ 12% as the one that could not be tested before. The run is 228 episodes, not the header's 200 — that field was the transfer pair's size | **running** |
| P1 | R54 readback: coverage p50 < 12% with 0% empty means the distiller writes in the procedure's register and the next arm is the prompt, not retrieval. Graded on `nonzeroQuantiles.p50`, the quantity R49 and R51 were read against; the delivered-pair median is printed as context and not graded | blocked on the dispatch |
| P2 | U6b dispatch (`TAU_WRITE_ADMISSION=neighbours`), whose readback must report the write census | blocked on R54's readback by the one-lane rule |
| P2 | R53: the pack's note as the only variable — `none` / `standard` / `hardened`, mechanism shipped (`TAU_INJECTION_NOTE`), recorded as `{mode, declared}` | registered, dispatchable |
| P2 | U4 pack order, U5 pack ceiling, U6a global consolidation | registered, undispatched |
| P2 | U1, U2, R46 admission arms | closed until a resolvable pair exists |
| P3 | `sota.ts` split, W8 dose curve, vitest 4 | pending |
| — | cortex release | excluded by standing instruction |

R52 finishes what R50 started one layer up. The 6pp bar is true and stays true; it stops
being a pass condition and becomes a target printed in the gate's own sentence, while the
gate blocks the thing that is a defect in a run — publishing a direction the sample could
not resolve. BIRD's seventeen cells do not move (they reach 1.96–4.87pp and none supplies a
claim); τ²'s verdicts do not move; its `V5` line turns green on every dispatch whose pair
concluded nothing, and says why in the same sentence.

Ranking unchanged and no `pass^4` number is claimed: IBM `gpt-5.5` airline 82.0 is
the published SOTA, and microglia is fifth of six named entries on the columns it
has measured. R50 and R52 move no benchmark number at all — they change what the lane is
allowed to say about one — and R51 is a registered experiment, not a result.

### R56 dispatched: the order after the instrument repair (2026-11-08)

R54's readback fired the refutation its registration named — *the conditions exist and do not name
the situation* — and the repair it called for is the prompt. R56 is that registration, dispatched as
run `42451945339` on `8f3b6360`. Four of the six items below were defects found on the way to
making it measurable, not features it needed.

| Priority | Item | State |
| --- | --- | --- |
| P0 | `taskId: correction.taskId` on the τ² write path — without it `distinctTasks` was 1 by construction and R55.0's recurrence reading would have been an artefact of the recorder (AUDIT 34.58) | done |
| P0 | `storeItems` carries `supportTasks` and `evidence`, counted through `countDistinctTasks`, the same grouping the score uses | done, R55.0's measurement rides free on R56 |
| P0 | `V0-instrument-ready`, the fortieth gate: five stages, two reconciliations, blocking, and *absent* on every artefact that predates it (AUDIT 34.59) | done |
| P0 | `form: 'procedure'` plus a host-side ban on candidates naming the split's tool inventory, with the form, the inventory and the refusal count in the artefact | done, R56's single variable |
| P0 | `eval/verifiers/r56_readback.py` — four states, twenty-nine self-test cases, the share-drop declined when no baseline supplies the inventory R54 never recorded | done, wired into `eval:verifiers` and CI |
| P0 | `armRecordFromDriver` carries `storeItems`, `distillForm` and `injectionNote`; the three fields R56 was dispatched to read were being dropped by the projection (AUDIT 34.62) | done, test written red first |
| P0 | `resolveDistillForm` replaces the `procedure` constant: R56 measured −8.77pp and 8 items, so R45's revert puts the default back to `lesson` | done |
| P0 | `_pair.py` — the verdict and the paired delta live in `poc-l4-pair.json`, not in an arm artefact; both readbacks read a field no arm writes and their revert checks could not fire (AUDIT 34.64) | done, R54 re-read with its state unchanged |
| P0 | `readings()` before `grade()`: a `NO_MEASUREMENT` still carries census, coverage, funnel, yield and verdict, so an ungraded run is not an erased one (AUDIT 34.64) | done, five cases name the readings that must survive |
| P0 | `gate-matrix.ts` — `docs/GATE-COVERAGE-MATRIX.md` rendered from the two tables and the last published BIRD artefact, throwing on a gate in neither table (AUDIT 34.60) | done |
| P1 | R56 readback against its four predictions: coverage ≥ 12%, tool-name share down ≥ 20pp, ≥ 12 items admitted, no tool name in any pack | **read: `NO_MEASUREMENT`** — two predictions lost to the projection defect, two failed, HARM at −8.77pp, revert fires (AUDIT 34.62, 34.63) |
| P1 | R55.0 — the recurrence distribution, read from an artefact that carries `supportTasks`: how many items reach `supportTasks >= 3`, and how many `>= 2` | **running** as run `42463064049` on `482d2d92`; the first attempt (`42461427066` on `048b4f92`) was cancelled at 17 minutes because its pair would have reported the blocking `V0` gate `absent` (AUDIT 34.65) |
| P1 | R55.1 — admission at `supportTasks >= 3`, same store construction, same recall, same note | blocked on R55.0 |
| P2 | R53 — the pack's note as the only variable (`none` / `standard` / `hardened`), on whichever store R55 leaves | registered, dispatchable |
| P2 | U6b (`TAU_WRITE_ADMISSION=neighbours`), U4 pack order, U5 pack ceiling, U6a global consolidation | registered, undispatched |
| P2 | R57 — a controlled distractor at a measured coverage band (`far` / `near` / `adversarial`), the negative-effect question as an experiment rather than an attribution | registered, blocked on R56 and R55 |
| P2 | Store-level poisoning, four of MemForm's five routes | registered |
| P3 | `sota.ts` split, W8 dose curve, vitest 4 | pending |
| — | cortex release | excluded by standing instruction |

Three debts are recorded rather than resolved, and each one is a decision that would have changed a
reading mid-flight:

- **The verifier's terminal state is too coarse.** R54 was `ABANDONED` for a refutation about the
  store sample while its coverage reading was measured and reconciled. The repair is a scoped
  refutation (`subject: store | delivery`), not a fifth state (AUDIT 34.57).
- ~~**The driver does not stop before the evaluation loop.**~~ Repaid: `funnelVerdict` is exported and
  the driver stops on it immediately after `host.distill()`, with the full chain as the reason
  (TECH-DESIGN 17.115).
- **BIRD's absent gates have no written reasons.** The matrix reports what the last artefact carried,
  not why the other twenty-nine were skipped, and distinguishing "this dispatch did not ask" from
  "this lane cannot" needs a BIRD arm inventory (TECH-DESIGN 17.114).

Ranking unchanged. IBM `gpt-5.5` airline 82.0 is the published SOTA, IBM `gpt-4.1` retail 67.5 leads
that domain, and microglia is fifth of six named entries. No item above moves `pass^4`: two are
instruments, one is a treatment whose verdict this sample cannot resolve, and one is a readback that
reports and does not claim.

### R56 read: the form is reverted, and the recurrence column is dispatched (2026-11-08)

R56 is `NO_MEASUREMENT` on its own fourth refutation — the artefact could not say which form ran,
because the projection dropped the three fields the dispatch existed to read (AUDIT 34.62). What
survived decided the treatment anyway, and it decided against it:

| Reading | R54 (`lesson`) | R56 (`procedure`) |
| --- | --- | --- |
| candidates per correction | 2.00 | **1.00** |
| store items | 20 | 8 |
| items served per request | 1.417 of 20 (7.1%) | 1.597 of 8 (**20.0%**) |
| coverage p50 | 8.33% | 6.25% |
| paired `pass^4` | +5.26pp, p = 0.63 | **−8.77pp**, p = 0.36, 1,869 packs |

R45 reverts: `procedure` is off, `lesson` is the default, and `TAU_DISTILL_FORM` is the switch a
later registration would use. The axis *"is the trigger decided by the form the distiller is asked
for"* is closed for `procedure` as registered — the more topical instruction halved the yield and
made each item less term-overlapping with the question, which is the opposite of what it was for.

**The order now.** R55.0 is the only dispatch open, and it is the one whose subject the last three
iterations kept deferring: not the prompt, not the retriever, not the admission rule — the *unit*.

| Priority | Item | State |
| --- | --- | --- |
| P0 | R55.0 readback — the `supportTasks` distribution and the register gap. Prediction, written before the dispatch: no item reaches support 2, because every item derives from one correction and every correction from a different task | **running**, run `42461427066` |
| P1 | R55.1 or its replacement. If R55.0 reads as predicted, admission at `supportTasks >= 3` is not runnable here and the next registration is about the object distilled — one task trace rather than one correction, which is where IBM's 5.1 guidelines per learning task come from | conditional on R55.0 |
| P1 | R56's two lost predictions re-read on R55.0's artefact: the tool-name share of the `lesson` store, and whether a tool name reaches a pack. Both are free — the artefact now carries the fields | not a new dispatch |
| P2 | R53 — the pack's note as the only variable (`none` / `standard` / `hardened`), on R55.0's store. `injectionNote` now reaches the artefact, so the note level is finally recordable | registered, dispatchable after R55.0 |
| P2 | U6b (`TAU_WRITE_ADMISSION=neighbours`), U4 pack order, U5 pack ceiling, U6a global consolidation | registered, undispatched |
| P2 | R57 — a controlled distractor at a measured coverage band, the negative-effect question as an experiment rather than an attribution | registered, after R55 |
| P2 | Store-level poisoning, four of MemForm's five routes | registered |
| P3 | `sota.ts` split, W8 dose curve, vitest 4 | pending |
| — | cortex release | excluded by standing instruction |

Deposits this iteration made, each of which is a reading that would otherwise have been lost:

- **`readings()` before `grade()`** in both τ² readbacks. A `NO_MEASUREMENT` now carries the census,
  the coverage quantiles, the funnel, the yield and the paired verdict. R56's record would have been
  four lines of `n/a` without it.
- **The yield column.** Candidates per correction, read from `funnel` or from `learning`, with the
  baseline's ratio beside it. It is the reading that located R56's loss, and it cost one function.
- **The pair file as the verdict's home.** R54's and R56's revert checks had never been able to fire
  on real evidence, and R54's inverse prediction had been passing on `None`.
- **A bridge test for every gate input.** `tau2ArmRecordOf` is the second hand-written projection and
  it had no guard, so `V0` was absent on every pair ever written (AUDIT 34.65). The driver's
  projection has a compile-time exhaustive decision table now; the pairing projection has red-first
  tests over the field it dropped, and its scope is asserted so it cannot widen by accident.

Two debts carried forward unchanged, one repaid, one added:

- **The verifier's terminal state is still too coarse** (scoped refutation by `subject`), and R56
  makes it sharper: the run is `NO_MEASUREMENT` for a recording defect while its number is a HARM.
  The report says both, in that order, and a state cannot.
- **BIRD's absent gates still have no written reasons**; the arm inventory is still the prerequisite.
- ~~**The projection lost fields silently.**~~ Repaid by named types and a red-first test. The general
  form — a hand-written mapping between two shapes — is unchanged and is now a review target.
- **A registration cannot hold "same corrections" across dispatches.** R56's learning population was
  8 corrections against R54's 10, and the model decides that at run time. Prediction 3 (≥ 12 items)
  was therefore graded against a baseline whose input size differed; the guard still fired, but a
  registration that wants a store-size comparison must state the correction count it expects or make
  the comparison per correction.

Ranking unchanged, and now for a reason worth writing down. IBM `gpt-5.5` airline 82.0 is the
published SOTA, IBM `gpt-4.1` retail 67.5 leads that domain, and microglia is fifth of six named
entries. At `sup3` density — 0.54 guidelines per learning task against our 0.63 — IBM reads +2.5pp and
we read an unresolved +5.26pp, so density is not the difference; and the mechanism that produces
`sup3` cannot be transplanted onto a store built one correction at a time. That is the next thing to
test, and R55.0 is the test.

### The sweep after R56: three losses with no trace, and the guards that replace care (2026-11-08)

R56's readback found one defect — a projection that dropped three fields — and the readback's own
repair found two more. They are recorded together because they are one class and because the
conclusion is about guards rather than about attention.

| Priority | Item | State |
| --- | --- | --- |
| P0 | `armRecordFromDriver` carries `storeItems` / `distillForm` / `injectionNote`; the three fields R56 was dispatched to read (AUDIT 34.62) | done, red first |
| P0 | `PROJECTION`: one decision per field of `Tau2Raw`, typed `-?` so a new field cannot compile without one; a `reduced` field must not appear verbatim (verified by adding a field and flipping a decision) | done |
| P0 | `_pair.py` and `--pair`: the verdict and the paired delta live in the pair file, so both readbacks' revert checks could never fire on real evidence (AUDIT 34.64) | done, R54 re-read unchanged |
| P0 | `readings()` before `grade()`: a `NO_MEASUREMENT` still carries census, coverage, funnel, yield and verdict (AUDIT 34.64) | done, five cases name what must survive |
| P0 | `tau2ArmRecordOf` carries `funnel`; `V0` was absent on every pair the lane ever wrote (AUDIT 34.65) | done, verified on R56's real artefact |
| P0 | `audit.mjs` fails on a `TAU_*` the source reads and no workflow can set; five were in that state, two of them a registered treatment (AUDIT 34.66) | done, guard written first |
| P0 | `inaction` is declared, projected and written; the single-facade path computed the census and dropped it (AUDIT 34.67) | done, the compile guard caught the second half |
| P1 | R55.0 readback — dispatched as run `42463064049` on `482d2d92` after the first attempt was cancelled for a `V0`-absent pair | running |
| P2 | **The note becomes a rendering option of one recall, and the three levels run as three facades over one store** — R49's paired facade generalised from two to three (AUDIT 34.68). R53's first refutation is an equality between runs, and no arrangement of dispatches can satisfy it | blocking R53 |
| P2 | `r53_readback.py` — three arms from one run, with the identical-items-per-request check as its control | after the three-facade capability |
| P2 | R53 — **not dispatchable as registered**: `TAU_INJECTION_NOTE` now reaches the lane (AUDIT 34.66), and the note is a property of the host, so the three levels cannot be three dispatches | registered, blocked on the capability above |
| P2 | U6b / U4 / U5 / U6a, store-level poisoning, R57 | registered, undispatched |
| P3 | `sota.ts` split, W8 dose curve, vitest 4 | pending |
| — | cortex release | excluded by standing instruction |

**What the three defects have in common, stated once so it can be recognised next time.** A
projection that lists its fields by hand and omits one; a second projection between two other shapes;
a caller that consumed four of five fields from a struct it owned. None raises, none warns, and all
three produce an artefact that reads as complete. The one that is worth naming separately is the
second: *the field had one live reader and one dead one*, the dead path was the one every artefact
took, and the live one was the one the tests exercised. R49's paired-facade switch is off by default,
so for as long as the field has existed, production took the dead path.

**What replaced the care.** Three guards, and each is a machine rather than a habit: a compile-time
decision table over the driver's record; a red-first test over each bridge a gate's input crosses; and
an audit rule for knobs that no dispatch can set. The first two were exercised on a field that did not
exist when they were written, which is the only way to know a guard works.

Debts carried, and one added:

- The verifier's terminal state is still one value while R56's record says two things — `NO_MEASUREMENT`
  for the recording defect and `HARM` for the number. The report prints both; a state cannot.
- BIRD's absent gates still have no written reasons; the arm inventory is still the prerequisite.
- **The paired facade's census and the single-facade census are now two copies of one fact**
  (`observedPair.inaction` and `tau2.inaction`). A reader has to know that one is a contrast and the
  other is an arm. Considered and left: one field with two shapes would be worse, and the next
  iteration that touches the paired facade should decide whether the contrast belongs beside the
  census.

### The capability R53 was blocked on, built before its dispatch (2026-11-08)

34.68 recorded that R53 could not be dispatched as registered: its first refutation is an equality
between three arms' delivery censuses, and three dispatches of one configuration distil three
different stores. The capability it needed is now in the lane, and building it found the defect that
would have made that refutation fire on a confound.

| Priority | Item | State |
| --- | --- | --- |
| P0 | `RenderOptions.budgetBasis` — the note stops competing with the items it annotates. At a 320-character budget `standard` carried one rule and `hardened` carried none, because the note is charged to the same allowance as the rules (AUDIT 34.69) | done, red first: an invariant over 76 budgets |
| P0 | `RecallQuery.note` — the level is a rendering option of one recall, host default when absent, byte-identical when neither is declared | done, three capture tests |
| P0 | `MicrogliaOptions.budgetBasis` — the host declares what its budget covers, and the artefact records it | done |
| P0 | `resolveFacadeNotePlan` + `TAU_FACADE_NOTES` + `prereg-notes.ts` + `facadeNotes: three-level` — the arm is resolved from the registration, and refuses the floor pair, an unknown value, and a single declared level beside it | done, 9 + 4 tests |
| P0 | three facades over one store, one learning phase, one seed; `standard` stays the arm `poc-l4` grades | done |
| P0 | `poc-l4-facade-notes.json` — three arms, two contrasts against `standard`, census per arm, and `packIdentity` as the control | done, 38 tests |
| P0 | `l4-note-identity` gate + `eval:note-facade-readback` — `IDENTITY_BROKEN` blocks, `NO_DELIVERY` warns | done |
| P0 | `r53_readback.py` — four predictions, four refutations, three states, eleven self-test cases | done, wired into `eval:verifiers` and CI |
| P0 | `facadeNotes` was parsed, validated and then not returned, so the workflow would have read `false` for a registration saying `three-level` (AUDIT 34.70) | done, the test is on the return value |
| P1 | R55.0 readback — the `supportTasks` distribution and the register gap | **running**, run `42463064049` |
| P1 | R55.1 or its replacement, conditional on R55.0 | blocked on R55.0 |
| P1 | R56's two lost predictions re-read on R55.0's artefact (tool-name share, a tool name in a pack) | free, not a dispatch |
| P2 | **R53 — dispatchable once R55.0 reads.** The blocking capability exists; what remains is the one-lane rule: no comparison is interpreted while another is open | registered, dispatch-ready |
| P2 | U6b / U4 / U5 / U6a, store-level poisoning, R57 | registered, undispatched |
| P3 | `sota.ts` split, W8 dose curve, vitest 4 | pending |
| — | cortex release | excluded by standing instruction |

**What R53 will measure, now that it can.** Three levels of one sentence over one store: `none`,
`standard` (the level every committed artefact ran) and `hardened` (the calibration sentence the 2026
memory-failure literature says is the intervention: MemTrapBench recovers performance with an
inference-time instruction, MemCalib finds over-use rather than under-use dominates, RPEval finds
humans ignore an irrelevant preference at 0.86 and GPT-5 at 0.12). Two contrasts against `standard`,
the parse rate and the abstention census per arm, and one control that has to hold before any of it is
read: for every request two arms both saw, the same items in the same order.

The one thing this iteration did **not** change is what R55.0 executes. The three-facade branch is off
unless a registration declares it, `budgetBasis` is unset on every dispatch that does not, and the
`TAU_FACADE_NOTES` the workflow now passes renders empty for a registration without the header.

Coverage after the change, every dimension: **99.95 lines / 99.67 branches / 100 functions / 99.95
statements**. `note-facade.ts` is 100 on all four. Two pre-existing branch gaps were closed with tests
that assert behaviour rather than lines — `diff-corpus.ts` 83.33 → 100, `tau2-admission.ts` 93.10 →
95.83 — and one remains at 94.44 in `ablations.ts`, which TECH-DESIGN §13.6 records as unreachable
because the store has no delete.

### R55.0 read: nothing recurs, and the next registration is about the object (2026-11-08)

R55.0 closed the question it was dispatched to ask, and it closed it in the direction the registration
predicted: **no item reaches support 2**. Distribution `{1: 7}`, refutation FIRED, state `ABANDONED`.

| Priority | Item | State |
| --- | --- | --- |
| P0 | R55.0 readback — the `supportTasks` distribution and the register gap | **read**: `{1: 7}`, 0 of 7 at support 2, ABANDONED on its own refutation |
| P0 | R56's two lost predictions re-read on R55.0's artefact — tool-name share of the `lesson` store, and whether a tool name reaches a pack | **read, free**: 0 of 7 items, 0 of 1,921 packs, ban refused 9 of 16 candidates |
| P0 | The `sota` workflow graded the memory-free control against `published + 5pp`, so six consecutive dispatches concluded `failure` with the memory arm green (AUDIT 34.72, `sampleGates`) | done, 5 tests |
| P1 | **R58 — the object distilled is one task trace, not one correction**, with consolidation across the learning set so a claim that recurs in three traces can reach support 3 | next; needs a registration |
| P1 | R55.1 — admission at `supportTasks >= 3` | **closed**: not runnable, the floor is above the population's maximum |
| P2 | R53 — the pack note at three levels over one store | dispatch-ready; capability done (AUDIT 34.69, 34.70) |
| P2 | R57 — a controlled distractor at a measured coverage band | registered, unblocked in principle |
| P2 | U6b / U4 / U5 / U6a, store-level poisoning | registered, undispatched |
| P3 | `sota.ts` split, W8 dose curve, vitest 4 | pending |
| — | cortex release | excluded by standing instruction |

**Why R58 and not another admission rule.** IBM's `sup3` admits a guideline after three distinct
learning tasks and keeps ~5 guidelines per learning task; the unit is a task *trajectory*. Ours is one
sentence of one failure, so the deriver count is 1 by construction and no threshold can move it. The
change that makes recurrence possible is at the write side: distil per trace, and consolidate across
the learning set so the same claim arriving from three traces merges into one item with support 3.
That is R56's second refutation arriving one iteration late, and it is the only route to the mechanism
the published leader uses.

**What R55.0 also showed, and it matters for R58's design.** The ban that refuses candidates naming the
split's tools works: 9 of 16 candidates refused, zero tool names in 7 items and in 1,921 packs. Its
cost is that the store halves and the surviving conditions share a median 7.14% of the request's terms.
A trace-level unit is the shortest route to conditions written in the *user's* phrasing, because a
trace is what contains that phrasing — which makes R58 an attack on the register gap and the
recurrence gap at once, rather than two experiments.

**The number, carried forward and not claimed.** Memory 64.91% against reference 54.39%, paired
+10.53pp [−3.51, +24.56], p = 0.210, n = 57, resolution 19.66pp, verdict `UNRESOLVED`. The lane's
largest point estimate, and still not a result: what it establishes is that the lane can produce a
double-digit paired difference, and what it does not establish is that the treatment produced it.

### R58 built, registered and dispatched (2026-11-08)

The iteration R55.0 and R56 both pointed at, and neither could run. The registration is
`prereg/R58-trace-unit.md`, written before the dispatch; the dispatch is `42476580076` on `9ad59e96`
with `l4=true`, `bird=false` and `TAU_DISTILL_UNIT=trace`.

| Priority | Item | State |
| --- | --- | --- |
| P0 | `tau2-trace.ts` — the attempt read out of `simulations[].messages`, failing trial over the first, cap's cost carried | done, 23 tests |
| P0 | `traceOf` + `Correction.assertions` — the attempt beside the reference and the rubric | done, red first |
| P0 | `DistillForm = 'trace'` — three claims per episode, requester's register, no tool names | done; `lesson` unchanged |
| P0 | `consolidateKnowledge` — grouping over a finished store, union of evidence, deterministic survivor | done, 27 tests, 100 on all four |
| P0 | `distillUnit` record, `PROJECTION` decision, `l4-support-recurrence` gate, `r58_readback.py` | done |
| P0 | the trace arm refuses a learning document with no trace, and `resolveDistillUnit` refuses a typo | done |
| P1 | R58's dispatch | **running** |
| P1 | R58 readback — five predictions, four refutations, twelve self-test cases | waiting on the run |
| P2 | R53 — three note levels over one store | dispatch-ready |
| P2 | R55.1 — a recurrence threshold, now expressible if R58 produces an item at 3 | conditional on R58 |
| P2 | R57, U6b / U4 / U5 / U6a | registered, undispatched |
| P3 | `sota.ts` split, W8 dose curve, vitest 4 | pending |
| — | cortex release | excluded by standing instruction |

**What R58 changes that the four previous registrations did not.** R54 changed the form of the rule,
R56 the register of its condition, R53 the sentence above the pack, R55 the admission threshold. All
four act on claims that already exist. R58 changes what a claim is derived from and then adds the only
step that can notice two claims agreed: consolidation over the finished store. It is the first
iteration since R49 that could move `supportTasks` at all.

**The one-variable discipline, and where the second half lives.** The unit is the variable; the pass
has its control inside the same run (`supportBefore` against `supportAfter` over one store), because a
second dispatch would distil a second store and the difference would be the store's. That is R49's
paired-facade argument applied to the write side.

**What the readback will decide.** If an item reaches support 3 and coverage clears 12%, the store is
worth reading and R53 and R57 become gradable against it, with R55.1 expressible for the first time.
If nothing reaches support 2 even after the pass, the constraint is the corpus — 57 held-out tasks,
one domain, four trials — and the next registration is about the sample rather than the mechanism.
If the pass keeps less than half the store, support was bought with reach and R45's revert rule
applies to the arm as a whole.

### R59 built and registered (2026-11-08)

The two repairs R58's readback specified, plus the population the registration got wrong. The
registration is `prereg/R59-containment.md`, written before the dispatch.

| Priority | Item | State |
| --- | --- | --- |
| P0 | `claimContainment` — shared terms over the smaller claim, floor 0.60 | done, 34 tests, 100 on all four |
| P0 | condition veto as a count (≥ 3 shared terms) rather than a ratio | done; the ratio would have refused the one merge |
| P0 | `ConsolidationCensus.conditionMinShared`, and the gate prints both floors | done |
| P0 | `r59_readback.py` — seven predictions, three refutations, fourteen self-test cases, both measures re-scored over one store | done; reads `containment 1, Jaccard 0` on R58's artefact |
| P0 | `TAU_TRAIN_TASKS` 32 → 57, the whole learning half, held-out set unchanged | dispatch configuration |
| P1 | R59's dispatch | **next** |
| P1 | R59 readback — is the floor the reason, or would Jaccard have merged the same groups | waiting on the run |
| P1 | R53 — three note levels over one store | dispatch-ready, after R59 |
| P1 | R55.1 — a recurrence threshold | conditional: no item has reached 3 |
| P2 | R57, U6b / U4 / U5 / U6a | registered, undispatched |
| P3 | `sota.ts` split, W8 dose curve, vitest 4 | pending |
| — | cortex release | excluded by standing instruction |

**What R59 changes that R58 could not.** R58 changed the object a claim is derived from and left the
measure that decides whether two objects are one claim untouched. On the store R58 produced, that
measure could not merge anything by construction: its highest-scoring pair sat below the floor. R59
replaces the ruler with one calibrated on the store it measures, moves the condition test to a count
because the ratio has no resolution at this scale, and doubles the learning population — which is the
variable R58's registration got wrong rather than one it tested.

**The attribution, stated in advance.** The measure has an attribution reading the artifice provides
for free: the artefact's stored items can be re-scored under the previous floor, so "the floor is the
reason" is a number over one population rather than an inference across two dispatches. The population
change has no such control and is therefore reported as a sample change: no prediction in the
registration is a delta against R58's pass rate.

**What the readback will decide.** If one group merges and an item reaches support 2, the corroboration
axis is open for the first time and R55.1's threshold becomes a decision rather than an arithmetic
impossibility. If nothing merges with 26 claims and a floor derived from this register, the finding is
that a corpus of this shape cannot corroborate itself, and the next registration is about the corpus.
Support 3 is deliberately not predicted: one mergeable pair in 105 is a rate, and a triple needs three
of them in one group.

### R59 read, R60 built and registered (2026-11-09)

R59 (`42488237590` on `8f9aeffe`) came back **`GRADED`: seven predictions, zero refutations.** The
first corroboration in this project: two tasks derived the same claim, the pass merged them, and an
item carries `supportTasks: 2`.

| reading | value |
| --- | --- |
| learning half | 57 tasks, 1 trial, **14 corrections** (24.6%) |
| store | **31 claims**, 2.21 per correction |
| consolidation | **1 group**, 30 of 31 retained |
| the pair | containment **0.667**, Jaccard **0.348**, condition terms **exactly 3** |
| `pass^4` | **−3.51pp** [−15.79, +8.77], `UNRESOLVED`; rate endpoint −1.32pp, agrees in sign |

The control moved 3.51pp between R58 and R59 on the same 57 tasks with nothing changed on it, which
is twice the largest treatment effect in the record and is the number that governs how the deltas are
read.

| Priority | Item | State |
| --- | --- | --- |
| P0 | readback: the attribution re-scoring graded a post-pass store, and `statusReason` was missing | **fixed**; the run now `GRADED` instead of `ABANDONED` |
| P0 | `l4-support-recurrence` now requires a census that reports a group to ship an item two tasks stand behind | done, 4 cases |
| P0 | `paired-rate.ts` — the second endpoint on the same pair | done, 12 cases, 100 on all four |
| P0 | `yieldCensus` counted over the store *before* the recurrence pass | done |
| P0 | `traceClaims` — the ceiling written in both the prompt and the parser | done |
| P0 | R60 — ceiling 3 → 6, support 3 predicted | **registered, dispatch** |
| P1 | R60 readback — the median is what separates a binding cap from an episode-limited one | after the run |
| P1 | R61 — per-assertion episodes, if R60's median stays at 2 | registered next |
| P1 | R55.1 — a recurrence threshold at `supportTasks >= 3` | decidable if R60 shows 3 |
| P1 | R53 — three note levels over one store | dispatch-ready |
| P2 | R57 planted distractor, U6b / U4 / U5 / U6a | registered, undispatched |
| P3 | `sota.ts` split, W8 dose curve, vitest 4 | pending |
| — | cortex release | excluded by standing instruction |

**What R60 is, precisely.** One number, moved from three to six, and the instrument that says whether
the number was ever the constraint. R59's 2.21 against a cap of 3 is a cap within one claim of the
mean; the artefact never carried the distribution, so the question could not be asked. The census now
carries it, with the median beside the mean and one row per correction.

**What the readback will decide.** If the median claims per correction reaches 3, the cap was binding
and the store grows to ~45 — enough that pairs double and triples triple, which is the arithmetic
support 3 needs. If the median stays at 2 while claims rise, the cap was irrelevant and the episode
is the constraint, which is R61's registration. If claims rise and nothing corroborates, more claims
of this shape do not recur and the corpus is the answer rather than the population.

## R57 — the controlled distractor, prepared against measurement (2026-11-09)

| Priority | Item | State |
| --- | --- | --- |
| P0 | `plant.ts` — arm switch, document validator, digest, per-request choice, census, append into a rendered block | done, 36 cases, 100 on all four |
| P0 | `eval/planted/retail.json` — six rules, two twinned pairs, committed before any dispatch | done, digest travels in the artefact |
| P0 | the band, found unreachable before the run (10–20% against requests of 11–126 terms) | **amended to a term count**; `far` none, `near`/`adversarial` two or more |
| P0 | the twin pair, found moving the dose by one word (`keep`) | `validatePlanted` refuses it; a pair is measured on the twin's text |
| P0 | `TAU_PLANTED_RULES` wired through the SOTA workflow and into the artefact as `plant` | done |
| P1 | dispatch `far`, then `near`, then `adversarial`, one arm per run, each paired against the reference | after R60 clears the lane |
| P1 | `r57_readback.py` — grade the census before any delta: an arm whose band did not land is not an effect | next |
| P2 | R55.1 — a recurrence threshold at `supportTasks >= 3` | decidable if R60 shows 3 |
| P2 | R61 — per-assertion episodes, if R60's median stays at 2 | registered next |
| P3 | `sota.ts` split, W8 dose curve, vitest 4 | pending |
| — | cortex release | excluded by standing instruction |

**What R57 is, precisely.** Not a third average. The registration's own words: the quantity this lane
has never had is the **sign split** — for a rule that shares a question's topic and states the wrong
action, the episodes it broke should outnumber the episodes it repaired. The mean may well stay
`UNRESOLVED` at 57 pairs, and the repair/break ledger is the reading that carries the result.

**What the pre-dispatch measurement changed.** The arm was drafted with a share as its level, which no
topic-sharing rule can hit on requests this long, and with a twin pair that differed by one word. Both
would have produced a run whose artefact looked complete and whose treatment was not the one
registered. They are now refused in code rather than avoided by care, and the achieved distribution is
recorded per request — `far` shares nothing with 100% of requests, `near` reaches its band on 76%.

**The order of the four arms is deliberate.** `none` is not a dispatch: it is the store R56/R59/R60
already measured. `far` runs first because a control that shows no effect is the only arm whose
result makes the other two interpretable; `near` and `adversarial` follow on the same store and the
same seed, and the readback refuses to grade a delta from an arm whose band did not land.

## R61 — the floor was the constraint, measured before the arm (2026-11-09)

| Priority | Item | State |
| --- | --- | --- |
| P0 | R60 read: ceiling binding, yield moved, corroboration did not | **done** — median 2→3, claims/correction 2.21→3.08, support 3 still 0 |
| P0 | the condition veto, proven non-separating over 666 pairs | `conditionMinShared` defaults to 0; the value 3 stays as the ablation |
| P0 | single linkage, replaced by complete linkage | `refusedLinkage` counts the refusals; `weakestPair ≥ threshold` is an invariant |
| P0 | the floor as a swept instrument, carried in the artefact | `consolidationSweep` (`carried`), operating point = the pass's own census |
| P0 | the same sweep over a shipped sample, so a readback can re-ask | `eval/store-sweep.ts`, support as an interval, agreement with the driver held by a test |
| P0 | the premise, measured before registration | R60's store holds **one group of three** at 0.60; none at the veto's floor |
| P0 | `prereg/R61-floor.md` + `eval/verifiers/r61_readback.py` | dispatched `42524907557` on `f5654f37`, BIRD and L4 both running |
| P1 | R57 `far`, then `near`, then `adversarial`, one arm per dispatch | after R61 clears the lane |
| P1 | R55.1 — a recurrence threshold at `supportTasks >= 3` | decidable the moment an item reaches 3 |
| P2 | the correction rate: 12 of 57 tasks correct anything | the population lever if support stays at two |
| P2 | R61's own refutation 4 — a three-task rule must also serve better | needs R61's paired delta |
| P3 | `sota.ts` split, W8 dose curve, vitest 4 | pending |
| — | cortex release | excluded by standing instruction |

**Why the floor stops being a constant.** R59 chose 0.60/3 from a single merged pair, and R60 measured
what that cost. A threshold picked from one example is a threshold nobody can price; a threshold
swept inside every run and shipped in the artefact is one that can be re-priced from any commit
without spending an arm. The grid costs 36 passes over a store of tens of items.

**What R61 has to show, in the order the readback grades it.** The sweep must describe the same store
its census does; every group must clear its own floor; a group of three must exist at 0.60; the
maximum support must reach three and one item must carry it; the group must have bought a task rather
than folded one task's claims; the store must keep half its items; and the veto must never merge more
than the setting that replaced it. The paired delta is printed and not claimed — at 57 pairs it has
never been resolvable, and a reading that cannot resolve is not evidence for or against.

## R61 read, R57 dispatched, R62 named (2026-11-09)

R61 (`42524907557` on `f5654f37`) is **`ABANDONED`**: the instrument held and both graded predictions
failed.

| reading | R60 | R61 | what it decides |
| --- | --- | --- | --- |
| largest group at 0.60 | 2 (plus one of three on the pre-registration store) | **2** | the floor is not the constraint |
| largest group at any of 36 grid points | 2 | **2** | no threshold finds three |
| claims / corrections | 37 / 12 | **45 / 14** | the population grew |
| median claims per correction | 3 | **3** | the ceiling of six is no longer binding |
| items at support 3 | 0 | **0** | corroboration is a sampling event here |
| store retained | 36 of 37 | **43 of 45 (95.6%)** | the pass is not the loss |
| paired delta | not resolved | **+14.04pp, CI [−1.75, 29.82], p 0.115** | the pack helps, the sample cannot say it |

| item | state |
| --- | --- |
| P0 | R61 read, `ABANDONED` — the R60 triple was one store's property, not the corpus's | **done** |
| P0 | R57 `far` arm — `TAU_PLANTED_RULES=far`, dispatch `42534241219`, `bird` resolved to false by `scope` without being asked | **in flight** |
| P1 | R57 `near`, then `adversarial`, one dispatch each | after `far` reads |
| P1 | R62 — the population: teach from all 57 trajectories, not the 14 that failed | **built** (`9aa538ee`), dispatched after R57's three arms |
| P2 | a larger sampled design for the +14.04pp; 540 tasks resolve 5pp, 1,498 resolve 3pp | blocked on a corpus with that many held-out tasks |

**Why the population is now the only lever left standing.** Three rounds moved the ceiling (3 → 6), the
floor (0.60 → 0.40 over 36 grid points) and the linkage (single → complete), and support stayed at two
through all three. The claims are clean, the pass keeps 95.6% of the store, and no threshold finds a
third member — because among 45 claims taught by 14 tasks there is no third member to find. The 43 tasks
that passed first time teach nothing at all, and that is the population R62 changes.

## R57 `far` read: the arm was right and the step said `failure` (2026-11-09)

Run `42534241219` on `1ecb6418` (`TAU_PLANTED_RULES=far`, `l4`, `bird` skipped by `scope`):

| reading | value | registered |
| --- | --- | --- |
| planted rules inside their band | 1920 of 1934 (99.3%) | the plant did what it was told |
| paired ledger | broke 9, repaired 9 of 57 episodes | net zero |
| excess | **+0.00pp** (half-width 14.59pp) | a distractor is not free and not harmful |
| `pass^4` | 0.5789 | published 0.575 |
| conclusion | `GRADED` (partial: 1 of 3 arms) | — |
| **job status** | **`failure`** on `l4-pass4 >= published + 0.05` | the bar is the treatment's |

The arm agreed with its registration in every field and the step was red anyway: `l4-pass4` is the
treatment's claim, and a distractor's hypothesis is that it *misses* it. Repaired in `597788d`
(`sampleGates` omits the bar for a declared plant, `published_bar_applies: 0`, `planted_arm`) and, on the
same day, one step later in the same job (`4083945`): `l4-paired` would have failed `near` for being
right. Both are `AUDIT 34.86` / `34.87`; the rule is **a gate belongs to the arm whose hypothesis it
states.**

| item | state |
| --- | --- |
| P0 | R57 `far` — read: net-zero ledger, band 99.3%, `GRADED` (partial) | **done** |
| P0 | the two gates that misread a planted arm (`l4-pass4`, `l4-paired`+`l4-effect-resolved`) | **fixed**, `597788d`, `4083945` |
| P0 | R57 `near` — `TAU_PLANTED_RULES=near`, dispatch `42544865267` on `71457278` | **in flight** |
| P1 | R57 `adversarial` — one dispatch, after `near` reads | next |
| P1 | R62 — `TAU_DISTILL_SCOPE=all` + `TAU_DISTILL_UNIT=trace` | **built**, after R57's three arms |
| P2 | four arms on one clock — the registration carries the arm, a job output carries it to L4 | blocked at 25 dispatch inputs; needs either a freed slot or a matrix over registered arms |
| P2 | the ~40 `?.`/`??` fallbacks that keep branch coverage at 99.76 | a campaign, one invariant read per site |

**Why `near` still runs alone.** `TAU_PLANTED_RULES` is a repository variable, a variable is global, and
the dispatch menu has no slot left for an arm. The correct fix is the rule `lane-scope` already encodes —
the registration decides the experiment — which means an arm list in `prereg/R57-toxicity.md`'s header
and a matrix over it. That is a workflow change with its own verification dispatch, and it must not be
made while an arm it would re-dispatch is in flight.

## R57 read, three arms: the ladder has two rungs (2026-11-09)

| arm | planted / served | in band | broke | repaired | excess |
| --- | --- | --- | --- | --- | --- |
| `far` | 1934 / 1934 | 1920 (99.3%) | 9 | 9 | +0.00pp |
| `near` | 1972 / 1972 | 699 (35.4%) | 5 | 7 | −3.51pp |
| `adversarial` | 1910 / 1910 | 712 (37.3%) | 11 | 7 | **+7.02pp** |

`far ≈ near` (refutation fired, 3.51pp apart against a 3.51pp drift); `adversarial` is 10.53pp worse
than `near`. **Proximity costs nothing; contradiction costs 7pp.** The two polarities land in the band at
the same rate (1.8pp apart), so the band is a property of the request texts rather than of the rule, and
distance-based retrieval tuning cannot reach the defect.

| item | state |
| --- | --- |
| P0 | R57 `far` | done — net zero, band 99.3% |
| P0 | R57 `near` | done — repaired more than it broke, inside drift |
| P0 | R57 `adversarial` | done — +7.02pp, the only arm with a real dose |
| P0 | the two gates that graded a distractor as the treatment (`l4-pass4`, `l4-paired`) | fixed, `597788d`, `4083945` |
| P0 | the claim a planted arm published | fixed, `fc28a34`; arm re-dispatched for a clean artefact |
| P0 | the order prediction that could not fail | fixed, `4a638b3` |
| P0 | coverage 100 on all four dimensions, reproducibly | done, `d5b6ee6` |
| P1 | R62 population experiment (`TAU_DISTILL_SCOPE=all`) | **next**, after the re-dispatch clears the variable |
| P2 | four arms on one clock — the registration carries the arm, a job output carries it to L4 | blocked at 25 dispatch inputs |
| P2 | the ~40 `?.`/`??` fallbacks | **closed** — the branch dimension is at 100 |

## The arm moved out of the variable, and the ladder closed (2026-11-09)

R57's three arms each needed a dispatch because `TAU_PLANTED_RULES` is a repository variable and the
dispatch menu is at its 25-input ceiling. The fix was the rule `lane-scope` already states — **the
registration decides the experiment** — and it is now mechanical: `prereg/R57-toxicity.md` carries
`plantedArms: far,near,adversarial` in its header, an `arms` job renders that line into a matrix, and the
`l4` job takes its arm from `matrix.arm` (`f2330f8`). One dispatch buys all three arms, in parallel, with
`fail-fast: false` and one artefact per arm (`l4-evidence-<arm>`).

What matters about this is not the saved dispatch but the failure it removes: **an arm is now a value
that travels from the registration to the job, so a round cannot inherit an arm it did not declare.** An
unregistered round emits `[""]` and plants nothing, and the renderer is a single exported function
(`plantedArmMatrix`) with one test per shape — the empty case is a test, not a comment.

| item | state |
| --- | --- |
| P0 | the arm as a registered value, one dispatch per matrix (`f2330f8`) | **done**, first use is R57's reproduction |
| P0 | R57 `adversarial` re-dispatched for an artefact whose `claim` is `null` | in flight, `42568927112` |
| P1 | R62 — `TAU_DISTILL_SCOPE=all`, `TAU_DISTILL_UNIT=trace`, teaching population 14 → 57 | **next** |
| P1 | write-time **contradiction** gate — check a candidate rule against the episode trace, not against the other rules | registered after R62; see `COMPETITIVE` (2026-11-09) |
| P2 | the use rate of a served rule — 60% activation means excess loss per use is not excess loss per task | needs a new artefact field, nothing measured yet |
| P2 | `sota.ts` split, W8 dose curve, vitest 4 | carried |

**Why the contradiction gate is the next mechanism and not the next parameter.** The three 2026 sources
read this week (MemPoison's L1/L2/L3, AM-Sentry's tiered admission plus retrieval screen, InMind's
implicit-association blind spot) all ship a defence that compares a candidate claim to *the store*.
MemPoison prices that defence at one grade out of three: it removes L1 and leaves L2 and L3 at ~23% and
~28%. R57 measured the same asymmetry from the loss side — a near, true rule costs nothing (+0.00pp,
−3.51pp), a contradictory rule costs 7.02pp — and the retrieval-relevance panel shows relevance predicts
*difficulty* rather than harm (−1.21pp on-topic vs −1.49pp off-topic, 0.28pp apart). The unclaimed
mechanism is therefore the one that checks the candidate against **the trace it was distilled from**:
a rule that its own episode contradicts is the only class that arrived with the evidence needed to reject
it, and no competitor implementation does this.

## The variable is gone, the reproduction is registered, and the denominator is measured (2026-11-09)

Three loose ends from the matrix change, closed in the order they could bite.

**The old variable was deleted, not left as a fallback.** `TAU_PLANTED_RULES` is now set by the matrix
on every leg, so the repository variable had no reader left. Leaving it would have been a second source
of truth that is *only* consulted when the registration declares nothing — which is exactly the case
where nobody is looking. Deleting it makes "no declaration" resolve to "no plant" through the one path
that exists.

**What a reproduction may decide is now written down before the dispatch** (`prereg/R57-toxicity.md`,
Amendment 3). The three arms were three dispatches on three commits; one dispatch on one clock is a
reproduction, and a reproduction that is graded after the numbers arrive is not a reproduction. The
threshold is the same 3.51pp drift the ordering is already graded against, and the rule for a
disagreement is two numbers and a named instrument problem rather than the newer one.

**The denominator every ablation divides by is now a verifier.** `eval/verifiers/use_rate.py` reads the
SQL pair the harness already stores: **42.8–44.3% of questions are byte-identical with and without
memory**, so the mechanism acts on 56–57% of the population and every per-task delta in this repository
understates the per-use effect by 1.77×. Four artefacts, a 1.5pp window, no dispatch spent.

| item | state |
| --- | --- |
| P0 | the arm is a registered value, one dispatch per matrix (`f2330f8`) | **done** |
| P0 | `TAU_PLANTED_RULES` repository variable deleted — no second source of truth | **done** |
| P0 | reproduction of the three arms on one clock, judged by Amendment 3 | **in flight** (`42568927112` is the adversarial leg of the *previous* schedule; the matrix dispatch follows it) |
| P0 | `use_rate.py` — inert share 43%, per-change delta 1.77× the per-task column | **done**, `5356ae2` |
| P1 | R62 — `TAU_DISTILL_SCOPE=all`, teaching population 14 → 57 | **next**, needs the variable set after R57's matrix clears |
| P1 | write-time contradiction gate — replay a candidate rule against its own episode | registered after R62 |

## Cheap first, then expensive: the order the leaderboard gap actually decomposes into (2026-11-09)

The 21pp between our dev reading and the fourth-place row is not one thing, and the decomposition
decides the order of the next four rounds. AskData's own ablation (arXiv 2505.19988, MiniDev, no hints)
is the key: profiled metadata **61.2** against the benchmark's human metadata **59.6**, fused **63.2**.
Metadata is worth 1.6–3.6pp. Everything above that is schema linking and candidate generation.

| priority | item | extra calls | expected | why now |
| --- | --- | --- | --- | --- |
| **P0** | **SQL-first schema linking** — take the columns and literals out of the SQL we already generated, match question literals to fields by LSH over sampled values, revise once when a literal is unmatched | **0** on the common path, **1** per unmatched literal | the single largest published component; our linker is lexical and discards the signal | zero marginal cost, and the signal is already being paid for |
| **P0** | re-dispatch R57 under Amendment 4, and read the cache-hit rate per arm | — | the ladder, on one clock, with a bill attached | the mechanism changed; the published numbers are re-labelled, not replaced |
| **P1** | the retry that lowers its concurrency — a 429 must slow the run, not end it | 0 | turns a refused dispatch from a loss into a slower one | a 50-minute run died twice this week for want of it |
| **P1** | profiled field descriptions **stored through `admit`/`curate`** — AskData's pipeline, with its output as memory rather than as a static manual | one-time, amortised to zero | +1.6pp standalone, more if the store can retire a wrong description (which a static manual cannot) | this is the thesis tested against its own incumbent |
| **P2** | R62 population 14 → 57 (`TAU_DISTILL_SCOPE=all`) | dispatch only | teaching-set size | blocked on the account, not on code |
| **P2** | multi-candidate generation and confidence selection | **×3–5** | a few points | last, and submission-only: a repository that just learned what its bill was should not buy points with it |
| **P3** | `sota.ts` split, W8 dose curve, vitest 4 | 0 | maintenance | carried |

**The three rules this week added, kept here because they will be needed again.**

1. **A comparison between two arms is also a comparison between two bills.** The memory arm was paying
   the cache-miss rate on work the reference arm paid the hit rate for, at a factor of fifty, and the
   delta was published without it.
2. **A configuration that names a model is a fact with an expiry date.** `deepseek-chat` was right when
   the lane was built and is a silent redirect now, to a model that thinks by default and bills the
   thinking at the output rate.
3. **Nothing in the pipeline may have a cost that only the operator's time zone controls.** Peak is
   double, and every long leg so far started inside it because the operator is awake in UTC+8.

## The next four rounds, ordered by measured headroom rather than by papers (2026-11-09)

Three verifiers run this round (`power.py`, `error_budget.py`, `arm_ablation.py`), and between them they
rewrote the plan. The old order was "schema linking, then field semantics, then candidates", taken from
the literature. The new order is taken from the artefacts.

| priority | round | measured reason | expected | calls |
| --- | --- | --- | --- | --- |
| **P0** | **the additive linker** — never drop a table; order the DDL by relevance, annotate the anchors, and repair an identifier that does not resolve instead of hiding the table it lived in | **implemented** (`annotateSchema`, arm `linked-additive`, 172.58); awaiting a BIRD dispatch | `linked` is **−9.58pp at p=6.4e-21**, 202 broken against 55 repaired, with `table-missing` errors 107 → 291 and 44 predictions losing their `FROM` | recovers the 9.6pp and makes the 13.23pp ceiling reachable at all | 0 on the common path, 1 per unresolved identifier |
| **P0** | **the oracle's subset as memory** — a training question's gold table set is supervision the benchmark gives away; hold it, curate it, retrieve it by question | `oracle` is **+33.14pp on the same 350 questions** where every product arm is under one point | the only arm in this repository with a two-digit expected value | 0 extra (the packs already carry the text) |
| **P1** | **field-description distillation**, through `admit`/`curate` so a wrong description can be retired — something a static manual cannot do | `values` is +5.43pp on 350 and **+0.85pp on 1,534**: a lead, not a result; AskData's ablation prices the full version at 1.6–3.6pp | 1–3pp, amortised | one-time, per column, cached |
| **P1** | **a powered R57**, if it is re-run at all: `n ≥ 504` for a 7pp effect, off-peak, and read by `power.py` before it is quoted | at `n=57` the smallest detectable effect is 20.9pp and no cell reaches p<0.05 | replaces a withdrawn claim | 504 tasks × 2 arms |
| **P2** | multi-path candidate generation | `full-sampled` +0.86pp, `gated` +0.29pp: the constraint is not candidate count at this size | a few points, for 3–5× | expensive, last |
| **P3** | `sota.ts` split, W8 dose curve, vitest 4 | carried | maintenance | 0 |

**Three rules the verifiers make enforceable, which is the point of writing them down.**

1. **An effect is quoted with its smallest detectable alternative.** `power.py` prints, for every arm,
   the effect size this design could have seen at 80% power — 20.85pp at 57 tasks, 2.20pp at BIRD dev's
   1,534. A number below that floor is not a finding, and the verifier says so rather than leaving it to
   a reader's judgement.
2. **A ceiling is computed before a mechanism is built.** `error_budget.py` splits the errors into the
   classes each mechanism can act on: table selection is 31.3% of them, so schema linking is worth at
   most 13.23pp here and candidate generation at most 29pp. A mechanism whose ceiling is under the
   noise floor should not be built at all.
3. **Every arm in every artefact is read.** `arm_ablation.py` grades 63 readings across 30 artefacts in
   one pass. The largest effect in the repository — a 9.58pp regression at p=6.4e-21 — sat unread in a
   committed file for eleven rounds while the documents called that mechanism the next thing to build.

**And the cost policy that came out of the same week.** `TAU_REQUIRE_OFF_PEAK` refuses an `l4` dispatch
inside a peak-rate window before its first provider call, because peak is exactly double and UTC
01:00–10:00 is 09:00–18:00 in UTC+8. The trial count is a knob and not a virtue: at `n=57`, four trials
produced a **wider** interval than one would have (±14.59pp against ±13.75pp), because `pass^4`
compresses four draws into one per task and the discordant count grows with `k`. Precision is bought
with tasks, and tasks are what BIRD has 1,534 of for the price of one τ² leg.

## The ordering ceiling is measured, and it is 56.65% (2026-11-09)

Round 62 computed a ceiling before buying a mechanism, for zero model calls. The reading reorders the
next rounds again, because it prices the thing the last two plans assumed.

| signal | clean ordering | mean depth | precision | recall of gold |
| --- | --- | --- | --- | --- |
| lexical anchors — what `linked-additive` ships | 42.89% | 49.63% | 49.98% | 87.38% |
| retrieved gold tables of the 5 nearest training questions | 56.58% | 44.04% | 47.93% | 95.05% |
| both, recall first | **56.65%** | **43.00%** | 39.27% | **99.66%** |

`clean` = every gold table ahead of every non-gold one, which is the strongest thing an ordering-only
mechanism can do. Paired, n=1,534: **+13.75pp [+10.30, +16.88], p < 1e-4**.

| priority | round | measured reason | expected | calls |
| --- | --- | --- | --- | --- |
| **P0** | **recall-first ordering in the lane** — index the learn rows' gold table sets by database, retrieve the 5 nearest, order the DDL by their union, anchors as fallback | the measurement above: +13.75pp of clean orderings, and **anchors add 0.07pp once recall is present** while costing 8.7 points of precision | the only mechanism change whose supporting number is already two-digit | 0 |
| **P0** | **a dispatch that can say what it cost** — the arm readings and the bill in one artefact, off-peak, `linked-additive` and `values` re-measured after the `schemaBlocks` fix | both arms changed behaviour on three databases this round; their old readings are not comparable | replaces two numbers rather than adding one | 2 arms × 1,534 |
| **P1** | **field-description distillation through `admit`/`curate`** — unchanged from the last plan, and still the only arm whose evidence survives a change of population | `values` +5.43pp at n=350 and +0.85pp at n=1,534: a lead, not a result | 1–3pp | — |
| **P1** | **a powered R57**, if it is re-run: `n ≥ 504`, off-peak, read by `power.py` before it is quoted | at n=57 the smallest detectable effect is 20.9pp | replaces a withdrawn claim | 504 × 2 |
| **P2** | multi-path candidate generation | `error_budget` puts the candidate ceiling at 29pp, the largest single bucket | a few points, for 3–5× | expensive, last |
| **P3** | `sota.ts` split, W8 dose curve, vitest 4 | carried | maintenance | 0 |

**The three rules this round adds.**

1. **A ceiling that costs nothing is bought first.** The table-ordering ceiling needed gold queries
   and a schema on disk. It was computed in seconds and it changed the plan — and it found a parser
   defect that three rounds of testing had not, because the defect only matters when someone asks a
   question the tests never asked.
2. **A parser that returns nothing is a mechanism that does nothing.** `schemaBlocks` parsed a
   backticked `CREATE TABLE` to zero blocks, and zero blocks is `single-table` in `annotateSchema`,
   which means "return the DDL unchanged". The arm was inert on three of eleven databases and no gate
   could see it: an instrument that cannot fire publishes its own absence as a null.
3. **A bill belongs to the lane that spends the money.** The rate card is data with two readers, the
   usage is accumulated per band, and the cron is off-peak — because a cron expression is a dispatch
   nobody re-reads, and the cheapest run to schedule had been the most expensive one to buy.

## R63 is dispatched: the ordering arm, and what each outcome selects (2026-11-09)

The free ceiling (round 62) said what ordering can achieve; round 63 built the arm it named and put it
in the air against the arm it replaces. Nothing else changes in the plan until that number exists,
because every downstream priority was ordered by a measurement this run either reproduces or
contradicts.

| item | what it is | why now |
| --- | --- | --- |
| **dispatched** | `none,full,linked-additive,recall-order` on minidev, off-peak, `max_calls=4000`, run `42634151808` | the only mechanism change whose supporting number is already two-digit, and the first run that can state its own bill |
| **reading it** | `ordering.cleanShare` against 56.65% ±5pp, then `recall-order` against `linked-additive` at a 6pp resolution | a clean share outside the band is a wiring defect and voids the accuracy columns |

**What each outcome selects, written before the number arrives.**

| outcome | reading | next |
| --- | --- | --- |
| `recall-order` ≥ +6pp over `linked-additive` | ordering is a lever, and a bigger one than any memory arm measured here | dose: `SOTA_RECALL_K` at 1 and 10, then column-level ordering inside the moved tables |
| interval excludes +6pp and contains zero (predicted) | ordering is a diagnostic, not a lever | the retrieved-exemplar arm — the nearest training question's **gold SQL** as a worked example, the lawful approximation of `oracle` at +33.14pp |
| `recall-order` ≤ −6pp | position is attended to, and declaration order is better than a signal | close the ordering line entirely; no variant of it gets a call |
| clean share outside 56.65% ±5pp | the wiring is wrong | fix the wiring and re-run; the accuracy columns are unreadable |

**The standing order of the remaining work, re-priced by `error_budget` and `arm_ablation`.**

| priority | item | measured reason | expected | calls |
| --- | --- | --- | --- | --- |
| **P0** | read R63, then the outcome's next stage | above | — | 0 |
| **P0** | retrieved gold SQL as a worked example | `oracle` +33.14pp at p=2.4e-35 against every product arm under one point; a training question's gold query is supervision the benchmark gives away | the only remaining mechanism with a two-digit prior | 1 arm × n |
| **P1** | field-description distillation through `admit`/`curate` | `values` +5.43pp at n=350 and +0.85pp at n=1,534: a lead, not a result | 1–3pp | — |
| **P1** | a powered R57, if re-run: `n ≥ 504`, off-peak, read by `power.py` first | at n=57 the smallest detectable effect is 20.9pp | replaces a withdrawn claim | 504 × 2 |
| **P2** | multi-path candidate generation | candidate ceiling 29pp, the largest single bucket in `error_budget` | a few points, for 3–5× | expensive, last |
| **P3** | `sota.ts` split, W8 dose curve, vitest 4 | carried | maintenance | 0 |

**Two rules this round adds to the standing list.**

4. **The mechanism and the measurement must share an implementation.** The bin that priced the
   ordering now calls the two functions the lane calls, and reproduces its own numbers exactly. A
   measurement that is composed differently from the arm is a description of a mechanism nobody
   dispatches — and the difference is invisible until the two numbers disagree for a reason nobody
   can name.
5. **Prove the wiring against a stand-in before paying for the run.** `DEEPSEEK_ENDPOINT` existed for
   rounds and this is the first arm to use it. Twenty questions against a server that answers
   `SELECT 1` printed both arms' scores, the ordering block, and a $0.0103 bill, in ninety seconds,
   for nothing. The `schemaBlocks` defect in round 62 was exactly the class of failure this catches
   and unit tests did not.

## The literature re-orders the queue: self-correction is a lever we have never measured (2026-11-09)

Read after R63 was built, so recorded as a check rather than a justification — and it changes the item
under R63 more than it changes R63.

| published recipe | effect | source |
| --- | --- | --- |
| schema linking, lexical | **−1.56pp**, p=0.035 | arXiv:2606.29733, BIRD dev, paired McNemar |
| schema linking, embedding at 96.5% gold-table recall | indistinguishable from none | same |
| **self-correction (feed back the execution error)** | **+3.06 / +3.65 / +1.04pp** over three families, p=2e-11 / 6e-11 / 0.08 | same |
| self-consistency, m=5 | +0.13pp for ~5× tokens, p=0.86 | same |
| schema abstraction / partitioning / renaming | +2.6 … +4.2pp on BIRD-Union, complementary to few-shot | arXiv:2606.03145 |

**The gap this exposes is smaller than the first draft of this section said, and it is worse.** The
first draft claimed a plain *execute, feed the error back, revise* control had never been measured
here. It has: `retry-blank` is exactly that arm — the retry prompt carries the failed attempt, the
execution error and an empty pack — and R17 quotes it at **+0.57pp, 2 gained and 0 lost**. What the
arm has never had is a registered run whose artefact is in the repository: `grep -rl retry-blank
eval/results/` returns nothing, now or at any point in its history. **A number in prose is not a
measurement**, which is the rule `power.py` and `arm_ablation` exist to enforce.

So the missing thing is not the mechanism, it is the evidence — and the mechanism is the only arm
family this project has ever measured as non-negative (`full-onretry` +1.43pp with 5 gained and 0
lost, `retry-blank` +0.57pp with 2 gained and 0 lost).

| priority | item | measured or published reason | expected | calls |
| --- | --- | --- | --- | --- |
| **P0** | read R63 against its registration | the ordering arm is in the air | places ordering above or below a 6pp bar | 0 |
| **P0** | **a registered `retry-blank`** — the self-correction control that already exists, dispatched on the full split against `none` | it is the only arm family here ever measured non-negative (+0.57pp, 2/0; `full-onretry` +1.43pp, 5/0) and **no artefact in the repository contains either reading**; the published +3.06pp at p=2e-11 is the same mechanism at an operating point with more headroom | a small positive, now with evidence | 1 extra call per failed question |
| **P0** | retrieved gold SQL as a worked example | `oracle` +33.14pp at p=2.4e-35; a training question's gold query is supervision the benchmark gives away | two-digit ceiling, unknown realisation | 1 arm × n |
| **P1** | field-description distillation through `admit`/`curate` | `values` +5.43pp at n=350, +0.85pp at n=1,534 | 1–3pp | — |
| **P1** | a powered R57, if re-run: `n ≥ 504`, off-peak, `power.py` first | n=57 resolves 20.9pp | replaces a withdrawn claim | 504 × 2 |
| **P2** | representation-level intervention (renaming, views) | +2.6 … +4.2pp published for the family, and ordering is its weakest member | the family's upper bound, minus what ordering already gets | expensive |
| **P3** | multi-candidate generation; `sota.ts` split; W8 dose curve | candidate ceiling 29pp in `error_budget` | a few points for 3–5× | last |

**Rule 6.** *A baseline that denies the model something every published competitor gives it is not a
baseline, it is a handicap.* `none` has no feedback and the three families in 2606.29733 all gain from
it, so the 57.63% dev cell understates what this pipeline can do and every memory delta is measured
against a prompt that is behind the published state of the art.

**Rule 7.** *A number in prose is a memory, not a measurement.* `retry-blank`'s +0.57pp has been quoted
in three pre-registrations and is recoverable from none of them: the dispatch that produced it left no
artefact, and the repository's own rule — recompute before quoting — was never applied to it because it
was never the arm under test. The arm that keeps turning out to be the only non-negative one is the arm
whose evidence is missing.

## The ceiling was worth 13.75pp of ordering and 0.86pp of accuracy (2026-11-09)

R63 published and closed the ordering line for accuracy. The free measurement said ordering by the
gold tables of five retrieved training questions beats lexical anchors on 56.65% of dev questions
against 42.89%; the arm that ships it scored **+0.86pp** [−1.43, +3.14] against `none` and **−1.14pp**
against `linked-additive`. The registration named that branch in advance, so this is a result rather
than a reinterpretation.

| ranked by | measured | source | next |
| --- | --- | --- | --- |
| retrieved-exemplar arm (gold SQL of the nearest training questions) | `oracle` **+33.14pp**, p = 2.4e-35 | existing artefact | **P0** — registered next, the ceiling this lane has and has never spent |
| values / field-description distillation | +5.43pp at n=350, +0.85pp at n=1,534 | R24, R25 | P0 — and now the largest bucket of the retry population |
| `linked-additive` (order, do not prune) | +2.00pp [−0.29, +4.29], p = 0.14 | R63 | P1 — the only schema arm with a non-negative point estimate |
| `recall-order` (order by retrieved tables) | +0.86pp [−1.43, +3.14], p = 0.65 | R63 | closed for accuracy |
| `linked` (prune to named tables) | −9.58pp | R26 | closed — deleting tables costs accuracy |

**Rule 8.** *A measured ceiling is a ceiling on the signal, not on the model.* The 13.75pp was a real
difference in prompt content — every gold table ahead of every non-gold one on 13.75pp more questions
— and it moved accuracy by less than a point. Any future arm whose case rests on "we can measure a
large improvement in the prompt" has to state the conversion factor this lane has now measured, or it
is pricing the signal and shipping the prompt.

## The control arm's population is measurable before the dispatch (2026-11-09)

R64 was registered for `retry-blank` with a prediction of ≥140 retried questions on minidev, reasoning
from base accuracy to failure count. Measured, for free, from artefacts already committed: **26 of
350** on minidev and **98 of 1,534** on dev. A retry arm acts on what the pipeline rejected — no
query, an execution error, no rows — and not on what was wrong.

That number is now a command (`pnpm eval:retry-population`) and a field (`retry_population` in every
artefact, `retryReason` per question). The registration is amended to dev with a floor of 90 before
its dispatch, and the same pass measured the composition: **60.67% of empty results read exactly the
gold tables and 35.96% miss a gold value**, so the retry line's deficit is values rather than schema
text.

**Rule 9.** *A conditional treatment's denominator is part of its registration, and it is measurable
without the treatment.* R64's prediction was off by a factor of five in the direction that would have
burned a run on its own void condition. The remedy is not a better guess: it is that the trigger and
the counter are one function, so the population can be counted from any artefact already in the tree.

## The bar and the band are one document (2026-11-10)

R64 published the first artefact in this record for a retry arm, and it landed in the only region its
registration had not assigned: 20 of 98 rejections repaired (+20.41pp on the population, p = 1.9e-06),
**+1.30pp** on 1,534 questions with nothing regressed — not promoted, because promotion required the
interval's *lower* bound to exceed 25%, and not closed, because closing required the upper bound to
fall below 10%. Both bars were mine, and both were wrong for the same reason.

**Rule 10.** *A promotion bar is part of the prediction, and it must be reachable by it.* A threshold
on an interval's lower bound is a threshold on the point estimate minus its standard error, so at
n = 98 a lower bound of 25% requires a rate near **35%** — the top of a band whose middle the same
document had already said not to expect. The form that cannot do this is "point estimate above X with
an interval excluding zero", with X chosen inside the band. Writing the bar as an interval bound
feels more conservative and is in fact more demanding, by a margin nobody computes at registration
time.

**Rule 11.** *A conditional treatment's ceiling is its population share, and it is knowable before the
treatment exists.* The retry family cannot move this benchmark by more than **6.39pp** even if every
rejection is repaired; this arm moved it by 1.30pp, a fifth of its ceiling. That comparison is only
available because the population was measured before the dispatch. Without it, +1.30pp reads as a weak
mechanism; with it, +1.30pp reads as 20% of everything that arm can ever do — and the next question
becomes whether the population can be widened rather than whether the mechanism can be sharpened.

The third thing the run settled is what the register of arms should cost: a repair rate per rejection
is the only retry number that transfers between models, because it does not contain the base accuracy.
arXiv:2606.29733's +3.06pp on CodeLlama-7B and our +1.30pp on a 57%-accurate model are the same
mechanism at two populations, and quoting either as a mechanism constant is a category error.

## What is left, in the order it will be attempted (2026-11-10)

| ranked by | measured | source | next |
| --- | --- | --- | --- |
| retrieved-exemplar arm (`examples`) | `oracle` **+33.14pp**; published band 48–66% on BIRD prompting systems | existing artefact, arXiv:2604.15163 | **in flight** — R65, the only arm left that can move accuracy by two digits |
| value-missed empty results | 32 / 89 of the empty population; 19 of 20 repairs came from that bucket | R64 + Amendment 1 pass | **P0 next** — a value-aware retry, registered against `retry-blank` on the same 98 questions |
| `retry-keyed` (memory at the moment of failure) | unmeasured; promotion clause of R64 | R64 | P1 — the one place memory can be priced cleanly, now that the population is a field |
| `values` / field-description distillation | +5.43pp at n=350, +0.85pp at n=1,534 | R24, R25 | P1 — largest single content lever after exemplars |
| `linked-additive` | +2.00pp [−0.29, +4.29], p = 0.14 | R63 | P2 — only schema arm with a non-negative point estimate |
| `recall-order` | +0.86pp [−1.43, +3.14], p = 0.65 | R63 | closed for accuracy |
| `linked` | −9.58pp | R26 | closed — deleting tables costs accuracy |
| `full` (the memory arm) | null on four splits: minidev +0.57, dev +0.07, train, original panel | R17, R24, R63, R64 | P3 — do not re-dispatch without a change of content |
| generation and selection | CHESS-class pipelines at 66–78% EX | arXiv:2405.16755, arXiv:2604.15163 | after R65: candidates and selectors, where the 10–20pp lives |

## The branches have to tile, and the interval has to be over dispatches (2026-11-10)

R65 measured the register's last two-digit lever and produced the most informative negative of the
iteration: **three correct worked examples from the same database are worth +5.43pp on 350 questions**
[+1.43, +9.43], 36 gained / 17 lost, and **+5.71pp against the memory arm** [1.71, 9.71], p = 0.0078 —
for $0.12. Not two digits, and not zero.

Two structural lessons came out of the same run, and both are cheap at registration time.

**Rule 12.** *A refutation must partition the outcome space.* R65 promoted at Δ ≥ +6pp, closed at
|Δ| ≤ 4pp, and left (4, 6) unassigned — where the estimate landed. R64 promoted at a lower bound above
25%, closed at an upper bound below 10%, and left everything between unassigned — where its estimate
landed too. Two registrations, one iteration, the same defect: a list of conditions is not a classifier.
The branches must be written as an ordered partition with a named outcome for every region, the way
`classifyEmptyAttempt` had to be rewritten to be exhaustive.

**Rule 13.** *An interval computed inside one dispatch is not an interval over dispatches.* The same arm,
with prompt content that does not change between runs, measured **+1.71pp** and **+5.43pp**. The
controls moved too: `none` by 0.86pp, and `full` by 3.14pp on a store that differed by four
distillations (680 → 684 corrections, 1,321 → 1,313 active items). At n=350 the dispatch-level spread is
3–4pp — the size of the bootstrap interval itself. Every claim this record has published below 4pp on
350 questions is a claim about one draw, and the honest interval is the spread over dispatches.

The consequence for the plan is immediate: R65's answer will be read from **three valid dispatches**
(pooled delta, between-run spread reported), not from one. That is what Amendment 2 fixes, and it is the
first time this project has priced a mechanism by replicating it rather than by widening the sample.

## Where the two-digit gap actually is (2026-11-10)

The register is now nearly empty of prompt-content levers, and the measurements say why:

| lever | this lane | published best | what the gap is made of |
| --- | --- | --- | --- |
| order the schema by retrieved gold tables | +0.86pp | — | the signal was real (+13.75pp) and did not convert |
| show three worked examples from the same database | **+3.81pp pooled** over three dispatches (+5.43 / +3.14 / +2.86) | DAIL-SQL / CHESS report first-order gains | closed at the pooled value — the band was ±4pp |
| inject the memory pack (`full`) | null on four splits | — | the store's content is not what the corpus lacks |
| inject the item written for this question (`oracle`) | **+33.14pp** | — | not deployable: it needs the answer key |
| multi-candidate generation plus execution-guided selection | unmeasured here | CHESS 66.2%, CHESS+SC at 66–78% on BIRD | **the remaining two-digit region** |

So the next P0 after R65's replication is not another prompt: it is **generation and selection** —
`sample-n` draws with execution-consistency and prior-based selectors, the machinery this repository
already has (`pool.ts`, `union.ts`, `prior.ts`, `sample-*` arms) but has never pointed at this split
with a registered estimand. That is where 10–20pp lives, and it costs calls rather than knowledge.

## The 7B row, and the confound that has been printed beside it for weeks (2026-11-10)

The comparison the project keeps being asked about is a **7B model**. DPC's re-runs of the two best
published prompting pipelines on BIRD, with Qwen2.5-Coder-7B as the backbone:

| row | backbone | scaffold | BIRD dev |
| --- | --- | --- | --- |
| DAIL-SQL + SC | Qwen2.5-Coder-7B | few-shot prompting, self-consistency | **48.6%** |
| XiYanCoder-7B | Qwen2.5-Coder-7B (SQL-tuned) | prompting | **53.0%** |
| CHESS + SC | Qwen2.5-Coder-7B | candidate generation + unit-test selection | **66.2%** |
| **this lane, `retry-blank`** | `deepseek-flash` | one deterministic prompt, one draw | **58.02%** |
| this lane, best prompt-content arm | `deepseek-flash` | one prompt + three gold exemplars | **56.57%** |

Two facts sit in that table and only one of them is usually quoted. At a **fixed model**, the
scaffold is worth **+17.6pp** (48.6 → 66.2), which is the largest single lever anyone has published
on this benchmark. At a **fixed scaffold class**, our single draw is **+9.4pp ahead** of their
single draw. So "a 7B beats us" is a statement about CHESS, not about the 7B — and the thing worth
copying is the three stages CHESS buys with its 17.6 points, not the model.

**But the table cannot settle it, and we should stop pretending it can.** Those rows vary the
backbone, the scaffold *and* the judge at once. Three explanations remain live:

1. **scale** — our backbone is stronger and our scaffold is weaker, which nets to +9.4 over their
   prompting baseline and −8.2 under their pipeline;
2. **scaffold** — the 17.6 points are the mechanism, and any backbone carrying it clears 66;
3. **baseline** — most of those 17.6 points are what a **48.6%** baseline buys. R64 already
   measured the arithmetic in this repository: *an arm that repairs a fifth of its population moves
   a 30%-accurate model by six points and a 57%-accurate model by one.* Selection is a per-failure
   mechanism too, so its absolute yield is set by how many failures there are, not by how good the
   selector is.

**Rule 14.** *Absolute points are not comparable across baselines. The comparable quantity is the
share of the ceiling a mechanism recovers.* For selection that is
`(sample-5-exec − first) / (sample-5-oracle − first)`, which is dimensionless, defined on any
backbone, and the only form in which a published delta and ours can be placed on the same axis.

**Rule 15.** *A caveat that survives in a table for many iterations is a missing experiment.*
"on a different backbone" has been printed beside the DPC row since the row was entered. Until this
iteration it could not be removed: `SOTA_MODEL` and `DEEPSEEK_ENDPOINT` were variables and the
**credential was not** — the lane read `DEEPSEEK_API_KEY` and nothing else, so pointing it at
another provider's host would have sent this provider's key, arrived as a `4xx`, been classified as
a refusal, tripped the eight-prompt breaker, and been reported as "the endpoint is not answering".
A caveat that cannot be tested because a configuration value was hardcoded is not a caveat; it is a
bug that reads like humility.

Both are now registered: **R67** prices width and selection on this lane's own backbone (the
scaffold half), and **R68** repeats R67's three arms on a second backbone and reports the ceiling
share on both (the scale half). R68 explicitly cannot be a replication of the DPC row — there is no
credential or hosting here for Qwen2.5-Coder-7B — and it is written to say so in its own refutation,
because a scale ladder on one host read as a replication of somebody else's row would be the exact
error this section is about.

**Rule 16.** *A fact kept in two places will disagree with itself, and the copy that gets updated is
the copy that has a test.* Three instances in two iterations: the retry floor stayed at 140 in the
lane while the amendment said 90, `retry-values` was registered while the arm was not yet in the
union (deliberately, and written down), and `sample-5-exec` existed as a parser formula while missing
from the membership list that the lane actually checks. The union has a test that pins every arm; the
parser has a test; the document had neither. The general remedy is not "be careful" — it is to make
the second copy executable, so that a disagreement is a red build rather than a dispatch that dies.

**And the corollary, from the same iteration.** *A configuration value that cannot be set per run is
a value that will eventually be set globally, for everything, by accident.* The backbone was a
repository variable that the cache key also read, so the experiment the record has been asking for
for weeks — the same scaffold on a second model — could not be run without mutating the state every
later dispatch inherits. The fix is one dispatch input with a closed vocabulary rather than three
free-form ones, because `model` + `endpoint` + `credential` can be set half-way, and the half-way
setting is precisely the defect (a key for one provider sent to another provider's host).

### R69–R71 — the pool, the heat, and the step that reads a candidate

The three registrations that follow R67, in the order their costs justify.

**R69 — width, paired.** `sample-10-first`, `sample-10-oracle`, `sample-10-exec` at the lane's
T = 0.7, **beside** the same three at k = 5 in one dispatch. One pass of ten draws contains the
five-draw pool as its first five, so the width effect is a paired difference inside a run rather
than a comparison across two days. R67's own refutation names this branch: selection can only
recover what generation produced. 4,200 calls.

**R70 — heat.** The same five-draw arms at T = 1.0, now declared in the registration header rather
than in a repository variable. The reading is a *pair* of deltas against R69 — ceiling and first
draw — because a hotter distribution moves both ends, and "diversity" and "damage" are what the two
deltas distinguish. 2,450 calls.

**R71 — a selector that reads the candidate.** This is the 8.2-point step, and it is the only lever
a competitor's ablation shows carrying ranking information: CHESS writes *unit tests from the
question* — "the result must have a column named `County`", "the answer must be one row" — and
executes them against each candidate. Those assertions are content-aware; this lane's seven
signals are all shape, and R67 measured every one of their AUC intervals straddling 0.5.

R71 has a prerequisite this iteration pays for in bytes rather than calls. Until now the artefact
kept each candidate's *signature* and threw the query away, so the content question could not be
asked of a pool that had already been bought: pricing a content-aware selector meant buying a new
pool. `sql` and `columns` are recorded per candidate from R69's successor onward, and
`pool.rereadable` counts them, so **R71's first stage costs no model calls at all** — it computes a
deterministic, question-derived score (does the result name something the question names; does the
query carry a literal the question carries) and reports its AUC with the same question-clustered
interval every shape signal gets.

The bar is the one R67 set for shape: an interval that excludes 0.5. If it excludes it, R71 buys one
call per candidate for the model-written version and measures the difference between reading and
measuring; if it does not, then the 8.2 points are not reachable by cheap content either, and the
honest conclusion is that the gap is the *cost* of verification rather than a missing signal — which
would be the first time this project could say that with a measurement behind it.

**How the three closed.** R69: width saturates — the k = 10 ceiling is **2.00pp** above k = 5, and the
shape selector is *below* the first draw at both widths. R70: heat is not the lever either — ceiling
+1.71pp, first draw −0.85pp, and the interesting number is that five draws hold 1.446 distinct answers
per question at 0.7 and 1.620 at 1.0, so 29 more plural pools bought **6 more questions** of ceiling
(21% conversion). R71: the free content reader is inert (0.514 and 0.509, variation on 107 and 8 of 350
questions respectively) — the 8.2 points are the *price of reading*, not a missing cheap signal. All
three are in `PROGRESS.md` §173.13 with their branch and their cost.

### R72–R73 — the routing question and the written reader

The two registrations open now, one of which is a rewrite of a file that had not been dispatched.

**R72 — memory's sign is a routing property.** Memory's aggregate effect has been a null four times; the
per-tercile reading of R66's dev artefact says why — net flips **−7 / −3 / +8** across terciles of
lexical overlap between pack and question. Dev cannot resolve the contrast (33 discordant questions out
of 1,534), so the run is on `train`, 7,829 questions. Two amendments were made **before dispatch** and
both are recorded in the file:

- the estimator now exists as code (`overlap.ts`, `pnpm eval:overlap --policy`), and re-deriving the
  registered numbers with it moved the cross-fitted threshold region to **0.38–0.41** and the withheld
  share at the optimum to **71.8%** — outside the file's own 30–70% instrument band, which gives way in
  the open rather than being quietly rewritten;
- **`full-overlap` is withdrawn.** A rule choosing between `none` and `full` is *evaluated exactly* from
  a run that measures both, because both actions are observed on every question: off-policy evaluation
  with full support, no approximation. The dispatch drops to two arms, ≈18,500 calls, ≈$1.5.

**R73 — the writer is the price, and it is now built.** One model call per question writes three
executable assertions (column present, literal present, row count); arithmetic scores each candidate by
how many it satisfies. The implementation reports the three kinds separately as well as their sum,
because the registration is a claim about *which sentence* carries the ranking, and a `rows:` assertion
is a shape signal this lane already knows is inert while a `column:` assertion is the content claim
nobody here has priced without a model.

Two things changed while it was built, both recorded as an amendment **before dispatch**: the header
names the control (`sample-5-first,sample-5-assert`), because R66 taught that a header without its
control lets the dispatch omit it; and the writer runs *inside* the dispatch rather than beside it,
because an assertion written against a pool re-read from another day's file is an assertion about a
schema believed to be the same one. The reading stays offline: `pnpm eval:assertion` takes the artefact
and prints four signals with zero calls.

≈2,800 calls, **≈$0.23**, 350 of them the writer. The bar is +3pp over the first draw with an interval
excluding 0.5; if it misses, no per-question reader recovers the gap on this corpus and the selection
line closes for good.

**A note on what none of the three does.** None of them changes the prompt, and none of them adds a
memory mechanism. Fourteen iterations have priced the prompt and the memory: worked examples
+3.81pp pooled, schema ordering +0.86pp, memory packs null on four splits, pruning −9.58pp, value
spellings +0.20pp. The remaining gap to the published pipelines is in *how many queries are drawn,
which one is kept, and what the keeper is allowed to read* — which is exactly R69, R70 and R71.

### R72 and R73 landed — the routing axis is real and its whole domain is negative; reading is bounded by the pool

Both closed on the same day, and the two answers are more informative together than either alone.

**R72 on `train` (7,829 questions, 16,876 calls, $1.4039).** Memory costs **−0.84pp** `[−1.44, −0.26]`,
p 0.0054, and the routing table names where:

| tercile | injecting | gate gain at 0.30 |
| --- | --- | --- |
| low (overlap 0.081) | **−1.46pp [−2.45, −0.50], p 0.0042** | +2.91pp [1.00, 4.91] |
| middle (0.197) | −0.69pp [−1.69, 0.31] | +1.38pp [−0.61, 3.37] |
| high (0.355) | −0.38pp [−1.49, 0.69] | +0.61pp [−0.61, 1.84] |

The registered branch fires (*overlap is the axis*), and the sentence that must travel with it is that
the gate recovers the harm and not its opposite: at 0.20 the routed policy scores **−0.22pp** against
injecting nothing. Cross-fitted thresholds landed at 0.35–0.37 on all five folds; the policy flips **+9**
against always-injecting's **−66**. The prefix position is closed as a source of accuracy.

**R73 on `minidev` (3,165 calls).** Four questions moved. Every signal's interval straddles 0.5, the
arm is +1.15pp over its own control, and `assertion-value` returns **AUC 0.500 [0.500, 0.500]** — zero
width on all 115 eligible questions, because a literal the question states is present in all five draws
or in none. The registration predicted 145 eligible questions and got 115, which puts the detection
floor at about 0.59: the mechanism is underpowered, not refuted. `rows:` (0.562) beat `column:` (0.544),
inverting the file's own prior.

**What the pair implies for the next registration.** Memory's negative effect is now located on three
coordinates and only one of them is measured with a confounded instrument:

| coordinate | state | instrument |
| --- | --- | --- |
| position (prefix) | **closed** as a source of accuracy | R72, randomized by split, 7,829 questions |
| dose (1.86 rules/question) | **observational only** | attribution: 267 harmful / 236 helpful / 1,206 neutral rules of 1,709 ever injected; 33.2% of injections belong to a harmful rule |
| content (2,628 rules from 7,829 failures) | **observational only** | same |

A rule injected on hard questions and withheld from easy ones looks harmful whatever its content is.
**R74 randomises the dose** — the third arm injects a per-rule Bernoulli half of the pack — which is the
one design that turns the attribution into a causal claim at 7829 × 2 calls, ≈$1.4, and it separates
three explanations the observational table cannot: too much memory, the wrong rules, or memory that
cannot work in this position at all. `pnpm eval:overlap` and `pnpm eval:assertion` both re-derive their
readings from artefacts at zero calls, so R74's reading costs the dispatch and nothing else.

**R68's second backbone is in flight** (`zhipu:glm-4.7-flashx`, three arms, 350 questions, cap 9,000).
It is the only open experiment that is not about memory: `(exec − first) / (oracle − first)` on a
baseline far below ours is what decides whether the published 8.2-point gap is a scaffold deficit or a
baseline effect.

### R75 landed — the slice was demoted, and the direction survived the relabel

**Zero model calls.** Fourteen minidev artefacts, 350 questions each, re-executed against the corrected
gold released by Jin et al. (PVLDB 2026), which puts BIRD Mini-Dev's annotation error rate at 52.8%.
Against it, **151 of this lane's 350 golds differ — 43.1%**.

| reading | uncorrected | corrected |
| --- | --- | --- |
| mean Δ over 14 dispatches | −2.72pp | **−1.33pp** |
| significant harms | 5 | **2** (1 `stable`, 4 `fragile`, 0 reversed) |
| no-memory baseline | 54.02% | **51.26%** |

**The direction is robust and the size is not.** Thirteen of fourteen deltas are negative before the
correction, eleven of fourteen after it, and the three exceptions are +0.29 / +0.29 / +0.86pp with
p ≥ 0.69. Across seven memory mechanisms, **nothing this project has built makes minidev better**.

**Two decisions, and they are the point of the iteration.**

1. **minidev is a smoke test.** One question is 0.286pp there and the paired detection floor is about
   2.5pp, while the corrected effects are 1.4–3.1pp: the instrument is the same size as the effect.
   A finding may only be carried by dev (1,534 questions, 0.065pp each) or train (7,829).
2. **The corrected labels become the default grading for minidev**, as a manifest revision plus a patch
   overlay — its own registration, because a run before the change is not comparable to one after it.

**R72's −0.84pp on train is outside the correction's reach** and is now the only effect size this lane
quotes. The out-of-sample split is the population whose labels nobody has questioned.

**What this says about the negative effect.** R70–R73 located it on three coordinates — position
(closed), dose, content — and all of the dose and content evidence came from minidev. The relabel does
not overturn those readings; it removes the precision from them. The 267 harmful rules of R74's
attribution are computed from train, so the causal test now in flight is **the first memory experiment
in this project whose evidence was never graded by a label anyone has since corrected**.

**Next, in order.** R74's reading on train (in flight, 27,846 / 33,416); R68's third attempt sized from
its own measured fold (5,220 / 6,300, deadline 300); then the corrected-gold manifest (R76) and, behind
it, the dose randomised on train rather than on the demoted slice.

### R74 landed — the rule verdict is real in direction, two thirds artefact in size, and too small to act on

`train`, three arms, 24,465 calls. `full` 55.66% against `loo` 55.65%: **withholding one rule per
question moves nothing** (−0.01pp, p = 1.0).

| class | in-sample | cross-fitted |
| --- | --- | --- |
| harmful | +2.37pp [1.54, 3.21] | **+0.82pp [−0.08, 1.73], p 0.098** |
| helpful | −2.84pp [−3.84, −1.88] | −0.33pp [−1.42, 0.77], p 0.62 |

The in-sample table is a regression to the mean: a question the `full` arm failed is a question whose
rules were labelled harmful, and a re-draw on it improves regardless. Deciding the class on the other
four folds removes **65% of the harmful signal and 88% of the helpful one**.

**Three decisions.**

1. **`attribution.ts` is not a decision input.** Its per-rule verdicts are two thirds artefact and are
   now labelled that way wherever the lane reads them.
2. **No pruning this iteration.** +0.82pp on 43% of questions is +0.35pp on the split, against a paired
   interval of ±0.4pp. An intervention the instrument cannot see is an intervention that cannot be
   validated, and this project does not ship those.
3. **The next question is the inert share.** A pack cannot help if most of its 540 rules change no
   answer at all, and nobody has measured how many do. R77 randomises *which* rule is withheld across
   draws rather than holding one hash draw per question, and reports the share of rules that are inert
   in both directions.

**Also recorded:** `pnpm eval:loo` had never produced output — the binary exported `main` and never
called it, so the command exited zero and printed nothing while sixteen tests and every gate passed.
That is the worst shape a defect can take, and it is the second time an instrument in this lane was
silently blind (the first was the arm-coverage gate). The class table in this section exists only
because it was finally run.

**Position.** Two of the three coordinates of the negative effect are now closed as *interventions*:
position (R72, gating recovers the harm but never creates gain) and content (R74, the per-rule signal is
real but 0.35pp). **Dose is the only one left with a live mechanism**, and it is now measurable on
train — the only split whose labels nobody has corrected.

### R77 re-dispatched, and the corrected labels became an instrument rather than a reading

**Where the lane is.** Two of the three coordinates of the negative effect are closed as interventions:
position (R72) and content (R74, +0.35pp against a ±0.4pp interval). Dose is the one left with a live
mechanism, and the question standing in front of it is more basic than the dose: **do the rules change
any answer at all.**

**R77** buys that on `train`, 2,000 questions, `none,full,loo`, `temperature: 0`. Its first dispatch was
authorised for two thirds of itself — 6,875 / 7,600 against a run that needed 10,541 — because
`pnpm eval:budget` applied a per-question rate from a run whose learning pass its cache had mostly
absorbed. The ceiling stopped it after fold 1, correctly, and the planner now separates the marginal cost
from the per-fold one: for R77 that is **7,593 projected / 11,249 authorised**. Re-dispatched at 11,000 /
12,000.

**`pnpm eval:inert` reads it at zero calls**, and run against R74's own file it already shows the shape:
**54.33% of pairs identical, but only 26 of 532 rules (4.9%) inert on every draw they got**, with a third
of the liveness coming from the busiest tenth of the pack. Half the pairs are the same because a rule
drawn ten times and live five of them contributes five identical pairs — which is why pair-level
inertness and per-rule inertness are different numbers, and only the first has been quoted.

**The corrected labels are now a pinned revision rather than a reading.** R75's re-scoring of fourteen
artefacts was split in two by its own amendment: the release is the `sql_only` configuration, and it
keeps *its* questions — 67 of the slide's 350 have different text, because BIRD shipped Mini-Dev
revisions after the pin. On the 283 questions the correction can label, the baseline is **62.69%**
(pinned) / **59.64%** (corrected), where the mixture reported **54.02% / 51.26%**: every mini-dev
accuracy this lane has quoted was about **8.7pp too low**, and the effect was right because both arms are
equally wrong on a question neither was asked.

`eval/manifests/gold/` holds the correction beside the corpus with its digest, citation and an offline
identity check; `reviseGold` drops the rows it cannot score; every artefact records which labels it was
measured against. `R76` is registered to prove the path on a real dispatch — 283 questions,
`gold: corrected`, 1,015 calls — with refutations that are all instrument failures.

**Next, in order.** R77's reading (in flight, 11,000 / 12,000); R68's third attempt on
`zhipu:glm-4.7-flashx` (in flight, 5,220 / 6,300); then R76's validation, and behind it the dose
randomised on train rather than on the demoted slice — because if R77 puts the pair-level inert share
above 70%, the next intervention is the distillation prompt and not the dose at all.

### The silent tail gets its draws, and the validation came back

**R76 returned and the instrument holds.** 910 calls, `n` 283, `dataset_gold` naming the pinned revision
with 129 labels replaced and 0 unmatched, baseline **59.36%** against R75's replayed **59.64%** — 0.28pp,
a tenth of the paired noise. Every refutation stayed silent. The mini-dev level correction is now
end-to-end rather than second-hand, and the dev cells that carry the competitive ranking are untouched
because the revision is built on Mini-Dev.

**R77's 23.9% dead weight is 15.9%.** At the rate the rules that fired demonstrated — 49.9% per draw —
38 of the 113 silences are chance, so the dead-weight claim that survives is **74.8 rules**, and **105 of
the 113 hold fewer than five draws**, the point at which silence is chance once in twenty. Bringing all
of them to five costs **346 loo draws**. That is the next registration: not a pruning, a top-up, with
both directions stated in advance — if the excess is real about 75 stay silent, and if it was chance
about 38 do, which would collapse the dead-weight claim to the 8 rules that already hold five draws.

**Still in flight.** R68's third attempt on `zhipu:glm-4.7-flashx`, 5,220 calls authorised over 6,300,
whose reading is `(exec − first)/(oracle − first)`. Its deadline is 300 minutes and it has been running
since 21:24 UTC.

**Behind it, in order.** R78's targeted top-up; `retry-keyed` against `retry-blank`; the `values` block
in the first prompt; and the dose randomised on train, which is the only mechanism left alive after
R77 failed to move the pair-level share into either of its branches.


### R78 flies, because the number that grounded it belonged to another model

**The registration was right and its clock was wrong.** R78 was written `undispatched` against one row —
*wall clock at 15.6 calls/minute = six hours, past the job limit*. That rate is `zhipu:glm-4.7-flashx`,
R68's backbone. This lane runs `deepseek-flash`, whose rate is in R77's own job: 6,946 calls in 28.7
minutes, **248 calls/minute**. R78's 9,200 projected calls are **37 minutes**, and the experiment was
rejected by a figure carried over from a different provider because both were "the BIRD lane".

**It also could not have measured what it claimed.** `SOTA_LIMIT` returns a prefix, so `n = 1875` meant
1,875 of the 2,000 questions R77 had already scored — and a `loo` pair at temperature zero cannot be
drawn twice. `offset` now names where a slice starts, in the registration and in the lane, and the lane
refuses a dispatch whose population disagrees with its header. R78 scores questions **2,000–3,899** of
the **7,829** this split can score: zero overlap, 3,930 unused behind it.

**The dead weight is now an interval, not a point.** The excess is monotone in the working rate, so its
interval is the same arithmetic at the rate's Wilson endpoints — no resampling, reproducible. R77's 74.8
is **72.5–77.1** at 95%: dead weight exists at **15.4–16.4%** of the pack, and the "it might all be
chance" reading is refuted by the same file that produced it. What the interval cannot give is
identities, and a pruning needs them.

**So the remaining question narrowed.** R78 no longer tests whether dead weight exists; it moves 105
rules from "silent on one to four draws" to "silent or live on five", which is the only form in which a
pruning can name what it deletes. Its answer must land between **35.9 and 40.5** wholly-inert rules if the
49.9% rate is right, and outside that band is a statement about the rate rather than about the pack.

**Next, in order.** R78's readback (in flight, 11,000 / 12,000, 1,900 questions at offset 2,000); R68's
fourth attempt and its `(exec − first)/(oracle − first)` share, intersected with R67's question ids before
anything is computed; then `retry-keyed` against `retry-blank`, the `values` block in the first prompt,
and the dose randomised on train.

### The memory's contribution is inside the noise, and that is now the top of the queue

Four dispatches across three splits and two backbones, and the quantity every arm is supposed to move has
never separated from zero:

| artefact | split | n | learning | effect | 95% |
| --- | --- | --- | --- | --- | --- |
| `poc-sota-bird-dev.json` | **dev** | **1,534** | 64/fold | **−1.37pp** | **−2.74 … 0.00** |
| `poc-sota-bird.json` | Mini-Dev | 350 | 280/fold | −2.86pp | −6.00 … +0.29 |
| `R63-recall-order` | Mini-Dev | 350 | 280/fold | +0.57pp | −2.86 … +4.00 |
| `R77-inert-share` | train | 2,000 | 700/fold | +0.25pp | −0.90 … +1.40 |

**The dev row changes what the table means**: 1,534 questions, upper bound exactly zero, one-sided
p = 0.031. The two negative rows are also the two smallest learning samples, which is the confound to
state first — a store learned from 64 questions is not the store learned from 700. At 700/fold the effect
is +0.25pp with a ±1.15 interval: **inside ±1.4pp**, tighter than any improvement the arm ladder has tried
to measure.

**And the cell this project publishes is a `none` number.** `poc-sota-bird-dev.json` scores **57.63%
without memory** and 56.26% with it. The +4.11pp against XiYan's 53.52 is beaten by the arm that injects
nothing, and every arm from R10 to R77 varied the other one.

**So the next question is not "which pack" but "does the pack earn its 1,083 characters"**, and the first
experiment that can answer it is `full` against `full-pruned` on the same questions — R79, registered, to
be dispatched on R78's slice so the learning cache pays for it. The honest prior is that pruning will not
move accuracy much; the case for it is cost.

**R68 is now the experiment that can move the published cell**, because it improves a `none` number
(self-consistency at five draws) rather than the component inside the noise.

**Unchanged behind it.** R68's fourth attempt and its `(exec − first)/(oracle − first)` share; then
`retry-keyed` against `retry-blank`, the `values` block in the first prompt, and the dose randomised on
train.

### R78 came back: the pack reproduced, the purchase order did not

Two disjoint populations and two independently distilled stores scored **55.73%** and **55.87%** inert
pairs, **113** and **109** wholly-inert rules, excess **74.8 (72.5–77.1)** and **71.0 (68.6–73.4)**. The
inertness and the dead weight are properties of this pack, not of the questions — that question is
closed, and the answer is 15% of the pack, not 24%.

**The plan bought 97 of its 346 draws.** `looTargets` names rule ids from R77's store; a rule id is a
content hash, so a rule survives into a store learned from other questions only when the same sentence
was learned again. The balancer was right and the purchase order was store-local. A future top-up either
plans against its own store or forces the recall.

**`full` against `loo` flipped sign** (+0.90pp in R77, −0.32pp in R78, neither significant), so per-rule
effect at this size is noise and R77's dose-response reading has no support.

**Cost is now a printed number, not a habit.** R77 paid $0.531 for 6,946 calls at 23:19 UTC; R78 paid
$1.111 for 6,943 at 03:19 UTC — 95% of it peak, 1.90× for the same tokens and the same cache rate.
`bandOf` and `nextOffPeak` had been in `cost.ts` unused since the rate card was written; `pnpm eval:band`
is now called by the workflow and names the hour the identical run halves. **Scheduling at off-peak is
the cheapest lever this project has and it costs nothing to pull.**

**Next, in order.** R79's pruning pair (`pruned` against `full` on R78's slice, so the distill cache pays
for it) — the first arm whose counterfactual is less memory; R68's `(exec − first)/(oracle − first)`
share, which `pnpm eval:width-share` will read from the artefact against R67's question ids; then
`retry-keyed` against `retry-blank`.

### The share came back, and it came back because the baseline fell

R68's fourth dispatch scored 28.00% `first`, 35.43% `exec`, 42.57% `oracle` on glm-4.7-flashx, and the
share `(exec − first)/(oracle − first)` is **0.51 [0.33, 0.67]** against **0.13 [−0.27, 0.40]** on this
lane's own backbone. The registered branch **`Baseline-bound`** fires: the published +17.6pp between
DAIL-SQL+SC and CHESS+SC was bought at a 48.6% baseline, and a selector that recovers half of a 14.57pp
ceiling at 28% recovers an eighth of an 8.86pp one at 51%.

**Its ceiling prediction failed by half, and the failure is the more useful number**: +14.57pp against a
registered +30…+50pp. Five draws rescue **18.0%** of failures at 51% accuracy and **20.2%** at 28% — the
ceiling scales with the failure population, proportionally rather than super-linearly, and all of the
difference between the two rows is in how much of it a selector finds.

**Deployable and significant on the weak backbone**: `exec` against `full` **+6.86pp [2.86, 11.14],
p = 0.0022**, 41 gained / 17 lost; on ours +0.57pp [−2.57, 3.71]. `first` against `full` is −0.57pp on
both, so it is selection and not temperature.

**The branch sends the next registration to the ceiling, not to another selector.** Width is spent
(R69: k = 10 bought +2.00pp over k = 5 for twice the calls, and `sample-10-exec` came in below the first
draw). Temperature has never been measured: **R70-temperature is dispatched** (`42965249014`) at
T = 1.0 on R67's exact 350 questions, 3,600-call forecast under a 4,400 cap, off-peak.

### Pruning a fifth of the pack moved one question

R79 withheld all 105 rules R77's plan names — **694 of 3,497 placements, 19.8% of the injected text** —
from 1,900 questions: `full` 57.63%, `pruned` 57.68%, **+0.05pp [−0.79, +0.84], 33 gained / 32 lost**.
The 116 packs the pruning emptied scored 67.24% against 65.52% and 66.38% — no result on 116 questions.

So the dead weight is inert in the strict sense, and it could not have been otherwise on this slice:
`full` against `none` is **−0.11pp**, so the whole component is inside its own noise before pruning.

**The reach prediction missed upward and that is the finding**: 33.8% of packs held a named rule against
a registered 18.4%, because the plan names rules that were *drawn and never decisive* and such a rule is
generic — a rule that resembles everything is drawn against everything and decides nothing. **Dead
weight is not a rule being useless; it is a rule being generic**, which is the same fact R78 found from
the store side.

### The artefact's own field was zero because nobody was there to increment it

`config.loo_targets.given` read **0 of 105** on a run that withheld 694 placements of those rules: the
counter lives inside the `loo` arm and R79 bought `pruned` alone. `planCoverage` now reports `present`
(store's own answer), `given` (`null` without `loo`) and `withheld` (`null` without `pruned`) — R79's
should have read `present: 97, withheld: 97`, the same 97 R78 counted on the same slice.

**Cost, measured**: R79 paid **$0.5398** for 6,663 calls at 04:18 UTC against R78's **$1.111** for 6,943
at 03:19 with 95% of it peak — 96% of the calls for 49% of the money, with the distill cache serving
97.0% of the distillations.

**Next, in order.** R70 (temperature, dispatched, ~$0.5) — the only unspent ceiling lever; then
`retry-keyed` against `retry-blank`; then the store-local top-up design (force-recall, 692 calls).

### R70 and R71 came back: the temperature line closed, and reading costs money

**R70, T = 1.0, 2,966 calls, $0.2385, 100% off-peak, 77.3% cache.** `first` 50.29%, `sample-5` (voting)
50.57%, `exec` **48.57% (−4.86pp against `full`, p = 0.016)**, `oracle` 58.86%. Against R69's k = 5 arms:
**Δceiling +1.14pp, Δfirst −1.42pp** — the registered branch is `Otherwise` (it needed a 2pp baseline
drop to be named `Heat costs` and got 1.42), and the substance closes the line anyway: the deployable arm
lost 2pp against R69's, and voting paid +0.29pp where it was predicted to pay +2.

**Heat buys diversity, not coverage**: distinct results per question 1.45 → 1.60 and thirty more questions
disaggregated, while the pool's coverage fell 209 → 206. A hotter sample moves wrong answers around.

**R71, zero calls, read from R70's pool**: `column-mention` AUC **0.514 [0.464, 0.567]**, `literal-match`
**0.506 [0.500, 0.520]**, top-pick −1.3pp against the first draw. Branch **`Content is not free`**: the gap
to the published pipelines is **the price of reading**, and CHESS's assertions are five model calls per
question.

**And the cross-experiment reading**: the same `empty` feature is 0.535 at a 49% failure population and
**0.706 at 72%**, with every content and shape signal at chance on the hot pool. Signal strength tracks the
baseline, not the temperature — R68's branch measured at the level of one candidate.

**Next, in order.** (1) **R80 — the price of reading**: one call per candidate, an assertions-style
verifier written from the question and applied to what each draw returns, priced against the 8.86pp
ceiling this lane's own backbone actually has. It is the last selection lever with a measured reason, and
at five calls per question it is the most expensive arm this project has considered. (2) The store-local
top-up (force-recall) design, still open from R78. (3) `retry-keyed` against `retry-blank`.

### The local gate dirties the tree, and the noise rode in an experiment's commit

`pnpm check` rewrites six committed artefacts — `ranAt` timestamps and wall-clock p50/p95 measured on
whatever machine ran it. The R70/R71 commit carried **279 lines of a sandbox's latency** beside two
experiment outcomes; reverted, and the split is now a roadmap item: the deterministic claim stays
committed, the machine-local measurement goes to an ignored path. Nothing in CI compares those files, so
nothing went red — which is precisely why it was noticed by reading the diff rather than by a gate.

### The gate stopped rewriting evidence, and the reading learned to be told which arm

`pnpm check` rewrote its own committed artefacts on every run — `ranAt` plus the host's p50/p95 — so the
gate dirtied the tree and once put 279 lines of a sandbox's latency inside an experiment's commit.
`splitClaim` keeps the claim and moves the clock and the timings to an ignored `.volatile/` sidecar, by
exact key name (a pattern would have eaten `p95_budget_ms`, a threshold the study claims). `eval:claim-check`
reads the committed 67 artefacts and runs in `pnpm check` and CI. One prose sentence interpolated its own
loopback p95 and had to be rewritten, not stripped.

`eval:width-share --selected <arm>` names the middle arm, because R80 buys `sample-5-assert` where every
earlier share divided by `sample-5-exec`. A named arm is validated against the artefact's own arm list; the
default is not, so an artefact without `exec` still reports "no question carries all three" rather than a
second error. The parser lives in `width.ts` because `bin/**` is outside coverage by the package's own rule
and an untested parser is exactly what `pool.ts` was.

### The memory question got a mechanism, and R81 is the first arm that tests it

Six arms have varied what the pack stores or how much of it is shown: `full-raw` (the case instead of the
rule, −0.86pp), `full-shuffled` (another question's pack, +1.14pp vs `full`, interval covering zero),
`wrong-scope` (foreign database, −0.29pp), `pruned` (a fifth withheld, +0.05pp on 1,900 questions). None
varies **whether the thing shown was ever stored**. Three 2026 papers say that is the variable: an error in
a stored abstraction is re-abstracted and regenerated (arXiv:2610.27406), verbatim replay causes negative
transfer (arXiv:2607.28272), and a flat concrete pool degrades as the task set grows (arXiv:2610.19386).

`R81-reconstruction` is registered and **waits for the off-peak window** (peak until 10:00 UTC, and the
same tokens cost 2× inside it): `full-reconstructed` writes ≤240 characters of advice for one question from
its own retrieved notes and writes nothing back; `full-reconstructed-shuffled` makes the same call from
another question's notes in the same database. dev, 1,534 questions, ≈9,600 calls, gate `V80`.

Its four branches are written before dispatch. The one that matters: if both contrasts straddle zero, **the
memory line closes with four mechanisms measured null at one population** — content, quantity, persistence
and the foreign control — which is a result the SDK can be sold on, not a fifth knob to tune.

### R80 came back: the selector works, the candidate generator is the constraint

1,534 questions, 12,194 calls, $1.6272 (all peak; ≈$0.81 off-peak). `none` 57.24%, `full` 56.78%,
`sample-5-first` 55.93%, **`sample-5-assert` 57.30%**.

| contrast | reading |
| --- | --- |
| `assert − first` | **+1.37pp [+0.52, +2.22], p = 0.0025** (33 gained / 12 lost) |
| `assert − none` | +0.07pp [−1.04, +1.17] |
| `first − none` | **−1.30pp [−2.41, −0.26], p = 0.025** |
| ceiling / share | **7.37pp**, **0.19 [0.08, 0.29]** — CAPTURED |

**The written reader is the first significant selector in this project, and it buys exactly what sampling
costs.** Five draws of one prompt at T = 0.7 open a 7.37pp ceiling but cost 1.30pp on the first draw; a
reader that captures a fifth of the ceiling returns to level with a single deterministic call. 75% of
questions never produce a second distinct answer at all (distinct 1.33, median 1), and every content signal
still covers 0.5 AUC at 4.4× R71's population while every shape signal now clears it (0.54–0.56).

**The target, stated once, because the queue below was drifting away from it.** SOTA in this domain is the
largest **paired lift in task success that a fixed model obtains from experience it extracted itself, on a
workload that recurs**, reported with its interval, its minimum detectable effect and the store-side counts
that say the treatment was delivered. Absolute EX on a one-shot benchmark is instrumentation. A BIRD null is
instrumentation, and it is *expected* there by the shape of the population rather than informative about the
mechanism. S2c already said this on 2026-11-08 (*"an absolute EX may never be quoted beside a leaderboard
row"*); Appendix M of `COMPETITIVE.md` is the competitive table that follows from it, and it is the only table
this project is ranked on. **The competitive set is ALTK-Evolve, ExpeL, ACE, AWM, Dynamic Cheatsheet, Mem0 and
MemGPT — not the BIRD cells at 73–83%**, which is why the last four iterations' readouts are filed below as
hostile-case closeout rather than as the state of the product.

**Next, in order — and the first four items are supply, because supply is the only column where this project
is behind.**

1. **R58 — dispatched for the 04:00 UTC window, and it is the one that changes the object.** τ² retail
   same-domain, 57 tasks × 4 trials × 2 arms, `distillUnit: trace`, `traceClaims: 3`, `distillScope: edited`
   read from its own header (the sixth switch: `vars.TAU_TRACE_CLAIMS` held 6 and would have run this
   registration at twice the ceiling its text asks for). Its predictions were written on 2026-11-08 and none has
   been graded: something reaches support 3, ≥25% of items reach support 2, the consolidation pass keeps ≥50% of
   the store, median non-zero coverage reaches 12%, ≥80% of corrections carry a trace. This is the cell that
   tests whether *the unit* is the constraint on yield — the column where this project is 0.50 items per
   learning task against the leader's ~5.
2. **R56's smoke — queued for the same window, ten tasks, $0.15.** Not an experiment: the re-dispatch
   (`43115503600`) distilled 12 corrections to 0 candidates after the first run distilled 8 to 8, and the
   refusal blamed the interpreter from a counter taken after the parser. The funnel now records `asked` and
   `dropped`, so the smoke names the cause. Until it does, R56's −8.77pp is **one** measurement with an
   unexplained replication rather than a settled revert (§173.77).
3. **R55.0 — read, and it closed its own axis.** `{1: 7}`: no item in the trace store reached support 2, so
   `supportTasks >= 3` was above the population's maximum and R55.1's admission rule admits nothing on that
   store. The census is now a command (`pnpm eval:recurrence`), and it re-reads whatever store R58 produces for
   free — a sample of the store, a support histogram, `atLeastTwo`/`atLeastThree`, and `whole` so a window's
   zero is never quoted as the store's.
4. **R55.1 — does admitting at support ≥3 change the pack and the register?** This is the SOTA holder's own
   winning cell **and the cell that flips its sign between domains** (airline: 101 rules score below 14). It
   stays registered and it stays conditional on item 1: a threshold over a store whose maximum support is 1 is
   an arm that admits nothing, which is why it follows R58 rather than preceding it. **Reading their source
   changed its design** (Appendix N): their treatment is *admit at `n ≥ 3`* **and inject every admitted entry
   into the system prompt, in both ReAct phases, with no retrieval and no budget** — 31 bullets, billed twice a
   turn. Ours serves 1.42 items per request through a 1,200-character pack. So the arm becomes two:
   `sup3-retrieved` against `sup3-prefix`, one variable, and the second is the only cell in this project that
   can be compared with their published number at all.
5. **U6b — deciding at write time** (add / update / noop) rather than appending. Built; the only structural
   difference left between an append-only store and Mem0's bounded consolidation, and the reason a store can
   stay dense without being long.
6. **R53 — the reader-side variable**, on whatever store items 1–4 produce. A note that improves the reader of
   a thin store is a result about a store nobody has, which is why it is fifth and not first. Its header now
   declares `facadeNotes: three-level`, and the switch that carries it was reading the repository variable until
   the every-arm assertion was written.
7. **Then, and only then, the hostile case's leftovers:** R78's store-local top-up, `retry-keyed` vs
   `retry-blank`, and breadth (R67's ceiling arm is still the cheapest +8.86pp in the record).

**R84 is read and it is `Void` on the branch its own registration wrote first** — parse **73.14%** against a
95% floor, and the distiller failing 572 of 1,400 replies because its 2,000-token budget is not coupled to the
regime. Reasoning was **95.84%** of completion tokens and the bill was **$6.9051 (7.2× R82)** for a cell that
cannot be read. To hold parse the ceiling needs ~3,500 tokens, which is **$13–14** to price a variable that is
already 6.00pp worse when it is off: **the thinking axis is closed for this host**, on arithmetic rather than on
a preference (§173.74). The defect it found — a regime that changes token economics changes only the answer's
budget, never the distiller's — is recorded behind the closure.

**Six switches have now moved out of repository variables and into registrations** (`backbone`, `thinking`,
`distillForm`, `distillUnit`, `distillScope`, `traceClaims`), because a variable is one experiment's setting
applied to every queued dispatch and two of them were *live this week*: R58's header named no unit and no
ceiling while `vars.TAU_TRACE_CLAIMS` held 6 against its text's three, and R62's named no population. The fourth
was live when it was written: `vars.TAU_DISTILL_UNIT` still held `trace` from the recurrence arm, so R56 would
have run the wrong arm under its own name (§173.75). Nine switch lines in `sota.yml` now prefer the step output
over the variable, and a test parses the workflow and checks **every** assignment of each key — the first version
read only the first one, and the reference arm was reading variables under a treatment that read the registration.

**The hostile case, closed out — and explicitly not a verdict on the flywheel.**
1. **R81 — read, and it closed BIRD as a memory substrate.** Fifth dispatch, 1,534 questions, 14 gates passing, $0.5338.
   Against `full`, the rebuilt arm is **−0.33pp [−1.76, +1.11]** and the foreign control **+0.13pp [−1.30, +1.56]**;
   both straddle zero inside 1.5pp, which is the branch the registration named *Reconstruction is not the problem
   either*. Four mechanisms — content, quantity, persistence, foreign control — are now measured null at BIRD dev
   57.4%, each by a different registration (§173.69). The writer declined on 86.4% of questions.
2. **R82 — read, and the stronger backbone is the weaker one.** 350 questions, `minidev`, 14 gates, $0.9563,
   3,346 calls, `pricing.matches: true`, catalogue `listed`. `deepseek-v4-pro` scores **46.29% on `none` against
   `deepseek-flash`'s 52.57% on the same cell**, and paired per question the difference is **−6.00pp (34 flash-only,
   13 pro-only, exact McNemar p = 0.0031)**; the first draw gives −5.43pp, p = 0.0163. Not an artefact: identical
   decoding budget, 48 truncations against 49, parse 100% both, 0 dangling SQL, and the 47 discordant questions
   contain no execution failure. `assert − first` is +1.71pp [−2.00, +5.43] on pro against +1.15pp on flash in the
   same 350 — the written reader's sign and size travel, only its significance moves with n. **None of the
   registration's four branches was entered** (Void missed by 1.5 questions, the ceiling is 8.57pp not 13.29pp,
   the reader's points are short of +3pp, and the baseline fell instead of rising): the guard sentence that covers
   this outcome was written under *Prediction*, so the partition has a hole (§173.71). $5.90 per correct answer
   against $2.57 — the expensive model is not a lever, and the money belongs in breadth. **Filed as hostile
   case:** this cell compares two backbones on a population with no recurrence, so it says nothing about
   whether experience transfers; it says which generator writes better SQL when it has no experience to
   transfer. Those are different claims and only the second one was bought.
3. **R83 — cancelled before dispatch, by arithmetic.** The store R81 published holds 633 same-scope pairs and 3
   above the consolidation pass's 0.60 floor: the same pair of statements in three folds. Six questions of 1,534
   is a 0.39pp ceiling against this lane's 1.99pp floor, so the arm is underpowered by five times by
   construction. Raising `learn_sample` nineteen-fold puts the repeats at roughly twenty groups, still under 3%.
   The merge is not the missing mechanism — the store is too small to have one (§173.70).
4. **R84 — in flight, and it is instrumentation only.** No reasoning at all is the one thing R82 held fixed. The
   token cap is not the throttle: pro spent 82.5 output tokens a call against a 700 budget, truncated 0.64% of
   statements against flash's 0.67%, and left no dangling SQL. What `thinking: off` removes is every reasoning
   token (`reasoning_tokens: 0`), and a model built to think is being judged on the one regime it was not built
   for. One arm (`sample-5-first`, which buys `none` as the baseline — the arm the contrast reads),
   `SOTA_THINKING=on`, the same 350 questions, about a dollar. The decision rule is a **paired pro@on against
   pro@off**, and only a move of +6pp or more earns the 2 × 2 that would attribute it. It prices a variable on
   a lane that cannot carry a product claim; it is bought, it will be read, and it does not enter the flywheel
   queue above.

**No item on this list is a leaderboard entry**, and the four above are the closeout of a hostile case: BIRD
has no recurrence by construction, so the mechanism this product claims — an artefact that pays because the
same task comes back — has nothing to act on there. Reading four nulls there as a verdict on the flywheel is
the same category error S2c retired when it forbade quoting this lane's absolute EX.

### Why memory harms, in six measurements, and what it changes

The question this record has carried since R25 — why a pack distilled from its own corrections does not
reliably help — was never about retrieving the wrong rule. Six results from the last four months put the
mechanism on the table:

| Source | Measurement |
| --- | --- |
| MemTrapBench, arXiv:2608.20202 | Two model families × five frameworks: **every** strategy underperformed no memory, the strongest by >10%. Names *Reasoning Fixation* and *Belief Distortion*; recall metrics cannot see either, because the retrieval was right. |
| SEMV, arXiv:2609.27175 | 86.06% (no memory) → 87.29% (episodic) → 87.59% (unverified, 46.4% positive / **5.7% negative**) → **91.88% (verification-gated, 0.2% negative)**. |
| MemTrim, arXiv:2610.07311 | Harm concentrates at **intermediate** query-memory overlap; deleting or compressing entries removes the harm *and* the benefit. |
| FactConsolidation | Evidence budget 64 → 512 tokens dropped accuracy 45% → 32% with the newest claim present every time; a stale *competing* claim is worse than noise (100% → 44.6% on one swap). |
| ALTK-Evolve | One mechanism, eight models: **+16.1pp to 0.0pp**. The model's headroom decides, not the design. |
| Agent Memory Leaderboard | 69 submissions, best 58.02/100. |

Three consequences. R81 is a faithful replication of Anti-Persistence (arXiv:2610.27406) — keep raw
trajectories, rebuild per task, throw away — and that design had the highest held-out success *and* the
lowest average call cost of the ones it tested. "Store less" is not the axis: SEMV's gate keeps 93% of the
positive transfer and removes 96% of the negative. And this project already computes the number the gate
needs — a rule's independent corroboration count exists inside `looCrossFitted` and has never been used to
decide what enters a pack.

### The band lever became a dispatch field

`pnpm eval:band` existed from the day the rate card was written and had no caller until R78 paid 1.90× for
nine minutes of clock. The workflow now takes **`not_before: HH:MM`**: the job sleeps until the window, the
deadline check subtracts the wait from the 340-minute job limit, and the summary prints the band *after* the
wait so a run says which band it actually started in. R80 was dispatched inside the peak window and paid
$1.6272 where the identical run off-peak is ≈$0.81.

### The no-argument reader is now refused, not ignored

`arm-pairs --bird <file>` printed a 350-question table about a different file — third occurrence of the
class (`pool.ts`, `width-share.ts`, this). `noArguments` refuses an argument the reader cannot honour, eight
readers call it, `arm-pairs` gained a real `--bird`, and a source-level test asserts the invariant so the
next reader someone adds cannot skip it.

### The two hours before the window: three relays, and the mile that is still missing

R58 and the ten-task R56 smoke were dispatched for the 04:00 UTC band and none of the three items below
is an experiment. They are the instruments the reads depend on, and each was found by reading the artefact
the last round produced rather than by a failing test.

| Priority | Item | State |
| --- | --- | --- |
| P0 | the committed coupling snapshot described 191 modules against a tree of 192 | fixed, CI green (`42a6b8e5`) |
| P0 | `_funnel.py`: the chain and the driver's sentence, one implementation for both τ² readers | done, 20 self-test cases across the two |
| P0 | `r58_readback` reads the funnel at all — it had none, and this round exists to move those numbers | done, before R58 ran |
| P0 | the sentence pinned across the language boundary, once in the writer and once in the module | done, 3 cases |
| P0 | `recall-query.ts`: five knobs, validated, held once; `minEvidence` and `anchoring` reach the pack | done, 9 parse cases + 1 on the wire |
| P1 | **`packMode: retrieved \| prefix`** — the switch that makes `sup3-prefix` askable from the lane | **not built**: conditional on R58 holding an item at support 3 |
| P1 | R58's five predictions, and `pnpm eval:recurrence` over the store it writes | waiting on the band |
| P1 | the smoke's three zeros, told apart by `asked` and `dropped` | waiting on the band |
| P2 | R55.1's two arms, R53's three note levels, U6b, R57 | registered, one lane at a time |

**What `minEvidence` was for, and what it is not.** It is the pack layer's corroboration floor: an item
enters a pack only if `evidence.length` clears it. That is the same number `looCrossFitted` computes and
the same gate SEMV measured — 46.4% positive against 5.7% negative for unverified memory, 0.2% negative
once verification gates admission. It is **not** a substitute for R58: a floor above the population's
maximum admits nothing, which is the arithmetic that closed R55.1 the first time. The difference is that
the floor now also exists on the *pack* side, where it acts on a store that has already been written,
rather than only on the write side where it decides whether the store exists at all. Two throttles, one
number, two different populations.

**What `anchoring: 'scope'` was for.** It is the only mode in this codebase that serves a rule without a
lexical anchor, and therefore the only one that can render the SOTA holder's protocol — every admitted
entry, every call, no retrieval, no budget. Our pack serves 1.42 items a request through a 1,200-character
budget; theirs serves 31 bullets twice a turn, unbilled. Until this week the lane could not express the
second at all, and Appendix N's comparison was arithmetic rather than a measurement. It is still
arithmetic until `packMode` exists; the wire now carries the knobs that switch needs.

### The seventh switch is thrown, not merely described

`packMode: retrieved | prefix` is now a registration field, a resolver, a `prereg-form` output and two
`TAU_PACK_MODE` assignments in `sota.yml` — landed as one commit because the audit refuses a switch no
workflow can set. What is **not** landed is the lane's passthrough: `microglia_agent.py` still builds the
recall URL from its own env, so `TAU_PACK_MODE=prefix` resolves and is recorded but does not yet change
what the sidecar is asked for.

| Priority | Item | State |
| --- | --- | --- |
| P0 | `packMode` in the header, with its two-name validator and its refusal | done, 7 cases |
| P0 | `pack-mode-plan.ts` — `retrieved` reproduces the historical request byte for byte | done, 6 cases |
| P0 | `sota.yml`: the variable, the step output, both arms, and the `OWNED` guard | done, 42 source cases |
| P0 | the lane's passthrough — the resolver's fragment, carried by `MICROGLIA_PACK_KNOBS` and appended by `recall_url` | **done** (`3dd92ddf`); a malformed pair is dropped, and both sides of the switch are in `OWNED` |
| P1 | R55.1's registration then names `packMode: prefix` and `minEvidence: 3` on one store | after R58 |

### The window opened, the run died on a rule, and the rule was wrong

`R58` was dispatched at 04:01 UTC — the first minute of the off-peak band — and was refused by
`prereg-form` before its first model call, because the header fixed `traceClaims: 3` and the repository
variable held `6`. Both arms read the header's step output first; the variable is the no-registration
fallback and no dispatch in this lane takes that branch. The check compared the registration against a
value the run does not read.

The refusals are now notices (`switchOverride`), the run annotates `::warning::` instead of stopping, and
the reference arm's smoke from the same window stands as evidence that the rest of the payload is sound:
five tasks, four trials, `pass^4 = 1`, **$0.0462**, 92% cache. The re-dispatch is `43154220251`, sent at
04:21 UTC.

Two things about this belong in the queue rather than in the incident:

- **The window is the scarce resource, not the money.** Both dispatches cost nothing to be wrong; what
  they cost was six hours of band, and R58 is the last prompt-side and write-side lever this record has.
  A guard that fails closed on a comparison the run does not depend on is now a category the audit knows
  by name (§34.101).
- **The smoke's zero is the model's, and the funnel can prove it.** `1 correction(s) -> 1 asked -> 0
  candidate(s) (0 refused, 0 failed)` is the third of three possible owners of a zero, and it is the only
  one no code path here can repair.

### Retention is the measurement this lane did not have

`pass^4` collapses four trials into one number and cannot separate a memory that worked once from one
that carried the task every time. The comparator this lane is graded against — `Learning on the Job`
(arXiv:2607.22157) — persists a memory inside a single τ-bench episode across four trials and reports
**hold rate 0.88 / 0.65**, P(pass at t+1 | pass at t) pooled over pairs, `undefined` when there is no
pair. We had the counts (`successes/trials`) and had thrown the order away.

`outcomes` now rides beside the counts in `per_task`, `holdRateOfTrials()` recomputes the same reading
from `per_trial` so published artefacts can be re-read without a re-run, and `l4-pair` writes `retention`
for both arms. The caveat is part of the field: this lane splits learn from test, so its trials are
repeated attempts under one memory rather than the same task recurring, and the 0.88 / 0.65 pair is
quoted as the *shape* of the measurement rather than as a value to compare.

| Priority | Item | State |
| --- | --- | --- |
| P0 | R58 on the whole held-out set, both arms, inside the band | **running** (`43154220251`, 04:21 UTC) |
| P0 | read R58's five graded predictions + `retention` for both arms | on completion |
| P1 | R55.1 (`packMode: prefix`, `minEvidence: 3`) on the same store, gated behind R58's support-3 item | registration ready, dispatch blocked on R58 |
| P1 | R53 and R57, both downstream of what the store contains | blocked on R58 |
| P2 | if R58 refutes: the ceiling is the *corpus*, and the next registration is about the sample | registered as a possibility in R58's own Refutation section |

### The corpus is the remaining gap, and it is one variable

Appendix O put the field's one published persistence number beside ours and named the difference: the leader
writes its memory **inside the episode**, from the trial that just failed, so trial 2 reads what trial 1
taught. This lane writes from a separate learn split, so its four trials run against a fixed store and its
hold rate — once R58 produces one — measures stability under a fixed memory rather than accumulation across
attempts. Same formula, different quantity.

The arm that closes it changes **when the store is written** and nothing else: trace unit, consolidation,
the tool-name ban, model, seed, split, held-out tasks and the four trials all held as R58 fixes them; the
reference arm still runs empty, so `pass^1` and hold rate are read against a control in the same dispatch.
Bounded at one distillation call per failed trial and three claims each, with the consolidation pass at zero
model calls.

Sequenced after R58 on purpose: a store that does not recur in the offline shape gives an in-episode arm
nothing to accumulate. Recurrence first, accumulation second.

### R58's window closed on the second arm, and the store closed at four answers

The re-dispatch ran: 15 corrections, 57 traces read, **11 of 15 distillation calls faulted**, six
items stored, `{1: 6}` before and after a consolidation pass that formed **zero groups at every
threshold from 0.40 to 0.80**, coverage 10.53% against a 12% bar, `pass^4` **0.6491** against the
published 0.575, and retention **0.881** over 143 pairs. The reference arm was refused at 06:21 by
the peak guard, correctly, because the memory arm alone had taken 119 minutes.

Three consequences, in the order they must be addressed.

| Priority | Item | Why it is here |
| --- | --- | --- |
| P0 | ten-task trace-unit diagnostic that returns `llmFailedReasons` — **registered as R59 and dispatched, waiting for 10:00 UTC** | 11 faults of 15 is a prompt problem, a token-ceiling problem or a provider problem, and the fixes differ; costs under $0.10 |
| P0 | the scheduling constraint: learn 26 min + evaluate 93 min = 119 min against a 120-min window | a paired dispatch of this size cannot fit; open at 04:00 exactly, split the arms, or state the second arm runs at double price |
| P1 | the `rawlog` arm (Appendix P.3) — raw-history RAG at the same retrieval scope | the field's baseline is raw RAG, not no-memory, and our reference arm is the wrong control |
| P1 | the in-episode arm (Appendix O) — memory written after each failed trial | makes hold rate comparable in kind to 0.88/0.65 and tests the anti-persistence finding |
| P2 | R55.1 (`packMode: prefix`, `minEvidence: 3`) | still blocked: no item at support 3 exists, and R58 did not create one |
| P2 | R53, R57 | downstream of a store that can be built |

**What the round did settle.** The trace unit reaches the wire and behaves (100% of corrections
carry a trace, nothing dropped by the parser); six items served at 2.0 per request and did not lose
points; the consolidation pass is starved rather than inert — six claims from six different tasks
were never going to overlap; and retention, the instrument added the same night, produced its first
number and it is 0.881 with the caveat attached. The support axis is neither open nor closed. It is
unmeasured, twice, for two different reasons, and both reasons are now named in the readback.

### The arm the literature argues for is built, and it is one variable

`unit=raw` stores the episode — question, calls, arguments — with no model call at all, and
`tau2-faithfulness.ts` measures what an abstraction destroys at write time, which is the half of
`Memory Tax`'s accounting this lane had no instrument for. Both are registered (`R85`) and graded by a
readback whose self-test is 15/15.

| Priority | Item | State |
| --- | --- | --- |
| P0 | `R86` fault census, ten tasks, trace unit | **waiting for the 10:00 UTC window** (`43187614906`, under $0.10) |
| P0 | read `R86`'s codes and decide: ceiling, prompt, or backoff | on completion |
| P1 | `R85` raw-record arm on the whole held-out set | built and registered; dispatch at 16:00 UTC (~$1.06) |
| P1 | the abstraction arm re-run once `R86` names the cause, so the raw arm has a same-window comparator | blocked on `R86` |
| P2 | in-episode arm (Appendix O): memory written after each failed trial | designed; sequenced after the store-shape comparison |
| P2 | `R55.1` (`packMode: prefix`, `minEvidence: 3`) | still blocked: no item at support 3 exists |

**The comparison this sets up.** `R85` against the published 0.575 answers "is a record store better
than the lane's baseline". It does not answer "is a record better than a claim", because R58's
abstraction arm was itself broken — eleven of fifteen writes faulted. That question needs both arms on
the same corpus with both writes working, which is why `R86` comes first and why the comparator is
sequenced behind it rather than beside it.

**One process note, in the queue rather than in the incident.** The fault census had been dispatched
under a registration with no readback, and under a number another registration already held. Both were
fixed before the window opened, and both were mine: the number came from reading a directory listing
sorted by name, and the missing readback came from treating a diagnostic as too small to need a
grading rule. A diagnostic is where a grading rule is most valuable, because its outcome decides which
of three fixes the next month spends.

### Both arms are dispatched, and the premise is a test rather than a paragraph

The raw arm went out with a test behind it instead of an argument. One record written from one task,
recalled by a second task's question: served at `minCoverage: 0.2`, not served for a request about the
weather, rendered block carrying `W237` and `item-9`. At the setting the lane actually runs
(`recallFloor: 0`, no gate) both requests are served — which corrected three documents at once and is
recorded as §34.104, because a threshold that no run applies is a sentence rather than a measurement.

| Priority | Item | State |
| --- | --- | --- |
| P0 | `R86` fault census (`43187614906`, `f8d9c84a`) | waiting for 10:00 UTC, under $0.10 |
| P0 | `R85` raw-record arm (`43189470917`, `798133ff`) | waiting for 10:00 UTC, about $1.06 |
| P0 | read both: `r86_readback.py`, `r85_readback.py` (self-tests 12/12 and 15/15) | ~12:00 UTC |
| P1 | the abstraction arm re-run under whatever `R86` names, so `R85` has a same-window comparator | blocked on `R86` |
| P1 | second domain (`airline`) pooled with retail: n=114 at ±8.8pp | tool built and smoke-tested (`pnpm eval:l4-pool`), dispatched after `R85` |
| P2 | in-episode arm (Appendix O): the store written after each failed trial | designed (§17.127), not built |
| P2 | `R55.1` (`packMode: prefix`, `minEvidence: 3`) | still blocked: no item at support 3 exists |

**What each outcome buys.** If `R86` names the ceiling, the fix is one constant and the abstraction arm
can be re-run cheaply — which is the comparison that actually decides whether the raw arm is better or
merely different. If it names the provider, the ceiling and the form are innocent and the next month
goes to backoff and concurrency rather than to prompts. If `R85` clears 12% coverage with records in
the store, the two preprints' finding transfers to this corpus and the object is settled in one
dispatch; if it does not, the constraint was never the object and the next registration is about the
retrieval function.

### Where the flywheel stands, and what is left: the store was destroying its own treatment

R58 and R85 both came back with a store that could not serve what it had learned, and reading them
together moved the diagnosis from "the abstraction is bad" to "the machinery removes the treatment
before the agent reads it". This is the position and the queue behind it.

**The position, as of 2026-11-12 13:00 UTC.**

| | state | evidence |
|---|---|---|
| record unit (`raw`) | built, cheap, correct | R85: 12 records, **0 model calls**, all `exemplar` |
| ceiling | measured, fixed, per domain | retail max 1532 → 2000; airline max 3129 → needs 4000 |
| contradiction rule | **fixed** — events no longer refute each other | `isEventKind`, claim path tested beside it |
| admission for events | still a claim model | R85: `active 1 / candidate 11`, confidence 0.6165 vs a 0.6 bar |
| scope | one constant (`tau2.act`) for every record | unchanged, recorded as the next candidate variable |
| in-episode write | property built (watermark), seam missing | `EvidenceRef.attempt`, `RecallQuery.before`, `visibleFrom` |
| pack capacity | **measured** — 810 chars of statement at 1,200, 390 for the wrapper | `maxStatementChars`, `rawLogItemShape` |
| pack refusals | **counted** — `droppedForSize`, `emptiedBySize` | `tau2-pack.ts`, artefact `pack` |
| ceiling vs budget | checked when both are registered | `prereg-pack.ts`, `packBudget` header |
| R88 | **read** — `ABANDONED`: admission held (12/12), ceiling half-held (2/12 clipped), reach 9.09%, `pass^4 0.5614` | `r88_readback.py`, run `43223040283` |
| the fifth layer | **found** — the guard replaces ten-digit ids (`[phone]`), 46 of 128 entity values | `tau2-redaction.ts`, `census.redacted` |
| R89 | **read** — `ABANDONED` on the mechanism, PASS on the outcome: `pass^4 0.7018` (+12.68pp), coverage 25.00%, and `droppedForSize 1,596` at `meanIds 1` | `r89_readback.py`, run `43250414145` |
| R90 | **read** — `ABANDONED` on the design, PASS on the signature and the outcome: `kept 171 of 172` (99.42%), one redacted, `pass^4 0.6316` (+5.66pp over 0.575, −7.02pp against R89 with overlapping intervals) | `r90_readback.py`, run `43273198959` |
| the store itself | **found** — it is a draw. R89 wrote 12 corrections, R90 wrote 15 from the same 57 tasks at the same one trial: 8 ids shared, 7 only in R90, 4 only in R89. Every comparison but R88→R89 was two variables | `tau2-pin.ts`, `eval/pins/r90-retail.json` |
| R91 | registered — same store, same pack, no learn half | the instrument: four refutations, all about determinism rather than about memory |

**The queue, in dependency order.** Nothing below starts before the reading above it settles.

| pri | step | why it is next | cost |
|---|---|---|---|
| ~~P0~~ | ~~read R88~~ | **delivered** — admission `12/12` (the repair held), ceiling `2 of 12` clipped (half-held), reach `9.09%`, and the writer acquitted by reconstruction: `128 of 128` kept | $0 |
| ~~P0~~ | ~~decide what the guard may keep, then register the arm~~ **delivered** — the exemption is scoped to the phone rule and to a bare digit run under a reference key; 127 of 128 kept, the address still redacted; R90 dispatched | the store hands the model `[phone]` where the answer's identity was: 46 of R88's 128 entity values, and every τ² retail product id is ten digits. A policy question (what may a memory persist) that no ceiling or pack work can move | $0 to decide, ~$1.10 to measure |
| ~~P0~~ | ~~paired degradation rate~~ | **delivered** — `degradationOfPair` on every pair, `transferSummary` reused rather than re-derived | $0 |
| ~~P1~~ | ~~pack budget as a variable~~ | **delivered as a measurement**: `maxStatementChars` (810 at 1,200 / 2,010 at 2,400), `pack.{budget,capacity,droppedForSize,emptiedBySize}`, `packBudget` as a header | $0 |
| **P0** | ~~dispatch `R89-pack-carries-what-it-wrote`~~ **dispatched 15:40 UTC (run `43250414145`)** | the pair R88 shipped is 2,000 characters into a 1,200-character pack; capacity is 810, `41.2%` of retail is above it, and every record dropped for size read as "nothing relevant" | ~$1.10 |
| **P0** | ~~a pack that carries two records~~ **reordered to R92** | the cell is unchanged — 4,800 characters, or 700 at 2,400 — but it cannot be priced yet: R90 showed the *store* moves between runs (12 corrections then 15, 8 ids shared), so a pack cell measured against a fresh draw is two variables again | ~$1.10 |
| **P0** | **R91 — freeze the store, then measure nothing but the draw** | the instrument, and the only P0 that is not an experiment about memory. `eval/pins/r90-retail.json` holds R90's fifteen failures; `tau2-pin.ts` prices them against the pinned corpus and `pinnedLearn` returns the same shape as the run branch. Same store, same pack, no learn half: its `pass^4` becomes the lane's first estimate of the evaluation draw's own spread, and every later delta is read against it | ~$1.05, 57 episodes fewer |
| **P1** | a (700 / 2,400) cell at the pinned store (now R93) | R91→R92 prices the pack, R91→R93 prices the ceiling; both need the store held fixed, which is why neither could be registered before R91 | ~$1.05 |
| **P0** | ~~114-task L4 run~~ **split into two, and the cheap one comes first** | ALTK's held-out 67.5% is on τ²'s **40 test tasks** and its submission 67.54% on the **114 base** (74 of which taught it). This lane's own cut made both unavailable. R92 runs the benchmark's 74/40 at ~$1.00 — the first comparable held-out delta; the 114 base run is R95, ~$2.4, and measures a set that is 65% in-sample | ~$1.00 then ~$2.4 |
| **P0** | **R92 — the benchmark's own halves** | `splitFromOfficial` + `taskSplit: official` + 74/40 caps. The store is rebuilt from the wider half because R90's pin names tasks from the lane's 57, only part of which is inside the 74. First arm whose delta against 0.575 is not cross-split | ~$1.00, 234 episodes |
| **P1** | the caution line (MemTrapBench's AdaptiveMem) | the cheapest test of "does the model trust the memory too much": one sentence in the block, one dispatch. Every framework in that study scored below no-memory, and the fix was an instruction, so the failure is conditioning rather than storage | ~$1.10 |
| **P1** | hard/easy split in the L4 readback | free, and it is the diagnostic that found the negative effect in every study that reports one: gains on easy tasks and losses on hard ones cancel in a mean | $0 |
| **P2** | reconstruction at render (MemHarness) | render what still applies rather than the record, with an explicit `<EMPTY>` refusal; a scoring layer over the existing pack, not a new store. 76.4% -> 70.1% (replay) -> 85.2% (reconstruct) on ALFWorld | 1 dispatch |
| **P1** | insight→run link (WikiTrace) | the layer this store lacks: an insight pointing at its source run, mounted in the pack, so a detail the insight dropped is reachable without a new agent tool | 1 dispatch, feature-flagged |
| **P2** | in-episode arm | the only design that makes accumulation measurable; needs the write endpoint and a serial trial loop, both of which the watermark already presupposes | 1 dispatch, serial |
| **P2** | airline at ceiling 4000 | the per-domain census says 2000 clips 4% of airline records; a transfer arm cannot be run on a ceiling measured on retail | 1 dispatch |
| **P3** | R55.1 (`packMode: prefix`, `minEvidence: 3`) | **blocked**: no item in any store has support 3, so the arm would measure an empty set | blocked |
| **P3** | R87 fault census at size | queued behind R88: two τ² dispatches in one window measure each other's throttling | $0.30 |

**What the queue is ordered by.** Not by cost and not by novelty: by *which reading removes the most
doubt from the next one*. R89 settled the first question — the pack was the constraint, +12.68pp from
one number — and it left the second one sharper than it found it: at 2,400 the pack carries **one**
record and refuses seven candidates per request, so every arm behind it is measuring a store of one.
The guard cell (R90) runs beside it because the two are orthogonal and both are in flight; the pack
that carries two records is next because *one record per recall* is now the binding constraint on
everything the queue exists to compare, and it cannot be worked around by tuning. The benchmark's own
sample is the third P0 and it is not an experiment: it is the sample the competitor used, and until it
exists the 0.7018 is first on this lane's split and unranked on the board — a distinction that has to be
paid for once rather than argued every round. That P0 used to read "the 114-task run" and it is now two
arms, because Appendix T found the competitor publishes two numbers on two sets: **R92** runs τ²'s own
74/40 on **v1.0.1** (~$1.00, 160 held-out episodes) and is the only like-for-like held-out comparison
available; **R95** runs the 114 base (~$2.4) and is comparable to the submission, in which 74 of the 114
taught the model. The release is the axis R92 added to the list rather than a detail of the port: at
v0.2.0 the file naming those halves does not exist, every retail task body is different from v1.0.1's,
and retail's reward moves from `DB+COMMUNICATE` to `DB+NL_ASSERTION` — so a pass^4 from before this round
is historical rather than comparable, and the artefact now carries `benchmark {version, commit}` so the
next reader is not asked to infer it. The two ways to put
two records in a pack are not one treatment: 4,800 characters keeps the long record and adds a second,
while 700 at 2,400 keeps the budget and shortens both, and a lift under one of them is not a lift under
the other.

**The one thing that is not on the list.** Tuning a signal weight, a ceiling, or a threshold before the
store serves more than one item per recall. R85's `pass^4` (0.6842) and R89's (0.7018) both look like
progress, and R85's store was 92% candidates while R89's pack carries one record and drops 1,596 over
228 requests: an outcome number can rise while the mechanism under it is still refusing most of what the
store holds, and a tuning pass on top of that fits the noise of the refusal.

### The queue after R92's readback: three mechanisms, one falsification, and a paired arm (2026-11-13)

**Where the instrument stands.** R92 ran the benchmark's own 74/40 halves on v1.0.1 and read
`pass^4 0.7586` over **29 of 40** tasks. The eleven that left are exactly the eleven carrying an
`nl_assertion`, and the judge that grades those is a `gpt-4.1-2025-04-14` constant this organisation has no
key for (§34.118). The fix is in and the redispatch is in flight. Nothing below starts before that number
is in hand, because every item after it is a delta and a delta needs a baseline measured on the same judge.

**What the redispatch changes about the queue, whichever way it lands.**

| outcome | what it means | what moves |
| --- | --- | --- |
| 40 scored, `pass^4` ≈ 0.70–0.76 | the judge fix read the eleven, and the lane's first quotable row is above the published baseline | R93 (paired) becomes the P0 |
| 40 scored, `pass^4` ≈ 0.55–0.65 | the eleven were the *easy* ones for the model, and the 29-task mean was inflated as the audit predicted | same, and the inflation is itself a finding worth an appendix |
| fewer than 40 scored | the judge answered fewer assertions than asked, or the redirect did not reach the evaluator | the failures block names it; no memory experiment until the denominator is whole |

**The queue, in the order it will be attempted.**

| pri | step | why it is next | cost |
|---|---|---|---|
| **P0** | **R93 — the paired arm on the benchmark's halves** | The only number in this domain that can be a SOTA claim: same corpus, same store, same judge, same 40 tasks, memory vs no memory, with an interval. ALTK's own 67.5 is a baseline row and not an arm, so a paired lift here is evidence no competitor has | ~$2.70 (both arms) |
| **P0** | **R98 — the unrelated control** | The only one of the three literature mechanisms that can *falsify* the competition reading. R22's shuffled control already scored **1.43pp above** the real pack, which is this prediction in miniature; if unrelated items cost the same as relevant ones, the pack's problem is attention, not applicability, and no prompt sentence repairs it | ~$1.40 |
| **P1** | **R97 — ephemerality** | Anti-Persistence's 28.0pp discard-vs-keep contrast is the largest single effect in the four 2026 papers, and no arm in this record has ever told the model the pack is a past experience rather than a fact. One sentence, one variable | ~$1.40 |
| **P1** | **R96 — the applicability sentence** | MemTrapBench's +14.9pp from one instruction. This lane's prior is *negative*: R17 found the permissive clause substitutes for the note rather than adding to it (interaction −2.57pp), and `hardened` already carries a calibration sentence | ~$1.40 |
| **P1** | **R94 — the ceiling at a pinned store** | 700 / 2,400 on one store, read against one pinned question: the pack experiment R91 made possible and R92's rebuild deferred | ~$1.40 |
| **P2** | **R95 — the 114 base split** | Comparable to the competitor's *submission* (67.54 on 114), of which 74 taught the model. A 65%-in-sample number, useful for ranking and not for a claim | ~$2.40 |
| **P2** | **airline at ceiling 4,000** | A transfer arm cannot run on a ceiling measured on retail; the per-domain census says 2,000 clips 4% of airline records | ~$1.40 |

**What is deliberately absent.** No tuning of a signal weight, a ceiling or a threshold until R93 has
priced the paired lift at the store R92 actually builds. R85's `0.6842` and R89's `0.7018` both looked like
progress while the mechanism under them refused most of what the store held; a tuning pass on top of an
unpriced mechanism fits the noise of the refusal.

**The one thing this queue buys that no previous queue could.** Every item above runs on the benchmark's
own halves with a replayed store and a recorded judge. That is the first time a cell in this record can be
compared to a published one without an asterisk about the sample — the asterisk about the backbone stays,
and §34.119 is why it is printed rather than corrected.

### The queue after R93's registration: supply first, and why the order was wrong (2026-11-13)

**What changed since the list above was written.** Three things, and only one of them is a new
experiment.

1. **R93 is in flight**, with the store pinned to R92's fifteen learn failures so that the two legs
   differ in the memory and in nothing else (`eval/pins/r92-retail.json`, `prereg/R93-the-paired-arm.md`).
2. **The artefact can now name the record it served** (R93's instrument half). `servedCensus` carries
   `requests`, `identified`, `distinct`, `meanPerRequest`, `maxPerRequest` and a per-id count, so a
   readback can say which of fifteen records reached a prompt and which never did (§34.121).
3. **`supportTasks` was shown to be one by construction** (§34.122): the dedupe key is the normalized
   statement and one correction produces one statement, so the recurrence axis ALTK's `sup3` rests on
   cannot be populated by any arm this lane can build today. R55.1 was blocked on it and Appendix M
   counted it from the other end.

**The order that changes.** R98 was P0 because it is the only falsification of the competition reading.
It is now P1, and supply is P0, for a reason that is not about novelty: **R22 already ran R98's
mechanism in miniature and the answer was 1.43pp *in favour of the shuffled pack*.** A control arm that
re-measures a known null buys less than an arm that changes the population the store is built from, and
the population is the one column where this project is behind by an order of magnitude — 15 records
against a 292-rule playbook, 20% of the learn half covered.

| pri | step | the single variable | why it is here | cost |
|---|---|---|---|---|
| **P0** | **R93** (in flight) | memory off, same store, same 40 tasks | the only cell on the board nobody has run, and the number every later arm is a delta against | $1.70 |
| **P0** | **R99 — supply** | the population: `distillScope: all`, 15 → ~73 records | ExpeL's own ablation says an insights pool built from a narrow population scores no better than no memory (36.0 vs ReAct 28.0 on a wide one). This is the first arm that can move the score rather than explain it, and it is the cheapest in the queue | $0.70 |
| **P1** | **R98 — the unrelated control** | the content of the served record, at matched length | still the only falsification available; demoted because R22 already ran it in miniature and ExpeL prices the penalty at 16.5pp where this lane measured −1.43pp | $1.40 |
| **P1** | **the floor** | whether a record is served at all (`recallFloor: 0.15`/`0.20`) | R92's retention curve is already committed: 0.20 empties **32.7%** of packs, 0.30 empties **79.6%**. The cheapest applicability test in the lane, and it needs no prompt sentence | $0.70 |
| **P1** | **R97 — ephemerality** | one sentence: the pack is a past experience | Anti-Persistence's 28.0pp, the largest single effect in the four 2026 papers | $1.40 |
| **P2** | **merge by action shape** | `supportTasks`, and the store's size | ALTK `sup3` and ExpeL's `UPVOTE` are the only mechanisms in the literature that make recurrence real; this lane computes the count and cannot raise it | $0.70 + code |
| **P2** | **R94 — the ceiling** | 700 / 2,400 at a pinned store | the pack experiment R91 made possible, now meaningful only after the store stops being the constraint | $1.40 |
| **P2** | **abstraction** | values replaced by typed slots at write | AWM's `{product-name}`; this lane keeps **154 of 156** values verbatim, so the mechanism has never been applied | $0.70 + code |
| **P3** | R95 — the 114 base | the sample | comparable to the competitor's *submission*, 65% in-sample | $2.40 |

**Why supply is not a dose experiment, which is the objection it will meet.** R16 moved items per
question at a fixed store and found the curve flat-or-negative from the first item. R99 moves the store
at a fixed dose: one item per request, 2,400-character budget, unchanged. If supply were the constraint,
the *ranked* item changes; if the unit is the constraint, nothing moves and the line closes the way R15
closed extraction.

**What is still deliberately absent.** Tuning a weight, a ceiling or a threshold. The floor arm is not
tuning: it changes whether a record is served at all, which is a different treatment from how strongly
one is ranked, and its retention curve was committed before the arm existed.

### The queue after R93: the wrapper, then resolution, then the store (2026-11-13)

**What R93 settled and what it opened.** Settled: the memory's effect on the benchmark's own 40 tasks is
**−2.50pp [−17.50, +12.50]**, with 13 trials repaired and 10 broken, and the memory-free arm scores
**0.725** — above the competitor's published 0.675. Opened: the pair differed in the **agent class** as
well as in the pack (§34.123), so "the memory costs 2.5 points" is currently "the memory *or the wrapper*
costs 2.5 points".

| pri | step | the single variable | why it is next | cost |
|---|---|---|---|---|
| ~~P0~~ | ~~**R101 (run `43478128683`)**~~ **done** — 0.700 vs 0.750, −5.00pp, inside the registered band | `microglia_agent` against a facade that serves an **empty pack** | the middle leg of the three-cell decomposition. Without it no retrieval experiment after this one can attribute its delta to the pack (§34.123). 160 episodes and no learn half. **Registered** as `prereg/R101-the-scaffold-arm.md` at **$1.21** for the pair — not the $0.38 this table first said, because the scaffold leg runs the wrapper and the wrapper is the 2.17× being measured | $1.21 |
| **P0** | **R98 — the unrelated control** | the content of the served record at matched length | **promoted by R99**: relevance is now the least likely explanation left. The 73-record pack matched the question a third better at every quantile and lost three tasks, so the next question is whether the content matters at all — if unrelated records cost the same, the pack's problem is **presence** and no retrieval work can fix it | $1.40 + code |
| ~~P0~~ | ~~**R109 — merge by action shape, at the delivery boundary**~~ | — | **DONE (§PROGRESS 186, AUDIT 34.133)**: the fold is a pure function at the render boundary, the host declares the vocabulary and the request declares the unit, and the packed census rides the pack in both modes. **$0 census**: 32 records → 26 units, 0.8285 of the store's characters, support ≥2 five and ≥3 one — and the same five units fit a 2,400-char pack either way, so the fold buys corroboration rather than room. Found on the way: the driver's facade dropped every query pair but `task`/`text`, so `MICROGLIA_PACK_KNOBS` could not change a pack and a prefix arm would have been its own control | $0 |
| ~~P0~~ | ~~**R109a — the shape arm's pair**~~ | — | **DONE (§PROGRESS 187, AUDIT 34.134)**: `shape-pair.ts`, two facades of one dispatch over one store, guarded by a **containment** control (the treatment pack is the control pack minus exactly the items the fold reports removing; cut requests excluded and counted) and four states, the fourth being `NO_TREATMENT` — the fold removed nothing, which is a fact about the store and not about the unit. Dispatchable through a registration's `facadeShapes: two-unit`; refuses the floor pair, the note levels and a declared `TAU_PACK_SHAPE` before any model call. Found three defects, all offline: contrasts computed before the state, the note summary printing a contrast its readback refuses, and a containment equation that compared the control to itself | $0 |
| ~~P0~~ | ~~**R110 — the store records which side a record came from**~~ | — | **DONE (§PROGRESS 188, AUDIT 34.135)**: `KnowledgePolarity` (`repair`/`pass`), derived by `polarityFor` from the event's **signal** rather than its kind, stamped by the distiller (an interpreter's claim is discarded, as the attempt number is), adopted once through a merge and held, carried on the artefact's store sample. The retrospection reader moved out of `bin/` into `retrospect-store.ts` (23 tests, 100/100/100/100) and the refusal now names which of its two causes fired. Deleted a fallback that read **every** τ² record as a success — the population is one `kind` wide and the default covered it entirely — and found that the new field's check against R62's census is an identity, so the check is published as an inequality plus a count instead of as agreement | $0 |
| ~~P0~~ | ~~**R104 — the unit arm**~~ | — | **DONE, and it measured (§PROGRESS 191)**: run `43589735959`, 40 tasks × 4 trials, `pass^4 0.550` against the published bar 0.575 and the ALTK submission 0.6754. The arm is red because the gate asks for the bar **plus five points**. What the artefact says about the store is the finding: **the model answered 10 of 73 corrections** (63 replies were blank), the rule fallback was invoked 63 times and produced **no claim**, and the six stored items were served whole — 5 of 6 — to all 164 requests. Seven instrument defects fixed on the way (AUDIT 34.142–34.146), the seventh being the distiller's thinking regime: the client sent no parameter and a comment asserted the lane 'never thinks', so the endpoint's default was in force for 73 calls and no artefact recorded the tokens. Paired against its own second facade, which received the same store and the same pack, the dispatch reads **+17.50pp on no treatment at all** | $1.21 spent |
| ~~P0~~ | ~~**R112 — the writer grid**~~ | — | **DONE, and it refuted its own axis (§PROGRESS 193)**: run `43621097332`, 8 calls, 6,187 tokens, **$0.002**. 8 of 8 candidates `answered`, `errors 0`, `reasoningTokens 0` on every call. `lesson` writes **2** conditioned claims where `repair`, `procedure` and `lexicon` each write **1**, on both models — so the form the lane already runs is the best of the four and `procedure`'s 'never been run' hint is dead on its first measurement. **The writer is not the variable**: model and form are both excluded as explanations for R104's 63 blanks. The fixture's prompt is 533–731 tokens against a population prompt that also carries `attempt` and `expected`, so this grid cannot speak about the arm's own corrections — R111's limit, restated by its own instrument | $0.002 spent |
| ~~P0~~ | ~~**R115 — every dispatch carries its own control**~~ | — | **ALL THREE PIECES BUILT (§PROGRESS 196, 197).** (a) `armsAgainstRegistration` compares a header's arms with what a dispatch buys **in both directions** — the one-directional reading was R72's defect, where a dispatch bought an arm its file never named. (b) `effectClaimPp` refuses a registration claiming an effect its sample could not resolve, **and** one claiming an effect with a single arm. (c) **the readback prints the interval**: `pass4 55.00% ±15.42pp` on both facades, `(no tasks scored)` where there is no sample, and `scoreHalfWidthPp` is the ruler — 15.42pp for an absolute score at 40 tasks against 44.30pp for a paired delta at the same n. What remains is not machinery but arithmetic: a two-arm dispatch at 68 tasks is 544 episodes and ~10 hours against a 340-minute ceiling, so this lane cannot carry a control *and* a usable sample in one window | — |
| ~~P0~~ | ~~**R119 — the regime, paid for**~~ | — | **DONE, and it refuted its own question (§PROGRESS 198)**: run `43645602812`, $0.92 for the evaluation half, gate red. `pass^4` **0.600** against a bar its file says needs **0.75** at n=40 — inside the band the file had already named unresolvable. The store grew 6 → **80** (79 servable), `coverage.medianAllPairs` **4.76% → 11.76%**, `zeroPairs` **195/820 → 0/631**, and none of it moved the score beyond ±15.18pp. **A census moved 2.5× and a score did not**, which kills "retrieval coverage is the constraint". `faithfulness.kept` **0 of 667** for the second run, deterministic. **Two numbers in the same file disagreed** — `fold.atLeastTwo 0` against `merge.support.atLeastTwo 10` — and the fold's key had never had an input at all | $0.92 spent |
| ~~P0~~ | ~~**R121 — the recurrence pass on the claims unit**~~ | — | **DONE, and all three censuses refuted (§PROGRESS 203, AUDIT 34.153)**: run `43688056849`, one evaluation serving **both legs** for **$0.95**. `merged 0` and `crossTaskGroups 0` at the operating threshold 0.60, `retained 79` against a bar of 55, redundancy **28.1%** against 15%. The cause is one string: the pass filters pairs by `scopeKey`, which includes the distiller's free-text `intent` — the store's 64 items fall into **60** buckets, so **4 of 2,016 pairs** were ever tested, and R119 had already disqualified that string as a key. The sweep says one of the four merges cross-task at 0.40, one rung below the floor. And `merge.support.atLeastTwo 12` counts **routines taught twice**, not claims written twice: `supportTasks` is 1 on 79 of 79. The contrast is the best this record has: **141/160 episodes against 133/160**, +5.00pp of rate against +15.00pp of headline, 9 tasks improved and 4 harmed, p = 0.2668 | $0.95 spent |
| ~~P0~~ | ~~**R124 — the pass keyed on the routine, not on the sentence**~~ | — | **DONE, and the mechanism held while the score moved for no reason (§PROGRESS 208, AUDIT 34.157)**: run `43705196364`, **$1.53** (learn 0.193 + memory 0.951 + reference 0.385), 162 min, job red on two gates that refuse a claim rather than report a defect. All four criteria held — `merged 4` across `3` groups, `crossTaskGroups 3`, **`support ≥2` 0→2**, `max 1→3` — so `sup2` is no longer zero, which was the cell ALTK wins. The population missed by 2.7–4.8×: **2,415 pairs** where the registration said 500–900 (1,276 kind, 1,104 scope, 29 overlapping). And the headline moved **0.7500 → 0.6750 with `episode_rate` at 0.8812 in both runs**, the third and cleanest refutation of `pass^4` as a comparison — the mechanism between them was a merge of four items. Paired `+10.00pp [-7.50, 27.50] p=0.4240` against a **26.21pp** minimum detectable difference: the instrument refused, correctly, and named the real constraint | $1.53 spent |
| ~~P0~~ | ~~**R120 — the fold's key**~~ | — | **DONE, and the mechanism works while the counter could not say so (§PROGRESS 200, AUDIT 34.150)**: run `43665852454`, **$0.93 for both units in one pass** (the two-unit machinery serves two arms inside one 160-episode evaluation, halving the reserved $2.07). The join is repaired: `unnamed` **650 → 0**, `shapeCarried: true`, and the collapse arm **removed 58 items across 162 packs** — R109's fold fired for the first time on a distilled store. The registered claim (`fold.groups` non-empty) **could not have been met on the arm it named**, because `groups` counts folded groups and the arm does not fold: the field is a function of the mode, not of the store, and `suppressed` now counts what the unit withheld. Two predictions refuted with the mechanism understood: `items/req` and `chars/req` **rose** (4.012→4.025, 2187→2189) because `makePack` refills to budget behind the fold, so a delivery-side fold is a **substitution**, and its containment control could be computed on **0 requests**. Score `0.7500`, interval [0.598, 0.902] — and the same lane measured **0.6000** four days earlier at **140/160 episodes against 141/160** | $0.93 spent |
| ~~P0~~ | ~~**the metric's second denominator**~~ | — | **DONE (§PROGRESS 200, AUDIT 34.151)**: R119→R120 is **140 against 141 episodes of 160** and **0.6000 against 0.7500** in the headline, because `pass^4` is one exactly when four trials passed — `p⁴` over 40 tasks, SE 7.7pp, against `p` over 160 episodes, SE 2.6pp. The record had been ranking the tail. `arm-rate.ts` computes rate, half-width, `rate⁴` and the flip table from the artefact; `pnpm eval:pack-repeat` prints all of them, so a headline above `rate⁴` is now a **finding** (the misses clustered) rather than a result. No earlier verdict is reinterpreted: every arm was measured the same way, which is why they remain comparable to each other and not to a 114-task row | — |
| **P0** | **R122 — written by a form that was told not to name the case** (reframed §PROGRESS 207, AUDIT 34.156) | what a **value-bearing** form costs, now that the four zeros are attributed to the form rather than to the writer | `faithfulness.kept` is **1 of 667** on R120, **0 of 667** on R119 and R121, and the guard replaced **9** — identical to the digit on four dispatches, from a field reported every round and never attacked. It is not a writer defect: the `lesson` prompt says a statement "is a rule, not a report of the case that taught it" and a restatement "must not be returned", `lexicon` forbids the values outright and `procedure` forbids naming a table or a column. **A lesson-form store cannot be faithful by construction**, so the census was measuring the question. The rate now carries the form it was measured under, and R122's question becomes the one the record can act on: what does a form that *permits* the case cost? The record already holds the other direction — on BIRD, packs that name an entity cost **2.6pp** while packs that name nothing are ignored and cost nothing — so this is a treatment with a known price rather than a bug with a known fix | ~$1.10 |
| **P0** | **R120a — where the fold belongs** | a fold the packer refills behind changes *which* knowledge is served, never *how much* | R120 measured it: 58 items folded out and `items/req` **rose** 4.012→4.025, because `buildPack` folds the selection and `makePack` renders it under a character budget, so a line saved is a line spent. The containment control that was built to verify a removal reported `0 request(s)`. Two placements are admissible and they are different experiments: fold **before** selection (the fold reduces the candidate population, the packer then chooses from survivors) or fold **after** render (the unit shrinks and the pack under-fills). The first is the one AWM's workflow unit implies; the second is the one R109's decision table described without noticing. Registered as one variable either way, with `ledgerDiff` as its readback | ~$2.07 |
| ~~P0~~ | ~~**R123 — the rung the ladder chose**~~ (**read back**, `43801571591`) | whether a pack that withholds a contested ranking beats one that serves it | **REFUTED (§PROGRESS 213, AUDIT 34.161): the gate cost 15pp of `pass^4`.** memory **0.625** vs reference **0.650** (rate 0.8625 vs 0.8875, paired −2.50pp [−22.50, +17.50], MDE 28.88pp) and the job **failed `l4-pass4`** — 0.625 against the 0.725 bar. The wiring was exact: the realised ladder priced 0.05 at **53** and the gate withheld **53 of 162**. Harm share **56.7%** [39.2, 72.6] against 29.6% and 31.2% ungated — indistinguishable from the literature's 52%, where the ungated runs were not. **A margin measures ambiguity, not harm**: a confidently served wrong item has a large margin and is never withheld. Kept as a cost knob (32.7% of packs removed, eval $0.7716 vs R123a's $0.9653 whole run); **not** as a treatment. Four instrument failures found and repaired — see R131 | ~$0.77 |
| ~~P0~~ | ~~**R131 — the instruments, on the arm that already knows its answer**~~ (**read back**, `43844943012`) | whether this lane can *read* a run it already knows how to buy | R123a's arm exactly — same store, same split, same 160 episodes, **no gate** — dispatched against four repaired writers: `tau2.memory`, `episodeStarts` as a real boundary, `tau2.turnCensus`, and a control arm that has never carried a `tau2` block at all. **The serve split is its own self-check**: with nothing withheld, the served bucket must reproduce the arm's `episode_rate` to the last digit — a split that disagrees has mis-assigned requests. Registered predictions: all four fields present on **both** arms; `attribution` names ≥1 item with a negative net over ≥2 episodes (R128's criterion, never met); the turn census pairs with `toolErrors` non-null on both sides; **READ BACK**: the serve split reproduced the arm rate **to the digit** (134 of 160 = 83.75% against 0.8375), the ladder priced 0.05 at **60 of 160**, and the attribution table named **6 items with net < 0** (worst −4 over 18 episodes). The `memory` block is present on the memory arm (census 160, `episodeStarts` `[0..159]`, `recallRepeats` 0, margins 0.66/7.20/22.99%) and **cannot** be present on the reference arm, which is `llm_agent` with no store — the registration's "both arms" was written from convenience (`§PROGRESS 215`). **The harm share did not replicate: 55.17% [37.6, 71.6] on the configuration that read 29.63% and 31.25%**, and `pass^4` read 0.625 where R123a read 0.775 — a **15pp** spread on one arm, which retires the single-point ranking (`§COMPETITIVE AU`, `§AUDIT 34.163`). Job red on `l4-pass4 0.625 < 0.725`: correct failure | ~$0.97 |
| ~~P1~~ | ~~**R132 — the store on its own cases**~~ (**read back**, `43848545387`) | whether this store's 30% harm share comes from *wrong* items or from *misapplied* ones | Replay the 74 learn-half tasks with the store on. The learn half already knows which failed and distils one claim from each, so this is the only reading that asks whether an item repairs the case it was written from. `repairRate = repaired / (repaired + inert)` over the cases that failed without memory, and `harmShare = broke / (repaired + broke)` over the outcomes it changed — both denominators named, both rates omitted rather than zeroed when the denominator is empty. **Predictions it will be graded on**: if ≥50% of the failed cases are repaired, the items are right and misapplied and the next fix is conditioning; ≤20% and the items are inert and the next fix is the distiller. **Wired**: its own facade with no collector behind it, the graded facade's floor/note/unit carried on `FacadeEvaluation`, one trial and `bestRewards` on both sides, no query pin. The block carries `tasks`/`requests`/`served` beside the four cells, because an empty pack and an inert item produce identical cells (AUDIT 34.162). **READ BACK**: 74 of 74 replayed, 74 of 74 served, **5 repaired / 9 inert of the 14 that failed without memory (35.71%)**, 3 broken / 57 kept, own-case harm share **37.50%** — all five predictions held. The four cells are nevertheless **a tautology in one direction**: `inert` divides by the draw that selected the cases, so task difficulty is indistinguishable from an inert item (`§AUDIT 34.164`). That is what R133 buys. Labelling hazard recorded: at `trials: 2` the artefact publishes `pass4: 0.825` with `k: 2` | ~$0.45 |
| ~~P1~~ | ~~**The dispatch pool — one arm, several dispatches**~~ (**built and read**, `eval:dispatch-pool`) | which of this record's numbers was ever an estimate | A random-effects pool (τ² truncated at zero) over an arm's per-dispatch artefacts, with I² for the share of the spread that lives between dispatches and t(dispatches−1) when it does. **Read**: `pass^4` 0.723 [0.531, 0.915] at I²=16% (the 15pp spread was sampling), harm share 38.35% [3.85, 72.86] at **I²=60%** (the dispatches genuinely disagree — the quantity Appendix AS promoted is retracted), episode rate 84.73% [80.77, 88.69] at **I²=0** (the first ±4pp interval this record has). Practice rule: nothing is quoted from one dispatch, nothing compared across arms until I² < 50%. 11 tests, 100% on all four dimensions | $0 |
| ~~P0~~ | ~~**R136 — the boundary and the carriage**~~ (**read back**, `44043927600`; §PROGRESS 221, §TECH-DESIGN 17.142, §AUDIT 34.174) | make the ledger joinable and the carriage visible, so the conditioning row can be entered and the 410-token remainder stops being a remainder | three instruments and no treatment: (1) each boundary records the task it opened for, from the query text the agent already holds, so a retried task's second boundary is visible and the ledger joins by identity rather than by position; (2) `_injected_chars` records the injected message's own length at the point of injection, which closes the gap between a 725-character pack and a 559-token system delta; (3) the residual stays defined against the prompt (AUDIT 34.172). **Criteria fixed before the number**: `pack.requests == per_task.length` (the arm's own boundary count against the scorer's row count, exactly resolvable), and `injected_chars / system_delta` reported as a share. **Decision rule**: if the carriage is the renderer's, R137 shrinks the render; if the system delta survives at ~149 tokens, the premium is the prompt's own length and the answer is a cacheable prefix | ~$0.32 |
| ~~P0~~ | ~~**R137 — one block a call**~~ (**read back**, `44106251734`; §PROGRESS 222–223, §TECH-DESIGN 17.143–17.144, §AUDIT 34.175–34.176) | whether the memory's cost and its harm were the block sitting in the prompt five times, which is what R136's carriage actually measured | **The readback, before the repair**: 40 boundaries for 40 tasks with **1 unresolved** (the join works), **−5.00pp [−15.00, +5.00]** at p=0.6250 with 1 repaired and 3 broken, and **$0.2033 against $0.0923** — 2.20×. The census reported **410** packed calls at **11,105.9** characters of system, **705.1** injected, **10,400.8** of carriage. The control arm solves the policy prompt at ~6,600 characters, so 11,105.9 − 6,614 − 705.1 leaves **3,787 characters = 5.4 copies** of the block, and an episode of ~10 calls averages (1+10)/2 = 5.5. τ² threads the state the agent returns, so the wrapper's copy *was* the object the next turn appended to. **Repair**: the injection drops every copy the agent itself wrote, identified by the rendered element, and appends one — the policy prompt survives, a stale block from another episode is replaced. **Instruments**: `memory.packCopiesDropped` (`calls − boundaries` when sound), `cache.pack_copies_per_packed_call`, `cache.packed_calls_with_copies`. **Criteria**: 1.00 copies, 0 calls with copies, ≈7,320 characters a packed call (−34%), `uncached_tokens_per_call` falling from 1,542.4 toward 500, cost below 1.5× the control. **Decision rule**: copies 1.0 with cost under 1.5× and a falling harm share buys the block itself; cost unchanged buys the turn; copies still above 1.0 sends the dollar at the fixture | **Read back**: every instrument criterion hit — copies **5.40 → 1.00**, calls with copies **369 → 0 of 428**, `system_chars_per_packed_call` **11,105.9 → 7,793.9**, `uncached_tokens_per_call` **1,542.4 → 431.5**, cost **$0.2033 → $0.0996** (−51%), premium over the control **+1,128.8 → +8.9** a call. The carriage is the policy prompt (7,056 characters) and nothing else. Pair: memory **0.900** against the control's **0.825**, **+7.50pp [−5.00, +20.00]**, 5 repaired and 2 broken (harm 6.06% against 8.11%). The score is not attributable to the fix — different store draw, different abandoned attempts — but the carriage, the copies, the cache and the bill are. **Cost $0.0996 against a $0.32 forecast** | ~$0.32 |
| ~~P0~~ | ~~**R138 — the two broken trials, named**~~ (**read back**, $0.00 — runs on R137's artefacts; §PROGRESS 224, §TECH-DESIGN 17.145, §AUDIT 34.177) | which items broke the two trials the memory broke, and whether a quarantine of net-negative items would have kept the five repairs | R137 left a clean carriage and a refused split: **42 boundaries for 40 trials, two unresolved**, because τ² re-ran two simulations whose first attempt died and the abandoned attempts opened boundaries no trial owns. Two instruments: (1) make an abandoned attempt **visible as an attempt** — the agent already records a boundary ordinal and the runner already knows how many simulations it scored, so a boundary beyond the scored population is named `abandoned` rather than `unresolved`, and `serveSplit` proceeds over the 40 named groups while reporting the requests it dropped; (2) `itemTransfer` over R137's own pair, reading `kept`/`broke`/`net` per id on a carriage that no longer repeats the block. **Criteria**: the split measures (not refuses) on all 40 trials, its dropped-request count equals the abandoned groups' request count, and the net-negative items account for the two broken trials or the mechanism is refused. **Decision rule**: if the two broken trials are attributable to ≤3 items, R129's outcome counter is bought as a quarantine with a predicted repair of those two; if they are spread over more, the content is not the lever and the next dollar goes at the keying | **Read back**: the join is repaired (`namedLedgerOf` drops the two rows an abandoned attempt opened, by their own boundary's name, and reports them), and the census reads **19 of 64 items served over 40 item-requests, 2 negative at −1 each, 4 positive at +5, 45 never served**, with the sum exact because no request carried a second item. **The two negatives are the two broken trials** — one served **once** and failed its only case, one served **ten times with eight passes**. So R129's quarantine is **refused on evidence**: it would delete an item on n=1, or trade eight passes for two failures. The counter is not the missing piece, **recurrence** is — the same cardinality as `sup2` 2 of 66 and 41 labels over 57 items. The write-side precondition is the category cut (≤12 kinds over ≥57 corrections), not the field. **Cost $0.00** | $0 (R137's artefacts) |
| ~~P0~~ | ~~**R139 — the key was a filter**~~ (**read back**, `44141846982`; §PROGRESS 225 and 227, §TECH-DESIGN 17.146, §AUDIT 34.178) | whether `sup2 2 of 66` is a property of the store or of the pass's linkage key — which R138's category cut assumed without checking | R138 refused R129's outcome counter because items do not recur. Checked against R137's own store instead of assumed: **64 statements hold 43 distinct claims** (keyless closure at 0.60, largest **9**), the pass merged **one**, and **34 of the 35** joined pairs are filed under different keys — which a pass keyed on the routine never compares. So the counter's precondition is not a coarser item but a key that stops removing pairs. The change is one option (`linkage: 'key' | 'all'`) plus one counter: `skippedKey`, the pairs the key removed *after* every other test admitted them, with the refusal counters gated so no artefact from R121 to R138 is reinterpreted, and the redundancy census carrying the same split so one artefact states both what the store knows and what a keyed pass can reach. **Criteria**: the arm reports `skippedKey 0` and `linkage: 'all'`; `merged` 8–21 and `retained` 49–62 from two independent ceilings (`atLeastTwo 12`; 21 restatements of 64); `supportAfter[2] ≥ 8`, `maxSupportAfter` 5–9; every group's `weakestPair ≥ 0.60` by construction. **Decision rule**: `sup2 ≥ 8` and the harm share falls → the outcome counter (R129) is finally identifiable; `sup2 ≥ 8` and flat → the item count is the variable; `groups < 8` with `skippedKey 0` → the write-side axis closes as a finding and the next dollar is the claim floor | **Read back**: `skippedKey 0`; **`groups 11`** (8–21), **`merged 15`**, **`retained 55`** (49–62), `supportAfter {1: 44, 2: 8, 3: 2, 4: 1}` so **`supportAfter[2] = 8`** (≥ 8) — but **`maxSupportAfter 4`** against a predicted 5–9 is **falsified**: nine copies of one sentence in the text are four wordings the 0.60 containment floor admits and five it does not, so `sup2` is a floor on the consensus rather than an estimate of it. Score 82.50% against the control's 80.00%, **+2.50pp [−15.00, +17.50]**, p = 1.0000, 6 repaired and **5 broken**, harm share **15.63%** (R137: 6.06%); $0.0958 against $0.0962, so the premium is gone. Per item: **19 of the 21 served items had support 1**, and all three net-negative items were singletons — as were three of the four positive ones. Six of seven predictions held; the round buys the population an outcome counter needs, not an effect | **$0.20** |

| ~~P0~~ | ~~**R140 — the abandoned attempt is a drop**~~ (**done**, $0.00; §PROGRESS 226, §TECH-DESIGN 17.147, §AUDIT 34.179) | whether R138's lost gate comparison was irreducible, or a conservative join that had a third option | R138's arm took 42 requests for 40 trials because τ² re-ran two simulations whose first attempt died, and `serveSplit` refused the whole reading. The two reasons a boundary resolves to no trial are distinguishable: a **null** name is an attempt the harness abandoned (drop it and its requests), a name the arm **never scored** is a mislabelled artefact (still refused). The drop is gated on coverage — every scored trial must still be opened by a surviving boundary, else `trial-uncovered` — and the dropped request count is carried, counted from spans rather than from the ledger's excess so a retried task cannot be mistaken for an abandoned one. **Read back** on R137's pair: `served 36 of 40 = 90.00% [76.9, 96.0]; withheld none measured; 2 request(s) belonged to abandoned attempt(s) and are in neither rate` — the split measures for the first time on that arm, and its empty withheld bucket is R123's finding repeated (`served 162 of 162`), which is why this is an instrument and not an arm | $0 (R137's artefacts) |
| ~~P0~~ | ~~**R141 — the floor at serve time**~~ (**read back**, `44162747993`; §PROGRESS 229, §TECH-DESIGN 17.148, §AUDIT 34.180–34.181 — **the harm share fell 15.63% → 3.03% and the mean turned positive, both unresolved at n = 40**); §PROGRESS 228, §TECH-DESIGN 17.148, §AUDIT 34.180) | whether the store's consensus is what separates a harmful served item from a helpful one — and whether serving it is a treatment at all | R139 left 11 corroborated items in a 55-item store and served 21 distinct items over 40 requests, 19 of them singletons. A merge is a label; `retireBelowSupport` is the act: retire, after the pass and **before** the funnel gate, every live item fewer than `floor` distinct tasks stand behind, as a `statusReason` rather than a filter in another process. Support is counted the way the score counts it, including the `run:<runId>` fallback the trace unit needs. **Criteria**: `retired` 40–46 and `retained` 9–13 from `supportAfter[1] = 44`; the three net-negative items gone from the served set; `serveSplit.served` falling to at most 13, because the served population becomes the floor's `retained`; the mean **flat or worse**, because on this arm the floor removes −3 and +3 in equal measure — the reading to grade is the harm share and the `broke` column. **Refutation**: `broke` flat while `retained` is in band → corroboration is not what separates harm from gain and the next axis is the content of the served claim | ~$0.20 |
| **P0** | **R142 — the other cut** (**registered and dispatched**; `prereg/R142-the-other-cut.md`, §PROGRESS 229, §TECH-DESIGN 17.149, §AUDIT 34.181) | whether R141's harm-share collapse reproduces on a held-out population the arm never used | R141's floor retired 50 of 83 items, served 41 renders from 14 records, and moved the pair from `+2.50pp` to `+10.00pp` while the harm share fell **15.63% → 3.03%** — at n = 40, which resolves 17.16pp. The same treatment on the lane's own 0.5 cut of all 114 retail tasks (57 learn / 57 held out) buys a second population, a different held-out set, and the first dispatch in which `serve support` exists at the head the workflow checks out. `trainShare` is a registration header from this round, because the cut was a repository variable. **Criteria**: `retired` 30–42, `retained` 8–14; every served item `support ≥ 2`; harm share below 5% (1 in 47 separates from R139's 5 in 32 at p ≈ 0.04); the delta registered as a direction with its bound printed, since n = 57 resolves ~14.4pp. **Refutation**: `retired` < 25 (the learn half was too thin), a served singleton, harm share ≥ 10% (corroboration is not the separator and the axis is content), or a significantly negative delta | ~$0.30 |
| ~~P0~~ | ~~**R135 — the coverage ledger**~~ (**read back**, `44019972203`) | where the 2.25× per-episode premium actually is, and whether a rung could ever have separated R134's four harmed requests from its two repaired ones | R134's arm with **no treatment change** and three instruments: `pack.margins.perRequest` (the margin of every request, in arrival order, `null` where no decision was carried, aligned by position with `pack.ledger` and `per_task`), `usage.cache.system_tokens_per_call` / `conversation_tokens_per_call` (the split the Python half has computed since the census was written and no field ever read), and `residual_tokens_per_call` beside `tools_tokens_per_call` (the tools block and the chat template, which no message carries). **Criteria fixed before the number**: `perRequest.length == ledger.length == per_task.length == 40` and no pack block on the reference arm (wiring, exactly resolvable); the split present in both arms; the residual reported for both. **Decision rule**: premium in `system` + harm at low margin → the renderer and a rung at the measured crossover; premium in `conversation` + harm spread → the write side; premium in `residual` → the request's carriage, and every bill this lane published is over-attributed by that amount. **READ BACK**: memory **34 of 40** against the reference's **34 of 40** = **0.00pp [−15.00, +12.50]**, p=1.0000, 4 repaired / 4 broken (with R134's −5.00pp the arm now brackets zero across two draws); 2.23× per episode ($0.00554 vs $0.00248). **The premium is two things of equal size**: prompt **+675.7** a call (system **+559.3**, conversation **+26.7**, tools **+5.5**, framing **+0.5**) and cache credit **−558.3**. The served text is 725 characters ≈149 tokens, so **~410 tokens a call are carriage the renderer adds** — 33% of the premium, isolated by no field. The join refused: **41 boundaries for 40 scored episodes** (one task simulated twice), so no per-item net exists (AUDIT 34.173); and `residual` was redefined because as shipped it inherited the whole premium by construction (AUDIT 34.172) | $0.3207 |
| ~~P0~~ | ~~**R134 — one script instead of four**~~ (**read back**, `43974181202`) | whether four unrelated single-episode scripts, not the items themselves, are what the store does to the prompt | R133's arm with `packLimit: 1` and nothing else changed: the same store, floor, budget and split, serving the most relevant item instead of all that fit (R133 served **3.975 items / 2,239 of 2,400 characters** and dropped **161 for size over 40 requests**; 62 of the 64 listed items carry `supportTasks: 1`). `packLimit` is a new header because a character budget leaves the count to how long the distiller wrote its records. **Criteria fixed before the number**: `pack.summary.meanIds == 1.0` and `pack.empty == 0` (else the header never reached the query and the arm is R133 rerun); `cache_hit_rate > 0.83` and a per-episode cost ≥30% below $0.00655; paired `harmShare < 0.185` on the 40 held out. **Decision rule**: harm falls + cost falls → the item (abstraction over a class, R129 as its admission); harm flat + cost falls → the write side; repair collapses + harm falls → coverage. No score claim is made: 40 tasks cannot resolve 5pp. **READ BACK**: three of five criteria held, two failed — `meanIds` **1.0** and `droppedForSize` **0** (the count reached the query), paired `harmShare` **10.81%** (4 of 37) ✔; `cache_hit_rate` **0.6941** against >0.83 ✘ and **$0.00546** an episode (−16.0%) against a registered −30% ✘. Memory **35 of 40** vs reference **37 of 40** = **−5.00pp [−17.50, +7.50]**, p=0.6875, 2 repaired / 4 broken; the store's own repair collapsed from 9 of 74 to **2 of 40**. The pack shrank two thirds and the multiple went **2.43× → 2.25×**, so AUDIT 34.166's mechanism is refuted (AUDIT 34.169) and both arms' 147.5%/226.4% `prefix_coverage` were being read as 'honoured' (AUDIT 34.170) | $0.3152 |
| ~~P0~~ | ~~**R133 — the replay's own denominator**~~ (**read back**, `43880380623`) | whether the store changes its own cases at all, once task difficulty is held fixed | A third pass over the same 74 tasks with the store **off**: `llm_agent`, no facade, one trial, the same reduction. `repaired`/`broke` against that control are discordant pairs between two phases that differ only in the store, so `net = repaired − broke` is the store's own-case effect. **Decision rule fixed before the number**: `net ≥ +2` → conditioning (trigger, margin ladder, floor); `−2 < net < +2` → reachability (pack, scope, render before distiller); `net ≤ −2` → the write side (R129, admission, a verifier). The control carries no `requests`/`served` (it has no facade), is refused without a rehearsal, and is counted in the reader's sizing (`trials x testTasks + 3 x trainTasks`). **READ BACK**: all four criteria held — both replays paired **74**, discordant **16 ≥ 6**, `control.usage.usd` **$0.1996** present with no `refused`, held-out `published_bar_applies` **0** at `k: 1`. **9 repaired / 7 broken = +2 net** (2.70%), control harm share **43.75%**; against the learn draw **11 repaired / 9 inert of the 20** it failed (55.00%) and **7 broken / 47 kept** of the 54 it passed. Two findings the registration did not have: the net's 95% interval is **[−7.88, +13.28]** because 16 discordant pairs give SE 5.40pp — the ±2 bands were justified by `~8` discordant and are finer than the sample (AUDIT 34.167) — and the store costs **2.43× per episode** ($0.00655 vs $0.00270) by replacing the prompt cache on every call (AUDIT 34.166). Dispatch $0.9304, 1.82× the estimate | ~$0.93 |
| ~~P0~~ | ~~**R123a — price the rung before buying it**~~ | — | **READ BACK (§PROGRESS 212, AUDIT 34.160)**: `43773201592` green, **$0.9653**, 163 requests over 160 episodes. `rivaled 163 of 163`, `p50 0.0993`, ladder `13 / 22 / 49 / 82 / 105 / 118 / 145`. Two of four predictions wrong, both about the store: **every** request had a rival, and the median margin was twice the predicted ceiling. Two defects found — the ladder lived only in a job log, and the driver read `diagnostics.memory` to print a line and dropped the block, so no arm artefact had ever carried `tau2.memory` and R128's join had a reader with no writer. **Original brief:** what a margin gate would cost on the store this lane actually has | First run `43719474599` returned **`rivaled: 0`** against a store serving **4.05 items per pack** — arithmetically impossible, and traced to the facade answering `{ rendered }` while the registration read the census from Python (§PROGRESS 209, AUDIT 34.159). The zero was the **ninth** missing-field-read-as-zero in this record and the first that would have retired a mechanism rather than a round. Repair: the wire carries `decision`, the reader counts its own arrivals, `rivaled` is `null` not `0` when none arrived, and `PackCensus.margins` counts the same quantity in process so the two halves can be compared. **Re-dispatched 06:5x Z**; the rung is chosen from that ladder by the three rules the registration states | $1.60 spent, $1.60 again |
| **P0** | **R125 — change the unit, not the sample** (**instrument built**, $0; readback rides on R123's arm) | a **per-turn** census whether the memory induces wrong actions, since no affordable task-level sample can resolve the effects this lane has | Trials 4 → 6 was the plan and the validator refused it: `l4-paired` compares **tasks**, and forty tasks is forty tasks however many trials are bought (SE **7.76pp** at n=40, `z = 1.29` for a 10pp effect). `episode_rate` does narrow to 240 observations, but it is not the paired test; and the paired-episode reading that exists — `transfer`'s informative trials — would reach 32 at trials 6, taking the harm-share interval from ±21pp to ±17pp, which still cannot order 52% from 57%. **114 tasks give 4.60pp of standard error and 300 are needed; retail ships 114.** What is affordable is turn-level: **2,666 turns at trials 6** (11.1 per episode), where an induced wrong action shows up as a failed tool call instead of a lost episode. Treatment: a `$0` census over trajectories the harness already recorded — tool calls returned in error, repeated identical calls, and the user turns that follow — paired per episode with a count interval. **Refutation**: the two arms' counts differ by no more than their own intervals, which is a test that can come out either way, unlike the task-level one | $0 code, then one arm at R124's price | **Built (§PROGRESS 212)**: `eval/drivers/tau2/turns.py` reads every episode's messages in the process that holds them — 1,813 assistant turns for 160 episodes — and counts tool results returned in error, calls repeating an earlier call with identical arguments, and the user turns that follow either; `packages/eval/src/tau2-turn.ts` pairs the arms by `(task, trial)` with a Poisson interval per arm and a paired interval on the difference. Two decisions carry the defect class: `toolErrors` is `null` rather than `0` when no result carried the flag, and a call with no readable payload is counted rather than called a repeat. `$0` model cost, 24 tests, a cross-language contract test over the real payload.
| **P0** | **R128 — which claim broke which trial** (instrument **done**: `episodeStarts` + `pairAttribution`; readback joins R125) | the memory's **content**, not its gate: per-item net transfer, joined from the pack ledger to the trial it changed | The transfer ledger R123a printed is the first same-run, same-store paired reading of the memory's **direction**: **8 repaired, 12 broken** on 21 informative trials, net −2.50pp (R124: **22 / 10**, net +7.50pp — opposite sign, different store). Every gate this record has built asks whether a pack should be served; none asks **which claim in it hurt**. The join is one field away and the field now exists: `pack.ledger` carries the ids per request, `per_trial` each reward, `memory.episodeStarts` the boundary — 164 requests covered 160 episodes, so a positional join drifts at the four that recalled twice. **Readback** (on R125's artefact, $0): `attribution` present and non-empty; `episodes` summing to 160; **≥1 item with `net < 0` over ≥2 episodes**; and no worst item whose `episodes` exceeds half the arm, since that would be a store property rather than a claim. **Refutation**: no item reaching `net < 0` over two episodes means the harm is not attributable to content at item granularity, and the next dollar returns to the use-side question | $0 (readback) / ~$1.10 (R128a) |
| **P0** | **R126 — the census that counts renders for a defect made of items** ($0 half and a treatment half) | does `unnamed` belong beside the population it describes, and can three keyless rubric records ever fold | R124 printed **52 unnamed of 697 units** where R120 printed `0 of 650`; the artefact joins all 52 renders to **three items** (8 + 17 + 27) that have never carried a shape, all `supportTasks: 1`, none merged, and R120's own sample was the same 62-of-64 shape-carried (AUDIT 34.158). `shapeByTaskOf` skips a correction with no actions by design, so a rubric-only claim can never be named — the store did not change, its three weakest records entered a pack when consolidation took 70 items to 66. **$0 half**: print `3 item(s) / 52 render(s)` so neither denominator can be read alone. **Treatment half** (separate registration): whether `rubric:<reasonCode>` is a legitimate fold key — it would merge on the host's vocabulary rather than the corpus's, which is exactly the substitution R99 paid for | $0 / ~$1.10 |
| ~~P0~~ | ~~**the gate's ruler**~~ | a gate cannot grade a bar it invented | **DONE (§PROGRESS 198)**: `sampleGates` took `published: { meets }` — a verdict rather than a number — so it printed `criterion: '>= published + 0.05'` beside a boolean computed elsewhere. R119's file says the bar is the **interval's lower bound** (needs 0.75) and the gate applied **0.625**: a 12.5pp band in which a dispatch would have been green under a file that refuses the claim. The gate now takes the value, the ruler and the count, computes its own verdict, and prints the half-width. `claimRuler: point\|interval` is the header; absent means `point`, so no artefact's verdict changes retrospectively | — |
| **P0** | **R119 — the regime, paid for** | what a store fourteen times larger does to a score, at R104's own `n` | **the first dispatch on a store built under a stated regime.** R118 built **86 claims** where R104 had 6, from **73 of 73 answered** replies where R104 had 10, and nothing has measured what that does to a score. R104's lane, R104's split, **R104's `n` (40 tasks)**, R104's form and model — the only differences are `thinking: 'off'` stated and an artefact that carries its own store. **One arm, because the arithmetic forbids the second**: R104's single arm took 177 wall-clock minutes and the L4 ceiling is 340, so two arms at 68 tasks is ~10 hours. This registration therefore claims the **second of three rulers** — an absolute score against a fixed bar, ±15.42pp at n=40 — and not a paired delta, whose floor on 40 tasks is 44.30pp. **Its own bar test is stated in the file**: to be called above 0.575 the interval's lower bound must clear it, which needs **p ≥ 0.75**; 0.70 gives 0.558 and 0.65 gives 0.502. Reads `storeItems` (all 86 claims' text), `faithfulness.kept`, `coverage.medians`, `yieldCensus` and the facade split | $0.89 |
| ~~P1~~ | ~~**R116 — the noise floor, corrected**~~ | — | **DONE, and the lane is coarser than the floor it was arguing about (§PROGRESS 196)**: the audit that existed to find underpowered claims required a `per_case` array and therefore **skipped the τ² lane entirely** — the one lane that carries this project's SOTA statement. Its row reads `paired 68, lost 13, gained 14`, delta **+1.47pp**, half-width 14.98pp, floor **21.41pp**, against the loosest BIRD row's 4.87pp. The record is now 22 deltas, **1 resolvable (4.5%)**, 6 within their 95% half-width, and `readPower().coarsest` names the τ² pairing explicitly. R92's "2–3 tasks" is replaced by a number that arithmetic produces on every build. What the floor means: at 68 tasks complete discordance puts it at **33.98pp**, the last pairing's discordance at **21.41pp**, and the whole 115-task retail split at **26.13pp** — **no design on this lane resolves a 5pp paired delta**. The distinction matters and this record has been blurring it: an **absolute score** at n=40 carries a ±15.42pp binomial half-width and a **cross-sample comparison** 17.65pp, both about a third of the paired floor — so a leaderboard row and a within-dispatch delta are not measured with the same ruler (COMPETITIVE Appendix AL.1) | $0 |
| **P1** | **R97 — ephemerality** | — ephemerality** | one sentence: the pack is a past experience | the only intervention in the literature with an effect larger than this lane's 21pp resolution at n = 40 (Anti-Persistence, 28.0pp). With the noise floor at 2–3 tasks, only large hypotheses are worth buying | $0.83 |
| ~~P0~~ | ~~**R103 — where the uncached tokens come from**~~ | — | **DONE (§PROGRESS 185, AUDIT 34.132)**: five arms on one table. The wrapper costs +5.7 uncached tokens a call (1.4% of the premium); the premium is the pack's presence, of which **at most 44% can be the block even if it is re-billed every call** (0.2819 tokens per served character) and **626–688 tokens a call are the arm's own turn material**. The bill is behavioural, not textual. Artefact key renamed `calls`→`turns`, provider's record carried as `usage`, and a per-call `prefix_coverage` census installed with a verdict | $0 |
| **P1** | **R104b — guidelines written by a model, not folded by one** | corrections vs guidelines *composed* from them | **the half of the old R104 that the deterministic fold cannot reach.** R93's 15 repairs 0.700 against R99's 73 records 0.625; ALTK's airline arm reports 14 guidelines at 45.0 against 101 at 40.0. Same store, but the guideline is *written* — which is the operation ACE measured as **brevity bias, −9.6 points**, so this arm exists to price the writing rather than to assume it. **Not registered yet**: the fold's own contribution has to be read first (R104), or this arm's delta is two treatments. R104's old `≥ +5.0pp` claim moves here, where the design can still not see it: the same 21.02pp MDE applies | ~$0.01 + a dispatch |
| **P1** | **R105 — the HITL arm** | who admitted the guidelines | the first arm on this board that prices a reviewer: the same candidate set admitted automatically and adjudicated, with accept rate, edit rate and seconds per card recorded per decision. Meaningless before R104 says the unit is right, and impossible without the ledger | $1.21 + a human session |
| **P2** | **R104b — the model-written proposal** | who writes the guideline, at the same unit | the treatment the deterministic merge is the baseline for. Same candidate set, one difference: a model writes the claim and the trigger, and both face the same witness. Priced at ≈ **$0.01** per candidate over 15 sources, sharing R104's control leg. **Registered prediction: no gain unless `fragmentation` is high** — a proposer fixes prose, and `census.fragmentation` is the number that says whether prose is the problem | $0.01 + shared control |
| **P2** | **R104c — the model-written split** | grouping, not prose | the cheaper half of the same question, and the one ACE's `brevity bias` does not reach: single-link chaining pulls a loose cluster together, the model proposes where to cut, and the reviewer decides. Blocked on `census.chained` being non-zero on a real store | $0.01 + shared control |
| ~~P0~~ | ~~**R106 — the declaration should derive the gate set**~~ | — | **DONE (§PROGRESS 184, AUDIT 34.130)**: twenty gates marked where they are built, the disposition derived from the arm's declaration, a store-reading gate with no empty form refused at grading time, and control pairs graded against `TAU_BAND` rather than against a significance they never claimed. `eval:protocol` re-rendered all 31 committed reports unchanged | $0 |
| ~~P0~~ | ~~**R102.1 — pack placement**~~ | — | **REFUSED by its own probe** (§PROGRESS 181): `placement-is-free`, +31 tokens a call for the second system message, +31 for the merged one, +31 for the task tail. $0.09 to refuse a $0.83 arm | $0 |
| **P2** | **R95 — the 114 base** | the sample | still the only lever on resolution (11.7pp at d = 0.2 against 19.8pp), but it buys precision on a treatment not yet shown to help | $2.40 |
| **P2** | **R108 — the observation, if that is what it is** | the agent's action mix, not the store | **named by R103's census**: 626–688 of the 1,125-token premium is material the pack does not contain. If R104 reports `prefix-honoured` with `last_tokens` ≈ `uncached_tokens_per_call`, the memory's cost is the observations its rule induces, and no store-side change reaches it. Registered after R104 so the census reads first | $0 (read of R104) |
| ~~P1~~ | ~~**R113 — the scope a rule was formed in, and the two silences behind it**~~ | whether a stored rule says where it applies and what it is for | **READ at $0, and it closed its own line (§PROGRESS 190)**: `universalityCensus` on R99's artefact (run `43463317323`, 73 records, 64-record sample) reports **0.0000** — every record declares a domain, so there is no population of scope-less rules — which is below the `0.05` floor this header fixed before the number existed. The thresholds were written first and they were used. The projection kept one dimension of five (now fixed, `scopeDims`), and `SCOPE` reads `EMPTY` on that artefact because `task` was never projected | $0 |
| **P0** | **R117 — the ban's price, measured** | the tool-name ban, on and off, over one population | **the mechanism §192 found and nothing has priced.** R104 refused **10 of its 16** candidates at the ban, stored the 6 that name no tool, and all 6 are format or ordering facts — `name`+`arguments`, `item_ids`/`new_item_ids`, `payment_method_id` vs `reason`, `get_order_details` first. Entity survival is **0 of 667**, median injected-pair coverage **4.76%**, and one pair in four matches nothing. The ban is right in principle (a claim naming `modify_pending_order_address` cannot transfer) and the defect is that what survives it is the residue a schema validator already knows. Two arms over one store and one split, the only difference `accept: toolGuard.accept` — the read is the store's shape and the paired pass^4 | **$1.78** |
| ~~P0~~ | ~~**R118 — the regime, re-run**~~ | — | **DONE, and the regime was all of it (§PROGRESS 195)**: run `43623858218`, $0.19, one arm, `learnOnly`. **73 of 73 replies answered**, `blank: 0`, `empty: 0`, `unparsed: 0`, 67,859 characters, 143 candidates, **86 stored**, 57 refused, `faults.events 0`, `silence.state: answered-everywhere`. Against R104's 10 answered / 63 blank / 16 candidates / 6 stored / 6,824 characters, with every other parameter identical. **The 63 blanks were the thinking budget**: a parameter no client sent, whose default is to think out of the same 1,200-token ceiling the reply needs. Two things it did not do, both recorded: the artefact carried no `storeItems`, so it could not say what the 86 claims are (fixed — `distillDiagnostics()` now carries store, storeItems and yield), and `merge.wouldStore: 53` against `stored: 86` with `report.merged: 0` says the store is 86 repetitions of 53 ideas | $0.19 spent |
| **P1** | **R113a — fifteen claims against fifteen records, one population** | the condition, with the writer chosen first | **no longer a form comparison**: both existing stores are `raw`, so R93's 0.700 against R99's 0.625 prices fifty-eight more copies rather than a different kind of record (AUDIT 34.141). The arm this record still cannot read is the one its own default unit describes: fifteen `correction` claims, each carrying the `when` the prompt makes mandatory, against fifteen raw records from the same failures. It is blocked on **R112** — a writer that returns nothing would make the treatment an empty store and the arm a rerun of R111 | $1.21 shared control |
| **P3** | abstraction (`{product-name}`-style) | the unit | AWM's mechanism (§Appendix X) and the only one left that changes what a record *is* rather than how many there are; it needs merge-by-shape to land first | $0.83 + code |

**R109 was scoped by deciding where the merge belongs, and the three candidates differ in more than
effort.** The store cannot express `support` today: one correction makes one item, the dedupe key is the
normalized statement, and two failures of one shape differ in every token that key reads. Three places
can change that, and only one changes one thing:

| where | what it costs | what it changes | verdict |
|---|---|---|---|
| **write path** — supersede an item, union its evidence | a store API that does not exist, and every downstream count (admission, provenance, faithfulness) re-derived | the store's *contents*, so R104's comparison would differ in two places | refused as a first step |
| **distillation** — one call per shape | fewer model calls, which is attractive | the statement is written from one representative, so the others' content is discarded — the laundering risk R99 already paid for | refused as a first step |
| **delivery** — collapse same-shape items in the pack, report the support | nothing: a pure function over the pack the recall already produced | the unit the model sees, which is the only thing R104 asks about | **chosen** |

The reason is the same one that kept a model out of the merge (AUDIT 34.131): an arm changes one thing.
Delivery also has the property the other two lack — it is reversible per request, so the same store can
serve both arms of R104 in one dispatch, and the pack's `support` becomes a number the artefact carries
rather than a claim the store makes about itself.

**R109 shipped the delivery half and stopped exactly where the evidence stops.** The fold exists, is
tested, and is sized: on the committed 32-task retail corpus it collapses 32 records to 26 units at
**0.8285** of the store's characters, with five units at support ≥2 and one at 3 — and it still fits
**five** units into a 2,400-character pack, which is the number a registration would have got wrong by
assuming "more rules fit". The pair is not built: two levels over one store is the note arms' machinery
generalised to a second axis, and its identity control has to become a containment one. That is **R109a**,
and it is P0 because both R104 and R109 need it.

**R102 is a cost arm and it is ranked P0 on a different axis from the science.** No arm in this record has
ever attributed its bill; three arms on the same forty tasks now subtract to the cent, and the answer is
that the memory pays for a **cache it destroys rather than for a context it adds**. A memory that costs twice
as much and scores 2.5 points lower is a product defect before it is a research question, and the repair is
placement rather than distillation, retrieval or size.

**It was split in two, and the first half refused the second.** R102.0 was a probe rather than an arm: is the
second system message outside the cached prefix, or is the block behind a boundary the provider does not
carry? The answer, on the third dispatch and the first one whose instrument had been made to fail twice, is
**neither**: the block adds 1,497 prompt tokens a call and **31 uncached** ones, in all three placements
(PROGRESS 181). A cached block cannot be a cache the memory destroys, so R102.1 is refused rather than
deferred, and the $0.83 is unspent. Three probe dispatches cost $0.09.

**What the refusal leaves is a different question, and it is free.** The prompt total is now fully explained by
a cached block; the *uncached* premium — 18.6k tokens an episode — is twelve times what a cached block can
produce and is therefore behavioural. R103 re-derives both arms from their phase-level usage lines and their
turn structure before any further cost claim is made.

**R101's scaffold leg does not price anything, and §PROGRESS 179 said it would.** The agent injects nothing
when the pack is empty, so the empty-pack arm sends the reference arm's prompt byte for byte: its bill lands
near the control's $0.38 however the caching works, and reading that as "the block's presence is the cost"
would be reading the arm's own definition back as evidence. The withdrawal is recorded as AUDIT 34.126
rather than quietly reinterpreted, and it is the second correction that section carries — the first being
that every memory turn from R92 to R101 was delivered with the block wrapped in a second copy of its own
element.

**R99 is closed, and it closed in the direction the registration did not name.** The supply arm returned
**0.625** against the fifteen-record store's **0.700** and the control's **0.725**: five times the supply,
three fewer tasks, with every delivery instrument (coverage p10/p50/p90, items per pack, requests served)
moving the way the "too little memory" theory wanted. The criterion said `< 0.700` closes the line, and it
is closed — not as "supply did not matter" but as **"supply is an anti-constraint"**. Any remaining
store-side arm has to be justified by a mechanism, not by a count (§34.125).

**R100 is refused, not deferred.** The registered floor procedure computes **0.01** on both the R47
fixture and R92's own curve, so no admissible rung changes the delivered population and the arm cannot be
dispatched as written. Changing the procedure is a registration of its own; changing the cost weights
after seeing the number is not available. The refusal is the instrument working, and the hypothesis it
would have tested — a third of the packs are below 0.20 coverage and the memory breaks ten trials — is
untouched.

**What is now out of bounds, and it was not before.** Any arm whose treatment is a store-side change of
one or two tasks. R92's rebuilt store scored 0.650 and R93's pinned store 0.700 — four failures re-distilled
into four statements, five points apart. That is the noise floor at n = 40, and it exceeds every store
effect this record has reported since R85. A store experiment on 40 tasks has to be registered with a
prediction of **three tasks or more** or it cannot be read.

## Where the flywheel stands, 2026-11-18 (R141 read, R142 dispatched)

**The one thing that changed.** The memory has beaten its own control on a τ² arm for the first time, and the
gain is not the headline: the **harm share fell from 15.63% to 3.03%** while the repaired count stayed at 5 and
the broken count fell from 5 to 1. A serve-time floor on corroboration — ALTK's `sup2` cell, applied where the
store is read rather than where it is written — is the first mechanism in this record that removes damage
without removing repair. It is unresolved at n = 40 (MDE 17.16pp), which is what R142 is for.

**What is left, in order, with the number each step is waiting on.**

| # | step | the number it needs | state |
|---|---|---|---|
| 1 | **R142 — the other cut** (57/57) | harm share < 5%, delta ≥ 0 at a bound of 14.4pp | **two dispatches lost to the window, not to the arm** (§AUDIT 34.182, 34.185): the first bought a learn half at 00:47 and was refused at 01:19 ($0.1617), the second slept 126 minutes and was refused by its own guard for naming the hour it had just waited for (04:00 read as tomorrow). The guard now consumes `start_at` and both arms obey `fits`; **re-dispatch at 10:00 UTC**, the next window that holds 228 off-peak episodes |
| 2 | the outcome counter (R129) | a record whose repairs are below its own rate at 5%, over ≥3 opportunities | **instrumented, reading on a real arm, and refused on evidence rather than on sample size** (§17.152–17.153, §PROGRESS 232–233): the denominator is *opportunity*, not renders — R141 offered 7 opportunities over 40 renders (17.5%), the most-served record had one, and at that arm's own rate a record needs three. The counter is not broken; the corpus's headroom is 17.5%. The line printed only after the join stopped deleting the arm for one abandoned attempt (§AUDIT 34.184) |
| 3 | the content axis (R14's pair, STRATA's contrast edge) | the harm share *rising* at 2, or a broken set that is not singleton | **join grain delivered (§17.155, §PROGRESS 235)**: a render now names the task it was served into, the pair artefact carries `serveTasks` (per-task `renders / items / opportunity / repairs / breaks / net`), and the id is forbidden a second count by an invariant case rather than by a comment. Two readings narrow it further (§PROGRESS 236): the store declares scope on **every** record (0 of 64 declare nothing beyond their task) and has **0** universal rules, so the literature's "the rule travels" mechanism is measurably absent — while **fragmentation is 0.906** (58 of 64 repairs in no cluster) and **`reasonCode` is open on 51.6%** of records. So the axis to test first is a **relevance** gate rather than a text join: `RecallQuery.anchoring` ("a scope-matched rule that shares no word with the query may not appear") is a published contract the τ² driver never wires, and `reasonCode` — the widest-open dimension at 51.6% — **cannot** be a request-side gate, because a user message carries no reason code; it is a readability gap, not a retrieval one. The second lever is consolidation, since fragmentation 0.906 says the rules do not group at all. **Text is still missing** (sample capped at 64 of 83; a record's source tasks are not in the artefact), and that is a distillation-output change, not a dollar |

| 4 | a resolved paired read on τ² retail | ~114 pairs for a 10pp effect | **registered, dispatch behind step 1** (§PROGRESS 234; `prereg/R143-fold-official.md`, `prereg/R143-fold-swapped.md`): at R141's 17.5% discordance 114 pairs resolve **10.98pp**, so the cross-fit buys 7.5 points of resolution and a ten-point effect sits on the line rather than inside it. The count is what resolves: 12/3 gained-lost is p = 0.0352, 10/5 is p = 0.3018. The `official` fold is a re-run of R141's treatment (no artefact before R145 states its split, and the pool refuses rather than back-fills); the `swapped` fold carries 65% of the pool weight on a store built from 40 tasks, registered as a confounder |
| 5 | the published bar (0.575 pass^4, ALTK 0.6754) | a backbone whose own cell is comparable | **not reachable on this lane**: the control scores 0.825 on 40 tasks with `deepseek-flash`, so `bar_backbone_matches = 0` and no row can be claimed |
| 6 | **the lexical anchor arm** (R150's switch) | breaks fall while repairs hold, on the same store and corpus | **reachable for the first time (§17.156, §PROGRESS 237)**: `serveAnchor: lexical` is now registrable, `tau2.pack.knobs` records what filter ran, and the pool refuses two folds served through two filters. The mechanism it targets is what WikiTrace attributes 80% of degradation to (a valid rule applied outside its scope). Gated on 1: if R142 shows the harm is reach, this is the arm; if it shows interference, the floor is |
| 7 | BIRD dev, the only lane with a published same-split cell | 6,600 paired questions for ~1pp | unchanged, and the largest claim it can support is ~1pp |
| — | cortex release (W1) | — | **excluded by the standing instruction** |

**The honest summary of the gap to SOTA.** The flywheel's own mechanism is now ahead of its control on the only
lane where it has been measured with a control, and it is behind the field on the axis that decides a
leaderboard: a memory worth ~10pp on 40 retail tasks is not a 20-point generator gap, and the two mechanisms the
leaders use to close that gap (a fine-tuned generator and a large candidate pool) cost weights this harness does
not have. What this project can be first at remains what it has been first at all along: measuring *why* memory
hurts, with a control, a resolution, and a refutation stated before the number.

## Where the flywheel stands, 2026-11-18 (R142 read, R151 registered)

**The one thing that changed.** The floor did what it was registered to do and the harm came back anyway:
`retired` 37 of 61, `retained` 11, **no singleton served**, and 6 of the 9 served records broke a trial
(12.77% of the trials the control passed, against 3.03% on R141's smaller cut). The registration's own decision
table had already said what that means, in a row written before the run: *harm share ≥ 10% → content, not
support*. The population question is now answerable from the same artefact, and it answers itself:
**`itemsPassedOnly 50` against `itemsEditedOnly 11`** — the store is 82% descriptions of behaviour that already
worked, because `distillScope: all` has bought the consolidation pass its second witness since R131.

| # | step | the number it needs | state |
|---|---|---|---|
| 1 | **R151 — the failures-only store** (`prereg/R151-the-failures-only-store.md`) | `created` 8–16, `repairs` ≥ 4, `breaks` ≤ 2 | **registered, dispatch next off-peak window** — the content axis, and the branch R142's decision table selected. Same 57/57 cut, same pass, same key, same `packLimit: 1`, same margin of zero; `distillScope: edited` and the floor at its identity (`serveSupport: 1`), with the two-knob confound registered rather than dissolved (§17.158). Cost ~$0.26, which is R142's measured bill |
| 2 | **the rung** (usage axis) | a margin that separates a repair from a break | **priced for nothing, and refuted at n = 57**: `serve-sweep.ts` joins `margins.perRequest` to `ledger` and `per_trial`, and R142 reads **AUC 0.625** with exact permutation **p 0.305** (4 kept vs 6 broke), the highest-margin break (0.275) sitting *inside* the repairs' range (0.310, 0.317). The cleanest rung, 0.30, keeps 2 repairs, withholds all 6 breaks and serves **7 of 57** trials — a fitted value, not a lever (§17.157, §AUDIT 34.189). It stays on the board as the fallback if R151 refutes content |
| 3 | the lexical anchor arm (R150's switch) | breaks fall while repairs hold, on the same store and corpus | **registrable, and now the third axis rather than the second**: WikiTrace's 80% "valid rule, applied outside its scope" class is what it excludes, but R142's harm is *interference* — six breaks on six distinct tasks, one render each — not reach. It runs after R151 |
| 4 | a resolved paired read on τ² retail | ~114 pairs for a 10.98pp effect | **registered and queued** (`prereg/R143-fold-official.md`, `R143-fold-swapped.md`): R142's own resolution line says a 5pp half-width needs **270 tasks** and 3pp needs **749**, so the cross-fit buys resolution and cannot buy a claim at 114 either. It prices the *effect* once one exists; it cannot create one |
| 5 | the published bar (0.575 pass^4, ALTK 0.6754) | a backbone whose own cell is comparable | **not reachable on this lane**: the control scores 0.8246 at 57 tasks and 0.65 at the benchmark's 40 with `deepseek-flash`, so `bar_backbone_matches = 0` and no row can be claimed (§COMPETITIVE AM.7) |
| 6 | the outcome counter (R129) | a record whose repairs are below its own rate at 5%, over ≥3 opportunities | **waiting on a population**: R142 offered 10 opportunities over 57 renders and the most-served record had one. The counter is not broken; the corpus's headroom is 17.5% per render and the floor's 9 records produced 10 chances between them |
| 7 | BIRD dev, the only lane with a published same-split cell | 6,600 paired questions for ~1pp | unchanged, and the largest claim it can support is ~1pp |
| — | cortex release (W1) | — | **excluded by the standing instruction** |

**The honest summary of the gap to SOTA.** The flywheel's mechanism was ahead of its control on one 40-task
reading and is behind it on the 57-task one, and the reason is now measured rather than argued: the store's
population was chosen for supply, and supply was bought with successes. That is the one axis on which this lane
can be first — no competitor publishes a harm share, and none of them writes a store that is 82% descriptions of
behaviour that already worked. What remains unreachable is the leaderboard: a control that clears the published
bar on a cheaper backbone means no delta on this harness is a comparable row, whatever the memory does.

## Where the flywheel stands, 2026-11-18 (R151 read, the noise floor measured)

**The one thing that changed.** The content axis was bought and lost: a store built only from failures
(11 corrections, 16 items) broke **9 of 51** control-passed trials and repaired 4 of 6, for **−8.77pp** — worse
than the store it replaced. And the same readback produced the first measurement of the lane's own noise: two
reference dispatches on the same 57 tasks agree on 82.5% and flip 17.5%, so **the same arm moves 7.02pp** and
the MDE every earlier round published is 28% too tight.

| # | step | the number it needs | state |
|---|---|---|---|
| 1 | **resolution: the R143 cross-fit** (114 independent task pairs) | MDE ≤ 11pp over two folds | **head of the queue, and for a new reason** (§17.159, §AUDIT 34.190): with one trial per task the lane's own noise is ~7pp per arm, so no delta it has produced (−3.51, −8.77, +10.00) is claimable. The folds are registered; they must run **serially**, both on the floor-2 store, and pool through `crossFitPool` |
| 2 | content (axis 1) | a failures-only store that breaks fewer trials | **measured and refuted** (§PROGRESS 176): 9 breaks against 6, harm share 12.77% → **17.65%**, and the reason is one line — 11 of the 12 served records carry support 1 and 8 of those broke. A repair written for one task is served to every task that resembles it |
| 3 | usage (axis 2) | a margin that separates a repair from a break | **measured and refuted for nothing** (§17.157): AUC 0.625, exact permutation **p 0.305** over 210 labellings; the cleanest rung (0.30) keeps 2 repairs and serves 7 of 57. On R151 the sweep finds **no clean rung at all** |
| 4 | the lexical anchor (axis 3) | breaks fall while repairs hold, on a store and corpus already measured | **registrable, and now the only mechanism left**: it targets the failure mode both refuted axes share — an item applied to a request it was not written for — with content rather than a ranking gap. It waits behind resolution, because a 4pp movement cannot be seen at 20pp |
| 5 | the published bar (0.575 pass^4, ALTK 0.6754) | a backbone whose own cell is comparable | **not reachable on this lane**: the control scores 0.8947 at 57 tasks with `deepseek-flash`, so `bar_backbone_matches = 0` |
| 6 | the outcome counter (R129) | ≥3 opportunities per record, repairs below the arm's own rate | unchanged: R151 gave 13 opportunities over 57 renders, spread across 12 records |
| 7 | BIRD dev | 6,600 paired questions ≈1pp | unchanged — and now the lane whose resolution the record can actually use |
| — | cortex release (W1) | — | **excluded by the standing instruction** |

**The honest summary of the gap to SOTA.** Two mechanism axes have now been measured with a control and both are
negative; the store as built does not help, and the record can now say *why* with a number: it serves one-task
corrections to tasks that resemble them, and the control is already strong enough (89%) that the population of
trials it can break is eight times the population it can repair. What remains first-in-field is the measurement
itself — a harm share, a noise floor, a margin with an exact null — none of which any competitor publishes. What
remains out of reach is the leaderboard, and the distance is now stated in the only unit that matters: **15.55pp
at 57 pairs and 10.98pp at 114 is what this lane can resolve, and the field's gaps are smaller than that**. (The
19.9pp this sentence used to quote is withdrawn — §AUDIT 34.192 — because it put an unpaired SD beside a paired
estimator.)

## Where the flywheel stands, 2026-11-18 (R143 pooled: the whole corpus, read once)

**The one thing that changed.** Resolution was bought and delivered: two folds over the benchmark's own boundary
give **114 independent task pairs**, and the pooled reading is **−6.14pp** [−14.91, +2.63] with a resolution of
**13.24pp**. The measurement is not the headline though — the folds are. `official` reads **+2.50pp** on 11
servable items over 40 renders, `official-swapped` reads **−10.81pp** on 3 servable items over 75 renders, and
**they disagree in sign**. Same treatment, same model, same day; the difference is how far the surviving items
travelled beyond their evidence.

| # | step | the number it needs | state |
|---|---|---|---|
| 1 | **resolution** (114 pairs) | MDE ≤ 11pp | **done and read** (§PROGRESS 178): 13.24pp, −6.14pp, folds split ±. One fold was regenerated from its own arm files by the fixed guards (§AUDIT 34.191), the other ran on them |
| 2 | **a travel budget on serving** | harm falls while repairs hold, on the store and corpus already measured | **head of the queue, and it is a new instrument**: harm tracked renders-per-servable-item (3.6 → 25.0 gave 8.33% → 23.81%), so bound the renders one item may take rather than the number of items. Measurable with `serveYield` per record and `serveTasks` per task, both committed |
| 3 | content (axis 1) | a failures-only store that breaks fewer trials | **measured and refuted** (§PROGRESS 176): 9 breaks against 6, harm 17.65%, because a repair written for one task is served to every task that resembles it — the same mechanism row 2 now prices |
| 4 | usage (axis 2) | a margin that separates a repair from a break | **refuted twice more**: AUC 0.625 (p 0.305) on R142, **0.333** (p 0.771) on the official fold, **0.495** with the null not even walkable on the swapped fold. Three independent readings, no separation |
| 5 | the lexical anchor (axis 3) | breaks fall while repairs hold | **registrable, still second**: it targets the same failure mode as row 2 with content rather than a cap, and a cap is now the cheaper test of the same hypothesis |
| 6 | the published bar (0.575, ALTK 0.6754) | a comparable backbone | **not reachable on this lane**: `bar_backbone_matches = 0`, control 0.8684 pooled |
| 7 | BIRD dev | 6,600 paired questions ≈1pp | unchanged — the lane whose resolution the record can use |

**The honest summary of the gap to SOTA.** Three mechanisms have now been measured against a control on two
different populations and none of them helps; the best reading in the record is a **negative** one over the whole
corpus, and the reason is now a quantity rather than an adjective: **an item served 25 times per unit of evidence
breaks five trials for every one it repairs, and the same item served 3.6 times breaks 0.27.** That is a claim no
competitor publishes, and it is also an admission: this lane's memory is currently worse than no memory, by a
margin its own design cannot yet resolve to zero. What it can resolve is 13.24pp at 114 pairs, 15.55pp at 57 and
18.53pp at 40 — so the next dollar goes to a serving rule whose effect is expected to be larger than that, and not
to another store size.

## Where the flywheel stands, 2026-11-18 (R152 read: the bound bites, the artefact does not say so)

**The one thing that changed.** Row 2 was bought and it worked as a *mechanism* and failed as an *instrument*. The
fair share bound the leader from **12 renders to 3**, served all 14 servable items instead of 10 of 11, and the
harm share fell from 8.33% to **5.88%** — while the delta stayed at +2.50pp, which a 40-task sample with a 7.5pp
between-run spread cannot move. The job is red on one blocking row because the arm artefact could not carry the
policy it declared (§AUDIT 34.195), so the fold is readable and not poolable.

| # | step | the number it needs | state |
|---|---|---|---|
| 1 | resolution (114 pairs) | MDE ≤ 11pp | done: 13.24pp, §PROGRESS 178 |
| 2 | **the travel budget** | harm falls while repairs hold | **measured and it acts** (§PROGRESS 179): cap 3, 0 starved, leader 12 → 3 renders, harm 8.33% → 5.88%, breaks 3 → 2, repairs 4 → 3. The registered rule fires: *allocation is the lever* |
| 3 | **the same registration, replicated** | a complete artefact, and the bounded arm's own between-run spread | **head of the queue, $0.37**: shipping the rotation as the serving default needs an artefact that states the policy it is the default of, and this fold's cannot. One dispatch to the same registration, with its own predictions written before the draw |
| 4 | the serving default | a fold that runs the bound without being told to | **after row 3**: the template's `serveRotation: fair-share`, and the registration of the next axis written on top of it |
| 5 | the lexical anchor (axis 3) | breaks fall while repairs hold | **still second**: the same failure mode as row 2, attacked with content rather than a cap. The cap is now the cheaper test of it and it has acted |
| 6 | the outcome counter (R129) | within-phase evidence that an item repairs | **not triggered**: its trigger was `breaks ≥ 5`, and breaks fell to 2. Its case rests on R143's attribution, and row 3 would price the spread first |
| 7 | the published bar (0.575, ALTK 0.6754) | a comparable backbone | not reachable on this lane: `bar_backbone_matches = 0`, control 0.8684 pooled |
| 8 | BIRD dev | 6,600 paired questions ≈ 1pp | unchanged — the lane whose resolution the record can use |

**The honest summary of the gap to SOTA, one round after the mechanism was named.** The concentration hypothesis is
now measured, priced and acted on: at 3.6 renders per servable item harm is 8.33%, at 25.0 it is 23.81%, and under
a cap of 3 it is 5.88% on the same corpus with the same store shape. That is the first positive movement this
record has on harm, and it is 2.45 points on a denominator of 34, which is a count rather than an effect. What
stands between the mechanism and a claim is resolution, not mechanism: 40 tasks resolve 15.66pp and this arm
delivers 2.50pp of *net accuracy* while removing a third of its harm — the two are not the same quantity, and the
record's own decision rule now says to spend the next dollar making the artefact complete rather than chasing a
point estimate it cannot resolve.

## Where the flywheel stands, 2026-11-18 (R152b read: the instrument is whole, the fold is not)

**The one thing that changed.** The artefact can now state its own serving policy and be audited against itself:
R152b's block reconciles with the pack ledger filed beside it on all six reachable fields, `unprojected` is empty,
and `l4-rotation-reconciles` grades the next fold. What the dispatch did **not** buy is a control: `l4_arms: memory`
skips the pair step (`sota.yml:1839`), so the job went green having measured no delta (§AUDIT 34.196). The bounded
arm has two draws — **0.875** and **0.925** — and one of them has an artefact that can be pooled.

| # | step | the number it needs | state |
|---|---|---|---|
| 1 | resolution (114 pairs) | MDE ≤ 11pp | done: 13.24pp, §PROGRESS 178 |
| 2 | the travel budget | harm falls while repairs hold | **measured, three times** (§PROGRESS 179, 180): cap 3 and cap 4 on two stores, `max = cap` both times, 0 starved, 40 of 40 served |
| 3 | **R152c: the paired fold** | a fold artefact, and `l4-rotation-reconciles` green | **dispatched 20:52 UTC, run `44395483632`, both arms**: the first fold the reconciliation gate grades, and the pair without which four of R152b's six predictions cannot be read |
| 4 | the serving default | a fold that runs the bound without being told to | **after row 3**, and conditional on it: `serveRotation: fair-share` in `prereg/TEMPLATE.md`, with the lexical anchor registered on top |
| 5 | the lexical anchor (axis 3) | breaks fall while repairs hold | **second**, and now measurable on top of a bounded default rather than beside it |
| 6 | the outcome counter (R129) | within-phase evidence that an item repairs | not triggered: its trigger was `breaks ≥ 5` and the two draws read 2 and unknown |
| 7 | the published bar (0.575, ALTK 0.6754) | a comparable backbone | not reachable on this lane: `bar_backbone_matches = 0` |
| 8 | BIRD dev | 6,600 paired questions ≈ 1pp | unchanged |

**What the lane has learned to price, in two rounds.** The mechanism is no longer the open question: renders per
servable item was 3.6 on R143's rich unbounded fold and **25.0** on its thin one, harm followed it from 8.33% to
23.81%, and the two bounded draws sit at **2.86** and **3.08** with `max = cap` and nothing starved. What is open is **resolution and instrument cost**: a 40-task
fold resolves 15.66pp, this round spent $1.03 to learn that a dispatch input can silently skip the control, and the
one number that would settle the mechanism — a poolable bounded fold at 114 pairs — is exactly the number no single
dispatch can produce.

## Where the flywheel stands, 2026-11-18 (R152c read: the bound acts, the harm does not follow, the policy is reverted)

**The one thing that changed.** The third draw of the bounded arm came back at **0.775** against a control of 0.850 —
**−7.50pp**, 7 broken against 4 repaired, and R45's cost bar fires: the serving policy is **withdrawn as a default**.
The instrument passes everything it was built to pass (`l4-projection-complete`, `l4-rotation-reconciles`, a stated
`rotation: 'fair-share'` in the pair), and the mechanism that motivated it is refuted by it (§AUDIT 34.198).

| # | step | the number it needs | state |
|---|---|---|---|
| 1 | resolution (114 pairs) | MDE ≤ 11pp | done: 13.24pp, §PROGRESS 178 |
| 2 | the travel budget | harm falls while repairs hold | **measured and reverted** (§PROGRESS 179, 180, 181): the cap acts on every draw (`max = cap`, 0 starved, all servable served) and harm reads 5.88%, —, **20.59%** at constant renders per item |
| 3 | **the outcome counter (R129)** | within-phase evidence that an item repairs, immune to the between-draw spread | **head of the queue as of R153**: its denominator is an item's own served trials, so the 15pp store-draw variance that killed rows 2 and 3 does not enter it — and R152c's bounded fold is the first draw whose aggregate renders per item (3.15) meets the precondition the counter has waited on since R142, so its first read is a **$0 readback on R152c's artefacts** |
| 4 | the gate whose text and code disagree | a predicate that is its criterion | **done, $0** (§PROGRESS 182, §AUDIT 34.197/34.199, §TECH-DESIGN 17.166): the predicate is the criterion, the sentence for a harm below resolution is printed, both committed pair artefacts are re-graded (four lines, byte-identical elsewhere), and `pnpm check` now fails if a future edit moves a row without re-grading |
| 5 | the lexical anchor (axis 3) | breaks fall while repairs hold | **defers to row 3**: it is a content axis with the same exposure to the draw, and the counter is cheaper to identify |
| 6 | the serving default | — | **withdrawn**: nothing in `prereg/TEMPLATE.md` changes, and the switch stays as an instrument |
| 7 | the published bar (0.575, ALTK 0.6754) | a comparable backbone | not reachable on this lane: `bar_backbone_matches = 0` |
| 8 | BIRD dev | 6,600 paired questions ≈ 1pp | unchanged |

**The honest summary, four draws in.** The treatment arm reads 0.900, 0.875, 0.925 and **0.775** across four
dispatches at one treatment; the control reads 0.925, 0.850, 0.850. The spread of the arm that receives the
treatment is **15 points**, and the best resolution 40 tasks buy is 15.66pp — so this lane's per-fold measurements
of a 3pp mechanism are noise, and the record now says so with four points instead of one. The way forward is not a
fifth policy: it is an estimator whose denominator is inside a single episode (row 3) or a pooled one at 114 pairs,
and everything else is a draw.

**R153 closed row 4 at $0 and moved nothing else.** The gate now asks what its criterion asks, the sentence for a
harm below the pair's resolution is printed beside the claim, and both committed pair artefacts were re-graded
rather than re-bought — four lines across two 30–43 kB files, with `pnpm check` failing from now on if a future
edit moves a row without re-grading (§PROGRESS 182, §AUDIT 34.199, §TECH-DESIGN 17.166). Nothing about the effect
changed, because nothing about the effect was measured: this was the record's own bookkeeping made true, and it is
the second half of the round that withdrew the serving policy — the instrument stays, and now the instrument's
report is graded by the rule that ships.

## Where the flywheel stands, 2026-11-19 (R154 read: the ceiling under every unresolved row)

**The one thing that changed.** The control's pass rate is also the fold's ceiling, because a memory repairs only
trials the bare agent failed. `1 − controlPass⁴` is therefore the largest delta any store could produce on a fold,
and on **four of the five folds this record has run it is below the fold's own resolution** — so an oracle memory
would have been reported as an effect the design could not resolve (§PROGRESS 183, §AUDIT 34.200, §TECH-DESIGN
17.167).

| fold | n | control | ceiling | resolution | margin |
| --- | --- | --- | --- | --- | --- |
| `official` (committed) | 40 | 0.9000 | 10.00pp | 18.53pp | −8.53 |
| `swapped` (committed) | 74 | 0.8514 | 14.86pp | 17.76pp | −2.90 |
| R152 | 40 | 0.8500 | 15.00pp | 15.66pp | −0.66 |
| R152c | 40 | 0.8500 | 15.00pp | 23.23pp | −8.23 |
| R143 pooled | 114 | ≈0.86 | 14.0pp | 13.24pp | **+0.76** |
| retail + airline (computed) | 164 | 0.85 | 15.0pp | ≈11.5pp | **+3.5** |

| # | step | the number it needs | state |
|---|---|---|---|
| 1 | **the pooled retail+airline pair (R155)** | a fold whose ceiling clears its resolution | **head of the queue**: 164 pairs, ≈11.5pp resolution under a 15.0pp ceiling — the first composition with margin rather than a 0.76pp squeak. Cost ≈$0.55: one airline learn phase plus two arms; the airline fields stated explicitly, because a past arm inherited `TAU_TEST_DOMAIN=airline` and its delta measured two scenarios |
| 2 | the outcome counter (R129) | per-record opportunity | **not the next dollar, and not a separate one**: R152c produced 6 opportunities in 40 renders with `candidates: []` and `opportunitiesForEvidence: 3`, and R141/R142/R151 measured the same corpus limit. It needs the same thing row 1 buys — a corpus where the control fails more — so it rides on row 1 rather than preceding it |
| 3 | the lexical anchor (axis 3) | breaks fall while repairs hold | **defers to row 1**: a content axis measured on a 40-task fold is a draw, not a reading |
| 4 | the published bar (0.575, ALTK 0.6754) | a comparable backbone | **reframed, not reachable**: this lane's memory-free control reads 0.925 on the committed fold, above both published bars, so `bar_backbone_matches = 0` is not a technicality — the bars belong to weaker backbones and a comparison at equal backbone is the only one that means anything |
| 5 | BIRD dev | 6,600 paired questions ≈ 1pp | unchanged, and now with a sharper reason: it is the only lane in this record whose resolution reaches the 3pp claim at all |
| 6 | the serving default | — | withdrawn (§PROGRESS 181); the switch stays as an instrument |

**The honest summary, five bounds in.** The record has spent four dispatches learning that its measurements were
noise (±15pp across draws) and this round learning why: the folds could not have produced a visible effect even if
the memory were perfect, because the baseline agent already passes 85–90% of the tasks being measured. **The
binding constraint is headroom, and headroom is a property of the corpus and the backbone, not of the store.** That
reframes every remaining row: the next dollar does not buy a better memory, it buys a setting where a memory could
show up at all.

## Where the flywheel stands, 2026-11-19 (R155 read: the delta is a mixture)

**The one thing that changed.** Every delta this lane has published is a weighted average of two rates it never
printed, and the weights are the corpus's failure share: `delta = f·r − (1−f)·b`. Pooled over four draws the store
repairs **two thirds of the failures** (`18/27`, `[47.8%, 81.4%]`) and breaks **one in six of the passes**
(`27/167`, `[11.4%, 22.5%]`); it is net-negative only because passes outnumber failures six to one. Its break-even on
retail is **10.78%** and it is at 16.17% (§PROGRESS 184, §AUDIT 34.201, §TECH-DESIGN 17.168).

| # | step | the number it needs | state |
|---|---|---|---|
| 1 | **a content axis graded against the break-even** | `b < 10.8%` with `r` held at 66.7% | **head of the queue**: the first target on the harm side that a $0 change can be graded against, and the first that separates the store from the corpus. The lexical anchor (axis 3) is the candidate already built |
| 2 | **the fold the target has to be read on** | a ceiling above the resolution | 164 pairs (retail 114 + airline 50) is ≈10.5pp against a 15.0pp ceiling at the observed 0.232 discordance — the first composition with margin. Cost ≈$1.3, and it needs the airline control rate as a pre-reading (≈$0.15, one arm) before it is bought |
| 3 | metric parity (`k`, `trials`) in the pair protocol | an auditable comparison | **$0, new**: R152c records `k = 1` beside a field named `pass4`, the published bars are `pass^4`, and the protocol carries no `k`, so the mismatch cannot be seen from the artefact |
| 4 | the published bar (0.575, ALTK 0.6754) | a comparable backbone **and** metric | reframed: this lane's memory-free control reads 0.925 at `k = 1`; the bars belong to weaker backbones at `k = 4`. `bar_backbone_matches = 0` **and** a missing `k` — two reasons the comparison is not one |
| 5 | BIRD dev | 6,600 paired questions ≈1pp | unchanged, and now the only lane whose resolution reaches the 3pp claim (2,024 pairs at this discordance) |
| 6 | the serving default | — | withdrawn (§PROGRESS 181); the switch stays as an instrument |

**The honest summary, six bounds in.** The record has established, at $0 and with artefacts it already had, three
things that change what the next dollar buys: the fold has a ceiling (§PROGRESS 183), the target is a rate and not a
delta (this round), and the bar has a price in pairs (729 for `−5pp`). **The next spend should buy a fold that can
see the target and a change that moves the rate — not another draw of the same forty tasks.** Every remaining row is
now stated as a number a change can be graded against, which is the difference between a queue and a wish list.

## Where the flywheel stands, 2026-11-19 (R156 read: the metric was one level off, and the target has two prices)

**The one thing that changed.** Every L4 headline this record has published is `pass^1`, not `pass^4`: all four
registrations behind the pooled fold declare `trials: 1`, and the pair artefact copied the field's *name* without
its *value*. Worse, the tool that repairs gates by re-grading evidence had been turning a recorded
`l4-projection-complete: false` into `true`, because it recomputed a row whose evidence is not in the file it
re-grades (§PROGRESS 185, §AUDIT 34.202, §AUDIT 34.203, §TECH-DESIGN 17.169–17.170).

| # | step | the number it needs | state |
|---|---|---|---|
| 1 | **a content axis graded against the break-even** | `b < 10.78%` with `r` held at 66.7% | head of the queue, and now **priced**: the change costs 170–847 pairs, and certifying the level costs 592 passes at an 8% rate |
| 2 | ~~the 164-pair fold~~ | — | **withdrawn**: 164 is below the *nested* price of 170 and five times below the honest one. The sizes worth buying are **149** (certifies 5.39%) and **592** (certifies 8.08%) |
| 3 | metric parity (`k`, `trials`) in the pair protocol | an auditable comparison | **done**: `l4-same-k`, `bar_k_matches`, `k`/`kAbsent`/`barK`/`barKMismatch`/`restatedAtBarK`, and the four draws committed so `b* = 10.78%` re-runs from the repository |
| 4 | the published bar (0.575, ALTK 0.6754) | a comparable backbone **and** metric | reframed twice now: **cross-backbone** (`deepseek-flash` vs GPT-4.1) and **cross-sample** (40 vs 114). The metric is repaired — memory 0.7321, control 0.5220 at `pass^4` — and the memory clears 0.575 while its control does not |
| 5 | BIRD dev | 6,600 paired questions ≈1pp | unchanged, and the only lane whose resolution reaches the 3pp claim (2,024 pairs at this discordance) |
| 6 | the serving default | — | withdrawn (§PROGRESS 181); the switch stays as an instrument |

**The honest summary, seven bounds in.** The record now knows three things it did not this morning: its headlines
are one level below the bar it compares them to, its target costs either 170 or 847 pairs to *move* and 592 passes
to *certify*, and its own repair tool had been hiding a failure. All three were found at $0 with artefacts that
already existed — two of them by recovering artefacts the record had cited but never committed, which is the first
time this lane has used the GitHub artefacts API as an evidence source.

**What that does to the next dollar.** The spend that used to look obvious — a 164-pair pooled fold — cannot buy
the claim in its best case. The two shapes that can are 149 pairs and 592; the first answers "is a 5.4% break rate
believable" and the second answers "is 8% under the bar". Choosing between them is a claim about the content axis,
not a budget line, and it is the decision the next round has to make before anything is dispatched.

## Where the flywheel stands, 2026-11-19 (R157 read: the pay statistic double-counted the corpus)

**The one thing that changed.** `clearance` — the number this record has used for four rounds to say "the memory
does not pay" — divides the exchange rate by the corpus's own odds a second time, and its documented meaning is
false on committed data: three BIRD arms with a positive net (67/62, 78/67, 19/17) were carried as losses
(§PROGRESS 186, §AUDIT 34.204, §TECH-DESIGN 17.171).

| # | step | the number it needs | state |
|---|---|---|---|
| 1 | **a content axis graded against the pay predicate** | `pays` with a clustered interval that excludes zero | head of the queue, **and the axis is now named**: not coverage (AM.15, null) and not identifier naming (R31, null), but **contradiction** — Obsolete-FactConsolidation's 100%→44.6% from one competing statement. First cut is $0 on committed `injected` + `goldSql` |
| 2 | the pay predicate itself | `pays = repaired ≥ broken`, with the cluster count beside `n` | **done**: `pnpm eval:exchange`, census committed, drift gated |
| 3 | a reading large enough to decide | BIRD dev resolves ~±2pp at 11 clusters; train resolves ±0.7pp at 58 | **done, and it answers**: train −0.71pp [−1.26, −0.18] is the only resolved reading in the family, and it is a loss |
| 4 | the 149 / 592-pair folds | certify a 5.39% / 8.08% break rate | unchanged in price, but no longer the head: the content axis has to move `pays` at $0 first |
| 5 | BIRD dev 6,600 paired | ≈1pp resolution | unchanged; still the only lane whose resolution reaches 3pp |
| 6 | the four memory boards (LoCoMo, LongMemEval, BEAM, MemoryAgentBench) | a same-backbone comparable row | unchanged; Memory Tax and Retain-or-Consolidate both publish there and this record does not |
| 7 | the serving default | — | withdrawn (§PROGRESS 181); the switch stays as an instrument |

**The honest summary, eight bounds in.** The record now knows that its own pay statistic was deflated by the
corpus's parity (1.33–6.19× depending on corpus), that the only reading it has which resolves says memory loses
0.71pp, that its three apparent wins are all inside their intervals, and that the τ² "−4.64pp" it narrated for
two rounds was never a finding. Every one of those was computed from artefacts already in the repository, at $0,
by asking what each stored number *means* rather than whether it is significant.

**What that does to the next dollar.** Nothing should be dispatched until the contradiction axis is tested,
because it is the first axis since AM.15 that the literature predicts will separate harm from noise and it costs
nothing to test on rows already committed. If it separates, the next fold is sized against the rate it moves; if
it does not, the queue's answer is that BIRD's memory problem is construction (Memory Tax's 11–38% fact loss) and
not selection, and the fix is in the distill path, not in the gate.

## Where the flywheel stands, 2026-11-19 (R158 read: the pack does not compete, it generalises)

**The one thing that changed.** The content axis this queue has been promising for three rounds — "does the pack
assert something the gold contradicts" — was tested at **$0** on committed rows and **rejected**, with a mechanism
that redirects the queue: the store distils **210 statements for 7,000 questions**, 39 of them reach two or more
databases, and those 39 wholly compose **60.6% of packs** (§PROGRESS 187, §AUDIT 34.205, §TECH-DESIGN 17.172,
§COMPETITIVE AM.18).

| # | step | the number it needs | state |
|---|---|---|---|
| 1 | **an arm that changes the store's composition** | delivered statements whose spread is 1, on BIRD dev | **head of the queue**: the census says 60.6% of train packs are entirely cross-database boilerplate and that stratum loses −0.94pp [−1.50, −0.40]. The intervention is two halves — a serve-time filter that drops statements with spread ≥ 2, and a distillation policy anchored to the case's schema — and **neither can be read off the rows already bought**: the pack is an input to the outcome, so a filtered pack has no outcome until it is dispatched. One dev arm, **$0.95** at the recorded $0.00062/question, carries both |
| 2 | the contradiction axis | 127 contradictions of 7,000 cases, delta +1.57pp [−2.76, +6.38] | **done, and it rejects**: 1.8% of cases cannot carry a 0.7pp corpus effect, and the one resolved stratum in the census is the *non*-contradicted one at −0.76pp [−1.33, −0.17] |
| 3 | the store's warning share | 902 of 3,963 denials (23%) are warnings about the wrong method | **done, $0**: a sentence that inverts if read as a prescription is a defect no outcome reading was needed to find |
| 4 | a content axis graded against `pays` | a stratum whose interval excludes zero | **partly done**: composition gives one stratum that resolves (all-boilerplate, negative) and a gap that does not (−0.84pp [−3.64, +1.78]); the gap needs a fold with fewer clusters than strata differences |
| 5 | the 149 / 592-pair folds | certify a 5.39% / 8.08% break rate | **unchanged in price, displaced from the head**: a certification of the *current* store prices a store the census has just shown to be generic |
| 6 | BIRD dev 6,600 paired | ≈1pp resolution | unchanged; still the only lane whose resolution reaches 3pp, and now the natural home for row 1's distillation arm |
| 7 | the four memory boards (LoCoMo, LongMemEval, BEAM, MemoryAgentBench) | a same-backbone comparable row | **unchanged, and now with a stated reason to wait**: an end-to-end board row measures a store whose content is 60.6% boilerplate, i.e. it measures the boilerplate |
| 8 | the serving default | — | withdrawn (§PROGRESS 181); the switch stays as an instrument |

**The honest summary, nine bounds in.** Every content axis this record has tested is null — coverage (AM.15),
imported identifiers (R31), contradiction (R158) — and R158 is the first to say *why* in a way that is itself
measured: the store has almost no case-specific content to be right or wrong about. That converts a run of
inconclusive rounds into one finding about construction, and it moves the queue's head from selection (gates,
filters, admission) to distillation (what a statement is allowed to say). The next dollar is the first in several
rounds that buys a *different store* rather than a better reading of this one.

**What the four questions answer, this round.**

1. **Are the field's authoritative sets and boards complete?** For this lane's purpose, no: the four memory
   boards remain unrun (AM.16/AM.17), and no board measures store *composition*, which is the quantity R158 shows
   to be the binding one.
2. **The census of sets, stacks, metrics and token cost** is unchanged from AM.17 and is not extended here; what
   this round adds is a column the field does not publish — the fraction of a delivered pack that is about the
   case's own schema — computed for four arms at $0.
3. **Has microglia learned everything the leaders offer?** No, and the gap is now specific: their stores are
   *built* per corpus (Memory Tax's systems reach 73–81% on LongMemEval-s), while this store is a 210-statement
   generic curriculum. What has been learned and re-implemented is the measurement apparatus — clustered
   intervals, the pay predicate, drift gates — which is now ahead of what the papers publish.
4. **Can SOTA still be taken, and at what price?** Yes, but not by another reading. The shortest path is row 1:
   a composition-changing distillation arm on BIRD dev ($0.95, one day), then the 149-pair certification
   (≈¥8.6 / $1.2) or the 592-pass certification (≈¥32 / $4.5) once the store is worth certifying, then one memory
   board row (¥150–400). The critical path is row 1 and nothing before it.

## Where the flywheel stands, 2026-11-19 (R159 read: the harm is prescription, and it resolves once)

**The one thing that changed.** The content axis resolved. Reading the pack as a set of **prescriptions** rather
than denials — does it name machinery the answer does not use — gives **−1.83pp [−3.13, −0.51]** on 4,894 of 7,000
`bird-train` cases, with **+2.04pp [+0.26, +3.72]** for the 2,106 cases whose packs name only what the gold uses.
Same sign in all four arms; first resolved interval in this record's ten content axes. R158's denial axis and
R158's circulation interval are both retired in the same round (§PROGRESS 188, §AUDIT 34.206, §TECH-DESIGN 17.173,
§COMPETITIVE AM.19).

| # | step | the number it needs | state |
|---|---|---|---|
| 1 | **a distillation rule: a statement may name a construct only with the condition under which it applies** | unsupported statements per case, from 0.85 to ≤0.4 | **head of the queue**: the defect is measured and priced — 0.85 unsupported statements per case at −0.76pp each, so a rewrite that halves the count is worth **≈0.6–0.9pp**. It is a distillation change, so it needs one dev arm, **$0.95**, and that arm **cannot resolve it**: 11 clusters give ±4pp |
| 2 | a corpus with more databases | ≥40 clusters at dev scale | **the binding constraint, and the round's real finding**: 58 clusters resolve ≈1.5pp, 11 resolve ≈4pp, and the effect being chased is 0.9pp. No axis, filter or gate can fix this; only another corpus can |
| 3 | per-statement attribution | 39 of 210 screened, 4 resolved vs 1.95 expected | **done, $0**: the instrument exists and says no single statement is to blame; the two resolved negatives carry 0.36pp of the corpus's −0.71pp |
| 4 | the circulation axis | within-database −1.34pp [−3.58, +0.71] | **withdrawn**: R158's −0.94pp [−1.50, −0.40] compared databases while describing sentences |
| 5 | the contradiction axis | 127 of 7,000 cases, +1.57pp | **retired**: the field's conflict mechanism is absent from this store |
| 6 | the 149 / 592-pair folds | certify a 5.39% / 8.08% break rate | unchanged in price (¥8.6 / ¥32), still displaced: certifying the current store certifies a store that prescribes unconditionally |
| 7 | BIRD dev 6,600 paired | ≈1pp resolution | **promoted**: this is now the only affordable lane whose resolution reaches the effect size, and it is the first place a distillation rule can be tested at all |
| 8 | the four memory boards | a same-backbone comparable row | unchanged, and now with a sharper reason to wait: an end-to-end row measures the prescription |

**The honest summary, ten axes in.** Every axis that asked *whether the store is about this case* is null; the one
that asked *whether the store tells the executor to do something the answer does not do* resolves. That is a change
in the diagnosis, not yet in the system: the store's defect is unconditional prescription, the fix is a distillation
rule, the fix's effect is 0.6–0.9pp, and the corpus this record can afford resolves at 4pp. So the sequence is now
forced — **row 7 (BIRD dev 6,600 paired) before row 1 can be read**, and row 1 before the boards are worth buying.

**What the four questions answer, this round.**

1. **Are the field's authoritative sets and boards complete?** For this lane's purpose, no — and the round sharpens
   why. What is missing is not a board but a **resolution**: every board in AM.16 is sized to rank systems whose
   differences are 5–20pp, and this record's remaining effect is 0.9pp. The set that would help is a BIRD-scale
   multi-database corpus with ≥40 clusters at dev size, which does not exist as a public board.
2. **The census of sets, stacks, metrics and token cost** is unchanged from AM.17/AM.18. This round adds a column
   nobody publishes: per-statement harm with exposure and a clustered interval, computed for four arms at $0.
3. **Has microglia learned everything the leaders offer?** No. The leaders build a store per corpus (73–81% on
   LongMemEval-s); this store is 210 statements distilled once. The instrumentation is ahead — fixed effects, a
   multiplicity ledger, drift gates — and instrumentation is not capability.
4. **Can SOTA still be taken, and at what price?** Not on BIRD (20.9pp behind AskData) and not on τ² (no matched
   backbone). The reachable prize is the position this record already holds: the only system that can say *which
   sentence* cost what, with an interval. Defending that costs $0; extending it costs **¥30–150** for the BIRD dev
   6,600-pair lane (≈1pp resolution, the only lane that can see a 0.9pp effect), then **$0.95** for the distillation
   arm, then **¥150–400** for one memory board row once the store is worth ranking.

## Where the flywheel stands, 2026-11-20 (R163: the queue is a list of measurements, and one of the four candidates was never this repository's)

**What R160 established, and what R162 would not use before checking.** Twelve content axes have been null, and R160 stopped looking for a thirteenth
and tested why they were all null. A lesson can only transfer to a question whose answer already shares something
with the case it came from, so reuse is a ceiling on every content axis at once. Measured as the column overlap
between each case and its nearest neighbour inside its own database — question text only for retrieval, gold answers
only for measurement — the ceiling is **not** the constraint: median overlap is **0.500** and half the corpus shares
at least half its columns with a neighbour. What fails is the *predictive* reading of reuse: the highest band reads
**+2.69pp [0.00, +5.66]** on dev and **−1.04pp [−2.20, +0.18]** on train, which shares no database with dev and
resolves 0.92pp. **The verdict is `contradicted`, not `null`** — a sign flip cannot be blamed on power.

| # | step | the number it needs | state |
|---|---|---|---|
| 1 | **the recurring-defect lane: the headroom question, then the arm** | a `none` arm above the floor by more than 13.3pp | **the instrument is measured as of R162** (`alfworld` run 44644387139): all 134 games driven to termination twice, **floor 0/134 (Wilson [0, 2.8%])**, **replay 134/134 identical**, transcript **5,367 chars mean**, and the price is arithmetic over that (**¥0.0074/episode cached, ¥2.99 for 134 × 3 arms**, against ¥36.7 uncached). **Next: 20 games, one arm, ≈ ¥0.15** — not to price the unit, but to learn whether `none` lands far enough above zero to leave 13.3pp of room on this model |
| 2 | BIRD dev 6,600 paired | — | **withdrawn, with arithmetic**: dev has 11 databases and 1,534 questions, so 6,600 pairs on dev is the same eleven twice; 0.9pp needs 7,267 questions and a 7,000-question design lands at 0.92pp — a coin flip on the effect it was bought to see |
| 3 | the four memory boards | a store worth ranking | **withdrawn for the same reason as row 2**: the record already states that nothing about memory resembles the 9.26pp `linked` channel, so a board row buys a loss already predicted |
| 4 | a distillation rule (conditional prescription) | ≈0.6–0.9pp | **parked, not cancelled**: correct in diagnosis, unmeasurable on 11 clusters, and it is a change to a store whose corpus cannot show the effect either way |
| 5 | per-statement attribution | 39 of 210 screened, 4 resolved vs 1.95 expected | done, $0 — unchanged |
| 6 | the circulation axis | within-database −1.34pp [−3.58, +0.71] | withdrawn (R159), unchanged |
| 7 | the 149 / 592-pair folds | certify a 5.39% / 8.08% break rate | unchanged in price (¥8.6 / ¥32), displaced behind row 1 |

**The honest summary, thirteen axes in.** Every axis asked *whether the store is about this case* and was null. R159
asked *whether the store tells the executor to do something the answer does not do* and resolved, but could not be
made to pay. R160 shows why both are true at once: the corpus does admit reuse, and reuse does not predict where the
pack pays. That is not a property a better store can fix and it is not a property a bigger sample can overturn — it
is the wrong task family for a mechanism whose premise is that a defect recurs. The record's own positive result,
100.00% against 31.79% on a corpus built to repeat its defects, has been sitting in this repository the whole time
and has never been converted into a public number.

**What R162 changed, in one paragraph.** The lane stopped being an estimate. Two numbers were assumptions and are
now measurements: a floor of exactly zero over 134 games, and a split that replays 134 of 134 with the same seed.
The third — the price — became arithmetic over a measured transcript and moved by a factor of twelve, from ¥36.7
to ¥2.99 for three arms, for a reason that is a property of the arm rather than of the provider: a transcript
appended to keeps a stable prompt prefix and hits the cache, while a pack re-injected on every turn moves the
prefix and misses. The axis also moved. Twelve rounds asked whether a store is *about* this case; ExpeL, the
strongest published system in this line, never injects at all — it renders a twenty-rule list whole into every
prompt and retrieves trajectories. A rule that is always present cannot be present for the wrong question, so the
failure R159 measured is structurally unavailable to it, and the registered comparison is `none` / `always-in` /
`retrieved` rather than a dose. **Of its three predictions, one is unresolvable at 134 games** — a 5pp form
difference needs 942 episodes — and the registration says so rather than letting a null be read as a finding.

**Where microglia sits on the board, stated exactly.** In the parameter-free row of the ALFWorld table (AM.22),
the published numbers run 59.0 (ExpeL) to 80.60 (a graph-memory FSM), and the same ExpeL baseline is reported at
59.0 / 64.20 / 72.4 / 75.37 by four different papers — a 16.4-point spread where the treatment being quoted is 8
to 26 points. The row above it, 72.4 to 96.64, is reinforcement learning and distillation, which updates weights
and is not this project's axis. **microglia has no number on that board, and will not get a comparable one by
running a larger sample**: what it can produce, and no paper in the row produces, is a paired delta under one
model and one split with a cluster bootstrap interval, a per-arm token bill, and the trajectories. That artefact
is the contribution, and it is publishable before any arm beats anybody.

### Candidate registry — the four names from the last report, sorted by whose work they are

A previous round's report listed four competitor mechanisms as R164+ candidates without first asking which side of
the microglia/cortex boundary each one sits on. That question has a test — **the score its authors report** — and
applying it found one of the four to be the substrate's work, one already registered and priced, one whose name had
been attached to the wrong system, and two whose published effect this split cannot resolve at any price.

| candidate | the unit it changes | side | registered | its own delta | episodes needed | cost at 2 arms |
| --- | --- | --- | --- | --- | --- | --- |
| `always-in` rule list (ExpeL, ported) | the prompt carries the whole list | microglia | AM.22 | 19.0pp | 65 | **¥2.99** (3 x 134) |
| workflow abstraction (AWM) | instance values to typed slots | microglia | AM.23 | +12.0pp (WebArena) | 164 | ¥2.4 + code |
| exemplar memory (Synapse, ICLR 2024) | which trajectories are shown | microglia | AM.23 | +12.0pp class | 164 | ¥2.4 |
| two-section pack (H2R) | the pack's sections | microglia | AM.23 | +3.5pp | **1,923** | ¥28.5, and the sample does not exist |
| graph-ordered pack (FSM) | the order items render in | microglia | AM.23 | +5.23pp | **861** | ¥12.7, and the sample does not exist |
| dual-layer associative memory (Synapse, ACL 2026) | the substrate's structure; LoCoMo F1, no task score | **cortex** | AM.23 | LoCoMo F1 40.5 | not a paired task delta | not this repository's |
| reflection chain (ExpeL, the ALFWorld branch) | the prompt carries a prose critique of the previous attempt at *the same task* | microglia | AM.24 | 19.0pp in the branch's own setting | **0** — it needs repeated trials of one task, and this split gives one attempt per task | not purchasable in this design |

**The row that matters is not the money.** 1,923 episodes at ¥0.0074 each is ¥28.5 for two arms — affordable. The
problem is that **1,923 episodes do not exist**: the held-out split is 134 games, and repeating 134 games fourteen
times reduces run noise without adding one independent sample. Fourteen passes of the same 134 games produce a
tighter estimate of the *same* 134 games difference, not the power to see a 3.5-point one. The only two ways to
obtain more episodes are the train split, which ExpeL consumed to write its rules, and a different benchmark, which
is not the same measurement. **So the H2R and FSM effects are not expensive here — they are unmeasurable here**,
and writing them into a queue as candidates with a price tag would have hidden that behind a number that looks
purchasable.

**What the registry is for.** It states that the queue is a list of *measurements* rather than a list of
*competitors*, and it is checked by CI (`scripts/check-docs.mjs`): every row names a side, and every `AM.n`
reference resolves to a heading in `COMPETITIVE.md`. A candidate that cannot fill in the `side` column has not been
read yet; one that cannot fill in `episodes needed` has not been priced; and one whose side is `cortex` is not this
repository to build, however much it looks like memory management.

**What R163 corrected, and what it cost.** The R162 report ended with four competitor mechanisms offered as
R164+ candidates. Reading them — which the report had not done — found three things. **"Synapse's contrastive
retrieval" names a mechanism that does not exist**: there are two systems called Synapse, one reporting MiniWoB++
99.2% from trajectory-as-exemplar retrieval by embedding similarity (ICLR 2024), the other reporting LoCoMo F1 40.5
from a dual-layer associative memory with spreading activation (ACL 2026). **That second one is cortex's**, and it
would have been built here. **AWM was already registered and priced** as P2 in Appendix X.2. And **two of the four
carry published effects smaller than this split can resolve at any price** — the FSM's +5.23pp needs 861 episodes and
H²R's +3.5pp needs 1,923, against 134 games, and repeating 134 games does not add one independent sample.

The rule that prevents a repeat is a test rather than a taxonomy: a mechanism is **cortex's** when its authors report
a score on a question asked of the store independently of any task, and **microglia's** when they report a task
success rate under a fixed model and prompt skeleton. Applied, it leaves four microglia rows, **three of which are
rendering decisions** — a two-section pack, a graph-ordered list, a workflow placeholder are all `renderPack()` work
over items `recall()` already returns, and `shape-fold.ts` settled the same question in R109 by choosing delivery
because it changes one thing.

**And the queue is now checked.** `ROADMAP.md` carries a `### Candidate registry` and `scripts/check-docs.mjs` fails
the push unless every row names a side, cites exactly one resolvable `AM.n`, and states an episode count — three
deliberate breaks were used to verify it, and it then failed on this round's own prose before passing.
`.github/workflows/docs.yml` runs it; its first run is `44656232936`, success. **That is the first workflow this
repository has had since 2026-10-20**, when the docs/product split removed `ci.yml` — so every round's "CI is green"
in between was a statement about one repository and vacuous about this one (AUDIT 34.214). Cost of R163: **¥0**.

**What the four questions answer, this round.**

1. **Are the field's authoritative sets and boards complete?** No, and the gap has a name now: every board in AM.16
   is **one-shot** — BIRD, τ², LoCoMo, LongMemEval all score a system on tasks it has not seen — while the mechanism
   under study is *learning across repeats*. The missing instrument is a recurrence board, not another accuracy
   board. ALFWorld is the closest public procedure and it is a game, not a ranking.
2. **The census of sets, stacks, metrics and token cost** is unchanged from AM.17/AM.18 except for one column this
   round can now fill: **does the corpus admit reuse** (median 0.500 on BIRD, 50.1% of pairs at ≥ half). No published
   paper reports that column, and two 2025 papers — Xiong et al. and MemCollab — assume it.
3. **Has microglia learned what the leaders offer?** Partly. Xiong et al.'s selective addition and history-based
   deletion are the field's best remedies and both need a **quality** signal that only exists after execution on a
   recurring defect; MemCollab's contrastive distillation needs two backbones. This record has the instrumentation to
   test either and has not yet had a corpus on which the test means anything.
4. **Can SOTA still be taken, and at what price?** Not on BIRD (20.9pp behind AskData) and not on τ² (no matched
   backbone). The reachable prize is unchanged and now better founded: the only system that can say *which sentence*
   cost what, with an interval, **and** the only one that has measured whether its corpus could carry a lesson at
   all. Extending it costs **¥40–120** for one recurring-defect family, with the price published first.



## Where the flywheel stands, 2026-11-20 (R163b: the arm exists before it is paid for, and its prefix was counted wrong)

**What this round built.** `eval/drivers/alfworld/agent.py` — the loop the registration described and did not have.
Three arms over one skeleton: `none`, `always-in` (the whole bank, rendered once per episode, above the examples),
`retrieved` (the entries a lexical anchor admits). The skeleton is the competitor's, transliterated from the same
file the few-shot transcripts come from, so an arm changes what sits above the transcript and nothing else.

| # | step | the number it needs | state |
|---|---|---|---|
| 1 | **20 games, one arm, the headroom answer** | whether `none` lands above the floor by more than 13.3pp on this model | **unblocked this round**: the loop exists, the prefix is measured per episode, and `--policy seed` reproduces `floor.py` game for game. **Next: the ≈ ¥0.15 calibration**, and its first two readings are `invalid_actions` and `thoughts`, not the score |
| 2 | three arms x 134, sharded | `always-in - none`, at ExpeL's 19pp | **unblocked once 1 is read**, and now dispatchable: `--shard i/n` tiles the split with no overlap, model passes are concurrent, and each slice reports its own `usage` |
| 3 | the reflection arm | — | **registered as unavailable** (AM.24): ExpeL's ALFWorld mechanism needs repeated trials of one task, and this split gives one attempt per task |
| 4 | everything from the previous queue | unchanged | unchanged; rows 2–7 of the R163 queue are not moved by this round |

**Three zero-cost readings, and the one that made them worth having.** The loop reproduces the floor under
`--policy seed` (eight games, every field, an `agreement` job that fails on one mismatch); 81 unit tests cover the
split, the parser's four branches, the shard arithmetic, the bill and the loop itself, at 99% statement coverage
with `sys.exit(main())` the only uncovered line; and a test asserts that `none` and `always-in` differ at exactly
one message index. **The middle reading is what makes the pattern worth copying**: `floor.py` walks a game with its
own loop and `agent.py` walks it through `run_episode`, the function the model arms use, so agreement is a
statement about the loop rather than about a policy. A defect shared by all three arms is invisible to arm-against-
arm comparison and is exactly what that job catches.

**Two defects, both found by tests, both of the same family.** The prefix the registration quoted was wrong in
**four of its six rows** — the mean was 3,574 and is **3,965**, 11% low, and both arm prices were computed from it
(AUDIT 34.215). The cause is the same one as the layer table in 34.212: the number was produced by reading a file
in a session that then ended, so nothing in the tree could count it. The repair is the same shape: the twelve
transcripts are committed with their source blob, and a test pins all six counts. And the `retrieved` arm's lexical
anchor matched on `the` and `is`, which made **every** entry overlap **every** observation — the `retrieved` arm was
`always-in` with extra steps, and the registration's second prediction would have come back a clean, false null
(AUDIT 34.216).

**What changed about the board, and what did not.** Nothing about it: microglia still has no number on the ALFWorld
row, and this round did not produce one. What changed is that the thing which would produce one now exists, is
asserted at zero cost, and reports the counters that say whether it measured memory or syntax. **The 19pp this arm
is looking for is 65 episodes at 30% discordance**; the split has 134, so if `none` lands high enough to leave room,
the first prediction is resolvable in one pass at about **¥3** for three arms.

**Cost.** `¥0`. No dispatch, no model call: the two policies that ran cannot call one, and the three CI jobs that
asserted the loop made zero calls by construction. The expensive version of this round is the one where the loop is
written while the calibration is running, and the prefix turns out to have been counted from the wrong strings —
which is what the round found, before it could cost anything.

## Where the flywheel stands, 2026-11-20 (R163c: the control is 11 of 20, and the paper's baseline is below ours)

**The headroom question is closed.** `none` scores **11 of 20 = 55.0%** (Wilson [34.2, 74.2]) against a floor of
exactly 0, so the 13.3pp the split needs of it exists and prediction 1 is measurable in one pass. The reading cost
**¥0.28** and is the first number in this record whose bill was counted by the provider rather than modelled.

| # | step | the number it needs | state |
|---|---|---|---|
| 1 | the header question: does `none` leave room | 55.0% against a 0% floor | **done**, R163c. 15 points above ExpeL's own 40.0 control, so expect a smaller delta than the paper's |
| 2 | distil a rule bank from `valid_seen` | a bank of ≤20 rules with the competitor's maintenance arithmetic | **next, ≈ ¥2.5**: 140 games at the measured ¥0.014 each, plus the extraction calls. Blocked by nothing |
| 3 | three arms x 134, twelve jobs | `always-in - none`, at whatever the bank yields | **after 2**, ≈ ¥5.71 measured: 24 minutes per slice across four, 94 minutes on one runner |
| 4 | the object-location pack | 20.5% of actions are refused; a pack that removes a third is worth ~6 points of turn budget | **registered, not built** (34.220). It needs its own arm: handing the model the admissible list would make `none` a treatment |
| 5 | the reflection arm (ExpeL's ALFWorld branch) | — | **unavailable** (AM.24): needs repeated trials of one task; the split gives one |

**What the 55.0% does to the queue, stated plainly.** Three of the four candidates in the registry carry published
effects smaller than 13.3pp on a 134-game split, and two of them need samples that do not exist. With the control at
55% rather than 40%, the room above it is 45pp and the room *below the ceiling* is what an intervention has to work
in: a 19pp effect would put the treatment at 74%, which is inside the Wilson interval's upper bound for the control
itself. **The first arm's result may therefore be a null for a reason that has nothing to do with memory**, and that
is now a recorded expectation rather than a post-hoc explanation.

**Cost of the round.** ¥0.45 across three dispatches: ¥0.28 for the calibration, ¥0.14 for the dispatch that found
the loop could not represent a model giving up, ¥0.02 for the diagnostic that separated a spent budget from a lost
game. The two defects were cheaper than the reading, which is the order they should be found in.

### Out of scope, handed off — the three rows that left this queue

`AUDIT.md` 34.221. The candidate registry above lists mechanisms by **the score their authors report**; three of the
four names a previous report offered fail that test for this repository, and they are recorded here rather than
deleted, because a queue that silently loses rows is a queue nobody can audit.

| what left | where it went | the question it must answer there | why not here |
| --- | --- | --- | --- |
| dual-layer associative memory + spreading activation (Synapse, ACL 2026) | `AgentiX-E/cortex`, via a handoff prompt | of the −95% tokens, how much is "keep the top-k" and how much is "the activation selects better"? | it reports LoCoMo F1 40.5 — no task, no prompt skeleton, so no arm of this lane could read it |
| high/low separation with different half-lives (H²R) | same | does separating layers make the decay schedule more accurate? (one layer against two, same FSRS parameters) | direct-to-store score; and its +3.5pp needs 1,923 episodes against a 134-game split |
| cortex's own baseline recomputation (LongMemEval 83.55) | same | which split, which commit, which budget — and can it be reproduced from zero? | a number this repository cannot check is a number it should not be quoting |

**What stays here, and is not negotiable.** `renderPack`, `shapeFold`, the MMR ordering and the rule bank are this
repository's, because the pack's **position in the prefix** decides whether the provider's cache holds it, and that
is a delivery decision measured in yuan in this lane (R57 Amendment 4: a per-turn pack cost 3.7× the control's
uncached tokens on the same sixteen calls). A substrate that rendered its own pack would move numbers reported here
from a repository whose CI does not run this one's tests.

### R164 — what the queue looks like now that the bank has a producer

The registry above is unchanged in its rows and the prices in it are the ones this round measured. What changed is
that row 2 is no longer a plan:

| # | step | the number it needs | state |
|---|---|---|---|
| 2 | distil a rule bank from `valid_seen` | a bank of ≤20 rules with the competitor's maintenance arithmetic | **built, not yet run**: `distill.py`, 19 shared vectors, 99% coverage, four-slice training job + merge job in `alfworld.yml`. ≈ **¥2.1** |
| 3 | three arms x 134, twelve jobs | `always-in - none` | **waiting on 2**, **¥5.71** measured |
| 4 | the object-location pack | 20.5% of actions are refused; a third of them is worth ~6 points of turn budget | **registered, not built** (34.220) |
| 5 | the reflection arm | — | **unavailable** (AM.24) |

**And one row is now honest about its own weakness.** The bank is ExpeL's `all_success_existing_rules` path only:
its first criticism — a successful trial against failed attempts at the same task — needs repeated trials that this
split does not have, so the treatment being measured is the competitor's extraction **minus its contrast**. That is
noted in `REGISTRATION.md` where the prediction is made, which is the only place a limit can be noted before a
number arrives rather than after.

### The chain is in flight

Run `44685314225` holds until 10:00 UTC and then runs the training pass, the bank and the sweep in one dispatch, so
the three-arm reading arrives without a human between the bank and the arms. Prices and the off-peak reasoning are
in `PROGRESS.md` 197.6; the off-peak total is **¥7.77** against **¥15.54** at peak, which is why the runner waits.

### R166 — The queue reordered by what three 2026 papers made testable, and one row demoted with its reason

The registry's rows have always been ordered by the size of the effect their authors report. Three papers published
between May and October 2026 make claims about **where** a reused experience hurts, which is a different kind of
row: it can be tested on games already paid for. The queue is reordered around that, and one row is demoted with
the arithmetic that demotes it rather than deleted.

| # | step | the number it needs | state | price |
|---|---|---|---|---|
| 1 | the three-arm chain in flight | `always-in − none`, `retrieved − none` at 134 paired games | **in flight**, run `44685314225`, holding until 10:00 UTC | **¥7.77** committed |
| 2 | the same reading decomposed | engagement, harm share, hard/easy strata, six kinds | **built**, 41 tests, 99% branch; computed by `aggregate.py` at ¥0 from row 1's artefacts | ¥0 |
| 3 | the placebo arm | does the bank's *content* do anything, or its shape | **built** (`--arm sham`, 11 tests), **dispatch gated**: run iff `|delta| > mde`, because a sham has nothing to imitate when there is no effect | ≈ ¥1.9 |
| 4 | `retrieved(k=3) − retrieved(k=1)` | AMD's k=1 optimum, never tested on this corpus | **dispatchable**: `arms: ["retrieved"]` with `top_k: 1`, both now workflow inputs | ≈ ¥1.9 |
| 5 | the overlap gate (MemTrim's read-time rule) | `arXiv:2610.07311`: harm peaks at intermediate query-memory overlap, and removing repeated or conflicting evidence at read time recovers most of it | **not built.** It is a *selection* rule, which is this repository's layer, and it is the one repair whose mechanism is named in the paper rather than inferred | ≈ ¥1.9 per arm after row 1 |
| 6 | the object-location pack | 20.5% of actions are refused | **demoted, not deleted.** 138 of the 149 refusals were well-formed commands for a world the model was not in — instance identity inside one house, which no cross-house memory can carry. A prior over object kinds changes *search order*, not *which instance exists*, so its ceiling is the share of refusals caused by order rather than by identity, and that share is unmeasured | ≈ ¥1.9 |
| 7 | the reflection arm (ExpeL's ALFWorld branch) | — | **unavailable** (AM.24): needs repeated trials of one task; the split gives one | — |

**Why row 6 is demoted rather than row 3.** A placebo is a control for a mechanism this lane is already paying to
run, and a control that arrives after the mechanism has been reported is a control nobody reruns. An
object-location pack is a *new* mechanism whose expected effect is bounded by an unmeasured quantity (the share of
refusals that ordering can fix) and whose failure mode — "the model already knows where mugs live" — is the most
likely outcome. The placebo is the cheaper way to learn something that changes what row 1 means.

**What the literature closes outright.** `arXiv:2604.27003`'s forgetting and retrieval-diversity results need a
stream of tasks with memory accumulated across it; this lane distils once and evaluates once. Those rows are not
queued, they are unavailable, and 34.213's rule applies to them the same way it applied to H²R's +3.5pp: a number
from a design this lane does not implement is a number it should not quote.

**Parallelism.** Rows 2 and 3 need row 1's artefacts; row 4 needs row 1's bank but not its delta (the bank is a
file, and a k=1 arm can be dispatched against it independently); row 5 needs the bank and a read-time rule; row 6
and 7 are blocked on arguments rather than on data. So the critical path is row 1 → row 2 → row 3, and row 4 can
run beside row 3 on separate runners at ≈ ¥1.9 each.

**And the row the field's strongest prompt-only competitor implies, which is not in the table above.** ALMA
(*Learning to Continually Learn via Meta-learning Agentic Memory Designs*, ICLR 2026 RSI) does not add a mechanism:
it **searches over memory designs expressed as code**, and reports 87.1% on ALFWorld against 80.0% for the best
hand-written baseline, at $0.09 of construction per run and 1,319 tokens injected per task. Everything this
repository has built is hand-written — `renderPack`, `shapeFold`, the MMR ordering, the bank — and every knob in it
was chosen by argument rather than by search. The cheapest analogue of ALMA available here is not a meta-agent: it
is a **search over the pack's own knobs** (k, the gate, entry order, header wording, where in the prefix the block
sits), scored on the bank's own 134 paired games. That is a campaign of ≈ ¥1.9 per configuration, seven or eight
configurations, ≈ **¥15** — and it is the only row in this document that is a *design* gap rather than a mechanism
gap. It is not scheduled this round because it needs a bank and a delta to search around, which is row 1.

### R168 — The queue after a repair, and the two rows the repair created

The chain did not produce a delta: it produced four defects, one of which (a shard that was a sample) invalidated
every sliced reading the lane had. The queue is therefore re-based on a re-dispatch rather than on a readback.

| # | step | state | price |
| --- | --- | --- | --- |
| 1 | re-dispatch the chain: four sorted training slices, one bank, twelve sweep jobs | **dispatched once CI is green on `1b3b36c5`** | ≈ ¥7.69 |
| 2 | the decomposition of that reading (engagement, harm share, hard/easy, six kinds) | **built**, ¥0 from row 1's artefacts | ¥0 |
| 3 | the placebo arm, iff `\|delta\| > mde` | **built, gated** (R165 amendment 1) | ≈ ¥1.9 |
| 4 | `retrieved(k=1) − retrieved(k=3)` | **dispatchable**; AMD's optimum, untested here | ≈ ¥3.8 |
| 5 | the overlap gate (MemTrim's read-time rule) | **not built**; the one repair whose mechanism is named in a paper | ≈ ¥1.9 per arm |
| 6 | the pack-knob search (ALMA's analogue) | **not built**; needs row 1's bank and delta | ≈ ¥15 |
| 7 | `floor.py`'s unit coverage, 31% → ≥95% | **registered gap** (199.6); its real-run gate is the `floor` job at ¥0 | ¥0, one round |
| 8 | a tiling assertion over *training* artefacts in `aggregate.py`, not only in `distill.py` | **built in `distill.py`**; the same check on the sweep's side is `tile()`, which already refuses | ¥0 |
| 9 | the object-location pack | **demoted** (R166): 138 of 149 refusals are instance identity inside one house | ≈ ¥1.9 |

**Row 7 is new and is a debt, not a plan.** A file whose correctness rests on a real run is not covered by a unit
test, and this record has already been burned once by a check that was satisfied by the thing that was wrong. The
`floor` job is a genuine gate — 134 games, two policies, ¥0, every push — but it is a gate on the *corpus*, not on
`floor.py`'s own branches, and the difference should be written down rather than assumed away.

**What row 1 no longer has to prove.** R167 recorded that this lane cannot defend an absolute score against Board B.
Row 1 does not try: it produces a paired delta, the games both arms drove, and the number of retries each arm needed.
The first two are the conditions under which a delta means anything; the third is the condition under which it will
reproduce.

### R169 — The queue after a positive result, ordered by measured headroom rather than by published effect size

The queue used to be ordered by the size of the effect other people reported. It can now be ordered by the size of
the effect this lane has *not yet* captured, which is a different and better quantity.

| # | step | the number it targets | state | price |
| --- | --- | --- | --- | --- |
| 1 | the placebo arm (`--arm sham`) | whether +14.2pp is four rules or the shape of a block | **built**, licensed by `\|delta\| > mde` (14.18 > 14.03) | ≈ ¥1.9 |
| 2 | the read-time overlap gate (`--gate-share`) | **9.7pp**: the strata say a gate that fires only on hard observations turns +14.2 into +23.9 | **built**, not dispatched | ≈ ¥1.9 |
| 3 | `retrieved(k=1) − retrieved(k=3)` | retrieval admitted 2.9 of 4 rules, so it cannot select; `k=1` forces a choice | **dispatchable** | ≈ ¥1.9 |
| 4 | a bank that is not saturated | the loop spent 28 of 40 operations agreeing; the distillation, not the retrieval, is the binding constraint | **not built**: needs a different chunking or a success criterion that resists agreement | ≈ ¥1.9 per attempt |
| 5 | the pack-knob search | every knob (k, header, position, order) was chosen by argument | **not built** | ≈ ¥15 |
| 6 | `floor.py`'s unit coverage | 31%, with a ¥0 real-run gate as its substitute | **registered gap** (199.6) | ¥0 |
| 7 | the object-location pack | the model's own rule 2 is this mechanism; 138 of 149 refusals are instance identity | **demoted, corroborated** | ≈ ¥1.9 |

**Rows 1–3 are all ¥1.9 and all answer a question the reading created.** They can run in parallel on separate
runners; the only sequencing constraint is that each needs the same committed bank, which is now an artefact of run
`44754440122` and should be committed before any of them is dispatched.

**Row 4 is the one this round made unavoidable.** A four-rule bank that saturates after four critiques is not a bank
that can be retrieved from, gated, or searched over — it is a bank whose *producer* stopped learning. Until the
distillation loop can produce more than four non-overlapping rules from 140 trajectories, rows 2, 3 and 5 are all
tuning a mechanism whose input is four sentences.

**And the one row that is now cheaper than it was.** The gate in row 2 was justified by a paper. It is now justified
by this lane's own strata: 32 rescued, 13 spoiled, and a measured 9.7-point gap between the pack as applied and the
pack as it would need to be applied. That is a target rather than a hypothesis, and it is the first time this document
has had one.

## Where the flywheel stands, 2026-11-20 (R169/R170: the delta replicates, the bank does not, and the queue reorders itself)

Two sweeps have now come back from two independent distillations of the same corpus. The order below is what the
*second* one changed, and it moves two rows up and one row sideways.

| # | the measurement | what the two replicates say | state | price |
| --- | --- | --- | --- | --- |
| 1 | the placebo (`sham` vs `none`) | +14.2 and +14.9 pp both survive nothing until shape is ruled out: three of six rules are advice about how to think | **in flight** (`44763220821`) | ≈ ¥1.9 |
| 2 | the read-time gate (`--gate-share 0.2`) | *moves up*: with six rules, `k=3` is a real choice and it costs 7.5 pp; the gate is the only arm that can decline to inject | **built**, dispatchable once a bank is committed | ≈ ¥1.9 |
| 3 | `retrieved(k=1)` against `k=3`, on the **six**-rule bank | *moves up*: the four-rule bank made `k=3` a 3-of-4 no-choice and hid the problem; the six-rule bank is the first where `k` matters | dispatchable | ≈ ¥1.9 |
| 4 | a bank larger than six rules | *moves sideways*: the loop saturated at 4 in one pass and 6 in the other, and more rules made retrieval **worse**, so "bigger bank" is not a goal — "a bank whose rules are distinguishable" is | not built | ≈ ¥1.9 per attempt |
| 5 | the pack-knob search (ALMA's analogue) | unchanged, and still last: searching knobs over a six-sentence bank is tuning the input, not the mechanism | not built | ≈ ¥15 |
| 6 | `floor.py`'s unit coverage | unchanged, 31%, with a ¥0 real-run gate as its substitute | registered gap | ¥0 |

**What the reordering rests on.** The `retrieved@k3` arm scored **exactly** `always-in`'s 99/134 when the bank held
four rules, and **7.5 pp below the control** when it held six. That is not noise between replicates; it is the arm's
own definition doing different work at two bank sizes. A reader of the first sweep alone would have concluded that
retrieval neither helps nor hurts. A reader of the second alone would have concluded it hurts. Both readers would be
wrong, and the pair is what says so.

**The one thing that did not move.** The paired delta: +14.18 and +14.93. Two distillations, two banks, two runs,
one effect — and the control moved 6 pp under it. Whatever else is unresolved, "carrying the bank beats not carrying
it by about 14 points on 134 games" is now a replicated measurement rather than a single reading.

**And the honest entry.** The bank's *content* is the weakest link in all of this: three of the six rules are about
how to think rather than about the world, and the one rule with the most votes (12) is "use the think step to plan".
If the placebo comes back at +10 pp, the finding is not "experience reuse works" but "a longer prompt of any
kind works", and the row that would then lead the queue is a length-matched *content* control — the same bank with
its rules replaced by other rules from the same corpus that the control never lost on.

### The placebo came back, and the queue is now one experiment deep (2026-11-20, 16:00 UTC)

The row above said: *"if the placebo comes back near +10 pp the finding is not 'experience reuse works' but 'a longer
prompt of any kind works'."* It came back at **+17.9 pp** — higher than the intact bank — so the finding is the
second one, and the queue collapses to a single question:

> **Does any of the 15–18 points depend on what the block says?**

| rank | experiment | why it is the only one that matters now | price |
| --- | --- | --- | --- |
| **1** | **a bank distilled from `cool`+`heat` only, scored on all 134 held-out games** | same shape, same header, same length, different vocabulary, rules true but inapplicable where they are scored. If the `put`/`clean` games move, the block is the mechanism and this lane is measuring prompt engineering | ≈ ¥2.0 |
| 2 | `--gate-share 0.2` on the six-rule bank | the one arm that can decline to inject; explains the −7.5 | ≈ ¥1.9 |
| 3 | `retrieved(k=1)` on the six-rule bank | whether selection helps when it is forced to choose one | ≈ ¥1.9 |
| 4 | a knob sweep over header, position and count | how much of the 15–18 is knob choice, which is what ALMA's meta-agent searched | ≈ ¥15 |
| 5 | `floor.py` coverage (31%) | unchanged, ¥0, and it is the gate on everything above | ¥0 |

**Rank 1 needs one thing that does not exist yet**: a way to distil from a *subset* of the training artefacts by task
kind. `distill.py` reads every episode it is given and `agent.py` already classifies each game into one of the six
kinds, so the feature is a filter and a test, not a new mechanism. Until it exists, rank 1 cannot be dispatched — and
every other row is tuning a mechanism whose contribution is currently indistinguishable from a shuffle.

### R170 — The queue is re-based on a question the placebo created, and the memory rows are demoted with their reason

The R169 queue was ordered by which memory mechanism to try next. The placebo removed its premise: the effect is a
block's form, so tuning rules, retrievers or gates tunes something that is not doing the work.

| # | step | the question | state | price |
| --- | --- | --- | --- | --- |
| 1 | a **neutral declarative** block, same token count | is imperative *grammar* what helps | not built | ≈ ¥1.5 |
| 2 | a **filler** block, same token count | does *any* block help, or only one that reads as instructions | not built | ≈ ¥1.5 |
| 3 | no block, task line reworded to sound procedural | can the effect be had for free | not built | ≈ ¥1.5 |
| 4 | the object-location pack, as **facts** | the bank's four rules are procedures the model already knew; facts are the content it cannot infer | not built, and **promoted**: it is now the only arm on the list that carries information rather than tone | ≈ ¥1.9 |
| 5 | the read-time gate | 9.7pp of headroom — **conditional on row 1 or 2 showing the block's form is necessary** | built | ≈ ¥1.9 |
| 6 | `retrieved(k=1)` | retrieval admitted 2.9 of 4 rules and could not select | dispatchable | ≈ ¥1.9 |
| 7 | a bank that is not saturated | the loop spent 28 of 40 operations agreeing | not built | ≈ ¥1.9 |
| 8 | the pack-knob search (ALMA's analogue) | every knob was chosen by argument | not built | ≈ ¥15 |

**Rows 1–3 are the cheapest and the most decisive, and they were not on any previous roadmap.** They cost less than
the item they displace and they decide whether the next two years of this programme are about memory or about
instructions. A lane that keeps tuning a rule bank after learning its rules are inert has stopped doing science.

**Row 4 is promoted rather than demoted, and the reason is the placebo's.** The four rules are procedures a competent
model already knows, which is why destroying them costs nothing. Facts about where objects live in a house family are
not procedures and cannot be inferred from the observation — and the model's own rule 2 ("prioritize locations where
similar objects have been observed") is a procedural proxy for exactly that knowledge. If a pack of facts moves the
score where a pack of procedures does not, the flywheel has something to distil; if it does not, the honest conclusion
is that this corpus rewards tone rather than knowledge, and the product is a preamble.

**What rows 5–8 still are.** They are not deleted, because the block's form being sufficient does not make it
necessary: a gate that fires only on hard observations is worth 9.7 points *of the block's effect*, and if rows 1–3
show that the effect needs imperative form, the gate is still the way to keep the rescue and lose the spoiling.

## R171 — The queue is one contrast, it is in flight, and two of its rows can end the programme

The R170 queue was written before the cross-kind bank existed. That bank arrived, cost ¥0.035, and **voided itself
on the condition its own registration had written**: four of its five rules were the `put` → `move` workaround, the
open-the-container note and the search order, all of which apply to the games they were meant not to apply to. A bank
distilled from cooling and heating trajectories is a bank about placing objects, because placing is how every
trajectory ends. The ¥2.0 sweep was therefore not bought (PROGRESS 203).

What replaced it is the same question without distillation, and it is running now.

| # | experiment | the question it answers | state | price |
| --- | --- | --- | --- | --- |
| **1** | **a hand-written filler block**: same header, same per-entry lengths (255/245/306/301 against 254/248/309/292), same imperative form, no word about the task | **does the content of the block matter at all**, or only that a block of instructions exists | **in flight**, run `44779423772`, 134 games × 2 arms | ≈ ¥2.0 |
| 2 | a neutral **declarative** block, same length | is it relevance, or imperative grammar | not built; licensed only if row 1 lands at zero | ≈ ¥1.5 |
| 3 | no block, task line reworded to sound procedural | can the effect be had for free | not built; needs a driver change, so it is the most expensive of the three to *build* | ≈ ¥1.5 |
| 4 | the object-location **facts** pack | the four rules are procedures the model already knew; facts it cannot infer are the only content left that could matter | not built, still promoted | ≈ ¥1.9 |
| 5 | the read-time **gate** (`--gate-share 0.2`) | 9.7pp of headroom: the rescue without the spoiling | built and gated on rows 1–2 | ≈ ¥1.9 |
| 6 | `retrieved(k=1)` | whether selection helps when it is forced to choose one rule | dispatchable | ≈ ¥1.9 |
| 7 | `floor.py` coverage | the arm every price rests on | **done**: 31% → 99%, 39 cases, one real p90 defect found (PROGRESS 202) | ¥0 |

**Two of these rows end the programme rather than extend it, and that is the point of running row 1 first.** If the
filler block clears the placebo's interval — the same +9 to +27 pp from a block of typewriter maintenance — then the
mechanism is the existence and shape of a preamble, content and vocabulary are both inert, and no further memory
work in this lane is warranted. The product would be a preamble, and the engineering that follows is *where and when*
it is injected (row 5, repurposed from a rescue to a cost control). If it lands at zero while `always-in` stays where
it was, then relevance is required, the placebo needs a second explanation, and rows 2, 4 and 6 come back to life.

**What is not on the list, and the reason it is not.** The rule-bank line — new banks, better distillation, a
retriever that selects well — stays paused. Nothing about it can be interpreted while the block's content is
indistinguishable from a shuffle, and the last two days have produced two independent demonstrations of that
(+17.91 pp from a permutation, and a filtered bank whose rules were the same rules).

## R172 — The queue is a dose-response curve, and each point on it costs one arm

The filler reading (PROGRESS 204) replaced the two-way question "form or content" with a three-layer one, and it
retired the claim that content is inert: a block of typewriter maintenance scored **−6.72 pp** while the same shape
of block about the task scored +14.18. The mechanism is now "a block that changes behaviour, pointed by the task's
own vocabulary", and the next question is how much vocabulary is enough.

| # | experiment | the question | price |
| --- | --- | --- | --- |
| **1** | **two distilled rules + two filler entries, total length held at 1,312 characters** | is the effect **dose-dependent** on how much of the block is about the task, or does one real rule flip it, or does it need the specific advice | **≈ ¥2–3**, one arm plus its control |
| 2 | a neutral **declarative** block, same length, task vocabulary kept | is imperative grammar needed, or is a statement of the same facts equal | ≈ ¥2–3 |
| 3 | the object-location **facts** pack | can content that the model cannot infer beat domain priming; this is the only arm that could exceed +18 | ≈ ¥2–3 |
| 4 | the read-time **gate** (`--gate-share 0.2`) | the hard-stratum rescue (+24 to +62 pp) without the easy-stratum damage (−11 to −22) | ≈ ¥2–3 |
| 5 | three more `none` arms at the same games | the run-to-run swing is now measured at 8 wins (89 against 81), and every stratified claim inherits it | ≈ ¥2 each |
| 6 | `retrieved(k=1)` on the six-rule bank | does selection help when forced to one rule, now that vocabulary is known to matter | ≈ ¥2 |

**Why row 1 is first and why it is one arm.** Two of the four entries already exist as endpoints: four filler entries
(−6.72) and four real ones (+14.18). A half-and-half block, length held constant, is a single new treatment and it
lands on one of three qualitatively different curves:

* midpoint ≈ +4 pp → **linear priming**: the effect scales with how much of the block is about the task, which makes it
  a dosage rather than knowledge, and the product is a preamble sized to the budget;
* ≈ +14 pp → **threshold**: one real rule is enough, and the rest of the block is decoration;
* ≈ −7 pp → **no priming at all**: the gain needs the specific procedural advice, which would revive the memory claim
  the placebo was thought to have retired, and would send the queue to the facts pack (row 3) immediately.

**What stays paused.** New distillation, better rule banks, and retrievers that select among rules. All three are
tuning the layer that `sham − always-in` = −3.7 pp says is not resolvable at 134 games.

**One condition every future registration must carry, learned the expensive way.** The easy stratum is defined by the
control's wins, so a run whose control scores unusually well has a ceiling the treatment can only fall from. Row 1's
registration states the control's rate as a verbatim condition, and if the control lands above 85/134 the reading is
reported by stratum only.

## R173 — Two arms decide which half of the block carries the effect, and the queue behind them is one gate wide

The dose point (PROGRESS 205) read at the filler's value: a block half about the task scored 80/134, the same as a
block with nothing about the task in it, against a control that landed at 90/134 — above the 85 the registration had
named as its own ceiling condition, so the reading is by stratum and the pooled number is not a finding.

The row the estimate lands on attributes that to *how much* of the block was about the task. The artefact does not
support the attribution: the half that was kept is a desklamp note and a search order, the half that was dropped is the
inventory check and the `put`→`move` workaround, and those two are the only entries addressed to the operation this
corpus fails. Two explanations, one arm. R173 buys the other half.

| # | experiment | the question | state | price |
| --- | --- | --- | --- | --- |
| **1** | **the complementary block**: filler at positions 1–2, entries 3–4 of the registered bank at 3–4, 1,312 characters (100.0%) | does the **half that names the failing operation** carry the effect, at the same length and the same positions | **in flight**, `44833933349`, 134 × 2 | ≈ ¥3.2 |
| **2** | **the same two rules alone**: 802 characters (61.1%) | is the padding inert, or is it cancelling what it is padded with — the dose read exactly what four filler entries read | **in flight**, `44833963032`, 134 × 2 | ≈ ¥3.2 |
| 3 | three more `none` arms | the control's own spread is now ten wins across four dispatches; every stratified claim inherits it | dispatchable, and it is the last measurement that can lower the floor | ≈ ¥2.4 each |
| 4 | the read-time **gate** (`--gate-share 0.2`) | the hard-stratum rescue without the easy-stratum damage, as a cost control rather than a rescue | built, gated on rows 1–2 | ≈ ¥3.2 |
| 5 | a **`put`-family** block, written for the one kind the corpus fails (3, 3, 4 of 24 across three controls) | if row 1 lands near 99, is the effect *advice for the failing kind*, which is the product | licensed only by row 1 | ≈ ¥3.2 |
| 6 | a **retrieved raw trajectory** pack, nearest failing game, one entry, admitted by the overlap gate | the literature says abstraction is where the memory loses its value (arXiv:2605.12978); a raw trajectory is the form that keeps it | needs a second bank schema in `agent.py`; ~3 h engineering, tests first | ≈ ¥3.2 + 3 h |
| 7 | 3-of-4 dose (entries 1, 3, 4) | only if rows 1 and 2 both land near 80: is the effect a pair (one general, one specific) or the whole set | licensed only by that reading | ≈ ¥3.2 |

**What rows 1 and 2 mean together, and why neither is interpretable alone.** Row 2 differs from the registered bank
in both content and length, so it can say "the padding is not inert" or "it is", and it cannot say why. Row 1 holds
length, header, positions and count fixed and changes only which half is about the task, so it can say "the half
matters" and cannot say whether the block needs the other half too. Read together they separate the four possibilities
the dose point left: placement rules carry everything (1 ≈ 99, 2 ≈ 99), length is a second factor (1 ≈ 99, 2 ≈ 80),
the effect needs both halves (1 ≈ 80, 2 ≈ 80), or the filler is cancelling a real effect (1 between, 2 ≈ 80).

**The one cross-lane observation this changes.** The BIRD lane measured accuracy falling about **1.7 pp per rule
injected** (W8) and found that pruning at random was as good as pruning by checkability. This lane measures a four-rule
block at +19 wins over a four-filler block and a two-rule block at zero. The two are consistent under one variable, and
it is not token count: **what a pack is worth tracks how many of its items apply to the task in hand.** BIRD's rules
were mostly inapplicable and each additional one cost; ALFWorld's two applicable entries in a block of four were
drowned by two that were not. The gate in row 4 is the mechanism that makes that variable operational, which is why it
is now the only structural item in the queue.

**What stays paused, and it is not this lane's to unpause.** Tiered memory (H²R), graph memory (FSM), workflow
abstraction (AWM) and contrastive retrieval (Synapse) are memory-architecture components. They are under test in the
cortex programme, and this lane's job is to say what a *pass* is worth — a decomposition a competitor's ablation
cannot produce, because none of them has ever scored two different blocks on the same corpus.

**Price and time to the end of the lane, stated before it is spent.** Rows 1–2 in flight: ¥6.4. If they land as row 1
predicts, rows 3–5 are ¥10 and one dispatch cycle; row 6 is ¥3.2 and three hours of engineering; row 7 is contingent
and is not counted. **≈ ¥20 and one working day** from here to the last measurement this lane needs before it either
has a product statement or has to say that a pack is a preamble.

### R173, amendment 1 — the placement half carries the effect, and the queue behind it re-ranks

R173.1 (`44833933349`, $0.3974) scored the complementary half of the registered block at the registered length and
positions: **100/134** against the four-rule block's 99, and **+14.93 pp [+5.97, +23.88], p 0.002** against the other
half, with no control in that comparison. R173's first row is confirmed: the effect is the sentences that name the
failing operation, not the share of the block about the task.

| # | experiment | the question | state | price |
| --- | --- | --- | --- | --- |
| ~~1~~ | ~~the complementary block~~ | ~~which half carries it~~ | **read: the placement half, +14.9 pp over the other half** | paid, ¥2.84 |
| **2** | **the same two rules alone**, 802 characters | is the padding inert — is a two-sentence pack worth what a four-entry pack is worth | **in flight**, `44833963032` | ≈ ¥3.2 |
| **3** | the read-time **gate** (`--gate-share 0.2`) on the placement half | the hard stratum moved +52.2 pp and the easy one fell −13.6: a gate that fires on the observation's own words would keep the first and drop the second | built; **promoted to first** because it is now a measured trade rather than a hope | ≈ ¥3.2 |
| 4 | a **`put`-family** block: three sentences about inferring the right receptacle, the one kind nothing has moved (3, 3, 4 of 24) | does advice have to name the *specific* failing operation, or only the failing *step* | licensed by row 1 | ≈ ¥3.2 |
| 5 | a **retrieved raw trajectory**, nearest failing game, one entry, admitted by the overlap gate | the literature says abstraction is where a memory loses its value (arXiv:2605.12978) | needs a second bank schema; ~3 h engineering, tests first | ≈ ¥3.2 + 3 h |
| 6 | three more `none` arms | the control's spread is ten wins; a cross-treatment reading no longer needs it, a *level* claim still does | now lower priority than 2–5 | ≈ ¥2.4 each |
| 7 | 3-of-4 dose (entries 1, 3, 4) | only if row 2 lands near 80: is the effect a pair or the whole set | contingent | ≈ ¥3.2 |

**What the re-ranking is based on, stated as a sentence.** The lane now knows *what* to put in a pack and does not yet
know *how little* of it is enough (row 2) or *where* to put it so that it stops spoiling the games it was not written
for (row 3). Those are the two questions a product has to answer, and they cost ¥6.4 together, which is less than one
more sweep of the block that produced the finding.

**What is now excluded, and can be deleted rather than paused.** Every design in this lane that treats the pack as a
dosage — larger banks, more rules per kind, a budget of characters — is excluded by two arms at one length differing
by 15 points. So is the reading of the filler result that called the effect "domain priming": the search half is
domain-primed and worth nothing. What survives is the narrow statement the by-kind column supports, and it is the one
the product needs: **a pack is worth what its sentences say about the step the games fail at.**

## R174 — The two sentences are the pack, the tax is per sentence, and two arms test what that implies

R173.1's bare pair (802 characters, the two placement rules, nothing else) is the best arm in the lane: **109/134,
81.34%**, above the four-rule block (99) and above the same two rules padded to length (100) by **+6.72 pp
[+0.75, +12.69], p 0.034**, and above the full block by **+7.46 pp, p 0.045** — both comparisons treatment against
treatment, with no control in them.

| # | experiment | the question | state | price |
| --- | --- | --- | --- | --- |
| **1** | **one sentence**, 489 characters | is the pair a pair, or is the first sentence the whole effect | **in flight**, `44841962248` | ≈ ¥3.2 |
| **2** | the registered bank at **k=3 with `--gate-share 0.2`** | can a gate make a broad bank behave like a narrow pack — the only form in which a store scales past one hand-written sentence | **in flight**, `44841993038` | ≈ ¥3.2 |
| 3 | one sentence per kind, six entries, gated | what a user would actually ship: a store wide enough to cover the corpus and a pack narrow enough to be worth it | licensed by rows 1 and 2 together | ≈ ¥3.2 |
| 4 | a **`put`-family** sentence: inferring the right receptacle, the one kind nothing has fixed (6 of 24) | does the sentence have to name the *step*, or the *specific* failure | licensed by row 1 if one sentence suffices | ≈ ¥3.2 |
| 5 | a **retrieved raw trajectory**, one entry, admitted by the overlap gate | the literature's claim that abstraction is where a memory loses its value (arXiv:2605.12978) | needs a second bank schema, ~3 h | ≈ ¥3.2 + 3 h |
| 6 | three more `none` arms | the six readings now span eleven wins; a level claim still needs it, a cross-treatment claim does not | deprioritised | ≈ ¥2.4 each |
| 7 | 3-of-4 dose | excluded by R173.1 rather than deferred: the direction of the dose is negative | **deleted** | — |

**The queue is now two questions wide, and both are about shape rather than content.** The lane knows what the
sentences must say. What it does not know is how few of them are enough (row 1) and whether a wide store can be made
to behave like a narrow pack at read time (row 2). Rows 1–2 cost ¥6.4; rows 3–5 cost about ¥10 and a day. There is no
remaining experiment on this lane's list that changes the product statement in the other direction.

**The cross-lane statement this now licenses, and it is the reason the two lanes are worth running together.** The
BIRD lane measured accuracy falling −1.7 pp per injected rule across four pack sizes and found that pruning by
checkability bought nothing over pruning at random. This lane measures −3.4 to −3.7 pp per extra sentence, on a corpus
where the pack is otherwise ideal and the model is different. **A pack pays for its length and is worth its
specificity**, and both lanes now say so with numbers of the same sign. That is the sentence the whitepaper has been
missing, and it is a product sentence rather than a benchmark one: the smallest pack that names the failing step is
the pack to ship.

## R175 — A store of six sentences, selected by the task, and the same store without the selection

R174 closed the content question and opened a different one. **One sentence scores 112/134** — the best arm in the
lane, thirteen wins above the four-rule block and three above the two-sentence pair — so the product sentence is
"the shortest pack that names the failing step". What that leaves is the question a store has to answer: a store is
only useful if it can hold more than one thing, and every measurement so far says that holding more costs.

**The gate that was supposed to solve it did not, and the reason is now known.** R174.2's overlap floor (0.2 of the
observation's own content words) carried **zero entries in 134 of 134 games**: a first observation is 22 content
words of furniture, the four rules are about operations, and the largest overlap available is one word — `task`, from
the prompt's own task line. The floor needs 4.4. It was not a threshold that could be tuned; the signal does not
exist. **An observation names the room; the failing step is in the action.**

R175 asks the product question with the signal that does exist: the task kind, which `task_kind_of` reads out of the
gamefile before the first call and which costs nothing. `banks/bank-perkind-6.json` holds six sentences, one per
published kind, each tagged with the kinds it was written for. Its `put` entry is `bank-putmove-1.json` **verbatim**,
so the gated arm reproduces the 112-scoring block byte for byte on 24 of the 134 games.

| # | experiment | the question | state | price |
| --- | --- | --- | --- | --- |
| **1** | `always-in@kind` over the six-entry tagged bank | can a store cover six kinds and still be worth one line per game | dispatched | ≈ ¥3.2 |
| **2** | `always-in` over the same bank, ungated | six sentences and no selection: the control for row 1 and the per-sentence price at n = 6 | dispatched | ≈ ¥3.2 |
| 3 | the `examine` sentence alone | the one kind one sentence does not move (16/18 against 18/18), and the only sentence with no `put` step in it | licensed by row 1 | ≈ ¥3.2 |
| 4 | `retrieved@kind` over the same bank | does the anchor still help when the pool is one entry, or is a one-entry pool already the answer | contingent | ≈ ¥3.2 |
| 5 | a retrieved **raw trajectory**, one entry | the literature's claim that abstraction is where a memory loses its value (arXiv:2605.12978) | needs a second bank schema, ~3 h | ≈ ¥3.2 + 3 h |
| 6 | the bare pair compressed to 508 characters | is the per-sentence price paid in characters or in statements | **built, not bought**: 112 against 109 puts a 3–4 pp compression below this instrument's 12–14 pp mde | ¥3.2, unspent |

**The pre-registered reading, in one table.**

| row 1 | row 2 | what it means for the product |
| --- | --- | --- |
| ≈ 112 | ≈ 94 | the store scales: **the per-sentence price is paid by carrying, not by storing**, and a wide bank is free as long as each game carries one line |
| ≈ 112 | ≈ 112 | six task-relevant sentences are worth what one is worth; the price is not linear and R173.1's slope was about task-relevance rather than counting |
| ≈ 94 | ≈ 94 | selecting by kind does not help, so the product stays one hand-written sentence until a better selection signal exists |
| row 1 < row 2 | — | the gate hurts, and the mechanism is the one R174.2 found in another form: a tag that fires is not a rule that applies |

**What would void either reading.** `aggregate.py`'s empty-pack refusal (row 1 must carry one entry in at least 90%
of games, since every kind is tagged); engagement below 50%; and a control above 85/134 — which this split has now
produced three times, so any *level* claim from this dispatch is quoted by stratum only. The row-1-versus-row-2
contrast is treatment against treatment and needs no control at all.

**What this round cost and what it did not.** R174's two arms were **¥5.89** against a ¥6.4 quote. R175's two arms
are the same ¥6.4, and they are the last pair on this lane's list that can change the product sentence. Everything
below them is either a single sentence to be written (row 3, ¥3.2) or an engineering task with a known schema
(row 5, ~3 h + ¥3.2).

**The instrument is now stricter than the register that describes it.** Three voiding conditions were
outcome-shaped; the fourth — *was the treatment in the prompt* — was missing, and it is the one that caught R174.2.
`aggregate.py` prints the pack distribution above every delta and refuses a pack arm that carried nothing and a
control that carried anything, so a reading of an empty prompt can no longer be reported as a gate's effect.

**R175 came back and the table above is now a result, not a prediction.** Read in full at PROGRESS 209 and REGISTRATION
R175 amendment 1: six sentences **100/134**, the same six gated by kind **69/134**, its own control **91/134**, and the
one sentence **112/134**. Three findings replace the three registered cells:

| registered | measured | the finding that replaces it |
| --- | --- | --- |
| row 1 ≈ 112, row 2 ≈ 94 → the store scales | 69 and 100 | **it anti-scales**: selection cost 23 points against the same sentences ungated and 16 against nothing |
| both ≈ 112 → the price is not linear | 112 and 100 | linear at −1.79 pp/sentence over five task-relevant additions: the price is in coverage nobody needs |
| row 1 < row 2 → the gate hurts | 69 < 100, and 69 < 91 | the gate *removes* the sentence that works: it ties only on `put`, the one kind whose sentence is the winning arm verbatim |

What the round did **not** answer is why the single sentence pays. It is 37.3% of the registered block's length and
beats everything, including a store written to cover the corpus; the standing explanation is that it names a repair
no observation contains. R176 tests that explanation against the form it arrived in.

## R176 — The same evidence, shown instead of stated: is the sentence worth what it says or what it is

`banks/bank-putmove-1.json` is one 489-character sentence. It was distilled from **one trajectory** — the `put` that
failed, the thought that followed it, the `move` that worked, the observation that confirmed it — and
`banks/bank-rawput-1.json` is that trajectory **verbatim**, rendered at **505 characters**. The two arms are
length-matched to within 3.3% and differ in one thing: one states the rule the model should follow, the other shows
the episode it was derived from. `arXiv:2605.12978` claims a memory's value is lost in abstraction; this is the
lane's first length-matched test of that claim, and it costs what one arm costs.

| # | experiment | the question | state | price |
| --- | --- | --- | --- | --- |
| **1** | `always-in` over `banks/bank-rawput-1.json` (505 ch) with its control | at the same length, does a verbatim trajectory buy what a stated rule buys — is the value in the abstraction or in the evidence | **registered, dispatch next** | ≈ ¥3.2 |
| 2 | the `examine` sentence alone (~340 ch) | the one kind six sentences did not move (16/18 against 17/18) and the only hand-written sentence with no `put` step in it — is `examine` unwinnable by memory, or was its sentence the wrong one | licensed by R175 | ≈ ¥3.2 |
| 3 | ~~`retrieved@kind`~~ | does the anchor help once the pool is the game's own sentence | **retired by R175**: the gate is the wrong object, and a one-entry pool is the whole answer — there is nothing left for an anchor to rank | unspent |
| 4 | ~~the compressed pair~~ | is the per-sentence price paid in characters or in statements | **retired by R174.1 + R175**: length has now been varied from 0 to 1,280 characters with the content held, and the effect is content-shaped | unspent |

**The pre-registered reading of row 1, before it is bought.** The control for R176 is bought in the same dispatch, so
all three rows below are same-dispatch pairs.

| raw trajectory | what it means |
| --- | --- |
| ≈ 112, and above the control by ≥ 8 pp | **the value is the evidence, not the phrasing**: a memory can be a trace, the abstraction is a compression that costs nothing, and the product is "store the trajectory" |
| ≈ 91, not distinguishable from the control | **the value is the statement**: the same information, shown rather than stated, does not transfer — the model cannot read a repair out of an episode, and the product is one hand-written sentence per failing step |
| between the two, overlapping both | the two forms carry part of it each, and the next contrast is a mixed pack at the same total length |

**What would void the reading.** `carried` must be 1.0 in all 134 games (the bank has one entry and no gate); the
arm's rendered prefix must exceed the control's by 505 characters and equal the one-sentence arm's within 20, which
is checked in the artefacts before the delta is read — the whole experiment is a length match, and a length that
moved is the experiment failing to be one.

**Why this row and not another sentence.** Five hand-written sentences were just measured at −8.96 pp net, so
another hand-written sentence is a purchase this lane has already made and lost. The raw trajectory is the only
remaining arm that changes the *form* of the memory rather than its content, it is already built and validated
(`test_banks.py::RawTrajectoryTest`), and it decides a product question either way it lands.

**R176 came back, and the literature's claim does not survive contact with a matched length.** The trajectory reads
**108/134** (+11.19 pp [+3.73, +18.66], p = 0.0038 against its own control of 93) and the sentence **112/134**; the
difference between them is **+2.99 pp [−3.73, +9.70], p = 0.445**, on a pair whose mean prefixes differ by exactly 505
characters. Stated and shown are worth the same at matched length. What the tie hides is per kind: the trajectory is
the lane's best arm on `clean` (30/31), `heat` (23/23), `examine` (18/18) and `puttwo` (17/17) and its worst on `put`
(**1/24 against a control of 5**) — the only arm this lane has measured that is worse than nothing on the games its
evidence came from. It spent 49.5 of 50 steps and 33.6 thoughts on those games with *fewer* invalid actions than
either other arm, so it had the format and pursued the wrong objects. **A trace transfers the shape of a solution and
carries its nouns with it.**

## R177 — The resolution floor, and the purchase that raises it instead of adding a point to it

Every remaining hypothesis on this lane is now in the 3–6 pp band, and the instrument's minimum detectable effect on
134 games is **12–13 pp**. That is the binding constraint, not the ideas. Two candidate rows were written and
**neither is bought**, for the same arithmetic reason:

| candidate | the question | the predicted effect | why it is not bought |
| --- | --- | --- | --- |
| two repairs (`banks/bank-repair-2.json`, 620 ch, built and validated) | do two repair sentences compose where five descriptions did not | +1 to +3 games over the 112 arm (+0.7 to +2.2 pp) | under the mde by a factor of five; at 134 games the answer is "indistinguishable" whatever it is |
| the sentence delivered **after the first refusal** instead of before the first call | does the memory's cost come from being read on games that did not need it — the easy stratum's 84/91 against 91/91 | +7 games at best (+5.2 pp) | same reason: seven games is six short of what this split can see |

**So the next purchase is games, not arms.** The driver already accepts `--split`, the corpus publishes a second
evaluation section (`valid_seen`, 140 games) and a training section, and two arms on 140 more games cost what one arm
on 134 costs. Three rows, in the order they are worth buying:

| # | experiment | games | mde at n | price | leak status |
| --- | --- | --- | --- | --- | --- |
| **1** | `none` and the 489-character sentence on `valid_seen`, joined to the held-out 134 | 140 (+134 = 274) | ≈ 9 pp | **≈ ¥2.8** | both arms are hand-written: a sentence is a function of no section, so nothing here can be scored on its own source |
| 1b | the verbatim trajectory, **held-out section only** | 134 | 12–13 pp | already bought (R176) | its evidence is one `valid_seen` game, so it may be run there only where the scored section is not that one |
| 2 | the same on `train`, which holds **3,553** games — this row said 402, which is the three-arm sweep's *game count* on the held-out split and not a section's size; the counts are now measured rather than quoted (AUDIT 34.251) | 3,553 (+274) | ≈ 4 pp | ≈ ¥50 | only for hand-written banks: a bank distilled from a training run cannot be evaluated on it, and the guard for that now exists (`source.train_split`, AUDIT 34.251) |
| 3 | the two under-powered rows above, once row 1 is joined | — | — | ≈ ¥3.2 each | unchanged |

**What row 1 buys beyond power.** It is the first reading in this lane on a second section of the corpus: every
number quoted above comes from `eval_out_of_distribution`, and an effect that exists in 134 held-out rooms and not in
140 seen ones is a property of a split rather than of memory. If the sentence replicates at ≈ 112/140, the lane's
headline becomes a 274-game estimate with a 9 pp mde and two independent sections behind it; if it does not, that is
the most important negative result the programme could produce, and it costs ¥3.6 to find out.

**The plumbing row 1 needed is built and green** (PROGRESS 211, AUDIT 34.251). `split` and `split_games` are inputs,
`--split` is passed to every arm in the matrix, `SPLIT_SIZES` is counted from the corpus and held to it by
`check_split_sizes.py`, `--expect-splits` declares a cross-section join and `by_section` grades it, and a bank whose
recorded `train_split` equals the section it would be scored on is refused before the dispatch is bought. Two rules
that had been assumptions are now refusals: a `--games` beyond the section (it was silently `min`'d, so a request
for 140 on 134 drove 134 and printed `134/134`), and a join that mixes sections without naming them.

**Row 1 is now in flight** after one arm was deliberately left out: the trajectory's evidence is **one `valid_seen`
game**, so scoring it on `valid_seen` would include its own source — 1 of 140, inside the 4.2 pp noise floor, which is
exactly why it would never be noticed. Row 1b keeps it on the held-out section instead, where it has already been
read (R176: 108/134).

**What row 1 buys beyond power.** It is the first reading in this lane on a second section of the corpus: every
number quoted above comes from `eval_out_of_distribution`, and an effect that exists in 134 held-out rooms and not in
140 seen ones is a property of a split rather than of memory. If the sentence replicates at ≈ 112/140, the lane's
headline becomes a 274-game estimate with a 9 pp mde and two independent sections behind it; if it does not, that is
the most important negative result the programme could produce, and it costs ¥2.8 to find out.

**The registered reading, for the record, before the money.** The sentence read +17.91 pp on the held-out section.
On 274 games the mde is ≈ 9 pp, so a seen-section gain below +8 pp is the negative result; a pooled gain of +12 pp
or more would mean the held-out estimate was low rather than typical.

**R177 came back, and the negative result the round was built to detect did not happen.** The sentence read
**+25.71 pp** on the seen section (111/140 against 75/140) and **+17.91 pp** held out; pooled over 274 games it is
**+21.90 pp [+15.69, +28.10]** at an mde of **9.70 pp** — resolution bought, conclusion unchanged. The two sections
are *not* distinguishable (+7.80 pp, [−4.63, +20.27], p = 0.226), and the seen section's lower control (53.6% vs
65.7%) is composition rather than difficulty: `put` is 25% of the seen games and 18% of the held-out ones, and
`put` is the kind nothing wins without the sentence. Read in full at PROGRESS 213, REGISTRATION R177 amendment 2,
AUDIT 34.253.

The by-kind table is now the lane's strongest single result, and it is negative in exactly one place:

| kind | sentence | control | delta |
| --- | --- | --- | --- |
| `cool` | 43/46 | 29/46 | **+30.4 pp** |
| `heat` | 38/39 | 27/39 | +28.2 pp |
| `put` | 24/59 | 8/59 | +27.1 pp |
| `puttwo` | 38/41 | 28/41 | +24.4 pp |
| `clean` | 53/58 | 40/58 | +22.4 pp |
| `examine` | 27/31 | **31/31** | **−12.9 pp** |

The control wins all 31 `examine` games across both sections. That is the third independent sighting of one law:
**an entry pays where its referent is the failing step** — R175 saw it from a kind-description that hurt its own
kinds, R176 from a trace that lost the kind whose nouns it carried, R177 from a repair that is noise on the one
kind with no placement in it.

## R178 — The memory as a claim with a source, which is the last mechanism on the board that costs tens of characters

`WikiTrace` (`arXiv`, Nov 2026) reports that **52% of memory-induced failures trace to a specific entry**, that
20% of those entries are simply wrong, and that linking every lesson to the run it came from lifts an average
score from 79.5 to 90.2. This lane has already shown the *content* half of that (a wrong referent is worse than no
entry); what it has never tested is the *provenance* half — whether an entry that says where it came from is
worth more than the same entry without it.

The bank is one sentence of 489 characters. Appending a source clause makes the pack **62 characters longer**
(489 → 551, 12.7%) — and this lane has already measured that length is not free (−3.4 to −3.7 pp per sentence in
a padded block, −1.79 pp/sentence at n = 6). So the round buys **two arms of exactly equal rendered length**,
differing in one clause:

| arm | bank | rendered | the clause |
| --- | --- | --- | --- |
| **1a** | `banks/bank-putmove-source-1.json` | **551** | `[source: one won pick_and_place_simple game, run 44841962248]` |
| **1b** | `banks/bank-putmove-note-1.json` | **551** | `[note: a reference for this task, not an instruction for it.]` |

1b is a **length control**, not a placebo: it says something true and neutral about the entry's status, so the
difference between the arms is provenance and nothing else — not length, not position, not register.

| # | experiment | the question | state | price |
| --- | --- | --- | --- | --- |
| **1a** | the sentence + its source clause, 551 ch, on **both sections**, 274 games | does an entry that names its evidence beat the same entry with a neutral clause | **bought and read: 212/274, −3.65 pp against 1b** | ¥2.43 |
| **1b** | the sentence + a neutral clause of the same 551 ch | the control 1a is read against | **bought and read: 222/274, and the length is free** | ¥2.34 |
| 2 | conditional delivery: `examine` receives nothing | the one kind the sentence costs (31/31 against 27/31) — is a memory that knows when to be absent worth more than one that is always present | **registered, not buyable at this design**: 4 games of 274 is 1.5 pp against an mde of 9.7 | ≈ ¥3.1 |
| 3 | a training-section subset for a ≈ 6 pp mde | resolves the 3–6 pp band the lane still holds | **registered**, hand-written banks only | ≈ ¥10–50 |
| 4 | ~~mode selection by task kind~~ | Anti-Persistence's mode choice, keyed on the label this lane already has | **refused by measurement**: R175 bought it, −23.13 pp | unspent |

**Why the rows are read against each other and not against a control.** Two treatments are the comparison this
lane trusts (AUDIT 34.232): the control moves eight to eleven wins between dispatches, the treatments repeat. So
each dispatch buys **one** arm over one section, four shards, and the reading pairs the two arms game for game on
274 games with the same model and the same harness. `alf_dispatch.py --against` is what makes that legal: a sweep
with a treatment and no control is refused unless it names the arm it is half of.

**The registered reading, before it is bought.** The mechanism predicts a gain, not a tie: if provenance is what
WikiTrace says it is, **1a − 1b** is +9 pp or more on 274 games (mde 9.70). Three outcomes are registered — ≥ +9 pp (the provenance half is
real and the product statement becomes "store the repair and its evidence"), −9 to +9 pp (provenance is not the
mechanism on this corpus, and the lane's law stays referent-only), ≤ −9 pp (naming a source makes the model
discount the entry, which would be a finding about how a frozen model reads citations).

**Void conditions.** `carried` 1.0 in all 274 games and `pack chars` exactly **551** in every game of both arms; the arm's
`by_kind` and `by_section` readings must be printed beside the pooled delta, because a provenance line that helps
`put` and hurts `examine` would be the same trade the last three rounds have found.

**Read: the second band, and the length half came back free.** `1a − 1b` is **−3.65 pp [−8.39, +1.09]**, p = 0.151, on
274 games at an mde of **6.63 pp** — the registered band for *provenance does not transfer on this corpus*. The sign
is the same in each section alone (−4.29 seen, −2.99 held out), and the clause is demonstrably **read**: 55.5% of
games changed their action trajectory under it, 26 hurt against 16 helped. What the round also bought, and did not
predict, is the **length null**: +62 characters inside one entry cost −0.36 pp [−4.74, +4.01], which retires the
per-character reading of this lane's tax — it is per entry.

**And the floor moved by a third for one arm's price.** The mde fell from 9.70 pp to **6.63 pp** on the same 274
games because the pair is two *treatments*: discordance 90 → 42. The training-section subset registered above at
**¥10–50** to reach ≈ 6 pp is **retired** — resolution is a property of the control, not of the sample size.

## R179 — What a citation that cannot be checked is worth, at the same 551 characters

R178 leaves one question that its own two arms cannot answer. A citation that names a true run is read and costs
3.65 pp; **is a citation a claim the model evaluates, or text it merely reacts to?** WikiTrace's other half is the
failure mode — 20% of memory-induced failures trace to entries that are simply wrong — and this lane has tested a
wrong *referent* (R175) and never a wrong *citation*.

| # | arm | bank | rendered | games | the question | price |
| --- | --- | --- | --- | --- | --- | --- |
| **1a** | the sentence + a citation of a run that does not exist | `banks/bank-putmove-ghost-1.json` | **551** | 274 (both sections) | does a claim the model cannot check still move it | ≈ ¥2.4 |
| 1b | *(spent)* the sentence + a citation of a run in which it won | `bank-putmove-source-1.json` | 551 | 274 | R178 1a | ¥2.43 |
| 1c | *(spent)* the sentence + a neutral clause | `bank-putmove-note-1.json` | 551 | 274 | R178 1b | ¥2.34 |

The clause is `[source: one won pick_and_place_simple game, run 44800000000]` — same 62 characters, same position, and
an eleven-digit run id no artefact carries. The variant a product would ship, *a real run that never carried this
entry*, is the same arm at the model's level: a frozen model reading a prefix cannot tell them apart, so one arm
covers both.

**Registered on 274 games (mde ≈ 6.6 pp).** ≤ −9 pp: a false citation is read *and penalised*, which makes a pack's
text falsifiable for the first time in this lane. −9 to +9 pp: **citations are inert as text**, and WikiTrace's
79.5 → 90.2 must come from the *descent* — their agent can open the run — rather than from the line. ≥ +9 pp: no
mechanism predicts it, and it would invalidate R178's interpretation rather than extend it.

**Void conditions.** `carried` 1.0 in all 274 games; `pack chars` exactly **551** in every game; read only against 1b
and 1c; `by_kind` and `by_section` printed beside the pooled delta; and the bank declares
`source.false_by_construction` with a `FALSE BY CONSTRUCTION` note, because a bank that looks like a typo is a bank
somebody eventually fixes (34.254).
