import React from "react";
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, orderBy, where, getDocs} from 'firebase/firestore';
import EditIcon from '@mui/icons-material/Edit';
import { auth, db } from "../firebase-config";
import DeleteIcon from "@mui/icons-material/Delete";
import { supa, guid, tutti } from '../components/utenti';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Slide } from 'react-toastify';
import Autocomplete from '@mui/material/Autocomplete';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import { TextField } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import { AutoProdForn } from "../pages/AddNotaForn";

export const AutoCompProd = [];

export default function TodoNotaForni({ todo, handleDelete, handleEdit, displayMsg, nomeCli, flagStampa}) {

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true


  const [newQtProdotto, setQtProdotto] = React.useState(todo.quantita);
  const [newProdotto, setNewProdotto] = React.useState(todo.nomeP);

  let navigate = useNavigate();

  const handleInputChange = async (event, value) => {  //funzione per l'anagrafica del cliente
    setNewProdotto(value);
  }

  const handleSubm = (e) => {
    e.preventDefault();
    handleEdit(todo, newQtProdotto, newProdotto)
  };
//******************************************************************** */

  const handleChange = (e) => {
    e.preventDefault();
    if (todo.complete === true) {
      setQtProdotto(todo.quantita);
    } else {
      todo.quantita = "";
      setQtProdotto(e.target.value);
    }
  };
//INTERFACCIA ***************************************************************************************************************
//*************************************************************************************************************************** */
  return (
    <div style={{backgroundColor: "white"}} className="prova">

<form  onSubmit={handleSubm}>
<hr style={{margin: "0"}}/>
    <div className="row " style={{ borderBottom:"solid",  borderWidth: "2px" }}>
{/**************************QUANTITA'******************************************************************* */}
    <div className="col-1" style={{padding:"0px", }}>    
    {sup ===true && ( 
      <>
      <span style={{padding:"0px"}}>
      <input
      style={{ textDecoration: todo.completed && "line-through", textAlign:"center", padding:"0px", width:"30px", marginTop:"0px" }}
        type="text"
        value={todo.quantita === "" ? newQtProdotto : todo.quantita}
        className="inpTab"
        onChange={handleChange}
      />
      </span>
    </>
    )}
    </div>
{/*******************Prodotto********************************************************************************** */}
<div className="col-6" style={{padding: "0px", borderLeft:"solid",  borderWidth: "2px",}}>
      {/***Prodotti********************** */}
    {sup ===true && ( 
      <Autocomplete
      value={newProdotto}
      options={AutoProdForn}
      onInputChange={handleInputChange}
      componentsProps={{ popper: { style: { width: 'fit-content' } } }}
      renderInput={(params) => <TextField {...params}  size="small"/>}
    />
    )}
    </div>
{/***************************************************************************************************** */}
      <div className="col-1" style={{padding: "0px", borderLeft:"solid",  borderWidth: "2px"}}>
      <button hidden
          className="button-edit"
          onClick={() => handleEdit(todo, newQtProdotto, newProdotto)}
        >
        </button>
        {sup ===true && flagStampa==false && (   
        <button type="button" className="button-delete" style={{padding: "0px"}}                          
          onClick={() => {
                localStorage.setItem("IDNOTa", todo.id);
                localStorage.setItem("NomeCliProd", todo.nomeC);
                    displayMsg();
                    toast.clearWaitingQueue(); 
                            }}>
        <DeleteIcon id="i" />
        </button>
        )}
      </div>

    </div>

</form>


    </div>
  );
}