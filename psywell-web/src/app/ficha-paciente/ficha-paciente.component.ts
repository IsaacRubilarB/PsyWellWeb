import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from 'app/services/userService';

interface Paciente {
  nombres: string;
  fechaNacimiento: string | null; // Cambiado a string para el formato de fecha
  genero: string;
  correo: string;
  telefono: string;
  telefonoEmercia: string;
  direccion: string;
  notasSesionAnterior: string;
  medicamentos: string;
}

@Component({
  selector: 'app-ficha-paciente',
  templateUrl: './ficha-paciente.component.html',
  styleUrls: ['./ficha-paciente.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class FichaPacienteComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter<void>();
  @Input() patientId!: string; // Recibe el ID del paciente desde el componente padre

  paciente: Paciente = {
    nombres: '',
    fechaNacimiento: null,
    genero: '',
    correo: '',
    telefono: '',
    telefonoEmercia: '',
    direccion: '',
    notasSesionAnterior: '',
    medicamentos: ''
  };

  formattedFechaNacimiento: string | null = null;
  progressPercentage = 0;
  showSuccessMessage = false;
  isConfirmingClose = false;
  showRequiredError = false;

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    if (this.patientId) {
      this.cargarDatosPaciente(this.patientId);
    }
  }

  cargarDatosPaciente(id: string) {
    this.usersService.obtenerUsuarioPorId(id).subscribe(
      (response: any) => {
        const data = response.data;
        if (data) {
          this.paciente = {
            nombres: data.nombre || '',
            fechaNacimiento: data.fechaNacimiento || null,
            genero: data.genero || '',
            correo: data.email || '',
            telefono: data.telefono || '',
            telefonoEmercia: data.telefonoEmercia || '',
            direccion: data.direccion || '',
            notasSesionAnterior: '',
            medicamentos: ''
          };
          this.formattedFechaNacimiento = this.formatearFechaNacimiento(this.paciente.fechaNacimiento);
          this.updateProgress();
        }
      },
      (error) => {
        console.error('Error al obtener datos del paciente:', error);
      }
    );
  }

  formatearFechaNacimiento(fecha: string | null): string | null {
    if (!fecha) return null;

    const [dia, mes, año] = fecha.split('/');
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const mesNombre = meses[parseInt(mes, 10) - 1];
    return `${dia} de ${mesNombre} de ${año}`;
  }

  updateProgress() {
    const fieldsFilled = Object.values(this.paciente).filter(value => value).length;
    const totalFields = Object.keys(this.paciente).length;
    this.progressPercentage = Math.round((fieldsFilled / totalFields) * 100);
  }

  isFormComplete(): boolean {
    return (
      !!this.paciente.nombres &&
      !!this.paciente.fechaNacimiento &&
      !!this.paciente.genero &&
      !!this.paciente.correo &&
      !!this.paciente.telefono &&
      !!this.paciente.telefonoEmercia &&
      !!this.paciente.direccion
    );
  }

  onSubmit() {
    this.showRequiredError = true;

    if (!this.isFormComplete()) {
      return;
    }

    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
      this.performCloseModal();
    }, 2000);
  }

  hasUnsavedData(): boolean {
    return Object.values(this.paciente).some(value => value !== '' && value !== null);
  }

  closeModal() {
    if (this.hasUnsavedData()) {
      this.isConfirmingClose = true;
    } else {
      this.performCloseModal();
    }
  }

  confirmClose() {
    this.isConfirmingClose = false;
    this.performCloseModal();
  }

  cancelClose() {
    this.isConfirmingClose = false;
  }

  private performCloseModal() {
    this.closeModalEvent.emit(); 
  }
}
