import { useQuery } from "urql";
import { NEARBY_RESORTS_QUERY } from "../lib/graphql";
import type { Resort } from "../types/resort";

interface UseResortsResult {
  resorts: Resort[];
  loading: boolean;
  error: string | null;
}

export function useResorts(
  lat: number | null,
  lng: number | null,
  radiusKm: number,
): UseResortsResult {
  const [result] = useQuery({
    query: NEARBY_RESORTS_QUERY,
    variables: { lat, lng, radiusKm },
    pause: lat === null || lng === null,
  });

  return {
    resorts: result.data?.nearbyResorts ?? [],
    loading: result.fetching,
    error: result.error?.message ?? null,
  };
}
