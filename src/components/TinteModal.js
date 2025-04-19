import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { TextField } from '@mui/material';
import { db } from '../firebase-config';

/**
 * Componente Modal per aggiungere o modificare una tinta.
 * Props:
 * - show: boolean per mostrare/nascondere il modal
 * - onClose: funzione chiamata alla chiusura del modal
 * - onSave: funzione chiamata dopo il salvataggio o update avvenuto con successo
 */
export default function TinteModal({ show, onClose, onSave }) {
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [tinte, setTinte] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tintaToDelete, setTintaToDelete] = useState(null);

  const tinteCollection = collection(db, 'tinte');

  useEffect(() => {
    if (!show) return;
    fetchTinte();
  }, [show]);

  const fetchTinte = async () => {
    try {
      const snapshot = await getDocs(tinteCollection);
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTinte(lista);
    } catch (err) {
      console.error('Errore fetch tinte:', err);
    }
  };

  const resetForm = () => {
    setBrand('');
    setPrice('');
    setError('');
    setSelectedId(null);
  };

  const handleBrandChange = (e) => {
    setBrand(e.target.value.toUpperCase());
    setError('');
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
  };

  const handleSelect = (tinta) => {
    setSelectedId(tinta.id);
    setBrand(tinta.brand);
    setPrice(tinta.prezzo ?? '');
    setError('');
  };

  const handleDeselect = () => {
    resetForm();
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'tinte', tintaToDelete.id));
      setTintaToDelete(null);
      fetchTinte();
      resetForm();
    } catch (err) {
      console.error('Errore eliminazione tinta:', err);
      setError("Errore durante l'eliminazione.");
    }
  };

  const handleSave = async () => {
    if (!brand.trim()) {
      setError('Il campo Brand è obbligatorio');
      return;
    }

    try {
      const q = query(
        tinteCollection,
        where('brand', '==', brand)
      );
      const snapshot = await getDocs(q);
      const exists = snapshot.docs.some(doc => doc.id !== selectedId);
      if (exists) {
        setError(`La tinta con brand "${brand}" esiste già.`);
        return;
      }

      if (selectedId) {
        const tintaRef = doc(db, 'tinte', selectedId);
        await updateDoc(tintaRef, {
          brand,
          prezzo: price ? parseFloat(price) : null
        });
      } else {
        await addDoc(tinteCollection, {
          brand,
          prezzo: price ? parseFloat(price) : null
        });
      }

      await fetchTinte();
      resetForm();
      onClose();
      if (onSave) onSave();
    } catch (err) {
      console.error('Errore salvataggio/update tinta:', err);
      setError("Si è verificato un errore durante l'operazione.");
    }
  };

  return (
    <Modal show={show} onHide={() => { resetForm(); onClose(); }} centered>
      <Modal.Header closeButton>
        <Modal.Title>{selectedId ? 'Modifica Tinta' : 'Aggiungi Nuova Tinta'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TextField
          fullWidth
          required
          label="Brand"
          value={brand}
          onChange={handleBrandChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          type="number"
          label="Prezzo"
          value={price}
          onChange={handlePriceChange}
          margin="normal"
          variant="outlined"
        />
        {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem', marginTop: '1rem' }}>
          {tinte.map(tinta => (
            <div key={tinta.id} style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              <Button
                variant={tinta.id === selectedId ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => handleSelect(tinta)}
              >
                {tinta.brand}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setTintaToDelete(tinta)}
              >
                ×
              </Button>
            </div>
          ))}
        </div>

        {/* Deseleziona in update mode */}
        {selectedId && (
          <Button variant="link" onClick={handleDeselect} style={{ marginTop: '0.5rem' }}>
            ➝ Torna ad Aggiungi Tinta
          </Button>
        )}

        {/* Messaggio conferma eliminazione */}
        {tintaToDelete && (
          <div style={{ marginTop: '1rem', padding: '0.5rem', border: '1px solid red', borderRadius: '4px', backgroundColor: '#ffe6e6' }}>
            <p>Sei sicuro di voler eliminare la tinta "{tintaToDelete.brand}"?</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button variant="danger" onClick={handleDelete}>Conferma Eliminazione</Button>
              <Button variant="secondary" onClick={() => setTintaToDelete(null)}>Annulla</Button>
            </div>
          </div>
        )}

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => { resetForm(); onClose(); }}>
          Annulla
        </Button>
        <Button style={{backgroundColor: "#152C51"}} variant="primary" onClick={handleSave}>
          {selectedId ? 'Aggiorna' : 'Conferma'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
