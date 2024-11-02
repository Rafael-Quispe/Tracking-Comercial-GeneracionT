import {useState} from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from './routes/Login';
import Empleado from './components/Empleado';
import EmpleadoComercial from './routes/EmpleadoComercial';
import Propuesta from './components/Propuesta';
import CargaPropuesta from './components/CargaPropuesta';
import CargarCliente from './components/CargarCliente';
import CargarProyecto from './components/CargarProyecto';
import ComprarModulo from './components/ComprarModulo';
export default function MyRouter(props) {
    const [user, setUser] = useState(null);
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/'>
                    <Route index element={<Login user={user} setUser={setUser} />} />
                    <Route path='proyecto'>
                        <Route index element={<ComprarModulo modulo="Matriz de Responsabilidad" user={user} setUser={setUser} />} />
                        {/*  */}
                        <Route path='agregarEmpleado' element={<ComprarModulo modulo="Recursos Humanos" user={user} setUser={setUser} />} /> 
                        <Route path='nuevo' element={<CargarProyecto user={user} setUser={setUser} />} />
                    </Route>
                    <Route path='desarrollo'>
                        {/*  */}
                        <Route index element={<ComprarModulo modulo="Matriz de Responsabilidad" user={user} setUser={setUser} />} />
                    </Route>
                    <Route path='propuestas'>
                        <Route index element={<EmpleadoComercial user={user} setUser={setUser} />} />
                        <Route path=":idPropuesta" element={<Propuesta user={user} setUser={setUser} />} />
                        <Route path="nueva" element={<CargaPropuesta user={user} setUser={setUser} />} />
                    </Route>
                    <Route path='empleados'>
                        <Route index element={<ComprarModulo modulo="Recursos Humanos" user={user} setUser={setUser} />} />
                        <Route path='nuevo' element={<ComprarModulo modulo="Recursos Humanos" user={user} setUser={setUser} />} />
                        <Route path=":idEmpleado" element={<Empleado user={user} setUser={setUser} />} />
                    </Route>
                    <Route path="tareas">
                        <Route path='nueva' element={<ComprarModulo modulo="Matiz de Responsabilidad" user={user} setUser={setUser} />} />
                        <Route path=":idTarea" element={<ComprarModulo modulo="Matriz de Responsabilidad" user={user} setUser={setUser} />} />
                    </Route>
                    <Route path="vacaciones">
                        <Route index element={<ComprarModulo modulo="Recursos Humanos" user={user} setUser={setUser} />} />
                        <Route path=":idVacacion" element={<ComprarModulo modulo="Recursos Humanos" user={user} setUser={setUser} />} />
                    </Route>
                    <Route path="desvios">            
                        {/*  */}
                        <Route index element={<ComprarModulo modulo="Matriz de Responsabilidad" user={user} setUser={setUser} />} />
                        <Route path="nuevo" element={<ComprarModulo modulo="Matriz de Responsabilidad" user={user} setUser={setUser} />} />
                        {/*  */}
                        <Route path=":idDesvio" element={<ComprarModulo modulo="Matriz de Responsabilidad" user={user} setUser={setUser} />} />
                    </Route>
                    <Route path='clientes'>
                        <Route path='nuevo' element={<CargarCliente user={user} setUser={setUser} />} />
                    </Route>
                </Route>
                <Route path='/*' element={<p>Esta pagina no existe</p>} />
            </Routes>
        </BrowserRouter>
    );
}