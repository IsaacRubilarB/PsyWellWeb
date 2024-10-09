import { Component } from '@angular/core';

@Component({
  selector: 'app-citas',
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.scss'],
  standalone: true
})
export class CitasComponent {
  citas = [
    { paciente: 'Juan Pérez', hora: '10:00 AM', motivo: 'Consulta de seguimiento' },
    { paciente: 'María González', hora: '11:30 AM', motivo: 'Primera consulta' },
    { paciente: 'Carlos López', hora: '2:00 PM', motivo: 'Evaluación psicológica' }
  ];
}
