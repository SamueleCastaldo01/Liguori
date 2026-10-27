import { act, renderHook, waitFor } from '@testing-library/react';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import useBulkOrders from './useBulkOrders';

jest.mock('../firebase-config', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(), getDocs: jest.fn(), onSnapshot: jest.fn(), query: jest.fn(), where: jest.fn(),
}));

const entry = (id, data) => ({ id, data: () => data });
let listeners;
beforeEach(() => {
  listeners = [];
  collection.mockImplementation((db, name) => name);
  query.mockImplementation((...parts) => parts);
  where.mockImplementation((field, operator, value) => ({ field, value }));
  getDocs.mockResolvedValue({ docs: [] });
  onSnapshot.mockImplementation((query, next, error) => {
    const unsubscribe = jest.fn();
    listeners.push({ query, next, error, unsubscribe });
    return unsubscribe;
  });
});

test('merges legacy and linked products without duplicates or products from a different order', async () => {
  getDocs.mockImplementation(async (q) => ({ docs: q[1].field === 'idNota'
    ? [entry('new', { idNota: 'order-1', prodottoC: 'Nuovo' })]
    : [entry('new', { idNota: 'order-1', prodottoC: 'Nuovo' }), entry('old', { prodottoC: 'Vecchio' }), entry('other', { idNota: 'order-2' })],
  }));
  const { result } = renderHook(() => useBulkOrders('27-10-2026', false));
  await act(async () => listeners[0].next({ docs: [entry('order-1', { nomeC: 'Cliente', data: '27-10-2026', completa: '1' })] }));
  expect(result.current.loading).toBe(false);
  expect(result.current.orders[0].prodotti.map((p) => p.id).sort()).toEqual(['new', 'old']);
});

test('selects and orders the chosen scaletta, including legacy rows without timestamps', async () => {
  const { result } = renderHook(() => useBulkOrders('28-10-2026', true));
  expect(listeners[0].query[1]).toEqual({ field: 'scalettaData', value: '28-10-2026' });
  await act(async () => listeners[0].next({ docs: [
    entry('second', { scaletta: true, scalettaOrdine: 2 }),
    entry('removed', { scaletta: false, scalettaOrdine: 1 }),
    entry('first', { scaletta: true, scalettaOrdine: 1 }),
  ] }));
  expect(result.current.orders.map((o) => o.id)).toEqual(['first', 'second']);
});

test('reports product-load errors and retries without hanging on the spinner', async () => {
  getDocs.mockRejectedValueOnce(new Error('offline'));
  const { result } = renderHook(() => useBulkOrders('27-10-2026', false));
  await act(async () => listeners[0].next({ docs: [entry('a', {})] }));
  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBeTruthy();
  act(() => result.current.retry());
  await act(async () => listeners[1].next({ docs: [] }));
  expect(result.current.error).toBeNull();
  expect(result.current.orders).toEqual([]);
});

test('ignores an old loading request after changing the date and unsubscribes on unmount', async () => {
  let finishOld;
  getDocs.mockReturnValueOnce(new Promise((resolve) => { finishOld = resolve; }));
  const { result, rerender, unmount } = renderHook(({ date }) => useBulkOrders(date, false), {
    initialProps: { date: '27-10-2026' },
  });
  let oldRequest;
  act(() => { oldRequest = listeners[0].next({ docs: [entry('old', {})] }); });
  rerender({ date: '28-10-2026' });
  expect(listeners[0].unsubscribe).toHaveBeenCalledTimes(1);
  await act(async () => listeners[1].next({ docs: [entry('new', {})] }));
  await act(async () => { finishOld({ docs: [] }); await oldRequest; });
  await waitFor(() => expect(result.current.orders[0].id).toBe('new'));
  unmount();
  expect(listeners[1].unsubscribe).toHaveBeenCalledTimes(1);
});
