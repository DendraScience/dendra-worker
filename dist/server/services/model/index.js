'use strict';

const errors = require('@feathersjs/errors');
const hooks = require('./hooks');

class Service {
  setup(app) {
    this.app = app;
  }

  _agents() {
    return this.app.get('agents') || {};
  }

  find(params) {
    const agents = this._agents();
    const values = Object.keys(agents).map(key => {
      return Object.assign({}, agents[key].machine.model);
    });

    return Promise.resolve({
      total: values.length,
      data: values
    });
  }

  get(id) {
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

module.exports = function (app) {
  app.use('/models', new Service());

  // Get the wrapped service object, bind hooks
  const modelService = app.service('/models');

  modelService.hooks(hooks);
};