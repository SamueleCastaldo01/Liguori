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
            <h2>Non hai il permesso di accesso</h2>

            <button className='mt-5' onClick={()=> {navigate("/login")}}>Login</button>
           </div>
           </>
      )
}
export default Page_per;