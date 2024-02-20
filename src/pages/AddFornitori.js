import React, { useEffect, useState, useRef } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, orderBy, where, getDocs} from 'firebase/firestore';
import TextField from '@mui/material/TextField';
import { useMediaQuery } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { auth, db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { notifyErrorCliEm, notifyUpdateCli, notifyErrorCliList } from '../components/Notify';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { supa } from '../components/utenti';
import { guid } from '../components/utenti';
import { tutti } from '../components/utenti';
import InputAdornment from '@mui/material/InputAdornment';
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from '@mui/icons-material/Search';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { motion } from 'framer-motion';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export const AutoCompScorta = [];

function AddFornitori( {getFornId} ) {

  const [todos, setTodos] = React.useState([]);

  const [indirizzoLink, setIndirizzoLink] = React.useState("");
  const [nomeF, setnomeF] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [flagDelete, setFlagDelete] = useState(false); 

  const [deb1, setDeb1] = React.useState("");
  const [deb2, setDeb2] = React.useState("");
  const [deb3, setDeb3] = React.useState("");
  const [deb4, setDeb4] = React.useState("");

  const [alignment, setAlignment] = React.useState('scorta');

  const [popupActive, setPopupActive] = useState(false);
  const [flagAnaCli, setFlagAnaCli] = useState(true);   
  const [flagDebiCli, setFlagDebiCli] = useState(false);  

  const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone

  const [searchTerm, setSearchTerm] = useState("");  //search
  const inputRef= useRef();

  //permessi utente
  let sup= supa.includes(localStorage.getItem("uid"))
  let gui= guid.includes(localStorage.getItem("uid"))
  let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

  let navigate = useNavigate();
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
          handleDelete(localStorage.getItem("IDForn") );
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

const auto = async () => {
  const q = query(collection(db, "prodotto"));
  const querySnapshot = await  getDocs(q);
  querySnapshot.forEach((doc) => {
    console.log(doc.data().nomeP)
  let car = { label: doc.data().nomeP }
  AutoCompScorta.push(car);
  });
  }

  const handleChangeTogg = (event) => {
    setAlignment(event.target.value);
  };
//********************************************************************************** */
      //Anagrafiche
React.useEffect(() => {
    const collectionRef = collection(db, "fornitore");
    const q = query(collectionRef, orderBy("nomeF"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setTodos(todosArray);
    });
    return () => unsub();

  }, []);
 //******************************************************************************* */
  //speed
  function handleButtonDebito() {
    setFlagAnaCli(false)
    setFlagDebiCli(true)
  } 

  function handleButtonAna() {
    setFlagAnaCli(true)
    setFlagDebiCli(false)
  } 

 //******************************************************************************* */
    //funzione che permette il caricamento automatico dell'aggiunta del prodotto personalizzato
 const handleProdClien = async () => {    //funzione che si attiva quando si aggiunge un prodotto a scorta
  console.log("ciaaao");
  const q = query(collection(db, "prodotto"));  //prendo tutti i prodotti che si trovano in scorta
  const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      console.log(doc.id, " => ", doc.data().nomeP, doc.data().prezzoIndi);
      await addDoc(collection(db, "prodottoClin"), {
        author: { name: nomeF, id: "bho" },
        nomeP: doc.data().nomeP,
        prezzoUnitario: doc.data().prezzoIndi
      })
      });
 }  
  //******************************************************************************* */
 const handleSubmit = async (e, id) => {   //creazione cliente
    e.preventDefault();
    var bol= true
    if(!nomeF) {            
      notifyErrorCliEm();
      toast.clearWaitingQueue(); 
      return 
    }   //serve per non fa inserire due volte lo stesso fornitore, serve per renderlo univoco
    const q = query(collection(db, "fornitore"), where("nomeF", "==", nomeF));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data().nomeF);
    if (doc.data().nomeF == nomeF) {    //se ha trovato lo stesso nome all'interno del database bol è falso
        notifyErrorCliList()
         toast.clearWaitingQueue(); 
        bol=false
    }
    });
    if(bol == true) {   //bol deve essere vero per poter creare un nuovo utente
      handleProdClien();
      await addDoc(collection(db, "fornitore"), {
        nomeF,
        email,
      });
      setnomeF("");
      setEmail("");
    }
  };
