
/**
 * Create a loader URL with `options` to load entry module and template code
 * from `src`.
 *
 * options:
 *   * output   - The HTML asset to generate from the template code in `src`.
 *   * ...props - Props to be sent to the template component in `src`.
 */
const reactEntryLoader = (options)=> (src)=> (
  `@nearmap/react-entry-loader?${JSON.stringify(options)}!${src}`
);

export default reactEntryLoader;
