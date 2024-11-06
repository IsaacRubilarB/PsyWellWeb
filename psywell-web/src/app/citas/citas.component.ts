import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CitasService } from '../services/citasService';
import { NavbarComponent } from 'app/navbar/navbar.component';
import { CommonModule } from '@angular/common';

export interface Cita {
  idCita: number;       
  idUsuario: number;     
  fechaHora: Date;       
  estado: string;
  ubicacion: string;
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
  mostrarModal = false; 
  citaForm: FormGroup;
  errorMessage: string | null = null;

  constructor(private citasService: CitasService, private fb: FormBuilder) {
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
    this.obtenerCitas(); 
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
        // Asegúrate de que la respuesta tiene el formato esperado
        if (response && response.status === 'success' && Array.isArray(response.data)) {
          console.log('Citas obtenidas:', response.data);
          this.citas = response.data; // Aquí asignamos el array de citas
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
      idUsuario: '',               // Asigna un valor por defecto si es necesario
      fechaHora: '',               // Deja el campo en blanco o asigna un valor predeterminado
      estado: 'Pendiente',         // Estado predeterminado en "Pendiente"
      ubicacion: '',               // Asigna valor por defecto si es necesario
      comentarios: ''              // Puede estar vacío
    });
  }
  
}
