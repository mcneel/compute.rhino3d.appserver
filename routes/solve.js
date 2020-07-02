const express = require('express')
const router = express.Router()
const compute = require('compute-rhino3d')
const {performance} = require('perf_hooks')
const NodeCache = require('node-cache')

const cache = new NodeCache()

function computeParams (req, res, next){
  compute.url = req.app.get('computeUrl')
  compute.authToken = process.env.COMPUTE_TOKEN
  compute.apiKey = process.env.RHINO_COMPUTE_KEY
  next()
}

function commonSolve (req, res, next){
  const timePostStart = performance.now()

  let cacheKey = null
  if(req.method === 'POST') {
    cacheKey = JSON.stringify(req.body)
    let cachedResult = cache.get(cacheKey)
    if (cachedResult) {
      const timespanPost = Math.round(performance.now() - timePostStart)
      res.setHeader('Server-Timing', `cacheHit;dur=${timespanPost}`)
      res.setHeader('Content-Type', 'application/json')
      res.send(cachedResult)
      return
    }
  }

  let definitionName = req.body.definition || req.params.definition
  let definition = req.app.get('definitions').find(o => o.name === definitionName)
  if(!definition)
    throw new Error('Definition not found on server.') 

  // set parameters
  let trees = []
  let params = req.body.inputs || req.query
  if(params !== undefined) { // handle no inputs
    for (let [key, value] of Object.entries(params)) {
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
        
        if(cacheKey !== null)
          cache.set(cacheKey, result)

        res.setHeader('Server-Timing', timing)
        res.setHeader('Content-Type', 'application/json')
        
        // tested with and without this, result seems the same, that is, same values for query parameters result in cached results.
        res.setHeader('Cache-Control', 'public, max-age=31536000')
        res.send(result)
      }).catch( (error) => { 
        console.log(error)
        res.send('error in solve')
      })
    })
  next()
}

/**
 * Solve GH definition
 * This is the core "workhorse" function for the appserver. Client apps post
 * json data to the appserver at this endpoint and that json is passed on to
 * compute for solving with Grasshopper.
 */

// eslint-disable-next-line no-unused-vars
router.get('/:definition', [computeParams,commonSolve],function(req, res, next) {
  console.log('Finished GET')
})

// eslint-disable-next-line no-unused-vars
router.post('/', [computeParams,commonSolve],function(req, res, next) {
  console.log('Finished POST')
})

module.exports = router
