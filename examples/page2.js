import React from 'react';

import {Renderer, Styles, Scripts} from 'react-entry-loader/injectors';

import Header from './header';
import App from './app';


const Html = ({scripts, styles})=> (
  <html>
    <head>
      <title>Page 2</title>
      <Styles files={styles} />
      <Scripts files={scripts} />
    </head>
    <body>
      <Header page={2} />
      <Renderer id="page2-app">
        <App />
      </Renderer>
    </body>
  </html>
);

export default Html;
