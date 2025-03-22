import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, where, getDocs, orderBy, serverTimestamp, limit} from 'firebase/firestore';
import useMediaQuery from '@mui/material/useMediaQuery';
import moment from 'moment';
import CircularProgress from '@mui/material/CircularProgress';
import { db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { primary } from '../components/utenti';
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { supa, guid, tutti } from '../components/utenti';
import { motion } from 'framer-motion';
import Button from '@mui/material/Button';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export const AutoProdCli = [];

function notifySuccess (testo) {
    toast.success(testo, {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Slide,
        progress: undefined,
        theme: "dark",
        className: "rounded-4"
        });
}

function ScalettaReview({notaDat, getNotaDip, getNotaId }) {
 
    const [todos, setTodos] = React.useState([]);
    const [todosDataAuto, setTodosDataAuto] = React.useState([]);
    const [Progress, setProgress] = React.useState(false);
    const [sommaScaletta, setSommaScaletta] = useState(0);
    const [sommaQuota, setSommaQuota] = useState(0);
    const [noteMap, setNoteMap] = useState({});
    const [quotaMap, setQuotaMap] = useState({});


    const [dataSc, setDataSc] = React.useState(notaDat);
  
    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))   //confronto con uid corrente
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
  
    const scalCollectionRef = collection(db, "addNota"); 
    const matches = useMediaQuery('(max-width:600px)');  //media query true se è uno smartphone
  
    let navigate = useNavigate();
  

    const handleChangeDataScaletta = (e) => {
    setDataSc(moment(e.target.value).format("DD-MM-YYYY"));
    };

  //somma della quota----------------------------------
    const calculateSumQuota = (todos) => {
      let sum = 0;
      todos.forEach(item => {
          sum += Number(item.quota) || 0;
      });
      setSommaQuota(sum.toFixed(2));
  };
  
  React.useEffect(() => {
      calculateSumQuota(todos);
  }, [todos]);

  const auto = async (idCliente) => {  //array per i prodotti dei clienti
      const q = query(collection(db, "prodottoClin"), where("author.idCliente", "==", idCliente));
      const querySnapshot = await  getDocs(q);
      querySnapshot.forEach((doc) => {

      let car = { label: doc.data().nomeP,
                  id: doc.id,
                  prezzoUni: doc.data().prezzoUnitario }
      AutoProdCli.push(car);
      });
      }

    const handleNoteChange = (id, value) => {
        setNoteMap(prev => ({
            ...prev,
            [id]: value 
        }));
    };

    const handleQuotaChange = (id, value) => {
        setQuotaMap(prev => ({
            ...prev,
            [id]: value  // Salva il valore modificato per l'ID specifico
        }));
    };
    
    
    const handleSaveQuota = async (id, oldQuota, sommaTotale, nomeC, idCliente) => {
      const updatedQuota = quotaMap[id] ?? oldQuota;
      await handleEditQuota(id, sommaTotale, oldQuota, updatedQuota, nomeC, idCliente);
  
     //calcola la somma della quota
      setTodos(prevTodos => {
          const newTodos = prevTodos.map(todo =>
              todo.id === id ? { ...todo, quota: updatedQuota } : todo
          );
          calculateSumQuota(newTodos);
          return newTodos;
      });
  };

  
    const handleEditQuota = async (id, sommaTotale, oldQuota, newQuota, nomeC, idCliente) => {  
      let debTot;
      let ripDebito;
    
      // Query per trovare il documento del debito
      const q = query(collection(db, "debito"), where("nomeC", "==", nomeC));  
      const querySnapshot = await getDocs(q);
      
      // Per ogni documento "debito" trovato (in genere dovrebbe essere uno solo)
      querySnapshot.forEach(async (hi) => {
          // Salva il valore attuale di deb1
          const oldDeb1 = hi.data().deb1;
          
          if (oldQuota != 0) {  
              // Se esiste una quota precedente, "ripristina" il debito come era prima
              ripDebito = (+oldDeb1) + (+oldQuota);
              debTot = +ripDebito - (+newQuota);
          } else {
              debTot = +oldDeb1 - (+newQuota);
          }
      
          let debTrunc = debTot.toFixed(2);  // Tronca a 2 decimali
      
          // Aggiorna il documento "debito" con il nuovo valore
          await updateDoc(doc(db, "debito", hi.id), { deb1: debTrunc });
          
          await addDoc(collection(db, "cronologiaDeb"), {
              autore: "Liguori srl",
              createdAt: serverTimestamp(),
              deb1: debTrunc,   // Nuovo debito
              debv: oldDeb1,    // Valore vecchio
              idCliente: idCliente,  // Assicurati che "idCliente" sia disponibile nel contesto (ad es. passato come prop)
              nomeC: nomeC
          });
      });
      
      // Aggiorna la quota e imposta lo stato "completa" nel documento "addNota"
      await updateDoc(doc(db, "addNota", id), { quota: newQuota, completa: "2" });
      notifySuccess("Quota aggiornata");
    };
    
    

    const handleSaveNote = async (id, defaultNota) => {
        const updatedNote = noteMap[id] ?? defaultNota;  // Usa il valore aggiornato o quello originale
        await handleEditNota(id, updatedNote);  // Aggiorna il database
    };

    const handleEditNota = async (id, nota) => {
        await updateDoc(doc(db, "addNota", id), { note:nota});
      };
  
  //********************************************************************************** */  
  React.useEffect(() => {
    const collectionRef = collection(db, "addNota");
    const q = query(collectionRef, where("scalettaData", "==", dataSc), orderBy("scalettaOrdine", "asc"));
    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      let somma = 0; // Variabile per sommare il totale
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        todosArray.push({ ...data, id: doc.id });
  
        somma += Number(data.sommaTotale) || 0; // Somma i valori numerici
      });
  
      setTodos(todosArray);
      setSommaScaletta(somma.toFixed(2)); // Aggiorna lo stato con la somma totale
      setProgress(true);
    });
  
    localStorage.removeItem("OrdId");
    return () => unsub();
  }, [dataSc]);
  


    React.useEffect(() => {  //effect per l'autocompleate, vado a prendermi le date della scaletta
        const collectionRef = collection(db, "scalDat");
        const q = query(collectionRef, orderBy("dataMilli", "desc"), limit(3));
    
        const unsub = onSnapshot(q, (querySnapshot) => {
          let todosArray = [];
          querySnapshot.forEach((doc) => {
            todosArray.push({ ...doc.data(), id: doc.id });
          });
          setTodosDataAuto(todosArray);
        });
        localStorage.removeItem("OrdId");
        return () => unsub();
      }, []);
      
    
  //**************************************************************************** */
  //                              NICE
  //********************************************************************************** */
      return ( 
      <>  
    {/**************NAVBAR MOBILE*************************************** */}
    <div className='navMobile row d-flex align-items-center'>
    <div className='col-2'></div>
      <div className='col' style={{padding: 0}}>
      <p className='navText'>Liguori Srl </p>
      </div>
      <div className='col' style={{paddingRight: "20px"} }>
      </div>
      </div>

    <motion.div  style={{padding: "0px"}}
        initial= {{x: "-100vw"}}
        animate= {{x: 0}}
        transition={{ duration: 0.4 }}
        >

    {!matches && 
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate(-1)}}>
      <ArrowBackIcon id="i" /></button> 
    }
    {!matches ? <h1 className='title mt-3' style={{ textAlign: "left", marginLeft: "70px" }}>Scaletta</h1> : <div style={{marginBottom:"60px"}}></div>} 

    <div style={{ justifyContent: "center", textAlign: "center", marginTop: "40px" }}> 
    <ToggleButtonGroup
      color="primary"
      exclusive
      aria-label="Platform"
    > 
    <Button  color='primary' style={{borderTopRightRadius: "0px", borderBottomRightRadius: "0px" }}  onClick={() => { navigate("/stampamassiva") }}  variant="contained">Stampa Massiva</Button>
    {/*{sup == true && <Button  onClick={() => {setFlagBlock(true); setFlagDelete(false)}} size="small" variant="contained">Blocca</Button>}  */}
    </ToggleButtonGroup>
    </div>

 {/********************Tabella scaletta***************************************** */}
