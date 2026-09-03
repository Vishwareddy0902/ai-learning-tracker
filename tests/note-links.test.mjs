import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const productionPrefix = source.split('\ndocument.addEventListener')[0];
const context = {
  localStorage: { getItem: () => null, setItem: () => {} },
  console, Date, Math, JSON, setTimeout, clearTimeout,
};
vm.createContext(context);
vm.runInContext(`${productionPrefix}\nglobalThis.noteLinksApi = {
  extractNoteLinks: typeof extractNoteLinks === 'undefined' ? undefined : extractNoteLinks,
  noteLinksMarkup: typeof noteLinksMarkup === 'undefined' ? undefined : noteLinksMarkup,
};`, context);

assert.notEqual(context.noteLinksApi.extractNoteLinks, undefined);
assert.deepEqual(
  JSON.parse(JSON.stringify(context.noteLinksApi.extractNoteLinks(
    'Read https://example.com/docs, then http://localhost:3000/guide. Duplicate: https://example.com/docs and ignore javascript:alert(1).',
  ))),
  ['https://example.com/docs', 'http://localhost:3000/guide'],
);

assert.notEqual(context.noteLinksApi.noteLinksMarkup, undefined);
const markup = context.noteLinksApi.noteLinksMarkup('Reference https://example.com/search?q=rag&lang=en');
assert.match(markup, /href="https:\/\/example\.com\/search\?q=rag&amp;lang=en"/);
assert.match(markup, /target="_blank"/);
assert.match(markup, /rel="noopener noreferrer"/);
assert.match(markup, /Open link/);
assert.doesNotMatch(context.noteLinksApi.noteLinksMarkup('javascript:alert(1)'), /<a\b/);

console.log('clickable note links tests passed');
