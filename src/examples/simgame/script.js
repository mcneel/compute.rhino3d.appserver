import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader'
import rhino3dm from 'https://cdn.jsdelivr.net/npm/rhino3dm@7.14.0/rhino3dm.module.js'

/* eslint no-undef: "off", no-unused-vars: "off" */

const loader = new Rhino3dmLoader()
loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@7.14.0/' )

const definition = 'simgame.gh'

// setup input change events
const window1_slider = document.getElementById( 'RH_IN:window1' )
window1_slider.addEventListener( 'mouseup', onSliderChange, false )
window1_slider.addEventListener( 'touchend', onSliderChange, false )
const window2_slider = document.getElementById( 'RH_IN:window2' )
window2_slider.addEventListener( 'mouseup', onSliderChange, false )
window2_slider.addEventListener( 'touchend', onSliderChange, false )
const window3_slider = document.getElementById( 'RH_IN:window3' )
window3_slider.addEventListener( 'mouseup', onSliderChange, false )
window3_slider.addEventListener( 'touchend', onSliderChange, false )

// load the rhino3dm library
let rhino, doc
rhino3dm().then(async m => {
  console.log('Loaded rhino3dm.')
  rhino = m // global

  init()
  compute()
})



let _threeMesh, _threeMaterial

/**
 * Call appserver
 */
async function compute(){
  let t0 = performance.now()
  const timeComputeStart = t0

  // collect data from inputs
  let data = {}
  data.definition = definition  
  data.inputs = {
    'RH_IN:window1': window1_slider.valueAsNumber,
    'RH_IN:window2': window2_slider.valueAsNumber,
    'RH_IN:window3': window3_slider.valueAsNumber,
  }

  console.log(data)
  //console.log(data.inputs)

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

    collectResults(responseJson)

    // Request finished. Do processing here.
    let t1 = performance.now()
    const computeSolveTime = t1 - timeComputeStart
    t0 = t1

    // hide spinner
    //document.getElementById('loader').style.display = 'none'
    //showSpinner(false)
    //console.log(responseJson.values[0])
    //let data = JSON.parse(responseJson.values[0].InnerTree['{0}'][0].data)
    //let mesh = rhino.DracoCompression.decompressBase64String(data)
      
    t1 = performance.now()
    const decodeMeshTime = t1 - t0
    t0 = t1
/*
    if (!_threeMaterial) {
      _threeMaterial = new THREE.MeshNormalMaterial()
    }
    
    let threeMesh = meshToThreejs(mesh, _threeMaterial)
    mesh.delete()
    replaceCurrentMesh(threeMesh)
*/
    t1 = performance.now()
    const rebuildSceneTime = t1 - t0

    //console.group(`[call compute and rebuild scene] = ${Math.round(t1-timeComputeStart)} ms`)
    //console.log(`[call compute and rebuild scene] = ${Math.round(t1-timeComputeStart)} ms`)
    console.log(` ${Math.round(computeSolveTime)} ms: appserver request`)
    /*
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
   
   // console.log(`  .. ${Math.round(computeSolveTime - sum)} ms: local<->appserver network latency`)
    console.log(`  ${Math.round(decodeMeshTime)} ms: decode json to rhino3dm mesh`)
    console.log(`  ${Math.round(rebuildSceneTime)} ms: create threejs mesh and insert in scene`)
     */
    //console.groupEnd()

  } catch(error) {
    console.error(error)
  }
  
}

/**
 * Parse response
 */
 function collectResults(responseJson) {

  const values = responseJson.values
  console.log(values)
  // clear doc
  if( doc !== undefined)
      doc.delete()

  
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
          const objAttributes = new rhino.ObjectAttributes()
          objAttributes.name = values[i]["ParamName"]
          doc.objects().add(rhinoObject, objAttributes)
        }
      }
    }
  }


/*
  if (doc.objects().count < 1) {
    console.error('No rhino objects to load!')
    showSpinner(false)
    return
  }
*/


