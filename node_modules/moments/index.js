const add = require('./lib/add')
const print = require('./lib/print')
const remove = require('./lib/remove')

module.exports = function (argv) {
  switch (argv._[0]) {
    case 'add':
      add(argv)
      break
    case 'remove':
      remove(argv)
      break
    default:
      print()
  }
}
