const AWS = require('aws-sdk')
const dynamoDB = AWS.DynamoDB.DocumentClient

describe('database-provider', () => {
  let subject, actual

  beforeEach(() => {
    subject = require('../../../../src/providers/database-provider')
    actual = subject.getInstance()
  })

  it('returns an AWS DyanmoDB instance', () => {
    expect(actual).toBeInstanceOf(dynamoDB)
  })
})
