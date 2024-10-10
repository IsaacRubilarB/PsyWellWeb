import { Component } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importar módulos comunes necesarios
import { FormsModule } from '@angular/forms';  // Importar FormsModule para usar [(ngModel)]

@Component({
  selector: 'app-dashboard',
  standalone: true,  // Marcar como componente standalone
  imports: [CommonModule, FormsModule], // Importar CommonModule y FormsModule para usar directivas comunes como *ngIf, *ngFor y [(ngModel)]
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  psicologoName: string = 'Cristina Zapata'; // Nombre del psicólogo
  especialidad: string = 'Psicóloga Especialista en Salud Mental';
  aniosExperiencia: number = 10; // Años de experiencia

  // Imagen de fondo personalizada
  fondoPerfil: SafeStyle = 'url(assets/fondo-elegido.png)'; // Fondo por defecto

  // Lista de notificaciones dinámicas
  notificaciones: { mensaje: string; icono: string; dismissed: boolean }[] = [
    { mensaje: 'Nuevo mensaje de Juan Pérez', icono: 'icon-bell', dismissed: false },
    { mensaje: 'Cita con María González en 30 minutos', icono: 'icon-alert', dismissed: false },
  ];

  // Lista de notas rápidas (sticky notes)
  stickyNotes: { titulo: string; contenido: string }[] = [
    { titulo: 'Nota Rápida 1', contenido: 'Recordar preguntar sobre sueño a Manuel Fernández.' },
    { titulo: 'Nota Rápida 2', contenido: 'Preparar informe de progreso para Sofía Martínez.' }
  ];

  newNoteTitle: string = ''; // Título de la nueva nota
  newNoteContent: string = ''; // Contenido de la nueva nota

  constructor(private router: Router, private sanitizer: DomSanitizer) {
    this.initNotificationTimeout(); // Iniciar temporizador de notificaciones
  }

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

  // Método para desaparecer las notificaciones después de 10 segundos
  initNotificationTimeout() {
    this.notificaciones.forEach((notification, index) => {
      setTimeout(() => {
        this.notificaciones[index].dismissed = true; // Desaparece después de 10 segundos
      }, 10000); // 10 segundos = 10000ms
    });
  }

  // Verificar si todas las notificaciones han sido descartadas
  allNotificationsDismissed(): boolean {
    return this.notificaciones.every(notification => notification.dismissed);
  }

  // Añadir una nueva nota rápida (sticky note)
  addStickyNote() {
    if (this.newNoteTitle && this.newNoteContent) {
      this.stickyNotes.push({ titulo: this.newNoteTitle, contenido: this.newNoteContent });
      this.newNoteTitle = ''; // Limpiar el título después de añadir
      this.newNoteContent = ''; // Limpiar el contenido después de añadir
    }
  }

  // Eliminar una nota rápida (sticky note)
  removeStickyNote(index: number) {
    this.stickyNotes.splice(index, 1);
  }
}
