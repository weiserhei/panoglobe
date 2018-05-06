import * as THREE from 'three';

import Config from '../../data/config';

// Sets up and places all lights in scene
export default class Light {
  constructor(scene) {
    this.scene = scene;

    this.init();
  }

  init() {
    // Ambient
    // this.ambientLight = new THREE.AmbientLight(Config.ambientLight.color);
    // this.ambientLight.visible = Config.ambientLight.enabled;

    // // Point light
    this.pointLight = new THREE.PointLight(Config.pointLight.color, Config.pointLight.intensity, Config.pointLight.distance);
    this.pointLight.position.set(Config.pointLight.x, Config.pointLight.y, Config.pointLight.z);
    this.pointLight.visible = Config.pointLight.enabled;
    this.pointLight.castShadow = true;

    this.plhelper = new THREE.PointLightHelper( this.pointLight, 10 );
    this.scene.add(this.plhelper);

    // Hemisphere light
    this.hemiLight = new THREE.HemisphereLight( Config.hemiLight.color, Config.hemiLight.groundColor, Config.hemiLight.intensity );
		this.hemiLight.color.setHSL( Config.hemiLight.hColor, Config.hemiLight.sColor, Config.hemiLight.lColor );
		this.hemiLight.groundColor.setHSL( Config.hemiLight.groundHColor, Config.hemiLight.groundSColor, Config.hemiLight.groundLColor );
    this.hemiLight.position.set(Config.hemiLight.x, Config.hemiLight.y, Config.hemiLight.z);
    this.hemiLight.visible = Config.hemiLight.enabled;

    // Directional light
    this.directionalLight = new THREE.DirectionalLight(Config.directionalLight.color, Config.directionalLight.intensity);
    this.directionalLight.color.setHSL( 0.1, 0.1, 0.45 );
    this.directionalLight.position.set(Config.directionalLight.x, Config.directionalLight.y, Config.directionalLight.z);
		this.directionalLight.position.multiplyScalar( Config.directionalLight.multiplyScalarPosition );
    this.directionalLight.visible = Config.directionalLight.enabled;


    // Shadow map
    this.directionalLight.castShadow = Config.shadow.enabled;
    this.directionalLight.shadow.bias = Config.shadow.bias;
    this.directionalLight.shadow.camera.near = Config.shadow.near;
    this.directionalLight.shadow.camera.far = Config.shadow.far;
    this.directionalLight.shadow.camera.left = Config.shadow.left;
    this.directionalLight.shadow.camera.right = Config.shadow.right;
    this.directionalLight.shadow.camera.top = Config.shadow.top;
    this.directionalLight.shadow.camera.bottom = Config.shadow.bottom;
    this.directionalLight.shadow.mapSize.width = Config.shadow.mapWidth;
    this.directionalLight.shadow.mapSize.height = Config.shadow.mapHeight;

    // Shadow camera helper
    this.directionalLightHelper = new THREE.CameraHelper(this.directionalLight.shadow.camera);
    this.directionalLightHelper.visible = Config.shadow.helperEnabled;

    //MOONLIGHT 
		this.spotlight = new THREE.SpotLight( 
      Config.spotlight.color, 
      Config.spotlight.intensity, 
      Config.spotlight.distance, 
      Config.spotlight.angle, 
      Config.spotlight.decay ); 
		this.spotlight.position.set( Config.spotlight.x, Config.spotlight.y, Config.spotlight.z );
		this.spotlight.target.position.set( Config.spotlight.targetx, Config.spotlight.targety, Config.spotlight.targetz );
		
		// this.spotLightHelper = new THREE.SpotLightHelper( this.spotLight, 50 );

  }

  update( clock ) {
    this.pointLight.position.x = 110 * Math.cos( clock.elapsedTime/1.5 ) + 0;
    this.pointLight.position.y = 110 * Math.sin( clock.elapsedTime/1.5 ) + 0;

    // this.directionalLight.position.set
    // console.log(controls);

  }

  place(lightName) {
    switch(lightName) {
      case 'ambient':
        this.scene.add(this.ambientLight);
        break;

      case 'spot':
        this.scene.add(this.spotlight);
        this.scene.add(this.spotlight.target);
        break;

      case 'directional':
        this.scene.add(this.directionalLight);
        this.scene.add(this.directionalLightHelper);
        break;

      case 'point':
        this.scene.add(this.pointLight);
        break;

      case 'hemi':
        this.scene.add(this.hemiLight);
        break;
    }
  }
}
