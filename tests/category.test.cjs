const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');

require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};

const { appendCategory, removeCategory } = require('../utils/category.ts');
const { buildTodos, replaceSchedule } = require('../utils/schedule.ts');

test('a new category is appended after existing choices and can be used to save and edit a todo', () => {
  const original = ['과제', '기타'];
  const categories = appendCategory(original, '  운동  ');
  assert.deepEqual(categories, ['과제', '기타', '운동']);
  assert.deepEqual(original, ['과제', '기타']);
  const todos = buildTodos({ title: '산책', category: categories.at(-1) });
  assert.equal(todos[0].category, '운동');
  const edited = replaceSchedule(todos, todos[0].id, { title: '달리기', category: '운동' });
  assert.equal(edited[0].category, '운동');
});

test('empty and duplicate category names are rejected without changing choices', () => {
  const categories = ['과제', '운동'];
  assert.throws(() => appendCategory(categories, '   '), /이름을 입력/);
  assert.throws(() => appendCategory(categories, ' 운동 '), /이미 있는/);
  assert.deepEqual(categories, ['과제', '운동']);
});

test('custom names matching object properties use the default category colors', () => {
  const { CategoryColors } = require('../theme/colors.ts');
  for (const name of ['constructor', '__proto__', 'toString']) {
    const categories = appendCategory(['기타'], name);
    const colors = CategoryColors[categories.at(-1)] ?? CategoryColors['기타'];
    assert.deepEqual(colors, { color: '#6B7280', bg: '#F3F4F6' });
  }
});

test('deleting a category preserves its tasks and moves them to Other', () => {
  const todos = [
    ...buildTodos({ title: '산책', category: '운동' }),
    ...buildTodos({ title: '공부', category: '과제' }),
  ];
  todos[0].done = true;
  const result = removeCategory(['과제', '기타', '운동'], todos, '운동');
  assert.deepEqual(result.categories, ['과제', '기타']);
  assert.equal(result.todos.length, 2);
  assert.equal(result.todos[0].category, '기타');
  assert.equal(result.todos[0].id, todos[0].id);
  assert.equal(result.todos[0].title, '산책');
  assert.equal(result.todos[0].done, true);
  assert.equal(result.todos[1], todos[1]);
  assert.equal(todos[0].category, '운동');
});

test('Other remains available as the destination for tasks from deleted categories', () => {
  const todos = buildTodos({ title: '정리', category: '기타' });
  const result = removeCategory(['기타'], todos, '기타');
  assert.deepEqual(result.categories, ['기타']);
  assert.equal(result.todos, todos);
});
