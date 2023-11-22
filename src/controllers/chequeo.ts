import { Request, Response } from 'express';
import ChequeoService from '../services/chequeo';

export default class ChequeoController {
    chequeoService: ChequeoService;
    constructor(chequeoService: ChequeoService) {
        this.chequeoService = chequeoService;
    }

    async getPreguntas(req: Request, res: Response) {
        const preguntas = await this.chequeoService.getPreguntas();
        return res.status(200).json({ preguntas: preguntas, error: '' });
    }

    async checkUp(req: Request, res: Response) {
        const { patente, preguntas } = req.body;

        const { chequeo, error } = await this.chequeoService.realizarChequeo(patente, preguntas);
        if (!chequeo) {
            return res.status(404).json({ chequeo: null, error });
        }
        return res.status(200).json({ chequeo, error: '' });
    }
}
