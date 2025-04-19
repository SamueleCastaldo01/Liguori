import React, { useEffect, useState } from 'react'
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, orderBy, where, serverTimestamp, limit, getDocs, getCountFromServer} from 'firebase/firestore';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import moment from 'moment';
import { auth, db } from "../firebase-config";
import { toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { notifyErrorProd, notifyUpdateProd, notifyErrorNumNegativo, notifyErrorProdList, notifyErrorPrezzoProd } from '../components/Notify';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Modal } from 'react-bootstrap';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import TodoScorta from '../components/TodoScorta';
import Button from '@mui/material/Button';
import { supa, guid, tutti, dipen, primary } from '../components/utenti';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { color, motion } from 'framer-motion';
import TodoScortaTinte from '../components/TodoScortaTinte';

function ScortaTinte() {

  const [todos, setTodos] = React.useState([]);
  const [crono, setCrono] = React.useState([]);

  const [arrayOrdinato, setArrayOrdinato] = React.useState([]);

  const [Progress, setProgress] = React.useState(false);
  const [Progress1, setProgress1] = React.useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const [notiPaId, setNotiPaId] = React.useState("7k5cx6hwSnQTCvWGVJ2z");

  const [brand, setBrand] = React.useState("TECH");
  const [nomeP, setNomeP] = React.useState("");
  const [quantita, setQuantita] = React.useState("");
  const [reparto, setReparto] = React.useState(1);
  const [sottoScorta, setSottoScorta] = React.useState("");
  const [quantitaOrdinabile, setquantitaOrdinabile] = React.useState("");

  const [imageSer, setImageSer] = React.useState(localStorage.getItem("imageProd"));
  const [notaSer, setNotaSer] = React.useState(localStorage.getItem("NotaProd"));

  const componentRef = useRef();  //serve per la stampa
  const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone

  const [alignment, setAlignment] = React.useState('scorta');

  const [popupActiveCrono, setPopupActiveCrono] = useState(false);  
  const [popupActiveScortaEdit, setPopupActiveScortaEdit] = useState(false); 
  const [FlagEdit, setFlagEdit] = useState("0");
  const [flagTinte, setflagTinte] = useState("TECH");
  const [PrdDisp, setPrdDisp] = useState(-1);

  const [open, setOpen] = React.useState(false); //serve per lo speedDial
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleCloseMod = () =>{ setPopupActive(false); setPopupActiveScortaEdit(false)};

  const [FlagStampa, setFlagStampa] = useState(false);
  const [flagDelete, setFlagDelete] = useState(false); 

  const [popupActiveSearch, setPopupActiveSearch] = useState(false);  

  const [popupActive, setPopupActive] = useState(false);  
  const [popupActiveScorta, setPopupActiveScorta] = useState(true);  
  const [searchTerm, setSearchTerm] = useState("");  //search
  const inputRef= useRef();

  //permessi utente
  let sup= supa.includes(localStorage.getItem("uid"))
  let dip= dipen.includes(localStorage.getItem("uid"))
  let gui= guid.includes(localStorage.getItem("uid"))
  let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

  let navigate = useNavigate();

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
          handleDelete(localStorage.getItem("IdProd"),  localStorage.getItem("NomeProd"));
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
    const collectionRef = collection(db, "scortaTinte");
    var q;
    q = query(collectionRef, orderBy("nomeP"));  //questa se flagFilter è diverso da 1 e 2
        q = query(collectionRef);

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setTodos(todosArray);
      setProgress(true);
    });
    return () => unsub();

  }, [FlagEdit]);

  React.useEffect(() => {   //Ordinamento delle stringhe, viene eseguita ogni qual volta che viene aggiornato l'array
    const ordinamentoPersonalizzato = (a, b) => {
      const isInt = (str) => /^[0-9]+$/.test(str);
    
      const parseValue = (str) => {
        const [integerPart, decimalPart] = str.split('.');
        if (decimalPart === '0') {
          return parseFloat(integerPart + '.' + decimalPart);
        }
        return parseFloat(str);
      };
    
      const numeroA = parseValue(a.nomeP);
      const numeroB = parseValue(b.nomeP);
    
      const isIntA = isInt(a.nomeP);
      const isIntB = isInt(b.nomeP);
    
      const isDecimoA = !isIntA && a.nomeP.split('.')[1] && a.nomeP.split('.')[1].length === 1;
      const isDecimoB = !isIntB && b.nomeP.split('.')[1] && b.nomeP.split('.')[1].length === 1;
    
      const isCentesimoA = !isIntA && a.nomeP.split('.')[1] && a.nomeP.split('.')[1].length === 2;
      const isCentesimoB = !isIntB && b.nomeP.split('.')[1] && b.nomeP.split('.')[1].length === 2;
    
      // Ordinamento
      if (isIntA && isIntB) {
        return numeroA - numeroB; // Numeri interi vengono ordinati normalmente
      } else if (isIntA) {
        return -1; // Numero intero viene prima
      } else if (isIntB) {
        return 1; // Numero intero viene prima
      } else if (isDecimoA && isDecimoB) {
        const decimaleA = parseFloat(a.nomeP.split('.')[1] || "0");
        const decimaleB = parseFloat(b.nomeP.split('.')[1] || "0");
        return decimaleA - decimaleB || numeroA - numeroB; // Ordina per decimale, poi per valore
      } else if (isDecimoA) {
        return isIntB ? 1 : -1; // Numeri con decimi vengono dopo i numeri interi
      } else if (isDecimoB) {
        return isIntA ? -1 : 1; // Numeri con decimi vengono dopo i numeri interi
      } else if (isCentesimoA && isCentesimoB) {
        const centesimoA = parseFloat(a.nomeP.split('.')[1] || "0");
        const centesimoB = parseFloat(b.nomeP.split('.')[1] || "0");
        return centesimoA - centesimoB || numeroA - numeroB; // Ordina per centesimo, poi per valore
      } else if (isCentesimoA) {
        return isIntB || isDecimoB ? 1 : -1; // Numeri con centesimi vengono dopo i numeri interi e i numeri con decimi
      } else if (isCentesimoB) {
        return isIntA || isDecimoA ? -1 : 1; // Numeri con centesimi vengono dopo i numeri interi e i numeri con decimi
      } else {
        return 0; // Non dovrebbe mai arrivare a questo punto
      }
    };
     setArrayOrdinato(todos.sort(ordinamentoPersonalizzato)) 
  }, [todos]);


  React.useEffect(() => {
    if(popupActiveCrono) {
      const collectionRef = collection(db, "cronologiaTinte");
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
    }
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
    setPopupActiveScorta(false)
    setOpen(false)
  } 

  function handleSpeedScorta() {
    setPopupActiveScorta(true)
    setPopupActiveCrono(false)
    setOpen(false)
    console.log(localStorage.getItem("profilePic"))
  }

  function handleSpeedAddProd() {
    setPopupActive(true)
    setOpen(false)
  }
 //******************************************************************************* */

const handleChangeBrand = (event) => {
  setBrand(event.target.value);      //prende il valore del select
};

const handleChangeTogg = (event) => {
  setAlignment(event.target.value);
};

const handleMenu = (event) => {
  setAnchorEl(event.currentTarget);
};

const handleClosi = () => {  //chiude il menu
  setAnchorEl(null);
};
const handleTech = () => { 
    setflagTinte("TECH");
    handleClosi();
  };
const handleKf = () => { 
    setflagTinte("KF");
    handleClosi();
  };
const handleKr = () => { 
    setflagTinte("KR");
    handleClosi();
  };
const handleKG = () => { 
    setflagTinte("KG");
    handleClosi();
  };
const handleK10 = () => { 
    setflagTinte("K10");
    handleClosi();
  };
const handleCb = () => { 
    setflagTinte("CB");
    handleClosi();
  };
const handleNuage = () => { 
    setflagTinte("NUAGE");
    handleClosi();
  };
const handleVibrance = () => { 
    setflagTinte("VIBRANCE");
    handleClosi();
  };
  const handleExtremo = () => { 
    setflagTinte("EXTREMO");
    handleClosi();
  };
const handleNative = () => { 
    setflagTinte("NATIVE");
    handleClosi();
  };
const handleDiacolor = () => { 
    setflagTinte("DIACOLOR");
    handleClosi();
  };
  const handleMajirel = () => { 
    setflagTinte("MAJIREL");
    handleClosi();
  };
  const handleDialoght = () => { 
    setflagTinte("DIALIGHT");
    handleClosi();
  };
  const handleInoa = () => { 
    setflagTinte("INOA");
    handleClosi();
  };
  const handleRoyal = () => { 
    setflagTinte("ROYAL");
    handleClosi();
  };
  const handleCOil = () => { 
    setflagTinte("C.OIL");
    handleClosi();
  };


const handleNome = () => {  //va a fare l'ordinamento della qt in modo crescente
  setPrdDisp(-1);
  handleClosi();
};

const handleProdDisp = () => {  //va a prendere i prodotti disponibili
  setPrdDisp(0);
    handleClosi();
  };

function handlePopUp(image, nota) {
  setImageSer(image)
  setNotaSer(nota)
  setPopupActiveSearch(true);
}
 //******************************************************************************************************** */
 const handleCronologia = async (todo, ag, somma, flag) => {   //aggiunta della trupla cronologia quantità
  if (flag === "true") { var quant= "+"+ag }
  else { var quant= "-"+ag }
    await addDoc(collection(db, "cronologiaTinte"), {
      autore: auth.currentUser.displayName,
      createdAt: serverTimestamp(),
      nomeP: todo.nomeP,
      brand: todo.brand,
      quantIni: todo.quantita,
      quantAgg: quant,
      quantFin: somma,
    });
};

 //******************************************************************************* */

 const handleSubmit = async (e) => {   //creazione prdotto
    var bol= true
    e.preventDefault();
    if(!nomeP) {            //controllo che il nom sia inserito
      notifyErrorProd();
      toast.clearWaitingQueue(); 
      return
    }
    // verifica che il prodotto sia univoco per quel brand
    const q = query(collection(db, "scortaTinte"), where("nomeP", "==", nomeP),  where("brand", "==", brand));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
    if (doc.data().nomeP == nomeP && doc.data().brand == brand) {
        notifyErrorProdList()
         toast.clearWaitingQueue(); 
        bol=false
    }
    });

    if(bol == true) {
      await addDoc(collection(db, "scortaTinte"), {
        nomeP,
        quantita: 0,
        brand,
        sottoScorta,
        quantitaOrdinabile,
      });
      }
      setNomeP("");
      setFlagEdit(+FlagEdit+1);
      setPopupActive(false);
  };

   //******************************************************************************************************** */
   const handleCronologiaPa = async (todo, pap ) => {   //aggiunta della trupla cronologia Pa
    await addDoc(collection(db, "cronologiaPa"), {
      autore: auth.currentUser.displayName,
      createdAt: serverTimestamp(),
      nomeP: todo.nomeP + " " + todo.brand,
      paI: todo.pa,
      paF: pap,
    });
    await updateDoc(doc(db, "notify", notiPaId), { NotiPa: true });  //va a modificare il valore della notifica
};
//****************************************************************************************** */
  const handleEdit = async ( todo, nome, SotSco, quaOrd, pap) => {
    console.log(SotSco)
    if(todo.pa != pap) {    //la trupla viene inserita solo se pa viene cambiato
      handleCronologiaPa(todo, pap)
    }
    await updateDoc(doc(db, "scortaTinte", todo.id), { nomeP: nome, sottoScorta:SotSco, quantitaOrdinabile:quaOrd});
    setFlagEdit(+FlagEdit+1);
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
    await updateDoc(doc(db, "scortaTinte", todo.id), { nomeP: nome, quantita:somma});
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
    await updateDoc(doc(db, "scortaTinte", todo.id), { nomeP: nome, quantita:somma});
    if(ag) {
      handleCronologia(todo, ag, somma, flag);
    }
    setFlagEdit(+FlagEdit+1);
  };

