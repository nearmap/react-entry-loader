# react-entry-loader

Use a webpack entry module as a template to generate HTML assets.


## Installation

```bash
npm install --save-dev react-entry-loader
```


## Usage

You need to include a single [ReactEntryLoaderPlugin](./src/plugin.js) in your
webpack config to handle the HTML asset generation.

The loader itself can be used like any other loader in webpack.
There is a little [helper function](./src/entry.js) for defining an entry modules,
which makes it a bit more readable than using strings with query params.


[webpack.config.babel.js](./examples/webpack.config.babel.js):
```js
import ReactEntryLoaderPlugin from 'react-entry-loader/plugin';
import reactEntry from 'react-entry-loader/entry';

export default ()=> ({
  entry: {
    page1: reactEntry({output: 'page1.html'})('./src/page1.js'),
    page2: 'react-entry-loader?output=page2.html!./src/page2.js'
  },
  plugins: {
    new ReactEntryLoaderPlugin()
  }
});
```

The loader expects a JS module that has a react component as the default export.
This component is a mix of template and entry module code.

[./src/page1.js](./examples/page1.js):
```js
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
    <body className={theme.body}>
      <Renderer id="page1-app" className={theme.root}>
        <App />
      </Renderer>
    </body>
  </html>
);

export default Html;
```

The child component of the `<Renderer>` and any code that child depends on
is treated as the webpack entry module code.

The entry module code will be extracted and some render boiler plate is added so
that the component will be rendered it into the DOM element created by `<Renderer>`.

The template is everything left over after the child component has been removed.

The loader will return the entry module code to webpack and will
send the extracted template code to the [ReactEntryLoaderPlugin](./src/plugin.js).

The plugin will render the template at the end of the webpack compilation
to generate an HTML asset.

It will pass `scripts` and `styles` that the entry module depends on as
props to the template. These can then be passed to the `<Scripts>` and `<Styles>`
components that come with the [injectors](./src/injectors) module to include the
files in generated HTML.


## Running the Examples

```bash
npm ci
npx run
```

This starts a webserver and you can see the running app at http://localhost:8080/page1.html
