export type BalloonPoint = {
  lat: number;
  lon: number;
  alt: number;
  index: number;
};

export type FireRecord = {
  latitude: number;
  longitude: number;
  acq_date: string;
  acq_time: string;
  confidence: string;
  frp: string;
  timestamp: number;
  [key: string]: string | number;
};

export type FC = GeoJSON.FeatureCollection<GeoJSON.Point>;
