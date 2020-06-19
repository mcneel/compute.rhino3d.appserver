const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
// const compute = require('compute-rhino3d')

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

module.exports = () => {
  let files = getFilesSync(path.join(__dirname, 'files/'))
  let definitions = []
  files.forEach( file => {
    if(file.includes('.gh') || file.includes('.ghx')) {
      definitions.push({name: file, id:uuidv4()})
    }
  })
  return definitions
}
/*
module.exports = () => {
  return new Promise ( (resolve, reject) => {
    getFiles(path.join(__dirname, 'files/')).then( (files) => {
      let definitions = []
      if(files.length === 0){
        reject('No definitions found on server')
        throw new Error('No definitions found on server')
      }

      files.forEach( file => {
        if(file.includes('.gh') || file.includes('.ghx')) {
          definitions.push({name: file, id:uuidv4()})
        }
      })
      resolve( definitions )
    }).catch( (error)=>{ console.log(error) })
  })
}
/*
getFiles( app.get('definitionsDir') )
  .then( (files) => {

    if(files.length === 0)
      throw new Error('No definitions found on server') 

    app.set('definitions', [])
    console.log(files)

    // let fullUrl = app.get('appUrl') // watch this.

    files.forEach(file => {

      if(file.includes('.gh') || file.includes('.ghx')) {
        let id =  uuidv4()
        app.get('definitions').push({name: file, id:id})
       
        /*
        compute.computeFetch('io', {'requestedFile':fullUrl + 'definition/'+ id}).then(result => {
          app.get('definitions').find(d => d.id === id).inputs = result.Inputs === undefined ? result.InputNames : result.Inputs
          app.get('definitions').find(d => d.id === id).outputs = result.Outputs === undefined ? result.OutputNames: result.Outputs
        }).catch( (error) => console.log(error))
        
      
      }
    })

  }).catch( (error)=>{ console.log(error) })
  */
