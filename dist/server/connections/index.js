"use strict";

const feathers = require('@feathersjs/feathers');

const auth = require('@feathersjs/authentication-client');

const localStorage = require('localstorage-memory');

const restClient = require('@feathersjs/rest-client');

const request = require('request');

const murmurHash3 = require('murmurhash3js');

module.exports = function (app) {
  const connections = app.get('connections') || {};
  Object.keys(connections).forEach(key => {
    const connection = connections[key];
    connection.app = feathers().configure(restClient(connection.url).request(request));

    if (connection.email && connection.password) {
      const storageKey = connection.storageKey = murmurHash3.x86.hash128(connection.url);
      connection.app.configure(auth({
        storage: localStorage,
        storageKey
      }));
    }
  });
};