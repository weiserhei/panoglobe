import TWEEN from "@tweenjs/tween.js";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import "./../../css/label.css";
// import * as $ from "jquery";
import { icon } from "@fortawesome/fontawesome-svg-core";
import { faMapPin } from "@fortawesome/free-solid-svg-icons";

function spawn2(label: CSS2DObject, mesh: THREE.Mesh) {
    label.position.y += 20;

    return (
        // @ts-ignore
        new TWEEN.Tween(label.position)
            // @ts-ignore
            .to({ y: mesh.position.y }, 1500)
            // .easing( TWEEN.Easing.Circular.InOut )
            // .easing( TWEEN.Easing.Quintic.InOut )
            // .easing(TWEEN.Easing.Cubic.InOut)
            .easing(TWEEN.Easing.Bounce.Out)
            // .easing(easing || Config.easing)
            .onStart(() => {
                // this.enabled = false;
            })
            // .repeat(Infinity)
            .onComplete(() => {})
        // @ts-ignore
        // .start()
    );
}

export default class Label {
    private visible: boolean;
    public domElement: HTMLElement;
    public animation: () => void;
    public getSpawnTween: () => any;

    constructor(text: string, scene: THREE.Scene, followMesh: THREE.Mesh) {
        this.visible = true;
        // this._box = document.createElement('div');
        // this._box.className = "htmlLabel badge badge-dark";
        const domElement = document.createElement("button");
        this.domElement = domElement;
        // domElement.className = "htmlLabel btn btn-sm btn-dark";
        domElement.className =
            "htmlLabel btn btn-link shadow-none text-white font-weight-bold";
        domElement.style.textShadow = "0 0 6px #000";
        // this._box.style.textDecoration = "none";
        // offset label from center to compensate height
        domElement.style.top = "-1.2em";
        domElement.innerHTML = text;

        const pinIcon = icon(faMapPin, {
            styles: {
                color: "#ffffff",
                filter: "drop-shadow(0px 0px 1px rgba(0,0,0))",
            },
            // classes: ["fa-lg"],
            classes: ["d-block mx-auto"],
        });

        domElement.appendChild(pinIcon.node[0]);

        const css2dlabel = new CSS2DObject(domElement);
        css2dlabel.position.copy(followMesh.position);
        // css2dlabel.position.y += 5;
        scene.add(css2dlabel);

        // spawn(css2dlabel, followMesh);

        // @ts-ignore
        this.getSpawnTween = spawn2(css2dlabel, followMesh);

        this.animation = function () {};

        // const boundingRect = this.box.getBoundingClientRect();
        // const left = (0 - boundingRect.width + boundingRect.width / 2);
        // const top = (0 - boundingRect.height * 2.4);
        // this._box.style.left = (posx - boundingRect.width + boundingRect.width / 2) + 'px';
        // https://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
        // this.box.style.transform = 'translate(0px, ' + Math.floor(top) + 'px)';

        // this.setVisible = function (value: boolean) {
        //     this.visible = value;
        //     if (value === true) {
        //         domElement.style.visibility = "visible";
        //     } else {
        //         domElement.style.visibility = "hidden";
        //     }
        // };
    }

    public setVisible(value: boolean): void {
        this.visible = value;
        if (value === true) {
            this.domElement.style.visibility = "visible";
        } else {
            this.domElement.style.visibility = "hidden";
        }
    }

    public update(ocluded: boolean, dot: number): void {
        // overlay is visible
        if (this.visible) {
            if (!ocluded) {
                this.domElement.style.opacity = String(1);
                // $(this.box).fadeIn(200);
            } else {
                // HIDE EACH BLOB+LABEL IF CAMERA CANT SEE IT (I.E. WHEN IT IS BEHIND THE GLOBE)
                this.domElement.style.opacity = String(1 + dot * 4);
                // $(this.box).fadeOut(200);
            }
        }
    }
}
