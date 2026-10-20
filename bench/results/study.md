# Microglia mechanism study

> Controlled workload: a deterministic chart recommender with six documented defects, corrected by a simulated user. The numbers measure whether feedback becomes transferable knowledge. They are **not** a claim about chart-model quality on any public benchmark.

## Configuration

| Parameter | Value |
| --- | --- |
| seed | 20261020 |
| train / holdout | 560 / 280 |
| rounds x batch | 6 x 12 |
| knowledge budget | 1200 chars |
| namespace leakage | 0 items |

## Arms

| Arm | Baseline | Final | Δ | McNemar p | Active | Precision | Untrusted active |
| --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 31.79% | 31.79% | — | — | 0 | 0.00% (n=0) | 0 |
| full | 31.79% | 100.00% | +68.21pp | <0.0001 | 6 | 100.00% (n=44) | 0 |
| noise | 31.79% | 100.00% | +68.21pp | <0.0001 | 6 | 100.00% (n=44) | 0 |
| poison | 31.79% | 100.00% | +68.21pp | <0.0001 | 6 | 100.00% (n=44) | 0 |
| unguarded | 31.79% | 85.71% | +53.93pp | <0.0001 | 9 | 64.71% (n=68) | 0 |
| no-generalization | 31.79% | 83.21% | +51.43pp | <0.0001 | 16 | 100.00% (n=116) | 0 |

`Precision` is the share of active constraints whose mark equals the reference policy on a probe grid of every context they claim. `Untrusted active` counts active items whose source trust is below the quarantine floor; it must be zero.

## Held-out domain

`ops` received no feedback in any arm. It is the transfer test: a rule that was widened to a domain-free scope reaches it; a domain-scoped rule cannot.

| Arm | finance | hr | ops | sales |
| --- | --- | --- | --- | --- |
| baseline | 24.29% (17/70) | 32.86% (23/70) | 32.86% (23/70) | 37.14% (26/70) |
| full | 100.00% (70/70) | 100.00% (70/70) | 100.00% (70/70) | 100.00% (70/70) |
| noise | 100.00% (70/70) | 100.00% (70/70) | 100.00% (70/70) | 100.00% (70/70) |
| poison | 100.00% (70/70) | 100.00% (70/70) | 100.00% (70/70) | 100.00% (70/70) |
| unguarded | 85.71% (60/70) | 85.71% (60/70) | 85.71% (60/70) | 85.71% (60/70) |
| no-generalization | 100.00% (70/70) | 100.00% (70/70) | 32.86% (23/70) | 100.00% (70/70) |

## Learning curves

| Round | baseline | full | noise | poison | unguarded | no-generalization |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 31.79% | 31.79% | 31.79% | 31.79% | 31.79% | 31.79% |
| 1 | 31.79% | 100.00% | 89.29% | 100.00% | 100.00% | 71.43% |
| 2 | 31.79% | 100.00% | 100.00% | 100.00% | 100.00% | 82.14% |
| 3 | 31.79% | 100.00% | 100.00% | 100.00% | 92.86% | 83.21% |
| 4 | 31.79% | 100.00% | 100.00% | 100.00% | 82.14% | 83.21% |
| 5 | 31.79% | 100.00% | 100.00% | 100.00% | 96.43% | 83.21% |
| 6 | 31.79% | 100.00% | 100.00% | 100.00% | 85.71% | 83.21% |

## Knowledge dynamics (final round)

| Arm | Active | Candidate | Quarantined | Conflicted | Retired | Mean pack tokens | Recall p50 / p95 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 0 | 0 | 0 | 0 | 0 | 34 | 0.00 / 0.00 ms |
| full | 6 | 0 | 0 | 0 | 5 | 90 | 0.01 / 0.01 ms |
| noise | 6 | 1 | 0 | 0 | 5 | 90 | 0.01 / 0.01 ms |
| poison | 6 | 3 | 2 | 0 | 8 | 90 | 0.01 / 0.01 ms |
| unguarded | 9 | 2 | 0 | 1 | 8 | 119 | 0.01 / 0.02 ms |
| no-generalization | 16 | 0 | 0 | 0 | 0 | 79 | 0.01 / 0.01 ms |

## Gates

| Gate | Criterion | Actual | Result |
| --- | --- | --- | --- |
| G1 | full arm gains >= 20pp over baseline on the held-out set | +68.21pp | PASS |
| G2 | the gain is significant by exact McNemar at p < 0.001 | <0.0001 | PASS |
| G3 | 20% label noise still yields >= 15pp over baseline | +68.21pp | PASS |
| G4 | no untrusted knowledge becomes active | 0 | PASS |
| G5 | poisoned traffic loses no more than 3pp against the clean arm | +0.00pp | PASS |
| G6 | on the unseen 'ops' domain, generalisation beats per-domain scoping by >= 40pp | 100.00% vs 32.86% | PASS |
| G7 | no knowledge crosses the namespace boundary | 0 | PASS |
| G8 | active knowledge is >= 80% correct on the probe grid | 100.00% | PASS |
| G9 | the no-memory arm does not drift across rounds | 31.79% -> 31.79% | PASS |
| G10 | the poison arm actually quarantined something (the defence was exercised) | 2 | PASS |
| G11 | removing the trust ceiling measurably harms accuracy (the guard is load-bearing) | +53.93pp vs +68.21pp | PASS |

All blocking gates pass.

## Threats to validity

1. **The generator is deterministic.** The study isolates knowledge transfer, not model behaviour under a prompt. A real LLM may ignore, misread, or over-apply a constraint.
2. **The taxonomy is closed.** Edits are chart-type changes only; encoding and aggregation corrections are captured and exported but not taught in this arm.
3. **The user is simulated.** Noise is uniform, whereas real corrections cluster by user and by failure mode.
4. **Held-out fields, not held-out schemas.** Transfer is measured across measures and categories inside four known schemas, not across unseen databases.

## Reproduce

```bash
pnpm install
pnpm build
pnpm bench
```
