let data = {};
data.definition = 'BranchNodeRnd.gh';
data.inputs = {
    'RH_IN:201:Length':document.getElementById('length').value,
    'RH_IN:201:Count':document.getElementById('count').value,
    'RH_IN:201:Radius':document.getElementById('radius').value
};

rhino3dm().then(async m => {
    console.log('Loaded rhino3dm.');
    rhino = m; // global

    init();
    compute();

});

function compute(){

    // call appserver

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://sta-compute-rhino3d-appserver.herokuapp.com/' + data.definition, true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            // Request finished. Do processing here.

            // hide spinner
            document.getElementById('loader').style.display = 'none';
            
            let result = JSON.parse(xhr.response);
            console.log(result);
            let data = JSON.parse(result.values[0].InnerTree['{ 0; }'][0].data);

            let mesh = rhino.CommonObject.decode(data);
            
            let material = new THREE.MeshNormalMaterial();
            let threeMesh = meshToThreejs(mesh, material);

            // clear meshes from scene
            scene.traverse(child => {
                if(child.type === 'Mesh'){
                    scene.remove(child);
                }
            });

            scene.add(threeMesh);
            
        } else {
            //console.log(this.status);
            if(this.status === 500) console.error(xhr);
        }
    }

    xhr.send(JSON.stringify(data));

}

function onSliderChange(){

    // show spinner
    document.getElementById('loader').style.display = 'block';

    // get slider values
    data.inputs = {
        'RH_IN:201:Length':document.getElementById('length').value,
        'RH_IN:201:Count':document.getElementById('count').value,
        'RH_IN:201:Radius':document.getElementById('radius').value
    };

    compute();
}

// BOILERPLATE //

var scene, camera, renderer, controls;

function init(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(1,1,1);
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 1000 );

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    var canvas = document.getElementById('canvas');
    canvas.appendChild( renderer.domElement );

    controls = new THREE.OrbitControls( camera, renderer.domElement  );

    camera.position.z = 50;

    window.addEventListener( 'resize', onWindowResize, false );

    animate();
}

var animate = function () {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
};
  
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    animate();
}

function meshToThreejs(mesh, material) {
    let loader = new THREE.BufferGeometryLoader();
    var geometry = loader.parse(mesh.toThreejsJSON());
    return new THREE.Mesh(geometry, material);
}