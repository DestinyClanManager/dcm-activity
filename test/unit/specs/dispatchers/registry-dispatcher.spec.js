describe('registry dispatcher', () => {
  let subject, dispatchProvider, publish, promise

  beforeEach(() => {
    publish = td.function()
    promise = td.function()

    td.when(publish(td.matchers.anything())).thenReturn({ promise })

    dispatchProvider = td.replace('../../../../src/providers/dispatch-provider')

    td.when(dispatchProvider.getInstance()).thenReturn({ publish })

    subject = require('../../../../src/dispatchers/registry-dispatcher')
  })

  describe('publishRegisteredClan', () => {
    beforeEach(async () => {
      td.when(promise()).thenResolve()
      await subject.publishRegisteredClan('clan-id')
    })

    it('sends a message with the clan id', () => {
      const expectedMessage = {
        Message: 'clan-id',
        TopicArn: 'registered-clan-topic'
      }
      td.verify(publish(expectedMessage))
    })
  })
})
