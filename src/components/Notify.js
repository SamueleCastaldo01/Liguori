import { toast, Slide } from 'react-toastify';

export function notifyError () {
    toast.error('Inserisci una data', {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "dark",
        className: "rounded-4"
        });
}

export function notifyErrorCliEm () {
    toast.error('Inserisci il nome del cliente', {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "dark",
        className: "rounded-4"
        });
}
//________________________________________________________________________
export function notifyErrorProd () {
    toast.error('Inserisci il nome del prodotto', {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "dark",
        className: "rounded-4"
        });
}
//________________________________________________________________________
export function notifyErrorNumCartoni () {
    toast.error('Aggiungi il numero di cartoni', {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "dark",
        className: "rounded-4"
        });
}
//________________________________________________________________________
export function notifyErrorNumNegativo () {
    toast.error('Inserisci un numero positivo', {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "dark",
        className: "rounded-4"
        });
}
//________________________________________________________________________
export function notifyErrorPrezzoUni () {
    toast.error('Inserisci il prezzo unitario', {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "dark",
        className: "rounded-4"
        });
}
//________________________________________________________________________
export function notifyErrorPrezzoProd () {
    toast.error('Inserisci il prezzo', {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "dark",
        className: "rounded-4"
        });
}
//________________________________________________________________________
export function notifyErrorDat () {
    toast.error('Questa data già è stata inserita', {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "dark",
        className: "rounded-4"
        });
}
//________________________________________________________________________
export function notifyErrorCliList () {
    toast.error('Questo cliente è già stato inserito', {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "dark",
        className: "rounded-4"
        });
}
//________________________________________________________________________
export function notifyErrorProdList () {
    toast.error('Questo prodotto è già stato inserito', {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "dark",
        className: "rounded-4"
        });
}
//________________________________________________________________________
export function notifyErrorCli () {
    toast.error('Questo cliente già è stato inserito', {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "dark",
        className: "rounded-4"
        });
}
//________________________________________________________________________
export function notiUploadImage () {
    toast.success("Image uploaded successfully", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Slide,
        progress: undefined,
        theme: "dark",
        className: "rounded-4"
        });
}
//________________________________________________________________________
export function notiUpdateScalet () {
    toast.success("Aggiornato con successo", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Slide,
        progress: undefined,
        theme: "dark",
        className: "rounded-4"
        });
}
//_____________________________________________________________________________________
export function notifyUpdateCli () {
    toast.success("Cliente aggiornato", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Slide,
        progress: undefined,
        theme: "dark",
        className: "rounded-4"
        });
}
//_____________________________________________________________________________________
export function notifyUpdateProd () {
    toast.success("Prodotto aggiornato", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Slide,
        progress: undefined,
        theme: "dark",
        className: "rounded-4"
        });
}
//_____________________________________________________________________________________
export function notifyUpdateDebRes () {
    toast.success("Debito Residuo aggiornato", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Slide,
        progress: undefined,
        theme: "dark",
        className: "rounded-4"
        });
}
//_____________________________________________________________________________________
export function notifyUpdateNota () {
    toast.success("Nota Aggiornata", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Slide,
        progress: undefined,
        theme: "dark",
        className: "rounded-4"
        });
}
//_____________________________________________________________________________________
export function notifyErrorImage () {
    toast.error("Please insert and upload the image", {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "dark",
        className: "rounded-4"
        });
}
//_____________________________________________________________________________________
export function notifyErrorArt () {
        toast.error('Please enter all fields, or negative values ​​are not accepted', {
          position: "top-center",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          transition: Slide,
          theme: "dark",
          className: "rounded-4"
          });
}
//_____________________________________________________________________________________
export function errorRegi() {
    toast.error("Account already registered or weak password", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "dark",
        })
}
//_____________________________________________________________________________________
export function errorLogin() {
    toast.error("Wrong email or password", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "dark",
        })
}
//_____________________________________________________________________________________
export function errorRecover() {
    toast.error("Email not found", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "dark",
        })
}
//_____________________________________________________________________________________
export function successRecover () {
    toast.success("Check your inbox, even spam", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Slide,
        progress: undefined,
        theme: "dark",
        className: "rounded-4"
        });
}