import styled from 'styled-components';
import Nav from '../components/Nav';
import background from '../background.jpg';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Main = styled.main`
    display: flex;
    justify-content: space-around;

    form {
        display: flex;
        flex-flow: column nowrap;
        justify-content: space-between;
        align-items: stretch;
        width: 30vw;
        height: 50vh;
        background-color: lightblue;
        border: solid gray 3px;
    }

    div {
        flex-grow: 1;
    }

    input {
        display: block;
        width: 80%;
        height: 20%;
    }

    label {
        display: block;
        font-size: 1.5em;
    }


`;

const Centrar = styled.div`
    display: flex;
    min-height: 90vh;
    justify-content: center;
    align-items: center;
    overflow: auto;
    background-image: url(${background});
`;

const Div =styled.div`
padding: 15px;
margin: 15px;
border: 5px solid white;
border-radius: 15px;
width: 30%;
min-width: 250px;
.login-form {
    margin-left: auto;
    color: white;
    margin-right: auto;
    align-items: center;
    display: flex;
    flex-direction: column;
}

.login-form h2 {
    user-select: none;
    font-size: 2em;
    text-align: center;
}

.input-box{
    margin-top: 30px;
}

.input-box input {
    height: 2em;
    width: 15em;
    border-radius: 5px;
}

.login-form label {
    user-select: none;
}

.forgot-password {
    margin-top: 10px;
    color: white;
}

#remember-checkbox {
    user-select: none;
    margin-top: 1.5em;
    font-size: 2em;
}

.login-btn {
    width: 150px;
    height: 50px;
    margin-top: 15px;
    align-self: center;
    background: transparent;
    border: 2px solid white;
    border-radius: 10px;
    color: white;
    font-size: 1.5em;
    cursor:pointer;
}

.register-btn {
    text-decoration: none;
    position: relative;
    margin-top: 1.5em;
    color: white;
    font-size: 1.5em;
    font-weight: 500;
}

 .register-btn::after {
    content: '';
    position: absolute;
    left: 0;
    height: 3px;
    background: white;
    width: 100%;
    bottom: -10px;
    border-radius: 5px;
    transform: scaleX(0);
    transition: .3s;
}

.register-btn:hover::after {
    transform: scaleX(1);
}
`;

function Login({user, setUser}) {
    const navigate = useNavigate();
    useEffect(() => setUser(null));
    async function handleLogin(event) {
        event.preventDefault();
        const form = new FormData(event.target);
        const token = btoa(`${form.get("username")}:${form.get("password")}`);
        const loginRequest = new XMLHttpRequest();
        loginRequest.open("POST", "https://backend-gen-t-gqwp-dev.fl0.io/api/login");
        loginRequest.setRequestHeader("Authorization", `Basic ${token}`);
        loginRequest.onload = () => {
            if (loginRequest.status === 401) {
                alert("Usuario o contraseña incorrecta");
            } else if (loginRequest.status >= 200 && loginRequest.status < 300) {
                const data = JSON.parse(loginRequest.response);
                const route = ({
                    RRHH: "/empleados",
                    Comercial: "/propuestas",
                    Tecnica: "/proyecto",
                    Desarrollo: "/desarrollo"
                })[data.area];
                data.token = token;
                localStorage.setItem('user', JSON.stringify(data));
                setUser(data);
                navigate(route);
            } else {
                alert("Ha habido un error");
            }
        };
        loginRequest.send();
    }

    return (
        <>
        <Nav user={user} />
        <Centrar>
        <Div>
            <form class="login-form" onSubmit={handleLogin}>
                <h2>Login</h2>
                <div class="input-box">
                    <h3>Email</h3>
                    <input type="text" required name="username" />
                </div>
                <div class="input-box">
                    <h3>Password</h3>
                    <input type="password" name='password' required />
                </div>
                <br />
                <button type="submit" onClick={() => console.log("test")} class="login-btn">Log in</button>
            </form>
        </Div>
        </Centrar>
        </>
    );
}
export default Login;
