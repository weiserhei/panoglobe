/**
 * Snow Particles
 */

define(["three","ShaderParticleEngine"], function (THREE, SPE) {

	var particles = function() {

		var textureLoader = new THREE.TextureLoader();
		var url = 'textures/spe/snowflake.png'
		var T_snowflake = textureLoader.load( url );

	    var particleGroup = new SPE.Group({
			texture: {
	            value: T_snowflake
	        },
			// fog: true
		});

		/* Stemkoski Particle Engine Preset */
		/*
		snow :
		{
		positionStyle    : Type.CUBE,
		positionBase     : new THREE.Vector3( 0, 200, 0 ),
		positionSpread   : new THREE.Vector3( 500, 0, 500 ),

		velocityStyle    : Type.CUBE,
		velocityBase     : new THREE.Vector3( 0, -60, 0 ),
		velocitySpread   : new THREE.Vector3( 50, 20, 50 ), 
		accelerationBase : new THREE.Vector3( 0, -10,0 ),

		angleBase               : 0,
		angleSpread             : 720,
		angleVelocityBase       :  0,
		angleVelocitySpread     : 60,

		particleTexture : THREE.ImageUtils.loadTexture( 'images/snowflake.png' ),
			
		sizeTween    : new Tween( [0, 0.25], [1, 10] ),
		colorBase   : new THREE.Vector3(0.66, 1.0, 0.9), // H,S,L
		opacityTween : new Tween( [2, 3], [0.8, 0] ),

		particlesPerSecond : 200,
		particleDeathAge   : 4.0,		
		emitterDeathAge    : 60
		}
		*/
		var emitter = new SPE.Emitter({
			type: SPE.distributions.SPHERE,
			// type: SPE.distributions.DISC,
	        maxAge: {
	            value: 12
	        },
			position: {
	            value: new THREE.Vector3(0, 100, 0),
	            spread: new THREE.Vector3( 200, 0, 200 )
	        },
			
			rotation: {
				//axis: new THREE.Vector3( 0, 1, 0 ),
				//spread: new THREE.Vector3( 0, 720, 0 ),
				//angle: 100 * Math.PI / 180,
			},

			acceleration: {
	            value: new THREE.Vector3(0, -0.5, 0),
	            //spread: new THREE.Vector3( 0, -10, 0 )
	        },

			velocity: {
	            value: new THREE.Vector3(0, -10, 0),
	            spread: new THREE.Vector3(4, -1, 2),
	            distribution: SPE.distributions.BOX
	            // distribution: SPE.distributions.SPHERE
	        },

	        color: {
	            value: [ new THREE.Color( 0xCCCCFF ) ]
	        },
			
			opacity: {
				value: [ 1, 0.8 ]
			},

			size: {
				value: [ 5, 10 ],
				spread: [ 2, 5 ]
			},
			// activeMultiplier: 0.5,
			particleCount: 1000
		});

		particleGroup.addEmitter( emitter );
		return particleGroup;
		// scene.add( this.particleGroup.mesh );
		// particleGroup.tick( 16 );
		
		// Workaround for frustum culling
		// https://github.com/squarefeet/ShaderParticleEngine/issues/51#issuecomment-61577200
		// var radius = 15; //the joy of treakable parameter!

		// particleGroup.mesh.geometry.computeBoundingSphere();
		// particleGroup.mesh.geometry.boundingSphere.radius = radius;

		// var helper = new THREE.Mesh( new THREE.SphereBufferGeometry( radius ), new THREE.MeshBasicMaterial ( { wireframe: true } ) );
		// scene.add( helper );
	};
	
	return particles;
		
});