import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, where, getDocs, orderBy, serverTimestamp} from 'firebase/firestore';
import { useRef } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useReactToPrint } from 'react-to-print';
import moment from 'moment';
import TodoNota from '../components/TodoNota';
import TodoNotaForni from '../components/TodoNotaForni';
import { getCountFromServer } from 'firebase/firestore';
import { TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { notifyUpdateProd, notifyUpdateNota, notifyUpdateDebRes} from '../components/Notify';
import { WhatsappShareButton, WhatsappIcon, EmailShareButton, EmailIcon } from 'react-share';
import { useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { supa, guid, tutti, flagStampa } from '../components/utenti';



function NotaForni({notaId, nomeForni, dataNota, dataNotaC }) {

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

    const { id } = useParams();
    const { nome } = useParams();
    const { data } = useParams();

    const [todosNota, setTodosNota] = React.useState([]);
    const [todos, setTodos] = React.useState([]);
    const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone
    let navigate = useNavigate();

    const string = "https://logic-2220e.web.app/notaforni/"+id+"/"+nome+"/"+data;
    const url = string.replace(/ /g, '%20');  //conversione da stringa a url

    var FlagT=false;   //flag per le tinte, viene salvato nel database serve per far riconoscere ogni singola trupla
    const [flagStampa, setFlagStampa] = React.useState(false);  //quando è falso si vedono le icone,
    const [flagProdFor, setFlagProdForn] = React.useState(false);  //quando è falso si vedono le icone,
   
    const [sumTot, setSumTot] =React.useState("");

    const [Progress, setProgress] = React.useState(false);
    const componentRef = useRef();  //serve per la stampa
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
          handleDelete(localStorage.getItem("IDNOTa"));
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
//_________________________________________________________________________________________________________________
const SomAsc = async () => {
  var sommaTot=0;
  const q = query(collection(db, "Nota"), where("nomeC", "==", nome), where("dataC", "==", data));
  const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      console.log(doc.id, "heeey", " => ", doc.data().nomeC, doc.data().dataC, doc.data().prezzoUniProd);
      sommaTot=+doc.data().prezzoTotProd +sommaTot;
      });
      setSumTot(sommaTot);
      await updateDoc(doc(db, "addNota", id), { sommaTotale:sommaTot});  //aggiorna la somma totale nell'add nota
}

//********************************************************************************** */
    const cliEffect = async () => {  //funzione per l'anagrafica del cliente
      const collectionRef = collection(db, "clin");
        //aggiorna il contatore di tutti i dati di addNota della stessa data
        const q = query(collectionRef, where("nomeC", "==", nome));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (hi) => {
        });
        
    }
//********************************************************************************** */
  
     React.useEffect(() => {
        const collectionRef = collection(db, "notaForni");
        const q = query(collectionRef, orderBy("createdAt"));
        const unsub = onSnapshot(q, (querySnapshot) => {
          let todosArray = [];
          querySnapshot.forEach((doc) => {
            todosArray.push({ ...doc.data(), id: doc.id });
          });
          setTodos(todosArray);
          setProgress(true);
        });
        cliEffect();
        SomAsc();
        localStorage.removeItem("NotaForniId");
        return () => unsub();
      }, []);


    //prodotti fornitori, questa viene attiva una sola volta
      React.useEffect(() => {
        const collectionRef = collection(db, "prodottoForn");
        const q = query(collectionRef);
    
        const unsub = onSnapshot(q, (querySnapshot) => {
          let todosArray = [];
          querySnapshot.forEach((doc) => {
            todosArray.push({ ...doc.data(), id: doc.id });
          });
          setTodosNota(todosArray);
        });
        return () => unsub();
      }, [flagProdFor]);
//********************************************************************************** */
const createCate = async () => {
  await addDoc(collection(db, "notaForni"), {
    data: data,
    nomeF: nome,
    nomeP: "",
    quantita: 1,
    createdAt: serverTimestamp(),
  });
};
//_________________________________________________________________________________________________________________
const handleEdit = async ( todo, qt, prod) => {
  await updateDoc(doc(db, "notaForni", todo.id), 
  { quantita: qt, nomeP: prod});
  notifyUpdateProd();
  toast.clearWaitingQueue(); 
};


