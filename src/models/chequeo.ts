import mongoose, { Document, Schema } from 'mongoose';

export interface IChequeo {
    preguntas: Array<IPregunta>;
    fecha: string;
    horario: string;
    puntajeTotal: number;
    estado: string;
    patente: string;
}

export interface IPregunta {
    pregunta: string;
    puntaje: number;
}

export interface IChequeoModel extends IChequeo, Document {}

const chequeoSchema: Schema = new Schema(
    {
        preguntas: { type: Array<IPregunta>, require: true },
        fecha: { type: String, require: true },
        horario: { type: String, require: true },
        puntajeTotal: { type: Number, require: true },
        estado: { type: String, require: true },
        patente: { type: String, require: true }
    },
    { timestamps: false }
);

export default mongoose.model<IChequeoModel>('Chequeo', chequeoSchema);
