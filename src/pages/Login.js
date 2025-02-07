//pagina di login
import React from 'react'
import { useState } from 'react';
import { useRef } from 'react';
import { TextField } from '@mui/material';
import {auth, providerGoogle, providerFacebook} from "../firebase-config";
import {signInWithPopup} from 'firebase/auth';
import {useNavigate} from "react-router-dom";
import { login } from '../firebase-config';
import Button from '@mui/material/Button';

function Login({setIsAuth}) {
  let navigate = useNavigate();  

  const backgroundStyle = {
    backgroundImage: 'url("/imageLogin.png")',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '100vw',
    height: '100vh',
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 //_______________________________________________________________________________________

//_______________________________________________________________________________________
  const signInwithGoogle = () => {  //function for login with google
    signInWithPopup(auth, providerGoogle).then((result) => {
      const email = result.user.email;
      const profilePic = result.user.photoURL;

      localStorage.setItem("email", email);
      localStorage.setItem("profilePic", profilePic);
      localStorage.setItem("isAuth", true);
      setIsAuth(true);  //flag the user is logged in
      navigate("/");  //returns it to the home page
    })
  }
//___________________________________________________________________________________________
  async function handelLogin () {    //login function
    try {
      await login(email, password).then((result) => {
        const email = result.user.email;
  
        localStorage.setItem("email", email);
        localStorage.setItem("isAuth", true);
        setIsAuth(true);  //flag the user is logged in
        navigate("/");  //returns it to the home page
      })
    } catch{
    }

  }
//_____________________________________________________________________________________________
const singup = () => {
  navigate("/singup");   //I report it to the sign up page
}

const forgotPassword = () => {
  navigate("/recoverpassword");  //I report it to the recover password page
}
//___________________________________________________________________________________________
  return (
    <>
    <div className='LoginPage'>
    <div className="background-image"></div>
    <div className="container" style={{ justifyContent: "center", display: "flex", alignItems: "center" }}>
    {/* Utilizza il percorso relativo alla radice del tuo progetto */}
            <div className='contanier Login'  style={{width:"500px", backgroundColor:"white", position:"absolute", top:"250px", zIndex:"9999", justifyContent: "center", borderRadius: "20px", borderColor:"black", borderWidth: "4px", borderStyle: "solid" }}>
              <h2 className="title mt-3">Login</h2>
              <h6 className="mt-1 mb-5">Liguori Srl</h6>
              <div className="form-outline form-black mb-4">
                <TextField  type='email' className='' style={{width:"75%"}} color='secondary' id="filled-basic" label="Email" variant="outlined" autoComplete='off'  
                 onChange={(e) => setEmail(e.target.value)}/>
              </div>

              <div className="form-outline form-black mb-4">
                <TextField  type='password' className='' style={{width:"75%"}} color='secondary' id="filled-basic" label="Password" variant="outlined" autoComplete='off'  
                 onChange={(e) => setPassword(e.target.value)}/>
              </div>

              <p style={{ cursor: "default" }} className="small mb-4 pb-lg-2" onClick={forgotPassword}><a className="text-black-50">Forgot password?</a></p>

              <Button onClick={handelLogin} style={{ width: "50%", height: "50px" }} className='' type='submit' color='secondary' variant="contained" >Login</Button>
          <div>
        <button className="google-sign-in-button mt-4 mb-4" onClick={signInwithGoogle}>
          <img
            src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-suite-everything-you-need-know-about-google-newest-0.png"
            alt="Google"
            className="google-icon"
              />
              Sign up using Google
        </button>
          </div>

            <div>
           
              <p style={{ cursor: "default" }} className="mb-0">Do not have an account? <a onClick={singup} className="text-black-50 fw-bold">Sign Up</a>
              </p>
            </div>

          </div>
        </div>

        </div>


    </>
  )

}

export default Login