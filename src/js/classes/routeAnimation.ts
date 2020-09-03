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
import UserInterface from "./userInterface";

// if (process.env.NODE_ENV === "development") {
function playText(text: string) {
    const ico = icon(faPlayCircle, {
        classes: ["mx-2"],
    }).html;
    return `${ico} ${text}`;
}
function stopText(text: string) {
    const ico = icon(faStopCircle, {
        classes: ["mx-2", "text-danger"],
    }).html;
    return `${ico} ${text}`;
}
// }

function fly(marker: Marker): boolean {
    return marker.poi.label === "Kanada";
}

export default class RouteAnimation {
    private tweenSpawn: any = null;
    private tweenDraw: any = null;
    private animationPace: number = 1;
    private animationDrawIndex: { index: number } = { index: 0 };
    private lastActive: number | undefined;
    private spawnUI: any;
    private drawUI: any;
    private tweenGroup: any = new TWEEN.Group();

    public simplifiedRoute: THREE.CatmullRomCurve3 | undefined;

    constructor(
        private route: Route,
        private mover: Mover,
        private marker: Marker[],
        private routeData: Poi[],
        private controls: Controls,
        private ui: UserInterface,
        folder: any
    ) {
        if (this.route.routeLine.curve) {
            const points = this.route.routeLine.curve.getPoints(20);
            this.simplifiedRoute = new CatmullRomCurve3(points);
        }

        if (process.env.NODE_ENV === "development") {
            const folderCustom = folder.addFolder("Animation");
            folderCustom.open();
            folderCustom.add(this, "animationPace").min(0).max(10);

            this.spawnUI = folderCustom
                .add(this, "spawn")
                .name(playText("Spawn"))
                .onChange(function () {
                    this.name(stopText("Spawn"));
                });
            this.drawUI = folderCustom
                .add(this, "draw")
                .name(playText("Draw"))
                .onChange(function () {
                    this.name(stopText("Draw"));
                });
        }
    }

    private drawUpdate(value: { index: number }) {
        this.route.setDrawCount(value.index);
        this.animationDrawIndex.index = value.index;

        const forecast = 15;

        const normalizedProgress =
            value.index / this.route.routeLine.numberVertices;
        if (this.simplifiedRoute) {
            const p = this.simplifiedRoute.getPoint(normalizedProgress);
            this.controls.threeControls.target = p;
        }

        const progressIndex = this.route.routeLine.getIndexFromDrawcount(
            value.index
        );
        const result = this.marker.find((marker: Marker) => {
            return marker.index === Math.floor(progressIndex + forecast);
        });

        // -- flying transition
        if (
            progressIndex === 1 &&
            this.lastActive === 0 &&
            fly(this.marker[1])
        ) {
            this.lastActive = this.marker[1].index;
            this.mover.flying(false);
            const tween = this.marker[1].spawn();
            this.marker[1].showLabel(true);
            tween.start();
            this.controls
                .moveIntoCenter(
                    this.marker[1].poi.lat,
                    this.marker[1].poi.lng,
                    1000
                )
                .start();
        }
        // -- flying transition

        if (result === undefined) return;
        if (this.lastActive && result.index > this.lastActive) {
            this.lastActive = result.index;
            const tween = result.spawn();
            tween.start();
            result.showLabel(true);
            // const next = this.route.getNext(result);
            // if (!next) return;
            this.controls
                .moveIntoCenter(
                    result.poi.lat,
                    result.poi.lng,
                    1000,
                    undefined,
                    200
                )
                .start();
        }
    }

    private onStop() {
        this.marker.forEach((marker: Marker) => {
            marker.showLabel(true);
        });
        this.mover.moving(false);
        if (process.env.NODE_ENV === "development") {
            this.drawUI.name(playText("Draw"));
        }
        this.route.setDrawProgress(1);
        this.mover.flying(false);

        const lastActiveMarker = this.marker.find((marker: Marker) => {
            return marker.index === this.lastActive;
        });

        const marker = lastActiveMarker || this.marker[this.marker.length - 1];

        this.controls
            .moveIntoCenter(
                marker.poi.lat,
                marker.poi.lng,
                undefined,
                undefined,
                600
            )
            .start();

        this.controls
            .tweenTarget(new Vector3(), 500)
            .easing(TWEEN.Easing.Quadratic.InOut)
            // @ts-ignore
            .start();
    }

    public stopDraw(): boolean {
        if (this.tweenDraw) {
            this.tweenDraw.stopChainedTweens();
            this.tweenDraw.stop();
            this.tweenDraw = null;
            return true;
        }
        return false;
    }

