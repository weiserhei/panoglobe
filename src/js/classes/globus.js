import {
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  // MeshPhysicalMaterial,
  // MeshStandardMaterial,
  // CubeTextureLoader
  IcosahedronBufferGeometry,
  Color,
  BackSide,
  DoubleSide,
  AdditiveBlending,
  Vector2,
  Matrix4,
  Group,
} from 'three';


import Config from './../../data/config';
// import { Water } from 'three-full';
// import { Water2 } from 'three-full';
import { drawThreeGeo } from './../utils/threeGeoJSON';
import AtmosphereMaterial from './../utils/atmosphereMaterial';

function getClouds(geometry) {
  const cloudMaterial = new MeshBasicMaterial({
    // map: this.textures.clouds,
    transparent: true,
    opacity: Config.globus.clouds.opacity,
    blending: AdditiveBlending,
  });

  const cloudSphere = new Mesh(geometry.clone(), cloudMaterial);
  cloudSphere.scale.multiplyScalar(1.035);

  cloudSphere.matrixAutoUpdate = false;
  cloudSphere.updateMatrix();

  cloudSphere.renderOrder = 1;

  return cloudSphere;
}

function getInnerGlow(geometry) {
  // inner Glow
  const color = new Color(Config.globus.innerGlow.color);
  const material = new AtmosphereMaterial(color);
  material.uniforms.coeficient.value = Config.globus.innerGlow.coeficient;
  material.uniforms.power.value = Config.globus.innerGlow.power;
  // var mesh = new THREE.Mesh( geometry.clone(), material );
  const mesh = new Mesh(geometry, material);
  mesh.scale.multiplyScalar(1.01);
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();

  return mesh;
}

function getOuterGlow(geometry) {
  // outer Glow
  const color = new Color(Config.globus.outerGlow.color);
  const material = new AtmosphereMaterial(color);
  material.side = BackSide;
  material.uniforms.coeficient.value = Config.globus.outerGlow.coeficient;
  material.uniforms.power.value = Config.globus.outerGlow.power;
  // var mesh = new THREE.Mesh( geometry.clone(), material );
  const mesh = new Mesh(geometry, material);
  mesh.scale.multiplyScalar(1.15);
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();

  return mesh;
}

