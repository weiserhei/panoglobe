import {
    SphereBufferGeometry,
    Vector3,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    BackSide,
} from "three";
import InfoBox from "./infobox";
import Label from "./label";

import $ from "jquery";

const markergeo = new SphereBufferGeometry(1, 8, 6);
const markerMaterial = new MeshLambertMaterial();
const markermesh = new Mesh(markergeo, markerMaterial);

export default class Marker {
    constructor(color, poi, route, controls, index) {
        this.color = color;
        this.poi = poi;
        this.activeHandler = route;
        this.controls = controls;
        this.index = index;
        this.active = false;
        this.infoBox = null;
        this.visible = true;
        this.label = null;
        // last marker in route
        this.last = false;

        let mesh = markermesh.clone();
        mesh.material = markermesh.material.clone();
        const hsl = color.getHSL({});
        // LOWER SATURATION FOR BLOBS
        hsl.s -= 0.2;
        mesh.material.color.setHSL(hsl.h, hsl.s, hsl.l);
        // marker.material.uniforms.diffuse.value.setHSL ( hsl.h, hsl.s, hsl.l );
        // LOWER BRIGHTNESS FOR EMISSIVE COLOR
        hsl.l -= 0.3;
        // mesh.material.uniforms.emissive.value.setHSL ( hsl.h, hsl.s, hsl.l );
        mesh.material.emissive.setHSL(hsl.h, hsl.s, hsl.l);
        // var ohgodwhy = position.clone();
        // ohgodwhy.y += markermesh.geometry.parameters.height / 10; // pyramid geometry
        mesh.position.copy(poi.displacedPos.clone()); // place mesh
        // mesh.lookAt( globe.mesh.position );
        const outlineMaterial = new MeshBasicMaterial({
            color: 0x00ff00,
            side: BackSide,
        });
        this.outlineMesh = new Mesh(mesh.geometry, outlineMaterial);
        this.outlineMesh.scale.multiplyScalar(1.3);
        this.outlineMesh.visible = false;
        mesh.add(this.outlineMesh);
        // this.a = document.createElement("div");
        // this.a.className="htmlLabel";
        // this.a.style = "background-color:#ffffff; bottom:0; right:0;";

        this.mesh = mesh;
        this.askedGoogle = false;
    }

    get isLast() {
        return this.last;
    }

    set isLast(value) {
        this.last = value;
    }

    askGoogle(lat, lon) {
        // Get countryname from POI
        // via Google-Maps API Lat/Long
        var url =
            "http://maps.googleapis.com/maps/api/geocode/json?latlng=" +
            lat +
            "," +
            lon +
            "&sensor=false";
        $.getJSON(url, (data) => {
            if (data.results && data.results[0]) {
                if (!this.askedGoogle) {
                    this.askedGoogle = true;

                    for (
                        let i = 0;
                        i < data.results[0].address_components.length;
                        i += 1
                    ) {
                        // if (data.results[0].address_components[i].types.indexOf ('country') > -1) {
                        if (
                            data.results[0].address_components[i].types.indexOf(
                                "administrative_area_level_1"
                            ) > -1
                        ) {
                            const name =
                                data.results[0].address_components[i].long_name;
                            // this._infoBox.domElement.innerHTML = name;
                            const div = document.createElement("div");
                            div.innerHTML = name;
                            const child = this.infoBox.domElement.children[1];
                            child.insertBefore(div, child.firstChild);

                            break;
                        }
                    }
                }
            }
        });
    }

    get isActive() {
        return this.active;
    }

    set isActive(value) {
        // if ( ! this._askedGoogle ) {
        //     this.askGoogle(this._poi.lat, this._poi.lng);
        // }

        // only play sound on close, not when opening another marker
        // if (!value && this.activeHandler.active !== null) {
        // this._audio.close.play();
        // }
        // only one active
        if (this.activeHandler.activeMarker !== null) {
            const otherMarker = this.activeHandler.activeMarker;
            // clear handle to prevent recursion
            this.activeHandler.setActiveMarker(null);
            otherMarker.isActive = false;
        }
        this.active = value;

        if (value) {
            // this._audio.open.play();
            this.activeHandler.setActiveMarker(this);
            // on Hit something trigger hit effect emitter
            // this.particles.setNormal( target.face.normal );
            // this.particles.particleGroup.mesh.position.copy( target.point );
            // this._particles.setColor(this._color, new THREE.Color("black"));
            // this._particles.particleGroup.mesh.position.copy( this._mesh.position );
            // this._particles.triggerPoolEmitter( 1 );

            // dont "auto move" when marker is activated
            // this._controls.moveIntoCenter( this._poi.lat, this._poi.lng, 1000 );

            // sadly broken
            //   const impactPosition = new Vector3();
            //   this.particles.particleGroup.triggerPoolEmitter(
            //     1, (impactPosition.set(target.point.x, target.point.y, target.point.z))
            //   );
        }
        if (this.infoBox !== null) {
            this.infoBox.isVisible = value;
        }
        // respect route setting on showing labels or not
        if (this.activeHandler.showLabels && this.label !== undefined) {
            this.label.isVisible = !value;
        } else if (this.label !== undefined) {
            this.label.isVisible = false;
        }
        this.outlineMesh.visible = value;
    }

    get isVisible() {
        return this.visible;
    }

