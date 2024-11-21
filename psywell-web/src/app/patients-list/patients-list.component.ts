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
  correo?: string; // Aseguramos que el campo 'correo' esté disponible
  email?: string;  // En caso de que el campo sea 'email'
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
  email: string;
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
  selectedPatient: Patient | null = null; // Paciente seleccionado
  isModalOpen: boolean = false; // Estado del modal

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  // Lógica para cargar pacientes
  cargarPacientes() {
    this.usersService.listarUsuarios().subscribe(
      (response: any) => {
        // Agregamos un log para ver la respuesta completa
        console.log('Respuesta del servicio:', response);

        const usuarios = Array.isArray(response.data) ? response.data : [];
        this.patients = usuarios
          .filter((user: User) => user.perfil === 'paciente')
          .map((user: User): Patient => {
            // Obtenemos el correo electrónico del usuario
            const email = user.correo || user.email || '';
            if (!email) {
              console.warn(`El usuario ${user.nombre} no tiene correo electrónico.`);
            }

            // Generamos la URL de la foto
            const photoUrl = email ? this.getFirebaseImageUrl(email, 'profile') : './assets/profiles/default.png';

            // Agregamos logs para depuración
            console.log(`Usuario: ${user.nombre}`);
            console.log(`Email original: ${email}`);
            console.log(`Foto URL generada: ${photoUrl}`);

            return {
              id: user.idUsuario.toString(),
              name: user.nombre,
              age: this.calculateAge(user.fechaNacimiento),
              diagnosis: user.diagnosis || 'Sin diagnóstico',
              emotionalStatus: user.emotionalStatus || 'Sin estado',
              photo: photoUrl,
              lastSession: this.formatDate(user.lastSession),
              nextAppointment: this.formatDate(user.nextAppointment),
              riskLevel: user.riskLevel || 'Sin riesgo',
              progress: user.progress || 0,
              email: email
            };
          });
        this.filteredPatients = [...this.patients];
      },
      (error: any) => {
        console.error('Error al cargar pacientes:', error);
      }
    );
  }

  // Método para obtener el URL de la imagen desde Firebase Storage
  private getFirebaseImageUrl(email: string, tipo: 'profile' | 'banner'): string {
    const sanitizedEmail = email.replace(/@/g, '_').replace(/\./g, '_');
    const folder = tipo === 'profile' ? 'fotoPerfil' : 'fotoPortada';

    // Actualizamos el dominio a 'firebasestorage.app' en lugar de 'appspot.com'
    const url = `https://firebasestorage.googleapis.com/v0/b/psywell-ab0ee.firebasestorage.app/o/${folder}%2F${encodeURIComponent(sanitizedEmail)}?alt=media`;

    // Agregamos logs para depuración
    console.log(`Email sanitizado: ${sanitizedEmail}`);
    console.log(`URL de la imagen generada: ${url}`);

    return url;
  }

  // Método para calcular la edad
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

  // Método para formatear fechas
  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'No disponible';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'No disponible' : date.toLocaleDateString();
  }

  // Método para abrir el modal
  openMessageModal(patient: Patient) {
    this.selectedPatient = patient; // Guardamos el paciente seleccionado
    this.isModalOpen = true; // Abre el modal
  }

  // Método para cerrar el modal
  closeModal() {
    this.selectedPatient = null;
    this.isModalOpen = false; // Cierra el modal
  }

  // Otros métodos de lógica
  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredPatients = this.patients.filter(patient =>
      patient.name.toLowerCase().includes(query)
    );
  }


  filterByDiagnosis(event: any) {
    const diagnosis = event.target.value;
    this.filteredPatients = diagnosis === 'todos'
      ? [...this.patients]
      : this.filteredPatients.filter(patient => patient.diagnosis.toLowerCase() === diagnosis.toLowerCase());
  }

  // Método para programar cita
  scheduleAppointment(patient: Patient) {
    console.log(`Programar cita para ${patient.name}`);
  }
}
