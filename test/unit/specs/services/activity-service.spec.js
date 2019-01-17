describe('activity service', () => {
  let subject, activityRepository, bungieClient, activityProfileFactory

  beforeEach(() => {
    activityRepository = td.replace('../../../../src/repositories/clan-activity-repository')
    bungieClient = td.replace('../../../../src/clients/bungie-client')
    activityProfileFactory = td.replace('../../../../src/factories/activity-profile-factory')
    subject = require('../../../../src/services/activity-service')
  })

  describe('cleanUpFormerMembers', () => {
    beforeEach(() => {
      const activityReport = [{ membershipId: 'member-1' }, { membershipId: 'member-2' }, { membershipId: 'member-3' }, { membershipId: 'member-4' }, { membershipId: 'member-5' }]
      td.when(activityRepository.findAllByClanId('clan-id')).thenResolve(activityReport)
    })

    describe('when there are former members', () => {
      beforeEach(async () => {
        const roster = [
          {
            destinyUserInfo: { membershipId: 'member-1' }
          },
          {
            destinyUserInfo: { membershipId: 'member-2' }
          },
          {
            destinyUserInfo: { membershipId: 'member-4' }
          },
          {
            destinyUserInfo: { membershipId: 'member-5' }
          }
        ]
        td.when(bungieClient.getMembersOfClan('clan-id')).thenResolve(roster)
        await subject.cleanUpFormerMembers('clan-id')
      })

      it('removes the members no longer in the clan', () => {
        td.verify(activityRepository.deleteByClanIdAndMembershipId('clan-id', 'member-3'))
      })
    })

    describe('when there are no former members', () => {
      beforeEach(async () => {
        const roster = [
          {
            destinyUserInfo: { membershipId: 'member-1' }
          },
          {
            destinyUserInfo: { membershipId: 'member-2' }
          },
          {
            destinyUserInfo: { membershipId: 'member-3' }
          },
          {
            destinyUserInfo: { membershipId: 'member-4' }
          },
          {
            destinyUserInfo: { membershipId: 'member-5' }
          }
        ]
        td.when(bungieClient.getMembersOfClan('clan-id')).thenResolve(roster)
        await subject.cleanUpFormerMembers('clan-id')
      })

      it('does not remove any members from the activity report', () => {
        const anything = td.matchers.anything
        td.verify(activityRepository.deleteByClanIdAndMembershipId(anything(), anything()), { times: 0 })
      })
    })
  })

  describe('updateMemberActivityProfile', () => {
    beforeEach(() => {})

    describe('when the bungie request fails', () => {
      let actual, error

      beforeEach(async () => {
        error = new Error('the error')
        td.when(bungieClient.getMemberActivityProfile('membership-type', 'membership-id')).thenReject(error)
        try {
          await subject.updateMemberActivityProfile('clan-id', 'membership-type', 'membership-id')
        } catch (e) {
          actual = e
        }
      })

      it('is throws the error', () => {
        expect(actual).toEqual(error)
      })
    })

    describe('when the bungie request is successful', () => {
      beforeEach(() => {
        td.when(bungieClient.getMemberActivityProfile('membership-type', 'membership-id')).thenResolve('member-profile')
      })

      describe(`when the member's profile is not created successfully`, () => {
        let actual, error

        beforeEach(async () => {
          error = new Error('the error')
          td.when(activityProfileFactory.build('member-profile')).thenThrow(error)
          try {
            await subject.updateMemberActivityProfile('clan-id', 'membership-type', 'membership-id')
          } catch (e) {
            actual = e
          }
        })

        it('throws the error', () => {
          expect(actual).toEqual(error)
        })
      })

      describe(`when the member's profile is created successfully`, () => {
        beforeEach(() => {
          td.when(activityProfileFactory.build('member-profile')).thenReturn('activity-profile')
        })

        describe('when the profile is not successfully saved', () => {
          let actual, error

          beforeEach(async () => {
            error = new Error('save error')
            td.when(activityRepository.save('clan-id', 'membership-id', 'activity-profile')).thenReject(error)
            try {
              await subject.updateMemberActivityProfile('clan-id', 'membership-type', 'membership-id')
            } catch (e) {
              actual = e
            }
          })

          it('throws the error', () => {
            expect(actual).toEqual(error)
          })
        })

        describe('when the profile is successfully saved', () => {
          beforeEach(async () => {
            const { anything } = td.matchers
            td.when(activityRepository.save(anything(), anything(), anything())).thenResolve()
            await subject.updateMemberActivityProfile('clan-id', 'membership-type', 'membership-id')
          })

          it('saves the activity profile', () => {
            td.verify(activityRepository.save('clan-id', 'membership-id', 'activity-profile'))
          })
        })
      })
    })
  })

  describe('getActivityProfilesForClan', () => {
    describe('when the database fails', () => {
      let actual, error

      beforeEach(async () => {
        error = new Error('database error')
        td.when(activityRepository.findAllByClanId('clan-id')).thenReject(error)
        try {
          await subject.getActivityProfilesForClan('clan-id')
        } catch (e) {
          actual = e
        }
      })

      it('throws the error', () => {
        expect(actual).toEqual(error)
      })
    })

    describe('when the database is successful', () => {
      let actual

      beforeEach(async () => {
        const clanActivityProfiles = [
          {
            profile: 'profile-1'
          },
          {
            profile: 'profile-2'
          },
          {
            profile: undefined
          },
          {
            profile: 'profile-3'
          }
        ]
        td.when(activityRepository.findAllByClanId('clan-id')).thenResolve(clanActivityProfiles)

        actual = await subject.getActivityProfilesForClan('clan-id')
      })

      it('returns results with a defined profile', () => {
        expect(actual.length).toEqual(3)
        expect(actual[0]).toEqual({ profile: 'profile-1' })
        expect(actual[1]).toEqual({ profile: 'profile-2' })
        expect(actual[2]).toEqual({ profile: 'profile-3' })
      })
    })
  })
})
