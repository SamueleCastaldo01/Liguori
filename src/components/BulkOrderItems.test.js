import React from 'react';
import { render, screen } from '@testing-library/react';
import BulkOrderItems from './BulkOrderItems';

test('prints mixed order states without relying on the last opened order or editing callbacks', () => {
  const item = { id: 'a', prodottoC: 'Asciugamani 100 pezzi', qtProdotto: 2, prezzoUniProd: 12.5, prezzoTotProd: 25, simbolo: '' };
  const { container } = render(<>
    <BulkOrderItems order={{ completa: '0', prodotti: [item] }} showUnitPrices />
    <BulkOrderItems order={{ completa: '1', prodotti: [{ ...item, id: 'b', prodottoC: 'Shampoo', simbolo: '(NO)' }] }} showUnitPrices />
  </>);
  expect(screen.getByText('Asciugamani 100 pezzi')).toHaveStyle({ background: '#FFFF00' });
  expect(screen.getByText('€ 12,50')).toBeInTheDocument();
  expect(screen.getByText('€ 25,00')).toBeInTheDocument();
  expect(screen.queryByText('Shampoo')).not.toBeInTheDocument();
  expect(container.querySelector('input')).toBeNull();
});

test('renders tint codes and reduced quantities without loading editable tint options', () => {
  render(<BulkOrderItems order={{ completa: '1', prodotti: [
    { id: 'a', prodottoC: 'Tinta', flagTinte: true, t1: '5.1', t2: '6.2', qtProdotto: 5, meno: 2, simbolo: '1', prezzoTotProd: '30,00' },
    { id: 'b', prodottoC: 'Tinta vuota', flagTinte: true, t1: '' },
  ] }} showUnitPrices={false} />);
  expect(screen.getByText(/Tinta 5.1 - 6.2/)).toBeInTheDocument();
  expect(screen.getByText('3')).toBeInTheDocument();
  expect(screen.getByText('€ 30,00')).toBeInTheDocument();
  expect(screen.queryByText('Tinta vuota')).not.toBeInTheDocument();
});
