import TWEEN from "@tweenjs/tween.js";
import { Vector3 } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Config from './../../data/config';
// import { createNoisyEasing, createStepEasing } from "./../utils/easings";
// var customTween = createStepEasing(3, TWEEN.Easing.Exponential.InOut);

// Controls based on orbit controls
export default class Controls {

  constructor(camera, container) {

    const controls = new OrbitControls(camera, container);
    this.threeControls = controls;
    this._camera = camera;

    (function( controls ) {
      controls.target.set(Config.controls.target.x, Config.controls.target.y, Config.controls.target.z);
      controls.autoRotate = Config.controls.autoRotate;
      controls.autoRotateSpeed = Config.controls.autoRotateSpeed;
      controls.rotateSpeed = Config.controls.rotateSpeed;
      controls.zoomSpeed = Config.controls.zoomSpeed;
      controls.minDistance = Config.controls.minDistance;
      controls.maxDistance = Config.controls.maxDistance;
      controls.minPolarAngle = Config.controls.minPolarAngle;
      controls.maxPolarAngle = Config.controls.maxPolarAngle;
      controls.enableDamping = Config.controls.enableDamping;
      controls.enableZoom = Config.controls.enableZoom;
      controls.dampingFactor = Config.controls.dampingFactor;
      controls.enablePan = Config.controls.enablePan;
    })( controls );

    this.moveIntoCenter = function( lat, lng, time, easing, distance, callback ) {

      const phi = (90 - lat) * Math.PI / 180;
      const theta = (-lng) * Math.PI / 180;
  
      let cameraDistance = this._camera.position.distanceTo(controls.target);
      cameraDistance = cameraDistance < 300 ? 300 : cameraDistance; // Zoom out if distance lower than 300 units
  
      const RandomHeightOfLine = distance ? distance : cameraDistance; // Or greater then your point distance to origin
  
      const position = new Vector3(
                          RandomHeightOfLine * Math.sin(phi) * Math.cos(theta), 
                          RandomHeightOfLine * Math.cos(phi), 
                          RandomHeightOfLine * Math.sin(phi) * Math.sin(theta)
                        );

      new TWEEN.Tween( this._camera.position )
        .to(position, time || 2000 )
        // .easing( TWEEN.Easing.Circular.InOut )
        // .easing( TWEEN.Easing.Quintic.InOut )
        .easing( easing || Config.easing )
        .onStart(() => { this.enabled = false; })
        .onComplete(() => {
          this.enabled = true;
          if( callback !== undefined )
            callback();
        }).start();
  
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
  
  set enabled( value ) {
    this.threeControls.enabled = value;
    this.threeControls.enableZoom = value;
    this.threeControls.enableRotate = value;
  }

}