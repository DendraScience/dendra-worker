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
  // all: [],

  find: (0, _feathersHooksCommon.discard)('$app', 'scratch'),
  get: (0, _feathersHooksCommon.discard)('$app', 'scratch')

  // create: [],
  // update: [],
  // patch: [],
  // remove: []
};