/**
 * Root level hooks
 */

const feathers = require('@feathersjs/feathers')
const restClient = require('@feathersjs/rest-client')
const request = require('request')
const log = console

let server

before(async function () {
  app = await app(log)

  const host = app.get('host')
  const port = app.get('port')

  server = app.listen(port)

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.once('listening', () => {
      log.info('Feathers application started on %s:%s', host, port)
      resolve()
    })
  })

  global.baseUrl = `http://${host}:${port}`

  /*
    Configure user connections
   */

  global.guest = feathers()
    .configure(restClient(baseUrl).request(request))
})

after(async function () {
  this.timeout(120000)

  const tasks = app.get('tasks')
  await new Promise(resolve => {
    setTimeout(() => {
      // clearTimeout(tasks.cache_grooming.tid)
      clearTimeout(tasks.worker.tid)
      resolve()
    }, 3000)
  })

  const nedb = app.get('databases').nedb
  nedb.cache.db.docs.persistence.stopAutocompaction()
  nedb.state.db.docs.persistence.stopAutocompaction()

  await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()))
  server.unref()
})
