import { loadPlaces } from './googleMaps';

test('does not load Google without a configured key', async () => {
  await expect(loadPlaces('')).rejects.toThrow('Chiave Google Maps non configurata');
  expect(document.querySelector('script[src*="maps.googleapis.com"]')).toBeNull();
});

test('shares one script and uses its defined callback to load Places', async () => {
  const first = loadPlaces('test-key');
  const second = loadPlaces('test-key');
  expect(first).toBe(second);
  const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
  expect(scripts).toHaveLength(1);
  const url = new URL(scripts[0].src);
  const places = { AutocompleteSuggestion: {} };
  window.google = { maps: { importLibrary: jest.fn().mockResolvedValue(places) } };
  expect(url.searchParams.get('key')).toBe('test-key');
  window[url.searchParams.get('callback')]();
  await expect(first).resolves.toBe(places);
  expect(window.google.maps.importLibrary).toHaveBeenCalledWith('places');
  scripts[0].remove();
  delete window.google;
});
