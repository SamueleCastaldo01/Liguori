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
import moment from 'moment/moment';
import 'moment/locale/it'
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import { supa } from '../components/utenti';
import { guid } from '../components/utenti';
import { tutti } from '../components/utenti';
import ScaletteChiuseTable from '../components/ScaletteChiuseTable';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
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
import InOrdineTable from '../components/inOrdineTable';

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
  const [activeTable, setActiveTable] = React.useState('scalette');

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
  const cacheNumNoteRef = React.useRef({});
  const cacheQuotaRef = React.useRef({});
  const cacheVenditeRef = React.useRef({});
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
//vado a prendere il numero delle note per ogni giorno
React.useEffect(() => {
  const fetchNumNoteData = async () => {
    const cacheKey = `${filtroData1}-${DataMilliIni}-${DataMilliFine}-${localStorage.getItem("bho")}`;
    
    // Verifica se i dati sono già in cache
    const cachedData = cacheNumNoteRef.current[cacheKey];
    if (cachedData) {
      setTodosNumNote(cachedData);
      return;
    }

    // Se non ci sono dati in cache, esegui la query
    const collectionRef = collection(db, "addNota");
    let q = filtroData1
      ? query(
          collectionRef,
          where("dataMilli", ">=", DataMilliIni),
          where("dataMilli", "<=", DataMilliFine),
          orderBy("dataMilli"),
          limit(500)
        )
      : query(
          collectionRef,
          where("dataMilli", ">=", Number(localStorage.getItem("bho"))),
          orderBy("dataMilli"),
          limit(500)
        );

    const querySnapshot = await getDocs(q);
    const groupedNotes = querySnapshot.docs.reduce((acc, doc) => {
      const date = doc.data().data;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const result = Object.entries(groupedNotes)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([data, numeroNote]) => ({ data, numeroNote }));

    // Salva i dati in cache e in memoria
    cacheNumNoteRef.current[cacheKey] = result;
    setTodosNumNote(result);
  };

  fetchNumNoteData();
}, [day1, DataMilliIni, DataMilliFine, filtroData1]);

// Funzione per caricare la cache dei dati delle note da localStorage
const loadNumNoteCacheFromLocalStorage = () => {
  const cache = localStorage.getItem("cacheNumNote");
  if (cache) {
    cacheNumNoteRef.current = JSON.parse(cache);
  }
};

// Funzione per salvare la cache dei dati delle note in localStorage
const saveNumNoteCacheToLocalStorage = () => {
  if (Object.keys(cacheNumNoteRef.current).length > 0) {
    localStorage.setItem("cacheNumNote", JSON.stringify(cacheNumNoteRef.current));
  }
};

// Carica la cache dei dati delle note una sola volta quando il componente viene montato
React.useEffect(() => {
  loadNumNoteCacheFromLocalStorage();
}, []);

// Ogni volta che cambia `todosNumNote`, salva i dati in localStorage
React.useEffect(() => {
  if (todosNumNote.length > 0) {
    saveNumNoteCacheToLocalStorage();
  }
}, [todosNumNote]);

// Funzione per gestire il grafico delle note
const handleNumNot = React.useCallback(() => {
  setDataNumNot({
    labels: todosNumNote.map(({ data }) => data),
    datasets: [{
      label: "Numero di Note",
      data: todosNumNote.map(({ numeroNote }) => numeroNote),
      backgroundColor: ["#CCB497"],
      borderColor: ["#CCB497"],
      tension: 0.4,
    }]
  });
}, [todosNumNote]);

// Esegui il rendering del grafico ogni volta che todosNumNote cambia
React.useEffect(() => { handleNumNot(); }, [todosNumNote]);


//******************Per il grafico Incasso********************************************************************* */
//vado a prendere la quota dalle scalette
React.useEffect(() => {
  const fetchScalettaData = async () => {
    const cacheKey = `${filtroData2}-${DataMilliIni2}-${DataMilliFine2}-${localStorage.getItem("bho1")}`;

    // Verifica se la cache è disponibile
    const cachedData = cacheQuotaRef.current[cacheKey];
    if (cachedData) {
      setTodosScaletta(cachedData);
      return;
    }

    // Query Firestore
    const collectionRef = collection(db, "addNota");
    let q = filtroData2
      ? query(
          collectionRef,
          where("scaletta", "==", true),
          where("scalettaDataMilli", ">=", DataMilliIni2),
          where("scalettaDataMilli", "<=", DataMilliFine2),
          orderBy("scalettaDataMilli"),
          limit(500)
        )
      : query(
          collectionRef,
          where("scaletta", "==", true),
          where("scalettaDataMilli", ">=", Number(localStorage.getItem("bho1"))),
          orderBy("scalettaDataMilli"),
          limit(500)
        );

    const querySnapshot = await getDocs(q);
    const groupedQuota = querySnapshot.docs.reduce((acc, doc) => {
      const date = doc.data().scalettaData;
      const quota = Number(doc.data().quota) || 0;
      acc[date] = (acc[date] || 0) + quota;
      return acc;
    }, {});

    const result = Object.entries(groupedQuota)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([data, totalQuota]) => ({ data, totalQuota }));

    // Salva i dati in cache e in memoria
    cacheQuotaRef.current[cacheKey] = result;
    setTodosScaletta(result);
  };

  fetchScalettaData();
}, [day, DataMilliFine2, DataMilliIni2, filtroData2]);

