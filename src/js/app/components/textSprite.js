import makeTextSprite from "../helpers/makeTextSprite";

export default class TextSprite {
    constructor( message, parameters, Vec3 ) {

        this.sprite = makeTextSprite(message, parameters)
        this.sprite.position.copy(Vec3);

        this.sprite.onBeforeRender = function( renderer, scene, camera, geometry, material, group ) {

            // your code here
            // this.position.add( this.velocity );
        
        };

        this.width;
        this.height;

    }

    update( ocluded, eye, showLabels ) {

        if( ! ocluded ) {

            this.sprite.visible = showLabels;
            // spriteGroup.children[ i ].scale.set( 1, 0.5, 1 ).multiplyScalar( 1 + eye.length() / 13 ); // SCALE SIZE OF FONT WHILE ZOOMING IN AND OUT //0.1800 * exe
            
            this.width = this.sprite.material.map.image.width;
            this.height = this.sprite.material.map.image.height;
            this.sprite.scale.set( this.width / 300, this.height / 300, 1 ).multiplyScalar( 1 + eye.length() / 13 );
            // this.spriteGroup.children[ i ].material.opacity = 0.9 / ( eye.length() / 100 );
        }
        else { 
            //HIDE EACH BLOB+LABEL IF CAMERA CANT SEE IT (I.E. WHEN IT IS BEHIND THE GLOBE)
            this.sprite.visible = false;
        }

    }
}