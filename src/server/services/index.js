const path = require('path')

module.exports = function (app) {
  const names = [
    'cache_doc',
    'state_doc',
    'model'
  ]

  names.forEach(name => app.configure(require(path.join(__dirname, name))))
}
