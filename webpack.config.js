const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './app/index.ts',
  module: {
    rules: [
      {
        test: /app\/\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    path: path.resolve(__dirname, 'www'),
    filename: 'bundle.js',
  },
  plugins: [new HtmlWebpackPlugin({
    template: "app/index.html",
  })]
};
