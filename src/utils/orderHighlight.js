export function shouldHighlightOrderItem(item) {
  // A single space is the existing marker for manual highlighting.
  if (item.simbolo === ' ') return true;

  const symbol = String(item.simbolo || '').trim().toUpperCase();
  if (symbol === '(NO)' || symbol === 'X') return false;

  // Match singular/plural towel names, independently of brand and pack size.
  return /\basciugaman[oi]\b/i.test(String(item.prodottoC || ''));
}
