const createError = require('http-errors')
const express = require('express')
const path = require('path')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')

// routers
const indexRouter = require('./routes/index')
const definitionRouter = require('./routes/definition')

const app = express()

// get arguments after first two elements in process.argv
let args = process.argv.splice(2)

let defArgId = args.indexOf('--definitions')
let urlArgId = args.indexOf('--computeUrl')

// set arguments or accept defaults
app.set(app.set('definitionsDir', path.join(__dirname, 'files/')))
if(defArgId > -1)
  app.set('definitionsDir', path.normalize(args[defArgId+1]))
  
app.set('computeUrl', 'http://localhost:8081/')
if(urlArgId > -1)
  app.set('computeUrl', args[urlArgId+1])
else if(process.env.COMPUTE_URL !== undefined)
  app.set('computeUrl', process.env.COMPUTE_URL) // set to a geometry server running on the same machine. NOTE: Port 8082 is when Geometry Server is running debug

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
