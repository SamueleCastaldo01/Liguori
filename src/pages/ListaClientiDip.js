import React, { useEffect, useState, useRef } from 'react'
import {collection, deleteDoc, doc, onSnapshot, query, where, orderBy, serverTimestamp, limit} from 'firebase/firestore';
import useMediaQuery from '@mui/material/useMediaQuery';
import moment from 'moment';
import { getCountFromServer } from 'firebase/firestore';
import { TextField } from '@mui/material';
import { db } from "../firebase-config";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { notifyErrorCli, notifyUpdateCli, notifyErrorCliEm } from '../components/Notify';
import Autocomplete from '@mui/material/Autocomplete';
import { AutoDataScal } from './AddNota';
import { supa, guid, tutti } from '../components/utenti';
import PrintIcon from '@mui/icons-material/Print';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export const AutoProdCli = [];


function ListaClientiDip() {
 
    const [todos, setTodos] = React.useState([]);

    const [popupActive, setPopupActive] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");  //search
    const inputRef= useRef();
  
    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))   //confronto con uid corrente
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
  
    const matches = useMediaQuery('(max-width:600px)');  //media query true se è uno smartphone
  
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
            handleDelete(localStorage.getItem("scalId"));
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
      const cachedData = localStorage.getItem("clientes");
      if (cachedData) {
        setTodos(JSON.parse(cachedData));
      }
    
      const collectionRef = collection(db, "clin");
      const q = query(collectionRef, orderBy("nomeC"));
    
      const unsub = onSnapshot(q, (querySnapshot) => {
        let todosArray = [];
        querySnapshot.forEach((doc) => {
          todosArray.push({ ...doc.data(), id: doc.id });
        });
        console.log(todosArray);
        setTodos(todosArray);
        localStorage.setItem("clientes", JSON.stringify(todosArray)); // Aggiorna la cache
      });
    
      return () => unsub();
    }, []);

    //_____________________________________________________________________________________
    const handleDelete = async (id) => {
      const colDoc = doc(db, "Scaletta", id); 
      //infine elimina la data di AddNota
      await deleteDoc(colDoc); 
    };
  //**************************************************************************** */
  //                              NICE
  //********************************************************************************** */
      return ( 
      <>  
    {/**************NAVBAR MOBILE*************************************** */}
    <div className='navMobile row'>
    <div className='col-2'></div>
      <div className='col' style={{padding: 0}}>
      <p className='navText'> Clienti </p>
      </div>
      <div className='col' style={{paddingRight: "20px"} }>
      <TextField
      sx={{
        marginTop:"5px", float: "right",
        "& .MuiInputBase-root": { height: "50px", width:"180px" },
        "& .MuiButtonBase-root.MuiAutocomplete-clearIndicator": {  
            color: "white",
         },
         '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'white',
      },
      '&:hover fieldset': {
        borderColor: 'white',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'white',
      },
    },
    fieldset: {
              border: "1px solid white",
              borderRadius: "16px",
              boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
            },
            input: {
                color: "#EFEFEF",
                position: "relative",
                bottom: "2.5px"
            }
          }}
      inputRef={inputRef}
      className="inputSearch"
      onChange={event => {setSearchTerm(event.target.value)}}
      type="text"
      placeholder="Ricerca Cliente"
      InputProps={{
      startAdornment: (
      <InputAdornment position="start">
      <SearchIcon color='primary'/>
      </InputAdornment>
                ),
                }}
       variant="outlined"/>
      </div>
      </div>

<div  style={{padding: "0px"}}>

 {/********************Tabella con MUI***************************************** */}
 <TableContainer sx={ {marginTop: "40px", height: "43rem", bgcolor: "#EFEFEF", borderRadius: "10px", boxShadow: "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;"}} component={Paper}>
      <Table stickyHeader sx={{ minWidth: 200  }} aria-label="simple table">
        <TableHead>
        <TableRow align="left">
        <span>

        </span>
        </TableRow>
          <TableRow>
            <TableCell><span className='coltext'>Cliente</span></TableCell>
            <TableCell align="right"><span className='coltext'>Indirizzo</span></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {todos.filter((val) => {
    if (searchTerm === "") {
        return val;
    } else if (val.nomeC.toLowerCase().trim().includes(searchTerm.toLowerCase().trim())) {
        return val;
    }
}).map((todo) => (
    <TableRow
        key={todo.id}
        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
        <TableCell component="th" scope="row">{todo.nomeC}</TableCell>
        <TableCell align="right">
            <a href={todo.indirizzoLink} target="_blank" rel="noopener noreferrer">
                {todo.indirizzo}
            </a>
        </TableCell>
    </TableRow>
))}
        </TableBody>
      </Table>
    </TableContainer>


</div>
      </>
      
        )
  }
export default ListaClientiDip;