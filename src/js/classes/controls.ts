import TWEEN from "@tweenjs/tween.js";
import { Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Config from "../../data/config";
// import { createNoisyEasing, createStepEasing } from "./../utils/easings";
// var customTween = createStepEasing(3, TWEEN.Easing.Exponential.InOut);

// Controls based on orbit controls
export default class Controls {
    public threeControls: OrbitControls;
    public moveIntoCenter: any;

    public resetTarget() {
        // @ts-ignore
        new TWEEN.Tween(this.threeControls.target)
            .to(Config.controls.target, 800)
            // @ts-ignore
            .start();
    }

    public tweenTarget(target: THREE.Vector3, time: number) {
        return (
            // @ts-ignore
            new TWEEN.Tween(this.threeControls.target)
                // @ts-ignore
                .to(target, time)
        );
    }

    constructor(public camera: THREE.Camera, container: HTMLElement) {
        const controls = new OrbitControls(camera, container);
        this.threeControls = controls;
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

        this.moveIntoCenter = function tween(
            lat: number,
            lng: number,
            time: number = 2000,
            easing?: any,
            distance?: number,
            callback?: () => void
        ) {
            const phi = ((90 - lat) * Math.PI) / 180;
            const theta = (-lng * Math.PI) / 180;

            let cameraDistance = this.camera.position.distanceTo(
                controls.target
            );
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
                // @ts-ignore
                .to(position, time)
                // .easing( TWEEN.Easing.Circular.InOut )
                // .easing( TWEEN.Easing.Quintic.InOut )
                .easing(easing || Config.easing)
                .onStart(() => {
                    this.enabled = false;
                })
                .onComplete(() => {
                    this.enabled = true;
                    if (callback !== undefined) {
                        callback();
                    }
                })
                // @ts-ignore
                .start();
        };

        function handleMouseMove() {
            document.body.style.cursor = "grabbing";
        }

        function onMouseUp() {
            container.removeEventListener("mousemove", handleMouseMove, false);
            document.body.style.cursor = "default";
        }

        container.addEventListener(
            "mousedown",
            () => {
                container.addEventListener("mousemove", handleMouseMove, false);
                container.addEventListener("mouseup", onMouseUp, false);
                container.addEventListener("mouseout", onMouseUp, false);
            },
            false
        );
    }

    set enabled(value: boolean) {
        this.threeControls.enabled = value;
        this.threeControls.enableZoom = value;
        this.threeControls.enableRotate = value;
    }
}
