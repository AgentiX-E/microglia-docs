# Microglia — Product Whitepaper

**A headless feedback flywheel for agentic workflows**

Version 1.0 · 2026-10-20 · Author: Lambertyan · Status: decision document, pending approval

---

## 0. Document contract

This document answers four questions.

1. Is "turn HITL feedback into reusable agent knowledge" a valuable direction? — §3, §4
2. Who leads the field, academically and commercially, and what do they measure? — §5
3. Is a headless npm library the right product shape, with nl2charts as the reference host? — §6, §7
4. What is the path to state of the art, and how would we know we got there? — §10

It does **not** claim a benchmark result. Every performance number in this document is either
(a) quoted from a cited source, (b) produced by the POC in `packages/`, or (c) explicitly labelled
as a target. The POC is a **controlled mechanism study**, not a leaderboard entry;
`TECH-DESIGN.md` §12.6 states its limitations in the same font as its results.

**Evidence standard.** A claim without a citation or a reproducible command is marked
`[ASSUMPTION]`. There are two such marks in this document, both forecasts rather than findings (§4,
§10.4). Every other number is cited or produced by the POC.

---

## 1. Summary

**The direction holds; the unit does not.** Feedback-to-knowledge is a real lever, and the evidence for
it is industrial as well as academic. But eleven measured arms on a public benchmark say the same thing
from eleven angles: **a lesson distilled from one correction carries information about that correction
and about nothing else.** The product that survives that finding is not a memory middleware that
prepends lessons, and section 3 is the measurement that says so rather than the argument.

### 1.1 What is established, with the number

| Finding | Evidence | Size |
|---|---|---|
| Generic chart knowledge needs no memory layer | DeepSeek without a pack already answers 90.48% | a pack moved it −2.38pp to 0.00pp |
| Organisational convention is where the value is | gold disagrees with the model's prior, no pack 0.00% | **+75.0 to +89.3pp** with a pack |
| The pipeline can learn from a correction at all | synthetic POC, 560 train / 280 held out, 4 schemas, 6 systematic defect classes | 31.79% → 100.00%, McNemar p < 0.0001 |
| Scope widening is what makes it generalise | held-out `ops` domain that never gave feedback | **100.00% with widening, 32.86% without** |
| The trust ceiling is load-bearing | poisoned arm with the ceiling removed | 100.00% → 85.71% |
| Cost is not the obstacle | 1k / 5k / 10k knowledge items, CPU | p95 **1.9–4.4ms**, heap **+14MB**, no GPU, no server |

Those five rows are why the project exists, and none of them has been retracted.

### 1.2 What R2–R6 overturned

On BIRD Mini-Dev, under a pre-registered protocol with a noise-floor control on every dispatch, every
arm that changes what the prompt contains came back at or below zero:

| Arm | Position | Δ vs no memory |
|---|---|---|
| lexical schema linking (pruned DDL) | input | −8.00pp |
| rule pack (`full`), pooled over two dispatches | input | −2.29pp (p = 0.052) |
| `full-verified` — only rules that reproduce their own correction | input | +0.71pp (p = 0.42) |
| value samples in the DDL | input | +0.29pp |
| model selection over five draws | output | −2.43pp |
| execution selection over five draws | output | −1.14pp |
| **oracle over five draws** | **ceiling** | **+3.52pp** |

The one positive number is a ceiling, and it sits on the output side. The gap between the ceiling and
the best real selector — 4.66pp — is the entire opportunity this project has measured, and it is a
verifier problem.

### 1.3 The measurement that ends the ambiguity

R6 pointed every admitted rule at four foreign questions and recorded both what it repaired and what it
broke. A rule repairs **22.6%** of the questions a bare retry could not fix — on its own question — and
**29 repaired against 29 broken** on questions it was not distilled from. Net marginal effect:
**+0.00pp** on 892 trials, against **+20.53pp** on 638 own-case trials.

A rule and its case are one object. Moving that object from the prompt prefix to a scorer changes where
a zero sits, not what it is worth. Section 3.6.1 states this with the full 2×2.

### 1.4 Product constraint, restated

- **CPU or browser WebGPU only.** No GPU training, no local fine-tuning, no served inference.
- **A library, not a platform.** Integration is a handful of lines; there is no UI, no service, no
  tenancy.
- **The store holds execution-grounded evidence**, not prose lessons: `(schema, execution signature,
  outcome)` is the object that survives being read by a question it was not built from.

### 1.5 What is next, and what would stop it

R7 is ordered so the pool is described before any scorer is built: instrument the candidates (R7.0,
done), widen the pool with heterogeneous generators and measure whether the ceiling moves (R7.1), price
each execution signal alone (R7.2a), then build the deterministic verifier (R7.2b). If the ceiling does
not move at least 2pp in R7.1, candidate diversity is not the constraint and R7.2 becomes the whole
stage with a 3.52pp ceiling as its maximum prize. If the verifier's yield is at the floor, the stage
ends and the programme reports two closed axes rather than a third mechanism.

The kill criteria are in `ROADMAP.md` §R7, written before the dispatches they govern.

---


## 2. The problem: a loop that is captured but not closed

Every agentic product generates feedback. Almost none of it becomes capability.

| Signal | Where it is produced | Where it usually ends |
|---|---|---|
| Thumbs up/down + reason | Chat or result panel | Analytics dashboard |
| User edit of the output | Inline editor | Overwritten in the host's database |
| Execution failure (SQL error, invalid chart) | Runtime | Logs, retried once, forgotten |
| Clarifying question and answer | Conversation | Transcript, never indexed |
| Abandonment / re-prompt | UI telemetry | Funnel metric |

Four failures follow, and they are independent:

1. **Capture is lossy.** The post-edit value is stored; the pre-edit value, the prompt version, the retrieved context, and the model are not. Without the pair there is no comparison, and without provenance the comparison cannot be attributed.
2. **Feedback has no semantics.** A JSON diff says `mark: "bar" → "line"`. The reusable lesson is "for a trend question, prefer line". Only a domain pack can tell the difference.
3. **Memory has no governance.** A vector store will happily return a rule derived from one angry click, forever, to every user. It has no notion of evidence weight, contradiction, expiry, or poisoning.
4. **Measurement is detached.** Eval platforms can tell you the quality dropped last Tuesday. They cannot change the answer the user is about to see.

The academic response has been to build a bespoke loop per paper. The industrial response has been to build a platform per company. Neither produces a component a host can embed.

### 2.1 The evidence that closing the loop pays

