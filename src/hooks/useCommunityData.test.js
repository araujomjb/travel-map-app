import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCommunityData } from './useCommunityData';
import { onSnapshot } from 'firebase/firestore';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  where: vi.fn()
}));

describe('useCommunityData Hook', () => {
  it('fetches and filters community trips', async () => {
    let snapshotCallback;
    onSnapshot.mockImplementation((q, cb) => {
      snapshotCallback = cb;
      return () => {};
    });

    const followingIds = ['user2'];
    const { result } = renderHook(() => useCommunityData(followingIds));
    
    act(() => {
      snapshotCallback({
        docs: [
          { id: 'trip1', data: () => ({ userId: 'user1', name: 'Global Trip' }) },
          { id: 'trip2', data: () => ({ userId: 'user2', name: 'Friend Trip' }) }
        ]
      });
    });

    expect(result.current.trips.length).toBe(2);
    expect(result.current.followingTrips.length).toBe(1);
    expect(result.current.followingTrips[0].name).toBe('Friend Trip');
  });
});
