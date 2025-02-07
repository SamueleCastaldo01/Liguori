import React from 'react'
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate} from "react-router-dom";
import moment from 'moment/moment';
import 'moment/locale/it'
import Paper from '@mui/material/Paper';
import MuiBottomNavigationAction from "@mui/material/BottomNavigationAction";
import { BottomNavigation } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import useMediaQuery from '@mui/material/useMediaQuery';
import { guid, supa, tutti, dipen } from './utenti';
import { styled } from "@mui/material/styles";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AdUnitsIcon from '@mui/icons-material/AdUnits';



function BottomNavi ()  {
    
    const navigate = useNavigate();

    const location = useLocation();
    const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth"));
    const [value, setValue] = React.useState(0);

    const matches = useMediaQuery('(max-width:920px)');  //media query true se è un dispositivo più piccolo del value

    const timeElapsed = Date.now();  //prende la data attuale in millisecondi
    const today = new Date(timeElapsed);    //converte nel tipo data
    var formattedDate = moment(today).format('DD-MM-YYYY');  //coverte nel formato richiesto
    localStorage.setItem("today", formattedDate);
    const [todayC, setTodayC] = useState(localStorage.getItem("today"));  //variabile che andiamo ad utilizzare

    const BottomNavigationAction = styled(MuiBottomNavigationAction)(`
    color: #f6f6f6;
  `);
  
    //permessi utente
    let sup= supa.includes(localStorage.getItem("uid"))
    let gui= guid.includes(localStorage.getItem("uid"))
    let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true
    let dip= dipen.includes(localStorage.getItem("uid"))





return (
<>


    {matches &&
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3} >
              <BottomNavigation 
              sx={{
            bgcolor: '#333',
            '& .Mui-selected': {
            '& .MuiBottomNavigationAction-label': {
              fontSize: theme => theme.typography.caption,
              transition: 'none',
              fontWeight: 'bold',
              lineHeight: '20px'
            },
            '& .MuiSvgIcon-root, & .MuiBottomNavigationAction-label': {
              color: theme => theme.palette.primary.main
              }}}} showLabels>
              {sup ==true   && 
                <BottomNavigationAction
                component={Link}
                className="linq"
                to="/"
                 label="Home" 
                 icon={<HomeIcon color={location.pathname === '/' ? 'primary' : 'inherit'} />}
                 /> }
              {gui ==true   && 
                <BottomNavigationAction
                component={Link}
                className="linq"
                to="/scalettadatadip"
                 label="Scaletta" 
                 icon={<FormatListBulletedIcon color={location.pathname === '/scalettadatadip' ? 'primary' : 'inherit'} />}
                 /> }
                 {/**** 
              {sup ==true   && 
                <BottomNavigationAction
                component={Link}
                className="linq"
                to="/scalettadata"
                 label="Scaletta" 
                 icon={<FormatListBulletedIcon color={(location.pathname === '/scalettadata' || location.pathname === '/scaletta')  ? 'primary' : 'inherit'} />}
                 /> }
                 */}
              {gui ==true  && 
                <BottomNavigationAction
                component={Link}
                className="linq"
                to="/listaclientidip"
                 label="Clienti" 
                 icon={<ContactPageIcon color={location.pathname === '/listaclientidip' ? 'primary' : 'inherit'} />}
                 /> }
              {sup ==true  && 
                <BottomNavigationAction
                component={Link}
                className="linq"
                to="/listaclienti"
                 label="Clienti" 
                 icon={<ContactPageIcon color={location.pathname === '/listaclienti' ? 'primary' : 'inherit'} />}
                 /> }
              {(dip ==true || sup == true) &&
                <BottomNavigationAction
                component={Link}
                className="linq"
                to="/scorta"
                 label="Prodotti"  
                 icon={<InventoryIcon color={(location.pathname === '/scorta' || location.pathname === '/scortatinte') ? 'primary' : 'inherit'} />}
                 /> }
              {sup ==true  &&
                <BottomNavigationAction
                 component={Link}
                 className="linq"
                to="/ordineclientidata"
                 label="Ordine Clienti" 
                 icon={<ShoppingCartIcon color={(location.pathname === '/ordineclientidata' || location.pathname === '/addnota' || location.pathname === '/nota' ) ? 'primary' : 'inherit'} />}
                 />}
              {dip == true &&
                 <BottomNavigationAction
                 component={Link}
                 className="linq"
                to="/notadipdata"
                 label="Nota Dip" 
                 icon={<AdUnitsIcon color={(location.pathname === '/notadipdata' ||  location.pathname === '/notadip' ) ? 'primary' : 'inherit'} />}
                 />}
              {(dip == true || gui == true) &&
                 <BottomNavigationAction
                 component={Link}
                 className="linq"
                to="/login"
                 label="Login"
                 icon={<PersonIcon color={location.pathname === '/login' ? 'primary' : 'inherit'} />}
                 />}
              
              </BottomNavigation>
            </Paper>
       }

</>
    )

}

export default BottomNavi 