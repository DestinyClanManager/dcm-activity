module.exports.now = () => new Date()
module.exports.from = dateString => new Date(dateString)

module.exports.numberOfDaysBetween = (date1, date2) => {
  var diff = Math.abs(date1.getTime() - date2.getTime())
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}
