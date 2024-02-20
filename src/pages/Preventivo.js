import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, where, getDocs, orderBy, serverTimestamp, getCountFromServer, limit, clearIndexedDbPersistence } from 'firebase/firestore';
import { useRef } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import moment from 'moment';
import BeenhereIcon from '@mui/icons-material/Beenhere';
import TodoNota from '../components/TodoNota';
import TodoPreventivo from '../components/TodoPreventivo';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from "@mui/icons-material/Delete";
import { auth, db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { IconButton } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { notifyUpdateProd, notifyUpdateNota, notifyUpdateDebRes} from '../components/Notify';
import { supa, guid, tutti, flagStampa } from '../components/utenti';
import { fontSize } from '@mui/system';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";



function Preventivo({notaId, notaDat, cont, nomeCli, dataNota, nProd, dataNotaC, numCart, numBust, prezzoTotNota, debit, debTo, indirizzo, tel, iva, completa, idDebito }) {

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

    const [todos, setTodos] = React.useState([]);
    const [todosInOrdine, setTodosInOrdine] = React.useState([]);
    const [todosInSospeso, setTodosInSospeso] = React.useState([]);

    const [updateProdo, setUpdateProd] = React.useState(0);
    const [dataSc, setDataSc] = React.useState(notaDat);

    let navigate = useNavigate();

    const [Progress, setProgress] = React.useState(false);

    const [prodottoC, setProdottoC] = React.useState("");
    const [numProd, setNumProd] = React.useState(nProd);
    const [t1, setT1] = React.useState("");   //tinte, che dentro una trupla ci possono essere massimo 5
    const [t2, setT2] = React.useState("");
    const [t3, setT3] = React.useState("");
    const [t4, setT4] = React.useState("");
    const [t5, setT5] = React.useState("");
    const [nomTin, setnomTin] = React.useState("");

    const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone
    const [alignment, setAlignment] = React.useState('scorta');

    const timeElapsed = Date.now();  //prende la data attuale in millisecondi
    const today = new Date(timeElapsed);    //converte da millisecondi a data

    var FlagT=false;   //flag per le tinte, viene salvato nel database serve per far riconoscere ogni singola trupla
    const [flagStampa, setFlagStampa] = React.useState(false);  //quando è falso si vedono le icone,

    const [flagInOrdine, setFlagInOrdine] = React.useState(false);  //quando è falso si vedono le icone
    const [flagInSospeso, setFlagInSospeso] = React.useState(false);  //quando è falso si vedono le icone,

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

        else if(localStorage.getItem("flagRemove") == 1 ) {
          handleDeleteInOrdine(localStorage.getItem("IDNOTa"));
        }

        else if(localStorage.getItem("flagRemove")  == 2) {
          handleDeleteInSospeso(localStorage.getItem("IDNOTa"));
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
  await updateDoc(doc(db, "addPrev", notaId), { sommaTotale: somTrunc});  //aggiorna la somma totale nell'add nota
}
//********************************************************************************** */ 
      React.useEffect(() => {
        const collectionRef = collection(db, "preventivo");
        const q = query(collectionRef, where("dataC", "==", dataNotaC), where("nomeC", "==", nomeCli), limit(1000));
        const unsub = onSnapshot(q, (querySnapshot) => {
          let todosArray = [];
          querySnapshot.forEach((doc) => {
            todosArray.push({ ...doc.data(), id: doc.id });
          });

          // Ordina l'array in base a createdAt
          todosArray.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());

          setTodos(todosArray);
          setProgress(true);
        });
        localStorage.removeItem("NotaId");
        return () => unsub();
      }, [updateProdo]);

      React.useEffect(() => {
        const collectionRef = collection(db, "inOrdine");
        const q = query(collectionRef, orderBy("prodottoC"));
        const unsub = onSnapshot(q, (querySnapshot) => {
          let todosArray = [];
          querySnapshot.forEach((doc) => {
            todosArray.push({ ...doc.data(), id: doc.id });
          });
          setTodosInOrdine(todosArray);
        });
        return () => unsub();
      }, [todos, sumTot]);

      React.useEffect(() => {
        const collectionRef = collection(db, "inSospeso");
        const q = query(collectionRef, orderBy("prodottoC"));
        const unsub = onSnapshot(q, (querySnapshot) => {
          let todosArray = [];
          querySnapshot.forEach((doc) => {
            todosArray.push({ ...doc.data(), id: doc.id });
          });
          setTodosInSospeso(todosArray);
        });
        return () => unsub();
      }, []);

      React.useEffect(() => {
        SommaTot()
      }, [todos, sumTot]);
//********************************************************************************** */
  //aggiunge un prodotto nella nota
const createCate = async () => {
  await addDoc(collection(db, "preventivo"), {
    dataC: dataNotaC,
    nomeC: nomeCli,
    qtProdotto: 1,
    prodottoC,
    complete: false,
    artPreso: false,
    simbolo: "",
    simbolo2: "",
    meno: 0,
    flagEt: false,
    t1,
    t2,
    t3,
    t4,
    t5,
    nomTin,
    flagTinte: FlagT,
    prezzoUniProd,
    prezzoTotProd,
    createdAt: serverTimestamp(),
  });
  setUpdateProd(updateProdo +1)
};

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
  await updateDoc(doc(db, "preventivo", todo.id), 
  { qtProdotto: qt, prodottoC:prod, prezzoUniProd:prezU, prezzoTotProd:somTrunc, t1:tt1, t2:tt2, t3:tt3, t4:tt4, t5:tt5});
  toast.clearWaitingQueue(); 
  SommaTot();
  setUpdateProd(updateProdo +1)
};

