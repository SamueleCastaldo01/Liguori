import React from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase-config';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import { supa, guid, tutti } from '../components/utenti';

export default function InOrdineTable() {
  // permessi
  const sup = supa.includes(localStorage.getItem('uid'));
  const gui = guid.includes(localStorage.getItem('uid'));
  const ta  = tutti.includes(localStorage.getItem('uid'));

  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const qRef = query(collection(db, 'inOrdine'), orderBy('dataC'));
    const unsub = onSnapshot(qRef, (snap) => {
      const arr = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setItems(arr);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    if (!sup) return; // solo super
    // se preferisci usare il tuo toast di conferma, sostituisci questo confirm
    if (window.confirm('Eliminare questa riga?')) {
      await deleteDoc(doc(db, 'inOrdine', id));
    }
  };

  const filtered = items.filter((it) => {
    if (!searchTerm) return true;
    const n = (it.nomeC || '').toLowerCase();
    return n.includes(searchTerm.toLowerCase());
  });

  return (
    <div className='todo_containerInOrdine mt-5 mb-4' style={{paddingTop: 0}}>
      {/* header */}
      <div className='row'>
        <div className='col'>
          <p className='colTextTitle'>In ordine</p>
        </div>
        <div className='col' />
        <div className='col' style={{ paddingRight: 20, paddingTop: 8, paddingBottom: 6 }}>
          <TextField
            className="inputSearch"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            type="text"
            placeholder="Ricerca Cliente"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color='secondary'/>
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
        </div>
      </div>

      {/* intestazioni colonne */}
      <div className='row' style={{marginRight: 5}}>
        <div className='col-4'><p className='coltext'>Cliente</p></div>
        <div className='col-1' style={{padding: 0}}><p className='coltext'>Qt</p></div>
        <div className='col-4' style={{padding: 0}}><p className='coltext'>Prodotto</p></div>
        <div className='col-2' style={{padding: 0}}><p className='coltext'>Data Inserimento</p></div>
        <hr style={{margin: 0}}/>
      </div>

      {/* corpo tabella */}
      <div className="scroll">
        {loading && (
          <div style={{marginTop: 14}}>
            <CircularProgress />
          </div>
        )}

        {!loading && filtered.map((row) => (
          <div key={row.id}>
            <div className='row' style={{padding: 0, marginRight: 5}}>
              <div className='col-4 diviCol'>
                <p className='inpTab'>{row.nomeC || ''}</p>
              </div>
              <div className='col-1 diviCol' style={{padding: 0}}>
                <p className='inpTab'>{row.qtProdotto ?? ''}</p>
              </div>
              <div className='col-4 diviCol' style={{padding: 0}}>
                <p className='inpTab'>{row.prodottoC || ''}</p>
              </div>
              <div className='col-2 diviCol' style={{padding: 0}}>
                <p className='inpTab'>{row.dataC || ''}</p>
              </div>

              {sup && (
                <div className='col-1 diviCol' style={{padding: 0, marginTop: -8}}>
                  <button className='button-delete' onClick={() => handleDelete(row.id)}>
                    <DeleteIcon id="i" />
                  </button>
                </div>
              )}
              <hr style={{margin: 0}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
