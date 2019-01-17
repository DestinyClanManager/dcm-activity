const clanActivityRepository = require('../repositories/clan-activity-repository')
const bungieClient = require('../clients/bungie-client')
const activityProfileFactory = require('../factories/activity-profile-factory')

async function removeMemberFromClanReport(clanId, membershipId) {
  return await clanActivityRepository.deleteByClanIdAndMembershipId(clanId, membershipId)
}

module.exports.cleanUpFormerMembers = async clanId => {
  const activityReport = await clanActivityRepository.findAllByClanId(clanId)
  const clanMembers = await bungieClient.getMembersOfClan(clanId)
  const roster = clanMembers.map(m => m.destinyUserInfo.membershipId)

  activityReport.forEach(async m => {
    if (!roster.includes(m.membershipId)) {
      await removeMemberFromClanReport(clanId, m.membershipId)
    }
  })
}

module.exports.updateMemberActivityProfile = async (clanId, membershipType, membershipId) => {
  const memberProfile = await bungieClient.getMemberActivityProfile(membershipType, membershipId)
  const activityProfile = activityProfileFactory.build(memberProfile)
  await clanActivityRepository.save(clanId, membershipId, activityProfile)
}

module.exports.getActivityProfilesForClan = async clanId => {
  const clanActivityProfiles = await clanActivityRepository.findAllByClanId(clanId)
  return clanActivityProfiles.filter(p => p.profile !== undefined)
}
