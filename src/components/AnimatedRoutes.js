import React from 'react'
import { useState, useEffect } from "react";
import Page_per from '../pages/Page_per';
import Login from "../pages/Login";
import { SingUp } from '../pages/SingUp';
import HomePage from '../pages/HomePage';
import ScaletData from '../pages/ScaletData';
import Scalet from '../pages/Scalet';
import ScalettaDataDip from '../pages/ScalettaDataDip';
import AddCliente from '../pages/AddCliente';
import AddFornitori from '../pages/AddFornitori';
import PreventivoData from '../pages/PreventivoData';
import AddPrevNota from '../pages/AddPrevNota';
import Preventivo from '../pages/Preventivo';
import OrdineCliData from '../pages/OrdineCliData'
import OrdineForniData from '../pages/OrdineForniData';
import AddNota from '../pages/AddNota';
import AddClienteScalet from '../pages/AddClienteScalet';
import NotaDipData from '../pages/NotaDipData';
import NotaDip from '../pages/NotaDip';
import ListaClientiDip from '../pages/ListaClientiDip';
import AddNotaForni from '../pages/AddNotaForn';
import Nota from '../pages/Nota';
import NotaForni from '../pages/NotaForni';
import DashClienti from '../pages/DashboardClienti';
import DashFornitori from '../pages/DashboardFornitori';
import ScortaTinte from '../pages/ScortaTinte';
import Scorta from '../pages/Scorta';
import StampaMassiva from '../pages/StampaMassiva';
import StampaMassivaPrev from '../pages/StampaMassivaPrev';
import NotaDashCliente from '../pages/NotaDashCliente';
import {PrivateRoutes, PrivateCate, PrivatePerm, PrivateDashCli, PrivateOrd, PrivateOrdForn, PrivateNota, PrivateNotaForni, PrivateDashForn, PrivateAddClientiScalet, PrivateRoutesDipen, PrivateRoutesSup, PrivateRoutesGuid} from '../components/PrivateRoutes';
import { AnimatePresence } from 'framer-motion'
import { BrowserRouter as Router, Routes, Route, Link, useLocation} from "react-router-dom";
import { guid, supa, tutti, dipen } from '../components/utenti';
import moment from 'moment/moment';
import useMediaQuery from '@mui/material/useMediaQuery';
import Scaletta from '../pages/Scaletta';
import ScalettaReview from '../pages/ScalettaReview';

