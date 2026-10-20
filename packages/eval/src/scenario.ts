/**
 * The offline study workload.
 *
 * ## What this is, and what it is not
 *
 * This is a **controlled mechanism study**, not a benchmark result. It isolates
 * one variable — whether corrected outputs become knowledge that transfers to
 * unseen questions — by holding the generator fixed and using a deterministic
 * recommender with known systematic defects. That control is what makes the
 * effect measurable at all; it is also why the numbers must never be quoted as
 * a claim about chart-model quality.
 *
 * The held-out set uses a **different measure and a different category field**
 * than the feedback set, within the same schemas. A rule that memorised
 * `revenue` cannot pass it; a rule that learned "trend → line" can.
 *
 * ## The defect families
 *
 * The baseline recommender has six documented defects, each a plausible
 * confusion rather than random noise:
 *
 *   D1 trend           -> bar        (should be line)
 *   D2 composition >5  -> pie        (should be bar)
 *   D3 distribution    -> bar        (should be boxplot)
 *   D4 correlation     -> bar        (should be scatter)
 *   D5 matrix          -> bar        (should be heatmap)
 *   D6 comparison/fin  -> pie        (should be bar; domain-specific)
 *
 * A seventh intent (`ranking`) is already correct and acts as a control: a
 * correct result must not be "corrected" into something else.
 */
import {
  DOMAINS,
  chartInterpreter,
  constraintMatches,
  fieldsWithRole,
  type ChartConstraint,
  type ChartIntent,
  type ChartMark,
  type ChartSpec,
} from '@agentix-e/microglia-nl2charts';
import type { KnowledgePack } from '@agentix-e/microglia-core';

export { DOMAINS } from '@agentix-e/microglia-nl2charts';

export const INTENTS: readonly ChartIntent[] = [
  'trend',
  'comparison',
  'composition',
  'distribution',
  'correlation',
  'matrix',
  'ranking',
];

export type Query = {
  readonly id: string;
  readonly text: string;
  readonly domain: string;
  readonly intent: ChartIntent;
  readonly field: string;
  readonly measureB: string;
  readonly category: string;
  readonly temporal: string;
  readonly categoryCount: number;
  readonly grain: 'day' | 'month' | 'quarter';
};

export type CorpusItem = {
  readonly id: string;
  readonly query: Query;
  readonly gold: ChartSpec;
  readonly baseline: ChartSpec;
};

/** The reference policy. It is a rule, not a model: that is the point. */
export function goldMark(intent: ChartIntent, categoryCount: number): ChartMark {
  switch (intent) {
    case 'trend':
      return 'line';
    case 'comparison':
    case 'ranking':
      return 'bar';
    case 'composition':
      return categoryCount > 5 ? 'bar' : 'pie';
    case 'distribution':
      return 'boxplot';
    case 'correlation':
      return 'scatter';
    case 'matrix':
      return 'heatmap';
  }
}

/** The baseline's six defects, stated in one place so the report can narrate them. */
export function baselineMark(intent: ChartIntent, domain: string): ChartMark {
  switch (intent) {
    case 'trend':
      return 'bar'; // D1
    case 'comparison':
      // In finance the baseline reads "compare" as "share of total" and emits a
      // pie. Wrong, but a legal chart: the study measures choice, not validity.
      return domain === 'finance' ? 'pie' : 'bar'; // D6
    case 'composition':
      return 'pie'; // D2, wrong above five categories
    case 'distribution':
      return 'bar'; // D3
    case 'correlation':
      // `bar` rather than `line`: the baseline must emit a *valid* chart that is
      // wrong, otherwise the study would be measuring schema rejection instead
      // of a chart-choice error.
      return 'bar'; // D4
    case 'matrix':
      return 'bar'; // D5
    case 'ranking':
      return 'bar';
  }
}

export function specFor(query: Query, mark: ChartMark): ChartSpec {
  const aggregate =
    query.intent === 'distribution' || query.intent === 'correlation' ? 'none' : 'sum';
  if (query.intent === 'correlation') {
    return { mark, x: query.field, y: query.measureB, aggregate };
  }
  if (query.intent === 'distribution' || query.intent === 'ranking') {
    return { mark, x: query.category, y: query.field, aggregate };
  }
  if (query.intent === 'matrix') {
    return { mark, x: query.category, y: query.field, aggregate, series: query.temporal };
  }
  if (query.intent === 'comparison' || query.intent === 'composition') {
    return { mark, x: query.category, y: query.field, aggregate };
  }
  return { mark, x: query.temporal, y: query.field, aggregate };
}

