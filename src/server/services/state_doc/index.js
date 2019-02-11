const service = require('feathers-nedb')
const hooks = require('./hooks')

module.exports = function (app) {
  const databases = app.get('databases')

  if (!(databases.nedb && databases.nedb.state)) return

  const { db, paginate } = databases.nedb.state

  app.use('/state/docs', service({
    Model: db.docs,
    paginate
  }))

  // Get the wrapped service object, bind hooks
  const docService = app.service('/state/docs')

  docService.hooks(hooks)
}
