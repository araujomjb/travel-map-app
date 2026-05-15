import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import App from './App';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Mock Firebase
vi.mock('./lib/firebase', () => ({
  auth: {
    signOut: vi.fn(),
  },
  db: {}
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn((auth, cb) => {
    cb({ uid: '123', email: 'test@test.com', displayName: 'Test User' });
    return () => {};
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  signInAnonymously: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: class {}
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => true, data: () => ({}) })),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(() => () => {}),
  increment: vi.fn(),
  deleteField: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn()
}));

// Mock hooks
const mockSaveItinerary = vi.fn();
const mockSetCategory = vi.fn();

vi.mock('./hooks/useCountryState', () => ({
  CATEGORIES: { VISITED: 'visited', WANT_TO_VISIT: 'wantToVisit', NONE: 'none' },
  useCountryState: () => ({
    countries: { 'PRT': 'visited' },
    setCategory: mockSetCategory,
    counts: { visited: 1, wantToVisit: 0 },
    loading: false,
    itineraries: { 'PRT': [{ id: '1', name: 'Portugal Trip', countryName: 'Portugal' }] },
    saveItinerary: mockSaveItinerary,
    deleteItinerary: vi.fn(),
    following: [],
    followUser: vi.fn(),
    unfollowUser: vi.fn()
  })
}));

vi.mock('./hooks/useCommunityData', () => ({
  useCommunityData: () => ({
    trips: [],
    followingTrips: [],
    loading: false
  })
}));

vi.mock('./components/Map', () => ({
  default: ({ onCountryClick }) => (
    <div data-testid="mock-map">
      <button data-testid="click-prt" onClick={() => onCountryClick({ id: 'PRT', name: 'Portugal' })}>
        Click Portugal
      </button>
    </div>
  )
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.innerWidth = 1024;
  });

  it('renders the authenticated layout', () => {
    render(<App />);
    expect(screen.getByTestId('mock-map')).toBeInTheDocument();
    expect(screen.getByText(/Explorer/i)).toBeInTheDocument();
  });

  it('can switch between all tabs', async () => {
    render(<App />);
    
    const statsTab = screen.getAllByRole('tab', { name: /Stats/i })[0];
    fireEvent.click(statsTab);
    expect(await screen.findByText(/Travel Rank/i)).toBeInTheDocument();

    const feedTab = screen.getAllByRole('tab', { name: /Feed/i })[0];
    fireEvent.click(feedTab);
    expect(await screen.findByText(/Community Feed/i)).toBeInTheDocument();

    const tripsTab = screen.getAllByRole('tab', { name: /Trips/i })[0];
    fireEvent.click(tripsTab);
    expect(await screen.findByText(/My Itineraries/i)).toBeInTheDocument();
  });

  it('can select a country and toggle category', async () => {
    render(<App />);
    
    fireEvent.click(screen.getByTestId('click-prt'));
    
    await waitFor(() => {
      expect(screen.getAllByText('Portugal').length).toBeGreaterThan(0);
    });
    
    const visitedBtn = screen.getAllByRole('button', { name: /Visited/i })[0];
    fireEvent.click(visitedBtn);
    expect(mockSetCategory).toHaveBeenCalled();
  });

  it('handles mobile interactions', async () => {
    window.innerWidth = 375;
    render(<App />);
    
    fireEvent.click(screen.getByTestId('click-prt'));
    
    await waitFor(() => {
      expect(screen.getAllByText('Portugal').length).toBeGreaterThan(0);
    });
    
    expect(screen.getByText(/Add Trip Journal/i)).toBeInTheDocument();
  });

  it('can logout', async () => {
    render(<App />);
    const userMenu = screen.getByText('Test User');
    fireEvent.click(userMenu);
    const signOutBtn = await screen.findByText(/Sign Out/i);
    fireEvent.click(signOutBtn);
    expect(auth.signOut).toHaveBeenCalled();
  });
});
