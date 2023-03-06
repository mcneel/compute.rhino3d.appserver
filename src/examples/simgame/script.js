import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader'
import rhino3dm from 'https://cdn.jsdelivr.net/npm/rhino3dm@7.14.0/rhino3dm.module.js'
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';

// import  GUI from 'lil-gui' 


// Debug
const gui = new GUI();

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

const Room = document.getElementById('RH_IN:RoomNumber');


var PreviousRoomNumber = parseInt(document.getElementById('RoomNumber').textContent);

function addObserverIfDesiredNodeAvailable() {
  const RoomStyle = document.getElementById('RoomNumber');
  //  console.log("RoomR  " + RoomStyle)
  if(!RoomStyle) {
      //The node we need does not exist yet.
      //Wait 500ms and try again
      window.setTimeout(addObserverIfDesiredNodeAvailable,500);
      return;
  }
  
  var RoomStyleObseerver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      const targetDiv = mutation.target;
    const divText = targetDiv.textContent;
    // console.log(divText);
    if(PreviousRoomNumber != parseInt(divText)){
      // console.log(PreviousRoomNumber);
      // console.log(parseInt(divText));
      showSpinner(true);
      compute();
      PreviousRoomNumber = parseInt(divText);
    }else{
       console.log("No changes in RoomNumber detected");
      
    }
    
    });    
  });
  // configuration of the observer:
var config = { attributes: true, childList: true, characterData: true };

// pass in the target node, as well as the observer options
RoomStyleObseerver.observe(RoomStyle, config);
// observer.disconnect();

}
addObserverIfDesiredNodeAvailable();

// Room.addEventListener('change', function() {
//   console.log("tekst");
//   console.log(Room.value);
// });

Room.addEventListener( 'change', function(){
  console.log(Room.value)
  showSpinner(true)
  compute()
}, false )
// Room.addEventListener( 'touchend', onSliderChange, false )

//________________________________________________________________________________
const GridDayLight = document.getElementById('GridDayLight')
GridDayLight.addEventListener('change', function(){

  if(document.getElementById('GridGlare').checked){
    document.getElementById('GridGlare').checked = false;
  }

  scene.traverse(function(child) {
    if (child.name === "RH_OUT:grid_glare") {
        child.visible = false;
    }
  })
  
  scene.traverse(function(child) {
    if (child.name === "RH_OUT:grid_daylight") {
        var Grid = child
        if(GridDayLight.checked){
          Grid.visible = true
        }else{
          Grid.visible = false
        }
    }
  
})
})
const GridGlare = document.getElementById('GridGlare')
GridGlare.addEventListener('change', function(){
  
  if(document.getElementById('GridDayLight').checked){
    document.getElementById('GridDayLight').checked = false;
  }

  scene.traverse(function(child) {
    if (child.name === "RH_OUT:grid_daylight") {
        child.visible = false;
    }
  })


  scene.traverse(function(child) {
    if (child.name === "RH_OUT:grid_glare") {
        var Glare = child
        if(GridGlare.checked){
          
          Glare.visible = true
        }else{
          Glare.visible = false
          
        }
    }
  
})
})

const StartButton = document.getElementById('RH_IN:bool')
StartButton.addEventListener('change', function(){
  //== console.log("simulation")
  document.getElementById('GridDayLight').checked = true
  showSpinner(true)
  compute()
})

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

  // Define data input for Room number
  var RoomNumberInput = parseInt(document.getElementsByClassName('select-selected')[0].textContent);
  let data = {}
  data.definition = definition  
  data.inputs = {
    'RH_IN:window1': window1_slider.valueAsNumber,
    'RH_IN:window2': window2_slider.valueAsNumber,
    'RH_IN:window3': window3_slider.valueAsNumber,
    'RH_IN:bool': StartButton.checked,
    // 'RH_IN:RoomNumber': parseInt(Room.value)
    'RH_IN:RoomNumber': RoomNumberInput


  }

  // console.log(data)
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
    // console.log(` ${Math.round(computeSolveTime)} ms: appserver request`)
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
  // console.log(values)
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
        // console.log(branch[j])
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


 /**
 * Update all materials
 */
 const updateAllMaterials = () =>
 {
   var i = 0;
     scene.traverse((child) =>
     {
         if( child.material instanceof THREE.MeshStandardMaterial)
         {
             // chisld.material.envMap = environmentMap
             child.material.envMapIntensity = 5
             child.castShadow = true
             //child.receiveShadow = true
             i = i + 1;
         }
         
     })
     console.log("materiasl all updated " + i)
     console.log(scene)
 }



