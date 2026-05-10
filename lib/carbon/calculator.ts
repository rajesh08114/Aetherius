import { Stop, TransportMode } from '@/types';

const EMISSION_FACTORS: Record<TransportMode, number> = {
  flight: 0.255,    // kg CO2 per km per passenger
  train: 0.041,
  bus: 0.089,
  drive: 0.171,
  ferry: 0.113,
};

export function calculateCarbonKg(mode: TransportMode, distanceKm: number): number {
  return Math.round((EMISSION_FACTORS[mode] || 0) * distanceKm);
}

export function calculateTripCarbon(stops: Stop[]): number {
  return stops.reduce((acc, stop) => {
    if (stop.transportTo?.mode && stop.transportTo?.distanceKm) {
      return acc + calculateCarbonKg(stop.transportTo.mode, stop.transportTo.distanceKm);
    }
    return acc + (stop.carbonKg || 0);
  }, 0);
}

export function getCarbonGrade(kg: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (kg < 200) return 'A';
  if (kg < 500) return 'B';
  if (kg < 1000) return 'C';
  if (kg < 2000) return 'D';
  return 'F';
}

export function getGreenAlternative(mode: TransportMode, distanceKm: number): string | null {
  if (mode === 'flight' && distanceKm < 800) {
    return 'train';
  }
  if (mode === 'drive' && distanceKm < 300) {
    return 'train';
  }
  return null;
}
