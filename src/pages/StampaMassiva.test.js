import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import useBulkOrders from '../hooks/useBulkOrders';
import StampaMassiva from './StampaMassiva';

jest.mock('../hooks/useBulkOrders', () => jest.fn());
jest.mock('../components/utenti', () => ({ tutti: ['test-user'] }));
jest.mock('react-to-print', () => ({ useReactToPrint: jest.fn() }));

const orders = [
  { id: 'a', nomeC: 'Cliente A', data: '27-10-2026', cont: 10, completa: '0', prodotti: [
    { id: 'p1', prodottoC: 'Asciugamani', qtProdotto: 1, prezzoTotProd: 12 },
  ] },
  { id: 'b', nomeC: 'Cliente B', data: '26-10-2026', cont: 11, completa: '1', prodotti: [
    { id: 'p2', prodottoC: 'Shampoo', qtProdotto: 2, prezzoTotProd: 20 },
  ] },
];

beforeEach(() => {
  localStorage.setItem('uid', 'test-user');
  useBulkOrders.mockReturnValue({ orders, loading: false, error: null, retry: jest.fn() });
  useReactToPrint.mockReturnValue(jest.fn());
});

function showPage(state = { date: '2026-10-28', scaletta: true }) {
  return render(<MemoryRouter initialEntries={[{ pathname: '/stampamassiva', state }]}>
    <StampaMassiva TodayData="27-10-2026" />
  </MemoryRouter>);
}

test('opens the selected date/scaletta and renders every order with its own data', () => {
  showPage();
  expect(useBulkOrders).toHaveBeenLastCalledWith('28-10-2026', true);
  expect(screen.getByRole('checkbox', { name: 'Scaletta:' })).toBeChecked();
  expect(screen.getByLabelText('Data ordini da stampare')).toHaveValue('2026-10-28');
  expect(screen.getByText('Asciugamani')).toBeInTheDocument();
  expect(screen.getByText('Shampoo')).toBeInTheDocument();
  expect(screen.getByText(/26-10-2026/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Data ordini da stampare'), { target: { value: '2026-10-29' } });
  expect(useBulkOrders).toHaveBeenLastCalledWith('29-10-2026', true);
});

test.each([
  { orders: [], loading: true, error: null },
  { orders: [], loading: false, error: null },
  { orders, loading: false, error: new Error('offline') },
])('prevents printing incomplete, empty or failed loads: %o', (state) => {
  useBulkOrders.mockReturnValue({ ...state, retry: jest.fn() });
  showPage();
  expect(screen.getByRole('button', { name: 'Stampa' })).toBeDisabled();
});

test('waits for the print layout to be committed before cloning, then restores the preview', async () => {
  showPage();
  const options = useReactToPrint.mock.calls[0][0];
  let ready;
  act(() => { ready = options.onBeforeGetContent(); });
  await ready;
  expect(options.content()).toHaveStyle({ height: 'auto' });
  expect(screen.queryByText('Prezzo Uni')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Stampa' })).toBeDisabled();
  act(() => options.onAfterPrint());
  expect(options.content()).toHaveStyle({ height: '90vh' });
  expect(screen.getByRole('button', { name: 'Stampa' })).toBeEnabled();
  expect(options.pageStyle).toContain('break-after: page');
});
