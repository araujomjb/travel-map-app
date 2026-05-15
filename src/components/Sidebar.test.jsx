import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import Sidebar from './Sidebar';
import { CATEGORIES } from '../hooks/useCountryState';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  auth: {
    signOut: vi.fn(),
  },
  db: {}
}));

// Mock useCommunityData
vi.mock('../hooks/useCommunityData', () => ({
  useCommunityData: () => ({
    trips: [
      { id: '1', userName: 'Friend', countryName: 'Portugal', name: 'Summer Trip', cities: ['Lisbon'], userId: 'friend1' }
    ],
    followingTrips: [],
    loading: false
  })
}));

// Mock fetchCountryData
const mockFetchData = vi.fn();
vi.mock('../data/countryFacts', () => ({
  fetchCountryData: (...args) => mockFetchData(...args)
}));

// Mock worldData
vi.mock('../data/world-50m.json', () => ({
  default: {
    objects: {
      countries: {
        type: "GeometryCollection",
        geometries: [
          { id: "PRT", properties: { name: "Portugal" } }
        ]
      }
    }
  }
}));

describe('Sidebar Component', () => {
  const mockProps = {
    selectedCountry: null,
    onCountryClick: vi.fn(),
    setCategory: vi.fn(),
    countries: {},
    counts: { [CATEGORIES.VISITED]: 0, [CATEGORIES.WANT_TO_VISIT]: 0 },
    user: { displayName: 'Test User', email: 'test@test.com' },
    isOpen: true,
    onClose: vi.fn(),
    itineraries: {},
    onOpenItinerary: vi.fn(),
    activeTab: 'map',
    setActiveTab: vi.fn(),
    onOpenFindFriends: vi.fn(),
    following: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchData.mockResolvedValue({
      capital: 'Lisbon',
      region: 'Europe',
      drink: 'Port Wine',
      animals: 'Iberian Lynx'
    });
  });

  it('renders correctly', () => {
    render(<Sidebar {...mockProps} />);
    expect(screen.getByText('Eu fui')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('performs country search', async () => {
    render(<Sidebar {...mockProps} />);
    const searchInput = screen.getByPlaceholderText(/Find a country/i);
    fireEvent.change(searchInput, { target: { value: 'Portu' } });
    
    expect(await screen.findByText('Portugal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Portugal'));
    expect(mockProps.onCountryClick).toHaveBeenCalled();
  });

  it('displays country facts and category buttons', async () => {
    const props = {
      ...mockProps,
      selectedCountry: { id: 'PRT', name: 'Portugal' }
    };
    render(<Sidebar {...props} />);
    
    expect(await screen.findByText('Lisbon')).toBeInTheDocument();
    
    const visitedBtn = screen.getByRole('button', { name: /Visited/i });
    const wantBtn = screen.getByRole('button', { name: /Want/i });
    
    expect(visitedBtn).toBeInTheDocument();
    expect(wantBtn).toBeInTheDocument();
    
    fireEvent.click(visitedBtn);
    expect(mockProps.setCategory).toHaveBeenCalledWith('PRT', CATEGORIES.VISITED);
  });

  it('switches to community feed', async () => {
    const { rerender } = render(<Sidebar {...mockProps} />);
    
    const feedTab = screen.getByRole('tab', { name: /Feed/i });
    fireEvent.click(feedTab);
    expect(mockProps.setActiveTab).toHaveBeenCalledWith('community', expect.anything());
    
    await act(async () => {
      rerender(<Sidebar {...mockProps} activeTab="community" />);
    });
    
    expect(screen.getByText('Community Feed')).toBeInTheDocument();
    expect(screen.getByText('Summer Trip')).toBeInTheDocument();
  });

  it('switches to stats tab', async () => {
    const { rerender } = render(<Sidebar {...mockProps} />);
    
    const statsTab = screen.getByRole('tab', { name: /Stats/i });
    fireEvent.click(statsTab);
    expect(mockProps.setActiveTab).toHaveBeenCalledWith('stats', expect.anything());
    
    await act(async () => {
      rerender(<Sidebar {...mockProps} activeTab="stats" />);
    });
    
    expect(screen.getByText(/Travel Rank/i)).toBeInTheDocument();
  });
});
