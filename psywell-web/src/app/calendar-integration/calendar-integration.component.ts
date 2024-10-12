import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleCalendarService } from '../services/google-calendar.service';

@Component({
  selector: 'app-calendar-integration',
  standalone: true,
  templateUrl: './calendar-integration.component.html',
  styleUrls: ['./calendar-integration.component.scss'],
  providers: [GoogleCalendarService],
  imports: [NgIf, NgFor, FormsModule, DatePipe],
})
export class CalendarIntegrationComponent implements OnInit {
  eventSummary: string = '';
  eventDescription: string = '';
  eventLocation: string = '';
  eventStart: string = '';
  eventEnd: string = '';
  eventAttendees: string = '';
  statusMessage: string = '';
  listaEventos: any[] = [];
  listaCalendarios: any[] = [];
  selectedCalendarId: string = 'primary';
  isLogin: boolean = false;
  editMode: boolean = false; // Nuevo: bandera para editar eventos
  editEventId: string | null = null; // ID del evento a editar
  nextPageToken: string | null = null; // Token para la siguiente página de eventos
  prevPageToken: string | null = null; // Token para la página anterior de eventos

  constructor(private googleCalendarService: GoogleCalendarService) {}

  ngOnInit(): void {
    this.googleCalendarService
      .initClient()
      .then(() => {
        this.statusMessage = 'Cliente de Google Calendar inicializado correctamente.';
      })
      .catch((error: any) => {
        this.statusMessage = `Error al inicializar Google Calendar: ${error}`;
      });
  }

  signIn(): void {
    this.statusMessage = 'Iniciando sesión en Google...';

    if (!this.googleCalendarService.isUserAuthenticated()) {
      this.googleCalendarService.signIn().subscribe(
        () => {
          this.isLogin = true;
          this.statusMessage = 'Sesión iniciada correctamente.';
          this.getCalendars();
        },
        (error: any) => {
          this.statusMessage = `Error al iniciar sesión: ${error}`;
        }
      );
    } else {
      this.statusMessage = 'Ya estás autenticado.';
    }
  }

  signOut(): void {
    this.googleCalendarService.signOut();
    this.isLogin = false;
    this.statusMessage = 'Sesión cerrada correctamente.';
    this.listaEventos = [];
    this.listaCalendarios = [];
    this.editMode = false;
  }

  getCalendars(): void {
    this.googleCalendarService.getCalendars().subscribe(
      (calendars: any) => {
        this.listaCalendarios = calendars;
        this.selectedCalendarId = calendars.length > 0 ? calendars[0].id : 'primary';
        if (this.selectedCalendarId) {
          this.getEvents();
        }
      },
      (error: any) => {
        this.statusMessage = `Error al obtener calendarios: ${error}`;
      }
    );
  }

  getEvents(pageToken: string = ''): void {
    if (!this.isLogin || !this.selectedCalendarId) {
      this.statusMessage = 'Debes iniciar sesión y seleccionar un calendario primero.';
      return;
    }

    this.googleCalendarService.getEvents(this.selectedCalendarId, 5, pageToken).subscribe(
      (response: any) => {
        this.listaEventos = response.items;
        this.nextPageToken = response.nextPageToken || null;
        this.prevPageToken = response.prevPageToken || null;
        this.statusMessage = `Eventos obtenidos del calendario: ${this.selectedCalendarId}`;
      },
      (error: any) => {
        this.statusMessage = `Error al obtener eventos: ${error}`;
      }
    );
  }

  createEvent(): void {
    if (!this.isLogin || !this.selectedCalendarId) {
      this.statusMessage = 'Debes iniciar sesión y seleccionar un calendario primero.';
      return;
    }

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
      attendees: this.eventAttendees
        ? this.eventAttendees.split(',').map((email: string) => ({ email: email.trim() }))
        : [],
    };

    if (this.editMode && this.editEventId) {
      // Editar evento existente
      this.googleCalendarService.updateEvent(this.selectedCalendarId, this.editEventId, event).subscribe(
        () => {
          this.statusMessage = 'Evento actualizado con éxito';
          this.getEvents();
          this.clearForm();
          this.editMode = false;
          this.editEventId = null;
        },
        (error: any) => {
          this.statusMessage = `Error al actualizar el evento: ${error}`;
        }
      );
    } else {
      // Crear nuevo evento
      this.googleCalendarService.createEvent(this.selectedCalendarId, event).subscribe(
        () => {
          this.statusMessage = 'Evento creado con éxito';
          this.getEvents();
          this.clearForm();
        },
        (error: any) => {
          this.statusMessage = `Error al crear el evento: ${error}`;
        }
      );
    }
  }

  editEvent(event: any): void {
    this.eventSummary = event.summary;
    this.eventDescription = event.description;
    this.eventLocation = event.location;
    this.eventStart = new Date(event.start.dateTime).toISOString().slice(0, 16); // Formato para datetime-local
    this.eventEnd = new Date(event.end.dateTime).toISOString().slice(0, 16);
    this.eventAttendees = event.attendees ? event.attendees.map((attendee: any) => attendee.email).join(', ') : '';
    this.editMode = true;
    this.editEventId = event.id;
    this.statusMessage = 'Modo de edición activado. Realiza los cambios y guarda.';
  }

  deleteEvent(eventId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      this.googleCalendarService.deleteEvent(this.selectedCalendarId, eventId).subscribe(
        () => {
          this.statusMessage = 'Evento eliminado correctamente';
          this.getEvents();
        },
        (error: any) => {
          this.statusMessage = `Error al eliminar el evento: ${error}`;
        }
      );
    }
  }

  clearForm(): void {
    this.eventSummary = '';
    this.eventDescription = '';
    this.eventLocation = '';
    this.eventStart = '';
    this.eventEnd = '';
    this.eventAttendees = '';
    this.editMode = false;
    this.editEventId = null;
  }

  getNextPage(): void {
    if (this.nextPageToken) {
      this.getEvents(this.nextPageToken);
    }
  }

  getPreviousPage(): void {
    if (this.prevPageToken) {
      this.getEvents(this.prevPageToken);
    }
  }
}
