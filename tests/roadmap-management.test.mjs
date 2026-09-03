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
vm.runInContext(`${productionPrefix}\nglobalThis.roadmapApi = {
  activeRoadmaps, roadmapKeys, validateRoadmapImport, applyRoadmapImport,
  moveRoadmap, deleteRoadmap, state,
};`, context);

const payload = {
  schemaVersion: 1,
  roadmaps: [{
    id: 'computer-vision',
    title: 'Computer Vision',
    label: 'COMPUTER VISION ROADMAP',
    description: 'Learn modern vision systems.',
    phases: [{
      id: 'foundations', title: 'Foundations', description: 'Start here.',
      topics: [{
        id: 'image-tensors', title: 'Image tensors', description: 'Pixels and channels.',
        subtopics: [{ id: 'pixels', title: 'Pixels' }, { id: 'channels', title: 'Channels' }],
      }],
    }],
  }],
};

const validated = context.roadmapApi.validateRoadmapImport(payload);
assert.equal(validated.length, 1);
assert.equal(validated[0].name, 'Computer Vision');
assert.equal(validated[0].phases[0].topics[0].subtopics.length, 2);

assert.deepEqual(JSON.parse(JSON.stringify(context.roadmapApi.applyRoadmapImport(payload))), { added: ['computer-vision'], updated: [] });
assert.deepEqual(JSON.parse(JSON.stringify(context.roadmapApi.roadmapKeys())), ['ai', 'dl', 'computer-vision']);
assert.equal(context.roadmapApi.activeRoadmaps()['computer-vision'].name, 'Computer Vision');

assert.throws(() => context.roadmapApi.validateRoadmapImport({ schemaVersion: 1, roadmaps: [{ ...payload.roadmaps[0], id: 'Bad ID' }] }), /kebab-case/i);
assert.throws(() => context.roadmapApi.applyRoadmapImport({ schemaVersion: 1, roadmaps: [{ ...payload.roadmaps[0], id: 'ai' }] }), /built-in/i);
assert.throws(() => context.roadmapApi.applyRoadmapImport({
  schemaVersion: 1,
  roadmaps: [
    { ...payload.roadmaps[0], id: 'must-not-partially-import', title: 'Atomic import' },
    { ...payload.roadmaps[0], id: 'dl', title: 'Collision' },
  ],
}), /built-in/i);
assert.equal(context.roadmapApi.activeRoadmaps()['must-not-partially-import'], undefined);

context.roadmapApi.moveRoadmap('computer-vision', -1);
assert.deepEqual(JSON.parse(JSON.stringify(context.roadmapApi.roadmapKeys())), ['ai', 'computer-vision', 'dl']);
context.roadmapApi.moveRoadmap('computer-vision', -1);
assert.deepEqual(JSON.parse(JSON.stringify(context.roadmapApi.roadmapKeys())), ['computer-vision', 'ai', 'dl']);

context.roadmapApi.state.notes['computer-vision-image-tensors'] = 'Keep this note';
assert.equal(context.roadmapApi.deleteRoadmap('computer-vision'), true);
assert.deepEqual(JSON.parse(JSON.stringify(context.roadmapApi.roadmapKeys())), ['ai', 'dl']);
assert.equal(context.roadmapApi.state.notes['computer-vision-image-tensors'], 'Keep this note');

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /id="roadmapNav"/);
assert.match(html, /id="addRoadmapButton"/);
assert.match(html, /id="manageRoadmapsButton"/);
assert.match(html, /id="roadmapInput"/);

console.log('roadmap management tests passed');
