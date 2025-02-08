import React, { useEffect, useState, useRef } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, Timestamp, query, where, orderBy, getDocs, serverTimestamp, writeBatch, limit} from 'firebase/firestore';
import moment from 'moment/moment';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useReactToPrint } from 'react-to-print';
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
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ScaletData from './ScaletData';

export const AutoProdCli = [];
//stati: 0= in lavorazione;  1=evaso; 2=Consegnato; 4 per i filtri mi fa vedere tutti gli stati

function Scaletta({ getOrdId, getNotaId, TodayData }) {
    const[colle, setColle] = useState([]); 
    const [todosClienti, setTodosClienti] = React.useState([]);
    const colleCollectionRef = collection(db, "addNota");
    const componentRef = useRef();
    const [flagStampa, setFlagStampa] = useState(false); 
    

    const [anchorEl, setAnchorEl] = React.useState(null);

    let iddo=""

    //dati per l'input dell'ordine
    const [idCliente, setIdCliente] = React.useState("");
    const [idOrdine, setIdOrdine] = React.useState("");
    const dataInizialeFormatted = moment(TodayData, "DD/MM/YYYY").format("DD-MM-YYYY");
    const [scalettaDataSele, setScalettaDataSele] = useState(dataInizialeFormatted);
    const [valueDateOrd, setValueDateOrd] = useState(1);
    const [status, setStatus] = React.useState("0");
    const [nomeC, setNomeC] = React.useState("");
    const [debitoRes, setDebitoRes] = React.useState("");
    const [indirizzo, setIndirizzo] = React.useState("");
    const [telefono, setTelefono] = React.useState("");
    const [cont, setCont] = React.useState(1);

    const [sum, setSum]  = React.useState("");
    const [sumQ, setSumQ] =React.useState("");
      const [scaletta, setScaletta] = React.useState([]);

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

    const [Progress, setProgress] = React.useState(false);
    const [popupActive, setPopupActive] = useState(false);  

    const [nome, setData] = useState("");
    const [stato, setStato] = useState("1"); 
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

//Funzioni per aggiungere alla scaletta-----------------------------------------------------------------
      const SomAsc = async () => {  //qui fa sia la somma degli asc  della quota, tramite query
        console.log("entrato nella somma")
        var somma=0;
        var sommaQ=0;
        var sommaSommaTot=0;
        var id ="";
        const q = query(collection(db, "Scaletta"), where("dataScal", "==", TodayData));  //query per fare la somma
        const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            somma =+doc.data().numAsc + somma;
            sommaQ=+doc.data().quota +sommaQ;
            sommaSommaTot= +doc.data().sommaTotale +sommaSommaTot;
            });
            var somTrunc = sommaQ.toFixed(2);  //conversione della quota
            var somTruncTot = sommaSommaTot.toFixed(2);  //conversione della sommaTotale
        const p = query(collection(db, "scalDat"), where("data", "==", TodayData));  //query per aggiornare la quota totale e gli asc, va a trovare l'id
        const querySnapshotp = await getDocs(p);
              querySnapshotp.forEach(async (hi) => {
                id= hi.id
                });
            await updateDoc(doc(db, "scalDat", id), { totalQuota: somTrunc, totalAsc:somma, totalSommaTotale:somTruncTot  });
            setSumQ(somTrunc);
            setSum(somma);
      }

      const caricaOrdiniScaletta = (data) => {
        const collectionRef = collection(db, "addNota");
        const q = query(
            collectionRef,
            where("scalettaData", "==", data),
            where("scaletta", "==", true)
        );
    
        const unsub = onSnapshot(q, (querySnapshot) => {
            let todosArray = [];
    
            querySnapshot.forEach((doc) => {
                todosArray.push({ ...doc.data(), id: doc.id });
            });
    
            todosArray.sort((a, b) => a.scalettaOrdine - b.scalettaOrdine);
            todosArray.sort((a, b) => {
                if (a.scalettaOrdine === b.scalettaOrdine) {
                    return a.createdAt.toDate() - b.createdAt.toDate();
                }
                return 0;
            });
    
            setScaletta(todosArray);
            setProgress(true);
        });
    };
    

        //aggiunge una nota alla scaletta
        const handleDateChange = async (id) => {
            try {
              // 🔍 1️⃣ Trova il valore massimo di scalettaOrdine per la data selezionata
              const collectionRef = collection(db, "addNota");
              const q = query(
                collectionRef,
                where("scalettaData", "==", scalettaDataSele),
                where("scaletta", "==", true),
                orderBy("scalettaOrdine", "desc"),
                limit(1) // Prendi solo il più alto
              );
          
              const querySnapshot = await getDocs(q);
              let newOrder = 1; // Se non ci sono documenti, parte da 1
          
              if (!querySnapshot.empty) {
                const highestOrder = querySnapshot.docs[0].data().scalettaOrdine;
                newOrder = highestOrder + 1; // Incrementa di 1
              }
          
              // 📝 2️⃣ Aggiorna il documento specifico con il nuovo ordine
              const notaRef = doc(db, "addNota", id);
              await updateDoc(notaRef, {
                scaletta: true,
                scalettaData: scalettaDataSele,
                scalettaOrdine: newOrder,
              });
          
              // 📌 3️⃣ Ricarica la lista dopo l'aggiornamento
              caricaOrdiniScaletta(scalettaDataSele);
              handleChangeDataSelect(valueDateOrd);
          
              console.log(`Documento aggiornato con successo! Nuovo ordine: ${newOrder}`);
            } catch (error) {
              console.error("Errore nell'aggiornamento:", error);
            }
          };

          //-----------------------------------------------------------------------------------
          //rimuovi un nota alla scaletta
          const handleRemoveFromScaletta = async (id, scalettaOrdine) => {
            try {
                const dbRef = collection(db, "addNota");
        
                // 🔍 1️⃣ Trova tutti quelli con scalettaData uguale e scalettaOrdine maggiore di quello eliminato
                const q = query(
                    dbRef,
                    where("scalettaData", "==", scalettaDataSele),
                    where("scaletta", "==", true),
                    where("scalettaOrdine", ">", scalettaOrdine), // Solo quelli dopo
                    orderBy("scalettaOrdine", "asc") // Ordine crescente per aggiornarli uno per uno
                );
        
                const querySnapshot = await getDocs(q);
                const batch = writeBatch(db);
        
                // 🔄 2️⃣ Scaliamo di -1 tutti quelli dopo
                querySnapshot.forEach((docSnap) => {
                    const notaRef = doc(db, "addNota", docSnap.id);
                    batch.update(notaRef, { scalettaOrdine: docSnap.data().scalettaOrdine - 1 });
                });
        
                // 🗑 3️⃣ Rimuovi l'elemento dalla scaletta
                const notaRef = doc(db, "addNota", id);
                batch.update(notaRef, {
                    scaletta: false,
                    scalettaData: "",
                    scalettaOrdine: null
                });
        
                // 🚀 4️⃣ Esegui tutte le modifiche in un'unica operazione
                await batch.commit();
        
                // 🔄 5️⃣ Ricarica la lista aggiornata
                caricaOrdiniScaletta(scalettaDataSele);
                console.log("Elemento rimosso e ordine aggiornato!");
            } catch (error) {
                console.error("Errore durante la rimozione:", error);
            }
        };
        //****************************************************************************************** */
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
        
        function HandleSpeedAddScalClien() {
          setPopupActive(true);
        }
  //_________________________________________________________________________________________________________________
        const handleChangeDataSelect = (val) => {
        setValueDateOrd(val);
        console.log(val);
        today.setDate(today.getDate() - val);   //fa la differenza rispetto al valore del select sottraendo (per ridurre e i vari giorni)
        today.setHours(0, 0, 0, 0);   //mette la data a 00:00
        todayMilli = today.getTime()   //lo converte in millisecondi

        const collectionRef = collection(db, "addNota");
        const q = query(collectionRef, where("dataMilli", ">", todayMilli), where("scaletta", "==", false));
    
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
    const q = query(collectionRef, where("dataMilli", ">", todayMilli), where("scaletta", "==", false));

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


  useEffect(() => {
    caricaOrdiniScaletta(dataInizialeFormatted);
    }, []);

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
  const handleChangeDataScaletta = (e) => {
    setScalettaDataSele(moment(e.target.value).format("DD-MM-YYYY"));
    caricaOrdiniScaletta(moment(e.target.value).format("DD-MM-YYYY"));
    };


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
      <p className='navText'> Scaletta </p>
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
    {!matches ? <h1 className='title mt-3' style={{ textAlign: "left", marginLeft: "70px" }}>Scaletta</h1> : <div style={{marginBottom:"60px"}}></div>} 

   <div style={{ justifyContent: "left", textAlign: "left", marginTop: "40px" }}> 
    <ToggleButtonGroup
      color="primary"
      value={alignment}
      exclusive
      onChange={handleChangeTogg}
      aria-label="Platform"
    > 
    {/*{sup == true && <Button  onClick={() => {setFlagBlock(true); setFlagDelete(false)}} size="small" variant="contained">Blocca</Button>}  */}
    </ToggleButtonGroup>
    </div>



{/*************************TABELLA ORDINI CLIENTI ordini evasi************************************************************************** */}
        
          <div className='todo_container' style={{width: "800px", maxHeight:"300px"}}>
              <div className='row'>
                      <div className='col colTextTitle'>
                       Ordini Evasi
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
                        onChange={(e) => handleChangeDataSelect(e.target.value)}>
                        <MenuItem value={0}>Oggi</MenuItem>
                        <MenuItem value={7}>Ultimi 7 giorni</MenuItem>
                        <MenuItem value={30}>Ultimi 30 giorni</MenuItem>
                        <MenuItem value={90}>Ultimi 90 giorni</MenuItem>
                        <MenuItem value={365}>Ultimi 365 giorni</MenuItem>
                        </Select>
                        </FormControl>
                        </div>
                        <div className='col'>

                        </div>
                    </div>
                    <div className='row' style={{ height: "25px", marginTop: "7px" }}>
                      <div className='col-1 coltext' style={{ width:"100px" }}>id Ordine</div>
                      <div className='col-4 coltext'>Cliente</div>
                      <div className='col-1 coltext'style={{ width: "125px" }} >Data</div>
                      <div className='col-1 coltext' style={{ width: "160px" }}>Stato</div>
                    </div>

                    {Progress == false && 
                    <div style={{marginTop: "14px"}}>
                      <CircularProgress />
                    </div>
                    }
                <div style={{overflowY: "auto"}}>
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
                     <div className='col-1' style={{padding:"0px", marginTop:"-5px", width: "20px"}}>
                        <button onClick={() => {handleDateChange(col.id)}} style={{color: "green", marginLeft: "0px"}} className="button-delete"><PlaylistAddIcon/></button>
                     </div>
                      

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
              </div>
        {/**Fine tabella */} 


{/*************************TABELLA Per la scaletta************************************************************************** */}
<div className='d-flex flex-column justify-content-start' style={{marginTop: "100px"}}>
        <h2 className='title'>Scaletta</h2>
          <div className='todo_container' style={{width: "800px", maxHeight:"300px"}}>
              <div className='row'>
                      <div className='col-1 colTextTitle'>
                       Scaletta
                      </div>
                      <div className='col-4'>
                          Barra di Ricerca
                      </div>
                      <div className='col-7 d-flex align-items-center gap-1'>
                        <p className='mb-0'>Seleziona una data:  </p>
                      <input
                        type="date"
                        value={moment(scalettaDataSele, "DD-MM-YYYY").format("YYYY-MM-DD")} // Converti per l'input
                        onChange={(e) => handleChangeDataScaletta(e)} // Salva in formato gg-mm-yyyy
                        />
                        </div>
                    </div>
                    <div className='row' style={{ height: "25px", marginTop: "7px" }}>
                      <div className='col-1 coltext' style={{ width:"100px" }}>N</div>
                      <div className='col-4 coltext'>Cliente</div>
                      <div className='col-1 coltext'style={{ width: "125px" }} >Data Crea.</div>
                      <div className='col-1 coltext' style={{ width: "160px" }}>Stato</div>
                    </div>

                    {Progress == false && 
                    <div style={{marginTop: "14px"}}>
                      <CircularProgress />
                    </div>
                    }
                <div style={{ overflowY: "auto"}}>
                {scaletta.map((col) => (
                  <div key={col.id}>
                  {(col.completa == stato  || stato == "4") && 
                    <>
                    <div className="diviCol1" > 
                      <div className="row d-flex algin-items-center">
                      <div className='col-1' style={{ width:"100px" }}><h3 className='inpTab' style={{color: primary}} ><b>{ col.scalettaOrdine }</b></h3></div>
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
                      <div className='col-1' style={{padding:"0px", marginTop:"-5px", width: "20px"}}>
                        <button onClick={() => {handleRemoveFromScaletta(col.id, col.scalettaOrdine)}} style={{color: "red", marginLeft: "0px"}} className="button-delete"><PlaylistRemoveIcon/></button>
                     </div>



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
              </div>
            </div>
        {/**Fine tabella */} 

    
        </motion.div>
           </>
      )
}
export default Scaletta;