import React, { useEffect, useState, useRef } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, orderBy, where, getDocs, serverTimestamp, limit} from 'firebase/firestore';
import TextField from '@mui/material/TextField';
import { useMediaQuery } from '@mui/material';
import Autocomplete, { usePlacesWidget } from "react-google-autocomplete";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { auth, db } from "../firebase-config";
import { Input } from '@mui/material';
import { Modal } from 'react-bootstrap';
import { ToastContainer, toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { notifyErrorCliEm, notifyUpdateCli, notifyErrorCliList } from '../components/Notify';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import {guid, supa, tutti, primary, rosso } from '../components/utenti';
import InputAdornment from '@mui/material/InputAdornment';
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from '@mui/icons-material/Search';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { motion } from 'framer-motion';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export const AutoCompScorta = [];
const GOOGLE_MAPS_API_KEY = 'AIzaSyA2327mULUbMv_7eW1baIeXRwbnfYLYBWo';

function AddFornitori( {getFornId} ) {

  const [todos, setTodos] = React.useState([]);


  const [idFornitore, setIdFornitore] = React.useState("");
  const [idDocumentoEdit, setIdDocumentoEdit] = React.useState("");
  const [indirizzo, setIndirizzo] = React.useState("");
  const [via, setVia] = React.useState("");
  const [stato, setStato] = React.useState("");
  const [nomeF, setnomeF] = React.useState("");
  const [nome, setNome] = React.useState("");
  const [cognome, setCognome] = React.useState("");
  const [partitaIva, setPartitaIva] = React.useState("");
  const [indirizzoEmail, setIndirizzoEmail] = React.useState("");
  const [citta, setCitta] = React.useState("");
  const [cap, setCap] = React.useState("");
  const [numeroCivico, setNumeroCivico] = React.useState("");
  const [cellulare, setCellulare] = React.useState("");

  const [indirizzoLink, setIndirizzoLink] = React.useState("");
  const [flagDelete, setFlagDelete] = useState(false); 

  const [deb1, setDeb1] = React.useState("");
  const [deb2, setDeb2] = React.useState("");
  const [deb3, setDeb3] = React.useState("");
  const [deb4, setDeb4] = React.useState("");

  const [alignment, setAlignment] = React.useState('scorta');

  const [popupActive, setPopupActive] = useState(false);
  const [popupActiveEdit, setPopupActiveEdit] = useState(false);
  const [flagAnaCli, setFlagAnaCli] = useState(true);   
  const [flagDebiCli, setFlagDebiCli] = useState(false);  

  const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone

  const [searchTerm, setSearchTerm] = useState("");  //search
  const inputRef= useRef();

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
          handleDelete(localStorage.getItem("IDForn") );
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
        const handlerSetClear = async ( ) => {
          setnomeF("");
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
//********************************************************************************** */

const auto = async () => {
  const q = query(collection(db, "prodotto"));
  const querySnapshot = await  getDocs(q);
  querySnapshot.forEach((doc) => {
    console.log(doc.data().nomeP)
  let car = { label: doc.data().nomeP }
  AutoCompScorta.push(car);
  });
  }

  const handleChangeTogg = (event) => {
    setAlignment(event.target.value);
  };
//********************************************************************************** */
      //Anagrafiche
React.useEffect(() => {
    const collectionRef = collection(db, "fornitore");
    const q = query(collectionRef, orderBy("nomeF"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setTodos(todosArray);
    });
    return () => unsub();

  }, []);
 //******************************************************************************* */
  //speed
  function handleButtonDebito() {
    setFlagAnaCli(false)
    setFlagDebiCli(true)
  } 

  function handleButtonAna() {
    setFlagAnaCli(true)
    setFlagDebiCli(false)
  } 

 
  //******************************************************************************* */
 const handleSubmit = async (e, id) => {   //creazione fornitore
    e.preventDefault();
    var bol= true
    var idFornitore="1"

    if(!nome) {            
      notifyErrorCliEm();
      toast.clearWaitingQueue(); 
      return 
    }  
     //serve per non fa inserire due volte lo stesso fornitore, serve per renderlo univoco
    const q = query(collection(db, "fornitore"), where("nomeF", "==", nome +" " + cognome));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data().nomeF);
    if (doc.data().nomeF == nome +" " + cognome) {    //se ha trovato lo stesso nome all'interno del database bol è falso
        notifyErrorCliList()
         toast.clearWaitingQueue(); 
        bol=false
    }});

     //vado a prendere l'id dell'ultimo fornitore, in modo tale da aggiungere il nuovo id al nuovo ordine
     const d = query(collection(db, "fornitore"), orderBy("createdAt", "desc"), limit(1));  
     const querySnapshotd = await getDocs(d);
     // Controlla se ci sono risultati nella query
     if (!querySnapshotd.empty) {
       // Se la query ha trovato almeno un ordine, ottieni l'ID dell'ultimo ordine e incrementalo per il nuovo ID
       querySnapshotd.forEach((doc) => {
        idFornitore = doc.data().idFornitore.substring(1);  //va a prendere la stringa e allo stesso tempo gli toglie la prima lettera
         let idFornInt = parseInt(idFornitore) + 1 //fa la converisione in intero. e fa la somma
         idFornitore = idFornInt.toString()  // lo riconverte in stringa
       });
     }   

     idFornitore= "F" + idFornitore

    if(bol == true) {   //bol deve essere vero per poter creare un nuovo utente
      let nomeCompleto = nome+ " " +cognome
      await addDoc(collection(db, "fornitore"), {
        createdAt: serverTimestamp(),
        idFornitore,
        nomeF: nomeCompleto,
        nome,
        indirizzo,
        cognome,
        stato,
        partitaIva,
        indirizzoLink: "https://www.google.com/maps/search/?api=1&query="+indirizzo,
        via,
        numeroCivico,
        citta,
        cap,
        indirizzoEmail,
        cellulare,
      });
      handlerSetClear()
    }
  };

