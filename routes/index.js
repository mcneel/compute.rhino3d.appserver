const express = require('express');
const router = express.Router();
const compute = require('compute-rhino3d');

// Return information related to the definitions on the server
router.get('/',  function(req, res, next) {
  
  let definitions = [];
  req.app.get('definitions').forEach( def => {
    let data = {name: def.name, inputs: def.inputs, outputs: def.outputs};
    definitions.push(data);
  });

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(definitions));
});

/*

// Return information related to a specific definition
router.get('/:name', function(req, res, next){
  let def = req.app.get('definitions').find(o => o.name === req.params.name);
  let data = {name: def.name, inputs: def.inputs, outputs: def.outputs};
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data));
});

*/

// Solve GH definition
router.post('/:name', function(req, res, next) {

  let definition = req.app.get('definitions').find(o => o.name === req.params.name);
  
  if(definition === undefined)
    throw new Error('Definition not found on server.'); 

  compute.url = req.app.get('computeUrl');
  let fullUrl = req.protocol + '://' + req.get('host');

  // set parameters
  let trees = [];
  // console.log(req.body.inputs);

  for (let [key, value] of Object.entries(req.body.inputs)) {
    let param = new compute.Grasshopper.DataTree(key);
    param.append([0], [value]);
    trees.push(param);
  }
/*
  req.body.inputs.forEach( input => {
    console.log(input);
    let param = new compute.Grasshopper.DataTree(input.Name);
    param.append([0], [req.body.inputs[input.Name]]);
    trees.push(param);
  });


  if(definition.hasOwnKey('inputs')){
    definition.inputs.forEach( input => {
        // match body object parameter to definition input
        let param = new compute.Grasshopper.DataTree(input.Name);
        param.append([0], [req.body.inputs[input.Name]]);
        trees.push(param);
    });
  }
  */

let definitionPath = fullUrl + '/definition/'+ definition.id;

compute.Grasshopper.evaluateDefinition(definitionPath, trees).then(result => {
  
  res.setHeader('Content-Type', 'application/json');
  res.send(result);

  }).catch( (error) => { 
      console.log(error);
      res.send('error in solve');
  });
    
});

module.exports = router;
