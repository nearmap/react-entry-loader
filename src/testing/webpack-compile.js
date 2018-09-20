import MemoryFS from 'memory-fs';
import webpack from 'webpack';


const compile = (config)=> {
  const compiler = webpack(config);

  compiler.outputFileSystem = new MemoryFS();

  return new Promise((resolve, reject)=> {
    compiler.run((err, stats)=> {
      if (!err && stats.hasErrors()) {
        [err] = stats.compilation.errors;
      }

      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
};

export default compile;
