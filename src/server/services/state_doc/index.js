const service = require('feathers-nedb')
const hooks = require('./hooks')

module.exports = function (app) {
  const databases = app.get('databases')

  if (!(databases.nedb && databases.nedb.state)) return

  const { state } = databases.nedb
  const { db } = state

  const nedbService = service({
    Model: db.docs,
    paginate: state.paginate
  })

  app.use('/state/docs', nedbService)

  // Get the wrapped service object, bind hooks
  app.service('state/docs').hooks(hooks)
}
