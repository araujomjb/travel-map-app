import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import Auth from './components/Auth';
import { useCountryState } from './hooks/useCountryState';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  
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

  return (
    <div className="flex flex-col-reverse md:flex-row h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar 
        selectedCountry={selectedCountry}
        onCountryClick={handleCountryClick}
        setCategory={setCategory}
        countries={countries}
        counts={counts}
        user={user}
      />
      <main className="flex-1 p-2 md:p-6 flex items-center justify-center relative">
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
      </main>
    </div>
  );
}

export default App;
