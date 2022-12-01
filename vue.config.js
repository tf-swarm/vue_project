'use strict'
const IS_PROD = ['development', 'production', 'prod'].includes(
  process.env.NODE_ENV
)
console.log('process.env.NODE_ENV:' + process.env.NODE_ENV)
// path是node.js的路径模块，用来处理路径统一的问题
const path = require('path')
const resolve = dir => path.resolve(__dirname, dir)
const TerserPlugin = require('terser-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = ['js', 'css']
module.exports = {
  publicPath: './', // 默认'/'，部署应用包时的基本 URL
  outputDir: 'dist', // 'dist', 生产环境构建文件的目录
  assetsDir: 'static', // 相对于outputDir的静态资源(js、css、img、fonts)目录
  lintOnSave: false,
  indexPath: 'index.html',
  runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
  productionSourceMap: false, // 生产环境的 source map
  filenameHashing: true, // 默认在生成的静态资源文件名中包含hash以控制缓存
  // CSS 相关选项
  css: {
    // 将组件内的 CSS 提取到一个单独的 CSS 文件 (只用在生产环境中)
    // 也可以是一个传递给 `extract-text-webpack-plugin` 的选项对象
    extract: true,
    // 是否开启 CSS source map？
    sourceMap: false,
    // 为预处理器的 loader 传递自定义选项。比如传递给
    // sass-loader 时，使用 `{ sass: { ... } }`。
    loaderOptions: {},
    // 为所有的 CSS 及其预处理文件开启 CSS Modules。
    // 这个选项不会影响 `*.vue` 文件。
    requireModuleExtension: true
    // modules: false
  },
  // 在生产环境下为 Babel 和 TypeScript 使用 `thread-loader`
  // 在多核机器下会默认开启。
  parallel: require('os').cpus().length > 1,
  // 配置logo,字体图标路径
  pwa: {
    iconPaths: {}
  },
  transpileDependencies: [],

  // 配置引入第三方插件
  chainWebpack: config => {
    // 生产环境配置
    if (process.env.NODE === 'production') {
      // 移除 prefetch 插件
      config.plugins.delete('prefetch')
      // 移除 preload 插件
      config.plugins.delete('preload')
      // 修复HMR
      config.resolve.symlinks(true)
      //修复 Lazy loading routes Error
      config.plugin('html').tap(args => {
        args[0].chunksSortMode = 'none'
        return args
      })

      // 添加别名
      config.resolve.alias
        .set('@', resolve('src'))
        .set('@a', resolve('src/assets'))
        .set('@c', resolve('src/components'))

      //压缩图片
      config.module
        .rule('images')
        .use('image-webpack-loader')
        .loader('image-webpack-loader')
        .options({
          mozjpeg: {
            progressive: true,
            quality: 65
          },
          optipng: {
            enabled: false
          },
          pngquant: {
            quality: '65-90',
            speed: 4
          },
          gifsicle: {
            interlaced: false
          },
          webp: {
            quality: 75
          }
        })
    }
  },

  configureWebpack: config => {
    if (IS_PROD) {
      config.plugins.push(
        // 生产环境
        new CompressionWebpackPlugin({
          filename: '[path].gz[query]', // 提示 compression-webpack-plugin@3.0.0的话asset改为filename
          algorithm: 'gzip',
          test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
          threshold: 10240,
          minRatio: 0.8,
          deleteOriginalAssets: false
        })
      )

      return {
        // 打包去掉console 必须引入TerserPlugin
        optimization: {
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                compress: {
                  drop_console: true,
                  drop_debugger: false,
                  pure_funcs: ['console.log'] // 移除console
                }
              }
            })
          ]
        },
        // 关闭 webpack 的性能提示
        performance: {
          hints: false
        }
      }
    } else {
      // 开发环境
    }
  },

  // 设置让浏览器 overlay 同时显示警告和错误
  devServer: {
    open: IS_PROD,
    host: '0.0.0.0',
    port: 5050,
    https: false,
    hotOnly: true,
    proxy: {
      '/api': {
        target: process.env.VUE_APP_BASE_URL || 'http://218.244.151.211:5000', // 目标url地址
        ws: true, // 是否启用websockets
        changeOrigin: true, // 指示是否跨域
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  // 第三方插件
  pluginOptions: {
    foo: {}
  }
}
