import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, MapPin, CheckCircle, Heart, XCircle, Landmark, 
  Beer, Dog, Users, Globe, LogOut, User as UserIcon, 
  BarChart2, Map as MapIcon, Flame, TrendingUp, Trophy, 
  X, Plane, FileText, Plus, Train, ChevronRight, Settings,
  MessageSquare
} from 'lucide-react';
import { CATEGORIES } from '../hooks/useCountryState';
import { fetchCountryData } from '../data/countryFacts';
import { auth } from '../lib/firebase';
import worldData from "../data/world-50m.json";
import { feature } from "topojson-client";
import { useCommunityData } from '../hooks/useCommunityData';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Sidebar = ({ selectedCountry, onCountryClick, setCategory, countries, counts, user, isOpen, onClose, itineraries, onOpenItinerary, activeTab, setActiveTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [facts, setFacts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTripTab, setActiveTripTab] = useState('overview');
  const { trips: communityTrips, loading: communityLoading } = useCommunityData();

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
  const currentItineraries = selectedCountry ? itineraries?.[selectedCountry.id] || [] : [];

  useEffect(() => {
    if (selectedCountry) {
      setActiveTripTab('overview');
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

  const calculatePercentile = (count) => {
    if (count === 0) return 0;
    const percentile = 100 * (1 - Math.exp(-0.15 * count));
    return Math.min(Math.round(percentile), 99);
  };

  const percentile = calculatePercentile(counts[CATEGORIES.VISITED]);

  return (
    <div className={`
      fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out bg-background flex flex-col border-r border-border
      md:relative md:translate-x-0 md:w-80 md:h-full md:z-10
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      {/* Sidebar Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Globe className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Eu fui</h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Atlas</p>
          </div>
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Explore</p>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 h-9 p-1 bg-muted/50">
                <TabsTrigger value="map" className="text-[10px] font-bold">Map</TabsTrigger>
                <TabsTrigger value="stats" className="text-[10px] font-bold">Stats</TabsTrigger>
                <TabsTrigger value="community" className="text-[10px] font-bold px-0">Feed</TabsTrigger>
                <TabsTrigger value="trips" className="text-[10px] font-bold px-0">Trips</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Separator className="bg-border/40" />

          {activeTab === 'map' ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 px-1">
                <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-center">
                  <div className="text-xl font-bold text-green-600">{counts[CATEGORIES.VISITED]}</div>
                  <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Visited</div>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-center">
                  <div className="text-xl font-bold text-blue-600">{counts[CATEGORIES.WANT_TO_VISIT]}</div>
                  <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Wants</div>
                </div>
              </div>

              {/* Search Section */}
              <div className="space-y-2">
                <p className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Search</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    className="pl-9 h-9 text-xs bg-muted/30 border-none shadow-none focus-visible:ring-1"
                    placeholder="Find a country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {filteredCountries.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredCountries.map(c => (
                        <button
                          key={c.id}
                          className="w-full text-left px-3 py-2 text-[11px] hover:bg-muted transition-colors flex items-center justify-between group"
                          onClick={() => {
                            onCountryClick(c);
                            setSearchTerm('');
                          }}
                        >
                          <span>{c.name}</span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selection Content */}
              <div className="space-y-4">
                <p className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Details</p>
                {selectedCountry ? (
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <MapPin className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-bold truncate">{selectedCountry.name}</h2>
                      </div>
                      {facts?.flag && (
                        <img src={facts.flag} alt="" className="h-3.5 w-5 rounded-sm shadow-sm" />
                      )}
                    </div>

                    {!loading && facts?.popularity > 0 && (
                      <Badge variant="secondary" className="mb-4 text-[9px] font-bold h-5 bg-orange-500/10 text-orange-600 border-none">
                        <Flame className="h-2.5 w-2.5 mr-1" />
                        {facts.popularity} {facts.popularity === 1 ? 'wish' : 'wishes'}
                      </Badge>
                    )}

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <Button
                        onClick={() => setCategory(selectedCountry.id, CATEGORIES.VISITED)}
                        size="sm"
                        variant={currentCategory === CATEGORIES.VISITED ? "default" : "outline"}
                        className={`h-12 flex-col gap-1 rounded-lg text-[10px] font-bold ${currentCategory === CATEGORIES.VISITED ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Visited
                      </Button>
                      <Button
                        onClick={() => setCategory(selectedCountry.id, CATEGORIES.WANT_TO_VISIT)}
                        size="sm"
                        variant={currentCategory === CATEGORIES.WANT_TO_VISIT ? "default" : "outline"}
                        className={`h-12 flex-col gap-1 rounded-lg text-[10px] font-bold ${currentCategory === CATEGORIES.WANT_TO_VISIT ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      >
                        <Heart className="h-3.5 w-3.5" />
                        Want
                      </Button>
                    </div>

                    <Separator className="my-4 bg-border/40" />

                    {/* Trip Tabs (only if visited) */}
                    {currentCategory === CATEGORIES.VISITED && (
                       <div className="flex gap-1 overflow-x-auto pb-2 mb-2 no-scrollbar">
                         <Button 
                           variant={activeTripTab === 'overview' ? "secondary" : "ghost"} 
                           size="xs" 
                           onClick={() => setActiveTripTab('overview')}
                           className="text-[9px] h-6 px-2 font-bold uppercase shrink-0"
                         >
                           Overview
                         </Button>
                         {currentItineraries.map(trip => (
                           <Button 
                             key={trip.id} 
                             variant={activeTripTab === trip.id ? "secondary" : "ghost"} 
                             size="xs" 
                             onClick={() => setActiveTripTab(trip.id)}
                             className="text-[9px] h-6 px-2 font-bold uppercase shrink-0"
                           >
                             {trip.name}
                           </Button>
                         ))}
                         <Button variant="ghost" size="xs" onClick={() => onOpenItinerary()} className="text-[9px] h-6 px-2 text-muted-foreground border border-dashed border-muted-foreground/30 shrink-0">
                           <Plus className="h-2.5 w-2.5 mr-1" /> ADD
                         </Button>
                       </div>
                    )}

                    {/* Tab Content */}
                    <div className="animate-in fade-in duration-200">
                      {activeTripTab === 'overview' || currentCategory !== CATEGORIES.VISITED ? (
                        <div className="space-y-3 pt-1">
                          {loading ? (
                            <div className="space-y-2 py-4 animate-pulse">
                              <div className="h-2 bg-muted rounded w-3/4"></div>
                              <div className="h-2 bg-muted rounded w-1/2"></div>
                            </div>
                          ) : facts && (
                            <div className="grid grid-cols-1 gap-2.5">
                              {[
                                { label: 'Capital', value: facts.capital, icon: Landmark, color: 'text-amber-500' },
                                { label: 'Region', value: facts.region, icon: Globe, color: 'text-blue-500' },
                                { label: 'Drink', value: facts.drink, icon: Beer, color: 'text-purple-500' }
                              ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <div className={`p-1.5 rounded-md bg-white border border-border/50 ${item.color}`}>
                                    <item.icon className="h-3 w-3" />
                                  </div>
                                  <div>
                                    <p className="text-[8px] font-bold text-muted-foreground uppercase leading-none mb-0.5">{item.label}</p>
                                    <p className="text-[11px] font-semibold text-foreground leading-none">{item.value}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {currentCategory !== CATEGORIES.VISITED && currentCategory && (
                            <Button variant="ghost" onClick={() => setCategory(selectedCountry.id, CATEGORIES.NONE)} className="w-full text-[9px] font-bold text-muted-foreground hover:text-destructive h-7 mt-2">
                              <XCircle className="h-3 w-3 mr-1" /> RESET SELECTION
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="pt-1">
                          {(() => {
                            const trip = currentItineraries.find(t => t.id === activeTripTab);
                            if (!trip) return null;
                            return (
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                   <p className="text-[11px] font-bold">{trip.name}</p>
                                   <Button variant="ghost" size="xs" onClick={() => onOpenItinerary(trip)} className="h-5 px-1.5 text-[9px] font-bold text-primary">EDIT</Button>
                                </div>
                                {trip.cities?.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {trip.cities.map((city, i) => (
                                      <Badge key={i} variant="outline" className="text-[9px] font-medium px-1.5 py-0 bg-white">{city}</Badge>
                                    ))}
                                  </div>
                                )}
                                <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3 bg-white/50 p-2 rounded-lg border border-border/20 italic">
                                  {trip.transportation || "No notes added yet."}
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 px-4 bg-muted/20 border-2 border-dashed border-border/50 rounded-2xl">
                    <Globe className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-[11px] font-medium leading-relaxed">Select a country on the map to explore facts and log your trips.</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'stats' ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="bg-primary p-5 rounded-2xl text-primary-foreground shadow-lg relative overflow-hidden group">
                  <Trophy className="absolute -bottom-2 -right-2 h-20 w-20 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                  <div className="relative z-10">
                     <p className="text-[9px] uppercase tracking-widest font-bold opacity-60 mb-1">Travel Rank</p>
                     <p className="text-2xl font-bold mb-1">{percentile < 1 ? 'Beginner' : percentile < 50 ? 'Explorer' : percentile < 80 ? 'Globetrotter' : 'World Citizen'}</p>
                     <p className="text-[10px] opacity-80 leading-snug font-medium">Top <span className="text-white font-bold">{100-percentile}%</span> of explorers globally.</p>
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Metrics</p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      { label: 'Coverage', value: `${((counts[CATEGORIES.VISITED] / 195) * 100).toFixed(1)}%`, icon: TrendingUp, bg: 'bg-green-500/10', text: 'text-green-600' },
                      { label: 'Remaining', value: `${195 - counts[CATEGORIES.VISITED]}`, icon: Globe, bg: 'bg-blue-500/10', text: 'text-blue-600' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                        <div className={`p-2 rounded-lg ${item.bg} ${item.text}`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">{item.label}</p>
                          <p className="text-base font-bold text-foreground leading-none">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          ) : activeTab === 'community' ? (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
               <p className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recent Discoveries</p>
               
               {communityLoading ? (
                 <div className="space-y-3">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="h-24 bg-muted animate-pulse rounded-xl"></div>
                   ))}
                 </div>
               ) : communityTrips.length === 0 ? (
                 <div className="text-center py-10 px-4 bg-muted/20 border-2 border-dashed border-border/50 rounded-2xl">
                   <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                   <p className="text-muted-foreground text-[10px] font-medium leading-relaxed">No public journeys yet. Be the first to share your adventure!</p>
                 </div>
               ) : (
                 <div className="space-y-3">
                   {communityTrips.map(trip => (
                     <Card key={trip.id} className="bg-muted/30 border-none shadow-none hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => onCountryClick({ id: trip.countryId, name: trip.countryName })}>
                       <CardHeader className="p-3 pb-0 space-y-0 flex-row items-center gap-3">
                          <Avatar className="h-7 w-7 border border-border shadow-sm">
                            <AvatarImage src={trip.userPhoto} />
                            <AvatarFallback className="text-[8px] bg-primary text-primary-foreground font-bold">
                              {trip.userName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                            <CardTitle className="text-[10px] font-bold truncate leading-none">{trip.userName}</CardTitle>
                            <p className="text-[9px] text-muted-foreground truncate font-medium">to {trip.countryName}</p>
                          </div>
                          <Badge className="text-[8px] h-4 bg-green-500/10 text-green-600 border-none px-1">
                            {trip.cost || "Free"}
                          </Badge>
                       </CardHeader>
                       <CardContent className="p-3 pt-2">
                          <p className="text-[10px] font-bold mb-1 line-clamp-1 group-hover:text-primary transition-colors">{trip.name}</p>
                          {trip.cities?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {trip.cities.slice(0, 2).map((c, i) => (
                                <Badge key={i} variant="outline" className="text-[7px] h-3.5 font-medium px-1 bg-white/50">{c}</Badge>
                              ))}
                              {trip.cities.length > 2 && <span className="text-[7px] text-muted-foreground">+{trip.cities.length - 2}</span>}
                            </div>
                          )}
                          <p className="text-[9px] text-muted-foreground italic line-clamp-2 leading-relaxed">
                            "{trip.transportation || "Exploring the world..."}"
                          </p>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               )}
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
               <div className="text-center py-10 px-4 bg-muted/20 border-2 border-dashed border-border/50 rounded-2xl">
                  <Plane className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-[11px] font-bold mb-1">Dashboard Active</p>
                  <p className="text-muted-foreground text-[10px] leading-relaxed">Your travel diaries are visible in the main panel.</p>
               </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Sidebar Footer - User Profile */}
      <div className="p-4 mt-auto border-t border-border/50 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-full h-14 flex items-center p-2 hover:bg-muted rounded-xl transition-all font-sans cursor-pointer group">
              <Avatar className="h-9 w-9 border-2 border-border shadow-sm shrink-0">
                <AvatarImage src={user?.photoURL} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 ml-3 text-left overflow-hidden">
                <p className="text-[11px] font-bold truncate leading-none mb-1 group-hover:text-primary transition-colors">{user?.displayName || 'Guest Explorer'}</p>
                <p className="text-[9px] text-muted-foreground truncate leading-none">{user?.email || 'Anonymous'}</p>
              </div>
              <ChevronRight className="h-3 w-3 text-muted-foreground ml-2 shrink-0" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl shadow-xl border-border/50">
            <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 py-3">Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg p-2.5 text-xs font-medium focus:bg-primary/10">
              <UserIcon className="h-3.5 w-3.5 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg p-2.5 text-xs font-medium focus:bg-primary/10">
              <Settings className="h-3.5 w-3.5 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="rounded-lg p-2.5 text-xs font-medium text-destructive focus:bg-destructive/10">
              <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Sidebar;
