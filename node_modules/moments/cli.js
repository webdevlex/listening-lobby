#!/usr/bin/env node
require('colorful').toxic()
const pkg = require('./package')
const updateNotifier = require('update-notifier')
updateNotifier({pkg}).notify()
const argv = require('minimist')(process.argv.slice(2), { '--': true })

if (argv.v || argv.version) {
  console.log(`${pkg.name.cyan} ~ ${pkg.version.magenta}`)
  process.exit()
} else if (argv.h || argv.help) {
  console.log(`
  ${pkg.name.cyan} ~ ${pkg.version.magenta}

  ${'Usages:'.white.underline}

  mm -v/--version:         Print version
  mm -h/--help:            Print docs
  mm add [name]:           Add a time of a city/contry
  mm:                      Print all available time sets
`)
  process.exit()
}

require('./')(argv)
