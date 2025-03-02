import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, where, getDocs, orderBy, serverTimestamp, limit} from 'firebase/firestore';
import useMediaQuery from '@mui/material/useMediaQuery';
import moment from 'moment';
import { getCountFromServer } from 'firebase/firestore';
import { TextField } from '@mui/material';
import { db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { notifyErrorCli, notifyUpdateCli, notifyErrorCliEm, notiUpdateScalet } from '../components/Notify';
import Autocomplete from '@mui/material/Autocomplete';
import { AutoDataScal } from './AddNota';
import { supa, guid, tutti } from '../components/utenti';
import PrintIcon from '@mui/icons-material/Print';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export const AutoProdCli = [];

function Row(props) {
    const { row } = props;
    const {dataSc} = props;
    const {quot} = props;
    const {noti} = props;
    const {nomeC} = props;
    const [open, setOpen] = React.useState(false);
    const [Quota, setQuota] = React.useState(quot);
    const [nomC, setnomC] = React.useState(nomeC);
    const [nota, setNota] = React.useState(noti);

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

    const SomAsc = async () => {  //qui fa sia la somma degli asc che della quota, tramite query

      }
//******************************************************************************************************************** */
const handleEditQuota = async (id, sommaTotale, quotaV, idCliente, nomeCli) => {  
  let debTot;
  let ripDebito;

  // Query per trovare il documento del debito (filtrando per nome del cliente)
  const q = query(collection(db, "debito"), where("nomeC", "==", nomeCli));
  const querySnapshot = await getDocs(q);
  
  // Per ogni documento debito (in genere ce n'è uno solo)
  querySnapshot.forEach(async (hi) => {
    // Salvo il valore attuale del debito (vecchio valore)
    const oldDeb1 = hi.data().deb1;
    
    // Se esiste una quota vecchia, "ripristino" il debito aggiungendo quella quota
    if (quotaV != 0) {
      ripDebito = (+oldDeb1) + (+quotaV);
      debTot = +ripDebito - (+Quota);
    } else {
      debTot = +oldDeb1 - (+Quota);
    }
    
    // Tronca il nuovo debito a 2 decimali
    const debTrunc = debTot.toFixed(2);
    
    // Aggiorna il documento "debito" con il nuovo valore
    await updateDoc(doc(db, "debito", hi.id), { deb1: debTrunc });
    
    await addDoc(collection(db, "cronologiaDeb"), {
      autore: "Liguori srl",
      createdAt: serverTimestamp(),
      deb1: debTrunc,   // nuovo debito
      debv: oldDeb1,    // vecchio debito
      idCliente: idCliente,  // deve essere disponibile nel contesto (ad es. prop)
      nomeC: nomeCli
    });
  });
  
  // Aggiorna il documento "addNota" con la nuova quota e imposta lo stato "completa" a "2"
  await updateDoc(doc(db, "addNota", id), { quota: Quota, completa: "2" }); 
};


    
    const handleEditNota = async (id) => {
      const notaDaSalvare = nota || ""; 

      await updateDoc(doc(db, "addNota", id), { note: notaDaSalvare });
        notifySuccess("Nota aggiornata");
      };
  
    return (
      <React.Fragment>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell style={{backgroundColor: row.completa=="2" ? "#0d730d" : "transparent"}} component="th" scope="row">
            {row.nomeC}
          </TableCell>
          <TableCell align="right">{row.sommaTotale}</TableCell>
          <TableCell align="right">
          <input value={Quota} style={{textAlign:"center", padding: "0px", width:"50px", border:"none"}} 
      onChange={(event) => {
      setQuota(event.target.value);}}
    /></TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>Note</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                      <TableRow >
                        <TableCell style={{padding: "0px"}}> <textarea value={nota}  style={{ padding: "0px", width:"220px", border:"none"}} 
                        onChange={(event) => {
                        setNota(event.target.value);}}></textarea></TableCell>
                      <TableCell><button onClick={()=> {handleEditNota(row.id); handleEditQuota(row.id, row.sommaTotale, row.quota, row.idCliente, row.nomeC)}}>conferma</button></TableCell>
                      </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }

function ScalettaDataDip({notaDat, getNotaDip }) {
 
    const [todos, setTodos] = React.useState([]);


    const [dataSc, setDataSc] = React.useState(notaDat);
  
    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))   //confronto con uid corrente
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
  
    const scalCollectionRef = collection(db, "addNota"); 
    const matches = useMediaQuery('(max-width:600px)');  //media query true se è uno smartphone
  
    let navigate = useNavigate();
  
    function handleInputChange(event, value) {
        setDataSc(value)
    }

      const handleChangeDataScaletta = (e) => {
        setDataSc(moment(e.target.value).format("DD-MM-YYYY"));
        };
  
  //********************************************************************************** */  
    React.useEffect(() => {
      const collectionRef = collection(db, "addNota");
      const q = query(collectionRef, where("scalettaData", "==", dataSc), orderBy("scalettaOrdine", "asc"));
  
      const unsub = onSnapshot(q, (querySnapshot) => {
        let todosArray = [];
        querySnapshot.forEach((doc) => {
          todosArray.push({ ...doc.data(), id: doc.id });
        });
        setTodos(todosArray);
      });
      localStorage.removeItem("OrdId");
      return () => unsub();
    }, [dataSc]);


    //**************************************************************************** */
    const actions = [
      { icon: <PrintIcon />, name: 'Stampa'},
    ];
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
      <input
        type="date"
        value={moment(dataSc, "DD-MM-YYYY").format("YYYY-MM-DD")} // Converti per l'input
        onChange={(e) => handleChangeDataScaletta(e)} // Salva in formato gg-mm-yyyy
      />
      </div>
      </div>

<div  style={{padding: "0px"}}>
  <ToastContainer/>
 {/********************Tabella con MUI***************************************** */}
 <TableContainer sx={ {marginTop: "40px", height: "42rem", bgcolor: "#EFEFEF", borderRadius: "10px", boxShadow: "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;"}} component={Paper}>
      <Table stickyHeader sx={{ minWidth: 200  }} aria-label="simple table">
        <TableHead>
        <TableRow align="left">
        <span>

        </span>
        </TableRow>
          <TableRow>
          <TableCell />
            <TableCell><span className='coltext'>Cliente</span></TableCell>
            <TableCell align="right"><span className='coltext'>Prezzo(€)</span></TableCell>
            <TableCell align="right"><span className='coltext'>Quota(€)</span></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {todos.map((row) => (
            <Row key={row.id} row={row} quot={row.quota} noti={row.note} idnote={row.idNota} quotVec={row.quota} nomeC={row.nomeC}/>
          ))}
        </TableBody>
      </Table>
    </TableContainer>


</div>
      </>
      
        )
  }
export default ScalettaDataDip;