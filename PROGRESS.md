# Progress tracking

A running log of iterations: what changed, what evidence it produced, and what is left. Newest last.
An iteration is only recorded as closed when its CI is green and its artefacts are committed.

## Where the project stands

| Stage | State | Blocking item |
|---|---|---|
| S0 Mechanism | **closed** | — |
| S1 Host shadow (nl2charts) | not started | needs the private adjudicated set (n=1,300, κ≥0.7) |
| S2 Public benchmarks | harness ready, run pending | dataset hosting (see iteration 6) |
| S3 SOTA push | conditional on S2 | — |

## Iteration log

### 1 — Repository split

`AgentiX-E/microglia` now carries the code and the external documentation; `AgentiX-E/microglia-docs`
carries the internal documents. The split is by audience, not by secrecy: the user guide, architecture
note, and glossary are for a consumer of the packages, and they live beside the packages so a version
of the docs always matches a version of the code.

**Evidence.** `master` at `1e59e25`; `ci` and `poc-live` green on that commit.

### 2 — Coverage from 92.7% to 100% lines, 99.5% branches

Every dimension is now held to 95%. The work was not "add tests until the number moves": each gap was
a question about behaviour, and three of them turned into code changes rather than tests.

| Change | Why |
|---|---|
| `resolveDomain` / `resolveRegistry` validate a domain pack's schema | the generator used to `continue` past a malformed domain, so a broken pack looked like a smaller corpus |
| `pickGeneralizationTarget` selects only an active sibling | widening onto a candidate promoted a claim that had not earned admission |
| The second budget pass was removed and replaced by a proved bound plus an explicit size limit | its body was unreachable, so the "exact budget" guarantee had never been exercised |
| `outranks` replaces sort-then-index in the reader | the winner is a maximum; the sort and the index check were both unnecessary |
| `diversity` became an option on `buildPack` | the ablation needed a switch that a host can also use |

**Evidence.** 370 tests; `100 / 99.53 / 100 / 100`; the seven uncovered arms are named with their
reasons in the technical design §10.3.

### 3 — A defect the budget invariant found

`makePack` returned every candidate alongside the rendered ids, so a pack could claim rules the prompt
did not contain. The study's reader believed `items`, and the `narrow-budget` arm was reporting 100%
accuracy on an empty block.

| Before | After |
|---|---|
| `narrow-budget` 100.00% | 31.79% (the baseline) |
| the budget appeared not to matter | 400 characters is the binding threshold |

**Evidence.** `packages/apply/src/__tests__/budget.test.ts` sweeps 64 budgets and asserts
`items.length === ids.length`, that every id appears in the rendered block, and that an empty block
returns nothing. Gate G15 now measures the pack layer's contribution as −68.21pp.

### 4 — Three micro-ablations, because two arms measured nothing

The `no-credit` and `no-contradiction` arms both report no change, which is correct and useless: a
clean corpus never cites a rule enough times to trigger credit, and never holds two conflicting
claims. Three targeted experiments replace the non-result.

| Module | With | Without |
|---|---|---|
| Credit assignment | withdrawn after 4 failures | still injected |
| Contradiction resolution | 1 active, 429 chars | 2 active, 717 chars |
| Diversification | 4 distinct of 4 | 1 distinct |

**Evidence.** `packages/eval/src/ablations.ts`; gates G12–G14 assert each result; the report renders the
table from the artefact.

### 5 — Cortex conformance against a real build

The adapter shipped with a structural copy of cortex's `MemoryValue` because the packages are not
published. That copy is now checked against reality: the `cortex` workflow clones cortex, builds it,
and compares field sets.

**Evidence.** `cortex` workflow green at `c75552a`; `scripts/cortex-conformance.mjs` reports
`12 fields matched`. **Action item (highlighted):** replace the clone with a normal dependency and the
structural copy with `import type` as soon as `@agentix-e/cortex-*` is published.

### 6 — Public benchmark lane

`poc/sota-bird.ts` runs BIRD Mini-Dev with two arms on the same questions: no memory, then a pack
learned from a disjoint half. Execution accuracy is computed by running both the predicted and the
gold SQL through `node:sqlite` and comparing result multisets — the standard EX metric, with no
dependency added.

Three attempts were needed to make the lane run at all, and the third one is the honest state:

| Attempt | Failure | Fix |
|---|---|---|
| 1 | 404 on a hard-coded archive name | try known names in order |
| 2 | 404 on both known names | ask the dataset API for its file list and try every archive it lists |
| 3 | the dataset API answered: the repository holds `.gitattributes`, `README.md`, and three sharded question files — **no databases** | accept a pinned archive (`BIRD_ARCHIVE_URL`) and say so plainly |

The third run settled the question the first two raised. BIRD Mini-Dev's Hugging Face repository is a
question bank; the SQLite databases are distributed separately. A lane that needs execution accuracy
therefore needs one piece of setup — upload the complete package as a release asset and set the
`BIRD_ARCHIVE_URL` variable — and until then the lane fails with the file list rather than a stack
trace. That is the correct state: the harness is proven, the data is missing, and the message says
which.

What is proven today: the harness executes end to end, and a missing dataset produces a named error
with the list of what the host actually offers, not an empty result. What is not proven: any accuracy
number. The lane is scheduled weekly and on demand, and it is deliberately not a merge gate — at n=60
the 95% interval is roughly ±13pp, and a flaky gate is worse than no gate.

### 7 — External documentation

`README.md`, `docs/USER-GUIDE.md`, `docs/ARCHITECTURE.md`, `docs/GLOSSARY.md` in English, written for
someone who has never heard of the project: install, five-minute integration, every feedback kind,
the trust table, the lifecycle diagram, failure modes, performance, and two extension recipes.

**Evidence.** `pnpm audit:repo` asserts all four exist; the audit also rejects non-English text in code,
`TODO` markers, coverage suppressions, `any`, skipped or focused tests, runtime dependencies in a
package manifest, and workflow soft-failures.

## What is left, in order

1. **S1**: instrument nl2charts behind a flag, adjudicate 1,300 cases, run the three modes. Gate:
   +3pp top-1 (p<0.05), SQL regression ≤1pp, knowledge precision ≥85%.
2. **S2**: run the public suites at the power stated in the roadmap. Gate: BIRD-Interact ≥+5pp at n=600.
3. **Cortex release**: swap the clone lane for the published package (W1).
4. **vitest 4 migration** once vite 7 is the toolchain default (W2).

Nothing on this list blocks the S0 result, and none of it is hidden behind the green build: each item
is either an experiment that has not run or a dependency that has not shipped.
