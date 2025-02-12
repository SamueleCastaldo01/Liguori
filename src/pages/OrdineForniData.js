import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, Timestamp, query, where, orderBy, getDocs} from 'firebase/firestore';
import moment from 'moment/moment';
import { TextField } from '@mui/material';
import { auth, db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { notifyError, notifyErrorDat } from '../components/Notify';
import Calendar from 'react-calendar';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useMediaQuery from '@mui/material/useMediaQuery';
import 'moment/locale/it'
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from '@mui/icons-material/Close';
import { supa, guid, tutti } from '../components/utenti';
import MiniDrawer from '../components/MiniDrawer';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { motion } from 'framer-motion';

export const AutoComp2 = [];


function OrdineForniData({ getOrdFornId }) {
    const[colle, setColle] = useState([]); 
    const colleCollectionRef = collection(db, "ordFornDat");


    const timeElapsed = Date.now();  //prende la data attuale in millisecondi
    const today = new Date(timeElapsed);    //converte
    let todayMilli = today.getTime()
    const [day, setday] = React.useState("");
    const [flagDelete, setFlagDelete] = useState(false); 

    const [popupActive, setPopupActive] = useState(false);  
    const matches = useMediaQuery('(max-width:920px)');  //media query true se è uno smartphone

    const [nome, setData] = useState("");

    moment.locale("it");

    let navigate = useNavigate();


    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true



    const auto = async () => {
      const q = query(collection(db, "fornitore"));
      const querySnapshot = await  getDocs(q);
      querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data().nomeF);

      let car = { label: doc.data().nomeF }
      AutoComp2.push(car);

      for(var i=0; i<10; i++) {
       console.log(AutoComp2[i])
      }
      });
      }
  //_________________________________________________________________________________________________________________

      const handleChangeDataSelect = (ok) => {
        console.log("entrato");
      
        today.setDate(today.getDate() - ok);   // Riduce la data di 'ok' giorni
        today.setHours(0, 0, 0, 0);            // Imposta l'orario a 00:00
        todayMilli = today.getTime();          // Converte in millisecondi
      
        const collectionRef = collection(db, "ordFornDat");
        const q = query(collectionRef, where("dataMilli", ">", todayMilli));
      
        const unsub = onSnapshot(q, (querySnapshot) => {
          let todosArray = [];
          querySnapshot.forEach((doc) => {
            todosArray.push({ ...doc.data(), id: doc.id });
          });
      
          // Ordina dal più recente al meno recente (decrescente)
          todosArray.sort((a, b) => b.dataMilli - a.dataMilli);
      
          setColle(todosArray);
        });
      };
  

   //_________________________________________________________________________________________________________________
    const setClear = () => {
      setData("");
      toast.dismiss();
      toast.clearWaitingQueue();}
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
          deleteCol(localStorage.getItem("ordId"), localStorage.getItem("ordFornDataEli") );
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
    handleChangeDataSelect(8)
  }, []);
  //_________________________________________________________________________________________________________________

    const deleteCol = async (id, dat) => { 
        const colDoc = doc(db, "ordFornDat", id); 

      //elimina tutti i dati di addNota della stessa data
        const q = query(collection(db, "addNotaForni"), where("data", "==", dat));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (hi) => {   //elimina la nota: quindi tutti i fornitori presenti
          const p = query(collection(db, "notaForni"), where("data", "==", dat), where("nomeF", "==", hi.data().nomeF));
          const querySnapshotp = await getDocs(p);
          querySnapshotp.forEach(async (hip) => {  //1 elimina tutti i prodotti della lista
            await deleteDoc(doc(db, "notaForni", hip.id)); 
          })
        await deleteDoc(doc(db, "addNotaForni", hi.id)); //2
        });
        
        await deleteDoc(colDoc); //3 infine elimina la data
    }
  //_________________________________________________________________________________________________________________
  const createCol = async (e) => {    
    e.preventDefault();  
    var formattedDate = moment(nome).format('DD-MM-YYYY');
    var bol= true
    if(!nome) {            
      notifyError();
      toast.clearWaitingQueue(); 
      return
    }
    const q = query(collection(db, "ordFornDat"), where("data", "==", formattedDate));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data().data);
    if (doc.data().data == formattedDate) {
         notifyErrorDat()
         toast.clearWaitingQueue(); 
        bol=false
    }
    });
    if(bol == true) {
    await addDoc(colleCollectionRef, {
      data: formattedDate,
      dataMilli: nome.getTime(),
      nome,
    });
    setClear();
    }
  };

