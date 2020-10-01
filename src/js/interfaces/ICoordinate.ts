interface Coordinate {
    id: number;
    priority: number;
    locationname?: string;
    lat: string;
    lng: string;
    label?: string;
    google_geocode: string;
    linkexternal?: string;
    linkinternal?: string;
    images?: string[];
    images2?: string;
    hopDistance?: number;
    // pos?: Vector3;
}
