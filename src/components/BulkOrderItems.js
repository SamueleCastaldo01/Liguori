import React from 'react';
import { shouldHighlightOrderItem } from '../utils/orderHighlight';
import { formatOrderAmount, isPrintableOrderItem } from '../utils/bulkOrders';

export default function BulkOrderItems({ order, showUnitPrices }) {
  return order.prodotti.filter((item) => isPrintableOrderItem(item, order.completa)).map((item) => {
    const highlighted = shouldHighlightOrderItem(item) ? '#FFFF00' : undefined;
    const quantity = item.simbolo === '1' && ['1', '2'].includes(String(order.completa))
      ? Number(item.qtProdotto || 0) - Number(item.meno || 0) : item.qtProdotto;
    return (
      <div key={item.id} className="row bulk-order-item" style={{ borderBottom: '2px solid', fontSize: '16px', textAlign: 'left' }}>
        <div className="col-1" style={{ background: highlighted, padding: '8px 0', textAlign: 'center' }}>{quantity}</div>
        <div className="col-6" style={{ background: highlighted, borderLeft: '2px solid', padding: '8px' }}>
          {item.prodottoC}
          {item.flagTinte && ` ${[item.t1, item.t2, item.t3, item.t4, item.t5].filter(Boolean).join(' - ')}`}
          {item.flagEt && ' +ET.'}
          {item.simbolo && ![' ', '1'].includes(item.simbolo) && <span style={{ color: 'red' }}> {item.simbolo}</span>}
        </div>
        {showUnitPrices && <div className="col-2" style={{ borderLeft: '2px solid', padding: '8px 0' }}>
          {['-', 'In Omaggio', 'G. P.'].includes(item.simbolo2) ? item.simbolo2 : `€ ${formatOrderAmount(item.prezzoUniProd)}`}
        </div>}
        <div className="col-2" style={{ borderLeft: '2px solid', padding: '8px 0' }}>€ {formatOrderAmount(item.prezzoTotProd)}</div>
      </div>
    );
  });
}