//*************************************************************** */
//************************************************************** */
//          INTERFACE                                             /
//************************************************************** */
    return ( 
    <> 
    <motion.div
        initial= {{x: "-100vw"}}
        animate= {{x: 0}}
        transition={{ duration: 0.4 }}>

{!matches && 
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate(-1)}}>
      <ArrowBackIcon id="i" /></button> 
    }

    {!matches ? <h1 className='title mt-3'>Ordine Fornitori</h1> : <div style={{marginBottom:"60px"}}></div>} 
    <button onClick={() => {setFlagDelete(!flagDelete)}}>elimina</button>
{/** inserimento Data *************************************************************/}
{sup ===true && (
        <>    
{popupActive &&
  <div>  
      <form className='formSD' onSubmit={createCol}>
      <div>  <button onClick={() => { setPopupActive(false); }} type='button' className="button-close float-end mb-2" >
              <CloseIcon id="i" />
              </button>   
      </div>
      <div className="input_container">
      <Calendar onChange={setData} value={nome} />
      </div>
      <div className="btn_container">
      <Button className='text-white' type='submit' variant="contained">Aggiungi la data</Button>
      </div>
    </form>
  </div> }
{!popupActive &&
  <div className="btn_container mt-5"> 
  <Button className='text-white'  onClick={() => { setPopupActive(true); }}  variant="contained">Aggiungi una data</Button>
  </div>
  }
  </>
    )}
{/*************************************************************************************************** */}

            <div className="container">
              <div className="row">
                <div className="col"> <h3></h3></div>
                <div className="col">

                </div>

                <div className="col mt-4">
          
                </div>
              </div>

          <div className='todo_container' style={{width: "350px"}}>
              <div className='row'>
                      <div className='col colTextTitle'>
                       Ordine Fornitore
                      </div>
                      <div className='col'>
                        <FormControl >
                        <InputLabel id="demo-simple-select-label"></InputLabel>
                        <Select sx={{height:39, marginLeft:-1, width: 150}}
                         labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        defaultValue={8}
                        onChange={(e) => handleChangeDataSelect(e.target.value)}>
                        <MenuItem value={8}>Ultimi 7 giorni</MenuItem>
                        <MenuItem value={31}>Ultimi 30 giorni</MenuItem>
                        <MenuItem value={91}>Ultimi 90 giorni</MenuItem>
                        <MenuItem value={366}>Ultimi 365 giorni</MenuItem>
                        </Select>
                        </FormControl>
                        </div>
                    </div>

                {colle.map((col) => (
                  <div key={col.id}>
                  {col.dataMilli >= localStorage.getItem("bho4") && 
                    <>
                    <div className="diviCol1" > 
                      <div className="row">

                        <div className="col-9">
                        <h3 className='inpTab' onClick={() => {
                            getOrdFornId(col.id, col.nome, col.data)
                            navigate("/addnotaforn");
                            auto();
                            AutoComp2.length = 0
                            }}>{ moment(col.nome.toDate()).format("L") } &nbsp; { moment(col.nome.toDate()).format('dddd') }</h3>
                        </div>
                        <div className="col colIcon" style={{padding:"0px", marginTop:"8px"}}>  
                        <NavigateNextIcon/>          
                        </div>

                        { flagDelete &&
                        <div className="col" style={{padding:"0px", marginTop:"-8px"}}>    
                        <button
                         className="button-delete"
                         onClick={() => {
                            localStorage.setItem("ordFornDataEli", col.data);
                            localStorage.setItem("ordId", col.id);
                            displayMsg();
                            toast.clearWaitingQueue(); 
                            }}>
                          <DeleteIcon id="i" />
                        </button>            
                        </div>
                        }
                      </div>
                    </div>
                    <hr style={{margin: "0"}}/>

                  </>
                  }
                  </div>
                  ))}
              </div>
            </div>
            </motion.div>
           </>
      )
}
export default OrdineForniData;