import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const productionPrefix = source.split('\ndocument.addEventListener')[0];
const context = {
  localStorage: { getItem: () => null, setItem: () => {} },
  console,
  Date,
  Math,
  JSON,
  setTimeout,
  clearTimeout,
};
vm.createContext(context);
vm.runInContext(`${productionPrefix}\nglobalThis.testApi = {
  topicRow,
  phaseCountLabel: typeof phaseCountLabel === 'undefined' ? undefined : phaseCountLabel,
  subtopicsFor: typeof subtopicsFor === 'undefined' ? undefined : subtopicsFor,
  subtopicProgress: typeof subtopicProgress === 'undefined' ? undefined : subtopicProgress,
  state,
};`, context);

const sample = {
  id: 'ai-1-0',
  name: 'Transformer architecture',
  description: 'Tokens, attention and generation',
};
const markup = context.testApi.topicRow(sample);

assert.match(markup, /class="topic-shell/);
assert.match(markup, /data-action="topic"/);
assert.match(markup, /aria-expanded="false"/);
assert.match(markup, /class="topic-details"/);
assert.equal(context.testApi.phaseCountLabel(5, 8), '(5/8)');
assert.equal(context.testApi.subtopicsFor?.(sample).length, 3);
assert.match(markup, /class="subtopic-list"/);
assert.match(markup, /\(0\/3\)/);
assert.equal((markup.match(/data-action="subnote"/g) || []).length, 3);

context.testApi.state.subCompleted['ai-1-0-sub-0'] = true;
context.testApi.state.subCompleted['ai-1-0-sub-1'] = true;
assert.deepEqual(
  JSON.parse(JSON.stringify(context.testApi.subtopicProgress(sample))),
  { done: 2, total: 3, pct: 67 },
);

console.log('topic accordion and phase count tests passed');
