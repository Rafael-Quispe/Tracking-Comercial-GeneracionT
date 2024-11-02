import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Div = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    height: 15%;
    
    #mas{
        background-color: lightgray;
        color: black;
        font-size: 12px;
        -webkit-transition-duration: 0.4s; 
        transition-duration: 1s;
        border: none
       
    }
    #mas:hover {
    background-color: #008CBA; 
    }
`;
export default function TarjetaTarea({tarea}) {
    const navigate = useNavigate();
    return (
        <Div>
            <h1 className="font-link">{tarea.nombreTarea}</h1>
            <button className="font-link" id="mas"
             onClick={() => navigate(`/tareas/${tarea.PK_idTarea}`, {state: {tarea: tarea}})}>
                Ver mas
            </button>
        </Div>
    );
}