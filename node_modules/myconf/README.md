# myconf

[![NPM version](https://img.shields.io/npm/v/myconf.svg?style=flat-square)](https://www.npmjs.com/package/myconf)
[![NPM download](https://img.shields.io/npm/dm/myconf.svg?style=flat-square)](https://www.npmjs.com/package/myconf)
[![David Status](https://img.shields.io/david/egoist/myconf.svg?style=flat-square)](https://david-dm.org/egoist/myconf)

Easily manage a config file in your project.

You always want to make it possible for users to save some custom configs with a Node.js command line tool, such like you made a node-version Git tool and wanna save the configs to `/Users/$username/.gitconfig`. That's why I made this tool to facilitate your development.

## Example

```javascript
import Config from 'myconf'

// This points to a file $USER_HOME/.customconfig
const config = new Config('.customconfig')

// or save the file to a custom path
config.path('/path/to/save/to')

// or change a parser, the default is `json`
// parser in ['json', 'yaml']
config.parser('yaml')

// set a property
config
  .set('name', 'config for my project')
  .then(data => console.log(data.name))

// set multi properties
config
  .set({name: 'egoist', version: '1.4.2'})
  .then(data => console.log(data))

// get a property
config
  .get('name')
  .then(name => console.log(name))

// get all properties
config
  .get()
  .then(data => console.log(data.name))

// override the config file
config
  .save({newName: 'inori', oldName: 'will_gone'})
  .then(data => console.log(data))
```

## License

This project is released under SOX license that means you can do whatever you want to do, but you have to open source your copy on github if you let the public uses it. All copies should be released under the same license. The owner of each copy is only reponsible for his own copy, not for the parents, not for the children.

permitted use:  
fork on github  
change  
do evil with your copy  

prohibted use:  
do evil with copies not of your own  
open source your copy without declaring your parent copy  
