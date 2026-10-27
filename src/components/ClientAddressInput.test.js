import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { loadPlaces } from '../utils/googleMaps';
import ClientAddressInput from './ClientAddressInput';

jest.mock('../utils/googleMaps', () => ({ GOOGLE_MAPS_API_KEY: '', loadPlaces: jest.fn() }));

let fetchSuggestions;
beforeEach(() => {
  jest.useFakeTimers();
  fetchSuggestions = jest.fn().mockResolvedValue({ suggestions: [] });
  loadPlaces.mockReset().mockResolvedValue({
    AutocompleteSuggestion: { fetchAutocompleteSuggestions: fetchSuggestions },
    AutocompleteSessionToken: jest.fn(),
  });
});
afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });

function Form({ apiKey = 'test' }) {
  const [address, setAddress] = React.useState('');
  return <ClientAddressInput value={address} onChange={setAddress} apiKey={apiKey} />;
}

async function typeAddress(address) {
  fireEvent.change(screen.getByRole('combobox'), { target: { value: address } });
  await act(async () => { jest.advanceTimersByTime(300); });
}

test('keeps a typed address even without selecting a Google suggestion', () => {
  render(<Form />);
  const input = screen.getByRole('combobox', { name: 'Indirizzo Google Maps' });
  fireEvent.change(input, { target: { value: 'Via Roma 12, Caivano' } });
  expect(input).toHaveValue('Via Roma 12, Caivano');
  // Typing must not remount the field and lose focus/reference.
  expect(screen.getByRole('combobox')).toBe(input);
});

test('uses the new API and saves a selected formatted address', async () => {
  const place = { formattedAddress: 'Via Roma 12, 80023 Caivano NA, Italia', fetchFields: jest.fn().mockResolvedValue({}) };
  fetchSuggestions.mockResolvedValue({ suggestions: [{ placePrediction: {
    placeId: 'caivano', text: { toString: () => 'Via Roma 12, Caivano' }, toPlace: () => place,
  } }] });
  render(<Form />);
  await typeAddress('Via Roma');
  expect(fetchSuggestions).toHaveBeenCalledWith(expect.objectContaining({ input: 'Via Roma', includedRegionCodes: ['it'], sessionToken: expect.any(Object) }));
  await act(async () => { fireEvent.click(screen.getByRole('option', { name: 'Via Roma 12, Caivano' })); });
  expect(place.fetchFields).toHaveBeenCalledWith({ fields: ['formattedAddress'] });
  expect(screen.getByRole('combobox')).toHaveValue(place.formattedAddress);
});

test('keeps manual entry usable when no key is configured', async () => {
  render(<Form apiKey="" />);
  await typeAddress('Via Roma 12, Caivano');
  expect(loadPlaces).not.toHaveBeenCalled();
  expect(screen.getByRole('combobox')).toHaveValue('Via Roma 12, Caivano');
  expect(screen.getByText(/Suggerimenti non disponibili/)).toBeInTheDocument();
});

test('keeps typed text when Google rejects the request', async () => {
  fetchSuggestions.mockRejectedValue(new Error('API not authorized'));
  render(<Form />);
  await typeAddress('Via Roma 12, Caivano');
  expect(screen.getByRole('combobox')).toHaveValue('Via Roma 12, Caivano');
  expect(screen.getByText(/Suggerimenti non disponibili/)).toBeInTheDocument();
});

test('ignores an old prediction response after the user changes the address', async () => {
  let resolveOld;
  fetchSuggestions.mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve; }));
  render(<Form />);
  await typeAddress('Via Roma');
  await typeAddress('Via Milano');
  await act(async () => { resolveOld({ suggestions: [{ placePrediction: {
    placeId: 'old', text: { toString: () => 'Old address' },
  } }] }); });
  expect(screen.getByRole('combobox')).toHaveValue('Via Milano');
  expect(screen.queryByRole('option', { name: 'Old address' })).not.toBeInTheDocument();
});
