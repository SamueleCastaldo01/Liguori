import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, where, getDocs, orderBy, serverTimestamp} from 'firebase/firestore';
import { useRef } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useReactToPrint } from 'react-to-print';
import IconButton from '@mui/material/IconButton';
import moment from 'moment';
import { TextField } from '@mui/material';
import { auth, db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Todo from '../components/Todo';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { notifyErrorCli, notifyUpdateCli, notifyErrorCliEm } from '../components/Notify';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import { AutoComp } from './ScaletData';
import { supa, guid, tutti } from '../components/utenti';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';



function Scalet({ dateEli }) {

  const [todos, setTodos] = React.useState([]);
  const [nomeC, setNomeC] = React.useState("");
  const [numAsc, setNumAsc] = React.useState("");
  const [NumCartoni, setNumCartoni] = React.useState("");
  const [debito, setDebito] = React.useState("");
  const [quota, setQuota] = React.useState("");

  const [sum, setSum]  = React.useState("");
  const [sumQ, setSumQ] =React.useState("");

  const [popupActive, setPopupActive] = useState(false);  
  const [flagStampa, setFlagStampa] = useState(false); 

  const componentRef = useRef();
  
  const [Progress, setProgress] = React.useState(false);

  //permessi utente
  let sup= supa.includes(localStorage.getItem("uid"))   //confronto con uid corrente
  let gui= guid.includes(localStorage.getItem("uid"))
  let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

  const scalCollectionRef = collection(db, "scaletta"); 
  const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone

  let navigate = useNavigate();

  function handleInputChange(event, value) {
    setNomeC(value)
  }

  //_________________________________________________________________________________________________________________
     const setClear = () => {
      setNomeC("");
      toast.dismiss();
      toast.clearWaitingQueue();}

//********************************************************************************** */
const SomAsc = async () => {  //qui fa sia la somma degli asc  della quota, tramite query
  console.log("entrato nella somma")
  var somma=0;
  var sommaQ=0;
  var sommaSommaTot=0;
  var id ="";
  const q = query(collection(db, "Scaletta"), where("dataScal", "==", dateEli));  //query per fare la somma
  const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      somma =+doc.data().numAsc + somma;
      sommaQ=+doc.data().quota +sommaQ;
      sommaSommaTot= +doc.data().sommaTotale +sommaSommaTot;
      });
      var somTrunc = sommaQ.toFixed(2);  //conversione della quota
      var somTruncTot = sommaSommaTot.toFixed(2);  //conversione della sommaTotale
  const p = query(collection(db, "scalDat"), where("data", "==", dateEli));  //query per aggiornare la quota totale e gli asc, va a trovare l'id
  const querySnapshotp = await getDocs(p);
        querySnapshotp.forEach(async (hi) => {
          id= hi.id
          });
      await updateDoc(doc(db, "scalDat", id), { totalQuota: somTrunc, totalAsc:somma, totalSommaTotale:somTruncTot  });
      setSumQ(somTrunc);
      setSum(somma);
}
//********************************************************************************** */

  React.useEffect(() => {
    const collectionRef = collection(db, "Scaletta");
    const q = query(collectionRef, orderBy("createdAt"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setTodos(todosArray);
      setProgress(true);
    });
    localStorage.removeItem("scalId");
    return () => unsub();
  }, []);

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
/******************************************************************************* */
const createCate = async (e) => {
  e.preventDefault(); 
  var bol= true
  const q = query(collection(db, "Scaletta"), where("nomeC", "==", nomeC), where("dataScal", "==", dateEli)); //va a verificare che questo cliente non è stato già inserito
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
  if (doc.data().nomeC == nomeC) {
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
  if(!debito) {
    setDebito("0");
  }
  if(!quota) {
    console.log("bhooo")
    setQuota("0");
  }
  if(bol == true) {
  await addDoc(collection(db, "Scaletta"), {
    num: 0,
    nomeC,
    numAsc,
    debito,
    quota,
    quotaV: "",
    createdAt: serverTimestamp(),
    dataScal: dateEli,
    note: "",
    completed: false,
  });
  setNomeC("");
  setQuota("");
  setDebito("");
  setNumAsc("");
  setClear();
  SomAsc();
  }
};

//****************************************************************************************** */
  const handleEdit = async (todo, nome, numA, not, deb, quot, ncart) => {  // va ad aggiornare gli attributi di Scaletta
    console.log("entrato nell'edit")
    var qui =todo.quota;  //operazioni per modificare il debito1, deve fare la differenza
    var quotDiff = +todo.quota- (+todo.quotaV);
    var debTot;
    if (quot != qui) {
      const q = query(collection(db, "debito"), where("nomeC", "==", todo.nomeC));  //serve per aggiornare il debito 1
      const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (hi) => {
          debTot = (+hi.data().deb1 +(+quotDiff)) -(+quot);   //qui va ad ggiornare il debito1 con la quota va a fare la differenza
          var debTrunc = debTot.toFixed(2);   //va a troncare il risultato del debito, per non avere problemi di visualizzazione

          if(debTrunc<0) {
            qui= (+debTrunc *(-1))  //converte il numero negativo in positivo, per poi fare la sottrazione andando ad aggiornare la quota vecchia
            debTrunc="0.00"  //poi si azzera per aggiornare 
          }
          else { qui="0" }
          await updateDoc(doc(db, "debito", hi.id), { deb1:debTrunc});  //aggiorna deb1 nel database del debito
          });

          await updateDoc(doc(db, "Scaletta", todo.id), { quota:quot, quotaV:qui});   //Aggiorna la quota nella scaletta, solo se la quota è diversa da quella iniziale
          SomAsc();

          //potrebbe dare errori se non viene creata in modo automatico,la scaletta e va a chiudere prima la funzione
          await updateDoc(doc(db, "addNota", todo.idNota), { quota:quot});  //aggiorna addNota, questa quota mi serve perché poi va nella dashClienti (ordini chiusi) 
    }
          await updateDoc(doc(db, "Scaletta", todo.id), {nomeC: nome, numAsc:numA, note:not, debito:deb, NumCartoni:ncart});   //Aggiorna tutti gli altri dati nella scaletta
          toast.clearWaitingQueue(); 
          SomAsc();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "Scaletta", id));
    SomAsc();
  };
  //**************************************************************************** */
  const actions = [
    { icon: <PrintIcon />, name: 'Stampa', action: print},
    { icon: <AddIcon />, name: 'Aggiungi Cliente', action: HandleSpeedAddScalClien },
  ];
