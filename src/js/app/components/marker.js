import * as THREE from "three";
import { numberWithCommas } from "../../utils/panoutils";
import TextSprite from "./textSprite";
import InfoBox from "./infobox";
import Label from "./label";

export default class Marker {

    constructor(color, poi, positionVector, protoMesh, activeHandler, controls, particles, audio) {

        this._active = false;
        this._infoBox = null;
        this._mesh = null;
        this._isVisible = true;

        this._controls = controls;
        this._particles = particles;

        this._label = null;

        this._poi = poi;

        this._activeHandler = activeHandler;

        this._color = color;

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
        
        // this.a = document.createElement("div");
        // this.a.className="htmlLabel";
        // this.a.style = "background-color:#ffffff; bottom:0; right:0;";

        this._audio = audio;
		
        this._mesh = mesh;
    }

    get last() {
        return this._last;
    }
    set last( value ) {
        this._last = value;
    }
    
    get active() {
        return this._active;
    }

    set active( value ) {
        
        // only play sound on close, not when opening another marker
        if( !value && this._activeHandler.active !== null ) {
            // this._audio.close.play();
        }
        // only one active
        if( this._activeHandler.activeMarker !== null ) {
            const otherMarker = this._activeHandler.activeMarker;
            // clear handle to prevent recursion
            this._activeHandler.activeMarker = null;
            otherMarker.active = false;
        }

        this._active = value;
        
        if( value ) {
            // this._audio.open.play();
            this._activeHandler.activeMarker = this;
            // on Hit something trigger hit effect emitter
            // this.particles.setNormal( target.face.normal );
            // this.particles.particleGroup.mesh.position.copy( target.point );
            this._particles.setColor(this._color, new THREE.Color("black"));
            
            this._particles.particleGroup.mesh.position.copy( this._mesh.position );
            this._particles.triggerPoolEmitter( 1 );

            this._controls.moveIntoCenter( this._poi.lat, this._poi.lng, 1000 );

            // sadly broken
            // const impactPosition = new THREE.Vector3();
            // this.particles.particleGroup.triggerPoolEmitter( 1, ( impactPosition.set( target.point.x, target.point.y, target.point.z ) ) );
        }

        if( this._infoBox !== null ) {
            this._infoBox.isVisible = value;
        }
        // respect route setting on showing labels or not
        if( this._activeHandler.showLabels ) {
            this._label.isVisible = !value;
        } else {
            this._label.isVisible = false;
        }

        this._outlineMesh.visible = value;
    }

    get mesh() {
        return this._mesh;
    }

    get sprite() {
        return this._sprite;
    }

    get label() {
        return this._label;
    }

    get isVisible() {
        return this._isVisible;
    }

    set isVisible(value) {
        this.mesh.visible = value;
        this._label.isVisible = value;
        // this._infoBox.isVisible = value;
        // this.sprite.isVisible = value;

        this._isVisible = value;
    }

