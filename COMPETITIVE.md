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

Our BIRD Mini-Dev baseline — DeepSeek, DDL schema, evidence supplied, no memory — is **53.43%
execution accuracy**. XiYan-SQL publishes the same cell: **DeepSeek + DDL schema on BIRD dev =
53.52%**. Two systems, different code, different prompts, 0.09pp apart.

That agreement does two things. It validates our protocol (our number is not an artefact of a badly
built harness), and it localises the gap: **the model is not what separates us from a 73–75% system.
The pipeline is.** Our pipeline is a memory that scores −2.86pp.

| System | Generator | Schema form | Candidates | BIRD dev / test EX | Gap from 53.5 |
|---|---|---|---|---|---|
| **microglia (ours)** | DeepSeek, API | DDL | 1 (+ memory pack) | 53.43 (Mini-Dev) | — |
| XiYan-SQL baseline | DeepSeek | DDL | 1 | 53.52 (dev) | +0.09 |
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

Numbers we intend to reproduce ourselves, because they change a decision: the M-Schema delta on
DeepSeek (one arm), the CHASE-style pool ceiling under heterogeneous generators (R7.1), and the
per-signal discrimination of execution signatures (R7.2a).
