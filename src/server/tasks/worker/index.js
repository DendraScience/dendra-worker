const moment = require('moment')
const util = require('util')
const {configTimerSeconds} = require('../../lib/utils')
const {TaskMachine} = require('@dendra-science/task-machine')

/*
  HACK: Winston custom loggers are a pain in 2.x - make a custom one!
 */
class AgentLogger {
  constructor (logger, key) {
    this.inspectOpts = {
      depth: 16,
      maxArrayLength: 200,
      breakLength: Infinity
    }
    this.logger = logger
    this.key = key
  }

  info (msg, meta) {
    const pre = `Agent [${this.key}]: ${msg}`
    this.logger.info(typeof meta === 'undefined' ? pre : `${pre} | ${util.inspect(meta, this.inspectOpts)}`)
  }

  error (msg, meta) {
    const pre = `Agent [${this.key}]: ${msg}`
    this.logger.error(typeof meta === 'undefined' ? pre : `${pre} | ${util.inspect(meta, this.inspectOpts)}`)
  }

  warn (msg, meta) {
    const pre = `Agent [${this.key}]: ${msg}`
    this.logger.warn(typeof meta === 'undefined' ? pre : `${pre} | ${util.inspect(meta, this.inspectOpts)}`)
  }
}

module.exports = (function () {
  return function () {
    const app = this
    const tasks = app.get('tasks')

    if (tasks.worker) {
      /*
        Get config settings; assume reasonable defaults.
       */

      const config = tasks.worker
      const agents = config.agents || {}

      // Create TaskMachine instances (i.e. agents) based on config
      Object.keys(agents).forEach(key => {
        const agent = agents[key]
        const agentModule = require(agent.module)
        const agentTasks = agentModule[agent.member || 'default'] || agentModule

        const model = {
          state: {}
        }

        Object.defineProperty(model, '$app', {
          enumerable: false,
          configurable: false,
          writable: false,
          value: app
        })
        Object.defineProperty(model, 'key', {
          enumerable: true,
          configurable: false,
          writable: false,
          value: key
        })
        Object.defineProperty(model, 'private', {
          enumerable: false,
          configurable: false,
          writable: false,
          value: {}
        })
        Object.defineProperty(model, 'props', {
          enumerable: false,
          configurable: false,
          writable: false,
          value: Object.assign({}, agent.props)
        })

        agent.finishedAt = moment()
        agent.machine = new TaskMachine(model, agentTasks, Object.assign({}, agent.options, {
          helpers: {
            logger: new AgentLogger(app.logger, key)
          }
        }))
      })

      app.set('agents', agents)

      const handleError = function (err) {
        app.logger.error(err)
      }

      const scheduleTask = function () {
        const timerSeconds = configTimerSeconds(config)

        app.logger.info(`Task [worker]: Starting in ${timerSeconds} seconds`)

        setTimeout(() => {
          app.logger.info('Task [worker]: Running...')

          const docService = app.service('/state/docs')

          Object.keys(agents).forEach(key => {
            const agent = agents[key]
            const currentDocId = `agent-${key}-current`
            const defaultDocId = `agent-${key}-default`
            const afterSeconds = agent.afterSeconds || 600

            if (agent.isProcessing || (moment().diff(agent.finishedAt, 's') < afterSeconds)) {
              app.logger.info(`Task [worker]: Skipping agent '${key}'`)
              return
            }

            agent.isProcessing = true

            app.logger.info(`Task [worker]: Getting current state for agent '${key}'`)
            docService.get(currentDocId).catch(err => {
              if (err.code !== 404) throw err

              app.logger.info(`Task [worker]: Getting default state for agent '${key}'`)
              return docService.get(defaultDocId).then(doc => {
                return docService.create(Object.assign(doc, {
                  _id: currentDocId
                }))
              })
            }).catch(err => {
              if (err.code !== 404) throw err

              app.logger.info(`Task [worker]: Using existing state for agent '${key}'`)
              return docService.create(Object.assign(agent.machine.model.state, {
                _id: currentDocId
              }))
            }).then(doc => {
              // Restore state before running
              agent.machine.model.state = doc
              agent.machine.model.scratch = {}

              app.logger.info(`Task [worker]: Starting agent '${key}'`)
              return agent.machine.clear().start()
            }).then(success => {
              // Preserve state after running
              app.logger.info(`Task [worker]: Updating current state for agent '${key}'`)
              return docService.update(currentDocId, agent.machine.model.state)
            }).catch(handleError).then(() => {
              delete agent.machine.model.scratch
              agent.isProcessing = false
              agent.finishedAt = moment()
            })
          })

          scheduleTask()
        }, timerSeconds * 1000)
      }

      app.set('taskReady',
        Promise.resolve(app.get('middlewareReady')).then(scheduleTask))
    }
  }
})()
