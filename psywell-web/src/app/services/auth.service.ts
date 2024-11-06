import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { lastValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private http: HttpClient,  // Asegúrate de tener HttpClientModule en AppModule
    private router: Router
  ) {}

  async register(email: string, password: string, nombre: string, fechaNacimiento: string, genero: string, perfil: string) {
    try {
      // 1. Crear usuario en Firebase
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user?.uid;

      if (uid) {
        // 2. Guardar en PostgreSQL y obtener el ID
        const postgresId = await this.saveUserToPostgres(uid, nombre, email, password, fechaNacimiento, genero, perfil);
        
        // 3. Guardar en Firestore con el ID de PostgreSQL
        await this.saveUserToFirestore(uid, nombre, email, postgresId);

        // Redirigir al usuario al dashboard
        this.router.navigate(['/dashboard']);
      } else {
        throw new Error('UID de Firebase no válido');
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw new Error('Error al registrar usuario: ' + (error as Error).message);
    }
  }
  private async saveUserToFirestore(uid: string, nombre: string, email: string, postgresId: string) {
    const userRef = this.firestore.collection('usuarios').doc(uid);
    try {
      await userRef.set({
        nombre: nombre,
        email: email,
        postgresId: postgresId,  // Aquí lo guardamos con el postgresId obtenido
        fechaCreacion: new Date(),
      });
      console.log('Usuario guardado correctamente en Firestore');
    } catch (error) {
      console.error('Error al guardar usuario en Firestore:', error);
      throw new Error('Error al guardar usuario en Firestore');
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
        perfil  // Asegúrate de que 'perfil' sea el último valor
      }));
  
      console.log('Response from PostgreSQL:', response);  // Verifica la respuesta
  
      // Si no se recibe postgresId, lanza un error, pero no interrumpe el flujo
      if (!response.postgresId) {
        console.warn('postgresId no recibido desde PostgreSQL');
        return null;  // Puedes retornar null o un valor que indiques como fallback
      }
  
      return response.postgresId;
    } catch (error) {
      console.error('Error al guardar usuario en PostgreSQL:', error);
      throw new Error('Error al guardar usuario en PostgreSQL');
    }
  }  
  
  // Método para iniciar sesión con Firebase
  async onLogin(email: string, password: string) {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error al iniciar sesión: ', error);
      throw new Error('Error al iniciar sesión: ' + (error as Error).message);
    }
  }

  // Método para cerrar sesión
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
