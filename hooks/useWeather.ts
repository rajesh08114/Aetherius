import { useQuery } from '@tanstack/react-query';

export function useWeather(lat: number, lon: number, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['weather', lat, lon, startDate, endDate],
    queryFn: async () => {
      let url = `/api/v1/weather?lat=${lat}&lon=${lon}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch weather');
      const json = await res.json();
      return json.data;
    },
    enabled: !!lat && !!lon
  });
}
