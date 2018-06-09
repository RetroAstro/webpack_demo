
const path = require('path')
// const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
    entry: './src/js/index.js',
    output: {
        filename: './js/[name].js', // 相对于 dist 目录
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        // 设置不需要解析依赖, 以提高整体构建速度
        noParse: /jquery|lodash/,
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                use: [
                    // Babel ES6+ 转 ES5
                    'babel-loader',
                    // eslint 检查代码规范
                    'eslint-loader'
                ]
            },
            // 解析CSS预处理器
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            // 压缩CSS
                            options: {
                                minimize: true
                            }
                        },
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
                })
            },
            // 压缩图片
            {
                test: /\.(png|jpe?g|gif|webp)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'images/', // 输出图片文件途径
                            publicPath: '../images/' // 相对于CSS文件引用的图片路径
                        }
                    },
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
                ]
            }
        ]
    },
    // enhanced-resolve
    resolve: {
        modules: [
            // 查找直接声明依赖名的模块
            path.resolve(__dirname, 'node_modules'),
        ],
        // 按先后顺序查找相关文件, 补全后缀名, 最好不省略后缀名。
        extensions: ['.js']
    },
    // 分离代码文件, 优化前端资源加载
    optimization: {
        splitChunks: {
          cacheGroups: {
            vendor: {
              chunks: "initial",
              test: path.resolve(__dirname, "node_modules"), // 路径在 node_modules 目录下的都作为公共部分
              name: "vendor", // 使用 vendor 入口作为公共部分
              enforce: true,
            }
          }
        }
    },
    plugins: [
        // 将构建结果与HTML关联
        new HtmlWebpackPlugin({
            filename: 'index.html', // 配置输出文件名和路径
            template: './src/index.html', // 配置文件模板
            minify: { // 压缩 HTML 的配置
                minifyCSS: true, // 压缩 HTML 中出现的 CSS 代码
                minifyJS: true, // 压缩 HTML 中出现的 JS 代码
                removeComments: true // 移除代码中的注释
            }
        }),
        // 使用不同loader解析并处理Scss、CSS文件, 且单独把CSS文件分离出来
        new ExtractTextPlugin({
            filename: "./css/[name].css" // 配置输出文件名和路径
        }),
        // // 用于启动 HMR 时可以显示模块的相对路径
        // new webpack.NamedModulesPlugin(), 
        // // Hot Module Replacement 的插件
        // new webpack.HotModuleReplacementPlugin()
    ],
    // 开启本地服务器
    devServer: {
        // hot: 'true',
        port: '8080'
    }
}