import React, { useEffect, useState, useRef } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, orderBy, serverTimestamp, getCountFromServer, limit, where, getDocs} from 'firebase/firestore';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Input } from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { notifyErrorCliEm, notifyUpdateCli, notifyErrorCliList } from '../components/Notify';
import CloseIcon from '@mui/icons-material/Close';
import TodoClient from '../components/TodoClient';
import Button from '@mui/material/Button';
import { Modal } from 'react-bootstrap';
import { supa, guid, tutti, primary, rosso } from '../components/utenti';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete, { usePlacesWidget } from "react-google-autocomplete";
import TodoDebiCli from '../components/TodoDebiCli';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import moment from 'moment';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

const GOOGLE_MAPS_API_KEY = 'AIzaSyA2327mULUbMv_7eW1baIeXRwbnfYLYBWo';


function AddCliente( {getCliId} ) {

  const [todos, setTodos] = React.useState([]);
  const [todosDebi, setTodosDebi] = React.useState([]);
  const [crono, setCrono] = React.useState([]);

  const [idClinEdit, setIdClinEdit] = React.useState([]);

  const [idCliente, setIdCliente] = React.useState("");
  const [indirizzo, setIndirizzo] = React.useState("");
  const [via, setVia] = React.useState("");
  const [stato, setStato] = React.useState("");
  const [indirizzoLink, setIndirizzoLink] = React.useState("");
  const [nomeC, setNomeC] = React.useState("");
  const [nome, setNome] = React.useState("");
  const [cognome, setCognome] = React.useState("");
  const [partitaIva, setPartitaIva] = React.useState("");
  const [indirizzoEmail, setIndirizzoEmail] = React.useState("");
  const [citta, setCitta] = React.useState("");
  const [cap, setCap] = React.useState("");
  const [numeroCivico, setNumeroCivico] = React.useState("");
  const [cellulare, setCellulare] = React.useState("");

  const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone

  const [deb1, setDeb1] = React.useState("");
  const [deb2, setDeb2] = React.useState("");
  const [deb3, setDeb3] = React.useState("");
  const [deb4, setDeb4] = React.useState("");
  const [debitoTot, setDebitoTot] = React.useState("");

  const [Progress, setProgress] = React.useState(false);
  const [ProgressDebi, setProgressDebi] = React.useState(false);

  const [alignment, setAlignment] = React.useState('scorta');

  const [Totdeb1, setTotDeb1] = React.useState("");
  const [Totdeb2, setTotDeb2] = React.useState("");
  const [Totdeb3, setTotDeb3] = React.useState("");
  const [Totdeb4, setTotDeb4] = React.useState("");
  const [TotdebitoTot, setTotDebitoTot] = React.useState("");

  const [popupActive, setPopupActive] = useState(false);
  const [popupActiveEdit, setPopupActiveEdit] = useState(false);
  const [flagAnaCli, setFlagAnaCli] = useState(true);   
  const [flagDebiCli, setFlagDebiCli] = useState(false);
  const [flagDelete, setFlagDelete] = useState(false);  
  const [popupActiveCrono, setPopupActiveCrono] = useState(false);  

  const [searchTerm, setSearchTerm] = useState("");  //search
  const [searchTermDeb, setSearchTermDeb] = useState("");  //search
  const [searchTermCrono, setSearchTermCrono] = useState("");  //search
  const inputRef= useRef();
  const inputRefDeb= useRef();
  const inputRefCrono= useRef();


  //permessi utente
  let sup= supa.includes(localStorage.getItem("uid"))
  let gui= guid.includes(localStorage.getItem("uid"))
  let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

  let navigate = useNavigate();
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
          handleDelete(localStorage.getItem("IDscal"), localStorage.getItem("IdCliProd") );
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
      //Anagrafiche cliente
React.useEffect(() => {
    const collectionRef = collection(db, "clin");
    const q = query(collectionRef, orderBy("nomeC"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      todosArray.sort((a, b) => a.nomeC.localeCompare(b.nomeC));
      setTodos(todosArray);
      setProgress(true);
    });
    return () => unsub();

  }, [flagAnaCli == true]);
  
  //debito
  React.useEffect(() => {
    const collectionRef = collection(db, "debito");
    const q = query(collectionRef, orderBy("nomeC"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setTodosDebi(todosArray);
      setProgressDebi(true)
    });
    return () => unsub();
  }, [flagDebiCli == true]);


  //somma totale debito
    React.useEffect(() => {
    sommaTotDebito();
  }, [todosDebi]);


                  //cronologia debito
  React.useEffect(() => {
    const collectionRef = collection(db, "cronologiaDeb");
    const q = query(collectionRef, limit(50), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setCrono(todosArray);
    });
    return () => unsub();
  }, [popupActiveCrono == true]);
 //******************************************************************************* */
  //speed
  function handleButtonDebito() {
    setFlagAnaCli(false)
    setFlagDebiCli(true)
    setPopupActiveCrono(false)
  } 

  function handleButtonAna() {
    setFlagAnaCli(true)
    setFlagDebiCli(false)
    setPopupActiveCrono(false)
  } 

  function handleButtonCronoDeb() {
    setFlagAnaCli(false)
    setFlagDebiCli(false)
    setPopupActiveCrono(true)
  } 

  const handleChangeTogg = (event) => {
    setAlignment(event.target.value);
  };
 //******************************************************************************* */
    //funzione che permette il caricamento automatico dell'aggiunta del prodotto personalizzato
 const handleProdClien = async (nomeCompleto, idCliente) => {    //funzione che si attiva quando si aggiunge un prodotto a scorta
  const q = query(collection(db, "prodotto"));  //prendo tutti i prodotti che si trovano in scorta, per poi assegnarli per ogni cliente
  const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      console.log(doc.id, " => ", doc.data().nomeP, doc.data().prezzoIndi);
      await addDoc(collection(db, "prodottoClin"), {    //va ad aggiunger i prodotti per ogni cliente
        author: { name: nomeCompleto, idCliente: idCliente },
        idProdotto:doc.data().idProdotto,
        nomeP: doc.data().nomeP,
        prezzoUnitario: doc.data().prezzoIndi
      })
      });
 }  
  //******************************************************************************* */
 const handleSubmit = async (e, id) => {   //creazione cliente
    e.preventDefault();
    var idCliente="1";  //id del cliente
    var bol= true

    if(!nome) {            //controllo sul nome
      notifyErrorCliEm();
      toast.clearWaitingQueue(); 
      return 
    }

    var nomNice= nome+" "+cognome
    const q = query(collection(db, "clin"), where("nomeC", "==", nomNice));  //controllo che non sia duplicato nel database
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
    if (doc.data().nomeC == nomNice) {
        notifyErrorCliList()
         toast.clearWaitingQueue(); 
        bol=false
    }
    });

    //vado a prendere l'id dell'ultimo cliente, in modo tale da aggiungere il nuovo id al nuovo ordine
    const d = query(collection(db, "clin"), orderBy("createdAt", "desc"), limit(1));  
    const querySnapshotd = await getDocs(d);
    // Controlla se ci sono risultati nella query
    if (!querySnapshotd.empty) {
      // Se la query ha trovato almeno un ordine, ottieni l'ID dell'ultimo ordine e incrementalo per il nuovo ID
      querySnapshotd.forEach((doc) => {
        idCliente = doc.data().idCliente.substring(1); //va a prendere la stringa e allo stesso tempo gli toglie la prima lettera
        console.log(idCliente)
        let idClinInt = parseInt(idCliente) + 1 //fa la converisione in intero. e fa la somma
        console.log(idClinInt)
        idCliente = idClinInt.toString()  // lo riconverte in stringa
        console.log()

      });
    }

    idCliente= "C" + idCliente

    if(bol == true) {
    let  nomeCompleto = nome + " " + cognome
      handleProdClien(nomeCompleto, idCliente);
      await addDoc(collection(db, "clin"), {
        createdAt: serverTimestamp(),
        idCliente,
        nome,
        cognome,
        stato,
        numeroCivico,
        via,
        citta,
        cap,
        indirizzoEmail,
        nomeC: nomeCompleto,
        indirizzo,
        indirizzoLink: "https://www.google.com/maps/search/?api=1&query="+indirizzo,
        partitaIva,
        cellulare,
      });
      await addDoc(collection(db, "debito"), {   //quando si crea il cliente viene creata anche la trupla debito del cliente
        idCliente,
        nomeC: nomeCompleto,
        deb1,
        deb2,
        deb3,
        deb4,
        debitoTot,
      });
      handlerSetClear()
      setPopupActive(false);
    }
  };
