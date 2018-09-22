/* eslint-env node */
import React from 'react';

import {hydrate} from 'react-entry-loader/render';
import {Module, Styles, Scripts} from 'react-entry-loader/injectors';

import App from './app';
import GeneratedCode from './code-gen';


const Html = ({scripts, styles})=> (
  <html>
    <head>
      <title>react-entry-loader</title>
      <Styles files={styles} />
    </head>
    <body>
      <div id="page2-app">
        <Module hydratable onLoad={hydrate('page2-app')}>
          <App page={2} />
        </Module>
      </div>

      <Scripts files={scripts} />

      <GeneratedCode filename={__filename} />
    </body>
  </html>
);

export default Html;
