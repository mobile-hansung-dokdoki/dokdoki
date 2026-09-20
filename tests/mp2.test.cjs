const test = require('node:test');
const assert = require('node:assert/strict');
const {mount, hook, flatten, button, deferred, turn} = require('./helpers/runtime.cjs');
const oldTodo = {id:'old',text:'기존 과제',done:true,dueDate:'2026-09-21',createdAt:1,updatedAt:2};
const snapshot = app => JSON.parse(app.memory.value);

test('기존 목록과 카테고리가 없는 데이터 복원: 초기 읽기만으로 덮어쓰지 않음', async () => {
  const app = hook({initial:JSON.stringify([oldTodo])}); await app.settle();
  assert.equal(app.current.todos[0].text, '기존 과제');
  assert.equal(app.current.todos[0].done, true);
  assert.equal(app.current.todos[0].category, 'none');
  assert.equal(app.memory.writes.length, 0);
});

test('추가·수정·완료·삭제·카테고리 변경을 저장하고 새 실행에서 복원', async () => {
  const app = hook(); await app.settle();
  app.current.addTodo(' 과제하기 ', '2026-09-22', 'school'); await app.settle();
  const id = app.current.todos[0].id;
  assert.equal(app.current.todos[0].text, '과제하기');
  app.current.editTodo(id, '팀 회의', '2026-09-23', 'appointment');
  app.current.toggleTodo(id); await app.settle();
  const restarted = hook({initial:app.memory.value}); await restarted.settle();
  assert.equal(restarted.current.todos[0].text, '팀 회의');
  assert.equal(restarted.current.todos[0].category, 'appointment');
  assert.equal(restarted.current.todos[0].done, true);
  assert.equal(restarted.current.todos[0].dueDate, '2026-09-23');
  restarted.current.deleteTodo(id); await restarted.settle();
  assert.equal(restarted.memory.value, '[]');
  const empty = hook({initial:restarted.memory.value}); await empty.settle();
  assert.equal(empty.current.todos.length, 0);
});

test('빈 입력·공백 수정은 무시하고 동일한 제목도 다른 항목으로 관리', async () => {
  const app = hook(); await app.settle();
  app.current.addTodo('   '); await app.settle();
  assert.equal(app.current.todos.length, 0);
  assert.equal(app.memory.writes.length, 0);
  app.current.addTodo('운동'); app.current.addTodo('운동'); await app.settle();
  assert.equal(app.current.todos.length, 2);
  assert.notEqual(app.current.todos[0].id, app.current.todos[1].id);
  app.current.editTodo(app.current.todos[0].id,'  '); await app.settle();
  assert.equal(app.current.todos[0].text,'운동');
});

test('전체·완료·미완료 필터와 즉시 검색을 결합해도 전체 목록은 유지', async () => {
  const initial = [
    {...oldTodo,id:'a',text:'과제하기',done:true},
    {...oldTodo,id:'b',text:'운동하기',done:false},
    {...oldTodo,id:'c',text:'React 공부',done:false},
  ];
  const app = hook({initial:JSON.stringify(initial)}); await app.settle();
  app.current.setFilter('done'); await app.settle();
  assert.equal(app.current.filteredTodos.length,1);
  app.current.setFilter('active'); await app.settle();
  assert.equal(app.current.filteredTodos.length,2);
  app.current.setSearchQuery('REACT'); await app.settle();
  assert.equal(app.current.filteredTodos[0].id,'c');
  app.current.setSearchQuery('검색 결과 없음'); await app.settle();
  assert.equal(app.current.filteredTodos.length,0);
  assert.equal(app.current.todos.length,3);
  assert.equal(app.current.doneCount,1);
  app.current.setFilter('all'); app.current.setSearchQuery(''); await app.settle();
  assert.equal(app.current.filteredTodos.length,3);
  assert.equal(app.memory.writes.length,0);
});

test('불러오는 중 추가한 항목은 기존 데이터 위에 반영', async () => {
  const gate = deferred();
  const app = hook({getItem:()=>gate.promise});
  app.current.addTodo('대기 중 추가',undefined,'personal');
  assert.equal(app.memory.writes.length,0);
  gate.resolve(JSON.stringify([oldTodo])); await app.settle();
  assert.equal(app.current.todos.length,2);
  assert.equal(snapshot(app).find(todo=>todo.text==='대기 중 추가').category,'personal');
});

test('연속 변경 저장을 순서대로 처리', async () => {
  const gate = deferred(); let calls = 0;
  const app = hook({setItem:async()=>{if (++calls===1) await gate.promise;}}); await app.settle();
  app.current.addTodo('첫 번째'); app.current.addTodo('두 번째');
  await turn(); assert.equal(calls,1);
  gate.resolve(); await app.settle();
  assert.equal(snapshot(app).length,2);
});

test('읽기 실패 후 재시도: 저장소와 대기 변경 보호', async () => {
  let fail = true;
  const app = hook({getItem:async()=>{if(fail) throw new Error('read'); return JSON.stringify([oldTodo]);}});
  await app.settle(); app.current.addTodo('대기 항목');
  assert.equal(app.memory.writes.length,0);
  fail = false;
  app.memory.alerts[0][2][0].onPress(); app.render(); await app.settle();
  assert.equal(app.current.todos.length,2);
});

