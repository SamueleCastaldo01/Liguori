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
import { AutoProdCli } from "../pages/OrdineCliData";
import { fontSize } from "@mui/system";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import { FlareSharp } from "@mui/icons-material";


export default function TodoNota({ todo, handleDelete, handleEdit, displayMsg, nomeCli, flagStampa, Completa, SommaTot, flagBho}) {

  const [todosProdottiCli, setTodosProdottiCli] = React.useState([]);

  const [flagProd, setFlagProd] = React.useState("1");

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true


  const [newQtProdotto, setQtProdotto] = React.useState(todo.qtProdotto);
  const [nomeTinte, setNomeTinte] = React.useState(todo.nomeTinte);
  const [newProdotto, setNewProdotto] = React.useState(todo.prodottoC);
  const [newPrezzoUni, setPrezzoUni] = React.useState(todo.prezzoUniProd);
  const [newPrezzoTot, setnewPrezzoTot] = React.useState(todo.prezzoTotProd);
  const [meno, setMeno] = React.useState(todo.meno);
  const [newT1, setT1] = React.useState(todo.t1);
  const [newT2, setT2] = React.useState(todo.t2);
  const [newT3, setT3] = React.useState(todo.t3);
  const [newT4, setT4] = React.useState(todo.t4);
  const [newT5, setT5] = React.useState(todo.t5);

  const [age, setAge] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState(null);

  let navigate = useNavigate();

  {/********** 
//vado a prendere i prodotti del cliente--------------------------------
  React.useEffect(() => {
    console.log("entrato")
    const collectionRef = collection(db, "prodottoClin");
    const q = query(collectionRef, where("author.idCliente", "==", todo.idCliente));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });

      setTodosProdottiCli(todosArray);
    });
    return () => unsub();
  }, [flagProd]);
*/}

  const handleInputChange = async (event, value) => {  //trova il prezzo unitario del prodotto
    setNewProdotto(value);
    AutoProdCli.map((nice) => {
        if (value == nice.label) {   //se i nomi dei prodotti sono uguali allora si prende il prezzo unitario
          setPrezzoUni(nice.prezzoUni);
        }
    })
  }

  const handleChangeTintSelect = async (event) => {  //funzione che si attiva quando selezioni l'autocomplete delle tinte
    setNewProdotto(event.target.value);
    AutoProdCli.map((nice) => {
      if (event.target.value == nice.label) {   //se il nome della tinta è uguale ad un prodotto dell'array allora si prende il prezzo unitario
        setPrezzoUni(nice.prezzoUni);
      }
  })
  };
  //****************************************************************************************************************************** */
  const handlePrezzUniUpd = async (e) => {  // funzione che si attiva quando cambio il prezzo unitario del prodotto
    e.preventDefault();
    var idProdCli;
    let index = 0;

    for(let i = 0; i < AutoProdCli.length; i++) {  // va a fare il for fin quando non rispetta la condizione
      let obj = AutoProdCli[i];
        if(todo.prodottoC === obj.label) {
            index = i;      //salva l'indice per poi aggiornare l'array di oggetti
            idProdCli= obj.id;   //va a salvarsi l'id di prodottoClin
             break;
          }
    }
    AutoProdCli[index] = {  //aggiorna  l'array
      id: idProdCli,
      prezzoUni: newPrezzoUni,
      label: todo.prodottoC,
    };
  await updateDoc(doc(db, "prodottoClin", idProdCli),  { prezzoUnitario: newPrezzoUni });  //aggiorna il prezzoUni di prodottoCli nel database
  handleEdit(todo, newQtProdotto, newProdotto, newPrezzoUni, newPrezzoTot, newT1, newT2, newT3, newT4, newT5, nomeTinte) //aggiorna il prezzo unitario nel database
  };
  //****************************************************************************************************************************** */
  const handleSubm = (e) => {
    e.preventDefault();
    handleEdit(todo, newQtProdotto, newProdotto, newPrezzoUni, newPrezzoTot, newT1, newT2, newT3, newT4, newT5, nomeTinte)
  };

  const handleClose = () => {  //chiude il menu
    setAnchorEl(null);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  //***************************************************************************************** */
  async function sommaTotChange(meno) {
    var conTinte=0;    //alogoritmo per le tinte
    var man= meno
    if (man<= 0 || !man) {
      man = 0;
    }
    if(todo.t1) {conTinte=conTinte+1}
    if(todo.t2) {conTinte=conTinte+1}
    if(todo.t3) {conTinte=conTinte+1}
    if(todo.t4) {conTinte=conTinte+1}
    if(todo.t5) {conTinte=conTinte+1}
    if(todo.flagTinte == false){ 
    conTinte=1 }
    var preT= (conTinte*(todo.qtProdotto - man))*todo.prezzoUniProd;  //qui va a fare il prezzo totale del prodotto in base alla quantità e al prezzo unitario
    var somTrunc = preT.toFixed(2);
    await updateDoc(doc(db, "Nota", todo.id), {prezzoTotProd:somTrunc});
  } 
  
  const handleChangeNo = async (event) => {   //aggiorna sia il simbolo del prodotto, e il suo prezzo totale diventa 0, in questo modo non va a fare la somma con il resto
    setMeno(0);
    await updateDoc(doc(db, "Nota", todo.id), { simbolo:"(NO)", prezzoTotProd:0, meno:0});
    handleClose()
  };

  const handleChangeMeno = async (event) => {   //aggiorna sia il simbolo del prodotto, e il suo prezzo totale diventa 0, in questo modo non va a fare la somma con il resto
    if((todo.simbolo=="(NO)" && !todo.simbolo2) || (todo.simbolo=="1"  && !todo.simbolo2)) {   //se il simbolo è no, va a calcolarsi prima il suo prezzo totale del prodotto e poi aggiorna il simbolo e il prezzo
      sommaTotChange()
      setMeno(0);
    }
    await updateDoc(doc(db, "Nota", todo.id), { simbolo:"1"});
    SommaTot();
    handleClose()
  };

  const handleChangeEvi = async (event) => {  //si attiva quando vado ad evidenziare
    if(todo.simbolo=="(NO)" && !todo.simbolo2 || (todo.simbolo=="1"  && !todo.simbolo2)) {   //se il simbolo è no, va a calcolarsi prima il suo prezzo totale del prodotto e poi aggiorna il simbolo e il prezzo
      sommaTotChange();
    }
    setMeno(0);
    await updateDoc(doc(db, "Nota", todo.id), { simbolo:" ", meno:0});
    handleClose()
  };

  const handleChangeEt = async (event) => {  //si attiva quando vado ad evidenziare
    if (todo.flagEt == false) {
      await updateDoc(doc(db, "Nota", todo.id), { flagEt: true});  //aggiorno il flagEt
    }
    if(todo.flagEt == true) {
      await updateDoc(doc(db, "Nota", todo.id), { flagEt: false});  //aggiorno il flagEt
    }

    handleClose()
  };

  const handleChangeInterro = async (event) => {
    if(todo.simbolo=="(NO)"  && !todo.simbolo2 || (todo.simbolo=="1"  && !todo.simbolo2)) {   //se il simbolo è no, va a calcolarsi prima il suo prezzo totale del prodotto e poi aggiorna il simbolo e il prezzo
      sommaTotChange();
    }
    setMeno(0);
    await updateDoc(doc(db, "Nota", todo.id), { simbolo:"?", meno:0});
    handleClose()
  };

  const handleChangeX = async (event) => {
    if(todo.simbolo=="(NO)"  && !todo.simbolo2 || (todo.simbolo=="1"  && !todo.simbolo2)) {   //se il simbolo è no, va a calcolarsi prima il suo prezzo totale del prodotto e poi aggiorna il simbolo e il prezzo
      sommaTotChange();
    }
    setMeno(0);
    await updateDoc(doc(db, "Nota", todo.id), { simbolo:"X", meno:0});
    handleClose()
  };

  const handleChangeRemMenu = async (event) => {
    if(todo.simbolo =="(NO)" && !todo.simbolo2 || (todo.simbolo=="1"  && !todo.simbolo2)) {   //se il simbolo è no e simbolo2 non è presente, allora va a fare il prezzo qt* prezzo unitario
      sommaTotChange();
    }
    setMeno(0);
    await updateDoc(doc(db, "Nota", todo.id), { simbolo:"", meno:0});
    handleClose();
    setMeno(0);
  };

  const handleChangeSospe = async (event) => {   // il prezzo totale deve essere zero perche non deve fare il calcolo, e cambiare il simbolo 2, perché puo sempre essere evidenziato e altro
    await updateDoc(doc(db, "Nota", todo.id), { prezzoTotProd:0, simbolo2:"-"});
    handleClose();
  };

  const handleChangeInOmaggio = async (event) => {
    await updateDoc(doc(db, "Nota", todo.id), { prezzoTotProd:0, simbolo2:"In Omaggio"});
    handleClose();
  };

  const handleChangeGP = async (event) => {
    await updateDoc(doc(db, "Nota", todo.id), { prezzoTotProd:0, simbolo2:"G. P."});
    handleClose();
  };

  const handleChangeRem2 = async (event) => {
    if((todo.simbolo2=="-" || todo.simbolo2 == "In Omaggio" || todo.simbolo2 == "G. P.") && todo.simbolo!="(NO)" ) {   //se è vero va a calcolarsi prima il suo prezzo totale del prodotto e poi aggiorna il simbolo e il prezzo
      sommaTotChange(todo.meno);
    }
    await updateDoc(doc(db, "Nota", todo.id), { simbolo2:""});
    handleClose();
  };

  const handleChangeMenDb = async (value) => {
    var cia = value;
    console.log(todo.qtProdotto,"<", cia)
    if( +cia<=0 || +todo.qtProdotto<(+cia))  //controllo che la qt sia maggiore del valore inserito, altrimenti lo riazzera, oppure anche nel caso in cui si mette un valore negativo
    {
      cia=0
    }
   await updateDoc(doc(db, "Nota", todo.id), { meno: cia});  //va ad aggiornare il db il simbolo meno
   if(!todo.simbolo2) {   //se esiste il simbolo2 allora va a fare la somma, altrimenti non fai nulla
    sommaTotChange(cia);
   }
   setMeno(cia)
   SommaTot();
  };
 //******************************************************************** */ 

//******************************************************************** */
//handle change
const handleChangeAge = (event) => {
  setAge(event.target.value);
};

  const handleChange = (e) => {
    e.preventDefault();
    if (todo.complete === true) {
      setQtProdotto(todo.qtProdotto);
    } else {
      todo.qtProdotto = "";
      setQtProdotto(e.target.value);
    }
  };
  const handleChangePrezzoUni = (e) => {
    e.preventDefault();
    if (todo.complete === true) {
      setPrezzoUni(todo.prezzoUniProd);
    } else {
      todo.prezzoUniProd = "";
      setPrezzoUni(e.target.value);
    }
  };
  const handleT1 = (e) => {
    e.preventDefault();
    if (todo.complete === true) {
      setT1(todo.t1);
    } else {
      todo.t1 = "";
      setT1(e.target.value);
    }
  };
  const handleT2 = (e) => {
    e.preventDefault();
    if (todo.complete === true) {
      setT2(todo.t2);
    } else {
      todo.t2 = "";
      setT2(e.target.value);
    }
  };
  const handleT3 = (e) => {
    e.preventDefault();
    if (todo.complete === true) {
      setT3(todo.t3);
    } else {
      todo.t3 = "";
      setT3(e.target.value);
    }
  };
  const handleT4 = (e) => {
    e.preventDefault();
    if (todo.complete === true) {
      setT4(todo.t4);
    } else {
      todo.t4 = "";
      setT4(e.target.value);
    }
  };

//INTERFACCIA ***************************************************************************************************************
//*************************************************************************************************************************** */
  return (
    <div className="prova">

<form  onSubmit={handleSubm}>
<hr style={{margin: "0"}}/>
{((sup === true  && Completa == "1" && todo.simbolo != "(NO)") || 
  (sup === true  && (Completa == "0" || Completa == "5")) ||
  (sup === true  && Completa == "2")) &&(   //non fa visualizzare i prodotti no, quando confermi la nota
    <div className="row " style={{ borderBottom:"solid",  borderWidth: "2px" }}>
{/**************************QUANTITA'******************************************************************* */}
    <div className="col-1" style={{padding:"0px",
     background: (todo.simbolo == " " || (todo.prodottoC == "ROIAL ASCIUGAMANO 60 pz" && (todo.simbolo != "(NO)" && todo.simbolo != "X"))) && "#FFFF00" }}>    
    {sup ===true && (Completa == 0 || Completa == 5) &&  ( 
      <>
      <span style={{padding:"0px"}}>
      <input
      style={{ textDecoration: todo.completed && "line-through", textAlign:"center", padding:"0px", width:"60px", marginTop:"0px"}}
      onBlur={handleSubm}
        type="number"
        value={todo.qtProdotto === "" ? newQtProdotto : todo.qtProdotto}
        className="inpTab"
        onChange={handleChange}
      />
      </span>
    </>
    )}

    {sup ===true && (Completa == 1 || Completa == 2) &&   
      <>
      {todo.simbolo== "1" ?
    <h3 className="inpTabNota" style={{ textAlign:"center"}}><span style={{ background: todo.simbolo == " " && "#FFFF00"}}>{+todo.qtProdotto-(+todo.meno)}</span></h3> :
    <h3 className="inpTabNota" style={{ textAlign:"center"}}><span style={{ background: todo.simbolo == " " && "#FFFF00"}}>{todo.qtProdotto}</span></h3>
      }
      </>
    }
    </div>

{/*******************Prodotto********************************************************************************** */}
<div className="col-6" style={{padding: "0px", borderLeft:"solid",  borderWidth: "2px",
 background: (todo.simbolo == " " || (todo.prodottoC == "ROIAL ASCIUGAMANO 60 pz" && (todo.simbolo != "(NO)" && todo.simbolo != "X"))) && "#FFFF00", height: "40px"}}>
      {/***Prodotti non completati (non tinte)********************** */}
    {sup ===true && todo.flagTinte===false && (Completa == 0 || Completa == 5) &&( 
      <>
      <Autocomplete
      clearIcon
      freeSolo
      value={newProdotto}
      options={AutoProdCli}
      onInputChange={handleInputChange}
      onBlur={handleSubm}
      componentsProps={{ popper: { style: { width: 'fit-content', border: "none" } } }}
      renderInput={(params) => <TextField {...params}  size="small"/>}
    />
    {/*********Simboli*************************************************** */}
      { todo.simbolo != "1" &&
      <h3 className="simboloNota" style={{color: "red", fontSize: "16px"}}>{todo.simbolo}</h3>
       }
       {todo.flagEt == true && (
        <>
        <span className="simboloNota" style={{left: "150px", bottom: "40px"}}>+ET.</span>
        </>
      )}
       {(todo.simbolo== "1" && (Completa == 0 || Completa == 5)) && <h3 className="simboloNota" style={{color: "red", fontSize: "16px", textAlign: "center", left:"150px"}}> (-
                        <input
                         onChange={(e) => setMeno(e.target.value)}
                         onBlur={(e) => handleChangeMenDb(e.target.value)}
                          type="number" value={meno} style={{border: "1px solid", width:"35px"}}></input> ) </h3> 
}
    </>
    )}
   {/*****PRD completati************** */}
    {sup ===true && todo.flagTinte===false && (Completa == 1 || Completa == 2 ) &&( 
      <>
      <h3 className="inpTabNota" style={{ marginLeft: "12px"}}> <span style={{background: todo.simbolo == " "  && "#FFFF00"}}>{todo.prodottoC}
      </span>
         {todo.simbolo=="X" && <span style={{color: "red", fontSize: "16px"}}> {todo.simbolo} </span> } 
       </h3>
      </>
    )}

      {/*****Tinte********************************************************************/}
    {sup ===true && todo.flagTinte===true && (Completa == 0 || Completa == 5) &&( 
      <>
        <div className="divTinte"><span>
        <FormControl >
        <InputLabel id="demo-simple-select-label"></InputLabel>
        <Select sx={{height:39, marginLeft:-1}}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={newProdotto}
          onChange={handleChangeTintSelect}
          onBlur={handleSubm}
        >
          <MenuItem value={"TECH"}>TECH</MenuItem>
          <MenuItem value={"KF"}>KF</MenuItem>
          <MenuItem value={"KR"}>KR</MenuItem>
          <MenuItem value={"KG"}>KG</MenuItem>
          <MenuItem value={"K10"}>K10</MenuItem>
          <MenuItem value={"CB"}>CB</MenuItem>
          <MenuItem value={"NUAGE"}>NUAGE</MenuItem>
          <MenuItem value={"ROIAL"}>ROIAL</MenuItem>
          <MenuItem value={"VIBRANCE"}>VIB</MenuItem>
          <MenuItem value={"EXTREMO"}>EXTREMO</MenuItem>
          <MenuItem value={"NATIVE"}>NATIVE</MenuItem>
        </Select>
      </FormControl>
         </span> 
        <input
      style={{textAlign:"center", width:"42px", padding:"0px"}}
        className="inpTinte"
        type="text"
        value={todo.t1 === "" ? newT1 : todo.t1}
        onChange={handleT1}
        onBlur={handleSubm}
      /> -
        <input
      style={{textAlign:"center", width:"42px", padding:"0px"}}
        className="inpTinte"
        type="text"
        value={todo.t2 === "" ? newT2 : todo.t2}
        onChange={handleT2}
        onBlur={handleSubm}
      /> -
        <input
      style={{textAlign:"center", width:"42px", padding:"0px"}}
        className="inpTinte"
        type="text"
        value={todo.t3 === "" ? newT3 : todo.t3}
        onChange={handleT3}
        onBlur={handleSubm}
      /> -
        <input
      style={{textAlign:"center", width:"42px", padding:"0px"}}
        className="inpTinte"
        type="text"
        value={todo.t4 === "" ? newT4 : todo.t4}
        onChange={handleT4}
        onBlur={handleSubm}
      />
        </div>
        { todo.simbolo &&
      <h3 className="simboloNota" style={{color: "red", fontSize: "16px"}}>{todo.simbolo}</h3>
       }
      </>
    )}
    {sup ===true && todo.flagTinte===true && (Completa == 1 || Completa == 2) &&(
      <>
      <h3 className="inpTabNota" style={{ marginLeft: "12px"}}> {todo.prodottoC} 
      {todo.t1 && <> <span className="inpTabNota" style={{ marginLeft: "35px", textAlign:"center", padding:"0px"}}> {todo.t1} </span>   </> }
      {todo.t2 && <> <span style={{marginLeft: "10px"}}>-</span> <span className="inpTabNota" style={{ marginLeft: "10px", textAlign:"center", padding:"0px"}}> {todo.t2} </span>  </> }
      {todo.t3 && <> <span style={{marginLeft: "10px"}}>-</span> <span className="inpTabNota" style={{ marginLeft: "10px", textAlign:"center", padding:"0px"}}> {todo.t3} </span> </> }
      {todo.t4 && <> <span style={{marginLeft: "10px"}}>-</span> <span className="inpTabNota" style={{ marginLeft: "10px", textAlign:"center", padding:"0px"}}> {todo.t4} </span> </> }
      {todo.simbolo=="X" && <span style={{color: "red", fontSize: "16px"}}> {todo.simbolo} </span> } 
      </h3>
      </>
    )}
    </div>
{/************************Prezzo Uni***************************************************************************** */}
<div className="col-2" style={{ borderLeft:"solid",  borderWidth: "2px", padding: "0px" }}>

    {sup ===true && (Completa == 0 || Completa == 5) && (todo.simbolo2 != "-" && todo.simbolo2 != "In Omaggio" && todo.simbolo2 != "G. P." )  && ( 
      <span style={{ padding: "0px", marginLeft:"5px" }}>€&nbsp;
      <input
       style={{textAlign:"left", padding: "0px", width:"95px", marginTop:"0px"}}
        type="number" step="0.01"
        onBlur={handlePrezzUniUpd}
        value={newPrezzoUni}
        className="inpTab"
        onChange={handleChangePrezzoUni}
      /> </span>
    )}

    {(sup ===true && (Completa == 0 || Completa == 5) && (todo.simbolo2 == "-" || todo.simbolo2 == "In Omaggio" || todo.simbolo2 == "G. P."))  && ( 
      <h3 className="inpTabNota" style={{ textAlign: "center"}}> {todo.simbolo2} </h3>
    )}

    {sup && (Completa == 1 || Completa == 2) && ( 
  <>
    {todo.simbolo2 === "-" || todo.simbolo2 === "In Omaggio" || todo.simbolo2 === "G. P." ?  
      <h3 className="inpTabNota" style={{ marginLeft: "20px"}}> {todo.simbolo2} </h3>  :
      <h3 className="inpTabNota" style={{ marginLeft: "20px"}}>
        € {parseFloat(todo.prezzoUniProd.replace(',', '.')).toFixed(2).replace('.', ',')}
      </h3>
    }
  </>
)}
    </div>
{/***************************Prezzo Tot************************************************************************** */}
<div className="col-2" style={{ borderLeft:"solid",  borderWidth: "2px", padding: "0px", marginBottom:"0px"}}>
    {sup === true && ( 
        <h4 
            style={{textAlign:"center", fontSize:"16px", marginTop:"0px", paddingTop:"10px"  }}
            type="text"
            className="inpTab"
        >
            € {parseFloat(todo.prezzoTotProd).toFixed(2).replace('.', ',')}
        </h4>
    )}
</div>
{/*************Button**************************************************************************************** */}
      <div className="col-1" style={{padding: "0px"}}>
      <button hidden
          className="button-edit"
          onClick={() => handleEdit(todo, newQtProdotto, newProdotto, newPrezzoUni, newPrezzoTot, newT1, newT2, newT3, newT4, newT5, nomeTinte)}
        >
        </button>
        {sup ===true && flagStampa==false && (Completa == 0 || Completa == 5) && (   
          <>
   <button type="button" className="buttonMenu" style={{padding: "0px"}} >
        <MoreVertIcon id="i" onClick={handleMenu}/>
        <Menu  sx={
        { mt: "1px", "& .MuiMenu-paper": 
        { backgroundColor: "#333",
          color: "white" }, 
        }
        }
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              > 
                <MenuItem onClick={handleChangeEvi}>Evidenzia</MenuItem>
                <MenuItem onClick={handleChangeEt}>ET</MenuItem>
                <MenuItem onClick={handleChangeNo}>(NO)</MenuItem> 
                <MenuItem onClick={handleChangeMeno}>(- )</MenuItem>

                <MenuItem onClick={handleChangeInterro}>?</MenuItem>
                <MenuItem onClick={handleChangeX}>X</MenuItem>
                <MenuItem onClick={handleChangeRemMenu}>Rimuovi</MenuItem>
                <MenuItem onClick={handleChangeSospe}>-</MenuItem>
                <MenuItem onClick={handleChangeInOmaggio}>In Omaggio</MenuItem>
                <MenuItem onClick={handleChangeGP}>G. P.</MenuItem>
                <MenuItem onClick={handleChangeRem2}>Rimuovi2</MenuItem>
                <MenuItem onClick={() => {
                localStorage.setItem("flagRemove", 0);
                localStorage.setItem("IDNOTa", todo.id);
                localStorage.setItem("NomeCliProd", todo.nomeC);
                    displayMsg();
                    toast.clearWaitingQueue(); 
                            }}>Elimina Pr.</MenuItem>
              </Menu>
        </button> 
        </>
        )}
      </div>

    </div>
    )}
</form>


    </div>
  );
}