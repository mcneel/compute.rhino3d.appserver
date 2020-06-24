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

// Return information related to the definitions on the server
router.get('/',  function(req, res, next) {
  let definitions = []
  req.app.get('definitions').forEach( def => {
    let data = {name: def.name, inputs: def.inputs, outputs: def.outputs}
    definitions.push(data)
  })

  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(definitions))
})

// Return information related to a specific definition
router.get('/:name', computeParams, function(req, res, next){
  let definition = req.app.get('definitions').find(o => o.name === req.params.name)

  if(definition === undefined)
    throw new Error('Definition not found on server.') 

  let data = {name: definition.name}

  if(!Object.prototype.hasOwnProperty.call(definition, 'inputs') && !Object.prototype.hasOwnProperty.call(definition, 'outputs')){

    let fullUrl = req.protocol + '://' + req.get('host')
    let definitionPath = `${fullUrl}/definition/${definition.id}`
    
    compute.computeFetch('io', {'requestedFile':definitionPath}).then(result => {

      let inputs = result.Inputs === undefined ? result.InputNames : result.Inputs
      let outputs = result.Outputs === undefined ? result.OutputNames: result.Outputs

      data.inputs = inputs
      data.outputs = outputs

      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(data))

    }).catch( (error) => console.log(error))


  } else {
    data.inputs = definition.inputs
    data.outputs = definition.outputs

    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(data))
  }
})



// Solve GH definition
router.post('/:name', computeParams, function(req, res, next) {
  const timePostStart = performance.now()
  const cacheKey = JSON.stringify(req.body)
  let cachedResult = cache.get(cacheKey)
  if (cachedResult) {
    const timespanPost = Math.round(performance.now() - timePostStart)
    res.setHeader('Server-Timing', `cacheHit;dur=${timespanPost}`)
    res.setHeader('Content-Type', 'application/json')
    res.send(cachedResult)
    return
  }

  let definition = req.app.get('definitions').find(o => o.name === req.params.name)
  
  if(!definition)
    throw new Error('Definition not found on server.') 

  // set parameters
  let trees = []
  if(req.body.inputs !== undefined) { // handle no inputs
    for (let [key, value] of Object.entries(req.body.inputs)) {
      let param = new compute.Grasshopper.DataTree(key)
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
      computeResponse.buffer().then(result=> {
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
        
        cache.set(cacheKey, result)

        res.setHeader('Server-Timing', timing)
        res.setHeader('Content-Type', 'application/json')
        res.send(result)
      }).catch( (error) => { 
        console.log(error)
        res.send('error in solve')
      })
    })
})

module.exports = router
