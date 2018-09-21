import React from 'react';

import {Renderer, Styles, Scripts} from 'react-entry-loader/injectors';

import App from './app';
import theme from './page1.css';


const Html = ({scripts, styles})=> (
  <html>
    <head>
      <title>Page 1</title>
      <Styles files={styles} />
      <Scripts files={scripts} async />
    </head>
    <body>
      <Renderer id="page1-app" className={theme.root}>
        <App theme={theme} />
      </Renderer>
    </body>
  </html>
);

export default Html;
