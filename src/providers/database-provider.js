const AWS = require('aws-sdk')

module.exports.getInstance = function() {
  return new AWS.DynamoDB.DocumentClient()
}
