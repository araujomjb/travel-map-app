import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export function useCommunityData() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'public_itineraries'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const communityTrips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrips(communityTrips);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching community data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { trips, loading };
}
