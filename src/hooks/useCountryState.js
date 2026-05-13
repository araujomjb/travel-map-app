import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, deleteField, updateDoc, increment } from 'firebase/firestore';

export const CATEGORIES = {
  VISITED: 'visited',
  WANT_TO_VISIT: 'wantToVisit',
  NONE: 'none'
};

export const CATEGORY_COLORS = {
  [CATEGORIES.VISITED]: '#4ade80', // green-400
  [CATEGORIES.WANT_TO_VISIT]: '#60a5fa', // blue-400
  [CATEGORIES.NONE]: '#e5e7eb' // gray-200
};

export function useCountryState(userId) {
  const [countries, setCountries] = useState({});
  const [itineraries, setItineraries] = useState({});
  const [loading, setLoading] = useState(true);

  // Sync with Firestore
  useEffect(() => {
    if (!userId) {
      setCountries({});
      setItineraries({});
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', userId);
    
    // Subscribe to changes
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCountries(data.countries || {});
        
        // Ensure itineraries is always a map of arrays
        const rawItin = data.itineraries || {};
        const normalizedItin = {};
        for (const [cid, tripData] of Object.entries(rawItin)) {
          if (Array.isArray(tripData)) {
            normalizedItin[cid] = tripData;
          } else if (typeof tripData === 'object' && tripData !== null) {
            // Legacy single-object migration
            normalizedItin[cid] = [{ id: 'legacy-1', name: 'My Trip', ...tripData }];
          }
        }
        setItineraries(normalizedItin);
      } else {
        setCountries({});
        setItineraries({});
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching Firestore data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const saveItinerary = async (countryId, itineraryData) => {
    if (!userId) return;
    const docRef = doc(db, 'users', userId);
    
    // Ensure we have an ID for the itinerary
    const newItinData = { 
      ...itineraryData, 
      id: itineraryData.id || Date.now().toString(36) + Math.random().toString(36).substring(2)
    };
    
    try {
      // Optimistic update
      setItineraries(prev => {
        const currentArray = prev[countryId] || [];
        const index = currentArray.findIndex(i => i.id === newItinData.id);
        const newArray = [...currentArray];
        
        if (index >= 0) {
          newArray[index] = newItinData;
        } else {
          newArray.push(newItinData);
        }
        
        return {
          ...prev,
          [countryId]: newArray
        };
      });

      // Update Firestore (we read the latest from optimistic state)
      setItineraries(prev => {
        setDoc(docRef, {
          itineraries: {
            [countryId]: prev[countryId]
          }
        }, { merge: true });
        return prev;
      });
      
    } catch (error) {
      console.error("Error saving itinerary:", error);
    }
  };

  const setCategory = async (countryId, category) => {
    if (!userId) return;

    const docRef = doc(db, 'users', userId);
    const globalRef = doc(db, 'global', 'stats');
    const oldCategory = countries[countryId] || CATEGORIES.NONE;
    
    try {
      // Optimistic update
      setCountries(prev => {
        const next = { ...prev };
        if (category === CATEGORIES.NONE) {
          delete next[countryId];
        } else {
          next[countryId] = category;
        }
        return next;
      });

      // Update User Firestore
      if (category === CATEGORIES.NONE) {
        await updateDoc(docRef, {
          [`countries.${countryId}`]: deleteField()
        });
      } else {
        await setDoc(docRef, {
          countries: {
            [countryId]: category
          }
        }, { merge: true });
      }

      // Update Global Popularity Counter
      if (oldCategory === CATEGORIES.WANT_TO_VISIT && category !== CATEGORIES.WANT_TO_VISIT) {
        await setDoc(globalRef, {
          [`popularity.${countryId}`]: increment(-1)
        }, { merge: true });
      } else if (oldCategory !== CATEGORIES.WANT_TO_VISIT && category === CATEGORIES.WANT_TO_VISIT) {
        await setDoc(globalRef, {
          [`popularity.${countryId}`]: increment(1)
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error updating Firestore:", error);
    }
  };

  const counts = {
    [CATEGORIES.VISITED]: Object.values(countries).filter(c => c === CATEGORIES.VISITED).length,
    [CATEGORIES.WANT_TO_VISIT]: Object.values(countries).filter(c => c === CATEGORIES.WANT_TO_VISIT).length
  };

  return { countries, setCategory, counts, loading, itineraries, saveItinerary };
}
