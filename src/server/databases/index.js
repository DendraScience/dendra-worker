module.exports = async app => {
  const databases = app.get('databases')

  if (databases.nedb) await require('./nedb')(app)
}