| Study | What was fed back | Measured effect |
|---|---|---|
| Agent-in-the-Loop, Airbnb ([Zhao et al., EMNLP 2025 Industry](https://aclanthology.org/2025.emnlp-industry.135/)) | Pairwise preference, adoption + rationale, knowledge relevance, missing knowledge | recall@75 **+11.7%**, precision@8 **+14.8%**, helpfulness **+8.4%**, adoption **+4.5%** |
| Adaptive Data Flywheel, NVIDIA ([Shukla et al., EACL 2026 Industry](https://aclanthology.org/2026.eacl-industry.33)) | 495 negative samples over 3 months | Routing **96%** with an 8B model (10× smaller, −70% latency); query rephrasal **+3.7%** |
| ACE ([Zhang et al., ICLR 2026](https://arxiv.org/abs/2510.04618)) | Execution feedback, no labels | **+10.6%** agents, **+8.6%** finance; adaptation latency **−86.9%** |
| ReasoningBank ([Ouyang et al., ICLR 2026](https://arxiv.org/abs/2509.25140)) | Self-judged success and failure trajectories | WebArena **+8.3%** success; **+34.2%** relative with MaTTS (k=5); SWE-Bench-Verified 30.8→34.6 |
| ExpeL ([Zhao et al., AAAI 2024](https://arxiv.org/abs/2308.10144)) | Cross-task successes and failures | HotpotQA **28%→39%**, ALFWorld **40%→59%**, cross-domain transfer 63%→70% |
| Agent Workflow Memory ([Wang et al., 2024](https://arxiv.org/abs/2409.07429)) | Successful trajectories → reusable workflows | WebArena **+51.1%** relative, Mind2Web **+24.6%** |

These are different tasks, models, and harnesses. The **common mechanism** is the claim worth
productising: a compact, retrievable representation of past corrections improves future task success
without touching weights. The differences are exactly why a reusable component is needed instead of
another bespoke pipeline.

### 2.2 The counter-evidence, which is just as important

- **Naive rewriting destroys knowledge.** ACE documents a context that held ~18k tokens at 66.7%
  accuracy being "summarised" to 122 tokens and dropping to 57.1% — worse than no adaptation. Any
  product that lets an LLM rewrite its own memory will eventually do this.
- **Memory benchmarks are contested.** LoCoMo headline numbers are self-reported and disputed:
  Mem0 claims 92.5 while an independent harness reports 66.9; Zep corrected its own 84% to 58.44%
  before restating ~75.14 ([vendor summary of the dispute](https://mem0.ai/blog/ai-memory-benchmarks-in-2026),
  [independent reproduction](https://genalphai.com/is-agent-memory-the-wrong-abstraction-the-2026-evidence)).
  A full-context baseline at ~73% can beat a memory system on a 16–26k-token conversation
  ([audit](https://dreaming.press/posts/how-to-read-an-agent-memory-benchmark)).
- **Text-to-SQL benchmarks contain pervasive annotation errors.** A VLDB 2026 study reports 52.8%
  error rate on BIRD Mini-Dev and 62.8% on Spider 2.0-Snow, with re-evaluation moving 16 agents by
  −7% to +31% relative and reordering the leaderboard by up to 9 places
  ([Jin et al., 2026](https://arxiv.org/abs/2601.08778)).
- **Judges are biased and only ~70–80% human-agreeing.** Position, verbosity, style, and
  self-preference effects are systematic; order-swapped double scoring plus length control is the
  minimum defensible protocol ([cross-benchmark synthesis](http://spectrumofresearch.com/index.php/sr/article/view/53)).

A product in this space that does not encode these lessons will produce confident, wrong uplift.

---

## 3. Is the direction valuable? — the verdict

**Yes for the four mechanisms below, and no for the form this project spent eleven iterations building.**

Read 3.1 with 3.5 in hand: the mechanisms are where the value is, and the *prompt prefix* is not a
delivery route for any of them on a one-shot benchmark — every arm that put knowledge in front of the
question measured at or below zero, and §3.6.1 shows why. The direction survives; the substrate did not.

### 3.1 Where the value comes from (four distinct mechanisms)

| Mechanism | Input | Output | Who captures it | Time to value |
|---|---|---|---|---|
| **M1 Constraint learning** | Structured edit | Declarative rule, scoped | Prompt-time retrieval | Same session |
| **M2 Exemplar learning** | Edit or accepted pair | Input→output example | Few-shot block | Same session |
| **M3 Preference data** | Rating / edit pair | SFT / DPO / KTO rows | Post-training | Weeks |
| **M4 Evaluation set** | Any feedback | Regression cases | CI gate | Days |

M1 and M2 need no training, no GPU, and no data volume. M3 needs volume and a training path. M4 is
the cheapest and most under-used: every correction is a test the system did not have. A product that
only promises M3 will look slow; one that ships M1/M2/M4 first delivers value on day one.

### 3.2 Why now

1. **Interaction is the new bottleneck.** BIRD-Interact reports GPT-5 solving 8.67% of
   c-Interact and 17.00% of a-Interact tasks on the full suite, with the best systems around 24%/18%
   on Lite ([benchmark site](http://bird-interact.github.io/), [ICLR 2026](https://mlanthology.org/iclr/2026/huo2026iclr-birdinteract)).
   Single-shot accuracy is no longer where the headroom is; clarification and correction are.
2. **Architecture beats model size.** Holding the reader fixed, the spread across memory systems on
   LongMemEval is ~37pp; swapping readers is worth ~7.8pp
   ([cortex's own correction](https://github.com/AgentiX-E/cortex/blob/master/SOTA-BASELINE.md)).
   Structure is the lever a library can sell.
3. **The platform route is being absorbed.** Humanloop's team joined Anthropic in August 2025 and
   the standalone platform shut down on 8 September 2025; the reported structure was an acqui-hire
   that excluded the platform IP ([announcement](https://humanloop.com),
   [deal summary](https://seedtable.com/exits/humanloop)). A library that lives inside the host is
   not exposed to that consolidation.

### 3.3 Where the value does *not* come from

- **Not from volume alone.** 10,000 thumbs-down without reasons produce one usable signal: "something
  is wrong". The POC's unguarded arm shows that unvetted edits can *reduce* accuracy by 14.3pp.
- **Not from a better embedding model.** Retrieval quality matters, but scope correctness matters
  more: in the POC, the same knowledge scored 32.86% or 100.00% depending only on whether the scope
  generalised.
- **Not from personalisation at large.** One global store cannot satisfy contradictory per-user
  preferences; that requires per-user namespaces, which multiplies the cold-start problem.

### 3.4 Kill criteria (declared before the work)

The project stops, rather than pivots, if any of these holds after S1 (§10):

| # | Condition | Measurement |
|---|---|---|
| K1 | Correction reuse lift < 3pp on two independent tasks | Paired McNemar on held-out questions, p<0.05 |
| K2 | Fewer than 2% of production runs receive any correction | Host telemetry over 30 days |
| K3 | Any untrusted knowledge becomes active in red-team | Poison arm gate = 0 |
| K4 | p95 added latency > 50ms or > 400 tokens per call | Production histogram |
| K5 | Judges cannot reach κ ≥ 0.7 against 200 human labels | Calibration study |

---

### 3.5 The lever is not on the input side

Nine arms have now been measured on BIRD Mini-Dev under one protocol — same model, same folds, same
scorer, paired bootstrap over 10,000 resamples, and a `none-replica` control that measures the noise
floor of an identical prompt. Five of them act on the **input** (what the prompt contains). Four act
on the **output** (which of several answers is kept).

| Iteration | Arm | Acts on | Δ vs no memory | n | gained / lost |
|---|---|---|---|---|---|
| 94 | lexical schema linking (pruned DDL) | input | **−8.00pp** | 350 | 31 / 59 |
| 96 | rule pack (`full`) | input | −2.86pp | 350 | 11 / 21 |
| 96 | `full-shuffled` (same size, wrong donors) | input | −1.71pp | 350 | 14 / 20 |
| 96 | `full-verified` (only rules that replay their own case) | input | −0.57pp | 350 | 5 / 7 |
| 95 | value samples in the DDL | input | +0.29pp | 350 | 12 / 11 |
| 93 | model selection over five draws | output | −2.43pp | 350 | — |
| 93 | first draw (control for resampling) | output | −2.28pp | 350 | — |
| 93 | agreement selection | output | −1.43pp | 350 | — |
| 94 | execution selection | output | −1.14pp | 350 | 13 / 10 |
| 93 | **oracle over five draws** | **ceiling** | **+3.52pp** | 350 | — |

Two readings, and only one of them is a complaint about implementation.

**Every input-side arm is at or below zero, including the one whose content was verified good.**
`full-verified` injects only rules that demonstrably reproduce the correction they were derived from
— 1.11 such rules per question, 139 questions — and gains zero questions while losing two. That is
not a null about a treatment; it is a null about the *content* of the treatment, measured on the
subset where the content was known to be good.

**The only positive number in the table is a ceiling, and it lives on the output side.** Oracle
selection over five homogeneous draws is worth +3.52pp: on 350 questions, the best of five draws is
3.5pp better than one draw. The best *real* selector captures −1.14pp of it. The gap between the
ceiling and the selector — 4.66pp — is the entire opportunity this project has measured, and it is a
verifier problem, not a memory problem.

### 3.6 Which flywheel can actually turn here

Three loops are called "data flywheels" in the industry, and they turn on different things. Naming
which one a product is building is the difference between a roadmap and a metaphor.

| Flywheel | What turns | Signal it needs | Available in this setting | Verdict |
|---|---|---|---|---|
| **Parameter** (RLHF, DPO, o-series RL) | model weights | dense, trustworthy outcome signal | No: the generator is a closed API. Available only as LoRA on open weights, with a training path and volume | Out of scope until M3 has volume |
| **Verifier / reranker** (Cursor's accept-rate loop, CHASE-SQL's selection agent) | the scorer, not the generator | two outcomes that can be compared | **Yes.** SQL is executable: the environment scores candidates for free | **The only flywheel that can turn here** |
| **Context** (Mem0, Zep, MemGPT, ACE, ReasoningBank) | retrieved text | repeated tasks + information not derivable from the environment | Partial: needs repetition. One-shot benchmarks and novel schemas have none | Does not turn on this workload |

The distinction that matters: a **parameter** flywheel compounds because the artefact of each turn is
a better model. A **context** flywheel does not compound, because the artefact is text that the same
fixed model must re-read every time — and re-reading costs attention. That is why the input-side
column above is negative rather than merely flat: the cost is structural and paid on every call,
while the benefit is a probability that a rule written for another question applies to this one.
Measured, that probability is 22.9% even for the rule's *own* case (149 of 652 probed questions),
and R6 is measuring it for foreign cases.

**Why the residuals are not knowledge-shaped.** Of 350 questions the model gets 53.7% right from the
schema alone. In the 162 wrong answers analysed in iteration 95, masking every string literal on both
sides leaves the two queries different in **162 of 162** cases: the join, the aggregation or the
filter is also wrong. What remains is question-specific semantics — which column this workspace calls
revenue, whether this join needs a distinct, what this table's grain is — and that information does
not exist in a rule distilled from a different question. It exists in *this* schema, *this* data and
*this* question, which is exactly what a verifier can see and a prompt prefix cannot.

**What that makes the product.** Not a memory middleware that prepends lessons, but an
**execution-grounded verifier memory**: it stores the candidate queries a run produced together with
what executing them returned, and it acts after generation and before commit — re-ranking, refusing,
or asking. Its promise is falsifiable in one line:

```
pass@1 gain  =  selection yield  ×  oracle ceiling
```

where the ceiling is measured on the same candidate set and the yield is the share of it the verifier
captures. Today, on five homogeneous draws: ceiling +3.52pp, yield negative. CHASE-SQL reports the
comparable pair at 68.84% → 73.01% (+4.17pp) with **heterogeneous** candidates, which is the first
thing our candidate set lacks: five samples from one prompt are five versions of the same mistake.

### 3.6.1 The measurement that settles what the unit of memory is

The paragraph above was an inference from the shape of the residual errors. It is now a measurement, and
the measurement is sharper than the inference.

R6 pointed every rule that reproduced its own correction at four foreign questions from the same
database, judged each attempt against a bare retry on the same target, and recorded both halves of the
2×2 — what the rule repaired, and what it broke.

| | A bare retry fixed it | A bare retry did not | Marginal |
|---|---|---|---|
| **Rule shown a foreign question** | 39 kept / **29 broken** | **29 repaired** / 795 unchanged | **(29 − 29) / 892 = +0.00pp** |
| **Rule shown its own question** | 61 kept / 13 broken | 144 repaired / 420 unchanged | **(144 − 13) / 638 = +20.53pp** |

> A rule distilled from a corrected case carries **20.5 points of information about that case and 0.0
> about any other**. It is not weak knowledge. It is a case record whose content is the case.

Read with the break column, the two negative arm results stop being surprising and stop being about
implementation. `full` injects 1.86 of these per question and loses 2.29pp pooled over two dispatches;
each one is a coin flip on correctness that costs attention on every call. `full-verified` — the same
run, keeping only rules that demonstrably reproduce their own correction — recovers **+3.00pp against
`full`** (pooled, n = 700, p = 0.0075) and still lands at **+0.71pp against no memory at all**
(p = 0.42). The gate removes the harm and produces nothing, which is exactly what a good filter does
to a substrate with no signal in it.

This is where the project's own question — *are we remembering the wrong thing, or using it wrongly?* —
gets its answer, and the answer is neither of the two options it offered. **The unit is wrong, and no
position repairs a unit whose content is its own index.** A lesson and its case are one object; the
only thing that survives being moved to another question is a property of the *answer* rather than of
the question, which is what an execution signature is and what R7.2 measures.

### 3.6.2 What the store actually contained

Section 3.6.1 measures what a rule does when it is moved. This one measures what the store *is*, from
every attribution run the project has recorded, and the two agree while answering different questions.

Each arm's attribution artefact classifies every rule that reached a prompt by the sign of its net
effect — did it repair more answers than it broke, or the reverse — and carries one instance-weighted
number, the share of injections belonging to a net-harmful rule. `pnpm eval:store` adds the runs up
over the results directory including the archive: eight runs, 2026-10-23 to 10-26, each a 60-to-350
question cross-fitted slice of BIRD Mini-Dev.

| Quantity | Count | Share |
|---|---|---|
| Rules the distiller kept | 9,062 | — |
| Rules that reached a prompt at least once | 2,817 | **31.1%** of the store |
| … of those, net-repaired more than they broke | 110 | 3.90% of injected rules |
| … net-broke more than they repaired | 229 | 8.13% of injected rules |
| … flips cancelled exactly (a wash) | 2,478 | **87.97%** of injected rules |
| Net | **−119 rules** | exact sign test p = 9.5e-11 |

| Run | Rules | Reached a prompt | Repaired | Broke | A wash | Injections in a harmful rule |
|---|---|---|---|---|---|---|
| 10-23 11:27 (pilot, 60 q) | 124 | 74 | 5 | 11 | 58 | 16.7% |
| 10-23 16:26 | 1,296 | 439 | 25 | 40 | 374 | 10.7% |
| 10-23 17:18 | 1,280 | 442 | 17 | 42 | 383 | 11.4% |
| 10-23 23:15 | 1,295 | 423 | 13 | 38 | 372 | 12.3% |
| 10-24 01:45 (value oracle) | 1,149 | 233 | 8 | 0 | 225 | 0.0% |
| 10-24 15:12 | 1,312 | 396 | 16 | 27 | 353 | 8.7% |
| 10-25 02:19 | 1,319 | 407 | 12 | 31 | 364 | 8.9% |
| 10-26 07:42 | 1,287 | 403 | 14 | 40 | 349 | 12.8% |

Three facts, and each one constrains the fix:

1. **Most of what reaches a prompt does nothing.** 88% of injected rules have a net effect of exactly
   zero: the flips they caused cancelled, or — for a rule shown once — there were none. That is not a
   neutral outcome for a prefix. The tokens are paid on every call, and section 3.5 measured what the
   payment buys. A pack that is nine parts inert is a context tax with a 12% chance of a consequence,
   and the consequence is twice as likely to be bad.
2. **Harm is not noise, it is a ratio.** 110 net-helpful rules against 229 net-harmful ones, the same
   direction in seven of eight runs. The eighth is the S2b value-oracle pack — the convention-transfer
   stage, whose rules were conditioned on a measured value rather than on a reading of a question —
   which broke nothing while repairing 8. Two caveats keep that from being a conclusion: it is the
   smallest run here (n = 145 questions), and eight repairs with zero breaks in 233 injections is
   consistent with a break rate as high as 1.3% per injection. It is a lead, not a result.
3. **Retrieval is the other half of the problem, and it is untouched.** Only 31% of stored rules ever
   reached a prompt. Whatever the distiller knows, the injector shows a third of it, and nothing here
   can say whether the third it chose was the right third — that question needs a rule-level
   counterfactual this project has not run.

**Unit, stated because it was got wrong.** The classes above count *rules*, not injection instances:
`helpful + harmful + neutral` equals the injected-rule count exactly. The first version of this report
read them as instances and published "3.90% of injected instances repaired the answer". The digits were
right and the unit was wrong, and the same digits support a much weaker claim — which is why the field
names now carry the unit (`helpfulRules`, `injectedRules`) and a test asserts the names. The one
instance-weighted number available is the last column, and it is reported per run rather than averaged,
because the artefact does not carry the instance totals needed to weight the runs against each other.

The numbers above predate the R6 gate. They describe the store the gate was applied to, not the
current implementation.

### 3.6.3 What replaced the prefix: a verifier over the pool

Sections 3.6.1 and 3.6.2 close the prefix as a position for memory. A rule shown to a foreign question
nets +0.00pp and breaks 42.6% of the targets a bare retry had already fixed; the store it comes from is
88% inert and 2:1 harmful when it is not. Neither finding says memory is worthless — both say that *text
distilled from a case carries nothing about another case*, and that a mechanism which must help has to
act on something the case and the question share.

The thing they share is not text. It is the shape of the answer. Three systems converged on that
independently: XiYan-SQL groups candidates by execution result before ranking them, R³-SQL groups and
resamples, GradeSQL trains an outcome reward model on execution labels and beats execution-based
Best-of-N by up to +4.33 on BIRD. This project's own attempt at the *fourth* thing — asking a model to
compare two result sets — measured −1.14pp, and the difference is not the idea of using execution; it is
that a model comparing result sets has no ground to stand on while a shape comparison does.

So the mechanism was rebuilt as six deterministic signals over an execution signature, each measured
alone before any of them was allowed to rank anything. The order is the design: eleven earlier
iterations shipped a composite and measured the composite, and when it came out negative nothing in the
result said which part was wrong.

**The gate.** A signal enters the composite only if `AUC − 0.5 > 2 SE` after Holm correction, with the
bootstrap standard error floored at `sqrt(0.25/min(n₁,n₂))` because a pool whose pairs are all
concordant returns zero variance and a zero variance read as certainty would pass a signal measured on
four candidates. On 350 BIRD Mini-Dev questions and five draws, 122 of them offered any choice at all,
and five of six signals cleared it:

| Signal | AUC | SE | z | Holm | Verdict |
|---|---|---|---|---|---|
| `value-type` | 0.608 | 0.017 | 6.25 | <0.001 | **kept** |
| `column-shape` | 0.579 | 0.017 | 4.57 | <0.001 | **kept** |
| `empty` | 0.572 | 0.017 | 4.17 | <0.001 | **kept** |
| `row-shape` | 0.563 | 0.019 | 3.38 | 0.0011 | **kept** |
| `duplicate-share` | 0.542 | 0.017 | 2.46 | 0.0137 | **kept** |
| `null-share` | 0.521 | 0.017 | 1.23 | 0.109 | removed |

The AUCs in that table are reconstructed, not the run's own: the artefact did not carry the evidence
BIRD ships with each question, so a re-analysis reads every question against an empty evidence string
while the run read both. The run's own readings are `value-type` 0.6015, `column-shape` 0.5998,
`row-shape` 0.5749, `empty` 0.5653, `duplicate-share` 0.5418, `null-share` 0.5213 — the same five kept
and the same one removed. The field is now required, so the next artefact cannot repeat the omission.

**What the gate is worth.** The composite of the five, scored as an arm inside the cross-fitted run
rather than simulated on a recorded pool: **+1.14pp** over the first draw on the same five draws,
54.57% against 53.43%, 7 gained and 3 lost, exact McNemar p = 0.344, 95% CI **[−0.57, +2.86]**. In
sample, on the 117 questions where a draw choice existed, it is +3.42pp — and 3.42 × 117/350 is 1.14,
so the two agree exactly.

That interval is the whole result. The point estimate is smaller than the **±1.4pp** an identical
prompt moves when it is run twice on these questions, and it is a quarter of the width of its own
interval. An earlier reading of +7.38pp was the same composite fed a question shape computed without
BIRD's evidence; with the evidence the effect is a third as large. The mechanism is real in direction —
positive in three folds, zero in two, negative in none — and unresolvable at this sample size on this
pool. It is not the discovery it once looked like.

**What it is worth decomposing.** The same pool says the sum is carried by one member. `value-type`
alone reaches 39.3% of the composite's 40.2% and never breaks a question the first draw had right; the
other four add one question between them and `row-shape` costs one. On 122 questions, one or two
questions is inside the binomial spread, so the honest statement is that the remaining four are
unproven rather than worthless — and the reason they look like four opinions when they are closer to one
is that every signal penalises an empty result, not only the one called `empty`.

**And the pool is why none of it can pay.** The ceiling this composite could ever have captured is 25
questions of 350 — the draws disagree on 1.46 answers per question, and 235 of 350 questions collapse to
a single answer. Yield is 4 net questions of 25, **0.16** against the 0.33 the stage required. Three
different generation procedures do not widen it: four procedures over the same questions produce **1.56**
distinct answers and two of the three arms are *worse* than the direct prompt (`gen-plan` −5.43pp,
p = 0.004; `gen-decompose` −3.14pp). The ceiling rises to 8.57pp and a chooser still retrieves nothing
from it.

That is the trade this section is making, stated plainly: a mechanism that can only *reject* what it
recognises has a ceiling, and the composite has found it. `scoreOf` returns no positive number by
construction. The next signal has to be one that can prefer a shape, and the stored object that would
give it that ability — a `(schema, execution signature, outcome)` triple rather than a sentence about a
question — is the rewritten form of R7.3, folded into the verifier as a prior rather than shown to a
prompt as text.

### 3.6.4 Memory has four positions, and three of them are measured

Every arm in this project puts memory in one of four places. Three now have numbers, and the fourth has
a price:

| Position | What memory does there | Measured | Cost |
|---|---|---|---|
| **Prompt prefix** | states rules before the question | **−3.14pp** [−6.29, −0.29], p = 0.071, +10 / −21 | 1 call |
| **Retry injection** | states them only after a first answer fails | **+0.29pp** over a retry with an empty pack — nothing | 1 call |
| **Verifier feature** | ranks candidates by what it recalls | never measured: no selector here reads a rule | 0 calls |
| **Verifier prior** | *is* the ranker: on this shape, were we right before | priced at **+0.86pp** scaled, CI to come | 0 calls |

The first two are the same object in two positions, and moving it changed nothing: what looked like
memory's effect on retry was the retry. That is the measurement that says the problem is the object and
not its timing — a rule distilled from one question carries nothing about another, so a better moment
to show it cannot help.

The fourth is the only position where the object itself changes. `memory-prior.ts` prices it at its
strongest, assuming extraction and retrieval are already solved: no rule text, no relevance filter, no
embedding, only *on this shape, how often were we right* answered from the other folds. On the 79
questions where five draws produced more than one shape — the questions the model was guessing on, first
draw right 20.3%, best of five 40.5% — the shape key takes 3 net questions of a 16-question ceiling and
the database key takes 1. Keying on the database fragments the memory: 208 keys leave 38 questions with
any support, while 118 leave 53. **A memory that insists on the schema is a memory that has usually
never seen this schema**, which is the same failure the rule store has, one level down.

So the honest summary of the flywheel at this point in the programme: the part of it that was built —
distill an episode into text, show the text — is measured and negative in every position. The part that
has never been built — recall the *outcome* of a shape rather than the *wording* of a lesson — prices at
under a point, and the run that decides it is dispatched and named in the roadmap with its cancellation
rule written down first.

### 3.7 The gap has a scale, and it is not the one we assumed

Our baseline is 53.43% execution accuracy on BIRD Mini-Dev (DeepSeek, DDL, evidence supplied, no
memory). XiYan-SQL publishes the same cell — DeepSeek with a DDL schema on BIRD dev — at **53.52%**.
Two independently built harnesses, 0.09pp apart, which is the best available evidence that our
protocol is sound and that the model is not what separates us from a 73–75% system.

What separates us is the **candidate pool**, and two published numbers make the comparison exact:

| | Generators | Candidates | Ceiling over one draw | Best selector | Captured |
|---|---|---|---|---|---|
| CHASE-SQL | 3 different procedures | 21 | **+13.95pp** (68.84 → 82.79) | 73.01 | 29.9% |
| microglia, one prompt | 1 procedure, 5 draws | 5 | **+7.14pp** (53.43 → 60.57) | 54.57 | 16.0% |
| microglia, four procedures | 4 procedures, 1 call each | 4 | **+8.57pp** (54.57 → 63.14) | 54.57 | 0% |

The three rows are the whole argument, and the third one is the correction this project needed to
measure. Four generation procedures do widen the pool: the union over them is worth +8.57pp, more than
five draws of one prompt. But a chooser among them captures **nothing** — the best arm is the control
itself, and two of the three generators are worse than it. The ceiling is not the constraint on its own;
the constraint is that our candidates differ in *wording* and agree in *answer*, so a wider pool of them
is a wider pool of the same answer.

CHASE-SQL's 29.9% capture from a 21-candidate pool is only possible because their procedures answer
differently. Ours do not: 1.46 distinct answers from five draws, 1.56 from four procedures. All four rows
above are run 40880218444's own numbers, so the columns are comparable within a row and the two microglia
rows are comparable with each other.

A selector cannot capture headroom the generator never produced. Every selection arm this project has
run — agreement, model, execution — was measured against a pool a quarter the width of the one the
competitor's selector was trained on, and the negative results are as much a measurement of the pool as
of the selector. This is the correction that the last eleven iterations were missing, and it is not a
correction about memory: it is a correction about **where test-time compute is spent**.

XiYan's own leave-one-out ablation puts the sizes on the components we can and cannot buy (BIRD dev):

| Component | Δ EX | Available without weights or a GPU |
|---|---|---|
| fine-tuned generator | −2.91 when removed | no |
| selection model | −2.74 when removed | yes, in a deterministic form |
| **M-Schema instead of DDL** | **+1.63** on this exact model | **yes** |
| ICL generator (skeleton-selected examples) | −1.31 when removed | yes |
| refiner on execution feedback | −0.55 when removed | yes |
| schema linking (as multi-schema sampling, not pruning) | +2.15 | yes |

The available column sums to 8.4pp and does not reach the 18pp gap, because leave-one-out deltas do not
add and the remaining mass is candidate diversity plus weights. That is why the target this project
sets for itself is **53.43 → 62–65**, not 80: a claim we can verify, against components we can build.

### 3.8 Order of work, and what each step can refute

| Step | Question | Cost | Refuted if |
|---|---|---|---|
| **R7.0** instrument the pool | how many distinct answers do five draws actually contain? | 0 calls | ran: **1.46 per question**, 235 of 350 collapsed |
| **R7.1** heterogeneous candidates | does the ceiling move? | 3 generators × 2 draws | ran: ceiling **+8.57pp**, disagreement **0.229**, distinct **1.56** — **refuted**, two arms worse than the control |
| **R7.2a** measure each execution signal alone | does any signature discriminate? | 0 calls | ran: five of six clear `AUC − 0.5 > 2 SE` |
| **R7.2b** deterministic verifier | what share of the ceiling is captured? | 0 calls | ran: **+1.14pp [−0.57, +2.86]**, yield **0.16** — criterion not met, stage closed |
| **R7.3** memory as a verifier feature | does position beat content? | 1 fold-aligned run | cancelled if R6 transfer ≈ 0 |

Every row but the last has now run, and the two that could have refuted the direction did. The sequence
did what it was built to do: R7.0 and R7.2a cost nothing and priced the prize at seven points, R7.1 spent
three arms and found no wider pool, and R7.2b spent nothing further to show that a chooser among 1.46
answers retrieves one point of it. The last row is the only one left, and it is the only one where memory
appears.

The order is the argument. R7.0 and R7.2a spend nothing and decide whether the expensive steps are
worth running; R7.3 — the only step where memory appears — is last and is cancelled rather than
reworked if the transfer measurement says the store cannot repair a question it was not built from.

### 3.9 Where this can be better than the systems ahead of it

Not on BIRD execution accuracy, and saying so is part of the design. Every system above 80% uses a
fine-tuned generator; this project runs on a closed API. Four things are nonetheless ours:

1. **Zero training, zero weights, zero GPU.** Every competitor's selection gain comes from a fine-tuned
   scorer (Qwen2.5-Coder-7B listwise, Gemma 2 9B LoRA, task-specific ORMs). A deterministic verifier
   that captures a third of the ceiling is a different product with zero marginal cost.
2. **A protocol nobody else publishes.** Paired bootstrap over 10,000 resamples, a `none-replica` noise
   floor on every run, a minimum detectable difference computed per run, and blocking gates that refuse
   a claim when instrument validity fails. XiYan, CHASE-SQL and R³-SQL publish point estimates;
   GradeSQL's own reviewer flagged its missing significance tests. A number with an interval is
   auditable in a way a number without one is not.
3. **Cross-run accumulation.** R³-SQL's resampling judge is single-question. A store of
   `(schema, signature, outcome)` triples accumulates across runs — the one form of memory that
   survives the AgentSM finding, because it is a prior over shapes rather than a lesson in a prompt.
4. **The negative results, published.** Twelve arms with one sign is a map of where not to spend. No
   competitor publishes theirs, which is why the field keeps rediscovering that prompt-injected lessons
   do not pay.

---

## 4. What "valuable" means in numbers: the unit economics

A single correction has four possible consumers. Assume a host with 1,000 runs/day and a 3%
correction rate — 30 corrections/day, 900/month.

| Consumer | Reuse assumption | Monthly artefact count | Marginal cost |
|---|---|---|---|
| Constraints (M1) | 60% of corrections yield a reusable rule | ~540 evidence events, ~40 distinct rules | $0 (no model call) |
| Exemplars (M2) | 90% of edits are valid pairs | ~810 pairs | $0 |
| Preference data (M3) | 810 pairs/month | 9.7k pairs/year — below most DPO thresholds | $0 to store, GPU to train |
| Eval cases (M4) | 100% | ~900/month | $0 |

The important number is not the data volume; it is that **M1/M2/M4 are free at the margin** and
effective in the same session. M3 is a downstream option, not the product.

`[ASSUMPTION]` The 3% correction rate is a planning figure, not a measured one. It is the first
instrumentation task in S1, because K2 depends on it.

---

## 5. Landscape

### 5.1 Research leaders, by layer

| Layer | Representative work | Core idea | What it does not solve |
|---|---|---|---|
| Preference optimisation | RLHF ([Christiano 2017](https://arxiv.org/abs/1706.03741)), InstructGPT ([Ouyang 2022](https://arxiv.org/abs/2203.02155)), DPO ([Rafailov 2023](https://arxiv.org/abs/2305.18290)), KTO ([Ethayarajh 2024](https://arxiv.org/abs/2402.01306)), GRPO ([DeepSeekMath 2024](https://arxiv.org/abs/2402.03300)) | Turn comparisons into policy updates | Needs volume, GPU, and a training cycle; not a request-path mechanism |
| Context adaptation | ACE ([2025](https://arxiv.org/abs/2510.04618)), Dynamic Cheatsheet, ExpeL ([2023](https://arxiv.org/abs/2308.10144)), ReasoningBank ([2025](https://arxiv.org/abs/2509.25140)) | Distil experience into a retrievable playbook | Each ships its own loop; no typing, provenance, or governance contract |
| Procedural memory | Agent Workflow Memory ([2024](https://arxiv.org/abs/2409.07429)) | Induce reusable workflows from trajectories | Workflow-level only; no notion of a single-field correction |
| Conversational memory | MemGPT ([2023](https://arxiv.org/abs/2310.08560)), A-MEM ([2025](https://arxiv.org/abs/2502.12110)), Zep/Graphiti, Mem0, Hindsight ([2025](https://arxiv.org/abs/2512.12818)) | Store, retrieve, update, consolidate | Storage-centric; corrections are just more text |
| Memory evaluation | LongMemEval ([2024](https://arxiv.org/abs/2410.10813)), MemoryAgentBench ([ICLR 2026](https://arxiv.org/abs/2507.05257)), MemBench ([ACL 2025](https://m0rtzz.github.io/paper-notes/ACL2025/llm_nlp/membench_towards_more_comprehensive_evaluation_on_the_memory_of_llm-based_agents)) | Five abilities; four competencies incl. selective forgetting | No benchmark measures "did a correction generalise" |
| Preference evaluation | RewardBench 2, PPE, JudgeBench, MT-Bench ([Zheng 2023](https://arxiv.org/abs/2306.05685)), MMRB2 ([2025](https://arxiv.org/abs/2512.16899)) | Measure whether a judge or reward model agrees with humans | Agreement is ~70–80% for frontier judges; humans >90% |

**The research gap is not an algorithm.** It is a contract: what a correction *is*, what may be
learned from it, how it expires, and how it is attributed. Every paper re-invents that contract;
none publishes it as a library.

### 5.2 Commercial landscape

| Product | Category | Runtime | What it does well | Where it stops | Licence / status |
|---|---|---|---|---|---|
| **Langfuse** | Observability + evals | Server + ClickHouse/Postgres/Redis | MIT core, self-host, traces, scores API, annotation queues, **`CORRECTION` score type** | A correction is a score on a trace: not distilled, not scoped, not retrieved, not credited | MIT (core) |
| **LangSmith** | Observability + evals | SaaS | Deepest LangChain integration, dataset experiments | Closed source; feedback is a label; no in-request knowledge | Commercial |
| **Braintrust** | Evals in CI | SaaS | Deployment-blocking regression gates, statistical significance | Evaluation, not learning | Commercial |
| **Arize Phoenix / W&B Weave / Opik** | Observability | Server/SaaS | Agent trace depth, OTel | Same boundary as above | Mixed |
| **Argilla + Distilabel** | Data curation | Server + Elasticsearch | Apache-2.0 annotation, HF-native, preference dataset pipelines | Human annotation, not runtime correction | Apache-2.0 |
| **Mem0** | Agent memory | Vector DB + LLM | LLM fact extraction, ADD/UPDATE/DELETE events, entity boosts | No correction input, no trust, no scope generalisation, no prompt pack | Apache-2.0 |
| **Zep / Graphiti** | Temporal memory | Neo4j/Kuzu/FalkorDB + LLM | Bi-temporal edges (`valid_at`/`invalid_at`/`created_at`/`expired_at`), BM25+cosine+BFS | Episode ingestion, not corrections; graph DB required | Apache-2.0 |
| **Letta** | Agent runtime | Postgres + pgvector, server | Core/archival/recall memory, block checkpoints, self-editing | Agent edits its own memory; no evidence-weighted admission | Apache-2.0 |
| **Supermemory** | Memory API | SaaS | Fast personal recall, connectors | Closed; no correction semantics | Commercial |
| **Humanloop** | LLMOps | — | Pioneered evals-as-discipline | Shut down 2025-09-08 after acqui-hire | Discontinued |

Two structural observations:

1. **The observability category owns the capture surface and stops at the dataset.** Its unit is a
   trace; ours is a *correction with provenance and a lifecycle*.
2. **The memory category owns storage and stops at retrieval.** Its unit is a memory; ours is a
   *claim with evidence, scope, and an outcome*.

### 5.3 Benchmarks that matter, and how much to trust them

| Benchmark | Measures | n | Reference point | Caveat |
|---|---|---|---|---|
| BIRD Mini-Dev | Text-to-SQL execution accuracy | 500 | nl2charts E1: 46.6% → **49.6%** (+3.00pp) | 52.8% annotation error rate reported ([Jin 2026](https://arxiv.org/abs/2601.08778)) |
| Spider2-Lite (SQLite subset) | Cross-file SQL | 260 | nl2charts E6: **20.0%** | Gold result sets, not SQL; db availability varies |
| BIRD-Interact Lite | Interactive SQL, clarification | 300 | SOTA ≈24% (c-Interact); GPT-5 8.67% full | User simulator is the authors' protocol, not a neutral oracle |
| nvBench 2.0 | Ambiguous text-to-visualisation | 7,878 queries / 24,076 charts | Step-Text2Vis F1@3 **81.50**, F1@5 **80.88**, P@1 99.20 | One-to-many gold; top-1 understates valid answers |
| Text2Vis | Answer + chart type | 1,985 | nl2charts E3: chart **44.94%**, answer 29.09%, joint 13.81% | Own grader; answer match is the bottleneck |
| LongMemEval-S | Five memory abilities | 500 | Cortex 83.55% (snapshot `a52628f`); Hindsight 91.4% | Reader/harness sensitive; commercial claims disputed |
| MemoryAgentBench | Retrieval, test-time learning, long-range, forgetting | 2,071 | All methods **<60%** average; none demonstrates selective forgetting | New; few independent replications |
| LoCoMo | Long conversational memory | ~1.5k | Vendor claims 92.5; independent 66.9 | Judge accepts ~63% of deliberately wrong answers ([audit](https://afx-team.github.io/hebb-mind/zh/benchmarks/locomo/vs-mem0.html)) |
| RewardBench 2 / MMRB2 | Judge/reward agreement | 1k+ per task | Frontier judges mid-70s; humans >90% | Measures the judge, not the product |

### 5.4 What the source says

Closed-source products were compared from public documentation only. Five open-source leaders were
read at the file level (`TECH-DESIGN.md` §8.4 has the full table):

| Project | File | Finding that matters |
|---|---|---|
| Mem0 | `mem0/memory/main.py`, `mem0/configs/prompts.py` | Phased add (context → top-10 recall → one extraction), `ADD/UPDATE/DELETE`, v3 `ADDITIVE_EXTRACTION_PROMPT` with `linked_memory_ids`; no correction event, no trust |
| Graphiti | `graphiti_core/edges.py`, `search/search_config.py` | Four timestamps per edge (world + system time), BM25 + cosine + BFS with RRF; strong temporality, episode-based ingestion |
| Letta | `letta/services/block_manager.py` | Block checkpoints/undo/redo, core/archival/recall memory; the agent edits itself, not the user's correction |
| Langfuse | `packages/shared/src/domain/scores.ts` | `ScoreDataType.CORRECTION`, `CORRECTION_NAME="output"`, sources API/EVAL/ANNOTATION; correction is a label on a trace |
| Argilla | `argilla-server/.../records.py`, `responses.py` | Records + responses + suggestions + vectors; annotation platform, no runtime |

**The closest competitor is Langfuse's `CORRECTION` score** — and it stops exactly where microglia
begins: turning that correction into a typed, scoped, evidence-weighted rule with a lifecycle and a
prompt budget. Graphiti is ahead on graph temporality; we say so rather than pretend otherwise.

**Consequence for our evaluation design.** We will not report a single unpaired number. Every claim
uses (a) the same questions in both arms, (b) an exact paired test, (c) a corrected or audited
subset where annotation errors are documented, and (d) a judge calibrated to κ ≥ 0.7 on human labels.

---

## 6. Product definition

### 6.1 Name and thesis

**microglia** are the resident immune cells of the brain. They prune unused synapses, strengthen the
ones that fire together, and clear debris — the maintenance layer that makes learning in the cortex
possible. The name is not decoration: this product prunes wrong rules, strengthens evidence that
works, and quarantines what is toxic. It is the maintenance layer for `@agentix-e/cortex`, not a
second brain.

> **Thesis.** A host application should be able to improve from its own corrections without
> becoming a data platform, without sending data anywhere, and without adopting a UI. Five lines of
> integration, one local journal, and a measurable delta on the next thousand runs.

**Positioning verdict.** The shape is viable **because** it is a library: the host already owns the
HITL surface (nl2charts has an editor, a chart picker, and SQL errors), the data never leaves the
process, and the value appears in the same session. A platform would have to earn a procurement
decision before producing a single rule; a library produces one on the first edit.

**Positioning, measured against a competitor shape.** The whitepaper's central distinction — a label
on a trace is not knowledge, and a memory of sentences is not governance — was tested by implementing
the competitor shape and running it on the same corrections. A similarity fact store (extract, dedupe,
retrieve the closest sentence, apply it) reaches **56.07%** against no-memory's 31.79%, so memory does
help. The governed loop reaches **100.00%**, a **+43.93pp** gap that comes from scope, admission, and
the guard rather than from retrieval. Under the same poison the fact store falls to **19.64%** —
**below** no-memory — while quarantine holds at 100%.

> A store that remembers everything is worse than a store that remembers nothing: it is confidently
> wrong exactly where it was supposed to help.

**Positioning correction from the live POC.** Sell **house conventions**, not chart knowledge. In
POC-2, a pack of generic chart rules left DeepSeek at 90.48% (one run) or moved it to 88.10% (the
other), while a pack of organisational conventions moved the same model from 0% to **75.00–89.29%**.
The product's promise is "your rules, applied consistently", not "the model learns charts".

### 6.2 Principles

| # | Principle | Consequence in the API |
|---|---|---|
| P1 | **No UI, no server, no tenancy** | The host owns the pixels; the library owns the semantics |
| P2 | **Feedback is evidence, not truth** | Admission is thresholded by weighted evidence, never by one click |
| P3 | **Knowledge is scoped, versioned, expirable** | Every item carries a scope, bitemporal validity, and a status |
| P4 | **Retrieval is structured first** | Scope is an index, not a post-filter; text ranks inside it |
| P5 | **Never rewrite; append and merge** | Delta distillation with deterministic dedupe and generalisation |
| P6 | **Rendered knowledge is data, never instructions** | JSON Lines inside a named element, `<` escaped |
| P7 | **Every claim is attributable and reversible** | Evidence ids, pack hash on the run, `retire`/`reinstate` |
| P8 | **Deterministic by default** | Clock, RNG, and store are injected |
| P9 | **Fail closed on trust** | Unknown-origin edits quarantine; they never reach a prompt |
| P10 | **Measure, do not assert** | Every release runs the gate suite; artifacts are committed |
| P11 | **CPU or WebGPU only** | No CUDA, no local GPU runtime, no fine-tuning; on-device encoders are optional |

### 6.3 Scope: what microglia is and is not

| In scope | Out of scope (by design) |
|---|---|
| A TypeScript SDK that captures, distils, retrieves, and attributes corrections | A hosted service or control plane |
| Embedded stores (JSONL, in-memory) and a Cortex projection | A vector database |
| Domain packs for nl2charts (chart, SQL, lexicon) | A charting library or a SQL engine |
| Dataset export (SFT/DPO/KTO/eval JSONL) | A training pipeline |
| Evaluation harness with paired statistics and gates | A leaderboard or a public benchmark submission |
| Poisoning defenses, redaction, namespace isolation | Multi-tenant identity, billing, RBAC |
| Diagnostics (`doctor`) and provenance inspection | Dashboards, annotation queues, reviewer UI |

### 6.4 The loop, in six steps

```mermaid
sequenceDiagram
  participant U as User
  participant H as Host (nl2charts)
  participant M as microglia
  participant S as Journal
  U->>H: question
  H->>M: recall({task, text, scope})
  M->>S: scope + lexical query
  S-->>M: active knowledge
  M-->>H: pack (rendered + ids + hash)
  H->>H: generate with pack
  H->>M: begin({input, pack}) → complete(output)
  M->>S: RunRecord (provenance incl. knowledgeIds)
  U->>H: edit / thumbs / execution error
  H->>M: run.edit(after) / rate() / outcome()
  M->>S: FeedbackEvent + credit to applied items
  Note over M: offline, idempotent
  H->>M: distill()
  M->>S: create / merge / generalise / quarantine
```

Two properties are architectural, not incidental:

- **Capture and learning are separate calls.** A host can capture on every request and distill on a
  cron. Learning never blocks a response.
- **Crediting happens at feedback time, not at distillation time.** The run knows which items were
  in its prompt; a later batch job does not.

### 6.5 Personas and jobs to be done

| Persona | Job | What they touch |
|---|---|---|
| **Host developer** (owner of nl2charts) | "Make my product improve without building a data platform" | `openMicroglia`, `recall`, `begin`, `distill` |
| **Domain expert / analyst** | "When I fix a chart, stop asking me again" | The host's existing editor; no new UI |
| **Platform engineer** | "Prove it works and prove it is safe" | `doctor`, exports, gates, artifacts |

### 6.6 Why a library rather than a platform

| Dimension | Library (chosen) | Platform (rejected) |
|---|---|---|
| Integration | `npm i` + 5 calls | SDK + account + data processing agreement |
| Data residency | Stays in the host process | Leaves the building |
| Time to first value | One session | Procurement |
| Failure mode | Host keeps working without it | Host loses a dependency |
| Moat | Semantics + evaluation rigor | Integrations + seats |
| Precedent | Sentry SDK, OpenTelemetry, PostHog | Humanloop (absorbed) |

The build/buy line — which npm packages to adopt, which capabilities must be ours, and why — is
specified in `TECH-DESIGN.md` §3.3. The short version: adopt storage engines, test runners, and
model runtimes; build everything that decides what a correction means, what may reach a prompt, and
how a claim is measured.

The platform route also collides with model vendors: Anthropic absorbed Humanloop's team into its
console, and LangSmith's gravity is the LangChain ecosystem. A library that any host can embed is
the complement, not the competitor.

---

## 7. Reference host: nl2charts

The `AgentiX-E/nl2charts-docs` repository is not a mock host. It contains an evaluation plan
(v5.28) with machine-readable gates, 83 POC directories, and measured results on public data:

| ID | Benchmark | n | Result | Gate |
|---|---|---|---|---|
| E1 | BIRD Mini-Dev | 500 | 46.6% → **49.6%** (+3.00pp, same model) | BIRD1 (≥45.5%) |
| E2 | nvBench 2.0 (chart type) | 750 | **91.73%** rule arm; 90.67% LLM; unnamed subset 74.35% | LEVER1 |
| E3 | Text2Vis | 1,985 | chart **44.94%** (rule 33.65%), answer 29.09%, joint 13.81% | CHART1 |
| E6 | Spider2-Lite (SQLite) | 260 | **20.0%** | EV8 |
| E7 | Cross-engine gold consistency | 492 | 98.2% self-consistency; 97.68% verdict agreement | EV9 |
| E8 | Connector contract (PostgreSQL) | 12 | 12/12 | XCONN1 |
| E4 | BIRD-Interact Lite | 300 | reference only (gold withheld by design) | — |

Three properties make it the ideal first host:

1. **The HITL surfaces already exist.** Users pick a chart, edit a spec, or correct a SQL result.
   Nothing new needs to be designed.
2. **The ground truth is executable.** A SQL correction is verified by running it; a chart choice is
   verified against a gold mark. Feedback quality is therefore measurable, not assumed.
3. **The gates are already strict.** `BIRD2` forbids reporting a delta without a p-value; `CONF1`
   forbids accuracy without coverage and a 95% CI. Microglia inherits an evaluation culture instead
   of importing one.

### 7.1 What microglia changes for nl2charts

| Surface | Today | With microglia | Expected mechanism |
|---|---|---|---|
| Chart type | 91.73% rule / 90.67% LLM; 74–75% on unnamed charts | Learn "intent → mark" per domain; teach the unnamed subset from edits | M1 constraint |
| Text-to-SQL | 49.6% BIRD; failures are execution + schema errors | Learn lexicon ("revenue = SUM(net_amount)"), join paths, and error fixes | M1 + M3 lexicon |
| Clarification | BIRD-Interact reference only | Every answer becomes a lexicon entry scoped to the schema | M1 lexicon |
| Evaluation | Gates exist; cases are curated | Every correction becomes a regression case automatically | M4 |

The economic case is narrow and testable: **reduce the second correction of the same kind**. A user
who fixes "pie for 9 categories" once should not have to fix it again in the same domain. That is
the product promise, not "the model gets smarter".

---

## 8. Memory substrate: what Cortex can and cannot be

Cortex is a value-driven cognitive memory layer by the same organisation. It is a strong substrate
and a weak feedback ledger. The distinction matters for the architecture.

### 8.1 What Cortex provides (verified in source)

| Capability | Where | Usable by microglia |
|---|---|---|
| `Storage` KV contract (SQLite/Postgres) | `cortex-core/src/interfaces/storage.ts` | Yes, as a projection target |
| `MemoryValue` with `value`, `confidence`, `sourceTrust`, tags, FSRS state | `cortex-core/src/domain/memory.ts` | Yes, field-for-field |
| Bitemporal `Fact` (valid time + system time) | `cortex-core/src/domain/fact.ts` | Yes, for correction validity |
| `decideWrite` / `decideRetrieval` value gates | `cortex-core/src/value/value.ts` | Yes, as a second admission opinion |
| `consolidate` (Hebbian + FSRS) | `cortex-core/src/consolidation/consolidate.ts` | Partially; needs a caller |
| `MemorySystem` composition + conformance suite | `cortex-memory/` | Yes, for LongMemEval-style QA |

### 8.2 What Cortex does not provide (and microglia must)

| Gap | Evidence | Consequence |
|---|---|---|
| **No derivation edge** | `AUDIT-CODE-VS-DOCS.md` and `DECISION-PROVENANCE-NODE.md`: `Fact` has origin/trust/time but not *which facts produced it*; a speculative `ProvenanceNode` was deleted | A correction cannot cite *which prior knowledge* it supersedes; microglia keeps its own evidence DAG |
| **No credit assignment** | `ARCHITECTURE.md`: "TD(λ) credit assignment — **Not implemented**" | Cortex cannot learn that a rule helped or hurt; microglia credits at feedback time |
| **No calibration** | "Abstention confidence calibration (Platt/temperature) — **Not implemented**; thresholds are fixed constants" | A fixed threshold cannot adapt to a host's base rate; microglia uses Wilson-smoothed empirical rates |
| **No feedback ingestion** | There is no `FeedbackEvent`, `Correction`, or `Edit` type anywhere in the repo | Cortex cannot tell a thumbs-down from a conversation turn |
| **Benchmark scope** | 83.55% LongMemEval-S at `a52628f`, **55 commits behind** master; no LoCoMo; the eval harness is not the product | Do not inherit the number as a product claim |
| **Not on npm** | Every `@agentix-e/cortex-*` `npm view` returns 404 (verified 2026-10-20) | A hard dependency is impossible today |

### 8.3 Verdict

> **Cortex is viable as a projection and cognitive-maintenance layer; it is not viable, as it stands,
> as the feedback store or the flywheel engine.**

The adapter in `packages/cortex-adapter` proves the projection is implementable: `KnowledgeItem →
MemoryValue` preserves confidence, trust, type, and scope tags; `Fact` preserves both time axes; and
the projection is inspectable and removable. What the adapter deliberately does **not** do is make
Cortex the source of truth — because a feedback ledger needs append-only events, evidence weights,
and a derivation graph that Cortex does not model.

The integration path is therefore:

1. **Now:** microglia owns the journal; `CortexProjection` mirrors knowledge into Cortex so its value
   gates and FSRS scheduling can run over the same items.
2. **After cortex publishes:** replace the structural types with `import type`, add a conformance test
   against the real `Storage`, and pin a version range.
3. **Upstream:** contribute `derivedFrom?: string[]` on `Fact` (the remedy Cortex's own audit names)
   and a calibration module. Both are small, both unblock a real integration.

---

## 9. Success metrics

A flywheel product that reports only accuracy will be gamed by a single benchmark. The metric set is
therefore layered: one north star, three value metrics, five guardrails.

| Layer | Metric | Definition | Target (S2) |
|---|---|---|---|
| **North star** | **Correction reuse rate** | Share of held-out questions that are wrong without memory and right with it, in the same scope | ≥ 25% of previously-failing cases |
| Value | Edit effort | Mean normalised edit distance per run | −30% vs baseline |
| Value | Negative feedback rate | Negative signals per 100 runs | −25% vs baseline |
| Value | First-pass acceptance | Share of runs with no correction | +10pp |
| Value | **House-convention adherence** | Share of house-rule cases where the output follows the convention | ≥85% |
| Guardrail | Poison activation | Active items whose source trust is below quarantine | **0** |
| Guardrail | Namespace leakage | Items retrieved across a namespace boundary | **0** |
| Guardrail | Knowledge precision | Active constraints correct on a probe grid | ≥ 85% |
| Guardrail | Added latency | p95 of `recall` + render | ≤ 50ms |
| Guardrail | Added tokens | Mean pack size | ≤ 300 tokens |

The POC measures all but the production telemetry ones; §11 of the tech design reports them.

---

## 10. The path to state of the art

"SOTA" here means *the best published result on a named benchmark under a stated protocol*, not a
feeling. The path has four stages, each with a stop rule.

**The CPU constraint shapes the strategy.** No fine-tuning, no local GPU, no inference server. Every
gain must come from context: better correction capture, better retrieval, better injection, more
interaction. That rules out the "fine-tune a 7B on BIRD" route and makes the memory layer the only
lever — which is also why every target is stated **against the same backbone**, never as an absolute
leaderboard number.

### 10.1 S0 — Mechanism (done, in this repository)

| Gate | Criterion | Measured |
|---|---|---|
| G1 | ≥ +20pp over baseline on held-out questions | **+68.21pp** |
| G2 | Exact McNemar p < 0.001 | **p < 0.0001** |
| G3 | 20% label noise still ≥ +15pp | **+68.21pp** |
| G4 | No untrusted knowledge active | **0** |
| G5 | Poisoned traffic within 3pp of clean | **0.00pp** |
| G6 | Unseen domain: generalisation beats per-domain scoping by ≥40pp | **100.00% vs 32.86%** |
| G7 | Namespace leakage | **0** |
| G8 | Active knowledge precision ≥80% | **100%** |
| G9 | No-memory arm does not drift | **flat** |
| G10 | Quarantine actually exercised | **2 items** |
| G11 | Removing the trust ceiling harms accuracy | **−14.28pp** |

Live POCs (this round, real APIs):

| POC | Result | What it proves |
|---|---|---|
| LLM distillation | 91.7–95.8% mark, 95.8–100% intent, 0 active injections | Free text becomes typed knowledge |
| LLM reader, generic | 90.48% → 90.48–88.10% | Generic rules are not the product |
| LLM reader, house | 0.00% → 75.00–89.29% | Organisational convention is the product |
| Poison control | 0 to −8.33pp | Model-dependent; quarantine is the defence |
| Embedding retrieval | heavy paraphrase +8.3pp recall@1 | Optional channel, not a default |
| CPU scale (10k) | 2.6–3.1 ms p95, 14 MB (1.9–4.4 ms across sizes/runs) | No GPU, no server |

S0 proves the mechanism on a controlled workload. It proves nothing about public benchmarks.

### 10.2 S1 — Shadow mode on the host (weeks 1–4)

- **Data:** nl2charts private adjudicated set (E5, n=1300, two annotators, κ ≥ 0.7).
- **Design:** shadow mode — memory influences a *shadow* prediction, not the served one. No user risk.
- **Metric:** paired delta on chart top-1 and SQL execution match; correction reuse rate.
- **Gate:** +3pp on chart top-1, no regression >1pp on SQL, precision ≥85%.
- **Stop:** K1.

### 10.3 S2 — Public benchmarks (weeks 5–12)

The suite is chosen to cover five axes, so a gain cannot hide in one modality:

| Axis | Benchmarks | Why it is in the suite |
|---|---|---|
| Executable SQL | BIRD Mini-Dev, Spider2-Lite, BIRD-Interact | The correction is verifiable by execution |
| Visualisation | nvBench 2.0, Text2Vis | The correction is a structured spec |
| Memory abilities | LongMemEval-S, MemoryAgentBench | The substrate must not regress |
| Preference quality | RewardBench 2, MMRB2 | The judge must be calibrated |
| Host reality | nl2charts E5 (n=1300, κ≥0.7) | The only set drawn from the actual product |


| Benchmark | Arm | n | Primary metric | Target | Why this target |
|---|---|---|---|---|---|
| BIRD-Interact (c-Interact) | same backbone, memory on/off | 600 (Full); 300 (Lite) as reference | task success | **+5pp** over same-backbone zero-shot | 300 tasks only detect ~8pp at 80% power; the full set is used for +5pp |
| BIRD Mini-Dev | same backbone | 500 | execution match | **no regression >1pp**; stretch +3pp | Annotation-error-corrected subset reported alongside |
| nvBench 2.0 | same backbone | 750 | chart top-1 | **+3pp**, and **+5pp on the unnamed subset** | The ambiguous subset is where interaction should help |
| Text2Vis | same backbone | 1,985 | answer match | **29.09% → 33%** | Answer, not chart, is the bottleneck (E3) |
| MemoryAgentBench | memory arm | 2,071 | four-competency average | **≥60%** | Every reported method is below 60% |

All targets are paired and preregistered. A target that is missed is reported as missed.

### 10.4 S3 — SOTA chase (months 4–9)

| Claim | Benchmark | Current published | Our target | Risk |
|---|---|---|---|---|
| Interactive SQL with a correction memory | BIRD-Interact Lite | ~24% (c-Interact) | **≥30%** | The benchmark's user simulator is an authored protocol; gains may not transfer |
| Ambiguous text-to-vis | nvBench 2.0 | F1@5 80.88 (Step-Text2Vis) | **≥85** | Requires a stronger reader than the POC's rule |
| Agent memory with selective forgetting | MemoryAgentBench | <60% average | **≥65%** | No system demonstrates selective forgetting; this is research, not engineering |
| Judge agreement | RewardBench 2 / PPE | Frontier mid-70s | **κ ≥ 0.7** vs 200 labels | Judge bias is systematic; calibration is the work |

`[ASSUMPTION]` These are forecasts. They are falsifiable, preregistered, and will be withdrawn if the
S2 effect does not replicate.

### 10.5 Statistical protocol (non-negotiable)

1. **Paired design.** Same questions, both arms, one unit per question.
2. **Exact McNemar** for binary outcomes; **bootstrap 10k** for the delta CI.
3. **Power first.** For a +5pp effect with discordance ~0.2, n≈780 is required; n=300 only detects
   ~8pp. We size the set to the claim, not to the budget.
4. **Preregistration.** Hypothesis, endpoint, n, and stop rule written before the run.
5. **Interleaved runs.** When the model is stochastic, 4 runs per arm, interleaved, pooled by
   question (never by sample).
6. **Judge calibration.** Order-swapped double scoring, length control, κ vs 200 human labels.
7. **Corrected subsets.** For BIRD/Spider2, report the ARCwise-Plat corrected numbers alongside.
8. **No single-number claims.** A delta without a CI and a p-value is not reported.

### 10.6 What would falsify the thesis

- A rule learned in one domain does not transfer to another (G6 fails on a second held-out domain).
- Corrections are idiosyncratic: the same user contradicts themselves more often than they repeat.
- The host's own model already uses the pack and ignores it (measured by an A/B on pack presence).
- Retrieval precision collapses at 10k items (the POC's store is O(n) and small).

---

## 11. Risks

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | **Memory poisoning** — an attacker plants a rule | High | Critical | Trust ceiling + quarantine + declarative-only rendering + namespace isolation; G4/G11 gates | Core |
| R2 | **Benchmark overfitting** — the pack encodes the test set | Medium | High | Held-out domains, preregistration, corrected subsets, no training on eval | Eval |
| R3 | **Noise dominates** — users correct inconsistently | High | Medium | Evidence thresholds, contradiction resolution, retirement; measured in the noise arm | Core |
| R4 | **Cold start** — no feedback, no value | Certain | Medium | Ship with zero-knowledge behaviour identical to baseline; value starts at correction 1 | Product |
| R5 | **Scope explosion** — one rule per field | Medium | Medium | Generalise the domain dimension only; measured by G6 | Core |
| R6 | **Privacy** — feedback contains secrets | High | High | Redaction before persistence, not at export; `redactions` counter | Core |
| R7 | **Judge bias** — the eval flatters the product | High | High | κ calibration, order swap, length control, human spot checks | Eval |
| R8 | **Cortex drift** — the substrate changes underneath | Medium | Medium | Pin a commit; adapter conformance test; projection is one-way | Integration |
| R9 | **Host ignores the pack** — tokens spent, nothing changes | Medium | High | Pack hash on the run; A/B on pack presence; token budget | Product |
| R10 | **Legal** — dataset licences (BIRD CC BY-SA, Spider2 terms) | Medium | High | No redistribution; cite and link; export stays in the host | Legal |
| R11 | **Complexity** — the host cannot debug a wrong rule | Medium | Medium | `doctor`, provenance ids, `renderConstraint`, a one-command replay | DX |
| R12 | **Negative transfer from generic rules** — the pack makes a strong model worse | Measured −2.38pp | High | Ship house conventions only; measure with/without on the host's own set before enabling | Product |
| R13 | **Hybrid retrieval dilutes** — a noisy lexical list outranks the semantic one | Measured (heavy: fusion MRR < dense) | Medium | Confidence-gated fusion, not unconditional RRF | Retrieval |
| R14 | **GPU creep** — an encoder or reranker quietly requires CUDA | Medium | High | N11: CI is CPU-only; WebGPU is opt-in; no torch dependency in the lockfile | Eng |

---

## 12. Roadmap

| Phase | Duration | Deliverable | Exit criterion |
|---|---|---|---|
| **P0 Mechanism** | done | 8 packages, 370 tests, 9 arms, 15 gates, 3 micro-ablations | `pnpm check` green in `AgentiX-E/microglia` |
| **P0.5 Live POC** | done | DeepSeek distillation, LLM reader (generic/house/poison), embedding retrieval, CPU scale | Artifacts in `eval/results/`; CI `poc-live` green |
| **P1 Host shadow** | 4 weeks | nl2charts integration behind a flag; correction telemetry | S1 gate met, K2 measured |
| **P2 Public eval** | 8 weeks | BIRD-Interact / nvBench / Text2Vis harnesses; preregistered reports | S2 gates met or honestly missed |
| **P3 Hardening** | 6 weeks | SQLite store, Cortex adapter v1, red-team suite, docs | No P0 gap in the register |
| **P4 SOTA push** | 12 weeks | S3 claims, one paper-quality report | Claim accepted or withdrawn |

Resourcing: one engineer for P0–P1 (done/funded), one engineer + one evaluator for P2–P4.

---

## 13. Licensing and sustainability

- **SDK:** MIT, consistent with Cortex and the rest of `AgentiX-E`.
- **No hosted service.** This is a product decision, not a limitation: the moment there is a control
  plane, the data-residency argument that makes the library attractive disappears.
- **Sustainability:** support contracts for integration and evaluation, not seat licences. The
  reference host (nl2charts) is the first paid integration and the first case study.
- **Contribution policy:** domain packs are separate packages so a host can publish its own without
  forking the core.

---

## 14. References

**Feedback flywheels and HITL**

1. Zhao et al. *Agent-in-the-Loop: A Data Flywheel for Continuous Improvement in LLM-based Customer Support.* EMNLP 2025 Industry. https://aclanthology.org/2025.emnlp-industry.135/
2. Shukla et al. *Adaptive Data Flywheel: Applying MAPE Control Loops to AI Agent Improvement.* EACL 2026 Industry. https://aclanthology.org/2026.eacl-industry.33
3. Zhang et al. *Agentic Context Engineering: Evolving Contexts for Self-Improving Language Models.* ICLR 2026. https://arxiv.org/abs/2510.04618
4. Ouyang et al. *ReasoningBank: Scaling Agent Self-Evolving with Reasoning Memory.* ICLR 2026. https://arxiv.org/abs/2509.25140
5. Zhao et al. *ExpeL: LLM Agents Are Experiential Learners.* AAAI 2024. https://arxiv.org/abs/2308.10144
6. Wang et al. *Agent Workflow Memory.* 2024. https://arxiv.org/abs/2409.07429

**Preference optimisation**

7. Christiano et al. *Deep Reinforcement Learning from Human Preferences.* 2017. https://arxiv.org/abs/1706.03741
8. Ouyang et al. *Training Language Models to Follow Instructions with Human Feedback.* 2022. https://arxiv.org/abs/2203.02155
9. Rafailov et al. *Direct Preference Optimization.* 2023. https://arxiv.org/abs/2305.18290
10. Ethayarajh et al. *KTO: Model Alignment as Prospect Theoretic Optimization.* 2024. https://arxiv.org/abs/2402.01306
11. DeepSeekMath. *GRPO.* 2024. https://arxiv.org/abs/2402.03300

**Memory**

12. Packer et al. *MemGPT.* 2023. https://arxiv.org/abs/2310.08560
13. Xu et al. *A-MEM: Agentic Memory.* 2025. https://arxiv.org/abs/2502.12110
14. Wu et al. *LongMemEval.* 2024. https://arxiv.org/abs/2410.10813
15. Hu et al. *MemoryAgentBench.* ICLR 2026. https://arxiv.org/abs/2507.05257
16. Latimer et al. *Hindsight.* 2025. https://arxiv.org/abs/2512.12818
17. *Mem0 benchmark report and the LoCoMo dispute.* https://mem0.ai/blog/ai-memory-benchmarks-in-2026
18. *Independent reproduction of agent-memory claims.* https://genalphai.com/is-agent-memory-the-wrong-abstraction-the-2026-evidence
19. *LoCoMo audit.* https://afx-team.github.io/hebb-mind/zh/benchmarks/locomo/vs-mem0.html
20. *How to read an agent-memory benchmark.* https://dreaming.press/posts/how-to-read-an-agent-memory-benchmark

**Benchmarks and evaluation**

21. Li et al. *BIRD.* 2023. https://arxiv.org/abs/2305.03111
22. Huo et al. *BIRD-Interact.* ICLR 2026. https://arxiv.org/abs/2510.05318 · https://mlanthology.org/iclr/2026/huo2026iclr-birdinteract
23. *BIRD-Interact project page.* http://bird-interact.github.io/
24. *nvBench 2.0.* 2025. https://arxiv.org/abs/2503.12880 · http://nvbench2.github.io
25. Jin et al. *Pervasive Annotation Errors Break Text-to-SQL Benchmarks and Leaderboards.* VLDB 2026. https://arxiv.org/abs/2601.08778
26. Zheng et al. *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena.* 2023. https://arxiv.org/abs/2306.05685
27. *Position and verbosity bias: cross-benchmark synthesis.* 2026. http://spectrumofresearch.com/index.php/sr/article/view/53
28. *MMRB2: Multimodal RewardBench 2.* 2025. https://arxiv.org/abs/2512.16899

**Competitor source (audited 2026-10-20)**

36. Mem0 — https://github.com/mem0ai/mem0 (Apache-2.0)
37. Graphiti — https://github.com/getzep/graphiti (Apache-2.0)
38. Letta — https://github.com/letta-ai/letta (Apache-2.0)
39. Langfuse — https://github.com/langfuse/langfuse (MIT core)
40. Argilla — https://github.com/argilla-io/argilla (Apache-2.0)

**Security**

29. Torres et al. *When Agents Remember Too Much: Memory Poisoning Attacks on LLM Agents.* 2026. https://arxiv.org/abs/2607.06595
30. *Hidden prompts can plant false memories in AI agents.* TechXplore, 2026. https://techxplore.com/news/2026-07-hidden-prompts-false-memories-ai.html
31. *Agent memory poisoning (OWASP ASI06 overview).* https://tessary.ai/answers/agent-memory/what-is-agent-memory-poisoning

**Competitors**

32. Langfuse — https://langfuse.com/ · annotation queues: https://get.langfuse.com/docs/evaluation/evaluation-methods/annotation-queues
33. LangSmith / Braintrust / Phoenix comparison — https://dev.to/gabrielanhaia/langfuse-vs-langsmith-vs-phoenix-vs-braintrust-the-honest-2026-comparison-253p
34. Argilla — https://argilla.io · Distilabel — https://distilabel.argilla.io/
35. Humanloop acquisition and shutdown — https://humanloop.com · https://seedtable.com/exits/humanloop

---

*Next: `TECH-DESIGN.md` for the package layout, API, algorithms, security model, evaluation protocol,
POC results, and the gap register.*
