const fs = require('fs')
const path = require('path')
const md5File = require('md5-file')

/*
function getFiles(dir) {
  return new Promise ( (resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if(err) reject(err)
      else resolve(files)
    })
  } )
}
*/
function getFilesSync(dir) {
  return fs.readdirSync(dir)
}

module.exports = (() => {
  let files = getFilesSync(path.join(__dirname, 'files/'))
  let definitions = []
  files.forEach( file => {
    if(file.includes('.gh') || file.includes('.ghx')) {
      const hash = md5File.sync(path.join(__dirname, 'files/' + file))
      definitions.push({name: file, id:hash})
    }
  })
  return definitions
})()
