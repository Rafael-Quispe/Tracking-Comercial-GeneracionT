/* Tabla Propuesta */
DROP PROCEDURE IF EXISTS trigProc_checkEmployeeArea;
DELIMITER $$
CREATE PROCEDURE trigProc_checkEmployeeArea(employeePK VARCHAR(50), requiredArea VARCHAR(100))
COMMENT 'Resiva que el empleado sea del area especificada'
main:BEGIN
    DECLARE employeeArea VARCHAR(100);
    DECLARE errorMessage VARCHAR(200);
    SELECT
        area
    INTO
        employeeArea
    FROM
        Empleado
    WHERE
        Empleado.FK_dniEmpleado LIKE employeePK;
    IF employeeArea NOT LIKE requiredArea THEN
        SET errorMessage = CONCAT("El area del empleado asociado no es '", requiredArea, "' FK_dniEmpleado conflictivo: ", employeePK);
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = errorMessage;
    END IF;
END main$$
DELIMITER ;

DROP TRIGGER IF EXISTS tbi_Propuesta;
DELIMITER $$
CREATE TRIGGER tbi_Propuesta BEFORE INSERT ON Propuesta
FOR EACH ROW
main:BEGIN
    CALL trigProc_checkEmployeeArea(NEW.FK_empleadoComercialAsociado, "Comercial");
    CALL trigProc_checkEmployeeArea(NEW.FK_empleadoTecnicoAsociado, "Tecnica");
END main$$
DELIMITER ;

DROP TRIGGER IF EXISTS tbu_Propuesta;
DELIMITER $$
CREATE TRIGGER tbu_Propuesta BEFORE UPDATE ON Propuesta
FOR EACH ROW
main:BEGIN
    CALL trigProc_checkEmployeeArea(NEW.FK_empleadoComercialAsociado, "Comercial");
    CALL trigProc_checkEmployeeArea(NEW.FK_empleadoTecnicoAsociado, "Tecnica");
END main$$
DELIMITER ;

/* Tabla Proyecto */
DROP PROCEDURE IF EXISTS trigProc_checkApprovedProposal;
DELIMITER $$
CREATE PROCEDURE trigProc_checkApprovedProposal(proposalPK INT)
COMMENT 'Asegura que la propuesta asociada a un proyecto este aprobada'
main:BEGIN
    DECLARE errorMessage VARCHAR(200);
    DECLARE approved BOOLEAN DEFAULT FALSE;
    SELECT
        estado LIKE "Aprobado"
    INTO
        approved
    FROM
        Propuesta
    WHERE
        Propuesta.PK_idPropuesta = proposalPK;
    IF NOT approved THEN
        SET errorMessage = CONCAT("La propuesta no ha sido aprobada. PK_idPropuesta conflictivo: ", proposalPK);
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = errorMessage;
    END IF;
END main$$
DELIMITER ;

DROP TRIGGER IF EXISTS tbi_Proyecto;
DELIMITER $$
CREATE TRIGGER tbi_Proyecto BEFORE INSERT ON Proyecto
FOR EACH ROW
main:BEGIN
    CALL trigProc_checkApprovedProposal(NEW.FK_propuestaAsociada);
END main$$
DELIMITER ;

DROP TRIGGER IF EXISTS tbu_Proyecto;
DELIMITER $$
CREATE TRIGGER tbu_Proyecto BEFORE UPDATE ON Proyecto
FOR EACH ROW
main:BEGIN
    CALL trigProc_checkApprovedProposal(NEW.FK_propuestaAsociada);
END main$$
DELIMITER ;

DROP TRIGGER IF EXISTS tbi_Proyecto_enforceProposalConsistency;
DELIMITER $$ 
CREATE TRIGGER tbi_Proyecto_enforceProposalConsistency BEFORE INSERT ON Proyecto
FOR EACH ROW
main:BEGIN
    DECLARE errorMessage VARCHAR(200);
    DECLARE maximumBudget DECIMAL(30, 2);
    DECLARE idealDeadline DATE;
    SELECT
        restriccionEconomica,
        restriccionTemporal
    INTO
        maximumBudget,
        idealDeadline
    FROM
        Propuesta
    WHERE
        Propuesta.PK_idPropuesta = NEW.FK_propuestaAsociada;

    IF NEW.presupuesto > maximumBudget THEN
        SET errorMessage = CONCAT("El presupuesto del proyecto sobrepasa el acordado en la propuesta. PK_idPropuesta conflictivo: ", NEW.FK_propuestaAsociada);
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = errorMessage;
    ELSEIF NEW.fechaEntregaIdeal > idealDeadline THEN
        SET errorMessage = CONCAT("La fecha de entrega sobrepasa la acordada en la propuesta. PK_idPropuesta conflictivo: ", NEW.FK_propuestaAsociada);
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = errorMessage;
    END IF;
