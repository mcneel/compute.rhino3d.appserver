/* eslint no-undef: "off", no-unused-vars: "off" */

import * as THREE from 'https://unpkg.com/three@0.121.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.121.1/examples/jsm/controls/OrbitControls.js';

['count'].forEach(element => {
  document.getElementById(element).onmouseup = onSliderChange
  document.getElementById(element).ontouchend = onSliderChange
});

document.getElementById('explode').onclick = onSliderChange

let data = {
  definition: 'dresser3.gh',
  inputs: {
    'num': document.getElementById('count').valueAsNumber,
    'explode': document.getElementById('explode').checked
  }
}

let _threeMesh, _threeMaterial, rhino

// rhino3dm loads asynchronously, so we need to wait for it...
rhino3dm().then(async m => {
  console.log('Loaded rhino3dm.')
  rhino = m // global

  init()
  compute()
})

/**
 * Call appserver
 */
async function compute() {

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

    // hide spinner
    document.getElementById('loader').style.display = 'none'

    // get mesh
    let data = JSON.parse(responseJson.values[0].InnerTree['{ 0; }'][0].data)
    let mesh = rhino.CommonObject.decode(data)

    mesh.scale(0.1)

    if (!_threeMaterial) {
      _threeMaterial = new THREE.MeshNormalMaterial()
    }

    let threeMesh = meshToThreejs(mesh, _threeMaterial)
    replaceCurrentMesh(threeMesh)

    zoomCameraToSelection(camera, controls, [ threeMesh ])

    mesh.delete()

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

  // get slider values
  data.inputs = {
    'num': document.getElementById('count').valueAsNumber,
    'explode': document.getElementById('explode').checked
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
  var geometry = loader.parse(mesh.toThreejsJSON(true))
  return new THREE.Mesh(geometry, material)
}

function zoomCameraToSelection( camera, controls, selection, fitOffset = 1.2 ) {
  
  const box = new THREE.Box3();
  
  for( const object of selection ) box.expandByObject( object );
  
  const size = box.getSize( new THREE.Vector3() );
  const center = box.getCenter( new THREE.Vector3() );
  
  const maxSize = Math.max( size.x, size.y, size.z );
  const fitHeightDistance = maxSize / ( 2 * Math.atan( Math.PI * camera.fov / 360 ) );
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = fitOffset * Math.max( fitHeightDistance, fitWidthDistance );
  
  const direction = controls.target.clone()
    .sub( camera.position )
    .normalize()
    .multiplyScalar( distance );

  controls.maxDistance = distance * 10;
  controls.target.copy( center );
  
  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();

  camera.position.copy( controls.target ).sub(direction);
  
  controls.update();
  
}
