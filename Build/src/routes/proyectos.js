import { Router } from "express";

import proyectos from "../controllers/proyectos.js";

const router = Router();

/**
 * multipart/form-data
 * name: string, 
 * type: ENUM("Proyecto", "Mantenimiento"), 
 * deadline: iso date string, 
 * startDate: iso date string, 
 * availableHours: int, 
 * availableEmployees: int, 
 * budget: float,
 * associatedProposal: int MUST appear before file
 * roadmap: file .pdf
 */
router.post("/", proyectos.post);


export default router;
