/* eslint-env node */
import vm from 'vm';
import Module from 'module';
import {dirname, join} from 'path';

import {transform} from '@babel/core';
import React from 'react';
import ReactDomServer from 'react-dom/server';


const getRequire = (parentContext, compilation, exec)=> (req)=> {
  // TODO: needed for tests to be able to import react-entry-loader
  // should find a better way to handle this, e.g. using webpack's resolver
  if (req === 'react-entry-loader/injectors') {
    req = join(__dirname, 'injectors');
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
  const {code} = transform(source);

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

  const html = ReactDomServer.renderToStaticMarkup(
    React.createElement(Html, props)
  );
  return `<!DOCTYPE html>${html}`;
};

export default getRunner;
