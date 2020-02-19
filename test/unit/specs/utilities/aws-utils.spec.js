describe('aws utils', () => {
  let subject

  beforeEach(() => {
    subject = require('../../../../src/utilities/aws-utils')
  })

  describe('getSnsMessage', () => {
    let actual

    describe('when the message is not JSON', () => {
      beforeEach(() => {
        const event = {
          Records: [
            {
              Sns: {
                Message: 'the-fist-sns-message'
              }
            },
            {
              Sns: {
                Message: 'the-second-sns-message'
              }
            }
          ]
        }
        actual = subject.getSnsMessage(event)
      })

      it('returns the first sns message it finds', () => {
        expect(actual).toEqual('the-fist-sns-message')
      })
    })

    describe('when the message is JSON', () => {
      beforeEach(() => {
        const event = {
          Records: [
            {
              Sns: {
                Message: '{"key": "the-first-sns-message"}'
              }
            },
            {
              Sns: {
                Message: 'the-second-sns-message'
              }
            }
          ]
        }
        actual = subject.getSnsMessage(event)
      })

      it('returns the first sns message it finds as an object', () => {
        expect(actual).toEqual({
          key: 'the-first-sns-message'
        })
      })
    })
  })

  describe('errorResponse', () => {
    let actual, error

    beforeEach(() => {
      error = new Error('the error')
      actual = subject.errorResponse(error)
    })

    it('returns an error response', () => {
      expect(actual).toEqual({
        statusCode: 500,
        body: JSON.stringify(error)
      })
    })
  })

  describe('okResponse', () => {
    let actual

    beforeEach(() => {
      actual = subject.okResponse({ foo: 'bar' })
    })

    it('returns an ok response', () => {
      expect(actual).toEqual({
        statusCode: 200,
        body: JSON.stringify({ foo: 'bar' })
      })
    })
  })

  describe('createdResponse', () => {
    let actual

    describe('when there is a body', () => {
      beforeEach(() => {
        actual = subject.createdResponse({ foo: 'bar' })
      })

      it('returns a created response', () => {
        expect(actual).toEqual({
          statusCode: 201,
          body: JSON.stringify({ foo: 'bar' })
        })
      })
    })

    describe('when there is not an body', () => {
      beforeEach(() => {
        actual = subject.createdResponse()
      })

      it('returns a created response without a body', () => {
        expect(actual).toEqual({ statusCode: 201 })
      })
    })
  })
})
