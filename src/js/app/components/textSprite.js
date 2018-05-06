import makeTextSprite from "../helpers/makeTextSprite";

export default class TextSprite {
    constructor( message, parameters, positionVec3 ) {

        this.sprite = makeTextSprite(message, parameters)
        this.sprite.position.copy(positionVec3);

        this.width;
        this.height;

    }

    update( ocluded, eye, showLabels, dot ) {

        this.sprite.material.visible = showLabels;

        if( showLabels ) {
            this.width = this.sprite.material.map.image.width;
            this.height = this.sprite.material.map.image.height;
            this.sprite.scale.set( this.width / 300, this.height / 300, 1 ).multiplyScalar( 1 + eye.length() / 13 );
        }

        if( ! ocluded ) {

            // spriteGroup.children[ i ].scale.set( 1, 0.5, 1 ).multiplyScalar( 1 + eye.length() / 13 ); // SCALE SIZE OF FONT WHILE ZOOMING IN AND OUT //0.1800 * exe
            // this.spriteGroup.children[ i ].material.opacity = 0.9 / ( eye.length() / 100 );
            this.sprite.material.opacity = 1;
        }
        else { 
            //HIDE EACH BLOB+LABEL IF CAMERA CANT SEE IT (I.E. WHEN IT IS BEHIND THE GLOBE)
            // this.sprite.visible = false;
            this.sprite.material.opacity = 1 + dot * 2;
            // console.log( this.sprite );
        }

    }
}