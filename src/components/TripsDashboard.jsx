import React, { useMemo } from 'react';
import { MapPin, Plane, Train, Edit, Trash2, Calendar, Coins, ArrowRight, MoreVertical, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 p-6 animate-in fade-in duration-500">
        <div className="text-center max-w-sm">
          <div className="bg-background w-20 h-20 rounded-3xl shadow-sm border border-border flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Plane className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Start your journey</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Your travel diary is currently empty. Pin a country on the map and log your first itinerary to see it here.
          </p>
          <Button variant="outline" className="rounded-xl font-bold">
            Explore the Map
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full h-full bg-muted/20">
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">My Itineraries</h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" /> 
              Chronicles of {allTrips.length} journeys around the world.
            </p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="rounded-lg h-9 font-bold text-xs uppercase tracking-wider">Export PDF</Button>
             <Button size="sm" className="rounded-lg h-9 font-bold text-xs uppercase tracking-wider shadow-md">Add New</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allTrips.map(trip => (
            <Card key={trip.id} className="group relative bg-background border-border/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
              
              <CardHeader className="p-0">
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="space-y-1 overflow-hidden">
                       <CardTitle className="text-xl font-bold tracking-tight truncate leading-tight">{trip.name}</CardTitle>
                       <div className="flex items-center gap-1.5 text-muted-foreground">
                         <MapPin className="h-3.5 w-3.5 text-primary" />
                         <span className="text-xs font-semibold uppercase tracking-wider">{trip.countryName}</span>
                       </div>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <Button 
                        variant="secondary"
                        size="icon-xs"
                        onClick={() => onEdit(trip.countryId, trip)}
                        className="h-7 w-7 rounded-lg"
                        title="Edit Trip"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="secondary"
                        size="icon-xs"
                        onClick={() => handleDelete(trip.countryId, trip.id, trip.name)}
                        className="h-7 w-7 rounded-lg hover:bg-destructive hover:text-destructive-foreground"
                        title="Delete Trip"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {trip.cost && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[9px] font-bold bg-green-500/10 text-green-700 border-none">
                        <Coins className="h-2.5 w-2.5 mr-1" /> {trip.cost}
                      </Badge>
                    )}
                    {trip.cities?.slice(0, 3).map((city, i) => (
                      <Badge key={i} variant="outline" className="h-5 px-1.5 text-[9px] font-bold border-border/50 bg-muted/50">{city}</Badge>
                    ))}
                    {trip.cities?.length > 3 && (
                      <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-bold border-border/50 bg-muted/50">+{trip.cities.length - 3}</Badge>
                    )}
                  </div>
                </div>
                <Separator className="bg-border/40" />
              </CardHeader>

              <CardContent className="p-6 flex-1 space-y-5">
                {trip.flights && trip.flights.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Plane className="h-3 w-3" /> Flight Log
                    </p>
                    {trip.flights.map((flight, i) => (
                      <div key={i} className="relative pl-4 border-l-2 border-primary/20 space-y-0.5 py-0.5">
                        <div className="font-bold text-xs">{flight.airline}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          {flight.route || "Global Route"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {trip.transportation && (
                  <div className="space-y-2.5">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Train className="h-3 w-3" /> Transit & Notes
                    </p>
                    <div className="bg-muted/30 rounded-xl p-3 border border-border/30 italic text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                      "{trip.transportation}"
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-4 pt-0 mt-auto flex justify-end">
                 <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/5">
                   Full Details <ArrowRight className="h-3 w-3 ml-1.5" />
                 </Button>
              </CardFooter>

            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default TripsDashboard;