END main$$
DELIMITER ;

DROP TRIGGER IF EXISTS tbu_Proyecto_enforceProposalConsistency;
DELIMITER $$ 
CREATE TRIGGER tbu_Proyecto_enforceProposalConsistency BEFORE UPDATE ON Proyecto
FOR EACH ROW
main:BEGIN
    DECLARE errorMessage VARCHAR(200);
    DECLARE maximumBudget DECIMAL(30, 2);
    DECLARE idealDeadline DATE;
    SELECT
        restriccionEconomica,
        restriccionTemporal
    INTO
        maximumBudget,
        idealDeadline
    FROM
        Propuesta
    WHERE
        Propuesta.PK_idPropuesta = NEW.FK_propuestaAsociada;

    IF NEW.presupuesto > maximumBudget THEN
        SET errorMessage = CONCAT("El presupuesto del proyecto sobrepasa el acordado en la propuesta. PK_idPropuesta conflictivo: ", NEW.FK_propuestaAsociada);
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = errorMessage;
    END IF;
END main$$
DELIMITER ;

/* Tabla Desvio */

DROP PROCEDURE IF EXISTS trigProc_updateProjectData;
DELIMITER $$
CREATE PROCEDURE trigProc_updateProjectData(newDeadline DATE, deltaEmployees INT, deltaHours INT, deltaBudget INT, projectPK INT)
COMMENT 'Actualiza los recursos disponibles de un proyecto de acorde a los que requiera el desvio'
main:BEGIN
    UPDATE 
        Proyecto 
    SET 
        fechaEntregaIdeal = newDeadline, 
        empleadosDisponibles = empleadosDisponibles + deltaEmployees,
        horasDisponibles = horasDisponibles + deltaHours,
        presupuesto = presupuesto + deltaBudget;
END main$$
DELIMITER ;

DROP TRIGGER IF EXISTS tbi_Desvio;
DELIMITER $$
CREATE TRIGGER tbi_Desvio BEFORE INSERT ON Desvio
FOR EACH ROW
main:BEGIN
    CALL trigProc_updateProjectData(NEW.nuevaFechaEntrega, NEW.costeEmpleadosDisponibles, NEW.costeHorasDisponibles, NEW.costePresupuesto, NEW.FK_proyectoAsociado);
END main$$
DELIMITER ;

DROP TRIGGER IF EXISTS tbu_Desvio;
DELIMITER $$
CREATE TRIGGER tbu_Desvio BEFORE UPDATE ON Desvio
FOR EACH ROW
main:BEGIN
    DECLARE previousDate DATE;
    IF NEW.FK_proyectoAsociado = OLD.FK_proyectoAsociado THEN
        CALL trigProc_updateProjectData(NEW.nuevaFechaEntrega, NEW.costeEmpleadosDisponibles - OLD.costeEmpleadosDisponibles, NEW.costeHorasDisponibles - OLD.costeHorasDisponibles, NEW.costePresupuesto - OLD.costePresupuesto, NEW.FK_proyectoAsociado);
    ELSE
        /* Undo effects */
        SELECT
            fechaEntregaIdeal
        INTO
            previousDate
        FROM
            Desvio
        WHERE
            Desvio.FK_proyectoAsociado = OLD.FK_proyectoAsociado
            AND
            Desvio.fecha = (SELECT MAX(fecha) FROM Desvio WHERE Desvio.FK_proyectoAsociado = OLD.FK_proyectoAsociado);
        CALL trigProc_updateProjectData(previousDate, -OLD.costeEmpleadosDisponibles, -OLD.costeHorasDisponibles, -OLD.costePresupuesto, OLD.FK_proyectoAsociado);
        CALL trigProc_updateProjectData(NEW.nuevaFechaEntrega, NEW.costeEmpleadosDisponibles, NEW.costeHorasDisponibles, NEW.costePresupuesto, NEW.FK_proyectoAsociado);
    END IF;
