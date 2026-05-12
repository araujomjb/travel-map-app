import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, CheckCircle, Heart, XCircle, Landmark, Beer, Dog, Users, Globe } from 'lucide-react';
import { CATEGORIES } from '../hooks/useCountryState';
import { fetchCountryData } from '../data/countryFacts';
import worldData from "../data/world-110m.json";
import { feature } from "topojson-client";

const Sidebar = ({ selectedCountry, onCountryClick, setCategory, countries, counts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [facts, setFacts] = useState(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (selectedCountry) {
      setLoading(true);
      fetchCountryData(selectedCountry.id, selectedCountry.name).then(data => {
        setFacts(data);
        setLoading(false);
      });
    } else {
      setFacts(null);
    }
  }, [selectedCountry]);

  return (
    <div className="w-full md:w-80 h-[40vh] md:h-full bg-white border-t md:border-t-0 md:border-r border-slate-200 flex flex-col p-6 shadow-sm overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Traveler</h1>
        <p className="text-slate-500 text-sm">Your personal world map</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="text-xl font-bold text-green-500">{counts[CATEGORIES.VISITED]}</div>
          <div className="text-[10px] text-slate-500 uppercase font-bold">Visited</div>
        </div>
        <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="text-xl font-bold text-blue-500">{counts[CATEGORIES.WANT_TO_VISIT]}</div>
          <div className="text-[10px] text-slate-500 uppercase font-bold">Want to Visit</div>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
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

      <div>
        {selectedCountry ? (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-800">{selectedCountry.name}</h2>
              </div>
              {facts?.flag && (
                <img src={facts.flag} alt={`${selectedCountry.name} flag`} className="h-4 w-6 rounded-sm shadow-sm object-cover" />
              )}
            </div>

            {/* Category Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                onClick={() => setCategory(selectedCountry.id, CATEGORIES.VISITED)}
                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-bold transition-all ${
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
                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-bold transition-all ${
                  currentCategory === CATEGORIES.WANT_TO_VISIT
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-100'
                }`}
              >
                <Heart className="h-4 w-4" />
                Want
              </button>
            </div>

            {/* Fun Facts Section */}
            {loading ? (
              <div className="space-y-4 py-10 animate-pulse flex flex-col items-center justify-center">
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
              </div>
            ) : facts && (
              <div className="space-y-4 pt-4 border-t border-slate-200/60">
                <div className="flex gap-3">
                  <div className="mt-1 p-1.5 bg-amber-50 rounded-lg text-amber-600">
                    <Landmark className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Capital</div>
                    <div className="text-sm font-semibold text-slate-700">{facts.capital}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1 p-1.5 bg-blue-50 rounded-lg text-blue-600">
                    <Globe className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Region</div>
                    <div className="text-sm font-semibold text-slate-700">{facts.region}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1 p-1.5 bg-slate-100 rounded-lg text-slate-600">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Population</div>
                    <div className="text-sm font-semibold text-slate-700">{facts.population}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1 p-1.5 bg-purple-50 rounded-lg text-purple-600">
                    <Beer className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Typical Drink</div>
                    <div className="text-sm font-semibold text-slate-700">{facts.drink}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1 p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                    <Dog className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Wild Animals</div>
                    <div className="text-sm font-semibold text-slate-700">{facts.animals}</div>
                  </div>
                </div>
              </div>
            )}

            {currentCategory && !loading && (
              <button
                onClick={() => setCategory(selectedCountry.id, CATEGORIES.NONE)}
                className="w-full mt-6 text-[10px] font-bold text-slate-400 hover:text-red-400 transition-colors uppercase tracking-tight flex items-center justify-center gap-1"
              >
                <XCircle className="h-3 w-3" />
                Clear Selection
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8 px-4 border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-slate-400 text-sm">Select a country on the map to see real-time data!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
