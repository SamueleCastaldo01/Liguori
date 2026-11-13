import React, { useEffect, useRef, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, where, getDocs, orderBy, serverTimestamp} from 'firebase/firestore';
import useMediaQuery from '@mui/material/useMediaQuery';
import moment from 'moment';
import { getCountFromServer } from 'firebase/firestore';
import { TextField } from '@mui/material';
import { db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { notifyErrorCli, notifyErrorCliEm } from '../components/Notify';
import Autocomplete from '@mui/material/Autocomplete';
import { AutoComp2 } from './OrdineForniData';
import { supa, guid, tutti } from '../components/utenti';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { motion } from 'framer-motion';


import { populateSupplierOrder } from '../utils/supplierOrders';

export const AutoProdForn = [];

function AddNotaForni({ ordId, dataOrd, dataOrdConf, getNotaForniId }) {
 
    const [todos, setTodos] = React.useState([]);
    const [creating, setCreating] = useState(false);
    const creatingRef = useRef(false);

    const [nomeF, setnomeF] = React.useState("");
    const [cont, setCont] = React.useState(1);
    const [flagDelete, setFlagDelete] = useState(false); 
  
    const [popupActive, setPopupActive] = useState(true);  
  
    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))   //confronto con uid corrente
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
  

    const matches = useMediaQuery('(max-width:600px)');  //media query true se è uno smartphone
  
    let navigate = useNavigate();
  
    function handleInputChange(event, value) {
      setnomeF(value)
    }

//_________________________________________________________________________________________________________________
    const auto = async (nomeFli) => {
      const q = query(collection(db, "prodottoForn"), where("author.name", "==", nomeFli));
      const snapshot = await getDocs(q);
      const names = [...new Set(snapshot.docs.map(entry => entry.data().nomeP).filter(Boolean))];
      AutoProdForn.splice(0, AutoProdForn.length, ...names.map(label => ({ label })));
    };
