import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  imports: [FormsModule]  // Importar FormsModule para utilizar ngModel
})
export class FichaPacienteComponent {
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

  updateProgress() {
    const fieldsFilled = Object.values(this.paciente).filter(value => value).length;
    const totalFields = Object.keys(this.paciente).length;
    this.progressPercentage = Math.round((fieldsFilled / totalFields) * 100);
  }

  onSubmit() {
    console.log('Ficha guardada:', this.paciente);
  }

  closeModal() {
    // Aquí puedes agregar lógica para cerrar el modal
  }
}