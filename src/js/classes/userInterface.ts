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
        classes: ["mx-2", "text-danger"],
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
        let opt = new Option(route.name, route.name);
        // this.optionselect.add(opt, null);

        const select: any = document.querySelector(`#${this.optionselect.id}`);
        select.options[select.options.length] = new Option(route.name);
        select.onchange = function (x: any) {
            // todo set current route as context
            console.log(x.target.selectedIndex);
        };
    }

    private optionselect: HTMLSelectElement;

    constructor(private container: HTMLElement, private controls: Controls) {
        this.optionselect = document.createElement("select");
        this.optionselect.className = "custom-select";
        this.optionselect.id = "inputGroupSelect01";

        const play = playText("Spawn");
        const link = `<button class="btn btn-dark">${play}</button>`;
        const navItems = [link];

        const nav = document.createElement("nav");
        container.appendChild(nav);
        nav.style.zIndex = "10";
        nav.className =
            "navbar navbar-expand-md navbar-light bg-light position-absolute fixed-top d-flex";

        // <div class="row no-gutters align-items-center justify-content-between d-flex">
        nav.innerHTML = `
            <div class="flex-shrink-1">
                <a class="navbar-brand" href="#"><img class="img-fluid" src="${Logo}" style="height:30px"></a>
            </div>

            <div class="">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <label class="input-group-text" for="inputGroupSelect01">Route</label>
                    </div>
                    ${this.optionselect.outerHTML}
                </div>
            </div>

            <div class="">
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExample04" aria-controls="navbarsExample04" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
                </button>
            </div>
        </div>
      
        <div class="collapse navbar-collapse" id="navbarsExample04">
          <ul class="navbar-nav mr-auto mt-2 mt-md-0 ml-md-4">

            ${navItems}
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
          </ul>
          `;
        //   </div>

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
