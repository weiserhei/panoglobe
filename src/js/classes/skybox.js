import {
    IcosahedronBufferGeometry,
    MeshBasicMaterial,
    Mesh,
    BackSide,
    RepeatWrapping,
} from "three";
// import * as THREE from 'three'
import Config from "../../data/config";

// Class that creates and updates the main camera
export default class Skybox {
    constructor(scene) {
        // SKYBOX
        // const geometry = new SphereBufferGeometry(
        // Config.galaxy.radius, Config.galaxy.widthSegments, Config.galaxy.heightSegments
        // );
        const geometry = new IcosahedronBufferGeometry(Config.galaxy.radius, 1);
        const material = new MeshBasicMaterial({
            wireframe: false,
            side: BackSide,
            color: 0xffffff,
        });
        // http://www.1zoom.net/Space/wallpaper/330018/z747.9/
        this.mesh = new Mesh(geometry, material);
        this.mesh.position.set(
            Config.galaxy.x,
            Config.galaxy.y,
            Config.galaxy.z
        );
        this.mesh.rotation.set(0, Math.PI, 0);

        scene.add(this.mesh);
    }

    setTexture(texture) {
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.offset.set(0, 0.5);
        texture.repeat.set(2, 2);

        this.mesh.material.map = texture;
        this.mesh.material.needsUpdate = true;
    }

    update(delta) {
        this.mesh.rotation.y += delta * Config.galaxy.rotationSpeed;
    }
}
