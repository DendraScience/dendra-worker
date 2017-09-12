'use strict';

const { configTimerSeconds } = require('../../lib/utils');
const { TaskMachine } = require('@dendra-science/task-machine');

module.exports = function () {
  return function () {
    const app = this;
    const tasks = app.get('tasks');

    if (tasks.worker) {
      /*
        Get config settings; assume reasonable defaults.
       */

      const config = tasks.worker;
      const taskMachines = config.taskMachines || {};

      // Create TaskMachine instances based on config
      Object.keys(taskMachines).forEach(key => {
        const taskMachine = taskMachines[key];
        const tasksModule = require(taskMachine.moduleId);

        taskMachine.machine = new TaskMachine({
          $app: app,
          _id: key,
          props: Object.assign({}, taskMachine.props)
        }, tasksModule.default || tasksModule, Object.assign({
          interval: -1
        }, taskMachine.options));
      });

      app.set('taskMachines', taskMachines);

      const handleError = function (err) {
        app.logger.error(err);
      };

      const scheduleTask = function () {
        const timerSeconds = configTimerSeconds(config);

        app.logger.info(`Task [worker]: Starting in ${timerSeconds} seconds`);

        setTimeout(() => {
          app.logger.info('Task [worker]: Running...');

          const docService = app.service('/state/docs');

          Object.keys(taskMachines).forEach(key => {
            const taskMachine = taskMachines[key];

            if (taskMachine.isProcessing) {
              app.logger.info(`Task [worker]: Skipping machine '${key}'`);
              return;
            }

            taskMachine.isProcessing = true;

            docService.get(key).then(doc => {
              return doc;
            }).catch(err => {
              if (err.code !== 404) throw err;

              app.logger.info(`Task [worker]: Creating state for machine '${key}'`);

              return docService.create(Object.assign({}, taskMachine.machine.model.state, {
                _id: key
              }));
            }).then(doc => {
              // Restore state before running
              taskMachine.machine.model.state = doc;

              app.logger.info(`Task [worker]: Starting machine '${key}'`);

              return taskMachine.machine.clear().start();
            }).then(success => {
              app.logger.info(`Task [worker]: Updating state for machine '${key}'`);

              // Preserve state after running
              return docService.update(key, taskMachine.machine.model.state);
            }).catch(handleError).then(() => {
              taskMachine.isProcessing = false;
            });
          });

          scheduleTask();
        }, timerSeconds * 1000);
      };

      app.set('taskReady', Promise.resolve(app.get('middlewareReady')).then(scheduleTask));
    }
  };
}();