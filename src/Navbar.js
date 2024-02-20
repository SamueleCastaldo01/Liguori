import React from "react";
import { Header } from "./Navbar.style";
import { CDBNavbar } from "cdbreact";
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

const Navbar = () => {

  const [imageProfile, setImageProfile] = React.useState(localStorage.getItem("profilePic"));

	return (
        <Header style={{background:"#333", color:"#fff"}}>
          <CDBNavbar dark expand="md" scrolling className="justify-content-end">
            <div className="ml-auto">
            <Stack direction="row" spacing={2}>
            <IconButton sx={{color: "white"}} aria-label="delete" size="small">
              <NotificationsIcon fontSize="medium" />
            </IconButton>
              <Avatar style={{marginRight:"5px"}} alt="Travis Howard" src={imageProfile} />
            </Stack>

              
              
            </div>
          </CDBNavbar>
        </Header>
	);
}

export default Navbar;