//_________________________________________________________________________________________________________________
const handleEditCompAnn = async (e) => {  //completa
  setDebTot(0)
  await updateDoc(doc(db, "addPrev", notaId), { completa: localStorage.getItem("completa")}) ;
  setUpdateProd(updateProdo +1)
};


const AlteStamp = async (e) => {  //handle se nel caso si voglia modificare il debito residuo
  //cambiare l'altezza per la stampa
  var conProd = 0;
  var altez = 1123;
  var nProd = 19;
  const coll = collection(db, "preventivo");   //vado a fare il conteggio dei prodotti presenti nella nota
  const q = query(coll, where("nomeC", "==", nomeCli), where("dataC", "==", dataNotaC));
  const snapshot = await getCountFromServer(q);
  conProd = snapshot.data().count

  while (conProd > nProd)  {
      nProd = nProd + 25;
      altez = altez + 1123;
  } 
  var StrAlt = altez + "px"  //conversione da numero a stringa
    await updateDoc(doc(db, "addPrev", notaId), { altezza: StrAlt}); //aggiorna l'altezza 
};


const handleConferma = async () => {
  var sumNota;
  SommaTot();   //va a rifare la somma totale dei prodotti
  sumNota=localStorage.getItem("sumTotNota");
  var debTot= +sumNota+(+debitoRes);   
  await updateDoc(doc(db, "addPrev", notaId), { completa: localStorage.getItem("completa")});  //aggiorna la somma totale del ddt con tutti i debiti nell'add nota

  AlteStamp(); //va a fare il controllo tramite il numero di prodotti, per andare a definire l'altezza della pagina che ci serve per la stampa

  setUpdateProd(updateProdo +1)
      toast.clearWaitingQueue(); 
};
//_________________________________________________________________________________________________________________
const handleDelete = async (id) => {
  const colDoc = doc(db, "preventivo", id); 
  await deleteDoc(colDoc); 
  SommaTot();
  setUpdateProd(updateProdo +1)
};

const handleDeleteInOrdine = async (id) => {
  const colDoc = doc(db, "inOrdine", id); 
  await deleteDoc(colDoc); 
};

const handleDeleteInSospeso = async (id) => {
  const colDoc = doc(db, "inSospeso", id); 
  await deleteDoc(colDoc); 
};