// Class that creates the globe
export default class Globus {
  constructor(scene, preloader) {
    this.preloader = preloader;

    const geometry = new IcosahedronBufferGeometry(Config.globus.radius, Config.globus.detail);
    geometry.applyMatrix(new Matrix4().makeScale(-1, 1, -1));
    const normalScale = Config.globus.material.normalScale;

    this.material = new MeshPhongMaterial({
      // wireframe: true,
      transparent: true,
      opacity: 0,
      // side: DoubleSide,
      // side: DoubleSide,
      color: Config.globus.material.color,
      specular: Config.globus.material.specular,
      shininess: Config.globus.material.shininess,
      normalScale: new Vector2(normalScale, normalScale),
      displacementScale: Config.globus.material.displacementScale,
      displacementBias: Config.globus.material.displacementBias,
    });

    this.mesh = new Mesh(geometry, this.material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    // this.mesh.matrixAutoUpdate = false;
    // this.mesh.updateMatrix();

    if (Config.globus.innerGlow.enabled === true) {
      this.mesh.add(getInnerGlow(geometry));
    }
    if (Config.globus.outerGlow.enabled === true) {
      this.mesh.add(getOuterGlow(geometry));
    }
    if (Config.globus.clouds.enabled === true) {
      this.clouds = getClouds(geometry);
      this.mesh.add(this.clouds);
    }

    scene.add(this.mesh);

    this.scene = scene;

    // borderlines.renderOrder = 2;
    const borderlines = new Group();
    this.mesh.add(borderlines);
    // borderlines.visible = false;
    this.borderlines = borderlines;

    fetch(Config.data.geojsonPath, { mode: 'cors' }).then(function (resp) {
      if (resp.ok) {
        return resp.json();
      }
      console.error('fetch failed');
    }).then(function (data) {
      const materialOptions = { transparent: true, opacity: 0.5, color: 'white' };
      drawThreeGeo(data, Config.globus.radius + 0.5, 'sphere', materialOptions, borderlines);
      borderlines.rotation.set(0, Math.PI / 2, 0);
    }).catch(function (err) {
      console.error(err);
    });

    //  $.getJSON("./data/countries_states.geojson", function(data) {
    //     const materialOptions = { transparent: true, opacity: 0.5, color: 'white' };
    //     drawThreeGeo(data, Config.globus.radius+0.5, 'sphere', materialOptions, borderlines);
    //     borderlines.rotation.set( 0, Math.PI / 2, 0 );
    //     // borderlines.children.forEach( function(mesh) {
    //     //     mesh.geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, -1 ) );
    //     // });
    //     // group.updateMatrix();
    // }).fail(function(x) {
    //   console.log( "error",x );
    // });
  }

  get borders() {
    return this.borderlines.visible;
  }

  set borders(value) {
    this.borderlines.visible = value;
  }

  setNight(value) {
    this.preloader.inline = true;
    this.night = value;

    if (value) {
      if (this.textures[Config.globus.material.nightmap] === undefined) {
        const textureLoader = this.preloader.textureLoader;
        const url = './textures/4k/Night-Lights-4k.jpg';
        this.textures.night = textureLoader.load(url, texture => {
          this.material.map = texture;
        });
      } else {
        this.material.map = this.textures[Config.globus.material.nightmap];
      }
    } else {
      this.material.map = this.textures[Config.globus.material.map];
    }
  }

  setTextures(textures) {
    this.textures = textures;

    this.material.map = textures[Config.globus.material.map];
    this.material.specularMap = textures[Config.globus.material.specularMap];
    this.material.normalMap = textures[Config.globus.material.normalMap];
    this.material.displacementMap = textures[Config.globus.material.displacementMap];
    this.mesh.material.needsUpdate = true;

    // material for shadows on displacement
    // this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial( {
    //     depthPacking: THREE.RGBADepthPacking,
    //     displacementMap: textures[Config.globus.material.displacementMap],
    //     displacementScale: Config.globus.material.displacementScale,
    //     displacementBias: Config.globus.material.displacementBias,
    // } );

    if (Config.globus.clouds.enabled === true) {
      this.clouds.material.map = textures.clouds;
      this.clouds.material.needsUpdate = true;
    }

    // var loader = new CubeTextureLoader();
    // loader.setPath( './textures/cube/MilkyWay/' );
    // loader.setPath( './textures/cube/skyboxsun25deg/' );
    // const ext = ".jpg";
    // const prefix = "dark-s_";

    // loader.setPath( './textures/cube/pisa/' );
    // const ext = ".png";
    // const prefix = "";
    // const sides = [ "px", "nx", "py", "ny", "pz", "nz" ];

    // const imageNames = sides.map( side => prefix + side + ext );
    // var textureCube = loader.load( imageNames );
    // const scale = Config.globus.material.normalScale;

    // this.material = new MeshStandardMaterial( {
    // // this.material = new MeshPhysicalMaterial( {
    //     color: Config.globus.material.color,
    //     metalness: 0.0,
    //     roughness: 0.3,
    //     roughnessMap: textures.invertedSpecularmap,
    //     // roughnessMap: textures.specmap,
    //     // metalnessMap: textures.invertedSpecularmap,
    //     // clearCoat:  0.5,
    //     // clearCoatRoughness: 1.0,
    //     reflectivity: 1,
    //     envMapIntensity: 1,
    //     envMap: textureCube,
    //     map: textures[Config.globus.material.map],
    //     normalMap: textures.normalmap,
    //     normalScale: new Vector2(scale, scale),
    //     displacementMap: textures[Config.globus.material.displacementMap],
    //     displacementScale: Config.globus.material.displacementScale,
    //     displacementBias: Config.globus.material.displacementBias,
    // });

    // this.mesh.material = this.material;
  }
}
