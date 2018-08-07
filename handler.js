const AWS = require('aws-sdk')
const rp = require('request-promise')
const sns = new AWS.SNS()
const dynamoDb = new AWS.DynamoDB.DocumentClient()

function getSnsMessage(event) {
  return event.Records[0].Sns.Message
}

function createProfile(bungieResponse) {
  const profile = {
    membershipId: bungieResponse.Response.profile.data.userInfo.membershipId,
    gamertag: bungieResponse.Response.profile.data.userInfo.displayName,
    dateLastPlayed: bungieResponse.Response.profile.data.dateLastPlayed,
    expansions: createExpansionsArray(bungieResponse.Response.profile.data.versionsOwned),
    characterIds: bungieResponse.Response.profile.data.characterIds
  }

  profile.daysSinceLastPlayed = numberOfDaysBetween(new Date(), new Date(profile.dateLastPlayed))

  profile.isInactive = profile.daysSinceLastPlayed >= 30

  return profile
}

function createExpansionsArray(versionsOwnedEnum) {
  const expansionsMap = {
    1: 'Destiny 2',
    2: 'Curse of Osiris',
    3: 'Warmind',
    4: 'Forsaken',
    5: 'Black Armory',
    6: `Joker's Wild`,
    7: 'Penumbra'
  }

  const expansions = []

  for (let i = 1; i <= versionsOwnedEnum; i++) {
    if (expansionsMap[i]) {
      expansions.push(expansionsMap[i])
    }
  }

  return expansions
}

function numberOfDaysBetween(d1, d2) {
  var diff = Math.abs(d1.getTime() - d2.getTime())
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

module.exports.getRegisteredClans = async (_, context) => {
  const query = {
    TableName: process.env.REGISTRY_TABLE
  }

  let data

  try {
    data = await dynamoDb.scan(query).promise()
  } catch (error) {
    console.error(error)
    context.fail(error)
  }

  for (let item of data.Items) {
    const message = {
      Message: item.id,
      TopicArn: process.env.REGISTERED_CLAN_TOPIC
    }

    try {
      await sns.publish(message).promise()
    } catch (error) {
      console.log(error)
      context.fail(error)
    }
  }

  context.succeed()
}

module.exports.cleanUp = async (event, context) => {
  const clanId = getSnsMessage(event)
  const query = {
    TableName: process.env.ACTIVITY_TABLE,
    KeyConditionExpression: 'clanId = :c',
    ExpressionAttributeValues: {
      ':c': clanId
    }
  }

  let data

  try {
    data = await dynamoDb.query(query).promise()
  } catch (error) {
    console.error(error)
    context.fail(error)
  }

  const activityReport = data.Items

  const request = {
    uri: `${process.env.BUNGIE_BASE_URL}/GroupV2/${clanId}/Members/`,
    headers: {
      'X-API-Key': process.env.BUNGIE_API_KEY
    },
    json: true
  }

  let response

  try {
    response = await rp(request)
  } catch (error) {
    console.error(error)
    context.fail(error)
  }

  const roster = response.Response.results.map(result => {
    return {
      membershipId: result.destinyUserInfo.membershipId,
      membershipType: result.destinyUserInfo.membershipType,
      clanId
    }
  })

  const membersToRemove = []

  activityReport.forEach(member => {
    if (roster.find(m => m.membershipId === member.membershipId) === undefined) {
      membersToRemove.push(member.membershipId)
    }
  })

  for (let membershipId of membersToRemove) {
    const deleteQuery = {
      TableName: process.env.ACTIVITY_TABLE,
      Key: {
        clanId,
        membershipId
      }
    }

    console.log('removing member', membershipId, 'from clan', clanId)

    try {
      await dynamoDb.delete(deleteQuery).promise()
    } catch (error) {
      console.error(error)
      context.fail(error)
    }
  }

  context.succeed()
}

module.exports.getClanRoster = async (event, context) => {
  const clanId = getSnsMessage(event)
  const request = {
    uri: `${process.env.BUNGIE_BASE_URL}/GroupV2/${clanId}/Members/`,
    headers: {
      'X-API-Key': process.env.BUNGIE_API_KEY
    },
    json: true
  }

  let response

  try {
    response = await rp(request)
  } catch (error) {
    console.error(error)
    context.fail(error)
  }

  const roster = response.Response.results.map(result => {
    return {
      membershipId: result.destinyUserInfo.membershipId,
      membershipType: result.destinyUserInfo.membershipType,
      clanId
    }
  })

  for (let member of roster) {
    const message = {
      Message: JSON.stringify(member),
      TopicArn: process.env.CLAN_MEMBER_TOPIC
    }

    console.log('fetch profile for member', message)

    try {
      await sns.publish(message).promise()
    } catch (error) {
      console.error(error)
      context.fail(error)
    }
  }

  context.succeed()
}

module.exports.getMemberActivityProfile = async (event, context) => {
  const message = JSON.parse(getSnsMessage(event))

  const request = {
    uri: `${process.env.BUNGIE_BASE_URL}/Destiny2/${message.membershipType}/Profile/${message.membershipId}?components=100`,
    headers: {
      'X-API-Key': process.env.BUNGIE_API_KEY
    },
    json: true
  }

  let response

  try {
    response = await rp(request)
  } catch (error) {
    console.error(error)
    context.fail(error)
  }

  if (response.ErrorStatus === 'DestinyAccountNotFound') {
    context.fail('Member account not found')
  }

  let profile

  try {
    profile = createProfile(response)
  } catch (error) {
    console.log('Error creating profile for member', message.membershipId)
    console.error(error)
    context.fail(error)
  }

  const query = {
    TableName: process.env.ACTIVITY_TABLE,
    Item: {
      clanId: message.clanId,
      membershipId: message.membershipId,
      profile
    }
  }

  console.log('fetched profile for', message.membershipId)
  console.log('---> profile', profile)

  try {
    await dynamoDb.put(query).promise()
  } catch (error) {
    console.error(error)
    context.fail(error)
  }

  context.succeed()
}

module.exports.getInactiveMembers = async (event, context, callback) => {
  const clanId = event.pathParameters.clanId

  const query = {
    TableName: process.env.ACTIVITY_TABLE,
    KeyConditionExpression: 'clanId = :c',
    ExpressionAttributeValues: {
      ':c': clanId
    }
  }

  let data

  try {
    data = await dynamoDb.query(query).promise()
  } catch (error) {
    callback(error, {
      statusCode: 500
    })
  }

  const filteredResults = data.Items.filter(i => i.profile !== undefined)

  const response = {
    statusCode: 200,
    body: JSON.stringify(filteredResults)
  }

  callback(null, response)
}

module.exports.startActivityReport = async (event, context, callback) => {
  const { clanId } = JSON.parse(event.body)

  const message = {
    Message: clanId,
    TopicArn: process.env.REGISTERED_CLAN_TOPIC
  }

  console.log('starting report for', clanId)

  try {
    await sns.publish(message).promise()
  } catch (error) {
    console.log(error)
    callback(error, {
      statusCode: 500
    })
  }

  callback(null, { statusCode: 202 })
}
