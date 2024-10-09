import { Component } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importar módulos comunes necesarios

@Component({
  selector: 'app-dashboard',
  standalone: true,  // Marcar como componente standalone
  imports: [CommonModule], // Importar CommonModule para usar directivas comunes como *ngIf y *ngFor
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  psicologoName: string = 'Cristina Zapata'; // Nombre del psicólogo
  especialidad: string = 'Psicóloga Especialista en Salud Mental';
  aniosExperiencia: number = 10; // Años de experiencia

  // Imagen de fondo personalizada
  fondoPerfil: SafeStyle = 'url(assets/fondo-elegido.png)'; // Fondo por defecto

  constructor(private router: Router, private sanitizer: DomSanitizer) {}

  // Método para navegar a la lista de pacientes
  navigateToPatients() {
    this.router.navigate(['/patients']);
  }

  // Método para navegar a las citas
  navigateToAppointments() {
    this.router.navigate(['/citas']);
  }

  // Método para navegar a los informes de progreso
  navigateToReports() {
    this.router.navigate(['/reports']);
  }

  // Método para navegar a los recursos y materiales
  navigateToResources() {
    this.router.navigate(['/resources']);
  }

  // Método para cambiar el fondo del perfil según la imagen seleccionada
  onBackgroundUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fondoPerfil = this.sanitizer.bypassSecurityTrustStyle(`url(${reader.result})`);
      };
      reader.readAsDataURL(input.files[0]); // Convertir la imagen en base64
    }
  }
}
