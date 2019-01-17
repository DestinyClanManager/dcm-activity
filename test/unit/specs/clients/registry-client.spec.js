const nock = require('nock')

describe('registry client', () => {
  let subject, mockHttp

  beforeEach(() => {
    mockHttp = nock('http://registry-url')
    subject = require('../../../../src/clients/registry-client')
  })

  describe('getRegisteredClans', () => {
    let actual

    beforeEach(async () => {
      mockHttp.get('/').reply(200, 'the-registered-clans')
      actual = await subject.getRegisteredClans()
    })

    it('returns the registered clans', () => {
      expect(actual).toEqual('the-registered-clans')
    })
  })
})
