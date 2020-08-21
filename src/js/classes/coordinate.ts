interface ICoordinate {
    adresse?: string;
    externerlink: string;
    lng: string;
    lat: string;
}

class Coordinate implements ICoordinate {
    public lat: string;
    public lng: string;
    public externerlink: string;
    public adresse: string;
}
