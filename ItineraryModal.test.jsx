import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ItineraryModal from './src/components/ItineraryModal.jsx';

describe('ItineraryModal', () => {
  let mockOnSave;
  let mockOnClose;
  let defaultProps;

  beforeEach(() => {
    mockOnSave = vi.fn();
    mockOnClose = vi.fn();
    defaultProps = {
      isOpen: true,
      onClose: mockOnClose,
      onSave: mockOnSave,
      countryName: 'Portugal'
    };
  });

  it('renders correctly for new trip', () => {
    render(<ItineraryModal {...defaultProps} />);
    expect(screen.getByText('New Trip')).toBeInTheDocument();
    expect(screen.getByLabelText(/Trip Name/i)).toBeInTheDocument();
  });

  it('can fill and submit the form', async () => {
    render(<ItineraryModal {...defaultProps} />);
    
    fireEvent.change(screen.getByLabelText(/Trip Name/i), { target: { value: 'My Summer Trip' } });
    fireEvent.change(screen.getByLabelText(/Total Cost/i), { target: { value: '$1000' } });
    
    // Find the form and trigger submit
    const form = screen.getByRole('form', { hidden: true });
    fireEvent.submit(form);
    
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      name: 'My Summer Trip',
      cost: '$1000'
    }));
  });

  it('can toggle community sharing', async () => {
    render(<ItineraryModal {...defaultProps} />);
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    
    const form = screen.getByRole('form', { hidden: true });
    fireEvent.submit(form);

    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      isPublic: true
    }));
  });

  it('can add flight details', async () => {
    render(<ItineraryModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText(/Add Flight/i));
    
    const airlineInputs = screen.getAllByPlaceholderText(/TAP Air Portugal/i);
    fireEvent.change(airlineInputs[0], { target: { value: 'TAP' } });
    
    const form = screen.getByRole('form', { hidden: true });
    fireEvent.submit(form);

    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      flights: [expect.objectContaining({ airline: 'TAP' })]
    }));
  });
});
