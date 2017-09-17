const {configTimerSeconds} = require('../../lib/utils')
const {TaskMachine} = require('@dendra-science/task-machine')

module.exports = (function () {
  return function () {
    const app = this
    const tasks = app.get('tasks')

    if (tasks.worker) {
      /*
        Get config settings; assume reasonable defaults.
       */

      const config = tasks.worker
      const taskMachines = config.taskMachines || {}

      // Create TaskMachine instances based on config
      Object.keys(taskMachines).forEach(key => {
        const taskMachine = taskMachines[key]
        const tasksModule = require(taskMachine.module)
        const tasksMember = tasksModule[taskMachine.member || 'default'] || tasksModule

        taskMachine.machine = new TaskMachine({
          $app: app,
          key: key,
          props: Object.assign({}, taskMachine.props),
          state: {}
        }, tasksMember, Object.assign({
          interval: -1
        }, taskMachine.options))
      })

      app.set('taskMachines', taskMachines)

      const handleError = function (err) {
        app.logger.error(err)
      }

      const scheduleTask = function () {
        const timerSeconds = configTimerSeconds(config)

        app.logger.info(`Task [worker]: Starting in ${timerSeconds} seconds`)

        setTimeout(() => {
          app.logger.info('Task [worker]: Running...')

          const docService = app.service('/state/docs')

          Object.keys(taskMachines).forEach(key => {
            const taskMachine = taskMachines[key]
            const currentDocId = `taskMachine-${key}-current`
            const defaultDocId = `taskMachine-${key}-default`

            if (taskMachine.isProcessing) {
              app.logger.info(`Task [worker]: Skipping machine '${key}'`)
              return
            }

            taskMachine.isProcessing = true

            app.logger.info(`Task [worker]: Getting current state for machine '${key}'`)
            docService.get(currentDocId).catch(err => {
              if (err.code !== 404) throw err

              app.logger.info(`Task [worker]: Getting default state for machine '${key}'`)
              return docService.get(defaultDocId).then(doc => {
                return docService.create(Object.assign(doc, {
                  _id: currentDocId
                }))
              })
            }).catch(err => {
              if (err.code !== 404) throw err

              app.logger.info(`Task [worker]: Using existing state for machine '${key}'`)
              return docService.create(Object.assign(taskMachine.machine.model.state, {
                _id: currentDocId
              }))
            }).then(doc => {
              // Restore state before running
              taskMachine.machine.model.state = doc

              app.logger.info(`Task [worker]: Starting machine '${key}'`)
              return taskMachine.machine.clear().start()
            }).then(success => {
              // Preserve state after running
              app.logger.info(`Task [worker]: Updating current state for machine '${key}'`)
              return docService.update(currentDocId, taskMachine.machine.model.state)
            }).catch(handleError).then(() => {
              taskMachine.isProcessing = false
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
