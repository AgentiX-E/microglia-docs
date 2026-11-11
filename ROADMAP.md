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

**Next, in order.**
1. **R81 — read, and it closed the memory line.** Fifth dispatch, 1,534 questions, 14 gates passing, $0.5338.
   Against `full`, the rebuilt arm is **−0.33pp [−1.76, +1.11]** and the foreign control **+0.13pp [−1.30, +1.56]**;
   both straddle zero inside 1.5pp, which is the branch the registration named *Reconstruction is not the problem
   either*. Four mechanisms — content, quantity, persistence, foreign control — are now measured null at BIRD dev
   57.4%, each by a different registration (§173.69). The writer declined on 86.4% of questions.
2. **R82 — dispatched.** The one variable never bought: the backbone. 350 questions, `sample-5-first` against
   `sample-5-assert`, `deepseek-v4-pro` read from the registration's own header, cap 3,600. The instrument gaps
   that made this undispatchable (a closed `backbone` vocabulary, no catalogue probe, a one-row rate card that
   would have billed the stronger model at 4.4× under) are closed in §173.56–173.58, and its minimum detectable
   effect of 4.67pp is power against a predicted effect of six points or more.
3. **R83 — cancelled before dispatch, by arithmetic.** The store R81 published holds 633 same-scope pairs and 3
   above the consolidation pass's 0.60 floor: the same pair of statements in three folds. Six questions of 1,534
   is a 0.39pp ceiling against this lane's 1.99pp floor, so the arm is underpowered by five times by
   construction. Raising `learn_sample` nineteen-fold puts the repeats at roughly twenty groups, still under 3%.
   The merge is not the missing mechanism — the store is too small to have one (§173.70).
4. The store-local top-up (force-recall) design, still open from R78; then `retry-keyed` vs `retry-blank`.

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
