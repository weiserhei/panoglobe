// Definitions to let TS understand files
declare module "*.jpg" {
    const value: string;
    export default value;
}
declare module "*.png" {
    const value: string;
    export default value;
}

// declare module "*.geojson" {
//     const value: any;
//     export default value;
// }

declare module "*.geojson" {
    export const type: string;
    export const crs: object;
    export const features: Array<Object>;
}
