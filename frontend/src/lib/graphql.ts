import { Client, cacheExchange, fetchExchange } from "urql";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export const graphqlClient = new Client({
  url: `${API_URL}/graphql`,
  exchanges: [cacheExchange, fetchExchange],
});

export const NEARBY_RESORTS_QUERY = `
  query NearbyResorts($lat: Float!, $lng: Float!, $radiusKm: Float) {
    nearbyResorts(lat: $lat, lng: $lng, radiusKm: $radiusKm) {
      id
      name
      lat
      lng
      distanceKm
      elevation
      country
      region
      minElevation
      maxElevation
      vertical
      totalRunLengthKm
      runCount
      liftCount
      easyRuns
      intermediateRuns
      advancedRuns
      expertRuns
      condition {
        score
        temperature
        freshSnowCm
        snowBaseCm
        windSpeedKmh
        freezeThawRisk
      }
    }
  }
`;
