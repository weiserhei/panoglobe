import { Vector3 } from "three";
import { numberWithCommas } from "../utils/panoutils";
import { icon } from "@fortawesome/fontawesome-svg-core";
import { faTimes, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

import Controls from "./controls";

export default class InfoBox {
    private visible: boolean;
    private box: HTMLElement;
    private screenVector: THREE.Vector3;
    public nextButton: HTMLElement;
    public prevButton: HTMLElement;
    public closeButton: HTMLElement;
    constructor(parentDomNode: HTMLElement, controls: Controls, city: Poi) {
        this.visible = false;
        this.screenVector = new Vector3();
        this.box = document.createElement("div");
        parentDomNode.appendChild(this.box);

        //@ts-ignore
        const lat = Math.round((Number(city.lat) + Number.EPSILON) * 100) / 100;
        const lng = Math.round((Number(city.lng) + Number.EPSILON) * 100) / 100;

        const linkIcon = icon(faExternalLinkAlt, {
            classes: [],
        }).html;

        let text = "<div class='labelHead'>";
        text += `<b>${city.adresse}</b>`;
        text += " (" + numberWithCommas(Math.floor(city.hopDistance)) + " km)";
        text += "</div>";
        text += "<div class='labelContent'>";
        text += `<p><span class="badge badge-info">Lat. ${lat}</span> <span class="badge badge-info">Long. ${lng}</span></p>`;
        text += `<p><a href='${city.externerlink}' target='_blank'>${linkIcon}</i> Point of Interest</a></p>`;
        text += "</div>";
        text += "<div class='arrow'></div>";
        this.box.innerHTML = text;
        this.box.className = "htmlLabel infobox";
        this.box.style.display = "none";

        this.nextButton = document.createElement("button");
        this.nextButton.className = "btn btn-secondary float-right btn-sm";
        this.nextButton.innerHTML = "Next";

        this.prevButton = document.createElement("button");
        this.prevButton.className = "btn btn-secondary btn-sm";
        this.prevButton.innerHTML = "Previous";
        const footer = document.createElement("div");
        footer.className = "card-footer";

        footer.appendChild(this.nextButton);
        footer.appendChild(this.prevButton);
        this.box.appendChild(footer);

        this.closeButton = document.createElement("button");
        this.closeButton.className =
            "btn btn-sm btn-danger shadow-none closeButton position-absolute";
        this.closeButton.innerHTML = String(
            icon(faTimes, {
                styles: { filter: "drop-shadow(0px 0px 1px rgba(0,0,0))" },
                classes: ["fa-lg"],
            }).html
        );
        this.box.appendChild(this.closeButton);

        function handleMouseUp() {
            controls.enabled = true;
        }

        this.closeButton.addEventListener(
            "mousedown",
            function () {
                controls.enabled = false;
                this.addEventListener("mouseup", handleMouseUp, false);
                this.addEventListener("mouseout", handleMouseUp, false);
            },
            false
        );
        this.domElement.addEventListener(
            "mousedown",
            function () {
                controls.enabled = false;
                this.addEventListener("mouseup", handleMouseUp, false);
                this.addEventListener("mouseout", handleMouseUp, false);
            },
            false
        );
    }

    get isVisible() {
        return this.visible;
    }

    set isVisible(value: boolean) {
        this.visible = value;
        if (value) {
            this.box.style.display = "block";
            this.box.classList.add("fadeIn");
        } else {
            this.box.style.display = "none";
            this.box.classList.remove("fadeIn");
        }
    }

    public update(
        camera: THREE.Camera,
        positionVector: THREE.Vector3,
        ocluded: boolean,
        active: boolean
    ) {
        // hide label when ocluded
        if (ocluded && this.isVisible && active) {
            this.isVisible = false;
        } else if (!ocluded && !this.isVisible && active) {
            this.isVisible = true;
        }

        if (this.isVisible) {
            // overlay is visible
            // fix label lag
            camera.updateMatrixWorld();

            this.screenVector.copy(positionVector).project(camera);
            const posx = ((1 + this.screenVector.x) * window.innerWidth) / 2;
            const posy = ((1 - this.screenVector.y) * window.innerHeight) / 2;
            const boundingRect = this.box.getBoundingClientRect();

            // https://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
            this.box.style.transform =
                "translate(" +
                Math.floor(posx - boundingRect.width - 28) +
                "px, " +
                Math.floor(posy - 23) +
                "px)";
            // this.style.left = (posx - boundingRect.width - 28) + 'px';
            // this.style.top = (posy - 23) + 'px';
        }
    }

    get domElement() {
        return this.box;
    }
}
