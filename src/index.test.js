import webpack from './testing/webpack-compile';
import {html} from 'js-beautify';
import exampleConfig from '../examples/webpack.config.babel.js';
import reactEntry from './entry';


jest.mock('../examples/code-gen', ()=> jest.fn(()=> null));

const prettyHtml = (raw, ...args)=> html(
  String.raw({raw}, ...args),
  { /* eslint camelcase: off */
    indent_size: 2,
    wrap_line_length: 70,
    preserve_newlines: false
  }
);

const testConfig = {
  ...exampleConfig(),
  // eslint-disable-next-line no-undef
  context: __dirname
};


describe('loader and plugin', ()=> {
  it('generates html assets', async ()=> {
    const stats = await webpack({
      ...testConfig,
      entry: {
        page1: reactEntry(
          {output: 'page1.html', title: 'react-entry-loader - page 1'}
        )('../examples/page1.js'),
        page2: reactEntry(
          {output: 'page2.html', title: 'react-entry-loader - page 2'}
        )('../examples/page2.js')
      }
    });

    const page1 = stats.compilation.assets['page1.html'];
    const page2 = stats.compilation.assets['page2.html'];

    expect(page1.size()).toBe(page1.source().length);
    expect(prettyHtml`${page1.source()}`).toBe(prettyHtml`
      <!DOCTYPE html>
      <html data-reactroot="">
        <head>
          <title>react-entry-loader - page 1</title>
          <link href="shared.css" rel="stylesheet"/>
          <script type="text/javascript" src="runtime.js" async=""></script>
          <script type="text/javascript" src="shared.js" async=""></script>
          <script type="text/javascript" src="page1.js" async=""></script>
        </head>
        <body>
          <div id="page1-app"></div>
        </body>
      </html>
    `);

    expect(page2.size()).toBe(page2.source().length);
    expect(prettyHtml`${page2.source()}`).toBe(prettyHtml`
      <!DOCTYPE html>
      <html data-reactroot="">
        <head>
          <title>react-entry-loader - page 2</title>
          <link href="shared.css" rel="stylesheet"/>
        </head>
        <body>
          <div id="page2-app">
            <h4>Example App for page<!-- -->2<!-- -->.js</h4>
            <p>There are two example pages, both sharing the
              same<strong> &lt;App /&gt;</strong> component.</p>
            <p>They only differ in the way the <strong>&lt;App /&gt;</strong>
              component is rendered at compile-time and run-time.</p>
            <ul>
              <li><a href="./page1.html">Page 1 - rendered into a div at
                run-time</a></li>
              <li><a href="./page2.html">Page 2 - hydrated into a div at
                run-time, rendered into template at compile time.</a></li>
            </ul>
            <p>Below you can see the source code and the extracted entry
              module and template code for this page.</p>
          </div>
          <script type="text/javascript" src="runtime.js"></script>
          <script type="text/javascript" src="shared.js"></script>
          <script type="text/javascript" src="page2.js"></script>
        </body>
      </html>
    `);
  });


  it('it fails to handle incompatible entrypoint', async ()=> {
    const compileTask = webpack({
      ...testConfig,
      entry: {
        page: reactEntry({output: 'page1.html'})('../examples/app.css')
      }
    });

    await expect(compileTask).rejects.toThrow(/Module build failed/);
  });
});
