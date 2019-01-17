const databaseProvider = require('../providers/database-provider')

module.exports.findAllByClanId = async clanId => {
  const db = databaseProvider.getInstance()
  const query = {
    TableName: process.env.ACTIVITY_TABLE,
    KeyConditionExpression: 'clanId = :c',
    ExpressionAttributeValues: {
      ':c': clanId
    }
  }

  const result = await db.query(query).promise()

  return result.Items
}

module.exports.deleteByClanIdAndMembershipId = async (clanId, membershipId) => {
  const db = databaseProvider.getInstance()
  const query = {
    TableName: process.env.ACTIVITY_TABLE,
    Key: {
      clanId,
      membershipId
    }
  }

  return await db.delete(query).promise()
}

module.exports.save = async (clanId, membershipId, activityProfile) => {
  const db = databaseProvider.getInstance()
  const query = {
    TableName: process.env.ACTIVITY_TABLE,
    Item: {
      clanId,
      membershipId,
      profile: activityProfile
    }
  }

  return await db.put(query).promise()
}
