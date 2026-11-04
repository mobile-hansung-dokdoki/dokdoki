const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
const { createPersistentStore } = require('../utils/persistentStore.ts');
const { buildTodos, replaceSchedule, removeOccurrence } = require('../utils/schedule.ts');
const { decodeTodoState } = require('../utils/storageSchema.ts');
const { removeCategory } = require('../utils/category.ts');
const initial = { version: 1, todos: [], categories: ['과제', '기타'] };
function adapter() {
  const values = new Map();
  return { values, getItem: async k => values.get(k) ?? null, setItem: async (k,v) => { values.set(k,v); } };
}
test('restart restores additions, edits, completion, deletion and category reassignment', async () => {
  const io = adapter();
  const store = createPersistentStore('todos', initial, decodeTodoState, io);
  await store.load();
  const entries = buildTodos({ title: '과제', category: '과제', schedule: { mode: 'dates', slots: [{ date:'2026-11-02' },{ date:'2026-11-03' }] } });
  store.update(p => ({ ...p, todos: entries }));
  store.update(p => ({ ...p, todos: p.todos.map((t,i) => i === 0 ? { ...t, title:'수정', done:true, completedAt:'2026-11-02T01:00:00.000Z' } : t) }));
  store.update(p => ({ ...p, todos: removeOccurrence(p.todos, entries[1].id) }));
  store.update(p => ({ ...p, ...removeCategory(p.categories,p.todos,'과제') }));
  await store.flush();
  const restarted = createPersistentStore('todos', initial, decodeTodoState, io);
  await restarted.load();
  const state = restarted.getSnapshot().data;
  assert.equal(state.todos.length,1);
  assert.equal(state.todos[0].title,'수정');
  assert.equal(state.todos[0].done,true);
  assert.equal(state.todos[0].completedAt,'2026-11-02T01:00:00.000Z');
  assert.equal(state.todos[0].category,'기타');
  assert.deepEqual(state.categories,['기타']);
});
test('no empty write before hydration and corrupt data is retained', async () => {
  const io = adapter(); io.values.set('todos','{broken');
  const store = createPersistentStore('todos', initial, decodeTodoState, io);
  assert.throws(() => store.update(() => initial));
  await store.load();
  assert.equal(store.getSnapshot().loaded,false);
  assert.ok(store.getSnapshot().error);
  assert.equal(io.values.get('todos'),'{broken');
  io.values.set('todos',JSON.stringify(initial));
  await store.retry();
  assert.equal(store.getSnapshot().loaded,true);
});
test('writes serialize so a slow older write cannot overwrite a newer edit', async () => {
  const io = adapter(); let release; let calls=0;
  io.setItem = async (k,v) => { if (++calls===1) await new Promise(resolve => { release=resolve; }); io.values.set(k,v); };
  const store = createPersistentStore('count',0,x=>x,io);
  await store.load(); store.update(()=>1); store.update(()=>2);
  await Promise.resolve(); assert.equal(calls,1); release();
  await store.flush(); assert.equal(io.values.get('count'),'2'); assert.equal(store.getSnapshot().saving,false);
});
test('failed writes retain in-memory edits and retry saves the latest state', async () => {
  const io=adapter(); let fail=true;
  io.setItem=async(k,v)=>{if(fail)throw Error('disk full');io.values.set(k,v);};
  const store=createPersistentStore('count',0,x=>x,io);
  await store.load();store.update(()=>3);await store.flush();
  assert.ok(store.getSnapshot().error);assert.equal(store.getSnapshot().data,3);
  fail=false;await store.retry();assert.equal(io.values.get('count'),'3');assert.equal(store.getSnapshot().error,'');
});
test('deleting weekly occurrence survives editing remaining series and restoring storage', async () => {
  const input={title:'운동',category:'과제',schedule:{mode:'weekly',start:'2026-11-02',end:'2026-11-09',weekdays:[1],times:['09:00','18:00']}};
  const entries=buildTodos(input);
  const deleted=removeOccurrence(entries,entries[0].id);
  const revived=decodeTodoState(JSON.parse(JSON.stringify({...initial,todos:deleted}))).todos;
  const edited=replaceSchedule(revived,revived[0].id,{...input,title:'산책',schedule:revived[0].schedule});
  assert.equal(edited.length,3);
  assert.ok(!edited.some(t=>t.date==='2026-11-02'&&t.time==='09:00'));
});
test('profile text and image URI round trip through independent storage',async()=>{
  const io=adapter();const original={nickname:'데모',motto:'매일',photoUri:'file:///documents/profile.jpg'};
  const store=createPersistentStore('profile',{},x=>x,io);await store.load();store.update(()=>original);await store.flush();
  const next=createPersistentStore('profile',{},x=>x,io);await next.load();assert.deepEqual(next.getSnapshot().data,original);
});
