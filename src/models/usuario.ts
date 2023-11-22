import mongoose, { Document, Schema } from 'mongoose';

export interface IPersona {
    nombreCompleto: string;
    dni: string;
    email: string;
    rol?: string;
}

export interface ISupervisor extends IPersona {
    legajo: number;
    contrasenia: string;
}

export interface ISupervisorModel extends ISupervisor, Document {}

const supervisorSchema: Schema = new Schema(
    {
        nombreCompleto: { type: String, require: true },
        dni: { type: String, require: true },
        email: { type: String, require: true },
        contrasenia: { type: String, require: true },
        rol: { type: String, require: true },
        legajo: { type: Number, require: true }
    },
    { timestamps: false }
);

export default mongoose.model<ISupervisorModel>('Supervisor', supervisorSchema);
