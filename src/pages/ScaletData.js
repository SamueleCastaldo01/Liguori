import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, Timestamp, query, where, orderBy, getDocs, serverTimestamp} from 'firebase/firestore';
import moment from 'moment/moment';
import useMediaQuery from '@mui/material/useMediaQuery';
import { TextField } from '@mui/material';
import { auth, db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { notifyError, notifyErrorDat } from '../components/Notify';
import Button from '@mui/material/Button';
import 'moment/locale/it'
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from '@mui/icons-material/Close';
import { supa, guid, tutti } from '../components/utenti';
import Box from '@mui/material/Box';
import MiniDrawer from '../components/MiniDrawer';
import Calendar from 'react-calendar';
import "../Calendar.css"
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import { motion } from 'framer-motion';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export const AutoComp = [];


function ScaletData({ getColId }) {
    const[colle, setColle] = useState([]); 
    const colleCollectionRef = collection(db, "scalDat"); 

    const [popupActive, setPopupActive] = useState(false); 
    const [flagDelete, setFlagDelete] = useState(false); 
    const [flagBlock, setFlagBlock] = useState(false); 

    const [Progress, setProgress] = React.useState(false);
    const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone

    const [alignment, setAlignment] = React.useState('scorta');

    const [nome, setData] = useState("");
    const timeElapsed = Date.now();  //prende la data attuale in millisecondi
    const today = new Date(timeElapsed);    //converte
    const [day, setday] = React.useState("");
    const [titleNav, setTitleNav] = useState("Scaletta");

    moment.locale("it");

    let navigate = useNavigate();


    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true



    const auto = async () => {
      const q = query(collection(db, "clin"), orderBy("nomeC"));  //va a prendere tutti i clienti e li mette in questo array AutoComp
      const querySnapshot = await  getDocs(q);
      querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data().nomeC);
      let car = { label: doc.data().nomeC }
      AutoComp.push(car);
      });
      }
   //_________________________________________________________________________________________________________________
      const handleChangeDataSelect = (event) => {
        setday(event.target.value);      //prende il valore del select
        var ok= event.target.value
        today.setDate(today.getDate() - ok);   //fa la differenza rispetto al valore del select sottraendo, il risultato sarà in millisecondi
         localStorage.setItem("bho2", today.getTime())
      };

      const handleChangeTogg = (event) => {
        setAlignment(event.target.value);
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
          deleteCol(localStorage.getItem("scalId"), localStorage.getItem("dataEli") );
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
        bloccaNota(localStorage.getItem("scalId"), localStorage.getItem("dataEli"), localStorage.getItem("scalDataMilli"), localStorage.getItem("ScaltotalQuota"), localStorage.getItem("scalSommaTot") );
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
    const collectionRef = collection(db, "scalDat");
    const q = query(collectionRef, orderBy("nome", "desc"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setColle(todosArray);
      setProgress(true);
      today.setDate(today.getDate() - 8);   //fa la differenza rispetto al valore del select sottraendo, il risultato sarà in millisecondi
      localStorage.setItem("bho2", today.getTime())
    });
    return () => unsub();
  }, []);
  //_________________________________________________________________________________________________________________
  const bloccaNota = async (id, dat, dtMilli, sQuot, TotSom) => { //salva prima i dati su un altro database per poi cancellare i dati sul database in cui stavano
    const colDoc = doc(db, "scalDat", id);  
     
    //vado prima a inserire i dati nella scalettaBloccata, e dopo elimino tutti i dati della scaletta in base a quella data
    const q = query(collection(db, "Scaletta"), where("dataScal", "==", localStorage.getItem("dataEli")));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (hi) => {
      await addDoc(collection(db, "scalettaBloccata"), {   //va ad inserire delle nuove truple nella scalettaBloccata
        dataScal: hi.data().dataScal,
        debito: hi.data().debito,
        nomeC: hi.data().nomeC,
        note: hi.data().note,
        quota: hi.data().quota,
        sommaTotale: hi.data().sommaTotale,
      });
    await deleteDoc(doc(db, "Scaletta", hi.id));  //elimina le truple da scaletta
    });
    await addDoc(collection(db, "scalDatBloccata"), {   //va ad aggiungere i dati nella scalDatBloccata
      data: dat,
      dataMilli: dtMilli,
      totalQuota: sQuot,
      totalSommaTotale: TotSom,
    });
    await deleteDoc(colDoc);      //infine elimina la data scalDat
}
  //_________________________________________________________________________________________________________________

    const deleteCol = async (id) => { // va ad eliminare prima i dati di scaletta, e poi quelli di scalDat
        const colDoc = doc(db, "scalDat", id); 
         
      //elimina tutti i dati di scaletta della stessa data
        const q = query(collection(db, "Scaletta"), where("dataScal", "==", localStorage.getItem("dataEli")));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (hi) => {
      // doc.data() is never undefined for query doc snapshots
        console.log(hi.id, " => ", hi.data().nomeC, hi.data().dataScal);
        await deleteDoc(doc(db, "Scaletta", hi.id)); 
        });
        //infine elimina la data
        await deleteDoc(colDoc); 
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
    console.log({formattedDate})
    const q = query(collection(db, "scalDat"), where("data", "==", formattedDate));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data().data, formattedDate);
    if (doc.data().data == formattedDate) {
         notifyErrorDat()
         toast.clearWaitingQueue(); 
        bol=false
    }
    });
    if(bol == true) {
    await addDoc(colleCollectionRef, {
      data: formattedDate,
      nome,
      totalQuota: 0,
      TotalAsc: 0,
      dataMilli: nome.getTime(),
    });
    setClear();
    }
  };

