const apiHooks = require('@dendra-science/api-hooks-common')
const {disallow} = require('feathers-hooks-common')

exports.before = {
  // all: [],

  find: [
    apiHooks.coerceQuery()
  ],

  // get: [],

  create: [
    disallow('rest'),
    apiHooks.timestamp()
  ],

  update: [
    disallow('rest'),
    apiHooks.timestamp()
  ],

  patch: disallow('rest'),
  remove: disallow('rest')
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
