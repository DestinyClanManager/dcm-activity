describe('member dispatcher', () => {
  let subject, dispatchProvider

  beforeEach(() => {
    dispatchProvider = td.replace('../../../../src/providers/dispatch-provider')
    subject = require('../../../../src/dispatchers/member-dispatcher')
  })

  describe('publishClanMember', () => {
    let publish

    beforeEach(async () => {
      publish = td.function()
      const promise = td.function()
      td.when(promise()).thenResolve()
      td.when(publish(td.matchers.anything())).thenReturn({ promise })
      td.when(dispatchProvider.getInstance()).thenReturn({ publish })

      const member = {}
      await subject.publishClanMember(member)
    })

    it('publishes the member', () => {
      const expectedMessage = {
        TopicArn: 'clan-member-topic',
        Message: JSON.stringify({})
      }
      td.verify(publish(expectedMessage))
    })
  })
})
