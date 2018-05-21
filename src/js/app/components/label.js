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
            this._box.style.left = (posx - boundingRect.width + boundingRect.width / 2) + 'px';
            this._box.style.top = (posy - boundingRect.height * 1.3) + 'px';
            
            if( ! ocluded ) {
                // spriteGroup.children[ i ].scale.set( 1, 0.5, 1 ).multiplyScalar( 1 + eye.length() / 13 ); // SCALE SIZE OF FONT WHILE ZOOMING IN AND OUT //0.1800 * exe
                // this.spriteGroup.children[ i ].material.opacity = 0.9 / ( eye.length() / 100 );
                this._box.style.opacity = 1;
            }
            else { 
                //HIDE EACH BLOB+LABEL IF CAMERA CANT SEE IT (I.E. WHEN IT IS BEHIND THE GLOBE)
                // this.sprite.visible = false;
                this._box.style.opacity = 1 + dot * 2;
                // console.log( this.sprite );
            }
        }

    }

}