import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, lastValueFrom, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userInfoSubject = new BehaviorSubject<{ nombre: string; genero: string }>({ nombre: 'Usuario', genero: 'masculino' });
  userInfo$ = this.userInfoSubject.asObservable();

  constructor(
    private afAuth: AngularFireAuth,
    private http: HttpClient,
    private router: Router
  ) {}

  async register(email: string, password: string, nombre: string, fechaNacimiento: string, genero: string, perfil: string) {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user?.uid;

      if (uid) {
        const postgresId = await this.saveUserToPostgres(uid, nombre, email, password, fechaNacimiento, genero, perfil);
        this.router.navigate(['/dashboard']);
      } else {
        throw new Error('UID de Firebase no válido');
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw new Error('Error al registrar usuario: ' + (error as Error).message);
    }
  }

  private async saveUserToPostgres(uid: string, nombre: string, email: string, contrasena: string, fechaNacimiento: string, genero: string, perfil: string): Promise<any> {
    try {
      const response = await lastValueFrom(this.http.post<any>('http://localhost:8081/agregarUsuario', {
        uid,
        nombre,
        email,
        contrasena,
        fechaNacimiento,
        genero,
        perfil
      }));
  
      console.log('Response from PostgreSQL:', response);

      if (!response.postgresId) {
        console.warn('postgresId no recibido desde PostgreSQL');
        return null;
      }
  
      return response.postgresId;
    } catch (error) {
      console.error('Error al guardar usuario en PostgreSQL:', error);
      throw new Error('Error al guardar usuario en PostgreSQL');
    }
  }

  async onLogin(email: string, password: string) {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      const uid = userCredential.user?.uid;

      if (uid) {
        // Recupera el id del usuario en PostgreSQL
        this.fetchUserIdFromPostgres(email).subscribe(
          (id) => {
            this.fetchUserInfoFromPostgres(id);
            this.router.navigate(['/dashboard']);
          },
          (error) => {
            console.error('Error al obtener id de usuario desde PostgreSQL:', error);
          }
        );
      }
    } catch (error) {
      console.error('Error al iniciar sesión: ', error);
      throw new Error('Error al iniciar sesión: ' + (error as Error).message);
    }
  }

  private fetchUserIdFromPostgres(email: string): Observable<number> {
    // Endpoint en el backend que busca el id usando el email
    return this.http.get<number>(`http://localhost:8081/obtenerIdUsuarioPorEmail/${email}`);
  }

  // Método para obtener la información del usuario desde PostgreSQL usando el id
  private fetchUserInfoFromPostgres(id: number) {
    this.http.get<any>(`http://localhost:8081/ListarUsuariosById/${id}`).subscribe(
      (data) => {
        if (data && data.nombre && data.genero) {
          this.userInfoSubject.next({ nombre: data.nombre, genero: data.genero });
        } else {
          console.warn('No se encontraron datos de usuario en PostgreSQL');
        }
      },
      (error) => {
        console.error('Error al obtener usuario de PostgreSQL:', error);
      }
    );
  }

  async logout() {
    try {
      await this.afAuth.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  isAuthenticated(): Observable<boolean> {
    return this.afAuth.authState.pipe(map(user => !!user));
  }
}