//*************************************************************** */
//************************************************************** */
//          INTERFACCIA                                             /
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

    <motion.div
        initial= {{x: "-100vw"}}
        animate= {{x: 0}}
        transition={{ duration: 0.4 }}>

{!matches && 
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate(-1)}}>
      <ArrowBackIcon id="i" /></button> 
    }

{!matches ? <h1 className='title mt-3'> Scaletta</h1> : <div style={{marginBottom:"60px"}}></div>} 

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
      <Calendar onChange={setData} value={nome} />
      </div>
      <div className="btn_container">
      <Button type='submit' variant="outlined">Aggiungi la data</Button>
      </div>
    </form>
  </div> }
{!popupActive &&
  <div className="btn_container mt-5"> 
  <Button  onClick={() => { setPopupActive(true); }}  variant="outlined">Aggiungi una data</Button>
  </div>
  }
  </>
    )}

            <div className="container">
              <div className="row">
                <div className="col"> <h3></h3></div>

                <div className="col">

                </div>

                <div className="col mt-4">
          
                </div>
              </div>
{/***************************lista date******************************************* */}
<div className='todo_container' style={{width: "400px"}}>
<div className='row'>
  <div className='col colTextTitle'>
    Scaletta
  </div>
  <div className='col'>
  <FormControl >
        <InputLabel id="demo-simple-select-label"></InputLabel>
        <Select sx={{height:39, marginLeft:-1, width: 200}}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          defaultValue={8}
          onChange={handleChangeDataSelect}
        >
          <MenuItem value={8}>Ultimi 7 giorni</MenuItem>
          <MenuItem value={31}>Ultimi 30 giorni</MenuItem>
          <MenuItem value={91}>Ultimi 90 giorni</MenuItem>
          <MenuItem value={366}>Ultimi 365 giorni</MenuItem>
        </Select>
      </FormControl>
  </div>
</div>
        {Progress == false && 
  <div style={{marginTop: "14px"}}>
      <CircularProgress />
  </div>
      }
                {colle.map((col) => (
                  <div key={col.id}>
                  {col.dataMilli >= localStorage.getItem("bho2") && 
                    <>
                    <div className="diviCol1" > 
                      <div className="row">

                        <div className="col-9" onClick={() => {
                            getColId(col.id, col.nome, col.data)
                            setTimeout(function(){
                              navigate("/scaletta");
                            },10);
                            auto();
                            AutoComp.length = 0
                            }}>
                        <h3 className='inpTab'>{ moment(col.nome.toDate()).format("L") } &nbsp; { moment(col.nome.toDate()).format('dddd') }</h3>
                        </div>
                        <div className="col colIcon" style={{padding:"0px", marginTop:"8px"}}>  
                        <NavigateNextIcon/>          
                        </div>
                        { flagDelete &&
                        <div className='col' style={{padding:"0px", marginTop:"-8px"}}>
                         <button
                         className="button-delete"
                         onClick={() => {
                            localStorage.setItem("dataEli", col.data);
                            localStorage.setItem("scalId", col.id);
                            displayMsg();
                            toast.clearWaitingQueue(); 
                            }}>
                          <DeleteIcon id="i" />
                        </button>  
                        </div>}
                        { flagBlock &&
                        <div className="col" style={{padding:"0px", marginTop:"-8px"}}>    
                        <button
                         className="button-delete"
                         onClick={() => {
                            localStorage.setItem("dataEli", col.data);
                            localStorage.setItem("scalId", col.id);
                            localStorage.setItem("ScaltotalQuota", col.totalQuota);
                            localStorage.setItem("scalDataMilli", col.dataMilli);
                            localStorage.setItem("scalSommaTot", col.totalSommaTotale);
                            displayMsgBlock();
                            toast.clearWaitingQueue(); 
                            }}>
                          <LockIcon id="i" />
                        </button>            
                        </div>
                        }
                      </div>
                    </div>
                    <hr style={{margin: "0"}}/>
                  </>
                      }
                  </div>
                  ))}

            </div>
            </div>
    </motion.div>
           </>
      )
}
export default ScaletData;