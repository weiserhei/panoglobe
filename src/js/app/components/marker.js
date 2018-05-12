import * as THREE from "three";
import { numberWithCommas } from "../../utils/panoutils";
import TextSprite from "./textSprite";

export default class Marker {

    constructor(color, positionVector, protoMesh) {

        this._active = false;
        this._domLabel = null;
        this._mesh = null;
        this._isVisible = true;

        const mesh = protoMesh.clone();
        mesh.material = protoMesh.material.clone();
        const hsl = color.getHSL({});
        //LOWER SATURATION FOR BLOBS
        hsl.s -= 0.2;
        mesh.material.color.setHSL(hsl.h, hsl.s, hsl.l);
        // marker.material.uniforms.diffuse.value.setHSL ( hsl.h, hsl.s, hsl.l );
        //LOWER BRIGHTNESS FOR EMISSIVE COLOR
        hsl.l -= 0.3;
        // mesh.material.uniforms.emissive.value.setHSL ( hsl.h, hsl.s, hsl.l );
        mesh.material.emissive.setHSL(hsl.h, hsl.s, hsl.l);
        // var ohgodwhy = position.clone();
        // ohgodwhy.y += markermesh.geometry.parameters.height / 10; // pyramid geometry
        mesh.position.copy(positionVector); // place mesh
        // mesh.lookAt( globe.mesh.position );
        const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.BackSide });
        this._outlineMesh = new THREE.Mesh(mesh.geometry, outlineMaterial);
        this._outlineMesh.scale.multiplyScalar(1.3);
        this._outlineMesh.visible = false;
		mesh.add(this._outlineMesh);
		
        this._mesh = mesh;
    }

    get isVisible() {
        return this._isVisible;
    }

    set isVisible(value) {
        this._outlineMesh.visible = value;
        this.mesh.visible = value;
        this.sprite.isVisible = value;
        this.deselect();

        this._isVisible = value;
    }

    get active() {
        return this._active;
    }

    get mesh() {
        return this._mesh;
    }

    get domElement() {
        return this._domLabel;
    }

    get sprite() {
        return this._sprite;
    }

    getSprite(text, position, showLabel) {

        const params = {
            fontsize: 28,
            borderThickness: 0,
            borderColor: { r: 255, g: 0, b: 0, a: 1.0 },
            backgroundColor: { r: 0, g: 0, b: 0, a: 0.4 },
            fontWeight: "normal"
        };

        this._sprite = new TextSprite(text, params, position);
        this._sprite.visible = showLabel;
        return this._sprite;
    }

    getInfoBox(parentDomNode, city, activeHandler) {

        const lng = (Math.round(city.lng * 100) / 100).toFixed(2);
        const lat = (Math.round(city.lat * 100) / 100).toFixed(2);
        const box = document.createElement('div');
        let text = "<div class='labelHead'>";
        text += "<b>" + city.adresse + "</b>";
        text += " (" + numberWithCommas(Math.floor(city.hopDistance)) + " km)";
        text += "</div>";
        text += "<div class='labelContent'>";
        text += "<p>Lat: " + lat + " | Long: " + lng + "</p>";
        text += "<p><a href='" + city.externerlink + "' target='_blank'><i class='fas fa-external-link-alt'></i> Point of Interest</a></p>";
        text += "</div>";
        text += "<div class='arrow'></div>";
        box.innerHTML = text;
        box.className = "hudLabel";
        box.style.display = "none";

		const button = document.createElement("button");
		button.className = "btn btn-sm btn-danger closeButton";
		button.innerHTML = '<i class="fas fa-times"></i>';
        box.appendChild(button);
        
		// close label on X click
		button.addEventListener("click", ()=>{
            this.deselect();
			activeHandler.active = null;
		});
        
        this._domLabel = box;

        const screenVector = new THREE.Vector3();

        box.hide = function() {
            this.style.display = "none";
            this.classList.remove("fadeIn");
        };
        box.show = function() {
            this.style.display = "block";
            this.classList.add("fadeIn");
        }
        box.update = function( camera, followMesh ) {
            this.show();

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

        parentDomNode.appendChild(box);

        return box;
    }
    
    select() {
        this._active = true;
        if( this.domElement !== null ) {
            this.domElement.show();
        }
        this.sprite.visible = false;
        // show outline mesh
        this._outlineMesh.visible = true;
    }
    
    deselect() {
        this._active = false;
        if( this.domElement !== null ) {
            this.domElement.hide();
        }
        this.sprite.visible = true;
        // hide outline mesh
        this._outlineMesh.visible = false;
    }
    
    linkify(activeHandler, lat, lon) {
        var that = activeHandler;
        var eventTarget = this.mesh;

        function handleClick(event) {
            // Hide the infoBox when itself is clicked again
            if (that.active === this) {
                this.deselect();
                that.active = null;
                return;
            }
            // if (this._controls.rotateToCoordinate instanceof Function) {
            if (this._controls !== undefined) {
                // todo
                // modify current rotation, dont overwrite it!
                // center clicked point in the middle of the screen
                controls.rotateToCoordinate(lat, lng);
            }
            if (that.active !== null) {
                // when the user clicked another marker 
                // without deselecting the last
                that.active.deselect();
            }
            that.active = this;
            this.select();
        }

        that._domEvents.addEventListener( eventTarget, 'click', handleClick.bind(this), false);
        // that._domEvents.bind(eventTarget, 'click', handleClick, false);
        // this._domEvents.bind( eventTarget, 'touchend', handleClick );
        // bind 'mouseover'
        that._domEvents.addEventListener(eventTarget, 'mouseover', (event) => {
            // do nottin' when route is hidden
            if (this.mesh.parent.visible === false) {
                return;
            }
            document.body.style.cursor = 'pointer';
            this._outlineMesh.visible = true;
        }, false);
        that._domEvents.bind(eventTarget, 'mouseout', (event) => {
            if (this.active !== true) {
                this._outlineMesh.visible = false;
            }
            document.body.style.cursor = 'default';
        }, false);
    }

}