//**************************************************************************** */
//                              NICE
//********************************************************************************** */
    return ( 
    <>  
    <div className='navMobile row'>
      <div className='col-2'>
        <IconButton className="buttonArrow" aria-label="delete" sx={{ color: "#f6f6f6", marginTop: "7px" }}
        onClick={ ()=> {navigate("/scalettadata"); }}>
        <ArrowBackIcon sx={{ fontSize: 30 }}/>
      </IconButton>
      </div>
      <div className='col' style={{padding: 0}}>
      <p className='navText'> Scaletta </p>
      </div>
      </div>

  {!matches &&
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate("/scalettadata")}}>
      <ArrowBackIcon id="i" /></button> 
  }

  {!matches ? <h1 className='title mt-3'> Scaletta</h1> : <div style={{marginBottom:"60px"}}></div>} 
        <h3> {dateEli} </h3>


      <div>
        <span><button onClick={print}>Stampa</button></span>
        {/************** 
                <span><button onClick={HandleSpeedAddScalClien}>Aggiungi Cliente</button></span>
        */}

      </div>

 {/************************INSERIMENTO CLIENTE********************************************************************/}       
    {sup ===true && (
        <>
    {popupActive &&     
        <div>  
      <form className='formSC' onSubmit={createCate}>
      
      <div className='divCloseSc'>  <button type='button' className="button-close float-end" onClick={() => { setPopupActive(false); }}>
              <CloseIcon id="i" />
              </button> </div>
      <div className="input_container">
      <Autocomplete
      value={nomeC}
      options={AutoComp}
      onInputChange={handleInputChange}
      componentsProps={{ popper: { style: { width: 'fit-content' } } }}
      renderInput={(params) => <TextField {...params} label="Cliente" />}
    />
      <TextField className='inp mt-2' id="filled-basic" label="Numero Asc" type="number" autoComplete='off' variant="outlined" value={numAsc} 
      onChange={(e) => setNumAsc(e.target.value)}/>
      <TextField className='inp mt-2' id="filled-basic" label="Debito" type="number" autoComplete='off' variant="outlined" value={debito} 
      onChange={(e) => setDebito(e.target.value)} 
      InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          }}
      />
      <TextField className='inp mt-2' id="filled-basic" label="Quota" type="number" autoComplete='off' variant="outlined" value={quota} 
      onChange={(e) => setQuota(e.target.value)}       
      InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          }}/>
          <div className="btn_container">
          <Button className='mt-3' type='submit' variant="outlined">Aggiungi Cliente</Button>
          </div>

      </div>
    </form>
    </div>
    }
    </>
    )}

{/**********************************************************************************************************************/}

        <div className=' mt-4' style={{width: "760px", display: "flex",columnGap: "50px", margin: "0 auto"}}>
        <h4 style={{textAlign:"left"}}>  Totale Asc: {sum}</h4>
        <h4 style={{textAlign:"left"}}> Totale Quota: {sumQ}€  </h4>
        </div>
    
{/*********************TABELLA SCALETTA**************************************************************************************/}
      <div ref={componentRef} className='todo_containerScalet'>
      <div className='row'> 
      <p className='colTextTitle'> Scaletta</p>
      </div>
      <div className='row'>
      <div className='col-4' >
      <p className='coltext'>Cliente</p>
      </div>

      <div className='col-2' style={{padding: "0px", width:"120px"}}>
      <p className='coltext'>Debito(€)</p>
      </div>
      <div className='col-1' style={{padding: "0px"}}>
      <p className='coltext'>Asc</p>
      </div>
      <div className='col-2' style={{padding: "0px", width:"120px"}}>
      <p className='coltext'>Quota(€)</p>
      </div>
      <div className='col' style={{padding: "0px"}}>
      <p className='coltext'>Note</p>
      </div>
      <div className="col"></div>
    </div>

    <div className="scroll">
    {Progress == false && 
  <div style={{marginTop: "14px"}}>
      <CircularProgress />
  </div>
      }

        {todos.map((todo) => (
          <div key={todo.id}>
          {todo.dataScal === dateEli && ta === true &&(

          <Todo
            key={todo.id}
            todo={todo}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            flagStampa= {flagStampa}
          />
           )}
          </div>
        ))}
        </div>
        <hr style={{margin: "0"}}/>
      </div>


    </>
      )
}
export default Scalet;
