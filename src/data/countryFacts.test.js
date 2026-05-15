import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchCountryData } from './countryFacts';
import { getDoc } from 'firebase/firestore';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn()
}));

describe('countryFacts Data Fetching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('successfully fetches and merges data', async () => {
    // Mock Fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{
        cca3: 'PRT',
        capital: ['Lisbon'],
        region: 'Europe',
        population: 10000000,
        flags: { svg: 'flag-url' }
      }])
    });

    // Mock Firestore
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ popularity: { 'PRT': 5 } })
    });

    const data = await fetchCountryData('PRT', 'Portugal');
    
    expect(data.capital).toBe('Lisbon');
    expect(data.popularity).toBe(5);
    expect(data.drink).toBe('Port Wine / Ginjinha'); // From extraFacts
  });

  it('returns default data on error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const data = await fetchCountryData('XYZ', 'Unknown');
    
    expect(data.capital).toBe('Unknown');
    expect(data.popularity).toBe(0);
  });
});
