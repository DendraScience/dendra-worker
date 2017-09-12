/**
 * Tests for connections
 */

describe('App connections', function () {
  it('should be assigned', function () {
    const connections = main.app.get('connections')
    expect(connections).to.have.nested.property('testService.app')
  })
})
