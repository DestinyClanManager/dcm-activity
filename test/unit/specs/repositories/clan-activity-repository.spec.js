describe('clan activity repository', () => {
  let subject, dbProvider

  beforeEach(() => {
    dbProvider = td.replace('../../../../src/providers/database-provider')
    subject = require('../../../../src/repositories/clan-activity-repository')
  })

  describe('findAllByClanId', () => {
    let actual

    beforeEach(async () => {
      const expectedQuery = {
        TableName: 'dcm-activity',
        KeyConditionExpression: 'clanId = :c',
        ExpressionAttributeValues: {
          ':c': 'clan-id'
        }
      }
      const query = td.function()
      const promise = td.function()
      const clanActivity = [{ membershipId: 'member-1' }, { membershipId: 'member-2' }]

      td.when(query(expectedQuery)).thenReturn({ promise })
      td.when(promise()).thenResolve({ Items: clanActivity })
      td.when(dbProvider.getInstance()).thenReturn({ query })

      actual = await subject.findAllByClanId('clan-id')
    })

    it('returns the clan activity', () => {
      expect(actual).toEqual([{ membershipId: 'member-1' }, { membershipId: 'member-2' }])
    })
  })

  describe('deleteByClanIdAndMembershipId', () => {
    let del

    beforeEach(async () => {
      del = td.function()
      const promise = td.function()

      td.when(del(td.matchers.anything())).thenReturn({ promise })
      td.when(promise()).thenResolve()
      td.when(dbProvider.getInstance()).thenReturn({ delete: del })

      await subject.deleteByClanIdAndMembershipId('clan-id', 'membership-id')
    })

    it('deletes the row', () => {
      const expectedQuery = {
        TableName: 'dcm-activity',
        Key: {
          clanId: 'clan-id',
          membershipId: 'membership-id'
        }
      }
      td.verify(del(expectedQuery))
    })
  })

  describe('save', () => {
    let put

    beforeEach(async () => {
      put = td.function()
      const promise = td.function()

      td.when(put(td.matchers.anything())).thenReturn({ promise })
      td.when(promise()).thenResolve()
      td.when(dbProvider.getInstance()).thenReturn({ put })

      await subject.save('clan-id', 'membership-id', 'activity-profile')
    })

    it('saves the member activity profile', () => {
      const expectedQuery = {
        TableName: 'dcm-activity',
        Item: {
          clanId: 'clan-id',
          membershipId: 'membership-id',
          profile: 'activity-profile'
        }
      }
      td.verify(put(expectedQuery))
    })
  })
})
