// import * as THREE from 'three';
// import OrbitControls from '../../utils/orbitControls';
import { OrbitControls } from "three-full";
import Config from '../../data/config';
import * as TWEEN from "tween.js";
import * as THREE from "three";


function threeStepEasing(k) {
  return Math.floor(k * 3) / 3;
}
// https://codepen.io/milesmanners/pen/EXGByv?page=49&q=Noisy
function createStepFunction(numSteps) {
  return k => ~~(k * numSteps) / numSteps
}
function createStepEasing(numSteps, easeFn) {
  return k => { let d = k*numSteps, fd = ~~d; return (easeFn(d - fd) + fd) / numSteps }
}

var customTween = createStepEasing(3, TWEEN.Easing.Exponential.InOut);


// Controls based on orbit controls
export default class Controls {
  constructor(camera, container) {
    const controls = new OrbitControls(camera, container);
    this.threeControls = controls;

    this.init();

    controls.panoActive = function( value ) {
      controls.enabled = value;
      controls.enableZoom = value;
      controls.enableRotate = value;
    }

    controls.moveIntoCenter = function( lat, lng, time, easing, distance, callback ) {

      const phi = (90 - lat) * Math.PI / 180;
      const theta = (-lng) * Math.PI / 180;

      let cameraDistance = camera.position.distanceTo(controls.target);
      cameraDistance = cameraDistance < 300 ? 300 : cameraDistance; // Zoom out if distance lower than 300 units

      const RandomHeightOfLine = distance ? distance : cameraDistance; // Or greater then your point distance to origin
  
      const position = new THREE.Vector3(
                          RandomHeightOfLine * Math.sin(phi) * Math.cos(theta), 
                          RandomHeightOfLine * Math.cos(phi), 
                          RandomHeightOfLine * Math.sin(phi) * Math.sin(theta)
                        );
      
      // var x = RandomHeightOfLine * Math.sin(phi) * Math.cos(theta);
      // var y = RandomHeightOfLine * Math.cos(phi);
      // var z = RandomHeightOfLine * Math.sin(phi) * Math.sin(theta);
      // controls.target.set( x, y, z );
      // tweenCamera(camera, position, new THREE.Vector3(0, 0, 0), time || 2000, easing || TWEEN.Easing.Quintic.InOut);

      const t = new TWEEN.Tween( camera.position ).to( {
        x: position.x,
        y: position.y,
        z: position.z}, time || 2000 )
        .easing( easing || TWEEN.Easing.Quintic.InOut )
        .onStart(function() {
          controls.panoActive( false );
        })
        .onComplete(function () {
          controls.panoActive( true );
          if( callback !== undefined ) {
            callback();
          }
      }, this).start();

      
    }

    // var t;
    // var t2;
    // var t3; //Put as Global or use Array, because GC likes to remove Tween objects.
    function tweenCamera(camera, position, target, time, easing){
      // updateTween = true;
      // let beforeTweenPos = camera.position.clone();
      // let beforeTweenTarg = controls.target.clone();
      controls.enabled = false;
      console.log("controls", this, controls.enabled);

      const t = new TWEEN.Tween( camera.position ).to( {
          x: position.x,
          y: position.y,
          z: position.z}, time )
      // .easing( TWEEN.Easing.Quadratic.In ).start()
      // .easing( TWEEN.Easing.Quadratic.InOut ).start()
      // .easing( TWEEN.Easing.Elastic.InOut ).start()
      .easing( easing )
      .onStart(function() {
        controls.enabled = false;
      })
      // .onUpdate(() => {
        // console.log(camera.position.distanceTo(new THREE.Vector3(0,0,0)));
      // })
      // t2 = new TWEEN.Tween( camera.up ).to( {
      //     x: 0,
      //     y: 1,
      //     z: 0}, time )
      // .easing( TWEEN.Easing.Quadratic.In).start();
      // t3 = new TWEEN.Tween( controls.target ).to( {
      //     x: target.x,
      //     y: target.y,
      //     z: target.z}, time )
      // .easing( TWEEN.Easing.Quadratic.In)
      .onComplete(function () {
          console.log("controls enabled", controls.enabled);
          controls.enabled = true;
          // updateTween = false;
          // console.log("Turning off Update Tween");
          // t = null;
          // t2 = null;
          // t3 = null;
      }, this).start();
    }


    function handleMouseMove() {
      document.body.style.cursor = 'grabbing';
    }
    
    function onMouseUp() {
      container.removeEventListener("mousemove", handleMouseMove, false);
      document.body.style.cursor = 'default';
    }

    container.addEventListener("mousedown", (event)=>{

      container.addEventListener("mousemove", handleMouseMove, false);
      
      container.addEventListener("mouseup", onMouseUp, false);
      container.addEventListener("mouseout", onMouseUp, false);

    }, false);

  }

  init() {
    this.threeControls.target.set(Config.controls.target.x, Config.controls.target.y, Config.controls.target.z);
    this.threeControls.autoRotate = Config.controls.autoRotate;
    this.threeControls.autoRotateSpeed = Config.controls.autoRotateSpeed;
    this.threeControls.rotateSpeed = Config.controls.rotateSpeed;
    this.threeControls.zoomSpeed = Config.controls.zoomSpeed;
    this.threeControls.minDistance = Config.controls.minDistance;
    this.threeControls.maxDistance = Config.controls.maxDistance;
    this.threeControls.minPolarAngle = Config.controls.minPolarAngle;
    this.threeControls.maxPolarAngle = Config.controls.maxPolarAngle;
    this.threeControls.enableDamping = Config.controls.enableDamping;
    this.threeControls.enableZoom = Config.controls.enableZoom;
    this.threeControls.dampingFactor = Config.controls.dampingFactor;
    this.threeControls.enablePan = Config.controls.enablePan;
  }
}
