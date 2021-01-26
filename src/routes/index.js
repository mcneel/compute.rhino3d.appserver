/**
 * Provide routes for getting descriptive information about the definitions
 * available on this AppServer instance as well as details on the inputs and
 * outputs for a given definition
 * 
 * Routes:
 *  ('/')
 *     Show list of definitions available
 *  ('/:definition')
 *     Get definition input/output details for a definition installed in
 *     this AppServer. These definitions are located in the 'files' directory
 *  ('/definition_description?path=FILEPATH`)
 *     Get definition input/output details for a definition at an absolute
 *     path on the AppServer machine.
 */
const express = require('express')
const router = express.Router()
const compute = require('compute-rhino3d')
const md5File = require('md5-file')

/**
 * Set url and apikey used to communicate with a compute server
 */
function setComputeParams (){
  compute.url = process.env.RHINO_COMPUTE_URL
  compute.apiKey = process.env.RHINO_COMPUTE_KEY
}

/**
 * Return list of definitions available on this server. The definitions
 * are located in the 'files' directory. These are the names that can be
 * used to call '/:definition_name` for details about a specific definition
 */
router.get('/',  function(req, res, next) {
  let definitions = []
  req.app.get('definitions').forEach( def => {
    definitions.push({name: def.name})
  })

  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(definitions))
})

function describeDefinition(definition, req, res, next){
  if(definition === undefined)
    throw new Error('Definition not found on server.') 

  let data = {name: definition.name}

  if(!Object.prototype.hasOwnProperty.call(definition, 'inputs') && !Object.prototype.hasOwnProperty.call(definition, 'outputs')){

    let fullUrl = req.protocol + '://' + req.get('host')
    let definitionPath = `${fullUrl}/definition/${definition.id}`
    
    setComputeParams()
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

      data.description = result.Description === undefined ? '' : result.Description
      data.inputs = inputs
      data.outputs = outputs

      definition.description = data.description
      definition.inputs = inputs
      definition.outputs = outputs

      res.json(data)
    }).catch( (error) => {
      next(error)
    }) 
  } else {
    data.description = definition.description
    data.inputs = definition.inputs
    data.outputs = definition.outputs

    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(data))
  }
}

router.get('/definition_description', function(req, res, next){
  let fullPath = req.query['path']
  let definition = req.app.get('definitions').find(o => o.name === fullPath)
  if(definition === undefined){
    const hash = md5File.sync(fullPath)
    let definitions = req.app.get('definitions')
    definition = {
      name: fullPath,
      id:hash,
      path: fullPath
    }
    definitions.push(definition)
  }
  describeDefinition(definition, req, res, next)
})

/**
 * This route needs to be declared after /definition_description so it won't be
 * called when '/definition_description' is requested
 */
router.get('/:name', function(req, res, next){
  let definition = req.app.get('definitions').find(o => o.name === req.params.name)
  describeDefinition(definition, req, res, next)
})

module.exports = router
