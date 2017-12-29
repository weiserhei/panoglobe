function Balloon( html ) {
    THREE.Object3D.call( this );
    
    this.popup = document.createElement( 'div' );
    this.popup.classList.add( 'balloon' );
    this.popup.innerHTML = html;
    
    this.addEventListener( 'added', (function () {
        container.appendChild( this.popup );
    }).bind( this ));
    
    this.addEventListener( 'removed', (function () {
        container,removeChild( this.popup );
    }).bind( this ));
}

Balloon.prototype = Object.create( THREE.Object3D.prototype );
Balloon.prototype.constructor = Balloon;

Balloon.prototype.updateMatrixWorld = (function () {
    var screenVector = new THREE.Vector3 ();
    var raycaster = new THREE.Raycaster ();

    return function( force ) {
        THREE.Object3D.prototype.updateMatrixWorld.call( this, force );

        screenVector.set( 0, 0, 0 ); this.localToWorld( screenVector );
        
        raycaster.ray.direction.copy( screenVector );

        raycaster.ray.origin.set( 0, 0, 0 ); camera.localToWorld( raycaster.ray.origin );
        raycaster.ray.direction.sub( raycaster.ray.origin );
        
        var distance = raycaster.ray.direction.length();
        raycaster.ray.direction.normalize();
        
        var intersections = raycaster.intersectObject( scene, true );
        // if( intersections.length && ( intersections[0].distance < distance )) {
            
            // overlay anchor is obscured
            // this.popup.style.display = 'none';
            
        // } else {
            
            // overlay anchor is visible
            screenVector.project( camera );
            
            this.popup.style.display = '';
            this.popup.style.left = Math.round((screenVector.x + 1) * container.offsetWidth / 2 - 50) + 'px';
            this.popup.style.top = Math.round((1 - screenVector.y) * container.offsetHeight / 2 - 50) + 'px';
        // }
    };
}) ();
