## Client code

To solve a GH definition you need to pass the definition name and input values to the appserver:

```javascript
// set the input values:
let data = {
  definition: 'BranchNodeRnd.gh',
  inputs: {
    'RH_IN:201:Length':document.getElementById('length').value,
    'RH_IN:201:Count':document.getElementById('count').value,
    'RH_IN:201:Radius':document.getElementById('radius').value
  }
}

let xhr = new XMLHttpRequest()
xhr.open('POST', 'https://{your-compute-appserver}/solve', true)

// Send the proper header information along with the request
xhr.setRequestHeader("Content-Type", "application/json")

xhr.onreadystatechange = function() { // Call a function when the state changes.

    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        // Request finished. Do processing here.  
        let result = JSON.parse(xhr.response)
        let data = JSON.parse(result.values[0].InnerTree['{ 0; }'][0].data);
        let mesh = rhino.CommonObject.decode(data)
    }
}

xhr.send(JSON.stringify(data))
```
