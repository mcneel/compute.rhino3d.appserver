# Rhino Compute AppServer Example
This is a node.js server built with express which shows how to serve a few Grasshopper definitions and expose their remote solving via a basic API.

## Usage
 This assumes you have cloned the https://github.com/mcneel/compute.rhino3d repository and are running a debug rhino compute geometry server on the same machine.

There are different ways to use this code:
- Install as global package (preferred)
    - Install: `npm i -g @mcneel/compute.rhino3d.appserver`
    - Run: `compute-rhino3d-appserver --definitions path\to\definitions --computeUrl http://computeurl:port/`
- Run locally:
    - Clone the repository
    - Install dependencies from repository directory: `npm i`
    - Run: `node ./bin/www --definitions path-to-definitions --computeUrl http://computeurl:port/`

In a terminal you can run: `curl http://localhost:3000/` (or just browse to that address in a browser) to get a list of definitions on the server.

The `example` directory contains an html and js example for calling the solving the definition. Start an http server in this directory and navigate to the address in your browser.

## Configuration

The server takes a few command line options to to configure where it looks for GH files and the address of your rhino compute server. If no options are passed, the server uses some defaults. You can include none, either, or both.

option | default | specified (example)
------------ | ------------- | -------------
--definitions | ./files/ | C:\\data\\definitions
--computeUrl | http://localhost:8082 | http://localhost:8082

## Example

To solve a GH definition you need to pass the definition name to the appserver.

```javascript

let data = {};
data.definition = 'BranchNodeRnd.gh';
data.inputs = {
    'RH_IN:201:Length':document.getElementById('length').value,
    'RH_IN:201:Count':document.getElementById('count').value,
    'RH_IN:201:Radius':document.getElementById('radius').value
};

let xhr = new XMLHttpRequest();

xhr.open('POST', 'http://localhost:3000/' + data.definition, true);

//Send the proper header information along with the request
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
