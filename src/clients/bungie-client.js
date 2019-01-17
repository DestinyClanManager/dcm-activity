const rp = require('request-promise')

module.exports.getMembersOfClan = async clanId => {
  const request = {
    uri: `${process.env.BUNGIE_BASE_URL}/GroupV2/${clanId}/Members`,
    json: true,
    headers: {
      'X-API-Key': process.env.BUNGIE_API_KEY
    }
  }

  const response = await rp(request)
  return response.Response.results
}

module.exports.getMemberActivityProfile = async (membershipType, membershipId) => {
  const request = {
    uri: `${process.env.BUNGIE_BASE_URL}/Destiny2/${membershipType}/Profile/${membershipId}?components=100`,
    headers: {
      'X-API-Key': process.env.BUNGIE_API_KEY
    },
    json: true
  }

  const response = await rp(request)

  if (response.ErrorStatus !== 'Success') {
    throw new Error(response.ErrorStatus)
  }

  return response.Response.profile.data
}
