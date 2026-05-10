import { useQuery } from '@tanstack/react-query';

export function useCities(query: string = '', region: string = '', popular: boolean = false) {
  return useQuery({
    queryKey: ['cities', query, region, popular],
    queryFn: async () => {
      let url = `/api/v1/cities?`;
      if (query) url += `q=${query}&`;
      if (region) url += `region=${region}&`;
      if (popular) url += `popular=true`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch cities');
      const json = await res.json();
      return json.data;
    }
  });
}
