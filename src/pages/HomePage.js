import React, { useEffect, useState, useRef } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, orderBy, serverTimestamp, getCountFromServer, limit, where, getDocs} from 'firebase/firestore';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import { auth, db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { notifyErrorCliEm, notifyUpdateCli, notifyErrorCliList } from '../components/Notify';
import CloseIcon from '@mui/icons-material/Close';
import TodoClient from '../components/TodoClient';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import moment from 'moment/moment';
import 'moment/locale/it'
import Menu from '@mui/material/Menu';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import { supa } from '../components/utenti';
import { guid } from '../components/utenti';
import { tutti } from '../components/utenti';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { optionsNumCart, optionsTotQuota, optionsVendite } from '../components/OptionsGrafici';
import Calendar from 'react-calendar';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

function HomePage(  ) {

  const [todosNumNote, setTodosNumNote] = React.useState([]);
  const [todosScaletta, setTodosScaletta] = React.useState([]);
  const [todosInOrdine, setTodosInOrdine] = React.useState([]);
  const [todosVendite, setTodosVendite] = React.useState([]);
  const [todosScalettaBlock, setTodosScalettaBlock] = React.useState([]);
  
  const [Progress, setProgress] = React.useState(false);
  const [Progress2, setProgress2] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorEl2, setAnchorEl2] = React.useState(null);
  const [anchorEl3, setAnchorEl3] = React.useState(null);

  const [alignment, setAlignment] = React.useState('');

  const [dataNumNot, setDataNumNot] = useState({
    labels: "",
    datasets: [{
      label: "Numero note",
      data: "",
    }]
  })

  const [dataTotQuota, setDataTotQuota] = useState({
    labels: "",
    datasets: [{
      label: "Numero note",
      data: "",
    }]
  })

  const [dataVendite, setDataVendite] = useState({
    labels: "",
    datasets: [{
      label: "Numero note",
      data: "",
    }]
  })

  const [flagDelete, setFlagDelete] = useState(false);  
  const timeElapsed = Date.now();  //prende la data attuale in millisecondi
  const today = new Date(timeElapsed);    //converte
  const [day, setday] = React.useState("");
  const [day1, setday1] = React.useState("");  //primo flitro dei giorni
  const [day3, setday3] = React.useState("");  //primo flitro dei giorni

  const [dataSc, setDataSc] = React.useState("");
  const [quotaTot, setQuotaTot] = React.useState(0);
  const [venditeTot, setVenditeTot] = React.useState(0);

  //variabili per gestire le date del grafico 1
  const [filtroData1, setFlitroData1] = useState(false);
  const [DataIni, setDataIni] = useState("");
  const [DataConvIni, setDataConvIni] = useState("");
  const [DataMilliIni, setDataMilliIni] = useState("");
  const [activeCalenderIni, setActiveCalenderIni] = useState(false)
  const [DataFine, setDataFine] = useState("");
  const [DataConvFine, setDataConvFine] = useState("");
  const [DataMilliFine, setDataMilliFine] = useState("");
  const [activeCalenderFine, setActiveCalenderFine] = useState(false)

    //variabili per gestire le date del grafico 2 Incasso
    const [filtroData2, setFlitroData2] = useState(false);
    const [DataIni2, setDataIni2] = useState("");
    const [DataConvIni2, setDataConvIni2] = useState("");
    const [DataMilliIni2, setDataMilliIni2] = useState("");
    const [activeCalenderIni2, setActiveCalenderIni2] = useState(false)
    const [DataFine2, setDataFine2] = useState("");
    const [DataConvFine2, setDataConvFine2] = useState("");
    const [DataMilliFine2, setDataMilliFine2] = useState("");
    const [activeCalenderFine2, setActiveCalenderFine2] = useState(false)

      //variabili per gestire le date del grafico 3 Vendite
      const [filtroData3, setFlitroData3] = useState(false);
      const [DataIni3, setDataIni3] = useState("");
      const [DataConvIni3, setDataConvIni3] = useState("");
      const [DataMilliIni3, setDataMilliIni3] = useState("");
      const [activeCalenderIni3, setActiveCalenderIni3] = useState(false)
      const [DataFine3, setDataFine3] = useState("");
      const [DataConvFine3, setDataConvFine3] = useState("");
      const [DataMilliFine3, setDataMilliFine3] = useState("");
      const [activeCalenderFine3, setActiveCalenderFine3] = useState(false)

  const [DataCal, setDataCal] = useState(new Date());
  const [activeCalender, setActiveCalender] = useState(false)

  const matches = useMediaQuery('(max-width:920px)');  //media query true se è un dispositivo più piccolo del value

  const [searchTerm, setSearchTerm] = useState("");  //search
  const inputRef= useRef();
  const [popupActive, setPopupActive] = useState(false);  
  const [popupActiveInOrdine, setPopupActiveInOrdine] = useState(false); 

  //permessi utente
  let sup= supa.includes(localStorage.getItem("uid"))
  let gui= guid.includes(localStorage.getItem("uid"))
  let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

  let navigate = useNavigate();

  const handleChangeTogg = (event) => {
    setAlignment(event.target.value);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenu2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleMenu3 = (event) => {
    setAnchorEl3(event.currentTarget);
  };
  const handleClosi = () => {  //chiude il menu
    setAnchorEl(null);
  };
  const handleClosi2 = () => {  //chiude il menu
    setAnchorEl2(null);
  };
  const handleClosi3 = () => {  //chiude il menu
    setAnchorEl3(null);
  };

function onChangeDataCal(value) {   //si attiva quando seleziono una data dal calendario
  var quTot;
  var venTot;
  setDataCal(value)  //serve per il calendario
  var formattedDate = moment(value).format('DD-MM-YYYY');  //conversione della data in stringa

  todosScaletta.map((nice) => {  //qui va a prendere la quota totale da parte dell'array scaldatBlock
    if (formattedDate == nice.data) {
      quTot= nice.totalQuota;
    }
})
todosVendite.map((nice) => {  //qui va a prendere la quota totale da parte dell'array scaldatBlock
  if (formattedDate == nice.data) {
    venTot= nice.totalSommaTotale;
  }
})
setQuotaTot(quTot);   //somma Totale della quota
setVenditeTot(venTot);  //TotSommaTotale
setDataSc(formattedDate)  //serve per cambiare la data come filtro
setActiveCalender(false)  //disattiva il calendario
}
//***************Date inizio e date fine*********************************************** */
function onChangeDataIni(value) {   //si attiva quando seleziono una data dal calendario
  var datMilli = value.getTime();
  if( datMilli<=DataMilliFine || !DataMilliFine) {   //controllo la data iniziale deve essere minore di quella finale
    setDataIni(value)  //serve per il calendario
    var formattedDate = moment(value).format('DD-MM-YYYY');  //conversione della data in stringa
    setDataConvIni(formattedDate)  //serve per cambiare la data come filtro
    setDataMilliIni(datMilli)
    setActiveCalenderIni(false)    //chiude il calendario
  }
}

function onChangeDataFine(value) {   //si attiva quando seleziono una data dal calendario
  var datMilli = value.getTime();
  if (datMilli >= DataMilliIni || !DataMilliIni) {
    setDataFine(value)  //serve per il calendario
    var formattedDate = moment(value).format('DD-MM-YYYY');  //conversione della data in stringa
    setDataConvFine(formattedDate)  //serve per cambiare la data come filtro
    setDataMilliFine(datMilli)
    setActiveCalenderFine(false) //chiude il calendario
  }
}

function onChangeDataIni2(value) {   //si attiva quando seleziono una data dal calendario
  var datMilli = value.getTime();
  if( datMilli<=DataMilliFine || !DataMilliFine) {   //controllo la data iniziale deve essere minore di quella finale
    setDataIni2(value)  //serve per il calendario
    var formattedDate = moment(value).format('DD-MM-YYYY');  //conversione della data in stringa
    setDataConvIni2(formattedDate)  //serve per cambiare la data come filtro
    setDataMilliIni2(datMilli)
    setActiveCalenderIni2(false)    //chiude il calendario
  }
}

function onChangeDataFine2(value) {   //si attiva quando seleziono una data dal calendario
  var datMilli = value.getTime();
  if (datMilli >= DataMilliIni || !DataMilliIni) {
    setDataFine2(value)  //serve per il calendario
    var formattedDate = moment(value).format('DD-MM-YYYY');  //conversione della data in stringa
    setDataConvFine2(formattedDate)  //serve per cambiare la data come filtro
    setDataMilliFine2(datMilli)
    setActiveCalenderFine2(false) //chiude il calendario
  }
}

function onChangeDataIni3(value) {   //si attiva quando seleziono una data dal calendario
  var datMilli = value.getTime();
  if( datMilli<=DataMilliFine3 || !DataMilliFine3) {   //controllo la data iniziale deve essere minore di quella finale
    setDataIni3(value)  //serve per il calendario
    var formattedDate = moment(value).format('DD-MM-YYYY');  //conversione della data in stringa
    setDataConvIni3(formattedDate)  //serve per cambiare la data come filtro
    setDataMilliIni3(datMilli)
    setActiveCalenderIni3(false)    //chiude il calendario
  }
}

const handleDeleteInOrdine = async (id) => {
  const colDoc = doc(db, "inOrdine", id); 
  await deleteDoc(colDoc); 
};

function onChangeDataFine3(value) {   //si attiva quando seleziono una data dal calendario
  var datMilli = value.getTime();
  if (datMilli >= DataMilliIni || !DataMilliIni) {
    setDataFine3(value)  //serve per il calendario
    var formattedDate = moment(value).format('DD-MM-YYYY');  //conversione della data in stringa
    setDataConvFine3(formattedDate)  //serve per cambiare la data come filtro
    setDataMilliFine3(datMilli)
    setActiveCalenderFine3(false) //chiude il calendario
  }
}

  const handleChangeDataSelect = (event) => {
    setday(event.target.value);      //prende il valore del select
    var ok= event.target.value
    today.setDate(today.getDate() - ok);   //fa la differenza rispetto al valore del select sottraendo, il risultato sarà in millisecondi
     localStorage.setItem("bho", today.getTime())
  };


  const handleChangeDataSelect1 = (event) => {
    setday1(event.target.value);      //prende il valore del select
    var ok= event.target.value
    today.setDate(today.getDate() - ok);   //fa la differenza rispetto al valore del select sottraendo, il risultato sarà in millisecondi
     localStorage.setItem("bho1", today.getTime())
  };

  const handleChangeDataSelect3 = (event) => {
    setday3(event.target.value);      //prende il valore del select
    var ok= event.target.value
    today.setDate(today.getDate() - ok);   //fa la differenza rispetto al valore del select sottraendo, il risultato sarà in millisecondi
     localStorage.setItem("bhii", today.getTime())
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
        if(localStorage.getItem("flagRemove") == 0 ) {
          handleDelete(localStorage.getItem("IDscal"), localStorage.getItem("NomeCliProd") );
        }
          else if(localStorage.getItem("flagRemove") == 1 ) {
          handleDeleteInOrdine(localStorage.getItem("IDNOTa"));
          }
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



//******************Per il grafico Ordini********************************************************************* */
  React.useEffect(() => {    //si va a prendere il numero di note nelle varie date solo le
    const collectionRef = collection(db, "ordDatBloccata");
    const q = query(collectionRef, orderBy("dataMilli"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        if(filtroData1 == false) {   // se è uguale al primo flitro ultimi giorni va ad eseguire questo if interno
          if(doc.data().dataMilli >= localStorage.getItem("bho")) {
            let car = { data: doc.data().data,  numeroNote: doc.data().numeroNote}
            todosArray.push(car);
          }
        }

        if(filtroData1 == true) {   // se è uguale al primo flitro dataIniziale e finale va ad eseguire questo if interno
          if(doc.data().dataMilli >= DataMilliIni && doc.data().dataMilli <= DataMilliFine) {
            let car = { data: doc.data().data,  numeroNote: doc.data().numeroNote}
            todosArray.push(car);
          }
        }
      });
      setTodosNumNote(todosArray);
    });
    return () => unsub();
  }, [day1, DataMilliIni, DataMilliFine, filtroData1]);

  React.useEffect(() => {    //se la variabile cambia allora viene eseguita questa funzione
    handleNumNot();
  }, [todosNumNote]);

//******************Per il grafico Incasso********************************************************************* */
  React.useEffect(() => {    //va a prendere la quota totale dalla scalettaDat quella bloccata
    const collectionRef = collection(db, "scalDatBloccata");
    const q = query(collectionRef, orderBy("dataMilli"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        if(filtroData2 == false) {
          if(doc.data().dataMilli >= localStorage.getItem("bho1")) {
            let car = { data: doc.data().data,  totalQuota: doc.data().totalQuota}
            todosArray.push(car);
          }
        }
        if(filtroData2 == true) {
          if(doc.data().dataMilli >= DataMilliIni2 && doc.data().dataMilli <= DataMilliFine2) {
              let car = { data: doc.data().data,  totalQuota: doc.data().totalQuota}
              todosArray.push(car);
          }
        }
      });
      setTodosScaletta(todosArray);
    });
    return () => unsub();
  }, [day, DataMilliFine2, DataMilliIni2, filtroData2]);

  React.useEffect(() => {    //se la variabile cambia allora viene eseguita questa funzione
    handleTotQuota();  //per il grafico vendite
  }, [todosScaletta]);

  //******************Per il grafico Vendite********************************************************************* */
  React.useEffect(() => {    //va a prendere la quota totale dalla scalettaDat quella bloccata
    const collectionRef = collection(db, "scalDatBloccata");
    const q = query(collectionRef, orderBy("dataMilli"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        if(filtroData3 == false) {
          if(doc.data().dataMilli >= localStorage.getItem("bhii")) {
            let car = { data: doc.data().data,  totalSommaTotale: doc.data().totalSommaTotale}
            todosArray.push(car);
          }
        }
        if(filtroData3 == true) {
          if(doc.data().dataMilli >= DataMilliIni3 && doc.data().dataMilli <= DataMilliFine3) {
              let car = { data: doc.data().data,  totalSommaTotale: doc.data().totalSommaTotale}
              todosArray.push(car);
          }
        }
      });
      setTodosVendite(todosArray);
    });
    return () => unsub();
  }, [day3, DataMilliFine3, DataMilliIni3, filtroData3]);

  React.useEffect(() => {    //se la variabile cambia allora viene eseguita questa funzione
    handleVendite();  //per il grafico vendite
  }, [todosVendite]);

  
