import React, { useEffect, useState } from 'react'
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, orderBy, where, serverTimestamp, limit, getDocs, getCountFromServer} from 'firebase/firestore';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import moment from 'moment';
import { auth, db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { notifyErrorProd, notifyUpdateProd, notifyErrorNumNegativo, notifyErrorProdList, notifyErrorPrezzoProd } from '../components/Notify';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import TodoScorta from '../components/TodoScorta';
import Button from '@mui/material/Button';
import { supa, guid, tutti, dipen, primary } from '../components/utenti';
import InputAdornment from '@mui/material/InputAdornment';
import RestoreIcon from '@mui/icons-material/Restore';
import PrintIcon from '@mui/icons-material/Print';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import { Modal } from 'react-bootstrap';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { color, motion } from 'framer-motion';
import { Textarea } from '@mui/joy';


function Scorta() {

  const [todos, setTodos] = React.useState([]);
  const [crono, setCrono] = React.useState([]);
  const [cronoPa, setCronoPa] = React.useState([]);

  const [Progress, setProgress] = React.useState(false);
  const [Progress1, setProgress1] = React.useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const [idProdotto, setIdProdtto] = React.useState("");
  const [idDocumentoEdit, setIdDocumentoEdit] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [descrizione, setDescrizione] = React.useState("");
  const [nomeP, setNomeP] = React.useState("");
  const [nomePModRep, setNomePModRep] = React.useState("");
  const [descrizioneMod, setDescrizioneMod] = React.useState("");
  const [idModRep, setIdModRep] = React.useState("");
  const [quantita, setQuantita] = React.useState("");
  const [image, setImage] = React.useState("");
  const [prezzoIndi, setPrezzoIndi] = React.useState("");
  const [reparto, setReparto] = React.useState(1);
  const [sottoScorta, setSottoScorta] = React.useState("");
  const [quantitaOrdinabile, setquantitaOrdinabile] = React.useState("");
  const [nota, setNota] = React.useState("");

  const [flagFiltroDisp, setFlagFiltroDisp] = React.useState(false);
  const [flagFiltroCres, setFlagFiltroCres] = React.useState(false);
  const [flagFiltroDesc, setFlagFiltroDesc] = React.useState(false);

  const [imageSer, setImageSer] = React.useState(localStorage.getItem("imageProd"));
  const [notaSer, setNotaSer] = React.useState(localStorage.getItem("NotaProd"));

  const [alignment, setAlignment] = React.useState('scorta');

  const componentRef = useRef();  //serve per la stampa
  const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone

  const [popupActiveCrono, setPopupActiveCrono] = useState(false);  
  const [popupActiveCronoPa, setPopupActiveCronoPa] = useState(false); 
  const [FlagFilter, setFlagFilter] = useState("0");
  const [PrdDisp, setPrdDisp] = useState(-1);
  const [FlagEdit, setFlagEdit] = useState("0");
  const [FlagRep, setFlagRep] = useState("0");   //incominciamo con tutti i prodotti come filtro

  const [open, setOpen] = React.useState(false); //serve per lo speedDial
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [FlagStampa, setFlagStampa] = useState(false);
  const [flagDelete, setFlagDelete] = useState(false); 

  const [popupActiveSearch, setPopupActiveSearch] = useState(false);  

  const [notiPaId, setNotiPaId] = React.useState("7k5cx6hwSnQTCvWGVJ2z");

  const [popupActive, setPopupActive] = useState(false);  
  const [popupActiveScorta, setPopupActiveScorta] = useState(true);  
  const [popupActiveScortaEdit, setPopupActiveScortaEdit] = useState(false); 
  const [searchTerm, setSearchTerm] = useState("");  //search
  const [searchTermCrono, setSearchTermCrono] = useState("");  //search
  const [searchTermCronoPa, setSearchTermCronoPa] = useState("");  //search
  const inputRef= useRef();

  //permessi utente
  let sup= supa.includes(localStorage.getItem("uid"))
  let dip= dipen.includes(localStorage.getItem("uid"))
  let gui= guid.includes(localStorage.getItem("uid"))
  let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

  let navigate = useNavigate();

  const handleCloseMod = () =>{ setPopupActive(false); setPopupActiveScortaEdit(false)};
  const handleShowMod = () => setPopupActive(true);
   //_________________________________________________________________________________________________________________
     //messaggio di conferma per cancellare la trupla
     const Msg = () => (
      <div style={{fontSize: "16px"}}>
        <p style={{marginBottom: "0px"}}>Sicuro di voler eliminare</p>
        <p style={{marginBottom: "0px"}}>(perderai tutti i dati)</p>
        <button className='buttonApply ms-4 mt-2 me-1 rounded-4' onClick={Remove}>Si</button>
        <button className='buttonClose mt-2 rounded-4'>No</button>
      </div>
    )

      const Remove = () => {
          handleDelete(localStorage.getItem("IdProd"),  localStorage.getItem("NomeProd"), localStorage.getItem("IdProdP"));
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
React.useEffect(() => {
    const collectionRef = collection(db, "prodotto");
    const q = query(collectionRef);  //questa se flagFilter è diverso da 1 e 2
    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      if(FlagFilter != "1"  && FlagFilter != 2) { //crescente
        todosArray.sort((a, b) => a.nomeP.localeCompare(b.nomeP));
      }
  
      if(FlagFilter == "1") { //crescente
        todosArray.sort((a, b) => a.quantita - b.quantita);
      }
      
      if(FlagFilter == "2") { //decrescente
        todosArray.sort((a, b) => b.quantita - a.quantita);
      }
      setTodos(todosArray);
      setProgress(true);
      console.log("entrato")
    });
    return () => unsub();

  }, [FlagFilter,FlagEdit]);



  const AggDatabaseProdotto = useReactToPrint({

  })

//cronologia debito
  React.useEffect(() => {
    const collectionRef = collection(db, "cronologia");
    const q = query(collectionRef, orderBy("createdAt", "desc"), limit(50));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setCrono(todosArray);
      setProgress1(true)
    });
    return () => unsub();

  }, [popupActiveCrono == true]);


  //cronologia Pa
  React.useEffect(() => {
    const collectionRef = collection(db, "cronologiaPa");
    const q = query(collectionRef, orderBy("createdAt", "desc"), limit(50));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setCronoPa(todosArray);
      setProgress1(true)
    });
    return () => unsub();

  }, [popupActiveCrono == true]);

 //******************************************************************************* */
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
 //******************************************************************************* */
  //speed
  function handleSpeedCronologia() {
    setPopupActiveCrono(true)
    setPopupActiveCronoPa(false)
    setPopupActiveScorta(false)
    setOpen(false)
  } 

  function handleSpeedCronologiaPa() {
    setPopupActiveCrono(false)
    setPopupActiveCronoPa(true)
    setPopupActiveScorta(false)
    setOpen(false)
  } 

  function handleSpeedScorta() {
    setPopupActiveScorta(true)
    setPopupActiveCronoPa(false)
    setPopupActiveCrono(false)
    setOpen(false)
    console.log(localStorage.getItem("profilePic"))
  }

  function handleSpeedAddProd() {
    setPopupActive(true)
    setOpen(false)
  }
 //******************************************************************************* */
 const handleChangeTogg = (event) => {
  setAlignment(event.target.value);
};

 function handleInputChangeBrand(event, value) {
  setBrand(value)
}

