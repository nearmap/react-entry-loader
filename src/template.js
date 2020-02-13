/* eslint-env node */
import vm from 'vm';
import Module from 'module';
import {dirname} from 'path';

import {transform} from '@babel/core';
import React from 'react';
import ReactDomServer from 'react-dom/server';

// TODO: Workaround for un-escaping characters that should appear as is in HTML.
const sanitize = (html)=> (
  // un-escape `'` that is required in CSP meta tags.
  html.replace(
    /(<meta .+?"Content-Security-Policy".+?content=")(.+?)(".*?\/>)/g,
    (_, start, policy, end)=> `${start}${policy.replace(/&#x27;/g, "'")}${end}`
  )
);

const getRequire = (parentContext, compilation, exec)=> (req)=> {
  // TODO: needed for tests to be able to import react-entry-loader
  // should find a better way to handle this, e.g. using webpack's resolver
  if (req.startsWith('@nearmap/react-entry-loader/')) {
    req = req.replace('@nearmap/react-entry-loader', __dirname);
  }

  // TODO: should use webpack's resolver
  const path = require.resolve(req, {paths: [parentContext]});

  for (const mod of compilation.modules) {
    if (mod.resource === path) {
      const source = mod.originalSource().source();
      const filename = mod.userRequest;
      const context = dirname(path);
      return exec(context, filename, source, compilation);
    }
  }

  // This is only called if the template imports something that
  // is not used by any webpack modules, e.g. the injectors
  return require(path);
};


const exec = (context, filename, source, compilation)=> {
  // we need to transform import and export statements that might be
  // used in webpack compiled modules
  const {code} = transform(source, {filename});

  const module = {exports: {}};

  const options = {
    filename,
    lineOffset: 0,
    displayErrors: true
  };

  const compiledWrapper = vm.runInThisContext(Module.wrap(code), options);
  const boundWrapper = compiledWrapper.bind(module.exports);

  const require = getRequire(context, compilation, exec);
  boundWrapper(module.exports, require, module, filename, context);

  return module.exports;
};


/**
 * Exectue the template `code` and render the exported
 * react component with the given `props`.
 */
const getRunner = (compilation)=> async (filename, context, {code}, props)=> {
  const Html = exec(context, filename, code, compilation).default;

  // TODO: should we only renderToString if module component was hydratable?
  const html = ReactDomServer.renderToString(
    React.createElement(Html, props)
  );
  return sanitize(`<!DOCTYPE html>${html}`);
};

export default getRunner;
