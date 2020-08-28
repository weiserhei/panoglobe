import TWEEN from "@tweenjs/tween.js";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import "./../../css/label.css";
import $ from "jquery";
// import { icon } from "@fortawesome/fontawesome-svg-core";
// import { faMapPin } from "@fortawesome/free-solid-svg-icons";

export default class Label {
    private visible: boolean;
    public domElement: HTMLElement;
    public css2dobject: CSS2DObject;

    constructor(
        text: string,
        scene: THREE.Scene,
        positionVector: THREE.Vector3
    ) {
        this.visible = true;
        // this._box = document.createElement('div');
        // this._box.className = "htmlLabel badge badge-dark";
        const domElement = document.createElement("button");
        this.domElement = domElement;
        // domElement.className = "htmlLabel btn btn-sm btn-dark";
        domElement.className =
            "htmlLabel btn btn-link shadow-none text-white font-weight-bold panotest";
        domElement.style.textShadow = "0 0 6px #000";
        // this._box.style.textDecoration = "none";
        // offset label from center to compensate height
        domElement.style.top = "-1.2em";
        domElement.innerHTML = text;

        // const pinIcon = icon(faMapPin, {
        //     styles: {
        //         // color: "#ffffff",
        //         filter: "drop-shadow(0px 0px 1px rgba(0,0,0))",
        //     },
        //     classes: ["d-block mx-auto fa-lg"],
        // });

        // domElement.appendChild(pinIcon.node[0]);
        this.css2dobject = new CSS2DObject(domElement);
        this.css2dobject.position.copy(positionVector);
        scene.add(this.css2dobject);

        // @ts-ignore
        // this.getSpawnTween = spawn2(this.css2dobject, followMesh);
        // css2dlabel.position.y -= 20;

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
            this.css2dobject.visible = true;
            this.visible = false;
            $(this.domElement).fadeIn(400, () => {
                this.visible = true;
            });
        } else {
            this.css2dobject.visible = false;
        }
    }

    public update(ocluded: boolean, dot: number): void {
        // overlay is visible
        if (this.visible) {
            if (!ocluded) {
                // this.css2dobject.visible = true;
                this.domElement.style.opacity = String(1);
                // $(this.domElement).fadeIn(200);
            } else {
                // this.css2dobject.visible = false;
                // HIDE EACH BLOB+LABEL IF CAMERA CANT SEE IT (I.E. WHEN IT IS BEHIND THE GLOBE)
                this.domElement.style.opacity = String(1 + dot * 4);
                // $(this.domElement).fadeOut(200);
            }
        }
    }
}
