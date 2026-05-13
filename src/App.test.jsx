import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    countries: {},
    setCategory: vi.fn(),
    counts: { visited: 0, wantToVisit: 0 },
    loading: false,
    itineraries: {},
    saveItinerary: vi.fn()
  })
}));

// Mock feature from topojson-client
vi.mock('topojson-client', () => ({
  feature: () => ({ features: [] })
}));

// Mock Map to prevent rendering issues with d3/svg in tests
vi.mock('./components/Map', () => ({
  default: () => <div data-testid="mock-map">Map Component</div>
}));

describe('App Component', () => {
  it('renders the authenticated layout without crashing', () => {
    render(<App />);
    
    // Check if the mock map renders
    expect(screen.getByTestId('mock-map')).toBeInTheDocument();
    
    // Check if the floating action button (which had the missing MapPin earlier) renders
    expect(screen.getByText('Search & Stats')).toBeInTheDocument();
  });
});
