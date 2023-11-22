import express, { NextFunction, Request, Response } from 'express';
import routes from '../routes';

//Models
require('../models/usuario');
require('../models/turno');

function createServer() {
    const app = express();
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.use((req: Request, res: Response, next: NextFunction) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }

        next();
    });

    routes(app);

    return app;
}

export default createServer;
