import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Sidebar from './Sidebar';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  auth: {
    signOut: vi.fn(),
  },
  db: {}
}));

// Mock feature from topojson-client
vi.mock('topojson-client', () => ({
  feature: () => ({ features: [{ id: 'PRT', properties: { name: 'Portugal' } }] })
}));

// Mock fetchCountryData
const mockFetchData = vi.fn();
vi.mock('../data/countryFacts', () => ({
  fetchCountryData: (...args) => mockFetchData(...args)
}));

// Mock worldData
vi.mock('../data/world-50m.json', () => ({
  default: { objects: { countries: {} } }
}));

describe('Sidebar Component Happy Paths', () => {
  const mockProps = {
    selectedCountry: null,
    onCountryClick: vi.fn(),
    setCategory: vi.fn(),
    countries: {},
    counts: { visited: 0, wantToVisit: 0 },
    user: { displayName: 'Test User', email: 'test@test.com' },
    isOpen: true,
    onClose: vi.fn(),
    itineraries: {},
    onOpenItinerary: vi.fn(),
    activeTab: 'map',
    setActiveTab: vi.fn(),
  };

  beforeEach(() => {
    mockFetchData.mockResolvedValue({
      capital: 'Lisbon',
      region: 'Europe',
      population: '10M',
      drink: 'Port Wine',
      animals: 'Iberian Lynx'
    });
  });

  it('renders without crashing and displays user info', () => {
    render(<Sidebar {...mockProps} />);
    expect(screen.getByText('Eu fui')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('displays country facts when a country is selected', async () => {
    render(<Sidebar {...mockProps} selectedCountry={{ id: 'PRT', name: 'Portugal' }} />);
    
    // Check if country name renders
    expect(screen.getByText('Portugal')).toBeInTheDocument();
    
    // Wait for facts to load
    await waitFor(() => {
      expect(screen.getByText('Lisbon')).toBeInTheDocument();
    });
  });

  it('renders itinerary tabs if country is visited and has trips', async () => {
    const props = {
      ...mockProps,
      selectedCountry: { id: 'PRT', name: 'Portugal' },
      countries: { 'PRT': 'visited' },
      itineraries: {
        'PRT': [{ id: '1', name: 'Summer Trip', cities: ['Lisbon'] }]
      }
    };

    render(<Sidebar {...props} />);
    
    // Wait for initial render of tabs
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Summer Trip')).toBeInTheDocument();

    // Click the trip tab
    fireEvent.click(screen.getByText('Summer Trip'));
    
    // Should show cities of that trip
    expect(screen.getByText('Cities')).toBeInTheDocument();
  });
});

