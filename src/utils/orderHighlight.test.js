import { shouldHighlightOrderItem } from './orderHighlight';

test.each([
  'ROIAL ASCIUGAMANO 60 pz',
  'ROIAL ASCIUGAMANI 60 PZ',
  '  Asciugamani monouso 100 pezzi ',
  'Asciugamano - confezione nuova',
])('highlights towels regardless of brand, casing and pack size: %s', (prodottoC) => {
  expect(shouldHighlightOrderItem({ prodottoC, simbolo: '' })).toBe(true);
  expect(shouldHighlightOrderItem({ prodottoC })).toBe(true);
});

test.each(['(NO)', 'X', ' x ', '(no)'])('respects an excluded towel item: %s', (simbolo) => {
  expect(shouldHighlightOrderItem({ prodottoC: 'ASCIUGAMANI', simbolo })).toBe(false);
});

test('preserves manual highlighting for other products', () => {
  expect(shouldHighlightOrderItem({ prodottoC: 'Shampoo', simbolo: ' ' })).toBe(true);
  expect(shouldHighlightOrderItem({ prodottoC: 'Shampoo', simbolo: '' })).toBe(false);
  expect(shouldHighlightOrderItem({ prodottoC: 'Portaasciugamani' })).toBe(false);
  expect(shouldHighlightOrderItem({})).toBe(false);
});