Marker.prototype.update = (function() {

    let meshVector = new THREE.Vector3();
    let eye = new THREE.Vector3();
    let dot = new THREE.Vector3();
    let ocluded = false;

    return function update( camera ) {

            // http://stackoverflow.com/questions/15098479/how-to-get-the-global-world-position-of-a-child-object
            // var meshVector = new THREE.Vector3().setFromMatrixPosition( meshGroup.children[ i ].matrixWorld ); 

            // Annotations HTML
            // https://codepen.io/dxinteractive/pen/reNpOR

            // Like Sketchfab
            // https://manu.ninja/webgl-three-js-annotations
            this.mesh.getWorldPosition( meshVector );
            eye = camera.position.clone().sub( meshVector );
            dot = eye.clone().normalize().dot( meshVector.normalize() );
            ocluded = true ? (dot < 0.0) : false; //IS TRUE WHEN BLOB IS BEHIND THE SPHERE = dot value below 0.0

            // alternative from like Sketchfab
            // const meshDistance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
            // const spriteDistance = camera.position.distanceTo(this.sprites[i].sprite.position);
            // const ocluded = spriteDistance > meshDistance;

            if ( this.sprite !== undefined ) {
                // hide marker when overlay is active
                this.sprite.update( ocluded, eye, dot );
            }

            if ( !ocluded ) {
                //IF BLOBS VISIBLE: SCALE ACCORDING TO ZOOM LEVEL
                this.mesh.scale.set( 1, 1, 1 ).multiplyScalar( 0.2 + ( eye.length() / 600 ) ); // SCALE SIZE OF BLOBS WHILE ZOOMING IN AND OUT // 0.25 * (eye.length()/60
                
                if( this.domElement !== null && this.active === true ) {
                    this.domElement.update( camera, this.mesh );
                }

            } else {
                if( this.domElement !== null ) {
                    this.domElement.hide();
                }
            }

        }

})();