//****************************************************************************************** */
  const handlerSetClear = async ( ) => {
    setNomeC("");
    setNome("");
    setCognome("");
    setStato("");
    setVia("");
    setNumeroCivico("");
    setCitta("");
    setCap("");
    setIndirizzoEmail("");
    setIndirizzo("");
    setIndirizzoLink("");
    setPartitaIva("");
    setCellulare("");
  };

//****************************************************************************************** */
const handleActiveEdit = async (todo) => {
  setIdClinEdit(todo.id)
  setIndirizzo(todo.indirizzo)
  setPopupActiveEdit(true)
  setNomeC("");
  setNome(todo.nome);
  setCognome(todo.cognome);
  setStato(todo.stato);
  setVia(todo.via);
  setNumeroCivico(todo.numeroCivico);
  setCitta(todo.citta);
  setCap(todo.cap);
  setIndirizzoEmail(todo.indirizzoEmail);
  setIdCliente(todo.idCliente)
  setPartitaIva(todo.partitaIva);
  setCellulare(todo.cellulare);
};
  const handleEdit = async () => { //va ad aggiornare le info del cliente, e va a cambiare anche il nome alla tabella debito
    console.log(idCliente)
    await updateDoc(doc(db, "clin", idClinEdit), {nomeC:nome+" "+cognome, nome: nome, cognome:cognome, stato:stato, indirizzo:indirizzo, indirizzoLink: "https://www.google.com/maps/search/?api=1&query="+indirizzo, numeroCivico:numeroCivico, citta:citta, cap:cap, indirizzoEmail:indirizzoEmail, partitaIva:partitaIva, cellulare:cellulare});
    
    const q = query(collection(db, "debito"), where("idCliente", "==", idCliente));  //vado a trovare il deb1 vecchio tramite query
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (hi) => {
      await updateDoc(doc(db, "debito", hi.id), {nomeC:nome+" "+cognome});
    });
    handlerSetClear();
    setPopupActiveEdit(false)
    toast.clearWaitingQueue(); 
  };

