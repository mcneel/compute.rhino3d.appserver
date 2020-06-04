# Rhino Compute AppServer Example
This is a node.js server built with express which shows how to serve a few Grasshopper definitions and expose their remote solving via a basic API.

## Development

- This assumes you have cloned the mcneel/compute.rhino3d repository and are running a debug local server on the same machine.
- `npm install` - Installs dependencies the first time after cloning.
- Definitions are stored in the `./files/` directory or a user defined directory set with the `--definitions path-to-definitions` command line argument. These are not publically served. 
- Different ways of starting the app server (also defined in `packages.json`)
    - Running locally:
        - `node ./bin/www` - Starts the server with default parameters.
        - `node ./bin/www --definitions path-to-definitions --computeUrl url` - Starts the server with specified arguments.
    - If you've installed this server globally using `npm i -g compute.rhino3d.appserver`
        - `compute-rhino3d-appserver` - Starts the server with default parameters.
        - `rhino3d-compute-appserver --definitions path-to-definitions --computeUrl url` - Starts the server with specified arguments.
- In a terminal you can run: `curl http://localhost:3000/definitions/` (or just browse to that address in a browser)to get a list of definitions on the server, or you can go to a browser and navigate to http://localhost:3000/definitions/view
- The `example` directory contains an html and js example for calling the `/solve` endpoint. Start an http server in this directory and navigate to the address in your browser.
