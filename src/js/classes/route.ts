/**
 * Route Class
 * create the Route
 */
import {
    Color,
    CatmullRomCurve3,
    TubeBufferGeometry,
    MeshLambertMaterial,
    Mesh,
} from "three";
import { makeColorGradient } from "./../utils/colors";
import RouteLine from "./routeLine";
import Marker from "./marker";
import Config from "../../data/config";

import Controls from "./controls";
import RouteManager from "./routeManager";
import Mover from "./mover";
import RouteAnimation from "./routeAnimation";

export default class Route {
    private mover: Mover;
    private animationDrawIndex: any;
    private animationDrawCount: any;
    private animationHandler: RouteAnimation;

    public poiRoute: CatmullRomCurve3;
    public activeMarker: Marker | null;
    public marker: Array<Marker>;
    public visible: boolean;
    public showLabels1: boolean;
    public routeLine: RouteLine;
    public setActiveMarker: (marker: Marker) => void;
    public cycleNextActive: (marker: Marker) => void;
    public cyclePrevActive: (marker: Marker) => void;

    public setDrawCount(value: number): void {
        this.routeLine.setDrawCount(value);
        this.animationDrawCount.index = value;
    }
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
        public name: string,
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
        this.animationDrawIndex = { index: 0 };
        this.animationDrawCount = { index: 0 };

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

        // const poi: Array<any> = [];
        // this.routeData.forEach(function (e: Poi, index: number) {
        //     if (e.adresse) {
        //         // poi.push(e.displacedPos);
        //         poi.push(e.displacedPos);
        //     } else if (index % 20 === 0) {
        //         poi.push(e.displacedPos);
        //     }
        // });
        // poi.push(this.routeData[this.routeData.length - 1].pos);
        // this.poiRoute = new CatmullRomCurve3(poi);

        const points = this.routeLine.curve.getPoints(20);
        const simplifiedRoute = new CatmullRomCurve3(points);
        const tubeGeometry = new TubeBufferGeometry(
            simplifiedRoute,
            200,
            1,
            3,
            false
        );
        const material = new MeshLambertMaterial({
            color: 0xff00ff,
            depthTest: false,
            visible: true,
        });
        const mesh = new Mesh(tubeGeometry, material);
        // scene.add(mesh);

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
        this.mover.update(this.animationDrawCount.index, camera);

        this.marker.forEach((marker) => {
            marker.update(camera, delta);
        });
        // this.routeLine.update(delta);
        // if (this.animate === true) {
        // }
    }
}
