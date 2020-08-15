import { PerspectiveCamera } from "three";
import Config from "../../data/config";

// Class that creates and updates the main camera
export default class Camera {
    constructor(renderer) {
        const fov = Config.camera.fov;
        const near = Config.camera.near;
        const far = Config.camera.far;
        const aspect = renderer.domElement.width / renderer.domElement.height;

        // Create and position a Perspective Camera
        this.threeCamera = new PerspectiveCamera(fov, aspect, near, far);
        this.threeCamera.position.set(
            Config.camera.posX,
            Config.camera.posY,
            Config.camera.posZ
        );

        // Initial sizing
        this.updateSize(renderer);

        // Listeners
        window.addEventListener(
            "resize",
            () => this.updateSize(renderer),
            false
        );
    }

    updateSize(renderer) {
        // Multiply by dpr in case it is retina device
        // const width = renderer.domElement.width * Config.dpr;
        // const height = renderer.domElement.height * Config.dpr;
        // this.threeCamera.aspect =  width / height;
        this.threeCamera.aspect =
            renderer.domElement.width / renderer.domElement.height;

        // Always call updateProjectionMatrix on camera change
        this.threeCamera.updateProjectionMatrix();
    }
}
