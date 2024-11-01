import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

declare var gapi: any;
declare var google: any;

@Injectable({
  providedIn: 'root',
})
export class GoogleCalendarService {
  private CLIENT_ID = environment.googleConfig.clientId;
  private API_KEY = environment.googleConfig.apiKey;
  private DISCOVERY_DOCS = environment.googleConfig.discoveryDocs;
  private SCOPES = environment.googleConfig.scopes;
  private tokenClient: any;
  private accessToken: string | null = null;
  private isAuthenticated = false;

  constructor() {}

  async initClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadGapiScript().then(() => {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: this.CLIENT_ID,
          scope: this.SCOPES,
          callback: (response: any) => {
            if (response.error) {
              reject(`Error en la respuesta de autenticación: ${response.error}`);
            } else {
              this.accessToken = response.access_token;
              this.isAuthenticated = true;
              resolve();
            }
          },
          prompt: 'consent',
        });

        gapi.load('client', () => {
          gapi.client.init({
            apiKey: this.API_KEY,
            discoveryDocs: this.DISCOVERY_DOCS,
          }).then(() => resolve());
        });
      }).catch((error) => reject('Error al cargar gapi. Verifique la conexión o el script en index.html.'));
    });
  }

  private loadGapiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof gapi !== 'undefined') {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject('Error al cargar el script de gapi.');
      document.body.appendChild(script);
    });
  }

  // Método para verificar si el usuario está autenticado
  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  // Método para iniciar sesión en Google
  signIn(): Observable<void> {
    return new Observable((observer) => {
      if (!this.tokenClient) {
        observer.error('El cliente de token no está inicializado. Asegúrate de llamar a initClient() primero.');
        return;
      }

      this.tokenClient.requestAccessToken();
      this.tokenClient.callback = (response: any) => {
        if (response.error) {
          this.isAuthenticated = false;
          observer.error(`Error al iniciar sesión: ${response.error}`);
        } else {
          this.accessToken = response.access_token;
          this.isAuthenticated = true;
          observer.next();
          observer.complete();
        }
      };
    });
  }

  // Método para cerrar sesión
  signOut(): void {
    if (this.accessToken) {
      google.accounts.oauth2.revoke(this.accessToken, () => {
        this.isAuthenticated = false;
        this.accessToken = null;
      });
    }
  }

  // Método para obtener la lista de calendarios
  getCalendars(): Observable<any> {
    return new Observable((observer) => {
      if (!this.isAuthenticated || !this.accessToken) {
        observer.error('Usuario no autenticado. Por favor, inicie sesión primero.');
        return;
      }

      gapi.client.calendar.calendarList
        .list()
        .then((response: any) => {
          observer.next(response.result.items);
          observer.complete();
        })
        .catch((error: any) => observer.error(`Error al obtener la lista de calendarios: ${error.message || JSON.stringify(error)}`));
    });
  }

  // Método para obtener eventos del calendario
  getEvents(calendarId: string = 'primary', maxResults: number = 10, pageToken: string = ''): Observable<any> {
    return new Observable((observer) => {
      if (!this.isAuthenticated || !this.accessToken) {
        observer.error('Usuario no autenticado. Por favor, inicie sesión primero.');
        return;
      }

      gapi.client.calendar.events
        .list({
          calendarId: calendarId,
          timeMin: new Date().toISOString(),
          showDeleted: false,
          singleEvents: true,
          maxResults: maxResults,
          orderBy: 'startTime',
          pageToken: pageToken,
        })
        .then((response: any) => {
          observer.next(response.result);
          observer.complete();
        })
        .catch((error: any) => observer.error(`Error al obtener eventos del calendario: ${error.message || error.details}`));
    });
  }

  // Método para crear un evento
  createEvent(calendarId: string, event: any): Observable<any> {
    return new Observable((observer) => {
      if (!this.isAuthenticated || !this.accessToken) {
        observer.error('Usuario no autenticado. Por favor, inicie sesión primero.');
        return;
      }

      gapi.client.calendar.events.insert({
        calendarId: calendarId,
        resource: event,
      }).then((response: any) => {
        observer.next(response.result);
        observer.complete();
      }).catch((error: any) => observer.error(`Error al crear el evento: ${error.message || error.details}`));
    });
  }

  // Método para actualizar un evento
  updateEvent(calendarId: string, eventId: string, event: any): Observable<any> {
    return new Observable((observer) => {
      if (!this.isAuthenticated || !this.accessToken) {
        observer.error('Usuario no autenticado. Por favor, inicie sesión primero.');
        return;
      }

      gapi.client.calendar.events.update({
        calendarId: calendarId,
        eventId: eventId,
        resource: event,
      }).then((response: any) => {
        observer.next(response.result);
        observer.complete();
      }).catch((error: any) => observer.error(`Error al actualizar el evento: ${error.message || error.details}`));
    });
  }

  // Método para eliminar un evento
  deleteEvent(calendarId: string, eventId: string): Observable<any> {
    return new Observable((observer) => {
      if (!this.isAuthenticated || !this.accessToken) {
        observer.error('Usuario no autenticado. Por favor, inicie sesión primero.');
        return;
      }

      gapi.client.calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId,
      }).then((response: any) => {
        observer.next(response.result);
        observer.complete();
      }).catch((error: any) => observer.error(`Error al eliminar el evento: ${error.message || error.details}`));
    });
  }
}
