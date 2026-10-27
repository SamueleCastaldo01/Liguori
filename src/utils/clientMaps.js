export function getClientAddress(client) {
  const address = String(client.indirizzo || '').trim();
  if (address) return address;
  return [client.via, client.numeroCivico, client.citta, client.cap, client.stato]
    .map((part) => String(part ?? '').trim()).filter(Boolean).join(' ');
}

export function buildMapsSearchUrl(address) {
  const query = String(address || '').trim();
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : '';
}

export function getClientMapsUrl(client) {
  const address = getClientAddress(client);
  if (address) return buildMapsSearchUrl(address);
  // Preserve a previously saved location when no address text is available.
  try {
    const url = new URL(client.indirizzoLink);
    if (!['https:', 'http:'].includes(url.protocol)) return undefined;
    if (url.searchParams.has('query') && !url.searchParams.get('query').trim()) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}
