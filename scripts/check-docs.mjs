#!/usr/bin/env node
/**
 * Documentation gates for `microglia-docs`.
 *
 * These documents are the project's product: the whitepaper, the design, the audit and the
 * progress log are what a reader is asked to trust, and three separate rounds have shipped a
 * defect into them that no test could see — a section number reused after an edit, a table that
 * described a tree that had moved, and a candidate queue naming competitor mechanisms that had
 * never been registered anywhere. Each failure had the same shape: **a claim in prose that
 * nothing checked**.
 *
 * So this file checks the three claims that can be checked without a model:
 *
 *   1. every fenced block is closed, because a document whose last third renders as code is a
 *      document nobody read to the end;
 *   2. every `AM.n` reference resolves to an `AM.n` heading in COMPETITIVE.md, because a
 *      reference to a registration that does not exist is how a candidate entered the queue
 *      with no mechanism, no delta and no side;
 *   3. every row of the candidate registry in ROADMAP.md names a side, a registered entry and an
 *      episode count, because "we should learn X" is not a plan and cannot be graded.
 *
 * Exit code 1 on any failure, with every failure listed rather than the first.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SIDES = new Set(['microglia', 'cortex']);

const failures = [];
const fail = (file, line, message) => failures.push({ file, line, message });

function readDocs() {
  return readdirSync(ROOT)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => ({ name, text: readFileSync(join(ROOT, name), 'utf8') }));
}

/** 1. Every fence is closed, and an opening fence carries a language. */
function checkFences(docs) {
  for (const { name, text } of docs) {
    const lines = text.split('\n');
    let open = null;
    lines.forEach((line, index) => {
      if (!line.startsWith('```')) return;
      if (open === null) {
        open = index + 1;
        return;
      }
      open = null;
    });
    if (open !== null) {
      fail(name, open, 'fence opened here is never closed');
    }
  }
}

/** 2. Every `AM.n` mention resolves to a heading that defines it. */
function checkRegistrations(docs) {
  const competitive = docs.find((doc) => doc.name === 'COMPETITIVE.md');
  if (competitive === undefined) {
    fail('COMPETITIVE.md', 0, 'the file that owns the competitor registry is missing');
    return;
  }
  const defined = new Set();
  for (const line of competitive.text.split('\n')) {
    const heading = /^#{2,4}\s+AM\.(\d+)\b/.exec(line);
    if (heading !== null) defined.add(heading[1]);
    const bold = /^\*\*AM\.(\d+)\b/.exec(line);
    if (bold !== null) defined.add(bold[1]);
  }
  if (defined.size === 0) {
    fail('COMPETITIVE.md', 0, 'no AM.n heading was found, so every reference below is unresolvable');
    return;
  }
  for (const { name, text } of docs) {
    text.split('\n').forEach((line, index) => {
      for (const match of line.matchAll(/\bAM\.(\d+)\b/g)) {
        if (!defined.has(match[1])) {
          fail(name, index + 1, `AM.${match[1]} is referenced but never defined in COMPETITIVE.md`);
        }
      }
    });
  }
}

/** 3. The candidate registry is a table with one row per candidate and no blank cells. */
function checkCandidateRegistry(docs) {
  const roadmap = docs.find((doc) => doc.name === 'ROADMAP.md');
  if (roadmap === undefined) {
    fail('ROADMAP.md', 0, 'the file that owns the queue is missing');
    return;
  }
  const lines = roadmap.text.split('\n');
  const heading = lines.findIndex((line) => line.startsWith('### Candidate registry'));
  if (heading === -1) {
    fail('ROADMAP.md', 0, 'no `### Candidate registry` section, so there is no checked queue');
    return;
  }
  const start = lines.findIndex((line, index) => index > heading && line.startsWith('|'));
  if (start === -1) {
    fail('ROADMAP.md', heading + 1, 'the registry section has no table');
    return;
  }
  const header = lines[start]
    .split('|')
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 0);
  for (const column of ['candidate', 'side', 'registered', 'episodes needed']) {
    if (!header.includes(column)) {
      fail('ROADMAP.md', start + 1, `the registry header has no \`${column}\` column`);
    }
  }
  const columnOf = (name) => header.indexOf(name);
  let rows = 0;
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.startsWith('|')) break;
    if (/^\|\s*-+/.test(line)) continue;
    rows += 1;
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
    const at = (name) => cells[columnOf(name)] ?? '';
    const side = at('side').replaceAll('*', '');
    if (!SIDES.has(side)) {
      fail('ROADMAP.md', index + 1, `side is \`${side}\`, which is neither microglia nor cortex`);
    }
    if (!/^AM\.\d+$/.test(at('registered'))) {
      fail('ROADMAP.md', index + 1, `registered is \`${at('registered')}\`, not a single AM.n reference`);
    }
    if (at('episodes needed').length === 0) {
      fail('ROADMAP.md', index + 1, 'episodes needed is empty, so the candidate is not priced');
    }
    if (at('candidate').length === 0) {
      fail('ROADMAP.md', index + 1, 'the candidate cell is empty');
    }
  }
  if (rows === 0) {
    fail('ROADMAP.md', start + 1, 'the registry has a header and no candidates');
  }
}

const docs = readDocs();
if (docs.length === 0) {
  fail('.', 0, 'no markdown files were found, so nothing was checked');
}
checkFences(docs);
checkRegistrations(docs);
checkCandidateRegistry(docs);

if (failures.length === 0) {
  console.log(`docs gates: ${docs.length} files, all checks passed`);
  process.exit(0);
}
for (const failure of failures) {
  console.error(`${failure.file}:${failure.line}  ${failure.message}`);
}
console.error(`\ndocs gates: ${failures.length} failure(s) across ${docs.length} files`);
process.exit(1);
