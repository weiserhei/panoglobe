
import Route from './route';
import $ from 'jquery';

export default class RouteManager {
  constructor(scene, container, heightData, globusradius, controls) {
    this.routes = [];

    this.scene = scene;
    this.container = container;
    this.heightData = heightData;
    this.globusradius = globusradius;
    this.controls = controls;
    // this.particles = particles;
    // this.audios = audios;
    this.activeMarker = null;
  }

  buildRoute(routeData, phase) {
    const route = new Route(
      this.scene,
      this.container,
      routeData,
      this.heightData,
      this.globusradius,
      phase,
      this.controls
    );
    route.manager = this;
    this.routes.push(route);

    // // Onload other route disable last active marker
    if (this.activeMarker !== null) {
      this.activeMarker.active = false;
    }

    // const lat = 48.78232, lng = 9.17702; // stgt
    // const lat = 19.432608, lng = -99.133209; // mexico
    // select last Marker on first route, and first marker on following routes
    const index = this.routes.length > 1 ? 0 : route.pois.length - 1;
    const marker = route.pois[index];
    this.controls.moveIntoCenter(marker.poi.lat, marker.poi.lng, 2000);

    return route;
  }

  // get activeMarker() {
  //   return this.activeMarker;
  // }

  setActiveMarker(value) {
    // when a marker is trying to get active
    // while the manager knows of an active one
    // disable it first
    if (value !== null && this.activeMarker !== null) {
      // console.log("Deactivating active marker from "+this._activeMarker._activeHandler.name);
      this.activeMarker.active = false;
    }
    this.activeMarker = value;
  }

  static load(url, callback) {
    // load datalist
    if (url) {
      $.getJSON(url, {
        format: 'json',
      })
        .done(data => {
          console.log('Route has been loaded');
          callback(data);
        })
        .fail(() => {
          alert('Sorry! An Error occured while loading the route :(');
        });
      // .always(function() {
      // alert( "complete" );
      // });
    } else {
      // IF NO JSON OBJECT GIVEN
      alert('Call to loadRoute without providing a Link to a datalist');
    }
  }

  update(delta, camera) {
    this.routes.forEach((route) => { route.update(delta, camera); });
  }
}