test('손상 JSON·잘못된 데이터 구조·중복 ID를 빈 목록으로 덮어쓰지 않음', async () => {
  for (const raw of ['broken','{}',JSON.stringify([{...oldTodo,done:'yes'}]),JSON.stringify([oldTodo,oldTodo])]) {
    const app = hook({initial:raw}); await app.settle();
    app.current.addTodo('대기'); await app.settle();
    assert.equal(app.memory.value,raw);
    assert.equal(app.memory.writes.length,0);
    assert.equal(app.memory.alerts.length,1);
  }
});

test('저장 실패 후 재시도는 과거 값이 아니라 최신 내용을 저장', async () => {
  let fail = true;
  const app = hook({initial:JSON.stringify([oldTodo]),setItem:async()=>{if(fail) throw new Error('write');}});
  await app.settle();
  app.current.editTodo('old','첫 수정'); await app.settle();
  app.current.editTodo('old','마지막 수정',undefined,'school'); await app.settle();
  fail = false;
  app.memory.alerts[0][2].find(item=>item.text==='다시 저장').onPress(); await app.settle();
  assert.equal(snapshot(app)[0].text,'마지막 수정');
  assert.equal(snapshot(app)[0].category,'school');
});

test('알 수 없는 카테고리는 미분류로 열고 기존 내용 유지', async () => {
  const app = hook({initial:JSON.stringify([{...oldTodo,category:'unknown'}])}); await app.settle();
  assert.equal(app.current.todos[0].category,'none');
  assert.equal(app.current.todos[0].text,oldTodo.text);
  app.current.editTodo('old','내용만 수정'); await app.settle();
  assert.equal(snapshot(app)[0].category,'none');
});

test('카테고리 선택 화면의 네 가지 선택지와 선택 상태', async () => {
  let selected;
  const app = mount('components/CategoryPicker.tsx',{props:{value:'school',onChange:value=>selected=value}});
  const radios = flatten(app.current).filter(node=>node?.props?.accessibilityRole==='radio');
  assert.equal(radios.length,4);
  assert.equal(radios.find(node=>node.props.accessibilityLabel==='학교').props.accessibilityState.checked,true);
  radios.find(node=>node.props.accessibilityLabel==='개인').props.onPress();
  assert.equal(selected,'personal');
});

test('추가 화면에서 선택한 카테고리를 저장 콜백에 전달하고 재개방 때 초기화', async () => {
  let submitted;
  const props = {visible:true,onClose:()=>{},onAdd:(...args)=>submitted=args};
  const app = mount('components/AddTodoModal.tsx',{props}); await app.settle();
  let nodes = flatten(app.current);
  nodes.find(node=>node?.type==='TextInput').props.onChangeText(' 학교 과제 ');
  nodes.find(node=>node?.type?.name==='CategoryPicker').props.onChange('school');
  await app.settle();
  button(app.current,'완료').props.onPress();
  assert.equal(submitted[0],'학교 과제'); assert.equal(submitted[2],'school');
  app.render({...props,visible:false}); app.render(props); await app.settle();
  assert.equal(flatten(app.current).find(node=>node?.type?.name==='CategoryPicker').props.value,'none');
});

test('수정 화면이 기존 카테고리를 표시하고 변경한 카테고리를 전달', async () => {
  let submitted;
  const app = mount('components/EditTodoModal.tsx',{props:{visible:true,todo:{...oldTodo,category:'school'},onClose:()=>{},onEdit:(...args)=>submitted=args}});
  await app.settle();
  let picker = flatten(app.current).find(node=>node?.type?.name==='CategoryPicker');
  assert.equal(picker.props.value,'school');
  picker.props.onChange('appointment'); await app.settle();
  button(app.current,'저장').props.onPress();
  assert.equal(submitted[0],'old'); assert.equal(submitted[3],'appointment');
});

test('목록에 카테고리 이름과 서로 다른 색상을 표시', () => {
  const colors = new Set();
  for (const [id,label] of [['none','미분류'],['school','학교'],['personal','개인'],['appointment','약속']]) {
    const app = mount('components/TodoItem.tsx',{props:{todo:{...oldTodo,category:id},onToggle:()=>{},onEdit:()=>{},onDelete:()=>{}}});
    const node = flatten(app.current).find(node=>node?.type==='Text' && node.children.includes(label));
    assert.ok(node); colors.add(node.props.style[1].color);
  }
  assert.equal(colors.size,4);
});

test('완료율: 빈 목록·반올림·전체 완료·필터/검색 독립성·항목 수 변경', () => {
  for (const [total,done,visible,expected] of [[0,0,0,0],[3,0,3,0],[3,1,3,33],[3,1,1,33],[3,1,0,33],[3,2,2,67],[3,3,3,100],[4,3,4,75],[2,1,2,50]]) {
    const todos = Array.from({length:total},(_,id)=>({id:String(id)}));
    const app = mount('screens/TodoListScreen.tsx',{todoSnapshot:{todos,doneCount:done,filteredTodos:todos.slice(0,visible)}});
    const nodes = flatten(app.current);
    const progress = nodes.find(node=>node?.props?.accessibilityRole==='progressbar');
    assert.equal(progress.props.accessibilityValue.now,expected);
    const label = nodes.find(node=>node?.type==='Text' && node.children.includes('%'));
    assert.equal(label.children.join(''),expected+'%');
    const fill = nodes.find(node=>node?.type==='View' && Array.isArray(node.props.style) && node.props.style[1]?.width);
    assert.equal(fill.props.style[1].width,expected+'%');
  }
});
