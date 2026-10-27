import { useEffect, useState } from 'react';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase-config';
import { sortOrderItems } from '../utils/bulkOrders';

async function loadOrderItems(order) {
  const items = collection(db, 'Nota');
  const linked = getDocs(query(items, where('idNota', '==', order.id)));
  // Older orders and split products can lack idNota. Merge both schemas,
  // discarding rows explicitly linked to a different order.
  const legacy = order.nomeC && order.data
    ? getDocs(query(items, where('nomeC', '==', order.nomeC), where('dataC', '==', order.data)))
    : Promise.resolve({ docs: [] });
  const snapshots = await Promise.all([linked, legacy]);
  const uniqueItems = new Map();
  snapshots.forEach((snapshot) => snapshot.docs.forEach((entry) => {
    const item = { ...entry.data(), id: entry.id };
    if (!item.idNota || item.idNota === order.id) uniqueItems.set(item.id, item);
  }));
  return sortOrderItems([...uniqueItems.values()]);
}

export default function useBulkOrders(date, scaletta) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let request = 0;
    setLoading(true);
    setError(null);
    setOrders([]);

    // Sort locally so legacy rows without createdAt/scalettaOrdine also appear,
    // and the query does not require a custom composite index.
    const ordersQuery = query(collection(db, 'addNota'),
      where(scaletta ? 'scalettaData' : 'data', '==', date));
    const unsubscribe = onSnapshot(ordersQuery, async (snapshot) => {
      if (!active) return;
      const current = ++request;
      setLoading(true);
      setError(null);
      try {
        const selected = snapshot.docs.map((entry) => ({ ...entry.data(), id: entry.id }))
          .filter((order) => !scaletta || order.scaletta === true);
        selected.sort((a, b) =>
          (scaletta ? Number(a.scalettaOrdine || 0) - Number(b.scalettaOrdine || 0) : 0) ||
          (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0) || a.id.localeCompare(b.id)
        );
        const loaded = await Promise.all(selected.map(async (order) => ({
          ...order, prodotti: await loadOrderItems(order),
        })));
        if (!active || current !== request) return;
        setOrders(loaded);
        setLoading(false);
      } catch (failure) {
        if (!active || current !== request) return;
        setError(failure);
        setLoading(false);
      }
    }, (failure) => {
      if (!active) return;
      request++;
      setError(failure);
      setLoading(false);
    });

    return () => { active = false; request++; unsubscribe(); };
  }, [date, scaletta, attempt]);

  return { orders, loading, error, retry: () => setAttempt((value) => value + 1) };
}
