import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountryState, CATEGORIES } from './useCountryState';
import { onSnapshot, setDoc, updateDoc, deleteDoc, deleteField } from 'firebase/firestore';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((db, coll, id) => ({ db, coll, id })),
  onSnapshot: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  deleteField: vi.fn(() => ({ type: 'delete' })),
  increment: vi.fn(),
  serverTimestamp: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn()
}));

describe('useCountryState Hook', () => {
  const mockUser = { uid: 'user1', displayName: 'Test User' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty state', () => {
    onSnapshot.mockReturnValue(() => {});
    const { result } = renderHook(() => useCountryState(null));
    expect(result.current.countries).toEqual({});
    expect(result.current.loading).toBe(false);
  });

  it('syncs data from Firestore', () => {
    let snapshotCallback;
    onSnapshot.mockImplementation((ref, cb) => {
      snapshotCallback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useCountryState(mockUser));
    
    act(() => {
      snapshotCallback({
        exists: () => true,
        data: () => ({
          countries: { 'PRT': CATEGORIES.VISITED },
          itineraries: { 'PRT': [{ id: '1', name: 'Trip' }] },
          following: ['friend1']
        })
      });
    });

    expect(result.current.countries).toEqual({ 'PRT': CATEGORIES.VISITED });
    expect(result.current.itineraries).toEqual({ 'PRT': [{ id: '1', name: 'Trip' }] });
    expect(result.current.following).toEqual(['friend1']);
  });

  it('saves an itinerary publicly', async () => {
    onSnapshot.mockReturnValue(() => {});
    const { result } = renderHook(() => useCountryState(mockUser));
    
    const itinerary = { name: 'New Trip', cities: ['Lisbon'], isPublic: true };
    
    await act(async () => {
      await result.current.saveItinerary('PRT', 'Portugal', itinerary);
    });

    expect(setDoc).toHaveBeenCalledTimes(2); // once for user, once for public
  });

  it('saves an itinerary privately and deletes from public if previously public', async () => {
    onSnapshot.mockReturnValue(() => {});
    const { result } = renderHook(() => useCountryState(mockUser));
    
    const itinerary = { id: 'trip1', name: 'New Trip', cities: ['Lisbon'], isPublic: false };
    
    await act(async () => {
      await result.current.saveItinerary('PRT', 'Portugal', itinerary);
    });

    expect(setDoc).toHaveBeenCalledTimes(1); // only for user
    expect(deleteDoc).toHaveBeenCalled(); // delete from public
  });

  it('deletes an itinerary', async () => {
    onSnapshot.mockReturnValue(() => {});
    const { result } = renderHook(() => useCountryState(mockUser));
    
    await act(async () => {
      await result.current.deleteItinerary('PRT', 'trip1');
    });

    expect(deleteDoc).toHaveBeenCalled();
  });

  it('updates country category', async () => {
    onSnapshot.mockReturnValue(() => {});
    const { result } = renderHook(() => useCountryState(mockUser));
    
    await act(async () => {
      await result.current.setCategory('PRT', CATEGORIES.VISITED);
    });

    expect(setDoc).toHaveBeenCalled();
  });

  it('removes country category', async () => {
    onSnapshot.mockReturnValue(() => {});
    const { result } = renderHook(() => useCountryState(mockUser));
    
    await act(async () => {
      await result.current.setCategory('PRT', CATEGORIES.NONE);
    });

    expect(updateDoc).toHaveBeenCalled();
    expect(deleteField).toHaveBeenCalled();
  });

  it('follows and unfollows a user', async () => {
    onSnapshot.mockReturnValue(() => {});
    const { result } = renderHook(() => useCountryState(mockUser));
    
    await act(async () => {
      await result.current.followUser('friend1');
      await result.current.unfollowUser('friend1');
    });

    expect(updateDoc).toHaveBeenCalledTimes(2);
  });
});
