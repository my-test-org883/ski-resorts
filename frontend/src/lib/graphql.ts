import { Client, cacheExchange, fetchExchange } from "urql";

export const graphqlClient = new Client({
  url: "/graphql",
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
