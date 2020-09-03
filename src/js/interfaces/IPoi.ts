interface Poi extends Coordinate {
    displacedPos: THREE.Vector3;
    pos: THREE.Vector3;
    countryname?: string;
    displaceHeight: number;
    hopDistance: number;
    segments: number;
    label: string;
    description: string;
}

// routeData:
// [
//   {
//     adresse: ""
//     displaceHeight: 0.1625
//     displacedPos: { x: 31.803753986570744, y: 70.76274777054891, z: 64.14120100663348 }
//     externerlink:"http:\/\/panoreisen.de\/156-0-Iran.html",
//     hopDistance: 5255.320865441695
//     lat: "44.665800"
//     lng: "-63.625960"
//     pos: { x: 31.59444081616366, y: 70.29702994714904, z: 63.719062219429766 }
//   },
// ]
