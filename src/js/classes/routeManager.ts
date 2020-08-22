import { ImageLoader } from "three";
import $ from "jquery";
import Route from "./route";
import Controls from "./controls";
import { calc3DPositions } from "../utils/panoutils";
import { getHeightData } from "../utils/panoutils";
import UserInterface from "./userInterface";
// import Config from "../../data/config";

import T_heightmap from "../../textures/heightmap_1440.jpg";
import Marker from "./marker";

export default class RouteManager {
    public routes: Array<Route>;
    public activeMarker: Marker | null;

    private heightData: Promise<Array<Array<Number>>>;
    private ui: UserInterface;
    private _activeRoute: Route;

    constructor(
        private scene: THREE.Scene,
        private container: HTMLElement,
        private globusradius: number,
        private controls: Controls
    ) {
        this.ui = new UserInterface(container, controls);
        this.routes = [];
        this.activeMarker = null;

        this.heightData = new Promise((resolve) => {
            return new ImageLoader().load(T_heightmap, resolve);
        }).then((image) => {
            const scaleDivider = 20;
            return getHeightData(image, scaleDivider);
        });
    }

    public buildRoute(
        routeData: RouteData,
        phase: number,
        folder: any
    ): Promise<Route> {
        return this.heightData.then((data) => {
            let calculatedRouteData: Array<Poi> = calc3DPositions(
                routeData.gps,
                data,
                this.globusradius + 0.0
            );
            if (process.env.NODE_ENV === "development") {
                var folderCustom = folder.addFolder(routeData.meta.name);
                folderCustom.open();
            }
            const route = new Route(
                routeData.meta.name,
                this.scene,
                this.container,
                calculatedRouteData,
                phase,
                this.controls,
                this,
                folderCustom
            );
            this.routes.push(route);

            // Onload other route disable last active marker
            if (this.activeMarker !== null) {
                this.activeMarker.setActive(false);
            }

            // const lat = 48.78232, lng = 9.17702; // stgt
            // const lat = 19.432608, lng = -99.133209; // mexico
            // select last Marker on first route, and first marker on following routes
            const index = this.routes.length > 1 ? 0 : route.marker.length - 1;

            this.spawnRoute(route);
            // route.drawAnimation();

            return route;
        });
    }

    private spawnRoute(route: Route): void {
        route.spawn();
        const poi = route.marker[route.marker.length - 1].poi;
        const buildSlider = () => {
            const poi: Array<number> = [];
            const labels: Array<string> = [];
            route.routeData.forEach(function (e: Poi, index: number) {
                if (e.adresse) {
                    poi.push(index);
                    labels.push(e.adresse);
                } else {
                    labels.push("");
                }
            });
            this.ui.createSlider(route.routeData, route, poi, labels);
        };

        this.controls.moveIntoCenter(
            poi.lat,
            poi.lng,
            2000,
            undefined,
            undefined,
            buildSlider
        );
    }

    set activeRoute(route: Route) {
        this.spawnRoute(route);
    }

    static load(url: string | undefined) {
        // load datalist
        return $.getJSON(url, {
            format: "json",
        })
            .done(() => {
                console.log("Route has been loaded");
                // this.buildRoute(data, phase, folder);
            })
            .fail(() => {
                alert("Sorry! An Error occured while loading the route :(");
            });
        // .always(function() {
        // alert( "complete" );
        // });
    }

    public setActiveMarker(route: Route, marker: Marker) {
        if (route.activeMarker === marker) {
            // current marker is active => toggle
            marker.setActive(false);
            route.activeMarker = null;
            this.activeMarker = null;
            return;
        } else if (this.activeMarker != undefined) {
            // the manager disables ALL active Markers
            // this.routes.forEach((r) => {
            //     if (r.activeMarker != undefined) {
            //         r.activeMarker.setActive(false);
            //         r.activeMarker = null;
            //     }
            // });
            // some other marker is active, turn off then turn new one on
            this.activeMarker.setActive(false);
            marker.setActive(true);
        } else {
            marker.setActive(true);
        }
        this.activeMarker = marker;
    }

    public update(delta: number, camera: THREE.Camera) {
        this.routes.forEach((route) => {
            route.update(delta, camera);
        });
    }
}
