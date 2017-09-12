const path = require('path')

module.exports = (function () {
  return function () {
    const app = this
    const serviceNames = [
      'cache_doc',
      'state_doc',
      'model'
    ]

    // Feathers configuration is synchronous, so use promises to wait for
    // async stuff like database connections, etc.
    let ready = Promise.resolve()
    serviceNames.forEach(name => {
      ready = ready.then(() => {
        app.set('serviceReady', true)
        app.configure(require(path.join(__dirname, name)))

        // Each service configuration can optionally return a promise for
        // readiness via an app setting
        return app.get('serviceReady')
      })
    })

    // All services are mounted when the last service promise is resolved;
    // note that middleware is dependent on fulfillment of this promise
    app.set('servicesReady', ready)
  }
})()
