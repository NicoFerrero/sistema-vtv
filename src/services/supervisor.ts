import { ISupervisor, ISupervisorModel } from '../models/usuario';
import IRepository from '../repositories/repository';
import AuthService from './auth';

export default class SupervisorService {
    dataRepository: IRepository;
    authService: AuthService;

    constructor(usuarioService: IRepository, authService: AuthService) {
        this.dataRepository = usuarioService;
        this.authService = authService;
    }

    async crearSupervisor(data: ISupervisor): Promise<ISupervisorModel | null> {
        try {
            const user = await this.dataRepository.create<ISupervisorModel>('Supervisor', data as ISupervisorModel);
            return user;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    async ObtenerSupervisor(query: {}): Promise<ISupervisorModel> {
        const user = await this.dataRepository.read<ISupervisorModel>('Supervisor', query);
        return user[0];
    }

    async iniciarSesion(email: string, contrasenia: string): Promise<{ token: string; error: string }> {
        try {
            const supervisor = await this.ObtenerSupervisor({ email });
            if (!supervisor) return { token: '', error: 'Las credenciales no son validas' };
            const pass = await this.authService.comparePasswords(contrasenia, supervisor.contrasenia);
            if (!pass) return { token: '', error: 'Las credenciales no son validas' };
            const token = this.authService.createToken(supervisor._id);
            return { token, error: '' };
        } catch (e) {
            return { token: '', error: 'Ocurrio un error durante el inicio de sesion' };
        }
    }

    async altaSupervisor(nombreCompleto: string, dni: string, email: string, contrasenia: string, rol: string, legajo: number): Promise<{ supervisor: ISupervisorModel | null; error: string }> {
        try {
            const supervisorExistente = await this.ObtenerSupervisor({ dni });
            if (supervisorExistente) {
                return { supervisor: null, error: 'Ya existe un supervisor creado con ese dni.' };
            }
            const constraseniaSegura = await this.authService.encryptPassword(contrasenia);
            const supervisor = { nombreCompleto, email, dni, contrasenia: constraseniaSegura, rol, legajo };
            const supervisorCreado = await this.crearSupervisor(supervisor);
            return { supervisor: supervisorCreado, error: '' };
        } catch (e) {
            console.log(e);
            return { supervisor: null, error: 'El supervisor no se ah podido crear' };
        }
    }
}
