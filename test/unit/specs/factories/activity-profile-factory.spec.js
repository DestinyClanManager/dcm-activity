describe('activity profile factory', () => {
  let subject, dateUtils

  beforeEach(() => {
    dateUtils = td.replace('../../../../src/utilities/date-utils')
    subject = require('../../../../src/factories/activity-profile-factory')
  })

  describe('build', () => {
    let actual

    beforeEach(() => {
      const memberProfile = {
        userInfo: {
          membershipId: 'membership-id',
          displayName: 'gamertag'
        },
        dateLastPlayed: 'date-last-played',
        characterIds: 'character-ids'
      }

      td.when(dateUtils.now()).thenReturn('current-datetime')
      td.when(dateUtils.from('date-last-played')).thenReturn('last-played-datetime')
      td.when(dateUtils.numberOfDaysBetween('current-datetime', 'last-played-datetime')).thenReturn(14)

      actual = subject.build(memberProfile)
    })

    it('returns a member activity profile object', () => {
      expect(actual).toEqual({
        membershipId: 'membership-id',
        gamertag: 'gamertag',
        dateLastPlayed: 'date-last-played',
        characterIds: 'character-ids',
        daysSinceLastPlayed: 14,
        isInactive: false
      })
    })
  })
})
