import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

declare var gapi: any;

@Injectable({
  providedIn: 'root',
})
export class GoogleCalendarService {
  private CLIENT_ID = '546817145485-9gut154rg11ernn0qnd116c7nob1rpna.apps.googleusercontent.com';
  private API_KEY = 'AIzaSyB1hBpjUs98RCOi9ErZZfz0Ra8WEwyAGes';
  private DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
  private SCOPES = 'https://www.googleapis.com/auth/calendar.events';
  private isAuthenticated = false;
  private authInstance: any;

  constructor() {}

  async initClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      gapi.load('client:auth2', () => {
        gapi.client
          .init({
            apiKey: this.API_KEY,
            clientId: this.CLIENT_ID,
            discoveryDocs: this.DISCOVERY_DOCS,
            scope: this.SCOPES,
          })
          .then(
            () => {
              this.isAuthenticated = true;
              this.authInstance = gapi.auth2.getAuthInstance();
              resolve();
            },
            (error: any) => {
              console.error('Error al inicializar el cliente de Google API:', error);
              reject(error);
            }
          );
      });
    });
  }

  // Método para iniciar sesión en Google
  signIn(): Observable<void> {
    return new Observable((observer) => {
      this.authInstance.signIn().then(
        (user: any) => {
          this.isAuthenticated = true;
          observer.next(user);
          observer.complete();
        },
        (error: any) => {
          this.isAuthenticated = false;
          observer.error(error);
        }
      );
    });
  }

  // Método para cerrar sesión
  signOut(): void {
    if (this.authInstance) {
      this.authInstance.signOut().then(() => {
        this.isAuthenticated = false;
        console.log('Usuario ha cerrado sesión correctamente.');
      });
    }
  }

  // Método para obtener eventos del calendario
  getEvents(): Observable<any> {
    return new Observable((observer) => {
      if (!this.isAuthenticated) {
        observer.error('Usuario no autenticado. Por favor, inicie sesión primero.');
        return;
      }

      gapi.client.calendar.events
        .list({
          calendarId: 'primary',
          timeMin: new Date().toISOString(),
          showDeleted: false,
          singleEvents: true,
          maxResults: 10,
          orderBy: 'startTime',
        })
        .then((response: any) => {
          observer.next(response.result.items);
          observer.complete();
        })
        .catch((error: any) => {
          observer.error('Error al obtener eventos del calendario: ' + error);
        });
    });
  }
}