const handleChangeTogg = (event) => {
  setAlignment(event.target.value);
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
      <p className='navText'> Preventivo </p>
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

      
      {!matches ? <h1 className='title mt-3'> Preventivo </h1> : <div style={{marginBottom:"60px"}}></div>} 

      <ToggleButtonGroup
      color="primary"
      value={alignment}
      exclusive
      onChange={handleChangeTogg}
      aria-label="Platform"
    > 

    {Completa ==0 && 
    <>
    <Button onClick={() => {FlagT=false; createCate(); }} size="small" variant="contained">Aggiungi Prodotto</Button>
    <Button onClick={() => {FlagT=true; createCate();}} size="small" variant="contained">Aggiungi Tinte</Button>
    </>}
    {sup == true &&<Button onClick={print} size="small" variant="contained">Stampa</Button>}

    </ToggleButtonGroup>

{/**********tabella in ordine********************** */}
{flagInOrdine == true && 
<div className='todo_containerInOrdine mt-5' style={{paddingTop: "0px"}}>
<div className='divClose'>  <button type='button' className="button-close float-end" onClick={() => { setFlagInOrdine(false); }}>
              <CloseIcon id="i" />
              </button> </div>
<div className='row' > 
<div className='col-8'>
<p className='colTextTitle'> In ordine </p>
</div>
</div>
<div className='row' style={{marginRight: "5px"}}>
<div className='col-4' >
<p className='coltext' >Cliente</p>
</div>
<div className='col-1' style={{padding: "0px"}}>
<p className='coltext' >Qt</p>
</div>
<div className='col-4' style={{padding: "0px"}}>
<p className='coltext' >Prodotto</p>
</div>
<div className='col-2' style={{padding: "0px"}}>
<p className='coltext' >Data Inserimento</p>
</div>
    <hr style={{margin: "0"}}/>
</div>

{todosInOrdine.map((todo) => (
    <div key={todo.id}>
    { todo.nomeC === nomeCli && 
    <div className='row' style={{padding: "0px", marginRight: "5px"}}>
      <div className='col-4 diviCol'><p className='inpTab'>{todo.nomeC} </p> </div>
      <div className='col-1 diviCol' style={{padding: "0px"}}><p className='inpTab'>{todo.qtProdotto}</p></div>
      <div className='col-4 diviCol' style={{padding: "0px"}}><p className='inpTab'>{todo.prodottoC}</p></div>
      <div className='col-2 diviCol' style={{padding: "0px"}}><p className='inpTab'>{todo.dataC}</p></div>
      {sup ===true && ( 
        <>
      <div className="col-1 diviCol" style={{padding:"0px", marginTop:"-8px"}}>
        <button className="button-delete" onClick={() =>{
          localStorage.setItem("flagRemove", 1);
           localStorage.setItem("IDNOTa", todo.id);
           displayMsg();
           toast.clearWaitingQueue(); }}>
          <DeleteIcon id="i" />
        </button>
    </div>  
        </>
        )}
      <hr style={{margin: "0"}}/>
    </div>
    }
    </div>
  ))}
  </div>  
  }

{/**********tabella in sospeso********************** */}
{flagInSospeso== true && 
<div className='todo_containerInOrdine mt-5' style={{paddingTop:"0px"}}>
<div className='divClose'>  <button type='button' className="button-close float-end" onClick={() => { setFlagInSospeso(false); }}>
              <CloseIcon id="i" />
              </button> </div>
<div className='row' > 
<div className='col-8'>
<p className='colTextTitle'> In sospeso </p>
</div>
</div>
<div className='row' style={{marginRight: "5px"}}>
<div className='col-4' >
<p className='coltext' >Cliente</p>
</div>
<div className='col-1' style={{padding: "0px"}}>
<p className='coltext' >Qt</p>
</div>
<div className='col-4' style={{padding: "0px"}}>
<p className='coltext' >Prodotto</p>
</div>
<div className='col-2' style={{padding: "0px"}}>
<p className='coltext' >Data Inserimento</p>
</div>
    <hr style={{margin: "0"}}/>
</div>

{todosInSospeso.map((todo) => (
    <div key={todo.id}>
    { todo.nomeC === nomeCli && 
    <div className='row' style={{padding: "0px", marginRight: "5px"}}>
      <div className='col-4 diviCol'><p className='inpTab'>{todo.nomeC} </p> </div>
      <div className='col-1 diviCol' style={{padding: "0px"}}><p className='inpTab'>{todo.qtProdotto}</p></div>
      <div className='col-4 diviCol' style={{padding: "0px"}}><p className='inpTab'>{todo.prodottoC}</p></div>
      <div className='col-2 diviCol' style={{padding: "0px"}}><p className='inpTab'>{todo.dataC}</p></div>
      <div className="col diviCol" style={{padding:"0px", marginTop:"-8px"}}>
        {sup ===true && (   
          <>
      <div className="col-1 diviCol" style={{padding:"0px", marginTop:"-8px"}}>
        <button className="button-delete" onClick={() =>{ 
          localStorage.setItem("flagRemove", 2);
            localStorage.setItem("IDNOTa", todo.id);
            displayMsg();
            toast.clearWaitingQueue(); }}>
          <DeleteIcon id="i" />
        </button>
    </div>  
        </>
        )}
    </div>
      <hr style={{margin: "0"}}/>
    </div>
    }
    </div>
  ))}
  </div>  
  }

{/*********************DDT***************************** */}
<div>
    {Completa== 0 ? 
      <button type="button" className="button-delete" style={{padding: "0px", float: "left"}}>
        <BeenhereIcon sx={{ fontSize: 40 }}/>
        </button> :
        <button type="button" className="button-complete" style={{padding: "0px", float: "left"}}>
        <BeenhereIcon sx={{ fontSize: 40 }}/>
        </button>
        }
</div>
    <div ref={componentRef} className="foglioA4" style={{paddingLeft:"50px", paddingRight:"50px", paddingTop:"20px"}}>
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
        <h3  style={{marginBottom:"-5px", fontSize:"22.5px"}}><b>PREVENTIVO</b></h3>
        <h4 style={{marginBottom:"9px"}}> <b>N.</b> <span style={{marginRight:"10px"}}>{cont}</span> <span style={{fontSize:"13px"}}><b>del</b></span> {moment(dataNota.toDate()).format("L")} </h4>

    </div>
    </div>

    <div className='row rigaNota'>
    <div className='col colNotaSini'style={{textAlign:"left", padding:"0px", paddingLeft:"0px"}}>
    <h6 style={{fontSize:"9px"}}>DESTINATARIO: Ditta, Codice Fiscale, Partita IVA</h6>
      <div className='row'>
      <h5 style={{marginBottom:"0px", marginTop:"0px"}}> {nomeCli} </h5>
        <h5 className='sinistraNota'>{indirizzo}</h5>
        <h5 className='sinistraNota'>Tel {tel}</h5>
        <h5 className='sinistraNota'  style={{marginBottom:"5px"}}>Cod.Fisc. e Partita IVA n.{iva}</h5>
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
    {todo.nomeC  === nomeCli && todo.dataC == dataNotaC &&  (
      <>
    { ta === true &&(
    <TodoPreventivo
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


    <div className='col' style={{textAlign:"right", padding:"0px"}}>
    <h6>Totale: {sumTot} €</h6>
    {flagStampa == false && <>
  {Completa==0 ?  <button onClick={ ()=> {localStorage.setItem("completa", 1); setCompleta(1);  handleConferma()}}>Conferma</button> :
    <button onClick={ ()=> {localStorage.setItem("completa", 0); setCompleta(0); handleEditCompAnn(); }}>Annulla Conferma</button>
     }
  </>}

    
    </div>

  </div>
    </div>
    <div style={{marginBottom: "120px"}}></div>
</motion.div>
    </>
      )
}
export default Preventivo;