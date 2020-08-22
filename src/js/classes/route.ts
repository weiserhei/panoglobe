/**
 * Route Class
 * create the Route
 */
import TWEEN from "@tweenjs/tween.js";
import { Color, Vector3 } from "three";
import { makeColorGradient } from "./../utils/colors";
import RouteLine from "./routeLine";
import Marker from "./marker";
import Config from "../../data/config";

import Controls from "./controls";
import RouteManager from "./routeManager";
import Mover from "./mover";
import RouteAnimation from "./routeAnimation";

export default class Route {
    private animate: boolean;
    private animationPace: number;
    private routeAnimation: (value: any) => void;
    private mover: Mover;
    private animationDrawIndex: any;
    private animationHandler: RouteAnimation;

    public activeMarker: Marker | null;
    public marker: Array<Marker>;
    public visible: boolean;
    public showLabels1: boolean;
    public routeLine: RouteLine;
    public setActiveMarker: any;
    public cycleNextActive: any;
    public cyclePrevActive: any;

    public setDrawIndex(value: number): void {
        // todo check if value is in range
        this.routeLine.setDrawIndex(value);
        this.animationDrawIndex.index = value;
    }
    public spawn(): void {
        this.animationHandler.spawn();
    }
    public drawAnimation(): void {
        this.animationHandler.draw();
    }

    constructor(
        scene: THREE.Scene,
        container: HTMLElement,
        public routeData: Array<Poi>,
        phase: number,
        controls: Controls,
        private manager: RouteManager,
        folder: any
    ) {
        if (process.env.NODE_ENV === "development") {
            folder
                .add({ visible: true }, "visible")
                .name("Route visible")
                .onChange((value: boolean) => {
                    this.isVisible = value;
                });
        }

        const steps = 1.2; // how fast change the color (0 = fast)
        const frequency = 1 / (steps * this.routeData.length);
        this.marker = [];
        this.visible = false;
        this.showLabels1 = true;
        this.animate = false;
        this.animationPace = 100;
        this.animationDrawIndex = { index: 0 };

        // const poi = this.routeData.filter((c) => c.adresse);

        this.routeData.forEach((currentCoordinate, index) => {
            // DONT DRAW MARKER WHEN THEY HAVE NO NAME
            if (!currentCoordinate.adresse) {
                return;
            }

            const name =
                currentCoordinate.countryname || currentCoordinate.adresse;
            const text = `<small class='font-weight-bold'>${
                this.marker.length + 1
            }</small> ${name}`;

            const color = new Color(
                makeColorGradient(index, frequency, undefined, undefined, phase)
            );

            // CREATE MARKER
            const marker = new Marker(
                currentCoordinate,
                this,
                controls,
                index,
                text,
                scene,
                color
            );
            this.marker.push(marker);
        });

        this.marker.forEach((m) => {
            // CREATE HUDLABELS FOR MARKER
            m.addInfoBox(container);
        });

        this.routeLine = new RouteLine(routeData, steps, phase);
        scene.add(this.routeLine.line);

        // this.routeLine.setDrawCount(this.routeLine.numberVertices);
        // this.routeLine.setDrawProgress(1);
        // this.routeLine.drawPoi(this.marker[1].index);
        const positions = this.routeLine.vertices;
        const colors = this.routeLine.colorArray;
        this.mover = new Mover(scene, positions, colors, folder);
        this.mover.moving(false);
        this.setDrawIndex(routeData.length);

        this.animationHandler = new RouteAnimation(
            this,
            this.mover,
            this.marker,
            this.routeData,
            controls,
            folder
        );

        this.setActiveMarker = function (marker: Marker) {
            // if (this.activeMarker === marker) {
            //     // active marker is calling himself => deactivate
            //     this.activeMarker = null;
            //     marker.setActive(false);
            //     return;
            // }

            if (this.manager !== undefined) {
                this.manager.setActiveMarker(this, marker);
                return;
            }

            if (this.activeMarker != undefined) {
                this.activeMarker.setActive(false);
            }

            this.activeMarker = marker;
            marker.setActive(true);
        };

        this.cycleNextActive = function (marker: Marker) {
            if (this.activeMarker !== marker) {
                // only sanity check
                return false;
            }
            const currentIndex = this.marker.indexOf(marker);
            const nextIndex = (currentIndex + 1) % this.marker.length;
            const nextMarker = this.marker[nextIndex];
            // this.activeMarker = this.marker[nextIndex];
            // this.marker[currentIndex].setActive(false);
            // this.marker[nextIndex].setActive(true);
            this.manager.setActiveMarker(this, nextMarker);
        };

        this.cyclePrevActive = function (marker: Marker) {
            if (this.activeMarker !== marker) {
                // only sanity check
                return false;
            }
            const currentIndex = this.marker.indexOf(marker);
            const prevIndex = (currentIndex - 1) % this.marker.length;
            const prevMarker = this.marker[prevIndex];
            // this.activeMarker = this.marker[prevIndex];
            // this.marker[currentIndex].setActive(false);
            // this.marker[prevIndex].setActive(true);
            this.manager.setActiveMarker(this, prevMarker);
        };
    }

    getPrev(marker: Marker) {
        const index = this.marker.indexOf(marker);
        if (index >= 0 && index < this.marker.length)
            return this.marker[index - 1];
    }

    getNext(marker: Marker) {
        const index = this.marker.indexOf(marker);
        if (index >= 0 && index < this.marker.length - 1)
            return this.marker[index + 1];
    }

    get showLabels() {
        return this.showLabels1;
    }

    set showLabels(value) {
        this.showLabels1 = value;
        this.marker.forEach((marker) => {
            marker.showLabel(value);
        });
    }

    get isVisible() {
        return this.visible;
    }

    set isVisible(value) {
        this.visible = value;
        if (this.activeMarker) {
            this.manager.setActiveMarker(this, this.activeMarker);
        }
        this.marker.forEach((marker) => {
            marker.setVisible(value);
        });
        this.mover.setVisible(value);
        this.routeLine.line.visible = value;
    }

    public update(delta: number, camera: THREE.Camera) {
        this.mover.update(this.animationDrawIndex.index, camera);

        this.marker.forEach((marker) => {
            marker.update(camera, delta);
        });
        // this.routeLine.update(delta);
        // if (this.animate === true) {
        // }
    }
}
