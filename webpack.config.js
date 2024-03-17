<<<<<<< HEAD
const webpack = require('webpack');
const path = require('path');
const htmlWebpackPlugin = require("html-webpack-plugin");
const copyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// this loads all of the variables in the .env file
// they're available in your code as process.env.KEY
require('dotenv').config();

/**
 * flag Used to check if the environment is production or not
*/
const isProduction = (process.env.NODE_ENV === 'production');

/**
* Include hash to filenames for cache busting - only at production
*/
const fileNamePrefix = isProduction? '[chunkhash].' : '';

module.exports = {
    mode: !isProduction ? 'development': 'production',
    entry: {
      index: './src/index.js'
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: fileNamePrefix + '[name].js',
      assetModuleFilename: "assets/[name][ext]",
      clean: true,
    },
    target: 'web',
    devServer: { 
      static: "./dist"
    }, 
    /* no separate source map files in production */
    devtool: !isProduction ? 'source-map' : 'inline-source-map', 
    module: {
      rules: [	
        { 
          test: /\.js$/i,
          exclude: /(node_modules)/,
          use: { 
            loader: 'babel-loader', 
            options: {
            presets: ['@babel/preset-env']
          }}
        }, 
        { 
          test: /\.css$/i, 
          /* separate js code and css in production */
          use: isProduction ?
            [ MiniCssExtractPlugin.loader, 'css-loader']	:
            [ 'style-loader', 'css-loader']		
        },
        { 
            test: /.s[ac]ss$/i, 
            use: isProduction ?
              [ MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']	:
              [ 'style-loader', 'css-loader' , 'sass-loader']		
        },
        {  
          test: /\.(svg|eot|ttf|woff|woff2)$/i,  
          type: "asset/resource",
        },
        {
          test: /\.(png|jpg|gif)$/i,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new htmlWebpackPlugin({
        template: path.resolve(__dirname, "./src/index.html"),
        chunks: ["home"],
        inject: "body",
        filename: "index.html",
      }),
      new copyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "src/assets"),
            to: path.resolve(__dirname, "dist/assets"),
          },
        ],
      }),
      /* app uses global SERVER_URL rather than process.env.SERVER_URL */
      new webpack.DefinePlugin({
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        SERVER_URL: JSON.stringify(process.env.SERVER_URL),
        GMAP_KEY: JSON.stringify(process.env.GMAP_KEY),
      }),
    ],
    /* separates js (and css) that is shared between bundles - allows browser to cache */
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
}

/**
 * Production only plugins
 */
 if(isProduction) {
  module.exports.plugins.push(
    new MiniCssExtractPlugin({
      filename: fileNamePrefix + "[name].css",
    })
  );
};
  
=======
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
>>>>>>> fc4f4e5c52921afc5cbbb56321a3676edfc5588d
