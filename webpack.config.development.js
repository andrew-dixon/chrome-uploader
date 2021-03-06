/* eslint-disable max-len */
/**
 * Build config for development process that uses Hot-Module-Replacement
 * https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
 */

import webpack from 'webpack';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';
import cp from 'child_process';

const VERSION_SHA = process.env.CIRCLE_SHA1 ||
  process.env.APPVEYOR_REPO_COMMIT ||
  cp.execSync('git rev-parse HEAD', { cwd: __dirname, encoding: 'utf8' });

const port = process.env.PORT || 3005;

if (process.env.DEBUG_ERROR === 'true') {
  console.log('~ ~ ~ ~ ~ ~ ~ ~ ~ ~');
  console.log('### DEBUG MODE ###');
  console.log('~ ~ ~ ~ ~ ~ ~ ~ ~ ~');
  console.log();
}

if ((!process.env.API_URL && !process.env.UPLOAD_URL && !process.env.DATA_URL && !process.env.BLIP_URL)) {
  console.log('Using the default environment, which is now production.');
} else {
  console.log('***** NOT using the default environment *****');
  console.log('The default right-click server menu may be incorrect.');
  console.log('API_URL =', process.env.API_URL);
  console.log('UPLOAD_URL =', process.env.UPLOAD_URL);
  console.log('DATA_URL =', process.env.DATA_URL);
  console.log('BLIP_URL =', process.env.BLIP_URL);
}

export default merge(baseConfig, {
  devtool: '#cheap-module-source-map',

  entry: [
    `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`,
    'babel-polyfill',
    './app/index'
  ],

  output: {
    publicPath: `http://localhost:${port}/dist/`
  },

  module: {
    rules: [
      {
        test: /\.global\.css$/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader',
          options: {
            sourceMap: true
          }
        }]
      },

      {
        test: /^((?!\.global).)*\.css$/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader',
          options: {
            modules: true,
            sourceMap: true,
            importLoaders: 1,
            localIdentName: '[name]__[local]___[hash:base64:5]'
          }
        }]
      },

      {
        test: /\.module\.less$/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader',
          options: {
            modules: true,
            sourceMap: true,
            importLoaders: 1,
            localIdentName: '[name]__[local]___[hash:base64:5]'
          }
        }, {
          loader: 'less-loader',
          options: {
            sourceMap: true
          }
        }]
      },

      {
        test: /^((?!module).)*\.less$/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader',

          options: {
            sourceMap: true
          }
        }, {
          loader: 'less-loader',

          options: {
            sourceMap: true
          }
        }]
      },

      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, use: [{
        loader: 'url-loader',

        options: {
          limit: 10000,
          mimetype: 'application/font-woff'
        }
      }] },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, use: [{
        loader: 'url-loader',

        options: {
          limit: 10000,
          mimetype: 'application/font-woff'
        }
      }] },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: [{
        loader: 'url-loader',

        options: {
          limit: 10000,
          mimetype: 'application/octet-stream'
        }
      }] },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: [{
        loader: 'file-loader'
      }] },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: [{
        loader: 'url-loader',

        options: {
          limit: 10000,
          mimetype: 'image/svg+xml'
        }
      }] },

      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: [{
          loader: 'url-loader'
        }]
      }

    ]
  },

  plugins: [
    // https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
    new webpack.HotModuleReplacementPlugin(),
    /**
     * If you are using the CLI, the webpack process will not exit with an error
     * code by enabling this plugin.
     * https://github.com/webpack/docs/wiki/list-of-plugins#noerrorsplugin
     */
     new webpack.NoEmitOnErrorsPlugin(),
     /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) || '"development"',
      'process.env.BUILD': JSON.stringify(process.env.BUILD) || '"dev"',
      __DEBUG__: JSON.stringify(JSON.parse(process.env.DEBUG_ERROR || 'false')),
      __VERSION_SHA__: JSON.stringify(VERSION_SHA),
      'global.GENTLY': false, // http://github.com/visionmedia/superagent/wiki/SuperAgent-for-Webpack for platform-client
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true
    })
  ],
  /**
   * https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
   */
  target: 'electron-renderer',
  node: {
    __dirname: true, // https://github.com/visionmedia/superagent/wiki/SuperAgent-for-Webpack for platform-client
  }
});
