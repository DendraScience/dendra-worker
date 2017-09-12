const fs = require('fs')
const path = require('path')
const Datastore = require('nedb')

module.exports = (function () {
  return function () {
    const app = this
    const state = app.get('databases').nedb.state
    const statePath = path.resolve(state.path)

    // Configure a new instance
    state.db = new Promise((resolve, reject) => {
      fs.mkdir(statePath, err => err && (err.code !== 'EEXIST') ? reject(err) : resolve())
    }).then(() => {
      return {
        docs: new Datastore({
          filename: path.join(statePath, 'docs.db'),
          autoload: true
        })
      }
    })
  }
})()
