import * as THREE from 'three';

import Config from '../../data/config';
// import { Water } from 'three-full';
// import { Water2 } from 'three-full';
import AtmosphereMaterial from "../helpers/atmosphereMaterial";


// Class that creates and updates the main camera
export default class Globus {
  constructor(scene, light) {

    this.scene = scene;
    this.geometry = new THREE.IcosahedronBufferGeometry( Config.globus.radius, Config.globus.detail );
    this.geometry.applyMatrix( new THREE.Matrix4().makeScale( - 1, 1, - 1 ) ); 

    this.mesh = new THREE.Mesh ( this.geometry );
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.updateMatrix();

    if( Config.globus.innerGlow.enabled === true ) {
        this.mesh.add( this.innerGlow );
    }
    if( Config.globus.outerGlow.enabled === true ) {
        this.mesh.add( this.outerGlow );
    }
    // this.mesh.add( this.clouds );
    scene.add(this.mesh);

    this.light = light;

  }

  setTextures( textures ) {

    this.material = new THREE.MeshPhongMaterial({
        wireframe: false,
        color: Config.globus.material.color,
        specular: Config.globus.material.specular,
        shininess: Config.globus.material.shininess,
        map: textures[Config.globus.material.map],
        specularMap: textures.invertedSpecularmap, 
        normalMap: textures.normalmap,
        normalScale: new THREE.Vector2( Config.globus.material.normalScale, Config.globus.material.normalScale ),
        displacementMap: textures[Config.globus.material.displacementMap],
        displacementScale: Config.globus.material.displacementScale,
        displacementBias: Config.globus.material.displacementBias,
    });

    // this.material = new THREE.MeshPhysicalMaterial( {
    //     color: Config.globus.material.color,
    //     metalness: 0.0,
    //     roughness: 0.8,
    //     roughnessMap: textures.specmap,
    //     // clearCoat:  0.5,
    //     // clearCoatRoughness: 1.0,
    //     reflectivity: 0.5,
    //     // envMap:
    //     map: textures[Config.globus.material.map],
    //     normalMap: textures.normalmap,
    //     normalScale: new THREE.Vector2( Config.globus.material.normalScale, Config.globus.material.normalScale ),
    //     displacementMap: textures[Config.globus.material.displacementMap],
    //     displacementScale: Config.globus.material.displacementScale,
    //     displacementBias: Config.globus.material.displacementBias,
    // });
    // var spline = new THREE.CatmullRomCurve3( [
    //     new THREE.Vector3( -20, 0, 0 ),
    //     new THREE.Vector3( -20, -20, 0 ),
    //     new THREE.Vector3( 20, -20, 0 ),
    //     new THREE.Vector3( 20, 0, 0 ),
    //     // new THREE.Vector3( -20, 0, 0 )
    // ], true );
    

    this.mesh.material = this.material;
    this.mesh.material.needsUpdate = true;

    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial( {
        depthPacking: THREE.RGBADepthPacking,
        displacementMap: textures[Config.globus.material.displacementMap],
        displacementScale: Config.globus.material.displacementScale,
        displacementBias: Config.globus.material.displacementBias,
    
    } );

    textures.waternormals.wrapS = textures.waternormals.wrapT = THREE.RepeatWrapping;

    // this.water = new Water(
    //     this.geometry,
    //     {
    //         textureWidth: 512,
    //         textureHeight: 512,
    //         waterNormals: textures.waternormals,
    //         alpha: 0.4,
    //         sunDirection: this.light.position.clone().normalize(),
    //         sunColor: 0xffffff,
    //         // waterColor: 0x001e0f,
    //         waterColor: 0x001eAf,
    //         distortionScale:  3.7,
    //         fog: this.scene.fog !== undefined
    //     }
    // );

    // this.water = new THREEFULL.Water2( new THREE.PlaneBufferGeometry(100, 100), {
    //     color: "#FFFFFF",
    //     scale: 1,
    //     flowDirection: new THREE.Vector2( 1, 1 ),
    //     textureWidth: 1024,
    //     textureHeight: 1024
    // } );

    // this.scene.add( this.water );

  }

  update( delta ) {

  }

  get clouds() {
    var geometry = this.geometry;

    var cloudMaterial	= new THREE.MeshBasicMaterial( { 
        map	: this.textures.clouds,
        transparent	: true, 
        opacity	: Config.globus.clouds.opacity,
        blending	: THREE.AdditiveBlending
    } ); 

    var cloudSphere = new THREE.Mesh( geometry.clone(), cloudMaterial );
    cloudSphere.scale.multiplyScalar ( 1.035 );
    // cloudSphere.scale.x = cloudSphere.scale.y = cloudSphere.scale.z = 1.035;
    return cloudSphere;
  }

  get innerGlow() {
    // inner Glow
    var geometry = this.geometry;
    const color = new THREE.Color( Config.globus.innerGlow.color );
    var material = new AtmosphereMaterial( color );
    material.uniforms.coeficient.value	= Config.globus.innerGlow.coeficient;
    material.uniforms.power.value		= Config.globus.innerGlow.power;
    // var mesh	= new THREE.Mesh( geometry.clone(), material );
    var mesh	= new THREE.Mesh( geometry, material );
    mesh.scale.multiplyScalar( 1.01 );
    // new THREEx.addAtmosphereMaterial2DatGui(material, datGUI)
    
    return mesh;
  }

  get outerGlow() {
        // outer Glow
        var geometry = this.geometry;
        const color = new THREE.Color( Config.globus.outerGlow.color );
		var material = new AtmosphereMaterial( color );
		material.side = THREE.BackSide;
		material.uniforms.coeficient.value	= Config.globus.outerGlow.coeficient;
		material.uniforms.power.value		= Config.globus.outerGlow.power;
		// var mesh	= new THREE.Mesh( geometry.clone(), material );
		var mesh	= new THREE.Mesh( geometry, material );
		mesh.scale.multiplyScalar( 1.15 );
		// new THREEx.addAtmosphereMaterial2DatGui(material, datGUI)

		return mesh;
  }
}
