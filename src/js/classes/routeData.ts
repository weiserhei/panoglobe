interface IRouteData {
    meta: object;
    gps: Array<Coordinate>;
}

interface IMeta {
    name: string;
}

class RouteData implements IRouteData {
    public meta: IMeta;
    public gps: Array<Coordinate>;
}
