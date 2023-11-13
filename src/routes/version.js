const express = require('express')
const router = express.Router()
const compute = require('compute-rhino3d')
const getVersion = require('../version.js').getVersion

router.get('/', async function(req, res, next){

  const result = await getVersion()
  
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(result))
})

module.exports = router

