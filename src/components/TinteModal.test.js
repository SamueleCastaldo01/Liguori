import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { addDoc, collection, doc, getDocs, query, updateDoc } from 'firebase/firestore';
import TinteModal from './TinteModal';

jest.mock('../firebase-config', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({ collection: jest.fn(), doc: jest.fn(), getDocs: jest.fn(),
  query: jest.fn(), where: jest.fn(), addDoc: jest.fn(), updateDoc: jest.fn(), deleteDoc: jest.fn() }));

const family = { id: 'cb', brand: 'CB', prezzo: 5, fornitoreId: 'supplier-a', nomeF: 'Fornitore A' };
beforeEach(() => {
  collection.mockImplementation((db, name) => ({ name }));
  doc.mockImplementation((db, name, id) => ({ name, id }));
  query.mockImplementation((ref) => ({ ...ref, filtered: true }));
  getDocs.mockImplementation(async ({ name, filtered }) => ({ docs: (name === 'fornitore'
    ? [{ id: 'supplier-a', nomeF: 'Fornitore A' }, { id: 'supplier-b', nomeF: 'Fornitore B' }]
    : filtered ? [] : [family]).map(item => ({ id: item.id, data: () => item })) }));
});

test('loads an existing family supplier and persists a changed association without losing its price', async () => {
  const onSave = jest.fn();
  render(<TinteModal show onClose={jest.fn()} onSave={onSave} />);
  fireEvent.click(await screen.findByRole('button', { name: 'CB' }));
  expect(screen.getByLabelText('Fornitore per ordine automatico')).toHaveTextContent('Fornitore A');
  fireEvent.mouseDown(screen.getByLabelText('Fornitore per ordine automatico'));
  fireEvent.click(await screen.findByRole('option', { name: 'Fornitore B' }));
  fireEvent.click(screen.getByRole('button', { name: 'Aggiorna' }));
  await waitFor(() => expect(updateDoc).toHaveBeenCalledWith({ name: 'tinte', id: 'cb' }, {
    brand: 'CB', prezzo: 5, fornitoreId: 'supplier-b', nomeF: 'Fornitore B',
  }));
  await waitFor(() => expect(onSave).toHaveBeenCalled());
  expect(addDoc).not.toHaveBeenCalled();
});
