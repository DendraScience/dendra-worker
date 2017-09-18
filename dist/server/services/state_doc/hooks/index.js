'use strict';

const apiHooks = require('@dendra-science/api-hooks-common');
// const globalHooks = require('../../../hooks')
const hooks = require('feathers-hooks-common');

exports.before = {
  // all: [],

  find: [apiHooks.coerceQuery()],

  // get: [],

  create: apiHooks.timestamp(),
  update: apiHooks.timestamp(),

  patch: hooks.disallow('rest')

  // remove: []
};

exports.after = {
  // all: [],
  // find: [],
  // get: [],
  // create: [],
  // update: [],
  // patch: [],
  // remove: []
};