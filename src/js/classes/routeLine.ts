/**
 * Draw a the route line on the globe
 * uses one Buffer Geometry Line or
 * uses merged THREE.Line geometry
 */

import {
    Vector2,
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
import { makeColorGradient, makeColorGradient2 } from "../utils/colors";
import { createSphereArc } from "../utils/panoutils";
import Config from "../../data/config";

function getVertices(routeData: Array<Poi>): Array<THREE.Vector3> {
    const vertices: Array<THREE.Vector3> = [];
    routeData.forEach((element, index) => {
        if (index > 0) {
            const curve = createSphereArc(
                routeData[index - 1].displacedPos,
                element.displacedPos
            );
            // curve.getPoints returns Type Vector instead of Vector3
            // @ts-ignore
            vertices.push(...curve.getPoints(Config.routes.lineSegments));
        }
    });

    // vertices.map((v) => {
    //     return new Vector3(v.x, v.y, v.z);
    // });

    // console.log(vertices);
    return vertices;
}

export default class RouteLine {
    // todo
    // public line: Line | Line2;
    public line: any;
    public curve: THREE.CatmullRomCurve3 | undefined;
    public vertices: Array<Vector3>;
    public drawCount: number;
    public currentPositionVec: THREE.Vector;
    public nextPositionVec: THREE.Vector;
    public colorWheel: number;
    private positions: Float32Array | undefined;
    private colors: Float32Array | undefined;

    get colorArray(): Float32Array | undefined {
        return this.colors;
    }

    set drawProgress(value: number) {
        this.setDrawProgress(value);
    }

    get drawProgress(): number {
        return this.line.geometry.instanceCount;
    }

    public drawPoi(index: number) {
        const range = index * (Config.routes.lineSegments + 1);
        this.line.geometry.instanceCount = range - 1;
    }
    public setDrawProgress(percent: number) {
        // const normalizedProgress = this.drawCount / this.numberVertices;
        const drawRamge = percent * this.numberVertices;
        this.line.geometry.instanceCount = drawRamge;
        // console.log(
        //     this.numberVertices,
        //     routeData.length,
        //     (routeData.length - 1) * (Config.routes.lineSegments + 1)
        // );
    }
    public setDrawCount(number: number) {
        this.drawCount = number;
        // this.drawCount = number % this.numberVertices;
        this.line.geometry.instanceCount = number - 1;
    }
    public setDrawIndex(number: number) {
        this.drawCount = number * (Config.routes.lineSegments + 1);
        // this.drawCount = number % this.numberVertices;
        this.line.geometry.instanceCount = this.drawCount;
    }

    constructor(routeData: Array<Poi>, steps: number, phase: number) {
        this.line = undefined;
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
            this.line = this.getColoredBufferLine(steps, phase);
        }
    }

    get numberVertices(): number {
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

    rainbow(delta: number) {
        const steps = 1;
        const phase = 0.9;

        // const numberVertices = this.line.geometry.vertices.length;
        const numberVertices = this.numberVertices;
        const color = new Color();
        const frequency = 1 / (steps * numberVertices);

        this.colorWheel = (this.colorWheel + 3) % numberVertices;
        // console.log(colorWheel);
        // this.positions = new Float32Array( numberVertices * 3 ); // 3 vertices per point
        this.colors = new Float32Array(numberVertices * 3);
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
                this.colors[i * 3] = highlightcolor.r;
                this.colors[i * 3 + 1] = highlightcolor.g;
                this.colors[i * 3 + 2] = highlightcolor.b;
            } else {
                // this.positions[ i * 3 ] = vertice.x;
                // this.positions[ i * 3 + 1 ] = vertice.y;
                // this.positions[ i * 3 + 2 ] = vertice.z;
                color.set(
                    makeColorGradient(i, frequency, undefined, undefined, phase)
                );
                // color.set(0x883300);
                this.colors[i * 3] = color.r;
                this.colors[i * 3 + 1] = color.g;
                this.colors[i * 3 + 2] = color.b;
            }
        }

        return this.colors;
    }

    updateColors(delta: number) {
        const geometry = this.line.geometry;
        // Put your drawing code here
        const colors = this.rainbow(delta);
        geometry.setAttribute("color", new BufferAttribute(colors, 3));
        // geometry.setColors(colors);
    }

    drawFull() {
        if (this.line.geometry instanceof LineGeometry) {
            // thick line
            this.line.geometry.maxInstancedCount = this.numberVertices - 1;
        } else if (this.line.geometry instanceof BufferGeometry) {
            this.line.geometry.setDrawRange(0, this.numberVertices);
        }
    }

    build(vertices: Array<THREE.Vector3>, steps: number, phase: number) {
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

    getThickLine(
        vertices: Array<THREE.Vector3>,
        steps: number,
        phase: number,
        linewidth: number,
        CMR: boolean
    ) {
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
            vertexColors: true,
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
                // @ts-ignore
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

    getColoredBufferLine(steps: number, phase: number) {
        this.build(this.vertices, steps, phase);

        // geometry
        const geometry = new BufferGeometry();
        geometry.addAttribute(
            "position",
            new BufferAttribute(this.positions, 3)
        );
        geometry.addAttribute("color", new BufferAttribute(this.colors, 3));

        // material
        const lineMaterial = new LineBasicMaterial({
            vertexColors: true,
        });

        // line
        const line = new Line(geometry, lineMaterial);

        return line;
    }
}
