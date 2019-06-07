import "./../css/style.css";
import init from "./init";

import { WEBGL } from './utils/WebGL'; // because <three/examples/js/WebGL.js> is not a module

if ( WEBGL.isWebGLAvailable() ) {
    // preload, then init
    init();
} else {
    var warning = WEBGL.getWebGLErrorMessage();
    document.body.appendChild( warning );
}

