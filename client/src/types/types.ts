export type BalloonPoint = {
  lat: number;
  lon: number;
  alt: number;
  index: number;
};

export type FC = GeoJSON.FeatureCollection<GeoJSON.Point>;
