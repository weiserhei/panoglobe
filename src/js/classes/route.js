/**
 * Route Class
 * create the Route
 */

// import { Color } from "three";
// import { makeColorGradient } from "./../utils/colors";
import RouteLine from "./routeLine.js";
import Marker from "./marker";
import Config from "./../../data/config";

export default class Route {
    constructor(scene, container, routeData, phase, controls, manager, folder) {
        // routeData:
        // [
        //   {
        //     adresse: ""
        //     displaceHeight: 0.1625
        //     displacedPos: { x: 31.803753986570744, y: 70.76274777054891, z: 64.14120100663348 }
        //     externerlink:"http:\/\/panoreisen.de\/156-0-Iran.html",
        //     hopDistance: 5255.320865441695
        //     lat: "44.665800"
        //     lng: "-63.625960"
        //     pos: { x: 31.59444081616366, y: 70.29702994714904, z: 63.719062219429766 }
        //   },
        // ]

        this.routeData = routeData;
        this.activeMarker = null;

        const steps = 1.2; // how fast change the color (0 = fast)
        // const frequency = 1 / (steps * this.routeData.length);

        this.marker = [];

        this.visible = false;
        this.showLabels1 = true;

        this.animate = false;
        this.speed = 0;

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

            // const color = new Color(
            //     makeColorGradient(index, frequency, undefined, undefined, phase)
            // );

            // CREATE MARKER
            const marker = new Marker(
                currentCoordinate,
                this,
                controls,
                index,
                text,
                scene
            );
            this.marker.push(marker);
            // scene.add(marker.mesh);
        });

        this.marker.forEach((m) => {
            // CREATE HUDLABELS FOR MARKER
            m.addInfoBox(container, controls.threeControls);
        });

        this.routeLine = new RouteLine(routeData, steps, phase, folder);
        scene.add(this.routeLine.line);

        // this.routeLine.setDrawCount(this.routeLine.numberVertices);
        // this.routeLine.setDrawProgress(1);
        // this.routeLine.drawPoi(this.marker[1].index);

        this.setActiveMarker = function (marker) {
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

        this.setRunAnimation = function (value) {
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

        this.cycleNextActive = function (marker) {
            if (!this.activeMarker === marker) {
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

        this.cyclePrevActive = function (marker) {
            if (!this.activeMarker === marker) {
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

    getPrev(marker) {
        const index = this.marker.indexOf(marker);
        if (index >= 0 && index < this.marker.length)
            return this.marker[index - 1];
    }

    getNext(marker) {
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
            marker.setVisible(value);
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

    update(delta, camera) {
        this.marker.forEach((marker) => {
            marker.update(camera, delta);
        });

        // this.routeLine.update(delta);
        if (this.animate === true) {
            this.animateRoute(delta);
        }
    }

    get runAnimation() {
        return this.animate;
    }

    set pauseAnimation(value) {
        this.animate = !value;
    }

    animateRoute(delta) {
        let speed = delta * 30;

        // let currentCoordinate = Math.floor( ( this._drawCount / (Config.routes.lineSegments+1) ) );
        // divider must be in the range of routeData.length
        const divider =
            this.drawCount /
            (this.routeLine.numberVertices / this.routeData.length);
        let currentCoordinate = Math.floor(divider);
        // if( currentCoordinate > 1 && this._routeData[ currentCoordinate ].marker !== undefined ) {
        if (this.routeData[currentCoordinate].marker !== undefined) {
            if (
                this.currentInAnimation !==
                this.routeData[currentCoordinate].marker
            ) {
                this.currentInAnimation = this.routeData[
                    currentCoordinate
                ].marker;
                if (this.activeMarker !== null) {
                    this.activeMarker.active = false;
                }
                this.routeData[currentCoordinate].marker.isActive = true;
                setTimeout(() => {
                    if (this.activeMarker !== null) {
                        this.activeMarker.isActive = false;
                    }
                }, 2000);
                const index = this.routeData[currentCoordinate].marker.index;
                if (
                    this.routeData[currentCoordinate].marker.next !== undefined
                ) {
                    const nextIndex = this.routeData[currentCoordinate].marker
                        .next.index;
                    const diff = nextIndex - index;
                    const poi = this.activeMarker.next.poi;
                    // todo: kill slow tween when buttons are pressed
                    this.controls.moveIntoCenter(
                        poi.lat,
                        poi.lng,
                        200 * diff,
                        Config.easing,
                        250
                    );
                }
            }
            // fake slow down on marker
            speed = delta * 10;
        }

        // follow endpoint when last active POI is 50 units behind
        const lastMarkerIndex = this.routeData.findIndex((currCo) => {
            return this.currentInAnimation === currCo.marker;
        });
        if (currentCoordinate > lastMarkerIndex + 50) {
            // if(this.activeMarker !== null) {
            // if( this.activeMarker.next !== undefined ) {
            // // move camera to next marker in advance
            // this._controls.moveIntoCenter(
            // this.activeMarker.next._poi.lat,
            // this.activeMarker.next._poi.lng,
            // 1000
            // );
            this.controls.moveIntoCenter(
                this.routeData[currentCoordinate].lat,
                this.routeData[currentCoordinate].lng,
                200,
                Config.easing,
                300
            );
            // }
            // // this.activeMarker.active = false;
            // }
        }

        this.routeLine.update(speed);
        this.speed = speed;
        // this._drawCount = ( this._drawCount + 1 ) % this._routeLine.numberVertices;
        this.drawCount = this.routeLine.drawCount;
        this.normalizedProgress =
            this.routeLine.drawCount / (this.routeLine.numberVertices - 3);
        this.progressBar.style.width = `${this.normalizedProgress * 100}0%`;
        // console.log( this.routeLine.drawCount / this.routeLine.numberVertices );

        // dont repeat
        // console.log( this._drawCount, this._routeLine.numberVertices );
        if (
            this.drawCount >=
            this.routeLine.numberVertices - Config.routes.lineSegments
        ) {
            this.runAnimation = false;
            const lastMarker = this.pois[this.pois.length - 1];
            this.controls.moveIntoCenter(
                lastMarker.lat,
                lastMarker.lng,
                1000,
                Config.easing,
                400
            );
        }
    }
}
