import React from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import EditIcon from '@mui/icons-material/Edit';
import { auth, db } from "../firebase-config";
import DeleteIcon from "@mui/icons-material/Delete";
import { supa, guid, tutti } from '../components/utenti';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { Modal, Box, Button, Typography } from '@mui/material';

export const AutoCompProd = [];

export default function TodoDebiCli({
  todo,
  handleDelete,
  handleEditDeb,
  updateSingleDebito,
  totRiga,
  displayMsg,
  getCliId,
  handleActiveEdit
}) {
  const [showModal, setShowModal] = React.useState(false);
  // pendingUpdate tiene le funzioni commit e rollback
  const [pendingUpdate, setPendingUpdate] = React.useState(null);

  const confirmUpdate = () => {
    if (pendingUpdate?.commit) pendingUpdate.commit();
    setShowModal(false);
    setPendingUpdate(null);
  };

  const cancelUpdate = () => {
    if (pendingUpdate?.rollback) pendingUpdate.rollback();
    setShowModal(false);
    setPendingUpdate(null);
  };

  // permessi utente
  const sup = supa.includes(localStorage.getItem("uid"));
  const gui = guid.includes(localStorage.getItem("uid"));
  const ta = tutti.includes(localStorage.getItem("uid"));

  const origD2 = React.useRef(todo.deb2);
  const origD3 = React.useRef(todo.deb3);
  const origD4 = React.useRef(todo.deb4);

  const [newNomeC, setNomeC] = React.useState(todo.nomeC);
  const [d1, setD1] = React.useState(todo.deb1);
  const [d2, setD2] = React.useState(todo.deb2);
  const [d3, setD3] = React.useState(todo.deb3);
  const [d4, setD4] = React.useState(todo.deb4);

  const navigate = useNavigate();

  const handleSubm = (e) => {
    e.preventDefault();
    handleEditDeb(todo, newNomeC, d1, d2, d3, d4);
  };

  const handleNiente = (e) => {
    e.preventDefault();
  };

  const handleModal = async (idCliente) => {
    try {
      const clinRef = collection(db, "clin");
      const q = query(clinRef, where("idCliente", "==", idCliente));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const clienteData = querySnapshot.docs[0].data();
        handleActiveEdit(clienteData);
      }
    } catch (error) {
      console.error("Errore nel recupero del cliente:", error);
    }
  };

  const handleFocusD2 = () => { origD2.current = d2; };
  const handleFocusD3 = () => { origD3.current = d3; };
  const handleFocusD4 = () => { origD4.current = d4; };

  // onChange mantiene solo lo stato locale
  const handleChangeD1 = (e) => {
    e.preventDefault();
    if (todo.complete) {
      setD1(todo.deb1);
    } else {
      todo.deb1 = "";
      setD1(e.target.value);
    }
  };
  
  const handleChangeD2 = e => setD2(e.target.value);
  const handleChangeD3 = e => setD3(e.target.value);
  const handleChangeD4 = e => setD4(e.target.value);

  // onBlur apre modal e memorizza commit/rollback
  const handleBlurD2 = () => {
    setPendingUpdate({
      commit: () => updateSingleDebito(todo.id, "deb2", d2),
      rollback: () => setD2(origD2.current)
    });
    setShowModal(true);
  };
  const handleBlurD3 = () => {
    setPendingUpdate({
      commit: () => updateSingleDebito(todo.id, "deb3", d3),
      rollback: () => setD3(origD3.current)
    });
    setShowModal(true);
  };
  const handleBlurD4 = () => {
    setPendingUpdate({
      commit: () => updateSingleDebito(todo.id, "deb4", d4),
      rollback: () => setD4(origD4.current)
    });
    setShowModal(true);
  };

  return (
    <>
      <div className="prova">
        <form onSubmit={handleNiente}>
          <div className="row">
            <div className="col-1 diviCol">
              <h5
                style={{ textDecoration: todo.completed && "line-through" }}
                onClick={() => handleModal(todo.idCliente)}
                className="inpTab"
              >
                {todo.idCliente}
              </h5>
            </div>
            <div className="col-3 diviCol">
              <h5
                style={{ textDecoration: todo.completed && "line-through" }}
                className="inpTab"
              >
                {newNomeC}
              </h5>
            </div>

            {/* Debito 1 */}
            <div className="col diviCol1" style={{ padding: 0 }}>
              {sup && (
                <input
                  type="number"
                  className="inpNumb"
                  style={{
                    textDecoration: todo.completed && "line-through",
                    fontSize: "14px"
                  }}
                  value={todo.deb1 === "" ? d1 : todo.deb1}
                  onChange={handleChangeD1}
                  onBlur={handleSubm}
                />
              )}
            </div>

            {/* Debito 2 */}
            <div className="col diviCol1" style={{ padding: 0 }}>
              {sup && (
                    <input
                    type="number"
                    value={d2}
                    onFocus={handleFocusD2}
                    onChange={handleChangeD2}
                    onBlur={handleBlurD2}
                    className="inpNumb"
                  />
              )}
            </div>

            {/* Debito 3 */}
            <div className="col diviCol1" style={{ padding: 0 }}>
              {sup && (
                <input
                type="number"
                value={d3}
                onFocus={handleFocusD3}
                onChange={handleChangeD3}
                onBlur={handleBlurD3}
                className="inpNumb"
              />
              )}
            </div>

            {/* Debito 4 */}
            <div className="col diviCol1" style={{ padding: 0 }}>
              {sup && (
                  <input
                  type="number"
                  value={d4}
                  onFocus={handleFocusD4}
                  onChange={handleChangeD4}
                  onBlur={handleBlurD4}
                  className="inpNumb"
                />
              )}
            </div>
          </div>
        </form>
        <hr style={{ margin: 0 }} />
      </div>

      <Modal
        open={showModal}
        onClose={cancelUpdate}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            textAlign: "center"
          }}
        >
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            Confermare la modifica?
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={confirmUpdate}
            sx={{ mr: 1 }}
          >
            Conferma
          </Button>
          <Button variant="outlined" color="secondary" onClick={cancelUpdate}>
            Annulla
          </Button>
        </Box>
      </Modal>
    </>
  );
}
