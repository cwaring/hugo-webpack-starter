const path = require('path')

// common plugins
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { ProvidePlugin } = require('webpack')
const AssetsPlugin = require('assets-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// dev plugins
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

// prod plugins
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = webpackEnv => {
  const isEnvDevelopment =
    process.env.NODE_ENV === 'development' || webpackEnv === 'development'
  const isEnvProduction =
    process.env.NODE_ENV === 'production' || webpackEnv === 'production'

  console.log({ isEnvProduction }, { isEnvDevelopment })

  return {
    mode: isEnvProduction ? 'production' : 'development',
    bail: isEnvProduction,

    entry: {
      main: path.join(__dirname, 'src', 'index.js'),
    },

    output: {
      path: path.join(__dirname, 'dist'),
      filename: isEnvProduction ? '[name].[hash:5].js' : '[name].js',
      chunkFilename: isEnvProduction ? '[id].[hash:5].css' : '[id].css',
    },

    module: {
      rules: [
        {
          test: /\.((png)|(eot)|(woff)|(woff2)|(ttf)|(svg)|(gif))(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'file-loader?name=/[hash].[ext]',
        },

        { test: /\.json$/, loader: 'json-loader' },

        {
          loader: 'babel-loader',
          test: /\.js?$/,
          exclude: /node_modules/,
          query: { cacheDirectory: true },
        },

        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            'style-loader',
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
          ],
        },
      ],
    },

    plugins: [
      new ProvidePlugin({
        fetch:
          'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch',
      }),

      new AssetsPlugin({
        filename: 'webpack.json',
        path: path.join(process.cwd(), 'site/data'),
        prettyPrint: true,
      }),

      new CopyWebpackPlugin([
        {
          from: './src/fonts/',
          to: 'fonts/',
          flatten: true,
        },
      ]),
      isEnvDevelopment &&
        new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns: [
            'dist/**/*.js',
            'dist/**/*.css',
            'site/content/webpack.json',
          ],
        }),

      isEnvDevelopment &&
        new MiniCssExtractPlugin({
          filename: '[name].css',
          chunkFilename: '[id].css',
        }),
    ].filter(Boolean),
    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
        }),

        new MiniCssExtractPlugin({
          filename: '[name].[hash:5].css',
          chunkFilename: '[id].[hash:5].css',
        }),

        new OptimizeCSSAssetsPlugin({}),
      ],
    },
  }
}
