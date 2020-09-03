import * as THREE from 'three';

var container, stats;

var camera, scene, renderer, splineCamera, cameraHelper, cameraEye;

var binormal = new THREE.Vector3();
var normal = new THREE.Vector3();

var pipeSpline = new THREE.CatmullRomCurve3( [
    new THREE.Vector3( 0, 10, - 10 ), new THREE.Vector3( 10, 0, - 10 ),
    new THREE.Vector3( 20, 0, 0 ), new THREE.Vector3( 30, 0, 10 ),
    new THREE.Vector3( 30, 0, 20 ), new THREE.Vector3( 20, 0, 30 ),
    new THREE.Vector3( 10, 0, 30 ), new THREE.Vector3( 0, 0, 30 ),
    new THREE.Vector3( - 10, 10, 30 ), new THREE.Vector3( - 10, 20, 30 ),
    new THREE.Vector3( 0, 30, 30 ), new THREE.Vector3( 10, 30, 30 ),
    new THREE.Vector3( 20, 30, 15 ), new THREE.Vector3( 10, 30, 10 ),
    new THREE.Vector3( 0, 30, 10 ), new THREE.Vector3( - 10, 20, 10 ),
    new THREE.Vector3( - 10, 10, 10 ), new THREE.Vector3( 0, 0, 10 ),
    new THREE.Vector3( 10, - 10, 10 ), new THREE.Vector3( 20, - 15, 10 ),
    new THREE.Vector3( 30, - 15, 10 ), new THREE.Vector3( 40, - 15, 10 ),
    new THREE.Vector3( 50, - 15, 10 ), new THREE.Vector3( 60, 0, 10 ),
    new THREE.Vector3( 70, 0, 0 ), new THREE.Vector3( 80, 0, 0 ),
    new THREE.Vector3( 90, 0, 0 ), new THREE.Vector3( 100, 0, 0 )
] );

var sampleClosedSpline = new THREE.CatmullRomCurve3( [
    new THREE.Vector3( 0, - 40, - 40 ),
    new THREE.Vector3( 0, 40, - 40 ),
    new THREE.Vector3( 0, 140, - 40 ),
    new THREE.Vector3( 0, 40, 40 ),
    new THREE.Vector3( 0, - 40, 40 )
] );

sampleClosedSpline.curveType = 'catmullrom';
sampleClosedSpline.closed = true;

// Keep a dictionary of Curve instances
var splines = {
    // GrannyKnot: new THREE.Curves.GrannyKnot(),
    // HeartCurve: new THREE.Curves.HeartCurve( 3.5 ),
    // VivianiCurve: new THREE.Curves.VivianiCurve( 70 ),
    // KnotCurve: new THREE.Curves.KnotCurve(),
    // HelixCurve: new THREE.Curves.HelixCurve(),
    // TrefoilKnot: new THREE.Curves.TrefoilKnot(),
    // TorusKnot: new THREE.Curves.TorusKnot( 20 ),
    // CinquefoilKnot: new THREE.Curves.CinquefoilKnot( 20 ),
    // TrefoilPolynomialKnot: new THREE.Curves.TrefoilPolynomialKnot( 14 ),
    // FigureEightPolynomialKnot: new THREE.Curves.FigureEightPolynomialKnot(),
    // DecoratedTorusKnot4a: new THREE.Curves.DecoratedTorusKnot4a(),
    // DecoratedTorusKnot4b: new THREE.Curves.DecoratedTorusKnot4b(),
    // DecoratedTorusKnot5a: new THREE.Curves.DecoratedTorusKnot5a(),
    // DecoratedTorusKnot5c: new THREE.Curves.DecoratedTorusKnot5c(),
    PipeSpline: pipeSpline,
    SampleClosedSpline: sampleClosedSpline
};

var parent, tubeGeometry, mesh;

var params = {
    spline: 'GrannyKnot',
    scale: 1,
    extrusionSegments: 100,
    radiusSegments: 3,
    closed: true,
    animationView: false,
    lookAhead: false,
    cameraHelper: false,
};

var material = new THREE.MeshLambertMaterial( { color: 0xff00ff } );
var splineCamera = new THREE.PerspectiveCamera( 24, window.innerWidth / window.innerHeight, 0.01, 1000 );
splineCamera.up.set( 0, 1, 0 );

var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.3, wireframe: true, transparent: true } );

function addTube( curve ) {

    // if ( mesh !== undefined ) {

    //     parent.remove( mesh );
    //     mesh.geometry.dispose();

    // }

    // var extrudePath = splines.SampleClosedSpline;
    var extrudePath = curve;
    tubeGeometry = new THREE.TubeBufferGeometry( extrudePath, params.extrusionSegments, 2, params.radiusSegments, params.closed );

    addGeometry( tubeGeometry );

    setScale();

}

function setScale() {

    mesh.scale.set( params.scale, params.scale, params.scale );

}


function addGeometry( geometry ) {

    // 3D shape

    mesh = new THREE.Mesh( geometry, material );
    var wireframe = new THREE.Mesh( geometry, wireframeMaterial );
    mesh.add( wireframe );

    // parent.add( mesh );

}

    // parent = new THREE.Object3D();
    // scene.add( parent );

    // splineCamera = new THREE.PerspectiveCamera( 84, window.innerWidth / window.innerHeight, 0.01, 1000 );
    // parent.add( splineCamera );

    // addTube();


function render( renderer, scene ) {

    // animate camera along spline

    var time = Date.now();
    var looptime = 20 * 1000;
    var t = ( time % looptime ) / looptime;

    var pos = tubeGeometry.parameters.path.getPointAt( t );
    pos.multiplyScalar( params.scale );

    // interpolation

    var segments = tubeGeometry.tangents.length;
    var pickt = t * segments;
    var pick = Math.floor( pickt );
    var pickNext = ( pick + 1 ) % segments;

    binormal.subVectors( tubeGeometry.binormals[ pickNext ], tubeGeometry.binormals[ pick ] );
    binormal.multiplyScalar( pickt - pick ).add( tubeGeometry.binormals[ pick ] );

    var dir = tubeGeometry.parameters.path.getTangentAt( t );
    var offset = -50;

    normal.copy( binormal ).cross( dir );

    // we move on a offset on its binormal

    pos.add( normal.clone().multiplyScalar( offset ) );

    splineCamera.position.copy( pos );
    // cameraEye.position.copy( pos );

    // using arclength for stablization in look ahead

    // var lookAt = tubeGeometry.parameters.path.getPointAt( ( t + 30 / tubeGeometry.parameters.path.getLength() ) % 1 ).multiplyScalar( params.scale );
    var lookAt = tubeGeometry.parameters.path.getPointAt( ( t + 30 / tubeGeometry.parameters.path.getLength() ) % 1 ).multiplyScalar( params.scale );

    // camera orientation 2 - up orientation via normal
    params.lookAhead = true;

    if ( ! params.lookAhead ) lookAt.copy( pos ).add( dir );
    splineCamera.matrix.lookAt( splineCamera.position, lookAt, normal );
    splineCamera.rotation.setFromRotationMatrix( splineCamera.matrix, splineCamera.rotation.order );

    // cameraHelper.update();

    // renderer.render( scene, params.animationView === true ? splineCamera : camera );

    renderer.render( scene, splineCamera );

}

export { addTube, render };