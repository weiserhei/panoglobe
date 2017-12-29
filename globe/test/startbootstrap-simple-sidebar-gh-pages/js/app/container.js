/**
 * Create a DOM Container
 *
 */
define([], function () {

    var container = document.createElement( 'div' );
    document.body.appendChild( container );

    return container;

});