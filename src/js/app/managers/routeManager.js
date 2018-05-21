
import Route from "../components/route";

export default class RouteManager {
    constructor( scene, container, domEvents, heightData, globusradius, controls, sidebar, particles, audios ) {
        this.routes = [];

        this.scene = scene;
        this.container = container;
        this.domEvents = domEvents;
        this.heightData = heightData;
        this.globusradius = globusradius;
        this.controls = controls;
        this.sidebar = sidebar;
        this.particles = particles;
        this.audios = audios;
    }

    buildRoute( routeData, phase ) {

        const route = new Route( this.scene, this.container, this.domEvents, routeData, this.heightData, this.globusradius, phase, this.controls, this.particles, this.audios );
        this.sidebar.addRoute( route );
        this.routes.push( route );

        return route;
    }

    static load ( url, callback ) {

		// load datalist
		if ( url ) {
			$.getJSON( url, {
				format: "json"
			})
			.done(data => {
                console.log( "Route has been loaded", data );
                callback( data );
			})
			.fail(function() {
				alert( "Sorry! An Error occured while loading the route :(" );
			});
			// .always(function() {
			// 	alert( "complete" );
			// });
		}
		else {
			//IF NO JSON OBJECT GIVEN
			alert("Call to loadRoute without providing a Link to a datalist");
		}
	
	}

    update( delta, camera )  {
        for( let i = 0; i < this.routes.length; i++ ) {
            if( this.routes[i] instanceof Route) {
              this.routes[i].update(delta, camera);
            }
          }
    }
}