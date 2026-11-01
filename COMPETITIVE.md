# Competitive anatomy

**What this document is.** A reading of the systems that are ahead of us, at the level of the
mechanism rather than the leaderboard row, and a decomposition of the gap between our baseline and
theirs into components we can each measure on our own protocol.

**What it is not.** A claim that any published number transfers to our setting. Every figure below
sits under a source grade, because three of them are from a paper's own ablation (high), two are from
a leaderboard table read on one day (medium), and several are from a secondary round-up whose primary
table nobody here has opened (low, marked). The project's standing rule holds: a number we have not
reproduced is a hypothesis with a citation, not evidence.

## 0. Three roles, and the one that was being read as the wrong one

This document is titled *competitive anatomy* and every system it names arrives through that door, which
produced a category error worth correcting before anything else: **a system appears here for one of three
reasons that have nothing to do with each other, and only the first is a competitor.**

| Role | What it means | What can be compared | Members |
|---|---|---|---|
| **Product competitor** | builds the same artefact we would ship, and would be the alternative in a buying decision | **EX on the same task**, and nothing else | XiYan-SQL, CHASE-SQL, R³-SQL, Databricks-RLVR, Gemini-SQL2, GrainSQL |
| **Same-unit control** | publishes one manipulation we also performed, so the two numbers are the same quantity | **Δpp from an ablation**, which is the only unit in this file where our number and theirs are comparable | BIRD-GPT-4, DAIL-SQL, CHESS, **RSL-SQL** |
| **Methodology peer** | publishes enough about its own measurement — interval, sample, resolution — that the *quality of the claim* can be compared | **whether a reading is admissible**, not its value | the competitor's ablation tables, and nobody's intervals but ours |

**RSL-SQL is in the second row, and reading it as the first is what this section fixes.** It has never been
a product alternative: it is a bidirectional-linking text-to-SQL system whose published value to us is that
its Table reports a **12.71pp schema-linking ablation on BIRD dev, 1,534 questions** — the same benchmark,
the same model family, and the same *kind* of measurement as our own evidence ablation. Quoting 17.60 against
12.71 is a comparison of two ablation deltas; quoting our 57.63 EX against its leaderboard row would be a
comparison of two systems that differ in a dozen ways at once, and this document does not do that.

**The distinction is not pedantry, because the two roles license opposite actions.** A product competitor's
number tells us where to spend engineering on the thing we ship; a same-unit control's number tells us which
of *our own* components is mispriced. §4's table is the second kind, §1's is the first kind, and mixing them
produced the three misreadings this file has already had to correct: the "same cell, 0.09pp apart" claim
(§1, corrected 2026-10-30), the "20 points come from schema linking" inference (§2, demoted in R24), and a
24.86pp effect quoted against systems measured on a different population (§4, corrected in R24).

**And a product-level note that the roles make obvious.** None of the first-row systems is an alternative to
this project, because this project does not ship a text-to-SQL system: it ships a **library that turns a
host's corrections into scoped knowledge**, and text-to-SQL is one host among several — `nl2charts` is the
one in the README, τ²-bench is the one with a second harness. The first-row systems are therefore *hosts that
could embed us*, and the honest competitive question about them is not "do we beat their EX" but "would their
pipeline improve if our pack were injected" — which is R26's finding and not a leaderboard.

**One positioning claim has been withdrawn rather than qualified, and it is recorded here because this is the
document that makes positioning claims.** Until R27 stage 2, this section and the repository README described the
measurement layer as a *scenario-agnostic protocol*: thirty-nine gates, thirty-seven of which name no scenario
type, from which the project asserted that a second application scenario could be measured by the same gates
without writing its own. **The signature count was correct and the inference was wrong.** When τ²-bench — the
second harness this document has pointed at since §1 — was actually scored by those gates, **four fired, two of
them vacuously, and thirty needed an experiment τ² had never run** (`V45` names no scenario type and cannot fire
without a clearance arm). A gate is as portable as the arm behind it; the gates are a catalogue of validity
conditions, and each lane instantiates the subset its arms support.

What replaces it is narrower and checkable, and it is the version a sceptic can audit against code rather than
prose: **the apparatus is scenario-agnostic.** τ² is measured by the same gate function, the same publication
order and the same artefact schema **with no edit to a single gate**, and the one change the second scenario
forced in the type went the other way — eight mandatory fields became optional, because two of them are
unknowable to a lane whose model runs out of process. The stronger sentence the project used to write would have
been a claim about a fixture's coverage. This one is a claim about a boundary, and
`packages/eval/src/tau2-gates.ts` is where it is either true or false.

---

## 1. The finding that reframes everything

Our BIRD Mini-Dev baseline — DeepSeek, DDL schema, evidence supplied, no memory — is **53.71%
execution accuracy on 350 questions**. XiYan-SQL publishes **DeepSeek + DDL schema on BIRD dev =
53.52% on 1,534 questions**. The two numbers are 0.19pp apart.

**Correction (2026-10-30, R8.3).** An earlier revision of this section called those two numbers "the
same cell, 0.09pp apart" and read the agreement as validating our harness. They are not the same cell:
theirs is dev, ours is a 350-question subset of dev, and a difference of 0.09pp between an estimate on
350 questions and one on 1,534 is 0.03 of the smaller estimate's standard error. That is what agreement
looks like and also what two coarse numbers look like; it cannot distinguish the two. The published
cell's own standard error is **±1.27pp** — seven times the gap the prose was treating as a match — and
the correct verdict, produced by `compareCell` and archived in `eval/results/poc-cell-comparison.json`,
is **`indicative`**, never `reproduced`.

What survives the correction is weaker and still useful: our no-memory number is *consistent with* the
published baseline for the same model and schema form, so the gap to a 73–75% system is not plausibly
an artefact of a badly built harness. It is a claim about consistency inside a ±7.7pp band, not a
reproduction, and a genuine reproduction needs the dev split (recorded as R8.3b).

| System | Role | Generator | Schema form | Candidates | BIRD dev / test EX | Gap from 53.5 |
|---|---|---|---|---|---|---|
| **microglia (ours), no memory** | control | DeepSeek, API | DDL | 1 | **57.63 dev (n=1,534)**, 53.71 Mini-Dev (n=350) | **+4.11 (reproduced)** |
| **microglia (ours), memory arm** | — | DeepSeek, API | DDL | 1 + pack | **56.26 dev (n=1,534)** | +2.74 |
| XiYan-SQL baseline | control | DeepSeek | DDL | 1 | 53.52 (dev, n=1,534) | −0.19 (indicative) |
| XiYan-SQL + M-Schema | control | DeepSeek | M-Schema | 1 | 55.15 (dev) | +1.63 |
| XiYan-SQL, full | **competitor** | FT + ICL ensemble | M-Schema | 5–21 | 71.58 (dev), 75.63 (test) | +18.06 / +22.11 |
| CHASE-SQL | **competitor** | Gemini 1.5 Pro | DDL + values | 21 (3×7) | 73.01 (dev), 73.0 (test) | +19.49 |
| R³-SQL | **competitor** | undisclosed | — | multi | 75.03 (dev) | +21.51 |
| Databricks RLVR-32B | **competitor** | Qwen2.5-Coder-32B, RL-trained | — | 1 / 7 | 73.56 single, 75.68 (7-SC) test | +20.04 |
| Gemini-SQL2 | **competitor** | Gemini 3.1 Pro | — | many | 80.04 (test) | +26.52 |
| AskData (AT&T CDO / DSAIR) | **competitor, current SOTA** | GPT-4o + proprietary pipeline | — | — | **83.40 (test), 78.49 (dev)** | +29.88 / +20.86 |
| GrainSQL | **competitor** | undisclosed | — | — | 82.95 (test), 77.77 (dev) | +29.43 / +20.14 |
| Human (data engineers) | ceiling | — | — | — | 92.96 (dev) | +39.44 |

**Correction (2026-11-01, §139).** An earlier revision of this table carried one row for this project,
annotated `1 (+ memory pack)`, quoting **57.63**. That number is the **no-memory** cell: `compareCell` reads
`metrics.accuracy_without_memory` by construction, because the published cell it is compared against is a no-memory
cell. The memory arm of the same run is **56.26**. The row above is split for that reason, and the split is not
cosmetic — **on BIRD dev the pack costs 1.37pp of execution accuracy**, against a 1,534-question resolution of
1.96pp. The gap to the published baseline is therefore entirely the harness, and the product feature's contribution
to it is negative and inside its own resolution. This is the single most consequential correction in this document,
and it changes nothing about the ranking: the row that reproduces a published cell only ever had to.

**The `control` rows are the only ones in this table whose comparison this document stands behind**, and they
are labelled for that reason: XiYan's own `DeepSeek + DDL` cell is our no-memory baseline, and its M-Schema
cell is a one-component manipulation of that baseline. Every row marked `competitor` differs from us in the
generator's training, the candidate pool, or both — three things §2 prices at more than the memory line has
ever claimed — so the right-hand column is a **scale**, not a gap we are trying to close by prompting harder.

Two caveats that change how the right-hand column should be read, both from the benchmark's own
documentation: **every BIRD test row above 67.41% uses the per-question evidence hint**, and a
CIDR/VLDB 2026 audit reported annotation errors in 52.8% of the BIRD and 66.1% of Spider 2.0-Snow
examples it inspected (source grade: low, secondary). We do use evidence, so we are comparing against
the evidenced tier; we do not use a fine-tuned generator, so we are not in the same class as any row
above 70.

