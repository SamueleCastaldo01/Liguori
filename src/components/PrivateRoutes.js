import { Outlet, Navigate } from 'react-router-dom'
import { tutti, dipen, guid, supa } from './utenti';


export function PrivateRoutes ({isAuth})  {
    return(
        isAuth ? <Outlet/> : <Navigate to="/login"/>
    );
}

export function PrivateRoutesSup ({})  {
    var str="/";
    let sup = supa.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
    let gui = guid.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
    let dip = dipen.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
    if (dip==true) {  str= "/notadipdata" }
    if (gui== true) { str= "/scalettadatadip" }
    return(
        sup ? <Outlet/> : <Navigate to={str}/>
    );
}

export function PrivateRoutesGuid ({})  {
    var a=false;
    let gui = guid.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
    let sup = supa.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
    if(gui==true || sup==true) { a=true }
    return(
        a ? <Outlet/> : <Navigate to="/"/>
    );
}


export function PrivateRoutesDipen ({})  {
    var a=false;
    let dip = dipen.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
    let sup = supa.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
    if(dip==true || sup==true) { a=true }
    return(
        a ? <Outlet/> : <Navigate to="/"/>
    );
}

export function PrivateCate({dataScal}) {
    return (
        dataScal ? <Outlet/> : <Navigate to="/"/>
    );
}

export function PrivateOrd({ordId}) {
    return (
        ordId ? <Outlet/> : <Navigate to="/ordineclientidata"/>
    );
}

export function PrivateOrdForn({ordFornId}) {
    return (
        ordFornId ? <Outlet/> : <Navigate to="/ordinefornitoridata"/>
    );
}

export function PrivateNota({notaId}) {
    return (
        notaId ? <Outlet/> : <Navigate to="/ordineclientidata"/>
    );
}

export function PrivateAddClientiScalet({notaDat}) {
    return (
        notaDat ? <Outlet/> : <Navigate to="/ordineclientidata"/>
    );
}

export function PrivateNotaForni({notaFornId}) {
    return (
        notaFornId ? <Outlet/> : <Navigate to="/ordinefornitoridata"/>
    );
}

export function PrivateDashCli({clientId}) {
    return (
        clientId ? <Outlet/> : <Navigate to="/listaclienti"/>
    );
}

export function PrivateDashForn({fornId}) {
    return (
        fornId ? <Outlet/> : <Navigate to="/listafornitori"/>
    );
}

export function PrivatePerm({}) {
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
    return (
        ta ? <Outlet/> : <Navigate to="/block"/>
    );
}