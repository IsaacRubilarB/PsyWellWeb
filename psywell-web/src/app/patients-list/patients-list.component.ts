import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { UsersService } from 'app/services/userService';

interface User {
  idUsuario: number;
  nombre: string;
  fechaNacimiento: string;
  perfil: string;
  diagnosis?: string;
  emotionalStatus?: string;
  photo?: string;
  lastSession?: string;
  nextAppointment?: string;
  riskLevel?: string;
  progress?: number;
}

interface Patient {
  id: string;
  name: string;
  age: number | string;
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

  calculateAge(fechaNacimiento: string): number | string {
    if (!fechaNacimiento) return 'Edad desconocida';
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? 'Edad desconocida' : age;
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'No disponible';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'No disponible' : date.toLocaleDateString();
  }

  cargarPacientes() {
    this.usersService.listarUsuarios().subscribe(
      (response: any) => {
        const usuarios = Array.isArray(response.data) ? response.data : [];
        this.patients = usuarios
          .filter((user: User) => user.perfil === 'paciente')
          .map((user: User): Patient => ({
            id: user.idUsuario.toString(),
            name: user.nombre,
            age: this.calculateAge(user.fechaNacimiento),
            diagnosis: user.diagnosis || 'Sin diagnóstico',
            emotionalStatus: user.emotionalStatus || 'Sin estado',
            photo: user.photo || './assets/profiles/default.png',
            lastSession: this.formatDate(user.lastSession),
            nextAppointment: this.formatDate(user.nextAppointment),
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
      : this.filteredPatients.filter(patient => patient.riskLevel.toLowerCase() === riskLevel);
  }

  filterByDiagnosis(event: any) {
    const diagnosis = event.target.value;
    this.filteredPatients = diagnosis === 'todos'
      ? [...this.patients]
      : this.filteredPatients.filter(patient => patient.diagnosis.toLowerCase() === diagnosis.toLowerCase());
  }

  sendMessage(patient: Patient) {
    console.log(`Enviar mensaje a ${patient.name}`);
  }

  scheduleAppointment(patient: Patient) {
    console.log(`Programar cita para ${patient.name}`);
  }
}
