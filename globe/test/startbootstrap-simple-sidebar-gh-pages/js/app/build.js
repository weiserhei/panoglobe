({
    baseUrl: '.',
    mainConfigFile: '../main.js',
    // export globals
        // Third party code lives in js/lib
    paths: {
        'jquery': "http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min",
        'dat': "../lib/dat.gui.min",
        'threeCore': "../lib/three/three.min",
        // 'threeCore': "../lib/three/three",
        'three': "../lib/three",
        // --- start THREE sub-components
        'OrbitObjectControls': "../lib/three/controls/OrbitControls",
        'Stats': "../lib/stats.min",
        'detector': "../lib/three/Detector",
        // --- end THREE sub-components
        'ShaderParticleEngine': "../lib/SPE.min",
        // THREEx
        'threexDomEvents': "../lib/threex.domevents",
        'threexAtmosphereMaterial': "../lib/threex.atmospherematerial",

    },
    name: "../main",
    out: "../main-built.js"
})