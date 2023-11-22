import mongoose, { Document, Schema } from 'mongoose';
import { IPersona } from './usuario';

export interface ITurno {
    patente: string;
    fecha: string;
    horario: string;
    estado: string;
    contacto: IPersona;
}

export interface ITurnoModel extends ITurno, Document {
    some(arg0: (appointment: any) => boolean): unknown;
}

const contactoSchema: Schema = new Schema(
    {
        nombreCompleto: { type: String, require: true },
        dni: { type: String, require: true },
        email: { type: String, require: true }
    },
    { timestamps: false, _id: false }
);

const turnoSchema: Schema = new Schema(
    {
        patente: { type: String, require: true },
        horario: { type: String, require: true },
        fecha: { type: String, require: true },
        estado: { type: String, require: true },
        contacto: { type: contactoSchema, require: true }
    },
    { timestamps: false }
);

export default mongoose.model<ITurnoModel>('Turno', turnoSchema);
