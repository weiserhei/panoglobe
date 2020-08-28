interface IRouteData {
    meta: object;
    gps: Coordinate[];
}

interface IMeta {
    name: string;
}

class RouteData implements IRouteData {
    public meta: IMeta;
    public gps: Coordinate[];
}
