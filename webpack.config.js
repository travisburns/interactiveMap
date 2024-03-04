const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development', // Explicitly set the mode
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'bundle.[contenthash].js' : 'bundle.js',
    },
    devServer: {
      open: true,
      host: 'localhost',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
      }),
      // Add your other plugins here
    ],
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/i,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
          type: 'asset',
        },
        // Add your other rules for custom modules here
      ],
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    performance: {
      hints: isProduction ? 'warning' : false, // Disable performance hints in development mode
      maxAssetSize: 244 * 10240, // 244 KiB limit
      maxEntrypointSize: 244 * 10240, // 244 KiB limit
    },
  };
};


// the project was working just fine until I added webpack and changed around the package.json to match previous projects. Still attempting to figure out what cuased the issue.
//likely related to the way webpack.config.js is configured. 