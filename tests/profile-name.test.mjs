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
vm.runInContext(`${productionPrefix}\nglobalThis.profileTestApi = {
  profileInitials: typeof profileInitials === 'undefined' ? undefined : profileInitials,
  profileNeedsSetup: typeof profileNeedsSetup === 'undefined' ? undefined : profileNeedsSetup,
};`, context);

assert.equal(context.profileTestApi.profileInitials?.('Vishwa Reddy'), 'VR');
assert.equal(context.profileTestApi.profileInitials?.('Vishwa'), 'V');
assert.equal(context.profileTestApi.profileInitials?.(''), 'VR');
assert.equal(context.profileTestApi.profileNeedsSetup?.({ profileConfigured: false }), true);
assert.equal(context.profileTestApi.profileNeedsSetup?.({ profileConfigured: true }), false);

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /id="editProfile"/);
assert.match(html, /id="profileDesignation"/);

console.log('editable profile name tests passed');
