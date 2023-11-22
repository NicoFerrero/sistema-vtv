import SupervisorService from '../services/supervisor';
import { Request, Response } from 'express';

export default class SupervisorController {
    supervisorService: SupervisorService;
    constructor(supervisorService: SupervisorService) {
        this.supervisorService = supervisorService;
    }

    async iniciarSesion(req: Request, res: Response) {
        const { email, contrasenia } = req.body;
        const { token, error } = await this.supervisorService.iniciarSesion(email, contrasenia);
        if (error) return res.status(404).json({ token: '', error });
        return res.status(200).json({ token: token, error: '' });
    }

    async altaSupervisor(req: Request, res: Response) {
        const { nombreCompleto, email, dni, contrasenia, legajo } = req.body;
        const { supervisor, error } = await this.supervisorService.altaSupervisor(nombreCompleto, dni, email, contrasenia, 'supervisor', legajo);
        if (error) return res.status(404).json({ usuario: null, error });
        return res.status(201).json({ usuario: supervisor, error: '' });
    }
}
