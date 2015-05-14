function renderSite(canvas, site, poi) {	
    // canvas: the output canvas DOM element
    // site  : the configuration site object
    // poi   : the poi output

    canvas.style.position = 'relative';

    var loc = document.createElement('div');
    loc.style.border = '1px solid red';
    loc.style.position = "absolute";
    loc.style.bottom = "1px";
    loc.style.right = "1px";
//    loc.style.cursor = "pointer";
    loc.style.pointerEvents = "auto";
    loc.style.opacity = "0.5";
    loc.style.width = "32px";
    loc.style.height = "32px";
    loc.tag = 'hidden';
    
//    canvas.style.cursor = 'move';
    
    canvas.appendChild(loc);
    
    poi.ref = site.img;
    poi.value = Math.random();
    
    var inScope = false,
        isUserInteracting = false,
        onMouseDownMouseX = 0, onMouseDownMouseY = 0,
        lon = 0, onMouseDownLon = 0,
        lat = 0, onMouseDownLat = 0,
        phi = 0, theta = 0;

    var dragable = false;
    var objects = [], plane;
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2(),
        offset = new THREE.Vector3(),
        INTERSECTED, SELECTED;

    var renderer = new THREE.WebGLRenderer({ antialias : true });
    renderer.setClearColor(new THREE.Color('lightgrey'), 1);
    renderer.setSize( canvas.clientWidth, canvas.clientHeight );
    canvas.appendChild( renderer.domElement );

    // init scene and camera
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.01, 1000);
    camera.target = new THREE.Vector3( 0, 0, 0 );

    lon = site.lon * 360;
    lat = site.lat * 45 - 45/2;

    var geometry = new THREE.SphereGeometry( 500, 60, 40 );
    geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
    var texture = THREE.ImageUtils.loadTexture( site.img );
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    
    var geo = new THREE.SphereGeometry( 40, 60, 40);
    for ( var i = 0; i < 40; i ++ ) {
        var object = new THREE.Mesh(geo,
                                    new THREE.MeshLambertMaterial( { color: Math.random()*0xffffff } ) );
        theta = THREE.Math.degToRad( Math.random()*360 );
        phi = THREE.Math.degToRad( 90 - Math.random()*90 );
        object.position.x = 500 * Math.sin( phi ) * Math.cos( theta );
        object.position.y = 500 * Math.cos( phi );
        object.position.z = 500 * Math.sin( phi ) * Math.sin( theta );
        objects.push(object);
        scene.add( object );
    }

    var light = new THREE.PointLight( 0xffffff, 2, 50 );
    light.add( new THREE.Mesh( 
                              new THREE.SphereGeometry( 4, 60, 40),
                              new THREE.MeshBasicMaterial({ color: 0x0040ff })
                             ));

    lon = 0;
    lot = 0;
    light.position.x = 500;
    light.position.y = 0;
    light.position.z = 0;

    scene.add( light );

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

    canvas.addEventListener( 'mousedown', function(event){

        if (!inScope) { return; }
        event.preventDefault();
        isUserInteracting = true;
        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;
        onPointerDownLon = lon;
        onPointerDownLat = lat;
        
        if (dragable) {
            var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 ).unproject( camera );
            var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
            var intersects = raycaster.intersectObjects( objects );
            if ( intersects.length > 0 ) {
                isUserInteracting = false;
                SELECTED = intersects[ 0 ].object;
                var intersects = raycaster.intersectObject( plane );
                offset.copy( intersects[ 0 ].point ).sub( plane.position );
                canvas.style.cursor = 'move';
            }
        }

    }, false );

    canvas.addEventListener( 'mousemove', function(event){
        if (!inScope) { return; }
        
        /*
         * mouse.x, mouse.y
         *   
         *        ^  
         *        |  
         *(-1, 1) | ( 1, 1) 
         *--------+---------->
         *(-1,-1) | ( 1,-1) 
         *        |  
         */

        if (dragable) {
            mouse.x = ( event.clientX - canvas.offsetLeft ) / canvas.clientWidth * 2 - 1;
            mouse.y = - (( event.clientY - canvas.offsetTop ) / canvas.clientHeight * 2 - 1);
            raycaster.setFromCamera( mouse, camera );
        }

        if ( isUserInteracting === true ) {
            lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
            lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
        }        

    }, false );

    canvas.addEventListener( 'mouseup', function(event){
        if (!inScope) { return; }
        isUserInteracting = false;

        if (dragable) {
            if ( INTERSECTED ) {
                plane.position.copy( INTERSECTED.position );
                SELECTED = null;
            }
            canvas.style.cursor = 'auto';
        }
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

    onRenderFcts.push(function(){
        loc.innerHTML = JSON.stringify({lon: lon, lat: lat});
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
