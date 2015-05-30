function renderSiteGridFS(canvas) {	
    // canvas: the output canvas DOM element
    canvas.style.position = 'relative';

    var inScope = false,
        isUserInteracting = false,
        onMouseDownMouseX = 0, onMouseDownMouseY = 0,
        lon = 0, onMouseDownLon = 0,
        lat = 0, onMouseDownLat = 0,
        phi = 0, theta = 0;

    var renderer = new THREE.WebGLRenderer({ antialias : true });
    renderer.setClearColor(new THREE.Color('lightgrey'), 1);
    renderer.setSize( canvas.clientWidth, canvas.clientHeight );
    canvas.appendChild( renderer.domElement );

    // init scene and camera
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.01, 1000);
    camera.target = new THREE.Vector3( 0, 0, 0 );

    var geometry = new THREE.SphereGeometry( 500, 60, 40 );
    geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
    var texture = THREE.ImageUtils.loadTexture( '/gridfs/21.jpg' );
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    var spherefaces	= [];
    spherefaces.push(mesh);
    console.log('there are ' + spherefaces.length + ' faces');

    // listeners
    canvas.addEventListener('resize', function(){
        renderer.setSize( canvas.clientWidth, canvas.clientHeight );
        camera.aspect	= canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();		
    }, false);

    canvas.addEventListener( 'mouseenter', function(event){
        inScope = true;
        isUserInteracting = false;
    }, false );

    canvas.addEventListener( 'mouseleave', function(event){
        inScope = false;
        isUserInteracting = false;
    }, false );

    canvas.addEventListener( 'mousemove', function(event){
        if (!inScope) { return; }                                                       //          ^  
        if ( isUserInteracting === true ) {
            lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
            lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
        }        
    }, false );

    canvas.addEventListener( 'mousedown', function(event){
        if (!inScope) { return; }
        event.preventDefault();
        isUserInteracting = true;
        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;
        onPointerDownLon = lon;
        onPointerDownLat = lat;
    }, false );

    canvas.addEventListener( 'mouseup', function(event){
        if (!inScope) { return; }
        isUserInteracting = false;
    }, false );

    function onDocumentMouseWheel( event ) {
        if (!inScope) { return; }
        // WebKit
        if ( event.wheelDeltaY ) {
            camera.fov -= event.wheelDeltaY * 0.05;
            // Opera / Explorer 9
        } else if ( event.wheelDelta ) {
            camera.fov -= event.wheelDelta * 0.05;
            // Firefox
        } else if ( event.detail ) {
            camera.fov += event.detail * 1.0;
        }
        if (camera.fov < 15) { camera.fov = 15; }
        if (camera.fov > 95) { camera.fov = 95; }
        camera.updateProjectionMatrix();
    }

    canvas.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
    canvas.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false);

    // array of functions for the rendering loop
    var onRenderFcts= [];

    // update the lon/lat
    onRenderFcts.push(function(){
        if (lon <  0 ) { lon += 360; }
        if (lon > 360) { lon -= 360; }
        lat = Math.max( - 85, Math.min( 85, lat ) );

        poi.lon = lon;
        poi.lat = lat;

        // lon,lat (in degree) ==> theta,phi (in radian)
        theta = THREE.Math.degToRad( lon );
        phi = THREE.Math.degToRad( 90 - lat );
        camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
        camera.target.y = 500 * Math.cos( phi );
        camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );
        camera.lookAt( camera.target );
    });

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

