import {disallow, discard} from 'feathers-hooks-common'

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
  // all: [],

  find: discard('$app', 'scratch'),
  get: discard('$app', 'scratch')

  // create: [],
  // update: [],
  // patch: [],
  // remove: []
}
