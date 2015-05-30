function renderSite(canvas, json) {	
    // canvas: the output canvas DOM element
    // json  : the configuration json object
    var renderer = new THREE.WebGLRenderer({ antialias : true });
    renderer.setClearColor(new THREE.Color('lightgrey'), 1);
    renderer.setSize( canvas.clientWidth, canvas.clientHeight );
    canvas.appendChild( renderer.domElement );

    // array of functions for the rendering loop
    var onRenderFcts= [];

    // init scene and camera
    var scene	= new THREE.Scene();
    var camera	= new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.01, 1000);
    camera.position.z = 400;
    camera.target = new THREE.Vector3( 1, 0, 0 );

    var controls = new THREE.OrbitControls(camera, canvas);
    controls.rotateSpeed = -1;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.noZoom = true;
    controls.noPan = true;
    controls.autorotate = true;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
/*
    var geometry = new THREE.BoxGeometry( 200, 200, 200 );
    var texture = THREE.ImageUtils.loadTexture( '/img/crate.gif' );
    texture.anisotropy = renderer.getMaxAnisotropy();
    var material = new THREE.MeshBasicMaterial( { map: texture } );
*/
/*
*/
    var geometry = new THREE.SphereGeometry( 500, 60, 40 );
    geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
    console.log(json);
    var texture = THREE.ImageUtils.loadTexture( json.img );
    var material = new THREE.MeshBasicMaterial( { map: texture } );

                
    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    // handle window resize
    canvas.addEventListener('resize', function(){
        renderer.setSize( canvas.clientWidth, canvas.clientHeight );
        camera.aspect	= canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();		
    }, false);

    // render the scene
    onRenderFcts.push(function(){
        renderer.render( scene, camera );		
    });

    // run the rendering loop
    var lastTimeMsec= null;
    requestAnimationFrame(function animate(nowMsec){
        // keep looping
        requestAnimationFrame( animate );
        // measure time
        lastTimeMsec	= lastTimeMsec || nowMsec-1000/60;
        var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec);
        lastTimeMsec	= nowMsec;
        // call each update function
        onRenderFcts.forEach(function(onRenderFct){
            onRenderFct(deltaMsec/1000, nowMsec/1000);
        });
    });
}
