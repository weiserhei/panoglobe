import {
    Vector3,
    Matrix4,
    RingBufferGeometry,
    MeshPhongMaterial,
    Mesh,
    DoubleSide,
} from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

export default class MeshMover {
    private tempVector: THREE.Vector3 = new Vector3();
    private mesh: THREE.Group | undefined;
    private outlineMesh: THREE.Mesh | undefined;

    constructor(
        scene: THREE.Scene,
        private positions: THREE.Vector3[],
        folder: any
    ) {
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
    }

    public update(index: number, point: Vector3, color: THREE.Color) {
        if (this.mesh && this.outlineMesh) {
            const forwardPoint = (index + 5) % this.positions.length;
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
            (this.outlineMesh.material as MeshPhongMaterial).color.copy(color);
        }
    }
}
