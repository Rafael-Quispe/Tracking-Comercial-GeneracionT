import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Nav from "../components/Nav";
import { Link } from "react-router-dom";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #f7f7f7;
  padding: 70px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

  button {
    margin: 10px 0;
    padding: 10px 40px;
    background-color: #007bff;
    color: #fff;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: #0056b3;
  }
`;

const ProposalContainer = styled.div`
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 400px;

  p {
    margin: 0;
    font-size: 18px;
  }

  button {
    background-color: #007bff;
    color: #fff;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 14px;
    border-radius: 5px;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: #0056b3;
  }
`;

export default function EmpleadoComercial(props) {
  const {setUser} = props;
  const user = props.user ?? JSON.parse(localStorage.getItem('user'));
  const [propuestas, setPropuestas] = useState(null);
  const [verHistorialCompleto, setVerHistorialCompleto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) {
      return navigate("/");
    }
    
    if (user.area !== "Comercial") 
        return navigate("/");

    if (!props.user) 
      setUser(user);


    const fetchData = async () => {
      try {
        const response = await fetch("https://backend-gen-t-gqwp-dev.fl0.io/api/propuestas", {
          headers: {
            Authorization: `Basic ${user.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPropuestas(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const togglePropuestas = () => {
    setVerHistorialCompleto(!verHistorialCompleto);
  };

  return (<>  <Nav user={props.user} />
    <Container>
      <ContentContainer>
        <Link to="/clientes/nuevo">
          <button>Cargar nuevo cliente</button>
        </Link>
        <button onClick={togglePropuestas}>
          {verHistorialCompleto ? "Ocultar historial" : "Mostrar todas las propuestas"}
        </button>
        <>
          <button onClick={() => navigate("/propuestas/nueva")}>
            Cargar nueva propuesta
          </button>
          {propuestas ? (
            propuestas.filter(propuesta => propuesta.estado !== "Aprobado" || verHistorialCompleto).map((propuesta) => (
              <ProposalContainer key={propuesta.PK_idPropuesta}>
                <p>{propuesta.nombrePropuesta}</p>
                <button
                  onClick={() =>
                    navigate(`/propuestas/${propuesta.PK_idPropuesta}`, {
                      state: { propuesta: propuesta },
                    })
                  }
                >
                  Ver detalle
                </button>
              </ProposalContainer>
            ))
          ) : (
            <p>No hay propuestas</p>
          )}
        </>
      </ContentContainer>
    </Container></>
  );
}
