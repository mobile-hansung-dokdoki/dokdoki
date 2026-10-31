const { test } = require('node:test');
const assert = require('node:assert/strict');

test('web renderer matches React and can render without a version mismatch', () => {
  const React = require('react');
  const renderer = require('react-dom/server');
  assert.equal(require('react-dom/package.json').version, React.version);
  assert.equal(renderer.renderToString(React.createElement('div', null, 'render-ok')), '<div>render-ok</div>');
});

test('React also matches the installed native renderer', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const root = path.dirname(require.resolve('react-native/package.json'));
  const source = fs.readFileSync(path.join(root, 'Libraries/Renderer/implementations/ReactFabric-dev.js'), 'utf8');
  const version = source.match(/reconcilerVersion: "([^"]+)"/);
  assert.ok(version, 'native renderer version must be detectable');
  assert.equal(require('react').version, version[1]);
});