END main$$
DELIMITER ;

/* Tabla PeticionVacacion */

DROP PROCEDURE IF EXISTS trigProc_validateVacationRequest;
DELIMITER $$
CREATE PROCEDURE trigProc_validateVacationRequest(requestedDays INT, employeePK VARCHAR(50))
COMMENT 'Este procedure se asegura que los dias pedidos por un empleado sean consistentes con los asignados por el area de recursos humanos'
main:BEGIN
    DECLARE dateHired DATE;
    DECLARE maximumVacation INT;
    DECLARE errorMessage VARCHAR(200);
    SELECT
        fechaIngreso
    INTO
        dateHired
    FROM
        Empleado
    WHERE
        Empleado.FK_dniEmpleado LIKE employeePK;

    SET maximumVacation = 
        CASE
            WHEN DATE_SUB(CURRENT_DATE(), INTERVAL 20 YEAR) > dateHired THEN 35
            WHEN DATE_SUB(CURRENT_DATE(), INTERVAL 10 YEAR) > dateHired THEN 28
            WHEN DATE_SUB(CURRENT_DATE(), INTERVAL 5 YEAR) > dateHired THEN 21
            WHEN DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH) > dateHired THEN 14
            ELSE DATEDIFF(CURRENT_DATE(), dateHired) DIV 20
        END;

    IF requestedDays > maximumVacation THEN
        SET errorMessage = CONCAT("El empleado se excede del maximo de sus dias permitidos. FK_dniEmpleado conflictivo: ", employeePK);
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = errorMessage;
    END IF;
END main$$
DELIMITER ;

DROP TRIGGER IF EXISTS tai_PeticionVacacion;
DELIMITER $$
CREATE TRIGGER tai_PeticionVacacion AFTER INSERT ON PeticionVacacion
FOR EACH ROW
main:BEGIN
    CALL trigProc_validateVacationRequest(NEW.diasPedidos, NEW.FK_empleado);
END main$$
DELIMITER ;

DROP TRIGGER IF EXISTS tau_PeticionVacacion;
DELIMITER $$
CREATE TRIGGER tau_PeticionVacacion AFTER UPDATE ON PeticionVacacion
FOR EACH ROW
main:BEGIN
    CALL trigProc_validateVacationRequest(NEW.diasPedidos, NEW.FK_empleado);
END main$$
DELIMITER ;

/* Tabla Tarea */

DROP PROCEDURE IF EXISTS trigProc_checkAvailableHours;
DELIMITER $$
CREATE PROCEDURE trigProc_checkAvailableHours(hourlyCost INT, projectPK INT)
COMMENT 'Este procedure asegura que las horas requeridas para una tarea no sobrepasen las disponibles en el proyecto'
main:BEGIN
    DECLARE errorMessage VARCHAR(200);
    DECLARE availableHours INT;
    SELECT
        horasDisponibles
    INTO
        availableHours
    FROM
        Proyecto
    WHERE   
        Proyecto.PK_idProyecto = projectPK;

    IF availableHours - hourlyCost < 0 THEN
        SET errorMessage = CONCAT("La tarea supera las horas asignadas al proyecto, carge un desvio para obtener mas horas. PK_idProyecto conflictivo: ", projectPK);
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = errorMessage;
    END IF;
END main$$
DELIMITER ;

DROP TRIGGER IF EXISTS tbi_Tarea;
DELIMITER $$
CREATE TRIGGER tbi_Tarea BEFORE INSERT ON Tarea
FOR EACH ROW
main:BEGIN
    CALL trigProc_checkAvailableHours(NEW.cargaHoraria, NEW.FK_proyectoAsignado);
END main$$
DELIMITER ;

DROP TRIGGER IF EXISTS tbu_Tarea;
DELIMITER $$
CREATE TRIGGER tbu_Tarea BEFORE UPDATE ON Tarea
FOR EACH ROW
main:BEGIN
    CALL trigProc_checkAvailableHours(NEW.cargaHoraria, NEW.FK_proyectoAsignado);
END main$$
DELIMITER ;
