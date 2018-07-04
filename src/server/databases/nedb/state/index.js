const fs = require('fs')
const path = require('path')
const Datastore = require('nedb')

module.exports = (function () {
  return function () {
    const app = this
    const state = app.get('databases').nedb.state
    const statePath = path.resolve(state.path)
    const autocompactionInterval = state.autocompactionInterval | 0

    // Configure a new instance
    state.db = new Promise((resolve, reject) => {
      fs.mkdir(statePath, err => err && (err.code !== 'EEXIST') ? reject(err) : resolve())
    }).then(() => {
      const filename = path.join(statePath, 'docs.db')
      const docs = new Datastore({
        filename,
        autoload: true
      })

      if (autocompactionInterval > 0) {
        docs.persistence.setAutocompactionInterval(autocompactionInterval)
      }
      docs.on('compaction.done', () => {
        app.logger.info(`Compacted ${filename}`)
      })

      return {
        docs
      }
    })
  }
})()
