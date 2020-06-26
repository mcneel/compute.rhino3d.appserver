## API Endpoints
The primary and only endpoint for a client application to call is `/solve`

endpoint | method | return type | description
------------ | ------------- | ------------- | -------------
`/` | GET | `application/json` | list of the definitions on the server
`/definitionName.gh` | GET |  `application/json` | displays information about the definition
`/solve` | POST |  `application/json` | solves a GH definition and returns json data
