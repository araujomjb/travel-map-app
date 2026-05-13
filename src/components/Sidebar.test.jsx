import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  feature: () => ({ features: [] })
}));

// Mock fetchCountryData
vi.mock('../data/countryFacts', () => ({
  fetchCountryData: vi.fn().mockResolvedValue({})
}));

// Mock worldData
vi.mock('../data/world-50m.json', () => ({
  default: { objects: { countries: {} } }
}));

describe('Sidebar Component', () => {
  it('renders without crashing', () => {
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
    };

    render(<Sidebar {...mockProps} />);
    
    // Check if the main title renders
    expect(screen.getByText('Eu fui')).toBeInTheDocument();
  });
});
