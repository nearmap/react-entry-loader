import webpack from './testing/webpack-compile';
import exampleConfig from '../examples/webpack.config.babel.js';
import reactEntry from './entry';


const singleLine = (raw, ...args)=> (
  String.raw({raw}, ...args).replace(/\n\s+/g, '')
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
        page1: reactEntry({output: 'page1.html'})('../examples/page1.js'),
        page2: reactEntry({output: 'page2.html'})('../examples/page2.js')
      }
    });

    const page1 = stats.compilation.assets['page1.html'];
    const page2 = stats.compilation.assets['page2.html'];

    expect(page1.size()).toBe(page1.source().length);
    expect(page1.source()).toBe(singleLine`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Page 1</title>
          <link href="page1.css" rel="stylesheet"/>
          <script type="text/javascript" src="runtime.js" async=""></script>
          <script type="text/javascript" src="shared.js" async=""></script>
          <script type="text/javascript" src="page1.js" async=""></script>
        </head>
        <body>
          <div id="page1-app" class="page1_root_z9qiR"></div>
        </body>
      </html>
    `);

    expect(page2.size()).toBe(page2.source().length);
    expect(page2.source()).toBe(singleLine`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Page 2</title>
        </head>
        <body>
          <div>rendered at compile time for page 2</div>
          <div id="page2-app"></div>
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
        page: reactEntry({output: 'page1.html'})('../examples/page1.css')
      }
    });

    await expect(compileTask).rejects.toThrow(/Module build failed/);
  });
});
