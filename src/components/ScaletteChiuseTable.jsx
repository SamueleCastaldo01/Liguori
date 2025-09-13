// src/components/ScaletteChiuseTable.jsx
import React from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase-config';
import moment from 'moment';
import 'moment/locale/it';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

const LS_KEY = 'scaletteChiuseCache_v1';

const toDateStr = (ms) => moment(ms).format('DD-MM-YYYY');
const startOfDayMs = (ms) => moment(ms).startOf('day').valueOf();
const endOfDayMs = (ms) => moment(ms).endOf('day').valueOf();

function toNumber(v) {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const s = String(v).trim().replace(/\./g, '').replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Ritorna l'array delle date (ms) degli ultimi `days` giorni, partendo da IERI, in ordine decrescente (ieri -> più vecchi).
 * Esempio: days=7 => [ieri, -2g, -3g, ... -7g]
 */
function buildDaysArray(days) {
  const arr = [];
  let d = moment().startOf('day').subtract(1, 'day'); // ieri
  for (let i = 0; i < days; i++) {
    arr.push(d.clone().valueOf());
    d = d.subtract(1, 'day');
  }
  return arr;
}

export default function ScaletteChiuseTable({ defaultDays = 7 }) {
  const [days, setDays] = React.useState(defaultDays);
  const [rows, setRows] = React.useState([]); // [{data:'DD-MM-YYYY', quota: number, incasso: number}]
  const [loading, setLoading] = React.useState(false);

  // carica cache
  const loadCache = React.useCallback(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const saveCache = React.useCallback((cacheObj) => {
    localStorage.setItem(LS_KEY, JSON.stringify(cacheObj));
  }, []);

  // Assicura che gli ultimi `days` siano in cache. Se mancano, fa 1 query per l'intervallo mancante e aggiorna.
  const ensureData = React.useCallback(async () => {
    setLoading(true);
    const cache = loadCache();
    const dayMsList = buildDaysArray(days);

    // quali date (stringa) vogliamo
    const wantDates = dayMsList.map(toDateStr);

    // trova quali mancano in cache
    const missingDates = wantDates.filter(d => !cache[d]);

    if (missingDates.length > 0) {
      // query 1 sola volta per l'intero intervallo mancante (min..max), poi filtro client-side completa==2
      const minMs = startOfDayMs(moment(missingDates[missingDates.length - 1], 'DD-MM-YYYY').valueOf()); // più vecchia
      const maxMs = endOfDayMs(moment(missingDates[0], 'DD-MM-YYYY').valueOf()); // la più recente

      // NB: evito where('completa','==',2) per non richiedere indice composto; filtro lato client.
      const qRef = query(
        collection(db, 'addNota'),
        where('dataMilli', '>=', minMs),
        where('dataMilli', '<=', maxMs),
        orderBy('dataMilli'),
        limit(5000) // alza se serve
      );
      const snap = await getDocs(qRef);

      // aggrega per giorno SOLO completa==2 (o "2")
      const agg = {}; // dataStr -> { quota, incasso }
      snap.forEach(docSnap => {
        const d = docSnap.data();
        const isClosed = d.completa === 2 || d.completa === "2";
        if (!isClosed) return;

        const dayStr = d.data || moment(d.dataMilli).format('DD-MM-YYYY'); // fallback sicuro
        const quota = toNumber(d.quota);
        const incasso = toNumber(d.sommaTotale);

        if (!agg[dayStr]) agg[dayStr] = { quota: 0, incasso: 0 };
        agg[dayStr].quota += quota;
        agg[dayStr].incasso += incasso;
      });

      // scrivi in cache solo i giorni richiesti (mancanti)
      missingDates.forEach(ds => {
        cache[ds] = {
          quota: agg[ds]?.quota ?? 0,
          incasso: agg[ds]?.incasso ?? 0,
          _cachedAt: Date.now()
        };
      });

      saveCache(cache);
    }

    // prepara righe ordinate DESC (ieri -> più vecchi) e limitate a `days`
    const finalRows = dayMsList.map(ms => {
      const ds = toDateStr(ms);
      const rec = cache[ds] || { quota: 0, incasso: 0 };
      return { data: ds, quota: rec.quota, incasso: rec.incasso };
    });

    setRows(finalRows);
    setLoading(false);
  }, [days, loadCache, saveCache]);

  React.useEffect(() => {
    ensureData();
  }, [ensureData]);

  return (
    <div className='todo_containerInOrdine mt-5 mb-4' style={{paddingTop: 0}}>
      <div className='row'>
        <div className='col'>
          <p className='colTextTitle'>Scalette chiuse</p>
        </div>
        <div className='col' />
        <div className='col' style={{ textAlign: 'right' }}>
          <FormControl>
            <Select
              sx={{ height: 39, width: 160 }}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <MenuItem value={7}>Ultimi 7 giorni</MenuItem>
              <MenuItem value={10}>Ultimi 10 giorni</MenuItem>
              <MenuItem value={30}>Ultimi 30 giorni</MenuItem>
              <MenuItem value={365}>Ultimi 365 giorni</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      <div className='row' style={{marginRight: 5}}>
        <div className='col-3'><p className='coltext'>Data</p></div>
        <div className='col-3' style={{padding: 0}}><p className='coltext'>Quota</p></div>
        <div className='col-3' style={{padding: 0}}><p className='coltext'>Incasso Totale</p></div>
        <hr style={{margin: 0}}/>
      </div>

      <div className="scroll">
        {loading && <div style={{marginTop: 14}}><CircularProgress/></div>}
        {!loading && rows.map(r => (
          <div key={r.data}>
            <div className='row' style={{padding: 0, marginRight: 5}}>
              <div className='col-3 diviCol'><p className='inpTab'>{r.data}</p></div>
              <div className='col-3 diviCol' style={{padding: 0}}>
                <p className='inpTab'>€{r.quota.toFixed(2).replace('.', ',')}</p>
              </div>
              <div className='col-3 diviCol' style={{padding: 0}}>
                <p className='inpTab'>€{r.incasso.toFixed(2).replace('.', ',')}</p>
              </div>
              <hr style={{margin: 0}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
