const service = require('feathers-nedb')
const hooks = require('./hooks')

module.exports = function (app) {
  const databases = app.get('databases')

  if (!(databases.nedb && databases.nedb.cache)) return

  const { cache } = databases.nedb
  const { db } = cache

  const nedbService = service({
    Model: db.docs,
    paginate: cache.paginate
  })

  app.use('/cache/docs', nedbService)

  // Get the wrapped service object, bind hooks
  app.service('cache/docs').hooks(hooks)
}