function AnimatedRoutes() {

    const location = useLocation();

    const [value, setValue] = React.useState(0);
    const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth"));
  
      //permessi utente
      let sup= supa.includes(localStorage.getItem("uid"))
      let gui= guid.includes(localStorage.getItem("uid"))
      let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
      let dip= dipen.includes(localStorage.getItem("uid"))
  
    document.addEventListener("touchstart", function() {}, true);
  
    const timeElapsed = Date.now();  //prende la data attuale in millisecondi
    const today = new Date(timeElapsed);    //converte nel tipo data
    var formattedDate = moment(today).format('DD-MM-YYYY');  //coverte nel formato richiesto
    localStorage.setItem("today", formattedDate);
    const [todayC, setTodayC] = useState(localStorage.getItem("today"));  //variabile che andiamo ad utilizzare
  
    const matches = useMediaQuery('(max-width:920px)');  //media query true se è un dispositivo più piccolo del value
  
    const [uid, setUid] = useState(localStorage.getItem("uid"));
    const [scalId, setScalId] = useState(localStorage.getItem("scalId")); //id della data della scaletta
    const [dataScal, setDataScal] = useState(localStorage.getItem("dataScal")); 
    const [dateEli, setDateEli] = useState(localStorage.getItem("dataEli"));
  
    const [clientId, setClientId] = useState(localStorage.getItem("clientId")); //id cliente
    const [nomeCli, setNomeCli] = useState(localStorage.getItem("nomeCli")); 
  
    const [fornId, setFornId] = useState(localStorage.getItem("fornId")); //id cliente
    const [nomeForn, setNomeForn] = useState(localStorage.getItem("nomeForn")); 
  
    const [ordId, setOrdId] = useState(localStorage.getItem("OrdId")); 
    const [dataOrd, setDataOrd] = useState(localStorage.getItem("dataOrd")); 
    const [dataOrdConf, setDataOrdConf] = useState(localStorage.getItem("dataOrdConfronto"));
    const [OrdDataMilli, setOrdDataMilli] = useState(localStorage.getItem("OrdDataMilli"));
  
    const [ordFornId, setOrdFornId] = useState(localStorage.getItem("OrdFornId")); 
    const [dataOrdForn, setDataOrdForn] = useState(localStorage.getItem("dataOrdForn")); 
    const [dataOrdFornConf, setDataOrdFornConf] = useState(localStorage.getItem("dataOrdFornConfronto"));
  
    const [idCliente, setIdCliente] = useState(localStorage.getItem("idCliente")); 
    const [notaId, setNotaId] = useState(localStorage.getItem("NotaId")); 
    const [notaCont, setNotaCont] = useState(localStorage.getItem("NotaCon")); 
    const [notaNomeC, setNotaNomeC] = useState(localStorage.getItem("NotaNomeC")); 
    const [notaDataV, setNotaDataV] = useState(localStorage.getItem("NotaDataV"));
    const [notaDataC, setNotaDataC] = useState(localStorage.getItem("NotaDataC"));
    const [numCartoni, setNumCartoni] = useState(localStorage.getItem("NumCartNota"));
    const [sommaTotale, setSommaTotale] = useState(localStorage.getItem("sommaTotNota"));
    const [debitoRes, setDebitoRes] = useState(localStorage.getItem("debitRes"));
    const [debitoTot, setDebitoTot] = useState(localStorage.getItem("debitTot"));
    const [notaIndi, setNotaIndi] = useState(localStorage.getItem("notaIndi"));
    const [notaTel, setNotaTel] = useState(localStorage.getItem("notaTel"));
    const [notaIva, setNotaIva] = useState(localStorage.getItem("notaIva"));
    const [IdDebNota, setIdDebNota] = useState(localStorage.getItem("idDebNot"));
    const [notaNumBuste, setNotaNumBuste] = useState(localStorage.getItem("notaNumBuste"));
    const [notaCompleta, setNotaCompleta] = useState(localStorage.getItem("notaCompleta"));
  
    const [notaDipId, setNotaDipId] = useState(localStorage.getItem("notaDipId"));
    const [notaDipCont, setNotaDipCont] = useState(localStorage.getItem("notaDipCon"));
    const [notaDipNomeC, setNotaDipNomeC] = useState(localStorage.getItem("notaDipNomeC"));  
    const [notaDipDataC, setNotaDipDataC] = useState(localStorage.getItem("notaDipDataC"));
    const [NumCartNotaDip, setNumCartoniDip] = useState(localStorage.getItem("NumCartNotaDip"));
  
    const [notaFornId, setNotaFornId] = useState(localStorage.getItem("NotaFornId")); 
    const [notaFornNomeF, setNotaFornNomeF] = useState(localStorage.getItem("notaFornNomeF")); 
    const [notaFornDataV, setNotaFornDataV] = useState(localStorage.getItem("NotaFornDataV"));
    const [notaFornDataC, setNotaFornDataC] = useState(localStorage.getItem("notaFornDataC"));
  
    const [notaDat, setNotaDat] = useState(localStorage.getItem("notaDat"));

    const [notaDashId, setNotaDashId] = useState(localStorage.getItem("notaDashId"));
    const [notaDashNomeC, setNotaDashNomeC] = useState(localStorage.getItem("notaDashNomeC"));
    const [notaDashData, setNotaDashData] = useState(localStorage.getItem("notaDashData"));


// get ______________________________________________________________________
    const getColIdHandler = (id, data, datEl) => {
        localStorage.setItem("scalId", id); //save the value locally
        localStorage.setItem("dataScal", data); 
        localStorage.setItem("dataEli", datEl); 
        setScalId(id);
        setDataScal(data);
        setDateEli(datEl);
      };
    
      const getCliIdHandler = (id, nome) => {
        localStorage.setItem("clientId", id); //save the value locally
        localStorage.setItem("nomeCli", nome); 
        setClientId(id);
        setNomeCli(nome);
      };
    
      const getFornIdHandler = (id, nome) => {
        localStorage.setItem("fornId", id); //save the value locally
        localStorage.setItem("nomeForn", nome); 
        setFornId(id);
        setNomeForn(nome);
      }
    
      const getOrderIdHandler = (id, nome, data, dtMilli) => {
        localStorage.setItem("OrdId", id); //save the value locally
        localStorage.setItem("dataOrd", nome); 
        localStorage.setItem("dataOrdConfronto", data); 
        localStorage.setItem("OrdDataMilli", dtMilli); 
        setOrdId(id);
        setDataOrd(nome);
        setDataOrdConf(data);
        setOrdDataMilli(dtMilli);
      };
    
      const getOrderFornIdHandler = (id, nome, data) => {
        localStorage.setItem("OrdFornId", id); //save the value locally
        localStorage.setItem("dataOrdForn", nome); 
        localStorage.setItem("dataOrdFornConfronto", data); 
        setOrdFornId(id);
        setDataOrdForn(nome);
        setDataOrdFornConf(data);
      };
    
      const getNotadHandler = (idCliente, id, cont, nome, datav, datac, numCart, sommaTot, debiResi, debiTot, indi, tel, iva, comp, idDebito, numBust) => {
        localStorage.setItem("idCliente", idCliente); 
        localStorage.setItem("NotaId", id); 
        localStorage.setItem("NotaCon", cont); //save the value locally
        localStorage.setItem("NotaNomeC", nome); 
        localStorage.setItem("NotaDataV", datav); 
        localStorage.setItem("NotaDataC", datac); 
        localStorage.setItem("NumCartNota", numCart); 
        localStorage.setItem("sommaTotNota", sommaTot); 
        localStorage.setItem("debitRes", debiResi); 
        localStorage.setItem("debitTot", debiTot);
        localStorage.setItem("notaIndi", indi);  
        localStorage.setItem("notaTel", tel); 
        localStorage.setItem("notaIva", iva); 
        localStorage.setItem("notaCompleta", comp);
        localStorage.setItem("idDebNot", idDebito);
        localStorage.setItem("notaNumBuste", numBust);
        setIdCliente(idCliente)
        setNotaId(id);
        setNotaCont(cont);
        setNotaNomeC(nome);
        setNotaDataV(datav);
        setNotaDataC(datac);
        setNumCartoni(numCart);
        setSommaTotale(sommaTot);
        setDebitoRes(debiResi);
        setDebitoTot(debiTot);
        setNotaIndi(indi);
        setNotaTel(tel);
        setNotaIva(iva);
        setIdDebNota(idDebito);
        setNotaCompleta(comp);
        setNotaNumBuste(numBust);
      };
    
      const getNotaDipHandler = (id, cont, nome, datac, nuCat) => {
        localStorage.setItem("notaDipId", id);
        localStorage.setItem("notaDipContC", cont);
        localStorage.setItem("notaDipNomeC", nome);
        localStorage.setItem("notaDipDataC", datac);
        localStorage.setItem("NumCartNotaDip", nuCat); 
        setNotaDipId(id);
        setNotaDipCont(cont);
        setNotaDipNomeC(nome);
        setNotaDipDataC(datac);
        setNumCartoniDip(nuCat);
      }
    
      const getNotafornHandler = (id, nome, datav, datac) => {
        localStorage.setItem("NotaFornId", id);
        localStorage.setItem("notaFornNomeF", nome);
        localStorage.setItem("NotaFornDataV", datav); 
        localStorage.setItem("NotaFornDataC", datac); 
        setNotaFornId(id);
        setNotaFornNomeF(nome);
        setNotaFornDataV(datav);
        setNotaFornDataC(datac);
      }
    
      const getNotaDataScalHandler = (data) => {
        localStorage.setItem("notaDat", data);
        setNotaDat(data);
      }
    
      const getDataScalHandler = (data) => {
        localStorage.setItem("dataScal", data);
        setDateEli(data);
      }

      const getNotaDashHandler = (id, nomC, datNot) => {
        console.log("entrato")
        console.log(nomC, datNot)
        localStorage.setItem("notaDashId", id);
        localStorage.setItem("notaDashNomeC", nomC);
        localStorage.setItem("notaDashData", datNot);
        setNotaDashNomeC(nomC);
        setNotaDashId(id);
        setNotaDashData(datNot);
      }
// EndGet ______________________________________________________________________

  return (
    <AnimatePresence>
    <Routes location={location} key={location.pathname}>
    <Route path="/notadashcliente/:nome/:data" element={<NotaDashCliente />} />
    <Route path="/notaforni/:id/:nome/:data" element={<NotaForni notaId={notaFornId} nomeForni={notaFornNomeF} dataNota={notaFornDataV} dataNotaC={notaFornDataC} />} />
    <Route element={<PrivateRoutes isAuth={isAuth}/>}>
    <Route element={<PrivatePerm/>}>
  
    <Route element={<PrivateRoutesDipen/>}>
    <Route path="/scorta" element={<Scorta />} />
    <Route path="/scortatinte" element={<ScortaTinte />} />
    <Route path="/notadipdata" element={<NotaDipData notaDat={todayC} getNotaDip={getNotaDipHandler}/>} />
    <Route path="/notadip" element={<NotaDip notaDipId={notaDipId} notaDipCont={notaDipCont} notaDipNome={notaDipNomeC} notaDipDataC={notaDipDataC} numCart={NumCartNotaDip}/>} />
    </Route>
  
    <Route element={<PrivateRoutesSup/>}>
    <Route path="/" element={<HomePage />} />
    <Route path="/listafornitori" element={<AddFornitori getFornId={getFornIdHandler}/>} />
    <Route path="/scorta" element={<Scorta />} />
    <Route path="/scortatinte" element={<ScortaTinte />} />
    <Route path="/scalettareview" element={<ScalettaReview notaDat={todayC} getColId={getColIdHandler} getNotaId={getNotadHandler}/>} />
    <Route path="/scalettadata" element={<ScaletData getColId={getColIdHandler}/>} />
    <Route path="/preventivodata" element={<PreventivoData getOrdId={getOrderIdHandler}/>} />
    <Route path="/ordineclientidata" element={<OrdineCliData TodayData={todayC} getOrdId={getOrderIdHandler} getNotaId={getNotadHandler}/>} />
    <Route path="/scaletta" element={<Scaletta TodayData={todayC} getOrdId={getOrderIdHandler} getNotaId={getNotadHandler}/>} />
    <Route path="/ordinefornitoridata" element={<OrdineForniData getOrdFornId={getOrderFornIdHandler}/>} />
    <Route path="/listaclienti" element={<AddCliente getCliId={getCliIdHandler}/>} />
    <Route path="/stampamassiva" element={<StampaMassiva notaId={notaId} cont={notaCont} nomeCli={notaNomeC} dataNota={notaDataV} dataNotaC={notaDataC} numCart={numCartoni} numBust={notaNumBuste} prezzoTotNota={sommaTotale} debit={debitoRes} debTo={debitoTot} indirizzo={notaIndi} tel={notaTel} iva={notaIva} completa={notaCompleta} idDebito={IdDebNota} TodayData={todayC}/>} />
    <Route path="/stampamassivaprev" element={<StampaMassivaPrev notaId={notaId} cont={notaCont} nomeCli={notaNomeC} dataNota={notaDataV} dataNotaC={notaDataC} numCart={numCartoni} numBust={notaNumBuste} prezzoTotNota={sommaTotale} debit={debitoRes} debTo={debitoTot} indirizzo={notaIndi} tel={notaTel} iva={notaIva} completa={notaCompleta} idDebito={IdDebNota}/>} />
    </Route>
  
    <Route element={<PrivateRoutesGuid/>}>
    <Route path="/scalettadatadip" element={<ScalettaDataDip notaDat={todayC} getColId={getColIdHandler}/>} />
    <Route path="/listaclientidip" element={<ListaClientiDip />} />
    </Route>
  
      <Route element={<PrivateDashCli clientId={clientId}/>}>
      <Route path="/dashclienti" element={<DashClienti clientId={clientId} nomeCli={nomeCli} getNotaDash={getNotaDashHandler} getNotaId={getNotadHandler}/>} />
      </Route>
  
      <Route element={<PrivateDashForn fornId={fornId}/>}>
      <Route path="/dashfornitore" element={<DashFornitori fornId={fornId} nomeForn={nomeForn}/>} />
      </Route>
  
      <Route element={<PrivateCate dataScal={dataScal}/>}>
        <Route path="/scaletta" element={<Scalet  dateEli={dateEli}/>} />
      </Route>
  
      <Route element={<PrivateAddClientiScalet notaDat={notaDat}/>}>
        <Route path="/addclientescaletta" element={<AddClienteScalet notaDat={notaDat} getDataScal={getDataScalHandler}/>} />
      </Route>
  
      {/**** Fare attenzione lo deve vedere solo il supervisore */}
      <Route path="/addprevnota" element={<AddPrevNota ordId={ordId} dataOrd={dataOrd} dataOrdConf={dataOrdConf} getNotaId={getNotadHandler} getNotaDataScal={getNotaDataScalHandler} OrdDataMilli={OrdDataMilli}/>} />
        <Route path="/addnota" element={<AddNota TodayData={todayC} ordId={ordId} dataOrd={dataOrd} dataOrdConf={dataOrdConf} getNotaId={getNotadHandler} getNotaDataScal={getNotaDataScalHandler} OrdDataMilli={OrdDataMilli}/>} />
      
  
      <Route element={<PrivateOrdForn ordFornId={ordFornId}/>}>
        <Route path="/addnotaforn" element={<AddNotaForni ordId={ordFornId} dataOrd={dataOrdForn} dataOrdConf={dataOrdFornConf} getNotaForniId={getNotafornHandler}/>} />
      </Route>
  

      <Route path="/preventivo" element={<Preventivo notaDat={todayC} notaId={notaId} cont={notaCont} nomeCli={notaNomeC} dataNota={notaDataV} dataNotaC={notaDataC} numCart={numCartoni} numBust={notaNumBuste} prezzoTotNota={sommaTotale} debit={debitoRes} debTo={debitoTot} indirizzo={notaIndi} tel={notaTel} iva={notaIva} completa={notaCompleta} idDebito={IdDebNota}/>} />
      <Route path="/nota" element={<Nota idCliente={idCliente} notaId={notaId} cont={notaCont} nomeCli={notaNomeC} dataNota={notaDataV} dataNotaC={notaDataC} numCart={numCartoni} numBust={notaNumBuste} prezzoTotNota={sommaTotale} debit={debitoRes} debTo={debitoTot} indirizzo={notaIndi} tel={notaTel} iva={notaIva} completa={notaCompleta} idDebito={IdDebNota}/>} />

  
      <Route element={<PrivateNotaForni notaFornId={notaFornId}/>}>
      </Route>
  
    </Route>
    </Route>
    <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
    <Route path="/singup" element={<SingUp setIsAuth={setIsAuth} />} />
    <Route path="/block" element={<Page_per/>} />
  
    {isAuth ? <Route path="*" element={<Page_per /> }/> : <>
    <Route path="*" element={<SingUp setIsAuth={setIsAuth} />} />
    <Route path="*" element={<Login setIsAuth={setIsAuth} />}/>   </> }

              
    </Routes>
    </AnimatePresence>
  )
}

export default AnimatedRoutes