import test from 'ava'
import Config from './lib/myconf'
const config = new Config('.testrc')

test('json', t => {
  config
    .path(process.cwd())
    .set('version', '0.0.1')
    .then(version => {
      config
        .get('version')
        .then(v => {
          t.is(v, '0.0.1')
        })
    })
})
