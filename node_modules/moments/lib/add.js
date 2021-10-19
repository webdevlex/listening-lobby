const inq = require('inquirer')
const timezones = require('./timezones')
const Fuse = require('fuse.js')
const config = require('./config')

var keyword
module.exports = function (argv) {
  const q = [
    {
      type: 'input',
      message: 'type a keyword of City or Country name to add it (eg: london):',
      name: 'keyword',
      validate (val) {
        return !!val
      }
    }
  ]
  const options = {
    /* default options
    caseSensitive: false,
    includeScore: false,
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    */
    keys: ['value', 'text']
  }

  if (argv._[1]) {
    keyword = argv._[1]
    search(keyword, options)
  } else {
    inq.prompt(q, a => {
      keyword = a.keyword
      search(keyword, options)
    })
  }

  function search (key, options) {
    const fuse = new Fuse(timezones, options)
    const matches = fuse.search(key)
    if (!matches || matches.length === 0 ){
      return console.log('no matched timezone'.red)
    }
    askIndex(matches)
  }

  function askIndex (matches) {
    const q = [
      {
        type: 'list',
        message: `Here are ${matches.length} matched timezones, select one:`,
        choices: matches.map(m => {
          const plus = m.offset > 0 ? '+' : ''
          const offset = plus + m.offset.toString()
          return `[${offset}]${' '.repeat(6 - offset.length)}${m.value}`
        }),
        name: 'name'
      }
    ]
    inq.prompt(q, a => {
      const timezone = getTimezoneByName(a.name.replace(/([(0-9)\[\]\+\-\. ])+/i, ''))
      timezone.input = keyword
      console.log(`\n${'√'.green} You\'ve selected:\n\n${a.name.gray} ${timezone.text.gray}\n`)
      config
        .get('timezones')
        .then(addTimezone)

      function addTimezone (ts) {
        ts = ts || []
        if (checkTimezoneExists(ts, timezone.value)) {
          return console.log('Timezone already existed in config file!\n'.red)
        }
        ts.push(timezone)
        config
          .set('timezones', ts)
          .then(ts => {
            console.log('Success!'.green)
          })
          .catch(err => console.log(err))
      }
    })
  }

  function checkTimezoneExists (ts, value) {
    for (var i = 0; i < ts.length; i++) {
      if (ts[i].value === value) {
        return true
      }
    }
    return false
  }

  function getTimezoneByName (name) {
    for (var i = 0; i < timezones.length; i++) {
      if (timezones[i].value === name) {
        return timezones[i]
      }
    }
  }
}
