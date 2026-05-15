import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import Auth from './components/Auth';
import TripsDashboard from './components/TripsDashboard';
import { useCountryState } from './hooks/useCountryState';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Menu, Search, BarChart2, CheckCircle, 
  Heart, X, MapPin, Plane, FileText, Globe, 
  Loader2 
} from 'lucide-react';
import { CATEGORIES } from './hooks/useCountryState';
import ItineraryModal from './components/ItineraryModal';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);
  const [itineraryToEdit, setItineraryToEdit] = useState(null);
  const [activeTab, setActiveTab] = useState('map'); 
  
  const { countries, setCategory, counts, loading: dataLoading, itineraries, saveItinerary, deleteItinerary } = useCountryState(user?.uid);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    setActiveTab('map'); 
    if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
  };

  const openItineraryModal = (tripData = null) => {
    setItineraryToEdit(tripData);
    setIsItineraryModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
             <div className="h-16 w-16 border-4 border-muted rounded-full"></div>
             <div className="absolute inset-0 h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
             <Plane className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold tracking-tight">Eu fui</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Preparing your atlas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const currentCategory = selectedCountry ? countries[selectedCountry.id] : null;

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-background relative selection:bg-primary/10">
      <Sidebar 
        selectedCountry={selectedCountry}
        onCountryClick={handleCountryClick}
        setCategory={setCategory}
        countries={countries}
        counts={counts}
        user={user}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        itineraries={itineraries}
        onOpenItinerary={openItineraryModal}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />
      
      <main className="flex-1 h-full w-full p-2 md:p-4 flex items-center justify-center relative z-0 overflow-hidden">
        {dataLoading && (
          <div className="absolute inset-0 z-[100] bg-background/40 backdrop-blur-xs flex items-center justify-center transition-all duration-300">
             <div className="bg-background/80 p-4 rounded-2xl shadow-xl border border-border/50 flex items-center gap-3">
               <Loader2 className="h-4 w-4 text-primary animate-spin" />
               <span className="text-xs font-bold uppercase tracking-widest">Updating Atlas</span>
             </div>
          </div>
        )}
        
        {activeTab === 'trips' ? (
          <div className="w-full h-full bg-background rounded-3xl shadow-2xl shadow-primary/5 border border-border/50 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
             <TripsDashboard 
                itineraries={itineraries} 
                onEdit={(countryId, tripData) => {
                  setSelectedCountry({ id: countryId, name: tripData.countryName });
                  openItineraryModal(tripData);
                }} 
                onDelete={deleteItinerary} 
             />
          </div>
        ) : (
          <div className="w-full h-full relative">
            <Map 
              countries={countries}
              selectedCountry={selectedCountry}
              onCountryClick={handleCountryClick}
            />
          </div>
        )}

        {/* Mobile Quick Action Card */}
        {selectedCountry && !isMobileSidebarOpen && (
          <Card className="md:hidden fixed bottom-24 left-4 right-4 z-40 p-4 rounded-3xl shadow-2xl border-border/40 animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-bold text-sm">{selectedCountry.name}</h3>
              </div>
              <Button variant="ghost" size="icon-xs" onClick={() => setSelectedCountry(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setCategory(selectedCountry.id, CATEGORIES.VISITED)}
                variant={currentCategory === CATEGORIES.VISITED ? "default" : "secondary"}
                className={`flex-1 h-11 rounded-xl text-xs font-bold ${currentCategory === CATEGORIES.VISITED ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Visited
              </Button>
              <Button
                onClick={() => setCategory(selectedCountry.id, CATEGORIES.WANT_TO_VISIT)}
                variant={currentCategory === CATEGORIES.WANT_TO_VISIT ? "default" : "secondary"}
                className={`flex-1 h-11 rounded-xl text-xs font-bold ${currentCategory === CATEGORIES.WANT_TO_VISIT ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              >
                <Heart className="h-4 w-4 mr-2" />
                Want
              </Button>
            </div>

            {currentCategory === CATEGORIES.VISITED && (
              <Button
                variant="outline"
                onClick={() => openItineraryModal()}
                className="w-full mt-2 h-11 rounded-xl text-xs font-bold border-dashed border-primary/40 text-primary hover:bg-primary/5"
              >
                <Plane className="h-4 w-4 mr-2" /> Add Trip Journal
              </Button>
            )}
          </Card>
        )}

        {/* Floating Action Button for Mobile */}
        <Button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-30 h-14 px-8 rounded-full shadow-2xl shadow-primary/20 flex items-center gap-3 active:scale-95 transition-all"
        >
          <Search className="h-4 w-4" />
          <span className="text-sm font-bold tracking-tight">Explorer</span>
          <Separator orientation="vertical" className="h-4 bg-primary-foreground/20 mx-1" />
          <BarChart2 className="h-4 w-4" />
        </Button>
      </main>

      <ItineraryModal 
        isOpen={isItineraryModalOpen}
        onClose={() => setIsItineraryModalOpen(false)}
        countryName={selectedCountry?.name}
        existingData={itineraryToEdit}
        onSave={(data) => {
          if (selectedCountry) {
            saveItinerary(selectedCountry.id, data);
          }
        }}
      />
    </div>
  );
}

export default App;
