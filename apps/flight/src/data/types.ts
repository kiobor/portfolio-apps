export type Cabin = "economy" | "business";

export type Airport = {
  code: string;
  city: string;
  name: string;
  /** Offset fisso dall'UTC in minuti, senza ora legale (dichiarato nel case study). */
  tzMin: number;
  /** Coordinate, usate solo per stimare la distanza e quindi la durata. */
  lat: number;
  lon: number;
};

export type Airline = { code: string; name: string };

export type Segment = {
  from: string;
  to: string;
  flightNo: string;
  departUtc: number;
  arriveUtc: number;
};

export type Flight = {
  id: string;
  airlineCode: string;
  segments: Segment[];
  stops: number;
  departUtc: number;
  arriveUtc: number;
  durationMin: number;
  baseCents: number;
  cabin: Cabin;
};

/** Una tratta (andata o ritorno). `date` è YYYY-MM-DD, giorno locale di partenza. */
export type LegQuery = { from: string; to: string; date: string; cabin: Cabin };
