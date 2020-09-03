
import Route from "../components/route";

export default class RouteManager {
    constructor( scene, container, domEvents, heightData, globusradius, controls, sidebar ) {
        this.routes = [];

        this.scene = scene;
        this.container = container;
        this.domEvents = domEvents;
        this.heightData = heightData;
        this.globusradius = globusradius;
        this.controls = controls;
        this.sidebar = sidebar;
        // this.particles = particles;
        // this.audios = audios;

        this._activeMarker = null;
    }

    buildRoute( routeData, phase ) {

        const route = new Route( this.scene, this.container, this.domEvents, routeData, this.heightData, this.globusradius, phase, this.controls);
        route.manager = this;
        this.sidebar.addRoute( route );
        this.routes.push( route );

        // Onload other route disable last active marker
        if(this._activeMarker !== null ) {
            this._activeMarker.active = false;
        }

        // const lat = 48.78232, lng = 9.17702; // stgt
        // const lat = 19.432608, lng = -99.133209; // mexico
        // select last Marker on first route, and first marker on following routes
        const index = this.routes.length > 1 ? 0 : route.pois.length-1;
        const marker = route.pois[ index ];
        this.controls.moveIntoCenter( marker.lat, marker.lng, 2000);

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