//******************Per la tabella scaletta chiusa********************************************************************* */
React.useEffect(() => {
  const collectionRef = collection(db, "scalettaBloccata");
  const q = query(collectionRef, orderBy("nomeC"));

  const unsub = onSnapshot(q, (querySnapshot) => {
    let todosArray = [];
    querySnapshot.forEach((doc) => {
      todosArray.push({ ...doc.data(), id: doc.id });
    });
    setTodosScalettaBlock(todosArray);
    setProgress(true);
  });
  return () => unsub();
}, [popupActive == true]);

//per la tabella in ordine
React.useEffect(() => {
  const collectionRef = collection(db, "inOrdine");
  const q = query(collectionRef, orderBy("nomeC"));

  const unsub = onSnapshot(q, (querySnapshot) => {
    let todosArray = [];
    querySnapshot.forEach((doc) => {
      todosArray.push({ ...doc.data(), id: doc.id });
    });
    setTodosInOrdine(todosArray);
    setProgress2(true);
  });
  return () => unsub();
}, [popupActive == true]);


//**************Per il grafico ordini************************************************************** */
const handleNumNot = async () => {
    setDataNumNot({
      labels: todosNumNote.map((dati) => dati.data ),
      datasets: [{
        label: "Ordini",
        data: todosNumNote.map((dati) => dati.numeroNote ),
        backgroundColor: ["#CCB497"],
        borderColor: ["#CCB497"],
        tension: 0.4,
      }]
    })
};
//**************Per il grafico Incasso************************************************************** */
const handleTotQuota = async () => {
  setDataTotQuota({
    labels: todosScaletta.map((dati) => dati.data ),
    datasets: [{
      label: "Incasso",
      data: todosScaletta.map((dati) => dati.totalQuota ),
      backgroundColor: ["#CCB497"],
      borderColor: ["#CCB497"],
      tension: 0.4,
    }]
  })
};
//**************Per il grafico Vendite************************************************************** */
const handleVendite = async () => {
  setDataVendite({
    labels: todosVendite.map((dati) => dati.data ),
    datasets: [{
      label: "Incasso",
      data: todosVendite.map((dati) => dati.totalSommaTotale ),
      backgroundColor: ["#CCB497"],
      borderColor: ["#CCB497"],
      tension: 0.4,
    }]
  })
};


  const handleDelete = async (id, nomeCli) => {
    const colDoc = doc(db, "clin", id); 
    //infine elimina la data
    await deleteDoc(colDoc); 
  };

