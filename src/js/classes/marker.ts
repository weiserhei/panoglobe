import { Vector3 } from "three";
import TWEEN from "@tweenjs/tween.js";
import $ from "jquery";
import InfoBox from "./infobox";
import Label from "./label";
import Route from "./route";
import Controls from "./controls";

export default class Marker {
    public setVisible: (value: boolean) => void;
    public addInfoBox: (parentDomNode: HTMLElement) => void;
    public setActive: (value: boolean) => void;
    public spawn: () => any;
    public showLabel: (value: boolean) => void;

    private position: THREE.Vector3;
    private label: Label;
    private infoBox: InfoBox | undefined = undefined;
    private active: boolean = false;
    private ocluded: boolean = false;

    constructor(
        public poi: Poi,
        route: Route,
        controls: Controls,
        public index: number,
        text: string,
        scene: THREE.Scene,
        public color: THREE.Color
    ) {
        this.position = this.poi.displacedPos.clone();
        this.label = new Label(text, scene, this.poi.displacedPos);

        function handleInteraction(evt: Event) {
            evt.preventDefault();
            route.setActiveMarker(this);
        }
        this.label.domElement.addEventListener(
            "touchstart",
            handleInteraction.bind(this)
        );
        this.label.domElement.addEventListener(
            "click",
            handleInteraction.bind(this)
        );

        function handleMouseUp() {
            controls.threeControls.enabled = true;
        }

        this.label.domElement.addEventListener(
            "mousedown",
            function () {
                controls.threeControls.enabled = false;
                this.addEventListener("mouseup", handleMouseUp, false);
                this.addEventListener("mouseout", handleMouseUp, false);
            },
            false
        );

        this.showLabel = function (value = true) {
            this.label.setVisible(value);
        };

        this.setVisible = function (value: boolean) {
            this.label.setVisible(value);
            if (value === false) {
                this.infoBox.isVisible = value;
            }
        };
        this.setActive = function (value: boolean) {
            // do not call me, im getting called by the managers
            this.active = value;
            if (value) {
                route.activeMarker = this;
            } else {
                route.activeMarker = null;
            }
            if (this.infoBox !== null) {
                this.infoBox.isVisible = value;
            }
            // respect route setting on showing labels or not
            if (route.showLabels && this.label !== undefined) {
                this.label.setVisible(!value);
            } else if (this.label !== undefined) {
                this.label.setVisible(false);
            }
        };

        this.addInfoBox = function (parentDomNode: HTMLElement) {
            let nextMarker = route.getNext(this);
            let previousMarker = route.getPrev(this);

            this.infoBox = new InfoBox(parentDomNode, controls, poi);

            // close label on X click
            this.infoBox.closeButton.addEventListener("click", function () {
                // route toggle Active if Active
                route.deselectMarker();
            });

            if (nextMarker === undefined) {
                this.infoBox.nextButton.className = "d-none";
            }
            if (previousMarker === undefined) {
                this.infoBox.prevButton.className = "d-none";
            }
            this.infoBox.nextButton.addEventListener("click", () => {
                route.cycleNextActive(this);
            });
            this.infoBox.prevButton.addEventListener("click", () => {
                route.cyclePrevActive(this);
            });
        };

        this.spawn = function () {
            // label.animation();
            this.label.css2dobject.position.y += 20;
            return (
                // @ts-ignore
                new TWEEN.Tween(this.label.css2dobject.position)
                    // @ts-ignore
                    .to({ y: this.poi.displacedPos.y }, 1500)
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
    }

    public update(camera: THREE.Camera, delta: number) {
        // Like Sketchfab
        // https://manu.ninja/webgl-three-js-annotations
        const eye = camera.position.clone().sub(this.position);
        const dot = eye.normalize().dot(this.position.normalize());
        this.ocluded = dot < 0.0; // IS TRUE WHEN BLOB IS BEHIND THE SPHERE = dot value below 0.0

        // alternative from like Sketchfab
        // const meshDistance = camera.position.distanceTo(
        //     new Vector3(0, 0, 0)
        // );
        // const spriteDistance = camera.position.distanceTo(meshVector);
        // const ocluded = spriteDistance > meshDistance;

        if (this.label !== null) {
            this.label.update(this.ocluded, dot);
        }
        // if (this.infoBox !== undefined) {
        //     this.infoBox.update(
        //         camera,
        //         this.poi.displacedPos,
        //         this.ocluded,
        //         this.active
        //     );
        // }
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
