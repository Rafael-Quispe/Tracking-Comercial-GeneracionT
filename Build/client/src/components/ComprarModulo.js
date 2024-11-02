import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "./Nav";
import styled from "styled-components";

const Centrar = styled.div`
    display: flex;
    min-height: 90vh;
    justify-content: center;
    align-items: center;
    overflow: auto;
    background-color:#31302F ;
    color: white;
`;

export default function ComprarModulo(props) {
    const navigate = useNavigate() ;
    useEffect(() => {
        if (!props.user) {
            return navigate("/");
        }
    });
    return (
        <>
        <Nav user={props.user} />
        <Centrar>
            <p>Debe comprar el modulo {props.modulo} para acceder a esta funcionalidad. Para mas informacion escribanos a nanap71507@bnovel.com</p>
        </Centrar>
        </>
    );
}