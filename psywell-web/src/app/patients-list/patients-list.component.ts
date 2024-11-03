import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  emotionalStatus: string;
  photo: string;
  lastSession: string;
  nextAppointment: string;
  riskLevel: string;
  progress: number; // Porcentaje de progreso en el tratamiento
}

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './patients-list.component.html',
  styleUrls: ['./patients-list.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PatientsListComponent {
  patients: Patient[] = [
    {
      id: '1',
      name: 'Cristina Zapata',
      age: 25,
      diagnosis: 'Depresión',
      emotionalStatus: 'Estable',
      photo: './assets/profiles/ana.png',
      lastSession: '2024-10-28',
      nextAppointment: '2024-11-05',
      riskLevel: 'Bajo',
      progress: 70
    },
    {
      id: '2',
      name: 'Juan Pérez',
      age: 30,
      diagnosis: 'Ansiedad',
      emotionalStatus: 'Moderado',
      photo: './assets/profiles/juan.png',
      lastSession: '2024-10-25',
      nextAppointment: '2024-11-10',
      riskLevel: 'Moderado',
      progress: 40
    },
    {
      id: '3',
      name: 'Cristopher Soto',
      age: 23,
      diagnosis: 'Depresión Severa',
      emotionalStatus: 'Severo',
      photo: './assets/profiles/carlos.png',
      lastSession: '2024-10-20',
      nextAppointment: '2024-11-15',
      riskLevel: 'Alto',
      progress: 20
    }
  ];
  
  filteredPatients: Patient[] = [...this.patients];

  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredPatients = this.patients.filter(patient =>
      patient.name.toLowerCase().includes(query)
    );
  }

  getStatusClass(riskLevel: string): string {
    switch (riskLevel.toLowerCase()) {
      case 'bajo':
        return 'low';
      case 'moderado':
        return 'moderate';
      case 'alto':
        return 'high';
      default:
        return '';
    }
  }

  filterByRisk(event: any) {
    const riskLevel = event.target.value;
    this.filteredPatients = riskLevel === 'todos'
      ? [...this.patients]
      : this.patients.filter(patient => patient.riskLevel.toLowerCase() === riskLevel);
  }

  filterByDiagnosis(event: any) {
    const diagnosis = event.target.value;
    this.filteredPatients = diagnosis === 'todos'
      ? [...this.patients]
      : this.patients.filter(patient => patient.diagnosis.toLowerCase() === diagnosis.toLowerCase());
  }

  scheduleAppointment(patient: Patient) {
    console.log(`Programar cita para ${patient.name}`);
  }

  sendMessage(patient: Patient) {
    console.log(`Enviar mensaje a ${patient.name}`);
  }
}