//**************************************************************************** */
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "scortaTinte", id)); //elimino la tinta
  };

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
  <p className='navText'> Scorta Tinte </p>
  </div>
  {dip == true && 
<div className='col-4'>
{flagTinte == "TECH" && <p className='navText' style={{ color: "#f8dcb5"}}> TECH</p>}
{flagTinte == "KF" && <p className='navText' style={{ color: "#f8dcb5"}}> KF</p>}
{flagTinte == "KR" && <p className='navText' style={{ color: "#f8dcb5"}}> KR</p>}
{flagTinte == "KG" && <p className='navText' style={{ color: "#f8dcb5"}}> KG</p>}
{flagTinte == "K10" && <p className='navText' style={{ color: "#f8dcb5"}}> K10</p>}
{flagTinte == "CB" && <p className='navText' style={{ color: "#f8dcb5"}}> CB</p>}
{flagTinte == "NUAGE" && <p className='navText' style={{ color: "#f8dcb5"}}> NUAGE</p>}
{flagTinte == "VIBRANCE" && <p className='navText' style={{ color: "#f8dcb5"}}> VIBRANCE</p>}
{flagTinte == "EXTREMO" && <p className='navText' style={{ color: "#f8dcb5"}}> EXTREMO</p>}
{flagTinte == "NATIVE" && <p className='navText' style={{ color: "#f8dcb5"}}> NATIVE</p>}
{flagTinte == "MARJIREL" && <p className='navText' style={{color: "#f8dcb5"}}> MARJIREL</p>}
{flagTinte == "DIACOLOR" && <p className='navText' style={{color: "#f8dcb5"}}> DIACOLOR</p>}
{flagTinte == "INOA" && <p className='navText' style={{color: "#f8dcb5"}}> INOA</p>}
{flagTinte == "ROYAL" && <p className='navText' style={{color: "#f8dcb5"}}> ROYAL</p>}
{flagTinte == "C.OIL" && <p className='navText' style={{color: "#f8dcb5"}}> C.OIL</p>}
</div>
}
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

