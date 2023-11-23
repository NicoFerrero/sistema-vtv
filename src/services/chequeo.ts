import moment from 'moment';
import { IChequeo, IPregunta } from '../models/chequeo';
import IRepository from '../repositories/repository';
import TurnoService from '../services/turno';
import { NodeMailer } from './nodemailer';

export default class ChequeoService {
    chequeoRepository: IRepository;
    turnoService: TurnoService;

    constructor(chequeoService: IRepository, turnoSerevice: TurnoService) {
        this.chequeoRepository = chequeoService;
        this.turnoService = turnoSerevice;
    }

    async realizarChequeo(patente: string, preguntas: Array<IPregunta>): Promise<{ chequeo: IChequeo | null; error: string }> {
        const turnoExistente = await this.turnoService.obtenerTurno({ patente, estado: 'PENDIENTE', resultado: 'PENDIENTE' });
        if (!turnoExistente) {
            return { chequeo: null, error: 'El chequeo no se puede realizar porque no existe un turno asociado a esta patente.' };
        } else if (turnoExistente && turnoExistente.estado !== 'PENDIENTE') {
            return { chequeo: null, error: 'El chequeo no se puede realizar porque no existe un turno asociado a esta patente con estado pendiente' };
        } else if (turnoExistente && moment(turnoExistente.fecha, 'DD/MM/YYYY').diff(moment(), 'days') !== 0) {
            return { chequeo: null, error: `El chequeo no se puede realizar porque todavia no es la fecha del turno. El turno es el dia ${turnoExistente.fecha}` };
        }
        let preguntasValidas = true;
        let preguntaInvalida = ""
        preguntas.forEach((pregunta) => {
            if (pregunta.puntaje < 0 || pregunta.puntaje > 10) {
                preguntasValidas = false
                preguntaInvalida = pregunta.pregunta
            }
        });
        if (!preguntasValidas) {
            return { chequeo: null, error: `La pregunta ${preguntaInvalida} tiene asignado un puntaje menor a 0 o mayor a 10` };
        }

        const puntajeTotal = preguntas.reduce((total, pregunta) => total + pregunta.puntaje, 0);
        const chequeo: IChequeo = {
            estado: puntajeTotal >= 80 ? 'APROBADO' : 'DESAPROBADO',
            fecha: turnoExistente.fecha,
            horario: moment().format('HH:mm:ss'),
            preguntas: preguntas,
            puntajeTotal: puntajeTotal,
            patente: turnoExistente.patente
        };

        const chequeoRealizado = await this.chequeoRepository.create('Chequeo', chequeo);
        if (!chequeoRealizado) {
            return { chequeo: null, error: `El chequeo no se pudo realizar` };
        }
        await this.turnoService.modificarTurno({ _id: turnoExistente._id }, { estado: 'COMPLETADO', resultado: puntajeTotal >= 80 ? 'APROBADO' : 'DESAPROBADO' });
        let texto = `
            
            Hola ${turnoExistente.contacto.nombreCompleto}!

            El chequeo de la VTV para el turno del dia ${turnoExistente.fecha} a las ${turnoExistente.horario} fue realizado.
            El chequeo para la patente ${patente} esta ${chequeoRealizado.estado} con un puntaje de ${chequeoRealizado.puntajeTotal}.
            
            ¡Gracias!`;
        await new NodeMailer().sendEmail(turnoExistente.contacto.email, 'Sistema VTV - Chequeo realizado', texto);
        return { chequeo: chequeoRealizado, error: '' };
    }

    getPreguntas(): Array<IPregunta> {
        const preguntas: Array<IPregunta> = [
            {
                pregunta: '¿Desgaste visible en los discos de freno?',
                puntaje: 0
            },
            {
                pregunta: '¿Presencia de fugas de líquidos en el motor?',
                puntaje: 0
            },
            {
                pregunta: '¿Nivel de aceite dentro del rango adecuado?',
                puntaje: 0
            },
            {
                pregunta: '¿Neumáticos con profundidad de dibujo suficiente?',
                puntaje: 0
            },
            {
                pregunta: '¿Funcionamiento correcto de luces y señales?',
                puntaje: 0
            },
            {
                pregunta: '¿Estado general de la carrocería sin abolladuras importantes?',
                puntaje: 0
            },
            {
                pregunta: '¿Nivel de líquido de frenos dentro de lo recomendado?',
                puntaje: 0
            },
            {
                pregunta: '¿Sistema de escape sin corrosión ni fugas?',
                puntaje: 0
            },
            {
                pregunta: '¿Niveles de líquidos de transmisión y dirección correctos?',
                puntaje: 0
            },
            {
                pregunta: '¿Funcionamiento adecuado del sistema de suspensión?',
                puntaje: 0
            }
        ];
        return preguntas;
    }
}
