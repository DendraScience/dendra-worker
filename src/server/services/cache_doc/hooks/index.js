const apiHooks = require('@dendra-science/api-hooks-common')
const { disallow } = require('feathers-hooks-common')

exports.before = {
  // all: [],

  find: apiHooks.coerceQuery(),

  // get: [],

  create: [disallow('rest'), apiHooks.timestamp(), apiHooks.coerce()],

  update: [disallow('rest'), apiHooks.timestamp(), apiHooks.coerce()],

  patch: [disallow('rest'), apiHooks.coerceQuery(), apiHooks.coerce()],

  remove: [disallow('rest'), apiHooks.coerceQuery()]
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
