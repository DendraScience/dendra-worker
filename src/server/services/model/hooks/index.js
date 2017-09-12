import {disallow} from 'feathers-hooks-common'

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
  // find: [],
  // get: [],
  // create: [],
  // update: [],
  // patch: [],
  // remove: []
}