    set isVisible(value) {
        this.visible = value;
        this.mesh.visible = value;
        this.label.isVisible = value;
        // this._infoBox.isVisible = value;
        // this.sprite.isVisible = value;
    }

    getLabel(parentDomNode, text, showLabel, scene) {
        this.label = new Label(parentDomNode, text, scene, this.mesh);
        this.label.isVisible = showLabel;
        this.label.domElement.addEventListener("click", () => {
            this.isActive = true;
        });

        function handleMouseUp() {
            this.controls.threeControls.enabled = true;
        }
        this.label.domElement.addEventListener(
            "mousedown",
            () => {
                this.controls.threeControls.enabled = false;

                this.label.domElement.addEventListener(
                    "mouseup",
                    handleMouseUp.bind(this),
                    false
                );
                this.label.domElement.addEventListener(
                    "mouseout",
                    handleMouseUp.bind(this),
                    false
                );
            },
            false
        );
    }

    getInfoBox(parentDomNode) {
        const box = new InfoBox(parentDomNode, this.poi);
        this.infoBox = box;
        // close label on X click
        box.closeButton.addEventListener("click", () => {
            this.isActive = false;
        });

        if (this.next === undefined) {
            box.nextButton.className = "d-none";
        }
        if (this.previous === undefined) {
            box.prevButton.className = "d-none";
        }
        box.nextButton.addEventListener("click", () => {
            this.next.isActive = true;
        });

        box.prevButton.addEventListener("click", () => {
            this.previous.isActive = true;
        });

        function handleMouseUp() {
            this.controls.threeControls.enabled = true;
        }
        box.closeButton.addEventListener(
            "mousedown",
            () => {
                this.controls.threeControls.enabled = false;

                box.closeButton.addEventListener(
                    "mouseup",
                    handleMouseUp.bind(this),
                    false
                );
                box.closeButton.addEventListener(
                    "mouseout",
                    handleMouseUp.bind(this),
                    false
                );
            },
            false
        );
        box.domElement.addEventListener(
            "mousedown",
            () => {
                this.controls.threeControlsenabled = false;

                box.domElement.addEventListener(
                    "mouseup",
                    handleMouseUp.bind(this),
                    false
                );
                box.domElement.addEventListener(
                    "mouseout",
                    handleMouseUp.bind(this),
                    false
                );
            },
            false
        );

        return box;
    }
}

Marker.prototype.update = (function () {
    let meshVector = new Vector3();
    let eye = new Vector3();
    let dot = new Vector3();
    let ocluded = false;

    return function update(camera, delta) {
        // http://stackoverflow.com/questions/15098479/how-to-get-the-global-world-position-of-a-child-object
        // var meshVector = new THREE.Vector3().
        // setFromMatrixPosition( meshGroup.children[ i ].matrixWorld );

        // Annotations HTML
        // https://codepen.io/dxinteractive/pen/reNpOR

        // Like Sketchfab
        // https://manu.ninja/webgl-three-js-annotations
        this.mesh.getWorldPosition(meshVector);
        eye = camera.position.clone().sub(meshVector);
        dot = eye.clone().normalize().dot(meshVector.normalize());
        ocluded = dot < 0.0; // IS TRUE WHEN BLOB IS BEHIND THE SPHERE = dot value below 0.0

        // alternative from like Sketchfab
        // const meshDistance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        // const spriteDistance = camera.position.distanceTo(this.sprites[i].sprite.position);
        // const ocluded = spriteDistance > meshDistance;

        if (this.label !== null) {
            this.label.update(ocluded, dot);
        }
        if (this.sprite !== undefined) {
            // hide marker when overlay is active
            this.sprite.update(ocluded, eye, dot);
        }
        if (this.infoBox !== null) {
            // if ( this._infoBox !== undefined && this.active === true ) {
            this.infoBox.update(camera, this.mesh, ocluded, this.active);
        }

        if (!ocluded) {
            // IF BLOBS VISIBLE: SCALE ACCORDING TO ZOOM LEVEL
            // SCALE SIZE OF BLOBS WHILE ZOOMING IN AND OUT // 0.25 * (eye.length()/60
            // this.mesh.scale.set( 1, 1, 1 ).multiplyScalar( 0.2 + ( eye.length() / 600 ) );

            let x = 1;
            /*
      if (this.last) {
        const freq = 0.5;
        const amp = 3;
        const minSize = 10;
        const shift = 1;
        const breathe = amp * Math.sin(freq * (performance.now() / 1000 + shift) * Math.PI * 2);
        const wave = breathe + amp + minSize;
        // const wave = amp * Math.sin( freq * (clock.elapsedTime + shift) *
        // ( 0.5 * Math.cos( clock.elapsedTime )) ) + amp + minSize;
        // const x = (amp * Math.sin( ( freq * clock.elapsedTime * Math.PI * 2 ) ) ) + minSize;
        // this.a.innerHTML = x;
        x = wave / 10;

        if (x > 2.4) {
          x = 2.4;
        }
      }
      */
            // SCALE SIZE OF BLOBS WHILE ZOOMING IN AND OUT // 0.25 * (eye.length()/60
            this.mesh.scale
                .set(x, x, x)
                .multiplyScalar(0.2 + eye.length() / 600);
        }
    };
})();
