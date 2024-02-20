import * as React from 'react';
import {collection, deleteDoc, doc, onSnapshot ,addDoc ,updateDoc, query, orderBy, where, serverTimestamp, limit, getDocs, getCountFromServer} from 'firebase/firestore';
import { auth, db } from "../firebase-config";
import { supa } from '../components/utenti';
import { guid } from '../components/utenti';
import { tutti } from '../components/utenti';
import { styled, useTheme } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import ViewListIcon from '@mui/icons-material/ViewList';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import HomeIcon from '@mui/icons-material/Home';
import ListItemText from '@mui/material/ListItemText';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import InventoryIcon from '@mui/icons-material/Inventory';
import AdUnitsIcon from '@mui/icons-material/AdUnits';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import { useNavigate } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import {signOut} from "firebase/auth";
import { useState, useEffect } from 'react';
import DraftsIcon from '@mui/icons-material/Drafts';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import { useLocation } from 'react-router-dom'; 
import TodoClient from './TodoClient';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function MiniDrawer( {signUserOut} ) {

  const [todoNoti, setTodoNoti] = React.useState([]);  //array notifica
  const [notiPa, setNotiPa] = React.useState("");  //flag per comparire la notifica dot
  const [notiMessPA, setNotiMessPA] = React.useState(false);  //flag per far comparire il messaggio
  const [anchorElNoty, setAnchorElNoty] = React.useState(null);
  const [notiPaId, setNotiPaId] = React.useState("7k5cx6hwSnQTCvWGVJ2z");  //id NotificapPa per modificare all'interno del database

  const [anchorEl, setAnchorEl] = React.useState(null);
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = React.useState(localStorage.getItem("isAuth"))
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const [selectedItem, setSelectedItem] = useState('');

  //Open sottocategorie
  const [openSottocategoria, setOpenSottocategoria] = React.useState(false);
  const [openSottocategoriaProd, setOpenSottocategoriaProd] = React.useState(false);
  const [openSottocategoriaOrd, setOpenSottocategoriaOrd] = React.useState(false);
  const [openSottocategoriaForn, setOpenSottocategoriaForn] = React.useState(false);

  //permessi utente
  let sup= supa.includes(localStorage.getItem("uid"))
  let gui= guid.includes(localStorage.getItem("uid"))
  let ta= tutti.includes(localStorage.getItem("uid"))  //se trova id esatto nell'array rispetto a quello corrente, ritorna true

  const location= useLocation();

//sottocategorie Clienti
  const handleClickSottoCategoria = () => {
    setOpenSottocategoria(!openSottocategoria);
  };
  const handleMouseEnter = () => {
    setOpenSottocategoria(true);
    setOpenSottocategoriaProd(false);
    setOpenSottocategoriaOrd(false);
  };
  const handleMouseLeave = () => {
    setOpenSottocategoria(false);
  };

  //Sottocategorie Prodotti
  const handleClickSottoCategoriaProd = () => {
    setOpenSottocategoriaProd(!openSottocategoriaProd);
  };
  const handleMouseEnterProd = () => {
    setOpenSottocategoriaProd(true);
    setOpenSottocategoria(false);
    setOpenSottocategoriaOrd(false);
    setOpenSottocategoriaForn(false);
  };
  const handleMouseLeaveProd = () => {
    setOpenSottocategoriaProd(false);
  };

    //Sottocategorie Ordini
    const handleClickSottoCategoriaOrd = () => {
      setOpenSottocategoriaOrd(!openSottocategoriaOrd);
    };
    const handleMouseEnterOrd = () => {
      setOpenSottocategoriaOrd(true);
      setOpenSottocategoria(false);
      setOpenSottocategoriaProd(false)
      setOpenSottocategoriaForn(false);
    };
    const handleMouseLeaveOrd = () => {
      setOpenSottocategoriaOrd(false);
    };

     //Sottocategorie Fornitori
     const handleClickSottoCategoriaForn = () => {
      setOpenSottocategoriaForn(!openSottocategoriaForn);
    };
    const handleMouseEnterForn = () => {
      setOpenSottocategoriaForn(true);
      setOpenSottocategoria(false);
      setOpenSottocategoriaProd(false)
      setOpenSottocategoriaOrd(false)
    };
    const handleMouseLeaveForn = () => {
      setOpenSottocategoriaForn(false);
    };   


  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuNoty = async (event) => {
    if(notiPa == "dot") {
      setAnchorElNoty(event.currentTarget);
    }
    await updateDoc(doc(db, "notify", notiPaId), { NotiPa: false });  //va a modificare il valore della notifica
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseNoty = () => {
    setAnchorElNoty(null);
    setNotiMessPA(false)
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };


//***********USE EFFECT*********************************************** */
  useEffect(() => {
    // Ascolta i cambiamenti nell'URL e imposta l'elemento selezionato in base all'URL
    switch (location.pathname) {
      case '/scalettadata':
        setSelectedItem('scaletta');
        break;
        case '/scaletta':
          setSelectedItem('scaletta');
          break;
      case '/scorta':
        setSelectedItem('magazzino');
        break;
      case '/scortatinte':
        setSelectedItem('scortatinte');
        break;
      case '/listaclienti':
          setSelectedItem('listaclienti');
        break;
      case '/dashclienti':
          setSelectedItem('listaclienti');
        break;
      case '/listafornitori':
        setSelectedItem('listafornitori');
        break;
      case '/dashfornitore':
          setSelectedItem('listafornitori');
        break;
      case '/preventivodata':
          setSelectedItem('preventivo');
        break;
      case '/addprevnota':
          setSelectedItem('preventivo');
      break;
      case '/preventivo':
        setSelectedItem('preventivo');
      break;
      case '/ordineclientidata':
        setSelectedItem('ordineclientidata');
        break;
      case '/addnota':
        setSelectedItem('ordineclientidata');
        break;
      case '/nota':
        setSelectedItem('ordineclientidata');
        break;
      case '/ordinefornitoridata':
        setSelectedItem('ordinefornitoridata');
        break;
      case '/addnotaforn':
        setSelectedItem('ordinefornitoridata');
        break;
      case '/notadipdata':
        setSelectedItem('notadipdata');
        break;
      default:
        setSelectedItem('homepage');
        break;
    }
  }, [location.pathname]);
//________________________________________________________________________________________
    //Notifiche
    React.useEffect(() => {
      const collectionRef = collection(db, "notify");
      const q = query(collectionRef, );
  
      const unsub = onSnapshot(q, (querySnapshot) => {
        let todosArray = [];
        querySnapshot.forEach((doc) => {
          todosArray.push({ ...doc.data(), id: doc.id });
        });
        setTodoNoti(todosArray);
      });
      return () => unsub();
    }, [location.pathname]);

        React.useEffect(() => {  //Notifica Pa
          todoNoti.map( (nice) => {
            if(nice.NotiPa == true){
              setNotiPa("dot")
              setNotiMessPA(true)
            } else {
              setNotiPa("")
            }
          } )
      console.log(notiPa)
        }, [todoNoti]);

//________________________________________________________________________________________
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} color="secondary">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            
          </Typography>

        <div>
        {sup &&
        <>
          <Badge color="error" variant={notiPa} style={{ marginRight: "20px" }}>
            <NotificationsIcon onClick={handleMenuNoty}/>
          </Badge>
          <Menu  sx={
        { mt: "1px", "& .MuiMenu-paper": 
        { backgroundColor: "#333",
          color: "white" }, 
        }
        }
                id="menu-appbar"
                anchorEl={anchorElNoty}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElNoty)}
                onClose={handleCloseNoty}
              >
                {notiMessPA && <MenuItem onClick={handleCloseNoty}>Pa è stato modificato</MenuItem>}
                
              </Menu>
              </>
            }
        </div>


          <div >
            <Avatar alt="Remy Sharp" src={localStorage.getItem("profilePic")} onClick={handleMenu}/>
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
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={ () => {handleClose(); navigate("/login")}}>LogIn</MenuItem>
                <MenuItem onClick={ () => {signUserOut(); handleClose(); localStorage.setItem(false,"isAuth"); setIsAuth(false); navigate("/login")}}>LogOut</MenuItem> 

                
              </Menu>
            </div>

        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open} 
         PaperProps={{
       sx: {
      backgroundColor: "#333",
      color: "white",
    }
  }}
      >
        <DrawerHeader>
            Nome Azienda
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon sx={{ color: "white" }}/>}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>

        <ListItem  disablePadding sx={{ display: 'block' }} onClick={() => {navigate("/")}}>
              <ListItemButton
              
          selected={selectedItem === "homepage"}
          onClick={(event) => handleListItemClick(event, 7)}>
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <HomeIcon  sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="HomePage" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
          </ListItem>


      {/* Elemento padre Clienti */}
      <ListItem  disablePadding sx={{ display: 'block', backgroundColor: openSottocategoria ? 'white' : 'initial' }}>
      <ListItemButton  onMouseEnter={handleMouseEnter}  onClick={handleClickSottoCategoria}>
        <ListItemIcon>
          <PeopleIcon sx={{ color: openSottocategoria ?  "black" : "white" }}/>
        </ListItemIcon>
        <ListItemText sx={{ color: openSottocategoria ? 'black' : 'white' }} primary="Clienti" />
        {openSottocategoria ? <ExpandLess sx={{ color: 'black' }} /> : <ExpandMore  />}
      </ListItemButton>
      </ListItem>
      {/* Sottocategoria */}
      <Collapse in={openSottocategoria} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem  disablePadding sx={{ display: 'block' }} onClick={() => {navigate("/listaclienti")}}>
                <ListItemButton sx={{ pl: 4 }}
                          selected={selectedItem === "listaclienti"}
            onClick={(event) => handleListItemClick(event, 2)}>
                  <ListItemIcon
                    sx={{minWidth: 0, mr: open ? 3 : 'auto'}}
                  >
                    <ContactPageIcon sx={{ color: "white" }}/>
                  </ListItemIcon>
                  <ListItemText primary="Anagrafica Clienti" sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
        </List>
      </Collapse>


      {/* Elemento padre "Prodotti" */}
      <div >
      <ListItem  disablePadding sx={{ display: 'block', backgroundColor: openSottocategoriaProd ? 'white' : 'initial' }}>
      <ListItemButton onMouseEnter={handleMouseEnterProd }  onClick={handleClickSottoCategoriaProd}  >
        <ListItemIcon>
          <InventoryIcon sx={{ color: openSottocategoriaProd ?  "black" : "white" }}/>
        </ListItemIcon>
        <ListItemText sx={{ color: openSottocategoriaProd ? 'black' : 'white' }} primary="Prodotti" />
        {openSottocategoriaProd ? <ExpandLess sx={{ color: 'black' }} /> : <ExpandMore />}
      </ListItemButton>
      </ListItem>
      {/* Sottocategoria */}
      <Collapse in={openSottocategoriaProd} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem  disablePadding sx={{ display: 'block' }} onClick={() => {navigate("/scorta")}}>
                <ListItemButton sx={{ pl: 4 }}
            selected={selectedItem === "magazzino"}
            onClick={(event) => handleListItemClick(event, 0)}>
                  <ListItemIcon sx={{minWidth: 0, mr: open ? 3 : 'auto'}}>
                    <InventoryIcon sx={{ color: "white" }}/>
                  </ListItemIcon>
                  <ListItemText primary="Prodotti" sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
          </ListItem>
        {/** 
          <ListItem  disablePadding sx={{ display: 'block' }} onClick={() => {navigate("/scortatinte")}}>
              <ListItemButton sx={{ pl: 4 }}
          selected={selectedItem === "scortatinte"}
          onClick={(event) => handleListItemClick(event, 8)}>
                <ListItemIcon sx={{minWidth: 0, mr: open ? 3 : 'auto'}}>
                  <InvertColorsIcon sx={{ color: "white" }}/>
                </ListItemIcon>
                <ListItemText primary="Tinte" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
          </ListItem>
          */}
        </List>
      </Collapse>
      </div>


      {/* Elemento padre Fornitori */}
      <ListItem  disablePadding sx={{ display: 'block', backgroundColor: openSottocategoriaForn ? 'white' : 'initial' }}>
      <ListItemButton onMouseEnter={handleMouseEnterForn }  onClick={handleClickSottoCategoriaForn}>
        <ListItemIcon>
          <InboxIcon sx={{ color: openSottocategoriaForn ?  "black" : "white" }}/>
        </ListItemIcon>
        <ListItemText sx={{ color: openSottocategoriaForn ? 'black' : 'white' }} primary="Fornitori" />
        {openSottocategoriaForn ? <ExpandLess sx={{ color: 'black' }} /> : <ExpandMore />}
      </ListItemButton>
      </ListItem>
      {/* Sottocategoria */}
      <Collapse in={openSottocategoriaForn} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
        <ListItem  disablePadding sx={{ display: 'block' }} onClick={() => {navigate("/listafornitori")}}>
              <ListItemButton sx={{ pl: 4 }}
          selected={selectedItem === "listafornitori"}
          onClick={(event) => handleListItemClick(event, 3)}>
                <ListItemIcon sx={{minWidth: 0, mr: open ? 3 : 'auto'}}>
                  <InvertColorsIcon sx={{ color: "white" }}/>
                </ListItemIcon>
                <ListItemText primary="Anagrafica Fornitori" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
          </ListItem>
        </List>
      </Collapse>



      {/* Elemento padre "Ordini" */}
      <div >
      <ListItem  disablePadding sx={{ display: 'block', backgroundColor: openSottocategoriaOrd ? 'white' : 'initial' }}>
      <ListItemButton onMouseEnter={handleMouseEnterOrd }  onClick={handleClickSottoCategoriaOrd}  >
        <ListItemIcon>
          <ViewListIcon sx={{ color: openSottocategoriaOrd ?  "black" : "white" }} />
        </ListItemIcon>
        <ListItemText sx={{ color: openSottocategoriaOrd ? 'black' : 'white' }} primary="Ordini" />
        {openSottocategoriaOrd ? <ExpandLess sx={{ color: 'black' }} /> : <ExpandMore />}
      </ListItemButton>
      </ListItem>
      {/* Sottocategoria */}
      <Collapse in={openSottocategoriaOrd} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
        {/** 
          <ListItem  disablePadding sx={{ display: 'block' }} onClick={() => {navigate("/preventivodata")}}>
                <ListItemButton sx={{ pl: 4 }}
                    selected={selectedItem === "preventivo"}
                  onClick={(event) => handleListItemClick(event, 7)}>
                  <ListItemIcon
                    sx={{ minWidth: 0,mr: open ? 3 : 'auto'}}>
                    <NoteAltIcon sx={{ color:  "white" }}/>
                  </ListItemIcon>
                  <ListItemText primary="Preventivo" sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
          */}

            <ListItem  disablePadding sx={{ display: 'block' }} onClick={() => {navigate("/ordineclientidata")}}>
                <ListItemButton sx={{ pl: 4 }}
                    selected={selectedItem === "ordineclientidata"}
                  onClick={(event) => handleListItemClick(event, 4)}>
                  <ListItemIcon sx={{ minWidth: 0,mr: open ? 3 : 'auto'}}>
                    <NoteAddIcon sx={{ color: "white" }}/>
                  </ListItemIcon>
                  <ListItemText primary="Ordine Clienti" sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>

            <ListItem  disablePadding sx={{ display: 'block' }} onClick={() => {navigate("/ordinefornitoridata")}}>
                <ListItemButton sx={{ pl: 4 }}
                  selected={selectedItem === "ordinefornitoridata"}
                  onClick={(event) => handleListItemClick(event, 5)}>
                  <ListItemIcon sx={{ minWidth: 0,mr: open ? 3 : 'auto'}}>
                    <ReceiptLongIcon sx={{ color: "white" }}/>
                  </ListItemIcon>
                  <ListItemText primary="Ordine Fornitori" sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
        </List>
      </Collapse>
      </div>

{/*** 
      <ListItem  disablePadding sx={{ display: 'block' }} onClick={() => {navigate("/scalettadata")}}>
              <ListItemButton
          selected={selectedItem === "scaletta"}
          onClick={(event) => handleListItemClick(event, 1)}>
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                <FormatListNumberedIcon sx={{ color: "white" }}/>
                </ListItemIcon>
                <ListItemText primary="Scaletta" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
          </ListItem>


          <ListItem  disablePadding sx={{ display: 'block' }} onClick={() => {navigate("/notadipdata")}}>
              <ListItemButton
                selected={selectedItem === "notadipdata"}
                 onClick={(event) => handleListItemClick(event, 6)}>
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <AdUnitsIcon sx={{ color: "white" }}/>
                </ListItemIcon>
                <ListItemText primary="Ordini da Evadere" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
          </ListItem>
*/}
        </List>

      </Drawer>

    </Box>
  );
}