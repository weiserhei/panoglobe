import { SphereBufferGeometry, Vector3, Mesh } from "three";
import TWEEN from "@tweenjs/tween.js";
import $ from "jquery";
import InfoBox from "./infobox";
import Label from "./label";
import Route from "./route";
import Controls from "./controls";

const markergeo = new SphereBufferGeometry(1, 8, 6);
const markermesh = new Mesh(markergeo);

export default class Marker {
    public mesh: THREE.Mesh;
    public setVisible: any;
    public addInfoBox: any;
    public setActive: any;
    public update: (camera: THREE.Camera, delta: number) => void;
    public spawn: () => any;
    public showLabel: (value: boolean) => void;

    constructor(
        public poi: Poi,
        route: Route,
        controls: Controls,
        public index: number,
        text: string,
        scene: THREE.Scene,
        public color: THREE.Color
    ) {
        const meshVector = new Vector3();
        let ocluded = false;
        let infoBox: InfoBox = null;
        let active = false;

        let mesh = markermesh.clone();
        // mesh.material = markermesh.material.clone();
        mesh.position.copy(poi.displacedPos.clone()); // place mesh
        // mesh.lookAt( globe.mesh.position );

        this.mesh = mesh;
        const label = new Label(text, scene, this.mesh);

        function handleInteraction(evt: Event) {
            evt.preventDefault();
            route.setActiveMarker(this);
        }
        label.domElement.addEventListener(
            "touchstart",
            handleInteraction.bind(this)
        );
        label.domElement.addEventListener(
            "click",
            handleInteraction.bind(this)
        );

        function handleMouseUp() {
            controls.threeControls.enabled = true;
        }

        label.domElement.addEventListener(
            "mousedown",
            function () {
                controls.threeControls.enabled = false;
                this.addEventListener("mouseup", handleMouseUp, false);
                this.addEventListener("mouseout", handleMouseUp, false);
            },
            false
        );

        this.showLabel = function (value = true) {
            label.setVisible(value);
        };

        this.setVisible = function (value: boolean) {
            label.setVisible(value);
            infoBox.isVisible = value;
        };
        this.setActive = function (value: boolean) {
            // do not call me, im getting called by the managers
            active = value;
            if (value) {
                route.activeMarker = this;
            } else {
                route.activeMarker = null;
            }
            if (infoBox !== null) {
                infoBox.isVisible = value;
            }
            // respect route setting on showing labels or not
            if (route.showLabels && label !== undefined) {
                label.setVisible(!value);
            } else if (label !== undefined) {
                label.setVisible(false);
            }
        };

        this.addInfoBox = function (parentDomNode: HTMLElement) {
            let nextMarker = route.getNext(this);
            let previousMarker = route.getPrev(this);

            infoBox = new InfoBox(parentDomNode, controls, poi);

            // close label on X click
            infoBox.closeButton.addEventListener("click", () => {
                // route toggle Active if Active
                route.setActiveMarker(this);
            });

            if (nextMarker === undefined) {
                infoBox.nextButton.className = "d-none";
            }
            if (previousMarker === undefined) {
                infoBox.prevButton.className = "d-none";
            }
            infoBox.nextButton.addEventListener("click", () => {
                route.cycleNextActive(this);
            });
            infoBox.prevButton.addEventListener("click", () => {
                route.cyclePrevActive(this);
            });
        };

        this.spawn = function () {
            // label.animation();
            label.css2dobject.position.y += 20;
            return (
                // @ts-ignore
                new TWEEN.Tween(label.css2dobject.position)
                    // @ts-ignore
                    .to({ y: this.mesh.position.y }, 1500)
                    // .easing( TWEEN.Easing.Circular.InOut )
                    // .easing( TWEEN.Easing.Quintic.InOut )
                    // .easing(TWEEN.Easing.Cubic.InOut)
                    .easing(TWEEN.Easing.Bounce.Out)
                    // .onStart(() => {
                    // })
                    // .repeat(Infinity)
                    .onComplete(() => {})
            );
            // @ts-ignore
            // .start()
        };

        this.update = function (camera: THREE.Camera, delta) {
            // Like Sketchfab
            // https://manu.ninja/webgl-three-js-annotations
            this.mesh.getWorldPosition(meshVector);
            const eye = camera.position.clone().sub(meshVector);
            const dot = eye.normalize().dot(meshVector.normalize());
            ocluded = dot < 0.0; // IS TRUE WHEN BLOB IS BEHIND THE SPHERE = dot value below 0.0

            // alternative from like Sketchfab
            // const meshDistance = camera.position.distanceTo(
            //     new Vector3(0, 0, 0)
            // );
            // const spriteDistance = camera.position.distanceTo(meshVector);
            // const ocluded = spriteDistance > meshDistance;

            if (label !== null) {
                label.update(ocluded, dot);
            }
            if (infoBox !== null) {
                // if ( this._infoBox !== undefined && this.active === true ) {
                infoBox.update(camera, this.mesh, ocluded, active);
            }
        };
    }

    // askGoogle(lat, lon) {
    //     // Get countryname from POI
    //     // via Google-Maps API Lat/Long
    //     var url =
    //         "http://maps.googleapis.com/maps/api/geocode/json?latlng=" +
    //         lat +
    //         "," +
    //         lon +
    //         "&sensor=false";
    //     $.getJSON(url, (data) => {
    //         if (data.results && data.results[0]) {
    //             if (!this.askedGoogle) {
    //                 this.askedGoogle = true;

    //                 for (
    //                     let i = 0;
    //                     i < data.results[0].address_components.length;
    //                     i += 1
    //                 ) {
    //                     // if (data.results[0].address_components[i].types.indexOf ('country') > -1) {
    //                     if (
    //                         data.results[0].address_components[i].types.indexOf(
    //                             "administrative_area_level_1"
    //                         ) > -1
    //                     ) {
    //                         const name =
    //                             data.results[0].address_components[i].long_name;
    //                         // this._infoBox.domElement.innerHTML = name;
    //                         const div = document.createElement("div");
    //                         div.innerHTML = name;
    //                         const child = this.infoBox.domElement.children[1];
    //                         child.insertBefore(div, child.firstChild);

    //                         break;
    //                     }
    //                 }
    //             }
    //         }
    //     });
    // }
}
