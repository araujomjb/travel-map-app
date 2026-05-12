import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, CheckCircle, Heart, XCircle, Landmark, Beer, Dog, Users, Globe, LogOut, User as UserIcon, BarChart2, Map as MapIcon, Flame, TrendingUp, Trophy } from 'lucide-react';
import { CATEGORIES } from '../hooks/useCountryState';
import { fetchCountryData } from '../data/countryFacts';
import { auth } from '../lib/firebase';
import worldData from "../data/world-110m.json";
import { feature } from "topojson-client";

const Sidebar = ({ selectedCountry, onCountryClick, setCategory, countries, counts, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [facts, setFacts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // 'map' or 'stats'

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
      setActiveTab('map');
      setLoading(true);
      fetchCountryData(selectedCountry.id, selectedCountry.name).then(data => {
        setFacts(data);
        setLoading(false);
      });
    }
  }, [selectedCountry]);

  const handleSignOut = () => {
    auth.signOut();
  };

  // Percentile calculation: Logarithmic curve to simulate global ranking
  // 0 countries = 0th, 1 = 30th, 5 = 60th, 20 = 95th, 50 = 99th
  const calculatePercentile = (count) => {
    if (count === 0) return 0;
    const percentile = 100 * (1 - Math.exp(-0.15 * count));
    return Math.min(Math.round(percentile), 99);
  };

  const percentile = calculatePercentile(counts[CATEGORIES.VISITED]);

  return (
    <div className="w-full md:w-80 h-[40vh] md:h-full bg-white border-t md:border-t-0 md:border-r border-slate-200 flex flex-col p-6 shadow-sm overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-0.5 tracking-tight">Traveler</h1>
          <p className="text-slate-400 text-[11px] font-medium uppercase tracking-widest">Global Atlas</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      {/* User Profile */}
      <div className="mb-6 p-3 bg-slate-900 rounded-2xl flex items-center gap-3 shadow-md border border-slate-800">
        <div className="p-2 bg-slate-800 rounded-xl text-white">
          <UserIcon className="h-4 w-4" />
        </div>
        <div className="overflow-hidden">
          <div className="text-white text-xs font-bold truncate">{user?.displayName || (user?.isAnonymous ? 'Guest Explorer' : user?.email.split('@')[0])}</div>
          <div className="text-slate-400 text-[10px] truncate">{user?.email || 'Temporary Session'}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
        <button 
          onClick={() => setActiveTab('map')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'map' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
        >
          <MapIcon className="h-3.5 w-3.5" />
          Map
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'stats' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
        >
          <BarChart2 className="h-3.5 w-3.5" />
          Stats
        </button>
      </div>

      {activeTab === 'map' ? (
        <>
          <div className="flex gap-3 mb-6">
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
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <h2 className="text-lg font-bold text-slate-800">{selectedCountry.name}</h2>
                  </div>
                  {facts?.flag && (
                    <img src={facts.flag} alt={`${selectedCountry.name} flag`} className="h-4 w-6 rounded-sm shadow-sm object-cover" />
                  )}
                </div>

                {/* Popularity indicator */}
                {!loading && facts?.popularity > 0 && (
                  <div className="flex items-center gap-1.5 mb-4 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full w-fit">
                    <Flame className="h-3 w-3" />
                    {facts.popularity} {facts.popularity === 1 ? 'person wants' : 'people want'} to visit
                  </div>
                )}

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
        </>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
             <Trophy className="absolute -bottom-2 -right-2 h-20 w-20 text-white/10 rotate-12" />
             <div className="relative z-10">
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Travel Rank</div>
                <div className="text-4xl font-bold mb-1">{percentile < 1 ? 'Beginner' : percentile < 50 ? 'Explorer' : percentile < 80 ? 'Globetrotter' : 'World Citizen'}</div>
                <p className="text-slate-400 text-xs">You've visited more countries than <span className="text-white font-bold">{percentile}%</span> of the global population.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl text-green-600">
                   <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">World Coverage</div>
                   <div className="text-lg font-bold text-slate-800">{((counts[CATEGORIES.VISITED] / 195) * 100).toFixed(1)}%</div>
                </div>
             </div>

             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                   <Globe className="h-5 w-5" />
                </div>
                <div>
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">Countries to See</div>
                   <div className="text-lg font-bold text-slate-800">{195 - counts[CATEGORIES.VISITED]} left</div>
                </div>
             </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
             <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-1">
                <Flame className="h-4 w-4" />
                Travel Tip
             </div>
             <p className="text-amber-800/80 text-[11px] leading-relaxed italic">
                {counts[CATEGORIES.VISITED] < 5 
                  ? "Start with neighboring countries! It's the easiest way to grow your map."
                  : "Try a different continent! Experiencing diverse cultures is what makes a true World Citizen."}
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
