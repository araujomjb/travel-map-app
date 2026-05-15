import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import FindFriendsModal from './FindFriendsModal';
import { getDocs } from 'firebase/firestore';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  limit: vi.fn()
}));

describe('FindFriendsModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    currentUserId: 'user1',
    following: ['user2'],
    onFollow: vi.fn(),
    onUnfollow: vi.fn()
  };

  it('renders correctly', () => {
    render(<FindFriendsModal {...mockProps} />);
    expect(screen.getByText('Find Friends')).toBeInTheDocument();
  });

  it('performs search and displays results with follow/unfollow buttons', async () => {
    getDocs.mockResolvedValue({
      forEach: (callback) => {
        // One friend, one stranger
        callback({ data: () => ({ uid: 'user2', displayName: 'Friend', email: 'friend@test.com' }) });
        callback({ data: () => ({ uid: 'user3', displayName: 'Stranger', email: 'stranger@test.com' }) });
      }
    });

    render(<FindFriendsModal {...mockProps} />);
    
    fireEvent.change(screen.getByPlaceholderText('friend@example.com'), { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('Friend')).toBeInTheDocument();
    });
    
    // Click Unfollow (regex for exact match)
    fireEvent.click(screen.getByText(/^Unfollow$/));
    expect(mockProps.onUnfollow).toHaveBeenCalledWith('user2');

    // Click Follow (regex for exact match)
    fireEvent.click(screen.getByText(/^Follow$/));
    expect(mockProps.onFollow).toHaveBeenCalledWith('user3');
  });

  it('shows no results message', async () => {
    getDocs.mockResolvedValue({ forEach: () => {} });
    render(<FindFriendsModal {...mockProps} />);
    fireEvent.change(screen.getByPlaceholderText('friend@example.com'), { target: { value: 'empty@test.com' } });
    fireEvent.click(screen.getByText('Search'));
    await waitFor(() => {
      expect(screen.getByText(/No explorers found/i)).toBeInTheDocument();
    });
  });
});
