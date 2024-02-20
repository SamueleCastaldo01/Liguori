import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, where, getDocs, orderBy, serverTimestamp} from 'firebase/firestore';
import TodoNotaDashCli from '../components/TodoNotaDashCli';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import moment from 'moment';
import BeenhereIcon from '@mui/icons-material/Beenhere';
import TodoNotaDip from '../components/TodoNotaDip';
import { auth, db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate, useParams } from 'react-router-dom';
import { supa, guid, tutti, flagStampa } from '../components/utenti';
import { WhatsappShareButton, WhatsappIcon, EmailShareButton, EmailIcon } from 'react-share';
import CircularProgress from '@mui/material/CircularProgress';


function NotaDashCliente({}) {

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

    const { nome } = useParams();
    const { data } = useParams();

    const string = "https://logic-2220e.web.app/notadashcliente/"+nome+"/"+data;
    const url = string.replace(/ /g, '%20');  //conversione da stringa a url

    const [todos, setTodos] = React.useState([]);
    const [todosAddNot, setTodosAddNot] = React.useState([]);
    const [numeroPagineNota, setNumeroPagineNota] = useState("");
    const [Progress, setProgress] = React.useState(false);

    const timeElapsed = Date.now();  //prende la data attuale in millisecondi
    const today = new Date(timeElapsed);    //converte da millisecondi a data

    var FlagT=false;   //flag per le tinte, viene salvato nel database serve per far riconoscere ogni singola trupla
    const [flagStampa, setFlagStampa] = React.useState(false);  //quando è falso si vedono le icone,
    const [checked, setChecked] = React.useState(false);
   
    const [sumTot, setSumTot] =React.useState("");

    const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone

    let navigate = useNavigate();

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
//********************************************************************************** */
    //array per la tabella prodotti
     React.useEffect(() => {
        const collectionRef = collection(db, "NotaBloccata");
        const q = query(collectionRef,  orderBy("prodottoC"));
        const unsub = onSnapshot(q, (querySnapshot) => {
          let todosArray = [];
          querySnapshot.forEach((doc) => {
            todosArray.push({ ...doc.data(), id: doc.id });
          });
          setTodos(todosArray);
          setProgress(true);
        });
        localStorage.removeItem("NotaDipId");
        return () => unsub();
      }, []);

      //array di add nota
      React.useEffect(() => {
        const collectionRef = collection(db, "addNotaBloccata");
        const q = query(collectionRef, orderBy("dataMilli"));
        const unsub = onSnapshot(q, (querySnapshot) => {
          let todosArray = [];
          querySnapshot.forEach((doc) => {
            todosArray.push({ ...doc.data(), id: doc.id });
          });
          setTodosAddNot(todosArray);
        });
        localStorage.removeItem("OrdId");
        return () => unsub();
      }, []);

  //******************************************************************* */
     //funzioni per la conferma della nota e per il calcolo del prezzo dei prodotti, e mettere nella lista inOrdine
     const SommaTot = async (id, nomeC ) => {  //fa la somma totale, di tutti i prezzi totali
      var sommaTot=0;
      todos.map((nice) => {
        if (nomeC == nice.nomeC && data ==nice.dataC) {   //se il nome della tinta è uguale ad un prodotto dell'array allora si prende il prezzo unitario
           sommaTot=+nice.prezzoTotProd + sommaTot;   // va a fare la somma totale
        }
      })
    var somTrunc = sommaTot.toFixed(2);
  
    setSumTot(somTrunc);
    localStorage.setItem("sumTotNota", somTrunc);
    await updateDoc(doc(db, "addNota", id), { sommaTotale: somTrunc});  //aggiorna la somma totale nell'add nota
    }

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
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8550341729584646"
        crossorigin="anonymous"></script>
    {/**************NAVBAR MOBILE*************************************** */}
      <div className='navMobile row'>
      <div className='col-2'>
        <IconButton className="buttonArrow" aria-label="delete" sx={{ color: "#f6f6f6", marginTop: "7px" }}
        onClick={ ()=> {navigate("/dashclienti"); }}>
        <ArrowBackIcon sx={{ fontSize: 30 }}/>
      </IconButton>
      </div>
      <div className='col' style={{padding: 0}}>
      <p className='navText'> NotaDashCliente </p>
      </div>
      </div>

  {!matches &&
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate("/dashclienti")}}>
      <ArrowBackIcon id="i" /></button> 
  }

  {matches && <div style={{marginTop: "50px"}}></div>}

      <span><button onClick={print}>Stampa </button></span>

