const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function createCore() {
  const saved = new Map();
  const context = vm.createContext({
    localStorage: { getItem: k => saved.get(k) ?? null, setItem: (k, v) => saved.set(k, v) },
    setInterval, clearInterval
  });
  const source = fs.readFileSync(`${__dirname}/src/SystemCore.js`, 'utf8').replace(/export /g, '');
  vm.runInContext(source + '\nglobalThis.Core = SystemCore;', context);
  return { core: new context.Core(), reload: () => new context.Core() };
}

test('virtual file edits persist and duplicate creation is rejected', () => {
  const { core, reload } = createCore();
  assert.equal(core.createDirectory('/home/user/demo').ok, true);
  assert.equal(core.createFile('/home/user/demo/note.txt', 'first').ok, true);
  assert.equal(core.createFile('/home/user/demo/note.txt').ok, false);
  assert.equal(core.writeFile('/home/user/demo/note.txt', 'updated').ok, true);
  assert.equal(reload().readFile('/home/user/demo/note.txt').content, 'updated');
  assert.equal(core.renameFile('/home/user/demo/note.txt', '/home/user/demo/done.txt').ok, true);
  assert.equal(core.deleteFile('/home/user/demo/done.txt').ok, true);
  assert.equal(core.readFile('/home/user/demo/done.txt').ok, false);
});

test('process lifecycle respects protected processes and validates priority', () => {
  const { core } = createCore();
  const process = core.spawnProcess('editor');
  assert.equal(process.ok, true);
  assert.equal(core.spawnProcess('editor').ok, false);
  assert.equal(core.sleepProcess('editor').ok, true);
  assert.equal(core.snapshot().processes.find(p => p.pid === process.pid).state, 'sleeping');
  assert.equal(core.wakeProcess('editor').ok, true);
  assert.equal(core.setPriority('editor', 'invalid').ok, false);
  assert.equal(core.killByPid(1).ok, false);
  assert.equal(core.killByPid(process.pid).ok, true);
  assert.equal(core.killByPid(process.pid).ok, false);
});