//****************************************************************************************** */
const sommaTotDebito = async ( ) => {  //va a fare la somma dei debiti per ogni cliente, questa operazione è costosa in scrittura, e anche la somma per colonne
  var sommaTot=0;
  var totD1=0;
  var totD2=0;
  var totD3=0;
  var totD4=0;
  var totDebTot=0;
  todosDebi.map(async (nice) => {
       sommaTot=+nice.deb1 + (+nice.deb2) + (+nice.deb3) + (+nice.deb4);   // va a fare la somma totale dei debiti di quel id debito per cliente
       totD1= +nice.deb1 + (+totD1);   //va a fare la somma di tutti i debiti1
       totD2= +nice.deb2 + (+totD2);   //va a fare la somma di tutti i debiti2
       totD3= +nice.deb3 + (+totD3);   //va a fare la somma di tutti i debiti3
       totD4= +nice.deb4 + (+totD4);   //va a fare la somma di tutti i debiti4
       totDebTot= +nice.debitoTot + (+totDebTot);   //va a fare la somma di tutti i debitiTotale dei clienti
       var somTrunc = sommaTot.toFixed(2);    //fa la conversione per ottenere i due numeri dopo la virgola
       await updateDoc(doc(db, "debito", nice.id), { debitoTot: somTrunc});  //va ad aggiornare il debito totale nel database per cliente
       sommaTot=0;  //riazzera la sommaTot, anche se di norma non serve
  })  
  var somTrunc1 = totD1.toFixed(2);  //convesione per i numeri dopo la virgola, per non avere problemi
  var somTrunc2 = totD2.toFixed(2);
  var somTrunc3 = totD3.toFixed(2);
  var somTrunc4 = totD4.toFixed(2);   
  var somTruncTotDeb = totDebTot.toFixed(2);
      setTotDeb1(somTrunc1);
      setTotDeb2(somTrunc2);
      setTotDeb3(somTrunc3);
      setTotDeb4(somTrunc4);
      setTotDebitoTot(somTruncTotDeb);
};

  const handleEditDeb = async ( todo, nome, dd1, dd2, dd3, dd4) => {  //edit debito
    var debV
    const q = query(collection(db, "debito"), where("idCliente", "==", todo.idCliente));  //vado a trovare il deb1 vecchio tramite query
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      debV= doc.data().deb1;
    });
    await updateDoc(doc(db, "debito", todo.id), { nomeC:nome, deb1:dd1, deb2:dd2, deb3:dd3, deb4:dd4});  //qui vado ad aggiornare il nuovo valore
    if(debV != dd1) {    //se il debito varia allora viene aggiunta la trupla, cronologiaDeb, altrimenti niente
      handleCronologia(todo, dd1, debV)
    }
    toast.clearWaitingQueue(); 
    setPopupActiveEdit(false);
  };
  //----------------------------------------------------------------------------------------------
  const handleCronologia = async (todo, dd1, debV) => {
    const collectionRef = collection(db, "cronologiaDeb");
    const q = query(collectionRef, orderBy("createdAt"), limit(50)); // Limite impostato a 10 documenti
  
    await addDoc(collectionRef, {
      autore: auth.currentUser.displayName,
      createdAt: serverTimestamp(),
      nomeC: todo.nomeC,
      idCliente: todo.idCliente,
      deb1: dd1, //debito nuovo
      debv: debV,
    });
  };

  const handleDelete = async (id, nomeCli) => { //per cancellare un cliente dal db
    const colDoc = doc(db, "clin", id); 
     
  //elimina tutti i dati di prodottoClin con lo stesso id del Cliente     elimina tutti gli articoli di quel cliente
    const q = query(collection(db, "prodottoClin"), where("author.idCliente", "==", localStorage.getItem("IdCliProd")));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (hi) => {
  // doc.data() is never undefined for query doc snapshots
    await deleteDoc(doc(db, "prodottoClin", hi.id)); 
    });
  //elimina la trupla debito, che ha lo stesso nome del cliente che è stato eliminato
    const p = query(collection(db, "debito"), where("idCliente", "==", localStorage.getItem("IdCliProd")));
    const querySnapshotP = await getDocs(p);
    querySnapshotP.forEach(async (hi) => {
    await deleteDoc(doc(db, "debito", hi.id));    //elimina il documento che ha lo stesso nome
    });

    //elimina la trupla debito, che ha lo stesso nome del cliente che è stato eliminato
      const s = query(collection(db, "cronologiaDeb"), where("idCliente", "==", localStorage.getItem("IdCliProd")));
      const querySnapshotS = await getDocs(s);
      querySnapshotS.forEach(async (hi) => {
      await deleteDoc(doc(db, "cronologiaDeb", hi.id));    //elimina il documento che ha lo stesso nome
      });
    //infine elimina il cliente
    await deleteDoc(colDoc); 
  };

