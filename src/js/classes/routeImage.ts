import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

import Route from "./route";
import Marker from "./marker";
import { Vector3 } from "three";

export default class RouteImage {
    private css2dobject: CSS2DObject;
    private htmlImage: HTMLImageElement;
    private route: Route;
    private timeHandle: any[] = [];

    constructor(scene: THREE.Scene, route: Route) {
        this.addRoute(route);

        const domElement = document.createElement("div");
        // domElement.className = "bg-info";
        //     "btn p-0 btn-link shadow-none text-white font-weight-bold";
        domElement.style.textShadow = "0 0 6px #000";
        // this._box.style.textDecoration = "none";
        domElement.style.left = "9em";
        domElement.style.top = "5em";
        this.htmlImage = document.createElement("img");
        // this.htmlImage.src =
        //     "https://dev.panoreisen.de/index.php?rex_media_type=square_s&rex_media_file=roland_sw.jpg";
        this.htmlImage.className =
            "rounded-circle w-75 img-fluid position-relative";
        this.htmlImage.style.border = "3px solid #6c757d";
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
        // console.log(route.marker[0].poi.images2);
        // this.htmlImage.src = route.marker[0].poi.images2.replace(/&amp;/g, "&");
        // this.route = route;
    }

    // Marker hat keine Bilder mehr
    // public setMarker(marker: Marker) {
    //     console.trace("set Marker");
    //     this.htmlImage.src = marker.poi.images2[0].replace(/&amp;/g, "&");
    //     this.css2dobject.position.copy(marker.poi.displacedPos);
    // }

    public setImage(image: string) {
        this.htmlImage.src = image.replace(/&amp;/g, "&");
    }

    public setImages(images: string[]) {
        this.htmlImage.src = images[0].replace(/&amp;/g, "&");
        this.timeHandle.forEach((handle) => clearTimeout(handle));

        if (images.length > 1) {
            for (let i = 0; i < images.length; i++) {
                ((i) => {
                    this.timeHandle.push(
                        setTimeout(() => {
                            this.htmlImage.src = images[i].replace(
                                /&amp;/g,
                                "&"
                            );
                        }, 3000 * i)
                    );
                })(i);
            }
        }
    }

    public update(position: Vector3) {
        this.css2dobject.position.copy(position);
    }

    public intersect(intersection: {
        faceIndex: number;
        point: THREE.Vector3;
    }) {
        this.css2dobject.position.copy(intersection.point);
        this.css2dobject.visible = true;
        // console.log(intersection);

        // 0 - 248
        const progressIndex = this.route.routeLine.getIndexFromDrawcount(
            intersection.faceIndex
        );

        for (let i = 0; i < this.route.marker.length; i++) {
            if (progressIndex <= 0) return;
            if (this.route.marker[i].index >= progressIndex) {
                // console.log(this.route.marker[i].index, i);
                this.htmlImage.src = this.route.marker[
                    i
                ].poi.images2[0].replace(/&amp;/g, "&");
                return;
            }
        }

        // console.log(progressIndex);

        // const result = this.route.marker.find((marker: Marker) => {
        //     // return marker.index === Math.floor(progressIndex);
        //     return marker.index >= Math.floor(progressIndex);
        // });

        // if (result) {
        //     this.htmlImage.src = result.poi.images2.replace(/&amp;/g, "&");
        //     console.log(this.htmlImage);
        // }
        // if (intersection.faceIndex > 0) {
        // }
    }
    public visible(value: boolean) {
        this.css2dobject.visible = value;
    }
}
