import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, deleteField, updateDoc } from 'firebase/firestore';

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
  const [loading, setLoading] = useState(true);

  // Sync with Firestore
  useEffect(() => {
    if (!userId) {
      setCountries({});
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', userId);
    
    // Subscribe to changes
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setCountries(docSnap.data().countries || {});
      } else {
        setCountries({});
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching Firestore data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const setCategory = async (countryId, category) => {
    if (!userId) return;

    const docRef = doc(db, 'users', userId);
    
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

      // Update Firestore
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
    } catch (error) {
      console.error("Error updating Firestore:", error);
      // Revert on error if necessary (simple reload will also fix it)
    }
  };

  const counts = {
    [CATEGORIES.VISITED]: Object.values(countries).filter(c => c === CATEGORIES.VISITED).length,
    [CATEGORIES.WANT_TO_VISIT]: Object.values(countries).filter(c => c === CATEGORIES.WANT_TO_VISIT).length
  };

  return { countries, setCategory, counts, loading };
}
