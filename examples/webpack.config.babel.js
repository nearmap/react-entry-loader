/* eslint-env node */
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import reactEntry from '../src/entry';
import ReactEntryLoaderPlugin from '../src/plugin';

import devConfig from '../src/testing/webpack.config.js';


export default ()=> ({
  ...devConfig,
  entry: {
    renderedApp: reactEntry({output: 'page1.html'})('./page1.js'),
    hydratedApp: reactEntry({output: 'page2.html'})('./page2.js')
  },
  plugins: [
    new ReactEntryLoaderPlugin(),
    new MiniCssExtractPlugin()
  ],
  module: {
    rules: [{
      test: /\.js$/,
      include: [__dirname],
      loader: 'babel-loader',
      options: {envName: 'webpack'}
    }, {
      test: /\.css$/,
      include: [__dirname],
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            modules: true,
            localIdentName: '[name]_[local]_[hash:base64:5]'
          }
        }
      ]
    }]
  },
  devtool: '#cheap-module-source-map',
  devServer: {stats: 'minimal'}
});
