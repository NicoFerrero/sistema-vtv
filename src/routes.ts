import { Express, Request, Response } from 'express';
import SupervisorController from './controllers/supervisor';
import TurnoController from './controllers/turno';
import MongoService from './repositories/mongo.repository';
import SupervisorService from './services/supervisor';
import AuthService from './services/auth';
import TurnoService from './services/turno';
import AuthMiddleware from './middlewares/auth';

//Inicializacion de servicios
const mongoService = new MongoService();
const authService = new AuthService();
const supervisorService = new SupervisorService(mongoService, authService);
const turnoService = new TurnoService(mongoService);

//Incializacion de controladores
const supervisorController = new SupervisorController(supervisorService);
const turnoController = new TurnoController(turnoService);

//Inicializacion de middleware
new AuthMiddleware(supervisorService);

function routes(app: Express) {
    app.get('/ping', (req: Request, res: Response) => res.json({ message: 'pong' }).status(200));

    app.post('/user', [AuthMiddleware.verifyToken, AuthMiddleware.isSupervisor], (req: Request, res: Response) => supervisorController.altaSupervisor(req, res));
    app.post('/sign-in', (req: Request, res: Response) => supervisorController.iniciarSesion(req, res));

    app.post('/appointment/free', (req: Request, res: Response) => turnoController.obetenerTurnosLibres(req, res));
    app.get('/appointment/:patente', (req: Request, res: Response) => turnoController.obetenerTurno(req, res));
    app.post('/appointment', (req: Request, res: Response) => turnoController.altaTurno(req, res));
    app.delete('/appointment/:patente', (req: Request, res: Response) => turnoController.eliminarTurno(req, res));
}

export default routes;
