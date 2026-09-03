import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

process.env.TZ = 'Asia/Kolkata';

const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const productionPrefix = source.split('\ndocument.addEventListener')[0];
const context = {
  localStorage: { getItem: () => null, setItem: () => {} },
  console, Date, Math, JSON, setTimeout, clearTimeout,
};
vm.createContext(context);
vm.runInContext(`${productionPrefix}\nglobalThis.streakApi = {
  streak,
  formatStreak: typeof formatStreak === 'undefined' ? undefined : formatStreak,
  state,
};`, context);

const afterLocalMidnight = new Date('2026-08-27T20:00:00.000Z');

context.streakApi.state.activity = [
  { date: '2026-08-28', type: 'complete', id: 'ai-0-0' },
  { date: '2026-08-27', type: 'focus', id: 'ai-0-1' },
];
assert.equal(context.streakApi.streak(afterLocalMidnight), 2);

context.streakApi.state.activity = [
  { date: '2026-08-27', type: 'focus', id: 'ai-0-1' },
];
assert.equal(context.streakApi.streak(afterLocalMidnight), 0);

assert.notEqual(context.streakApi.formatStreak, undefined);
assert.equal(context.streakApi.formatStreak(1), '1 day');
assert.equal(context.streakApi.formatStreak(2), '2 days');

console.log('current streak tests passed');
