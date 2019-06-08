import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Sidebar from "./classes/sidebar";

export default function() {

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    
    var renderer = new THREE.WebGLRenderer();
    scene.background = new THREE.Color( 0xff0000 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    // document.body.appendChild( renderer.domElement );

    var controls = new OrbitControls( camera, renderer.domElement );
    
    camera.position.set( 0, 10, 10 );
    controls.update();

    
    var light = {};
    var globus = {};
    var sidebar = new Sidebar(light, globus, controls);

    // const container = sidebar.getContainer();
    sidebar.container.appendChild( renderer.domElement );

    // add in callback so first route is on top in sidebar
    sidebar.addLink("Asien 2010-2013", () => {
        alert("click");
    });
    
    
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    var animate = function () {
        requestAnimationFrame( animate );
    
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    
        controls.update();
    
        renderer.render( scene, camera );
    };
    
    animate();
}