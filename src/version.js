const compute = require('compute-rhino3d')
const appserverVersion = require('../package.json').version

async function getVersion() {

  compute.url = process.env.RHINO_COMPUTE_URL
  compute.apiKey = process.env.RHINO_COMPUTE_KEY

  const response = await fetch(compute.url + 'version')
  //console.log(response)
  const result = await response.json()

  result.appserver = appserverVersion

  console.log(result)

  return result

}

module.exports = { getVersion }
