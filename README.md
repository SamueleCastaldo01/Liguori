# Gestionale per Officine Meccaniche  

Un'applicazione progettata per offrire funzionalità sia ai supervisori che ai clienti, semplificando la gestione delle attività e delle scadenze.  

## 📌 Funzionalità  

### 🔹 Lato Cliente  
- Accesso alle proprie schede di lavoro.  
- Consultazione dello scadenzario per i mezzi associati.  

### 🔹 Lato Supervisore  
- Gestione dell’anagrafica clienti.  
- Dashboard per il monitoraggio dei clienti.  
- Creazione e gestione delle schede di lavoro.  
- Scadenzario completo per la gestione delle revisioni.  

## 🚀 Tecnologie Utilizzate  
React js
Firebase

## Google Maps: configurazione degli indirizzi

Clienti e fornitori usano Places API (New). La chiave viene letta da
`REACT_APP_GOOGLE_MAPS_API_KEY` nel file `.env` (vedi `.env.example`).
Il campo resta utilizzabile manualmente anche senza Google Maps.

1. In Google Cloud selezionare il progetto che contiene la chiave e collegare
   un account di fatturazione attivo.
2. In **API e servizi > Libreria** abilitare **Maps JavaScript API** e
   **Places API (New)**. Il nuovo campo non richiede Places API (Legacy).
3. In **API e servizi > Credenziali**, aprire la chiave. In **Restrizioni API**
   consentire entrambe le API indicate sopra.
4. Impostare **Restrizioni applicazione > Siti web** e autorizzare i domini
   effettivamente usati, per esempio `https://liguorisrl-38c83.web.app/*`,
   `https://liguorisrl-38c83.firebaseapp.com/*` e, per lo sviluppo,
   `http://localhost:3000/*`. Aggiungere anche l'eventuale dominio personalizzato.
5. Impostare la chiave in `.env`, riavviare `npm start` e provare il campo indirizzo
   digitando almeno tre caratteri e scegliendo un suggerimento.
6. Per il sito pubblicato ricreare la build con `npm run build` e distribuire
   l'aggiornamento. Le variabili `REACT_APP_*` vengono inserite durante la build.

Non inserire chiavi in questo README. La chiave Maps per browser sarà visibile
nel sito compilato: le restrizioni su API e domini devono quindi restare attive.
