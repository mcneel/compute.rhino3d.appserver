var express = require('express');
var router = express.Router();
const compute = require('compute-rhino3d');

router.post('/:name', function(req, res, next) {
    let definition = req.app.get('definitions').find(o => o.name === req.params.name);
    compute.url = req.app.get('computeUrl');
    let fullUrl = req.protocol + '://' + req.get('host');

    // set parameters
    let trees = [];
    definition.inputs.forEach( input => {
        // match body object parameter to definition input
        let param = new compute.Grasshopper.DataTree(input);
        param.append([0], [req.body.inputs[input]]);
        trees.push(param);
    });

  let definitionPath = fullUrl + '/definition/'+ definition.id;

  compute.Grasshopper.evaluateDefinition(definitionPath, trees).then(result => {
    let data = JSON.parse(result.values[0].InnerTree['{ 0; }'][0].data);

    res.setHeader('Content-Type', 'application/json');
    res.send(data);

    }).catch( (error) => { 
        console.log(error);
        res.send('error in solve');
    });
    
});
  
module.exports = router;