{/**************TITLE*************************************** */}
{!matches ? <h1 className='title mt-3' style={{ textAlign: "left", marginLeft: "70px" }}>Scorte Tinte</h1> : <div style={{marginBottom:"60px"}}></div>}
      
<div style={{ justifyContent: "left", textAlign: "left", marginTop: "40px" }}>
      <ToggleButtonGroup
      color="primary"
      value={alignment}
      exclusive
      onChange={handleChangeTogg}
      aria-label="Platform"
    > 
    {sup == true &&<Button style={{borderTopRightRadius: "0px", borderBottomRightRadius: "0px" }}  onClick={handleSpeedAddProd} size="small" variant="contained">Aggiungi Tinta</Button>}
      <Button style={{color: primary, backgroundColor: "#CCCBCBCC", borderColor: primary, borderStyle: "solid", borderWidth: "2px", borderRadius: "0px" }}  onClick={() => {navigate("/scorta")}} color='secondary' value="scortatinte">Scorta</Button>
      <Button style={{color: primary, backgroundColor: "#CCCBCBCC", borderColor: primary, borderStyle: "solid", borderWidth: "2px", borderRadius: "0px" }} onClick={handleSpeedScorta} color='secondary' value="scorta">Scorta Tinte</Button>
    {sup == true &&
      <Button style={{color: primary, backgroundColor: "#CCCBCBCC", borderColor: primary, borderStyle: "solid", borderWidth: "2px", borderRadius: "0px" }} onClick={handleSpeedCronologia} color='secondary' value="cronologia">Cronologia</Button> 
    }
      {sup == true && <Button onClick={() => {setFlagDelete(!flagDelete)}} color="error" variant="contained">elimina</Button> }
    </ToggleButtonGroup>
