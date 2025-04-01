import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import moment from 'moment/moment';
import 'moment/locale/it';
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

const BottomNavigationAction = styled(MuiBottomNavigationAction)(`
  color: #f6f6f6;
`);

function BottomNavi() {
    const navigate = useNavigate();
    const location = useLocation();
    const matches = useMediaQuery('(max-width:920px)');

    // Data attuale salvata in localStorage
    const today = moment().format('DD-MM-YYYY');
    localStorage.setItem("today", today);
    
    // Permessi utente
    let sup = supa.includes(localStorage.getItem("uid"));
    let gui = guid.includes(localStorage.getItem("uid"));
    let ta = tutti.includes(localStorage.getItem("uid"));
    let dip = dipen.includes(localStorage.getItem("uid"));

    return (
        <>
            {matches && (
                <Paper
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.3)'
                    }}
                    elevation={3}
                >
                    <BottomNavigation
                        sx={{
                            bgcolor: '#333',
                            '& .MuiBottomNavigationAction-root': {
                                color: '#fff',
                            },
                            '& .Mui-selected': {
                                bgcolor: '#fff',
                                borderRadius: '10px',
                                '& .MuiBottomNavigationAction-label': {
                                    fontSize: theme => theme.typography.caption,
                                    fontWeight: 'bold',
                                    transition: 'none',
                                    lineHeight: '20px',
                                    color: '#000',
                                },
                                '& .MuiSvgIcon-root': {
                                    color: '#000',
                                }
                            }
                        }}
                        showLabels
                    >
                        {sup && (
                            <BottomNavigationAction
                                component={Link}
                                to="/"
                                label="Home"
                                icon={<HomeIcon />}
                            />
                        )}
                        {gui && (
                            <BottomNavigationAction
                                component={Link}
                                to="/scalettadatadip"
                                label="Scaletta"
                                icon={<FormatListBulletedIcon />}
                            />
                        )}
                        {gui && (
                            <BottomNavigationAction
                                component={Link}
                                to="/listaclientidip"
                                label="Clienti"
                                icon={<ContactPageIcon />}
                            />
                        )}
                        {sup && (
                            <BottomNavigationAction
                                component={Link}
                                to="/listaclienti"
                                label="Clienti"
                                icon={<ContactPageIcon />}
                            />
                        )}
                        {(dip || sup) && (
                            <BottomNavigationAction
                                component={Link}
                                to="/scorta"
                                label="Prodotti"
                                icon={<InventoryIcon />}
                            />
                        )}
                        {sup && (
                            <BottomNavigationAction
                                component={Link}
                                to="/ordineclientidata"
                                label="Ordine Clienti"
                                icon={<ShoppingCartIcon />}
                            />
                        )}
                        {dip && (
                            <BottomNavigationAction
                                component={Link}
                                to="/notadipdata"
                                label="Nota Dip"
                                icon={<AdUnitsIcon />}
                            />
                        )}
                    </BottomNavigation>
                </Paper>
            )}
        </>
    );
}

export default BottomNavi;
