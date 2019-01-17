const nock = require('nock')

describe('bungie client', () => {
  let subject, mockHttp

  beforeEach(() => {
    mockHttp = nock('http://bungie-url', {
      reqheaders: { 'X-API-Key': 'bungie-api-key' }
    })
    subject = require('../../../../src/clients/bungie-client')
  })

  describe('getMembersOfClan', () => {
    let actual

    beforeEach(async () => {
      const response = {
        Response: {
          results: 'the-members'
        }
      }
      mockHttp.get('/GroupV2/clan-id/Members').reply(200, response)
      actual = await subject.getMembersOfClan('clan-id')
    })

    it('returns the members of the given clan', () => {
      expect(actual).toEqual('the-members')
    })
  })

  describe('getMemberActivityProfile', () => {
    let actual

    describe('when there is no error', () => {
      beforeEach(async () => {
        const response = {
          Response: { profile: { data: 'the-member-activity' } },
          ErrorStatus: 'Success'
        }
        mockHttp.get('/Destiny2/membership-type/Profile/membership-id?components=100').reply(200, response)
        actual = await subject.getMemberActivityProfile('membership-type', 'membership-id')
      })

      it('returns the activity profile', () => {
        expect(actual).toEqual('the-member-activity')
      })
    })

    describe('when there is an error', () => {
      beforeEach(async () => {
        const response = {
          ErrorStatus: 'NotSuccess'
        }
        mockHttp.get('/Destiny2/membership-type/Profile/membership-id?components=100').reply(200, response)
        try {
          await subject.getMemberActivityProfile('membership-type', 'membership-id')
        } catch (error) {
          actual = error
        }
      })

      it('throws the an error', () => {
        expect(actual.message).toEqual('NotSuccess')
      })
    })
  })
})
