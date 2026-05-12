import React, { useState, useMemo } from 'react';
import { Search, MapPin, CheckCircle, Heart, XCircle } from 'lucide-react';
import { CATEGORIES } from '../hooks/useCountryState';
import worldData from "../data/world-110m.json";
import { feature } from "topojson-client";

const Sidebar = ({ selectedCountry, onCountryClick, setCategory, countries, counts }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Extract all country names from the TopoJSON for searching
  const allCountries = useMemo(() => {
    const countriesFeature = feature(worldData, worldData.objects.countries).features;
    return countriesFeature.map(f => ({
      id: f.id || f.properties.ISO_A3 || f.properties.name,
      name: f.properties.name
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredCountries = searchTerm.length > 1
    ? allCountries.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const currentCategory = selectedCountry ? countries[selectedCountry.id] : null;

  return (
    <div className="w-80 h-full bg-white border-r border-slate-200 flex flex-col p-6 shadow-sm overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Traveler</h1>
        <p className="text-slate-500 text-sm">Your personal world map</p>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="text-2xl font-bold text-green-500">{counts[CATEGORIES.VISITED]}</div>
          <div className="text-xs text-slate-500 uppercase font-semibold">Visited</div>
        </div>
        <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="text-2xl font-bold text-blue-500">{counts[CATEGORIES.WANT_TO_VISIT]}</div>
          <div className="text-xs text-slate-500 uppercase font-semibold">Want to Visit</div>
        </div>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
          placeholder="Search country..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {filteredCountries.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {filteredCountries.map(c => (
              <button
                key={c.id}
                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                onClick={() => {
                  onCountryClick(c);
                  setSearchTerm('');
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto">
        {selectedCountry ? (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-800">{selectedCountry.name}</h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setCategory(selectedCountry.id, CATEGORIES.VISITED)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                  currentCategory === CATEGORIES.VISITED
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-green-50 border border-slate-100'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                Visited
              </button>
              <button
                onClick={() => setCategory(selectedCountry.id, CATEGORIES.WANT_TO_VISIT)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                  currentCategory === CATEGORIES.WANT_TO_VISIT
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-100'
                }`}
              >
                <Heart className="h-4 w-4" />
                Want to Visit
              </button>
              {currentCategory && (
                <button
                  onClick={() => setCategory(selectedCountry.id, CATEGORIES.NONE)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Clear Category
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 px-4 border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-slate-400 text-sm">Select a country on the map to categorize it.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
