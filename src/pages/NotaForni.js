import PrintFormatControl from '../components/PrintFormatControl';
import usePrintFormat from '../hooks/usePrintFormat';
import { documentPrintStyle } from '../utils/printLayout';
import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, where, getDocs, orderBy, serverTimestamp, getDoc, setDoc} from 'firebase/firestore';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useReactToPrint } from 'react-to-print';
import moment from 'moment';
import TodoNota from '../components/TodoNota';
import TodoNotaForni from '../components/TodoNotaForni';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { notifyUpdateProd, notifyUpdateNota, notifyUpdateDebRes} from '../components/Notify';
import { WhatsappShareButton, WhatsappIcon, EmailShareButton, EmailIcon } from 'react-share';
import { useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { supa, guid, tutti, flagStampa } from '../components/utenti';
import { motion } from 'framer-motion';




import { populateSupplierOrder } from '../utils/supplierOrders';

function NotaForni({notaId, nomeForni, dataNota, dataNotaC }) {

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

    const sharePdf = async () => {
      
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
      }finally {
      setFlagStampa(false);
      }
    };

    const { id } = useParams();
    const { nome } = useParams();
    const { data } = useParams();

    const [refreshing, setRefreshing] = useState(false);
    const refreshingRef = useRef(false);
    const [todos, setTodos] = React.useState([]);
    const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone
    let navigate = useNavigate();

    const string = "https://liguorisrl-38c83.web.app/notaforni/"+id+"/"+nome+"/"+data;
    const url = string.replace(/ /g, '%20');  //conversione da stringa a url

    var FlagT=false;   //flag per le tinte, viene salvato nel database serve per far riconoscere ogni singola trupla
    const [flagStampa, setFlagStampa] = React.useState(false);  //quando è falso si vedono le icone,
    const [flagProdFor, setFlagProdForn] = React.useState(false);  //quando è falso si vedono le icone,
    const [imageUrl, setImageUrl] = React.useState("");

    const captureDivAsImage = async () => {
      if (!componentRef.current) return;
    
      const canvas = await html2canvas(componentRef.current, { useCORS: true });
      const image = canvas.toDataURL("image/png"); // Converti in immagine PNG
      setImageUrl(image); // Salva l'URL per condivisione
    };
   
    const [sumTot, setSumTot] =React.useState("");

    const [Progress, setProgress] = React.useState(false);
    const [printFormat, setPrintFormat] = usePrintFormat();
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
  let sommaTot = 0;
  const q = query(collection(db, "Nota"), where("nomeC", "==", nome), where("dataC", "==", data));
  const snap = await getDocs(q);
  snap.forEach(d => {
    sommaTot += (+d.data().prezzoTotProd || 0);
  });
  setSumTot(sommaTot);

  const ref = doc(db, "addNota", id);
  const exists = (await getDoc(ref)).exists();
  if (exists) {
    await updateDoc(ref, { sommaTotale: sommaTot });
  } else {
    // crea il doc se manca
    await setDoc(ref, { sommaTotale: sommaTot }, { merge: true });
  }
};

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
  
    const caricaNotaForni = () => {
      const collectionRef = collection(db, "notaForni");
      const q = query(collectionRef, where("nomeF", "==", nome), where("data", "==", data), orderBy("createdAt"));
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
    }

     React.useEffect(() => {
        return caricaNotaForni();
      }, [nome, data]);


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
  toast.clearWaitingQueue(); 
};


const handleRefresh = async ( ) => {
  if (refreshingRef.current) return;
  refreshingRef.current = true;
  setRefreshing(true);
  try {
    const added = await populateSupplierOrder(nome, data);
    toast.success(added ? `Aggiunte ${added} voci all'ordine.` : 'Ordine già aggiornato: nessuna nuova voce sotto scorta.');
  } catch (error) {
    console.error('Errore aggiornamento ordine:', error);
    toast.error("Impossibile aggiornare l'ordine. Riprova.");
  } finally {
    refreshingRef.current = false;
    setRefreshing(false);
  }
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
  pageStyle: documentPrintStyle(printFormat),
  onAfterPrint: () => setFlagStampa(false),
});

const print = () => {
  setFlagStampa(true);
  setTimeout(() => {
    if (!componentRef.current) {
      setFlagStampa(false);
      console.error('Niente da stampare: ref non pronta');
      return;
    }
    handlePrint();
  }, 150); // un attimo per far renderizzare la vista "stampa"
};
//*************************************************************** */
//************************************************************** */
//          INTERFACE                                             /
//************************************************************** */
    return (  
        <>
   <motion.div className=''
        initial= {{x: "-100vw"}}
        animate= {{x: 0}}
        transition={{ duration: 0.4 }}>
{!matches && 
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate(-1)}}>
      <ArrowBackIcon id="i" /></button> 
    }

    {!matches ? <h1 className='title mt-3'>Nota Fornitore</h1> : <div style={{marginBottom:"60px"}}></div>} 


    <PrintFormatControl value={printFormat} onChange={setPrintFormat} disabled={flagStampa} />
    <span><button onClick={print}>Stampa </button></span>

  {sup == true && 
      <>
      <span><button onClick={() => {
       FlagT=false
       console.log({FlagT})
        createCate()
      }}>Aggiungi Prodotto</button></span>
      <span><button onClick={handleRefresh} disabled={refreshing}>{refreshing ? 'Aggiornamento…' : 'Aggiorna da scorte'}</button></span>

      <button   onClick={() => {
    setFlagStampa(true);
    setTimeout(() => {
      sharePdf();
    }, 100); // Puoi regolare il delay se necessario
  }}>Condividi come PDF</button>


  <WhatsappShareButton url={url}>
        <WhatsappIcon type="button" size={40} round={true} />
    </WhatsappShareButton>
    <EmailShareButton url={url}>
        <EmailIcon type="button" size={40} round={true} />
    </EmailShareButton>
    </>
}
    
    <div ref={componentRef} className="foglioA4 mt-3" style={{paddingLeft:"50px", paddingRight:"50px", paddingTop:"20px", backgroundColor: "white"}}>
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
  <div className='row supplier-items-heading' style={{textAlign:"center", background:"#212529", color:"#f6f6f6"}}>
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
    </motion.div>
    </>
      )
}
export default NotaForni;