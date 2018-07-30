const fs = require('fs')
const path = require('path')
const Datastore = require('nedb')

module.exports = (function () {
  return function () {
    const app = this
    const cache = app.get('databases').nedb.cache
    const cachePath = path.resolve(cache.path)
    const autocompactionInterval = cache.autocompactionInterval | 0

    // Configure a new instance
    cache.db = new Promise((resolve, reject) => {
      fs.mkdir(cachePath, err => err && (err.code !== 'EEXIST') ? reject(err) : resolve())
    }).then(() => {
      const filename = path.join(cachePath, 'docs.db')
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
