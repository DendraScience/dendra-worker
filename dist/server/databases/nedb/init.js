'use strict';

const Datastore = require('nedb');

const fs = require('fs');
const path = require('path');
const util = require('util');

const mkdir = util.promisify(fs.mkdir);

module.exports = async (app, { nedb }) => {
  const nedbPath = path.resolve(nedb.path);
  const autocompactionInterval = nedb.autocompactionInterval | 0;

  try {
    await mkdir(nedbPath);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }

  const filename = path.join(nedbPath, 'docs.db');
  const docs = new Datastore({
    filename,
    autoload: true
  });

  if (autocompactionInterval > 0) {
    docs.persistence.setAutocompactionInterval(autocompactionInterval);
  }
  docs.on('compaction.done', () => {
    app.logger.info(`Compacted ${filename}`);
  });

  nedb.db = {
    docs
  };
};