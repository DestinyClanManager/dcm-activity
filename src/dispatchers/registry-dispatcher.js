const dispatchProvider = require('../providers/dispatch-provider')

module.exports.publishRegisteredClan = async clanId => {
  const dispatch = dispatchProvider.getInstance()
  const message = {
    Message: clanId,
    TopicArn: process.env.REGISTERED_CLAN_TOPIC
  }

  return await dispatch.publish(message).promise()
}
