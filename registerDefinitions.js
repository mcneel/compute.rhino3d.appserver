const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

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
      definitions.push({name: file, id:uuidv4()})
    }
  })
  return definitions
})()
