/**
 * Draw a the route line on the globe
 * uses one Buffer Geometry Line or
 * uses merged THREE.Line geometry
 */

import {
    Vector2,
    VertexColors,
    BufferGeometry,
    BufferAttribute,
    Color,
    LineBasicMaterial,
    Line,
    CatmullRomCurve3,
    Vector3,
} from "three";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { makeColorGradient, makeColorGradient2 } from "./../utils/colors";
import { createSphereArc } from "./../utils/panoutils";
import Config from "../../data/config";

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

export default class RouteLine {
    constructor(routeData, steps, phase) {
        this.line = undefined;
        this.curve = undefined;
        this.vertices = getVertices(routeData);
        this.drawCount = 0;
        this.currentPositionVec = new Vector3();
        this.nextPositionVec = new Vector3();
        this.colorWheel = 0;

        if (Config.routes.linewidth > 1) {
            this.line = this.getThickLine(
                this.vertices,
                steps,
                phase,
                Config.routes.linewidth,
                true
            );
        } else {
            this.line = this.getColoredBufferLine(this.vertices, steps, phase);
        }

        this.drawPoi = function (index) {
            const range = index * (Config.routes.lineSegments + 1);
            this.line.geometry.instanceCount = range - 1;
        };

        this.setDrawProgress = function (percent) {
            // const normalizedProgress = this.drawCount / this.numberVertices;
            const drawRamge = percent * this.numberVertices;
            this.line.geometry.instanceCount = drawRamge;
            // console.log(
            //     this.numberVertices,
            //     routeData.length,
            //     (routeData.length - 1) * (Config.routes.lineSegments + 1)
            // );
        };
        this.setDrawCount = function (number) {
            this.drawCount = number;
            // this.drawCount = number % this.numberVertices;
            this.line.geometry.instanceCount = number - 1;
        };
    }

    get numberVertices() {
        return this.vertices.length;
    }

    update(speed = 1) {
        // this.updateColors(speed * 30);
        // return;
        // console.log( this.line.geometry.attributes.instanceStart.data.array )
        // console.log( this.vertices[Math.floor(this.drawCount)] )
        this.currentPositionVec = this.vertices[Math.floor(this.drawCount)];
        this.nextPositionVec = this.vertices[
            Math.floor(this.drawCount) + (3 % this.vertices.length)
        ];
        // drawCount must be all vertices
        this.drawCount = (this.drawCount + speed) % this.numberVertices;

        // http://stackoverflow.com/questions/31399856/drawing-a-line-with-three-js-dynamically/31411794#31411794
        if (
            this.line !== undefined &&
            this.line.geometry instanceof LineGeometry
        ) {
            // Thick Line
            // console.log(this._drawCount);
            this.line.geometry.maxInstancedCount = this.drawCount - 1;
        } else if (
            this.line !== undefined &&
            this.line.geometry instanceof BufferGeometry
        ) {
            this.line.geometry.setDrawRange(0, this.drawCount);
        }
    }

    rainbow(delta) {
        const steps = 1;
        const phase = 0.9;

        // const numberVertices = this.line.geometry.vertices.length;
        const numberVertices = this.numberVertices;
        const color = new Color();
        const frequency = 1 / (steps * numberVertices);

        this.colorWheel = (this.colorWheel + 3) % numberVertices;
        // console.log(colorWheel);
        // this.positions = new Float32Array( numberVertices * 3 ); // 3 vertices per point
        const colors = new Float32Array(numberVertices * 3);
        // this.colors.forEach((vertice, i) => {
        // this.line.geometry.vertices.forEach((vertice, i) => {
        for (let i = 0; i < numberVertices; i++) {
            if (
                i === this.colorWheel ||
                i === this.colorWheel + 2 ||
                i === this.colorWheel + 4 ||
                i === this.colorWheel + 6 ||
                i === this.colorWheel + 8 ||
                i === this.colorWheel + 10
            ) {
                const highlightcolor = new Color(0xffffff);
                colors[i * 3] = highlightcolor.r;
                colors[i * 3 + 1] = highlightcolor.g;
                colors[i * 3 + 2] = highlightcolor.b;
            } else {
                // this.positions[ i * 3 ] = vertice.x;
                // this.positions[ i * 3 + 1 ] = vertice.y;
                // this.positions[ i * 3 + 2 ] = vertice.z;
                color.set(
                    makeColorGradient(i, frequency, undefined, undefined, phase)
                );
                // color.set(0x883300);
                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;
            }
        }

        return colors;
    }

