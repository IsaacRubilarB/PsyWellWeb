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
    MatSelectModule
  ],
  templateUrl: './login-registro.component.html',
  styleUrls: ['./login-registro.component.scss']
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

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {}

  flip() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
  }

  async onLogin() {
    try {
      await this.authService.signInWithEmailAndPassword(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = 'Error al iniciar sesión: ' + (error as any).message; 
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
  
    const isUserExisting = await this.checkIfUserExists(this.email);
    if (isUserExisting) {
      this.errorMessage = 'Este correo electrónico ya está registrado. Por favor, inicia sesión.';
      return;
    }
  
    console.log('Datos para registrar:', this.email, this.password, this.nombre, this.fechaNacimiento, this.genero, this.perfil);
    
    // Enviar los datos a la API
    this.http.post<any>('http://localhost:8081/agregarUsuario', {
      idUsuario: null,  
      nombre: this.nombre,
      email: this.email,
      contrasena: this.password,
      perfil: this.perfil,
      fechaNacimiento: this.fechaNacimiento ? this.fechaNacimiento.toISOString().split('T')[0] : "",  
      genero: this.genero,
      estado: true
    }).subscribe(response => {
      console.log('Usuario guardado correctamente', response);
      this.router.navigate(['/dashboard']);  
    }, error => {
      console.error('Error al guardar usuario', error);
      this.errorMessage = 'Error al guardar usuario: ' + (error as any).message; 
    });
  }
  
  
  // Método para iniciar sesión con Google y verificar si ya está registrado
async signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await this.authService.getAuth().signInWithPopup(provider);  
    const user = userCredential.user;

    if (user) {
      const displayName = user.displayName || 'Usuario';
      const email = user.email || '';
      const gender = 'otro';  
      const birthdate = null;  

      this.router.navigate(['/dashboard']);
      
      
    } else {
      throw new Error('No se pudo obtener información del usuario');
    }
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error);
    this.errorMessage = 'Error al iniciar sesión con Google: ' + (error as any).message;
  }
}

checkIfUserExists(email: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    this.http.post<any>('http://localhost:8081/verificarOGuardarUsuario', { email })
      .subscribe(response => {
        console.log('Respuesta del servidor:', response); 

        if (response && response.status === 'success' && response.data && response.data.idUsuario) {
          console.log('El usuario existe en la base de datos. ID: ', response.data.idUsuario);
          resolve(true); 
        } else {
          console.log('El usuario NO existe en la base de datos');
          resolve(false); 
        }
      }, error => {
        console.error('Error al verificar usuario:', error);
        reject(error);
      });
  });
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
