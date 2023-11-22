import mongoose, { FilterQuery, Mongoose } from 'mongoose';
import IRepository from './repository';

export default class MongoService implements IRepository {
    async create<T>(modelName: string, data: T): Promise<T> {
        const model = mongoose.model<T>(modelName);
        const instance = new model(data);
        await instance.save();
        return instance;
    }

    async read<T>(modelName: string, query: FilterQuery<T>): Promise<T[]> {
        const model = mongoose.model<T>(modelName);
        const result = await model.find(query);
        return result;
    }

    async update<T>(modelName: string, id: string, data: T): Promise<T | null> {
        const model = mongoose.model<T>(modelName);
        const result = await model.findByIdAndUpdate(id, data as FilterQuery<T>, { new: true });
        return result;
    }

    async delete<T>(modelName: string, query: FilterQuery<T>): Promise<any> {
        const model = mongoose.model(modelName);
        const result = await model.deleteOne(query);
        return result;
    }
}
