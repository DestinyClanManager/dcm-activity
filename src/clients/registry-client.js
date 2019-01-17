const rp = require('request-promise')

module.exports.getRegisteredClans = async function() {
  const request = {
    uri: process.env.REGISTRY_BASE_URL,
    json: true
  }

  return await rp(request)
}
