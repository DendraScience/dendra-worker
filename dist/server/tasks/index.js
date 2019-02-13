"use strict";

const path = require('path');

module.exports = function (app) {
  const names = ['cache_grooming', 'worker'];
  names.forEach(name => app.configure(require(path.join(__dirname, name))));
};