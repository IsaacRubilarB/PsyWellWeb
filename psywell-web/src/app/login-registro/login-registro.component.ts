import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';
import { GoogleAuthProvider } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http'; 
import { GoogleAuthProvider } from '@angular/fire/auth';
import { environment } from 'environments/environments';


@Component({
  selector: 'app-login-registro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './login-registro.component.html',
  styleUrls: ['./login-registro.component.scss'],
})
export class LoginRegistroComponent {
  isLogin = true;
  email = '';
  password = '';
  confirmPassword = '';
  nombre = '';
  fechaNacimiento: Date | null = null;
  genero = 'otro';
  perfil = 'psicologo';
  errorMessage = '';
  isGoogleLogin = false;

  passwordTouched = false;
  generoTouched = false;
  nombreTouched = false;
  emailTouched = false;
  fechaNacimientoTouched = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  flip() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
  }

  async onLogin() {
    try {
      await this.authService.signInWithEmailAndPassword(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = `Error al iniciar sesión: ${error.message}`;
    }
  }

  async onRegister() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (!this.email || !this.nombre || !this.fechaNacimiento || !this.genero || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    try {
      const fechaNacimientoFormateada = this.formatDate(this.fechaNacimiento);

      const userInput = {
        nombre: this.nombre,
        email: this.email,
        contrasena: this.password,
        perfil: this.perfil || 'psicologo',
        fechaNacimiento: fechaNacimientoFormateada,
        genero: this.genero,
        estado: true,
      };

      console.log('Datos para PostgreSQL:', userInput);

      const response = await this.http
        .post<any>('http://localhost:8081/agregarUsuario', userInput)
        .toPromise();

  
      // Registrar en PostgreSQL
      const response = await this.http.post<any>(environment.apiUsuario+'agregarUsuario', userInput).toPromise();
      if (response && response.status === 'success') {
        console.log('Usuario registrado en PostgreSQL:', response);

        const firebaseUser = await this.authService.getAuth().createUserWithEmailAndPassword(this.email, this.password);
        if (!firebaseUser.user) {
          throw new Error('Error: No se pudo obtener el usuario de Firebase');
        }
        const firebaseUid = firebaseUser.user.uid;

        await this.authService.saveUserToFirestore(firebaseUid, this.nombre, this.email, response.data.idUsuario);

        console.log('Usuario registrado en Firebase Firestore');
        this.router.navigate(['/dashboard']);
      } else {
        throw new Error(response.message || 'Error desconocido al registrar usuario en PostgreSQL');
      }
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      this.errorMessage = `Error al registrar usuario: ${error.message}`;
    }
  }

  private formatDate(date: string | Date): string {
    const parsedDate = new Date(date);
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();
    return `${day}-${month}-${year}`;
  }

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await this.authService.getAuth().signInWithPopup(provider);

      if (!userCredential || !userCredential.user) {
        throw new Error('No se pudo obtener información del usuario de Google.');
      }

      const user = userCredential.user;
      const email = user.email || '';
      const displayName = user.displayName || 'Usuario';

      const isUserExisting = await this.authService.checkIfUserExists(email);

      if (isUserExisting) {
        this.router.navigate(['/dashboard']);
      } else {
        const userInput = {
          email,
          nombre: displayName,
          genero: 'otro',
          fechaNacimiento: null,
          perfil: 'psicologo',
        };
        await this.onRegisterWithGoogle(userInput);
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión con Google:', error);
      this.errorMessage = `Error al iniciar sesión con Google: ${error.message}`;
    }
  }

  async onRegisterWithGoogle(userInput: any) {
    try {
      const response = await this.http
        .post<any>('http://localhost:8081/agregarUsuario', userInput)
        .toPromise();
      if (response && response.status === 'success') {
        console.log('Usuario registrado en PostgreSQL:', response);

checkIfUserExists(email: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    this.http.post<any>(environment.apiUsuario+'verificarOGuardarUsuario', { email })
      .subscribe(response => {
        console.log('Respuesta del servidor:', response); 

        const firebaseUser = await this.authService.getAuth().currentUser;
        if (!firebaseUser) {
          throw new Error('No se pudo obtener el usuario actual de Firebase');
        }

        const firebaseUid = firebaseUser.uid;

        await this.authService.saveUserToFirestore(firebaseUid, userInput.nombre, userInput.email, response.data.idUsuario);
        console.log('Usuario registrado en Firebase Firestore');
        this.router.navigate(['/dashboard']);
      } else {
        throw new Error(response.message || 'Error desconocido al registrar usuario en PostgreSQL');
      }
    } catch (error: any) {
      console.error('Error al registrar usuario con Google:', error);
      this.errorMessage = `Error al registrar usuario con Google: ${error.message}`;
    }
  }

  setTouched(field: string) {
    switch (field) {
      case 'email':
        this.emailTouched = true;
        break;
      case 'nombre':
        this.nombreTouched = true;
        break;
      case 'genero':
        this.generoTouched = true;
        break;
      case 'password':
        this.passwordTouched = true;
        break;
      case 'fechaNacimiento':
        this.fechaNacimientoTouched = true;
        break;
    }
  }
}
