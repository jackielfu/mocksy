const path = require('path');
var SRC_DIR = path.join(__dirname, '/src');
var DIST_DIR = path.join(__dirname, '/dist');

module.exports = {
  entry: `${SRC_DIR}/index.js`,
  output: {
    path: DIST_DIR,
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js?/,
        exclude: /node_modules/,
        include : SRC_DIR,
        loader: 'babel-loader',
        options: {
          presets: ['react']
        }
      },
      {
        test: /\.scss$/,
        use: [
          'css-loader'
        ]
      }
    ]
  }
};
