import styled from "styled-components";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Nav from "./Nav";

const Centrar = styled.div`
    display: flex;
    min-height: 90vh;
    justify-content: center;
    align-items: center;
    overflow: auto;
    background-color: #31302F;
`;

const Div = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    color: white;

    div.choice {
        display: flex;
        justify-content: space-between;

    }

    button {
        height: 3em;
    }
`;
export default function Vacation(props) {
    const {user} = props;
    const {state} = useLocation();
    const navigate = useNavigate();
    const [vacation] = useState(props.vacation ?? state?.vacation);

    useEffect(() => {
        if (!user || !vacation)
            return navigate("/");
    });

    function handleClick(estado) {
        const patchVacation = new XMLHttpRequest();
        patchVacation.open("PATCH", `https://backend-gen-t-gqwp-dev.fl0.io/api/empleados/${vacation.FK_empleado}/vacaciones/${vacation.PK_idPeticion}`);
        patchVacation.setRequestHeader("Authorization", `Basic ${user.token}`);
        patchVacation.setRequestHeader('Content-Type', 'application/json');
        patchVacation.onload = () => {
            if (patchVacation.status >= 200 && patchVacation.status < 300) {
                console.log("subido");
                navigate("/empleados");
            } else {
                alert("Ha ocurrido un error");
            }
            console.log(`PATCH /api/empleados/${vacation.FK_empleado}/vacaciones/${vacation.PK_idPeticion} status: ${patchVacation.status}`)
        };
        patchVacation.send(JSON.stringify({state: estado}));
    }

    return (
        <>
        <Nav user={user} />
        <Centrar>
            <Div>
            <div className="data">
                <p>Nombre: {vacation?.nombre}</p>
                <p>Desde: {new Date(vacation?.fechaInicio).toLocaleDateString()}</p>
                <p>Hasta: {new Date(vacation?.fechaFin).toLocaleDateString()}</p>
                <p>Estado: {vacation?.estado}</p>
            </div>
            {vacation?.estado === "En observacion" && user?.area === "RRHH" &&
            <div className="choice">
                <button onClick={() => handleClick("Aprobado")}>Aceptar</button>
                <button onClick={() => handleClick("Rechazado")}>Rechazar</button>
            </div>}
            </Div>
        </Centrar>
        </>
    );
}