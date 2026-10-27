import { act, renderHook } from '@testing-library/react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import useHistory from './useHistory';

jest.mock('../firebase-config', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn((db, name) => name),
  limit: jest.fn((count) => ({ count })),
  orderBy: jest.fn(),
  query: jest.fn((...parts) => parts),
  onSnapshot: jest.fn(),
}));

let listeners;
beforeEach(() => {
  jest.clearAllMocks();
  collection.mockImplementation((db, name) => name);
  query.mockImplementation((...parts) => parts);
  listeners = [];
  onSnapshot.mockImplementation((query, next, error) => {
    const unsubscribe = jest.fn();
    listeners.push({ query, next, error, unsubscribe });
    return unsubscribe;
  });
});

function emit(count, offset = 0) {
  act(() => listeners[listeners.length - 1].next({
    docs: Array.from({ length: count }, (_, i) => ({
      id: `entry-${i + offset}`,
      data: () => ({ nomeP: 'Prodotto' }),
    })),
  }));
}

test('subscribes only when the history is open and cleans up when closed', () => {
  const { rerender } = renderHook(({ enabled }) => useHistory('cronologiaDeb', enabled), {
    initialProps: { enabled: false },
  });
  expect(onSnapshot).not.toHaveBeenCalled();
  rerender({ enabled: true });
  expect(listeners[0].query[0]).toBe('cronologiaDeb');
  expect(orderBy).toHaveBeenLastCalledWith('createdAt', 'desc');
  rerender({ enabled: false });
  expect(listeners[0].unsubscribe).toHaveBeenCalledTimes(1);
});

test('loads older entries beyond the former limit and keeps live updates without duplicates', () => {
  const { result } = renderHook(() => useHistory('cronologia', true));
  emit(151);
  expect(result.current.entries).toHaveLength(150);
  expect(result.current.hasMore).toBe(true);

  act(() => result.current.loadMore());
  expect(limit).toHaveBeenLastCalledWith(301);
  expect(listeners[0].unsubscribe).toHaveBeenCalledTimes(1);
  expect(result.current.loading).toBe(true);
  emit(301);
  expect(result.current.entries).toHaveLength(300);

  // A newly inserted movement changes the live window, without appending
  // duplicate entries or leaving a gap at the former page boundary.
  emit(301, -1);
  expect(result.current.entries[0].id).toBe('entry--1');
  expect(new Set(result.current.entries.map((entry) => entry.id)).size).toBe(300);
  act(() => result.current.loadMore());
  emit(320);
  expect(result.current.entries).toHaveLength(320);
  expect(result.current.hasMore).toBe(false);
});

test.each([0, 150])('detects the end even with exactly %i entries', (count) => {
  const { result } = renderHook(() => useHistory('cronologiaPa', true));
  emit(count);
  expect(result.current.entries).toHaveLength(count);
  expect(result.current.hasMore).toBe(false);
  act(() => result.current.loadMore());
  expect(listeners).toHaveLength(1);
});

test('keeps already loaded entries on failure and allows retry', () => {
  const { result } = renderHook(() => useHistory('cronologiaTinte', true));
  emit(151);
  act(() => result.current.loadMore());
  act(() => listeners[1].error(new Error('offline')));
  expect(result.current.error).toBeTruthy();
  expect(result.current.entries).toHaveLength(150);
  expect(result.current.loading).toBe(false);
  act(() => result.current.retry());
  expect(result.current.error).toBeNull();
  emit(200);
  expect(result.current.entries).toHaveLength(200);
  expect(result.current.loading).toBe(false);
});
