const dispatchProvider = require('../providers/dispatch-provider')

module.exports.publishGarbageCollector = async clanId => {
  const dispatch = dispatchProvider.getInstance()
  const message = {
    Message: clanId,
    TopicArn: process.env.GARBAGE_COLLECTION_TOPIC
  }

  return await dispatch.publish(message).promise()
}
