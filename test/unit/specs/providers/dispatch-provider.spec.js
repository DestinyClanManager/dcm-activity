const AWS = require('aws-sdk')
const SNS = AWS.SNS

describe('dispatch provider', () => {
  let subject

  beforeEach(() => {
    subject = require('../../../../src/providers/dispatch-provider')
  })

  describe('getInstance', () => {
    let actual

    beforeEach(() => {
      actual = subject.getInstance()
    })

    it('returns a SNS instance', () => {
      expect(actual).toBeInstanceOf(SNS)
    })
  })
})