const handleTotQuota = React.useCallback(() => {
  setDataTotQuota({
    labels: todosScaletta.map(({ data }) => data),
    datasets: [{
      label: "Incasso",
      data: todosScaletta.map(({ totalQuota }) => totalQuota),
      backgroundColor: ["#CCB497"],
      borderColor: ["#CCB497"],
      tension: 0.4,
    }]
  });
}, [todosScaletta]);

React.useEffect(() => { handleTotQuota(); }, [todosScaletta]);

const loadCacheFromLocalStorage = () => {
  const cache = localStorage.getItem("cacheQuota");
  if (cache) {
    cacheQuotaRef.current = JSON.parse(cache);
  }
};

const saveCacheToLocalStorage = () => {
  if (Object.keys(cacheQuotaRef.current).length > 0) {
    localStorage.setItem("cacheQuota", JSON.stringify(cacheQuotaRef.current));
  }
};

React.useEffect(() => {
  loadCacheFromLocalStorage();
}, []);


React.useEffect(() => {
  if (todosScaletta.length > 0) {
    saveCacheToLocalStorage();
  }
}, [todosScaletta]);

//******************Per il grafico Vendite********************************************************************* */
  //va a prendere la sommaTotale dalla scalettaDat quella bloccata
  React.useEffect(() => {
    const fetchVenditeData = async () => {
      const cacheKey = `${filtroData2}-${DataMilliIni2}-${DataMilliFine2}-${localStorage.getItem("bhii")}`;
      
      // Verifica se i dati sono già in cache
      const cachedData = cacheVenditeRef.current[cacheKey];
      if (cachedData) {
        setTodosVendite(cachedData);
        return;
      }
  
      // Se non ci sono dati in cache, esegui la query
      const collectionRef = collection(db, "addNota");
      let q = filtroData2
        ? query(
            collectionRef,
            where("scaletta", "==", true),
            where("scalettaDataMilli", ">=", DataMilliIni2),
            where("scalettaDataMilli", "<=", DataMilliFine2),
            orderBy("scalettaDataMilli"),
            limit(500)
          )
        : query(
            collectionRef,
            where("scaletta", "==", true),
            where("scalettaDataMilli", ">=", Number(localStorage.getItem("bhii"))),
            orderBy("scalettaDataMilli"),
            limit(500)
          );
  
      const querySnapshot = await getDocs(q);
      const groupedSomma = querySnapshot.docs.reduce((acc, doc) => {
        const date = doc.data().scalettaData; // Prendi la data come stringa
        const sommaTotale = Number(doc.data().sommaTotale) || 0; // Assicurati che sia un numero
        acc[date] = (acc[date] || 0) + sommaTotale;
        return acc;
      }, {});
  
      const result = Object.entries(groupedSomma)
        .sort(([a], [b]) => new Date(a) - new Date(b)) // Ordina per data
        .map(([data, totalSomma]) => ({ data, totalSomma }));
  
      // Salva i dati in cache e in memoria
      cacheVenditeRef.current[cacheKey] = result;
      setTodosVendite(result);
    };
  
    fetchVenditeData();
  }, [day, DataMilliFine2, DataMilliIni2, filtroData2]);
  
  // Funzione per gestire il salvataggio in localStorage
  const loadVenditeCacheFromLocalStorage = () => {
    const cache = localStorage.getItem("cacheVendite");
    if (cache) {
      cacheVenditeRef.current = JSON.parse(cache);
    }
  };
  
  const saveVenditeCacheToLocalStorage = () => {
    if (Object.keys(cacheVenditeRef.current).length > 0) {
      localStorage.setItem("cacheVendite", JSON.stringify(cacheVenditeRef.current));
    }
  };
  
  React.useEffect(() => {
    loadVenditeCacheFromLocalStorage();
  }, []);
  
  React.useEffect(() => {
    if (todosVendite.length > 0) {
      saveVenditeCacheToLocalStorage();
    }
  }, [todosVendite]);
  
  // Funzione per gestire il grafico delle vendite
  const handleVenditeChart = React.useCallback(() => {
    setDataVendite({
      labels: todosVendite.map(({ data }) => data), // Etichette delle date
      datasets: [{
        label: "Vendite",
        data: todosVendite.map(({ totalSomma }) => totalSomma), // Somma totale delle vendite
        backgroundColor: ["#CCB497"],
        borderColor: ["#CCB497"],
        tension: 0.4,
      }]
    });
  }, [todosVendite]);
  
  React.useEffect(() => { handleVenditeChart(); }, [todosVendite]);

  
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
  if (popupActive === true) {
    const collectionRef = collection(db, "inOrdine");
    const q = query(collectionRef);

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });

      console.log("Array inOrdine ricevuto da Firestore:", todosArray); // 👈 LOG AGGIUNTO

      setTodosInOrdine(todosArray);
      setProgress2(true);
    });

    return () => unsub();
  }
}, [popupActive]);




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
    {!matches ? <h1 className='title mt-3' style={{ textAlign: "left", marginLeft: "70px" }}>Seller Central</h1> : <div style={{marginBottom:"60px"}}></div>} 

      <ToggleButtonGroup
        color="primary"
        value={activeTable}
        exclusive
        onChange={(_, val) => { if (val) setActiveTable(val); }}
      >
        <ToggleButton
          value="inordine"
          sx={{
            textTransform: 'none',
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
            },
            '&.Mui-selected:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          In Ordine
        </ToggleButton>

        <ToggleButton
          value="scalette"
          sx={{
            textTransform: 'none',
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
            },
            '&.Mui-selected:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          Scalette chiuse
        </ToggleButton>
      </ToggleButtonGroup>

<div className='containerGrafici'>
{/***************GRAFICO ORDINI********************************************* */}

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
          defaultValue={31}
          onChange={handleChangeDataSelect1}
        >
          <MenuItem value={31}>Ultimi 30 giorni</MenuItem>
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

{/*************Grafico Incasso********************************************** */}
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
          defaultValue={31}
          onChange={handleChangeDataSelect}
        >
          <MenuItem value={31}>Ultimi 30 giorni</MenuItem>
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

{/***************GRAFICO VENDITE********************************************* */}

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
          defaultValue={31}
          onChange={handleChangeDataSelect3}
        >
          <MenuItem value={31}>Ultimi 30 giorni</MenuItem>
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

</div>


{/**********tabella in ordine********************** */}
{activeTable === 'inordine' && <InOrdineTable />}

{activeTable === 'scalette' && <ScaletteChiuseTable defaultDays={7} />}

<div style={{marginBottom:"200px"}}></div>

  </motion.div>
    </>
      )
}
export default HomePage;

//questo file sta combinato insieme a todoClient