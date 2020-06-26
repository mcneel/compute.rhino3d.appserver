![GitHub package.json version](https://img.shields.io/github/package-json/v/mcneel/compute.rhino3d.appserver/main?label=version&style=flat-square)
![node-current (scoped)](https://img.shields.io/node/v/@mcneel/compute.rhino3d.appserver?style=flat-square)

# Rhino Compute AppServer
A node.js server acting as a bridge between client apps and private compute.rhino3d servers.

This app is intended to host one or more custom grasshopper definitions and serve as the API that client applications can call to have definitions solved with modified input parameters.

## Features
- **Easy to get started**: clone this repo and run it locally for testing or push to a service like Heroku for a production web server
- **Easy to customize**: fork this repo, place your custom grasshopper definitions in the files directory and you now have a custom AppServer for your definitions.
- **Caching**: The AppServer assumes that all definitions produce the same results when the same set of inputs are provided. The appserver caches all results in memory for faster response times.
- **Timings**: Server-timing headers are returned to the client to help you diagnose what portion of the definition solving process may be a bottleneck

## Getting Started
1. Fork this repo
2. Follow the [installation guide](docs/installation.md) to test and debug on your computer
3. Follow the [Heroku hosting guide](docs/heroku.md) to push your own AppServer to Heroku and host it as a production web server

## Example
When we have our testing server up and running, you can visit

https://compute-rhino3d-appserver.herokuapp.com/example/

To see a sample web application that passes three numbers based on slider positions to the AppServer for solving a grasshopper definition. Results are returned to the web page and new mesh visualizations are created.

----

## API Endpoints

endpoint | method | return type | description
------------ | ------------- | ------------- | -------------
`/` | GET | `application/json` | list of the definitions on the server
`/definitionName.gh` | GET |  `application/json` | displays information about the definition
`/solve` | POST |  `application/json` | solves a GH definition and returns json data

## Client code

To solve a GH definition you need to pass the definition name and input values to the appserver:

```javascript

let data = {};
data.definition = 'BranchNodeRnd.gh';

// set the input values:
data.inputs = {
    'RH_IN:201:Length':document.getElementById('length').value,
    'RH_IN:201:Count':document.getElementById('count').value,
    'RH_IN:201:Radius':document.getElementById('radius').value
};

let xhr = new XMLHttpRequest();

xhr.open('POST', 'http://your-compute-appserver/solve', true);

// Send the proper header information along with the request
xhr.setRequestHeader("Content-Type", "application/json");

xhr.onreadystatechange = function() { // Call a function when the state changes.

    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {

        // Request finished. Do processing here.  
        let result = JSON.parse(xhr.response);
        let data = JSON.parse(result.values[0].InnerTree['{ 0; }'][0].data);
        let mesh = rhino.CommonObject.decode(data);
            
    }
}

xhr.send(JSON.stringify(data));
```
