import React, { useEffect, useRef, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import moment from 'moment';
import { IconButton } from '@mui/material';
import { tutti } from '../components/utenti';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';
import BulkOrderItems from '../components/BulkOrderItems';
import useBulkOrders from '../hooks/useBulkOrders';
import { formatOrderAmount, normalizeOrderDate } from '../utils/bulkOrders';

function StampaMassiva({ TodayData }) {
  const ta = tutti.includes(localStorage.getItem('uid'));
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMediaQuery('(max-width:920px)');
  const [scalettaDataSele, setScalettaDataSele] = useState(() =>
    normalizeOrderDate(location.state?.date) || normalizeOrderDate(TodayData) || moment().format('DD-MM-YYYY')
  );
  const [switchScaletta, setSwitchScaletta] = useState(location.state?.scaletta === true);
  const { orders: todosAddNota, loading, error, retry } = useBulkOrders(scalettaDataSele, switchScaletta);
  const [flagStampa, setFlagStampa] = useState(false);
  const [printError, setPrintError] = useState(false);
  const componentRef = useRef();
  const printReady = useRef(null);

  useEffect(() => {
    if (flagStampa && printReady.current) {
      printReady.current();
      printReady.current = null;
    }
  }, [flagStampa]);

  const print = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Ordini-${scalettaDataSele}`,
    onBeforeGetContent: () => new Promise((resolve) => {
      printReady.current = resolve;
      setPrintError(false);
      setFlagStampa(true);
    }),
    onAfterPrint: () => setFlagStampa(false),
    onPrintError: () => { setFlagStampa(false); setPrintError(true); },
    pageStyle: `
      @page { size: A4; margin: 8mm; }
      @media print {
        html, body { height: auto !important; overflow: visible !important; background: white; }
        .bulk-print-content { width: auto !important; height: auto !important; padding: 0 !important; overflow: visible !important; }
        .bulk-order-document { break-after: page; page-break-after: always; min-height: 0 !important; padding-top: 0 !important; }
        .bulk-order-document:last-child { break-after: auto; page-break-after: auto; }
        .bulk-order-item { break-inside: avoid; page-break-inside: avoid; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `,
  });

  const handleChangeDataScaletta = (event) => {
    const date = normalizeOrderDate(event.target.value);
    if (date) setScalettaDataSele(date);
  };
  const handleSwitchChange = () => setSwitchScaletta((value) => !value);
    return (  
        <>
        {/**************NAVBAR MOBILE*************************************** */}
        <div className='navMobile row'>
      <div className='col-2'>
        <IconButton className="buttonArrow" aria-label="delete" sx={{ color: "#f6f6f6", marginTop: "7px" }}
        onClick={ ()=> {navigate(-1); }}>
        <ArrowBackIcon sx={{ fontSize: 30 }}/>
      </IconButton>
      </div>
      <div className='col' style={{padding: 0}}>
      <p className='navText'> Stampa Massiva </p>
      </div>
      </div>


    <div >

{!matches && 
  <button className="backArrowPage" style={{float: "left"}}
      onClick={() => {navigate(-1)}}>
      <ArrowBackIcon id="i" /></button> }

      
      {!matches ? <h1 className='title mt-3'> Stampa Massiva</h1> : <div style={{marginBottom:"60px"}}></div>} 

    <div className='d-flex gap-3 align-items-center justify-content-center'>
    <span><button onClick={print} disabled={loading || !!error || !todosAddNota.length || flagStampa}>Stampa</button></span>
           <input
            type="date"
            aria-label="Data ordini da stampare"
            disabled={flagStampa}
            value={moment(scalettaDataSele, "DD-MM-YYYY").format("YYYY-MM-DD")} // Converti per l'input
            onChange={(e) => handleChangeDataScaletta(e)} // Salva in formato gg-mm-yyyy
            />
            <h6 className='mb-0'>Numero note: {todosAddNota.length}</h6>
     <label>
        <span>Scaletta: </span>
        <input
          type="checkbox"
          disabled={flagStampa}
          checked={switchScaletta}
          onChange={handleSwitchChange}
        />
      </label>
    </div>

    

{/*********************DDT********************************************************************** */}
{loading && <CircularProgress />}
{error && <div role="alert">Impossibile caricare gli ordini. <button onClick={retry}>Riprova</button></div>}
{printError && <p role="alert">Impossibile avviare la stampa. Riprova.</p>}
{!loading && !error && todosAddNota.length === 0 && <p>Nessun ordine per la data selezionata.</p>}
{!loading && !error && todosAddNota.length > 0 &&
    <div ref={componentRef} className="foglioA4 overflow-auto bulk-print-content" style={{
      paddingLeft: "50px", 
      paddingRight: "50px", 
      paddingTop: "20px", 
      height: !flagStampa ? "90vh" : "auto"
  }}>

    {todosAddNota.map((todoAdd) => (
    <div key={todoAdd.id} className="bulk-order-document" style={{minHeight: flagStampa ? undefined : (todoAdd.altezza || "1123px"), paddingTop: "20px"}}>
      <>
      <div className='row rigaNota' >
        <div className='col colNotaSini' style={{textAlign:"left", padding:"0px", paddingLeft:"0px"}}>
        <h6 style={{fontSize:"9px"}}>MITTENTE: Ditta, Domicilio o Residenza, Codice Fiscale, Partita IVA</h6>
        <h5 style={{marginBottom:"0px", marginTop:"10px"}}>LIGUORI  <span style={{fontSize:"0.6em", marginRight:"10px"}} >s.r.l </span> <span style={{fontSize:"0.6em"}} > u.p.</span> </h5>
        <h5 className='sinistraNota'>Sede legale e deposito merci:</h5>
        <h5 className='sinistraNota'>Via F. Caracciolo 18</h5>
        <h5 className='sinistraNota'>80023 Caivano (NA)</h5>
        <h5 className='sinistraNota'>Cod.Fisc. e Partita IVA n.08319431212</h5>
        <h6 className='sinistraNota6'>R.I. 08319431212</h6>
        <h6 className='sinistraNota6'>R.E.A. NA 948532</h6>
        <h6 className='sinistraNota6' style={{marginBottom:"5px"}}>Cap.Soc. €10.000,00 I.V.</h6>
        </div>

        <div className='col'  style={{textAlign:"left", padding:"0px", marginLeft:"5px"}}>
        <h3  style={{marginBottom:"-5px", fontSize:"22.5px"}}><b>DOCUMENTO DI TRASPORTO</b></h3>
        <h4 style={{marginBottom:"9px"}}><b>(D.d.t.)</b> <span style={{fontSize:"0.4em", marginRight:"10px"}}>&emsp;&ensp; D.P.R. 472 del 14-08-1996-D.P.R 696 del 21.12.1996 </span></h4>
        <h4 style={{marginBottom:"9px"}}> <b>N.</b> <span style={{marginRight:"10px"}}>{todoAdd.cont}</span> <span style={{fontSize:"13px"}}><b>del</b></span> {todoAdd.data} </h4>

    <div className="form-check form-check-inline"  style={{padding:"0px", fontSize:"13px"}}>a mezzo: &nbsp; &nbsp;
    <input id={`mittente-${todoAdd.id}`} type="checkbox" checked readOnly/>
      <label htmlFor={`mittente-${todoAdd.id}`}>&nbsp;mittente</label>
    </div>
    </div>
    </div>

    <div className='row rigaNota'>
    <div className='col colNotaSini'style={{textAlign:"left", padding:"0px", paddingLeft:"0px"}}>
    <h6 style={{fontSize:"9px"}}>DESTINATARIO: Ditta, Codice Fiscale, Partita IVA</h6>
      <div className='row'>
      <h5 style={{marginBottom:"0px", marginTop:"0px"}}> {todoAdd.nomeC} </h5>
        <h5 className='sinistraNota'>{todoAdd.indirizzo}</h5>
        <h5 className='sinistraNota'>Tel {todoAdd.tel}</h5>
        <h5 className='sinistraNota'  style={{marginBottom:"5px"}}>Cod.Fisc. e Partita IVA n.{todoAdd.partitaIva}</h5>
      </div>
    </div>

      <div className='col'  style={{textAlign:"left", padding:"0px", marginLeft:"5px"}}>
      <h6 style={{fontSize:"9px"}}>LUOGO DI DESTINAZIONE</h6>
      </div>
    </div>
{/***********tabella aggiunta prodotto************************************************** */}
  <div className='row' style={{textAlign:"center", background:"#212529", color:"#f6f6f6"}}>
    <div className='col-1' style={{padding:"0px"}}>Qt</div>
    <div className='col-6' style={{padding:"0px"}}>Prodotto</div>
    {!flagStampa && <div className='col-2' style={{padding:"0px"}}>Prezzo Uni</div>}
    <div className='col-2' style={{padding:"0px"}}>Prezzo Totale</div>
  </div>


{/** Read-only rows use each order's status. Printing never writes to Firestore. */}
<div>
  {ta && <BulkOrderItems order={todoAdd} showUnitPrices={!flagStampa} />}
</div>

  <div className='row'>
    <div className='col' style={{textAlign:"left", padding:"0px"}}>
    <h6 className='mt-2'>Numero Cartoni: <span> {todoAdd.NumCartoni} </span> 
    </h6> 
    <h6 className='mt-2'>Numero Buste: <span> {todoAdd.NumBuste} </span> 
    </h6> 
       </div>

    <div className='col' style={{textAlign:"right", padding:"0px"}}>
    <h6>Totale: {formatOrderAmount(todoAdd.sommaTotale)} €</h6>
    <h6>Debito Residuo: {formatOrderAmount(todoAdd.debitoRes)} €</h6>
    <h6>Debito Totale: {formatOrderAmount(todoAdd.debitoTotale)} €</h6>
    </div>

  </div>
     </>
    </div>
  ))}

    </div>
}

</div>
    </>
      )
}
export default StampaMassiva;