import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-registro',
  standalone: true,  
  imports: [CommonModule, FormsModule], 
  templateUrl: './login-registro.component.html',
  styleUrls: ['./login-registro.component.scss']
})
export class LoginRegistroComponent {
  isLogin = true;
  email = '';
  password = '';
  confirmPassword = '';
  nombre = '';
  fechaNacimiento = '';
  genero = '';
  errorMessage = '';
passwordTouched: any;
generoTouched: any;
nombreTouched: any;
emailTouched: any;

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
      // Asegúrate de que 'psicologo' esté siendo pasado como 'perfil'
      await this.authService.register(
        this.email, 
        this.password, 
        this.nombre, 
        this.fechaNacimiento,  // fechaNacimiento
        this.genero,           // genero
        'psicologo'            // perfil (debe ser 'psicologo')
      );
        this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = 'Error al registrar usuario: ' + (error as Error).message;
    }
  }
  
  
}
