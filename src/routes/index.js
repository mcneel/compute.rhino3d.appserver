const express = require('express')
const router = express.Router()
const compute = require('compute-rhino3d')

function computeParams (req, res, next){
  compute.url = process.env.RHINO_COMPUTE_URL
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
    
    compute.computeFetch('io', {'pointer':definitionPath}, false).then( (response) => {

      // Throw error if response not ok
      if(!response.ok) {
        throw new Error(response.statusText)
      } else {
        return response.json()
      }

    }).then( (result) => {

      let inputs = result.Inputs === undefined ? result.InputNames : result.Inputs
      let outputs = result.Outputs === undefined ? result.OutputNames: result.Outputs

      data.inputs = inputs
      data.outputs = outputs

      definition.inputs = inputs
      definition.outputs = outputs

      res.json(data)
    }).catch( (error) => {
      next(error)
    }) 
  } else {
    data.inputs = definition.inputs
    data.outputs = definition.outputs

    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(data))
  }
})

module.exports = router
