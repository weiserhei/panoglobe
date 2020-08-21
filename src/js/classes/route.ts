/**
 * Route Class
 * create the Route
 */
import TWEEN from "@tweenjs/tween.js";
import { Color } from "three";
import { makeColorGradient } from "./../utils/colors";
import RouteLine from "./routeLine";
import Marker from "./marker";
import Config from "../../data/config";

import Controls from "./controls";
import RouteManager from "./routeManager";

export default class Route {
    private animate: boolean;
    private animationPace: number;
    private routeAnimation: (value: any) => void;

    public activeMarker: Marker;
    public marker: Array<Marker>;
    public visible: boolean;
    public showLabels1: boolean;
    public routeLine: RouteLine;
    public setActiveMarker: any;
    public setRunAnimation: any;
    public cycleNextActive: any;
    public cyclePrevActive: any;
    public spawn: () => void;
    public runAnimation: () => void;

    constructor(
        scene: THREE.Scene,
        container: HTMLElement,
        public routeData: Array<Poi>,
        phase: number,
        controls: Controls,
        manager: RouteManager,
        folder: any
    ) {
        this.activeMarker = null;

        const steps = 1.2; // how fast change the color (0 = fast)
        const frequency = 1 / (steps * this.routeData.length);
        this.marker = [];
        this.visible = false;
        this.showLabels1 = true;
        this.animate = false;
        this.animationPace = 100;

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
            // scene.add(marker.mesh);
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

        let lastActive: number = undefined;
        this.routeAnimation = function (value: any) {
            this.routeLine.setDrawIndex(value.drawIndex);

            const result = this.marker.find((marker: Marker) => {
                return marker.index === Math.floor(value.drawIndex);
            });

            if (result === undefined) return;
            if (result.index === 0 && lastActive === undefined) {
                lastActive = 0;
                const next = this.getNext(result);
                controls.moveIntoCenter(
                    next.poi.lat,
                    next.poi.lng,
                    1000,
                    undefined,
                    250,
                    () => {
                        // marker.showLabel();
                    }
                );
            } else if (result.index > lastActive) {
                // debounce
                lastActive = result.index;
                // this.setActiveMarker(result);
                const tween = result.spawn();
                tween.start();
                result.showLabel();

                const next = this.getNext(result);
                if (!next) return;
                controls.moveIntoCenter(
                    next.poi.lat,
                    next.poi.lng,
                    1000,
                    undefined,
                    300,
                    () => {
                        // marker.showLabel();
                    }
                );
            }
        };

        this.runAnimation = function () {
            const marker = this.marker[0];
            if (this.activeMarker) {
                this.setActiveMarker(this.activeMarker);
            }
            // hide label
            this.marker.forEach((marker: Marker) => {
                // marker.showLabel(false);
                marker.setVisible(false);
            });
            // show in label 1
            // hide route
            this.routeLine.setDrawProgress(0);
            // this.setActiveMarker(marker);

            // slow down tween: https://github.com/tweenjs/tween.js/issues/105#issuecomment-34570228
            // start draw route progress
            this.routeLine.setDrawIndex(0);
            const test = { drawIndex: 0 };
            const t = new TWEEN.Tween(test)
                // @ts-ignore
                .to(
                    { drawIndex: routeData.length },
                    routeData.length * this.animationPace
                )
                // .easing( TWEEN.Easing.Circular.InOut )
                .onStart(() => {})
                .onUpdate((value: any) => {
                    this.routeAnimation(value);
                })
                // .repeat(Infinity)
                .onComplete(() => {
                    // not called when on repeat
                    this.marker.forEach((marker: Marker) => {
                        marker.showLabel(true);
                    });
                    this.routeLine.drawProgress = 1;
                    lastActive = undefined;

                    controls.moveIntoCenter(
                        this.marker[this.marker.length - 1].poi.lat,
                        this.marker[this.marker.length - 1].poi.lng,
                        2000,
                        undefined,
                        600
                    );
                })
                .delay(2000);
            // @ts-ignore
            // .start();

            // move camera to start
            controls.moveIntoCenter(
                marker.poi.lat,
                marker.poi.lng,
                2000,
                undefined,
                300,
                () => {
                    marker.showLabel();
                    // @ts-ignore
                    t.start();
                }
            );
        };
        folder.add(this, "animationPace").min(10).max(300).step(10);
        folder.add(this, "runAnimation");

        this.spawn = function () {
            console.log("route spawn");
            this.routeLine.drawProgress = 0;
            this.marker.forEach((m: Marker, index: number) => {
                m.showLabel(true);
                // drop marker delayed
                // const t = m.spawn();
                // t.delay(100 * (index + 1));
                // t.start();
                m.spawn()
                    .delay(100 * (index + 1))
                    .start();
            });
            const test = { drawProgress: 0 };
            // @ts-ignore
            new TWEEN.Tween(test)
                // @ts-ignore
                .to({ drawProgress: 1 }, 3000)
                // .easing( TWEEN.Easing.Circular.InOut )
                // .easing( TWEEN.Easing.Quintic.InOut )
                // .easing(TWEEN.Easing.Cubic.InOut)
                .easing(TWEEN.Easing.Circular.Out)
                // .easing(easing || Config.easing)
                .onStart(() => {})
                .onUpdate((value: any) => {
                    this.routeLine.drawProgress = value.drawProgress;
                })
                // .repeat(Infinity)
                .onComplete(() => {})
                .delay(200)
                // @ts-ignore
                .start();
        };

        folder.add(this, "spawn");

        this.setActiveMarker = function (marker: Marker) {
            // if (this.activeMarker === marker) {
            //     // active marker is calling himself => deactivate
            //     this.activeMarker = null;
            //     marker.setActive(false);
            //     return;
            // }

            if (manager !== undefined) {
                manager.setActiveMarker(this, marker);
                return;
            }

            if (this.activeMarker != undefined) {
                this.activeMarker.setActive(false);
            }

            this.activeMarker = marker;
            marker.setActive(true);
        };

        this.setRunAnimation = function (value: boolean) {
            this.animate = false;
            this.showLabels = !value;
            this.drawCount = 0;

            if (value === false) {
                // stop animation
                this.routeLine.drawCount = 0;
                this.routeLine.drawFull();

                if (this.activeMarker !== null) {
                    this.activeMarker.active = false;
                }
            } else {
                // this._routeLine.drawFull();
                this.routeLine.drawCount = 0;

                this.controls.moveIntoCenter(
                    this.pois[0].lat,
                    this.pois[0].lng,
                    1000,
                    undefined,
                    undefined,
                    () => {
                        // this._routeData[ 0 ].marker.active = true;
                        // setTimeout(() => { this._animate = true; }, 500);
                        this.animate = true;
                    }
                );
            }
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
            manager.setActiveMarker(this, nextMarker);
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
            manager.setActiveMarker(this, prevMarker);
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
        this.marker.forEach((marker) => {
            marker.setVisible(value);
        });
        this.routeLine.line.visible = value;
    }

    public update(delta: number, camera: THREE.Camera) {
        this.marker.forEach((marker) => {
            marker.update(camera, delta);
        });

        // this.routeLine.update(delta);
        if (this.animate === true) {
            // this.animateRoute(delta);
        }
    }

    // get runAnimation() {
    //     return this.animate;
    // }

    // set pauseAnimation(value: boolean) {
    //     this.animate = !value;
    // }

    // animateRoute(delta: number) {
    //     let speed = delta * 30;

    //     // let currentCoordinate = Math.floor( ( this._drawCount / (Config.routes.lineSegments+1) ) );
    //     // divider must be in the range of routeData.length
    //     const divider =
    //         this.drawCount /
    //         (this.routeLine.numberVertices / this.routeData.length);
    //     let currentCoordinate = Math.floor(divider);
    //     // if( currentCoordinate > 1 && this._routeData[ currentCoordinate ].marker !== undefined ) {
    //     if (this.routeData[currentCoordinate].marker !== undefined) {
    //         if (
    //             this.currentInAnimation !==
    //             this.routeData[currentCoordinate].marker
    //         ) {
    //             this.currentInAnimation = this.routeData[
    //                 currentCoordinate
    //             ].marker;
    //             if (this.activeMarker !== null) {
    //                 this.activeMarker.active = false;
    //             }
    //             this.routeData[currentCoordinate].marker.isActive = true;
    //             setTimeout(() => {
    //                 if (this.activeMarker !== null) {
    //                     this.activeMarker.isActive = false;
    //                 }
    //             }, 2000);
    //             const index = this.routeData[currentCoordinate].marker.index;
    //             if (
    //                 this.routeData[currentCoordinate].marker.next !== undefined
    //             ) {
    //                 const nextIndex = this.routeData[currentCoordinate].marker
    //                     .next.index;
    //                 const diff = nextIndex - index;
    //                 const poi = this.activeMarker.next.poi;
    //                 // todo: kill slow tween when buttons are pressed
    //                 this.controls.moveIntoCenter(
    //                     poi.lat,
    //                     poi.lng,
    //                     200 * diff,
    //                     Config.easing,
    //                     250
    //                 );
    //             }
    //         }
    //         // fake slow down on marker
    //         speed = delta * 10;
    //     }

    //     // follow endpoint when last active POI is 50 units behind
    //     const lastMarkerIndex = this.routeData.findIndex((currCo) => {
    //         return this.currentInAnimation === currCo.marker;
    //     });
    //     if (currentCoordinate > lastMarkerIndex + 50) {
    //         // if(this.activeMarker !== null) {
    //         // if( this.activeMarker.next !== undefined ) {
    //         // // move camera to next marker in advance
    //         // this._controls.moveIntoCenter(
    //         // this.activeMarker.next._poi.lat,
    //         // this.activeMarker.next._poi.lng,
    //         // 1000
    //         // );
    //         this.controls.moveIntoCenter(
    //             this.routeData[currentCoordinate].lat,
    //             this.routeData[currentCoordinate].lng,
    //             200,
    //             Config.easing,
    //             300
    //         );
    //         // }
    //         // // this.activeMarker.active = false;
    //         // }
    //     }

    //     this.routeLine.update(speed);
    //     this.speed = speed;
    //     // this._drawCount = ( this._drawCount + 1 ) % this._routeLine.numberVertices;
    //     this.drawCount = this.routeLine.drawCount;
    //     this.normalizedProgress =
    //         this.routeLine.drawCount / (this.routeLine.numberVertices - 3);
    //     this.progressBar.style.width = `${this.normalizedProgress * 100}0%`;
    //     // console.log( this.routeLine.drawCount / this.routeLine.numberVertices );

    //     // dont repeat
    //     // console.log( this._drawCount, this._routeLine.numberVertices );
    //     if (
    //         this.drawCount >=
    //         this.routeLine.numberVertices - Config.routes.lineSegments
    //     ) {
    //         this.runAnimation = false;
    //         const lastMarker = this.pois[this.pois.length - 1];
    //         this.controls.moveIntoCenter(
    //             lastMarker.lat,
    //             lastMarker.lng,
    //             1000,
    //             Config.easing,
    //             400
    //         );
    //     }
    // }
}
