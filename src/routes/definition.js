const express = require('express')
let router = express.Router()

/**
 * Get a grasshopper definition file
 * During a solve, the appserver sends definitions to compute as URLs that
 * point back at the appserver itself. These urls are only meant to be
 * consumed by compute.
 *
 * The urls are intentionally not easily discoverable. A md5 hash is computed
 * for every definition in the files directory and that hash is used for the
 * url that compute uses to get a definition.
 *
 * Compute caches definitions that are passed by url to improve performance.
 * Using a hash keeps the urls hard to find and also the same until a
 * definition is modified. 
 */
router.get('/:id', function(req, res, next) {
  let definition = req.app.get('definitions').find(o => o.id === req.params.id)
  const options = {
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }
  res.sendFile(definition.path, options, (error) => {
    if(error !== undefined)
      console.log(error)
  })
})

module.exports = router
