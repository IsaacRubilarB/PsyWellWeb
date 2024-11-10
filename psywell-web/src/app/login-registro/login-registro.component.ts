import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

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
  genero = '';
  errorMessage = '';
  
  // Propiedades para manejar si los campos han sido "tocados" o no
  passwordTouched = false;
  generoTouched = false;
  nombreTouched = false;
  emailTouched = false;
  fechaNacimientoTouched = false;

  constructor(private authService: AuthService, private router: Router) {}

  flip() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
  }

  async onLogin() {
    try {
      await this.authService.onLogin(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = 'Error al iniciar sesión: ' + (error as Error).message;
    }
  }

  async onRegister() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    try {
      await this.authService.register(
        this.email, 
        this.password, 
        this.nombre, 
        this.fechaNacimiento?.toISOString() || '',  // fechaNacimiento como string
        this.genero,                               // genero
        'psicologo'                                // perfil (debe ser 'psicologo')
      );
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = 'Error al registrar usuario: ' + (error as Error).message;
    }
  }

  // Métodos adicionales para controlar el estado tocado de los campos
  setTouched(field: string) {
    switch(field) {
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
