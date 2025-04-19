import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, getDoc, onSnapshot ,addDoc ,updateDoc, query, where, getDocs, orderBy, serverTimestamp, getCountFromServer, getDocsFromCache} from 'firebase/firestore';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import moment from 'moment';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import TodoNota from '../components/TodoNota';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from "@mui/icons-material/Delete";
import { auth, db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { IconButton } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { supa, guid, tutti, flagStampa, rosso } from '../components/utenti';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';

export const AutoProdCli = [];


function Nota({idCliente, notaId, cont, nomeCli, dataNota, nProd, dataNotaC, numCart, numBust, prezzoTotNota, debit, debTo, indirizzo, tel, iva, completa, idDebito }) {

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
    const [brandTinte, setBrandTinte] = useState([]);

    const [todos, setTodos] = React.useState([]);
    const [todosInOrdine, setTodosInOrdine] = React.useState([]);
    const [todosInSospeso, setTodosInSospeso] = React.useState([]);

    const [updateProdo, setUpdateProd] = React.useState(0);

    let navigate = useNavigate();

    const [Progress, setProgress] = React.useState(false);

    const [prodottoC, setProdottoC] = React.useState("");
    const [notaIddo, setnotaIddo] = React.useState(notaId);
    const [numProd, setNumProd] = React.useState(nProd);
    const [t1, setT1] = React.useState("");   //tinte, che dentro una trupla ci possono essere massimo 5
    const [t2, setT2] = React.useState("");
    const [t3, setT3] = React.useState("");
    const [t4, setT4] = React.useState("");
    const [t5, setT5] = React.useState("");
    const [nomTin, setnomTin] = React.useState("");

    const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone
    const [alignment, setAlignment] = React.useState('scorta');

    const timeElapsed = Date.now();  //prende la data attuale in millisecondi
    const today = new Date(timeElapsed);    //converte da millisecondi a data

    var FlagT=false;   //flag per le tinte, viene salvato nel database serve per far riconoscere ogni singola trupla
    const [flagStampa, setFlagStampa] = React.useState(false);  //quando è falso si vedono le icone,

    const [flagInOrdine, setFlagInOrdine] = React.useState(false);  //quando è falso si vedono le icone
    const [flagInSospeso, setFlagInSospeso] = React.useState(false);  //quando è falso si vedono le icone,

    const [NumCart, setNumCart] = React.useState(numCart);
    const [NumBuste, setNumBuste] = React.useState(numBust);
    const [Completa, setCompleta] = useState(completa);
   
    const [sumTot, setSumTot] =React.useState(prezzoTotNota);
    const [debitoTot, setDebTot] = React.useState(debTo);
    const [debitoRes, setDebitoRes] = React.useState(debit);

    const [qtProdotto, setQtProdotto] = React.useState("1");
    const [prezzoUniProd, setprezzoUniProd] = React.useState("");
    const [prezzoTotProd, setprezzoTotProd] = React.useState("");

    const componentRef = useRef();  //serve per la stampa

    const sharePdf = async () => {
      setFlagStampa(true);
      try {
        // Cattura il contenuto del div
        const canvas = await html2canvas(componentRef.current, { useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        
        // Crea il PDF con jsPDF
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // Ottieni il blob del PDF
        const pdfBlob = pdf.output('blob');
        const file = new File([pdfBlob], 'nota.pdf', { type: 'application/pdf' });
  
        // Controlla se il browser supporta la condivisione di file
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Nota in PDF',
            text: 'Ecco la nota in formato PDF',
          });
          console.log('Condiviso con successo');
        } else {
          // Fallback: ad esempio, fornisci il download del file
          const downloadUrl = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = 'nota.pdf';
          link.click();
          URL.revokeObjectURL(downloadUrl);
          alert('La condivisione dei file non è supportata in questo browser. Il PDF è stato scaricato.');
        }
      } catch (error) {
        console.error('Errore durante la creazione o la condivisione del PDF:', error);
      } finally {
        // Ripristina il flag a false
        setFlagStampa(false);
      }
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
          handleDelete(localStorage.getItem("IDNOTa"));
        }

        else if(localStorage.getItem("flagRemove") == 1 ) {
          handleDeleteInOrdine(localStorage.getItem("IDNOTa"));
        }

        else if(localStorage.getItem("flagRemove")  == 2) {
          handleDeleteInSospeso(localStorage.getItem("IDNOTa"));
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
//_________________________________________________________________________________________________________________
const SommaTot = async () => {  //fa la somma totale, di tutti i prezzi totali
  var sommaTot=0;
    todos.map((nice) => {
      if (nomeCli == nice.nomeC && dataNotaC==nice.dataC) {   //se il nome della tinta è uguale ad un prodotto dell'array allora si prende il prezzo unitario
         sommaTot=+nice.prezzoTotProd + sommaTot;   // va a fare la somma totale
      }
    })
  var somTrunc = sommaTot.toFixed(2);

  setSumTot(somTrunc);
  localStorage.setItem("sumTotNota", somTrunc);
  await updateDoc(doc(db, "addNota", notaId), { sommaTotale: somTrunc});  //aggiorna la somma totale nell'add nota
}
//********************************************************************************** */ 
        useEffect(() => {
          const fetchTinte = async () => {
            try {
              const tinteCollection = collection(db, 'tinte');
              const snapshot = await getDocs(tinteCollection);
              const lista = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => a.brand.localeCompare(b.brand)); // <-- ordinamento qui
  
              setBrandTinte(lista);
            } catch (err) {
              console.error('Errore nel recupero delle tinte:', err);
            }
          };
  
          fetchTinte();
        }, []);



    React.useEffect(() => {
      const collectionRef = collection(db, "Nota");
      const q = query(collectionRef, where("idNota", "==", notaId));

      const fetchData = async () => {
        try {
          const querySnapshot = await getDocsFromCache(q);
          let todosArray = [];
          
          querySnapshot.forEach((doc) => {
            todosArray.push({ ...doc.data(), id: doc.id });
          });

          if (todosArray.length > 0) {
            // Se ci sono dati in cache, li uso subito
            todosArray.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
            setTodos(todosArray);
            setProgress(true);
          }
        } catch (error) {
          console.log("Dati non trovati in cache, attivando onSnapshot...");
        }

        const unsub = onSnapshot(q, (querySnapshot) => {
          let todosArray = [];
          querySnapshot.forEach((doc) => {
            todosArray.push({ ...doc.data(), id: doc.id });
          });

          todosArray.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
          setTodos(todosArray);
          setProgress(true);
        });

        return () => unsub();
      };

      fetchData();
      localStorage.removeItem("NotaId");

    }, [updateProdo]);

      React.useEffect(() => {
        const collectionRef = collection(db, "inOrdine");
        const q = query(collectionRef, orderBy("prodottoC"));
        const unsub = onSnapshot(q, (querySnapshot) => {
          let todosArray = [];
          querySnapshot.forEach((doc) => {
            todosArray.push({ ...doc.data(), id: doc.id });
          });
          setTodosInOrdine(todosArray);
        });
        return () => unsub();
      }, []);

      React.useEffect(() => {
        const collectionRef = collection(db, "inSospeso");
        const q = query(collectionRef, orderBy("prodottoC"));
        const unsub = onSnapshot(q, (querySnapshot) => {
          let todosArray = [];
          querySnapshot.forEach((doc) => {
            todosArray.push({ ...doc.data(), id: doc.id });
          });
          setTodosInSospeso(todosArray);
        });
        return () => unsub();
      }, []);

      React.useEffect(() => {
        SommaTot()
      }, [todos, sumTot]);
//********************************************************************************** */
  //aggiunge un prodotto nella nota
  const createProduct = async () => {

  await addDoc(collection(db, "Nota"), {
    idCliente,
    idNota: notaIddo,
    dataC: dataNotaC,
    nomeC: nomeCli,
    qtProdotto: 1,
    prodottoC,
    complete: false,
    artPreso: false,
    simbolo: "",
    simbolo2: "",
    meno: 0,
    flagEt: false,
    t1,
    t2,
    t3,
    t4,
    t5,
    nomTin,
    flagTinte: FlagT,
    prezzoUniProd,
    prezzoTotProd,
    createdAt: serverTimestamp(),
  });
  setUpdateProd(updateProdo +1)
};
//_________________________________________________________________________________________________________________
//gestione degli ordini in sospeso e in ordine, si attivano quando si preme il pulsante conferma

const handleInOrdine = async () => {  //Inserisce una nuova trupa nella tabella in ordine quando viene confermata la nota    si attiva quando premo il pulsante conferma
  todos.map(async (nice) => {
    if (nomeCli == nice.nomeC && dataNotaC==nice.dataC && nice.simbolo == "(NO)") {   //va a prendere il prodotto con il no e inseriamo questo prodotto nel db inOrdine
      await addDoc(collection(db, "inOrdine"), {   //va a creare la nuova trupla nella tabella inOrdine
        nomeC: nomeCli,
        dataC: dataNotaC,
        qtProdotto: nice.qtProdotto,
        prodottoC: nice.prodottoC,
      });
    }
    if (nomeCli == nice.nomeC && dataNotaC==nice.dataC && nice.simbolo == "1") {   //va a prendere il prodotto con il (-...) e inseriamo questo prodotto nel db inOrdine
      await addDoc(collection(db, "inOrdine"), {   //va a creare la nuova trupla nella tabella inOrdine
        nomeC: nomeCli,
        dataC: dataNotaC,
        qtProdotto: nice.meno,
        prodottoC: nice.prodottoC,
      });
    }
})
}

const handleInSospeso = async () => {  //Inserisce una nuova trupa nella tabella in sospeso quando viene confermata la nota    si attiva quando premo il pulsante conferma
  todos.map(async (nice) => {
    if (nomeCli == nice.nomeC && dataNotaC==nice.dataC && nice.simbolo2 == "-") {   //va a prendere il prodotto con il no e inseriamo questo prodotto nel db inOrdine
      await addDoc(collection(db, "inSospeso"), {   //va a creare la nuova trupla nella tabella inSospeso
        nomeC: nomeCli,
        dataC: dataNotaC,
        qtProdotto: nice.qtProdotto,
        prodottoC: nice.prodottoC,
      });
    }
})
}

const handleInOrdineRemove = async () => {  //Va ad eliminare i prodotti da InOrdine, quando viene annullata la conferma    si attiva quando premo il pulsante annulla conferma
  todosInOrdine.map(async (nice) => {
    if (nomeCli == nice.nomeC && dataNotaC==nice.dataC) {   //va a prendere la trupla di questo cliente di questa data
      await deleteDoc(doc(db, "inOrdine", nice.id)); //elimina tutti i prodotti di quel cliente con quella data  quando viene annullata la conferma 
    }
  })
}

const handleInSospesoRemove = async () => {  //Va ad eliminare i prodotti da inSospeso, quando viene annullata la conferma    si attiva quando premo il pulsante annulla conferma
  todosInSospeso.map(async (nice) => {
    if (nomeCli == nice.nomeC && dataNotaC==nice.dataC) {   //va a prendere il prodotto con il no e inseriamo questo prodotto nel db inOrdine
      await deleteDoc(doc(db, "inSospeso", nice.id)); //elimina tutti i prodotti di quel cliente con quella data  quando viene annullata la conferma 
    }
  })
}
//_________________________________________________________________________________________________________________
const handleEdit = async ( todo, qt, prod, prezU, prezT, tt1, tt2, tt3, tt4, tt5, nomTinte) => {
  var conTinte=0;    //alogoritmo per le tinte
  if(tt1) {conTinte=conTinte+1}
  if(tt2) {conTinte=conTinte+1}
  if(tt3) {conTinte=conTinte+1}
  if(tt4) {conTinte=conTinte+1}
  if(tt5) {conTinte=conTinte+1}
  if(todo.flagTinte == false){ 
    nomTinte=""
  conTinte=1 }
  var preT= (conTinte*qt)*prezU;  //qui va a fare il prezzo totale del prodotto in base alla quantità e al prezzo unitario
  if(todo.simbolo == "(NO)"){ preT=0;  }   //se il simbolo è no, non va a fare il suo prezzo totale
  var somTrunc = preT.toFixed(2);
  await updateDoc(doc(db, "Nota", todo.id), 
  { qtProdotto: qt, prodottoC:prod, prezzoUniProd:prezU, prezzoTotProd:somTrunc, t1:tt1, t2:tt2, t3:tt3, t4:tt4, t5:tt5});
  toast.clearWaitingQueue(); 
  SommaTot();
  console.log("modificato il prodotto")
  setUpdateProd(updateProdo +1)
};
//_________________________________________________________________________________________________________________
const handleAddNumCart = async (e) => {  //funzione aggiungere i cartoni
  var nuCut
  e.preventDefault();
  setNumCart(+NumCart+1);
  nuCut=+NumCart+1
  await updateDoc(doc(db, "addNota", notaId), { NumCartoni: nuCut});
}

const handleRemoveNumCart = async (e) => {  //quando si preme il pulsante per rimuovere (numero di cartoni)
  var nuCut
  e.preventDefault();
  if(NumCart <= 0) {  //se il numero di cartoni è minore di 0 non fa nulla
    return
  }
  setNumCart(+NumCart-1);
  nuCut= +NumCart-1
  await updateDoc(doc(db, "addNota", notaId), { NumCartoni:nuCut});
}

const handleAddNumBuste = async (e) => {  //funzione aggiungere i cartoni
  var nuCut
  e.preventDefault();
  setNumBuste(+NumBuste+1);
  nuCut=+NumBuste+1
  await updateDoc(doc(db, "addNota", notaId), { NumBuste: nuCut});
}

const handleRemoveNumBuste = async (e) => {  //quando si preme il pulsante per rimuovere (numero di cartoni)
  var nuCut
  e.preventDefault();
  if(NumBuste <= 0) {  //se il numero di cartoni è minore di 0 non fa nulla
    return
  }
  setNumBuste(+NumBuste-1);
  nuCut= +NumBuste-1
  await updateDoc(doc(db, "addNota", notaId), { NumBuste:nuCut});
}
//_________________________________________________________________________________________________________________
const handleEditCompAnn = async (e) => {  //completa
  setDebTot(0)
  await updateDoc(doc(db, "addNota", notaId), { completa: localStorage.getItem("completa"), debitoTotale: 0}) ;
  await updateDoc(doc(db, "debito", idDebito), { deb1:debitoRes});  //aggiorna deb1 nel database del debito
  setUpdateProd(updateProdo +1)
};

const handleEditDebitoRes = async (e) => {  //handle se nel caso si voglia modificare il debito residuo
  e.preventDefault();
  await updateDoc(doc(db, "addNota", notaId), { debitoRes:debitoRes});
  toast.clearWaitingQueue(); 
};

const AlteStamp = async (e) => {  //handle se nel caso si voglia modificare il debito residuo
  //cambiare l'altezza per la stampa
  var conProd = 0;
  var altez = 1123;
  var nProd = 19;
  const coll = collection(db, "Nota");   //vado a fare il conteggio dei prodotti presenti nella nota
  const q = query(coll, where("nomeC", "==", nomeCli), where("dataC", "==", dataNotaC));
  const snapshot = await getCountFromServer(q);
  conProd = snapshot.data().count

  while (conProd > nProd)  {
      nProd = nProd + 25;
      altez = altez + 1123;
  } 
  var StrAlt = altez + "px"  //conversione da numero a stringa
    await updateDoc(doc(db, "addNota", notaId), { altezza: StrAlt}); //aggiorna l'altezza 
};


const handleConferma = async () => {
  // Calcola la somma totale e aggiorna il debito
  SommaTot(); // ricalcola la somma totale dei prodotti
  const sumNota = localStorage.getItem("sumTotNota");
  const debTot = +sumNota + (+debitoRes);
  const debTrunc = debTot.toFixed(2); // somma totale dei prodotti + debito, formattata
  setDebTot(debTrunc);

  // Leggi il documento 'debito' per prendere il valore vecchio di deb1
  const debitoDocRef = doc(db, "debito", idDebito);
  const debitoSnapshot = await getDoc(debitoDocRef);
  let oldDeb1 = "";
  if (debitoSnapshot.exists()) {
    oldDeb1 = debitoSnapshot.data().deb1 || "";
  }

  // Aggiorna i documenti addNota e debito con il nuovo valore
  await updateDoc(doc(db, "addNota", notaId), {
    debitoTotale: debTrunc,
    completa: localStorage.getItem("completa")
  });
  await updateDoc(debitoDocRef, { deb1: debTrunc });

  // Aggiungi un nuovo record nella collezione cronologiaDeb
  // con il nuovo debito (deb1) e quello vecchio (debv)
  await addDoc(collection(db, "cronologiaDeb"), {
    autore: "Liguori srl",              // autore fisso
    createdAt: serverTimestamp(),       // timestamp di creazione
    deb1: debTrunc,                     // nuovo valore
    debv: oldDeb1,                      // valore vecchio preso dal documento attuale
    idCliente: idCliente,               // utilizzando la variabile idCliente
    nomeC: nomeCli                      // oppure nomeC, se corrisponde a nomeCli
  });

  // Esegue altre operazioni (ad es. AlteStamp, notifica, aggiornamento dello stato)
  AlteStamp();
  toast.clearWaitingQueue();
  setUpdateProd(updateProdo + 1);
};

//_________________________________________________________________________________________________________________
const handleDelete = async (id) => {
  const colDoc = doc(db, "Nota", id); 
  await deleteDoc(colDoc); 
  SommaTot();
  setUpdateProd(updateProdo +1)
};

const handleDeleteInOrdine = async (id) => {
  const colDoc = doc(db, "inOrdine", id); 
  await deleteDoc(colDoc); 
};

const handleDeleteInSospeso = async (id) => {
  const colDoc = doc(db, "inSospeso", id); 
  await deleteDoc(colDoc); 
};

const handleChangeTogg = (event) => {
  setAlignment(event.target.value);
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
{/**************NAVBAR MOBILE*************************************** */}
        <div className='navMobile row'>
      <div className='col-2'>
        <IconButton className="buttonArrow" aria-label="delete" sx={{ color: "#f6f6f6", marginTop: "7px" }}
        onClick={ ()=> {navigate(-1); }}>
        <ArrowBackIcon sx={{ fontSize: 30 }}/>
      </IconButton>
      </div>
      <div className='col' style={{padding: 0}}>
      <p className='navText'> Nota </p>
      </div>
      </div>


        <motion.div
        initial= {{opacity: 0}}
        animate= {{opacity: 1}}
        transition={{ duration: 0.7 }}
        style={{ position: "absolute" }}>

{!matches && 
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate(-1)}}>
      <ArrowBackIcon id="i" /></button> }

      {!matches ? <h1 className='title mt-3' style={{ textAlign: "left", marginLeft: "70px", position: "relative", bottom: "15px" }}>Ordine di {idCliente} {nomeCli} </h1> : <div style={{marginBottom:"60px"}}></div>} 

