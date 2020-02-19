module.exports.getSnsMessage = event => {
  try {
    const message = event.Records[0].Sns.Message
    try {
      const parsed = JSON.parse(message)
      return parsed
    } catch (e) {
      return message
    }
  } catch (error) {
    console.error(error)
    throw error
  }
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
