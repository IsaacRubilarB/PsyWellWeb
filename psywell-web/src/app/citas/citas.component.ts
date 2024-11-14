import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CitasService } from '../services/citasService';
import { NavbarComponent } from 'app/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { UsersService } from '../services/userService';


export interface Cita {
nombrePaciente: any;
nombrePsicologo: any;
  idCita: number;
  idPaciente: number;
  idPsicologo: number | null;
  ubicacion: string;
  estado: string;
  fecha: string;   // Fecha en formato YYYY-MM-DD
  horaInicio: string;  // Hora en formato HH:mm:ss
  horaFin: string;  // Hora en formato HH:mm:ss
  comentarios: string;
}

export interface ListaCitasResponse {
  status: string;
  data: Cita[];
}

@Component({
  selector: 'app-citas',
  standalone: true,
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.scss'],
  imports: [NavbarComponent, CommonModule, ReactiveFormsModule]
})
export class CitasComponent implements OnInit {
  citas: Cita[] = [];
  psicologos: any[] = []; // Lista de psicólogos
  pacientes: any[] = []; // Lista de pacientes
  mostrarModal = false;
  citaForm: FormGroup;
  errorMessage: string | null = null;
  userId: string | null = null;
nombrePaciente: any;


  constructor(private citasService: CitasService, private fb: FormBuilder, private userService: UsersService) {
    this.citaForm = this.fb.group({
      idUsuario: [, Validators.required],
      fechaHora: ['', Validators.required],
      estado: ['Pendiente', Validators.required],
      ubicacion: ['', Validators.required],
      comentarios: ['']
    });
  }

  ngOnInit() {
    console.log('CitasComponent inicializado');
    this.obtenerUsuarios();  // Primero obtenemos los usuarios
    this.obtenerCitas(); // Luego obtenemos las citas
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.resetNuevaCita();
  }

  obtenerCitas() {
    this.citasService.listarCitas().subscribe({
      next: (response) => {
        if (response && response.status === 'success' && Array.isArray(response.data)) {
          console.log('Citas obtenidas:', response.data);
          this.citas = response.data.map((cita: any) => {
            return {
              idCita: cita.idCita,
              idPaciente: cita.idPaciente,
              idPsicologo: cita.idPsicologo || null,
              ubicacion: cita.ubicacion,
              estado: cita.estado,
              fecha: cita.fecha,
              horaInicio: cita.horaInicio,
              horaFin: cita.horaFin,
              comentarios: cita.comentarios,
              nombrePaciente: this.getNombreUsuario(cita.idPaciente), // Reemplazamos ID por el nombre
              nombrePsicologo: this.getNombreUsuario(cita.idPsicologo) // Reemplazamos ID por el nombre
            };
          });
        } else {
          console.error('La respuesta no es válida:', response);
        }
      },
      error: (error) => {
        console.error('Error al listar citas', error);
        this.errorMessage = 'No se pudo cargar las citas. Intenta de nuevo más tarde.';
      }
    });
  }

  getNombreUsuario(id: number): string {
    // Verifica que los datos de psicólogos y pacientes estén cargados
    console.log('Psicologos:', this.psicologos, 'Pacientes:', this.pacientes);
    const usuario = this.psicologos.find(p => p.idUsuario === id) || this.pacientes.find(p => p.idUsuario === id);
    return usuario ? usuario.nombre : 'Desconocido';
  }
  
  
  obtenerUsuarios() {
    this.userService.listarUsuarios().subscribe(
      (response: any) => {
        if (response && response.data) {
          console.log('Usuarios cargados:', response);  // Agregar log para verificar los datos recibidos
          this.psicologos = response.data.filter((userId: { perfil: string; }) => userId.perfil === 'psicologo');
          this.pacientes = response.data.filter((userId: { perfil: string; }) => userId.perfil === 'paciente');
        } else {
          console.error('No se encontraron usuarios');
        }
      },
      (error) => {
        console.error('Error al obtener usuarios', error);
      }
    );
  }
  
  


  guardarCita() {
    if (this.citaForm.valid) {
      const nuevaCita: Cita = this.citaForm.value;
      this.citasService.registrarCita(nuevaCita).subscribe({
        next: (response: Cita) => {
          console.log('Cita registrada con éxito', response);
          this.cerrarModal();
          this.obtenerCitas(); // Actualiza la lista de citas
        },
        error: (error: any) => {
          console.error('Error al registrar la cita', error);
          this.errorMessage = 'Ocurrió un error al intentar registrar la cita. Por favor, inténtalo de nuevo.';
        }
      });
    }
  }

  private resetNuevaCita() {
    this.citaForm.reset({
      idUsuario: '',
      fechaHora: '',
      estado: 'Pendiente',
      ubicacion: '',
      comentarios: ''
    });
  }
}
