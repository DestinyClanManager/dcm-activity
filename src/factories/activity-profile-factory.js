const dateUtils = require('../utilities/date-utils')

module.exports.build = memberProfile => {
  const profile = {
    membershipId: memberProfile.userInfo.membershipId,
    gamertag: memberProfile.userInfo.displayName,
    dateLastPlayed: memberProfile.dateLastPlayed,
    characterIds: memberProfile.characterIds
  }

  profile.daysSinceLastPlayed = dateUtils.numberOfDaysBetween(dateUtils.now(), dateUtils.from(profile.dateLastPlayed))
  profile.isInactive = profile.daysSinceLastPlayed >= 30

  return profile
}
