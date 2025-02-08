import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, Timestamp, query, where, orderBy, getDocs, serverTimestamp, limit} from 'firebase/firestore';
import moment from 'moment/moment';
import useMediaQuery from '@mui/material/useMediaQuery';
import { TextField } from '@mui/material';
import { auth, db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { notifyError, notifyErrorDat } from '../components/Notify';
import Calendar from 'react-calendar';
import Button from '@mui/material/Button';
import { Modal } from 'react-bootstrap';
import Autocomplete from '@mui/material/Autocomplete';
import { notifyErrorCli, notifyUpdateCli, notifyErrorCliEm } from '../components/Notify';
import 'moment/locale/it'
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PendingIcon from '@mui/icons-material/Pending';
import CloseIcon from '@mui/icons-material/Close';
import { supa, guid, tutti, primary, rosso } from '../components/utenti';
import MiniDrawer from '../components/MiniDrawer';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LockIcon from '@mui/icons-material/Lock';
import { Opacity, Timer3 } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export const AutoProdCli = [];
//stati: 0= in lavorazione;  1=evaso; 2=Consegnato; 4 per i filtri mi fa vedere tutti gli stati

function OrdineCliData({ getOrdId, getNotaId, TodayData }) {
    const[colle, setColle] = useState([]); 
    const [todosClienti, setTodosClienti] = React.useState([]);
    const colleCollectionRef = collection(db, "addNota");

    const [anchorEl, setAnchorEl] = React.useState(null);

    let iddo=""

    //dati per l'input dell'ordine
    const [idCliente, setIdCliente] = React.useState("");
    const [idOrdine, setIdOrdine] = React.useState("");
    const dataInizialeFormatted = moment(TodayData, "DD/MM/YYYY").format("YYYY-MM-DD");
    const [dataOrd, setDataOrd] = useState(dataInizialeFormatted);
    const [status, setStatus] = React.useState("0");
    const [nomeC, setNomeC] = React.useState("");
    const [debitoRes, setDebitoRes] = React.useState("");
    const [indirizzo, setIndirizzo] = React.useState("");
    const [telefono, setTelefono] = React.useState("");
    const [cont, setCont] = React.useState(1);

    const timeElapsed = Date.now();  //prende la data attuale in millisecondi
    const today = new Date(timeElapsed);    //converte
    today.setHours(0, 0, 0, 0);
    let todayMilli = today.getTime()
    const yesterday = new Date(timeElapsed);
    yesterday.setDate(yesterday.getDate() - 1); //prende la data del giorno prima mi serve per il where
    yesterday.setHours(0, 0, 0, 0);  //lo imposta a ore 00:00 
    const YesterDayMilli = yesterday.getTime();  //fa la conversione in milli
    const [day, setday] = React.useState("");
    const [flagDelete, setFlagDelete] = useState(false); 
    const [flagBlock, setFlagBlock] = useState(false); 

    const [Progress, setProgress] = React.useState(false);
    const [popupActive, setPopupActive] = useState(false);  

    const [nome, setData] = useState("");
    const [stato, setStato] = useState("4"); 
    const matches = useMediaQuery('(max-width:920px)');  //media query true se è un dispositivo più piccolo del value

    moment.locale("it");

    let navigate = useNavigate();
    const [alignment, setAlignment] = React.useState('scorta');

    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

//funzioni per il menu per elimianre la trupla
    const handleMenu = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {  //chiude il menu
      setAnchorEl(null);
    };

  // vado a prendere i prodotti per singolo cliente
    const auto = async (idCliente) => {  //array per i prodotti dei clienti
      const q = query(collection(db, "prodottoClin"), where("author.idCliente", "==", idCliente));
      const querySnapshot = await  getDocs(q);
      querySnapshot.forEach((doc) => {

      let car = { label: doc.data().nomeP,
                  id: doc.id,
                  prezzoUni: doc.data().prezzoUnitario }
      AutoProdCli.push(car);
      });
      }


      const handleChangeTogg = (event) => {
        setAlignment(event.target.value);
      };

    //Per input aggiunta ordine
      const handleChangeDataSelect1 = (event) => {
        console.log(event.target.value)
        setStatus(event.target.value);      //prende il valore del select
      };

      function handleInputChange(event, value) {
        setNomeC(value)
        todosClienti.map((cli) => {
          if(cli.nomeC== value) {
            setIdCliente(cli.idCliente)
          } 
        })
      }
  //_________________________________________________________________________________________________________________
         const handleChangeDataSelect = (event) => {
          var ok= event.target.value
          console.log(ok);
          today.setDate(today.getDate() - ok);   //fa la differenza rispetto al valore del select sottraendo (per ridurre e i vari giorni)
          today.setHours(0, 0, 0, 0);   //mette la data a 00:00
          todayMilli = today.getTime()   //lo converte in millisecondi

          const collectionRef = collection(db, "addNota");
          const q = query(collectionRef, where("dataMilli", ">", todayMilli));
      
          const unsub = onSnapshot(q, (querySnapshot) => {
            let todosArray = [];
            querySnapshot.forEach((doc) => {
              todosArray.push({ ...doc.data(), id: doc.id });
            });
            todosArray.sort((a, b) => a.createdAt.toDate() - b.createdAt.toDate()); // Ordine crescente
            setColle(todosArray);
            setProgress(true);
          });

        };

  //_________________________________________________________________________________________________________________
  const handleChangeStatoSelect = (event) => {
    setStato(event.target.value)
  };

   //_________________________________________________________________________________________________________________
    const setClear = () => {
      setData("");
      toast.dismiss();
      toast.clearWaitingQueue();}
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
          handleDelete(localStorage.getItem("ordId"), localStorage.getItem("ordIdCliente"))
      //    bloccaNota(localStorage.getItem("ordId"), localStorage.getItem("ordDataEli"));
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
     //confirmation notification to remove the collection
    const MsgBlock = () => (
      <div style={{fontSize: "16px"}}>
        <p style={{marginBottom: "0px"}}>Sicuro di voler bloccare</p>
        <p style={{marginBottom: "0px"}}>(non sarà più annullabile)</p>
        <button className='buttonApply ms-4 mt-2 me-1 rounded-4' onClick={block}>Si</button>
        <button className='buttonClose mt-2 rounded-4'>No</button>
      </div>
    )

      const block = () => {
        bloccaNota(localStorage.getItem("ordId"), localStorage.getItem("ordDataEli"), localStorage.getItem("ordNumeroNote"), localStorage.getItem("ordDataMilli"), localStorage.getItem("ordDataTotQuot"));
          toast.clearWaitingQueue(); 
               }

    const displayMsgBlock = () => {
      toast.warn(<MsgBlock/>, {
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
  React.useEffect(() => {
    const collectionRef = collection(db, "addNota");
    const q = query(collectionRef, where("dataMilli", ">", todayMilli));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      todosArray.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
      setColle(todosArray);
      setProgress(true);
    });
    return () => unsub();
  }, [todayMilli]);

    //********************************************************************************** */
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


  /********************************************************************************************************* */
  const CreateOrdine = async (e) => {   //aggiunta Ordine
    e.preventDefault(); 
    var debRes=0;
    var id=0;
    var indiri;
    var telefo;
    var iva;
    var idOrdine="1";


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
          indiri= doc.data().indirizzo;
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
        //andiamo a fare il controllo, per verificare se questo ordine è già presente nel nostro database
        const s = query(collection(db, "addNota"), where("idCliente", "==", idCliente));  
        const querySnapshots = await getDocs(s);
        querySnapshots.forEach((doc) => {
          if (nomeC == doc.data().nomeC && dataInizialeFormatted ==doc.data().data) {   //va a prendere la trupla di questo cliente di questa data
            notifyErrorCli()
            toast.clearWaitingQueue(); 
            bol=false
        }
          });

    if(!nomeC) {
      notifyErrorCliEm();
      toast.clearWaitingQueue(); 
      return
    }
    if(bol == true) {
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
      debitoRes: debRes,
      indirizzo: indiri,
      tel: telefo,
      scaletta: false,
      scalettaData: "",
      scalettaDataMilli: 0,
      scalettaOrdine: 0,
      partitaIva: iva
    });
    setNomeC("");
    setPopupActive(false);
    }
  };
  //_________________________________________________________________________________________________________________

    const deleteCol = async (id, dat) => { //cancella tutto dalla data fino ai prodotti che fanno parte della lista
        const colDoc = doc(db, "ordDat", id); 
        const q = query(collection(db, "addNota"), where("data", "==", dat));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(async (hi) => {
          const p = query(collection(db, "Nota"), where("dataC", "==", dat), where("nomeC", "==", hi.data().nomeC));
          const querySnapshotp = await getDocs(p);
          querySnapshotp.forEach(async (hip) => {
            await deleteDoc(doc(db, "Nota", hip.id));  //1 elimina tutti i prodotti nella lista
          })

        await deleteDoc(doc(db, "addNota", hi.id));  //2 elimina tutti i dati di addNota della stessa data
        });
        
        await deleteDoc(colDoc); //3 infine elimina la data
    }

  //___________________________________________________________________________________________________
        const handleDelete = async () => {
    
          console.log(iddo)
          const colDoc = doc(db, "addNota", iddo); 
        //elimina tutti i dati di nota di quel ordine, i prodotti
          const q = query(collection(db, "Nota"),  where("idNota", "==", iddo));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (hi) => {
          await deleteDoc(doc(db, "Nota", hi.id)); 
          });
          //infine elimina l'ordine
          await deleteDoc(colDoc);
          handleClose() //chiude il menu elimina ordine
        };
  //__________________________________________________________________________________________________________________________________________________
    const bloccaNota = async (id, dat, numNot, dtMilli, TotQuot) => { //salva prima i dati su un altro database per poi cancellare i dati sul database in cui stavano
      const colDoc = doc(db, "ordDat", id); 
      const q = query(collection(db, "addNota"), where("data", "==", dat));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (hi) => {
        const p = query(collection(db, "Nota"), where("dataC", "==", dat), where("nomeC", "==", hi.data().nomeC));
        const querySnapshotp = await getDocs(p);
        querySnapshotp.forEach(async (hip) => {
          await addDoc(collection(db, "NotaBloccata"), {   //vado prima a salvare questi dati su un db, e poi li cancello
            dataC: hip.data().dataC,
            qtProdotto: hip.data().qtProdotto,
            nomeC: hip.data().nomeC,
            prodottoC: hip.data().prodottoC,
            prezzoUniProd: hip.data().prezzoUniProd,
            prezzoTotProd: hip.data().prezzoTotProd,
            simbolo: hip.data().simbolo,
            flagTinte: hip.data().flagTinte,
            t1: hip.data().t1,
            t2: hip.data().t2,
            t3: hip.data().t3,
            t4: hip.data().t4,
            t5: hip.data().t5,
          });
          await deleteDoc(doc(db, "Nota", hip.id));  //1 elimina tutti i prodotti nella lista nota, cosi libero memoria e farò meno query
        })
        await addDoc(collection(db, "addNotaBloccata"), {   //vado prima a salvare questi dati su un db, e poi li cancello
          data: hi.data().data,
          nomeC: hi.data().nomeC,
          dataMilli: hi.data().dataMilli,
          debitoRes: hi.data().debitoRes,
          debitoTotale: hi.data().debitoTotale,
          sommaTotale: hi.data().sommaTotale,
          quota: hi.data().quota,
        });
      await deleteDoc(doc(db, "addNota", hi.id));  //2 elimina tutti i dati di addNota della stessa data
      });
      await addDoc(collection(db, "ordDatBloccata"), {   //mette il numero di note in questo db
        data: dat,
        dataMilli: dtMilli,
        numeroNote: numNot,
        totalQuota: TotQuot,
      });
      await deleteDoc(colDoc); //3 infine elimina la data
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
      </div>
      <div className='col' style={{padding: 0}}>
      <p className='navText'> Ordine Clienti </p>
      </div>
      </div>

        <motion.div  style={{padding: "0px"}}
        initial= {{x: "-100vw"}}
        animate= {{x: 0}}
        transition={{ duration: 0.4 }}
        >
        
        {!matches && 
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate(-1)}}>
      <ArrowBackIcon id="i" /></button> 
    }
    {!matches ? <h1 className='title mt-3' style={{ textAlign: "left", marginLeft: "70px" }}>Ordine Clienti</h1> : <div style={{marginBottom:"60px"}}></div>} 

   <div style={{ justifyContent: "left", textAlign: "left", marginTop: "40px" }}> 
    <ToggleButtonGroup
      color="primary"
      value={alignment}
      exclusive
      onChange={handleChangeTogg}
      aria-label="Platform"
    > 
    <Button  color='primary' style={{borderTopRightRadius: "0px", borderBottomRightRadius: "0px" }}  onClick={() => { setPopupActive(true); }}  variant="contained">Aggiungi Ordine</Button>
    <Button color='error'  style={{borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px" }}  onClick={() => {setFlagDelete(!flagDelete)  }}  variant="contained">Elimina</Button>
    {/*{sup == true && <Button  onClick={() => {setFlagBlock(true); setFlagDelete(false)}} size="small" variant="contained">Blocca</Button>}  */}
    </ToggleButtonGroup>
    </div>



{/*************************TABELLA ORDINI CLIENTI DATA************************************************************************** */}
          <div className='todo_container' style={{width: "1250px"}}>
              <div className='row'>
                      <div className='col colTextTitle'>
                       Ordine Clienti
                      </div>
                      <div className='col'>
                          Barra di Ricerca
                      </div>
                      <div className='col'>
                        <FormControl >
                        <InputLabel id="demo-simple-select-label"></InputLabel>
                        <Select sx={{height:39, marginLeft:-1, width: 150}}
                         labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        defaultValue={0}
                        onChange={handleChangeDataSelect}>
                        <MenuItem value={0}>Oggi</MenuItem>
                        <MenuItem value={7}>Ultimi 7 giorni</MenuItem>
                        <MenuItem value={30}>Ultimi 30 giorni</MenuItem>
                        <MenuItem value={90}>Ultimi 90 giorni</MenuItem>
                        <MenuItem value={365}>Ultimi 365 giorni</MenuItem>
                        </Select>
                        </FormControl>
                        </div>
                        <div className='col'>
                        <FormControl >
                        <InputLabel id="demo-simple-select-label"></InputLabel>
                        <Select sx={{height:39, marginLeft:-1, width: 150}}
                         labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        defaultValue={"4"}
                        onChange={handleChangeStatoSelect}>
                        <MenuItem value={"4"}>Tutti</MenuItem>
                        <MenuItem value={"0"}>In Lavorazione</MenuItem>
                        <MenuItem value={"1"}>Evaso</MenuItem>
                        <MenuItem value={"2"}>Conseganto</MenuItem>
                        </Select>
                        </FormControl>
                        </div>
                    </div>
                    <div className='row' style={{ height: "25px", marginTop: "7px" }}>
                      <div className='col-1 coltext' style={{ width:"100px" }}>id Ordine</div>
                      <div className='col-4 coltext'>Cliente</div>
                      <div className='col-1 coltext'style={{ width: "125px" }} >Data</div>
                      <div className='col-1 coltext' style={{ width: "160px" }}>Stato</div>
                      <div className='col-1 coltext' style={{ width:"110px" }}>€Totale</div>
                      <div className='col-1 coltext' style={{ width:"110px" }}>€Guadagno</div>
                      <div className='col-1 coltext'style={{ width:"100px" }}>N. Cartoni</div>
                      <div className='col-1 coltext'style={{ width:"100px" }}>N. Buste</div>
                    </div>

                    {Progress == false && 
                    <div style={{marginTop: "14px"}}>
                      <CircularProgress />
                    </div>
                    }
                {colle.map((col) => (
                  <div key={col.id}>
                  {(col.completa == stato  || stato == "4") && 
                    <>
                    <div className="diviCol1" > 
                      <div className="row d-flex algin-items-center">
                      <div className='col-1' style={{ width:"100px" }}><h3 className='inpTab' style={{color: primary}} ><b>{ col.idOrdine }</b></h3></div>
                      <div className='col-4'><h3 className='inpTab' onClick={()=> {
                        getNotaId(col.idCliente, col.id, col.cont, col.nomeC, col.data, col.data, col.NumCartoni, col.sommaTotale, col.debitoRes, col.debitoTotale, col.indirizzo, col.tel, col.partitaIva, col.completa, col.idDebito, col.NumBuste)
                        navigate("/nota")
                        auto(col.idCliente);
                        AutoProdCli.length = 0
                        }}><span style={{color: primary}}><b>{col.idCliente}</b></span> { col.nomeC }</h3></div>


                      <div className="col-1" style={{ width: "125px" }}> <h3 className='inpTab' >{ col.data }</h3></div>
                      {col.completa == 0 && (
                        <div className="col-2" style={{ width: "160px" }}>
                          <div className='row'>
                            <div className='col-1'><PendingIcon className='inpTab' style={{ color: rosso }} /></div>
                            <div className='col'><h3 className='inpTab' style={{ color: rosso }}>In Lavorazione</h3></div>
                          </div>
                        </div>
                      )}
                      {col.completa == 1 && (
                        <div className="col-2" style={{ width: "160px" }}>
                          <div className='row'>
                            <div className='col-1'><LocalShippingIcon className='inpTab' style={{ color: "orange" }} /></div>
                            <div className='col'><h3 className='inpTab' style={{ color: "orange" }}>Evaso</h3></div>
                          </div>
                        </div>
                      )}
                      {col.completa == 2 && (
                        <div className="col-2" style={{ width: "160px" }}>
                          <div className='row'>
                            <div className='col-1'><CheckCircleIcon className='inpTab' style={{ color: "green" }} /></div>
                            <div className='col'><h3 className='inpTab' style={{ color: "green" }}>Consegnato</h3></div>
                          </div>
                        </div>
                      )}
                      <div className='col-1' style={{ width:"110px" }}><h3 className='inpTab'>€{Number(col.sommaTotale).toFixed(2).replace('.', ',')}</h3></div>
                      <div className='col-1' style={{ width:"110px" }}><h3 className='inpTab'>€{Number(col.quota).toFixed(2).replace('.', ',')}</h3></div>
                      <div className='col-1' style={{ width:"100px" }}><h3 className='inpTab' >{ col.NumCartoni }</h3></div>
                      <div className='col-1' style={{ width:"100px", }}><h3 className='inpTab' >{ col.NumBuste }</h3></div>

                    {flagDelete ?
                      <div className='col-1' style={{padding:"0px", marginTop:"-8px", width: "20px"}}>
                  <button className="button-delete" style={{color: rosso, marginLeft: "-70px"}} onClick={()=> {console.log(col.id); iddo=col.id; displayMsg();}}>  <DeleteIcon id="i" /> </button>
                  </div> :
                  <div className='col-1'>
                  
                  </div> }



                        {/*
                        { flagBlock &&
                        <div className="col" style={{padding:"0px", marginTop:"-8px"}}>    
                        <button
                         className="button-delete"
                         onClick={() => {
                            localStorage.setItem("ordDataEli", col.data);
                            localStorage.setItem("ordId", col.id);
                            localStorage.setItem("ordNumeroNote", col.numeroNote);
                            localStorage.setItem("ordDataMilli", col.dataMilli);
                            localStorage.setItem("ordDataTotQuot", col.totalQuota);
                            displayMsgBlock();
                            toast.clearWaitingQueue(); 
                            }}>
                          <LockIcon id="i" />
                        </button>            
                        </div>
                        }
                     */ }
                      </div>
                    </div>
                    <hr style={{margin: "0"}}/>

                  </>
                  }
                  </div>
                  ))}
              </div>
        {/**Fine tabella */} 



{/******Aggiungi Prodotto  modal***************************************************************************** */}
<Modal  size="lg" show={popupActive} onHide={()=> { setPopupActive(false) }} style={{ marginTop: "50px" }}>
      <div>  <button type='button' className="button-close float-end" onClick={() => { setPopupActive(false);  }}>
              <CloseIcon id="i" /></button> </div>
    {popupActive && <h4 className='title'  style={{ width: "300px", position: "absolute", top: "10px", marginLeft: "2px" }}> Aggiungi Ordine </h4>}
          <Modal.Body>
          <div className='row mt-4' >
          <div className='col'>
        <TextField color="secondary" className='mt-2' style={{ width: "100%" }} type='date' label="Data di Creazione"
              placeholder="DD/MM/YYYY" value={dataOrd} onChange={(e) => setDataOrd(e.target.value)} />
        </div>
          <div className='col'>
            <FormControl style={{ marginTop: "7.4px" }}>
                <InputLabel id="demo-simple-select-label" color="secondary">Stato</InputLabel>
                  <Select sx={{height:57,  width: "400px"}}
                  label="Stato"
                  color='secondary'
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    defaultValue={0}
                    onChange={handleChangeDataSelect1}>
                  <MenuItem value={"0"}>In Lavorazione</MenuItem>
                  <MenuItem value={"1"}>Evaso</MenuItem>
                  <MenuItem value={"2"}>Coseganto</MenuItem>
                    </Select>
              </FormControl>
          </div>
          </div>
      <div className='row mt-4 mb-4'>
        <Autocomplete
            value={nomeC}
            options={todosClienti.map(cliente => cliente.nomeC)}
            onInputChange={handleInputChange}
            componentsProps={{ popper: { style: { width: 'fit-content' } } }}
            renderInput={(params) => <TextField color='secondary' {...params} label="Cliente" />}
          />

      </div>
       {popupActive && <Button onClick={CreateOrdine} style={{ width: "100%", height: "50px" }} className='' type='submit' color='primary' variant="contained" >Aggiungi Ordine </Button>}
          </Modal.Body>
      </Modal>

    
        </motion.div>
           </>
      )
}
export default OrdineCliData;