import { useEffect } from "react";
import Nav from "./Nav";
import { useNavigate } from "react-router-dom";
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

`;

export default function CargarCliente(props) {
    const {setUser} = props;
    const user = props.user ?? JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    useEffect(() => {
        if (user === null || user.area !== "Comercial")
            return navigate("/");

        if (!props.user) 
            setUser(user);
    });

    function handleSubmit(event) {
        event.preventDefault();
        const {companyName, companyAddress, description, dni, name, surname, phone, address, email, birthdate} = Object.fromEntries(new FormData(event.target));
        const contact = {dni, name, surname, phone, address, email, birthdate};
        const payload = {companyName, companyAddress, description, contact};
        const clientRequest = new XMLHttpRequest();
        clientRequest.open("POST", "https://backend-gen-t-gqwp-dev.fl0.io/api/clientes");
        clientRequest.setRequestHeader("Authorization", `Basic ${user.token}`);
        clientRequest.setRequestHeader('Content-Type', 'application/json');
        clientRequest.onload = () => {
            if (clientRequest.status >= 200 && clientRequest.status < 300) {
                console.log("subido");
                navigate(0);
            } else {
                console.log(`fallo, status ${clientRequest.status}`);
                console.log(clientRequest.response);
                alert("Ha ocurrido un error");
            }
        };
        clientRequest.send(JSON.stringify(payload));
    }   
    return (
        <>
        <Nav user={user} />
        <Centrar>

        <Form onSubmit={handleSubmit}>
            <h1>Datos de la empresa</h1>
            <label htmlFor="companyName">Nombre de la empresa</label>
            <input required type="text" id="companyName" name="companyName" />
            <label htmlFor="companyAddress">Direccion de la sucursal</label>
            <input required type="text" id="companyAddress" name="companyAddress" />
            <label htmlFor="description">Descripcion</label>
            <input required type="text" id="description" name="description" />
            <h1>Datos del referente del cliente: </h1>
            <label htmlFor="dni">DNI de contacto</label>
            <input required pattern="^[0-9]*$" type="text" id="dni" name="dni" />
            <label htmlFor="name">Nombre del contacto</label>
            <input required type="text" id="name" name="name" />
            <label htmlFor="surname">Apellido del contacto</label>
            <input required type="text" id="surname" name="surname" />
            <label htmlFor="phone">Telefono</label>
            <input required pattern="^[0-9]*$" type="text" id="phone" name="phone" />
            <label htmlFor="address">Direccion</label>
            <input required type="text" id="address" name="address" />
            <label htmlFor="email">Correo</label>
            <input required type="email" id="email" name="email" />
            <label htmlFor="birthdate">Fecha de nacimiento</label>
            <input required type="date" id="birthdate" max={new Date((new Date().getTime() - 24*60*60*1000)).toISOString().split("T")[0]} name="birthdate" />
            <button type="submit">Subir cliente</button>
        </Form>
        </Centrar>
        </>
    );
}