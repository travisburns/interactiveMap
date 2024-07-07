const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        mode: isProduction ? 'production' : 'development',
        entry: {
            index: './src/index.js'
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProduction ? '[name].[contenthash].js' : '[name].js',
            assetModuleFilename: 'assets/[name][ext]',
            clean: true,
        },
        target: 'web',
        devServer: {
            static: "./dist"
        },
        devtool: isProduction ? 'source-map' : 'inline-source-map',
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader'
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.(svg|eot|ttf|woff|woff2)$/i,
                    type: 'asset/resource',
                },
                {
                    test: /\.(png|jpg|gif)$/i,
                    type: 'asset/resource',
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html',
                filename: 'index.html',
            }),
            new webpack.DefinePlugin({
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                SERVER_URL: JSON.stringify(process.env.SERVER_URL),
                GMAP_KEY: JSON.stringify(process.env.GMAP_KEY),
            }),
            new MiniCssExtractPlugin({
                filename: isProduction ? '[name].[contenthash].css' : '[name].css',
            }),
            new CopyPlugin({
                patterns: [
                    { from: 'src/assets', to: 'assets' }, // Copy assets from src/assets to dist/assets
                    { from: 'locations.json', to: 'assets/locations.json' }, // Preserve the existing locations.json file
                    { from: 'package.json', to: 'package.json' }, // Adjust the path to package.json
                ],
            }),
        ],
        optimization: {
            splitChunks: {
                chunks: 'all',
            },
        },
    };
};
