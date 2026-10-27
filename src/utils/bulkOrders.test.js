import { normalizeOrderDate, sortOrderItems } from './bulkOrders';

test.each(['27-10-2026', '27/10/2026', '2026-10-27'])('accepts the date passed by each entry page: %s', (date) => {
  expect(normalizeOrderDate(date)).toBe('27-10-2026');
});

test('rejects empty and invalid dates', () => {
  expect(normalizeOrderDate('')).toBe('');
  expect(normalizeOrderDate('31-02-2026')).toBe('');
});

test('keeps split rows next to their parent and includes orphan and legacy rows', () => {
  const stamp = (value) => ({ toMillis: () => value });
  const items = [
    { id: 'split', idOriginale: 'parent', createdAt: stamp(4) },
    { id: 'other', createdAt: stamp(3) },
    { id: 'parent', createdAt: stamp(2) },
    { id: 'legacy' },
    { id: 'orphan', idOriginale: 'deleted', createdAt: stamp(5) },
  ];
  expect(sortOrderItems(items).map((item) => item.id)).toEqual(['legacy', 'parent', 'split', 'other', 'orphan']);
});
