describe('handler', () => {
  let subject, registryClient, registryDispatcher, activityService, rosterService, garbageDispatcher

  beforeEach(() => {
    registryClient = td.replace('../../../src/clients/registry-client')
    registryDispatcher = td.replace('../../../src/dispatchers/registry-dispatcher')
    activityService = td.replace('../../../src/services/activity-service')
    rosterService = td.replace('../../../src/services/roster-service')
    garbageDispatcher = td.replace('../../../src/dispatchers/garbage-dispatcher')
    subject = require('../../../src/handler')
  })

  describe('getRegisteredClans', () => {
    let context

    beforeEach(() => {
      context = {
        succeed: td.function(),
        fail: td.function()
      }
      td.when(registryClient.getRegisteredClans()).thenResolve(['clan-1', 'clan-2', 'clan-3'])
    })

    describe('when everything goes well', () => {
      beforeEach(async () => {
        await subject.getRegisteredClans(null, context)
      })

      it('publishes a message for each registered clan', () => {
        td.verify(registryDispatcher.publishRegisteredClan('clan-1'))
        td.verify(registryDispatcher.publishRegisteredClan('clan-2'))
        td.verify(registryDispatcher.publishRegisteredClan('clan-3'))
      })

      it('succeeds', () => {
        td.verify(context.succeed())
      })
    })

    describe('when an error occurs', () => {
      let error

      describe('in the registryClient', () => {
        beforeEach(async () => {
          error = new Error('registry client error')
          td.when(registryClient.getRegisteredClans()).thenReject(error)

          await subject.getRegisteredClans(null, context)
        })

        it('fails with the registry client error', () => {
          td.verify(context.fail(error))
        })
      })

      describe('in the registry dispatcher', () => {
        beforeEach(async () => {
          error = new Error('the-failure')

          td.when(registryDispatcher.publishRegisteredClan('clan-1')).thenResolve()
          td.when(registryDispatcher.publishRegisteredClan('clan-3')).thenResolve()
          td.when(registryDispatcher.publishRegisteredClan('clan-2')).thenReject(error)

          await subject.getRegisteredClans(null, context)
        })

        it('fails with the error that caused the failure', () => {
          td.verify(context.fail(error))
        })
      })
    })
  })

  describe('cleanUp', () => {
    let context, event

    beforeEach(() => {
      context = {
        succeed: td.function(),
        fail: td.function()
      }
      event = {
        Records: [
          {
            Sns: {
              Message: 'clan-id'
            }
          }
        ]
      }
    })

    describe('when everything goes well', () => {
      beforeEach(async () => {
        await subject.cleanUp(event, context)
      })

      it('removes any former clan members', () => {
        td.verify(activityService.cleanUpFormerMembers('clan-id'))
      })

      it('succeeds', () => {
        td.verify(context.succeed())
      })
    })

    describe('when something goes wrong', () => {
      let error

      beforeEach(async () => {
        error = new Error('the error')
        td.when(activityService.cleanUpFormerMembers('clan-id')).thenReject(error)
        await subject.cleanUp(event, context)
      })

      it('fails with the error', () => {
        td.verify(context.fail(error))
      })
    })
  })

  describe('getClanRoster', () => {
    let context, event

    beforeEach(() => {
      context = {
        succeed: td.function(),
        fail: td.function()
      }
      event = {
        Records: [
          {
            Sns: {
              Message: 'clan-id'
            }
          }
        ]
      }
    })

    describe('when everything goes right', () => {
      beforeEach(async () => {
        await subject.getClanRoster(event, context)
      })

      it('processes the clan roster', () => {
        td.verify(rosterService.getClanRoster('clan-id'))
      })

      it('succeeds', () => {
        td.verify(context.succeed())
      })
    })

    describe('when something goes wrong', () => {
      let error

      beforeEach(async () => {
        error = new Error('the error')
        td.when(rosterService.getClanRoster('clan-id')).thenReject(error)
        await subject.getClanRoster(event, context)
      })

      it('fails with the error', () => {
        td.verify(context.fail(error))
      })
    })
  })

  describe('getMemberActivityProfile', () => {
    let event, context

    beforeEach(() => {
      context = {
        succeed: td.function(),
        fail: td.function()
      }
      event = {
        Records: [
          {
            Sns: {
              Message: {
                clanId: 'clan-id',
                membershipId: 'membership-id',
                membershipType: 'membership-type'
              }
            }
          }
        ]
      }
    })

    describe('when everything goes right', () => {
      beforeEach(async () => {
        td.when(activityService.updateMemberActivityProfile('clan-id', 'membership-type', 'membership-id')).thenResolve()
        await subject.getMemberActivityProfile(event, context)
      })

      it('succeeds', () => {
        td.verify(context.succeed())
      })
    })

    describe('when something goes wrong', () => {
      let error

      beforeEach(async () => {
        error = new Error('oh no!')
        td.when(activityService.updateMemberActivityProfile('clan-id', 'membership-type', 'membership-id')).thenReject(error)

        await subject.getMemberActivityProfile(event, context)
      })

      it('fails with the error', () => {
        td.verify(context.fail(error))
      })
    })
  })

  describe('getInactiveMembers', () => {
    let event, callback

    beforeEach(() => {
      event = {
        pathParameters: { clanId: 'clan-id' }
      }
      callback = td.func()
    })

    describe('when an error occurs', () => {
      let error

      beforeEach(async () => {
        error = new Error('the error')
        td.when(activityService.getActivityProfilesForClan('clan-id')).thenReject(error)

        await subject.getInactiveMembers(event, null, callback)
      })

      it('sends an error response', () => {
        const expectedResponse = {
          statusCode: 500,
          body: JSON.stringify(error)
        }
        td.verify(callback(error, expectedResponse))
      })
    })

    describe('when everything goes right', () => {
      beforeEach(async () => {
        td.when(activityService.getActivityProfilesForClan('clan-id')).thenResolve([])

        await subject.getInactiveMembers(event, null, callback)
      })

      it('responds with the clan profiles', () => {
        const expectedResponse = {
          statusCode: 200,
          body: '[]'
        }
        td.verify(callback(null, expectedResponse))
      })
    })
  })

  describe('startActivityReport', () => {
    let event, callback

    beforeEach(() => {
      event = {
        body: JSON.stringify({ clanId: 'clan-id' })
      }
      callback = td.func()
    })

    describe('when there is an error', () => {
      let error

      beforeEach(async () => {
        error = new Error('the error')
        td.when(registryDispatcher.publishRegisteredClan('clan-id')).thenReject(error)

        await subject.startActivityReport(event, null, callback)
      })

      it('sends a created response', () => {
        const expectedResponse = {
          statusCode: 500,
          body: JSON.stringify(error)
        }
        td.verify(callback(error, expectedResponse))
      })
    })

    describe('when everything is successful', () => {
      beforeEach(async () => {
        td.when(registryDispatcher.publishRegisteredClan('clan-id')).thenResolve()

        await subject.startActivityReport(event, null, callback)
      })

      it('sends a created response', () => {
        const expectedResponse = {
          statusCode: 201
        }
        td.verify(callback(null, expectedResponse))
      })
    })
  })

  describe('startGarbageCollection', () => {
    let event, callback

    beforeEach(() => {
      event = {
        pathParameters: { clanId: 'clan-id' }
      }
      callback = td.func()
    })

    describe('when there is an error', () => {
      let error

      beforeEach(async () => {
        error = new Error('the error')
        td.when(garbageDispatcher.publishGarbageCollector('clan-id')).thenReject(error)

        await subject.startGarbageCollection(event, null, callback)
      })

      it('sends an error response', () => {
        const expectedRespnse = {
          statusCode: 500,
          body: JSON.stringify(error)
        }
        td.verify(callback(error, expectedRespnse))
      })
    })

    describe('when everything is ok', () => {
      beforeEach(async () => {
        td.when(garbageDispatcher.publishGarbageCollector('clan-id')).thenResolve()
        await subject.startGarbageCollection(event, null, callback)
      })

      it('sends a created response', () => {
        const expectedResponse = {
          statusCode: 201
        }
        td.verify(callback(null, expectedResponse))
      })
    })
  })
})
