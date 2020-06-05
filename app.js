var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const compute = require('compute-rhino3d');
var indexRouter = require('./routes/index');
var definitionRouter = require('./routes/definition');

console.log('appserver version: ' + process.env.npm_package_version);

var app = express();

// get cmd line args
// get arguments after first two elements in process.argv
let args = process.argv.splice(2);

let defArgId = args.indexOf('--definitions');
let urlArgId = args.indexOf('--computeUrl');

// set arguments or accept defaults
if(defArgId > -1)
  app.set('definitionsDir', path.normalize(args[defArgId+1]));
else
  app.set(app.set('definitionsDir', path.join(__dirname, 'files/')));

if(urlArgId > -1)
  app.set('computeUrl', args[urlArgId+1]);
else
  app.set('computeUrl', 'http://localhost:8082/');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use('/', indexRouter);
app.use('/definition', definitionRouter);

function getFiles(dir) {
  return new Promise ( (resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if(err) reject(err);
      else resolve(files);
    });
  } );
};

getFiles( app.get('definitionsDir') )
.then( (files) => {

  if(files.length === 0)
    throw new Error('No definitions found on server'); 

  let fullUrl = 'http://localhost:' + app.get('port') +'/'; // watch this.
  compute.url = app.get('computeUrl');
  app.set('definitions', []);
  console.log(files);

  files.forEach(file => {

    if(file.includes('.gh') || file.includes('.ghx')) {
      let id =  uuidv4();
      app.get('definitions').push({name: file, id:id});
      compute.computeFetch('io?params=true', {'requestedFile':fullUrl + 'definition/'+ id}).then(result => {
        app.get('definitions').find(d => d.id === id).inputs = result.Inputs;
        app.get('definitions').find(d => d.id === id).outputs = result.Inputs;
      }).catch( (error) => console.log(error));
    }

  });
})
.catch( (error)=>{ console.log(error) });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  console.log(err.message);
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // send the error
  res.status(err.status || 500);
  res.send(err.message);
});

module.exports = app;
