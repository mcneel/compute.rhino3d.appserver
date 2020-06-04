var express = require('express');
var router = express.Router();
var path = require('path');

/* GET definition information. */
router.get('/:id', function(req, res, next) {

  let definition = req.app.get('definitions').find(o => o.id === req.params.id);

  var options = {
    root: req.app.get('definitionsDir'),
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
      }
  }

  res.sendFile(definition.name, options, (error) => {
      if(error !== undefined)
        console.log(error);
  });

});

module.exports = router;