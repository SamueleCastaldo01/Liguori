import React, { useEffect, useState, useRef } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, where, getDocs, orderBy, serverTimestamp, limit} from 'firebase/firestore';
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
import { AutoComp1 } from './OrdineCliData';
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
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export const AutoProdCli = [];
export const AutoDataScal = [];

function AddNota({getNotaDataScal, TodayData, getNotaId}) {
 
  const [DataOrierna, setDataSc] = React.useState(TodayData);
  //conversione data
  const dataInizialeFormatted = moment(TodayData, "DD/MM/YYYY").format("YYYY-MM-DD");
  const [DataCal, setDataCal] = useState(new Date()); // serve per il calendario

  const [dataOrdConf, setDataOrdConf] = React.useState("20-12-24");
  const [ordId, setDataOrdId] = React.useState("2");
  const [dataOrd, setDataOrd] = useState(dataInizialeFormatted);
  const [OrdDataMilli, setOrdDataMilli] = React.useState("");
  const [status, setStatus] = React.useState("0");


    const [todos, setTodos] = React.useState([]);
    const [todosClienti, setTodosClienti] = React.useState([]);

    const [idCliente, setIdCliente] = React.useState("");
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
  
    const scalCollectionRef = collection(db, "addNota"); 
    const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone
  
    let navigate = useNavigate();
  
    function handleInputChange(event, value) {
      setNomeC(value)
      todosClienti.map((cli) => {
        if(cli.nomeC== value) {
          setIdCliente(cli.idCliente)
        } 
      })
    }

    const handleChangeTogg = (event) => {
      setAlignment(event.target.value);
    };


    const handleChangeDataSelect = (event) => {
      console.log(event.target.value)
      setStatus(event.target.value);      //prende il valore del select
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

  const autoData = async () => {
        const q = query(collection(db, "scalDat")); // vado a prendere tutte le date di scaletta, questo devo cercare di mettere un limitatore, o potrebbe creare problemi in caso di parecchie date
        const querySnapshot = await  getDocs(q);
        querySnapshot.forEach((hi) => {  
        let car = { label: hi.data().data }
        AutoDataScal.push(car);
        });
        }
//_________________________________________________________________________________________________________________
const contEffect = async () => {
  console.log(dataOrd)
    const coll = collection(db, "addNota");
    const q = query(coll, where("data", "==", dataOrd), orderBy("createdAt"));
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
            const collectionRef = collection(db, "addNota");
              //aggiorna il contatore di tutti i dati di addNota della stessa data, in base all'ordine di creazione
              const q = query(collectionRef, where("data", "==", dat), orderBy("createdAt"));
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach(async (hi) => {
              await updateDoc(doc(db, "addNota", hi.id), { cont: cn=cn+1});
              });
      };
 //_________________________________________________________________________________________________________________   
      const handleContaNote = async () => {   //funzione che viene richiamata quando si crea/elimina la nota    fa il conteggio delle note di quella data
        const coll = collection(db, "addNota");
        const q = query(coll, where("data", "==", dataOrd));
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
      const collectionRef = collection(db, "addNota");
      const q = query(collectionRef);
  
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


    React.useEffect(() => {
      const collectionRef = collection(db, "clin");
      const q = query(collectionRef);
  
      const unsub = onSnapshot(q, (querySnapshot) => {
        let todosArray = [];
        querySnapshot.forEach((doc) => {
          todosArray.push({ ...doc.data(), id: doc.id });
        });

    // Ordina l'array per la proprietà nomeC
    todosArray.sort((a, b) => {
      const nomeC1 = a.nomeC.toLowerCase();
      const nomeC2 = b.nomeC.toLowerCase();

      if (nomeC1 < nomeC2) {
        return -1;
      }
      if (nomeC1 > nomeC2) {
        return 1;
      }
      return 0;
    });
        setTodosClienti(todosArray);
      });
      return () => unsub();
    }, []);
      //_________________________________________________________________________________________________________________
  //****************************************************************************************** */
   //stampa
  
  function HandleSpeedAddScalClien() {
    setPopupActive(true);
  }
  /******************************************************************************* */
  const CreateOrdine = async (e) => {   //aggiunta Ordine
    e.preventDefault(); 
    var debRes=0;
    var id=0;
    var indiri;
    var telefo;
    var iva;
    var idOrdine="1";

    console.log(status)

    const dateObject = new Date(dataOrd); //conversione da stringa a data per ottenere la data in millisecondi
    const dataInizialeFormatted = moment(dataOrd, "YYYY-MM-DD").format("DD-MM-YYYY");

//va a  prendere d1, tramite nome del cliente e anche il suo id
    const q = query(collection(db, "debito"), where("idCliente", "==", idCliente));  
    const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        debRes=doc.data().deb1 ;
        id= doc.id;
        });
        setDebitoRes(debRes);

    //andiamo a  prendere l'indirizzo e il tel, tramite nome del cliente, viene richiamata quando si crea la nota
        const p = query(collection(db, "clin"), where("idCliente", "==", idCliente));  
        const querySnapshotp = await getDocs(p);
        querySnapshotp.forEach((doc) => {
          indiri= doc.data().via;
          telefo= doc.data().cellulare;
          iva = doc.data().partitaIva;
          });
          setIndirizzo(indiri);
          setTelefono(telefo);

    //vado a prendere l'id dell'ultimo ordine, in modo tale da aggiungere il nuovo id al nuovo ordine
    const d = query(collection(db, "addNota"), orderBy("createdAt", "desc"), limit(1));  
    const querySnapshotd = await getDocs(d);
    // Controlla se ci sono risultati nella query
    if (!querySnapshotd.empty) {
      // Se la query ha trovato almeno un ordine, ottieni l'ID dell'ultimo ordine e incrementalo per il nuovo ID
      querySnapshotd.forEach((doc) => {
        idOrdine = doc.data().idOrdine.substring(1); //va a prendere la stringa e allo stesso tempo gli toglie la prima lettera
        let idOrdInt = parseInt(idOrdine) + 1 //fa la converisione in intero. e fa la somma
        idOrdine = idOrdInt.toString()  // lo riconverte in stringa
      });
    }

    idOrdine= "O" + idOrdine

    var bol= true
    todos.map(async (nice) => {    //controllo per verificare che questo cliente non è già presente la sua nota
      if (nomeC == nice.nomeC && dataInizialeFormatted ==nice.data) {   //va a prendere la trupla di questo cliente di questa data
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
    await addDoc(collection(db, "addNota"), {
      idOrdine,
      cont,
      idCliente,
      nomeC,
      quota: 0,
      completa : status,
      data: dataInizialeFormatted,
      NumCartoni:"0",
      dataMilli: dateObject.getTime(),
      NumBuste:"0",
      sommaTotale:0,
      altezza: "1123px",
      debitoTotale:0,
      createdAt: serverTimestamp(),
      idDebito:  id,
      note: "",
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

      const colDoc = doc(db, "addNota", id); 
    //elimina tutti i dati di nota di quel cliente con la stessa data
      const q = query(collection(db, "Nota"), where("dataC", "==", DataC), where("nomeC", "==", nomeCli));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (hi) => {
      await deleteDoc(doc(db, "Nota", hi.id)); 
      });
      //infine elimina la data di AddNota
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
      <p className='navText'> Ordine Clienti </p>
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

      {!matches ? <h1 className='title mt-3'> Ordine Clienti</h1> : <div style={{marginBottom:"60px"}}></div>} 
  
        <ToggleButtonGroup
      color="primary"
      value={alignment}
      exclusive
      onChange={handleChangeTogg}
      aria-label="Platform"
    > 
    {sup == true && <Button onClick={ () => {
              getNotaDataScal(dataOrdConf)
                navigate("/addclientescaletta");
                autoData();
                AutoDataScal.length = 0
          }} size="small" variant="contained">Aggiungi cliente alla scaletta</Button>}
          <Button onClick={HandleSpeedAddScalClien} size="small" variant="contained"> Aggiungi Cliente</Button>
          <Button onClick={ () => {navigate("/stampamassiva"); }} size="small" variant="contained"> Stampa Massiva</Button>
      {sup == true && <Button onClick={() => {setFlagDelete(!flagDelete)}} color="error" variant="contained">elimina</Button> }
    </ToggleButtonGroup>

    
   {/************************INSERIMENTO CLIENTE********************************************************************/}       
      {sup ===true && (
          <>
        <Box component="form"
              sx={{
        '& > :not(style)': { m: 1, width: '25ch' },
      }}>
        <div className='row'>
        <TextField color="secondary" className='mt-2' style={{ width: "200px", height: "35px" }} type='date' label="Data di Creazione"
            placeholder="DD/MM/YYYY" value={dataOrd} onChange={(e) => setDataOrd(e.target.value)} />
        </div>
        <div className='row' style={{ marginTop: "50px" }}>
          <FormControl >
            <InputLabel id="demo-simple-select-label" color="secondary">Stato</InputLabel>
              <Select sx={{height:39,  width: 150}}
              label="Stato"
              color='secondary'
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                defaultValue={0}
                onChange={handleChangeDataSelect}>
              <MenuItem value={"0"}>In Lavorazione</MenuItem>
              <MenuItem value={"1"}>Evaso</MenuItem>
              <MenuItem value={"2"}>Coseganto</MenuItem>
                </Select>
          </FormControl>
        </div>
      <div className='row'>
        <Autocomplete
          value={nomeC}
          options={todosClienti.map(cliente => cliente.nomeC)}
          onInputChange={handleInputChange}
          componentsProps={{ popper: { style: { width: 'fit-content' } } }}
          renderInput={(params) => <TextField color='secondary' {...params} label="Cliente" />}
        />
      </div>

            <div className="btn_container">
            <Button className='mt-3' type='submit' variant="outlined" onClick={CreateOrdine}>Aggiungi Cliente</Button>
            </div>
  </Box>
      </>
      )}
  
  {/**************tabella********************************************************************************************************/}
      <div className='containerTabNote'>
  {/***********Note non completate********************************************************************************** */}
  <div  className='todo_containerOrdCli mt-5'>
        <div className='row'> 
        <div className='col' style={{paddingRight: "0px"}}>
        <p className='colTextTitle'> Clienti</p>
        <p className='textOrdRed'>Ordini non evasi</p>
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
          {todo.completa === "0" &&  (
      <>
    <div className='row diviCol1'>
        <div className='col-1 diviCol'>
            <p className="inpTab" style={{textAlign: "left"}}>{todo.cont}</p>
        </div>
         <div className='col-8 diviCol' 
          onClick={() => {
                getNotaId(todo.id, todo.cont, todo.nomeC, dataOrd, todo.data, todo.NumCartoni, todo.sommaTotale, todo.debitoRes, todo.debitoTotale, todo.indirizzo, todo.tel, todo.partitaIva, todo.completa, todo.idDebito, todo.NumBuste)
                navigate("/nota");
                auto(todo.nomeC);
                AutoProdCli.length = 0
                         }}>
             <p className="inpTab"  style={{textAlign: "left"}}>{todo.nomeC}</p>
        </div>
        <div className="col colIcon" style={{padding:"0px", marginTop:"8px"}}
            onClick={() => {
                getNotaId(todo.id, todo.cont, todo.nomeC, dataOrd, dataOrdConf, todo.NumCartoni, todo.sommaTotale, todo.debitoRes, todo.debitoTotale, todo.indirizzo, todo.tel, todo.partitaIva, todo.completa, todo.idDebito, todo.NumBuste)
                navigate("/nota");
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
        <p className='textOrd'> Ordini Evasi </p>
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
          { todo.completa === "1" &&  (
      <>
    <div className='row diviCol1'>
        <div className='col-1 diviCol'>
            <p className="inpTab" style={{textAlign: "left"}}>{todo.cont}</p>
        </div>
         <div className='col-8 diviCol' 
          onClick={() => {
                getNotaId(todo.id, todo.cont, todo.nomeC, dataOrd, dataOrdConf, todo.NumCartoni, todo.sommaTotale, todo.debitoRes, todo.debitoTotale, todo.indirizzo, todo.tel, todo.partitaIva, todo.completa, todo.idDebito, todo.NumBuste)
                navigate("/nota");
                auto(todo.nomeC);
                AutoProdCli.length = 0
                         }}>
             <p className="inpTab"  style={{textAlign: "left"}}>{todo.nomeC}</p>
        </div>
        <div className="col colIcon" style={{padding:"0px", marginTop:"8px"}}
          onClick={() => {
                getNotaId(todo.id, todo.cont, todo.nomeC, dataOrd, dataOrdConf, todo.NumCartoni, todo.sommaTotale, todo.debitoRes, todo.debitoTotale, todo.indirizzo, todo.tel, todo.partitaIva, todo.completa, todo.idDebito, todo.NumBuste)
                navigate("/nota");
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
export default AddNota;