    updateColors(delta) {
        const geometry = this.line.geometry;
        // Put your drawing code here
        const colors = this.rainbow(delta);
        // geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
        geometry.setColors(colors);
    }

    drawFull() {
        if (this.line.geometry instanceof LineGeometry) {
            // thick line
            this.line.geometry.maxInstancedCount = this.numberVertices - 1;
        } else if (this.line.geometry instanceof BufferGeometry) {
            this.line.geometry.setDrawRange(0, this.numberVertices);
        }
    }

    build(vertices, steps, phase) {
        // calculate Positions and Colors
        // based on steps and color phase
        const numberVertices = vertices.length;
        const color = new Color();
        const frequency = 1 / (steps * numberVertices);

        this.positions = new Float32Array(numberVertices * 3); // 3 vertices per point
        this.colors = new Float32Array(numberVertices * 3);

        vertices.forEach((vertice, i) => {
            this.positions[i * 3] = vertice.x;
            this.positions[i * 3 + 1] = vertice.y;
            this.positions[i * 3 + 2] = vertice.z;

            color.set(
                makeColorGradient(i, frequency, undefined, undefined, phase)
            );

            this.colors[i * 3] = color.r;
            this.colors[i * 3 + 1] = color.g;
            this.colors[i * 3 + 2] = color.b;
        });
    }

    getThickLine(vertices, steps, phase, linewidth, CMR) {
        if (CMR) {
            const curve = new CatmullRomCurve3(vertices);
            this.curve = curve;
            // const curve = new CatmullRomCurve3(vertices, false, "catmullrom", 1);
            this.vertices = curve.getPoints(
                vertices.length * Config.routes.segmentMultiplicator
            );
        }
        // remove possible NaN points
        this.vertices = vertices.filter((el) => !isNaN(el.x));
        // console.log(this.vertices);

        this.build(this.vertices, steps, phase);
        const geometry = new LineGeometry();
        geometry.setPositions(this.positions);
        geometry.setColors(this.colors);

        const lineMaterial = new LineMaterial({
            color: 0xffffff,
            linewidth: linewidth, // in pixels
            vertexColors: VertexColors,
            resolution: new Vector2(window.innerWidth, window.innerHeight),
            // resolution:  // to be set by renderer, eventually
            dashed: false,
        });

        const line = new Line2(geometry, lineMaterial);
        // this._line.computeLineDistances();
        // this._line.scale.set( 1, 1, 1 );

        // resize line on page resize - renderer doesnt do this
        window.addEventListener(
            "resize",
            () => {
                line.material.resolution.set(
                    window.innerWidth,
                    window.innerHeight
                );
            },
            false
        );
        // render "on top"
        // interferes with atmosphere material
        // this._line.renderOrder = 999;
        // this._line.onBeforeRender = function( renderer ) {
        // renderer.clearDepth();
        // };

        return line;
    }

    getColoredBufferLine(steps, phase) {
        this.build(steps, phase);

        // geometry
        const geometry = new BufferGeometry();
        geometry.addAttribute(
            "position",
            new BufferAttribute(this.positions, 3)
        );
        geometry.addAttribute("color", new BufferAttribute(this.colors, 3));

        // material
        const lineMaterial = new LineBasicMaterial({
            vertexColors: VertexColors,
        });

        // line
        const line = new Line(geometry, lineMaterial);

        return line;
    }
}
