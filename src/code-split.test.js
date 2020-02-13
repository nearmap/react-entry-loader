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


describe('App rendered at runtime', ()=> {

  const entry = jsx`
    import React from 'react';
    import render from '@nearmap/react-entry-loader/render';
    import {
      Module,
      Styles,
      Scripts
    } from '@nearmap/react-entry-loader/injectors';

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
          <div id="test-app">
            <Module onLoad={render('test-app')}>
              <App theme={theme} foo={foo} />
            </Module>
          </div>
        </body>
      </html>
    );

    export default Html;
  `;


  it('extracts module code', ()=> {
    const {code} = getModule(entry);

    expect(code).toBe(jsx`
      import React from 'react';
      import render from '@nearmap/react-entry-loader/render';
      import App from './app';
      import {theme} from './app.css';
      const foo = 'needed by app';

      render('test-app')(<App theme={theme} foo={foo}/>);
    `);
  });


  it('extracts template code', ()=> {
    const {code} = getTemplate(entry);

    expect(code).toBe(jsx`
      import React from 'react';

      import {
        Module,
        Styles,
        Scripts
      } from '@nearmap/react-entry-loader/injectors';

      const Html = ({scripts, styles})=> (
        <html>
          <head>
            <title>JSX entrypoint</title>
            <Styles files={styles} />
            <Scripts files={scripts} />
          </head>
          <body>
            <div id="test-app">
              <Module {...{}}/>
            </div>
          </body>
        </html>
      );

      export default Html;
    `);
  });
});


describe('App rendered at compile time and hydrated at runtiume', ()=> {

  const entry = jsx`
    import React from 'react';
    import {hydrate} from '@nearmap/react-entry-loader/render';
    import {
      Module,
      Styles,
      Scripts
    } from '@nearmap/react-entry-loader/injectors';

    import App from './app';

    const Html = ({scripts, styles})=> (
      <html>
        <head>
          <title>Hydrated App</title>
          <Styles files={styles} />
          <Scripts files={scripts} />
        </head>
        <body>
          <div id="test-app">
            <Module hydratable onLoad={hydrate('test-app')}>
              <App />
            </Module>
          </div>
        </body>
      </html>
    );

    export default Html;
  `;


  it('extracts module code', ()=> {
    const {code} = getModule(entry);

    expect(code).toBe(jsx`
      import React from 'react';
      import {hydrate} from '@nearmap/react-entry-loader/render';
      import App from './app';

      hydrate('test-app')(<App />);
    `);
  });


  it('extracts template code', ()=> {
    const {code} = getTemplate(entry);

    expect(code).toBe(jsx`
      import React from 'react';
      import {
        Module,
        Styles,
        Scripts
      } from '@nearmap/react-entry-loader/injectors';

      import App from './app';

      const Html = ({scripts, styles})=> (
        <html>
          <head>
            <title>Hydrated App</title>
            <Styles files={styles} />
            <Scripts files={scripts} />
          </head>
          <body>
            <div id="test-app">
              <Module hydratable>
                <App />
              </Module>
            </div>
          </body>
        </html>
      );

      export default Html;
    `);
  });
});


describe('no child to render', ()=> {

  const entry = jsx`
    import React from 'react';
    import {Module, Scripts} from '@nearmap/react-entry-loader/injectors';

    import {signingSilent} from './silent-signing';

    const Html = ({scripts})=> (
      <html>
        <head>
          <title>silent-signin hidden iframe</title>
          <Scripts files={scripts} />
        </head>
        <body>
          <Module onLoad={signingSilent} />
        </body>
      </html>
    );

    export default Html;
  `;


  it('extracts module code', ()=> {
    const {code} = getModule(entry);

    expect(code).toBe(jsx`
      import {signingSilent} from './silent-signing';
      signingSilent();
    `);
  });


  it('extracts template code', ()=> {
    const {code} = getTemplate(entry);

    expect(code).toBe(jsx`
      import React from 'react';
      import {Module, Scripts} from '@nearmap/react-entry-loader/injectors';

      const Html = ({scripts})=> (
        <html>
          <head>
            <title>silent-signin hidden iframe</title>
            <Scripts files={scripts} />
          </head>
          <body>
            <Module {...{}}/>
          </body>
        </html>
      );

      export default Html;
    `);
  });
});


describe('path removal issues', ()=> {
  it('removes variable declarations only if they would be empty', ()=> {
    const {code} = getModule(jsx`
      import React from 'react';
      import {Module, Scripts} from '@nearmap/react-entry-loader/injectors';

      const foo = 1, bar = '2';

      const Html = ({scripts})=> (
        <Module onLoad={()=> foo} />
      );

      export default Html;
    `);

    expect(code).toBe(jsx`
      const foo = 1;
      (() => foo)();
    `);
  });
});
