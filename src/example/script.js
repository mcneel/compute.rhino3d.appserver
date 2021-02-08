import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/controls/OrbitControls.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/3DMLoader.js'
import rhino3dm from 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js'

/* eslint no-undef: "off", no-unused-vars: "off" */

// setup input change events
const count_slider = document.getElementById( 'count' )
count_slider.addEventListener( 'mouseup', onSliderChange, false )
count_slider.addEventListener( 'touchend', onSliderChange, false )
const radius_slider = document.getElementById( 'radius' )
radius_slider.addEventListener( 'mouseup', onSliderChange, false )
radius_slider.addEventListener( 'touchend', onSliderChange, false )
const length_slider = document.getElementById( 'length' )
length_slider.addEventListener( 'mouseup', onSliderChange, false )
length_slider.addEventListener( 'touchend', onSliderChange, false )

// set up loader for converting the results to threejs
const loader = new Rhino3dmLoader()
loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/' )

// create a few variables to store a reference to the rhino3dm library and to the loaded definition
let rhino, definition, doc

rhino3dm().then(async m => {
  console.log('Loaded rhino3dm.')
  rhino = m // global

  init()
  compute()
})

let data = {}
data.definition = 'BranchNodeRnd.gh'

let _threeMesh, _threeMaterial

/**
 * Call appserver
 */
async function compute(){
  let t0 = performance.now()
  const timeComputeStart = t0

  data.inputs = {
    'Count':document.getElementById('count').valueAsNumber,
    'Radius':document.getElementById('radius').valueAsNumber,
    'Length':document.getElementById('length').valueAsNumber
  }

  console.log(data.inputs)

  const request = {
    'method':'POST',
    'body': JSON.stringify(data),
    'headers': {'Content-Type': 'application/json'}
  }

  let headers = null

  try {
    const response = await fetch('/solve', request)

    if(!response.ok)
      throw new Error(response.statusText)
      
    headers = response.headers.get('server-timing')
    const responseJson = await response.json()

    // Request finished. Do processing here.
    let t1 = performance.now()
    const computeSolveTime = t1 - timeComputeStart
    t0 = t1

    // hide spinner
    document.getElementById('loader').style.display = 'none'
    let data = JSON.parse(responseJson.values[0].InnerTree['{ 0; }'][0].data)
    let mesh = rhino.DracoCompression.decompressBase64String(data)
      
    t1 = performance.now()
    const decodeMeshTime = t1 - t0
    t0 = t1

    if (!_threeMaterial) {
      _threeMaterial = new THREE.MeshNormalMaterial()
    }
    let threeMesh = meshToThreejs(mesh, _threeMaterial)
    mesh.delete()
    replaceCurrentMesh(threeMesh)

    t1 = performance.now()
    const rebuildSceneTime = t1 - t0

    console.log(`[call compute and rebuild scene] = ${Math.round(t1-timeComputeStart)} ms`)
    console.log(`  ${Math.round(computeSolveTime)} ms: appserver request`)
    let timings = headers.split(',')
    let sum = 0
    timings.forEach(element => {
      let name = element.split(';')[0].trim()
      let time = element.split('=')[1].trim()
      sum += Number(time)
      if (name === 'network') {
        console.log(`  .. ${time} ms: appserver<->compute network latency`)
      } else {
        console.log(`  .. ${time} ms: ${name}`)
      }
    })
    console.log(`  .. ${Math.round(computeSolveTime - sum)} ms: local<->appserver network latency`)
    console.log(`  ${Math.round(decodeMeshTime)} ms: decode json to rhino3dm mesh`)
    console.log(`  ${Math.round(rebuildSceneTime)} ms: create threejs mesh and insert in scene`)

  } catch(error) {
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
  scene = new THREE.Scene()
  scene.background = new THREE.Color(1,1,1)
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 1000 )

  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setPixelRatio( window.devicePixelRatio )
  renderer.setSize( window.innerWidth, window.innerHeight )
  let canvas = document.getElementById('canvas')
  canvas.appendChild( renderer.domElement )

  controls = new OrbitControls( camera, renderer.domElement  )

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
