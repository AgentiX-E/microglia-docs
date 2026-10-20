/**
 * Benchmark entry point.
 *
 * Writes the artifact before printing, so a failing gate still leaves the JSON
 * that explains why. Exit code is non-zero when a blocking gate fails, which is
 * what lets CI treat the claim as a test rather than a slide.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { renderJson, renderMarkdown, summarise } from '../report.js';
import { DEFAULT_CONFIG, runStudy } from '../study.js';

const result = await runStudy(DEFAULT_CONFIG);
const dir = join(process.cwd(), 'bench', 'results');
await mkdir(dir, { recursive: true });
await writeFile(join(dir, 'study.json'), renderJson(result), 'utf8');
await writeFile(join(dir, 'study.md'), renderMarkdown(result), 'utf8');

process.stdout.write(`${summarise(result)}\n`);
process.stdout.write(`artifacts: ${dir}\n`);

if (result.gates.some((gate) => gate.blocking && !gate.pass)) {
  process.exitCode = 1;
}
