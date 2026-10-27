import React from 'react';
import { Input } from '@mui/material';
import { usePlacesWidget } from 'react-google-autocomplete';

export default function ClientAddressInput({ value, onChange, apiKey }) {
  const { ref } = usePlacesWidget({
    apiKey,
    onPlaceSelected: (place) => {
      if (place.formatted_address) onChange(place.formatted_address);
    },
    options: { types: ['address'], componentRestrictions: { country: 'it' } },
  });

  return (
    <Input
      fullWidth
      inputRef={ref}
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Indirizzo Google Maps"
      inputProps={{ 'aria-label': 'Indirizzo Google Maps' }}
      className="inpCli"
      color="secondary"
      style={{ width: '100%' }}
    />
  );
}
