import { describe, it, expect } from "vitest";
import { Client, gql } from "urql";
import { graphqlClient, NEARBY_RESORTS_QUERY } from "./graphql";

describe("graphqlClient", () => {
  it("is a urql Client instance", () => {
    expect(graphqlClient).toBeInstanceOf(Client);
  });

  it("dispatches operations with url /graphql", () => {
    const request = {
      key: 1 as unknown as number,
      query: gql`
        {
          __typename
        }
      `,
      variables: {},
    };
    const operation = graphqlClient.createRequestOperation("query", request);
    expect(operation.context.url).toBe("/graphql");
  });
});

describe("NEARBY_RESORTS_QUERY", () => {
  it("references the nearbyResorts operation", () => {
    expect(NEARBY_RESORTS_QUERY).toContain("nearbyResorts");
  });

  it.each([
    "id",
    "name",
    "lat",
    "lng",
    "distanceKm",
    "elevation",
    "country",
    "region",
    "minElevation",
    "maxElevation",
    "vertical",
    "totalRunLengthKm",
    "runCount",
    "liftCount",
    "easyRuns",
    "intermediateRuns",
    "advancedRuns",
    "expertRuns",
    "condition",
    "score",
    "temperature",
    "freshSnowCm",
    "snowBaseCm",
    "windSpeedKmh",
    "freezeThawRisk",
  ])("contains field %s", (field) => {
    expect(NEARBY_RESORTS_QUERY).toContain(field);
  });

  it("accepts lat, lng, and radiusKm variables", () => {
    expect(NEARBY_RESORTS_QUERY).toContain("$lat: Float!");
    expect(NEARBY_RESORTS_QUERY).toContain("$lng: Float!");
    expect(NEARBY_RESORTS_QUERY).toContain("$radiusKm: Float");
  });
});
