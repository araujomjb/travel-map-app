import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ItineraryModal from './src/components/ItineraryModal.jsx';

describe('ItineraryModal', () => {
  it('renders successfully with existing data and show community toggle', () => {
    const data = {
      id: '1',
      name: 'Test',
      cities: ['Lisbon'],
      flights: [],
      transportation: 'Train',
      isPublic: true
    };
    render(<ItineraryModal isOpen={true} existingData={data} onClose={() => {}} onSave={() => {}} countryName="Portugal" />);
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
    expect(screen.getByText(/Share with Community/i)).toBeInTheDocument();
  });
});
