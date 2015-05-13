function renderSite(canvas, json) {	
    // canvas: the output canvas DOM element
    // json  : the configuration json object

    var renderer = new THREE.WebGLRenderer({ antialias : true });
//    renderer.setClearColor(new THREE.Color('lightgrey'), 1); //    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( canvas.clientWidth, canvas.clientHeight );
    canvas.appendChild( renderer.domElement );

    // array of functions for the rendering loop
    var onRenderFcts= [];

    // init scene and camera
    var scene   = new THREE.Scene();
    var camera	= new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.01, 20);
    camera.position = new THREE.Vector3( 0, 0, 0 );
    camera.target = new THREE.Vector3( 1, 1, 1 );

//    var controls = new THREE.OrbitControls(camera);

    // mesh
    var geometry = new THREE.SphereGeometry( 1, 60, 40 );
    var material = new THREE.MeshBasicMaterial( {
        map: THREE.ImageUtils.loadTexture( '/img/01.jpg' )
    } );
    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

     // render the scene
    onRenderFcts.push(function(){
        renderer.render( scene, camera );		
    });


/*    
    canvas.addEventListener('resize', function(){
        renderer.setSize( canvas.clientWidth, canvas.clientHeight );
        camera.aspect	= canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();		
    }, false);

    canvas.addEventListener( 'mousedown', function(event){
        event.preventDefault();
        isUserInteracting = true;
        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;
        onPointerDownLon = lon;
        onPointerDownLat = lat;
    }, false );

    canvas.addEventListener( 'mousemove', function(event){
        if ( isUserInteracting === true ) {
            lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
            lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
        }
    }, false );

    canvas.addEventListener( 'mouseup', function(event){
        isUserInteracting = false;
    }, false );
*/
/*    
    function animate() {
        requestAnimationFrame( animate );

        if ( isUserInteracting === false ) {
            lon += 0.1;
        }
        lat = Math.max( - 85, Math.min( 85, lat ) );
        phi = THREE.Math.degToRad( 90 - lat );
        theta = THREE.Math.degToRad( lon );
        camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
        camera.target.y = 500 * Math.cos( phi );
        camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );
        camera.lookAt( camera.target );

        // distortion camera.position.copy( camera.target ).negate();
        renderer.render( scene, camera );
      }
      animate();
*/
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
