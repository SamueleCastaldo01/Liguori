import React from "react";
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, orderBy, where, getDocs, serverTimestamp, getDoc} from 'firebase/firestore';
import EditIcon from '@mui/icons-material/Edit';
import { auth, db } from "../firebase-config";
import DeleteIcon from "@mui/icons-material/Delete";
import { Modal, Box, Button } from '@mui/material';
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

export default function TodoNotaDip({ todo, handleEdit, displayMsg, nomeCli, flagStampa, Completa, SommaTot, setPopupActiveSearch, setDescrizionePop}) {

    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true


    const [popupTinta, setPopupTinta] = React.useState(false);
    const [selectedTinta, setSelectedTinta] = React.useState('');
    const [splitQt, setSplitQt] = React.useState("");


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

  const [meno, setMeno] = React.useState(todo.meno);

  const [checked, setChecked] = React.useState(todo.artPreso);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [age, setAge] = React.useState('');

  let navigate = useNavigate();


  //-------------------------------------------------
    const handleClickTinta = (tinta) => {
    if (Completa === 1) return;
    setSelectedTinta(tinta);
    setSplitQt("");
    setPopupTinta(true);
  };



const handleConfirmSplit = async () => {
  const qt = parseInt(splitQt);

  if (!qt || isNaN(qt) || qt <= 0 || qt > todo.qtProdotto) {
    toast.error("Quantità non valida");
    return;
  }

  const tintaVal = todo[selectedTinta];
  const originaleQt = parseFloat(todo.qtProdotto);
  const isFullSplit = qt === originaleQt;

  // 1. Rimuovi la tinta dalla riga originale
  // 1. Calcola nuove tinte rimanenti
const nuoveTinte = {
  t1: selectedTinta === 't1' ? "" : todo.t1,
  t2: selectedTinta === 't2' ? "" : todo.t2,
  t3: selectedTinta === 't3' ? "" : todo.t3,
  t4: selectedTinta === 't4' ? "" : todo.t4,
  t5: selectedTinta === 't5' ? "" : todo.t5,
};

// Conta quante tinte restano
const tinteRimaste = Object.values(nuoveTinte).filter(Boolean).length;

// Calcola nuovo prezzo totale (in base alle tinte rimaste)
const prezzoTotaleOriginale = (tinteRimaste * todo.qtProdotto * parseFloat(todo.prezzoUniProd)).toFixed(2);

// 2. Aggiorna la riga originale: rimuove tinta e aggiorna prezzo
await updateDoc(doc(db, "Nota", todo.id), {
  [selectedTinta]: "",
  prezzoTotProd: prezzoTotaleOriginale,
});



  // 2. Crea riga nuova
  const nuovoProd = {
    ...todo,
    createdAt: serverTimestamp(),
    qtProdotto: isFullSplit ? originaleQt : (originaleQt - qt),
    [selectedTinta]: tintaVal,
    t1: selectedTinta === 't1' ? tintaVal : "",
    t2: selectedTinta === 't2' ? tintaVal : "",
    t3: selectedTinta === 't3' ? tintaVal : "",
    t4: selectedTinta === 't4' ? tintaVal : "",
    t5: "",
    idOriginale: todo.id,
    simbolo: isFullSplit ? "(NO)" : "",
    prezzoTotProd: isFullSplit ? 0 : (todo.prezzoUniProd * (originaleQt - qt)).toFixed(2),
  };
  delete nuovoProd.id;

  await addDoc(collection(db, "Nota"), nuovoProd);

  // 3. Aggiungi la quantità selezionata in inOrdine
  await addDoc(collection(db, "inOrdine"), {
    nomeC: todo.nomeC,
    dataC: todo.dataC,
    qtProdotto: qt,
    prodottoC: todo.prodottoC,
  });

  setSplitQt("");
  setPopupTinta(false);
};



const handleDeleteSplit = async (docToDelete) => {
  if (!docToDelete.idOriginale) return;

  const originalRef = doc(db, "Nota", docToDelete.idOriginale);
  const originalSnap = await getDoc(originalRef);

  if (originalSnap.exists()) {
    const tintaKey = ['t1', 't2', 't3', 't4', 't5'].find(k => docToDelete[k]);
    const tintaValue = docToDelete[tintaKey];

    const updateData = {};

      if (tintaKey) {
        updateData[tintaKey] = tintaValue;
      }

      // Calcola quante tinte ci sono dopo il ripristino
      const tintaCount = ['t1', 't2', 't3', 't4', 't5'].reduce((acc, key) => {
        const valore = key === tintaKey ? tintaValue : originalSnap.data()[key];
        return valore ? acc + 1 : acc;
      }, 0);

      // Ricalcola prezzo
      const nuovaQt = originalSnap.data().qtProdotto;
      const prezzoUni = parseFloat(originalSnap.data().prezzoUniProd);
      updateData.prezzoTotProd = (tintaCount * nuovaQt * prezzoUni).toFixed(2);

      // Se aveva il simbolo NO lo rimuovi
      if (docToDelete.simbolo === "(NO)") {
        updateData.simbolo = "";
      }


    await updateDoc(originalRef, updateData);
  }

  // Elimina la riga di split
  await deleteDoc(doc(db, "Nota", docToDelete.id));

  // Elimina anche da inOrdine (se presente)
  const inOrdineQuery = query(
    collection(db, "inOrdine"),
    where("nomeC", "==", docToDelete.nomeC),
    where("prodottoC", "==", docToDelete.prodottoC),
    where("qtProdotto", "==", docToDelete.qtProdotto),
    where("dataC", "==", docToDelete.dataC)
  );

  const inOrdineSnap = await getDocs(inOrdineQuery);
  inOrdineSnap.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });

};



  //-------------------------------------------------
  const handleChangeChecked = async (event) => {
    if(Completa == 1) {
      return;
    }
    
    const newChecked = !checked;
    setChecked(newChecked);
  
    // Aggiorna lo stato artPreso su "Nota"
    await updateDoc(doc(db, "Nota", todo.id), { 
      artPreso: newChecked
    });
  
    if(newChecked) {
      await updateDoc(doc(db, "addNota", todo.idNota), {
        completa: "6"
      });
    }
  
  };
  