//****************************************************************************************** */

  const handleDelete = async (id) => {
    const colDoc = doc(db, "fornitore", id); 
     
  //elimina tutti i dati di prodottoClin con lo stesso nome del Cliente     elimina tutti gli articoli di quel cliente
/*  const q = query(collection(db, "prodottoClin"), where("author.name", "==", localStorage.getItem("nomeFliProd")));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (hi) => {
  // doc.data() is never undefined for query doc snapshots
    console.log(hi.id, " => ", hi.data().nomeF, hi.data().dataScal);
    await deleteDoc(doc(db, "prodottoClin", hi.id)); 
    });   */

    //infine elimina la data
    await deleteDoc(colDoc); 
  };
//**************************************************************************** */
//                              NICE
//********************************************************************************** */
    return ( 
    <>  
    <motion.div
        initial= {{opacity: 0}}
        animate= {{opacity: 1}}
        transition={{ duration: 0.7 }}>
    
    {!matches && 
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate(-1)}}>
      <ArrowBackIcon id="i" /></button> 
    }

    {!matches ? <h1 className='title mt-3'>Lista Fornitori</h1> : <div style={{marginBottom:"60px"}}></div>} 

      <ToggleButtonGroup
      color="primary"
      value={alignment}
      exclusive
      onChange={handleChangeTogg}
      aria-label="Platform"
    > 
    {sup == true &&<Button onClick={() => { setPopupActive(true) }} size="small" variant="contained">Aggiungi Fornitore</Button>}
      {sup == true && <Button onClick={() => {setFlagDelete(!flagDelete)}} color="error" variant="contained">elimina</Button> }
    </ToggleButtonGroup>


    {sup ===true && (
        <>    
 
{/** inserimento cliente **************************************************************************/}
{popupActive &&
      <div> 
      <form onSubmit={handleSubmit} className='formForni'>
      <div className='divClose'>  <button type='button' className="button-close float-end" onClick={() => { setPopupActive(false); }}>
              <CloseIcon id="i" />
              </button> </div>
      <div className="input_container">
      <TextField className='inpCli mt-2 me-2' label="Nome Fornitore" variant="outlined"  autoComplete='off' value={nomeF} 
        onChange={(e) => setnomeF(e.target.value)}/>
      <TextField type="email" className='inpCli mt-2 me-2' label="email Fornitore" variant="outlined"  autoComplete='off' value={email} 
        onChange={(e) => setEmail(e.target.value)}/>
      </div>
      <div className="btn_container">
      <Button type='submit'  variant="outlined" >Aggiungi</Button>
      </div>
    </form>
    </div>
  } 
    </>
    )}


{/********************tabella Anagrafiche fornitori************************************************************************/}
{flagAnaCli &&
<div className='todo_containerFor mt-5'>
<div className='row'> 
<div className='col-5'>
<p className='colTextTitle'> Lista Fornitori</p>
</div>
<div className='col'>
<TextField
      inputRef={inputRef}
      className="inputSearch"
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

</div>
<div className='row'>
<div className='col-4' >
<p className='coltext' >Fornitore</p>
</div>
<div className='col-6' >
<p className='coltext' >Email</p>
</div>
</div>
<hr style={{margin: "0"}}/>
<div className="scroll">
{todos.filter((val)=> {
        if(searchTerm === ""){
          return val
      } else if (val.nomeF.toLowerCase().includes(searchTerm.toLowerCase()) ) {
        return val
                }
            }).map((todo) => (
    <div key={todo.id}>
    <div className='row diviCol1'>
        <div className='col-4 diviCol'>
            <h4 className='inpTab'   onClick={() => {
            getFornId(todo.id, todo.nomeF)
            navigate("/dashfornitore");
            auto();
            AutoCompScorta.length = 0
                            }}> {todo.nomeF} </h4>
        </div>
        <div className='col-5 diviCol'>
          <h4 className='inpTab'> {todo.email}</h4>
        </div>
        <div className="col colIcon" style={{padding:"0px", marginTop:"8px"}}  onClick={() => {
            getFornId(todo.id, todo.nomeF)
            navigate("/dashfornitore");
            auto();
            AutoCompScorta.length = 0
                            }}>  
                        <NavigateNextIcon/>          
        </div>
        {flagDelete &&
        <div className='col diviCol' style={{padding:"0px", marginTop:"-8px"}}>
        <button type="reset" className="button-delete"                          
          onClick={() => {
                localStorage.setItem("IDForn", todo.id);
                    displayMsg();
                    toast.clearWaitingQueue(); 
                            }}>
          <DeleteIcon id="i" />
        </button>
        </div>
          }
    </div>
        
        <hr style={{margin: "0"}}/>
    </div>
  ))}
  </div>

  </div>
  }
  </motion.div>
    </>
      )
}
export default AddFornitori;
