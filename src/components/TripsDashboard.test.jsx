import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import TripsDashboard from './TripsDashboard';

// Mock feature from topojson-client
vi.mock('topojson-client', () => ({
  feature: () => ({ features: [
    { id: 'PRT', properties: { name: 'Portugal' } },
    { id: 'ESP', properties: { name: 'Spain' } }
  ] })
}));

// Mock worldData
vi.mock('../data/world-50m.json', () => ({
  default: { objects: { countries: {} } }
}));

describe('TripsDashboard Component', () => {
  it('renders empty state when no itineraries', () => {
    render(<TripsDashboard itineraries={{}} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Start your journey')).toBeInTheDocument();
  });

  it('renders trip cards correctly and has functional top buttons', () => {
    const mockItineraries = {
      'PRT': [
        { id: '1', name: 'Summer in Lisbon', cities: ['Lisbon'], cost: '$1000' }
      ]
    };
    const onAddNew = vi.fn();
    // Mock window.print
    window.print = vi.fn();

    render(<TripsDashboard itineraries={mockItineraries} onEdit={vi.fn()} onDelete={vi.fn()} onAddNew={onAddNew} />);
    
    expect(screen.getByText('My Itineraries')).toBeInTheDocument();
    expect(screen.getByText('Summer in Lisbon')).toBeInTheDocument();
    
    // Check buttons
    const exportBtn = screen.getByText(/Export PDF/i);
    const addNewBtn = screen.getByText(/Add New/i);
    
    fireEvent.click(exportBtn);
    expect(window.print).toHaveBeenCalled();
    
    fireEvent.click(addNewBtn);
    expect(onAddNew).toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked and confirmed', () => {
    const mockItineraries = {
      'PRT': [
        { id: '1', name: 'Summer in Lisbon' }
      ]
    };
    const onDeleteMock = vi.fn();
    
    // Mock window.confirm to always return true
    window.confirm = vi.fn(() => true);

    render(<TripsDashboard itineraries={mockItineraries} onEdit={vi.fn()} onDelete={onDeleteMock} />);
    
    const deleteButton = screen.getByTitle('Delete Trip');
    fireEvent.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(onDeleteMock).toHaveBeenCalledWith('PRT', '1');
  });
});
