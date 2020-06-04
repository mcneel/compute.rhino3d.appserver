# Rhino Compute AppServer Example
This is a node.js server built with express which shows how to serve a few Grasshopper definitions and expose their remote solving via a basic API.

## Usage
 This assumes you have cloned the https://github.com/mcneel/compute.rhino3d repository and are running a debug rhino compute server on the same machine.

There are different ways to use this code:
- Install as global package (preferred)
    - Install: `npm i -g @mcneel/compute.rhino3d.appserver`
    - Run: `compute-rhino3d-appserver --definitions path\to\definitions --computeUrl http://computeurl:port/`
- Run locally:
    - Clone the repository
    - Install dependencies from repository directory: `npm i`
    - Run: `node ./bin/www --definitions path-to-definitions --computeUrl http://computeurl:port/`

In a terminal you can run: `curl http://localhost:3000/definitions/` (or just browse to that address in a browser)to get a list of definitions on the server, or you can go to a browser and navigate to http://localhost:3000/definitions/view

The `example` directory contains an html and js example for calling the `/solve` endpoint. Start an http server in this directory and navigate to the address in your browser.

## Configuration

The server takes a few command line options to to configure where it looks for GH files and the address of your rhino compute server. If no options are passed, the server uses some defaults. You can include none, either, or both.

option | default | specified (example)
------------ | ------------- | -------------
--definitions | ./files/ | C:\\data\\definitions
--computeUrl | http://localhost:8082 | http://localhost:8082
