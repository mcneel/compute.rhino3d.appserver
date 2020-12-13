# Installing the Rhino Compute AppServer

You are going to want to be able to have this application run in two different locations for different purposes.
- Run locally for testing and debugging
- Run on a production web server

## Step 1 - Install Rhino 7 and Rhino.Compute
AppServer requires Rhino 7 and Rhino.Compute. Please see the ["Developing with Rhino Compute"](https://github.com/mcneel/compute.rhino3d/blob/master/docs/develop.md) guide for instructions. Ensure Rhino.Compute (compute.geometry.exe) has started and is listening on http://localhost:8081

## Step 2 - Git this repository and install dependencies
Clone this repository and install dependencies
```bash
$ git clone https://github.com/mcneel/compute.rhino3d.appserver.git
$ cd compute.rhino3d.appserver
$ npm i
```
## Step 3 - Start project
- From a terminal, run:
```bash
$ npm run start
```
- If everything goes right, the terminal should report that it is listening on port 3000
- In your browser, navigate to http://localhost:3000/example/ to test out the sample client

## Debugging
- Start VS Code and open your cloned project's directory
- In VS Code's menu, click on Run->Start Debugging (or F5)

## Alternate ways to run the app locally
- If you'd like to run this application locally without any of the development tools you can use the following:

```bash
# uses the ./files/ directory for definitions and http://localhost:8081 as the compute server url (same as "npm run start" defined in package.json)
$ node ./src/bin/www

# or with command line arguments (same as "npm run start-args" defined in package.json)
$ node ./src/bin/www --computeUrl http://localhost:8081/
```
