import { Injectable } from '@angular/core';
import { environment } from 'environments/environments';

@Injectable({
  providedIn: 'root', // Este servicio estará disponible en toda la aplicación
})
export class GoogleMapsLoaderService {
  private scriptLoaded = false; // Para evitar cargar el script varias veces

  constructor() {}

  loadApi(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Si el script ya fue cargado, resuelve inmediatamente
      if (this.scriptLoaded) {
        resolve();
        return;
      }

      // Crear el script para cargar Google Maps
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleApiKey}&libraries=places`;
      script.async = true; // Carga de forma asíncrona
      script.defer = true; // Carga después del HTML

      // Manejar eventos de carga y error
      script.onload = () => {
        this.scriptLoaded = true; // Marcar como cargado
        resolve(); // Resuelve la promesa
      };

      script.onerror = (error) => {
        reject(error); // Rechaza la promesa en caso de error
      };

      // Agregar el script al documento
      document.body.appendChild(script);
    });
  }
}