    getLabel(parentDomNode, text, showLabel) {
        // parentDomNode.appendChild(this.a);

        this._label = new Label(parentDomNode, text);
        this._label.isVisible = showLabel;
        this._label.domElement.addEventListener("click", ()=>{
            this.active = true;
        });
        
        function handleMouseUp() {
            this._controls.enabled = true;
        }
        this._label.domElement.addEventListener("mousedown", ()=>{
            this._controls.enabled = false;

            this._label.domElement.addEventListener("mouseup", handleMouseUp.bind(this), false);
            this._label.domElement.addEventListener("mouseout", handleMouseUp.bind(this), false);
        }, false);
        return this._label;

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

    getInfoBox(parentDomNode, city) {

        const box = new InfoBox(parentDomNode, city);
        this._infoBox = box;
                
        // close label on X click
        box.closeButton.addEventListener("click", ()=>{
            this.active = false;
        });
        
        if( this.next === undefined ) {
            box.nextButton.className = "d-none";
        }
        if( this.previous === undefined ) {
            box.prevButton.className = "d-none";
        }
        box.nextButton.addEventListener("click", ()=>{
            this.next.active = true;
        });

        // close label on X click
        box.prevButton.addEventListener("click", ()=>{
            this.previous.active = true;
        });

        function handleMouseUp() {
            this._controls.enabled = true;
        }
        box.closeButton.addEventListener("mousedown", ()=>{
            this._controls.enabled = false;

            box.closeButton.addEventListener("mouseup", handleMouseUp.bind(this), false);
            box.closeButton.addEventListener("mouseout", handleMouseUp.bind(this), false);
        }, false);
        box.domElement.addEventListener("mousedown", ()=>{
            this._controls.enabled = false;

            box.domElement.addEventListener("mouseup", handleMouseUp.bind(this), false);
            box.domElement.addEventListener("mouseout", handleMouseUp.bind(this), false);
        }, false);

        return box;

    }
    
    linkify(activeHandler, lat, lng) {
        var eventTarget = this.mesh;

        function handleClick(event) {
            // Hide the infoBox when itself is clicked again
            if (activeHandler.active === this) {
                this.active = false;
                activeHandler.active = null;
                return;
            }
            this.active = true;

            if (this._controls.moveIntoCenter instanceof Function) {
                // this._controls.moveIntoCenter( lat, lng, 1000 );
            // if (this._controls !== undefined) {
                // todo
                // modify current rotation, dont overwrite it!
                // center clicked point in the middle of the screen
                // controls.rotateToCoordinate(lat, lng);
            }

        }

        activeHandler._domEvents.addEventListener( eventTarget, 'click', handleClick.bind(this), false);
        // activeHandler._domEvents.bind(eventTarget, 'click', handleClick, false);
        // this._domEvents.bind( eventTarget, 'touchend', handleClick );
        // bind 'mouseover'
        activeHandler._domEvents.addEventListener(eventTarget, 'mouseover', (event) => {
            // do nottin' when route is hidden
            if (this.mesh.parent.visible === false) {
                return;
            }
            document.body.style.cursor = 'pointer';
            this._outlineMesh.visible = true;
        }, false);
        activeHandler._domEvents.bind(eventTarget, 'mouseout', (event) => {
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

    return function update( camera, delta ) {

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

            if ( this._label !== null ) {
                this._label.update(camera, this.mesh, ocluded, dot);
            }
            if ( this.sprite !== undefined ) {
                // hide marker when overlay is active
                this.sprite.update( ocluded, eye, dot );
            }
            if ( this._infoBox !== undefined ) {
            // if ( this._infoBox !== undefined && this.active === true ) {
                this._infoBox.update( camera, this.mesh, ocluded, this.active );
            }

            if ( !ocluded ) {
                //IF BLOBS VISIBLE: SCALE ACCORDING TO ZOOM LEVEL
                // this.mesh.scale.set( 1, 1, 1 ).multiplyScalar( 0.2 + ( eye.length() / 600 ) ); // SCALE SIZE OF BLOBS WHILE ZOOMING IN AND OUT // 0.25 * (eye.length()/60
                let x = 1;
                if( this._last ) {
                    const freq = 0.5;
                    const amp = 3;
                    const minSize = 10;
                    const shift = 1;
                    const wave = amp * Math.sin( freq * (performance.now() / 1000 + shift) * Math.PI * 2 ) + amp + minSize;
                    // const wave = amp * Math.sin( freq * (clock.elapsedTime + shift) * ( 0.5 * Math.cos( clock.elapsedTime )) ) + amp + minSize;
                    // const x = (amp * Math.sin( ( freq * clock.elapsedTime * Math.PI * 2 ) ) ) + minSize;
                    // this.a.innerHTML = x;
                    x = wave / 10;
                    if( x > 2.4 ) { x = 2.4; }
                }
                this.mesh.scale.set( x, x, x ).multiplyScalar( 0.2 + ( eye.length() / 600 ) ); // SCALE SIZE OF BLOBS WHILE ZOOMING IN AND OUT // 0.25 * (eye.length()/60
            }

        }

})();