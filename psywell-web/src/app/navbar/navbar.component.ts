import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotasService } from '../services/NotasService';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  notasImportantes: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private notasService: NotasService
  ) {}

  ngOnInit(): void {
    // Suscribirse al servicio para recibir notas importantes
    this.notasService.notasImportantes$.subscribe((notas) => {
      this.notasImportantes = notas.map((nota) => ({
        ...nota,
        isOpen: false,
        palabraClave: nota.palabraClave,
      }));
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    const menu = document.querySelector('.navbar-menu');
    const hamburger = document.querySelector('.hamburger');

    if (menu && hamburger) {
      menu.classList.toggle('open', this.isMenuOpen);
      hamburger.classList.toggle('open', this.isMenuOpen);
    }
  }

  // Método para cerrar sesión
  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Hubo un error al cerrar sesión. Intenta nuevamente.');
    }
  }

  // Método para asignar colores dinámicos a las notas
  getPostitColor(index: number): string {
    const colors = ['#FFCCCB', '#FFD700', '#90EE90', '#ADD8E6', '#FFB6C1'];
    return colors[index % colors.length];
  }

  toggleNota(index: number): void {
    const nota = this.notasImportantes[index];
    nota.isOpen = !nota.isOpen;

    if (nota.isOpen) {
      setTimeout(() => {
        const notaElement = document.querySelectorAll('.nota-desplegable')[index] as HTMLElement;
        if (notaElement) {
          const rect = notaElement.getBoundingClientRect();

          // Ajustar si se sale por la derecha
          if (rect.right > window.innerWidth) {
            notaElement.style.transform = `translateX(-${rect.right - window.innerWidth + 20}px)`;
          }

          // Ajustar si se sale por abajo
          if (rect.bottom > window.innerHeight) {
            notaElement.style.transform += ` translateY(-${rect.bottom - window.innerHeight + 20}px)`;
          }
        }
      }, 300); // Esperar a que la transición inicial se complete
    }
  }
}
