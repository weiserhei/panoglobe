import $ from "jquery";
import { Icon } from "@fortawesome/fontawesome-svg-core";

import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export default class HtmlMover {
    private css2dobject: CSS2DObject;
    private _visible: boolean = false;
    constructor(scene: THREE.Scene, faIcon: Icon) {
        //@ts-ignore
        this.css2dobject = new CSS2DObject(faIcon.node[0]);
        scene.add(this.css2dobject);
        // $(this.css2dobject.element).addClass("d-none");
        this._visible = false;
    }

    public toggle() {
        $(this.css2dobject.element).fadeToggle(200);
    }

    set visible(value: boolean) {
        this.css2dobject.visible = value;
        this._visible = value;
    }

    public update(
        ocluded: boolean,
        dot: number,
        position: THREE.Vector3,
        color: THREE.Color
    ): void {
        this.css2dobject.position.copy(position);
        this.css2dobject.element.style.color = color.getStyle();
        if (this._visible) {
            if (!ocluded) {
                // @ts-ignore
                this.css2dobject.element.style.opacity = String(1);
                // $(this.i.node[0]).fadeIn(200);
            } else {
                // @ts-ignore
                this.css2dobject.element.style.opacity = String(1 + dot * 4);
                // @ts-ignore
                // console.log("ocluded", ocluded, this.i.node[0].style);
                // $(this.i.node[0]).fadeOut(200);
            }
        }
    }
}
