import * as THREE from "three";

export default class Label {

    constructor(parentDomNode, text) {

        this._isVisible = false;
        // this._box = document.createElement('div');
        // this._box.className = "htmlLabel badge badge-dark";
        this._box = document.createElement("button");
        // this._box.className = "htmlLabel btn btn-sm btn-dark";
        // google maps style labels
        this._box.className = "htmlLabel btn btn-link btn-sm text-white font-weight-bold";
        this._box.style.textShadow = "0 0 3px #000";
        // this._box.style.textDecoration = "none";
        this._box.innerHTML = text;

        parentDomNode.appendChild(this._box);
        this._parentDomNode = parentDomNode;

        this._screenVector = new THREE.Vector3();

    }

    get domElement() {
        return this._box;
    }

    get isVisible() {
        return this._isVisible;
    }

    set isVisible(value) {
        this._isVisible = value;

        if(value === true) {
            this._box.style.visibility = "visible";
        } else {
            this._box.style.visibility = "hidden";
        }
    }

    update( camera, followMesh, ocluded, dot ) {
        // overlay is visible
        if( this._isVisible ) {

            this._screenVector.set(0, 0, 0);
            followMesh.localToWorld(this._screenVector);
            this._screenVector.project(camera);
            
            var posx = Math.round((this._screenVector.x + 1) * this._parentDomNode.offsetWidth / 2);
            var posy = Math.round((1 - this._screenVector.y) * this._parentDomNode.offsetHeight / 2);
            
            var boundingRect = this._box.getBoundingClientRect();
            const left = (posx - boundingRect.width + boundingRect.width / 2);
            const top = (posy - boundingRect.height * 1.3);
            // this._box.style.left = (posx - boundingRect.width + boundingRect.width / 2) + 'px';
            // this._box.style.top = (posy - boundingRect.height * 1.3) + 'px';
            // https://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
            this._box.style.transform = 'translate(' + Math.floor(left) + 'px, ' + Math.floor(top) + 'px)';
            
            if( ! ocluded ) {
                this._box.style.opacity = 1;
            }
            else { 
                //HIDE EACH BLOB+LABEL IF CAMERA CANT SEE IT (I.E. WHEN IT IS BEHIND THE GLOBE)
                this._box.style.opacity = 1 + dot * 2;
            }
        }

    }

}