---

## 2. Where the 20 points come from, as far as anyone has published

XiYan-SQL is the only competitor that publishes a leave-one-out ablation of every component on the
same benchmark we run. Their Table 8, BIRD dev, source grade **high**:

| Removed | EX | Δ | Available to us (no weights, no GPU)? |
|---|---|---|---|
| — (all) | 71.58 | — | — |
| fine-tuned generator | 68.67 | **−2.91** | **No.** Requires SFT on BIRD train with an open model |
| ICL generator | 70.27 | **−1.31** | **Yes.** Few-shot example selection is prompt engineering |
| refiner | 71.03 | −0.55 | **Yes.** Execution-feedback repair |
| selection model | 68.84 | **−2.74** | **Yes,** in a different form (see §3) |
| all, five candidates only | 73.34 | +1.76 | Yes |

And the two schema-side components, from their Tables 6 and 7:

| Component | Reading | Δ | Source grade |
|---|---|---|---|
| M-Schema vs DDL | DeepSeek 53.52 → 55.15 | **+1.63** | high (four models, one benchmark) |
| M-Schema vs DDL | average over GPT-4o / DeepSeek / Claude 3.5 / Gemini 1.5 | +2.03 | high |
| schema linking | EX 57.95 → 60.10, precision 10.14 → 74.74, recall 100 → 95.47 | **+2.15** | high, but measured on GPT-4o |

**The sum does not reach 20, and saying so matters.** 1.63 + 2.15 + 1.31 + 0.55 + 2.74 = 8.38, and
leave-one-out deltas do not add (removing two components costs less than the sum of removing each).
The remaining ~10pp comes from candidate diversity and from weights we cannot touch. Anyone who
quotes a decomposition that adds up is quoting an assumption.

**What this licenses for us:** a target of **53.43 → 62–65** on Mini-Dev, entirely from components
in the "available" column, with each component's contribution measured additively on our own folds.
That is a smaller claim than "beat 82.95%", and it is the only one we can verify.

---

## 3. Mechanism anatomy, by system

### XiYan-SQL (Alibaba, arXiv 2411.08599 / 2507.04701)

**What it does.** Schema filter → multi-generator ensemble → refiner → selection model.

- **Schema filter** produces *several* filtered schemas per question (`p_s` of them), and each
  generator runs on a different one. This is the detail we got wrong: iteration 94 pruned the schema
  to a single smaller one and measured **−8.00pp**, because a pruned schema that drops the right
  column cannot be recovered. XiYan does not shrink the schema; it **samples it**, which converts a
  lossy filter into a source of candidate diversity. Same mechanism, opposite sign, because of where
  the output goes.
- **M-Schema** is a semi-structured rendering: hierarchical, typed, with primary keys marked,
  foreign keys listed as equations, and example values inline in the column's own parenthesis.
- **Selection model** is a fine-tuned Qwen2.5-Coder-7B trained listwise on candidates built from
  positive samples (matched by **execution result**, not by SQL text) and "near-miss" negatives
  produced by controlled LLM modification of correct queries. At inference it **de-formalises** all
  candidates first (a SQL formatter strips casing and spacing), groups them **by execution result**,
  sorts groups by size and candidates within a group by generator history, then shows the model the
  reordered list and asks for an index.
- **Candidate reorganization** exists because LLMs are order-sensitive. If one result cluster holds
  ≥ ⌈|L|/2⌉ candidates, the model sees all of them in order; otherwise it sees one representative per
  cluster.

**What we can take, in order of cost.**

| Take | Why it is cheap | Expected | How we would verify |
|---|---|---|---|
| M-Schema rendering | pure function, no calls | +1.6 | `m-schema` arm vs `none`, paired |
| Candidate reorganization by execution group | pure function, no calls | unknown; gates the selector | measure the rank of the correct cluster before and after reorganization |
| ICL example selection by question skeleton | prompt only | +1.3 | `icl-skeleton` arm |
| Refiner with execution feedback | 1 extra call per failure | +0.5 | `refine-exec` arm |
| Selection model | needs training | +2.7 | **out of scope until a frozen candidate set exists** |

### CHASE-SQL (Google/Stanford, ICLR 2025, arXiv 2410.01943)

**What it does.** Value retrieval (LSH over cell values, then rerank) → three heterogeneous generators
(divide-and-conquer CoT, query-plan CoT, instance-aware synthetic few-shot) → self-repair loop with
execution feedback → pairwise tournament selection with a fine-tuned binary selector.

