const errors = require('@feathersjs/errors')
const hooks = require('./hooks')

class Service {
  setup(app) {
    this.app = app
  }

  _agents() {
    return this.app.get('agents') || {}
  }

  async find() {
    const agents = this._agents()
    const values = Object.keys(agents).map(key => {
      return Object.assign({}, agents[key].machine.model)
    })

    return {
      total: values.length,
      data: values
    }
  }

  async get(id) {
    const agent = this._agents()[id]

    if (agent) {
      return Object.assign({}, agent.machine.model)
    }

    throw new errors.NotFound(`No record found for id '${id}'`)
  }
}

module.exports = function (app) {
  app.use('/models', new Service())

  // Get the wrapped service object, bind hooks
  app.service('models').hooks(hooks)
}
