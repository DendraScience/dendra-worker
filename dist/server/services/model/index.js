'use strict';

var _feathersErrors = require('feathers-errors');

var _hooks = require('./hooks');

var _hooks2 = _interopRequireDefault(_hooks);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Service {
  constructor() {
    // HACK: Syntax highlighting breaks on class methods named 'get'
    this.get = this._get;
  }

  setup(app) {
    this.app = app;
  }

  _taskMachines() {
    return this.app.get('taskMachines') || {};
  }

  find(params, callback) {
    const taskMachines = this._taskMachines();
    const values = Object.keys(taskMachines).map(key => {
      return Object.assign({}, taskMachines[key].machine.model);
    });
    callback(null, {
      total: values.length,
      data: values
    });
  }

  _get(id) {
    const taskMachine = this._taskMachines()[id];
    return new Promise((resolve, reject) => {
      if (!taskMachine) {
        reject(new _feathersErrors.errors.NotFound(`No record found for id '${id}'`));
      } else {
        resolve(Object.assign({}, taskMachine.machine.model));
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

    modelService.before(_hooks2.default.before);
    modelService.after(_hooks2.default.after);
  };
}();