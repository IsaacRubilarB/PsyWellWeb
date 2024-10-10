import { Component } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';  // Importamos las directivas comunes y DatePipe
import { FormsModule } from '@angular/forms'; // Para manejar los formularios

@Component({
  selector: 'app-calendar-integration',
  standalone: true, 
  templateUrl: './calendar-integration.component.html',
  styleUrls: ['./calendar-integration.component.scss'],
  imports: [NgIf, NgFor, FormsModule, DatePipe] 
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

  signIn() {
    this.statusMessage = "Iniciar sesión en Google (simulado)";
    this.isLogin = true;
  }

  signOut() {
    this.statusMessage = "Cerrar sesión en Google (simulado)";
    this.isLogin = false;
  }

  createEvent() {
    const event = {
      summary: this.eventSummary,
      description: this.eventDescription,
      location: this.eventLocation,
      start: {
        dateTime: new Date(this.eventStart).toISOString(),
      },
      end: {
        dateTime: new Date(this.eventEnd).toISOString(),
      },
      attendees: this.eventAttendees.split(',').map(email => ({ email: email.trim() })),
      htmlLink: 'https://calendar.google.com/', 
    };

    this.listaEventos.push(event);
    this.statusMessage = 'Evento creado con éxito';
    this.clearForm();
  }

  clearForm() {
    this.eventSummary = '';
    this.eventDescription = '';
    this.eventLocation = '';
    this.eventStart = '';
    this.eventEnd = '';
    this.eventAttendees = '';
  }
}
