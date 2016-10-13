var path = require('path');
var webpack = require('webpack');
var babelcore = require('babel-core');

module.exports = {
  debug: true,
  devtool: '#source-map',
  entry: [
    './demo/index'
  ],
  output: {
    path: path.join(__dirname, '/demo'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: [ 'babel-loader?presets[]=es2015,presets[]=stage-0' ],
        exclude: /node_modules/,
        include: __dirname
      }
    ]
  }
};