//****************************************************************************************** */
const handleActiveEdit = async (todo) => {
  setIdDocumentoEdit(todo.id)
  setPopupActiveEdit(true)
  setnomeF("");
  setNome(todo.nome);
  setIndirizzo(todo.indirizzo);
  setCognome(todo.cognome);
  setStato(todo.stato);
  setVia(todo.via);
  setNumeroCivico(todo.numeroCivico);
  setCitta(todo.citta);
  setCap(todo.cap);
  setIndirizzoEmail(todo.indirizzoEmail);
  setIdFornitore(todo.idFornitore)
  setPartitaIva(todo.partitaIva);
  setCellulare(todo.cellulare);
};
  const handleEdit = async () => { //va ad aggiornare le info del cliente, e va a cambiare anche il nome alla tabella debito
    await updateDoc(doc(db, "fornitore", idDocumentoEdit), {nomeF:nome+" "+cognome, nome: nome, cognome:cognome, stato:stato, indirizzo:indirizzo, indirizzoLink: "https://www.google.com/maps/search/?api=1&query="+indirizzo, numeroCivico:numeroCivico, citta:citta, cap:cap, indirizzoEmail:indirizzoEmail, partitaIva:partitaIva, cellulare:cellulare});
    handlerSetClear();
    setPopupActiveEdit(false);
    toast.clearWaitingQueue(); 
  };

//****************************************************************************************** */
  const handleDelete = async (id) => {
    const colDoc = doc(db, "fornitore", id); 
     
    //elimina il fornitore
    await deleteDoc(colDoc); 
  };
