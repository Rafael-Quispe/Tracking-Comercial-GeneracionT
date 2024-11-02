import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "./Nav";
import styled from "styled-components";

const Centrar = styled.div`
    display: flex;
    min-height: 90vh;
    justify-content: center;
    align-items: center;
    overflow: auto;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;

    textarea {
        min-width: 50vw;
        max-height: 30vh;
        min-height: 30vh;
    }
`;


export default function CargaPropuesta(props) {
    const {setUser} = props;
    const user = props.user ?? JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const [clientes, setClientes] = useState(null);
    const [empleados, setEmpleados] = useState(null);
    useEffect(() => {
        if (user === null || user.area !== "Comercial")
            return navigate("/");

        if (!props.user) 
            return setUser(user);
        if (clientes !== null || empleados !== null) 
            return;

        const clientsRequest = new XMLHttpRequest();
        clientsRequest.open("GET", "https://backend-gen-t-gqwp-dev.fl0.io/api/clientes");
        clientsRequest.setRequestHeader("Authorization", `Basic ${user.token}`);
        clientsRequest.onload = () => {
            if (clientsRequest.status >= 200 && clientsRequest.status < 300) {
                console.log("GET /clientes success");
                setClientes(JSON.parse(clientsRequest.response));
            } else {
                console.log(`fallo, status ${clientsRequest.status}`);
                console.log(clientsRequest.response);
            }
        };
        clientsRequest.send();

        const employeesRequest = new XMLHttpRequest();
        employeesRequest.open("GET", "https://backend-gen-t-gqwp-dev.fl0.io/api/empleados?onProject=false");
        employeesRequest.setRequestHeader("Authorization", `Basic ${user.token}`);
        employeesRequest.onload = () => {
            if (employeesRequest.status >= 200 && employeesRequest.status < 300) {
                console.log("GET /empleados success");
                setEmpleados(JSON.parse(employeesRequest.response).filter(empleado => empleado.area === "Tecnica"));
            } else {
                console.log(`fallo, status ${employeesRequest.status}`);
                console.log(employeesRequest.response);
            }
        };
        employeesRequest.send();
    });

    function handleSubmit(event) {
        event.preventDefault();
        const {name, description, deadline, budget, client, technician, dni, contactName, contactSurname, phone, address, email, birthdate} = Object.fromEntries(new FormData(event.target));
        const clientContact = {dni, contactName, contactSurname, phone, address, email, birthdate};
        const payload = {
            name, description, deadline, budget, client, technician, clientContact
        };
        const proposalRequest = new XMLHttpRequest();
        proposalRequest.open("POST", "https://backend-gen-t-gqwp-dev.fl0.io/api/propuestas");
        proposalRequest.setRequestHeader("Authorization", `Basic ${user.token}`);
        proposalRequest.setRequestHeader('Content-Type', 'application/json');
        proposalRequest.onload = () => {
            if (proposalRequest.status >= 200 && proposalRequest.status < 300) {
                console.log("subido");
                navigate("/propuestas")
            } else {
                console.log(`fallo, status ${proposalRequest.status}`);
                console.log(proposalRequest.response);
                alert("Se ha producido un error");
            }
        }
        proposalRequest.send(JSON.stringify(payload));
    }
    return (
        <>
        <Nav user={user} />
        <Centrar>
            
        <Form onSubmit={handleSubmit}>
            <h1>Datos de la propuesta</h1>
            <label htmlFor="name">Nombre</label>
            <input required type="text" id="name" name="name" />
            <label htmlFor="deadline">Fecha de entrega maxima</label>
            <input required type="date" name="deadline" id="deadline" min={new Date().toISOString().split("T")[0]} />
            <label htmlFor="budget">Presupuesto maximo</label>
            <input required type="number" id="budget" name="budget" />
            <label htmlFor="client">Cliente</label>
            <select name="client" id="client">
                {clientes?.map(cliente => 
                <option value={cliente.nombreEmpresa}>
                    {cliente.nombreEmpresa}
                </option>)}
            </select>
            <label htmlFor="technician">Empleado tecnico</label>
            <select name="technician" id="technician">
                {empleados?.map(empleado => <option value={empleado.FK_dniEmpleado}>{empleado.nombre}</option> )}
            </select>
            <label htmlFor="description">Descripcion</label>
            <textarea required  rows="4" cols="50" type="text" id="description" name="description" />
            <h1>Datos del contacto del cliente: </h1>
            <label htmlFor="dni">DNI de contacto</label>
            <input required pattern="^[0-9]*$" type="text" id="dni" name="dni" />
            <label htmlFor="contactName">Nombre del contacto</label>
            <input required type="text" id="contactName" name="contactName" />
            <label htmlFor="contactSurname">Apellido del contacto</label>
            <input required type="text" id="contactSurname" name="contactSurname" />
            <label htmlFor="phone">Telefono</label>
            <input required pattern="^[0-9]*$" type="text" id="phone" name="phone" />
            <label htmlFor="address">Direccion</label>
            <input required type="text" id="address" name="address" />
            <label htmlFor="email">Correo</label>
            <input required type="email" id="email" name="email" />
            <label htmlFor="birthdate">Fecha de nacimiento</label>
            <input required type="date" max={new Date((new Date().getTime() - 24*60*60*1000)).toISOString().split("T")[0]} id="birthdate" name="birthdate" />
            <button type="submit">Subir propuesta</button>
        </Form>
        </Centrar>
        </>
    );
}