## API Endpoints
The primary and only endpoint for a client application to call is `/solve`

endpoint | method | return type | description
------------ | ------------- | ------------- | -------------
`/` | GET | `application/json` | list of the definitions on the server
`/definitionName.gh` | GET |  `application/json` | displays information about the definition
`/solve` | POST |  `application/json` | solves a GH definition and returns json data
`/solve/definitionName.gh?param1=123...` | HEAD |  `application/json` | given the definition name and parameters, solves a GH definition and returns headers
`/solve/definitionName.gh?param1=123...` | GET |  `application/json` | given the definition name and parameters, solves a GH definition and returns json data
`/version` | GET | `application/json` | version information for compute server and appserver
`/view` | GET | `text/html` | lists definitions that can be run with the autogenerated UI template
`/view/definitionName.gh` | GET | `text/html` | autogenerates a UI for the definition
`/examples` | GET | `text/html` | shows other examples that might not be able to be run with the autogenerated UI template
