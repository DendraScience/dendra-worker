const apiHooks = require('@dendra-science/api-hooks-common')
const { disallow } = require('feathers-hooks-common')

exports.before = {
  // all: [],

  find: apiHooks.coerceQuery(),

  // get: [],

  create: [apiHooks.timestamp(), apiHooks.coerce()],

  update: [
    apiHooks.timestamp(),
    apiHooks.coerce(),

    async context => {
      const doc = await context.app.service('/state/docs').get(context.id)
      context.data.created_at = doc.created_at
    }
  ],

  patch: [disallow('rest'), apiHooks.coerceQuery(), apiHooks.coerce()],

  remove: apiHooks.coerceQuery()
}

exports.after = {
  // all: [],
  // find: [],
  // get: [],
  // create: [],
  // update: [],
  // patch: [],
  // remove: []
}