{sup == true && 
  <>
  <WhatsappShareButton url={url}>
        <WhatsappIcon type="button" size={40} round={true} />
    </WhatsappShareButton>
    <EmailShareButton url={url}>
        <EmailIcon type="button" size={40} round={true} />
    </EmailShareButton>
  </>
}

{/****Nota*****************/}
<div ref={componentRef} className="foglioA4" style={{ }}>
  <div className='container' style={{paddingLeft: "24px", paddingRight: "24px"}}>
    {todosAddNot.map((todo) => (
    <div key={todo.id}>
    { todo.data == data  && nome == todo.nomeC &&  (
      <>
      <div className='row' style={{marginTop: "40px"}} >
        <div className='col colNotaSini' style={{textAlign:"left", padding:"0px", paddingLeft:"0px"}}>
        <h5 className='titleNotaDip' style={{marginBottom:"0px", marginTop:"0px"}}> {todo.nomeC} </h5>
        </div>

        <div className='col'  style={{textAlign:"left", padding:"0px", marginLeft:"5px"}}>
        <h4 className='titleNotaDip' style={{marginBottom:"9px"}}> <span style={{fontSize:"13px"}}><b>del</b></span> {todo.data} </h4>
    </div>
    </div>

    {/***********tabella note prodotto************************************************** */}
  <div className='row' style={{textAlign:"center", background:"#212529", color:"#f6f6f6"}}>
    <div className='col-1' style={{padding:"0px"}}>Qt</div>
    <div className='col-7' style={{padding:"0px"}}>Prodotto</div>
    <div className='col-2' style={{padding:"0px"}}>Prezzo Uni(€)</div>
    <div className='col-2' style={{padding:"0px"}}>Prezzo Tot(€)</div>
  </div>

{/** tabella dei prodotti solo la lista */}
  <div className="scrollNota">
  {Progress == false && 
  <div style={{marginTop: "14px"}}>
      <CircularProgress />
  </div>
      }
  {todos.map((todo1) => (
    <div key={todo1.id}>
    {todo1.nomeC  === todo.nomeC && todo1.dataC == todo.data &&  (
      <>
    <TodoNotaDashCli
      key={todo1.id}
      todo={todo1}
      handleDelete={""}
      handleEdit={""}
      displayMsg={displayMsg}
      nomeCli={nome}
      flagStampa={flagStampa}
      Completa={todo.completa}
      SommaTot={SommaTot}
    />
     </>
                  )}
    </div>
  ))}
  </div>

  {/*******************Tasti per passare da una nota ad un altra*************************************************************** */}
  {todo.cont > 1 &&
    <button type="button" className="skipPageLef" style={{padding: "0px"}} onClick={ () =>{  }}>
        <KeyboardArrowLeftIcon sx={{ fontSize: 40 }} id="i" />
        </button>
  }
  {todo.cont < numeroPagineNota &&
    <button type="button" className="skipPageRi" style={{padding: "0px"}} onClick={ () =>{ }}>
        <KeyboardArrowRightIcon sx={{ fontSize: 40 }} id="i" />
        </button>
  }

  <div className='row'>
    <div className='col'></div>
    <div className='col' style={{textAlign: 'right'}}>
        <h6>Somma totale: {todo.sommaTotale}€</h6>
        <h6>Debito residuo: {todo.debitoRes}€</h6>
        <h6>Debito totale: {todo.debitoTotale}€</h6>
    </div>
  </div> 

     </>
                  )}

    </div>
  ))}


<div style={{marginTop:"15vh"}}></div>
    </div>

    </div>

  
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8550341729584646"
        crossorigin="anonymous"></script>
    </>
      )
}
export default NotaDashCliente;