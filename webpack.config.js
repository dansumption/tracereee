const path = require('path');

module.exports = {
  entry: './js/tracery/tracery.js',
  output: {
    filename: 'tracery.js',
    path: path.resolve(__dirname, 'dist')
  }
};