
import Route from "../components/route";

export default class RouteManager {
    constructor() {
        this.routes = [];
    }

    add( route ) {
        this.routes.push( route );
    }

    update( delta, camera, clock )  {
        for( let i = 0; i < this.routes.length; i++ ) {
            if( this.routes[i] instanceof Route) {
              this.routes[i].update(delta, camera, clock);
            }
          }
    }
}