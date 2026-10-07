const HtmlWebpackPlugin = require('html-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: './src/index.jsx',
  output: { clean: true },
  resolve: { extensions: ['.js', '.jsx'] },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'esbuild-loader',
        options: { jsx: 'automatic' },
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ title: 'CAPS webpack 5 host' })],
};
