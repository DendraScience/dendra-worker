const service = require('feathers-nedb')
const hooks = require('./hooks')

module.exports = function (app) {
  const databases = app.get('databases')

  if (!(databases.nedb && databases.nedb.cache)) return

  const { db, paginate } = databases.nedb.cache

  app.use('/cache/docs', service({
    Model: db.docs,
    paginate
  }))

  // Get the wrapped service object, bind hooks
  const docService = app.service('/cache/docs')

  docService.hooks(hooks)
}
