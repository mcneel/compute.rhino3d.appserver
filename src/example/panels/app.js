/* eslint no-undef: "off", no-unused-vars: "off" */
let data = {}
data.definition = 'srf_kmeans.gh'
data.inputs = {
  'int_k':document.getElementById('clusters').valueAsNumber,
  'int_dimension':document.getElementById('dimension').valueAsNumber,
  'int_resolution':document.getElementById('resolution').valueAsNumber,
  'num_x':document.getElementById('x').valueAsNumber,
  'num_y':document.getElementById('y').valueAsNumber
}

let _threeMesh, _threeMaterial, rhino

rhino3dm().then(async m => {
  console.log('Loaded rhino3dm.')
  rhino = m // global

  init()
  compute()
})

/**
 * Call appserver
 */
async function compute(){

  console.log(data.inputs)

  const request = {
    'method':'POST',
    'body': JSON.stringify(data),
    'headers': {'Content-Type': 'application/json'}
  }

  try {
    const response = await fetch('/solve', request)

    if(!response.ok)
      throw new Error(response.statusText)

    const responseJson = await response.json()

    // Request finished. Do processing here.

    // hide spinner
    document.getElementById('loader').style.display = 'none'

    // process mesh
    let mesh_data = JSON.parse(responseJson.values[0].InnerTree['{ 0; }'][0].data)
    let mesh = rhino.CommonObject.decode(mesh_data)
 
    if (!_threeMaterial) {
      _threeMaterial = new THREE.MeshBasicMaterial({vertexColors:true, side:2})
    }
    let threeMesh = meshToThreejs(mesh, _threeMaterial)
    mesh.delete()
    replaceCurrentMesh(threeMesh)

    //process data
    let cluster_data = responseJson.values[1].InnerTree['{ 0; }'].map(d=>d.data)
    console.log(cluster_data)

    //process colors
    let color_data = responseJson.values[2].InnerTree['{ 0; }'].map( d=> {

      return 'rgb(' + JSON.parse(d.data) + ')'

    })
    console.log(color_data)

    //add legend
    let legend = document.getElementById('legend')
    if(!legend){
      legend = document.createElement("div")
      legend.id = 'legend'
      legend.style.width = '30px'
      legend.style.zIndex = 2
      legend.style.position = 'relative'
      document.body.appendChild(legend)
    } else {
      while (legend.firstChild) {
        legend.removeChild(legend.lastChild);
      }
    }

    for(let i = 0; i < cluster_data.length; i++) {

      let div = document.createElement("div")
      div.innerHTML = cluster_data[i]
      div.style.color = 'white'
      div.style.width = '30px'
      div.style.height = '30px'
      div.style.backgroundColor = color_data[i]
      legend.appendChild(div)
    }
  } catch(error){
    console.error(error)
  }
}

/**
 * Called when a slider value changes in the UI. Collect all of the
 * slider values and call compute to solve for a new scene
 */
function onSliderChange () {
  // show spinner
  document.getElementById('loader').style.display = 'block'

  // get slider values
  data.inputs = {
    'int_k':document.getElementById('clusters').valueAsNumber,
    'int_dimension':document.getElementById('dimension').valueAsNumber,
    'int_resolution':document.getElementById('resolution').valueAsNumber,
    'num_x':document.getElementById('x').valueAsNumber,
    'num_y':document.getElementById('y').valueAsNumber
  }
  compute()
}

// BOILERPLATE //

var scene, camera, renderer, controls

function init () {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(1,1,1)
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 1000 )

  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setPixelRatio( window.devicePixelRatio )
  renderer.setSize( window.innerWidth, window.innerHeight )
  let canvas = document.getElementById('canvas')
  canvas.appendChild( renderer.domElement )

  controls = new THREE.OrbitControls( camera, renderer.domElement  )

  camera.position.z = 50

  window.addEventListener( 'resize', onWindowResize, false )

  animate()
}

var animate = function () {
  requestAnimationFrame( animate )
  controls.update()
  renderer.render( scene, camera )
}
  
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize( window.innerWidth, window.innerHeight )
  animate()
}

function replaceCurrentMesh (threeMesh) {
  if (_threeMesh) {
    scene.remove(_threeMesh)
    _threeMesh.geometry.dispose()
  }
  _threeMesh = threeMesh
  scene.add(_threeMesh)

}

function meshToThreejs (mesh, material) {
  let loader = new THREE.BufferGeometryLoader()
  var geometry = loader.parse(mesh.toThreejsJSON())
  return new THREE.Mesh(geometry, material)
}
