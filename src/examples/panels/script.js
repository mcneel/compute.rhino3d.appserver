/* eslint no-undef: "off", no-unused-vars: "off" */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader'
import rhino3dm from 'rhino3dm'

// set up loader for converting the results to threejs
const loader = new Rhino3dmLoader()
loader.setLibraryPath( 'https://unpkg.com/rhino3dm@8.0.0-beta/' )

const definition = 'srf_kmeans.gh'

// setup input change events
const clusters_slider = document.getElementById( 'clusters' )
clusters_slider.addEventListener( 'mouseup', onSliderChange, false )
clusters_slider.addEventListener( 'touchend', onSliderChange, false )
const dimension_slider = document.getElementById( 'dimension' )
dimension_slider.addEventListener( 'mouseup', onSliderChange, false )
dimension_slider.addEventListener( 'touchend', onSliderChange, false )
const resolution_slider = document.getElementById( 'resolution' )
resolution_slider.addEventListener( 'mouseup', onSliderChange, false )
resolution_slider.addEventListener( 'touchend', onSliderChange, false )
const x_slider = document.getElementById( 'x' )
x_slider.addEventListener( 'mouseup', onSliderChange, false )
x_slider.addEventListener( 'touchend', onSliderChange, false )
const y_slider = document.getElementById( 'y' )
y_slider.addEventListener( 'mouseup', onSliderChange, false )
y_slider.addEventListener( 'touchend', onSliderChange, false )

let _threeMesh, _threeMaterial, doc

const rhino = await rhino3dm()
console.log('Loaded rhino3dm.')

init()
compute()

/**
 * Call appserver
 */
async function compute(){

  // initialise 'data' object that will be used by compute()
  const data = {
    definition: definition,
    inputs: {
      'int_k':document.getElementById('clusters').valueAsNumber,
      'int_dimension':document.getElementById('dimension').valueAsNumber,
      'int_resolution':document.getElementById('resolution').valueAsNumber,
      'num_x':document.getElementById('x').valueAsNumber,
      'num_y':document.getElementById('y').valueAsNumber  
    }
  }

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

    // process mesh
    console.log(responseJson.values)

    const rhinoObject = decodeItem(responseJson.values[0].InnerTree['{0}'][0])
    console.log(rhinoObject)
    let threeMesh = meshToThreejs(rhinoObject, new THREE.MeshBasicMaterial({vertexColors:true}))
    replaceCurrentMesh(threeMesh)
    

    let cluster_data = responseJson.values[1].InnerTree['{0;0}'].map(d=>d.data)
    console.log(cluster_data)

    //process colors
    let color_data = responseJson.values[2].InnerTree['{0}'].map( d=> {

      return 'rgb(' + JSON.parse(d.data) + ')'

    })
    console.log(color_data)

    const overlay = document.getElementById('overlay')

    //add legend
    let legend = document.getElementById('legend')
    if(!legend){
      legend = document.createElement("div")
      legend.id = 'legend'
      legend.style.width = '30px'
      legend.style.zIndex = 2
      legend.style.position = 'relative'
      overlay.appendChild(legend)
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

    document.getElementById('loader').style.display = 'none'
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
  compute()
}

// BOILERPLATE //

var scene, camera, renderer, controls

function init () {

  // Rhino models are z-up, so set this as the default
  THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );

  scene = new THREE.Scene()
  scene.background = new THREE.Color(1,1,1)
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 1000 )

  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setPixelRatio( window.devicePixelRatio )
  renderer.setSize( window.innerWidth, window.innerHeight )
  document.body.appendChild(renderer.domElement)

  controls = new OrbitControls( camera, renderer.domElement  )

  camera.position.z = 50

  window.addEventListener( 'resize', onWindowResize, false )

  animate()
}

function animate () {
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

/**
 * Parse response
 */
 function collectResults(responseJson) {

  const values = responseJson.values

  // clear doc
  if( doc !== undefined)
      doc.delete()

  //console.log(values)
  doc = new rhino.File3dm()

  // for each output (RH_OUT:*)...
  for ( let i = 0; i < values.length; i ++ ) {
    // ...iterate through data tree structure...
    for (const path in values[i].InnerTree) {
      const branch = values[i].InnerTree[path]
      // ...and for each branch...
      for( let j = 0; j < branch.length; j ++) {
        // ...load rhino geometry into doc
        const rhinoObject = decodeItem(branch[j])
        if (rhinoObject !== null) {
          doc.objects().add(rhinoObject, null)
        }
      }
    }
  }

  if (doc.objects().count < 1) {
    console.error('No rhino objects to load!')
    showSpinner(false)
    return
  }

  // load rhino doc into three.js scene
  const buffer = new Uint8Array(doc.toByteArray()).buffer
  loader.parse( buffer, function ( object ) 
  {
      // debug 
      /*
      object.traverse(child => {
        if (child.material !== undefined)
          child.material = new THREE.MeshNormalMaterial()
      }, false)
      */

      // clear objects from scene. do this here to avoid blink
      scene.traverse(child => {
          if (!child.isLight && child.name !== 'context') {
              scene.remove(child)
          }
      })

      // add object graph from rhino model to three.js scene
      scene.add( object )

      // hide spinner and enable download button
      showSpinner(false)
      downloadButton.disabled = false

      // zoom to extents
      zoomCameraToSelection(camera, controls, scene.children)
  }, (error) => {
    console.error(error)
  })
}

/**
* Attempt to decode data tree item to rhino geometry
*/
function decodeItem(item) {
const data = JSON.parse(item.data)
if (item.type === 'System.String') {
  // hack for draco meshes
  try {
      return rhino.DracoCompression.decompressBase64String(data)
  } catch {} // ignore errors (maybe the string was just a string...)
} else if (typeof data === 'object') {
  return rhino.CommonObject.decode(data)
}
return null
}

/**
 * Shows or hides the loading spinner
 */
 function showSpinner(enable) {
  if (enable)
    document.getElementById('loader').style.display = 'block'
  else
    document.getElementById('loader').style.display = 'none'
}
