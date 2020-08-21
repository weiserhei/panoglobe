/**
 * from https://codepen.io/prisoner849/pen/ErwYqM
 * https://discourse.threejs.org/t/impact-shock-wave/5988/9
 */
import { Vector3, MeshPhongMaterial } from "three";
import Config from "../../data/config";
import TWEEN from "@tweenjs/tween.js";
import Globus from "./globus";
import Route from "./route";

export default class Impacts {
    constructor(globus: Globus, route: Route) {
        // console.log(route);
        // route.marker
        const maxImpactAmount = route.marker.length;
        let materialShader: THREE.Shader = undefined;
        let impactSize = 0.05;
        // init uniforms impacts array
        const impacts: Array<object> = [];
        for (let i = 0; i < maxImpactAmount; i += 1) {
            impacts.push({
                impactPosition: new Vector3().copy(
                    route.marker[i].mesh.position
                ),
                color: route.marker[i].color,
                // impactPosition: new Vector3().setFromSphericalCoords(
                //   Config.globus.radius,
                //   Math.PI * Math.random(),
                //   Math.PI * 2 * Math.random()
                // ),
                // impactMaxRadius: Config.globus.radius * THREEMath.randFloat(0.5, 0.75),
                impactMaxRadius: Config.globus.radius * impactSize,
                impactRatio: 0.1,
            });
        }
        // console.log(impacts);

        (globus.mesh.material as MeshPhongMaterial).onBeforeCompile = (
            shader
        ) => {
            shader.uniforms.impacts = { value: impacts };
            shader.vertexShader =
                "varying vec3 vPosition;\n" + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                "#include <worldpos_vertex>",
                `#include <worldpos_vertex>
        vPosition = transformed.xyz;`
            );
            shader.fragmentShader =
                `struct impact {
            vec3 impactPosition;
            float impactMaxRadius;
            float impactRatio;
            vec3 color;
          };
         uniform impact impacts[${maxImpactAmount}];
         varying vec3 vPosition;
        ` + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <dithering_fragment>",
                `#include <dithering_fragment>
          float finalStep = 0.0;

          for (int i = 0; i < ${maxImpactAmount};i++){
            
            float dist = distance(vPosition, impacts[i].impactPosition);
            float curRadius = impacts[i].impactMaxRadius * impacts[i].impactRatio;
            float sstep = smoothstep(0., curRadius, dist) - smoothstep(curRadius - ( 0.25 * impacts[i].impactRatio ), curRadius, dist);
            sstep *= 1. - impacts[i].impactRatio;
            finalStep += sstep;
            
          }
          finalStep = 1. - clamp(finalStep, 0., 1.);
          
          vec3 col = mix(impacts[0].color, impacts[${maxImpactAmount}-1].color, finalStep);
          // vec3 col = mix(vec3(1., 0.5, 0.0625), vec3(1.,0.125, 0.0625), finalStep);
          gl_FragColor = vec4( mix( col, gl_FragColor.rgb, finalStep), diffuseColor.a );`
            );
            materialShader = shader;
        };

        (globus.mesh.material as MeshPhongMaterial).needsUpdate = true;

        var tweens: Array<object> = [];

        for (let i = 0; i < maxImpactAmount; i++) {
            tweens.push({
                runTween: function () {
                    var tween = new TWEEN.Tween({ value: 0 })
                        // .to({ value: 1 }, THREEMath.randInt(2500, 5000))
                        // second value = duration of wave in ms
                        .to({ value: 1 }, 5000)
                        //.delay(THREE.Math.randInt(500, 2000))
                        .onUpdate((val) => {
                            if (materialShader)
                                materialShader.uniforms.impacts.value[
                                    i
                                ].impactRatio = val.value;
                        })
                        .onComplete((val) => {
                            if (materialShader) {
                                materialShader.uniforms.impacts.value[
                                    i
                                ].color.copy(route.marker[i].color),
                                    materialShader.uniforms.impacts.value[
                                        i
                                    ].impactPosition.copy(
                                        route.marker[i].mesh.position
                                    ),
                                    // setFromSphericalCoords(
                                    //   Config.globus.radius,
                                    //   Math.PI * Math.random(),
                                    //   Math.PI * 2 * Math.random()
                                    // );
                                    // materialShader.uniforms.impacts.value[i].impactMaxRadius = Config.globus.radius * THREEMath.randFloat(0.1, 0.15);
                                    (materialShader.uniforms.impacts.value[
                                        i
                                    ].impactMaxRadius =
                                        Config.globus.radius * impactSize);
                            }
                            // @ts-ignore
                            tweens[i].runTween();
                        });
                    // @ts-ignore
                    tween.start();
                },
            });
        }

        tweens.forEach((t) => {
            // @ts-ignore
            t.runTween();
        });

        return;
    }
}
