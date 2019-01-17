const dateUtils = require('../utilities/date-utils')

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

module.exports.build = memberProfile => {
  const profile = {
    membershipId: memberProfile.userInfo.membershipId,
    gamertag: memberProfile.userInfo.displayName,
    dateLastPlayed: memberProfile.dateLastPlayed,
    expansions: createExpansionsArray(memberProfile.versionsOwned),
    characterIds: memberProfile.characterIds
  }

  profile.daysSinceLastPlayed = dateUtils.numberOfDaysBetween(dateUtils.now(), dateUtils.from(profile.dateLastPlayed))
  profile.isInactive = profile.daysSinceLastPlayed >= 30

  return profile
}
