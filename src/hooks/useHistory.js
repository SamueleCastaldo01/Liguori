import { useEffect, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase-config';

const PAGE_SIZE = 150;

export default function useHistory(collectionName, enabled) {
  const [entries, setEntries] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    setLoading(true);
    setError(null);

    // Expand the live window to keep new movements ordered without gaps or
    // duplicates between pages. The extra document detects older entries.
    const historyQuery = query(
      collection(db, collectionName),
      orderBy('createdAt', 'desc'),
      limit(visibleCount + 1)
    );
    const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
      if (!active) return;
      setEntries(snapshot.docs.slice(0, visibleCount).map((entry) => ({
        ...entry.data(), id: entry.id,
      })));
      setHasMore(snapshot.docs.length > visibleCount);
      setLoading(false);
    }, (failure) => {
      if (!active) return;
      setError(failure);
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [collectionName, enabled, visibleCount, attempt]);

  const loadMore = () => {
    if (loading || !hasMore || error) return;
    setLoading(true);
    setVisibleCount((count) => count + PAGE_SIZE);
  };

  const retry = () => {
    setLoading(true);
    setAttempt((count) => count + 1);
  };

  return { entries, hasMore, loading, error, loadMore, retry };
}
