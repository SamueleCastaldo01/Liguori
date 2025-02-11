import React, { useEffect, useState, useRef } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, where, getDocs, orderBy, serverTimestamp} from 'firebase/firestore';
import { useReactToPrint } from 'react-to-print';
import moment from 'moment';
import { TextField } from '@mui/material';
import { auth, db } from "../firebase-config";
import useMediaQuery from '@mui/material/useMediaQuery';
import { AutoCompProd } from '../components/TodoClient';
import { ToastContainer, toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { notifyError } from '../components/Notify';
import Todo from '../components/Todo';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {notifyErrorProd, notifyUpdateProd, notifyErrorPrezzoUni, notifyErrorProdList } from '../components/Notify';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import { AutoComp } from './ScaletData';
import { supa } from '../components/utenti';
import { guid } from '../components/utenti';
import { tutti } from '../components/utenti';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import TodoProdClin from '../components/TodoProdClin';
import ShareIcon from '@mui/icons-material/Share';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';

export const dataProdotto = [];  //in questo caso viene salvato il valore anche quando cambio pagina

function DashClienti({ clientId, nomeCli, getNotaDash }) {

  const [todos, setTodos] = React.useState([]);
  const [todosOrdChiu, setTodosOrdChiu] = React.useState([]);
  const [todosNotaBlock, setTodosNotaBlock] = React.useState([]);
  const [todosProdotto, setTodosProdotto] = React.useState([]);

  const timeElapsed = Date.now();  //prende la data attuale in millisecondi
  const today = new Date(timeElapsed);    //converte
  const [day, setday] = React.useState("");

  const [Progress, setProgress] = React.useState(false);

  const [sommaTotIncasso, setSommaTotIncasso] = React.useState(0);
  const [sommaTotVendita, setSommaTotVendita] = React.useState(0);

  const [flagRicercaProd, setFlagRicercaProd] = React.useState(false);
  const [AutoProd, setAutoProd] = React.useState(localStorage.getItem("AutoProd"));

  const componentRef = useRef();  //serve per la stampa
  let navigate = useNavigate();

  const [flagTabellaProdotti, setFlagTabellaProdotti] = useState(false);  
  const [FlagStampa, setFlagStampa] = useState(false);

  const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone
  const [popupActive, setPopupActive] = useState(false); 

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

    const [searchTerm, setSearchTerm] = useState("");  //search
    const inputRef= useRef();


    function handleInputChange(event, value) {
      localStorage.setItem("AutoProd", value);
      setAutoProd(value)
      var flag;
      dataProdotto.length = 0   //qui va ad azzerrare l'aray
      todosNotaBlock.map((nice) => {    //vado a prendere le date di quel prodotto
        flag= false;  //riazzera il flag
        if ( value == nice.prodottoC && nomeCli == nice.nomeC) {   //se il prodotto è uguale ad una nota vado a prendere la data di quella nota
          dataProdotto.map((nice2) => {   //controllo data uguale, cambia il falg se trova la stessa data
            if (nice2.dataProd == nice.dataC) {  //qui va a verificare che questa data non è presenete gia nell'array dataProdotto, se è diversa allora salva la trupla
              flag=true;   //Se questo diventa true allora la quella data non verrà messa nell'array, perché è uguale a già un altra data che è stata già inserita
            }
          })
          if(flag == false) {    //va ad aggiungere la trupla
            let car = { dataProd: nice.dataC }  //mi vado a salvare la data nell'array
            dataProdotto.push(car);   //inserisce la trupla nell'aray di oggetti
          }
        }
      })
  }

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
          handleDelete(localStorage.getItem("IdProdClin") );
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
  React.useEffect(() => {   //mi serve per la tabella ordini chiusi
    const collectionRef = collection(db, "addNota");
    const q = query(collectionRef, where("completa", "==", "2"), orderBy("data", "desc"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setTodosOrdChiu(todosArray);
      setProgress(true);
      today.setDate(today.getDate() - 31);   //fa la differenza rispetto al valore del select sottraendo, il risultato sarà in millisecondi
      localStorage.setItem("bho4", today.getTime())
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {   //mi serve per la tabella ordini chiusi
    SommaTot()
  }, [todosOrdChiu, day]);

  React.useEffect(() => {   //mi serve per la tabella ordini chiusi
    SommaTot()
  }, [todosOrdChiu, day]);
//********************************************************************************** */
  React.useEffect(() => {   //mi serve per creare l'array dataProdotto;
    const collectionRef = collection(db, "NotaBloccata");  //va a prendere le note bloccate
    const q = query(collectionRef, where("nomeC", "==", nomeCli));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setTodosNotaBlock(todosArray);
    });
    return () => unsub();
  }, [flagRicercaProd == true]);


  React.useEffect(() => {   //mi serve per l'autocomplete della ricerca per prodotti
    const collectionRef = collection(db, "prodotto");
    const q = query(collectionRef, orderBy("nomeP"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setTodosProdotto(todosArray);
    });
    return () => unsub();
  }, [flagRicercaProd == true]);
    //**************************************************************************** */

    const handleChangeDataSelect = (event) => {
      setday(event.target.value);      //prende il valore del select
      var ok= event.target.value
      today.setDate(today.getDate() - ok);   //fa la differenza rispetto al valore del select sottraendo
       localStorage.setItem("bho4", today.getTime())
    };

    const SommaTot = async () => {  //fa la somma totale, di tutti i prezzi totali
      var sommaTotIncasso=0;
      var sommaTotVendita=0;
        todosOrdChiu.map((nice) => {
          if (nomeCli == nice.nomeC && nice.dataMilli >= localStorage.getItem("bho4")) {   //se il nome della tinta è uguale ad un prodotto dell'array allora si prende il prezzo unitario
            sommaTotIncasso=+nice.quota + sommaTotIncasso;   // va a fare la somma totale
             sommaTotVendita=+nice.sommaTotale + sommaTotVendita;   // va a fare la somma totale
          }
        })
      var somTruncIncasso = sommaTotIncasso.toFixed(2);
      var SommaTruncVendita = sommaTotVendita.toFixed(2)
    
      setSommaTotIncasso(somTruncIncasso);
      setSommaTotVendita(SommaTruncVendita);
      }

  //*********Stampa******************************************************************* */
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
  //**************************************************************************** */
    const handleDelete = async (id) => {
      await deleteDoc(doc(db, "prodottoClin", id));
    };

//*************************************************************************** */
//      INTERFACCIA
//*********************************************************************************** */

      return ( 
      <> 
    {/**************NAVBAR MOBILE*************************************** */}
    <div className='navMobile row'>
      <div className='col-2'>
        <IconButton className="buttonArrow" aria-label="delete" sx={{ color: "#f6f6f6", marginTop: "7px" }}
        onClick={ ()=> {navigate("/listaclienti"); }}>
        <ArrowBackIcon sx={{ fontSize: 30 }}/>
      </IconButton>
      </div>
      <div className='col' style={{padding: 0}}>
      <p className='navText'> Dashboard Clienti </p>
      </div>
      </div>

      <motion.div
        initial= {{x: "-100vw"}}
        animate= {{x: 0}}
        transition={{ duration: 0.4 }}
       >


  {!matches &&
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate("/listaclienti")}}>
      <ArrowBackIcon id="i" /></button> 
  }

      {!matches ? <h1 className='title mt-3'> Dashboard Clienti</h1> : <div style={{marginBottom:"60px"}}></div>} 
        <h4 className='mt-3'>Nome Cliente: {nomeCli} </h4>

      <div>
        <span><button >Debito </button></span>
        <span><button onClick={() => {setFlagRicercaProd(!flagRicercaProd)}}>Ricerca per prodotto </button></span>
      </div>

  {flagRicercaProd == true &&
  <div style={{width: "500px", margin: "0 auto", marginTop: "20px"}}>
    <Autocomplete
        freeSolo
      value={AutoProd}
      options={todosProdotto.map((option) => option.nomeP)}
      onInputChange={handleInputChange}
      componentsProps={{ popper: { style: { width: 'fit-content' } } }}
      renderInput={(params) => <TextField {...params} label="Seleziona il prodotto" />}/> </div>
  }

{/*************Tabella ordini chiusi******************************************* */}
<div ref={componentRef} className='todo_containerProdCli mt-3'>
<div className='row' > 
<div className='col-5'>
<p className='colTextTitle'> Ordini Chiusi</p>
<p className='coltext' style={{color: "black"}}> {nomeCli} </p>
</div>
    <div className='col-5'>
      <FormControl >
        <InputLabel id="demo-simple-select-label"></InputLabel>
          <Select sx={{height:39, marginLeft:-1, width: 200}}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            defaultValue={31}
            onChange={handleChangeDataSelect}>
              <MenuItem value={8}>Ultimi 7 giorni</MenuItem>
              <MenuItem value={31}>Ultimi 30 giorni</MenuItem>
              <MenuItem value={91}>Ultimi 90 giorni</MenuItem>
              <MenuItem value={366}>Ultimi 365 giorni</MenuItem>
           </Select>
        </FormControl>
    </div>
    <div className='col-2'>
      <button onClick={print}> <ShareIcon/> </button>
    </div>
</div>
    <div className='row mt-1' style={{padding: "0px"}}>
<div className='col-2'></div>
    <div className='col' style={{padding: "0px"}}>
    <span><h6> Tot. Incasso: {sommaTotIncasso} </h6></span>
    </div>
    <div className='col' style={{padding: "0px"}}>
    <span><h6> Tot. Vendita: {sommaTotVendita} </h6></span>
      </div>
    </div>

<div className='row' style={{marginRight: "5px"}}>

<div className='col' >
<p className='coltext' >Data</p>
</div>
<div className='col' style={{padding: "0px"}}>
<p className='coltext' >Incasso(€)</p>
</div>
<div className='col' style={{padding: "0px"}}>
<p className='coltext' >Vendita(€)</p>
</div>
    <hr style={{margin: "0"}}/>
</div>
  {Progress == false && 
  <div style={{marginTop: "14px"}}>
      <CircularProgress />
  </div>
      }
{/**********filtro per ricerca del prodotto se è presente nell'autocomplete********************************** */}
{(AutoProd && flagRicercaProd == true) &&  
<>
  { dataProdotto.map((dtPrd) => (
  <>
  <div key={dtPrd.id}>
  {todosOrdChiu.map((todo) => (
    <div key={todo.id}>
    {dtPrd.dataProd == todo.data && todo.nomeC == nomeCli && todo.dataMilli >= localStorage.getItem("bho4") && 
    <div className='row' style={{padding: "0px"}}   
                  onClick={() => {
                  getNotaDash(todo.id, todo.nomeC, todo.data)
                  navigate('/notadashcliente/'+todo.nomeC+"/"+todo.data);
                         }}>
      <div className='col diviCol'><p className='inpTab'>{todo.data} </p> </div>
      <div className='col diviCol'><p className='inpTab'> {todo.quota} </p> </div>
      <div className='col diviCol' style={{padding: "0px"}}><p className='inpTab'>{todo.sommaTotale}</p></div>
      <hr style={{margin: "0"}}/>
    </div>
    }
    </div>
  ))}
  </div>
  </>
)) }
</>
}
{/**********filtro per data, nel caso in cui non è presente il prodotto nell'autocomplete********************************** */}
{(!AutoProd || flagRicercaProd == false) &&
<>
{todosOrdChiu.map((todo) => (
    <div key={todo.id}>
    { todo.nomeC == nomeCli && todo.dataMilli >= localStorage.getItem("bho4") && 
    <div className='row' style={{padding: "0px"}}   
                  onClick={() => {
                  getNotaDash(todo.id, todo.nomeC, todo.data)
                  navigate('/notadashcliente/'+todo.nomeC+"/"+todo.data);
                         }}>
      <div className='col diviCol'><p className='inpTab'>{todo.data} </p> </div>
      <div className='col diviCol'><p className='inpTab'> {todo.quota} </p> </div>
      <div className='col diviCol' style={{padding: "0px"}}><p className='inpTab'>{todo.sommaTotale}</p></div>
      <hr style={{margin: "0"}}/>
    </div>
    }
    </div>
  ))}
</>
}
  </div>
  </motion.div> 
      </>
        )
  }
  export default DashClienti;
  