<div style={{ justifyContent: "left", textAlign: "left", marginTop: "20px" }}>
    {(Completa ==0 || Completa==5 || Completa==6) && 
    <>
    <Button style={{borderTopRightRadius: "0px", borderBottomRightRadius: "0px" }} onClick={() => {FlagT=false; createProduct(); }}  variant="contained">Aggiungi Prodotto</Button>
    <Button className='rounded-0'  onClick={() => {FlagT=true; createProduct();}}  variant="contained">Aggiungi Tinte</Button>

      <Button className='rounded-0' onClick={() => { setFlagInOrdine(true); setFlagInSospeso(false)}}  variant="contained"  value="scortatinte">In Ordine</Button>
      <Button className='rounded-0' onClick={() => { setFlagInOrdine(false); setFlagInSospeso(true)}}  variant="contained"  value="scortatinte1">In Sospeso</Button>
    </>}
    <Button className='rounded-0' onClick={print}  variant="contained">Stampa</Button>
    <button onClick={sharePdf}>Condividi come PDF</button>
     {Completa== 0 ? 
      <button type="button" className="button-delete" style={{padding: "0px", float: "left", }}>
        <Brightness1Icon sx={{ fontSize: 40 }}/>
        </button> :
        <button type="button" className="button-complete" style={{padding: "0px", float: "center"}}>
        <Brightness1Icon sx={{ fontSize: 40 }}/>
        </button>
        }
    </div>

