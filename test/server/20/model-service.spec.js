/**
 * Tests for series service
 */

describe('Service /models', function () {
  this.timeout(60000)

  before(function () {
    // Wait for task to run
    return new Promise(resolve => setTimeout(resolve, 7000))
  })

  describe('#get()', function () {
    it('should get without error', function () {
      return main.app.service('/models').get('test').then(doc => {
        expect(doc).to.have.nested.property('key', 'test')
        expect(doc).to.not.have.nested.property('props.hello', 'world')
        expect(doc).to.have.nested.property('state._id', 'taskMachine-test-current')
        expect(doc).to.have.nested.property('value.some', 'data')
      })
    })
  })

  describe('#find()', function () {
    it('should find without error', function () {
      return main.app.service('/models').find().then(res => {
        expect(res).to.have.nested.property('data.0.key', 'test')
        expect(res).to.not.have.nested.property('data.0.props.hello', 'world')
        expect(res).to.have.nested.property('data.0.state._id', 'taskMachine-test-current')
        expect(res).to.have.nested.property('data.0.value.some', 'data')
      })
    })
  })
})