const handleRefresh = async ( ) => {
  var flagPresNota = false
  const collectionRef = collection(db, "prodotto");
  //ci sono due cicli dentro un cicolo.    Il primo serve per vedere se ci sono i gli stessi prodotti presenti nella nota, il secondo serve per prendere i valori dei prodotti
todosNota.map( async (todo) => {    //ciclo princiale sui prodotti del fornitore
  todos.map((tdPrdNot) => {  //primo ciclo per vedere i prodotti presenti nella nota
    console.log("tutti i prodotti"+ todo.nomeP)
    if (todo.nomeP == tdPrdNot.nomeP && todo.author.name == nome) {  //se trova questo prodotto nella nota, allora il flag cambia e non va ad inserire il prodotto nella nota
      flagPresNota = true 
      console.log("truee")
      console.log(todo.nomeP)
    }
  } )
 if(flagPresNota == false) {  //qui inizia il seconodo ciclo nel ciclo
  if(todo.author.name == nome ) { //vado a prendere solo i prodotti dei quel fornitore che sto andando a inserire
    const q = query(collectionRef, where("nomeP", "==", todo.nomeP));  // va a prendere lo stesso prodotto, vado a prendere i dati di quel prodotto
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (hi) => {   //questo è il ciclo for della query, dove vado nella scorta
      if (hi.data().quantita < hi.data().sottoScorta) {  //se la quantità è minore della sottoscorta allora aggiunte il prodotto alla lista
        await addDoc(collection(db, "notaForni"), {
          nomeF: nome,
          data: data,
          nomeP: todo.nomeP,
          quantita: hi.data().quantitaOrdinabile,
          createdAt: serverTimestamp(),
        }); 
      }
    });
  }
}
 flagPresNota = false
})
};
//_________________________________________________________________________________________________________________
const handleDelete = async (id) => {
  const colDoc = doc(db, "notaForni", id); 
  //infine elimina la data
  await deleteDoc(colDoc); 
};
//_________________________________________________________________________________________________________________
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
//*************************************************************** */
//************************************************************** */
//          INTERFACE                                             /
//************************************************************** */
    return (  
        <>

{!matches && 
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate(-1)}}>
      <ArrowBackIcon id="i" /></button> 
    }

    {!matches ? <h1 className='title mt-3'>Nota Fornitore</h1> : <div style={{marginBottom:"60px"}}></div>} 


    <span><button onClick={print}>Stampa </button></span>

  {sup == true && 
      <>
      <span><button onClick={() => {
       FlagT=false
       console.log({FlagT})
        createCate()
      }}>Aggiungi Prodotto</button></span>
      <span><button onClick={handleRefresh}>Refresh</button></span>
  <WhatsappShareButton url={url}>
        <WhatsappIcon type="button" size={40} round={true} />
    </WhatsappShareButton>
    <EmailShareButton url={url}>
        <EmailIcon type="button" size={40} round={true} />
    </EmailShareButton>
    </>
}
    
    <div ref={componentRef} className="foglioA4" style={{paddingLeft:"50px", paddingRight:"50px", paddingTop:"20px"}}>
    <div className='row rigaNota' >
        <div className='col colNotaSini' style={{textAlign:"left", padding:"0px", paddingLeft:"0px"}}>
            <h3 className='mb-4'>{nome} </h3>
            
        </div>

        <div className='col'  style={{textAlign:"left", padding:"0px", marginLeft:"5px"}}>
        <h4>Data: {data} </h4>
    </div>
    </div>

    <div className='row rigaNota'>

    </div>
{/***********tabella visuallizza prodotto************************************************** */}
  <div className='row' style={{textAlign:"center", background:"#212529", color:"#f6f6f6"}}>
    <div className='col-1' style={{padding:"0px"}}>Qt</div>
    <div className='col-6' style={{padding:"0px"}}>Prodotto</div>
  </div>

{/** tabella dei prodotti */}
  <div className="scrollNota">
  {Progress == false && 
  <div style={{marginTop: "14px"}}>
      <CircularProgress />
  </div>
      }
  {todos.map((todo) => (
    <div key={todo.id}>
    {todo.nomeF  === nome && todo.data == data &&  (
      <>
    { ta === true &&(
    <TodoNotaForni
      key={todo.id}
      todo={todo}
      handleDelete={handleDelete}
      handleEdit={handleEdit}
      displayMsg={displayMsg}
      nomeForni={nome}
      flagStampa={flagStampa}
    />
     )}
     </>
                  )}
    </div>
  ))}
  </div>

    </div>
    </>
      )
}
export default NotaForni;