<div className='todo_container pe-0 ps-0' style={{width: "1100px"}}>
              <div className='row'>
                      <div className='col colTextTitle mb-3'>
                       Scaletta Clienti
                      </div>
                      <div className='col'>
                          Barra di Ricerca
                      </div>
                      <div className='col'>
                          Somma Totale: {sommaScaletta} €
                      </div>
                      <div className='col'>
                          Somma Quota: {sommaQuota} €
                      </div>
                      <div className='col'>
                      <input
                            type="date"
                            value={moment(dataSc, "DD-MM-YYYY").format("YYYY-MM-DD")} // Converti per l'input
                            onChange={(e) => handleChangeDataScaletta(e)} // Salva in formato gg-mm-yyyy
                        />
                      </div>
                    </div>
                    <div className='row' style={{ height: "25px", marginTop: "7px" }}>
                      <div className='col-1 coltext ' style={{ width:"100px" }}><p className='ps-2'>N.</p></div>
                      <div className='col-3 coltext'>Cliente</div>
                      <div className='col-1 coltext' style={{ width:"110px" }}>€Prezzo</div>
                      <div className='col-1 coltext' style={{ width:"110px" }}>€Quota</div>
                      <div className='col-1 coltext'style={{ width:"100px" }}>Note</div>
                    </div>

                    {Progress == false && 
                    <div style={{marginTop: "14px"}}>
                      <CircularProgress />
                    </div>
                    }
                <div className='' style={{maxHeight: "300px", overflowX: "hidden", overFlowY: "scroll"}}>
                {todos.map((col) => (
                  <div key={col.id}>
                    <>
                    <div className="diviCol1" style={{height: "50px", backgroundColor: col.completa=="2" ? "#0d730d" : "transparent"}}> 
                      <div className="row d-flex algin-items-center" >
                      <div className='col-1' style={{ width:"100px" }}><h3 className='inpTab ps-2' style={{color: primary}} ><b>{ col.scalettaOrdine }</b></h3></div>
                      <div className='col-3'><h3 className='inpTab' onClick={()=> {
                        getNotaId(col.idCliente, col.id, col.cont, col.nomeC, col.data, col.data, col.NumCartoni, col.sommaTotale, col.debitoRes, col.debitoTotale, col.indirizzo, col.tel, col.partitaIva, col.completa, col.idDebito, col.NumBuste)
                        navigate("/nota")
                        auto(col.idCliente);
                        AutoProdCli.length = 0
                        }}><span style={{color: primary}}><b>{col.idCliente}</b></span> { col.nomeC }</h3></div>

                    
                      <div className='col-1' style={{ width:"110px" }}><h3 className='inpTab'>€{Number(col.sommaTotale).toFixed(2).replace('.', ',')}</h3></div>
                      <div className='col-1' style={{ width:"110px" }}>
                        <input 
                                value={quotaMap[col.id] ?? col.quota}  // Mostra il valore aggiornato
                                className='inpTab' 
                                onChange={(e) => handleQuotaChange(col.id, e.target.value)}  // Aggiorna quotaMap
                            />
                      </div>
                      <div className='col-4'>
                      <textarea  
                        value={noteMap[col.id] ?? col.note}  // Mostra il valore aggiornato o quello originale
                        className='inpTab w-100'  
                        onChange={(e) => handleNoteChange(col.id, e.target.value)}  // Aggiorna solo la riga modificata
                        />
                        </div>
                      <div className='col-1 d-flex align-items-center'><button 
                      onClick={() => {
                        handleSaveNote(col.id, col.note); 
                        handleSaveQuota(col.id, col.quota, col.sommaTotale, col.nomeC, col.idCliente);
                        }}  >Conferma</button></div>
                      </div>
                    </div>
                    <hr style={{margin: "0"}}/>

                  </>
                  </div>
                  ))}
                  </div>
              </div>


    </motion.div>
      </>
      
        )
  }
export default ScalettaReview;