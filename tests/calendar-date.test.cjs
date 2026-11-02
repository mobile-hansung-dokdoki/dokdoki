const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};
const { relativeDayLabel, subscribeLocalDate } = require('../utils/date.ts');

test('calendar labels count signed calendar days across month, year, leap day and DST boundaries', t => {
  const originalTimezone = process.env.TZ;
  t.after(() => {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  });
  process.env.TZ = 'America/New_York';
  for (const [selected, today, expected] of [
    ['2026-10-31', '2026-10-31', '오늘'],
    ['2026-10-28', '2026-10-31', '-3D'],
    ['2026-11-03', '2026-10-31', '+3D'],
    ['2025-12-29', '2026-01-01', '-3D'],
    ['2027-01-03', '2026-12-31', '+3D'],
    ['2024-03-01', '2024-02-28', '+2D'],
    ['2026-03-09', '2026-03-07', '+2D'],
    ['2026-10-31', '2026-11-02', '-2D'],
  ]) {
    assert.equal(relativeDayLabel(selected, today), expected, `${selected} from ${today}`);
  }
});

test('calendar labels default to device-local today rather than the UTC date', t => {
  const originalTimezone = process.env.TZ;
  t.after(() => {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  });
  process.env.TZ = 'Asia/Seoul';
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-30T15:30:00Z') });
  assert.equal(relativeDayLabel('2026-10-31'), '오늘');
  assert.equal(relativeDayLabel('2026-10-28'), '-3D');
  assert.equal(relativeDayLabel('2026-11-03'), '+3D');
});

test('local date subscription refreshes at midnight and on resume, then disposes both listeners', t => {
  const originalTimezone = process.env.TZ;
  t.after(() => {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  });
  process.env.TZ = 'America/New_York';
  t.mock.timers.enable({
    apis: ['Date', 'setTimeout'],
    now: new Date('2026-03-07T23:59:59-05:00'),
  });
  const dates = [];
  let resume;
  let removed = false;
  const unsubscribe = subscribeLocalDate(date => dates.push(date), refresh => {
    resume = refresh;
    return () => { removed = true; };
  });
  t.after(unsubscribe);
  assert.equal(dates.at(-1), '2026-03-07');
  t.mock.timers.tick(1000);
  assert.equal(relativeDayLabel('2026-03-07', dates.at(-1)), '-1D');
  t.mock.timers.tick(23 * 60 * 60 * 1000);
  assert.equal(dates.at(-1), '2026-03-09');
  // Simulate a suspended app: the clock advances without running timers.
  t.mock.timers.setTime(new Date('2026-03-12T12:00:00-04:00').getTime());
  resume();
  assert.equal(relativeDayLabel('2026-03-07', dates.at(-1)), '-5D');
  t.mock.timers.tick(12 * 60 * 60 * 1000);
  assert.equal(dates.at(-1), '2026-03-13');
  unsubscribe();
  assert.equal(removed, true);
  const count = dates.length;
  t.mock.timers.tick(24 * 60 * 60 * 1000);
  assert.equal(dates.length, count);
});
