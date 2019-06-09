/**
 * from http://stemkoski.blogspot.fr/2013/07/shaders-in-threejs-glow-and-halo.html
 * @return {[type]} [description]
 */
import { ShaderMaterial, FrontSide, AdditiveBlending } from "three";

export default class AtmosphereMaterial {
    constructor( color ) {

        var vertexShader	= [
            'varying vec3 vNormal;',
            'void main(){',
            '	// compute intensity',
            '	vNormal		= normalize( normalMatrix * normal );',
            '	// set gl_Position',
            '	gl_Position	= projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}',
        ].join('\n')
        var fragmentShader	= [
            'uniform float coeficient;',
            'uniform float power;',
            'uniform vec3  glowColor;',

            'varying vec3  vNormal;',

            'void main(){',
            '	float intensity	= pow( coeficient - dot(vNormal, vec3(0.0, 0.0, 1.0)), power );',
            '	gl_FragColor	= vec4( glowColor * intensity, 1.0 );',
            '}',
        ].join('\n')

        // create custom material from the shader code above
        //   that is within specially labeled script tags
        return new ShaderMaterial({
            uniforms: { 
                coeficient	: {
                    type	: "f", 
                    value	: 1.0
                },
                power		: {
                    type	: "f",
                    value	: 2.0
                },
                glowColor	: {
                    type	: "c",
                    value	: color
                },
            },
            vertexShader	: vertexShader,
            fragmentShader	: fragmentShader,
            side		: FrontSide,
            blending	: AdditiveBlending,
            transparent	: true,
            depthWrite	: false,
        });
    
    }
}