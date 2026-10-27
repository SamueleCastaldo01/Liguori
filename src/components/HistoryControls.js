import React from 'react';
import Button from '@mui/material/Button';

export default function HistoryControls({ history, searchable = true }) {
  return (
    <div style={{ padding: '12px', textAlign: 'center' }} aria-live="polite">
      <p style={{ marginBottom: '8px' }}>
        {history.entries.length} movimenti caricati.
        {searchable && ' La ricerca si applica ai movimenti caricati.'}
      </p>
      {history.error ? (
        <>
          <p role="alert">Impossibile caricare la cronologia. Riprova.</p>
          <Button onClick={history.retry} disabled={history.loading}>Riprova</Button>
        </>
      ) : history.loading ? (
        <p>Caricamento cronologia…</p>
      ) : history.hasMore ? (
        <Button variant="outlined" onClick={history.loadMore}>Carica precedenti</Button>
      ) : (
        <p>Tutti i movimenti disponibili sono stati caricati.</p>
      )}
    </div>
  );
}