//**************************************************************************** */
//                              NICE
//********************************************************************************** */
    return ( 
    <>  
{/**************NAVBAR MOBILE*************************************** */}
    <div className='navMobile row'>
        <div className='col-2'> </div>
        <div className='col' style={{padding: 0}}>
          <p className='navText'> Liguori srl </p>
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
    {!matches ? <h1 className='title mt-3' style={{ textAlign: "left", marginLeft: "70px" }}>Dashboard</h1> : <div style={{marginBottom:"60px"}}></div>} 

      <ToggleButtonGroup
      color="primary"
      value={alignment}
      exclusive
      onChange={handleChangeTogg}
      aria-label="Platform"
    > {/********* 
      <ToggleButton  onClick={() => {setPopupActive(!popupActive); setActiveCalender(false); setPopupActiveInOrdine(false)}} size='small' color='secondary' value="scaletteChiu">Scalette Chiuse</ToggleButton>
      <ToggleButton onClick={() => {setPopupActive(false); setActiveCalender(false); setPopupActiveInOrdine(true)}} color='secondary' value="scortatinte">In Ordine</ToggleButton>
    */}
    </ToggleButtonGroup>

    <div>
      <img src="/dashLiguori.jpg" alt="Logo"  style={{width: "100%"}}/> {/* Utilizza il percorso relativo alla radice del tuo progetto */}
    </div>

<div className='containerGrafici'>
{/***************GRAFICO ORDINI********************************************* */}
{/*
    <div className='grafici' >
    <div>  <button type='button' className="ButtonFilterCale float-end" >
    <FilterListIcon id="i" onClick={handleMenu}/>
        <Menu  sx={
        { mt: "1px", "& .MuiMenu-paper": 
        { backgroundColor: "#333",
          color: "white" }, 
        }
        }
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClosi}
              >
                <MenuItem onClick={() => {setFlitroData1(false); handleClosi()}}>Ultimi ... giorni</MenuItem>
                <MenuItem onClick={() => {setFlitroData1(true); handleClosi()}}>Intervallo di Date</MenuItem>
              </Menu>
              </button>   
      </div>
    {filtroData1 == false && 
    <FormControl >
        <InputLabel id="demo-simple-select-label"></InputLabel>
        <Select sx={{height:39, marginLeft:-1, width: 200}}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          defaultValue={91}
          onChange={handleChangeDataSelect1}
        >
          <MenuItem value={91}>Ultimi 90 giorni</MenuItem>
          <MenuItem value={366}>Ultimi 365 giorni</MenuItem>
        </Select>
      </FormControl>
    }
 {filtroData1 == true &&
 <div className='row' style={{ marginTop: "5px"}}>
        <div className='col' style={{textAlign: "right"}}>
        <button className='buttonCalender' onClick={() => {setActiveCalenderIni(!activeCalenderIni)}}> <CalendarMonthIcon/></button>
        {DataConvIni}
        {activeCalenderIni== true && 
          <div style={{position: "absolute", width: "250px"}}>
          <Calendar onChange={onChangeDataIni} value={DataIni} />
          </div>
        }
        </div>
        <div className='col-1'>
        -
        </div>
        <div className='col' style={{ padding:"0px"}}>
        <p style={{textAlign: "left", margin:"0px"}}>
        {DataConvFine}
        <button className='buttonCalender' onClick={() => {setActiveCalenderFine(!activeCalenderFine)}}> <CalendarMonthIcon/></button>
        </p>
          {activeCalenderFine== true && 
          <div style={{position: "absolute", width: "250px"}}>
          <Calendar onChange={onChangeDataFine} value={DataFine} />
          </div>
        }
        </div>
      </div>
 }
      <Line data={dataNumNot} options={optionsNumCart}/>
    </div>
 */}
{/*************Grafico Incasso********************************************** */}
{/*}
    <div className='grafici' >
      <div>  <button type='button' className="ButtonFilterCale float-end mb-2" >
        <FilterListIcon id="i" onClick={handleMenu2}/>
        <Menu  sx={
        { mt: "1px", "& .MuiMenu-paper": 
        { backgroundColor: "#333",
          color: "white" }, 
        }
        }
                id="menu-appbar"
                anchorEl={anchorEl2}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl2)}
                onClose={handleClosi2}
              >
                <MenuItem onClick={() => {setFlitroData2(false); handleClosi()}}>Ultimi ... giorni</MenuItem>
                <MenuItem onClick={() => {setFlitroData2(true); handleClosi()}}>Intervallo di Date</MenuItem>
              </Menu>
              </button>   
        </div>
{filtroData2 == false && 
  <FormControl >
        <InputLabel id="demo-simple-select-label"></InputLabel>
        <Select sx={{height:39, marginLeft:-1, width: 200}}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          defaultValue={91}
          onChange={handleChangeDataSelect}
        >
          <MenuItem value={91}>Ultimi 90 giorni</MenuItem>
          <MenuItem value={366}>Ultimi 365 giorni</MenuItem>
        </Select>
  </FormControl>
}
{filtroData2 == true &&
 <div className='row' style={{ marginTop: "5px"}}>
        <div className='col' style={{textAlign: "right"}}>
        <button className='buttonCalender' onClick={() => {setActiveCalenderIni2(!activeCalenderIni2)}}> <CalendarMonthIcon/></button>
        {DataConvIni2}
        {activeCalenderIni2 == true && 
          <div style={{position: "absolute", width: "250px"}}>
          <Calendar onChange={onChangeDataIni2} value={DataIni2} />
          </div>
        }
        </div>
        <div className='col-1'>
        -
        </div>
        <div className='col' style={{ padding:"0px"}}>
        <p style={{textAlign: "left", margin:"0px"}}>
        {DataConvFine2}
        <button className='buttonCalender' onClick={() => {setActiveCalenderFine2(!activeCalenderFine2)}}> <CalendarMonthIcon/></button>
        </p>
          {activeCalenderFine2 == true && 
          <div style={{position: "absolute", width: "250px"}}>
          <Calendar onChange={onChangeDataFine2} value={DataFine2} />
          </div>
        }
        </div>
      </div>
 }
      <Line data={dataTotQuota} options={optionsTotQuota}/>
    </div>
  */}
{/***************GRAFICO VENDITE********************************************* */}
{/*
<div className='grafici' >
    <div>  <button type='button' className="ButtonFilterCale float-end" >
    <FilterListIcon id="i" onClick={handleMenu3}/>
        <Menu  sx={
        { mt: "1px", "& .MuiMenu-paper": 
        { backgroundColor: "#333",
          color: "white" }, 
        }
        }
                id="menu-appbar"
                anchorEl={anchorEl3}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl3)}
                onClose={handleClosi3}
              >
                <MenuItem onClick={() => {setFlitroData3(false); handleClosi()}}>Ultimi ... giorni</MenuItem>
                <MenuItem onClick={() => {setFlitroData3(true); handleClosi()}}>Intervallo di Date</MenuItem>
              </Menu>
              </button>   
      </div>
    {filtroData3 == false && 
    <FormControl >
        <InputLabel id="demo-simple-select-label"></InputLabel>
        <Select sx={{height:39, marginLeft:-1, width: 200}}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          defaultValue={91}
          onChange={handleChangeDataSelect3}
        >
          <MenuItem value={91}>Ultimi 90 giorni</MenuItem>
          <MenuItem value={366}>Ultimi 365 giorni</MenuItem>
        </Select>
      </FormControl>
    }
 {filtroData3 == true &&
 <div className='row' style={{ marginTop: "5px"}}>
        <div className='col' style={{textAlign: "right"}}>
        <button className='buttonCalender' onClick={() => {setActiveCalenderIni3(!activeCalenderIni3)}}> <CalendarMonthIcon/></button>
        {DataConvIni3}
        {activeCalenderIni3 == true && 
          <div style={{position: "absolute", width: "250px"}}>
          <Calendar onChange={onChangeDataIni3} value={DataIni3} />
          </div>
        }
        </div>
        <div className='col-1'>
        -
        </div>
        <div className='col' style={{ padding:"0px"}}>
        <p style={{textAlign: "left", margin:"0px"}}>
        {DataConvFine3}
        <button className='buttonCalender' onClick={() => {setActiveCalenderFine3(!activeCalenderFine3)}}> <CalendarMonthIcon/></button>
        </p>
          {activeCalenderFine3 == true && 
          <div style={{position: "absolute", width: "250px"}}>
          <Calendar onChange={onChangeDataFine3} value={DataFine3} />
          </div>
        }
        </div>
      </div>
 }
      <Line data={dataVendite} options={optionsVendite}/>
    </div>
  */}
</div>


{/**********tabella in ordine********************** */}
{popupActiveInOrdine == true && 
<div className='todo_containerInOrdine mt-5' style={{paddingTop: "0px"}}>
<div className='row' > 
<div className='col'>
<p className='colTextTitle'> In ordine </p>
</div>
<div className='col'></div>
<div className='col' style={{ paddingRight: "20px", paddingTop: "8px", paddingBottom: "6px"}}>
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
<div className='col-4' >
<p className='coltext' >Cliente</p>
</div>
<div className='col-1' style={{padding: "0px"}}>
<p className='coltext' >Qt</p>
</div>
<div className='col-4' style={{padding: "0px"}}>
<p className='coltext' >Prodotto</p>
</div>
<div className='col-2' style={{padding: "0px"}}>
<p className='coltext' >Data Inserimento</p>
</div>
    <hr style={{margin: "0"}}/>
</div>

<div className="scroll">
{Progress2 == false && 
  <div style={{marginTop: "14px"}}>
      <CircularProgress />
  </div>
}
{todosInOrdine.filter((val)=> {
        if(searchTerm === ""){
          return val
      } else if (val.nomeC.toLowerCase().includes(searchTerm.toLowerCase()) ) {
        return val
                }
            }).map((todo) => (
    <div key={todo.id}> 
    <div className='row' style={{padding: "0px", marginRight: "5px"}}>
      <div className='col-4 diviCol'><p className='inpTab'>{todo.nomeC} </p> </div>
      <div className='col-1 diviCol' style={{padding: "0px"}}><p className='inpTab'>{todo.qtProdotto}</p></div>
      <div className='col-4 diviCol' style={{padding: "0px"}}><p className='inpTab'>{todo.prodottoC}</p></div>
      <div className='col-2 diviCol' style={{padding: "0px"}}><p className='inpTab'>{todo.dataC}</p></div>
      {sup ===true && ( 
        <>
      <div className="col-1 diviCol" style={{padding:"0px", marginTop:"-8px"}}>
        <button className="button-delete" onClick={() =>{
          localStorage.setItem("flagRemove", 1);
           localStorage.setItem("IDNOTa", todo.id);
           displayMsg();
           toast.clearWaitingQueue(); }}>
          <DeleteIcon id="i" />
        </button>
    </div>  
        </>
        )}
      <hr style={{margin: "0"}}/>
    </div>
    </div>
  ))}
</div>
  </div>  
  }


{/***********Tabella scalette chiuse filtro tramite le date di scal Dat*************************** */}
{popupActive &&
  <>
  <motion.div
        initial= {{opacity: 0}}
        animate= {{opacity: 1}}
        transition={{ duration: "0.7" }}>
<div className='todo_containerScalet mt-5'>
  <div className='row'> 
  <div className='col'><p className='colTextTitle'> Scalette chiuse</p>
  <p style={{textAlign: "left", marginBottom: "0px"}}>Quota Totale: {quotaTot}€</p>
  <p style={{textAlign: "left"}}>Vendite Totali: {venditeTot}€</p>
  </div>
  <div className='col' style={{textAlign: "right"}}>
  <p style={{fontSize: "20px"}}>{dataSc} </p>
  </div>
  <div className='col-5' style={{textAlign: "right"}}>
    <button className='buttonCalender' onClick={() => {setActiveCalender(!activeCalender)}}> <CalendarMonthIcon/></button>

{activeCalender== true &&
  <>
  <div style={{width: "265px",position: "absolute", opacity:"100%"}}>
  <motion.div
        initial= {{x: 35}}
        animate= {{x: 0}}
        transition={{ type: "spring", mass: 0.5 }}>
      <Calendar onChange={onChangeDataCal} value={DataCal} 
        tileClassName={({ date, view }) => {
      if(todosScaletta.find(x=>x.data===moment(date).format("DD-MM-YYYY"))){
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

  <div className='row' style={{marginRight: "5px", borderBottom: "1px solid gray"}}>
      <div className='col-4' style={{marginRight: "3px"}}><p className='coltext' >Cliente </p> </div>
      <div className='col-1' style={{padding: "0px", width:"100px"}}><p className='coltext'>Debito</p></div>
      <div className='col-1' style={{padding: "0px", width:"100px"}}><p className='coltext'>Vendita</p></div>
      <div className='col-1' style={{padding: "0px", width:"100px"}}><p className='coltext'>Quota</p></div>
      <div className='col-3' style={{padding: "0px", width:"100px"}}><p className='coltext'>Note</p></div>
    </div>
    <div className="scroll">
    {Progress == false && 
  <div style={{marginTop: "14px"}}>
      <CircularProgress />
  </div>
      }
  {todosScalettaBlock.map((col) => (
    <div key={col.id}>
    { dataSc == col.dataScal &&
    <div className='row' style={{padding: "0px", borderBottom: "1px solid gray"}}>
      <div className='col-4 diviCol'><p className='inpTab'>{col.nomeC}</p> </div>
      <div className='col-1 diviCol' style={{padding: "0px", width:"100px"}}><p className='inpTab'>{col.debito}</p></div>
      <div className='col-1 diviCol' style={{padding: "0px", width:"100px"}}><p className='inpTab'>{col.sommaTotale}</p></div>
      <div className='col-1 diviCol' style={{padding: "0px", width:"100px"}}><p className='inpTab'>{col.quota}</p></div>
      <div className='col-3 diviCol' style={{padding: "0px", width:"100px"}}><textarea style={{textAlign: "left", width:"190px", margin: "0px"}} className='inpTab'>{col.note}</textarea></div>
    </div>
    }
    </div>
    ))}
  </div>
  </div>
  </motion.div>
  </>
 }

  </motion.div>
    </>
      )
}
export default HomePage;

//questo file sta combinato insieme a todoClient