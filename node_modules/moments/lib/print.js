const moment = require('moment')
const config = require('./config')
const logUpdate = require('log-update')

module.exports = function (argv) {
  config
    .get('timezones')
    .then(parseTimezones)
    .catch(err => console.log(err))

  function parseTimezones (ts) {
    if (!ts || ts.length === 0) {
      return console.log(`run ${'mm add'.cyan} to add timezone first`)
    }
    setInterval(() => {
      const result = ts.map(t => {
        return `[ ${t.value.gray + ' ('.gray + t.input.gray + ')'.gray} ]\n${moment().utcOffset(t.offset)}`
      }).join('\n\n')
      logUpdate(result)
    }, 1000)
  }
}
