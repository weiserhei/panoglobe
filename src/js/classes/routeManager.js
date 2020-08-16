import $ from "jquery";
import Route from "./route";
import { calc3DPositions } from "./../utils/panoutils";

export default class RouteManager {
    constructor(scene, container, heightData, globusradius, controls) {
        this.routes = [];
        this.activeMarker = null;

        this.buildRoute = function (routeData, phase, folder) {
            let calculatedRouteData = calc3DPositions(
                routeData.gps,
                heightData,
                globusradius + 0.0
            );

            const route = new Route(
                scene,
                container,
                calculatedRouteData,
                phase,
                controls,
                this,
                folder
            );
            this.routes.push(route);

            let x = folder.add(
                {
                    range: 1,
                },
                "range",
                0,
                1,
                0.1
            );
            x.onChange(function (value) {
                route.routeLine.setDrawProgress(value);
            });

            const manager = this;
            route.marker.forEach((m) => {
                const x = folder
                    .add({ toggle: false }, "toggle")
                    .name(m.poi.adresse);
                x.onChange(function (value) {
                    // route.setActiveMarker(m);
                    // m.setActive(value);
                    manager.controls.moveIntoCenter(m.poi.lat, m.poi.lng, 2000);
                });
            });

            // // Onload other route disable last active marker
            if (this.activeMarker !== null) {
                this.activeMarker.setActive(false);
            }

            // const lat = 48.78232, lng = 9.17702; // stgt
            // const lat = 19.432608, lng = -99.133209; // mexico
            // select last Marker on first route, and first marker on following routes
            const index = this.routes.length > 1 ? 0 : route.marker.length - 1;
            const marker = route.marker[index];
            controls.moveIntoCenter(marker.poi.lat, marker.poi.lng, 2000);

            return route;
        };

        this.setActiveMarker = function (route, marker) {
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
        };
    }

    // get activeMarker() {
    //   return this.activeMarker;
    // }

    static load(url, callback) {
        // load datalist
        if (url) {
            $.getJSON(url, {
                format: "json",
            })
                .done((data) => {
                    console.log("Route has been loaded");
                    callback(data);
                })
                .fail(() => {
                    alert("Sorry! An Error occured while loading the route :(");
                });
            // .always(function() {
            // alert( "complete" );
            // });
        } else {
            // IF NO JSON OBJECT GIVEN
            alert("Call to loadRoute without providing a Link to a datalist");
        }
    }

    update(delta, camera) {
        this.routes.forEach((route) => {
            route.update(delta, camera);
        });
    }
}