</div>
    {sup ===true && (
        <>    
{/** Aggiungi Tinte **************************************************************************/}
{/******Aggiungi Prodotto  modal***************************************************************************** */}
<Modal style={{ marginTop: "50px"}} size="lg" show={popupActive || popupActiveScortaEdit} onHide={handleCloseMod}>
      <div>  <button type='button' className="button-close float-end" onClick={() => { setPopupActive(false); setPopupActiveScortaEdit(false); }}>
              <CloseIcon id="i" /></button> </div>
    {popupActive && <h4 className='title'  style={{ width: "300px", position: "absolute", top: "10px", marginLeft: "2px" }}> Aggiungi Tinta </h4>}
    {popupActiveScortaEdit && <h4 className='title'  style={{ width: "300px", position: "absolute", top: "10px", marginLeft: "2px" }}> Modifica Tinta </h4>}
          <Modal.Body>
      <div className='row mt-4 mb-4 d-flex align-content-center' >
      <div className='col-8'>
      <TextField style={{width: "100%"}} color='secondary' id="filled-basic" label="Nuance" variant="outlined" autoComplete='off' value={nomeP} 
          onChange={(e) => setNomeP(e.target.value)}/>
      </div>
      <div className='col-4'> 
        <FormControl >
          <InputLabel id="demo-simple-select-label"></InputLabel>
          <Select sx={{height:60, marginLeft:-1, width: 200, marginTop: "0px"}}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            defaultValue={"TECH"}
            onChange={handleChangeBrand}
          >
            <MenuItem value={"TECH"}>TECH</MenuItem>
            <MenuItem value={"KF"}>KF</MenuItem>
            <MenuItem value={"KR"}>KR</MenuItem>
            <MenuItem value={"KG"}>KG</MenuItem>
            <MenuItem value={"K10"}>K10</MenuItem>
            <MenuItem value={"CB"}>CB</MenuItem>
            <MenuItem value={"NUAGE"}>NUAGE</MenuItem>
            <MenuItem value={"ROYAL"}>ROYAL</MenuItem>
            <MenuItem value={"VIBRANCE"}>VIBRANCE</MenuItem>
            <MenuItem value={"EXTREMO"}>EXTREMO</MenuItem>
            <MenuItem value={"NATIVE"}>NATIVE</MenuItem>
            <MenuItem value={"MAJIREL"}>MAJIREL</MenuItem>
            <MenuItem value={"DIALIGHT"}>DIALIGHT</MenuItem>
            <MenuItem value={"DIACOLOR"}>DIACOLOR</MenuItem>
            <MenuItem value={"INOA"}>INOA</MenuItem>
            <MenuItem value={"C.OIL"}>C.OIL</MenuItem>
          </Select>
        </FormControl>
      </div>
      </div>
       {popupActive && <Button onClick={handleSubmit} style={{ width: "100%", height: "50px" }} className='' type='submit' color='primary' variant="contained" >Aggiungi Tinta </Button>}
       {popupActiveScortaEdit && <Button onClick={""} style={{ width: "100%", height: "50px" }} className='' type='submit' color='primary' variant="contained" >Modifica Tinta </Button>}   
          </Modal.Body>
  </Modal>
    </>
    )}

