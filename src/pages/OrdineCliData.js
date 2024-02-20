import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, Timestamp, query, where, orderBy, getDocs} from 'firebase/firestore';
import moment from 'moment/moment';
import useMediaQuery from '@mui/material/useMediaQuery';
import { TextField } from '@mui/material';
import { auth, db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { notifyError, notifyErrorDat } from '../components/Notify';
import Calendar from 'react-calendar';
import Button from '@mui/material/Button';
import 'moment/locale/it'
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from '@mui/icons-material/Close';
import { supa, guid, tutti } from '../components/utenti';
import MiniDrawer from '../components/MiniDrawer';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LockIcon from '@mui/icons-material/Lock';
import { Opacity, Timer3 } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';


function OrdineCliData({ getOrdId }) {
    const[colle, setColle] = useState([]); 
    const colleCollectionRef = collection(db, "addNota");


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
    const matches = useMediaQuery('(max-width:920px)');  //media query true se è un dispositivo più piccolo del value

    moment.locale("it");

    let navigate = useNavigate();
    const [alignment, setAlignment] = React.useState('scorta');

    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true





      const handleChangeTogg = (event) => {
        setAlignment(event.target.value);
      };
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
            todosArray.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()); // Ordine decrescente
            setColle(todosArray);
            setProgress(true);
          });

        };

  //_________________________________________________________________________________________________________________
  const handleChangeStatoSelect = (event) => {
    var ok= event.target.value
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
          deleteCol(localStorage.getItem("ordId"), localStorage.getItem("ordDataEli") );
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
      todosArray.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()); // Ordine decrescente
      setColle(todosArray);
      setProgress(true);
    });
    return () => unsub();
  }, [todayMilli]);
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
  //_________________________________________________________________________________________________________________
  const createCol = async (e) => {    
    e.preventDefault();  
    var formattedDate = moment(nome).format('DD-MM-YYYY');
    var bol= true
    if(!nome) {            
      notifyError();
      toast.clearWaitingQueue(); 
      return
    }
    colle.map(async (nice) => {    //va a fare il controllo e va a vedere se questa data già è stat inserita
      if (formattedDate == nice.data) {   //va a prendere la trupla di questo cliente di questa data
        notifyErrorDat()
        toast.clearWaitingQueue(); 
       bol=false
      }
    })
    if(bol == true) {
    await addDoc (collection(db, "addNotaBloccata"), {
      numeroNote: 0,
      data: formattedDate,
      dataMilli: nome.getTime(),
      nome,
      totalQuota:0,
      totalAsc:0
    });
    setClear();
    }
  };

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
   {!matches ? <h1 className='title mt-3'> Ordine Clienti</h1> : <div style={{marginBottom:"60px"}}></div>} 

    <ToggleButtonGroup
      color="primary"
      value={alignment}
      exclusive
      onChange={handleChangeTogg}
      aria-label="Platform"
    > 
    {sup == true && <Button onClick={() => {setFlagDelete(true); setFlagBlock(false)}} color="error" variant="contained">Elimina</Button> }
    {sup == true && <Button  onClick={() => {setFlagBlock(true); setFlagDelete(false)}} size="small" variant="contained">Blocca</Button>}
    </ToggleButtonGroup>
{/** inserimento Data *************************************************************/}
{sup ===true && (
        <>    
{popupActive &&
  <div>  
      <form className='formSD' onSubmit={createCol}>
      <div>  <button onClick={() => { setPopupActive(false); }} type='button' className="button-close float-end mb-2" >
              <CloseIcon id="i" />
              </button>   
      </div>
      <div className="input_container">
      <Calendar onChange={setData} value={nome}  elevation={3} />
      </div>
      <div className="btn_container">
      <Button type='submit' variant="outlined">Aggiungi la data</Button>
      </div>
    </form>
  </div> }
{!popupActive &&
  <div className="btn_container mt-5"> 
  <Button  onClick={() => { navigate("/addnota") }}  variant="outlined">Aggiungi Ordine</Button>
  </div>
  }
  </>
    )}
{/*************************************************************************************************** */}

            <div className="container">
              <div className="row">
                <div className="col"> <h3></h3></div>
                <div className="col">

                </div>

                <div className="col mt-4">
          
                </div>
              </div>
{/*************************TABELLA ORDINI CLIENTI DATA************************************************************************** */}
          <div className='todo_container' style={{width: "auto"}}>
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
                        defaultValue={0}
                        onChange={handleChangeStatoSelect}>
                        <MenuItem value={4}>Tutti</MenuItem>
                        <MenuItem value={0}>In Lavorazione</MenuItem>
                        <MenuItem value={1}>Da Evadere</MenuItem>
                        <MenuItem value={2}>Conseganto</MenuItem>
                        </Select>
                        </FormControl>
                        </div>
                    </div>
                    <div className='row' style={{ height: "25px", marginTop: "7px" }}>
                      <div className='col-1 coltext'>id Ordine</div>
                      <div className='col-3 coltext'>Cliente</div>
                      <div className='col coltext'>Data</div>
                      <div className='col coltext'>Stato</div>
                      <div className='col coltext'>€Totale</div>
                      <div className='col coltext'>€Guadagno</div>
                      <div className='col coltext'>N. Cartoni</div>
                      <div className='col coltext'>N. Buste</div>
                    </div>

                    {Progress == false && 
                    <div style={{marginTop: "14px"}}>
                      <CircularProgress />
                    </div>
                    }
                {colle.map((col) => (
                  <div key={col.id}>
                  {col.dataMilli >= localStorage.getItem("bho3") && 
                    <>
                    <div className="diviCol1"> 
                      <div className="row">
                      <div className='col-1'><h3 className='inpTab' >{ col.idO }</h3></div>
                      <div className='col-3'><h3 className='inpTab' >{ col.nomeC }</h3></div>
                      <div className="col" > <h3 className='inpTab' >{ col.data }</h3></div>
                      <div className="col" > <h3 className='inpTab' >{ col.completa }</h3></div>
                      <div className='col'><h3 className='inpTab' >{ col.sommaTotale }€</h3></div>
                      <div className='col'><h3 className='inpTab' >{ col.quota }€</h3></div>
                      <div className='col'><h3 className='inpTab' >{ col.NumCartoni }</h3></div>
                      <div className='col'><h3 className='inpTab' >{ col.NumBuste }</h3></div>


                        { flagDelete &&
                        <div className="col" style={{padding:"0px", marginTop:"-8px"}}>    
                        <button
                         className="button-delete"
                         onClick={() => {
                            localStorage.setItem("ordDataEli", col.data);
                            localStorage.setItem("ordId", col.id);
                            displayMsg();
                            toast.clearWaitingQueue(); 
                            }}>
                          <DeleteIcon id="i" />
                        </button>            
                        </div>
                        }
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



            </div>
            </motion.div>
           </>
      )
}
export default OrdineCliData;