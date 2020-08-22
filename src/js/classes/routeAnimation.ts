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

export default class RouteAnimation {
    private animationPace: number = 100;
    private animationDrawIndex: any;
    private lastActive: number | undefined;

    private playText: (text: string) => string;
    private stopText: (text: string) => string;
    private spawnUI: any;
    private drawUI: any;
    private tweenSpawn: any = null;
    private tweenDraw: any = null;

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
        const index = Math.floor(value.index);
        this.route.setDrawIndex(value.index);

        const result = this.marker.find((marker: Marker) => {
            return marker.index === index;
        });

        if (result === undefined) return;
        if (result.index === 0 && this.lastActive === undefined) {
            this.lastActive = 0;
            const next = this.route.getNext(result);
            if (next) {
                this.controls.moveIntoCenter(
                    next.poi.lat,
                    next.poi.lng,
                    1000,
                    undefined,
                    200,
                    () => {
                        // marker.showLabel();
                    }
                );
            }
        } else if (result.index > this.lastActive) {
            // debounce
            this.lastActive = result.index;
            // this.setActiveMarker(result);
            const tween = result.spawn();
            tween.start();
            result.showLabel(true);

            const next = this.route.getNext(result);
            if (!next) return;
            this.controls.moveIntoCenter(
                next.poi.lat,
                next.poi.lng,
                1000,
                undefined,
                200
            );
        }
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

        this.tweenDraw = new TWEEN.Tween(this.animationDrawIndex)
            // @ts-ignore
            .to(
                { index: this.routeData.length },
                this.routeData.length * this.animationPace * 2
            )
            // .easing( TWEEN.Easing.Circular.InOut )
            .onStart(() => {
                this.mover.moving(true);
                this.drawUI.name(this.stopText("Draw"));
            })
            .onUpdate((value: any) => {
                this.drawUpdate(value);
            })
            // .repeat(Infinity)
            .repeatDelay(3000)
            .onRepeat(() => {
                this.lastActive = undefined;
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
                this.lastActive = undefined;
                this.mover.moving(false);
                this.drawUI.name(this.playText("Draw"));
                this.tweenSpawn = null;
                this.route.setDrawIndex(this.routeData.length);
            })
            .onComplete(() => {
                // not called when on repeat
                this.marker.forEach((marker: Marker) => {
                    marker.showLabel(true);
                });
                // this.routeLine.drawProgress = 1;
                this.lastActive = undefined;
                this.mover.moving(false);
                this.drawUI.name(this.playText("Draw"));
                this.tweenSpawn = null;

                this.controls.moveIntoCenter(
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
        this.controls.moveIntoCenter(
            marker.poi.lat,
            marker.poi.lng,
            2000,
            undefined,
            300,
            () => {
                // fade in label 1
                marker.showLabel(true);
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
        this.route.setDrawIndex(0);
        this.animationDrawIndex.index = 0;
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
                { index: this.routeData.length },
                (this.routeData.length * (this.animationPace / 3)) / 10
            )
            // .easing( TWEEN.Easing.Circular.InOut )
            // .easing( TWEEN.Easing.Quintic.InOut )
            // .easing(TWEEN.Easing.Cubic.InOut)
            .easing(TWEEN.Easing.Circular.Out)
            // .easing(easing || Config.easing)
            .onStart(() => {
                this.animationDrawIndex.index = 0;
                this.mover.moving(true);
                this.spawnUI.name(this.stopText("Spawn"));
            })
            .onUpdate((value: any) => {
                this.route.setDrawIndex(value.index);
            })
            // .repeat(Infinity)
            .onStop(() => {
                this.mover.moving(false);
                this.spawnUI.name(this.playText("Spawn"));
                this.tweenSpawn = null;
                this.route.setDrawIndex(this.routeData.length);
            })
            .onComplete(() => {
                this.mover.moving(false);
                this.spawnUI.name(this.playText("Spawn"));
                this.tweenSpawn = null;
            })
            .delay(200)
            // @ts-ignore
            .start();
    }
}
