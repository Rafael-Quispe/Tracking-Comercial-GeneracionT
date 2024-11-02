import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import Nav from "./Nav";

const Div = styled.div`
height: 90vh;
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
}

.container {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
}

.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
}

input[type="text"],
input[type="number"],
input[type="date"] {
    width: 100%;
    padding: 7px;
    border: 1px solid #ccc;
    border-radius: 3px;
}

button {
    background-color: #007bff;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}
`;

export default function CargarProyecto(props) {
    const navigate = useNavigate();
    const {user} = props;
    const {state} = useLocation();
    const [propuesta, setPropuesta] = useState(props.propuesta ?? state?.propuesta);
    useEffect(() => {
        if (user === null || !propuesta) 
            return navigate("/");
    });
    function handleSubmit(event) {
        event.preventDefault();
        const payload = new FormData(event.target);
        const projectRequest = new XMLHttpRequest();
        projectRequest.open("POST", "https://backend-gen-t-gqwp-dev.fl0.io/api/proyectos");
        projectRequest.setRequestHeader("Authorization", `Basic ${user.token}`);
        projectRequest.onload = () => {
            if (projectRequest.status >= 200 && projectRequest.status < 300) {
                console.log("subido");
                navigate("/propuestas");
            } else {
                console.log(`fallo, status ${projectRequest.status}`);
                console.log(projectRequest.response);
                alert("Ha ocurrido un error");
            }
        };
        projectRequest.send(payload);
    }
    return (
        <>
        <Nav user={user} />
        <Div>
            <h1>{propuesta?.nombrePropuesta}</h1>
            <p>{propuesta?.descripcionNecesidadCliente}</p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="associatedProposal">Id propuesta</label>
                    <input type="number" readOnly name="associatedProposal" id="associatedProposal" defaultValue={propuesta?.PK_idPropuesta} />
                </div>
                <div class="form-group">
                    <label htmlFor="name">Nombre del Proyecto:</label>
                    <input type="text" id="name" name="name" required />
                </div>
                <div className="form-group">
                    <label htmlFor="type">Tipo</label>
                    <select name="type" id="type">
                        <option value="Proyecto">Proyecto</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                    </select>
                </div>
                <div class="form-group">
                    <label htmlFor="budget">Presupuesto:</label>
                    <input type="number" id="budget" name="budget" max={propuesta?.restriccionEconomica} required />
                </div>
                <div class="form-group">
                    <label htmlFor="availableHours">Horas Disponibles:</label>
                    <input type="number" id="availableHours" name="availableHours" required />
                </div>
                <div class="form-group">
                    <label htmlFor="startDate">Fecha de Inicio:</label>
                    <input type="date" id="startDate" name="startDate" min={new Date().toISOString().split("T")[0]} required />
                </div>
                <div className="form-group">
                    <label htmlFor="availableEmployees">Empleados del proyecto</label>
                    <input type="number" id="availableEmployees" name="availableEmployees" />
                </div>
                <div class="form-group">
                    <label htmlFor="deadline">Fecha de Entrega:</label>
                    <input type="date" id="deadline" name="deadline" min={new Date().toISOString().split("T")[0]}  max={new Date(propuesta?.restriccionTemporal).toISOString().split("T")[0]} required />
                </div>
                <div className="form-group">
                    <label htmlFor="roadmap">Propuesta de trabajo</label>
                    <input type="file" name="roadmap" id="roadmap" accept=".pdf" />
                </div>
                <button type="submit">Subir</button>
            </form>
        </Div>
        </>
    );
}