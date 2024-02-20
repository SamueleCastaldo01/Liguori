import React, { useEffect, useState } from 'react'
import {collection, deleteDoc, doc, onSnapshot ,addDoc, updateDoc} from 'firebase/firestore';
import { auth, db } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Slide } from 'react-toastify';
import { notifyError } from '../components/Notify';

function Categoria({ colId, colNome, getCatId }) {
    const[cate, setCate] = useState([]); 
    
    const cateCollectionRef = collection(db, "scaletta"); 

    const [nome, setNome] = useState("");
    const [nomeC, setNomeC] = React.useState("");
    const [prezzo, setPrezzo] = React.useState("");
    const [numAsc, setNumAsc] = React.useState("");
    const [note, setNote] = React.useState("");

    let navigate = useNavigate();

    const [popupActive, setPopupActive] = useState(false);  
    const [popupRem, setPopupRem] = useState(false); 


    const back = () => {
        navigate("/");
    }

    //_________________________________________________________________________________________________________________
    const setClear = () => {
      setNome("");
      setPopupActive(false);
      toast.dismiss();
      toast.clearWaitingQueue();
    }
    //_________________________________________________________________________________________________________________
     //confirmation notification to remove the category
     const MsgCat = () => (
      <div>
        Are you sure you want to delete the category?
        <button className='buttonSabbia ms-4 mt-2 me-1 rounded-4' onClick={RemoveCat}>Yes</button>
        <button className='buttonClose mt-2 rounded-4' >No</button>
      </div>
    )

      const RemoveCat = () => {
          deleteCate(localStorage.getItem("CatId"));
          toast.clearWaitingQueue(); 
               }

    const displayMsgCat = () => {
      toast.warn(<MsgCat />, {
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
        })    }

  //_________________________________________________________________________________________________________________
    useEffect(() => {  
      onSnapshot(cateCollectionRef, onSnapshot => {
        setCate(onSnapshot.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data()  
          }
        }))
      })
      localStorage.removeItem("scalId");
    }, [])
  //_________________________________________________________________________________________________________________

    const deleteCate = async (id) => { 
      const postDoc = doc(db, "categoria", id);  
      await deleteDoc(postDoc);  
    }
      //_________________________________________________________________________________________________________________
      const updateCate = async (e) => {
        e.preventDefault();
        if(!nome) {   //nome non definito, non presente
          notifyError();
          toast.clearWaitingQueue(); 
          return
        } 
      const CatDoc = doc(db, "categoria", localStorage.getItem("CatId"));   
         await updateDoc(CatDoc, {nome});
          setClear();
      };
  //_________________________________________________________________________________________________________________
  const createCate = async (e) => {
    e.preventDefault(); 
    if(!nome) {
      notifyError();
      toast.clearWaitingQueue(); 
      return
    }
    await addDoc(cateCollectionRef, {
      nome,
      author: { name: auth.currentUser.displayName, id: auth.currentUser.uid },
      colId: colId,
      colNom: colNome
    });
      setClear();
  };
//******************************************************************** */
//******************************************************************** */
                             //INTERFACE 
//******************************************************************** */

    return  <><div className='Page'>
            <div className="container">
            <div> <ToastContainer limit={1} /> </div>
  {/***************************************************************************************************************************************/}
          {/* POPUP ADD CATEGORY */}
          {popupActive && <div className="popup">
        <div className="popup-inner bg-dark rounded-4">
          {!popupRem? <h2 className='text-white'>Add a Category</h2> :
            <h2 className='text-white'>Edit a Category</h2>}  
          <form >
                <div className="form-outline form-white mb-4">
                {!popupRem? <input className="form-control form-control-lg" type="text" placeholder='name category' onChange={(event) => {
                    setNome(event.target.value);}}/>        :
                     <input className="form-control form-control-lg" type="text" placeholder={nome} onChange={(event) => {
                    setNome(event.target.value);}}/> }
                </div>

                  <div className="container ">
                    <div className='row'>
                      <div className='col'></div>
                      <div className='col-7'>
                      <button className='buttonClose  me-1' onClick={setClear} >Close</button>
                      {!popupRem? <button className='buttonSabbia' type="submit" onClick={createCate} > Create</button>:
                        <button className='buttonSabbia me-1' type="submit" onClick={updateCate} > Edit</button>}  
                    </div>
                  </div>
                  </div>
          </form>        
        </div>
      </div>}
  {/***************************************************************************************************************************************/}

              <div className="row">
                <div className="col">
                    <button className='buttonBlack' onClick={back}>Back</button>
                    <h3>{colNome}</h3>
                </div>
  
                <div className="col">
                  <h2 className='text-center'><b>Scaletta</b></h2>
                </div>            

                <div className="col">
                <button className='buttonBlack float-end' onClick={() => {
                  setPopupActive(!popupActive)
                  setPopupRem(false);
                  }}>Add</button>    
                </div>
              </div>
              
                {cate.map((cat) => (
                  <div key={cat.id}>
                  {cat.author.id === auth.currentUser.uid && cat.colId === colId && (
                    <>
                    <div className="form-control shadow mb-2 bg-body rounded-4  "> 
                      <div className="row">
                        <div className="col-9">
                        <h1 onClick={() => {
                            getCatId(cat.id, cat.nome)
                            navigate("articoli");
                        }}>{ cat.nome }</h1></div>
                        <div className="col">                
                          <button className='buttonRemove mt-2 me-1 rounded-4 float-end' onClick={() => {
                            localStorage.setItem("CatId", cat.id);
                            displayMsgCat();
                            toast.clearWaitingQueue(); 
                            }} >Remove</button>
                              <button className='buttonBlack mt-2 me-1 rounded-4 float-end' onClick={() => {
                              localStorage.setItem("CatId", cat.id);
                              setNome(cat.nome);
                              setPopupActive(!popupActive);
                              setPopupRem(true);
                              }}>Edit</button>
                        </div>
                      </div>
                    </div>
                  </>
                  )}
                  </div> 
                  ))}
            </div>
                      
    </div>
    </>
}
export default Categoria;