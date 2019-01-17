describe('roster service', () => {
  let subject, bungieClient, memberDispatcher

  beforeEach(() => {
    bungieClient = td.replace('../../../../src/clients/bungie-client')
    memberDispatcher = td.replace('../../../../src/dispatchers/member-dispatcher')
    subject = require('../../../../src/services/roster-service')
  })

  describe('getClanRoster', () => {
    beforeEach(async () => {
      const roster = [
        {
          destinyUserInfo: {
            membershipId: 'member-1',
            membershipType: 'membership-type'
          }
        },
        {
          destinyUserInfo: {
            membershipId: 'member-2',
            membershipType: 'membership-type'
          }
        }
      ]
      td.when(bungieClient.getMembersOfClan('clan-id')).thenResolve(roster)
      await subject.getClanRoster('clan-id')
    })

    it('publishes a message for each member in the clan', () => {
      const expectedMember1 = {
        membershipId: 'member-1',
        membershipType: 'membership-type',
        clanId: 'clan-id'
      }
      const expectedMember2 = {
        membershipId: 'member-2',
        membershipType: 'membership-type',
        clanId: 'clan-id'
      }
      td.verify(memberDispatcher.publishClanMember(expectedMember1))
      td.verify(memberDispatcher.publishClanMember(expectedMember2))
    })
  })
})
