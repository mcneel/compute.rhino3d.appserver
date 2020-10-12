# Deploying to Heroku

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
2. From the terminal, login to Heroku:
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
   - From the terminal, set the `RHINO_COMPUTE_URL` variable. The VALUE of this should be the address to the server running compute. Ensure this address ends in a `/`.
   ```bash
   $ heroku config:set RHINO_COMPUTE_URL=http://your-compute-server-address/
   ```
   - From the terminal, set the `RHINO_COMPUTE_KEY` variable. The VALUE of this should be the API Key set for the server running compute.
   ```bash
   $ heroku config:set RHINO_COMPUTE_KEY=SOME_API_KEY
   ``` 
6. Push the code to Heroku:
```
$ git push heroku main
```
7. Finally, open the application. You should see your browser write some json formated information about the definitions.
```bash
$ heroku open
```
8. Check out the example at https://myappname.herokuapp.com/example/ 
9. Navigate in a browser to your [Heroku dashboard](https://dashboard.heroku.com/). There you should see your new application. Click on your application name view it. You can view the logs by clicking on the `More` button and selecting `View logs`.
