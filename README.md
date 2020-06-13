# Rhino Compute AppServer Example
This is a node.js server built with express which shows how to serve a few Grasshopper definitions and expose their remote solving via a basic API.

[![npm](https://img.shields.io/npm/v/@mcneel/compute.rhino3d.appserver?style=flat-square)](https://www.npmjs.com/package/@mcneel/compute.rhino3d.appserver)
![GitHub package.json version](https://img.shields.io/github/package-json/v/mcneel/compute.rhino3d.appserver?style=flat-square)
![node-current (scoped)](https://img.shields.io/node/v/@mcneel/compute.rhino3d.appserver?style=flat-square)

## Use Cases
### 1. Deploying this app on **Heroku** with Compute Geometry server running on a Windows Server

#### Prerequisites
1. You've setup a Rhino compute server and that server is accessible from another computer. To test this, navigate in a browser to http://yourserveraddress/version. For more information on setting up your compute server, please visit: https://github.com/mcneel/compute.rhino3d/blob/master/docs/installation.md
2. You have an account on [Heroku](https://heroku.com).
3. You've downloaded and installed the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install).

#### Setup
1. Open up a terminal. Clone this repository and navigate to the resulting directory: 
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
   - From the terminal, set the `APP_URL` variable. The VALUE of this should be the address generated in the previous step. Ensure this ends in a `/`.
   ```bash
   heroku config:set APP_URL=https://myappname.herokuapp.com/
   ```
   - From the terminal, set the `COMPUTE_URL` variable. The VALUE of this should be the address to the server running compute. Ensure this address ends in a `/`.
   ```bash
   heroku config:set COMPUTE_URL=http://yourserveraddress/
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

### 2. TODO - Testing this app locally along side a running Compute server
<!-- 
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

-->

<!--
## Deploy
You can deploy a copy of this app to heroku:

 [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy) 
-->
<!--
## Configuration

The server takes a few command line options to to configure where it looks for GH files and the address of your rhino compute server. If no options are passed, the server uses some defaults. You can include none, either, or both.

option | default | specified (example)
------------ | ------------- | -------------
--definitions | ./files/ | C:\\data\\definitions
--computeUrl | http://localhost:8082 | http://localhost:8082
-->

## API Endpoints

endpoint | method | return type | description
------------ | ------------- | ------------- | -------------
`/` | GET | `application/json` | data related to the definitions on the server
`/definitionName.gh` | POST |  `application/json` | solves a GH definition and returns json data

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

xhr.open('POST', 'http://yourcomputeserver/' + data.definition, true);

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
