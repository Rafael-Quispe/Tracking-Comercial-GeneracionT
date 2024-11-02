import styled from "styled-components";
import Vacation from "./Vacation";
import { useNavigate } from "react-router-dom";


const Div = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;

    > div {
        flex-grow: 1;
    }

    div.choice {
        display: flex;
        justify-content: flex-end;
    }

`;



export default function VacationCard({vacation}) {


    const navigate = useNavigate();

    return (
        <Div>
            <p>Nombre: {vacation.nombre}</p>
            <p>DNI: {vacation.FK_empleado}</p>
            <div>
                <p>Desde: {new Date(vacation.fechaInicio).toLocaleDateString()}</p>
                <p>Hasta: {new Date(vacation.fechaFin).toLocaleDateString()}</p>
            </div>
            <button onClick={() =>navigate (`/vacaciones/${vacation.PK_idPeticion}`, {state: {vacation: vacation}})}>Ver mas</button>
        </Div>
    );
}