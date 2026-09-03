import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const productionPrefix = source.split('\ndocument.addEventListener')[0];
const context = {
  localStorage: { getItem: () => null, setItem: () => {} },
  console, Date, Math, JSON, setTimeout, clearTimeout,
};
vm.createContext(context);
vm.runInContext(`${productionPrefix}\nglobalThis.overviewApi = {
  roadmapProgressListMarkup: typeof roadmapProgressListMarkup === 'undefined' ? undefined : roadmapProgressListMarkup,
};`, context);

assert.match(source, /class="stats-grid" aria-label="Learning statistics"/);
assert.match(source, /Topics completed/);
assert.match(source, /Current streak/);
assert.match(source, /Focused learning/);
assert.match(source, /ROADMAP PROGRESS/);

assert.notEqual(context.overviewApi.roadmapProgressListMarkup, undefined);
const roadmapMarkup = context.overviewApi.roadmapProgressListMarkup([
  { map: { name: 'AI Engineering' }, stats: { done: 5, total: 20, pct: 25 } },
  { map: { name: 'Applied Deep Learning' }, stats: { done: 9, total: 30, pct: 30 } },
]);
assert.equal((roadmapMarkup.match(/class="roadmap-progress-item"/g) || []).length, 2);
assert.match(roadmapMarkup, /AI Engineering/);
assert.match(roadmapMarkup, /5\/20 topics/);
assert.match(roadmapMarkup, /25%/);
assert.match(roadmapMarkup, /width:25%/);
assert.doesNotMatch(roadmapMarkup, /track-ring|week-bars/);

assert.doesNotMatch(source, /Your momentum at a glance/);
assert.doesNotMatch(source, /function activitySeries/);
assert.doesNotMatch(source, /function roadmapAnalytics/);
assert.doesNotMatch(source, /TRACK BALANCE|class="track-ring"|class="week-bars"/);
assert.doesNotMatch(styles, /\.analytics-grid/);

console.log('simple overview rollback tests passed');
