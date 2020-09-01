import { Vector3 } from "three";
import $ from "jquery";
import { numberWithCommas } from "../utils/panoutils";
import { icon } from "@fortawesome/fontawesome-svg-core";
import { faTimes, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

import Controls from "./controls";

function makeSafeForCSS(name: string) {
    return name.replace(/[^a-z0-9]/g, function (s) {
        var c = s.charCodeAt(0);
        if (c == 32) return "-";
        if (c >= 65 && c <= 90) return "_" + s.toLowerCase();
        return "__" + ("000" + c.toString(16)).slice(-4);
    });
}

export default class InfoBox {
    private visible: boolean = true;
    private box: HTMLElement = document.createElement("div");
    private screenVector: THREE.Vector3 = new Vector3();
    private id: string;

    public nextButton: HTMLElement;
    public prevButton: HTMLElement;
    public closeButton: HTMLElement;

    constructor(
        parentDomNode: HTMLElement,
        controls: Controls,
        private city: Poi
    ) {
        parentDomNode.appendChild(this.box);

        this.id = makeSafeForCSS(city.adresse);

        const lat = Math.round((Number(city.lat) + Number.EPSILON) * 100) / 100;
        const lng = Math.round((Number(city.lng) + Number.EPSILON) * 100) / 100;

        const linkIcon = icon(faExternalLinkAlt, {
            classes: ["mr-2"],
        }).html;

        this.box.className =
            "toast position-absolute fixed-bottom mx-auto mr-md-5 fade hide bg-white";
        this.box.style.bottom = "80px";
        // this.box.style.left = "20px";
        this.box.id = this.id;
        this.box.setAttribute("data-autohide", "false");

        this.closeButton = document.createElement("button");
        this.closeButton.setAttribute("type", "button");
        this.closeButton.setAttribute("data-dismiss", "toast");
        this.closeButton.className = "ml-2 mb-1 close";
        this.closeButton.innerHTML = `<span aria-hidden="true">&times;</span>`;

        // <div aria-live="polite" aria-atomic="true" style="position: relative; min-height: 200px;">
        // <img src="..." class="rounded mr-2" alt="...">

        const toastHeader = document.createElement("div");
        toastHeader.className = "toast-header";
        toastHeader.innerHTML = `<strong class="mr-auto">${
            city.adresse
        }</strong>
            <small>${numberWithCommas(
                Math.floor(city.hopDistance)
            )} km</small>`;
        toastHeader.appendChild(this.closeButton);
        this.box.appendChild(toastHeader);
        const toastBody = document.createElement("div");
        toastBody.className = "toast-body bg-white position-relative";
        toastBody.innerHTML = `
        <p>
        <a class="" href='${city.externerlink}' target='_blank'>${linkIcon}${city.externerlink}</a>
        </p>
        `;
        // <span class="badge badge-info">Lat. ${lat}</span> <span class="badge badge-info">Long. ${lng}</span>
        this.box.appendChild(toastBody);

        this.nextButton = document.createElement("button");
        this.nextButton.className = "btn btn-primary float-right btn-sm";
        this.nextButton.innerHTML = "Next";

        this.prevButton = document.createElement("button");
        this.prevButton.className = "btn btn-primary btn-sm";
        this.prevButton.innerHTML = "Previous";
        // const footer = document.createElement("div");
        // footer.className = "card-footer";

        toastBody.appendChild(this.nextButton);
        toastBody.appendChild(this.prevButton);
        // this.box.appendChild(footer);

        //@ts-ignore
        // $(this.box).toast();
        //@ts-ignore
        // $(this.box).toast("hide");

        function handleMouseUp() {
            controls.enabled = true;
        }

        // this.closeButton.addEventListener(
        //     "mousedown",
        //     function () {
        //         controls.enabled = false;
        //         this.addEventListener("mouseup", handleMouseUp, false);
        //         this.addEventListener("mouseout", handleMouseUp, false);
        //     },
        //     false
        // );
        // this.box.addEventListener(
        //     "mousedown",
        //     function () {
        //         controls.enabled = false;
        //         this.addEventListener("mouseup", handleMouseUp, false);
        //         this.addEventListener("mouseout", handleMouseUp, false);
        //     },
        //     false
        // );
    }

    get isVisible() {
        return this.visible;
    }

    set isVisible(value: boolean) {
        this.visible = value;
        // console.trace("isVis", value, this.id);
        if (value) {
            //@ts-ignore
            $(`#${this.id}`).toast("show");
            // $(this.box).toast("show");
            // this.box.style.display = "block";
            // this.box.classList.add("fadeIn");
        } else {
            //@ts-ignore
            $(`#${this.id}`).toast("hide");
            // $(this.box).toast("hide");
            // this.box.style.display = "none";
            // this.box.classList.remove("fadeIn");
        }
    }

    public update(
        camera: THREE.Camera,
        positionVector: THREE.Vector3,
        ocluded: boolean,
        active: boolean
    ) {
        // hide label when ocluded
        // if (ocluded && this.isVisible && active) {
        //     this.isVisible = false;
        // } else if (!ocluded && !this.isVisible && active) {
        //     this.isVisible = true;
        // }

        if (this.isVisible) {
            // overlay is visible
            // fix label lag
            camera.updateMatrixWorld();

            this.screenVector.copy(positionVector).project(camera);
            const posx = ((1 + this.screenVector.x) * window.innerWidth) / 2;
            const posy = ((1 - this.screenVector.y) * window.innerHeight) / 2;
            const boundingRect = this.box.getBoundingClientRect();

            // https://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
            // this.box.style.transform =
            //     "translate(" +
            //     Math.floor(posx - boundingRect.width - 28) +
            //     "px, " +
            //     Math.floor(posy - 23) +
            //     "px)";

            // this.style.left = (posx - boundingRect.width - 28) + 'px';
            // this.style.top = (posy - 23) + 'px';
        }
    }

    // get domElement() {
    //     return this.box;
    // }
}
