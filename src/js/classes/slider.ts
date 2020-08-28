import $ from "jquery";
import noUiSlider from "nouislider";
import "nouislider/distribute/nouislider.css";
import "../../css/nouislider.css";
import MyFormatter from "../utils/sliderFormatter";

import Controls from "./controls";
import Route from "./route";

export default class Slider {
    private sliderInstance: any = undefined;
    private sliderDomElement: HTMLElement = document.createElement("div");
    private ui: HTMLElement = document.createElement("div");

    constructor(container: HTMLElement, private controls: Controls) {
        this.ui.classList.add("fixed-bottom", "m-5");
        // ui.classList.add(
        //     "position-absolute",
        //     "fixed-bottom",
        //     "m-2",
        //     "mb-5",
        //     "m-md-5",
        //     "p-2"
        // );
        container.appendChild(this.ui);
        this.ui.appendChild(this.sliderDomElement);
    }

    public createSlider(
        calculatedRouteData: Poi[],
        route: Route,
        poi: number[],
        labels: string[]
    ) {
        const slider = (this
            .sliderDomElement as unknown) as noUiSlider.Instance;
        $(this.ui).hide().fadeIn();

        if (this.sliderInstance) {
            this.sliderInstance.noUiSlider.destroy();
        }
        this.sliderInstance = slider;

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
        slider.noUiSlider.on("set", (value: any) => {
            this.controls
                .moveIntoCenter(
                    calculatedRouteData[Math.floor(value)].lat,
                    calculatedRouteData[Math.floor(value)].lng,
                    500
                )
                .start();
        });

        slider.noUiSlider.on("slide", (value: any) => {
            route.setDrawIndex(Math.floor(value[0]));
        });

        const pips = slider.querySelectorAll(".noUi-value");
        const self = this;
        function clickOnPip() {
            const value = Number(this.getAttribute("data-value"));
            slider.noUiSlider.set(value);
            // const index =
            //     (Math.floor(value) / calculatedRouteData.length) *
            //     route.routeLine.numberVertices;
            route.setDrawIndex(value);
            // route.setDrawCount(value.index);
            self.controls
                .moveIntoCenter(
                    // routeData.gps[Math.floor(value)].lat,
                    // routeData.gps[Math.floor(value)].lng,
                    calculatedRouteData[Math.floor(value)].lat,
                    calculatedRouteData[Math.floor(value)].lng,
                    1000
                )
                .start();
        }

        pips.forEach((p) => p.addEventListener("click", clickOnPip));
    }
}
