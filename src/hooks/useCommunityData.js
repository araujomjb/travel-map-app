import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';

export function useCommunityData(followingIds = []) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We'll use a single query for global, and filter locally for following
    // because Firestore 'in' queries have limits and require complex indexing.
    // For a more robust app, we'd have a separate 'following' query logic.
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

  // Compute following trips locally
  const followingTrips = trips.filter(trip => followingIds.includes(trip.userId));

  return { trips, followingTrips, loading };
}
