const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToString } = require('react-dom/server');

const buttons = new Map();
const inputs = new Map();
const images = [];
const switches = [];
const calls = [];
const navigation = {
  navigate: (...args) => calls.push(args),
  goBack: () => calls.push(['back']),
};
const Container = ({ children }) => React.createElement(React.Fragment, null, children);
const native = {
  View: Container,
  Text: Container,
  ScrollView: Container,
  KeyboardAvoidingView: Container,
  TextInput: props => {
    inputs.set(props.accessibilityLabel, props);
    return null;
  },
  Image: props => { images.push(props); return null; },
  Switch: props => { switches.push(props); return null; },
  TouchableOpacity: props => {
    if (props.accessibilityLabel) buttons.set(props.accessibilityLabel, props.onPress);
    return React.createElement(Container, null, props.children);
  },
  StyleSheet: { create: styles => styles },
  Platform: { OS: 'ios' },
  Animated: { Value: class { constructor(value) { this.value = value; } } },
};

const originalLoad = Module._load;
const originalTs = require.extensions['.ts'];
const originalTsx = require.extensions['.tsx'];
const compile = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
  }).outputText, filename);
};

let HomeScreen, ProfileScreen, ProfileDetailScreen, TodosProvider, ProfileProvider, ProfileAvatar, NotificationSettingsScreen;
try {
  require.extensions['.ts'] = compile;
  require.extensions['.tsx'] = compile;
  // Only native platform and navigation boundaries are replaced; app components and state are real.
  Module._load = function (name, parent, isMain) {
    if (name === 'react-native') return native;
    if (name === 'react-native-safe-area-context') return { SafeAreaView: Container };
    if (name === '@expo/vector-icons') return { Ionicons: () => null };
    if (name === 'react-native-svg') return { __esModule: true, default: Container, Circle: () => null };
    if (name === '@react-navigation/native') return { useNavigation: () => navigation };
    if (name === 'expo-image-picker') return { launchImageLibraryAsync: async () => ({ canceled: true, assets: null }) };
    return originalLoad.call(this, name, parent, isMain);
  };
  HomeScreen = require('../screens/HomeScreen.tsx').default;
  ProfileScreen = require('../screens/ProfileScreen.tsx').default;
  ProfileDetailScreen = require('../screens/ProfileDetailScreen.tsx').default;
  NotificationSettingsScreen = require('../screens/NotificationSettingsScreen.tsx').default;
  ({ TodosProvider } = require('../navigation/TodosContext.tsx'));
  ({ ProfileProvider } = require('../navigation/ProfileContext.tsx'));
  ProfileAvatar = require('../components/ProfileAvatar.tsx').default;
} finally {
  Module._load = originalLoad;
  if (originalTs) require.extensions['.ts'] = originalTs;
  else delete require.extensions['.ts'];
  if (originalTsx) require.extensions['.tsx'] = originalTsx;
  else delete require.extensions['.tsx'];
}

function render(Screen, props = {}) {
  buttons.clear();
  inputs.clear();
  images.length = 0;
  switches.length = 0;
  calls.length = 0;
  return renderToString(React.createElement(TodosProvider, null,
    React.createElement(ProfileProvider, null, React.createElement(Screen, props))));
}

test('pressing the home avatar opens the existing My Info tab', () => {
  render(HomeScreen);
  assert.equal(typeof buttons.get('내 정보로 이동'), 'function');
  buttons.get('내 정보로 이동')();
  assert.deepEqual(calls, [['Tabs', { screen: 'Profile' }]]);
});

test('pressing My Profile opens the separate profile screen', () => {
  const content = render(ProfileScreen);
  assert.match(content, /할일을 꾸준히 하고 있어요/);
  assert.match(content, /프로필 설정에서 변경할 수 있어요/);
  assert.equal(typeof buttons.get('나의 프로필 열기'), 'function');
  buttons.get('나의 프로필 열기')();
  assert.deepEqual(calls, [['ProfileDetail']]);
});

test('pressing notification settings opens its own screen', () => {
  render(ProfileScreen);
  buttons.get('알림 설정')();
  assert.deepEqual(calls, [['NotificationSettings']]);
});

test('notification settings disclose the unavailable delivery feature and return to My Info', () => {
  const content = render(NotificationSettingsScreen, { navigation });
  assert.match(content, /알림 기능 준비 중/);
  assert.match(content, /실제 알림 발송은 아직 연결되지 않았어요/);
  for (const label of ['전체 알림', '할 일 알림', '일일 요약']) {
    const control = switches.find(item => item.accessibilityLabel === label);
    assert.ok(control, label);
    assert.equal(control.disabled, true);
    assert.equal(control.value, false);
  }
  buttons.get('내 정보로 돌아가기')();
  assert.deepEqual(calls, [['back']]);
});

test('the profile editor shows the current nickname, photo action and a working back button', () => {
  render(ProfileDetailScreen, { navigation });
  assert.equal(inputs.get('닉네임').value, '나');
  assert.equal(inputs.get('닉네임').maxLength, 20);
  assert.equal(inputs.get('소개 / 좌우명').value, '할일을 꾸준히 하고 있어요');
  assert.equal(typeof buttons.get('프로필 사진 변경'), 'function');
  buttons.get('내 정보로 돌아가기')();
  assert.deepEqual(calls, [['back']]);
});

test('profile avatars display the chosen local image or the nickname initial', () => {
  images.length = 0;
  renderToString(React.createElement(ProfileAvatar, {
    profile: { nickname: '민수', photoUri: 'file:///profile.jpg' }, size: 56,
  }));
  assert.deepEqual(images[0].source, { uri: 'file:///profile.jpg' });
  assert.equal(images[0].accessibilityLabel, '민수의 프로필 사진');
  const initial = renderToString(React.createElement(ProfileAvatar, { profile: { nickname: '민수' }, size: 32 }));
  assert.equal(initial, '민');
});
