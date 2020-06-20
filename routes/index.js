const express = require('express')
const router = express.Router()
const compute = require('compute-rhino3d')

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


// Solve GH definition
router.post('/:name', function(req, res, next) {
  const timePostStart = performance.now()
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
  
  compute.url = req.app.get('computeUrl')
  compute.authToken = process.env.COMPUTE_TOKEN

  let fullUrl = req.protocol + '://' + req.get('host')
  let definitionPath = `${fullUrl}/definition/${definition.id}`
  const timePreComputeServerCall = performance.now()
  // call compute server
  compute.Grasshopper.evaluateDefinition(definitionPath, trees).then(result => {
    const timeComputeServerCallComplete = performance.now()
    const timespanSetup = timePreComputeServerCall-timePostStart
    const timespanCompute = timePreComputeServerCall - timeComputeServerCallComplete
    const timing = `appserverSetup;dur=${timespanSetup}, compute;dur=${timespanCompute}`
    res.setHeader('Server-Timing', timing)
    res.setHeader('Content-Type', 'application/json')
    res.send(result)
  }).catch( (error) => { 
    console.log(error)
    res.send('error in solve')
  })
})

module.exports = router
