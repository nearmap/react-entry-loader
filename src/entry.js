
const reactEntryLoader = ({output})=> (src)=> (
  `react-entry-loader?output=${output}!${src}`
);

export default reactEntryLoader;