//_________________________________________________________________________________________________________________
const contEffect = async () => {
    console.log({dataOrdConf})
    const coll = collection(db, "addNotaForni");
    const q = query(coll, where("data", "==", dataOrdConf));
    const snapshot = await getCountFromServer(q);
    console.log('count: ', snapshot.data().count);
    setCont(snapshot.data().count+1)
  }

    function handleContAdd() {  // si attiva quando vado a creare un nuovo prodotto
        setCont(cont+1);
    }
    function handleContRem() {  // si attiva quando vado ad eliminare un prodotto
        setCont(cont-1);
    }
  
    const contUpdate = async ( dat) => { //si attiva quando viene eliminato un cliente
        var cn=0;
        console.log("sono entrato")
            const collectionRef = collection(db, "addNotaForni");
              //aggiorna il contatore di tutti i dati di addNotaForni della stessa data
              const q = query(collectionRef, where("data", "==", dat), orderBy("createdAt"));
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach(async (hi) => {
              await updateDoc(doc(db, "addNotaForni", hi.id), { cont: cn=cn+1});
              });
      };
 //_________________________________________________________________________________________________________________   
      const handleDebitoRes = async () => {   //funzione che viene richiamata quando si crea la nota
        var debRes=0;
        const q = query(collection(db, "debito"), where("nomeF", "==", nomeF));  //dobbiamo prendere d1, tramite nome del cliente
        const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            debRes=+doc.data().deb1 ;
            });
            localStorage.setItem("DebCli", debRes)
      }

    //_________________________________________________________________________________________________________________
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
            handleDelete(localStorage.getItem("OrdFornId"), localStorage.getItem("OrdnomeF"), localStorage.getItem("OrdData"));
            contUpdate(localStorage.getItem("OrdData"))
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
        setnomeF("");
        toast.dismiss();
        toast.clearWaitingQueue();}
  
  //********************************************************************************** */  
    React.useEffect(() => {
      const collectionRef = collection(db, "addNotaForni");
      const q = query(collectionRef, orderBy("cont"));
  
      const unsub = onSnapshot(q, (querySnapshot) => {
        let todosArray = [];
        querySnapshot.forEach((doc) => {
          todosArray.push({ ...doc.data(), id: doc.id });
        });
        setTodos(todosArray);
      });
      contEffect();
      localStorage.removeItem("OrdFornId");
      return () => unsub();
    }, []);


   //stampa
  function HandleSpeedAddScalClien() {
    setPopupActive(true);
  }
  /******************************************************************************* */
  const createCate = async (e) => {   //crezione nota nomefornitore, cont e data
    e.preventDefault();
    if (creatingRef.current) return;
    if (!nomeF.trim()) {
      notifyErrorCliEm();
      return;
    }
    creatingRef.current = true;
    setCreating(true);
    try {
      const q = query(collection(db, "addNotaForni"), where("nomeF", "==", nomeF), where("data", "==", dataOrdConf));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        notifyErrorCli();
        return;
      }
      await addDoc(collection(db, "addNotaForni"), {
        cont, nomeF, createdAt: serverTimestamp(), data: dataOrdConf,
      });
      handleContAdd();
      await populateSupplierOrder(nomeF, dataOrdConf);
      setClear();
    } catch (error) {
      console.error('Errore ordine automatico:', error);
      toast.error("Impossibile completare l'ordine automatico. Apri l'ordine e premi Aggiorna da scorte per riprovare.");
    } finally {
      creatingRef.current = false;
      setCreating(false);
    }
  };
    //_____________________________________________________________________________________
    const handleDelete = async (id, nomeFli, DataC) => {
      handleContRem();

      const colDoc = doc(db, "addNotaForni", id); 
    //elimina tutti i dati di notaForni di quel cliente con la stessa data
      const q = query(collection(db, "notaForni"), where("data", "==", DataC), where("nomeF", "==", nomeFli));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (hi) => {
      await deleteDoc(doc(db, "notaForni", hi.id)); 
      });
      //infine elimina la data di addNotaForni
      await deleteDoc(colDoc); 
    };
    //**************************************************************************** */
    const actions = [
      { icon: <PrintIcon />, name: 'Stampa'},
      { icon: <AddIcon />, name: 'Aggiungi Cliente', action: HandleSpeedAddScalClien },
    ];
  //**************************************************************************** */
  //                              NICE
  //********************************************************************************** */
      return ( 
      <>  
         <motion.div className=''
        initial= {{x: "-100vw"}}
        animate= {{x: 0}}
        transition={{ duration: 0.4 }}>
       <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate("/ordinefornitoridata")}}>
      <ArrowBackIcon id="i" /></button> 
          <h1 className='title mt-3'>Ordine Fornitori</h1>
          <h3 style={{fontSize: "20px"}}>{moment(dataOrd.toDate()).format("L")}</h3>
  
          {!matches &&
        <div>
          <span><button onClick={HandleSpeedAddScalClien}>Aggiungi Fornitore </button></span>
          <span><button onClick={() => {setFlagDelete(!flagDelete)}}>elimina</button></span>
          {/**<span><button onClick={() => {elimDb()}}>Prova</button></span> */} 
        </div>
      }
   {/************************INSERIMENTO CLIENTE********************************************************************/}       
      {sup ===true && (
          <>
      {popupActive &&     
          <div>  
        <form className='formAddNot' onSubmit={createCate}>
        
        <div className='divCloseSc'>  <button type='button' className="button-close float-end" onClick={() => { setPopupActive(false); }}>
                <CloseIcon id="i" />
                </button> </div>
        <div className="input_container">
        <Autocomplete
      value={nomeF}
      options={AutoComp2}
      onInputChange={handleInputChange}
      componentsProps={{ popper: { style: { width: 'fit-content' } } }}
      renderInput={(params) => <TextField {...params} label="Fornitore" />}
    />
            <div className="btn_container">
            <Button className='mt-3' type='submit' variant="outlined" disabled={creating}>{creating ? 'Creazione ordine…' : 'Aggiungi Fornitore'}</Button>
            </div>
  
        </div>
      </form>
      </div>
      }
      </>
      )}
  
  {/**************tabella********************************************************************************************************/}
      
        <div  className='todo_containerOrdCli mt-5'>
        <div className='row'> 
        <p className='colTextTitle'> Ordine Fornitore</p>
        </div>
        <div className='row'>
        <div className='col-1' >
        <p className='coltext'>N</p>
        </div>
        <div className='col-8' >
        <p className='coltext'>Fornitore</p>
        </div>
        
      </div>
      <hr style={{margin: "0"}}/>
       {todos.map((todo) => (
          <div key={todo.id}>
          {todo.data  === dataOrdConf &&  (
      <>
    <div className='row'>
        <div className='col-1 diviCol'>
            <p className="inpTab" style={{textAlign: "left"}}>{todo.cont}</p>
        </div>
         <div className='col-8 diviCol' 
          onClick={() => {
                getNotaForniId(todo.id, todo.nomeF, dataOrd, dataOrdConf)
                navigate("/notaforni/"+todo.id+"/"+todo.nomeF+"/"+dataOrdConf);
                auto(todo.nomeF);
                         }}>
             <p className="inpTab"  style={{textAlign: "left"}}>{todo.nomeF}</p>
        </div>
        <div className="col colIcon" style={{padding:"0px", marginTop:"8px"}}>  
                        <NavigateNextIcon/>          
        </div>
          {flagDelete &&
        <div className="col diviCol" style={{padding:"0px", marginTop:"-8px"}}>    
            <button
                className="button-delete"
                onClick={() => {
                localStorage.setItem("OrdFornId", todo.id);
                localStorage.setItem("OrdnomeF", todo.nomeF);
                localStorage.setItem("OrdData", todo.data);
                displayMsg();
                 toast.clearWaitingQueue(); 
                         }}>
                <DeleteIcon id="i" />
            </button>            
        </div>
      }
    </div>
    <hr style={{margin: "0"}}/>
             </>
                  )}
          </div>
        ))}

  
          
        </div>
        </motion.div>
      </>
        )
  }
export default AddNotaForni;