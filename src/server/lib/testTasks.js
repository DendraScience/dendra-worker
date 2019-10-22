/**
 * Built-in tasks for testing after installation.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/testTasks
 */

const moment = require('moment')

module.exports = {
  a: {
    clear(m) {
      m.value = null
    },

    guard(m) {
      return !m.value
    },

    execute(m) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({ some: 'data' })
        }, 200)
      })
    },

    afterExecute(m, res, { logger }) {
      logger.info('Logging info')
      logger.info('Logging info w/ meta', { extra: 'data', m: moment() })
      logger.warn('Logging warning')
      logger.warn('Logging warning w/ meta', { extra: 'data', m: moment() })
      logger.error('Logging error')
      logger.error('Logging error w/ meta', { extra: 'data', m: moment() })

      return res
    },

    assign(m, res) {
      m.value = res
    }
  }
}
