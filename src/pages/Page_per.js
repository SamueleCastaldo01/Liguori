import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";

function Page_per({ getColId }) {

    let navigate = useNavigate();

//*************************************************************** */
//************************************************************** */
//          INTERFACE                                             /
//************************************************************** */
    return ( 
    <> <div className='wrapper'>
            <h2>Accesso Negato</h2>

            <button className='mt-5' onClick={()=> {navigate("/login")}}>Login</button>
           </div>
           </>
      )
}
export default Page_per;