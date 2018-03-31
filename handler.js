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
  const expansions = []

  switch (versionsOwnedEnum) {
    case 1:
      expansions.push('Destiny 2')
      break
    case 2:
      expansions.push('Destiny 2')
      expansions.push('Curse of Osiris')
      break
    case 3:
      expansions.push('Destiny 2')
      expansions.push('Curse of Osiris')
      expansions.push('DLC2')
      break
  }

  return expansions
}

function numberOfDaysBetween(d1, d2) {
  var diff = Math.abs(d1.getTime() - d2.getTime())
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

module.exports.getRegisteredClans = (event, context) => {
  const query = {
    TableName: process.env.REGISTRY_TABLE
  }

  dynamoDb.scan(query, (error, data) => {
    if (error) {
      console.error(error)
      return
    }

    data.Items.forEach(item => {
      const message = {
        Message: item.id,
        TopicArn: process.env.REGISTERED_CLAN_TOPIC
      }

      sns.publish(message, context.done)
    })
  })
}

module.exports.getClanRoster = (event, context) => {
  const clanId = getSnsMessage(event)
  const request = {
    uri: `${process.env.BUNGIE_BASE_URL}/GroupV2/${clanId}/Members/`,
    headers: {
      'X-API-Key': process.env.BUNGIE_API_KEY
    },
    json: true
  }

  rp(request)
    .then(response => {
      const roster = response.Response.results.map(result => {
        return {
          membershipId: result.destinyUserInfo.membershipId,
          membershipType: result.destinyUserInfo.membershipType,
          clanId
        }
      })

      roster.forEach(member => {
        const message = {
          Message: JSON.stringify(member),
          TopicArn: process.env.CLAN_MEMBER_TOPIC
        }

        sns.publish(message, context.done)
      })
    })
    .catch(error => {
      console.error(error)
      context.done()
    })
}

module.exports.getMemberActivityProfile = (event, context) => {
  const message = JSON.parse(getSnsMessage(event))

  const request = {
    uri: `${process.env.BUNGIE_BASE_URL}/Destiny2/${message.membershipType}/Profile/${message.membershipId}?components=100`,
    headers: {
      'X-API-Key': process.env.BUNGIE_API_KEY
    },
    json: true
  }

  rp(request)
    .then(response => {
      if (response.ErrorStatus === 'DestinyAccountNotFound') {
        return
      }

      const profile = createProfile(response)
      const query = {
        TableName: process.env.ACTIVITY_TABLE,
        Item: {
          clanId: message.clanId,
          membershipId: message.membershipId,
          profile
        }
      }

      dynamoDb.put(query, context.done)
    })
    .catch(error => {
      console.error(error)
      context.done()
    })
}

module.exports.getInactiveMembers = (event, context, callback) => {
  const clanId = event.pathParameters.clanId

  const query = {
    TableName: process.env.ACTIVITY_TABLE,
    KeyConditionExpression: 'clanId = :c',
    ExpressionAttributeValues: {
      ':c': clanId
    }
  }

  dynamoDb.query(query, (error, data) => {
    if (error) {
      callback(error, {
        statusCode: 500
      })
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(data.Items)
    }

    callback(null, response)
  })
}
