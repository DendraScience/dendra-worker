module.exports = async (app) => {
  const nedb = app.get('databases').nedb

  if (nedb.cache) await require('./init')(app, { nedb: nedb.cache })
  if (nedb.state) await require('./init')(app, { nedb: nedb.state })
}