const handleChangeDataSelect = (event) => {
  setReparto(event.target.value);      //prende il valore del select
};

const handleMenu = (event) => {
  setAnchorEl(event.currentTarget);
};

const handleClosi = () => {  //chiude il menu
  setAnchorEl(null);
};

const handleQuant = () => {  //ordinamento decrescente
  setFlagFilter("2");
  setFlagFiltroCres(false)
  setFlagFiltroDesc(true)
  handleClosi();
};

const handleQuantCre = () => {  //va a fare l'ordinamento della qt in modo crescente
  setFlagFilter("1");
  setFlagFiltroCres(true)
  setFlagFiltroDesc(false)
  handleClosi();
};

const handleCloseFilter = () => {  //va a fare l'ordinamento della qt in modo crescente
  setFlagRep(0);
  setFlagFilter("0");
  setFlagFiltroCres(false)
  setFlagFiltroDesc(false)
  setFlagFiltroDisp(false)
  setPrdDisp(-1);
  handleClosi();
};

const handleProdDisp = () => {  //va a prendere i prodotti disponibili
setPrdDisp(0);
setFlagFiltroDisp(true)
  handleClosi();
};

const handleRepTutti= () => {  //va a fare l'ordinamento della qt in modo crescente
  setFlagRep(0);
  handleClosi();
};

const handleRepFemm = () => {  //va a fare l'ordinamento della qt in modo crescente
  setFlagRep(1);
  handleClosi();
};

const handleRepMasch = () => {  //va a fare l'ordinamento della qt in modo crescente
  setFlagRep(2);
  handleClosi();
};

const handleRepAtt = () => {  //va a fare l'ordinamento della qt in modo crescente
  setFlagRep(3);
  handleClosi();
};

