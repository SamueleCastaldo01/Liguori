import React from 'react';

export default function PrintFormatControl({ value, onChange, disabled = false }) {
  return <label style={{ margin: '0 12px' }}>
    Formato stampa: <select aria-label="Formato stampa" value={value} disabled={disabled}
      onChange={(event) => onChange(event.target.value)}>
      <option value="A4">A4</option>
      <option value="A5">A5</option>
    </select>
    <small style={{ display: 'block' }}>Nella finestra di stampa usa lo stesso formato e scala 100%.</small>
  </label>;
}
