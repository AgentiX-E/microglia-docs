# Retrospection: consolidating corrections into reviewed guidelines

**Status:** designed and built (`packages/core/src/retrospect`, `packages/eval/src/review`),
not yet measured. Two arms are registered at the end of this document; neither has been
dispatched.

**The question.** Every unit this project has stored is a *correction* — one repair record with
the condition it applied under. Six hundred readings later the store is a pile of instances,
and the dose-response is negative: R93's 15 repair records scored **0.700**, R99's 73 records
**0.625**, and the provenance said why (79% of the larger store was pass-derived, each record
carrying the `order_id` of the run that produced it). A *guideline* is the object that drops the
instance and keeps the rule. Does consolidating corrections into guidelines, with a human
approving each one, help — and can it be measured rather than asserted?

---

## 1. The answer, before the argument

**Yes, conditionally, and the conditions are the design.**

Three published results bracket the operation, and between them they forbid the obvious
implementation:

| source | finding | what it forbids |
|---|---|---|
| **ALTK-Evolve** (IBM, 2026-10) | airline: a 14-guideline core at support ≥ 3 scores **45.0** Pass^4 where 101 lossless guidelines score **40.0** | merging without conserving support — the merged object must record how many sources it absorbed |
| **ACE** (Zhang et al., 2025) | repeated LLM rewriting of a context shrank it **18,282 → 122 tokens** with a **−9.6 point** drop; they name it `brevity bias` and `context collapse` | asking a model to "summarise these corrections into guidelines", which is exactly that operation with a friendlier name |
| **AutoGuide** (Fu et al., 2024) | Reddit/WebArena **47.1%** against ExpeL's 21.8% and ReAct's 8.0%; its guidelines are `when [context], do [action]` and are *selected* per step | unconditional rules and a static block of everything — "providing all guidelines degrades performance" |

So the design that follows: **merge without rewriting, keep the condition, conserve the
support, and check the coverage mechanically.**

And a fourth constraint comes from this project rather than from a paper. R101 measured a
**−5.00pp** Pass^4 difference between two arms that sent *the same prompt* (the scaffold arm's
pack was empty on 162 of 162 requests). Any guideline effect smaller than five points at n = 40
is inside the noise a null rerun produces, which is the bar R104 has to clear.

---

## 2. What the corpus already says about *why* this might work

| reading | number | what it means for retrospection |
|---|---|---|
| R93 → R99 dose-response | 15 records **0.700**, 73 records **0.625** | more memory, less accuracy — the unit, not the retrieval, is the problem |
| R99 provenance | 15 repair-derived, 58 pass-derived (`itemsPassedOnly: 58`) | 79% of the store is "a description of one successful attempt, with that attempt's id" |
| R99 served census | distinct **40** of 73, `mergeCensus` **53 shapes / 30 mergeable** | the store is *shaped* like something that wants merging: 30 of 53 call-routines are duplicates |
| R101 null pair | **−5.00pp** between two arms sending the same prompt, 21/160 trials flipped | the resolution floor every guideline claim has to clear |

The dose-response is the load-bearing one. It says the memory did not fail because the right
rule was not retrieved — retrieval was unchanged across those arms — but because *what was
stored was too specific to transfer*. That is precisely the gap a guideline closes, and it is
why this is a unit experiment rather than a retrieval experiment.

---

## 3. The unit: a guideline is a derived item, not a new kind of knowledge

A guideline is written into the store as an ordinary `KnowledgeItem` of kind `procedure`, with:

