import React from "react";
import { doc, updateDoc } from 'firebase/firestore';
import DeleteIcon from "@mui/icons-material/Delete";
import Autocomplete from '@mui/material/Autocomplete';
import { TextField } from "@mui/material";
import { db } from "../firebase-config";
import { supa, guid, tutti } from '../components/utenti';
import { AutoProdForn } from "../pages/AddNotaForn";

export default function TodoNotaForni({ todo, handleDelete, handleEdit, displayMsg, flagStampa }) {
  const toText = (v) => (v == null ? '' : String(v));
  // permessi utente
  const sup = supa.includes(localStorage.getItem("uid"));
  const gui = guid.includes(localStorage.getItem("uid"));
  const ta  = tutti.includes(localStorage.getItem("uid"));

  // helper label (ma lavoriamo SOLO con stringhe)
  function getLabel(opt) {
    if (!opt) return '';
    if (typeof opt === 'string') return opt;
    if (typeof opt === 'object') return opt.label ?? opt.nome ?? opt.name ?? opt.value ?? '';
    return String(opt);
  }

  // stato: quantità + NOME PRODOTTO SEMPRE STRINGA
  const [newQtProdotto, setQtProdotto] = React.useState(todo.quantita);
  const [prodInput, setProdInput] = React.useState(toText(todo.nomeP));

  // lista opzioni come stringhe
  const optionsStr = (AutoProdForn || []).map(getLabel);

  const onSubmit = (e) => {
    e.preventDefault();
    const name = (prodInput || '').trim();
    handleEdit(todo, newQtProdotto, name);
  };

  const handleChangeQt = (e) => {
    e.preventDefault();
    if (todo.complete === true) {
      setQtProdotto(todo.quantita);
    } else {
      todo.quantita = "";
      setQtProdotto(e.target.value);
    }
  };

  return (
    <div style={{ backgroundColor: "white" }} className="prova">
      <form onSubmit={onSubmit}>
        <hr style={{ margin: 0 }} />
        <div className="row" style={{ borderBottom: "solid", borderWidth: "2px" }}>
          {/* QUANTITÀ */}
          <div className="col-1" style={{ padding: 0 }}>
            {sup && (
              <input
                style={{
                  textDecoration: todo.completed && "line-through",
                  textAlign: "center",
                  width: "30px",
                  marginTop: 0,
                }}
                type="text"
                value={newQtProdotto}
                className="inpTab"
                onChange={handleChangeQt}
                onBlur={() => !flagStampa && handleEdit(todo, newQtProdotto, (prodInput || '').trim())}
              />
            )}
          </div>

          {/* PRODOTTO */}
          <div
            className={flagStampa ? "col-10" : "col-6"}
            style={{ padding: 0, borderLeft: "solid", borderWidth: "2px" }}
          >
            {!flagStampa && sup && (
              <Autocomplete
                freeSolo
                options={(AutoProdForn || []).map(x => {
                  if (!x) return '';
                  if (typeof x === 'string') return x;
                  if (typeof x === 'object') return x.label ?? x.nome ?? x.name ?? x.value ?? '';
                  return String(x);
                })}
                inputValue={prodInput}
                onInputChange={(_, val) => setProdInput(toText(val))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    onBlur={() => !flagStampa && handleEdit(todo, newQtProdotto, toText(prodInput).trim())}
                  />
                )}
              />
            )}

            {flagStampa && (
              <div className="inpTab" style={{ padding: "6px 8px", minHeight: 32, display: "flex", alignItems: "center" }}>
                {toText(prodInput).trim()}
              </div>
            )}
          </div>

          {/* COLONNA AZIONI → nascosta in stampa */}
          {!flagStampa && (
            <div className="col-1" style={{ padding: 0, borderLeft: "solid", borderWidth: "2px" }}>
              {sup && (
                <button
                  type="button"
                  className="button-delete"
                  style={{ padding: 0 }}
                  onClick={() => {
                    localStorage.setItem("IDNOTa", todo.id);
                    localStorage.setItem("NomeCliProd", todo.nomeC);
                    displayMsg();
                  }}
                >
                  <DeleteIcon id="i" />
                </button>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