function handlePopUp(todo) {
  setNomePModRep(todo.nomeP)
  setDescrizioneMod(todo.descrizione)
  setIdModRep(todo.id)
  setPopupActiveSearch(true);
}
 //******************************************************************************* */
 const handleProdClien = async ( idProdotto) => {    //funzione che si attiva quando si aggiunge un prodotto a scorta
  const q = query(collection(db, "clin"));  //prendo tutti i clienti, va ad aggiungere i prodotti personalizzati, quando si aggiuge un nuovo prodotto
  const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await addDoc(collection(db, "prodottoClin"), {
        author: { name: doc.data().nomeC, idCliente: doc.data().idCliente},
        idProdotto,
        nomeP: nomeP,
        prezzoUnitario: prezzoIndi
      })
      });
 } 
  {/************** */}
 const handleSubmit = async (e) => {   //creazione prodotto
  e.preventDefault();
    var bol= true
    var idProdotto="1";

    if(!nomeP) {            //controllo che il nom sia inserito
      notifyErrorProd();
      toast.clearWaitingQueue(); 
      return
    }
    if (!prezzoIndi) { // Controllo che il prezzo sia inserito
      notifyErrorPrezzoProd();
      return;
    }
    
    if (prezzoIndi.includes(',')) {
      notifyErrorPrezzoProd();
      return;
    }

    // verifica che il prodotto sia univoco
    const q = query(collection(db, "prodotto"), where("nomeP", "==", nomeP));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
    if (doc.data().nomeP == nomeP) {
        notifyErrorProdList()
         toast.clearWaitingQueue(); 
        bol=false
    }
    });

     //vado a prendere l'id dell'ultimo ordine, in modo tale da aggiungere il nuovo id al nuovo ordine
     const d = query(collection(db, "prodotto"), orderBy("createdAt", "desc"), limit(1));  
     const querySnapshotd = await getDocs(d);
     // Controlla se ci sono risultati nella query
     if (!querySnapshotd.empty) {
       // Se la query ha trovato almeno un ordine, ottieni l'ID dell'ultimo ordine e incrementalo per il nuovo ID
       querySnapshotd.forEach((doc) => {
         idProdotto = doc.data().idProdotto.substring(1);  //va a prendere la stringa e allo stesso tempo gli toglie la prima lettera
         let idRpdodInt = parseInt(idProdotto) + 1 //fa la converisione in intero. e fa la somma
         idProdotto = idRpdodInt.toString()  // lo riconverte in stringa
       });
     }   

     idProdotto= "P" + idProdotto

    if(bol == true) {
      await addDoc(collection(db, "prodotto"), {
        createdAt: serverTimestamp(),
        idProdotto,
        nomeP,
        quantita: 0,
        brand,
        pa: 0,
        nota,
        sottoScorta,
        prezzoIndi,
        image,
        reparto,      //se è 0 è femminile, se è 1 è maschile
        quantitaOrdinabile,
      });
      handleProdClien(idProdotto);
      }
      handleClearSet()
      setPopupActive(false);
      setFlagEdit(+FlagEdit+1);
  };

  const handleClearSet =  () => {   //aggiunta della trupla cronologia quantità
    setNomeP("");
    setReparto(0)
    setBrand("");
    setQuantita("");
    setImage("");
    setPrezzoIndi("");
    setNota("");
    setSottoScorta("");
    setquantitaOrdinabile("");
  };

 //******************************************************************************************************** */
  const handleCronologia = async (todo, ag, somma, flag) => {   //aggiunta della trupla cronologia quantità
    let dataOd= serverTimestamp();
    let dataFormattata = moment(dataOd).format('DD-MM-YYYY');

    if (flag === "true") { var quant= "+"+ag }
    else { var quant= "-"+ag }
      await addDoc(collection(db, "cronologia"), {
        autore: auth.currentUser.displayName,
        data: dataFormattata,
        createdAt: serverTimestamp(),
        idProdotto: todo.idProdotto,
        nomeP: todo.nomeP,
        quantIni: todo.quantita,
        quantAgg: quant,
        quantFin: somma,
      });
  };
   //******************************************************************************************************** */
   const handleCronologiaPa = async (todo, pap ) => {   //aggiunta della trupla cronologia Pa
    let dataOd= serverTimestamp();

    let dataFormattata = moment(dataOd).format('DD-MM-YYYY');

      await addDoc(collection(db, "cronologiaPa"), {
        autore: auth.currentUser.displayName,
        data: dataFormattata,
        createdAt: serverTimestamp(),
        idProdotto: todo.idProdotto,
        nomeP: todo.nomeP,
        paI: todo.prezzoIndi,
        paF: pap,
      });
      await updateDoc(doc(db, "notify", notiPaId), { NotiPa: true });  //va a modificare il valore della notifica
  };
//****************************************************************************************** */
const handleActiveEdit = async ( todo) => {
  setPopupActiveScortaEdit(true)
  setNomeP(todo.nomeP);
  setIdProdtto(todo.idProdotto)
  setPrezzoIndi(todo.prezzoIndi);
  setIdDocumentoEdit(todo.id);
  setReparto(todo.reparto);
};