//Three.js material definitions for Simulation Game model
var mat_wall_transparent = new THREE.MeshStandardMaterial( { color: "white"} );
// var mat_wall_transparent = new THREE.MeshStandardMaterial( { color: "white", transparent:true, opacity: 0.2 } );
var mat_wall_solid = new THREE.MeshStandardMaterial( { color: "white"  } );
var mat_floor = new THREE.MeshStandardMaterial( { color: "white" , side: THREE.DoubleSide}, );
var mat_window_glass = new THREE.MeshStandardMaterial( { color: "white", transparent:true, opacity: 0.2 } );
var mat_window_frame = new THREE.MeshStandardMaterial( { color: "gray" } );
var mat_window_wall = new THREE.MeshStandardMaterial( { color: new THREE.Color( 0x1757bf ), side: THREE.DoubleSide} );
var mat_desk_screen = new THREE.MeshStandardMaterial( { color: "black" } );
var mat_desk_plastic = new THREE.MeshStandardMaterial( { color: new THREE.Color(0x70baff) } );
var mat_desk_desktop = new THREE.MeshStandardMaterial( { color: new THREE.Color(0xccfbff) } );
var mat_desk_fabric = new THREE.MeshStandardMaterial( { color: new THREE.Color(0x4ad2ff) } );
var mat_desk_legs = new THREE.MeshStandardMaterial( { color: new THREE.Color(0x0074d9) } );
var mat_desk_keyboard = new THREE.MeshStandardMaterial( { color: new THREE.Color(0x0057a8) } );
var mat_undefined = new THREE.MeshStandardMaterial( { color: new THREE.Color( 0xff0000 ) } );
var grid = new THREE.MeshStandardMaterial({vertexColors: true, opacity: 0.55, transparent: true, depthTest: false});
var glare = new THREE.MeshStandardMaterial({vertexColors: true, opacity: 0.55, transparent: true, depthTest: false});
var text = new THREE.MeshStandardMaterial( { color: "blue" } );
var NorthSymbol = new THREE.MeshStandardMaterial({color: new THREE.Color(0x0055de), side: THREE.DoubleSide});
var wallLines = new THREE.MeshPhongMaterial({color:"white", emissive: "white", emissiveIntensity: 4});



  // load rhino doc into three.js scene
  const buffer = new Uint8Array(doc.toByteArray()).buffer
  loader.parse( buffer, function ( object ) 
  {
      //add material to resulting meshes
      object.traverse( child => {
        if (child.name == 'RH_OUT:walls_ext_active'){
          child.material = (mat_wall_transparent)
          child.castShadow = true;
        
      }
        else if (child.name == 'RH_OUT:walls_ext_inactive'){
          child.material = (mat_wall_solid)
          child.castShadow = true;
        
      }
        else if (child.name == 'RH_OUT:floor'){
          child.material = (mat_floor)
          child.receiveShadow = true;
          child.material.shadowSide = THREE.FrontSide;
        }
        else if (child.name == 'RH_OUT:window_frame'){
          child.material = (mat_window_frame)
          child.castShadow = false
          child.receiveShadow = false
      }
        else if (child.name == 'RH_OUT:window_wall'){
          child.material = (mat_window_wall)
          child.castShadow = false
          child.receiveShadow = false
        }
        else if (child.name == 'RH_OUT:window_glass'){
          child.material = (mat_window_glass)
          child.castShadow = false
          child.receiveShadow = false}
        else if (child.name == 'RH_OUT:desk_screen'){
          child.material = (mat_desk_screen)
          
          
        }
        else if (child.name == 'RH_OUT:desk_plastic'){
          child.material = (mat_desk_plastic)
          
          
        }
        else if (child.name == 'RH_OUT:desk_desktop'){
          child.material = (mat_desk_desktop)
        }
        else if (child.name == 'RH_OUT:desk_legs_desk'){
          child.material = (mat_desk_legs)
          
          
        }
        else if (child.name == 'RH_OUT:desk_legs_chair'){
          child.material = (mat_desk_legs)
          
          
        }
        else if (child.name == 'RH_OUT:desk_fabric'){
          child.material = (mat_desk_fabric)
          
          
      }
        else if (child.name == 'RH_OUT:desk_keyboard'){
          child.material = (mat_desk_keyboard)}
        else if (child.name == 'RH_OUT:grid_daylight'){
          child.material = (grid);
          //Grid.visible = true
        }else if(child.name == 'RH_OUT:North'){
          child.material = (NorthSymbol)
          child.receiveShadow = false;
          child.castShadow = false;
        }
        else if (child.name == 'RH_OUT:grid_glare'){
          //pass
          child.material = (glare);
          child.visible = false;
        }else if (child.name == 'RH_OUT:text'){
          child.material = (text);
        }else if (child.name == 'RH_OUT:walls_lines'){
          child.material = wallLines;
          child.receiveShadow = false;
          child.castShadow = false;
        }else {
          child.material = (mat_undefined)
          console.log("Assigned an undefined material!")
        }

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

      updateAllMaterials();

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
  //Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x95ECFA)


  camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 1000 )

  //environmentlight

  const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  'assets/2/px.jpg',
  'assets/2/nx.jpg',
  'assets/2/py.jpg',
  'assets/2/ny.jpg',
  'assets/2/pz.jpg',
  'assets/2/nz.jpg'
])


environmentMap.encoding = THREE.sRGBEncoding
//scene.environment = environmentMap


  //
  // directional_light = new THREE.DirectionalLight( 0xffffff, 2.5 );
  // directional_light.shadow.camera.near = 0.1;
  // directional_light.shadow.camera.far = 10;
  // directional_light.position.set(0, 5, 5);
  // scene.add( directional_light );

  //Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight);
// gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
 directionalLight.castShadow = true

directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024

 directionalLight.shadow.camera.near = 3
 directionalLight.shadow.camera.far = 40

directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 10
directionalLight.shadow.camera.bottom = - 10
directionalLight.shadow.camera.left = - 10

directionalLight.position.set(15, 10, 25)

 directionalLight.shadow.bias = -0.0001;


scene.add(directionalLight);

const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
directionalLightCameraHelper.visible = false
scene.add(directionalLightCameraHelper)

// gui.add(directionalLight, 'intensity').min(0).max(2).step(0.001)
// gui.add(directionalLight.position, 'x').min(- 50).max(50).step(0.01)
// gui.add(directionalLight.position, 'y').min(- 50).max(50).step(0.01)
// gui.add(directionalLight.position, 'z').min(- 50).max(50).step(0.01)
// gui.add(directionalLight.shadow.camera, 'top').min(- 50).max(50).step(0.05)
// gui.add(directionalLight.shadow.camera, 'right').min(- 50).max(50).step(0.05)
// gui.add(directionalLight.shadow.camera, 'bottom').min(- 50).max(50).step(0.05)
// gui.add(directionalLight.shadow.camera, 'left').min(- 50).max(50).step(0.05)


  

  renderer = new THREE.WebGLRenderer({antialias: true})
  // renderer.shadowMap.enabled = true;
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio( window.devicePixelRatio )
  renderer.setSize( window.innerWidth, window.innerHeight )
  document.body.appendChild(renderer.domElement)
   

  controls = new OrbitControls( camera, renderer.domElement  )
  controls.enableDamping = true
 
  // camera.position.x = 5;
  camera.position.y = -10;
  camera.position.z = 25;
  camera.lookAt(new THREE.Vector3(6,6,0));

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