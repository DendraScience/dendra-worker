const moment = require('moment')
const os = require('os')
const { configTimerSeconds } = require('../../lib/utils')
const { TaskMachine } = require('@dendra-science/task-machine')

const TASK_NAME = 'worker'

class AgentLogger {
  constructor(logger, key) {
    this.logger = logger
    this.key = key
  }

  info(msg, ...meta) {
    this.logger.info(`Agent [${this.key}]: ${msg}`, ...meta)
  }

  error(msg, ...meta) {
    this.logger.error(`Agent [${this.key}]: ${msg}`, ...meta)
  }

  warn(msg, ...meta) {
    this.logger.warn(`Agent [${this.key}]: ${msg}`, ...meta)
  }
}

module.exports = function (app) {
  const { logger } = app
  const tasks = app.get('tasks') || {}

  const config = tasks[TASK_NAME]

  if (!config) return

  const agents = config.agents || {}
  const agentsKeys = Object.keys(agents)
  const hostname = os.hostname()
  const hostParts = hostname.split('-')

  // Create TaskMachine instances (i.e. agents) based on config
  agentsKeys.forEach(key => {
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
    Object.defineProperty(model, 'hostname', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: hostname
    })
    Object.defineProperty(model, 'hostOrdinal', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: hostParts[hostParts.length - 1]
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
    agent.machine = new TaskMachine(
      model,
      agentTasks,
      Object.assign({}, agent.options, {
        helpers: {
          logger: new AgentLogger(logger, key)
        }
      })
    )
  })

  app.set('agents', agents)

  const handleError = err => {
    logger.error(err)
  }

  const startAgent = async (agent, key) => {
    const docService = app.service('/state/docs')
    const currentDocId = `agent-${key}-current`
    const defaultDocId = `agent-${key}-default`
    const afterSeconds = agent.afterSeconds || 600

    if (
      agent.isProcessing ||
      moment().diff(agent.finishedAt, 's') < afterSeconds
    ) {
      logger.info(`Task [${TASK_NAME}]: Skipping agent '${key}'`)
      return
    }

    agent.isProcessing = true

    try {
      let doc

      logger.info(
        `Task [${TASK_NAME}]: Getting current state for agent '${key}'`
      )
      try {
        doc = await docService.get(currentDocId)
      } catch (err2) {
        if (err2.code !== 404) throw err2
      }

      if (!doc) {
        logger.info(
          `Task [${TASK_NAME}]: Getting default state for agent '${key}'`
        )
        try {
          doc = await docService.get(defaultDocId)
          doc = await docService.create(
            Object.assign(doc, {
              _id: currentDocId
            })
          )
        } catch (err2) {
          if (err2.code !== 404) throw err2
        }
      }

      if (!doc) {
        logger.info(
          `Task [${TASK_NAME}]: Using existing state for agent '${key}'`
        )
        doc = await docService.create(
          Object.assign(agent.machine.model.state, {
            _id: currentDocId
          })
        )
      }

      // Restore state before running
      agent.machine.model.state = doc
      agent.machine.model.scratch = {}

      logger.info(`Task [${TASK_NAME}]: Starting agent '${key}'`)
      await agent.machine.clear().start()

      // Preserve state after running
      logger.info(
        `Task [${TASK_NAME}]: Updating current state for agent '${key}'`
      )
      await docService.update(currentDocId, agent.machine.model.state)
    } catch (err) {
      handleError(err)
    } finally {
      delete agent.machine.model.scratch
      agent.isProcessing = false
      agent.finishedAt = moment()
    }
  }

  const runTask = async () => {
    logger.info(`Task [${TASK_NAME}]: Running...`)

    // NOTE: Agents run in parallel
    agentsKeys.forEach(key => startAgent(agents[key], key))
  }

  const scheduleTask = () => {
    const timerSeconds = configTimerSeconds(config)

    logger.info(`Task [${TASK_NAME}]: Starting in ${timerSeconds} seconds`)

    config.tid = setTimeout(() => {
      runTask().catch(handleError).then(scheduleTask)
    }, timerSeconds * 1000)
  }

  scheduleTask()
}
