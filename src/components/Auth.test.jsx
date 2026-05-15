import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import Auth from './Auth';
import { signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

// Mock Firebase services
vi.mock('../lib/firebase', () => ({
  auth: {
    uid: '123'
  },
  db: {}
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInAnonymously: vi.fn(() => Promise.resolve()),
  GoogleAuthProvider: class {},
  signInWithPopup: vi.fn(() => Promise.resolve()),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve()),
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: {} })),
  updateProfile: vi.fn(() => Promise.resolve())
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn()
}));

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login options', () => {
    render(<Auth />);
    expect(screen.getByText(/Traveler/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue as Guest/i)).toBeInTheDocument();
  });

  it('calls signInAnonymously when Guest button is clicked', async () => {
    render(<Auth />);
    await act(async () => {
      fireEvent.click(screen.getByText(/Continue as Guest/i));
    });
    expect(signInAnonymously).toHaveBeenCalled();
  });

  it('calls signInWithPopup when Google button is clicked', async () => {
    render(<Auth />);
    await act(async () => {
      fireEvent.click(screen.getByText(/Continue with Google/i));
    });
    expect(signInWithPopup).toHaveBeenCalled();
  });

  it('switches between Login and Sign Up', () => {
    render(<Auth />);
    const toggleBtn = screen.getByText(/Don't have an account\? Sign up/i);
    fireEvent.click(toggleBtn);
    expect(screen.getByText(/Already have an account\? Login/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
  });

  it('performs email login', async () => {
    render(<Auth />);
    fireEvent.change(screen.getByPlaceholderText(/Email address/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password' } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    });
    
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
  });

  it('performs registration', async () => {
    render(<Auth />);
    fireEvent.click(screen.getByText(/Don't have an account\? Sign up/i));
    
    fireEvent.change(screen.getByPlaceholderText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Email address/i), { target: { value: 'john@doe.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password' } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    });
    
    expect(createUserWithEmailAndPassword).toHaveBeenCalled();
  });
});
