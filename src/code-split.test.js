import {transform} from '@babel/core';

import {getModule, getTemplate} from './code-split';


const jsx = (raw, ...args)=> {
  const source = String.raw({raw}, ...args);

  const {code} = transform(source, {
    envName: 'webpack',
    ast: true,
    sourceMaps: false
  });
  return code;
};


const entry = jsx`
  import React from 'react';

  import {Renderer, Styles, Scripts} from 'react-entry-loader/injectors';

  import App from './app';
  import {theme} from './app.css';

  const foo = 'needed by app';

  const Html = ({scripts, styles})=> (
    <html>
      <head>
        <title>JSX entrypoint</title>
        <Styles files={styles} />
        <Scripts files={scripts} />
      </head>
      <body>
        <Renderer id="test-app">
          <App theme={theme} foo={foo} />
        </Renderer>
      </body>
    </html>
  );

  export default Html;
`;


describe('code splitting', ()=> {
  it('extracts module code', ()=> {
    const {code} = getModule(entry);

    expect(code).toBe(jsx`
      import React from 'react';
      import App from './app';
      import {theme} from './app.css';
      const foo = 'needed by app';
      import {render} from "react-dom";
      render(
        <App theme={theme} foo={foo}/>,
        document.getElementById("test-app")
      );
    `);
  });


  it('extracts template code', ()=> {
    const {code} = getTemplate(entry);

    expect(code).toBe(jsx`
      import React from 'react';

      import {Renderer, Styles, Scripts} from 'react-entry-loader/injectors';

      const Html = ({scripts, styles})=> (
        <html>
          <head>
            <title>JSX entrypoint</title>
            <Styles files={styles} />
            <Scripts files={scripts} />
          </head>
          <body>
            <Renderer id="test-app" />
          </body>
        </html>
      );

      export default Html;
    `);
  });
});
