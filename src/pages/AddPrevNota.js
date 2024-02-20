import React, { useEffect, useState, useRef } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, where, getDocs, orderBy, serverTimestamp} from 'firebase/firestore';
import useMediaQuery from '@mui/material/useMediaQuery';
import moment from 'moment';
import { getCountFromServer } from 'firebase/firestore';
import { TextField } from '@mui/material';
import { db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { notifyErrorCli, notifyUpdateCli, notifyErrorCliEm } from '../components/Notify';
import Autocomplete from '@mui/material/Autocomplete';
import { AutoComp1 } from './PreventivoData';
import { supa, guid, tutti } from '../components/utenti';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import InputAdornment from '@mui/material/InputAdornment';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export const AutoProdCli = [];
export const AutoDataScal = [];

function AddPrevNota({ ordId, dataOrd, dataOrdConf, getNotaId, getNotaDataScal, OrdDataMilli }) {
 
    const [todos, setTodos] = React.useState([]);
    const [nomeC, setNomeC] = React.useState("");
    const [cont, setCont] = React.useState(1);
    const [flagDelete, setFlagDelete] = useState(false); 
    const [debitoRes, setDebitoRes] = React.useState("");
    const [indirizzo, setIndirizzo] = React.useState("");
    const [telefono, setTelefono] = React.useState("");

    const [Progress, setProgress] = React.useState(false);
    const [popupActive, setPopupActive] = useState(true);  
    const [alignment, setAlignment] = React.useState('scorta');

    const [searchTerm, setSearchTerm] = useState("");  //search
    const [searchTerm2, setSearchTerm2] = useState("");  //search
    const inputRef= useRef();

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))   //confronto con uid corrente
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
  
    const scalCollectionRef = collection(db, "addPrev"); 
    const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone
  
    let navigate = useNavigate();
  
    function handleInputChange(event, value) {
      setNomeC(value)
    }

    const handleChangeTogg = (event) => {
      setAlignment(event.target.value);
    };
//_________________________________________________________________________________________________________________
    const auto = async (nomeCli) => {  //array per i prodotti dei clienti
      const q = query(collection(db, "prodottoClin"), where("author.name", "==", nomeCli));
      const querySnapshot = await  getDocs(q);
      querySnapshot.forEach((doc) => {

      let car = { label: doc.data().nomeP,
                  id: doc.id,
                  prezzoUni: doc.data().prezzoUnitario }
      AutoProdCli.push(car);
      });
      }

