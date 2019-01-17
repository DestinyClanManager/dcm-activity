describe('garbage dispatcher', () => {
  let subject, dispatchProvider

  beforeEach(() => {
    dispatchProvider = td.replace('../../../../src/providers/dispatch-provider')
    subject = require('../../../../src/dispatchers/garbage-dispatcher')
  })

  describe('publishGarbageCollector', () => {
    let publish

    beforeEach(async () => {
      publish = td.function()
      const promise = td.function()
      td.when(promise()).thenResolve()
      td.when(publish(td.matchers.anything())).thenReturn({ promise })
      td.when(dispatchProvider.getInstance()).thenReturn({ publish })

      await subject.publishGarbageCollector('clan-id')
    })

    it('publishes a message for the clan id', () => {
      td.verify(
        publish({
          Message: 'clan-id',
          TopicArn: 'garbage-collection-topic'
        })
      )
    })
  })
})
