function imgglobe( path, radius ) {
    var geometry = new THREE.SphereGeometry( radius, 60, 40 );
    geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
    var texture = THREE.ImageUtils.loadTexture( path );
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    var mesh = new THREE.Mesh( geometry, material );
    return mesh;
}

function renderSite(canvas, site, poi) {
    // canvas: the output canvas DOM element
    // site  : the configuration site object
    // poi   : the poi output

    modes = [
        { color: "#007cdc", mode: "pano", title: "", info: "#007cdc" },
        { color: "#887ddd", mode: "rotateLR", info: "#887ddd" },
        { color: "#ff5675", mode: "rotateUD", info: "#ff5675" },
        { color: "#ff8345", mode: "rotateFree", info: "#ff8345" },
        { color: "#8cc540", mode: "rotateDummy", title: "", info: "get away!" },
        { color: "#009f5d", mode: "sprite", title: "", info: "#009f5d" },
        { color: "#d1d2d4", mode: "MODE 7: .........", info: "#d1d2d4"}
    ];
    var mode = 0;

    canvas.style.position = 'relative';

    var banner = document.createElement('div');
    banner.style.cssText = "";
    banner.style.cssText += "";
    banner.style.cssText += "top: 1px; width: 100%; height: 10%; opacity: 0.8;";
    banner.style.cssText += "text-align: center;";
    banner.style.cssText += 'font-family: "Glyphicons Halflings", "Doulos SIL","Charis SIL", "Gentium", "TITUS Cyberbit Basic", "Arial Unicode MS", serif';
    banner.style.cssText += 'font-weight: bold';
    banner.style.cssText += "color: #ffffff;";
    banner.style.cssText += "background-color: rgba(0,0,0,0.5);";
    banner.style.cssText += "position: absolute";
    banner.style.cursor = "pointer";
    banner.innerText = "MODE";
//    $(banner).fitText(1.2, { minFontSize: '6px', maxFontSize: '20px' });

    canvas.appendChild(banner);

    var loc = document.createElement('div');
//    loc.style.border = '1px solid red';
    loc.style.position = "absolute";
    loc.style.bottom = "1px";
    loc.style.right = "1px";
    loc.style.textAlign = "right";
    loc.style.opacity = "0.8";
    loc.style.width = "32px";
    loc.style.height = "32px";
    loc.tag = 'hidden';
    canvas.appendChild(loc);

    banner.onclick = function() {
        mode = ++mode%modes.length;
        loc.style.background = modes[mode].color;
        banner.style.background = modes[mode].color;
        banner.innerHTML = modes[mode].mode;
        banner.title = modes[mode].info;
    };
    banner.onclick();

    poi.ref = site.img;
    poi.value = Math.random();

    var inScope = false,
        isUserInteracting = false,
        onMouseDownMouseX = 0, onMouseDownMouseY = 0,
        lon = 0, onMouseDownLon = 0,
        lat = 0, onMouseDownLat = 0,
        phi = 0, theta = 0;

    var onMode = true;
    var objects = [], plane;
    var mouse = new THREE.Vector3();
    var raycaster = new THREE.Raycaster();
    var offset = new THREE.Vector3();
    var INTERSECTED, SELECTED;

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
    // scene.add( mesh );

    var spherefaces = [];
    spherefaces.push(mesh);
    console.log('there are ' + spherefaces.length + ' faces');

    var geo = new THREE.SphereGeometry( 10, 60, 40);
    for ( var i = 0; i < 40; i ++ ) {
        var mat = new THREE.MeshLambertMaterial( { color: Math.random()*0xffffff } ) ;
        var object = new THREE.Mesh(geo, mat);
        var t = THREE.Math.degToRad( Math.random()*360 );     //  0 - 360
        var p = THREE.Math.degToRad( 80 + Math.random()*20 ); // 80 - 100
        object.position.x = 400 * Math.sin( p ) * Math.cos( t );
        object.position.y = 400 * Math.cos( p );
        object.position.z = 400 * Math.sin( p ) * Math.sin( t );
        object.name = i;
        objects.push(object);
        scene.add( object );
    }

    var light = new THREE.AmbientLight( 0xffffff );
    scene.add( light );

    var spritey = makeTextSprite( " Hello, ",
                                 { fontsize: 24, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:100, b:100, a:0.8} } );
    spritey.position.set( 400,0,0);
    scene.add( spritey );

    // listeners
    canvas.addEventListener('resize', function(){
        renderer.setSize( canvas.clientWidth, canvas.clientHeight );
        camera.aspect   = canvas.clientWidth / canvas.clientHeight;
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
                                                                                        //          |
        mouse.x = ( event.clientX - canvas.offsetLeft ) / canvas.clientWidth * 2 - 1;   //  (-1, 1) | ( 1, 1)
        mouse.y = 1 - ( event.clientY - canvas.offsetTop ) / canvas.clientHeight * 2;   //  --------+---------->
                                                                                        //  (-1,-1) | ( 1,-1)
                                                                                        //          |
        // update sprite position

        if (onMode) {
            raycaster.setFromCamera( mouse, camera );
            intersects = raycaster.intersectObjects( objects );
            if ( intersects.length > 0 ) {
                if ( INTERSECTED != intersects[ 0 ].object ) {
                    INTERSECTED = intersects[ 0 ].object;
                }
                if (modes[mode].mode === 'rotateDummy') {
                    modeRotateDummy(INTERSECTED);
                } else if (modes[mode].mode === 'drag') {
                    modeDrag(INTERSECTED);
                } else if (modes[mode].mode === 'rotateLR') {
                    modeRotateLR(INTERSECTED);
                } else if (modes[mode].mode === 'rotateUD') {
                    modeRotateUD(INTERSECTED);
                } else if (modes[mode].mode === 'rotateFree') {
                    modeRotateFree(INTERSECTED, Math.random()* 0.2 - 0.1, Math.random()*0.2-0.1);
                } else if (modes[mode].mode === 'sprite') {
                    modeSprite(INTERSECTED, infoContext, infoTexture);
                } else {
                    console.log('mode? what');
                }

            } else {
                INTERSECTED = null;
            }
        }

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

        if (onMode) {
        }

    }, false );

    canvas.addEventListener( 'mouseup', function(event){
        if (!inScope) { return; }
        isUserInteracting = false;

        if (onMode) {
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
        loc.innerHTML = lon.toFixed(0) + '<br />' + lat.toFixed(0);
    });


    onRenderFcts.push(function(){
        var t = THREE.Math.degToRad( lon );
        var p = THREE.Math.degToRad( 90 - lat );
        var x = 400 * Math.sin( p ) * Math.cos( t );
        var y = 400 * Math.cos( p );
        var z = 400 * Math.sin( p ) * Math.sin( t );
        spritey.position.set(x, y, z);
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
        lastTimeMsec    = lastTimeMsec || nowMsec-1000/60;
        var deltaMsec   = Math.min(200, nowMsec - lastTimeMsec);
        lastTimeMsec    = nowMsec;
        // call each update function
        onRenderFcts.forEach(function(onRenderFct){
            onRenderFct(deltaMsec/1000, nowMsec/1000);
        });
    });

    var ig1 = imgglobe( site.img1, 300 );
    var ig2 = imgglobe( site.img2, 300 );

    return {
        ig1: ig1,
        ig2: ig2,
        scene: scene
    };
}


