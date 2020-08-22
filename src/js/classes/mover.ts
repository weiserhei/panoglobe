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
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { icon } from "@fortawesome/fontawesome-svg-core";
import {
    faMapMarker,
    faMapMarkerAlt,
    faCircle,
    faCircleNotch,
} from "@fortawesome/free-solid-svg-icons";
import Config from "../../data/config";

export default class Mover {
    private tempVector: THREE.Vector3;
    private mesh: THREE.Group;
    private outlineMesh: THREE.Mesh;
    private css2dobject: CSS2DObject;
    constructor(
        private scene: THREE.Scene,
        private positions: Array<THREE.Vector3>,
        private colors: Float32Array,
        private folder: any
    ) {
        // this.mesh = new Mesh(
        //     new BoxBufferGeometry(1, 1, 2),
        //     new MeshNormalMaterial()
        // );
        // scene.add(this.mesh);
        // this.mesh.position.copy(positions[positions.length - 1]);

        this.tempVector = new Vector3();

        const i = icon(faMapMarkerAlt, {
            // const i = icon(faCircleNotch, {
            styles: {
                color: "#fff",
                // filter: "drop-shadow(0px 3px 3px rgba(255,255,255,1))",
                filter: "drop-shadow(0px 3px 1px rgba(0,0,0,0.5))",
            },
            classes: ["fa-lg", "mt-n3"],
        });
        // @ts-ignore
        this.css2dobject = new CSS2DObject(i.node[0]);
        // domElement.style.top = "-1.2em";
        // domElement.appendChild(pinIcon.node[0]);
        // this.css2dobject = new CSS2DObject(i.node[0]);

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

                            scene.add(object);

                            const geometry = new RingBufferGeometry(1.7, 2, 18);
                            // geometry.applyMatrix4(
                            //     new Matrix4().makeRotationX(Math.PI / 2)
                            // );
                            // geometry.applyMatrix4(
                            //     new Matrix4().makeRotationZ(Math.PI)
                            // );
                            const x = new Mesh(
                                geometry,
                                // new MeshPhongMaterial({ color: 0xff5555 })
                                new MeshPhongMaterial({ color: 0x000000 })
                                // new MeshNormalMaterial({ side: DoubleSide })
                            );
                            (x.material as MeshPhongMaterial).side = DoubleSide;
                            object.add(x);
                            this.outlineMesh = x;
                            this.mesh = object;

                            // this.css2dobject.position.copy(followMesh.position);
                            // this.mesh.add(this.css2dobject);
                            scene.add(this.css2dobject);
                            console.log(
                                // @ts-ignore
                                this.css2dobject.element.style
                            );

                            folder.add(object, "visible");
                        }
                        // onProgress, onError
                    );
            });
    }

    public update(index: number) {
        const indexes = { bigIndex: 0, bigIndex2: 0 };
        // if (routeData === undefined) {
        //     return;
        // }
        // let index = Math.floor(self.animationDrawIndex.index);
        // if (index < 1) {
        //     index = 1;
        // }
        // const pos = routeData[index - 1].displacedPos;
        indexes.bigIndex = Math.floor(index * (Config.routes.lineSegments + 1));
        if (indexes.bigIndex < 0) {
            indexes.bigIndex = 0;
        } else if (indexes.bigIndex >= this.positions.length) {
            // console.log(bigIndex);
            indexes.bigIndex = this.positions.length - 1;
        }
        var point = this.positions[indexes.bigIndex];
        indexes.bigIndex2 = (indexes.bigIndex + 5) % this.positions.length;
        var point2 = this.positions[indexes.bigIndex2];
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
        (this.outlineMesh.material as MeshPhongMaterial).color.fromArray(
            this.colors,
            indexes.bigIndex * 3
        );

        this.css2dobject.position.copy(point);
        // @ts-ignore
        // const rgb = `rgb(${this.colors[indexes.bigIndex * 3]}, ${
        //     this.colors[indexes.bigIndex * 3 + 1]
        // }, ${this.colors[indexes.bigIndex * 3 + 2]})`;
        const c = new Color()
            .fromArray(this.colors, indexes.bigIndex * 3)
            .getStyle();
        this.css2dobject.element.style.color = c;
        // this.car.position.copy(pos);
        // this.car.lookAt(scene.position);
    }
}
