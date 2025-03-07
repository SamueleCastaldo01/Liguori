import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, where, getDocs, orderBy, serverTimestamp} from 'firebase/firestore';
import { useRef } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import moment from 'moment';
import TodoNota from '../components/TodoNota';
import { auth, db } from "../firebase-config";
import { IconButton } from '@mui/material';
import { supa, guid, tutti, flagStampa } from '../components/utenti';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';


function StampaMassiva({notaId, cont, nomeCli, dataNotaC, numCart, numBust, prezzoTotNota, debit, debTo, completa, idDebito, TodayData }) {

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

    const [todos, setTodos] = React.useState([]);
    const [todosAddNota, setTodosAddNota] = React.useState([]);

    let navigate = useNavigate();

    const [progress, setProgress] = React.useState(true);

    const [switchScaletta, setSwitchScaletta] = useState(false);

    const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone

    const timeElapsed = Date.now();  //prende la data attuale in millisecondi
    const today = new Date(timeElapsed);    //converte da millisecondi a data
    const dataInizialeFormatted = moment(TodayData, "DD/MM/YYYY").format("DD-MM-YYYY");
    const [scalettaDataSele, setScalettaDataSele] = useState(dataInizialeFormatted);

    var FlagT=false;   //flag per le tinte, viene salvato nel database serve per far riconoscere ogni singola trupla
    const [flagStampa, setFlagStampa] = React.useState(false);  //quando è falso si vedono le icone,


    const [Completa, setCompleta] = useState(completa);
   
    const [sumTot, setSumTot] =React.useState(prezzoTotNota);

    const componentRef = useRef();  //serve per la stampa

      const handleChangeDataScaletta = (e) => {
        setScalettaDataSele(moment(e.target.value).format("DD-MM-YYYY"));
        caricaNote(moment(e.target.value).format("DD-MM-YYYY"), switchScaletta);
        };

        const handleSwitchChange = () => {
          setSwitchScaletta(prev => {
            const newValue = !prev;
            caricaNote(scalettaDataSele, newValue); 
            return newValue; 
          });
        };
        
//_________________________________________________________________________________________________________________
const SommaTot = async () => {  //fa la somma totale, di tutti i prezzi totali
  var sommaTot=0;
    todos.map((nice) => {
      if (nomeCli == nice.nomeC && dataNotaC==nice.dataC) {   //se il nome della tinta è uguale ad un prodotto dell'array allora si prende il prezzo unitario
         sommaTot=+nice.prezzoTotProd + sommaTot;   // va a fare la somma totale
      }
    })
  var somTrunc = sommaTot.toFixed(2);

  setSumTot(somTrunc);
  localStorage.setItem("sumTotNota", somTrunc);
  await updateDoc(doc(db, "addNota", notaId), { sommaTotale: somTrunc});  //aggiorna la somma totale nell'add nota
}
//********************************************************************************** */ 

 useEffect(() => {
  caricaNote(scalettaDataSele, switchScaletta);
}, []);

const caricaNote = async (dataFil, scaletta) => {
  setProgress(false);
  const collectionRef = collection(db, "addNota");

  let q;
  if (scaletta) {
    q = query(
      collectionRef,
      where("scaletta", "==", true),
      where("scalettaData", "==", dataFil),
      orderBy("scalettaOrdine")
    );
  } else {
    q = query(
      collectionRef,
      where("data", "==", dataFil),
      orderBy("createdAt")
    );
  }

  // Ascolto la query
  const unsub = onSnapshot(q, async (querySnapshot) => {
    let todosArray = [];
    for (const doc of querySnapshot.docs) {
      const docData = doc.data();
      const idNota = doc.id; // Usa doc.id per ottenere l'ID del documento
      console.log(idNota);  // Stampa l'id del documento

      if (idNota) {
        const prodotti = await caricaProdotti(idNota);
        docData.prodotti = prodotti;
      } else {
        docData.prodotti = [];
      }

      todosArray.push({ ...docData, id: doc.id });
    }

    setTodosAddNota(todosArray);
    console.log(todosArray); // Per vedere la struttura dei dati
    setProgress(true);
  });

  return () => unsub();
}


const caricaProdotti = async (idNota) => {
  const collectionRef = collection(db, "Nota");
  const q = query(
    collectionRef,
    where("idNota", "==", idNota)  // Filtro per idNota
  );

  const querySnapshot = await getDocs(q); // Esegui la query per ottenere i prodotti

  const prodottiArray = [];
  querySnapshot.forEach((doc) => {
    prodottiArray.push({ ...doc.data(), id: doc.id }); // Aggiungi i prodotti all'array
  });

  return prodottiArray;
};

//_________________________________________________________________________________________________________________
  //stampa
 const handlePrint = useReactToPrint({
  content: () => componentRef.current,
  documentTitle: 'emp-data',
  onAfterPrint: () => setFlagStampa(false)
})

const print = async () => {
  setFlagStampa(true);
  setTimeout(function(){
    handlePrint();
  },1);
}
//*************************************************************** */
//************************************************************** */
//          INTERFACE                                             /
//************************************************************** */
    return (  
        <>
        {/**************NAVBAR MOBILE*************************************** */}
        <div className='navMobile row'>
      <div className='col-2'>
        <IconButton className="buttonArrow" aria-label="delete" sx={{ color: "#f6f6f6", marginTop: "7px" }}
        onClick={ ()=> {navigate(-1); }}>
        <ArrowBackIcon sx={{ fontSize: 30 }}/>
      </IconButton>
      </div>
      <div className='col' style={{padding: 0}}>
      <p className='navText'> Stampa Massiva </p>
      </div>
      </div>


    <div >

{!matches && 
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate(-1)}}>
      <ArrowBackIcon id="i" /></button> }

      
      {!matches ? <h1 className='title mt-3'> Stampa Massiva</h1> : <div style={{marginBottom:"60px"}}></div>} 

    <div className='d-flex gap-3 align-items-center justify-content-center'>
    <span><button onClick={print}>Stampa </button></span>
           <input
            type="date"
            value={moment(scalettaDataSele, "DD-MM-YYYY").format("YYYY-MM-DD")} // Converti per l'input
            onChange={(e) => handleChangeDataScaletta(e)} // Salva in formato gg-mm-yyyy
            />
            <h6 className='mb-0'>Numero note: {todosAddNota.length}</h6>
     <label>
        <span>Scaletta: </span>
        <input
          type="checkbox"
          checked={switchScaletta}
          onChange={handleSwitchChange}
        />
      </label>
    </div>

    

