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
    Curve,
    Vector2,
} from "three";
import { makeColorGradient } from "./../utils/colors";
import RouteLine from "./routeLine";
import Marker from "./marker";
import Mover from "./mover";
import RouteAnimation from "./routeAnimation";
import LazyLoading from "../utils/lazyLoading";

import Config from "../../data/config";

import Controls from "./controls";
import RouteManager from "./routeManager";
import UserInterface from "./userInterface";

//check for orientation
function getOrientation(x: any) {
    if (x === undefined) {
        return "desktop";
    } else {
        var y;
        x < 0 ? (y = "landscape") : (y = "portrait");
        return y;
    }
}

function drawDebug(curve: CatmullRomCurve3, length: number) {
    const tubeGeometry = new TubeBufferGeometry(curve, length, 1, 3, false);
    const material = new MeshLambertMaterial({
        color: 0xff00ff,
        depthTest: false,
        visible: true,
    });
    return new Mesh(tubeGeometry, material);
}

export default class Route {
    private mover: Mover;
    private _showLabels: boolean = true;
    private visible: boolean = true;

    public animationHandler: RouteAnimation;
    public poiRoute: CatmullRomCurve3 | undefined = undefined;
    public activeMarker: Marker | null = null;
    public marker: Array<Marker> = [];
    public routeLine: RouteLine;
    public collisionLine: RouteLine;
    public setActiveMarker: (marker: Marker) => void;
    public cycleNextActive: (marker: Marker) => void;
    public cyclePrevActive: (marker: Marker) => void;

    public setDrawCount(value: number): void {
        // drawCount equals geometry length == routeData.length * individual routeSegments
        // todo check if value is in range
        this.routeLine.setDrawCount(value);
    }
    public setDrawIndex(value: number): void {
        // drawIndex equals routeData[index]
        // todo check if value is in range
        this.routeLine.setDrawIndex(value);
    }
    public setDrawProgress(value: number): void {
        this.routeLine.setDrawProgress(value);
    }
    public spawn(): void {
        this.animationHandler.spawn();
    }
    public drawAnimation(): boolean {
        return this.animationHandler.draw();
    }
    public stopDrawAnimation(): boolean {
        return this.animationHandler.stopDraw();
    }

    get drawCount(): number {
        return this.routeLine.drawCount;
    }

    public reset(): void {
        // todo
        // reset active Marker
        // label visibility
        // route line visibility
        // mover visibility
        this.isVisible = true;

        // reset move into center
        this.controls.moveIntoCenter().start();
        // reset controls target
        // reset route line draw distance
        // reset mover icon shape
        // reset mover icon position
        // stop all tweens
    }

    constructor(
        public name: string,
        scene: THREE.Scene,
        container: HTMLElement,
        public routeData: Array<Poi>,
        phase: number,
        steps: number,
        private controls: Controls,
        private manager: RouteManager,
        ui: UserInterface,
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

        // how fast change the color (0 = fast)
        const frequency = 1 / (steps * this.routeData.length);

        // const poi = this.routeData.filter((c) => c.adresse);

        this.routeData.forEach((currentCoordinate, index) => {
            // DONT DRAW MARKER WHEN THEY HAVE NO NAME
            if (!currentCoordinate.label) {
                return;
            }

            const name =
                currentCoordinate.countryname || currentCoordinate.label;
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

        // scan for images after the infoboxes has been created
        new LazyLoading();

        this.routeLine = new RouteLine(
            routeData,
            steps,
            phase,
            Config.routes.linewidth
        );
        this.collisionLine = new RouteLine(
            routeData,
            steps,
            phase,
            Config.routes.linewidthCollision
        );
        this.collisionLine.line.material.visible = false;
        // this.routeLine.line.layers.enable(1);
        scene.add(this.routeLine.line);
        scene.add(this.collisionLine.line);

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

        // this.routeLine.setDrawCount(this.routeLine.numberVertices);
        // this.routeLine.setDrawProgress(1);
        // this.routeLine.drawPoi(this.marker[1].index);
        const positions = this.routeLine.vertices;
        const colors = this.routeLine.colorArray || new Float32Array[0]();
        this.mover = new Mover(scene, positions, colors, folder);
        // this.setDrawIndex(routeData.length);

        this.animationHandler = new RouteAnimation(
            this,
            this.mover,
            this.marker,
            this.routeData,
            controls,
            ui,
            folder
        );

        // draw simplified route for debug
        // const mesh = drawDebug(
        //     this.animationHandler.simplifiedRoute,
        //     routeData.length
        // );
        // scene.add(mesh);

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

        this.cycleNextActive = function (marker: Marker): boolean {
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

            return true;
        };

        this.cyclePrevActive = function (marker: Marker): boolean {
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

            return true;
        };
    }

    public deselectMarker(): void {
        if (this.manager !== undefined) {
            this.manager.deselectMarker();
        }
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
        return this._showLabels;
    }

    set showLabels(value) {
        this._showLabels = value;
        this.marker.forEach((marker) => {
            marker.showLabel(value);
        });
    }

    get isVisible() {
        return this.visible;
    }

    set isVisible(value) {
        this.visible = value;
        this.showLabels = value;
        if (this.activeMarker) {
            // this.manager.setActiveMarker(this, this.activeMarker);
        }
        this.marker.forEach((marker) => {
            marker.setVisible(value);
        });
        this.mover.setVisible(value);
        this.routeLine.line.visible = value;
    }

    public update(delta: number, camera: THREE.Camera) {
        this.mover.update(this.drawCount, camera);
        this.animationHandler.update(delta);
        this.marker.forEach((marker) => {
            marker.update(camera, delta);
        });
        // this.routeLine.update(delta);
        // if (this.animate === true) {
        // }
    }
}
