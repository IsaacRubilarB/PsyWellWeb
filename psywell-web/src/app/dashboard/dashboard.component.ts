import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,  // Declaración de standalone
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent {
  psicologoName: string = 'Cristina Zapata'; // Nombre del psicólogo
  especialidad: string = 'Psicóloga Especialista en Salud Mental';
  aniosExperiencia: number = 10; // Años de experiencia

  // Recordatorios ficticios
  recordatorios = [
    { tarea: 'Revisar progreso de Juan Pérez', fechaLimite: '05/10/2024' },
    { tarea: 'Enviar informe mensual de María González', fechaLimite: '10/10/2024' },
  ];

  // Estadísticas ficticias
  sesionesHoy: number = 3;
  sesionesSemana: number = 15;
  pacientesActivos: number = 10;

  constructor(private router: Router) {}

  // Método para navegar a la lista de pacientes
  navigateToPatients() {
    this.router.navigate(['/patients']);
  }

  // Método para navegar a las citas
  navigateToAppointments() {
    this.router.navigate(['/appointments']);
  }

  // Método para navegar a los informes de progreso
  navigateToReports() {
    this.router.navigate(['/progress-reports']);
  }

  // Método para navegar a los recursos y materiales
  navigateToResources() {
    this.router.navigate(['/resources']);
  }
}
