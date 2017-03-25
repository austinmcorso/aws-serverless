var path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react'],
          babelrc: false
        }
      }
    ]
  },
  resolve: {
    root: path.resolve(__dirname, 'src'),
    alias: {
      components: 'components',
      actions: 'actions',
      epics: 'epics',
      reducers: 'reducers'
    },
    extensions: ['', '.js', '.jsx'],
  }
};
