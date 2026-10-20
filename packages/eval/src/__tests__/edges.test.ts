import { describe, expect, it } from 'vitest';
import { comparePaired } from '../stats.js';
import { buildGates, type ArmResult, type StudyResult } from '../study.js';
import { buildCorpus, specFor } from '../scenario.js';
import { renderJson, renderMarkdown, summarise } from '../report.js';

describe('degenerate comparisons', () => {
  it('handles an empty paired sample', () => {
    const result = comparePaired([], []);
    expect(result).toMatchObject({ n: 0, delta: 0, baselineAccuracy: 0, treatmentAccuracy: 0 });
  });

  it('handles two all-wrong arms', () => {
    const result = comparePaired([false, false], [false, false]);
    expect(result.gained).toBe(0);
    expect(result.lost).toBe(0);
    expect(result.p).toBe(1);
  });
});

describe('gates with missing arms', () => {
  it('fails closed without throwing when no arm exists', () => {
    const gates = buildGates([], {}, 3, 'ops');
    expect(gates).toHaveLength(11);
    expect(gates.some((gate) => !gate.pass)).toBe(true);
    expect(gates.find((gate) => gate.id === 'G7')?.pass).toBe(false);
  });
});

describe('report with sparse arms', () => {
  const arm: ArmResult = {
    name: 'full',
    config: {
      name: 'full',
      useMemory: true,
      noiseRate: 0,
      poisonEvery: 0,
      generalize: true,
      poisonTrust: 0,
    },
    rounds: [],
    holdout: [],
    byDomain: [],
    finalAccuracy: 0,
    precision: { value: 0, evaluated: 0 },
    untrustedActive: 0,
    active: 0,
    quarantined: 0,
    conflicted: 0,
    knowledge: 0,
  };

  const result: StudyResult = {
    config: {
      seed: 1,
      trainSize: 0,
      holdoutSize: 0,
      rounds: 0,
      batchSize: 0,
      budget: 0,
      heldOutDomain: 'ops',
    },
    corpus: { train: 0, holdout: 0 },
    arms: [arm],
    comparisons: {},
    leakage: 1,
    diagnosis: undefined,
    gates: [
      { id: 'G1', criterion: 'blocking', actual: '0', pass: false, blocking: true },
      { id: 'G2', criterion: 'advisory', actual: '0', pass: false, blocking: false },
    ],
  };

  it('renders placeholders rather than throwing on missing data', () => {
    const markdown = renderMarkdown(result);
    expect(markdown).toContain('—');
    expect(markdown).toContain('WARN');
    expect(markdown).toContain('FAIL');
    expect(markdown).toContain('Blocking gates failing: G1');
  });

  it('summarises a failing run without a comparison', () => {
    const line = summarise(result);
    expect(line).toContain('full=0.00% (—)');
    expect(line).toContain('blocking-gates=G1');
  });

  it('serialises the sparse result', () => {
    expect(() => JSON.parse(renderJson(result))).not.toThrow();
  });
});

describe('scenario specification branches', () => {
  it('builds a spec for every intent', () => {
    const corpus = buildCorpus(5, 28, 'train');
    const intents = new Set(corpus.map((item) => item.query.intent));
    expect(intents.size).toBe(7);

    for (const item of corpus) {
      const spec = specFor(item.query, 'bar');
      expect(spec.mark).toBe('bar');
      expect(typeof spec.x).toBe('string');
    }
  });

  it('uses a series only for a matrix', () => {
    const corpus = buildCorpus(6, 28, 'train');
    const matrix = corpus.find((item) => item.query.intent === 'matrix')!;
    expect(specFor(matrix.query, 'bar')).toHaveProperty('series');
    const trend = corpus.find((item) => item.query.intent === 'trend')!;
    expect(specFor(trend.query, 'bar')).not.toHaveProperty('series');
  });
});
