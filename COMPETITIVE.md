# Competitive anatomy

**What this document is.** A reading of the systems that are ahead of us, at the level of the
mechanism rather than the leaderboard row, and a decomposition of the gap between our baseline and
theirs into components we can each measure on our own protocol.

**What it is not.** A claim that any published number transfers to our setting. Every figure below
sits under a source grade, because three of them are from a paper's own ablation (high), two are from
a leaderboard table read on one day (medium), and several are from a secondary round-up whose primary
table nobody here has opened (low, marked). The project's standing rule holds: a number we have not
reproduced is a hypothesis with a citation, not evidence.

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

| System | Generator | Schema form | Candidates | BIRD dev / test EX | Gap from 53.5 |
|---|---|---|---|---|---|
| **microglia (ours)** | DeepSeek, API | DDL | 1 (+ memory pack) | 53.71 (Mini-Dev, n=350) | — |
| XiYan-SQL baseline | DeepSeek | DDL | 1 | 53.52 (dev, n=1,534) | −0.19 (indicative) |
| XiYan-SQL + M-Schema | DeepSeek | M-Schema | 1 | 55.15 (dev) | +1.63 |
| XiYan-SQL, full | FT + ICL ensemble | M-Schema | 5–21 | 71.58 (dev), 75.63 (test) | +18.06 / +22.11 |
| CHASE-SQL | Gemini 1.5 Pro | DDL + values | 21 (3×7) | 73.01 (dev), 73.0 (test) | +19.49 |
| R³-SQL | undisclosed | — | multi | 75.03 (dev) | +21.51 |
| Databricks RLVR-32B | Qwen2.5-Coder-32B, RL-trained | — | 1 / 7 | 73.56 single, 75.68 (7-SC) test | +20.04 |
| Gemini-SQL2 | Gemini 3.1 Pro | — | many | 80.04 (test) | +26.52 |
| GrainSQL | undisclosed | — | — | 82.95 (test) | +29.43 |
| Human (data engineers) | — | — | — | 92.96 | +39.44 |

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
| BIRD leaderboard rows (82.95 GrainSQL, 80.04 Gemini-SQL2, 92.96 human, 67.41 no-evidence) | bird-bench.github.io, read 2026-10-29 | medium (leaderboards move; the 67.41 threshold is the benchmark's own statement) |
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

Numbers we intend to reproduce ourselves, because they change a decision: the M-Schema delta on
DeepSeek (one arm), the CHASE-style pool ceiling under heterogeneous generators (R7.1), and the
per-signal discrimination of execution signatures (R7.2a).
