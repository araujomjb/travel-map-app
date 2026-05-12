import { useState, useEffect } from 'react';

const STORAGE_KEY = 'travel_map_data';

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

export function useCountryState() {
  const [countries, setCountries] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(countries));
  }, [countries]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        setCountries(e.newValue ? JSON.parse(e.newValue) : {});
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setCategory = (countryId, category) => {
    setCountries(prev => {
      if (category === CATEGORIES.NONE) {
        const next = { ...prev };
        delete next[countryId];
        return next;
      }
      return {
        ...prev,
        [countryId]: category
      };
    });
  };

  const counts = {
    [CATEGORIES.VISITED]: Object.values(countries).filter(c => c === CATEGORIES.VISITED).length,
    [CATEGORIES.WANT_TO_VISIT]: Object.values(countries).filter(c => c === CATEGORIES.WANT_TO_VISIT).length
  };

  return { countries, setCategory, counts };
}
