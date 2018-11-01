# react-entry-loader

[![Greenkeeper badge](https://badges.greenkeeper.io/nearmap/react-entry-loader.svg)](https://greenkeeper.io/)

Use webpack entry modules as templates for generating HTML assets.


## Installation

```bash
npm install --save-dev react-entry-loader
```


## Usage

You need to include a single [ReactEntryLoaderPlugin](./src/plugin.js) in your
webpack config to handle the HTML asset generation.

The loader itself can be used like any other loader in webpack.
There is a little [helper function](./src/entry.js) for defining entry modules,
which makes it a bit more readable than using plain strings with query params.
All options that is are not a loader option are interpreted as template props.
They will be forwarded to the template during compile time.


[webpack.config.babel.js](./examples/webpack.config.babel.js):
```js
import ReactEntryLoaderPlugin from 'react-entry-loader/plugin';
import reactEntry from 'react-entry-loader/entry';

export default ()=> ({
  entry: {
    page1: reactEntry({output: 'page1.html', title: 'test'})('./src/page1.js'),
    page2: 'react-entry-loader?output=page2.html!./src/page2.js'
  },
  plugins: {
    new ReactEntryLoaderPlugin()
  }
});
```

The loader expects a JS module that has a React component as the default export.
This component is a mix of template and entry module code.

[./examples/page1.js](./examples/page1.js):
```js
import React from 'react';

import {render} from 'react-entry-loader/render';
import {Module, Styles, Scripts} from 'react-entry-loader/injectors';

import App from './app';
import theme from './page1.css';


const Html = ({scripts, styles, title})=> (
  <html>
    <head>
      <title>{title}</title>
      <Styles files={styles} />
      <Scripts files={scripts} async />
    </head>
    <body>
      <div id="page1-app" className={theme.root}>
        <Module onLoad={render('page1-app')}>
          <App theme={theme} />
        </Module>
      </div>
    </body>
  </html>
);

export default Html;
```

The child components of `<Module onLoad={...}>` and any code that they depend on
is treated as the webpack entry module code, as is the code being called in `onLoad={some-render-or-init-function}`.

The entry module code will be extracted along with the `some-render-or-init-function`.
The latter should be a function with the interface `render(...children)` that
renders the `children` into the DOM at run-time.
You can use [react-entry-loader/render](./src/render.js)'s `render(elementId)` or `hydrate(elementId)` render function factories for this or write your own.

Extracted Entry Module:
```js
import React from 'react';
import {render} from 'react-entry-loader/render';
import App from './app';
import theme from './page1.css';
render('page1-app')(<App theme={theme} />);
```

The template code is everything left over after the child components and `some-render-or-init-function` code has been removed.


Extracted Template:
```js
import React from 'react';
import {Module, Styles, Scripts} from 'react-entry-loader/injectors';
import theme from './page1.css';

const Html = ({scripts, styles, title})=> (
  <html>
    <head>
      <title>{title}</title>
      <Styles files={styles} />
      <Scripts files={scripts} async />
    </head>
    <body>
      <div id="page1-app" className={theme.root}>
        <Module />
      </div>
    </body>
  </html>
);
export default Html;
```

Note when using `<Module hydratable ... />` the child components and their
dependencies will be left in place for compile time rendering.

The loader will return the entry module code to webpack and will
send the extracted template code to the [ReactEntryLoaderPlugin](./src/plugin.js).

The plugin will render every entry module's template at the end of
the webpack compilation process to generate HTML assets.

The final chunks that an entry module depends on will be passed as
`scripts` and `styles` props to the template components.
These can then be passed to the `<Scripts>` and `<Styles>` components that come
with the [injectors](./src/injectors.js) module to reference the files in generated HTML.


## Running the Examples

```bash
npm ci
npx run
```

This starts a webserver and you can see the running app at http://localhost:8080/page1.html
