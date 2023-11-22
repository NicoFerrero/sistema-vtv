import { ExecException } from 'child_process';
import turno, { ITurno, ITurnoModel } from '../models/turno';
import { IPersona } from '../models/usuario';
import IRepository from '../repositories/repository';
//import moment from 'moment-timezone';
import moment, { Moment } from 'moment';

export default class TurnoService {
    dataRepository: IRepository;

    constructor(usuarioService: IRepository) {
        this.dataRepository = usuarioService;
    }

    async crearTurno(data: ITurno): Promise<ITurnoModel | null> {
        try {
            const turno = await this.dataRepository.create<ITurnoModel>('Turno', data as ITurnoModel);
            return turno;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    async obtenerTurnos(query: {}): Promise<ITurnoModel[]> {
        const turnos = await this.dataRepository.read<ITurnoModel>('Turno', query);
        return turnos;
    }

    async obtenerTurno(query: {}): Promise<ITurnoModel> {
        const turno = await this.dataRepository.read<ITurnoModel>('Turno', query);
        return turno[0];
    }

    async modificarTurno(query: {}, data: any) {
        try {
            const turno = await this.dataRepository.update<ITurnoModel>('Turno', data as ITurnoModel, query);
            return turno;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    async obtenerTurnosLibres(date: string): Promise<{ horarios: Array<string> | null; error: string }> {
        try {
            // Parse the date received in the body
            const targetDate = moment(date, 'DD/MM/YYYY');
            targetDate.hour(new Date().getHours()).minute(new Date().getMinutes());
            if (targetDate.date() < new Date().getDate() || targetDate.hours() >= 22) {
                throw Error('No se puede pedir un turno para el dia elegido');
            }
            if (targetDate.minutes() > 0 && targetDate.minutes() <= 29) {
                targetDate.minutes(30);
            } else if (targetDate.minutes() >= 30 && targetDate.minutes() <= 59) {
                targetDate.minutes(0);
                targetDate.hours(targetDate.hours() + 1);
            }
            const startOfDay = targetDate.clone().hours(9).minutes(0); //.add(9, 'day');
            const endOfDay = targetDate.clone().hours(22).minutes(0);
            let currentTime = targetDate.date() === new Date().getDate() ? targetDate.clone() : startOfDay.clone();
            // Find existing appointments for the given day
            const existingAppointments: ITurno[] = await this.obtenerTurnos({
                fecha: targetDate.toDate().toLocaleString('es-AR').split(',')[0]
            });
            // Generate all time slots for the day
            const allTimeSlots: Moment[] = [];
            while (currentTime < endOfDay) {
                allTimeSlots.push(currentTime.clone());
                currentTime.add({ minutes: 30 });
            }
            let freeAppointments: Moment[] = [];
            // Filter out booked slots
            if (existingAppointments) {
                freeAppointments = allTimeSlots.filter(
                    (slot) => !existingAppointments.some((appointment) => slot.hours() === Number(appointment.horario.split(':')[0]) && slot.minutes() === Number(appointment.horario.split(':')[1]))
                );
            } else {
                freeAppointments = allTimeSlots;
            }

            if (freeAppointments.length === 0) {
                throw Error();
            }
            const aux = freeAppointments.map((appointment) => appointment.toDate().toLocaleString('es-AR'));

            return { horarios: aux, error: '' };
        } catch (error) {
            return { horarios: [], error: error instanceof Error ? error.message : 'Error inesperado' };
        }
    }

    async altaTurno(patente: string, fecha: string, horario: string, estado: string, contacto: IPersona): Promise<{ turno: ITurnoModel | null; error: string }> {
        try {
            const targetDate = moment(`${fecha} ${horario}`, 'DD/MM/YYYY hh/mm/ss');
            if (targetDate.minutes() > 0 && targetDate.minutes() <= 29) {
                targetDate.minutes(30);
            } else if (targetDate.minutes() > 30 && targetDate.minutes() <= 59) {
                targetDate.minutes(0);
                targetDate.hours(targetDate.hours() + 1);
            }
            //Siempre trae el ultimo
            const turnosExistentes = await this.obtenerTurnos({ patente });
            let puedePedirTurno = true;
            turnosExistentes
                .filter((turno) => turno.resultado == 'APROBADO')
                .forEach((turno) => {
                    if (targetDate.diff(moment(turno.fecha, 'DD/MM/YYYY'), 'days') < 365) {
                        puedePedirTurno = false;
                    }
                });
            if (!puedePedirTurno) {
                return { turno: null, error: `Ustded ya aprobo el chequeo del año.` };
            }
            const turnoPendiente = turnosExistentes.filter((turno) => turno.resultado == 'PENDIENTE')[0];
            if (turnoPendiente) {
                return { turno: null, error: `Ya existe un turno pendiente creado para esta patente.` };
            }
            const turnoTomado = await this.obtenerTurno({ fecha, horario });
            if (turnoTomado) {
                return {
                    turno: null,
                    error: `El turno que intenta solicitar para la fecha ${targetDate.format('DD/MM/YYYY')} y la hora ${targetDate.format('HH:mm:ss')} ya fue tomado. Vuelva a  buscar turnos libres.`
                };
            }
            if (moment().diff(targetDate, 'days') > 0) {
                return { turno: null, error: `No puede pedir un turno para un dia anterior al actual` };
            }
            if (moment().diff(moment(targetDate, 'hh:mm:ss'), 'millisecond') > 0) {
                return { turno: null, error: `No puede pedir un turno para el dia actual en un horario anterior` };
            }
            if (
                moment(targetDate, 'hh:mm:ss').hours() > moment(`${fecha} 22:00:00`, 'DD/MM/YYY hh:mm:ss').hours() ||
                moment(targetDate, 'hh:mm:ss').hours() < moment(`${fecha} 09:00:00`, 'hh:mm:ss').hours()
            ) {
                return { turno: null, error: `No puede pedir un turno fuera del horario laboral` };
            }
            const turno = { patente, fecha, horario, estado, contacto, resultado: 'PENDIENTE' };
            const turnoCreado = await this.crearTurno(turno);
            return { turno: turnoCreado, error: '' };
        } catch (e) {
            console.log(e);
            return { turno: null, error: 'El turno no se ah podido crear' };
        }
    }

    async elimnarTurno(patente: String) {
        const turnosExistentes = await this.obtenerTurnos({ patente, fecha: { $gte: new Date().toLocaleString('es-AR').split(',')[0] } });
        if (turnosExistentes.length < 1) {
            return { turnoBorrado: 0, error: 'No hay ningun turno para la patente ingresada.' };
        }
        const resultado = await this.dataRepository.delete('Turno', { patente });
        if (resultado.deletedCount !== 1) {
            return { turnoBorrado: resultado.deletedCount, error: `No se pudo borrar el turno de la patente ingresada` };
        }
        return { turnoBorrado: resultado.deletedCount, error: `El turno con la patente ${patente} fue borrado con exito` };
    }
}