const handleEdit = async ( todo, nome, SotSco, quaOrd, pap) => {
    if(todo.pa != pap) {    //la trupla viene inserita solo se pa viene cambiato
      handleCronologiaPa(todo, pap)
      
    }
    await updateDoc(doc(db, "prodotto", todo.id), { nomeP: nome, sottoScorta:SotSco, quantitaOrdinabile:quaOrd, prezzoIndi:pap});
    setFlagEdit(+FlagEdit+1);
    toast.clearWaitingQueue(); 
  };

  const handleEditNomeProd = async () => {
    console.log(idProdotto)
    await updateDoc(doc(db, "prodotto", idDocumentoEdit), { nomeP: nomeP, prezzoIndi, reparto: reparto});

    //aggiorno il nome dei prodotti per ogni cliente     va a prendere tutti o prodotti con questo id
    const q = query(collection(db, "prodottoClin"), where("idProdotto", "==", idProdotto));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (hi) => {
      await updateDoc(doc(db, "prodottoClin", hi.id), { nomeP: nomeP});  //va a cambiare il nome al singolo prodotto per cliente
    });
    

    setFlagEdit(+FlagEdit+1);
    handleClearSet();
    setPopupActiveScortaEdit(false);
    toast.clearWaitingQueue(); 
  };
  //****************************************************************************************** */
  const handleReparto = async () => {
    console.log("entrato")
    var desc
    if(descrizione == "") {  //controlli in caso in cui non si aggiunge la descrizione
      if(descrizioneMod == undefined) {
        desc = "";
      } else  {desc = descrizioneMod }
    } else {
      desc = descrizione
    }
    console.log(desc)
    await updateDoc(doc(db, "prodotto", idModRep), {reparto: reparto, descrizione: desc });
    setFlagEdit(+FlagEdit+1);
    setPopupActiveSearch(false)
    setDescrizione("");
    toast.clearWaitingQueue(); 
  };

  //****************************************************************************************** */
  const handleAddQuant = async ( todo, nome, ag) => {
    var flag = localStorage.getItem("flagCron");
    if(ag<=0) { // se è un numero negativo esce dalla funzione
      notifyErrorNumNegativo();
      toast.clearWaitingQueue(); 
      return
    }
    var somma = +todo.quantita+(+ag)
    await updateDoc(doc(db, "prodotto", todo.id), { nomeP: nome, quantita:somma});
    if(ag) {
       handleCronologia(todo, ag, somma, flag);
    }
    setFlagEdit(+FlagEdit+1);
  };


  const handleRemQuant = async ( todo, nome, ag) => {
    var flag = localStorage.getItem("flagCron");
    if(ag<=0) { // se è un numero negativo esce dalla funzione e non avviene l'operazione di update
      notifyErrorNumNegativo();
      toast.clearWaitingQueue(); 
      return
    }
    var somma = +todo.quantita-(+ag)
    if(somma<0) {      //nel caso si la somma è negativa, viene azzerata
      somma=0;  
    }
    await updateDoc(doc(db, "prodotto", todo.id), { nomeP: nome, quantita:somma});
    if(ag) {
      handleCronologia(todo, ag, somma, flag);
    }
    setFlagEdit(+FlagEdit+1);

  };

//**************************************************************************** */
  const handleDelete = async (id, nomeProd, IdProdP) => {
    console.log({nomeProd})
    console.log({IdProdP})
        // se si elimina il prodotto dalla scorta, questo prodotto viene eliminato per tutti i clienti
        const q = query(collection(db, "prodottoClin"), where("idProdotto", "==", IdProdP));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (hi) => {
          await deleteDoc(doc(db, "prodottoClin", hi.id));  
        });

        const p = query(collection(db, "cronologia"), where("idProdotto", "==", IdProdP));  //vado ad eliminare il prodotto nella cronologia Qta
        const querySnapshotP = await getDocs(p);
        querySnapshotP.forEach(async (hi) => {
          console.log("entrato cronologia 1")
          await deleteDoc(doc(db, "cronologia", hi.id));  
        });

        const s = query(collection(db, "cronologiaPa"), where("idProdotto", "==", IdProdP));  //vado ad eliminare il prodotto nella Tabella Pa
        const querySnapshotS = await getDocs(s);
        querySnapshotS.forEach(async (hi) => {
          await deleteDoc(doc(db, "cronologiaPa", hi.id));  
        });

    await deleteDoc(doc(db, "prodotto", id)); //infine elimina il prodotto
  };
//**************************************************************************** */
  const actions = [     //speedDial
    { icon: <InventoryIcon />, name: 'Scorta', action:handleSpeedScorta },
    { icon: <RestoreIcon />, name: 'Cronologia', action: handleSpeedCronologia },
    { icon: <PrintIcon />, name: 'Stampa', action: print},
    { icon: <AddIcon />, name: 'Aggiungi Prodotto', action: handleSpeedAddProd },
  ];
//******************************************************************************************************************************** */
//                              NICE
//********************************************************************************************************************************* */
    return ( 
    <>  
{/**************NAVBAR MOBILE*************************************** */}
  <div className='navMobile row'>
  <div className='col-2'>
  </div>
  <div className='col' style={{padding: 0}}>
  <p className='navText'> Anagrafica Magazzino </p>
  </div>
  {dip == true &&
<div className='col-4'>
  {FlagRep ==0 && <p className='navText' style={{ color: "#f8dcb5",}}> Tutti Prd.</p>}
  {FlagRep ==1 && <p className='navText' style={{ color: "#f8dcb5"}}> Rep. Fem.</p>}
  {FlagRep ==2 && <p className='navText' style={{ color: "#f8dcb5"}}> Rep. Mas.</p>}
  {FlagRep ==3 && <p className='navText' style={{ color: "#f8dcb5"}}> Rep. Att.</p>}
</div>
}
  </div>
   <motion.div className=''
        initial= {{x: "-100vw"}}
        animate= {{x: 0}}
        transition={{ duration: 0.4 }}>
  

  
  {!matches && 
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate(-1)}}>
      <ArrowBackIcon id="i" /></button> 
    }
{/**************TITLE*************************************** */}
{!matches ? <h1 className='title mt-3' style={{ textAlign: "left", marginLeft: "70px" }}>Prodotti</h1> : <div style={{marginBottom:"60px"}}></div>}