{/*********************DDT********************************************************************** */}
{!progress && <CircularProgress />}
{progress &&
    <div ref={componentRef} className="foglioA4 overflow-auto" style={{
      paddingLeft: "50px", 
      paddingRight: "50px", 
      paddingTop: "20px", 
      height: !flagStampa ? "90vh" : "auto"
  }}>

    {todosAddNota.map((todoAdd) => (
    <div key={todoAdd.id} style={{height: todoAdd.altezza}}>
      <>
      <div className='row rigaNota' >
        <div className='col colNotaSini' style={{textAlign:"left", padding:"0px", paddingLeft:"0px"}}>
        <h6 style={{fontSize:"9px"}}>MITTENTE: Ditta, Domicilio o Residenza, Codice Fiscale, Partita IVA</h6>
        <h5 style={{marginBottom:"0px", marginTop:"10px"}}>LIGUORI  <span style={{fontSize:"0.6em", marginRight:"10px"}} >s.r.l </span> <span style={{fontSize:"0.6em"}} > u.p.</span> </h5>
        <h5 className='sinistraNota'>Sede legale e deposito merci:</h5>
        <h5 className='sinistraNota'>Via F. Caracciolo 18</h5>
        <h5 className='sinistraNota'>80023 Caivano (NA)</h5>
        <h5 className='sinistraNota'>Cod.Fisc. e Partita IVA n.08319431212</h5>
        <h6 className='sinistraNota6'>R.I. 08319431212</h6>
        <h6 className='sinistraNota6'>R.E.A. NA 948532</h6>
        <h6 className='sinistraNota6' style={{marginBottom:"5px"}}>Cap.Soc. €10.000,00 I.V.</h6>
        </div>

        <div className='col'  style={{textAlign:"left", padding:"0px", marginLeft:"5px"}}>
        <h3  style={{marginBottom:"-5px", fontSize:"22.5px"}}><b>DOCUMENTO DI TRASPORTO</b></h3>
        <h4 style={{marginBottom:"9px"}}><b>(D.d.t.)</b> <span style={{fontSize:"0.4em", marginRight:"10px"}}>&emsp;&ensp; D.P.R. 472 del 14-08-1996-D.P.R 696 del 21.12.1996 </span></h4>
        <h4 style={{marginBottom:"9px"}}> <b>N.</b> <span style={{marginRight:"10px"}}>{todoAdd.cont}</span> <span style={{fontSize:"13px"}}><b>del</b></span> {dataNotaC} </h4>

    <div class="form-check form-check-inline"  style={{padding:"0px", fontSize:"13px"}}>a mezzo: &nbsp; &nbsp;
    <input id="checkbox3" type="checkbox" checked="checked"/>
      <label for="checkbox3">&nbsp;mittente</label>
    </div>
    </div>
    </div>

    <div className='row rigaNota'>
    <div className='col colNotaSini'style={{textAlign:"left", padding:"0px", paddingLeft:"0px"}}>
    <h6 style={{fontSize:"9px"}}>DESTINATARIO: Ditta, Codice Fiscale, Partita IVA</h6>
      <div className='row'>
      <h5 style={{marginBottom:"0px", marginTop:"0px"}}> {todoAdd.nomeC} </h5>
        <h5 className='sinistraNota'>{todoAdd.indirizzo}</h5>
        <h5 className='sinistraNota'>Tel {todoAdd.tel}</h5>
        <h5 className='sinistraNota'  style={{marginBottom:"5px"}}>Cod.Fisc. e Partita IVA n.{todoAdd.partitaIva}</h5>
      </div>
    </div>

      <div className='col'  style={{textAlign:"left", padding:"0px", marginLeft:"5px"}}>
      <h6 style={{fontSize:"9px"}}>LUOGO DI DESTINAZIONE</h6>
      </div>
    </div>
{/***********tabella aggiunta prodotto************************************************** */}
  <div className='row' style={{textAlign:"center", background:"#212529", color:"#f6f6f6"}}>
    <div className='col-1' style={{padding:"0px"}}>Qt</div>
    <div className='col-6' style={{padding:"0px"}}>Prodotto</div>
    <div className='col-2' style={{padding:"0px"}}>Prezzo Uni</div>
    <div className='col-2' style={{padding:"0px"}}>Prezzo Totale</div>
  </div>


{/** tabella dei prodotti */}
<div className="scrollNota">
  {progress == false && 
  <div style={{marginTop: "14px"}}>
      <CircularProgress />
  </div>
      }
  {todoAdd.prodotti.map((todo) => (
    <div key={todo.id}>

      <>
    { ta === true &&(
    <TodoNota
      key={todo.id}
      todo={todo}
      nomeCli={nomeCli}
      flagStampa={flagStampa}
      Completa={Completa}
      SommaTot={SommaTot}
    />
     )}
     </>

    </div>
  ))}
  </div>

  <div className='row'>
    <div className='col' style={{textAlign:"left", padding:"0px"}}>
    <h6 className='mt-2'>Numero Cartoni: <span> {todoAdd.NumCartoni} </span> 
    </h6> 
    <h6 className='mt-2'>Numero Buste: <span> {todoAdd.NumBuste} </span> 
    </h6> 
       </div>

    <div className='col' style={{textAlign:"right", padding:"0px"}}>
    <h6>Totale: {todoAdd.sommaTotale} €</h6>
    <h6>Debito Residuo: {todoAdd.debitoRes} €</h6>
    <h6>Debito Totale: {todoAdd.debitoTotale} €</h6>
    </div>

  </div>
     </>
    </div>
  ))}

    </div>
}

</div>
    </>
      )
}
export default StampaMassiva;