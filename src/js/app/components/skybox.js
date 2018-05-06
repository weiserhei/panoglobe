import * as THREE from 'three';

import Config from '../../data/config';

// Class that creates and updates the main camera
export default class Skybox {
  constructor(scene, texture) {

    // SKYBOX
    var geometry = new THREE.SphereBufferGeometry( Config.galaxy.radius, Config.galaxy.widthSegments, Config.galaxy.heightSegments );
    var material = new THREE.MeshBasicMaterial( { side: THREE.BackSide } );
    // http://www.1zoom.net/Space/wallpaper/330018/z747.9/
    this.mesh = new THREE.Mesh( geometry, material	);
    this.mesh.position.set( Config.galaxy.x, Config.galaxy.y, Config.galaxy.z );
    this.mesh.rotation.set( 0, Math.PI, 0 );
        
    scene.add(this.mesh);

  }

  setTexture( texture ) {
      this.mesh.material.map = texture;
      this.mesh.material.needsUpdate = true;
  }

  update( delta ) {
    this.mesh.rotation.y += delta * Config.galaxy.rotationSpeed;
  }
}
