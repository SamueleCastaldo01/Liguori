export function documentPrintStyle(format = 'A4') {
  const paper = format === 'A5' ? 'A5' : 'A4';
  return `
    @page { size: ${paper} portrait; margin: 5mm; }
    @media print {
      html, body { width: 100% !important; height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; background: white; }
      * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .foglioA4 { position: static !important; width: 100% !important; max-width: 100% !important; height: auto !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; border-radius: 0 !important; overflow: visible !important; }
      .foglioA4 .scrollNota { height: auto !important; max-height: none !important; overflow: visible !important; }
      .foglioA4 .row { margin-left: 0 !important; margin-right: 0 !important; }
      .foglioA4 .row > * { min-width: 0; overflow-wrap: anywhere; }
      .foglioA4 input { max-width: 100%; }
      .foglioA4 h6 { max-width: 100%; }
      .foglioA4 .rigaNota { break-inside: avoid; page-break-inside: avoid; }
      .foglioA4 .rigaNota h3 { font-size: ${paper === 'A5' ? '16' : '22.5'}px !important; line-height: 1.25; }
      .foglioA4 .rigaNota h4 { font-size: ${paper === 'A5' ? '14' : '20'}px !important; line-height: 1.25; }
      .foglioA4 .bulk-order-item, .foglioA4 .print-items-heading { display: grid; grid-template-columns: 10% 65% 25%; }
      .foglioA4 .supplier-order-item, .foglioA4 .supplier-items-heading { display: grid; grid-template-columns: 10% 90%; }
      .foglioA4 .bulk-order-item > *, .foglioA4 .print-items-heading > *, .foglioA4 .supplier-order-item > *, .foglioA4 .supplier-items-heading > * { width: auto !important; max-width: 100%; height: auto !important; }
      .bulk-order-item, .supplier-order-item { break-inside: avoid; page-break-inside: avoid; }
      .bulk-order-document { height: auto !important; min-height: 0 !important; padding-top: 0 !important; break-after: page; page-break-after: always; }
      .bulk-order-document:last-child { break-after: auto; page-break-after: auto; }
    }
  `;
}
