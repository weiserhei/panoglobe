import $ from "jquery";
import "bootstrap";
import { icon, Icon } from "@fortawesome/fontawesome-svg-core";
import {
    faPlayCircle,
    faStopCircle,
    faStop,
    faPlay,
} from "@fortawesome/free-solid-svg-icons";
import Vue from "vue";

import App from "./../App.vue";
import ListCheckbox from "./../Checkbox.vue";

import Slider from "./slider";
import Controls from "./controls";
import Route from "./route";

import RouteManager from "./routeManager";
import Logo from "../../img/butze_auf_amerikakugel_740x740.png";

// todo
// hide slider in bottom
// only show a hint to bring it up

Vue.config.productionTip = false;
Vue.config.devtools = false;

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
    private routeSelect: HTMLSelectElement;
    private slider: Slider;
    private app: Vue;

    constructor(
        container: HTMLElement,
        controls: Controls,
        private manager: RouteManager
    ) {
        this.slider = new Slider(container, controls);

        this.routeSelect = document.createElement("select");
        this.routeSelect.className = "custom-select";
        this.routeSelect.id = "inputGroupSelect01";

        const nav = document.createElement("nav");
        // container.appendChild(nav);
        document.body.prepend(nav);
        // nav.style.zIndex = "900";

        const template = `
        <div class="navbar navbar-expand-xl shadow-sm"
            v-bind:class="{
                'navbar-dark bg-pro-sidebar text-light': nightmode,
                'navbar-light bg-light': !nightmode,
            }"
        >
            <div class="d-flex flex-nowrap flex-md-grow-0 flex-grow-1">
                <a class="navbar-brand" href="#"
                    ><img
                        class="img-fluid"
                        src="${Logo}"
                        style="height: 30px"
                /></a>
    
                <div class="form-inline mr-2">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <label class="input-group-text" for="inputGroupSelect01"
                                >Route</label
                            >
                        </div>
                        ${this.routeSelect.outerHTML}
                    </div>
                </div>
    
                <button
                    class="navbar-toggler ml-auto"
                    type="button"
                    data-toggle="collapse"
                    data-target="#navbarsExample04"
                    aria-controls="navbarsExample04"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span class="navbar-toggler-icon"></span>
                </button>
            </div>
    
            <div class="collapse navbar-collapse" id="navbarsExample04">
                <ul id="navbar" class="navbar-nav mr-auto mt-2 mt-md-0">
                    <li class="nav-item d-flex align-items-center">
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-primary" 
                                v-on:click="stop" 
                                v-bind:class="{ 'btn-danger': isPlaying }">${stopText(
                                    ""
                                )}</button>
                            <button 
                                class="btn btn-primary" 
                                v-on:click="play">${playText(
                                    "Draw route"
                                )}</button>
                        </div>
                    </li>
                    <ListCheckbox v-model="labelVisible" label="Labels"/>
                    <ListCheckbox v-model="cloudsVisible" label="Clouds"/>
                    <ListCheckbox v-model="bordersVisible" label="Borders"/>
                    <ListCheckbox v-model="nightmode" label="Nightmode"/>
                </ul>
            </div>
        </div>`;

        const self = this;
        this.app = new Vue({
            el: nav,
            // template: "<App/>",
            template: template,
            components: { App, ListCheckbox },
            data: {
                labelVisible: true,
                bordersVisible: true,
                cloudsVisible: true,
                nightmode: false,
                isPlaying: false,
            },
            watch: {
                nightmode: function (v) {
                    self.manager.toggleNight = this.nightmode;
                },
                labelVisible: function () {
                    self.manager.activeRoute.showLabels = this.labelVisible;
                },
                bordersVisible: function () {
                    self.manager.toggleBorders = this.bordersVisible;
                },
                cloudsVisible: function () {
                    self.manager.toggleClouds = this.cloudsVisible;
                },
            },
            methods: {
                play: function () {
                    setTimeout(function () {
                        // @ts-ignore
                        $(".navbar-collapse").collapse("hide");
                    }, 900);
                    if (self.manager.playDraw()) {
                        this.isPlaying = true;
                    }
                },
                stop: function () {
                    setTimeout(() => {
                        // @ts-ignore
                        $(".navbar-collapse").collapse("hide");
                    }, 900);
                    if (self.manager.stopDraw()) {
                        this.isPlaying = false;
                    }
                },
            },
        });
    }

    public stopPlaying() {
        this.app.$data.isPlaying = false;
    }

    public addRoute(route: Route) {
        const select: any = document.querySelector(`#${this.routeSelect.id}`);
        // const select = $(this.routeSelect)[0];
        select.options[select.options.length] = new Option(route.name);
        select.onchange = (x: any) => {
            this.manager.activeRoute = this.manager.routes[
                x.target.selectedIndex
            ];
            // this.app.$data.labelVisible = route.showLabels;
            // kind-of-meh
            this.app.$data.labelVisible = true;
            this.app.$data.isPlaying = false;
        };
    }

    public createSlider(calculatedRouteData: Poi[], route: Route) {
        const poi: number[] = [];
        const labels: string[] = [];
        route.routeData.forEach(function (e: Poi, index: number) {
            if (e.label) {
                poi.push(index);
                labels.push(e.label);
            } else {
                labels.push("");
            }
        });
        this.slider.createSlider(calculatedRouteData, route, poi, labels);
    }
}
