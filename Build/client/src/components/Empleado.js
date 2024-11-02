import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import TarjetaTarea from "./TarjetaTarea";
import Nav from "./Nav";
import VacationCard from "./VacationCard";

const Centrar = styled.div`
    display: flex;
    min-height: 90vh;
    justify-content: center;
    align-items: center;
    overflow: auto;
    background-color:#31302F ;
`;

const Div = styled.div`
    .font-link {
        font-family:  'Courier New', Courier, monospace;
        color:white;
    }
    .disposicion{
        background-color: #3b3a39;
        border: solid #008CBA 2px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-left: 10px;
        padding-right: 10px;
        border-top: none;
    }
    .tareasDisposicion{
        background-color: #3b3a39;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;
        color:white;
        padding-left: 10px;
        padding-right: 10px;
    }
`;

export default function Empleado(props) {
    const navigate = useNavigate();
    const { setUser } = props;
    const user = props.user ?? JSON.parse(localStorage.getItem('user'));
    const { state } = useLocation();
    const [empleado, setEmpleado] = useState(props.empleado ?? state?.empleado);
    const [tareas, setTareas] = useState(props.tareas ?? state?.tareas);
    const [vacaciones, setVacaciones] = useState(props.vacaciones ?? state?.vacaciones);

    const { idEmpleado } = useParams();

    useEffect(() => {
        if (user === null)
            return navigate("/");

        if (!props.user)
            return setUser(user);

        if (empleado !== undefined)
            return;
        (async () => {

            const employeeRequest = await fetch(`https://backend-gen-t-gqwp-dev.fl0.io/api/empleados/${idEmpleado}`, { headers: { Authorization: `Basic ${user.token}` }, method: "GET" });
            if (employeeRequest.ok) {
                const data = await employeeRequest.json();
                console.log(data);
                if (data) {
                    const fetchvacation = await fetch(`https://backend-gen-t-gqwp-dev.fl0.io/api/vacaciones`, { headers: { Authorization: `Basic ${user.token}` }, method: "GET" });
                    console.log(fetchvacation.response);
                    setEmpleado(data);
                    if (data.FK_dniEmpleado !== user.FK_dniEmpleado && !["Tecnica", "RRHH"].includes(user.area)) 
                        return;
                    setVacaciones((await fetchvacation.json())?.filter(vacacion => vacacion.FK_empleado === data.FK_dniEmpleado));
                }
            } else {
                console.log(employeeRequest.response);
                console.log(`Error peticion empleado status: ${employeeRequest.status}`);
                navigate("/");
            }
        })();
    });

    return (
        <>
            <Nav user={props.user}></Nav>
            <Centrar>
                <Div>
                    <div className="disposicion">
                        <h2 className="font-link">Nombre del empleado: {empleado?.apellido} {empleado?.nombre ?? "cargando"}</h2>
                        <p className="font-link">Telefono: {empleado?.telefono}</p>
                        <p className="font-link">Direccion: {empleado?.direccion}</p>
                        <p className="font-link">Email: {empleado?.email}</p>
                        <p className="font-link">Fecha de nacimiento: {new Date(empleado?.fechaNacimiento).toLocaleDateString()}</p>
                        <p className="font-link">Area: {empleado?.area}</p>
                    </div>
                    {user?.area === "Tecnica" &&
                        <div className="tareasDisposicion">
                            <h1>Historial de tareas</h1>
                            {tareas
                                ?.filter(tarea => tarea.FK_empleadoAsignado === empleado.FK_dniEmpleado)
                                .map(tarea => <TarjetaTarea tarea={tarea} />)}
                            {vacaciones?.map(vacacion => <VacationCard vacation={vacacion} />)}
                        </div>}
                    
                    <div className="tareasDisposicion">
                        <h1>Historial de vacaciones</h1>
                        {vacaciones?.map(vacacion => <VacationCard vacation={vacacion} />)}
                    </div>
                </Div>
            </Centrar>
        </>
    );
}