const GRAINS = ['day', 'month', 'quarter'] as const;
const COUNTS = [3, 4, 5, 6, 8, 10] as const;

/**
 * Build a deterministic corpus.
 *
 * `phase` selects which measure and category field the question uses. Train and
 * holdout therefore share schemas and intents but not the concrete columns,
 * which is the cheapest honest test of transfer.
 */
export function buildCorpus(seed: number, count: number, phase: 'train' | 'holdout'): readonly CorpusItem[] {
  void seed; // The index is the schedule; the seed names the corpus for the report.
  const items: CorpusItem[] = [];
  for (let i = 0; i < count; i += 1) {
    const domain = DOMAINS[i % DOMAINS.length];
    if (!domain) continue;
    const intent = INTENTS[i % INTENTS.length] as ChartIntent;
    const measures = fieldsWithRole(domain, 'measure');
    const categories = fieldsWithRole(domain, 'category');
    const temporal = fieldsWithRole(domain, 'temporal')[0];
    const measure = measures[phase === 'holdout' ? 1 : 0] ?? measures[0];
    const category = categories[phase === 'holdout' ? 1 : 0] ?? categories[0];
    if (!measure || !category || !temporal) continue;
    const measureB = measures[(phase === 'holdout' ? 0 : 1) % measures.length] ?? measure;
    const categoryCount = intent === 'composition' ? (COUNTS[i % COUNTS.length] as number) : 4;
    const grain = GRAINS[i % GRAINS.length] as Query['grain'];

    const query: Query = {
      id: `${phase === 'train' ? 'tr' : 'ho'}_${String(i).padStart(4, '0')}`,
      text: questionText(intent, domain.name, measure.name, category.name, measureB.name, grain),
      domain: domain.name,
      intent,
      field: measure.name,
      measureB: measureB.name,
      category: category.name,
      temporal: temporal.name,
      categoryCount,
      grain,
    };
    items.push({
      id: query.id,
      query,
      gold: specFor(query, goldMark(intent, categoryCount)),
      baseline: specFor(query, baselineMark(intent, domain.name)),
    });
  }
  return items;
}

function questionText(
  intent: ChartIntent,
  domain: string,
  measure: string,
  category: string,
  measureB: string,
  grain: string,
): string {
  switch (intent) {
    case 'trend':
      return `How has ${measure} changed by ${grain} in ${domain}?`;
    case 'comparison':
      return `Compare ${measure} across ${category} in ${domain}.`;
    case 'composition':
      return `What share of ${measure} comes from each ${category} in ${domain}?`;
    case 'distribution':
      return `Show the distribution of ${measure} in ${domain}.`;
    case 'correlation':
      return `Is ${measure} related to ${measureB} in ${domain}?`;
    case 'matrix':
      return `Show ${measure} by ${category} and ${grain} in ${domain}.`;
    case 'ranking':
      return `Which ${category} has the highest ${measure} in ${domain}?`;
  }
}

/**
 * The reader: a deterministic surrogate for a prompt-conditioned generator.
 *
 * It applies the most specific matching constraint, then the most confident.
 * That ordering is the whole reason scope generalisation helps: a domain rule
 * outranks a global one, and a global rule still reaches every domain.
 */
export function applyKnowledge(pack: KnowledgePack, item: CorpusItem): ChartSpec {
  const matching = pack.items
    .filter((entry) => entry.status === 'active')
    .map((entry) => ({ entry, payload: entry.payload as ChartConstraint | undefined }))
    .filter(
      (candidate): candidate is { entry: (typeof pack.items)[number]; payload: ChartConstraint } =>
        candidate.payload !== undefined && constraintMatches(candidate.payload, item.query),
    );

  if (matching.length === 0) return item.baseline;

  matching.sort((a, b) => {
    const specificityA = scopeSize(a.entry);
    const specificityB = scopeSize(b.entry);
    if (specificityA !== specificityB) return specificityB - specificityA;
    if (a.entry.confidence !== b.entry.confidence) return b.entry.confidence - a.entry.confidence;
    return a.entry.id < b.entry.id ? -1 : 1;
  });

  const winner = matching[0];
  if (!winner) return item.baseline;
  return { ...item.baseline, mark: winner.payload.then.mark };
}

function scopeSize(entry: KnowledgePack['items'][number]): number {
  const scope = entry.scope;
  let size = 1;
  if (scope.domain !== undefined) size += 1;
  if (scope.intent !== undefined) size += 1;
  if (scope.field !== undefined) size += 1;
  return size;
}

/** Exported so the study can reuse the exact interpreter the pack ships. */
export { chartInterpreter };
