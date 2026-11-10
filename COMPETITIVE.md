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
| τ²-bench airline/retail pass^4 rows (IBM learned guidelines 82.0 / 67.5; SapientAI 72.0 / 72.8; RAFT-30B-A3B 61.4 retail; ALTK-Evolve 57.5 retail; stock `llm_agent` gpt-oss-120b 34.0 / 27.2) | the τ²-bench leaderboard's submissions and their trajectory repositories, read 2026-11-02; the IBM numbers are **open PRs expected to be listed Unverified**, and its retail guidelines were learned from a train split the base split includes | medium — two of the five rows are unverified submissions and one of those discloses train/base overlap; the ALTK-Evolve row is the number this lane registered against, not the board's current top |
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

## Appendix G — The item count, assigned instead of observed (2026-11-02)

**The leaderboard did not move.** AskData remains SOTA at **83.40 test / 78.49 dev**; microglia's no-memory
cell is **57.63 dev** on the same split, a 20.86pp gap that is a generator-and-pool difference (§2) rather
than a memory effect, and it is **not ranked**. What this round settles is the one number in this programme
that had been positive, and the outcome is that it was a property of the questions — confirmed on a second
store draw, which is the part competitors do not publish and cannot easily dismiss: a null measured once on a
resampled store is a null with no error bar on its reproducibility, and this programme has been burned by
exactly that before.

### The contrast, assigned

| | value |
|---|---|
| observed: singleton-pack questions against pair-pack questions (dev) | **+3.13pp [+0.87, +5.23]** |
| assigned: one rule for every question against the retrieved pack | **−0.33pp [−1.65, +1.25]**, 42/47 |
| the same arm on a second store draw (run `41369849335`) | **−0.07pp [−1.34, +1.20]**, 38/39 |
| clearance of the 1-item pack / the 2-item pack | **0.672** / **0.737**, then **0.708** / **0.721** |
| the second item's own record | 23 repairs, 27 breaks (0.85) — then 20 and 23 (0.87) |
| the second item's cross-terms | **prevents 15 repairs and 24 breaks** |

### What the literature predicts, and what it gets here

| system | mechanism | reported | our test of the same mechanism |
|---|---|---|---|
| **Adaptive-RAG** (Jeong et al., 2024, NAACL) | route on query complexity, then choose how many retrieval rounds | beats single-round RAG on multi-hop sets | the nearest proxy — pack size 1 against ≥ 2 — is **−0.69pp** as a gate (§149) and **−0.33pp** as an assigned arm |
| **Zhou et al., “What makes good in-context examples”**; **Lu et al., 2022** | more demonstrations dilute attention; order and selection swing accuracy | large effects on classification and QA | the same *sign* is not reproducible here: the second rule is a net harm on its own record (0.85) and the pack still cannot be improved by removing it |
| **Elazar et al., “the ICL paradox”** | more demonstrations make the model less attentive to the query | demonstrated across model families | our second rule **prevents 15 repairs and 24 breaks** the first rule would otherwise have made — attention dilution would have to predict a *sign change* in the remaining item, and it does not |
| **ACE** (Zhang et al., 2025) | curator prunes bullets on helpful/harmful counters | shipped as the maintenance mechanism | a prune needs per-item value, which §150 found has a reliability of −0.31; this round adds why: **items are not separable**, so a per-item counter is measuring an effect that depends on its neighbours |
| **SKR / Self-RAG / CRAG / SIM-RAG** | decide *whether* to retrieve, or score each passage | large gains | refuted for this store in R34 (62.4% precision against a 47.64% bar, −0.05pp) |

**Why the same mechanism pays there and not here, in one sentence.** Their retrieved unit is a passage that
carries a missing fact, so the marginal passage either supplies the fact or is inert; ours is a rule that
changes how the query is written, so the marginal rule changes what the first rule does — and a unit whose
effect depends on its neighbours cannot be counted, budgeted or pruned as if it were independent.

### The measurement no competitor has published

Every system that reports "we retrieve top-k" reports a k chosen on a validation split, and the choice is
almost always justified by the aggregate. The aggregate is compatible with three different worlds: items that
add, items that interfere, and items that are simply selected by a threshold the way ours were. **The
four-cell decomposition separates them**, and its identity — the four cells sum to the measured delta — is
what makes it checkable rather than anecdotal:

```text
  the question was …            pair right   pair wrong
    bare model wrong                    23           15
    bare model answered                 24           27
  net of the second rule: +23 +24 −15 −27 = +5 questions
```

A system that reports k on a validation split can run the same decomposition for one afternoon's compute and
learn which of the three worlds it is in. If the cross-terms are zero, its k is a real knob. If they are not
— as here, where they are 54% of the marginal item's gross effect — its k is an interaction it cannot see,
and its ablation table is measuring an artefact of the order its retriever produced.

### Where microglia stands, as a rank rather than a vibe

- **On the BIRD leaderboard: not ranked.** 57.63 dev against AskData's 78.49; nothing in this round touches
  the gap, which is the generator and the pool.
- **On the memory-mechanism axis: the only entry whose published numbers are negative out of sample**
  (−0.71pp, §146), whose best selective-retrieval gate is indistinguishable from zero (+0.11pp of a 2.67pp
  ceiling, §149), whose per-item ledger has negative reliability (R35), and now **whose only positive
  contrast reverses under assignment** (R36).
- **What it has that the table does not:** the exchange-rate arithmetic (repairs ≥ 8.10% at fixed breaks, or
  breaks ≤ 4.59% at fixed repairs, against a 1.393 hurdle), the assignment test, and the four-cell
  decomposition with an identity. Those three are the parts a competitor could adopt tomorrow and the parts
  that would tell them whether their own memory pays — none of which requires this project's store, corpus or
  model.

### The check that costs nothing, and the one number a k-tuning paper should publish

Every system in the table above reports a k, and a k is a decision about an average. The per-fold reading is
the cheapest possible audit of whether that average means anything: bucket the same cases by the fold each
question was held out in and recompute the four cells. Ours, on one split of one store:

| fold | questions | first draw | second draw | interval excludes zero |
|---|---|---|---|---|
| 0 | 307 | 0 | −2 | neither |
| 1 | 307 | −4 | −1 | neither |
| 2 | 307 | +4 | +5 | neither |
| 3 | 307 | **−5** | −1 | first only |
| 4 | 306 | 0 | −2 | neither |
| **pooled** | **1,534** | **−0.33pp** | **−0.07pp** | neither |

Our split is seeded, so fold *k* is the same questions in both draws and the table is paired: three of five
folds keep their sign, and **the single fold whose interval excluded zero on the first draw covers zero on
the second**. A k chosen on the pooled number would be a k fitted to an average of five numbers, none of which
is separable from noise on either draw. **The publication standard this suggests is two extra columns**:
alongside the k and its validation score, the fold-by-fold sign of the marginal item *and* its interval, on
two store draws if the store is stochastic. If no fold decides, the k is a coin; if a fold decides on both
draws, the k is a knob and the ablation is worth reading.

## Appendix H — The grain: what every system stores, and the statistic none of them publish (2026-11-02)

**The leaderboard did not move.** AskData remains SOTA at **83.40 test / 78.49 dev**; microglia's no-memory cell is
**57.63 dev** on the same split, and it is **not ranked** — the 20.86pp gap is generator and pool (§2), untouched by
anything here. What R37 tests is the one design dimension the whole comparison has been holding fixed without saying
so: **what a memory item is.** Every system in §3 stores statements, and R37 asks whether it should store terms.

### The unit of memory, by family

| family | the unit it writes | retrieved by | can its unit refuse to apply? |
|---|---|---|---|
| Mem0, LangMem, ACE-style playbooks | a fact, preference or insight, in prose | embedding similarity to the query | **no** — a statement has no referent, so it applies wherever it is read |
| ExpeL, Reflexion, Voyager skill libraries | an insight or a reusable procedure distilled from trajectories | similarity, or a task description | **no** — same reason |
| Agent Workflow Memory, A-MEM | a workflow or a linked note | similarity, plus links | **no** — links widen the set, they do not license an item |
| Graphiti / Zep-style temporal graphs | an **entity** and its edges, with a name | embedding, graph traversal, recency | **partly** — an entity has a referent, but nothing forces the query to contain its name, so the graph can speak about an entity the question never mentions |
| **microglia R37 (`full-lexicon`)** | `{term, statement}`, term copied from the question that taught it | **the term itself** | **yes, by construction** — write-time `admitLexicon`, read-time `lexiconPackOf`, and `V64` re-reads the rendered lines |

The graph family is the closest prior and it is the one worth being precise about: an entity node is exactly the
right *object*, and R37's finding is about the object, not the storage. What the graph systems do not have is the
**licence** — the two predicates that make "the query contains this name" a precondition rather than a retrieval
preference. A licence is what lets a definition be checked against the question in front of the reader, and it is
also what makes the representation's coverage measurable.

### The number that is missing from every ablation table

R37's arm is licensed and reached **132 of 1,534 questions (8.6%)**; on those, 179 entries distilled from 547
corrections and carried 13 distinct terms the corpus repeats. Against the rule grain it reads **−0.59pp
[−2.09, +0.91]**, and against no memory **+0.13pp [−0.59, +0.85]** — and the honest reading of both is that they
are deltas on a twelfth of the split, so neither can be about the representation.

**That is the statistic the field does not publish.** A system that stores entities, terms, tags or keys reports an
end-to-end delta and a retrieval precision; it does not report **the share of the evaluation set on which its unit
could apply at all**. Without that number the delta has an unknown denominator, and a reader cannot tell a weak
mechanism from an unexercised one — which is precisely the ambiguity R37's registration was written to pre-empt, by
fixing a 25% floor before the run and naming the outcome *inconclusive by feasibility* rather than a refutation.

### The publication standard this suggests

Three columns beside any memory ablation, and none of them costs a model call:

1. **Reach** — the share of the evaluation set on which the memory rendered anything, plus the concentration (our
   132 covered questions are 81% accounted for by two terms).
2. **Licence rate** — of the lines rendered, the share whose key actually occurs in the question it was shown for.
   Ours is **132 of 132**; a system whose keys are entities selected by similarity will not be near 100%, and the
   gap between those two numbers is the size of the dose nobody intended to give.
3. **The exchange rate against the bare model's own hurdle** — repairs per break divided by the model's base odds
   (1.335 on BIRD dev). A delta without it cannot distinguish a memory that helps from a prompt that perturbs.

### Where microglia stands, as a rank rather than a vibe

- **On the BIRD leaderboard: not ranked.** 57.63 dev against AskData's 78.49, and this round changes nothing about
  the generator or the pool.
- **On the memory-mechanism axis: the seventh negative, and the first that is about the corpus.** Six routes closed
  with the corpus held fixed — content, quantity, the filter, the population, the store's items, the item count —
  and now the object itself, which is the last one an ablation table can vary. **A distilled memory pays only where
  the same words come back**, and on independently written questions they do not: 13 terms from 179 entries, 8.6%
  reach.
- **What it has that the table does not:** the licence predicate, the reach statistic, the exchange-rate arithmetic
  and the four-cell decomposition with an identity. Any of the four is adoptable tomorrow by a system with a
  different store, corpus and model, and each one tells its owner whether the memory is paying rather than whether
  it is retrieving.

## Appendix I — Reach, density and the counterfactual every memory paper omits (2026-11-02)

**The leaderboard did not move, and this round could not move it.** AskData remains SOTA at **83.40 test /
78.49 dev**; microglia's no-memory cell is **57.63 dev** on the same split and is **not ranked** — the 20.86pp
gap is generator and pool (§2). R38 bought no dispatch. What it produced is a measurement of whether the
memory programme's last negative was the mechanism's fault, and it is the first entry in this appendix whose
subject is the *evaluation corpus* rather than a system.

### The counterfactual: what the corpus's own definitions could have reached

Every memory ablation in the literature reports a delta, and a delta on a representation that could only
apply to part of the evaluation set is a number with an unknown denominator. R38 makes the denominator
computable, using definitions the benchmark itself wrote: BIRD annotates 90.35% of dev questions with a
key–value mapping from a phrase the question uses to the database vocabulary it denotes.

| store size | a definitional store built from the corpus's own keys | microglia's R37 arm |
|---|---|---|
| 13 keys — the arm's own | **241 questions** (241 / 148 / 78 across three density thresholds) | 132 |
| keys needed for 25% of the split | 53 | never reached 25% |
| ceiling, every vocabulary key held | **65.9%** (52.3% at density 1.0) | — |
| entries spent per distinct key | one per key, by construction | **13.77** |

So a store of that size could have reached 1.8× further, and no store could have reached half the split.

### The statistic the field does not publish, now with a second half

Appendix H proposed three columns — reach, licence rate, exchange rate against the bare model's hurdle. R38
adds the column that makes the other three interpretable:

**density** — for each key a memory stores, how often the corpus annotates it, over how often its questions
mention it. On BIRD dev the distribution is an inversion: keys mentioned in three questions or fewer carry an
annotation in **96.7%** of them, keys mentioned in fifty or more in **7.7%**. The corpus defines what it says
once and leaves undefined what it says often.

That single number predicts the whole family of negatives. A memory retrieved by the question's own words can
only act where words recur; a corpus writes definitions exactly where words do **not** recur; therefore a
memory that must be licensed by the question cannot carry the corpus's definitions, whatever its store,
embedding, ordering or distillation. Any system whose memory is keyed — Graphiti's entity names, a tag
store, a glossary — can compute this on its own corpus before building the layer, and it costs nothing.

### Where the position stands

- **On the BIRD leaderboard: not ranked.** 57.63 dev against AskData's 78.49; nothing here touches the
  generator or the pool.
- **On the mechanism axis: seven routes closed, and the seventh now has a ceiling rather than an anecdote.**
  Content, quantity, filter, population, store contents, item count, and item type — with the last one bounded
  by the corpus's own vocabulary: 34.1% of the split is unreachable by any store of definable terms.
- **What it holds that the table does not:** a reach curve as a function of store size, a density separator
  computed from the corpus's own annotations rather than from a stopword list, and a licence-versus-serve
  agreement check that caught two scope errors in its own reading. The first two transfer to any system with a
  keyed store; the third transfers to any system that reports what it retrieved.


## Appendix J — The column no system in this table publishes: what its own sample could resolve (2026-11-02)

**The leaderboard did not move.** AskData remains SOTA at **83.40 test / 78.49 dev**; microglia's no-memory
cell is **57.63 dev** and is **not ranked**. R39 bought no dispatch and produced no accuracy number. What it
produced is the column that decides how every other number in this appendix should be read.

### The comparison, restated as a question about instruments

Every row in Appendix A–I reports a delta on an evaluation set. Not one of them — including ours — reports the
smallest delta that set could have resolved. That is not a criticism of the sources' arithmetic; it is a
statement about what a memory paper's table usually carries, which is a score, a baseline and a seed or task
count. The seed count is the input to the missing number rather than the number.

R39 computes it for this project's whole record and the result is severe:

| quantity | value |
|---|---|
| published arm rows over 20 artefacts | **98** |
| rows decided at 80% power | **18** |
| smallest decided row | **4.57pp** |
| median floor at 350 questions (75 rows) | **4.38pp** |
| median floor at 1,534 questions (22 rows) | **2.07pp** |
| median floor at 7,000 questions (1 row) | **0.82pp** |
| the memory contrast, 20 runs | **18 negative, 2 positive, 1 decided** |
| its median magnitude, 350 → 1,534 questions | **2.86pp → 0.33pp** |

**So the number this project has been arguing with itself about for a dozen rounds was never measurable at
the size it was measured.** That is the same sentence one could write about most of the mechanism rows in this
appendix, and writing it is the reason the column belongs here rather than in a footnote.

### Where microglia now sits against the field, in its own terms

| comparison | microglia (2026-11-02) | the field |
|---|---|---|
| BIRD dev accuracy, no memory | **57.63** | AskData **78.49 dev / 83.40 test**; not ranked, 20.86pp behind |
| memory ablation at a fixed corpus | **−0.71pp [−1.27, −0.18]** on 7,000 out-of-sample questions, 5 of 5 folds negative | deltas typically reported on tens to hundreds of tasks, without a floor |
| does a reported delta exceed its own resolution | **18 of 98 rows** | not reported |
| does a reported effect survive a larger sample | `full − none` **shrinks 8.7×** from 350 to 1,534; `linked` **grows** 7.71 → 9.26 | not reported |
| what a question costs to settle | **352 questions** (cheap end) to **1,457,294** (dear end) | not reported |
| store size the corpus could support | **241 questions** at the arm's 13 keys; ceiling **65.9%** | not reported |

**What this appendix claims and what it does not.** It does not claim the field's memory systems do not work;
it claims that the published tables do not contain the quantity that would show whether they do, and that when
this project computed that quantity for itself, all eighteen of its decided rows were large effects the product
never depended on, and not one of the small effects it *does* depend on was decided at all. **The transferable contribution is the column**: `√(z²·d/n)` beside every delta, the
control named in every row, a price on every undecided question, and a replication count that refuses to call
one decided run a replication. Any system in this table could compute all four from artefacts it already has,
and none of them does.

## Appendix K — Architecture generality, which no leaderboard scores (2026-11-02)

**The leaderboard did not move.** AskData remains SOTA at **83.40 test / 78.49 dev**; microglia's
no-memory cell is **57.63 dev** and **not ranked**. R40 bought no dispatch and produced no accuracy
number. What it produced is the one property a competitor's table cannot show: whether the measurement
apparatus is the benchmark's or the product's.

### The comparison, restated as a question about coupling

Every system in Appendix A–J is measured by *its own* harness. That is not a criticism — it is what a
benchmark paper does — but it means the published table cannot distinguish two very different artefacts:
a general measurement protocol that happens to have been run on text-to-SQL, and a text-to-SQL system
with a bespoke scorer. XiYan-SQL and CHASE-SQL are the second kind by construction; Mem0, LangMem,
Graphiti/Zep and A-MEM are memory stores measured by task suites written for them.

R40 measures the distinction for this project and finds it is now a package boundary:

| quantity (recomputed on every push) | microglia (2026-11-02) | the field |
|---|---|---|
| production lines in the scenario adapter | **1,766** in 7 modules, one package | not reported |
| scenario vocabulary in the base library | **0 of 37 modules** in code | not reported |
| modules that name a database and are *not* the adapter | **12**, each with a written reason | not reported |
| package imports that point up the layer graph | **0 of 5** | not reported |
| gates reused by a second scenario | **39**, of which 9 supplyable, 30 arm-indexed, 2 vacuous (§138) | the field's second domain usually gets a second scorer |

**What this appendix claims and what it does not.** It does not claim the field is not modular — most of
these systems are. It claims that *"our harness is general"* is a sentence nobody publishes evidence for,
and that when this project computed the evidence it found the honest answer was narrower than the
sentence: the protocol is scenario-agnostic, the **gate set** is arm-indexed (§138), and the scenario is
1,766 lines that live in exactly one package. **A positioning claim that survives its own repository is
worth more than one that survives a reviewer**, and the difference between the two is a gate.

**Where microglia sits, in one line.** Nowhere on the leaderboard — 20.86pp behind the SOTA on BIRD dev —
and the only entry in this document whose architecture claim is enforced by three blocking gates rather
than asserted in a paragraph.

## Appendix L — The axis the leaderboard actually scores, and the competitor whose thesis is ours (2026-11-02)

**Why a second benchmark changes the ranking question.** BIRD is single-shot: one question, one statement,
one execution. τ²-bench is an agent loop with a user simulator, tools and a policy — the setting this
library claims to be *for*. R41 ran the first arm on that axis (learn τ²-retail, answer τ²-airline), so the
comparison table can now be read against the benchmark whose shape matches the product rather than against
the one whose shape matches the adapter.

**The τ²-bench table moved, and it moved a long way from the number this project registered.**

| entry | airline pass^4 | retail pass^4 | note |
|---|---|---|---|
| **IBM Research, learned guidelines** | **82.0** | **67.5** | leaderboard PRs opened 2026-09; guidelines learned from a retail *train* split that the base split includes (disclosed); expected to be listed Unverified |
| SapientAI-Agent-Opus-5 (claude-opus-5 / gpt-5) | 72.0 | 72.8 | custom scaffold, four trials, published trajectories |
| RAFT-30B-A3B | — | 61.4 | fine-tuned on synthetic τ²-retail data |
| ALTK-Evolve | — | 57.5 | **the bar this project registered against** (`PUBLISHED_PASS4`) |
| stock `llm_agent`, gpt-oss-120b | 34.0 | 27.2 | the same stock agent this lane runs, one model family down |
| **microglia, memory arm (R41)** | **36.0** | — | stock `llm_agent`, deepseek-chat, 50 tasks × 4 trials, **store empty — see below** |
| **microglia, reference arm (R41)** | **46.0** | — | same episodes, no store |

**Two things in that table matter more than the gap.** The first is that `PUBLISHED_PASS4 = 0.575` is no
longer the leaderboard's top: it is the number that was published when this lane registered its bar, and the
artefact says `published_bar_applies: 0` on any scenario other than retail precisely so a stale snapshot
cannot be read as a ceiling. The second is that **the top entry's thesis is this project's thesis** — learned
guidelines, no weight updates, no human annotation, a stated +10 accuracy points and +15 pass^4 points on
τ²-retail — which makes it the most relevant competitor datum in this document and the one that most
deserves the caveats it carries.

**What its disclosure says, read as a measurement rather than as a claim.** The retail submission states
that its guidelines were learned from a retail train split **that the base evaluation split includes**, in
the same breath as reporting pass^4 67.54 over 114 base-split tasks. That is not necessarily a leak — the
τ² base split is defined to contain train tasks — but it does mean the number is a *closed-book-on-a-subset*
figure, and the leaderboard's own "Unverified" label is the right reading of it. The airline submission has
no such overlap available (50 tasks, no train split to learn from), and reports 82.0. **The difference
between the two submissions is exactly the difference this project's transfer arm exists to measure**, which
is why R41's four transfer gates were the ones worth porting to a second scenario.

**What microglia publishes that nothing in this table does.** Every row above is a pass^k and a cost. No
entry publishes whether the treatment was applied: a pack's mean size, whether the store held anything, how
many repairs came from the pack rather than from the retry, or a ledger pairing each episode against the
same episode without the treatment. R41 published all four — and reported, against its own interest, that
its memory arm's **store was empty for all 200 recall requests**, which is why `36.0` is not a reading about
memory. The gate that caught it (`V1-pack-not-empty`) is blocking, and the four gates that should have
explained it were absent from the artefact until R42 made the driver write them.

| quantity | microglia | the field |
|---|---|---|
| gate that fails when the treatment was not applied | **`V1`, blocking** | not reported |
| paired per-episode ledger, holes included | **`V33`, 200/200 rows** | not reported |
| net marginal effect with its own repair/break counts | **`V17`, −5.00pp** (and the pack was empty) | not reported |
| sample resolution, stated with the delta | **`V5`, 16.81pp at n=50** | rarely reported |
| leaderboard bar bound to the scenario it was measured on | **`published_bar_applies`** | not reported |

**Where microglia sits, on the axis the product is for.** **36.0 against a leaderboard top of 82.0** on
τ²-airline, and the honest label on that number is *void*: the arm it came from had no store, so it measures
the reference arm with an HTTP façade. **The comparable number is 46.0** — the same episodes with no memory
at all — which puts this lane 36 points behind the airline top before any treatment is applied. That gap is
a statement about the agent, not about the memory: the lane runs τ²'s stock agent on a single model with no
scaffold work, and the entries above it are scaffolds. What the project can claim, and what this appendix
records, is that its apparatus is the only one in the table that can say *whether* a treatment was applied
— and that it said so about itself.

### L.2 — R42: the delivery reading, and where the lane actually sits

**The second dispatch moved the pairs and not the rank.** R42 re-ran the same axis with the instrument
repaired, and the arms land inside each other's interval:

| entry | airline pass^4 | n | what it means |
|---|---|---|---|
| IBM Research, learned guidelines | 82.0 | 50 × 4 | leaderboard submission, unverified |
| SapientAI-Agent-Opus-5 | 72.0 | — | custom scaffold |
| ALTK-Evolve (this lane's registered bar) | — | — | 57.5 retail; no airline number |
| **microglia, reference arm (R42)** | **40.0** | 50 × 4 | stock `llm_agent`, deepseek-chat, no store |
| **microglia, memory arm (R42)** | **44.0** | 50 × 4 | same episodes, store of 14 items, **0 served** |
| stock `llm_agent`, gpt-oss-120b | 34.0 | 50 × 4 | one model family down, same harness |

Microglia is **fifth of six named entries** on this axis, and the honest reading of its own two rows is that
they are indistinguishable: 4.00pp with a 95% interval of [−6, +14] and p = 0.6875 over 50 paired tasks,
against a minimum detectable difference of 13.73pp. The lead is inside the noise, and the reason is known:
`V1-pack-not-empty` fired at 0.00 rules/question on all 200 requests, from a store that held fourteen items.

**What R42 added to the table that no competitor publishes.** The census, which separates four defects that
used to share one number:

| quantity | R41 | R42 | the field |
|---|---|---|---|
| items stored / active / servable in the recall scope | 0 / 0 / 0 | **14 / 14 / 14** | `tau2.store` |
| recall requests / served / empty | not recorded | **200 / 0 / 200** | `tau2.recall` |
| failures the learner could read | 32 of 32 (refused) | **7 of 32** | `learning.edited`, `learning.unanswered` |
| `V1`'s sentence | `0.00 rules/question` | `0.00 …: 0 of 200 request(s) carried an item, from a store of 14 (14 active, 14 in scope)` | protocol `V1` |

The third row is the one a leaderboard cannot see and this document's whole argument turns on: both arms of
both rounds published a pass^4, and in three of the four cases the treatment had not been delivered at all.

**Where the SOTA question stands after two instrument rounds.** On BIRD Mini-Dev this project's numbers are
competitive and its own published deltas are resolvable; on τ²-bench it is not near the top, its bar is
unreachable at the benchmark's population (`tasksForFivePp` = 185 at R42's discordance against 50 airline
tasks), and the one claim it can make — that a *transfer* treatment was measured with a ledger rather than
asserted — is a claim no entry in the table makes at all. Being fifth while publishing the instrument that
would expose a first place as undelivered is the position this project chose, and R43 is the round that
first puts a pack in the prompt.

