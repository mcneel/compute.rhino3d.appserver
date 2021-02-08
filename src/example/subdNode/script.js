import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/controls/OrbitControls.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/3DMLoader.js'
import rhino3dm from 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js'

// reference the definition
const definitionName = 'rnd_node.gh'

// listen for slider change events
const count_slider = document.getElementById( 'count' )
count_slider.addEventListener( 'mouseup', onSliderChange, false )
const radius_slider = document.getElementById( 'radius' )
radius_slider.addEventListener( 'mouseup', onSliderChange, false )

// setup dl button event
const downloadButton = document.getElementById("downloadButton")
downloadButton.onclick = download

// set up loader for converting the results to threejs
const loader = new Rhino3dmLoader()
loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/' )

// create a few variables to store a reference to the rhino3dm library and to the Rhino Doc
let rhino, doc

rhino3dm().then(async m => {
    rhino = m

    init()
    compute()
    animate()
})

async function compute() {

    // collect data
    let data = {
      definition: definitionName,
      inputs: {
        'count': count_slider.valueAsNumber,
        'radius': radius_slider.valueAsNumber
      }
    }

    // format the request to the AppServer
    const request = {
      'method':'POST',
      'body': JSON.stringify(data),
      'headers': {'Content-Type': 'application/json'}
    }

    // Call AppServer
    try {
      // Notice the short url "/solve". This is because are calling this endpoint from the same site.
      const response = await fetch('/solve', request)
    
      if(!response.ok)
        throw new Error(response.statusText)
  
      const responseJson = await response.json()

      // Convert the result to threejs geometry
      collectResults(responseJson.values)

    } catch(error) {
      console.error(error)
    }

}

function collectResults(values) {

  console.log(values)

    // clear doc
    if( doc !== undefined)
        doc.delete()

    // clear objects from scene
    scene.traverse(child => {
        if (!child.isLight) {
            scene.remove(child)
        }
    })

    // make a new Rhino file
    doc = new rhino.File3dm()

    // go through the data and add the objects to the doc
    for ( let i = 0; i < values.length; i ++ ) {

        const list = values[i].InnerTree['{ 0; }']

        for( let j = 0; j < list.length; j ++) {

            const data = JSON.parse(values[i].InnerTree['{ 0; }'][j].data)
            const rhinoObject = rhino.CommonObject.decode(data)
            doc.objects().add(rhinoObject, null)

        }

    }

    // Load Rino objects to three.js
    const buffer = new Uint8Array(doc.toByteArray()).buffer
    loader.parse( buffer, function ( object ) 
    {
        scene.add( object )
        // hide spinner
        document.getElementById('loader').style.display = 'none'

        // enable download button
        downloadButton.disabled = false
    })
}

function onSliderChange() {

    // show spinner
    document.getElementById('loader').style.display = 'block'

    // disable download button
    downloadButton.disabled = true

    compute()

}

// download button handler
function download () {
    let buffer = doc.toByteArray()
    saveByteArray("node.3dm", buffer)
}

function saveByteArray ( fileName, byte ) {
    let blob = new Blob([byte], {type: "application/octect-stream"})
    let link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = fileName
    link.click()
}

// BOILERPLATE //
// declare variables to store scene, camera, and renderer
let scene, camera, renderer

function init() {

    // Rhino models are z-up, so set this as the default
    THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );

    // create a scene and a camera
    scene = new THREE.Scene()
    scene.background = new THREE.Color(1, 1, 1)
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 10

    // create the renderer and add it to the html
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    // add some controls to orbit the camera
    const controls = new OrbitControls(camera, renderer.domElement)

    // add a directional light
    const directionalLight = new THREE.DirectionalLight( 0xffffff )
    directionalLight.intensity = 2
    scene.add( directionalLight )

    const ambientLight = new THREE.AmbientLight()
    scene.add( ambientLight )

    window.addEventListener( 'resize', onWindowResize, false )

}

// function to continuously render the scene
function animate() {

    requestAnimationFrame(animate)
    renderer.render(scene, camera)

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize( window.innerWidth, window.innerHeight )
  animate()
}
