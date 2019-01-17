const registryClient = require('./clients/registry-client')
const registryDispatcher = require('./dispatchers/registry-dispatcher')
const activityService = require('./services/activity-service')
const rosterService = require('./services/roster-service')
const garbageDispatcher = require('./dispatchers/garbage-dispatcher')
const { getSnsMessage, errorResponse, okResponse, createdResponse } = require('./utilities/aws-utils')

module.exports.getRegisteredClans = async (_event, context) => {
  let registeredClans
  try {
    registeredClans = await registryClient.getRegisteredClans()
  } catch (error) {
    context.fail(error)
    return
  }

  for (let clanId of registeredClans) {
    try {
      await registryDispatcher.publishRegisteredClan(clanId)
    } catch (error) {
      context.fail(error)
      return
    }
  }

  context.succeed()
}

module.exports.cleanUp = async (event, context) => {
  const clanId = getSnsMessage(event)

  try {
    await activityService.cleanUpFormerMembers(clanId)
  } catch (error) {
    context.fail(error)
    return
  }

  context.succeed()
}

module.exports.getClanRoster = async (event, context) => {
  const clanId = getSnsMessage(event)

  try {
    await rosterService.getClanRoster(clanId)
  } catch (error) {
    context.fail(error)
    return
  }

  context.succeed()
}

module.exports.getMemberActivityProfile = async (event, context) => {
  const { clanId, membershipType, membershipId } = getSnsMessage(event)

  try {
    await activityService.updateMemberActivityProfile(clanId, membershipType, membershipId)
  } catch (error) {
    context.fail(error)
    return
  }

  context.succeed()
}

module.exports.getInactiveMembers = async (event, _context, callback) => {
  const { clanId } = event.pathParameters
  let clanActivityProfiles

  try {
    clanActivityProfiles = await activityService.getActivityProfilesForClan(clanId)
  } catch (error) {
    console.error(error)
    callback(error, errorResponse(error))
    return
  }

  callback(null, okResponse(clanActivityProfiles))
}

module.exports.startActivityReport = async (event, _context, callback) => {
  const { clanId } = JSON.parse(event.body)

  try {
    await registryDispatcher.publishRegisteredClan(clanId)
  } catch (error) {
    console.error(error)
    callback(error, errorResponse(error))
    return
  }

  callback(null, createdResponse())
}

module.exports.startGarbageCollection = async (event, _context, callback) => {
  const { clanId } = event.pathParameters

  try {
    await garbageDispatcher.publishGarbageCollector(clanId)
  } catch (error) {
    console.error(error)
    callback(error, errorResponse(error))
    return
  }

  callback(null, createdResponse())
}
