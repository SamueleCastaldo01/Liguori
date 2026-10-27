export const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

let placesPromise;

export function loadPlaces(apiKey = GOOGLE_MAPS_API_KEY) {
  if (!apiKey) return Promise.reject(new Error('Chiave Google Maps non configurata.'));
  if (placesPromise) return placesPromise;
  if (window.google?.maps?.importLibrary) return window.google.maps.importLibrary('places');

  placesPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const callback = '__liguoriGoogleMapsReady';
    const timeout = setTimeout(() => fail(), 15000);
    const cleanup = () => {
      clearTimeout(timeout);
      delete window[callback];
    };
    const fail = () => {
      cleanup();
      script.remove();
      placesPromise = undefined;
      reject(new Error('Google Maps non disponibile.'));
    };
    window[callback] = () => {
      cleanup();
      window.google.maps.importLibrary('places').then(resolve, fail);
    };
    const params = new URLSearchParams({
      key: apiKey, loading: 'async', libraries: 'places', language: 'it',
      v: 'weekly', callback,
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return placesPromise;
}