//***************************************************************************************** */
async function sommaTotChange( meno) {  //qui va a fare il prezzo totale del prodotto
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
  var preT= (conTinte* (todo.qtProdotto - man))*todo.prezzoUniProd;  //qui va a fare il prezzo totale del prodotto in base alla quantità e al prezzo unitario
  var somTrunc = preT.toFixed(2);
  await updateDoc(doc(db, "Nota", todo.id), {prezzoTotProd:somTrunc});
}   

const handleChangeNo = async (event) => {   //aggiorna sia il simbolo del prodotto, e il suo prezzo totale diventa 0, in questo modo non va a fare la somma con il resto
  setMeno(0);  
  await updateDoc(doc(db, "Nota", todo.id), { simbolo:"(NO)", prezzoTotProd:0, meno: 0});
    SommaTot();    //somma totale dei prezzi totali dei prodotti
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

  const handleInfo = async (event) => {
    var Descri = "";
    const collectionRef = collection(db, "prodotto");  // va a fare la ricerca per andare a prendere la descrizione del prodotto
    const q = query(collectionRef, where("nomeP", "==", todo.prodottoC));
    console.log(todo.prodottoC)
    const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (hi) => {
        console.log("entrato")
        Descri = hi.data().descrizione
        });
        console.log(Descri)
    setAnchorEl(null);
    setDescrizionePop(Descri)
    setPopupActiveSearch(true)
  };

  const handleChangeEvi = async (event) => {
    if((todo.simbolo=="(NO)" && !todo.simbolo2) || (todo.simbolo=="1"  && !todo.simbolo2)) {   //se il simbolo è no, va a calcolarsi prima il suo prezzo totale del prodotto e poi aggiorna il simbolo e il prezzo
      sommaTotChange()
    }
    setMeno(0);
    await updateDoc(doc(db, "Nota", todo.id), { simbolo:" ", meno: 0});
    SommaTot();
    handleClose()
  };

  const handleChangeInterro = async (event) => {
    if((todo.simbolo=="(NO)" && !todo.simbolo2) || (todo.simbolo=="1"  && !todo.simbolo2)) {   //se il simbolo è no, va a calcolarsi prima il suo prezzo totale del prodotto e poi aggiorna il simbolo e il prezzo
      sommaTotChange();
    }
    setMeno(0);
    await updateDoc(doc(db, "Nota", todo.id), { simbolo:"?", meno: 0});
    SommaTot();
    handleClose()
  };

  const handleChangeRemMenu = async (event) => {
    if((todo.simbolo=="(NO)" && !todo.simbolo2) || (todo.simbolo=="1"  && !todo.simbolo2)) {   //se il simbolo è no, va a calcolarsi prima il suo prezzo totale del prodotto e poi aggiorna il simbolo e il prezzo
      sommaTotChange();
    }
    setMeno(0);
    await updateDoc(doc(db, "Nota", todo.id), { simbolo:"", meno: 0}); //infine aggiorna il simbolo
    SommaTot();
    handleClose();
  };
 //******************************************************************** */ 

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

  const handleChangeMenDb = async (value) => {
    var cia = value;
    if( +cia<=0 || +todo.qtProdotto<(+cia))  //controllo che la qt sia maggiore del valore inserito, altrimenti lo riazzera, oppure anche nel caso in cui si mette un valore negativo
    {
      cia=0
    }

   await updateDoc(doc(db, "Nota", todo.id), { meno: cia});  //va ad aggiornare il db il simbolo meno
   sommaTotChange(cia);
   setMeno(cia)
   SommaTot();
  };

