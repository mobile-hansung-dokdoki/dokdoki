const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');

let pickerResult;
let pickerError;
let pickerOptions;
const originalLoad = Module._load;
const originalTs = require.extensions['.ts'];
let normalizeProfile, pickProfilePhoto;
try {
  require.extensions['.ts'] = (module, filename) => {
    module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText, filename);
  };
  Module._load = function (name, parent, isMain) {
    if (name === 'expo-image-picker') return {
      launchImageLibraryAsync: async options => {
        pickerOptions = options;
        if (pickerError) throw pickerError;
        return pickerResult;
      },
    };
    return originalLoad.call(this, name, parent, isMain);
  };
  ({ normalizeProfile, pickProfilePhoto } = require('../utils/profile.ts'));
} finally {
  Module._load = originalLoad;
  if (originalTs) require.extensions['.ts'] = originalTs;
  else delete require.extensions['.ts'];
}

test('profile changes trim the nickname and keep the chosen device photo', () => {
  const input = { nickname: '  민수  ', photoUri: 'file:///profile.jpg' };
  assert.deepEqual(normalizeProfile(input), {
    nickname: '민수', photoUri: 'file:///profile.jpg', motto: '할일을 꾸준히 하고 있어요',
  });
  assert.equal(input.nickname, '  민수  ');
  assert.deepEqual(normalizeProfile({ nickname: '민수', photoUri: undefined }), {
    nickname: '민수', photoUri: undefined, motto: '할일을 꾸준히 하고 있어요',
  });
});

test('the profile motto can be customized and blank text restores the default', () => {
  assert.equal(normalizeProfile({ nickname: '민수', motto: '  오늘도 한 걸음  ' }).motto, '오늘도 한 걸음');
  assert.equal(normalizeProfile({ nickname: '민수', motto: '   ' }).motto, '할일을 꾸준히 하고 있어요');
});

test('empty and overlong nicknames are rejected', () => {
  assert.throws(() => normalizeProfile({ nickname: '   ' }), /닉네임을 입력/);
  assert.throws(() => normalizeProfile({ nickname: '가'.repeat(21) }), /20자 이내/);
  assert.equal(normalizeProfile({ nickname: '가'.repeat(20) }).nickname.length, 20);
});

test('photo selection opens the image library with square editing and returns the device URI', async () => {
  pickerError = undefined;
  pickerResult = { canceled: false, assets: [{ uri: 'file:///selected.jpg' }] };
  assert.equal(await pickProfilePhoto(), 'file:///selected.jpg');
  assert.deepEqual(pickerOptions.mediaTypes, ['images']);
  assert.equal(pickerOptions.allowsEditing, true);
  assert.deepEqual(pickerOptions.aspect, [1, 1]);
});

test('canceling the device picker returns no replacement photo', async () => {
  pickerError = undefined;
  pickerResult = { canceled: true, assets: null };
  assert.equal(await pickProfilePhoto(), undefined);
});

test('device picker failures are passed to the editor for visible error feedback', async () => {
  pickerError = new Error('photo access denied');
  await assert.rejects(pickProfilePhoto(), /photo access denied/);
  pickerError = undefined;
});
