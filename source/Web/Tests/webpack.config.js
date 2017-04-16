var path = require("path");
var webpack = require("webpack");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var cfg = {
  devtool: "source-map",
  entry: [      
	  "webpack-dev-server/client?http://localhost:8080",
      "./Tests/fable_main.js"],
  output: {   
     path : path.join(__dirname, "build"),
     filename: "bundle.js"     
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "source-map-loader"
      }      
    ],
    rules: [{
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: 'css-loader'
        })
    }]
  },
  plugins: [
    new CopyWebpackPlugin([
            // {output}/file.txt
            { from: 'tracking.html' },
            { from : 'bootstrap-3.3.7-dist/css/bootstrap.min.css'},
            { from : 'elevationChart.css'},
            { from : 'parse-latest.js'},
            { from : 'bootstrap-3.3.7-dist/js/bootstrap.min.js'},
            { from : 'jquery-3.1.1.min.js'}
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