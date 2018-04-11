'use strict';

const hooks = require('./hooks');
const { errors } = require('feathers-errors');

class Service {
  constructor() {
    // HACK: Syntax highlighting breaks on class methods named 'get'
    this.get = this._get;
  }

  setup(app) {
    this.app = app;
  }

  _agents() {
    return this.app.get('agents') || {};
  }

  find(params, callback) {
    const agents = this._agents();
    const values = Object.keys(agents).map(key => {
      return Object.assign({}, agents[key].machine.model);
    });
    callback(null, {
      total: values.length,
      data: values
    });
  }

  _get(id) {
    const agent = this._agents()[id];
    return new Promise((resolve, reject) => {
      if (!agent) {
        reject(new errors.NotFound(`No record found for id '${id}'`));
      } else {
        resolve(Object.assign({}, agent.machine.model));
      }
    });
  }
}

module.exports = function () {
  return function () {
    const app = this;

    app.use('/models', new Service());

    // Get the wrapped service object, bind hooks
    const modelService = app.service('/models');

    modelService.before(hooks.before);
    modelService.after(hooks.after);
  };
}();