import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { UsersService } from 'app/services/userService';

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
  progress: number;
}

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './patients-list.component.html',
  styleUrls: ['./patients-list.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PatientsListComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes() {
    this.usersService.listarUsuarios().subscribe(
      (data: any[]) => {
        this.patients = data.map(user => ({
          id: user.id || '',
          name: user.name || 'Desconocido',
          age: user.age || 0,
          diagnosis: user.diagnosis || 'Sin diagnóstico',
          emotionalStatus: user.emotionalStatus || 'Sin estado',
          photo: user.photo || './assets/profiles/default.png',
          lastSession: user.lastSession || 'N/A',
          nextAppointment: user.nextAppointment || 'N/A',
          riskLevel: user.riskLevel || 'Sin riesgo',
          progress: user.progress || 0
        }));
        this.filteredPatients = [...this.patients];
      },
      (error: any) => {
        console.error('Error al cargar pacientes:', error);
      }
    );
  }

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
