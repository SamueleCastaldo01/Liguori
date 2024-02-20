import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, where, getDocs, orderBy, serverTimestamp} from 'firebase/firestore';
import { useRef } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import moment from 'moment';
import BeenhereIcon from '@mui/icons-material/Beenhere';
import TodoNota from '../components/TodoNota';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from "@mui/icons-material/Delete";
import { auth, db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { IconButton } from '@mui/material';
import { supa, guid, tutti, flagStampa } from '../components/utenti';
import { fontSize } from '@mui/system';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';


function StampaMassiva({notaId, cont, nomeCli, dataNotaC, numCart, numBust, prezzoTotNota, debit, debTo, completa, idDebito }) {

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

    const [todos, setTodos] = React.useState([]);
    const [todosAddNota, setTodosAddNota] = React.useState([]);

    let navigate = useNavigate();

    const [Progress, setProgress] = React.useState(false);

    const [prodottoC, setProdottoC] = React.useState("");
    const [t1, setT1] = React.useState("");   //tinte, che dentro una trupla ci possono essere massimo 5
    const [t2, setT2] = React.useState("");
    const [t3, setT3] = React.useState("");
    const [t4, setT4] = React.useState("");
    const [t5, setT5] = React.useState("");
    const [nomTin, setnomTin] = React.useState("");

    const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone

    const timeElapsed = Date.now();  //prende la data attuale in millisecondi
    const today = new Date(timeElapsed);    //converte da millisecondi a data

    var FlagT=false;   //flag per le tinte, viene salvato nel database serve per far riconoscere ogni singola trupla
    const [flagStampa, setFlagStampa] = React.useState(false);  //quando è falso si vedono le icone,

    const [flagInOrdine, setFlagInOrdine] = React.useState(false);  //quando è falso si vedono le icone
    const [flagInSospeso, setFlagInSospeso] = React.useState(false);  //quando è falso si vedono le icone,

    const [NumCart, setNumCart] = React.useState(numCart);
    const [NumBuste, setNumBuste] = React.useState(numBust);
    const [Completa, setCompleta] = useState(completa);
   
    const [sumTot, setSumTot] =React.useState(prezzoTotNota);
    const [debitoTot, setDebTot] = React.useState(debTo);
    const [debitoRes, setDebitoRes] = React.useState(debit);

    const [qtProdotto, setQtProdotto] = React.useState("1");
    const [prezzoUniProd, setprezzoUniProd] = React.useState("");
    const [prezzoTotProd, setprezzoTotProd] = React.useState("");

    const componentRef = useRef();  //serve per la stampa
   //_________________________________________________________________________________________________________________
     //confirmation notification to remove the collection
     const Msg = () => (
      <div style={{fontSize: "16px"}}>
        <p style={{marginBottom: "0px"}}>Sicuro di voler eliminare</p>
        <p style={{marginBottom: "0px"}}>(perderai tutti i dati)</p>
        <button className='buttonApply ms-4 mt-2 me-1 rounded-4' onClick={Remove}>Si</button>
        <button className='buttonClose mt-2 rounded-4'>No</button>
      </div>
    )

      const Remove = () => {
        if(localStorage.getItem("flagRemove") == 0 ) {
          handleDelete(localStorage.getItem("IDNOTa"));
        }
          toast.clearWaitingQueue(); 
               }

    const displayMsg = () => {
      toast.warn(<Msg/>, {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "dark",
        className: "rounded-4"
        })}
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
    React.useEffect(() => {
    const collectionRef = collection(db, "addNota");
    const q = query(collectionRef, orderBy("createdAt"));
    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setTodosAddNota(todosArray);
      setProgress(true);
    });
    return () => unsub();
  }, []);     

    React.useEffect(() => {
        const collectionRef = collection(db, "Nota");
        const q = query(collectionRef, orderBy("createdAt"));
        const unsub = onSnapshot(q, (querySnapshot) => {
          let todosArray = [];
          querySnapshot.forEach((doc) => {
            todosArray.push({ ...doc.data(), id: doc.id });
          });
          setTodos(todosArray);
          setProgress(true);
        });
        localStorage.removeItem("NotaId");
        return () => unsub();
      }, []);

//_________________________________________________________________________________________________________________
const handleEdit = async ( todo, qt, prod, prezU, prezT, tt1, tt2, tt3, tt4, tt5, nomTinte) => {
  var conTinte=0;    //alogoritmo per le tinte
  if(tt1) {conTinte=conTinte+1}
  if(tt2) {conTinte=conTinte+1}
  if(tt3) {conTinte=conTinte+1}
  if(tt4) {conTinte=conTinte+1}
  if(tt5) {conTinte=conTinte+1}
  if(todo.flagTinte == false){ 
    nomTinte=""
  conTinte=1 }
  var preT= (conTinte*qt)*prezU;  //qui va a fare il prezzo totale del prodotto in base alla quantità e al prezzo unitario
  if(todo.simbolo == "(NO)"){ preT=0;  }   //se il simbolo è no, non va a fare il suo prezzo totale
  var somTrunc = preT.toFixed(2);
  await updateDoc(doc(db, "Nota", todo.id), 
  { qtProdotto: qt, prodottoC:prod, prezzoUniProd:prezU, prezzoTotProd:somTrunc, t1:tt1, t2:tt2, t3:tt3, t4:tt4, t5:tt5});
  toast.clearWaitingQueue(); 
  SommaTot();
};
//_________________________________________________________________________________________________________________
const handleDelete = async (id) => {
  const colDoc = doc(db, "Nota", id); 
  await deleteDoc(colDoc); 
  SommaTot();
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


        <motion.div
        initial= {{opacity: 0}}
        animate= {{opacity: 1}}
        transition={{ duration: 0.7 }}>

{!matches && 
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate(-1)}}>
      <ArrowBackIcon id="i" /></button> }

      
      {!matches ? <h1 className='title mt-3'> Stampa Massiva</h1> : <div style={{marginBottom:"60px"}}></div>} 

    <span><button onClick={print}>Stampa </button></span>

{/*********************DDT********************************************************************** */}
    <div ref={componentRef} className="foglioA4" style={{paddingLeft:"50px", paddingRight:"50px", paddingTop:"20px"}}>

    {todosAddNota.map((todoAdd) => (
    <div key={todoAdd.id} style={{height: todoAdd.altezza}}>
    {todoAdd.completa  == 1 && todoAdd.data == dataNotaC &&  (
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
  {Progress == false && 
  <div style={{marginTop: "14px"}}>
      <CircularProgress />
  </div>
      }
  {todos.map((todo) => (
    <div key={todo.id}>
    {todo.nomeC  === todoAdd.nomeC && todo.dataC == todoAdd.data &&  (
      <>
    { ta === true &&(
    <TodoNota
      key={todo.id}
      todo={todo}
      handleDelete={handleDelete}
      handleEdit={handleEdit}
      displayMsg={displayMsg}
      nomeCli={nomeCli}
      flagStampa={flagStampa}
      Completa={Completa}
      SommaTot={SommaTot}
    />
     )}
     </>
                  )}
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
                  )}
    </div>
  ))}

    </div>

</motion.div>
    </>
      )
}
export default StampaMassiva;