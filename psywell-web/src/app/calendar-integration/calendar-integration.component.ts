import { Component } from '@angular/core';

@Component({
  selector: 'app-calendar-integration',
  templateUrl: './calendar-integration.component.html',
  styleUrls: ['./calendar-integration.component.scss'],
})
export class CalendarIntegrationComponent {
  eventSummary: string = '';
  eventDescription: string = '';
  eventLocation: string = '';
  eventStart: string = '';
  eventEnd: string = '';
  eventAttendees: string = '';
  statusMessage: string = '';
  listaEventos: any[] = [];
  isLogin: boolean = false;

  createEvent() {
    console.log('Evento creado con los siguientes datos:');
    console.log(`Resumen: ${this.eventSummary}`);
    console.log(`Descripción: ${this.eventDescription}`);
    console.log(`Ubicación: ${this.eventLocation}`);
    console.log(`Inicio: ${this.eventStart}`);
    console.log(`Fin: ${this.eventEnd}`);
    console.log(`Asistentes: ${this.eventAttendees}`);
  }

  signIn() {
    console.log('Iniciar sesión con Google');
  }

  signOut() {
    console.log('Cerrar sesión con Google');
  }
}
