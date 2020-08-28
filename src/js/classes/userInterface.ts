import $ from "jquery";

import noUiSlider from "nouislider";
import "nouislider/distribute/nouislider.css";
import "../../css/nouislider.css";
import MyFormatter from "../utils/sliderFormatter";
import Controls from "./controls";
import Route from "./route";
import "bootstrap";

import { icon, Icon } from "@fortawesome/fontawesome-svg-core";
import {
    faPlayCircle,
    faStopCircle,
    faStop,
    faPlay,
} from "@fortawesome/free-solid-svg-icons";

import Logo from "../../img/butze_auf_amerikakugel_740x740.png";
import RouteManager from "./routeManager";

// todo
// hide slider in bottom
// only show a hint to bring it up

function playText(text: string) {
    const ico = icon(faPlayCircle, {
        classes: ["mr-1"],
    }).html;
    return `${ico} ${text}`;
}

function stopText(text: string) {
    const ico = icon(faStopCircle, {
        classes: [],
    }).html;
    return `${ico} ${text}`;
}

export default class UserInterface {
    public createSlider: (
        calculatedRouteData: Array<Poi>,
        route: Route,
        poi: Array<number>,
        adresses: Array<string>
    ) => void;

    public addRoute(route: Route) {
        const select: any = document.querySelector(`#${this.routeSelect.id}`);
        // const select = $(this.routeSelect)[0];
        select.options[select.options.length] = new Option(route.name);
        select.onchange = (x: any) => {
            this.manager.activeRoute = this.manager.routes[
                x.target.selectedIndex
            ];
        };
    }

    private play() {
        console.log("hello play", this.manager);
        this.manager.activeRoute.animationHandler.draw();
    }

    private routeSelect: HTMLSelectElement;
    private navbar: HTMLElement;

    constructor(
        container: HTMLElement,
        controls: Controls,
        private manager: RouteManager
    ) {
        this.routeSelect = document.createElement("select");
        this.routeSelect.className = "custom-select";
        this.routeSelect.id = "inputGroupSelect01";

        this.navbar = document.createElement("ul");
        this.navbar.id = "navbar";
        this.navbar.className = "navbar-nav mr-auto mt-2 mt-md-0 ml-md-4";

        const nav = document.createElement("nav");
        // container.appendChild(nav);
        document.body.prepend(nav);
        nav.style.zIndex = "900";
        nav.className = "navbar navbar-expand-md navbar-light bg-light";

        // <div class="row no-gutters align-items-center justify-content-between d-flex">
        nav.innerHTML = `
            <div class="d-flex flex-nowrap flex-md-grow-0 flex-grow-1">
                <a class="navbar-brand" href="#"><img class="img-fluid" src="${Logo}" style="height:30px"></a>

                <div class="form-inline mr-2">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <label class="input-group-text" for="inputGroupSelect01">Route</label>
                    </div>
                    ${this.routeSelect.outerHTML}
                </div>
                </div>

                <button class="navbar-toggler ml-auto" type="button" data-toggle="collapse" data-target="#navbarsExample04" aria-controls="navbarsExample04" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
                </button>
        </div>
      
        <div class="collapse navbar-collapse" id="navbarsExample04">
            ${this.navbar.outerHTML}

            <!--
            <li class="nav-item d-flex align-items-center">
            <div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input" id="customCheck1">
                <label class="custom-control-label" for="customCheck1">Check this custom checkbox</label>
            </div>
            </li>
            -->
            <!--
            <li class="nav-item active">
              <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Link</a>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="dropdown04" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Dropdown</a>
              <div class="dropdown-menu" aria-labelledby="dropdown04">
                <a class="dropdown-item" href="#">Action</a>
                <a class="dropdown-item" href="#">Another action</a>
                <a class="dropdown-item" href="#">Something else here</a>
              </div>
            </li>
            -->
          `;
        //   </div>

        const nb: any = document.querySelector(`#${this.navbar.id}`);
        const play = playText("Play");
        const b = document.createElement("button");
        b.className = "btn btn-dark";
        b.innerHTML = play;
        // b.onclick = route.animationHandler.draw.bind(route.animationHandler);
        b.onclick = () => {
            // @ts-ignore
            $(".navbar-collapse").collapse("hide");
            this.manager.playDraw();
        };

        const stop = stopText("");
        const b2 = document.createElement("button");
        b2.className = "btn btn-danger";
        b2.innerHTML = stop;
        // b2.onclick = route.animationHandler.draw.bind(route.animationHandler);
        b2.onclick = () => {
            // @ts-ignore
            $(".navbar-collapse").collapse("hide");
            this.manager.stopDraw();
        };
        const group = document.createElement("div");
        group.className = "btn-group";
        group.setAttribute("role", "group");
        group.appendChild(b2);
        group.appendChild(b);
        nb.appendChild(group);

        const ui = document.createElement("div");
        ui.classList.add(
            "position-absolute",
            "fixed-bottom",
            "m-2",
            "mb-5",
            "m-md-5",
            "p-2"
        );
        container.appendChild(ui);
        let sliderInstance: any = undefined;
        const sliderDomElement = document.createElement("div");
        ui.appendChild(sliderDomElement);

        this.createSlider = function (
            calculatedRouteData: Array<Poi>,
            route: Route,
            poi: Array<number>,
            labels: Array<string>
        ) {
            const slider = (sliderDomElement as unknown) as noUiSlider.Instance;
            $(ui).hide().fadeIn();

            if (sliderInstance) {
                sliderInstance.noUiSlider.destroy();
            }
            sliderInstance = slider;

            noUiSlider.create(
                slider,
                {
                    start: [labels.length],
                    step: 1,
                    connect: false,
                    range: {
                        min: 0,
                        max: calculatedRouteData.length - 1,
                    },
                    pips: {
                        mode: "values",
                        values: poi,
                        stepped: true,
                        density: 100,
                        format: new MyFormatter(labels),
                    },
                },
                // @ts-ignore
                true
            );
            slider.noUiSlider.on("set", function (value: any) {
                controls.moveIntoCenter(
                    calculatedRouteData[Math.floor(value)].lat,
                    calculatedRouteData[Math.floor(value)].lng,
                    500
                );
            });

            slider.noUiSlider.on("slide", function (value: any) {
                // const index =
                //     (Math.floor(value) / calculatedRouteData.length) *
                //     route.routeLine.numberVertices;
                route.setDrawIndex(value);
            });

            var pips = slider.querySelectorAll(".noUi-value");

            function clickOnPip() {
                const value = Number(this.getAttribute("data-value"));
                slider.noUiSlider.set(value);
                console.log(
                    value,
                    calculatedRouteData.length,
                    route.routeLine.numberVertices
                );
                // const index =
                //     (Math.floor(value) / calculatedRouteData.length) *
                //     route.routeLine.numberVertices;
                route.setDrawIndex(value);
                // route.setDrawCount(value.index);
                controls.moveIntoCenter(
                    // routeData.gps[Math.floor(value)].lat,
                    // routeData.gps[Math.floor(value)].lng,
                    calculatedRouteData[Math.floor(value)].lat,
                    calculatedRouteData[Math.floor(value)].lng,
                    1000
                );
            }

            for (var i = 0; i < pips.length; i++) {
                // pips[i].style.cursor = "pointer";
                pips[i].addEventListener("click", clickOnPip);
            }
        };
    }
}
