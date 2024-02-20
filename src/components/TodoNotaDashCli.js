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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { TextField } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import Menu from '@mui/material/Menu';
import { AutoProdCli } from "../pages/AddNota";
import { fontSize } from "@mui/system";

export const AutoCompProd = [];

export default function TodoNotaDashCli({ todo}) {

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true


  const [newQtProdotto, setQtProdotto] = React.useState(todo.qtProdotto);
  const [nomeTinte, setNomeTinte] = React.useState(todo.nomeTinte);
  const [newProdotto, setNewProdotto] = React.useState(todo.prodottoC);
  const [newPrezzoUni, setPrezzoUni] = React.useState(todo.prezzoUniProd);
  const [newPrezzoTot, setnewPrezzoTot] = React.useState(todo.prezzoTotProd);
  const [newT1, setT1] = React.useState(todo.t1);
  const [newT2, setT2] = React.useState(todo.t2);
  const [newT3, setT3] = React.useState(todo.t3);
  const [newT4, setT4] = React.useState(todo.t4);
  const [newT5, setT5] = React.useState(todo.t5);

  const [checked, setChecked] = React.useState(todo.artPreso);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [age, setAge] = React.useState('');

  let navigate = useNavigate();

  const handleChangeChecked = async (event) => {  //handle per il check
    await updateDoc(doc(db, "Nota", todo.id), { artPreso:!checked});
    setChecked(!checked);
  };


//INTERFACCIA ***************************************************************************************************************
//*************************************************************************************************************************** */
  return (
    <div className="prova">

<form  >
<hr style={{margin: "0"}}/>
    <div className="row " style={{ borderBottom:"solid",  borderWidth: "2px" }}>
{/**************************QUANTITA'******************************************************************* */}
    <div className="col-1" style={{padding:"0px", background: todo.simbolo == " " && "#FFFF00" }}>    

      <h3 className="inpTabNota" style={{ textAlign:"center"}}><span style={{ background: todo.simbolo == " " && "#FFFF00"}}>{todo.qtProdotto}</span></h3>

    </div>

{/*******************Prodotto********************************************************************************** */}
<div className="col-6" style={{padding: "0px", borderLeft:"solid",  borderWidth: "2px", background: todo.simbolo == " " && "#FFFF00"}}>
      {/***Prodotti********************** */}

    { todo.flagTinte===false &&( 
      <h3 className="inpTabNota" style={{ marginLeft: "12px"}}><span style={{background: todo.simbolo == " " && "#FFFF00"}}>{todo.prodottoC}</span>  </h3>
    )}

      {/*****Tinte********************************************************************/}
    { todo.flagTinte===true && (
      <>
      <h3 className="inpTabNota" style={{ marginLeft: "12px"}}> {todo.prodottoC} 
      {todo.t1 && <> <span className="inpTabNota" style={{ marginLeft: "35px", textAlign:"center", padding:"0px"}}> {todo.t1} </span>   </> }
      {todo.t2 && <> <span style={{marginLeft: "10px"}}>-</span> <span className="inpTabNota" style={{ marginLeft: "10px", textAlign:"center", padding:"0px"}}> {todo.t2} </span>  </> }
      {todo.t3 && <> <span style={{marginLeft: "10px"}}>-</span> <span className="inpTabNota" style={{ marginLeft: "10px", textAlign:"center", padding:"0px"}}> {todo.t3} </span> </> }
      {todo.t4 && <> <span style={{marginLeft: "10px"}}>-</span> <span className="inpTabNota" style={{ marginLeft: "10px", textAlign:"center", padding:"0px"}}> {todo.t4} </span> </> }
      </h3>
      </>
    )}
    </div>
{/*****************Simbolo************************************************************************************ */}
    <div className="col-1" style={{padding: "0px", background: todo.simbolo == " " && "#FFFF00"}}>
        <h3 className="inpTabNota" style={{color: "red", fontSize: "16px", textAlign: "center"}}>{todo.simbolo}</h3>
    </div>
{/*****************prezzo Unitario************************************************************************************ */}
<div className="col-2" style={{  borderLeft:"solid",  borderWidth: "2px" }}>
        <h3 className="inpTabNota" >{todo.prezzoUniProd}</h3>
    </div>

{/*****************prezzo Totale************************************************************************************ */}
<div className="col-2" style={{ borderLeft:"solid",  borderWidth: "2px"}}>
        <h3 className="inpTabNota" >{todo.prezzoTotProd}</h3>
    </div>


    </div>

</form>


    </div>
  );
}