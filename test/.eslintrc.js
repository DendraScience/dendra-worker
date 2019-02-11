// SEE: http://eslint.org/docs/user-guide/configuring
module.exports = {
  env: {
    'mocha': true,
    'node': true
  },
  extends: 'standard',
  globals: {
    assert: true,
    baseUrl: true,
    expect: true,
    guest: true,
    helper: true,
    app: true,
    path: true
  },
  root: true,
  parserOptions: {
    sourceType: 'module'
  }
}
