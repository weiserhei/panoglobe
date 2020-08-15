import { Vector3 } from "three";
import { numberWithCommas } from "./../utils/panoutils";
import { library, icon } from "@fortawesome/fontawesome-svg-core";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export default class InfoBox {
    constructor(parentDomNode, city) {
        this.visible = false;

        this.box = document.createElement("div");
        parentDomNode.appendChild(this.box);
        const lng = (Math.round(city.lng * 100) / 100).toFixed(2);
        const lat = (Math.round(city.lat * 100) / 100).toFixed(2);

        let text = "<div class='labelHead'>";
        text += "<b>" + city.adresse + "</b>";
        text += " (" + numberWithCommas(Math.floor(city.hopDistance)) + " km)";
        text += "</div>";
        text += "<div class='labelContent'>";
        text += "<p>Lat: " + lat + " | Long: " + lng + "</p>";
        text +=
            "<p><a href='" +
            city.externerlink +
            "' target='_blank'><i class='fas fa-external-link-alt'></i> Point of Interest</a></p>";
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
        this.closeButton.innerHTML = icon(faTimes, {
            styles: { filter: "drop-shadow(0px 0px 1px rgba(0,0,0))" },
            classes: ["fa-lg"],
        }).html;
        this.box.appendChild(this.closeButton);

        const screenVector = new Vector3();

        this.box.updatePosition = function update(camera, followMesh) {
            // overlay is visible
            screenVector.copy(followMesh.position).project(camera);

            const posx = ((1 + screenVector.x) * parentDomNode.offsetWidth) / 2;
            const posy =
                ((1 - screenVector.y) * parentDomNode.offsetHeight) / 2;
            const boundingRect = this.getBoundingClientRect();

            // https://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
            this.style.transform =
                "translate(" +
                Math.floor(posx - boundingRect.width - 28) +
                "px, " +
                Math.floor(posy - 23) +
                "px)";
            // this.style.left = (posx - boundingRect.width - 28) + 'px';
            // this.style.top = (posy - 23) + 'px';
        };
    }

    get isVisible() {
        return this.visible;
    }

    set isVisible(value) {
        this.visible = value;
        if (value) {
            this.box.style.display = "block";
            this.box.classList.add("fadeIn");
        } else {
            this.box.style.display = "none";
            this.box.classList.remove("fadeIn");
        }
    }

    update(camera, followMesh, ocluded, active) {
        // hide label when ocluded
        if (ocluded && this.isVisible && active) {
            this.isVisible = false;
        } else if (!ocluded && !this.isVisible && active) {
            this.isVisible = true;
        }

        if (this.isVisible) {
            this.box.updatePosition(camera, followMesh);
        }
    }

    get domElement() {
        return this.box;
    }
}
