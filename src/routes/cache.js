const express = require('express')
const router = express.Router()

router.get('/',  function(req, res, next) {

  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(req.app.get('cache').data, null, 4))

})

module.exports = router
