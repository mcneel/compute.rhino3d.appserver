## Client code

Please review the [example code](/example) we include in this repository.

To solve a GH definition you need to pass the definition name and input values to the appserver:

```javascript
// set the input values:
let data = {}
data.definition = 'BranchNodeRnd.gh'
data.inputs = {
  'Count': 10,
  'Radius': 5,
  'Length': 3
}

// call appserver
compute()

async function compute(){
  
  const request = {
    'method':'POST',
    'body': JSON.stringify(data),
    'headers': {'Content-Type': 'application/json'}
  }

  const url = 'https://{your-compute-appserver}/solve'

  let response = await fetch(url, request)

  //...//
}
```