//**************************************************************************** */
//                              NICE
//********************************************************************************** */
    return ( 
    <>  
{/**************NAVBAR MOBILE*************************************** */}
<div className='navMobile row'>
      <div className='col-2'>
      </div>
      <div className='col' style={{padding: 0}}>
      <p className='navText'> Lista Clienti </p>
      </div>
      </div>

    <motion.div 
        initial= {{x: "-100vw"}}
        animate= {{x: 0}}
        transition={{ duration: 0.4 }}>

{!matches && 
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate(-1)}}>
      <ArrowBackIcon color='primary' id="i" /></button> 
    }

  {!matches ? <h1 className='title mt-3' style={{ textAlign: "left", marginLeft: "70px" }}>Anagrafica Clienti</h1> : <div style={{marginBottom:"60px"}}></div>} 


    {/******Aggiungi Cliente  modal***************************************************************************** */}
    <div className=''>
    <Modal  size="lg" show={popupActive || popupActiveEdit} onHide={()=> {/*setPopupActive(false); setPopupActiveEdit(false); handlerSetClear();*/}} style={{ marginTop: "50px", zIndex: "1050"}}>
      <div>  <button type='button' className="button-close float-end" onClick={() => { setPopupActive(false); setPopupActiveEdit(false); handlerSetClear()}}>
              <CloseIcon id="i" /></button> </div>
    {popupActive && <h4 className='title'  style={{ width: "300px", position: "absolute", top: "10px", marginLeft: "2px" }}> Aggiungi Cliente </h4>}
    {popupActiveEdit && <h4 className='title'  style={{ width: "300px", position: "absolute", top: "10px", marginLeft: "2px" }}> Modifica Cliente </h4>}
          <Modal.Body style={{  }}>
      <div className='row mt-4' >
        <div className='col'>
            <TextField className='' style={{width:"100%"}} color='secondary' id="filled-basic" label="Nome" variant="outlined" autoComplete='off' value={nome} 
              onChange={(e) => setNome(e.target.value)}/>
        </div>
        <div className='col'>
          <TextField className='' style={{width:"100%"}} color='secondary' id="filled-basic" label="Cognome" variant="outlined" autoComplete='off' value={cognome} 
              onChange={(e) => setCognome(e.target.value)}/>
        </div>
      </div>
      <div className='row mt-4 mb-4' style={{ paddingBottom: "-50px" }}><div >
            <TextField className='' style={{width:"100%"}} color='secondary' id="filled-basic"  label="Partita IVA" variant="outlined" autoComplete='off' value={partitaIva} 
            onChange={(e) => setPartitaIva(e.target.value)}/>
      </div></div>

    
            <div className='pac-container' style={{ position: "absolute", top: "200px" }}>
                <Input style={{ width: "765px" }}
                  fullWidth 
                  className='inpCli' 
                  color="primary" 
                  placeholder='Indirizzo Google Maps'
                  inputComponent={({ inputRef, onFocus, onBlur, ...props }) => (
                    <Autocomplete
                      apiKey={GOOGLE_MAPS_API_KEY}
                      {...props}
                      onPlaceSelected={(place) => {
                        setIndirizzo(place.formatted_address)
                        console.log(place);
                      }}
                      options={{
                        types: ["address"],
                        componentRestrictions: { country: "it" },
                      }}
                      defaultValue={indirizzo}
                    />
                  )}
                />
          </div>
   

          <div className='row mt-4' style={{ paddingTop: "60px"  }}><div >
            <TextField className='' style={{width:"100%"}} color='secondary' id="filled-basic" type='email' label="Indirizzo email" variant="outlined" autoComplete='off' value={indirizzoEmail} 
            onChange={(e) => setIndirizzoEmail(e.target.value)}/>
        </div></div>
          <div className='row mt-4' >
            <div className='col'>
              <TextField className='' style={{width:"100%"}} color='secondary' type='number' id="filled-basic" label="Telefono" variant="outlined" autoComplete='off' value={cellulare} 
              onChange={(e) => setCellulare(e.target.value)}/>
            </div>
            <div className='col'>
              {popupActive && <Button onClick={handleSubmit} style={{ width: "100%", height: "50px" }} className='' type='submit' color='primary' variant="contained" >Aggiungi Cliente </Button>}
              {popupActiveEdit && <Button onClick={handleEdit} style={{ width: "100%", height: "50px" }} className='' type='submit' color='primary' variant="contained" >Modifica Cliente </Button>}  
            </div>
          </div> 
          </Modal.Body>
      </Modal>
      </div>

