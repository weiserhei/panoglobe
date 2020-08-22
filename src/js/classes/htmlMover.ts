import $ from "jquery";
import { icon, Icon } from "@fortawesome/fontawesome-svg-core";
import {
    faMapMarker,
    faMapMarkerAlt,
    faCircle,
    faCircleNotch,
    faHighlighter,
} from "@fortawesome/free-solid-svg-icons";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export default class HtmlMover {
    private css2dobject: CSS2DObject;
    private css2dobject2: CSS2DObject;
    private i: Icon;
    private marker: Icon;
    constructor(scene: THREE.Scene) {
        this.marker = icon(faMapMarkerAlt, {
            styles: {
                color: "#fff",
                // opacity: "0.5",
                // filter: "drop-shadow(0px 3px 3px rgba(255,255,255,1))",
                filter: "drop-shadow(0px 3px 1px rgba(0,0,0,0.5))",
            },
            classes: ["fa-lg", "mt-n3"],
            // classes: ["fa-2x", "mt-n3", "ml-2", "pl-2"],
        });
        // @ts-ignore
        this.css2dobject2 = new CSS2DObject(this.marker.node[0]);
        scene.add(this.css2dobject2);

        this.i = icon(faHighlighter, {
            styles: {
                color: "#fff",
                // opacity: "0.5",
                // filter: "drop-shadow(0px 3px 3px rgba(255,255,255,1))",
                filter: "drop-shadow(0px 3px 1px rgba(0,0,0,0.5))",
            },
            classes: ["fa-2x", "mt-n3", "ml-2", "pl-2"],
            // classes: ["fa-lg"],
        });
        // @ts-ignore
        this.css2dobject = new CSS2DObject(this.i.node[0]);
        // domElement.style.top = "-1.2em";
        // this.css2dobject = new CSS2DObject(i.node[0]);
        // this.css2dobject.position.copy(followMesh.position);
        // this.mesh.add(this.css2dobject);
        scene.add(this.css2dobject);
    }

    set visible(value: boolean) {
        this.css2dobject.visible = value;
        this.css2dobject2.visible = value;
    }

    public moving(value: boolean) {
        if (value == true) {
            // $(this.css2dobject.element).removeClass("d-none");
            // $(this.css2dobject2.element).addClass("d-none");
            $(this.css2dobject.element).fadeIn().removeClass("d-none");
            $(this.css2dobject2.element).fadeOut().addClass("d-none");
        } else {
            // $(this.css2dobject.element).addClass("d-none");
            // $(this.css2dobject2.element).removeClass("d-none");
            $(this.css2dobject.element).fadeOut().addClass("d-none");
            $(this.css2dobject2.element).fadeIn().removeClass("d-none");
        }
    }

    public update(
        ocluded: boolean,
        dot: number,
        position: THREE.Vector3,
        color: THREE.Color
    ): void {
        this.css2dobject.position.copy(position);
        this.css2dobject.element.style.color = color.getStyle();
        this.css2dobject2.position.copy(position);
        this.css2dobject2.element.style.color = color.getStyle();

        if (!ocluded) {
            // @ts-ignore
            this.css2dobject.element.style.opacity = String(1);
            this.css2dobject2.element.style.opacity = String(1);
            // $(this.i.node[0]).fadeIn(200);
        } else {
            // @ts-ignore
            this.css2dobject.element.style.opacity = String(1 + dot * 4);
            this.css2dobject2.element.style.opacity = String(1 + dot * 4);
            // @ts-ignore
            // console.log("ocluded", ocluded, this.i.node[0].style);
            // $(this.i.node[0]).fadeOut(200);
        }
    }
}
