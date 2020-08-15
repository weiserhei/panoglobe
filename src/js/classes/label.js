import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import "./../../css/label.css";
// import * as $ from "jquery";
// import TWEEN from '@tweenjs/tween.js';
import { icon } from "@fortawesome/fontawesome-svg-core";
import { faMapPin } from "@fortawesome/free-solid-svg-icons";

export default class Label {
    constructor(parentDomNode, text, scene, followMesh) {
        this.visible = false;
        // this._box = document.createElement('div');
        // this._box.className = "htmlLabel badge badge-dark";
        this.box = document.createElement("button");
        // this._box.className = "htmlLabel btn btn-sm btn-dark";
        // google maps style labels
        this.box.className =
            "htmlLabel btn btn-link shadow-none text-white font-weight-bold";
        this.box.style.textShadow = "0 0 6px #000";
        // this._box.style.textDecoration = "none";
        this.box.innerHTML = text;

        // parentDomNode.appendChild(this.box);
        this.parentDomNode = parentDomNode;

        const pinIcon = icon(faMapPin, {
            styles: {
                color: "#ffffff",
                filter: "drop-shadow(0px 0px 1px rgba(0,0,0))",
            },
            // classes: ["fa-lg"],
            classes: ["d-block mx-auto"],
        });

        this.box.appendChild(pinIcon.node[0]);

        var css2dlabel = new CSS2DObject(this.box);
        css2dlabel.position.copy(followMesh.position);
        // css2dlabel.position.y += 2;
        scene.add(css2dlabel);

        // const boundingRect = this.box.getBoundingClientRect();
        // const left = (0 - boundingRect.width + boundingRect.width / 2);
        // const top = (0 - boundingRect.height * 2.4);
        // this._box.style.left = (posx - boundingRect.width + boundingRect.width / 2) + 'px';
        // https://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
        // this.box.style.transform = 'translate(0px, ' + Math.floor(top) + 'px)';

        // offset label from center to compensate height
        this.box.style.top = "-1.2em";
    }

    get domElement() {
        return this.box;
    }

    get isVisible() {
        return this.visible;
    }

    set isVisible(value) {
        this.visible = value;

        if (value === true) {
            this.box.style.visibility = "visible";
        } else {
            this.box.style.visibility = "hidden";
        }
    }

    update(ocluded, dot) {
        // overlay is visible
        if (this.isVisible) {
            if (!ocluded) {
                this.box.style.opacity = 1;
                // $(this.box).fadeIn(200);
            } else {
                // HIDE EACH BLOB+LABEL IF CAMERA CANT SEE IT (I.E. WHEN IT IS BEHIND THE GLOBE)
                this.box.style.opacity = 1 + dot * 4;
                // $(this.box).fadeOut(200);
            }
        }
    }
}
