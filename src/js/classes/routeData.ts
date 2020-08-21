interface IRouteData {
    meta: object;
    gps: Array<Coordinate>;
}

class RouteData implements IRouteData {
    public meta: object;
    public gps: Array<Coordinate>;
}
