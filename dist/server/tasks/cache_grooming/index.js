"use strict";

const moment = require('moment');

const {
  configTimerSeconds
} = require('../../lib/utils');

const TASK_NAME = 'cache_grooming';

module.exports = function (app) {
  const {
    logger
  } = app;
  const tasks = app.get('tasks') || {};
  const config = tasks[TASK_NAME];
  if (!config) return;
  const docLimit = typeof config.docLimit === 'number' ? config.docLimit : 20;
  const retentionMinutes = typeof config.retentionMinutes === 'number' ? config.retentionMinutes : 60;

  const handleError = err => {
    logger.error(err);
  };

  const processDocs = async now => {
    const service = app.service('/cache/docs');
    const query = {
      $or: [{
        updated_at: {
          $exists: false
        }
      }, {
        updated_at: {
          $lt: moment().utc().subtract(retentionMinutes, 'm').toISOString()
        }
      }],
      $limit: docLimit,
      $sort: {
        updated_at: -1 // DESC

      }
    };
    const res = await service.find({
      query
    });

    if (!(res && res.data && res.data.length > 0)) {
      logger.info(`Task [${TASK_NAME}]: No cache docs found`);
      return;
    }

    for (const doc of res.data) {
      logger.info(`Task [${TASK_NAME}]: Removing cache doc ${doc._id}`);
      await service.remove(doc._id);
    }
  };

  const runTask = async () => {
    logger.info(`Task [${TASK_NAME}]: Running...`);
    await processDocs(new Date()); // NOTE: Add additional grooming steps here
  };

  const scheduleTask = () => {
    const timerSeconds = configTimerSeconds(config);
    logger.info(`Task [${TASK_NAME}]: Starting in ${timerSeconds} seconds`);
    config.tid = setTimeout(() => {
      runTask().catch(handleError).then(scheduleTask);
    }, timerSeconds * 1000);
  };

  scheduleTask();
};