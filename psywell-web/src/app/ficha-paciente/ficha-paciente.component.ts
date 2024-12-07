import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from 'app/services/userService';
import { FichaService, FichaInput } from '../services/ficha.service'; // Ruta ajustada

@Component({
  selector: 'app-ficha-paciente',
  templateUrl: './ficha-paciente.component.html',
  styleUrls: ['./ficha-paciente.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class FichaPacienteComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter<void>(); // Asegúrate de declarar este evento

  @Input() patientId!: number; // ID del paciente
  @Input() psychologistId!: number | null; 

  paciente: FichaInput = {
    nombres: '',
    fechaNacimiento: null,
    genero: '',
    correo: '',
    telefono: '',
    telefonoEmercia: '',
    direccion: '',
    estadoCivil: '', // Inicialización del nuevo campo
    notasSesionAnterior: '',
    medicamentos: '',
    diagnostico: '',
  };
  

  formattedFechaNacimiento: string | null = null;
  progressPercentage = 0;
  showSuccessMessage = false;
  isConfirmingClose = false;
  showRequiredError = false;

  telefonoValido: boolean = true; // Controla la validez del teléfono
  telefonoBlurred: boolean = false; // Controla si el campo perdió el foco

  constructor(
    private fichaService: FichaService,
    private usersService: UsersService,
    
  ) {}

  ngOnInit() {
    if (this.patientId) {
      this.cargarDatosPaciente(this.patientId); // Cargar datos iniciales del paciente
    }
  }

  obtenerIDs(): void {
    const emailPsicologo = localStorage.getItem('emailPsicologo'); // Correo del psicólogo logueado

    if (!emailPsicologo || !this.patientId) {
      console.error('Faltan datos: correo del psicólogo o ID del paciente.');
      return;
    }

    this.usersService.obtenerUsuarioPorCorreo(emailPsicologo).subscribe(
      (response) => {
        const idPsicologo = parseInt(response.id_usuario, 10); // Asegura que sea un número
        this.registrarFicha(idPsicologo, this.patientId);
      },
      (error) => {
        console.error('Error al obtener el ID del psicólogo:', error);
      }
    );
  }

  registrarFicha(idPsicologo: number, idPaciente: number): void {
    const ficha: FichaInput = {
      idPsicologo,
      idPaciente,
      nombres: this.paciente.nombres,
      fechaNacimiento: this.paciente.fechaNacimiento,
      genero: this.paciente.genero,
      correo: this.paciente.correo,
      telefono: this.paciente.telefono,
      telefonoEmercia: this.paciente.telefonoEmercia,
      direccion: this.paciente.direccion,
      notasSesionAnterior: this.paciente.notasSesionAnterior,
      medicamentos: this.paciente.medicamentos,
      diagnostico: this.paciente.diagnostico,
    };

    this.fichaService.registrarFicha(ficha).subscribe(
      (response) => {
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
          this.performCloseModal();
        }, 2000);
      },
      (error) => {
        console.error('Error al registrar la ficha:', error);
      }
    );
  }

  cargarDatosPaciente(id: number) {
    this.usersService.obtenerUsuarioPorId(id.toString()).subscribe(
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
            estadoCivil: data.estadoCivil || '', // Asignación del nuevo campo
            notasSesionAnterior: data.notasSesionAnterior || '',
            medicamentos: data.medicamentos || '',
            diagnostico: data.diagnostico || 'Sin diagnóstico',
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
  

  validarTelefono(telefono: string): boolean {
    const regex = /^[0-9+()\- ]{9,15}$/;
    return regex.test(telefono);
  }

  validarTelefonoEnBlur(): void {
    this.telefonoBlurred = true;
    this.telefonoValido = this.validarTelefono(this.paciente.telefono);
  }

  formatearFechaNacimiento(fecha: string | null): string | null {
    if (!fecha) return null;

    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return 'Fecha inválida';

      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      const año = date.getFullYear();

      return `${dia}/${mes}/${año}`;
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  updateProgress() {
    const fieldsFilled = Object.values(this.paciente).filter((value) => value).length;
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
      !!this.paciente.direccion &&
      !!this.paciente.diagnostico
    );
  }

  onSubmit(): void {
    if (!this.psychologistId || !this.patientId) {
      console.error('No se puede registrar la ficha. Faltan IDs obligatorios.');
      alert('Error: No se puede registrar la ficha sin los IDs del psicólogo y del paciente.');
      return;
    }
  
    const fichaPayload: FichaInput = {
      ...this.paciente,
      idPsicologo: this.psychologistId,
      idPaciente: this.patientId,
      estadoCivil: this.paciente.estadoCivil, // Enviar el nuevo campo
    };
  
    this.fichaService.registrarFicha(fichaPayload).subscribe(
      (response) => {
        console.log('Ficha registrada con éxito:', response);
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
          this.closeModal();
        }, 2000);
      },
      (error) => {
        console.error('Error al registrar la ficha:', error);
        alert('Error al registrar la ficha. Por favor, intente nuevamente.');
      }
    );
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

  hasUnsavedData(): boolean {
    return Object.values(this.paciente).some((value) => value !== '' && value !== null);
  }
}
