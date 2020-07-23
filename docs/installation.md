# Installing the Rhino Compute AppServer

You are going to want to be able to have this application run in two different locations for different purposes.
- Run locally for testing and debugging
- Run on a production web server

### Pre-requisites
- Rhino WIP installed
- Visual Studio Code installed

## Step 1 - Fork the repo
- Fork [this repo](https://github.com/mcneel/compute.rhino3d.appserver) and clone your fork to your computer so that you can work locally.

`compute.rhino3d.appserver\files` is the folder where the .gh definitions are stored. Note that in the example definition, some components are grouped and named with a specific format:
- groups with `RH_IN:Name` will be the inputs sent to  _compute_
- groups with `RH_OUT:Name` will be the outputs return by _compute_ after the definition is computed
- In both cases, `Name`  is the input/output variable and should be unique

## Step 2 - Run locally for testing and debugging
The AppServer requires a copy of Rhino Compute. For running this app locally, that means you need to install and run a copy of compute on your computer:

- compile compute.sln found at https://github.com/mcneel/compute.rhino3d/tree/master/src
- start `compute.geometry.exe`. This is an instance of the compute geometry server running locally on your computer and listening to localhost:8081

Start VS Code and open your cloned project's directory
- from terminal run `npm install` to install dependencies
```bash
$ npm install
```
- In VS Code's menu, click on Run->Start Debugging using `Launch Program`
- If everything goes right, the terminal should report that it is listening on port 3000
- In your browser, navigate to http://localhost:3000/example/ to test out the sample client

### Alternate ways to run the app locally
-  Start the application from the terminal in development mode. This uses [nodemon](https://nodemon.io/) to restart the server in case you make changes. It also runs the linting script.
```bash
# will look for definitions in the ./files/ directory and use http://localhost:8081 as the compute server address

$ npm run dev

# alternatively, if you'd like to define a different address for the compute server (check the 'dev' script in packages.json):

$ nodemon --inspect ./bin/www --computeUrl http://localhost:8081/  --exec \"npm run lint && node\""
```

- If you'd like to run this application locally without any of the development tools you can use the following:

```bash
# uses the ./files/ directory for definitions and http://localhost:8081 as the compute server url (same as "npm run start" defined in package.json)
$ node ./bin/www

# or with command line arguments (same as "npm run start-args" defined in package.json)
$ node ./bin/www --computeUrl http://localhost:8081/
```
