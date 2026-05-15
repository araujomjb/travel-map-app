import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Plane, MapPin, Train, Tag, Coins, Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const ItineraryModal = ({ isOpen, onClose, countryName, existingData, onSave }) => {
  const [name, setName] = useState('');
  const [cities, setCities] = useState('');
  const [transportation, setTransportation] = useState('');
  const [flights, setFlights] = useState([]);
  const [cost, setCost] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(existingData?.name || '');
      setCities(existingData?.cities ? existingData.cities.join(', ') : '');
      setTransportation(existingData?.transportation || '');
      setFlights(existingData?.flights || []);
      setCost(existingData?.cost || '');
      setIsPublic(existingData?.isPublic || false);
    }
  }, [isOpen, existingData]);

  const handleAddFlight = () => {
    setFlights([...flights, { airline: '', route: '', layover: '' }]);
  };

  const handleFlightChange = (index, field, value) => {
    const newFlights = [...flights];
    newFlights[index][field] = value;
    setFlights(newFlights);
  };

  const handleRemoveFlight = (index) => {
    const newFlights = [...flights];
    newFlights.splice(index, 1);
    setFlights(newFlights);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanCities = cities.split(',').map(c => c.trim()).filter(c => c !== '');
    
    // Filter out completely empty flight entries
    const cleanFlights = flights.filter(f => f.airline.trim() || f.route.trim() || f.layover.trim());

    onSave({
      id: existingData?.id,
      name: name.trim() || 'My Trip',
      cities: cleanCities,
      transportation: transportation.trim(),
      flights: cleanFlights,
      cost: cost.trim(),
      isPublic
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 border-b bg-muted/30">
          <DialogTitle className="text-xl font-bold">
            {existingData ? 'Edit Trip' : 'New Trip'}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1 mt-1 font-medium">
            <MapPin className="h-3 w-3" /> {countryName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="itinerary-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="space-y-0.5">
                <Label htmlFor="public-share" className="text-sm font-bold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" /> Share with Community
                </Label>
                <p className="text-[10px] text-muted-foreground">Make this trip visible to everyone in the global feed.</p>
              </div>
              <Switch 
                id="public-share" 
                checked={isPublic} 
                onCheckedChange={setIsPublic} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trip-name">
                  <Tag className="h-4 w-4 text-orange-500" />
                  Trip Name
                </Label>
                <Input
                  id="trip-name"
                  placeholder="e.g. Sister Trip 2025"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total-cost">
                  <Coins className="h-4 w-4 text-green-500" />
                  Total Cost
                </Label>
                <Input
                  id="total-cost"
                  placeholder="e.g. $1200 or €800"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-2">
              <Label htmlFor="cities-visited">
                <MapPin className="h-4 w-4 text-emerald-500" />
                Cities Visited
              </Label>
              <Input
                id="cities-visited"
                placeholder="e.g. Lisbon, Porto, Faro"
                value={cities}
                onChange={(e) => setCities(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">Separate cities with commas.</p>
            </div>

            <hr className="border-border" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>
                  <Plane className="h-4 w-4 text-blue-500" />
                  Flight Details
                </Label>
                <Button 
                  type="button" 
                  variant="secondary"
                  size="sm"
                  onClick={handleAddFlight}
                  className="h-7 text-[11px] font-bold"
                >
                  <Plus className="h-3 w-3" /> Add Flight
                </Button>
              </div>

              {flights.length === 0 && (
                <div className="text-center py-4 bg-muted/30 rounded-xl border border-dashed text-muted-foreground text-xs">
                  No flights added yet.
                </div>
              )}

              {flights.map((flight, index) => (
                <div key={index} className="bg-muted/30 border p-4 rounded-xl relative group">
                  <Button 
                    type="button" 
                    variant="outline"
                    size="icon-xs"
                    onClick={() => handleRemoveFlight(index)}
                    className="absolute -top-2 -right-2 bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Airline</Label>
                      <Input
                        placeholder="e.g. TAP Air Portugal"
                        className="h-7 text-xs bg-background"
                        value={flight.airline}
                        onChange={(e) => handleFlightChange(index, 'airline', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Route</Label>
                      <Input
                        placeholder="e.g. JFK -> LIS"
                        className="h-7 text-xs bg-background"
                        value={flight.route}
                        onChange={(e) => handleFlightChange(index, 'route', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Layover (Optional)</Label>
                    <Input
                      placeholder="e.g. 2 hours in Madrid (MAD)"
                      className="h-7 text-xs bg-background"
                      value={flight.layover}
                      onChange={(e) => handleFlightChange(index, 'layover', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-border" />

            <div className="space-y-2">
              <Label htmlFor="transportation">
                <Train className="h-4 w-4 text-purple-500" />
                Local Transportation & Notes
              </Label>
              <Textarea
                id="transportation"
                placeholder="How did you get around? e.g. Took the Alfa Pendular train from Lisbon to Porto. Rented a car in Faro."
                className="resize-none min-h-24"
                value={transportation}
                onChange={(e) => setTransportation(e.target.value)}
              />
            </div>
          </form>
        </div>

        <DialogFooter className="p-4 bg-muted/30 border-t flex-row justify-end gap-2">
          <Button 
            type="button" 
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="itinerary-form"
            className="shadow-md"
          >
            <Save className="h-4 w-4" /> Save Itinerary
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItineraryModal;