{/**********tabella in ordine********************** */}
{flagInOrdine == true && 
<div className='todo_containerInOrdine mt-5 mb-5' style={{paddingTop: "0px"}}>
<div className='divClose'>  <button type='button' className="button-close float-end" onClick={() => { setFlagInOrdine(false); }}>
              <CloseIcon id="i" />
              </button> </div>
<div className='row' > 
<div className='col-8'>
<p className='colTextTitle'> In ordine </p>
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

{todosInOrdine.map((todo) => (
    <div key={todo.id}>
    { todo.nomeC === nomeCli && 
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
    }
    </div>
  ))}
  </div>  
  }

{/**********tabella in sospeso********************** */}
{flagInSospeso== true && 
<div className='todo_containerInOrdine mt-5 mb-5' style={{paddingTop:"0px"}}>
<div className='divClose'>  <button type='button' className="button-close float-end" onClick={() => { setFlagInSospeso(false); }}>
              <CloseIcon id="i" />
              </button> </div>
<div className='row' > 
<div className='col-8'>
<p className='colTextTitle'> In sospeso </p>
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

{todosInSospeso.map((todo) => (
    <div key={todo.id}>
    { todo.nomeC === nomeCli && 
    <div className='row' style={{padding: "0px", marginRight: "5px"}}>
      <div className='col-4 diviCol'><p className='inpTab'>{todo.nomeC} </p> </div>
      <div className='col-1 diviCol' style={{padding: "0px"}}><p className='inpTab'>{todo.qtProdotto}</p></div>
      <div className='col-4 diviCol' style={{padding: "0px"}}><p className='inpTab'>{todo.prodottoC}</p></div>
      <div className='col-2 diviCol' style={{padding: "0px"}}><p className='inpTab'>{todo.dataC}</p></div>
      <div className="col diviCol" style={{padding:"0px", marginTop:"-8px"}}>
        {sup ===true && (   
          <>
      <div className="col-1 diviCol" style={{padding:"0px", marginTop:"-8px"}}>
        <button className="button-delete" onClick={() =>{ 
          localStorage.setItem("flagRemove", 2);
            localStorage.setItem("IDNOTa", todo.id);
            displayMsg();
            toast.clearWaitingQueue(); }}>
          <DeleteIcon id="i" />
        </button>
    </div>  
        </>
        )}
    </div>
      <hr style={{margin: "0"}}/>
    </div>
    }
    </div>
  ))}
  </div>  
  }

