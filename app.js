const createError = require('http-errors')
const express = require('express')
const compression = require('compression')
const logger = require('morgan')
const cors = require('cors')

// create express web server app
const app = express()

// log requests to the terminal when running in a local debug setup
if(process.env.NODE_ENV !== 'production')
  app.use(logger('dev'))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(compression())

// Define URL for our compute server
// - For local debugging on the same computer, compute.geometry.exe is
//   typically running at http://localhost:8081/
// - For a production environment it is good to use an environment variable
//   named COMPUTE_URL to define where the compute server is located
// - And just in case, you can pass an address as a command line arg
let computeUrl = process.env.COMPUTE_URL
const argIndex = process.argv.indexOf('--computeUrl')
if (argIndex > -1)
  computeUrl = process.argv[argIndex + 1]
if (!computeUrl)
  computeUrl = 'http://localhost:8081/' // default if nothing else exists
app.set('computeUrl', computeUrl)
console.log('COMPUTE_URL: ' + app.get('computeUrl'))

// Routes for this app
app.use('/example', express.static('example'))
app.use('/', require('./routes/index'))
app.use('/definition', require('./routes/definition'))
app.use('/solve', require('./routes/solve'))


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
