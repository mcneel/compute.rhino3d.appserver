var express = require('express');
var router = express.Router();

/* GET definition information. */
let paths = [];
function getDefinitionData (req, res, next) {
  paths = [];
  req.app.get('definitions').forEach( def => {
    let data = {name: def.name, inputs: def.inputs, outputs: def.outputs};
    paths.push(data);
  });
  next();
}

router.get('/', [getDefinitionData],  function(req, res, next) {

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(paths));

});

router.get('/view', [getDefinitionData], function(req, res, next) {

  res.render('definitions', { title: 'Definitions', files: paths });

});

module.exports = router;