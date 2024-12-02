import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita, ListaCitasResponse } from '../models/cita.model';
import { map } from 'rxjs/operators';
import { catchError, of } from 'rxjs';
import { environment } from 'environments/environments';



@Injectable({
  providedIn: 'root',
})
export class CitasService {
  private registroCitaUrl = environment.apiCalendario+'registrarCita';
  private listarCitaUrl = environment.apiCalendario+'listarCitas';
  private actualizarCitaUrl = environment.apiCalendario+'actualizarCita';
  private eliminarCitaUrl = environment.apiCalendario+'eliminarCita';
  private baseUrl = environment.apiRegistroEmocional+'listarRegistro'; 

  constructor(private http: HttpClient) {}

  registrarCita(citaData: Cita): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.registroCitaUrl, citaData, { headers });
  }

  listarCitas(): Observable<ListaCitasResponse> {
    return this.http.get<ListaCitasResponse>(this.listarCitaUrl);
  }

  // Nuevo método para listar citas por psicólogo
  listarCitasPorPsicologo(idPsicologo: number): Observable<ListaCitasResponse> {
    const url = `${this.listarCitaUrl}?idPsicologo=${idPsicologo}`;
    return this.http.get<ListaCitasResponse>(url);
  }

  actualizarCita(citaData: Cita): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(`${this.actualizarCitaUrl}/${citaData.idCita}`, citaData, { headers });
  }

  eliminarCita(idCita: number): Observable<any> {
    return this.http.delete<any>(`${this.eliminarCitaUrl}/${idCita}`);
  }

  obtenerRegistrosPorPaciente(idUsuario: number): Observable<any> {
    // Calcula la fecha de hace 7 días
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 7);
    const fechaDesde = fechaLimite.toISOString(); // Convierte la fecha a ISO 8601
  
    const url = environment.apiRegistroEmocional+`listarRegistroPorUsuario/${idUsuario}?fechaDesde=${fechaDesde}`;
    return this.http.get<any>(url).pipe(
      map((response: any) => {
        if (response?.data) {
          return response.data; // Retorna solo los registros filtrados
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error al obtener registros:', error);
        return of([]); // Devuelve un array vacío en caso de error
      })
    );
  }

  
}
