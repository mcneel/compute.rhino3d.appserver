const express = require('express')
const router = express.Router()
const compute = require('compute-rhino3d')
const {performance} = require('perf_hooks')

const NodeCache = require('node-cache')
const cache = new NodeCache()

const memjs = require('memjs')
const mc = memjs.Client.create(process.env.MEMCACHIER_SERVERS, {
  failover: true,  // default: false
  timeout: 1,      // default: 0.5 (seconds)
  keepAlive: true  // default: false
})

function computeParams (req, res, next){
  compute.url = req.app.get('computeUrl')
  compute.authToken = process.env.COMPUTE_TOKEN
  compute.apiKey = process.env.RHINO_COMPUTE_KEY
  next()
}

function collectParams (req, res, next){
  res.locals.params = {}
  switch (req.method){
  case 'HEAD':
  case 'GET':
    res.locals.params.definition = req.params.definition
    res.locals.params.inputs = req.query
    break
  case 'POST':
    res.locals.params = req.body
    break
  default:
    next()
    break
  }

  next()

}

function checkCache (req, res, next){

  res.locals.cacheKey = JSON.stringify(res.locals.params)

  console.log('cachekey: ' + res.locals.cacheKey)

  console.log('memcasher server: ' + process.env.MEMCACHIER_SERVERS)
  if(process.env.MEMCACHIER_SERVERS === undefined){
    // use node cache
    res.locals.cacheResult = cache.get(res.locals.cacheKey)
    next()
  } else {
    // use memcached
    mc.get(res.locals.cacheKey, function(err, val) {
      if(err == null && val != null) {
        res.locals.cacheResult = val
        next()
      }
    })
  }
  next()
}

/**
 * Solve GH definition
 * This is the core "workhorse" function for the appserver. Client apps post
 * json data to the appserver at this endpoint and that json is passed on to
 * compute for solving with Grasshopper.
 */

function commonSolve (req, res, next){
  const timePostStart = performance.now()

  // set general headers
  // what is the proper max-age, 31536000 = 1 year, 86400 = 1 day
  res.setHeader('Cache-Control', 'public, max-age=31536000')
  res.setHeader('Content-Type', 'application/json')

  console.log('cacheResult ' + res.locals.cacheResult)

  if(res.locals.cacheResult !== undefined) {
    const timespanPost = Math.round(performance.now() - timePostStart)
    res.setHeader('Server-Timing', `cacheHit;dur=${timespanPost}`)
    res.send(res.locals.cacheResult)
    return
  } else {
    //solve
    let definition = req.app.get('definitions').find(o => o.name === res.locals.params.definition)
    if(!definition)
      throw new Error('Definition not found on server.')

    // set parameters
    let trees = []
    if(res.locals.params.inputs !== undefined) { //TODO: handle no inputs
      for (let [key, value] of Object.entries(res.locals.params.inputs)) {
        let param = new compute.Grasshopper.DataTree('RH_IN:'+key)
        param.append([0], [value])
        trees.push(param)
      }
    }

    let fullUrl = req.protocol + '://' + req.get('host')
    let definitionPath = `${fullUrl}/definition/${definition.id}`
    const timePreComputeServerCall = performance.now()
    let computeServerTiming = null



    // call compute server
    compute.Grasshopper.evaluateDefinition(definitionPath, trees, false)
      .then(computeResponse => {
        computeServerTiming = computeResponse.headers
        computeResponse.text().then(result=> {

          console.log(result)
          const timeComputeServerCallComplete = performance.now()

          let computeTimings = computeServerTiming.get('server-timing')
          let sum = 0
          computeTimings.split(',').forEach(element => {
            let t = element.split('=')[1].trim()
            sum += Number(t)
          })
          const timespanCompute = timeComputeServerCallComplete - timePreComputeServerCall
          const timespanComputeNetwork = Math.round(timespanCompute - sum)
          const timespanSetup = Math.round(timePreComputeServerCall - timePostStart)
          const timing = `setup;dur=${timespanSetup}, ${computeTimings}, network;dur=${timespanComputeNetwork}`
          
          cache.set(res.locals.cacheKey, result)
          mc.set(res.locals.cacheKey, result, {expires:0}, function(err, val){
            console.log(err)
            console.log(val)
          })

          res.setHeader('Server-Timing', timing)
          res.send(result)
        }).catch( (error) => { 
          console.log(error)
          res.send('error in solve')
        })
      })
  }
}

/*
if (cachedResult) {
  const timespanPost = Math.round(performance.now() - timePostStart)
  res.setHeader('Server-Timing', `cacheHit;dur=${timespanPost}`)
  res.send(cachedResult)
  return
}
*/

const pipeline = [computeParams, collectParams, checkCache, commonSolve]

// Handle different http methods
router.head('/:definition',pipeline) // do we need this?
router.get('/:definition', pipeline)
router.post('/', pipeline)

module.exports = router
