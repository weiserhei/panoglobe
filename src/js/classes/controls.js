import TWEEN from '@tweenjs/tween.js';
import { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Config from './../../data/config';
// import { createNoisyEasing, createStepEasing } from "./../utils/easings";
// var customTween = createStepEasing(3, TWEEN.Easing.Exponential.InOut);

// Controls based on orbit controls
export default class Controls {
  constructor(camera, container) {
    const controls = new OrbitControls(camera, container);
    this.threeControls = controls;
    this.camera = camera;
    const cc = Config.controls;

    controls.target.set(cc.target.x, cc.target.y, cc.target.z);
    controls.autoRotate = cc.autoRotate;
    controls.autoRotateSpeed = cc.autoRotateSpeed;
    controls.rotateSpeed = cc.rotateSpeed;
    controls.zoomSpeed = cc.zoomSpeed;
    controls.minDistance = cc.minDistance;
    controls.maxDistance = cc.maxDistance;
    controls.minPolarAngle = cc.minPolarAngle;
    controls.maxPolarAngle = cc.maxPolarAngle;
    controls.enableDamping = cc.enableDamping;
    controls.enableZoom = cc.enableZoom;
    controls.dampingFactor = cc.dampingFactor;
    controls.enablePan = cc.enablePan;

    this.moveIntoCenter = function tween(lat, lng, time, easing, distance, callback) {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (-lng) * Math.PI / 180;

      let cameraDistance = this.camera.position.distanceTo(controls.target);
      // Zoom out if distance lower than 300 units
      cameraDistance = cameraDistance < 300 ? 300 : cameraDistance;

      // Or greater then your point distance to origin
      const RandomHeightOfLine = distance || cameraDistance;

      const position = new Vector3(
        RandomHeightOfLine * Math.sin(phi) * Math.cos(theta),
        RandomHeightOfLine * Math.cos(phi),
        RandomHeightOfLine * Math.sin(phi) * Math.sin(theta)
      );

      new TWEEN.Tween(this.camera.position)
        .to(position, time || 2000)
        // .easing( TWEEN.Easing.Circular.InOut )
        // .easing( TWEEN.Easing.Quintic.InOut )
        .easing(easing || Config.easing)
        .onStart(() => { this.enabled = false; })
        .onComplete(() => {
          this.enabled = true;
          if (callback !== undefined) {
            callback();
          }
        })
        .start();
    };

    function handleMouseMove() {
      document.body.style.cursor = 'grabbing';
    }

    function onMouseUp() {
      container.removeEventListener('mousemove', handleMouseMove, false);
      document.body.style.cursor = 'default';
    }

    container.addEventListener('mousedown', ()=>{
      container.addEventListener('mousemove', handleMouseMove, false);
      container.addEventListener('mouseup', onMouseUp, false);
      container.addEventListener('mouseout', onMouseUp, false);
    }, false);
  }

  set enabled(value) {
    this.threeControls.enabled = value;
    this.threeControls.enableZoom = value;
    this.threeControls.enableRotate = value;
  }
}
