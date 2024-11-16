import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CitasService } from '../services/citasService';
import { NavbarComponent } from 'app/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { UsersService } from '../services/userService';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { DomSanitizer } from '@angular/platform-browser';
import interact from 'interactjs';

export interface Cita {
  nombrePaciente: string;
  nombrePsicologo: string;
  idCita: number;
  idPaciente: number;
  idPsicologo: number | null;
  ubicacion: string;
  estado: string;
  fecha: string;   
  horaInicio: string;  
  horaFin: string;  
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
  psicologos: any[] = [];
  pacientes: any[] = [];
  mostrarModal = false;
  citaForm: FormGroup;
  errorMessage: string | null = null;
  userId: string | null = null;
  userName: string = '';
  especialidad: string = 'Psicóloga Especialista en Salud Mental';
  aniosExperiencia: number = 10;
  genero: string = 'masculino';

  constructor(
    private citasService: CitasService,
    private fb: FormBuilder, 
    private usersService: UsersService,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private el: ElementRef,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
  ) {
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
    this.obtenerUsuarios();  
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.cargarPsicologo(user.email || '');
      }
    });
    setTimeout(() => {
      this.initializeDrag();
    });
  }

  initializeDrag() {
    interact('.sticky-note-item')
      .draggable({
        listeners: {
          move: (event) => {
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          }
        }
      });
  }

  cargarPsicologo(email: string) {
    this.usersService.listarUsuarios().subscribe(
      (response: any) => {
        const user = response.data.find((user: any) => user.email === email);
        if (user) {
          this.userId = user.idUsuario;
          this.userName = user.nombre;
          console.log('Usuario logueado:', user);
          this.obtenerCitas();
        } else {
          console.error('No se encontró el usuario con ese UID');
        }
      },
      (error) => {
        console.error('Error al listar los usuarios:', error);
      }
    );
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

          this.citas = response.data
            .filter((cita: any) => cita.idPaciente === this.userId || cita.idPsicologo === this.userId)
            .map((cita: any) => {
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
                nombrePaciente: this.getNombreUsuario(cita.idPaciente),
                nombrePsicologo: this.getNombreUsuario(cita.idPsicologo)
              };
            });

          console.log('Citas filtradas:', this.citas);
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
    const usuario = this.psicologos.find(p => p.idUsuario === id) || this.pacientes.find(p => p.idUsuario === id);
    return usuario ? usuario.nombre : 'Desconocido';
  }

  obtenerUsuarios() {
    this.usersService.listarUsuarios().subscribe(
      (response: any) => {
        if (response && response.data) {
          console.log('Usuarios cargados:', response);
          this.psicologos = response.data.filter((user: { perfil: string }) => user.perfil === 'psicologo');
          this.pacientes = response.data.filter((user: { perfil: string }) => user.perfil === 'paciente');
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
          this.obtenerCitas();
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
