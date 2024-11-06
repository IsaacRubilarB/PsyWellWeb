import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Paciente {
  nombres: string;
  apellidos: string;
  fechaNacimiento: Date | null;
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
export class FichaPacienteComponent {
  @Output() closeModalEvent = new EventEmitter<void>();

  paciente: Paciente = {
    nombres: '',
    apellidos: '',
    fechaNacimiento: null,
    genero: '',
    correo: '',
    telefono: '',
    telefonoEmercia: '',
    direccion: '',
    notasSesionAnterior: '',
    medicamentos: ''
  };

  progressPercentage = 0;
  showSuccessMessage = false;
  isConfirmingClose = false;
  showRequiredError = false;

  updateProgress() {
    const fieldsFilled = Object.values(this.paciente).filter(value => value).length;
    const totalFields = Object.keys(this.paciente).length;
    this.progressPercentage = Math.round((fieldsFilled / totalFields) * 100);
  }

  isFormComplete(): boolean {
    return (
      !!this.paciente.nombres &&
      !!this.paciente.apellidos &&
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
