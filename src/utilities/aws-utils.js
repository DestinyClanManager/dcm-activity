module.exports.getSnsMessage = event => {
  let message

  try {
    message = event.Records[0].Sns.Message
  } catch (error) {
    console.error(error)
  }

  return message
}

module.exports.errorResponse = error => ({
  statusCode: 500,
  body: JSON.stringify(error)
})

module.exports.okResponse = body => ({
  statusCode: 200,
  body: JSON.stringify(body)
})

module.exports.createdResponse = body => {
  const response = {
    statusCode: 201
  }

  if (body) {
    response.body = JSON.stringify(body)
  }

  return response
}
