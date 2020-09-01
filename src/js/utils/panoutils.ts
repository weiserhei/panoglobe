/**
 * Panoutils
 */
import { Vector3, Curve } from "three";
import calcCrow from "./calcCrow";

export const numberWithCommas = (x: number) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export const getRandomArbitrary = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
};

// Math functions from stemkoski
function greatCircleFunction(P: Vector3, Q: Vector3, angleMultiplier?: number) {
    var angle = P.angleTo(Q);
    angle += angleMultiplier || 0;

    return function (t: number) {
        var X = new Vector3()
            .addVectors(
                P.clone().multiplyScalar(Math.sin((1 - t) * angle)),
                Q.clone().multiplyScalar(Math.sin(t * angle))
            )
            .divideScalar(Math.sin(angle));
        return X;
    };
}

function convertLatLonToVec3(lat: any, lon: any) {
    lat = (lat * Math.PI) / 180.0;
    lon = (-lon * Math.PI) / 180.0;
    return new Vector3(
        Math.cos(lat) * Math.cos(lon), // rechts links invert
        Math.sin(lat), // up down invert
        Math.cos(lat) * Math.sin(lon)
    );
}

function getHeight(
    heightData: Array<Array<number>>,
    lat: string,
    lng: string
): number {
    let latHeight = Math.floor(
        (Number(lat) * (heightData.length / 180) - heightData.length / 2) * -1
    );
    const lngHeight =
        Math.floor(Number(lng) * (heightData[0].length / 360)) +
        heightData[0].length / 2;

    if (latHeight > heightData.length - 1) {
        latHeight = heightData.length;
    }

    return heightData[latHeight][lngHeight];
}

/**
 * get Height Data
 * from Image
 */
function array2D(x: number, y: number): Array<Array<number>> {
    const array = new Array(x);
    for (let i = 0; i < array.length; i += 1) {
        array[i] = new Array(y);
    }
    return array;
}

export const getHeightData = (img: CanvasImageSource, scale: number) => {
    if (scale === undefined) scale = 10;

    const canvas = document.createElement("canvas");
    canvas.width = Number(img.width);
    canvas.height = Number(img.height);

    const context = canvas.getContext("2d");
    if (context === null) return;
    context.drawImage(img, 0, 0);

    // var data = new Float32Array( size );
    const data = array2D(Number(img.height), Number(img.width));
    const imgd = context.getImageData(
        0,
        0,
        Number(img.width),
        Number(img.height)
    );
    const pix = imgd.data;
    let j = 0;
    let a = 0;

    for (let i = 0, n = pix.length; i < n; i += 4) {
        let all = pix[i] + pix[i + 1] + pix[i + 2];
        if (j === img.width) {
            j = 0;
            a += 1;
        }

        data[a][j++] = all / (12 * scale);
    }

    return data;
};

export const createSphereArc = (P: Vector3, Q: Vector3) => {
    var sphereArc = new Curve();
    sphereArc.getPoint = greatCircleFunction(P, Q);
    return sphereArc;
};

export const calc3DPositions = (
    data: Coordinate[],
    heightData: Array<Array<number>>,
    radius: number
): Poi[] => {
    // calculate Position + displaced Position in 3D Space
    let distance = 0;

    data.forEach((coordinate, index) => {
        // distanz zum vorgänger berechnen
        if (index > 0) distance += calcCrow(coordinate, data[index - 1]);

        (coordinate as Poi).hopDistance = distance;

        // ADD 3D POSITION TO EVERY COORDINATE
        (coordinate as Poi).pos = convertLatLonToVec3(
            coordinate.lat,
            coordinate.lng
        ).multiplyScalar(radius);

        if (heightData.length > 0) {
            // LOOKUP TOPOLOGIC HEIGHT IN HEIGHTDATA ARRAY
            const displaceHeight = getHeight(
                heightData,
                coordinate.lat,
                coordinate.lng
            );

            (coordinate as Poi).displaceHeight = displaceHeight;
            (coordinate as Poi).displacedPos = convertLatLonToVec3(
                coordinate.lat,
                coordinate.lng
            ).multiplyScalar(radius + 0.4 + displaceHeight);
        } else {
            (coordinate as Poi).displacedPos = (coordinate as Poi).pos;
        }
    });

    return (data as unknown) as Poi[];
};

const Panoutils = {
    numberWithCommas,
    getRandomArbitrary,
    getHeightData,
    calc3DPositions,
    createSphereArc,
};

export default Panoutils;
