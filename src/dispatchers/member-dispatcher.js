const dispatchProvider = require('../providers/dispatch-provider')

module.exports.publishClanMember = async member => {
  const dispatch = dispatchProvider.getInstance()
  const message = {
    TopicArn: process.env.CLAN_MEMBER_TOPIC,
    Message: JSON.stringify(member)
  }

  return await dispatch.publish(message).promise()
}
