import { Request, Response } from 'express';
import TurnoService from '../services/turno';

export default class TurnoController {
    turnoService: TurnoService;
    constructor(turnoService: TurnoService) {
        this.turnoService = turnoService;
    }

    async obetenerTurnosLibres(req: Request, res: Response) {
        const { fecha } = req.body;
        const { horarios, error } = await this.turnoService.obtenerTurnosLibres(fecha);
        if (error) return res.status(404).json({ turnos: [], error });
        return res.status(200).json({ turnos: horarios, error: '' });
    }

    async obetenerTurno(req: Request, res: Response) {
        const patente = req.params.patente;
        const turno = await this.turnoService.obtenerTurno({ patente });
        if (!turno) return res.status(404).json({ turno: null, error: 'No existe un turno para esa patente' });
        return res.status(201).json({ turno: turno, error: '' });
    }

    async altaTurno(req: Request, res: Response) {
        const { patente, fecha, horario, contacto } = req.body;
        const { turno, error } = await this.turnoService.altaTurno(patente, fecha, horario, 'PENDIENTE', contacto);
        if (!turno) return res.status(404).json({ turno: null, error });
        return res.status(201).json({ turno: turno, error: '' });
    }

    async eliminarTurno(req: Request, res: Response) {
        const patente = req.params.patente;
        const { turnoBorrado, error } = await this.turnoService.eliminarTurno(patente);
        if (turnoBorrado !== 1) return res.status(404).json({ turnoBorrado: null, error });
        return res.status(201).json({ turnoBorrado, error: 'El turno se elimino con exito' });
    }
}
