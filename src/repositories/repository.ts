export default interface IRepository {
    create<T>(modelName: string, data: T): Promise<T>;
    read<T>(modelName: string, query?: any): Promise<T[]>;
    update<T>(modelName: string, data: T, query?: any): Promise<T | null>;
    delete<T>(modelName: string, query?: any): Promise<any>;
}
