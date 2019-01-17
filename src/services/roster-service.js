const bungieClient = require('../clients/bungie-client')
const memberDispatcher = require('../dispatchers/member-dispatcher')

module.exports.getClanRoster = async clanId => {
  const members = await bungieClient.getMembersOfClan(clanId)

  members.forEach(async member => {
    const membership = {
      membershipId: member.destinyUserInfo.membershipId,
      membershipType: member.destinyUserInfo.membershipType,
      clanId
    }
    await memberDispatcher.publishClanMember(membership)
  })
}
