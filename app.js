const createError = require('http-errors')
const express = require('express')
const path = require('path')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const compute = require('./example/compute-rhino3d')

// dotenv only required for development. 
// Heroku adds config vars in production. 
// If not running on Heroku, you might want to add this back in with your own .env file.
// require('dotenv').config()

// routers
const indexRouter = require('./routes/index')
const definitionRouter = require('./routes/definition')

const app = express()

// get cmd line args
// get arguments after first two elements in process.argv
let args = process.argv.splice(2)

let defArgId = args.indexOf('--definitions')
let urlArgId = args.indexOf('--computeUrl')

// set arguments or accept defaults
if(defArgId > -1)
  app.set('definitionsDir', path.normalize(args[defArgId+1]))
else
  app.set(app.set('definitionsDir', path.join(__dirname, 'files/')))

if(urlArgId > -1)
  app.set('computeUrl', args[urlArgId+1])
else 
  app.set('computeUrl', process.env.COMPUTE_URL) // set to a geometry server running on the same machine. NOTE: Port 8082 is when Geometry Server is running debug

compute.url = app.get('computeUrl')

if(process.env.COMPUTE_TOKEN !== undefined)
  compute.authToken = process.env.COMPUTE_TOKEN

if(process.env.APP_URL !== undefined)
  app.set('appUrl', process.env.APP_URL)
else
  app.set('appUrl', 'http://localhost' + process.env.PORT || '3000' + '/')

console.log('VERSION: ' + process.env.npm_package_version)
console.log('COMPUTE_URL: ' + app.get('computeUrl'))
console.log('NODE_ENV: ' + process.env.NODE_ENV)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())
app.use(compression())
app.use('/example', express.static('example'))

app.use('/', indexRouter)
app.use('/definition', definitionRouter)

function getFiles(dir) {
  return new Promise ( (resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if(err) reject(err)
      else resolve(files)
    })
  } )
}

getFiles( app.get('definitionsDir') )
  .then( (files) => {

    if(files.length === 0)
      throw new Error('No definitions found on server') 

    app.set('definitions', [])
    console.log(files)

    let fullUrl = app.get('appUrl') // watch this.

    files.forEach(file => {

      if(file.includes('.gh') || file.includes('.ghx')) {
        let id =  uuidv4()
        app.get('definitions').push({name: file, id:id})
      
        compute.computeFetch('io', {'requestedFile':fullUrl + 'definition/'+ id}).then(result => {
          app.get('definitions').find(d => d.id === id).inputs = result.Inputs === undefined ? result.InputNames : result.Inputs
          app.get('definitions').find(d => d.id === id).outputs = result.Outputs === undefined ? result.OutputNames: result.Outputs
        }).catch( (error) => console.log(error))
      
      }
    })

  })
  .catch( (error)=>{ console.log(error) })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message
  console.log(err.message)
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // send the error
  res.status(err.status || 500)
  res.send(err.message)
})

module.exports = app
