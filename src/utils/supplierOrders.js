import { collection, doc, getDocs, query, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase-config';

const normalize = (value) => String(value ?? '').trim().toLocaleUpperCase('it');
const quantity = (value) => {
  if (value == null || String(value).trim() === '') return NaN;
  return Number(String(value).replace(',', '.'));
};

export function supplierItemKey(item) {
  return JSON.stringify([item.tipo === 'tinta' ? 'tinta' : 'prodotto',
    ...(item.tipo === 'tinta' ? [normalize(item.brand)] : []), normalize(item.nuance ?? item.nomeP)]);
}

export function buildSupplierOrderItems({ supplier, suppliers, products, stock, families, shades }) {
  const supplierId = suppliers.find((entry) => entry.nomeF === supplier)?.id;
  const productNames = new Set(products.filter((item) => item.author?.name === supplier).map((item) => normalize(item.nomeP)));
  const brands = new Set(families.filter((family) => family.fornitoreId
    ? family.fornitoreId === supplierId
    : family.nomeF && family.nomeF === supplier).map((family) => normalize(family.brand)));
  const items = new Map();
  const add = (entry, tipo) => {
    const current = quantity(entry.quantita);
    const minimum = quantity(entry.sottoScorta);
    const ordered = quantity(entry.quantitaOrdinabile);
    if (!Number.isFinite(current) || !Number.isFinite(minimum) || !Number.isFinite(ordered) || current >= minimum || ordered <= 0) return;
    const item = tipo === 'tinta'
      ? { tipo, brand: entry.brand.trim(), nuance: String(entry.nomeP).trim(), nomeP: `${entry.brand.trim()} ${String(entry.nomeP).trim()}`, quantita: ordered }
      : { tipo, nomeP: String(entry.nomeP).trim(), quantita: ordered };
    if (!normalize(entry.nomeP)) return;
    // Duplicate catalogue links or stock records must never multiply the order quantity.
    const key = supplierItemKey(item);
    if (!items.has(key)) items.set(key, item);
  };
  stock.filter((entry) => productNames.has(normalize(entry.nomeP))).forEach((entry) => add(entry, 'prodotto'));
  shades.filter((entry) => brands.has(normalize(entry.brand))).forEach((entry) => add(entry, 'tinta'));
  return [...items.values()];
}

const entries = (snapshot) => snapshot.docs.map((entry) => ({ ...entry.data(), id: entry.id }));

export async function populateSupplierOrder(supplier, date) {
  if (!supplier || !date) throw new Error('Fornitore e data obbligatori');
  const [suppliers, products, stock, families, shades, existing] = await Promise.all([
    getDocs(collection(db, 'fornitore')),
    getDocs(query(collection(db, 'prodottoForn'), where('author.name', '==', supplier))),
    getDocs(collection(db, 'prodotto')),
    getDocs(collection(db, 'tinte')),
    getDocs(collection(db, 'scortaTinte')),
    getDocs(query(collection(db, 'notaForni'), where('nomeF', '==', supplier), where('data', '==', date))),
  ]);
  const existingItems = entries(existing);
  const keys = new Set(existingItems.map(supplierItemKey));
  // Legacy/manual rows only stored the display name. Preserve those rows and their edited quantities.
  const names = new Set(existingItems.map((entry) => normalize(entry.nomeP)));
  const candidates = buildSupplierOrderItems({ supplier, suppliers: entries(suppliers), products: entries(products),
    stock: entries(stock), families: entries(families), shades: entries(shades) })
    .filter((entry) => !keys.has(supplierItemKey(entry)) && !names.has(normalize(entry.nomeP)));

  // Deterministic IDs + transactions also protect against refreshes from two tabs at once.
  // Small chunks keep each transaction within Firestore's write limits.
  let added = 0;
  for (let offset = 0; offset < candidates.length; offset += 100) {
    const chunk = candidates.slice(offset, offset + 100);
    const refs = await Promise.all(chunk.map(async (item) => {
      const identity = JSON.stringify([supplier, date, supplierItemKey(item)]);
      const hash = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(identity));
      const key = Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
      return doc(db, 'notaForni', `auto-${key}`);
    }));
    added += await runTransaction(db, async (transaction) => {
      const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)));
      let count = 0;
      snapshots.forEach((snapshot, index) => {
        if (!snapshot.exists()) {
          transaction.set(refs[index], { ...chunk[index], nomeF: supplier, data: date, createdAt: serverTimestamp() });
          count += 1;
        }
      });
      return count;
    });
  }
  return added;
}
