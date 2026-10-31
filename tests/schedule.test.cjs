const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
// Load the actual TypeScript utilities without adding a test runtime dependency.
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};
const { expandSchedule, buildTodos, replaceSchedule } = require('../utils/schedule.ts');
const { toDateString } = require('../utils/date.ts');
const weekly = { mode: 'weekly', start: '2026-10-19', end: '2026-11-02', weekdays: [1, 3], times: ['09:00', '18:30'] };
const input = { title: '  운동  ', category: '개인 루틴', schedule: weekly };

test('weekly weekdays and multiple times expand across month boundaries inclusively', () => {
  const slots = expandSchedule(weekly);
  assert.equal(slots.length, 10);
  assert.deepEqual(slots[0], { date: '2026-10-19', time: '09:00' });
  assert.deepEqual(slots.at(-1), { date: '2026-11-02', time: '18:30' });
  assert.ok(!slots.some(s => s.date === '2026-10-20'));
});
test('different dates and multiple times are retained; exact duplicates collapse', () => {
  const slots = [{ date: '2026-10-19', time: '09:00' }, { date: '2026-10-19', time: '18:30' }, { date: '2026-10-20' }];
  assert.deepEqual(expandSchedule({ mode: 'dates', slots: [...slots, slots[0]] }), slots);
  assert.equal(expandSchedule({ ...weekly, times: ['09:00', '09:00'] }).length, 5);
});
test('reject empty weekdays, times, inverted dates, excessive ranges and no matches', () => {
  for (const change of [{ weekdays: [] }, { times: [] }, { end: '2026-10-18' }, { end: '2028-01-01' }, { end: weekly.start, weekdays: [2] }]) {
    assert.throws(() => expandSchedule({ ...weekly, ...change }));
  }
});
test('series edits preserve matching completion and IDs without affecting unrelated tasks', () => {
  const entries = buildTodos(input);
  entries[0].done = true;
  const other = buildTodos({ title: '다른 일', category: '기타', date: '2026-10-19' })[0];
  const edited = replaceSchedule([...entries, other], entries[0].id, { ...input, title: '산책', schedule: { ...weekly, times: ['09:00'] } });
  assert.equal(edited.length, 6);
  assert.equal(edited.find(t => t.id === entries[0].id).done, true);
  assert.equal(edited.find(t => t.id === entries[0].id).title, '산책');
  assert.equal(edited.find(t => t.id === other.id), other);
  assert.ok(edited.filter(t => t.scheduleId).every(t => t.scheduleId === entries[0].scheduleId));
});
test('one occurrence completion is independent and series can change to explicit dates', () => {
  const entries = buildTodos(input);
  entries[0].done = true;
  assert.equal(entries[1].done, false);
  const edited = replaceSchedule(entries, entries[0].id, { ...input, schedule: { mode: 'dates', slots: [{ date: '2026-12-25', time: '12:00' }] } });
  assert.equal(edited.length, 1);
  assert.equal(edited[0].date, '2026-12-25');
  assert.equal(edited[0].done, false);
});
test('local midnight stays on the selected date in Seoul', () => {
  assert.equal(toDateString(new Date(2026, 9, 19, 0, 0)), '2026-10-19');
});

test('legacy Korean midnight and afternoon times retain completion during migration', () => {
  const { normalizeTime } = require('../utils/schedule.ts');
  assert.equal(normalizeTime('오전 12:00'), '00:00');
  assert.equal(normalizeTime('오후 12:00'), '12:00');
  assert.equal(normalizeTime('오후 3:30'), '15:30');
  const old = buildTodos({ title: '기존', category: '기타', date: '2026-10-19', time: '오후 3:30' });
  old[0].done = true;
  const edited = replaceSchedule(old, old[0].id, { title: '수정', category: '기타', schedule: { mode: 'dates', slots: [{ date: '2026-10-19', time: '15:30' }] } });
  assert.equal(edited[0].id, old[0].id);
  assert.equal(edited[0].done, true);
});

test('reject malformed dates and times, including non-existent dates', () => {
  for (const slot of [{ date: '2026-02-30' }, { date: 'invalid' }, { date: '2026-10-19', time: '25:00' }]) {
    assert.throws(() => expandSchedule({ mode: 'dates', slots: [slot] }));
  }
  assert.throws(() => expandSchedule({ ...weekly, start: 'invalid' }));
});