//_________________________________________________________________________________________________________________
const contEffect = async () => {
    const coll = collection(db, "addPrev");
    const q = query(coll, where("data", "==", dataOrdConf), orderBy("createdAt"));
    const snapshot = await getCountFromServer(q);
    setCont(snapshot.data().count+1)
  }

    function handleContAdd() {  //si attiva durante la creazione della nota
        setCont(cont+1);
    }
    function handleContRem() {  // si attiva durante la cancellazione della nota
        setCont(cont-1);
    }
  
    const contUpdate = async ( dat) => { //si attiva quando viene eliminato un cliente Contatore, non funziona perfettamente
        var cn=0;
            const collectionRef = collection(db, "addPrev");
              //aggiorna il contatore di tutti i dati di addPrev della stessa data, in base all'ordine di creazione
              const q = query(collectionRef, where("data", "==", dat), orderBy("createdAt"));
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach(async (hi) => {
              await updateDoc(doc(db, "addPrev", hi.id), { cont: cn=cn+1});
              });
      };
 //_________________________________________________________________________________________________________________   
      const handleContaNote = async () => {   //funzione che viene richiamata quando si crea/elimina la nota    fa il conteggio delle note di quella data
        const coll = collection(db, "addPrev");
        const q = query(coll, where("data", "==", dataOrdConf));
        const snapshot = await getCountFromServer(q);
        await updateDoc(doc(db, "ordDat", ordId), { numeroNote: snapshot.data().count});  //aggiorna il conteggio nel database
      }

    //_________________________________________________________________________________________________________________
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
            handleDelete(localStorage.getItem("OrdId"), localStorage.getItem("OrdNomeC"), localStorage.getItem("OrdData"));
            contUpdate(localStorage.getItem("OrdData"))
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
  
    const setClear = () => {
        setNomeC("");
        toast.dismiss();
        toast.clearWaitingQueue();}
  
  //********************************************************************************** */
  
    React.useEffect(() => {
      const collectionRef = collection(db, "addPrev");
      const q = query(collectionRef, orderBy("cont"));
  
      const unsub = onSnapshot(q, (querySnapshot) => {
        let todosArray = [];
        querySnapshot.forEach((doc) => {
          todosArray.push({ ...doc.data(), id: doc.id });
        });
        setTodos(todosArray);
        setProgress(true);
      });
      contEffect();
      localStorage.removeItem("OrdId");
      return () => unsub();
    }, []);
      //_________________________________________________________________________________________________________________
  //****************************************************************************************** */
   //stampa
  
  function HandleSpeedAddScalClien() {
    setPopupActive(true);
  }
  /******************************************************************************* */
  const createCate = async (e) => {
    e.preventDefault(); 
    var debRes=0;
    var id=0;
    var indiri;
    var telefo;
    var iva;
//va a  prendere d1, tramite nome del cliente e anche il suo id
    const q = query(collection(db, "debito"), where("nomeC", "==", nomeC));  
    const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        debRes=doc.data().deb1 ;
        id= doc.id;
        });
        setDebitoRes(debRes);

    //andiamo a  prendere l'indirizzo e il tel, tramite nome del cliente, viene richiamata quando si crea la nota
        const p = query(collection(db, "clin"), where("nomeC", "==", nomeC));  
        console.log("ciaao", nomeC)
        const querySnapshotp = await getDocs(p);
        querySnapshotp.forEach((doc) => {
          indiri= doc.data().indirizzo;
          telefo= doc.data().cellulare;
          iva = doc.data().partitaIva;
          });
          setIndirizzo(indiri);
          setTelefono(telefo);


    var bol= true
    todos.map(async (nice) => {    //controllo per verificare che questo cliente non è già presente la sua nota
      if (nomeC == nice.nomeC && dataOrdConf ==nice.data) {   //va a prendere la trupla di questo cliente di questa data
          notifyErrorCli()
          toast.clearWaitingQueue(); 
          bol=false
      }
    })

    if(!nomeC) {
      notifyErrorCliEm();
      toast.clearWaitingQueue(); 
      return
    }
    if(bol == true) {
    handleContAdd();
    await addDoc(collection(db, "addPrev"), {
      cont,
      nomeC,
      quota: 0,
      completa : "0",
      data: dataOrdConf,
      NumCartoni:"0",
      dataMilli: OrdDataMilli,
      NumBuste:"0",
      sommaTotale:0,
      altezza: "1123px",
      debitoTotale:0,
      createdAt: serverTimestamp(),
      idDebito:  id,
      debitoRes: debRes,
      indirizzo: indiri,
      tel: telefo,
      partitaIva: iva
    });
    setNomeC("");
    handleContaNote();
    }
  };

    //___________________________________________________________________________________________________
    const handleDelete = async (id, nomeCli, DataC) => {
      handleContRem();

      const colDoc = doc(db, "addPrev", id); 
    //elimina tutti i dati di nota di quel cliente con la stessa data
      const q = query(collection(db, "preventivo"), where("dataC", "==", DataC), where("nomeC", "==", nomeCli));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (hi) => {
      await deleteDoc(doc(db, "preventivo", hi.id)); 
      });
      //infine elimina la data di addPrev
      await deleteDoc(colDoc);
      handleContaNote(); 
    };
    //**************************************************************************** */
    const actions = [
      { icon: <PrintIcon />, name: 'Stampa'},
      { icon: <AddIcon />, name: 'Aggiungi Cliente', action: HandleSpeedAddScalClien },
    ];
  //**************************************************************************** */
  //                              NICE
  //********************************************************************************** */
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
        initial= {{x: "-100vw"}}
        animate= {{x: 0}}
        transition={{ duration: 0.4 }}>

