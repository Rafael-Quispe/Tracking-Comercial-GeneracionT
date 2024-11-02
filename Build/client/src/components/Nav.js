import styled from "styled-components";
import logo from '../logo.svg';

import { HashLink as Link } from "react-router-hash-link";


const StyledNav = styled.nav`
     display: flex;
    height: 10vh;
    justify-content: space-between;
    background-color: #31302F;
    border-bottom: solid #008CBA 2px;
    align-items: center;
    > :only-child {
        margin-left: auto;
        margin-right: auto;
        align-items: center;
    }

    img {
        height: 100%;
    }
    .font-link {
    font-family:  'Courier New', Courier, monospace;
  }

    ul {
        display: flex;
        width: 30%;
        height: 100%;
        justify-content: space-around;
        align-items: stretch;
        margin: 0%;
        padding: 0%;
        text-decoration: none;
        align-items: center;
    }

    li {
        display: block ;
        height: 100%;
        width: 100%;
        -webkit-transition-duration: 0.4s; /* Safari */
        transition-duration:1s;
        text-decoration: none;
        color: #008CBA;
        align-items: center;
        padding-left: 5%;
        padding-top: 5%;
    }
    a{
        text-decoration: none;
        color:white;
    }
    li :hover{
        text-decoration: none;
        font-size: 20px;
      
    
    }
     
`;

export default function Nav({user}) {
    function removeFromStore(e) {
        localStorage.removeItem("user");
    }

    return (
        <StyledNav>
            {user === null ? null : 
            <ul>
                {user.area !== "Tecnica" ? null :
                <li className="font-link"><Link to="/proyecto">Proyecto</Link></li>}

                {user.area !== "Desarrollo" ? null :
                <li className="font-link"><Link to="/desarrollo">Desarrollo</Link></li>}

                {user.area !== "Comercial" ? null :
                <li className="font-link"><Link to="/propuestas">Propuestas</Link></li>}

                {user.area !== "RRHH" ? null :
                <li className="font-link"><Link to="/empleados">Empleados</Link></li>}

                <li className="font-link" ><Link to="/vacaciones">Vacaciones</Link></li>
                <li className="font-link"><Link to={{pathname: `/empleados/${user.FK_dniEmpleado}`}}>Cuenta</Link></li>
                <li className="font-link">
                    <Link to="/" onClick={removeFromStore}>Cerrar sesion</Link>
                </li>
            </ul>}
            <img src={logo} alt='Logo' />
        </StyledNav>
    );
}