{/**************Bottoni*************************************** */}
<div style={{ justifyContent: "left", textAlign: "left", marginTop: "40px" }}>
      <ToggleButtonGroup
      color="primary"
      value={alignment}
      exclusive
      onChange={handleChangeTogg}
      aria-label="Platform"
    > 
    {sup == true &&<Button style={{borderTopRightRadius: "0px", borderBottomRightRadius: "0px" }}  onClick={handleSpeedAddProd} size="small" variant="contained">Aggiungi Prodotto</Button>}
      <Button style={{color: primary, backgroundColor: "#CCCBCBCC", borderColor: primary, borderStyle: "solid", borderWidth: "2px", borderRadius: "0px" }}  variant="contained"  onClick={handleSpeedScorta}  value="scorta">Scorta</Button>
      <Button style={{color: primary, backgroundColor: "#CCCBCBCC", borderColor: primary, borderStyle: "solid", borderWidth: "2px", borderRadius: "0px" }} onClick={() => {navigate("/scortatinte")}}  value="scortatinte">Scorta Tinte</Button>
      {sup == true &&
      <>
      <Button style={{color: primary, backgroundColor: "#CCCBCBCC", borderColor: primary, borderStyle: "solid", borderWidth: "2px", borderRadius: "0px" }}   variant="contained" onClick={handleSpeedCronologia}  value="cronologia">Cronologia Qta</Button> 
      <Button style={{color: primary, backgroundColor: "#CCCBCBCC", borderColor: primary, borderStyle: "solid", borderWidth: "2px", borderRadius: "0px" }}  variant="contained" onClick={handleSpeedCronologiaPa}  value="cronologiaPa">Cronologia PR</Button> 
      </>}
      {sup == true && <Button style={{borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px" }}   onClick={() => {setFlagDelete(!flagDelete)}} color="error" variant="contained">elimina</Button> }
    </ToggleButtonGroup>
</div>

{/******Aggiungi Prodotto  modal***************************************************************************** */}
      <Modal  size="lg" show={popupActive || popupActiveScortaEdit} onHide={handleCloseMod} style={{ marginTop: "50px" }}>
      <div>  <button type='button' className="button-close float-end" onClick={() => { setPopupActive(false); setPopupActiveScortaEdit(false); }}>
              <CloseIcon id="i" /></button> </div>
    {popupActive && <h4 className='title'  style={{ width: "300px", position: "absolute", top: "10px", marginLeft: "2px" }}> Aggiungi Prodotto </h4>}
    {popupActiveScortaEdit && <h4 className='title'  style={{ width: "300px", position: "absolute", top: "10px", marginLeft: "2px" }}> Modifica Prodotto </h4>}
          <Modal.Body>
          <div className='row mt-4' >
      <div className='col'>
      <TextField style={{width: "100%"}} color='secondary' id="filled-basic" label="Prodotto" variant="outlined" autoComplete='off' value={nomeP} 
          onChange={(e) => setNomeP(e.target.value)}/>
      </div>
      <div className='col'>
      <TextField style={{width: "100%"}} color='secondary' id="filled-basic" label="Brand" variant="outlined" autoComplete='off' value={brand} 
          onChange={(e) => setBrand(e.target.value)}/>
      </div>
      </div>
      <div className='row mt-4'>
        <div className='col'>
          <FormControl className='mb-5' color='secondary'>
            <InputLabel  color='secondary' id="demo-simple-select-label"></InputLabel>
            <Select sx={{height:55, width: "370px"}}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              defaultValue={1}
              onChange={handleChangeDataSelect}
            >
              <MenuItem value={1}>Reparto Femminile</MenuItem>
              <MenuItem value={2}>Reparto Maschile</MenuItem>
              <MenuItem value={3}>Reparto Attrezzature</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div className='col'>
        <TextField  style={{width: "100%"}} type="number"  color='secondary'                
        inputProps={{
                  step: 0.01,
                }} id="filled-basic" label="Prezzo" variant="outlined" autoComplete='off' value={prezzoIndi} 
        onChange={(e) => setPrezzoIndi(e.target.value)}
        InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          }}
        />
        </div>
      </div>
       {popupActive && <Button onClick={handleSubmit} style={{ width: "100%", height: "50px" }} className='' type='submit' color='primary' variant="contained" >Aggiungi Prodotto </Button>}
       {popupActiveScortaEdit && <Button onClick={handleEditNomeProd} style={{ width: "100%", height: "50px" }} className='' type='submit' color='primary' variant="contained" >Modifica Prodotto </Button>}   
          </Modal.Body>
      </Modal>

{/** tabella prodotti nel magazzino *****************************************************************************************************************/}
{popupActiveScorta &&
<>
{sup == false  && <div style={{marginTop: "20px"}}></div>}
{/***** 
<div>
<h7> &nbsp; </h7>
 {flagFiltroDisp &&  <h7> Prodotti Disponibili; </h7>} 
 {flagFiltroCres &&  <h7> Quantità Crescente; </h7>} 
 {flagFiltroDesc && <h7> Quantità Decrescente; </h7> } 
</div> */}
<div ref={componentRef} className='todo_containerScorta'style={{width: dip == true && "100%"}}>
<div className='row' > 
<div className='col-4' style={{width: "100px"}}>
<p className='colTextTitle'>Prodotti</p>
</div>
{sup == true &&
<div className='col-4'>
{FlagRep ==0 && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> Tutti i prodotti</p>}
{FlagRep ==1 && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> Rep. Fem.</p>}
{FlagRep ==2 && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> Rep. Mas.</p>}
{FlagRep ==3 && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> Rep. Att.</p>}
</div>
}

<div className='col' style={{padding: "0px", paddingRight: "15px"}}>
<TextField
      inputRef={inputRef}
      className="inputSearchScorta"
      onChange={event => {setSearchTerm(event.target.value)}}
      type="text"
      placeholder="Ricerca Prodotto"
      InputProps={{
      startAdornment: (
      <InputAdornment position="start">
      <SearchIcon color='secondary'/>
      </InputAdornment>
                ),
                }}
       variant="outlined"/>
  </div>
  <div className='col-1' style={{marginLeft: "20px"}}>   
  <button type="button" className="buttonMenu" style={{paddingRight:"15px",float:"right"}} >
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
                <MenuItem onClick={handleCloseFilter}>Annulla Filtri</MenuItem>
                <MenuItem onClick={handleProdDisp}>Prodotti disponibili</MenuItem>
                <MenuItem onClick={handleQuantCre}>Quantità Crescente</MenuItem>
                <MenuItem onClick={handleQuant}>Quantità Decrescente</MenuItem>
                <MenuItem onClick={handleRepTutti}>Tutti i Prodotti</MenuItem>
                <MenuItem onClick={handleRepFemm}>Reparto Femminile</MenuItem>
                <MenuItem onClick={handleRepMasch}>Reparto Maschile</MenuItem>
                <MenuItem onClick={handleRepAtt}>Reparto Attrezzature</MenuItem>
              </Menu>
        </button>
  </div>

</div>

        <div className='row' style={{marginRight: "5px"}}>
        {sup == true &&
        <div className='col-1' >
        <p className='coltext'>Id Prodotto</p>
        </div>
        }
        {sup == true &&
          <div className='col-3' >
          <p className='coltext'>Prodotto</p>
          </div>
        }
        {dip == true &&
          <div className='col-5' >
          <p className='coltext'>Prodotto</p>
          </div>
        }
       
        {sup == true && 
        <>
        <div className='col-2' >
        <p className='coltext'>Categoria</p>
        </div>
        <div className='col-1' style={{padding: "0px", width:"80px"}}>
          <p className='coltext'>Qt</p>
        </div>
        <div className='col-1' style={{padding: "0px"}}>
          <p className='coltext'>Pr(€)</p>
        </div>
        <div className='col-1' style={{padding: "0px"}}>
          <p className='coltext'>Sogl. Sott.</p>
        </div>
        <div className='col-1' style={{padding: "0px"}}>
          <p className='coltext'>Qta Ord.</p>
        </div>
        <div className='col-1' style={{padding: "0px"}}>
          <p className='coltext'>Variazioni</p>
        </div>
        </>}

        {dip == true &&
        <>
        <div className='col-2' style={{padding: "0px"}}>
        <p className='coltext'>Qt</p>
        </div>
        <div className='col-2' style={{padding: "0px"}}>
        <p className='coltext'>Agg</p>
        </div>
        </>
        }
        <hr style={{margin: "0"}}/>
        </div>

<div className="scroll" style={{maxHeight: "320px"}}>
  {Progress == false && 
  <div style={{marginTop: "14px"}}>
      <CircularProgress />
  </div>
      }
  {todos.filter((val)=> {
        if(searchTerm === ""){
          return val
      } else if (val.nomeP.toLowerCase().includes(searchTerm.toLowerCase()) ||  val.brand.toLowerCase().includes(searchTerm.toLowerCase()) ) {
        return val
                }
            }).map((todo) => (
    <div key={todo.id}>
    {/*****Si attiva quando attivo il filtro tutti i prodotti********** */}
    { FlagRep == 0 &&(    
      <>
      {todo.quantita > PrdDisp && 
    <TodoScorta
      key={todo.id}
      todo={todo}
      handleActiveEdit= {handleActiveEdit}
      handleDelete={handleDelete}
      handleEdit={handleEdit}
      handleReparto={handleReparto}
      handleAddQuant={handleAddQuant}
      handleRemQuant= {handleRemQuant}
      handlePopUp={handlePopUp}
      displayMsg={displayMsg}
      FlagStampa={FlagStampa}
      flagDelete= {flagDelete}
    />
    }
    </>
     )}
     { FlagRep != 0 &&(
      <>
      {todo.reparto == FlagRep && todo.quantita > PrdDisp &&
      <TodoScorta
      key={todo.id}
      todo={todo}
      handleDelete={handleDelete}
      handleEdit={handleEdit}
      handleAddQuant={handleAddQuant}
      handleRemQuant= {handleRemQuant}
      handlePopUp={handlePopUp}
      displayMsg={displayMsg}
      FlagStampa={FlagStampa}
      flagDelete= {flagDelete}
    />
      }
    </>
     )}

    </div>
  ))}
  </div>
  </div>
  </>
}

{/* tabella cronologia Quantità*******************************************************************************************************************/}
{popupActiveCrono &&
  <div className='todo_containerCronoo'>
  <div className='row'> 
  <div className='col'>
    <p className='colTextTitle'> Cronologia Quantità</p>
  </div>
  <div className='col'>
  <TextField color='secondary'
      inputRef={inputRef}
      className="inputSearchScorta"
      onChange={event => {setSearchTermCrono(event.target.value)}}
      type="text"
      placeholder="Ricerca Prodotto, Utente, id Prodotto"
      InputProps={{
      startAdornment: (
      <InputAdornment position="start">
      <SearchIcon color='secondary'/>
      </InputAdornment>
                ),
                }}
       variant="outlined"/>
  </div>
  <div className='col-1' style={{marginLeft: "20px"}}>   
  <button type="button" className="buttonMenu" style={{paddingRight:"15px",float:"right"}} >
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
                <MenuItem onClick={handleCloseFilter}>Annulla Filtri</MenuItem>
                <MenuItem onClick={handleProdDisp}>Data Crescente</MenuItem>
                <MenuItem onClick={handleQuantCre}>Data Decrescente</MenuItem>
              </Menu>
        </button>
  </div>

</div>
  <div className='row' style={{marginRight: "5px"}}>
      <div className='col-2' style={{}}><p  className='coltext' >DataModifica</p></div>
      <div className='col-1' style={{padding: "0px"}}><p className='coltext' >id Prodotto</p> </div>
      <div className='col-3' style={{padding: "0px"}}><p className='coltext' >Prodotto</p> </div>
      <div className='col-2' style={{padding: "0px"}}><p className='coltext'>Utente</p></div>
      <div className='col-1' style={{padding: "0px"}}><p className='coltext'>V.Ini.</p></div>
      <div className='col-1' style={{padding: "0px"}}><p className='coltext'>Variazione</p></div>
      <div className='col-1' style={{padding: "0px"}}><p className='coltext'>V.Fin.</p></div>
      <hr style={{margin: "0"}}/>
    </div>
    <div className="scrollCrono" style={{maxHeight: "320px"}}>
    {Progress1 == false && 
  <div style={{marginTop: "14px"}}>
      <CircularProgress />
  </div>
      }
  {crono.filter((val)=> {
        if(searchTermCrono === ""){
          return val
      } else if (val.nomeP.toLowerCase().includes(searchTermCrono.toLowerCase()) ||  val.data.toLowerCase().includes(searchTermCrono.toLowerCase()) ||  val.idProdotto.toLowerCase().includes(searchTermCrono.toLowerCase()) ||  val.autore.toLowerCase().includes(searchTermCrono.toLowerCase()) ) {
        return val
                }
            }).map((col) => (
    <div key={col.id}>
    <div className='row' style={{padding: "0px"}}>
      <div className='col-2 diviCol' style={{}}><p className='inpTab'>{moment(col.createdAt.toDate()).calendar()}</p></div>
      <div className='col-1 diviCol' style={{padding: "0px"}}><p className='inpTab'>{col.idProdotto} </p> </div>
      <div className='col-3 diviCol' style={{padding: "0px"}}><p className='inpTab'>{col.nomeP} </p> </div>
      <div className='col-2 diviCol' style={{padding: "0px"}}><p className='inpTab'>{col.autore}</p></div>
      <div className='col-1 diviCol' style={{padding: "0px"}}><p className='inpTab'>{col.quantIni}</p></div>
      <div className='col-1 diviCol' style={{padding: "0px"}}><p className='inpTab'>{col.quantAgg}</p></div>
      <div className='col-1 diviCol' style={{padding: "0px"}}><p className='inpTab'>{col.quantFin}</p></div>
      <hr style={{margin: "0"}}/>
    </div>
    </div>
    ))}
    </div>
  </div>
}

{/* tabella cronologiaPR*******************************************************************************************************************/}
{popupActiveCronoPa &&
  <div className='todo_containerCronoo'>
  <div className='row'> 
  <div className='col'>
  <p className='colTextTitle'> Cronologia PR</p>
  </div>
  <div className='col'>
  <TextField color='secondary'
      inputRef={inputRef}
      className="inputSearchScorta"
      onChange={event => {setSearchTermCronoPa(event.target.value)}}
      type="text"
      placeholder="Ricerca Prodotto, Utente, id Prodotto"
      InputProps={{
      startAdornment: (
      <InputAdornment position="start">
      <SearchIcon color='secondary'/>
      </InputAdornment>
                ),
                }}
       variant="outlined"/>
  </div>
<div className='col-1' style={{marginLeft: "20px"}}>   
  <button type="button" className="buttonMenu" style={{paddingRight:"15px",float:"right"}} >
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
                <MenuItem onClick={handleCloseFilter}>Annulla Filtri</MenuItem>
                <MenuItem onClick={handleProdDisp}>Data Crescente</MenuItem>
                <MenuItem onClick={handleQuantCre}>Data Decrescente</MenuItem>
              </Menu>
        </button>
  </div>
</div>
  <div className='row' style={{marginRight: "5px"}}>
      <div className='col-2' ><p  className='coltext' >Data Modifica</p></div>
      <div className='col-1' style={{padding: "0px"}}><p className='coltext' >id Prodotto</p> </div>
      <div className='col-4' style={{padding: "0px"}}><p className='coltext' >Prodotto</p> </div>
      <div className='col-2' style={{padding: "0px"}}><p className='coltext'>Utente</p></div>
      <div className='col-1' style={{padding: "0px"}}><p className='coltext'>Pr Ini.</p></div>
      <div className='col-1' style={{padding: "0px"}}><p className='coltext'>Pr Fin. </p></div>
      <hr style={{margin: "0"}}/>
    </div>
    <div className="scrollCrono" style={{maxHeight: "320px"}}>
    {Progress1 == false && 
  <div style={{marginTop: "14px"}}>
      <CircularProgress />
  </div>
      }
  {cronoPa.filter((val)=> {
        if(searchTermCronoPa === ""){
          return val
      } else if (val.nomeP.toLowerCase().includes(searchTermCronoPa.toLowerCase()) ||  val.data.toLowerCase().includes(searchTermCronoPa.toLowerCase()) ||  val.idProdotto.toLowerCase().includes(searchTermCronoPa.toLowerCase()) ||  val.autore.toLowerCase().includes(searchTermCronoPa.toLowerCase())  ) {
        return val
                }
            }).map((col) => (
    <div key={col.id}>
    <div className='row' style={{padding: "0px"}}>
      <div className='col-2 diviCol'><p className='inpTab'>{moment(col.createdAt.toDate()).calendar()}</p></div>
      <div className='col-1 diviCol' style={{padding: "0px"}}><p className='inpTab'>{col.idProdotto} </p> </div>
      <div className='col-4 diviCol' style={{padding: "0px"}}><p className='inpTab'>{col.nomeP} </p> </div>
      <div className='col-2 diviCol' style={{padding: "0px"}}><p className='inpTab'>{col.autore}</p></div>
      <div className='col-1 diviCol' style={{padding: "0px"}}><p className='inpTab'>€{Number(col.paI).toFixed(2).replace('.', ',')}</p></div>
      <div className='col-1 diviCol' style={{padding: "0px"}}><p className='inpTab'>€{Number(col.paF).toFixed(2).replace('.', ',')}</p></div>
      <hr style={{margin: "0"}}/>
    </div>
    </div>
    ))}
    </div>
  </div>
}

  {/***************************************************************************************************************************************/}
    {/* POPUP VISUALIZZA Descrizione */}

          {popupActiveSearch && <div className="">
        <div className="popup-inner rounded-4" style={{ backgroundColor: "white" }}>
        <div className='divClose'>  <button type='button' className="button-close float-end" onClick={() => { setPopupActiveSearch(false); }}>
              <CloseIcon id="i" />
              </button> </div>
        <div style={{ textAlign: "center" }}>
          <h4> Aggiorna Prodotto </h4>
          <div style={{ marginTop: "30px", marginBottom: "30px" }}>
          <h7> {nomePModRep}</h7>
          </div>
          <div style={{  }}>
          <h8>Descrizione:</h8>
          </div>
            <textarea style={{ height: "100px", width: "300px", borderRadius: "10px", borderWidth: "2px" }} value={descrizione} onChange={(e) => setDescrizione(e.target.value)} placeholder={descrizioneMod}/>
              
                <FormControl >
                  <InputLabel id="demo-simple-select-label"></InputLabel>
                  <Select sx={{height:39, marginLeft:-1, width: 200, marginTop: "10px"}}
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    defaultValue={1}
                    onChange={handleChangeDataSelect}
                  >
                    <MenuItem value={1}>Reparto Femminile</MenuItem>
                    <MenuItem value={2}>Reparto Maschile</MenuItem>
                    <MenuItem value={3}>Reparto Attrezzature</MenuItem>
                  </Select>
              </FormControl>
            <div style={{ marginTop: "20px", marginBottom: "20px" }}>
            <div className="btn_container">
              <Button onClick={ ()=> { handleReparto() }} variant="outlined" >Coferma</Button>
            </div>
            </div>
          </div>
             
        </div>
      </div> }
     
  {/***************************************************************************************************************************************/}


    
{/*******************************************************************************************************************/}

</motion.div>
    </>
      )
}
export default Scorta;
