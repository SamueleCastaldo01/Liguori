import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, where, getDocs, orderBy, serverTimestamp, limit} from 'firebase/firestore';
import useMediaQuery from '@mui/material/useMediaQuery';
import moment from 'moment';
import { getCountFromServer } from 'firebase/firestore';
import { TextField } from '@mui/material';
import { db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { notifyErrorCli, notifyUpdateCli, notifyErrorCliEm } from '../components/Notify';
import Autocomplete from '@mui/material/Autocomplete';
import { AutoDataScal } from './AddNota';
import { supa, guid, tutti } from '../components/utenti';
import PrintIcon from '@mui/icons-material/Print';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Switch from '@mui/material/Switch';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Calendar from 'react-calendar';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';

export const AutoProdCli = [];

function NotaDipData({notaDat, getNotaDip }) {
 
    const [todos, setTodos] = React.useState([]);
    const [todosDataAuto, setTodosDataAuto] = React.useState([]);

    const [nomeC, setNomeC] = React.useState("");
    const [cont, setCont] = React.useState(1);
    const [flagDelete, setFlagDelete] = useState(false); 
    const [switChchecked, setSwitchChecked] = React.useState(false);
    const [switInt, setswitInt] = React.useState("0");

    const [dataSc, setDataSc] = React.useState(notaDat);
    const [DataCal, setDataCal] = useState(new Date());

    const [popupActive, setPopupActive] = useState(true);  
    const [activeCalender, setActiveCalender] = useState(false)
    const [Progress, setProgress] = React.useState(false);
  
    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))   //confronto con uid corrente
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
  
    const scalCollectionRef = collection(db, "addNota"); 
    const matches = useMediaQuery('(max-width:600px)');  //media query true se è uno smartphone
  
    let navigate = useNavigate();
  
    const handleChangeSwitch = (event) => {
      setSwitchChecked(event.target.checked);
    };

    function onChangeDataCal(value) {   //si attiva quando seleziono una data dal calendario
      setDataCal(value)  //serve per il calendario
      var formattedDate = moment(value).format('DD-MM-YYYY');  //conversione della data in stringa
    setDataSc(formattedDate)  //serve per cambiare la data come filtro
    setActiveCalender(false)  //disattiva il calendario
    }
//_________________________________________________________________________________________________________________
const contEffect = async () => {  //fa il conteggio
    const coll = collection(db, "addNota");
    const q = query(coll, where("data", "==", notaDat));
    const snapshot = await getCountFromServer(q);
    console.log('count: ', snapshot.data().count);
    setCont(snapshot.data().count+1)
  }
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
            handleDelete(localStorage.getItem("scalId"));
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


    React.useEffect(() => {  //va a prendere tutte le date degli ordini creati, mi serve come autocomplete
      const collectionRef = collection(db, "ordDat");
      const q = query(collectionRef, orderBy("dataMilli", "desc"), limit(100));
  
      const unsub = onSnapshot(q, (querySnapshot) => {
        let todosArray = [];
        querySnapshot.forEach((doc) => {
          todosArray.push({ ...doc.data(), id: doc.id });
        });
        setTodosDataAuto(todosArray);
      });
      return () => unsub();
    }, []);
    //_____________________________________________________________________________________
    const handleDelete = async (id) => {
      const colDoc = doc(db, "Scaletta", id); 
      //infine elimina la data di AddNota
      await deleteDoc(colDoc); 
    };
    //**************************************************************************** */
    const actions = [
      { icon: <PrintIcon />, name: 'Stampa'},
    ];
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
      <p className='navText'> Ordini Da Evadere </p>
      </div>
      </div>


      <motion.div>
      <div className='container' style={{padding: "20px"}}>
  {/**************tabelle********************************************************************************************************/}
      <div className='row' style={{marginTop: "40px"}}>
        <div className='col' style={{padding: "0px"}}>
    {/***********tabella note********************************************************************************** */}
        <div  className='todo_containerOrdCli'>
        <div className='row'> 
        <div className='col' style={{paddingRight: "0px"}} >
        <p className='colTextTitle'> Ordine Clienti</p>
        { !switChchecked ? <p className='textOrdRed'> Ordini da evadere</p> : <p className='textOrd'> Ordini evasi</p> }
        
        <div style={{height: "25px"}}>
         <Switch sx={{ position: "relative", right: "58px", bottom: "15px" }}
          checked={switChchecked}
          onChange={handleChangeSwitch}
          inputProps={{ 'aria-label': 'controlled' }}/>
      </div>
        </div>
        <div className='col' style={{paddingLeft: "0px", textAlign: "right"}}>
        {dataSc}
      <button className='buttonCalender' onClick={() => {setActiveCalender(!activeCalender)}}> <CalendarMonthIcon/></button>
      {activeCalender== true &&
  <>
  <div style={{width: "265px",position: "absolute", opacity:"100%"}}>
  <motion.div
        initial= {{x: -70}}
        animate= {{x: -93}}
        transition={{ type: "spring", mass: 0.5 }}>
      <Calendar onChange={onChangeDataCal} value={DataCal} 
        tileClassName={({ date, view }) => {
      if(todosDataAuto.find(x=>x.data===moment(date).format("DD-MM-YYYY"))){
       return  'highlight'
      }
    }}
      />
        </motion.div>
      </div>
</>
} 
        </div>
        </div>
        <div className='row' style={{borderBottom: "1px solid gray"}}>
        <div className='col-1' >
        <p className='coltext'>N</p>
        </div>
        <div className='col-8' >
        <p className='coltext'>Cliente</p>
        </div>
        
      </div>
      <div className="scrollOrdCli">
      {Progress == false && 
        <div style={{marginTop: "14px"}}>
          <CircularProgress />
        </div>
      }
       {todos.map((todo) => (
          <div key={todo.id}>
          {todo.data  === dataSc &&(!switChchecked ? todo.completa == "0" : todo.completa == "1") &&  (
      <>
    <div className='row diviCol1' style={{borderBottom: "1px solid gray"}} onClick={() => {
            getNotaDip(todo.id, todo.cont, todo.nomeC, dataSc, todo.NumCartoni)
            setTimeout(function(){
              navigate("/notadip");
                            },10);
                         }}>
        <div className='col-1'>
            <p className="inpTab" style={{textAlign: "left"}}>{todo.cont}</p>
        </div>
         <div className='col-8'>
             <p className="inpTab"  style={{textAlign: "left"}}>{todo.nomeC}</p>
        </div>
        <div className="col colIcon" style={{padding:"0px", marginTop:"8px"}}>  
                        <NavigateNextIcon/>          
        </div>
    </div>
             </>
                  )}
          </div>
        ))}  
        </div>
        </div>
        </div>
      </div>

      </div>
      </motion.div>
      </>
        )
  }
export default NotaDipData;