import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Plane, MapPin, Train, Tag, DollarSign } from 'lucide-react';

const ItineraryModal = ({ isOpen, onClose, countryName, existingData, onSave }) => {
  const [name, setName] = useState('');
  const [cities, setCities] = useState('');
  const [transportation, setTransportation] = useState('');
  const [flights, setFlights] = useState([]);
  const [cost, setCost] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(existingData?.name || '');
      setCities(existingData?.cities ? existingData.cities.join(', ') : '');
      setTransportation(existingData?.transportation || '');
      setFlights(existingData?.flights || []);
      setCost(existingData?.cost || '');
    }
  }, [isOpen, existingData]);

  if (!isOpen) return null;

  const handleAddFlight = () => {
    setFlights([...flights, { airline: '', route: '', layover: '' }]);
  };

  const handleFlightChange = (index, field, value) => {
    const newFlights = [...flights];
    newFlights[index][field] = value;
    setFlights(newFlights);
  };

  const handleRemoveFlight = (index) => {
    const newFlights = [...flights];
    newFlights.splice(index, 1);
    setFlights(newFlights);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanCities = cities.split(',').map(c => c.trim()).filter(c => c !== '');
    
    // Filter out completely empty flight entries
    const cleanFlights = flights.filter(f => f.airline.trim() || f.route.trim() || f.layover.trim());

    onSave({
      id: existingData?.id, // undefined for new itineraries, which is fine
      name: name.trim() || 'My Trip',
      cities: cleanCities,
      transportation: transportation.trim(),
      flights: cleanFlights,
      cost: cost.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{existingData ? 'Edit Trip' : 'New Trip'}</h2>
            <p className="text-slate-500 text-sm font-medium flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> {countryName}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto p-6 flex-1">
          <form id="itinerary-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Trip Name and Cost Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-orange-500" />
                  Trip Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sister Trip 2025"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  Total Cost
                </label>
                <input
                  type="text"
                  placeholder="e.g. $1200 or €800"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Cities Section */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-500" />
                Cities Visited
              </label>
              <input
                type="text"
                placeholder="e.g. Lisbon, Porto, Faro"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                value={cities}
                onChange={(e) => setCities(e.target.value)}
              />
              <p className="text-[10px] text-slate-400">Separate cities with commas.</p>
            </div>

            <hr className="border-slate-100" />

            {/* Flights Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Plane className="h-4 w-4 text-blue-500" />
                  Flight Details
                </label>
                <button 
                  type="button" 
                  onClick={handleAddFlight}
                  className="text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="h-3 w-3" /> Add Flight
                </button>
              </div>

              {flights.length === 0 && (
                <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  No flights added yet.
                </div>
              )}

              {flights.map((flight, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 p-4 rounded-xl relative group">
                  <button 
                    type="button" 
                    onClick={() => handleRemoveFlight(index)}
                    className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-200 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full shadow-sm transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Airline</label>
                      <input
                        type="text"
                        placeholder="e.g. TAP Air Portugal"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                        value={flight.airline}
                        onChange={(e) => handleFlightChange(index, 'airline', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Route</label>
                      <input
                        type="text"
                        placeholder="e.g. JFK -> LIS"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                        value={flight.route}
                        onChange={(e) => handleFlightChange(index, 'route', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Layover (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2 hours in Madrid (MAD)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                      value={flight.layover}
                      onChange={(e) => handleFlightChange(index, 'layover', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-slate-100" />

            {/* Transportation Section */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Train className="h-4 w-4 text-purple-500" />
                Local Transportation & Notes
              </label>
              <textarea
                placeholder="How did you get around? e.g. Took the Alfa Pendular train from Lisbon to Porto. Rented a car in Faro."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none h-24"
                value={transportation}
                onChange={(e) => setTransportation(e.target.value)}
              />
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="itinerary-form"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Save className="h-4 w-4" /> Save Itinerary
          </button>
        </div>

      </div>
    </div>
  );
};

export default ItineraryModal;
