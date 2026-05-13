import React, { useMemo } from 'react';
import { MapPin, Plane, Train, Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import { feature } from "topojson-client";
import worldData from "../data/world-50m.json";

const TripsDashboard = ({ itineraries, onEdit, onDelete }) => {
  
  const allCountries = useMemo(() => {
    const countriesFeature = feature(worldData, worldData.objects.countries).features;
    return countriesFeature.reduce((acc, f) => {
      const id = f.id || f.properties.ISO_A3 || f.properties.name;
      acc[id] = f.properties.name;
      return acc;
    }, {});
  }, []);

  const allTrips = useMemo(() => {
    const trips = [];
    Object.entries(itineraries).forEach(([countryId, countryTrips]) => {
      if (Array.isArray(countryTrips)) {
        countryTrips.forEach(trip => {
          trips.push({
            ...trip,
            countryId,
            countryName: allCountries[countryId] || countryId
          });
        });
      }
    });
    return trips;
  }, [itineraries, allCountries]);

  const handleDelete = (countryId, tripId, tripName) => {
    if (window.confirm(`Are you sure you want to delete "${tripName}"? This action cannot be undone.`)) {
      onDelete(countryId, tripId);
    }
  };

  if (allTrips.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-6 animate-in fade-in">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 text-center max-w-md">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plane className="h-8 w-8 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No trips logged yet</h2>
          <p className="text-slate-500 text-sm">
            Go to the Map, select a country you've visited, and click "Add Trip" to start building your travel diary.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-50 overflow-y-auto p-4 md:p-8 animate-in fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Itineraries</h1>
          <p className="text-slate-500 font-medium">You have logged {allTrips.length} trips across the globe.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allTrips.map(trip => (
            <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-all">
              
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{trip.name}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(trip.countryId, trip)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Trip"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(trip.countryId, trip.id, trip.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Trip"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-500" /> {trip.countryName}
                  </div>
                  {trip.cost && (
                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                      <DollarSign className="h-3.5 w-3.5" /> {trip.cost}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 space-y-4">
                {trip.cities && trip.cities.length > 0 && (
                  <div>
                    <div className="flex flex-wrap gap-1.5">
                      {trip.cities.map((city, i) => (
                        <span key={i} className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60">
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {trip.flights && trip.flights.length > 0 && (
                  <div className="space-y-2">
                    {trip.flights.map((flight, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <Plane className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-700">{flight.airline}</span>
                          {flight.route && <span className="text-slate-500 ml-1">• {flight.route}</span>}
                          {flight.layover && <div className="text-[10px] text-slate-400 mt-0.5 bg-slate-50 inline-block px-1.5 rounded">Layover: {flight.layover}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {trip.transportation && (
                  <div className="text-xs text-slate-600 flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Train className="h-3.5 w-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="leading-relaxed line-clamp-3">{trip.transportation}</p>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripsDashboard;
