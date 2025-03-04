import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from "../firebase-config";
import moment from 'moment';
import { useNavigate } from "react-router-dom";
import Switch from '@mui/material/Switch';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Calendar from 'react-calendar';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

function NotaDipData({ notaDat, getNotaDip }) {
    const [todos, setTodos] = useState([]);
    const [todosDataAuto, setTodosDataAuto] = useState([]);
    const [dataSc, setDataSc] = useState(notaDat);
    const [DataCal, setDataCal] = useState(new Date());
    const [activeCalender, setActiveCalender] = useState(false);
    const [Progress, setProgress] = useState(false);
    const [statusFilter, setStatusFilter] = useState("0"); // Default: Da Evadere

    let navigate = useNavigate();


  const handleChange = (e) => {
    setDataSc(moment(e.target.value).format("DD-MM-YYYY"));
    };


      useEffect(() => {
        if (!dataSc || !statusFilter) return; 
    
        const collectionRef = collection(db, "addNota");
        const q = query(collectionRef, where("data", "==", dataSc), where("completa", "==", statusFilter), orderBy("cont"));
    
        const unsub = onSnapshot(q, (querySnapshot) => {
            let todosArray = [];
            querySnapshot.forEach((doc) => {
                todosArray.push({ ...doc.data(), id: doc.id });
            });
            setTodos(todosArray);
            setProgress(true);
        });
    
        return () => unsub();
    }, [dataSc, statusFilter]);
    


    return (
        <>
    <div className='navMobile row'>
      <div className='col-2'>
      </div>
      <div className='col' style={{padding: 0}}>
      <p className='navText'> Ordini Da Evadere </p>
      </div>
      </div>

            <div className='container m-0' style={{ padding: "20px" }}>
                <div className='row' style={{ marginTop: "40px" }}>
                    <div className='col' style={{ padding: "0px" }}>
                        <div className='todo_containerNoteDip w-100'>
                            <div className='row'>
                                <div className='col' style={{ paddingRight: "0px" }}>
                                    <p className='colTextTitle'> Ordine Clienti</p>
                                    <FormControl>
                                        <RadioGroup
                                            row
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <FormControlLabel value="0" control={<Radio />} label="Da Evadere" />
                                            <FormControlLabel value="6" control={<Radio />} label="Parziale" />
                                            <FormControlLabel value="1" control={<Radio />} label="Evasi" />
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                                <div className='col' style={{ paddingLeft: "0px", textAlign: "right" }}>
                                        <input
                                            type="date"
                                            value={moment(dataSc, "DD-MM-YYYY").format("YYYY-MM-DD")} // Converti per l'input
                                            onChange={(e) => handleChange(e)} // Salva in formato gg-mm-yyyy
                                            />
                                </div>
                            </div>

                            <div className='row' style={{ borderBottom: "1px solid gray" }}>
                                <div className='col-1'>
                                    <p className='coltext'>N</p>
                                </div>
                                <div className='col-8'>
                                    <p className='coltext'>Cliente</p>
                                </div>
                            </div>

                            <div className="scrollOrdDip">
                                {!Progress && (
                                    <div style={{ marginTop: "14px" }}>
                                        <CircularProgress />
                                    </div>
                                )}

                                {todos.map((todo) => (
                                    <div key={todo.id}>
                                        {todo.data === dataSc && todo.completa === statusFilter && (
                                            <div className='row diviCol1' style={{ borderBottom: "1px solid gray" }}
                                                onClick={() => {
                                                    getNotaDip(todo.id, todo.cont, todo.nomeC, dataSc, todo.NumCartoni);
                                                    setTimeout(() => { navigate("/notadip"); }, 10);
                                                }}>
                                                <div className='col-1'>
                                                    <p className="inpTab" style={{ textAlign: "left" }}>{todo.cont}</p>
                                                </div>
                                                <div className='col-8'>
                                                    <p className="inpTab" style={{ textAlign: "left" }}>{todo.nomeC}</p>
                                                </div>
                                                <div className="col colIcon" style={{ padding: "0px", marginTop: "8px" }}>
                                                    <NavigateNextIcon />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default NotaDipData;
