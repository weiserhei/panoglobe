
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

        this._activeMarker = null;
    }

    buildRoute( routeData, phase ) {

        const route = new Route( this.scene, this.container, this.domEvents, routeData, this.heightData, this.globusradius, phase, this.controls, this.particles, this.audios );
        route.manager = this;
        this.sidebar.addRoute( route );
        this.routes.push( route );

        return route;
    }

    get activeMarker() {
        return this._activeMarker;
    }

    set activeMarker( value ) {
        // when a marker is trying to get active
        // while the manager knows of an active one
        // disable it first
        if( value !== null && this._activeMarker !== null ) {
            // console.log("Deactivating active marker from "+this._activeMarker._activeHandler.name);
            this._activeMarker.active = false;
        }

        this._activeMarker = value;

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
        this.routes.forEach((route) => { route.update(delta, camera); });
    }
}