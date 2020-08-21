import $ from "jquery";

import noUiSlider from "nouislider";
import "nouislider/distribute/nouislider.css";
import "../../css/nouislider.css";
import MyFormatter from "../utils/sliderFormatter";
import Controls from "./controls";
import RouteLine from "./routeLine";

export default class UserInterface {
    public createSlider: (
        calculatedRouteData: Array<Poi>,
        routeLine: RouteLine,
        poi: Array<number>,
        adresses: Array<string>
    ) => void;
    constructor(private container: HTMLElement, private controls: Controls) {
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
            routeLine: RouteLine,
            poi: Array<number>,
            adresses: Array<string>
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
                    start: [adresses.length],
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
                        format: new MyFormatter(adresses),
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
                routeLine.setDrawIndex(value);
            });

            var pips = slider.querySelectorAll(".noUi-value");

            function clickOnPip() {
                const value = Number(this.getAttribute("data-value"));
                slider.noUiSlider.set(value);
                routeLine.setDrawIndex(value);
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