**The two numbers that matter to us** (source grade: high, from the paper's Table 1):

| Arm | EX |
|---|---|
| self-consistency over the same candidates | 68.84 |
| **candidate pool upper bound (oracle)** | **82.79** |
| selection agent | 73.01 |

The pool holds **13.95pp** of headroom and the selector captures **4.17pp of it — 29.9%**. Our pool
holds **3.52pp** and our best selector captures **−1.14pp**. The difference between those two rows is
the entire diagnosis of this project:

> We do not have a selection problem. We have a **3.52pp candidate pool** and we have been trying to
> build selectors for it. CHASE-SQL's pool is four times larger before its selector is trained.

That pool is large because the three generators are *different procedures*, not three samples of one
procedure. Our `sample-5` is five draws from one prompt at temperature 0.7 — five versions of the same
misreading of the same join.

**Take:** heterogeneous generators (the 3×2 shape in R7.1), self-repair with execution feedback, and
pairwise tournament as the *fallback* selector when no trained model exists. Value retrieval by LSH is
already closed for us as a *prompt annotation* (R4, +0.29pp), but has not been tried as a *candidate
diversifier*, which is the same category error as schema pruning.

### R³-SQL (arXiv 2604.25325, source grade: medium — preprint, no signed review)

**What it does.** Two fixes to multi-candidate ranking: (1) group candidates by execution result so
that functionally equivalent queries receive identical scores, and (2) an agentic judge that decides
whether the correct query is **absent from the pool at all** and, if so, resamples.

**Why the second idea is the one we have never tried.** Every selector we built — agreement, model,
execution — assumes the right answer is somewhere in the five. R2's oracle says it is in the pool on
3.52pp of questions and not on the rest. A judge that says "resample, the pool is missing it" is worth
more than any reranker when the pool is the binding constraint. Reported 75.03 on BIRD dev.

**Take:** an absence judge as an arm, measured by how often its "absent" verdict is right — not by
end-to-end EX, which would confound the judge with the resampler.

### GradeSQL / Outcome Reward Models (arXiv 2606.30851, ACL 2026 workshop, medium)

**What it does.** Trains a task-specific outcome reward model on candidates labelled **only by
execution** — no human annotation — and uses it as a Best-of-N verifier. Beats execution-based
Best-of-N and majority voting by up to **+4.33 on BIRD**, +2.10 on Spider, with gains growing as the
candidate pool grows and on harder questions.

**Why this is the closest thing to our thesis, and where we differ.** They prove a learned verifier
beats heuristics. We cannot train one without a candidate corpus we do not yet have. The ordering is
therefore: build the corpus (R7.1) → measure which **deterministic** signals separate correct from
incorrect (R7.2a) → only then decide whether a learned scorer adds anything over the deterministic
one (R7.2b). Skipping to a learned scorer before the deterministic baseline exists is how this project
spent eleven iterations measuring composites.

**Take:** their evaluation discipline as much as their method — the ablation they *lack* is the one
we must run: performance on the subset where execution is uninformative (many candidates execute
correctly, or all fail).

### CAPER (arXiv 2606.03327, medium)

**What it does.** Clause-aligned process supervision: a reward model trained on clause-boundary labels
that localises **which clause** of a failing query is wrong (84.53% top-1, 90.60% MRR), usable as a
plug-and-play verifier for black-box models at **+0.7 to +1.6 EX over majority voting**.

**Why the localisation number matters more than the EX number.** 84.53% top-1 clause localisation means
a small model can tell you `WHERE` is wrong rather than "the query is wrong". That is the signal a
repair loop needs, and it is the signal our `failureKind` field has been approximating crudely
(`empty` / `error` / `rejected`) since iteration 96. Their supervision comes from counterfactual
repairs — the same construction our correction corpus already contains, if we store the failing clause
alongside the fix.

**Take:** store the repaired clause span with every correction. Zero extra calls at capture time;
it makes the corpus usable for a process reward later.

### AgentSM (AWS/Berkeley/Oracle/Snowflake, arXiv 2601.15709, medium)

**What it does.** The only memory system here that is measured on a benchmark we could also run
(Spider 2.0-Lite, **44.8%**, with −25% tokens and −35% trajectory length). Its memory unit is an
**execution trace reified as a structured program**, not a rule and not a vector. Frequently co-used
tool sequences are compiled into composite tools.

**The two findings that read directly onto our negative results:**

1. With **gold tables** supplied, its accuracy jumps 44.8 → **57.6** (+12.8pp). Schema linking, not
   memory, is the binding constraint on that benchmark.
2. Reuse helps **exploration cost** (tokens, steps) and helps least on questions needing novel
   decomposition. Our six memory arms measured *accuracy* on a benchmark where every question is
   novel and nothing is explored twice. AgentSM would predict exactly the null we measured.

**Take:** the memory unit is a **trajectory**, and its payoff is **cost**. A product that claims
accuracy from memory on one-shot tasks is claiming something the strongest evidence in the field does
not support. A product that claims **cost and consistency** from reusing a validated trajectory is
claiming something that has been measured.

### Databricks RLVR (arXiv 2509.21459, high) and the parameter flywheel

Qwen2.5-Coder-32B, two-stage: offline TAO warm start, then online RLVR with a binary execution reward
(−1 for unparseable SQL). **73.56 single-call, 75.68 with 7-way self-consistency** on BIRD test — and
crucially, self-consistency adds only **+2.12pp** on top.

That last figure is a warning for us. On a strong generator, seven draws are worth two points, because
a model trained against an execution reward stops making the errors that resampling can fix. **Our
+3.52pp oracle over five draws is not evidence that our selector is bad; it is partly evidence that our
generator is weak and its errors are correlated.** Both readings are true and only the heterogeneous
candidate arm can separate them.

---

### Memory-layer systems: what a rule is, in each product

The systems above compete on generating SQL. R10's question is about the other half — what a memory
stores and how it is put back in front of a model — and the closest prior art is a different
literature. Mechanism, as each system describes it:

| System | What is stored | How it is used | Mechanism our layer shares, and what it lacks |
|---|---|---|---|
| **Mem0** (arXiv 2504.19413) | extracted facts, deduplicated against similar memories with ADD/UPDATE/DELETE | nearest-fact retrieval into the prompt | our `competitor.ts` FactStore implements this faithfully as a baseline: recall, no scope, no evidence weight, no retirement |
| **MemGPT / Letta** (arXiv 2310.08560) | a paged context and self-edited memory blocks | the model decides what to page in | paging is capacity management; it says nothing about whether a stored sentence has a referent in the current task, which is the failure R9.4 measured |
| **ExpeL** (arXiv 2308.10144) | natural-language **insights** extracted across tasks, kept with upvote/downvote counts | similarity retrieval; insights are dropped or promoted by their counts | this is our rule, including the retirement idea. Its own ablation is the one that matters here: insights that are specific to one task hurt on another — the same null we measured as repair 6.7% / break 10.4% |
| **Reflexion** (arXiv 2303.11366) | verbal self-reflections inside one task attempt | appended to the next attempt of the **same** task | we do not adopt cross-task transfer from it, and R6 closed the in-task variant: the reflection is a within-episode prompt, not a memory |
| **Agent Workflow Memory** (arXiv 2409.07429) | induced **workflows** abstracted from past trajectories, reused as in-context exemplars | retrieval, then instantiation on the current task | the nearest prior art to R10: it is structure-preserving, and it abstracts at the trajectory level rather than binding names to a target schema. Our slots are the specialization AWM does not do |

**What that map says about the negative result.** Every system in the table that carries text
across tasks — Mem0's facts, ExpeL's insights, AWM's workflows — either abstracts the text
(AWM), or filters it by measured success (ExpeL), or does not claim transfer at all (Mem0).
None of them shows a sentence about one schema being handed to another schema unchanged and
working. That is what our layer did for eleven iterations, and it is the defect R10 attacks — not
by storing different content, but by binding the same content at the moment it is used.

### The literature on memory that hurts, and what it says to do about it

Four external results matter to the negative cells this project keeps measuring, and none of them is
about SQL — which is why they were missed for eleven iterations:

| Source | Finding | What it predicts for us |
|---|---|---|
| Context-poisoning analysis (softmax retrieval abstraction) | the decisive-evidence score is capped while the strongest distractor's score grows with the number of distractors; holding accuracy above chance requires the evidence margin to grow as Ω(√log N) in the **effective distractor count**, not in context length | harm is a function of **how many items** compete, and the loss is steep while N is small — a dose curve, not a content axis |
| **UTILMEM** (arXiv 2608.30508) | with evidence recall fixed at 1.0, strong semantically similar distractors drop quality; the largest loss is in the **first two to eight**, then it plateaus, and fewer than ~2.5 strong distractors suffice for a 25% reduction | our default injects 1.83 items — past the window rather than inside it: R16 puts the whole loss at **one** item (−3.14pp at exactly 1.00 item), which is why every filtered arm sits above `full` |
| **MemTrapBench** (arXiv 2608.20202) | across two model families and five memory frameworks, **every memory strategy is below its no-memory setting**, the strongest by more than 10pp; the trap strength scales with memory length; the degradation is driven by memory *semantics* rather than length alone | our −2.00 and −3.71pp are not an anomaly; a memory layer that is merely faithful is expected to be negative. Its two trap classes — reasoning fixation and belief distortion — name what an injected correction can do to a query |
| **Lost in the middle** (Liu et al., 2024) | retrieved context is not an unconditional asset; under adversarial placement it can fall below answering with no context | our packs are always before the question, so placement is the one axis this protocol has never varied |

MemTrapBench's mitigation, **AdaptiveMem**, is an inference-time instruction — four named risks the
model is told to weigh before it uses a retrieved memory — and it recovers 14.9pp on one framework
without touching the architecture. That is a cheaper intervention than anything this project has tried,
and it is the source of R17's hypothesis.

The sharpest of those hypotheses is not the instruction but what it names: **"trauma" — negative
feedback in memory causes a model to avoid a strategy it was punished for, in later and unrelated
contexts.** Every item this store holds is distilled from a *correction*, i.e. from negative feedback,
and every rule is phrased as what the attempt got wrong. If the trauma mechanism transfers to this
setting, the store is teaching avoidance as much as it is teaching technique, and no amount of scope
filtering or gate admission would show it — the phrasing would have to change while the content stayed
fixed.

**R16 put a number on the window, and the number is one.** The distractor-count bound predicts a steep
loss while N is small and a plateau after, and both halves held: 0.29 items per question costs +0.00pp,
1.00 costs −3.14pp, 2.97 costs −4.00pp and 4.16 costs −2.86pp, so a fourfold range of injected text above
the first item moves accuracy by 1.43pp. What did not hold is the paper's lower bound. UTILMEM puts the
largest loss in the first *two* to eight distractors; on this store and this lane the whole of it is
already present at **one**, which is a stronger statement than the published window and is measured on one
cell from iteration 86 (exactly 1.00 item per question) plus four from R16. The practical difference is
the same in both directions: at 1.8 items the shipped configuration is not near the safe end of the curve,
it is past it.

**AdaptiveMem is the one published intervention this project has not yet tested on itself**, and R17 is
that test — with a control the paper does not report, an arm carrying the instruction and no pack, so a
recovery cannot be attributed to 200 characters of extra prompt rather than to the permission they grant.

Three further mechanisms are published with ablations, and none of them is a longer prompt. They are
ranked here by how far they are from anything this project has measured, because the next three
iterations are chosen from this table rather than from intuition:

| Source | Mechanism | Why it is not what we have already measured | Status |
|---|---|---|---|
| **MemHarness** (arXiv 2607.28272) | an explicit **reconstruction** step between retrieval and action: the model critiques the retrieved experience against the current context and keeps, rewrites or discards it, then acts on the rewrite. Trained end-to-end with GRPO, and its stated motivation is the exact defect this project measures — retrieved experience injected as a *static record* | R17 changes what the model is *allowed* to do with the note; this changes what the note *becomes* before it is used. The inference-time half needs no training: one instruction to rewrite the pack into one applicable directive, which is a prompt-level arm this lane can run tomorrow | not implemented; the cheapest untried lever |
| **MeClear** (arXiv 2609.09115) | query-scoped **clearance by utility**: cooperative Shapley attribution over the retrieved set plus leave-one-out screening to find memories with negative downstream utility, then suppress them for this query only, without deleting them. Reports 82.3% task recovery against an LOO baseline | every gate in this project decides *before* the question — admission, verification, corroboration, transfer are all properties of an item. MeClear decides *per query, from outcomes*, which is the one signal this store has never used: whether the note helped on the case that recalled it. The `sample-*` and pool machinery already collects that signal | not implemented; needs a per-query utility join, not a new model |
| **ε-MemEvo** (arXiv 2608.12522) | an **adaptive injection gate**: whether to inject at all, and at what intensity, from a posterior over observed states. Its ablation is the sharpest published statement of our own failure — naive memory injection fails catastrophically, gated injection is safe across all five ablations | our gate family is static: a threshold on an item's attributes. This is a property of the *moment* — the same note is injected or skipped depending on where the task stands — and no arm here has ever made the decision depend on the question rather than on the store | partially: `gated` and `full-corroborated` are static filters, not per-question decisions |

The three share one diagnosis this project has been circling without naming: an item's *fitness* is a
property of the pair (note, question), while almost every mechanism here scores the note alone. R16 closed
the quantity axis and R17 tests the framing axis; both are properties of the note. Reconstruction, utility
clearance and adaptive injection are the same idea — score the pair — and that is the axis this record has
never varied.

### Intrinsic self-correction: the published baseline for what a second pass costs

R18 measured a blind revision — show the model its own draft, ask for a revision, add nothing — at
**−4.00pp** against answering once (12 repaired, 26 broken, p = 0.0336). That is not a new phenomenon; it
is the SQL instance of a result the reasoning literature already has, and the comparison is worth stating
because the sizes agree.

| Source | Setting | Result |
|---|---|---|
| Huang et al., *Large Language Models Cannot Self-Correct Reasoning Yet* (ICLR 2024, arXiv 2310.01798) | intrinsic self-correction — no external feedback, model critiques and revises its own answer — on GSM8K, CommonSenseQA, HotpotQA, GPT-3.5/4 and Llama-2-70b | accuracy does not improve and sometimes **degrades**; GPT-3.5 GSM8K 75.9% → 74.7% after two rounds; models convert correct answers into incorrect ones about as often as the reverse |
| **R18, this project** | one blind revision of a SQL draft, n = 350, cross-fitted, matched store and matched questions | **−4.00pp**, 12 repaired against 26 broken (1 : 2.2), one sign in five folds |

Three things this project adds to that literature, and one it does not:

1. **The ratio is worse in SQL than the "about as often" summary suggests.** 2.2 broken per repaired, on a
   task where the draft is executable and the gold is checked by execution — the revision has more to
   check than a reasoning chain does, and it still breaks more than it fixes.
2. **The cost is not the second pass; it is the request.** `full-anchored` writes a second pass over the
   same draft and sits at *exactly* no memory (54.00% both arms). The difference between the two cells is
   one paragraph of text, so whatever the revision costs is recoverable by a sentence — which is a
   narrower claim than "self-correction does not work" and a more useful one.
3. **A memory mechanism can look like a gain by repairing a cost it introduced.** The anchored arm was
   published here as +2.86pp against plain injection, and R18 shows that in the run that measured it
   `full` was itself costing −4.00pp: the note's apparent contribution was mostly the harm of the
   comparison arm. Any paper that reports a delivery-order or self-refinement gain without a
   blank-revision control is reporting the same composite number, and this is the one place where a
   competitor's published lift can be checked against a control the field does not usually run.
4. **Nothing here says self-correction is impossible.** Huang et al.'s title says "yet", and the R20
   square is exactly the question of what external signal the second pass needs — a block, a licence to
   stop, or both.

### The October 2026 wave: raw evidence beats every transformed store

Six papers landed within a week of each other, all about the memory lifecycle, and together they say
something this record has been measuring without being able to name: **the transformation is the loss.**
Read against seven closed axes here, they reframe the project's negative result from "our store is not
good enough yet" to "a distilled store is the wrong object".

| Source | Finding | What it predicts for us |
|---|---|---|
| **Raw-RAG** — *Is Complex Agentic Memory Always Needed?* (arXiv 2610.30755, Xi'an Jiaotong) | dense retrieval + reranking over the **raw** history ranks first in 6 of 7 benchmark-model settings across LoCoMo, LongMemEval, MEME and MemoryAgentBench, beating the strongest agentic memory by 0.13–5.53 points. **Even complete access to the transformed store leaves an accuracy gap against raw evidence.** The mechanism is coverage: useful evidence includes the relations and dependency paths needed to derive an answer, and summarise/extract/consolidate throw those away | our store is 1,256 **distilled** items, 500–824 characters each, from single corrections. Every content axis measured here (rule, repair, procedure) is a transformation, and the one substrate this record has never injected is the raw correction event — question, failed query, fixed query |
| **The Distracting Effect** (ACL 2025, arXiv 2505.06914) | a per-passage distraction score that is **a property of the passage and stable across models**; one hard distractor beside the gold passage costs 6–11 points; and **passages that survive a reranker are significantly more likely to mislead** | this is the SQL reading of our own relevance audit: packs whose best rule named something the answer uses scored 43.6% against a 53.4% baseline, and packs that named nothing scored 67.1% against 71.1%. Semantically closer was worse, not better — the record has called it "relevance does not predict" and the paper says relevance *anti*-predicts |
| **AfterDeleteBench** (arXiv 2610.31366) | deleting a record does not delete what was derived from it: one query recovers a deleted secret from Qwen2.5-7B about two thirds of the time, and 62–99% reconstruction from the leftover fragments; provenance closure eliminates recovery | every deletion arm here (`full-validated`, `full-verified`, the clearance pair) measures the *effect* of removal on accuracy and never checks whether the fact survived in a derived form. For a product with a forget button this is the failure that matters, and it is currently untested |
| **Governance-state corruption** (arXiv 2610.30698) | flipping only the validity bookkeeping, with content untouched, changes the model-visible projection in 96.25% of 2,080 matched pairs and costs 40.54 points on LongMemEval; oracle enforcement restores all of it | the store has a `status` field (`active`, superseded, retired). No arm here has ever varied it as the treatment — which is the cheapest possible intervention: same items, same text, one flag |
| **MemPABench** (arXiv 2610.30485) | Mem0 and MemOS **lose to the no-memory baseline** on preference adherence; file-based memory improves but in the wrong situations | our −2.00 to −4.29pp is the same published shape on a different task, and this is the fourth independent confirmation |
| **SPLICE** (arXiv 2610.30790) | different ways of analysing the same experience yield knowledge with **substantially different utility**; keep the candidates whose utility gain is *consistent across views* | our distiller is one view at one temperature, and the store has never been re-analysed. A consistency gate over two or three distillations of the same correction is the admission rule this project has not tried |

Two consequences for the plan, and the second is the larger one:

1. **R21 (clearance) is the last selection experiment worth running on this object.** If a per-item
   utility score cannot beat a dose-matched random drop, the object is the problem rather than the
   filter — which is what Raw-RAG says in advance.
2. **R22 should change the substrate back to raw.** The arm is one pack of verbatim correction events —
   the question that was asked, the query that failed, the query that fixed it — with no prose and
   nothing for the reader to imitate as a convention. It is the same store, the same retrieval and the
   same budget, and it tests the paper's claim on the one benchmark where a correction has an exact
   referent. If raw evidence is not better here, the paper's mechanism does not transfer to SQL and this
   record says so with a number; if it is, the whole memory line has been optimising the wrong object
   for twenty iterations, and the product is a log rather than a lesson.

The distraction result also explains a reading this project has never been able to interpret: why
`full-prohibitive` — the same statements, labelled as records of mistakes rather than as conventions —
was the least harmful framing arm (−1.14pp against `full`'s −4.00pp in R17). A passage the reader is told
is a record of someone else's failure is a passage with a declared distance from the current task, and
the distracting-effect framework predicts exactly that a declared distractor distracts less.

---

## 4. What we are missing, ranked by evidence strength and cost

| # | Missing | Evidence that it matters | Cost to build | Blocks |
|---|---|---|---|---|
| 1 | **Heterogeneous candidates** | CHASE pool 13.95pp vs ours 3.52pp; XiYan ensemble −2.91 when the FT generator is removed | 3 prompts, no training | every selector claim |
| 2 | **M-Schema rendering** | XiYan Table 6, +1.63 on DeepSeek | one pure function (**built**) | — |
| 3 | **Execution-grouped ranking** | XiYan Algorithm 3, R³-SQL both do it; our model-comparison variant is −1.14 | one pure function (**signals built, grouping not yet**) | selector |
| 4 | **Deterministic signal measurement** | GradeSQL's own missing ablation | instrumentation only (**signals built**) | whether to learn a scorer |
| 5 | **Absence judge / resampling** | R³-SQL; our oracle says the pool is short on 96% of questions | 1 call per question | ceiling |
| 6 | **Clause-level repair record** | CAPER 84.53% localisation | capture-time schema change | repair loop, PRM later |
| 7 | **Trained selection model** | XiYan −2.74; GradeSQL +4.33 | needs (1) first | — |

Items 1, 3, 4 are this stage. Item 7 is explicitly deferred, and the reason is not modesty: a
selection model trained on a 5-candidate homogeneous pool learns the generator's biases.

---

## 5. Where we can be better than all of them

Not on BIRD EX, and the whitepaper says so in the same words. The rows above 80 use fine-tuned
generators; we use a closed API. Four things are nonetheless ours to win:

1. **No training, no weights, no GPU.** Every competitor's selection gain above comes from a fine-tuned
   scorer. A deterministic verifier that captures a third of the ceiling is a different product, and
   its cost is zero marginal.
2. **A protocol nobody else publishes.** Paired bootstrap over 10,000 resamples, a `none-replica`
   noise floor on every run, a minimum detectable difference computed per run, and blocking gates that
   refuse a claim when instrument validity fails. XiYan, CHASE-SQL, R³-SQL and GradeSQL all report
   point estimates without intervals; GradeSQL's own reviewer flagged the absence of significance
   testing. A system whose numbers come with intervals is auditable in a way theirs are not.
3. **Cross-run accumulation.** R³-SQL's resampling is single-question. A store of `(schema, signature,
   outcome)` triples accumulates across runs, which is the one form of memory that survives the
   AgentSM finding: it is a **prior over shapes**, not a lesson in a prompt.
4. **The negative results, published.** Twelve arms with one sign is a map of where not to spend. No
   competitor publishes theirs, which is why the field keeps re-discovering that prompt-injected
   lessons do not pay.

**The comparison that reverses, in the unit the benchmark actually sells.** R25 closed the pack line with a
null, which reads as a loss until the same table is drawn for everyone else. Every published ablation this
document quotes is a **point estimate on a single dispatch with no interval, no minimum detectable effect and
no noise floor** — so none of them can state a null, and none can say how large an effect would have had to
be to be seen:

| system | what it publishes | interval | MDE | can it report this null? |
|---|---|---|---|---|
| XiYan-SQL | 53.52 dev, ablations in Table 6 | — | — | no |
| CHASE-SQL | 73.01 dev/test, 13.95pp pool ablation | — | — | no |
| RSL-SQL | 12.71pp schema-linking ablation | — | — | no |
| CHESS | 14.36pp column-selection ablation | — | — | no |
| GradeSQL | +4.33 selection gain (reviewer flagged: no significance testing) | — | — | no |
| **this project** | **17.60pp [+15.38, +19.82]**; pack **−0.33pp [−1.56, +0.85]** | **yes** | **2.01pp** | **yes, with a bound** |

The last row is not a better score. It is the only row where the claim *"this mechanism is worth less than
2.35pp on this benchmark"* is a measurement rather than an absence: two oracles computed with the answer key
price the entire remaining pack upside at **+2.35pp** (drop every net-harmful item) and **+4.17pp** (keep the
pack exactly where it helped), against a split that resolves **2.01pp** — and 507 questions were refused the
note on a byte-identical prompt and moved 1.4%, which is the endpoint's own test–retest floor measured inside
the dispatch. **A field that reports points without intervals cannot distinguish "the mechanism is inert" from
"the mechanism is 3pp and the run was too small", and that is the distinction this record now spends its
dispatches on.**

**The channel comparison, which used to be the explanation and is now a measurement.** Section 2 attributes
most of the 20-point spread to schema linking and value indexing, on the strength of two published ablations.
R26 put both channels into our own prompt at n = 1,534 and neither reproduces:

| channel | what the competitor publishes | what it does in our prompt | reading |
|---|---|---|---|
| pruned schema to the named tables | RSL-SQL **12.71pp** (ablation, no interval) | deletes the table the evidence names | **−9.26pp [−10.95, −7.63]**, 24 gained / 166 lost |
| schema annotated with column values | CHESS **14.36pp** (ablation, no interval) | adds a value sample under each column | **+1.17pp [−0.13, +2.48]**, 64/46, p = 0.10 — bounded, channel closed by its registered clause |

The asymmetry is structural and it is the finding: **they ablate a component their pipeline already contains,
so their number prices what they would lose by removing it; we added the same component to a prompt that never
had it, so our number prices what we would gain by adding it.** Those are different quantities whenever the
component interacts with the rest of the pipeline, and a system that starts from a pruned schema has something
to lose by pruning it further while a system that starts from the whole DDL only has something to lose. **The
gap is therefore not a prompt-engineering gap**, which removes the last explanation this document had for its
own 24.86pp deficit and moves the remaining work to the candidate pool, the selector and the generator.

---

## 6. Sources and grades

| Claim | Source | Grade |
|---|---|---|
| XiYan Tables 6, 7, 8; 75.63 test; 71.58 dev | arXiv 2411.08599 v2, §7.6 | high |
| XiYan selection algorithm, elselection data construction | arXiv 2507.04701 v2, Algorithm 3, App. II.C | high |
| CHASE-SQL 68.84 / 82.79 / 73.01 | arXiv 2410.01943, Table 1 | high (via secondary summary of the table) |
| CHASE-SQL pipeline stages | arXiv 2410.01943 + a public reproduction's repository layout | high |
| Databricks 73.56 / 75.68 / 7-SC | arXiv 2509.21459 | high |
| GradeSQL +4.33 / +2.10 | arXiv 2606.30851 | medium (workshop paper, reviewer noted no significance tests) |
| CAPER 84.53 / 90.60 / +0.7–1.6 | arXiv 2606.03327 | medium |
| AgentSM 44.8 / 57.6 / −25% / −35% | arXiv 2601.15709 | medium |
| R³-SQL 75.03 dev | arXiv 2604.25325 | medium (preprint, unsigned review) |
| BIRD leaderboard rows (83.40 AskData, 82.95 GrainSQL, 80.04 Gemini-SQL2, 92.96 human, 67.41 no-evidence) | bird-bench.github.io, read 2026-11-01; the same rows read 2026-10-29 carried 82.95 as the top | medium (leaderboards move — they moved by 0.45pp in the three days between the two reads, and the 67.41 threshold is the benchmark's own statement) |
| Spider 2.0 59% / 38–45% / 40%; 21.3% at launch | secondary round-ups | **low — not independently verified here** |
| BIRD 52.8% / Spider 2.0-Snow 66.1% annotation errors | secondary summary of a CIDR/VLDB 2026 audit | **low — primary not read** |
| Mem0 fact extraction, dedupe and retrieval | arXiv 2504.19413, mechanism section; our baseline reimplements it | medium — mechanism from the paper, baseline ours |
| MemGPT / Letta paging and self-editing | arXiv 2310.08560 | medium — not re-run here |
| ExpeL insight extraction, upvote/downvote, cross-task negative transfer | arXiv 2308.10144, ablation tables | medium — the negative-transfer direction is what our R9.4 measured independently |
| Reflexion within-episode reflection | arXiv 2303.11366 | medium |
| Agent Workflow Memory induction and reuse | arXiv 2409.07429 | medium — mechanism only; no line-level audit of the released code |
| ODIS in-domain SQL distribution (+1.1 / +11.8) | arXiv 2310.06302 | high — the construction R10 implements |
| SQL-Exchange structure-preserving schema mapping | arXiv 2508.07087, PVLDB 2026 | high — the construction R10 implements |
| UTILMEM: evidence-recall ceiling, distractor window of two to eight, <2.5 strong distractors for a 25% drop | arXiv 2608.30508 | medium — abstract and results read, numbers not re-run here |
| MemTrapBench: every memory framework below no-memory, >10pp for the strongest, trap strength scales with length, AdaptiveMem +14.9pp on one framework | arXiv 2608.20202 | medium — abstract, result tables and method read; nothing re-run here |
| Context poisoning: Ω(√log N) margin in the effective distractor count | secondary analysis of a softmax-retrieval abstraction | **low — preprint summary, primary not read; the shape is what R16 uses, not the constant** |
| Lost in the middle: mid-context evidence can fall below closed-book | Liu et al., 2024 (TACL) | high — widely replicated; placement is fixed in every arm here |
| MemHarness: reconstruction between retrieval and action, GRPO-trained, reported to reduce negative transfer and beat static-memory baselines out of distribution | arXiv 2607.28272 | medium — mechanism and abstract read; the training half is out of scope here, the inference-time half is not |
| MeClear: cooperative Shapley attribution + LOO screening for negative downstream utility, query-scoped clearance, 82.3% task recovery | arXiv 2609.09115 | **low — secondary summary read; the primary has not been read and no number from it is used, only its mechanism** |
| ε-MemEvo: adaptive injection gate, naive injection fails catastrophically while gated injection is safe across five ablations. | arXiv 2608.12522 | medium — abstract and ablation summary read; the setting is program evolution rather than SQL, so only the gate's *shape* transfers |
| Raw-RAG: naive dense retrieval over raw history ranks first in 6 of 7 settings, +0.13 to +5.53 over the strongest agentic memory, and complete access to the transformed store still trails raw evidence | arXiv 2610.30755 | medium — abstract and the evidence-coverage argument read; no number re-run here, and the four benchmarks are conversation tasks rather than SQL |
| Distracting Effect: per-passage distraction is stable across models, one hard distractor costs 6–11 points, and reranked passages mislead more | ACL 2025, arXiv 2505.06914 | medium — abstract and the reranker result read from two copies of the paper; the 6–11 point figure is their setting, not ours |
| AfterDeleteBench: a deleted record is recoverable from its derivatives in about two thirds of cases, and 62–99% of the time from fragments; provenance closure eliminates recovery | arXiv 2610.31366 | **low — secondary summary only; the primary has not been read and no number from it is used in a design decision** |
| Governance-state corruption: content fixed, validity bookkeeping flipped, 96.25% of 2,080 pairs change the operative projection, −40.54 points on LongMemEval, oracle restores 100% | arXiv 2610.30698 | medium — abstract read; the provider panel and the panel-selection caveat noted |
| MemPABench: Mem0 and MemOS below the no-memory baseline on preference adherence | arXiv 2610.30485 | **low — secondary summary only** |
| SPLICE: utility of extracted knowledge varies with how the same experience is analysed; consistency across views selects the candidates | arXiv 2610.30790 | medium — abstract read; not implemented here |
| Huang et al.: intrinsic self-correction degrades accuracy without external feedback; GPT-3.5 GSM8K 75.9% → 74.7% over two rounds; revisions break about as often as they repair | ICLR 2024, arXiv 2310.01798 | high — the numbers are read from the paper's own tables and the direction is widely replicated; the one figure this project quotes against it (12 repaired / 26 broken) is our own measurement |

**What this record now knows about the field's strongest memory baseline.** Raw-RAG's result — naive dense
retrieval over raw history ahead of the strongest agentic memory in six of seven settings — is the most-used
justification for storing events instead of lessons, and R22 tested it here: **it does not transfer.**
`full-raw` is −0.86pp against the distilled note (p = 0.7608, CI [−4.57, +2.86]) and **1.43pp below its own
shuffled control**, so the correction's subject contributed nothing measurable. The row above already
records why the two settings differ — the benchmarks are conversation tasks where the retrieved evidence is
the provenance of the answer, while a SQL question arrives with its schema, its database and 142 characters
of curated hint attached — and that difference is now a measurement rather than a caveat. Two consequences
for this file: the row's grade stays *medium* because the paper is not wrong, it is scoped; and any future
comparison this project makes against a memory framework has to be made on a task where the retrieved text
is not competing with a hint the benchmark already supplies.

**Ablation we can now compare ourselves against, in the same units.** The evidence ablation is the one
manipulation every text-to-SQL system reports, which makes it the only place in this file where our number
and theirs are the same quantity. R23 measured it at **24.86pp** on this lane's 350-question minidev panel;
R24 re-measured the same 2×2 on the split every other row in this file was measured on, 1,534 questions, and
read **17.60pp [15.38, 19.82]**. Companion Agents (arXiv 2601.08838) tabulates **12.71** for RSL-SQL, **14.36**
for CHESS and **18.37** for DAIL-SQL on the same benchmark and model family, and BIRD's original GPT-4 ablation
was 20.01.

| system | role | evidence dependence | panel | schema linking / value index |
|---|---|---|---|---|
| BIRD GPT-4 (original ablation) | same-unit control | 20.01 | dev, 1,534 | none |
| **microglia (R24)** | — | **17.60** | dev, 1,534 | none |
| DAIL-SQL | same-unit control | 18.37 | dev, 1,534 | partial |
| CHESS | same-unit control | 14.36 | dev, 1,534 | full column + value extraction |
| RSL-SQL | same-unit control | 12.71 | dev, 1,534 | full + bidirectional linking |
| microglia (R23) | — | 24.86 | minidev, 350 | none — **not admissible here** |

**The minidev row is not comparable and is shown only to explain itself.** 24.86 was measured on a panel from
which the easiest third had been removed; within the R24 dispatch, restricted to the same moderate-and-
challenging mixture, the effect is **22.99pp [19.21, 26.77]**. That is the number to quote against a system
evaluated on moderate-and-challenging questions, and 17.60 is the number to quote against one evaluated on the
whole split. **R23's 24.86 was never an inflation; it was a different population** — a distinction this file
had been getting wrong in both directions.

The ordering across systems is informative and it survives the correction: the two systems that lose least are
the two whose pipelines extract columns and cell values from the database before generating, and the two that
lose most — BIRD's GPT-4 baseline and this lane — do the least extraction. **That prices schema linking and
value indexing at roughly 5 to 7 points of the ladder** (17.60 − 12.71 = 4.89 for this lane against RSL-SQL;
20.01 − 12.71 = 7.30 for the GPT-4 baseline against it), **not the 10 this file previously inferred** from the
24.86-based arithmetic — and it is a
smaller number than the 24.86-based arithmetic gave. The inference it supported — that the gap is addressable
from the database — is now weaker than this file claimed, and R24 removed its second premise as well: the
pack's cost was attributed to a *competition* with the evidence sentence (interaction −6.00pp), and at 1,534
questions that interaction is **−1.30pp [−3.06, +0.46]** and the pack is null both with and without the hint.
**Cross-system comparison in this file therefore rests on 17.60 alone, and the substitution story is demoted to
a single-run observation.**

The second thing this comparison yields is a calibration for every other row in this file. A number from a
system whose evidence dependence is 12 points is being measured in a regime where the model already knows
where to look; ours is measured in one where it does not. **Cross-system deltas in this table are not
comparable across this boundary**, and any future row here should carry the system's evidence dependence
beside its accuracy.


Numbers we intend to reproduce ourselves, because they change a decision: the M-Schema delta on
DeepSeek (one arm), the CHASE-style pool ceiling under heterogeneous generators (R7.1), and the
per-signal discrimination of execution signatures (R7.2a).

## Appendix A — what the field has actually measured about memory *harm*, and which of it our data can settle

This appendix exists because of a standing suspicion recorded in this project's own notes: **the negative
effects come from what is stored and how it is used, not from the model failing to apply a good rule.** That is
now a hypothesis with four published mechanisms behind it rather than a hunch, and this project's committed
artefacts can discriminate between them **without a single model call**. Source grades follow the rule at the top
of this document: a paper's own ablation is *high*, a headline number is *medium*, and anything read second-hand
is *low*.

| mechanism | the claim, in the authors' terms | the number they publish | grade |
|---|---|---|---|
| **Negative transfer from direction-opposite precedent** (STRATA, arXiv 2610.19386) | a superficially similar but *directionally opposite* experience is recalled and its concrete steps copied verbatim, actively harming the agent; repaired by typed **contrast edges** marking confusable, opposite pairs | ScienceWorld 78.7 → 96.7 within one system after the contrast edges | medium |
| **Partial-overlap over-reliance** (MEMTRIM, arXiv 2610.07311) | memory helps when experience transfers whole and misleads when **only part** of the evidence transfers; harm is **largest at intermediate query–memory overlap**, reproduced by varying overlap with everything else fixed | largest harm at middle overlap, across Mem0 / A-Mem / MemGPT / Graphiti | medium |
| **Error reproduction through abstraction** (Anti-Persistence, arXiv 2610.27406) | a wrong *abstraction* propagates by being retrieved, shaping the trajectory, and being re-abstracted; repaired by keeping trajectories and **reconstructing guidance on demand, discarding it afterwards** | higher held-out success and lowest call cost among the compared designs | medium |
| **Stability–plasticity resurfaces at retrieval** ((k,v) study, arXiv 2604.27003) | under a bounded window old and new experience compete during retrieval; **negative transfer disproportionately harms the hard cases**, and finer-grained organisation buys forward transfer at the cost of forgetting | qualitative + controlled sequential-task experiments (ALFWorld, BabyAI) | low-medium |

**Four mechanisms, four different repairs, and the difference matters commercially**: contrast edges are a
write-time label, a scope-match filter is a read-time gate, on-demand reconstruction removes the stored
abstraction entirely, and a forgetting policy is a maintenance job. Choosing the wrong one buys a rewrite that
addresses nothing — which is exactly what R26 measured when the prompt-side annotation channel returned +1.17pp
and the pruner returned a **−9.26pp harm**.

**What our own record already discriminates, at zero cost.** No new run is needed to eliminate two of the four:

| observation, already committed | what it rules out |
|---|---|
| the pack is injected as **rendered text**, not as steps the model is asked to copy (`V46-raw-is-verbatim` measures the verbatim arm separately, and it is an arm rather than the default) | STRATA's "concrete steps copied verbatim" is not our default condition — but *contrast edges* are still untested here |
| **negative lessons exist and are stored** (`kind: 'negative'`, L2b) and L2b's holdout did not move | a missing contrast mechanism is not obviously the binding constraint |
| 1,534 questions, `per_case` carries `correct`, `withoutMemoryCorrect`, `packIdList`, `injected`, `coverage`, `difficulty` and `schemaTables` per question | the partial-overlap question is **answerable from the committed artefact**, offline, with no model call |

**The measurement that would settle it, and why it is the next iteration rather than a reading list.** MEMTRIM's
finding makes a sharp, falsifiable prediction about data we already hold: **if over-reliance is our failure mode,
the harm concentrates at intermediate overlap between the question and the rules it retrieved, and is small at
both extremes.** That is a stratification of `correct − withoutMemoryCorrect` by an **outcome-blind** overlap
statistic computed from the question text and the *injected* rule text — both of which are in
`poc-sota-bird-dev-R26-channels.json` for all 1,534 questions. It is registered as R28 and it costs nothing to
run, which is the point: the largest unexplained thing in this record — a mechanism that produces 1.17pp on its
best terrain — has had a published explanation available for a month and no test against our own data.

**What is *not* claimed here.** None of the four numbers transfers to this setting. They are designs measured on
their own benchmarks with their own backbones, and the grade column says so. What transfers is the *shape of the
prediction*: each mechanism implies a different pattern in a dataset we already own, and a pattern is cheaper to
look for than a rewrite is to abandon.

## Appendix B — what the memory literature can resolve, and why the audit changes the comparison

Appendix A named four published mechanisms for memory *harm*. This appendix asks the question the audit of
§139 makes unavoidable, and asks it of the competitor set rather than of ourselves: **on what sample, and with
what resolution, is any of these effects actually shown?**

The arithmetic is the one `packages/eval/src/power.ts` applies to our own record. For a paired comparison with
`b` helped and `c` hurt among `n`, the effect is `(b − c)/n` and its standard error is `sqrt(b + c)/n`. The
minimum detectable difference at 80% power is `2.802 · SE`. Applied downward to the numbers the field publishes:

| design | the claim | the sample | what the sample can resolve | grade |
|---|---|---|---|---|
| RPMS (arXiv 2603.17831) | memory-only +5.2pp, rules-only +14.9pp (p = 0.008), full +23.9pp on Llama 3.1 8B | 134 unseen ALFWorld games, single trial | a paired delta of ~5pp is about **7 games**; at the discordance those ablations imply (~26 games), SE ≈ 3.8pp and the resolution ≈ **10.6pp** | medium-low (ablation read second-hand) |
| MemArbiter (arXiv 2608.02113) | +20.90pp over the strongest flat-retrieval baseline at a 500-token budget | 134 unseen ALFWorld games | no interval published; 20.90pp clears any resolution at this `n`, so the headline is resolvable and the *decomposition* is not | medium (headline, no interval) |
| MemHarness (independent write-up) | +4.2pp for a weak actor, +1.4pp at frontier | 134 unseen games, 16 rescued / 10 cost | **p = 0.164, reported as inconclusive by its author** — the one source in this table that states its own resolution | medium |
| MEMTRIM (arXiv 2610.07311) | harm largest at intermediate overlap | qualitative ordering across four systems | no per-cell `n` published | medium |
| **microglia, this project** | the mechanism is bounded inside ±1.4pp and its best point estimate is +1.17pp | 1,534 questions, 110 discordant | **1.91pp** — the effect is 61% of the resolution | measured, `poc-power-audit.json` |

**Three things follow, and only the third is comfortable.**

**1. The field's memory numbers are, almost without exception, at or below their own resolution.** A +5.2pp
memory ablation on 134 games is seven games. That is not a criticism of the paper — it reports the rules arm with
a p-value, which is the arm whose effect is large enough to carry one — but it means **"memory helps by 5pp" is
not a finding that transfers**, and any product decision built on it is built on a number the design could not
have distinguished from zero. The one source that says so out loud reports p = 0.164.

**2. Our own null is therefore not an outlier, it is the field's best-measured instance of the same null.** The
project has been reading its +1.17pp as evidence of a broken mechanism. On the scale this appendix builds, +1.17pp
at n = 1,534 is *better measured than any memory-side number in the table* and it still cannot confirm anything.
The competitor set is not ahead of us on this axis; it has not measured the axis.

**3. The cell survives the audit; the attribution does not — and the attribution is the whole claim.** These are
different comparisons and the audit touches only one of them. Our **no-memory** cell against XiYan's published
**53.52** on the same 1,534-question split, same generator, same schema form, is a 4.11pp difference between two
*independent* samples: the pairing that makes every other number in this document sharp is unavailable, so the width
is the unpaired one, `sqrt(p₁(1−p₁)/n + p₂(1−p₂)/n) = 1.79pp`. That puts the cell at **2.30 standard errors** — it
clears the 95% bar (3.51pp) and **not** the 80%-power bar (5.02pp).

**And the memory arm of that same run is 56.26, not 57.63.** The pack contributes **−1.37pp** against a 1,534-question
resolution of **1.96pp**: a loss, and a loss that is itself inside the resolution of the sample that would have to
confirm it. So the 4.11pp we hold over the published baseline is three times the size of the pack's contribution,
with the opposite sign, and **the feature this project exists to build is, on BIRD dev, subtracting from a harness
that was already ahead without it.** That is the uncomfortable reading and it is the one the arithmetic supports.

The ranking is unchanged by any of this: we are **+4.11pp over the published baseline we reproduce** (no memory) and
**25.32pp behind the leaderboard's 82.95**, and the distance to the top is a generator-and-pool difference that no
amount of memory will close (§2's pricing). What the audit removes is the story we told about the 4.11.

**What would change the competitive picture, stated as a number.** Not a better rule. The 4.11pp we hold over the
baseline is already resolvable; everything above it requires a different generator or a candidate pool, and §2 puts
the pool at 13.95pp of headroom that this harness has already failed to spend (R7.1: four heterogeneous generators
collapsed to 1.56 distinct answers and every arm lost individually). The only competitive move this project has
made that is both resolvable and attributable is the one in the table's `control` rows, and the audit's contribution
is to say so precisely: **the number we can defend is the one that differs from a published cell by 3.2 standard
errors, and it is not the memory number.**

## Appendix C — R30 against the memory literature, and the leaderboard as it stands (2026-11-01)

**The ranking did not move, and this appendix exists so that the absence of movement is a stated fact rather than
an omission.**

| position | system | BIRD EX | split | vs ours (dev, no memory) |
|---|---|---|---|---|
| 1 | AskData (AT&T CDO / DSAIR) | **83.40** | test | +25.77 |
| 2 | GrainSQL | 82.95 | test | +25.32 |
| 3 | Gemini-SQL2 | 80.04 | test | +22.41 |
| 4 | Databricks RLVR-32B (7-SC) | 75.68 | test | +18.05 |
| 5 | R³-SQL | 75.03 | dev | **+17.40** |
| 6 | XiYan-SQL (full) | 71.58 / 75.63 | dev / test | +13.95 / +18.00 |
| 7 | CHASE-SQL | 73.01 / 73.0 | dev / test | +15.38 / +15.37 |
| — | XiYan-SQL, same generator as ours | 53.52 | dev | −4.11 |
| — | **microglia, no memory** | **57.63** | dev | — |
| — | **microglia, memory arm** | **56.26** | dev | −1.37 |
| — | Human (data engineers) | 92.96 | test | +35.33 |

**We are not on the leaderboard and this round does not put us there.** The gap to the leader is 25.77pp and §2
prices it as a generator-and-pool difference: XiYan's own ablation puts its fine-tuned generator at −2.91 and its
selection model at −2.74, neither of which this harness can buy without weights or a GPU. What we hold is the
control row — +4.11pp over the same model on the same split with a better harness — and R30 changes nothing about
it. **A memory mechanism worth +1.30pp on a 1,534-question dev split cannot close a 25-point gap, and any framing
that suggests otherwise is the mistake §139 corrected.**

**What R30 does change is our position in the memory literature, and it is a first rather than a best.**

| source | what it says the defect is | what this project can now say about it |
|---|---|---|
| STRATA (arXiv 2610.19386) | memory helps when experience transfers whole, misleads when only part does; the mechanism is *what the rule makes the query do* | **operationalised and confirmed.** The query-level covariate is the first in this record to clear its own resolution: −11.13pp ±7.61, p = 0.0015 |
| Anti-Persistence (arXiv 2610.27406) | a confidently retrieved wrong abstraction is reproduced rather than adapted | **the harm channel is damage, not missed repair**: 35.71% of already-correct queries destroyed against 4.56%, with the repair rate flat at 11.76 vs 10.04 |
| MEMTRIM (arXiv 2610.07311) | harm peaks at *intermediate* query–memory overlap | **refuted on this corpus** (R28): the minimum sits at the top bucket, and the shape is 18.55pp against a 32.23pp resolution |
| Companion Agents (arXiv 2601.08838), SEED (arXiv 2506.07423) | curated per-question knowledge is worth 12.7–20.9pp | **reproduced at the top of that range**: +17.60pp [15.38, 19.82] on dev, and it is the competitor the pack was losing to (R24) |

**The competitive asset this round produced is not an accuracy number; it is a measurement nobody else has
published.** Four systems have written down what they believe the memory failure is. None of them reports a
per-question covariate of it with a resolution, a clustered interval, an exact test, a multiplicity correction and a
stratified damage rate — and none reports the covariate's *failure to be computable before generation*, which is the
finding that decides whether any of their write-path repairs can work. `ruleLevel` is that measurement: a
pre-generation filter built on rule text flags 385 questions, moves the delta **+2.86pp in the wrong direction**, and
agrees with the query-level covariate at 13.0% precision.

**What would move the leaderboard, stated as a number, unchanged from §2 and from §139.** A different generator or a
larger candidate pool: 13.95pp of headroom that this harness has already failed to spend once. **What would move the
memory line is 6,600 paired questions**, which is R30 stage 2, and the largest number it could establish is about
1pp. Those are the only two moves on the board, and this round made the second one cheaper by giving it something
specific to confirm.

## Appendix D — R31: the leaderboard moved, and the literature's mechanism got a second test (2026-11-01)

**The leaderboard moved and it is not us.** Read 2026-11-01: **AskData (AT&T CDO / DSAIR) is the current SOTA at
83.40 test / 78.49 dev**, displacing GrainSQL (82.95 / 77.77) to second. Human performance is 92.96 dev. Our
no-memory cell is **57.63 dev**, so the honest same-split gap is **20.86pp** (dev-to-dev against AskData), and the
cross-split figure this document quotes elsewhere is 25.77pp. Both are stated because they answer different
questions and only one of them is a comparison.

| | BIRD test | BIRD dev | dev gap to us |
|---|---|---|---|
| AskData (SOTA) | **83.40** | 78.49 | **+20.86** |
| GrainSQL | 82.95 | 77.77 | +20.14 |
| DataGallery-Text2SQL | 82.39 | 78.10 | +20.47 |
| microglia, no memory | — | **57.63** | — |

**Nothing in this round moves that, and the round is still the most useful one in the memory line.** The gap is a
generator-and-pool difference (§2) and a memory mechanism worth +0.98pp on a 1,534-question dev split does not
address it. What the round does is retire a claim that would otherwise have been sold as a product feature.

**Against the literature, this round converts one borrowed explanation into a measurement — and it corrects it.**
The paper closest to our finding is the experience-following study (Xiong et al., arXiv 2505.16067, 2025): agents
reproduce the *output* of a similar retrieved record, so a bad record propagates, `add-all` is worse than no memory,
and selective addition plus deletion buys ~10% absolute. Three of its claims are now testable on our ledger:

| their statement | our measurement |
|---|---|
| high input similarity to a stored record produces high output similarity, and the output is what propagates | **confirmed in the direction they predict and refuted in the mechanism they imply.** The damaged queries reproduce a *shape*: 60.6% of them name a column no rule mentioned, taken from the same DDL the baseline saw |
| `add-all` is worse than no addition | **reproduced**: memory arm 56.26 against no-memory 57.63 on dev (−1.37pp) |
| selective addition + deletion recovers ~10pp absolute | **not the same experiment, and ours is smaller**: the read-time filter is worth +0.98pp in-sample and +0.77 to +1.25pp across leave-one-out, which is two orders of magnitude less than their corpus allows because our corpus is one task, not three agents |

**The competitive asset this round adds is a negative result about a fix everyone would try.** Every framework that
ships a memory store has the same obvious improvement available: ask the distiller to record the schema names each
rule depends on, then refuse rules that name something the request did not. That is what R31 registered. It cannot
work here, and the record now says why with two independent measurements — the names are absent from the pack's own
text in 60.6% of the damaged questions, and the pre-generation version of the filter measured +2.86pp with the
**wrong sign** (precision 13.0%, recall 32.3%, §140). **A competitor who ships that filter ships a regression**,
and we can say so without having run it.

**What we still cannot claim.** Any position on the leaderboard, any statement about memory mechanisms outside
text-to-SQL, and any out-of-sample number for the read-time gate — the last of which is R30 stage 2 and remains the
only reading on the critical path.

## Appendix E — R34: the selective-retrieval line, tested against a store it was not built for (2026-11-01)

**The leaderboard did not move, and this round is not aimed at it.** AskData remains SOTA at **83.40 test /
78.49 dev**; our no-memory cell is **57.63 dev**, a 20.86pp same-split gap that is a generator-and-pool
difference (§2), not a memory one. What R34 does is take the mechanism the selective-retrieval literature
reports the *largest* gains for and point it at this project's store.

| system | mechanism | reported | our test of the same mechanism |
|---|---|---|---|
| **SKR** (Wang et al., 2023, Findings of EMNLP) | kNN over similar past questions decides whether to retrieve; splits the corpus into D+ (known) and D− (unknown) by running both arms | **+2.91pp** over full retrieval (InstructGPT), **+4.20pp** (ChatGPT), five benchmarks | **replicated in lexical form and refuted on this store**: 62.4% precision against a 47.64% bar, **−0.05pp** [−0.50, +0.45] on the confirmation half |
| Self-RAG (Asai et al., 2024, ICLR) | reflection tokens decide retrieval and critique the passage | large gains on six tasks, adaptive-retrieval ablation is load-bearing | not testable here: reflection tokens need training, and this project's constraint is a headless SDK with no fine-tuning |
| Adaptive-RAG (Jeong et al., 2024, NAACL) | routes on query complexity, then chooses how many retrieval rounds | beats single-round RAG on multi-hop sets | our nearest proxy — pack size, 1 vs ≥ 2 items — is the *worst* gate measured: **−0.69pp** [−1.33, −0.08] |
| CRAG (Yan et al., 2024) | classifies retrieved documents correct / incorrect / ambiguous before generating | +gains on short- and long-form QA | our proxy is `coverage`; both directions fail, **−0.11pp** and **−0.19pp**, precision 44.9% and 28.3% |
| SIM-RAG (Yang et al., 2025) | a trained sufficiency critic | improves over CRAG | not testable: needs a trained critic, i.e. the fine-tuning this project does not do |
| FLARE / DRAGIN / SeaKR | trigger on token probability or internal uncertainty | retrieval frequency down 60–90% at equal accuracy | not testable on a committed artefact: the artefacts store queries and outcomes, not generation trajectories |

**Why the same mechanism pays there and not here, in one sentence each.** Their D− set is a question the model
*cannot answer* and the retriever *can*; the passage carries the missing fact, so admission converts directly
into repairs. Our D− set is a question the model *can* answer wrongly for a reason no stored rule names — the
store is 78% irrelevant by R13's admission ledger and 19.5% of the names in the damaged queries are traceable to
a rule at all — so admission selects questions where the pack has nothing to supply and something to disturb.

**The measurement that no competitor has published, and that they can check against their own numbers.** The
precision a gate must reach is not a constant of the corpus: it is `b / (r + b)` **of the set the gate admits**.
On this corpus the bar rises 16.8pp across a six-point sweep while the gate's precision rises 20.6pp, because
the break rate inside the admitted set goes from 5.50% to 9.68% while the repair rate stays flat. Any system
that reports "our router reaches X% precision" without the within-set bar has reported a number that cannot be
compared across routers — and the router it flatters may be selecting variance rather than ignorance.

**Where microglia stands, stated as a rank rather than a vibe.** On the memory mechanism axis, microglia is the
only entry in this table whose published number is **negative out of sample** (−0.71pp, §146) and whose best
selective-retrieval gate is **indistinguishable from zero** (+0.11pp of a 2.67pp ceiling, §149). On the BIRD
leaderboard it is **not ranked** — the 20.86pp dev gap is unchanged by anything in this round. What it has that
the table does not is a **break-even arithmetic** (repairs ≥ 8.10% at fixed breaks, or breaks ≤ 4.59% at fixed
repairs) derived from its own corpus and falsifiable by anyone who builds a better store: **80/100 rules never
earn admission (R13), 24 of 102 have no database to apply to (R15), and the target those failures have to clear
is now a number rather than a wash.**

## Appendix F — the item-level ledger: the mechanism every self-improving-context system ships, tested on a store it was not built for (2026-11-02)

**The leaderboard did not move.** AskData remains SOTA at **83.40 test / 78.49 dev**; microglia's no-memory
cell is **57.63 dev** on the same split, a 20.86pp gap that is a generator-and-pool difference (§2) rather
than a memory effect, and it is **not ranked**. What R35 tests is not a leaderboard number but the
maintenance mechanism that the strongest recent self-improving-context systems depend on.

### The contrast that matters

| system | how it decides an item's fate | what this round measured on microglia's store |
|---|---|---|
| **ACE** (Zhang et al., 2025, arXiv:2510.04618) | each bullet carries `helpful` / `harmful` counters annotated during generation; the curator prunes on them ("`harmful_count=5, helpful_count=1` → remove") and ranks retrieval by them | the same quantity, measured the strict way — paired counterfactual flips rather than self-reported tags — has a **split-half reliability of −0.31** and a coarse flag with **−0.06pp** out-of-sample discrimination [−1.97, +1.56] |
| **Dynamic Cheatsheet** (Suzuki et al., 2025) | append-only memory of strategies, retrieved by similarity, no per-item scoring | not testable here: the artefact records packs, not the cheatsheet's retrieval rank |
| **SKR** (Wang et al., 2023) | decides whether to retrieve at all, per question | measured in R34 and refuted for this store: 62.4% precision, **−0.05pp** (§149) |
| **Self-RAG / CRAG / SIM-RAG** | reflection tokens or a trained critic score each retrieved passage | not testable: needs training, and this project's constraint is a headless SDK with no fine-tuning |
| **ExpeL / Agent Workflow Memory** | distill insights and keep them; pruning, where it happens, is by similarity de-duplication rather than by measured effect | de-duplication is orthogonal — this round's question is whether *effect* can be measured at all, and the answer is that it cannot be, at this corpus size, in this store |

**Why the same mechanism is load-bearing there and absent here, stated as a difference in the signal
rather than in the system.** ACE's counter is assigned on the trajectory that produced it: the model marks
the bullets *it used* as helpful or harmful while solving that task, in one distribution, one episode. This
round's ledger is the stronger version of the same idea — it compares two generations on the same question
with and without the pack — and even that version **does not survive a change of database**. If the strict
instrument fails, the self-reported one has no reason to do better, and that is a claim anyone can check
against their own counters: split the corpus by schema and correlate the two halves.

### The one place the literature predicts what this round found

The pack-size result — one rule **+3.07pp**, two rules **−0.96pp**, **+4.03pp [+0.76, +6.62]** — is the
memory-side counterpart of in-context learning saturation: attention dilution as demonstrations grow
(Zhou et al.), the "ICL paradox" where more demonstrations make a model less attentive to the query
(Elazar et al.), and order/selection sensitivity large enough to swing accuracy between near-SOTA and near
chance (Lu et al., 2022). Those papers ask how many *examples* to show; this round asks how many *rules*
to show, in a setting where the rules are retrieved rather than sampled, and gets a difference of the same
sign and a similar order of magnitude.

**What is not claimed.** The contrast is observed, not assigned: retrieval served one rule to questions
that are harder (47.3% unanswerable by the bare model against 41.4%), and every 350-question pilot in this
repository reverses the sign. The literature predicts the direction; it does not settle whether the size
survives randomisation. That is R36's arm, and it is the first experiment in this programme whose result a
competitor's number could be put beside directly.

### Where microglia stands, as a rank rather than a vibe

- **On the BIRD leaderboard: not ranked.** 57.63 dev against AskData's 78.49 dev on the same split; the
  gap is the generator and the pool, and no memory result in this repository closes it.
- **On the memory-mechanism axis: the only entry whose published numbers are negative out of sample**
  (−0.71pp, §146) and whose best selective-retrieval gate is indistinguishable from zero (+0.11pp of a
  2.67pp ceiling, §149), and whose per-item ledger has a **negative reliability** (§150).
- **What it has that the table does not:** the reliability test itself. A system that prunes on item
  counters can run the same split-half check in an afternoon — deal the databases in two, correlate the two
  ledgers, and apply Spearman–Brown. If the number comes back near zero, the pruning is decoration; if it
  comes back high, this round's negative is a property of *this* store rather than of the method, and the
  difference between the two is what a benchmark of memory quality should be measuring.
