import supertest from 'supertest';
import createServer from '../utils/server';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const app = createServer();

describe('Turnos', () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    });
    describe('Obtener turnos libres para dia valido', () => {
        it('Should return 200 and arrays of appointments', async () => {
            const { body, statusCode } = await supertest(app).post('/appointment/free').send({ fecha: '22/11/2023' });
            expect(statusCode).toBe(200);
            expect(body.turnos).toBeInstanceOf(Array);
            expect(body.turnos.length).toBeGreaterThan(0);
        });
    });

    describe('Obtener turnos libres para dia invalido', () => {
        it('Should return 200 and arrays of appointments', async () => {
            const { body, statusCode } = await supertest(app).post('/appointment/free').send({ fecha: '21/11/2023' });
            expect(statusCode).toBe(404);
            expect(body.turnos).toBeInstanceOf(Array);
            expect(body.turnos.length).toBe(0);
        });
    });

    describe('Pedir un turno', () => {
        it('Should return 200 and the appointment', async () => {
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
            const { body, statusCode } = await supertest(app).post('/appointment').send(appointment);
            expect(statusCode).toBe(201);
            expect(body.turno.patente).toBe(appointment.patente);
            expect(body.turno.patente).toBe(appointment.patente);
        });
    });

    describe('Pedir un turno cuando ya tenemos uno pendiente', () => {
        it('Should return 404 and the error', async () => {
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
            const appointment2 = {
                patente: 'aaa404',
                fecha: '22/11/2023',
                horario: '21:30:00',
                contacto: {
                    nombreCompleto: 'Nicolas Ferrero',
                    email: 'nicolasferreroutn@gmail.com',
                    dni: '38148616'
                }
            };
            await supertest(app).post('/appointment').send(appointment);
            const { body, statusCode } = await supertest(app).post('/appointment').send(appointment2);
            expect(statusCode).toBe(404);
            expect(body.error.length).toBeGreaterThan(0);
        });
    });
});
