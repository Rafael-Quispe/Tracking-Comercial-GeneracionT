import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import {styled} from "styled-components";
import Nav from "./Nav";
const Centrar = styled.div`
    display: flex;
    min-height: 90vh;
    justify-content: center;
    align-items: center;
    overflow: auto;
`;
const Div = styled.div`
    margin: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    display: inline-flex;
    height: fit-content;
    width: 70%;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 10px;
    border: 1px solid black;

    form#proposal-upload:invalid button[type="submit"] {
        background-color: gray;
        color: black;
        border: none;
        height: 35px;
        border-radius: 50px;
        padding: 5px;
        margin: 0 5px 0 5px;
        display: inline-block;
    }

    form#proposal-upload label[for="technicalProposal"] {
        background-color: #86A6DF;
        color: white;
        border: none;
        height: 35px;
        border-radius: 50px;
        padding: 5px;
        margin: 0 5px 0 5px;
        display: inline-block;
    }

    form#proposal-upload input[type="file"] {
        display: none;
    }
`;
const Button = styled.button`
    background-color: #86A6DF;
    color: white;
    border: none;
    height: 35px;
    border-radius: 50px;
    padding: 5px;
    margin: 0 5px 0 5px;
`;
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;
const Descripcion = styled.div`
    background: white;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column; /* Aplica flexbox en columna */
    overflow: auto; /* Add scrollbars when content overflows */
    max-height: 80vh; /* Set a maximum height for the scrollable content */
    
    p {
        
        max-width: 80vw;
        text-align: justify;
    }
`;
export default function PropuestaCargada(props) {
    const {setUser} = props;
    const user = props.user ?? JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const {idPropuesta} = useParams();
    const [propuesta, setPropuesta] = useState(props.propuesta);

    useEffect(() => {
        if (propuesta) {
            console.log("this ran");
            const temp = {...propuesta};
            temp.restriccionTemporal = new Date(temp.restriccionTemporal).toLocaleDateString(navigator.language);
            setPropuesta(temp);
        }
    }, []);

    const [selectEstado, setSelectEstado] = useState("Observado");
    useEffect(() => {
        if (user === null || !["Comercial", "Tecnica"].includes(user.area)) 
            return navigate("/");
        
        if (!props.user) 
            setUser(user);

        if (propuesta) 
            return;
 
        const proposalRequest = new XMLHttpRequest();
        proposalRequest.open("GET", `https://backend-gen-t-gqwp-dev.fl0.io/api/propuestas/${idPropuesta}`);
        proposalRequest.setRequestHeader("Authorization", `Basic ${user.token}`);
        proposalRequest.onload = () => {
            if (proposalRequest.status >= 200 && proposalRequest.status < 300) {
                const data = JSON.parse(proposalRequest.response);
                if (data) {
                    data.restriccionTemporal = new Date(data.restriccionTemporal).toLocaleDateString(navigator.language);
                    console.log(data);
                    setPropuesta(data);
                }
            } else {
                console.log(proposalRequest.response);
                console.log(`Error peticion empleado status: ${proposalRequest.status}`);
            }
        };
        proposalRequest.send();
    }, []);



    const abrirOverlay = () => {
        setIsOverlayOpen(true);
    };
    const cerrarOverlay = () => {
        setIsOverlayOpen(false);
    };
    function handleSubmitComercial(event) {
        event.preventDefault();
        const updateStateRequest = new XMLHttpRequest();
        const payload = new FormData();
        payload.append("state", selectEstado);
        updateStateRequest.open("PATCH", `https://backend-gen-t-gqwp-dev.fl0.io/api/propuestas/${idPropuesta}`);
        updateStateRequest.setRequestHeader("Authorization", `Basic ${user.token}`);
        updateStateRequest.onload = () => {
            if (updateStateRequest.status >= 200 && updateStateRequest.status < 300) {
                console.log("subido");
                console.log(updateStateRequest.response);
                setPropuesta(null);
                navigate(0);
            } else {
                console.log(`fallo, status ${updateStateRequest.status}`);
                console.log(updateStateRequest.response);
                alert("Ha habido un error");
            }
        };
        updateStateRequest.send(payload);
    }
    function handleEnviar(event) {
        event.preventDefault();
        const markSentRequest = new XMLHttpRequest();
        const payload = new FormData();
        payload.append("progress", "Enviado al cliente");
        markSentRequest.open("PATCH", `https://backend-gen-t-gqwp-dev.fl0.io/api/propuestas/${idPropuesta}`);
        markSentRequest.setRequestHeader("Authorization", `Basic ${user.token}`);
        markSentRequest.onload = () => {
            if (markSentRequest.status >= 200 && markSentRequest.status < 300) {
                console.log("subido");
                console.log(markSentRequest.response);
                setPropuesta(null);
                navigate(0);
            } else {
                console.log(`fallo, status ${markSentRequest.status}`);
                console.log(markSentRequest.response);
                alert("Ha habido un error");
            }
        };
        markSentRequest.send(payload);
    }
    async function downloadProposal() {
        const response = await fetch(`https://backend-gen-t-gqwp-dev.fl0.io/api/propuestas/${idPropuesta}/propuestaTecnica`, {
            headers: {
                Authorization: `Basic ${user.token}`,
                'Content-Type': 'application/pdf'
            }
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(
            new Blob([blob]),
          );
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute(
            'download',
            `FileName.pdf`,
          );
      
          // Append to html link element page
          document.body.appendChild(link);
      
          // Start download
          link.click();
      
          // Clean up and remove the link
          link.parentNode.removeChild(link);
    }
    function handleSubmitTecnica(event) {
        event.preventDefault();
        const payload = new FormData(event.target);
        const uploadFileRequest = new XMLHttpRequest();
        uploadFileRequest.open("PATCH", `https://backend-gen-t-gqwp-dev.fl0.io/api/propuestas/${idPropuesta}`);
        uploadFileRequest.setRequestHeader("Authorization", `Basic ${user.token}`);
        uploadFileRequest.onload = () => {
            if (uploadFileRequest.status >= 200 && uploadFileRequest.status < 300) {
                console.log("subido");
                setPropuesta(null);
                navigate(0);
            } else {
                console.log(`fallo, status ${uploadFileRequest.status}`);
                console.log(uploadFileRequest.response);
                alert("Ha habido un error");
            }
        };
        uploadFileRequest.send(payload);
    }
    return (
        propuesta &&
        <>
        <Nav user={user} />
        <Centrar>
        <Div>
        <h1>{propuesta?.PK_idPropuesta} - {propuesta?.nombrePropuesta}</h1>
        <p>Nombre del Cliente: {propuesta?.FK_empresaCliente}</p>
        <p>Progreso de la propuesta: {propuesta?.progreso}</p>
        {propuesta?.progreso !== "Enviar al cliente" || user.area !== "Comercial" ? null :
        <Button onClick={handleEnviar}>Marcar como enviado</Button>}
        <p>Estado: {propuesta?.estado}</p>
        {["Aprobado", "Rechazado"].includes(propuesta?.estado) ? null :
        propuesta?.progreso === "A estimar" || user.area !== "Comercial" ? null :
        <form id="update-state" onSubmit={handleSubmitComercial}>
            <select required value={selectEstado} onChange={e => setSelectEstado(e.target.value)} name="state" id="state">
                <option value="Rechazado">Rechazado</option>
                {propuesta?.estado === "Observado" ? null :
                <option value="Observado">Observado</option>}
                {propuesta?.estado === "En progreso" ? null :
                <option value="En progreso">En progreso</option>}
            </select>
            <Button type="submit">Actualizar estado</Button>
        </form> }
        {propuesta?.progreso === "Enviado al cliente" && propuesta?.estado === "En progreso" && user.area === "Comercial" ? 
        <Button onClick={() => navigate("/proyecto/nuevo", {state: {propuesta: propuesta}})}>Aprobar</Button> : null}
        <p>Fecha Limite del Cliente: {propuesta?.restriccionTemporal}</p>
        <p>Techo del presupuesto: {propuesta?.restriccionEconomica}</p>
        {propuesta?.rutaPropuestaTecnica === null ?
        <p>Aun no se ha cargado una propuesta tecnica</p> :
        <Button onClick={downloadProposal}>Descargar propuesta tecnica</Button>}
        <div>
            <Button 
              onClick={() => navigate(`/empleados/${propuesta?.FK_empleadoComercialAsociado}`)}>
                Ver responsable de gestion
            </Button>
            <Button 
              onClick={() => navigate(`/empleados/${propuesta?.FK_empleadoTecnicoAsociado}`)}>
                  Ver responsable de proyecto
            </Button>
            <Button onClick={abrirOverlay}>Ver necesidad del cliente</Button>
        </div>
        {user.area !== "Tecnica" ? null :
        propuesta?.progreso !== "A estimar" ? null :
        <form id="proposal-upload" onSubmit={handleSubmitTecnica}>
            <label htmlFor="technicalProposal">Seleccionar propuesta</label>
            <input required type="file" name="technicalProposal" id="technicalProposal" accept=".pdf" />
            <Button type="submit">Subir</Button>
        </form>}
        {isOverlayOpen && (
            <Overlay>
            <Centrar>
                <Descripcion>
                    <h2>Descripcion de la necesidad del cliente:</h2>
                    <p>{propuesta?.descripcionNecesidadCliente}</p>
                    <Button onClick={cerrarOverlay}>Cerrar</Button>
                </Descripcion>
            </Centrar>
            </Overlay>
        )}
        </Div>
        </Centrar>
        </>
    );
}