//******************************************************************** */
//handle change


//INTERFACCIA ***************************************************************************************************************
//*************************************************************************************************************************** */
  return (
    <>
    <div className="prova">

<form  onSubmit={handleSubm}>
<hr style={{margin: "0"}}/>
    <div className="row " style={{ borderBottom:"solid",  borderWidth: "2px" }}>
{/**************************CHECKED'******************************************************************* */}
    <div className="col-1" style={{padding:"0px" }}>
    <input className="checkboxStyle" type="checkbox" id="coding" name="interest" checked={checked} onChange={handleChangeChecked} />
    </div>
{/**************************QUANTITA'******************************************************************* */}
    <div className="col-1" style={{padding:"0px",
       background: (todo.simbolo == " " || (todo.prodottoC == "ROIAL ASCIUGAMANO 60 pz" && (todo.simbolo != "(NO)" && todo.simbolo != "X"))) && "#FFFF00" }}>    

      <h3 className="inpTabNota" style={{ textAlign:"center"}}><span style={{ background: todo.simbolo == " " && "#FFFF00"}}>{todo.qtProdotto}</span></h3>

    </div>

{/*******************Prodotto********************************************************************************** */}
<div className="col-7" style={{padding: "0px", borderLeft:"solid",  borderWidth: "2px",
 background: (todo.simbolo == " " || (todo.prodottoC == "ROIAL ASCIUGAMANO 60 pz" && (todo.simbolo != "(NO)" && todo.simbolo != "X"))) && "#FFFF00"}}>
      {/***Prodotti********************** */}

    { todo.flagTinte===false &&( 
      <h3 className="inpTabNota" style={{ marginLeft: "12px"}}><span style={{background: todo.simbolo == " " && "#FFFF00"}}>
      {todo.prodottoC}</span>
      {todo.flagEt == true && 
      <span> &nbsp;+ET.</span>
      }
        </h3>
    )}

      {/*****Tinte********************************************************************/}
    { todo.flagTinte===true && (
      <>
      <h3 className="inpTabNota" style={{ marginLeft: "12px"}}> {todo.prodottoC} 
      {todo.t1 && <> <span
          className="inpTabNota"
          style={{ marginLeft: "20px", textAlign: "center", padding: "0px", cursor: "pointer" }}
          onClick={() => handleClickTinta('t1')}
        >
          {todo.t1}
      </span>   </> }
      {todo.t2 && 
      <span style={{marginLeft: "15px"}}>-<span
          className="inpTabNota"
          style={{ marginLeft: "15px", textAlign: "center", padding: "0px", cursor: "pointer" }}
          onClick={() => handleClickTinta('t2')}
        >
           {todo.t2}
        </span>  </span> }
          {todo.t3 && 
            <span style={{marginLeft: "15px"}}>- 
              <span
                className="inpTabNota"
                style={{ marginLeft: "15px", textAlign: "center", padding: "0px", cursor: "pointer" }}
                onClick={() => handleClickTinta('t3')}
              >
                {todo.t3}
              </span>
            </span>
          }
      {todo.t4 && 
      <span style={{marginLeft: "15px"}}>- <span
        className="inpTabNota"
        style={{ marginLeft: "15px", textAlign: "center", padding: "0px", cursor: "pointer" }}
        onClick={() => handleClickTinta('t4')}
            >
        {todo.t4}
        </span></span> }
      </h3>
      </>
    )}
    </div>
{/*****************Simbolo************************************************************************************ */}
<div className="col-2" style={{padding: "0px", position: "relative", left: "10px"}}>
{(todo.simbolo== "1" && (Completa == 0 || Completa == 6)) && <h3 className="inpTabNota" style={{color: "red", fontSize: "13px", textAlign: "center"}}> (-
                        <input
                         onChange={(e) => setMeno(e.target.value)}
                         onBlur={(e) => handleChangeMenDb(e.target.value)}
                          type="number" value={meno} style={{border: "1px solid", width:"35px"}}></input> ) </h3> 
}
{(todo.simbolo== "1" && Completa == 1) && <h3 className="inpTabNota" style={{color: "red", fontSize: "16px", textAlign: "center"}}> (-{todo.meno}) </h3> }

{todo.simbolo!= "1" && <h3 className="inpTabNota" style={{color: "red", fontSize: "16px", textAlign: "center"}}>{todo.simbolo}</h3>}
   
</div>
{/*****************button************************************************************************************ */}

      <div className="col-1" style={{padding: "0px"}}>
      <button hidden
          className="button-edit"
          onClick={() => handleEdit(todo, newQtProdotto, newProdotto, newPrezzoUni, newPrezzoTot, newT1, newT2, newT3, newT4, newT5, nomeTinte)}
        >
        </button>
        {  flagStampa==false && Completa == 0 && (   
        <button hidden type="button" className="button-delete" style={{padding: "0px"}}                          
          onClick={() => {
                localStorage.setItem("IDNOTa", todo.id);
                localStorage.setItem("NomeCliProd", todo.nomeC);
                    displayMsg();
                    toast.clearWaitingQueue(); 
                            }}>
        <DeleteIcon id="i" />
        </button>
        )}

        { (Completa == 0 || Completa == 6) &&(
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
                <MenuItem onClick={handleInfo}>INFO</MenuItem>
                <MenuItem onClick={handleChangeEvi}>Evidenzia</MenuItem>
                <MenuItem onClick={handleChangeNo}>(NO)</MenuItem>
                <MenuItem onClick={handleChangeMeno}>(- )</MenuItem>
                <MenuItem onClick={handleChangeInterro}>?</MenuItem>
                <MenuItem onClick={handleChangeRemMenu}>Rimuovi</MenuItem>
                {todo.idOriginale && (
                  <MenuItem onClick={() => handleDeleteSplit(todo)}>Elimina prodotto (split)</MenuItem>
                )}
              </Menu>
        </button>
        </>
      )}

      </div>

    </div>

</form>


    </div>


<Modal
  open={popupTinta}
  onClose={() => setPopupTinta(false)}
  aria-labelledby="modal-modal-title"
  aria-describedby="modal-modal-description"
>
  <Box sx={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 320,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    textAlign: 'center'
  }}>
    <h5>Rimuovi tinta: <strong>{todo.prodottoC} {todo[selectedTinta]}</strong></h5>
    <p>Quantità da rimuovere:</p>
    <TextField
      type="number"
      value={splitQt}
      inputProps={{ min: 1, max: todo.qtProdotto }}
      onChange={(e) => setSplitQt(e.target.value)}
      fullWidth
      margin="dense"
      InputProps={{
        startAdornment: (
          <span style={{ marginRight: 8, fontWeight: 'bold' }}>-</span>
        ),
      }}
    />
    <Box mt={2}>
      <Button variant="contained" className=" me-2" onClick={handleConfirmSplit}>Conferma</Button>
      <Button className="" onClick={() => setPopupTinta(false)}>Annulla</Button>
    </Box>
  </Box>
</Modal>

</>
  );
}