const config = require('./config')
const inq = require('inquirer')

module.exports = function (argv) {
  config
    .get('timezones')
    .then(removeTimezone)
    .catch(err => console.log(err))

  function removeTimezone (ts) {
    const q = [
      {
        type: 'list',
        choices: ts.map(t => `${t.value} (${t.input})`),
        name: 'choice',
        message: 'Choose a timezone to remove:'
      }
    ]
    inq.prompt(q, a => {
      const re = /([a-zA-Z0-9 ])+/i
      const name = a.choice.match(re)[0].trim()
      if (!name) {
        return console.log('nothing matches'.red)
      }
      removeTimezoneByName(ts, name)
    })
  }

  function removeTimezoneByName (ts, name) {
    ts = ts.filter(t => {
      return t.value !== name
    })
    config
      .set('timezones', ts)
      .then(ts => {
        console.log(`You've removed ${name}!`.green)
      })
  }
}
