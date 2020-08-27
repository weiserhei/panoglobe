import {
    BoxBufferGeometry,
    MeshNormalMaterial,
    Mesh,
    Vector3,
    Matrix4,
    RingBufferGeometry,
    DoubleSide,
    MeshBasicMaterial,
    Color,
    MeshPhongMaterial,
} from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import HtmlMover from "./htmlMover";
import Marker from "./marker";

import Config from "../../data/config";

export default class Mover {
    private tempVector: THREE.Vector3;
    private mesh: THREE.Group | undefined;
    private outlineMesh: THREE.Mesh | undefined;
    private htmlMover: HtmlMover;
    constructor(
        scene: THREE.Scene,
        private positions: Array<THREE.Vector3>,
        private colors: Float32Array,
        private routeData: Array<Poi>,
        private marker: Array<Marker>,
        folder: any
    ) {
        // this.mesh = new Mesh(
        //     new BoxBufferGeometry(1, 1, 2),
        //     new MeshNormalMaterial()
        // );
        // scene.add(this.mesh);
        // this.mesh.position.copy(positions[positions.length - 1]);

        this.tempVector = new Vector3();
        this.htmlMover = new HtmlMover(scene);
        this.htmlMover.setFlying(false);
        if (process.env.NODE_ENV === "development") {
            folder
                .add({ visible: true }, "visible")
                .name("2D Guide")
                .onChange((value: boolean) => {
                    this.htmlMover.visible = value;
                });
        }
        // async
        this.mesh_mover(scene, folder);
    }

    private mesh_mover = function (scene: THREE.Scene, folder: any) {
        new MTLLoader()
            .setPath("./models/van/")
            .load("Van.mtl", (materials) => {
                materials.preload();
                // console.log(materials.materials["car_glass.png"]);
                materials.materials["car_glass.png"].transparent = true;
                materials.materials["car_glass.png"].opacity = 0.8;

                new OBJLoader()
                    .setMaterials(materials)
                    .setPath("models/van/")
                    .load(
                        "Van.obj",
                        (object) => {
                            object.position.y = -95;
                            // object.scale.set(0.02, 0.02, 0.02);
                            object.children.forEach((child) => {
                                (child as THREE.Mesh).geometry.applyMatrix4(
                                    new Matrix4().makeScale(0.01, 0.01, 0.01)
                                );
                                (child as THREE.Mesh).geometry.applyMatrix4(
                                    new Matrix4().makeRotationX(Math.PI)
                                );
                            });

                            const geometry = new RingBufferGeometry(1.7, 2, 18);
                            // geometry.applyMatrix4(
                            //     new Matrix4().makeRotationX(Math.PI / 2)
                            // );
                            const x = new Mesh(
                                geometry,
                                // new MeshPhongMaterial({ color: 0xff5555 })
                                new MeshPhongMaterial({
                                    color: 0x000000,
                                    side: DoubleSide,
                                })
                                // new MeshNormalMaterial({ side: DoubleSide })
                            );
                            object.add(x);
                            this.outlineMesh = x;
                            this.mesh = object;
                            scene.add(this.mesh);
                            this.mesh.visible = false;
                            if (process.env.NODE_ENV === "development") {
                                folder
                                    .add(this.mesh, "visible")
                                    .name("3D Guide");
                            }
                        }
                        // onProgress, onError
                    );
            });
    };

    public moving(value: boolean) {
        this.htmlMover.moving(value);
    }

    public setVisible(value: boolean) {
        this.htmlMover.visible = value;
    }

    public update(index: number, camera: THREE.Camera) {
        if (index < 0) {
            index = 0;
        } else if (index >= this.positions.length) {
            index = this.positions.length - 1;
        }
        const safeIndex = Math.floor(index);

        const progressIndex =
            (this.routeData.length / this.positions.length) * index;

        if (progressIndex < this.marker[1].index + 7) {
            // this.htmlMover.setFlying(true);
            // this.htmlMover.setFlying(false);
        } else {
            // this.htmlMover.setFlying(false);
        }

        var point = this.positions[safeIndex];
        const currentColor = new Color().fromArray(this.colors, safeIndex * 3);

        if (this.mesh && this.outlineMesh) {
            const forwardPoint = (safeIndex + 5) % this.positions.length;
            var point2 = this.positions[forwardPoint];
            // var point2 = routeData[index % routeData.length].displacedPos;
            // let angleEnd = point.angleTo(point2);
            var upNormal = this.tempVector
                .subVectors(new Vector3(0, 0, 0), point.clone())
                .normalize();
            if (!this.mesh) return;
            this.mesh.up = upNormal;
            this.mesh.position.copy(point);
            this.mesh.lookAt(point2);
            this.outlineMesh.lookAt(new Vector3(0, 0, 0));
            (this.outlineMesh.material as MeshPhongMaterial).color.copy(
                currentColor
            );
        }

        // this.mesh.getWorldPosition(meshVector);
        const eye = camera.position.clone().sub(point);
        const dot = eye.normalize().dot(point.clone().normalize());
        const ocluded = dot < 0.0; // IS TRUE WHEN BLOB IS BEHIND THE SPHERE = dot value below 0.0

        this.htmlMover.update(ocluded, dot, point, currentColor);
    }
}