{/********************Bottoni Menu************************************************************************/}
      <div style={{ justifyContent: "left", textAlign: "left", marginTop: "40px" }}>
      <ToggleButtonGroup
      color="primary"
      value={alignment}
      exclusive
      onChange={handleChangeTogg}
      aria-label="Platform"
    > 
    {sup == true &&<Button variant='contained'   style={{borderTopRightRadius: "0px", borderBottomRightRadius: "0px" }}  onClick={() => { setPopupActive(true) }} >Aggiungi Cliente</Button>}
      <Button   style={{color: primary, backgroundColor: "#CCCBCBCC", borderColor: primary, borderStyle: "solid", borderWidth: "2px", borderRadius: "0px" }} size="small" onClick={handleButtonAna} variant="contained" value="scorta">Anagrafiche Clienti</Button>
      <Button style={{color: primary, backgroundColor: "#CCCBCBCC", borderColor: primary, borderStyle: "solid", borderWidth: "2px",  borderRadius: "0px" }}  onClick={handleButtonDebito} variant="contained" value="scortatinte">Debito Clienti</Button>
      <Button  style={{color: primary, backgroundColor: "#CCCBCBCC", borderColor: primary, borderStyle: "solid", borderWidth: "2px",  borderRadius: "0px" }} onClick={handleButtonCronoDeb} variant="contained" value="cronologia">Cronologia Debito</Button> 
      {sup == true && <Button style={{borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px" }}   color='error' size="small" onClick={() => {setFlagDelete(!flagDelete)}}  variant="contained">elimina</Button> }
    </ToggleButtonGroup>
</div>

{/********************tabella Anagrafica Clienti************************************************************************/}
{flagAnaCli &&
<div className='todo_containerCli'>
<div className='row' > 
<div className='col-7'>
<p className='colTextTitle'>Anagrafica Clienti </p>
</div>

<div className='col'>
<TextField
      inputRef={inputRef}
      className="inputSearch"
      onChange={event => {setSearchTerm(event.target.value)}}
      type="text"
      placeholder="Ricerca Cliente"
      InputProps={{
      startAdornment: (
      <InputAdornment position="start">
      <SearchIcon color='secondary'/>
      </InputAdornment>
                ),
                }}
       variant="outlined"/>
</div>
</div>
<div className='row' style={{marginRight: "5px"}}>
<div className='col-1' style={{ width: "90px" }}>
<p className='coltext' >Id Cliente</p>
</div>
<div className='col-3' >
<p className='coltext' >Cliente</p>
</div>
<div className='col-2' style={{ width:"260px" }}>
<p className='coltext' >email</p>
</div>
<div className='col-2'  style={{ width:"120px" }}>
<p className='coltext' >Telefono</p>
</div>
<div className='col-3' style={{padding: "0px", width: "295px"}}>
<p className='coltext' >indirizzo</p>
</div>
<div className='col-1' style={{padding: "0px"}}>
<p className='coltext' >Part. IVA</p>
</div>
    <hr style={{margin: "0"}}/>
</div>

<div className="scroll">
{Progress == false && 
  <div style={{marginTop: "14px"}}>
      <CircularProgress />
  </div>
      }
{todos.filter((val)=> {
        if(searchTerm === ""){
          return val
      } else if (val.nomeC.toLowerCase().includes(searchTerm.toLowerCase()) ) {
        return val
                }
            }).map((todo) => (
    <div key={todo.id}>
    { ta === true &&(
    <TodoClient
      key={todo.id}
      todo={todo}
      handleActiveEdit={handleActiveEdit}
      handleDelete={handleDelete}
      handleEdit={handleEdit}
      displayMsg={displayMsg}
      getCliId={getCliId}
      flagDelete= {flagDelete}
    />
     )}
    </div>
  ))}
  </div>
  </div>
  }
{/********************tabella Debito***********************************************************************************************/}
{flagDebiCli &&
<div className='todo_containerDebCli'>
<div className='row' > 
<div className='col-7'>
<p className='colTextTitle'> Debito Clienti </p>
</div>
<div className='col' style={{ paddingBottom: "7px"}}>
<TextField
      inputRef={inputRefDeb}
      className="inputSearch"
      onChange={event => {setSearchTermDeb(event.target.value)}}
      type="text"
      placeholder="Ricerca Cliente, Id Cliente"
      InputProps={{
      startAdornment: (
      <InputAdornment position="start">
      <SearchIcon color='secondary'/>
      </InputAdornment>
                ),
                }}
       variant="outlined"/>
  </div>
</div>
{/**********Totale debiti**************************************** */}
<div className='row' style={{marginRight: "5px"}}>
<div className='col-4' >
<p className='coltext' ></p>
</div>
<div className='col' style={{padding: "0px"}}>
<p className='coltext' >Tot.Debito1</p>
</div>
<div className='col' style={{padding: "0px"}}>
<p className='coltext' >Tot.Debito2</p>
</div>
<div className='col' style={{padding: "0px"}}>
<p className='coltext' >Tot.Debito3</p>
</div>
<div className='col' style={{padding: "0px"}}>
<p className='coltext' >Tot.Debito4</p>
</div>
<div className='col' style={{padding: "0px"}}>
<p className='coltext' >Tot.Debito Tot</p>
</div>
<hr style={{margin: "0"}}/>
</div>

<div className='row' style={{marginRight: "5px"}}>
<div className='col-4 diviCol' >
<p className='inpTab' ></p>
</div>
<div className='col diviCol' style={{padding: "0px"}}>
<p className='inpTab' >€{Number(Totdeb1).toFixed(2).replace('.', ',')}</p>
</div>
<div className='col diviCol' style={{padding: "0px"}}>
<p className='inpTab' >€{Number(Totdeb2).toFixed(2).replace('.', ',')}</p>
</div>
<div className='col diviCol' style={{padding: "0px"}}>
<p className='inpTab' >€{Number(Totdeb3).toFixed(2).replace('.', ',')}</p>
</div>
<div className='col diviCol' style={{padding: "0px"}}>
<p className='inpTab' >€{Number(Totdeb4).toFixed(2).replace('.', ',')}</p>
</div>
<div className='col diviCol' style={{padding: "0px"}}>
<p className='inpTab' >€{Number(TotdebitoTot).toFixed(2).replace('.', ',')}</p>
</div>
<hr style={{margin: "0"}}/>
</div>
{/**********Debito clienti**************************************** */}
<div className='row' style={{marginRight: "5px"}}>
<div className='col-1' >
<p className='coltext' >Id Cliente</p>
</div>
<div className='col-3' >
<p className='coltext' >Cliente</p>
</div>
<div className='col' style={{padding: "0px"}}>
<p className='coltext' >Debito1</p>
</div>
<div className='col' style={{padding: "0px"}}>
<p className='coltext' >Debito2</p>
</div>
<div className='col' style={{padding: "0px"}}>
<p className='coltext' >Debito3</p>
</div>
<div className='col' style={{padding: "0px"}}>
<p className='coltext' >Debito4</p>
</div>
<div className='col' style={{padding: "0px"}}>
<p className='coltext' >Debito Tot</p>
</div>
<hr style={{margin: "0"}}/>
</div>

<div className="scroll" style={{maxHeight: "790px"}}>
{ProgressDebi == false && 
  <div style={{marginTop: "14px"}}>
      <CircularProgress />
  </div>
      }
{todosDebi.filter((val)=> {
        if(searchTermDeb === ""){
          return val
      } else if (val.nomeC.toLowerCase().includes(searchTermDeb.toLowerCase()) || val.idCliente.toLowerCase().includes(searchTermDeb.toLowerCase()) ) {
        return val
                }
            }).map((todo) => (
    <div key={todo.id}>
    { ta === true &&(
    <TodoDebiCli
      key={todo.id}
      todo={todo}
      handleDelete={handleDelete}
      handleEditDeb={handleEditDeb}
      displayMsg={displayMsg}
      getCliId={getCliId}
    />
     )}
    </div>
  ))}
  </div>
  </div>
  }
{/* tabella cronologiaDebito*******************************************************************************************************************/}
{popupActiveCrono &&
  <div className='todo_containerCli'>
  <div className='row'> 
  <div className='col'>
  <p className='colTextTitle'> Cronologia Debito</p>
  </div>
<div className='col' style={{textAlign: "right", paddingRight:"20px"}}>
<TextField
      inputRef={inputRefCrono}
      className="inputSearch"
      onChange={event => {setSearchTermCrono(event.target.value)}}
      type="text"
      placeholder="Ricerca Cliente, Id Cliente"
      InputProps={{
      startAdornment: (
      <InputAdornment position="start">
      <SearchIcon color='secondary'/>
      </InputAdornment>
                ),
                }}
       variant="outlined"/>
  </div>
</div>
  <div className='row' style={{marginRight: "5px"}}>
      <div className='col-2'><p className='coltext' >DataModifica</p></div>
      <div className='col-1' style={{padding: "0px"}}><p className='coltext' >Id Cliente</p> </div>
      <div className='col-3' style={{padding: "0px"}}><p className='coltext' >Cliente</p> </div>
      <div className='col-3' style={{padding: "0px"}}><p className='coltext'>Utente</p></div>
      <div className='col-1' style={{padding: "0px"}}><p className='coltext'>Deb1V</p></div>
      <div className='col-1' style={{padding: "0px"}}><p className='coltext'>Deb1N</p></div>
      <hr style={{margin: "0"}}/>
    </div>
    <div className="scroll">
  {crono.filter((val)=> {
        if(searchTermCrono === ""){
          return val
      } else if (val.nomeC.toLowerCase().includes(searchTermCrono.toLowerCase()) || val.idCliente.toLowerCase().includes(searchTermDeb.toLowerCase()) ) {
        return val
                }
            }).map((col) => (
    <div key={col.id}>
    <div className='row' style={{padding: "0px"}}>
      <div className='col-2 diviCol'><p className='inpTab'>{moment(col.createdAt.toDate()).calendar()}</p></div>
      <div className='col-1 diviCol' style={{padding: "0px"}}><p className='inpTab'>{col.idCliente} </p> </div>
      <div className='col-3 diviCol' style={{padding: "0px"}}><p className='inpTab'>{col.nomeC.substr(0, 18)} </p> </div>
      <div className='col-3 diviCol' style={{padding: "0px"}}><p className='inpTab'>{col.autore.substr(0, 10)}...</p></div>
      <div className='col-1 diviCol' style={{padding: "0px"}}><p className='inpTab'>€{Number(col.debv).toFixed(2).replace('.', ',')}</p></div>
      <div className='col-1 diviCol' style={{padding: "0px"}}><p className='inpTab'>€{Number(col.deb1).toFixed(2).replace('.', ',')}</p></div>
      <hr style={{margin: "0"}}/>
    </div>
    </div>
    ))}
  </div>
  </div>
}
</motion.div>
    </>
      )
}
export default AddCliente;

//questo file sta combinato insieme a todoClient


/**  Per google maps
 * import Autocomplete, { usePlacesWidget } from "react-google-autocomplete";
 * 
 * 
<Input
fullWidth className='inpCli' color="primary" placeholder='Indirizzo Google Maps'
  inputComponent={({ inputRef, onFocus, onBlur, ...props }) => (
    <Autocomplete
      apiKey={GOOGLE_MAPS_API_KEY}
      {...props}
      onPlaceSelected={(place) => {
        setIndirizzo(place.formatted_address)
        console.log(place);
        }}
      options={{
      types: ["address"],
      componentRestrictions: { country: "it" },
      }}
      defaultValue={indirizzo}
    />
  )}
/>

*/