const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToString } = require('react-dom/server');

const renderedText = [];
const Container = ({ children }) => React.createElement(React.Fragment, null, children);
const originalLoad = Module._load;
const originalTs = require.extensions['.ts'];
const originalTsx = require.extensions['.tsx'];
let SyncStatusBadge, Colors;
try {
  const compile = (module, filename) => {
    module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.React,
        esModuleInterop: true,
      },
    }).outputText, filename);
  };
  require.extensions['.ts'] = compile;
  require.extensions['.tsx'] = compile;
  Module._load = function (name, parent, isMain) {
    if (name === 'react-native') return {
      View: Container,
      Text: props => {
        renderedText.push(props);
        return React.createElement(Container, null, props.children);
      },
      StyleSheet: { create: styles => styles },
    };
    return originalLoad.call(this, name, parent, isMain);
  };
  SyncStatusBadge = require('../components/SyncStatusBadge.tsx').default;
  ({ Colors } = require('../theme/colors.ts'));
} finally {
  Module._load = originalLoad;
  if (originalTs) require.extensions['.ts'] = originalTs;
  else delete require.extensions['.ts'];
  if (originalTsx) require.extensions['.tsx'] = originalTsx;
  else delete require.extensions['.tsx'];
}

for (const [synced, label, color] of [
  [true, '동기화', Colors.green],
  [false, '비 동기화', Colors.red],
]) {
  test(`sync status renders ${label} with its corresponding color`, () => {
    renderedText.length = 0;
    const content = renderToString(React.createElement(SyncStatusBadge, { synced }));
    assert.equal(content, label);
    const style = Object.assign({}, ...renderedText[0].style);
    assert.equal(style.color, color);
  });
}
