import moment from 'moment';

export function normalizeOrderDate(value) {
  const date = moment(value, ['DD-MM-YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], true);
  return date.isValid() ? date.format('DD-MM-YYYY') : '';
}

export function sortOrderItems(items) {
  const sorted = [...items].sort((a, b) =>
    (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0) || a.id.localeCompare(b.id)
  );
  const ids = new Set(sorted.map((item) => item.id));
  return sorted.filter((item) => !item.idOriginale || !ids.has(item.idOriginale))
    .flatMap((item) => [item, ...sorted.filter((child) => child.idOriginale === item.id)]);
}

export function isPrintableOrderItem(item, status) {
  if (String(status) !== '1') return true;
  if (item.simbolo === '(NO)') return false;
  return !item.flagTinte || [item.t1, item.t2, item.t3, item.t4, item.t5]
    .some((shade) => String(shade ?? '').trim());
}

export function formatOrderAmount(value) {
  const number = Number(String(value ?? 0).replace(',', '.'));
  return (Number.isFinite(number) ? number : 0).toFixed(2).replace('.', ',');
}
