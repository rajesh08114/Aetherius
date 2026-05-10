import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/db/redis';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const startDate = searchParams.get('startDate'); // YYYY-MM-DD
    const endDate = searchParams.get('endDate');

    if (!lat || !lon) return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });

    const cacheKey = `weather:${lat},${lon}:${startDate || 'now'}`;
    const cached = await getCache(cacheKey);
    if (cached) return NextResponse.json({ success: true, data: cached, cached: true });

    // Open-Meteo API
    let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto`;
    if (startDate && endDate) {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch weather data');
    const data = await res.json();

    const formattedData = data.daily?.time.map((time: string, i: number) => ({
      date: time,
      maxTemp: data.daily.temperature_2m_max[i],
      minTemp: data.daily.temperature_2m_min[i],
      precipitation: data.daily.precipitation_sum[i],
      weatherCode: data.daily.weathercode[i]
    }));

    await setCache(cacheKey, formattedData, 3600 * 12); // cache 12 hours

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