{/*********************DDT***************************** */}
  <div className='containerA4' style={{ position: "relative", overflow: "auto", height: "70vh", width: "815px"  }}> 
    <div ref={componentRef} className="foglioA4" style={{paddingLeft:"50px", paddingRight:"50px", paddingTop:"20px", position: "absolute", backgroundColor: "white", borderRadius: "20px", }}>
    <div className='row rigaNota' >
        <div className='col colNotaSini' style={{textAlign:"left", padding:"0px", paddingLeft:"0px"}}>
        <h6 style={{fontSize:"9px"}}>MITTENTE: Ditta, Domicilio o Residenza, Codice Fiscale, Partita IVA</h6>
        <h5 style={{marginBottom:"0px", marginTop:"10px"}}>LIGUORI  <span style={{fontSize:"0.6em", marginRight:"10px"}} >s.r.l </span> <span style={{fontSize:"0.6em"}} > u.p.</span> </h5>
        <h5 className='sinistraNota'>Sede legale e deposito merci:</h5>
        <h5 className='sinistraNota'>Via F. Caracciolo 18</h5>
        <h5 className='sinistraNota'>80023 Caivano (NA)</h5>
        <h5 className='sinistraNota'>Cod.Fisc. e Partita IVA n.08319431212</h5>
        <h6 className='sinistraNota6'>R.I. 08319431212</h6>
        <h6 className='sinistraNota6'>R.E.A. NA 948532</h6>
        <h6 className='sinistraNota6' style={{marginBottom:"5px"}}>Cap.Soc. €10.000,00 I.V.</h6>
        </div>

        <div className='col'  style={{textAlign:"left", padding:"0px", marginLeft:"5px"}}>
        <h3  style={{marginBottom:"-5px", fontSize:"22.5px"}}><b>DOCUMENTO DI TRASPORTO</b></h3>
        <h4 style={{marginBottom:"9px"}}><b>(D.d.t.)</b> <span style={{fontSize:"0.4em", marginRight:"10px"}}>&emsp;&ensp; D.P.R. 472 del 14-08-1996-D.P.R 696 del 21.12.1996 </span></h4>
        <h4 style={{marginBottom:"9px"}}> <b>N.</b> <span style={{marginRight:"10px"}}>{cont}</span> <span style={{fontSize:"13px"}}><b>del</b></span> {dataNotaC} </h4>

    <div class="form-check form-check-inline"  style={{padding:"0px", fontSize:"13px"}}>a mezzo: &nbsp; &nbsp;
    <input id="checkbox3" type="checkbox" checked="checked"/>
      <label for="checkbox3">&nbsp;mittente</label>
    </div>
    </div>
    </div>

    <div className='row rigaNota'>
    <div className='col colNotaSini'style={{textAlign:"left", padding:"0px", paddingLeft:"0px"}}>
    <h6 style={{fontSize:"9px"}}>DESTINATARIO: Ditta, Codice Fiscale, Partita IVA</h6>
      <div className='row'>
      <h5 style={{marginBottom:"0px", marginTop:"0px"}}> {nomeCli} </h5>
        <h5 className='sinistraNota'>{indirizzo}</h5>
        <h5 className='sinistraNota'>Tel {tel}</h5>
        <h5 className='sinistraNota'>Cod.Fisc. e Partita IVA n.{iva}</h5>
        <h5 className='sinistraNota'  style={{marginBottom:"5px"}}>Indirizzo di consegna: {indirizzo}</h5>
      </div>
    </div>

      <div className='col'  style={{textAlign:"left", padding:"0px", marginLeft:"5px"}}>
      <h6 style={{fontSize:"9px"}}>LUOGO DI DESTINAZIONE</h6>
      </div>
    </div>
{/***********tabella aggiunta prodotto************************************************** */}
  <div className='row' style={{textAlign:"center", background:"#212529", color:"#f6f6f6"}}>
    <div className='col-1' style={{padding:"0px"}}>Qt</div>
    <div className='col-6' style={{padding:"0px", width: "410px"}}>Prodotto</div>
    <div className='col-2' style={{padding:"0px", }}>Prezzo Uni</div>
    <div className='col-2' style={{padding:"0px"}}>Prezzo Totale</div>
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
    {todo.nomeC  === nomeCli && todo.dataC == dataNotaC &&  (
      <>
    { ta === true &&(
    <TodoNota
      key={todo.id}
      todo={todo}
      brandTinte={brandTinte}
      handleDelete={handleDelete}
      handleEdit={handleEdit}
      displayMsg={displayMsg}
      nomeCli={nomeCli}
      flagStampa={flagStampa}
      Completa={Completa}
      SommaTot={SommaTot}
    />
     )}
     </>
                  )}
    </div>
  ))}
  </div>

  <div className='row'>
    <div className='col' style={{textAlign:"left", padding:"0px"}}>
    <h6 className='mt-2'>Numero Cartoni: <span> {NumCart} </span> 
    {(Completa == 0 || Completa == 6) && flagStampa ==false &&
      <span>
        <button className="button-complete" style={{padding: "0px"}} onClick={handleAddNumCart}> <AddCircleIcon sx={{ fontSize: 35 }}/> </button>
        <button className="button-delete" style={{padding: "0px"}} onClick={handleRemoveNumCart}> <RemoveCircleIcon sx={{ fontSize: 35 }}/> </button>
      </span> }
    </h6> 
    <h6 className='mt-2' style={{ width: "300px" }}>Numero Buste: <span style={{ marginLeft: "10px" }}> {NumBuste} </span> 
    {(Completa == 0 || Completa == 6) && flagStampa ==false &&
      <span>
        <button className="button-complete" style={{padding: "0px"}} onClick={handleAddNumBuste}> <AddCircleIcon sx={{ fontSize: 35 }}/> </button>
        <button className="button-delete" style={{padding: "0px"}} onClick={handleRemoveNumBuste}> <RemoveCircleIcon sx={{ fontSize: 35 }}/> </button>
      </span> }
    </h6> 
       </div>

    <div className='col' style={{textAlign:"right", padding:"0px"}}>
    <h6>Totale: €{parseFloat(sumTot).toFixed(2).replace('.', ',')}</h6>
    {completa!=2 &&
      <form onSubmit={handleEditDebitoRes}>
      <h6>Debito Residuo:     <input value={debitoRes} onBlur={handleEditDebitoRes} style={{textAlign:"center", padding: "0px", width:"50px"}} 
        onChange={(event) => {
        setDebitoRes(event.target.value);}}
      />  €</h6>
      </form>
      }
      {completa==2 &&
        <h6>Debito Residuo: {debitoRes}  €</h6>
      }
          <h6>Debito Totale: €{parseFloat(debitoTot).toFixed(2).replace('.', ',')}</h6>
  
    {flagStampa == false && <>
    {(Completa==0 || Completa == 6) &&  
    <Button variant='contained' color='success' onClick={ ()=> {localStorage.setItem("completa", 1); setCompleta(1); handleInOrdine(); handleInSospeso();  handleConferma()}}>Conferma</Button> 
    }
    {Completa==1 && 
    <Button disabled={Completa === "2"}  variant='contained' color='error' onClick={ ()=> {localStorage.setItem("completa", 6); setCompleta(6); handleInOrdineRemove(); handleInSospesoRemove(); handleEditCompAnn(); }}>Annulla Conferma</Button>
    }
  </>}

    
    </div>

  </div>
    </div>
    </div>
    <div style={{marginBottom: "120px"}}></div>
</motion.div>
    </>
      )
}
export default Nota;