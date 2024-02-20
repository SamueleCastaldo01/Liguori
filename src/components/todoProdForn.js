import React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from '@mui/icons-material/Search';
import { ToastContainer, toast, Slide } from 'react-toastify';
import { supa, guid, tutti } from '../components/utenti';


export default function TodoProdForn({ todo, toggleComplete, handleEdit, displayMsg}) {

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true


  const [newNomeP, setNomeP] = React.useState(todo.nomeP);

  const handleSubm = (e) => {
    e.preventDefault();
    console.log("heeey")
    handleEdit(todo, newNomeP);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (todo.complete === true) {
      setNomeP(todo.nomeP);
    } else {
      todo.nomeP = "";
      setNomeP(e.target.value);
    }
  };

//********************************************************************************** */
//                              NICE
//********************************************************************************** */
  return (
    <div className="prova">

    <hr style={{margin: "0"}}/>

    <form  onSubmit={handleSubm}>
    <div className="row ">
{/*********************NomeProdotto********************************************************** */}
    <div className="col-9 diviCol" >
    {sup ===true && ( 
    <input
      style={{ textDecoration: todo.completed && "line-through", fontSize:"14px" }}
        type="text"
        onBlur={handleSubm}
        value={todo.nomeP === "" ? newNomeP : todo.nomeP}
        className="inpNumb"
        onChange={handleChange}
      />
    )}
    {gui ===true && ( 
    <h4
      style={{ textDecoration: todo.completed && "line-through" }}
        type="text"
        className="inpTab"
        >{ newNomeP}</h4>
    )}
    </div>
{/*******************Button**************************************************************** */}

    <div className="col-2 diviCol" style={{padding:"0px", marginTop:"-8px"}}>
        <button
        hidden
          className="button-edit"
          onClick={() =>{ { handleEdit(todo, newNomeP); }}}
        >
          <EditIcon id="i" />
        </button>

        {sup ===true && (   
        <button className="button-delete"
              onClick={() => {
                    localStorage.setItem("IdProdFor", todo.id);
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