### L.3 — R43: the axis under the leaderboard, which is what the labels actually grade

**A leaderboard ranks systems on a score whose components the benchmark chose, and the choice is countable.**
For τ² at the pinned ref it is exact (§17.83): no task in `retail` or `airline` declares `reward_basis`, the
default is `[DB, COMMUNICATE]`, and the reward is the product of exactly the components named in the basis.
The reference calls are replayed onto a fresh environment to build the target DB hash, so the agent is graded
on reaching that state rather than on walking that path, and the prose rubric gates nothing at all.

| what a report owes its reader | microglia (this round) | the other entries in §L.2 | upstream τ² |
|---|---|---|---|
| a `pass^k` on a named scenario, with its split and trials | yes | yes | ships the harness |
| which reward components were active in the run | **yes: `[DB, COMMUNICATE]`; 0 of 164 tasks declare otherwise** | not in the material this record has read | documented in later revisions (`src/tau2/evaluator/AGENTS.md`, `docs/evaluation.md`); at v0.2.0 only in the source |
| the corpus's label shape — calls, prose, neither | **yes: 112 + 43 name calls, 8 + 50 state prose, 2 state neither** | not in the material this record has read | not published as a count |
| whether the treatment was delivered | **yes: `tau2.store`, `tau2.recall`** | no | n/a |
| what the sample could resolve | **yes: `resolution.halfWidthPp`, `mde80Pp`** | no | n/a |

**None of the four columns is a boast about accuracy; they are all about what a reader can check.** The
second row is the one that changes what a delta means: on a scenario graded by an end-state hash times a
substring match, no memory can gain a point by making an agent *talk* better unless the improved fact was in
`communicate_info` — which 38 of 114 retail and 6 of 50 airline tasks state. The third row is what bounds an
excuse: 2 of 164 tasks cannot teach, so any "the labels were the obstacle" claim has to fit inside two.

**Where this leaves the ranking, stated the way §L.2 stated it.** The order on τ²-airline `pass^4` does not
change because the corpus was counted: IBM's 82.0 (unverified) is still first, SapientAI's 72.0 second, and
microglia still sits fifth of six named entries, with its own two arms inside each other's interval. What
changes is the standing of the *column*, not the row: the four other entries cannot say which of their points
came from a database write and which from a sentence, because they did not record it, and this record can —
which is the only sense in which the instrument is ahead of the leaderboard while the score is behind it.

### L.4 — R43: the third delivery reading, and what a leaderboard cannot see

**The axis did not move and the instrument did.** R43 re-ran the R42 contrast with the reader repaired and
the keys owned by the host:

| entry | airline `pass^4` | n | what it means |
|---|---|---|---|
| IBM Research, learned guidelines | 82.0 | 50 × 4 | leaderboard submission, unverified |
| SapientAI-Agent-Opus-5 | 72.0 | — | custom scaffold |
| ALTK-Evolve (this lane's registered bar) | — | — | 57.5 retail; no airline number |
| **microglia, reference arm (R43)** | **42.0** | 50 × 4 | stock `llm_agent`, deepseek-chat, no store |
| **microglia, memory arm (R43)** | **38.0** | 50 × 4 | store of 24 items, **0 active, 0 served** |
| stock `llm_agent`, gpt-oss-120b | 34.0 | 50 × 4 | one model family down, same harness |

Still **fifth of six**, and the pair is not a measurement of the mechanism: −4.00pp with an interval of
[−18, +10], against a minimum detectable difference of 20.97pp at 50 paired tasks. `tasksForFivePp` is 431 at
this round's 14% discordance, which no split of a 50-task scenario can supply.

**What the three rounds of this lane have in common, and it is the entry's real content.** Three times the
memory arm published a number, and three times the treatment had not been delivered: R41 had no store, R42
had a store the recall path could not reach, R43 has a store nothing admitted. The published deltas were
+4.00pp, +4.00pp and −4.00pp, which is exactly what a memory that does nothing looks like — and no column in
any of the tables above, including this one, would have shown it. The `store`/`recall` census and `V1`'s
population sentence are what make the third column say `0 served` instead of leaving it to be inferred from
a null.

**Where the standing claim now sits.** The honest claim after R43 is narrower than after R42 and better
founded: the lane can learn from every failure it can read, it cannot yet admit what it learned, and it
publishes the layer it fails at. Against a field whose top entries publish a score and nothing about whether
their treatment arrived, that is a claim about method rather than about rank — and it is the only column in
this appendix where the ordering is not in dispute.

### L.5 — R44: the competitor published the negative effect, and the corpus priced our evidence

**R44 readback.** Run `41872858497`, head `dccbb3d`, artefact `l4-evidence` (`13350877140`,
20,276,079 bytes). `store` 19 / 0 active / 0 servable, `reasons insufficient-evidence=19`,
`recall` 1,427 / 0, `meanPackIds 0.00`, `pass^4` memory **0.52** / reference **0.40**, `l4-paired`
**+12.00pp** [−2.00, 26.00] p = 0.1460 n = 50, `V5` FAIL at 19.41pp MDE. The job's conclusion is
`failure` because four blocking scientific gates failed; the build gate on the same head is green. The
two colours measure different things and neither is suppressed.

**Why the ranking table does not move.** R43 read 0.38 / 0.42 and −4.00pp; R44 read 0.52 / 0.40 and
+12.00pp. Both rounds served zero items. Two samples of the same untreated condition therefore moved
the headline by 16pp and the memory arm's `pass^4` by 14pp, against a minimum detectable difference of
19.41pp at 50 paired tasks. Promoting 0.52 from fifth to third would be quoting noise as a treatment.
The table in L.4 stands: **SOTA = IBM 82.0 (unverified), microglia fifth of six named entries**, and
the only column this project leads is "whether the treatment was delivered", currently `0 served`.

**The competitor's October data is now the sharpest datum in this appendix.** IBM's 2026-10-20
ALTK-Evolve report ([analysis](https://techbeat.co/story/altk-evolve-puts-gpt-4-1-atop-2-bench-with-learned-memory),
[Chinese coverage](https://www.unite.ai/zh-cn/ibm-research-reports-learned-memory-tops-tau-2-bench-service-benchmark/))
publishes the leaderboard submissions as PRs #542 (retail, 2026-09-14) and #551 (airline,
2026-09-21), both disclosing modified prompts and expected to be flagged **unverified**:

| submission | Pass^4 | configuration | note |
|---|---|---|---|
| IBM `gpt-5.5`, airline | **82.0** (#1) | lossless, 101 guidelines | unverified; frontier entries 66–72 |
| IBM `gpt-4.1`, retail | **67.5** (#1) | lossless, 292 guidelines | beats RAFT-30B-A3B 61.4 by 6.1pp |
| SapientAI-Agent-Opus-5, airline | 72.0 | custom scaffold | — |
| IBM `gpt-4.1`, airline | **44.0** (#8) | `sup3`, 14 guidelines | rules seen in ≥ 3 tasks |
| **IBM, airline, lossless** | **40.0** | 101 guidelines | **below the 14-rule core by 5pp** |
| microglia R43 memory / reference | 38.0 / 42.0 | 0 served | — |
| microglia R44 memory / reference | 52.0 / 40.0 | 0 served | — |
| stock `llm_agent`, gpt-oss-120b | 34.0 | no store | — |

The comparison that matters is the pair in bold: **more memory reduced reliability by 5pp** in the
competitor's own airline results, and IBM explicitly reports that airline favours the compact `sup3`
core while retail favours the full rule set — domain-specific admission, not a fixed rule count. Cost
moves the same way: $0.084 → $0.139 per retail conversation (+65%) for the full list. This is the same
thesis as `selective addition`, published by the current SOTA holder.

**Three independent literature lines, all pointing at admission rather than volume.**

| source | finding | number | code |
|---|---|---|---|
| Xiong et al., [arXiv:2505.16067](https://arxiv.org/abs/2505.16067) (ACL 2026) | `experience-following` causes error propagation and misaligned experience replay; selective addition + combined deletion fixes it | ~**10pp** absolute gain over naive memory growth | [agent_memory_manage](https://github.com/yuplin2333/agent_memory_manage.git) |
| IBM ALTK-Evolve (2026-10-20) | lossless 101 rules underperform the 14-rule `sup3` core on airline Pass^4 | **40.0 vs 45.0** | open-source library; PR #542/#551 |
| Yu et al., [arXiv:2608.10502](https://arxiv.org/abs/2608.10502) | dependency-guided rollback: remove faulty memories, preserve benign, selectively replay | **85.3%** recovery vs 77.3% LLM-judge; 100% benign preservation; −41.8% LLM calls | [memory-rollback](https://github.com/xiaoqi-7/memory-rollback) |
| Xu et al., [arXiv:2502.12110](https://arxiv.org/abs/2502.12110) (NeurIPS 2025) | A-MEM: Zettelkasten-linked notes, memory evolution; `FlexA-Mem` (2026-10) makes the note set budget-adaptive | qualitative on six foundation models | [A-mem](https://github.com/agiresearch/a-mem) |

**What our own corpus adds that none of them have.** R44's reason histogram plus an offline
reproduction on the real retail tasks localises the negative effect to a *measurement* defect, not a
design preference: `editDistance` prices a gold-verified correction by the number of tool arguments,
`createLlmInterpreter` writes that price into both `trust` and `evidence.weight`, and `scoreKnowledge`
applies it twice. Measured over 32 real learn tasks: `trust` 0.50–0.90, `confidence` 0.27–0.62,
**31 of 32 held as candidates**. A five-condition ablation rejects all three threshold levers
(`activationThreshold`, `minSupport`, `singleObservationTrust`) and selects a gold-verified semantic
distance, which admits 32 of 32 with no threshold touched. R45 wires it through the architecture's
existing `editSemantics` hook and predicates the dispatch on `served > 0`.

**Standing comparison after R44.** SOTA is unchanged (IBM 82.0, unverified). microglia remains fifth of
six named entries and the only entrant publishing `store.active`, `recall.served` and `V1`'s
population — the three numbers that say whether the treatment arrived. The gap is not a score gap yet;
it is a delivery gap, and R45 is the first round that can close it.

### L.6 — The competitor's source code, read on 2026-11-06

**Repository.** [`AgentToolkit/altk-evolve`](https://github.com/AgentToolkit/altk-evolve), branch
`main`, 135 stars, 418 Python modules, "Self improving agents through iterations". The README reports
the same loop on a second benchmark: a GPT-4.1 ReAct agent on AppWorld's held-out split goes from
**50.0% to 64.3% (+14.3pp)** with Evolve. Architecture: trajectories → extracted insights → database
→ fed back into the agent; the full service adds an MCP server, vector storage, LLM-based conflict
resolution, and **guideline consolidation that clusters and merges equivalent advice while preserving
support counts and source provenance**.

**The admission definition, from the code rather than the blog.**
`experiments/guideline_pipeline/stages/export.py` states it directly: support is
"the number of **distinct supporting source tasks**, or `support` in metadata, 1 when absent, for a
guideline whose provenance is partial; core is `support >= core_support`; `min_support` is a floor
applied before the split". The exported playbook is `{"r": rule, "n": support, "e": evidence}` with
evidence coded `s` / `f` / `b` (success / failure / both), and `_floor(rows, min_support)` drops
every row below the floor before export. `guidelines.py` imports the library's `_support` from
`llm/guidelines/retrieval.py` rather than redefining it, with the comment "so core / min-support here
mean exactly what they mean to `EvolveClient.select_guidelines`" — one decision point, the same
discipline this repository applies to `scoreKnowledge`. Rows are sorted by support descending with
rule text, evidence and id as ties, "so the rest only makes the order total and reproducible".
`stages/consolidate.py` delegates clustering, merging and support attribution to
`EvolveClient.consolidate_guidelines` and reports `support_before → support_after`.

**What the comparison actually says.** This is the `sup3` core behind the 45.0% airline result:
rules supported by at least three distinct training tasks. Three design differences are now visible
and all three are measurable:

| axis | ALTK-Evolve | microglia (before R45) | microglia (R45) |
|---|---|---|---|
| unit of support | integer count of distinct source tasks | float `evidence.weight × trust`, merged | unchanged, but `trust` is no longer priced by tool arity |
| admission floor | `min_support` (default 1), `core_support` 3 for the reliable core | `minSupport` 0.8 **and** `activationThreshold` 0.6 on confidence | same thresholds, corrected evidence input |
| selection | whole-rule Markdown list, ordered by support | scoped pack filtered by `scope.task` + `scope.domain` | unchanged |
| provenance | preserved through consolidation | `statusReason`, `evidence[]`, `scope` owner stamped by host | item-level `admission` census added |

The competitor's most important number for this project is still its own negative
result — 101 lossless guidelines at 40.0% Pass^4 against 14 `sup3` guidelines at
45.0% — because it says the **selection rule**, not the volume, decides the sign.
Our R45 repair changes the *input* to admission without changing the rule; R46's
candidate experiment is to ablate the rule itself: float weight against distinct
task count, and `minSupport` alone against a `sup3`-style corroboration floor, on
a served pack. Until a pack is served, none of those three can be measured, which
is why they are registered as candidates rather than as a plan in motion.

**R45 dispatch.** Run `42131391874` on `26f7c3f0`, `prereg=R45-admission`,
`l4_arms=both`, `bird=false`. CI run `42130978881` on the same head is green.
The readback, not this paragraph, decides whether the delivery gap closes.

### L.7 — Two 2026 sources read while R45 ran, and a third independent vote for distinct-task support (2026-11-06)

**Boundary.** R45 is pinned to `26f7c3f0` and measuring. This appendix changes no
source file, artefact, workflow or head in `microglia`; it records a source study
that cannot alter a number the run will report. Both repositories were read
through the GitHub tree API, and both abstracts were read on their arXiv pages,
not from a secondary index.

**Source 1 — MemGuard.** Wang et al., [arXiv:2608.21867](https://arxiv.org/abs/2608.21867),
*Persisting Verifier Signals for LLM-Agent Memory Governance*, submitted
22 Aug 2026, 30 pages, eight authors. Code:
[`whyyyyy123/MemGuard`](https://github.com/whyyyyy123/MemGuard), branch `master`,
42 tree entries, 30 Python files. The abstract names two failure modes —
*unreliable admission* (failed trajectories, accidental successes and misleading
observations enter memory because they appear relevant) and *memory drift*
(duplicate, stale and conflicting records that retrieval alone cannot repair) —
and states the paper's distinction: verifier output is **persistent lifecycle
metadata**, not a one-shot filter. Its reported results, over four backbones,
five seeds, 16 backbone–benchmark settings, four memory baselines plus a
verifier-only control under matched runtime budgets, are **+7.9 success-rate
points on WebArena**, **+5.6 step-success-rate points on Mind2Web** and
**2.4–3.5 points** on Terminal-Bench 2.0 / SWE-Bench Verified, all against
ReasoningBank as the strongest prior memory baseline. Those are different
benchmarks from τ²-bench airline and do **not** enter the ranking table in L.4.

**What the code implements, file by file.**

| path | the rule, as written |
|---|---|
| `src/memguard/memory/admission.py:11–14` | `DEFAULT_ACTIVATION_REWARD = 0.70`, `DEFAULT_ACTIVATION_CONFIDENCE = 0.60`, `DEFAULT_FAILURE_GUARD_CONFIDENCE = 0.70`, `DEFAULT_MAX_ACTIVATION_UNCERTAINTY = 0.50` |
| `admission.py:41–50` | with no verifier result the record is `PROVISIONAL` and `verification_required`; `docs/core_workflow.md:16–17` states it **cannot become an active positive memory** |
| `admission.py:58–61` | `VERIFIED_SUCCESS` becomes `ACTIVE` only if `score >= 0.70` **and** `confidence >= 0.60` **and** `uncertainty <= 0.50`; otherwise `PROVISIONAL` with reason `low_confidence_success` |
| `admission.py:63–64` | a failure trajectory becomes `ACTIVE` at `confidence >= 0.70`, but as a **failure guard**, i.e. a constraint rather than a positive recipe |
| `verifier/criteria.py:13–17,19–56` | four criteria — `task_completion`, `evidence_consistency`, `execution_validity`, `generalizability` — and the instruction "Do NOT trust the agent's self-assessment or unsupported claims that the result is correct", using only runtime-visible evidence and no hidden benchmark labels |
| `verifier/scoring.py:9–46` | `_weighted_mean`, `_label_for_score` on success/fail thresholds, `_boundary_score`, `_dispersion_score` over multiple score views: the reward / confidence / label / uncertainty descriptors the abstract describes |
| `memory/schema.py:22–43` | nine persisted `verifier_*` fields on every `MemoryRecord` (`score`, `confidence`, `label`, `criteria`, `model`, `verification_time`, `uncertainty`, `views`), plus `state`, `use_count`, `conflicts_with`, `dedup_key`, `supersedes` |
| `memory/retrieval.py:13–32` | nine positive weights (`relevance 1.00`, `quality 0.35`, `confidence 0.25`, `conflict 0.35`, `staleness 0.20`, `verifier_risk 0.45`, …) and six guard weights |
| `retrieval.py:314–347` | three channels, not one pack: `positive_limit 5`, `summary_limit 2`, `guard_limit 2`, from a `candidate_pool_size 20` hybrid BM25/cosine pool |
| `retrieval.py:350–363` | a **second** gate at injection time: `is_injection_eligible` rejects `uncertain / verified_fail / fail`, `verifier_score < 0.55`, `verifier_confidence < 0.50`, and demands `confidence >= 0.70` for guards |
| `memory/governance.py:193–215` | a cluster is summarised only when `len(cluster) >= cluster_min_size` **and** `len(distinct_task_ids) >= 2`; a `max_active_records` budget archives the overflow by retention score; stale failures (`not verified_success`, `use_count == 0`, aged past `retire_failure_days`) are archived first |
| `memory/consolidation.py:12–27,76` | surface similarity `>= 0.95` / `>= 0.80`, signature `>= 0.5`, and `ratio >= 0.92` decide DISCARD vs MERGE vs UPDATE |

**Source 2 — MemAdapter.** Ning et al., [arXiv:2610.05162](https://arxiv.org/abs/2610.05162),
*Counterfactual Adaptation Against Memory-induced Sycophancy*, submitted
4 Oct 2026, seven authors. Code:
[`DEEP-JLU/MemAdapter`](https://github.com/DEEP-JLU/MemAdapter), branch `main`,
194 tree entries, 95 Python files. Its premise is the sharpest statement yet of
the user's hypothesis: **objective and correct memories can still induce
sycophancy, and the same memory warrants different influence in different
contexts**, so filtering "bad" memories at pipeline stages cannot fix the harm.
The abstract reports three components — Counterfactual Induction, Context-Aware
Reflection and Evidence-Based Reasoning — and **no numeric deltas**; none is
invented here. `methods/memadapter/memadapter.py` implements them as three
stages (`01_counterfactual_induction_method_aligned.txt`, Stage 2 use
instructions, `03_memory_use_guided_generation.txt`) with per-stage JSON schema
validation and cached raw stage outputs. Its
`methods/memadapter/ablations/README.md` retains **exactly two** ablations —
`stage1-baseline` and `stage1-stage2-baseline` — and states that both reuse the
same frozen retrieval input, sample selection, model settings and judge contract
as the full method. That is the same discipline as this project's five-condition
offline ablation in R45, applied to the *use* of memory rather than its admission.

**A third independent vote.** L.6 recorded ALTK-Evolve's `support` = distinct
supporting source tasks with `core_support = 3`; IBM's own airline result puts
14 `sup3` rules at 45.0% against 101 lossless rules at 40.0%. MemGuard now adds
`len(distinct_task_ids) >= 2` as the condition under which repeated experience
may be collapsed into a reusable summary. Three independent implementations, in
two different benchmark families, make **corroboration across distinct source
tasks** the selection variable. microglia's `minSupport = 0.8` is a per-item
observation support, and R44 measured that it was never the blocker; R45 changed
the *input* to admission but not the *rule*. That is precisely what R46 is
registered to ablate.

**A caution on copying the threshold.** `sup3` is IBM's `core_support` on its
own airline corpus, not a constant of nature. An offline census on this lane's
32-task retail learn split (`AUDIT` §34.22, `TECH-DESIGN` §17.88) finds zero
groups at support ≥ 3 under the strictest normalisation and one under the
action-sequence reading. R46's floor must therefore be measured on real
distilled statements before dispatch, with MemGuard's `>= 2` registered as a
separate contrast arm. The competitor's *mechanism* travels; its *number* does
not.

**Four-axis comparison, unchanged ranking.**

| axis | ALTK-Evolve (L.6) | MemGuard | MemAdapter | microglia (R45) |
|---|---|---|---|---|
| admission signal | gold-verified insight + provenance | four-criterion verifier, no self-assessment | does not filter; calibrates at use time | `editSemantics` = 1 for gold-verified `correctionEdit`, core untouched |
| corroboration unit | distinct source tasks (`min_support`, `sup3` ≥ 3) | `distinct_task_ids >= 2` to summarise | n/a | `minSupport` 0.8 on one item's observations |
| use policy | whole-rule Markdown list by support | 5 positive / 2 summary / 2 guard, second injection gate | per-context influence calibration | one scoped pack, one injection |
| ablation discipline | `support_before → support_after` report | verifier-only control, matched runtime budgets, 5 seeds | 2 retained ablations on frozen inputs | 5-condition offline ablation (A–E), pre-registration, 2,921 tests |

**Ranking.** Unchanged. The SOTA remains IBM Research's `gpt-5.5` airline
submission at **82.0** Pass^4 (unverified, modified prompt, PR #551);
SapientAI-Agent-Opus-5 72.0; IBM `gpt-4.1 sup3` 44.0 at #8; stock
`gpt-oss-120b` 34.0. microglia stays **fifth of six named entries**, and all
four published arm readings (R43 38.0 / 42.0, R44 52.0 / 40.0) remain samples
of a zero-served condition. Neither new paper is a τ²-bench entry, so neither
moves a rank. The column this project still leads is "whether the treatment was
delivered", and it reads `0 served` until R45's readback.

### L.8 — What IBM's learned guidelines are, why their number cannot be replicated, and four more sources on the negative effect (2026-11-06)

**The question.** A reader asked what IBM Research's learned guidelines are and
why this project cannot replicate them. The honest answer has three layers, and
conflating them is the error the question invites: the *mechanism* is replicable
and has been read at source; the *number* is not a replicable object; and under
this project's own acceptance rules, copying the number would not answer the
question the project exists to answer.

**What the method is.** ALTK-Evolve (IBM Research, 2026-10-20; eleven authors
including Ashwath Vaithinathan Aravindan, Vatche Isahagian and Vinod Muthusamy)
lets the *same* model that acts as the agent read its own training trajectories
and distill successes and failures into short behavioural rules — authenticate
the customer before any order action, present a structured change summary and
obtain explicit approval before a database write, issue one tool call per turn.
The rules are appended as a plain Markdown list after the domain policy in the
system prompt. No weight update, no human annotation, no change to the τ²-bench
stock THINK→ACT ReAct scaffold, tools or policy. Agent `gpt-4.1`, user simulator
`gpt-5.5`, four trials per task; Pass^4 requires all four trials to succeed.

| domain (held-out n) | config | rules | mean accuracy | Pass^4 |
|---|---|---|---|---|
| retail (40) | baseline | 0 | 78.1 | 57.5 |
| retail (40) | `sup3` | 31 | 78.8 | 60.0 |
| retail (40) | lossless | 292 | 82.5 | **67.5** |
| airline (20) | baseline | 0 | 57.5 | 35.0 |
| airline (20) | `sup3` | 14 | 60.0 | **45.0** |
| airline (20) | lossless | 101 | 65.0 | **40.0** |

The pair in bold is the most important number in this appendix. On airline,
adding 87 more rules raised mean accuracy by five points and *reliability fell
by five*. Cost rose `$0.084 → $0.139` (+65%) on retail and `$0.081 → $0.107`
(+32%) on airline, almost entirely in prompt input tokens. IBM's own conclusion
is that guidance dosage is a domain-specific dial and that the **selection
rule**, not the volume, decides the sign. That is a published negative effect
from the current SOTA holder, and it is the datum that supports this project's
thesis.

**Why 82.0 is not a replicable object.**

1. **Unverified.** Both submissions are pull requests to the τ²-bench
   repository — #542 (retail, 2026-09-14) and #551 (airline, 2026-09-21) — not
   entries on a verified board. All figures are IBM's own reports; no
   independent reproduction exists.
2. **Modified prompt.** The PRs disclose modified prompts. The treatment is
   therefore "learned rules **plus** prompt engineering", and no published
   ablation separates the two.
3. **Model as a confound.** 82.0 uses `gpt-5.5` as the agent (and in that
   configuration as the guideline extractor). This lane runs τ²'s stock
   `llm_agent` on `deepseek-chat` (reference 40.0–46.0); the same harness on
   `gpt-oss-120b` scores 34.0. The 82-versus-40 gap is dominated by model
   capability, not by memory.
4. **Split overlap disclosed.** The retail guidelines were learned from a train
   split that the base split includes. The airline submission has no train split
   available. The difference between the two submissions is precisely what this
   project's transfer arm was built to measure.
5. **Sample resolution.** Held-out airline has 20 tasks: one task is five
   percentage points of Pass^4. IBM's own 40.0-versus-45.0 reversal is below the
   resolution of that sample. R44 measured this lane's MDE at 19.41pp with n=50
   and reported it; that is the correct reading of a five-point difference on 20
   tasks.
6. **Two different quantities, one headline.** The held-out `gpt-5.5` airline
   result is 55.0 → 70.0 Pass^4 (+15). The leaderboard's 82.0 is on the full
   base split against the 2026-10-12 snapshot. They are not the same measure and
   are not interchangeable.

Even with `gpt-5.5` in hand, reproducing 82.0 would still not answer "did
memory help", because model, prompt and split move together. This is an object
problem, not a capability problem.

**Why the project's own rules forbid treating it as a target.** SOTA benchmarks
must run through `AgentiX-E/microglia`'s `sota.yml`; IBM submitted to an
upstream repository. Every iteration here requires a pre-registration, a paired
per-episode ledger, a blocking `V1-pack-not-empty` gate, `ci.yml` green and both
repositories pushed as Lambertyan. The leaderboard table reports none of
`store.active`, `recall.served`, pack size or a paired ledger: no row in it can
say whether the treatment was delivered. Reproducing such a number would return
to the state R41 explicitly voided, when 36.0 came from an empty store. Org
secrets expose `DEEPSEEK_API_KEY` and `ZHIPU_API_KEY`; `gpt-4.1` and `gpt-5.5`
are not available through them, and LLM-dependent components must stay behind a
provider-agnostic abstraction rather than bind to one vendor.

**What does travel, and what does not.** The mechanism travels: support as the
count of distinct supporting source tasks, `min_support`, the `sup3` reliable
core, consolidation preserving support and provenance, and one shared
`_support` decision point (L.6). The number does not: §17.88 and `AUDIT` §34.22
measured that a copied `sup3 >= 3` floor selects zero groups on this lane's
32-task retail corpus under the strict normalisation. R46 is registered to
ablate the *rule*, not to import the *threshold*.

**A minimal attributable reproduction, if it is ever wanted.** One `sota.yml`
arm, one agent, one prompt, one split, one model, varying only the guideline set
(baseline / `sup3` / lossless), paired per episode, reporting MDE and power
alongside the delta, and declared a cross-model control rather than a SOTA
claim. Its precondition is `served > 0` on R45's readback. Before that, a
dispatch would only produce another void reading.

**Four more first-hand sources on the negative effect.**

| source | finding | number |
|---|---|---|
| AECG, [arXiv:2610.05176](https://arxiv.org/abs/2610.05176) (Tian et al., 2026-10-04) | `memory pollution` (weak or spurious procedures recalled repeatedly) and **`scope collapse`** (knowledge escaping the coordination scope in which it was effective, reused at incompatible decision levels) | best in 11 of 12 framework–benchmark settings; up to +10.23pp over the strongest memory method; **removing scope preservation costs up to 16.89pp** |
| Tether, [arXiv:2610.25123](https://arxiv.org/abs/2610.25123) (Wang et al., 2026-10-18) | a verdict derives from premises; when a signing key is revoked, its dependents must be withdrawn at read time | atomic-fact memory publishes 62% of upstream-failing objects; Mem0 42%, A-Mem/Graphiti 9%; Tether 0.3% with 37% fewer verification calls; rises to 9.4–22.1% when relations arrive in separate sessions |
| MemPABench, [arXiv:2610.30485](https://arxiv.org/abs/2610.30485) (Li et al., 2026-10-21) | 99 sessions, 14 preferences, four months, five preference changes per user | **Mem0, MemOS and simple RAG do not outperform No Memory**; file-based memory improves accuracy but applies preferences beyond relevant contexts |
| AMV-Guard, [arXiv:2610.31446](https://arxiv.org/abs/2610.31446) (Wang et al., 2026-10-22) | whether a memory must be re-verified is a property of the **action about to be taken**, not of the entry | ToolSandbox −33.9% verification cost at 100% safe-proceed recall; AppWorld −21.3% |

AECG's abstract states that code is available and links `github.com/fenhg297/AECG`.
That repository returned HTTP 404 on 2026-11-06, and a GitHub repository search
for both the project name and the owner returned zero results. The paper's
numbers are therefore read from its abstract, not from an implementation; this
appendix records the gap rather than filling it.

**Competitor source read this round.** `yuplin2333/agent_memory_manage`
(27 entries, 13 Python/Markdown files, Xiong et al. arXiv:2505.16067) implements
the ablation as five top-level scripts (`main_strict.py`, `main_coarse.py`,
`main_noerrorprop.py` and two noisy-memory variants). Its
`ExperienceMemory.find_worst_memory` deletes a record only when it has been
**retrieved at least `deletion_retrieval_n_times` AND its mean downstream L2
error exceeds `deletion_l2_threshold`**; `find_dead_memory` removes records
retrieved fewer than `retrieval_n_times` after `exist_time_threshold`. The
deletion signal is the *observed consequence of using the memory*, not a
write-time self-assessment — the feedback loop this lane does not yet have.
`xiaoqi-7/memory-rollback` (181 entries, 65 Python/Markdown, Yu et al.
arXiv:2608.10502) separates pure reachability in `affected_subgraph.py` from
`support_checker.py`, with an explicit exclusion set of evidentiary edges;
`agiresearch/A-mem` (23 entries, 11) triggers evolution every
`evo_threshold = 100` memories and links nearest neighbours.

**Ranking.** Unchanged: IBM `gpt-5.5` airline **82.0** (unverified, modified
prompt, PR #551) is the SOTA; SapientAI 72.0; IBM `gpt-4.1 sup3` 44.0 (#8);
stock `gpt-oss-120b` 34.0; microglia **fifth of six named entries**, all four
published arms from a zero-served condition. None of the four new papers is a
τ²-bench entry, so none moves a rank. The use-side census in `AUDIT` §34.23 and
`TECH-DESIGN` §17.89 is an offline structural measurement on this lane's own
corpus, not a benchmark result; R45's `l4-paired` sign is still unread.

### L.9 — R45 read back: the ranking holds, and the delivery column is no longer zero

**The readback, 2026-11-06.** Run `42131391874` on `26f7c3f0` completed
`failure` on three blocking scientific gates; `ci.yml` on the same head is
green. Both arms scored 50 τ² airline tasks at `k=4`: memory `pass^4 0.42`,
reference `0.36`, paired `+6.00pp [-6, +20] p=0.5488, n=50`, MDE 18.59pp,
transfer `22 repaired / 17 broken`, net `+2.50pp`, verdict `unmeasured`. The
R45 revert rule (significantly negative, or below −5pp with a served pack) does
not fire. Neither the sign nor the magnitude is an effect this lane can resolve,
and neither is claimed as one.

**The delivery result, which is a different column.** For the first time in five
rounds the memory arm was given a treatment: `store 21 active / 21 servable`,
`recall 1480 / 1480 served`, `meanPackIds 1.839`, `V1-pack-not-empty` PASS.
Six of six R45 predictions held. This closes the gap that made R41–R44's arm
scores void — not a ranking claim, but the precondition for ever making one.
`V44` reports 21 items all carrying the retail domain and `0 widened`, with
`learn=retail / test=airline`: a retail pack was served to airline questions on
every request.

**Why IBM's number still cannot be the target.** L.8 recorded the three-layer
answer: the mechanism travels, the number does not. R45 does not change it. IBM
`gpt-5.5` airline **82.0** is two unverified PRs with disclosed modified
prompts, a different agent model, a train split the base split includes, 20
airline tasks where one task is 5pp, and two different quantities (70.0
held-out, 82.0 full base) reported as one. Under this project's rules a SOTA
benchmark must run through `sota.yml`, report whether the treatment arrived,
and isolate contributions by ablation. R45 is the first run that can even
attempt the second condition; it still fails the resolution condition. IBM's
own airline reversal — 101 lossless rules at 40.0 against 14 `sup3` rules at
45.0, a −5pp cost for more memory — remains the published datum that supports
the negative-effect hypothesis, and it is a *mechanism* result, not a headline.

**What the artefact could not say, and the competitor literature explains.**
`+6.00pp` cannot distinguish an underpowered lane from an unrelated pack: the
arm record counts pack size and rewards but no injected statement. AECG
([arXiv:2610.05176](https://arxiv.org/abs/2610.05176)) names this "scope
collapse" and loses up to 16.89pp without scope preservation; MemAdapter
([arXiv:2610.05162](https://arxiv.org/abs/2610.05162)) says even correct
memories harm when their influence is not calibrated to the current context;
MemPABench ([arXiv:2610.30485](https://arxiv.org/abs/2610.30485)) finds Mem0 /
MemOS / simple RAG do not beat No Memory. Three independent implementations —
ALTK-Evolve's `support`/`sup3`, MemGuard's `distinct_task_ids >= 2`, and
IBM's 14-rule core — make corroboration across distinct source tasks the
selection variable. R46 ships the use-side census instrument (§17.90), not an
arm, so the next dispatch can measure the relevance of *real* injected
statements before any floor is registered.

**Ranking (unchanged).** IBM `gpt-5.5` airline **82.0** (unverified, modified
prompt, PR #551) is the current SOTA; SapientAI-Agent-Opus-5 72.0; IBM
`gpt-4.1 sup3` 44.0 (#8); stock `llm_agent` `gpt-oss-120b` 34.0; microglia
reference 40.0 (R44) / 42.0 (R43); microglia memory 52.0 (R44) / 38.0 (R43),
now with R45's `0.42` added — all memory-arm scores before R45 came from a
`0 served` condition and are not ranking claims. **microglia is fifth of six
named entries.** R45's served pack and non-significant `+6.00pp` move no rank.
The only column microglia leads is "whether the treatment was delivered", and
it now reads `1480 served` rather than `0`.

### L.10 — An observation round moves no rank, and the negative-effect sources are now use-side

**The final R45 line, checked.** Run `42131391874` finished `completed failure`
at 01:02:49Z with `Pair the arms` as the only failing step. The three blocking
gates are `V5-resolution` (18.59pp MDE), `V16-transfer-resolvable` (86
informative trials, 22 repairs) and `l4-paired` (`+6.00pp [-6, +20] p=0.5488
n=50`). The evidence artefact uploaded successfully. `ci.yml` on the same head
is green, and the later fixture-fix head `c2da0b55` is green under
`42149283405`. Nothing in the final log changes the L.9 reading.

**The next dispatch is not an entry.** `prereg/R46-use-census.md` registers an
`as-is` observation: no pack, rule, admission decision, scope, threshold, gate
or `packages/core` line changes, and the dispatch inputs are R45's verbatim
with only `prereg` renamed. It measures the relevance of *real* injected
statements, the half of the negative-effect hypothesis L.9 could only measure
on structural proxies. It claims no accuracy effect, so it produces no
leaderboard row and cannot move a rank. U3's coverage floor is computed from
that census after the run, never from R45's delta.

**Competitor and literature comparison, use-side column.**

| source | mechanism | what it says about negative effects | status here |
|---|---|---|---|
| IBM ALTK-Evolve (`AgentToolkit/altk-evolve`) | distilled rules appended to the system prompt; `support` = distinct source tasks, `sup3` core | 101 lossless rules 40.0 against 14 `sup3` rules 45.0: more memory costs 5pp | source read; selection contrast registered for R46 |
| MemGuard (arXiv:2608.21867) | activates at score / confidence / uncertainty bars, keeps unverified records provisional | requires `len(distinct_task_ids) >= 2` before summarising repeated experience | read; `>= 2` contrast registered separately |
| MemAdapter (arXiv:2610.05162) | calibrates memory influence to the current context | even objectively correct memories can harm | read; the use-side half of the hypothesis |
| AECG (arXiv:2610.05176) | scope preservation for retrieved experience | "scope collapse" loses up to 16.89pp | read; motivates U1 / U3 |
| MemPABench (arXiv:2610.30485) | benchmark over memory systems | Mem0 / MemOS / simple RAG do not beat No Memory | read; motivates the paired control |
| microglia `as-is` census | seven-field census at the recall facade | measures statement relevance before any floor | registered, not yet run |

**Ranking after this registration (unchanged).**

| rank | entry | headline | caveat |
|---|---|---|---|
| 1 | IBM `gpt-5.5` airline | **82.0** (current SOTA) | self-reported, modified prompt, PR #551, not independently verified |
| 2 | SapientAI-Agent-Opus-5 | 72.0 | different scaffold |
| 3 | IBM `gpt-4.1 sup3` | 44.0 (#8) | 14 corroborated rules beat 101 lossless ones by 5pp |
| 4 | stock `llm_agent` `gpt-oss-120b` | 34.0 | no memory |
| 5 | **microglia** | `0.42` memory / `0.36` reference (R45, k=4) | `+6.00pp` not significant at n=50; not a ranking claim |
| 6 | microglia reference arm | `0.36` | the control, not a competitor entry |

An observation round moves no rank. The column microglia leads remains
"whether the treatment was delivered": `1480 served`, first non-zero in five
rounds.

### L.11 — Five sources read while the as-is census ran, and one that measures the use side with numbers (2026-11-07)

**Why this reading.** R46's `as-is` census is measuring, for the first time,
what a served pack actually put in front of the model. The standing question is
whether the negative effect of memory comes from *what is remembered* or *how it
is used*. Five sources read on 2026-11-07 bear on that second half, and one of
them publishes the first benchmark that measures it with a number rather than a
claim. None is a tau-squared-bench entry, so none moves the ranking below.

**1. MemCalib ([arXiv:2609.24259](https://arxiv.org/abs/2609.24259), v3
2026-10-08, Alibaba Qwen / USTC / Fudan; code and data
[Quark-Medical/memcalib](https://github.com/Quark-Medical/memcalib), 995 files
read via the GitHub tree API).** Its premise is the standing hypothesis stated
as a measurable object: a memory system's effectiveness depends on whether the
LLM gives *each in-context memory an appropriate degree of influence*, and
post-retrieval filtering cannot guarantee a noise-free context. The benchmark
assigns every atomic proposition a target influence level — **A** (Ignore: no
answer-specific footprint), **B** (Bound: local support only), **C** (Control:
determines the core conclusion) — and grades the realized footprint against it.
The source is unambiguous about the unit: `judge.py`'s system prompt asks "how
much of the response would change if the atomic content were removed while the
current query stayed fixed", and grades *observable incorporation* rather than
inferred intent. `metrics.py`'s `sample_level_calibration_metrics` turns the
per-atom distance into `over_budget` and `under_budget`, with
`scs_rho_0_5 = 0.5 ** total_budget` and `exact = total_budget == 0`.

| quantity | reading | source |
|---|---|---|
| benchmark size | 13,500 train / 1,500 disjoint test, stratified | paper section 2.2 |
| judge-human agreement | 96.7% on 150 judgments (95% Wilson CI 92.4–98.6%, Cohen's kappa 0.872) | paper appendix C |
| best frontier model (GPT-5.6-SOL) | SCS 46.25 +/- 0.60, Exact 28.40 +/- 0.85, AOR 53.33 +/- 0.45, AUR 35.82 +/- 0.51 | Table 1 |
| Claude Sonnet 4.6 | AOR 65.40 +/- 0.77 | Table 1 |
| directional skew of GRPO / OPSD | improves one direction, deteriorates the other | abstract, Figure 1 |
| MemCalib-RL, Qwen3-8B | SCS 78.18 +/- 0.04 (sentence, ordered) vs 76.59 (absolute) | Table 3 |

Two findings matter here. First, even the best frontier model over-uses memory
on **53.33%** of atoms and under-uses on **35.82%** — incorrect *use*, on a
clean supplied context, is a majority behaviour, not an edge case. Second, the
Judge prompt's counterfactual ("what would change if this atom were removed")
is structurally the same instrument as this project's paired ledger and
ablation logic, but at the level of a single proposition and a single response.
`credit.py` implements the training half as eight ordered reward channels
(`A-`, `B+`, `B-`, `C+`, `C-`, `A0+`, `B0-`, `C0-`) with
`ORDERED_BIDIRECTIONAL_LOCALIZATION` and exact atom ablation, separating
over-use from under-use credit at response-token granularity. This is the most
complete published implementation of the use-side hypothesis.

**2. Controlled Memory Interference ([arXiv:2608.07622](https://arxiv.org/abs/2608.07622),
2026-08-07).** A controlled diagnostic for how memory states interfere as they
accumulate. Benign accumulation has limited effects, but *relationship-specific*
interference sharply suppresses update plasticity "either by blocking
target-memory exposure or by disrupting its **downstream use**" — the same
two-way split as delivery and use. Lexical and dense retrieval show **distinct
interference pathways**, and poisoning is more sensitive to update-authority
cues than to recency. The relevance is methodological: a lexical coverage
census and an embedding-based one can disagree about which memories interfere,
so §17.89's decision to reuse `queryCoverage` / `tokenize` rather than invent a
new similarity notion is a choice that now has an independent reason.

**3. CAMEL / The Trap of Trajectory ([arXiv:2605.09330](https://arxiv.org/abs/2605.09330),
2026-05-10).** Recovers a causal structure over observations and memory states,
then isolates three canonical spurious patterns — explicit confounding,
unmeasured confounding, collider bias — as variable pairs that are associated
but have no directed causal path. The diagnosis is the negative effect in one
sentence: memory *improves* reasoning on clean inputs but *amplifies reliance*
on spurious patterns when present. Two amplifiers are specific to memory:
**persistence** (a spurious cue written once is retrieved on every later turn)
and **feedback** (acting on it generates the next trajectory, which is written
back and reinforces the cue). CAMEL calibrates at both write time and retrieval
time. This is the causal version of this project's corroboration variable
(ALTK-Evolve `support` / `sup3`, MemGuard `distinct_task_ids >= 2`, IBM's
14-rule core): a single-task observation is exactly the object a spurious
correlation can hide in.

**4. The Memory Curse (7 LLMs x 4 social dilemma games x 500 rounds).**
Cooperation degrades in **18 of 28** model-game combinations as accessible
history grows. Lexical analysis of **378,000** reasoning traces ties the decay
to eroding forward-looking intent rather than paranoia; a memory-sanitization
control that holds prompt *length* fixed while replacing history with synthetic
cooperative records substantially restores cooperation, so the **content**, not
the length, is the operative trigger; ablating explicit chain-of-thought often
reduces the collapse. This is an independent replicate of the defect R45
exposed here: `V1-pack-not-empty` grades the *size* of a pack, and a lane that
reports only size cannot see that the content is what harmed.

**5. Personal-fact memory pathology ([arXiv:2610.10265](https://arxiv.org/abs/2610.10265),
2026-10-07, read in a secondary technical summary).** Moves the measurement
point to *before* generation and names three failure modes — staleness (70.3%
of prompts exposed a superseded value without update resolution),
misattribution, and latency — with a four-layer evaluation (storage-state
validity, identity resolution, abstention, serving latency). Its decisive
finding for this project: retrieval is not the bottleneck (participant-aware
BM25 is within 0.02 of the reference ranker); **key assignment** is, and two
frozen LLMs reproduce prompt-level errors verbatim into generated text. Dirty
data in front of the model is not washed clean by the model.

**What this changes, and what it does not.** It does not open an arm, change a
threshold, or add a gate; R46's `as-is` dispatch is pinned on `cb329054` and
the standing rule forbids a diff on a measuring head. It does strengthen the
registration of everything after the readback: U3's coverage floor should be
read as a *content* filter, not a size filter; the `>= 2` corroboration
contrast is a spurious-correlation control; and a future transcript-level
V46/V47 that grades influence per statement has a published rubric (A/B/C) and
a published counterfactual judge to borrow from. `TECH-DESIGN` §17.92 maps the
sources to the open items. No tau-squared-bench score is claimed from any of
them.

**Ranking (unchanged).** IBM `gpt-5.5` airline **82.0** remains the SOTA;
microglia **fifth of six named entries**. An observation round and five papers
move no leaderboard row.

### L.12 — R46 read back: the ranking holds, the delivery column gains a number it cannot grade, and a scalar is replaced by a histogram (2026-11-07)

**Why this section.** Run `42317807270` on `cb329054` completed `failure` on
three blocking scientific gates and `success` on both arms and on the evidence
upload. `ci.yml` on the same head is green. This is a resolution verdict, not a
build failure: `V5` reports an MDE of 13.73pp, `V16` reports 81 informative
trials, and `l4-paired` reads `0.00pp [-10, +10] p=1.0000` over 50 paired
tasks. Every validity gate R45 passed passes again. No tau-squared-bench score
is claimed from this round, and no leaderboard row moves.

**Ranking (unchanged).**

| entry | reading | status |
|---|---|---|
| IBM `gpt-5.5` airline | **82.0** | current SOTA; unverified, modified prompt, PR #551 |
| SapientAI | 72.0 | second named entry |
| IBM `gpt-4.1 sup3` | 44.0 (#8) | 14 lossless, distinct-task-supported rules |
| stock `gpt-oss-120b` | 34.0 | baseline |
| microglia | **fifth of six named entries** | unchanged this round |

The one column microglia leads is still *whether the treatment was delivered*:
R45 served 1,480 of 1,480 requests, R46 served 1,512 of 1,512. That column now
has a second number beside it. The R46 `use` census commits 3,016 injected
(question, statement) pairs, of which 1,175 — `zeroCoverageShare = 0.3896` —
share no content term with the question. Five of the six pre-registered
predictions held; the sixth, `zeroCoverageShare > 0.5`, is **falsified** on
real distilled statements against an offline proxy of 0.7588 cross-domain and
0.2077 within-domain. A falsified prediction is recorded as a reading, not
softened into a favourable one, and it is not an accuracy claim.

**What the competitors and the literature do and do not say.** None of the
use-side sources read in L.7 through L.11 is a tau-squared-bench entry, so none
enters the table above. Their value is that they make the same distinction this
round quantified. MemCalib grades per-atom influence (Ignore / Bound / Control)
and reports the best frontier model over-using memory on 53.33% of atoms and
under-using on 35.82% over 1,500 test examples, with a public judge and an
eight-channel credit assignment. The Memory Curse study holds prompt *length*
fixed and finds content is the trigger, which is the independent replicate of
R45's defect: a gate that grades pack size cannot see that content harmed. CMI
separates lexical and dense interference, which is why this project reuses its
own `queryCoverage` / `tokenize` rather than importing a new similarity notion.
CAMEL isolates persistence and feedback as memory-specific amplifiers of
spurious correlation; PFM locates the bottleneck before retrieval, in key
assignment. IBM ALTK-Evolve, MemGuard, MemAdapter, AECG and MemPABench remain
the corroboration and calibration references. None supplies a threshold that
can be copied into U3: the copied `sup3` floor of `>= 3` already selected zero
groups on the strictest reading of this 32-task corpus (§34.22).

**The instrument defect and its repair.** TECH-DESIGN §17.89 made a *committed
histogram* the P0 prerequisite for U3's floor; R46 committed only a scalar,
`zeroCoveragePairs`, because `armRecordFromDriver` discarded the pairs. A
real-kernel offline probe measured two populations with that identical scalar
whose retained fractions at `minCoverage = 0.05` differ by 12.44pp and whose
post-floor served population spans a 33.24pp interval. `coverageHistogram` now
commits a fixed `COVERAGE_FLOORS` retention curve with pack-level
`retainedPacks` / `emptiedPacks`, non-zero coverage quantiles and separately
reported content-free queries. The seven-field census is unchanged; the new
field is optional, so older artefacts read *not measured*; no gate reads it;
`packages/core`, `sota.yml`, the driver and the pairing logic are untouched.
TDD: 7 failing tests first, then green; 2,944 tests in 140 files, coverage
99.98 / 99.69 / 100 / 99.98.

**Still closed.** U1, U2, U3 and the R46 admission-rule arms are not opened. No
floor is chosen from `l4-paired`, from a proxy or from any competitor's number.
The next observation reads the histogram from a real dispatch, and U3's floor
is registered before its own dispatch. IBM `gpt-5.5` airline **82.0** remains
the SOTA; microglia stays **fifth of six named entries**. A reading, a
falsified prediction and an additive evidence field move no leaderboard row.

### L.13 — R47 registered: a measurement ladder, and no rung chosen (2026-11-07)

**Why this section.** Defect 25's repair is shipped and green on both
repositories (`microglia` master `d5497a8e`, `microglia-docs` main `fedc3c4b`;
`ci.yml` `42334137993`, all 40 steps `success`). `coverageHistogram` commits a
fixed ten-rung `COVERAGE_FLOORS` retention curve with pack-level
`retainedPacks` / `emptiedPacks`, non-zero coverage quantiles and separately
reported content-free queries. The seven-field census is unchanged and the new
field is optional, so R45, R46 and every older artefact read *not measured*.
No gate reads it; `packages/core`, `sota.yml`, the driver and the pairing
logic are untouched. TDD: 7 failing tests first, then green; 2,944 tests in
140 files, coverage 99.98 / 99.69 / 100 / 99.98.

**R47 is an observation, not an arm.** `prereg/R47-coverage-histogram.md`
keeps R45's and R46's verbatim dispatch inputs with only `prereg` renamed, so
the artefact is `poc-sota-bird-R47-coverage-histogram.json` and both earlier
files survive. Eight predictions are registered before the run: the histogram
on one arm and not the other; ten rungs with zero first; pair reconciliation
against `injectedPairs`; pack reconciliation against `recallServed` at every
rung; the zero rung as the identity; monotonic retention with at least one
positive rung emptying a pack; ordered quantiles; and every R45/R46 validity
gate passing again. Six refutations cover a missing or reference-side block,
any failed identity, a broken grid, R45's revert rule and gate regression, an
absent evidence artefact, and any floor chosen from an accuracy number or from
a post-run edit to a registration. **No floor is chosen** and the sign,
magnitude and significance of `l4-paired` are not predicted.

**Why no numeric share is predicted here.** R46 registered
`zeroCoverageShare > 0.5` from an offline structural proxy and read 0.3896 on
real distilled statements. That falsification is the reason R47 predicts only
identities plus one qualitative claim, rather than importing a number. The
published use-side benchmarks are read for method, not for a threshold:
MemCalib grades per-atom influence Ignore / Bound / Control and reports the
best frontier model over-using memory on 53.33% of atoms over 1,500 test
examples; the Memory Curse study holds prompt length fixed and finds content
is the trigger; CMI separates lexical and dense interference; CAMEL isolates
persistence and feedback amplifiers; PFM locates the bottleneck before
retrieval. IBM ALTK-Evolve, MemGuard, MemAdapter, AECG and MemPABench remain
the corroboration references. The copied `sup3` floor of `>= 3` already
selected zero groups on the strictest reading of this 32-task corpus
(§34.22); no competitor's threshold is imported as a microglia setting.

**Ranking (unchanged).** IBM `gpt-5.5` airline **82.0** (unverified, PR #551)
remains the SOTA; SapientAI 72.0; IBM `gpt-4.1 sup3` 44.0 (#8); stock
`gpt-oss-120b` 34.0; microglia **fifth of six named entries**. None of the
use-side sources is a tau-squared-bench entry, so none enters the ranking.
The one column microglia leads is still "whether the treatment was delivered",
`1512 served` on R46 with `3016` injected pairs of which `1175` share no
content term with the question. A shipped instrument, a green CI run and a
registered observation move no leaderboard row.

### L.14 The SOTA's own dose curve, and six benchmarks that measure use-side harm

**Ranking and the indicators contested.** The indicator is tau-squared-bench
Pass^4, the share of tasks solved in all four trials. IBM `gpt-5.5` airline
**82.0** is the current SOTA (leaderboard submission PR #551, filed 21 Sep
2026, 50 tasks, Pass^1 88.50 percent, cost 0.1690 USD per conversation,
modified prompts, expected to be listed as Unverified, still open). Its retail
submission (PR #542, filed 14 Sep 2026, 114 base-split tasks, Pass^1 81.14 to
Pass^4 67.54, 0.1084 USD per conversation, tau2-bench v1.0.1) ranks first in
retail ahead of the fine-tuned RAFT-30B-A3B at 61.4. The snapshot is dated 12
Oct 2026; frontier airline entries sit between 66 and 72. An important caveat
that IBM itself discloses: leaderboard submissions are scored on the full base
split that includes the training tasks from which the guidelines were learned,
so those figures are not interchangeable with held-out evidence.

| Rank | Entry | Indicator | Note |
|---|---|---|---|
| 1 | IBM ALTK-Evolve `gpt-5.5` (PR #551) | airline Pass^4 **82.0** | current SOTA, Unverified, modified prompt |
| 1 | IBM ALTK-Evolve `gpt-4.1` (PR #542) | retail Pass^4 67.5 | ahead of RAFT-30B-A3B 61.4 |
| 2 | SapientAI | 72.0 | named entry, prior snapshot |
| — | IBM `gpt-4.1 sup3` | airline 44.0 | eighth on the airline board |
| — | stock `gpt-oss-120b` | 34.0 | reference point |
| **5 / 6** | **microglia** | — | no certified Pass^4 claim; MDE 13.73pp |

**IBM's own ablation is the most important competitive reading.** Held-out
airline, `gpt-4.1`, 20 tasks, four trials: baseline 57.5 mean accuracy / 35.0
Pass^4; `sup3` (14 guidelines, support at least 3) 60.0 / **45.0**;
`lossless` (101 guidelines) 65.0 / **40.0**. Retail, 40 tasks: baseline 78.1 /
57.5, `sup3` (31) 78.8 / 60.0, `lossless` (292) 82.5 / 67.5. The same method
therefore has opposite optimal dose in two domains. With `gpt-5.5` in airline,
`sup2` (103) and `lossless` (146) lift Pass^4 from 55.0 to 70.0 and accuracy
from 72.5 to 82.5 on held-out tasks, with the lossless result reproduced
exactly across reruns. Cost rises with the dose: retail 0.084 to 0.139 USD per
conversation (+65 percent), airline 0.081 to 0.107 (+32 percent), while matched
successful conversations shorten by 0.3 to 0.4 assistant turns. The library is
`AgentToolkit/altk-evolve`; the benchmark is `sierra-research/tau2-bench`.

**Six benchmarks quantify the harm after retrieval.** None is a
tau-squared-bench Pass^4 entry, so none moves a leaderboard row; they explain
the use-side gap this project is measuring.

| Source | What it measures | Reported magnitude |
|---|---|---|
| MemSyco-Bench | errors after correct retrieval (R+/A-) | 61-62 percent across Mem0, A-Mem, LightMem |
| OP-Bench | over-personalisation vs memory-free BASE | 26.2-61.1 percent relative drops, 36 configurations |
| MemCalib | calibrated atom influence (Ignore/Bound/Control) | best SCS 46.25, Exact 28.40; MemCalib-RL lifts Qwen3-8B 31.17 to 79.54 |
| BenchPreS | preference misapplication | up to 86.48 percent; selectivity instruction cuts it to 12.80 at a 0.78-3.82 point cost |
| RPEval | Ignore intent matching | humans 0.86, models 0.06-0.38 (inverse scaling) |
| LongMemEval | sustained-interaction accuracy | about 30 percent drop |

Four implementation families are relevant to borrowing. **MemCalib-RL**
(`Quark-Medical/memcalib`, a `verl` fork) splits reward into eight channels for
target-versus-actual influence and localises credit by ordered bidirectional
counterfactual ablation; it needs training access and token-level likelihoods.
**RSCB-MC** (arXiv 2604.27283) is inference-shaped: risk-sensitive contextual
bandit, abstention as a first-class action, `gamma > alpha > beta`, 0.0 percent
false-positive injection where static retrieval reaches 75 percent on hard
negatives, and a 17.5 percent false-positive increase when abstention is
ablated. **FinAcumen** (arXiv 2606.17642) gates retrieved experience behind a
calibrated semantic-relevance threshold with an explicit fallback to the base
policy. **Remember When It Matters** (Meta AI, arXiv 2607.08716) frames
"behavioral state decay" and uses a separate memory agent that may stay silent;
its tau-squared-bench ablation reports full selective intervention 64.3 macro /
61.2 micro pass@1 against a 57.5 / 55.0 baseline, full-bank 61.5 / 58.6 and
always-inject 63.5 / 61.5, with no error bars and a 0.3 micro-point difference
the authors place inside run variance. That paper measures pass@1, not Pass^4,
so it cannot be placed in the table above; its "stay silent" result is a
qualitative corroboration of abstention, not a competing leaderboard number.

**Where microglia stands.** Fifth of six named entries, unchanged. The one
column it leads is still whether the treatment was delivered: `1512 served` on
R46. Its defensible differentiator is measurement rigour — paired confidence
intervals, MDE, a pre-registered refutation rule and a committed retention
curve — against competitor ablations that mostly report point estimates without
error bars. The offline proxy probe in `AUDIT.md` section 34.30 showed the
structure-only cost rule robust to cost ordering **on the proxy only**; R47's
committed curve falsified that and `AUDIT.md` section 34.31 records the
correction. A source study, a green CI run and an observation round move no
leaderboard row.

### L.15 — Four gating mechanisms, one alternative leaderboard, and the U3 dispatch (2026-11-07)

**Four mechanisms that decide whether retrieved memory is used at all.** All
four address the same failure the project measures — retrieval that is always
on injects material that is irrelevant to the current question — and none is a
tau-squared-bench Pass^4 entry.

| source | decision | threshold origin | reported effect |
|---|---|---|---|
| Self-RAG (Asai et al., 2024) | trained reflection tokens `[Retrieve]`, `[ISREL]`, `[ISSUP]`, `[ISUSE]` | learned during fine-tuning | critique and segment selection during generation |
| CRAG (Yan et al., 2024) | a retrieval evaluator grades each document Correct / Ambiguous / Incorrect | evaluator score with confidence bands (0.7 / 0.3 in a third-party reproduction) | that reproduction reports `context_precision +0.431` from scoring and filtering alone |
| TARG (arXiv 2511.09803) | training-free single-shot gate from prefix-logit entropy, top-1/top-2 margin or small-N variance | a fixed decision threshold on the uncertainty score | 70–90 percent fewer retrievals at matched EM/F1 on five QA benchmarks; states that retrieving for every query often hurts quality |
| Know Before You Fetch (arXiv 2606.29959, `github.com/dongzhe1/know-before-you-fetch`) | a logistic calibrator maps a closed-book draft's log-probability to `P(correct)`, then allocates a retrieval budget or abstains | thresholds selected on a validation split, test evaluated once | gating is not universally faster: about +27 percent latency on Qwen3-8B and about -8 percent on Qwen3-32B at matched-accuracy operating points |

The last row is the closest methodological relative of U3 and also the sharpest
contrast. Both treat use as a decision rather than a default, both make
abstention a first-class action, and both refuse to choose a threshold on the
test outcome. But they select thresholds on labelled validation accuracy,
whereas U3 selects its floor from a committed structural retention curve with
registered cost weights and no accuracy input at all. Its published caveat —
that a gate which helps one backbone can cost another — is the same
domain-dependence IBM's own airline ablation measured, and a reason not to
copy a numeric threshold from any of these papers into `COVERAGE_FLOORS`.
CRAG's evaluator is a learned or LLM-based grader; U3's `queryCoverage` is the
same deterministic kernel `buildPack` already uses, so the treatment needs no
additional model call. The CRAG figure above is a third-party reproduction,
not a number from the original paper, and is recorded as such.

**An alternative leaderboard reading, with a different ruler.** SOTA2 Research
publishes a τ²-bench airline full 50-task pool table dated 2026-06 that reports
Pass@4 78 for PG-CHECKLIST (Sonnet 4.6 with a verifier), 74 for PG-RAW, 72 for
a Sonnet 4.6 baseline and 58 for TOOLGUARD. It also lists `PV (24)` and
`Mut (26)` columns, so its pool and pass criterion are not the official
leaderboard's base split. Even read at face value, 78 is below IBM's 82.0, so
it does not displace the SOTA; it is recorded as a competitor approach
(process checklists and verifiers) rather than merged into the ranking table,
because mixing rulers is exactly the defect section 34.25 was written about.

**Current ranking (unchanged).** IBM `gpt-5.5` airline **82.0** Pass^4
(unverified, PR #551, modified prompt) remains the SOTA; SapientAI 72.0; IBM
`gpt-4.1 sup3` 44.0 (#8); stock `gpt-oss-120b` 34.0; microglia **fifth of six
named entries**. The one column microglia leads is still whether the treatment
was delivered. U3 (run `42350304597`, dispatched on `33038232`) is the first
arm that changes what is delivered; its step 11 read the registered floor
successfully. A dispatch in progress moves no row.

### L.16 — Five sources on the dose of memory, and a retry that moved no row

While U3's retry (`42353229972`) measures, five first-party or primary sources
were read on the standing hypothesis that the harm comes from **what is
remembered and how it is used**, not from retrieval failing. All are recorded
with their own ruler; none is merged into the tau-squared-bench Pass^4 table.

**1. The Memory Funnel (membox, `core/consolidate.py`).** Memory has a
three-tier lifecycle Trace -> Unit -> Crystal. `crystal_policy()` promotes a
Unit only when it is corroborated by **at least three independent sources**
(or an explicit user confirmation, or confidence >= 0.90 with importance >=
0.80). Confidence rises per corroborating source and is capped at 0.95. The
stated engineering reason is that LLMs hallucinate during extraction and a
single error must not permanently warp the agent's worldview. This is the
closest structural analogue yet read to R46's planned `distinct-task-support`
and `min-support-only` comparators and the separately registered `>= 2`
corroboration contrast. The value 3 is that project's choice, not a transferable
constant; importing it would repeat the ruler defect of section 34.25.

**2. Human-Inspired Memory Architecture (2605.08538).** On VSCode with a
temporal streaming protocol, deduplication-based consolidation reaches
**97.2 percent retention precision with a 58 percent store reduction** versus
75.4 percent for keeping everything, and the store self-regulates at 300 to
500 events. On LongMemEval S-tier, nine configurations with bootstrapped 95
percent CIs were compared: all five moderate configurations overlap the
raw-RAG baseline CI `[74.8, 82.0]` (non-destructive), while adaptive-10K
collapses to **57.0** and aggressive clustering-with-merge to **48.4**. The
design claim is "consolidation should deduplicate, not summarize": merging
turns into cluster summaries destroys the specific details factual questions
need. Two methodological points transfer directly. First, **threshold leakage
is eliminated**: near-dedup 0.559, cluster distance 0.404 and interference
0.542 come from percentile rules over eight synthetic personal-chat sessions
embedded with the evaluation model, and importance weights come from fifty
LLM-generated sessions; no benchmark data touches calibration. That is the
same discipline as choosing `0.01` from a committed histogram and never from
accuracy. Second, the paper **discloses that its deployed scoring formula
differs from its biological specification**: content length (ROC AUC 0.77,
weight 0.363) and turn position (0.325) dominate, recency is nearly
uninformative (AUC 0.51, weight 0.019), and frequency and outcome were
dropped. It also notes that adding timestamps and the current date to prompts
contributes about +10 points, a cheap intervention independent of the memory
architecture. Retention precision is a proxy with no downstream QA task, so
these numbers are not comparable to Pass^4.

**3. Dual-trace encoding (2604.12948).** Before encoding, an evidence-scoring
gate rates relevance, specificity and explicitness from 0 to 2 each, stores
only sessions scoring at least 3 of 6 (about **55 percent**), and discards
chit-chat. Retrieval has three states; state C, when no trace is found,
**explicitly declines to answer**, which the paper ties to user trust and
hallucination avoidance. On LongMemEval-S (over 4,500 sessions, 100 questions)
the dual trace reaches **73.7** overall accuracy versus **53.5** for the
facts-only control (+20.2 points, p < 0.0001), with temporal reasoning
improving +40 points (65 versus 25). State C is the same first-class
abstention that RSCB-MC prices with `gamma > alpha > beta` and that U3
registers as an `emptiedPacks` cost of 414 packs (27.77 percent).

**4. Driving-agent memory audit (Jia and Li, 2026-10-20).** Past driving
episodes were consolidated into a rulebook and compared with retrieval
memories and token-matched filler. The rulebook's lead **vanished on fresh
warmup pools and once caution was priced in**, and one **15-token caution
instruction matched the best merge**. Together with the Memory Funnel's
three-source bar and Human-Inspired's aggressive-configuration collapse, this
is the strongest read-so-far external support for the hypothesis that less,
better-corroborated and more cautiously used memory can beat more memory. It
runs in the same direction as IBM's own held-out airline dose reversal, where
the compact `sup3` core of 14 guidelines beats the 101-rule lossless set on
Pass^4 (45.0 versus 40.0) while the larger set wins mean accuracy.

**5. IBM ALTK-Evolve leaderboard filings, re-checked.** Retail 67.5 Pass^4
(PR #542, filed 14 Sep 2026, Pass^1 81.14 over 114 base-split tasks at four
trials, USD 0.1084 per conversation) ranks first ahead of RAFT-30B-A3B 61.4.
Airline `gpt-5.5` 82.0 (PR #551, filed 21 Sep 2026, Pass^1 88.50 over 50
tasks, USD 0.1690 per conversation) ranks first above frontier entries at
66 to 72; `gpt-4.1 sup3` 44.0 is eighth. Both disclose modified prompts,
expect Unverified status and remain open. The guideline cost is on prompt
input tokens, trims about 0.3 to 0.4 assistant turns, and is largely
reclaimable with prompt caching. The held-out ablation figures already
registered in L.14 are not changed by this re-check.

**The retry.** U3's first run `42350304597` failed on a DeepSeek 500 with zero
`arms/` entries in its evidence zip; the retry `42353229972` is on the same
head and prereg. A failed run, a lawful retry, a green CI and five source
studies move no leaderboard row.

**Current ranking (unchanged).** IBM `gpt-5.5` airline **82.0** Pass^4
(unverified, PR #551, modified prompt) remains the SOTA; SapientAI 72.0; IBM
`gpt-4.1 sup3` 44.0 (#8); stock `gpt-oss-120b` 34.0; microglia **fifth of six
named entries**. The one column microglia leads is still whether the treatment
was delivered, and U3 remains unassessed until a valid pair is read back.

### L.17 — MemCalib's six metrics and the Memory Funnel's consolidation code

Two first-party sources were read while U3's retry measures. Both quantify a
use-side harm, and neither is a tau-squared-bench Pass^4 entry, so neither is
merged into the ranking table.

**MemCalib (arxiv 2609.24259; `Quark-Medical/MemCalib`).** The benchmark asks
whether an agent gives each memory atom its ideal degree of influence, on a
three-level scale `Ignore (0) / Bound (1) / Control (2)`. For response `j` the
paper defines over-use `O_j` and under-use `U_j` as the sums by which actual
levels exceed or fall short of ideal levels, then six metrics with `rho = 0.5`:
`sMOS`, `sMUS`, `AOR`, `AUR`, `SCS = mean(rho^(O_j + U_j))` and
`Exact = mean(1[O_j + U_j == 0])`. The corpus is 15,000 examples from eight
public QA datasets (13,500 train, 1,500 held-out test); the judge is
DeepSeek-V4-Pro over three seeds in non-thinking mode with temperature and
top-p at 1, and agrees with a human annotator on 96.7 percent of 150 sampled
judgments (95 percent Wilson CI 92.4 to 98.6). Three findings matter here.
All models except Qwen3-8B over-use more than they under-use; Qwen3-8B shows
the reverse and beats the larger Qwen3.5-35B-A3B on both SCS and Exact, so
the skew is model-dependent rather than universal. The paper states that
strength in one direction cannot compensate for substantial errors in the
other. GRPO and GDPO improve one direction while deteriorating the other,
while MemCalib-RL's ordered bidirectional counterfactual credit assignment
with nine channels, token granularity and exact atom ablation balances both.
For U3 this is independent support for an asymmetric cost with
`gamma > alpha > beta`, for registering the weights with no default, and for
pricing abstention as a first-class action. MemCalib's symmetric `rho` decay
is not U3's cost and its thresholds are not portable into `COVERAGE_FLOORS`.

**The Memory Funnel (membox, `core/consolidate.py`).** The lifecycle
`Trace -> Unit -> Crystal` requires at least three independent sources (or an
explicit user confirmation, or confidence >= 0.90 with importance >= 0.80)
before `crystal_policy()` promotes a Unit. Confidence grows per corroborating
source and is capped at 0.95; importance tracks usage. Supersession marks an
older unit `SUPERSEDED` with a `superseded_by` pointer instead of deleting it,
BFS retrieval skips superseded relations, and the retrieval score is
`decay^hops(t) * (alpha * sim(t) + (1 - alpha) * bm25(t))`. The stated reason
for the three-source bar is that a single LLM extraction error must not
permanently warp the agent's worldview. Its confidence/importance split is the
cleanest read-so-far analogue of R46's `distinct-task-support` versus
`min-support-only` comparators, and it runs in the same direction as IBM's
held-out airline dose reversal (14 guidelines beating 101 on Pass^4) and the
driving-agent audit's 15-token caution equivalence recorded in L.16. The
threshold 3 belongs to that project's corpus and is not imported.

**Current ranking (unchanged).** IBM `gpt-5.5` airline **82.0** Pass^4
(unverified, PR #551, modified prompt) remains the SOTA; SapientAI 72.0; IBM
`gpt-4.1 sup3` 44.0 (#8); stock `gpt-oss-120b` 34.0; microglia **fifth of six
named entries**, leading only whether the treatment was delivered. U3 remains
unassessed: run `42350304597` measured nothing, and retry `42353229972` is
still on step 12. Two source readings and a self-tested verifier move no row.


### L.18 — A measured arm that reverts, and a leaderboard that does not move

Run `42353229972` is the first real U3 measurement. Its outcome is a reverted
arm, not a new row. The within-run `l4-paired` gate reads `-6.00pp [-16, +4]
p=0.4531` with 965 served packs, so the R45 rule's second branch (below -5pp
with a served pack, no significance required) fires and the applied floor
`0.01` is reverted to the as-is default (AUDIT 34.35). The reverted treatment
delivered exactly the structural change it was designed to deliver —
`zeroCoveragePairs` 750 -> 0, `recallServed` 1491 -> 965, `meanPackIds` 1.4675
-> 1.0893 — so this is a measured use-side intervention, not an offline proxy.
It is also an underpowered and confounded one: the memory-free reference arm
drifted from `0.30` to `0.44` between the two dispatches, the learning phase
distilled 8 items in one and 12 in the other, and the MDE is 14.83pp. No
accuracy claim is made in either direction.

That drift is itself a quantified result against the field. MemCalib's over-use
and under-use split (L.17) and the Memory Funnel's corroboration threshold are
about what a memory admits and how it is used; here the *learning phase itself*
changed the remembered set between two runs of an identical configuration.
Together with FinAcumen's calibrated threshold and explicit fallback, and the
four gating mechanisms of L.15, the evidence says that a single dispatch's
`pass^4` delta is not a stable ruler for a use-side intervention. The IBM
ALTK-Evolve SOTA's own held-out airline ablation (L.14) already showed a
non-monotonic dose — 14 rules `Pass^4 45.0` against 101 rules `40.0` — so a
dose dial that is not paired within a run can flatter or condemn any entry.
The methodological answer is not a number borrowed from any of these papers:
their thresholds come from other benchmarks and are not portable into
`COVERAGE_FLOORS`. It is a within-run pair that holds one store and one
reference fixed.

Ranking is unchanged. The current SOTA is IBM `gpt-5.5` airline `82.0`
(unverified, PR #551, modified prompt), then SapientAI `72.0`, IBM `gpt-4.1
sup3` `44.0` and stock `gpt-oss-120b` `34.0`; microglia is **fifth of six
named entries**, leading only whether the treatment was delivered. SOTA2's
PG-CHECKLIST `78` stays registered but unmerged because it uses a different
task pool and pass definition. A measured, reverted arm, two corrected
instruments and a green CI run move no leaderboard row.


### L.19 — Why the leader's implementation is not copied, and what is copied instead (2026-11-07)

**The question.** A reader asked why, once the leading competitor is known, the
project does not reproduce its code, then learn from the other competitors and
overtake it. The short answer is that the project already does the second half,
and the first half is not an object that can be reproduced. L.8 recorded the
argument in three layers on 2026-11-06; this section records the decision taken
after the R48 revert.

**Decision.** The *minimal attributable reproduction* registered at the end of
L.8 (one `sota.yml` arm, one agent, one prompt, one split, one model, only the
guideline set varied, declared a cross-model control and never a SOTA claim)
stays **registered and not dispatched**. The next dispatch is the within-run
pair. Opening the control arm now would spend a second learning phase and a
second store beside the pair we are trying to measure, which is precisely the
confound `AUDIT` 34.35 calls defect 29. The control remains available once a
valid paired readout exists.

| layer | object | status |
| --- | --- | --- |
| mechanism | `support`, `min_support`, the `sup3` reliable core, consolidation preserving support and provenance, one shared `_support` decision point | read at source and transferred (L.6, L.8) |
| number | airline `82.0` Pass^4 | not a replicable object; six reasons below |
| acceptance rule | prereg, paired per-episode ledger, `V1-pack-not-empty`, `sota.yml`, `ci.yml` green, both repositories pushed as Lambertyan | forbids treating a leaderboard row as a target |

**Why 82.0 is not a build target** (L.8, unchanged by R48): (1) two unverified
pull requests, #542 and #551, with no independent reproduction; (2) disclosed
modified prompts, so the treatment is learned rules *plus* prompt engineering
with no separating ablation; (3) `gpt-5.5` as the agent against this lane's
stock `llm_agent` on `deepseek-chat` at 40-46, so the gap is dominated by model
capability; (4) retail guidelines learned from a train split the base split
includes, while the airline submission has no train split; (5) 20 held-out
airline tasks, where one task is five points of Pass^4, against this lane's
measured MDE of 19.41pp at n=50; (6) two different quantities, 70.0 held-out
and 82.0 full base, reported as one headline.

**What has already been transferred from competitors** (mechanisms, not
thresholds or vendored code):

1. ALTK-Evolve's support-as-distinct-source-tasks and its `sup3` reliable core;
   R46 is registered to ablate the *rule*, not to import the threshold.
2. AECG's `scope collapse` (up to 16.89pp lost without scope preservation) and
   `memory pollution`, which motivate U1 and U2.
3. Tether's read-time withdrawal of dependent verdicts, which motivates the
   provenance condition on a served pack.
4. MemPABench's finding that Mem0, MemOS and a plain RAG baseline do not beat
   No Memory, the field-level statement of this project's thesis.
5. AMV-Guard's action-relative re-verification, which is why the use side and
   not the store is the treatment.
6. MemAdapter's calibration of a correct memory's influence to the current
   context.
7. MemCalib's separate over-use `O` and under-use `U` with
   `SCS = mean(rho^(O+U))`, mapped onto `zeroCoveragePairs` and `emptiedPacks`;
   its model-dependent skew is why U3's cost weights have no default.
8. The Memory Funnel's split between confidence (independent corroboration,
   capped at 0.95) and importance (usage frequency), which gives R46's
   `distinct-task-support` and `min-support-only` comparators their meaning.
9. Self-RAG, CRAG, TARG and Know Before You Fetch on abstention and retrieval
   necessity, registered as ancestors of the asymmetric abstention cost.
10. `yuplin2333/agent_memory_manage`: deletion driven by the *observed
    consequence of using* a memory (`deletion_retrieval_n_times` plus mean
    downstream L2 error), the feedback loop this lane does not yet have.
11. `xiaoqi-7/memory-rollback`: reachability separated from
    `support_checker.py` with an explicit exclusion set of evidentiary edges.
12. `agiresearch/A-mem` and `Quark-Medical/memcalib` (a `verl` fork) as first-
    party source reads on evolution thresholds and calibration.

**Why copying a numeric threshold was already refuted.** `AUDIT` 34.22 and
`TECH-DESIGN` 17.88 measured that a copied `sup3 >= 3` floor selects **zero
groups** on this lane's 32-task retail corpus under strict normalisation. A
number that selects nothing is not a starting point for an overtake. Likewise
AECG's advertised code at `github.com/fenhg297/AECG` returned HTTP 404 on
2026-11-06; the gap is recorded rather than filled with an invented
implementation.

**What the SOTA holder's own report contributes.** Its airline table is the
published negative effect this project exists to explain: 101 lossless rules
score 40.0 Pass^4 while 14 `sup3` rules score 45.0, a -5pp cost for more
memory, with input-token cost up 32 percent. That is a mechanism result, not a
headline, and it is the datum worth reproducing. Reproducing 82.0 would move
model, prompt and split together and could not answer "did memory help".

**Ranking, unchanged.** IBM `gpt-5.5` airline **82.0** (unverified, modified
prompt, PR #551) remains the SOTA; SapientAI 72.0; IBM `gpt-4.1 sup3` 44.0;
stock `gpt-oss-120b` 34.0; microglia **fifth of six named entries**. No
competitor discussion in this section produces a benchmark result and no row
moves.


### L.20 — Causal memory selection, cognitive traps, and what the source code actually says (2026-11-07)

The standing hypothesis is that what is remembered and how it is used cause
the negative effect. Four independent sources read this iteration support the
"how it is used" half directly, and one of them ships source code we read.

**CMI / Causal-LoCoMo** (Saksham Sahai Srivastava, arXiv 2605.17641, May 2026;
`github.com/Saksham4796/causal-memory-intervention`, 258 files, master). Its
`src/agents/cmi_agent.py` does not ask whether a memory is similar to the
query. For each retrieved candidate it runs three controlled interventions and
computes `utility = s_with - s_no` and `stability = s_with - s_perturbed`,
where `s_no` is the no-memory answer, `s_with` the single-memory answer and
`s_perturbed` the answer under a perturbed memory. A memory is selected only
when both clear their thresholds. `src/memory/perturb_memory.py` defines five
perturbation types — negation, scope shift, temporal shift, entity swap,
poison injection — and `src/memory/retrievers.py` supplies random, recency,
keyword, embedding and hybrid retrievers as baselines. On 87 filtered examples
the paper reports task score 0.846, useful-memory F1 0.875, harmful-memory
rejection 0.990 and zero poisoned-memory adoption, against vector, graph,
reflection, summary, full-history and no-memory baselines.

This is methodologically close to R49 and worth stating precisely. CMI's
`no_memory` condition is WITHIN one example, exactly as R49's two facades are
WITHIN one dispatch. CMI grades a single memory's marginal utility; R49 grades
one floor's net contribution over a paired task set. CMI scores with a task
scorer or an optional oracle variant; R49 uses the benchmark's gold-verified
reward, so no LLM judge enters the measurement. CMI's referee critique notes
that its central claim rests on a fixed bank of synthetic harmful memories and
87 examples, which is a resolution limit, not a refutation. We therefore
transfer the intervention structure, not the 0.990 number.

**MemTrapBench** (first version 2026-08-20) reports 1,050 multi-step dialogues
in which five ways of presenting past interactions lowered the average score
against the no-memory response across two model families. Its four categories
— cognitive bias 350, task boundary 350, safety 200, avoidance after negative
feedback 150 — make the sharpest published statement of the hypothesis: a
retrieved memory can be TRUE and semantically close yet harmful because it is
applied beyond its original boundary. That is a use-side failure, not a
retrieval failure, and it is exactly what `minCoverage`, scope attestation and
the served-pack census are designed to expose.

**MemoryAgentBench** (Hu, Wang, McAuley, July 2025) reports the same shape
from the consolidation side: on single-hop FactConsolidation, plain GPT-4o
with long context scored 60.0 against MemGPT 28.0, Mem0 18.0 and MIRIX 14.0;
on multi-hop every system scored 7 percent or below. **HaluMem** (Chen et al.,
November 2025) reports 15 to 30 percent hallucination and 17 to 35 percent
omission across extraction, update and answering, and a fall in Mem0
extraction recall from 42.91 to 3.23 percent as history grew from roughly
1,500 to 2,600 turns. **LongMemEval** (ICLR 2025) reports a roughly 30 percent
accuracy drop over sustained interactions and treats abstention as a
capability. An independent April 2026 audit of LoCoMo found 6.4 percent of its
answer key wrong and its LLM judge accepting 63 percent of deliberately wrong
answers — a direct corroboration of this project's rule that a leaderboard row
is not an engineering blueprint.

None of these sources changes the ranking, and none is imported as a
threshold. Together they strengthen the decision to measure the use side with
paired, gold-verified outcomes rather than retrieving more or trusting a
self-reported score. The registered cross-model control of L.8 stays
registered and not dispatched.

Current SOTA table, unchanged this iteration:

| Rank | Entry | Pass^4 | Status |
| --- | --- | --- | --- |
| 1 | IBM `gpt-5.5` airline | 82.0 | unverified, PR #551, modified prompt |
| 2 | SapientAI | 72.0 | reported |
| 3 | IBM `gpt-4.1 sup3` | 44.0 | reported |
| 4 | stock `gpt-oss-120b` | 34.0 | same harness reference |
| 5 | microglia (six named entries) | — | no new Pass^4 claimed; leading column: treatment delivered |
| 6 | — | — | — |

SOTA2 PG-CHECKLIST 78 is registered but not merged into this table.


### L.21 — What the literature actually measured about why memory hurts (2026-11-07)

The standing hypothesis is that the negative effect comes from *what* is stored
and *how* it is used, not from the presence of memory. The published record now
quantifies both halves, and every number below is a measured effect under a
controlled setting, not an argument.

#### The use side: serving more costs accuracy even when the content is correct

| Source | Setting | Measured effect |
| --- | --- | --- |
| Chroma, *Context Rot* (July 2025), 18 models | the same question answered against a ~300-token focused prompt versus the full ~113,000-token session | every model family did better on the focused prompt; the gap ranges 15-35pp and is widest for Claude Opus 4 / Sonnet 4 at 30-35pp, mostly expressed as **abstention** rather than a wrong answer |
| same | needle-in-haystack with semantic rather than lexical needles | accuracy falls as input grows once the needle and the question stop sharing vocabulary; a purely lexical needle test certifies a length that is not usable |
| same | 1 distractor versus 4 | one distractor measurably hurts, four compound it, and which distractor hurts most is interaction-specific rather than monotone in count |
| same | coherent versus shuffled haystack, identical content | coherent haystacks are **worse** for every one of the 18 models: plausible adjacent text competes for attention |
| Liu et al. 2023 (*Lost in the Middle*) | position sweep at fixed length | U-shaped recall: evidence at the edges survives, evidence in the middle does not |
| NoLiMa / RULER | effective context length | 10 of 12 models claiming 128K fall below half their short-context score by 32K; the advertised window is not the usable window |

Three consequences for this project, in order of how cheaply they can be tested:

1. The `abstained` term in the U3 cost function is not a modelling convenience.
   Abstention is the response the strongest models were measured to give under
   noise, so a `pass^4` that moves without a matching abstention count is not
   explained by that mechanism and must not be attributed to it. The pair
   artefact should carry per-task abstention before the next floor arm is
   registered.
2. Pack **size** is a lever independent of pack **content**. The floor bounds
   coverage from below and nothing bounds it from above, so a registered
   size ceiling is a single-variable arm on the same within-run machinery.
3. Pack **order** is a lever independent of both. If edges survive and the
   middle does not, the highest-support statements belong at the edges, and
   that is a one-line change in the renderer with a paired readout.

#### The write side: consolidation itself is the damage

| Source | Setting | Measured effect |
| --- | --- | --- |
| *Useful memories become faulty when continuously updated by LLMs* (arXiv 2605.12978) | 15-task ScienceWorld switch stream | cumulative consolidation ends **203 points behind** per-task fresh distillation; over-generalized entries accumulate at ~5x and garbage at ~20x the fresh rate, both widening monotonically across the 15 tasks |
| same | ALFWorld, WebShop, ARC-AGI stream | an agent becomes worse on the very problems its memory was built from; removing a single consolidated workflow (W8) *raises* the WebShop pass rate |
| MemForm / MFP | 1,016 paired clean-and-poisoned cases, 6 LLMs, LangChain and LlamaIndex | macro-average attack success 35.2-84.0% on multiple choice across five formation interfaces; **path poisoning** -- reordering an identical multiset of experiences -- flips behaviour on 30-55% of queries |
| same | defences | A-MemGuard cuts path poisoning 56.8% to 21.4% but *raises* selection poisoning in some tests: one defence per interface, not one defence for memory |
| OEP (arXiv 2605.18930) | clean, locally-correct edge cases with plausible consequence framing | attack success above 50% on GPT-4o agents, exploiting the experience-following inductive bias; a more capable agent can be more vulnerable |

The first row is the strongest external evidence for the standing hypothesis,
and it is an ablation, which is why it matters more than a survey: the same
agent, the same tasks, the same store format, only the consolidation policy
changed, and the difference is 203 points. The third row is the same claim from
the adversarial side: authentic, individually successful experiences are not
sufficient for a useful memory, because order and scope of consolidation decide
what the agent will do next.

The W8 result also confirms an item this project already carries as pending
work: a single memory entry can be net-negative, so a dose curve over entries is
the right instrument, and deleting one entry is a legitimate intervention.

#### What is not taken from any of this

No threshold, no hyperparameter and no architecture is imported. What is taken
is a set of *mechanisms with published effect sizes*, each of which becomes one
registered single-variable arm on the paired machinery this project already has:

| Arm | Single varied variable | Predicted readout | Status |
| --- | --- | --- | --- |
| U3 floor | `buildPack.minCoverage` | already registered, R49 | dispatched |
| U4 order | render order of the pack at fixed content | shifts `pass^4` without changing served size | registered, not dispatched |
| U5 ceiling | `buildPack.maxItems` at fixed coverage | tests the size effect independently of relevance | registered, not dispatched |
| U6 consolidation | fresh-per-task versus cumulative store | reproduces or refutes the 203-point result in this lane | registered, not dispatched |
| W8 dose | presence of one entry | passes the 2605.12978 surgery test | pending, now with external precedent |

Every one of them is graded by paired, gold-verified outcomes and reported with
its interval, p-value and delivered population. None of them is graded by a
similarity score, a proxy, or a leaderboard row.

### L.22 — Mem0's write path is bounded consolidation, and that changes what U6 must test (2026-11-07)

The arms in L.21 assume one thing about consolidation that the most widely
deployed memory layer does the other way. Mem0's update phase does not rewrite
the store; it compares each extracted candidate against the **top-s most similar
existing memories** (reported s = 10) and asks the model to choose one of four
operations — `ADD`, `UPDATE`, `DELETE`, `NOOP` — where `NOOP` is the answer for
a redundant fact. Consolidation is therefore local, explicit and mostly a
refusal to write.

That is a different intervention from "re-consolidate the store across tasks",
which is how U6 is currently specified. If U6 comes back negative, the honest
reading is not "consolidation hurts" but "a global rewrite of an accumulated
store hurts", and the bounded variant Mem0 ships would still be untested here.
The registration is therefore refined rather than dispatched:

| Arm | Single varied variable | Why this is the one to test |
| --- | --- | --- |
| U6a global | per-task fresh store vs one store re-consolidated across tasks | reproduces or refutes the 203-point fifteen-task result in this lane |
| U6b bounded | per-task fresh store vs one store edited only against its ten nearest neighbours, with `NOOP` available | the mechanism the leading memory layer actually ships |

Two other published quantities belong in the record, with their grades, because
they bound how much of the negative effect a pack-level intervention can even
reach:

| Claim | Source grade | What it licenses here |
| --- | --- | --- |
| Mem0 (J = 66.9 %) and Mem0-graph (68.4 %) against a full-context baseline and OpenAI's memory (52.9 %) on LoCoMo, 6,956 retrieved tokens per call against 25,000+ for full context | **high** — the paper's own table (arXiv 2504.19413) | structured, small, op-maintained memory outperforms large context on a conversational benchmark; the mechanism is write-time, not read-time |
| "Lost in the Middle": at 32K prompt tokens a model ignores roughly 70 % of the information placed in the middle | **medium** — the finding is well replicated, the exact fraction is one reading of one figure | pack ORDER is a real variable at long context; at our pack size (8–12 items) it is a hypothesis, not a result, which is why U4 stays registered rather than assumed |
| A passive context buffer loses 30–50 % on temporal tasks | **low** — vendor summary of a survey, primary table not opened | a direction, not a number; nothing is registered from it |

Nothing here changes a threshold. What it changes is the shape of U6: two arms,
not one, and the negative result — if it comes — is attributed to *global*
rewriting specifically. The scale caveat is stated rather than smoothed over:
LoCoMo conversations run to tens of thousands of tokens and our packs do not, so
the margin by which Mem0 beats full context is not a margin this lane can
reproduce. What transfers is the mechanism, and mechanisms are what the arms
test.

### L.23 — Every serious memory layer decides at write time; they differ on what they do with the superseded fact (2026-11-07)

The four systems worth comparing have converged on one thing this repository did
not do until now: **the decision happens before the write.** Mem0 compares a
candidate against the top-S most similar memories and asks a model for one of
`ADD` / `UPDATE` / `DELETE` / `NOOP`; LangMem runs an asynchronous manager that
extracts, deduplicates and updates after the turn; Graphiti extracts entities and
relations on every ingestion and stamps bi-temporal validity; Letta lets the agent
rewrite its own memory blocks by tool call. A store that only appends and filters
at read time is the odd one out, and microglia was that store.

What separates them is the second question, and it is the one that decides whether
a memory can be audited: **what happens to the fact that lost.**

| System | Write decision | Superseded fact | Read path | Grade |
| --- | --- | --- | --- | --- |
| Mem0 | top-S neighbours + LLM, AUDN | **deleted** (overwritten) | vector + optional graph | high — the paper and the shipped code agree (arXiv 2504.19413) |
| Graphiti / Zep | entity + relation extraction, contradiction detection | **invalidated** with `invalid_at`, still queryable | hybrid graph + BM25 + vector, no LLM at query time | high for the mechanism, medium for its margins (see below) |
| LangMem | background manager: extract, dedupe, update | updated in place, no temporal axis | store-agnostic semantic search | medium — primitives rather than a published mechanism |
| Letta (MemGPT) | the agent edits its own blocks | rewritten by the agent | in-context blocks + archival search | high for the design, not a consolidation claim |

Three conclusions that bear on U6 and on what this project should not copy:

1. **Deletion is the wrong default and it is a product decision, not a technical
   one.** Mem0's `DELETE` is defensible for a personalisation assistant and
   indefensible for anything a reviewer has to sign: after the overwrite there is
   no record of what the system believed last month. This repository already has
   the alternative built — `validUntil`, `systemUntil`, `recordContradiction`, and
   a retirement that keeps the item and its reason — so adopting write-time
   admission costs it nothing in auditability, and it is why `delete` is the one
   operation the implementation refuses to have.
2. **The read path is where the cost went, not where the intelligence is.**
   Graphiti's marketing point is that retrieval needs no LLM call; Mem0's is that
   retrieved context stays near 7K tokens against 25K+ for full context. Both are
   statements about *what was written*, not about what was retrieved. A pack that
   carries two paraphrases of one rule violates the second claim while looking
   perfectly healthy on any per-item metric.
3. **The security boundary is the write path.** Once content the agent read today
   becomes trusted context tomorrow, a poisoning write is permanent. A decision
   that requires an observation to *change* something before it is stored, and
   that counts what it refused, narrows that surface — not to zero (a first-time
   write of a hostile claim is still a write), but it removes the path where a
   rephrasing of an existing rule is laundered in as new corroboration.

Two numbers in the table are used with care, and the reason belongs in the record.
Mem0 and Zep have published benchmarks of each other on LoCoMo and LongMemEval,
and both disputes turned on configuration rather than on architecture: Zep's
rebuttal argued Mem0 misconfigured it, and both sides have since published better
numbers for themselves on setups they chose. Nothing here is registered from
either vendor's margin. What transfers is the mechanism — decide before writing,
keep the superseded fact, count the refusals — and mechanisms are what the arms
test.

### L.24 — R49's cells beside the published rows, and why they do not join the table (2026-11-07)

| Entry | Scenario | Cell | Comparable? |
| --- | --- | --- | --- |
| IBM `gpt-5.5` | airline | **82.0** pass^4 | published SOTA; unverified here (PR #551, prompt changed) |
| SapientAI | airline | 72.0 | reported |
| IBM `gpt-4.1 sup3` | airline | 44.0 | reported |
| stock `gpt-oss-120b` | airline | 34.0 | same harness, reference row |
| **microglia** (floored, R49) | retail | **36.0** pass^4 | **no** — different scenario, own split, 10-rule store |
| microglia (as-is, R49) | retail | 40.0 | **no** — same reason |
| microglia reference (no memory, R49) | retail | 40.0 | **no** — same reason |

The rows are here because the alternative is worse: a project that publishes its
memory cells everywhere except beside the numbers it is chasing invites the
reader to assume they were compared and lost. They were not compared. Retail and
airline differ in tool count, task length and grading rubric, and the airline SOTA
rows come from a prompt that this lane deliberately does not reproduce.

What *is* comparable is the reference row inside the run: 40.0 without memory and
36.0 with it, on the same 50 tasks and the same trials. That is the honest
statement of where the memory mechanism sits today — **not above its own
ablation**, at a difference the split cannot resolve (MDE 13.73pp). Which puts the
project's position plainly: fifth of six named entries on the published airline
table, and inside its own lane, level with no memory at all.

The next step is therefore not a competing architecture. It is a pack that
carries more than 0.76 rules per question, because a mechanism whose input is
thinner than one rule cannot separate itself from a mechanism whose input is none.

### L.25 — Every competitor ships the trigger; we dropped it twice (2026-11-08)

The literature in L.21 explains why memory hurts: irrelevant or stale context,
over-long prompts, and rules applied outside the scope that made them true. What it
does not explain is *silence*. A memory that arrives and is wrong has an effect; a
memory that does not arrive has none, and no accuracy comparison can tell you that
the mechanism was absent, because the arm and the control behave identically when
the treatment never fires.

That is the state R49 measured. Ten rules, all servable, and **38% of 1,528 requests
served an empty pack**, 0.76 rules per request, median rule/query coverage 4.7%.
Which turns the question from "what did the competitors know about relevance" into
"what do they write that we did not".

| System | What carries the trigger | Where the question goes |
| --- | --- | --- |
| Mem0 | the memory record is a natural-language fact extracted *from the conversation*, so the user's own vocabulary survives the write | the conversation text is the input to extraction (arXiv 2504.19413 §3) |
| Voyager | a skill has a **description** used for retrieval, separate from the code it names | the description is written to be matched against new tasks (arXiv 2305.16291 §2) |
| ExpeL | insights are extracted from paired success/failure trajectories and conditioned on the task family | the trajectory, including the task text, is the input (arXiv 2308.10144) |
| Reflexion | the reflection is *about* a specific attempt and is retrieved by task similarity | the attempt's task anchors the memory (arXiv 2303.11366) |
| Generative Agents | the memory stream stores the observation verbatim, scoring recency × importance × relevance | retrieval scores the stored observation text against the query (arXiv 2304.03442) |
| **microglia** (before R51) | **nothing** — the rule was the gold tool-call sequence, and the condition field was empty on 10 of 10 items | the task **id** was passed as the question, so even the distiller could not write a trigger |

The pattern is not subtle. Every one of these systems stores the observation *with
the situation that produced it*, because the situation is what a future query will
resemble. We stored the conclusion and discarded the situation, at two boundaries:
the τ² write path parsed past `user_scenario.instructions`, and the read path —
index, coverage floor and diversity ranking — measured the statement alone even
though the renderer had been printing the condition for a year.

Two things are worth importing and one is worth refusing:

1. **Import: the description is a first-class field, not a decoration.** Voyager's
   split between "what the skill is" and "when to use it" is the same split as
   `statement` / `when`, and the reason it works is that retrieval reads the
   second. A trigger that only the renderer sees is a trigger that only the model
   sees, and the model sees it *after* retrieval has already decided not to send it.
2. **Import: retrieve by the situation, rank by the claim.** Our coverage gate now
   measures against condition + statement, while MMR diversifies on the same text
   and BM25 keeps `kind` and scope in the index. That is the closest structural
   analogue to the published designs without adopting their vector stores.
3. **Refuse: extracting from the raw transcript into free-form prose.** Mem0's
   facts are strings a user could have said; ours are procedures verified against
   an executable gold action list, which is a sharper correction and a worse
   retrieval key. R51 keeps the verified procedure and adds the situation beside
   it, rather than trading one for the other.

What this costs in the ranking: nothing, because nothing here is a benchmark row.
What it costs in the narrative: the standing hypothesis — "our memory hurts because
its content or its use is wrong" — is not supported by the measurement, and this
entry records the alternative that is: **the memory was rarely present, and when it
was present it was not findable.** IBM `gpt-5.5` airline 82.0 remains the published
SOTA; microglia remains fifth of six named entries on the airline columns it has
measured, and level with its own no-memory ablation on retail (40.0 against 36.0 at
an MDE of 13.73pp).

### L.26 — Five 2026 results say the damage happens *after* retrieval, and one of them names our defect (2026-11-08)

L.21–L.25 argued about what to store and how to find it. The 2026 literature has moved
one step later, and the move is uncomfortable for the hypothesis this project has been
carrying since R42: *"our memory hurts because its content or its use is wrong."* Half of
that sentence is now the wrong half.

| Result | What it measured | Number |
| --- | --- | --- |
| **MemTrapBench** (arXiv 2608.xxxxx, HF release) | five memory frameworks, two model families, all against no-memory | **every strategy underperformed no-memory**; the best still dropped more than 10% |
| **MemCalib** (USTC + Qwen Applications + Fudan) | per-atom target influence — Ignore / Bound / Control — over 15,000 examples | best frontier model **SCS 46.25, Exact 28.40** of 100; every model but one over-uses rather than under-uses |
| **MemSyco-Bench** | where errors come from on LongMemEval, LoCoMo, STALE, PersonaMem | **47.4–66.1%** "evidence not retrieved"; only **5.8–13.7%** "retrieved and still wrong"; and **61–62%** of errors in three systems happen *after* the right memory was retrieved |
| **OP-Bench** | plain RAG, Mem0, MemU, MemOS × four backbones | all five below the no-memory baseline, by **26.2%–61.1%** |
| **RPEval** (Renmin + Huawei) | preference labelled Ignore / Support / Dominate | humans 0.86 on Ignore; **GPT-5 0.12, DeepSeek-V3 0.38** — an inverse scaling result |
| **CoM** (ACL 2026) | gate retrieved fragments by **relevance × consistency**, truncate the tail | **+7.5–10.4%** accuracy at **2.7%** of the tokens and **6.0%** of the latency of structured memory |
| **STITCH** (ACL 2026) | index memory by **contextual intent** rather than by content | the same fragments, retrieved by what the user is trying to do |

Two readings of that table matter here, and they point in opposite directions.

**The first is that retrieval was never the whole story.** MemSyco's split says the
retrieval failure dominates on conversation benchmarks — 47–66% against 5.8–13.7% — which
is the failure R51 spent an iteration fixing at two boundaries. But the same paper finds
that 61–62% of the *remaining* errors occur after the right memory was retrieved, and
MemTrapBench goes further: a **correct, relevant** memory anchors the model to a prior
frame that no longer fits the current question — their names for it are Reasoning Fixation
and Belief Distortion. A precision@k table cannot see this, and neither can our `V1`.

**The second is that our pack already carries the mitigation and it is too weak.**
MemTrapBench's intervention, AdaptiveMem, is an inference-time instruction to watch for
memory traps — no retraining, no new index — and it recovers performance. Our pack note
says *"apply an item only where its condition holds"*, which is the same idea stated to a
model that has just been handed the rule and has no reason to doubt it. The difference
between "check the condition" and "this may be a trap" is the difference the paper measures.

So the next arm is not about retrieval, and its hypothesis is written to be falsified:

- **R53** — same store, same recall, same packs; the *only* variable is the sentence that
  precedes them. Three levels: no note, today's note, and a hardened calibration note that
  names the failure mode (a recalled rule may describe a situation this request is not;
  prefer the current observation where they disagree). MemCalib's taxonomy gives the
  prediction a direction: over-use dominates, so an instruction that licenses ignoring is
  worth more than one that explains.

One thing this table will not do is explain R49. R49's −4.00pp is inside a 13.73pp
resolution and cannot be attributed to any of these mechanisms — the arm was not powered to
distinguish absence from harm, and the census that came with it (38% empty packs) says the
treatment was absent a third of the time. What it does do is remove the excuse: after R51
the packs arrive, and if the effect is still flat, the cause is on this page rather than in
the index.

### L.27 — Two of our numbers were the wrong numbers, and the competitors' rows stand (2026-11-08)

L.25 argued that every competitor ships the trigger and we dropped it twice, and used "38%
of 1,528 requests served an empty pack" as the evidence. That number is real and the
inference was wrong. This entry corrects it, because a comparison table built on a defect
that does not exist is worse than no table.

**What the number was.** R49 ran a coverage floor of 0.01. With it, 949 of 1,528 requests
were served a pack; **without it, 1,435 were** — both figures are in R49's own artefact, and
R51 at floor zero served **1,527 of 1,527**. The floor emptied the packs, not the missing
triggers. The retention curve that says so was added for a different reason and printed
twelve lines below the number we quoted.

**What survives, measured:**

| Reading | R49 (floor 0.01) | R51 (floor 0) | R54 (same-domain) |
| --- | --- | --- | --- |
| items in the store | 10 | 16 | pending |
| items stating a condition | **0 of 10** | **16 of 16** | pending |
| requests served nothing | 579 / 1,528 (the floor) | **0 / 1,527** | pending |
| mean rules per request | 0.76 | 1.22 | pending |
| p50 rule/query coverage | 4.7% | 4.88% | pending |

So the honest row for microglia in L.25's table is not "no trigger, and therefore no
delivery". It is: **a trigger now, full delivery, and 1.22 rules per request whose median
lexical overlap with the question is 4.9%.** That last number is the one that matters
against the published work, and it is worse than any of the systems listed in L.26 measure
on their own benchmarks — Mem0 and Voyager retrieve by a description written to be matched
against new tasks, while ours is a procedure whose median overlap with a user's utterance is
one token in twenty.

**One caveat that is not a comfort.** The 4.9% was measured on the transfer configuration
(retail store, airline questions), where near-zero overlap is *correct* behaviour. R54
re-measures it with the pair pinned to retail/retail/retail, and that number — not this one —
decides whether the register is a defect or a property of transfer.

**Where the ranking stands.** Unchanged, and no row of ours is a leaderboard entry. IBM
`gpt-5.5` airline 82.0 is the published SOTA; microglia remains fifth of six named entries on
the airline columns it has measured, level with its own no-memory ablation on retail (36.0
against 38.0 at an MDE of 18.59pp), and none of this iteration's work moves `pass^4` at all.
What this iteration bought is that the next number will be about the mechanism rather than
about a switch.

### L.28 — The number that is comparable to their rows is the delivered one (2026-11-08)

L.27's caveat is now addressed in the instrument rather than in prose. The 4.9% was the median
over the pairs that cleared zero; the artefact also commits the median over every delivered
pair, which on R47's population (750 zeros of 2,188) is about half. Both are printed, neither
is a threshold.

Against the published work, the delivered-pair median is the honest comparison. MemSyco-Bench
finds 61–62% of the errors it catalogues occurring after the correct memory is already in
place, and MemTrapBench finds five frameworks below their no-memory ablation — both are
statements about what happened to the whole delivery, not about a filtered subset. A memory
whose delivered median is near zero cannot be compared to those rows by quoting its survivors.

No ranking changes. IBM `gpt-5.5` airline 82.0 remains the published SOTA and microglia remains
fifth of six named entries; nothing in this iteration moves `pass^4`.

### L.29 — The ablation and the leaderboard row are the same system at two populations (2026-11-08)

L.19 listed six reasons IBM's 82.0 could not be copied. This entry re-read the primary write-ups on
2026-11-08 and records the ablation table itself, because for the first time it says something about
*our* store rather than about their score.

Both domains, 4 trials, stock ReAct scaffold, `gpt-4.1` agent and `gpt-5.5` user simulator:

| Domain | Configuration | Guidelines | Mean accuracy | pass^4 |
| --- | --- | --- | --- | --- |
| retail | baseline | 0 | 78.1% | 57.5% |
| retail | `sup3` | 31 | 78.8% | 60.0% |
| retail | lossless | 292 | 82.5% | **67.5%** |
| airline | baseline | 0 | 57.5% | 35.0% |
| airline | `sup3` | 14 | 60.0% | **45.0%** |
| airline | lossless | 101 | 65.0% | 40.0% |

Three things this table settles, and one it does not.

**The unit is not the defect.** Their treatment is a markdown block of prose appended to the system
prompt after the domain policy — the object our dose curve prices at −1.7pp per item and four stages
concluded could not work. It works at 14, at 31 and at 292 items on the same benchmark, the same
metric and the same scaffold we run. Any claim of the form "prefix injection is the wrong position
for memory" has to survive this row, and ours does not.

**The dose is not monotone, and the inversion is informative.** Airline: 14 guidelines beat 101 by
5pp on `pass^4` while losing 5pp on mean accuracy. Retail: the full set wins on both. So the quantity
of guidance is a per-domain parameter, not a constant — the same conclusion our own W8 reached from
the other direction (accuracy falls ~1.7pp per item injected, and content is indistinguishable from
volume). Two systems, two corpora, one shape of answer.

**What separates the stores is material, and it is countable.** 292 guidelines from a training split
of roughly 57 tasks is ~5 per task; R51's 16 items from 32 tasks is 0.50. And `sup3` keeps only
guidelines derived from ≥3 distinct tasks — 10.6% of retail's set, 13.9% of airline's. On BIRD, the
equivalent filter kept **0 of 1,296** rules, which is why the axis has never been measured here.

**What does not transfer.** The test sets are 40 retail and 20 airline tasks, where one airline task
is 5pp of `pass^4`; both leaderboard submissions are open, unverified PRs that declare modified
prompts; retail's guidelines were learned from a train split the base evaluation includes; and the
same `sup3` configuration appears as 45.0 held-out and 44.0 on the leaderboard, which is one system
at two populations rather than a discrepancy. Copy the mechanism — support counted per distinct
task, dose tuned per domain, provenance kept — not the numbers.

**Ranking unchanged.** IBM `gpt-5.5` airline 82.0 remains the published SOTA, IBM `gpt-4.1` retail
67.5 leads that domain, and microglia remains fifth of six named entries with nothing in this
iteration moving `pass^4`.

### L.30 — The recurrence column becomes measurable, and the ranking does not move (2026-11-08)

Two instruments landed before R56's dispatch, and neither is a score. They are the two that decide
whether a score can be compared with the published ablation at all.

**Recurrence, finally counted.** IBM ALTK-Evolve's `sup3` keeps a guideline only when at least three
distinct tasks derived it: 31 of 292 on retail (10.6%), 14 of 101 on airline (13.9%). We have quoted
those percentages for two iterations without being able to compute the equivalent number about our
own store, because the τ² driver never wrote `EvidenceRef.taskId` — every item's evidence fell back
to its run id, and the distinct-task count was **1 by construction** for every item, whatever the
store contained (AUDIT 34.58). A reading of "our rules never recur" would have been an artefact of
the recorder.

`storeItems` now carries `supportTasks` and `evidence` per item, counted through the same function
the score uses to decide whether a claim is worth storing. So the comparison becomes possible on the
quantity that actually separates the two systems:

| | IBM ALTK-Evolve retail | microglia (τ² retail) |
| --- | --- | --- |
| learning tasks | ~57 | 32 |
| guidelines | 292 | 20 (R54) |
| per learning task | ~5.1 | 0.63 |
| at support ≥ 3 | 31 (10.6%) | **not yet measured** — R56's artefact carries it |
| at support ≥ 2 | — | **not yet measured** |

**The pipeline, finally gated.** Every one of the thirty-nine protocol gates graded a reading, and
none asked whether the machine that produced it carried anything. The competitors that publish
ablations get this for free by construction: an ablation *is* a pipeline check, because removing a
module and seeing the number move proves the module was in the path. We publish ablations too — the
dose curve, the four feature flags, the clearance arm — and the failures we have actually suffered
were upstream of all of them (a model alias, a floor applied to the wrong population, an evidence
field never written). `V0-instrument-ready` is the fortieth gate and the first whose subject is the
pipeline.

**What this changes in the table: nothing yet.** Both instruments are pre-conditions for a
comparable row, not rows. microglia remains fifth of six named entries; IBM `gpt-5.5` airline 82.0
remains the published SOTA overall and IBM `gpt-4.1` retail 67.5 leads that domain; R54's +5.26pp
remains `UNRESOLVED` at 57 pairs and a 20.27pp resolution. What has changed is that the next
comparison — R56's coverage reading and R55.0's recurrence distribution — can be set beside `sup3`
without an asterisk, and that "our store does not recur" will from now on be a measurement rather
than an assumption.

### L.31 — R56 read: the density column moves, the recurrence column cannot (2026-11-08)

L.30 promised that two columns would stop being assumptions. One of them did, and the answer is
worse than either outcome the table was written to expect.

**Density.** R56's `procedure` arm halved the store's yield — one candidate per correction where
`lesson` produced two — and the store went from twenty items to eight:

| | ALTK-Evolve retail | ALTK-Evolve airline | microglia R54 | microglia R56 |
| --- | --- | --- | --- | --- |
| learning tasks | ~57 | ~50 | 32 | 32 |
| guidelines | 292 | 101 | 20 | 8 |
| per learning task | 5.12 | 2.02 | 0.63 | 0.25 |
| `sup3` subset | 31 (10.6%) | 14 (13.9%) | not computable | not computable |
| `sup3` per learning task | 0.54 | 0.28 | — | — |
| `pass^4` vs no-guidelines | +10.0pp (67.5) | +5.0pp (40.0) | +5.26pp, p=0.63 | **−8.77pp**, HARM |

Two rows are worth reading together. At `sup3` density IBM keeps **0.54 guidelines per learning
task** and reads +2.5pp over no guidelines (60.0 against 57.5). Our R54 store kept **0.63 per learning
task** — the same density, on the same benchmark, with the same measurement unit — and produced
+5.26pp that the pair could not resolve. Density is therefore *not* what separates the two systems,
and L.30's framing of the material question as a density question was too generous to us: we are
already at their selective arm's density and we are not getting its result.

**Recurrence.** The column L.30 said R56 would fill is still empty, and now for a reason that is
structural rather than instrumental. `supportTasks` is written correctly as of R56 — the τ² write
path sets `EvidenceRef.taskId`, and the count is taken through the same function the score uses. But
in this lane **every item derives from exactly one user correction, and every correction comes from
a different task**, so `supportTasks` is 1 by construction, whatever the store contains. IBM's
guidelines derive from *task trajectories*, successes and failures, ~5 per task; ours derive from one
sentence of one failure. A mechanism whose admission rule is "three distinct tasks derived this"
cannot be transplanted onto a unit that never has a second deriver.

That is the sharpest competitive statement this project has been able to make, and it is a statement
about the unit rather than about the prompt, the recall or the admission rule: **the recurrence
mechanism is not available to a store built one correction at a time.** R55.0 is dispatched to
measure the distribution rather than assert it — the prediction is that no item reaches support 2 —
and if it reads as predicted, the next registration is about the *object* distilled (one task trace
rather than one correction), which is R56's own second refutation arriving one iteration late.

**What this changes in the table: nothing, and that is the point.** microglia remains fifth of six
named entries; IBM `gpt-5.5` airline 82.0 remains the published SOTA overall and IBM `gpt-4.1` retail
67.5 leads that domain. R56's arm lost 8.77pp and reverts under R45 — a revert is not a leaderboard
move, it is the removal of a candidate that was never a row. The honest summary of this iteration on
the competitive axis is that a hypothesis about *why* we trail was tested, cost us an arm, and did
not pay: the prompt was not the missing piece, and the material question is still open.

**The note axis, and what the 2026 literature says our rank would depend on.** R53's arm is the only
one in this project that is a *publication's own intervention* rather than our design: MemTrapBench
recovers a memory-below-no-memory deficit with an inference-time instruction and no retraining;
MemCalib reports over-use dominating and the best frontier model scoring 46.25 of 100 on calibrated
influence; RPEval reports humans ignoring an irrelevant preference at 0.86 against GPT-5 at 0.12. If a
single sentence in the pack can move `pass^4` by the resolution of a 57-task split, then the gap to
IBM is partly a prompt-calibration gap and the leaderboard is winnable without changing the unit. If
it cannot, the note axis is closed for this store and the unit question from L.31 stands alone.

Neither IBM nor any competitor in L.23 publishes a three-level note ablation on τ², so this
measurement is the first of its kind on the benchmark as much as it is ours — which also means it
cannot move the ranking by itself. It can only decide **which of the two remaining explanations we
spend the next arm on**, and that is the shape every decision in the last ten iterations has taken:
the table does not move, the search gets narrower.

Ranking unchanged this iteration, and unmoved for a reason worth stating plainly: the work added a
capability and found two defects, and a capability is not a result. microglia is fifth of six named
entries; IBM `gpt-5.5` airline 82.0 is the published SOTA overall; IBM `gpt-4.1` retail 67.5 leads
that domain; and the τ² retail number this lane can defend is the paired memory-versus-reference
reading it already had.

**R55.0 puts microglia closer to the retail leader than it has ever been, and the table still does not
move.** The memory arm read `pass^4 = 64.91%` on the 57 held-out retail tasks; IBM's `gpt-4.1` retail
arm is at 67.5, so the gap is **2.59pp** and it is the narrowest the comparison has been. Two facts
keep that sentence honest:

- Our own memory-free arm read 54.39% on the same split, which is *below* the 57.5 published baseline
  the lane has been grading against. The 64.91 is therefore a weak backbone plus a large treatment
  effect, not a strong backbone at parity: +10.53pp paired, p = 0.210, n = 57, resolution 19.66pp —
  `UNRESOLVED`, so no contribution is claimed.
- IBM's 67.5 is their selective arm on their split; ours is 57 tasks of the 114-task retail set with a
  different backbone. The comparison is against the published number under the lane's own protocol, not
  a head-to-head run.

| Entry (τ² retail, `pass^4`) | Value | Source |
| --- | --- | --- |
| IBM ALTK-Evolve, `gpt-4.1`, selective (`sup3`) | **67.5** | published |
| **microglia, `deepseek-chat`, R55.0 memory arm** | **64.91** | run `42463064049`, 57 tasks, unresolved pair |
| IBM ALTK-Evolve, `gpt-4.1`, no guidelines | 57.5 | published baseline the lane grades against |
| microglia, `deepseek-chat`, R55.0 memory-free reference | 54.39 | same run, same split |

**What the table now says about the mechanism.** Three of our last four arms changed the *prompt side*
of the injection — the form (R56), the note (R53, built not dispatched), the register (R51) — and the
one that read highest was the arm with the least prompt engineering: `lesson` form, the tool-name ban,
seven items. IBM's advantage is not in their prompt either; it is in the unit, where ~5 guidelines per
learning task are derived from a trajectory and admitted only after three trajectories support them.
Our store cannot express that, because an item has exactly one deriver by construction (AUDIT 34.71,
distribution `{1: 7}`). **The remaining 2.59pp and the recurrence mechanism are the same problem**, and
that is what R58 changes.

Ranking, stated as the numbers rather than as an ordinal, because the ordinal depends on which
submissions count: the retail rows this project has recorded are SapientAI 72.8 and IBM `gpt-4.1` 67.5
above us, RAFT-30B-A3B 61.4, ALTK-Evolve 57.5 and stock `llm_agent` 34.0 below — and the earlier note
that two of the five rows are unverified submissions, one of which discloses train/base overlap, still
applies. Before R55.0 the lane's own number was not in that list at all; now it is, at 64.91, and the
sentence that has to accompany it is the pair's state: `UNRESOLVED`.

IBM `gpt-5.5` airline 82.0 remains the published SOTA overall — that row is unaffected by anything
measured here, because this lane has never run the airline arm as a treatment.

### The mechanism behind the 2.59pp, and the first iteration that attacks it (2026-11-08)

No new number this round, and the table above stands. What changed is that the mechanism which
separates this project from the leader is now implemented rather than described.

IBM's `sup3` admits a guideline after three distinct learning tasks and keeps ~5 guidelines per
learning task. Both halves of that sentence are about the *unit*: a trajectory yields several
guidelines, and three trajectories can support one of them. This store yielded one rule per failed
task, so support was 1 for every item (`{1: 7}`) and no admission rule could raise it — the floor was
above the population's maximum, which is why R55.1 was closed as unrunnable rather than as failed.

R58 implements the two halves in the order the write path requires them:

| Leader's property | Ours before | Ours now |
| --- | --- | --- |
| the unit is a trajectory | one sentence per correction | `input.trace`: attempt, reference trajectory, failed rubric |
| several claims per unit | one candidate per event | up to three, each with its own trigger |
| recurrence across tasks | impossible by construction | consolidation over the finished store, evidence unioned, counted by `supportTasks` |
| admission at support 3 | floor above the population's maximum | expressible for the first time if any item reaches 3 |

The prediction is registered (`prereg/R58-trace-unit.md`) and the dispatch is running
(`42476580076`). Nothing is claimed until the readback: the lane's history is four `UNRESOLVED` pairs
and one `HARM`, and the rule that a treatment which loses does not stay because its explanation is
interesting has already reverted one arm (R56, −8.77pp).

What would move the table: an item at support 3 in a store whose coverage clears the 12% bar, followed
by a `pass^4` that a 57-task split can resolve. What would close the axis: no item at support 2 after
the pass, which would make the corpus — 57 tasks, one domain, four trials — the constraint rather than
the mechanism, and would move the next registration from the distiller to the sample.

### R59 — the `sup3` gap is yield per task, not the floor

R58's readback and R59's calibration together say something about this appendix that no earlier
iteration could, and it moves the comparison away from the number everyone argues about.

The published `sup3` numbers are **31 rules of retail's 292** (10.6%) and **14 of airline's 101**
(13.9%) surviving a three-distinct-task floor at roughly five guidelines per learning task. This lane
now knows its own yield exactly: **7 corrections produced 15 claims** (2.14 per episode), and with the
learning half raised from 32 tasks to 57 the expectation is ~12 corrections and **~26 claims**.

| | IBM ALTK-Evolve (`gpt-5.5`) | this lane (`deepseek-chat`) |
| --- | --- | --- |
| learning tasks | ~60 implied by 292 rules at ~5/task | 57 (R59) |
| guidelines written per task | ~5 | **2.14 claims per *correction***, and only 21.9% of tasks produce one |
| store size, retail | 292 (lossless) / 31 (`sup3`) | **~26 expected** |
| items at support ≥ 3 | 31 | 0 (R58), unmeasured at R59's population |
| `pass^4` retail | 67.5 (lossless) / 60.0 (`sup3`) | 63.16 memory-free control (R58) |

Two consequences, and the second is the useful one.

**The floor is not the gap.** A 26-item store cannot have 31 items at support 3. Even at a perfect
one-in-ten recurrence rate — IBM's own — this lane's store would hold two or three corroborated items,
not thirty-one. Importing `sup3` would therefore select almost nothing here for the third time, and
R59 does not import it: it calibrates a merge floor on this register instead, where the store's own
repeats are what decides.

**The yield is the gap.** Their distiller writes about five guidelines per learning task from a full
trajectory and a frontier model; this lane writes 2.14 claims per *correction*, and only about a fifth
of learning tasks produce a correction at all — roughly **0.5 claims per task**. At equal task counts
that is a 10× smaller store, and a 10× smaller store cannot be read the way theirs is: their own
result says selection matters more than volume (292 rules at 67.5 against 31 at 60.0), and selection
needs a population to select from.

So the next question this record should ask is not "what floor", which R59 answers with the store's
own distribution, but **"why does one trace yield two claims where a trajectory yields five"** — a
distiller question (claims per trace, and whether each failed rubric assertion is its own episode)
rather than a threshold question. That is where a 10× gap lives, and it is measurable without a
benchmark run: claims per correction is a number the artefact already carries.

The position on the table does not move in this iteration and is not claimed to: **IBM `gpt-5.5`
airline 82.0 is the published SOTA; SapientAI-Agent-Opus-5 72.0; IBM `gpt-4.1 sup3` 44.0 (airline) and
60.0 (`pass^4`, retail); this lane 63.16% `pass^4` on retail's 57 held-out tasks with memory off and
64.91% with it on.** The pair remains `UNRESOLVED`, and the memory-free control moved 8.77pp between
two dispatches of one configuration, which is larger than any treatment effect reported here.

### R59 — a resolution column, because the ranking is what the sample has to support

The table this appendix keeps has always compared numbers and never asked what its own sample could
separate. That column now exists and it changes what the comparison is allowed to say.

**What the bench can resolve.** 57 held-out tasks, four trials, paired against the lane's own reference
arm. On the binary endpoint the 95% interval is ±15.0pp and a three-point effect would need 1423 pairs;
on the per-task rate it is ±5.5pp and needs 398. The best endpoint available here resolves **7.9pp at
80% power**, and retail has 115 tasks in total.

**The one published effect of that size** is the arm's own ablation: 292 rules at `pass^4` 67.5 against
31 rules at 60.0 — **7.5pp**, for a tenfold reduction in store size. That is just inside the line, which
means this bench *could* adjudicate a `sup3`-sized selection effect if it had a store large enough to
select from. It cannot adjudicate anything finer.

| reading, retail | value | separable from the lane at n = 57? |
| --- | --- | --- |
| IBM `gpt-5.5` airline (published SOTA, other domain) | 82.0 | n/a — different domain |
| SapientAI-Agent-Opus-5 airline | 72.0 | n/a — different domain |
| IBM `gpt-4.1` retail, lossless store | 67.5 | **no** — 4.3pp, inside the interval |
| **this lane, memory on** | **64.91** | — |
| this lane, memory off (same run) | 63.16 | — |
| IBM `gpt-4.1 sup3`, retail `pass^4` | 60.0 | **no** — 3.2pp, inside the interval |
| IBM `gpt-4.1 sup3`, airline | 44.0 | n/a — different domain |
| sup3 ablation, published (67.5 → 60.0) | −7.5pp | **yes**, if a store of that size existed |

Three consequences, in order of how much they cost.

**The lane's position is "not 8pp from either IBM retail reading", and that is all.** It is not a rank.
63.16 sits between 60.0 and 67.5 and the interval reaches past both. A record that printed the ordering
without this column would be claiming a placement the sample cannot support, in either direction.

**The lane's own treatment effect is invisible here.** +1.75pp on `pass^4`, −1.32pp on the rate, and
every previous registration in the same position. The interval is 15pp. This is a design fact, not a
mechanism fact, and it is now printed beside every pair.

**The gap to `sup3`-sized effects is yield, not selection.** A 26-item store cannot be read the way a
292-item store is read: their own ablation says selection is worth 7.5pp and selection needs a
population. At 2.14 claims per correction and roughly half a claim per learning task, this lane's store
is an order of magnitude smaller at equal task counts, which is why the next registration is about
claims per trace rather than about the floor — and why R59's calibration is a precondition for that
question rather than an answer to it.

The published SOTA does not move: **IBM `gpt-5.5` airline 82.0**; **SapientAI-Agent-Opus-5 72.0**; **IBM
`gpt-4.1 sup3` 44.0 (airline) / 60.0 (`pass^4`, retail)**; this lane **64.91% with memory on and 63.16%
with it off** on retail's 57 held-out tasks. The pair remains `UNRESOLVED`, and the 8pp resolution above
is the reason that word is the honest one.

### R59 read and R60 — the recurrence rate is the comparison that decides whether the gap is closable

The yield argument in the previous section had one number missing: whether the claims this lane writes
actually recur. R59 supplied it, and it is the first time the comparison can be made on the axis the
published `sup3` arm is defined by.

| | IBM ALTK-Evolve (`sup3`) | this lane (R59) |
| --- | --- | --- |
| store, retail | 292 guidelines | **31 claims** |
| at `supportTasks >= 3` | 31 of 292 — **10.6%** | **0 of 31 — 0%** |
| at `supportTasks >= 2` | — | 1 of 30 — **3.3%** |
| claims per learning task | ~5 | **0.54** (2.21 per correction, from 24.6% of tasks) |
| what the recurrence is over | full trajectories, ~60 tasks | one trace per task, 57 tasks |

Three readings of that table, in order of how much they cost.

**The rate, not the store, is the gap now.** At the published 10.6%, 31 claims should hold 3.3 items
at three distinct tasks. This store holds none. A store ten times smaller explains a count of 0.3
items; it does not explain 0 when 3.3 were expected, so the explanation is in the *shape* of the
claims rather than in the population alone. Their guidelines come from a whole trajectory with its
successes and failures and read as patterns; these come from one failed rollout's diff against a
reference and read as repairs to a specific kind of request.

**The one corroboration is real, and it is one.** Two tasks derived the same directive, and the pair
scores 0.667 on the shipped measure against 0.348 on the previous one. That is the mechanism working
once — enough to say the axis exists here, not enough to say it is a rate.

**Selection cannot be tested on a store that cannot corroborate itself.** Their own ablation says the
gap between a lossless 292-rule store and its 31-rule `sup3` core is **7.5pp** at `pass^4`, and that
the *selection* is what costs the 7.5pp. Selection needs a population to select from. This bench can
resolve about 8pp at 57 tasks on its best endpoint, so it could in principle see a `sup3`-sized
effect — but not while the store has no corroborated core to select.

So R60 asks the only question that is both cheap and decisive: with the trace ceiling raised from
three to six — a cap that sat within one claim of the measured mean — does the store grow enough for
the class that already holds two members to receive a third. If support 3 appears, `sup3` becomes
implementable here and the selection comparison becomes a real comparison. If it does not, the
conclusion is that a register of one-sentence repairs from a single trace per task does not recur at
this density, and the lane's competitive claim stays where it is: **63.16% `pass^4` on retail's 57
held-out tasks with memory off, 64.91% with it on, both `UNRESOLVED` against a 15pp interval**, beneath
**IBM `gpt-5.5` airline 82.0** (published SOTA), **SapientAI-Agent-Opus-5 72.0**, and beside **IBM
`gpt-4.1` retail 67.5 lossless / 60.0 `sup3`**.

## The recurrence rate, after the floor was fixed (R60 read, R61 dispatched)

| system | items at three distinct witnessing sources | basis | comparable? |
| --- | --- | --- | --- |
| microglia R59 | **0 of 30** (one item at two) | 31 claims, 57 tasks, ceil 3 | our lane |
| microglia R60 | **0 of 36** (one item at two) | 37 claims, 57 tasks, ceil 6 | our lane — the ceiling moved and this did not |
| microglia R61 | **pending** — the store's own duplicate family is a group of three with support in [2,4] | 37 claims, no condition veto, complete linkage | same store, different pass |
| IBM ALTK-Evolve | **31 of 292 = 10.6%** | ~5 guidelines per learning task | different unit of claim, not a head-to-head |
| SapientAI | 72.0 | published retail row | `pass^4` style average |
| IBM (gpt-5.5) | 82.0 | airline domain SOTA | different domain |

**The comparison this round changed.** R60 moved the ceiling and the recurrence rate did not move at
all, which is the reading that says the yield was never the binding term. The binding term was the
pass, and the pass had a filter that did not separate: over the store's 666 pairs, the number of
shared trigger words was median **1** whether the two lessons matched or not.

**Where microglia stands, stated precisely.** On the published 10.6% rate, a 36-item store should hold
about four items at three witnesses; it holds none, and one at two. That is not a claim that the
published rate is wrong — it is a different unit, extracted from trajectories rather than from
per-task rubrics. It is a claim that this lane's *own* store already contained a three-witness lesson
and the pass could not see it, which is a defect rather than a research gap, and it is the one R61
grades.

**What would move this lane's ranking, in order of size.** First, the correction rate: only 12 of 57
tasks produce a correction at all, so there are 12 failure episodes to mine and every recurrence
argument is bounded by that. Second, the claim unit: three to four claims per correction against the
published five per learning task. Third, the end-to-end average, which stays `UNRESOLVED` at 57 pairs
and needs ~400 for a three-point effect on the rate endpoint.

## The board moved under every row, and one paper says why (2026-11-09)

Two readings from outside this repository change how the BIRD column below should be read, and neither
is a re-ranking of our own work.

**The board as of 29 October 2026**, in the order it is published:

| rank | system | test EX | dev EX |
| --- | --- | --- | --- |
| 1 | human (data engineers and students) | **92.96** | — |
| 2 | AskData (AT&T CDO / DSAIR) | **83.40** | 78.49 |
| 3 | GrainSQL | 82.95 | 77.77 |
| 4 | DataGallery-Text2SQL (Huawei) | 82.39 | 78.10 |
| 5 | SiriusAI-SQL | 82.28 | 77.77 |
| 6 | Agentar-Scale-SQL (Ant Group) | 81.67 | 74.90 |
| — | **microglia, no memory (dev, minidev)** | — | **57.63** |
| — | **microglia, memory arm (dev, minidev)** | — | **56.26** |

The top of the board has moved **under two points in thirteen months** (Agentar 81.67 in September
2025, AskData 83.40 in October 2026), which is the first time this table has been able to say that the
frontier is stalling rather than accelerating. It also means the 25.77pp between our row and the first
place is not a gap that a better prompt closes: it is the generator-plus-candidate-pool gap, and
XiYan's own ablation prices its two halves at −2.91 (fine-tuned generator) and −2.74 (selection model),
neither of which this harness buys.

**The paper that makes the whole column a distribution rather than a number.** *Pervasive Annotation
Errors Break Text-to-SQL Benchmarks and Leaderboards* (Jin, Choi, Zhu and Kang, January 2026) had
experts re-review the gold annotations: **52.8% of BIRD Mini-Dev** and **62.8% of Spider 2.0-Snow** were
wrong. Re-scoring sixteen open-source agents on a corrected BIRD Dev subset moved relative performance
by **−7% to +31%** and shifted rankings by **up to nine places**. BIRD shipped a Mini-Dev update with
corrected annotations on **28 October 2026**.

Three consequences, in the order they affect us:

1. **Our corpus is pinned, and that is now a validity property rather than an engineering habit.**
   `eval/manifests/bird-minidev.json` names one archive by `sha256`
   (`cc48ba16…c13b92f`, 800,943,648 bytes, `v1-2024-06-20`), so the 28 October 2026 correction did not
   silently move any number this repository has published. A run on the corrected corpus would need a
   manifest change, which is a recorded act rather than a floating `resolve/main`.
   **But one path in the lane is not pinned**: when the archive is absent and `BIRD_DIR` points at a
   directory without the question file, `loadDataset` falls back to two floating URLs
   (`bird-critic-1.0-sqlite/resolve/main`, `bird_mini_dev/resolve/main`). That path is not taken on CI,
   and it is the one place where a published number could be measured on a corpus nobody can name. It
   is the next change to this lane: digest the parsed questions into the artefact and record whether
   the source was the pinned archive or a URL.
2. **A three-point difference on 350 questions is not a difference.** If more than half the gold answers
   are contested, an evaluation slice of this size cannot resolve the 2–4pp that separates ranks 3 to 6,
   and it certainly cannot resolve our own 1.37pp. This is the same conclusion R59's resolution column
   reached from the sample side, now with an independent source.
3. **Evidence hints are the conditioning nobody states.** Every published row above 67.41% test EX uses
   BIRD's per-question evidence, and 67.41% is the best row without it. Our lane's prompts carry the
   evidence block (`EVIDENCE_LABEL`, and the `drops-evidence` control arm measures what happens when
   they do not), so our rows sit in the conditioned band — the comparison is like-for-like on that axis,
   and it should be stated every time the number is.

**What this changes about our own claims, none of it a retreat.** The BIRD row stays where it is: 57.63
dev EX without memory, 56.26 with, both measured on a pinned corpus with evidence. What changes is the
resolution language — the memory arm's −1.37pp is inside the annotation noise of the slice, exactly as
R61's +14.04pp τ² measurement is inside its own confidence interval at 57 pairs. Two independent
evaluations, one conclusion: **this lane's remaining lever is not the size of the effect but the
precision of the instrument**, and that is why the next four dispatches are instrument rounds.

## The poison is graded, and the write path only filters the easiest grade (2026-11-09)

Three 2026 sources arrived after R57's three arms read, and each one describes a shape our own
measurement has a number for. They are recorded here because they change the *ranking of the remaining
work*, not because they change any row we have published.

**MemPoison (arXiv 2607.14651, 2026) turns "poisoning" into a ladder, and the ladder is the finding.**
The attack is graded by how much inference the stored falsehood demands of the reader:

| grade | what is planted | what a reader has to do | activation after a write-time consistency check |
| --- | --- | --- | --- |
| L1 | a false fact, directly stated | repeat it | **≈5%** |
| L2 | two true facts whose combination is false | combine them | **≈23%** |
| L3 | a rule that is conditionally true and generally false | apply it outside its condition | **≈28%** |

The write-time consistency check is the defence every serious memory layer ships — Mem0's
`ADD`/`UPDATE`/`DELETE`/`NOOP`, Zep's bi-temporal invalidation, our own `admission` and credit
assignment. MemPoison's contribution is to price it: **it removes one grade out of three.** A check that
asks "is this consistent with what I already hold" can reject a claim that contradicts the store; it
cannot reject a claim that agrees with the store and is wrong in combination. L2 and L3 survive because
they are, item by item, true.

That is the same asymmetry R57 measured from the other end, and the numbers line up in an uncomfortable
way:

| R57 arm | what was planted | excess loss | MemPoison grade it corresponds to |
| --- | --- | --- | --- |
| `far` | rules from unrelated domains | **+0.00pp** | none — a true rule applied where it does not apply is L3, but a rule with no occasion is inert |
| `near` | rules from the same domain, correct ones | **−3.51pp** (repaired more than it broke) | L1 reversed — a true and relevant rule |
| `adversarial` | rules that contradict the episode | **+7.02pp** | L2/L3 — the rule agrees with the store and is wrong here |

**Proximity cost nothing; contradiction cost 7pp.** MemPoison's ladder says why, and says something we
had not stated: the reason `near` was free is not that near rules are harmless, it is that a rule which
*agrees* with the episode is doing the same job as the context and the reader can ignore it. The
expensive rule is the one that is consistent with the store and inconsistent with the episode —
MemPoison's L2, our `adversarial`. **Write-time consistency is structurally blind to exactly the grade
that costs the most**, and no amount of retrieval-distance tuning reaches it, because distance is a
property of the request text and the band rate was identical across polarities (35.4% vs 37.3%, 1.8pp
apart).

**GhostWriter / AM-Sentry (arXiv 2607.06595) prices the other half.** Injection succeeds ~98% of the
time, activation ~60%: **roughly two in five planted memories are never used even when they are there.**
The defence it proposes is two-stage — a severity-tiered write admission, then a retrieval-time screen —
which is the same shape as our `admission` parameter plus the condition-carrying rule (`V12`, 100% of
2,691 injected rules carried a `when` in R37). The number worth carrying forward is the 60%: our own
arms measure *excess* loss conditional on injection, and never ask how often a rule was consulted at all.
A store can be 7pp harmful per *use* and harmless per *task* if the use rate is 20%, and nothing in our
artefacts separates those. That separation is now on the roadmap as a first-class measurement rather
than an inference.

**InMind's blind spot is the one our own data already has, in a worse form.** InMind reports that a
directly-queryable memory reaches ~100% while an implicitly-associated one reaches 14.4% — the memory
is there and the query does not name it. Our retrieval-relevance panel from R26 measures something
adjacent and, read correctly, more alarming:

| pack served | questions | accuracy with memory | accuracy without | delta |
| --- | --- | --- | --- | --- |
| on-topic (the pack matches the question) | 663 | 50.98% | 52.19% | **−1.21pp** |
| off-topic (the pack does not match) | 871 | 60.28% | 61.77% | **−1.49pp** |

The absolute gap between those two rows (50.98 vs 60.28) is **not** a memory effect and reading it as
one is the trap: on-topic packs are served on the questions that *need* a rule, and a question that needs
a rule is a hard question. The effect is the delta column, and the deltas are the same (−1.21 vs −1.49,
0.28pp apart, both inside a 1.96pp minimum detectable difference). So on this slice **retrieval relevance
predicts difficulty, not harm** — and InMind's blind spot, "the memory is not reached", is not the failure
mode we have. Ours is "the memory is reached and does not help", which is the mode MemPoison's L2 predicts
and the mode a relevance-filtered retriever cannot fix.

**What this changes in the table above.** Nothing in the ranking; one row in our own pair:

| rank | system | test EX | dev EX |
| --- | --- | --- | --- |
| — | microglia, no memory (BIRD dev, 1,534 q) | — | **57.63** |
| — | microglia, memory arm (BIRD dev, 1,534 q, best published reading) | — | **57.76** |

57.76 is R37's `lexicon-grain` arm, whose own baseline on the same folds was 57.04 (−0.72pp lower than
the 57.63 read elsewhere, a seed-and-prompt difference between artefacts, not a difference in the
system). **The two rows cannot be subtracted from each other**: the paired delta inside R37 is
**+0.72pp, 95% CI [−0.85, +2.28], p = 0.41** — the first memory-arm reading in this repository that is
not negative, and still not distinguishable from zero. Stated as a rule for this table: a row quotes the
arm and its own control from the same artefact, and a cross-artefact difference is a difference between
two instruments.

Three sources, one sentence, and it is the same sentence R57 arrived at: **the defect is not that memory
is stored, retrieved, or near — it is that a stored claim and the episode can disagree, and every
mechanism the field ships checks the store against itself.** The next experiment this suggests is a
write-time **contradiction** gate as opposed to a consistency gate — checking a candidate rule against
the episode's own trace rather than against the other rules — and it is registered as the round after
R62, because it is the one mechanism none of the three sources above has an implementation of.

## The denominator: 43% of questions never see the rule (2026-11-09)

Every memory ablation in this repository — and, as far as the sources above show, every ablation in the
field — publishes a delta over **tasks**. A delta over tasks divides by the number of questions asked.
The memory was consulted on the number of questions where it changed the answer, and the gap between
those two denominators is measurable from artefacts that were already committed: the harness writes both
SQL strings per case, so an identical pair is a question on which the pack changed nothing observable.

| artefact | n | identical SQL | changed | won / lost | delta per task | delta per change |
| --- | --- | --- | --- | --- | --- | --- |
| `poc-sota-bird-dev` | 1534 | 680 (44.3%) | 854 | 47 / 68 | −1.37pp | **−2.46pp** |
| `R24-dev-split` | 1534 | 662 (43.2%) | 872 | 64 / 73 | −0.59pp | **−1.03pp** |
| `R26-channels` | 1534 | 657 (42.8%) | 877 | 67 / 62 | +0.33pp | **+0.57pp** |
| `R37-lexicon-grain` | 1534 | 666 (43.4%) | 868 | 78 / 67 | +0.72pp | **+1.27pp** |

Four artefacts, four configurations, and the inert share lands in a **1.5pp window (42.8–44.3%)**. That
stability is the reading: it is not a property of a prompt version or a lexicon, it is a property of
what a 1.9-rule pack can do to a text-to-SQL decoder.

**This is the same quantity AM-Sentry reports as ~60% activation, measured a different way.** Their
number comes from whether a planted memory was used; ours comes from whether the output moved. 56–57%
effective here against ~60% there is close enough that the two are plausibly the same phenomenon, and
they are independent instruments. The consequence for every table in this repository is arithmetic:
**the per-task column understates what the memory does when it acts by a factor of 1/0.566 ≈ 1.77.**

**The bound's direction matters, and it is stated rather than implied.** Identical text proves the
memory did nothing on that question. Differing text does **not** prove it did something — the decoder
may have sampled differently — so `inert_share` is a lower bound on not-using and `effective_share` an
upper bound on using. This is a denominator, not an attribution, and it is implemented as such
(`eval/verifiers/use_rate.py`, registered in `pnpm eval:verifiers`).

One structural assertion rides with it, and it is graded before any share is printed: a question whose
two SQL strings are identical must carry the same verdict on both arms. If it does not, the artefact's
`predictedSql` and its `correct` are describing different runs, and no rate computed over them means
anything. The state is `INCONSISTENT` and the fixture that reaches it is a two-row artefact that
contradicts itself — a check that cannot be shown to reject is not a check.

**What it changes about our own claims.** R57's 7.02pp for `adversarial` is a per-task number on a
τ-bench population where the injected rule is in every served request by construction, so its
denominator is 100% and the correction factor for that arm is 1.0 — the arm is not affected. What is
affected is the BIRD lane: the +0.72pp that made R37 the first non-negative memory arm is +1.27pp per
change, and the −1.37pp that every earlier table quoted is −2.46pp per change. **Neither reading is
wrong and the second is the one a mechanism comparison should use**, because a competitor's activation
rate is not ours and dividing by tasks silently assumes it is.

## What the top four actually do, and which parts are cheap to copy (2026-11-09)

The gap that matters in this file is 78.49 against 57.63 on BIRD dev. It is worth stating plainly
what fills it, because the answer is *not* "a better memory" and pretending otherwise would cost
another month:

| rank | system | dev EX | test EX | the mechanism it is known for |
| --- | --- | --- | --- | --- |
| 1 | AskData (AT&T) | 78.49 | 83.40 | automatic metadata extraction: database profiling summarised by an LLM into field descriptions, plus **SQL-first schema linking** |
| 2 | GrainSQL (Purdue) | 77.77 | 82.95 | not published at time of reading; leaderboard entry only |
| 3 | DataGallery (Huawei) | 78.10 | 82.39 | a **semantic layer / data manual** built offline, dynamic schema linking (99.1% column recall), multi-path generation with confidence-based selection |
| 4 | SiriusAI-SQL (Tencent) | 77.77 | 82.28 | leaderboard entry only |
| — | microglia, no memory | 57.63 | — | DDL + evidence, one candidate, lexical linker |

**AskData's ablation is the single most useful number in this file.** On BIRD MiniDev, with no oracle
hints (arXiv 2505.19988):

| metadata supplied | accuracy |
| --- | --- |
| the benchmark's own human-written metadata | 59.6 |
| **automatically profiled and LLM-summarised field descriptions** | **61.2** |
| both fused | **63.2** |

So *"replace the human metadata with profiled metadata"* is worth **+1.6pp** and *"add it to what you
already have"* is worth **+3.6pp**. Everything above 63 is something else, and the paper says what:
its second mechanism is a **SQL-first schema linker** — generate candidate SQL over several schema
variants, collect the columns and literals the SQL actually references, match question literals to
fields by locality-sensitive hashing over sampled values, and revise the SQL when a literal is
unmatched. The stated reason is task alignment: *LLMs are reliable at writing SQL and unreliable at
direct schema selection.*

**What that means for us, component by component.**

| component | AskData / DataGallery | microglia today | cost to copy |
| --- | --- | --- | --- |
| schema pruning | model-guided, SQL-first, 99.1% column recall reported | **lexical, deterministic** (`schema-link.ts`) — prunes on token overlap, declines when nothing matches | **+0 calls** for the first pass (reuse the SQL we already generate), +1 call per unmatched literal for the revision |
| field semantics | profiled statistics → LLM summary, offline, per database | none — we ship raw DDL | one-time, ~1 call per column, cacheable, **amortised to zero** over a benchmark |
| candidate generation | multi-path (few-shot, skeleton-first, self-reflection) + confidence selection | **one candidate** in the published arm; sample-N exists behind `SOTA_RESAMPLES` | **×3–5 calls** — directly opposed to the cost reduction this week is about |
| external knowledge | evidence oracle used by every row above 67.41 | evidence used (`evidenceBlockOf`) | already paid |
| the store itself | static data manual, rebuilt when the schema changes | **online, distillable, invalidatable, episode-traced** | already ours |

**The ordering that follows is not the ranking.** Reading the table by "what does this cost per call"
rather than by "what does this gain per paper" gives a different sequence, and it is the one that fits
a budget:

1. **SQL-first linking** (zero extra calls on the common path). We already generate a SQL. Every column
   and literal in it is a free supervision signal about which part of the schema the question needed,
   and the current lexical linker throws that signal away. This is also the one place where being
   *behind* is cheap to fix: the mechanism is described, it needs no model training, and the first
   pass costs nothing.
2. **Profiled field descriptions, stored in microglia** (one-time, then amortised). This is where the
   product claim and the literature point at the same thing from opposite ends: AskData builds a static
   manual offline, and our whole thesis is that such knowledge should be *distilled, attributed and
   retractable*. Copying their pipeline and putting its output through `admit`/`curate` would test the
   thesis on the one workload where a static manual is the incumbent.
3. **Multi-candidate selection** — last, and only for a submission run. It is worth a few points and it
   multiplies the bill, and a repository that just spent a day finding out what its bill was should not
   buy points with the thing it just learned to measure.

**One honest bound.** AskData, DataGallery and the rest run on GPT-4o-class backbones with the oracle
evidence. Part of the 21pp is the model, not the method, and no amount of schema linking closes a
backbone gap. The rows above should be read as *"these components are worth this much on a fixed
backbone"*, which is exactly why the ablation numbers — 61.2 against 59.6 — are the ones quoted rather
than the leaderboard positions.

## Where the gradient actually is: 33pp of hint, and one point of us (2026-11-09)

Every number below was already in a committed artefact. Reading each artefact's `arms` field — 63
paired readings over 30 artefacts — turns the leaderboard gap from an argument about mechanisms into an
error budget.

| arm | what it changes | delta | p | n |
| --- | --- | --- | --- | --- |
| `oracle` | the true table set instead of a link | **+33.14pp** (50.00 → 83.71) | 2.4e-35 | 350 |
| `full-noevidence` | the prompt without BIRD's evidence hint | **−16.30pp** | 1.4e-44 | 1534 |
| `none-noevidence` | no memory and no evidence | **−17.01pp** | 1.1e-41 | 1534 |
| **`linked`** | **schema linking, as implemented** | **−9.58pp** | **6.4e-21** | **1534** |
| `full-verified` | a second-pass verification prompt | +5.71pp | 1.2e-03 | 350 |
| `values` | column value annotations | +5.43pp / +0.85pp | 4.3e-03 / 0.34 | 350 / 1534 |
| `full-transferred`, `full-anchored` | pack position, anchoring | +4.29 to +4.57pp | ≤1.7e-02 | 350 |
| `gated` | the distiller's admission gate | +0.29pp | 1.0 | 350 |

**The first two rows are one finding seen from both ends.** BIRD ships a human-written hint with every
question; every leaderboard row above 67.41% uses it; giving the model the *true table set* instead of a
retrieved one is worth 33pp, and removing the hint costs 16–17pp. So the benchmark's own supervision is
worth more than an order of magnitude more than anything this project has built — and that is not a
criticism of the project, it is a statement about what the remaining 21pp between us and fourth place is
made of.

**The third row is a regression, and it is the mechanism the field prices highest.** MCS-SQL reports
+2.1 points from schema linking with the same backbone. Here it is −9.58pp at p=6.4e-21, with 202
questions broken against 55 repaired, and the artefact carries the mechanism of the failure: errors
where a gold table is absent go from 107 to 291 and 44 predictions lose their `FROM` entirely. A
pruner that removes a table the answer needs cannot be rescued by the model, because the model writes a
query over what it can see.

| what the top four do | what it costs | our measurement of it |
| --- | --- | --- |
| schema linking (AskData: **SQL-first**, generate then inspect the SQL's own references; DataGallery: 99.1% column recall) | free on the common path | **−9.58pp as a lexical pruner.** The gap is not the idea, it is that ours decides *before* the SQL exists |
| profiled field descriptions (AskData: 61.2 against 59.6 human, 63.2 fused) | one-time, amortised | `values` is the cheap half of it: +5.43pp on 350, **+0.85pp on 1,534** |
| multi-path candidate generation + confidence selection | ×3–5 calls | `full-sampled` +0.86pp, `gated` +0.29pp — not the constraint at this size |
| evidence / oracle hint | already paid by the benchmark | **the whole gradient** |

**So the ordering that follows is not the ordering of the papers, it is the ordering of the gradient.**

1. **Stop pruning; start verifying.** AskData's linker is SQL-first for a reason we can now state as a
   measurement: a pruner's failure mode is silent and unrecoverable (−9.58pp), while a verifier's is one
   extra call on the minority of questions whose identifiers do not resolve. The next arm is the
   additive form: never drop a table, annotate and order instead, and repair a hallucinated identifier
   rather than hiding the table it belonged to.
2. **Learn the oracle's subset, do not guess it.** `oracle` is +33pp over our best linking attempt on
   the same questions. That gap is supervision we are paying the benchmark for and not using: the gold
   table set of a training question is exactly the kind of artefact `admit`/`curate` exists to hold.
   This is the first arm in this repository whose expected value is measured in tens of points rather
   than single ones.
3. **Field semantics, one-time.** `values` did not replicate at full size, so it is a lead and not a
   result; AskData's ablation says the full version is worth 1.6–3.6pp and is amortised to zero.
4. **Multi-candidate selection last.** It costs 3–5× and the arms measured here say the constraint is
   not candidate count.

**And the honest bound on all of it.** The 21pp to fourth place is not 21pp of memory. On this evidence
it is: a linking mechanism that does not subtract 9.6pp, plus the table-subset supervision the oracle
row says is worth 33, minus the part of that we already get from BIRD's hint. A memory layer that
recovers *some* of the oracle's subset is a plausible 5–10pp; a memory layer that recovers all of it is
a claim the field has not made.

## Schema linking, priced against what the board pays for it (2026-11-09)

The published claims are the ones to beat, and they were made on the same benchmark with the same
kind of model: **MCS-SQL reports +2.1 points from schema linking alone**, CHASE-SQL reports schema
linking among the top causes of failure, and **AskData's SQL-first linker** is the part of its 83.40
dev cell that its own ablation attributes to the mechanism rather than to the model. This round
measured what our ordering can put in front of a reader, without spending a call.

| mechanism | what it does to the prompt | clean orderings | extra calls |
| --- | --- | --- | --- |
| none | the whole schema, declaration order | 0% by construction | 0 |
| lexical anchors — `linked-additive` | names first, two-line header | 42.89% | 0 |
| **retrieved gold tables, k=5** | the tables similar training questions read first | **56.58%** | 0 |
| both, recall first | recall then anchors, then the rest | **56.65%** | 0 |
| reductive linking — `linked` | drops the tables the question does not name | n/a — it removes | 0 |

**The number that matters for comparison: 56.65% is the share of the 1,534 dev questions where an
ordering-only signal can put every table the gold query reads ahead of every table it does not.** It
is not accuracy and it is not comparable to MCS-SQL's +2.1: that is a delta on a *pruner*, and a
pruner's ceiling is bounded by how many questions it can safely drop from, while an ordering signal's
is bounded by how many questions have a table set the question determines at all. Four questions in
ten do not, which is why the honest expectation for the arm is a fraction of the published figure.

What the comparison does establish is the ordering of effort, and it is not the ordering the papers
suggest:

1. **Retrieval beats lexical matching by 13.75pp of orderings, and anchors are then redundant**
   (868 → 869 clean, precision −8.7). AskData arrives at the same place from the other direction — it
   starts from the SQL and matches literals to fields, rather than matching question words to table
   names — and this reading is the cheapest independent confirmation of that choice.
2. **A pruner has no safe threshold on this benchmark.** `linked` measured −9.58pp at p=6.4e-21 with
   202 questions broken, and this round's parser fix means it now prunes on three more databases,
   so the reading was measured on a *less* aggressive pruner than the code now is.
3. **The oracle row is still the largest gap**: `oracle` +33.14pp against every product arm under one
   point. A table set is the cheapest lawful approximation of it, and retrieval is how the training
   split's table sets become usable on a test question.

**Where microglia sits, unchanged and honestly.** BIRD dev 57.63% without memory, 57.76% with it
(paired +0.72pp, [−0.85, +2.28], p=0.41); the 2026-11-09 scheduled run read **53.14% against 51.71%
on the 350-question minidev slice, −1.43pp**, which is the third population in which the memory
contribution is indistinguishable from zero. The board's top four — AskData 83.40, GrainSQL 82.95,
DataGallery 82.39, SiriusAI-SQL 82.28 — are 25 points away, and every one of them is above the
67.41% line where BIRD's evidence hint stops being the dominant term. **The memory layer is not what
closes that gap this round; the instrument that can finally see the gap is.**

## What a reordering is worth, and what the board pays for a pruner (2026-11-09)

The published claims about schema handling are all about *pruning*: MCS-SQL reports +2.1 points from
schema linking alone, CHASE-SQL attributes nearly half its failures to it, AskData's SQL-first linker
is what its own ablation credits for part of its 83.40 dev cell. This project measured that a pruner
has no safe threshold on BIRD — `linked` reads **−9.58pp at p=6.4e-21**, 202 questions broken against
55 repaired, with gold-table-absent errors going 107 → 291 — and turned to the additive form instead.

The additive form's ceiling is now measured, at zero model calls, and the arm that reaches it is in
the air:

| mechanism | what it does to the prompt | clean orderings | tables lost | extra calls |
| --- | --- | --- | --- | --- |
| none | the whole schema, declaration order | 0% by construction | 0 | 0 |
| `linked` (published-claim analogue) | drops the tables the question does not name | n/a — it removes | 202 questions broken | 0 |
| `linked-additive` | names first, two-line header | 42.89% | 0 | 0 |
| **`recall-order`** | **the tables similar training questions read first, anchors after** | **56.65%** | **0** | **0** |
| reductive + retrieval | prune to the retrieved set | not measured | unbounded | 0 |

**The comparison worth making is between two ceilings, not two deltas.** A pruner's ceiling is
bounded by how many questions it can safely drop from; an ordering's is bounded by how many questions
have a table set the question determines at all. On BIRD dev that second bound is **56.65%** — four
questions in ten have gold tables no table-set signal determines — which is why the honest expectation
for the arm is a fraction of the published +2.1 and why the dispatch is registered at a 6pp
resolution rather than a 2pp one.

Three things the free measurement settled in the comparison's favour, none of which needed a call:

1. **Retrieval beats lexical matching by 13.75pp of orderings** [+10.30, +16.88], p < 1e-4. AskData
   arrives at the same place from the other direction — start from the SQL, match literals to fields
   — and this is the cheapest independent confirmation of that choice.
2. **Anchors are nearly redundant once recall is present**: 868 → 869 clean questions (+0.07pp) while
   precision falls 8.7 points. The signal ships recall-first with anchors as the fallback for what
   retrieval cannot serve, which is what the arm does.
3. **Ordering cannot lose a table, so its failure mode is a reader ignoring a comment** rather than a
   query that cannot be written. That asymmetry is the whole reason the additive line survives a
   −9.58pp pruner reading and the pruner does not.

**Where microglia sits, and it has not moved yet.** BIRD dev 57.63% without memory, 57.76% with it
(paired +0.72pp, [−0.85, +2.28], p=0.41); the 2026-11-09 minidev run read 53.14% against 51.71%
(−1.43pp). The board's top four are AskData 83.40 (dev 78.49), GrainSQL 82.95 (77.77), DataGallery
82.39 (78.10) and SiriusAI-SQL 82.28 (77.77), against a human ceiling of 92.96; all four sit above the
67.41% line where BIRD's evidence hint stops being the dominant term in the prompt. The gap is 25
points. An ordering arm cannot be the mechanism that closes it: its entire budget is the 56.65% of
questions a table set determines, and on the other 43.35% it does nothing at all — which is why the
next two priorities are a retrieved-exemplar arm and field-description distillation rather than a
better ordering signal.

## The published record measured the same thing, and it says the lever is somewhere else (2026-11-09)

Three papers bear directly on what this project has spent four rounds measuring, and they were read
after the arm was built rather than before, which is why they are recorded as a check rather than as a
justification.

**arXiv:2606.29733 — on-prem open models, BIRD dev, paired McNemar across three families.**

| recipe | effect | significance |
| --- | --- | --- |
| schema linking, lexical | **−1.56pp** | p = 0.035 |
| schema linking, embedding at 96.5% gold-table recall | indistinguishable from none | n.s. |
| self-correction (feed back the execution error, revise) | **+3.06pp / +3.65pp / +1.04pp** across CodeLlama-7B, Llama-3.1-8B, Llama-3.3-70B | p = 2e-11, 6e-11, 0.08 |
| self-consistency, m=5 | +0.13pp for ~5× tokens | p = 0.86 |

Three things follow, and two of them are uncomfortable for this repository's own plan.

1. **Our `linked` reading is the same sign as theirs and an order of magnitude larger** (−9.58pp versus
   −1.56pp). The difference is mechanism, not disagreement: their pruner keeps the tables a retriever
   scores highly, ours closes over join keys and prunes whenever a third of the schema is untouched,
   and the error taxonomy says 291 gold-table-absent errors against 107. Two independent
   measurements agreeing on the sign is the strongest evidence this project has that schema linking is
   not the lever — stronger than any single arm here.
2. **They measure a null for embedding linking at 96.5% gold-table recall, and our ceiling says why
   that had to be the answer**: 56.65% of BIRD dev can be ordered cleanly at all, and ordering is the
   *weaker* intervention. A mechanism whose input is right 96.5% of the time and whose output still
   moves nothing is a mechanism operating on a channel the model does not use.
3. **The reliable lever in their ablation is one this repository has measured once and cannot
   quote.** `retry-blank` *is* self-correction with no memory — the retry prompt carries the failed
   attempt and the execution error and an empty pack — and R17 records it at **+0.57pp, 2 gained and
   0 lost**. That reading is not quotable: it was taken at a scale nobody registered, and no artefact
   in this repository or its history contains it, so by the standard `power.py` and `arm_ablation`
   enforce it is a number in prose. The cell is not empty; it holds a measurement whose evidence is
   gone.

   The size difference has a cause and it is worth naming rather than excusing: their +3pp is measured
   on open-weight models at 21–50% execution accuracy, and their own text says self-correction gains
   "wherever models have headroom". At 53% on minidev this lane's model has less of it. So the
   published effect and ours are not in conflict — they are the same mechanism at two operating
   points, and the honest expectation for a re-measurement here is a small positive, not +3pp.

**arXiv:2606.03145 — schema representation as the intervention.** Abstraction, partitioning and
renaming of the schema give **+2.6 to +4.2pp** on BIRD-Union, complementary to few-shot retrieval, with
renaming lifting table-set match from 64.7% to 94.1%. It also supplies a scale fact: BIRD databases
average about 40 tables, while a typical question touches **2.4**. Our own measurement has the same
shape — 4.88 tables moved per question, mean depth 43% of the schema — which says the head of the
prompt is a third of the schema rather than a tenth of it.

Ordering is the weakest member of that family: it renames nothing, adds no views, and only permutes.
So the published +2.6 to +4.2pp for the family is an upper bound that R63 is *not* entitled to, and a
null from R63 must not be read as a null for representation-level interventions in general.

**CT2S (Neurocomputing, 2025)** reports that 74% of Spider samples mention schema items in the same
order the SQL uses them, and gains >2% from sequential-consistency prompts built on that. So the
ordering hypothesis has published support on Spider; R63 is the BIRD test of it, with a measured
ceiling rather than a hoped-for one.

**What this changes about microglia's position.** The board is unchanged — AskData 83.40 (dev 78.49),
GrainSQL 82.95, DataGallery 82.39, SiriusAI-SQL 82.28, human 92.96, microglia dev 57.63/57.76 — and
what the literature adds is not a number but a diagnosis: **25 points are not in the memory layer and
are not in schema linking either.** They are in what the pipeline does with a wrong answer.

## The board pays for schema linking less than the papers do, and now we can price it (2026-11-09)

R63 is the first arm in this repository whose effect can be divided by a measured signal improvement.
The published record says lexical schema linking on BIRD dev is worth **−1.56pp (p = 0.035)** and that
embedding linking, at 96.5% gold-table recall, is **indistinguishable from not linking**
(arXiv:2606.29733). This repository's own numbers, in order of increasing aggression:

| treatment | tables removed | accuracy effect | source |
| --- | --- | --- | --- |
| order by retrieved gold tables | none | **+0.86pp** [−1.43, +3.14] | R63, n=350 |
| order by named tables (`linked-additive`) | none | **+2.00pp** [−0.29, +4.29] | R63, n=350 |
| prune to named tables (`linked`) | most | **−9.58pp** | R26, n=350 |

Three points, one monotone story that matches the literature: **the more a linker changes what the
model can see, the worse the model does, and ordering — which changes position only — is the one
variant that never hurts.** The board's leaders do not win on schema linking; they win on execution
feedback and on ensembles of generation. That is where the 33pp sits.

What R63 adds that the papers do not have is the exchange rate. The ordering signal improves the
strict table-ordering criterion from 42.89% to 56.65% of dev questions — **+13.75pp** [10.30, 16.88],
p < 1e-4 — and converts to +0.86pp of accuracy. A signal-to-accuracy rate of about **6%** on this
benchmark, measured rather than assumed. Any competitor comparison that quotes a schema-linking
improvement has to be read through that rate unless it also reports accuracy on the same split.

The other side of the same ledger is where the errors are. Of the 89 dev questions whose first attempt
returned no rows, **54 read exactly the right tables** and **32 filter on a value the database does
not spell that way**. The published diagnosis of BIRD-style errors is the same shape: the binding step
is mostly values and column semantics, not table discovery, and a database with ~40 tables per schema
answers a typical question from **2.4** of them. Our measurement says the remaining error mass is on
the value side, which is where the `values` arm (+5.43pp at n=350) already sits — and where the next
registration goes.

## The retry is real, it is small, and its ceiling is its population (2026-11-10)

R64 is the first time this repository has measured a retry arm on an artefact. The number it replaces
was prose: `retry-blank` was quoted at **+0.57pp with 2 gained and 0 lost** since R17, and
`grep -rl retry-blank eval/results/` returned nothing. What the run says, on 1,534 BIRD dev questions
for $0.44:

| reading | value |
| --- | --- |
| population the arm may touch | **98 / 1,534 = 6.39%** (`empty` 88, `error` 10) |
| repaired | **20 / 98 = 20.41%** [13.27, 28.57], p = 1.9e-06 |
| whole-benchmark delta | **+1.30pp** [+0.78, +1.89], 20 gained / 0 lost |
| ceiling if the arm repaired everything | **+6.39pp** |

Beside the published retry rows this is the smallest effect of its family, and the reason is
structural rather than a difference in mechanism quality. arXiv:2606.29733 reports **+3.06pp**
(p = 2e-11, CodeLlama-7B) and **+3.65pp** (p = 6e-11, Llama-3.1-8B) for a retry that carries the
failed attempt and the execution error. Those models sit far below this one on the same benchmark, so
their *population of rejected questions* is far larger: an arm that repairs a fifth of its population
moves a 30%-accurate model by six points and a 57%-accurate model by one. The practitioner claim that
a retry loop is worth "+5–10% with two or three attempts" is the same arithmetic read from the other
end — it is a statement about models with headroom, and it is not transferable as a constant.

The number that travels is the **conditional** one: 20.41% of what the pipeline rejects, repaired, with
nothing regressed. That is directly comparable to any competitor's per-failure reading and it does not
depend on the model's baseline accuracy.

## What the exemplar literature predicts, including the part that predicts harm (2026-11-10)

R65 buys the cheapest lawful approximation of `oracle` (+33.14pp): the three nearest training
questions of the same database, each shown with its gold query, under a 1,200-character budget equal
to `full`'s pack. Two published lines bear on it and they disagree, which is why it is a registration
rather than an assumption.

| source | population | published effect | what it implies here |
| --- | --- | --- | --- |
| DAIL-SQL (arXiv:2308.15363, VLDB 2024) | BIRD / Spider, GPT-4 | 86.6% EX Spider; 5–10 curated examples close much of the gap to fine-tuning | exemplars are a first-order lever, not a cosmetic one |
| CHESS (arXiv:2405.16755) | BIRD, GPT-4 | ≈73% EX, and value retrieval is the load-bearing step | matches our 36% value-miss share in empty results |
| DPC (arXiv:2604.15163, ACL 2026) | BIRD, Qwen2.5-Coder-7B | DAIL-SQL+SC **48.6%**, CHESS+SC **66.2%**, XiYanCoder-7B **53.0%** | the prompting band on this benchmark is 48–66%; our `none` is 56.71% and `retry-blank` 58.02% on a different backbone |
| From Harm to Help (arXiv:2509.23196) | reasoning LLMs, CoT demos | **more exemplars consistently degrade accuracy**, even when the demos are optimal; mechanisms are semantic misguidance (verbatim copying) and strategy-transfer failure | predicts that k = 3 is worse than k = 1 for this arm, and names the failure mode to look for |
| RAG as noisy ICL (arXiv:2506.03100) | theory + QA corpora | an **intrinsic ceiling** on RAG generalisation that ICL does not have; more retrieved passages can degrade | the formal version of the 6% signal-to-accuracy rate R63 measured |
| RAGuard (arXiv:2502.16101, NeurIPS 2025) | fact checking, 8 models | misleading retrieval costs **−46.5% relative** on average; every model falls below 50% | our `wrong-scope` arm is the same manipulation at a smaller dose |

Three of those rows are the negative-effect literature this project keeps being asked about, and they
now have a measured analogue here: **a retrieval channel is not free, its dose is not monotone, and
the harm is produced after retrieval rather than by it** (L.26). The exemplar arm is the cleanest test
of that in this record because its content is a *correct* query: if k = 3 lands below k = 1, copying is
the mechanism and no amount of example quality fixes it.

The leaderboard position, stated plainly: on BIRD dev this lane's prompting-only numbers (56.71%
`none`, 58.02% `retry-blank`) sit inside the published band for prompting systems on a mid-size
backbone and well below the two-digit gap that CHESS's multi-agent pipeline and execution-guided
ensembles open (66–78%). The gap is not in the prompt and not in the schema text — R63 priced that at
+0.86pp against a +13.75pp signal — it is in **generation and selection**, which is where the next
registrations after R65 go.

## The exemplar row, measured: +5.43pp, and it is not where CHESS's 20 points come from (2026-11-10)

R65 put the exemplar arm on minidev for $0.12 and it is the only prompt-content arm in this record to
leave single digits:

| arm | accuracy | delta vs `none` | delta vs `full` | gained / lost |
| --- | --- | --- | --- | --- |
| `none` | 51.14% | — | — | — |
| `full` (memory pack, mean 1,085 chars) | 50.86% | −0.29pp [−3.14, +2.57] | — | 13 / 14 |
| **`examples` (3 gold-SQL exemplars, mean 993 chars)** | **56.57%** | **+5.43pp [+1.43, +9.43]**, p = 0.0127 | **+5.71pp [+1.71, +9.71]**, p = 0.0078 | 36 / 17 |

Read against the published rows this is the right order of magnitude and the wrong sign of conclusion
for anyone hoping exemplars are the missing 20 points:

- DAIL-SQL's case for exemplar selection is a *floor* argument (5–10 curated examples close much of the
  gap to fine-tuning on Spider), not a claim that examples add 20 points to a strong prompting baseline;
- CHESS's 66.2% on BIRD with Qwen2.5-Coder-7B comes from **candidate generation plus unit-test
  verification**, not from its retrieval step; its own ablations put the exemplar/schema-retrieval
  contribution in the single digits;
- and our arm is length-matched to the memory pack (993 vs 1,085 characters), so the +5.71pp against
  `full` is a comparison of *content at equal budget*, not of budget.

The honest summary for the board: on BIRD dev this lane now sits at **56.57%** with a single
deterministic prompt plus three retrieved examples, inside the 48–66% prompting band and about ten
points under the multi-candidate pipelines. The remaining gap is selection over generated candidates —
the thing `sample-*`, `pool.ts` and `prior.ts` exist for and have never been pointed at this split.

One caveat this record now insists on (Rule 13): the same arm measured **+5.43pp**, **+3.14pp** and
**+2.86pp** on three dispatches, and the controls moved by up to 3.14pp between them. Pooled over the
three valid runs the arm is **+3.81pp** (95 gained / 55 lost, n = 1,050, exact p = 0.0014) and
**+4.28pp** against the memory pack, which is null on all three. The row above therefore stands at
≈ **56%** with the honest interval, and the closing rule R65 registered before those runs — a pooled
estimate inside ±4pp closes the line — is what the pooled number triggered.

## What a 7B model with somebody else's scaffold is actually saying (2026-11-10)

The question that keeps arriving, in its strongest form: *Qwen2.5-Coder-7B is a small model, and with
CHESS's pipeline it scores 66.2% on BIRD dev against our 58.02%. Shouldn't we be learning from it?*

Yes — and the arithmetic below says **what** to learn, because the 7B is not the part that wins.

| row | backbone | scaffold | BIRD dev | calls per question |
| --- | --- | --- | --- | --- |
| DAIL-SQL + SC | Qwen2.5-Coder-7B | few-shot prompt, self-consistency | 48.6% | ≫1 |
| XiYanCoder-7B | Qwen2.5-Coder-7B, SQL-tuned | prompting | 53.0% | 1 |
| **CHESS + SC** | Qwen2.5-Coder-7B | schema/value retrieval + up to 5 candidates + unit-test selection + revision | **66.2%** | ~10 |
| this lane, `retry-blank` | `deepseek-flash` | one prompt, one draw, one repair attempt on reject | **58.02%** | 1.06 |
| this lane, `oracle` (ceiling, not deployable) | `deepseek-flash` | the item written for this question | +33.14pp over `none` | — |

Read down the backbone column: at a **fixed model** the scaffold is worth **+17.6pp** (48.6 → 66.2).
Read across the scaffold row: at a **fixed scaffold class** our single draw is **+9.4pp ahead** of
their single draw (58.02 against 48.6). Both statements are true and the second is the one that
usually goes missing. "A 7B beats us" is a claim about CHESS's three stages, not about the 7B.

### The three stages, and what this record already knows about each

| CHESS stage | what the literature says it is worth | what this record has measured |
| --- | --- | --- |
| **value retrieval** (LSTM index over column values, exact string match into the prompt) | CHESS calls it the load-bearing step; its own ablation is the one that hurts most | our empty-result taxonomy puts **36%** of empty executions on a value that was spelled differently in the database; R66 prices the fix at **98 calls** |
| **candidate generation** (up to 5 draws at non-zero temperature) | CHESS's pool is where its 17.6 points start | `oracle` **+33.14pp** says the pool's ceiling on this lane is enormous; R67 measures whether five draws reach it |
| **unit-test selection + revision** | the difference between CHESS and DAIL-SQL on the same 7B | XiYan-SQL's selection model is **−2.74 EX when removed**; GradeSQL's outcome-reward ranking beats execution-based Best-of-N by up to **+4.33**; our own attempt at letting a model compare two result sets read **−1.14pp**, which is why `exec-signature.ts` compares shapes instead of asking |

That last row is the honest part of the answer. We have already read their code and tried their
ideas: the model-comparison selector failed here, the execution-order signal converted at +0.86pp
against a +13.75pp retrieved signal, and `linked` pruning lost 9.58pp. What has never been tried is
the stage CHESS says matters most, at the width CHESS uses — and that is a registration problem, not
a reading problem.

### Why the published gap still cannot be attributed

Three variables move between those rows at once — backbone, scaffold, judge — so three explanations
are live: **scale** (stronger model, weaker scaffold, net −8.2), **scaffold** (the 17.6 points are
the mechanism), and **baseline** (most of the 17.6 points are what a 48.6% baseline buys, per the
per-failure arithmetic R64 measured: *a fifth of the population is six points at 30% and one point
at 57%*).

The comparable quantity is the **share of the pool ceiling** a selector recovers,
`(exec − first) / (oracle − first)`. R67 measures it on this lane's backbone; R68 measures it on a
second one and reports both. If the share travels, selection is a mechanism and its absolute points
are a function of the baseline. If it does not travel, the published gap is a baseline effect and
the next lever is the ceiling rather than the selector.

**One thing this record will not claim.** That our backbone is "bigger" than a 7B. The provider does
not publish the parameter count of `deepseek-flash`, so the honest statement is only that the two
rows use *different* backbones — which is exactly why R68 exists. A comparison whose scale is
assumed is a comparison whose conclusion is assumed.

## CHESS's selection step is content-aware, and that is why it is worth 17.6 points (2026-11-10)

R67 finally priced the step every published pipeline above us has and this lane did not: choosing
among several generated queries. On 350 questions with 1,750 candidates, five draws at T = 0.7
contain the right answer on **+8.85pp** more questions than the first draw, and the best selector
built from execution **shape** recovers **12.9%** of that — scoring *identically to a random pick*
(`sample-5-exec` 52.00%, `sample-5-random` 52.00%).

The measurement that explains it is the one worth carrying to the board: on the 120 questions where
the draws disagreed, the AUC of all seven shape signals straddles chance.

| signal | AUC [95%] | top-pick rate |
| --- | --- | --- |
| draw-order | 0.510 [0.421, 0.596] | 24.2% |
| null-share | 0.492 [0.457, 0.520] | 25.8% |
| empty | 0.535 [0.510, 0.566] | 24.2% |
| duplicate-share | 0.537 [0.500, 0.578] | 25.8% |
| column-shape | 0.541 [0.500, 0.583] | 25.0% |
| value-type | 0.542 [0.504, 0.582] | 25.8% |
| row-shape | 0.546 [0.494, 0.598] | 25.8% |

This is the difference between CHESS's selector and every shape signal we have. CHESS writes **unit
tests from the question** — "the result must have a column named `County`", "the answer must be one
row" — and executes them against each candidate. Those assertions are *content-aware*: they come from
the question's own vocabulary, not from a property every SQL result has. Shape signals are the
opposite by construction: they are cheap, deterministic and free, and this measurement says they
carry no ranking information on this pool. XiYan-SQL's trained selection model (−2.74 EX when
removed) is content-aware in the same way and costs a model call per comparison; that is the price
the 17.6-point gap actually has.

The consequence for this project is a cost decision, not an architecture one: reaching that band
means paying for a verification call per candidate, which changes the per-question bill by the width
of the pool. R66 (value spellings, 98 calls) and R69 (wider and hotter pools) are what this lane is
buying first, because both are cheaper than that and neither has been priced yet.

## Where this lane stands, 2026-11-10 (BIRD dev, 1,534 questions)

The comparison that survives a changed backbone, a changed judge and a changed scaffold is the one
this file keeps returning to. Stated as plainly as the record allows:

| system | BIRD dev EX | what carries the number | comparable to ours? |
| --- | --- | --- | --- |
| CHESS + self-consistency | **66.2%** | CHESS candidate generation + unit-test selection, Qwen2.5-Coder-7B | no — scaffold and backbone both differ |
| CHESS (paper cell) | 66–78% | the same, at its own SC width | no |
| DAIL-SQL + SC | 48.6% | prompting baseline, same 7B | no — backbone differs, scaffold is a prompt |
| **microglia, single prompt** | **58.02%** | `full`, 1,534 questions, 5-fold cross-fit | — |
| microglia, memory arm (`none` vs `full`) | 56.71 → 56.58% | memory is null on this split (−0.13pp, p = 0.94) | — |
| microglia, best arm on the split | **58.28%** | `retry-values`, +1.56pp, 24 repairs / 0 losses | — |

Three readings, in the order they matter:

**Rank, stated honestly: 2nd of 3 published cells, first among single-pass systems.** This lane sits
**+9.4pp above** the 7B prompting baseline and **−7.9pp below** the 7B CHESS pipeline. The published
SOTA on BIRD dev remains CHESS at 66.2% with self-consistency. The gap is no longer "somewhere in the
scaffold": R67 measured the pool at +8.85pp of ceiling and the shape selectors at 12.9% of it, which
is the 8.2-point arithmetic — CHESS's selection step is **content-aware** and ours is not, and that
difference is priced per candidate call.

**The absolute numbers are not comparable across baselines (Rule 14), and R68 is the test.** Our
58.02% baseline leaves 42pp of headroom; the 7B's 48.6% leaves 51pp entirely. A per-failure mechanism
that repairs a fifth of its population moves a 48.6% model by six points and a 58.0% model by one.
The invariant being measured is the **ceiling share**, not the points.

**The cheapest remaining levers, ranked by measured cost per point.** Value spellings: 3 repairs per
1,534 questions for $0.71 — closed as a line, priced and negative. Pool width: 3,500 candidate calls
for a predicted +3…+11pp of ceiling — R69, in flight. Temperature: 2,450 calls for a predicted
+1…+11pp — R70. Content-aware verification: one call per candidate, the only lever that has been
shown to carry ranking information in a competitor's ablation, and the most expensive.

**What would move us to first.** Nothing in the prompt. The measured path is: a pool that contains
the answer more often (R69/R70), then a selector that can *read* a candidate rather than measure its
shape (CHESS's unit tests, XiYan's trained ranker). The second costs a call per candidate; the first
costs k calls per question. Both are priced above; neither is bought yet.

## The one selection step we never ran: voting (2026-11-10)

Every published pipeline's "+SC" suffix is self-consistency — draw several queries, keep the answer
the most of them agree on. DAIL-SQL+SC and CHESS+SC both carry it, and the 17.6 points between them
and their single-pass cells include whatever it is worth. This lane had never measured it at k = 5:
R67's five arms were `first`, `random`, `exec`, `prior`, `oracle`, and majority was not among them.

It can be computed from R67's recorded pool at zero cost, because the pool stores which draws
executed to the same result. On 350 questions:

| selection | accuracy | vs `first` | share of the 8.85pp ceiling |
| --- | --- | --- | --- |
| `first` | 50.86% | — | — |
| **majority of the largest agreeing group** | **51.71%** | **+0.86pp** | **9.7%** |
| `sample-5-exec` (shape composite) | 52.00% | +1.14pp | 12.9% |
| `sample-5-random` | 52.00% | +1.14pp | 12.9% |
| `sample-5-oracle` | 59.71% | +8.85pp | 100% |

**Voting is worth less than a coin flip's worth of luck, and the reason is the pool, not the vote.**
At T = 0.7 the five draws are near-duplicates: there is usually nothing to vote on, so the mode of
the multiset *is* the first draw most of the time. Self-consistency is not a weak mechanism — it is a
mechanism that needs disagreement as input, and this lane's temperature does not produce enough.

That converts temperature from a curiosity into the gating variable for the one published technique
this project has not adopted. R70 carries `sample-5` for exactly this reason: at T = 1.0, if majority
clears +2pp the mechanism is diversity and voting becomes free accuracy on every future dispatch; if
it does not, voting is dead here and the remaining eight points are a *reading* problem — which is
R71, not another draw.

### The free half of CHESS's selection step, priced at zero

CHESS's contribution to the published stack is a **selection** step, not a generation step: for each
question it writes assertions ("the answer must have a column named `County`") and executes them
against each candidate result. The 17.6 points between DAIL-SQL+SC and CHESS+SC include whatever that
worth. This record could not previously say whether the mechanism was the assertion or the writer.

R71 splits the mechanism and prices the free half. Two deterministic readings of a candidate's content
— the share of the question's content words its **column names** account for, and the share of the
question's **literals** its query writes — over 350 questions × 5 draws, on the same question-clustered
interval every shape signal gets:

| reader | AUC | 95% CI | top-pick gain over the first draw |
| --- | --- | --- | --- |
| `column-mention` | 0.514 | [0.458, 0.571] | +0.00pp |
| `literal-match` | 0.509 | [0.500, 0.524] | +0.29pp |
| `content-mean` | 0.523 | [0.466, 0.583] | +0.29pp |
| shape family's best, for scale | 0.595 | [0.554, 0.640] | — |

**Both are inert, and the reason is the one the shape family already taught.** The property a free
reader can see is shared by every draw of a question: where the columns do mention the question's
words, all five candidates mention them, so nothing is ranked. `literal-match` is constant across the
draws on **342 of 350 questions**; `column-mention` varies on 107. A selector built from a property all
candidates share is not a weak selector, it is a constant.

So the published gap is **the price of reading**, not a signal nobody had extracted: CHESS's assertions
can distinguish because they are written *for this question against these results*. R73 is the
registration that prices exactly that — one model call per question, three executable assertions,
arithmetic per candidate, 350 calls and $0.03 — and its bar is +3pp over the first draw with an
interval that excludes 0.5. If it misses, no per-question reader recovers the gap on this corpus and
the selection line closes; if it clears, the writer is the mechanism and the next registration prices
what the writer needed to know.

### The writer is built, and the three kinds are separable

The table above prices the *free* half of CHESS's selection step and finds it inert. The paid half is
now implemented rather than argued about: `sample-5-assert` asks a model, once per question, for three
executable assertions — a column the result must carry, a literal the query must write, a row count —
and scores every candidate by how many it satisfies. No model grades the candidates; the writer
describes and arithmetic decides, which is the only arrangement under which the arm's number is a
statement about the mechanism rather than about a model's judgement.

What this record can now say that it could not before is **which sentence carries the ranking**. The
reading reports `assertion-column`, `assertion-value`, `assertion-rows` and their sum separately. That
matters because the three are not the same claim: `rows:` is a shape signal this lane priced seven ways
and found inert, `value:` is close to the free `literal-match` that was constant on 342 of 350
questions, and `column:` is the content claim that has never been priced without a model. A winner made
of row counts would say the competitor's gain is not reading at all; a winner made of column names would
say it is, and would locate it.

Cost is the other half of the comparison. CHESS spends its writer per question and its assertions per
candidate; this arm spends 350 calls on 350 questions and executes the assertions in arithmetic over a
pool that was already bought, so the reading costs **$0.03** on top of the dispatch and can be
re-derived from the artefact for nothing. If the arm clears its bar, the gap is a price this project can
pay; if it does not, the gap is not a per-question reader and the selection line closes.
