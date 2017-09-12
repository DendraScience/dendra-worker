'use strict';

const service = require('feathers-nedb');
const hooks = require('./hooks');

module.exports = function () {
  return function () {
    const app = this;
    const databases = app.get('databases');

    if (databases.nedb && databases.nedb.state) {
      app.set('serviceReady', Promise.resolve(databases.nedb.state.db).then(db => {
        app.use('/state/docs', service({
          Model: db.docs,
          paginate: databases.nedb.state.paginate
        }));

        // Get the wrapped service object, bind hooks
        const docService = app.service('/state/docs');

        docService.before(hooks.before);
        docService.after(hooks.after);
      }));
    }
  };
}();