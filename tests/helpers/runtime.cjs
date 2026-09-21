// 실제 앱 코드를 읽어 실행하되 React Native 화면과 휴대폰 저장소는 대체합니다.
// 이 테스트는 로직 검증용이며 실제 기기 렌더링·키보드·네이티브 저장소 테스트는 별도입니다.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const turn = () => new Promise(resolve => setImmediate(resolve));

function deferred() {
  let resolve, reject;
  const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; });
  return {promise, resolve, reject};
}

function mount(entry, options = {}) {
  const memory = {value: options.initial ?? null, writes: [], alerts: []};
  const slots = [];
  let cursor = 0, pending = [], dirty = false, output, mounted = true;
  let props = options.props || {};
  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const react = {
    createElement: (type, props, ...children) => ({type, props: props || {}, children}),
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = {value: typeof initial === 'function' ? initial() : initial};
      return [slots[index].value, value => {
        slots[index].value = typeof value === 'function' ? value(slots[index].value) : value;
        dirty = true;
      }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = {current: initial};
      return slots[index];
    },
    useCallback(fn, deps) {
      const index = cursor++;
      if (!slots[index] || !same(slots[index].deps, deps)) slots[index] = {fn, deps};
      return slots[index].fn;
    },
    useEffect(fn, deps) {
      const index = cursor++;
      if (!slots[index] || !same(slots[index].deps, deps)) {
        const prior = slots[index];
        slots[index] = {deps};
        pending.push(() => { prior?.cleanup?.(); slots[index].cleanup = fn(); });
      }
    },
  };
  const animation = () => ({start: () => {}});
  const native = {
    Alert: {alert: (...args) => memory.alerts.push(args)},
    StyleSheet: {create: styles => styles},
    Keyboard: {dismiss: () => {}},
    Platform: {OS: 'android'},
    Animated: {Value: class {setValue() {}}, timing:animation,parallel:animation,sequence:animation,delay:animation,View:'Animated.View'},
  };
  for (const name of ['View','Text','TextInput','TouchableOpacity','TouchableWithoutFeedback','KeyboardAvoidingView','Modal','FlatList','ScrollView','SafeAreaView']) native[name] = name;
  const storage = {
    getItem: options.getItem || (async () => memory.value),
    setItem: async (key, value) => {
      memory.writes.push({key,value});
      if (options.setItem) await options.setItem(key, value);
      memory.value = value;
    },
  };
  const cache = new Map();
  function load(file) {
    const absolute = path.resolve(root, file);
    if (cache.has(absolute)) return cache.get(absolute);
    const exports = {};
    cache.set(absolute, exports);
    const context = {exports, setTimeout, clearTimeout, require: name => {
      if (name === 'react') return react;
      if (name === 'react-native') return native;
      if (name === '@expo/vector-icons') return {Ionicons:'Ionicons'};
      if (name === '@react-native-async-storage/async-storage') return storage;
      if (options.todoSnapshot && name === '../hooks/useTodos') return {useTodos:()=>options.todoSnapshot};
      if (name.startsWith('.')) {
        const base = path.resolve(path.dirname(absolute), name);
        const resolved = [base,base+'.ts',base+'.tsx',path.join(base,'index.ts')].find(candidate=>fs.existsSync(candidate)&&fs.statSync(candidate).isFile());
        if (resolved) return load(resolved);
      }
      throw new Error('Unexpected dependency: ' + name);
    }};
    const code = ts.transpileModule(fs.readFileSync(absolute,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
    vm.runInNewContext(code, context, {filename:absolute});
    return exports;
  }
  const entryModule = load(entry);
  const run = options.exportName ? entryModule[options.exportName] : entryModule.default;
  function render(nextProps) {
    if (nextProps) props = nextProps;
    cursor = 0; dirty = false;
    output = run(props);
    const effects = pending; pending = [];
    effects.forEach(effect => effect());
    return output;
  }
  render();
  return {
    memory, render, get current() {return output;},
    async settle() {
      for (let i = 0; i < 8; i++) { await turn(); if (dirty && mounted) render(); }
    },
    unmount() {mounted = false; slots.forEach(slot => slot?.cleanup?.());},
  };
}

const hook = options => mount('hooks/useTodos.ts', {...options, exportName:'useTodos'});
function flatten(node) {
  if (Array.isArray(node)) return node.flatMap(flatten);
  if (!node || typeof node !== 'object') return [node];
  return [node, ...(node.children || []).flatMap(flatten)];
}
function button(tree, label) {
  return flatten(tree).find(node=>node?.type==='TouchableOpacity' && flatten(node).includes(label));
}
module.exports = {mount, hook, flatten, button, deferred, turn};
