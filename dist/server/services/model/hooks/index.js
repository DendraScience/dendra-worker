'use strict';

var _feathersHooksCommon = require('feathers-hooks-common');

exports.before = {
  // all: [],
  // find: [],
  // get: [],

  create: (0, _feathersHooksCommon.disallow)(),
  update: (0, _feathersHooksCommon.disallow)(),
  patch: (0, _feathersHooksCommon.disallow)(),
  remove: (0, _feathersHooksCommon.disallow)()
};

exports.after = {
  all: (0, _feathersHooksCommon.discard)('$app', 'private', 'props', 'scratch')

  // find: [],
  // get: [],
  // create: [],
  // update: [],
  // patch: [],
  // remove: []
};