import { buildMapsSearchUrl, getClientAddress, getClientMapsUrl } from './clientMaps';

test('encodes manually entered addresses including accented letters, ampersands and hashes', () => {
  const address = 'Via Caffè & Roma #2, Napoli';
  const url = new URL(buildMapsSearchUrl(address));
  expect(url.searchParams.get('query')).toBe(address);
  expect(url.hash).toBe('');
});

test('repairs links for existing contacts without changing their saved data', () => {
  const client = { indirizzo: 'Via Roma 12, Caivano', indirizzoLink: 'https://www.google.com/maps/search/?api=1&query=' };
  expect(new URL(getClientMapsUrl(client)).searchParams.get('query')).toBe(client.indirizzo);
});

test('uses legacy address fields when the full address is missing', () => {
  const client = { via: 'Via Roma', numeroCivico: 12, citta: 'Caivano', cap: '80023', stato: 'Italia' };
  expect(getClientAddress(client)).toBe('Via Roma 12 Caivano 80023 Italia');
  expect(new URL(getClientMapsUrl(client)).searchParams.get('query')).toBe(getClientAddress(client));
});

test('keeps a saved pin when no address is available', () => {
  expect(getClientMapsUrl({ indirizzoLink: 'https://maps.app.goo.gl/example' })).toBe('https://maps.app.goo.gl/example');
});

test('does not open empty maps or executable links', () => {
  expect(buildMapsSearchUrl('  ')).toBe('');
  expect(getClientMapsUrl({})).toBeUndefined();
  expect(getClientMapsUrl({ indirizzoLink: 'javascript:alert(1)' })).toBeUndefined();
  expect(getClientMapsUrl({ indirizzoLink: 'https://www.google.com/maps/search/?api=1&query=' })).toBeUndefined();
});
