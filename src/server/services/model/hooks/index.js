const {discard, disallow} = require('feathers-hooks-common')

exports.before = {
  // all: [],
  // find: [],
  // get: [],

  create: disallow(),
  update: disallow(),
  patch: disallow(),
  remove: disallow()
}

exports.after = {
  all: discard('$app', 'private', 'props', 'scratch')

  // find: [],
  // get: [],
  // create: [],
  // update: [],
  // patch: [],
  // remove: []
}
