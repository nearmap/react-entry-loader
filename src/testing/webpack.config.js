/* eslint-env node */

import {resolve, join} from 'path';

const packageDir = resolve(__dirname, '../..');

export default {
  mode: 'development',
  resolveLoader: {
    alias: {
      'react-entry-loader': join(packageDir, 'src')
    }
  },
  resolve: {
    alias: {
      'react-entry-loader': join(packageDir, 'src')
    }
  },
  output: {
    path: join(packageDir, 'build'),
    filename: '[name].js'
  },
  optimization: {
    minimize: false,
    runtimeChunk: {name: 'runtime'},
    splitChunks: {
      chunks: 'all',
      name: 'shared'
    }
  }
};
