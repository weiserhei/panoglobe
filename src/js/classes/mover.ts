import { Color, PointLight } from "three";
import { icon } from "@fortawesome/fontawesome-svg-core";
import {
    faMapMarker,
    faMapMarkerAlt,
    faCircle,
    faCircleNotch,
    faHighlighter,
    faPlane,
    faShuttleVan,
    faCar,
} from "@fortawesome/free-solid-svg-icons";

import Config from "../../data/config";

import HtmlMover from "./htmlMover";
// import MeshMover from "./meshMover";

export default class Mover {
    private moverPlane: HtmlMover;
    private moverMarker: HtmlMover;
    private moverVehicle: HtmlMover;
    private pointLight: THREE.PointLight;
    // private meshMover: MeshMover;

    constructor(
        scene: THREE.Scene,
        private positions: THREE.Vector3[],
        private colors: Float32Array,
        folder: any
    ) {
        // this.pointLight = new PointLight(
        //     Config.pointLight.color,
        //     Config.pointLight.intensity,
        //     Config.pointLight.distance
        // );
        // this.pointLight.position.set(
        //     Config.pointLight.x,
        //     Config.pointLight.y,
        //     Config.pointLight.z
        // );
        // scene.add(this.pointLight);
        // this.pointLight.visible = Config.pointLight.enabled;
        // this.pointLight.castShadow = true;

        const marker = icon(faMapMarkerAlt, {
            styles: {
                color: "#fff",
                // opacity: "0.5",
                // filter: "drop-shadow(0px 3px 3px rgba(255,255,255,1))",
                filter: "drop-shadow(0px 3px 1px rgba(0,0,0,0.5))",
            },
            classes: ["fa-lg", "mt-n3"],
            // classes: ["fa-2x", "mt-n3", "ml-2", "pl-2"],
        });
        this.moverMarker = new HtmlMover(scene, marker);
        if (process.env.NODE_ENV === "development") {
            folder
                .add({ visible: true }, "visible")
                .name("2D Guide")
                .onChange((value: boolean) => {
                    this.moverMarker.visible = value;
                });
        }

        // const pen = icon(faHighlighter, {
        //     styles: {
        //         color: "#fff",
        //         // opacity: "0.5",
        //         // filter: "drop-shadow(0px 3px 3px rgba(255,255,255,1))",
        //         filter: "drop-shadow(0px 3px 1px rgba(0,0,0,0.5))",
        //     },
        //     classes: ["fa-2x", "mt-n3", "ml-2", "pl-2"],
        //     // classes: ["fa-lg"],
        // });

        const vehicle = icon(faCar, {
            transform: {
                // rotate: -30,
                flipX: true,
            },
            styles: {
                // color: "#fff",
                // opacity: "0.5",
                // filter: "drop-shadow(0px 3px 3px rgba(255,255,255,1))",
                filter: "drop-shadow(0px 3px 1px rgba(0,0,0,0.5))",
            },
            classes: ["fa-lg", "mt-n1"],
            // classes: ["fa-lg"],
        });
        this.moverVehicle = new HtmlMover(scene, vehicle);

        const plane = icon(faPlane, {
            transform: {
                rotate: -30,
                flipX: true,
            },
            styles: {
                color: "#fff",
                // opacity: "0.5",
                // filter: "drop-shadow(0px 3px 3px rgba(255,255,255,1))",
                filter: "drop-shadow(0px 3px 1px rgba(0,0,0,0.5))",
            },
            classes: ["fa-lg", "mt-n1"],
            // classes: ["fa-lg", "mt-n1"],
            // classes: ["fa-2x", "mt-n3", "ml-2", "pl-2"],
        });
        this.moverPlane = new HtmlMover(scene, plane);

        // async
        // this.meshMover = new MeshMover(scene, this.positions, folder);
    }

    public moving(value: boolean) {
        this.moverVehicle.visible = value;
        this.moverVehicle.toggle();
    }
    public flying(value: boolean) {
        this.moverPlane.visible = value;
        this.moverPlane.toggle();
    }
    public static(value: boolean) {
        this.moverMarker.visible = value;
        this.moverMarker.toggle();
    }

    public setVisible(value: boolean) {
        this.moverMarker.visible = value;
        this.moverPlane.visible = false;
        this.moverVehicle.visible = false;
    }

    public update(index: number, camera: THREE.Camera) {
        if (index < 0) {
            index = 0;
        } else if (index >= this.positions.length) {
            index = this.positions.length - 1;
        }
        const safeIndex = Math.floor(index);

        // const progressIndex =
        //     (this.routeData.length / this.positions.length) * index;

        const point = this.positions[safeIndex];
        const currentColor = new Color().fromArray(this.colors, safeIndex * 3);
        // this.meshMover.update(safeIndex, point, currentColor);
        // this.mesh.getWorldPosition(meshVector);
        const eye = camera.position.clone().sub(point);
        const dot = eye.normalize().dot(point.clone().normalize());
        const ocluded = dot < 0.0; // IS TRUE WHEN BLOB IS BEHIND THE SPHERE = dot value below 0.0

        this.moverPlane.update(ocluded, dot, point, currentColor);
        this.moverVehicle.update(ocluded, dot, point, currentColor);
        // this.pointLight.color.copy(currentColor);
        // this.pointLight.position.copy(point.clone().multiplyScalar(1.2));
        this.moverMarker.update(ocluded, dot, point, currentColor);
    }
}
