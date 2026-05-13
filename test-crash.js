import React from 'react';
import { render } from '@testing-library/react';
import ItineraryModal from './src/components/ItineraryModal';

const data = {
  id: '1',
  name: 'Test',
  cities: ['Lisbon'],
  flights: [],
  transportation: 'Train'
};
render(<ItineraryModal isOpen={true} existingData={data} onClose={() => {}} onSave={() => {}} countryName="Portugal" />);
console.log("Rendered successfully");
