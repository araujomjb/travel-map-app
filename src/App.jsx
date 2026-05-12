import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import { useCountryState } from './hooks/useCountryState';

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const { countries, setCategory, counts } = useCountryState();

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
  };

  return (
    <div className="flex flex-col-reverse md:flex-row h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar 
        selectedCountry={selectedCountry}
        onCountryClick={handleCountryClick}
        setCategory={setCategory}
        countries={countries}
        counts={counts}
      />
      <main className="flex-1 p-2 md:p-6 flex items-center justify-center">
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
