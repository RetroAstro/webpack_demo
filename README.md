> ### webpack 4.x note

#### Chapter 1

###### 安装与使用 : 

```

$ npm init -force

$ npm install webpack webpack-cli --save-dev

```

```json
// package.json

"scripts": {
    "build": "webpack --mode production", // 打包构建项目上线需要的文件
    "start": "webpack-dev-server --mode development" // 搭建开发环境
}

```

#### Chapter 2

###### 基本前端开发环境的搭建 : 

* 构建发布需要的 HTML 、CSS 、JS 文件
* 使用 Sass 编写样式, Postcss预处理CSS
* 处理和压缩图片
* 使用 Babel 来支持 ES 新特性
* 提供本地静态服务以方便开发调试

````json
// package.json

{
  "name": "webpack_demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "webpack --mode production",
    "start": "webpack-dev-server --mode development"
  },
  "author": "RetroAstro",
  "license": "MIT",
  "dependencies": {
    "babel-core": "^6.26.3",
    "babel-loader": "^7.1.4",
    "babel-preset-env": "^1.7.0",
    "css-loader": "^0.28.11",
    "extract-text-webpack-plugin": "^4.0.0-beta.0",
    "file-loader": "^1.1.11",
    "html-webpack-plugin": "^3.2.0",
    "node-sass": "^4.9.0",
    "sass-loader": "^7.0.3",
    "style-loader": "^0.21.0",
    "webpack": "^4.12.0",
    "webpack-cli": "^3.0.3",
    "webpack-dev-server": "^3.1.4"
  }
}

````

````javascript
// webpack.config.js

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
    entry: './src/js/index.js',
    output: {
        filename: './js/[name].js', // 相对于 dist 目录
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            // Babel ES6+ 转 ES5
            {
                test: /\.js/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                use: 'babel-loader'
            },
            // 使用CSS预处理器、后处理器
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                              ident: 'postcss',
                              plugins: [
                                require('postcss-import')(),
                                require('autoprefixer')(),
                                require('postcss-px-to-viewport')({
                                    viewportWidth: 750,
                                    viewportHeight: 1334,
                                    unitPrecision: 3,
                                    viewportUnit: 'vw',
                                    selectorBlackList: ['.ignore', '.hairlines'],
                                    minPixelValue: 1,
                                    mediaQuery: false
                                })
                              ]
                            }
                        },
                        'sass-loader'
                    ],
                    fallback: 'style-loader'
                })
            },
            // 压缩图片
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'images/', // 输出图片文件途径
                            publicPath: '../images/' // 相对于CSS文件引用的图片路径
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'node_modules'),
        ],
        extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx']
    },
    plugins: [
        // 将构建结果与HTML关联
        new HtmlWebpackPlugin({
            filename: 'index.html', // 配置输出文件名和路径
            template: './src/index.html', // 配置文件模板
        }),
        // 使用不同loader解析并处理Scss、CSS文件, 且单独把CSS文件分离出来
        new ExtractTextPlugin({
            filename: "./css/[name].css" // 配置输出文件名和路径
        })
    ],
    // 开启本地服务器
    devServer: {
        port: '8080',
    }
}

````

#### Chapter 3

###### 模块解析原则 : 

* 解析相对路径 ( 这里主要指导入开发者自己写的模块 )
  1. 查找相对当前模块的路径下是否有对应文件或文件夹
  2. 是文件则直接加载
  3. 是文件夹则继续查找文件夹下的 package.json 文件
  4. 有 package.json 文件则按照文件中 `main` 字段的文件名来查找文件
  5. 无 package.json 或者无 `main` 字段则查找 `index.js` 文件

* 解析模块名 ( 解析处于`node_modules` 中的模块 ) 

  查找当前文件目录下, 父级目录及以上目录下的 `node_modules` 文件夹, 看是否有对应名称的模块

* 解析绝对路径 ( 不建议使用 )

````javascript
// enhanced-resolve

resolve: {
    // 模糊匹配 import 'utils/query.js' 等同于 import '[项目绝对路径]/src/utils/query.js'
    alias: {
        utils: path.resolve(__dirname, 'src/utils')
    },
    modules: [
        // 查找直接声明依赖名的模块
        path.resolve(__dirname, 'node_modules'),
    ],
    // 按先后顺序查找相关文件, 补全后缀名, 最好不省略后缀名。
    extensions: ['.js', '.json', '.scss', '.css']
}

````

#### Chapter 4

###### loader配置注意事项 : 

loader 应用顺序

一个匹配规则中可以配置使用多个 loader, 即一个模块文件可以经过多个 loader 的转换处理, 执行顺序是从最后配置的 loader 开始, 一步步向前。例如 :  sass-loader  =>  postcss-loader  =>  css-loader

````javascript
...
use: [
    'css-loader',
    // postcss 添加浏览器前缀
    {
        loader: 'postcss-loader',
        options: {
            ident: 'postcss',
            plugins: [
                require('autoprefixer')()
            ]
        }
    },
    'sass-loader'
]
...
````

