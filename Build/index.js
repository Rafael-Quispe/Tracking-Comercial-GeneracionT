import "dotenv/config"
import db from './src/database.js';
import cors from "cors";
import fs from "fs";
import express from "express";
import basicAuth from "express-basic-auth";

const app = express();

const PORT= process.env.PORT ?? 4000;

if (!fs.existsSync("./propuestas")) {
    fs.mkdirSync("./propuestas");
}

//Routes
app.use(cors());
app.use(express.json());
app.use('/api/*', basicAuth({
    challenge: true,
    authorizeAsync: true,
    authorizer: async (username, password, cb) => {
        const result = (await db.execute("SELECT clave FROM Usuario WHERE Usuario.PK_nombreUsuario LIKE ?", [username]))[0];
        console.log(result);
        if (result.length === 0) 
            return cb(null, false);
        
        if (result[0].clave !== password) 
            return cb(null, false);
        console.log("paso");
        return cb(null, true);  
    }
}), async (req, res, next) => {
    req.employee = (await db.execute("SELECT * FROM Empleado INNER JOIN Persona ON Empleado.FK_dniEmpleado LIKE Persona.PK_dni WHERE Empleado.FK_usuarioAsociado LIKE ?;", [req.auth.user]))[0][0];
    next();
});

app.post("/api/login", async (req, res) => {
    res.status(200).json(req.employee);
});

import propuestasRouter from "./src/routes/propuestas.js";
app.use('/api/propuestas', propuestasRouter);

import clientesRouter from "./src/routes/clientes.js";
app.use(`/api/clientes`, clientesRouter);

import proyectosRouter from "./src/routes/proyectos.js";
app.use(`/api/proyectos`, proyectosRouter);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
