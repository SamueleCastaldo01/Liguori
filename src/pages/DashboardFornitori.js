import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, where, getDocs, orderBy, serverTimestamp} from 'firebase/firestore';
import moment from 'moment';
import { TextField } from '@mui/material';
import { auth, db } from "../firebase-config";
import useMediaQuery from '@mui/material/useMediaQuery';
import { AutoCompScorta } from './AddFornitori';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TodoProdForn from '../components/todoProdForn';
import { motion } from 'framer-motion';


function DashFornitori({ fornId, nomeForn }) {

  const [todos, setTodos] = React.useState([]);
  const [nomeP, setNomeP] = React.useState("");

  const [flagTabellaProdotti, setFlagTabellaProdotti] = useState(false);  

  const matches = useMediaQuery('(max-width:600px)');  //media query true se è uno smartphone
  const [popupActive, setPopupActive] = useState(false); 

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

    let navigate = useNavigate();

    function handleInputChange(event, value) {
      setNomeP(value)
    }
    function handleSpeedAddProd() {
      setPopupActive(true)
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
          handleDelete(localStorage.getItem("IdProdFor") );
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
  const caricaProdottiForn = () => {
    const collectionRef = collection(db, "prodottoForn");
    const q = query(collectionRef, where("author.name", "==", nomeForn), orderBy("nomeP"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setTodos(todosArray);
    });
    return () => unsub();
  }

  React.useEffect(() => {
    caricaProdottiForn()
  }, []);
    //**************************************************************************** */
    const handleDelete = async (id) => {
      console.log("bhooooo")
      await deleteDoc(doc(db, "prodottoForn", id));
    };
    //****************************************************************************************** */
    const handleEdit = async ( todo, nome, prezUni) => {
      await updateDoc(doc(db, "prodottoForn", todo.id), { nomeP: nome, prezzoUnitario:prezUni});
      notifyUpdateProd();
      toast.clearWaitingQueue(); 
    };
 //******************************************************************************* */
 const handleSubmit = async (e) => {   //creazione prodotto Cliente
  var bol= true
  e.preventDefault();
  if(!nomeP) {            
    notifyErrorProd();
    toast.clearWaitingQueue(); 
    return 
  }
            //serve per non far inserire due volte lo stesso prodotto
  const q = query(collection(db, "prodottoForn"), where("nomeP", "==", nomeP), where("author.id", "==" , fornId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
// doc.data() is never undefined for query doc snapshots
  console.log(doc.id, " => ", doc.data().nomeP);
  if (doc.data().nomeP == nomeP) {
       toast.clearWaitingQueue(); 
      bol=false
  }
  });
  if(bol == true) {
    await addDoc(collection(db, "prodottoForn"), {
      nomeP,
      author: { name: nomeForn, id: fornId }
    });
    setNomeP("");
    caricaProdottiForn();
  }
};
//*************************************************************************** */
//      INTERFACCIA
//*********************************************************************************** */

      return ( 
      <>  
    <motion.div
          initial= {{x: "-100vw"}}
        animate= {{x: 0}}
        transition={{ duration: 0.4 }}>
      <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate("/listafornitori")}}>
      <ArrowBackIcon id="i" /></button> 
        <h1 className='title mt-3'> Dashboard Fornitori</h1>
        <h2 className='mt-4'>Nome Fornitore: {nomeForn} </h2>

        {!matches &&
      <div>
        <span><button onClick={handleSpeedAddProd}>Aggiungi Prodotto </button></span>
        <span><button onClick={() => { setFlagTabellaProdotti(!flagTabellaProdotti) }}>Tabella Prodotti </button></span>
      </div>
    }

        {sup ===true && (
        <>    
{/** Aggiungi Prodotto **************************************************************************/}
{popupActive &&
      <div> 
      <form className='formCli' onSubmit={handleSubmit}>
      <div className='divClose mb-2'>  <button type='button' className="button-close float-end" onClick={() => { setPopupActive(false); }}>
              <CloseIcon id="i" />
              </button> </div>
      <div className="input_container">
      <Autocomplete
      value={nomeP}
      options={AutoCompScorta}
      onInputChange={handleInputChange}
      componentsProps={{ popper: { style: { width: 'fit-content' } } }}
      renderInput={(params) => <TextField {...params} label="Prodotto" />}
    />
      </div>
      <div className="btn_container">
      <Button  type='submit' variant="outlined" >Aggiungi Prodotto del Fornitore </Button>
      </div>
    </form>
    </div>
  } 
    </>
    )}
{/** tabella prodotti *****************************************************************************************************************/}
{flagTabellaProdotti &&
<>

<div className='todo_containerProdCli mt-5 '>
<div className='row'>

<div className='col-9' >
<p className='coltext' style={{textAlign: "left", fontSize: "18px"}}>Prodotto</p>
</div>
</div>

<div className="scroll">
  {todos.map((todo) => (
    <div key={todo.id}>
    {todo.author.name  === nomeForn &&  (
      <>
    { ta === true &&(
    <TodoProdForn
      key={todo.id}
      todo={todo}
      handleEdit={handleEdit}
      displayMsg={displayMsg}
    />
     )}
     </>
                  )}
    </div>
  ))}
  </div>
  <hr style={{margin: "0"}}/>
  </div>
  </>
}
</motion.div>
      </>
        )
  }
  export default DashFornitori;