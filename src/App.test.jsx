import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from './App';

// Mock Firebase
vi.mock('./lib/firebase', () => ({
  auth: {
    signOut: vi.fn(),
  },
  db: {}
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, cb) => {
    // Simulate an authenticated user immediately
    cb({ uid: '123', email: 'test@test.com', displayName: 'Test User' });
    return () => {};
  })
}));

// Mock hooks
vi.mock('./hooks/useCountryState', () => ({
  CATEGORIES: { VISITED: 'visited', WANT_TO_VISIT: 'wantToVisit', NONE: 'none' },
  useCountryState: () => ({
    countries: { 'PRT': 'visited' },
    setCategory: vi.fn(),
    counts: { visited: 1, wantToVisit: 0 },
    loading: false,
    itineraries: { 'PRT': [{ id: '1', name: 'Portugal Trip' }] },
    saveItinerary: vi.fn(),
    deleteItinerary: vi.fn()
  })
}));

// Mock feature from topojson-client
vi.mock('topojson-client', () => ({
  feature: () => ({ features: [{ id: 'PRT', properties: { name: 'Portugal' } }] })
}));

// Mock Map to prevent rendering issues with d3/svg in tests
vi.mock('./components/Map', () => ({
  default: ({ onCountryClick }) => (
    <div data-testid="mock-map">
      <button data-testid="click-prt" onClick={() => onCountryClick({ id: 'PRT', name: 'Portugal' })}>
        Click Portugal
      </button>
    </div>
  )
}));

describe('App Component Happy Paths', () => {
  it('renders the authenticated layout', () => {
    render(<App />);
    expect(screen.getByTestId('mock-map')).toBeInTheDocument();
    expect(screen.getAllByText(/Search & Stats/i)[0]).toBeInTheDocument();
  });

  it('can switch between Map, Stats, and Trips tabs', async () => {
    render(<App />);
    
    // Default should be map view
    expect(screen.getByTestId('mock-map')).toBeInTheDocument();

    // Switch to Stats tab (using role='tab' for shadcn Tabs)
    const statsTab = screen.getAllByRole('tab', { name: /Stats/i })[0];
    fireEvent.click(statsTab);
    expect(await screen.findByText(/Travel Rank/i)).toBeInTheDocument();

    // Switch to Trips tab
    const tripsTab = screen.getByRole('tab', { name: /Trips/i });
    fireEvent.click(tripsTab);
    expect(await screen.findByText('My Itineraries')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-map')).not.toBeInTheDocument();
  });

  it('can click a country on the map to view details', () => {
    render(<App />);
    
    // Click Portugal on the mocked map
    const prtButton = screen.getByTestId('click-prt');
    fireEvent.click(prtButton);

    // Sidebar should update to show Portugal details (it renders in both Sidebar and Mobile Card)
    expect(screen.getAllByText('Portugal')[0]).toBeInTheDocument();
    // Quick action buttons for Visited/Want should appear (renders in both Sidebar and Mobile Card)
    expect(screen.getAllByText('Visited')[0]).toBeInTheDocument();
  });
});