{!matches && 
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate(-1)}}>
      <ArrowBackIcon id="i" /></button> 
    }

      {!matches ? <h1 className='title mt-3'> Preventivo </h1> : <div style={{marginBottom:"60px"}}></div>} 
  <h3 style={{fontSize: "20px"}}>{moment(dataOrd.toDate()).format("L")}</h3>  
  
        <ToggleButtonGroup
      color="primary"
      value={alignment}
      exclusive
      onChange={handleChangeTogg}
      aria-label="Platform"
    > 
          <Button onClick={HandleSpeedAddScalClien} size="small" variant="contained"> Aggiungi Cliente</Button>
          <Button onClick={ () => {navigate("/stampamassivaprev"); }} size="small" variant="contained"> Stampa Massiva</Button>
      {sup == true && <Button onClick={() => {setFlagDelete(!flagDelete)}} color="error" variant="contained">elimina</Button> }
    </ToggleButtonGroup>

    
   {/************************INSERIMENTO CLIENTE********************************************************************/}       
      {sup ===true && (
          <>
      {popupActive &&     
        <form className='formAddNot' style={{width: "350px"}} onSubmit={createCate}>
        
        <div className='divCloseSc'>  <button type='button' className="button-close float-end" onClick={() => { setPopupActive(false); }}>
                <CloseIcon id="i" />
                </button> </div>
        <div className="input_container">
        <Autocomplete
      value={nomeC}
      options={AutoComp1}
      onInputChange={handleInputChange}
      componentsProps={{ popper: { style: { width: 'fit-content' } } }}
      renderInput={(params) => <TextField {...params} label="Cliente" />}
    />
            <div className="btn_container">
            <Button className='mt-3' type='submit' variant="outlined">Aggiungi Cliente</Button>
            </div>
  
        </div>
      </form>
      }
      </>
      )}
  
  {/**************tabella********************************************************************************************************/}
      <div className='containerTabNote'>
  {/***********Note non completate********************************************************************************** */}
  <div  className='todo_containerOrdCli mt-5'>
        <div className='row'> 
        <div className='col' style={{paddingRight: "0px"}}>
        <p className='colTextTitle'> Clienti</p>
        <p className='textOrdRed'>Preventivi non completati</p>
        </div>
        <div className='col' style={{paddingLeft: "0px", paddingRight: "15px"}}>
        <TextField
      inputRef={inputRef}
      className="inputSearchOrd"
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
        <div className='row'>
        <div className='col-1' >
        <p className='coltext'>N.</p>
        </div>
        <div className='col-8' >
        <p className='coltext'>Cliente</p>
        </div>
        <hr style={{margin: "0"}}/>
      </div>

      <div className="scrollOrdCli">
      {Progress == false && 
        <div style={{marginTop: "14px"}}>
          <CircularProgress />
        </div>
      }
      {todos.filter((val)=> {
        if(searchTerm === ""){
          return val
      } else if (val.nomeC.toLowerCase().includes(searchTerm.toLowerCase())  ) {
        return val
                }
            }).map((todo) => (
          <div key={todo.id}>
          {todo.data  === dataOrdConf && todo.completa === "0" &&  (
      <>
    <div className='row diviCol1'>
        <div className='col-1 diviCol'>
            <p className="inpTab" style={{textAlign: "left"}}>{todo.cont}</p>
        </div>
         <div className='col-8 diviCol' 
          onClick={() => {
                getNotaId(todo.id, todo.cont, todo.nomeC, dataOrd, dataOrdConf, todo.NumCartoni, todo.sommaTotale, todo.debitoRes, todo.debitoTotale, todo.indirizzo, todo.tel, todo.partitaIva, todo.completa, todo.idDebito, todo.NumBuste)
                navigate("/preventivo");
                auto(todo.nomeC);
                AutoProdCli.length = 0
                         }}>
             <p className="inpTab"  style={{textAlign: "left"}}>{todo.nomeC}</p>
        </div>
        <div className="col colIcon" style={{padding:"0px", marginTop:"8px"}}
            onClick={() => {
                getNotaId(todo.id, todo.cont, todo.nomeC, dataOrd, dataOrdConf, todo.NumCartoni, todo.sommaTotale, todo.debitoRes, todo.debitoTotale, todo.indirizzo, todo.tel, todo.partitaIva, todo.completa, todo.idDebito, todo.NumBuste)
                navigate("/preventivo");
                auto(todo.nomeC);
                AutoProdCli.length = 0
                         }}>  
                        <NavigateNextIcon/>          
        </div>
          {flagDelete &&
        <div className="col diviCol" style={{padding:"0px", marginTop:"-8px"}}>    
            <button
                className="button-delete"
                onClick={() => {
                localStorage.setItem("OrdId", todo.id);
                localStorage.setItem("OrdNomeC", todo.nomeC);
                localStorage.setItem("OrdData", todo.data);
                displayMsg();
                 toast.clearWaitingQueue(); 
                         }}>
                <DeleteIcon id="i" />
            </button>            
        </div>
      }
    </div>
    <hr style={{margin: "0"}}/>
             </>
                  )}
          </div>
        ))} 
        </div>
        </div>

        {/***********Note completate********************************************************************************** */}
        <div  className='todo_containerOrdCli mt-5'>
        <div className='row'> 
        <div className='col' style={{paddingRight: "0px"}}>
        <p className='colTextTitle'> Clienti</p>
        <p className='textOrd'> Preventivi completati </p>
        </div>
        <div className='col' style={{paddingLeft: "0px", paddingRight: "15px"}}>
        <TextField
      inputRef={inputRef}
      className="inputSearchOrd"
      onChange={event => {setSearchTerm2(event.target.value)}}
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
        <div className='row'>
        <div className='col-1' >
        <p className='coltext'>N.</p>
        </div>
        <div className='col-8' >
        <p className='coltext'>Cliente</p>
        </div>
        <hr style={{margin: "0"}}/>
      </div>

      <div className="scrollOrdCli">
      {Progress == false && 
        <div style={{marginTop: "14px"}}>
          <CircularProgress />
        </div>
      }
      {todos.filter((val)=> {
        if(searchTerm2 === ""){
          return val
      } else if (val.nomeC.toLowerCase().includes(searchTerm2.toLowerCase())  ) {
        return val
                }
            }).map((todo) => (
          <div key={todo.id}>
          {todo.data  === dataOrdConf && todo.completa === "1" &&  (
      <>
    <div className='row diviCol1'>
        <div className='col-1 diviCol'>
            <p className="inpTab" style={{textAlign: "left"}}>{todo.cont}</p>
        </div>
         <div className='col-8 diviCol' 
          onClick={() => {
                getNotaId(todo.id, todo.cont, todo.nomeC, dataOrd, dataOrdConf, todo.NumCartoni, todo.sommaTotale, todo.debitoRes, todo.debitoTotale, todo.indirizzo, todo.tel, todo.partitaIva, todo.completa, todo.idDebito, todo.NumBuste)
                navigate("/preventivo");
                auto(todo.nomeC);
                AutoProdCli.length = 0
                         }}>
             <p className="inpTab"  style={{textAlign: "left"}}>{todo.nomeC}</p>
        </div>
        <div className="col colIcon" style={{padding:"0px", marginTop:"8px"}}
          onClick={() => {
                getNotaId(todo.id, todo.cont, todo.nomeC, dataOrd, dataOrdConf, todo.NumCartoni, todo.sommaTotale, todo.debitoRes, todo.debitoTotale, todo.indirizzo, todo.tel, todo.partitaIva, todo.completa, todo.idDebito, todo.NumBuste)
                navigate("/preventivo");
                auto(todo.nomeC);
                AutoProdCli.length = 0
                         }}>  
                        <NavigateNextIcon/>          
        </div>
          {flagDelete &&
        <div className="col diviCol" style={{padding:"0px", marginTop:"-8px"}}>    
            <button
                className="button-delete"
                onClick={() => {
                localStorage.setItem("OrdId", todo.id);
                localStorage.setItem("OrdNomeC", todo.nomeC);
                localStorage.setItem("OrdData", todo.data);
                displayMsg();
                 toast.clearWaitingQueue(); 
                         }}>
                <DeleteIcon id="i" />
            </button>            
        </div>
      }
    </div>
    <hr style={{margin: "0"}}/>
             </>
                  )}
          </div>
        ))} 
        </div>
        </div>
{/*******End tabella ordine evasi********************************** */}
      </div>
      </motion.div>
      </>
        )
  }
export default AddPrevNota;