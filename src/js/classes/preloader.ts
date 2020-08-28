import { LoadingManager, TextureLoader } from "three";
import $ from "jquery";
import "./../../css/loading.css";
import "./../../css/progressbar.css";
import "./../../css/spinner.css";

function getProgressColor(progress: number): string {
    const colors = [
        [20, "#f63a0f"],
        [30, "#f27011"],
        [50, "#f2b01e"],
        [75, "#f2d31b"],
        [100, "#86e01e"],
    ];
    return String(colors.filter((x) => x[0] >= progress)[0][1]);
}

export default class Preloader {
    public manager: THREE.LoadingManager;
    public textureLoader: THREE.TextureLoader;

    private zIndex: number;
    private inline: boolean;

    constructor(container: HTMLElement) {
        this.manager = new LoadingManager();
        this.textureLoader = new TextureLoader(this.manager);
        this.zIndex = parseInt(container.style.zIndex);
        this.inline = false; // overlay style

        // const c =  document.getElementsByClassName("preloader");
        // if(c.length > 0) {
        //     const progressbar = document.getElementsByClassName("progress-bar2");
        // }

        const innerContainer = document.createElement("div");
        innerContainer.className = "preloader";
        container.appendChild(innerContainer);
        innerContainer.innerHTML = "<h1>Pano<br>Globe</h1>";

        const progressbar = document.createElement("div");
        progressbar.className = "progress-bar2";
        progressbar.style.width = "0px";

        const progressbarContainer = document.createElement("div");
        progressbarContainer.className = "progress2";
        progressbarContainer.appendChild(progressbar);
        innerContainer.appendChild(progressbarContainer);

        const textnode = document.createTextNode("Loading");
        innerContainer.appendChild(textnode);

        const loader = document.createElement("div");
        loader.id = "loader";
        innerContainer.appendChild(loader);

        const style = window.getComputedStyle(progressbarContainer);
        const padding =
            parseInt(style.paddingLeft) + parseInt(style.paddingRight);
        const barwidth =
            parseInt(
                window
                    .getComputedStyle(progressbarContainer)
                    .getPropertyValue("width")
            ) - padding;

        this.manager.onStart = () => {
            // make visible if hidden with fadeOut()
            container.style.display = "";
            if (this.inline) {
                this.modifyCSS(container, progressbarContainer);
            }
        };

        this.manager.onProgress = (item, loaded, total) => {
            const progress = (loaded / total) * 100;
            progressbar.style.backgroundColor = getProgressColor(progress);
            progressbar.style.width = (1 / (total / loaded)) * barwidth + "px";
        };

        this.manager.onLoad = () => {
            // set bar to 100% to prevent overflow
            // this.progressbar.style.width = 1 * this.barwidth + "px";
            // this.container.style.display = "none";
            // container.onclick = () => { $(container).fadeOut() };
            $(container).delay(400).fadeOut(800);
        };

        this.manager.onError = (url) => {
            console.error("Loading Error", url);
        };
    }

    modifyCSS(container: HTMLElement, progressbarContainer: HTMLElement) {
        container.style.zIndex = String(this.zIndex);
        container.style.background =
            "radial-gradient(ellipse at center, rgba(10, 10, 10, 1) 30%,rgba(0, 0, 0, 0.5) 100%)";
        // hide progress bar
        progressbarContainer.style.display = "none";
    }

    setInline(value: boolean) {
        this.inline = value;
        if (value) {
            this.zIndex = 998;
        }
    }
}
