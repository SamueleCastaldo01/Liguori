import {auth, providerGoogle} from "../firebase-config";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { TextField } from "@mui/material";
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import { useState } from "react";



export const SingUp = () => {
    let navigate = useNavigate();  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, providerGoogle);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  const login = () => {
    navigate("/login");   //I report it to the sign up page
  }

  return (
    <div className='LoginPage'>
    <div className="background-image"></div>
    <div className="container" style={{ justifyContent: "center", display: "flex", alignItems: "center" }}>
    {/* Utilizza il percorso relativo alla radice del tuo progetto */}
            <div className='contanier Login'  style={{width:"500px", backgroundColor:"white", position:"absolute", top:"250px", zIndex:"9999", justifyContent: "center", borderRadius: "20px", borderColor:"black", borderWidth: "4px", borderStyle: "solid" }}>
              <h2 className="title mt-3">Sing Up</h2>
              <h6 className="mt-1 mb-5">Liguori Srl</h6>
              <div className="form-outline form-black mb-4">
                <TextField  type='email' className='' style={{width:"75%"}} color='secondary' id="filled-basic" label="Email" variant="outlined" autoComplete='off'  
                 onChange={(e) => setEmail(e.target.value)}/>
              </div>

              <div className="form-outline form-black mb-4">
                <TextField  type='password' className='' style={{width:"75%"}} color='secondary' id="filled-basic" label="Password" variant="outlined" autoComplete='off'  
                 onChange={(e) => setPassword(e.target.value)}/>
              </div>

              <p style={{ cursor: "default" }} className="small mb-4 pb-lg-2" onClick={""}><a className="text-black-50">Forgot password?</a></p>

              <Button onClick={signIn} style={{ width: "50%", height: "50px" }} className='' type='submit' color='secondary' variant="contained" >SignUp</Button>
          
            <div className="mt-4">
           
              <p style={{ cursor: "default" }} className="mb-0">Already have an account? <a onClick={login} className="text-black-50 fw-bold">Login</a>
              </p>
            </div>

          </div>
        </div>

        </div>
  );
};