//**************************************************************************** */
//                              NICE
//********************************************************************************** */
    return ( 
    <>  
    <motion.div
         initial= {{x: "-100vw"}}
        animate= {{x: 0}}
        transition={{ duration: 0.4 }}>
    
    {!matches && 
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate(-1)}}>
      <ArrowBackIcon id="i" /></button> 
    }

    {!matches ? <h1 className='title mt-3' style={{ textAlign: "left", marginLeft: "70px" }}>Anagrafica Fornitori</h1> : <div style={{marginBottom:"60px"}}></div>} 

    <div style={{ justifyContent: "left", textAlign: "left", marginTop: "40px" }}>
      <ToggleButtonGroup
      color="primary"
      value={alignment}
      exclusive
      onChange={handleChangeTogg}
      aria-label="Platform"
    > 
    {sup == true &&<Button variant="contained"  style={{borderTopRightRadius: "0px", borderBottomRightRadius: "0px" }}   onClick={() => { setPopupActive(true) }}>Aggiungi Fornitore</Button>}
      {sup == true && <Button style={{borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px" }}   onClick={() => {setFlagDelete(!flagDelete)}} color="error" variant="contained">elimina</Button> }
    </ToggleButtonGroup>
    </div>

    {/******Aggiungi Fornitori  modal***************************************************************************** */}
    <Modal  size="lg" show={popupActive || popupActiveEdit} onHide={()=> {setPopupActive(false); setPopupActiveEdit(false); handlerSetClear();}} style={{ marginTop: "50px", zIndex: "1050"}}>
      <div>  <button type='button' className="button-close float-end" onClick={() => { setPopupActive(false); setPopupActiveEdit(false); handlerSetClear(); }}>
              <CloseIcon id="i" /></button> </div>
    {popupActive && <h4 className='title'  style={{ width: "300px", position: "absolute", top: "10px", marginLeft: "2px" }}> Aggiungi Fornitori </h4>}
    {popupActiveEdit && <h4 className='title'  style={{ width: "300px", position: "absolute", top: "10px", marginLeft: "2px" }}> Modifica Fornitori </h4>}
          <Modal.Body>
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
      <div className='row mt-4'><div >
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
              {popupActive && <Button onClick={handleSubmit} style={{ width: "100%", height: "50px" }} className='' type='submit' color='primary' variant="contained" >Aggiungi Fornitori </Button>}
              {popupActiveEdit && <Button onClick={handleEdit} style={{ width: "100%", height: "50px" }} className='' type='submit' color='primary' variant="contained" >Modifica Fornitori </Button>}  
            </div>
          </div> 
          </Modal.Body>
      </Modal>



{/**------------------------------------------------------------------------------------------------------------------------------------------- */}
{/********************tabella Anagrafiche fornitori************************************************************************/}
{flagAnaCli &&
<div className='todo_containerFor'>
<div className='row'> 
<div className='col-5'>
<p className='colTextTitle'>Anagrafica Fornitori</p>
</div>
<div className='col'>
<TextField
      inputRef={inputRef}
      className="inputSearch"
      onChange={event => {setSearchTerm(event.target.value)}}
      type="text"
      placeholder="Ricerca Fornitore"
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
<div className='row'>
<div className='col-1'  >
<p className='coltext' >id Fornitore</p>
</div>
<div className='col-2' style={{ width:"250px" }}>
<p className='coltext' >Fornitore</p>
</div>
<div className='col-2' style={{ width:"250px" }}>
<p className='coltext' >Email</p>
</div>
<div className='col-1' style={{ width:"120px" }}>
<p className='coltext' >Telefono</p>
</div>
<div className='col-3' style={{ width:"400px" }}>
<p className='coltext' >indirizzo</p>
</div>
<div className='col-1' >
<p className='coltext' >Partita IVA</p>
</div>
</div>
<hr style={{margin: "0"}}/>
<div className="scroll">
{todos.filter((val)=> {
        if(searchTerm === ""){
          return val
      } else if (val.nomeF.toLowerCase().includes(searchTerm.toLowerCase()) ) {
        return val
                }
            }).map((todo) => (
    <div key={todo.id}>
    <div className='row '>
        <div className='col-1' >
        <h4 className='inpTab' style={{ color:primary }}><b>{todo.idFornitore}</b></h4>
        </div>
        <div className='col-2' style={{ width:"250px" }}>
            <h4 className='inpTab'   onClick={() => { /** 
            getFornId(todo.id, todo.nomeF)
            navigate("/dashfornitore");
            auto();
            AutoCompScorta.length = 0*/
            handleActiveEdit(todo)
                            }}> {todo.nomeF} </h4>
        </div>
        <div className='col-2' style={{ width:"250px" }}>
          <h4 className='inpTab'> {todo.indirizzoEmail}</h4>
        </div>
        <div className='col-1' style={{ width:"120px" }}>
          <h4 className='inpTab'> {todo.cellulare}</h4>
        </div>
        <div className="col-3" style={{width: "400px"}}>
    <p className="inpTab" ><a style={{ color: primary }}
        href={ todo.indirizzoLink }
        target="_blank"
        className="linkTab"
        >{ todo.indirizzo.substr(0, 35)}...</a> </p>
    </div>
        <div className='col-1'>
        <h4 className='inpTab'> {todo.partitaIva}</h4>
        </div>
        {flagDelete &&
        <div className='col' style={{padding:"0px", marginTop:"-8px"}}>
        <button type="reset" className="button-delete"     style={{ color: rosso }}                      
          onClick={() => {
                localStorage.setItem("IDForn", todo.id);
                    displayMsg();
                    toast.clearWaitingQueue(); 
                            }}>
          <DeleteIcon id="i" />
        </button>
        </div>
          }
    </div>
        
        <hr style={{margin: "0"}}/>
    </div>
  ))}
  </div>

  </div>
  }
  </motion.div>
    </>
      )
}
export default AddFornitori;
