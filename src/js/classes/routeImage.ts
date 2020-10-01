import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

import Route from "./route";

export default class RouteImage {
    private css2dobject: CSS2DObject;
    private htmlImage: HTMLImageElement;

    constructor(scene: THREE.Scene) {
        const domElement = document.createElement("div");
        // domElement.className = "bg-info";
        //     "btn p-0 btn-link shadow-none text-white font-weight-bold";
        domElement.style.textShadow = "0 0 6px #000";
        // this._box.style.textDecoration = "none";
        domElement.style.left = "8em";
        this.htmlImage = document.createElement("img");
        this.htmlImage.src =
            "https://dev.panoreisen.de/index.php?rex_media_type=square_s&rex_media_file=roland_sw.jpg";
        this.htmlImage.className =
            "rounded-circle w-50 img-fluid position-relative";
        this.htmlImage.style.border = "5px solid #fff";
        domElement.appendChild(this.htmlImage);
        // domElement.innerHTML =
        // '<img src="https://dev.panoreisen.de/index.php?rex_media_type=square_s&rex_media_file=roland_sw.jpg" \
        // '<img src="https://dev.panoreisen.de/index.php?rex_media_type=halfsquare&rex_media_file=300_-_mexiko_-_02.jpg" \
        // style="border:5px solid #fff; border-radius:50%;" alt="avatar">';
        this.css2dobject = new CSS2DObject(domElement);
        this.visible(false);
        scene.add(this.css2dobject);
    }

    public addRoute(route: Route) {
        console.log(route.marker[0].poi.images2);
        this.htmlImage.src = route.marker[0].poi.images2.replace(/&amp;/g, "&");
        // this.htmlImage.src =
        // "https://dev.panoreisen.de/index.php?rex_media_type=square_s&rex_media_file=000_-_zurueck_nach_unterwegs_-_03_-_jpg.jpg";
    }

    public intersect(intersection: {
        faceIndex: number;
        point: THREE.Vector3;
    }) {
        this.css2dobject.position.copy(intersection.point);
        this.css2dobject.visible = true;

        if (intersection.faceIndex > 0) {
        }
    }
    public visible(value: boolean) {
        this.css2dobject.visible = value;
    }
}
