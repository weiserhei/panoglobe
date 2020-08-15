/**
 * Route Class
 * create the Route
 */

import { Color } from "three";

import Config from "./../../data/config";

import { calc3DPositions, createSphereArc } from "./../utils/panoutils";
import { makeColorGradient } from "./../utils/colors";
import RouteLine from "./routeLine.js";
import Marker from "./marker";

function getVertices(routeData) {
    const vertices = [];
    routeData.forEach((element, index) => {
        if (index > 0) {
            const curve = createSphereArc(
                routeData[index - 1].displacedPos,
                element.displacedPos
            );
            vertices.push(...curve.getPoints(Config.routes.lineSegments));
        }
    });

    return vertices;
}

export default class Route {
    constructor(
        scene,
        container,
        routeData,
        heightData,
        radius,
        phase,
        controls
    ) {
        if (heightData.length === 0) {
            console.warn("No height data for route ", routeData.meta.name);
        }

        this.controls = controls;

        this.name = routeData.meta.name || "";
        this.routeData = calc3DPositions(
            routeData.gps,
            heightData,
            radius + 0.0
        );
        // this.routeData:
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

        const vertices = getVertices(this.routeData);

        this.activeMarker = null;
        this.container = container;

        this.heightData = [];
        const steps = 1.2; // how fast change the color (0 = fast)
        const frequency = 1 / (steps * this.routeData.length);

        this.marker = [];

        this.visible = false;
        this.showLabels1 = true;

        this.animate = false;
        this.speed = 0;

        this.routeData.forEach((currentCoordinate, index) => {
            // DONT DRAW MARKER WHEN THEY HAVE NO NAME
            if (!currentCoordinate.adresse) {
                return;
            }

            // CREATE MARKER
            const marker = new Marker(
                new Color(
                    makeColorGradient(
                        index,
                        frequency,
                        undefined,
                        undefined,
                        phase
                    )
                ),
                currentCoordinate,
                this,
                controls,
                index
            );
            this.marker.push(marker);
            // scene.add(marker.mesh);
            currentCoordinate.marker = marker;

            // CREATE LABELS FOR MARKER
            const name =
                currentCoordinate.countryname || currentCoordinate.adresse;
            const text =
                "<small class='font-weight-bold'>" +
                this.marker.length +
                "</small>" +
                " " +
                name;
            marker.getLabel(this.container, text, this.showLabels, scene);
            // marker.getIconLabel(this.container, scene);
        });

        this.marker[this.marker.length - 1].isLast = true;

        this.marker.forEach((m, index) => {
            if (index !== 0) {
                m.previous = this.marker[index - 1];
            }
            if (index !== this.marker.length - 1) {
                m.next = this.marker[index + 1];
            }

            // CREATE HUDLABELS FOR MARKER
            m.getInfoBox(this.container);
        });

        this.routeLine = new RouteLine(vertices, steps, phase);
        scene.add(this.routeLine.line);
    }

    get showLabels() {
        return this.showLabels1;
    }

    set showLabels(value) {
        this.showLabels1 = value;
        this.marker.forEach((marker) => {
            marker.label.isVisible = value;
        });
    }

    setActiveMarker(value) {
        this.activeMarker = value;
        if (this.manager !== undefined) {
            this.manager.setActiveMarker(value);
        }
    }

    get isVisible() {
        return this.visible;
    }

    set isVisible(value) {
        this.visible = value;
        this.marker.forEach((marker) => {
            marker.isVisible = value;
        });
        this.routeLine.line.visible = value;
    }

    update(delta, camera) {
        this.marker.forEach((marker) => {
            marker.update(camera, delta);
        });

        if (this.animate === true) {
            this.animateRoute(delta);
        }
    }

    get pois() {
        return this.marker;
    }

    get runAnimation() {
        return this.animate;
    }

    set runAnimation(value) {
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