| field | value |
|---|---|
| `statement` | the claim, copied from the medoid source or rewritten by a reviewer — never paraphrased by the merger |
| `when` | the **intersection** of the sources' conditions — the one trigger every source entails |
| `payload.mergedFrom` | the ids it subsumes (ALTK's `metadata.merged_from`) |
| `payload.support` | how many sources, **conserved** — the lossless/lossy distinction is exactly whether this equals the cluster size |
| `payload.distinctTasks` | ALTK's `support` unit: the number of distinct tasks, not records |
| `payload.reviewedBy` / `reviewAction` | who admitted it, and whether they accepted, edited or overrode |
| `evidence` | one ref whose weight is the **mean confidence of the subsumed sources** — inherited, not invented |

Two consequences follow, and both matter more than they look:

1. **No schema change.** The renderer, the retrieval path, the admission policy and the covered
   write path are untouched, so a guideline arm differs from a correction arm in the *content*
   of the store and nothing else. An arm whose treatment also changes the machine cannot
   attribute its delta.
2. **No privileged constructor.** Admission builds a `DistillCandidate` and goes through the
   same `createKnowledgeItem` a distilled correction does. Retrospection cannot become a back
   door into the store, and the write-admission gate keeps its vote.

Supersession is a status change rather than a delete: the sources move to `retired` with
`statusReason: subsumed-by:<guideline>`. Lossless mode keeps them retrievable for audit; lossy
mode is the arm that actually drops them, and the two are different registrations.

---

## 4. Three operators, and the one that is deliberately absent

```
corrections ──cluster──▶ groups ──propose──▶ candidates ──witness──▶ admissible ──HITL──▶ store
```

**Cluster** (deterministic). Repairs only — pass records are counter-evidence, never members.
Grouped by Jaccard over the *content words of the condition*, single-link, task-scoped. ALTK
clusters on cosine over `task_description` or `guideline_text` because its guidelines have no
condition field; this project's corrections do, and a condition is a better key than a distance:
two corrections that fire in the same situation belong together even when their wording diverges,
and two that share vocabulary but fire in different situations do not. The price is that a
synonym pair lands in different clusters; the benefit is that every grouping decision is
reproducible from the strings.

**Propose** (deterministic by default). The trigger is the **intersection** of the members'
content words, in the shortest member's order; the claim is the **medoid's own sentence**,
copied. Because the trigger is the intersection, it is entailed by every member *by
construction* — the fallback cannot fail its own coverage check, which is the property that
makes it a baseline rather than a guess. A model-written proposal is the treatment arm and is
judged by the same rule.

**Witness** (deterministic, no model). See §5.

**Absent: summarise.** Nothing in this pipeline paraphrases a source's text into a shorter
version of itself. That is ACE's measured failure mode, and it is also the operation that would
launder an instance id into a confident-sounding generality — R99's exact defect, made worse,
because a guideline *sounds* more authoritative than the anecdote it came from.

### 4.1 Why the absent operator is `summarise`, and not the model

The fair objection to §4 is that the two systems this design borrows from both put a model in the
merge. The objection is half right, and the half that is wrong is the part that decides the design.

| system | who groups | who writes | is there a merge of *existing* memory at all |
|---|---|---|---|
| **ALTK-Evolve** | **cosine clustering** — vectors, not a model | a model writes one guideline per cluster | yes: `support` conserved, `lossless` / `sup3` are deterministic dials |
| **AutoGuide** | none — guidelines are retrieved by context key | a model writes `when → do` from a **contrastive trajectory pair** | **no**: it is a first-order extraction, not a second-order compression, and its pool never grows to need one |
| **ACE** | embedding dedupe + id | Generator → Reflector → **Curator** | yes, and it measured what LLM rewriting costs |

So "the competitors merge with a model" is two different operations wearing one word: **a model
writes** (ALTK, AutoGuide) versus **a model rewrites what is already written** (ACE). Only the
second is the operation this pipeline was asked to perform — its input is a store of finished
records, not raw trajectories — and the only controlled measurement of it is negative: repeated
rewriting of one context shrank it **18,282 → 122 tokens** with a **−9.6 point** drop, which its
authors named `brevity bias` and `context collapse` and answered by never rewriting.

Four reasons make that negative result decisive *here* rather than merely relevant:

1. **Attribution.** R104 asks whether the **unit** is right. A model in the merge changes the
   grouping boundary and the prose at once, so a positive delta could not be assigned to either.
   R101 has just measured a −5.00pp difference between two arms that sent the same prompt; at n = 40
   this lane cannot afford two variables in one arm.
2. **The ledger assumes stable text.** `applyDecision` refuses a decision whose `textBefore` no
   longer matches the card. Two model passes over one corpus produce two different cards, so a
   session that ended at 3am could not be replayed at 9am by anyone holding the same two files — and
   the audit trail *is* the state. A model can be put behind that boundary only by snapshotting its
   output into the batch, which is not a prohibition, it is a sequencing requirement.
3. **The witness needs a baseline that cannot fail its own check.** `seedTriggerOf` takes the
   intersection of the members' condition words, so the seed proposal is entailed by every member
   *by construction*; the gate then grades the proposer rather than the fallback. A generated trigger
   is a guess that must clear the same gate — which is exactly why it belongs on the treatment side
   of the comparison.
4. **Laundering.** R99's store was 79% pass-derived records each carrying one run's `order_id`. The
   symptom is an anecdote narrated as a generality, and a model is the instrument best suited to
   narrating it. ACE's brevity bias is the same failure measured in tokens.

**The model is not excluded; it is registered.** Two paths already exist in the repository as arms
rather than as defaults — the `LlmInterpreter` in `packages/core/src/distill/llm.ts` writes
corrections with a model today, and the retrospection pipeline keeps `deterministicProposal` as the
baseline a model-written proposal must beat:

| where a model can enter | what it does | determinism kept | price | status |
|---|---|---|---|---|
| **proposer** | writes one guideline per cluster | no, but the output faces the witness | ≈ $0.01 per candidate (12k prompt tokens over 15 sources) | **R104b**, registered, not dispatched |
| **splitter** | proposes a split where single-link chaining pulled a loose cluster together | yes — the split is the reviewer's, and each part is re-witnessed | same | not registered; the better of the two, because it moves *grouping* and leaves the prose alone |
| **embedding edge** | recalls synonym pairs into the union-find; the threshold stays deterministic | yes, given a pinned model and cached vectors | ≈ $0 | not built |

And the trigger for building either of the last two is a number rather than an opinion, which is
what §8's `fragmentation` now measures: **if the share of repairs no cluster claims is high while
`witnessRate` is also high, the bottleneck is grouping and the model belongs in the splitter; if
fragmentation is low and R104 still does not move, no amount of better prose will help and the next
arm is about abstention rather than about units.**


---

## 5. The witness: coverage as a direction, not a similarity

A guideline is **wider** than its source when every content word of the guideline's trigger
appears in the source's trigger:

```
source     "when a refund is requested after the item arrived damaged"
guideline  "when a refund is requested"                              → entailed
```

The reverse is narrowing — the guideline names a word its source lacks, so it describes a
situation the source was not in — and that direction is refused. Four verdicts; two of them
count as covered.

| verdict | meaning | counted |
|---|---|---|
| `entailed` | the guideline's trigger is a subset of the source's | yes |
| `unconditional` | the trigger names nothing, so it applies everywhere | yes, and the card is refused for it |
| `partial` | ≥ 50% overlap — a synonym or a loose paraphrase | no, by default; `allowPartial` is an arm knob |
| `unwitnessed` | below half | no |

Three derived quantities, all cheap and all shown to the reviewer:

- **collateral** — sources *outside* the claimed set that the guideline also matches, split into
  repairs and passes. This is the quantity that predicts harm: AutoGuide's whole result is that a
  rule firing where it does not apply is worse than no rule, and no competitor publishes it
  because none of them computes it.
- **distinctTasks** — support in ALTK's unit.
- **polarityConflicts** — covered sources whose negation polarity differs from the guideline's.
  "Always confirm before writing" and "never confirm before writing" share every content word;
  this is the one merge error that inverts a rule rather than widening it.

Admissibility is then a short ladder, and the order is the argument: `unconditional` (a rule
with no condition is not a rule) → `unwitnessed` (the claim is unsupported) → `restatement`
(fewer sources than the floor: a correction with a new id) → `polarity` → `over-general`
(more collateral than the ceiling) → `reviewable`.

> The first two swapped during the tests. "You claimed two, the trigger reaches one" is an
> unsupported claim, while "you claimed one and the trigger reaches it" is a restatement;
> grading the first as the second tells the proposer its merge was too small when what happened
> is that it was wrong.

---

## 6. The ledger: making the human a measured variable

A hand-adjudicated memory has one methodological problem — the reviewer is unmeasured. If
guidelines are accepted by a person before an arm runs, the delta is *memory plus that person's
priors*, and no ablation separates them afterwards. No competitor reports what a reviewer would
have removed: ALTK-Evolve says outright that no human annotation is involved, ExpeL and AWM admit
everything their extractor produces, AutoGuide's selection is a model's. So none of them can
price a reviewer, and none of them can be compared against one.

Every decision therefore records: candidate, action, **the text as shown**, the text as
accepted, the reviewer, the timestamp, and the wall-clock milliseconds it took. That is what
turns "a human approved this" into accept rate, edit rate and seconds per card — the three
inputs an R105 needs.

| action | meaning | refused when |
|---|---|---|
| `accept` | admit as written | the card is not `reviewable` |
| `edit` | admit the reviewer's wording | the edit changes nothing (that is an accept) or the result stops witnessing |
| `reject` | refuse | no reason given |
| `split` | these are two situations | fewer than two parts |
| `defer` | not now | — (the only state a later decision may overwrite) |
| `override` | admit against the gate | no reason given |

Two decisions here are worth defending because a reviewer will argue with them.

**The condition is not editable.** In this pipeline a trigger is the *output of the witness* —
the intersection of what the sources declared — not a sentence somebody wrote. Editing it would
change what the rule covers while leaving the coverage evidence untouched, which is precisely
the operation this pipeline exists to prevent. A reviewer who believes the trigger is wrong has
two honest moves: `split` or `reject`. Widening a rule needs sources the corpus does not have,
and inventing them from the keyboard is how a measured memory becomes a hand-written prompt.

**`override` exists, and it is on the record.** A human who disagrees with the gate can say so,
with a reason, and the admitted item carries `reviewAction: 'override'` so the store can be
audited for how often that happened. Refusing the option would not remove the disagreement; it
would remove the record of it.

Invariants are refusals rather than defaults — an unknown candidate, a second decision on a
decided card, an unmeasured duration, a decision whose `textBefore` no longer matches the card,
an accepted card with no decision, an accepted card whose current text is inadmissible. A ledger
that silently repairs a malformed decision is a ledger whose summary nobody can trust.

---

## 7. The console

`pnpm review:serve --batch <batch.json>` serves one page on `127.0.0.1` with no dependencies and
no build step. A console that needs a toolchain to review a sentence does not get used.

The layout is an argument about what a reviewer is qualified to judge:

- **the condition first, not editable**, monospace, with the reason stated in one line;
- **the claim** in a textarea — the one field a human edits;
- **support as six numbers**: sources, tasks, collateral, of which passes, unwitnessed,
  polarity;
- **the sources it claims**, one row each, with the per-source verdict and overlap — so a
  `partial` looks different from an `entailed` at a glance;
- **what it would also match**, split by outcome;
- **the block the model would read**, rendered by the production renderer at the production
  budget, verbatim and last.

That last panel is not decoration. Every defect this project has found in the delivery path was
invisible in the data and obvious in the string — the double-wrapped element (§34.126), the
empty block that still cost 1.14pp, the note that competed with the rules for characters, and on
the console's first run, a malformed attribute (§34.129).

Writing is a fold: the JSON Lines decision log replays onto the batch, so a session that ended at
3am can be re-read at 9am by anyone holding both files, and the audit trail *is* the state.

---

## 8. How this gets measured

Four levels, cheapest first. Nothing here needs a benchmark run until level 3.

### M1 — compile time, free, deterministic

| metric | definition | why it is the right one |
|---|---|---|
| `conservation` | covered / cluster size | ALTK's support conservation; 1.0 in lossless mode or the mode is lying |
| `compression` | source characters / guideline characters | the whole point: R99's store was 73 records of ~600 characters |
| `witnessRate` | entailed / claimed | a proposer that overstates coverage is caught here, not at the benchmark |
| `triggerWidth` | collateral / corpus | how much of the corpus a single rule now governs |
| `transferRatio` | distinctTasks / covered | 1.0 means every source is its own task, i.e. no generalisation at all |
| **`fragmentation`** | repairs no cluster claims / repairs | the price of a lexical key. A high reading with a high `witnessRate` says the bottleneck is **grouping**, which is the case for an embedding edge or a model splitter (see §4.1); a low one says neither would buy anything |
| **`chained`** | clusters whose mean cohesion is under 0.5 | single-link clustering was chosen because one clear pair is enough to argue a merge; its cost is a run of near-neighbours that drags two distant corrections together, and this is that cost counted |
| **`meanCohesion`** | mean cluster cohesion | one number for how tight the corpus's groups are |

Both new metrics are computed by `clusterCensusOf` from the same objects the batch is built from,
and the batch carries them as `census` — so a reviewer opening a card can read the state of the
corpus that produced it rather than inferring it. Measured on the authored demo fixture:
**fragmentation 0.364 (4 of 11 repairs no cluster claims), chained 0 of 3, mean cohesion 0.662**.
That is a fixture, not a measurement of a run, and it is quoted here only to show the instrument
reads.

### M2 — retrieval replay, cents

Re-render every source's own task query against the consolidated store and check the guideline is
retrieved where its parents were. This is the "did consolidation break recall" question, and it
is answerable without a model: embeddings only.

### R104 — the unit arm (registered, not dispatched)

Same 15 repair records, same retrieval, same budget, same 40 tasks, **one difference: the store
holds 3–5 guidelines instead of 15 corrections**. Cost ≈ **$0.83** for the memory leg plus
**$0.38** for the shared control.

Registered prediction: **guideline arm ≥ correction arm + 5.0pp** Pass^4, because 5.0pp is what a
null rerun produced (R101). Anything smaller is not evidence of anything at this n.

Refutations, stated before the dispatch:

- **guideline arm within ±5.0pp of the correction arm** → consolidation is neutral; the unit was
  not the problem and R99's provenance reading was a coincidence of that store.
- **guideline arm below the correction arm** → the correction *is* the right unit and the
  dose-response was about something else (retrieval, or the pass records specifically).
- **both arms below reference** → memory hurts at this scale regardless of unit, and the next
  arm is about abstention rather than about units.

### R105 — the HITL arm (registered, not dispatched)

The same candidate set, two admissions: one accepts everything the witness admitted, the other
is adjudicated. The difference is the reviewer's marginal contribution, priced for the first
time on this board.

It is only meaningful because M1 and the ledger make the reviewer legible: accept rate, edit
rate, median seconds, and the override count are recorded per decision, so the arm reports
*what the human did* alongside what it was worth.

### Cost discipline

| item | cost |
|---|---|
| build a batch from an existing store | $0 (no model in the deterministic path) |
| console session over ~5 candidates | $0, ~2 minutes of a human |
| R104 | **$1.21** total |
| R105 | **$1.21** plus a second human session |

A model-written proposal is a separate, optional path and is priced at one call per candidate
(~12k prompt tokens over 15 sources): **≈ $0.01** for the demo corpus, against $1.21 for the arm
it feeds. Same ratio as the cache probe: a tenth of the arm it guards.

---

## 9. What is built, and what is not

| | |
|---|---|
| `packages/core/src/retrospect/witness.ts` | content words, entailment, collateral, polarity, admissibility — **100/100/100/100** on 23 tests |
| `packages/core/src/retrospect/cluster.ts` | source classification, union-find clustering, seed trigger, medoid, deterministic proposal, **cluster census** — **100/100/100/100** on 29 tests |
| `packages/core/src/retrospect/ledger.ts` | six actions, six refusals, replay, summary, admission, the batch's `census` — **100/100/100/100** on 39 tests |
| `packages/eval/src/review/server.ts` | five routes, the card payload, the rendered preview — **100 / 95.6 / 100 / 100** on 20 tests |
| `packages/eval/src/review/page.ts` | the console — **100/100/100/100** |
| `pnpm eval:retrospect` | store dump → batch, refusals included, census printed and stored |
| `pnpm review:serve` | the console, loopback by default, decisions appended as JSON Lines |

**Not built, deliberately:** a model-written proposer (the deterministic one is the baseline the
treatment must beat, and building the treatment before the baseline is measurable is how a
project ends up unable to say which half helped — it is registered as **R104b** at ≈ $0.01 per
candidate); automatic supersession of the sources (a status change on the write path, cheap, but only
worth wiring once R104 says the unit is right); and the M2 replay harness (embeddings only, but it
needs a store that carries per-item polarity — see below).

**Blocking issue, found by running the pipeline on a real artefact.** Neither τ² store dump
carries a **per-item polarity**. Every record in R93's and R99's dumps is `kind: 'exemplar'` —
including the fifteen distilled from corrections — and the run-level provenance
(`itemsEditedOnly: 15`, `itemsPassedOnly: 58`) is not attributable to an id. So a consolidator
reading a real artefact cannot tell a repair from a success, and the honest outcome is a refusal
rather than an all-pass corpus. The fix is one field in the dump; until it exists, R104's batch
has to be built from the run's own correction log rather than from its store dump.

---

## 10. Related work, and what was borrowed

| system | unit | how it is formed | borrowed | not borrowed |
|---|---|---|---|---|
| **ALTK-Evolve** | guideline | LLM mines trajectories, cosine clustering, `support` conserved, lossless / sup3 delivery dial | support conservation, `merged_from` lineage, the ceiling/dose framing | clustering on text similarity (a condition is a better key here) |
| **ACE** | bullet in a playbook | Generator → Reflector → Curator, deterministic delta merge, helpful/harmful counters | the ban on rewriting; counters as the persistent representation | an itemised playbook of everything (this project's whole problem is too much memory) |
| **AutoGuide** | context→guideline | contrastive trajectory pairs, context key, per-step selection | the conditional form and the retrieval key | per-step selection (this lane renders one block per episode) |
| **ExpeL** | insight | cross-task generalisation from successes and failures, all admitted | the idea that successes teach too | admitting everything unmeasured |
| **AWM** | workflow | routine induction, injected into the policy | the routine as a unit of generalisation | no budget, no coverage check |

The synthesis this project adds is the **witness**: a deterministic, model-free check that a
guideline covers what it claims and nothing it does not — and the collateral count that comes out
of it, which no system on the board publishes.
