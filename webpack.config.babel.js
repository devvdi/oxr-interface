import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const MAIN_SCRIPT_FILE = path.join(__dirname, '/src/scripts/index.js');
const HTML_TEMPLATE_PATH = path.join(__dirname, '/src/template');
const HTML_TEMPLATE_FILE = path.join(HTML_TEMPLATE_PATH, '/index.html');
const BUILD_DIST_PATH = path.join(__dirname + '/dist');

const PUBLIC_PATH = '/dist/';

const developmentPlugins = [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new HtmlWebpackPlugin({
        inject: true,
        template: HTML_TEMPLATE_FILE,
        xhtml: true
    })
];

const productionPlugins = [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            comparisons: false
        },
        output: {
            comments: false,
            ascii_only: true
        }
    }),
    new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
    }),
    new HtmlWebpackPlugin({
        inject: true,
        template: HTML_TEMPLATE_FILE,
        xhtml: true,
        minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true
        }
    }),
    new CompressionPlugin({
        asset: "[path].gz[query]",
        algorithm: "gzip",
        test: /\.(js|css|svg)$/,
        threshold: 10240,
        minRatio: 0.8
    })
];

export default (env = { production: false }) => ({
    entry: {
        main: MAIN_SCRIPT_FILE
    },
    output: {
        path: BUILD_DIST_PATH,
        filename: 'scripts/[name].[chunkhash:8].js',
        publicPath: PUBLIC_PATH
    },
    module: {
        rules: [
            {
                exclude: [
                    /\.html$/,
                    /\.(js|jsx)$/,
                    /\.(css|scss)$/,
                    /\.json$/,
                    /\.bmp$/,
                    /\.gif$/,
                    /\.jpe?g$/,
                    /\.png$/
                ],
                loader: 'file-loader',
                options: {
                    name: 'media/[name].[hash:8].[ext]',
                },
            },
            // "url" loader works just like "file" loader but it also embeds
            // assets smaller than specified size as data URLs to avoid requests.
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'media/[name].[hash:8].[ext]',
                },
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                            compact: true
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        {
                            loader: "css-loader"
                        },
                        {
                            loader: "sass-loader"
                        }
                    ],
                    fallback: "style-loader"
                })
            }
        ]
    },
    plugins: [
        ...env.production ? productionPlugins : developmentPlugins,
        new ExtractTextPlugin({
            filename: 'styles/[name].[contenthash:8].css'
        }),
        new CopyWebpackPlugin([{
            from: HTML_TEMPLATE_PATH,
            ignore: ['*.html']
        }])
    ]
});
