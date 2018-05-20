import * as THREE from "three";
import * as spe from "../../../../node_modules/shader-particle-engine/build/SPE";

export default class Particles {

    constructor( scene ) {
        
        let SPE = spe.default(THREE);

        var loader = new THREE.TextureLoader();

        // Impact Puffs
        // this._velocityMagnitude = 0.3;
        this._velocityMagnitude = 10;
        var velocitySpread = new THREE.Vector3( 0.2, 0, 0.2 );
        // var texture = loader.load("assets/textures/fx_smoke.png");
        // var texture = loader.load("assets/textures/star.png");
        var texture = loader.load("assets/textures/snowflake5.png");
        // var texture = loader.load("assets/textures/smokeparticle.png");

        var particleGroup = new SPE.Group({
            texture: {
                value: texture
            },
            // blending: THREE.NormalBlending,
            
            blending: THREE.AdditiveBlending,
            hasPerspective: 1,
            colorize: 1,
            transparent: 1,
            alphaTest: 0.5,
            depthWrite: false,
            depthTest: true,

            maxParticleCount: 2000
        });

        var emitter = new SPE.Emitter({

            type: SPE.distributions.SPHERE,
            position: {
                spread: new THREE.Vector3(10),
                radius: 1,
            },
            velocity: {
                value: new THREE.Vector3( 10 )
            },
            size: {
                value: [ 10, 0 ]
            },
            opacity: {
                value: [1, 0]
            },
            color: {
                value: [new THREE.Color('white'), new THREE.Color('white')]
            },
            particleCount: 100,
            alive: true,
            duration: 0.1,
            maxAge: {
                value: 0.7
            }

            /* SMOKE */
            /*

            type: SPE.distributions.CUBE,
            // activeMultiplier: 4,
            // direction: -1,
            duration: 0.02,
            maxAge: {
                value: 1
            },
            position: {
                // radius: 0.01, // attributes..emitters[0].position._radius
                value: new THREE.Vector3( 0, 0, 0 ),
                spread: new THREE.Vector3( 0.05, 0.05, 0.05 ),
                // distribution: SPE.distributions.BOX
                // spread: new THREE.Vector3( 0.8, 0.8, 0.8 ),
                // clamp: 0.2,
                // randomise: true
            },

            size: {
                value: [ 10, 30, 50 ],
                // spread: [ 0, 0, 0 ]
            },

            velocity: {
                value: new THREE.Vector3( 0, this._velocityMagnitude, 0 ),
                spread: velocitySpread,
                // distribution: SPE.distributions.DISC
                // distribution: SPE.distributions.BOX
                // distribution: SPE.distributions.SPHERE
            },

            acceleration: {
                value: new THREE.Vector3( 0, -0.1, 0 ),
                // distribution: SPE.distributions.SPHERE
                // distribution: SPE.distributions.BOX
            },

            // drag: {
            //     value: 0.3
            // },

            color: {
                // value: [ new THREE.Color( 0xc8bb93 ), new THREE.Color( 0xffffff ) ],
                value: [ new THREE.Color( 0xc8bb93 ), new THREE.Color( 0xc8bb93 ) ],
                // spread: [ new THREE.Vector3( 0, 5, 0 ), new THREE.Vector3(0, 10, 0) ]
            },

            opacity: {
                // value: [ 1, 1, 1 ],
                value: [ 0.1, 0.05, 0.0 ],
                spread: [ 0.10556, 0.05, 0 ]
            },

            particleCount: 50

            */

        });

        // particleGroup.addEmitter( emitter );
        particleGroup.addPool( 20, emitter, true);

        // culling off = meh
        // https://github.com/squarefeet/ShaderParticleEngine/issues/51
        particleGroup.mesh.frustumCulled = false;
        // var sphere = particleGroup.mesh.geometry.boundingSphere = new THREE.Sphere();
        // sphere.radius = 8; //the joy of treakable parameter!
        // particleGroup.mesh.add( sphere );

        scene.add( particleGroup.mesh );

        this.particleGroup = particleGroup;

    }

    setNormal( normal ) {

        // set the hit object normal as velocity
        // for every emitter (ideally not the active one, but whatevs)

        var v = this._velocityMagnitude;
        // this is setting velocity for all emitters in the pool
        // this.emitters[0].velocity.set( x * v, y * v, z * v );
        // console.log( this.emitters[0] );

        for ( var i = 0; i < this.particleGroup.emitters.length; i ++ ) {
            this.particleGroup.emitters[ i ].velocity.value = new THREE.Vector3( normal.x * v, normal.y * v, normal.z * v );
            // particleGroup.emitters[ i ].size.value = [ 0.3, 0.3, 0.1 ];
            // particleGroup.emitters[ i ].position.value = new THREE.Vector3( 0, 0.5, 0 );
            // particleGroup.emitters[ i ].position.spread = new THREE.Vector3( 0.2, 0.2, 0.1 );
            // particleGroup.emitters[ i ].acceleration.value = new THREE.Vector3( 10, 10, 2 );
        }

    }

    setColor( col1, col2 ) {
        for ( var i = 0; i < this.particleGroup.emitters.length; i ++ ) {
            this.particleGroup.emitters[ i ].color.value = [col1, col2];
            // particleGroup.emitters[ i ].size.value = [ 0.3, 0.3, 0.1 ];
            // particleGroup.emitters[ i ].position.value = new THREE.Vector3( 0, 0.5, 0 );
            // particleGroup.emitters[ i ].position.spread = new THREE.Vector3( 0.2, 0.2, 0.1 );
            // particleGroup.emitters[ i ].acceleration.value = new THREE.Vector3( 10, 10, 2 );
        }
    }

    triggerPoolEmitter( value ) {
        this.particleGroup.triggerPoolEmitter( value );
    }

    update( delta ) {
        this.particleGroup.tick( delta );
    }

}