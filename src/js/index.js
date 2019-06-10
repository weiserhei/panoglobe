import "./../css/style.css";

import init from "./init";
import { ImageLoader } from "three";
import Preloader from "Classes/preloader";
import { WEBGL } from './utils/WebGL'; // because <three/examples/js/WebGL.js> is not a module
import { getHeightData } from "./utils/panoutils";

// https://stackoverflow.com/questions/52376720/how-to-make-font-awesome-5-work-with-webpack
// import '@fortawesome/fontawesome-free/js/fontawesome'
// import '@fortawesome/fontawesome-free/js/solid'
// import '@fortawesome/fontawesome-free/js/regular'

// import { library, dom, config } from '@fortawesome/fontawesome-svg-core'
// import { fas } from '@fortawesome/free-solid-svg-icons'
// import { far } from '@fortawesome/free-regular-svg-icons'
// config.autoReplaceSvg = false;
// library.add(fas, far) 
// dom.watch();

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
        const scale = 20;
        const heightData = getHeightData( heightImage, scale );

        init(preloader, heightData);

    })
    .catch(() => {console.warn("Error loading height data image")});


} else {
    var warning = WEBGL.getWebGLErrorMessage();
    document.body.appendChild( warning );
}

