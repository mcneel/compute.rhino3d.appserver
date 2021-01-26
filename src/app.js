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

const argIndex = process.argv.indexOf('--computeUrl')
if (argIndex > -1)
  process.env.RHINO_COMPUTE_URL = process.argv[argIndex + 1]
if (!process.env.RHINO_COMPUTE_URL)
  process.env.RHINO_COMPUTE_URL = 'http://localhost:8081/' // default if nothing else exists

console.log('RHINO_COMPUTE_URL: ' + process.env.RHINO_COMPUTE_URL)

// Routes for this app
app.use('/example', express.static(__dirname + '/example'))
app.get('/favicon.ico', (req, res) => res.status(200))
app.use('/', require('./routes/index'))
app.use('/definition', require('./routes/definition'))
app.use('/solve', require('./routes/solve'))

// ref: https://github.com/expressjs/express/issues/3589
// remove line when express@^4.17
express.static.mime.types["wasm"] = "application/wasm";

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