// get away
function modeRotateDummy (POI) {

    var pos0 = {
        x: POI.position.x,
        y: POI.position.y,
        z: POI.position.z
    };
    var pos1 = xyz2rtp(
        POI.position.x,
        POI.position.y,
        POI.position.z
    );
    pos1.theta += Math.random()*0.2 - 0.1;
    pos1.phi   += Math.random()*0.2 - 0.1;
    var pos2 = rtp2xyz(pos1.radius, pos1.theta, pos1.phi);
    POI.position.x = pos2.x;
    POI.position.y = pos2.y;
    POI.position.z = pos2.z;

}


function modeRotateLR (POI) {

    var axis = new THREE.Vector3( 0, 1, 0 );
    var angle = Math.PI / 20;
    POI.position.applyAxisAngle( axis, angle );

}

function modeRotateUD (POI) {

    var z = POI.position.z;
    var x = POI.position.x;
    var r = Math.sqrt(x*x + z*z);
    var axis = new THREE.Vector3(-z/r, 0, x/r); // new THREE.Vector3(-z, 0, x).normalize()
    var angle = Math.PI / 20;
    POI.position.applyAxisAngle( axis, angle );
}

function modeRotateFree (POI, lon, lat) {

    var lr = new THREE.Vector3( 0, 1, 0 );
    POI.position.applyAxisAngle( lr, lon );

    var z = POI.position.z;
    var x = POI.position.x;
    var r = Math.sqrt(x*x + z*z);
    var ud = new THREE.Vector3(-z/r, 0, x/r);
    POI.position.applyAxisAngle( ud, lat );

}


function modeDrag (POI) {

}


function modeSprite (POI, infoContext, infoTexture) {

    if (true || POI.name) {

        infoContext.clearRect(0,0,640,480);

        var message = POI.name || Date.now();
        var metrics = infoContext.measureText(message);
        var width = metrics.width;
        infoContext.fillStyle = "rgba(0,0,0,0.95)"; // black border
        infoContext.fillRect( 0,0, width+8,20+8);
        infoContext.fillStyle = "rgba(255,255,255,0.95)"; // white filler
        infoContext.fillRect( 2,2, width+4,20+4 );
        infoContext.fillStyle = "rgba(0,0,0,1)"; // text color
        infoContext.fillText( message, 4,20 );

        infoTexture.needsUpdate = true;

    } else {

        infoTexture.clearRect(0,0,300,300);
        infoTexture.needsUpdate = true;

    }

}


function makeTextSprite( message, parameters )
{
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var fontsize = 18;
    context.font = "Bold " + fontsize +  "px Arial";
    var metrics = context.measureText( "hello world" );
    var textWidth = metrics.width;

    context.fillStyle   = "rgba(0, 0, 0, 1.0)";
    context.strokeStyle = "rgba(0, 255, 0, 1.0)";
    var borderThickness = 4;
    context.lineWidth = borderThickness;
    roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    context.fillStyle = "rgba(0, 0, 0, 1.0)";
    context.fillText( message, borderThickness, fontsize + borderThickness);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(100,50,1.0);
    return sprite;
}


function roundRect(ctx, x, y, w, h, r)
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
