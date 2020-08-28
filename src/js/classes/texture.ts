import { TextureLoader, Texture as THREETexture } from "three";
import Config from "../../data/config";

import T1 from "../../textures/4k/fair_clouds_4k.jpg";
import T2 from "../../textures/galaxy_starfield.png";
import T3 from "../../textures/4k/2_no_clouds_4k.jpg";
import T4 from "../../textures/4k/Spec-Mask-inverted_4k.png";
import T5 from "../../textures/4k/earth_normalmap_flat_4k.jpg";
import T6 from "../../textures/4k/Bump_4k.jpg";
// import T7 from "../../textures/4k/Spec-Mask_4k.png";

// This class preloads all textures in the imageFiles array in the Config via ES6 Promises.
// Once all textures are done loading the model itself will be loaded after the Promise .then() callback.
// Using promises to preload textures prevents issues when applying textures to materials
// before the textures have loaded.
export default class Texture {
    public textures: object;
    public load: () => Promise<object>;
    constructor(manager: THREE.LoadingManager) {
        // Prop that will contain all loaded textures
        this.textures = {};

        this.load = function (): Promise<object> {
            const loader: THREE.TextureLoader = new TextureLoader(manager);
            const maxAnisotropy: number = Config.maxAnisotropy;
            const imageFiles = Config.texture.imageFiles;
            const promises: Promise<THREE.Texture>[] = [];
            const t = [T1, T2, T3, T4, T5, T6];

            // loader.setPath("");

            t.forEach((texture) => {
                // Add an individual Promise for each image in array
                promises.push(
                    new Promise((resolve, reject) => {
                        // Each Promise will attempt to load the image file
                        loader.load(
                            texture,
                            // This gets called on load with the loaded texture
                            (texture) => {
                                texture.anisotropy = maxAnisotropy;
                                // Resolve Promise with object of texture if it is instance of THREE.Texture
                                if (texture instanceof THREETexture) {
                                    resolve(texture);
                                }
                            },
                            (xhr) =>
                                reject(
                                    new Error(
                                        xhr +
                                            "An error occurred loading while loading " +
                                            texture
                                    )
                                )
                        );
                    })
                );
            });

            // Iterate through all Promises in array and return another Promise when all have resolved
            // or console log reason when any reject
            return Promise.all(promises).then(
                (textures) => {
                    // Set the textures prop object to have name be the resolved texture
                    for (let i = 0; i < imageFiles.length; i += 1) {
                        const name =
                            imageFiles[i][Object.keys(imageFiles[i])[0]];
                        this.textures[name] = textures[i];
                    }
                    return this.textures;
                },
                (reason) => console.log(reason)
            );
        };
    }
}