//Three.js material definitions for Simulation Game model
var mat_wall_transparent = new THREE.MeshPhongMaterial( { color: "white", transparent:true, opacity: 0.2 } );
var mat_wall_solid = new THREE.MeshPhongMaterial( { color: "white" } );
var mat_floor = new THREE.MeshPhongMaterial( { color: "white" } );
var mat_window_glass = new THREE.MeshPhongMaterial( { color: "white", transparent:true, opacity: 0.2 } );
var mat_window_frame = new THREE.MeshPhongMaterial( { color: "gray" } );
var mat_window_wall = new THREE.MeshPhongMaterial( { color: "white", transparent:true, opacity: 0.5 } );
var mat_desk_screen = new THREE.MeshPhongMaterial( { color: "black" } );
var mat_desk_plastic = new THREE.MeshPhongMaterial( { color: "gray" } );
var mat_desk_desktop = new THREE.MeshPhongMaterial( { color: "gray" } );
var mat_desk_fabric = new THREE.MeshPhongMaterial( { color: "gray" } );
var mat_desk_legs = new THREE.MeshPhongMaterial( { color: "gray" } );
var mat_desk_keyboard = new THREE.MeshPhongMaterial( { color: "black" } );
var mat_undefined = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0xff0000 ) } );

  // load rhino doc into three.js scene
  const buffer = new Uint8Array(doc.toByteArray()).buffer
  loader.parse( buffer, function ( object ) 
  {
      //add material to resulting meshes
      object.traverse( child => {
        if (child.name == 'RH_OUT:walls_ext_active'){
          child.material = (mat_wall_transparent)}
        else if (child.name == 'RH_OUT:walls_ext_inactive'){
          child.material = (mat_wall_solid)}
        else if (child.name == 'RH_OUT:floor'){
          child.material = (mat_floor)}
        else if (child.name == 'RH_OUT:window_frame'){
          child.material = (mat_window_frame)}
        else if (child.name == 'RH_OUT:window_wall'){
          child.material = (mat_window_wall)}
        else if (child.name == 'RH_OUT:window_glass'){
          child.material = (mat_window_glass)}
        else if (child.name == 'RH_OUT:desk_screen'){
          child.material = (mat_desk_screen)}
        else if (child.name == 'RH_OUT:desk_plastic'){
          child.material = (mat_desk_plastic)}
        else if (child.name == 'RH_OUT:desk_desktop'){
          child.material = (mat_desk_desktop)}
        else if (child.name == 'RH_OUT:desk_legs_desk'){
          child.material = (mat_desk_legs)}
        else if (child.name == 'RH_OUT:desk_legs_chair'){
          child.material = (mat_desk_legs)}
        else if (child.name == 'RH_OUT:desk_fabric'){
          child.material = (mat_desk_fabric)}
        else if (child.name == 'RH_OUT:desk_keyboard'){
          child.material = (mat_desk_keyboard)}
        else if (child.name == 'RH_OUT:grid_daylight'){
          //pass
        }
        else if (child.name == 'RH_OUT:grid_glare'){
          //pass
        }
        else {
          child.material = (mat_undefined)
          console.log("Assigned an undefined material!")}
       } )
             // clear objects from scene. do this here to avoid blink
      scene.traverse(child => {
        if (!child.isLight && child.name !== 'context') {
            scene.remove(child)
        }
    })
      // add object graph from rhino model to three.js scene
      scene.add( object )
      //console.log(object)

      // hide spinner and enable download button
      showSpinner(false)
      //downloadButton.disabled = false

      // zoom to extents
      //zoomCameraToSelection(camera, controls, scene.children)
  })
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
 * Called when a slider value changes in the UI. Collect all of the
 * slider values and call compute to solve for a new scene
 */
function onSliderChange () {
  // show spinner
  showSpinner(true)
  compute()
}

// BOILERPLATE //

var scene, camera, renderer, controls, directional_light

function init () {
  // Rhino models are z-up, so set this as the default
  THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );

  scene = new THREE.Scene()
  scene.background = new THREE.Color(1,1,1)
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 1000 )
  directional_light = new THREE.DirectionalLight( 0xffffff, 2.5 );
  scene.add( directional_light );

  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setPixelRatio( window.devicePixelRatio )
  renderer.setSize( window.innerWidth, window.innerHeight )
  document.body.appendChild(renderer.domElement)

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

function meshToThreejs (mesh, material) {
  const threeloader = new THREE.BufferGeometryLoader()
  const geometry = threeloader.parse(mesh.toThreejsJSON())
  return new THREE.Mesh(geometry, material)
}