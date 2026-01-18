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

moment.locale('it');

// --- Utils date -------------------------------------------------

const toDateStr = (ms) => moment(ms).format('DD-MM-YYYY');

const startOfDayMs = (ms) => moment(ms).startOf('day').valueOf();

const endOfDayMs = (ms) => moment(ms).endOf('day').valueOf();

/**
 * Ritorna un array di millisecondi (inizio giorno) per gli ultimi `days` giorni
 * partendo da IERI.
 * Esempio: oggi 24 -> [23,22,21,...] in ms
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

// --- Utils numeri -----------------------------------------------

// Gestisce numeri tipo "4.317,00" o "4317.00" o già number
function toNumber(v) {
  if (v == null) return 0;
  if (typeof v === 'number') return v;

  let s = String(v).trim();

  const hasComma = s.includes(',');
  const hasDot = s.includes('.');

  if (hasComma && hasDot) {
    // es: "4.317,00"
    s = s.replace(/\./g, '').replace(',', '.');
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  if (hasComma && !hasDot) {
    // es: "4317,00"
    s = s.replace(',', '.');
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  // solo punto, es: "126.90"
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

// ----------------------------------------------------------------

export default function ScaletteChiuseTable({ defaultDays = 7 }) {
  const [days, setDays] = React.useState(defaultDays);
  const [rows, setRows] = React.useState([]); // [{data:'DD-MM-YYYY', quota:number, incasso:number}]
  const [loading, setLoading] = React.useState(false);

  // carica cache dal localStorage
  const loadCache = React.useCallback(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  // salva cache nel localStorage
  const saveCache = React.useCallback((cacheObj) => {
    localStorage.setItem(LS_KEY, JSON.stringify(cacheObj));
  }, []);

  /**
   * ensureData:
   * - prende gli ultimi `days` giorni (ieri, ieri-1, ...)
   * - controlla quali di quei giorni NON sono in cache
   * - fa UNA query Firestore per il range minimo-massimo dei giorni mancanti
   * - aggrega per giorno:
   *    - SOLO documenti con completa === 2
   *    - quota = somma di tutte le quote (tutte le righe)
   *    - incasso = somma TUTTE le sommaTotale (tutte le righe)
   *      (replica la logica di ScalettaReview per avere lo stesso numero che
   *       tu consideri quello giusto, tipo 4317.00 e non 431700.00)
   * - salva in cache
   * - costruisce le righe finali in ordine cronologico (ieri -> indietro)
   */
  const ensureData = React.useCallback(async () => {
    setLoading(true);

    // 1. cache attuale
    const cache = loadCache();

    // 2. giorni target in ms
    const dayMsList = buildDaysArray(days);

    // 3. formati "DD-MM-YYYY" dei giorni target
    const wantDates = dayMsList.map(toDateStr);

    // 4. vedi quali giorni mancano in cache
    const missingDates = wantDates.filter(d => !cache[d]);

    if (missingDates.length > 0) {
      // range [min,max] su scalettaDataMilli per coprire TUTTI i missingDates
      const oldestMissingStr = missingDates[missingDates.length - 1]; // più vecchia
      const newestMissingStr = missingDates[0]; // più recente

      const minMs = startOfDayMs(moment(oldestMissingStr, 'DD-MM-YYYY').valueOf());
      const maxMs = endOfDayMs(moment(newestMissingStr, 'DD-MM-YYYY').valueOf());

      // Query Firestore dentro 'addNota'
      // prendiamo tutte le note con scalettaDataMilli nel range
      // poi filtriamo a livello client con completa===2
      const qRef = query(
        collection(db, 'addNota'),
        where('scalettaDataMilli', '>=', minMs),
        where('scalettaDataMilli', '<=', maxMs),
        orderBy('scalettaDataMilli'),
        limit(5000)
      );

      const snap = await getDocs(qRef);

      // Agg per giorno es:
      // agg = {
      //   "23-10-2025": { quota: 0, incasso: 0 },
      //   "22-10-2025": { quota: 0, incasso: 0 },
      //   ...
      // }
      const agg = {};

      snap.forEach(docSnap => {
        const d = docSnap.data();

        // consideriamo solo le scalette chiuse => completa === 2
        const completaNum = Number(String(d.completa ?? '').trim());
        if (completaNum !== 2) return;

        // normalizza giorno scaletta
        let dayStr =
          d.scalettaData ||
          moment(d.scalettaDataMilli ?? d.dataMilli).format('DD-MM-YYYY');
        dayStr = String(dayStr || '').trim();
        if (!dayStr) return;

        if (!agg[dayStr]) {
          agg[dayStr] = { quota: 0, incasso: 0 };
        }

        // quota: sommo tutte le quote riga per riga
        agg[dayStr].quota += toNumber(d.quota);

        // incasso: SOMMO TUTTE le sommaTotale, riga per riga
        // (esattamente come Somma Totale in ScalettaReview)
        agg[dayStr].incasso += toNumber(d.sommaTotale);
      });

      // salva in cache solo i giorni mancanti
      missingDates.forEach(ds => {
        cache[ds] = {
          quota: agg[ds]?.quota ?? 0,
          incasso: agg[ds]?.incasso ?? 0,
          _cachedAt: Date.now(),
        };
      });

      saveCache(cache);
    }

    // 5. costruisci le righe finali (ieri -> indietro)
    const finalRows = dayMsList.map(ms => {
      const ds = toDateStr(ms); // es "23-10-2025"
      const rec = cache[ds] || { quota: 0, incasso: 0 };
      return {
        data: ds,
        quota: rec.quota,
        incasso: rec.incasso,
      };
    });

    setRows(finalRows);
    setLoading(false);
  }, [days, loadCache, saveCache]);

  // ricalcola ogni volta che cambia `days`
  React.useEffect(() => {
    ensureData();
  }, [ensureData]);


  const formatEuro = (num) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);

  return (
    <div className='todo_containerInOrdine mt-5 mb-4' style={{paddingTop: 0}}>
      {/* Header + filtro giorni */}
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

      {/* Intestazione tabella */}
      <div className='row' style={{marginRight: 5}}>
        <div className='col-3'>
          <p className='coltext'>Data</p>
        </div>
        <div className='col-3' style={{padding: 0}}>
          <p className='coltext'>Quota</p>
        </div>
        <div className='col-3' style={{padding: 0}}>
          <p className='coltext'>Incasso Totale</p>
        </div>
        <hr style={{margin: 0}}/>
      </div>

      {/* Righe */}
      <div className="scroll">
        {loading && (
          <div style={{marginTop: 14}}>
            <CircularProgress/>
          </div>
        )}

        {!loading && rows.map(r => (
          <div key={r.data}>
            <div className='row' style={{padding: 0, marginRight: 5}}>
              <div className='col-3 diviCol'>
                <p className='inpTab'>{r.data}</p>
              </div>

              <div className='col-3 diviCol' style={{padding: 0}}>
                <p className='inpTab'>
                  €{r.quota.toFixed(2).replace('.', ',')}
                </p>
              </div>

              <div className='col-3 diviCol' style={{padding: 0}}>
                  <p className='inpTab'>{formatEuro(r.incasso)}</p>
              </div>

              <hr style={{margin: 0}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