所有 loader 按照 前置 => 行内 => 普通 => 后置的顺序执行。 

添加 `enforce` 配置可更改执行顺序, 它有 `pre` 、`inline` 、`normal` 、`post`  四种属性。

```javascript
// example
...
rules: [
  {
    enforce: 'pre',
    test: /\.js$/,
    exclude: /node_modules/,
    loader: "eslint-loader",
  },
  {
    test: /\.js$/,
    exclude: /node_modules/,
    loader: "babel-loader",
  },
]
...
```

对不需要解析依赖的第三方类库使用 `noParse` , 从而提高整体的构建速度。

```javascript
...
module: {
    noParse: /jquery|lodash/
}
...
```

#### Chapter 5

###### webpack-dev-server 的具体使用 : 

`proxy` 用于配置 webpack-dev-server 将 URL 请求代理到另一台服务器上。

```javascript
devServer: {
    port: '8080',
    proxy: {
      '/api': {
        target: "http://localhost:3000", // 将URL中带有/api的请求代理到本地的3000端口的服务上
        pathRewrite: { '^/api': '' }, // 把URL中path部分的`api`移除掉
      },
    }
}
```

`contentBase` 用于配置提供额外静态文件内容的目录 。

````javascript
// 使用当前目录下的 public
contentBase: path.join(__dirname, "public") 

// 也可以使用数组提供多个路径
contentBase: [path.join(__dirname, "public"), path.join(__dirname, "assets")]
````

#### Chapter 6

###### 开发与生产环境的构建配置差异 : 

在配置文件中区分 mode

````js
module.exports = (env, argv) => ({
  // ... 其他配置
  optimization: {
    minimize: false,
    // 使用 argv 来获取 mode 参数的值
    minimizer: argv.mode === 'production' ? [
      new UglifyJsPlugin({ /* 你自己的配置 */ }), 
      // 仅在我们要自定义压缩配置时才需要这么做
      // mode 为 production 时 webpack 会默认使用压缩 JS 的 plugin
    ] : [],
  },
})
````

运行时的环境变量

````js
export default function log(...args) {
  if (process.env.NODE_ENV === 'development' && console && console.log) {
    console.log.apply(console, args)
  }
}
````

#### Chapter 7

###### 配置使用 HMR : 

HMR 全称是 Hot Module Replacement，即模块热替换。在这个概念出来之前，我们使用过 Hot Reloading，当代码变更时通知浏览器刷新页面，以避免频繁手动刷新浏览器页面。HMR 可以理解为增强版的 Hot Reloading，但不用整个页面刷新，而是局部替换掉部分模块代码并且使其生效，可以看到代码变更后的效果。所以 HMR 既避免了频繁手动刷新页面, 也减少了页面刷新时的等待, 可以极大地提高前端页面开发效率。

````js
module.exports = {
  // ...
  devServer: {
    hot: true // dev server 的配置要启动 hot，或者在命令行中带参数开启
  },
  plugins: [
    // ...
    new webpack.NamedModulesPlugin(), // 用于启动 HMR 时可以显示模块的相对路径
    new webpack.HotModuleReplacementPlugin(), // Hot Module Replacement 的插件
  ],
}
````

````js
// example

if (module.hot) {
  module.hot.accept(['./index.css', './util.js'], () => {
      // callback ...
  })
}

````

#### Chapter 8

###### 图片压缩与代码压缩 : 

````js
{
    loader: 'image-webpack-loader',
    options: {
        mozjpeg: { // 压缩 jpeg 的配置
            progressive: true,
            quality: 65
        },
        pngquant: { // 使用 imagemin-pngquant 压缩 png
            quality: '65-90',
            speed: 4
        },
        gifsicle: { // 压缩 gif 的配置
            interlaced: false,
        },
        webp: { // 开启 webp，会把 jpg 和 png 图片压缩为 webp 格式
            quality: 75
        }
    }
}
````

````js
...
{
    loader: 'css-loader',
        // 压缩CSS
        options: {
            minimize: true
        }
}
...
new HtmlWebpackPlugin({
    filename: 'index.html', // 配置输出文件名和路径
    template: './src/index.html', // 配置文件模板
    minify: { // 压缩 HTML 的配置
        minifyCSS: true, // 压缩 HTML 中出现的 CSS 代码
        minifyJS: true, // 压缩 HTML 中出现的 JS 代码
        removeComments: true
    }
})
````

#### Chapter 9

###### 分离代码文件, 优化前端资源加载 : 

````
...
optimization: {
  splitChunks: {
      cacheGroups: {
      vendor: {
          chunks: "initial",
          test: path.resolve(__dirname, "node_modules"), // node_modules下的作为公共部分
          name: "vendor", // 使用 vendor 入口作为公共部分
          enforce: true
      }
    }
  }
}
plugins: [
    ...
]
````
