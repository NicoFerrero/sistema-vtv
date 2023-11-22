import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import SupervisorService from '../services/supervisor';
import config from '../utils/config';

declare module 'express-serve-static-core' {
    interface Request {
        userId?: string;
    }
}

export default class AuthMiddleware {
    static dataRepository: SupervisorService;

    constructor(dataRepository: SupervisorService) {
        AuthMiddleware.dataRepository = dataRepository;
    }

    static async verifyToken(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(403).json({ error: 'No se envio un token' });
            const payload = jwt.verify(token, config.auth.jwtSecret as string) as { id: string };
            const supervisor = await AuthMiddleware.dataRepository.ObtenerSupervisor({ _id: payload.id });
            if (!supervisor) return res.status(403).json({ error: 'El supervisor no existe' });
            req.userId = payload.id;
            return next();
        } catch (error) {
            return res.status(401).json({ error: 'No autorizado' });
        }
    }

    static async isSupervisor(req: Request, res: Response, next: NextFunction) {
        const usuario = await AuthMiddleware.dataRepository.ObtenerSupervisor({ _id: req.userId || '' });
        if (usuario.rol == 'supervisor') {
            return next();
        }
        return res.status(403).json({ error: 'El usuario no tiene permiso para realizar la accion deseada' });
    }
}
