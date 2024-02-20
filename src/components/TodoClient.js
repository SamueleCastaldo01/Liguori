import React from "react";
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, orderBy, where, getDocs} from 'firebase/firestore';
import EditIcon from '@mui/icons-material/Edit';
import { auth, db } from "../firebase-config";
import DeleteIcon from "@mui/icons-material/Delete";
import { supa, guid, tutti } from '../components/utenti';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { padding } from "@mui/system";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export const AutoCompProd = [];

export default function TodoClient({ todo, handleDelete, handleEdit, displayMsg, getCliId, flagDelete}) {

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true


  const [newNomeC, setNomeC] = React.useState(todo.nomeC);
  const [newIndirizzo, setIndirizzo] = React.useState(todo.indirizzo);
  const [newIndirizzoLink, setIndirizzoLink] = React.useState(todo.indirizzoLink);
  const [newPartIva, setPartIva] = React.useState(todo.partitaIva);
  const [newCellulare, setCellulare] = React.useState(todo.cellulare);

  let navigate = useNavigate();

  const handleSubm = (e) => {
    e.preventDefault();
    handleEdit(todo, newNomeC, newPartIva, newCellulare)
  };
//*************************************************************** */
  const auto = async () => {
    const q = query(collection(db, "prodotto"));
    const querySnapshot = await  getDocs(q);
    querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data().nomeP);
  
    let car = { label: doc.data().nomeP }
    AutoCompProd.push(car);
    });
    }
//******************************************************************** */

  const handleChange = (e) => {
    e.preventDefault();
    if (todo.complete === true) {
      setNomeC(todo.nomeC);
    } else {
      todo.nomeC = "";
      setNomeC(e.target.value);
    }
  };
  const handleChangeIva = (e) => {
    e.preventDefault();
    if (todo.complete === true) {
      setPartIva(todo.partitaIva);
    } else {
      todo.partitaIva = "";
      setPartIva(e.target.value);
    }
  };
  const handleChangeCell = (e) => {
    e.preventDefault();
    if (todo.complete === true) {
      setCellulare(todo.cellulare);
    } else {
      todo.cellulare = "";
      setCellulare(e.target.value);
    }
  };
//INTERFACCIA ***************************************************************************************************************
//*************************************************************************************************************************** */
  return (
    <div className="prova">

<form  onSubmit={handleSubm}>
    <div className="row diviCol1">
{/*********************idCliente************************************************************************ */}
  <div className="col-1 diviCol" >
    <h5
      style={{ textDecoration: todo.completed && "line-through"  }}
        type="text"
        className="inpTab">{ todo.idCliente}</h5>

    </div>
{/*********************NomeC************************************************************************ */}
    <div className="col-3 diviCol" >
    <h5
      style={{ textDecoration: todo.completed && "line-through"  }}
        type="text"
        className="inpTab"
        onClick={() => {
            getCliId(todo.id, todo.nomeC)
            navigate("/dashclienti");
            auto();
            AutoCompProd.length = 0
                            }}
        >{ newNomeC}</h5>

    </div>
{/********************Indirizzo************************************************************************* */}
    <div className="col-5 diviCol" style={{padding: "0px"}}>
    <p className="inpTab" ><a
      style={{ textAlign: "center"}}
        href={ newIndirizzoLink }
        target="_blank"
        className="linkTab"
        >{ newIndirizzo.substr(0, 35)}...</a> </p>
    </div>

{/************************partita Iva***************************************************************************** */}
<div className="col-1 diviCol" style={{padding: "0px", width: "100px"}}>
    {sup ===true && ( 
    <input
      style={{ textDecoration: todo.completed && "line-through", fontSize:"14px"}}
        type="text"
        className="inpNumb"
        value={todo.partitaIva === "" ? newPartIva : todo.partitaIva}

        onChange={handleChangeIva}
      />
    )}
    {gui ===true && ( 
    <h4
      style={{ textDecoration: todo.completed && "line-through" }}
        type="text"
        className="inpNumb"
        >{ newPartIva}</h4>
    )}
    </div>

{/***************************************************************************************************** */}
      {flagDelete &&
      <div className="col-1 diviCol" style={{padding:"0px", marginTop:"-8px"}}>
      <button
      hidden
          className="button-edit"
          onClick={() => handleEdit(todo, newNomeC, newPartIva, newCellulare)}
        >
          <EditIcon id="i" />
      </button>
        {sup ===true && (   
        <button type="reset" className="button-delete"                          
          onClick={() => {
                localStorage.setItem("IDscal", todo.id);
                localStorage.setItem("NomeCliProd", todo.nomeC);
                    displayMsg();
                    toast.clearWaitingQueue(); 
                            }}>
          <DeleteIcon id="i" />
        </button>
        )}
      </div>
        }
    </div>

</form>

<hr style={{margin: "0"}}/>
    </div>
  );
}