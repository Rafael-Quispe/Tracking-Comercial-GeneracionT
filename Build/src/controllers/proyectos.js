import multer from "multer";
import fs from "fs/promises";
import db from "../database.js";

export default {post};

const upload = multer({storage: multer.diskStorage({
    destination: async function(req, file, cb) {
        console.log(req.body);
        if (req.body.associatedProposal === undefined) 
            return cb({message: "missing field associatedProposal", status: 400});
        const [result] = await db.execute("SELECT * FROM Propuesta WHERE Propuesta.PK_idPropuesta = ?", [req.body.associatedProposal])
            .catch(error => cb({message: error, status: 500}), [null]);
        if (result === null)
            return;
        if (result.length === 0) 
            return cb({message: "", status: 404});
        
        const directory = result[0].directorioArchivosPropuesta;
        req.associatedProposal = result[0];
        return cb(null, directory);
    },
    filename: function(req, file, cb) {
        if (file.mimetype !== "application/pdf") 
            return cb({message: "unexpected mime type, expected application/pdf", status: 400});
        
        cb(null, "roadmap.pdf");
    }
})}).single("roadmap");
async function post(req, res) {
    upload(req, res, async error => {
        if (error) {
            const status = error.status ?? 500;
            return res.status(status).send(error);
        } 
        if (req.file === undefined) 
            return res.status(400).send("missing file roadmap");
        const {name, type, deadline, startDate, availableHours, availableEmployees, budget} = req.body;
        const project = {name, type, startDate, deadline, availableHours, availableEmployees, budget};
        for (const key in project) 
            if (project[key] === undefined)
                return res.status(400).send(`missing field ${key}`);
        
        await db.beginTransaction();
        try {
            if (req.associatedProposal.estado !== "Aprobado") 
                await db.execute("UPDATE Propuesta SET estado = 'Aprobado' WHERE PK_idPropuesta = ?", [req.associatedProposal.PK_idPropuesta]);
            await db.execute("INSERT INTO Proyecto(nombre, tipo, fechaInicio, fechaEntregaIdeal, horasDisponibles, empleadosDisponibles, presupuesto, FK_responsableComercial, FK_responsableDeGestion, FK_propuestaAsociada, rutaPlanDeTrabajo) VALUES (?,?,?,?,?,?,?,?,?,?,?)", [...Object.values(project), req.associatedProposal.FK_empleadoComercialAsociado, req.associatedProposal.FK_empleadoTecnicoAsociado, req.body.associatedProposal, req.file.path]);
            const projectId = (await db.execute("SELECT LAST_INSERT_ID()"))[0][0]["LAST_INSERT_ID()"];
            await db.execute("UPDATE Empleado SET FK_proyectoAsignado = ? WHERE FK_dniEmpleado IN (?, ?)", [projectId, req.associatedProposal.FK_empleadoTecnicoAsociado, req.associatedProposal.FK_empleadoComercialAsociado]);
        } catch (error) {
            await db.rollback();
            await fs.rm(req.file.path, {force: true});
            return res.status(500).send(error);
        }
        await db.commit();
        return res.status(204).send();
    });
}
 

