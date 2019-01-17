global.td = require('testdouble')
require('testdouble-jest')(td, jest) // eslint-disable-line

td.config({
  ignoreWarnings: true
})

afterEach(function() {
  td.reset() // eslint-disable-line
})
