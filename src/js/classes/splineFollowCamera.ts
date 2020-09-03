import * as THREE from "three";
import { Curves } from "three/examples/jsm/curves/CurveExtras";
import { BoxBufferGeometry, MeshNormalMaterial } from "three";
import Route from "./route";

var sampleClosedSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -40, -40),
    new THREE.Vector3(0, 40, -40),
    new THREE.Vector3(0, 140, -40),
    new THREE.Vector3(0, 40, 40),
    new THREE.Vector3(0, -40, 40),
]);
// @ts-ignore
sampleClosedSpline.curveType = "catmullrom";
// @ts-ignore
sampleClosedSpline.closed = true;

// Keep a dictionary of Curve instances
let splines = {
    GrannyKnot: new Curves.GrannyKnot(),
    HeartCurve: new Curves.HeartCurve(3.5),
    VivianiCurve: new Curves.VivianiCurve(70),
    KnotCurve: new Curves.KnotCurve(),
    HelixCurve: new Curves.HelixCurve(),
    TrefoilKnot: new Curves.TrefoilKnot(),
    TorusKnot: new Curves.TorusKnot(20),
    SampleClosedSpline: sampleClosedSpline,
};

export default class SFC {
    private scale: number;
    private tubeGeometry: THREE.TubeBufferGeometry;
    private position: THREE.Vector3;
    private binormal: THREE.Vector3;
    private direction: THREE.Vector3;
    private normal: THREE.Vector3;
    private lookAt: THREE.Vector3;
    public splineCamera: THREE.PerspectiveCamera;
    public mesh: THREE.Mesh;
    public followMesh: THREE.Mesh;
    constructor(
        scene: THREE.Scene,
        camera?: THREE.PerspectiveCamera,
        route?: Route,
        test?: any
    ) {
        this.position = new THREE.Vector3();
        this.binormal = new THREE.Vector3(0, 0, 0);
        this.direction = new THREE.Vector3();
        this.normal = new THREE.Vector3(0, 0, 0);
        this.lookAt = new THREE.Vector3();

        this.scale = 1;

        // tube
        let parent = new THREE.Object3D();
        scene.add(parent);

        if (!camera) {
            this.splineCamera = new THREE.PerspectiveCamera(
                44,
                window.innerWidth / window.innerHeight,
                0.01,
                1000
            );
        } else {
            this.splineCamera = camera;
        }

        parent.add(this.splineCamera);

        // var extrudePath = splines["TorusKnot"];
        var extrudePath = splines["SampleClosedSpline"];
        if (route || test) {
            // extrudePath = route.routeLine.curve;
            extrudePath = test;
        }

        this.tubeGeometry = new THREE.TubeBufferGeometry(
            extrudePath,
            200,
            1,
            3,
            false
        );
        const material = new THREE.MeshLambertMaterial({
            color: 0xff00ff,
            depthTest: false,
            visible: false,
        });
        this.mesh = new THREE.Mesh(this.tubeGeometry, material);
        parent.add(this.mesh);
        this.mesh.scale.set(this.scale, this.scale, this.scale);

        this.followMesh = new THREE.Mesh(
            new BoxBufferGeometry(5, 5, 5),
            material
        );
        this.splineCamera.add(this.followMesh);
    }

    public render(camera?: THREE.PerspectiveCamera) {
        // animate camera along spline
        if (camera) this.splineCamera = camera;

        var time = Date.now();
        var looptime = 20 * 1000;
        var t = (time % looptime) / looptime;

        this.tubeGeometry.parameters.path.getPointAt(t, this.position);
        this.position.multiplyScalar(this.scale);

        // interpolation

        var segments = this.tubeGeometry.tangents.length;
        var pickt = t * segments;
        var pick = Math.floor(pickt);
        var pickNext = (pick + 1) % segments;

        this.binormal.subVectors(
            this.tubeGeometry.binormals[pickNext],
            this.tubeGeometry.binormals[pick]
        );
        this.binormal
            .multiplyScalar(pickt - pick)
            .add(this.tubeGeometry.binormals[pick]);

        this.tubeGeometry.parameters.path.getTangentAt(t, this.direction);
        var offset = -40;

        this.normal.copy(this.binormal).negate().cross(this.direction);

        // we move on a offset on its binormal
        // this.position.add(this.normal.clone().multiplyScalar(offset));
        this.position.sub(this.normal.clone().multiplyScalar(offset));

        this.splineCamera.position.copy(this.position);

        // using arclength for stablization in look ahead
        this.tubeGeometry.parameters.path.getPointAt(
            (t + 30 / this.tubeGeometry.parameters.path.getLength()) % 1,
            this.lookAt
        );
        this.lookAt.multiplyScalar(this.scale);

        // camera orientation 2 - up orientation via normal

        // if (!params.lookAhead)
        // this.lookAt.copy(this.position).add(this.direction);

        this.splineCamera.matrix.lookAt(
            this.splineCamera.position,
            this.lookAt,
            this.normal
        );
        this.splineCamera.quaternion.setFromRotationMatrix(
            this.splineCamera.matrix
        );
    }
}
