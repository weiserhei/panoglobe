import TWEEN from "@tweenjs/tween.js";
import Mover from "./mover";
import Marker from "./marker";
import Route from "./route";
import Controls from "./controls";

import { icon, Icon } from "@fortawesome/fontawesome-svg-core";
import {
    faPlayCircle,
    faStopCircle,
    faStop,
    faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { CatmullRomCurve3, Vector3 } from "three";

export default class RouteAnimation {
    private animationPace: number = 10;
    private animationDrawIndex: any;
    private lastActive: number;

    private playText: (text: string) => string;
    private stopText: (text: string) => string;
    private spawnUI: any;
    private drawUI: any;
    private tweenSpawn: any = null;
    private tweenDraw: any = null;
    private simplifiedRoute: THREE.CatmullRomCurve3;
    constructor(
        private route: Route,
        private mover: Mover,
        private marker: Array<Marker>,
        private routeData: Array<Poi>,
        private controls: Controls,
        folder: any
    ) {
        if (process.env.NODE_ENV === "development") {
            this.playText = function (text) {
                const ico = icon(faPlayCircle, {
                    classes: ["mx-2"],
                }).html;
                return `${ico} ${text}`;
            };
            this.stopText = function (text) {
                const ico = icon(faStopCircle, {
                    classes: ["mx-2", "text-danger"],
                }).html;
                return `${ico} ${text}`;
            };

            const folderCustom = folder.addFolder("Animation");
            folderCustom.open();
            folderCustom.add(this, "animationPace").min(10).max(300).step(10);

            const self = this;
            this.spawnUI = folderCustom
                .add(this, "spawn")
                .name(this.playText("Spawn"))
                .onChange(function () {
                    this.name(self.stopText("Spawn"));
                });
            this.drawUI = folderCustom
                .add(this, "draw")
                .name(this.playText("Draw"))
                .onChange(function () {
                    this.name(self.stopText("Draw"));
                });
        }
        this.animationDrawIndex = { index: 0 };
    }

    private drawUpdate(value: any) {
        this.route.setDrawCount(value.index);
        this.animationDrawIndex.index = value.index;

        const forecast = 10;

        const progressIndex =
            (this.routeData.length / this.route.routeLine.numberVertices) *
            value.index;
        const result = this.marker.find((marker: Marker) => {
            return marker.index === Math.floor(progressIndex + forecast);
        });

        const normalizedProgress =
            value.index / this.route.routeLine.numberVertices;
        const p = this.simplifiedRoute.getPoint(normalizedProgress);
        this.controls.threeControls.target = p;

        if (result === undefined) return;

        if (result.index > this.lastActive) {
            this.lastActive = result.index;
            const tween = result.spawn();
            tween.start();
            result.showLabel(true);
            // const next = this.route.getNext(result);
            // if (!next) return;
            this.controls.moveIntoCenter(
                result.poi.lat,
                result.poi.lng,
                1000,
                undefined,
                200
            );
        }

        // if (result.index === 0 && this.lastActive === undefined) {
        //     this.lastActive = 0;
        //     const next = this.route.getNext(result);
        //     if (next) {
        //         this.controls.moveIntoCenter(
        //             next.poi.lat,
        //             next.poi.lng,
        //             1000,
        //             undefined,
        //             200,
        //             () => {
        //                 // marker.showLabel();
        //             }
        //         );
        //     }
        // } else if (result.index > this.lastActive) {
        //     // debounce
        //     this.lastActive = result.index;
        //     // this.setActiveMarker(result);
        //     const tween = result.spawn();
        //     tween.start();
        //     result.showLabel(true);

        //     const next = this.route.getNext(result);
        //     if (!next) return;
        //     this.controls.moveIntoCenter(
        //         next.poi.lat,
        //         next.poi.lng,
        //         1000,
        //         undefined,
        //         200
        //     );
        // }
    }

    public draw() {
        if (this.tweenDraw && this.tweenDraw.isPlaying()) {
            this.tweenDraw.stop();
            return;
        }
        // disable active marker if any
        if (this.route.activeMarker) {
            this.route.setActiveMarker(this.route.activeMarker);
        }
        // hide label
        this.marker.forEach((marker: Marker) => {
            // marker.showLabel(false);
            marker.setVisible(false);
        });
        // slow down tween: https://github.com/tweenjs/tween.js/issues/105#issuecomment-34570228
        // hide route
        this.route.setDrawIndex(0);
        this.animationDrawIndex.index = 0;
        const marker = this.marker[0];
        const points = this.route.routeLine.curve.getPoints(20);
        this.simplifiedRoute = new CatmullRomCurve3(points);

        this.tweenDraw = new TWEEN.Tween(this.animationDrawIndex)
            // @ts-ignore
            .to(
                { index: this.route.routeLine.numberVertices },
                this.route.routeLine.numberVertices / (this.animationPace / 300)
            )
            // .easing( TWEEN.Easing.Circular.InOut )
            .onStart(() => {
                this.lastActive = 0;
                this.mover.moving(true);
                if (process.env.NODE_ENV === "development") {
                    this.drawUI.name(this.stopText("Draw"));
                }
            })
            .onUpdate((value: any) => {
                this.drawUpdate(value);
            })
            // .repeat(Infinity)
            .repeatDelay(3000)
            .onRepeat(() => {
                this.lastActive = 0;
                if (this.route.activeMarker) {
                    this.route.setActiveMarker(this.route.activeMarker);
                }
                this.route.setDrawIndex(0);
                // hide label
                this.marker.forEach((marker: Marker) => {
                    marker.setVisible(false);
                });
                // move camera to start
                this.controls.moveIntoCenter(
                    marker.poi.lat,
                    marker.poi.lng,
                    2000,
                    undefined,
                    300,
                    () => {}
                );
                marker.showLabel(true);
            })
            .onStop(() => {
                this.marker.forEach((marker: Marker) => {
                    marker.showLabel(true);
                });
                // this.routeLine.drawProgress = 1;
                this.mover.moving(false);
                this.drawUI.name(this.playText("Draw"));
                this.tweenSpawn = null;
                // this.route.setDrawIndex(this.routeData.length);
                this.controls.resetTarget();
            })
            .onComplete(() => {
                // not called when on repeat
                this.marker.forEach((marker: Marker) => {
                    marker.showLabel(true);
                });
                // this.routeLine.drawProgress = 1;
                this.mover.moving(false);
                if (process.env.NODE_ENV === "development") {
                    this.drawUI.name(this.playText("Draw"));
                }
                this.tweenSpawn = null;
                // this.controls.threeControls.target = new Vector3(0, 8, 0);
                this.controls.resetTarget();

                this.controls.moveIntoCenter(
                    this.marker[this.marker.length - 1].poi.lat,
                    this.marker[this.marker.length - 1].poi.lng,
                    2000,
                    undefined,
                    600
                );
            })
            .delay(1000);
        // @ts-ignore
        // .start();

        // fade in label 1
        marker.showLabel(true);
        // move camera to start
        this.controls.moveIntoCenter(
            marker.poi.lat,
            marker.poi.lng,
            2000,
            undefined,
            300,
            () => {
                // @ts-ignore
                this.tweenDraw.start();
            }
        );
    }

    public spawn() {
        if (this.tweenSpawn && this.tweenSpawn.isPlaying()) {
            this.tweenSpawn.stop();
            return;
        }
        // else if (this.tweenSpawn) {
        //     console.log("???", this.tweenSpawn);
        //     this.tweenSpawn.resume();
        //     return;
        // }
        this.animationDrawIndex.index = 0;
        this.route.setDrawIndex(0);
        this.marker.forEach((m: Marker, index: number) => {
            // drop marker delayed
            m.showLabel(false);
            m.spawn()
                .onStart(() => {
                    m.showLabel(true);
                })
                .delay(100 * (index + 1))
                .start();
        });
        // @ts-ignore
        // new TWEEN.Tween({ drawProgress: 0 })
        this.tweenSpawn = new TWEEN.Tween(this.animationDrawIndex)
            // @ts-ignore
            // .to({ drawProgress: 1 }, 3000)
            .to(
                { index: this.route.routeLine.numberVertices },
                this.route.routeLine.numberVertices / (this.animationPace / 10)
            )
            // .easing( TWEEN.Easing.Circular.InOut )
            // .easing( TWEEN.Easing.Quintic.InOut )
            // .easing(TWEEN.Easing.Cubic.InOut)
            .easing(TWEEN.Easing.Circular.Out)
            // .easing(easing || Config.easing)
            .onStart(() => {
                this.animationDrawIndex.index = 0;
                this.route.setDrawCount(0);
                this.mover.moving(true);
                if (process.env.NODE_ENV === "development") {
                    this.spawnUI.name(this.stopText("Spawn"));
                }
            })
            .onUpdate((value: any) => {
                // this.route.setDrawIndex(value.index);
                this.route.setDrawCount(value.index);
            })
            // .repeat(Infinity)
            .onStop(() => {
                this.mover.moving(false);
                if (process.env.NODE_ENV === "development") {
                    this.spawnUI.name(this.playText("Spawn"));
                }
                this.tweenSpawn = null;
                this.route.setDrawIndex(this.routeData.length);
            })
            .onComplete(() => {
                this.mover.moving(false);
                if (process.env.NODE_ENV === "development") {
                    this.spawnUI.name(this.playText("Spawn"));
                }
                this.tweenSpawn = null;
            })
            .delay(200)
            // @ts-ignore
            .start();
    }
}