    public draw(): boolean {
        if (this.tweenDraw && this.tweenDraw.isPlaying()) {
            // this.tweenDraw.stop();
            return false;
        }

        this.tweenGroup.removeAll();
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
        this.route.setDrawProgress(0);
        this.animationDrawIndex.index = 0;
        this.mover.setVisible(false);

        const tweenRouteDraw = new TWEEN.Tween(
            this.animationDrawIndex,
            this.tweenGroup
        )
            .to(
                { index: this.route.routeLine.numberVertices },
                this.route.routeLine.numberVertices / (this.animationPace / 45)
            )
            // .easing(TWEEN.Easing.Circular.Out)
            .onStart(() => {
                this.tweenDraw = tweenRouteDraw;
                this.lastActive = 0;
                // ugh please
                if (fly(this.marker[1])) {
                    this.mover.flying(true);
                }
                this.mover.moving(true);
                if (process.env.NODE_ENV === "development") {
                    this.drawUI.name(stopText("Draw"));
                }
            })
            .onUpdate((value: any) => {
                this.drawUpdate(value);
            })
            // .repeat(Infinity)
            // .repeatDelay(3000)
            // .onRepeat(() => {
            //     this.lastActive = undefined;
            //     if (this.route.activeMarker) {
            //         this.route.setActiveMarker(this.route.activeMarker);
            //     }
            //     this.route.setDrawIndex(0);
            //     // hide label
            //     this.marker.forEach((marker: Marker) => {
            //         marker.setVisible(false);
            //     });
            //     // move camera to start
            //     this.controls.moveIntoCenter(
            //         marker.poi.lat,
            //         marker.poi.lng,
            //         2000,
            //         undefined,
            //         300,
            //         () => {}
            //     );
            //     marker.showLabel(true);
            // })
            .onStop(this.onStop.bind(this))
            .onComplete(() => {
                //@ts-ignore
                this.ui.button.stop();
                // not called when on repeat
                this.marker.forEach((marker: Marker) => {
                    marker.showLabel(true);
                });
                // this.routeLine.drawProgress = 1;
                this.mover.moving(false);
                if (process.env.NODE_ENV === "development") {
                    this.drawUI.name(playText("Draw"));
                }
                this.tweenSpawn = null;
                this.controls
                    .tweenTarget(new Vector3(), 500)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    // @ts-ignore
                    .start();

                this.controls
                    .moveIntoCenter(
                        this.marker[this.marker.length - 1].poi.lat,
                        this.marker[this.marker.length - 1].poi.lng,
                        3000,
                        undefined,
                        600
                    )
                    .start();
            });
        // .delay(500);

        // fade in label 1
        const marker = this.marker[0];
        marker.showLabel(true);

        // tween camera to start
        // todo: dont tween when already there
        this.tweenDraw = this.controls
            .moveIntoCenter(
                marker.poi.lat,
                marker.poi.lng,
                2000,
                undefined,
                300,
                () => {
                    this.mover.setVisible(true);
                }
            )
            .onStop(this.onStop.bind(this))
            .chain(tweenRouteDraw)
            .start();

        return true;
    }

    public spawn() {
        if (this.tweenSpawn && this.tweenSpawn.isPlaying()) {
            // this.tweenSpawn.stop();
            return;
        }
        // else if (this.tweenSpawn) {
        //      // pause/resume is bugged
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
        // new TWEEN.Tween({ drawProgress: 0 })
        this.tweenSpawn = new TWEEN.Tween(
            this.animationDrawIndex,
            this.tweenGroup
        )
            // @ts-ignore
            // .to({ drawProgress: 1 }, 3000)
            .to(
                { index: this.route.routeLine.numberVertices },
                this.route.routeLine.numberVertices / this.animationPace
            )
            // .easing( TWEEN.Easing.Circular.InOut )
            // .easing( TWEEN.Easing.Quintic.InOut )
            // .easing(TWEEN.Easing.Cubic.InOut)
            .easing(TWEEN.Easing.Circular.Out)
            // .easing(easing || Config.easing)
            .onStart(() => {
                this.mover.moving(true);
                if (process.env.NODE_ENV === "development") {
                    this.spawnUI.name(stopText("Spawn"));
                }
            })
            .onUpdate((value: { index: number }) => {
                // this.route.setDrawIndex(value.index);
                this.route.setDrawCount(value.index);
            })
            // .repeat(Infinity)
            .onStop(() => {
                this.mover.moving(false);
                if (process.env.NODE_ENV === "development") {
                    this.spawnUI.name(playText("Spawn"));
                }
                this.tweenGroup.removeAll();
                // this.tweenSpawn = null;
                this.route.setDrawIndex(this.routeData.length);
            })
            .onComplete(() => {
                this.mover.moving(false);
                if (process.env.NODE_ENV === "development") {
                    this.spawnUI.name(playText("Spawn"));
                }
                this.tweenGroup.removeAll();
                // this.tweenSpawn = null;
            })
            .delay(100)
            // @ts-ignore
            .start();
    }

    public update(delta: number) {
        this.tweenGroup.update();
    }
}
