import * as THREE from "three";
import { numberWithCommas } from "../../utils/panoutils";

export default class InfoBox {

    constructor(parentDomNode, city) {

        this._box = document.createElement('div');
        this._closeButton;
        this._isVisible;
        
        parentDomNode.appendChild(this._box);
        const lng = (Math.round(city.lng * 100) / 100).toFixed(2);
        const lat = (Math.round(city.lat * 100) / 100).toFixed(2);

        let text = "<div class='labelHead'>";
        text += "<b>" + city.adresse + "</b>";
        text += " (" + numberWithCommas(Math.floor(city.hopDistance)) + " km)";
        text += "</div>";
        text += "<div class='labelContent'>";
        text += "<p>Lat: " + lat + " | Long: " + lng + "</p>";
        text += "<p><a href='" + city.externerlink + "' target='_blank'><i class='fas fa-external-link-alt'></i> Point of Interest</a></p>";
        text += "</div>";
        text += "<div class='arrow'></div>";
        this._box.innerHTML = text;
        this._box.className = "htmlLabel infobox";
        this._box.style.display = "none";

        this._nextButton = document.createElement("button");
        this._nextButton.className = "btn btn-secondary float-right btn-sm";
        this._nextButton.innerHTML = "Next";

        this._prevButton = document.createElement("button");
        this._prevButton.className = "btn btn-secondary btn-sm";
        this._prevButton.innerHTML = "Previous";
        const footer = document.createElement("div");
        footer.className = "card-footer";

        footer.appendChild(this._nextButton);
        footer.appendChild(this._prevButton);
        this._box.appendChild(footer);

        this._closeButton = document.createElement("button");
        this._closeButton.className = "btn btn-sm btn-danger shadow-none closeButton";
        this._closeButton.innerHTML = '<i class="fas fa-times"></i>';
        this._box.appendChild(this._closeButton);

        const screenVector = new THREE.Vector3();

        this._box.updatePosition = function( camera, followMesh ) {
            // overlay is visible
            screenVector.set(0, 0, 0);
            followMesh.localToWorld(screenVector);
            screenVector.project(camera);

            var posx = Math.round((screenVector.x + 1) * parentDomNode.offsetWidth / 2);
            var posy = Math.round((1 - screenVector.y) * parentDomNode.offsetHeight / 2);

            var boundingRect = this.getBoundingClientRect();
            this.style.left = (posx - boundingRect.width - 28) + 'px';
            this.style.top = (posy - 23) + 'px';
        }
    }

    update( camera, followMesh, ocluded, active ) {

        // hide label when ocluded
        if( ocluded && this._isVisible && active ) {
            this.isVisible = false;
        } else if ( ! ocluded && ! this._isVisible && active ) {
            this.isVisible = true;
        }

        if( this._isVisible ) {
            this._box.updatePosition( camera, followMesh );
        }
    }

    get isVisible() {
        return this._isVisible;
    }

    set isVisible( value ) {

        this._isVisible = value;
        if( value ) {
            this._box.style.display = "block";
            this._box.classList.add("fadeIn");
        } else {
            this._box.style.display = "none";
            this._box.classList.remove("fadeIn");
        }
    }

    get nextButton() {
        return this._nextButton;
    }

    get prevButton() {
        return this._prevButton;
    }
    
    get domElement() {
        return this._box;
    }

    get closeButton() {
        return this._closeButton;
    }

}