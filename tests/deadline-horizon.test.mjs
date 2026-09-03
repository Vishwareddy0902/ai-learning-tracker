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
vm.runInContext(`${productionPrefix}\nglobalThis.timelineTestApi = {
  timelineStatus: typeof timelineStatus === 'undefined' ? undefined : timelineStatus,
  phaseTimelineMarkup: typeof phaseTimelineMarkup === 'undefined' ? undefined : phaseTimelineMarkup,
  topicRow,
};`, context);

const halfway = context.timelineTestApi.timelineStatus?.(
  { start: '2026-08-01', deadline: '2026-08-11' },
  new Date(2026, 7, 6),
);
assert.notEqual(halfway, undefined);
assert.deepEqual(JSON.parse(JSON.stringify(halfway)), {
  pct: 50,
  daysLeft: 5,
  label: '5 days left',
  state: 'active',
});

const overdue = context.timelineTestApi.timelineStatus?.(
  { start: '2026-08-01', deadline: '2026-08-11' },
  new Date(2026, 7, 14),
);
assert.equal(overdue?.pct, 100);
assert.equal(overdue?.label, '3 days overdue');

const sample = { id: 'ai-1-0', name: 'Transformer architecture', description: 'Tokens, attention and generation' };
const markup = context.timelineTestApi.topicRow(sample);
assert.doesNotMatch(markup, /data-action="timeline"/);
assert.doesNotMatch(markup, /class="deadline-horizon/);

const phaseMarkup = context.timelineTestApi.phaseTimelineMarkup?.('ai', 1, 'LLM application engineering');
assert.notEqual(phaseMarkup, undefined);
assert.match(phaseMarkup, /data-action="phase-timeline"/);
assert.match(phaseMarkup, /class="deadline-horizon/);

const styles = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
assert.match(styles, /\.horizon-track\{[^}]*display:block/);

console.log('deadline horizon tests passed');
