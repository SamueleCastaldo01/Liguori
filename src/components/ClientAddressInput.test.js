import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { usePlacesWidget } from 'react-google-autocomplete';
import ClientAddressInput from './ClientAddressInput';

jest.mock('react-google-autocomplete', () => ({ usePlacesWidget: jest.fn() }));

beforeEach(() => usePlacesWidget.mockReturnValue({ ref: { current: null } }));

test('keeps a typed address even without selecting a Google suggestion', () => {
  function Form() {
    const [address, setAddress] = React.useState('');
    return <ClientAddressInput value={address} onChange={setAddress} apiKey="test" />;
  }
  render(<Form />);
  const input = screen.getByRole('textbox', { name: 'Indirizzo Google Maps' });
  fireEvent.change(input, { target: { value: 'Via Roma 12, Caivano' } });
  expect(input).toHaveValue('Via Roma 12, Caivano');
  // Typing must not remount the field and lose focus/reference.
  expect(screen.getByRole('textbox')).toBe(input);
});

test('also accepts Google suggestions and ignores a place lacking an address', () => {
  const onChange = jest.fn();
  render(<ClientAddressInput value="Via Roma" onChange={onChange} apiKey="test" />);
  const { onPlaceSelected } = usePlacesWidget.mock.calls[0][0];
  onPlaceSelected({ formatted_address: 'Via Roma 12, 80023 Caivano NA, Italia' });
  expect(onChange).toHaveBeenCalledWith('Via Roma 12, 80023 Caivano NA, Italia');
  onChange.mockClear();
  onPlaceSelected({ name: 'Via Roma' });
  expect(onChange).not.toHaveBeenCalled();
});
