import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FeatureCollection } from 'geojson';

export const fetchGeoJsonByUrl = async (
  url: string,
): Promise<FeatureCollection> => {
  return axios.get<FeatureCollection>(url).then((res) => res.data);
};

// 입력 배열의 순서와 반환 배열의 순서가 보장됩니다.
const fetchGeoJsons = async (geoJsonUrls: (string | null | undefined)[]) => {
  if (!geoJsonUrls) return;
  const validUrls = geoJsonUrls.filter((url) => url !== null) as string[];
  return await Promise.all(validUrls.map((url) => fetchGeoJsonByUrl(url)));
};

const useFetchGeoJson = (
  geoJsonUrls: (string | null | undefined)[],
  enabled = true,
) => {
  const {
    data: geoJsons,
    refetch: refetchGeoJson,
    isLoading: isFetchGeoJsonLoading,
  } = useQuery({
    queryKey: ['/geoJson/', geoJsonUrls?.join()],
    queryFn: () => fetchGeoJsons(geoJsonUrls),
    enabled: !!geoJsonUrls && geoJsonUrls.length > 0 && enabled,
    cacheTime: 0,
    staleTime: 0,
  });

  return {
    geoJsons,
    refetchGeoJson,
    isFetchGeoJsonLoading,
  };
};

export default useFetchGeoJson;
