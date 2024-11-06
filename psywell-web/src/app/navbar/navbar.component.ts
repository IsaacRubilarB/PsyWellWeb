import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Asegúrate de importar el servicio de autenticación

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule] 
})
export class NavbarComponent {
  isMenuOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    const menu = document.querySelector('.navbar-menu');
    const hamburger = document.querySelector('.hamburger');
    
    if (menu && hamburger) {
      menu.classList.toggle('open', this.isMenuOpen);
      hamburger.classList.toggle('open', this.isMenuOpen);
    }
  }

  // Método para cerrar sesión
  async logout() {
    try {
      await this.authService.logout();  // Llamada al servicio para cerrar sesión
      this.router.navigate(['/login']);  // Redirige al login después de cerrar sesión
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Hubo un error al cerrar sesión. Intenta nuevamente.');
    }
  }
}
