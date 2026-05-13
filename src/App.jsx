import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import Auth from './components/Auth';
import { useCountryState } from './hooks/useCountryState';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Menu, Search, BarChart2, CheckCircle, Heart, X } from 'lucide-react';
import { CATEGORIES } from './hooks/useCountryState';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const { countries, setCategory, counts, loading: dataLoading } = useCountryState(user?.uid);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    // If selected via search/click on map, we might want to close sidebar on mobile to show the map
    if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading your map...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const currentCategory = selectedCountry ? countries[selectedCountry.id] : null;

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-50 relative">
      <Sidebar 
        selectedCountry={selectedCountry}
        onCountryClick={handleCountryClick}
        setCategory={setCategory}
        countries={countries}
        counts={counts}
        user={user}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      
      <main className="flex-1 h-full w-full p-2 md:p-6 flex items-center justify-center relative z-0">
        {dataLoading && (
          <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none transition-opacity duration-300">
             <div className="h-10 w-10 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin shadow-sm"></div>
          </div>
        )}
        <Map 
          countries={countries}
          selectedCountry={selectedCountry}
          onCountryClick={handleCountryClick}
        />

        {/* Mobile Quick Action Card */}
        {selectedCountry && !isMobileSidebarOpen && (
          <div className="md:hidden fixed bottom-24 left-4 right-4 z-40 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <h3 className="font-bold text-slate-800 text-sm">{selectedCountry.name}</h3>
              </div>
              <button onClick={() => setSelectedCountry(null)} className="p-1 text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCategory(selectedCountry.id, CATEGORIES.VISITED)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentCategory === CATEGORIES.VISITED
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-50 text-slate-600 border border-slate-100'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                Visited
              </button>
              <button
                onClick={() => setCategory(selectedCountry.id, CATEGORIES.WANT_TO_VISIT)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentCategory === CATEGORIES.WANT_TO_VISIT
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-50 text-slate-600 border border-slate-100'
                }`}
              >
                <Heart className="h-4 w-4" />
                Want
              </button>
            </div>
          </div>
        )}

        {/* Floating Action Button for Mobile */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-30 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 active:scale-95 transition-all border border-slate-700"
        >
          <Search className="h-4 w-4" />
          <span className="text-sm font-bold tracking-tight">Search & Stats</span>
          <div className="h-4 w-px bg-slate-700 mx-1"></div>
          <BarChart2 className="h-4 w-4" />
        </button>
      </main>
    </div>
  );
}

export default App;
