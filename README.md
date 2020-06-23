# Rhino Compute AppServer Example
This is a node.js server built with express which shows how to serve a few Grasshopper definitions and expose their remote solving via a basic API.

[![npm](https://img.shields.io/npm/v/@mcneel/compute.rhino3d.appserver?style=flat-square)](https://www.npmjs.com/package/@mcneel/compute.rhino3d.appserver)
![GitHub package.json version](https://img.shields.io/github/package-json/v/mcneel/compute.rhino3d.appserver?style=flat-square)
![node-current (scoped)](https://img.shields.io/node/v/@mcneel/compute.rhino3d.appserver?style=flat-square)

1. [Use Cases](#use-cases)
    1. [Running this app locally](#running-this-app-locally)
    2. [Deploying this app on **Heroku** ](#deploying-this-app-on-heroku)
2. [API Endpoints](#api-endpoints)
3. [Example](#example)

## Use Cases

You can use this project in several use cases, but they all assume you've setup a Rhino compute server and that server is accessible locally or from another computer. To test this, navigate in a browser to `http://your-compute-server-address/version`. For more information on setting up your compute server, please visit: https://github.com/mcneel/compute.rhino3d/blob/master/docs/installation.md

### Running this app locally
(alongside a compute geometry server)
1. Open up a terminal. Clone this repository and navigate to the resulting directory: 
``` bash
$ git clone https://github.com/mcneel/compute.rhino3d.appserver.git
$ cd compute.rhino3d.appserver
```
2. Install dependencies:
```bash
$ npm install
```
3. Start the application from the terminal in development mode. This uses [nodemon](https://nodemon.io/) to restart the server in case you make changes. It also runs the linting script.
```bash
# will look for definitions in the ./files/ directory and use http://localhost:8081 as the compute server address

$ npm run dev

# alternatively, if you'd like to define a different address for the compute server (check the 'dev' script in packages.json):

$ nodemon --inspect ./bin/www --computeUrl http://localhost:8081/  --exec \"npm run lint && node\""
```
4. Navigate to `http://localhost:3000/example/` to test the example included in this project.
5. If you'd like to add any definitions, add .gh or .ghx files to the `./files/` directory.
6. If you'd like to run this application locally without any of the development tools you can use the following:

```bash
# uses the ./files/ directory for definitions and http://localhost:8081 as the compute server url (same as "npm run start" defined in package.json)
$ node ./bin/www

# or with command line arguments (same as "npm run start-args" defined in package.json)
$ node ./bin/www --computeUrl http://localhost:8081/
```

### Deploying this app on **Heroku** 
(with Compute Geometry server running on a Windows Server)

#### Prerequisites
1. You have an account on [Heroku](https://heroku.com).
2. You've downloaded and installed the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install).

#### Setup
1. If you haven't already done so, open up a terminal, clone this repository, and navigate to the resulting directory: 
``` bash
$ git clone https://github.com/mcneel/compute.rhino3d.appserver.git
$ cd compute.rhino3d.appserver
```
2. This example comes with a few definitions in the `./files/` directory. If you would like to add any more definitions, you can do so now.
3. From the terminal, login to Heroku:
``` bash
$ heroku login
```
4. From the terminal, create the Heroku application (you can specify a name here, otherwise heroku will assign a name to your app):
``` bash
$ heroku create myappname
```
You will see that your app was created and has a domain and a git repository:
```
Creating myappname... done
https://myappname.herokuapp.com | https://git.heroku.com/myappname.git
```
5. Add configuration variables.
(This step can also be completed via the Heroku dashboard)
   - From the terminal, set the `COMPUTE_URL` variable. The VALUE of this should be the address to the server running compute. Ensure this address ends in a `/`.
   ```bash
   heroku config:set COMPUTE_URL=http://your-compute-server-address/
   ``` 
6. Push the code to Heroku:
```
git push heroku master
```
7. Finally, open the application. You should see your browser write some json formated information about the definitions.
```bash
heroku open
```
8. Check out the example at https://myappname.herokuapp.com/example/ 
9. Navigate in a browser to your [Heroku dashboard](https://dashboard.heroku.com/). There you should see your new application. Click on your application name view it. You can view the logs by clicking on the `More` button and selecting `View logs`.

## API Endpoints

endpoint | method | return type | description
------------ | ------------- | ------------- | -------------
`/` | GET | `application/json` | list of the definitions on the server
`/definitionName.gh` | GET |  `application/json` | displays information about the definition
`/definitionName.gh` | POST |  `application/json` | solves a GH definition and returns json data

## Example

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

xhr.open('POST', 'http://yourcomputeserver/' + data.definition, true);

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
