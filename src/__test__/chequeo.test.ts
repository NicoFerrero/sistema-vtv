import supertest from 'supertest';
import createServer from '../utils/server';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import AuthService from '../services/auth';
import MongoService from '../repositories/mongo.repository';
import SupervisorService from '../services/supervisor';
import { ISupervisorModel } from '../models/usuario';

const app = createServer();
let supervisorGlobal: ISupervisorModel | null;

describe('Turnos', () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
        const mongoService = new MongoService();
        const authService = new AuthService();
        const supervisorService = new SupervisorService(mongoService, authService);
        const { supervisor, error } = await supervisorService.altaSupervisor('Nicolas Ferrero', '38148616', 'nicolasferreroutn@gmail.com', '12345678', 'supervisor', 10001);
        supervisorGlobal = supervisor;
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    });

    describe('realizar chequeo', () => {
        it('Should return 200 and the check-up', async () => {
            const appointment = {
                patente: 'aaa404',
                fecha: '22/11/2023',
                horario: '21:00:00',
                contacto: {
                    nombreCompleto: 'Nicolas Ferrero',
                    email: 'nicolasferreroutn@gmail.com',
                    dni: '38148616'
                }
            };
            const checkUpBody = {
                preguntas: [
                    {
                        pregunta: '¿Desgaste visible en los discos de freno?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Presencia de fugas de líquidos en el motor?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Nivel de aceite dentro del rango adecuado?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Neumáticos con profundidad de dibujo suficiente?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Funcionamiento correcto de luces y señales?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Estado general de la carrocería sin abolladuras importantes?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Nivel de líquido de frenos dentro de lo recomendado?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Sistema de escape sin corrosión ni fugas?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Niveles de líquidos de transmisión y dirección correctos?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Funcionamiento adecuado del sistema de suspensión?',
                        puntaje: 0
                    }
                ],
                patente: 'aaa404'
            };
            const token = new AuthService().createToken(supervisorGlobal?._id);
            await supertest(app).post('/appointment').send(appointment);
            const { body, statusCode } = await supertest(app).post('/check-up').set('Authorization', token).send(checkUpBody);
            expect(statusCode).toBe(200);
            expect(body.chequeo.patente).toBe(checkUpBody.patente);
            expect(body.chequeo.estado).toBe('APROBADO');
        });
    });
    describe('realizar chequeo para turno inexistente', () => {
        it('Should return 404 and error', async () => {
            const checkUpBody = {
                preguntas: [
                    {
                        pregunta: '¿Desgaste visible en los discos de freno?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Presencia de fugas de líquidos en el motor?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Nivel de aceite dentro del rango adecuado?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Neumáticos con profundidad de dibujo suficiente?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Funcionamiento correcto de luces y señales?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Estado general de la carrocería sin abolladuras importantes?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Nivel de líquido de frenos dentro de lo recomendado?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Sistema de escape sin corrosión ni fugas?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Niveles de líquidos de transmisión y dirección correctos?',
                        puntaje: 10
                    },
                    {
                        pregunta: '¿Funcionamiento adecuado del sistema de suspensión?',
                        puntaje: 0
                    }
                ],
                patente: 'aaa404'
            };
            const token = new AuthService().createToken(supervisorGlobal?._id);
            const { body, statusCode } = await supertest(app).post('/check-up').set('Authorization', token).send(checkUpBody);
            expect(statusCode).toBe(404);
            expect(body.error.length).toBeGreaterThan(0);
        });
    });
});
