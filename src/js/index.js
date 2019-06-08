import "./../css/style.css";

import init from "./init";
import Preloader from "Classes/preloader";
import { WEBGL } from './utils/WebGL'; // because <three/examples/js/WebGL.js> is not a module
import { ImageLoader } from "three";

// https://stackoverflow.com/questions/52376720/how-to-make-font-awesome-5-work-with-webpack
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'


if ( WEBGL.isWebGLAvailable() ) {
    // preload, then init

    const loadContainer = document.createElement("div");
    loadContainer.id = "loadcontainer";
    document.body.appendChild(loadContainer);
    var preloader = new Preloader(loadContainer);

    // Preload Demo
    var imageLoader = new ImageLoader (preloader.manager);
    const imageUrl = "./textures/heightmap_1440.jpg";
    const loadHeightData = url => new Promise(resolve => imageLoader.load(url, resolve));
    loadHeightData(imageUrl).then((heightImage) => {
        // asien
        const url = "https://relaunch.panoreisen.de/index.php?article_id=7&rex_geo_func=datalist";
        // amerika
        const url2 = "https://relaunch.panoreisen.de/index.php?article_id=165&rex_geo_func=datalist";

        init(preloader);

    });
    // .catch(() => {console.warn("Error loading height data image")});


} else {
    var warning = WEBGL.getWebGLErrorMessage();
    document.body.appendChild( warning );
}