{/** tabella tinte scorta *****************************************************************************************************************/}
{popupActiveScorta &&
<>
{sup == false  && <div style={{marginTop: "20px"}}></div>}
<div ref={componentRef} className='todo_containerScorta' style={{width: dip == true ? "100%" : "700px"}}>
<div className='row' > 
<div className='col-4' style={{width: "100px"}}>
<p className='colTextTitle'>Tinte</p>
</div>
{sup == true && 
<div className='col-3'>
{flagTinte == "TECH" && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> TECH</p>}
{flagTinte == "KF" && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> KF</p>}
{flagTinte == "KR" && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> KR</p>}
{flagTinte == "KG" && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> KG</p>}
{flagTinte == "K10" && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> K10</p>}
{flagTinte == "CB" && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> CB</p>}
{flagTinte == "NUAGE" && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> NUAGE</p>}
{flagTinte == "VIBRANCE" && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> VIBRANCE</p>}
{flagTinte == "EXTREMO" && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> EXTREMO</p>}
{flagTinte == "NATIVE" && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> NATIVE</p>}
{flagTinte == "MARJIREL" && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> MARJIREL</p>}
{flagTinte == "DIACOLOR" && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> DIACOLOR</p>}
{flagTinte == "INOA" && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> INOA</p>}
{flagTinte == "ROYAL" && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> ROYAL</p>}
{flagTinte == "C.OIL" && <p className='colTextTitle' style={{textAlign: "right", color: "black"}}> C.OIL</p>}
</div>
}

<div className='col' style={{padding: "0px", paddingRight: "15px"}}>
<TextField
      inputRef={inputRef}
      className="inputSearchScorta"
      onChange={event => {setSearchTerm(event.target.value)}}
      type="text"
      placeholder="Ricerca Tinte"
      InputProps={{
      startAdornment: (
      <InputAdornment position="start">
      <SearchIcon color='secondary'/>
      </InputAdornment>
                ),
                }}
       variant="outlined"/>
  </div>

  <div className='col-1'  style={{marginLeft: "20px"}}>   
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
                <MenuItem onClick={handleNome}>Annulla filtri</MenuItem>
                <MenuItem onClick={handleProdDisp}>Prodotti disponibili</MenuItem>
                <MenuItem onClick={handleTech}>TECH</MenuItem>
                <MenuItem onClick={handleKf}>KF</MenuItem>
                <MenuItem onClick={handleKr}>KR</MenuItem>
                <MenuItem onClick={handleKG}>KG</MenuItem>
                <MenuItem onClick={handleK10}>K10</MenuItem>
                <MenuItem onClick={handleCb}>CB</MenuItem>
                <MenuItem onClick={handleNuage}>NUAGE</MenuItem>
                <MenuItem onClick={handleRoyal}>ROYAL</MenuItem>
                <MenuItem onClick={handleVibrance}>VIBRANCE</MenuItem>
                <MenuItem onClick={handleExtremo}>EXTREMO</MenuItem>
                <MenuItem onClick={handleNative}>NATIVE</MenuItem>
                <MenuItem onClick={handleMajirel}>MAJIREL</MenuItem>
                <MenuItem onClick={handleDiacolor}>DIACOLOR</MenuItem>
                <MenuItem onClick={handleDialoght}>DIALIGHT</MenuItem>
                <MenuItem onClick={handleInoa}>INOA</MenuItem>
                <MenuItem onClick={handleCOil}>C.OIL</MenuItem>
              </Menu>
        </button>
  </div>

</div>

<div className='row' style={{marginRight: "5px"}}>
<div className='col-2' >
<p className='coltext'>Nuance</p>
</div>

{sup == true && 
<>
<div className='col-2' style={{padding: "0px"}}>
  <p className='coltext'>Qt</p>
</div>
<div className='col-2' style={{padding: "0px"}}>
  <p className='coltext'>Ss</p>
</div>
<div className='col-2' style={{padding: "0px"}}>
  <p className='coltext'>Qo</p>
</div>
<div className='col-2' style={{padding: "0px"}}>
  <p className='coltext'>Agg</p>
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

<div className="scroll" style={{maxHeight: "400px"}}>
  {Progress == false && 
  <div style={{marginTop: "14px"}}>
      <CircularProgress />
  </div>
      }
  {arrayOrdinato.filter((val)=> {
        if(searchTerm === ""){
          return val
      } else if (val.nomeP.toLowerCase().includes(searchTerm.toLowerCase()) ) {
        return val
                }
            }).map((todo) => (
    <div key={todo.id}>
    { flagTinte == todo.brand && todo.quantita> PrdDisp && (
    <TodoScortaTinte
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
     )}
    </div>
  ))}
  </div>
  </div>
  </>
}


{/* tabella cronologia*******************************************************************************************************************/}
{popupActiveCrono &&
  <div className='todo_containerCronoo mt-5'>
  <div className='row'> 
<p className='colTextTitle'> Cronologia Quantità</p>
</div>
  <div className='row' style={{marginRight: "5px"}}>
      <div className='col-3' style={{width:"220px"}}><p  className='coltext' >DataModifica</p></div>
      <div className='col-3' style={{padding: "0px", width:"140px"}}><p className='coltext' >Prodotto</p> </div>
      <div className='col-3' style={{padding: "0px", width:"140px"}}><p className='coltext' >Nuance</p> </div>
      <div className='col-2' style={{padding: "0px", width:"90px"}}><p className='coltext'>Autore</p></div>
      <div className='col-1' style={{padding: "0px", width:"50px"}}><p className='coltext'>V.Ini.</p></div>
      <div className='col-1' style={{padding: "0px", width:"50px"}}><p className='coltext'>Edit</p></div>
      <div className='col-1' style={{padding: "0px", width:"50px"}}><p className='coltext'>V.Fin.</p></div>
      <hr style={{margin: "0"}}/>
    </div>
    <div className="scrollCrono" style={{maxHeight: "400px"}}>
    {Progress1 == false && 
  <div style={{marginTop: "14px"}}>
      <CircularProgress />
  </div>
      }
  {crono.map((col) => (
    <div key={col.id}>
    <div className='row' style={{padding: "0px"}}>
      <div className='col-3 diviCol' style={{width:"220px"}}><p className='inpTab'>{moment(col.createdAt.toDate()).calendar()}</p></div>
      <div className='col-3 diviCol' style={{padding: "0px", width:"140px"}}><p className='inpTab'>{col.nomeP} </p> </div>
      <div className='col-3 diviCol' style={{padding: "0px", width:"140px"}}><p className='inpTab'>{col.brand} </p> </div>
      <div className='col-2 diviCol' style={{padding: "0px", width:"90px"}}><p className='inpTab'>{col.autore.substr(0, 7)}..</p></div>
      <div className='col-1 diviCol' style={{padding: "0px", width:"50px"}}><p className='inpTab'>{col.quantIni}</p></div>
      <div className='col-1 diviCol' style={{padding: "0px", width:"50px"}}><p className='inpTab'>{col.quantAgg}</p></div>
      <div className='col-1 diviCol' style={{padding: "0px", width:"50px"}}><p className='inpTab'>{col.quantFin}</p></div>
      <hr style={{margin: "0"}}/>
    </div>
    </div>
    ))}
    </div>
  </div>
}

  {/***************************************************************************************************************************************/}
    {/* POPUP VISUALIZZA RICERCA */}
          {popupActiveSearch && <div className="popup">
        <div className="popup-inner bg-dark rounded-4">
        <div className='divClose'>  <button type='button' className="button-close float-end" onClick={() => { setPopupActiveSearch(false); }}>
              <CloseIcon id="i" />
              </button> </div>
            <img className='mt-1 rounded-3' src={imageSer} style={{height: 185, width: 185}}/>
            <h2> {notaSer} </h2>
        </div>
      </div> }
  {/***************************************************************************************************************************************/}


    
{/*******************************************************************************************************************/}

</motion.div>
    </>
      )
}
export default ScortaTinte;