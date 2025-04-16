import React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from '@mui/icons-material/Search';
import { ToastContainer, toast, Slide } from 'react-toastify';
import { supa, guid, tutti, dipen, primary, rosso } from '../components/utenti';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';


export default function TodoScorta({ todo, handleEdit, handleAddQuant, handleRemQuant, handlePopUp, displayMsg, FlagStampa, flagDelete, handleReparto, handleActiveEdit}) {

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let dip= dipen.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

  const [newNomeP, setNomeP] = React.useState(todo.nomeP);
  const [newIdProdotto, setIdProdotto] = React.useState(todo.idProdotto);
  const [newQuantita, setQuantita] = React.useState(todo.quantita);
  const [newListino, setListino] = React.useState(todo.listino);
  const [newScontistica, setScontistica] = React.useState(todo.scontistica);
  const [fornitore, setFornitore] = React.useState(todo.fornitore);
  const [newSottoScorta, setNewSottoScorta] = React.useState(todo.sottoScorta);
  const [newPa, setNewPa] = React.useState(todo.prezzoIndi);
  const [tipo, setTipo] = React.useState("");
  const [newQuantitaOrdinabile, setnewQuantitaOrdinabile] = React.useState(todo.quantitaOrdinabile);
  const [aggiungi, setAggiungi] = React.useState("");

  const handleSubm = (e) => {
    e.preventDefault();
    handleEdit(todo, newNomeP, newSottoScorta, newQuantitaOrdinabile, newPa, newScontistica, newListino, fornitore, tipo);
    setAggiungi("");
    setTipo("");
  };

  const handleChangePa = (e) => {
    e.preventDefault();
      setNewPa(e.target.value);
      setTipo("Prezzo");
  };

  const handleChangeListino = (e) => {
    e.preventDefault();
      setListino(e.target.value);
      setTipo("Listino");
  };


  const handleChangeScontistica = (e) => {
    e.preventDefault();
      setScontistica(e.target.value);
      setTipo("Scontistica");
  };

  const handleChangeFornitore = (e) => {
    e.preventDefault();
      setFornitore(e.target.value);
  };

  const handleChangeQo = (e) => {
    e.preventDefault();
    if (todo.complete === true) {
      setnewQuantitaOrdinabile(todo.quantitaOrdinabile);
    } else {
      todo.quantitaOrdinabile = "";
      setnewQuantitaOrdinabile(e.target.value);
    }
  };

  const handleChangeAgg = (e)=> {
    var newValue= e.target.value
    console.log(todo.idProdotto)
    if(newValue.includes("+")){
      localStorage.setItem("flagCron", true);
       handleAddQuant(todo, newNomeP, aggiungi);
        setAggiungi("")
      return
    }

    if(newValue.includes("-")){
      localStorage.setItem("flagCron", false);
       handleRemQuant(todo, newNomeP, aggiungi);
        setAggiungi("")
      return
    }

    setAggiungi(e.target.value)

  }
  
//********************************************************************************** */
//                              NICE
//********************************************************************************** */
  return (
    <div className="prova">

    <form  onSubmit={handleSubm}>
    <div className="row d-flex align-items-center">

{/*********************idProdotto************************************************************************ */}
{/** 
  {sup == true && 
  <div className="col-1 diviCol" >
  <h5
    style={{ textDecoration: todo.completed && "line-through", color: primary  }}
      type="text"
      className="inpTab"><b>{ todo.idProdotto}</b></h5>

  </div>
  }
  */}
 
{/*********************PRODOTTO********************************************************** */}
   {sup == true && 
    <div className="col-3 diviCol" onClick={()=> { handleActiveEdit(todo) }}>
    <h4
      style={{ textDecoration: todo.completed && "line-through" }}
        type="text"
        className="inpTab"
        >{ todo.nomeP }</h4>
    </div>
    }
    
  {dip == true &&
    <div className="col-5 diviCol" >
    <h4
      style={{ textDecoration: todo.completed && "line-through" }}
        type="text"
        className="inpTab"
        >{ newNomeP }</h4>
    </div>
  }

 {/********************Categoria*********************************************************** */}
 {sup ===true && ( 
  <div className="col-1 diviCol" >
  {todo.reparto == 1 &&
    <h4 style={{ textDecoration: todo.completed && "line-through" }} type="text" className="inpTab"
        > R. F. </h4> }
          {todo.reparto == 2 &&
    <h4 style={{ textDecoration: todo.completed && "line-through" }} type="text" className="inpTab"
        > R. M. </h4> }
      {todo.reparto == 3 &&
    <h4 style={{ textDecoration: todo.completed && "line-through" }} type="text" className="inpTab"
        > R. A. </h4> }
    </div>
    )}
{/********************QUANTITA'*********************************************************** */}
{sup ===true && ( 
<div className="col-1 diviCol" style={{padding: "0px", width:"80px"}}>
    {ta ===true && ( 
    <h4
      style={{ textDecoration: todo.completed && "line-through" }}
        type="text"
        onBlur={handleSubm}
        className="inpTab"
      >{todo.quantita === "" ? newQuantita : todo.quantita}</h4>
    )}
</div>
 )}

 {dip ===true && ( 
<div className="col-2 diviCol" style={{padding: "0px", position:"relative"}}>
    {ta ===true && ( 
    <h4
      style={{ textDecoration: todo.completed && "line-through" }}
        type="text"
        onBlur={handleSubm}
        className="inpTab"
      >{todo.quantita === "" ? newQuantita : todo.quantita}</h4>
    )}
</div>
 )}

 {/********************PR'*********************************************************** */}
  {sup == true && 
  <>
  <div className="col-1 diviCol" style={{padding: "0px"}}>
  <input
    style={{ textDecoration: todo.completed && "line-through", fontSize:"14px" }}
      type="text"
      onBlur={handleSubm}
      value={newPa}
      className="inpNumb"
      onChange={handleChangePa}
    />
  </div>
  </>
  }

   {/********************Listino'*********************************************************** */}
   {sup == true && 
  <>
  <div className="col-1 diviCol" style={{padding: "0px"}}>
  <input
    style={{ textDecoration: todo.completed && "line-through", fontSize:"14px" }}
      type="text"
      onBlur={handleSubm}
      value={newListino}
      className="inpNumb"
      onChange={handleChangeListino}
    />
  </div>
  </>
  }

   {/********************Scontistica'*********************************************************** */}
   {sup == true && 
  <>
  <div className="col-1 diviCol" style={{padding: "0px"}}>
  <input
    style={{ textDecoration: todo.completed && "line-through", fontSize:"14px" }}
      type="text"
      onBlur={handleSubm}
      value={newScontistica}
      className="inpNumb"
      onChange={handleChangeScontistica}
    />
  </div>
  </>
  }

  {/********************SOTTOSCORTA'*********************************************************** */}
  {/* 
{sup ===true && ( 
  <div className="col-1 diviCol" style={{padding: "0px"}}>
    <input
      style={{ textDecoration: todo.completed && "line-through", fontSize:"14px" }}
        type="text"
        onBlur={handleSubm}
        value={todo.sottoScorta === "" ? newSottoScorta : todo.sottoScorta}
        className="inpNumb"
        onChange={handleChangeSs}
      />
  </div>
    )}
  */}
  {/********************QUANTITA ORDINABILE'*********************************************************** */}
   {/* 
{sup ===true && ( 
  <div className="col-1 diviCol" style={{padding: "0px"}}>
    <input
      style={{ textDecoration: todo.completed && "line-through", fontSize:"14px" }}
        type="text"
        onBlur={handleSubm}
        value={todo.quantitaOrdinabile === "" ? newQuantitaOrdinabile : todo.quantitaOrdinabile}
        className="inpNumb"
        onChange={handleChangeQo}
      />
  </div>
    )}
   */}

  {/********************FORNITORE'*********************************************************** */}
  {sup ===true && ( 
    <div className="col-2 d-flex align-items-center justify-content-center">
      <input
      style={{ textDecoration: todo.completed && "line-through", fontSize:"14px" }}
         min="1"
        value={fornitore}
        onBlur={handleSubm}
        onChange={handleChangeFornitore}
        className="inpNumb"
      />
    </div>
  )} 

{/**********************AGGIUNGI************************************************************* */}
{sup ===true && ( 
<div className="col-1 diviCol" style={{padding: "0px"}}>
    <input
      style={{ textDecoration: todo.completed && "line-through", fontSize:"14px" }}
         min="1"
        value={aggiungi}
        onChange={handleChangeAgg}
        className="inpNumb"
      />
</div>
)}

{dip ===true && ( 
<div className="col-2 diviCol1" style={{padding: "0px", position:"relative", right:"2%", width:"40px"}}>
    <input
      style={{ textDecoration: todo.completed && "line-through", fontSize:"14px" }}
        type="number" min="1"
        value={aggiungi}
        onChange={handleChangeAgg}
        className="inpNumb"
      />
</div>
)}
{/***************************BUTTON aggiungi e rimuovi******************************************************** */}
    { (FlagStampa==false && flagDelete== false) &&
    <div className="col diviCol d-flex gap-3 justify-content-center my-1" style={{padding:"0px", paddingRight: "15px"}}>
      <button 
      className="butAddProd mt-0" style={{width: "40px"}}
      type="button"
      onClick={() =>{ { localStorage.setItem("flagCron", true); handleAddQuant(todo, newNomeP, aggiungi); setAggiungi("") }}}>+</button>
      <button
      className="butRemProd" style={{width: "40px"}}
      type="button"
      onClick={() =>{ {localStorage.setItem("flagCron", false); handleRemQuant(todo, newNomeP, aggiungi); setAggiungi("") }}}>-</button>
    </div> }

    <button
        hidden
          className="button-edit"
          type="submit">
          <EditIcon id="i" />
    </button> 
{/***************************BUTTON del******************************************************** */}
{ flagDelete &&
  <>
{ FlagStampa==false &&
    <div className="col-1 diviCol" style={{padding:"0px", marginTop:"-8px"}}>

{ /*
        <button
          className="button-edit"
          type="button"
          onClick={() =>{ { handlePopUp(todo.image, todo.nota); }}}>
          <SearchIcon id="i" />
        </button> 
     */ }
        
        {sup ===true && FlagStampa==false && (   
        <button className="button-delete" type="button"   style={{ color: rosso }}
              onClick={() => {
                    localStorage.setItem("IdProd", todo.id);
                    localStorage.setItem("IdProdP", todo.idProdotto);
                    localStorage.setItem("NomeProd", todo.nomeP);
                    displayMsg();
                    toast.clearWaitingQueue(); 
                            }}>
          <DeleteIcon id="i" />
        </button>
        )}
    </div>
  }
  </>
  }
    </div>
    </form>
    <hr style={{margin: "0"}}/>
    </div>
  );
}