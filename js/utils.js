// lon,lat (in degree) ==2=> theta,phi (in radian)
function xyz2rtp (x, y, z) {
    var r = Math.sqrt( x*x + y*y + z*z );
    return {
        radius: r,
        theta: Math.atan( z / x ),
        phi: Math.acos( y / r )
    };
}

function rtp2xyz (radius, theta, phi) {
    return {
        x: radius * Math.sin( phi ) * Math.cos( theta ),
        y: radius * Math.cos( phi ),
        z: radius * Math.sin( phi ) * Math.sin( theta )
    };
}

function xyz2lonlat (poi) {
    var x = poi.x;
    var y = poi.y;
    var z = poi.z;
    var r = Math.sqrt( x*x + y*y + z*z );
    var theta = Math.atan( z / x );
    var phi = Math.acos( y / r );

    return {
        lon: THREE.Math.radToDeg(theta),
        lot: 90 - THREE.Math.radToDeg(phi)
    };
}
