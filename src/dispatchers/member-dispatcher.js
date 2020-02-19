const dispatchProvider = require('../providers/dispatch-provider')
const dispatch = dispatchProvider.getInstance()

module.exports.publishClanMember = async member => {
  const message = {
    TopicArn: process.env.CLAN_MEMBER_TOPIC,
    Message: JSON.stringify(member)
  }

  return await dispatch.publish(message).promise()
}
