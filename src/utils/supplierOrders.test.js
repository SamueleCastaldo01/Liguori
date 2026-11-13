import { collection, doc, getDocs, query, runTransaction, where } from 'firebase/firestore';
import { buildSupplierOrderItems, populateSupplierOrder } from './supplierOrders';

jest.mock('../firebase-config', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(), doc: jest.fn(), getDocs: jest.fn(), query: jest.fn(), where: jest.fn(),
  runTransaction: jest.fn(), serverTimestamp: () => 'timestamp',
}));

const stockItem = (extra = {}) => ({ nomeP: 'Shampoo', quantita: '2', sottoScorta: '10', quantitaOrdinabile: '12', ...extra });
const input = (extra = {}) => ({ supplier: 'Fornitore A', suppliers: [{ id: 'a', nomeF: 'Fornitore A' }],
  products: [{ nomeP: 'Shampoo', author: { name: 'Fornitore A' } }], stock: [stockItem()], families: [], shades: [], ...extra });

test('deduplicates repeated catalogue and stock records, comparing numeric strings as numbers', () => {
  const data = input();
  data.products.push(data.products[0], { nomeP: 'Altro', author: { name: 'Fornitore B' } });
  data.stock.push(stockItem(), stockItem({ nomeP: 'Altro' }));
  expect(buildSupplierOrderItems(data)).toEqual([{ tipo: 'prodotto', nomeP: 'Shampoo', quantita: 12 }]);
});

test.each([
  { quantita: '10' }, { quantita: '11' }, { quantitaOrdinabile: '' }, { quantitaOrdinabile: '0' },
  { quantitaOrdinabile: '-2' }, { quantitaOrdinabile: 'abc' }, { sottoScorta: '' }, { quantita: '' },
])('does not order when above/equal to threshold or parameters are invalid: %o', (extra) => {
  expect(buildSupplierOrderItems(input({ stock: [stockItem(extra)] }))).toEqual([]);
});

test('includes only assigned families, keeps the same nuance in different families, and uses the order quantity', () => {
  const families = [{ brand: 'CB', fornitoreId: 'a' }, { brand: 'KF', fornitoreId: 'a' }, { brand: 'OTHER', fornitoreId: 'b' }];
  const shades = ['CB', 'KF', 'OTHER'].map(brand => stockItem({ brand, nomeP: '6.0', quantita: '1', quantitaOrdinabile: '6' }));
  expect(buildSupplierOrderItems(input({ stock: [], families, shades: [...shades, shades[0]] }))).toEqual([
    { tipo: 'tinta', brand: 'CB', nuance: '6.0', nomeP: 'CB 6.0', quantita: 6 },
    { tipo: 'tinta', brand: 'KF', nuance: '6.0', nomeP: 'KF 6.0', quantita: 6 },
  ]);
});

test('matches families by supplier ID after a rename and accepts decimal commas', () => {
  expect(buildSupplierOrderItems(input({ stock: [], families: [{ brand: 'CB', fornitoreId: 'a', nomeF: 'Old name' }],
    shades: [stockItem({ brand: 'cb', nomeP: '6.0', quantita: '1,5', quantitaOrdinabile: '2,5' })] }))[0].quantita).toBe(2.5);
});

let database;
let transactionQueue;
beforeEach(() => {
  global.TextEncoder = require('util').TextEncoder;
  Object.defineProperty(window, 'crypto', { configurable: true, value: require('crypto').webcrypto });
  database = { fornitore: input().suppliers, prodottoForn: input().products, prodotto: input().stock,
    tinte: [], scortaTinte: [], notaForni: [] };
  collection.mockImplementation((db, name) => ({ name }));
  query.mockImplementation((ref, ...filters) => ({ ...ref, filters }));
  where.mockImplementation((field, op, value) => ({ field, value }));
  doc.mockImplementation((db, name, id) => ({ name, id }));
  getDocs.mockImplementation(async ({ name, filters = [] }) => ({ docs: database[name]
    .filter(item => filters.every(({ field, value }) => field.split('.').reduce((data, key) => data?.[key], item) === value))
    .map((item, index) => ({ id: item.id || String(index), data: () => item })) }));
  transactionQueue = Promise.resolve();
  runTransaction.mockImplementation((db, callback) => {
    transactionQueue = transactionQueue.then(() => callback({
      get: async ({ name, id }) => ({ exists: () => database[name].some(item => item.id === id) }),
      set: ({ name, id }, data) => database[name].push({ ...data, id }),
    }));
    return transactionQueue;
  });
});

test('repeated and simultaneous refreshes create one row and preserve later user quantity edits', async () => {
  await Promise.all([populateSupplierOrder('Fornitore A', '13-11-2026'), populateSupplierOrder('Fornitore A', '13-11-2026')]);
  expect(database.notaForni).toHaveLength(1);
  database.notaForni[0].quantita = 99;
  expect(await populateSupplierOrder('Fornitore A', '13-11-2026')).toBe(0);
  expect(database.notaForni[0].quantita).toBe(99);
  expect(await populateSupplierOrder('Fornitore A', '14-11-2026')).toBe(1);
});

test('preserves legacy manual rows, still adds subsequent missing items, and isolates dates/suppliers', async () => {
  database.notaForni.push({ nomeF: 'Fornitore A', data: '13-11-2026', nomeP: 'SHAMPOO', quantita: 33 });
  database.prodottoForn.push({ nomeP: 'Balsamo', author: { name: 'Fornitore A' } });
  database.prodotto.push(stockItem({ nomeP: 'Balsamo' }));
  expect(await populateSupplierOrder('Fornitore A', '13-11-2026')).toBe(1);
  expect(database.notaForni.map(item => item.quantita)).toEqual([33, 12]);
  expect(await populateSupplierOrder('Fornitore B', '13-11-2026')).toBe(0);
});
