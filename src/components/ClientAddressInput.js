import React, { useEffect, useRef, useState } from 'react';
import { Autocomplete, Paper, TextField } from '@mui/material';
import { GOOGLE_MAPS_API_KEY, loadPlaces } from '../utils/googleMaps';

function SuggestionsPaper({ children, ...props }) {
  return (
    <Paper {...props}>
      {children}
      <div style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12 }}>Google Maps</div>
    </Paper>
  );
}

export default function ClientAddressInput({ value, onChange, apiKey = GOOGLE_MAPS_API_KEY }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [unavailable, setUnavailable] = useState(!apiKey);
  const session = useRef(null);
  const revision = useRef(0);
  const mounted = useRef(false);
  const latestValue = useRef(value);
  latestValue.current = value;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; revision.current += 1; };
  }, []);

  useEffect(() => {
    if (value !== query) setSuggestions([]);
    if (!query.trim()) session.current = null;
    if (!apiKey || query.trim().length < 3 || value !== query) return undefined;
    let active = true;
    const currentRevision = revision.current;
    const timer = setTimeout(async () => {
      try {
        const { AutocompleteSuggestion, AutocompleteSessionToken } = await loadPlaces(apiKey);
        if (!active || currentRevision !== revision.current) return;
        if (!session.current) session.current = new AutocompleteSessionToken();
        const result = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query, includedRegionCodes: ['it'], language: 'it',
          sessionToken: session.current,
        });
        if (!active || currentRevision !== revision.current) return;
        setSuggestions(result.suggestions.map(({ placePrediction }) => placePrediction).filter(Boolean));
        setUnavailable(false);
      } catch {
        if (!active || currentRevision !== revision.current) return;
        setSuggestions([]);
        setUnavailable(true);
      }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [apiKey, query, value]);

  const selectPlace = async (_, prediction) => {
    revision.current += 1;
    const currentRevision = revision.current;
    setQuery('');
    setSuggestions([]);
    if (!prediction || typeof prediction === 'string') return;
    const selectedText = prediction.text.toString();
    // Keep the selected text even if Google cannot return the full address.
    onChange(selectedText);
    try {
      const place = prediction.toPlace();
      session.current = null;
      await place.fetchFields({ fields: ['formattedAddress'] });
      if (mounted.current && revision.current === currentRevision && latestValue.current === selectedText && place.formattedAddress) {
        onChange(place.formattedAddress);
      }
    } catch {
      if (mounted.current && revision.current === currentRevision) setUnavailable(true);
    }
  };

  return (
    <Autocomplete
      freeSolo
      fullWidth
      sx={{ minWidth: 0 }}
      value={null}
      inputValue={value || ''}
      options={suggestions}
      filterOptions={(options) => options}
      getOptionLabel={(option) => typeof option === 'string' ? option : option.text.toString()}
      isOptionEqualToValue={(option, selected) => option.placeId === selected.placeId}
      PaperComponent={SuggestionsPaper}
      onChange={selectPlace}
      onInputChange={(_, text, reason) => {
        if (reason !== 'input' && reason !== 'clear') return;
        revision.current += 1;
        setSuggestions([]);
        setQuery(text);
        onChange(text);
      }}
      onClose={() => { setQuery(''); setSuggestions([]); }}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          variant="standard"
          placeholder="Indirizzo Google Maps"
          color="secondary"
          inputProps={{ ...params.inputProps, 'aria-label': 'Indirizzo Google Maps' }}
          helperText={unavailable ? 'Suggerimenti non disponibili. Puoi scrivere e salvare l’indirizzo manualmente.' : undefined}
        />
      )}
    />
  );
}
