'use strict';

const apiHooks = require('@dendra-science/api-hooks-common');
const { disallow } = require('feathers-hooks-common');

exports.before = {
  // all: [],

  find: [apiHooks.coerceQuery()],

  // get: [],

  create: [apiHooks.timestamp()],

  update: [apiHooks.timestamp(), hook => {
    // TODO: Optimize with find/$select to return fewer fields?
    return hook.app.service('/state/docs').get(hook.id).then(doc => {
      hook.data.created_at = doc.created_at;
      return hook;
    });
  }],

  patch: disallow('rest')

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