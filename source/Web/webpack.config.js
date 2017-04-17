var path = require("path");
var webpack = require("webpack");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var combineLoaders = require('webpack-combine-loaders');

var cfg = {
  devtool: "source-map",
  entry: [      
	  "webpack-dev-server/client?http://localhost:8080",
      "./Web/fable_main.js"],
  output: {   
     path : path.join(__dirname, "build"),
     filename: "bundle.js"     
  },
  node: {
    fs: "empty"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "source-map-loader"
      },
      {
      test: /\.css$/,
      loader: combineLoaders([
        {
          loader: 'style-loader'
        }, {
          loader: 'css-loader',
          query: {
            modules: true,
            localIdentName: '[name]__[local]___[hash:base64:5]'
            }
          }      
        ])
      }    
    ]},
  plugins: [
    new CopyWebpackPlugin([
            // {output}/file.txt
            { from: 'tracking.html' },            
            { from : 'elevationChart.css'},
            { from : 'bootstrap-extensions.css'},
            { from : 'parse-latest.js'} ,
            { from : './node_modules/bootstrap/dist/js/bootstrap.min.js'} ,
            { from : './node_modules/bootstrap/dist/css/bootstrap.min.css'} ,
                       
      ]),
      new ExtractTextPlugin('styles.css')
  ],
  externals: {
    "Parse": "parse-latest"    
  },
  devServer : {
      contentBase : "./build",
      proxy: {
      '/api': {
        target: 'http://192.168.1.101',
        secure: false
      }
    }
  }
};

module.exports = cfg;