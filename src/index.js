import {getOptions} from 'loader-utils';

import {getTemplateHandler} from './plugin';
import {getModule, getTemplate} from './code-split';


const createLoader = (loaderCtx)=> async (source, sourceMap, meta)=> {
  const {output} = getOptions(loaderCtx);

  const template = getTemplate(source, sourceMap);

  getTemplateHandler(loaderCtx)({output, template});

  const {code, map} = getModule(source, sourceMap);
  return [code, map, meta];
};


/**
 * Implement the webpack loader interface for handling entrypoint modules.
 *
 * Example webpack config:
 * ```javascript
 * {
 *   entry: {
 *    page1: 'react-entry-loader?output=page1.html!./src/page1.js'
 *   }
 *   ...
 * }
 * ```
 *
 * Options:
 *   * output - The asset to generate from the template code provided
 *              by the file being loaded.
 *
 * This loader handles any JS `source` that exports a react component as
 * as default.
 * It splits the code into two part: the module and the template code.
 * Only the module code will be returned, while the template code is
 * sent to the `react-entry-loader/plugin` for generating a HTML asset.
 *
 * Code splitting is done by searching for a child of the `<Renderer />`
 * component in the `source`. That child and all of it's dependencies are
 * assumed to be module code. The rest is template code.
 *
 * The module code will add a wrapper around the extracted child for it to
 * be rendered in place of the `<Renderer />` at runtime.
 */
export default async function(source, sourceMap, sourceMmeta) {
  // eslint-disable-next-line no-invalid-this, consistent-this
  const loaderCtx = this;
  const callback = loaderCtx.async();

  try {
    const entryLoader = createLoader(loaderCtx);
    const [code, map, meta] = await entryLoader(source, sourceMap, sourceMmeta);
    return callback(null, code, map, meta);
  } catch (err) {
    return callback(err);
  }
}
